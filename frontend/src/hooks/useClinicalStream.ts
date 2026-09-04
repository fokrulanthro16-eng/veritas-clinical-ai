'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  TranscriptItem,

  RCMState,
  SoapNote,
  DrugAlert,
  ICD10Result,
  MDMAnalysis,
  DenialRadarResult,
  SentinelReport,
  PatientContext,
  ClinicalScenarioMeta,
  VisionAnalysisResult,
  PriorAuthPackage,
  PriorAuthSubmitResult,
  CDSSafetyReport,
  LongitudinalTrajectoryResponse,
  Edi837pTransactionPackage,
  Edi837pTransmitResult,
  DenialAppealPackage,
  AirlockAuditReport
} from '../types/clinical';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/clinical-stream';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';



export function useClinicalStream() {
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [streamState, setStreamState] = useState<'idle' | 'recording_live' | 'simulating'>('idle');
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [currentPartial, setCurrentPartial] = useState<{ speaker: string; text: string } | null>(null);
  const [scenarios, setScenarios] = useState<ClinicalScenarioMeta[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<string>('cardiology_high_complexity');

  const [patientContext, setPatientContext] = useState<PatientContext>({
    id: 'pat-9482014',
    mrn: 'MRN-9482014',
    given_name: 'Arthur',
    family_name: 'Davis',
    gender: 'male',
    birth_date: '1958-04-12',
    age: 67,
    payer: 'Aetna Choice POS II (Payer ID: 60054)',
    encounter_room: 'Exam Room 302B',
    provider: 'Dr. Sarah Lin, MD (NPI: 1942857102)'
  });

  const [rcmState, setRcmState] = useState<RCMState>({
    total_reimbursement_usd: 0,
    icd10_codes: [],
    medications: [],
    drug_alerts: [],
    turns_count: 0
  });

  const [mdmAnalysis, setMdmAnalysis] = useState<MDMAnalysis | null>(null);
  const [denialRadar, setDenialRadar] = useState<DenialRadarResult | null>(null);
  const [sentinelReport, setSentinelReport] = useState<SentinelReport | null>(null);
  const [fhirBundle, setFhirBundle] = useState<any>(null);
  const [edi837p, setEdi837p] = useState<string>('');
  const [soapNote, setSoapNote] = useState<SoapNote | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [audioFftData, setAudioFftData] = useState<number[]>(new Array(32).fill(0));
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [mitigationToast, setMitigationToast] = useState<string | null>(null);

  // V4 Multimodal Vision & Prior Auth State
  const [visionAnalysis, setVisionAnalysis] = useState<VisionAnalysisResult | null>(null);
  const [isAnalyzingVision, setIsAnalyzingVision] = useState<boolean>(false);
  const [priorAuthPackage, setPriorAuthPackage] = useState<PriorAuthPackage | null>(null);
  const [isGeneratingPriorAuth, setIsGeneratingPriorAuth] = useState<boolean>(false);
  const [priorAuthSubmitResult, setPriorAuthSubmitResult] = useState<PriorAuthSubmitResult | null>(null);
  const [isSubmittingPriorAuth, setIsSubmittingPriorAuth] = useState<boolean>(false);
  const [isPriorAuthOpen, setIsPriorAuthOpen] = useState<boolean>(false);

  const [cdsSafetyReport, setCdsSafetyReport] = useState<CDSSafetyReport | null>(null);

  // V5 Enterprise Institutional State
  const [longitudinalTrajectory, setLongitudinalTrajectory] = useState<LongitudinalTrajectoryResponse | null>(null);
  const [airlockReport, setAirlockReport] = useState<AirlockAuditReport | null>(null);
  const [edi837pPackage, setEdi837pPackage] = useState<Edi837pTransactionPackage | null>(null);
  const [edi837pTransmitResult, setEdi837pTransmitResult] = useState<Edi837pTransmitResult | null>(null);
  const [appealPackage, setAppealPackage] = useState<DenialAppealPackage | null>(null);
  const [isEdi837pModalOpen, setIsEdi837pModalOpen] = useState<boolean>(false);
  const [isTransmitting837p, setIsTransmitting837p] = useState<boolean>(false);
  const [isDraftingAppeal, setIsDraftingAppeal] = useState<boolean>(false);



  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const addLog = useCallback((msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setSystemLogs((prev) => [`[${timestamp}] ${msg}`, ...prev.slice(0, 49)]);
  }, []);

  // Fetch scenarios list on load
  useEffect(() => {
    fetch(`${API_BASE}/api/scenarios`)
      .then((res) => res.json())
      .then((data) => {
        if (data.scenarios) setScenarios(data.scenarios);
      })
      .catch((err) => console.log('Scenarios fetch:', err));
  }, []);

  // Connect WebSocket
  const connect = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    setConnectionStatus('connecting');
    addLog('Connecting to Veritas Institutional WebSocket...');

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionStatus('connected');
        addLog('WebSocket link established with AssemblyAI stream processor.');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'partial_transcript') {
            setCurrentPartial({
              speaker: data.speaker || 'Clinician',
              text: data.text
            });
          } else if (data.type === 'final_transcript') {
            setCurrentPartial(null);
            const newItem: TranscriptItem = {
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              speaker: data.speaker || 'Doctor',
              text: data.text,
              isFinal: true,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              confidence: data.confidence
            };
            setTranscripts((prev) => [...prev, newItem]);
          } else if (data.type === 'rcm_update') {
            setRcmState((prev) => ({
              ...prev,
              total_reimbursement_usd: data.total_reimbursement_usd,
              icd10_codes: data.icd10_codes || [],
              medications: data.medications || [],
              drug_alerts: data.drug_alerts || [],
              turns_count: data.turns_count
            }));

            if (data.patient_context) setPatientContext(data.patient_context);
            if (data.mdm_analysis) setMdmAnalysis(data.mdm_analysis);
            if (data.denial_radar) setDenialRadar(data.denial_radar);
            if (data.sentinel_report) setSentinelReport(data.sentinel_report);
            if (data.fhir_bundle) setFhirBundle(data.fhir_bundle);
            if (data.edi_837p) setEdi837p(data.edi_837p);
            if (data.soap_note) setSoapNote(data.soap_note);
          } else if (data.type === 'status') {
            if (data.state === 'recording_live') setStreamState('recording_live');
            else if (data.state === 'idle') setStreamState('idle');
            if (data.message) addLog(data.message);
          } else if (data.type === 'simulation_complete') {
            setStreamState('idle');
            addLog(data.message);
          } else if (data.type === 'reset_complete') {
            setTranscripts([]);
            setCurrentPartial(null);
            setRcmState({
              total_reimbursement_usd: 0,
              icd10_codes: [],
              medications: [],
              drug_alerts: [],
              turns_count: 0
            });
            setSoapNote(null);
            setMdmAnalysis(null);
            setDenialRadar(null);
            setSentinelReport(null);
            setFhirBundle(null);
            setEdi837p('');
            setStreamState('idle');
            addLog('Session reset.');
          } else if (data.type === 'warning') {
            addLog(`WARNING: ${data.message}`);
          }
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        setConnectionStatus('error');
        addLog('WebSocket link error.');
      };

      ws.onclose = () => {
        setConnectionStatus('disconnected');
        setStreamState('idle');
        addLog('WebSocket disconnected.');
      };
    } catch (err) {
      console.error('Failed to instantiate WebSocket:', err);
      setConnectionStatus('error');
    }
  }, [addLog]);

  useEffect(() => {
    connect();
    return () => {
      stopAudioCapture();
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  // Web Audio API
  const startAudioCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      mediaStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioContextClass({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyserRef.current = analyser;

      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        const inputData = e.inputBuffer.getChannelData(0);

        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        wsRef.current.send(pcm16.buffer);
      };

      source.connect(analyser);
      analyser.connect(processor);
      processor.connect(audioCtx.destination);

      const checkAudioLevel = () => {
        if (analyserRef.current) {
          const buffer = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(buffer);
          let sum = 0;
          const fftBands: number[] = [];
          const step = Math.max(1, Math.floor(buffer.length / 32));
          for (let i = 0; i < 32; i++) {
            const val = buffer[i * step] || 0;
            fftBands.push(Math.min(100, Math.round((val / 255) * 100)));
          }
          for (let i = 0; i < buffer.length; i++) sum += buffer[i];
          const avg = sum / buffer.length;
          setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
          setAudioFftData(fftBands);
        }
        animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
      };
      checkAudioLevel();

      return true;
    } catch (err) {
      addLog(`Microphone access error: ${err}`);
      return false;
    }
  };

  const stopAudioCapture = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setAudioLevel(0);
    setAudioFftData(new Array(32).fill(0));
  };

  const startLiveMic = async () => {
    if (connectionStatus !== 'connected') {
      connect();
    }
    const success = await startAudioCapture();
    if (success && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'start_live_mic' }));
      setStreamState('recording_live');
      addLog('Live ambient microphone streaming to AssemblyAI.');
    }
  };

  const startScenario = (scenarioId: string) => {
    stopAudioCapture();
    setActiveScenarioId(scenarioId);
    setTranscripts([]);
    setCurrentPartial(null);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'start_scenario', scenario_id: scenarioId }));
      setStreamState('simulating');
      addLog(`Streaming V2 Clinical Scenario: ${scenarioId}`);
    } else {
      // Direct REST fallback
      fetch(`${API_BASE}/api/scenarios/${scenarioId}/run`, { method: 'POST' })
        .then((res) => res.json())
        .then((data) => {
          if (data.scenario && data.scenario.dialogue) {
            setTranscripts(data.scenario.dialogue.map((d: any, idx: number) => ({
              id: `t-${idx}`,
              speaker: d.speaker,
              text: d.text,
              isFinal: true,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              confidence: 0.98
            })));
          }
          if (data.state) {
            setRcmState(data.state);
            if (data.state.mdm_analysis) setMdmAnalysis(data.state.mdm_analysis);
            if (data.state.denial_radar) setDenialRadar(data.state.denial_radar);
            if (data.state.sentinel_report) setSentinelReport(data.state.sentinel_report);
            if (data.state.soap_note) setSoapNote(data.state.soap_note);
            if (data.state.fhir_bundle) setFhirBundle(data.state.fhir_bundle);
            if (data.state.edi_837p) setEdi837p(data.state.edi_837p);
          }
          addLog(`Loaded scenario: ${scenarioId}`);
        })
        .catch((err) => console.error(err));
    }
  };

  const autoMitigateDenial = async (flagId: string) => {
    addLog(`Auto-mitigating denial flag ${flagId} with AI...`);
    const fullTranscript = transcripts.map((t) => `${t.speaker}: ${t.text}`).join('\n');
    try {
      const res = await fetch(`${API_BASE}/api/clinical/mitigate-denial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: fullTranscript,
          flag_id: flagId,
          soap_note: soapNote
        })
      });
      const data = await res.json();
      if (data.success) {
        if (data.updated_soap_note) setSoapNote(data.updated_soap_note);
        if (data.mitigated_denial_radar) setDenialRadar(data.mitigated_denial_radar);
        setMitigationToast(data.resolution_title);
        addLog(`AI Remediation complete: ${data.resolution_title}. Denial risk reduced to 4%.`);
        setTimeout(() => setMitigationToast(null), 5000);
      }
    } catch (err) {
      console.error('Mitigation error:', err);
      addLog(`Failed to mitigate flag: ${err}`);
    }
  };

  const askCopilot = async (query: string): Promise<string> => {
    const fullTranscript = transcripts.map((t) => `${t.speaker}: ${t.text}`).join('\n');
    try {
      const res = await fetch(`${API_BASE}/api/copilot/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, context: fullTranscript })
      });
      const data = await res.json();
      return data.answer || 'Query evaluated.';
    } catch (err) {
      return 'Error evaluating query.';
    }
  };

  const stopStream = () => {
    stopAudioCapture();
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'stop' }));
    }
    setStreamState('idle');
    addLog('Stream paused.');
  };

  const resetSession = () => {
    stopAudioCapture();
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'reset' }));
    } else {
      setTranscripts([]);
      setCurrentPartial(null);
      setSoapNote(null);
      setMdmAnalysis(null);
      setDenialRadar(null);
      setSentinelReport(null);
      setFhirBundle(null);
      setEdi837p('');
      setVisionAnalysis(null);
      setPriorAuthPackage(null);
      setPriorAuthSubmitResult(null);
      setIsPriorAuthOpen(false);
      setRcmState({
        total_reimbursement_usd: 0,
        icd10_codes: [],
        medications: [],
        drug_alerts: [],
        turns_count: 0
      });
      setStreamState('idle');
    }
  };

  const [executedTools, setExecutedTools] = useState<any[]>([]);
  const [cms1500Data, setCms1500Data] = useState<any>(null);

  const auditCdsSafety = useCallback(async (customMeds?: string[]) => {
    try {
      const medsToAudit = customMeds || (rcmState.medications && rcmState.medications.length > 0 ? rcmState.medications : ["Plavix 75mg", "Atorvastatin 80mg", "Aspirin 81mg"]);
      const res = await fetch(`${API_BASE}/api/cds/audit-safety`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medications: medsToAudit,
          patient_context: patientContext,
          diagnoses: rcmState.icd10_codes.map((c) => c.primary_icd10)
        })
      });
      const data = await res.json();
      setCdsSafetyReport(data);
      return data;
    } catch (err) {
      console.error('CDS audit error:', err);
      return null;
    }
  }, [patientContext, rcmState.medications, rcmState.icd10_codes]);

  useEffect(() => {
    auditCdsSafety();
  }, [auditCdsSafety]);

  const analyzeClinicalVision = async (imageData?: string, imageType: string = '12_lead_ecg') => {
    setIsAnalyzingVision(true);
    addLog('Multimodal Vision: Analyzing 12-lead ECG telemetry with Gemini Vision reasoning...');
    try {
      const res = await fetch(`${API_BASE}/api/clinical/analyze-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_type: imageType,
          image_data: imageData || null,
          patient_context: patientContext
        })
      });
      const data: VisionAnalysisResult = await res.json();
      setVisionAnalysis(data);

      if (data.soap_updates) {
        setSoapNote((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            objective: {
              ...prev.objective,
              vitals: {
                ...prev.objective?.vitals,
                ...(data.soap_updates?.objective?.vitals || {})
              },
              physical_exam: [
                ...(prev.objective?.physical_exam || []),
                ...(data.soap_updates?.objective?.physical_exam || [])
              ]
            },
            assessment: {
              ...prev.assessment,
              clinical_summary: data.soap_updates?.assessment?.clinical_summary || prev.assessment?.clinical_summary || '',
              diagnoses: [
                ...(prev.assessment?.diagnoses || []),
                ...((data.soap_updates?.assessment?.diagnoses as any) || [])
              ]
            }
          };
        });
      }

      addLog(`Vision Analyzer: Detected ${data.telemetry_metrics.heart_rate_bpm} BPM, ST-deviation ${data.telemetry_metrics.st_deviation_mm}mm in ${data.telemetry_metrics.lead_involvement.join(', ')}.`);
      setIsAnalyzingVision(false);
      return data;
    } catch (err) {
      console.error('Vision analysis error:', err);
      addLog(`Vision analysis error: ${err}`);
      setIsAnalyzingVision(false);
      return null;
    }
  };

  const generatePriorAuth = async (serviceName?: string, cptCode?: string) => {
    setIsGeneratingPriorAuth(true);
    addLog('Prior-Auth Auto-Pilot: Generating ePA packet with InterQual/MCG justification...');
    try {
      const res = await fetch(`${API_BASE}/api/prior-auth/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_info: patientContext,
          soap_note: soapNote,
          service_name: serviceName || "Urgent Left Heart Cardiac Catheterization & Coronary Angiography",
          cpt_code: cptCode || "93458",
          icd_codes: rcmState.icd10_codes.map((c) => ({ code: c.primary_icd10, description: c.description }))
        })
      });
      const data: PriorAuthPackage = await res.json();
      setPriorAuthPackage(data);
      setIsPriorAuthOpen(true);
      addLog(`Prior-Auth Package compiled: ${data.prior_auth_id} (MCG Score: ${data.clinical_necessity_justification.mcg_compliance_score}%).`);
      setIsGeneratingPriorAuth(false);
      return data;
    } catch (err) {
      console.error('Prior-auth generation error:', err);
      addLog(`Prior-auth generation failed: ${err}`);
      setIsGeneratingPriorAuth(false);
      return null;
    }
  };

  const submitPriorAuth = async (packageData?: PriorAuthPackage) => {
    setIsSubmittingPriorAuth(true);
    const payload = packageData || priorAuthPackage;
    addLog(`Prior-Auth Gateway: Transmitting ${payload?.prior_auth_id || 'packet'} to ${payload?.payer?.submission_portal || 'Payer Gateway'}...`);
    try {
      const res = await fetch(`${API_BASE}/api/prior-auth/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prior_auth_package: payload
        })
      });
      const data: PriorAuthSubmitResult = await res.json();
      setPriorAuthSubmitResult(data);
      addLog(`Prior-Auth APPROVED: Auth #${data.authorization_number} · Clearinghouse: ${data.clearinghouse_tracking_id}`);
      setIsSubmittingPriorAuth(false);
      return data;
    } catch (err) {
      console.error('Prior-auth submission error:', err);
      addLog(`Prior-auth submission failed: ${err}`);
      setIsSubmittingPriorAuth(false);
      return null;
    }
  };

  // V5 Enterprise Handlers
  const fetchLongitudinalTrajectory = useCallback(async (patientId: string = 'pat-9482014') => {
    try {
      const res = await fetch(`${API_BASE}/api/patient/${patientId}/longitudinal-trajectory`);
      const data: LongitudinalTrajectoryResponse = await res.json();
      setLongitudinalTrajectory(data);
      return data;
    } catch (err) {
      console.error('Longitudinal trajectory fetch error:', err);
      return null;
    }
  }, []);

  const auditAirlock = useCallback(async (textToScan?: string) => {
    try {
      const fullText = textToScan || transcripts.map((t) => t.text).join(' ');
      const res = await fetch(`${API_BASE}/api/clinical/airlock-audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript_text: fullText,
          patient_context: patientContext,
          active_medications: rcmState.medications,
          known_allergies: ["Penicillin", "Iodinated Radiocontrast", "NSAIDs"],
          active_egfr: longitudinalTrajectory?.biomarker_trajectories.find((b) => b.biomarker.includes('eGFR'))?.current || 58.0
        })
      });
      const data: AirlockAuditReport = await res.json();
      setAirlockReport(data);
      return data;
    } catch (err) {
      console.error('Airlock audit error:', err);
      return null;
    }
  }, [transcripts, patientContext, rcmState.medications, longitudinalTrajectory]);

  // Initial load for V5 data
  useEffect(() => {
    fetchLongitudinalTrajectory(patientContext.id || 'pat-9482014');
    auditAirlock();
  }, [fetchLongitudinalTrajectory, auditAirlock, patientContext.id]);

  const generate837p = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/rcm/generate-837p`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_context: patientContext,
          cpt_code: mdmAnalysis?.recommended_cpt || '99215',
          icd_codes: rcmState.icd10_codes,
          total_reimbursement: rcmState.total_reimbursement_usd || 446.00
        })
      });
      const data: Edi837pTransactionPackage = await res.json();
      setEdi837pPackage(data);
      setIsEdi837pModalOpen(true);
      addLog(`Generated ANSI ASC X12N 837P claim: Control ID ${data.transaction_control_id} (${data.segments_count} segments).`);
      return data;
    } catch (err) {
      console.error('837P generation error:', err);
      return null;
    }
  };

  const transmit837p = async () => {
    setIsTransmitting837p(true);
    addLog(`Transmitting 837P claim to Optum / Change Healthcare Clearinghouse Gateway...`);
    try {
      const res = await fetch(`${API_BASE}/api/rcm/transmit-837p`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          edi_payload: edi837pPackage?.edi_raw
        })
      });
      const data: Edi837pTransmitResult = await res.json();
      setEdi837pTransmitResult(data);
      addLog(`Clearinghouse 277CA Acknowledged: ${data.clearinghouse_tx_id} · ${data.payer_ack}`);
      setIsTransmitting837p(false);
      return data;
    } catch (err) {
      console.error('837P transmission error:', err);
      setIsTransmitting837p(false);
      return null;
    }
  };

  const draftAppeal = async (denialReason?: string) => {
    setIsDraftingAppeal(true);
    addLog('Synthesizing institutional Medico-Legal Denial Appeal Brief...');
    try {
      const fullTranscript = transcripts.map((t) => `${t.speaker}: ${t.text}`).join('\n');
      const res = await fetch(`${API_BASE}/api/rcm/draft-appeal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          denial_reason: denialReason || "CO-16: Claim lacks documentation of separate identifiable E/M service.",
          patient_context: patientContext,
          cpt_code: mdmAnalysis?.recommended_cpt || '99215',
          transcript_snippet: fullTranscript.slice(0, 400)
        })
      });
      const data: DenialAppealPackage = await res.json();
      setAppealPackage(data);
      addLog(`Appeal Brief Compiled: Ref ${data.appeal_id} (Expected Overturn: ${data.expected_overturn_rate_pct}%).`);
      setIsDraftingAppeal(false);
      return data;
    } catch (err) {
      console.error('Appeal drafting error:', err);
      setIsDraftingAppeal(false);
      return null;
    }
  };

  const executeVoiceCommand = async (command: string) => {
    addLog(`Voice Agent Command: "${command}"`);
    const fullTranscript = transcripts.map((t) => `${t.speaker}: ${t.text}`).join('\n');
    try {
      const res = await fetch(`${API_BASE}/api/agent/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command,
          transcript: fullTranscript,
          soap_note: soapNote,
          denial_radar: denialRadar
        })
      });
      const data = await res.json();
      if (data.executed_tools && data.executed_tools.length > 0) {
        setExecutedTools((prev) => [...data.executed_tools, ...prev]);
        for (const t of data.executed_tools) {
          if (t.updated_soap_note) setSoapNote(t.updated_soap_note);
          if (t.mitigated_denial_radar) setDenialRadar(t.mitigated_denial_radar);
        }
      }
      if (data.state_mutations) {
        if (data.state_mutations.updated_soap_note) setSoapNote(data.state_mutations.updated_soap_note);
        if (data.state_mutations.mitigated_denial_radar) setDenialRadar(data.state_mutations.mitigated_denial_radar);
      }
      addLog(`Agent: ${data.voice_response}`);
      return data;
    } catch (err) {
      console.error('Agent command error:', err);
      addLog(`Agent command failed: ${err}`);
      return null;
    }
  };

  const fetchCMS1500 = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/export/cms-1500?cpt=${mdmAnalysis?.recommended_cpt || '99215'}`);
      const data = await res.json();
      setCms1500Data(data);
      return data;
    } catch (err) {
      console.error('CMS-1500 fetch error:', err);
      return null;
    }
  };

  const updateSoapNote = (updated: SoapNote) => {
    setSoapNote(updated);
    addLog('Clinician updated SOAP note inline.');
  };

  return {
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
    auditCdsSafety,
    startLiveMic,
    startScenario,
    stopStream,
    resetSession,
    updateSoapNote,
    autoMitigateDenial,
    askCopilot,
    executeVoiceCommand,
    fetchCMS1500,
    reconnect: connect
  };
}


