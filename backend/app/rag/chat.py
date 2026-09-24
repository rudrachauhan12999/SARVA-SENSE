"""
Real-time streaming chatbot for open-ended manual/machine Q&A.

Distinct from pipeline.py's diagnose(): that pipeline is deliberately narrow
(single error code or symptom -> structured JSON -> independent verification
call -> refuses outright if evidence is thin). This module is for open-ended
questions about a manual or machine's whole knowledge base -- "list the top
10 problems in this manual", "summarize the maintenance schedule", "what
safety warnings are documented?" -- where the useful answer is prose/a list,
not a single rigid diagnosis, and where "insufficient evidence" isn't the
right response to a request that's inherently a summary over everything
that's indexed.

Retrieval here is scope-based rather than similarity-based: given a specific
manualId (chat about one manual) or machineId (chat about a machine's whole
manual set), it pulls chunks directly by that scope from SQLite, biased
towards chunks that carry an alarm/error code (matches "problems" style
questions) instead of ranking by embedding similarity to the raw query -- a
manual-wide question like "list the problems in this manual" doesn't
semantically resemble any single chunk the way a specific symptom query
does, so similarity search alone would under-cover the manual.
"""
from typing import Any, Dict, Iterator, List, Optional

from groq import Groq

from .. import db
from ..config import GROQ_API_KEY, GROQ_MODEL
from .retrieval import RetrievedChunk, hybrid_retrieve

CHUNK_CAP = 40
# Groq's free tier caps requests at a fairly low tokens-per-minute budget
# (e.g. 8000 TPM for openai/gpt-oss-120b) -- pulling the full CHUNK_CAP worth
# of ~220-word chunks for a machine-wide question can alone exceed that in
# one request. Trim total evidence to a conservative word budget so the
# request comes in well under the limit, leaving headroom for the system
# prompt, history, and the model's own completion tokens within that window.
EVIDENCE_WORD_BUDGET = 2200

LANGUAGE_NAMES = {
    "en": "English", "hi": "Hindi", "hinglish": "Hinglish (Roman-script mixed Hindi/English)",
    "ta": "Tamil", "te": "Telugu", "bn": "Bengali", "mr": "Marathi", "gu": "Gujarati",
    "kn": "Kannada", "ml": "Malayalam", "pa": "Punjabi", "es": "Spanish", "fr": "French",
    "de": "German", "ja": "Japanese",
}

CHAT_SYSTEM_PROMPT = """You are SARVA-SENSE, a helpful industrial machine assistant chatting with a \
technician about their equipment manuals.

GROUNDING RULES:
- Answer using ONLY the numbered EVIDENCE chunks provided below. If the evidence doesn't cover
  something, say so plainly instead of guessing or using outside knowledge.
- When asked to list, count, rank, or summarize things (e.g. "list the top 10 problems in this
  manual", "what alarm codes exist?"), scan ALL the evidence chunks given and enumerate every
  distinct one you can find -- don't stop after one or two. If fewer than the requested number
  actually exist in the evidence, list what's really there and say plainly that's all that's
  documented, instead of inventing more to reach the requested count.
- Cite the section and page for each fact/claim you state, inline, like: (Section 8.3, p.214).
- Format lists as markdown numbered or bulleted lists, with short sub-bullets for details. Do NOT
  use markdown tables -- this is a narrow chat bubble UI and tables render unreadably there.
- Keep prose concise and technician-friendly.
- Never invent part numbers, thresholds, or steps that are not present in the evidence.
Respond in {language}. Plain text/markdown only -- no JSON, no code fences around the whole answer.
"""


def _row_to_chunk(row: dict) -> RetrievedChunk:
    codes = [c for c in (row.get("errorCodes") or "").split(",") if c]
    return RetrievedChunk(
        id=row["id"], manualId=row["manualId"], machineId=row["machineId"],
        section=row["section"], page=row["page"], text=row["text"],
        errorCodes=codes, relevance=80, matchedKeywords=[],
    )


def _trim_to_word_budget(chunks: List[RetrievedChunk], budget: int = EVIDENCE_WORD_BUDGET) -> List[RetrievedChunk]:
    """Keep chunks (already ordered, error-code chunks first) until the
    cumulative word count would exceed the budget. Always keeps at least one
    chunk even if it alone exceeds the budget, so a single oversized chunk
    doesn't result in empty evidence."""
    kept = []
    total = 0
    for c in chunks:
        words = len(c.text.split())
        if kept and total + words > budget:
            break
        kept.append(c)
        total += words
    return kept


def gather_chat_context(query: str, machine_id: Optional[str], manual_id: Optional[str]) -> List[RetrievedChunk]:
    if manual_id:
        rows = db.list_chunks_for_manual(manual_id, limit=CHUNK_CAP)
        if rows:
            return _trim_to_word_budget([_row_to_chunk(r) for r in rows])
    if machine_id:
        rows = db.list_chunks_for_machine(machine_id, limit=CHUNK_CAP)
        if rows:
            return _trim_to_word_budget([_row_to_chunk(r) for r in rows])
    # No scope given (or the requested scope has nothing indexed yet) --
    # fall back to ordinary similarity search across everything indexed.
    return _trim_to_word_budget(hybrid_retrieve(query, machine_id=machine_id, top_k=14))


def _build_evidence_block(chunks: List[RetrievedChunk]) -> str:
    lines = []
    for i, c in enumerate(chunks, start=1):
        manual = db.get_manual(c.manualId) or {}
        lines.append(
            f"[{i}] (Manual: {manual.get('title', c.manualId)}, Section: {c.section}, Page: {c.page})\n{c.text}"
        )
    return "\n\n".join(lines)


def _sources_from_chunks(chunks: List[RetrievedChunk]) -> List[Dict[str, Any]]:
    sources = []
    seen = set()
    for c in chunks:
        manual = db.get_manual(c.manualId) or {}
        key = (c.manualId, c.section, c.page)
        if key in seen:
            continue
        seen.add(key)
        sources.append({"manualTitle": manual.get("title", c.manualId), "section": c.section, "page": c.page})
    return sources


def stream_chat_answer(query: str, machine_id: Optional[str], manual_id: Optional[str],
                        language: str = "en", history: Optional[List[dict]] = None) -> Iterator[Dict[str, Any]]:
    """Yields dict events as the answer streams in:
      {"type": "token", "text": "..."}   -- one per streamed text delta
      {"type": "sources", "sources": [...]}  -- once, after the stream ends
      {"type": "error", "message": "..."}    -- on failure, in place of the above
    """
    if not GROQ_API_KEY:
        yield {"type": "error", "message": "GROQ_API_KEY is not configured on the server."}
        return

    chunks = gather_chat_context(query, machine_id, manual_id)
    if not chunks:
        yield {"type": "token", "text": "I don't have any manuals indexed yet for this machine, so I "
                                         "can't answer that yet. Upload a manual first, then ask again."}
        yield {"type": "sources", "sources": []}
        return

    lang_name = LANGUAGE_NAMES.get(language, "English")
    evidence = _build_evidence_block(chunks)

    history_block = ""
    if history:
        turns = []
        for h in history[-6:]:
            content = h.get("text") or h.get("chatText")
            if content:
                turns.append(f"{h.get('sender', 'user')}: {content}")
        if turns:
            history_block = "CONVERSATION SO FAR:\n" + "\n".join(turns) + "\n\n"

    user_prompt = (
        f"{history_block}"
        f"EVIDENCE (retrieved manual excerpts, numbered):\n{evidence}\n\n"
        f"TECHNICIAN QUESTION: {query}\n\n"
        f"Respond in {lang_name}."
    )

    try:
        client = Groq(api_key=GROQ_API_KEY)
        stream = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": CHAT_SYSTEM_PROMPT.format(language=lang_name)},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.3,
            stream=True,
        )
        for event in stream:
            delta = event.choices[0].delta.content
            if delta:
                yield {"type": "token", "text": delta}
    except Exception as e:
        yield {"type": "error", "message": f"Chat generation failed: {e}"}
        return

    yield {"type": "sources", "sources": _sources_from_chunks(chunks)}
