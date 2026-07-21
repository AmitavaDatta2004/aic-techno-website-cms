"use client";
// src/app/login/page.tsx

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signIn } from "@/lib/auth";

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
      // Set lightweight session cookie for the proxy gate
      document.cookie = "cms_authed=1; path=/; SameSite=Strict";
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Sign in failed. Try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-cms-bg flex items-center justify-center p-4">
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
        aria-hidden="true"
      />

      {/* Glow orb */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(99,102,241,0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-sm animate-fade-in">
        {/* Card */}
        <div className="cms-card p-8 rounded-2xl shadow-2xl">

          {/* Logo & header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-cms-surface-2 border border-[var(--cms-border)] flex items-center justify-center mb-4 overflow-hidden">
              {/* Fallback text logo if image not available */}
              <span className="text-cms-accent font-black text-xl tracking-tight">
                AIC
              </span>
            </div>
            <h1 className="text-cms-text font-bold text-xl tracking-tight">
              AIC Techno CMS
            </h1>
            <p className="text-cms-muted text-sm mt-1">
              Admin access only
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-cms-text-2 mb-1.5 uppercase tracking-wider"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@aic-techno.com"
                className="cms-input"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-cms-text-2 mb-1.5 uppercase tracking-wider"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="cms-input"
              />
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3 animate-fade-in"
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg font-semibold text-sm text-white
                         transition-all duration-200 mt-2
                         disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: loading
                  ? "var(--cms-accent-hover)"
                  : "var(--cms-accent)",
              }}
              onMouseEnter={(e) => {
                if (!loading)
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "var(--cms-accent-hover)";
              }}
              onMouseLeave={(e) => {
                if (!loading)
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "var(--cms-accent)";
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Signing in…
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-cms-muted mt-6">
          AIC Techno Innovation and Incubation Council
          <br />
          Supported by Atal Innovation Mission, NITI Aayog
        </p>
      </div>
    </main>
  );
}
