"""Longitudinal Patient Memory & Biomarker Trajectory Service.

Maintains multi-encounter longitudinal history, delta shifts, and predictive risk indicators.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

PATIENT_TRAJECTORIES: Dict[str, Dict[str, Any]] = {
    "pat-9482014": {
        "patient_id": "pat-9482014",
        "mrn": "MRN-9482014",
        "patient_name": "Arthur Davis",
        "encounters_count": 3,
        "timeline_span": "12 Months (2025-2026)",
        "biomarker_trajectories": [
            {
                "biomarker": "eGFR (Renal Filtration Rate)",
                "unit": "mL/min/1.73m²",
                "baseline_12m": 74.0,
                "midpoint_6m": 66.0,
                "current": 58.0,
                "delta_12m": -16.0,
                "delta_pct": -21.6,
                "trend": "DECLINING",
                "clinical_flag": "EARLY_STAGE_3_CKD_TRIGGER",
                "status_badge": "CKD Progression Warning",
                "sparkline_data": [74, 71, 68, 66, 62, 58],
                "clinical_implication": "21.6% 12-month filtration loss. Requires ACE-i/ARB renal dose titration and avoid iodinated contrast overload without pre-hydration."
            },
            {
                "biomarker": "Hemoglobin A1c",
                "unit": "%",
                "baseline_12m": 6.8,
                "midpoint_6m": 7.4,
                "current": 8.2,
                "delta_12m": 1.4,
                "delta_pct": 20.6,
                "trend": "ESCALATING",
                "clinical_flag": "SUBOPTIMAL_GLYCEMIC_CONTROL",
                "status_badge": "Suboptimal Glycemic Control",
                "sparkline_data": [6.8, 7.0, 7.2, 7.4, 7.8, 8.2],
                "clinical_implication": "Progressive glycemic failure under Metformin monotherapy. SGLT2 inhibitor (Empagliflozin 10mg) initiation strongly indicated for combined cardiorenal protection."
            },
            {
                "biomarker": "Left Ventricular Ejection Fraction (LVEF)",
                "unit": "%",
                "baseline_12m": 55.0,
                "midpoint_6m": 50.0,
                "current": 50.0,
                "delta_12m": -5.0,
                "delta_pct": -9.1,
                "trend": "STABLE_COMPROMISED",
                "clinical_flag": "MILD_ISCHEMIC_LV_DYSFUNCTION",
                "status_badge": "Ischemic Cardiomyopathy Stable",
                "sparkline_data": [55, 54, 52, 50, 50, 50],
                "clinical_implication": "Preserved-to-mildly reduced systolic function. Echo demonstrates anterolateral wall motion hypokinesis consistent with current ECG ST-depression."
            }
        ],
        "predictive_risk_matrix": {
            "cardiorenal_syndrome_risk": "MODERATE_HIGH",
            "mace_3yr_risk_pct": 24.8,
            "ckd_progression_probability_18m": 0.72,
            "suggested_interventions": [
                "Initiate SGLT2i (Empagliflozin 10mg daily) for cardiorenal protection",
                "Order comprehensive lipid panel and urine albumin-to-creatinine ratio (uACR)",
                "Renal ultrasound & nephrology co-management consult if eGFR remains <60 mL/min"
            ]
        }
    }
}


class LongitudinalMemoryEngine:
    @staticmethod
    def get_trajectory(patient_id: str) -> Dict[str, Any]:
        """Fetch longitudinal history and delta trajectories for a given patient."""
        if patient_id in PATIENT_TRAJECTORIES:
            return PATIENT_TRAJECTORIES[patient_id]
        
        # Fallback default trajectory for demo
        return PATIENT_TRAJECTORIES["pat-9482014"]
