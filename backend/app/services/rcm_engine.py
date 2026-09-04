"""Real-Time Autonomous Revenue Cycle Management (RCM) & Clinical Intelligence Engine.

Unifies:
1. Deterministic ICD-10 Coding & Reimbursement Lookup
2. Official AMA/CMS Medical Decision Making (MDM) E/M Rule Engine (99212 - 99215)
3. Payer Denial Radar with Pre-Claim Compliance Auditing
4. RxNorm Clinical Sentinel & Black Box Safety Matrix
5. HL7 FHIR R4 Bundle & ANSI ASC X12 837P EDI Generation
6. Continuous SOAP Note Documentation
"""

import re
from typing import List, Dict, Any, Set
from app.services.clinical_tools import lookup_icd10, check_drug_interaction, generate_soap_note
from app.services.em_coding_engine import EMCodingEngine
from app.services.denial_radar import DenialRadar
from app.services.clinical_sentinel import ClinicalSentinel
from app.services.fhir_exporter import FHIRExporter

KNOWN_SYMPTOMS_AND_CONDITIONS = [
    "angina", "chest pain", "diabetes", "blood sugar", "hyperglycemia",
    "hypertension", "high blood pressure", "asthma", "wheezing",
    "copd", "kidney disease", "renal", "anxiety", "back pain",
    "atrial fibrillation", "palpitations"
]

KNOWN_DRUGS = [
    "warfarin", "aspirin", "ibuprofen", "lisinopril", "potassium",
    "metformin", "contrast", "sildenafil", "nitroglycerin",
    "simvastatin", "amiodarone", "sertraline", "tramadol",
    "eliquis", "amlodipine", "albuterol", "lexapro"
]


class RCMEngine:
    def __init__(self):
        self.accumulated_text: str = ""
        self.identified_icd_codes: Dict[str, Dict[str, Any]] = {}
        self.detected_medications: Set[str] = set()
        self.drug_alerts: List[Dict[str, Any]] = []
        self.turns: List[Dict[str, Any]] = []
        self.total_reimbursement: float = 0.0
        self.patient_context = {
            "id": "pat-9482014",
            "mrn": "MRN-9482014",
            "given_name": "Arthur",
            "family_name": "Davis",
            "gender": "male",
            "birth_date": "1958-04-12",
            "age": 67,
            "payer": "Aetna Choice POS II (Payer ID: 60054)",
            "encounter_room": "Exam Room 302B",
            "provider": "Dr. Sarah Lin, MD (NPI: 1942857102)"
        }

    def process_turn(self, speaker: str, text: str) -> Dict[str, Any]:
        """Process a newly confirmed utterance/turn."""
        self.turns.append({"speaker": speaker, "text": text})
        self.accumulated_text += f" {speaker}: {text}\n"

        lower = text.lower()

        # 1. Identify ICD-10 diagnostic conditions
        for cond in KNOWN_SYMPTOMS_AND_CONDITIONS:
            if cond in lower:
                icd_result = lookup_icd10(cond)
                if icd_result["status"] == "matched":
                    code = icd_result["primary_icd10"]
                    if code not in self.identified_icd_codes:
                        self.identified_icd_codes[code] = icd_result

        # 2. Identify medications
        for drug in KNOWN_DRUGS:
            if drug in lower:
                self.detected_medications.add(drug)

        # 3. Check drug contraindications
        if self.detected_medications:
            interaction_check = check_drug_interaction(list(self.detected_medications))
            self.drug_alerts = interaction_check["interactions"]

        # 4. Generate updated SOAP note
        soap_note = generate_soap_note(self.accumulated_text)

        return self.get_state(soap_note)

    def get_state(self, soap_note: Dict[str, Any] = None) -> Dict[str, Any]:
        if soap_note is None:
            soap_note = generate_soap_note(self.accumulated_text)

        icd_list = list(self.identified_icd_codes.values())
        med_list = list(self.detected_medications)

        # 5. Compute official AMA/CMS Medical Decision Making (MDM) Complexity
        mdm_analysis = EMCodingEngine.compute_mdm_code(
            icd_codes=icd_list,
            medications=med_list,
            drug_alerts=self.drug_alerts,
            transcript=self.accumulated_text
        )

        recommended_cpt = mdm_analysis["recommended_cpt"]
        em_reimbursement = mdm_analysis["estimated_reimbursement_usd"]

        # Calculate total claim value (E/M fee + diagnostic addon RVUs)
        addon_reimbursement = sum(d.get("reimbursement_estimate_usd", d.get("reimbursement_usd", 0)) * 0.4 for d in icd_list)
        total_claim_usd = round(em_reimbursement + addon_reimbursement, 2)
        self.total_reimbursement = total_claim_usd

        # 6. Execute Payer Denial Radar pre-claim compliance audit
        denial_audit = DenialRadar.audit_encounter(
            transcript=self.accumulated_text,
            icd_codes=icd_list,
            medications=med_list,
            drug_alerts=self.drug_alerts,
            recommended_cpt=recommended_cpt
        )

        # 7. RxNorm Pharmacology Surveillance
        sentinel_report = ClinicalSentinel.analyze_medications(med_list)

        # 8. HL7 FHIR R4 Bundle & ANSI 837P Generation
        fhir_bundle = FHIRExporter.generate_fhir_r4_bundle(
            patient_info=self.patient_context,
            soap_note=soap_note,
            icd_codes=icd_list,
            medications=med_list,
            recommended_cpt=recommended_cpt,
            claim_amount=total_claim_usd
        )

        edi_837p = FHIRExporter.generate_edi_837p(
            patient_info=self.patient_context,
            icd_codes=icd_list,
            recommended_cpt=recommended_cpt,
            claim_amount=total_claim_usd
        )

        # Update SOAP note billing summary
        if soap_note and "billing_summary" in soap_note:
            soap_note["billing_summary"]["suggested_em_code"] = recommended_cpt
            soap_note["billing_summary"]["total_estimated_reimbursement"] = total_claim_usd

        return {
            "type": "rcm_update",
            "patient_context": self.patient_context,
            "total_reimbursement_usd": total_claim_usd,
            "icd10_codes": icd_list,
            "medications": med_list,
            "drug_alerts": self.drug_alerts,
            "turns_count": len(self.turns),
            "mdm_analysis": mdm_analysis,
            "denial_radar": denial_audit,
            "sentinel_report": sentinel_report,
            "soap_note": soap_note,
            "fhir_bundle": fhir_bundle,
            "edi_837p": edi_837p
        }

    def reset(self):
        self.accumulated_text = ""
        self.identified_icd_codes = {}
        self.detected_medications = set()
        self.drug_alerts = []
        self.turns = []
        self.total_reimbursement = 0.0
