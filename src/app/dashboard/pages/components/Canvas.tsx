"use client";
// src/app/dashboard/pages/components/Canvas.tsx
// The central editor canvas. Renders components as styled preview blocks.
// Supports click-to-select, drag-to-reorder (via @dnd-kit), and direct inline
// text editing on double-click for titles, subtitles, paragraphs, buttons, and cards.

import { useRef } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, EyeOff, Edit3 } from "lucide-react";
import { getComponentDef } from "@/lib/components/registry";
import { renderComponent } from "@/lib/components/renderers";
import { BlockToolbar } from "./BlockToolbar";
import type { PageComponent } from "@/lib/firestore";

// ─── Page Builder CSS (injected once in the canvas) ───────────────────────────
const CANVAS_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Outfit:wght@600;700;800;900&display=swap');

  /* Typography & Core Design Tokens */
  .pb-hero, .pb-section, .pb-banner-alert, .pb-footer {
    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  .pb-hero-title, .pb-sec-h, .pb-pricing-name, .pb-stat-value, .pb-big-quote {
    font-family: 'Outfit', 'Plus Jakarta Sans', sans-serif;
  }

  /* Hero Section */
  .pb-hero {
    min-height: 280px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    background: radial-gradient(ellipse at 50% 0%, rgba(128, 0, 32, 0.45) 0%, rgba(10, 10, 15, 0.98) 70%), linear-gradient(135deg, #0A0A0F 0%, #17071C 100%);
  }
  .pb-hero-overlay {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 80% 20%, rgba(128, 0, 32, 0.25), transparent 45%), rgba(0, 0, 0, 0.4);
    pointer-events: none;
  }
  .pb-hero-title {
    font-size: 2.25rem;
    font-weight: 900;
    color: #FFFFFF;
    margin: 0 0 0.85rem;
    line-height: 1.12;
    letter-spacing: -0.03em;
    text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  }
  .pb-hero-sub {
    font-size: 0.95rem;
    color: rgba(255, 255, 255, 0.8);
    margin: 0 0 1.75rem;
    max-width: 620px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.65;
  }

  /* Executive Buttons */
  .pb-btn-group { display: flex; gap: 0.85rem; flex-wrap: wrap; margin-top: 1.25rem; }
  .pb-btn-primary {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 0.75rem 1.75rem;
    background: linear-gradient(135deg, #800020 0%, #600018 100%);
    color: #FFFFFF; font-weight: 800; font-size: 0.825rem;
    letter-spacing: 0.02em; border-radius: 10px; text-decoration: none;
    box-shadow: 0 4px 16px rgba(128, 0, 32, 0.35);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .pb-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(128, 0, 32, 0.5);
    background: linear-gradient(135deg, #990026 0%, #70001C 100%);
  }
  .pb-btn-primary.pb-btn-white {
    background: #FFFFFF; color: #800020;
    box-shadow: 0 4px 16px rgba(255, 255, 255, 0.2);
  }
  .pb-btn-primary.pb-btn-white:hover {
    background: #FFF5F7; color: #600018;
    transform: translateY(-2px);
  }
  .pb-btn-secondary {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 0.75rem 1.75rem;
    background: rgba(255, 255, 255, 0.08); color: #FFFFFF;
    font-weight: 700; font-size: 0.825rem; border-radius: 10px;
    text-decoration: none; border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px); transition: all 0.25s ease;
  }
  .pb-btn-secondary:hover {
    background: rgba(255, 255, 255, 0.16);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-2px);
  }
  .pb-btn-ghost {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 0.75rem 1.75rem; background: transparent; color: #FFFFFF;
    font-weight: 700; font-size: 0.825rem; border-radius: 10px;
    text-decoration: none; border: 1px solid rgba(255, 255, 255, 0.3);
    transition: all 0.25s ease;
  }
  .pb-btn-ghost:hover {
    border-color: #FFFFFF; background: rgba(255, 255, 255, 0.08);
  }

  /* Section Containers */
  .pb-section { padding: 3.5rem 0; position: relative; }
  .pb-section-dark {
    background: #0B0E14; color: #E2E8F0;
    background-image: radial-gradient(circle at 100% 0%, rgba(128, 0, 32, 0.12), transparent 40%);
  }
  .pb-section-light {
    background: #F8F9FA; color: #0F172A;
    background-image: radial-gradient(circle at 0% 100%, rgba(128, 0, 32, 0.04), transparent 40%);
  }
  .pb-section-maroon {
    background: linear-gradient(135deg, #800020 0%, #4A0012 100%);
    color: #FFFFFF;
  }
  .pb-container { max-width: 960px; margin: 0 auto; padding: 0 1.5rem; }
  .pb-narrow { max-width: 680px; margin: 0 auto; padding: 0 1.5rem; }
  .pb-center { text-align: center; }
  .pb-center-row { justify-content: center; }
  .pb-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 2.5rem; align-items: center; }

  /* Section Header Elements */
  .pb-sec-tag {
    display: inline-block; font-size: 0.68rem; font-weight: 800;
    text-transform: uppercase; letter-spacing: 0.14em; color: #800020;
    background: linear-gradient(135deg, #FFF0F3 0%, #FFE4E8 100%);
    padding: 0.35rem 0.9rem; border-radius: 100px; margin-bottom: 0.85rem;
    box-shadow: 0 2px 8px rgba(128, 0, 32, 0.08);
  }
  .pb-sec-h {
    font-size: 1.65rem; font-weight: 900; margin: 0 0 0.85rem;
    line-height: 1.2; color: #0F172A; letter-spacing: -0.02em;
  }
  .pb-sec-h.pb-light { color: #F8FAFC; }
  .pb-sec-p { font-size: 0.9rem; color: #64748B; line-height: 1.7; margin: 0 0 1.25rem; }
  .pb-sec-p.pb-light { color: rgba(248, 250, 252, 0.75); }
  .pb-sec-header { text-align: center; margin-bottom: 2.25rem; }

  /* Grids */
  .pb-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
  .pb-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
  .pb-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; }

  /* Premium Cards */
  .pb-card {
    background: rgba(255, 255, 255, 0.035);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px; padding: 1.5rem;
    backdrop-filter: blur(12px);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .pb-card:hover {
    border-color: rgba(128, 0, 32, 0.4);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    transform: translateY(-3px);
  }
  .pb-card-light {
    background: #FFFFFF; border: 1px solid #E2E8F0;
    border-radius: 16px; padding: 1.5rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .pb-card-light:hover {
    border-color: rgba(128, 0, 32, 0.3);
    box-shadow: 0 12px 30px rgba(128, 0, 32, 0.08);
    transform: translateY(-3px);
  }
  .pb-card-icon { font-size: 2rem; margin-bottom: 0.75rem; }
  .pb-card-title { font-size: 0.95rem; font-weight: 800; color: #F8FAFC; margin-bottom: 0.5rem; letter-spacing: -0.01em; }
  .pb-card-title.pb-dark { color: #0F172A; }
  .pb-card-body { font-size: 0.825rem; color: rgba(255, 255, 255, 0.65); line-height: 1.65; }
  .pb-card-body.pb-dark-sub { color: #64748B; }
  .pb-card-link { display: inline-block; margin-top: 0.85rem; font-size: 0.78rem; font-weight: 800; color: #800020; text-decoration: none; }
  .pb-card-link.pb-light-link { color: #800020; }

  /* Pricing Cards */
  .pb-pricing-card {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px; padding: 2.25rem 2rem; position: relative;
    text-align: left; display: flex; flex-direction: column; gap: 1.15rem;
    backdrop-filter: blur(16px); transition: all 0.3s ease;
  }
  .pb-pricing-card:hover { transform: translateY(-4px); }
  .pb-pricing-popular {
    background: linear-gradient(145deg, rgba(128, 0, 32, 0.35) 0%, rgba(11, 14, 20, 0.98) 100%);
    border: 2px solid #800020;
    box-shadow: 0 16px 40px rgba(128, 0, 32, 0.25);
  }
  .pb-pricing-badge {
    position: absolute; top: -13px; right: 24px;
    background: linear-gradient(135deg, #800020, #A00028);
    color: #FFFFFF; font-size: 9px; font-weight: 900;
    letter-spacing: 1.8px; padding: 4px 12px; border-radius: 100px;
    box-shadow: 0 4px 12px rgba(128, 0, 32, 0.4);
  }
  .pb-pricing-name { font-size: 1.2rem; font-weight: 900; color: #FFFFFF; }
  .pb-pricing-price-wrap { display: flex; align-items: baseline; gap: 4px; }
  .pb-pricing-price { font-size: 2.25rem; font-weight: 900; color: #FFFFFF; }
  .pb-pricing-period { font-size: 0.85rem; color: rgba(255, 255, 255, 0.5); }
  .pb-pricing-desc { font-size: 0.825rem; color: rgba(255, 255, 255, 0.65); line-height: 1.6; }
  .pb-pricing-feats { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; font-size: 0.8rem; color: rgba(255, 255, 255, 0.85); }

  /* Partner Logos */
  .pb-logos-row { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 1.5rem; margin-top: 1.75rem; }
  .pb-logo-item {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 0.85rem 1.75rem; background: #FFFFFF; border: 1px solid #E2E8F0;
    border-radius: 12px; font-size: 0.875rem; font-weight: 800; color: #0F172A;
    text-decoration: none; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
    transition: all 0.25s ease;
  }
  .pb-logo-item:hover { transform: translateY(-2px); border-color: #800020; box-shadow: 0 6px 16px rgba(128, 0, 32, 0.1); }
  .pb-logo-item img { max-height: 42px; width: auto; object-fit: contain; }

  /* News Cards */
  .pb-news-card {
    background: rgba(255, 255, 255, 0.035);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 18px; overflow: hidden; text-align: left;
    transition: all 0.25s ease;
  }
  .pb-news-card:hover { border-color: rgba(128, 0, 32, 0.4); transform: translateY(-3px); }
  .pb-news-img { height: 170px; overflow: hidden; background: rgba(255, 255, 255, 0.04); }
  .pb-news-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
  .pb-news-card:hover .pb-news-img img { transform: scale(1.05); }
  .pb-news-content { padding: 1.5rem; }
  .pb-news-meta { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.85rem; }
  .pb-news-date { font-size: 0.725rem; color: rgba(255, 255, 255, 0.45); font-weight: 600; }

  /* Step Process */
  .pb-step-card {
    background: rgba(255, 255, 255, 0.035);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 18px; padding: 1.75rem 1.5rem; text-align: left; position: relative;
    transition: all 0.25s ease;
  }
  .pb-step-card:hover { border-color: rgba(128, 0, 32, 0.4); transform: translateY(-3px); }
  .pb-step-num {
    font-size: 2.75rem; font-weight: 900; color: #800020;
    margin-bottom: 0.5rem; line-height: 1; letter-spacing: -0.03em;
    opacity: 0.85;
  }

  /* Quotes Banner */
  .pb-big-quote {
    font-size: 1.45rem; font-weight: 800; line-height: 1.6;
    color: #FFFFFF; font-style: italic; margin: 0 auto; max-width: 800px;
    letter-spacing: -0.01em; text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }

  /* Job Board */
  .pb-jobs-list { display: flex; flex-direction: column; gap: 1rem; margin-top: 1.75rem; }
  .pb-job-card {
    background: #FFFFFF; border: 1px solid #E2E8F0;
    border-radius: 16px; padding: 1.35rem 1.75rem;
    display: flex; align-items: center; justify-content: space-between;
    gap: 1.25rem; text-align: left; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
    transition: all 0.25s ease;
  }
  .pb-job-card:hover { border-color: #800020; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(128, 0, 32, 0.08); }

  /* Resource Cards */
  .pb-res-card {
    background: rgba(255, 255, 255, 0.035);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px; padding: 1.35rem 1.5rem;
    display: flex; align-items: center; gap: 1.25rem; text-align: left;
    transition: all 0.25s ease;
  }
  .pb-res-card:hover { border-color: rgba(128, 0, 32, 0.4); transform: translateY(-2px); }
  .pb-res-icon { font-size: 2.25rem; }

  /* Video Showcase */
  .pb-video-wrap {
    position: relative; aspect-ratio: 16/9; width: 100%;
    border-radius: 20px; overflow: hidden; background: #000;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  .pb-video-wrap iframe { width: 100%; height: 100%; border: none; }
  .pb-video-placeholder {
    height: 100%; display: flex; align-items: center; justify-content: center;
    color: rgba(255, 255, 255, 0.55); font-size: 0.9rem; font-weight: 700;
  }

  /* Announcement Bar */
  .pb-banner-alert { padding: 0.85rem 1.5rem; color: #FFFFFF; text-align: center; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1); }
  .pb-banner-inner { display: flex; align-items: center; justify-content: center; gap: 14px; flex-wrap: wrap; font-size: 0.85rem; font-weight: 700; }
  .pb-banner-badge { background: rgba(255, 255, 255, 0.25); padding: 3px 10px; border-radius: 6px; font-size: 10px; font-weight: 900; letter-spacing: 1.2px; }
  .pb-banner-btn { background: #FFFFFF; color: #800020; padding: 5px 14px; border-radius: 8px; font-size: 0.78rem; font-weight: 800; text-decoration: none; transition: all 0.2s ease; }
  .pb-banner-btn:hover { background: #FFF0F3; transform: scale(1.03); }

  /* Comparison Table */
  .pb-comp-table {
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 18px; overflow: hidden; margin-top: 1.75rem;
    text-align: left; font-size: 0.875rem;
  }
  .pb-comp-row { display: grid; grid-template-columns: 2fr 1fr 1fr; padding: 1.15rem 1.75rem; border-bottom: 1px solid rgba(255, 255, 255, 0.06); color: rgba(255, 255, 255, 0.85); align-items: center; }
  .pb-comp-head { background: rgba(255, 255, 255, 0.08); font-weight: 800; color: #FFFFFF; }
  .pb-comp-highlight { color: #FFFFFF; font-weight: 800; background: rgba(128, 0, 32, 0.28); margin: -1.15rem -1.75rem; padding: 1.15rem 1.75rem; }

  /* Form Styling */
  .pb-form { display: flex; flex-direction: column; gap: 1rem; text-align: left; margin-top: 1.5rem; }
  .pb-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .pb-form-input {
    padding: 0.75rem 1.15rem; border: 1px solid #E2E8F0; border-radius: 10px;
    font-size: 0.85rem; width: 100%; outline: none; transition: all 0.2s ease;
    font-family: inherit;
  }
  .pb-form-input:focus { border-color: #800020; box-shadow: 0 0 0 4px rgba(128, 0, 32, 0.1); }
  .pb-form-textarea { min-height: 110px; resize: vertical; }

  /* Footer */
  .pb-footer { background: #07090E; border-top: 1px solid rgba(255, 255, 255, 0.08); padding: 3rem 0 1.75rem; }
  .pb-footer-inner { display: flex; align-items: flex-start; justify-content: space-between; gap: 2rem; margin-bottom: 2rem; flex-wrap: wrap; }
  .pb-footer-logo { font-size: 1.15rem; font-weight: 900; color: #FFFFFF; margin-bottom: 0.35rem; }
  .pb-footer-tagline { font-size: 0.75rem; color: rgba(255, 255, 255, 0.5); }
  .pb-footer-nav { display: flex; gap: 1.5rem; flex-wrap: wrap; align-items: center; }
  .pb-footer-nav a { font-size: 0.8rem; color: rgba(255, 255, 255, 0.6); text-decoration: none; font-weight: 600; transition: color 0.2s ease; }
  .pb-footer-nav a:hover { color: #FFFFFF; }
  .pb-footer-copy { font-size: 0.75rem; color: rgba(255, 255, 255, 0.35); border-top: 1px solid rgba(255, 255, 255, 0.06); padding-top: 1.25rem; }

  /* Inline Text Editing Indicators */
  [data-prop]:hover, [data-field]:hover {
    outline: 2px dashed rgba(128, 0, 32, 0.75) !important;
    outline-offset: 3px !important;
    border-radius: 6px !important;
    cursor: text !important;
  }
`;

// ─── Canvas Component ─────────────────────────────────────────────────────────

interface CanvasProps {
  components: PageComponent[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (oldIndex: number, newIndex: number) => void;
  onAddComponent: () => void;
  onUpdateProps: (id: string, newProps: Record<string, unknown>) => void;
}

export function Canvas({
  components,
  selectedId,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onToggleVisibility,
  onDelete,
  onReorder,
  onAddComponent,
  onUpdateProps,
}: CanvasProps) {
  const sorted = [...components].sort((a, b) => a.order - b.order);
  const ids = sorted.map((c) => c.id);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = ids.indexOf(String(active.id));
    const newIdx = ids.indexOf(String(over.id));
    if (oldIdx !== -1 && newIdx !== -1) {
      onReorder(oldIdx, newIdx);
    }
  }

  return (
    <div
      className="flex-1 overflow-y-auto bg-[#E5E7EB] p-4 sm:p-6"
      onClick={() => onSelect(null)}
    >
      {/* Canvas Viewport */}
      <div className="mx-auto max-w-[960px] bg-white shadow-xl rounded-xl overflow-hidden min-h-[500px]">
        {/* Injected CSS for preview */}
        <style dangerouslySetInnerHTML={{ __html: CANVAS_CSS }} />

        {/* DnD Context */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            {sorted.map((comp, idx) => (
              <SortableBlock
                key={comp.id}
                component={comp}
                isSelected={selectedId === comp.id}
                isFirst={idx === 0}
                isLast={idx === sorted.length - 1}
                onSelect={() => onSelect(comp.id)}
                onMoveUp={() => onMoveUp(comp.id)}
                onMoveDown={() => onMoveDown(comp.id)}
                onDuplicate={() => onDuplicate(comp.id)}
                onToggleVisibility={() => onToggleVisibility(comp.id)}
                onDelete={() => onDelete(comp.id)}
                onUpdateProps={onUpdateProps}
              />
            ))}
          </SortableContext>
        </DndContext>

        {/* Empty state / Add button */}
        <div
          className={`flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors border-2 border-dashed mx-6 my-6 rounded-xl py-8 ${
            sorted.length === 0
              ? "border-[#CBD5E1] hover:border-[#800020] hover:bg-[#FFF0F3]"
              : "border-transparent hover:border-[#CBD5E1]"
          }`}
          onClick={(e) => { e.stopPropagation(); onAddComponent(); }}
        >
          <div className="w-10 h-10 rounded-full bg-[#F1F5F9] flex items-center justify-center">
            <Plus className="w-5 h-5 text-[#94A3B8]" />
          </div>
          <p className="text-xs text-[#94A3B8] font-semibold">
            {sorted.length === 0 ? "Click to add your first component" : "Add Component"}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Sortable Block with Inline Text Editing ──────────────────────────────────

interface SortableBlockProps {
  component: PageComponent;
  isSelected: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onToggleVisibility: () => void;
  onDelete: () => void;
  onUpdateProps: (id: string, newProps: Record<string, unknown>) => void;
}

function SortableBlock({
  component,
  isSelected,
  isFirst,
  isLast,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onToggleVisibility,
  onDelete,
  onUpdateProps,
}: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: component.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const def = getComponentDef(component.type);
  const html = renderComponent(component);

  // ── Inline Text Editing on Double Click ───────────────────────────────────
  function handleDoubleClick(e: React.MouseEvent<HTMLDivElement>) {
    const rawTarget = e.target as HTMLElement;
    if (!rawTarget) return;

    // Find the nearest element with data-prop or data-field attribute
    const editableEl = rawTarget.closest("[data-prop], [data-field]") as HTMLElement;
    if (!editableEl) return;

    e.stopPropagation();
    editableEl.contentEditable = "true";
    editableEl.focus();
    editableEl.style.outline = "2px solid #800020";
    editableEl.style.borderRadius = "4px";

    const handleBlur = () => {
      editableEl.contentEditable = "false";
      editableEl.style.outline = "none";
      const newText = editableEl.innerText.trim();

      const directProp = editableEl.getAttribute("data-prop");
      const arrayProp = editableEl.getAttribute("data-array-prop");
      const arrayIdxStr = editableEl.getAttribute("data-array-idx");
      const fieldProp = editableEl.getAttribute("data-field");

      if (directProp && newText !== undefined) {
        onUpdateProps(component.id, {
          ...component.props,
          [directProp]: newText,
        });
      } else if (arrayProp && arrayIdxStr !== null && fieldProp) {
        const idx = parseInt(arrayIdxStr, 10);
        const currentArray = Array.isArray(component.props[arrayProp])
          ? [...(component.props[arrayProp] as Record<string, unknown>[])]
          : [];
        if (currentArray[idx]) {
          currentArray[idx] = { ...currentArray[idx], [fieldProp]: newText };
          onUpdateProps(component.id, {
            ...component.props,
            [arrayProp]: currentArray,
          });
        }
      }

      editableEl.removeEventListener("blur", handleBlur);
    };

    editableEl.addEventListener("blur", handleBlur, { once: true });
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onDoubleClick={handleDoubleClick}
    >
      {/* Selection outline */}
      {isSelected && (
        <div className="absolute inset-0 ring-2 ring-[#800020] ring-inset z-10 pointer-events-none rounded-sm" />
      )}

      {/* Block toolbar */}
      {isSelected && (
        <BlockToolbar
          visible={component.visible}
          isFirst={isFirst}
          isLast={isLast}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onDuplicate={onDuplicate}
          onToggleVisibility={onToggleVisibility}
          onDelete={onDelete}
        />
      )}

      {/* Drag handle — visible on hover */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity"
        onClick={(e) => e.stopPropagation()}
        title="Drag to reorder component position"
      >
        <div className="bg-[#0F172A] text-white rounded-lg p-1.5 shadow-lg flex items-center gap-1">
          <GripVertical className="w-4 h-4" />
        </div>
      </div>

      {/* Component type badge — visible on hover */}
      <div className="absolute right-2 top-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-[#0F172A] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow flex items-center gap-1.5">
          <span>{def?.icon}</span>
          <span>{def?.label ?? component.type}</span>
          <span title="Double click text to edit inline">
            <Edit3 className="w-3 h-3 text-[#94A3B8] ml-1" />
          </span>
        </div>
      </div>

      {/* Hidden indicator */}
      {!component.visible && (
        <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-10 pointer-events-none">
          <EyeOff className="w-6 h-6 text-[#94A3B8] mb-1" />
          <span className="text-xs text-[#94A3B8] font-semibold">Hidden — Click to edit</span>
        </div>
      )}

      {/* Rendered HTML preview */}
      <div
        dangerouslySetInnerHTML={{
          __html:
            html ||
            `<div style="padding:2rem;text-align:center;color:#94a3b8;font-size:.8rem">${def?.icon} ${
              def?.label ?? component.type
            }</div>`,
        }}
      />
    </div>
  );
}
