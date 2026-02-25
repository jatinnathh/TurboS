import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";

// ── helpers ────────────────────────────────────────────────────────────────

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

function priorityConfig(priority: string) {
  const map: Record<string, { dot: string; text: string }> = {
    LOW:      { dot: "bg-slate-400",  text: "text-slate-400" },
    MEDIUM:   { dot: "bg-amber-400",  text: "text-amber-400" },
    HIGH:     { dot: "bg-orange-400", text: "text-orange-400" },
    CRITICAL: { dot: "bg-rose-400",   text: "text-rose-400" },
  };
  return map[priority] ?? { dot: "bg-slate-400", text: "text-slate-400" };
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

function typeLabel(type: string) {
  return type.split("_").map((w) => w[0] + w.slice(1).toLowerCase()).join(" ");
}

const ACTIONS = [
  {
    href: "/dashboard/appointment",
    label: "Book Appointment",
    desc: "Schedule a doctor visit",
    icon: "🗓",
    ring: "ring-sky-500/30 hover:ring-sky-400/60",
    iconBg: "bg-sky-500/10",
    text: "text-sky-300",
  },
  {
    href: "/dashboard/lab-test",
    label: "Lab Test",
    desc: "Request diagnostic tests",
    icon: "🧪",
    ring: "ring-violet-500/30 hover:ring-violet-400/60",
    iconBg: "bg-violet-500/10",
    text: "text-violet-300",
  },
  {
    href: "/dashboard/emergency",
    label: "Emergency",
    desc: "Urgent medical request",
    icon: "🚨",
    ring: "ring-rose-500/30 hover:ring-rose-400/60",
    iconBg: "bg-rose-500/10",
    text: "text-rose-300",
  },
  {
    href: "/dashboard/prescription",
    label: "Prescription",
    desc: "Manage medications",
    icon: "💊",
    ring: "ring-emerald-500/30 hover:ring-emerald-400/60",
    iconBg: "bg-emerald-500/10",
    text: "text-emerald-300",
  },
  {
    href: "/dashboard/room-booking",
    label: "Room Booking",
    desc: "Reserve hospital rooms",
    icon: "🛏",
    ring: "ring-amber-500/30 hover:ring-amber-400/60",
    iconBg: "bg-amber-500/10",
    text: "text-amber-300",
  },
  {
    href: "/dashboard/report",
    label: "Download Report",
    desc: "Access medical reports",
    icon: "📄",
    ring: "ring-teal-500/30 hover:ring-teal-400/60",
    iconBg: "bg-teal-500/10",
    text: "text-teal-300",
  },
];

// ── page ───────────────────────────────────────────────────────────────────

export default async function Dashboard() {
  const user_clerk = await currentUser();
  if (!user_clerk) redirect("/sign-in");

  let user = await prisma.user.findUnique({ where: { clerkId: user_clerk.id } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId: user_clerk.id,
        email: user_clerk.emailAddresses[0].emailAddress,
        role: "USER",
      },
    });
  }

  if (user.role !== "USER") redirect("/");

  const requests = await prisma.request.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const stats = [
    { label: "Total",       value: requests.length,                                           color: "text-slate-100",  sub: "All time" },
    { label: "Pending",     value: requests.filter((r) => r.status === "PENDING").length,     color: "text-amber-400",  sub: "Awaiting review" },
    { label: "In Progress", value: requests.filter((r) => r.status === "IN_PROGRESS").length, color: "text-sky-400",    sub: "Being processed" },
    { label: "Completed",   value: requests.filter((r) => r.status === "COMPLETED").length,   color: "text-violet-400", sub: "Successfully done" },
  ];

  const displayName =
    user_clerk.firstName
      ? `${user_clerk.firstName}${user_clerk.lastName ? " " + user_clerk.lastName : ""}`
      : user_clerk.emailAddresses[0].emailAddress;

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-200 font-sans">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 border-b border-white/5 bg-[#080c14]/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5 text-slate-100 font-bold tracking-tight">
          <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_theme(colors.sky.400)] animate-pulse" />
          MediFlow
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-sm text-slate-400">{displayName}</span>
          <UserButton
            afterSignOutUrl="/sign-in"
            appearance={{
              elements: {
                avatarBox: "w-8 h-8 ring-2 ring-white/10 hover:ring-sky-400/50 transition-all rounded-full",
              },
            }}
          />
        </div>
      </nav>

      {/* ── Main Content ── */}
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-10 space-y-10">

        {/* Page Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tighter text-slate-100">
            Patient Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500 font-light">
            Track your requests and manage hospital interactions
          </p>
        </div>

        {/* ── Stats ── */}
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

        {/* ── Quick Actions ── */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-4">
            Quick Actions
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ACTIONS.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className={`group flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white/[0.03] ring-1 ${a.ring} hover:-translate-y-0.5 hover:bg-white/[0.05] transition-all duration-200`}
              >
                <span className={`text-xl leading-none shrink-0 w-10 h-10 rounded-xl ${a.iconBg} flex items-center justify-center`}>
                  {a.icon}
                </span>
                <div className="min-w-0">
                  <p className={`text-sm font-bold tracking-tight truncate ${a.text}`}>
                    {a.label}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{a.desc}</p>
                </div>
                <span className="ml-auto text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all shrink-0">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Requests Table ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              My Requests
            </p>
            <span className="text-xs text-slate-500 bg-white/5 border border-white/[0.08] rounded-full px-3 py-0.5">
              {requests.length} total
            </span>
          </div>

          <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden">
            {requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <span className="text-4xl">📋</span>
                <p className="text-sm font-bold text-slate-500 tracking-tight">No requests yet</p>
                <p className="text-xs text-slate-600">Use quick actions above to submit your first request</p>
              </div>
            ) : (
              <>
                {/* Table header — desktop only */}
                <div className="hidden md:grid grid-cols-[2.5rem_1fr_7rem_9rem_6.5rem_7rem_2rem] gap-4 px-6 py-3 bg-white/[0.03] border-b border-white/[0.06]">
                  {["", "Request", "Department", "Status", "Priority", "Date", ""].map((h, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-semibold uppercase tracking-widest text-slate-600"
                    >
                      {h}
                    </span>
                  ))}
                </div>

                {/* Rows — each row is a Link */}
                {requests.map((req) => {
                  const p = priorityConfig(req.priority);
                  return (
                    <Link
                      key={req.id}
                      href={`/dashboard/requests/${req.id}`}
                      className="flex flex-wrap md:grid md:grid-cols-[2.5rem_1fr_7rem_9rem_6.5rem_7rem_2rem] gap-x-4 gap-y-2 items-center px-6 py-4 border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.04] transition-colors cursor-pointer group"
                    >
                      <span className="text-2xl leading-none">{typeIcon(req.type)}</span>

                      <div className="min-w-0 flex-1 md:flex-none">
                        <p className="text-sm font-semibold text-slate-200 truncate group-hover:text-white transition-colors">
                          {req.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{typeLabel(req.type)}</p>
                      </div>

                      <span className="hidden md:block text-xs text-slate-500 truncate">
                        {req.department ?? "—"}
                      </span>

                      <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${statusBadge(req.status)}`}>
                        {req.status.replace("_", " ")}
                      </span>

                      <div className={`hidden md:flex items-center gap-1.5 text-xs font-medium ${p.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${p.dot}`} />
                        {req.priority}
                      </div>

                      <span className="hidden md:block text-xs text-slate-500">
                        {new Date(req.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>

                      {/* Arrow indicator */}
                      <span className="hidden md:block text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all text-sm">
                        →
                      </span>
                    </Link>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}