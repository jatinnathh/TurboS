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
  const [showWard, setShowWard] = useState(false);
  const [showLab, setShowLab] = useState(false);

  const [selectedWard, setSelectedWard] = useState("");
  const [selectedLab, setSelectedLab] = useState("");
  const [testType, setTestType] = useState("");

  const [selectedDept, setSelectedDept] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");

  const [medication, setMedication] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [notes, setNotes] = useState("");

  const departments = [...new Set(doctors.map((d) => d.department))];
  const filteredDoctors = doctors.filter((d) => d.department === selectedDept);

  /* ---------------- REFER DOCTOR ---------------- */
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

  /* ---------------- PRESCRIBE ---------------- */
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

  /* ---------------- ADMIT ---------------- */
  const handleAdmit = async () => {
    if (!confirm("Admit this patient?")) return;
    const res = await fetch("/api/doctor/admit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId }),
    });
    if (res.ok) router.refresh();
    else alert("Failed to admit patient");
  };

  /* ---------------- DISCHARGE ---------------- */
  const handleDischarge = async () => {
    if (!confirm("Discharge this patient?")) return;
    const res = await fetch("/api/doctor/discharge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId }),
    });
    if (res.ok) {
      router.push("/doctor/dashboard");
      router.refresh();
    } else alert("Discharge failed");
  };

  /* ---------------- REFER WARD ---------------- */
  const handleReferWard = async () => {
    if (!selectedWard) {
      alert("Select ward");
      return;
    }
    const res = await fetch("/api/doctor/refer-ward", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, ward: selectedWard }),
    });
    if (res.ok) {
      setShowWard(false);
      setSelectedWard("");
      router.refresh();
    } else {
      alert("Ward referral failed");
    }
  };

  /* ---------------- ORDER LAB TEST ---------------- */
  const handleOrderLab = async () => {
    if (!selectedLab || !testType) {
      alert("Select department and enter test type");
      return;
    }
    const res = await fetch("/api/doctor/order-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, department: selectedLab, testType }),
    });
    if (res.ok) {
      setShowLab(false);
      setSelectedLab("");
      setTestType("");
      router.refresh();
    } else {
      alert("Failed to order test");
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 bg-white/[0.06] border border-white/[0.1] rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500/40 focus:ring-1 focus:ring-sky-500/20 transition-all";

  // Reusable modal wrapper
  const Modal = ({
    show,
    onClose,
    borderColor,
    children,
  }: {
    show: boolean;
    onClose: () => void;
    borderColor: string;
    children: React.ReactNode;
  }) => {
    if (!show) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <div className={`relative z-10 w-full max-w-md bg-[#0d1117] border ${borderColor} rounded-2xl p-6 space-y-5 shadow-2xl`}>
          {children}
        </div>
      </div>
    );
  };

  const ModalHeader = ({
    icon,
    title,
    subtitle,
    onClose,
  }: {
    icon: string;
    title: string;
    subtitle: string;
    onClose: () => void;
  }) => (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{icon}</span>
          <div>
            <h3 className="text-base font-extrabold tracking-tight text-slate-100">{title}</h3>
            <p className="text-xs text-slate-500 font-light">{subtitle}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.05] text-slate-500 hover:text-slate-300 hover:bg-white/[0.09] transition-all text-sm"
        >
          ✕
        </button>
      </div>
      <div className="h-px bg-white/[0.06]" />
    </>
  );

  return (
    <>
      {/* ── Action Buttons ── */}
      <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-4">
          Actions
        </p>
        <div className="flex gap-3 flex-wrap">

          <button
            onClick={() => setShowPrescribe(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30 hover:bg-emerald-500/20 hover:ring-emerald-400/50 text-sm font-semibold transition-all"
          >
            💊 Prescribe
          </button>

          <button
            onClick={() => setShowRefer(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30 hover:bg-amber-500/20 hover:ring-amber-400/50 text-sm font-semibold transition-all"
          >
            🔁 Refer Patient
          </button>

          <button
            onClick={() => setShowWard(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/30 hover:bg-violet-500/20 hover:ring-violet-400/50 text-sm font-semibold transition-all"
          >
            🏨 Refer Ward
          </button>

          <button
            onClick={() => setShowLab(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500/10 text-teal-400 ring-1 ring-teal-500/30 hover:bg-teal-500/20 hover:ring-teal-400/50 text-sm font-semibold transition-all"
          >
            🧪 Order Lab Test
          </button>

          <button
            onClick={handleAdmit}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/30 hover:bg-sky-500/20 hover:ring-sky-400/50 text-sm font-semibold transition-all"
          >
            🏥 Admit
          </button>

          <button
            onClick={handleDischarge}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/30 hover:bg-rose-500/20 hover:ring-rose-400/50 text-sm font-semibold transition-all ml-auto"
          >
            🏁 Discharge
          </button>

        </div>
      </div>

      {/* ── PRESCRIBE MODAL ── */}
      <Modal show={showPrescribe} onClose={() => setShowPrescribe(false)} borderColor="border-emerald-500/20">
        <ModalHeader
          icon="💊"
          title="Add Prescription"
          subtitle="Prescribe medication for this patient"
          onClose={() => setShowPrescribe(false)}
        />

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Medication</label>
          <input
            className={inputClass}
            placeholder="e.g. Amoxicillin"
            value={medication}
            onChange={(e) => setMedication(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Dosage</label>
            <input
              className={inputClass}
              placeholder="e.g. 500mg"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Frequency</label>
            <input
              className={inputClass}
              placeholder="e.g. Twice daily"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            />
          </div>
        </div>

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
      </Modal>

      {/* ── REFER DOCTOR MODAL ── */}
      <Modal show={showRefer} onClose={() => setShowRefer(false)} borderColor="border-amber-500/20">
        <ModalHeader
          icon="🔁"
          title="Refer Patient"
          subtitle="Transfer care to another department"
          onClose={() => setShowRefer(false)}
        />

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Department</label>
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

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Doctor</label>
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
      </Modal>

      {/* ── REFER WARD MODAL ── */}
      <Modal show={showWard} onClose={() => setShowWard(false)} borderColor="border-violet-500/20">
        <ModalHeader
          icon="🏨"
          title="Refer to Ward"
          subtitle="Transfer patient to a hospital ward"
          onClose={() => setShowWard(false)}
        />

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Ward</label>
          <select
            className={inputClass}
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
          >
            <option value="">Select Ward</option>
            <option value="General Ward">General Ward</option>
            <option value="ICU">ICU</option>
            <option value="HDU">HDU</option>
            <option value="Cardiac Ward">Cardiac Ward</option>
            <option value="Surgical Ward">Surgical Ward</option>
            <option value="Paediatric Ward">Paediatric Ward</option>
          </select>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={handleReferWard}
            className="flex-1 py-2.5 rounded-xl bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/30 hover:bg-violet-500/20 hover:ring-violet-400/50 text-sm font-bold transition-all"
          >
            Confirm Ward Transfer
          </button>
          <button
            onClick={() => setShowWard(false)}
            className="px-5 py-2.5 rounded-xl bg-white/[0.04] text-slate-500 ring-1 ring-white/[0.08] hover:bg-white/[0.07] text-sm font-semibold transition-all"
          >
            Cancel
          </button>
        </div>
      </Modal>

      {/* ── ORDER LAB TEST MODAL ── */}
      <Modal show={showLab} onClose={() => setShowLab(false)} borderColor="border-teal-500/20">
        <ModalHeader
          icon="🧪"
          title="Order Lab Test"
          subtitle="Request a diagnostic test for this patient"
          onClose={() => setShowLab(false)}
        />

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Lab Department</label>
          <select
            className={inputClass}
            value={selectedLab}
            onChange={(e) => setSelectedLab(e.target.value)}
          >
            <option value="">Select Lab Department</option>
            <option value="Radiology">Radiology</option>
            <option value="Pathology">Pathology</option>
            <option value="Blood Lab">Blood Lab</option>
            <option value="Cardiac Lab">Cardiac Lab</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Test Type</label>
          <input
            className={inputClass}
            placeholder="e.g. CBC, X-Ray Chest, ECG"
            value={testType}
            onChange={(e) => setTestType(e.target.value)}
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={handleOrderLab}
            className="flex-1 py-2.5 rounded-xl bg-teal-500/10 text-teal-400 ring-1 ring-teal-500/30 hover:bg-teal-500/20 hover:ring-teal-400/50 text-sm font-bold transition-all"
          >
            Confirm Order
          </button>
          <button
            onClick={() => setShowLab(false)}
            className="px-5 py-2.5 rounded-xl bg-white/[0.04] text-slate-500 ring-1 ring-white/[0.08] hover:bg-white/[0.07] text-sm font-semibold transition-all"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </>
  );
}