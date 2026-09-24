"""
Groq call #1: grounded answer generation.

The system prompt is intentionally strict: the model is told it may ONLY use
the numbered evidence chunks it is given, must not invent part numbers,
thresholds, or steps that are not present in the evidence, and must produce
one specific field ("groundingNote") calling out anything it could not fully
support. This alone is still "just a prompt" though -- the real hallucination
guard is the independent verification call in verification.py, which checks
the output against the evidence after the fact.
"""
import json
from typing import List
from groq import Groq
from ..config import GROQ_API_KEY, GROQ_MODEL

LANGUAGE_NAMES = {
    "en": "English", "hi": "Hindi", "hinglish": "Hinglish (Roman-script mixed Hindi/English)",
    "ta": "Tamil", "te": "Telugu", "bn": "Bengali", "mr": "Marathi", "gu": "Gujarati",
    "kn": "Kannada", "ml": "Malayalam", "pa": "Punjabi", "es": "Spanish", "fr": "French",
    "de": "German", "ja": "Japanese",
}

SYSTEM_PROMPT = """You are SARVA-SENSE, an industrial machine troubleshooting assistant.

STRICT GROUNDING RULES:
- You may ONLY use facts present in the numbered EVIDENCE chunks provided in the user message.
- Do NOT invent part numbers, thresholds, pressures, temperatures, or procedure steps that are not
  stated in the evidence. If the evidence does not fully specify something, say so plainly instead
  of guessing.
- Every probable cause and every corrective action step must be traceable to at least one evidence
  chunk. Prefer fewer, well-supported causes/steps over speculative ones.
- Mark any corrective step that involves de-energizing, depressurizing, LOTO, or high-pressure/thermal
  hazards as safetyCritical: true.
- Respond with ONLY a single JSON object, no markdown fences, no commentary, matching exactly this
  schema:
{
  "errorMeaning": string,
  "probableCauses": [string, ...],
  "correctiveActions": [{"step": int, "title": string, "description": string, "safetyCritical": bool}, ...],
  "safetyWarning": string,
  "groundingNote": string  // one sentence: what evidence chunks were used and any gaps
}
"""


def _client():
    return Groq(api_key=GROQ_API_KEY)


def build_evidence_block(chunks) -> str:
    lines = []
    for i, c in enumerate(chunks, start=1):
        lines.append(f"[{i}] (Manual chunk, Section: {c.section}, Page: {c.page})\n{c.text}")
    return "\n\n".join(lines)


def generate_answer(query: str, chunks, language: str = "en", history: List[dict] = None) -> dict:
    if not GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY not configured")

    lang_name = LANGUAGE_NAMES.get(language, "English")
    evidence = build_evidence_block(chunks)

    history_block = ""
    if history:
        turns = []
        for h in history[-6:]:
            if h.get("text"):
                turns.append(f"{h.get('sender', 'user')}: {h['text']}")
            elif h.get("structuredAnswerSummary"):
                turns.append(f"assistant (prior diagnosis): {h['structuredAnswerSummary']}")
        if turns:
            history_block = "CONVERSATION SO FAR:\n" + "\n".join(turns) + "\n\n"

    user_prompt = (
        f"{history_block}"
        f"EVIDENCE (retrieved manual excerpts, numbered):\n{evidence}\n\n"
        f"TECHNICIAN QUESTION: {query}\n\n"
        f"Respond in {lang_name}. Return ONLY the JSON object described in the system prompt, "
        f"with all string field values written in {lang_name}."
    )

    resp = _client().chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.2,
        response_format={"type": "json_object"},
    )
    content = resp.choices[0].message.content
    return json.loads(content)
