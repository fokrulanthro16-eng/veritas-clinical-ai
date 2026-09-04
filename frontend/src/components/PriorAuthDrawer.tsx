'use client';

import React from 'react';
import { 
  ShieldCheck, 
  X, 
  CheckCircle2, 
  Send, 
  FileText, 
  Lock, 
  Building2, 
  HeartHandshake, 
  Sparkles, 
  RefreshCw 
} from 'lucide-react';
import { PriorAuthPackage, PriorAuthSubmitResult } from '../types/clinical';

interface PriorAuthDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  priorAuthPackage: PriorAuthPackage | null;
  submitResult: PriorAuthSubmitResult | null;
  onSubmit: (packageData?: PriorAuthPackage) => Promise<any>;
  isSubmitting: boolean;
  onGenerate: () => Promise<any>;
  isGenerating: boolean;
}

export const PriorAuthDrawer: React.FC<PriorAuthDrawerProps> = ({
  isOpen,
  onClose,
  priorAuthPackage,
  submitResult,
  onSubmit,
  isSubmitting,
  onGenerate,
  isGenerating
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-2xl h-full bg-[#050C0A]/95 border-l border-teal-500/30 text-slate-100 shadow-2xl p-6 overflow-y-auto flex flex-col justify-between backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-teal-500/20">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-[#00F2C2] shadow-[0_0_15px_rgba(0,242,194,0.2)]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Prior-Auth Auto-Pilot (ePA)
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00F2C2]/15 text-[#00F2C2] border border-[#00F2C2]/30">
                    HL7 Da Vinci PAS
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Instant electronic prior authorization justification & clearance engine
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          {!priorAuthPackage ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-3xl bg-teal-500/10 border border-teal-500/20 text-[#00F2C2] flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">
                Generate Instant Prior Authorization Justification
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
                Veritas will synthesize your clinical notes, 12-lead ECG telemetry, and biomarkers against InterQual & MCG clinical guidelines.
              </p>
              <button
                onClick={onGenerate}
                disabled={isGenerating}
                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#00F2C2] to-emerald-400 text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,242,194,0.3)] disabled:opacity-50 inline-flex items-center space-x-2"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                <span>{isGenerating ? 'Synthesizing Clinical Evidence...' : 'Compile Prior Authorization Packet'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {/* Approval Success Banner if submitted */}
              {submitResult && (
                <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.25)] relative overflow-hidden">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                          Instant Payer Determination: APPROVED
                        </span>
                        <span className="font-mono text-xs font-bold text-white bg-emerald-500/20 px-2 py-0.5 rounded-lg border border-emerald-500/40">
                          {submitResult.authorization_number}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 mt-1">
                        {submitResult.payer_response}
                      </p>
                      <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] font-mono text-slate-300">
                        <div>Tracking ID: <span className="text-emerald-300">{submitResult.clearinghouse_tracking_id}</span></div>
                        <div>Valid Until: <span className="text-emerald-300">{submitResult.expiration_date}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Status & Payer Header Bar */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-xl bg-teal-950/30 border border-teal-800/30">
                  <div className="text-[10px] text-slate-400 font-medium">Payer</div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-teal-400" />
                    {priorAuthPackage.payer.payer_name}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-teal-950/30 border border-teal-800/30">
                  <div className="text-[10px] text-slate-400 font-medium">Review Priority</div>
                  <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    {priorAuthPackage.urgency}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-teal-950/30 border border-teal-800/30">
                  <div className="text-[10px] text-slate-400 font-medium">MCG Compliance</div>
                  <div className="text-xs font-bold text-[#00F2C2] mt-0.5">
                    {priorAuthPackage.clinical_necessity_justification.mcg_compliance_score}% Match
                  </div>
                </div>
              </div>

              {/* Requested Procedure Card */}
              <div className="p-3.5 rounded-2xl bg-[#061412]/80 border border-teal-500/25">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300">
                    Requested Procedure / Service
                  </span>
                  <span className="font-mono text-xs font-bold text-amber-300 px-2 py-0.5 bg-amber-500/10 rounded-md border border-amber-500/20">
                    CPT {priorAuthPackage.requested_service.cpt_code}
                  </span>
                </div>
                <div className="text-sm font-semibold text-white">
                  {priorAuthPackage.requested_service.service_name}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Setting: <span className="text-slate-200">{priorAuthPackage.requested_service.setting}</span> · Est. Total: <span className="text-[#00F2C2] font-semibold">${priorAuthPackage.requested_service.estimated_cost_usd.toLocaleString()}</span>
                </div>
              </div>

              {/* Clinical Necessity Justification Section */}
              <div className="p-4 rounded-2xl bg-[#061412]/80 border border-teal-500/25 space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#00F2C2]">
                  <FileText className="w-4 h-4" />
                  <span>Clinical Necessity & Guideline Justification</span>
                </div>

                <div>
                  <div className="text-[11px] text-slate-400 font-medium">Primary Indication:</div>
                  <div className="text-xs font-medium text-slate-200 mt-0.5">
                    {priorAuthPackage.clinical_necessity_justification.primary_indication}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-400 font-medium">Documented Diagnostic Evidence:</div>
                  <div className="mt-1 space-y-1">
                    {priorAuthPackage.clinical_necessity_justification.diagnostic_evidence.map((item, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#00F2C2] mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-400 font-medium">InterQual / MCG Criteria Met:</div>
                  <div className="mt-1 space-y-1">
                    {priorAuthPackage.clinical_necessity_justification.interqual_criteria_met.map((item, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-xs text-teal-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-400 font-medium">Prior Conservative Therapies Failed:</div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {priorAuthPackage.clinical_necessity_justification.failed_conservative_therapies.map((item, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Physician Attestation Card */}
              <div className="p-3 rounded-xl bg-teal-950/30 border border-teal-800/30 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-[#00F2C2]" />
                  <div>
                    <div className="text-white font-semibold">
                      {priorAuthPackage.physician_attestation.attending_physician}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      NPI: {priorAuthPackage.physician_attestation.npi} · Signed & Sealed
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                  SHA-256 Validated
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {priorAuthPackage && (
          <div className="pt-4 border-t border-teal-500/20 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 transition-all"
            >
              Close
            </button>

            {!submitResult ? (
              <button
                onClick={() => onSubmit()}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#00F2C2] to-emerald-400 text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,242,194,0.3)] disabled:opacity-50 flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{isSubmitting ? 'Transmitting to Payer Gateway...' : 'Submit to Payer Gateway (1-Click ePA)'}</span>
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all flex items-center space-x-2"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>ePA Clearance Active · Done</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
