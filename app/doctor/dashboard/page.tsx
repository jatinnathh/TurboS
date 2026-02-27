import { getDoctorFromToken } from "@/lib/doctorAuth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

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

function typeIcon(type: string) {
  const map: Record<string, string> = {
    APPOINTMENT:     "🗓",
    LAB_TEST:        "🧪",
    EMERGENCY:       "🚨",
    PRESCRIPTION:    "💊",
    ROOM_BOOKING:    "🛏",
    REPORT_DOWNLOAD: "📄",
  };
  return map[type] ?? "📋";
}

function priorityConfig(priority: string) {
  const map: Record<string, { dot: string; text: string }> = {
    LOW:      { dot: "bg-slate-400",  text: "text-slate-400" },
    MEDIUM:   { dot: "bg-amber-400",  text: "text-amber-400" },
    HIGH:     { dot: "bg-orange-400", text: "text-orange-400" },
    CRITICAL: { dot: "bg-rose-400",   text: "text-rose-400" },
  };
  return map[priority] ?? { dot: "bg-slate-400", text: "text-slate-400" };
}

export default async function DoctorDashboard() {
  const doctor = await getDoctorFromToken();
  if (!doctor) redirect("/doctor/login");

  const requests = await prisma.request.findMany({
    where: { doctorId: doctor.id },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  const stats = [
    { label: "Total Patients", value: requests.length,                                           color: "text-slate-100",  sub: "Assigned to you" },
    { label: "Pending",        value: requests.filter((r) => r.status === "PENDING").length,     color: "text-amber-400",  sub: "Awaiting action" },
    { label: "In Progress",    value: requests.filter((r) => r.status === "IN_PROGRESS").length, color: "text-sky-400",    sub: "Active cases" },
    { label: "Completed",      value: requests.filter((r) => r.status === "COMPLETED").length,   color: "text-violet-400", sub: "Resolved" },
  ];

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

        <div className="flex items-center gap-4">
          {/* Doctor Info */}
          <div className="flex items-center gap-2.5 text-sm text-slate-400">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {doctor.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-slate-200 font-semibold text-sm leading-tight">
                {doctor.name}
              </span>
              <span className="text-slate-500 text-xs leading-tight">
                {doctor.specialization ?? "Specialist"}
              </span>
            </div>
          </div>

          {/* Logout */}
          <form action="/api/doctor/logout" method="POST">
            <button
              type="submit"
              className="bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/30 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
            >
              Logout
            </button>
          </form>
        </div>
      </nav>

      {/* ── Main ── */}
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-10 space-y-10">

        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tighter text-slate-100">
            Welcome, {doctor.name}
          </h1>
          <p className="mt-1 text-sm text-slate-500 font-light">
            Manage your patients, review requests and update treatment progress
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white/[0.03] border border-white/[0.07] rounded-2xl px-5 py-4 hover:border-white/[0.12] transition-colors"
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">
                {s.label}
              </p>
              <p className={`text-4xl font-extrabold tracking-tighter leading-none ${s.color}`}>
                {s.value}
              </p>
              <p className="text-[11px] text-slate-500 mt-1.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Patient Requests */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Patient Requests
            </p>
            <span className="text-xs text-slate-500 bg-white/5 border border-white/[0.08] rounded-full px-3 py-0.5">
              {requests.length} total
            </span>
          </div>

          <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden">
            {requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <span className="text-4xl">🩺</span>
                <p className="text-sm font-bold text-slate-500 tracking-tight">No patients assigned yet</p>
                <p className="text-xs text-slate-600">Patient requests assigned to you will appear here</p>
              </div>
            ) : (
              requests.map((req) => {
                const p = priorityConfig(req.priority);
                return (
                  <Link
                    key={req.id}
                    href={`/doctor/requests/${req.id}`}
                    className="flex items-center gap-4 px-6 py-4 border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.04] transition-colors"
                  >
                    <span className="text-2xl">{typeIcon(req.type)}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-200">
                        {req.user.email}
                      </p>
                      <p className="text-xs text-slate-500">{req.title}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusBadge(req.status)}`}>
                      {req.status}
                    </span>
                    <div className={`hidden md:flex items-center gap-1.5 text-xs font-medium ${p.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
                      {req.priority}
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}