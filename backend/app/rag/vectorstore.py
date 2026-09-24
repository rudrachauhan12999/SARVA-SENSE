"""Thin wrapper around a persistent ChromaDB collection used as the vector
store for manual chunks. Chroma handles the vectors; SQLite (see db.py) holds
the same chunk text/metadata for exact keyword/error-code lookups so the
retrieval step can do real hybrid search (see retrieval.py)."""
from ..config import CHROMA_DIR

_client = None
_collection = None

COLLECTION_NAME = "manual_chunks"


def get_collection():
    global _client, _collection
    if _collection is None:
        import chromadb
        _client = chromadb.PersistentClient(path=CHROMA_DIR)
        _collection = _client.get_or_create_collection(
            name=COLLECTION_NAME, metadata={"hnsw:space": "cosine"}
        )
    return _collection


def add_chunks(ids, embeddings, metadatas, documents):
    col = get_collection()
    col.add(ids=ids, embeddings=embeddings, metadatas=metadatas, documents=documents)


def delete_manual(manual_id: str):
    col = get_collection()
    try:
        col.delete(where={"manualId": manual_id})
    except Exception:
        pass


def query(embedding, n_results=10, where=None):
    col = get_collection()
    kwargs = {"query_embeddings": [embedding], "n_results": n_results}
    if where:
        kwargs["where"] = where
    return col.query(**kwargs)
