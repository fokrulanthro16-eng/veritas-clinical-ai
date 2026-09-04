"""FastAPI Main Application for Veritas Clinical AI V2 (Enterprise Production Edition).

Features:
- Live Clinical Streaming WebSocket (/ws/clinical-stream)
- Clinical Scenarios Engine (Cardiology CPT 99215, Diabetes CPT 99214, Telehealth Denial Demo)
- Payer Denial Auto-Mitigation with Google Gemini
- Clinical Voice Co-Pilot CDS Query Engine
- HL7 FHIR R4 Bundle & ANSI ASC X12 837P Clearinghouse Claims
- Deterministic AMA/CMS MDM Coding & RxNorm Safety Sentinel
"""

import asyncio
import json
import logging
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.config import settings
from app.services.clinical_tools import (
    lookup_icd10,
    check_drug_interaction,
    generate_soap_note,
    CLINICAL_TOOLS_SCHEMA,
    ICD10_DATABASE
)
from app.services.em_coding_engine import EMCodingEngine
from app.services.denial_radar import DenialRadar
from app.services.clinical_sentinel import ClinicalSentinel
from app.services.fhir_exporter import FHIRExporter
from app.services.rcm_engine import RCMEngine
from app.services.assemblyai_service import (
    AssemblyAIStreamingSession,
    SIMULATED_CLINICAL_ENCOUNTERS
)
from app.services.gemini_clinical_service import gemini_service
from app.services.clinical_scenarios import (
    get_all_scenarios,
    get_scenario_by_id,
    CLINICAL_SCENARIOS
)
from app.services.clinical_copilot import ClinicalCopilot

# Logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("veritas_api")

app = FastAPI(
    title="Veritas Clinical AI Platform V2 (Enterprise)",
    description="Ambient Clinical Intelligence, Autonomous RCM, & Payer Denial Auto-Mitigation",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
@app.get("/health")
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Veritas Clinical AI Platform",
        "version": "5.0.0",
        "assemblyai_configured": bool(settings.ASSEMBLYAI_API_KEY),
        "gemini_configured": bool(settings.GEMINI_API_KEY)
    }


from app.services.voice_agent import VoiceAgentEngine, VOICE_AGENT_TOOLS_SCHEMA
from app.services.cms1500_generator import CMS1500Generator
from app.services.vision_analyzer import VisionAnalyzer
from app.services.prior_auth import PriorAuthEngine
from app.services.cds_safety import CDSSafetyEngine
from app.services.longitudinal_memory import LongitudinalMemoryEngine
from app.services.clearinghouse_gateway import ClearinghouseGateway
from app.services.medico_legal_airlock import MedicoLegalAirlockEngine

# Request Models
class ICDLookupRequest(BaseModel):
    symptom_or_diagnosis: str



class DrugCheckRequest(BaseModel):
    medications: List[str]


class SoapRequest(BaseModel):
    transcript: str


class FHIRExportRequest(BaseModel):
    transcript: str
    icd_codes: Optional[List[Dict[str, Any]]] = None
    medications: Optional[List[str]] = None


class MitigateDenialRequest(BaseModel):
    transcript: str
    flag_id: str
    soap_note: Optional[Dict[str, Any]] = None


class CopilotQueryRequest(BaseModel):
    query: str
    context: Optional[str] = None


class AgentCommandRequest(BaseModel):
    command: str
    transcript: Optional[str] = ""
    soap_note: Optional[Dict[str, Any]] = None
    denial_radar: Optional[Dict[str, Any]] = None


class VisionAnalysisRequest(BaseModel):
    image_data: Optional[str] = None
    image_type: str = "ecg"
    clinical_context: Optional[str] = ""


class PriorAuthGenerateRequest(BaseModel):
    patient_info: Optional[Dict[str, Any]] = None
    soap_note: Optional[Dict[str, Any]] = None
    service_name: str = "Urgent Left Heart Cardiac Catheterization & Coronary Angiography"
    cpt_code: str = "93458"
    icd_codes: Optional[List[Dict[str, Any]]] = None


class PriorAuthSubmitRequest(BaseModel):
    prior_auth_package: Dict[str, Any]


class CDSSafetyRequest(BaseModel):
    medications: Optional[List[str]] = None
    patient_context: Optional[Dict[str, Any]] = None
    diagnoses: Optional[List[str]] = None


# V5 Request Models
class Generate837PRequest(BaseModel):
    patient_context: Optional[Dict[str, Any]] = None
    cpt_code: str = "99215"
    icd_codes: Optional[List[Dict[str, Any]]] = None
    total_reimbursement: float = 446.00


class Transmit837PRequest(BaseModel):
    edi_payload: Optional[str] = None


class DraftAppealRequest(BaseModel):
    denial_reason: Optional[str] = None
    patient_context: Optional[Dict[str, Any]] = None
    cpt_code: str = "99215"
    transcript_snippet: Optional[str] = None


class AirlockAuditRequest(BaseModel):
    transcript_text: str = ""
    patient_context: Optional[Dict[str, Any]] = None
    active_medications: Optional[List[str]] = None
    known_allergies: Optional[List[str]] = None
    active_egfr: float = 58.0


# REST Endpoints
@app.get("/api/health")
async def health_check():
    has_assembly_key = bool(settings.ASSEMBLYAI_API_KEY and len(settings.ASSEMBLYAI_API_KEY) > 10)
    has_gemini_key = bool(settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY) > 10)
    return {
        "status": "healthy",
        "service": "Veritas Clinical AI V5 Enterprise (Institutional Core & Medico-Legal Airlock)",
        "version": "5.0.0",
        "assemblyai_configured": has_assembly_key,
        "gemini_configured": has_gemini_key,
        "environment": settings.ENVIRONMENT,
        "capabilities": [
            "LONGITUDINAL_PATIENT_MEMORY_TRAJECTORY",
            "MEDICO_LEGAL_AIRLOCK_INTERCEPTOR",
            "CLEARINGHOUSE_ANSI_837P_GATEWAY",
            "STATUTORY_DENIAL_APPEAL_ENGINE",
            "MULTIMODAL_CLINICAL_VISION_AI",
            "PRIOR_AUTH_AUTO_PILOT_ENGINE",
            "CDS_PHARMACOLOGY_SAFETY_ENGINE",
            "AMA_CMS_MDM_ENGINE",
            "PRE_CLAIM_DENIAL_RADAR",
            "DENIAL_AUTO_MITIGATION_AI",
            "CLINICAL_VOICE_COPILOT",
            "AUTONOMOUS_VOICE_AGENT_TOOL_CALLING",
            "CMS_1500_CLAIM_FORM_GENERATOR",
            "HL7_FHIR_R4_BUNDLE_EXPORTER",
            "ANSI_ASC_X12_837P_EDI",
            "RXNORM_SAFETY_SENTINEL",
            "ASSEMBLYAI_REALTIME_STREAMING",
            "GOOGLE_GEMINI_CLINICAL_REASONING",
            "CLINICAL_SCENARIO_ENGINE"
        ]
    }


# V5 Enterprise Endpoints
@app.get("/api/patient/{patient_id}/longitudinal-trajectory")
async def api_get_longitudinal_trajectory(patient_id: str):
    """Fetch multi-encounter longitudinal history, biomarker deltas, and predictive risk matrix."""
    return LongitudinalMemoryEngine.get_trajectory(patient_id)


@app.post("/api/rcm/generate-837p")
async def api_generate_837p(req: Generate837PRequest):
    """Generate ANSI ASC X12N 837P (005010X222A1) EDI Professional Claim segments."""
    return ClearinghouseGateway.generate_837p_transaction(
        patient_context=req.patient_context,
        cpt_code=req.cpt_code,
        icd_codes=req.icd_codes,
        total_reimbursement=req.total_reimbursement
    )


@app.post("/api/rcm/transmit-837p")
async def api_transmit_837p(req: Transmit837PRequest):
    """Transmit 837P transaction to Optum / Change Healthcare clearinghouse gateway."""
    return ClearinghouseGateway.transmit_837p(req.edi_payload)


@app.post("/api/rcm/draft-appeal")
async def api_draft_appeal(req: DraftAppealRequest):
    """Generate an official citation-backed Medico-Legal Denial Appeal Brief quoting AMA CPT 2024."""
    return ClearinghouseGateway.draft_denial_appeal(
        denial_reason=req.denial_reason or "CO-16: Modifier 25 disallowed without documentation of separate identifiable clinical encounter.",
        patient_context=req.patient_context,
        cpt_code=req.cpt_code,
        transcript_snippet=req.transcript_snippet
    )


@app.post("/api/clinical/airlock-audit")
async def api_airlock_audit(req: AirlockAuditRequest):
    """Real-time zero-latency contradiction scanner checking dialogue against allergies & black-box warnings."""
    return MedicoLegalAirlockEngine.audit_airlock(
        transcript_text=req.transcript_text,
        patient_context=req.patient_context,
        active_medications=req.active_medications,
        known_allergies=req.known_allergies,
        active_egfr=req.active_egfr
    )



@app.post("/api/clinical/analyze-image")
async def api_analyze_image(req: VisionAnalysisRequest):
    """Multimodal Clinical Vision: Analyze ECG strips or Lab panels with Gemini Vision."""
    return await VisionAnalyzer.analyze_image(
        image_data=req.image_data,
        image_type=req.image_type,
        clinical_context=req.clinical_context
    )


@app.post("/api/prior-auth/generate")
async def api_generate_prior_auth(req: PriorAuthGenerateRequest):
    """Generate electronic Prior Authorization (ePA) package with clinical justification."""
    return PriorAuthEngine.generate_prior_auth_package(
        patient_info=req.patient_info,
        soap_note=req.soap_note,
        service_name=req.service_name,
        cpt_code=req.cpt_code,
        icd_codes=req.icd_codes
    )


@app.post("/api/prior-auth/submit")
async def api_submit_prior_auth(req: PriorAuthSubmitRequest):
    """Submit Prior Authorization package to Payer Gateway for instant clearance."""
    return PriorAuthEngine.submit_prior_auth(req.prior_auth_package)


@app.post("/api/cds/audit-safety")
async def api_audit_cds_safety(req: CDSSafetyRequest):
    """Audit active medications and compute Bleeding and Myopathy Risk Indices."""
    return CDSSafetyEngine.audit_safety(
        medications=req.medications,
        patient_context=req.patient_context,
        diagnoses=req.diagnoses
    )


@app.post("/api/agent/command")
async def api_agent_command(req: AgentCommandRequest):
    """Execute conversational commands and dispatch autonomous tools."""
    return await VoiceAgentEngine.process_command(
        command_text=req.command,
        transcript=req.transcript or "",
        soap_note=req.soap_note,
        denial_radar=req.denial_radar
    )


@app.get("/api/export/cms-1500")
async def api_export_cms1500(cpt: str = "99215", charges: float = 446.00):
    """Generate official standard CMS-1500 box mappings."""
    engine = RCMEngine()
    return CMS1500Generator.generate_form_data(
        patient_info=engine.patient_context,
        icd_codes=[
            {"primary_icd10": "I20.0", "description": "Unstable angina (acute coronary syndrome)"},
            {"primary_icd10": "I10", "description": "Essential (primary) hypertension"},
            {"primary_icd10": "E11.40", "description": "Type 2 diabetes with diabetic neuropathy"}
        ],
        recommended_cpt=cpt,
        total_charges=charges
    )


@app.get("/api/scenarios")
async def api_get_scenarios():
    """Returns all V2 pre-configured clinical encounters."""
    return {"scenarios": get_all_scenarios()}


@app.post("/api/scenarios/{scenario_id}/run")
async def api_run_scenario(scenario_id: str):
    """Run and evaluate a clinical scenario immediately."""
    scenario = get_scenario_by_id(scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")

    engine = RCMEngine()
    if "mrn" in scenario:
        engine.patient_context["mrn"] = scenario["mrn"]
        engine.patient_context["payer"] = scenario["payer"]

    for turn in scenario["dialogue"]:
        state = engine.process_turn(turn["speaker"], turn["text"])

    return {
        "scenario": scenario,
        "state": engine.get_state()
    }


@app.post("/api/clinical/mitigate-denial")
async def api_mitigate_denial(req: MitigateDenialRequest):
    """Auto-mitigate a specific payer denial flag by injecting clinical documentation."""
    return DenialRadar.auto_mitigate_denial(
        transcript=req.transcript,
        flag_id=req.flag_id,
        soap_note=req.soap_note
    )


@app.post("/api/copilot/query")
async def api_copilot_query(req: CopilotQueryRequest):
    """Query the Clinical Voice Co-Pilot."""
    return await ClinicalCopilot.answer_query(req.query, req.context)


@app.get("/api/tools/schema")
async def get_tools_schema():
    return {
        "schemas": CLINICAL_TOOLS_SCHEMA,
        "supported_icd_count": len(ICD10_DATABASE),
        "em_codes": EMCodingEngine.EM_CODE_CATALOG
    }


@app.post("/api/tools/lookup-icd10")
async def api_lookup_icd10(req: ICDLookupRequest):
    return lookup_icd10(req.symptom_or_diagnosis)


@app.post("/api/tools/check-drug-interaction")
async def api_check_drug_interaction(req: DrugCheckRequest):
    return check_drug_interaction(req.medications)


@app.post("/api/tools/generate-soap")
async def api_generate_soap(req: SoapRequest):
    return generate_soap_note(req.transcript)


@app.post("/api/clinical/gemini-reasoning")
async def api_gemini_reasoning(req: SoapRequest):
    """Deep clinical reasoning and SOAP extraction via Google Gemini."""
    result = await gemini_service.analyze_clinical_encounter(req.transcript)
    if not result:
        result = generate_soap_note(req.transcript)
    return result


@app.post("/api/export/fhir")
async def api_export_fhir(req: FHIRExportRequest):
    """Generate HL7 FHIR R4 standard JSON bundle."""
    engine = RCMEngine()
    soap = generate_soap_note(req.transcript)
    icds = req.icd_codes or [lookup_icd10("angina")]
    meds = req.medications or ["warfarin", "aspirin"]
    mdm = EMCodingEngine.compute_mdm_code(icds, meds, [], req.transcript)
    
    bundle = FHIRExporter.generate_fhir_r4_bundle(
        patient_info=engine.patient_context,
        soap_note=soap,
        icd_codes=icds,
        medications=meds,
        recommended_cpt=mdm["recommended_cpt"],
        claim_amount=mdm["estimated_reimbursement_usd"]
    )
    return bundle


@app.post("/api/export/edi-837p")
async def api_export_edi_837p(req: FHIRExportRequest):
    """Generate ANSI ASC X12 837P professional billing claim string."""
    engine = RCMEngine()
    icds = req.icd_codes or [lookup_icd10("angina")]
    meds = req.medications or ["warfarin", "aspirin"]
    mdm = EMCodingEngine.compute_mdm_code(icds, meds, [], req.transcript)

    edi_text = FHIRExporter.generate_edi_837p(
        patient_info=engine.patient_context,
        icd_codes=icds,
        recommended_cpt=mdm["recommended_cpt"],
        claim_amount=mdm["estimated_reimbursement_usd"]
    )
    return Response(content=edi_text, media_type="text/plain")


@app.get("/api/presets")
async def get_clinical_presets():
    return {"presets": get_all_scenarios()}


# WebSocket Endpoint for Live Clinical Streaming
@app.websocket("/ws/clinical-stream")
async def clinical_stream_websocket(websocket: WebSocket):
    await websocket.accept()
    logger.info("New clinical stream WebSocket connection established.")

    rcm_engine = RCMEngine()
    assembly_session: Optional[AssemblyAIStreamingSession] = None
    simulation_task: Optional[asyncio.Task] = None

    async def broadcast_transcript(event: Dict[str, Any]):
        try:
            await websocket.send_json(event)
            if event.get("is_final"):
                speaker = event.get("speaker", "Clinician")
                text = event.get("text", "")
                rcm_state = rcm_engine.process_turn(speaker, text)
                await websocket.send_json(rcm_state)
        except Exception as e:
            logger.error(f"Error broadcasting transcript: {e}")

    async def run_scenario_stream(scenario_id: str):
        scenario = get_scenario_by_id(scenario_id) or CLINICAL_SCENARIOS["cardiology_high_complexity"]
        dialogue = scenario["dialogue"]

        if "mrn" in scenario:
            rcm_engine.patient_context["mrn"] = scenario["mrn"]
            rcm_engine.patient_context["payer"] = scenario["payer"]

        await websocket.send_json({
            "type": "system",
            "message": f"Starting encounter stream: {scenario['title']}"
        })

        for turn in dialogue:
            speaker = turn["speaker"]
            full_text = turn["text"]
            words = full_text.split()

            # Stream partial words
            for i in range(1, len(words) + 1, max(1, len(words) // 4)):
                partial_text = " ".join(words[:i])
                await websocket.send_json({
                    "type": "partial_transcript",
                    "speaker": speaker,
                    "text": partial_text,
                    "is_final": False,
                    "confidence": 0.92
                })
                await asyncio.sleep(0.35)

            # Final turn
            final_turn = {
                "type": "final_transcript",
                "speaker": speaker,
                "text": full_text,
                "is_final": True,
                "confidence": 0.98
            }
            await websocket.send_json(final_turn)

            # RCM update
            rcm_state = rcm_engine.process_turn(speaker, full_text)
            await websocket.send_json(rcm_state)
            await asyncio.sleep(1.0)

        await websocket.send_json({
            "type": "simulation_complete",
            "message": f"Encounter '{scenario['title']}' finalized. Autonomous RCM & Denial Radar ready."
        })

    try:
        while True:
            message = await websocket.receive()

            if "bytes" in message and message["bytes"]:
                raw_pcm = message["bytes"]
                if assembly_session and assembly_session.is_connected:
                    await assembly_session.send_audio_chunk(raw_pcm)

            elif "text" in message and message["text"]:
                try:
                    payload = json.loads(message["text"])
                    action = payload.get("action")

                    if action == "start_live_mic":
                        if assembly_session:
                            await assembly_session.close()

                        assembly_session = AssemblyAIStreamingSession(
                            on_transcript=broadcast_transcript
                        )
                        try:
                            await assembly_session.connect()
                            await websocket.send_json({
                                "type": "status",
                                "state": "recording_live",
                                "message": "AssemblyAI Real-Time Voice Agent streaming active."
                            })
                        except Exception as conn_err:
                            logger.error(f"AssemblyAI connection failed: {conn_err}")
                            await websocket.send_json({
                                "type": "warning",
                                "message": f"Direct AssemblyAI connection: {str(conn_err)}. Active in local capture."
                            })

                    elif action == "start_preset" or action == "start_scenario":
                        scenario_id = payload.get("scenario_id") or payload.get("preset_id", "cardiology_high_complexity")
                        rcm_engine.reset()
                        if simulation_task and not simulation_task.done():
                            simulation_task.cancel()
                        simulation_task = asyncio.create_task(run_scenario_stream(scenario_id))

                    elif action == "stop":
                        if assembly_session:
                            await assembly_session.close()
                            assembly_session = None
                        if simulation_task and not simulation_task.done():
                            simulation_task.cancel()
                        await websocket.send_json({
                            "type": "status",
                            "state": "idle",
                            "message": "Clinical stream paused."
                        })

                    elif action == "reset":
                        rcm_engine.reset()
                        if assembly_session:
                            await assembly_session.close()
                            assembly_session = None
                        if simulation_task and not simulation_task.done():
                            simulation_task.cancel()
                        await websocket.send_json({
                            "type": "reset_complete",
                            "rcm_state": rcm_engine.get_state()
                        })

                except json.JSONDecodeError:
                    logger.warning("Invalid JSON received on websocket.")

    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected.")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        if assembly_session:
            await assembly_session.close()
        if simulation_task and not simulation_task.done():
            simulation_task.cancel()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
