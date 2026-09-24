"""
Section-aware chunking for OEM manuals.

Strategy
--------
1. Extract text per page, keeping a (page_number, line) stream (PyMuPDF is the
   primary extractor per the project spec; pdfplumber is used as an automatic
   fallback if PyMuPDF/fitz isn't installed, so the pipeline still runs). Any
   page whose native text layer comes back near-empty (a scanned/photographed
   page with no embedded text) is re-extracted via Gemini Vision OCR instead
   (see vision/ocr.ocr_fallback_text) so scanned manuals still get indexed.
2. Walk the line stream and treat lines that look like manual headings
   ("SECTION 8.3 - ...", "4.2 Transducers ...", ALL-CAPS short lines) as
   section boundaries. Each section keeps the page number of its FIRST line
   (this is what gets cited).
3. Within a section, if the body is long, split further into ~220-word
   sub-chunks (with the heading repeated in each so a chunk is self-contained)
   so we never index "one giant blob of text" per manual as the assignment
   explicitly warns against.
4. Extract OEM-style alarm/error codes (e.g. E101, E044, F220) per chunk via
   regex so retrieval can do exact keyword/error-code matching in addition to
   vector similarity (see retrieval.py).
5. Filler/reference pages that carry no real diagnostic content are dropped
   (word count below MIN_CHUNK_WORDS) so the vector index stays precise
   instead of being diluted with boilerplate ("precision over recall").
"""
import re
from dataclasses import dataclass, field
from typing import List, Optional, Tuple
from ..config import MIN_CHUNK_WORDS, OCR_FALLBACK_ENABLED, OCR_MIN_WORDS_PER_PAGE

HEADING_RE = re.compile(
    r"^(SECTION\s+\d+(\.\d+)?\b.*|CHAPTER\s+\d+\b.*|\d+(-\d+)?(\.\d+)+\s+[A-Z][A-Za-z0-9 &/,\-\(\)]{3,90}$)"
)
ALLCAPS_HEADING_RE = re.compile(r"^[A-Z0-9][A-Z0-9 &\-/\.,\(\)]{6,90}$")
ERROR_CODE_RE = re.compile(r"\b(?:CODE\s+)?([EF]\d{2,4})\b")

CHUNK_TARGET_WORDS = 220
CHUNK_OVERLAP_WORDS = 40


@dataclass
class RawSection:
    heading: str
    start_page: int
    lines: List[Tuple[int, str]] = field(default_factory=list)  # (page, line)


@dataclass
class Chunk:
    section: str
    page: int
    text: str
    error_codes: List[str]


def _is_heading(line: str) -> bool:
    line = line.strip()
    if not line or len(line) > 100:
        return False
    if HEADING_RE.match(line):
        return True
    if ALLCAPS_HEADING_RE.match(line) and line.upper() == line and any(c.isalpha() for c in line):
        return True
    return False


def extract_pages_text(pdf_path: str, manual_id: Optional[str] = None) -> List[Tuple[int, str]]:
    """Returns list of (page_number [1-indexed], full page text).

    Pages whose native text layer has fewer than OCR_MIN_WORDS_PER_PAGE words
    (scanned/image-only pages -- no embedded text layer for PyMuPDF/pdfplumber
    to extract) are re-extracted via Gemini Vision OCR (see
    vision/ocr.ocr_fallback_text) so scanned manuals still get indexed instead
    of silently contributing zero chunks."""
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(pdf_path)
        pages = [(i + 1, doc[i].get_text("text")) for i in range(len(doc))]
        doc.close()
    except ImportError:
        # Fallback so the pipeline still runs in environments without PyMuPDF.
        import pdfplumber
        pages = []
        with pdfplumber.open(pdf_path) as pdf:
            for i, page in enumerate(pdf.pages):
                pages.append((i + 1, page.extract_text() or ""))

    if OCR_FALLBACK_ENABLED:
        pages = [_apply_ocr_fallback(pdf_path, manual_id, page_num, text) for page_num, text in pages]

    return pages


def _apply_ocr_fallback(pdf_path: str, manual_id: Optional[str], page_num: int, text: str) -> Tuple[int, str]:
    if len(text.split()) >= OCR_MIN_WORDS_PER_PAGE:
        return page_num, text
    try:
        from ..vision.ocr import ocr_fallback_text
        ocr_text = ocr_fallback_text(pdf_path, page_num, manual_id=manual_id)
    except Exception as e:
        print(f"[chunking] OCR fallback unavailable for page {page_num}: {e}")
        return page_num, text
    if ocr_text and len(ocr_text.split()) > len(text.split()):
        return page_num, ocr_text
    return page_num, text


def build_sections(pages: List[Tuple[int, str]]) -> List[RawSection]:
    sections: List[RawSection] = []
    current = None
    for page_num, page_text in pages:
        for raw_line in page_text.splitlines():
            line = raw_line.strip()
            if not line:
                continue
            if _is_heading(line):
                if current is not None and current.lines:
                    sections.append(current)
                current = RawSection(heading=line, start_page=page_num)
            else:
                if current is None:
                    current = RawSection(heading="Introduction", start_page=page_num)
                current.lines.append((page_num, line))
    if current is not None and current.lines:
        sections.append(current)
    return sections


def _split_words_with_pages(lines: List[Tuple[int, str]]) -> List[Tuple[int, str]]:
    """Flatten (page, line) into (page, word) pairs so we can chunk by word
    count while still knowing which page a given word came from."""
    out = []
    for page, line in lines:
        for w in line.split():
            out.append((page, w))
    return out


def section_to_chunks(section: RawSection, manual_title: str) -> List[Chunk]:
    words = _split_words_with_pages(section.lines)
    if len(words) < MIN_CHUNK_WORDS:
        return []  # filler / boilerplate page, skip indexing

    chunks = []
    step = CHUNK_TARGET_WORDS - CHUNK_OVERLAP_WORDS
    i = 0
    if len(words) <= CHUNK_TARGET_WORDS:
        ranges = [(0, len(words))]
    else:
        ranges = []
        while i < len(words):
            ranges.append((i, min(i + CHUNK_TARGET_WORDS, len(words))))
            i += step

    for start, end in ranges:
        sub = words[start:end]
        if len(sub) < MIN_CHUNK_WORDS:
            continue
        page = sub[0][0]
        text = f"{section.heading}\n" + " ".join(w for _, w in sub)
        codes = sorted(set(ERROR_CODE_RE.findall(text.upper())))
        chunks.append(Chunk(section=section.heading, page=page, text=text, error_codes=codes))
    return chunks


def chunk_pdf(pdf_path: str, manual_title: str, manual_id: Optional[str] = None) -> List[Chunk]:
    pages = extract_pages_text(pdf_path, manual_id=manual_id)
    sections = build_sections(pages)
    all_chunks: List[Chunk] = []
    for sec in sections:
        all_chunks.extend(section_to_chunks(sec, manual_title))
    return all_chunks
