// scripts/seed-sayan-update.mjs
// Seeds ALL new content from aic-techno-sayan into Firestore & Firebase Storage
// New: Advisory Board, Executive Board, 35+ Extended Mentors, Workspace section, Apply section, new logo

import fs from "fs";
import path from "path";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// ─── Load .env.local ─────────────────────────────────────────────────────────
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eq = trimmed.indexOf("=");
      if (eq > 0) {
        const key = trimmed.slice(0, eq).trim();
        let val = trimmed.slice(eq + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
        process.env[key] = val;
      }
    }
  }
}

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || "aic-techno-cms";
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
const storageBucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`;

if (privateKey) {
  try { privateKey = JSON.parse(privateKey); } catch { privateKey = privateKey.replace(/\\n/g, "\n"); }
}

if (!getApps().length) {
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), storageBucket: storageBucketName });
}

const db = getFirestore();
const bucket = getStorage().bucket();
const SAYAN_ASSETS = "d:/Projects/aic-techno-sayan/assets";

console.log(`🚀 Seeding Sayan updates to bucket: ${storageBucketName}\n`);

// ─── Upload Helper ────────────────────────────────────────────────────────────
async function upload(localFile, destPath) {
  const fullPath = path.resolve(SAYAN_ASSETS, localFile);
  if (!fs.existsSync(fullPath)) {
    console.warn(`  ⚠️  Not found: ${localFile} — skipping upload`);
    return null;
  }
  try {
    await bucket.upload(fullPath, {
      destination: `cms-seed/${destPath}`,
      public: true,
      metadata: { cacheControl: "public, max-age=31536000" },
    });
    const url = `https://storage.googleapis.com/${bucket.name}/cms-seed/${destPath}`;
    console.log(`  ✅ ${destPath}`);
    return url;
  } catch (err) {
    console.warn(`  ⚠️  Upload failed for ${localFile}: ${err.message}`);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  DATA
// ─────────────────────────────────────────────────────────────────────────────

// Advisory Board — NEW people only (Meghdut & Biplab already exist)
const ADVISORY_BOARD = [
  {
    id: "mentor-ravindra",
    name: "Ravindra Chamaria",
    role: "Head of Advisory Board",
    initials: "RC",
    bio: "Chairman & Managing Director, Infinity Group — seasoned entrepreneur and business leader providing strategic guidance across AIC Techno's portfolio.",
    linkedIn: "https://www.linkedin.com/in/ravindra-chamaria/",
    photoFile: "ravindra-chamaria.jpeg",
    board: "Advisory Board",
    order: 2,
  },
  {
    id: "mentor-kaustav",
    name: "Kaustav Majumdar",
    role: "Advisor",
    initials: "KM",
    bio: "IIM Kozhikode alumnus and innovation expert at IIM Calcutta Innovation Park — bridging academia and industry for startup growth.",
    linkedIn: "https://www.linkedin.com/in/kaustavmajumdar/",
    photoFile: "kaustav-majumdar.jpeg",
    board: "Advisory Board",
    order: 4,
  },
  {
    id: "mentor-ujjwal",
    name: "Prof. Ujjwal Kr. Chowdhury",
    role: "Advisor, Branding & Communications",
    initials: "UC",
    bio: "Former Pro-Vice Chancellor at Adamas University, Symbiosis, Amity, and Pearl Academy — expert in brand strategy and institutional communications.",
    linkedIn: "https://www.linkedin.com/in/ujjwal-kumar-chowdhury/",
    photoFile: "ujjwal-chowdhury.jpeg",
    board: "Advisory Board",
    order: 5,
  },
  {
    id: "mentor-jaideep",
    name: "Jaideep Sen",
    role: "Advisor",
    initials: "JS",
    bio: "Former executive at Amazon, Microsoft, Intel, and HPE. Harvard Business School graduate bringing global tech leadership experience to AIC Techno's advisory board.",
    linkedIn: "https://www.linkedin.com/in/jaideep-sen/",
    photoFile: "jaideep-sen.jpeg",
    board: "Advisory Board",
    order: 6,
  },
];

// Executive Board — NEW people
const EXECUTIVE_BOARD = [
  {
    id: "mentor-rohini",
    name: "Dr. Rohini Sharma",
    role: "Chief Operating Officer",
    initials: "RS",
    bio: "Chief Operating Officer, AIC Techno — leading day-to-day operations, incubation program delivery, and strategic partnerships.",
    linkedIn: "https://www.linkedin.com/in/rohini-sharma/",
    photoFile: "rohini-sharma.jpeg",
    board: "Executive Board",
    order: 1,
  },
  {
    id: "mentor-anamitra",
    name: "Anamitra Ghosh",
    role: "Entrepreneur in Residence",
    initials: "AG",
    bio: "Co-founder of Sconto and serial entrepreneur — guiding AIC Techno startups through product-market fit, scaling strategy, and fundraising.",
    linkedIn: "https://www.linkedin.com/in/anamitra-ghosh/",
    photoFile: "anamitra-ghosh.png",
    board: "Executive Board",
    order: 2,
  },
  {
    id: "mentor-anubhab",
    name: "Anubhab Sarkar",
    role: "Lead, Legal & Fundraising",
    initials: "AS",
    bio: "Recognised by Chambers & Partners — expert in deal structuring, startup legal frameworks, IP protection, and early-stage fundraising.",
    linkedIn: "https://www.linkedin.com/in/anubhab-sarkar/",
    photoFile: "anubhab-sarkar.png",
    board: "Executive Board",
    order: 9,
  },
];

// Extended Mentors — all 35+ new people
const EXTENDED_MENTORS = [
  { id: "em-sheena", name: "Sheena Bhalla", role: "Former Google Executive & Founder, Module Xero", initials: "SB", photoFile: "sheena-bhalla.png", linkedIn: "https://www.linkedin.com/in/sheena-bhalla/", order: 6 },
  { id: "em-shashank", name: "Shashank Jasrapuria", role: "Commercial Lead, Meine Electric", initials: "SJ", photoFile: "shashank-jasrapuria.jpeg", linkedIn: "https://www.linkedin.com/in/shashank-jasrapuria/", order: 7 },
  { id: "em-ajay", name: "Ajay Mittal", role: "Independent Consultant", initials: "AM", photoFile: "ajay-mittal.jpeg", linkedIn: "https://www.linkedin.com/in/ajay-mittal/", order: 8 },
  { id: "em-indrajit", name: "Indrajit Ghosh", role: "Global Technology Executive / CEO / Board Advisor", initials: "IG", photoFile: "indrajit-ghosh.jpeg", linkedIn: "https://www.linkedin.com/in/indrajit-ghosh/", order: 9 },
  { id: "em-subhrangshu", name: "Subhrangshu Sanyal", role: "Former CEO, IIM Calcutta Innovation Park", initials: "SS", photoFile: "subhrangshu-sanyal.jpeg", linkedIn: "https://www.linkedin.com/in/subhrangshu-sanyal/", order: 10 },
  { id: "em-sumit-lai", name: "Sumit Lai Roy", role: "Founder, Univbrands", initials: "SL", photoFile: "sumit-lai-roy.jpeg", linkedIn: "https://www.linkedin.com/in/sumit-lai-roy/", order: 11 },
  { id: "em-vamsee", name: "Vamsee Sistla", role: "AI/ML Leader & Startup Mentor", initials: "VS", photoFile: null, linkedIn: "https://www.linkedin.com/in/vamsee-sistla/", order: 12 },
  { id: "em-purabi", name: "Purabi Sarkar", role: "BD Lead, Netimpact", initials: "PS", photoFile: "purabi-sarkar.jpeg", linkedIn: "https://www.linkedin.com/in/purabi-sarkar/", order: 13 },
  { id: "em-monika", name: "Monika Jhunjhunwala", role: "Strategic Financial Advisor & Coach", initials: "MJ", photoFile: null, linkedIn: "https://www.linkedin.com/in/monika-jhunjhunwala/", order: 14 },
  { id: "em-manisha", name: "Dr. Manisha Acharya", role: "Startup & Incubator Ecosystem Builder, Founder WEneurs Forum", initials: "MA", photoFile: "manisha-acharya.jpeg", linkedIn: "https://www.linkedin.com/in/manisha-acharya/", order: 15 },
  { id: "em-swapnil", name: "Swapnil Sinha", role: "CEO, IIT Guwahati BioNEST", initials: "SS", photoFile: "swapnil-sinha.jpeg", linkedIn: "https://www.linkedin.com/in/swapnil-sinha/", order: 16 },
  { id: "em-vishal", name: "Vishal JC", role: "Chief of Staff to Director, IIT Kharagpur", initials: "VJ", photoFile: "vishal-jc.jpeg", linkedIn: "https://www.linkedin.com/in/vishal-jc/", order: 17 },
  { id: "em-ayush", name: "Ayush Tyagi", role: "Government Consulting / Startup Advisory", initials: "AT", photoFile: "ayush-tyagi.jpeg", linkedIn: "https://www.linkedin.com/in/ayush-tyagi/", order: 18 },
  { id: "em-koustubh", name: "Koustubh Bhattacharya", role: "Management Consulting / Govt Relations", initials: "KB", photoFile: "koustubh-bhattacharya.jpeg", linkedIn: "https://www.linkedin.com/in/koustubh-bhattacharya/", order: 19 },
  { id: "em-rishav", name: "Rishav Agarwal", role: "Founder & Angel Investor", initials: "RA", photoFile: "rishav-agarwal.jpeg", linkedIn: "https://www.linkedin.com/in/rishav-agarwal/", order: 20 },
  { id: "em-debapratim", name: "Debapratim Das", role: "Financial Services / Innovation Strategy", initials: "DD", photoFile: "debapratim-das.jpeg", linkedIn: "https://www.linkedin.com/in/debapratim-das/", order: 21 },
  { id: "em-shalini", name: "Shalini Singh", role: "COO, Agri-Food BIC, IIT Kharagpur", initials: "SS", photoFile: "shalini-singh.jpeg", linkedIn: "https://www.linkedin.com/in/shalini-singh/", order: 22 },
  { id: "em-mudar", name: "Mudar Patherya", role: "Founder, Trisys Communications", initials: "MP", photoFile: "mudar-patherya.jpeg", linkedIn: "https://www.linkedin.com/in/mudar-patherya/", order: 23 },
  { id: "em-pramita", name: "Pramita Mukherjee", role: "Animation & VFX Professional", initials: "PM", photoFile: "pramita-mukherjee.jpeg", linkedIn: "https://www.linkedin.com/in/pramita-mukherjee/", order: 24 },
  { id: "em-pradipto", name: "Pradipto Sengupta", role: "Head of Character FX, DreamWorks Animation", initials: "PS", photoFile: "pradipto-sengupta.jpeg", linkedIn: "https://www.linkedin.com/in/pradipto-sengupta/", order: 25 },
  { id: "em-amit-das", name: "Dr. Amit Das", role: "Director & CHRO, Times of India", initials: "AD", photoFile: "amit-das.jpeg", linkedIn: "https://www.linkedin.com/in/amit-das/", order: 26 },
  { id: "em-sankha", name: "Sankha Ray", role: "Innovation & Incubation Leader, Founder CraftsNation", initials: "SR", photoFile: "sankha-ray.jpeg", linkedIn: "https://www.linkedin.com/in/sankha-ray/", order: 27 },
  { id: "em-ananya", name: "Ananya Biswas", role: "Founder, VERB", initials: "AB", photoFile: "ananya-biswas.jpeg", linkedIn: "https://www.linkedin.com/in/ananya-biswas/", order: 28 },
  { id: "em-viveck-napaul", name: "Viveck Napaul", role: "Social Business / Euro-Asian Network", initials: "VN", photoFile: "viveck-napaul.jpeg", linkedIn: "https://www.linkedin.com/in/viveck-napaul/", order: 29 },
  { id: "em-shubho", name: "Shubho Sengupta", role: "Brand Communications Leader", initials: "SS", photoFile: "shubho-sengupta.jpeg", linkedIn: "https://www.linkedin.com/in/shubho-sengupta/", order: 30 },
  { id: "em-arijit", name: "Arijit Banerjee", role: "Founder, Consumer51", initials: "AB", photoFile: "arijit-banerjee.jpeg", linkedIn: "https://www.linkedin.com/in/arijit-banerjee/", order: 31 },
  { id: "em-mitin", name: "Mitin Chakraborty", role: "CMO, Landmark Group", initials: "MC", photoFile: "mitin-chakraborty.jpeg", linkedIn: "https://www.linkedin.com/in/mitin-chakraborty/", order: 32 },
  { id: "em-viveck-vaswani", name: "Viveck Vaswani", role: "Film Producer & Entertainment Veteran", initials: "VV", photoFile: "viveck-vaswani.jpeg", linkedIn: "https://www.linkedin.com/in/viveck-vaswani/", order: 33 },
  { id: "em-mathew", name: "Mathew Mattam", role: "Founder, CYDA / YouthAid / TrashTech", initials: "MM", photoFile: "mathew-mattam.jpeg", linkedIn: "https://www.linkedin.com/in/mathew-mattam/", order: 34 },
  { id: "em-vinod", name: "Vinod Janardan", role: "Founder, Team Rustic / Eva Live", initials: "VJ", photoFile: "vinod-janardan.jpeg", linkedIn: "https://www.linkedin.com/in/vinod-janardan/", order: 35 },
  { id: "em-roshan", name: "Roshan Abbas", role: "Film Director, Events & Media", initials: "RA", photoFile: "roshan-abbas.jpeg", linkedIn: "https://www.linkedin.com/in/roshan-abbas/", order: 36 },
  { id: "em-arup", name: "Arup Roy", role: "Founder & CEO, Red Apple Technologies", initials: "AR", photoFile: "arup-roy.jpeg", linkedIn: "https://www.linkedin.com/in/arup-roy/", order: 37 },
  { id: "em-km-hasan", name: "Dr KM Hasan Ripon", role: "Executive Director, Daffodil Group / MD, GEN Bangladesh", initials: "KH", photoFile: "km-hasan-ripon.jpeg", linkedIn: "https://www.linkedin.com/in/km-hasan-ripon/", order: 38 },
  { id: "em-sudhan", name: "Sudhan Lamsal", role: "Development Sector Trainer & Coach", initials: "SL", photoFile: "sudhan-lamsal.jpeg", linkedIn: "https://www.linkedin.com/in/sudhan-lamsal/", order: 39 },
  { id: "em-prasenjit", name: "Prasenjit Kundu", role: "CEO, SkillSonics", initials: "PK", photoFile: "prasenjit-kundu.jpeg", linkedIn: "https://www.linkedin.com/in/prasenjit-kundu/", order: 40 },
  { id: "em-sumit-das", name: "Sumit Dasgupta", role: "Founder, Allcap Communications", initials: "SD", photoFile: "sumit-dasgupta.jpeg", linkedIn: "https://www.linkedin.com/in/sumit-dasgupta/", order: 41 },
  { id: "em-shantanu", name: "Shantanu Jain", role: "Co-founder ReadOn, Investor Educator & CA", initials: "SJ", photoFile: "shantanu-jain.jpeg", linkedIn: "https://www.linkedin.com/in/shantanu-jain/", order: 42 },
  { id: "em-sandeep", name: "Sandeep Sengupta", role: "Founder & Director, ISOAH", initials: "SS", photoFile: "sandeep.png", linkedIn: "https://www.linkedin.com/in/sandeep-sengupta/", order: 43 },
];

// Workspace section content
const WORKSPACE_DATA = {
  title: "Workspace at AIC Techno",
  subtitle: "Flexible workspaces for founders, remote teams, and innovators in the heart of Kolkata",
  email: "contact@aic-techno.com",
  bookingUrl: "workspace-booking.html",
  bookingStatus: "Online booking coming soon",
  plans: [
    { name: "Day Pass", description: "Drop-in access for a single day", icon: "☀️" },
    { name: "Flexi Seat", description: "Hot-desking on a weekly/monthly basis", icon: "🔄" },
    { name: "Dedicated Seat", description: "Your own reserved desk, full-time access", icon: "💺" },
    { name: "Virtual Office", description: "Business address + mail handling + meeting credits", icon: "🌐" },
    { name: "Meeting Rooms", description: "Bookable meeting & boardroom spaces by the hour", icon: "🤝" },
    { name: "Lab Membership", description: "Access to AI & Product Lab, Fab Lab, and Media Studio", icon: "🔬" },
  ],
  updatedAt: new Date().toISOString(),
};

// Apply section content (3-stage application)
const APPLY_DATA = {
  title: "Apply to AIC Techno",
  subtitle: "Choose your stage and take the next step in your startup journey",
  stages: [
    {
      stage: 1,
      title: "Pre-Incubation",
      description: "For early-stage ideas and founders validating their concept. Get access to mentorship, workshops, and co-working space.",
      applyUrl: "https://forms.gle/pVnKUPgfkyxPjhpTA",
      icon: "🌱",
    },
    {
      stage: 2,
      title: "Incubation",
      description: "For startups with an MVP ready to scale. Access seed funding, investor connects, and dedicated incubation support.",
      applyUrl: "https://forms.gle/GERw6k6WYNAMcdZ87",
      icon: "🚀",
    },
    {
      stage: 3,
      title: "Scale-Up",
      description: "For growth-stage startups ready to expand markets, raise Series A, and build their team.",
      applyUrl: "https://forms.gle/GxNbFg71CtuiNA9p7",
      icon: "📈",
    },
  ],
  updatedAt: new Date().toISOString(),
};

// ─────────────────────────────────────────────────────────────────────────────
//  SEED RUNNER
// ─────────────────────────────────────────────────────────────────────────────

async function run() {
  let successCount = 0;
  let skipCount = 0;

  // ── 1. Advisory Board mentors ─────────────────────────────────────────────
  console.log("📌 Seeding Advisory Board...");
  for (const m of ADVISORY_BOARD) {
    let photoUrl = "";
    if (m.photoFile) {
      photoUrl = await upload(m.photoFile, `mentors/${m.photoFile}`) || "";
    }
    await db.collection("mentors").doc(m.id).set({
      name: m.name,
      role: m.role,
      initials: m.initials,
      bio: m.bio,
      linkedIn: m.linkedIn,
      photoUrl,
      board: m.board,
      order: m.order,
      active: true,
      updatedAt: new Date().toISOString(),
    });
    console.log(`  ✓ ${m.name} (${m.board})`);
    successCount++;
  }

  // ── 2. Executive Board NEW members ────────────────────────────────────────
  console.log("\n📌 Seeding Executive Board...");
  for (const m of EXECUTIVE_BOARD) {
    let photoUrl = "";
    if (m.photoFile) {
      photoUrl = await upload(m.photoFile, `mentors/${m.photoFile}`) || "";
    }
    await db.collection("mentors").doc(m.id).set({
      name: m.name,
      role: m.role,
      initials: m.initials,
      bio: m.bio,
      linkedIn: m.linkedIn,
      photoUrl,
      board: m.board,
      order: m.order,
      active: true,
      updatedAt: new Date().toISOString(),
    });
    console.log(`  ✓ ${m.name} (${m.board})`);
    successCount++;
  }

  // Update existing mentors with board label
  console.log("\n📌 Updating existing mentors with board labels...");
  const existingBoardMap = {
    "mentor-meghdut": { board: "Advisory Board", order: 1 },
    "mentor-biplab":  { board: "Advisory Board", order: 3 },
    "mentor-pauline": { board: "Executive Board", order: 3 },
    "mentor-skannd":  { board: "Executive Board", order: 4 },
    "mentor-dibya":   { board: "Executive Board", order: 5 },
    "mentor-dickie":  { board: "Executive Board", order: 6 },
    "mentor-puja":    { board: "Executive Board", order: 7 },
  };
  for (const [id, data] of Object.entries(existingBoardMap)) {
    await db.collection("mentors").doc(id).set(data, { merge: true });
    console.log(`  ✓ Updated ${id} → ${data.board}`);
  }

  // ── 3. Extended Mentors ───────────────────────────────────────────────────
  console.log("\n📌 Seeding Extended Mentors (35+ new people)...");
  for (const m of EXTENDED_MENTORS) {
    let photoUrl = "";
    if (m.photoFile) {
      photoUrl = await upload(m.photoFile, `extended-mentors/${m.photoFile}`) || "";
    }
    await db.collection("extendedMentors").doc(m.id).set({
      name: m.name,
      role: m.role,
      initials: m.initials,
      linkedIn: m.linkedIn,
      photoUrl,
      order: m.order,
      active: true,
      updatedAt: new Date().toISOString(),
    });
    console.log(`  ✓ ${m.name}`);
    successCount++;
  }

  // ── 4. Workspace section ──────────────────────────────────────────────────
  console.log("\n📌 Seeding Workspace section...");
  await db.collection("siteContent").doc("workspace").set(WORKSPACE_DATA);
  console.log("  ✓ Workspace section saved");

  // ── 5. Apply section (3-stage) ────────────────────────────────────────────
  console.log("\n📌 Seeding Apply/Incubation section...");
  await db.collection("siteContent").doc("apply").set(APPLY_DATA);
  console.log("  ✓ Apply section saved (3 stages with Google Form links)");

  // ── 6. Upload new logo assets ─────────────────────────────────────────────
  console.log("\n📌 Uploading new logo assets...");
  await upload("aic-main-logo.png",          "logos/aic-main-logo.png");
  await upload("aim_niti_techno_800x200.png", "logos/aim_niti_techno_800x200.png");

  // Update siteContent/settings with new logo URL
  const newLogoUrl = `https://storage.googleapis.com/${bucket.name}/cms-seed/logos/aic-main-logo.png`;
  await db.collection("siteContent").doc("settings").set(
    { logoUrl: newLogoUrl, updatedAt: new Date().toISOString() },
    { merge: true }
  );
  console.log("  ✓ siteContent/settings logoUrl updated");

  console.log(`
🎉 ALL DONE!
   ✅ ${successCount} mentor records created/updated
   ✅ Workspace section → Firestore siteContent/workspace
   ✅ Apply section (3 stages) → Firestore siteContent/apply
   ✅ New logos uploaded to Firebase Storage
   ✅ Extended mentors → Firestore extendedMentors collection
  `);
  process.exit(0);
}

run().catch((e) => { console.error("❌ Error:", e); process.exit(1); });
