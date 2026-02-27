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
    "w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all";

  return (
    <div className="space-y-4">

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

      {/* ── Refer Card ── */}
      {showRefer && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest">
              🔁 Refer Patient
            </h3>
            <button
              onClick={() => setShowRefer(false)}
              className="text-slate-600 hover:text-slate-400 transition-colors text-lg leading-none"
            >
              ✕
            </button>
          </div>

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

          <select
            className={inputClass}
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            disabled={!selectedDept}
          >
            <option value="">Select Doctor</option>
            {filteredDoctors.map((doc) => (
              <option key={doc.id} value={doc.id}>{doc.name}</option>
            ))}
          </select>

          <div className="flex gap-3">
            <button
              onClick={handleRefer}
              className="flex-1 py-2.5 rounded-xl bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30 hover:bg-amber-500/20 text-sm font-semibold transition-all"
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
      )}

      {/* ── Prescribe Card ── */}
      {showPrescribe && (
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest">
              💊 Add Prescription
            </h3>
            <button
              onClick={() => setShowPrescribe(false)}
              className="text-slate-600 hover:text-slate-400 transition-colors text-lg leading-none"
            >
              ✕
            </button>
          </div>

          <input
            className={inputClass}
            placeholder="Medication name"
            value={medication}
            onChange={(e) => setMedication(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              className={inputClass}
              placeholder="Dosage (e.g. 500mg)"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
            />
            <input
              className={inputClass}
              placeholder="Frequency (e.g. Twice daily)"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            />
          </div>

          <textarea
            className={`${inputClass} resize-none`}
            rows={3}
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex gap-3">
            <button
              onClick={handlePrescribe}
              className="flex-1 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30 hover:bg-emerald-500/20 text-sm font-semibold transition-all"
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
      )}
    </div>
  );
}