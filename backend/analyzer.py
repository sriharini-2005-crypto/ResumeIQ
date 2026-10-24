
import json
import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError(
        "GEMINI_API_KEY is missing. Check your backend .env file."
    )

client = genai.Client(api_key=api_key)


def analyze_resume(resume_text: str) -> dict:
    """Analyze resume text and return structured JSON data."""

    if not resume_text or not resume_text.strip():
        raise ValueError("Resume text cannot be empty.")

    resume_text = resume_text[:20000]

    prompt = f"""
You are ResumeIQ, a professional resume analysis assistant.

Analyze the following resume and return ONLY valid JSON.
Do not include Markdown code fences or text outside the JSON.

Use this exact JSON structure:

{{
  "professional_summary": "A concise summary based only on the resume",
  "technical_skills": {{
    "programming_languages": [],
    "databases_and_vector_stores": [],
    "ai_and_machine_learning": [],
    "frameworks_and_tools": []
  }},
  "education": [
    {{
      "degree": "",
      "institution": "",
      "duration": "",
      "grade": ""
    }}
  ],
  "experience": [
    {{
      "role": "",
      "organization": "",
      "duration": "",
      "responsibilities": []
    }}
  ],
  "projects": [
    {{
      "name": "",
      "description": "",
      "technologies": [],
      "outcome": ""
    }}
  ],
  "certifications": [],
  "awards": [],
  "strengths": [],
  "skills_to_improve": [],
  "improvement_suggestions": [],
  "resume_score": {{
    "score": 0,
    "max_score": 100,
    "reason": ""
  }},
  "overall_feedback": ""
}}

Rules:
- Use the resume as the source of truth.
- Do not invent qualifications, dates, achievements, or skills.
- Use empty arrays when information is unavailable.
- Use null for unavailable individual values where appropriate.
- Recommendations must be constructive and relevant to the candidate.
- Score the resume using completeness, clarity, relevance,
  project evidence, and presentation as the criteria.
- Explain the score briefly; do not imply that it is an official ATS score.
- Return valid JSON with the exact field names shown above.

RESUME:
{resume_text}
"""

    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=prompt,
        config={
            "response_mime_type": "application/json"
        },
    )

    if not response.text:
        raise ValueError("Gemini returned an empty analysis.")

    try:
        result = json.loads(response.text)
    except json.JSONDecodeError as exc:
        raise ValueError(
            "Gemini returned an invalid JSON response. Please try again."
        ) from exc

    if not isinstance(result, dict):
        raise ValueError("Gemini returned an unexpected response format.")

    return result

