# services/downloader.py
import httpx
import os
import tempfile
from pathlib import Path


async def download_file(file_url: str, suffix: str) -> str:
    """
    Streams a file from S3 URL into a temp file on disk.
    Returns the local path. Caller is responsible for deleting it.

    suffix: file extension e.g. '.pdf', '.jpg'
    """
    tmp_path = os.path.join(tempfile.gettempdir(), f"tele_{os.urandom(8).hex()}{suffix}")

    async with httpx.AsyncClient(timeout=60.0) as client:
        async with client.stream("GET", file_url) as response:
            response.raise_for_status()
            with open(tmp_path, "wb") as f:
                async for chunk in response.aiter_bytes(chunk_size=8192):
                    f.write(chunk)

    return tmp_path


def cleanup(file_path: str):
    """Delete the temp file after processing — always call this in a finally block."""
    try:
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        print(f"[downloader] Failed to clean up {file_path}: {e}")