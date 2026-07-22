"use client";
// src/app/dashboard/page.tsx

import { useEffect, useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/cms/Topbar";
import { getMentors, getSocialMentors, getCareers, getPartners, getFeaturedPartners, getMediaFiles } from "@/lib/firestore";
import {
  Users,
  HeartHandshake,
  Briefcase,
  Building2,
  Image as ImageIcon,
  ArrowRight,
  ExternalLink,
  Zap,
  CheckCircle2,
} from "lucide-react";

interface Stats {
  mentors: number;
  socialMentors: number;
  activeCareers: number;
  partners: number;
  mediaFiles: number;
}

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
        setStats({ mentors: 0, socialMentors: 0, activeCareers: 0, partners: 0, mediaFiles: 0 });
      } finally {
        setLoadingStats(false);
      }
    }
    loadStats();
  }, []);

  const statCards = [
    {
      title: "Ecosystem Enablers",
      value: stats?.mentors,
      icon: Users,
      color: "text-sky-700",
      bg: "bg-sky-50",
      border: "border-sky-300",
    },
    {
      title: "Social Mentors",
      value: stats?.socialMentors,
      icon: HeartHandshake,
      color: "text-teal-700",
      bg: "bg-teal-50",
      border: "border-teal-300",
    },
    {
      title: "Active Jobs",
      value: stats?.activeCareers,
      icon: Briefcase,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-300",
    },
    {
      title: "Ecosystem Partners",
      value: stats?.partners,
      icon: Building2,
      color: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-300",
    },
    {
      title: "Media Assets",
      value: stats?.mediaFiles,
      icon: ImageIcon,
      color: "text-blue-700",
      bg: "bg-blue-50",
      border: "border-blue-300",
    },
  ];

  const quickModules = [
    {
      href: "/dashboard/mentors",
      label: "Ecosystem Enablers",
      desc: "Manage domain leads, serial founders & key incubation mentors",
      icon: Users,
      badge: "Dynamic Firestore",
    },
    {
      href: "/dashboard/social-mentors",
      label: "Social Mentors",
      desc: "Manage extended network mentors for Social Innovation vertical",
      icon: HeartHandshake,
      badge: "Dynamic Firestore",
    },
    {
      href: "/dashboard/careers",
      label: "Careers & Recruitment",
      desc: "Publish job postings, role descriptions and application URLs",
      icon: Briefcase,
      badge: "Dynamic Firestore",
    },
    {
      href: "/dashboard/partners",
      label: "Partners & Supporters",
      desc: "Government, Institutional, Fab Lab & Cloud program partners",
      icon: Building2,
      badge: "Dynamic Firestore",
    },
    {
      href: "/dashboard/media",
      label: "Media & Asset Storage",
      desc: "Upload image files directly to Firebase Storage bucket",
      icon: ImageIcon,
      badge: "Firebase Storage",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen w-full">
      <Topbar title="Overview" />

      {/* Full-width container across the screen */}
      <main className="flex-1 px-8 py-8 space-y-8 w-full">
        {/* Full-width Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800 w-full">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-200 text-xs font-bold">
                <Zap className="w-3.5 h-3.5" />
                Live Firestore Synchronization Enabled
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white">
                AIC Techno Innovation & Incubation Council
              </h2>
              <p className="text-sm text-slate-200 leading-relaxed font-medium">
                Welcome to the central management system. Updates made to dynamic modules reflect live on{" "}
                <a
                  href="https://aic-techno.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-300 font-bold underline underline-offset-4 hover:text-white"
                >
                  aic-techno.com
                </a>{" "}
                without rebuilds.
              </p>
            </div>

            <a
              href="https://aic-techno.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-lg font-extrabold text-sm bg-sky-500 text-white hover:bg-sky-400 transition-all shadow-md shrink-0 flex items-center gap-2"
            >
              <span>View Production Site</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Metric Cards — Full Width Grid */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black text-black uppercase tracking-widest">
              Key Content Metrics
            </h3>
            <span className="flex items-center gap-1.5 text-xs text-emerald-800 font-extrabold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Realtime Sync Active
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="cms-card p-5 flex flex-col justify-between space-y-4 w-full"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-black">
                      {card.title}
                    </span>
                    <div className={`p-2 rounded-lg ${card.bg} ${card.border} border`}>
                      <Icon className={`w-4 h-4 ${card.color}`} />
                    </div>
                  </div>

                  <div>
                    <div className="text-3xl font-black text-black tracking-tight">
                      {loadingStats ? (
                        <div className="h-8 w-12 rounded bg-slate-200 animate-pulse-soft" />
                      ) : (
                        card.value ?? 0
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Modules Grid — Full Width Responsive Grid */}
        <div className="space-y-4 w-full">
          <h3 className="text-xs font-black text-black uppercase tracking-widest">
            Active Management Modules
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 w-full">
            {quickModules.map((mod) => {
              const Icon = mod.icon;
              return (
                <Link
                  key={mod.href}
                  href={mod.href}
                  className="cms-card-interactive p-6 flex flex-col justify-between space-y-5 group w-full"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 group-hover:bg-sky-100 transition-colors">
                        <Icon className="w-6 h-6 text-sky-700" />
                      </div>
                      <span className="text-[10px] font-extrabold text-sky-900 uppercase tracking-wider px-2 py-0.5 rounded bg-sky-100 border border-sky-300">
                        {mod.badge}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-extrabold text-black group-hover:text-sky-700 transition-colors">
                        {mod.label}
                      </h4>
                      <p className="text-xs text-slate-800 font-medium mt-1 leading-relaxed">
                        {mod.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center text-xs font-bold text-sky-700 group-hover:translate-x-1 transition-transform">
                    <span>Manage Module</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
