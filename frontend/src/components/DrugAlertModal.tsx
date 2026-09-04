'use client';

import React from 'react';
import { AlertOctagon, AlertTriangle, X } from 'lucide-react';
import { DrugAlert } from '../types/clinical';

interface DrugAlertModalProps {
  alerts: DrugAlert[];
  onDismiss?: () => void;
}

export const DrugAlertModal: React.FC<DrugAlertModalProps> = ({ alerts, onDismiss }) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-[#1A0A0E] via-[#0D0507] to-[#1A0A0E] border-2 border-rose-600/60 rounded-3xl p-5 shadow-2xl shadow-rose-950/60 relative overflow-hidden animate-fadeIn">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start space-x-4">
          <div className="p-3 rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-600/40 mt-0.5 animate-pulse">
            <AlertOctagon className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center space-x-2.5">
              <span className="bg-rose-600 text-white text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider">
                CRITICAL PHARMACOLOGY CONTRAINDICATION
              </span>
              <span className="text-xs font-bold text-rose-400">
                {alerts.length} Adverse Event{alerts.length > 1 ? 's' : ''} Flagged
              </span>
            </div>

            <div className="mt-3 space-y-2.5">
              {alerts.map((alert, idx) => (
                <div key={idx} className="bg-[#050B0A] p-4 rounded-2xl border border-rose-900/60 shadow-md space-y-1.5">
                  <div className="flex items-center space-x-2 font-bold text-rose-300 text-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <span>{alert.title}</span>
                    <span className="font-mono text-xs text-rose-400 font-semibold">
                      ({alert.drugs_involved.join(' + ')})
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    <strong className="text-white">Mechanism:</strong> {alert.mechanism}
                  </p>
                  <div className="flex items-center space-x-1.5 text-xs text-rose-200 bg-[#1A0A0E] px-3.5 py-1.5 rounded-xl border border-rose-800 font-medium">
                    <strong className="text-rose-400">Recommended Action:</strong>
                    <span>{alert.recommendation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-[#1A0A0E] transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
