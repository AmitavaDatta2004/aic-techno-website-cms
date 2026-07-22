"use client";
// src/app/dashboard/admins/page.tsx

import { useState } from "react";
import { Topbar } from "@/components/cms/Topbar";
import { getAdminToken } from "@/lib/auth";

export default function AdminUsersPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const handleManageAdmin = async (action: "grant" | "revoke") => {
    if (!email.trim()) {
      setToast({ msg: "Please enter a valid user email", type: "error" });
      return;
    }

    setLoading(true);
    setToast(null);

    try {
      const token = await getAdminToken();
      if (!token) {
        throw new Error("You must be logged in as an admin.");
      }

      const res = await fetch("/api/admin/set-claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetEmail: email.trim(),
          isAdmin: action === "grant",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update admin claim");
      }

      setToast({
        msg: `Successfully ${action === "grant" ? "granted admin access to" : "revoked admin access from"} ${data.email || email}`,
        type: "success",
      });
      if (action === "grant") {
        setEmail("");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Something went wrong";
      setToast({ msg: errorMsg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Admin Access & Custom Claims" breadcrumb="Admins" />

      <main className="flex-1 px-8 py-8 space-y-8 w-full">
        {/* Toast notification */}
        {toast && (
          <div
            className={`p-4 rounded-xl text-sm font-medium animate-fade-in ${
              toast.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                : "bg-rose-50 border border-rose-200 text-rose-700"
            }`}
          >
            {toast.msg}
          </div>
        )}

        {/* Overview card */}
        <div className="cms-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-xl">
              🛡️
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Firebase Custom Claims Admin Control</h2>
              <p className="text-xs text-slate-500">
                Admin users have the custom claim <code className="text-sky-700 font-semibold">admin: true</code> on their Firebase ID token.
              </p>
            </div>
          </div>
        </div>

        {/* Grant / Revoke Admin Card */}
        <div className="cms-card p-6 rounded-2xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Manage Admin Privileges</h3>
            <p className="text-xs text-slate-500 mt-1">
              Enter the email address of a registered Firebase user to grant or revoke CMS admin access.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                User Email Address
              </label>
              <input
                type="email"
                placeholder="colleague@aic-techno.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="cms-input"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleManageAdmin("grant")}
                disabled={loading}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 transition-colors shadow-xs"
              >
                {loading ? "Updating..." : "Grant Admin Access"}
              </button>

              <button
                type="button"
                onClick={() => handleManageAdmin("revoke")}
                disabled={loading}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 disabled:opacity-50 transition-colors"
              >
                {loading ? "Updating..." : "Revoke Admin Access"}
              </button>
            </div>
          </div>
        </div>

        {/* CLI Instructions Card */}
        <div className="cms-card p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-slate-900">Alternative: Command Line CLI Tool</h3>
          <p className="text-xs text-slate-500">
            You can also grant or revoke admin claims directly from the terminal using the helper script:
          </p>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs text-sky-300 space-y-2 overflow-x-auto">
            <p className="text-slate-400"># Grant admin status to user by email or UID:</p>
            <p className="text-emerald-400">node scripts/set-admin.mjs user@aic-techno.com</p>
            <br />
            <p className="text-slate-400"># Revoke admin status:</p>
            <p className="text-rose-400">node scripts/set-admin.mjs user@aic-techno.com revoke</p>
          </div>

          <p className="text-xs text-slate-500">
            Make sure your <code className="text-slate-700 font-medium">.env.local</code> contains your Firebase Admin credentials:
            <br />
            <code className="text-sky-700 font-semibold">FIREBASE_ADMIN_PROJECT_ID</code>, <code className="text-sky-700 font-semibold">FIREBASE_ADMIN_CLIENT_EMAIL</code>, and <code className="text-sky-700 font-semibold">FIREBASE_ADMIN_PRIVATE_KEY</code>.
          </p>
        </div>
      </main>
    </div>
  );
}
