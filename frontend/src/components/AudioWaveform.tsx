'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Square, Radio, Sparkles, Send, Bot, MessageSquare, HelpCircle, Check } from 'lucide-react';

interface AudioWaveformProps {
  streamState: 'idle' | 'recording_live' | 'simulating';
  audioLevel: number;
  audioFftData: number[];
  onStartLiveMic: () => void;
  onStop: () => void;
  onAskCopilot: (query: string) => Promise<string>;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  streamState,
  audioLevel,
  audioFftData,
  onStartLiveMic,
  onStop,
  onAskCopilot
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copilotQuery, setCopilotQuery] = useState('');
  const [copilotResponse, setCopilotResponse] = useState<string | null>(null);
  const [askingCopilot, setAskingCopilot] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (streamState !== 'idle') {
      interval = setInterval(() => setElapsedSeconds((p) => p + 1), 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [streamState]);

  // Smooth Canvas Visualizer with Luminous Mint-Teal
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const numBars = 32;
      const barWidth = Math.floor(width / numBars) - 2;

      for (let i = 0; i < numBars; i++) {
        let val = audioFftData[i % audioFftData.length] || 0;
        if (streamState === 'idle') val = 6;
        const barHeight = Math.max(3, (val / 100) * height * 0.85);
        const x = i * (barWidth + 2);
        const y = height - barHeight;

        // Glowing Mint-Teal Gradient
        const grad = ctx.createLinearGradient(0, height, 0, 0);
        if (streamState === 'recording_live') {
          grad.addColorStop(0, '#10B981');
          grad.addColorStop(0.5, '#00F2C2');
          grad.addColorStop(1, '#ffffff');
        } else if (streamState === 'simulating') {
          grad.addColorStop(0, '#0E2E28');
          grad.addColorStop(0.5, '#00F2C2');
          grad.addColorStop(1, '#7E9F97');
        } else {
          grad.addColorStop(0, '#0A2621');
          grad.addColorStop(1, '#123831');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [audioFftData, streamState]);

  const handleCopilotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotQuery.trim()) return;
    setAskingCopilot(true);
    setCopilotResponse(null);
    const ans = await onAskCopilot(copilotQuery);
    setCopilotResponse(ans);
    setAskingCopilot(false);
  };

  const handleChipClick = (text: string) => {
    setCopilotQuery(text);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="obsidian-card p-4 space-y-3.5">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Left: Live Mic Stream Controls */}
        <div className="flex items-center space-x-3 w-full lg:w-auto">
          {streamState === 'idle' ? (
            <button
              onClick={onStartLiveMic}
              className="dushi-btn-primary"
            >
              <Mic className="w-4 h-4 animate-pulse" />
              <span>Listen Live (Mic)</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={onStop}
                className="rounded-full bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/80 px-4 py-2 text-xs font-bold transition uppercase tracking-wider flex items-center gap-1.5"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
              </button>

              <div className="flex items-center space-x-2 bg-[#050B0A] px-3.5 py-2 rounded-full border border-rose-800 font-mono text-xs font-bold text-rose-400">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>REC {formatTimer(elapsedSeconds)}</span>
              </div>
            </div>
          )}

          {/* Canvas Spectrum Visualizer */}
          <div className="bg-[#050B0A] px-3 py-1.5 rounded-2xl border border-[#123831] flex items-center shadow-inner">
            <canvas
              ref={canvasRef}
              width={160}
              height={32}
              className="w-40 h-8"
            />
          </div>
        </div>

        {/* Right: Clinical Voice Co-Pilot Bar */}
        <div className="flex-1 max-w-xl w-full">
          <form onSubmit={handleCopilotSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#00F2C2]">
                <Bot className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={copilotQuery}
                onChange={(e) => setCopilotQuery(e.target.value)}
                placeholder="Clinical Co-Pilot: Ask CDS question (e.g. Warfarin contraindications)..."
                className="w-full bg-[#050B0A] border border-[#123831] rounded-full pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-[#7E9F97] focus:outline-none focus:border-[#00F2C2] focus:bg-[#0A1F1B] transition font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={askingCopilot}
              className="rounded-full bg-[#00F2C2] hover:bg-[#00D9AD] text-[#040E0C] px-5 py-2.5 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#00F2C2]/20 transition uppercase tracking-wider"
            >
              {askingCopilot ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Ask</span>
            </button>
          </form>
        </div>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
        <span className="text-[#7E9F97] flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-[#00F2C2]" />
          Quick CDS:
        </span>
        {[
          "Check contraindications for Warfarin",
          "What is the ICD-10 for diabetic neuropathy?",
          "What lab panel is needed before prescribing Atorvastatin?"
        ].map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleChipClick(chip)}
            className="bg-[#050B0A] hover:bg-[#0A1F1B] text-[#7E9F97] hover:text-[#00F2C2] px-3 py-1 rounded-full border border-[#123831] hover:border-[#00F2C2]/40 transition text-[11px] font-medium"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Co-Pilot Answer Box */}
      {copilotResponse && (
        <div className="p-4 bg-[#0A1F1B]/95 border border-[#00F2C2]/40 rounded-2xl text-xs text-slate-200 space-y-2 animate-fadeIn shadow-xl">
          <div className="flex items-center justify-between text-[#00F2C2] font-bold text-xs border-b border-[#123831] pb-2">
            <div className="flex items-center space-x-2">
              <Bot className="w-4 h-4 text-[#00F2C2]" />
              <span className="tracking-wide uppercase">Veritas Clinical Decision Support (Gemini 2.5 Flash CDS)</span>
            </div>
            <button
              onClick={() => setCopilotResponse(null)}
              className="text-[#7E9F97] hover:text-white text-[11px]"
            >
              Dismiss
            </button>
          </div>
          <div className="text-xs whitespace-pre-wrap leading-relaxed text-slate-300 max-h-96 overflow-y-auto pr-2">
            {copilotResponse}
          </div>
        </div>
      )}
    </div>
  );
};
