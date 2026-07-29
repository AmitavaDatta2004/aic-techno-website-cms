"use client";
// src/app/dashboard/pages/page.tsx
// Pages list dashboard — shows all created pages as cards.
// Provides: Create, Edit, Preview, Duplicate, Delete actions.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Layout,
  Plus,
  ExternalLink,
  Pencil,
  Copy,
  Trash2,
  Globe,
  FileText,
  Clock,
} from "lucide-react";
import { Topbar } from "@/components/cms/Topbar";
import {
  subscribePages,
  addPage,
  deletePage,
  publishPage,
  unpublishPage,
  type CustomPage,
} from "@/lib/firestore";
import { TemplatePickerModal } from "./components/TemplatePickerModal";

// ─── Status Toggle ─────────────────────────────────────────────────────────────

function StatusToggle({
  status,
  onToggle,
  toggling,
}: {
  status: "draft" | "published";
  onToggle: () => void;
  toggling: boolean;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      disabled={toggling}
      title={
        status === "published"
          ? "Click to Unpublish (set to Draft)"
          : "Click to Publish Live"
      }
      className={`cms-badge cursor-pointer transition-all hover:scale-105 active:scale-95 ${
        status === "published"
          ? "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] hover:bg-[#D1FAE5]"
          : "bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0] hover:bg-[#E2E8F0]"
      }`}
    >
      {toggling ? (
        <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : status === "published" ? (
        <Globe className="w-3 h-3 shrink-0" />
      ) : (
        <FileText className="w-3 h-3 shrink-0" />
      )}
      <span className="capitalize">{toggling ? "Saving..." : status}</span>
    </button>
  );
}

// ─── Page Card ────────────────────────────────────────────────────────────────

interface PageCardProps {
  page: CustomPage;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
  toggling: boolean;
}

const TEMPLATE_ICONS: Record<string, string> = {
  landing:  "🚀",
  startup:  "💡",
  event:    "📅",
  mentor:   "🎓",
  gallery:  "🖼️",
  blog:     "📰",
  custom:   "✏️",
};

function PageCard({
  page,
  onEdit,
  onDuplicate,
  onDelete,
  onTogglePublish,
  toggling,
}: PageCardProps) {
  const [confirming, setConfirming] = useState(false);

  function handleDelete() {
    if (confirming) {
      onDelete();
      setConfirming(false);
    } else {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
    }
  }

  return (
    <div className="cms-card p-5 group hover:shadow-md transition-all">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-2xl shrink-0">
            {TEMPLATE_ICONS[page.template] ?? "📄"}
          </span>
          <div className="min-w-0">
            <h3 className="font-black text-sm text-[#0F172A] truncate group-hover:text-[#800020] transition-colors">
              {page.title}
            </h3>
            <p className="text-[11px] text-[#94A3B8] font-mono truncate">
              /{page.slug}
            </p>
          </div>
        </div>
        <StatusToggle
          status={page.status}
          onToggle={onTogglePublish}
          toggling={toggling}
        />
      </div>

      {/* Meta */}
      <div className="flex items-center gap-2 text-[10px] text-[#94A3B8] mb-4">
        <Layout className="w-3 h-3 shrink-0" />
        <span className="capitalize">{page.template} template</span>
        <span>·</span>
        <span>{page.components?.length ?? 0} components</span>
        <span>·</span>
        <Clock className="w-3 h-3 shrink-0" />
        <span>
          {page.updatedAt
            ? new Date((page.updatedAt as unknown as { seconds: number }).seconds * 1000).toLocaleDateString()
            : "Just now"}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onEdit}
          className="cms-btn-primary text-xs py-1.5 px-3 flex-1 justify-center"
        >
          <Pencil className="w-3 h-3" />
          Edit
        </button>

        <a
          href={`page.html?slug=${page.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          title="View Live Page"
          className="cms-btn-secondary text-xs py-1.5 px-3"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <button
          onClick={onDuplicate}
          title="Duplicate"
          className="cms-btn-secondary text-xs py-1.5 px-3"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleDelete}
          title={confirming ? "Click again to confirm delete" : "Delete"}
          className={`text-xs py-1.5 px-3 rounded-lg border font-bold transition-all ${
            confirming
              ? "bg-red-600 text-white border-red-600"
              : "bg-white text-[#64748B] border-[#E5E7EB] hover:text-red-600 hover:border-red-200 hover:bg-red-50"
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PagesListPage() {
  const router = useRouter();
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const unsub = subscribePages((list) => {
      setPages(list);
      setLoading(false);
    });
    return unsub;
  }, []);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleTogglePublish(page: CustomPage) {
    setTogglingId(page.id);
    try {
      if (page.status === "published") {
        await unpublishPage(page.id);
        showToast(`"${page.title}" set to Draft (unpublished)`);
      } else {
        await publishPage(page.id);
        showToast(`"${page.title}" published live!`);
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to update status", "error");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleCreate(
    data: Omit<CustomPage, "id" | "createdAt" | "updatedAt" | "publishedAt">
  ) {
    try {
      const id = await addPage({ ...data, order: pages.length });
      setShowModal(false);
      showToast(`Page "${data.title}" created!`);
      router.push(`/dashboard/pages/${id}`);
    } catch (err) {
      console.error(err);
      showToast("Failed to create page", "error");
    }
  }

  async function handleDuplicate(page: CustomPage) {
    const newSlug = `${page.slug}-copy-${Date.now().toString(36)}`;
    const newTitle = `${page.title} (Copy)`;
    const { id: _oldId, ...pageData } = page;
    try {
      const id = await addPage({
        ...pageData,
        slug: newSlug,
        title: newTitle,
        status: "draft",
        order: pages.length,
        publishedAt: null,
      });
      showToast(`Duplicated as "${newTitle}"`);
      router.push(`/dashboard/pages/${id}`);
    } catch (err) {
      console.error(err);
      showToast("Failed to duplicate page", "error");
    }
  }

  async function handleDelete(page: CustomPage) {
    try {
      await deletePage(page.id);
      showToast(`"${page.title}" deleted`);
    } catch (err) {
      console.error(err);
      showToast("Failed to delete page", "error");
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Page Builder"
        breadcrumb="Pages List"
        actions={
          <button
            id="create-page-btn"
            onClick={() => setShowModal(true)}
            className="cms-btn-primary"
          >
            <Plus className="w-4 h-4" />
            Create Page
          </button>
        }
      />

      <div className="flex-1 p-6">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-[#800020] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : pages.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="text-5xl">📄</div>
            <div className="text-center">
              <h3 className="text-base font-black text-[#0F172A] mb-1">
                No pages yet
              </h3>
              <p className="text-sm text-[#64748B] mb-4">
                Create your first page using the visual editor
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="cms-btn-primary"
              >
                <Plus className="w-4 h-4" />
                Create First Page
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pages.map((page) => (
              <PageCard
                key={page.id}
                page={page}
                onEdit={() => router.push(`/dashboard/pages/${page.id}`)}
                onDuplicate={() => handleDuplicate(page)}
                onDelete={() => handleDelete(page)}
                onTogglePublish={() => handleTogglePublish(page)}
                toggling={togglingId === page.id}
              />
            ))}

            {/* Add more card */}
            <button
              onClick={() => setShowModal(true)}
              className="cms-card border-dashed flex flex-col items-center justify-center gap-2 py-8 hover:border-[#800020] hover:bg-[#FFF8F9] transition-all cursor-pointer min-h-[180px]"
            >
              <div className="w-10 h-10 rounded-full bg-[#F1F5F9] flex items-center justify-center">
                <Plus className="w-5 h-5 text-[#94A3B8]" />
              </div>
              <span className="text-xs text-[#94A3B8] font-semibold">New Page</span>
            </button>
          </div>
        )}
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold animate-fade-in ${
            toast.type === "error"
              ? "bg-red-600 text-white"
              : "bg-[#059669] text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Template Picker Modal */}
      {showModal && (
        <TemplatePickerModal
          onConfirm={handleCreate}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
