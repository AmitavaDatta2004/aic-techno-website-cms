"use client";

import { useEffect, useState, useRef } from "react";
import { Topbar } from "@/components/cms/Topbar";
import { subscribeMentors, addMentor, updateMentor, deleteMentor, Mentor } from "@/lib/firestore";
import { uploadFile, generateStoragePath } from "@/lib/storage";

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    const unsub = subscribeMentors((data) => {
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
      await addMentor({
        name: "New Mentor",
        role: "Mentor",
        bio: "",
        initials: "NM",
        photoUrl: "",
        linkedIn: "",
        order: mentors.length,
        active: false,
      });
      showToast("Mentor added");
    } catch (err: unknown) {
      showToast((err as Error).message, "error");
    }
  };

  const handleUpdate = async (id: string, field: keyof Mentor, value: Mentor[keyof Mentor]) => {
    const updated = mentors.map((m) => (m.id === id ? { ...m, [field]: value } : m));
    setMentors(updated);
  };

  const handleSave = async (mentor: Mentor) => {
    setSaving(mentor.id);
    try {
      const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...dataToUpdate } = mentor;
      await updateMentor(mentor.id, dataToUpdate);
      showToast("Mentor saved");
    } catch (err: unknown) {
      showToast((err as Error).message, "error");
    }
    setSaving(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this mentor?")) return;
    try {
      await deleteMentor(id);
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
      const path = generateStoragePath("mentors", file);
      const url = await uploadFile(file, path, (progress) => {
        setUploadProgress(progress);
      });
      await updateMentor(id, { photoUrl: url });
      showToast("Photo uploaded successfully");
    } catch (err: unknown) {
      showToast((err as Error).message, "error");
    }

    setUploadingId(null);
    setUploadProgress(0);
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      <Topbar title="Ecosystem Enablers" breadcrumb="Mentors" />
      
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded shadow-lg text-white text-sm font-semibold animate-fade-in ${
            toast.type === "success" ? "bg-[var(--cms-success)]" : "bg-[var(--cms-danger)]"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <main className="flex-1 px-8 py-8 space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold" style={{ color: "var(--cms-text)" }}>
            Manage Mentors
          </h2>
          <button
            id="add-mentor-btn"
            onClick={handleAdd}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: "var(--cms-accent)", color: "#fff" }}
          >
            + Add Mentor
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12" style={{ color: "var(--cms-muted)" }}>
            Loading mentors...
          </div>
        ) : mentors.length === 0 ? (
          <div className="text-center py-12 cms-card">
            <p style={{ color: "var(--cms-muted)" }}>No mentors found. Add one to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mentors.map((mentor) => (
              <div key={mentor.id} id={`mentor-${mentor.id}`} className="cms-card p-6 rounded-xl space-y-4">
                <div className="flex items-start gap-6">
                  {/* Photo Section */}
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center bg-[var(--cms-surface-2)] border border-[var(--cms-border)] relative group"
                    >
                      {mentor.photoUrl ? (
                        <img src={mentor.photoUrl} alt={mentor.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-bold text-[var(--cms-muted)]">
                          {mentor.initials || mentor.name.substring(0, 2).toUpperCase()}
                        </span>
                      )}
                      
                      {uploadingId === mentor.id && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white text-xs">{Math.round(uploadProgress)}%</span>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => fileInputRefs.current[mentor.id]?.click()}
                      className="text-xs font-semibold px-3 py-1 rounded"
                      style={{ background: "var(--cms-surface-2)", color: "var(--cms-text)" }}
                      disabled={uploadingId === mentor.id}
                    >
                      {uploadingId === mentor.id ? "Uploading..." : "Upload Photo"}
                    </button>
                    <input
                      type="file"
                      id={`photo-upload-${mentor.id}`}
                      accept="image/*"
                      className="hidden"
                      ref={(el) => {
                         fileInputRefs.current[mentor.id] = el;
                      }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePhotoUpload(mentor.id, file);
                      }}
                    />
                  </div>

                  {/* Form Fields */}
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--cms-muted)" }}>
                          Name
                        </label>
                        <input
                          id={`name-${mentor.id}`}
                          type="text"
                          className="cms-input w-full"
                          value={mentor.name}
                          onChange={(e) => handleUpdate(mentor.id, "name", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--cms-muted)" }}>
                          Initials
                        </label>
                        <input
                          id={`initials-${mentor.id}`}
                          type="text"
                          className="cms-input w-full"
                          value={mentor.initials}
                          onChange={(e) => handleUpdate(mentor.id, "initials", e.target.value)}
                          maxLength={3}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--cms-muted)" }}>
                        Role
                      </label>
                      <input
                        id={`role-${mentor.id}`}
                        type="text"
                        className="cms-input w-full"
                        value={mentor.role}
                        onChange={(e) => handleUpdate(mentor.id, "role", e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--cms-muted)" }}>
                        LinkedIn URL
                      </label>
                      <input
                        id={`linkedin-${mentor.id}`}
                        type="url"
                        className="cms-input w-full"
                        value={mentor.linkedIn}
                        onChange={(e) => handleUpdate(mentor.id, "linkedIn", e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--cms-muted)" }}>
                        Bio
                      </label>
                      <textarea
                        id={`bio-${mentor.id}`}
                        className="cms-input w-full h-24 resize-none"
                        value={mentor.bio}
                        onChange={(e) => handleUpdate(mentor.id, "bio", e.target.value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            id={`active-${mentor.id}`}
                            type="checkbox"
                            checked={mentor.active}
                            onChange={(e) => handleUpdate(mentor.id, "active", e.target.checked)}
                            className="rounded border-[var(--cms-border)] bg-[var(--cms-surface-2)] text-[var(--cms-accent)] focus:ring-[var(--cms-accent)]"
                          />
                          <span className="text-sm font-semibold" style={{ color: "var(--cms-text-2)" }}>Active</span>
                        </label>

                        <div className="flex items-center gap-2">
                          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--cms-muted)" }}>
                            Order
                          </label>
                          <input
                            id={`order-${mentor.id}`}
                            type="number"
                            className="cms-input w-20 text-center"
                            value={mentor.order}
                            onChange={(e) => handleUpdate(mentor.id, "order", Number(e.target.value))}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          id={`delete-${mentor.id}`}
                          onClick={() => handleDelete(mentor.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-90"
                          style={{ background: "var(--cms-danger)", color: "#fff" }}
                        >
                          Delete
                        </button>
                        <button
                          id={`save-${mentor.id}`}
                          onClick={() => handleSave(mentor)}
                          disabled={saving === mentor.id}
                          className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
                          style={{ background: "var(--cms-success)", color: "#fff" }}
                        >
                          {saving === mentor.id ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </div>
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
