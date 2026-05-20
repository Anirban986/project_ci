# repositories/analyses.py
import json
from database import execute


def save_analysis(file_id: str, analysis: dict):
    """
    Store the structured Gemini analysis output into report_analyses.
    Extracts top-level fields for easy querying; full JSON stored in findings_json.
    """
    execute(
        """
        INSERT INTO report_analyses
          (file_id, report_title, urgency_level, summary, findings_json)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT DO NOTHING
        """,
        (
            file_id,
            analysis.get("report_title"),
            analysis.get("urgency_level"),
            analysis.get("summary"),
            json.dumps(analysis),
        ),
    )