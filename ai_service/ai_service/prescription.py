# routers/prescription.py
from fastapi import APIRouter, BackgroundTasks, Depends
from pydantic import BaseModel
from middleware import verify_internal_key
from services.downloader import download_file, cleanup
from services.prescription_extractor import extract_prescription
from services.callback import notify_express
from repositories.prescriptions import save_prescription

router = APIRouter(dependencies=[Depends(verify_internal_key)])


class PrescriptionPayload(BaseModel):
    file_id:   int
    file_url:  str
    file_type: str    # 'pdf' | 'image'
    category:  str


@router.post("")
async def extract_prescription_route(payload: PrescriptionPayload, background_tasks: BackgroundTasks):
    """
    Accepts the prescription job from Express and returns 202 immediately.
    Extraction runs in the background.
    """
    background_tasks.add_task(run_prescription_pipeline, payload)
    return {"message": "Extraction started", "file_id": payload.file_id}


async def run_prescription_pipeline(payload: PrescriptionPayload):
    """
    Prescription extraction pipeline:
    Download → Gemini Vision extraction → Store → Callback
    No chunking or RAG needed.
    """
    ext_map  = {"pdf": ".pdf", "image": ".jpg"}
    suffix   = ext_map.get(payload.file_type, ".jpg")
    tmp_path = None

    try:
        # Stage 1: Download file from S3 to /tmp
        print(f"[prescription] Downloading file {payload.file_id}...")
        tmp_path = await download_file(payload.file_url, suffix)

        # Stage 2: Gemini Vision extraction
        print(f"[prescription] Extracting prescription data...")
        extracted = await extract_prescription(tmp_path, payload.file_type)

        # Stage 3: Store in prescriptions table
        print(f"[prescription] Saving to database...")
        save_prescription(payload.file_id, extracted)

        # Stage 4: Notify Express — extraction complete
        await notify_express(payload.file_id, "extracted")
        print(f"[prescription] File {payload.file_id} extracted successfully.")

    except Exception as e:
        print(f"[prescription] Pipeline failed for file {payload.file_id}: {e}")
        await notify_express(payload.file_id, "failed")

    finally:
        # Always clean up temp file
        cleanup(tmp_path)