"use client";
// src/components/cms/Sidebar.tsx

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import sidebarLogo from "../../../public/sidebar-logo.png";
import {
  LayoutDashboard,
  Monitor,
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
      { href: "/dashboard/hero", label: "Hero Section", icon: Monitor },
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
      className="fixed top-0 left-0 h-full w-64 flex flex-col z-50 bg-white/95 backdrop-blur-md border-r border-[#E5E7EB] select-none shadow-sm"
    >
      {/* Brand Header — Logo + Organization Name & Title */}
      <div className="px-5 h-[76px] border-b border-[#E5E7EB] flex items-center justify-between bg-white">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={sidebarLogo.src}
            alt="AIC Techno Logo"
            className="h-10 w-auto object-contain shrink-0 max-w-[90px] drop-shadow-xs"
          />
          <div className="min-w-0">
            <div className="text-[#0F172A] font-black text-xs tracking-tight uppercase leading-none truncate">
              AIC Techno
            </div>
            <div className="text-[#800020] font-bold text-[9px] tracking-widest uppercase mt-1 truncate">
              Enterprise CMS
            </div>
          </div>
        </div>

        <span
          className="w-2.5 h-2.5 rounded-full bg-[#800020] animate-pulse-glow shrink-0 ml-1 shadow-xs shadow-[#800020]"
          title="Live Synchronization Active"
        />
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3.5 py-6 space-y-7 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1.5">
            <div className="px-3 text-[10px] font-extrabold text-[#64748B] uppercase tracking-[2.5px] mb-2.5 flex items-center gap-2">
              <span>{group.title}</span>
              <div className="h-[1px] flex-1 bg-[#F1F5F9]" />
            </div>
            {group.items.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all duration-200 ${
                    active
                      ? "bg-gradient-to-r from-[#800020] via-[#70001B] to-[#540015] text-white font-bold shadow-md shadow-[#800020]/25 border border-[#800020]"
                      : "text-[#334155] font-semibold border border-transparent hover:border-[#FECDD3] hover:text-[#800020] hover:bg-gradient-to-r hover:from-[#FFF0F3] hover:via-[#FFE4E6] hover:to-[#FFF0F3] hover:shadow-xs"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 transition-colors ${
                      active ? "text-white" : "text-[#64748B] group-hover:text-[#800020]"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>

                  {item.badge && !active && (
                    <span className="ml-auto text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0] group-hover:border-[#FECDD3] group-hover:bg-white group-hover:text-[#800020] transition-colors">
                      {item.badge}
                    </span>
                  )}

                  {active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-3.5 border-t border-[#E5E7EB] bg-[#F8F9FA] space-y-1.5">
        <a
          href="https://aic-techno.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#334155] hover:text-[#800020] hover:bg-gradient-to-r hover:from-[#FFF0F3] hover:to-[#FFE4E6] transition-all border border-transparent hover:border-[#FECDD3]"
        >
          <ExternalLink className="w-4 h-4 text-[#64748B]" />
          <span>View Live Website</span>
        </a>

        <button
          id="logout-btn"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#334155] hover:text-red-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all text-left border border-transparent hover:border-red-200"
        >
          <LogOut className="w-4 h-4 text-[#64748B] group-hover:text-red-700" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
