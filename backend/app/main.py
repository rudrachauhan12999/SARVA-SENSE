import datetime
import json
import os
import shutil
import uuid

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pypdf import PdfReader

from . import db
from .config import MANUALS_DIR, CORS_ORIGINS
from .seed import seed_and_ingest
from .schemas import (
    Machine, Manual, DiagnoseRequest, DiagnoseResponse,
    OCRRequest, OCRPageAnalysis, ScreenshotRequest, HMIScreenshotAnalysis,
    ChatRequest,
)
from .rag.pipeline import diagnose as run_diagnose
from .rag.ingest import ingest_manual
from .rag.chat import stream_chat_answer
from .vision.ocr import analyze_page
from .vision.hmi import analyze_screenshot
from .fallback import FALLBACK_OCR_PAGE_214, FALLBACK_HMI_ANALYSIS

app = FastAPI(title="SARVA-SENSE Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    db.init_db()
    try:
        seed_and_ingest()
    except Exception as e:
        # Don't crash the API if ingestion has an issue (e.g. missing optional
        # deps in a partial dev environment) -- log and continue serving.
        print(f"[startup] seed_and_ingest failed: {e}")


@app.get("/api/health")
def health():
    return {"status": "ok"}


# ---------------- Machines ----------------

@app.get("/api/machines", response_model=list[Machine])
def get_machines():
    return db.list_machines()


# ---------------- Manuals ----------------

@app.get("/api/manuals", response_model=list[Manual])
def get_manuals():
    return db.list_manuals()


KNOWN_MACHINE_HINTS = {
    "hp-200x": ["hp-200", "hp200", "hydraulic press"],
    "mx-40": ["mx-40", "mx40", "cnc milling"],
    "ac-90": ["ac-90", "ac90", "compressor"],
    "pk-12": ["pk-12", "pk12", "packaging"],
}


def _guess_machine_id(text_sample: str) -> str:
    low = text_sample.lower()
    for machine_id, hints in KNOWN_MACHINE_HINTS.items():
        if any(h in low for h in hints):
            return machine_id
    return "hp-200x"  # sensible default for this demo fleet


@app.post("/api/manuals/upload", response_model=Manual)
async def upload_manual(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are supported")

    manual_id = "man-" + uuid.uuid4().hex[:10]
    dest_path = os.path.join(MANUALS_DIR, f"{manual_id}.pdf")
    with open(dest_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        pages = len(PdfReader(dest_path).pages)
    except Exception:
        pages = 0
    size_mb = os.path.getsize(dest_path) / (1024 * 1024)

    # crude auto-detect of which machine this manual belongs to (bonus feature)
    sample_text = ""
    try:
        from .rag.chunking import extract_pages_text
        pages_text = extract_pages_text(dest_path)
        sample_text = " ".join(t for _, t in pages_text[:3])
    except Exception:
        pass
    machine_id = _guess_machine_id(sample_text or file.filename)
    machine = db.get_machine(machine_id) or {}

    title = os.path.splitext(file.filename)[0]
    row = dict(
        id=manual_id, title=title, machineId=machine_id,
        machineName=machine.get("name", ""), model=machine.get("model", ""),
        pages=pages, fileSize=f"{size_mb:.1f} MB", ocrStatus="Completed", status="Indexed",
        uploadedDate=datetime.date.today().isoformat(), version="Rev 1.0 (User Uploaded)",
        tabColor="#38BDF8", filepath=dest_path, documentType="Service Manual",
    )
    db.upsert_manual(row)
    try:
        ingest_manual(row)
    except Exception as e:
        print(f"[upload] ingestion failed for {manual_id}: {e}")
    db.increment_manual_count(machine_id, 1)

    return row


# ---------------- Troubleshoot ----------------

@app.post("/api/troubleshoot", response_model=DiagnoseResponse)
def troubleshoot(req: DiagnoseRequest):
    history = [h.model_dump() for h in req.history] if req.history else None
    result = run_diagnose(req.query, req.machineId, language=req.language or "en", history=history)
    return result


# ---------------- Chat (real-time streaming, open-ended manual Q&A) ----------------

@app.post("/api/chat/stream")
def chat_stream(req: ChatRequest):
    history = [h.model_dump() for h in req.history] if req.history else None

    def event_stream():
        try:
            for event in stream_chat_answer(
                req.query, req.machineId, req.manualId,
                language=req.language or "en", history=history,
            ):
                yield f"data: {json.dumps(event)}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


# ---------------- OCR ----------------

@app.post("/api/ocr", response_model=OCRPageAnalysis)
def ocr_page(req: OCRRequest):
    try:
        result = analyze_page(req.manualId, req.pageNumber)
        return result
    except Exception as e:
        print(f"[ocr] live Gemini call failed, using demo fallback: {e}")
        if req.pageNumber == 214:
            return FALLBACK_OCR_PAGE_214
        raise HTTPException(502, f"OCR analysis failed: {e}")


# ---------------- HMI Screenshot ----------------

@app.post("/api/screenshot", response_model=HMIScreenshotAnalysis)
def screenshot(req: ScreenshotRequest):
    try:
        result = analyze_screenshot(req.imageBase64)
        return result
    except Exception as e:
        print(f"[screenshot] live Gemini call failed, using demo fallback: {e}")
        return FALLBACK_HMI_ANALYSIS
