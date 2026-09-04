"""Official Standard CMS-1500 (HCFA-1500) Claim Generator & Form Field Mapper.

Maps live clinical encounter data (Patient MRN, NPI, ICD-10-CM Diagnoses, CPT-4 Procedures,
Total Charges) into the official 33 boxes of the National Uniform Claim Committee (NUCC) CMS-1500 standard form.
"""

from typing import Dict, Any, List, Optional
import datetime

class CMS1500Generator:
    """Generates official standard CMS-1500 claim box mappings."""

    @classmethod
    def generate_form_data(
        cls,
        patient_info: Optional[Dict[str, Any]] = None,
        icd_codes: Optional[List[Dict[str, Any]]] = None,
        recommended_cpt: str = "99215",
        total_charges: float = 446.00
    ) -> Dict[str, Any]:
        now = datetime.datetime.now()
        date_of_service = now.strftime("%m/%d/%Y")

        p = patient_info or {
            "mrn": "MRN-9482014",
            "given_name": "Arthur",
            "family_name": "Davis",
            "gender": "male",
            "birth_date": "04/12/1958",
            "payer": "Aetna Choice POS II (Payer ID: 60054)",
            "provider": "Dr. Sarah Lin, MD (NPI: 1942857102)"
        }

        icds = icd_codes or [
            {"primary_icd10": "I20.0", "description": "Unstable angina (acute coronary syndrome)"},
            {"primary_icd10": "I10", "description": "Essential (primary) hypertension"},
            {"primary_icd10": "E11.40", "description": "Type 2 diabetes with diabetic neuropathy"}
        ]

        # Diagnosis Pointers (Box 21: A, B, C, D)
        box_21_diagnoses = {}
        letters = ["A", "B", "C", "D", "E", "F", "G", "H"]
        for idx, item in enumerate(icds[:8]):
            letter = letters[idx]
            box_21_diagnoses[letter] = {
                "letter": letter,
                "code": item.get("primary_icd10", "I20.0"),
                "description": item.get("description", "Clinical diagnosis")
            }

        # Service Lines (Box 24A-24J)
        base_charge = 248.50 if recommended_cpt == "99215" else 198.50
        ecg_charge = 115.00
        troponin_charge = 82.50
        calculated_total = round(base_charge + ecg_charge + troponin_charge, 2)

        service_lines = [
            {
                "line_num": 1,
                "from_date": date_of_service,
                "to_date": date_of_service,
                "place_of_service": "11",  # Office
                "emg": "N",
                "cpt_hcpcs": recommended_cpt,
                "modifier": "25",  # Significant separate E/M
                "diagnosis_pointer": "A,B",
                "charges": f"{base_charge:.2f}",
                "days_or_units": "1",
                "epsdt_family_plan": "",
                "rendering_provider_id": "1942857102"
            },
            {
                "line_num": 2,
                "from_date": date_of_service,
                "to_date": date_of_service,
                "place_of_service": "11",
                "emg": "N",
                "cpt_hcpcs": "93000",  # Electrocardiogram complete
                "modifier": "",
                "diagnosis_pointer": "A",
                "charges": f"{ecg_charge:.2f}",
                "days_or_units": "1",
                "epsdt_family_plan": "",
                "rendering_provider_id": "1942857102"
            },
            {
                "line_num": 3,
                "from_date": date_of_service,
                "to_date": date_of_service,
                "place_of_service": "11",
                "emg": "N",
                "cpt_hcpcs": "84484",  # Troponin quantitative
                "modifier": "",
                "diagnosis_pointer": "A",
                "charges": f"{troponin_charge:.2f}",
                "days_or_units": "1",
                "epsdt_family_plan": "",
                "rendering_provider_id": "1942857102"
            }
        ]

        return {
            "form_name": "HEALTH INSURANCE CLAIM FORM (CMS-1500 02/12)",
            "payer_header": {
                "payer_name": p.get("payer", "AETNA CHOICE POS II"),
                "payer_id": "60054",
                "payer_address": "P.O. BOX 981106, EL PASO, TX 79998"
            },
            "boxes": {
                "box_1_payer_type": "COMMERCIAL_PPO",
                "box_1a_insured_id": f"AET-{p.get('mrn', 'MRN-9482014').replace('-', '')}",
                "box_2_patient_name": f"{p.get('family_name', 'DAVIS').upper()}, {p.get('given_name', 'ARTHUR').upper()}",
                "box_3_patient_dob": p.get("birth_date", "04/12/1958"),
                "box_3_patient_sex": "MALE" if p.get("gender") == "male" else "FEMALE",
                "box_4_insured_name": f"{p.get('family_name', 'DAVIS').upper()}, {p.get('given_name', 'ARTHUR').upper()}",
                "box_5_patient_address": {
                    "street": "742 EVERGREEN TERRACE",
                    "city": "BOSTON",
                    "state": "MA",
                    "zip": "02116",
                    "phone": "(617) 555-0143"
                },
                "box_6_patient_relationship": "SELF",
                "box_7_insured_address": "SAME AS BOX 5",
                "box_9_other_insured": "NONE",
                "box_10_is_condition_related_to": {
                    "employment": "NO",
                    "auto_accident": "NO",
                    "other_accident": "NO"
                },
                "box_11_insured_policy_group": "GRP-AETNA-60054",
                "box_12_patient_signature": "SIGNATURE ON FILE",
                "box_12_date": date_of_service,
                "box_13_insured_signature": "SIGNATURE ON FILE",
                "box_14_date_of_illness": date_of_service,
                "box_17_referring_provider": "LIN, SARAH MD",
                "box_17a_other_id": "UPIN-L84029",
                "box_17b_npi": "1942857102",
                "box_21_diagnoses": box_21_diagnoses,
                "box_23_prior_auth_number": "PA-9482014-ACS",
                "box_24_service_lines": service_lines,
                "box_25_federal_tax_id": "04-3948201",
                "box_25_type": "EIN",
                "box_26_patient_account_no": p.get("mrn", "MRN-9482014"),
                "box_27_accept_assignment": "YES",
                "box_28_total_charge": f"${calculated_total:.2f}",
                "box_29_amount_paid": "$0.00",
                "box_30_balance_due": f"${calculated_total:.2f}",
                "box_31_physician_signature": "SARAH LIN, MD",
                "box_31_date": date_of_service,
                "box_32_service_facility": {
                    "name": "VERITAS HEALTHCARE PARTNERS LLC",
                    "address": "100 MEDICAL PLAZA WAY, SUITE 400",
                    "city_state_zip": "BOSTON, MA 02115",
                    "npi": "1942857102"
                },
                "box_33_billing_provider": {
                    "name": "VERITAS CLINICAL ASSOCIATES",
                    "address": "P.O. BOX 84201, BOSTON, MA 02116",
                    "phone": "(800) 555-0199",
                    "npi": "1942857102"
                }
            },
            "claim_total_usd": calculated_total,
            "generated_timestamp": now.isoformat()
        }
