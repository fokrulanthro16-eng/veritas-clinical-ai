'use client';

import React, { useEffect, useRef } from 'react';
import { User, Stethoscope, MessageSquare, Check, Mic } from 'lucide-react';
import { TranscriptItem } from '../types/clinical';

interface TranscriptFeedProps {
  transcripts: TranscriptItem[];
  currentPartial: { speaker: string; text: string } | null;
  isStreaming: boolean;
}

export const TranscriptFeed: React.FC<TranscriptFeedProps> = ({
  transcripts,
  currentPartial,
  isStreaming
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts, currentPartial]);

  return (
    <div className="obsidian-card p-5 flex flex-col h-[600px]">
      {/* Feed Header */}
      <div className="flex items-center justify-between border-b border-[#123831] pb-3.5 mb-3.5">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-[#00F2C2]/15 border border-[#00F2C2]/30 flex items-center justify-center text-[#00F2C2]">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-xs tracking-wider text-white uppercase">
              Ambient Dialogue Stream
            </h2>
            <p className="text-[10px] text-[#7E9F97] font-medium">AssemblyAI Real-Time Diarization</p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold bg-[#050B0A] text-[#00F2C2] px-3 py-1 rounded-full border border-[#123831]">
          {transcripts.length} Turns
        </span>
      </div>

      {/* Transcript Log Container */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1.5 scrollbar-thin">
        {transcripts.length === 0 && !currentPartial && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <div className="w-14 h-14 rounded-3xl bg-[#0A1F1B] border border-[#123831] flex items-center justify-center mb-3 text-[#00F2C2] shadow-lg">
              <Mic className="w-6 h-6 animate-pulse" />
            </div>
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Ambient Audio Channel Ready</p>
            <p className="text-[11px] text-[#7E9F97] mt-1 max-w-xs leading-relaxed">
              Start microphone or select a scenario above to stream speaker-diarized dialogue.
            </p>
          </div>
        )}

        {transcripts.map((turn) => {
          const isDoctor = turn.speaker.toLowerCase() === 'doctor' || turn.speaker.toLowerCase() === 'clinician';
          return (
            <div
              key={turn.id}
              className={`p-3.5 rounded-2xl transition-all backdrop-blur-md shadow-md ${
                isDoctor
                  ? 'bg-[#00F2C2]/[0.07] border border-[#00F2C2]/30 ml-2 text-emerald-50'
                  : 'bg-white/[0.03] border border-white/[0.07] mr-2 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                      isDoctor ? 'bg-[#00F2C2] text-[#040E0C] shadow-sm' : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    {isDoctor ? <Stethoscope className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      isDoctor ? 'text-[#00F2C2]' : 'text-slate-300'
                    }`}
                  >
                    {turn.speaker}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-[10px] font-mono text-[#7E9F97]">
                  <span>{turn.timestamp}</span>
                  {turn.confidence && (
                    <span className="text-[#00F2C2] font-semibold flex items-center gap-0.5">
                      <Check className="w-3 h-3" />
                      {Math.round(turn.confidence * 100)}%
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs leading-relaxed pl-8 font-medium">
                {turn.text}
              </p>
            </div>
          );
        })}

        {/* Real-time Partial Streaming Bubble */}
        {currentPartial && (
          <div className="p-3.5 rounded-2xl border border-[#00F2C2]/50 bg-[#00F2C2]/[0.08] backdrop-blur-md animate-pulse ml-2 shadow-lg">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs font-bold text-[#00F2C2] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00F2C2] animate-ping" />
                {currentPartial.speaker.toUpperCase()} (Transcribing...)
              </span>
            </div>
            <p className="text-xs text-white font-medium italic pl-6">
              {currentPartial.text}
              <span className="inline-block w-1.5 h-3.5 bg-[#00F2C2] ml-1 translate-y-0.5 animate-pulse" />
            </p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
};
