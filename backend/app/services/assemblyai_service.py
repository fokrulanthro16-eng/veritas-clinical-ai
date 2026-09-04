"""AssemblyAI Real-Time Audio Streaming & Transcription Service.

Handles live bidirectional streaming with AssemblyAI's Real-Time STT WebSocket API.
Forwards incoming raw PCM audio chunks from the frontend client to AssemblyAI,
receives partial and final transcripts with sub-second latency, and emits structured
speaker-tagged dialogue events.
"""

import asyncio
import json
import logging
import base64
import websockets
import os
from pathlib import Path
from dotenv import load_dotenv
from typing import Callable, Optional, Dict, Any, List
from app.config import settings

# Ensure environment variables are loaded
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

logger = logging.getLogger("assemblyai_service")
logger.setLevel(logging.INFO)

ASSEMBLYAI_REALTIME_URL = "wss://streaming.assemblyai.com/v3/ws?sample_rate=16000"


class AssemblyAIStreamingSession:
    """Manages an active real-time streaming transcription session with AssemblyAI."""

    def __init__(self, api_key: str = None, on_transcript: Optional[Callable[[Dict[str, Any]], None]] = None):
        self.api_key = api_key or os.getenv("ASSEMBLYAI_API_KEY") or settings.ASSEMBLYAI_API_KEY
        self.on_transcript = on_transcript
        self.ws_client = None
        self.is_connected = False
        self.receive_task: Optional[asyncio.Task] = None
        self.current_speaker = "Doctor"
        self.speaker_turn_counter = 0

    async def connect(self):
        """Connect to AssemblyAI Real-Time Streaming WebSocket."""
        headers = {
            "Authorization": self.api_key
        }
        connect_kwargs = {
            "ping_interval": 20,
            "ping_timeout": 20
        }
        try:
            # Modern websockets (v13.0+) uses additional_headers
            self.ws_client = await websockets.connect(
                ASSEMBLYAI_REALTIME_URL,
                additional_headers=headers,
                **connect_kwargs
            )
        except TypeError:
            # Legacy websockets fallback
            self.ws_client = await websockets.connect(
                ASSEMBLYAI_REALTIME_URL,
                extra_headers=headers,
                **connect_kwargs
            )

        self.is_connected = True
        self.receive_task = asyncio.create_task(self._listen_loop())
        logger.info("Connected to AssemblyAI Real-Time Streaming STT service (Universal-3.5 Pro).")

    async def _listen_loop(self):
        """Listen for transcription events from AssemblyAI."""
        try:
            async for message in self.ws_client:
                data = json.loads(message)
                msg_type = data.get("type") or data.get("message_type")

                # Handle v3 'Begin' or v2 'SessionBegins'
                if msg_type in ("Begin", "SessionBegins"):
                    session_id = data.get("id") or data.get("session_id")
                    logger.info(f"AssemblyAI Session ID: {session_id}")

                # Handle v3 'Turn' (Universal-3.5 Pro)
                elif msg_type == "Turn":
                    text = data.get("transcript", "").strip()
                    end_of_turn = data.get("end_of_turn", False)
                    words = data.get("words", [])
                    speaker_label = data.get("speaker_label")

                    if text and self.on_transcript:
                        speaker = speaker_label or self._infer_speaker(text, advance_turn=end_of_turn)
                        if end_of_turn:
                            await self.on_transcript({
                                "type": "final_transcript",
                                "text": text,
                                "speaker": speaker,
                                "is_final": True,
                                "confidence": data.get("end_of_turn_confidence", 0.95),
                                "words": words
                            })
                        else:
                            await self.on_transcript({
                                "type": "partial_transcript",
                                "text": text,
                                "speaker": speaker,
                                "is_final": False,
                                "confidence": 0.85
                            })

                # Handle legacy v2 formats if present
                elif msg_type == "PartialTranscript":
                    text = data.get("text", "").strip()
                    if text and self.on_transcript:
                        speaker = self._infer_speaker(text)
                        await self.on_transcript({
                            "type": "partial_transcript",
                            "text": text,
                            "speaker": speaker,
                            "is_final": False,
                            "confidence": data.get("confidence", 0.85)
                        })
                elif msg_type == "FinalTranscript":
                    text = data.get("text", "").strip()
                    if text and self.on_transcript:
                        speaker = self._infer_speaker(text, advance_turn=True)
                        await self.on_transcript({
                            "type": "final_transcript",
                            "text": text,
                            "speaker": speaker,
                            "is_final": True,
                            "confidence": data.get("confidence", 0.95),
                            "words": data.get("words", [])
                        })
                elif msg_type in ("SessionTerminated", "Termination"):
                    logger.info("AssemblyAI Session Terminated.")
                    break
        except websockets.exceptions.ConnectionClosed:
            logger.info("AssemblyAI WebSocket connection closed.")
        except Exception as e:
            logger.error(f"Error in AssemblyAI receive loop: {e}")
        finally:
            self.is_connected = False

    def _infer_speaker(self, text: str, advance_turn: bool = False) -> str:
        """Heuristic speaker diarization for clinical dialogue."""
        lower = text.lower()
        # Doctor patterns: questions, exam commands, prescriptions, diagnostic queries
        doctor_triggers = [
            "how are you", "what brings you", "let's check", "i am prescribing",
            "take a deep breath", "your blood pressure", "i recommend", "do you feel",
            "let's order", "any allergies", "tell me about", "your a1c", "let's look at"
        ]
        # Patient patterns: answers, complaints, symptom descriptions, personal pronouns
        patient_triggers = [
            "i have been feeling", "my chest", "it hurts", "i take", "i noticed",
            "doc", "doctor", "no allergies", "yes i did", "every morning", "about two weeks"
        ]

        doc_score = sum(1 for trigger in doctor_triggers if trigger in lower)
        patient_score = sum(1 for trigger in patient_triggers if trigger in lower)

        speaker = self.current_speaker
        if doc_score > patient_score:
            speaker = "Doctor"
        elif patient_score > doc_score:
            speaker = "Patient"

        if advance_turn:
            self.current_speaker = speaker
        return speaker

    async def send_audio_chunk(self, pcm_chunk: bytes):
        """Send raw 16kHz 16-bit mono PCM audio chunk to AssemblyAI."""
        if not self.is_connected or not self.ws_client:
            return
        try:
            # AssemblyAI v3 supports raw binary PCM chunks directly, or JSON audio_data
            try:
                await self.ws_client.send(pcm_chunk)
            except Exception:
                payload = json.dumps({"audio_data": base64.b64encode(pcm_chunk).decode("utf-8")})
                await self.ws_client.send(payload)
        except Exception as e:
            logger.error(f"Error sending audio to AssemblyAI: {e}")

    async def close(self):
        """Close connection cleanly."""
        if self.ws_client and self.is_connected:
            try:
                # Terminate message for AssemblyAI v3 / v2
                await self.ws_client.send(json.dumps({"type": "Terminate", "terminate_session": True}))
                await self.ws_client.close()
            except Exception:
                pass
        if self.receive_task:
            self.receive_task.cancel()
        self.is_connected = False


# Clinical Presets for Instant Simulation / Live Testing
SIMULATED_CLINICAL_ENCOUNTERS = {
    "cardio_angina": [
        {"speaker": "Doctor", "text": "Good morning Mr. Davis. What brings you in to the cardiology clinic today?"},
        {"speaker": "Patient", "text": "Good morning doctor. I have been having this tight chest pain and angina whenever I walk up stairs for the last 3 weeks."},
        {"speaker": "Doctor", "text": "Let's check your vitals. Your blood pressure is 138/86 with a pulse of 76. Do you have shortness of breath or dizziness?"},
        {"speaker": "Patient", "text": "Yes, mild shortness of breath. And I am already taking Warfarin for my atrial fibrillation, plus over-the-counter Aspirin."},
        {"speaker": "Doctor", "text": "We need to address that immediately—taking Warfarin and Aspirin together creates a severe bleeding hazard. Let's stop the Aspirin and order an ECG and sublingual Nitroglycerin for the angina."}
    ],
    "diabetes_renal": [
        {"speaker": "Doctor", "text": "Hello Mrs. Taylor, let's review your Type 2 Diabetes management and recent labs."},
        {"speaker": "Patient", "text": "Hi Doctor. My morning fasting blood sugar has been high, around 185 mg/dL. I'm taking Metformin 1000mg."},
        {"speaker": "Doctor", "text": "Your latest eGFR indicates stage 3 chronic kidney disease. We also have you scheduled for a contrast CT scan next Tuesday."},
        {"speaker": "Patient", "text": "Should I still take my Metformin before the scan?"},
        {"speaker": "Doctor", "text": "No, Metformin with iodinated contrast increases the risk of lactic acidosis. We must hold the Metformin 48 hours prior to the scan."}
    ],
    "hypertension_polypharmacy": [
        {"speaker": "Doctor", "text": "Welcome back. How has your essential hypertension been responding to the Lisinopril?"},
        {"speaker": "Patient", "text": "My blood pressure is around 145/92, and a nutritionist suggested I start high-dose potassium supplements."},
        {"speaker": "Doctor", "text": "Please hold off on the potassium supplement. Lisinopril spares potassium and combining them can cause severe hyperkalemia."}
    ]
}
