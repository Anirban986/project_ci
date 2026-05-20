# routers/ingest.py
from fastapi import APIRouter, BackgroundTasks, Depends
from pydantic import BaseModel
from middleware import verify_internal_key
from services.downloader import download_file, cleanup
from services.extractor import extract_text
from services.chunker import chunk_pages
from services.embedder import embed_text
from services.analyser import analyse_report
from services.callback import notify_express
from repositories.chunks import save_chunks
from repositories.analyses import save_analysis

router = APIRouter(dependencies=[Depends(verify_internal_key)])


class IngestPayload(BaseModel):
    file_id:   int
    file_url:  str
    file_type: str    # 'pdf' | 'image'
    category:  str


@router.post("")
async def ingest_report(payload: IngestPayload, background_tasks: BackgroundTasks):
    """
    Accepts the file job from Express and returns 202 immediately.
    All heavy processing runs in the background.
    """
    background_tasks.add_task(run_ingest_pipeline, payload)
    return {"message": "Ingestion started", "file_id": payload.file_id}


async def run_ingest_pipeline(payload: IngestPayload):
    """
    Full RAG ingestion pipeline:
    Download → Extract → Chunk → Embed → Store → Analyse → Callback
    """
    ext_map  = {"pdf": ".pdf", "image": ".jpg"}
    suffix   = ext_map.get(payload.file_type, ".jpg")
    tmp_path = None

    try:
        # Stage 1: Download file from S3 to /tmp
        print(f"[ingest] Downloading file {payload.file_id}...")
        tmp_path = await download_file(payload.file_url, suffix)

        # Stage 2: Extract text (PDF → pymupdf, image → Gemini Vision)
        print(f"[ingest] Extracting text from {payload.file_type}...")
        pages = await extract_text(tmp_path, payload.file_type)

        if not pages:
            raise ValueError("No text could be extracted from the file")

        # Stage 3: Split into overlapping chunks
        print(f"[ingest] Chunking text...")
        chunks = chunk_pages(pages)

        # Stage 4: Embed each chunk
        print(f"[ingest] Embedding {len(chunks)} chunks...")
        embeddings = [embed_text(chunk["chunk_text"]) for chunk in chunks]

        # Stage 5: Store chunks + embeddings in PostgreSQL
        print(f"[ingest] Saving chunks to database...")
        save_chunks(payload.file_id, chunks, embeddings)

        # Stage 6: Run analysis (vector search + Gemini)
        print(f"[ingest] Analysing report...")
        analysis = await analyse_report(payload.file_id)

        # Stage 7: Store analysis result
        save_analysis(payload.file_id, analysis)

        # Stage 8: Notify Express — processing complete
        metadata = {
            "lab_name":    analysis.get("lab_name"),
            "test_date":   analysis.get("test_date"),
            "report_title":analysis.get("report_title"),
        }
        await notify_express(payload.file_id, "processed", metadata)
        print(f"[ingest] File {payload.file_id} processed successfully.")

    except Exception as e:
        print(f"[ingest] Pipeline failed for file {payload.file_id}: {e}")
        await notify_express(payload.file_id, "failed")

    finally:
        # Always clean up temp file
        cleanup(tmp_path)