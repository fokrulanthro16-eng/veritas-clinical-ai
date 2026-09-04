"""Unit tests for deterministic clinical tools & RCM engine."""

import unittest
from app.services.clinical_tools import lookup_icd10, check_drug_interaction, generate_soap_note
from app.services.rcm_engine import RCMEngine

class TestClinicalTools(unittest.TestCase):

    def test_lookup_icd10_angina(self):
        result = lookup_icd10("angina chest pain")
        self.assertEqual(result["status"], "matched")
        self.assertEqual(result["primary_icd10"], "I20.9")
        self.assertGreater(result["reimbursement_estimate_usd"], 200)

    def test_lookup_icd10_diabetes(self):
        result = lookup_icd10("type 2 diabetes")
        self.assertEqual(result["status"], "matched")
        self.assertEqual(result["primary_icd10"], "E11.9")

    def test_check_drug_interaction_warfarin_aspirin(self):
        result = check_drug_interaction(["Warfarin", "Aspirin", "Metoprolol"])
        self.assertTrue(result["has_critical_interaction"])
        self.assertGreaterEqual(result["interaction_count"], 1)
        self.assertEqual(result["interactions"][0]["severity"], "CRITICAL")

    def test_generate_soap_note(self):
        transcript = (
            "Doctor: What brings you in today? "
            "Patient: I've been having bad chest pain and angina. "
            "Doctor: Your blood pressure is 138/86 with pulse 76. Let's order an ECG."
        )
        soap = generate_soap_note(transcript)
        self.assertIn("subjective", soap)
        self.assertIn("objective", soap)
        self.assertIn("assessment", soap)
        self.assertIn("plan", soap)
        self.assertEqual(soap["objective"]["vitals"]["blood_pressure"], "138/86")

    def test_rcm_engine(self):
        engine = RCMEngine()
        state = engine.process_turn("Patient", "I have chest pain and take Warfarin with Aspirin.")
        self.assertGreater(state["total_reimbursement_usd"], 0)
        self.assertTrue(len(state["drug_alerts"]) > 0)

if __name__ == "__main__":
    unittest.main()
