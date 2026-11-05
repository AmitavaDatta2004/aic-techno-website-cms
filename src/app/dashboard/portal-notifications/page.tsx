"use client";
// src/app/dashboard/portal-notifications/page.tsx
// Startup Portal — "Updates from AIC Techno" shown to every registered startup.

import { useEffect, useState } from "react";
import { Topbar } from "@/components/cms/Topbar";
import {
  subscribePortalNotifications,
  addPortalNotification,
  updatePortalNotification,
  deletePortalNotification,
  type PortalNotification,
} from "@/lib/firestore";
import {
  Toast,
  Toggle,
  DeleteConfirmModal,
  formatDateTime,
  isHttpUrl,
  labelCls,
  thCls,
  editBtnCls,
  neutralBtnCls,
  deleteBtnCls,
  primaryBtnCls,
} from "@/components/cms/portal";
import { Pin, X } from "lucide-react";

const emptyForm = {
  title: "",
  body: "",
  link: "",
  linkLabel: "",
  pinned: false,
  active: true,
};

export default function PortalNotificationsPage() {
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<PortalNotification | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const unsub = subscribePortalNotifications((data) => {
      setNotifications(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenModal = (n?: PortalNotification) => {
    if (n) {
      setEditingId(n.id);
      setFormData({
        title: n.title ?? "",
        body: n.body ?? "",
        link: n.link ?? "",
        linkLabel: n.linkLabel ?? "",
        pinned: n.pinned ?? false,
        active: n.active ?? true,
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
    if (!formData.title.trim() || !formData.body.trim()) {
      showToast("Title and message are required", "error");
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
        body: formData.body.trim(),
        link: formData.link.trim(),
        linkLabel: formData.linkLabel.trim(),
        pinned: formData.pinned,
        active: formData.active,
      };
      if (editingId) {
        await updatePortalNotification(editingId, payload);
        showToast("Notification updated");
      } else {
        await addPortalNotification(payload);
        showToast("Notification posted to the Startup Portal");
      }
      handleCloseModal();
    } catch (error) {
      console.error(error);
      showToast("Error saving notification", "error");
    } finally {
      setSaving(false);
    }
  };

  const patch = async (n: PortalNotification, data: Partial<PortalNotification>, msg: string) => {
    try {
      await updatePortalNotification(n.id, data);
      showToast(msg);
    } catch (error) {
      console.error(error);
      showToast("Error updating notification", "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePortalNotification(deleteTarget.id);
      showToast("Notification deleted");
    } catch (error) {
      console.error(error);
      showToast("Error deleting notification", "error");
    }
    setDeleting(false);
    setDeleteTarget(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Portal Notifications" breadcrumb="Startup Portal" />
      <Toast toast={toast} />

      {deleteTarget && (
        <DeleteConfirmModal noun="Notification" title={deleteTarget.title} onCancel={() => setDeleteTarget(null)} onConfirm={handleConfirmDelete} deleting={deleting} />
      )}

      <main className="flex-1 px-8 py-8 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--cms-text)]">Portal Notifications</h1>
            <p className="text-sm text-[var(--cms-text-2)] mt-1">
              Shown under &quot;Updates from AIC Techno&quot; for every registered startup, newest first. Pinned ones stay on top.
            </p>
          </div>
          <button onClick={() => handleOpenModal()} className={`${primaryBtnCls} shrink-0`}>+ Post Notification</button>
        </div>

        <div className="cms-card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-[var(--cms-muted)]">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-[var(--cms-muted)]">No notifications yet. Click &quot;Post Notification&quot; to send the first update.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--cms-border)] bg-[var(--cms-surface-2)]">
                    <th className={thCls}>Posted</th>
                    <th className={thCls}>Notification</th>
                    <th className={thCls}>Visible</th>
                    <th className={`${thCls} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--cms-border)]">
                  {notifications.map((n) => (
                    <tr key={n.id} className={`hover:bg-[var(--cms-surface-2)] transition-colors ${n.active ? "" : "opacity-60"}`}>
                      <td className="p-4 whitespace-nowrap text-sm text-[var(--cms-text-2)]">{n.createdAt ? formatDateTime(n.createdAt) : "Just now"}</td>
                      <td className="p-4 max-w-[420px]">
                        <div className="text-sm font-bold text-[var(--cms-text)] flex items-center gap-1.5">
                          {n.pinned && <Pin className="w-3.5 h-3.5 text-[var(--cms-accent)] shrink-0" />}
                          {n.title}
                        </div>
                        <div className="text-xs text-[var(--cms-muted)] mt-0.5 line-clamp-2">{n.body}</div>
                      </td>
                      <td className="p-4">
                        <Toggle on={n.active} onClick={() => patch(n, { active: !n.active }, n.active ? "Hidden from startups" : "Shown to startups")} />
                      </td>
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button onClick={() => handleOpenModal(n)} className={editBtnCls}>Edit</button>
                        <button onClick={() => patch(n, { pinned: !n.pinned }, n.pinned ? "Unpinned" : "Pinned to top")} className={neutralBtnCls}>
                          {n.pinned ? "Unpin" : "Pin"}
                        </button>
                        <button onClick={() => setDeleteTarget(n)} className={deleteBtnCls}>Delete</button>
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
              <h2 className="text-xl font-bold text-[var(--cms-text)]">{editingId ? "Edit Notification" : "Post Notification"}</h2>
              <button onClick={handleCloseModal} className="p-1 rounded-full hover:bg-[var(--cms-surface-2)] transition-colors cursor-pointer">
                <X className="w-5 h-5 text-[var(--cms-muted)]" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="space-y-1">
                <label className={labelCls}>Title *</label>
                <input type="text" className="cms-input w-full" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Workspace closed for Kali Puja" />
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Message *</label>
                <textarea className="cms-input w-full min-h-[110px]" value={formData.body} onChange={(e) => setFormData({ ...formData, body: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1 col-span-2">
                  <label className={labelCls}>Link (optional)</label>
                  <input type="url" className="cms-input w-full" value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} placeholder="https://…" />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Link Text</label>
                  <input type="text" className="cms-input w-full" value={formData.linkLabel} onChange={(e) => setFormData({ ...formData, linkLabel: e.target.value })} placeholder="Learn more" />
                </div>
              </div>
              <div className="flex items-center space-x-3 pt-2">
                <Toggle on={formData.pinned} onClick={() => setFormData({ ...formData, pinned: !formData.pinned })} />
                <span className="text-sm font-medium text-[var(--cms-text-2)]">{formData.pinned ? "Pinned to the top" : "Not pinned"}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Toggle on={formData.active} onClick={() => setFormData({ ...formData, active: !formData.active })} />
                <span className="text-sm font-medium text-[var(--cms-text-2)]">{formData.active ? "Visible to startups" : "Hidden from startups"}</span>
              </div>
            </div>

            <div className="p-6 border-t border-[var(--cms-border)] bg-[var(--cms-surface-2)] flex justify-end space-x-4 rounded-b-xl">
              <button onClick={handleCloseModal} className="px-4 py-2 rounded-lg text-sm font-semibold text-[var(--cms-text-2)] transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--cms-success)] hover:bg-green-600 transition-colors cursor-pointer disabled:opacity-60">
                {saving ? "Saving…" : editingId ? "Save Changes" : "Post Notification"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
