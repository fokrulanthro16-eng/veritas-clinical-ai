'use client';

import React, { useState } from 'react';
import { Bot, Sparkles, Send, Wrench, Play, Check } from 'lucide-react';
import { ToolExecutionLog } from '../types/clinical';

interface AgentIntercomProps {
  onExecuteCommand: (command: string) => Promise<any>;
  executedTools: ToolExecutionLog[];
}

export const AgentIntercom: React.FC<AgentIntercomProps> = ({
  onExecuteCommand,
  executedTools
}) => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [latestResponse, setLatestResponse] = useState<string | null>(null);

  const handleCommand = async (cmd: string) => {
    if (!cmd.trim() || isProcessing) return;
    setIsProcessing(true);
    setLatestResponse(null);
    try {
      const res = await onExecuteCommand(cmd);
      if (res && res.voice_response) {
        setLatestResponse(res.voice_response);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const chips = [
    "Veritas, auto-resolve all denial flags",
    "Veritas, verify Plavix safety",
    "Veritas, finalize claim"
  ];

  return (
    <div className="obsidian-card p-4 space-y-3">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Title */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#00F2C2] to-[#10B981] text-[#040E0C] flex items-center justify-center shadow-md shadow-[#00F2C2]/20 font-black">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Veritas Autonomous Voice Agent Intercom
              </span>
              <span className="text-[9px] font-mono font-bold text-[#00F2C2] bg-[#00F2C2]/15 px-2.5 py-0.5 rounded-full border border-[#00F2C2]/30 uppercase">
                Tool Calling Active
              </span>
            </div>
            <p className="text-[11px] text-[#7E9F97] font-medium">Bidirectional Voice Commands & Deterministic EHR Tool Dispatcher</p>
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCommand(inputText);
          }}
          className="flex gap-2 w-full lg:w-auto flex-1 max-w-md"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Say: 'Veritas, auto-resolve all denial flags'..."
            className="flex-1 bg-[#050B0A] border border-[#123831] rounded-full px-4 py-2 text-xs text-slate-100 placeholder-[#7E9F97] focus:outline-none focus:border-[#00F2C2] focus:bg-[#0A1F1B] transition font-medium"
          />
          <button
            type="submit"
            disabled={isProcessing}
            className="rounded-full bg-[#00F2C2] hover:bg-[#00D9AD] text-[#040E0C] px-5 py-2 text-xs font-bold shadow-md shadow-[#00F2C2]/20 transition flex items-center gap-1.5 uppercase tracking-wider"
          >
            {isProcessing ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Dispatch</span>
          </button>
        </form>
      </div>

      {/* 3 Quick Voice Action Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
        <span className="text-[10px] text-[#7E9F97] uppercase font-bold tracking-wider">Quick Actions:</span>
        {chips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => {
              setInputText(chip);
              handleCommand(chip);
            }}
            disabled={isProcessing}
            className="bg-[#050B0A] hover:bg-[#0A1F1B] text-[#7E9F97] hover:text-[#00F2C2] px-3.5 py-1 rounded-full text-[11px] font-semibold border border-[#123831] hover:border-[#00F2C2]/40 shadow-sm transition flex items-center gap-1.5"
          >
            <Play className="w-2.5 h-2.5 text-[#00F2C2] fill-current" />
            <span>&quot;{chip}&quot;</span>
          </button>
        ))}
      </div>

      {/* Voice Output & Tool Execution Stack */}
      {latestResponse && (
        <div className="p-4 bg-[#0A1F1B]/90 border border-[#00F2C2]/40 rounded-2xl space-y-2 text-xs animate-fadeIn shadow-lg">
          <div className="flex items-center space-x-2 text-[#00F2C2] font-bold text-xs">
            <Sparkles className="w-4 h-4 text-[#00F2C2] animate-pulse" />
            <span className="uppercase tracking-wider">Veritas Agent Audio Synthesis & Tool Execution Log</span>
          </div>

          <p className="text-slate-200 text-xs leading-relaxed pl-6 font-medium">
            {latestResponse}
          </p>

          {executedTools.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1 pl-6">
              {executedTools.map((tool, i) => (
                <span
                  key={i}
                  className="bg-[#050B0A] border border-[#00F2C2]/40 text-[#00F2C2] text-[10px] font-mono font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5"
                >
                  <Wrench className="w-3 h-3 text-[#00F2C2]" />
                  <strong>TOOL CALL: {tool.tool_name}</strong> → {tool.status}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
