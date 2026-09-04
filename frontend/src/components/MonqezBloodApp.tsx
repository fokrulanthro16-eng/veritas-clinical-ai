'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Droplet,
  Heart,
  Phone,
  Share2,
  AlertCircle,
  MapPin,
  Clock,
  CheckCircle2,
  ShieldCheck,
  User,
  Plus,
  X,
  Search,
  Calendar,
  Award,
  Sparkles,
  ArrowRight,
  Activity,
  ChevronRight,
  Send,
  SlidersHorizontal,
  Stethoscope
} from 'lucide-react';

interface BloodAppeal {
  id: string;
  patientName: string;
  bloodGroup: string;
  hospital: string;
  location: string;
  distanceKm: number;
  unitsNeeded: number;
  urgency: 'CRITICAL' | 'URGENT' | 'STANDARD';
  timeAgo: string;
  verified: boolean;
  contactNumber: string;
  notes: string;
  donorsCommitted: number;
}

const INITIAL_APPEALS: BloodAppeal[] = [
  {
    id: 'req-01',
    patientName: 'Ayesha Rahman',
    bloodGroup: 'O-',
    hospital: 'Dhaka Medical College Hospital (DMCH)',
    location: 'Bakshibazar, Dhaka',
    distanceKm: 2.4,
    unitsNeeded: 2,
    urgency: 'CRITICAL',
    timeAgo: '12m ago',
    verified: true,
    contactNumber: '+880 1711-948201',
    notes: 'Emergency cesarean section with massive postpartum hemorrhage. Immediate O- transfusion required.',
    donorsCommitted: 1
  },
  {
    id: 'req-02',
    patientName: 'Tanvir Hossain',
    bloodGroup: 'A+',
    hospital: 'Square Hospital Ltd.',
    location: 'Panthapath, Dhaka',
    distanceKm: 4.1,
    unitsNeeded: 3,
    urgency: 'CRITICAL',
    timeAgo: '28m ago',
    verified: true,
    contactNumber: '+880 1819-334210',
    notes: 'Major trauma & polytrauma stabilization in ICU Bed 08. Platelets & PRBC needed.',
    donorsCommitted: 2
  },
  {
    id: 'req-03',
    patientName: 'Kazi Farhan',
    bloodGroup: 'B+',
    hospital: 'Evercare Hospital Dhaka',
    location: 'Bashundhara R/A, Dhaka',
    distanceKm: 7.8,
    unitsNeeded: 2,
    urgency: 'URGENT',
    timeAgo: '45m ago',
    verified: true,
    contactNumber: '+880 1912-785409',
    notes: 'Undergoing emergency open-heart CABG surgery scheduled for 2:00 PM.',
    donorsCommitted: 0
  },
  {
    id: 'req-04',
    patientName: 'Nusrat Jahan',
    bloodGroup: 'AB-',
    hospital: 'Bangabandhu Sheikh Mujib Medical University (BSMMU)',
    location: 'Shahbag, Dhaka',
    distanceKm: 3.2,
    unitsNeeded: 1,
    urgency: 'CRITICAL',
    timeAgo: '1h ago',
    verified: true,
    contactNumber: '+880 1673-890124',
    notes: 'Thalassemia patient experiencing acute hemolytic crisis and profound anemia (Hb 4.8 g/dL).',
    donorsCommitted: 0
  },
  {
    id: 'req-05',
    patientName: 'Rafiqul Islam',
    bloodGroup: 'O+',
    hospital: 'United Hospital Limited',
    location: 'Gulshan-2, Dhaka',
    distanceKm: 6.5,
    unitsNeeded: 4,
    urgency: 'URGENT',
    timeAgo: '2h ago',
    verified: true,
    contactNumber: '+880 1714-550912',
    notes: 'Severe dengue shock syndrome with thrombocytopenia (platelet count < 18,000/mcL).',
    donorsCommitted: 3
  }
];

const BLOOD_GROUPS = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const MonqezBloodApp: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [appeals, setAppeals] = useState<BloodAppeal[]>(INITIAL_APPEALS);
  const [activeTab, setActiveTab] = useState<'requests' | 'donors' | 'passport'>('requests');
  const [showRequestModal, setShowRequestModal] = useState<boolean>(false);
  const [showCommitModal, setShowCommitModal] = useState<BloodAppeal | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Request Form State
  const [newPatient, setNewPatient] = useState('');
  const [newGroup, setNewGroup] = useState('O+');
  const [newHospital, setNewHospital] = useState('');
  const [newUnits, setNewUnits] = useState(1);
  const [newUrgency, setNewUrgency] = useState<'CRITICAL' | 'URGENT' | 'STANDARD'>('CRITICAL');
  const [newContact, setNewContact] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredAppeals = appeals.filter((app) => {
    if (selectedGroup === 'All') return true;
    return app.bloodGroup === selectedGroup;
  });

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient || !newHospital || !newContact) {
      alert('Please fill all required fields');
      return;
    }

    const newAppeal: BloodAppeal = {
      id: `req-${Date.now()}`,
      patientName: newPatient,
      bloodGroup: newGroup,
      hospital: newHospital,
      location: 'Dhaka Metro',
      distanceKm: 1.5,
      unitsNeeded: Number(newUnits),
      urgency: newUrgency,
      timeAgo: 'Just now',
      verified: true,
      contactNumber: newContact,
      notes: newNotes || 'Urgent medical requirement.',
      donorsCommitted: 0
    };

    setAppeals([newAppeal, ...appeals]);
    setShowRequestModal(false);
    showToast(`Emergency broadcast sent for ${newGroup} blood at ${newHospital}`);
    // Reset
    setNewPatient('');
    setNewHospital('');
    setNewContact('');
    setNewNotes('');
  };

  const handleCommitDonation = (appealId: string) => {
    setAppeals((prev) =>
      prev.map((a) =>
        a.id === appealId
          ? { ...a, donorsCommitted: a.donorsCommitted + 1 }
          : a
      )
    );
    setShowCommitModal(null);
    showToast('Thank you! Your donation commitment has been dispatched to the hospital blood bank coordinator.');
  };

  const handleShare = (appeal: BloodAppeal) => {
    if (navigator.share) {
      navigator.share({
        title: `URGENT: ${appeal.bloodGroup} Blood Needed`,
        text: `Urgent ${appeal.bloodGroup} blood appeal for ${appeal.patientName} at ${appeal.hospital}. Please contact: ${appeal.contactNumber}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `[MONQEZ SOS] Urgent ${appeal.bloodGroup} blood needed for ${appeal.patientName} at ${appeal.hospital}. Contact: ${appeal.contactNumber}`
      );
      showToast('Appeal details copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-[#090D14] text-slate-100 font-sans selection:bg-[#D90429] selection:text-white pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#121722] border border-[#D90429] text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 text-xs font-medium animate-fadeIn">
          <Droplet className="w-4 h-4 text-[#D90429] fill-[#D90429] animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Navigation */}
      <header className="bg-[#0C1018]/90 backdrop-blur-md border-b border-[#1F2937] sticky top-0 z-40 px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-[#D90429] via-[#EF233C] to-[#FF4D6D] flex items-center justify-center text-white shadow-lg shadow-[#D90429]/30">
              <Droplet className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black tracking-tight text-base text-white">
                  MONQEZ <span className="text-[#D90429]">BLOOD</span>
                </span>
                <span className="text-[10px] font-mono font-bold bg-[#D90429]/20 text-[#FF4D6D] border border-[#D90429]/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D90429] animate-ping" />
                  LIVE SOS
                </span>
              </div>
              <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 font-medium">
                <MapPin className="w-3 h-3 text-[#D90429]" />
                <span>Dhaka, Bangladesh</span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 font-semibold">1,482 Active Donors Online</span>
              </div>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-3">
            <Link
              href="/clinical"
              className="hidden sm:flex items-center space-x-1.5 bg-[#121722] hover:bg-[#1A202C] text-slate-300 hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold border border-[#1F2937] transition"
            >
              <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
              <span>Veritas Clinical AI</span>
            </Link>

            <button
              onClick={() => setShowRequestModal(true)}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-[#D90429] to-[#EF233C] hover:from-[#b80323] hover:to-[#d90429] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-lg shadow-[#D90429]/30 transition transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Emergency Request</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-5 space-y-5">
        {/* Donor Passport / Quick Eligibility Summary Card */}
        <div className="bg-gradient-to-br from-[#121722] via-[#0C1018] to-[#121722] border border-[#1F2937] rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#D90429]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            {/* Donor Identity */}
            <div className="flex items-center space-x-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-900 border-2 border-[#D90429] flex items-center justify-center text-xl font-black text-[#D90429] shadow-inner font-mono">
                O+
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-sm font-bold text-white">Donor Passport: Sarah Jenkins, MD</h2>
                  <span className="text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Eligible to Donate
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Universal Red Cell Compatible (O+) • Last Donated: <strong className="text-slate-200">Nov 14, 2025</strong>
                </p>
              </div>
            </div>

            {/* 3-Column Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 bg-[#090D14]/80 p-2.5 rounded-xl border border-[#1F2937] font-mono text-center">
              <div className="px-3 py-1">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Blood Group</div>
                <div className="text-base font-black text-[#D90429]">O+ Positive</div>
              </div>
              <div className="px-3 py-1 border-x border-[#1F2937]">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Lives Saved</div>
                <div className="text-base font-black text-emerald-400">12 Patients</div>
              </div>
              <div className="px-3 py-1">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Next Eligible</div>
                <div className="text-base font-black text-cyan-400">TODAY (Ready)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Blood Group Filtering Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 mr-1">
            <Droplet className="w-3.5 h-3.5 text-[#D90429]" /> Filter:
          </span>
          {BLOOD_GROUPS.map((group) => {
            const isActive = selectedGroup === group;
            return (
              <button
                key={group}
                onClick={() => setSelectedGroup(group)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition whitespace-nowrap flex items-center space-x-1 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#D90429] to-[#EF233C] text-white shadow-md shadow-[#D90429]/30 ring-1 ring-white/30'
                    : 'bg-[#121722] hover:bg-[#1A202C] text-slate-400 hover:text-white border border-[#1F2937]'
                }`}
              >
                <span>{group}</span>
              </button>
            );
          })}
        </div>

        {/* Section Heading & Count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-[#D90429]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
              Live Urgent Appeals Near You ({filteredAppeals.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Auto-refreshing via Hospital Blood Bank Network
          </span>
        </div>

        {/* Urgent Appeals Feed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAppeals.map((appeal) => {
            const isCritical = appeal.urgency === 'CRITICAL';
            return (
              <div
                key={appeal.id}
                className={`bg-[#121722] border rounded-2xl p-4 shadow-xl flex flex-col justify-between transition hover:border-[#D90429]/60 relative overflow-hidden ${
                  isCritical ? 'border-[#D90429]/80 shadow-[#D90429]/5' : 'border-[#1F2937]'
                }`}
              >
                {/* Top Badge Strip */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-11 h-11 rounded-xl bg-[#090D14] border-2 border-[#D90429] flex items-center justify-center font-black text-sm text-[#D90429] font-mono shadow-md">
                      {appeal.bloodGroup}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h4 className="font-bold text-sm text-white">{appeal.patientName}</h4>
                        {appeal.verified && (
                          <span title="Hospital Verified Patient">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{appeal.timeAgo}</span>
                        <span>•</span>
                        <span className="text-cyan-400 font-medium">{appeal.distanceKm} km away</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-[9px] font-black uppercase font-mono px-2 py-0.5 rounded-full border ${
                        isCritical
                          ? 'bg-[#D90429]/20 text-[#FF4D6D] border-[#D90429]/60 animate-pulse'
                          : 'bg-amber-950/80 text-amber-300 border-amber-800'
                      }`}
                    >
                      {appeal.urgency}
                    </span>
                    <span className="text-[10px] font-mono text-slate-300 bg-[#090D14] px-1.5 py-0.5 rounded border border-[#1F2937]">
                      {appeal.unitsNeeded} Units Required
                    </span>
                  </div>
                </div>

                {/* Hospital & Location */}
                <div className="bg-[#090D14]/90 p-2.5 rounded-xl border border-[#1F2937] mb-3 text-xs space-y-1">
                  <div className="flex items-center space-x-1.5 text-slate-200 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-[#D90429] flex-shrink-0" />
                    <span className="truncate">{appeal.hospital}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-5 leading-tight">{appeal.notes}</p>
                </div>

                {/* Committed Donors Bar */}
                {appeal.donorsCommitted > 0 && (
                  <div className="mb-3 text-[11px] font-mono text-emerald-400 flex items-center justify-between bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-900/60">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 fill-current" />
                      {appeal.donorsCommitted} Donor{appeal.donorsCommitted > 1 ? 's' : ''} En Route
                    </span>
                    <span className="text-[10px] text-slate-400">Status: Dispatched</span>
                  </div>
                )}

                {/* Action Button Row */}
                <div className="flex items-center space-x-2 pt-1 border-t border-[#1F2937]">
                  <button
                    onClick={() => handleShare(appeal)}
                    className="p-2 rounded-xl bg-[#090D14] hover:bg-[#1A202C] text-slate-300 hover:text-white border border-[#1F2937] transition"
                    title="Share Appeal"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={`tel:${appeal.contactNumber}`}
                    className="flex-1 flex items-center justify-center space-x-1.5 bg-[#090D14] hover:bg-[#1A202C] text-slate-200 hover:text-white py-2 rounded-xl text-xs font-semibold border border-[#1F2937] transition font-mono"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Direct Call</span>
                  </a>

                  <button
                    onClick={() => setShowCommitModal(appeal)}
                    className="flex-1 flex items-center justify-center space-x-1.5 bg-gradient-to-r from-[#D90429] to-[#EF233C] hover:from-[#b80323] hover:to-[#d90429] text-white py-2 rounded-xl text-xs font-bold shadow-md shadow-[#D90429]/30 transition transform active:scale-95"
                  >
                    <Droplet className="w-3.5 h-3.5 fill-current" />
                    <span>Donate Now</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Emergency Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#121722] border-2 border-[#D90429] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-[#D90429] text-white shadow-lg shadow-[#D90429]/30">
                  <Droplet className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white font-mono uppercase tracking-wider">
                    Broadcast Emergency Blood Appeal
                  </h3>
                  <p className="text-[11px] text-slate-400">Notifies verified matching donors within 10 km</p>
                </div>
              </div>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Patient Name *</label>
                <input
                  type="text"
                  required
                  value={newPatient}
                  onChange={(e) => setNewPatient(e.target.value)}
                  placeholder="e.g. Farzana Akhter"
                  className="w-full bg-[#090D14] border border-[#1F2937] rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-[#D90429]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Blood Group Required *</label>
                  <select
                    value={newGroup}
                    onChange={(e) => setNewGroup(e.target.value)}
                    className="w-full bg-[#090D14] border border-[#1F2937] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D90429]"
                  >
                    {BLOOD_GROUPS.filter((g) => g !== 'All').map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Units (Bags) Needed *</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    required
                    value={newUnits}
                    onChange={(e) => setNewUnits(Number(e.target.value))}
                    className="w-full bg-[#090D14] border border-[#1F2937] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D90429]"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Hospital / Medical Center *</label>
                <input
                  type="text"
                  required
                  value={newHospital}
                  onChange={(e) => setNewHospital(e.target.value)}
                  placeholder="e.g. Dhaka Medical College Hospital (ICU Bed 4)"
                  className="w-full bg-[#090D14] border border-[#1F2937] rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-[#D90429]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Contact Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    placeholder="+880 1711-XXXXXX"
                    className="w-full bg-[#090D14] border border-[#1F2937] rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-[#D90429]"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Urgency Level</label>
                  <select
                    value={newUrgency}
                    onChange={(e) => setNewUrgency(e.target.value as any)}
                    className="w-full bg-[#090D14] border border-[#1F2937] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D90429]"
                  >
                    <option value="CRITICAL">CRITICAL (Within 1 hour)</option>
                    <option value="URGENT">URGENT (Within 4 hours)</option>
                    <option value="STANDARD">STANDARD (Scheduled Surgery)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Clinical Rationale / Notes</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Emergency surgery, accident trauma, childbirth, etc."
                  className="w-full bg-[#090D14] border border-[#1F2937] rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-[#D90429]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#D90429] to-[#EF233C] hover:from-[#b80323] hover:to-[#d90429] text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-[#D90429]/30 transition"
                >
                  Send Emergency SOS Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Donation Commitment Confirmation Modal */}
      {showCommitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#121722] border-2 border-emerald-600 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-emerald-950 border border-emerald-700 text-emerald-400">
                <Heart className="w-6 h-6 fill-current animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Confirm Blood Donation</h3>
                <p className="text-xs text-slate-400">
                  {showCommitModal.patientName} • {showCommitModal.bloodGroup} at {showCommitModal.hospital}
                </p>
              </div>
            </div>

            <div className="bg-[#090D14] p-3 rounded-xl border border-[#1F2937] text-xs text-slate-300 space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Hospital:</span>
                <span className="font-bold text-white text-right">{showCommitModal.hospital}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Direct Contact:</span>
                <span className="font-bold text-emerald-400">{showCommitModal.contactNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Required:</span>
                <span>{showCommitModal.unitsNeeded} Units</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              By confirming, your live donor profile will be shared with the patient&apos;s hospital coordinator and emergency transport dispatch.
            </p>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setShowCommitModal(null)}
                className="flex-1 bg-[#090D14] hover:bg-[#1A202C] text-slate-400 hover:text-white py-2.5 rounded-xl text-xs font-semibold border border-[#1F2937] transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCommitDonation(showCommitModal.id)}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition"
              >
                Confirm & Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Dock Navigation */}
      <div className="fixed bottom-0 inset-x-0 bg-[#0C1018]/95 backdrop-blur-md border-t border-[#1F2937] px-6 py-2 z-40">
        <div className="max-w-md mx-auto flex items-center justify-around font-mono text-xs">
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex flex-col items-center space-y-1 py-1 transition ${
              activeTab === 'requests' ? 'text-[#D90429] font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Droplet className="w-4 h-4 fill-current" />
            <span className="text-[10px]">Appeals</span>
          </button>

          <button
            onClick={() => setActiveTab('donors')}
            className={`flex flex-col items-center space-y-1 py-1 transition ${
              activeTab === 'donors' ? 'text-[#D90429] font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <User className="w-4 h-4" />
            <span className="text-[10px]">Donors</span>
          </button>

          <button
            onClick={() => setActiveTab('passport')}
            className={`flex flex-col items-center space-y-1 py-1 transition ${
              activeTab === 'passport' ? 'text-[#D90429] font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px]">Passport</span>
          </button>
        </div>
      </div>
    </div>
  );
};
