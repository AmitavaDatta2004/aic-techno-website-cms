"use client";
// src/app/login/page.tsx

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth";
import { Lock, Mail, ShieldCheck, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import logoAicTechno from "../../../public/aic-techno-logo.png";
import logoAim from "../../../public/aim-logo.png";
import logoNitiAayog from "../../../public/niti-aayog-logo.png";
import logoTechnoIndia from "../../../public/techno-india-university-logo.png";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

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
    <main
      className="h-screen w-screen max-h-screen overflow-hidden flex select-none"
      style={{ background: "#F8F9FA" }}
    >
      {/* Left side — branding panel & 4 Large Partner Logos (50% Width Desktop) */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-8 xl:p-10 relative overflow-hidden shrink-0 h-full"
        style={{
          background: "linear-gradient(150deg, #800020 0%, #4A0012 100%)",
        }}
      >
        {/* Dynamic backdrop grid */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* Decorative ambient glows */}
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-[80px]"
          style={{ background: "radial-gradient(circle, #FFFFFF 0%, transparent 80%)" }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-10 blur-[60px]"
          style={{ background: "radial-gradient(circle, #800020 0%, transparent 80%)" }}
        />

        {/* Top Branding Section — 4 White Logo Cards directly on Maroon background ("Official Ecosystem Partners" label removed) */}
        <div className="relative z-10">
          <div className="grid grid-cols-2 gap-3 items-center">
            {/* 1. AIC Techno Logo */}
            <div className="flex items-center justify-center p-1.5 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow h-22 sm:h-26">
              <img
                src={logoAicTechno.src}
                alt="AIC Techno Logo"
                className="h-full w-full object-contain p-1"
                title="AIC Techno"
              />
            </div>

            {/* 2. AIM */}
            <div className="flex items-center justify-center p-1.5 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow h-22 sm:h-26">
              <img
                src={logoAim.src}
                alt="Atal Innovation Mission"
                className="h-full w-full object-contain p-1"
                title="Atal Innovation Mission"
              />
            </div>

            {/* 3. NITI Aayog */}
            <div className="flex items-center justify-center p-1.5 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow h-22 sm:h-26">
              <img
                src={logoNitiAayog.src}
                alt="NITI Aayog"
                className="h-full w-full object-contain p-1"
                title="NITI Aayog"
              />
            </div>

            {/* 4. Techno India University */}
            <div className="flex items-center justify-center p-1.5 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow h-22 sm:h-26">
              <img
                src={logoTechnoIndia.src}
                alt="Techno India University"
                className="h-full w-full object-contain p-1"
                title="Techno India University"
              />
            </div>
          </div>
        </div>

        {/* Headline Section — Shifted upward */}
        <div className="relative z-10 space-y-3 my-auto py-2">
          <h2 className="text-2xl xl:text-3xl font-extrabold text-white leading-snug tracking-tight">
            Empowering Next-Gen Startups <br />
            <span className="text-white/60">From Bengal to the World.</span>
          </h2>
          <p className="text-white/75 text-xs leading-relaxed max-w-sm font-medium">
            Access the core management system to update ecosystem enablers, 
            coordinate incubator programs, review job openings, and administer portal controls.
          </p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4 max-w-xs pt-1">
            <div className="border-l-2 border-white/30 pl-3">
              <div className="text-xl xl:text-2xl font-black text-white">40+</div>
              <div className="text-[9px] xl:text-[10px] text-white/60 uppercase tracking-wider font-bold">Years legacy</div>
            </div>
            <div className="border-l-2 border-white/30 pl-3">
              <div className="text-xl xl:text-2xl font-black text-white">1st</div>
              <div className="text-[9px] xl:text-[10px] text-white/60 uppercase tracking-wider font-bold">Atal Incubation Center</div>
            </div>
          </div>
        </div>

        {/* Bottom Attribution — Perfectly visible above bottom edge */}
        <div className="relative z-10 text-[10px] xl:text-[11px] text-white/70 leading-relaxed max-w-md font-medium border-t border-white/10 pt-3">
          AIC Techno Innovation and Incubation Council — Center for Innovation &amp; Entrepreneurship — is a Techno India University initiative, supported by Atal Innovation Mission, NITI Aayog, Government of India.
        </div>
      </div>

      {/* Right side — login form area (No scrollbars, 100vh fit) */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 h-full overflow-y-auto">
        <div className="w-full max-w-md space-y-6 animate-fade-in my-auto">
          
          {/* Right side Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF0F3] border border-[#FECDD3] text-[#800020] text-xs font-extrabold tracking-wide uppercase">
              <ShieldCheck className="w-4 h-4 text-[#800020]" />
              <span>Incubation &amp; Ecosystem Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
              AIC Techno CMS Platform
            </h1>
            <p className="text-xs text-[#64748B] font-medium">
              Sign in to your administrative dashboard to manage site content
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-900/[0.04] border border-[#E5E7EB] space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email Address */}
              <div className="space-y-1">
                <label
                  htmlFor="email"
                  className={`block text-[10px] font-black tracking-[2px] transition-colors duration-150 ${
                    emailFocused ? "text-[#800020]" : "text-[#64748B]"
                  }`}
                >
                  EMAIL ADDRESS
                </label>
                <div
                  className={`relative rounded-xl border transition-all duration-200 ${
                    emailFocused 
                      ? "border-[#800020] ring-4 ring-[#800020]/10 bg-white shadow-xs" 
                      : "border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#94A3B8]"
                  }`}
                >
                  <Mail
                    className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-150 ${
                      emailFocused ? "text-[#800020]" : "text-[#94A3B8]"
                    }`}
                  />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="mypin2026@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-transparent text-xs font-semibold text-[#0F172A] placeholder-[#94A3B8] outline-none"
                  />
                </div>
              </div>

              {/* Password with Eye Toggle Button */}
              <div className="space-y-1">
                <label
                  htmlFor="password"
                  className={`block text-[10px] font-black tracking-[2px] transition-colors duration-150 ${
                    passwordFocused ? "text-[#800020]" : "text-[#64748B]"
                  }`}
                >
                  PASSWORD
                </label>
                <div
                  className={`relative rounded-xl border transition-all duration-200 ${
                    passwordFocused 
                      ? "border-[#800020] ring-4 ring-[#800020]/10 bg-white shadow-xs" 
                      : "border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#94A3B8]"
                  }`}
                >
                  <Lock
                    className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-150 ${
                      passwordFocused ? "text-[#800020]" : "text-[#94A3B8]"
                    }`}
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-2.5 bg-transparent text-xs font-semibold text-[#0F172A] placeholder-[#94A3B8] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#94A3B8] hover:text-[#800020] transition-colors rounded-lg focus:outline-none"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message Alert */}
              {error && (
                <div
                  role="alert"
                  className="text-xs font-semibold text-[#991B1B] bg-[#FEE2E2] border border-[#FECACA] rounded-xl p-3 flex items-start gap-2 animate-fade-in"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#991B1B] shrink-0 mt-1.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl text-white font-black text-xs tracking-wider uppercase transition-all duration-200 shadow-md shadow-[#800020]/25 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
                style={{
                  background: "linear-gradient(135deg, #800020 0%, #5B0017 100%)",
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Authenticating…</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4 text-white/90 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#800020] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#64748B] leading-relaxed">
                Security notice: Access is monitored. Unauthorized attempts will be logged and may result in account lockout.
              </p>
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-center text-[10px] text-[#94A3B8] leading-relaxed max-w-sm mx-auto">
            AIC Techno Innovation and Incubation Council — Center for Innovation &amp; Entrepreneurship — is a Techno India University initiative, supported by Atal Innovation Mission, NITI Aayog, Government of India.
          </div>
        </div>
      </div>
    </main>
  );
}
