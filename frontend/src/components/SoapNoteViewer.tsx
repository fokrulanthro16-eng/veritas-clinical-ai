'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Copy, Check, Edit3, Sparkles } from 'lucide-react';

import { SoapNote, VisionAnalysisResult, LongitudinalTrajectoryResponse } from '../types/clinical';
import { VisionDiagnosticsDropzone } from './VisionDiagnosticsDropzone';
import { LongitudinalTrajectoryBanner } from './LongitudinalTrajectoryBanner';

interface SoapNoteViewerProps {
  soapNote: SoapNote | null;
  onUpdateSoapNote?: (updated: SoapNote) => void;
  onAnalyzeVision?: (imageData?: string, imageType?: string) => Promise<any>;
  visionAnalysis?: VisionAnalysisResult | null;
  isAnalyzingVision?: boolean;
  longitudinalTrajectory?: LongitudinalTrajectoryResponse | null;
  onInterventionClick?: (intervention: string) => void;
}


export const SoapNoteViewer: React.FC<SoapNoteViewerProps> = ({ 
  soapNote, 
  onUpdateSoapNote,
  onAnalyzeVision,
  visionAnalysis,
  isAnalyzingVision,
  longitudinalTrajectory,
  onInterventionClick
}) => {

  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [localNote, setLocalNote] = useState<SoapNote | null>(soapNote);

  useEffect(() => {
    setLocalNote(soapNote);
  }, [soapNote]);

  const handleFieldChange = (section: string, field: string, value: any) => {
    if (!localNote) return;
    const updated = {
      ...localNote,
      subjective: { ...(localNote.subjective || {}) },
      objective: {
        ...(localNote.objective || {}),
        vitals: { ...(localNote.objective?.vitals || {}) },
        physical_exam: [...(localNote.objective?.physical_exam || [])]
      },
      assessment: {
        ...(localNote.assessment || {}),
        diagnoses: [...(localNote.assessment?.diagnoses || [])]
      },
      plan: {
        ...(localNote.plan || {}),
        medications: [...(localNote.plan?.medications || [])],
        orders_and_diagnostics: [...(localNote.plan?.orders_and_diagnostics || [])]
      }
    } as any;

    if (section === 'subjective' || section === 'assessment' || section === 'plan') {
      updated[section][field] = value;
    } else if (section === 'vitals') {
      updated.objective.vitals[field] = value;
    }
    setLocalNote(updated);
    if (onUpdateSoapNote) {
      onUpdateSoapNote(updated);
    }
  };

  const copySection = (name: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(name);
    setTimeout(() => setCopiedSection(null), 1800);
  };

  const copyFullSOAP = () => {
    if (!localNote) return;
    const providerName = localNote.provider ?? 'Dr. Sarah Lin, MD (NPI: 1942857102)';
    const chiefComplaint = localNote.subjective?.chief_complaint ?? 'Awaiting intake documentation...';
    const hpi = localNote.subjective?.history_of_present_illness ?? 'Documenting present illness...';
    const ros = localNote.subjective?.review_of_systems ?? 'Review of systems non-contributory.';

    const bp = localNote.objective?.vitals?.blood_pressure ?? '120/80 mmHg';
    const hr = localNote.objective?.vitals?.heart_rate ?? '72 bpm';
    const spo2 = localNote.objective?.vitals?.oxygen_saturation ?? '98% on room air';
    const temp = localNote.objective?.vitals?.temperature ?? '98.6 °F';
    const pe = (localNote.objective?.physical_exam || []).join('; ') || 'Physical exam normal.';

    const summary = localNote.assessment?.clinical_summary ?? 'Clinical assessment pending.';
    const diagnoses = (localNote.assessment?.diagnoses || [])
      .map((d: any) => `[${d.primary_icd10 || d.code || 'ICD-10'}] ${d.description || ''}`)
      .join('; ') || 'Primary diagnosis pending.';

    const meds = (localNote.plan?.medications || []).join('; ') || 'No active prescription changes.';
    const orders = (localNote.plan?.orders_and_diagnostics || []).join('; ') || 'Routine orders.';
    const lifestyle = localNote.plan?.lifestyle_interventions ?? 'Standard clinical guidance.';
    const followUp = localNote.plan?.follow_up ?? 'Follow-up in 4 weeks.';

    const full = `=====================================================
VERITAS CLINICAL AI - ELECTRONIC HEALTH RECORD (EHR)
Provider: ${providerName}
=====================================================

[SUBJECTIVE]
• Chief Complaint: ${chiefComplaint}
• HPI: ${hpi}
• ROS: ${ros}

[OBJECTIVE]
• Vitals: BP ${bp} | HR ${hr} | SpO2 ${spo2} | Temp ${temp}
• Physical Exam: ${pe}

[ASSESSMENT]
• Summary: ${summary}
• Diagnoses: ${diagnoses}

[PLAN]
• Rx: ${meds}
• Orders: ${orders}
• Lifestyle: ${lifestyle}
• Follow-up: ${followUp}
=====================================================`;
    navigator.clipboard.writeText(full);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // Safe fallback extractions
  const subjective = localNote?.subjective;
  const objective = localNote?.objective;
  const vitals = objective?.vitals;
  const physicalExam = Array.isArray(objective?.physical_exam) ? objective.physical_exam : [];
  const assessment = localNote?.assessment;
  const diagnoses = Array.isArray(assessment?.diagnoses) ? assessment.diagnoses : [];
  const plan = localNote?.plan;
  const medications = Array.isArray(plan?.medications) ? plan.medications : [];
  const orders = Array.isArray(plan?.orders_and_diagnostics) ? plan.orders_and_diagnostics : [];


  return (
    <div className="obsidian-card p-5 flex flex-col h-[600px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#123831] pb-3.5 mb-3.5">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-[#00F2C2]/15 border border-[#00F2C2]/30 flex items-center justify-center text-[#00F2C2]">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Gemini Clinical Canvas (SOAP)
            </h2>
            <p className="text-[10px] text-[#7E9F97] font-medium">Structured EHR Documentation</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {localNote && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                isEditing ? 'bg-[#00F2C2] text-[#040E0C] border-[#00F2C2] shadow-md' : 'bg-[#050B0A] text-[#7E9F97] hover:text-[#00F2C2] border-[#123831] hover:border-[#00F2C2]/40'
              }`}
            >
              <Edit3 className="w-3 h-3" />
              <span>{isEditing ? 'Done' : 'Inline Edit'}</span>
            </button>
          )}

          {localNote && (
            <button
              onClick={copyFullSOAP}
              className="flex items-center space-x-1.5 bg-[#050B0A] hover:bg-[#0A1F1B] text-[#7E9F97] hover:text-[#00F2C2] px-3.5 py-1.5 rounded-full text-xs font-bold border border-[#123831] hover:border-[#00F2C2]/40 transition shadow-sm"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5 text-[#00F2C2]" /> : <Copy className="w-3.5 h-3.5 text-[#7E9F97]" />}
              <span>{copiedAll ? 'Copied' : 'Copy All'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Quadrants Scroll Container */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin text-xs">
        {/* V5 Longitudinal Patient Memory & Trajectory Banner */}
        <LongitudinalTrajectoryBanner
          trajectory={longitudinalTrajectory || null}
          onInterventionClick={onInterventionClick}
        />

        {/* V4 Multimodal Diagnostics Intake Dropzone */}
        {onAnalyzeVision && (
          <VisionDiagnosticsDropzone
            onAnalyze={onAnalyzeVision}
            visionAnalysis={visionAnalysis || null}
            isAnalyzing={Boolean(isAnalyzingVision)}
          />
        )}


        {!localNote ? (
          <div className="p-8 text-center flex flex-col items-center justify-center rounded-2xl bg-teal-950/20 border border-teal-500/10">
            <div className="w-12 h-12 rounded-2xl bg-[#0A1F1B] border border-[#123831] flex items-center justify-center mb-3 text-[#00F2C2] shadow-lg">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Awaiting Ambient Clinical Stream</h3>
            <p className="text-[11px] text-[#7E9F97] mt-1 max-w-xs leading-relaxed font-medium">
              Start scenario or voice stream to auto-synthesize real-time Subjective, Objective, Assessment, and Plan notes.
            </p>
          </div>
        ) : (
          <>

        {/* [S] Subjective */}
        <div className="glass-nested p-4 hover:border-[#00F2C2]/40 transition shadow-md">
          <div className="flex items-center justify-between text-[#00F2C2] font-bold text-xs mb-2 border-b border-white/[0.08] pb-1.5">
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded-lg bg-[#00F2C2]/20 text-[#00F2C2] font-mono font-black flex items-center justify-center text-[10px] border border-[#00F2C2]/30">S</span>
              <span className="uppercase tracking-wider">Subjective & History of Present Illness</span>
            </div>
            <button
              onClick={() => copySection('subjective', `Chief Complaint: ${subjective?.chief_complaint ?? 'Awaiting intake...'}\nHPI: ${subjective?.history_of_present_illness ?? 'Documenting...'}`)}
              className="text-[#7E9F97] hover:text-[#00F2C2] flex items-center gap-1 text-[10px] font-medium"
            >
              {copiedSection === 'subjective' ? <Check className="w-3 h-3 text-[#00F2C2]" /> : <Copy className="w-3 h-3" />}
              <span>{copiedSection === 'subjective' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="space-y-2 pt-0.5">
            <div>
              <span className="text-[#7E9F97] text-[10px] font-bold uppercase tracking-wider">Chief Complaint:</span>
              {isEditing ? (
                <input
                  type="text"
                  value={subjective?.chief_complaint || ''}
                  onChange={(e) => handleFieldChange('subjective', 'chief_complaint', e.target.value)}
                  className="w-full bg-white/[0.05] border border-[#00F2C2]/40 rounded-xl px-2.5 py-1.5 text-white mt-1 text-xs focus:outline-none"
                />
              ) : (
                <p className="text-white font-bold mt-0.5">{subjective?.chief_complaint ?? 'Awaiting intake documentation...'}</p>
              )}
            </div>

            <div>
              <span className="text-[#7E9F97] text-[10px] font-bold uppercase tracking-wider">HPI:</span>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={subjective?.history_of_present_illness || ''}
                  onChange={(e) => handleFieldChange('subjective', 'history_of_present_illness', e.target.value)}
                  className="w-full bg-white/[0.05] border border-[#00F2C2]/40 rounded-xl px-2.5 py-1.5 text-white mt-1 text-xs focus:outline-none"
                />
              ) : (
                <p className="text-slate-300 leading-relaxed text-xs mt-0.5 font-medium">{subjective?.history_of_present_illness ?? 'Documenting history of present illness from ambient dialogue...'}</p>
              )}
            </div>
          </div>
        </div>

        {/* [O] Objective & Vitals */}
        <div className="glass-nested p-4 hover:border-[#00F2C2]/40 transition shadow-md">
          <div className="flex items-center justify-between text-[#00F2C2] font-bold text-xs mb-2 border-b border-white/[0.08] pb-1.5">
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded-lg bg-[#00F2C2]/20 text-[#00F2C2] font-mono font-black flex items-center justify-center text-[10px] border border-[#00F2C2]/30">O</span>
              <span className="uppercase tracking-wider">Objective, Vitals & Exam</span>
            </div>
            <button
              onClick={() => copySection('objective', `Vitals: BP ${vitals?.blood_pressure ?? '120/80'}, HR ${vitals?.heart_rate ?? '72'}\nExam: ${physicalExam.join('; ') || 'Normal'}`)}
              className="text-[#7E9F97] hover:text-[#00F2C2] flex items-center gap-1 text-[10px] font-medium"
            >
              {copiedSection === 'objective' ? <Check className="w-3 h-3 text-[#00F2C2]" /> : <Copy className="w-3 h-3" />}
              <span>{copiedSection === 'objective' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-white/[0.04] p-2.5 rounded-xl border border-white/[0.06] font-mono text-[11px] my-2 shadow-inner">
            <div>
              <span className="text-[#7E9F97] text-[10px] uppercase font-bold">BP:</span>
              <div className="text-white font-bold">{vitals?.blood_pressure ?? '120/80 mmHg'}</div>
            </div>
            <div>
              <span className="text-[#7E9F97] text-[10px] uppercase font-bold">HR:</span>
              <div className="text-white font-bold">{vitals?.heart_rate ?? '72 bpm'}</div>
            </div>
            <div>
              <span className="text-[#7E9F97] text-[10px] uppercase font-bold">SpO2:</span>
              <div className="text-white font-bold">{vitals?.oxygen_saturation ?? '98% RA'}</div>
            </div>
          </div>

          <div className="space-y-1 text-xs text-slate-300 font-medium">
            {physicalExam.length > 0 ? (
              physicalExam.map((pe, idx) => (
                <div key={idx} className="leading-snug">• {pe}</div>
              ))
            ) : (
              <div className="text-slate-500 italic">• Physical examination findings pending clinician review.</div>
            )}
          </div>
        </div>

        {/* [A] Assessment */}
        <div className="glass-nested p-4 hover:border-[#00F2C2]/40 transition shadow-md">
          <div className="flex items-center justify-between text-[#00F2C2] font-bold text-xs mb-2 border-b border-white/[0.08] pb-1.5">
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded-lg bg-[#00F2C2]/20 text-[#00F2C2] font-mono font-black flex items-center justify-center text-[10px] border border-[#00F2C2]/30">A</span>
              <span className="uppercase tracking-wider">Assessment & Diagnoses</span>
            </div>
            <button
              onClick={() => copySection('assessment', diagnoses.map((d: any) => `[${d.primary_icd10 || d.code || 'ICD-10'}] ${d.description || ''}`).join('\n') || 'Diagnoses pending.')}
              className="text-[#7E9F97] hover:text-[#00F2C2] flex items-center gap-1 text-[10px] font-medium"
            >
              {copiedSection === 'assessment' ? <Check className="w-3 h-3 text-[#00F2C2]" /> : <Copy className="w-3 h-3" />}
              <span>{copiedSection === 'assessment' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <p className="text-xs text-slate-200 mb-2 font-medium">{assessment?.clinical_summary ?? 'Awaiting diagnostic synthesis...'}</p>

          <div className="space-y-1.5">
            {diagnoses.length > 0 ? (
              diagnoses.map((diag: any, idx: number) => (
                <div key={idx} className="bg-white/[0.04] px-3 py-2 rounded-xl border border-white/[0.06] flex items-center justify-between text-xs shadow-sm">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-[#00F2C2] bg-[#00F2C2]/10 px-2 py-0.5 rounded-md text-[11px] border border-[#00F2C2]/30">
                      {diag.primary_icd10 || diag.code || 'ICD-10'}
                    </span>
                    <span className="text-white font-medium">{diag.description || 'Diagnosis documented.'}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-slate-500 italic text-xs">No formal ICD-10 diagnoses validated yet.</div>
            )}
          </div>
        </div>

        {/* [P] Plan */}
        <div className="glass-nested p-4 hover:border-[#00F2C2]/40 transition shadow-md">
          <div className="flex items-center justify-between text-[#00F2C2] font-bold text-xs mb-2 border-b border-white/[0.08] pb-1.5">
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded-lg bg-[#00F2C2]/20 text-[#00F2C2] font-mono font-black flex items-center justify-center text-[10px] border border-[#00F2C2]/30">P</span>
              <span className="uppercase tracking-wider">Plan & Therapeutics</span>
            </div>
            <button
              onClick={() => copySection('plan', `Rx: ${medications.join(', ') || 'None'}\nOrders: ${orders.join(', ') || 'None'}`)}
              className="text-[#7E9F97] hover:text-[#00F2C2] flex items-center gap-1 text-[10px] font-medium"
            >
              {copiedSection === 'plan' ? <Check className="w-3 h-3 text-[#00F2C2]" /> : <Copy className="w-3 h-3" />}
              <span>{copiedSection === 'plan' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-[#7E9F97] text-[10px] font-bold uppercase tracking-wider">Prescriptions / Rx:</span>
              <ul className="list-disc list-inside text-slate-200 pl-1 mt-1 space-y-0.5 font-medium">
                {medications.length > 0 ? (
                  medications.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))
                ) : (
                  <li className="text-slate-500 italic list-none">No active prescription orders recorded.</li>
                )}
              </ul>
            </div>
            <div>
              <span className="text-[#7E9F97] text-[10px] font-bold uppercase tracking-wider">Orders / Diagnostics:</span>
              <ul className="list-disc list-inside text-slate-200 pl-1 mt-1 space-y-0.5 font-medium">
                {orders.length > 0 ? (
                  orders.map((o, i) => (
                    <li key={i}>{o}</li>
                  ))
                ) : (
                  <li className="text-slate-500 italic list-none">Routine clinical follow-up as indicated.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
};
