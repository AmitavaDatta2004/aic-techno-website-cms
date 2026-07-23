"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/cms/Topbar";
import {
  getApplyContent,
  saveApplyContent,
  type ApplyContent,
  type ApplyStage,
} from "@/lib/firestore";

const DEFAULT_DATA: Omit<ApplyContent, "updatedAt"> = {
  title: "Apply to AIC Techno",
  subtitle: "Choose your stage and take the next step in your startup journey",
  stages: [
    {
      stage: 1,
      title: "Pre-Incubation",
      description: "For early-stage ideas and founders validating their concept. Get access to mentorship, workshops, and co-working space.",
      applyUrl: "https://forms.gle/pVnKUPgfkyxPjhpTA",
      icon: "",
    },
    {
      stage: 2,
      title: "Incubation",
      description: "For startups with an MVP ready to scale. Access seed funding, investor connects, and dedicated incubation support.",
      applyUrl: "https://forms.gle/GERw6k6WYNAMcdZ87",
      icon: "",
    },
    {
      stage: 3,
      title: "Scale-Up",
      description: "For growth-stage startups ready to expand markets, raise Series A, and build their team.",
      applyUrl: "https://forms.gle/GxNbFg71CtuiNA9p7",
      icon: "",
    },
  ],
};

const STAGE_COLORS = ["#800020", "#1E40AF", "#065F46"];

export default function ApplyPage() {
  const [data, setData]       = useState<Omit<ApplyContent, "updatedAt">>(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [editIdx, setEditIdx]   = useState<number | null>(null);
  const [stageDraft, setStageDraft] = useState<ApplyStage | null>(null);
  const [showAdd, setShowAdd]   = useState(false);
  const [newStage, setNewStage] = useState<Omit<ApplyStage, "stage">>({
    title: "", description: "", applyUrl: "", icon: "",
  });

  useEffect(() => {
    getApplyContent().then((d) => {
      if (d) setData({ title: d.title, subtitle: d.subtitle, stages: d.stages });
      setLoading(false);
    });
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveApplyContent(data);
      showToast("Apply section saved successfully");
    } catch (e) {
      showToast("Failed to save", "error");
      console.error(e);
    }
    setSaving(false);
  };

  const startEdit = (idx: number) => {
    setEditIdx(idx);
    setStageDraft({ ...data.stages[idx] });
  };

  const saveEdit = () => {
    if (editIdx === null || !stageDraft) return;
    const stages = [...data.stages];
    stages[editIdx] = stageDraft;
    setData((d) => ({ ...d, stages }));
    setEditIdx(null);
    setStageDraft(null);
  };

  const deleteStage = (idx: number) => {
    setData((d) => ({
      ...d,
      stages: d.stages.filter((_, i) => i !== idx).map((s, i) => ({ ...s, stage: i + 1 })),
    }));
  };

  const addStage = () => {
    if (!newStage.title.trim()) return;
    const stage: ApplyStage = {
      stage: data.stages.length + 1,
      ...newStage,
    };
    setData((d) => ({ ...d, stages: [...d.stages, stage] }));
    setNewStage({ title: "", description: "", applyUrl: "", icon: "" });
    setShowAdd(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Topbar title="Apply Stages" breadcrumb="Apply Stages" />
        <div className="flex-1 flex items-center justify-center gap-3 text-[var(--cms-muted)]">
          <div className="w-6 h-6 border-2 border-[var(--cms-accent)] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading apply content…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Apply Stages" breadcrumb="Apply Stages" />

      {toast && (
        <div className={`fixed top-4 right-4 px-4 py-2.5 rounded-lg shadow-xl z-50 text-sm font-semibold animate-fade-in flex items-center gap-2 ${
          toast.type === "success" ? "bg-[var(--cms-success)] text-white" : "bg-[var(--cms-danger)] text-white"
        }`}>
          {toast.type === "success" ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      {/* Edit Stage Modal */}
      {editIdx !== null && stageDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-[var(--cms-border)] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-[var(--cms-text)]">Edit Stage {stageDraft.stage}</h2>
                <p className="text-[10px] text-[var(--cms-muted)] mt-0.5">Changes reflect live on the website after saving</p>
              </div>
              <button onClick={() => setEditIdx(null)} className="w-7 h-7 rounded-full bg-[var(--cms-surface-2)] flex items-center justify-center text-[var(--cms-muted)] hover:bg-[var(--cms-border)]">✕</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-[9px] font-extrabold uppercase tracking-widest text-[var(--cms-muted)] mb-1">Stage Title *</label>
                <input className="cms-input" value={stageDraft.title} onChange={(e) => setStageDraft({ ...stageDraft, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-[9px] font-extrabold uppercase tracking-widest text-[var(--cms-muted)] mb-1">Description</label>
                <textarea className="cms-input resize-none" rows={3} value={stageDraft.description} onChange={(e) => setStageDraft({ ...stageDraft, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-[9px] font-extrabold uppercase tracking-widest text-[var(--cms-muted)] mb-1">Google Form / Apply URL *</label>
                <input className="cms-input font-mono text-xs" type="url" placeholder="https://forms.gle/..." value={stageDraft.applyUrl} onChange={(e) => setStageDraft({ ...stageDraft, applyUrl: e.target.value })} />
                {stageDraft.applyUrl && (
                  <a href={stageDraft.applyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-[var(--cms-accent)] hover:underline mt-1">
                    ↗ Open form link
                  </a>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[var(--cms-border)] bg-[var(--cms-surface-2)] rounded-b-2xl flex justify-end gap-3">
              <button onClick={() => setEditIdx(null)} className="cms-btn-secondary text-xs px-4 py-2">Cancel</button>
              <button onClick={saveEdit} className="cms-btn-primary text-xs px-4 py-2">Save Stage</button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 px-8 py-8 space-y-6 animate-fade-in">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-[var(--cms-text)]">Apply / Incubation Stages</h1>
            <p className="text-xs text-[var(--cms-muted)] mt-1">Manage the 3-stage application section and Google Form links</p>
          </div>
          <button onClick={handleSave} disabled={saving} className="cms-btn-primary">
            {saving ? "Saving…" : "💾 Save All Changes"}
          </button>
        </div>

        {/* Section Header fields */}
        <div className="cms-card p-6 space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-[var(--cms-muted)]">Section Header</h2>
          <div>
            <label className="block text-[9px] font-extrabold uppercase tracking-widest text-[var(--cms-muted)] mb-1">Title</label>
            <input className="cms-input" value={data.title} onChange={(e) => setData((d) => ({ ...d, title: e.target.value }))} />
          </div>
          <div>
            <label className="block text-[9px] font-extrabold uppercase tracking-widest text-[var(--cms-muted)] mb-1">Subtitle</label>
            <textarea className="cms-input resize-none" rows={2} value={data.subtitle} onChange={(e) => setData((d) => ({ ...d, subtitle: e.target.value }))} />
          </div>
        </div>

        {/* Stages */}
        <div className="cms-card overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--cms-border)] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-[var(--cms-text)]">Application Stages</h2>
              <p className="text-xs text-[var(--cms-muted)] mt-0.5">{data.stages.length} stages</p>
            </div>
            <button onClick={() => setShowAdd(true)} className="cms-btn-primary text-xs px-3 py-2">+ Add Stage</button>
          </div>

          {/* Add Stage inline form */}
          {showAdd && (
            <div className="px-6 py-4 bg-[var(--cms-accent-light)] border-b border-[var(--cms-border)] space-y-3">
              <p className="text-xs font-bold text-[var(--cms-accent)]">New Stage</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-[9px] font-extrabold uppercase tracking-widest text-[var(--cms-muted)] mb-1">Title *</label>
                  <input className="cms-input" placeholder="e.g. Pre-Incubation" value={newStage.title} onChange={(e) => setNewStage({ ...newStage, title: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[9px] font-extrabold uppercase tracking-widest text-[var(--cms-muted)] mb-1">Description</label>
                  <textarea className="cms-input resize-none" rows={2} placeholder="Who this stage is for…" value={newStage.description} onChange={(e) => setNewStage({ ...newStage, description: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[9px] font-extrabold uppercase tracking-widest text-[var(--cms-muted)] mb-1">Google Form URL</label>
                  <input className="cms-input font-mono text-xs" type="url" placeholder="https://forms.gle/..." value={newStage.applyUrl} onChange={(e) => setNewStage({ ...newStage, applyUrl: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowAdd(false)} className="cms-btn-secondary text-xs px-3 py-1.5">Cancel</button>
                <button onClick={addStage} className="cms-btn-primary text-xs px-3 py-1.5">Add Stage</button>
              </div>
            </div>
          )}

          <div className="divide-y divide-[var(--cms-border)]">
            {data.stages.map((stage, idx) => {
              const color = STAGE_COLORS[idx] ?? "#555555";
              return (
                <div key={idx} className="p-6 hover:bg-[var(--cms-surface-2)] transition-colors group">
                  <div className="flex items-start gap-5">
                    {/* Stage number */}
                <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-black shadow-md"
                      style={{ background: `linear-gradient(135deg, ${color}, ${color}CC)` }}>
                      <span className="text-sm font-black">{stage.stage}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: color + "18", color }}>
                          Stage {stage.stage}
                        </span>
                        <h3 className="text-sm font-black text-[var(--cms-text)]">{stage.title}</h3>
                      </div>
                      <p className="text-xs text-[var(--cms-text-2)] leading-relaxed">{stage.description}</p>

                      {/* Form link */}
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--cms-muted)]">Apply URL:</span>
                        {stage.applyUrl ? (
                          <a href={stage.applyUrl} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-[var(--cms-accent)] hover:underline font-mono truncate max-w-xs">
                            {stage.applyUrl}
                          </a>
                        ) : (
                          <span className="text-xs text-[var(--cms-muted)] italic">No URL set — click Edit to add</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button onClick={() => startEdit(idx)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-[var(--cms-border)] bg-white text-[var(--cms-text-2)] hover:border-[var(--cms-accent)] hover:text-[var(--cms-accent)] transition-colors">
                        ✎ Edit
                      </button>
                      {data.stages.length > 1 && (
                        <button onClick={() => deleteStage(idx)}
                          className="w-8 h-8 rounded-lg border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors text-xs">
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}
