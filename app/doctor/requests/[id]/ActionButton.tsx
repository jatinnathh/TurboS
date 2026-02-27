"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Doctor {
  id: string;
  name: string;
  department: string;
}

interface Props {
  requestId: string;
  doctors: Doctor[];
}

export default function ActionButtons({ requestId, doctors }: Props) {
  const router = useRouter();

  const [showRefer, setShowRefer] = useState(false);
  const [showPrescribe, setShowPrescribe] = useState(false);

  const [selectedDept, setSelectedDept] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");

  const [medication, setMedication] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [notes, setNotes] = useState("");

  const departments = [...new Set(doctors.map((d) => d.department))];
  const filteredDoctors = doctors.filter((d) => d.department === selectedDept);

  // 🔁 REFER
  const handleRefer = async () => {
    if (!selectedDept || !selectedDoctor) {
      alert("Please select department and doctor");
      return;
    }
    const res = await fetch("/api/doctor/refer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, doctorId: selectedDoctor }),
    });
    if (res.ok) {
      router.push("/doctor/dashboard");
      router.refresh();
    } else {
      alert("Referral failed");
    }
  };

  // 💊 PRESCRIBE
  const handlePrescribe = async () => {
    if (!medication || !dosage || !frequency) {
      alert("Please fill required prescription fields");
      return;
    }
    const res = await fetch("/api/doctor/prescribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, medication, dosage, frequency, notes }),
    });
    if (res.ok) {
      setShowPrescribe(false);
      setMedication("");
      setDosage("");
      setFrequency("");
      setNotes("");
      router.refresh();
    } else {
      alert("Failed to prescribe");
    }
  };

  // 🏁 DISCHARGE
  const handleDischarge = async () => {
    const confirmClose = confirm("Are you sure you want to discharge this patient?");
    if (!confirmClose) return;
    const res = await fetch("/api/doctor/discharge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId }),
    });
    if (res.ok) {
      router.push("/doctor/dashboard");
      router.refresh();
    } else {
      alert("Discharge failed");
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 bg-white/[0.06] border border-white/[0.1] rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500/40 focus:ring-1 focus:ring-sky-500/20 transition-all";

  return (
    <>
      {/* ── Main Action Buttons ── */}
      <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-4">
          Actions
        </p>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => { setShowPrescribe(true); setShowRefer(false); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30 hover:bg-emerald-500/20 hover:ring-emerald-400/50 text-sm font-semibold transition-all"
          >
            💊 Prescribe
          </button>

          <button
            onClick={() => { setShowRefer(true); setShowPrescribe(false); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30 hover:bg-amber-500/20 hover:ring-amber-400/50 text-sm font-semibold transition-all"
          >
            🔁 Refer Patient
          </button>

          <button
            onClick={handleDischarge}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/30 hover:bg-rose-500/20 hover:ring-rose-400/50 text-sm font-semibold transition-all ml-auto"
          >
            🏁 Discharge Patient
          </button>
        </div>
      </div>

      {/* ── REFER MODAL ── */}
      {showRefer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowRefer(false)}
          />

          {/* Dialog */}
          <div className="relative z-10 w-full max-w-md bg-[#0d1117] border border-amber-500/20 rounded-2xl p-6 space-y-5 shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔁</span>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight text-slate-100">
                    Refer Patient
                  </h3>
                  <p className="text-xs text-slate-500 font-light">
                    Transfer care to another department
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRefer(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.05] text-slate-500 hover:text-slate-300 hover:bg-white/[0.09] transition-all text-sm"
              >
                ✕
              </button>
            </div>

            <div className="h-px bg-white/[0.06]" />

            {/* Department */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                Department
              </label>
              <select
                className={inputClass}
                value={selectedDept}
                onChange={(e) => { setSelectedDept(e.target.value); setSelectedDoctor(""); }}
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Doctor */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                Doctor
              </label>
              <select
                className={`${inputClass} disabled:opacity-40 disabled:cursor-not-allowed`}
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                disabled={!selectedDept}
              >
                <option value="">Select Doctor</option>
                {filteredDoctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>{doc.name}</option>
                ))}
              </select>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleRefer}
                className="flex-1 py-2.5 rounded-xl bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30 hover:bg-amber-500/20 hover:ring-amber-400/50 text-sm font-bold transition-all"
              >
                Confirm Referral
              </button>
              <button
                onClick={() => setShowRefer(false)}
                className="px-5 py-2.5 rounded-xl bg-white/[0.04] text-slate-500 ring-1 ring-white/[0.08] hover:bg-white/[0.07] text-sm font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PRESCRIBE MODAL ── */}
      {showPrescribe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowPrescribe(false)}
          />

          {/* Dialog */}
          <div className="relative z-10 w-full max-w-md bg-[#0d1117] border border-emerald-500/20 rounded-2xl p-6 space-y-5 shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">💊</span>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight text-slate-100">
                    Add Prescription
                  </h3>
                  <p className="text-xs text-slate-500 font-light">
                    Prescribe medication for this patient
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPrescribe(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.05] text-slate-500 hover:text-slate-300 hover:bg-white/[0.09] transition-all text-sm"
              >
                ✕
              </button>
            </div>

            <div className="h-px bg-white/[0.06]" />

            {/* Medication */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                Medication
              </label>
              <input
                className={inputClass}
                placeholder="e.g. Amoxicillin"
                value={medication}
                onChange={(e) => setMedication(e.target.value)}
              />
            </div>

            {/* Dosage + Frequency */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  Dosage
                </label>
                <input
                  className={inputClass}
                  placeholder="e.g. 500mg"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  Frequency
                </label>
                <input
                  className={inputClass}
                  placeholder="e.g. Twice daily"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                Notes <span className="normal-case text-slate-600">(optional)</span>
              </label>
              <textarea
                className={`${inputClass} resize-none`}
                rows={3}
                placeholder="Additional instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={handlePrescribe}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30 hover:bg-emerald-500/20 hover:ring-emerald-400/50 text-sm font-bold transition-all"
              >
                Add Prescription
              </button>
              <button
                onClick={() => setShowPrescribe(false)}
                className="px-5 py-2.5 rounded-xl bg-white/[0.04] text-slate-500 ring-1 ring-white/[0.08] hover:bg-white/[0.07] text-sm font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}