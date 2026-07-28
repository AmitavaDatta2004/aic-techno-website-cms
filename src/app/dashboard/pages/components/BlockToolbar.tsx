"use client";
// src/app/dashboard/pages/components/BlockToolbar.tsx
// Floating toolbar that appears above a selected component block in the canvas.
// Provides: move up, move down, duplicate, toggle visibility, and delete.

import {
  ChevronUp,
  ChevronDown,
  Copy,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";

interface BlockToolbarProps {
  visible: boolean;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onToggleVisibility: () => void;
  onDelete: () => void;
}

export function BlockToolbar({
  visible,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onToggleVisibility,
  onDelete,
}: BlockToolbarProps) {
  return (
    <div
      className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full z-50 flex items-center gap-0.5 bg-[#0F172A] border border-[#800020] rounded-lg px-1 py-1 shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Move Up */}
      <ToolbarBtn
        icon={<ChevronUp className="w-3.5 h-3.5" />}
        title="Move Up"
        onClick={onMoveUp}
        disabled={isFirst}
      />

      {/* Move Down */}
      <ToolbarBtn
        icon={<ChevronDown className="w-3.5 h-3.5" />}
        title="Move Down"
        onClick={onMoveDown}
        disabled={isLast}
      />

      <div className="w-px h-4 bg-white/20 mx-0.5" />

      {/* Duplicate */}
      <ToolbarBtn
        icon={<Copy className="w-3.5 h-3.5" />}
        title="Duplicate"
        onClick={onDuplicate}
      />

      {/* Toggle Visibility */}
      <ToolbarBtn
        icon={visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-yellow-400" />}
        title={visible ? "Hide Component" : "Show Component"}
        onClick={onToggleVisibility}
      />

      <div className="w-px h-4 bg-white/20 mx-0.5" />

      {/* Delete */}
      <ToolbarBtn
        icon={<Trash2 className="w-3.5 h-3.5 text-red-400" />}
        title="Delete"
        onClick={onDelete}
        danger
      />
    </div>
  );
}

function ToolbarBtn({
  icon,
  title,
  onClick,
  disabled = false,
  danger = false,
}: {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`
        p-1.5 rounded-md transition-colors text-white
        ${disabled
          ? "opacity-30 cursor-not-allowed"
          : danger
            ? "hover:bg-red-900/60"
            : "hover:bg-white/15"
        }
      `}
    >
      {icon}
    </button>
  );
}
