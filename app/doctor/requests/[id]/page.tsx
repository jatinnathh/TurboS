import { prisma } from "@/lib/prisma";
import { getDoctorFromToken } from "@/lib/doctorAuth";
import { redirect } from "next/navigation";
import ActionButtons from "./ActionButton";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    PENDING:     "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30",
    APPROVED:    "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30",
    REJECTED:    "bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/30",
    IN_PROGRESS: "bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/30",
    COMPLETED:   "bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/30",
  };
  return map[status] ?? "bg-slate-500/10 text-slate-400 ring-1 ring-slate-500/30";
}

function StatusIcon({ status }: { status: string }) {
  if (status === "COMPLETED") {
    return (
      <div className="w-7 h-7 rounded-full bg-teal-500/20 ring-2 ring-teal-400 flex items-center justify-center shrink-0">
        <svg className="w-3.5 h-3.5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }
  if (status === "IN_PROGRESS") {
    return (
      <div className="w-7 h-7 rounded-full bg-sky-500/20 ring-2 ring-sky-400 flex items-center justify-center shrink-0">
        <div className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
      </div>
    );
  }
  return (
    <div className="w-7 h-7 rounded-full bg-white/5 ring-2 ring-white/20 flex items-center justify-center shrink-0" />
  );
}

const DEPT_COLORS: Record<string, string> = {
  EMERGENCY:   "bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/40",
  LABORATORY:  "bg-teal-500/20 text-teal-400 ring-1 ring-teal-500/40",
  RADIOLOGY:   "bg-violet-500/20 text-violet-400 ring-1 ring-violet-500/40",
  CARDIOLOGY:  "bg-sky-500/20 text-sky-400 ring-1 ring-sky-500/40",
  PHARMACY:    "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40",
  GENERAL:     "bg-slate-500/20 text-slate-400 ring-1 ring-slate-500/40",
};

function deptColor(dept: string) {
  return DEPT_COLORS[dept?.toUpperCase()] ?? "bg-slate-500/20 text-slate-400 ring-1 ring-slate-500/40";
}

export default async function RequestDetail({ params }: PageProps) {
  const doctor = await getDoctorFromToken();
  if (!doctor) redirect("/doctor/login");

  const { id } = await params;

  const request = await prisma.request.findUnique({
    where: { id },
    include: {
      user: true,
      logs: { orderBy: { createdAt: "asc" } },
      prescriptions: true,
    },
  });

  if (!request || request.doctorId !== doctor.id) {
    redirect("/doctor/dashboard");
  }

  const doctors = await prisma.doctor.findMany({
    select: { id: true, name: true, department: true },
  });

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-200 font-sans">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 border-b border-white/5 bg-[#080c14]/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5 text-slate-100 font-bold tracking-tight">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_theme(colors.emerald.400)] animate-pulse" />
          MediFlow
          <span className="ml-1.5 text-[11px] font-semibold uppercase tracking-widest text-emerald-400/70 bg-emerald-400/10 px-2 py-0.5 rounded-full ring-1 ring-emerald-400/20">
            Doctor
          </span>
        </div>
        <Link
          href="/doctor/dashboard"
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-5 md:px-8 py-10 space-y-8">

        {/* ── Header Card ── */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1">
                Request
              </p>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-100">
                {request.title}
              </h2>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {request.user.email}
              </p>
            </div>
            <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${statusBadge(request.status)}`}>
              {request.status.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* ── Currently Handling (only if active) ── */}
        {request.status !== "COMPLETED" && (
          <div className="bg-sky-500/5 border border-sky-500/20 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <h3 className="text-sm font-bold text-sky-400 uppercase tracking-widest">
                Currently Handling Case
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/[0.03] rounded-xl px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-1">Department</p>
                <p className="text-sm font-semibold text-slate-300">{request.department ?? "—"}</p>
              </div>
              <div className="bg-white/[0.03] rounded-xl px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-1">Doctor</p>
                <p className="text-sm font-semibold text-slate-300">{request.doctorName ?? "—"}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Timeline ── */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <svg className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <h3 className="text-sm font-bold tracking-tight text-slate-200">Activity Timeline</h3>
            <span className="ml-auto text-xs text-slate-600 bg-white/5 border border-white/[0.08] rounded-full px-2.5 py-0.5">
              {request.logs.length} events
            </span>
          </div>

          {request.logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-600">
              <span className="text-3xl">🕐</span>
              <p className="text-sm font-semibold text-slate-500">No activity yet</p>
            </div>
          ) : (
            <div className="space-y-0">
              {request.logs.map((log, index) => {
                const isLast = index === request.logs.length - 1;
                return (
                  <div key={log.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <StatusIcon status={log.status} />
                      {!isLast && <div className="w-px flex-1 bg-white/[0.08] mt-1 min-h-[2rem]" />}
                    </div>
                    <div className={`pb-6 flex-1 min-w-0 ${isLast ? "pb-2" : ""}`}>
                      <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded mb-1.5 ${deptColor(log.department)}`}>
                        {log.department}
                      </span>
                      <p className={`text-sm font-semibold leading-snug ${log.status === "PENDING" ? "text-slate-500 italic" : "text-slate-200"}`}>
                        {log.action}
                      </p>
                      {log.performedBy && (
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {log.performedBy}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Prescriptions ── */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-lg">💊</span>
            <h3 className="text-sm font-bold tracking-tight text-slate-200">Prescriptions</h3>
            <span className="ml-auto text-xs text-slate-600 bg-white/5 border border-white/[0.08] rounded-full px-2.5 py-0.5">
              {request.prescriptions.length} total
            </span>
          </div>

          {request.prescriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <span className="text-3xl">📋</span>
              <p className="text-sm font-semibold text-slate-500">No prescriptions added</p>
            </div>
          ) : (
            <div className="space-y-3">
              {request.prescriptions.map((pres) => (
                <div key={pres.id} className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <p className="text-sm font-bold text-slate-200">{pres.medication}</p>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 ring-1 ring-emerald-500/30 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {pres.dosage} · {pres.frequency}
                  </p>
                  {pres.notes && (
                    <p className="text-xs text-slate-600 mt-1.5 italic">
                      {pres.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Action Section ── */}
        {request.status !== "COMPLETED" ? (
          <ActionButtons requestId={request.id} doctors={doctors} />
        ) : (
          <div className="bg-violet-500/5 border border-violet-500/20 rounded-2xl p-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-violet-500/10 ring-2 ring-violet-400/30 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-extrabold tracking-tight text-violet-400">Case Closed</h3>
            <p className="text-sm text-slate-500">
              This patient has been discharged. No further actions allowed.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}