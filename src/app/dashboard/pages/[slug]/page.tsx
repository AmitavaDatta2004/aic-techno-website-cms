"use client";
// src/app/dashboard/pages/[slug]/page.tsx
// Full-screen Visual Page Builder Editor interface.
// Layout: Topbar + 3-column split (Left: Component Library, Center: Canvas, Right: Properties Panel)

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Globe,
  ExternalLink,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  PanelLeft,
  PanelRight,
} from "lucide-react";
import {
  getPage,
  updatePage,
  publishPage,
  unpublishPage,
  type CustomPage,
  type PageComponent,
} from "@/lib/firestore";
import { getComponentDef } from "@/lib/components/registry";
import { ComponentPanel } from "../components/ComponentPanel";
import { Canvas } from "../components/Canvas";
import { PropertiesPanel } from "../components/PropertiesPanel";

export default function PageEditor({
  params: paramsPromise,
}: {
  params: Promise<{ slug: string }>;
}) {
  const params = use(paramsPromise);
  const router = useRouter();
  const [page, setPage] = useState<CustomPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const lastSavedRef = useRef<string>("");

  useEffect(() => {
    async function load() {
      try {
        const docData = await getPage(params.slug);
        if (docData) {
          setPage(docData);
          lastSavedRef.current = JSON.stringify({
            title: docData.title,
            meta: docData.meta,
            components: docData.components,
          });
        } else {
          showToast("Page not found", "error");
          router.push("/dashboard/pages");
        }
      } catch (err) {
        console.error(err);
        showToast("Error loading page", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.slug, router]);

  const currentSnapshot = page
    ? JSON.stringify({ title: page.title, meta: page.meta, components: page.components })
    : "";
  const hasUnsavedChanges = page ? currentSnapshot !== lastSavedRef.current : false;

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. If you leave now, your changes will be lost.";
        return e.returnValue;
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  // ─── Canvas Actions ─────────────────────────────────────────────────────────

  function handleAddComponent(type: string) {
    if (!page) return;
    const def = getComponentDef(type);
    const newComp: PageComponent = {
      id: `comp-${Date.now()}`,
      type,
      order: page.components.length,
      visible: true,
      props: { ...(def?.defaultProps ?? {}) },
    };
    setPage((prev) =>
      prev ? { ...prev, components: [...prev.components, newComp] } : null
    );
    setSelectedId(newComp.id);
  }

  function handleUpdateProps(id: string, newProps: Record<string, unknown>) {
    setPage((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        components: prev.components.map((c) =>
          c.id === id ? { ...c, props: newProps } : c
        ),
      };
    });
  }

  function handleMove(id: string, direction: -1 | 1) {
    setPage((prev) => {
      if (!prev) return null;
      const sorted = [...prev.components].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((c) => c.id === id);
      if (idx === -1) return prev;
      const targetIdx = idx + direction;
      if (targetIdx < 0 || targetIdx >= sorted.length) return prev;

      [sorted[idx], sorted[targetIdx]] = [sorted[targetIdx], sorted[idx]];
      const reordered = sorted.map((c, i) => ({ ...c, order: i }));
      return { ...prev, components: reordered };
    });
  }

  function handleDuplicate(id: string) {
    setPage((prev) => {
      if (!prev) return null;
      const target = prev.components.find((c) => c.id === id);
      if (!target) return prev;
      const dup: PageComponent = {
        ...target,
        id: `comp-${Date.now()}`,
        order: target.order + 0.5,
      };
      const sorted = [...prev.components, dup].sort((a, b) => a.order - b.order);
      const reordered = sorted.map((c, i) => ({ ...c, order: i }));
      return { ...prev, components: reordered };
    });
  }

  function handleToggleVisibility(id: string) {
    setPage((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        components: prev.components.map((c) =>
          c.id === id ? { ...c, visible: !c.visible } : c
        ),
      };
    });
  }

  function handleDelete(id: string) {
    setPage((prev) => {
      if (!prev) return null;
      const filtered = prev.components.filter((c) => c.id !== id);
      const reordered = filtered.map((c, i) => ({ ...c, order: i }));
      return { ...prev, components: reordered };
    });
    if (selectedId === id) setSelectedId(null);
  }

  function handleReorder(oldIndex: number, newIndex: number) {
    setPage((prev) => {
      if (!prev) return null;
      const sorted = [...prev.components].sort((a, b) => a.order - b.order);
      const [moved] = sorted.splice(oldIndex, 1);
      sorted.splice(newIndex, 0, moved);
      const reordered = sorted.map((c, i) => ({ ...c, order: i }));
      return { ...prev, components: reordered };
    });
  }

  // ─── Persistence ────────────────────────────────────────────────────────────

  async function handleSaveDraft() {
    if (!page) return;
    setSaving(true);
    try {
      await updatePage(page.id, {
        title: page.title,
        meta: page.meta,
        components: page.components,
      });
      lastSavedRef.current = currentSnapshot;
      showToast("Draft saved!");
    } catch (err) {
      console.error(err);
      showToast("Save failed", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!page) return;
    setPublishing(true);
    try {
      await updatePage(page.id, {
        title: page.title,
        meta: page.meta,
        components: page.components,
      });
      await publishPage(page.id);
      lastSavedRef.current = currentSnapshot;
      setPage((prev) => (prev ? { ...prev, status: "published" } : null));
      showToast("Page published live!");
    } catch (err) {
      console.error(err);
      showToast("Publish failed", "error");
    } finally {
      setPublishing(false);
    }
  }

  async function handleUnpublish() {
    if (!page) return;
    setPublishing(true);
    try {
      await unpublishPage(page.id);
      setPage((prev) => (prev ? { ...prev, status: "draft" } : null));
      showToast("Page unpublished (hidden from live site)");
    } catch (err) {
      console.error(err);
      showToast("Unpublish failed", "error");
    } finally {
      setPublishing(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="w-10 h-10 border-2 border-[#800020] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!page) return null;

  const selectedComp = page.components.find((c) => c.id === selectedId);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#F8F9FA] select-none">
      {/* Editor Topbar */}
      <header className="h-14 bg-white border-b border-[#E5E7EB] px-4 flex items-center justify-between shrink-0 z-30 shadow-xs">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (hasUnsavedChanges && !confirm("You have unsaved changes. Are you sure you want to go back without saving?")) {
                return;
              }
              router.push("/dashboard/pages");
            }}
            className="p-1.5 hover:bg-[#F1F5F9] rounded-lg text-[#64748B] transition-colors"
            title="Back to Pages"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-[#E2E8F0]" />
          <div>
            <input
              type="text"
              value={page.title}
              onChange={(e) =>
                setPage((prev) => (prev ? { ...prev, title: e.target.value } : null))
              }
              className="font-black text-sm text-[#0F172A] bg-transparent border border-transparent hover:border-[#E5E7EB] focus:border-[#800020] focus:bg-white rounded px-1.5 py-0.5 outline-none transition-all"
            />
            <span className="text-[11px] text-[#94A3B8] font-mono ml-1.5">
              /{page.slug}
            </span>
          </div>
        </div>

        {/* Center: Controls & View Toggles */}
        <div className="hidden md:flex items-center gap-1.5 bg-[#F1F5F9] p-1 rounded-lg text-[11px] font-bold text-[#64748B]">
          <button
            onClick={() => setShowLeftPanel((prev) => !prev)}
            className={`p-1.5 rounded transition-all flex items-center gap-1 ${
              showLeftPanel
                ? "bg-white shadow-xs text-[#0F172A]"
                : "text-[#94A3B8] hover:text-[#0F172A]"
            }`}
            title="Toggle Component Library"
          >
            <PanelLeft className="w-3.5 h-3.5" />
            <span>Library</span>
          </button>

          <span className="w-px h-3 bg-[#CBD5E1]" />

          <span className="px-2 py-0.5 text-[#0F172A]">
            🖥️ Desktop Canvas ({page.components.length})
          </span>

          <span className="w-px h-3 bg-[#CBD5E1]" />

          <button
            onClick={() => setShowRightPanel((prev) => !prev)}
            className={`p-1.5 rounded transition-all flex items-center gap-1 ${
              showRightPanel
                ? "bg-white shadow-xs text-[#0F172A]"
                : "text-[#94A3B8] hover:text-[#0F172A]"
            }`}
            title="Toggle Inspector Panel"
          >
            <PanelRight className="w-3.5 h-3.5" />
            <span>Inspector</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Unsaved Changes / Status Badge */}
          {hasUnsavedChanges ? (
            <span
              className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1.5 shadow-xs animate-pulse"
              title="You have unsaved changes! Click Save Changes to save your work."
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              Unsaved Changes
            </span>
          ) : (
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                page.status === "published"
                  ? "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
                  : "bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]"
              }`}
            >
              ● {page.status}
            </span>
          )}

          <a
            href={`page.html?slug=${page.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="cms-btn-secondary text-xs py-1.5 px-3"
            title="View Live Page"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </a>

          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className={`text-xs py-1.5 px-3 rounded-lg font-extrabold flex items-center gap-1.5 transition-all ${
              hasUnsavedChanges
                ? "bg-amber-400 text-amber-950 border border-amber-500 shadow-md ring-2 ring-amber-400/50 hover:bg-amber-300 animate-pulse cursor-pointer"
                : "cms-btn-secondary text-[#64748B]"
            }`}
            title={hasUnsavedChanges ? "You have unsaved changes! Click to save." : "Save Draft"}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? "Saving..." : hasUnsavedChanges ? "Save Changes *" : "Save Draft"}</span>
          </button>

          {/* Toggle Publish / Unpublish Button */}
          {page.status === "published" ? (
            <button
              onClick={handleUnpublish}
              disabled={publishing}
              className="text-xs py-1.5 px-3 rounded-lg font-bold border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors flex items-center gap-1.5"
              title="Unpublish page (make invisible on live website)"
            >
              <EyeOff className="w-3.5 h-3.5 text-amber-700" />
              <span>{publishing ? "Updating..." : "Unpublish (Draft)"}</span>
            </button>
          ) : (
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="cms-btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
              title="Publish page live to public website"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{publishing ? "Publishing..." : "Publish Live"}</span>
            </button>
          )}
        </div>
      </header>

      {/* Main 3-Column Studio Layout */}
      <div className="flex-1 flex overflow-hidden w-full">
        {/* Left Column: Component Panel (240px) */}
        {showLeftPanel && (
          <div className="w-60 shrink-0 border-r border-[#E5E7EB] bg-white transition-all">
            <ComponentPanel onAdd={handleAddComponent} />
          </div>
        )}

        {/* Middle Column: Canvas (Fluid) */}
        <div className="flex-1 overflow-y-auto bg-[#F1F5F9] flex flex-col min-w-0">
          <Canvas
            components={page.components}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onMoveUp={(id) => handleMove(id, -1)}
            onMoveDown={(id) => handleMove(id, 1)}
            onDuplicate={handleDuplicate}
            onToggleVisibility={handleToggleVisibility}
            onDelete={handleDelete}
            onReorder={handleReorder}
            onAddComponent={() => {
              if (!showLeftPanel) setShowLeftPanel(true);
            }}
            onUpdateProps={handleUpdateProps}
          />
        </div>

        {/* Right Column: Properties Panel (288px) */}
        {showRightPanel && (
          <div className="w-72 shrink-0 border-l border-[#E5E7EB] bg-white transition-all">
            {selectedComp ? (
              <PropertiesPanel
                key={selectedComp.id}
                component={selectedComp}
                onChange={handleUpdateProps}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-white">
                <div className="text-4xl mb-2">👆</div>
                <h4 className="text-xs font-bold text-[#0F172A] mb-1">
                  No Component Selected
                </h4>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                  Click any component block on the canvas to edit its properties, text, and images.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast Notification */}
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
    </div>
  );
}
