"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/cms/Topbar";
import { getHeroContent, saveHeroContent, HeroContent } from "@/lib/firestore";

const defaultHeroContent: Omit<HeroContent, "updatedAt"> = {
  title: "West Bengal's First and only Atal Incubation Center",
  subtitle:
    "AIC Techno Innovation and Incubation Council — Center for Innovation & Entrepreneurship...",
  badgeText: "",
  cta1Text: "For Startups",
  cta1Link: "https://forms.gle/RvQRoidpwkkXRLcn7",
  cta2Text: "We're Hiring",
  cta2Link: "#careers",
  aimTag1: "NITI Aayog · Atal Innovation Mission",
  aimTag2: "Techno India University · Kolkata",
};

export default function HeroPage() {
  const [data, setData] = useState<Omit<HeroContent, "updatedAt">>(defaultHeroContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const fetchedData = await getHeroContent();
        if (fetchedData) {
          setData(fetchedData);
        }
      } catch (error) {
        console.error("Failed to load hero content:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setStatusMessage(null);
    try {
      await saveHeroContent(data);
      setStatusMessage({
        text: "Hero content saved successfully!",
        type: "success",
      });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (error) {
      console.error("Failed to save hero content:", error);
      setStatusMessage({
        text: "Failed to save hero content. Please try again.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Topbar title="Hero Section" breadcrumb="Hero" />
        <main className="flex-1 px-8 py-8">
          <div className="cms-card p-6 rounded-xl animate-pulse flex flex-col space-y-4">
            <div className="h-6 w-1/4 bg-[var(--cms-surface-2)] rounded"></div>
            <div className="h-10 bg-[var(--cms-surface-2)] rounded"></div>
            <div className="h-20 bg-[var(--cms-surface-2)] rounded"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Hero Section" breadcrumb="Hero" />
      <main className="flex-1 px-8 py-8 space-y-6 animate-fade-in">
        {statusMessage && (
          <div
            className={`p-4 rounded-lg font-medium text-sm transition-colors ${
              statusMessage.type === "success"
                ? "bg-[var(--cms-success)] text-white"
                : "bg-[var(--cms-danger)] text-white"
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        <div className="cms-card p-6 rounded-xl flex flex-col space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--cms-muted)]">
            Main Content
          </h2>

          <div className="space-y-2">
            <label
              htmlFor="badgeText"
              className="block text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)]"
            >
              Badge Text
            </label>
            <input
              id="badgeText"
              type="text"
              className="cms-input w-full"
              value={data.badgeText}
              onChange={handleChange}
              placeholder="e.g. Now Open for Applications"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="title"
              className="block text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)]"
            >
              Title
            </label>
            <input
              id="title"
              type="text"
              className="cms-input w-full"
              value={data.title}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="subtitle"
              className="block text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)]"
            >
              Subtitle
            </label>
            <textarea
              id="subtitle"
              rows={4}
              className="cms-input w-full"
              value={data.subtitle}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[var(--cms-border)]">
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--cms-muted)]">
                CTA Button 1
              </h2>
              <div className="space-y-2">
                <label
                  htmlFor="cta1Text"
                  className="block text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)]"
                >
                  Text
                </label>
                <input
                  id="cta1Text"
                  type="text"
                  className="cms-input w-full"
                  value={data.cta1Text}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="cta1Link"
                  className="block text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)]"
                >
                  Link
                </label>
                <input
                  id="cta1Link"
                  type="text"
                  className="cms-input w-full"
                  value={data.cta1Link}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--cms-muted)]">
                CTA Button 2
              </h2>
              <div className="space-y-2">
                <label
                  htmlFor="cta2Text"
                  className="block text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)]"
                >
                  Text
                </label>
                <input
                  id="cta2Text"
                  type="text"
                  className="cms-input w-full"
                  value={data.cta2Text}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="cta2Link"
                  className="block text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)]"
                >
                  Link
                </label>
                <input
                  id="cta2Link"
                  type="text"
                  className="cms-input w-full"
                  value={data.cta2Link}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[var(--cms-border)]">
            <div className="space-y-4 col-span-1 md:col-span-2">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--cms-muted)]">
                AIM Tags
              </h2>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="aimTag1"
                className="block text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)]"
              >
                Tag 1
              </label>
              <input
                id="aimTag1"
                type="text"
                className="cms-input w-full"
                value={data.aimTag1}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="aimTag2"
                className="block text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)]"
              >
                Tag 2
              </label>
              <input
                id="aimTag2"
                type="text"
                className="cms-input w-full"
                value={data.aimTag2}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-[var(--cms-border)] flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--cms-success)] hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
