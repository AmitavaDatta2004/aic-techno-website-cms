"use client";
// src/app/dashboard/page.tsx

import { useEffect, useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/cms/Topbar";
import { getMentors } from "@/lib/firestore";
import { getSocialMentors } from "@/lib/firestore";
import { getCareers } from "@/lib/firestore";
import { getPartners, getFeaturedPartners } from "@/lib/firestore";
import { getMediaFiles } from "@/lib/firestore";

interface Stats {
  mentors: number;
  socialMentors: number;
  activeCareers: number;
  partners: number;
  mediaFiles: number;
}

interface QuickLink {
  href: string;
  icon: string;
  label: string;
  description: string;
  accent: string;
}

const QUICK_LINKS: QuickLink[] = [
  {
    href: "/dashboard/mentors",
    icon: "🧑‍🤝‍🧑",
    label: "Ecosystem Enablers",
    description: "Manage mentors, advisors and vertical heads",
    accent: "#6366F1",
  },
  {
    href: "/dashboard/social-mentors",
    icon: "👥",
    label: "Social Mentors",
    description: "Social Innovation vertical mentor list",
    accent: "#8B5CF6",
  },
  {
    href: "/dashboard/careers",
    icon: "💼",
    label: "Careers",
    description: "Add, edit or toggle job listings",
    accent: "#10B981",
  },
  {
    href: "/dashboard/partners",
    icon: "🤝",
    label: "Partners",
    description: "Government, institutional & featured partners",
    accent: "#F59E0B",
  },
  {
    href: "/dashboard/media",
    icon: "🖼️",
    label: "Media Library",
    description: "Upload and manage images for the site",
    accent: "#EF4444",
  },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [mentors, socialMentors, careers, partners, featuredPartners, media] =
          await Promise.all([
            getMentors(),
            getSocialMentors(),
            getCareers(),
            getPartners(),
            getFeaturedPartners(),
            getMediaFiles(),
          ]);

        setStats({
          mentors: mentors.length,
          socialMentors: socialMentors.length,
          activeCareers: careers.filter((c) => c.active).length,
          partners: partners.length + featuredPartners.length,
          mediaFiles: media.length,
        });
      } catch {
        // Stats are non-critical; fail silently
        setStats({ mentors: 0, socialMentors: 0, activeCareers: 0, partners: 0, mediaFiles: 0 });
      } finally {
        setLoadingStats(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Dashboard" />

      <main className="flex-1 px-8 py-8 space-y-8">

        {/* Welcome banner */}
        <div
          className="rounded-2xl p-6 flex items-center justify-between gap-4"
          style={{
            background:
              "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0.05) 100%)",
            border: "1px solid rgba(99,102,241,0.2)",
          }}
        >
          <div>
            <h2 className="text-lg font-bold text-cms-text">
              Welcome to AIC Techno CMS
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--cms-text-2)" }}>
              Manage your website content. Changes reflect live on{" "}
              <a
                href="https://aic-techno.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline underline-offset-2"
                style={{ color: "var(--cms-accent)" }}
              >
                aic-techno.com
              </a>
              .
            </p>
          </div>
          <a
            href="https://aic-techno.com"
            target="_blank"
            rel="noopener noreferrer"
            id="view-live-site-btn"
            className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-0.5"
            style={{ background: "var(--cms-accent)" }}
          >
            View Live Site ↗
          </a>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Ecosystem Enablers", value: stats?.mentors, icon: "🧑‍🤝‍🧑" },
            { label: "Social Mentors", value: stats?.socialMentors, icon: "👥" },
            { label: "Active Jobs", value: stats?.activeCareers, icon: "💼" },
            { label: "Partners", value: stats?.partners, icon: "🤝" },
            { label: "Media Files", value: stats?.mediaFiles, icon: "🖼️" },
          ].map(({ label, value, icon }) => (
            <div key={label} className="cms-card p-5 rounded-xl">
              <div className="text-2xl mb-3">{icon}</div>
              <div
                className="text-2xl font-black tracking-tight"
                style={{ color: "var(--cms-text)" }}
              >
                {loadingStats ? (
                  <span
                    className="inline-block w-8 h-6 rounded animate-pulse-soft"
                    style={{ background: "var(--cms-surface-2)" }}
                  />
                ) : (
                  value ?? 0
                )}
              </div>
              <div
                className="text-xs font-medium mt-1"
                style={{ color: "var(--cms-muted)" }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div>
          <h2
            className="text-xs font-bold uppercase tracking-widest mb-4"
            style={{ color: "var(--cms-muted)" }}
          >
            Content Modules
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                id={`quick-link-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                className="cms-card p-5 rounded-xl flex items-start gap-4 group transition-all duration-200 hover:-translate-y-0.5"
                style={{ textDecoration: "none" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor =
                    link.accent + "40";
                  (e.currentTarget as HTMLAnchorElement).style.background =
                    link.accent + "08";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor =
                    "var(--cms-border)";
                  (e.currentTarget as HTMLAnchorElement).style.background =
                    "var(--cms-surface)";
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                  style={{
                    background: link.accent + "18",
                    border: `1px solid ${link.accent}30`,
                  }}
                >
                  {link.icon}
                </div>
                <div className="min-w-0">
                  <p
                    className="font-semibold text-sm"
                    style={{ color: "var(--cms-text)" }}
                  >
                    {link.label}
                  </p>
                  <p
                    className="text-xs mt-0.5 leading-relaxed"
                    style={{ color: "var(--cms-muted)" }}
                  >
                    {link.description}
                  </p>
                </div>
                <span
                  className="ml-auto flex-shrink-0 text-xs group-hover:translate-x-1 transition-transform duration-150"
                  style={{ color: "var(--cms-muted)" }}
                >
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Info footer */}
        <div
          className="rounded-xl px-5 py-4 text-xs"
          style={{
            background: "var(--cms-surface-2)",
            border: "1px solid var(--cms-border)",
            color: "var(--cms-muted)",
          }}
        >
          <strong style={{ color: "var(--cms-text-2)" }}>Note:</strong> Content
          changes are fetched live from Firestore by the static website. No
          rebuild or redeploy is needed after saving changes here.
        </div>
      </main>
    </div>
  );
}
