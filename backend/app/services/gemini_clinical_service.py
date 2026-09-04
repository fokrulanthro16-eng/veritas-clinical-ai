"""Google Gemini Clinical Reasoning & Intelligence Engine.

Provides deep LLM clinical reasoning, high-precision SOAP note synthesis,
differential diagnosis extraction, and pharmacology contraindication analysis
via Gemini 2.0 / 1.5 Flash structured outputs.
"""

import json
import logging
import httpx
from typing import Dict, Any, List, Optional
from app.config import settings

logger = logging.getLogger("gemini_clinical_service")
logger.setLevel(logging.INFO)

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"


class GeminiClinicalService:
    """Interface to Google Gemini for real-time ambient clinical reasoning."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY

    async def analyze_clinical_encounter(self, transcript: str) -> Optional[Dict[str, Any]]:
        """
        Analyze dialogue transcript using Gemini for advanced clinical reasoning,
        ICD-10 coding, pharmacology contraindications, and SOAP generation.
        """
        if not self.api_key or len(self.api_key) < 10:
            logger.warning("Gemini API key is not configured.")
            return None

        prompt = f"""You are Veritas Clinical AI, an expert board-certified clinical intelligence engine.
Analyze the following patient-physician ambient encounter transcript and output a strict JSON object:

ENCOUNTER TRANSCRIPT:
{transcript}

OUTPUT JSON SCHEMA:
{{
  "subjective": {{
    "chief_complaint": "string",
    "history_of_present_illness": "string",
    "review_of_systems": "string"
  }},
  "objective": {{
    "vitals": {{
      "blood_pressure": "string",
      "heart_rate": "string",
      "respiratory_rate": "string",
      "oxygen_saturation": "string",
      "temperature": "string",
      "bmi": "string"
    }},
    "physical_exam": ["string"]
  }},
  "assessment": {{
    "clinical_summary": "string",
    "differential_diagnoses": [
      {{
        "primary_icd10": "string (e.g. I20.9)",
        "description": "string",
        "confidence": 0.95,
        "category": "string"
      }}
    ]
  }},
  "plan": {{
    "medications": ["string"],
    "orders_and_diagnostics": ["string"],
    "lifestyle_interventions": "string",
    "follow_up": "string"
  }},
  "drug_safety_flags": [
    {{
      "severity": "CRITICAL | HIGH | MODERATE",
      "title": "string",
      "drugs_involved": ["string"],
      "mechanism": "string",
      "recommendation": "string"
    }}
  ],
  "mdm_complexity_tier": "Level 2 | Level 3 | Level 4 | Level 5"
}}

Respond ONLY with valid JSON. Do not include markdown formatting or markdown codeblocks."""

        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": self.api_key
        }
        params = {
            "key": self.api_key
        }
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.1,
                "responseMimeType": "application/json",
                "maxOutputTokens": 8192,
                "thinkingConfig": {
                    "thinkingBudget": 512
                }
            },
            "safetySettings": [
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_CIVIC_INTEGRITY", "threshold": "BLOCK_NONE"}
            ]
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(GEMINI_API_URL, params=params, json=payload, headers=headers)
                
                if response.status_code == 200:
                    data = response.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        content_text = candidates[0]["content"]["parts"][0]["text"]
                        # Clean if needed
                        content_text = content_text.strip()
                        if content_text.startswith("```json"):
                            content_text = content_text[7:]
                        if content_text.endswith("```"):
                            content_text = content_text[:-3]
                        parsed_json = json.loads(content_text.strip())
                        logger.info("Successfully extracted clinical reasoning via Google Gemini.")
                        return parsed_json
                else:
                    logger.warning(f"Gemini API returned status {response.status_code}: {response.text}")
                    return None
        except Exception as e:
            logger.error(f"Error invoking Gemini Clinical Reasoning Engine: {e}")
            return None


gemini_service = GeminiClinicalService()
