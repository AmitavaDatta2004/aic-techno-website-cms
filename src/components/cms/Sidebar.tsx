"use client";
// src/components/cms/Sidebar.tsx

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import {
  LayoutDashboard,
  Sparkles,
  Info,
  Users,
  HeartHandshake,
  Briefcase,
  Building2,
  Compass,
  Image as ImageIcon,
  Sliders,
  ShieldCheck,
  LogOut,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";

interface NavGroup {
  title: string;
  items: {
    href: string;
    label: string;
    icon: LucideIcon;
    badge?: string;
  }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "OVERVIEW",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "DYNAMIC CONTENT",
    items: [
      { href: "/dashboard/mentors", label: "Ecosystem Enablers", icon: Users, badge: "Dynamic" },
      { href: "/dashboard/social-mentors", label: "Social Mentors", icon: HeartHandshake, badge: "Dynamic" },
      { href: "/dashboard/careers", label: "Careers", icon: Briefcase, badge: "Dynamic" },
      { href: "/dashboard/partners", label: "Partners", icon: Building2, badge: "Dynamic" },
      { href: "/dashboard/media", label: "Media Library", icon: ImageIcon, badge: "Storage" },
    ],
  },
  {
    title: "STATIC SECTIONS",
    items: [
      { href: "/dashboard/hero", label: "Hero Section", icon: Sparkles },
      { href: "/dashboard/about", label: "About Section", icon: Info },
      { href: "/dashboard/back2bengal", label: "Back2Bengal", icon: Compass },
    ],
  },
  {
    title: "SYSTEM & CONTROL",
    items: [
      { href: "/dashboard/settings", label: "Site Settings", icon: Sliders },
      { href: "/dashboard/admins", label: "Admin Access", icon: ShieldCheck },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    document.cookie = "cms_authed=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
  }

  function isActive(href: string): boolean {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <aside
      id="cms-sidebar"
      className="fixed top-0 left-0 h-full w-64 flex flex-col z-50 bg-white border-r border-slate-300 shadow-xs select-none"
    >
      {/* Brand Header */}
      <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-sky-600/20">
            AIC
          </div>
          <div>
            <div className="text-black font-extrabold text-sm tracking-tight leading-none">
              AIC Techno
            </div>
            <div className="text-sky-700 font-bold text-[10px] tracking-wider uppercase mt-1">
              Enterprise CMS
            </div>
          </div>
        </div>

        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-emerald-100" title="System Online" />
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1">
            <div className="px-3 text-[10px] font-black text-slate-800 uppercase tracking-widest mb-2">
              {group.title}
            </div>
            {group.items.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-all duration-150 ${
                    active
                      ? "bg-sky-50 text-sky-800 font-bold shadow-xs border border-sky-300"
                      : "text-slate-900 font-semibold hover:text-black hover:bg-slate-100 border border-transparent"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 transition-colors ${
                      active ? "text-sky-700" : "text-slate-700 group-hover:text-black"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>

                  {item.badge && !active && (
                    <span className="ml-auto text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 border border-slate-300">
                      {item.badge}
                    </span>
                  )}

                  {active && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-sky-600" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-3 border-t border-slate-200 bg-slate-100/80 space-y-1">
        <a
          href="https://aic-techno.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold text-slate-800 hover:text-black hover:bg-slate-200 transition-colors"
        >
          <ExternalLink className="w-4 h-4 text-slate-700" />
          <span>View Live Website</span>
        </a>

        <button
          id="logout-btn"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold text-slate-800 hover:text-rose-700 hover:bg-rose-100 transition-colors text-left"
        >
          <LogOut className="w-4 h-4 text-slate-700 group-hover:text-rose-700" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
