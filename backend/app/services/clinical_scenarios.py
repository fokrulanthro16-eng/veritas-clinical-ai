"""Clinical Scenarios Knowledge Base & Simulation Runner for Veritas Clinical AI V2.

Pre-configured realistic multi-speaker encounters:
1. cardiology_high_complexity: Acute Unstable Angina + Atorvastatin/Plavix therapy -> CPT 99215 ($235.00), ICD-10 I20.0, low denial risk.
2. endocrinology_polypharmacy: Diabetic patient with neuropathy + Metformin/Lisinopril + potential drug interaction -> CPT 99214 ($198.50), ICD-10 E11.40.
3. telehealth_denial_risk: Telehealth encounter missing lab documentation -> triggers 55% Denial Risk badge with actionable mitigation advice.
"""

from typing import List, Dict, Any, Optional

CLINICAL_SCENARIOS = {
    "cardiology_high_complexity": {
        "id": "cardiology_high_complexity",
        "badge": "⚡ Cardiology 99215",
        "title": "Cardiology: Acute Unstable Angina & Dual Antiplatelet Therapy",
        "specialty": "Cardiology / Acute Care",
        "patient": "Arthur Davis, 67M",
        "mrn": "MRN-9482014",
        "payer": "Aetna Choice POS II (Payer ID: 60054)",
        "expected_cpt": "99215",
        "expected_cpt_name": "Level 5: High Complexity Medical Decision Making",
        "expected_reimbursement_usd": 235.00,
        "expected_primary_icd": "I20.0",
        "expected_primary_icd_desc": "Unstable angina (acute coronary syndrome)",
        "expected_denial_risk": 4,
        "description": "Patient presenting with worsening crescendo chest pressure and exertional dyspnea. Receiving high-intensity Atorvastatin 80mg and Plavix with documented baseline ECG and troponin review.",
        "dialogue": [
            {
                "speaker": "Doctor",
                "text": "Good morning Mr. Davis. I see you've had worsening substernal chest pressure radiating into your left shoulder over the last 48 hours."
            },
            {
                "speaker": "Patient",
                "text": "Yes, Doctor. Even walking to the kitchen triggers this tight squeezing sensation. It took three sublingual nitroglycerin tablets to calm it down last night."
            },
            {
                "speaker": "Doctor",
                "text": "Let's check your vitals. Blood pressure is 142/88 mmHg, heart rate 84 bpm, and oxygen saturation 97% on room air. Your 12-lead ECG shows 1.5mm ST depression in leads V4-V6."
            },
            {
                "speaker": "Patient",
                "text": "I've been taking my Plavix 75mg and Atorvastatin 80mg as prescribed. Should we be worried about a heart attack?"
            },
            {
                "speaker": "Doctor",
                "text": "You are experiencing unstable angina with high ischemic risk. I am ordering immediate serial high-sensitivity Troponin I, continuing Plavix and Atorvastatin, admitting you to telemetry cardiology, and scheduling urgent coronary angiography."
            }
        ]
    },
    "endocrinology_polypharmacy": {
        "id": "endocrinology_polypharmacy",
        "badge": "⚡ Diabetes 99214",
        "title": "Endocrinology: Type 2 Diabetes with Peripheral Neuropathy & Polypharmacy",
        "specialty": "Endocrinology / Internal Medicine",
        "patient": "Eleanor Taylor, 58F",
        "mrn": "MRN-8812903",
        "payer": "Medicare Part B (CMS)",
        "expected_cpt": "99214",
        "expected_cpt_name": "Level 4: Moderate Complexity Medical Decision Making",
        "expected_reimbursement_usd": 198.50,
        "expected_primary_icd": "E11.40",
        "expected_primary_icd_desc": "Type 2 diabetes mellitus with diabetic neuropathy, unspecified",
        "expected_denial_risk": 8,
        "description": "Established diabetic with burning foot paresthesias, elevated HbA1c 8.8%, taking Metformin 1000mg BID and Lisinopril 20mg. Monitored for potential renal interactions.",
        "dialogue": [
            {
                "speaker": "Doctor",
                "text": "Hello Eleanor. We are reviewing your 3-month Type 2 Diabetes follow-up and your recent laboratory panel."
            },
            {
                "speaker": "Patient",
                "text": "Doctor, the tingling and sharp burning in both of my feet has gotten worse at night. My morning fasting sugars have been running between 175 and 195 mg/dL."
            },
            {
                "speaker": "Doctor",
                "text": "Your latest HbA1c is 8.8%, and your eGFR is stable at 54 mL/min (Stage 3a CKD). Monofilament exam confirms bilateral symmetric sensory loss in a stocking distribution."
            },
            {
                "speaker": "Patient",
                "text": "I am currently taking Metformin 1000mg twice daily with meals and Lisinopril 20mg every morning for blood pressure."
            },
            {
                "speaker": "Doctor",
                "text": "We will initiate Gabapentin 300mg at bedtime for the diabetic peripheral neuropathy, maintain Metformin at 1000mg BID with renal precautions, and follow up in 6 weeks with repeat comprehensive metabolic panel."
            }
        ]
    },
    "telehealth_denial_risk": {
        "id": "telehealth_denial_risk",
        "badge": "⚡ Telehealth Denial Demo",
        "title": "Virtual Care: Statin Therapy without Baseline Lipid Documentation",
        "specialty": "Virtual Telehealth / Primary Care",
        "patient": "Marcus Vance, 52M",
        "mrn": "MRN-6721948",
        "payer": "BlueCross BlueShield Preferred PPO",
        "expected_cpt": "99214",
        "expected_cpt_name": "Level 4: Moderate Complexity MDM",
        "expected_reimbursement_usd": 182.00,
        "expected_primary_icd": "E78.5",
        "expected_primary_icd_desc": "Hyperlipidemia, unspecified",
        "expected_denial_risk": 55,
        "description": "Telehealth consultation where Atorvastatin 40mg is prescribed without documenting baseline fasting lipid panel or liver enzyme labs, triggering a 55% commercial payer denial risk.",
        "dialogue": [
            {
                "speaker": "Doctor",
                "text": "Good afternoon Marcus. Connecting for our scheduled telehealth follow-up regarding your cholesterol and blood pressure."
            },
            {
                "speaker": "Patient",
                "text": "Hi Doctor. I remember you mentioned starting a stronger cholesterol medication like Atorvastatin."
            },
            {
                "speaker": "Doctor",
                "text": "Yes, I am transmitting a prescription for Atorvastatin 40mg daily to your pharmacy. Let's make sure you take it with your evening meal."
            },
            {
                "speaker": "Patient",
                "text": "Do I need any lab work or blood test done before starting it?"
            },
            {
                "speaker": "Doctor",
                "text": "We can just start the medication now and check how you feel next month."
            }
        ]
    }
}


def get_all_scenarios() -> List[Dict[str, Any]]:
    """Return summary list of available clinical scenarios."""
    results = []
    for s in CLINICAL_SCENARIOS.values():
        results.append({
            "id": s["id"],
            "badge": s["badge"],
            "title": s["title"],
            "specialty": s["specialty"],
            "patient": s["patient"],
            "mrn": s["mrn"],
            "payer": s["payer"],
            "expected_cpt": s["expected_cpt"],
            "expected_cpt_name": s["expected_cpt_name"],
            "expected_reimbursement_usd": s["expected_reimbursement_usd"],
            "expected_primary_icd": s["expected_primary_icd"],
            "expected_primary_icd_desc": s["expected_primary_icd_desc"],
            "expected_denial_risk": s["expected_denial_risk"],
            "description": s["description"],
            "turns_count": len(s["dialogue"])
        })
    return results


def get_scenario_by_id(scenario_id: str) -> Optional[Dict[str, Any]]:
    """Fetch specific scenario by ID."""
    return CLINICAL_SCENARIOS.get(scenario_id)
