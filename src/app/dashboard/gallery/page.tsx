"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/cms/Topbar";
import { ImageUploader } from "@/components/cms/ImageUploader";
import {
  subscribeGalleryItems,
  addGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  type GalleryItem,
} from "@/lib/firestore";
import { AlertTriangle, X } from "lucide-react";

/* ── Delete Confirm Modal ────────────────────────────────────────────────── */
interface DeleteModalProps {
  caption: string;
  onCancel: () => void;
  onConfirm: () => void;
  deleting: boolean;
}
function DeleteConfirmModal({ caption, onCancel, onConfirm, deleting }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-fade-in p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-sm font-black text-black">Delete Photo</h3>
            <p className="text-xs text-[#666666] mt-1 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-black">{caption}</span>? This action cannot be undone.
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

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState<{
    imageUrl: string;
    caption: string;
    order: number;
    active: boolean;
  }>({
    imageUrl: "",
    caption: "",
    order: 0,
    active: true,
  });

  useEffect(() => {
    const unsub = subscribeGalleryItems((data) => {
      setItems(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenModal = (item?: GalleryItem) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        imageUrl: item.imageUrl ?? "",
        caption: item.caption ?? "",
        order: item.order ?? 0,
        active: item.active ?? true,
      });
    } else {
      setEditingId(null);
      setFormData({
        imageUrl: "",
        caption: "",
        order: items.length,
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
    if (!formData.imageUrl) {
      showToast("Please upload a photo first", "error");
      return;
    }
    try {
      const payload = {
        imageUrl: formData.imageUrl,
        caption: formData.caption,
        order: formData.order,
        active: formData.active,
      };

      if (editingId) {
        await updateGalleryItem(editingId, payload);
        showToast("Photo updated successfully");
      } else {
        await addGalleryItem(payload);
        showToast("Photo added successfully");
      }
      handleCloseModal();
    } catch (error) {
      console.error(error);
      showToast("Error saving photo", "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteGalleryItem(deleteTarget.id);
      showToast("Photo deleted successfully");
    } catch (error) {
      console.error(error);
      showToast("Error deleting photo", "error");
    }
    setDeleting(false);
    setDeleteTarget(null);
  };

  const toggleActive = async (item: GalleryItem) => {
    try {
      await updateGalleryItem(item.id, { active: !item.active });
      showToast(`Photo marked as ${!item.active ? "active" : "inactive"}`);
    } catch (error) {
      console.error(error);
      showToast("Error toggling status", "error");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Gallery" breadcrumb="Gallery" />

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
          caption={deleteTarget.caption || "this photo"}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
          deleting={deleting}
        />
      )}

      <main className="flex-1 px-8 py-8 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--cms-text)]">Manage Gallery</h1>
            <p className="text-sm text-[var(--cms-text-2)] mt-1">
              Photos shown in the homepage Gallery section
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--cms-accent)] hover:bg-[var(--cms-accent-hover)] transition-colors cursor-pointer"
          >
            + Add Photo
          </button>
        </div>

        <div className="cms-card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-[var(--cms-muted)]">Loading gallery...</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-[var(--cms-muted)]">
              No photos found. Click &quot;Add Photo&quot; to create one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--cms-border)] bg-[var(--cms-surface-2)]">
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-[var(--cms-muted)]">Preview</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-[var(--cms-muted)]">Caption</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-[var(--cms-muted)]">Order</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-[var(--cms-muted)]">Active</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-[var(--cms-muted)] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--cms-border)]">
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-[var(--cms-surface-2)] transition-colors group"
                    >
                      <td className="p-4">
                        <div className="w-16 h-12 rounded-lg overflow-hidden border border-[var(--cms-border)] bg-[var(--cms-surface-2)]">
                          {item.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.imageUrl} alt={item.caption ?? ""} className="w-full h-full object-cover" loading="lazy" />
                          ) : null}
                        </div>
                      </td>
                      <td className="p-4 text-sm font-medium text-[var(--cms-text-2)]">
                        {item.caption || <span className="text-[var(--cms-muted)]">—</span>}
                      </td>
                      <td className="p-4 text-sm text-[var(--cms-text-2)]">{item.order ?? 0}</td>
                      <td className="p-4">
                        <button
                          onClick={() => toggleActive(item)}
                          className={`w-10 h-5 rounded-full relative transition-colors focus:outline-none cursor-pointer ${
                            item.active ? "bg-[var(--cms-success)]" : "bg-[var(--cms-border)]"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${
                              item.active ? "translate-x-5" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--cms-accent)] bg-[#FFF0F2] border border-[#FECDD3] hover:bg-[var(--cms-accent)] hover:text-white transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
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
                {editingId ? "Edit Photo" : "Add Photo"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-full hover:bg-[var(--cms-surface-2)] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-[var(--cms-muted)]" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <ImageUploader
                folder="gallery"
                label="Photo"
                currentUrl={formData.imageUrl}
                onUploaded={(url) => setFormData({ ...formData, imageUrl: url })}
                fullWidth
              />

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)]">
                  Caption
                </label>
                <input
                  type="text"
                  className="cms-input w-full"
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  placeholder="e.g. Demo Day 2026 cohort pitching to investors"
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
                  {formData.active ? "Visible on site" : "Hidden from site"}
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
                {editingId ? "Save Changes" : "Add Photo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
