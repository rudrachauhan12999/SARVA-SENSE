import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
MANUALS_DIR = os.path.join(DATA_DIR, "manuals")
CHROMA_DIR = os.path.join(DATA_DIR, "chroma")
DB_PATH = os.path.join(DATA_DIR, "sarva.db")

os.makedirs(MANUALS_DIR, exist_ok=True)
os.makedirs(CHROMA_DIR, exist_ok=True)

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-flash-lite-latest")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")

# Retrieval tuning
TOP_K = int(os.getenv("RAG_TOP_K", "6"))
MIN_RELEVANCE_PERCENT = int(os.getenv("RAG_MIN_RELEVANCE", "42"))  # below this -> insufficient info
MIN_CHUNK_WORDS = int(os.getenv("RAG_MIN_CHUNK_WORDS", "20"))  # filler-page filter

# OCR fallback during ingestion: pages whose native PyMuPDF/pdfplumber text
# layer has fewer than this many words are treated as scanned/image-only and
# re-extracted via Gemini Vision (see vision/ocr.py) so scanned manuals still
# get indexed instead of silently contributing zero chunks.
OCR_FALLBACK_ENABLED = os.getenv("RAG_OCR_FALLBACK", "true").strip().lower() in ("1", "true", "yes")
OCR_MIN_WORDS_PER_PAGE = int(os.getenv("RAG_OCR_MIN_WORDS", "8"))

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
