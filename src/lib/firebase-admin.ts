// src/lib/firebase-admin.ts
// Firebase Admin SDK singleton for Next.js App Router (Server-side & API Routes)

import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let adminApp: App;

function parsePrivateKey(keyStr: string): string {
  const trimmed = keyStr.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      // fallback
    }
  }
  return trimmed.replace(/^["']|["']$/g, "").replace(/\\n/g, "\n").replace(/\r/g, "");
}

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (privateKey) {
    privateKey = parsePrivateKey(privateKey);
  }

  if (clientEmail && privateKey && projectId) {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  // Fallback to default credentials (e.g. Cloud Run, GCP environment, or emulator)
  return initializeApp({
    projectId,
  });
}

adminApp = getAdminApp();

export const adminAuth: Auth = getAuth(adminApp);
export const adminDb: Firestore = getFirestore(adminApp);
export default adminApp;
