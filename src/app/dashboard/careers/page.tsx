"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/cms/Topbar";
import {
  subscribeCareers,
  addCareer,
  updateCareer,
  deleteCareer,
  type Career,
} from "@/lib/firestore";
import { AlertTriangle, Trash2, X } from "lucide-react";

/* ── Delete Confirm Modal ────────────────────────────────────────────────── */
interface DeleteModalProps {
  jobTitle: string;
  onCancel: () => void;
  onConfirm: () => void;
  deleting: boolean;
}
function DeleteConfirmModal({ jobTitle, onCancel, onConfirm, deleting }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-fade-in p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-sm font-black text-black">Delete Job Listing</h3>
            <p className="text-xs text-[#666666] mt-1 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-black">{jobTitle}</span>? This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button onClick={onCancel} disabled={deleting} className="px-4 py-2 rounded-xl text-xs font-bold text-[#666666] bg-white border border-[#E0E0E0] hover:bg-[#F5F5F5] transition-colors">Cancel</button>
          <button onClick={onConfirm} disabled={deleting} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-60">
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CareersPage() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [deleteTarget, setDeleteTarget] = useState<Career | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState<{
    dept: string;
    title: string;
    icon: string;
    tags: string;
    applyLink: string;
    order: number;
    active: boolean;
  }>({
    dept: "",
    title: "",
    icon: "💼",
    tags: "",
    applyLink: "",
    order: 0,
    active: true,
  });

  useEffect(() => {
    const unsub = subscribeCareers((data) => {
      setCareers(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenModal = (career?: Career) => {
    if (career) {
      setEditingId(career.id);
      setFormData({
        dept: career.dept ?? "",
        title: career.title ?? "",
        icon: career.icon ?? "💼",
        tags: (career.tags ?? []).join(", "),
        applyLink: career.applyLink ?? "",
        order: career.order ?? 0,
        active: career.active ?? true,
      });
    } else {
      setEditingId(null);
      setFormData({
        dept: "",
        title: "",
        icon: "💼",
        tags: "",
        applyLink: "",
        order: careers.length,
        active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    try {
      const tagsArray = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        dept: formData.dept,
        title: formData.title,
        icon: formData.icon,
        tags: tagsArray,
        applyLink: formData.applyLink,
        order: formData.order,
        active: formData.active,
      };

      if (editingId) {
        await updateCareer(editingId, payload);
        showToast("Career updated successfully");
      } else {
        await addCareer(payload);
        showToast("Career added successfully");
      }
      handleCloseModal();
    } catch (error) {
      console.error(error);
      showToast("Error saving career", "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCareer(deleteTarget.id);
      showToast("Career deleted successfully");
    } catch (error) {
      console.error(error);
      showToast("Error deleting career", "error");
    }
    setDeleting(false);
    setDeleteTarget(null);
  };

  const toggleActive = async (career: Career) => {
    try {
      await updateCareer(career.id, { active: !career.active });
      showToast(`Career marked as ${!career.active ? "active" : "inactive"}`);
    } catch (error) {
      console.error(error);
      showToast("Error toggling status", "error");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Careers" breadcrumb="Careers" />

      {toast && (
        <div
          className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 text-sm font-medium animate-fade-in ${
            toast.type === "success"
              ? "bg-[var(--cms-success)] text-white"
              : "bg-[var(--cms-danger)] text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          jobTitle={deleteTarget.title ?? "this job listing"}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
          deleting={deleting}
        />
      )}

      <main className="flex-1 px-8 py-8 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--cms-text)]">Manage Jobs</h1>
            <p className="text-sm text-[var(--cms-text-2)] mt-1">
              Add, edit, or remove job listings
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--cms-accent)] hover:bg-[var(--cms-accent-hover)] transition-colors cursor-pointer"
          >
            + Add Job
          </button>
        </div>

        <div className="cms-card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-[var(--cms-muted)]">Loading careers...</div>
          ) : careers.length === 0 ? (
            <div className="p-8 text-center text-[var(--cms-muted)]">
              No jobs found. Click &quot;Add Job&quot; to create one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--cms-border)] bg-[var(--cms-surface-2)]">
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-[var(--cms-muted)]">Icon</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-[var(--cms-muted)]">Department</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-[var(--cms-muted)]">Job Title</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-[var(--cms-muted)]">Tags</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-[var(--cms-muted)]">Apply Link</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-[var(--cms-muted)]">Active</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-[var(--cms-muted)] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--cms-border)]">
                  {careers.map((career) => (
                    <tr
                      key={career.id}
                      className="hover:bg-[var(--cms-surface-2)] transition-colors group"
                    >
                      <td className="p-4 text-xl">{career.icon ?? '💼'}</td>
                      <td className="p-4 text-sm font-medium text-[var(--cms-text-2)]">
                        {career.dept ?? '—'}
                      </td>
                      <td className="p-4 text-sm font-bold text-[var(--cms-text)]">
                        {career.title ?? '—'}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {(career.tags ?? []).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs font-semibold rounded-md bg-[var(--cms-accent)]/10 text-[var(--cms-accent)]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        {career.applyLink ? (
                          <a
                            href={career.applyLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[var(--cms-accent)] hover:underline"
                          >
                            Link
                          </a>
                        ) : (
                          <span className="text-sm text-[var(--cms-muted)]">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => toggleActive(career)}
                          className={`w-10 h-5 rounded-full relative transition-colors focus:outline-none cursor-pointer ${
                            career.active ? "bg-[var(--cms-success)]" : "bg-[var(--cms-border)]"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${
                              career.active ? "translate-x-5" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenModal(career)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--cms-accent)] bg-[#FFF0F2] border border-[#FECDD3] hover:bg-[var(--cms-accent)] hover:text-white transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(career)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--cms-surface)] border border-[var(--cms-border)] w-full max-w-lg rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-[var(--cms-border)] flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--cms-text)]">
                {editingId ? "Edit Job" : "Add Job"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-full hover:bg-[var(--cms-surface-2)] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-[var(--cms-muted)]" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)]">
                  Icon (Emoji)
                </label>
                <input
                  type="text"
                  className="cms-input w-full"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="💼"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)]">
                  Department
                </label>
                <input
                  type="text"
                  className="cms-input w-full"
                  value={formData.dept}
                  onChange={(e) => setFormData({ ...formData, dept: e.target.value })}
                  placeholder="e.g. Engineering"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)]">
                  Job Title
                </label>
                <input
                  type="text"
                  className="cms-input w-full"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Frontend Developer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)]">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  className="cms-input w-full"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g. Full-time, Remote, Senior"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)]">
                  Apply Link
                </label>
                <input
                  type="url"
                  className="cms-input w-full"
                  value={formData.applyLink}
                  onChange={(e) => setFormData({ ...formData, applyLink: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)]">
                  Order
                </label>
                <input
                  type="number"
                  className="cms-input w-full"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, active: !formData.active })}
                  className={`w-10 h-5 rounded-full relative transition-colors focus:outline-none cursor-pointer ${
                    formData.active ? "bg-[var(--cms-success)]" : "bg-[var(--cms-border)]"
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${
                      formData.active ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </button>
                <span className="text-sm font-medium text-[var(--cms-text-2)]">
                  {formData.active ? "Active Listing" : "Inactive Listing"}
                </span>
              </div>
            </div>

            <div className="p-6 border-t border-[var(--cms-border)] bg-[var(--cms-surface-2)] flex justify-end space-x-4 rounded-b-xl">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-[var(--cms-text-2)] hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--cms-success)] hover:bg-green-600 transition-colors cursor-pointer"
              >
                {editingId ? "Save Changes" : "Add Job"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
