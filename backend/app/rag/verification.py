"""
Groq call #2: independent grounding verification.

This is the real hallucination-control mechanism, not just a prompt
instruction: the generated answer is re-submitted to the model along with
the SAME evidence, and the model is asked to judge -- for each individual
claim (each probable cause and each corrective step) -- whether it is
actually supported by the evidence, unsupported, or contradicted.

pipeline.py turns the result into `confidence`, `evidenceCoverage`,
`claimsSupported`, and `verificationState`, and downgrades to the
insufficient-information response if too few claims are supported -- so a
confident-sounding but ungrounded answer never reaches the technician.
"""
import json
from groq import Groq
from ..config import GROQ_API_KEY, GROQ_MODEL
from .generation import build_evidence_block

VERIFY_SYSTEM_PROMPT = """You are a strict grounding auditor for an industrial troubleshooting system.
You will be given EVIDENCE (numbered manual excerpts) and a CANDIDATE ANSWER (JSON).
For EVERY item in candidate.probableCauses and EVERY item in candidate.correctiveActions, decide if it
is directly supported by the evidence text (supported), not mentioned at all (unsupported), or actively
contradicted by the evidence (contradicted).
Be strict: paraphrasing evidence counts as supported; inventing specifics not in the evidence (part
numbers, thresholds, steps) counts as unsupported even if it sounds plausible.
Respond with ONLY a JSON object, no markdown fences:
{
  "claims": [{"text": string, "verdict": "supported"|"unsupported"|"contradicted"}, ...],
  "supportedCount": int,
  "totalCount": int
}
"""


def _client():
    return Groq(api_key=GROQ_API_KEY)


def verify_answer(candidate: dict, chunks) -> dict:
    if not GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY not configured")

    evidence = build_evidence_block(chunks)
    claim_texts = list(candidate.get("probableCauses", [])) + [
        f"{a.get('title', '')}: {a.get('description', '')}" for a in candidate.get("correctiveActions", [])
    ]

    user_prompt = (
        f"EVIDENCE:\n{evidence}\n\n"
        f"CANDIDATE ANSWER CLAIMS TO AUDIT:\n" + "\n".join(f"- {c}" for c in claim_texts) +
        "\n\nAudit every claim listed above and return the JSON object described in the system prompt."
    )

    resp = _client().chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": VERIFY_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.0,
        response_format={"type": "json_object"},
    )
    result = json.loads(resp.choices[0].message.content)
    # be defensive about the model's own counting
    claims = result.get("claims", [])
    supported = sum(1 for c in claims if c.get("verdict") == "supported")
    result["supportedCount"] = supported
    result["totalCount"] = len(claims) if claims else result.get("totalCount", 0)
    return result
