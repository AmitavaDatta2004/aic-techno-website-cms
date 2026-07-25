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

async function testFetch() {
  console.log("Testing unauthenticated client fetch from Firestore...\n");
  try {
    const boardSnap = await db.collection("boardMembers").get();
    console.log(`✅ boardMembers collection read SUCCESS: ${boardSnap.size} documents found.`);
  } catch (err) {
    console.error("❌ boardMembers collection read FAILED:", err.message);
  }

  try {
    const mentorsSnap = await db.collection("mentors").get();
    console.log(`✅ mentors collection read SUCCESS: ${mentorsSnap.size} documents found.`);
  } catch (err) {
    console.error("❌ mentors collection read FAILED:", err.message);
  }
  process.exit(0);
}

testFetch();
