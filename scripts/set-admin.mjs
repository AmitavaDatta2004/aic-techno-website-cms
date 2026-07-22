// scripts/set-admin.mjs
//
// CLI Script to grant or revoke admin custom claim to a Firebase user.
// Automatically loads credentials from .env.local if present.
//
// Usage:
//   node scripts/set-admin.mjs <user-uid-or-email> [revoke]
//
// Examples:
//   node scripts/set-admin.mjs admin@aic-techno.com
//   node scripts/set-admin.mjs abc123xyz
//   node scripts/set-admin.mjs user@example.com revoke
//

import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (existsSync(envPath)) {
    const envFile = readFileSync(envPath, "utf8");
    envFile.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.substring(0, eqIdx).trim();
        const val = trimmed.substring(eqIdx + 1).trim();
        process.env[key] = val;
      }
    });
  }
}

function parsePrivateKey(keyStr) {
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

loadEnv();

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

if (privateKey) {
  privateKey = parsePrivateKey(privateKey);
}

if (!projectId || !clientEmail || !privateKey) {
  console.error(
    "❌ Missing Firebase Admin credentials in environment or .env.local\n" +
      "   Required env vars:\n" +
      "     - FIREBASE_ADMIN_PROJECT_ID (or NEXT_PUBLIC_FIREBASE_PROJECT_ID)\n" +
      "     - FIREBASE_ADMIN_CLIENT_EMAIL\n" +
      "     - FIREBASE_ADMIN_PRIVATE_KEY\n"
  );
  process.exit(1);
}

// ── Init Admin SDK ───────────────────────────────────────────────────────────
initializeApp({
  credential: cert({ projectId, clientEmail, privateKey }),
});

const argInput = process.argv[2];
const isRevoke = process.argv[3] === "revoke";

if (!argInput) {
  console.log("======================================================");
  console.log("✅ Firebase Admin credentials validated successfully!");
  console.log("======================================================");
  console.log("Usage: node scripts/set-admin.mjs <user-uid-or-email> [revoke]\n");
  process.exit(0);
}

try {
  let user;
  if (argInput.includes("@")) {
    user = await getAuth().getUserByEmail(argInput);
  } else {
    user = await getAuth().getUser(argInput);
  }

  const newAdminStatus = !isRevoke;
  const existingClaims = user.customClaims || {};
  const updatedClaims = {
    ...existingClaims,
    admin: newAdminStatus,
  };

  await getAuth().setCustomUserClaims(user.uid, updatedClaims);

  const updatedUser = await getAuth().getUser(user.uid);

  console.log(`\n======================================================`);
  console.log(`✅ Admin claim successfully ${newAdminStatus ? "GRANTED to" : "REVOKED from"}:`);
  console.log(`   Email:  ${updatedUser.email}`);
  console.log(`   UID:    ${updatedUser.uid}`);
  console.log(`   Claims: ${JSON.stringify(updatedUser.customClaims)}`);
  console.log(`======================================================\n`);
  console.log("ℹ️  Note: If the user is currently signed in, they must sign out and sign back in for the new token claim to take effect.");
} catch (err) {
  console.error("❌ Error setting custom claim:", err.message);
  process.exit(1);
}
