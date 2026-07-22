"use client";
// src/components/cms/Sidebar.tsx

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "◈" },
  { href: "/dashboard/hero", label: "Hero Section", icon: "🏠" },
  { href: "/dashboard/about", label: "About", icon: "ℹ️" },
  { href: "/dashboard/mentors", label: "Ecosystem Enablers", icon: "🧑‍🤝‍🧑" },
  { href: "/dashboard/social-mentors", label: "Social Mentors", icon: "👥" },
  { href: "/dashboard/careers", label: "Careers", icon: "💼" },
  { href: "/dashboard/partners", label: "Partners", icon: "🤝" },
  { href: "/dashboard/back2bengal", label: "Back2Bengal", icon: "🐅" },
  { href: "/dashboard/media", label: "Media Library", icon: "🖼️" },
  { href: "/dashboard/settings", label: "Site Settings", icon: "⚙️" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    // Clear session cookie
    document.cookie =
      "cms_authed=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
  }

  function isActive(href: string): boolean {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <aside
      id="cms-sidebar"
      className="fixed top-0 left-0 h-full w-60 flex flex-col z-50"
      style={{
        background: "var(--cms-surface)",
        borderRight: "1px solid var(--cms-border)",
      }}
    >
      {/* Logo */}
      <div
        className="px-5 py-5 flex items-center gap-3"
        style={{ borderBottom: "1px solid var(--cms-border)" }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-black text-xs"
          style={{ background: "var(--cms-accent)" }}
        >
          AIC
        </div>
        <div>
          <div className="text-cms-text font-bold text-sm leading-tight">
            AIC Techno
          </div>
          <div className="text-cms-muted text-xs leading-tight">CMS</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
              style={{
                background: active
                  ? "rgba(99,102,241,0.15)"
                  : "transparent",
                color: active
                  ? "var(--cms-accent)"
                  : "var(--cms-text-2)",
                border: active
                  ? "1px solid rgba(99,102,241,0.25)"
                  : "1px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLAnchorElement).style.background =
                    "rgba(255,255,255,0.04)";
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "var(--cms-text)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLAnchorElement).style.background =
                    "transparent";
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "var(--cms-text-2)";
                }
              }}
            >
              <span className="text-base w-5 text-center flex-shrink-0">
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
              {active && (
                <span
                  className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: "var(--cms-accent)" }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Divider + footer */}
      <div style={{ borderTop: "1px solid var(--cms-border)" }}>
        {/* Live site link */}
        <a
          href="https://aic-techno.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-6 py-3 text-xs transition-colors duration-150"
          style={{ color: "var(--cms-muted)" }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color =
              "var(--cms-text-2)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color =
              "var(--cms-muted)")
          }
        >
          <span>↗</span>
          <span>View Live Site</span>
        </a>

        {/* Logout */}
        <button
          id="logout-btn"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors duration-150"
          style={{ color: "var(--cms-muted)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color =
              "var(--cms-danger)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color =
              "var(--cms-muted)";
          }}
        >
          <span className="text-base">⎋</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
