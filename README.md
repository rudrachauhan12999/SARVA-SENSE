# SARVA-SENSE

A RAG-based industrial machine troubleshooting assistant. A technician types
an error code, a symptom, or asks an open-ended question about a manual, and
gets back a grounded, cited answer pulled from the correct OEM manual — with
an independent verification pass so a confident-sounding but poorly-grounded
answer never reaches them.

**Live deployment:**

| | URL |
|---|---|
| Frontend (Vercel) | https://sarva-sense.vercel.app |
| Backend API (Railway) | https://sarva-sense-backend-production.up.railway.app |
| Backend health check | https://sarva-sense-backend-production.up.railway.app/api/health |
| Backend interactive docs | https://sarva-sense-backend-production.up.railway.app/docs |

---

## What it does

- **Grounded troubleshooting** — type an error code (`E101`) or a symptom in
  plain language, optionally scoped to a machine. Retrieval combines vector
  similarity with exact error-code matching, an LLM (Groq) drafts a
  structured answer from only the retrieved evidence, and a *second*,
  independent Groq call audits every individual claim against that same
  evidence before anything is shown to the technician.
- **Cross-manual ambiguity resolution** — the same error code can mean
  something completely different on two different machines. If a code with
  no machine specified matches manuals for more than one machine, the app
  asks which one instead of guessing.
- **Insufficient-information refusal** — if nothing retrieved clears the
  relevance bar, or too few of the drafted answer's claims survive
  verification, the app says so explicitly and explains what's missing,
  rather than inventing a plausible-sounding fix.
- **Real-time streaming chatbot** — open-ended questions about a specific
  manual or a machine's whole manual set ("list the top 10 problems in this
  manual", "summarize the maintenance schedule") stream back token-by-token
  as they're generated, with inline section/page citations.
- **Manual upload & indexing** — drop in a PDF and it's chunked
  section-aware, embedded locally, and indexed for retrieval. Pages with no
  extractable text layer (scanned/photographed pages) are automatically
  re-extracted via Gemini Vision OCR during ingestion, so scanned manuals
  still get indexed instead of silently contributing nothing.
- **OCR page review** — inspect Gemini Vision's structured extraction
  (headings, warnings, tables, procedures, detected error codes) for any
  page of an indexed manual.
- **HMI screenshot analysis** — upload a photo of a machine's control panel
  and get back detected alarm codes, readings, and an interpretation, with
  bounding boxes over each detected element.
- **Multilingual answers** — the target language flows into the generation
  prompt itself, so every field of a structured answer (and the chatbot's
  replies) is generated directly in that language, grounded in the same
  evidence.

---

## Architecture

```
PDF manuals ─▶ section-aware chunking ─▶ local embeddings ─▶ ChromaDB
   (OCR fallback for scanned pages)              │
                                                    ▼
query ─▶ hybrid retrieval (vector + exact error-code match, SQLite)
                                                    │
                                                    ▼
                                    Groq generation (grounded draft)
                                                    │
                                                    ▼
                              Groq verification (audits every claim)
                                                    │
                                                    ▼
                            structured, cited answer ─▶ frontend
```

The repo is a monorepo with two independently deployed halves:

- **`/`** — React 19 + Vite frontend (deployed to Vercel as a static build).
- **`/backend`** — FastAPI + RAG backend (deployed to Railway as a container).

### Backend (`/backend`)

| Path | Responsibility |
|---|---|
| `app/main.py` | FastAPI app, routes, CORS, startup seeding |
| `app/rag/chunking.py` | Section-aware PDF chunking + OCR fallback for scanned pages |
| `app/rag/embeddings.py` | Local sentence-transformers embeddings (`all-MiniLM-L6-v2`) |
| `app/rag/vectorstore.py` | ChromaDB persistent collection |
| `app/rag/retrieval.py` | Hybrid vector + keyword/error-code retrieval |
| `app/rag/pipeline.py` | Diagnose orchestration: retrieval → generation → verification → ambiguity/insufficient-info handling |
| `app/rag/generation.py` | Groq call #1 — grounded structured-answer draft |
| `app/rag/verification.py` | Groq call #2 — independent per-claim grounding audit |
| `app/rag/chat.py` | Real-time streaming chat (SSE) for open-ended manual/machine Q&A |
| `app/vision/ocr.py` | Gemini Vision manual-page OCR (structured extraction + fallback transcription) |
| `app/vision/hmi.py` | Gemini Vision HMI screenshot analysis |
| `app/db.py` | SQLite (machines, manuals, chunks, OCR/HMI cache) |
| `app/fallback.py` | Hand-written, evidence-accurate fallback answers used only if a live Groq/Gemini call throws |

See `backend/ARCHITECTURE.md` for the detailed chunking / retrieval /
hallucination-control design notes.

### Frontend (`/src`)

React + Vite + Tailwind, talking to the backend over `VITE_API_BASE_URL`
(see `src/services/api.ts`). Key pages: Dashboard, Troubleshoot (structured
diagnosis), Chat (real-time streaming Q&A), Manuals, Upload Manual, OCR
Review, HMI Screenshot, Machines, History, Reports, Plans, Settings.

---

## Deployment

| | Platform | Notes |
|---|---|---|
| Frontend | **Vercel** | Auto-detected Vite project. Builds `npm run build` → `dist`. Auto-deploys on every push to `main` (GitHub-connected). |
| Backend | **Railway** | Deployed from `backend/` as the build root (`Procfile` + `.python-version` pin Python 3.11 and the uvicorn start command). |

### Environment variables

**Backend (Railway service variables):**

| Variable | Purpose |
|---|---|
| `GROQ_API_KEY` | LLM generation + verification |
| `GROQ_MODEL` | e.g. `openai/gpt-oss-120b` |
| `GEMINI_API_KEY` | OCR + HMI screenshot vision |
| `GEMINI_MODEL` | e.g. `gemini-flash-lite-latest` — pick a model your key actually has quota for; check with `genai.list_models()` if OCR/HMI silently fall back to demo data |
| `EMBEDDING_MODEL` | Local embedding model, default `all-MiniLM-L6-v2` |
| `RAG_TOP_K` | Retrieval breadth, default `6` |
| `RAG_MIN_RELEVANCE` | Relevance floor below which evidence is dropped, default `42` |
| `RAG_MIN_CHUNK_WORDS` | Filler-page filter, default `20` |
| `RAG_OCR_FALLBACK` | Enable OCR fallback for scanned pages during ingestion, default `true` |
| `RAG_OCR_MIN_WORDS` | Word-count threshold below which a page is treated as scanned, default `8` |
| `CORS_ORIGINS` | Comma-separated allowed origins — must include the Vercel frontend URL |

**Frontend (Vercel project variables):**

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | The Railway backend URL, baked in at build time |

### Redeploying

```bash
# Backend — from repo root, uploads only backend/ as the build context
railway up backend --path-as-root --service sarva-sense-backend -y

# Frontend — from repo root
vercel --prod --yes
```

Pushing to `main` on GitHub also triggers an automatic Vercel redeploy
(Git integration); Railway is deployed via direct CLI upload, so backend
changes need an explicit `railway up`.

### Known limitations of the current deployment

- **Manual uploads aren't durable across Railway restarts.** `backend/data/`
  (SQLite + ChromaDB) is not committed and not on a persistent volume — it's
  rebuilt from the bundled/committed sample PDFs on every container boot.
  Anything uploaded through the running app will be lost on the next
  redeploy/restart unless a Railway Volume is mounted at `backend/data`.
- **Gemini's free tier has a very low daily request quota** on some models —
  OCR/HMI/OCR-fallback features degrade to cached/fallback data if it's
  exhausted, rather than erroring out.

---

## Local development

### 1. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# edit .env and set GROQ_API_KEY and GEMINI_API_KEY

# Generate the 4 bundled sample manuals (already included, but re-run any
# time you want to regenerate them):
python scripts/generate_sample_manuals.py

# Start the API. On first startup it seeds the machines/manuals tables and
# ingests the sample manuals (chunk -> embed -> store in ChromaDB + SQLite).
# This downloads the sentence-transformers model the first time, so it
# needs internet access once; after that it's fully local.
uvicorn app.main:app --reload --port 8000
```

The API is now live at `http://localhost:8000`. Interactive docs at
`http://localhost:8000/docs`.

### 2. Frontend

```bash
npm install
echo "VITE_API_BASE_URL=http://localhost:8000" > .env.local
npm run dev
```

Open the printed local URL. The app talks to the real backend for machines,
manuals, troubleshooting, the streaming chatbot, manual upload, OCR, and HMI
screenshot analysis. Voice input, history/plans/reports/settings remain
client-side.

### 3. Tests

```bash
cd backend
pytest -v
```

Covers: successful troubleshooting, ambiguous error code, insufficient
information, manuals listing, machines listing, manual upload, OCR (success
+ demo fallback), and screenshot analysis. Groq/Gemini calls are
monkeypatched in most tests so the suite doesn't require live API keys; the
ambiguity test relies on the real ingested SQLite/Chroma data built at app
startup.

---

## What's real vs. mocked

| Area | Status |
|---|---|
| PDF ingestion, section-aware chunking, page tracking | Real (PyMuPDF + regex, SQLite) |
| OCR fallback for scanned manual pages during ingestion | Real (Gemini Vision transcription, triggered when a page's native text layer is near-empty) |
| Embeddings | Real (local sentence-transformers, no external API) |
| Vector store | Real (ChromaDB, persisted to `backend/data/chroma`) |
| Hybrid retrieval (vector + exact error-code match) | Real |
| Cross-manual ambiguity resolution | Real (SQLite lookup of which machines mention a code) |
| Answer generation | Real (Groq) |
| Hallucination/grounding verification | Real (second independent Groq call auditing each claim) |
| Real-time streaming chat | Real (Groq `stream=True` over Server-Sent Events) |
| OCR page analysis | Real (PyMuPDF page render → Gemini Vision), cached in SQLite |
| HMI screenshot analysis | Real (Gemini Vision), cached in SQLite |
| Multilingual answers | Real (language passed to Groq, not a static lookup table) |
| Voice input | Browser `SpeechRecognition`, client-side |
| History / Plans / Reports / Settings | Client-side/localStorage |
| Demo fallback (OCR page 214, HMI sample, E101/overheat on HP-200X) | Real code path, only triggered when a live Groq/Gemini call throws |

---

## Sample manuals

Four synthetic-but-realistic OEM manuals are generated by
`backend/scripts/generate_sample_manuals.py` and bundled under
`backend/data/manuals/`:

| Manual | Machine | Notable content |
|---|---|---|
| HP-200 Service Manual (219 pages) | HP-200X Hydraulic Press | **E101** = pressure sensor fault (p.214), **E102/E105**, thermal management (p.168) |
| Hydraulic System Guide & Circuitry (95 pages) | HP-200X | Transducer PX-102 spec & bleed procedure (p.88) |
| MX-40 CNC Manual (119 pages) | MX-40 CNC Mill | **E101** = spindle bearing thermal warning (p.96) — **same code, different machine, different meaning** |
| AC-90 Compressor Manual (79 pages) | AC-90 Compressor | **E044** = filter differential alert (p.52) |

This gives every core scenario a real, page-accurate answer:

- **Exact error code**: `E101` with `machineId=hp-200x` → pressure sensor fault, cites page 214.
- **Natural language**: "Why is the HP-200X overheating?" → cites page 168.
- **Cross-manual ambiguity**: `E101` with no machine selected → asks to disambiguate between HP-200X and MX-40.
- **Insufficient information**: a symptom not covered by any manual → explicit refusal, not a guess.
- **Open-ended chat**: "list the top problems in this manual" → enumerates everything actually documented, honestly noting if there's less than asked for.

Filler pages exist purely so the important sections land on realistic page
numbers; they're automatically excluded from the vector index for being too
short to carry information (`MIN_CHUNK_WORDS` in chunking).

To add your own manuals, use the "Upload Manual" page in the UI, or `POST
/api/manuals/upload`.
