# services/chunker.py

CHUNK_SIZE    = 500   # characters per chunk (approx ~125 tokens)
CHUNK_OVERLAP = 100   # overlap between consecutive chunks


def chunk_pages(pages: list[dict]) -> list[dict]:
    """
    Takes the list of { page_number, text } from the extractor
    and splits them into overlapping chunks.

    Returns list of:
    {
        chunk_index:  int,
        page_number:  int,
        chunk_text:   str,
    }
    """
    chunks = []
    chunk_index = 0

    for page in pages:
        text        = page["text"]
        page_number = page["page_number"]

        start = 0
        while start < len(text):
            end        = start + CHUNK_SIZE
            chunk_text = text[start:end].strip()

            if chunk_text:
                chunks.append({
                    "chunk_index":  chunk_index,
                    "page_number":  page_number,
                    "chunk_text":   chunk_text,
                })
                chunk_index += 1

            # Move forward by CHUNK_SIZE - CHUNK_OVERLAP for overlap
            start += CHUNK_SIZE - CHUNK_OVERLAP

    return chunks