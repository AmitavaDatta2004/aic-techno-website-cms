"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/cms/Topbar";
import {
  getBack2BengalContent,
  saveBack2BengalContent,
  type Back2BengalContent,
  type B2BCard,
} from "@/lib/firestore";

export default function Back2BengalPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [data, setData] = useState<Omit<Back2BengalContent, "updatedAt">>({
    heroTitle: "",
    heroSubtitle: "",
    heroBadge: "",
    heroDescription: "",
    sections: [],
    cards: [],
  });

  useEffect(() => {
    async function loadData() {
      try {
        const content = await getBack2BengalContent();
        if (content) {
          // Destructure to remove updatedAt if present
          const { updatedAt: _updatedAt, ...rest } = content as Back2BengalContent;
          setData(rest);
        } else {
          setData({
            heroTitle: "Back 2 Bengal",
            heroSubtitle: "Empowering Local Innovations",
            heroBadge: "Initiative",
            heroDescription: "Bringing talents back to the state to foster growth.",
            sections: [],
            cards: [],
          });
        }
      } catch (err) {
        console.error("Error loading Back2Bengal content:", err);
        setMessage({ type: "error", text: "Failed to load content." });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await saveBack2BengalContent(data);
      setMessage({ type: "success", text: "Changes saved successfully." });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("Error saving Back2Bengal content:", err);
      setMessage({ type: "error", text: "Failed to save changes." });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof typeof data, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const addSection = () => {
    setData((prev) => ({
      ...prev,
      sections: [...prev.sections, { title: "", body: "" }],
    }));
  };

  const updateSection = (index: number, field: "title" | "body", value: string) => {
    setData((prev) => {
      const newSections = [...prev.sections];
      newSections[index] = { ...newSections[index], [field]: value };
      return { ...prev, sections: newSections };
    });
  };

  const removeSection = (index: number) => {
    setData((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));
  };

  const addCard = () => {
    setData((prev) => ({
      ...prev,
      cards: [...prev.cards, { icon: "", title: "", description: "" }],
    }));
  };

  const updateCard = (index: number, field: keyof B2BCard, value: string) => {
    setData((prev) => {
      const newCards = [...prev.cards];
      newCards[index] = { ...newCards[index], [field]: value };
      return { ...prev, cards: newCards };
    });
  };

  const removeCard = (index: number) => {
    setData((prev) => ({
      ...prev,
      cards: prev.cards.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Topbar title="Back 2 Bengal" breadcrumb="Back 2 Bengal" />
        <main className="flex-1 px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-40 bg-[var(--cms-surface)] rounded-xl"></div>
            <div className="h-64 bg-[var(--cms-surface)] rounded-xl"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Back 2 Bengal" breadcrumb="Back 2 Bengal" />
      <main className="flex-1 px-8 py-8 space-y-6 animate-fade-in pb-24">
        
        {/* Toast Message */}
        {message && (
          <div
            className={`p-4 rounded-xl text-sm font-medium ${
              message.type === "success"
                ? "bg-[var(--cms-success)] text-white"
                : "bg-[var(--cms-danger)] text-white"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Hero Section */}
        <div className="cms-card p-6 rounded-xl space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--cms-muted)] mb-4">
            Hero Section
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="heroBadge" className="text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)]">
                Badge
              </label>
              <input
                id="heroBadge"
                className="cms-input w-full"
                value={data.heroBadge}
                onChange={(e) => updateField("heroBadge", e.target.value)}
                placeholder="e.g. Initiative"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="heroTitle" className="text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)]">
                Title
              </label>
              <input
                id="heroTitle"
                className="cms-input w-full"
                value={data.heroTitle}
                onChange={(e) => updateField("heroTitle", e.target.value)}
                placeholder="e.g. Back 2 Bengal"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="heroSubtitle" className="text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)]">
              Subtitle
            </label>
            <input
              id="heroSubtitle"
              className="cms-input w-full"
              value={data.heroSubtitle}
              onChange={(e) => updateField("heroSubtitle", e.target.value)}
              placeholder="e.g. Empowering Local Innovations"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="heroDescription" className="text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)]">
              Description
            </label>
            <textarea
              id="heroDescription"
              className="cms-input w-full min-h-[100px]"
              value={data.heroDescription}
              onChange={(e) => updateField("heroDescription", e.target.value)}
            />
          </div>
        </div>

        {/* Sections */}
        <div className="cms-card p-6 rounded-xl space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--cms-muted)]">
              Content Sections
            </h2>
            <button
              onClick={addSection}
              className="px-4 py-2 bg-[var(--cms-accent)] hover:bg-[var(--cms-accent-hover)] rounded-lg text-sm font-semibold transition-colors text-white"
            >
              + Add Section
            </button>
          </div>

          {data.sections.length === 0 ? (
            <p className="text-sm text-[var(--cms-text-2)]">No sections added yet.</p>
          ) : (
            <div className="space-y-6">
              {data.sections.map((section, index) => (
                <div key={index} className="p-4 bg-[var(--cms-surface-2)] rounded-lg border border-[var(--cms-border)] space-y-4 relative">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-[var(--cms-text-2)]">Section {index + 1}</span>
                    <button
                      onClick={() => removeSection(index)}
                      className="px-3 py-1 bg-[var(--cms-danger)] hover:opacity-90 rounded-md text-xs font-semibold text-white transition-opacity"
                    >
                      Delete
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor={`section-title-${index}`} className="text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)]">
                      Title
                    </label>
                    <input
                      id={`section-title-${index}`}
                      className="cms-input w-full"
                      value={section.title}
                      onChange={(e) => updateSection(index, "title", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor={`section-body-${index}`} className="text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)]">
                      Body
                    </label>
                    <textarea
                      id={`section-body-${index}`}
                      className="cms-input w-full min-h-[100px]"
                      value={section.body}
                      onChange={(e) => updateSection(index, "body", e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Initiative Cards */}
        <div className="cms-card p-6 rounded-xl space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--cms-muted)]">
              Initiative Cards
            </h2>
            <button
              onClick={addCard}
              className="px-4 py-2 bg-[var(--cms-accent)] hover:bg-[var(--cms-accent-hover)] rounded-lg text-sm font-semibold transition-colors text-white"
            >
              + Add Card
            </button>
          </div>

          {data.cards.length === 0 ? (
            <p className="text-sm text-[var(--cms-text-2)]">No cards added yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.cards.map((card, index) => (
                <div key={index} className="p-4 bg-[var(--cms-surface-2)] rounded-lg border border-[var(--cms-border)] space-y-4 relative">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-[var(--cms-text-2)]">Card {index + 1}</span>
                    <button
                      onClick={() => removeCard(index)}
                      className="px-3 py-1 bg-[var(--cms-danger)] hover:opacity-90 rounded-md text-xs font-semibold text-white transition-opacity"
                    >
                      Delete
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor={`card-icon-${index}`} className="text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)]">
                      Icon Name
                    </label>
                    <input
                      id={`card-icon-${index}`}
                      className="cms-input w-full"
                      value={card.icon}
                      onChange={(e) => updateCard(index, "icon", e.target.value)}
                      placeholder="e.g. MapPin, Users"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor={`card-title-${index}`} className="text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)]">
                      Title
                    </label>
                    <input
                      id={`card-title-${index}`}
                      className="cms-input w-full"
                      value={card.title}
                      onChange={(e) => updateCard(index, "title", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor={`card-desc-${index}`} className="text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)]">
                      Description
                    </label>
                    <textarea
                      id={`card-desc-${index}`}
                      className="cms-input w-full min-h-[80px]"
                      value={card.description}
                      onChange={(e) => updateCard(index, "description", e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save Bar */}
        <div className="fixed bottom-0 left-[240px] right-0 p-4 bg-[var(--cms-surface)] border-t border-[var(--cms-border)] flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-6 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${
              saving
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-[var(--cms-success)] hover:opacity-90"
            }`}
          >
            {saving ? "Saving..." : "Save All Changes"}
          </button>
        </div>
      </main>
    </div>
  );
}
