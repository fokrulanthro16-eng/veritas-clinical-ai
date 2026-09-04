"""Unit tests for Institutional RCM, MDM Coding Engine, Denial Radar, and FHIR Exporter."""

import unittest
from app.services.em_coding_engine import EMCodingEngine
from app.services.denial_radar import DenialRadar
from app.services.clinical_sentinel import ClinicalSentinel
from app.services.fhir_exporter import FHIRExporter
from app.services.clinical_tools import lookup_icd10

class TestInstitutionalRCM(unittest.TestCase):

    def test_em_coding_engine_level5_cardio(self):
        icd_codes = [lookup_icd10("angina")]
        meds = ["warfarin", "aspirin", "nitroglycerin"]
        drug_alerts = [{"title": "Severe Hemorrhagic Risk", "severity": "CRITICAL"}]
        transcript = "Patient with acute angina and chest pressure. Taking Warfarin with Aspirin. Ordered ECG and Troponin."
        
        mdm = EMCodingEngine.compute_mdm_code(icd_codes, meds, drug_alerts, transcript)
        self.assertEqual(mdm["recommended_cpt"], "99215")
        self.assertEqual(mdm["mdm_level"], 5)
        self.assertGreater(mdm["estimated_reimbursement_usd"], 300)

    def test_em_coding_engine_level4_diabetes(self):
        icd_codes = [lookup_icd10("type 2 diabetes")]
        meds = ["metformin"]
        drug_alerts = []
        transcript = "Routine review of diabetes. Fasting blood sugar elevated at 185 mg/dL. Ordered CMP labs."
        
        mdm = EMCodingEngine.compute_mdm_code(icd_codes, meds, drug_alerts, transcript)
        self.assertEqual(mdm["recommended_cpt"], "99214")
        self.assertEqual(mdm["mdm_level"], 4)

    def test_denial_radar_unresolved_interaction(self):
        icd_codes = [lookup_icd10("angina")]
        meds = ["warfarin", "aspirin"]
        drug_alerts = [{"title": "Severe Bleed Risk", "severity": "CRITICAL"}]
        transcript = "Patient taking Warfarin and Aspirin daily."
        
        audit = DenialRadar.audit_encounter(transcript, icd_codes, meds, drug_alerts, "99215")
        self.assertGreaterEqual(audit["denial_risk_score"], 20)
        self.assertTrue(any(f["code"] == "AUDIT-SAFE-02" for f in audit["audit_flags"]))

    def test_clinical_sentinel(self):
        sentinel = ClinicalSentinel.analyze_medications(["Warfarin", "Metformin", "Lisinopril"])
        self.assertEqual(sentinel["monitored_drugs_count"], 3)
        self.assertGreater(sentinel["black_box_warnings_count"], 0)
        self.assertEqual(sentinel["safety_status"], "BLACK_BOX_SURVEILLANCE_ACTIVE")

    def test_fhir_r4_bundle_export(self):
        patient = {"id": "pat-1", "mrn": "MRN-100", "given_name": "John", "family_name": "Doe"}
        soap = {"provider": "Dr. Smith", "encounter_type": "Outpatient"}
        icds = [lookup_icd10("angina")]
        bundle = FHIRExporter.generate_fhir_r4_bundle(patient, soap, icds, ["aspirin"], "99214", 248.50)
        
        self.assertEqual(bundle["resourceType"], "Bundle")
        self.assertEqual(bundle["type"], "collection")
        resource_types = [e["resource"]["resourceType"] for e in bundle["entry"]]
        self.assertIn("Patient", resource_types)
        self.assertIn("Encounter", resource_types)
        self.assertIn("Condition", resource_types)
        self.assertIn("Observation", resource_types)
        self.assertIn("Claim", resource_types)

    def test_edi_837p_export(self):
        patient = {"mrn": "MRN-100", "given_name": "John", "family_name": "Doe"}
        icds = [lookup_icd10("angina")]
        edi = FHIRExporter.generate_edi_837p(patient, icds, "99214", 248.50)
        self.assertTrue(edi.startswith("ISA*00*"))
        self.assertIn("ST*837*", edi)
        self.assertIn("SV1*HC:99214*248.50*UN*1***1~", edi)

if __name__ == "__main__":
    unittest.main()
