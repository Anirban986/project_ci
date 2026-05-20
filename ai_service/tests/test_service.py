import pytest
from unittest.mock import patch, MagicMock
from services.chunker import chunk_pages


# ── Chunker ──────────────────────────────────────────────────────────────────

def test_chunk_pages_basic():
    pages = [{"page_number": 1, "text": "Hello world " * 100}]
    chunks = chunk_pages(pages)
    assert len(chunks) > 0
    assert all("chunk_text" in c for c in chunks)
    assert all("chunk_index" in c for c in chunks)
    assert all("page_number" in c for c in chunks)


def test_chunk_pages_empty():
    chunks = chunk_pages([])
    assert chunks == []


def test_chunk_pages_preserves_page_number():
    pages = [
        {"page_number": 1, "text": "Page one content " * 50},
        {"page_number": 2, "text": "Page two content " * 50},
    ]
    chunks = chunk_pages(pages)
    page_numbers = {c["page_number"] for c in chunks}
    assert 1 in page_numbers
    assert 2 in page_numbers


def test_chunk_index_is_sequential():
    pages = [{"page_number": 1, "text": "Text " * 200}]
    chunks = chunk_pages(pages)
    indices = [c["chunk_index"] for c in chunks]
    assert indices == list(range(len(chunks)))


# ── Prescription extractor output shape ─────────────────────────────────────

def test_prescription_json_fallback():
    from services.prescription_extractor import extract_prescription
    import asyncio

    with patch("services.prescription_extractor.client") as mock_client:
        mock_response      = MagicMock()
        mock_response.text = "invalid json {"
        mock_client.models.generate_content.return_value = mock_response

        result = asyncio.run(extract_prescription("/fake/path.jpg", "image"))

    assert "medicines"         in result
    assert "recommended_tests" in result
    assert "advice"            in result