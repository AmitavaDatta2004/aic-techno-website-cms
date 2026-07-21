// src/lib/firestore.ts
// CRUD helpers for every Firestore collection used by the CMS

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
  Timestamp,
  type DocumentData,
  type QuerySnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Mentor {
  id: string;
  name: string;
  role: string;
  bio: string;
  initials: string;
  photoUrl: string;
  linkedIn: string;
  order: number;
  active: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface SocialMentor {
  id: string;
  name: string;
  role: string;
  initials: string;
  photoUrl: string;
  linkedIn: string;
  order: number;
  active: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Career {
  id: string;
  dept: string;
  title: string;
  icon: string;
  tags: string[];
  applyLink: string;
  order: number;
  active: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Partner {
  id: string;
  name: string;
  category: "govt" | "institutional" | "tech";
  featured: boolean;
  logoUrl?: string;
  order: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface FocusCard {
  icon: string;
  title: string;
  body: string;
}

export interface FeaturedPartner {
  id: string;
  name: string;
  tagline: string;
  meta: string;
  description: string;
  initials: string;
  logoUrl: string;
  focusCards: FocusCard[];
  gallery: string[];
  contactEmail: string;
  type: "fablab" | "learning";
  order: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface MediaFile {
  id: string;
  name: string;
  url: string;
  size: number;
  contentType: string;
  storagePath: string;
  uploadedAt?: Timestamp;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function snapToArray<T>(snap: QuerySnapshot<DocumentData>): T[] {
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as T));
}

// ─── Mentors ──────────────────────────────────────────────────────────────────

const MENTORS = "mentors";

export async function getMentors(): Promise<Mentor[]> {
  const q = query(collection(db, MENTORS), orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snapToArray<Mentor>(snap);
}

export function subscribeMentors(cb: (mentors: Mentor[]) => void): Unsubscribe {
  const q = query(collection(db, MENTORS), orderBy("order", "asc"));
  return onSnapshot(q, (snap) => cb(snapToArray<Mentor>(snap)));
}

export async function addMentor(data: Omit<Mentor, "id">): Promise<string> {
  const ref = await addDoc(collection(db, MENTORS), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateMentor(
  id: string,
  data: Partial<Omit<Mentor, "id">>
): Promise<void> {
  await updateDoc(doc(db, MENTORS, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteMentor(id: string): Promise<void> {
  await deleteDoc(doc(db, MENTORS, id));
}

// ─── Social Mentors ───────────────────────────────────────────────────────────

const SOCIAL_MENTORS = "socialMentors";

export async function getSocialMentors(): Promise<SocialMentor[]> {
  const q = query(collection(db, SOCIAL_MENTORS), orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snapToArray<SocialMentor>(snap);
}

export function subscribeSocialMentors(
  cb: (mentors: SocialMentor[]) => void
): Unsubscribe {
  const q = query(collection(db, SOCIAL_MENTORS), orderBy("order", "asc"));
  return onSnapshot(q, (snap) => cb(snapToArray<SocialMentor>(snap)));
}

export async function addSocialMentor(
  data: Omit<SocialMentor, "id">
): Promise<string> {
  const ref = await addDoc(collection(db, SOCIAL_MENTORS), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateSocialMentor(
  id: string,
  data: Partial<Omit<SocialMentor, "id">>
): Promise<void> {
  await updateDoc(doc(db, SOCIAL_MENTORS, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteSocialMentor(id: string): Promise<void> {
  await deleteDoc(doc(db, SOCIAL_MENTORS, id));
}

// ─── Careers ──────────────────────────────────────────────────────────────────

const CAREERS = "careers";

export async function getCareers(): Promise<Career[]> {
  const q = query(collection(db, CAREERS), orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snapToArray<Career>(snap);
}

export function subscribeCareers(cb: (careers: Career[]) => void): Unsubscribe {
  const q = query(collection(db, CAREERS), orderBy("order", "asc"));
  return onSnapshot(q, (snap) => cb(snapToArray<Career>(snap)));
}

export async function addCareer(data: Omit<Career, "id">): Promise<string> {
  const ref = await addDoc(collection(db, CAREERS), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCareer(
  id: string,
  data: Partial<Omit<Career, "id">>
): Promise<void> {
  await updateDoc(doc(db, CAREERS, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCareer(id: string): Promise<void> {
  await deleteDoc(doc(db, CAREERS, id));
}

// ─── Partners ─────────────────────────────────────────────────────────────────

const PARTNERS = "partners";

export async function getPartners(): Promise<Partner[]> {
  const q = query(collection(db, PARTNERS), orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snapToArray<Partner>(snap);
}

export function subscribePartners(
  cb: (partners: Partner[]) => void
): Unsubscribe {
  const q = query(collection(db, PARTNERS), orderBy("order", "asc"));
  return onSnapshot(q, (snap) => cb(snapToArray<Partner>(snap)));
}

export async function addPartner(data: Omit<Partner, "id">): Promise<string> {
  const ref = await addDoc(collection(db, PARTNERS), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updatePartner(
  id: string,
  data: Partial<Omit<Partner, "id">>
): Promise<void> {
  await updateDoc(doc(db, PARTNERS, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deletePartner(id: string): Promise<void> {
  await deleteDoc(doc(db, PARTNERS, id));
}

// ─── Featured Partners ────────────────────────────────────────────────────────

const FEATURED_PARTNERS = "featuredPartners";

export async function getFeaturedPartners(): Promise<FeaturedPartner[]> {
  const q = query(
    collection(db, FEATURED_PARTNERS),
    orderBy("order", "asc")
  );
  const snap = await getDocs(q);
  return snapToArray<FeaturedPartner>(snap);
}

export function subscribeFeaturedPartners(
  cb: (partners: FeaturedPartner[]) => void
): Unsubscribe {
  const q = query(
    collection(db, FEATURED_PARTNERS),
    orderBy("order", "asc")
  );
  return onSnapshot(q, (snap) => cb(snapToArray<FeaturedPartner>(snap)));
}

export async function addFeaturedPartner(
  data: Omit<FeaturedPartner, "id">
): Promise<string> {
  const ref = await addDoc(collection(db, FEATURED_PARTNERS), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateFeaturedPartner(
  id: string,
  data: Partial<Omit<FeaturedPartner, "id">>
): Promise<void> {
  await updateDoc(doc(db, FEATURED_PARTNERS, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteFeaturedPartner(id: string): Promise<void> {
  await deleteDoc(doc(db, FEATURED_PARTNERS, id));
}

// ─── Media ────────────────────────────────────────────────────────────────────

const MEDIA = "media";

export async function getMediaFiles(): Promise<MediaFile[]> {
  const q = query(collection(db, MEDIA), orderBy("uploadedAt", "desc"));
  const snap = await getDocs(q);
  return snapToArray<MediaFile>(snap);
}

export function subscribeMedia(
  cb: (files: MediaFile[]) => void
): Unsubscribe {
  const q = query(collection(db, MEDIA), orderBy("uploadedAt", "desc"));
  return onSnapshot(q, (snap) => cb(snapToArray<MediaFile>(snap)));
}

export async function addMediaRecord(
  data: Omit<MediaFile, "id">
): Promise<string> {
  const ref = await addDoc(collection(db, MEDIA), {
    ...data,
    uploadedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteMediaRecord(id: string): Promise<void> {
  await deleteDoc(doc(db, MEDIA, id));
}
