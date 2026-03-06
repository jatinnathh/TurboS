"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generatePrintHTML } from "@/lib/generatePrintHTML";

interface Medication {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
}

interface ReportData {
    patientName: string;
    date: string;
    age: string;
    gender: string;
    vitalsBp: string;
    vitalsPulse: string;
    vitalsTemp: string;
    vitalsWeight: string;
    symptoms: string[];
    diagnosis: string;
    medications: Medication[];
    advice: string;
    nextVisit: string;
}

interface Props {
    requestId: string;
    doctorName: string;
    doctorDepartment: string;
    patientEmail: string;
    initialReport: ReportData | null;
    isReadOnly?: boolean;
}

function parseReport(raw: any): ReportData {
    if (!raw) {
        return {
            patientName: "",
            date: new Date().toISOString().split("T")[0],
            age: "",
            gender: "",
            vitalsBp: "",
            vitalsPulse: "",
            vitalsTemp: "",
            vitalsWeight: "",
            symptoms: [""],
            diagnosis: "",
            medications: [{ name: "", dosage: "", frequency: "", duration: "" }],
            advice: "",
            nextVisit: "",
        };
    }
    return raw;
}

/* ─── Mini A4 Preview (thumbnail) ────────────────────────────────── */
function ReportThumbnail({
    data,
    doctorName,
    doctorDept,
    hasReport,
}: {
    data: ReportData;
    doctorName: string;
    doctorDept: string;
    hasReport: boolean;
}) {
    if (!hasReport) {
        return (
            <div className="w-full aspect-[210/297] bg-white/[0.03] border-2 border-dashed border-white/[0.12] rounded-xl flex flex-col items-center justify-center gap-3">
                <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <p className="text-xs text-slate-600 font-semibold">No Report Yet</p>
                <p className="text-[10px] text-slate-700">Click to create</p>
            </div>
        );
    }

    return (
        <div className="w-full aspect-[210/297] bg-white rounded-xl overflow-hidden shadow-lg shadow-black/40 relative">
            <div className="p-3 scale-[0.6] origin-top-left w-[166%]">
                {/* Mini header */}
                <div className="text-center border-b-2 border-sky-600 pb-2 mb-2">
                    <p className="text-sm font-bold text-sky-700">MediFlow</p>
                    <p className="text-[9px] text-gray-600">{doctorName} · {doctorDept}</p>
                </div>
                {/* Mini patient */}
                <div className="flex gap-4 text-[8px] text-gray-700 mb-2">
                    <span><b>Name:</b> {data.patientName}</span>
                    <span><b>Date:</b> {data.date}</span>
                </div>
                {/* Mini vitals */}
                <div className="flex gap-3 text-[7px] bg-sky-50 rounded p-1 mb-2 text-gray-600">
                    <span>BP: {data.vitalsBp}</span>
                    <span>Pulse: {data.vitalsPulse}</span>
                    <span>Temp: {data.vitalsTemp}</span>
                </div>
                {/* Mini diagnosis */}
                {data.diagnosis && (
                    <div className="text-[7px] text-gray-700 mb-1">
                        <b>Dx:</b> {data.diagnosis.substring(0, 60)}...
                    </div>
                )}
                {/* Mini meds */}
                {data.medications.filter(m => m.name).length > 0 && (
                    <div className="text-[7px] text-gray-700">
                        <b>Rx:</b>
                        {data.medications.filter(m => m.name).map((m, i) => (
                            <div key={i} className="ml-2">{i + 1}. {m.name}</div>
                        ))}
                    </div>
                )}
            </div>
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-sky-500/0 hover:bg-sky-500/10 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                <span className="px-3 py-1.5 bg-[#0d1117]/90 text-sky-400 text-xs font-bold rounded-lg shadow-lg">
                    Click to open
                </span>
            </div>
        </div>
    );
}

/* ─── Full A4 Preview (inside modal) ─────────────────────────────── */
function ReportPreview({
    data,
    doctorName,
    doctorDept,
}: {
    data: ReportData;
    doctorName: string;
    doctorDept: string;
}) {
    return (
        <div className="bg-white text-gray-900 rounded-xl shadow-2xl shadow-black/50 p-8 max-w-[700px] mx-auto" id="doctor-report-printable">
            {/* Header */}
            <div className="text-center border-b-2 border-sky-600 pb-4 mb-5">
                <h2 className="text-xl font-bold text-sky-700 tracking-tight">MediFlow</h2>
                <p className="text-sm font-semibold text-gray-700 mt-1">{doctorName}</p>
                <p className="text-xs text-gray-500">{doctorDept}</p>
            </div>

            {/* Patient Info */}
            <div className="grid grid-cols-3 gap-3 text-sm mb-4">
                <div><span className="text-gray-500 text-xs">Name:</span> <span className="font-semibold">{data.patientName}</span></div>
                <div><span className="text-gray-500 text-xs">Date:</span> <span className="font-semibold">{data.date}</span></div>
                <div><span className="text-gray-500 text-xs">Age/Sex:</span> <span className="font-semibold">{data.age}{data.gender ? ` / ${data.gender}` : ""}</span></div>
            </div>

            {/* Vitals */}
            <div className="flex gap-4 bg-sky-50 rounded-lg px-4 py-2 text-xs text-gray-700 mb-5">
                <span><b>BP:</b> {data.vitalsBp}</span>
                <span><b>Pulse:</b> {data.vitalsPulse}</span>
                <span><b>Temp:</b> {data.vitalsTemp}</span>
                <span><b>Wt/Ht:</b> {data.vitalsWeight}</span>
            </div>

            {/* Body: symptoms + medications */}
            <div className="grid grid-cols-[200px_1fr] gap-6 mb-5">
                {/* Sidebar */}
                <div className="space-y-4 border-r border-gray-200 pr-4">
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Symptoms</h4>
                        <ul className="text-sm space-y-1 list-disc list-inside text-gray-700">
                            {data.symptoms.filter(s => s.trim()).map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Diagnosis</h4>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.diagnosis}</p>
                    </div>
                </div>

                {/* Medications */}
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Medications (Rx)</h4>
                    <div className="space-y-2">
                        {data.medications.filter(m => m.name.trim()).map((med, i) => (
                            <div key={i} className="text-sm">
                                <p className="font-semibold text-gray-800">{i + 1}. {med.name}</p>
                                <p className="text-xs text-gray-500 ml-4">
                                    {[med.dosage, med.frequency, med.duration].filter(Boolean).join(" · ")}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer: Advice + Signature */}
            <div className="flex justify-between items-end border-t border-gray-200 pt-4">
                <div className="max-w-[400px]">
                    {data.advice && (
                        <div className="mb-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Advice</h4>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.advice}</p>
                        </div>
                    )}
                    {data.nextVisit && (
                        <p className="text-sm font-semibold text-gray-700">Next Visit: {data.nextVisit}</p>
                    )}
                </div>
                <div className="text-center">
                    <div className="w-32 border-b border-gray-400 mb-1" />
                    <p className="text-xs font-semibold text-gray-600">Doctor&apos;s Signature</p>
                </div>
            </div>
        </div>
    );
}

/* ─── Report Form (doctor editable) ──────────────────────────────── */
function ReportForm({
    data,
    onChange,
}: {
    data: ReportData;
    onChange: (d: ReportData) => void;
}) {
    const inputClass =
        "w-full px-3 py-2 bg-white/[0.06] border border-white/[0.1] rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500/40 focus:ring-1 focus:ring-sky-500/20 transition-all";
    const labelClass = "text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1 block";

    const handleChange = (field: keyof ReportData, value: any) => {
        onChange({ ...data, [field]: value });
    };

    const updateSymptom = (index: number, value: string) => {
        const s = [...data.symptoms];
        s[index] = value;
        onChange({ ...data, symptoms: s });
    };

    const addSymptom = () => onChange({ ...data, symptoms: [...data.symptoms, ""] });

    const removeSymptom = (index: number) => {
        onChange({ ...data, symptoms: data.symptoms.filter((_, i) => i !== index) });
    };

    const updateMed = (index: number, field: keyof Medication, value: string) => {
        const m = [...data.medications];
        m[index] = { ...m[index], [field]: value };
        onChange({ ...data, medications: m });
    };

    const addMed = () =>
        onChange({
            ...data,
            medications: [...data.medications, { name: "", dosage: "", frequency: "", duration: "" }],
        });

    const removeMed = (index: number) => {
        onChange({ ...data, medications: data.medications.filter((_, i) => i !== index) });
    };

    return (
        <div className="space-y-5 overflow-y-auto max-h-[70vh] pr-2">
            {/* Patient Info */}
            <div>
                <h4 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> Patient Information
                </h4>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={labelClass}>Patient Name</label>
                        <input className={inputClass} placeholder="e.g. John Doe" value={data.patientName} onChange={(e) => handleChange("patientName", e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>Date</label>
                        <input className={inputClass} type="date" value={data.date} onChange={(e) => handleChange("date", e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>Age</label>
                        <input className={inputClass} placeholder="e.g. 35" value={data.age} onChange={(e) => handleChange("age", e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>Gender</label>
                        <select className={inputClass} value={data.gender} onChange={(e) => handleChange("gender", e.target.value)}>
                            <option value="">Select...</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Vitals */}
            <div>
                <h4 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Vitals
                </h4>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={labelClass}>Blood Pressure</label>
                        <input className={inputClass} placeholder="120/80 mmHg" value={data.vitalsBp} onChange={(e) => handleChange("vitalsBp", e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>Pulse</label>
                        <input className={inputClass} placeholder="72 bpm" value={data.vitalsPulse} onChange={(e) => handleChange("vitalsPulse", e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>Temperature</label>
                        <input className={inputClass} placeholder="98.6 °F" value={data.vitalsTemp} onChange={(e) => handleChange("vitalsTemp", e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>Weight / Height</label>
                        <input className={inputClass} placeholder="70 kg / 175 cm" value={data.vitalsWeight} onChange={(e) => handleChange("vitalsWeight", e.target.value)} />
                    </div>
                </div>
            </div>

            {/* Symptoms */}
            <div>
                <h4 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Symptoms & Diagnosis
                </h4>
                {data.symptoms.map((s, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                        <input className={`${inputClass} flex-1`} placeholder="e.g. Fever for 3 days" value={s} onChange={(e) => updateSymptom(i, e.target.value)} />
                        {data.symptoms.length > 1 && (
                            <button onClick={() => removeSymptom(i)} className="px-2 text-rose-400 hover:text-rose-300 transition-colors" title="Remove">
                                ✕
                            </button>
                        )}
                    </div>
                ))}
                <button onClick={addSymptom} className="text-xs text-sky-400 hover:text-sky-300 font-semibold mt-1 transition-colors">
                    + Add Symptom
                </button>

                <label className={`${labelClass} mt-4`}>Diagnosis</label>
                <textarea className={`${inputClass} resize-none`} rows={3} placeholder="Enter diagnosis..." value={data.diagnosis} onChange={(e) => handleChange("diagnosis", e.target.value)} />
            </div>

            {/* Medications */}
            <div>
                <h4 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400" /> Medications (Rx)
                </h4>
                {data.medications.map((med, i) => (
                    <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 mb-2 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className={labelClass}>Medicine Name</label>
                                <input className={inputClass} placeholder="e.g. Paracetamol 500mg" value={med.name} onChange={(e) => updateMed(i, "name", e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>Dosage</label>
                                <input className={inputClass} placeholder="e.g. 1 Tablet" value={med.dosage} onChange={(e) => updateMed(i, "dosage", e.target.value)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className={labelClass}>Frequency</label>
                                <select className={inputClass} value={med.frequency} onChange={(e) => updateMed(i, "frequency", e.target.value)}>
                                    <option value="">Select...</option>
                                    <option value="1-0-0 (Morning)">1-0-0 (Morning)</option>
                                    <option value="1-0-1 (Morning/Night)">1-0-1 (Morning/Night)</option>
                                    <option value="1-1-1 (Three times a day)">1-1-1 (Three times a day)</option>
                                    <option value="0-0-1 (Bedtime)">0-0-1 (Bedtime)</option>
                                    <option value="SOS (As needed)">SOS (As needed)</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Duration</label>
                                <input className={inputClass} placeholder="e.g. 5 days" value={med.duration} onChange={(e) => updateMed(i, "duration", e.target.value)} />
                            </div>
                        </div>
                        {data.medications.length > 1 && (
                            <button onClick={() => removeMed(i)} className="text-xs text-rose-400 hover:text-rose-300 font-semibold transition-colors">
                                Remove Medication
                            </button>
                        )}
                    </div>
                ))}
                <button onClick={addMed} className="text-xs text-sky-400 hover:text-sky-300 font-semibold mt-1 transition-colors">
                    + Add Medication
                </button>
            </div>

            {/* Advice */}
            <div>
                <h4 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400" /> Advice & Follow-up
                </h4>
                <textarea className={`${inputClass} resize-none`} rows={3} placeholder="General advice, diet instructions..." value={data.advice} onChange={(e) => handleChange("advice", e.target.value)} />
                <label className={`${labelClass} mt-3`}>Next Visit</label>
                <input className={inputClass} placeholder="e.g. After 1 Week" value={data.nextVisit} onChange={(e) => handleChange("nextVisit", e.target.value)} />
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

export default function DoctorReportPanel({
    requestId,
    doctorName,
    doctorDepartment,
    patientEmail,
    initialReport,
    isReadOnly = false,
}: Props) {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [data, setData] = useState<ReportData>(() => parseReport(initialReport));

    const hasReport = initialReport !== null;

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch("/api/doctor/report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    requestId,
                    patientName: data.patientName,
                    date: data.date,
                    age: data.age,
                    gender: data.gender,
                    vitalsBp: data.vitalsBp,
                    vitalsPulse: data.vitalsPulse,
                    vitalsTemp: data.vitalsTemp,
                    vitalsWeight: data.vitalsWeight,
                    symptoms: JSON.stringify(data.symptoms),
                    diagnosis: data.diagnosis,
                    medications: JSON.stringify(data.medications),
                    advice: data.advice,
                    nextVisit: data.nextVisit,
                }),
            });
            router.refresh();
            setShowModal(false);
        } finally {
            setSaving(false);
        }
    };

    const handlePrint = () => {
        const html = generatePrintHTML(data, doctorName, doctorDepartment);
        const win = window.open("", "_blank");
        if (!win) return;
        win.document.write(html);
        win.document.close();
        win.onload = () => { win.print(); };
    };

    return (
        <>
            {/* Thumbnail */}
            <div className="space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                    Medical Report
                </p>
                <button onClick={() => setShowModal(true)} className="w-full text-left transition-transform hover:scale-[1.02]">
                    <ReportThumbnail data={data} doctorName={doctorName} doctorDept={doctorDepartment} hasReport={hasReport} />
                </button>
                <p className="text-[10px] text-slate-600 text-center">
                    {hasReport ? "Click to view / edit" : "Click to create report"}
                </p>
            </div>

            {/* Full Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative z-10 w-full max-w-6xl bg-[#0d1117] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden">
                        {/* Modal Header */}
                        <div className="sticky top-0 z-20 bg-[#0d1117] border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-xl">📋</span>
                                <div>
                                    <h3 className="text-base font-extrabold tracking-tight text-slate-100">
                                        {isReadOnly ? "Medical Report" : "Edit Medical Report"}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">Patient: {patientEmail}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={handlePrint} className="px-4 py-2 rounded-xl bg-white/[0.04] text-slate-400 ring-1 ring-white/[0.08] hover:bg-white/[0.07] text-xs font-semibold transition-all flex items-center gap-1.5">
                                    🖨️ Print
                                </button>
                                {!isReadOnly && (
                                    <button onClick={handleSave} disabled={saving} className="px-5 py-2 rounded-xl bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/30 hover:bg-sky-500/20 text-xs font-bold transition-all disabled:opacity-50">
                                        {saving ? "Saving..." : "Save Report"}
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.05] text-slate-500 hover:text-slate-200 hover:bg-white/[0.1] transition-all text-xs"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Modal Body — two columns */}
                        <div className={`grid ${isReadOnly ? "grid-cols-1 max-w-3xl mx-auto" : "grid-cols-2"} gap-6 p-6`}>
                            {/* Form (left — doctor only) */}
                            {!isReadOnly && (
                                <div>
                                    <ReportForm data={data} onChange={setData} />
                                </div>
                            )}

                            {/* Preview (right) */}
                            <div>
                                <ReportPreview data={data} doctorName={doctorName} doctorDept={doctorDepartment} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
