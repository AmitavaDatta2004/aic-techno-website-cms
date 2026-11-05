"use client";
// src/app/dashboard/startups/page.tsx
// Startup Portal — registered startups and their portal logins.

import { useEffect, useMemo, useState } from "react";
import { Topbar } from "@/components/cms/Topbar";
import { subscribeStartups, updateStartup, type Startup } from "@/lib/firestore";
import {
  STARTUP_STAGES,
  PORTAL_LOGIN_URL,
  Toast,
  Toggle,
  formatDate,
  startupAccountAction,
  labelCls,
  thCls,
  editBtnCls,
  neutralBtnCls,
  primaryBtnCls,
  type StartupApiResult,
} from "@/components/cms/portal";
import { X, Copy, Check } from "lucide-react";

const emptyForm = { name: "", founderName: "", email: "", phone: "", stage: "" };

export default function StartupsPage() {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [inviting, setInviting] = useState<string | null>(null);
  const [invite, setInvite] = useState<(StartupApiResult & { emailSent: boolean }) | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsub = subscribeStartups((data) => {
      setStartups(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return startups;
    return startups.filter((s) =>
      [s.name, s.founderName, s.email, s.phone, s.stage].some((v) => (v ?? "").toLowerCase().includes(q))
    );
  }, [startups, search]);

  const handleOpenModal = (s?: Startup) => {
    if (s) {
      setEditingId(s.id);
      setFormData({
        name: s.name ?? "",
        founderName: s.founderName ?? "",
        email: s.email ?? s.id,
        phone: s.phone ?? "",
        stage: s.stage ?? "",
      });
    } else {
      setEditingId(null);
      setFormData(emptyForm);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showToast("Startup name is required", "error");
      return;
    }
    if (!editingId && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      showToast("A valid login email is required", "error");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateStartup(editingId, {
          name: formData.name.trim(),
          founderName: formData.founderName.trim(),
          phone: formData.phone.trim(),
          stage: formData.stage,
        });
        showToast("Startup updated");
      } else {
        const result = await startupAccountAction({ action: "register", ...formData });
        setInvite(result);
        setCopied(false);
      }
      handleCloseModal();
    } catch (error) {
      console.error(error);
      showToast(error instanceof Error ? error.message : "Error saving startup", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleResendInvite = async (s: Startup) => {
    setInviting(s.id);
    try {
      const result = await startupAccountAction({ action: "invite", email: s.id });
      setInvite(result);
      setCopied(false);
    } catch (error) {
      console.error(error);
      showToast(error instanceof Error ? error.message : "Error sending invite", "error");
    } finally {
      setInviting(null);
    }
  };

  const toggleActive = async (s: Startup) => {
    try {
      await updateStartup(s.id, { active: !s.active });
      showToast(`Portal access ${s.active ? "turned off" : "turned on"} for ${s.name}`);
    } catch (error) {
      console.error(error);
      showToast("Error updating access", "error");
    }
  };

  const copyLink = async () => {
    if (!invite?.inviteLink) return;
    try {
      await navigator.clipboard.writeText(invite.inviteLink);
      setCopied(true);
    } catch {
      showToast("Couldn't copy — select the link and copy it manually", "error");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Startups" breadcrumb="Startup Portal" />
      <Toast toast={toast} />

      <main className="flex-1 px-8 py-8 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--cms-text)]">Registered Startups</h1>
            <p className="text-sm text-[var(--cms-text-2)] mt-1 max-w-2xl">
              Only startups listed here, with access on, can sign in to the Startup Portal at{" "}
              <a href={PORTAL_LOGIN_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--cms-accent)] font-semibold hover:underline">
                {PORTAL_LOGIN_URL.replace(/^https?:\/\//, "")}
              </a>
              . Registering a startup emails them a link to set their password.
            </p>
          </div>
          <button onClick={() => handleOpenModal()} className={`${primaryBtnCls} shrink-0`}>
            + Register Startup
          </button>
        </div>

        {invite && (
          <div className="cms-card p-5 rounded-xl border-l-4 border-l-[var(--cms-success)] space-y-3 animate-fade-in">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-[var(--cms-text)]">
                  {invite.emailSent ? `Invite emailed to ${invite.email}` : `Login ready for ${invite.email} — but the invite email couldn't be sent`}
                </h3>
                <p className="text-xs text-[var(--cms-text-2)] mt-1">
                  {invite.emailSent
                    ? "They'll get an email to set their password. If it doesn't arrive (check spam), share the link below directly."
                    : "Share the link below with the startup directly so they can set their password."}
                </p>
              </div>
              <button onClick={() => setInvite(null)} className="p-1 rounded-full hover:bg-[var(--cms-surface-2)] cursor-pointer" aria-label="Dismiss">
                <X className="w-4 h-4 text-[var(--cms-muted)]" />
              </button>
            </div>
            {invite.inviteLink && (
              <div className="flex items-center gap-2">
                <input readOnly value={invite.inviteLink} className="cms-input w-full text-xs font-mono" onFocus={(e) => e.target.select()} />
                <button onClick={copyLink} className={`${neutralBtnCls} flex items-center gap-1.5 shrink-0`}>
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy link"}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <input
            type="search"
            className="cms-input w-full max-w-sm"
            placeholder="Search startups, founders, emails…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="text-xs font-semibold text-[var(--cms-muted)]">
            {startups.filter((s) => s.active).length} active · {startups.length} total
          </span>
        </div>

        <div className="cms-card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-[var(--cms-muted)]">Loading startups...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-[var(--cms-muted)]">
              {startups.length ? "No startups match your search." : 'No startups yet. Click "Register Startup" to add the first one.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--cms-border)] bg-[var(--cms-surface-2)]">
                    <th className={thCls}>Startup</th>
                    <th className={thCls}>Login Email</th>
                    <th className={thCls}>Stage</th>
                    <th className={thCls}>Access</th>
                    <th className={thCls}>Last Invited</th>
                    <th className={`${thCls} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--cms-border)]">
                  {filtered.map((s) => (
                    <tr key={s.id} className={`hover:bg-[var(--cms-surface-2)] transition-colors ${s.active ? "" : "opacity-60"}`}>
                      <td className="p-4">
                        <div className="text-sm font-bold text-[var(--cms-text)]">{s.name}</div>
                        {s.founderName && <div className="text-xs text-[var(--cms-muted)] mt-0.5">{s.founderName}</div>}
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-[var(--cms-text-2)]">{s.email || s.id}</div>
                        {s.phone && <div className="text-xs text-[var(--cms-muted)] mt-0.5">{s.phone}</div>}
                      </td>
                      <td className="p-4 text-sm text-[var(--cms-text-2)]">{s.stage || <span className="text-[var(--cms-muted)]">—</span>}</td>
                      <td className="p-4">
                        <Toggle on={s.active} onClick={() => toggleActive(s)} title={s.active ? "Turn portal access off" : "Turn portal access on"} />
                      </td>
                      <td className="p-4 text-sm text-[var(--cms-text-2)]">{formatDate(s.invitedAt)}</td>
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button onClick={() => handleOpenModal(s)} className={editBtnCls}>Edit</button>
                        <button onClick={() => handleResendInvite(s)} disabled={inviting === s.id} className={neutralBtnCls}>
                          {inviting === s.id ? "Sending…" : "Resend invite"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--cms-surface)] border border-[var(--cms-border)] w-full max-w-lg rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-[var(--cms-border)] flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--cms-text)]">{editingId ? "Edit Startup" : "Register Startup"}</h2>
              <button onClick={handleCloseModal} className="p-1 rounded-full hover:bg-[var(--cms-surface-2)] transition-colors cursor-pointer">
                <X className="w-5 h-5 text-[var(--cms-muted)]" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="space-y-1">
                <label className={labelCls}>Startup Name *</label>
                <input type="text" className="cms-input w-full" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. GreenLoop" />
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Founder Name</label>
                <input type="text" className="cms-input w-full" value={formData.founderName} onChange={(e) => setFormData({ ...formData, founderName: e.target.value })} placeholder="Shown as “Welcome, …” on their dashboard" />
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Login Email *</label>
                <input
                  type="email"
                  className="cms-input w-full disabled:opacity-60"
                  value={formData.email}
                  disabled={Boolean(editingId)}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="founder@startup.com"
                />
                <p className="text-xs text-[var(--cms-muted)]">
                  {editingId ? "The login email can't be changed. Register the startup again with the new email instead." : "They'll get an email from Firebase with a link to set their password."}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelCls}>Phone</label>
                  <input type="tel" className="cms-input w-full" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Programme Stage</label>
                  <select className="cms-input w-full" value={formData.stage} onChange={(e) => setFormData({ ...formData, stage: e.target.value })}>
                    <option value="">—</option>
                    {STARTUP_STAGES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[var(--cms-border)] bg-[var(--cms-surface-2)] flex justify-end space-x-4 rounded-b-xl">
              <button onClick={handleCloseModal} className="px-4 py-2 rounded-lg text-sm font-semibold text-[var(--cms-text-2)] transition-colors cursor-pointer">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--cms-success)] hover:bg-green-600 transition-colors cursor-pointer disabled:opacity-60">
                {saving ? "Saving…" : editingId ? "Save Changes" : "Register & Send Invite"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
