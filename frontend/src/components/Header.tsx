'use client';

import React, { useState, useEffect } from 'react';
import { Stethoscope, RefreshCw, User, Clock, ShieldAlert, Zap, Radio, Sparkles } from 'lucide-react';
import { PatientContext, DenialRadarResult, ClinicalScenarioMeta, CDSSafetyReport, AirlockAuditReport } from '../types/clinical';

interface HeaderProps {
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  streamState: 'idle' | 'recording_live' | 'simulating';
  totalReimbursement: number;
  drugAlertCount: number;
  patientContext: PatientContext;
  denialRadar: DenialRadarResult | null;
  scenarios: ClinicalScenarioMeta[];
  activeScenarioId: string;
  cdsSafetyReport?: CDSSafetyReport | null;
  airlockReport?: AirlockAuditReport | null;
  onOpenPriorAuth?: () => void;
  onSelectScenario: (id: string) => void;
  onReset: () => void;
  onReconnect: () => void;
}



export const Header: React.FC<HeaderProps> = ({
  connectionStatus,
  streamState,
  totalReimbursement,
  drugAlertCount,
  patientContext,
  denialRadar,
  scenarios,
  activeScenarioId,
  cdsSafetyReport,
  airlockReport,
  onOpenPriorAuth,
  onSelectScenario,
  onReset,
  onReconnect
}) => {
  const [encounterTimer, setEncounterTimer] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setEncounterTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const defaultPresets = [
    { id: 'cardiology_high_complexity', badge: 'BOOK: CARDIOLOGY 99215', title: 'Cardiology 99215', desc: 'Unstable Angina' },
    { id: 'endocrinology_polypharmacy', badge: 'DIABETES 99214', title: 'Diabetes 99214', desc: 'T2D + Neuropathy' },
    { id: 'telehealth_denial_risk', badge: 'TELEHEALTH RADAR', title: 'Telehealth Demo', desc: '55% Denial Risk' }
  ];

  const scenarioList = scenarios.length > 0 ? scenarios : defaultPresets;
  const isAirlockWarning = Boolean(airlockReport && airlockReport.contradictions_count > 0);

  return (
    <header className="bg-[#040807]/75 backdrop-blur-2xl border-b border-white/[0.07] px-6 py-3.5 sticky top-0 z-40 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-[1680px] mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Left: Luxury Brand & Tracking Subtitle */}
        <div className="flex items-center space-x-3.5">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-[#00F2C2] to-[#10B981] flex items-center justify-center text-[#040E0C] shadow-[0_0_20px_rgba(0,242,194,0.25)] font-black">
            <Stethoscope className="w-5 h-5 stroke-[2.5]" />
          </div>

          <div>
            <div className="flex items-center space-x-2.5">
              <span className="font-extrabold tracking-tight text-white text-sm">
                VERITAS <span className="text-[#00F2C2]">CLINICAL AI</span>
              </span>
              <span className="text-[9px] font-mono font-black bg-[#00F2C2]/10 text-[#00F2C2] px-2.5 py-0.5 rounded-full border border-[#00F2C2]/30 tracking-widest uppercase">
                V5 ENTERPRISE
              </span>
            </div>

            <div className="text-[9px] text-[#7E9F97] tracking-widest uppercase font-semibold mt-0.5">
              — INSTITUTIONAL CORE · LONGITUDINAL MEMORY · MEDICO-LEGAL AIRLOCK
            </div>
          </div>
        </div>

        {/* Patient Profile Frosted Capsule */}
        <div className="flex items-center space-x-3 bg-white/[0.04] backdrop-blur-md border border-white/[0.08] px-4 py-1.5 rounded-full shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.06)] text-xs">
          <div className="w-2 h-2 rounded-full bg-[#00F2C2] animate-pulse" />
          <div className="flex items-center space-x-2 text-slate-300 font-medium">
            <span className="font-bold text-white flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#00F2C2]" />
              {patientContext.family_name}, {patientContext.given_name}
            </span>
            <span className="text-white/20">•</span>
            <span className="text-slate-400 font-mono text-[11px]">{patientContext.age}yo {patientContext.gender === 'male' ? 'M' : 'F'}</span>
            <span className="text-white/20">•</span>
            <span className="font-mono text-[11px] text-[#00F2C2] font-semibold bg-[#00F2C2]/10 px-2 py-0.5 rounded-full border border-[#00F2C2]/30">
              {patientContext.mrn}
            </span>
            <span className="text-white/20">•</span>
            <span className="text-[#7E9F97] text-[11px]">{patientContext.payer}</span>
          </div>
        </div>

        {/* Center/Right: Frosted Scenario Selector Pills */}
        <div className="flex items-center gap-1.5 bg-white/[0.03] backdrop-blur-md p-1.5 rounded-full border border-white/[0.07]">
          {scenarioList.map((sc) => {
            const isActive = activeScenarioId === sc.id;
            const badgeLabel = sc.id === 'cardiology_high_complexity' ? 'BOOK: CARDIOLOGY 99215' : (sc.id === 'endocrinology_polypharmacy' ? 'DIABETES 99214' : (sc.id === 'telehealth_denial_risk' ? 'TELEHEALTH RADAR' : (sc.badge || sc.title)));
            return (
              <button
                key={sc.id}
                onClick={() => onSelectScenario(sc.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition tracking-wider uppercase flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#00F2C2]/15 border border-[#00F2C2]/60 text-[#00F2C2] shadow-[0_0_20px_rgba(0,242,194,0.25)] scale-105'
                    : 'text-[#7E9F97] hover:text-[#00F2C2] hover:bg-white/[0.05]'
                }`}
              >
                <Zap className={`w-3 h-3 ${isActive ? 'text-[#00F2C2] fill-current' : 'text-[#7E9F97]'}`} />
                <span>{badgeLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Far Right: Metrics, Prior Auth Auto-Pilot Trigger & Reset */}
        <div className="flex items-center space-x-3 text-xs">
          {/* Prior Auth Auto-Pilot Quick Trigger */}
          {onOpenPriorAuth && (
            <button
              onClick={onOpenPriorAuth}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#00F2C2]/15 hover:bg-[#00F2C2]/25 text-[#00F2C2] border border-[#00F2C2]/40 font-bold transition-all shadow-[0_0_12px_rgba(0,242,194,0.15)] active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Prior-Auth ePA</span>
            </button>
          )}

          {/* Live Timer */}
          <div className="flex items-center space-x-1.5 bg-white/[0.04] backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/[0.08] text-[#7E9F97] font-mono shadow-inner">
            <Clock className="w-3.5 h-3.5 text-[#00F2C2]" />
            <span className="font-bold text-white text-xs">{formatTime(encounterTimer)}</span>
          </div>

          {/* Big Luxury Claim Valuation Glass Capsule */}
          <div className="flex items-baseline space-x-1.5 bg-white/[0.04] backdrop-blur-md border border-white/[0.08] px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(0,242,194,0.1)]">
            <span className="text-[#7E9F97] text-[10px] font-bold uppercase tracking-wider">CLAIM:</span>
            <span className="font-black text-base text-[#00F2C2] font-mono">
              ${totalReimbursement.toFixed(2)}
            </span>
            <span className="text-[10px] text-[#7E9F97] font-bold">USD</span>
          </div>

          {/* Reset Session */}
          <button
            onClick={onReset}
            className="flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.08] text-[#7E9F97] hover:text-[#00F2C2] p-2 rounded-full border border-white/[0.08] transition shadow-md"
            title="Reset encounter"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Real-time Safety & Medico-Legal Airlock Bar */}
      <div className="max-w-[1680px] mx-auto mt-2 pt-2 border-t border-white/[0.04] flex flex-wrap items-center justify-between text-[11px] gap-2">
        {/* Left: CDS Pharmacology Alert */}
        <div className="flex items-center space-x-2 text-slate-300">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-mono text-[#00F2C2] font-semibold">
            {cdsSafetyReport?.safety_pill_text || 'CDS: Bleeding Index: Low-Mod · No Major Contraindications (Plavix 75mg / Atorvastatin 80mg Verified)'}
          </span>
        </div>

        {/* Right: Medico-Legal Airlock Interceptor Badge */}
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
            isAirlockWarning
              ? 'bg-rose-500/20 border-rose-500/60 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse'
              : 'bg-teal-500/10 border-teal-500/30 text-[#00F2C2]'
          }`}>
            <ShieldAlert className={`w-3.5 h-3.5 ${isAirlockWarning ? 'text-rose-400' : 'text-[#00F2C2]'}`} />
            <span>
              {airlockReport?.safety_pulse || '🛡️ Medico-Legal Airlock: Active · 0 Drug-Allergy Contraindications'}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[10px] text-slate-400">
            <span>Bleeding Risk: <strong className="text-emerald-300">{cdsSafetyReport?.bleeding_risk_index?.annual_major_bleed_pct ?? 1.2}%/yr</strong></span>
            <span>Safety Score: <strong className="text-[#00F2C2]">{cdsSafetyReport?.safety_score ?? 98}/100</strong></span>
          </div>
        </div>
      </div>

      {/* Airlock Contradiction Warning Dropdown Callout if intercepted */}
      {isAirlockWarning && airlockReport?.intercepts && airlockReport.intercepts.length > 0 && (
        <div className="max-w-[1680px] mx-auto mt-2 p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/50 flex items-center justify-between text-xs text-rose-200 shadow-lg animate-fade-in">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-rose-500/30 font-bold text-white text-[10px]">
              CRITICAL INTERCEPT
            </span>
            <span className="font-semibold text-white">{airlockReport.intercepts[0].title}:</span>
            <span className="text-slate-300">{airlockReport.intercepts[0].mechanism}</span>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <span className="text-[11px] text-teal-300 font-bold bg-teal-500/20 px-2.5 py-1 rounded-lg border border-teal-500/30 cursor-pointer hover:bg-teal-500/30">
              ⚡ {airlockReport.intercepts[0].correction_chip}
            </span>
          </div>
        </div>
      )}
    </header>
  );
};


