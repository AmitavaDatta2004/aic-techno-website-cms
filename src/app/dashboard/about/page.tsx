"use client";

import { useEffect, useRef, useState } from "react";
import { Topbar } from "@/components/cms/Topbar";
import {
  getAboutTIGContent,
  saveAboutTIGContent,
  getAboutAICContent,
  saveAboutAICContent,
  type AboutTIGContent,
  type AboutAICContent,
  type TIGStat,
  type AICCard,
} from "@/lib/firestore";

export default function AboutPage() {
  const [loading, setLoading] = useState(true);
  const [savingTIG, setSavingTIG] = useState(false);
  const [savingAIC, setSavingAIC] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const lastSavedTigRef = useRef<string>("");
  const lastSavedAicRef = useRef<string>("");

  const [tigData, setTigData] = useState<AboutTIGContent>({
    sectionTag: "",
    title: "",
    subtitle: "",
    stats: [],
    foundedYear: "",
    foundedLabel: "",
    description1: "",
    description2: "",
  });

  const [aicData, setAicData] = useState<AboutAICContent>({
    sectionTag: "",
    heading: "",
    subtitle: "",
    cards: [],
  });

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [tig, aic] = await Promise.all([getAboutTIGContent(), getAboutAICContent()]);
        if (tig) {
          setTigData(tig);
          lastSavedTigRef.current = JSON.stringify(tig);
        }
        if (aic) {
          setAicData(aic);
          lastSavedAicRef.current = JSON.stringify(aic);
        }
      } catch (err) {
        console.error(err);
        showMessage("Failed to load content", "error");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const hasUnsavedChanges = !loading && (
    JSON.stringify(tigData) !== lastSavedTigRef.current ||
    JSON.stringify(aicData) !== lastSavedAicRef.current
  );

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


  const handleSaveTIG = async () => {
    setSavingTIG(true);
    try {
      await saveAboutTIGContent(tigData);
      lastSavedTigRef.current = JSON.stringify(tigData);
      showMessage("About TIG saved successfully", "success");
    } catch (err) {
      console.error(err);
      showMessage("Failed to save About TIG", "error");
    } finally {
      setSavingTIG(false);
    }
  };

  const handleSaveAIC = async () => {
    setSavingAIC(true);
    try {
      await saveAboutAICContent(aicData);
      lastSavedAicRef.current = JSON.stringify(aicData);
      showMessage("About AIC saved successfully", "success");
    } catch (err) {
      console.error(err);
      showMessage("Failed to save About AIC", "error");
    } finally {
      setSavingAIC(false);
    }
  };

  const addTigStat = () => {
    setTigData((prev) => ({
      ...prev,
      stats: [...prev.stats, { value: "", label: "" }],
    }));
  };

  const updateTigStat = (index: number, field: keyof TIGStat, val: string) => {
    const newStats = [...tigData.stats];
    newStats[index] = { ...newStats[index], [field]: val };
    setTigData({ ...tigData, stats: newStats });
  };

  const removeTigStat = (index: number) => {
    setTigData((prev) => ({
      ...prev,
      stats: prev.stats.filter((_, i) => i !== index),
    }));
  };

  const addAicCard = () => {
    setAicData((prev) => ({
      ...prev,
      cards: [...prev.cards, { icon: "", title: "", description: "" }],
    }));
  };

  const updateAicCard = (index: number, field: keyof AICCard, val: string) => {
    const newCards = [...aicData.cards];
    newCards[index] = { ...newCards[index], [field]: val };
    setAicData({ ...aicData, cards: newCards });
  };

  const removeAicCard = (index: number) => {
    setAicData((prev) => ({
      ...prev,
      cards: prev.cards.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Topbar title="About Sections" breadcrumb="About" />
        <main className="flex-1 px-8 py-8 flex items-center justify-center animate-fade-in">
          <div className="animate-pulse flex items-center gap-2 text-[var(--cms-muted)]">
            <span>⏳</span> Loading content...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="About Sections" breadcrumb="About" hasUnsavedChanges={hasUnsavedChanges} />

      {/* Message Bar */}
      {message && (
        <div
          className={`fixed top-20 right-8 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3 animate-fade-in ${
            message.type === "success"
              ? "bg-[var(--cms-success)] text-white"
              : "bg-[var(--cms-danger)] text-white"
          }`}
        >
          <span>{message.type === "success" ? "✓" : "⚠"}</span>
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <main className="flex-1 px-8 py-8 space-y-10 animate-fade-in">
        {/* About TIG Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[var(--cms-text)]">About TIG</h2>
              <p className="text-sm text-[var(--cms-muted)] mt-1">Manage Techno India Group details.</p>
            </div>
            <button
              id="save-tig-btn"
              onClick={handleSaveTIG}
              disabled={savingTIG}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all bg-[var(--cms-success)] hover:brightness-110 disabled:opacity-50"
            >
              <span>{savingTIG ? "⏳" : "💾"}</span>
              {savingTIG ? "Saving..." : "Save TIG Section"}
            </button>
          </div>

          <div className="cms-card p-6 rounded-xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="tig-tag" className="text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)]">
                  Section Tag
                </label>
                <input
                  id="tig-tag"
                  type="text"
                  className="cms-input w-full"
                  value={tigData.sectionTag}
                  onChange={(e) => setTigData({ ...tigData, sectionTag: e.target.value })}
                  placeholder="e.g. ABOUT TIG"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="tig-title" className="text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)]">
                  Title
                </label>
                <input
                  id="tig-title"
                  type="text"
                  className="cms-input w-full"
                  value={tigData.title}
                  onChange={(e) => setTigData({ ...tigData, title: e.target.value })}
                  placeholder="e.g. Our Legacy"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="tig-subtitle" className="text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)]">
                Subtitle
              </label>
              <input
                id="tig-subtitle"
                type="text"
                className="cms-input w-full"
                value={tigData.subtitle}
                onChange={(e) => setTigData({ ...tigData, subtitle: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="tig-founded" className="text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)]">
                  Founded Year
                </label>
                <input
                  id="tig-founded"
                  type="text"
                  className="cms-input w-full"
                  value={tigData.foundedYear}
                  onChange={(e) => setTigData({ ...tigData, foundedYear: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="tig-founded-label" className="text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)]">
                  Founded Label
                </label>
                <input
                  id="tig-founded-label"
                  type="text"
                  className="cms-input w-full"
                  value={tigData.foundedLabel}
                  onChange={(e) => setTigData({ ...tigData, foundedLabel: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="tig-desc1" className="text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)]">
                  Description 1
                </label>
                <textarea
                  id="tig-desc1"
                  rows={4}
                  className="cms-input w-full resize-none"
                  value={tigData.description1}
                  onChange={(e) => setTigData({ ...tigData, description1: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="tig-desc2" className="text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)]">
                  Description 2
                </label>
                <textarea
                  id="tig-desc2"
                  rows={4}
                  className="cms-input w-full resize-none"
                  value={tigData.description2}
                  onChange={(e) => setTigData({ ...tigData, description2: e.target.value })}
                />
              </div>
            </div>

            {/* TIG Stats */}
            <div className="space-y-4 pt-4 border-t border-[var(--cms-border)]">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[var(--cms-text)]">Statistics</h3>
                <button
                  id="add-tig-stat-btn"
                  onClick={addTigStat}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--cms-accent)] text-white text-xs font-semibold hover:bg-[var(--cms-accent-hover)] transition-colors"
                >
                  <span>+</span> Add Stat
                </button>
              </div>

              {tigData.stats.length === 0 ? (
                <p className="text-sm text-[var(--cms-muted)]">No stats added yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tigData.stats.map((stat, i) => (
                    <div key={i} className="flex flex-col gap-3 p-4 rounded-lg bg-[var(--cms-surface-2)] border border-[var(--cms-border)] relative">
                      <button
                        id={`remove-tig-stat-${i}`}
                        onClick={() => removeTigStat(i)}
                        className="absolute top-3 right-3 text-[var(--cms-muted)] hover:text-[var(--cms-danger)] transition-colors"
                        title="Remove Stat"
                      >
                        ✕
                      </button>
                      <div className="space-y-1 mt-2">
                        <label className="text-[10px] font-bold uppercase text-[var(--cms-muted)]">Value</label>
                        <input
                          id={`stat-val-${i}`}
                          type="text"
                          className="cms-input w-full text-sm"
                          value={stat.value}
                          onChange={(e) => updateTigStat(i, "value", e.target.value)}
                          placeholder="e.g. 500K+"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-[var(--cms-muted)]">Label</label>
                        <input
                          id={`stat-label-${i}`}
                          type="text"
                          className="cms-input w-full text-sm"
                          value={stat.label}
                          onChange={(e) => updateTigStat(i, "label", e.target.value)}
                          placeholder="e.g. Alumni"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* About AIC Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[var(--cms-text)]">About AIC</h2>
              <p className="text-sm text-[var(--cms-muted)] mt-1">Manage AIC features and overview.</p>
            </div>
            <button
              id="save-aic-btn"
              onClick={handleSaveAIC}
              disabled={savingAIC}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all bg-[var(--cms-success)] hover:brightness-110 disabled:opacity-50"
            >
              <span>{savingAIC ? "⏳" : "💾"}</span>
              {savingAIC ? "Saving..." : "Save AIC Section"}
            </button>
          </div>

          <div className="cms-card p-6 rounded-xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="aic-tag" className="text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)]">
                  Section Tag
                </label>
                <input
                  id="aic-tag"
                  type="text"
                  className="cms-input w-full"
                  value={aicData.sectionTag}
                  onChange={(e) => setAicData({ ...aicData, sectionTag: e.target.value })}
                  placeholder="e.g. ABOUT AIC"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="aic-heading" className="text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)]">
                  Heading
                </label>
                <input
                  id="aic-heading"
                  type="text"
                  className="cms-input w-full"
                  value={aicData.heading}
                  onChange={(e) => setAicData({ ...aicData, heading: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="aic-subtitle" className="text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)]">
                Subtitle
              </label>
              <textarea
                id="aic-subtitle"
                rows={2}
                className="cms-input w-full resize-none"
                value={aicData.subtitle}
                onChange={(e) => setAicData({ ...aicData, subtitle: e.target.value })}
              />
            </div>

            {/* AIC Cards */}
            <div className="space-y-4 pt-4 border-t border-[var(--cms-border)]">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[var(--cms-text)]">Feature Cards</h3>
                <button
                  id="add-aic-card-btn"
                  onClick={addAicCard}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--cms-accent)] text-white text-xs font-semibold hover:bg-[var(--cms-accent-hover)] transition-colors"
                >
                  <span>+</span> Add Card
                </button>
              </div>

              {aicData.cards.length === 0 ? (
                <p className="text-sm text-[var(--cms-muted)]">No feature cards added yet.</p>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {aicData.cards.map((card, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-lg bg-[var(--cms-surface-2)] border border-[var(--cms-border)] relative">
                      <button
                        id={`remove-aic-card-${i}`}
                        onClick={() => removeAicCard(i)}
                        className="absolute top-4 right-4 text-[var(--cms-muted)] hover:text-[var(--cms-danger)] transition-colors"
                        title="Remove Card"
                      >
                        ✕
                      </button>

                      <div className="flex flex-col gap-3 w-full pr-6">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-[var(--cms-muted)]">Icon (Emoji or text)</label>
                          <input
                            id={`card-icon-${i}`}
                            type="text"
                            className="cms-input w-full text-sm"
                            value={card.icon}
                            onChange={(e) => updateAicCard(i, "icon", e.target.value)}
                            placeholder="🚀"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-[var(--cms-muted)]">Title</label>
                          <input
                            id={`card-title-${i}`}
                            type="text"
                            className="cms-input w-full text-sm"
                            value={card.title}
                            onChange={(e) => updateAicCard(i, "title", e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-[var(--cms-muted)]">Description</label>
                          <textarea
                            id={`card-desc-${i}`}
                            rows={3}
                            className="cms-input w-full text-sm resize-none"
                            value={card.description}
                            onChange={(e) => updateAicCard(i, "description", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
