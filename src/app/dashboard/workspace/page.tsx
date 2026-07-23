"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/cms/Topbar";
import {
  getWorkspaceContent,
  saveWorkspaceContent,
  type WorkspaceContent,
  type WorkspacePlan,
} from "@/lib/firestore";

const DEFAULT_PLANS: WorkspacePlan[] = [
  { name: "Day Pass",       description: "Drop-in access for a single day", icon: "☀️" },
  { name: "Flexi Seat",     description: "Hot-desking on a weekly/monthly basis", icon: "🔄" },
  { name: "Dedicated Seat", description: "Your own reserved desk, full-time access", icon: "💺" },
  { name: "Virtual Office", description: "Business address + mail handling + meeting credits", icon: "🌐" },
  { name: "Meeting Rooms",  description: "Bookable meeting & boardroom spaces by the hour", icon: "🤝" },
  { name: "Lab Membership", description: "Access to AI & Product Lab, Fab Lab, and Media Studio", icon: "🔬" },
];

const DEFAULT_DATA: Omit<WorkspaceContent, "updatedAt"> = {
  title: "Workspace at AIC Techno",
  subtitle: "Flexible workspaces for founders, remote teams, and innovators in the heart of Kolkata",
  email: "contact@aic-techno.com",
  bookingUrl: "workspace-booking.html",
  bookingStatus: "Online booking coming soon",
  plans: DEFAULT_PLANS,
};

export default function WorkspacePage() {
  const [data, setData]       = useState<Omit<WorkspaceContent, "updatedAt">>(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [editPlanIdx, setEditPlanIdx] = useState<number | null>(null);
  const [planDraft, setPlanDraft]     = useState<WorkspacePlan | null>(null);
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [newPlan, setNewPlan]         = useState<WorkspacePlan>({ name: "", description: "", icon: "🏢" });

  useEffect(() => {
    getWorkspaceContent().then((d) => {
      if (d) setData({ title: d.title, subtitle: d.subtitle, email: d.email, bookingUrl: d.bookingUrl, bookingStatus: d.bookingStatus, plans: d.plans });
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
      await saveWorkspaceContent(data);
      showToast("Workspace content saved successfully");
    } catch (e) {
      showToast("Failed to save", "error");
      console.error(e);
    }
    setSaving(false);
  };

  const startEditPlan = (idx: number) => {
    setEditPlanIdx(idx);
    setPlanDraft({ ...data.plans[idx] });
  };

  const savePlanEdit = () => {
    if (editPlanIdx === null || !planDraft) return;
    const plans = [...data.plans];
    plans[editPlanIdx] = planDraft;
    setData((d) => ({ ...d, plans }));
    setEditPlanIdx(null);
    setPlanDraft(null);
  };

  const deletePlan = (idx: number) => {
    setData((d) => ({ ...d, plans: d.plans.filter((_, i) => i !== idx) }));
  };

  const addPlan = () => {
    if (!newPlan.name.trim()) return;
    setData((d) => ({ ...d, plans: [...d.plans, { ...newPlan }] }));
    setNewPlan({ name: "", description: "", icon: "🏢" });
    setShowAddPlan(false);
  };

  const movePlan = (idx: number, dir: -1 | 1) => {
    const plans = [...data.plans];
    const target = idx + dir;
    if (target < 0 || target >= plans.length) return;
    [plans[idx], plans[target]] = [plans[target], plans[idx]];
    setData((d) => ({ ...d, plans }));
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Topbar title="Workspace" breadcrumb="Workspace" />
        <div className="flex-1 flex items-center justify-center gap-3 text-[var(--cms-muted)]">
          <div className="w-6 h-6 border-2 border-[var(--cms-accent)] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading workspace content…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Workspace" breadcrumb="Workspace" />

      {toast && (
        <div className={`fixed top-4 right-4 px-4 py-2.5 rounded-lg shadow-xl z-50 text-sm font-semibold animate-fade-in flex items-center gap-2 ${
          toast.type === "success" ? "bg-[var(--cms-success)] text-white" : "bg-[var(--cms-danger)] text-white"
        }`}>
          {toast.type === "success" ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      {/* Edit Plan Modal */}
      {editPlanIdx !== null && planDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-[var(--cms-border)] flex items-center justify-between">
              <h2 className="text-sm font-black text-[var(--cms-text)]">Edit Workspace Plan</h2>
              <button onClick={() => setEditPlanIdx(null)} className="w-7 h-7 rounded-full bg-[var(--cms-surface-2)] flex items-center justify-center text-[var(--cms-muted)] hover:bg-[var(--cms-border)]">✕</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-[56px_1fr] gap-3">
                <div>
                  <label className="block text-[9px] font-extrabold uppercase tracking-widest text-[var(--cms-muted)] mb-1">Icon</label>
                  <input className="cms-input text-center text-xl" value={planDraft.icon} onChange={(e) => setPlanDraft({ ...planDraft, icon: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[9px] font-extrabold uppercase tracking-widest text-[var(--cms-muted)] mb-1">Plan Name *</label>
                  <input className="cms-input" value={planDraft.name} onChange={(e) => setPlanDraft({ ...planDraft, name: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-extrabold uppercase tracking-widest text-[var(--cms-muted)] mb-1">Description</label>
                <textarea className="cms-input resize-none" rows={2} value={planDraft.description} onChange={(e) => setPlanDraft({ ...planDraft, description: e.target.value })} />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[var(--cms-border)] bg-[var(--cms-surface-2)] rounded-b-2xl flex justify-end gap-3">
              <button onClick={() => setEditPlanIdx(null)} className="cms-btn-secondary px-4 py-2 text-xs">Cancel</button>
              <button onClick={savePlanEdit} className="cms-btn-primary px-4 py-2 text-xs">Save Plan</button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 px-8 py-8 space-y-6 animate-fade-in">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-[var(--cms-text)]">Workspace Section</h1>
            <p className="text-xs text-[var(--cms-muted)] mt-1">Manage the workspace booking section on the live website</p>
          </div>
          <button onClick={handleSave} disabled={saving} className="cms-btn-primary">
            {saving ? "Saving…" : "💾 Save All Changes"}
          </button>
        </div>

        {/* Section Info */}
        <div className="cms-card p-6 space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-[var(--cms-muted)]">Section Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-extrabold uppercase tracking-widest text-[var(--cms-muted)] mb-1">Section Title</label>
              <input className="cms-input" value={data.title} onChange={(e) => setData((d) => ({ ...d, title: e.target.value }))} />
            </div>
            <div>
              <label className="block text-[9px] font-extrabold uppercase tracking-widest text-[var(--cms-muted)] mb-1">Contact Email</label>
              <input className="cms-input" type="email" value={data.email} onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[9px] font-extrabold uppercase tracking-widest text-[var(--cms-muted)] mb-1">Subtitle</label>
              <textarea className="cms-input resize-none" rows={2} value={data.subtitle} onChange={(e) => setData((d) => ({ ...d, subtitle: e.target.value }))} />
            </div>
            <div>
              <label className="block text-[9px] font-extrabold uppercase tracking-widest text-[var(--cms-muted)] mb-1">Booking Page URL</label>
              <input className="cms-input" value={data.bookingUrl} onChange={(e) => setData((d) => ({ ...d, bookingUrl: e.target.value }))} placeholder="workspace-booking.html" />
            </div>
            <div>
              <label className="block text-[9px] font-extrabold uppercase tracking-widest text-[var(--cms-muted)] mb-1">Booking Status Badge</label>
              <input className="cms-input" value={data.bookingStatus} onChange={(e) => setData((d) => ({ ...d, bookingStatus: e.target.value }))} placeholder="Online booking coming soon" />
            </div>
          </div>
        </div>

        {/* Workspace Plans */}
        <div className="cms-card overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--cms-border)] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-[var(--cms-text)]">Workspace Plans</h2>
              <p className="text-xs text-[var(--cms-muted)] mt-0.5">{data.plans.length} plans · drag ↕ to reorder</p>
            </div>
            <button onClick={() => setShowAddPlan(true)} className="cms-btn-primary text-xs px-3 py-2">+ Add Plan</button>
          </div>

          {/* Add Plan inline form */}
          {showAddPlan && (
            <div className="px-6 py-4 bg-[var(--cms-accent-light)] border-b border-[var(--cms-border)] space-y-3">
              <p className="text-xs font-bold text-[var(--cms-accent)]">New Plan</p>
              <div className="grid grid-cols-[56px_1fr_1fr] gap-3">
                <div>
                  <label className="block text-[9px] font-extrabold uppercase tracking-widest text-[var(--cms-muted)] mb-1">Icon</label>
                  <input className="cms-input text-center text-xl" value={newPlan.icon} onChange={(e) => setNewPlan({ ...newPlan, icon: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[9px] font-extrabold uppercase tracking-widest text-[var(--cms-muted)] mb-1">Name *</label>
                  <input className="cms-input" placeholder="e.g. Hot Desk" value={newPlan.name} onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[9px] font-extrabold uppercase tracking-widest text-[var(--cms-muted)] mb-1">Description</label>
                  <input className="cms-input" placeholder="Short description" value={newPlan.description} onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowAddPlan(false)} className="cms-btn-secondary text-xs px-3 py-1.5">Cancel</button>
                <button onClick={addPlan} className="cms-btn-primary text-xs px-3 py-1.5">Add</button>
              </div>
            </div>
          )}

          <div className="divide-y divide-[var(--cms-border)]">
            {data.plans.map((plan, idx) => (
              <div key={idx} className="px-6 py-4 flex items-center gap-4 hover:bg-[var(--cms-surface-2)] transition-colors group">
                <span className="text-2xl w-10 text-center flex-shrink-0">{plan.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[var(--cms-text)]">{plan.name}</p>
                  <p className="text-xs text-[var(--cms-muted)] truncate">{plan.description}</p>
                </div>
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => movePlan(idx, -1)} disabled={idx === 0}
                    className="w-7 h-7 rounded-lg border border-[var(--cms-border)] bg-white text-[var(--cms-muted)] hover:text-[var(--cms-text)] flex items-center justify-center disabled:opacity-30 transition-colors text-xs font-bold">↑</button>
                  <button onClick={() => movePlan(idx, 1)} disabled={idx === data.plans.length - 1}
                    className="w-7 h-7 rounded-lg border border-[var(--cms-border)] bg-white text-[var(--cms-muted)] hover:text-[var(--cms-text)] flex items-center justify-center disabled:opacity-30 transition-colors text-xs font-bold">↓</button>
                  <button onClick={() => startEditPlan(idx)}
                    className="w-7 h-7 rounded-lg border border-[var(--cms-border)] bg-white text-[var(--cms-muted)] hover:text-[var(--cms-accent)] hover:border-[var(--cms-accent)] flex items-center justify-center transition-colors text-xs">✎</button>
                  <button onClick={() => deletePlan(idx)}
                    className="w-7 h-7 rounded-lg border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors text-xs">✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview card */}
        <div className="cms-card p-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-[var(--cms-muted)] mb-4">Live Preview</h2>
          <div className="bg-[#0D0D0D] rounded-xl p-6 text-white">
            <div className="text-center mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-white/40 border border-white/20 px-3 py-1 rounded-full">{data.bookingStatus}</span>
              <h3 className="text-xl font-black mt-3">{data.title}</h3>
              <p className="text-sm text-white/60 mt-2 max-w-lg mx-auto">{data.subtitle}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {data.plans.map((p, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <span className="text-2xl">{p.icon}</span>
                  <p className="text-sm font-bold mt-2">{p.name}</p>
                  <p className="text-xs text-white/50 mt-1">{p.description}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-white/40 mt-4">{data.email}</p>
          </div>
        </div>

      </main>
    </div>
  );
}
