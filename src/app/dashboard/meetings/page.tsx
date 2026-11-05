"use client";
// src/app/dashboard/meetings/page.tsx
// Startup Portal — meetings scheduled with one startup (only that startup sees them).

import { useEffect, useMemo, useState } from "react";
import { Topbar } from "@/components/cms/Topbar";
import {
  subscribeMeetings,
  subscribeStartups,
  addMeeting,
  updateMeeting,
  deleteMeeting,
  type Meeting,
  type Startup,
} from "@/lib/firestore";
import {
  Toast,
  DeleteConfirmModal,
  toLocalInput,
  fromLocalInput,
  formatDateTime,
  isHttpUrl,
  labelCls,
  thCls,
  editBtnCls,
  neutralBtnCls,
  deleteBtnCls,
  primaryBtnCls,
} from "@/components/cms/portal";
import { X } from "lucide-react";

type Status = Meeting["status"];
type Mode = NonNullable<Meeting["mode"]>;

const emptyForm = {
  startupEmail: "",
  title: "Mentoring session",
  startAt: "",
  durationMins: 30,
  mode: "In person" as Mode,
  location: "",
  meetingLink: "",
  host: "",
  agenda: "",
  status: "scheduled" as Status,
};

const STATUS_STYLE: Record<Status, string> = {
  scheduled: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-[var(--cms-surface-2)] text-[var(--cms-text-2)] border-[var(--cms-border)]",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [view, setView] = useState<"upcoming" | "past" | "all">("upcoming");
  const [startupFilter, setStartupFilter] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Meeting | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [now] = useState(() => Date.now()); // splits upcoming / past

  useEffect(() => {
    const unsubM = subscribeMeetings((data) => {
      setMeetings(data);
      setLoading(false);
    });
    const unsubS = subscribeStartups(setStartups);
    return () => {
      unsubM();
      unsubS();
    };
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const visible = useMemo(() => {
    const list = meetings.filter((m) => {
      if (startupFilter && m.startupEmail !== startupFilter) return false;
      const t = m.startAt ? m.startAt.toMillis() : 0;
      if (view === "upcoming") return t >= now - 60 * 60 * 1000;
      if (view === "past") return t < now - 60 * 60 * 1000;
      return true;
    });
    // Upcoming reads soonest-first; past and all read newest-first.
    if (view === "upcoming") list.sort((a, b) => a.startAt.toMillis() - b.startAt.toMillis());
    return list;
  }, [meetings, view, startupFilter, now]);

  const handleOpenModal = (m?: Meeting) => {
    if (m) {
      setEditingId(m.id);
      setFormData({
        startupEmail: m.startupEmail ?? "",
        title: m.title ?? "",
        startAt: toLocalInput(m.startAt),
        durationMins: m.durationMins ?? 30,
        mode: m.mode ?? "In person",
        location: m.location ?? "",
        meetingLink: m.meetingLink ?? "",
        host: m.host ?? "",
        agenda: m.agenda ?? "",
        status: m.status ?? "scheduled",
      });
    } else {
      setEditingId(null);
      setFormData({ ...emptyForm, startupEmail: startupFilter });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    const startAt = fromLocalInput(formData.startAt);
    if (!formData.startupEmail || !formData.title.trim() || !startAt) {
      showToast("Startup, title and date & time are required", "error");
      return;
    }
    if (formData.meetingLink.trim() && !isHttpUrl(formData.meetingLink.trim())) {
      showToast("Meeting link must start with https://", "error");
      return;
    }
    setSaving(true);
    try {
      const startup = startups.find((s) => s.id === formData.startupEmail);
      const payload = {
        startupEmail: formData.startupEmail,
        startupName: startup?.name ?? "",
        title: formData.title.trim(),
        startAt,
        durationMins: Number(formData.durationMins) || 30,
        mode: formData.mode,
        location: formData.location.trim(),
        meetingLink: formData.meetingLink.trim(),
        host: formData.host.trim(),
        agenda: formData.agenda.trim(),
        status: formData.status,
      };
      if (editingId) {
        await updateMeeting(editingId, payload);
        showToast("Meeting updated");
      } else {
        await addMeeting(payload);
        showToast(`Meeting scheduled — ${payload.startupName || payload.startupEmail} will see it on their portal`);
      }
      handleCloseModal();
    } catch (error) {
      console.error(error);
      showToast("Error saving meeting", "error");
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (m: Meeting, status: Status) => {
    try {
      await updateMeeting(m.id, { status });
      showToast(`Meeting marked ${status}`);
    } catch (error) {
      console.error(error);
      showToast("Error updating meeting", "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteMeeting(deleteTarget.id);
      showToast("Meeting deleted");
    } catch (error) {
      console.error(error);
      showToast("Error deleting meeting", "error");
    }
    setDeleting(false);
    setDeleteTarget(null);
  };

  // Inactive startups stay selectable only for the meeting already linked to them.
  const startupOptions = startups.filter((s) => s.active || s.id === formData.startupEmail);

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Meetings" breadcrumb="Startup Portal" />
      <Toast toast={toast} />

      {deleteTarget && (
        <DeleteConfirmModal
          noun="Meeting"
          title={`${deleteTarget.title} with ${deleteTarget.startupName || deleteTarget.startupEmail}`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
          deleting={deleting}
        />
      )}

      <main className="flex-1 px-8 py-8 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--cms-text)]">Startup Meetings</h1>
            <p className="text-sm text-[var(--cms-text-2)] mt-1">
              Meetings are private — each startup only sees the meetings scheduled with them, on their portal timeline.
            </p>
          </div>
          <button onClick={() => handleOpenModal()} disabled={!startups.length} className={`${primaryBtnCls} shrink-0`}>
            + Schedule Meeting
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg border border-[var(--cms-border)] overflow-hidden bg-white">
            {(["upcoming", "past", "all"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 text-xs font-bold capitalize cursor-pointer transition-colors ${
                  view === v ? "bg-[var(--cms-accent)] text-white" : "text-[var(--cms-text-2)] hover:bg-[var(--cms-surface-2)]"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <select className="cms-input max-w-xs" value={startupFilter} onChange={(e) => setStartupFilter(e.target.value)}>
            <option value="">All startups</option>
            {startups.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="cms-card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-[var(--cms-muted)]">Loading meetings...</div>
          ) : !startups.length ? (
            <div className="p-8 text-center text-[var(--cms-muted)]">Register a startup first (Startup Portal → Startups) to schedule meetings with them.</div>
          ) : visible.length === 0 ? (
            <div className="p-8 text-center text-[var(--cms-muted)]">No {view === "all" ? "" : view} meetings.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--cms-border)] bg-[var(--cms-surface-2)]">
                    <th className={thCls}>When</th>
                    <th className={thCls}>Startup</th>
                    <th className={thCls}>Meeting</th>
                    <th className={thCls}>Mode</th>
                    <th className={thCls}>Status</th>
                    <th className={`${thCls} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--cms-border)]">
                  {visible.map((m) => (
                    <tr key={m.id} className={`hover:bg-[var(--cms-surface-2)] transition-colors ${m.status === "cancelled" ? "opacity-60" : ""}`}>
                      <td className="p-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-[var(--cms-text)]">{formatDateTime(m.startAt)}</div>
                        {m.durationMins ? <div className="text-xs text-[var(--cms-muted)] mt-0.5">{m.durationMins} min</div> : null}
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-bold text-[var(--cms-text)]">{m.startupName || m.startupEmail}</div>
                        <div className="text-xs text-[var(--cms-muted)] mt-0.5">{m.startupEmail}</div>
                      </td>
                      <td className="p-4 max-w-[280px]">
                        <div className="text-sm font-semibold text-[var(--cms-text)]">{m.title}</div>
                        {m.host && <div className="text-xs text-[var(--cms-muted)] mt-0.5">With {m.host}</div>}
                      </td>
                      <td className="p-4 text-sm text-[var(--cms-text-2)]">
                        {m.mode || "—"}
                        {m.mode === "Online" && m.meetingLink && (
                          <a href={m.meetingLink} target="_blank" rel="noopener noreferrer" className="block text-xs font-medium text-[var(--cms-accent)] hover:underline mt-0.5">
                            Link ↗
                          </a>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[11px] font-bold capitalize ${STATUS_STYLE[m.status ?? "scheduled"]}`}>
                          {m.status ?? "scheduled"}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button onClick={() => handleOpenModal(m)} className={editBtnCls}>Edit</button>
                        {(m.status ?? "scheduled") === "scheduled" && (
                          <button onClick={() => setStatus(m, "cancelled")} className={neutralBtnCls}>Cancel</button>
                        )}
                        <button onClick={() => setDeleteTarget(m)} className={deleteBtnCls}>Delete</button>
                      </td>
                    </tr>
                  ))}
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
              <h2 className="text-xl font-bold text-[var(--cms-text)]">{editingId ? "Edit Meeting" : "Schedule Meeting"}</h2>
              <button onClick={handleCloseModal} className="p-1 rounded-full hover:bg-[var(--cms-surface-2)] transition-colors cursor-pointer">
                <X className="w-5 h-5 text-[var(--cms-muted)]" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="space-y-1">
                <label className={labelCls}>Startup *</label>
                <select className="cms-input w-full" value={formData.startupEmail} onChange={(e) => setFormData({ ...formData, startupEmail: e.target.value })}>
                  <option value="">Select a startup…</option>
                  {startupOptions.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} — {s.id}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Title *</label>
                <input type="text" className="cms-input w-full" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelCls}>Date &amp; Time *</label>
                  <input type="datetime-local" className="cms-input w-full" value={formData.startAt} onChange={(e) => setFormData({ ...formData, startAt: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Duration (min)</label>
                  <input type="number" min={5} step={5} className="cms-input w-full" value={formData.durationMins} onChange={(e) => setFormData({ ...formData, durationMins: Number(e.target.value) })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelCls}>Mode</label>
                  <select className="cms-input w-full" value={formData.mode} onChange={(e) => setFormData({ ...formData, mode: e.target.value as Mode })}>
                    <option value="In person">In person</option>
                    <option value="Online">Online</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Status</label>
                  <select className="cms-input w-full" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as Status })}>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              {formData.mode === "Online" ? (
                <div className="space-y-1">
                  <label className={labelCls}>Meeting Link</label>
                  <input type="url" className="cms-input w-full" value={formData.meetingLink} onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })} placeholder="https://meet.google.com/…" />
                </div>
              ) : (
                <div className="space-y-1">
                  <label className={labelCls}>Location</label>
                  <input type="text" className="cms-input w-full" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="AIC Techno, Offbeat CCU" />
                </div>
              )}
              <div className="space-y-1">
                <label className={labelCls}>With (AIC team member / mentor)</label>
                <input type="text" className="cms-input w-full" value={formData.host} onChange={(e) => setFormData({ ...formData, host: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Agenda / Notes</label>
                <textarea className="cms-input w-full min-h-[80px]" value={formData.agenda} onChange={(e) => setFormData({ ...formData, agenda: e.target.value })} placeholder="Visible to the startup" />
              </div>
            </div>

            <div className="p-6 border-t border-[var(--cms-border)] bg-[var(--cms-surface-2)] flex justify-end space-x-4 rounded-b-xl">
              <button onClick={handleCloseModal} className="px-4 py-2 rounded-lg text-sm font-semibold text-[var(--cms-text-2)] transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--cms-success)] hover:bg-green-600 transition-colors cursor-pointer disabled:opacity-60">
                {saving ? "Saving…" : editingId ? "Save Changes" : "Schedule Meeting"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
