# repositories/chunks.py
from database import execute, fetch_all


def save_chunks(file_id: str, chunks: list[dict], embeddings: list[list[float]]):
    """
    Bulk insert chunks + their embeddings into report_chunks.
    chunks: list of { chunk_index, page_number, chunk_text }
    embeddings: list of 768-dim float vectors, same order as chunks
    """
    for chunk, embedding in zip(chunks, embeddings):
        execute(
            """
            INSERT INTO report_chunks
              (file_id, chunk_text, chunk_index, page_number, embedding)
            VALUES (%s, %s, %s, %s, %s::vector)
            """,
            (
                file_id,
                chunk["chunk_text"],
                chunk["chunk_index"],
                chunk.get("page_number"),
                str(embedding),   # pgvector accepts Python list as string '[0.1, 0.2, ...]'
            ),
        )


def get_similar_chunks(file_id: str, query_embedding: list[float], top_k: int = 6) -> list[dict]:
    """
    Retrieve top_k most similar chunks for a given file
    using pgvector cosine similarity search.
    Filtered by file_id so we only search within this report.
    """
    rows = fetch_all(
        """
        SELECT id, chunk_text,
               1 - (embedding <=> %s::vector) AS similarity
        FROM report_chunks
        WHERE file_id = %s
        ORDER BY embedding <=> %s::vector
        LIMIT %s
        """,
        (str(query_embedding), file_id, str(query_embedding), top_k),
    )
    return [dict(row) for row in rows]