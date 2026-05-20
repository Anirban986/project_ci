# services/extractor.py
import pymupdf as fitz  # newer versions of pymupdf
import base64

from config import settings

from google import genai
client = genai.Client(api_key=settings.GOOGLE_API_KEY)


def extract_from_pdf(file_path: str) -> list[dict]:
    """
    Extract text from a printed PDF using pymupdf.
    Returns a list of { page_number, text } dicts.
    """
    doc = fitz.open(file_path)
    pages = []

    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text("text").strip()
        if text:  # skip blank pages
            pages.append({
                "page_number": page_num + 1,
                "text": text,
            })

    doc.close()
    return pages


async def extract_from_image(file_path: str) -> list[dict]:
    """
    Extract text from a photographed lab report or scanned image
    using Gemini Vision. Returns same shape as extract_from_pdf
    so the rest of the pipeline is identical.
    """
    with open(file_path, "rb") as f:
        image_bytes = f.read()

    # Detect mime type from file extension
    ext = file_path.rsplit(".", 1)[-1].lower()
    mime_map = {
        "jpg":  "image/jpeg",
        "jpeg": "image/jpeg",
        "png":  "image/png",
        "webp": "image/webp",
    }
    mime_type = mime_map.get(ext, "image/jpeg")

    prompt = """
    You are a medical document OCR system.
    Extract ALL text from this medical report image exactly as it appears.
    Preserve:
    - All parameter names and their values
    - All reference ranges
    - All units
    - Table structure (use spacing to represent columns)
    - Section headers
    - Lab name, date, patient info if visible
    Do not summarize or interpret. Just extract the raw text faithfully.
    """

    response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=[
        {"mime_type": mime_type, "data": base64.b64encode(image_bytes).decode()},
        prompt,
    ]
)
    extracted_text = response.text.strip()

    # Return in the same shape as PDF extractor — single "page"
    return [{"page_number": 1, "text": extracted_text}]


async def extract_text(file_path: str, file_type: str) -> list[dict]:
    """
    Router function — picks the right extractor based on file type.
    Always returns list of { page_number, text }.
    """
    if file_type == "pdf":
        return extract_from_pdf(file_path)
    else:
        # image, webp, jpeg, png — all go through Gemini Vision
        return await extract_from_image(file_path)