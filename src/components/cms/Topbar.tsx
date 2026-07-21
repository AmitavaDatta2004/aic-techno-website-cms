"use client";
// src/components/cms/Topbar.tsx

import { useAuth } from "@/context/AuthContext";

interface TopbarProps {
  title: string;
  breadcrumb?: string;
}

export function Topbar({ title, breadcrumb }: TopbarProps) {
  const { user } = useAuth();

  // Build user initials from email or display name
  const displayName = user?.displayName ?? user?.email ?? "Admin";
  const initials = displayName
    .split(/[\s@.]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p: string) => p[0].toUpperCase())
    .join("");

  return (
    <header
      id="cms-topbar"
      className="flex items-center justify-between px-8 py-4 sticky top-0 z-40"
      style={{
        background: "rgba(9,9,15,0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--cms-border)",
      }}
    >
      {/* Left: breadcrumb + title */}
      <div>
        {breadcrumb && (
          <p className="text-xs mb-0.5" style={{ color: "var(--cms-muted)" }}>
            Dashboard{" "}
            <span style={{ color: "var(--cms-border)" }}>›</span>{" "}
            {breadcrumb}
          </p>
        )}
        <h1
          className="text-base font-bold tracking-tight"
          style={{ color: "var(--cms-text)" }}
        >
          {title}
        </h1>
      </div>

      {/* Right: user avatar */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p
            className="text-xs font-medium leading-tight"
            style={{ color: "var(--cms-text-2)" }}
          >
            {user?.displayName ?? "Admin"}
          </p>
          <p
            className="text-xs leading-tight truncate max-w-[160px]"
            style={{ color: "var(--cms-muted)" }}
          >
            {user?.email}
          </p>
        </div>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
          style={{ background: "var(--cms-accent)" }}
          title={displayName}
        >
          {initials || "A"}
        </div>
      </div>
    </header>
  );
}
