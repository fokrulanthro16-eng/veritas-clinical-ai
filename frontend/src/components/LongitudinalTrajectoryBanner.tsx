'use client';

import React, { useState } from 'react';
import { 
  TrendingDown, 
  TrendingUp, 
  Activity, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  LineChart,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { LongitudinalTrajectoryResponse, BiomarkerTrajectory } from '../types/clinical';

interface LongitudinalTrajectoryBannerProps {
  trajectory: LongitudinalTrajectoryResponse | null;
  onInterventionClick?: (intervention: string) => void;
}

export const LongitudinalTrajectoryBanner: React.FC<LongitudinalTrajectoryBannerProps> = ({
  trajectory,
  onInterventionClick
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!trajectory || !trajectory.biomarker_trajectories) {
    return null;
  }

  const renderSparkline = (data: number[], isDecliningBad: boolean) => {
    if (!data || data.length < 2) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 80;
    const height = 24;

    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x},${y}`;
    }).join(' ');

    const strokeColor = isDecliningBad 
      ? (data[data.length - 1] < data[0] ? '#FF4D6D' : '#00F2C2')
      : (data[data.length - 1] > data[0] ? '#F59E0B' : '#00F2C2');

    return (
      <svg width={width} height={height} className="overflow-visible inline-block ml-1">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        {/* Current endpoint dot */}
        {points.split(' ').slice(-1).map((pt, i) => {
          const [cx, cy] = pt.split(',');
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r="3"
              fill={strokeColor}
              className="animate-pulse"
            />
          );
        })}
      </svg>
    );
  };

  return (
    <div className="mb-4 rounded-2xl border border-teal-500/20 bg-[#061412]/60 p-3.5 backdrop-blur-md transition-all hover:border-teal-500/40 shadow-lg">
      {/* Header bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-[#00F2C2]">
            <LineChart className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Longitudinal Trajectory: {trajectory.patient_name}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#00F2C2]/15 text-[#00F2C2] border border-[#00F2C2]/30">
                {trajectory.timeline_span}
              </span>
            </div>
            <p className="text-[10px] text-[#7E9F97]">
              Multi-encounter baseline deltas & predictive cardiorenal risk indices
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            Stage 3 CKD Delta Trigger
          </span>
          <button className="text-[#7E9F97] hover:text-white transition">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 3 Metric Pills Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
        {trajectory.biomarker_trajectories.map((bm, idx) => {
          const isEgfr = bm.biomarker.includes('eGFR');
          const isHba1c = bm.biomarker.includes('A1c');
          const isBadTrend = isEgfr ? bm.delta_12m < 0 : (isHba1c ? bm.delta_12m > 0 : false);

          return (
            <div 
              key={idx}
              className="p-2.5 rounded-xl bg-black/30 border border-white/[0.07] hover:border-teal-500/30 transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300 font-semibold truncate max-w-[140px]">{bm.biomarker}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  isBadTrend 
                    ? 'bg-rose-500/15 text-rose-300 border border-rose-500/20' 
                    : 'bg-teal-500/15 text-[#00F2C2] border border-teal-500/20'
                }`}>
                  {bm.status_badge}
                </span>
              </div>

              <div className="flex items-end justify-between mt-2">
                <div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-xs text-slate-400 font-mono">{bm.baseline_12m}</span>
                    <span className="text-slate-500 text-[10px]">→</span>
                    <span className="text-sm font-bold text-white font-mono">{bm.current}</span>
                    <span className="text-[10px] text-slate-400">{bm.unit}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-[10px] mt-0.5">
                    {bm.delta_pct < 0 ? (
                      <TrendingDown className={`w-3 h-3 ${isBadTrend ? 'text-rose-400' : 'text-[#00F2C2]'}`} />
                    ) : (
                      <TrendingUp className={`w-3 h-3 ${isBadTrend ? 'text-amber-400' : 'text-[#00F2C2]'}`} />
                    )}
                    <span className={isBadTrend ? 'text-rose-300 font-bold' : 'text-teal-300'}>
                      {bm.delta_pct > 0 ? `+${bm.delta_pct}%` : `${bm.delta_pct}%`} (12-Mo)
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  {renderSparkline(bm.sparkline_data, isEgfr)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded Clinical Implications Drawer */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-white/[0.08] space-y-2.5 animate-fade-in text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {/* Clinical Implication Details */}
            <div className="space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#00F2C2] flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Contemporaneous Trajectory Analysis
              </div>
              {trajectory.biomarker_trajectories.map((bm, i) => (
                <div key={i} className="p-2 rounded-lg bg-teal-950/20 border border-teal-800/30 text-[11px] leading-relaxed text-slate-300">
                  <strong className="text-white">{bm.biomarker}:</strong> {bm.clinical_implication}
                </div>
              ))}
            </div>

            {/* Predictive Risk & AI Interventions */}
            <div className="space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Predictive Risk Matrix & Suggested Orders
              </div>
              <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-800/30 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Cardiorenal Syndrome Risk:</span>
                  <span className="font-bold text-amber-300">{trajectory.predictive_risk_matrix.cardiorenal_syndrome_risk}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">3-Yr MACE Probability:</span>
                  <span className="font-bold text-rose-400">{trajectory.predictive_risk_matrix.mace_3yr_risk_pct}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">CKD Stage 4 Progression (18-Mo):</span>
                  <span className="font-bold text-amber-300">{(trajectory.predictive_risk_matrix.ckd_progression_probability_18m * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div className="space-y-1 mt-1">
                {trajectory.predictive_risk_matrix.suggested_interventions.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => onInterventionClick && onInterventionClick(item)}
                    className="w-full text-left p-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 text-[#00F2C2] text-[10px] font-semibold transition flex items-center justify-between group"
                  >
                    <span className="truncate">⚡ {item}</span>
                    <span className="text-[9px] opacity-70 group-hover:opacity-100">Add to Plan →</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
