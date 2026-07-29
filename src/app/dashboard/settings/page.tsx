"use client";

import { useEffect, useRef, useState } from "react";
import { Topbar } from "@/components/cms/Topbar";
import { getSiteSettings, saveSiteSettings, subscribePages, togglePageInNav, SiteSettings, CustomPage } from "@/lib/firestore";
import { uploadFile, generateStoragePath } from "@/lib/storage";
import Link from "next/link";

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
  const [cmsPages, setCmsPages] = useState<CustomPage[]>([]);
  const [togglingNavId, setTogglingNavId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const lastSavedRef = useRef<string>("");

  useEffect(() => {
    const unsub = subscribePages((pages) => {
      setCmsPages(pages);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const settings = await getSiteSettings();
        if (settings) {
          const loaded = {
            ...settings,
            navLinks: settings.navLinks || [],
            footerNavLinks: settings.footerNavLinks || [],
            footerExternalLinks: settings.footerExternalLinks || [],
            socialLinks: settings.socialLinks || []
          };
          setData(loaded);
          lastSavedRef.current = JSON.stringify(loaded);
        } else {
          lastSavedRef.current = JSON.stringify(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const currentSnapshot = JSON.stringify(data);
  const hasUnsavedChanges = !loading && currentSnapshot !== lastSavedRef.current;

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. If you leave now, your changes will be lost.";
        return e.returnValue;
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSiteSettings(data);
      lastSavedRef.current = currentSnapshot;
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

  const handleToggleNavInSettings = async (page: CustomPage) => {
    setTogglingNavId(page.id);
    try {
      const next = !page.showInNav;
      await togglePageInNav(page.id, next);
      setToast({ msg: next ? `"${page.title}" added to navbar!` : `"${page.title}" removed from navbar.`, type: "success" });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error(err);
      setToast({ msg: "Failed to update navigation", type: "error" });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setTogglingNavId(null);
    }
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
      <Topbar
        title="Site Settings"
        breadcrumb="Settings"
        hasUnsavedChanges={hasUnsavedChanges}
        actions={
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
              hasUnsavedChanges
                ? "bg-amber-400 text-amber-950 border border-amber-500 shadow-md ring-2 ring-amber-400/40 hover:bg-amber-300 animate-pulse cursor-pointer"
                : "cms-btn-primary"
            }`}
          >
            {saving ? "Saving..." : hasUnsavedChanges ? "Save Settings *" : "Saved ✓"}
          </button>
        }
      />
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
              <div className="flex items-center gap-3 flex-wrap">
                {data.logoUrl && (
                  <div className="relative group">
                    <img src={data.logoUrl} alt="Logo preview" className="h-14 w-auto bg-black p-1 rounded border border-[var(--cms-border)]" />
                    <button
                      type="button"
                      onClick={() => setData({ ...data, logoUrl: "" })}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-[var(--cms-danger)] text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >×</button>
                  </div>
                )}
                <label
                  htmlFor="logo-upload"
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--cms-accent)] hover:opacity-90 active:scale-95 text-white text-xs font-semibold rounded-lg cursor-pointer transition-all select-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  {data.logoUrl ? "Replace Logo" : "Upload Logo"}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="sr-only"
                  id="logo-upload"
                />
                {!data.logoUrl && (
                  <span className="text-xs text-[var(--cms-muted)] italic">No logo uploaded</span>
                )}
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

        {/* 2. Visual Page Builder Pages in Navigation */}
        <section className="cms-card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--cms-muted)]">Visual Builder Pages in Navigation</h2>
              <p className="text-xs text-[var(--cms-muted)] mt-1">Pages created with the Visual Builder that are visible in the website navbar.</p>
            </div>
            <Link
              href="/dashboard/pages"
              className="px-3 py-1 bg-[var(--cms-surface-2)] hover:bg-[var(--cms-border)] text-xs font-semibold rounded text-[var(--cms-text-1)] transition-colors"
            >
              Manage Pages →
            </Link>
          </div>

          <div className="space-y-2">
            {cmsPages.length === 0 ? (
              <p className="text-xs text-[var(--cms-muted)] italic">No visual builder pages created yet.</p>
            ) : (
              cmsPages.map((p) => (
                <div key={p.id} className="flex items-center justify-between bg-[var(--cms-surface-2)] p-3 rounded-lg border border-[var(--cms-border)]">
                  <div className="flex items-center gap-3">
                    <span className="text-base">📄</span>
                    <div>
                      <div className="text-xs font-black text-[var(--cms-text-1)]">{p.title}</div>
                      <div className="text-[10px] text-[var(--cms-muted)] font-mono">page.html?slug={p.slug}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.status === "published" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                    }`}>
                      {p.status}
                    </span>

                    <button
                      onClick={() => handleToggleNavInSettings(p)}
                      disabled={togglingNavId === p.id || p.status !== "published"}
                      title={p.status !== "published" ? "Publish page first to add to navbar" : p.showInNav ? "Click to remove from navbar" : "Click to show in navbar"}
                      className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                        p.status !== "published"
                          ? "opacity-30 cursor-not-allowed bg-slate-100 text-slate-400"
                          : p.showInNav
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                      }`}
                    >
                      {togglingNavId === p.id ? "Saving..." : p.showInNav ? "In Navbar ✓" : "+ Add to Navbar"}
                    </button>
                  </div>
                </div>
              ))
            )}
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
            className={`px-6 py-3 rounded-lg text-sm font-extrabold transition-all ${
              hasUnsavedChanges
                ? "bg-amber-400 text-amber-950 border border-amber-500 shadow-md ring-2 ring-amber-400/50 hover:bg-amber-300 animate-pulse cursor-pointer"
                : "bg-[#059669] text-white hover:opacity-90"
            }`}
            id="save-all-btn"
          >
            {saving ? "Saving..." : hasUnsavedChanges ? "Save All Settings *" : "Saved ✓"}
          </button>
        </div>
      </main>
    </div>
  );
}
