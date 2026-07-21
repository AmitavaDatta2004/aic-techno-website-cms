// src/lib/storage.ts
// Firebase Storage upload/delete helpers

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  type UploadTask,
} from "firebase/storage";
import { storage } from "./firebase";

export interface UploadProgress {
  progress: number; // 0–100
  downloadUrl?: string;
  error?: Error;
}

/**
 * Upload a file to Firebase Storage and track progress.
 * Returns the download URL on completion.
 *
 * @param file      The File object to upload
 * @param path      Storage path (e.g. "mentors/abc123.jpg")
 * @param onProgress Optional callback for progress updates (0–100)
 */
export async function uploadFile(
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        onProgress?.(progress);
      },
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(url);
      }
    );
  });
}

/**
 * Delete a file from Firebase Storage by its storage path.
 *
 * @param storagePath  The path used when the file was uploaded (e.g. "mentors/abc.jpg")
 */
export async function deleteFile(storagePath: string): Promise<void> {
  const storageRef = ref(storage, storagePath);
  await deleteObject(storageRef);
}

/**
 * Generate a unique storage path for an upload.
 * Format: "{folder}/{timestamp}-{sanitizedFilename}"
 */
export function generateStoragePath(folder: string, file: File): string {
  const ext = file.name.split(".").pop() ?? "bin";
  const safeName = file.name
    .replace(/\.[^/.]+$/, "") // remove extension
    .replace(/[^a-zA-Z0-9-_]/g, "-") // sanitize
    .slice(0, 40); // trim
  return `${folder}/${Date.now()}-${safeName}.${ext}`;
}
