// scripts/set-admin.mjs
//
// One-time script to grant admin custom claim to a Firebase user.
//
// Prerequisites:
//   1. npm install -g firebase-admin  (or use node_modules)
//   2. Download a service account key from:
//      Firebase Console → Project Settings → Service Accounts → Generate new private key
//   3. Fill in the values below OR set FIREBASE_ADMIN_* env vars in .env.local
//
// Usage:
//   node scripts/set-admin.mjs <user-uid>
//
// Example:
//   node scripts/set-admin.mjs abc123xyz
//

import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { readFileSync } from "fs";

// ── Config ─────────────────────────────────────────────────────────────────
// Option A: Load from env vars (set in your shell or .env file)
const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

// Option B: Point to your downloaded service account JSON
// const serviceAccount = JSON.parse(readFileSync("./service-account.json", "utf8"));

if (!projectId || !clientEmail || !privateKey) {
  console.error(
    "❌ Missing Firebase Admin credentials.\n" +
      "   Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL,\n" +
      "   and FIREBASE_ADMIN_PRIVATE_KEY in your environment.\n" +
      "   Or use Option B in this script to point to a service account JSON."
  );
  process.exit(1);
}

// ── Init ───────────────────────────────────────────────────────────────────
initializeApp({
  credential: cert({ projectId, clientEmail, privateKey }),
});

// ── Set Claim ──────────────────────────────────────────────────────────────
const uid = process.argv[2];

if (!uid) {
  console.error("❌ Usage: node scripts/set-admin.mjs <user-uid>");
  console.error(
    "   Find the UID in Firebase Console → Authentication → Users"
  );
  process.exit(1);
}

try {
  await getAuth().setCustomUserClaims(uid, { admin: true });

  // Verify
  const user = await getAuth().getUser(uid);
  const claims = user.customClaims;
  console.log(`✅ Admin claim set successfully!`);
  console.log(`   UID:    ${uid}`);
  console.log(`   Email:  ${user.email}`);
  console.log(`   Claims: ${JSON.stringify(claims)}`);
  console.log("");
  console.log(
    "   The user must sign out and sign back in for the claim to take effect."
  );
} catch (err) {
  console.error("❌ Failed to set admin claim:", err.message);
  process.exit(1);
}
