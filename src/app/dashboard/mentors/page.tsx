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
import { Link2, Trash2, Save, Camera, Plus, CheckCircle2, XCircle, X, AlertTriangle, Users, ImagePlus, Pencil, ChevronUp, ChevronDown } from "lucide-react";

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function toInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

/* ── Add Social Mentor Modal ─────────────────────────────────────────────── */
interface AddModalProps {
  defaultOrder: number;
  onClose: () => void;
  onCreated: (msg: string) => void;
}
function AddSocialMentorModal({ defaultOrder, onClose, onCreated }: AddModalProps) {
  const [name, setName]         = useState("");
  const [role, setRole]         = useState("");
  const [initials, setInitials] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [order, setOrder]       = useState(defaultOrder);
  const [active, setActive]     = useState(true);
  const [saving, setSaving]     = useState(false);
  const [errors, setErrors]     = useState<{ name?: string; role?: string }>({});
  const [initialsManual, setInitialsManual] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [uploading, setUploading]       = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (file: File) => {
    setSelectedFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

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
    let uploadedPhotoUrl = "";

    if (selectedFile) {
      setUploading(true);
      setUploadProgress(0);
      try {
        const path = generateStoragePath("social-mentors", selectedFile);
        uploadedPhotoUrl = await uploadFile(selectedFile, path, (p) => setUploadProgress(p));
      } catch (err: unknown) {
        console.error("Upload error:", err);
        const msg = err instanceof Error ? err.message : "Upload failed. Check Firebase Storage rules.";
        setErrors((prev) => ({ ...prev, name: `Photo upload failed: ${msg}` }));
        setSaving(false);
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    try {
      await addSocialMentor({
        name: name.trim(),
        role: role.trim(),
        initials: initials.trim() || toInitials(name),
        linkedIn: linkedIn.trim(),
        photoUrl: uploadedPhotoUrl,
        order,
        active,
      });
      onCreated("Social mentor added successfully");
      onClose();
    } catch (err: unknown) {
      setSaving(false);
      setErrors({ name: (err as Error).message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EEEEEE]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FFF0F2] flex items-center justify-center">
              <Users className="w-4 h-4 text-[#800020]" />
            </div>
            <div>
              <h2 className="text-sm font-black text-black">Add Social Mentor</h2>
              <p className="text-[10px] text-[#888888]">Fill in the details below</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-[#F5F5F5] hover:bg-[#EEEEEE] flex items-center justify-center transition-colors">
            <X className="w-3.5 h-3.5 text-[#666666]" />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center gap-5 p-4 rounded-xl border border-dashed border-[#DDDDDD] bg-[#FAFAFA]">
            <div
              onClick={() => photoInputRef.current?.click()}
              className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-[#EEEEEE] bg-[#FFF0F2] flex items-center justify-center cursor-pointer hover:border-[#800020] transition-colors flex-shrink-0"
            >
              {photoPreview ? (
                <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <Users className="w-7 h-7 text-[#DDDDDD]" />
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1">
                  <span className="text-white text-[10px] font-bold">{Math.round(uploadProgress)}%</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-black mb-0.5">Profile Photo</p>
              <button
                type="button"
                disabled={uploading}
                onClick={() => photoInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-[#800020] text-[#800020] bg-[#FFF0F2]"
              >
                <ImagePlus className="w-3 h-3" />
                {selectedFile ? "Change Photo" : "Upload Photo"}
              </button>
            </div>
            <input
              ref={photoInputRef}
              type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoChange(f); }}
            />
          </div>

          <div>
            <label className="block text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA] mb-1">Full Name *</label>
            <input type="text" className={`cms-input w-full ${errors.name ? "border-red-300 bg-red-50" : ""}`}
              placeholder="e.g. Priya Sharma" value={name} onChange={(e) => handleNameChange(e.target.value)} />
            {errors.name && <p className="text-[10px] text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-[1fr_90px] gap-3">
            <div>
              <label className="block text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA] mb-1">Role *</label>
              <input type="text" className={`cms-input w-full ${errors.role ? "border-red-300 bg-red-50" : ""}`}
                placeholder="e.g. Social Innovator" value={role} onChange={(e) => setRole(e.target.value)} />
              {errors.role && <p className="text-[10px] text-red-500 mt-1">{errors.role}</p>}
            </div>
            <div>
              <label className="block text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA] mb-1">Initials</label>
              <input type="text" className="cms-input w-full text-center font-bold" placeholder="PS" maxLength={3}
                value={initials} onChange={(e) => { setInitials(e.target.value.toUpperCase()); setInitialsManual(true); }} />
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA] mb-1">LinkedIn URL</label>
            <input type="url" className="cms-input w-full" value={linkedIn} onChange={(e) => setLinkedIn(e.target.value)} />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#EEEEEE] bg-[#FAFAFA] rounded-b-2xl flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold text-[#666666] bg-white border border-[#E0E0E0]">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white" style={{ background: "#800020" }}>
            {saving ? "Creating…" : "Create Mentor"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Edit Social Mentor Modal ────────────────────────────────────────────── */
interface EditModalProps {
  mentor: SocialMentor;
  onClose: () => void;
  onSaved: (msg: string) => void;
}
function EditSocialMentorModal({ mentor, onClose, onSaved }: EditModalProps) {
  const [name, setName]         = useState(mentor.name ?? "");
  const [role, setRole]         = useState(mentor.role ?? "");
  const [initials, setInitials] = useState(mentor.initials ?? "");
  const [linkedIn, setLinkedIn] = useState(mentor.linkedIn ?? "");
  const [saving, setSaving]     = useState(false);
  const [errors, setErrors]     = useState<{ name?: string; role?: string }>({});

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState(mentor.photoUrl ?? "");
  const [uploading, setUploading]       = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (file: File) => {
    setSelectedFile(file);
    setPhotoPreview(URL.createObjectURL(file));
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
    let finalPhotoUrl = mentor.photoUrl ?? "";

    if (selectedFile) {
      setUploading(true);
      setUploadProgress(0);
      try {
        const path = generateStoragePath("social-mentors", selectedFile);
        finalPhotoUrl = await uploadFile(selectedFile, path, (p) => setUploadProgress(p));
      } catch (err: unknown) {
        console.error("Upload error:", err);
        const msg = err instanceof Error ? err.message : "Upload failed. Check Firebase Storage rules.";
        setErrors((prev) => ({ ...prev, name: `Photo upload failed: ${msg}` }));
        setSaving(false);
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    try {
      await updateSocialMentor(mentor.id, {
        name: name.trim(),
        role: role.trim(),
        initials: initials.trim() || toInitials(name),
        linkedIn: linkedIn.trim(),
        photoUrl: finalPhotoUrl,
      });
      onSaved("Mentor updated successfully");
      onClose();
    } catch (err: unknown) {
      setSaving(false);
      setErrors({ name: (err as Error).message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EEEEEE]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FFF0F2] flex items-center justify-center">
              <Users className="w-4 h-4 text-[#800020]" />
            </div>
            <div>
              <h2 className="text-sm font-black text-black">Edit Social Mentor</h2>
              <p className="text-[10px] text-[#888888]">Modify details for {mentor.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-[#F5F5F5] hover:bg-[#EEEEEE] flex items-center justify-center transition-colors">
            <X className="w-3.5 h-3.5 text-[#666666]" />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center gap-5 p-4 rounded-xl border border-dashed border-[#DDDDDD] bg-[#FAFAFA]">
            <div
              onClick={() => photoInputRef.current?.click()}
              className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-[#EEEEEE] bg-[#FFF0F2] flex items-center justify-center cursor-pointer hover:border-[#800020] transition-colors flex-shrink-0"
            >
              {photoPreview ? (
                <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-black text-[#800020]">{initials || "?"}</span>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1">
                  <span className="text-white text-[10px] font-bold">{Math.round(uploadProgress)}%</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-black mb-0.5">Profile Photo</p>
              <button
                type="button"
                disabled={uploading}
                onClick={() => photoInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-[#800020] text-[#800020] bg-[#FFF0F2]"
              >
                <ImagePlus className="w-3 h-3" />
                {selectedFile ? "Change Photo" : "Upload New Photo"}
              </button>
            </div>
            <input
              ref={photoInputRef}
              type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoChange(f); }}
            />
          </div>

          <div>
            <label className="block text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA] mb-1">Full Name *</label>
            <input type="text" className={`cms-input w-full ${errors.name ? "border-red-300 bg-red-50" : ""}`}
              value={name} onChange={(e) => setName(e.target.value)} />
            {errors.name && <p className="text-[10px] text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-[1fr_90px] gap-3">
            <div>
              <label className="block text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA] mb-1">Role *</label>
              <input type="text" className={`cms-input w-full ${errors.role ? "border-red-300 bg-red-50" : ""}`}
                value={role} onChange={(e) => setRole(e.target.value)} />
              {errors.role && <p className="text-[10px] text-red-500 mt-1">{errors.role}</p>}
            </div>
            <div>
              <label className="block text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA] mb-1">Initials</label>
              <input type="text" className="cms-input w-full text-center font-bold"
                value={initials} onChange={(e) => setInitials(e.target.value.toUpperCase())} />
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA] mb-1">LinkedIn URL</label>
            <input type="url" className="cms-input w-full" value={linkedIn} onChange={(e) => setLinkedIn(e.target.value)} />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#EEEEEE] bg-[#FAFAFA] rounded-b-2xl flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold text-[#666666] bg-white border border-[#E0E0E0]">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white" style={{ background: "#800020" }}>
            {saving ? "Saving…" : "Save Changes"}
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
          <button onClick={onCancel} disabled={deleting} className="px-4 py-2 rounded-xl text-xs font-bold text-[#666666] bg-white border border-[#E0E0E0] hover:bg-[#F5F5F5] transition-colors">Cancel</button>
          <button onClick={onConfirm} disabled={deleting} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-60">
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────────────────── */
/* ── OrderInput — isolated local state so typing in one card never
   affects other cards' displayed order numbers ────────────────────────────── */
interface OrderInputProps {
  mentorId: string;
  initialOrder: number;
  maxOrder: number;
  onCommit: (newOrder: number) => void;
}
function OrderInput({ mentorId, initialOrder, maxOrder, onCommit }: OrderInputProps) {
  const [localVal, setLocalVal] = useState(String(initialOrder));

  useEffect(() => {
    setLocalVal(String(initialOrder));
  }, [initialOrder]);

  const commit = (raw: string) => {
    const n = parseInt(raw, 10);
    if (!isNaN(n) && n >= 0) {
      const clamped = Math.min(n, maxOrder);
      setLocalVal(String(clamped));
      onCommit(clamped);
    } else {
      setLocalVal(String(initialOrder));
    }
  };

  return (
    <div className="flex items-center gap-1">
      <span className="text-[9px] font-bold text-[#AAAAAA]">#</span>
      <input
        id={`order-${mentorId}`}
        type="number"
        min={0}
        max={maxOrder}
        className="w-10 text-center text-xs font-bold border border-[#E0E0E0] rounded-lg px-1 py-1 bg-white text-black outline-none focus:border-[#800020]"
        value={localVal}
        onChange={(e) => setLocalVal(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
      />
      <div className="flex flex-col gap-0.5">
        <button type="button"
          onClick={() => { const n = Math.max(0, (parseInt(localVal, 10) || 0) - 1); setLocalVal(String(n)); onCommit(n); }}
          title="Move Up (Decrease order #)"
          disabled={(parseInt(localVal, 10) || 0) <= 0}
          className="w-4 h-3.5 rounded border border-[#E0E0E0] bg-white hover:bg-[#FFF0F3] hover:border-[#800020]/30 hover:text-[#800020] text-[#666666] flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronUp className="w-3 h-3" />
        </button>
        <button type="button"
          onClick={() => { const n = Math.min(maxOrder, (parseInt(localVal, 10) || 0) + 1); setLocalVal(String(n)); onCommit(n); }}
          title="Move Down (Increase order #)"
          disabled={(parseInt(localVal, 10) || 0) >= maxOrder}
          className="w-4 h-3.5 rounded border border-[#E0E0E0] bg-white hover:bg-[#FFF0F3] hover:border-[#800020]/30 hover:text-[#800020] text-[#666666] flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export default function SocialMentorsPage() {
  const [mentors, setMentors]               = useState<SocialMentor[]>([]);
  const [dbMentors, setDbMentors]           = useState<SocialMentor[]>([]);
  const [loading, setLoading]               = useState(true);
  const [saving, setSaving]                 = useState<string | null>(null);
  const [toast, setToast]                   = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [showAddModal, setShowAddModal]     = useState(false);
  const [editTarget, setEditTarget]         = useState<SocialMentor | null>(null);
  const [deleteTarget, setDeleteTarget]     = useState<SocialMentor | null>(null);
  const [deleting, setDeleting]             = useState(false);

  useEffect(() => {
    const unsub = subscribeSocialMentors((data) => {
      setMentors(data);
      setDbMentors(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdate = (id: string, field: keyof SocialMentor, value: any) => {
    setMentors((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const handleSaveFooter = async (mentor: SocialMentor) => {
    setSaving(mentor.id);
    try {
      await updateSocialMentor(mentor.id, {
        order: mentor.order ?? 0,
        active: mentor.active ?? false,
      });
      // Update local db copy
      setDbMentors((prev) => prev.map((m) => m.id === mentor.id ? mentor : m));
      showToast("Mentor status & order saved");
    } catch (err: unknown) {
      showToast((err as Error).message, "error");
    }
    setSaving(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteSocialMentor(deleteTarget.id);
      showToast("Mentor deleted");
    } catch (err: unknown) {
      showToast((err as Error).message, "error");
    }
    setDeleting(false);
    setDeleteTarget(null);
  };

  const handleMoveOrder = async (mentorId: string, newOrder: number) => {
    const moving = mentors.find((m) => m.id === mentorId);
    if (!moving) return;
    const oldOrder = moving.order ?? 0;
    if (oldOrder === newOrder) return;

    const swapping = mentors.find((m) => m.id !== mentorId && (m.order ?? 0) === newOrder);

    setMentors((prev) =>
      prev.map((m) => {
        if (m.id === mentorId) return { ...m, order: newOrder };
        if (swapping && m.id === swapping.id) return { ...m, order: oldOrder };
        return m;
      })
    );

    try {
      await updateSocialMentor(mentorId, { order: newOrder });
      if (swapping) {
        await updateSocialMentor(swapping.id, { order: oldOrder });
        showToast(`#${oldOrder + 1} ↔ #${newOrder + 1} swapped`);
      } else {
        showToast(`Moved to position #${newOrder + 1}`);
      }
    } catch (err: unknown) {
      showToast((err as Error).message, "error");
    }
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--cms-bg)" }}>
      <Topbar title="Social Innovation Mentors" breadcrumb="Social Mentors" />

      {toast && (
        <div className={`fixed top-5 right-5 z-[60] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold animate-fade-in border ${
          toast.type === "success" ? "bg-white border-green-100 text-green-700" : "bg-white border-red-100 text-red-700"
        }`}>
          {toast.type === "success" ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /> : <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
          {toast.msg}
        </div>
      )}

      {showAddModal && (
        <AddSocialMentorModal
          defaultOrder={mentors.length}
          onClose={() => setShowAddModal(false)}
          onCreated={(msg) => showToast(msg)}
        />
      )}

      {editTarget && (
        <EditSocialMentorModal
          mentor={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={(msg) => showToast(msg)}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          mentorName={deleteTarget.name ?? "this mentor"}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
          deleting={deleting}
        />
      )}

      <main className="flex-1 px-8 py-8 space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-black tracking-tight">Social Innovation Mentors</h1>
            <p className="text-xs text-[#666666] mt-1">
              {loading ? "Loading…" : `${mentors.length} total mentors`}
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #800020 0%, #5B0017 100%)" }}
          >
            <Plus className="w-4 h-4" /> Add Mentor
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#EEEEEE] p-6 space-y-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-[#F5F5F5]" />
                  <div className="flex-1 space-y-2"><div className="h-4 bg-[#F5F5F5] rounded w-2/3" /></div>
                </div>
                <div className="h-20 bg-[#F5F5F5] rounded" />
              </div>
            ))}
          </div>
        ) : mentors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 cms-card">
            <div className="w-16 h-16 rounded-2xl bg-[#FFF0F2] flex items-center justify-center mb-4">
              <Users className="w-7 h-7 text-[#800020]" />
            </div>
            <h3 className="text-base font-bold text-black mb-1">No social mentors yet</h3>
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: "#800020" }}>
              <Plus className="w-4 h-4" /> Add First Mentor
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {mentors.map((mentor) => {
              const dbMentor = dbMentors.find((m) => m.id === mentor.id);
              const hasUnsavedChanges = dbMentor
                ? dbMentor.active !== mentor.active || dbMentor.order !== mentor.order
                : false;
              return (
                <div
                  key={mentor.id}
                  id={`social-mentor-${mentor.id}`}
                  className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col ${
                    hasUnsavedChanges
                      ? "border-amber-400 ring-2 ring-amber-400/10 shadow-amber-100"
                      : "border-[#D8D8D8] hover:border-[#C0C0C0]"
                  }`}
                >
                  {/* Card Header */}
                  <div className="px-5 pt-5 pb-4 flex items-start gap-4 border-b border-[#F5F5F5] relative">
                    <div className="relative flex-shrink-0">
                      <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-[#EEEEEE] bg-[#FFF0F2] flex items-center justify-center">
                        {mentor.photoUrl ? (
                          <img src={mentor.photoUrl} alt={mentor.name ?? ""} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg font-black text-[#800020]">
                            {mentor.initials || (mentor.name ?? "?").substring(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 pr-8">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          mentor.active ? "bg-green-50 text-green-700 border border-green-100" : "bg-[#F5F5F5] text-[#888888] border border-[#EEEEEE]"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${mentor.active ? "bg-green-500" : "bg-[#CCCCCC]"}`} />
                          {mentor.active ? "Active" : "Inactive"}
                        </span>
                        {hasUnsavedChanges && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                            Unsaved
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-black text-black truncate">{mentor.name || "Unnamed Mentor"}</p>
                      <p className="text-xs text-[#888888] truncate">{mentor.role || "No role set"}</p>
                    </div>
                    <button
                      onClick={() => setEditTarget(mentor)}
                      className="absolute top-5 right-5 w-8 h-8 rounded-xl border border-[#EEEEEE] bg-white text-[#666666] hover:text-[#800020] hover:border-[#800020]/20 flex items-center justify-center transition-all shadow-xs"
                      title="Edit mentor profile"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Card Body */}
                  <div className="px-5 py-4 space-y-4 flex-1">
                    {mentor.linkedIn && (
                      <div>
                        <a href={mentor.linkedIn} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#475569] hover:bg-[#F1F5F9] hover:text-[#800020] transition-colors">
                          <Link2 className="w-3.5 h-3.5" /> View LinkedIn Profile
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="px-4 py-2.5 border-t border-[#F5F5F5] bg-[#FAFAFA] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {/* Active toggle */}
                      <button type="button" onClick={() => handleUpdate(mentor.id, "active", !mentor.active)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border transition-all ${
                          mentor.active ? "bg-green-50 text-green-700 border-green-200" : "bg-[#F5F5F5] text-[#888888] border-[#E0E0E0]"
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${mentor.active ? "bg-green-500" : "bg-[#BBBBBB]"}`} />
                        {mentor.active ? "Active" : "Inactive"}
                      </button>
                      {/* Order with Up/Down buttons */}
                      <OrderInput
                        mentorId={mentor.id}
                        initialOrder={mentor.order ?? 0}
                        maxOrder={Math.max(0, mentors.length - 1)}
                        onCommit={(newOrder) => handleMoveOrder(mentor.id, newOrder)}
                      />
                    </div>
                    {/* Actions — icon-only to save space */}
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setDeleteTarget(mentor)}
                        title="Delete mentor"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleSaveFooter(mentor)} disabled={saving === mentor.id}
                        title="Save order & status"
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-white transition-all disabled:opacity-60 ${
                          hasUnsavedChanges
                            ? "bg-amber-500 hover:bg-amber-600 animate-pulse ring-2 ring-amber-300"
                            : "bg-emerald-600 hover:bg-emerald-700"
                        }`}
                      >
                        {saving === mentor.id
                          ? <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                          : <Save className="w-3.5 h-3.5" />
                        }
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
