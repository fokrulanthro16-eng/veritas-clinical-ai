'use client';

import React, { useState } from 'react';
import { DollarSign, FileCheck, Layers, Pill, ShieldAlert, Search, TrendingUp, Tag, Plus } from 'lucide-react';
import { ICD10Result, DrugAlert } from '../types/clinical';

interface BillingSidebarProps {
  totalReimbursement: number;
  icdCodes: ICD10Result[];
  medications: string[];
  drugAlerts: DrugAlert[];
  onManualICDLookup?: (term: string) => void;
}

export const BillingSidebar: React.FC<BillingSidebarProps> = ({
  totalReimbursement,
  icdCodes,
  medications,
  drugAlerts
}) => {
  const [manualQuery, setManualQuery] = useState('');
  const [manualResult, setManualResult] = useState<ICD10Result | null>(null);
  const [searching, setSearching] = useState(false);

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch('http://localhost:8000/api/tools/lookup-icd10', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptom_or_diagnosis: manualQuery })
      });
      const data = await res.json();
      setManualResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="bg-ehr-card border border-ehr-border rounded-xl p-5 shadow-lg flex flex-col h-[520px] overflow-hidden">
      {/* RCM Header */}
      <div className="flex items-center justify-between border-b border-ehr-border pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <h2 className="font-bold text-sm tracking-wide text-white uppercase">
            Autonomous RCM & Coding
          </h2>
        </div>
        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
          Auto-Tagging Active
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {/* Reimbursement Ticker Card */}
        <div className="bg-gradient-to-br from-slate-900 to-emerald-950/40 p-4 rounded-lg border border-emerald-900/60 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Total Projected CMS Reimbursement</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-emerald-300">
              ${totalReimbursement.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              ({icdCodes.length} billable codes)
            </span>
          </div>
        </div>

        {/* Live ICD-10 Diagnostic Codes */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-cyan-400" />
              Extracted ICD-10 Diagnoses
            </span>
            <span className="text-[10px] font-mono text-slate-500">{icdCodes.length} Detected</span>
          </div>

          {icdCodes.length === 0 ? (
            <div className="bg-slate-900/60 rounded-lg p-3 text-center border border-dashed border-slate-800 text-xs text-slate-500">
              Awaiting clinical dialogue cues (e.g. &quot;chest pain&quot;, &quot;diabetes&quot;, &quot;hypertension&quot;)
            </div>
          ) : (
            <div className="space-y-2">
              {icdCodes.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/90 border border-slate-800 hover:border-cyan-800/80 p-3 rounded-lg transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold bg-cyan-950 border border-cyan-800 text-cyan-300 px-2 py-0.5 rounded">
                        {item.primary_icd10}
                      </span>
                      <span className="text-[11px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                        {item.category}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-semibold text-emerald-400">
                      +${item.reimbursement_estimate_usd || item.reimbursement_usd || 0}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1.5 font-medium leading-tight">
                    {item.description}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-800/80 pt-1.5">
                    <span>CPT: <strong className="text-slate-300">{item.cpt_code}</strong></span>
                    <span>RVU: <strong className="text-slate-300">{item.rvu}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detected Medications */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-amber-400" />
              Active Medications
            </span>
            <span className="text-[10px] font-mono text-slate-500">{medications.length} Identified</span>
          </div>

          {medications.length === 0 ? (
            <div className="bg-slate-900/60 rounded-lg p-2.5 text-center border border-dashed border-slate-800 text-xs text-slate-500">
              No medications mentioned yet
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {medications.map((med, i) => (
                <span
                  key={i}
                  className="bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs font-mono px-2.5 py-1 rounded-md capitalize"
                >
                  {med}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Deterministic ICD-10 Sandbox Tester */}
        <div className="pt-2 border-t border-ehr-border">
          <form onSubmit={handleManualSearch} className="flex gap-1.5">
            <input
              type="text"
              placeholder="Test ICD lookup (e.g. Asthma)..."
              value={manualQuery}
              onChange={(e) => setManualQuery(e.target.value)}
              className="bg-slate-900 border border-ehr-border text-xs px-2.5 py-1.5 rounded-md flex-1 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={searching}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1"
            >
              <Search className="w-3 h-3" />
              <span>Lookup</span>
            </button>
          </form>

          {manualResult && (
            <div className="mt-2 p-2 bg-slate-950 border border-cyan-900/50 rounded-md text-xs font-mono">
              <div className="flex justify-between text-cyan-400 font-bold">
                <span>{manualResult.primary_icd10}</span>
                <span className="text-emerald-400">${manualResult.reimbursement_estimate_usd || manualResult.reimbursement_usd}</span>
              </div>
              <p className="text-slate-300 text-[11px] mt-0.5">{manualResult.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
