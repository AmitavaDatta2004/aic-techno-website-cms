"use client";

import { useEffect, useState, useRef } from "react";
import { Topbar } from "@/components/cms/Topbar";
import { subscribeMentors, addMentor, updateMentor, deleteMentor, Mentor } from "@/lib/firestore";
import { uploadFile, generateStoragePath } from "@/lib/storage";
import { Link2, Trash2, Save, Camera, Plus, CheckCircle2, XCircle, X, AlertTriangle, User, ImagePlus } from "lucide-react";

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function toInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

/* ── Add Mentor Modal ────────────────────────────────────────────────────── */
interface AddModalProps {
  defaultOrder: number;
  onClose: () => void;
  onCreated: (msg: string) => void;
}
function AddMentorModal({ defaultOrder, onClose, onCreated }: AddModalProps) {
  const [name, setName]         = useState("");
  const [role, setRole]         = useState("");
  const [initials, setInitials] = useState("");
  const [bio, setBio]           = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [order, setOrder]       = useState(defaultOrder);
  const [active, setActive]     = useState(true);
  const [saving, setSaving]     = useState(false);
  const [errors, setErrors]     = useState<{ name?: string; role?: string }>({});

  // Photo upload
  const [photoUrl, setPhotoUrl]         = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [uploading, setUploading]       = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = async (file: File) => {
    // Show local preview immediately
    setPhotoPreview(URL.createObjectURL(file));
    setUploading(true);
    setUploadProgress(0);
    try {
      const path = generateStoragePath("mentors", file);
      const url = await uploadFile(file, path, (p) => setUploadProgress(p));
      setPhotoUrl(url);
    } catch {
      setPhotoPreview("");
      setPhotoUrl("");
    }
    setUploading(false);
  };

  // Auto-generate initials when name changes (unless user edited manually)
  const [initialsManual, setInitialsManual] = useState(false);
  const handleNameChange = (val: string) => {
    setName(val);
    if (!initialsManual) setInitials(val ? toInitials(val) : "");
  };

  const validate = () => {
    const e: { name?: string; role?: string } = {};
    if (!name.trim()) e.name = "Name is required";
    if (!role.trim()) e.role = "Role is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await addMentor({
        name: name.trim(),
        role: role.trim(),
        initials: initials.trim() || toInitials(name),
        bio: bio.trim(),
        linkedIn: linkedIn.trim(),
        photoUrl,
        order,
        active,
      });
      onCreated("Mentor added successfully");
      onClose();
    } catch (err: unknown) {
      setSaving(false);
      setErrors({ name: (err as Error).message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] animate-fade-in">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EEEEEE]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FFF0F2] flex items-center justify-center">
              <User className="w-4 h-4 text-[#800020]" />
            </div>
            <div>
              <h2 className="text-sm font-black text-black">Add New Mentor</h2>
              <p className="text-[10px] text-[#888888]">Fill in the details below</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-[#F5F5F5] hover:bg-[#EEEEEE] flex items-center justify-center transition-colors">
            <X className="w-3.5 h-3.5 text-[#666666]" />
          </button>
        </div>

        {/* Form body */}
        <div className="px-6 py-5 overflow-y-auto flex-1 space-y-4">

          {/* Photo upload */}
          <div className="flex items-center gap-5 p-4 rounded-xl border border-dashed border-[#DDDDDD] bg-[#FAFAFA]">
            {/* Avatar preview */}
            <div
              onClick={() => photoInputRef.current?.click()}
              className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-[#EEEEEE] bg-[#FFF0F2] flex items-center justify-center cursor-pointer hover:border-[#800020] transition-colors flex-shrink-0"
            >
              {photoPreview ? (
                <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-[#DDDDDD]" />
              )}
              {/* Upload overlay */}
              {uploading ? (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1">
                  <span className="text-white text-[10px] font-bold">{Math.round(uploadProgress)}%</span>
                  <div className="w-12 h-1 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 bg-black/0 hover:bg-black/30 flex items-center justify-center transition-all">
                  <Camera className="w-5 h-5 text-white opacity-0 hover:opacity-100" />
                </div>
              )}
            </div>

            {/* Upload prompt text */}
            <div className="flex-1">
              <p className="text-xs font-bold text-black mb-0.5">Profile Photo</p>
              <p className="text-[10px] text-[#888888] leading-relaxed mb-2">
                Click the avatar to upload. JPG, PNG or WEBP · Max 5MB
              </p>
              <button
                type="button"
                disabled={uploading}
                onClick={() => photoInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-[#800020] text-[#800020] bg-[#FFF0F2] hover:bg-[#FFE4E6] transition-colors disabled:opacity-50"
              >
                <ImagePlus className="w-3 h-3" />
                {uploading ? `Uploading ${Math.round(uploadProgress)}%…` : photoUrl ? "Change Photo" : "Upload Photo"}
              </button>
            </div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoChange(f); }}
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA] mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              autoFocus
              className={`cms-input w-full ${errors.name ? "border-red-300 bg-red-50" : ""}`}
              placeholder="e.g. Rajiv Kumar"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
            />
            {errors.name && <p className="text-[10px] text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Role + Initials */}
          <div className="grid grid-cols-[1fr_90px] gap-3">
            <div>
              <label className="block text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA] mb-1">
                Role / Designation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`cms-input w-full ${errors.role ? "border-red-300 bg-red-50" : ""}`}
                placeholder="e.g. Venture Capitalist"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
              {errors.role && <p className="text-[10px] text-red-500 mt-1">{errors.role}</p>}
            </div>
            <div>
              <label className="block text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA] mb-1">Initials</label>
              <input
                type="text"
                className="cms-input w-full text-center font-bold"
                placeholder="RK"
                maxLength={3}
                value={initials}
                onChange={(e) => { setInitials(e.target.value.toUpperCase()); setInitialsManual(true); }}
              />
            </div>
          </div>

          {/* LinkedIn */}
          <div>
            <label className="block text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA] mb-1">LinkedIn URL</label>
            <div className="relative">
              <Link2 className="w-3.5 h-3.5 text-[#AAAAAA] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="url"
                className="cms-input w-full"
                style={{ paddingLeft: "32px" }}
                placeholder="https://linkedin.com/in/..."
                value={linkedIn}
                onChange={(e) => setLinkedIn(e.target.value)}
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA] mb-1">Bio</label>
            <textarea
              className="cms-input w-full resize-none leading-relaxed"
              rows={3}
              placeholder="Short bio about this mentor…"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          {/* Order + Active */}
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA] mb-1">Display Order</label>
              <input
                type="number"
                className="cms-input w-20 text-center"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
              />
            </div>
            <div className="flex-1">
              <label className="block text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA] mb-2">Visibility</label>
              <button
                type="button"
                onClick={() => setActive((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${
                  active
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-[#F5F5F5] text-[#888888] border-[#E0E0E0]"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-green-500" : "bg-[#BBBBBB]"}`} />
                {active ? "Active" : "Inactive"}
              </button>
            </div>
          </div>
        </div>

        {/* Modal footer */}
        <div className="px-6 py-4 border-t border-[#EEEEEE] bg-[#FAFAFA] rounded-b-2xl flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#666666] bg-white border border-[#E0E0E0] hover:bg-[#F5F5F5] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #800020 0%, #5B0017 100%)" }}
          >
            {saving ? (
              <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating…</>
            ) : (
              <><Plus className="w-3.5 h-3.5" /> Create Mentor</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Delete Confirm Modal ────────────────────────────────────────────────── */
interface DeleteModalProps {
  mentorName: string;
  onCancel: () => void;
  onConfirm: () => void;
  deleting: boolean;
}
function DeleteConfirmModal({ mentorName, onCancel, onConfirm, deleting }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-fade-in p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-sm font-black text-black">Delete Mentor</h3>
            <p className="text-xs text-[#666666] mt-1 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-black">{mentorName}</span>? This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#666666] bg-white border border-[#E0E0E0] hover:bg-[#F5F5F5] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-60"
          >
            {deleting
              ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Deleting…</>
              : <><Trash2 className="w-3 h-3" /> Delete</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────────────────── */
export default function MentorsPage() {
  const [mentors, setMentors]             = useState<Mentor[]>([]);
  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState<string | null>(null);
  const [toast, setToast]                 = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [uploadingId, setUploadingId]     = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showAddModal, setShowAddModal]   = useState(false);
  const [deleteTarget, setDeleteTarget]   = useState<Mentor | null>(null);
  const [deleting, setDeleting]           = useState(false);

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    const unsub = subscribeMentors((data) => { setMentors(data); setLoading(false); });
    return () => unsub();
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdate = (id: string, field: keyof Mentor, value: Mentor[keyof Mentor]) => {
    setMentors((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const handleSave = async (mentor: Mentor) => {
    setSaving(mentor.id);
    try {
      const { id: _id, createdAt: _c, updatedAt: _u, ...data } = mentor;
      await updateMentor(mentor.id, data);
      showToast("Mentor saved successfully");
    } catch (err: unknown) {
      showToast((err as Error).message, "error");
    }
    setSaving(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteMentor(deleteTarget.id);
      showToast("Mentor deleted");
    } catch (err: unknown) {
      showToast((err as Error).message, "error");
    }
    setDeleting(false);
    setDeleteTarget(null);
  };

  const handlePhotoUpload = async (id: string, file: File) => {
    setUploadingId(id); setUploadProgress(0);
    try {
      const path = generateStoragePath("mentors", file);
      const url = await uploadFile(file, path, (p) => setUploadProgress(p));
      await updateMentor(id, { photoUrl: url });
      showToast("Photo uploaded");
    } catch (err: unknown) {
      showToast((err as Error).message, "error");
    }
    setUploadingId(null); setUploadProgress(0);
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--cms-bg)" }}>
      <Topbar title="Ecosystem Enablers" breadcrumb="Mentors" />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[60] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold animate-fade-in border ${
          toast.type === "success" ? "bg-white border-green-100 text-green-700" : "bg-white border-red-100 text-red-700"
        }`}>
          {toast.type === "success" ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /> : <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
          {toast.msg}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <AddMentorModal
          defaultOrder={mentors.length}
          onClose={() => setShowAddModal(false)}
          onCreated={(msg) => showToast(msg)}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          mentorName={deleteTarget.name ?? "this mentor"}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
          deleting={deleting}
        />
      )}

      <main className="flex-1 px-8 py-8 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-black tracking-tight">Ecosystem Enablers</h1>
            <p className="text-xs text-[#666666] mt-1">
              {loading ? "Loading…" : `${mentors.length} mentor${mentors.length !== 1 ? "s" : ""} · click Save on any card to commit changes`}
            </p>
          </div>
          <button
            id="add-mentor-btn"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #800020 0%, #5B0017 100%)", boxShadow: "0 4px 12px rgba(128,0,32,0.2)" }}
          >
            <Plus className="w-4 h-4" /> Add Mentor
          </button>
        </div>

        {/* Loading skeleton */}
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
          <div className="flex flex-col items-center justify-center py-24 cms-card">
            <div className="w-16 h-16 rounded-2xl bg-[#FFF0F2] flex items-center justify-center mb-4">
              <User className="w-7 h-7 text-[#800020]" />
            </div>
            <h3 className="text-base font-bold text-black mb-1">No mentors yet</h3>
            <p className="text-xs text-[#888888] mb-6">Add your first ecosystem enabler to get started</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: "#800020" }}
            >
              <Plus className="w-4 h-4" /> Add First Mentor
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {mentors.map((mentor) => (
              <div
                key={mentor.id}
                id={`mentor-${mentor.id}`}
                className="bg-white rounded-2xl border border-[#D8D8D8] shadow-sm hover:shadow-md hover:border-[#C0C0C0] transition-all duration-200 overflow-hidden flex flex-col"
              >
                {/* Card Header */}
                <div className="px-5 pt-5 pb-4 flex items-start gap-4 border-b border-[#F5F5F5]">
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
                    <button
                      onClick={() => fileInputRefs.current[mentor.id]?.click()}
                      disabled={uploadingId === mentor.id}
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#800020] flex items-center justify-center shadow-md hover:bg-[#660019] transition-colors"
                      title="Upload photo"
                    >
                      <Camera className="w-3 h-3 text-white" />
                    </button>
                    <input
                      type="file" accept="image/*" className="hidden"
                      ref={(el) => { fileInputRefs.current[mentor.id] = el; }}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(mentor.id, f); }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        mentor.active ? "bg-green-50 text-green-700 border border-green-100" : "bg-[#F5F5F5] text-[#888888] border border-[#EEEEEE]"
                      }`}>
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
                  <div className="grid grid-cols-[1fr_80px] gap-3">
                    <div>
                      <label className="block text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA] mb-1">Name</label>
                      <input id={`name-${mentor.id}`} type="text" className="cms-input w-full text-sm" value={mentor.name ?? ""}
                        onChange={(e) => handleUpdate(mentor.id, "name", e.target.value)} placeholder="Full name" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA] mb-1">Initials</label>
                      <input id={`initials-${mentor.id}`} type="text" className="cms-input w-full text-sm text-center font-bold"
                        value={mentor.initials ?? ""} onChange={(e) => handleUpdate(mentor.id, "initials", e.target.value)} maxLength={3} placeholder="AB" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA] mb-1">Role / Designation</label>
                    <input id={`role-${mentor.id}`} type="text" className="cms-input w-full text-sm" value={mentor.role ?? ""}
                      onChange={(e) => handleUpdate(mentor.id, "role", e.target.value)} placeholder="e.g. Venture Capitalist" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA] mb-1">LinkedIn URL</label>
                    <div className="relative">
                      <Link2 className="w-3.5 h-3.5 text-[#AAAAAA] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input id={`linkedin-${mentor.id}`} type="url" className="cms-input w-full text-sm" style={{ paddingLeft: "32px" }}
                        value={mentor.linkedIn ?? ""} onChange={(e) => handleUpdate(mentor.id, "linkedIn", e.target.value)} placeholder="https://linkedin.com/in/..." />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA] mb-1">Bio</label>
                    <textarea id={`bio-${mentor.id}`} className="cms-input w-full text-sm resize-none leading-relaxed" rows={3}
                      value={mentor.bio ?? ""} onChange={(e) => handleUpdate(mentor.id, "bio", e.target.value)} placeholder="Short bio…" />
                  </div>
                </div>

                {/* Card footer */}
                <div className="px-5 py-3 border-t border-[#F5F5F5] bg-[#FAFAFA] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => handleUpdate(mentor.id, "active", !mentor.active)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all duration-200 ${
                        mentor.active ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" : "bg-[#F5F5F5] text-[#888888] border-[#E0E0E0] hover:bg-[#EEEEEE]"
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${mentor.active ? "bg-green-500" : "bg-[#BBBBBB]"}`} />
                      {mentor.active ? "Active" : "Inactive"}
                    </button>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold text-[#AAAAAA] uppercase tracking-wider">#</span>
                      <input id={`order-${mentor.id}`} type="number"
                        className="w-12 text-center text-xs font-bold border border-[#E0E0E0] rounded-lg px-1 py-1.5 bg-white text-black outline-none focus:border-[#800020]"
                        value={mentor.order ?? 0} onChange={(e) => handleUpdate(mentor.id, "order", Number(e.target.value))} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button id={`delete-${mentor.id}`} onClick={() => setDeleteTarget(mentor)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 hover:border-red-300 transition-all">
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                    <button id={`save-${mentor.id}`} onClick={() => handleSave(mentor)} disabled={saving === mentor.id}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-all disabled:opacity-60"
                      style={{ background: "linear-gradient(135deg, #047857 0%, #065F46 100%)" }}>
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
