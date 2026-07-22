"use client";

import { useEffect, useState, useRef } from "react";
import { Topbar } from "@/components/cms/Topbar";
import {
  subscribeSocialMentors,
  addSocialMentor,
  updateSocialMentor,
  deleteSocialMentor,
  SocialMentor,
} from "@/lib/firestore";
import { uploadFile, generateStoragePath } from "@/lib/storage";
import { Link2, Trash2, Save, Camera, Plus, CheckCircle2, XCircle } from "lucide-react";

export default function SocialMentorsPage() {
  const [mentors, setMentors] = useState<SocialMentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    const unsub = subscribeSocialMentors((data) => {
      setMentors(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAdd = async () => {
    try {
      await addSocialMentor({
        name: "New Social Mentor",
        role: "Social Innovator",
        initials: "SM",
        photoUrl: "",
        linkedIn: "",
        order: mentors.length,
        active: false,
      });
      showToast("Social mentor added — fill in the details below");
    } catch (err: unknown) {
      showToast((err as Error).message, "error");
    }
  };

  const handleUpdate = (id: string, field: keyof SocialMentor, value: SocialMentor[keyof SocialMentor]) => {
    setMentors((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const handleSave = async (mentor: SocialMentor) => {
    setSaving(mentor.id);
    try {
      const { id: _id, createdAt: _c, updatedAt: _u, ...data } = mentor;
      await updateSocialMentor(mentor.id, data);
      showToast("Mentor saved successfully");
    } catch (err: unknown) {
      showToast((err as Error).message, "error");
    }
    setSaving(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this mentor?")) return;
    try {
      await deleteSocialMentor(id);
      showToast("Mentor deleted");
    } catch (err: unknown) {
      showToast((err as Error).message, "error");
    }
  };

  const handlePhotoUpload = async (id: string, file: File) => {
    if (!file) return;
    setUploadingId(id);
    setUploadProgress(0);
    try {
      const path = generateStoragePath("social-mentors", file);
      const url = await uploadFile(file, path, (p) => setUploadProgress(p));
      await updateSocialMentor(id, { photoUrl: url });
      showToast("Photo uploaded");
    } catch (err: unknown) {
      showToast((err as Error).message, "error");
    }
    setUploadingId(null);
    setUploadProgress(0);
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--cms-bg)" }}>
      <Topbar title="Social Innovation Mentors" breadcrumb="Social Mentors" />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold animate-fade-in border ${
            toast.type === "success"
              ? "bg-white border-green-100 text-green-700"
              : "bg-white border-red-100 text-red-700"
          }`}
        >
          {toast.type === "success"
            ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
            : <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
          {toast.msg}
        </div>
      )}

      <main className="flex-1 px-8 py-8 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-black tracking-tight">Social Mentors</h1>
            <p className="text-xs text-[#666666] mt-1">
              {loading ? "Loading…" : `${mentors.length} mentor${mentors.length !== 1 ? "s" : ""} · click Save on any card to commit changes`}
            </p>
          </div>
          <button
            id="add-social-mentor-btn"
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #800020 0%, #5B0017 100%)", boxShadow: "0 4px 12px rgba(128,0,32,0.2)" }}
          >
            <Plus className="w-4 h-4" />
            Add Mentor
          </button>
        </div>

        {/* Loading skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#EEEEEE] p-6 space-y-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-[#F5F5F5]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[#F5F5F5] rounded w-2/3" />
                    <div className="h-3 bg-[#F5F5F5] rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-[#F5F5F5] rounded" />
                <div className="h-3 bg-[#F5F5F5] rounded w-4/5" />
                <div className="h-8 bg-[#F5F5F5] rounded-lg" />
              </div>
            ))}
          </div>
        ) : mentors.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 cms-card">
            <div className="w-16 h-16 rounded-2xl bg-[#FFF0F2] flex items-center justify-center mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="text-base font-bold text-black mb-1">No social mentors yet</h3>
            <p className="text-xs text-[#888888] mb-6">Add your first social innovation mentor to get started</p>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: "#800020" }}
            >
              <Plus className="w-4 h-4" /> Add First Mentor
            </button>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {mentors.map((mentor) => (
              <div
                key={mentor.id}
                id={`social-mentor-${mentor.id}`}
                className="bg-white rounded-2xl border border-[#EEEEEE] shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
              >
                {/* Card Header */}
                <div className="px-5 pt-5 pb-4 flex items-start gap-4 border-b border-[#F5F5F5]">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-[#EEEEEE] bg-[#FFF0F2] flex items-center justify-center">
                      {mentor.photoUrl ? (
                        <img src={mentor.photoUrl} alt={mentor.name ?? ""} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg font-black text-[#800020]">
                          {mentor.initials || (mentor.name ?? "?").substring(0, 2).toUpperCase()}
                        </span>
                      )}
                      {uploadingId === mentor.id && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-xl gap-1">
                          <span className="text-white text-xs font-bold">{Math.round(uploadProgress)}%</span>
                          <div className="w-10 h-1 bg-white/20 rounded-full overflow-hidden">
                            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Camera button */}
                    <button
                      onClick={() => fileInputRefs.current[mentor.id]?.click()}
                      disabled={uploadingId === mentor.id}
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#800020] flex items-center justify-center shadow-md hover:bg-[#660019] transition-colors"
                      title="Upload photo"
                    >
                      <Camera className="w-3 h-3 text-white" />
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={(el) => { fileInputRefs.current[mentor.id] = el; }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePhotoUpload(mentor.id, file);
                      }}
                    />
                  </div>

                  {/* Name + role + active badge */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          mentor.active
                            ? "bg-green-50 text-green-700 border border-green-100"
                            : "bg-[#F5F5F5] text-[#888888] border border-[#EEEEEE]"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${mentor.active ? "bg-green-500" : "bg-[#CCCCCC]"}`} />
                        {mentor.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-sm font-black text-black truncate">{mentor.name || "Unnamed Mentor"}</p>
                    <p className="text-xs text-[#888888] truncate">{mentor.role || "No role set"}</p>
                  </div>
                </div>

                {/* Form fields */}
                <div className="px-5 py-4 space-y-3 flex-1">
                  {/* Name + Initials */}
                  <div className="grid grid-cols-[1fr_80px] gap-3">
                    <div>
                      <label className="block text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA] mb-1">Name</label>
                      <input
                        type="text"
                        className="cms-input w-full text-sm"
                        value={mentor.name ?? ""}
                        onChange={(e) => handleUpdate(mentor.id, "name", e.target.value)}
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA] mb-1">Initials</label>
                      <input
                        type="text"
                        className="cms-input w-full text-sm text-center font-bold"
                        value={mentor.initials ?? ""}
                        onChange={(e) => handleUpdate(mentor.id, "initials", e.target.value)}
                        maxLength={3}
                        placeholder="AB"
                      />
                    </div>
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA] mb-1">Role / Designation</label>
                    <input
                      type="text"
                      className="cms-input w-full text-sm"
                      value={mentor.role ?? ""}
                      onChange={(e) => handleUpdate(mentor.id, "role", e.target.value)}
                      placeholder="e.g. Social Innovator"
                    />
                  </div>

                  {/* LinkedIn */}
                  <div>
                    <label className="block text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA] mb-1">LinkedIn URL</label>
                    <div className="relative">
                      <Link2 className="w-3.5 h-3.5 text-[#AAAAAA] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="url"
                        className="cms-input w-full text-sm"
                        style={{ paddingLeft: "32px" }}
                        value={mentor.linkedIn ?? ""}
                        onChange={(e) => handleUpdate(mentor.id, "linkedIn", e.target.value)}
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>
                  </div>
                </div>

                {/* Card footer */}
                <div className="px-5 py-3 border-t border-[#F5F5F5] bg-[#FAFAFA] flex items-center justify-between gap-3">
                  {/* Left: Active pill + Order */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleUpdate(mentor.id, "active", !mentor.active)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all duration-200 ${
                        mentor.active
                          ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                          : "bg-[#F5F5F5] text-[#888888] border-[#E0E0E0] hover:bg-[#EEEEEE]"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${mentor.active ? "bg-green-500" : "bg-[#BBBBBB]"}`} />
                      {mentor.active ? "Active" : "Inactive"}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold text-[#AAAAAA] uppercase tracking-wider">#</span>
                      <input
                        type="number"
                        className="w-12 text-center text-xs font-bold border border-[#E0E0E0] rounded-lg px-1 py-1.5 bg-white text-black outline-none focus:border-[#800020]"
                        value={mentor.order ?? 0}
                        onChange={(e) => handleUpdate(mentor.id, "order", Number(e.target.value))}
                      />
                    </div>
                  </div>

                  {/* Right: Delete + Save */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(mentor.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 hover:border-red-300 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                    <button
                      onClick={() => handleSave(mentor)}
                      disabled={saving === mentor.id}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-all disabled:opacity-60"
                      style={{ background: "linear-gradient(135deg, #047857 0%, #065F46 100%)" }}
                    >
                      <Save className="w-3 h-3" />
                      {saving === mentor.id ? "Saving…" : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
