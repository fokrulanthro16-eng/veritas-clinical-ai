'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  X, 
  Send, 
  FileText, 
  Copy, 
  Check, 
  RefreshCw, 
  CheckCircle2, 
  ShieldAlert, 
  Scale, 
  FileCode,
  Terminal,
  Layers
} from 'lucide-react';
import { Edi837pTransactionPackage, Edi837pTransmitResult, DenialAppealPackage } from '../types/clinical';

interface Edi837pModalProps {
  isOpen: boolean;
  onClose: () => void;
  ediPackage: Edi837pTransactionPackage | null;
  transmitResult: Edi837pTransmitResult | null;
  appealPackage: DenialAppealPackage | null;
  isTransmitting: boolean;
  isDraftingAppeal: boolean;
  onTransmit: () => Promise<any>;
  onDraftAppeal: () => Promise<any>;
}

export const Edi837pModal: React.FC<Edi837pModalProps> = ({
  isOpen,
  onClose,
  ediPackage,
  transmitResult,
  appealPackage,
  isTransmitting,
  isDraftingAppeal,
  onTransmit,
  onDraftAppeal
}) => {
  const [activeTab, setActiveTab] = useState<'edi' | 'appeal' | 'ack'>('edi');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
      <div 
        className="w-full max-w-4xl max-h-[90vh] bg-[#050C0A]/95 border border-teal-500/30 text-slate-100 rounded-3xl shadow-2xl p-6 overflow-hidden flex flex-col justify-between backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-teal-500/20">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-[#00F2C2] shadow-[0_0_15px_rgba(0,242,194,0.2)]">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  ANSI ASC X12N 837P Clearinghouse Gateway
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00F2C2]/15 text-[#00F2C2] border border-[#00F2C2]/30">
                  Version 005010X222A1
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Direct Electronic Data Interchange (EDI) Claim Submission & Medico-Legal Appeal System
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

        {/* Tab Navigation */}
        <div className="flex items-center justify-between my-3.5 border-b border-white/[0.08] pb-2">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('edi')}
              className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition uppercase tracking-wider ${
                activeTab === 'edi' ? 'bg-[#00F2C2] text-[#040E0C] shadow-md' : 'bg-[#0A1614] text-[#7E9F97] hover:text-[#00F2C2] border border-teal-900/40'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>ANSI 837P Transaction</span>
            </button>

            <button
              onClick={() => setActiveTab('appeal')}
              className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition uppercase tracking-wider ${
                activeTab === 'appeal' ? 'bg-[#00F2C2] text-[#040E0C] shadow-md' : 'bg-[#0A1614] text-[#7E9F97] hover:text-[#00F2C2] border border-teal-900/40'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Medico-Legal Appeal Brief {appealPackage ? '✓' : ''}</span>
            </button>

            {transmitResult && (
              <button
                onClick={() => setActiveTab('ack')}
                className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition uppercase tracking-wider ${
                  activeTab === 'ack' ? 'bg-emerald-400 text-slate-950 shadow-md' : 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>277CA Clearinghouse Ack</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-medium">Gateway:</span>
            <span className="font-mono text-[#00F2C2] bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
              Optum / Change Healthcare v5.0
            </span>
          </div>
        </div>

        {/* Tab 1: Raw EDI 837P */}
        {activeTab === 'edi' && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="grid grid-cols-4 gap-2 mb-3 text-xs">
              <div className="p-2 rounded-xl bg-teal-950/30 border border-teal-800/30">
                <div className="text-[10px] text-slate-400 font-medium">Billing CPT</div>
                <div className="text-xs font-bold text-white font-mono mt-0.5">
                  {ediPackage?.primary_cpt || '99215'} (Mod -25)
                </div>
              </div>
              <div className="p-2 rounded-xl bg-teal-950/30 border border-teal-800/30">
                <div className="text-[10px] text-slate-400 font-medium">Claim Amount</div>
                <div className="text-xs font-bold text-[#00F2C2] font-mono mt-0.5">
                  ${ediPackage?.total_claim_amount_usd?.toFixed(2) || '446.00'} USD
                </div>
              </div>
              <div className="p-2 rounded-xl bg-teal-950/30 border border-teal-800/30">
                <div className="text-[10px] text-slate-400 font-medium">Control ID</div>
                <div className="text-xs font-bold text-slate-200 font-mono mt-0.5">
                  {ediPackage?.transaction_control_id || '948201401'}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-teal-950/30 border border-teal-800/30">
                <div className="text-[10px] text-slate-400 font-medium">X12 Segments</div>
                <div className="text-xs font-bold text-slate-200 font-mono mt-0.5">
                  {ediPackage?.segments_count || 29} Segments
                </div>
              </div>
            </div>

            <div className="relative flex-1 bg-[#020706] rounded-2xl border border-teal-900/60 p-4 font-mono text-xs text-teal-300 overflow-y-auto max-h-[350px] scrollbar-thin">
              <button
                onClick={() => handleCopy(ediPackage?.edi_raw || '')}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-teal-950/80 hover:bg-teal-900 border border-teal-700/40 text-[#00F2C2] text-xs flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy 837P'}</span>
              </button>

              <pre className="whitespace-pre leading-relaxed">
                {ediPackage?.edi_raw || 'Generating EDI 837P stream...'}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 2: Medico-Legal Denial Appeal */}
        {activeTab === 'appeal' && (
          <div className="flex-1 overflow-hidden flex flex-col">
            {!appealPackage ? (
              <div className="py-12 text-center my-auto">
                <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-[#00F2C2] flex items-center justify-center mx-auto mb-3">
                  <Scale className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">
                  Automated Medico-Legal Reconsideration & Appeal Synthesizer
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                  Generates an attorney-grade appeal brief citing AMA CPT 2024 MDM guidelines, 42 CFR § 422.568 statutory prompt-pay rules, and timestamped transcript evidence.
                </p>
                <button
                  onClick={onDraftAppeal}
                  disabled={isDraftingAppeal}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#00F2C2] to-emerald-400 text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,242,194,0.25)] disabled:opacity-50 inline-flex items-center space-x-2"
                >
                  {isDraftingAppeal ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Scale className="w-4 h-4" />}
                  <span>{isDraftingAppeal ? 'Synthesizing Statutory Brief...' : 'Draft Formal Level-1 Appeal Brief'}</span>
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="font-mono text-xs font-bold text-[#00F2C2]">
                    Ref: {appealPackage.appeal_id} · Statutory: {appealPackage.statutory_reference}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Expected Overturn Probability: {appealPackage.expected_overturn_rate_pct}%
                  </span>
                </div>

                <div className="relative flex-1 bg-[#020706] rounded-2xl border border-teal-900/60 p-4 font-mono text-xs text-slate-200 overflow-y-auto max-h-[350px] scrollbar-thin">
                  <button
                    onClick={() => handleCopy(appealPackage.appeal_brief_markdown)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-teal-950/80 hover:bg-teal-900 border border-teal-700/40 text-[#00F2C2] text-xs flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Brief'}</span>
                  </button>

                  <pre className="whitespace-pre-wrap leading-relaxed font-mono">
                    {appealPackage.appeal_brief_markdown}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: 277CA Clearinghouse Ack */}
        {activeTab === 'ack' && transmitResult && (
          <div className="flex-1 p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  277CA Electronic Claim Acknowledgment: ACCEPTED
                </h3>
                <p className="text-xs text-emerald-300">
                  Transaction received & queued for adjudication by Payer Gateway.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-black/40 border border-emerald-800/30">
                <span className="text-slate-400 text-[10px]">Clearinghouse Tx ID:</span>
                <div className="font-bold text-white text-xs mt-0.5">{transmitResult.clearinghouse_tx_id}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-emerald-800/30">
                <span className="text-slate-400 text-[10px]">Payer Ack Code:</span>
                <div className="font-bold text-emerald-300 text-xs mt-0.5">{transmitResult.payer_response_code}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-emerald-800/30">
                <span className="text-slate-400 text-[10px]">Estimated Remittance:</span>
                <div className="font-bold text-slate-200 text-xs mt-0.5">{transmitResult.estimated_remittance_date}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-emerald-800/30">
                <span className="text-slate-400 text-[10px]">Clearinghouse Hash:</span>
                <div className="font-bold text-slate-400 text-[10px] truncate mt-0.5">{transmitResult.electronic_hash}</div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-teal-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {!appealPackage && (
              <button
                onClick={onDraftAppeal}
                disabled={isDraftingAppeal}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 text-teal-300 border border-teal-700/40 transition-all flex items-center space-x-1.5"
              >
                {isDraftingAppeal ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Scale className="w-3.5 h-3.5" />}
                <span>Draft Medico-Legal Appeal</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 transition-all"
            >
              Close
            </button>

            {!transmitResult ? (
              <button
                onClick={onTransmit}
                disabled={isTransmitting}
                className="px-5 py-2 rounded-xl font-bold text-xs bg-gradient-to-r from-[#00F2C2] to-emerald-400 text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,242,194,0.25)] disabled:opacity-50 flex items-center space-x-2"
              >
                {isTransmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{isTransmitting ? 'Transmitting to Optum Clearinghouse...' : 'Transmit 837P to Clearinghouse'}</span>
              </button>
            ) : (
              <div className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>837P Transmitted & Acknowledged</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
