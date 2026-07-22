// scripts/seed-firestore.mjs

import fs from "fs";
import path from "path";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// 1. Load .env.local variables
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  for (const line of envConfig.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const equalsIdx = trimmed.indexOf("=");
      if (equalsIdx > 0) {
        const key = trimmed.slice(0, equalsIdx).trim();
        let value = trimmed.slice(equalsIdx + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    }
  }
}

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || "aic-techno-cms";
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
const storageBucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`;

if (privateKey) {
  try {
    privateKey = JSON.parse(privateKey);
  } catch (e) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }
}

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    storageBucket: storageBucketName,
  });
}

const db = getFirestore();
const bucket = getStorage().bucket();

console.log(`🚀 Starting Firestore & Firebase Storage Seeding to bucket: ${storageBucketName}...`);

// Helper: Upload asset file to Firebase Storage if exists
async function uploadAssetIfExist(localRelativePath, destinationName) {
  const parentAssetPath = path.resolve("d:/Projects/aic-techno-website-ami-pra", localRelativePath);
  if (!fs.existsSync(parentAssetPath)) {
    console.log(`⚠️ Asset not found: ${parentAssetPath}, skipping Storage upload.`);
    return null;
  }

  try {
    const destination = `cms-seed/${destinationName}`;
    await bucket.upload(parentAssetPath, {
      destination,
      public: true,
      metadata: {
        cacheControl: "public, max-age=31536000",
      },
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
    console.log(`  ✅ Uploaded ${destinationName} -> ${publicUrl}`);
    return publicUrl;
  } catch (err) {
    console.warn(`  ⚠️ Warning: Storage upload for ${destinationName} failed (${err.message}). Using local fallback.`);
    return `/${localRelativePath}`;
  }
}

// Data Definitions from index.html & back2bengal.html

const MENTORS_DATA = [
  {
    id: "mentor-meghdut",
    name: "Meghdut RoyChowdhury",
    role: "Chief Mentor",
    initials: "MR",
    bio: "Executive Director & Chief Innovation Officer, Techno India Group — serial entrepreneur and innovation leader mentoring founders on AI, product and scale.",
    linkedIn: "https://www.linkedin.com/in/meghdutroychowdhury/",
    photoFile: "assets/meghdut-roychowdhury.jpeg",
    order: 1,
  },
  {
    id: "mentor-pauline",
    name: "Pauline Laravoire",
    role: "Vertical Head, Social Innovation",
    initials: "PL",
    bio: "Sustainability Director of Techno India Group and founder of the rebalance institute — driving education for sustainability, social entrepreneurship and systemic change.",
    linkedIn: "https://www.linkedin.com/in/paulinelaravoire/",
    photoFile: "assets/pauline-laravoire.jpeg",
    order: 2,
  },
  {
    id: "mentor-biplab",
    name: "Dr. Biplab Pal",
    role: "Senior Advisor",
    initials: "BP",
    bio: "IIT Kharagpur-trained Ph.D., UMBC adjunct faculty and deep-tech founder with 25+ U.S. patents — an AI researcher and mentor helping innovators move from idea to product, capital and global market.",
    linkedIn: "https://www.linkedin.com/in/biplab-pal-phd-4ab94b3/",
    photoFile: "assets/biplab-pal.jpeg",
    order: 3,
  },
  {
    id: "mentor-dibya",
    name: "Dibya Chatterjee",
    role: "Vertical Head, Media & Entertainment",
    initials: "DC",
    bio: "Writer-director-producer and founder of Handykraft Pictures — writer and co-creator of the acclaimed dark comedy Afsos (Amazon Prime Video), crafting original, genre-blending stories across film and screen.",
    linkedIn: "https://www.linkedin.com/in/dibya-chatterjee-967a3357/",
    photoFile: "assets/dibya-chatterjee.jpeg",
    order: 4,
  },
  {
    id: "mentor-skannd",
    name: "Skannd Tyagi",
    role: "Vertical Head, Emerging Technology",
    initials: "ST",
    bio: "Technologist and serial entrepreneur — a 'specialist generalist' and startup mentor helping founders turn ideas into scalable technology ventures.",
    linkedIn: "https://www.linkedin.com/in/skanndtyagi/",
    photoFile: "assets/skannd-tyagi.jpeg",
    order: 5,
  },
  {
    id: "mentor-dickie",
    name: "Dickie Currer-Ganguli",
    role: "Lead, Global Partnerships",
    initials: "DC",
    bio: "Co-Founder of APAC Innovation Hub and Hype Man Media — Mentor, Investor and Board Advisor with a global keynote presence. Specialist in building and connecting startup ecosystems across international markets.",
    linkedIn: "https://www.linkedin.com/in/dickiecurrer",
    photoFile: "assets/dickie-currer-ganguli.jpeg",
    order: 6,
  },
  {
    id: "mentor-puja",
    name: "Puja Currer-Ganguli",
    role: "Lead, Innovation Programs",
    initials: "PC",
    bio: "Co-Founder of APAC Innovation Hub and Hype Man Media — sustainability and innovation strategist working across global markets. Specialist in designing and delivering high-impact innovation programs.",
    linkedIn: "https://www.linkedin.com/in/puja-currer-ganguli",
    photoFile: "assets/puja-currer-ganguli.jpeg",
    order: 7,
  },
];

const SOCIAL_MENTORS_DATA = [
  {
    id: "sm-sujata",
    name: "Sujata Chatterjee",
    role: "Founder & MD, Twirl.store",
    initials: "SC",
    bio: "Pioneer in circular fashion and sustainable textile upcycling.",
    linkedIn: "https://www.linkedin.com/in/sujata-chatterjee-03a055162/",
    photoFile: "assets/pfp1.jpeg",
    order: 1,
  },
  {
    id: "sm-agni",
    name: "Agni Mitra",
    role: "Founder & CEO, Amwoodo",
    initials: "AM",
    bio: "Leading eco-friendly bamboo product manufacturing and sustainable materials.",
    linkedIn: "https://www.linkedin.com/in/iamagnimitra/",
    photoFile: "assets/pfp2.jpeg",
    order: 2,
  },
  {
    id: "sm-jinali",
    name: "Jinali Mody",
    role: "Founder, Banofi Leather",
    initials: "JM",
    bio: "Innovator crafting plant-based leather alternatives from banana crop waste.",
    linkedIn: "https://www.linkedin.com/in/modyjinali/",
    photoFile: "assets/pfp3.jpeg",
    order: 3,
  },
  {
    id: "sm-siddharth",
    name: "Siddharth Agarwal",
    role: "Founder, Veditum India Foundation",
    initials: "SA",
    bio: "Environmental researcher and river conservation advocate.",
    linkedIn: "https://www.linkedin.com/in/agarwalsid/",
    photoFile: "assets/pfp4.jpeg",
    order: 4,
  },
  {
    id: "sm-aishik",
    name: "Aishik Saha",
    role: "Co-founder & Director, Avagam Ventures & Givo",
    initials: "AS",
    bio: "Impact investor and venture builder in social enterprise space.",
    linkedIn: "https://www.linkedin.com/in/aishiks/",
    photoFile: "assets/pfp5.jpeg",
    order: 5,
  },
];

// All 12 Job Positions extracted directly from index.html #careers section
const CAREERS_DATA = [
  {
    id: "job-ceo",
    title: "Chief Executive Officer (CEO)",
    department: "Leadership",
    location: "Kolkata",
    type: "Full-Time",
    description: "Provide strategic direction, vision, governance, and overall leadership for AIC Techno Innovation and Incubation Council.",
    requirements: "10+ years senior executive experience in incubator leadership, venture capital, or high-growth tech ventures.",
    applyUrl: "https://forms.gle/bWcwfJvqXJzzwfJ29",
    active: true,
  },
  {
    id: "job-coo",
    title: "COO / Head of Incubation",
    department: "Leadership",
    location: "Kolkata",
    type: "Full-Time",
    description: "Lead daily incubator operations, cohort acceleration, facility management, and team leadership across all incubation tracks.",
    requirements: "7+ years experience in startup acceleration, incubator management, or operations leadership.",
    applyUrl: "https://forms.gle/bWcwfJvqXJzzwfJ29",
    active: true,
  },
  {
    id: "job-finance-lead",
    title: "Finance & Compliance Lead",
    department: "Finance & Compliance",
    location: "Kolkata",
    type: "Full-Time",
    description: "Manage financial planning, budgeting, audit, NITI Aayog grant compliance, and fiscal reporting for the incubation center.",
    requirements: "CA / MBA Finance with experience in grant compliance, government audits, and startup financial reporting.",
    applyUrl: "https://forms.gle/bWcwfJvqXJzzwfJ29",
    active: true,
  },
  {
    id: "job-domain-mgrs",
    title: "Domain Incubation Managers",
    department: "Programme Management",
    location: "Kolkata",
    type: "Full-Time",
    description: "Direct vertical-specific incubation tracks across AI, Deep Tech, Social Innovation, and Media & Entertainment.",
    requirements: "3+ years domain experience in product development, tech commercialization, or industry venture building.",
    applyUrl: "https://forms.gle/bWcwfJvqXJzzwfJ29",
    active: true,
  },
  {
    id: "job-cohort-mgr",
    title: "Programs / Cohort Manager",
    department: "Programme Management",
    location: "Kolkata",
    type: "Full-Time",
    description: "Manage startup cohort selection, milestone reviews, bootcamp workshops, and program execution.",
    requirements: "Experience designing and executing startup acceleration programs, bootcamps, and founder workshops.",
    applyUrl: "https://forms.gle/bWcwfJvqXJzzwfJ29",
    active: true,
  },
  {
    id: "job-partnerships-lead",
    title: "Partnerships & Mentor Lead",
    department: "Business Development",
    location: "Kolkata",
    type: "Full-Time",
    description: "Build corporate, academic, international, and investor partnerships to expand the incubator's mentor and capital network.",
    requirements: "Strong track record in corporate relations, ecosystem partnerships, and mentor network development.",
    applyUrl: "https://forms.gle/bWcwfJvqXJzzwfJ29",
    active: true,
  },
  {
    id: "job-investment-mgr",
    title: "Seed / Investment Manager",
    department: "Investment",
    location: "Kolkata",
    type: "Full-Time",
    description: "Evaluate startup deal flow, manage seed fund disbursements, due diligence, and investor pitch sessions.",
    requirements: "Background in venture capital, angel networks, investment banking, or startup due diligence.",
    applyUrl: "https://forms.gle/bWcwfJvqXJzzwfJ29",
    active: true,
  },
  {
    id: "job-lab-mgrs",
    title: "Lab / Makerspace Managers",
    department: "Operations",
    location: "Kolkata",
    type: "Full-Time",
    description: "Manage AI & Product Labs, Fab Lab 3D printers, media studios, and prototyping hardware equipment.",
    requirements: "Hands-on experience managing makerspaces, Fab Labs, hardware prototyping, or media lab facilities.",
    applyUrl: "https://forms.gle/bWcwfJvqXJzzwfJ29",
    active: true,
  },
  {
    id: "job-data-spec",
    title: "MIS / Data Specialist",
    department: "Data & Systems",
    location: "Kolkata",
    type: "Full-Time",
    description: "Maintain incubation analytics, NITI Aayog portal reporting, founder progress dashboards, and MIS metrics.",
    requirements: "Proficiency in data management, MIS reporting, database systems, and performance analytics.",
    applyUrl: "https://forms.gle/bWcwfJvqXJzzwfJ29",
    active: true,
  },
  {
    id: "job-marketing-outreach",
    title: "Marketing & Outreach",
    department: "Marketing",
    location: "Kolkata",
    type: "Full-Time",
    description: "Drive brand storytelling, social media campaigns, PR, hackathons, and founder recruitment initiatives.",
    requirements: "Experience in digital marketing, brand storytelling, social media growth, and startup community building.",
    applyUrl: "https://forms.gle/bWcwfJvqXJzzwfJ29",
    active: true,
  },
  {
    id: "job-legal-officer",
    title: "Legal / IP Officer",
    department: "Legal",
    location: "Kolkata",
    type: "Full-Time",
    description: "Provide legal advisory, founder incubation agreements, patent/IP filing support, and corporate compliance.",
    requirements: "LLB / LLM with specialization in corporate law, IP rights, startup contracts, and patent prosecution.",
    applyUrl: "https://forms.gle/bWcwfJvqXJzzwfJ29",
    active: true,
  },
  {
    id: "job-admin-coord",
    title: "Admin & Coordination",
    department: "Operations",
    location: "Kolkata",
    type: "Full-Time",
    description: "Oversee facility logistics, workspace desk allocations, vendor management, and office administration.",
    requirements: "Experience in office administration, facility coordination, vendor management, and operations.",
    applyUrl: "https://forms.gle/bWcwfJvqXJzzwfJ29",
    active: true,
  },
];

const PARTNERS_DATA = [
  {
    id: "partner-aim",
    name: "Atal Innovation Mission",
    category: "GOVT",
    website: "https://aim.gov.in",
    logoFile: "assets/logo.jpeg",
    featured: true,
  },
  {
    id: "partner-niti",
    name: "NITI Aayog, Govt. of India",
    category: "GOVT",
    website: "https://niti.gov.in",
    logoFile: "assets/logo.jpeg",
    featured: true,
  },
  {
    id: "partner-tig",
    name: "Techno India Group",
    category: "INSTITUTIONAL",
    website: "https://technoindiagroup.com",
    logoFile: "assets/footerlogo.png",
    featured: true,
  },
  {
    id: "partner-rebalance",
    name: "rebalance institute",
    category: "INSTITUTIONAL",
    website: "https://rebalance.institute",
    logoFile: "assets/rebalance-logo.png",
    featured: false,
  },
  {
    id: "partner-recraft",
    name: "Recraft Studio",
    category: "INSTITUTIONAL",
    website: "https://recraft.ai",
    logoFile: "assets/recraft-logo.png",
    featured: false,
  },
];

const HERO_DATA = {
  title: "AIC Techno Innovation and Incubation Council",
  description: "West Bengal's first Atal Incubation Centre, supported by Atal Innovation Mission, NITI Aayog, Government of India. Empowering next-gen startups from Bengal to the world.",
  badgeText: "Atal Innovation Mission · NITI Aayog",
  primaryCtaText: "Explore Incubation Programs",
  primaryCtaUrl: "#aic",
  secondaryCtaText: "Back2Bengal Initiative",
  secondaryCtaUrl: "#back2bengal",
  updatedAt: new Date().toISOString(),
};

const ABOUT_DATA = {
  vision: "To nurture tech-driven, socially responsible startups from West Bengal and Eastern India by providing world-class infrastructure, seed funding, mentorship, and global market access.",
  legacyYears: "40+",
  firstIncubationCenter: "1st Atal Incubation Centre in West Bengal",
  supportedStartups: "50+ Startups Mentored & Supported",
  facilities: ["AI & Product Lab", "Media & Design Studio", "Fab Lab & Prototyping", "Investor Clinic"],
  updatedAt: new Date().toISOString(),
};

const BACK2BENGAL_DATA = {
  title: "Back2Bengal Startup Initiative",
  subtitle: "Empowering NRI & returning founders from Bengal to build world-class ventures in Kolkata.",
  description: "Back2Bengal is a dedicated track by AIC Techno offering dedicated desk spaces, fast-track incubation, cloud credits, and mentor access for founders returning to West Bengal.",
  focusAreas: ["AI & Deep Tech", "Social Innovation", "Sustainability", "Media & Entertainment"],
  applyUrl: "https://aic-techno.com/back2bengal.html",
  updatedAt: new Date().toISOString(),
};

async function runSeed() {
  try {
    // 1. Seed Mentors (Ecosystem Enablers)
    console.log("📌 Seeding Mentors...");
    for (const mentor of MENTORS_DATA) {
      let photoUrl = "";
      if (mentor.photoFile) {
        photoUrl = await uploadAssetIfExist(mentor.photoFile, `mentors/${path.basename(mentor.photoFile)}`);
      }
      await db.collection("mentors").doc(mentor.id).set({
        name: mentor.name,
        role: mentor.role,
        initials: mentor.initials,
        bio: mentor.bio,
        linkedIn: mentor.linkedIn,
        photoUrl: photoUrl || "",
        order: mentor.order,
        updatedAt: new Date().toISOString(),
      });
      console.log(`  ✓ Mentors: ${mentor.name}`);
    }

    // 2. Seed Social Mentors
    console.log("📌 Seeding Social Mentors...");
    for (const sm of SOCIAL_MENTORS_DATA) {
      let photoUrl = "";
      if (sm.photoFile) {
        photoUrl = await uploadAssetIfExist(sm.photoFile, `social-mentors/${path.basename(sm.photoFile)}`);
      }
      await db.collection("socialMentors").doc(sm.id).set({
        name: sm.name,
        role: sm.role,
        initials: sm.initials,
        bio: sm.bio,
        linkedIn: sm.linkedIn,
        photoUrl: photoUrl || "",
        order: sm.order,
        updatedAt: new Date().toISOString(),
      });
      console.log(`  ✓ Social Mentor: ${sm.name}`);
    }

    // 3. Seed Careers (All 12 positions)
    console.log("📌 Seeding Careers (12 Job Postings)...");
    for (const career of CAREERS_DATA) {
      await db.collection("careers").doc(career.id).set({
        ...career,
        updatedAt: new Date().toISOString(),
      });
      console.log(`  ✓ Career: ${career.title} (${career.department})`);
    }

    // 4. Seed Partners
    console.log("📌 Seeding Partners...");
    for (const partner of PARTNERS_DATA) {
      let logoUrl = "";
      if (partner.logoFile) {
        logoUrl = await uploadAssetIfExist(partner.logoFile, `partners/${path.basename(partner.logoFile)}`);
      }
      await db.collection("partners").doc(partner.id).set({
        name: partner.name,
        category: partner.category,
        website: partner.website,
        logoUrl: logoUrl || "",
        featured: partner.featured,
        updatedAt: new Date().toISOString(),
      });
      console.log(`  ✓ Partner: ${partner.name}`);
    }

    // 5. Seed Hero Section
    console.log("📌 Seeding Hero Section...");
    await db.collection("siteContent").doc("hero").set(HERO_DATA);
    console.log("  ✓ Hero Section updated");

    // 6. Seed About Section
    console.log("📌 Seeding About Section...");
    await db.collection("siteContent").doc("about").set(ABOUT_DATA);
    console.log("  ✓ About Section updated");

    // 7. Seed Back2Bengal Section
    console.log("📌 Seeding Back2Bengal Section...");
    await db.collection("siteContent").doc("back2bengal").set(BACK2BENGAL_DATA);
    console.log("  ✓ Back2Bengal Section updated");

    console.log("🎉 ALL 12 JOBS AND FIRESTORE DATA SEEDED SUCCESSFULLY!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  }
}

runSeed();
