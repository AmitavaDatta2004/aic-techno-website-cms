"use client";
// src/app/dashboard/pages/components/ComponentPanel.tsx
// Left sidebar panel in the Visual Editor.
// Shows all available component types grouped by category.
// Components can be clicked to append to the canvas, or dragged onto the canvas.

import { useState } from "react";
import { Search } from "lucide-react";
import {
  COMPONENT_REGISTRY,
  COMPONENT_CATEGORIES,
  type ComponentDef,
  type ComponentCategory,
} from "@/lib/components/registry";

interface ComponentPanelProps {
  /** Called when user clicks a component to add it at the bottom of the canvas */
  onAdd: (type: string) => void;
}

export function ComponentPanel({ onAdd }: ComponentPanelProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<ComponentCategory | "all">("all");

  const filtered = COMPONENT_REGISTRY.filter((def) => {
    const matchesSearch =
      search.trim() === "" ||
      def.label.toLowerCase().includes(search.toLowerCase()) ||
      def.type.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === "all" || def.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const grouped = COMPONENT_CATEGORIES.reduce<Record<ComponentCategory, ComponentDef[]>>(
    (acc, cat) => {
      acc[cat.id] = filtered.filter((d) => d.category === cat.id);
      return acc;
    },
    { layout: [], content: [], media: [], interactive: [] }
  );

  return (
    <div className="h-full flex flex-col bg-white border-r border-[#E5E7EB]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#E5E7EB] shrink-0">
        <h3 className="text-[11px] font-black uppercase tracking-[2px] text-[#64748B] mb-2">
          Components
        </h3>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search components..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] focus:outline-none focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/10"
          />
        </div>
        {/* Category Filter */}
        <div className="flex flex-wrap gap-1 mt-2">
          <button
            onClick={() => setActiveCategory("all")}
            className={`text-[10px] font-bold px-2 py-1 rounded-full transition-colors ${
              activeCategory === "all"
                ? "bg-[#800020] text-white"
                : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"
            }`}
          >
            All
          </button>
          {COMPONENT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`text-[10px] font-bold px-2 py-1 rounded-full transition-colors ${
                activeCategory === cat.id
                  ? "bg-[#800020] text-white"
                  : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Component List */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {(activeCategory === "all" ? COMPONENT_CATEGORIES : COMPONENT_CATEGORIES.filter((c) => c.id === activeCategory)).map((cat) => {
          const items = grouped[cat.id];
          if (items.length === 0) return null;
          return (
            <div key={cat.id}>
              <div className="px-2 text-[9px] font-black text-[#94A3B8] uppercase tracking-[2px] mb-1.5 flex items-center gap-1.5">
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <div className="h-px flex-1 bg-[#E2E8F0]" />
              </div>
              <div className="space-y-1">
                {items.map((def) => (
                  <ComponentTile key={def.type} def={def} onAdd={onAdd} />
                ))}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-8 text-[#94A3B8] text-xs">
            No components found for &ldquo;{search}&rdquo;
          </div>
        )}
      </div>
    </div>
  );
}

function ComponentTile({
  def,
  onAdd,
}: {
  def: ComponentDef;
  onAdd: (type: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onAdd(def.type)}
      title={`Add ${def.label}`}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold text-[#334155] border border-transparent hover:border-[#FECDD3] hover:bg-[#FFF0F3] hover:text-[#800020] transition-all group"
    >
      <span className="text-base leading-none shrink-0">{def.icon}</span>
      <span className="truncate">{def.label}</span>
      <span className="ml-auto text-[#CBD5E1] group-hover:text-[#FECDD3] text-base leading-none">+</span>
    </button>
  );
}
