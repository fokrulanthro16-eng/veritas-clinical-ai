"""Unit tests for Veritas Clinical AI V3 Autonomous Voice Agent & CMS-1500 Generator."""

import unittest
import asyncio
from app.services.voice_agent import VoiceAgentEngine
from app.services.cms1500_generator import CMS1500Generator

class TestV3Features(unittest.TestCase):

    def test_tool_resolve_denial(self):
        res = VoiceAgentEngine.tool_resolve_denial("AUDIT-STAT-06")
        self.assertEqual(res["status"], "SUCCESS")
        self.assertEqual(res["new_denial_risk_score"], 4)
        self.assertIn("Baseline Lipid", res["resolution_title"])

    def test_tool_query_drug_safety(self):
        res = VoiceAgentEngine.tool_query_drug_safety("Plavix")
        self.assertEqual(res["status"], "SUCCESS")
        self.assertEqual(res["rxcui"], "32968")
        self.assertTrue(res["cleared_for_use"])

    def test_tool_generate_claim_summary(self):
        res = VoiceAgentEngine.tool_generate_claim_summary(total_charge=446.00, primary_cpt="99215")
        self.assertEqual(res["status"], "SUCCESS")
        self.assertEqual(res["primary_cpt"], "99215")
        self.assertEqual(res["total_charge_usd"], 446.00)
        self.assertTrue(res["cms_1500_ready"])

    def test_voice_agent_process_command_mitigate(self):
        async def run_cmd():
            res = await VoiceAgentEngine.process_command("Veritas, auto-resolve all denial flags")
            self.assertGreater(res["tool_count"], 0)
            self.assertEqual(res["executed_tools"][0]["tool_name"], "tool_resolve_denial")
            self.assertIn("Resolved payer audit flag", res["voice_response"])
        asyncio.run(run_cmd())

    def test_voice_agent_process_command_safety(self):
        async def run_cmd():
            res = await VoiceAgentEngine.process_command("Veritas, verify Plavix safety")
            self.assertGreater(res["tool_count"], 0)
            self.assertEqual(res["executed_tools"][0]["tool_name"], "tool_query_drug_safety")
            self.assertIn("RxNorm safety check", res["voice_response"])
        asyncio.run(run_cmd())

    def test_cms1500_box_mappings(self):
        form = CMS1500Generator.generate_form_data(recommended_cpt="99215")
        boxes = form["boxes"]
        self.assertIn("box_1_payer_type", boxes)
        self.assertEqual(boxes["box_2_patient_name"], "DAVIS, ARTHUR")
        self.assertIn("A", boxes["box_21_diagnoses"])
        self.assertEqual(len(boxes["box_24_service_lines"]), 3)
        self.assertEqual(boxes["box_24_service_lines"][0]["cpt_hcpcs"], "99215")
        self.assertEqual(boxes["box_31_physician_signature"], "SARAH LIN, MD")
        self.assertGreater(form["claim_total_usd"], 400)

if __name__ == "__main__":
    unittest.main()
