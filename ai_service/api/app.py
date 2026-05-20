'''uvicorn api.routes.app:app --reload --port 8000'''
from routers.ingest       import router as ingest
from routers.prescription import router as prescription
from config import settings
from fastapi import FastAPI

app = FastAPI(
    title="Telemedicine RAG Server",
    version="1.0.0",
)

# Register routers
app.include_router(ingest,        prefix="/ingest",               tags=["Health Reports"])
app.include_router(prescription,  prefix="/extract-prescription", tags=["Prescriptions"])

#using /health for health checks, so not including it in the router tags
@app.get("/health")
def health():
    return {"status": "ok", "service": "fastapi"}


@app.get("/")
def read_root():
    return {"message": "AI Service is running 🚀"}