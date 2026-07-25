"use client";
// src/app/dashboard/page.tsx

import { useEffect, useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/cms/Topbar";
import { getBoardMembers, getMentors, getCareers, getPartners, getFeaturedPartners, getMediaFiles, Career } from "@/lib/firestore";
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
  Sparkles,
} from "lucide-react";

interface Stats {
  boardMembers: number;
  mentors: number;
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
        const [boardMembers, mentors, careers, partners, featuredPartners, media] =
          await Promise.all([
            getBoardMembers(),
            getMentors(),
            getCareers(),
            getPartners(),
            getFeaturedPartners(),
            getMediaFiles(),
          ]);

        setStats({
          boardMembers: boardMembers.length,
          mentors: mentors.length,
          activeCareers: careers.filter((c: Career) => c.active).length,
          partners: partners.length + featuredPartners.length,
          mediaFiles: media.length,
        });
      } catch {
        setStats({ boardMembers: 0, mentors: 0, activeCareers: 0, partners: 0, mediaFiles: 0 });
      } finally {
        setLoadingStats(false);
      }
    }
    loadStats();
  }, []);

  const statCards = [
    {
      title: "Board Members",
      value: stats?.boardMembers,
      icon: Users,
    },
    {
      title: "Mentors Network",
      value: stats?.mentors,
      icon: HeartHandshake,
    },
    {
      title: "Active Jobs",
      value: stats?.activeCareers,
      icon: Briefcase,
    },
    {
      title: "Ecosystem Partners",
      value: stats?.partners,
      icon: Building2,
    },
    {
      title: "Media Assets",
      value: stats?.mediaFiles,
      icon: ImageIcon,
    },
  ];

  const quickModules = [
    {
      href: "/dashboard/board-members",
      label: "Board Members",
      desc: "Manage Advisory Board & Executive Board members",
      icon: Users,
    },
    {
      href: "/dashboard/mentors",
      label: "Mentors",
      desc: "Manage extended network mentors for Social Innovation & domain verticals",
      icon: HeartHandshake,
    },
    {
      href: "/dashboard/careers",
      label: "Careers & Recruitment",
      desc: "Publish job postings, role descriptions and application URLs",
      icon: Briefcase,
    },
    {
      href: "/dashboard/partners",
      label: "Partners & Supporters",
      desc: "Government, Institutional, Fab Lab & Cloud program partners",
      icon: Building2,
    },
    {
      href: "/dashboard/media",
      label: "Media & Asset Storage",
      desc: "Upload image files directly to Firebase Storage bucket",
      icon: ImageIcon,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen w-full">
      <Topbar title="Overview" />

      {/* Full-width container */}
      <main className="flex-1 px-8 py-8 space-y-8 w-full">
        {/* Welcome Banner — Rich Obsidian & Maroon Executive Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0F172A] via-[#2A000B] to-[#590017] text-white p-8 sm:p-10 shadow-xl border border-[#800020]/30 w-full">
          {/* Ambient light glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#800020]/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3.5">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                AIC Techno Innovation & Incubation Council
              </h2>
              <p className="text-sm text-slate-200 leading-relaxed font-normal max-w-2xl">
                Center for Innovation & Entrepreneurship — West Bengal&apos;s first Atal Incubation Centre. Updates made in this CMS reflect live on{" "}
                <a
                  href="https://aic-techno.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white font-bold underline underline-offset-4 hover:text-rose-200"
                >
                  aic-techno.com
                </a>{" "}
                without manual rebuilds.
              </p>
            </div>

            <a
              href="https://aic-techno.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl text-white bg-gradient-to-r from-[#800020] to-[#600018] hover:from-[#940026] hover:to-[#70001B] font-extrabold text-xs tracking-wider uppercase transition-all shadow-lg shadow-[#800020]/30 shrink-0 flex items-center gap-2 border border-white/10"
            >
              <span>View Production Site</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Metric Cards — Dynamic Auto-Fit Grid */}
        <div className="w-full space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-[#0F172A] uppercase tracking-[2.5px] flex items-center gap-2">
              <span>Key Content Metrics</span>
              <div className="h-2 w-2 rounded-full bg-[#800020]" />
            </h3>
            <span className="flex items-center gap-1.5 text-xs text-[#800020] font-extrabold bg-[#FFF0F3] px-3 py-1 rounded-full border border-[#FECDD3]">
              <CheckCircle2 className="w-4 h-4 text-[#800020]" /> Realtime Sync Active
            </span>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5 w-full">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="cms-card p-6 flex flex-col justify-between space-y-4 w-full hover:border-[#800020]/50 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#64748B] uppercase tracking-wider">
                      {card.title}
                    </span>
                    <div className="p-2.5 rounded-xl bg-[#FFF0F3] border border-[#FECDD3] group-hover:bg-[#800020] group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4 text-[#800020] group-hover:text-white transition-colors" />
                    </div>
                  </div>

                  <div>
                    <div className="text-4xl font-black text-[#0F172A] tracking-tight leading-none">
                      {loadingStats ? (
                        <div className="h-8 w-14 rounded-md bg-slate-200 animate-pulse" />
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

        {/* Dynamic Modules Grid */}
        <div className="space-y-4 w-full">
          <h3 className="text-xs font-black text-[#0F172A] uppercase tracking-[2.5px] flex items-center gap-2">
            <span>Active Management Modules</span>
            <div className="h-2 w-2 rounded-full bg-[#800020]" />
          </h3>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5 w-full">
            {quickModules.map((mod) => {
              const Icon = mod.icon;
              return (
                <Link
                  key={mod.href}
                  href={mod.href}
                  className="cms-card-interactive p-6 flex flex-col justify-between space-y-5 group w-full"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-xl bg-[#FFF0F3] border border-[#FECDD3] group-hover:bg-[#800020] group-hover:text-white transition-all shadow-xs">
                        <Icon className="w-5 h-5 text-[#800020] group-hover:text-white transition-colors" />
                      </div>
                    </div>

                    <div>
                      <h4 className="text-base font-black text-[#0F172A] group-hover:text-[#800020] transition-colors">
                        {mod.label}
                      </h4>
                      <p className="text-xs text-[#64748B] font-medium mt-1 leading-relaxed">
                        {mod.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center text-xs font-extrabold text-[#800020] group-hover:translate-x-1.5 transition-transform">
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
