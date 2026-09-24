import io
import os
import pytest
from app.rag import pipeline as pipeline_mod
from app.rag import generation as generation_mod
from app.rag import verification as verification_mod
from app.rag.retrieval import RetrievedChunk
from app.vision import ocr as ocr_mod
from app.vision import hmi as hmi_mod


def _fake_chunk(machine_id, page, section, error_codes, text):
    return RetrievedChunk(
        id=f"fake-{page}", manualId=f"man-{machine_id}", machineId=machine_id,
        section=section, page=page, text=text, errorCodes=error_codes,
        relevance=90, matchedKeywords=error_codes,
    )


# ---------------- Machines / Manuals ----------------

def test_health(client):
    r = client.get("/api/health")
    assert r.status_code == 200


def test_list_machines(client):
    r = client.get("/api/machines")
    assert r.status_code == 200
    data = r.json()
    ids = {m["id"] for m in data}
    assert {"hp-200x", "mx-40", "ac-90", "pk-12"}.issubset(ids)
    for m in data:
        assert "iconColor" in m and "tabColor" in m


def test_list_manuals(client):
    r = client.get("/api/manuals")
    assert r.status_code == 200
    data = r.json()
    titles = {m["title"] for m in data}
    assert "HP-200 Service Manual" in titles
    assert "MX-40 CNC Operation & Maintenance Manual" in titles


def test_manual_upload(client):
    # reuse a bundled sample PDF as the upload payload
    sample_path = os.path.join(os.path.dirname(__file__), "..", "data", "manuals", "ac90_manual.pdf")
    with open(sample_path, "rb") as f:
        r = client.post("/api/manuals/upload", files={"file": ("AC90_Extra.pdf", f, "application/pdf")})
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "Indexed"
    assert data["pages"] > 0
    assert data["machineId"] == "ac-90"  # auto-detected from manual content


# ---------------- Troubleshoot: successful grounded answer ----------------

def test_troubleshoot_success(client, monkeypatch):
    fake_chunks = [_fake_chunk(
        "hp-200x", 214, "SECTION 8.3 - HYDRAULIC DIAGNOSTIC & ALARM MATRIX", ["E101"],
        "SECTION 8.3 - HYDRAULIC DIAGNOSTIC & ALARM MATRIX\nALARM CODE E101: Hydraulic Pressure "
        "Sensor Fault on Primary Manifold Block A. Replace transducer PX-102 if loop is open.",
    )]
    monkeypatch.setattr(pipeline_mod, "hybrid_retrieve", lambda *a, **k: fake_chunks)
    monkeypatch.setattr(pipeline_mod, "generate_answer", lambda *a, **k: {
        "errorMeaning": "Hydraulic pressure sensor fault on Manifold Block A.",
        "probableCauses": ["Transducer PX-102 connector damaged."],
        "correctiveActions": [{"step": 1, "title": "Inspect PX-102", "description": "Check connector.",
                                "safetyCritical": False}],
        "safetyWarning": "De-energize before servicing.",
        "groundingNote": "Based on Section 8.3.",
    })
    monkeypatch.setattr(pipeline_mod, "verify_answer", lambda candidate, chunks: {
        "claims": [{"text": "x", "verdict": "supported"}, {"text": "y", "verdict": "supported"}],
        "supportedCount": 2, "totalCount": 2,
    })

    r = client.post("/api/troubleshoot", json={"query": "E101", "machineId": "hp-200x", "language": "en"})
    assert r.status_code == 200
    data = r.json()
    assert data["type"] == "STRUCTURED_ANSWER"
    assert data["answer"]["verificationState"] in ("VERIFIED", "PARTIALLY_VERIFIED")
    assert data["answer"]["sources"][0]["page"] == 214
    assert data["answer"]["machineMatch"] == "Exact"


# ---------------- Troubleshoot: cross-manual ambiguity ----------------

def test_troubleshoot_ambiguous_error_code(client):
    r = client.post("/api/troubleshoot", json={"query": "E101", "machineId": None, "language": "en"})
    assert r.status_code == 200
    data = r.json()
    assert data["type"] == "AMBIGUITY"
    machine_ids = {opt["machineId"] for opt in data["ambiguity"]["options"]}
    assert "hp-200x" in machine_ids
    assert "mx-40" in machine_ids


# ---------------- Troubleshoot: insufficient information ----------------

def test_troubleshoot_insufficient_info(client, monkeypatch):
    monkeypatch.setattr(pipeline_mod, "hybrid_retrieve", lambda *a, **k: [])
    r = client.post("/api/troubleshoot", json={
        "query": "Why is my machine making a strange high-pitched noise?",
        "machineId": "hp-200x", "language": "en",
    })
    assert r.status_code == 200
    data = r.json()
    assert data["type"] == "INSUFFICIENT_INFO"
    assert "recommendation" in data["insufficient"]


# ---------------- OCR ----------------

def test_ocr_success(client, monkeypatch):
    monkeypatch.setattr(ocr_mod, "analyze_page", lambda manual_id, page: {
        "pageNumber": page, "confidence": 95.0,
        "detectedEntities": {"errorCodes": ["E101"], "sections": ["SECTION 8.3"],
                              "warnings": [], "procedures": [], "tables": []},
        "rawText": "SECTION 8.3 ...", "structuredBlocks": [{"type": "heading", "content": "SECTION 8.3"}],
    })
    import app.main as main_mod
    monkeypatch.setattr(main_mod, "analyze_page", ocr_mod.analyze_page)
    r = client.post("/api/ocr", json={"manualId": "man-hp-1", "pageNumber": 214})
    assert r.status_code == 200
    assert r.json()["pageNumber"] == 214


def test_ocr_fallback_on_failure(client, monkeypatch):
    def boom(*a, **k):
        raise RuntimeError("GEMINI_API_KEY not configured")
    import app.main as main_mod
    monkeypatch.setattr(main_mod, "analyze_page", boom)
    r = client.post("/api/ocr", json={"manualId": "man-hp-1", "pageNumber": 214})
    assert r.status_code == 200
    assert r.json()["pageNumber"] == 214
    assert "E101" in r.json()["detectedEntities"]["errorCodes"]


# ---------------- Screenshot ----------------

def test_screenshot_analysis(client, monkeypatch):
    import app.main as main_mod
    monkeypatch.setattr(main_mod, "analyze_screenshot", lambda img: {
        "machineDetected": "Hydraulic Press HP-200X", "screenName": "HMI", "detectedError": "E101",
        "detectedAlarm": "CRITICAL", "values": {"pressure": "0.0 bar", "temperature": "76 C",
                                                 "machineState": "HALTED", "cycleTime": "00:00:00"},
        "interpretation": "Pressure loop fault.", "confidence": 90.0, "boxes": [],
    })
    tiny_png_b64 = (
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
    )
    r = client.post("/api/screenshot", json={"imageBase64": tiny_png_b64})
    assert r.status_code == 200
    assert r.json()["detectedError"] == "E101"
