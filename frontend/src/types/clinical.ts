export interface PatientContext {
  id: string;
  mrn: string;
  given_name: string;
  family_name: string;
  gender: string;
  birth_date: string;
  age: number;
  payer: string;
  encounter_room: string;
  provider: string;
}

export interface TranscriptItem {
  id: string;
  speaker: 'Doctor' | 'Patient' | 'Clinician' | 'System';
  text: string;
  isFinal: boolean;
  timestamp: string;
  confidence?: number;
}

export interface ICD10Match {
  code: string;
  description: string;
  cpt_code: string;
  cpt_description: string;
  reimbursement_usd: number;
  rvu: number;
  category: string;
  confidence_score?: number;
}

export interface ICD10Result {
  query: string;
  status: string;
  primary_icd10: string;
  description: string;
  cpt_code: string;
  cpt_description: string;
  reimbursement_estimate_usd?: number;
  reimbursement_usd?: number;
  rvu: number;
  category: string;
  all_matches?: ICD10Match[];
  confidence_score?: number;
}

export interface DrugAlert {
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE';
  title: string;
  drugs_involved: string[];
  mechanism: string;
  recommendation: string;
}

export interface MDMCategoryEvaluation {
  level: number;
  label: string;
  rationale: string;
  problems_count?: number;
  score?: number;
  items?: string[];
  risk_factors?: string[];
}

export interface MDMAnalysis {
  recommended_cpt: string;
  cpt_name: string;
  mdm_level: number;
  total_rvu: number;
  work_rvu: number;
  estimated_reimbursement_usd: number;
  time_threshold: string;
  two_of_three_rule_audit: {
    qualifying_level: number;
    levels_evaluated: {
      problems_level: number;
      data_level: number;
      risk_level: number;
    };
    problems_breakdown: MDMCategoryEvaluation;
    data_breakdown: MDMCategoryEvaluation;
    risk_breakdown: MDMCategoryEvaluation;
  };
}

export interface DenialAuditFlag {
  code: string;
  flag_id?: string;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'INFO';
  category: string;
  title: string;
  message: string;
  payer_reference: string;
  suggested_fix: string;
}

export interface DenialRadarResult {
  denial_risk_score: number;
  clean_claim_probability: number;
  risk_tier: 'LOW' | 'MODERATE' | 'HIGH';
  audit_flags_count: number;
  audit_flags: DenialAuditFlag[];
  payer_profile: string;
  pre_claim_status: 'READY_FOR_AUTO_SUBMIT' | 'REQUIRES_CLINICAL_AMENDMENT';
}

export interface RxNormProfile {
  drug_name: string;
  rxcui: string;
  brand: string;
  drug_class: string;
  max_daily_dose: string;
  renal_note: string;
}

export interface BlackBoxWarning {
  drug: string;
  rxcui: string;
  warning: string;
}

export interface SentinelReport {
  monitored_drugs_count: number;
  rxnorm_profiles: RxNormProfile[];
  black_box_warnings_count: number;
  black_box_warnings: BlackBoxWarning[];
  safety_status: string;
}

export interface SoapNote {
  timestamp: string;
  encounter_type: string;
  provider: string;
  subjective: {
    chief_complaint: string;
    history_of_present_illness: string;
    review_of_systems: string;
  };
  objective: {
    vitals: {
      blood_pressure: string;
      heart_rate: string;
      respiratory_rate: string;
      oxygen_saturation: string;
      temperature: string;
      bmi: string;
      inr?: string;
    };
    physical_exam: string[];
  };
  assessment: {
    clinical_summary: string;
    diagnoses: ICD10Result[];
  };
  plan: {
    medications: string[];
    orders_and_diagnostics: string[];
    lifestyle_interventions: string;
    follow_up: string;
  };
  billing_summary?: {
    suggested_em_code: string;
    total_estimated_reimbursement: number;
    primary_icd10: string;
  };
}

export interface ClinicalScenarioMeta {
  id: string;
  badge: string;
  title: string;
  specialty: string;
  patient: string;
  mrn: string;
  payer: string;
  expected_cpt: string;
  expected_cpt_name: string;
  expected_reimbursement_usd: number;
  expected_primary_icd: string;
  expected_primary_icd_desc: string;
  expected_denial_risk: number;
  description: string;
  turns_count: number;
}

export interface ToolExecutionLog {
  tool_name: string;
  status: string;
  flag_id?: string;
  resolution_title?: string;
  medication?: string;
  safety_alert?: string;
  primary_cpt?: string;
  total_charge_usd?: number;
  timestamp?: string;
}

export interface AgentCommandResponse {
  command: string;
  voice_response: string;
  executed_tools: ToolExecutionLog[];
  state_mutations: any;
  tool_count: number;
}

export interface CMS1500FormResponse {
  form_name: string;
  payer_header: {
    payer_name: string;
    payer_id: string;
    payer_address: string;
  };
  boxes: any;
  claim_total_usd: number;
  generated_timestamp: string;
}

export interface RCMState {
  type?: string;
  patient_context?: PatientContext;
  total_reimbursement_usd: number;
  icd10_codes: ICD10Result[];
  medications: string[];
  drug_alerts: DrugAlert[];
  turns_count: number;
  mdm_analysis?: MDMAnalysis;
  denial_radar?: DenialRadarResult;
  sentinel_report?: SentinelReport;
  soap_note?: SoapNote;
  fhir_bundle?: any;
  edi_837p?: string;
  vision_analysis?: VisionAnalysisResult;
  prior_auth_package?: PriorAuthPackage;
  cds_safety?: CDSSafetyReport;
}

export interface VisionAnalysisResult {
  status: string;
  modality: string;
  telemetry_metrics: {
    heart_rate_bpm: number;
    rhythm: string;
    pr_interval_ms: number;
    qrs_duration_ms: number;
    qtc_interval_ms: number;
    axis_degrees: number;
    st_deviation_mm: number;
    lead_involvement: string[];
  };
  biomarkers_and_findings: string[];
  clinical_correlation: string;
  suggested_icd10: Array<{
    code: string;
    description: string;
    confidence: number;
    reimbursement_usd: number;
  }>;
  soap_updates?: Partial<SoapNote>;
}

export interface PriorAuthPackage {
  prior_auth_id: string;
  status: string;
  created_at: string;
  urgency: string;
  payer: {
    payer_name: string;
    payer_id: string;
    submission_portal: string;
  };
  patient: {
    name: string;
    mrn: string;
    gender: string;
    age: number;
  };
  requested_service: {
    service_name: string;
    cpt_code: string;
    setting: string;
    estimated_cost_usd: number;
  };
  clinical_necessity_justification: {
    primary_indication: string;
    failed_conservative_therapies: string[];
    diagnostic_evidence: string[];
    interqual_criteria_met: string[];
    mcg_compliance_score: number;
    stat_review_requested: boolean;
  };
  diagnoses: Array<{
    code: string;
    description: string;
  }>;
  physician_attestation: {
    attending_physician: string;
    npi: string;
    attestation_text: string;
    signed_timestamp: string;
  };
}

export interface PriorAuthSubmitResult {
  status: string;
  authorization_number: string;
  payer_response: string;
  determination: string;
  effective_date: string;
  expiration_date: string;
  clearinghouse_tracking_id: string;
  electronic_attachment_hash: string;
}

export interface CDSSafetyReport {
  status: string;
  safety_score: number;
  bleeding_risk_index: {
    score: number;
    level: string;
    annual_major_bleed_pct: number;
    antiplatelet_active: boolean;
    anticoagulant_active: boolean;
  };
  myopathy_risk_index: {
    level: string;
    risk_pct: number;
    statin_active: boolean;
  };
  drug_interactions: Array<{
    drugs: string[];
    severity: string;
    mechanism: string;
    action: string;
  }>;
  safety_pill_text: string;
}

export interface BiomarkerTrajectory {
  biomarker: string;
  unit: string;
  baseline_12m: number;
  midpoint_6m: number;
  current: number;
  delta_12m: number;
  delta_pct: number;
  trend: string;
  clinical_flag: string;
  status_badge: string;
  sparkline_data: number[];
  clinical_implication: string;
}

export interface LongitudinalTrajectoryResponse {
  patient_id: string;
  mrn: string;
  patient_name: string;
  encounters_count: number;
  timeline_span: string;
  biomarker_trajectories: BiomarkerTrajectory[];
  predictive_risk_matrix: {
    cardiorenal_syndrome_risk: string;
    mace_3yr_risk_pct: number;
    ckd_progression_probability_18m: number;
    suggested_interventions: string[];
  };
}

export interface Edi837pTransactionPackage {
  status: string;
  transaction_control_id: string;
  standard_version: string;
  clearinghouse_target: string;
  billing_provider: string;
  subscriber_id: string;
  total_claim_amount_usd: number;
  primary_cpt: string;
  modifier: string;
  segments_count: number;
  edi_raw: string;
}

export interface Edi837pTransmitResult {
  status: string;
  clearinghouse_tx_id: string;
  clearinghouse: string;
  payer_response_code: string;
  payer_ack: string;
  claim_status_detail: string;
  estimated_remittance_date: string;
  electronic_hash: string;
}

export interface DenialAppealPackage {
  appeal_id: string;
  status: string;
  disputed_denial: string;
  appeal_brief_markdown: string;
  statutory_reference: string;
  expected_overturn_rate_pct: number;
}

export interface AirlockInterceptItem {
  intercept_id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'INFO';
  category: string;
  title: string;
  mechanism: string;
  correction_chip: string;
  statutory_alert: string;
}

export interface AirlockAuditReport {
  airlock_status: 'PASSED_SECURE' | 'CONTRADICTION_INTERCEPTED';
  is_secure: boolean;
  contradictions_count: number;
  intercepts: AirlockInterceptItem[];
  safety_pulse: string;
  inspected_timestamp: string;
}


