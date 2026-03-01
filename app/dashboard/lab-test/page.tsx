import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

function statusColor(status: string) {
  const map: Record<string, string> = {
    PENDING:     "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30",
    IN_PROGRESS: "bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/30",
    COMPLETED:   "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30",
  };
  return map[status] ?? "bg-slate-500/10 text-slate-400 ring-1 ring-slate-500/30";
}

function StatusIcon({ status }: { status: string }) {
  if (status === "COMPLETED") {
    return (
      <div className="w-8 h-8 rounded-full bg-emerald-500/20 ring-2 ring-emerald-400 flex items-center justify-center shrink-0">
        <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }
  if (status === "IN_PROGRESS") {
    return (
      <div className="w-8 h-8 rounded-full bg-sky-500/20 ring-2 ring-sky-400 flex items-center justify-center shrink-0">
        <div className="w-3 h-3 rounded-full bg-sky-400 animate-pulse" />
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-white/5 ring-2 ring-white/20 flex items-center justify-center shrink-0">
      <div className="w-2 h-2 rounded-full bg-slate-600" />
    </div>
  );
}

export default async function PatientLabTests() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });

  if (!user) redirect("/dashboard");

  const labTests = await prisma.labTest.findMany({
    where: { request: { userId: user.id } },
    include: { request: true, labDoctor: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-200 font-sans">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 border-b border-white/5 bg-[#080c14]/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5 text-slate-100 font-bold tracking-tight">
          <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_theme(colors.sky.400)] animate-pulse" />
          MediFlow
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </Link>
          <UserButton afterSignOutUrl="/sign-in" appearance={{ elements: { avatarBox: "w-8 h-8 ring-2 ring-white/10 hover:ring-sky-400/50 transition-all rounded-full" } }} />
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-5 md:px-8 py-10 space-y-8">

        {/* ── Header ── */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">🧪</span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tighter text-slate-100">
              My Lab Tests
            </h1>
          </div>
          <p className="text-sm text-slate-500 font-light">
            Track diagnostic tests ordered by your doctor
          </p>
        </div>

        {/* ── Content ── */}
        {labTests.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl flex flex-col items-center justify-center py-20 gap-3">
            <span className="text-4xl">🔬</span>
            <p className="text-sm font-bold text-slate-500">No lab tests ordered by doctor.</p>
            <p className="text-xs text-slate-600">Lab tests ordered by your doctor will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary pill */}
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                All Tests
              </p>
              <span className="text-xs text-slate-500 bg-white/5 border border-white/[0.08] rounded-full px-3 py-0.5">
                {labTests.length} total
              </span>
            </div>

            {labTests.map((test) => (
              <div
                key={test.id}
                className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 space-y-4 hover:border-white/[0.12] transition-colors"
              >
                {/* Test header */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <StatusIcon status={test.status} />
                    <div>
                      <p className="text-sm font-bold text-slate-100">
                        {test.testType}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {test.department}
                      </p>
                      {test.labDoctor && (
                        <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Processed by: {test.labDoctor.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${statusColor(test.status)}`}>
                    {test.status.replace("_", " ")}
                  </span>
                </div>

                {/* ✅ Only show result if completed */}
                {test.status === "COMPLETED" && test.result && (
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400 mb-2">
                      Result
                    </p>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {test.result}
                    </p>
                  </div>
                )}

                {test.status !== "COMPLETED" && (
                  <div className="flex items-center gap-2 text-xs text-slate-600 bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-2.5">
                    <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Result will appear once lab publishes it.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}