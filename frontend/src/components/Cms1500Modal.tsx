'use client';

import React, { useRef } from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, FileText } from 'lucide-react';
import { CMS1500FormResponse } from '../types/clinical';

interface Cms1500ModalProps {
  isOpen: boolean;
  onClose: () => void;
  cms1500Data: CMS1500FormResponse | null;
}

export const Cms1500Modal: React.FC<Cms1500ModalProps> = ({ isOpen, onClose, cms1500Data }) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !cms1500Data) return null;

  const boxes = cms1500Data.boxes || {};

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-slate-900 border-2 border-red-700/80 rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top Bar */}
        <div className="px-6 py-3.5 bg-gradient-to-r from-red-950 via-slate-900 to-slate-950 border-b border-red-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-red-600 text-white shadow-lg shadow-red-600/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm text-white font-mono uppercase tracking-wider">
                  CMS-1500 (02/12) Paper Claim Form Facsimile
                </h3>
                <span className="text-[10px] font-mono text-red-300 bg-red-950 px-2 py-0.5 rounded border border-red-700 font-bold">
                  NUCC APPROVED
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Official Standard Health Insurance Claim Form Box Mapping (1–33)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-mono font-bold border border-slate-700 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Form</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Form Preview Container */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950 font-mono text-xs">
          <div
            ref={printRef}
            className="bg-white text-black p-6 rounded-lg shadow-2xl border-4 border-red-600 max-w-4xl mx-auto space-y-4"
          >
            {/* Red Form Header */}
            <div className="border-b-2 border-red-600 pb-2 flex justify-between items-start text-red-700">
              <div>
                <h1 className="text-sm font-black tracking-tighter uppercase">
                  HEALTH INSURANCE CLAIM FORM
                </h1>
                <p className="text-[9px] font-bold text-red-600">APPROVED BY NATIONAL UNIFORM CLAIM COMMITTEE (NUCC) 02/12</p>
              </div>
              <div className="text-right text-[10px] text-black">
                <span className="text-red-600 font-bold">Payer: </span>
                <strong>{cms1500Data.payer_header.payer_name}</strong>
              </div>
            </div>

            {/* Boxes 1 to 7 */}
            <div className="grid grid-cols-12 border-2 border-red-600 divide-x-2 divide-red-600 text-[10px]">
              <div className="col-span-6 p-2 space-y-1">
                <div className="text-[9px] text-red-600 font-bold uppercase">1. MEDICARE / MEDICAID / TRICARE / OTHER</div>
                <div className="font-bold text-black bg-red-50 p-1 border border-red-300 rounded">
                  [X] COMMERCIAL PPO (AETNA CHOICE POS II)
                </div>
              </div>
              <div className="col-span-6 p-2 space-y-1">
                <div className="text-[9px] text-red-600 font-bold uppercase">1a. INSURED&apos;S I.D. NUMBER</div>
                <div className="font-bold text-black font-mono text-xs">
                  {boxes.box_1a_insured_id || "AET-9482014"}
                </div>
              </div>
            </div>

            {/* Boxes 2 to 5 */}
            <div className="grid grid-cols-12 border-2 border-red-600 divide-x-2 divide-red-600 text-[10px]">
              <div className="col-span-4 p-2">
                <div className="text-[9px] text-red-600 font-bold uppercase">2. PATIENT&apos;S NAME (Last, First, Middle)</div>
                <div className="font-bold text-black">{boxes.box_2_patient_name}</div>
              </div>
              <div className="col-span-4 p-2">
                <div className="text-[9px] text-red-600 font-bold uppercase">3. PATIENT&apos;S BIRTH DATE & SEX</div>
                <div className="font-bold text-black">
                  {boxes.box_3_patient_dob} — {boxes.box_3_patient_sex}
                </div>
              </div>
              <div className="col-span-4 p-2">
                <div className="text-[9px] text-red-600 font-bold uppercase">4. INSURED&apos;S NAME</div>
                <div className="font-bold text-black">{boxes.box_4_insured_name}</div>
              </div>
            </div>

            {/* Box 5 & 11 */}
            <div className="grid grid-cols-12 border-2 border-red-600 divide-x-2 divide-red-600 text-[10px]">
              <div className="col-span-6 p-2">
                <div className="text-[9px] text-red-600 font-bold uppercase">5. PATIENT&apos;S ADDRESS</div>
                <div className="text-black font-semibold">
                  {boxes.box_5_patient_address?.street}, {boxes.box_5_patient_address?.city}, {boxes.box_5_patient_address?.state} {boxes.box_5_patient_address?.zip}
                </div>
              </div>
              <div className="col-span-6 p-2">
                <div className="text-[9px] text-red-600 font-bold uppercase">11. INSURED&apos;S POLICY GROUP OR FECA NUMBER</div>
                <div className="font-bold text-black">{boxes.box_11_insured_policy_group}</div>
              </div>
            </div>

            {/* Box 21 (Diagnoses A-L) */}
            <div className="border-2 border-red-600 p-2 text-[10px]">
              <div className="text-[9px] text-red-600 font-bold uppercase mb-1">
                21. DIAGNOSIS OR NATURE OF ILLNESS OR INJURY (ICD-10-CM Codes)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.values(boxes.box_21_diagnoses || {}).map((d: any) => (
                  <div key={d.letter} className="bg-red-50 p-1.5 rounded border border-red-300">
                    <span className="text-red-700 font-black mr-1">{d.letter}.</span>
                    <strong className="text-black font-mono">{d.code}</strong>
                    <div className="text-[8px] text-gray-700 truncate">{d.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Box 24 (Service Lines A-J) */}
            <div className="border-2 border-red-600 overflow-hidden text-[9px]">
              <div className="bg-red-600 text-white font-bold px-2 py-1 flex justify-between uppercase">
                <span>24. A. DATES OF SERVICE | B. POS | C. EMG | D. CPT/HCPCS (MOD) | E. DIAG | F. CHARGES | G. DAYS/UNITS | J. RENDERING NPI</span>
              </div>
              <div className="divide-y divide-red-200 bg-white">
                {(boxes.box_24_service_lines || []).map((line: any) => (
                  <div key={line.line_num} className="grid grid-cols-12 p-1.5 font-mono text-black font-bold items-center">
                    <span className="col-span-2">{line.from_date}</span>
                    <span className="col-span-1 text-center">{line.place_of_service}</span>
                    <span className="col-span-1 text-center">{line.emg || 'N'}</span>
                    <span className="col-span-3 text-red-700">{line.cpt_hcpcs} {line.modifier ? `(${line.modifier})` : ''}</span>
                    <span className="col-span-1 text-center">{line.diagnosis_pointer}</span>
                    <span className="col-span-2 text-right text-emerald-800">${line.charges}</span>
                    <span className="col-span-1 text-center">{line.days_or_units}</span>
                    <span className="col-span-1 text-right text-[8px]">{line.rendering_provider_id}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Boxes 25 to 33 */}
            <div className="grid grid-cols-12 border-2 border-red-600 divide-x-2 divide-red-600 text-[10px]">
              <div className="col-span-4 p-2">
                <div className="text-[9px] text-red-600 font-bold uppercase">25. FEDERAL TAX I.D. NUMBER</div>
                <div className="font-bold text-black">{boxes.box_25_federal_tax_id} ({boxes.box_25_type})</div>
              </div>
              <div className="col-span-4 p-2 bg-emerald-50">
                <div className="text-[9px] text-red-600 font-bold uppercase">28. TOTAL CHARGE</div>
                <div className="font-black text-emerald-800 text-sm">{boxes.box_28_total_charge}</div>
              </div>
              <div className="col-span-4 p-2">
                <div className="text-[9px] text-red-600 font-bold uppercase">31. SIGNATURE OF PHYSICIAN</div>
                <div className="font-bold text-black font-mono">{boxes.box_31_physician_signature} ({boxes.box_31_date})</div>
              </div>
            </div>

            {/* Boxes 32 & 33 */}
            <div className="grid grid-cols-12 border-2 border-red-600 divide-x-2 divide-red-600 text-[10px]">
              <div className="col-span-6 p-2">
                <div className="text-[9px] text-red-600 font-bold uppercase">32. SERVICE FACILITY LOCATION INFORMATION</div>
                <div className="font-semibold text-black">{boxes.box_32_service_facility?.name}</div>
                <div className="text-[9px] text-gray-700">{boxes.box_32_service_facility?.address}, {boxes.box_32_service_facility?.city_state_zip} (NPI: {boxes.box_32_service_facility?.npi})</div>
              </div>
              <div className="col-span-6 p-2">
                <div className="text-[9px] text-red-600 font-bold uppercase">33. BILLING PROVIDER INFO & PH #</div>
                <div className="font-semibold text-black">{boxes.box_33_billing_provider?.name}</div>
                <div className="text-[9px] text-gray-700">{boxes.box_33_billing_provider?.address} • {boxes.box_33_billing_provider?.phone}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
