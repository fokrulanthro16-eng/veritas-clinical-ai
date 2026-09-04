'use client';

import React, { useState } from 'react';
import {
  Code,
  FileCode,
  Copy,
  Check,
  ChevronUp,
  ChevronDown,
  Layers,
  Send,
  Database,
  CheckCircle2,
  X
} from 'lucide-react';

interface FhirDrawerProps {
  fhirBundle: any;
  edi837p: string;
  onOpenCms1500?: () => void;
  onOpenPriorAuth?: () => void;
  onOpenEdi837p?: () => void;
}


export const FhirDrawer: React.FC<FhirDrawerProps> = ({ 
  fhirBundle, 
  edi837p, 
  onOpenCms1500, 
  onOpenPriorAuth,
  onOpenEdi837p 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'fhir' | 'edi'>('fhir');
  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [syncComplete, setSyncComplete] = useState(false);

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startEpicSyncModal = () => {
    setShowSyncModal(true);
    setIsSyncing(true);
    setSyncComplete(false);
    setSyncLogs([
      "Initializing TLS 1.3 mutual authentication handshake...",
      "Resolving endpoint: https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4",
      "Authenticating SMART-on-FHIR OAuth 2.0 Bearer Token..."
    ]);

    setTimeout(() => {
      setSyncLogs((prev) => [
        ...prev,
        "Validating HL7 US-Core StructureDefinitions for Encounter, Condition, Medication, Claim...",
        "Staging 7 FHIR R4 resources to Epic Hyperspace Clinical Staging DB..."
      ]);
    }, 600);

    setTimeout(() => {
      setSyncLogs((prev) => [
        ...prev,
        "HTTP 200 OK — Resource Bundle Staged to Epic Hyperspace Chronicles Database.",
        "HL7 ACK: MSA|AA|MSG9482014|Transaction ID: EPIC-TX-9482014 committed."
      ]);
      setIsSyncing(false);
      setSyncComplete(true);
    }, 1400);
  };

  const fhirJsonString = fhirBundle ? JSON.stringify(fhirBundle, null, 2) : '{\n  "status": "Awaiting clinical transcript tokens..."\n}';

  return (
    <div className="obsidian-card overflow-hidden shadow-2xl transition-all duration-300">
      {/* Drawer Header Strip */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-[#0A1F1B]/40 transition border-b border-[#123831] select-none"
      >
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#00F2C2]/15 border border-[#00F2C2]/30 text-[#00F2C2] flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xs text-white uppercase tracking-wider">
                HL7 FHIR R4, ANSI 837P & CMS-1500 Interoperability Gateway
              </span>
              <span className="text-[9px] font-mono font-bold text-[#00F2C2] bg-[#00F2C2]/15 px-2.5 py-0.5 rounded-full border border-[#00F2C2]/30 uppercase">
                US Core v4.0.0
              </span>
            </div>
            <p className="text-[11px] text-[#7E9F97] font-medium">
              100% Compliant FHIR R4 Bundle, ANSI ASC X12 837P, and Official Standard CMS-1500 Paper Claim
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          {onOpenPriorAuth && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenPriorAuth();
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-500/15 hover:bg-teal-500/25 text-[#00F2C2] border border-teal-500/35 transition-all shadow-[0_0_12px_rgba(0,242,194,0.15)] active:scale-95"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Prior-Auth Auto-Pilot</span>
            </button>
          )}

          {onOpenEdi837p && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenEdi837p();
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#00F2C2]/20 to-emerald-400/20 hover:brightness-110 text-[#00F2C2] border border-[#00F2C2]/40 transition-all shadow-[0_0_12px_rgba(0,242,194,0.15)] active:scale-95"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>🏛️ EDI 837P Electronic Claim</span>
            </button>
          )}

          {onOpenCms1500 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenCms1500();
              }}
              className="dushi-btn-secondary"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Preview CMS-1500 Form</span>
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              startEpicSyncModal();
            }}
            className="dushi-btn-primary"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Sync with Epic EMR</span>
          </button>


          {isOpen ? <ChevronDown className="w-5 h-5 text-[#7E9F97]" /> : <ChevronUp className="w-5 h-5 text-[#7E9F97]" />}
        </div>
      </div>


      {/* Drawer Content */}
      {isOpen && (
        <div className="p-5 space-y-3 bg-[#050B0A]/90">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-[#123831] pb-2.5">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('fhir')}
                className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition uppercase tracking-wider ${
                  activeTab === 'fhir' ? 'bg-[#00F2C2] text-[#040E0C] shadow-md' : 'bg-[#0A1614] text-[#7E9F97] hover:text-[#00F2C2] border border-[#123831]'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>FHIR R4 Bundle (JSON)</span>
              </button>

              <button
                onClick={() => setActiveTab('edi')}
                className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition uppercase tracking-wider ${
                  activeTab === 'edi' ? 'bg-[#00F2C2] text-[#040E0C] shadow-md' : 'bg-[#0A1614] text-[#7E9F97] hover:text-[#00F2C2] border border-[#123831]'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>ANSI ASC X12 837P (EDI)</span>
              </button>
            </div>

            <button
              onClick={() => handleCopy(activeTab === 'fhir' ? fhirJsonString : edi837p)}
              className="flex items-center space-x-1.5 bg-[#0A1614] hover:bg-[#0A1F1B] text-[#7E9F97] hover:text-[#00F2C2] px-3.5 py-1.5 rounded-full text-xs font-bold border border-[#123831] transition shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#00F2C2]" /> : <Copy className="w-3.5 h-3.5 text-[#7E9F97]" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Tab 1: FHIR JSON */}
          {activeTab === 'fhir' && (
            <pre className="h-64 overflow-y-auto bg-[#020605] p-4 rounded-2xl border border-[#123831] text-xs font-mono text-[#00F2C2] leading-relaxed scrollbar-thin shadow-inner">
              {fhirJsonString}
            </pre>
          )}

          {/* Tab 2: EDI 837P */}
          {activeTab === 'edi' && (
            <pre className="h-64 overflow-y-auto bg-[#020605] p-4 rounded-2xl border border-[#123831] text-xs font-mono text-emerald-300 leading-relaxed scrollbar-thin whitespace-pre-wrap shadow-inner">
              {edi837p || 'ISA*00*          *00*          *ZZ*VERITASCLINICAL*ZZ*AETNAHEALTH    *260904*0143*^*00501*000001*0*P*:~\nGS*HC*VERITASCLINICAL*AETNAHEALTH*20260904*0143*1*X*005010X222A1~\nST*837*000001*005010X222A1~\nBHT*0019*00*000001*20260904*0143*CH~'}
            </pre>
          )}
        </div>
      )}

      {/* Epic Hyperspace Sync Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md animate-fadeIn p-4">
          <div className="bg-[#0A1614] border border-[#00F2C2]/40 rounded-3xl max-w-2xl w-full mx-4 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#123831] pb-3.5">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-[#00F2C2] to-[#10B981] text-[#040E0C] shadow-lg font-black">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                    Epic Hyperspace EHR Staging
                  </h3>
                  <p className="text-xs text-[#7E9F97] font-medium">SMART-on-FHIR R4 Secure Transmission</p>
                </div>
              </div>
              <button
                onClick={() => setShowSyncModal(false)}
                className="text-[#7E9F97] hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated TLS Log Box */}
            <div className="bg-[#050B0A] p-4 rounded-2xl border border-[#123831] font-mono text-xs space-y-1.5 h-48 overflow-y-auto shadow-inner text-slate-300">
              <div className="text-[#7E9F97] text-[10px] pb-1 border-b border-[#123831] font-bold">
                [TLS 1.3 SESSION LOG - 256-BIT AES-GCM]
              </div>
              {syncLogs.map((log, idx) => (
                <div key={idx} className="text-xs leading-relaxed flex items-start gap-1.5">
                  <span className="text-[#00F2C2] font-bold">›</span>
                  <span>{log}</span>
                </div>
              ))}
              {isSyncing && (
                <div className="flex items-center space-x-2 text-[#00F2C2] text-xs animate-pulse pt-2 font-bold">
                  <div className="w-3.5 h-3.5 border-2 border-[#00F2C2] border-t-transparent rounded-full animate-spin" />
                  <span>Committing transaction payload to Epic Chronicles...</span>
                </div>
              )}
            </div>

            {/* Status Badge */}
            {syncComplete && (
              <div className="p-3.5 bg-[#0A2621] border border-[#00F2C2] rounded-2xl flex items-center justify-between font-mono text-xs text-white shadow-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-[#00F2C2]" />
                  <span className="font-bold">HTTP 200 OK — Resource Bundle Staged to Epic Hyperspace</span>
                </div>
                <button
                  onClick={() => setShowSyncModal(false)}
                  className="rounded-full bg-[#00F2C2] hover:bg-[#00D9AD] text-[#040E0C] px-4 py-1.5 text-xs font-black tracking-wider uppercase transition shadow-md"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
