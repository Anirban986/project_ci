# services/prescription_extractor.py
import base64
import json

from config import settings

from google import genai
client = genai.Client(api_key=settings.GOOGLE_API_KEY)


async def extract_prescription(file_path: str, file_type: str) -> dict:
    """
    Uses Gemini Vision to extract structured data from a
    handwritten or printed prescription image/PDF.
    Returns structured JSON — no RAG needed.
    """

    prompt = """
You are a medical prescription reader.
Extract all information from this prescription image and return ONLY a valid JSON object.
No markdown, no explanation, just the JSON.

Return this exact structure:
{
  "doctor_name": "doctor's name if visible, else null",
  "clinic_name": "clinic or hospital name if visible, else null",
  "prescription_date": "date if visible, else null",
  "patient_name": "patient name if visible, else null",
  "medicines": [
    {
      "name": "medicine name",
      "dosage": "e.g. 500mg",
      "frequency": "e.g. twice daily",
      "duration": "e.g. 7 days",
      "instructions": "e.g. after meals, else null"
    }
  ],
  "recommended_tests": ["test 1", "test 2"],
  "advice": ["advice point 1", "advice point 2"],
  "doctor_notes": "any additional notes written by the doctor, else null",
  "follow_up_date": "follow up date if mentioned, else null"
}
"""

    # Read file bytes
    with open(file_path, "rb") as f:
        file_bytes = f.read()

    # Determine mime type
    ext = file_path.rsplit(".", 1)[-1].lower()
    mime_map = {
        "pdf":  "application/pdf",
        "jpg":  "image/jpeg",
        "jpeg": "image/jpeg",
        "png":  "image/png",
        "webp": "image/webp",
    }
    mime_type = mime_map.get(ext, "image/jpeg")

    response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=[
        {"mime_type": mime_type, "data": base64.b64encode(file_bytes).decode()},
        prompt,
    ]
)
    raw = response.text.strip()

    # Strip markdown fences if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # Return minimal safe fallback
        return {
            "medicines":          [],
            "recommended_tests":  [],
            "advice":             [],
            "doctor_notes":       raw,
            "follow_up_date":     None,
        }