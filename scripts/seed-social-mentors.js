/**
 * seed-social-mentors.js
 * One-time script to seed all 43 social mentors into Firestore extendedMentors collection.
 * Run: node scripts/seed-social-mentors.js
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

const socialMentors = [
  { name: "Sheena Bhalla", role: "Former Google Executive & Founder, Module Xero", initials: "SB", linkedIn: "https://www.linkedin.com/in/sheenabhalla", photoUrl: "" },
  { name: "Sujata Chatterjee", role: "Founder & MD, Twirl.store", initials: "SC", linkedIn: "https://www.linkedin.com/in/sujata-chatterjee-03a055162/", photoUrl: "" },
  { name: "Agni Mitra", role: "Founder & CEO, Amwoodo", initials: "AM", linkedIn: "https://www.linkedin.com/in/iamagnimitra/", photoUrl: "" },
  { name: "Jinali Mody", role: "Founder, Banofi Leather", initials: "JM", linkedIn: "https://www.linkedin.com/in/modyjinali/", photoUrl: "" },
  { name: "Siddharth Agarwal", role: "Founder, Veditum India Foundation", initials: "SA", linkedIn: "https://www.linkedin.com/in/agarwalsid/", photoUrl: "" },
  { name: "Aishik Saha", role: "Co-founder & Director, Avagam Ventures & Givo", initials: "AS", linkedIn: "https://www.linkedin.com/in/aishiks/", photoUrl: "" },
  { name: "Shashank Jasrapuria", role: "Commercial Lead, Meine Electric", initials: "SJ", linkedIn: "https://www.linkedin.com/in/shashankjasrapuria/", photoUrl: "" },
  { name: "Ajay Mittal", role: "Independent Consultant", initials: "AM", linkedIn: "https://www.linkedin.com/in/ajaymittal033/", photoUrl: "" },
  { name: "Indrajit Ghosh", role: "Global Technology Executive · CEO · Board Advisor", initials: "IG", linkedIn: "https://www.linkedin.com/in/indrajit-ghosh", photoUrl: "" },
  { name: "Subhrangshu Sanyal", role: "Former CEO, IIM Calcutta Innovation Park", initials: "SS", linkedIn: "https://www.linkedin.com/in/subhrangshu-sanyal/", photoUrl: "" },
  { name: "Sumit Lai Roy", role: "Founder, Univbrands", initials: "SR", linkedIn: "https://www.linkedin.com/in/sumit-roy-univbrands/", photoUrl: "" },
  { name: "Vamsee Sistla", role: "AI/ML Leader & Startup Mentor", initials: "VS", linkedIn: "https://www.linkedin.com/in/vamseesistla/", photoUrl: "" },
  { name: "Purabi Sarkar", role: "Business Development Lead – Netimpact | Marketing & Brand Strategy", initials: "PS", linkedIn: "https://www.linkedin.com/in/purabi-sarkar-91765b1/", photoUrl: "" },
  { name: "Monika Jhunjhunwala", role: "Strategic Financial Advisor | ICF-Trained Life, Executive & Student Coach", initials: "MJ", linkedIn: "https://www.linkedin.com/in/monika-jhunjhunwala-01762658/", photoUrl: "" },
  { name: "Dr Manisha Acharya", role: "Startup & Incubator Ecosystem Builder | Founder, WEneurs Forum", initials: "MA", linkedIn: "https://www.linkedin.com/in/drmanishaacharya/", photoUrl: "" },
  { name: "Swapnil Sinha, PhD", role: "CEO, IIT Guwahati BioNEST | Strategic Leader", initials: "SS", linkedIn: "https://www.linkedin.com/in/swapnil-sinha-phd-9a07b311/", photoUrl: "" },
  { name: "Vishal JC", role: "Chief of Staff to the Director, IIT Kharagpur", initials: "VJ", linkedIn: "https://www.linkedin.com/in/vishal-jc/", photoUrl: "" },
  { name: "Ayush Tyagi", role: "Government Consulting | Startup Advisory & Investments", initials: "AT", linkedIn: "https://www.linkedin.com/in/ayusshtyagi", photoUrl: "" },
  { name: "Koustubh Bhattacharya", role: "Management Consulting | Government Relations & Policy Advisory | Startup Mentoring", initials: "KB", linkedIn: "https://www.linkedin.com/in/koustave", photoUrl: "" },
  { name: "Rishav Agarwal", role: "Founder | Entrepreneur | Angel Investor | Startup Growth & Platform Strategy", initials: "RA", linkedIn: "https://www.linkedin.com/in/rishav-agarwal", photoUrl: "" },
  { name: "Debapratim Das", role: "Financial Services Professional | Innovation & Business Strategy", initials: "DD", linkedIn: "https://www.linkedin.com/in/debapdas", photoUrl: "" },
  { name: "Shalini Singh", role: "COO, Agri-Food Business Incubation Centre, IIT Kharagpur | GTM & Ecosystem Development", initials: "SS", linkedIn: "https://www.linkedin.com/in/shalini-singh-127a9415", photoUrl: "" },
  { name: "Mudar Patherya", role: "Founder, Trisys Communications | Investor, Writer & Civic Activist", initials: "MP", linkedIn: "https://www.linkedin.com/in/mudar-patherya-06bb24134/", photoUrl: "" },
  { name: "Pramita Mukherjee", role: "Animation & VFX Professional | Women in Animation Mentor", initials: "PM", linkedIn: "https://www.linkedin.com/in/pramita-mukherjee-46039917/", photoUrl: "" },
  { name: "Pradipto Sengupta", role: "Head of Character FX, DreamWorks Animation", initials: "PS", linkedIn: "https://www.linkedin.com/in/pradipto-sengupta-animator/", photoUrl: "" },
  { name: "Dr. Amit Das", role: "Director & CHRO, The Times of India | Global HR Leader", initials: "AD", linkedIn: "https://www.linkedin.com/in/dr-amit-das-phd-27b9a38", photoUrl: "" },
  { name: "Sankha Ray", role: "Innovation & Incubation Leader | Founder, CraftsNation", initials: "SR", linkedIn: "https://www.linkedin.com/in/sankha-ray-9b161423/", photoUrl: "" },
  { name: "Ananya Biswas", role: "Founder, VERB", initials: "AB", linkedIn: "https://www.linkedin.com/in/ananya-biswas-79b70973/", photoUrl: "" },
  { name: "Viveck Napaul", role: "Social Business | Euro-Asian Network Specialist", initials: "VN", linkedIn: "https://www.linkedin.com/in/euroasiannetwork/", photoUrl: "" },
  { name: "Shubho Sengupta", role: "Brand Communications Leader | Media & ITES", initials: "SS", linkedIn: "https://www.linkedin.com/in/shubho/", photoUrl: "" },
  { name: "Arijit Banerjee", role: "Founder, Consumer51 | Media & IT Brand", initials: "AB", linkedIn: "https://www.linkedin.com/in/aribanerjee/", photoUrl: "" },
  { name: "Mitin Chakraborty", role: "CMO, Landmark Group | Marketing & Retail", initials: "MC", linkedIn: "https://www.linkedin.com/in/mitinc/", photoUrl: "" },
  { name: "Viveck Vaswani", role: "Film Producer & Entertainment Industry Veteran", initials: "VV", linkedIn: "https://www.linkedin.com/in/prof-viveck-vaswani-92b566159/", photoUrl: "" },
  { name: "Mathew Mattam", role: "Founder, CYDA / YouthAid / TrashTech | Social Business", initials: "MM", linkedIn: "https://www.linkedin.com/in/mathew-mattam-165ab115/", photoUrl: "" },
  { name: "Vinod Janardan", role: "Founder, Team Rustic | Co-founder, Eva Live | Live Events", initials: "VJ", linkedIn: "https://www.linkedin.com/in/vinod-janardhan/", photoUrl: "" },
  { name: "Roshan Abbas", role: "Film Director, Events & Media | Entertainment", initials: "RA", linkedIn: "https://www.linkedin.com/in/roshan-abbas/", photoUrl: "" },
  { name: "Arup Roy", role: "Founder & CEO, Red Apple Technologies | Game Design, AR/VR", initials: "AR", linkedIn: "https://www.linkedin.com/in/aruproy78/", photoUrl: "" },
  { name: "Dr KM Hasan Ripon", role: "Executive Director, Daffodil Group | MD, GEN Bangladesh", initials: "HR", linkedIn: "https://www.linkedin.com/in/kmhasanripon/", photoUrl: "" },
  { name: "Sudhan Lamsal", role: "Development Sector Trainer & Coach | Social Business", initials: "SL", linkedIn: "https://www.linkedin.com/in/sudhan-lamsal-746b2b277/", photoUrl: "" },
  { name: "Prasenjit Kundu", role: "CEO, SkillSonics | IT-ITES & Social Sector", initials: "PK", linkedIn: "https://www.linkedin.com/in/prasenjitkkundu/", photoUrl: "" },
  { name: "Sumit Dasgupta", role: "Founder, Allcap Communications Pvt Ltd", initials: "SD", linkedIn: "https://www.linkedin.com/in/sumit-das-gupta-580b88162/", photoUrl: "" },
  { name: "Shantanu Jain", role: "Co-founder, ReadOn | Investor Educator, Markets by Zerodha Hindi | CA (AIR 10)", initials: "SJ", linkedIn: "https://www.linkedin.com/in/shantanujain13/", photoUrl: "" },
  { name: "Sandeep Sengupta", role: "Founder / Director, ISOAH", initials: "SS", linkedIn: "https://www.linkedin.com/in/sandeepsengupta", photoUrl: "" },
];

async function seed() {
  console.log(`\n🌱 Seeding ${socialMentors.length} social mentors into Firestore...\n`);

  // Check existing docs to avoid duplicates
  const existing = await db.collection("extendedMentors").get();
  const existingNames = new Set(existing.docs.map((d) => d.data().name));
  console.log(`📋 Found ${existingNames.size} existing mentors in Firestore.`);

  const batch = db.batch();
  let added = 0;
  let skipped = 0;

  socialMentors.forEach((mentor, index) => {
    if (existingNames.has(mentor.name)) {
      console.log(`  ⏭  Skipping (already exists): ${mentor.name}`);
      skipped++;
      return;
    }
    const ref = db.collection("extendedMentors").doc();
    batch.set(ref, {
      ...mentor,
      order: index + 1,
      active: true,
      createdAt: FieldValue.serverTimestamp(),
    });
    console.log(`  ✅ Adding: ${mentor.name}`);
    added++;
  });

  await batch.commit();
  console.log(`\n✅ Done! Added: ${added} | Skipped: ${skipped} | Total: ${socialMentors.length}\n`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
