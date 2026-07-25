// src/app/api/admin/set-claim/route.ts
import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { adminAuth } = await import("@/lib/firebase-admin");
    const body = await req.json();
    const { targetEmail, targetUid, isAdmin = true } = body;

    if (!targetEmail && !targetUid) {
      return NextResponse.json(
        { error: "Either targetEmail or targetUid is required" },
        { status: 400 }
      );
    }

    // ── Auth Check ─────────────────────────────────────────────────────────────
    let authorized = false;

    // 1. Check Bootstrap key (for setting up initial admin user)
    const bootstrapKey = req.headers.get("x-bootstrap-key");
    const expectedBootstrapKey = process.env.ADMIN_BOOTSTRAP_KEY;

    if (bootstrapKey && expectedBootstrapKey && bootstrapKey === expectedBootstrapKey) {
      authorized = true;
    }

    // 2. Check Firebase ID Token (for logged-in admin users)
    if (!authorized) {
      const authHeader = req.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const idToken = authHeader.substring(7);
        try {
          const decodedToken = await adminAuth.verifyIdToken(idToken);
          if (decodedToken.admin === true) {
            authorized = true;
          }
        } catch {
          // invalid token
        }
      }
    }

    if (!authorized) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privilege or valid x-bootstrap-key required." },
        { status: 403 }
      );
    }

    // ── Find Target User ───────────────────────────────────────────────────────
    let uidToUpdate = targetUid;
    let userRecord;

    if (targetEmail && !targetUid) {
      userRecord = await adminAuth.getUserByEmail(targetEmail);
      uidToUpdate = userRecord.uid;
    } else if (targetUid) {
      userRecord = await adminAuth.getUser(targetUid);
    }

    if (!uidToUpdate || !userRecord) {
      return NextResponse.json(
        { error: "User not found in Firebase Authentication" },
        { status: 404 }
      );
    }

    // ── Set Custom Claims ──────────────────────────────────────────────────────
    const existingClaims = userRecord.customClaims || {};
    const newClaims = {
      ...existingClaims,
      admin: Boolean(isAdmin),
    };

    await adminAuth.setCustomUserClaims(uidToUpdate, newClaims);

    return NextResponse.json({
      success: true,
      message: `Admin claim ${isAdmin ? "granted to" : "revoked from"} ${userRecord.email || uidToUpdate}`,
      uid: uidToUpdate,
      email: userRecord.email,
      claims: newClaims,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal Server Error";
    console.error("Set Custom Claim Error:", err);
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}
