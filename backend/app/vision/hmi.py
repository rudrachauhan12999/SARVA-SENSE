"""
Sends an uploaded HMI (Human-Machine Interface) screenshot to Gemini Vision
and returns structured JSON matching HMIScreenshotAnalysis exactly, with
bounding boxes in PERCENTAGE coordinates (top/left/width/height as "NN%")
since that's what the frontend overlay expects.

Gemini's raw JSON is defensively normalized before being returned: free-form
LLM output can omit a field, use a slightly different type, or add mime-type
mismatches, and previously that meant FastAPI's strict response_model
validation would 500 *after* a perfectly good Gemini call succeeded (the
error never reached our try/except in main.py because the crash happened
during response serialization, not inside analyze_screenshot()). Coercing to
the exact schema here means a slightly-imperfect Gemini response degrades
gracefully instead of surfacing as "Error analyzing screenshot" in the UI.
"""
import base64
import hashlib
import json
import re
from .. import db
from ..config import GEMINI_API_KEY, GEMINI_MODEL

HMI_PROMPT = """You are analyzing a photo/screenshot of an industrial machine's HMI (Human-Machine
Interface) control panel screen. Return ONLY a JSON object, no markdown fences, matching exactly:
{
  "machineDetected": string,      // best guess at machine name/type visible on screen, or "Unknown"
  "screenName": string,           // name of the HMI screen if visible
  "detectedError": string,        // error/alarm code visible, or "" if none
  "detectedAlarm": string,        // alarm banner text visible, or "" if none
  "values": {
    "pressure": string, "temperature": string, "machineState": string, "cycleTime": string
  },
  "interpretation": string,       // 1-2 sentence plain-language interpretation of what's shown
  "confidence": number,           // 0-100
  "boxes": [
    {"id": string, "label": string, "type": "error"|"alarm"|"value"|"status",
     "top": "NN%", "left": "NN%", "width": "NN%", "height": "NN%",
     "color": "#RRGGBB", "detectedText": string}, ...
  ]
}
All top/left/width/height values MUST be percentage strings (e.g. "18%") relative to the image
dimensions, locating each detected UI element's bounding box. Only report what is actually visible.
Return every field even if empty (use "" for missing strings, [] for missing lists, 0 for unknown confidence).
"""


def _strip_fences(text: str) -> str:
    t = text.strip()
    if t.startswith("```"):
        t = t.strip("`")
        if t.lower().startswith("json"):
            t = t[4:]
    return t.strip()


def _decode_image(image_base64: str):
    """Returns (bytes, mime_type). Accepts raw base64 or a data: URL and
    preserves the real mime type (Gemini is picky about jpeg vs png)."""
    m = re.match(r"^data:(image/\w+);base64,(.*)$", image_base64, re.DOTALL)
    if m:
        mime_type, payload = m.group(1), m.group(2)
    else:
        mime_type, payload = "image/png", image_base64
    return base64.b64decode(payload), mime_type


def _s(v, default=""):
    return v if isinstance(v, str) else (default if v is None else str(v))


def _n(v, default=0):
    try:
        return float(v)
    except (TypeError, ValueError):
        return default


def _pct(v, default="0%"):
    s = _s(v, default)
    return s if s.endswith("%") else (f"{s}%" if s and s.replace(".", "", 1).isdigit() else default)


def normalize_hmi_result(raw: dict) -> dict:
    """Coerce arbitrary Gemini JSON into the exact HMIScreenshotAnalysis shape."""
    raw = raw if isinstance(raw, dict) else {}
    values = raw.get("values") if isinstance(raw.get("values"), dict) else {}
    boxes_in = raw.get("boxes") if isinstance(raw.get("boxes"), list) else []

    boxes = []
    for i, b in enumerate(boxes_in):
        if not isinstance(b, dict):
            continue
        box_type = b.get("type") if b.get("type") in ("error", "alarm", "value", "status") else "value"
        boxes.append({
            "id": _s(b.get("id"), f"box-{i}"),
            "label": _s(b.get("label")),
            "type": box_type,
            "top": _pct(b.get("top")),
            "left": _pct(b.get("left")),
            "width": _pct(b.get("width"), "10%"),
            "height": _pct(b.get("height"), "10%"),
            "color": _s(b.get("color"), "#EF4444"),
            "detectedText": _s(b.get("detectedText")),
        })

    return {
        "machineDetected": _s(raw.get("machineDetected"), "Unknown"),
        "screenName": _s(raw.get("screenName")),
        "detectedError": _s(raw.get("detectedError")),
        "detectedAlarm": _s(raw.get("detectedAlarm")),
        "values": {
            "pressure": _s(values.get("pressure")),
            "temperature": _s(values.get("temperature")),
            "machineState": _s(values.get("machineState")),
            "cycleTime": _s(values.get("cycleTime")) or None,
        },
        "interpretation": _s(raw.get("interpretation")),
        "confidence": max(0.0, min(100.0, _n(raw.get("confidence"), 50.0))),
        "boxes": boxes,
    }


def analyze_screenshot(image_base64: str) -> dict:
    cache_key = hashlib.sha1(image_base64.encode()).hexdigest()
    cached = db.get_hmi_cache(cache_key)
    if cached:
        return cached

    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY not configured")

    import google.generativeai as genai
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel(GEMINI_MODEL)

    image_bytes, mime_type = _decode_image(image_base64)
    response = model.generate_content([
        HMI_PROMPT,
        {"mime_type": mime_type, "data": image_bytes},
    ])

    try:
        raw = json.loads(_strip_fences(response.text))
    except Exception as e:
        raise RuntimeError(f"Gemini returned non-JSON output: {response.text[:300]!r}") from e

    result = normalize_hmi_result(raw)
    db.set_hmi_cache(cache_key, result)
    return result
