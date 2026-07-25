/**
 * seed-board-members.js
 * Script to seed all 17 Advisory & Executive Board members into Firestore boardMembers collection.
 * Run: node scripts/seed-board-members.js
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

const boardMembers = [
  // ─── Advisory Board ────────────────────────────────────────────────────────
  {
    name: "Meghdut RoyChowdhury",
    role: "Chief Mentor",
    board: "Advisory Board",
    bio: "Executive Director & Chief Innovation Officer, Techno India Group — serial entrepreneur and innovation leader mentoring founders on AI, product and scale.",
    initials: "MR",
    photoUrl: "assets/meghdut-roychowdhury.jpeg",
    linkedIn: "https://www.linkedin.com/in/meghdutroychowdhury/",
  },
  {
    name: "Ravindra Chamaria",
    role: "Head of Advisory Board",
    board: "Advisory Board",
    bio: "Chairman & Managing Director of Infinity Group — a first-generation entrepreneur, philanthropist and pioneer in sustainable real estate development in Eastern India.",
    initials: "RC",
    photoUrl: "assets/ravindra-chamaria.jpeg",
    linkedIn: "",
  },
  {
    name: "Dr. Biplab Pal",
    role: "Senior Advisor",
    board: "Advisory Board",
    bio: "IIT Kharagpur-trained Ph.D., UMBC adjunct faculty and deep-tech founder with 25+ U.S. patents — an AI researcher and mentor helping innovators move from idea to product, capital and global market.",
    initials: "BP",
    photoUrl: "assets/biplab-pal.jpeg",
    linkedIn: "https://www.linkedin.com/in/biplab-pal-phd-4ab94b3/",
  },
  {
    name: "Kaustav Majumdar",
    role: "Advisor",
    board: "Advisory Board",
    bio: "An incubation and startup-ecosystem professional — an IIM Kozhikode alumnus associated with IIM Calcutta Innovation Park's North East Accelerator, supporting early-stage founders on mentorship, acceleration and market access.",
    initials: "KM",
    photoUrl: "assets/kaustav-majumdar.jpeg",
    linkedIn: "https://www.linkedin.com/in/kaustavmajumdar/",
  },
  {
    name: "Prof. Ujjwal Kr. Chowdhury",
    role: "Advisor – Branding & Communications",
    board: "Advisory Board",
    bio: "Media educator and communications strategist — former Pro Vice Chancellor and Dean of media & communication schools across Adamas, Symbiosis, Amity and Pearl Academy — advising founders on branding, storytelling and public communications.",
    initials: "UC",
    photoUrl: "assets/ujjwal-chowdhury.jpeg",
    linkedIn: "https://in.linkedin.com/in/ujjwalkchowdhury",
  },
  {
    name: "Jaideep Sen",
    role: "Advisor",
    board: "Advisory Board",
    bio: "A global business and technology leader — President & Global Chief Business Officer with senior leadership experience across Amazon, Microsoft, Intel and HPE. A Harvard Business School PLD alumnus, he advises founders on strategy, scale and go-to-market.",
    initials: "JS",
    photoUrl: "assets/jaideep-sen.jpeg",
    linkedIn: "https://www.linkedin.com/in/jaideep-sen-21294587/",
  },
  {
    name: "Avishek Paul Chowdhury",
    role: "Advisor – Hospitality",
    board: "Advisory Board",
    bio: "Hospitality entrepreneur with Hotel Sonar Bangla — building a value-based hotel chain for the middle market across Eastern India, advising founders on operations, guest experience and scaling service-led ventures.",
    initials: "AC",
    photoUrl: "assets/avishek-paul-chowdhury.jpeg",
    linkedIn: "https://www.linkedin.com/in/avishek-paul-chowdhury-9239911b2/",
  },
  {
    name: "Ayanabh Debgupta",
    role: "Advisor – HealthTech",
    board: "Advisory Board",
    bio: "Regional Chief Operating Officer (East) at Manipal Hospitals and co-founder of Medica Superspecialty Hospital — Co-Chairman of the CII ER Healthcare Taskforce and a healthcare angel investor, mentoring founders across health systems, operations and med-tech.",
    initials: "AD",
    photoUrl: "assets/ayanabh-debgupta.jpeg",
    linkedIn: "https://www.linkedin.com/in/ayanabh-debgupta-5aa5091a/",
  },
  {
    name: "Abhijit (Jit) Banerjee",
    role: "Advisor – Technology Commercialization",
    board: "Advisory Board",
    bio: "PhD leading technology commercialization at the University of Connecticut — spanning patenting, licensing, venture development and the university's Technology Incubation Program. A business-development and alliance-management professional advising founders on moving research from lab to market.",
    initials: "AB",
    photoUrl: "assets/abhijit-banerjee.jpeg",
    linkedIn: "https://www.linkedin.com/in/abhijit-jit-banerjee-ab4b77a/",
  },

  // ─── Executive Board ───────────────────────────────────────────────────────
  {
    name: "Dr. Rohini Sharma",
    role: "Chief Operating Officer",
    board: "Executive Board",
    bio: "Chief Operating Officer of AIC Techno Innovation and Incubation Council — an incubation and innovation professional who drives day-to-day operations, programme delivery and end-to-end startup support across the centre.",
    initials: "RS",
    photoUrl: "assets/rohini-sharma.jpeg",
    linkedIn: "https://www.linkedin.com/in/dr-rohini-sharma-7b07843b/",
  },
  {
    name: "Anamitra Ghosh",
    role: "Entrepreneur in Residence",
    board: "Executive Board",
    bio: "Co-founder, Sconto — building financial and behavioural infrastructure for India's 53M+ college students. An operator at the intersection of distribution, product, and emerging markets.",
    initials: "AG",
    photoUrl: "assets/anamitra-ghosh.png",
    linkedIn: "https://www.linkedin.com/in/anamitra-ghosh",
  },
  {
    name: "Pauline Laravoire",
    role: "Vertical Head, Social Innovation",
    board: "Executive Board",
    bio: "Sustainability Director of Techno India Group and founder of the rebalance institute — driving education for sustainability, social entrepreneurship and systemic change.",
    initials: "PL",
    photoUrl: "assets/pauline-laravoire.jpeg",
    linkedIn: "https://www.linkedin.com/in/paulinelaravoire/",
  },
  {
    name: "Skannd Tyagi",
    role: "Vertical Head, Emerging Technology",
    board: "Executive Board",
    bio: "Technologist and serial entrepreneur — a \"specialist generalist\" and startup mentor helping founders turn ideas into scalable technology ventures.",
    initials: "ST",
    photoUrl: "assets/skannd-tyagi.jpeg",
    linkedIn: "https://www.linkedin.com/in/skanndtyagi/",
  },
  {
    name: "Dibya Chatterjee",
    role: "Vertical Head, Media & Entertainment",
    board: "Executive Board",
    bio: "Writer-director-producer and founder of Handykraft Pictures — writer and co-creator of the acclaimed dark comedy Afsos (Amazon Prime Video), crafting original, genre-blending stories across film and screen.",
    initials: "DC",
    photoUrl: "assets/dibya-chatterjee.jpeg",
    linkedIn: "https://www.linkedin.com/in/dibya-chatterjee-967a3357/",
  },
  {
    name: "Dickie Currer-Ganguli",
    role: "Lead, Global Partnerships",
    board: "Executive Board",
    bio: "Co-Founder of APAC Innovation Hub and Hype Man Media — Mentor, Investor and Board Advisor with a global keynote presence. Specialist in building and connecting startup ecosystems across international markets.",
    initials: "DC",
    photoUrl: "assets/dickie-currer-ganguli.jpeg",
    linkedIn: "https://www.linkedin.com/in/dickiecurrer",
  },
  {
    name: "Puja Currer-Ganguli",
    role: "Lead, Innovation Programs",
    board: "Executive Board",
    bio: "Co-Founder of APAC Innovation Hub and Hype Man Media — sustainability and innovation strategist working across global markets. Specialist in designing and delivering high-impact innovation programs.",
    initials: "PC",
    photoUrl: "assets/puja-currer-ganguli.jpeg",
    linkedIn: "https://www.linkedin.com/in/puja-currer-ganguli",
  },
  {
    name: "Anubhab Sarkar",
    role: "Lead - Legal, Fundraising and Deal structuring",
    board: "Executive Board",
    bio: "He regularly advises startups, founders, venture capital and private equity funds, and emerging businesses on fundraises, M&A, governance, regulatory strategy, and disputes. He is recognised by Chambers and Partners, Legal 500, and IFLR1000 as a leading practitioner in corporate and dispute resolution.",
    initials: "AS",
    photoUrl: "assets/anubhab-sarkar.png",
    linkedIn: "https://www.linkedin.com/in/sarkaranubhab/",
  },
];

async function seed() {
  console.log(`\n🌱 Seeding ${boardMembers.length} board members into Firestore collection 'boardMembers'...\n`);

  const batch = db.batch();

  boardMembers.forEach((member, index) => {
    const ref = db.collection("boardMembers").doc();
    batch.set(ref, {
      ...member,
      order: index + 1,
      active: true,
      createdAt: FieldValue.serverTimestamp(),
    });
    console.log(`  ✅ Adding: [${member.board}] ${member.name}`);
  });

  await batch.commit();
  console.log(`\n✅ Done! Successfully seeded ${boardMembers.length} board members into 'boardMembers'.\n`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
