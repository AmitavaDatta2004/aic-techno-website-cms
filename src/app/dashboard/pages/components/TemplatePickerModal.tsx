"use client";
// src/app/dashboard/pages/components/TemplatePickerModal.tsx
// Modal shown when user clicks "Create Page".
// Step 1: Choose a template (with visual card previews).
// Step 2: Enter page title, slug, and meta.

import { useState } from "react";
import { X, Check } from "lucide-react";
import type { PageComponent, CustomPage } from "@/lib/firestore";
import { COMPONENT_REGISTRY } from "@/lib/components/registry";

// ─── Template definitions ─────────────────────────────────────────────────────

function makeComp(
  type: string,
  order: number,
  extra?: Record<string, unknown>
): PageComponent {
  const def = COMPONENT_REGISTRY.find((d) => d.type === type);
  return {
    id: `comp-${Date.now()}-${order}`,
    type,
    order,
    visible: true,
    props: { ...(def?.defaultProps ?? {}), ...(extra ?? {}) },
  };
}

interface TemplateDef {
  id: string;
  label: string;
  icon: string;
  description: string;
  preview: string[]; // component type names shown as preview labels
  buildComponents: () => PageComponent[];
}

const TEMPLATES: TemplateDef[] = [
  {
    id: "landing",
    label: "Landing Page",
    icon: "🚀",
    description: "Full landing page with hero, features, stats, and CTA.",
    preview: ["Hero", "Features", "Statistics", "CTA"],
    buildComponents: () => [
      makeComp("hero", 0),
      makeComp("features", 1),
      makeComp("statistics", 2),
      makeComp("cta", 3),
    ],
  },
  {
    id: "incubation_program",
    label: "Incubation Program",
    icon: "🏆",
    description: "Complete incubation & grant application page with process & plans.",
    preview: ["Hero Split", "Stats Counter", "Step Process", "Pricing", "FAQ"],
    buildComponents: () => [
      makeComp("hero_split", 0),
      makeComp("stats_counter_bar", 1),
      makeComp("step_process", 2),
      makeComp("pricing", 3),
      makeComp("faq", 4),
    ],
  },
  {
    id: "gpu_lab",
    label: "AI & GPU Compute Lab",
    icon: "⚡",
    description: "Showcase AI infrastructure, API access, compute specs & developer tools.",
    preview: ["Video Hero", "Stats Ribbon", "Code Showcase", "Tabbed Features", "Contact"],
    buildComponents: () => [
      makeComp("hero_video_bg", 0),
      makeComp("stats_counter_bar", 1),
      makeComp("code_block", 2),
      makeComp("tabbed_features", 3),
      makeComp("contact_form", 4),
    ],
  },
  {
    id: "demo_day",
    label: "Demo Day & Summit",
    icon: "🎯",
    description: "Summit agenda, pitch cohort countdown, startup portfolio & registration.",
    preview: ["Countdown", "Event Agenda", "Portfolio", "Executive Quote", "CTA"],
    buildComponents: () => [
      makeComp("countdown", 0),
      makeComp("event_schedule", 1),
      makeComp("portfolio_grid", 2),
      makeComp("quotes_banner", 3),
      makeComp("cta", 4),
    ],
  },
  {
    id: "startup",
    label: "Startup Story Page",
    icon: "💡",
    description: "Tell your startup story with an about, timeline, and team.",
    preview: ["Hero", "About", "Timeline", "Team", "CTA"],
    buildComponents: () => [
      makeComp("hero", 0),
      makeComp("about", 1),
      makeComp("timeline", 2),
      makeComp("team", 3),
      makeComp("cta", 4),
    ],
  },
  {
    id: "careers",
    label: "Careers & Job Board",
    icon: "💼",
    description: "Job listings, leader spotlight, downloadable forms & application contact.",
    preview: ["Hero", "Leader Spotlight", "Job Board", "Resources", "Contact"],
    buildComponents: () => [
      makeComp("hero", 0),
      makeComp("team_exec", 1),
      makeComp("job_board", 2),
      makeComp("download_resources", 3),
      makeComp("contact_form", 4),
    ],
  },
  {
    id: "partner_hub",
    label: "Partner & Ecosystem Hub",
    icon: "🤝",
    description: "Showcase corporate partners, comparison matrix & testimonial reviews.",
    preview: ["Banner Alert", "Hero", "Partner Logos", "Comparison", "Testimonials"],
    buildComponents: () => [
      makeComp("banner_alert", 0),
      makeComp("hero", 1),
      makeComp("logos", 2),
      makeComp("comparison_table", 3),
      makeComp("testimonials", 4),
    ],
  },
  {
    id: "event",
    label: "Event & Workshop Page",
    icon: "📅",
    description: "Promote an event with details, agenda, a gallery, and contact form.",
    preview: ["Hero", "Event Agenda", "Gallery", "Contact Form"],
    buildComponents: () => [
      makeComp("hero", 0),
      makeComp("event_schedule", 1),
      makeComp("gallery", 2),
      makeComp("contact_form", 3),
    ],
  },
  {
    id: "mentor",
    label: "Mentor Network Page",
    icon: "🎓",
    description: "Showcase mentors with bios, testimonials, and a CTA.",
    preview: ["Hero", "Mentors", "Testimonials", "CTA"],
    buildComponents: () => [
      makeComp("hero", 0),
      makeComp("mentors", 1),
      makeComp("testimonials", 2),
      makeComp("cta", 3),
    ],
  },
  {
    id: "resource_hub",
    label: "Resource & Policy Hub",
    icon: "📄",
    description: "Downloadable handbooks, grant policy PDFs, FAQ & newsletter.",
    preview: ["Hero", "Download Resources", "FAQ Accordion", "Newsletter"],
    buildComponents: () => [
      makeComp("hero", 0),
      makeComp("download_resources", 1),
      makeComp("faq", 2),
      makeComp("newsletter", 3),
    ],
  },
  {
    id: "location_contact",
    label: "Location & Campus Map",
    icon: "📍",
    description: "Physical campus address, Google Maps embed, team contacts & FAQ.",
    preview: ["Hero", "Location Map", "Contact Form", "FAQ"],
    buildComponents: () => [
      makeComp("hero", 0),
      makeComp("location_map", 1),
      makeComp("contact_form", 2),
      makeComp("faq", 3),
    ],
  },
  {
    id: "press_room",
    label: "Press & Media Room",
    icon: "📰",
    description: "Latest news articles, video showcases, press releases & newsletter.",
    preview: ["Hero", "News Grid", "Video Showcase", "Newsletter"],
    buildComponents: () => [
      makeComp("hero", 0),
      makeComp("news_grid", 1),
      makeComp("video_modal", 2),
      makeComp("newsletter", 3),
    ],
  },
  {
    id: "gallery",
    label: "Gallery Page",
    icon: "🖼️",
    description: "Image-focused page for showcasing photos or portfolio.",
    preview: ["Hero", "Gallery", "About", "CTA"],
    buildComponents: () => [
      makeComp("hero", 0),
      makeComp("gallery", 1),
      makeComp("about", 2),
      makeComp("cta", 3),
    ],
  },
  {
    id: "blog",
    label: "Blog / Article Page",
    icon: "📝",
    description: "Long-form content page with images, text, and related cards.",
    preview: ["Hero", "Image+Text", "Cards", "CTA"],
    buildComponents: () => [
      makeComp("hero", 0),
      makeComp("image_text", 1),
      makeComp("cards", 2),
      makeComp("cta", 3),
    ],
  },
  {
    id: "custom",
    label: "Custom / Blank Page",
    icon: "✏️",
    description: "Start from scratch. Add any components you need.",
    preview: ["Empty canvas"],
    buildComponents: () => [],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface TemplatePickerModalProps {
  onConfirm: (
    page: Omit<CustomPage, "id" | "createdAt" | "updatedAt" | "publishedAt">
  ) => void;
  onClose: () => void;
}

export function TemplatePickerModal({ onConfirm, onClose }: TemplatePickerModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDef | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; slug?: string }>({});

  function handleTitleChange(val: string) {
    setTitle(val);
    if (!slugManual) {
      const auto = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .substring(0, 60);
      setSlug(auto);
    }
    if (!metaTitle) setMetaTitle(val ? `${val} | AIC Techno` : "");
  }

  function validate(): boolean {
    const e: { title?: string; slug?: string } = {};
    if (!title.trim()) e.title = "Page title is required";
    if (!slug.trim()) e.slug = "URL slug is required";
    else if (!/^[a-z0-9][a-z0-9-]*$/.test(slug))
      e.slug = "Slug must be lowercase letters, numbers, and hyphens only";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleCreate() {
    if (!validate() || !selectedTemplate) return;
    const components = selectedTemplate.buildComponents();
    onConfirm({
      slug,
      title,
      template: selectedTemplate.id,
      status: "draft",
      meta: {
        title: metaTitle || title,
        description: metaDesc,
      },
      components,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] shrink-0">
          <div>
            <h2 className="text-lg font-black text-[#0F172A]">
              {step === 1 ? "Choose a Template" : "Page Details"}
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              {step === 1
                ? "Select a starting layout for your new page"
                : `Template: ${selectedTemplate?.label}`}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F1F5F9] rounded-xl transition-colors">
            <X className="w-5 h-5 text-[#64748B]" />
          </button>
        </div>

        {/* Step 1 — Template Grid */}
        {step === 1 && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3">
              {TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                    selectedTemplate?.id === tpl.id
                      ? "border-[#800020] bg-[#FFF0F3] shadow-sm"
                      : "border-[#E5E7EB] hover:border-[#800020]/40 hover:bg-[#FFF8F9]"
                  }`}
                >
                  {selectedTemplate?.id === tpl.id && (
                    <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#800020] flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className="text-3xl mb-2">{tpl.icon}</div>
                  <div className="text-sm font-bold text-[#0F172A] mb-1">{tpl.label}</div>
                  <p className="text-[11px] text-[#64748B] mb-3 leading-relaxed">{tpl.description}</p>
                  {/* Mini preview blocks */}
                  <div className="space-y-1">
                    {tpl.preview.map((name, i) => (
                      <div
                        key={i}
                        className="h-4 rounded bg-[#F1F5F9] border border-[#E2E8F0] flex items-center px-1.5"
                      >
                        <span className="text-[9px] text-[#94A3B8] font-semibold truncate">{name}</span>
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Page Details */}
        {step === 2 && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">
                Page Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. About Our Incubation Centre"
                className="cms-input"
                autoFocus
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">
                URL Slug <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[#94A3B8] text-xs whitespace-nowrap">aic-techno.com/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlugManual(true);
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                  }}
                  placeholder="about-us"
                  className="cms-input flex-1"
                />
              </div>
              {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug}</p>}
            </div>

            <div className="border-t border-[#E5E7EB] pt-4">
              <p className="text-[11px] font-black uppercase tracking-wider text-[#94A3B8] mb-3">SEO / Meta</p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1.5">Meta Title</label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="Page title for search engines"
                    className="cms-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1.5">Meta Description</label>
                  <textarea
                    value={metaDesc}
                    onChange={(e) => setMetaDesc(e.target.value)}
                    placeholder="Brief description shown in search results (150–160 characters)"
                    className="cms-input resize-none"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E5E7EB] shrink-0 bg-[#F8F9FA]">
          <button
            onClick={step === 1 ? onClose : () => setStep(1)}
            className="cms-btn-secondary text-sm"
          >
            {step === 1 ? "Cancel" : "← Back"}
          </button>
          {step === 1 ? (
            <button
              disabled={!selectedTemplate}
              onClick={() => selectedTemplate && setStep(2)}
              className="cms-btn-primary text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue →
            </button>
          ) : (
            <button onClick={handleCreate} className="cms-btn-primary text-sm">
              Create Page ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
