"use client";
// src/components/cms/portal.tsx
// Shared bits for the Startup Portal pages (startups, meetings, portal events, notifications).

import { Timestamp } from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";
import { AlertTriangle } from "lucide-react";
import { auth } from "@/lib/firebase";
import { getAdminToken } from "@/lib/auth";

export const PORTAL_LOGIN_URL =
  process.env.NEXT_PUBLIC_PORTAL_LOGIN_URL || "https://aic-techno.com/startup-login";

export const STARTUP_STAGES = ["Pre-incubation", "Incubation", "Acceleration", "Alumni"];

/* ── Dates ─────────────────────────────────────────────────────────────────── */

/** Timestamp → value for <input type="datetime-local"> (local time). */
export function toLocalInput(t?: Timestamp | null): string {
  if (!t) return "";
  const d = t.toDate();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** <input type="datetime-local"> value → Timestamp (or null when empty). */
export function fromLocalInput(v: string): Timestamp | null {
  return v ? Timestamp.fromDate(new Date(v)) : null;
}

export function formatDateTime(t?: Timestamp | null): string {
  if (!t) return "—";
  const d = t.toDate();
  return (
    d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) +
    " · " +
    d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })
  );
}

export function formatDate(t?: Timestamp | null): string {
  if (!t) return "—";
  return t.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/** Startups only see http(s) links, so the CMS only accepts those. */
export function isHttpUrl(v: string): boolean {
  try {
    return /^https?:$/.test(new URL(v).protocol);
  } catch {
    return false;
  }
}

/* ── Startup accounts ──────────────────────────────────────────────────────── */

export interface StartupApiResult {
  email: string;
  created: boolean;
  inviteLink: string | null;
  loginUrl: string;
}

/** Calls /api/admin/startups (register or invite), then emails the password-setup link. */
export async function startupAccountAction(
  body: Record<string, unknown>
): Promise<StartupApiResult & { emailSent: boolean }> {
  const token = await getAdminToken();
  if (!token) throw new Error("You must be logged in as an admin.");

  const res = await fetch("/api/admin/startups", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");

  // Firebase's password-reset email doubles as the "set your password" invite.
  let emailSent = true;
  try {
    await sendPasswordResetEmail(auth, data.email, { url: data.loginUrl });
  } catch {
    try {
      await sendPasswordResetEmail(auth, data.email); // login domain not authorized yet
    } catch {
      emailSent = false;
    }
  }
  return { ...data, emailSent };
}

/* ── UI ────────────────────────────────────────────────────────────────────── */

export function Toast({ toast }: { toast: { msg: string; type: "success" | "error" } | null }) {
  if (!toast) return null;
  return (
    <div
      className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-[60] text-sm font-medium animate-fade-in max-w-md ${
        toast.type === "success" ? "bg-[var(--cms-success)] text-white" : "bg-[var(--cms-danger)] text-white"
      }`}
    >
      {toast.msg}
    </div>
  );
}

export function Toggle({ on, onClick, title }: { on: boolean; onClick: () => void; title?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={on}
      className={`w-10 h-5 rounded-full relative transition-colors focus:outline-none cursor-pointer ${
        on ? "bg-[var(--cms-success)]" : "bg-[var(--cms-border)]"
      }`}
    >
      <div
        className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${
          on ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}

interface DeleteModalProps {
  noun: string;
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
  deleting: boolean;
}

export function DeleteConfirmModal({ noun, title, onCancel, onConfirm, deleting }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-fade-in p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-sm font-black text-black">Delete {noun}</h3>
            <p className="text-xs text-[#666666] mt-1 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-black">{title}</span>? Startups will no longer see it. This action cannot be undone.
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

export const labelCls = "text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)]";
export const thCls = "p-4 text-xs font-bold uppercase tracking-widest text-[var(--cms-muted)]";
export const editBtnCls =
  "px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--cms-accent)] bg-[#FFF0F2] border border-[#FECDD3] hover:bg-[var(--cms-accent)] hover:text-white transition-colors cursor-pointer";
export const neutralBtnCls =
  "px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--cms-text-2)] bg-white border border-[var(--cms-border)] hover:border-[var(--cms-text-2)] transition-colors cursor-pointer disabled:opacity-60";
export const deleteBtnCls =
  "px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-600 hover:text-white transition-colors cursor-pointer";
export const primaryBtnCls =
  "px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--cms-accent)] hover:bg-[var(--cms-accent-hover)] transition-colors cursor-pointer disabled:opacity-60";
