'use client';

import React, { useState } from 'react';
import { Header } from '../components/Header';

import { AudioWaveform } from '../components/AudioWaveform';
import { AgentIntercom } from '../components/AgentIntercom';
import { TranscriptFeed } from '../components/TranscriptFeed';
import { SoapNoteViewer } from '../components/SoapNoteViewer';
import { RcmCommandCenter } from '../components/RcmCommandCenter';
import { DrugAlertModal } from '../components/DrugAlertModal';
import { FhirDrawer } from '../components/FhirDrawer';
import { Cms1500Modal } from '../components/Cms1500Modal';
import { PriorAuthDrawer } from '../components/PriorAuthDrawer';
import { Edi837pModal } from '../components/Edi837pModal';
import { useClinicalStream } from '../hooks/useClinicalStream';
import { Terminal, Shield } from 'lucide-react';

export default function Home() {
  const {
    connectionStatus,
    streamState,
    transcripts,
    currentPartial,
    scenarios,
    activeScenarioId,
    patientContext,
    rcmState,
    mdmAnalysis,
    denialRadar,
    sentinelReport,
    fhirBundle,
    edi837p,
    soapNote,
    audioLevel,
    audioFftData,
    systemLogs,
    mitigationToast,
    executedTools,
    cms1500Data,
    visionAnalysis,
    isAnalyzingVision,
    priorAuthPackage,
    isGeneratingPriorAuth,
    priorAuthSubmitResult,
    isSubmittingPriorAuth,
    isPriorAuthOpen,
    setIsPriorAuthOpen,
    cdsSafetyReport,
    longitudinalTrajectory,
    airlockReport,
    edi837pPackage,
    edi837pTransmitResult,
    appealPackage,
    isEdi837pModalOpen,
    setIsEdi837pModalOpen,
    isTransmitting837p,
    isDraftingAppeal,
    fetchLongitudinalTrajectory,
    auditAirlock,
    generate837p,
    transmit837p,
    draftAppeal,
    analyzeClinicalVision,
    generatePriorAuth,
    submitPriorAuth,
    startLiveMic,
    startScenario,
    stopStream,
    resetSession,
    updateSoapNote,
    autoMitigateDenial,
    askCopilot,
    executeVoiceCommand,
    fetchCMS1500,
    reconnect
  } = useClinicalStream();

  const [isCms1500Open, setIsCms1500Open] = useState(false);



  const handleOpenCms1500 = async () => {
    await fetchCMS1500();
    setIsCms1500Open(true);
  };

  return (
    <div className="min-h-screen bg-[#040807] text-slate-100 selection:bg-[#00F2C2] selection:text-[#040E0C] relative overflow-x-hidden">
      {/* Layer 1: Radiant Atmospheric Spotlights */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[750px] h-[450px] bg-teal-500/20 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed -bottom-20 -left-20 w-[550px] h-[550px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-1/3 -right-20 w-[450px] h-[450px] bg-teal-400/12 rounded-full blur-[130px] pointer-events-none z-0" />

      {/* Layer 2: Sublime Clinical Watermark ("Jol Chobi") - Striking Luminous Vector Wave */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.16] mix-blend-screen z-0 overflow-hidden"
        style={{
          maskImage: 'radial-gradient(circle at center, black 60%, transparent 95%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 60%, transparent 95%)'
        }}
      >
        <svg
          className="w-full h-full min-h-[1080px]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1920 1080"
          preserveAspectRatio="none"
        >
          <defs>
            {/* High-Contrast Biometric Grid Pattern */}
            <pattern id="medical-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#00F2C2" fillOpacity="0.45" />
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00F2C2" strokeWidth="0.4" strokeOpacity="0.3" />
            </pattern>

            {/* Glowing ECG Wave Gradient */}
            <linearGradient id="ecg-glow-main" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00F2C2" stopOpacity="0.2" />
              <stop offset="25%" stopColor="#00F2C2" stopOpacity="1" />
              <stop offset="50%" stopColor="#10B981" stopOpacity="0.95" />
              <stop offset="75%" stopColor="#00F2C2" stopOpacity="1" />
              <stop offset="100%" stopColor="#00F2C2" stopOpacity="0.2" />
            </linearGradient>

            {/* Glowing Secondary Rhythm Gradient */}
            <linearGradient id="ecg-glow-sec" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.1" />
              <stop offset="35%" stopColor="#00F2C2" stopOpacity="0.8" />
              <stop offset="65%" stopColor="#34D399" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.1" />
            </linearGradient>

            {/* Glow Filter */}
            <filter id="glow-filter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Coordinate Lattice */}
          <rect width="100%" height="100%" fill="url(#medical-grid)" />

          {/* Primary High-Precision Cardiac Telemetry Waveform 1 */}
          <path
            d="M0,280 L200,280 L215,260 L230,305 L245,140 L270,440 L295,280 L325,280 L350,240 L385,280 L620,280 L635,260 L650,305 L665,130 L690,450 L715,280 L745,280 L770,240 L805,280 L1040,280 L1055,260 L1070,305 L1085,140 L1110,440 L1135,280 L1165,280 L1190,240 L1225,280 L1460,280 L1475,260 L1490,305 L1505,135 L1530,445 L1555,280 L1585,280 L1610,240 L1645,280 L1920,280"
            fill="none"
            stroke="url(#ecg-glow-main)"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow-filter)"
          />

          {/* Secondary Cardiac Waveform 2 */}
          <path
            d="M0,720 L160,720 L175,705 L190,740 L205,580 L230,870 L255,720 L285,720 L310,680 L345,720 L580,720 L595,705 L610,740 L625,570 L650,880 L675,720 L705,720 L730,680 L765,720 L1000,720 L1015,705 L1030,740 L1045,580 L1070,870 L1095,720 L1125,720 L1150,680 L1185,720 L1420,720 L1435,705 L1450,740 L1465,575 L1490,875 L1515,720 L1545,720 L1570,680 L1605,720 L1920,720"
            fill="none"
            stroke="url(#ecg-glow-sec)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow-filter)"
          />

          {/* Biometric Synaptic Nodes & Vital Wave Pulses */}
          <g stroke="#00F2C2" strokeWidth="1" fill="none">
            {/* Node Cluster 1 */}
            <circle cx="245" cy="140" r="4" fill="#00F2C2" fillOpacity="0.8" />
            <circle cx="245" cy="140" r="10" stroke="#00F2C2" strokeOpacity="0.4" strokeDasharray="3 3" />
            <line x1="245" y1="140" x2="350" y2="80" strokeOpacity="0.6" />
            <circle cx="350" cy="80" r="3" fill="#10B981" fillOpacity="0.7" />

            {/* Node Cluster 2 */}
            <circle cx="665" cy="130" r="4" fill="#00F2C2" fillOpacity="0.8" />
            <circle cx="665" cy="130" r="10" stroke="#00F2C2" strokeOpacity="0.4" strokeDasharray="3 3" />
            <line x1="665" y1="130" x2="770" y2="70" strokeOpacity="0.6" />
            <circle cx="770" cy="70" r="3" fill="#10B981" fillOpacity="0.7" />

            {/* Node Cluster 3 */}
            <circle cx="1085" cy="140" r="4" fill="#00F2C2" fillOpacity="0.8" />
            <circle cx="1085" cy="140" r="10" stroke="#00F2C2" strokeOpacity="0.4" strokeDasharray="3 3" />
            <line x1="1085" y1="140" x2="1190" y2="80" strokeOpacity="0.6" />
            <circle cx="1190" cy="80" r="3" fill="#10B981" fillOpacity="0.7" />

            {/* Node Cluster 4 */}
            <circle cx="1505" cy="135" r="4" fill="#00F2C2" fillOpacity="0.8" />
            <circle cx="1505" cy="135" r="10" stroke="#00F2C2" strokeOpacity="0.4" strokeDasharray="3 3" />
            <line x1="1505" y1="135" x2="1610" y2="75" strokeOpacity="0.6" />
            <circle cx="1610" cy="75" r="3" fill="#10B981" fillOpacity="0.7" />
          </g>

          {/* Faint Medical Target Reticles */}
          <g stroke="#00F2C2" strokeWidth="0.8" strokeOpacity="0.3" fill="none">
            <circle cx="480" cy="500" r="28" />
            <line x1="440" y1="500" x2="520" y2="500" />
            <line x1="480" y1="460" x2="480" y2="540" />

            <circle cx="1380" cy="500" r="28" />
            <line x1="1340" y1="500" x2="1420" y2="500" />
            <line x1="1380" y1="460" x2="1380" y2="540" />
          </g>
        </svg>
      </div>

      {/* Header Bar */}
      <Header
        connectionStatus={connectionStatus}
        streamState={streamState}
        totalReimbursement={rcmState.total_reimbursement_usd}
        drugAlertCount={rcmState.drug_alerts.length}
        patientContext={patientContext}
        denialRadar={denialRadar}
        scenarios={scenarios}
        activeScenarioId={activeScenarioId}
        cdsSafetyReport={cdsSafetyReport}
        airlockReport={airlockReport}
        onOpenPriorAuth={() => setIsPriorAuthOpen(true)}
        onSelectScenario={startScenario}
        onReset={resetSession}
        onReconnect={reconnect}
      />

      {/* Main Grid Layout */}
      <main className="max-w-[1680px] w-full mx-auto px-4 sm:px-6 py-6 space-y-5 relative z-10">
        {/* Top Row: Ambient Microphone & Clinical Voice Co-Pilot */}
        <AudioWaveform
          streamState={streamState}
          audioLevel={audioLevel}
          audioFftData={audioFftData}
          onStartLiveMic={startLiveMic}
          onStop={stopStream}
          onAskCopilot={askCopilot}
        />

        {/* Real-time Pharmacology Safety Contraindication Alert */}
        <DrugAlertModal alerts={rcmState.drug_alerts} />

        {/* Autonomous Voice Agent Intercom Dock */}
        <AgentIntercom
          onExecuteCommand={executeVoiceCommand}
          executedTools={executedTools}
        />

        {/* Core 3-Column Grid (12 Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Col 1 to 4: Ambient Dialogue Stream */}
          <div className="lg:col-span-4">
            <TranscriptFeed
              transcripts={transcripts}
              currentPartial={currentPartial}
              isStreaming={streamState !== 'idle'}
            />
          </div>

          {/* Col 5 to 8: Gemini Clinical Canvas (SOAP) + Vision Diagnostics + Longitudinal Trajectory */}
          <div className="lg:col-span-4">
            <SoapNoteViewer
              soapNote={soapNote}
              onUpdateSoapNote={updateSoapNote}
              onAnalyzeVision={analyzeClinicalVision}
              visionAnalysis={visionAnalysis}
              isAnalyzingVision={isAnalyzingVision}
              longitudinalTrajectory={longitudinalTrajectory}
              onInterventionClick={(intervention) => {
                if (soapNote) {
                  const updated: any = {
                    ...soapNote,
                    plan: {
                      ...soapNote.plan,
                      orders_and_diagnostics: [
                        ...(soapNote.plan?.orders_and_diagnostics || []),
                        intervention
                      ]
                    }
                  };
                  updateSoapNote(updated);
                }
              }}
            />
          </div>

          {/* Col 9 to 12: Autonomous RCM & Denial Radar */}
          <div className="lg:col-span-4">
            <RcmCommandCenter
              totalReimbursement={rcmState.total_reimbursement_usd}
              icdCodes={rcmState.icd10_codes}
              medications={rcmState.medications}
              drugAlerts={rcmState.drug_alerts}
              mdmAnalysis={mdmAnalysis}
              denialRadar={denialRadar}
              sentinelReport={sentinelReport}
              onAutoMitigate={autoMitigateDenial}
              mitigationToast={mitigationToast}
            />
          </div>
        </div>

        {/* Bottom Floating Interoperability Gateway Drawer */}
        <FhirDrawer
          fhirBundle={fhirBundle}
          edi837p={edi837p}
          onOpenCms1500={handleOpenCms1500}
          onOpenPriorAuth={() => setIsPriorAuthOpen(true)}
          onOpenEdi837p={() => {
            generate837p();
            setIsEdi837pModalOpen(true);
          }}
        />

        {/* Telemetry & Stream Events Obsidian Card */}
        <div className="obsidian-card p-4 font-mono text-xs text-slate-400">
          <div className="flex items-center justify-between border-b border-[#123831] pb-2.5 mb-2.5">
            <div className="flex items-center space-x-2 text-white">
              <Terminal className="w-4 h-4 text-[#00F2C2]" />
              <span className="font-bold uppercase tracking-wider text-[11px]">
                Veritas Clinical AI Telemetry & Stream Events
              </span>
            </div>
            <div className="flex items-center space-x-3 text-[11px] text-[#7E9F97] font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00F2C2] animate-pulse" /> WS: {connectionStatus}
              </span>
              <span>Audio: {streamState}</span>
              <span>MDM: {mdmAnalysis?.recommended_cpt || 'Pending'}</span>
              <span className="text-[#00F2C2] font-bold">Denial Risk: {denialRadar?.denial_risk_score ?? 0}%</span>
            </div>
          </div>
          <div className="h-14 overflow-y-auto space-y-1 text-[11px] pr-1 scrollbar-thin">
            {systemLogs.length === 0 ? (
              <span className="text-slate-500 italic">No stream events logged.</span>
            ) : (
              systemLogs.map((log, index) => (
                <div key={index} className="text-slate-300 leading-tight">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Official CMS-1500 Paper Claim Facsimile Modal */}
      <Cms1500Modal
        isOpen={isCms1500Open}
        onClose={() => setIsCms1500Open(false)}
        cms1500Data={cms1500Data}
      />

      {/* V4 Prior-Auth Auto-Pilot (ePA) Slide-over Drawer */}
      <PriorAuthDrawer
        isOpen={isPriorAuthOpen}
        onClose={() => setIsPriorAuthOpen(false)}
        priorAuthPackage={priorAuthPackage}
        submitResult={priorAuthSubmitResult}
        onSubmit={submitPriorAuth}
        isSubmitting={isSubmittingPriorAuth}
        onGenerate={generatePriorAuth}
        isGenerating={isGeneratingPriorAuth}
      />

      {/* V5 ANSI ASC X12N 837P Clearinghouse & Medico-Legal Appeal Modal */}
      <Edi837pModal
        isOpen={isEdi837pModalOpen}
        onClose={() => setIsEdi837pModalOpen(false)}
        ediPackage={edi837pPackage}
        transmitResult={edi837pTransmitResult}
        appealPackage={appealPackage}
        isTransmitting={isTransmitting837p}
        isDraftingAppeal={isDraftingAppeal}
        onTransmit={transmit837p}
        onDraftAppeal={() => draftAppeal()}
      />



      {/* Institutional Luxury Footer */}
      <footer className="bg-[#050B0A] border-t border-[#123831] px-6 py-4 text-center text-xs text-[#7E9F97] font-medium flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-[#00F2C2]" />
          <span>SMART on FHIR v4.0.1 • HIPAA Security Rule Validated • TLS 1.3 AES-GCM</span>
        </div>
        <div className="font-semibold text-slate-300">
          Veritas Clinical AI Platform • <span className="text-[#00F2C2]">Ultra-Luxury Obsidian & Mint-Teal Edition</span>
        </div>
      </footer>
    </div>
  );
}
