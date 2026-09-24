# SARVA-SENSE Backend &mdash; Architecture Note

## Pipeline

```
PDF manuals -> section-aware chunking -> local embeddings -> ChromaDB
   -> hybrid retrieval (vector + exact keyword/error-code) -> context assembly
   -> Groq generation -> Groq grounding verification -> structured response
```

## 1. Chunking (`app/rag/chunking.py`)

Manuals are not chunked by fixed character count. Instead:

1. Each page's text is extracted (PyMuPDF; falls back to pdfplumber if
   PyMuPDF isn't importable, so ingestion still runs).
2. Lines are scanned for heading patterns (`SECTION 8.3 - ...`, `4.2 Title`,
   or short ALL-CAPS lines). A new heading starts a new *section*; every
   section remembers the page number of its **first line**, which is what
   gets cited back to the technician.
3. Long sections are further split into ~220-word sub-chunks (40-word
   overlap) so a single chunk stays focused and self-contained (the heading
   is repeated in each sub-chunk) &mdash; we never index "one giant blob of
   text" per manual.
4. Sections shorter than `MIN_CHUNK_WORDS` (default 20) are dropped. This is
   what keeps padding/reference pages out of the vector index without
   needing a second classification pass: an OEM manual's actual diagnostic
   content is almost always denser than a throwaway cross-reference line.
5. Alarm/error codes (`E101`, `F220`, ...) are extracted per chunk via regex
   and stored as metadata in both ChromaDB and SQLite, which is what makes
   exact-code retrieval and ambiguity detection possible without relying on
   the embedding model to treat "E101" and "E102" as meaningfully different
   (it often won't, since they're one character apart).

## 2. Retrieval (`app/rag/retrieval.py`)

Two independent signals, combined:

- **Vector similarity** (ChromaDB, cosine space, sentence-transformers
  `all-MiniLM-L6-v2`) &mdash; good for natural-language symptom queries
  ("why is it overheating").
- **Exact keyword / error-code match** (SQLite `LIKE` over the same chunk
  text/metadata) &mdash; good for exact-code queries and immune to the
  embedding model's tendency to consider "E101" and "E102" semantically
  close.

`combined = 0.55 * vector_similarity + 0.45 * keyword_exactness`. Chunks
below `RAG_MIN_RELEVANCE` (default 42%) are dropped rather than padded in
with the rest of top-k &mdash; **retrieval precision over recall**, per the
brief. If nothing clears the bar, the pipeline goes straight to the
insufficient-information response without ever calling the LLM.

If a machine is specified, retrieval is scoped to that machine's chunks via
a Chroma `where` filter, so a hydraulic-press chunk can never leak into an
answer about the CNC mill.

## 3. Cross-manual ambiguity resolution (`app/rag/pipeline.py`)

When the query contains an explicit error code and no machine is specified:

1. `find_machines_for_error_code(code)` looks up every distinct
   `machineId` whose chunks mention that exact code (SQLite).
2. **0 machines** &rarr; fall through to normal retrieval (the "code" may
   just be a coincidental token in a symptom description).
3. **1 machine** &rarr; automatically scope to that machine (this is the
   "automatic machine-model detection from context" bonus: a genuinely
   unique code doesn't need a clarifying question).
4. **2+ machines** &rarr; return the `AMBIGUITY` response listing each
   machine and the first line of manual text mentioning the code for that
   machine, so the technician can see *why* it's ambiguous before choosing.

This is the mechanism the brief calls out as the real difficulty: E101 means
"hydraulic pressure sensor fault" on the HP-200X (page 214) and "spindle
bearing thermal excursion" on the MX-40 (page 96) &mdash; two manuals, same
string, disjoint meaning and disjoint repair procedure. Getting the SQL
lookup right (rather than eyeballing embedding similarity) is what prevents
a technician from being routed to the wrong procedure.

## 4. Hallucination control

This is intentionally **two separate LLM calls with different jobs**, not one
call with a stern system prompt:

- **Call 1 (`generation.py`)** is told it may only use the numbered evidence
  chunks it's given, must not invent part numbers/thresholds/steps, and must
  return a `groundingNote` naming any gap.
- **Call 2 (`verification.py`)** is a *separate* prompt, given the same
  evidence and the Call-1 output, and asked to audit **each individual
  claim** (each probable cause, each corrective step) as
  `supported` / `unsupported` / `contradicted`. It is not told what Call 1
  was "supposed" to do &mdash; it just checks the text against the evidence.

`pipeline._compute_verification` turns the audit into:

- `confidence` (0-99): a function of the supported/total claim fraction and
  average retrieval relevance &mdash; not a flat/hardcoded number.
- `evidenceCoverage` (High/Medium/Low): thresholds on claim-support fraction
  *and* retrieval relevance together (an answer can't be "High" coverage
  just because the LLM is confident if retrieval relevance was weak).
- `verificationState`: `VERIFIED` only if effectively all claims are
  supported and coverage isn't Low; `PARTIALLY_VERIFIED` down to a 40%
  support floor; below that, **the pipeline discards the generated answer
  entirely and returns the insufficient-information response** &mdash; a
  confident-sounding but poorly-grounded answer never reaches the
  technician.
- `machineMatch` (Exact/Partial/Ambiguous/None): computed from whether the
  retrieved chunks' `machineId` actually matches the requested machine, not
  asserted by the LLM.

None of these four fields are hardcoded constants; they're derived every
time from the actual retrieval + verification signals for that specific
query.

## 5. Traceability

Every `SourceCitation` returned to the frontend (`manualTitle`, `section`,
`page`, `relevance`, `matchedKeywords`, `snippet`) is built directly from the
`RetrievedChunk` objects that fed the prompt &mdash; there is no separate
"make up a citation" step. If a claim in the final answer can't be traced to
one of these chunks, it should have been caught by the verification step
above.

## 6. Non-text content

Manual tables and alarm matrices in the sample PDFs are represented as
structured prose (`Code: E101 / Alarm: ... / Trigger: ... / Corrective
Action: ...`) rather than image tables, so they extract cleanly with plain
text extraction. For genuinely scanned/image-based manuals, the OCR endpoint
renders the page with PyMuPDF and asks Gemini Vision to return structured
JSON (headings/warnings/tables/procedures) instead of relying on naive text
extraction, which is what the brief flags as commonly mangled.

## 7. Multilingual

The `language` field flows all the way into the Groq generation prompt
(`generation.LANGUAGE_NAMES`), which asks the model to write every string
field of the structured answer directly in the target language, grounded in
the same (English-language) evidence. This replaces the frontend's earlier
static `MOCK_TRANSLATIONS` lookup table, which could only ever localize the
one hardcoded demo answer.

## 8. Demo fallback isolation

`app/fallback.py` contains hand-written answers for the exact demo
scenarios (E101/overheat on HP-200X, OCR page 214, the sample HMI screen).
`pipeline.diagnose()` and the OCR/HMI routes only reach for these inside an
`except` block around the live Groq/Gemini call &mdash; a working API key
never touches this file. Every fact in the fallback content is copied
directly from the bundled sample manuals, so even "fallback mode" isn't
inventing anything; it's just pre-written instead of freshly generated.
