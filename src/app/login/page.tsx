"use client";
// src/app/login/page.tsx

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth";
import { Lock, Mail, ShieldCheck, Loader2, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Focus states for input animations
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
      className="min-h-screen flex select-none"
      style={{ background: "#FAFAFA" }}
    >
      {/* Left side — branding panel (Desktop) */}
      <div
        className="hidden lg:flex lg:w-[480px] xl:w-[540px] flex-col justify-between p-12 relative overflow-hidden"
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

        {/* Top Branding Section */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 inline-flex backdrop-blur-md">
            <Image
              src="/logo.jpeg"
              alt="AIC Logo"
              width={36}
              height={36}
              className="h-9 w-auto rounded-md object-contain bg-white p-1"
              priority
            />
            <div className="text-left">
              <div className="text-white font-bold text-xs leading-tight">AIC Techno</div>
              <div className="text-white/60 text-[10px] leading-tight">incubation console</div>
            </div>
          </div>
        </div>

        {/* Headline Section */}
        <div className="relative z-10 space-y-6">
          <h2 className="text-3xl xl:text-4xl font-extrabold text-white leading-snug tracking-tight">
            Empowering <br />
            Next-Gen Startups <br />
            <span className="text-white/60">From Bengal to the World.</span>
          </h2>
          <p className="text-white/65 text-xs leading-relaxed max-w-sm">
            Access the core management system to update ecosystem enablers, 
            coordinate incubator programs, review job openings, and administer portal controls.
          </p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4 max-w-xs pt-4">
            <div className="border-l-2 border-white/20 pl-3">
              <div className="text-xl font-black text-white">40+</div>
              <div className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Years legacy</div>
            </div>
            <div className="border-l-2 border-white/20 pl-3">
              <div className="text-xl font-black text-white">1st</div>
              <div className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Atal Incubation Center</div>
            </div>
          </div>
        </div>

        {/* Left Footer */}
        <div className="relative z-10 space-y-3">
          <div className="h-[1px] w-12 bg-white/20" />
          <div>
            <p className="text-white/40 text-[9px] font-bold tracking-widest uppercase">
              Atal Innovation Mission · NITI Aayog
            </p>
            <p className="text-white/25 text-[9px]">
              Govt. of India Initiative
            </p>
          </div>
        </div>
      </div>

      {/* Right side — login form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          
          {/* Header Area */}
          <div className="text-center space-y-4">
            <div className="inline-flex justify-center">
              <div className="bg-white border border-[#EEEEEE] rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                <Image
                  src="/logo.jpeg"
                  alt="AIC Techno Logo"
                  width={160}
                  height={56}
                  className="h-14 w-auto object-contain max-w-[200px]"
                  priority
                />
              </div>
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-black text-black tracking-tight">
                Sign in to Dashboard
              </h1>
              <p className="text-xs text-[#666666] font-medium flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#800020]" />
                <span>Authorized Administrative Portal</span>
              </p>
            </div>
          </div>

          {/* Form Card */}
          <div
            className="bg-white rounded-2xl p-8 shadow-xl shadow-black/[0.02] border border-[#EEEEEE] space-y-6"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Email Address */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className={`block text-[10px] font-extrabold tracking-[2px] transition-colors duration-150 ${
                    emailFocused ? "text-[#800020]" : "text-[#888888]"
                  }`}
                >
                  EMAIL ADDRESS
                </label>
                <div
                  className={`relative rounded-lg border transition-all duration-200 ${
                    emailFocused 
                      ? "border-[#800020] ring-4 ring-[#800020]/5 bg-white" 
                      : "border-[#D1D1D1] bg-[#FAFAFA] hover:border-[#B3B3B3]"
                  }`}
                >
                  <Mail
                    className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-150 ${
                      emailFocused ? "text-[#800020]" : "text-[#999999]"
                    }`}
                  />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    placeholder="admin@aic-techno.com"
                    className="w-full bg-transparent border-0 outline-none text-black font-semibold text-xs py-3.5 pr-4"
                    style={{ paddingLeft: "42px" }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className={`block text-[10px] font-extrabold tracking-[2px] transition-colors duration-150 ${
                    passwordFocused ? "text-[#800020]" : "text-[#888888]"
                  }`}
                >
                  PASSWORD
                </label>
                <div
                  className={`relative rounded-lg border transition-all duration-200 ${
                    passwordFocused 
                      ? "border-[#800020] ring-4 ring-[#800020]/5 bg-white" 
                      : "border-[#D1D1D1] bg-[#FAFAFA] hover:border-[#B3B3B3]"
                  }`}
                >
                  <Lock
                    className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-150 ${
                      passwordFocused ? "text-[#800020]" : "text-[#999999]"
                    }`}
                  />
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    placeholder="••••••••"
                    className="w-full bg-transparent border-0 outline-none text-black font-semibold text-xs py-3.5 pr-4"
                    style={{ paddingLeft: "42px" }}
                  />
                </div>
              </div>

              {/* Error messages */}
              {error && (
                <div
                  role="alert"
                  className="text-xs font-semibold text-[#991B1B] bg-[#FEE2E2] border border-[#FECACA] rounded-lg p-3.5 animate-fade-in"
                >
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-lg text-white font-bold text-xs tracking-wider uppercase transition-all duration-150 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #800020 0%, #660019 100%)",
                  boxShadow: "0 4px 14px rgba(128, 0, 32, 0.2)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 6px 18px rgba(128, 0, 32, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 14px rgba(128, 0, 32, 0.2)";
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>AUTHENTICATING...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Security Warning Box */}
            <div
              className="flex items-start gap-3 p-3.5 rounded-lg border border-[#F0F0F0]"
              style={{ background: "#FDFDFD" }}
            >
              <ShieldCheck className="w-4 h-4 text-[#800020] flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-[#666666] leading-relaxed">
                Security notice: Access is monitored. Unauthorized attempts will be logged 
                and may result in account lockout.
              </p>
            </div>
          </div>

          {/* Footer branding */}
          <div className="text-center space-y-1 text-[#888888]">
            <p className="text-[11px] font-bold text-black">
              AIC Techno Innovation and Incubation Council
            </p>
            <p className="text-[9px] leading-relaxed">
              Center for Innovation &amp; Entrepreneurship · A Techno India University Initiative
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
