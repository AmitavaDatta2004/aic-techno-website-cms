"use client";
// src/components/cms/Topbar.tsx

import { useAuth } from "@/context/AuthContext";
import { ChevronRight, ShieldCheck } from "lucide-react";
import logoAicTechno from "../../../public/aic-techno-logo.png";
import logoAim from "../../../public/aim-logo.png";
import logoNitiAayog from "../../../public/niti-aayog-logo.png";
import logoTechnoIndia from "../../../public/techno-india-university-logo.png";

interface TopbarProps {
  title: string;
  breadcrumb?: string;
  actions?: React.ReactNode;
  hasUnsavedChanges?: boolean;
}

export function Topbar({ title, breadcrumb, actions, hasUnsavedChanges }: TopbarProps) {
  const { user, isAdmin } = useAuth();

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Admin";
  const initials = displayName
    .split(/[\s@._-]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p: string) => p[0].toUpperCase())
    .join("");

  return (
    <header
      id="cms-topbar"
      className="flex items-center justify-between px-6 h-[76px] sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] shadow-xs transition-all"
    >
      {/* Left: Title & Breadcrumbs */}
      <div>
        <nav className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#64748B] mb-0.5">
          <span>Dashboard</span>
          {breadcrumb && (
            <>
              <ChevronRight className="w-3 h-3 text-[#CBD5E1]" />
              <span className="text-[#800020]">{breadcrumb}</span>
            </>
          )}
        </nav>
        <h1 className="text-xl font-black tracking-tight text-[#0F172A] flex items-center gap-2">
          {title}
          {hasUnsavedChanges && (
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1.5 shadow-xs animate-pulse" title="You have unsaved changes! Click Save Changes to save your work.">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              Unsaved Changes
            </span>
          )}
        </h1>
      </div>

      {/* Right: Actions, 4 Header Logos in Order, and User Info */}
      <div className="flex items-center gap-4">
        {actions}

        {/* 4 Header Logos in Order: 1. AIC Techno, 2. AIM, 3. NITI Aayog, 4. Techno India University */}
        <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-white border border-[#E5E7EB] shadow-xs">
          {/* 1. AIC Techno Logo */}
          <img
            src={logoAicTechno.src}
            alt="AIC Techno Logo"
            className="h-9 w-auto object-contain transition-transform hover:scale-105"
            title="AIC Techno"
          />
          <div className="h-6 w-[1px] bg-[#E5E7EB]" />

          {/* 2. Atal Innovation Mission */}
          <img
            src={logoAim.src}
            alt="Atal Innovation Mission"
            className="h-8 w-auto object-contain transition-transform hover:scale-105"
            title="Atal Innovation Mission"
          />
          <div className="h-6 w-[1px] bg-[#E5E7EB]" />

          {/* 3. NITI Aayog */}
          <img
            src={logoNitiAayog.src}
            alt="NITI Aayog"
            className="h-8 w-auto object-contain transition-transform hover:scale-105"
            title="NITI Aayog"
          />
          <div className="h-6 w-[1px] bg-[#E5E7EB]" />

          {/* 4. Techno India University */}
          <img
            src={logoTechnoIndia.src}
            alt="An Initiative of Techno India University West Bengal"
            className="h-8 w-auto object-contain transition-transform hover:scale-105"
            title="Techno India University"
          />
        </div>

        <div className="h-7 w-[1px] bg-[#E5E7EB] hidden sm:block" />

        {/* User Pill */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-[#FFF0F3] to-[#FFF5F7] border border-[#FECDD3] px-3.5 py-1.5 rounded-full shadow-xs hover:shadow-md transition-shadow">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#800020] to-[#600018] flex items-center justify-center text-white font-black text-xs shadow-sm shrink-0">
            {initials || "A"}
          </div>
          <div className="text-left hidden sm:block pr-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold text-[#0F172A] leading-tight truncate">
                {displayName}
              </span>
              {isAdmin && (
                <span title="Admin User" className="shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#800020]" />
                </span>
              )}
            </div>
            <span className="text-[10px] text-[#64748B] font-semibold block leading-tight truncate max-w-[130px]">
              {user?.email}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
