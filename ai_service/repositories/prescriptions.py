# repositories/prescriptions.py
import json
from database import execute


def save_prescription(file_id: str, extracted: dict):
    """
    Store the Gemini Vision extracted prescription data
    into the prescriptions table.
    """
    execute(
        """
        INSERT INTO prescriptions (file_id, extracted_json)
        VALUES (%s, %s)
        ON CONFLICT DO NOTHING
        """,
        (file_id, json.dumps(extracted)),
    )