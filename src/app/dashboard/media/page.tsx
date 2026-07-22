"use client";

import { useEffect, useRef, useState } from "react";
import { Topbar } from "@/components/cms/Topbar";
import { ImageUploader } from "@/components/cms/ImageUploader";
import {
  subscribeMedia,
  addMediaRecord,
  deleteMediaRecord,
  type MediaFile,
} from "@/lib/firestore";
import { deleteFile } from "@/lib/storage";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(ts: { toDate?: () => Date } | undefined): string {
  if (!ts?.toDate) return "Just now";
  return ts.toDate().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type ViewMode = "grid" | "list";
type FilterType = "all" | "image" | "other";

// ─── Component ────────────────────────────────────────────────────────────────

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lightboxFile, setLightboxFile] = useState<MediaFile | null>(null);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);

  useEffect(() => {
    const unsub = subscribeMedia((data) => {
      setMedia(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUploaded = async (url: string, storagePath: string, file: File) => {
    try {
      await addMediaRecord({
        name: file.name,
        url,
        size: file.size,
        contentType: file.type,
        storagePath,
      });
      showToast(`"${file.name}" uploaded successfully`);
      setIsUploaderOpen(false);
    } catch (err) {
      console.error(err);
      showToast("Failed to save media record", "error");
    }
  };

  const handleDelete = async (file: MediaFile) => {
    if (!confirm(`Delete "${file.name}"? This cannot be undone.`)) return;
    setDeletingId(file.id);
    try {
      try {
        await deleteFile(file.storagePath);
      } catch {
        // File may already be gone from Storage
      }
      await deleteMediaRecord(file.id);
      if (lightboxFile?.id === file.id) setLightboxFile(null);
      showToast(`"${file.name}" deleted`);
    } catch (err) {
      console.error(err);
      showToast("Failed to delete file", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyUrl = async (file: MediaFile) => {
    try {
      await navigator.clipboard.writeText(file.url);
      setCopiedId(file.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      showToast("Could not copy to clipboard", "error");
    }
  };

  const filtered = media.filter((f) => {
    const matchType =
      filter === "all" ||
      (filter === "image" && f.contentType.startsWith("image/")) ||
      (filter === "other" && !f.contentType.startsWith("image/"));
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const imageCount = media.filter((f) => f.contentType.startsWith("image/")).length;
  const totalSize = media.reduce((sum, f) => sum + (f.size ?? 0), 0);

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Media Library" breadcrumb="Media Library" />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 px-4 py-2.5 rounded-lg shadow-xl z-50 text-sm font-semibold animate-fade-in flex items-center gap-2 ${
            toast.type === "success"
              ? "bg-[var(--cms-success)] text-white"
              : "bg-[var(--cms-danger)] text-white"
          }`}
        >
          {toast.type === "success" ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      <main className="flex-1 px-8 py-8 space-y-6 animate-fade-in">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-[var(--cms-text)]">Media Library</h1>
            <p className="text-sm text-[var(--cms-muted)] mt-1">
              {media.length} files · {formatBytes(totalSize)} used · {imageCount} images
            </p>
          </div>
          <button
            id="upload-files-btn"
            onClick={() => setIsUploaderOpen(true)}
            className="cms-btn-primary"
          >
            ↑ Upload Files
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Files", value: media.length, icon: "🗂️" },
            { label: "Images", value: imageCount, icon: "🖼️" },
            { label: "Total Size", value: formatBytes(totalSize), icon: "💾" },
          ].map((stat) => (
            <div key={stat.label} className="cms-card p-4 flex items-center gap-4">
              <span className="text-2xl">{stat.icon}</span>
              <div>
                <p className="text-lg font-bold text-[var(--cms-text)]">{stat.value}</p>
                <p className="text-xs text-[var(--cms-muted)]">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--cms-muted)]"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              id="media-search"
              className="cms-input pl-9"
              placeholder="Search files…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filter */}
          <div className="flex rounded-lg border border-[var(--cms-border)] overflow-hidden bg-[var(--cms-surface)]">
            {(["all", "image", "other"] as FilterType[]).map((f) => (
              <button
                key={f}
                id={`filter-${f}`}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-xs font-semibold capitalize transition-colors ${
                  filter === f
                    ? "bg-[var(--cms-accent)] text-white"
                    : "text-[var(--cms-muted)] hover:text-[var(--cms-text)] hover:bg-[var(--cms-surface-2)]"
                }`}
              >
                {f === "all" ? "All" : f === "image" ? "Images" : "Other"}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex rounded-lg border border-[var(--cms-border)] overflow-hidden bg-[var(--cms-surface)]">
            <button
              id="view-grid-btn"
              onClick={() => setViewMode("grid")}
              title="Grid view"
              className={`p-2.5 transition-colors ${viewMode === "grid" ? "bg-[var(--cms-accent)] text-white" : "text-[var(--cms-muted)] hover:bg-[var(--cms-surface-2)]"}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              id="view-list-btn"
              onClick={() => setViewMode("list")}
              title="List view"
              className={`p-2.5 transition-colors ${viewMode === "list" ? "bg-[var(--cms-accent)] text-white" : "text-[var(--cms-muted)] hover:bg-[var(--cms-surface-2)]"}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 000 2h14a1 1 0 100-2H3zm0 4a1 1 0 000 2h14a1 1 0 100-2H3zm0 4a1 1 0 000 2h14a1 1 0 100-2H3z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="cms-card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-24 gap-3 text-[var(--cms-muted)]">
              <div className="w-6 h-6 border-2 border-[var(--cms-accent)] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Loading media…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--cms-surface-2)] flex items-center justify-center text-3xl">🖼️</div>
              <div>
                <p className="text-base font-semibold text-[var(--cms-text)]">
                  {search || filter !== "all" ? "No files match your search" : "No files yet"}
                </p>
                <p className="text-sm text-[var(--cms-muted)] mt-1">
                  {search || filter !== "all"
                    ? "Try a different search or filter"
                    : "Upload your first file using the button above"}
                </p>
              </div>
            </div>
          ) : viewMode === "grid" ? (

            /* ── Grid ── */
            <div className="p-6 grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
              {filtered.map((file) => (
                <div
                  key={file.id}
                  className="group relative rounded-xl overflow-hidden border border-[var(--cms-border)] bg-[var(--cms-surface-2)] hover:border-[var(--cms-accent)] transition-all duration-200 hover:shadow-md"
                >
                  {/* Thumbnail */}
                  <div
                    className="relative aspect-square cursor-pointer"
                    onClick={() => setLightboxFile(file)}
                  >
                    {file.contentType.startsWith("image/") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={file.url} alt={file.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl bg-[var(--cms-surface-2)]">📄</div>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-2.5">
                    <p className="text-xs font-semibold text-[var(--cms-text)] truncate" title={file.name}>{file.name}</p>
                    <p className="text-xs text-[var(--cms-muted)] mt-0.5">{formatBytes(file.size)}</p>
                    <div className="flex gap-1.5 mt-2">
                      <button
                        id={`copy-url-${file.id}`}
                        onClick={() => handleCopyUrl(file)}
                        className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                          copiedId === file.id
                            ? "bg-[var(--cms-success)] text-white"
                            : "bg-[var(--cms-surface)] border border-[var(--cms-border)] text-[var(--cms-text-2)] hover:border-[var(--cms-accent)] hover:text-[var(--cms-accent)]"
                        }`}
                      >
                        {copiedId === file.id ? "✓ Copied" : "Copy URL"}
                      </button>
                      <button
                        id={`delete-btn-${file.id}`}
                        onClick={() => handleDelete(file)}
                        disabled={deletingId === file.id}
                        className="p-1.5 rounded-md bg-[var(--cms-surface)] border border-[var(--cms-border)] text-[var(--cms-muted)] hover:bg-[#FEF2F2] hover:border-[var(--cms-danger)] hover:text-[var(--cms-danger)] transition-colors disabled:opacity-50"
                      >
                        {deletingId === file.id
                          ? <div className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
                          : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        }
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          ) : (

            /* ── List ── */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--cms-border)] bg-[var(--cms-surface-2)]">
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-[var(--cms-muted)]">Preview</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-[var(--cms-muted)]">File Name</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-[var(--cms-muted)]">Type</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-[var(--cms-muted)]">Size</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-[var(--cms-muted)]">Uploaded</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-[var(--cms-muted)] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--cms-border)]">
                  {filtered.map((file) => (
                    <tr key={file.id} className="hover:bg-[var(--cms-surface-2)] transition-colors group">
                      <td className="p-4">
                        <div
                          className="w-12 h-12 rounded-lg overflow-hidden border border-[var(--cms-border)] cursor-pointer"
                          onClick={() => setLightboxFile(file)}
                        >
                          {file.contentType.startsWith("image/") ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={file.url} alt={file.name} className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl bg-[var(--cms-surface-2)]">📄</div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-semibold text-[var(--cms-text)] max-w-[240px] truncate" title={file.name}>{file.name}</p>
                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--cms-accent)] hover:underline">Open ↗</a>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 text-xs font-semibold rounded-md bg-[var(--cms-surface-2)] text-[var(--cms-text-2)] border border-[var(--cms-border)]">
                          {file.contentType.split("/")[1]?.toUpperCase() ?? file.contentType}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-[var(--cms-text-2)]">{formatBytes(file.size)}</td>
                      <td className="p-4 text-sm text-[var(--cms-muted)]">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {formatDate(file.uploadedAt as any)}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            id={`copy-url-list-${file.id}`}
                            onClick={() => handleCopyUrl(file)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                              copiedId === file.id
                                ? "bg-[var(--cms-success)] text-white border-transparent"
                                : "bg-[var(--cms-surface)] border-[var(--cms-border)] text-[var(--cms-text-2)] hover:border-[var(--cms-accent)] hover:text-[var(--cms-accent)]"
                            }`}
                          >
                            {copiedId === file.id ? "✓ Copied" : "Copy URL"}
                          </button>
                          <button
                            id={`delete-list-${file.id}`}
                            onClick={() => handleDelete(file)}
                            disabled={deletingId === file.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border bg-[var(--cms-surface)] border-[var(--cms-border)] text-[var(--cms-text-2)] hover:bg-[#FEF2F2] hover:border-[var(--cms-danger)] hover:text-[var(--cms-danger)] transition-colors disabled:opacity-50"
                          >
                            {deletingId === file.id ? "Deleting…" : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ── Upload Modal ── */}
      {isUploaderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--cms-surface)] border border-[var(--cms-border)] w-full max-w-md rounded-2xl shadow-2xl">
            <div className="p-6 border-b border-[var(--cms-border)] flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[var(--cms-text)]">Upload to Media Library</h2>
                <p className="text-xs text-[var(--cms-muted)] mt-0.5">Files are stored in Firebase Storage</p>
              </div>
              <button
                id="close-upload-modal"
                onClick={() => setIsUploaderOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--cms-muted)] hover:bg-[var(--cms-surface-2)] transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <ImageUploader folder="media" onUploaded={handleUploaded} label="" fullWidth />
              <p className="text-xs text-[var(--cms-muted)] text-center">
                Supported: PNG, JPG, JPEG, WebP, GIF, SVG · Max 10 MB
              </p>
            </div>
            <div className="p-4 border-t border-[var(--cms-border)] bg-[var(--cms-surface-2)] rounded-b-2xl flex justify-end">
              <button onClick={() => setIsUploaderOpen(false)} className="cms-btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightboxFile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setLightboxFile(null)}
        >
          <div
            className="relative max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              id="close-lightbox"
              onClick={() => setLightboxFile(null)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              ✕
            </button>
            {lightboxFile.contentType.startsWith("image/") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={lightboxFile.url} alt={lightboxFile.name} className="max-w-full max-h-[80vh] object-contain" />
            ) : (
              <div className="w-80 h-48 flex items-center justify-center bg-[var(--cms-surface)] text-6xl">📄</div>
            )}
            {/* Caption strip */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{lightboxFile.name}</p>
                <p className="text-xs text-white/60 mt-0.5">{formatBytes(lightboxFile.size)} · {lightboxFile.contentType}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => handleCopyUrl(lightboxFile)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    copiedId === lightboxFile.id
                      ? "bg-[var(--cms-success)] text-white"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  {copiedId === lightboxFile.id ? "✓ Copied!" : "Copy URL"}
                </button>
                <button
                  onClick={() => handleDelete(lightboxFile)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--cms-danger)]/80 text-white hover:bg-[var(--cms-danger)] transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
