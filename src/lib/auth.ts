// src/lib/auth.ts
// Firebase Auth helpers

import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
  type Unsubscribe,
} from "firebase/auth";
import { auth } from "./firebase";

/**
 * Sign in with email + password.
 * Throws if credentials are wrong or user has no admin claim.
 */
export async function signIn(
  email: string,
  password: string
): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);

  // Verify admin custom claim
  const token = await credential.user.getIdTokenResult();
  if (!token.claims.admin) {
    await firebaseSignOut(auth);
    throw new Error(
      "Access denied. Your account does not have admin privileges."
    );
  }

  return credential.user;
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Get the current user's ID token, refreshed if needed.
 * Returns null if not signed in.
 */
export async function getAdminToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

/**
 * Subscribe to auth state changes.
 * Callback receives null when signed out.
 */
export function onAuthChange(
  cb: (user: User | null) => void
): Unsubscribe {
  return onAuthStateChanged(auth, cb);
}

/**
 * Check whether the current user has the admin custom claim.
 * Returns false if not signed in or claim is absent.
 */
export async function isAdmin(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;
  const token = await user.getIdTokenResult();
  return Boolean(token.claims.admin);
}
