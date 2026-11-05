// src/app/api/admin/startups/route.ts
// Creates / re-invites Startup Portal logins. Admin-only (Firebase ID token with admin claim).
//
//   POST { action: "register", email, name, founderName?, phone?, stage? }
//     → creates the Firebase Auth user (if needed) + startups/{email} doc
//   POST { action: "invite", email }
//     → makes sure the Auth user exists and returns a fresh password-setup link
//
// The client then emails the link with Firebase's password-reset email; the link is also
// returned so an admin can share it directly if the email doesn't arrive.
import { NextResponse, type NextRequest } from "next/server";
import { randomBytes } from "crypto";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STAGES = ["Pre-incubation", "Incubation", "Acceleration", "Alumni"];

function portalLoginUrl(): string {
  return process.env.NEXT_PUBLIC_PORTAL_LOGIN_URL || "https://aic-techno.com/startup-login";
}

function clean(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function POST(req: NextRequest) {
  try {
    const { adminAuth, adminDb } = await import("@/lib/firebase-admin");
    const { FieldValue } = await import("firebase-admin/firestore");

    // ── Auth Check ─────────────────────────────────────────────────────────────
    const authHeader = req.headers.get("authorization");
    let authorized = false;
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const decoded = await adminAuth.verifyIdToken(authHeader.substring(7));
        authorized = decoded.admin === true;
      } catch {
        // invalid token
      }
    }
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized. Admin privilege required." }, { status: 403 });
    }

    const body = await req.json();
    const action = body.action === "invite" ? "invite" : "register";
    const email = clean(body.email, 200).toLowerCase();
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }

    const docRef = adminDb.collection("startups").doc(email);
    const existingDoc = await docRef.get();

    if (action === "register" && existingDoc.exists) {
      return NextResponse.json(
        { error: `${email} is already registered. Use "Resend invite" on its row.` },
        { status: 409 }
      );
    }
    if (action === "invite" && !existingDoc.exists) {
      return NextResponse.json({ error: "Startup not found" }, { status: 404 });
    }

    const name = clean(body.name, 120);
    if (action === "register" && !name) {
      return NextResponse.json({ error: "Startup name is required" }, { status: 400 });
    }

    // ── Ensure the Auth user exists ────────────────────────────────────────────
    // A random password nobody knows: the startup sets their own via the emailed link.
    const tempPassword = randomBytes(24).toString("base64url");
    let created = false;
    try {
      const user = await adminAuth.getUserByEmail(email);
      // An account that already existed but never proved it owns this inbox could have been
      // created by someone else — reset its password and sessions so only the link holder gets in.
      if (!user.emailVerified && !user.customClaims?.admin) {
        await adminAuth.updateUser(user.uid, { password: tempPassword });
        await adminAuth.revokeRefreshTokens(user.uid);
      }
    } catch (err: unknown) {
      if ((err as { code?: string })?.code !== "auth/user-not-found") throw err;
      await adminAuth.createUser({
        email,
        password: tempPassword,
        emailVerified: true, // only the inbox owner can use the password-setup link
        displayName: clean(body.founderName, 120) || name || undefined,
      });
      created = true;
    }

    // ── Firestore record ───────────────────────────────────────────────────────
    if (action === "register") {
      const stage = clean(body.stage, 40);
      await docRef.set({
        name,
        founderName: clean(body.founderName, 120),
        email,
        phone: clean(body.phone, 30),
        stage: STAGES.includes(stage) ? stage : "",
        active: true,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        invitedAt: FieldValue.serverTimestamp(),
      });
    } else {
      await docRef.update({ invitedAt: FieldValue.serverTimestamp() });
    }

    // ── Password-setup link (fallback for sharing manually) ────────────────────
    let inviteLink: string | null = null;
    try {
      inviteLink = await adminAuth.generatePasswordResetLink(email, { url: portalLoginUrl() });
    } catch {
      try {
        // The login URL's domain may not be in Firebase's authorized domains yet.
        inviteLink = await adminAuth.generatePasswordResetLink(email);
      } catch {
        inviteLink = null;
      }
    }

    return NextResponse.json({ success: true, email, created, inviteLink, loginUrl: portalLoginUrl() });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal Server Error";
    console.error("Startup Portal API Error:", err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
