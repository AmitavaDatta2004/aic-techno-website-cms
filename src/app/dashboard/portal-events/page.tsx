"use client";
// src/app/dashboard/portal-events/page.tsx
// Startup Portal — events shown to every registered startup on their timeline.

import { useEffect, useState } from "react";
import { Topbar } from "@/components/cms/Topbar";
import {
  subscribePortalEvents,
  addPortalEvent,
  updatePortalEvent,
  deletePortalEvent,
  type PortalEvent,
} from "@/lib/firestore";
import {
  Toast,
  Toggle,
  DeleteConfirmModal,
  toLocalInput,
  fromLocalInput,
  formatDateTime,
  isHttpUrl,
  labelCls,
  thCls,
  editBtnCls,
  deleteBtnCls,
  primaryBtnCls,
} from "@/components/cms/portal";
import { X } from "lucide-react";

const emptyForm = {
  title: "",
  startAt: "",
  endAt: "",
  location: "",
  link: "",
  linkLabel: "",
  description: "",
  active: true,
};

export default function PortalEventsPage() {
  const [events, setEvents] = useState<PortalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<PortalEvent | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [now] = useState(() => Date.now()); // for the "Past" label

  useEffect(() => {
    const unsub = subscribePortalEvents((data) => {
      setEvents(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenModal = (ev?: PortalEvent) => {
    if (ev) {
      setEditingId(ev.id);
      setFormData({
        title: ev.title ?? "",
        startAt: toLocalInput(ev.startAt),
        endAt: toLocalInput(ev.endAt),
        location: ev.location ?? "",
        link: ev.link ?? "",
        linkLabel: ev.linkLabel ?? "",
        description: ev.description ?? "",
        active: ev.active ?? true,
      });
    } else {
      setEditingId(null);
      setFormData(emptyForm);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    const startAt = fromLocalInput(formData.startAt);
    const endAt = fromLocalInput(formData.endAt);
    if (!formData.title.trim() || !startAt) {
      showToast("Title and start date & time are required", "error");
      return;
    }
    if (endAt && endAt.toMillis() < startAt.toMillis()) {
      showToast("The event can't end before it starts", "error");
      return;
    }
    if (formData.link.trim() && !isHttpUrl(formData.link.trim())) {
      showToast("Link must start with https://", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        startAt,
        endAt,
        location: formData.location.trim(),
        link: formData.link.trim(),
        linkLabel: formData.linkLabel.trim(),
        description: formData.description.trim(),
        active: formData.active,
      };
      if (editingId) {
        await updatePortalEvent(editingId, payload);
        showToast("Event updated");
      } else {
        await addPortalEvent(payload);
        showToast("Event posted to the Startup Portal");
      }
      handleCloseModal();
    } catch (error) {
      console.error(error);
      showToast("Error saving event", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (ev: PortalEvent) => {
    try {
      await updatePortalEvent(ev.id, { active: !ev.active });
      showToast(`Event ${ev.active ? "hidden from" : "shown to"} startups`);
    } catch (error) {
      console.error(error);
      showToast("Error toggling status", "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePortalEvent(deleteTarget.id);
      showToast("Event deleted");
    } catch (error) {
      console.error(error);
      showToast("Error deleting event", "error");
    }
    setDeleting(false);
    setDeleteTarget(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Portal Events" breadcrumb="Startup Portal" />
      <Toast toast={toast} />

      {deleteTarget && (
        <DeleteConfirmModal noun="Event" title={deleteTarget.title} onCancel={() => setDeleteTarget(null)} onConfirm={handleConfirmDelete} deleting={deleting} />
      )}

      <main className="flex-1 px-8 py-8 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--cms-text)]">Portal Events</h1>
            <p className="text-sm text-[var(--cms-text-2)] mt-1">
              Events appear on every registered startup&apos;s timeline. Switch one off to hide it without deleting.
            </p>
          </div>
          <button onClick={() => handleOpenModal()} className={`${primaryBtnCls} shrink-0`}>+ Add Event</button>
        </div>

        <div className="cms-card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-[var(--cms-muted)]">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="p-8 text-center text-[var(--cms-muted)]">No events yet. Click &quot;Add Event&quot; to post the first one.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--cms-border)] bg-[var(--cms-surface-2)]">
                    <th className={thCls}>When</th>
                    <th className={thCls}>Event</th>
                    <th className={thCls}>Location</th>
                    <th className={thCls}>Visible</th>
                    <th className={`${thCls} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--cms-border)]">
                  {events.map((ev) => {
                    const end = ev.endAt ?? ev.startAt;
                    const past = end ? end.toMillis() < now : false;
                    return (
                      <tr key={ev.id} className={`hover:bg-[var(--cms-surface-2)] transition-colors ${ev.active ? "" : "opacity-60"}`}>
                        <td className="p-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-[var(--cms-text)]">{formatDateTime(ev.startAt)}</div>
                          {ev.endAt && <div className="text-xs text-[var(--cms-muted)] mt-0.5">to {formatDateTime(ev.endAt)}</div>}
                          {past && <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--cms-muted)] mt-1">Past</div>}
                        </td>
                        <td className="p-4 max-w-[320px]">
                          <div className="text-sm font-bold text-[var(--cms-text)]">{ev.title}</div>
                          {ev.description && <div className="text-xs text-[var(--cms-muted)] mt-0.5 line-clamp-2">{ev.description}</div>}
                          {ev.link && (
                            <a href={ev.link} target="_blank" rel="noopener noreferrer" className="block text-xs font-medium text-[var(--cms-accent)] hover:underline mt-0.5">
                              {ev.linkLabel || "Link"} ↗
                            </a>
                          )}
                        </td>
                        <td className="p-4 text-sm text-[var(--cms-text-2)]">{ev.location || <span className="text-[var(--cms-muted)]">—</span>}</td>
                        <td className="p-4"><Toggle on={ev.active} onClick={() => toggleActive(ev)} /></td>
                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                          <button onClick={() => handleOpenModal(ev)} className={editBtnCls}>Edit</button>
                          <button onClick={() => setDeleteTarget(ev)} className={deleteBtnCls}>Delete</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--cms-surface)] border border-[var(--cms-border)] w-full max-w-lg rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-[var(--cms-border)] flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--cms-text)]">{editingId ? "Edit Event" : "Add Event"}</h2>
              <button onClick={handleCloseModal} className="p-1 rounded-full hover:bg-[var(--cms-surface-2)] transition-colors cursor-pointer">
                <X className="w-5 h-5 text-[var(--cms-muted)]" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="space-y-1">
                <label className={labelCls}>Title *</label>
                <input type="text" className="cms-input w-full" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Founders Friday: Fundraising 101" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelCls}>Starts *</label>
                  <input type="datetime-local" className="cms-input w-full" value={formData.startAt} onChange={(e) => setFormData({ ...formData, startAt: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Ends</label>
                  <input type="datetime-local" className="cms-input w-full" value={formData.endAt} onChange={(e) => setFormData({ ...formData, endAt: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Location</label>
                <input type="text" className="cms-input w-full" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="AIC Techno, Offbeat CCU / Online" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1 col-span-2">
                  <label className={labelCls}>Link</label>
                  <input type="url" className="cms-input w-full" value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} placeholder="https://… (registration / details)" />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Button Text</label>
                  <input type="text" className="cms-input w-full" value={formData.linkLabel} onChange={(e) => setFormData({ ...formData, linkLabel: e.target.value })} placeholder="Register" />
                </div>
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Description</label>
                <textarea className="cms-input w-full min-h-[90px]" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="flex items-center space-x-3 pt-2">
                <Toggle on={formData.active} onClick={() => setFormData({ ...formData, active: !formData.active })} />
                <span className="text-sm font-medium text-[var(--cms-text-2)]">{formData.active ? "Visible to startups" : "Hidden from startups"}</span>
              </div>
            </div>

            <div className="p-6 border-t border-[var(--cms-border)] bg-[var(--cms-surface-2)] flex justify-end space-x-4 rounded-b-xl">
              <button onClick={handleCloseModal} className="px-4 py-2 rounded-lg text-sm font-semibold text-[var(--cms-text-2)] transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--cms-success)] hover:bg-green-600 transition-colors cursor-pointer disabled:opacity-60">
                {saving ? "Saving…" : editingId ? "Save Changes" : "Add Event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
