"use client";
// src/app/dashboard/pages/components/Canvas.tsx
// The central editor canvas. Renders components as styled preview blocks.
// Supports click-to-select, drag-to-reorder (via @dnd-kit), and inline
// contenteditable text editing on double-click.
//
// Architecture: Each component is rendered as an HTML string via renderers.ts
// and injected via dangerouslySetInnerHTML inside a styled wrapper div.
// This ensures the canvas preview is pixel-perfect to the live page output.

import { useRef, useCallback } from "react";
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
import { GripVertical, Plus, EyeOff } from "lucide-react";
import { getComponentDef } from "@/lib/components/registry";
import { renderComponent } from "@/lib/components/renderers";
import { BlockToolbar } from "./BlockToolbar";
import type { PageComponent } from "@/lib/firestore";

// ─── Page Builder CSS (injected once in the canvas) ───────────────────────────
// Mirrors the CSS in page.html so the canvas preview matches the live output.

const CANVAS_CSS = `
  .pb-hero{min-height:240px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;background:linear-gradient(135deg,#0A0A0F,#1a0a1f)}
  .pb-hero-overlay{position:absolute;inset:0;background:rgba(0,0,0,.55)}
  .pb-hero-title{font-size:2rem;font-weight:900;color:#fff;margin:0 0 .75rem;line-height:1.1;letter-spacing:-.02em}
  .pb-hero-sub{font-size:.9rem;color:rgba(255,255,255,.75);margin:0 0 1.5rem;max-width:560px;margin-left:auto;margin-right:auto}
  .pb-btn-group{display:flex;gap:.75rem;flex-wrap:wrap;margin-top:1rem}
  .pb-btn-primary{display:inline-flex;align-items:center;padding:.625rem 1.5rem;background:#800020;color:#fff;font-weight:700;font-size:.8rem;border-radius:8px;text-decoration:none;transition:background .2s}
  .pb-btn-primary:hover{background:#600018}
  .pb-btn-primary.pb-btn-white{background:#fff;color:#800020}
  .pb-btn-secondary{display:inline-flex;align-items:center;padding:.625rem 1.5rem;background:rgba(255,255,255,.15);color:#fff;font-weight:700;font-size:.8rem;border-radius:8px;text-decoration:none;border:1px solid rgba(255,255,255,.3)}
  .pb-btn-ghost{display:inline-flex;align-items:center;padding:.625rem 1.5rem;background:transparent;color:#fff;font-weight:700;font-size:.8rem;border-radius:8px;text-decoration:none;border:1px solid rgba(255,255,255,.4)}
  .pb-section{padding:3rem 0}
  .pb-section-dark{background:#0F1117;color:#e2e8f0}
  .pb-section-light{background:#f8f9fa;color:#0F172A}
  .pb-section-maroon{background:linear-gradient(135deg,#800020,#5a0017);color:#fff}
  .pb-container{max-width:960px;margin:0 auto;padding:0 1.5rem}
  .pb-narrow{max-width:640px;margin:0 auto;padding:0 1.5rem}
  .pb-center{text-align:center}
  .pb-center-row{justify-content:center}
  .pb-two-col{display:grid;grid-template-columns:1fr 1fr;gap:2.5rem;align-items:center}
  .pb-sec-tag{display:inline-block;font-size:.7rem;font-weight:800;text-transform:uppercase;letter-spacing:.12em;color:#800020;background:#fff0f3;padding:.3rem .8rem;border-radius:100px;margin-bottom:.75rem}
  .pb-sec-h{font-size:1.5rem;font-weight:900;margin:0 0 .75rem;line-height:1.15;color:#0F172A}
  .pb-sec-h.pb-light{color:#f1f5f9}
  .pb-sec-p{font-size:.875rem;color:#64748b;line-height:1.7;margin:0 0 1.25rem}
  .pb-sec-p.pb-light{color:rgba(255,255,255,.75)}
  .pb-sec-header{text-align:center;margin-bottom:2rem}
  .pb-grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:1.25rem}
  .pb-grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem}
  .pb-grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:1.25rem}
  .pb-card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:1.25rem}
  .pb-card-light{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:1.25rem;box-shadow:0 2px 8px rgba(0,0,0,.04)}
  .pb-card-icon{font-size:1.75rem;margin-bottom:.625rem}
  .pb-card-title{font-size:.875rem;font-weight:800;color:#f1f5f9;margin-bottom:.5rem}
  .pb-card-title.pb-dark{color:#0F172A}
  .pb-card-body{font-size:.8rem;color:rgba(255,255,255,.6);line-height:1.6}
  .pb-card-body.pb-dark-sub{color:#64748b}
  .pb-card-link{display:inline-block;margin-top:.75rem;font-size:.75rem;font-weight:700;color:#800020;text-decoration:none}
  .pb-card-link.pb-light-link{color:#800020}
  .pb-img-card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:14px;overflow:hidden}
  .pb-img-card-img{height:120px;overflow:hidden}
  .pb-img-card-img img{width:100%;height:100%;object-fit:cover}
  .pb-img-card-body{padding:1rem}
  .pb-img-placeholder{display:flex;align-items:center;justify-content:center;background:#e2e8f0;border-radius:10px;font-size:2rem;min-height:180px}
  .pb-img-placeholder-sm{display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.1);font-size:1.5rem;height:100px}
  .pb-about-img-wrap{border-radius:16px;overflow:hidden}
  .pb-about-img{width:100%;height:220px;object-fit:cover}
  .pb-about-text{display:flex;flex-direction:column;justify-content:center}
  .pb-stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:1.5rem;margin-top:2rem}
  .pb-stat{text-align:center}
  .pb-stat-value{font-size:2.25rem;font-weight:900;color:#fff;line-height:1}
  .pb-stat-label{font-size:.75rem;color:rgba(255,255,255,.65);margin-top:.375rem;font-weight:600}
  .pb-timeline{position:relative;padding-left:24px;border-left:2px solid #e5e7eb;margin-top:2rem;text-align:left}
  .pb-timeline-item{position:relative;margin-bottom:1.75rem;padding-left:1.25rem}
  .pb-timeline-dot{position:absolute;left:-1.4rem;top:.25rem;width:12px;height:12px;background:#800020;border-radius:50%;border:2px solid #fff}
  .pb-timeline-date{font-size:.7rem;font-weight:800;text-transform:uppercase;color:#800020;letter-spacing:.08em}
  .pb-timeline-title{font-size:.9rem;font-weight:800;color:#0F172A;margin:.25rem 0}
  .pb-timeline-body{font-size:.8rem;color:#64748b;line-height:1.6}
  .pb-person-card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:1.25rem;text-align:center}
  .pb-person-card-light{background:#fff;border:1px solid #e5e7eb;box-shadow:0 2px 8px rgba(0,0,0,.04)}
  .pb-person-avatar{width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#800020,#5a0017);display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;position:relative;overflow:hidden}
  .pb-avatar-maroon{background:linear-gradient(135deg,#800020,#5a0017)}
  .pb-person-initials{font-size:1.25rem;font-weight:900;color:#fff}
  .pb-person-avatar img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
  .pb-person-name{font-size:.875rem;font-weight:800;color:#f1f5f9;margin-bottom:.25rem}
  .pb-person-name.pb-dark{color:#0F172A}
  .pb-person-role{font-size:.75rem;color:rgba(255,255,255,.55);margin-bottom:.5rem}
  .pb-person-role.pb-dark-sub{color:#64748b}
  .pb-person-bio{font-size:.75rem;color:rgba(255,255,255,.5);line-height:1.5;margin:.5rem 0}
  .pb-linkedin{font-size:.7rem;font-weight:700;color:#800020;text-decoration:none}
  .pb-testimonial{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:1.5rem}
  .pb-quote-mark{font-size:3rem;line-height:.8;color:#800020;font-weight:900;margin-bottom:.5rem}
  .pb-quote-text{font-size:.875rem;color:rgba(255,255,255,.8);line-height:1.7;margin:0 0 1.25rem;font-style:italic}
  .pb-quote-author{display:flex;align-items:center;gap:.75rem}
  .pb-quote-avatar{width:36px;height:36px;border-radius:50%;background:#800020;display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:800;color:#fff;shrink:0}
  .pb-quote-photo{width:36px;height:36px;border-radius:50%;object-fit:cover}
  .pb-quote-name{font-size:.8rem;font-weight:700;color:#f1f5f9}
  .pb-quote-role{font-size:.7rem;color:rgba(255,255,255,.5)}
  .pb-gallery{margin-top:1.5rem}
  .pb-gallery-item{margin-bottom:1rem;break-inside:avoid}
  .pb-gallery-item img{width:100%;border-radius:10px;display:block}
  .pb-gallery-caption{font-size:.7rem;color:#64748b;margin-top:.375rem}
  .pb-gallery-empty{color:#94a3b8;font-size:.8rem;text-align:center;padding:2rem}
  .pb-faq{margin-top:1.5rem}
  .pb-faq-item{border:1px solid #e5e7eb;border-radius:10px;margin-bottom:.75rem;overflow:hidden}
  .pb-faq-q{width:100%;text-align:left;padding:.875rem 1rem;background:#f8f9fa;font-size:.85rem;font-weight:700;color:#0F172A;display:flex;align-items:center;justify-content:space-between;cursor:pointer;border:none}
  .pb-faq-a{padding:.875rem 1rem;font-size:.8rem;color:#64748b;line-height:1.7;background:#fff}
  .pb-form{display:flex;flex-direction:column;gap:.875rem;text-align:left;margin-top:1.5rem}
  .pb-form-row{display:grid;grid-template-columns:1fr 1fr;gap:.875rem}
  .pb-form-input{padding:.625rem 1rem;border:1px solid #e5e7eb;border-radius:8px;font-size:.8rem;width:100%;outline:none;transition:border .2s}
  .pb-form-input:focus{border-color:#800020;box-shadow:0 0 0 3px rgba(128,0,32,.1)}
  .pb-form-textarea{min-height:100px;resize:vertical}
  .pb-footer{background:#0A0A0F;border-top:1px solid rgba(255,255,255,.08);padding:2.5rem 0 1.5rem}
  .pb-footer-inner{display:flex;align-items:flex-start;justify-content:space-between;gap:2rem;margin-bottom:1.5rem;flex-wrap:wrap}
  .pb-footer-logo{font-size:1rem;font-weight:900;color:#fff;margin-bottom:.25rem}
  .pb-footer-tagline{font-size:.7rem;color:rgba(255,255,255,.5)}
  .pb-footer-nav{display:flex;gap:1.25rem;flex-wrap:wrap;align-items:center}
  .pb-footer-nav a{font-size:.75rem;color:rgba(255,255,255,.55);text-decoration:none;font-weight:600;transition:color .2s}
  .pb-footer-nav a:hover{color:#fff}
  .pb-footer-copy{font-size:.7rem;color:rgba(255,255,255,.35);border-top:1px solid rgba(255,255,255,.06);padding-top:1rem}
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
      className="flex-1 overflow-y-auto bg-[#E5E7EB]"
      onClick={() => onSelect(null)}
    >
      {/* Canvas Viewport */}
      <div className="my-6 mx-auto max-w-[900px] bg-white shadow-xl rounded-xl overflow-hidden">
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

// ─── Sortable Block ───────────────────────────────────────────────────────────

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group"
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
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
      >
        <div className="bg-[#0F172A] text-white rounded-lg p-1 shadow-lg">
          <GripVertical className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Component type badge — visible on hover */}
      <div className="absolute right-2 top-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-[#0F172A] text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow flex items-center gap-1.5">
          <span>{def?.icon}</span>
          <span>{def?.label ?? component.type}</span>
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
        className="pointer-events-none select-none"
        dangerouslySetInnerHTML={{ __html: html || `<div style="padding:2rem;text-align:center;color:#94a3b8;font-size:.8rem">${def?.icon} ${def?.label ?? component.type}</div>` }}
      />
    </div>
  );
}
