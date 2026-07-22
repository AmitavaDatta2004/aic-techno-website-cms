"use client";

import { useEffect, useState, useRef } from "react";
import { Topbar } from "@/components/cms/Topbar";
import { 
  subscribeMedia, 
  addMediaRecord, 
  deleteMediaRecord, 
  type MediaFile 
} from "@/lib/firestore";
import { 
  uploadFile, 
  deleteFile, 
  generateStoragePath 
} from "@/lib/storage";
import { 
  UploadCloud, 
  Image as ImageIcon, 
  Copy, 
  Trash2, 
  AlertTriangle 
} from "lucide-react";

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Upload State
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status/Toast State
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [fileToDelete, setFileToDelete] = useState<MediaFile | null>(null);

  useEffect(() => {
    const unsub = subscribeMedia((data) => {
      setMedia(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const showStatus = (type: "success" | "error", message: string) => {
    setStatus({ type, message });
    setTimeout(() => setStatus(null), 3000);
  };

  // Upload Logic
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) {
        showStatus("error", `${file.name} is not an image file.`);
        continue;
      }

      const tempId = Math.random().toString(36).substring(7);
      setUploadProgress(prev => ({ ...prev, [tempId]: 0 }));

      try {
        const path = generateStoragePath("media", file);
        const url = await uploadFile(file, path, (prog) => {
          setUploadProgress(prev => ({ ...prev, [tempId]: prog }));
        });

        await addMediaRecord({
          name: file.name,
          url,
          size: file.size,
          contentType: file.type,
          storagePath: path,
        });

        showStatus("success", `Uploaded ${file.name}`);
      } catch (err: unknown) {
        showStatus("error", `Failed to upload ${file.name}: ${(err as Error).message}`);
      } finally {
        setUploadProgress(prev => {
          const newProg = { ...prev };
          delete newProg[tempId];
          return newProg;
        });
      }
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const confirmDelete = async () => {
    if (!fileToDelete) return;
    setDeletingId(fileToDelete.id);
    try {
      await deleteFile(fileToDelete.storagePath);
      await deleteMediaRecord(fileToDelete.id);
      showStatus("success", "File deleted successfully");
    } catch (err: unknown) {
      showStatus("error", `Failed to delete file: ${(err as Error).message}`);
    } finally {
      setDeletingId(null);
      setFileToDelete(null);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      showStatus("success", "URL copied to clipboard!");
    } catch (_err) {
      showStatus("error", "Failed to copy URL.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      <Topbar title="Media Library" breadcrumb="Media" />
      
      {/* Toast */}
      {status && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg font-medium text-sm shadow-lg transition-all animate-fade-in ${
            status.type === "success"
              ? "bg-[var(--cms-success)] text-white"
              : "bg-[var(--cms-danger)] text-white"
          }`}
        >
          {status.message}
        </div>
      )}

      <main className="flex-1 px-8 py-8 space-y-8 animate-fade-in">
        
        {/* Upload Area */}
        <section>
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`cms-card p-12 border-2 border-dashed flex flex-col items-center justify-center text-center transition-colors ${
              isDragging
                ? "border-[var(--cms-accent)] bg-[var(--cms-accent)]/10"
                : "border-[var(--cms-border)] hover:border-[var(--cms-accent)]/50"
            }`}
          >
            <UploadCloud className="w-12 h-12 text-[var(--cms-muted)] mb-4" />
            <h3 className="text-lg font-semibold text-[var(--cms-text)] mb-2">
              Drag & Drop your images here
            </h3>
            <p className="text-sm text-[var(--cms-text-2)] mb-6">
              or click to browse from your computer (Images only)
            </p>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              id="file-upload"
              ref={fileInputRef}
              onChange={(e) => handleFiles(e.target.files)}
            />
            <button
              id="browse-files-btn"
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-[var(--cms-accent)] hover:bg-[var(--cms-accent-hover)] transition-colors"
            >
              Browse Files
            </button>

            {/* Upload Progress */}
            {Object.keys(uploadProgress).length > 0 && (
              <div className="w-full max-w-md mt-6 space-y-3">
                {Object.entries(uploadProgress).map(([id, prog]) => (
                  <div key={id} className="w-full">
                    <div className="flex justify-between text-xs text-[var(--cms-text-2)] mb-1">
                      <span>Uploading...</span>
                      <span>{prog}%</span>
                    </div>
                    <div className="w-full h-2 bg-[var(--cms-surface-2)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--cms-accent)] transition-all duration-300"
                        style={{ width: `${prog}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Media Grid */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--cms-muted)] mb-4">
            Uploaded Media
          </h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--cms-accent)]"></div>
            </div>
          ) : media.length === 0 ? (
            <div className="cms-card p-12 flex flex-col items-center justify-center text-center">
              <ImageIcon className="w-12 h-12 text-[var(--cms-muted)] mb-4" />
              <p className="text-[var(--cms-text-2)]">No media files found. Upload some to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {media.map((file) => (
                <div key={file.id} className="cms-card group overflow-hidden flex flex-col">
                  <div className="relative aspect-square overflow-hidden bg-[var(--cms-surface-2)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        id={`copy-url-${file.id}`}
                        onClick={() => copyToClipboard(file.url)}
                        className="p-2 rounded-full bg-white/10 hover:bg-[var(--cms-accent)] text-white transition-colors"
                        title="Copy URL"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                      <button
                        id={`delete-btn-${file.id}`}
                        onClick={() => setFileToDelete(file)}
                        className="p-2 rounded-full bg-white/10 hover:bg-[var(--cms-danger)] text-white transition-colors"
                        title="Delete File"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4 flex-1 flex flex-col">
                    <p className="text-sm font-medium text-[var(--cms-text)] truncate mb-1" title={file.name}>
                      {file.name}
                    </p>
                    <div className="flex justify-between items-center text-xs text-[var(--cms-muted)] mt-auto">
                      <span>{formatBytes(file.size)}</span>
                      <span>
                        {file.uploadedAt && typeof (file.uploadedAt as { toDate?: () => Date }).toDate === 'function'
                          ? (file.uploadedAt as { toDate: () => Date }).toDate().toLocaleDateString()
                          : "Just now"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Delete Confirmation Modal */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="cms-card max-w-sm w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4 text-[var(--cms-danger)]">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-semibold text-[var(--cms-text)]">Delete File</h3>
            </div>
            <p className="text-sm text-[var(--cms-text-2)] mb-6">
              Are you sure you want to delete <span className="font-semibold text-[var(--cms-text)]">{fileToDelete.name}</span>? This action cannot be undone and will permanently remove the file from storage.
            </p>
            <div className="flex justify-end gap-3">
              <button
                id="cancel-delete-btn"
                onClick={() => setFileToDelete(null)}
                disabled={deletingId === fileToDelete.id}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-[var(--cms-text-2)] hover:text-[var(--cms-text)] hover:bg-[var(--cms-surface-2)] transition-colors"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-btn"
                onClick={confirmDelete}
                disabled={deletingId === fileToDelete.id}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--cms-danger)] hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {deletingId === fileToDelete.id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete File"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
