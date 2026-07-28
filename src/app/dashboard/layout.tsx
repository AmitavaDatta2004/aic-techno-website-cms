"use client";
// src/app/dashboard/layout.tsx
// The CMS shell — sidebar + main content area.
// For the Visual Page Builder (/dashboard/pages/[id]), it renders full-screen without the outer sidebar.

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/cms/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      // Clear session cookie if Firebase says we're signed out
      document.cookie =
        "cms_authed=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      router.push("/login");
      return;
    }

    if (!isAdmin) {
      router.push("/login?error=access_denied");
    }
  }, [user, isAdmin, loading, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cms-bg">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "var(--cms-accent) transparent transparent transparent" }}
          />
          <p className="text-cms-muted text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  // Don't render children until auth is confirmed
  if (!user || !isAdmin) return null;

  // Check if we are inside the Visual Page Editor (/dashboard/pages/[id])
  const isPageEditor = pathname ? /^\/dashboard\/pages\/[^/]+$/.test(pathname) : false;

  if (isPageEditor) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-[#F8F9FA]">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--cms-bg)" }}>
      {/* Fixed sidebar */}
      <Sidebar />

      {/* Main content — offset by sidebar width (w-64 = 256px) */}
      <div className="flex-1 flex flex-col min-h-screen" style={{ marginLeft: "256px" }}>
        {/* Page content rendered here — each page provides its own Topbar */}
        {children}
      </div>
    </div>
  );
}
