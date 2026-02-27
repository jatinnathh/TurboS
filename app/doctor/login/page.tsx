"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DoctorLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const res = await fetch("/api/doctor/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push("/doctor/dashboard");
    } else {
      alert("Login failed");
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/40 focus:bg-white/[0.06] focus:ring-1 focus:ring-emerald-500/20 transition-all";

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-200 font-sans flex items-center justify-center px-4 relative overflow-hidden">

      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-sky-500/5 blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 text-slate-100 font-bold text-lg tracking-tight mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_theme(colors.emerald.400)] animate-pulse" />
            MediFlow
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400/70 bg-emerald-400/10 px-3 py-1 rounded-full ring-1 ring-emerald-400/20">
            Doctor Portal
          </span>
        </div>

        {/* Form card */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-8 space-y-5">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-100">
              Welcome back
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-light">
              Sign in to access your patient dashboard
            </p>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
              Email
            </label>
            <input
              placeholder="doctor@mediflow.com"
              type="email"
              className={inputClass}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
              Password
            </label>
            <input
              placeholder="••••••••"
              type="password"
              className={inputClass}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Login button */}
          <button
            onClick={handleLogin}
            className="w-full py-3 rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30 hover:bg-emerald-500/20 hover:ring-emerald-400/50 hover:-translate-y-0.5 text-sm font-bold tracking-tight transition-all duration-200 mt-2"
          >
            Sign In →
          </button>
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
          >
            ← Back to home
          </Link>
        </div>

      </div>
    </div>
  );
}