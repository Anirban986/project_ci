'''uvicorn api.routes.app:app --reload --port 8000'''

from fastapi import FastAPI

app = FastAPI()

#using /health for health checks, so not including it in the router tags
@app.get("/health")
def health():
    return {"status": "ok", "service": "fastapi"}


@app.get("/")
def read_root():
    return {"message": "AI Service is running 🚀"}