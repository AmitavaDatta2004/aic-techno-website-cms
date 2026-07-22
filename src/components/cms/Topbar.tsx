"use client";
// src/components/cms/Topbar.tsx

import { useAuth } from "@/context/AuthContext";
import { ChevronRight, ShieldCheck } from "lucide-react";

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
      className="flex items-center justify-between px-8 h-[76px] sticky top-0 z-40 bg-white border-b border-[#EEEEEE] shadow-xs"
    >
      {/* Left: Title & Breadcrumbs */}
      <div>
        <nav className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#888888] mb-0.5">
          <span>Dashboard</span>
          {breadcrumb && (
            <>
              <ChevronRight className="w-3 h-3 text-[#CCCCCC]" />
              <span className="text-[#800020]">{breadcrumb}</span>
            </>
          )}
        </nav>
        <h1 className="text-xl font-black tracking-tight text-black flex items-center gap-2">
          {title}
        </h1>
      </div>

      {/* Right: Actions, Official logo.jpeg Website Header Logo, and User Info */}
      <div className="flex items-center gap-6">
        {actions}

        {/* Official logo.jpeg website header logo placed to the left of user pill */}
        <div className="flex items-center px-2 py-1">
          <img
            src="/logo.jpeg"
            alt="AIC Techno Logo"
            className="h-12 md:h-14 w-auto object-contain max-h-14 transition-transform hover:scale-105"
          />
        </div>

        <div className="h-7 w-[1px] bg-[#EEEEEE] hidden sm:block" />

        {/* User Pill */}
        <div className="flex items-center gap-3 bg-[#FFF0F2] border border-[#FECDD3] px-3.5 py-1.5 rounded-full shadow-xs">
          <div className="w-8 h-8 rounded-full bg-[#800020] flex items-center justify-center text-white font-black text-xs shadow-sm">
            {initials || "A"}
          </div>
          <div className="text-left hidden sm:block pr-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold text-black leading-tight">
                {displayName}
              </span>
              {isAdmin && (
                <span title="Admin User">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#800020]" />
                </span>
              )}
            </div>
            <span className="text-[10px] text-[#555555] font-semibold block leading-tight truncate max-w-[150px]">
              {user?.email}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
