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

function labStatusBadge(status: string) {
  const map: Record<string, string> = {
    PENDING:     "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30",
    IN_PROGRESS: "bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/30",
    COMPLETED:   "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30",
  };
  return map[status];
}

function priorityDot(status: string) {
  const map: Record<string, string> = {
    PENDING:     "bg-amber-400",
    IN_PROGRESS: "bg-sky-400",
    COMPLETED:   "bg-violet-400",
    APPROVED:    "bg-emerald-400",
    REJECTED:    "bg-rose-400",
  };
  return map[status] ?? "bg-slate-400";
}

export default async function DoctorDashboard() {
  const doctor = await getDoctorFromToken();
  if (!doctor) redirect("/doctor/login");

  const requests = await prisma.request.findMany({
    where: {
      OR: [
        { doctorId: doctor.id },
        { logs: { some: { performedBy: doctor.name } } },
      ],
    },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  const labTests = await prisma.labTest.findMany({
    where: { labDoctorId: doctor.id },
    include: { request: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
  });

  const activeCases     = requests.filter((r) => r.doctorId === doctor.id && r.status !== "COMPLETED");
  const completedCases  = requests.filter((r) => r.status === "COMPLETED");
  const pendingLabTests = labTests.filter((t) => t.status !== "COMPLETED");

  const stats = [
    { label: "Active Cases",       value: activeCases.length,     color: "text-emerald-400", sub: "Currently assigned" },
    { label: "Completed Cases",    value: completedCases.length,  color: "text-violet-400",  sub: "Successfully closed" },
    { label: "Lab Tests Assigned", value: labTests.length,        color: "text-sky-400",     sub: "Total assigned" },
    { label: "Pending Lab Tests",  value: pendingLabTests.length, color: "text-amber-400",   sub: "Awaiting results" },
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

        <form action="/api/doctor/logout" method="POST">
          <button className="flex items-center gap-1.5 text-sm text-rose-400 bg-rose-500/10 ring-1 ring-rose-500/30 hover:bg-rose-500/20 px-3 py-1.5 rounded-xl font-semibold transition-all">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </form>
      </nav>

      <div className="max-w-6xl mx-auto px-5 md:px-8 py-10 space-y-10">

        {/* ── Header ── */}
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tighter text-slate-100">
            Welcome, {doctor.name}
          </h1>
          <p className="mt-1 text-sm text-slate-500 font-light">
            Manage your patient cases and lab test assignments
          </p>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
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
              <p className="text-[11px] text-slate-600 mt-1.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Patient Cases ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Patient Cases
            </p>
            <span className="text-xs text-slate-500 bg-white/5 border border-white/[0.08] rounded-full px-3 py-0.5">
              {requests.length} total
            </span>
          </div>

          <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden">
            {requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <span className="text-4xl">🩺</span>
                <p className="text-sm font-bold text-slate-500">No patient cases yet</p>
                <p className="text-xs text-slate-600">Cases assigned to you will appear here</p>
              </div>
            ) : (
              <>
                <div className="hidden md:grid grid-cols-[1fr_8rem_9rem_2rem] gap-4 px-6 py-3 bg-white/[0.03] border-b border-white/[0.06]">
                  {["Patient / Request", "Type", "Status", ""].map((h, i) => (
                    <span key={i} className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                      {h}
                    </span>
                  ))}
                </div>

                {requests.map((req) => (
                  <Link
                    key={req.id}
                    href={`/doctor/requests/${req.id}`}
                    className="flex flex-wrap md:grid md:grid-cols-[1fr_8rem_9rem_2rem] gap-x-4 gap-y-2 items-center px-6 py-4 border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.04] transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1 md:flex-none">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${priorityDot(req.status)}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-200 truncate group-hover:text-white transition-colors">
                          {req.user.email}
                        </p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{req.title}</p>
                      </div>
                    </div>

                    <span className="hidden md:block text-xs text-slate-500 truncate">
                      {req.type.split("_").map((w: string) => w[0] + w.slice(1).toLowerCase()).join(" ")}
                    </span>

                    <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${statusBadge(req.status)}`}>
                      {req.status.replace("_", " ")}
                    </span>

                    <span className="hidden md:block text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all text-sm">
                      →
                    </span>
                  </Link>
                ))}
              </>
            )}
          </div>
        </div>

        {/* ── Assigned Lab Tests ── */}
        {labTests.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                Assigned Lab Tests
              </p>
              <span className="text-xs text-slate-500 bg-white/5 border border-white/[0.08] rounded-full px-3 py-0.5">
                {labTests.length} total
              </span>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden">
              <div className="hidden md:grid grid-cols-[1fr_8rem_9rem_2rem] gap-4 px-6 py-3 bg-white/[0.03] border-b border-white/[0.06]">
                {["Test / Patient", "Department", "Status", ""].map((h, i) => (
                  <span key={i} className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                    {h}
                  </span>
                ))}
              </div>

              {labTests.map((test) => (
                <Link
                  key={test.id}
                  href={`/doctor/lab/${test.id}`}
                  className="flex flex-wrap md:grid md:grid-cols-[1fr_8rem_9rem_2rem] gap-x-4 gap-y-2 items-center px-6 py-4 border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.04] transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 md:flex-none">
                    <span className="text-lg shrink-0">🧪</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-200 truncate group-hover:text-white transition-colors">
                        {test.testType}
                      </p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        Patient: {test.request.user.email}
                      </p>
                    </div>
                  </div>

                  <span className="hidden md:block text-xs text-slate-500 truncate">
                    {test.department}
                  </span>

                  <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${labStatusBadge(test.status)}`}>
                    {test.status.replace("_", " ")}
                  </span>

                  <span className="hidden md:block text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all text-sm">
                    →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}