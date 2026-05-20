# services/callback.py
import httpx
from config import settings


async def notify_express(file_id: str, status: str, metadata: dict = {}):
    """
    Calls back to Express PATCH /files/:id/status
    after processing is complete or failed.
    Uses the shared INTERNAL_API_KEY for auth.
    """
    url     = f"{settings.EXPRESS_BASE_URL}/files/{file_id}/status"
    payload = {"status": status, "metadata": metadata}
    headers = {"X-Internal-Key": settings.INTERNAL_API_KEY}

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.patch(url, json=payload, headers=headers)
            response.raise_for_status()
            print(f"[callback] Notified Express: file {file_id} → {status}")
    except Exception as e:
        # Log but don't crash — the processing is already done
        print(f"[callback] Failed to notify Express for file {file_id}: {e}")