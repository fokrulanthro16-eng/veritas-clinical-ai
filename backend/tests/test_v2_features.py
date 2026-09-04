"""Unit tests for Veritas Clinical AI V2 Enterprise Features."""

import unittest
import asyncio
from app.services.clinical_scenarios import get_all_scenarios, get_scenario_by_id
from app.services.denial_radar import DenialRadar
from app.services.clinical_copilot import ClinicalCopilot
from app.services.rcm_engine import RCMEngine

class TestV2Features(unittest.TestCase):

    def test_scenarios_registry(self):
        scenarios = get_all_scenarios()
        self.assertEqual(len(scenarios), 3)
        ids = [s["id"] for s in scenarios]
        self.assertIn("cardiology_high_complexity", ids)
        self.assertIn("endocrinology_polypharmacy", ids)
        self.assertIn("telehealth_denial_risk", ids)

    def test_cardiology_scenario_execution(self):
        scenario = get_scenario_by_id("cardiology_high_complexity")
        self.assertIsNotNone(scenario)
        engine = RCMEngine()
        for turn in scenario["dialogue"]:
            engine.process_turn(turn["speaker"], turn["text"])
        
        state = engine.get_state()
        self.assertEqual(state["mdm_analysis"]["recommended_cpt"], "99215")
        self.assertEqual(state["mdm_analysis"]["mdm_level"], 5)
        self.assertGreater(state["total_reimbursement_usd"], 200)

    def test_auto_mitigate_denial(self):
        transcript = "Doctor: Starting Atorvastatin 40mg daily."
        soap_note = {"objective": {"physical_exam": []}, "plan": {"orders_and_diagnostics": []}}
        
        mitigation = DenialRadar.auto_mitigate_denial(
            transcript=transcript,
            flag_id="AUDIT-STAT-06",
            soap_note=soap_note
        )
        self.assertTrue(mitigation["success"])
        self.assertEqual(mitigation["flag_id"], "AUDIT-STAT-06")
        self.assertEqual(mitigation["mitigated_denial_radar"]["denial_risk_score"], 4)
        self.assertEqual(mitigation["mitigated_denial_radar"]["risk_tier"], "LOW")
        self.assertIn("Baseline Lipid", mitigation["resolution_title"])

    def test_clinical_copilot_fallback(self):
        async def run_copilot():
            res = await ClinicalCopilot.answer_query("Check contraindications for Warfarin")
            self.assertIn("Warfarin", res["answer"])
            self.assertIn("query", res)
        asyncio.run(run_copilot())

if __name__ == "__main__":
    unittest.main()
