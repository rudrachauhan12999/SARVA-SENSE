"""
Renders a manual page to an image with PyMuPDF and sends it to Gemini Vision
for structured OCR/entity extraction, matching the OCRPageAnalysis TS type
exactly. Results are cached in SQLite keyed by (manualId, page) so repeated
requests for the same page don't re-call the vision API.
"""
import hashlib
import json
from .. import db
from ..config import GEMINI_API_KEY, GEMINI_MODEL

OCR_PROMPT = """You are analyzing one page of an industrial equipment service manual.
Extract information and return ONLY a JSON object, no markdown fences, matching exactly:
{
  "confidence": number (0-100, your OCR/extraction confidence for this page),
  "detectedEntities": {
    "errorCodes": [string, ...],      // alarm/error codes like "E101" found on this page
    "sections": [string, ...],        // section headings found on this page
    "warnings": [string, ...],        // safety warning text found on this page
    "procedures": [string, ...],      // named procedures/steps found on this page
    "tables": [string, ...]           // short description of any tables found on this page
  },
  "rawText": string,                  // best-effort transcription of the page text
  "structuredBlocks": [
    {"type": "heading"|"paragraph"|"warning"|"table"|"procedure", "content": string}, ...
  ]
}
Only report entities that are actually visible on the page image. Do not invent content.
Return every field even if empty (use "" for missing strings, [] for missing lists, 0 for unknown confidence).
"""


def _s(v, default=""):
    return v if isinstance(v, str) else (default if v is None else str(v))


def _list_str(v):
    return [_s(x) for x in v] if isinstance(v, list) else []


def _n(v, default=0):
    try:
        return float(v)
    except (TypeError, ValueError):
        return default


def normalize_ocr_result(raw: dict, page_number: int) -> dict:
    """Coerce arbitrary Gemini JSON into the exact OCRPageAnalysis shape so a
    slightly-imperfect Gemini response can't crash FastAPI's response_model
    validation after we've already succeeded at calling the API."""
    raw = raw if isinstance(raw, dict) else {}
    entities = raw.get("detectedEntities") if isinstance(raw.get("detectedEntities"), dict) else {}
    blocks_in = raw.get("structuredBlocks") if isinstance(raw.get("structuredBlocks"), list) else []

    blocks = []
    for b in blocks_in:
        if not isinstance(b, dict):
            continue
        block_type = b.get("type") if b.get("type") in ("heading", "paragraph", "warning", "table", "procedure") else "paragraph"
        blocks.append({"type": block_type, "content": _s(b.get("content"))})

    return {
        "pageNumber": page_number,
        "confidence": max(0.0, min(100.0, _n(raw.get("confidence"), 50.0))),
        "detectedEntities": {
            "errorCodes": _list_str(entities.get("errorCodes")),
            "sections": _list_str(entities.get("sections")),
            "warnings": _list_str(entities.get("warnings")),
            "procedures": _list_str(entities.get("procedures")),
            "tables": _list_str(entities.get("tables")),
        },
        "rawText": _s(raw.get("rawText")),
        "structuredBlocks": blocks,
    }


def render_page_image(pdf_path: str, page_number: int) -> bytes:
    """page_number is 1-indexed."""
    import fitz  # PyMuPDF
    doc = fitz.open(pdf_path)
    page = doc[page_number - 1]
    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x zoom for OCR quality
    png_bytes = pix.tobytes("png")
    doc.close()
    return png_bytes


def _cache_key(manual_id: str, page_number: int) -> str:
    return hashlib.sha1(f"{manual_id}:{page_number}".encode()).hexdigest()


def analyze_page(manual_id: str, page_number: int) -> dict:
    cache_key = _cache_key(manual_id, page_number)
    cached = db.get_ocr_cache(cache_key)
    if cached:
        return cached

    manual = db.get_manual(manual_id)
    if not manual:
        raise ValueError(f"Unknown manual: {manual_id}")

    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY not configured")

    import google.generativeai as genai
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel(GEMINI_MODEL)

    image_bytes = render_page_image(manual["filepath"], page_number)
    response = model.generate_content([
        OCR_PROMPT,
        {"mime_type": "image/png", "data": image_bytes},
    ])

    try:
        raw = json.loads(_strip_fences(response.text))
    except Exception as e:
        raise RuntimeError(f"Gemini returned non-JSON output: {response.text[:300]!r}") from e

    result = normalize_ocr_result(raw, page_number)
    db.set_ocr_cache(cache_key, manual_id, page_number, result)
    return result


def ocr_fallback_text(pdf_path: str, page_number: int, manual_id: str = None) -> str:
    """Best-effort OCR transcription used by the RAG ingestion pipeline
    (see rag/chunking.py) for pages whose native PDF text layer is empty or
    near-empty -- i.e. scanned/image-only manual pages that would otherwise
    contribute zero chunks to the index.

    When manual_id is known this reuses analyze_page()'s cached, structured
    result (same SQLite ocr_cache table) so a page OCR'd during ingestion
    isn't re-billed if the OCR Page Analysis UI later requests that page.
    Returns "" on any failure (missing API key, network error, bad JSON) so
    ingestion degrades to "keep whatever native text there was" instead of
    crashing.
    """
    if not GEMINI_API_KEY:
        return ""
    if manual_id:
        try:
            return analyze_page(manual_id, page_number).get("rawText", "")
        except Exception as e:
            print(f"[ocr] fallback analyze_page failed for {manual_id} p{page_number}: {e}")
            return ""
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel(GEMINI_MODEL)
        image_bytes = render_page_image(pdf_path, page_number)
        response = model.generate_content([
            "Transcribe all visible text on this industrial equipment manual page verbatim, "
            "preserving reading order and line breaks. Return plain text only, no commentary, "
            "no markdown fences.",
            {"mime_type": "image/png", "data": image_bytes},
        ])
        return (response.text or "").strip()
    except Exception as e:
        print(f"[ocr] fallback transcription failed for page {page_number}: {e}")
        return ""


def _strip_fences(text: str) -> str:
    t = text.strip()
    if t.startswith("```"):
        t = t.strip("`")
        if t.lower().startswith("json"):
            t = t[4:]
    return t.strip()
