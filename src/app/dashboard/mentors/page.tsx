"use client";

import { useEffect, useState, useRef } from "react";
import { Topbar } from "@/components/cms/Topbar";
import {
  subscribeMentors,
  addMentor,
  updateMentor,
  deleteMentor,
  Mentor,
} from "@/lib/firestore";
import { uploadFile, generateStoragePath } from "@/lib/storage";
import {
  Link2,
  Trash2,
  Save,
  Camera,
  Plus,
  CheckCircle2,
  XCircle,
  X,
  AlertTriangle,
  User,
  ImagePlus,
  Pencil,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function toInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

/* ── Add Mentor Modal ────────────────────────────────────────────────── */
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

  const [selectedFile, setSelectedFile]     = useState<File | null>(null);
  const [photoPreview, setPhotoPreview]     = useState("");
  const [uploading, setUploading]           = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const photoInputRef                       = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (file: File) => {
    setSelectedFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!initialsManual) setInitials(val ? toInitials(val) : "");
  };
  const [initialsManual, setInitialsManual] = useState(false);

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
        const path = generateStoragePath("mentors", selectedFile);
        uploadedPhotoUrl = await uploadFile(selectedFile, path, (p) => setUploadProgress(p));
      } catch (err: unknown) {
        console.error("Upload error:", err);
        const msg = err instanceof Error ? err.message : "Upload failed";
        setErrors((prev) => ({ ...prev, name: `Photo upload failed: ${msg}` }));
        setSaving(false);
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    try {
      await addMentor({
        name: name.trim(),
        role: role.trim(),
        initials: initials.trim() || toInitials(name),
        bio: bio.trim(),
        linkedIn: linkedIn.trim(),
        photoUrl: uploadedPhotoUrl,
        board: "",
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-[#EEEEEE] flex items-center justify-between bg-[#FAFAFA]">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" style={{ color: "#800020" }} />
            <h2 className="text-base font-black text-black">Add New Mentor</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#999999] hover:text-black hover:bg-[#EEEEEE]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Avatar Upload */}
          <div className="flex items-center gap-4 p-3 bg-[#F9F9F9] rounded-xl border border-[#EEEEEE]">
            <div className="relative w-16 h-16 rounded-xl bg-[#800020] text-white flex items-center justify-center text-xl font-bold overflow-hidden shrink-0">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : initials ? (
                initials
              ) : (
                <User className="w-8 h-8 opacity-50" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-black mb-1">Profile Photo</p>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handlePhotoChange(e.target.files[0]);
                }}
              />
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-[#E0E0E0] text-black hover:bg-[#F5F5F5] transition-colors"
              >
                <ImagePlus className="w-3.5 h-3.5" />
                {photoPreview ? "Change Photo" : "Upload Photo"}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA] mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`cms-input w-full ${errors.name ? "border-red-500" : ""}`}
              placeholder="e.g. Sheena Bhalla"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA] mb-1">
              Role / Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`cms-input w-full ${errors.role ? "border-red-500" : ""}`}
              placeholder="e.g. Founder & MD, Twirl.store"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
            {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA] mb-1">Initials</label>
              <input
                type="text"
                maxLength={3}
                className="cms-input w-full uppercase"
                value={initials}
                onChange={(e) => {
                  setInitials(e.target.value.toUpperCase());
                  setInitialsManual(true);
                }}
              />
            </div>
            <div>
              <label className="block text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA] mb-1">Display Order</label>
              <input
                type="number"
                min={0}
                className="cms-input w-full font-bold"
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
              />
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA] mb-1">LinkedIn URL</label>
            <input
              type="url"
              className="cms-input w-full"
              placeholder="https://linkedin.com/in/username"
              value={linkedIn}
              onChange={(e) => setLinkedIn(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA] mb-1">Bio</label>
            <textarea
              className="cms-input w-full resize-none leading-relaxed"
              rows={2}
              placeholder="Brief overview..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="active-toggle"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-4 h-4 rounded text-[#800020]"
            />
            <label htmlFor="active-toggle" className="text-xs font-bold text-black cursor-pointer">
              Active (Visible on public site)
            </label>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#EEEEEE] bg-[#FAFAFA] flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold text-[#666666] bg-white border border-[#E0E0E0]">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || uploading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md disabled:opacity-60"
            style={{ background: "#800020" }}
          >
            {saving ? "Saving…" : "Add Mentor"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Edit Mentor Modal ───────────────────────────────────────────────── */
interface EditModalProps {
  mentor: Mentor;
  onClose: () => void;
  onUpdated: (msg: string) => void;
}

function EditMentorModal({ mentor, onClose, onUpdated }: EditModalProps) {
  const [name, setName]         = useState(mentor.name);
  const [role, setRole]         = useState(mentor.role);
  const [initials, setInitials] = useState(mentor.initials);
  const [bio, setBio]           = useState(mentor.bio || "");
  const [linkedIn, setLinkedIn] = useState(mentor.linkedIn || "");
  const [order, setOrder]       = useState(mentor.order);
  const [active, setActive]     = useState(mentor.active);
  const [saving, setSaving]     = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState(mentor.photoUrl || "");
  const [uploading, setUploading]       = useState(false);
  const photoInputRef                   = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (file: File) => {
    setSelectedFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!name.trim() || !role.trim()) return;
    setSaving(true);

    let finalPhotoUrl = mentor.photoUrl;
    if (selectedFile) {
      setUploading(true);
      try {
        const path = generateStoragePath("mentors", selectedFile);
        finalPhotoUrl = await uploadFile(selectedFile, path);
      } catch (err: unknown) {
        console.error("Photo upload error:", err);
        setSaving(false);
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    try {
      await updateMentor(mentor.id, {
        name: name.trim(),
        role: role.trim(),
        initials: initials.trim() || toInitials(name),
        bio: bio.trim(),
        linkedIn: linkedIn.trim(),
        photoUrl: finalPhotoUrl,
        order,
        active,
      });
      onUpdated("Mentor updated successfully");
      onClose();
    } catch (err: unknown) {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-[#EEEEEE] flex items-center justify-between bg-[#FAFAFA]">
          <div className="flex items-center gap-2">
            <Pencil className="w-4 h-4" style={{ color: "#800020" }} />
            <h2 className="text-base font-black text-black">Edit Mentor</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#999999] hover:text-black hover:bg-[#EEEEEE]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="flex items-center gap-4 p-3 bg-[#F9F9F9] rounded-xl border border-[#EEEEEE]">
            <div className="relative w-16 h-16 rounded-xl bg-[#800020] text-white flex items-center justify-center text-xl font-bold overflow-hidden shrink-0">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                initials || toInitials(name)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handlePhotoChange(e.target.files[0]);
                }}
              />
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-[#E0E0E0] text-black hover:bg-[#F5F5F5]"
              >
                <ImagePlus className="w-3.5 h-3.5" />
                {photoPreview ? "Change Photo" : "Upload Photo"}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA] mb-1">Name</label>
            <input type="text" className="cms-input w-full" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label className="block text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA] mb-1">Role / Title</label>
            <input type="text" className="cms-input w-full" value={role} onChange={(e) => setRole(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA] mb-1">Initials</label>
              <input type="text" className="cms-input w-full uppercase" value={initials} onChange={(e) => setInitials(e.target.value.toUpperCase())} />
            </div>
            <div>
              <label className="block text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA] mb-1">Display Order</label>
              <input type="number" className="cms-input w-full font-bold" value={order} onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)} />
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA] mb-1">LinkedIn URL</label>
            <input type="url" className="cms-input w-full" value={linkedIn} onChange={(e) => setLinkedIn(e.target.value)} />
          </div>

          <div>
            <label className="block text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AAAAAA] mb-1">Bio</label>
            <textarea className="cms-input w-full resize-none leading-relaxed" rows={2} value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" id="edit-active" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-4 h-4 rounded text-[#800020]" />
            <label htmlFor="edit-active" className="text-xs font-bold text-black cursor-pointer">Active (Visible on public site)</label>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#EEEEEE] bg-[#FAFAFA] flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold text-[#666666] bg-white border border-[#E0E0E0]">Cancel</button>
          <button onClick={handleSubmit} disabled={saving || uploading} className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md" style={{ background: "#800020" }}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Delete Modal ───────────────────────────────────────────────────── */
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
              Are you sure you want to delete <span className="font-bold text-black">{mentorName}</span>?
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button onClick={onCancel} disabled={deleting} className="px-4 py-2 rounded-xl text-xs font-bold text-[#666666] bg-white border border-[#E0E0E0]">Cancel</button>
          <button onClick={onConfirm} disabled={deleting} className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-500 hover:bg-red-600">
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Isolated OrderInput Component ───────────────────────────────────── */
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
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
      />
      <div className="flex flex-col gap-0.5">
        <button
          type="button"
          onClick={() => {
            const n = Math.max(0, (parseInt(localVal, 10) || 0) - 1);
            setLocalVal(String(n));
            onCommit(n);
          }}
          title="Move Up"
          disabled={(parseInt(localVal, 10) || 0) <= 0}
          className="w-4 h-3.5 rounded border border-[#E0E0E0] bg-white hover:bg-[#FFF0F3] text-[#666666] flex items-center justify-center transition-all disabled:opacity-30"
        >
          <ChevronUp className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={() => {
            const n = Math.min(maxOrder, (parseInt(localVal, 10) || 0) + 1);
            setLocalVal(String(n));
            onCommit(n);
          }}
          title="Move Down"
          disabled={(parseInt(localVal, 10) || 0) >= maxOrder}
          className="w-4 h-3.5 rounded border border-[#E0E0E0] bg-white hover:bg-[#FFF0F3] text-[#666666] flex items-center justify-center transition-all disabled:opacity-30"
        >
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

/* ── Main Page Component ────────────────────────────────────────────── */
export default function MentorsPage() {
  const [mentors, setMentors]           = useState<Mentor[]>([]);
  const [dbMentors, setDbMentors]       = useState<Mentor[]>([]);
  const dbMentorsRef                    = useRef<Mentor[]>([]);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState<string | null>(null);
  const [toast, setToast]               = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget]     = useState<Mentor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Mentor | null>(null);
  const [deleting, setDeleting]         = useState(false);

  useEffect(() => {
    const unsub = subscribeMentors((data) => {
      setDbMentors(data);
      setMentors((prevLocal) => {
        return data.map((dbM) => {
          const localM = prevLocal.find((l) => l.id === dbM.id);
          const oldDbM = dbMentorsRef.current.find((d) => d.id === dbM.id);
          if (localM && oldDbM) {
            const isActiveDirty = localM.active !== oldDbM.active;
            const isOrderDirty = localM.order !== oldDbM.order;
            return {
              ...dbM,
              active: isActiveDirty ? localM.active : dbM.active,
              order: isOrderDirty ? localM.order : dbM.order,
            };
          }
          return dbM;
        });
      });
      dbMentorsRef.current = data;
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleMoveOrder = async (mentorId: string, delta: number) => {
    const moving = mentors.find((m) => m.id === mentorId);
    if (!moving) return;
    const currentOrder = moving.order ?? 0;
    const targetOrder = Math.max(0, currentOrder + delta);
    if (targetOrder === currentOrder) return;

    const swapping = mentors.find((m) => m.id !== mentorId && (m.order ?? 0) === targetOrder);
    setMentors((prev) =>
      prev.map((m) => {
        if (m.id === mentorId) return { ...m, order: targetOrder };
        if (swapping && m.id === swapping.id) return { ...m, order: currentOrder };
        return m;
      })
    );

    try {
      await updateMentor(mentorId, { order: targetOrder });
      if (swapping) await updateMentor(swapping.id, { order: currentOrder });
      showToast(`Moved ${moving.name}`);
    } catch {
      showToast("Order update failed", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteMentor(deleteTarget.id);
      showToast(`Deleted ${deleteTarget.name}`);
      setDeleteTarget(null);
    } catch {
      showToast("Delete failed", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F8F9FA]">
      <Topbar
        title="Mentors Management"
        actions={
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm"
            style={{ background: "#800020" }}
          >
            <Plus className="w-4 h-4" />
            Add Mentor
          </button>
        }
      />

      <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-white text-xs font-bold animate-fade-in ${
              toast.type === "error" ? "bg-red-600" : "bg-black"
            }`}
          >
            {toast.type === "error" ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4 text-green-400" />}
            {toast.msg}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-black">Mentors Network</h2>
            <p className="text-xs text-[#666666] mt-0.5">
              {loading ? "Loading…" : `${mentors.length} active & extended mentors`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-[#EEEEEE] animate-pulse space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#EEEEEE]" />
                <div className="h-4 w-3/4 bg-[#EEEEEE] rounded" />
                <div className="h-3 w-1/2 bg-[#EEEEEE] rounded" />
              </div>
            ))}
          </div>
        ) : mentors.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-[#EEEEEE] text-center space-y-3">
            <User className="w-12 h-12 text-[#CCCCCC] mx-auto" />
            <h3 className="text-base font-bold text-black">No mentors yet</h3>
            <p className="text-xs text-[#666666]">Click "Add Mentor" above to add your first mentor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mentors.map((mentor) => (
              <div
                key={mentor.id}
                className={`bg-white rounded-2xl border transition-all flex flex-col justify-between overflow-hidden ${
                  !mentor.active ? "opacity-60 border-dashed border-[#CCCCCC]" : "border-[#EEEEEE] hover:border-[#800020]/40 shadow-xs"
                }`}
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="relative w-12 h-12 rounded-full bg-[#800020] text-white flex items-center justify-center text-base font-bold overflow-hidden shrink-0">
                      {mentor.photoUrl ? (
                        <img
                          src={mentor.photoUrl}
                          alt={mentor.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{mentor.initials || toInitials(mentor.name)}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditTarget(mentor)}
                        title="Edit Details"
                        className="p-1.5 rounded-lg text-[#666666] hover:text-[#800020] hover:bg-[#FFF0F3] transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(mentor)}
                        title="Delete Mentor"
                        className="p-1.5 rounded-lg text-[#666666] hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-black truncate">{mentor.name}</h4>
                    <p className="text-xs text-[#666666] line-clamp-2 mt-0.5">{mentor.role}</p>
                  </div>

                  {mentor.linkedIn && (
                    <a
                      href={mentor.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-[#800020] hover:underline"
                    >
                      <Link2 className="w-3 h-3" />
                      LinkedIn Profile
                    </a>
                  )}
                </div>

                <div className="px-4 py-2.5 bg-[#FAFAFA] border-t border-[#EEEEEE] flex items-center justify-between">
                  <OrderInput
                    mentorId={mentor.id}
                    initialOrder={mentor.order ?? 0}
                    maxOrder={Math.max(0, mentors.length - 1)}
                    onCommit={async (newOrder) => {
                      try {
                        await updateMentor(mentor.id, { order: newOrder });
                        showToast(`Updated order for ${mentor.name}`);
                      } catch {
                        showToast("Order update failed", "error");
                      }
                    }}
                  />

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveOrder(mentor.id, -1)}
                      title="Move Up"
                      className="p-1 rounded text-[#666666] hover:text-[#800020]"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveOrder(mentor.id, 1)}
                      title="Move Down"
                      className="p-1 rounded text-[#666666] hover:text-[#800020]"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={async () => {
                        const newActive = !mentor.active;
                        setMentors((prev) => prev.map((m) => (m.id === mentor.id ? { ...m, active: newActive } : m)));
                        try {
                          await updateMentor(mentor.id, { active: newActive });
                          showToast(`${mentor.name} is now ${newActive ? "active" : "hidden"}`);
                        } catch {
                          showToast("Status update failed", "error");
                        }
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        mentor.active ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {mentor.active ? "Active" : "Hidden"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showAddModal && (
          <AddMentorModal
            defaultOrder={mentors.length + 1}
            onClose={() => setShowAddModal(false)}
            onCreated={(msg) => showToast(msg)}
          />
        )}

        {editTarget && (
          <EditMentorModal
            mentor={editTarget}
            onClose={() => setEditTarget(null)}
            onUpdated={(msg) => showToast(msg)}
          />
        )}

        {deleteTarget && (
          <DeleteConfirmModal
            mentorName={deleteTarget.name}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
            deleting={deleting}
          />
        )}
      </main>
    </div>
  );
}
