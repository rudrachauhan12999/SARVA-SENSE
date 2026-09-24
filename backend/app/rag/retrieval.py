"""
Hybrid retrieval.

Two independent signals are combined and re-ranked:
  1. Vector similarity (semantic) via ChromaDB over sentence-transformer
     embeddings -- good for natural-language symptom queries.
  2. Exact keyword / error-code matching via SQLite `LIKE` over the same
     chunk text -- good for "E101"-style exact-code queries, and immune to
     embedding models sometimes treating similar-looking codes as "close".

A chunk that matches both signals is boosted above one that only matches
one. Retrieval precision is prioritized over recall: results below
MIN_RELEVANCE_PERCENT are dropped entirely rather than padded in, and the
caller (pipeline.py) treats "nothing cleared the bar" as a real, structural
signal for triggering the insufficient-information path -- not just a prompt
instruction hoping the LLM behaves.
"""
import re
from dataclasses import dataclass
from typing import List, Optional
from .. import db
from .embeddings import embed_query
from .vectorstore import query as vector_query
from ..config import TOP_K, MIN_RELEVANCE_PERCENT

ERROR_CODE_RE = re.compile(r"\b([EF]\d{2,4})\b")


@dataclass
class RetrievedChunk:
    id: str
    manualId: str
    machineId: str
    section: str
    page: int
    text: str
    errorCodes: List[str]
    relevance: int  # 0-100
    matchedKeywords: List[str]


def extract_error_code(query_text: str) -> Optional[str]:
    m = ERROR_CODE_RE.search(query_text.upper())
    return m.group(1) if m else None


def _keyword_terms(query_text: str) -> List[str]:
    stop = {"the", "is", "a", "an", "on", "of", "why", "what", "does", "and", "to", "for", "my", "it"}
    return [w for w in re.findall(r"[A-Za-z0-9\-]+", query_text.lower()) if w not in stop and len(w) > 2]


def hybrid_retrieve(query_text: str, machine_id: Optional[str] = None, top_k: int = TOP_K) -> List[RetrievedChunk]:
    code = extract_error_code(query_text)
    terms = _keyword_terms(query_text)

    where = {"machineId": machine_id} if machine_id else None

    # --- signal 1: vector similarity ---
    q_emb = embed_query(query_text)
    vec_result = vector_query(q_emb, n_results=max(top_k * 3, 10), where=where)

    candidates = {}
    if vec_result and vec_result.get("ids") and vec_result["ids"][0]:
        ids = vec_result["ids"][0]
        docs = vec_result["documents"][0]
        metas = vec_result["metadatas"][0]
        dists = vec_result["distances"][0]
        for i in range(len(ids)):
            similarity = max(0.0, 1.0 - float(dists[i]))  # cosine space
            meta = metas[i]
            candidates[ids[i]] = {
                "id": ids[i], "text": docs[i], "meta": meta,
                "vector_score": similarity, "keyword_score": 0.0,
            }

    # --- signal 2: exact keyword / error-code matching ---
    if code:
        for row in db.keyword_search_chunks(code, machine_id=machine_id, limit=top_k * 2):
            cid = row["id"]
            if cid in candidates:
                candidates[cid]["keyword_score"] = 1.0
            else:
                candidates[cid] = {
                    "id": cid, "text": row["text"],
                    "meta": {"manualId": row["manualId"], "machineId": row["machineId"],
                             "section": row["section"], "page": row["page"],
                             "errorCodes": row["errorCodes"]},
                    "vector_score": 0.55,  # unseen by vector search but exact-matched
                    "keyword_score": 1.0,
                }

    # combine + rank (weighted: keyword/error-code exactness matters more for precision)
    scored = []
    for c in candidates.values():
        combined = 0.55 * c["vector_score"] + 0.45 * c["keyword_score"]
        scored.append((combined, c))
    scored.sort(key=lambda x: x[0], reverse=True)

    results: List[RetrievedChunk] = []
    for combined, c in scored[:top_k]:
        relevance = int(round(combined * 100))
        if relevance < MIN_RELEVANCE_PERCENT:
            continue
        meta = c["meta"]
        chunk_codes = [x for x in (meta.get("errorCodes") or "").split(",") if x]
        matched_kw = [t for t in terms if t in c["text"].lower()]
        if code and code in chunk_codes:
            matched_kw = [code] + matched_kw
        results.append(RetrievedChunk(
            id=c["id"], manualId=meta["manualId"], machineId=meta["machineId"],
            section=meta["section"], page=int(meta["page"]), text=c["text"],
            errorCodes=chunk_codes, relevance=min(99, relevance),
            matchedKeywords=list(dict.fromkeys(matched_kw))[:6],
        ))
    return results


def machines_with_error_code(code: str) -> List[str]:
    return db.find_machines_for_error_code(code)
