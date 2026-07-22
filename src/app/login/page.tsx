"use client";
// src/app/login/page.tsx

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth";
import { Lock, Mail, ShieldCheck, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      document.cookie = "cms_authed=1; path=/; SameSite=Strict";
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Sign in failed. Check credentials and try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background ambient gradient */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-sky-200/40 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-md animate-fade-in space-y-6">
        {/* Card Container */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xl space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 text-sky-600 font-black text-lg shadow-xs">
              AIC
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                AIC Techno CMS
              </h1>
              <p className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                <span>Authorized Administrative Portal</span>
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@aic-techno.com"
                  className="cms-input pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="cms-input pl-10"
                />
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-3 animate-fade-in"
              >
                {error}
              </div>
            )}

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full cms-btn-primary py-3 font-semibold text-sm shadow-md shadow-sky-600/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Authenticating…</span>
                </span>
              ) : (
                "Sign In to Dashboard"
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-500 space-y-1">
          <p className="font-medium text-slate-700">
            AIC Techno Innovation and Incubation Council
          </p>
          <p>Supported by Atal Innovation Mission, NITI Aayog</p>
        </div>
      </div>
    </main>
  );
}
