import hashlib
from .. import db
from .chunking import chunk_pdf
from .embeddings import embed_texts
from .vectorstore import add_chunks, delete_manual


def _chunk_id(manual_id: str, idx: int) -> str:
    return hashlib.sha1(f"{manual_id}:{idx}".encode()).hexdigest()[:16]


def ingest_manual(manual_row: dict) -> int:
    """manual_row must already be upserted into the `manuals` table and contain:
    id, machineId, filepath, title, documentType.
    Returns number of chunks indexed."""
    manual_id = manual_row["id"]
    machine_id = manual_row["machineId"]
    filepath = manual_row["filepath"]
    title = manual_row["title"]

    # Clear any previous index for this manual (re-ingest safe)
    db.delete_chunks_for_manual(manual_id)
    delete_manual(manual_id)

    chunks = chunk_pdf(filepath, title, manual_id=manual_id)
    if not chunks:
        return 0

    ids = [_chunk_id(manual_id, i) for i in range(len(chunks))]
    texts = [c.text for c in chunks]
    embeddings = embed_texts(texts)
    metadatas = [{
        "manualId": manual_id,
        "machineId": machine_id,
        "section": c.section,
        "page": c.page,
        "errorCodes": ",".join(c.error_codes),
    } for c in chunks]

    add_chunks(ids=ids, embeddings=embeddings, metadatas=metadatas, documents=texts)

    db.insert_chunks([{
        "id": ids[i],
        "manualId": manual_id,
        "machineId": machine_id,
        "section": chunks[i].section,
        "page": chunks[i].page,
        "errorCodes": chunks[i].error_codes,
        "text": chunks[i].text,
    } for i in range(len(chunks))])

    return len(chunks)
