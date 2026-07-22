"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/cms/Topbar";
import { getSiteSettings, saveSiteSettings, SiteSettings } from "@/lib/firestore";
import { uploadFile, generateStoragePath } from "@/lib/storage";

export default function SettingsPage() {
  const [data, setData] = useState<Omit<SiteSettings, "updatedAt">>({
    logoUrl: "",
    logoAlt: "AIC Techno Logo",
    navLinks: [
      { text: "About TIG", href: "#tig" },
      { text: "About AIC", href: "#aic" },
      { text: "Location", href: "#location" },
      { text: "Ecosystem Enablers", href: "#mentors" },
      { text: "Back2Bengal", href: "https://aic-techno.com/back2bengal" },
      { text: "Careers", href: "#careers" },
      { text: "Partners", href: "#partners" }
    ],
    footerBrandSubtitle: "",
    footerAimLine: "",
    contactEmail: "contact@aic-techno.com",
    footerNavLinks: [],
    footerExternalLinks: [],
    socialLinks: [
      { platform: "LinkedIn", url: "#", icon: "in" },
      { platform: "Twitter", url: "#", icon: "𝕏" },
      { platform: "Instagram", url: "#", icon: "ig" }
    ],
    copyrightText: "© 2026 AIC Techno Innovation and Incubation Council. All rights reserved."
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const settings = await getSiteSettings();
        if (settings) {
          setData({
            ...settings,
            navLinks: settings.navLinks || [],
            footerNavLinks: settings.footerNavLinks || [],
            footerExternalLinks: settings.footerExternalLinks || [],
            socialLinks: settings.socialLinks || []
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSiteSettings(data);
      setToast({ msg: "Settings saved successfully!", type: "success" });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error(err);
      setToast({ msg: "Failed to save settings.", type: "error" });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    try {
      const path = generateStoragePath("settings", file);
      const url = await uploadFile(file, path);
      setData((prev) => ({ ...prev, logoUrl: url }));
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload image");
    }
  };

  const updateList = <K extends keyof Pick<typeof data, "navLinks" | "footerNavLinks" | "footerExternalLinks" | "socialLinks">>(
    key: K,
    index: number,
    field: string,
    value: string
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const list = [...data[key]] as any[];
    list[index][field] = value;
    setData((prev) => ({ ...prev, [key]: list }));
  };

  const addToList = <K extends keyof Pick<typeof data, "navLinks" | "footerNavLinks" | "footerExternalLinks" | "socialLinks">>(
    key: K,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newItem: any
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setData((prev) => ({ ...prev, [key]: [...(prev[key] as any[]), newItem] }));
  };

  const removeFromList = <K extends keyof Pick<typeof data, "navLinks" | "footerNavLinks" | "footerExternalLinks" | "socialLinks">>(
    key: K,
    index: number
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const list = [...data[key]] as any[];
    list.splice(index, 1);
    setData((prev) => ({ ...prev, [key]: list }));
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Topbar title="Site Settings" breadcrumb="Settings" />
        <main className="flex-1 p-8 flex items-center justify-center">
          <p className="text-[var(--cms-muted)] animate-pulse">Loading settings...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Site Settings" breadcrumb="Settings" />
      <main className="flex-1 px-8 py-8 space-y-8 animate-fade-in pb-24">
        {toast && (
          <div
            className={`p-4 rounded-lg text-sm font-medium ${
              toast.type === "success" ? "bg-[var(--cms-success)]" : "bg-[var(--cms-danger)]"
            } text-white`}
          >
            {toast.msg}
          </div>
        )}

        {/* 1. Brand / Logo */}
        <section className="cms-card p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--cms-muted)]">Brand / Logo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)] mb-2">Logo Upload</label>
              <div className="flex items-center gap-4">
                {data.logoUrl && (
                  <img src={data.logoUrl} alt="Logo preview" className="h-12 w-auto bg-black p-1 rounded" />
                )}
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-sm text-[var(--cms-text-2)]" id="logo-upload" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)] mb-2" htmlFor="logoAlt">
                Logo Alt Text
              </label>
              <input
                id="logoAlt"
                className="cms-input w-full"
                value={data.logoAlt}
                onChange={(e) => setData({ ...data, logoAlt: e.target.value })}
              />
            </div>
          </div>
        </section>

        {/* 2. Navigation Links */}
        <section className="cms-card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--cms-muted)]">Navigation Links</h2>
            <button
              onClick={() => addToList("navLinks", { text: "", href: "" })}
              className="px-3 py-1 bg-[var(--cms-accent)] text-white text-xs font-semibold rounded"
              id="add-navlink"
            >
              + Add Link
            </button>
          </div>
          <div className="space-y-2">
            {data.navLinks.map((link, i) => (
              <div key={`nav-${i}`} className="flex gap-2 items-center bg-[var(--cms-surface-2)] p-2 rounded">
                <input
                  className="cms-input flex-1"
                  placeholder="Text"
                  value={link.text}
                  onChange={(e) => updateList("navLinks", i, "text", e.target.value)}
                  id={`nav-text-${i}`}
                />
                <input
                  className="cms-input flex-1"
                  placeholder="URL"
                  value={link.href}
                  onChange={(e) => updateList("navLinks", i, "href", e.target.value)}
                  id={`nav-href-${i}`}
                />
                <button
                  onClick={() => removeFromList("navLinks", i)}
                  className="p-2 bg-[var(--cms-danger)] text-white rounded font-bold text-xs"
                  id={`nav-del-${i}`}
                >
                  X
                </button>
              </div>
            ))}
            {data.navLinks.length === 0 && <p className="text-sm text-[var(--cms-muted)]">No navigation links added.</p>}
          </div>
        </section>

        {/* 3. Footer Content */}
        <section className="cms-card p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--cms-muted)]">Footer Content</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)] mb-2" htmlFor="footerBrandSubtitle">
                Brand Subtitle
              </label>
              <textarea
                id="footerBrandSubtitle"
                className="cms-input w-full h-24"
                value={data.footerBrandSubtitle}
                onChange={(e) => setData({ ...data, footerBrandSubtitle: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)] mb-2" htmlFor="copyrightText">
                Copyright Text
              </label>
              <textarea
                id="copyrightText"
                className="cms-input w-full h-24"
                value={data.copyrightText}
                onChange={(e) => setData({ ...data, copyrightText: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)] mb-2" htmlFor="footerAimLine">
                AIM Line
              </label>
              <input
                id="footerAimLine"
                className="cms-input w-full"
                value={data.footerAimLine}
                onChange={(e) => setData({ ...data, footerAimLine: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)] mb-2" htmlFor="contactEmail">
                Contact Email
              </label>
              <input
                id="contactEmail"
                className="cms-input w-full"
                value={data.contactEmail}
                onChange={(e) => setData({ ...data, contactEmail: e.target.value })}
              />
            </div>
          </div>
        </section>

        {/* 4. Footer Navigation Links */}
        <section className="cms-card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--cms-muted)]">Footer Nav Links</h2>
            <button
              onClick={() => addToList("footerNavLinks", { text: "", href: "" })}
              className="px-3 py-1 bg-[var(--cms-accent)] text-white text-xs font-semibold rounded"
              id="add-footernav"
            >
              + Add Link
            </button>
          </div>
          <div className="space-y-2">
            {data.footerNavLinks.map((link, i) => (
              <div key={`footnav-${i}`} className="flex gap-2 items-center bg-[var(--cms-surface-2)] p-2 rounded">
                <input
                  className="cms-input flex-1"
                  placeholder="Text"
                  value={link.text}
                  onChange={(e) => updateList("footerNavLinks", i, "text", e.target.value)}
                  id={`footnav-text-${i}`}
                />
                <input
                  className="cms-input flex-1"
                  placeholder="URL"
                  value={link.href}
                  onChange={(e) => updateList("footerNavLinks", i, "href", e.target.value)}
                  id={`footnav-href-${i}`}
                />
                <button
                  onClick={() => removeFromList("footerNavLinks", i)}
                  className="p-2 bg-[var(--cms-danger)] text-white rounded font-bold text-xs"
                  id={`footnav-del-${i}`}
                >
                  X
                </button>
              </div>
            ))}
            {data.footerNavLinks.length === 0 && <p className="text-sm text-[var(--cms-muted)]">No footer navigation links added.</p>}
          </div>
        </section>

        {/* 5. Footer External Links */}
        <section className="cms-card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--cms-muted)]">Footer External Links</h2>
            <button
              onClick={() => addToList("footerExternalLinks", { text: "", href: "" })}
              className="px-3 py-1 bg-[var(--cms-accent)] text-white text-xs font-semibold rounded"
              id="add-footerext"
            >
              + Add Link
            </button>
          </div>
          <div className="space-y-2">
            {data.footerExternalLinks.map((link, i) => (
              <div key={`footext-${i}`} className="flex gap-2 items-center bg-[var(--cms-surface-2)] p-2 rounded">
                <input
                  className="cms-input flex-1"
                  placeholder="Text"
                  value={link.text}
                  onChange={(e) => updateList("footerExternalLinks", i, "text", e.target.value)}
                  id={`footext-text-${i}`}
                />
                <input
                  className="cms-input flex-1"
                  placeholder="URL"
                  value={link.href}
                  onChange={(e) => updateList("footerExternalLinks", i, "href", e.target.value)}
                  id={`footext-href-${i}`}
                />
                <button
                  onClick={() => removeFromList("footerExternalLinks", i)}
                  className="p-2 bg-[var(--cms-danger)] text-white rounded font-bold text-xs"
                  id={`footext-del-${i}`}
                >
                  X
                </button>
              </div>
            ))}
            {data.footerExternalLinks.length === 0 && <p className="text-sm text-[var(--cms-muted)]">No footer external links added.</p>}
          </div>
        </section>

        {/* 6. Social Links */}
        <section className="cms-card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--cms-muted)]">Social Links</h2>
            <button
              onClick={() => addToList("socialLinks", { platform: "", url: "", icon: "" })}
              className="px-3 py-1 bg-[var(--cms-accent)] text-white text-xs font-semibold rounded"
              id="add-social"
            >
              + Add Social Link
            </button>
          </div>
          <div className="space-y-2">
            {data.socialLinks.map((link, i) => (
              <div key={`social-${i}`} className="flex gap-2 items-center bg-[var(--cms-surface-2)] p-2 rounded">
                <input
                  className="cms-input flex-1"
                  placeholder="Platform"
                  value={link.platform}
                  onChange={(e) => updateList("socialLinks", i, "platform", e.target.value)}
                  id={`social-plat-${i}`}
                />
                <input
                  className="cms-input flex-1"
                  placeholder="Icon (e.g. in, 𝕏, ig)"
                  value={link.icon}
                  onChange={(e) => updateList("socialLinks", i, "icon", e.target.value)}
                  id={`social-icon-${i}`}
                />
                <input
                  className="cms-input flex-1"
                  placeholder="URL"
                  value={link.url}
                  onChange={(e) => updateList("socialLinks", i, "url", e.target.value)}
                  id={`social-url-${i}`}
                />
                <button
                  onClick={() => removeFromList("socialLinks", i)}
                  className="p-2 bg-[var(--cms-danger)] text-white rounded font-bold text-xs"
                  id={`social-del-${i}`}
                >
                  X
                </button>
              </div>
            ))}
            {data.socialLinks.length === 0 && <p className="text-sm text-[var(--cms-muted)]">No social links added.</p>}
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-[var(--cms-success)] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            id="save-all-btn"
          >
            {saving ? "Saving..." : "Save All Settings"}
          </button>
        </div>
      </main>
    </div>
  );
}
