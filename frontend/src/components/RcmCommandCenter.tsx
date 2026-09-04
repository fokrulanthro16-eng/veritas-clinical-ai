'use client';

import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  ShieldAlert,
  Tag,
  Gauge,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Zap,
  Sparkles
} from 'lucide-react';
import {
  ICD10Result,
  DrugAlert,
  MDMAnalysis,
  DenialRadarResult,
  SentinelReport
} from '../types/clinical';

interface RcmCommandCenterProps {
  totalReimbursement: number;
  icdCodes: ICD10Result[];
  medications: string[];
  drugAlerts: DrugAlert[];
  mdmAnalysis: MDMAnalysis | null;
  denialRadar: DenialRadarResult | null;
  sentinelReport: SentinelReport | null;
  onAutoMitigate?: (flagId: string) => void;
  mitigationToast?: string | null;
}

export const RcmCommandCenter: React.FC<RcmCommandCenterProps> = ({
  totalReimbursement,
  icdCodes,
  medications,
  drugAlerts,
  mdmAnalysis,
  denialRadar,
  sentinelReport,
  onAutoMitigate,
  mitigationToast
}) => {
  const [expandedFlag, setExpandedFlag] = useState<string | null>(null);
  const [showMdmExplainer, setShowMdmExplainer] = useState(false);
  const [mitigatingId, setMitigatingId] = useState<string | null>(null);

  const selectedCpt = mdmAnalysis?.recommended_cpt || '99214';
  const mdmLevel = mdmAnalysis?.mdm_level || 4;
  const baseReimbursement = mdmAnalysis?.estimated_reimbursement_usd || (selectedCpt === '99215' ? 235.00 : 198.50);
  const addOnReimbursement = Math.max(0, Number((totalReimbursement - baseReimbursement).toFixed(2)));

  const handleMitigateClick = (flagId: string) => {
    setMitigatingId(flagId);
    if (onAutoMitigate) {
      onAutoMitigate(flagId);
    }
    setTimeout(() => setMitigatingId(null), 1200);
  };

  return (
    <div className="obsidian-card p-5 flex flex-col h-[600px] overflow-hidden">
      {/* RCM Header */}
      <div className="flex items-center justify-between border-b border-[#123831] pb-3.5 mb-3.5">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-[#00F2C2]/15 border border-[#00F2C2]/30 flex items-center justify-center text-[#00F2C2]">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-xs tracking-wider text-white uppercase">
              Autonomous RCM & Denial Radar
            </h2>
            <p className="text-[10px] text-[#7E9F97] font-medium">AMA / CMS MDM Rule Engine</p>
          </div>
        </div>
        <span className="text-[9px] font-mono font-bold text-[#00F2C2] bg-[#050B0A] px-3 py-1 rounded-full border border-[#123831] uppercase">
          Real-time Audit
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-thin text-xs">
        {/* Mitigation Toast Banner */}
        {mitigationToast && (
          <div className="p-3 bg-[#0A2621] border border-[#00F2C2] rounded-2xl flex items-center justify-between animate-fadeIn text-xs text-[#00F2C2] shadow-lg">
            <div className="flex items-center space-x-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#00F2C2]" />
              <span className="text-white">{mitigationToast}</span>
            </div>
            <span className="text-[10px] font-bold bg-[#00F2C2] text-[#040E0C] px-2.5 py-0.5 rounded-full font-mono uppercase">
              Risk &lt; 5%
            </span>
          </div>
        )}

        {/* Live Reimbursement Breakdown Card */}
        <div className="glass-nested bg-gradient-to-br from-[#00F2C2]/15 via-black/40 to-[#10B981]/10 border border-[#00F2C2]/30 p-4 rounded-2xl text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00F2C2]/15 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7E9F97]">Projected Claim Valuation</span>
            <TrendingUp className="w-4 h-4 text-[#00F2C2]" />
          </div>

          <div className="mt-1 flex items-baseline justify-between relative z-10">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl font-black font-mono text-[#00F2C2]">
                ${totalReimbursement.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-slate-300">USD</span>
            </div>
            {mdmAnalysis && (
              <span className="text-xs font-mono font-bold text-[#00F2C2] bg-[#00F2C2]/15 px-3 py-1 rounded-full border border-[#00F2C2]/30">
                {mdmAnalysis.total_rvu} Total RVU
              </span>
            )}
          </div>

          {/* Value Breakdown */}
          <div className="mt-3 pt-2.5 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-[#7E9F97] relative z-10">
            <span>Base E/M ({selectedCpt}): <strong className="text-white">${baseReimbursement.toFixed(2)}</strong></span>
            <span>Add-ons: <strong className="text-[#00F2C2]">+${addOnReimbursement.toFixed(2)}</strong></span>
          </div>
        </div>

        {/* CMS E/M Complexity Meter */}
        <div className="glass-nested p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-[#00F2C2]" />
              CMS E/M Medical Decision Making
            </span>
            <button
              onClick={() => setShowMdmExplainer(!showMdmExplainer)}
              className="text-[11px] text-[#00F2C2] hover:text-[#00D9AD] font-bold flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>2-of-3 Rule</span>
            </button>
          </div>

          {/* Level 2-5 Segmented Pills */}
          <div className="grid grid-cols-4 gap-1.5 text-center font-mono my-2.5">
            {[
              { code: '99212', lvl: 2, label: 'Lvl 2 (Min)' },
              { code: '99213', lvl: 3, label: 'Lvl 3 (Low)' },
              { code: '99214', lvl: 4, label: 'Lvl 4 (Mod)' },
              { code: '99215', lvl: 5, label: 'Lvl 5 (High)' }
            ].map((item) => {
              const isSelected = selectedCpt === item.code;
              return (
                <div
                  key={item.code}
                  className={`py-2 px-1 rounded-xl border text-[11px] transition ${
                    isSelected
                      ? 'bg-[#00F2C2] text-[#040E0C] border-[#00F2C2] font-black shadow-lg shadow-[#00F2C2]/20'
                      : 'bg-white/[0.04] text-slate-400 border-white/[0.07]'
                  }`}
                >
                  <div className="font-bold">{item.code}</div>
                  <div className="text-[9px] opacity-90">{item.label}</div>
                </div>
              );
            })}
          </div>

          {showMdmExplainer && mdmAnalysis && (
            <div className="mt-2.5 p-3 bg-white/[0.04] border border-white/[0.07] rounded-xl text-[11px] text-slate-300 font-mono space-y-1 shadow-inner">
              <p><strong className="text-[#00F2C2]">Problems:</strong> Level {mdmAnalysis.two_of_three_rule_audit.levels_evaluated.problems_level} ({mdmAnalysis.two_of_three_rule_audit.problems_breakdown.label})</p>
              <p><strong className="text-[#00F2C2]">Data:</strong> Level {mdmAnalysis.two_of_three_rule_audit.levels_evaluated.data_level} ({mdmAnalysis.two_of_three_rule_audit.data_breakdown.label})</p>
              <p><strong className="text-[#00F2C2]">Risk:</strong> Level {mdmAnalysis.two_of_three_rule_audit.levels_evaluated.risk_level} ({mdmAnalysis.two_of_three_rule_audit.risk_breakdown.label})</p>
            </div>
          )}
        </div>

        {/* Payer Denial Radar with High-Contrast Dushi Pill Button */}
        {denialRadar && (
          <div className="glass-nested p-4 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-[#00F2C2]" />
                Payer Denial Risk Radar
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border ${
                  denialRadar.denial_risk_score <= 10
                    ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                    : denialRadar.denial_risk_score <= 35
                    ? 'bg-amber-950/80 text-amber-400 border-amber-800'
                    : 'bg-rose-950/80 text-rose-400 border-rose-800'
                }`}
              >
                {denialRadar.clean_claim_probability}% Clean Prob ({denialRadar.denial_risk_score}% Risk)
              </span>
            </div>

            {/* Audit Flags with Signature Dushi Pill Button */}
            <div className="space-y-2.5">
              {denialRadar.audit_flags.length === 0 ? (
                <div className="flex items-center space-x-2 text-emerald-300 text-xs p-3 bg-emerald-950/40 rounded-xl border border-emerald-800/60 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#00F2C2]" />
                  <span>Clean claim compliance verified. Zero audit penalties.</span>
                </div>
              ) : (
                denialRadar.audit_flags.map((flag) => {
                  const flagKey = flag.flag_id || flag.code;
                  const isExp = expandedFlag === flagKey;
                  const isMitigating = mitigatingId === flagKey;

                  return (
                    <div
                      key={flagKey}
                      className="bg-white/[0.04] border border-rose-900/60 rounded-2xl p-3.5 text-xs space-y-2 shadow-md"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                          <span className="font-bold text-white">{flag.title}</span>
                        </div>
                        <button
                          onClick={() => setExpandedFlag(isExp ? null : flagKey)}
                          className="text-[#7E9F97] hover:text-white"
                        >
                          {isExp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                        {flag.message}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-white/[0.07]">
                        <span className="text-[10px] font-mono text-[#7E9F97]">
                          {flag.payer_reference}
                        </span>

                        {/* High-Contrast Dushi Signature Pill Button */}
                        <button
                          onClick={() => handleMitigateClick(flagKey)}
                          disabled={isMitigating}
                          className="rounded-full bg-[#00F2C2] hover:bg-[#00D9AD] text-[#040E0C] font-black px-4 py-1.5 text-xs tracking-wider uppercase shadow-lg shadow-[#00F2C2]/20 transition-all flex items-center gap-1.5"
                        >
                          {isMitigating ? (
                            <Sparkles className="w-3.5 h-3.5 animate-spin text-[#040E0C]" />
                          ) : (
                            <Zap className="w-3.5 h-3.5 text-[#040E0C] fill-current" />
                          )}
                          <span>{isMitigating ? 'Mitigating...' : 'Auto-Resolve with AI'}</span>
                        </button>
                      </div>

                      {isExp && (
                        <div className="p-3 bg-[#00F2C2]/[0.08] rounded-xl text-[11px] font-medium text-emerald-200 border border-[#00F2C2]/30">
                          <strong className="text-[#00F2C2]">Remediation Strategy:</strong> {flag.suggested_fix}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Validated ICD-10-CM Diagnostic Tags */}
        <div className="glass-nested p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-[#00F2C2]" />
              Validated ICD-10 Diagnostic Codes
            </span>
            <span className="text-[11px] font-mono text-[#00F2C2] font-bold">{icdCodes.length} Codes</span>
          </div>

          <div className="space-y-2">
            {icdCodes.map((item, idx) => (
              <div key={idx} className="bg-white/[0.04] p-2.5 rounded-xl border border-white/[0.06] text-xs shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#00F2C2] bg-[#00F2C2]/10 border border-[#00F2C2]/30 px-2 py-0.5 rounded-md text-[11px]">
                    {item.primary_icd10}
                  </span>
                  <span className="font-mono text-[#00F2C2] font-bold text-[11px]">
                    +${item.reimbursement_estimate_usd || item.reimbursement_usd || 0}
                  </span>
                </div>
                <p className="text-slate-300 mt-1 text-[11px] font-medium leading-tight">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
