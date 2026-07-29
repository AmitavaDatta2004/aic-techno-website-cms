// src/lib/firestore.ts
// CRUD helpers for every Firestore collection used by the CMS

import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  onSnapshot,
  query,
  orderBy,
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
  board: string;   // "Advisory Board" | "Executive Board" | "Extended Mentors" | ""
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
  icon?: string;
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

// ─── Board Members ────────────────────────────────────────────────────────────

export interface BoardMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  initials: string;
  photoUrl: string;
  linkedIn: string;
  board: string;   // "Advisory Board" | "Executive Board" | ""
  order: number;
  active: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const BOARD_MEMBERS = "boardMembers";

export async function getBoardMembers(): Promise<BoardMember[]> {
  const snap = await getDocs(collection(db, BOARD_MEMBERS));
  const items = snapToArray<BoardMember>(snap);
  return items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function subscribeBoardMembers(cb: (members: BoardMember[]) => void): Unsubscribe {
  return onSnapshot(collection(db, BOARD_MEMBERS), (snap) => {
    const items = snapToArray<BoardMember>(snap);
    items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    cb(items);
  });
}

export async function addBoardMember(data: Omit<BoardMember, "id">): Promise<string> {
  const ref = await addDoc(collection(db, BOARD_MEMBERS), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateBoardMember(
  id: string,
  data: Partial<Omit<BoardMember, "id">>
): Promise<void> {
  await updateDoc(doc(db, BOARD_MEMBERS, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteBoardMember(id: string): Promise<void> {
  await deleteDoc(doc(db, BOARD_MEMBERS, id));
}

// ─── Mentors (Social / Extended Mentors) ──────────────────────────────────────

const MENTORS = "mentors";

export async function getMentors(): Promise<Mentor[]> {
  const snap = await getDocs(collection(db, MENTORS));
  const items = snapToArray<Mentor>(snap);
  return items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function subscribeMentors(cb: (mentors: Mentor[]) => void): Unsubscribe {
  return onSnapshot(collection(db, MENTORS), (snap) => {
    const items = snapToArray<Mentor>(snap);
    items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    cb(items);
  });
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

// ─── Careers ──────────────────────────────────────────────────────────────────

const CAREERS = "careers";

export async function getCareers(): Promise<Career[]> {
  const snap = await getDocs(collection(db, CAREERS));
  const items = snapToArray<Career>(snap);
  return items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function subscribeCareers(cb: (careers: Career[]) => void): Unsubscribe {
  return onSnapshot(collection(db, CAREERS), (snap) => {
    const items = snapToArray<Career>(snap);
    items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    cb(items);
  });
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
  const snap = await getDocs(collection(db, PARTNERS));
  const items = snapToArray<Partner>(snap);
  return items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function subscribePartners(
  cb: (partners: Partner[]) => void
): Unsubscribe {
  return onSnapshot(collection(db, PARTNERS), (snap) => {
    const items = snapToArray<Partner>(snap);
    items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    cb(items);
  });
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
  const snap = await getDocs(collection(db, FEATURED_PARTNERS));
  const items = snapToArray<FeaturedPartner>(snap);
  return items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function subscribeFeaturedPartners(
  cb: (partners: FeaturedPartner[]) => void
): Unsubscribe {
  return onSnapshot(collection(db, FEATURED_PARTNERS), (snap) => {
    const items = snapToArray<FeaturedPartner>(snap);
    items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    cb(items);
  });
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

// ─── Site Content (single-document sections) ──────────────────────────────────

const SITE_CONTENT = "siteContent";

// -- Hero --

export interface HeroContent {
  title: string;
  subtitle: string;
  badgeText: string;
  cta1Text: string;
  cta1Link: string;
  cta2Text: string;
  cta2Link: string;
  aimTag1: string;
  aimTag2: string;
  updatedAt?: Timestamp;
}

export async function getHeroContent(): Promise<HeroContent | null> {
  const snap = await getDoc(doc(db, SITE_CONTENT, "hero"));
  return snap.exists() ? (snap.data() as HeroContent) : null;
}

export async function saveHeroContent(data: Omit<HeroContent, "updatedAt">): Promise<void> {
  await setDoc(doc(db, SITE_CONTENT, "hero"), {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

// -- About TIG --

export interface TIGStat {
  value: string;
  label: string;
}

export interface AboutTIGContent {
  sectionTag: string;
  title: string;
  subtitle: string;
  stats: TIGStat[];
  foundedYear: string;
  foundedLabel: string;
  description1: string;
  description2: string;
  updatedAt?: Timestamp;
}

export async function getAboutTIGContent(): Promise<AboutTIGContent | null> {
  const snap = await getDoc(doc(db, SITE_CONTENT, "aboutTIG"));
  return snap.exists() ? (snap.data() as AboutTIGContent) : null;
}

export async function saveAboutTIGContent(data: Omit<AboutTIGContent, "updatedAt">): Promise<void> {
  await setDoc(doc(db, SITE_CONTENT, "aboutTIG"), {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

// -- About AIC --

export interface AICCard {
  icon: string;
  title: string;
  description: string;
}

export interface AboutAICContent {
  sectionTag: string;
  heading: string;
  subtitle: string;
  cards: AICCard[];
  updatedAt?: Timestamp;
}

export async function getAboutAICContent(): Promise<AboutAICContent | null> {
  const snap = await getDoc(doc(db, SITE_CONTENT, "aboutAIC"));
  return snap.exists() ? (snap.data() as AboutAICContent) : null;
}

export async function saveAboutAICContent(data: Omit<AboutAICContent, "updatedAt">): Promise<void> {
  await setDoc(doc(db, SITE_CONTENT, "aboutAIC"), {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

// -- Site Settings --

export interface NavLink {
  text: string;
  href: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface FooterLink {
  text: string;
  href: string;
}

export interface SiteSettings {
  logoUrl: string;
  logoAlt: string;
  navLinks: NavLink[];
  footerBrandSubtitle: string;
  footerAimLine: string;
  contactEmail: string;
  footerNavLinks: FooterLink[];
  footerExternalLinks: FooterLink[];
  socialLinks: SocialLink[];
  copyrightText: string;
  updatedAt?: Timestamp;
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const snap = await getDoc(doc(db, SITE_CONTENT, "settings"));
  return snap.exists() ? (snap.data() as SiteSettings) : null;
}

export async function saveSiteSettings(data: Omit<SiteSettings, "updatedAt">): Promise<void> {
  await setDoc(doc(db, SITE_CONTENT, "settings"), {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

// -- Back2Bengal --

export interface B2BCard {
  icon: string;
  title: string;
  description: string;
}

export interface Back2BengalContent {
  heroTitle: string;
  heroSubtitle: string;
  heroBadge: string;
  heroDescription: string;
  sections: { title: string; body: string }[];
  cards: B2BCard[];
  updatedAt?: Timestamp;
}

export async function getBack2BengalContent(): Promise<Back2BengalContent | null> {
  const snap = await getDoc(doc(db, SITE_CONTENT, "back2bengal"));
  return snap.exists() ? (snap.data() as Back2BengalContent) : null;
}

export async function saveBack2BengalContent(data: Omit<Back2BengalContent, "updatedAt">): Promise<void> {
  await setDoc(doc(db, SITE_CONTENT, "back2bengal"), {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

// ─── Workspace ────────────────────────────────────────────────────────────────

export interface WorkspacePlan {
  name: string;
  description: string;
  icon: string;
}

export interface WorkspaceContent {
  title: string;
  subtitle: string;
  email: string;
  bookingUrl: string;
  bookingStatus: string;
  plans: WorkspacePlan[];
  updatedAt?: string;
}

export function subscribeWorkspaceContent(
  cb: (data: WorkspaceContent | null) => void
): Unsubscribe {
  return onSnapshot(
    doc(db, SITE_CONTENT, "workspace"),
    (snap) => {
      cb(snap.exists() ? (snap.data() as WorkspaceContent) : null);
    },
    (err) => {
      console.error("Workspace subscribe error:", err);
      cb(null);
    }
  );
}

export async function getWorkspaceContent(): Promise<WorkspaceContent | null> {
  try {
    const snap = await getDoc(doc(db, SITE_CONTENT, "workspace"));
    return snap.exists() ? (snap.data() as WorkspaceContent) : null;
  } catch (err) {
    console.error("Error fetching workspace content:", err);
    return null;
  }
}

export async function saveWorkspaceContent(
  data: Omit<WorkspaceContent, "updatedAt">
): Promise<void> {
  await setDoc(
    doc(db, SITE_CONTENT, "workspace"),
    { ...data, updatedAt: new Date().toISOString() },
    { merge: true }
  );
}

// ─── Apply / Incubation ───────────────────────────────────────────────────────

export interface ApplyStage {
  stage: number;
  title: string;
  description: string;
  applyUrl: string;
  icon: string;
}

export interface ApplyContent {
  title: string;
  subtitle: string;
  stages: ApplyStage[];
  updatedAt?: string;
}

export function subscribeApplyContent(
  cb: (data: ApplyContent | null) => void
): Unsubscribe {
  return onSnapshot(
    doc(db, SITE_CONTENT, "apply"),
    (snap) => {
      cb(snap.exists() ? (snap.data() as ApplyContent) : null);
    },
    (err) => {
      console.error("Apply subscribe error:", err);
      cb(null);
    }
  );
}

export async function getApplyContent(): Promise<ApplyContent | null> {
  try {
    const snap = await getDoc(doc(db, SITE_CONTENT, "apply"));
    return snap.exists() ? (snap.data() as ApplyContent) : null;
  } catch (err) {
    console.error("Error fetching apply content:", err);
    return null;
  }
}

export async function saveApplyContent(
  data: Omit<ApplyContent, "updatedAt">
): Promise<void> {
  await setDoc(
    doc(db, SITE_CONTENT, "apply"),
    { ...data, updatedAt: new Date().toISOString() },
    { merge: true }
  );
}

// ─── Custom Pages (Visual Page Builder) ──────────────────────────────────────

export interface PageMeta {
  title: string;
  description: string;
  ogImage?: string;
}

export interface PageComponent {
  id: string;         // stable unique ID like "comp-1720000001"
  type: string;       // component type: "hero" | "about" | "features" | ...
  order: number;      // 0-based render order
  visible: boolean;   // if false, the component is hidden but not deleted
  props: Record<string, unknown>; // component-specific editable properties
}

export interface CustomPage {
  id: string;
  slug: string;          // URL slug, e.g. "about-us" (unique)
  title: string;         // display title shown in CMS
  template: string;      // template used: "landing" | "startup" | "event" | etc.
  status: "draft" | "published";
  meta: PageMeta;
  components: PageComponent[];
  order?: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  publishedAt?: Timestamp | null;
}


const PAGES = "pages";

export async function getPage(id: string): Promise<CustomPage | null> {
  const snap = await getDoc(doc(db, PAGES, id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as CustomPage) : null;
}

export async function publishPage(id: string): Promise<void> {
  await updateDoc(doc(db, PAGES, id), {
    status: "published",
    published: true,
    publishedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function unpublishPage(id: string): Promise<void> {
  await updateDoc(doc(db, PAGES, id), {
    status: "draft",
    published: false,
    updatedAt: serverTimestamp(),
  });
}

export async function getPages(): Promise<CustomPage[]> {
  const snap = await getDocs(collection(db, PAGES));
  const items = snapToArray<CustomPage>(snap);
  return items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function subscribePages(cb: (pages: CustomPage[]) => void): Unsubscribe {
  return onSnapshot(collection(db, PAGES), (snap) => {
    const items = snapToArray<CustomPage>(snap);
    items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    cb(items);
  });
}

export async function addPage(data: Omit<CustomPage, "id">): Promise<string> {
  const ref = await addDoc(collection(db, PAGES), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updatePage(
  id: string,
  data: Partial<Omit<CustomPage, "id">>
): Promise<void> {
  await updateDoc(doc(db, PAGES, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deletePage(id: string): Promise<void> {
  await deleteDoc(doc(db, PAGES, id));
}

