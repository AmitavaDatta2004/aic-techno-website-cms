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

// SVG Icons
const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const SaveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

interface MentorCardProps {
  mentor?: SocialMentor;
  isNew?: boolean;
  onSave: (data: Omit<SocialMentor, "id">) => Promise<void>;
  onDelete?: () => Promise<void>;
  onCancel?: () => void;
}

function MentorCard({ mentor, isNew, onSave, onDelete, onCancel }: MentorCardProps) {
  const [name, setName] = useState(mentor?.name || "");
  const [role, setRole] = useState(mentor?.role || "");
  const [explicitInitials, setExplicitInitials] = useState(mentor?.initials || "");
  const [photoUrl, setPhotoUrl] = useState(mentor?.photoUrl || "");
  const [linkedIn, setLinkedIn] = useState(mentor?.linkedIn || "");
  const [active, setActive] = useState(mentor?.active ?? true);
  const [order, setOrder] = useState<number>(mentor?.order || 0);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-generate initials if name changes and initials not explicitly set
  const initials = explicitInitials || (isNew && name ? (
    name.split(" ").length >= 2
      ? (name.split(" ")[0][0] + name.split(" ")[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase()
  ) : "");

  const handleSave = async () => {
    if (!name.trim() || !role.trim()) {
      alert("Name and Role are required");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        name,
        role,
        initials,
        photoUrl,
        linkedIn,
        active,
        order,
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const path = generateStoragePath('social-mentors', file);
      const url = await uploadFile(file, path);
      setPhotoUrl(url);
    } catch (err) {
      alert((err as Error).message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="cms-card p-6 flex flex-col gap-6 relative">
      <div className="flex items-start gap-4">
        {/* Photo Area */}
        <div className="relative group">
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold bg-[var(--cms-surface-2)] text-[var(--cms-text-2)] overflow-hidden border border-[var(--cms-border)]"
            style={{ 
              backgroundImage: photoUrl ? `url(${photoUrl})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {!photoUrl && (initials || "?")}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity text-white cursor-pointer disabled:cursor-wait"
            title="Upload Photo"
          >
            <UploadIcon />
          </button>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handlePhotoUpload}
            accept="image/*"
            className="hidden" 
          />
        </div>

        {/* Core Info */}
        <div className="flex-1 space-y-3">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)] mb-1 block">Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="cms-input w-full py-1.5 px-3" 
              placeholder="Mentor Name"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)] mb-1 block">Role</label>
            <input 
              type="text" 
              value={role} 
              onChange={(e) => setRole(e.target.value)} 
              className="cms-input w-full py-1.5 px-3" 
              placeholder="e.g. Social Innovator"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)] mb-1 block">Initials</label>
          <input 
            type="text" 
            value={initials} 
            onChange={(e) => setExplicitInitials(e.target.value)} 
            className="cms-input w-full py-1.5 px-3" 
            maxLength={3}
            placeholder="JD"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)] mb-1 block">Order</label>
          <input 
            type="number" 
            value={order} 
            onChange={(e) => setOrder(parseInt(e.target.value) || 0)} 
            className="cms-input w-full py-1.5 px-3" 
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)] mb-1 block">LinkedIn URL</label>
        <input 
          type="url" 
          value={linkedIn} 
          onChange={(e) => setLinkedIn(e.target.value)} 
          className="cms-input w-full py-1.5 px-3" 
          placeholder="https://linkedin.com/in/..."
        />
      </div>

      <div className="flex items-center gap-3 mt-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={active} 
            onChange={(e) => setActive(e.target.checked)} 
            className="rounded border-[var(--cms-border)] bg-[var(--cms-surface-2)] text-[var(--cms-accent)] focus:ring-[var(--cms-accent)]"
          />
          <span className="text-sm font-medium text-[var(--cms-text-2)]">Active (Visible on site)</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-[var(--cms-border)]">
        {isNew && onCancel && (
          <button 
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold text-[var(--cms-text-2)] hover:text-white transition-colors"
          >
            Cancel
          </button>
        )}
        
        {!isNew && onDelete && (
          <button 
            onClick={onDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white transition-colors bg-[var(--cms-danger)] hover:bg-red-600 mr-auto"
            title="Delete Mentor"
          >
            <TrashIcon /> Delete
          </button>
        )}
        
        <button 
          onClick={handleSave}
          disabled={saving || uploading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors bg-[var(--cms-success)] hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : <><SaveIcon /> Save</>}
        </button>
      </div>
    </div>
  );
}

export default function SocialMentorsPage() {
  const [mentors, setMentors] = useState<SocialMentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'} | null>(null);

  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeSocialMentors((data) => {
      const sorted = [...data].sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        return a.name.localeCompare(b.name);
      });
      setMentors(sorted);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Social Innovation Mentors" breadcrumb="Social Mentors" />
      
      {toast && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg text-white font-medium z-50 transition-opacity shadow-lg ${toast.type === 'error' ? 'bg-[var(--cms-danger)]' : 'bg-[var(--cms-success)]'}`}>
          {toast.msg}
        </div>
      )}

      <main className="flex-1 px-8 py-8 space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[var(--cms-text)]">Manage Social Mentors</h1>
            <p className="text-[var(--cms-text-2)] mt-1">Add, edit, or remove social mentors from the directory.</p>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
            style={{ background: 'var(--cms-accent)' }}
            onMouseOver={(e) => e.currentTarget.style.background = 'var(--cms-accent-hover)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'var(--cms-accent)'}
          >
            <span>+</span> Add Mentor
          </button>
        </div>

        {loading ? (
          <div className="text-[var(--cms-text-2)] animate-pulse">Loading mentors...</div>
        ) : mentors.length === 0 && !isAdding ? (
          <div className="cms-card p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--cms-surface-2)] flex items-center justify-center mb-4 text-2xl">
              👥
            </div>
            <h3 className="text-lg font-bold text-[var(--cms-text)]">No Social Mentors found</h3>
            <p className="text-[var(--cms-text-2)] max-w-md mt-2 mb-6">You haven&apos;t added any social mentors yet. Click the button below to add your first mentor.</p>
            <button 
              onClick={() => setIsAdding(true)}
              className="px-6 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
              style={{ background: 'var(--cms-accent)' }}
            >
              Add Mentor
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {isAdding && (
              <MentorCard 
                isNew 
                onCancel={() => setIsAdding(false)} 
                onSave={async (data) => {
                  try {
                    await addSocialMentor(data);
                    setIsAdding(false);
                    showToast("Mentor added successfully");
                  } catch (e) {
                    showToast((e as Error).message || "Failed to add mentor", "error");
                    throw e; // rethrow to keep saving state or handle it in component, actually it's handled here.
                  }
                }}
              />
            )}
            {mentors.map(mentor => (
              <MentorCard 
                key={mentor.id} 
                mentor={mentor} 
                onSave={async (data) => {
                  try {
                    await updateSocialMentor(mentor.id, data);
                    showToast("Mentor updated successfully");
                  } catch (e) {
                    showToast((e as Error).message || "Failed to update mentor", "error");
                    throw e;
                  }
                }}
                onDelete={async () => {
                  if (confirm("Are you sure you want to delete this mentor?")) {
                    try {
                      await deleteSocialMentor(mentor.id);
                      showToast("Mentor deleted successfully");
                    } catch (e) {
                      showToast((e as Error).message || "Failed to delete mentor", "error");
                    }
                  }
                }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
