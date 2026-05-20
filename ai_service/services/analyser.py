# services/analyser.py
import json
from config import settings
from services.embedder import embed_query
from repositories.chunks import get_similar_chunks

from google import genai
client = genai.Client(api_key=settings.GOOGLE_API_KEY)

# Pre-defined analytical queries run automatically on every report
ANALYTICAL_QUERIES = [
    "What are the abnormal or out of range values in this report?",
    "What do these test results indicate about the patient's health?",
    "What is the overall health assessment based on this report?",
    "What follow-up actions or treatments are recommended?",
]

TOP_K = 6  # number of similar chunks to retrieve per query


async def analyse_report(file_id: int) -> dict:
    """
    Runs 4 pre-defined analytical queries against stored chunks,
    retrieves similar chunks via pgvector, feeds them to Gemini,
    and returns a structured JSON analysis.
    """

    # Step 1: Collect relevant chunks for all queries
    all_chunks = []
    seen_ids   = set()

    for query in ANALYTICAL_QUERIES:
        query_embedding = embed_query(query)
        chunks          = get_similar_chunks(file_id, query_embedding, top_k=TOP_K)

        for chunk in chunks:
            if chunk["id"] not in seen_ids:
                all_chunks.append(chunk["chunk_text"])
                seen_ids.add(chunk["id"])

    context = "\n\n---\n\n".join(all_chunks)

    # Step 2: Build prompt and call Gemini
    prompt = f"""
You are a medical AI assistant helping patients understand their lab reports.
Analyze the following lab report content and return a structured JSON response.

LAB REPORT CONTENT:
{context}

Return ONLY a valid JSON object with this exact structure, no markdown, no explanation:
{{
  "report_title": "name of the test or report",
  "test_date": "date if found, else null",
  "lab_name": "lab name if found, else null",
  "urgency_level": "low | moderate | high | critical",
  "summary": "2-3 sentence summary of the overall report",
  "layman_summary": "explain the same summary in simple non-medical language a patient can understand",
  "sections": [
    {{
      "section_name": "name of test panel e.g. Complete Blood Count",
      "findings": [
        {{
          "parameter": "parameter name",
          "value": "reported value",
          "unit": "unit of measurement",
          "reference_range": "normal range",
          "status": "normal | low | high | critical",
          "interpretation": "one sentence plain language explanation"
        }}
      ]
    }}
  ],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "disclaimer": "This analysis is AI-generated and should not replace professional medical advice."
}}
"""

    response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=prompt,
)
    raw = response.text.strip()

    # Strip markdown fences if Gemini wraps the JSON
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # Return a safe fallback so the pipeline doesn't crash
        return {
            "report_title":   "Lab Report",
            "urgency_level":  "low",
            "summary":        raw,
            "layman_summary": raw,
            "sections":       [],
            "recommendations":[],
            "disclaimer":     "This analysis is AI-generated and should not replace professional medical advice.",
        }