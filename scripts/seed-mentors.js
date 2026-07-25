/**
 * seed-mentors.js
 * Script to seed all 43 social/extended mentors into Firestore collection 'mentors'.
 * Run: node scripts/seed-mentors.js
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

const mentors = [
  { name: "Sheena Bhalla", role: "Former Google Executive & Founder, Module Xero", initials: "SB", linkedIn: "https://www.linkedin.com/in/sheenabhalla", photoUrl: "assets/sheena-bhalla.png" },
  { name: "Sujata Chatterjee", role: "Founder & MD, Twirl.store", initials: "SC", linkedIn: "https://www.linkedin.com/in/sujata-chatterjee-03a055162/", photoUrl: "assets/pfp1.jpeg" },
  { name: "Agni Mitra", role: "Founder & CEO, Amwoodo", initials: "AM", linkedIn: "https://www.linkedin.com/in/iamagnimitra/", photoUrl: "assets/pfp2.jpeg" },
  { name: "Jinali Mody", role: "Founder, Banofi Leather", initials: "JM", linkedIn: "https://www.linkedin.com/in/modyjinali/", photoUrl: "assets/pfp3.jpeg" },
  { name: "Siddharth Agarwal", role: "Founder, Veditum India Foundation", initials: "SA", linkedIn: "https://www.linkedin.com/in/agarwalsid/", photoUrl: "assets/pfp4.jpeg" },
  { name: "Aishik Saha", role: "Co-founder & Director, Avagam Ventures & Givo", initials: "AS", linkedIn: "https://www.linkedin.com/in/aishiks/", photoUrl: "assets/pfp5.jpeg" },
  { name: "Shashank Jasrapuria", role: "Commercial Lead, Meine Electric", initials: "SJ", linkedIn: "https://www.linkedin.com/in/shashankjasrapuria/", photoUrl: "assets/shashank-jasrapuria.jpeg" },
  { name: "Ajay Mittal", role: "Independent Consultant", initials: "AM", linkedIn: "https://www.linkedin.com/in/ajaymittal033/", photoUrl: "assets/ajay-mittal.jpeg" },
  { name: "Indrajit Ghosh", role: "Global Technology Executive · CEO · Board Advisor", initials: "IG", linkedIn: "https://www.linkedin.com/in/indrajit-ghosh", photoUrl: "assets/indrajit-ghosh.jpeg" },
  { name: "Subhrangshu Sanyal", role: "Former CEO, IIM Calcutta Innovation Park", initials: "SS", linkedIn: "https://www.linkedin.com/in/subhrangshu-sanyal/", photoUrl: "assets/subhrangshu-sanyal.jpeg" },
  { name: "Sumit Lai Roy", role: "Founder, Univbrands", initials: "SR", linkedIn: "https://www.linkedin.com/in/sumit-roy-univbrands/", photoUrl: "assets/sumit-lai-roy.jpeg" },
  { name: "Vamsee Sistla", role: "AI/ML Leader & Startup Mentor", initials: "VS", linkedIn: "https://www.linkedin.com/in/vamseesistla/", photoUrl: "assets/vamsee-sistla.jpeg" },
  { name: "Purabi Sarkar", role: "Business Development Lead – Netimpact | Marketing & Brand Strategy", initials: "PS", linkedIn: "https://www.linkedin.com/in/purabi-sarkar-91765b1/", photoUrl: "assets/purabi-sarkar.jpeg" },
  { name: "Monika Jhunjhunwala", role: "Strategic Financial Advisor | ICF-Trained Life, Executive & Student Coach", initials: "MJ", linkedIn: "https://www.linkedin.com/in/monika-jhunjhunwala-01762658/", photoUrl: "assets/monika-jhunjhunwala.jpeg" },
  { name: "Dr Manisha Acharya", role: "Startup & Incubator Ecosystem Builder | Founder, WEneurs Forum", initials: "MA", linkedIn: "https://www.linkedin.com/in/drmanishaacharya/", photoUrl: "assets/manisha-acharya.jpeg" },
  { name: "Swapnil Sinha, PhD", role: "CEO, IIT Guwahati BioNEST | Strategic Leader", initials: "SS", linkedIn: "https://www.linkedin.com/in/swapnil-sinha-phd-9a07b311/", photoUrl: "assets/swapnil-sinha.jpeg" },
  { name: "Vishal JC", role: "Chief of Staff to the Director, IIT Kharagpur", initials: "VJ", linkedIn: "https://www.linkedin.com/in/vishal-jc/", photoUrl: "assets/vishal-jc.jpeg" },
  { name: "Ayush Tyagi", role: "Government Consulting | Startup Advisory & Investments", initials: "AT", linkedIn: "https://www.linkedin.com/in/ayusshtyagi", photoUrl: "assets/ayush-tyagi.jpeg" },
  { name: "Koustubh Bhattacharya", role: "Management Consulting | Government Relations & Policy Advisory | Startup Mentoring", initials: "KB", linkedIn: "https://www.linkedin.com/in/koustave", photoUrl: "assets/koustubh-bhattacharya.jpeg" },
  { name: "Rishav Agarwal", role: "Founder | Entrepreneur | Angel Investor | Startup Growth & Platform Strategy", initials: "RA", linkedIn: "https://www.linkedin.com/in/rishav-agarwal", photoUrl: "assets/rishav-agarwal.jpeg" },
  { name: "Debapratim Das", role: "Financial Services Professional | Innovation & Business Strategy", initials: "DD", linkedIn: "https://www.linkedin.com/in/debapdas", photoUrl: "assets/debapratim-das.jpeg" },
  { name: "Shalini Singh", role: "COO, Agri-Food Business Incubation Centre, IIT Kharagpur | GTM & Ecosystem Development", initials: "SS", linkedIn: "https://www.linkedin.com/in/shalini-singh-127a9415", photoUrl: "assets/shalini-singh.jpeg" },
  { name: "Mudar Patherya", role: "Founder, Trisys Communications | Investor, Writer & Civic Activist", initials: "MP", linkedIn: "https://www.linkedin.com/in/mudar-patherya-06bb24134/", photoUrl: "assets/mudar-patherya.jpeg" },
  { name: "Pramita Mukherjee", role: "Animation & VFX Professional | Women in Animation Mentor", initials: "PM", linkedIn: "https://www.linkedin.com/in/pramita-mukherjee-46039917/", photoUrl: "assets/pramita-mukherjee.jpeg" },
  { name: "Pradipto Sengupta", role: "Head of Character FX, DreamWorks Animation", initials: "PS", linkedIn: "https://www.linkedin.com/in/pradipto-sengupta-animator/", photoUrl: "assets/pradipto-sengupta.jpeg" },
  { name: "Dr. Amit Das", role: "Director & CHRO, The Times of India | Global HR Leader", initials: "AD", linkedIn: "https://www.linkedin.com/in/dr-amit-das-phd-27b9a38", photoUrl: "assets/amit-das.jpeg" },
  { name: "Sankha Ray", role: "Innovation & Incubation Leader | Founder, CraftsNation", initials: "SR", linkedIn: "https://www.linkedin.com/in/sankha-ray-9b161423/", photoUrl: "assets/sankha-ray.jpeg" },
  { name: "Ananya Biswas", role: "Founder, VERB", initials: "AB", linkedIn: "https://www.linkedin.com/in/ananya-biswas-79b70973/", photoUrl: "assets/ananya-biswas.jpeg" },
  { name: "Viveck Napaul", role: "Social Business | Euro-Asian Network Specialist", initials: "VN", linkedIn: "https://www.linkedin.com/in/euroasiannetwork/", photoUrl: "assets/viveck-napaul.jpeg" },
  { name: "Shubho Sengupta", role: "Brand Communications Leader | Media & ITES", initials: "SS", linkedIn: "https://www.linkedin.com/in/shubho/", photoUrl: "assets/shubho-sengupta.jpeg" },
  { name: "Arijit Banerjee", role: "Founder, Consumer51 | Media & IT Brand", initials: "AB", linkedIn: "https://www.linkedin.com/in/aribanerjee/", photoUrl: "assets/arijit-banerjee.jpeg" },
  { name: "Mitin Chakraborty", role: "CMO, Landmark Group | Marketing & Retail", initials: "MC", linkedIn: "https://www.linkedin.com/in/mitinc/", photoUrl: "assets/mitin-chakraborty.jpeg" },
  { name: "Viveck Vaswani", role: "Film Producer & Entertainment Industry Veteran", initials: "VV", linkedIn: "https://www.linkedin.com/in/prof-viveck-vaswani-92b566159/", photoUrl: "assets/viveck-vaswani.jpeg" },
  { name: "Mathew Mattam", role: "Founder, CYDA / YouthAid / TrashTech | Social Business", initials: "MM", linkedIn: "https://www.linkedin.com/in/mathew-mattam-165ab115/", photoUrl: "assets/mathew-mattam.jpeg" },
  { name: "Vinod Janardan", role: "Founder, Team Rustic | Co-founder, Eva Live | Live Events", initials: "VJ", linkedIn: "https://www.linkedin.com/in/vinod-janardhan/", photoUrl: "assets/vinod-janardan.jpeg" },
  { name: "Roshan Abbas", role: "Film Director, Events & Media | Entertainment", initials: "RA", linkedIn: "https://www.linkedin.com/in/roshan-abbas/", photoUrl: "assets/roshan-abbas.jpeg" },
  { name: "Arup Roy", role: "Founder & CEO, Red Apple Technologies | Game Design, AR/VR", initials: "AR", linkedIn: "https://www.linkedin.com/in/aruproy78/", photoUrl: "assets/arup-roy.jpeg" },
  { name: "Dr KM Hasan Ripon", role: "Executive Director, Daffodil Group | MD, GEN Bangladesh", initials: "HR", linkedIn: "https://www.linkedin.com/in/kmhasanripon/", photoUrl: "assets/km-hasan-ripon.jpeg" },
  { name: "Sudhan Lamsal", role: "Development Sector Trainer & Coach | Social Business", initials: "SL", linkedIn: "https://www.linkedin.com/in/sudhan-lamsal-746b2b277/", photoUrl: "assets/sudhan-lamsal.jpeg" },
  { name: "Prasenjit Kundu", role: "CEO, SkillSonics | IT-ITES & Social Sector", initials: "PK", linkedIn: "https://www.linkedin.com/in/prasenjitkkundu/", photoUrl: "assets/prasenjit-kundu.jpeg" },
  { name: "Sumit Dasgupta", role: "Founder, Allcap Communications Pvt Ltd", initials: "SD", linkedIn: "https://www.linkedin.com/in/sumit-das-gupta-580b88162/", photoUrl: "assets/sumit-dasgupta.jpeg" },
  { name: "Shantanu Jain", role: "Co-founder, ReadOn | Investor Educator, Markets by Zerodha Hindi | CA (AIR 10)", initials: "SJ", linkedIn: "https://www.linkedin.com/in/shantanujain13/", photoUrl: "assets/shantanu-jain.jpeg" },
  { name: "Sandeep Sengupta", role: "Founder / Director, ISOAH", initials: "SS", linkedIn: "https://www.linkedin.com/in/sandeepsengupta", photoUrl: "assets/sandeep.png" },
];

async function seed() {
  console.log(`\n🌱 Seeding ${mentors.length} mentors into Firestore collection 'mentors'...\n`);

  const batch = db.batch();

  mentors.forEach((mentor, index) => {
    const ref = db.collection("mentors").doc();
    batch.set(ref, {
      ...mentor,
      order: index + 1,
      active: true,
      createdAt: FieldValue.serverTimestamp(),
    });
    console.log(`  ✅ Adding: ${mentor.name}`);
  });

  await batch.commit();
  console.log(`\n✅ Done! Successfully seeded ${mentors.length} mentors into 'mentors'.\n`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
