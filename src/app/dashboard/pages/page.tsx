"use client";

import { useEffect, useState, useRef } from "react";
import { Topbar } from "@/components/cms/Topbar";
import {
  subscribePages,
  addPage,
  updatePage,
  deletePage,
  CustomPage,
} from "@/lib/firestore";
import { uploadFile, generateStoragePath } from "@/lib/storage";
import {
  FileText,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  X,
  AlertTriangle,
  ImagePlus,
  Globe,
  Search,
  Eye,
} from "lucide-react";

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/* ── Add / Edit Page Modal ────────────────────────────────────────────────── */
interface ModalProps {
  page?: CustomPage | null;
  defaultOrder: number;
  onClose: () => void;
  onSaved: (msg: string) => void;
}

function PageModal({ page, defaultOrder, onClose, onSaved }: ModalProps) {
  const isEditing = Boolean(page);

  const [title, setTitle]                     = useState(page?.title || "");
  const [slug, setSlug]                       = useState(page?.slug || "");
  const [slugManual, setSlugManual]           = useState(Boolean(page?.slug));
  const [bannerImage, setBannerImage]         = useState(page?.bannerImage || "");
  const [content, setContent]                 = useState(page?.content || "");
  const [seoTitle, setSeoTitle]               = useState(page?.seoTitle || "");
  const [metaDescription, setMetaDescription] = useState(page?.metaDescription || "");
  const [published, setPublished]             = useState(page?.published ?? true);
  const [order, setOrder]                     = useState(page?.order ?? defaultOrder);

  const [saving, setSaving]                   = useState(false);
  const [errors, setErrors]                   = useState<{ title?: string; slug?: string; content?: string }>({});

  const [selectedFile, setSelectedFile]       = useState<File | null>(null);
  const [photoPreview, setPhotoPreview]       = useState(page?.bannerImage || "");
  const [uploading, setUploading]             = useState(false);
  const photoInputRef                         = useRef<HTMLInputElement>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugManual) {
      setSlug(titleToSlug(val));
    }
  };

  const handlePhotoChange = (file: File) => {
    setSelectedFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const e: { title?: string; slug?: string; content?: string } = {};
    if (!title.trim()) e.title = "Page Title is required";
    if (!slug.trim()) e.slug = "Page Slug is required";
    if (!content.trim()) e.content = "Page Content is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);

    let finalBannerUrl = bannerImage;
    if (selectedFile) {
      setUploading(true);
      try {
        const path = generateStoragePath("pages", selectedFile);
        finalBannerUrl = await uploadFile(selectedFile, path);
      } catch (err: unknown) {
        console.error("Upload error:", err);
        setErrors((prev) => ({ ...prev, title: "Banner upload failed. Try again." }));
        setSaving(false);
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    try {
      const cleanSlug = titleToSlug(slug);
      if (isEditing && page) {
        await updatePage(page.id, {
          title: title.trim(),
          slug: cleanSlug,
          bannerImage: finalBannerUrl,
          content: content.trim(),
          seoTitle: seoTitle.trim(),
          metaDescription: metaDescription.trim(),
          published,
          order,
        });
        onSaved("Page updated successfully");
      } else {
        await addPage({
          title: title.trim(),
          slug: cleanSlug,
          bannerImage: finalBannerUrl,
          content: content.trim(),
          seoTitle: seoTitle.trim(),
          metaDescription: metaDescription.trim(),
          published,
          order,
        });
        onSaved("Page created successfully");
      }
      onClose();
    } catch (err: unknown) {
      setSaving(false);
      setErrors({ title: (err as Error).message });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EEEEEE] flex items-center justify-between bg-[#FAFAFA]">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" style={{ color: "#800020" }} />
            <h2 className="text-base font-black text-black">
              {isEditing ? "Edit Page" : "Add New Page"}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#999999] hover:text-black hover:bg-[#EEEEEE]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Banner Upload */}
          <div className="space-y-2">
            <label className="block text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA]">
              Banner Image
            </label>
            <div className="relative w-full h-36 rounded-xl bg-[#F8F9FA] border-2 border-dashed border-[#E0E0E0] overflow-hidden flex flex-col items-center justify-center">
              {photoPreview ? (
                <>
                  <img src={photoPreview} alt="Banner Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-black/75 text-white text-xs font-bold backdrop-blur-md hover:bg-black"
                  >
                    Change Image
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="flex flex-col items-center gap-2 text-[#666666] hover:text-black"
                >
                  <ImagePlus className="w-8 h-8" />
                  <span className="text-xs font-bold">Upload Page Banner Image</span>
                </button>
              )}
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handlePhotoChange(e.target.files[0]);
                }}
              />
            </div>
          </div>

          {/* Title & Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA] mb-1">
                Page Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`cms-input w-full ${errors.title ? "border-red-500" : ""}`}
                placeholder="e.g. About AI & Emerging Tech"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA] mb-1">
                URL Slug <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  className={`cms-input w-full font-mono text-xs ${errors.slug ? "border-red-500" : ""}`}
                  placeholder="about-ai"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugManual(true);
                  }}
                />
              </div>
              <p className="text-[10px] text-[#888888] mt-1">
                URL preview: <code className="text-[#800020] font-bold">page.html?slug={slug || "..."}</code>
              </p>
              {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug}</p>}
            </div>
          </div>

          {/* Page Content */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA]">
                Page Content (HTML / Text) <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-[#888888]">Supports standard HTML tags</span>
            </div>
            <textarea
              className={`cms-input w-full font-mono text-xs leading-relaxed resize-y ${
                errors.content ? "border-red-500" : ""
              }`}
              rows={8}
              placeholder="<h2>Welcome to AI Council</h2><p>AIC Techno provides full incubation support...</p>"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content}</p>}
          </div>

          {/* SEO Metadata */}
          <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#EEEEEE] space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-black">
              <Globe className="w-4 h-4" style={{ color: "#800020" }} />
              <span>SEO & Meta Settings</span>
            </div>

            <div>
              <label className="block text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA] mb-1">
                SEO Title (Browser Tab)
              </label>
              <input
                type="text"
                className="cms-input w-full bg-white"
                placeholder="Custom title for search engines..."
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA] mb-1">
                Meta Description
              </label>
              <textarea
                className="cms-input w-full bg-white resize-none text-xs"
                rows={2}
                placeholder="Short summary for Google search results..."
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Settings / Published */}
          <div className="flex items-center justify-between pt-2 border-t border-[#EEEEEE]">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="published-toggle"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="w-4 h-4 rounded text-[#800020]"
              />
              <label htmlFor="published-toggle" className="text-xs font-bold text-black cursor-pointer">
                Publish Immediately (Visible on public site)
              </label>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA]">Order:</label>
              <input
                type="number"
                min={0}
                className="w-16 cms-input font-bold text-center py-1"
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#EEEEEE] bg-[#FAFAFA] flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold text-[#666666] bg-white border border-[#E0E0E0]">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || uploading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md disabled:opacity-60"
            style={{ background: "#800020" }}
          >
            {saving ? "Saving…" : isEditing ? "Update Page" : "Create Page"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Delete Modal ───────────────────────────────────────────────────── */
interface DeleteModalProps {
  pageTitle: string;
  onCancel: () => void;
  onConfirm: () => void;
  deleting: boolean;
}
function DeleteConfirmModal({ pageTitle, onCancel, onConfirm, deleting }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-fade-in p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-sm font-black text-black">Delete Custom Page</h3>
            <p className="text-xs text-[#666666] mt-1 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-black">{pageTitle}</span>?
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button onClick={onCancel} disabled={deleting} className="px-4 py-2 rounded-xl text-xs font-bold text-[#666666] bg-white border border-[#E0E0E0]">Cancel</button>
          <button onClick={onConfirm} disabled={deleting} className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-500 hover:bg-red-600">
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Dashboard Page Component ───────────────────────────────────── */
export default function PagesManagementPage() {
  const [pages, setPages]               = useState<CustomPage[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [filter, setFilter]             = useState<"all" | "published" | "draft">("all");
  const [toast, setToast]               = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const [showModal, setShowModal]       = useState(false);
  const [editTarget, setEditTarget]     = useState<CustomPage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomPage | null>(null);
  const [deleting, setDeleting]         = useState(false);

  useEffect(() => {
    const unsub = subscribePages((data) => {
      setPages(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePage(deleteTarget.id);
      showToast(`Deleted page "${deleteTarget.title}"`);
      setDeleteTarget(null);
    } catch {
      showToast("Delete failed", "error");
    } finally {
      setDeleting(false);
    }
  };

  const filteredPages = pages.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ? true : filter === "published" ? p.published : !p.published;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F8F9FA]">
      <Topbar
        title="Custom Pages Management"
        actions={
          <button
            onClick={() => {
              setEditTarget(null);
              setShowModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm"
            style={{ background: "#800020" }}
          >
            <Plus className="w-4 h-4" />
            Add New Page
          </button>
        }
      />

      <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-white text-xs font-bold animate-fade-in ${
              toast.type === "error" ? "bg-red-600" : "bg-black"
            }`}
          >
            {toast.type === "error" ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4 text-green-400" />}
            {toast.msg}
          </div>
        )}

        {/* Filter / Search Bar */}
        <div className="bg-white rounded-2xl p-4 border border-[#EEEEEE] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#AAAAAA]" />
            <input
              type="text"
              placeholder="Search by title or slug..."
              className="cms-input w-full pl-9 py-2 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {(["all", "published", "draft"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  filter === f
                    ? "bg-[#800020] text-white shadow-sm"
                    : "bg-[#FAFAFA] border border-[#EEEEEE] text-[#666666] hover:bg-[#F5F5F5]"
                }`}
              >
                {f} ({pages.filter((p) => (f === "all" ? true : f === "published" ? p.published : !p.published)).length})
              </button>
            ))}
          </div>
        </div>

        {/* List View */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-[#EEEEEE] animate-pulse h-20" />
            ))}
          </div>
        ) : filteredPages.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-[#EEEEEE] text-center space-y-3">
            <FileText className="w-12 h-12 text-[#CCCCCC] mx-auto" />
            <h3 className="text-base font-bold text-black">No pages found</h3>
            <p className="text-xs text-[#666666]">Click "Add New Page" to create your first dynamic page.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#EEEEEE] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFAFA] border-b border-[#EEEEEE] text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA]">
                  <tr>
                    <th className="px-6 py-3.5">Page Title & Slug</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Banner</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEEEEE]">
                  {filteredPages.map((page) => (
                    <tr key={page.id} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-black text-sm">{page.title}</div>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#888888] mt-0.5 font-mono">
                          <span>page.html?slug={page.slug}</span>
                          {page.published && (
                            <a
                              href={`http://127.0.0.1:5500/page.html?slug=${page.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#800020] hover:underline inline-flex items-center gap-0.5 font-sans"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={async () => {
                            const newStatus = !page.published;
                            try {
                              await updatePage(page.id, { published: newStatus });
                              showToast(`Page is now ${newStatus ? "published" : "draft"}`);
                            } catch {
                              showToast("Status update failed", "error");
                            }
                          }}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            page.published
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : "bg-gray-100 text-gray-700 border border-gray-200"
                          }`}
                        >
                          {page.published ? "Published" : "Draft"}
                        </button>
                      </td>

                      <td className="px-6 py-4">
                        {page.bannerImage ? (
                          <img
                            src={page.bannerImage}
                            alt={page.title}
                            className="w-16 h-10 object-cover rounded-lg border border-[#EEEEEE]"
                          />
                        ) : (
                          <span className="text-[10px] text-[#AAAAAA] italic">No banner</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditTarget(page);
                              setShowModal(true);
                            }}
                            className="p-2 rounded-xl text-[#666666] hover:text-[#800020] hover:bg-[#FFF0F3] transition-colors"
                            title="Edit Page"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(page)}
                            className="p-2 rounded-xl text-[#666666] hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Page"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showModal && (
          <PageModal
            page={editTarget}
            defaultOrder={pages.length + 1}
            onClose={() => {
              setShowModal(false);
              setEditTarget(null);
            }}
            onSaved={(msg) => showToast(msg)}
          />
        )}

        {deleteTarget && (
          <DeleteConfirmModal
            pageTitle={deleteTarget.title}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
            deleting={deleting}
          />
        )}
      </main>
    </div>
  );
}
