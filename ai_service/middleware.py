# middleware.py
from fastapi import Header, HTTPException
from config import settings


async def verify_internal_key(x_internal_key: str = Header(...)):
    """
    Dependency injected into every route.
    Ensures only Express (with the shared secret) can call FastAPI.
    """
    if x_internal_key != settings.INTERNAL_API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")