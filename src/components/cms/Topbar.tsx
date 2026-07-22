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
      className="flex items-center justify-between px-8 py-4 sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-300 shadow-xs"
    >
      {/* Left: Title & Breadcrumbs */}
      <div>
        <nav className="flex items-center gap-1.5 text-xs text-slate-700 font-bold mb-1">
          <span>Dashboard</span>
          {breadcrumb && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-black font-extrabold">{breadcrumb}</span>
            </>
          )}
        </nav>
        <h1 className="text-xl font-extrabold tracking-tight text-black flex items-center gap-2">
          {title}
        </h1>
      </div>

      {/* Right: Actions & User Info */}
      <div className="flex items-center gap-4">
        {actions}

        <div className="h-6 w-[1px] bg-slate-300 hidden sm:block" />

        {/* User Pill */}
        <div className="flex items-center gap-3 bg-slate-100 border border-slate-300 px-3.5 py-1.5 rounded-full shadow-xs">
          <div className="w-7 h-7 rounded-full bg-sky-700 flex items-center justify-center text-white font-black text-xs shadow-inner">
            {initials || "A"}
          </div>
          <div className="text-left hidden sm:block pr-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-black leading-tight">
                {displayName}
              </span>
              {isAdmin && (
                <span title="Admin User">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-700" />
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-800 font-medium block leading-tight truncate max-w-[150px]">
              {user?.email}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
