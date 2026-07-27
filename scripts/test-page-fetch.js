const firebase = require("firebase/compat/app");
require("firebase/compat/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyClv5MIo8RjatXoZwRbSjkehOb27wMqixo",
  authDomain: "aic-techno-cms.firebaseapp.com",
  projectId: "aic-techno-cms",
  storageBucket: "aic-techno-cms.firebasestorage.app",
  messagingSenderId: "159332667631",
  appId: "1:159332667631:web:bf52340d7b0ce106af8b1a",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

async function testFetchPage() {
  console.log("Testing unauthenticated fetch for page slug 'about-ai'...\n");
  try {
    const snap = await db
      .collection("pages")
      .where("slug", "==", "about-ai")
      .where("published", "==", true)
      .get();

    if (snap.empty) {
      console.log("❌ No page found!");
    } else {
      const page = snap.docs[0].data();
      console.log("✅ SUCCESS! Page fetched:", {
        title: page.title,
        slug: page.slug,
        seoTitle: page.seoTitle,
        published: page.published,
      });
    }
  } catch (err) {
    console.error("❌ Read failed:", err.message);
  }
  process.exit(0);
}

testFetchPage();
