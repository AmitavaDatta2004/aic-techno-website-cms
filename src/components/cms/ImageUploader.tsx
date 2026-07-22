"use client";

import { useRef, useState, useCallback } from "react";
import { uploadFile, generateStoragePath } from "@/lib/storage";

interface ImageUploaderProps {
  /** Storage folder (e.g. "mentors", "media") */
  folder: string;
  /** Called with the download URL after a successful upload */
  onUploaded: (url: string, storagePath: string, file: File) => void;
  /** Optional: current image URL to show as preview */
  currentUrl?: string;
  /** Optional label text */
  label?: string;
  /** If true, takes up full width of its container */
  fullWidth?: boolean;
}

export function ImageUploader({
  folder,
  onUploaded,
  currentUrl,
  label = "Upload Image",
  fullWidth = false,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("File must be under 10 MB.");
        return;
      }
      setError(null);
      // Local preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      setProgress(0);

      try {
        const storagePath = generateStoragePath(folder, file);
        const downloadUrl = await uploadFile(file, storagePath, (p) => setProgress(p));
        setProgress(null);
        onUploaded(downloadUrl, storagePath, file);
      } catch (err) {
        setError("Upload failed. Please try again.");
        setProgress(null);
        console.error(err);
      }
    },
    [folder, onUploaded]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  return (
    <div className={fullWidth ? "w-full" : "w-full"}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)] mb-2">
          {label}
        </label>
      )}

      <div
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center gap-3
          rounded-xl border-2 border-dashed cursor-pointer
          transition-all duration-200 min-h-[140px] p-4
          ${isDragging
            ? "border-[var(--cms-accent)] bg-[var(--cms-accent-light)] scale-[1.01]"
            : preview
              ? "border-[var(--cms-border)] hover:border-[var(--cms-accent)] bg-[var(--cms-surface-2)]"
              : "border-[var(--cms-border)] hover:border-[var(--cms-accent)] bg-[var(--cms-surface-2)] hover:bg-[var(--cms-accent-light)]"
          }
        `}
      >
        {preview ? (
          /* Image preview */
          <div className="relative w-full h-32 rounded-lg overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-semibold bg-black/60 px-3 py-1.5 rounded-lg">
                Click to replace
              </span>
            </div>
          </div>
        ) : (
          /* Empty state */
          <>
            <div className="w-12 h-12 rounded-full bg-[var(--cms-accent-light)] flex items-center justify-center">
              <svg className="w-6 h-6 text-[var(--cms-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-[var(--cms-text-2)]">
                {isDragging ? "Drop it here!" : "Drag & drop or click to upload"}
              </p>
              <p className="text-xs text-[var(--cms-muted)] mt-1">PNG, JPG, WebP · Max 10 MB</p>
            </div>
          </>
        )}

        {/* Progress bar */}
        {progress !== null && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[var(--cms-border)] rounded-b-xl overflow-hidden">
            <div
              className="h-full bg-[var(--cms-accent)] transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Uploading spinner overlay */}
        {progress !== null && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-xl">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-[var(--cms-accent)] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold text-[var(--cms-accent)]">{progress}%</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1.5 text-xs text-[var(--cms-danger)] font-medium">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onInputChange}
      />
    </div>
  );
}
