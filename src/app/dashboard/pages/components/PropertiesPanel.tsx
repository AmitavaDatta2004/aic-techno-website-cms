"use client";
// src/app/dashboard/pages/components/PropertiesPanel.tsx
// Right-side panel in the Visual Editor.
// Dynamically renders form fields based on the selected component's FieldDef[]
// from the registry. Supports: text, textarea, url, color, image, select,
// toggle, number, icon (emoji), and repeater (nested list editor).

import { useRef, useState } from "react";
import { Plus, Trash2, GripVertical, X } from "lucide-react";
import { getComponentDef, type FieldDef } from "@/lib/components/registry";
import { uploadFile, generateStoragePath } from "@/lib/storage";
import type { PageComponent } from "@/lib/firestore";

interface PropertiesPanelProps {
  component: PageComponent;
  onChange: (id: string, props: Record<string, unknown>) => void;
}

export function PropertiesPanel({ component, onChange }: PropertiesPanelProps) {
  const def = getComponentDef(component.type);

  function handleChange(key: string, value: unknown) {
    onChange(component.id, { ...component.props, [key]: value });
  }

  if (!def) {
    return (
      <div className="p-4 text-xs text-[#94A3B8]">
        Unknown component type: {component.type}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white border-l border-[#E5E7EB]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#E5E7EB] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">{def.icon}</span>
          <div>
            <h3 className="text-xs font-black text-[#0F172A]">{def.label}</h3>
            <p className="text-[10px] text-[#94A3B8] capitalize">{def.category}</p>
          </div>
        </div>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {def.fields.map((field) => (
          <FieldEditor
            key={field.key}
            field={field}
            value={component.props[field.key]}
            onChange={(val) => handleChange(field.key, val)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Field Editor ─────────────────────────────────────────────────────────────

interface FieldEditorProps {
  field: FieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
}

function FieldEditor({ field, value, onChange }: FieldEditorProps) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
        {field.label}
      </label>

      {field.type === "text" && (
        <input
          type="text"
          className="cms-input text-xs"
          value={String(value ?? "")}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.type === "textarea" && (
        <textarea
          className="cms-input text-xs resize-none"
          rows={3}
          value={String(value ?? "")}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.type === "url" && (
        <input
          type="url"
          className="cms-input text-xs"
          value={String(value ?? "")}
          placeholder={field.placeholder ?? "https://"}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.type === "color" && (
        <div className="flex items-center gap-2">
          <input
            type="color"
            className="w-9 h-9 rounded border border-[#E5E7EB] cursor-pointer"
            value={String(value ?? "#000000")}
            onChange={(e) => onChange(e.target.value)}
          />
          <input
            type="text"
            className="cms-input text-xs flex-1"
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      )}

      {field.type === "number" && (
        <input
          type="number"
          className="cms-input text-xs"
          value={Number(value ?? field.min ?? 0)}
          min={field.min}
          max={field.max}
          step={field.step ?? 1}
          onChange={(e) => onChange(parseFloat(e.target.value))}
        />
      )}

      {field.type === "toggle" && (
        <button
          type="button"
          role="switch"
          aria-checked={Boolean(value)}
          onClick={() => onChange(!value)}
          className={`w-11 h-6 rounded-full transition-colors flex items-center ${
            value ? "bg-[#800020]" : "bg-[#E5E7EB]"
          }`}
        >
          <span
            className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${
              value ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      )}

      {field.type === "select" && field.options && (
        <select
          className="cms-input text-xs"
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        >
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {field.type === "icon" && (
        <input
          type="text"
          className="cms-input text-xl text-center"
          value={String(value ?? "")}
          placeholder="Paste an emoji, e.g. 🚀"
          onChange={(e) => onChange(e.target.value)}
          maxLength={4}
        />
      )}

      {field.type === "image" && (
        <ImageField
          value={String(value ?? "")}
          onChange={onChange}
        />
      )}

      {field.type === "repeater" && field.repeaterFields && (
        <RepeaterField
          value={Array.isArray(value) ? value as Record<string, unknown>[] : []}
          fields={field.repeaterFields}
          addLabel={field.repeaterAddLabel ?? "Add Item"}
          onChange={onChange}
        />
      )}
    </div>
  );
}

// ─── Image Field ──────────────────────────────────────────────────────────────

function ImageField({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: unknown) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    setProgress(0);
    try {
      const path = generateStoragePath("pages", file);
      const url = await uploadFile(file, path, (p) => setProgress(p));
      onChange(url);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div
        className={`relative rounded-xl border-2 border-dashed min-h-[100px] flex flex-col items-center justify-center cursor-pointer transition-all ${
          isDragging
            ? "border-[#800020] bg-[#FFF0F3]"
            : "border-[#E5E7EB] hover:border-[#800020]/50"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
      >
        {value ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={value} alt="Selected" className="w-full max-h-32 object-cover rounded-lg" />
        ) : (
          <div className="text-center p-3">
            <div className="text-2xl mb-1">🖼️</div>
            <p className="text-xs text-[#94A3B8]">
              {isDragging ? "Drop here!" : "Click or drag to upload"}
            </p>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center rounded-xl">
            <div className="w-8 h-8 border-2 border-[#800020] border-t-transparent rounded-full animate-spin mb-2" />
            <span className="text-xs font-bold text-[#800020]">{progress}%</span>
          </div>
        )}
      </div>
      {value && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onChange(""); }}
          className="mt-1.5 text-[10px] text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
        >
          <X className="w-3 h-3" /> Remove image
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ─── Repeater Field ───────────────────────────────────────────────────────────

function RepeaterField({
  value,
  fields,
  addLabel,
  onChange,
}: {
  value: Record<string, unknown>[];
  fields: Omit<FieldDef, "repeaterFields">[];
  addLabel: string;
  onChange: (val: unknown) => void;
}) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);

  function addItem() {
    const blank: Record<string, unknown> = {};
    fields.forEach((f) => { blank[f.key] = ""; });
    const next = [...value, blank];
    onChange(next);
    setExpandedIdx(next.length - 1);
  }

  function removeItem(idx: number) {
    const next = value.filter((_, i) => i !== idx);
    onChange(next);
    if (expandedIdx === idx) setExpandedIdx(null);
  }

  function updateItem(idx: number, key: string, val: unknown) {
    const next = value.map((item, i) =>
      i === idx ? { ...item, [key]: val } : item
    );
    onChange(next);
  }

  function moveItem(idx: number, dir: -1 | 1) {
    const next = [...value];
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= next.length) return;
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    onChange(next);
    setExpandedIdx(swapIdx);
  }

  return (
    <div className="space-y-2">
      {value.map((item, idx) => {
        const isOpen = expandedIdx === idx;
        // Try to get a meaningful label for the collapsed state
        const itemLabel =
          String(item.title ?? item.name ?? item.question ?? item.label ?? `Item ${idx + 1}`);
        return (
          <div key={idx} className="border border-[#E5E7EB] rounded-xl overflow-hidden">
            {/* Row header */}
            <div className="flex items-center gap-1 px-2 py-2 bg-[#F8F9FA] cursor-pointer" onClick={() => setExpandedIdx(isOpen ? null : idx)}>
              <GripVertical className="w-3.5 h-3.5 text-[#CBD5E1] shrink-0" />
              <span className="text-xs font-semibold text-[#334155] flex-1 truncate min-w-0">{itemLabel}</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); moveItem(idx, -1); }}
                disabled={idx === 0}
                className="p-0.5 text-[#94A3B8] hover:text-[#334155] disabled:opacity-30"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); moveItem(idx, 1); }}
                disabled={idx === value.length - 1}
                className="p-0.5 text-[#94A3B8] hover:text-[#334155] disabled:opacity-30"
              >
                ▼
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeItem(idx); }}
                className="p-0.5 text-red-400 hover:text-red-600"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            {/* Expanded fields */}
            {isOpen && (
              <div className="p-3 space-y-3 border-t border-[#E5E7EB]">
                {fields.map((f) => (
                  <FieldEditor
                    key={f.key}
                    field={f}
                    value={item[f.key]}
                    onChange={(val) => updateItem(idx, f.key, val)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={addItem}
        className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#64748B] hover:border-[#800020] hover:text-[#800020] hover:bg-[#FFF0F3] transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        {addLabel}
      </button>
    </div>
  );
}
