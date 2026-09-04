'use client';

import React, { useState, useRef } from 'react';
import { Camera, Sparkles, FileCheck, RefreshCw, UploadCloud, HeartPulse } from 'lucide-react';
import { VisionAnalysisResult } from '../types/clinical';

interface VisionDiagnosticsDropzoneProps {
  onAnalyze: (imageData?: string, imageType?: string) => Promise<any>;
  visionAnalysis: VisionAnalysisResult | null;
  isAnalyzing: boolean;
}

export const VisionDiagnosticsDropzone: React.FC<VisionDiagnosticsDropzoneProps> = ({
  onAnalyze,
  visionAnalysis,
  isAnalyzing
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [previewName, setPreviewName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        onAnalyze(reader.result as string, 'user_uploaded_ecg');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoadSampleEcg = () => {
    setPreviewName('12-Lead_ECG_Lead_V4_V6_ST_Depression.png');
    onAnalyze(undefined, '12_lead_ecg');
  };

  return (
    <div className="mb-5 rounded-2xl border border-teal-500/20 bg-[#061412]/60 p-4 backdrop-blur-md relative overflow-hidden transition-all duration-300 hover:border-teal-500/40">
      {/* Laser scan line when analyzing */}
      {isAnalyzing && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#00F2C2] to-transparent shadow-[0_0_15px_#00F2C2] animate-pulse" />
        </div>
      )}

      {/* Header bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-teal-500/10 border border-teal-500/30 text-[#00F2C2]">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#00F2C2]">
                Multimodal Vision Diagnostics
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/20">
                Gemini Vision 2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              ECG 12-lead strip & diagnostic telemetry intake
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzing}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 transition-all active:scale-95 disabled:opacity-50"
          >
            <UploadCloud className="w-3.5 h-3.5 text-teal-400" />
            <span>Upload Strip</span>
          </button>

          <button
            onClick={handleLoadSampleEcg}
            disabled={isAnalyzing}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#00F2C2]/15 hover:bg-[#00F2C2]/25 text-[#00F2C2] border border-[#00F2C2]/40 transition-all active:scale-95 shadow-[0_0_12px_rgba(0,242,194,0.15)] disabled:opacity-50"
          >
            {isAnalyzing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>{isAnalyzing ? 'Analyzing Telemetry...' : '⚡ Load 12-Lead ECG'}</span>
          </button>
        </div>
      </div>

      {/* Analysis Results Display */}
      {visionAnalysis ? (
        <div className="mt-3 pt-3 border-t border-teal-500/15">
          {/* ECG Strip Visual Preview with Live Waveform */}
          <div className="relative rounded-xl bg-[#030A09] border border-teal-500/25 p-3 mb-3 overflow-hidden">
            <div className="flex items-center justify-between text-[11px] mb-2">
              <span className="font-mono text-teal-300 font-semibold flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-[#00F2C2] animate-pulse" />
                {previewName || '12-Lead Rhythm Strip (V4–V6 Anterolateral)'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ST-DEVIATION: {visionAnalysis.telemetry_metrics.st_deviation_mm}mm
              </span>
            </div>

            {/* Mini ECG waveform canvas SVG */}
            <div className="h-12 w-full bg-[#020605] rounded-lg border border-teal-900/40 relative overflow-hidden flex items-center">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 500 60">
                <defs>
                  <linearGradient id="ecgGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#00F2C2" stopOpacity="0.4" />
                    <stop offset="60%" stopColor="#00F2C2" stopOpacity="1" />
                    <stop offset="100%" stopColor="#FF4D6D" stopOpacity="0.9" />
                  </linearGradient>
                </defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#0A2621" strokeWidth="0.8" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid)" />
                <path
                  d="M 0 30 L 40 30 L 48 30 L 52 24 L 56 30 L 70 30 L 75 10 L 80 50 L 85 30 L 92 38 L 105 38 L 115 30 L 160 30 L 168 30 L 172 24 L 176 30 L 190 30 L 195 10 L 200 50 L 205 30 L 212 38 L 225 38 L 235 30 L 280 30 L 288 30 L 292 24 L 296 30 L 310 30 L 315 10 L 320 50 L 325 30 L 332 38 L 345 38 L 355 30 L 400 30 L 408 30 L 412 24 L 416 30 L 430 30 L 435 10 L 440 50 L 445 30 L 452 38 L 465 38 L 475 30 L 500 30"
                  fill="none"
                  stroke="url(#ecgGrad)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Telemetry Metrics Bar */}
            <div className="grid grid-cols-4 gap-2 mt-2.5 text-center">
              <div className="p-1.5 rounded-lg bg-teal-950/40 border border-teal-800/30">
                <div className="text-[10px] text-slate-400">Heart Rate</div>
                <div className="text-xs font-bold text-[#00F2C2]">{visionAnalysis.telemetry_metrics.heart_rate_bpm} BPM</div>
              </div>
              <div className="p-1.5 rounded-lg bg-teal-950/40 border border-teal-800/30">
                <div className="text-[10px] text-slate-400">PR Interval</div>
                <div className="text-xs font-bold text-slate-200">{visionAnalysis.telemetry_metrics.pr_interval_ms} ms</div>
              </div>
              <div className="p-1.5 rounded-lg bg-teal-950/40 border border-teal-800/30">
                <div className="text-[10px] text-slate-400">QRS Duration</div>
                <div className="text-xs font-bold text-slate-200">{visionAnalysis.telemetry_metrics.qrs_duration_ms} ms</div>
              </div>
              <div className="p-1.5 rounded-lg bg-teal-950/40 border border-teal-800/30">
                <div className="text-[10px] text-slate-400">Leads Affected</div>
                <div className="text-xs font-bold text-amber-300">{visionAnalysis.telemetry_metrics.lead_involvement.join(', ')}</div>
              </div>
            </div>
          </div>

          {/* Key Findings List */}
          <div className="space-y-1.5 mb-2.5">
            {visionAnalysis.biomarkers_and_findings.map((finding, idx) => (
              <div key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00F2C2] mt-1.5 flex-shrink-0" />
                <span>{finding}</span>
              </div>
            ))}
          </div>

          {/* Correlation and SOAP patch note */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs">
            <div className="flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-[#00F2C2] flex-shrink-0" />
              <span className="text-teal-200 font-medium">
                Correlated: <span className="text-white font-semibold">{visionAnalysis.clinical_correlation}</span>
              </span>
            </div>
            <span className="text-[10px] font-semibold text-[#00F2C2] bg-teal-500/20 px-2 py-0.5 rounded-full">
              SOAP Objective Auto-Updated
            </span>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`cursor-pointer rounded-xl border border-dashed transition-all p-3 text-center ${
            isHovered
              ? 'border-teal-400/60 bg-teal-500/5'
              : 'border-teal-500/20 bg-slate-900/30'
          }`}
        >
          <p className="text-xs text-slate-400 font-medium">
            Drag & drop 12-lead ECG strip, lab panel, or click{' '}
            <span className="text-[#00F2C2] font-semibold">"⚡ Load 12-Lead ECG"</span> for instant AI telemetry extraction.
          </p>
        </div>
      )}
    </div>
  );
};
