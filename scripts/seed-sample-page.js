/**
 * seed-sample-page.js
 * Creates a sample published custom page in Firestore collection 'pages'
 * Run: node scripts/seed-sample-page.js
 */

const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });

const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

const db = getFirestore();

async function seedPage() {
  const pagesRef = db.collection("pages");

  // Check if about-ai exists
  const existing = await pagesRef.where("slug", "==", "about-ai").get();
  if (!existing.empty) {
    console.log("  ⏭  Page with slug 'about-ai' already exists.");
    process.exit(0);
  }

  await pagesRef.add({
    title: "Artificial Intelligence & Emerging Tech Hub",
    slug: "about-ai",
    bannerImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop",
    content: `
      <h2>Empowering Deep-Tech & AI Innovators in Eastern India</h2>
      <p>AIC Techno Innovation and Incubation Council provides cutting-edge GPU compute, domain mentorship, and market acceleration for AI, Robotics, and IoT startups.</p>
      
      <h3>Key Focus Areas</h3>
      <ul>
        <li><strong>Generative AI & LLMs:</strong> Fine-tuning open models, domain-specific AI agents, and enterprise automation.</li>
        <li><strong>Computer Vision & Robotics:</strong> Industrial IoT, smart surveillance, and autonomous navigation.</li>
        <li><strong>Quantum Computing & High-Performance Compute:</strong> Advanced research in cryptography and optimization algorithms.</li>
      </ul>

      <blockquote>
        "Innovation is not just about building new algorithms; it's about solving real-world human bottlenecks with scalable technology."
      </blockquote>

      <h3>Incubation Benefits</h3>
      <p>Startups selected for the AIC Techno AI Cohort receive up to <strong>₹25 Lakhs</strong> in seed capital, access to cloud credits, office workspace, and direct mentorship from industry executives.</p>
    `,
    seoTitle: "AI & Emerging Tech Hub | AIC Techno Innovation",
    metaDescription: "Learn about AIC Techno's AI and emerging tech incubation program, GPU lab, and startup support.",
    published: true,
    order: 1,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  console.log("  ✅ Sample page 'about-ai' created successfully!");
  process.exit(0);
}

seedPage().catch((err) => {
  console.error("❌ Error seeding page:", err);
  process.exit(1);
});
