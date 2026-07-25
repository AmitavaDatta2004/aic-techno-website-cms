/**
 * upload-photos-to-storage.js
 * Uploads all mentor and board member photos from local assets to Firebase Storage,
 * named after the person, and updates their photoUrl field in Firestore.
 *
 * Run: node scripts/upload-photos-to-storage.js
 */

const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");
const path = require("path");
const fs = require("fs");

require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });

const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "aic-techno-cms.firebasestorage.app";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey,
    }),
    storageBucket: bucketName,
  });
}

const db = getFirestore();
const bucket = getStorage().bucket();

const ASSETS_DIR = "d:/Projects/aic-techno-sayan/assets";

function getLocalFilePath(photoUrl) {
  if (!photoUrl) return null;
  const filename = path.basename(photoUrl);
  const localPath = path.join(ASSETS_DIR, filename);
  if (fs.existsSync(localPath)) return localPath;
  return null;
}

function sanitizeFilename(name, originalFilename) {
  const ext = path.extname(originalFilename) || ".jpeg";
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return `${cleanName}${ext}`;
}

async function uploadAndLinkCollection(collectionName) {
  console.log(`\n📸 Processing collection: '${collectionName}'...`);
  const snapshot = await db.collection(collectionName).get();

  let successCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const name = data.name;
    const currentPhoto = data.photoUrl;

    if (!currentPhoto) {
      console.log(`  ⏭  [${name}] No photo specified, skipping.`);
      skippedCount++;
      continue;
    }

    // Check if already a Firebase Storage URL
    if (currentPhoto.startsWith("http://") || currentPhoto.startsWith("https://")) {
      console.log(`  ⏭  [${name}] Already has remote URL, skipping.`);
      skippedCount++;
      continue;
    }

    const localPath = getLocalFilePath(currentPhoto);
    if (!localPath) {
      console.log(`  ⚠️  [${name}] Local file '${currentPhoto}' not found in assets directory.`);
      errorCount++;
      continue;
    }

    const targetFilename = sanitizeFilename(name, currentPhoto);
    const destination = `${collectionName}/${targetFilename}`;

    try {
      // Upload to Firebase Storage
      const [file] = await bucket.upload(localPath, {
        destination,
        metadata: {
          contentType: currentPhoto.endsWith(".png")
            ? "image/png"
            : currentPhoto.endsWith(".jpg") || currentPhoto.endsWith(".jpeg")
            ? "image/jpeg"
            : "image/jpeg",
          metadata: { firebaseStorageDownloadTokens: doc.id },
        },
        public: true,
      });

      // Public URL
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;

      // Update document in Firestore
      await doc.ref.update({ photoUrl: publicUrl });
      console.log(`  ✅ [${name}] Uploaded -> ${destination}`);
      successCount++;
    } catch (err) {
      console.error(`  ❌ [${name}] Failed:`, err.message);
      errorCount++;
    }
  }

  console.log(
    `\n✨ Finished '${collectionName}': ${successCount} uploaded & linked, ${skippedCount} skipped, ${errorCount} errors.`
  );
}

async function run() {
  console.log("🚀 Uploading photos to Firebase Storage bucket:", bucket.name);
  await uploadAndLinkCollection("boardMembers");
  await uploadAndLinkCollection("mentors");
  console.log("\n🎉 All photos successfully uploaded and linked in Firestore!\n");
  process.exit(0);
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
