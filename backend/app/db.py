import sqlite3
import json
import threading
from contextlib import contextmanager
from .config import DB_PATH

_lock = threading.Lock()


def _connect():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    return conn


_conn = _connect()


@contextmanager
def get_cursor():
    with _lock:
        cur = _conn.cursor()
        try:
            yield cur
            _conn.commit()
        finally:
            cur.close()


def init_db():
    with get_cursor() as cur:
        cur.execute("""
        CREATE TABLE IF NOT EXISTS machines (
            id TEXT PRIMARY KEY,
            name TEXT, model TEXT, serialNumber TEXT, category TEXT,
            status TEXT, location TEXT, manualCount INTEGER DEFAULT 0,
            caseCount INTEGER DEFAULT 0, lastFault TEXT,
            iconColor TEXT, tabColor TEXT
        )""")
        cur.execute("""
        CREATE TABLE IF NOT EXISTS manuals (
            id TEXT PRIMARY KEY,
            title TEXT, machineId TEXT, machineName TEXT, model TEXT,
            pages INTEGER, fileSize TEXT, ocrStatus TEXT, status TEXT,
            uploadedDate TEXT, version TEXT, tabColor TEXT,
            filepath TEXT, documentType TEXT
        )""")
        cur.execute("""
        CREATE TABLE IF NOT EXISTS chunks (
            id TEXT PRIMARY KEY,
            manualId TEXT, machineId TEXT, section TEXT, page INTEGER,
            errorCodes TEXT,  -- comma-separated
            text TEXT
        )""")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_chunks_machine ON chunks(machineId)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_chunks_manual ON chunks(manualId)")
        cur.execute("""
        CREATE TABLE IF NOT EXISTS ocr_cache (
            cacheKey TEXT PRIMARY KEY,
            manualId TEXT, page INTEGER, resultJson TEXT, createdAt TEXT
        )""")
        cur.execute("""
        CREATE TABLE IF NOT EXISTS hmi_cache (
            cacheKey TEXT PRIMARY KEY,
            resultJson TEXT, createdAt TEXT
        )""")


# ---------------- Machines ----------------

def upsert_machine(m: dict):
    with get_cursor() as cur:
        cur.execute("""
        INSERT INTO machines (id,name,model,serialNumber,category,status,location,
            manualCount,caseCount,lastFault,iconColor,tabColor)
        VALUES (:id,:name,:model,:serialNumber,:category,:status,:location,
            :manualCount,:caseCount,:lastFault,:iconColor,:tabColor)
        ON CONFLICT(id) DO UPDATE SET
            name=excluded.name, model=excluded.model, serialNumber=excluded.serialNumber,
            category=excluded.category, status=excluded.status, location=excluded.location,
            manualCount=excluded.manualCount, caseCount=excluded.caseCount,
            lastFault=excluded.lastFault, iconColor=excluded.iconColor, tabColor=excluded.tabColor
        """, m)


def list_machines():
    with get_cursor() as cur:
        cur.execute("SELECT * FROM machines")
        return [dict(r) for r in cur.fetchall()]


def get_machine(machine_id):
    with get_cursor() as cur:
        cur.execute("SELECT * FROM machines WHERE id=?", (machine_id,))
        row = cur.fetchone()
        return dict(row) if row else None


def increment_manual_count(machine_id, delta=1):
    with get_cursor() as cur:
        cur.execute("UPDATE machines SET manualCount = manualCount + ? WHERE id=?", (delta, machine_id))


# ---------------- Manuals ----------------

def upsert_manual(m: dict):
    with get_cursor() as cur:
        cur.execute("""
        INSERT INTO manuals (id,title,machineId,machineName,model,pages,fileSize,
            ocrStatus,status,uploadedDate,version,tabColor,filepath,documentType)
        VALUES (:id,:title,:machineId,:machineName,:model,:pages,:fileSize,
            :ocrStatus,:status,:uploadedDate,:version,:tabColor,:filepath,:documentType)
        ON CONFLICT(id) DO UPDATE SET
            title=excluded.title, machineId=excluded.machineId, machineName=excluded.machineName,
            model=excluded.model, pages=excluded.pages, fileSize=excluded.fileSize,
            ocrStatus=excluded.ocrStatus, status=excluded.status, uploadedDate=excluded.uploadedDate,
            version=excluded.version, tabColor=excluded.tabColor, filepath=excluded.filepath,
            documentType=excluded.documentType
        """, m)


def list_manuals():
    with get_cursor() as cur:
        cur.execute("SELECT * FROM manuals")
        return [dict(r) for r in cur.fetchall()]


def get_manual(manual_id):
    with get_cursor() as cur:
        cur.execute("SELECT * FROM manuals WHERE id=?", (manual_id,))
        row = cur.fetchone()
        return dict(row) if row else None


# ---------------- Chunks (also mirrors what's embedded in Chroma) ----------------

def insert_chunks(rows):
    """rows: list of dicts with id, manualId, machineId, section, page, errorCodes(list), text"""
    with get_cursor() as cur:
        for r in rows:
            cur.execute("""
            INSERT OR REPLACE INTO chunks (id,manualId,machineId,section,page,errorCodes,text)
            VALUES (?,?,?,?,?,?,?)
            """, (r["id"], r["manualId"], r["machineId"], r["section"], r["page"],
                  ",".join(r.get("errorCodes", [])), r["text"]))


def delete_chunks_for_manual(manual_id):
    with get_cursor() as cur:
        cur.execute("DELETE FROM chunks WHERE manualId=?", (manual_id,))


def find_machines_for_error_code(code: str):
    """Returns distinct machineIds whose chunks mention this exact error code."""
    with get_cursor() as cur:
        cur.execute("SELECT DISTINCT machineId FROM chunks WHERE ',' || errorCodes || ',' LIKE ?",
                    (f"%,{code},%",))
        return [r["machineId"] for r in cur.fetchall()]


def keyword_search_chunks(code: str, machine_id=None, limit=8):
    with get_cursor() as cur:
        if machine_id:
            cur.execute("""SELECT * FROM chunks WHERE ',' || errorCodes || ',' LIKE ? AND machineId=?
                            LIMIT ?""", (f"%,{code},%", machine_id, limit))
        else:
            cur.execute("""SELECT * FROM chunks WHERE ',' || errorCodes || ',' LIKE ? LIMIT ?""",
                        (f"%,{code},%", limit))
        return [dict(r) for r in cur.fetchall()]


def get_chunk(chunk_id):
    with get_cursor() as cur:
        cur.execute("SELECT * FROM chunks WHERE id=?", (chunk_id,))
        row = cur.fetchone()
        return dict(row) if row else None


def chunk_count_for_manual(manual_id):
    with get_cursor() as cur:
        cur.execute("SELECT COUNT(*) as c FROM chunks WHERE manualId=?", (manual_id,))
        return cur.fetchone()["c"]


def list_chunks_for_manual(manual_id, limit=40):
    """All chunks for one manual, chunks carrying an alarm/error code first
    (matches "list the problems in this manual" style chat questions), then
    by page order. Used by the open-ended chat pipeline (see rag/chat.py)
    which scopes retrieval to a manual instead of ranking by similarity."""
    with get_cursor() as cur:
        cur.execute("""SELECT * FROM chunks WHERE manualId=?
                       ORDER BY (errorCodes != '') DESC, page ASC LIMIT ?""", (manual_id, limit))
        return [dict(r) for r in cur.fetchall()]


def list_chunks_for_machine(machine_id, limit=40):
    """Same as list_chunks_for_manual but scoped to every manual belonging
    to one machine."""
    with get_cursor() as cur:
        cur.execute("""SELECT * FROM chunks WHERE machineId=?
                       ORDER BY (errorCodes != '') DESC, page ASC LIMIT ?""", (machine_id, limit))
        return [dict(r) for r in cur.fetchall()]


# ---------------- OCR / HMI cache ----------------

def get_ocr_cache(cache_key):
    with get_cursor() as cur:
        cur.execute("SELECT resultJson FROM ocr_cache WHERE cacheKey=?", (cache_key,))
        row = cur.fetchone()
        return json.loads(row["resultJson"]) if row else None


def set_ocr_cache(cache_key, manual_id, page, result: dict):
    import datetime
    with get_cursor() as cur:
        cur.execute("""INSERT OR REPLACE INTO ocr_cache (cacheKey,manualId,page,resultJson,createdAt)
                       VALUES (?,?,?,?,?)""",
                    (cache_key, manual_id, page, json.dumps(result), datetime.datetime.utcnow().isoformat()))


def get_hmi_cache(cache_key):
    with get_cursor() as cur:
        cur.execute("SELECT resultJson FROM hmi_cache WHERE cacheKey=?", (cache_key,))
        row = cur.fetchone()
        return json.loads(row["resultJson"]) if row else None


def set_hmi_cache(cache_key, result: dict):
    import datetime
    with get_cursor() as cur:
        cur.execute("""INSERT OR REPLACE INTO hmi_cache (cacheKey,resultJson,createdAt)
                       VALUES (?,?,?)""",
                    (cache_key, json.dumps(result), datetime.datetime.utcnow().isoformat()))
