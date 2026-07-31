"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/cms/Topbar";
import { ImageUploader } from "@/components/cms/ImageUploader";
import {
  subscribeNewsArticles,
  addNewsArticle,
  updateNewsArticle,
  deleteNewsArticle,
  type NewsArticle,
} from "@/lib/firestore";
import { AlertTriangle, X } from "lucide-react";

/* ── Delete Confirm Modal ────────────────────────────────────────────────── */
interface DeleteModalProps {
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
  deleting: boolean;
}
function DeleteConfirmModal({ title, onCancel, onConfirm, deleting }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-fade-in p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-sm font-black text-black">Delete Article</h3>
            <p className="text-xs text-[#666666] mt-1 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-black">{title}</span>? This action cannot be undone.
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

const emptyForm = {
  title: "",
  url: "",
  source: "",
  date: "",
  excerpt: "",
  imageUrl: "",
  order: 0,
  active: true,
};

export default function NewsArticlesPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<NewsArticle | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    const unsub = subscribeNewsArticles((data) => {
      setArticles(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenModal = (article?: NewsArticle) => {
    if (article) {
      setEditingId(article.id);
      setFormData({
        title: article.title ?? "",
        url: article.url ?? "",
        source: article.source ?? "",
        date: article.date ?? "",
        excerpt: article.excerpt ?? "",
        imageUrl: article.imageUrl ?? "",
        order: article.order ?? 0,
        active: article.active ?? true,
      });
    } else {
      setEditingId(null);
      setFormData({ ...emptyForm, order: articles.length });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.url.trim()) {
      showToast("Title and URL are required", "error");
      return;
    }
    try {
      const payload = {
        title: formData.title.trim(),
        url: formData.url.trim(),
        source: formData.source.trim(),
        date: formData.date.trim(),
        excerpt: formData.excerpt.trim(),
        imageUrl: formData.imageUrl,
        order: formData.order,
        active: formData.active,
      };

      if (editingId) {
        await updateNewsArticle(editingId, payload);
        showToast("Article updated successfully");
      } else {
        await addNewsArticle(payload);
        showToast("Article added successfully");
      }
      handleCloseModal();
    } catch (error) {
      console.error(error);
      showToast("Error saving article", "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteNewsArticle(deleteTarget.id);
      showToast("Article deleted successfully");
    } catch (error) {
      console.error(error);
      showToast("Error deleting article", "error");
    }
    setDeleting(false);
    setDeleteTarget(null);
  };

  const toggleActive = async (article: NewsArticle) => {
    try {
      await updateNewsArticle(article.id, { active: !article.active });
      showToast(`Article marked as ${!article.active ? "active" : "inactive"}`);
    } catch (error) {
      console.error(error);
      showToast("Error toggling status", "error");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="News Articles" breadcrumb="News Articles" />

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
          title={deleteTarget.title ?? "this article"}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
          deleting={deleting}
        />
      )}

      <main className="flex-1 px-8 py-8 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--cms-text)]">Manage News Articles</h1>
            <p className="text-sm text-[var(--cms-text-2)] mt-1">
              Press mentions shown on the homepage News section and the full News &amp; Media page
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--cms-accent)] hover:bg-[var(--cms-accent-hover)] transition-colors cursor-pointer"
          >
            + Add Article
          </button>
        </div>

        <div className="cms-card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-[var(--cms-muted)]">Loading articles...</div>
          ) : articles.length === 0 ? (
            <div className="p-8 text-center text-[var(--cms-muted)]">
              No articles found. Click &quot;Add Article&quot; to create one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--cms-border)] bg-[var(--cms-surface-2)]">
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-[var(--cms-muted)]">Preview</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-[var(--cms-muted)]">Title</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-[var(--cms-muted)]">Source</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-[var(--cms-muted)]">Date</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-[var(--cms-muted)]">Active</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-[var(--cms-muted)] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--cms-border)]">
                  {articles.map((article) => (
                    <tr
                      key={article.id}
                      className="hover:bg-[var(--cms-surface-2)] transition-colors group"
                    >
                      <td className="p-4">
                        <div className="w-16 h-12 rounded-lg overflow-hidden border border-[var(--cms-border)] bg-[var(--cms-surface-2)]">
                          {article.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={article.imageUrl} alt={article.title ?? ""} className="w-full h-full object-cover" loading="lazy" />
                          ) : null}
                        </div>
                      </td>
                      <td className="p-4 text-sm font-bold text-[var(--cms-text)] max-w-[280px]">
                        <span className="line-clamp-2">{article.title}</span>
                        {article.url && (
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-xs font-medium text-[var(--cms-accent)] hover:underline mt-0.5"
                          >
                            Open link ↗
                          </a>
                        )}
                      </td>
                      <td className="p-4 text-sm font-medium text-[var(--cms-text-2)]">
                        {article.source || <span className="text-[var(--cms-muted)]">—</span>}
                      </td>
                      <td className="p-4 text-sm text-[var(--cms-text-2)]">
                        {article.date || <span className="text-[var(--cms-muted)]">—</span>}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => toggleActive(article)}
                          className={`w-10 h-5 rounded-full relative transition-colors focus:outline-none cursor-pointer ${
                            article.active ? "bg-[var(--cms-success)]" : "bg-[var(--cms-border)]"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${
                              article.active ? "translate-x-5" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenModal(article)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--cms-accent)] bg-[#FFF0F2] border border-[#FECDD3] hover:bg-[var(--cms-accent)] hover:text-white transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(article)}
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
                {editingId ? "Edit Article" : "Add Article"}
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
                  Headline
                </label>
                <input
                  type="text"
                  className="cms-input w-full"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. AIC Techno launches West Bengal's first Atal Incubation Centre"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)]">
                  Article URL
                </label>
                <input
                  type="url"
                  className="cms-input w-full"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)]">
                    Source
                  </label>
                  <input
                    type="text"
                    className="cms-input w-full"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    placeholder="e.g. The Telegraph"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)]">
                    Date
                  </label>
                  <input
                    type="text"
                    className="cms-input w-full"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="e.g. 12 Jan 2026"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)]">
                  Excerpt
                </label>
                <textarea
                  className="cms-input w-full min-h-[80px]"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Short summary shown under the headline"
                />
              </div>

              <ImageUploader
                folder="news"
                label="Thumbnail (optional)"
                currentUrl={formData.imageUrl}
                onUploaded={(url) => setFormData({ ...formData, imageUrl: url })}
                fullWidth
              />

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
                {editingId ? "Save Changes" : "Add Article"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
