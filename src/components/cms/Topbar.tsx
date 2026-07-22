"use client";
// src/components/cms/Topbar.tsx

import { useAuth } from "@/context/AuthContext";
import { ChevronRight, ShieldCheck } from "lucide-react";
import logoJpeg from "../../../public/logo.jpeg";

interface TopbarProps {
  title: string;
  breadcrumb?: string;
  actions?: React.ReactNode;
}

export function Topbar({ title, breadcrumb, actions }: TopbarProps) {
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
      className="flex items-center justify-between px-8 h-[76px] sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E5E7EB] shadow-xs transition-all"
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
        </h1>
      </div>

      {/* Right: Actions, Official logo.jpeg Website Header Logo, and User Info */}
      <div className="flex items-center gap-6">
        {actions}

        {/* Official logo.jpeg website header logo */}
        <div className="flex items-center px-3 py-1.5 rounded-xl bg-white border border-[#E5E7EB] shadow-xs">
          <img
            src={logoJpeg.src}
            alt="AIC Techno Logo"
            className="h-11 md:h-12 w-auto object-contain max-h-12 transition-transform hover:scale-105"
          />
        </div>

        <div className="h-7 w-[1px] bg-[#E5E7EB] hidden sm:block" />

        {/* User Pill */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-[#FFF0F3] to-[#FFF5F7] border border-[#FECDD3] px-4 py-2 rounded-full shadow-xs hover:shadow-md transition-shadow">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#800020] to-[#600018] flex items-center justify-center text-white font-black text-xs shadow-sm">
            {initials || "A"}
          </div>
          <div className="text-left hidden sm:block pr-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold text-[#0F172A] leading-tight">
                {displayName}
              </span>
              {isAdmin && (
                <span title="Admin User">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#800020]" />
                </span>
              )}
            </div>
            <span className="text-[10px] text-[#64748B] font-semibold block leading-tight truncate max-w-[150px]">
              {user?.email}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
