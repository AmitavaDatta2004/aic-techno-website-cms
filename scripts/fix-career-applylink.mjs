// scripts/fix-career-applylink.mjs
// Migrates all careers docs: copies applyUrl -> applyLink & adds tags/dept/icon fields

import fs from "fs";
import path from "path";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

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
if (privateKey) {
  try { privateKey = JSON.parse(privateKey); } catch { privateKey = privateKey.replace(/\\n/g, "\n"); }
}

if (!getApps().length) {
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

const db = getFirestore();

// Canonical job data with correct field names for the CMS
const JOBS = [
  { id: "job-ceo",              title: "Chief Executive Officer (CEO)",  dept: "Leadership",          icon: "👤", tags: ["Full-Time", "Kolkata", "Leadership"],      applyLink: "https://forms.gle/bWcwfJvqXJzzwfJ29", order: 1  },
  { id: "job-coo",              title: "COO / Head of Incubation",       dept: "Leadership",          icon: "🧭", tags: ["Full-Time", "Kolkata", "Operations"],       applyLink: "https://forms.gle/bWcwfJvqXJzzwfJ29", order: 2  },
  { id: "job-finance-lead",     title: "Finance & Compliance Lead",      dept: "Finance & Compliance",icon: "📊", tags: ["Full-Time", "Kolkata", "Finance"],          applyLink: "https://forms.gle/bWcwfJvqXJzzwfJ29", order: 3  },
  { id: "job-domain-mgrs",      title: "Domain Incubation Managers",     dept: "Programme Management",icon: "🏗️", tags: ["Full-Time", "Kolkata", "Incubation"],       applyLink: "https://forms.gle/bWcwfJvqXJzzwfJ29", order: 4  },
  { id: "job-cohort-mgr",       title: "Programs / Cohort Manager",      dept: "Programme Management",icon: "📋", tags: ["Full-Time", "Kolkata", "Programmes"],       applyLink: "https://forms.gle/bWcwfJvqXJzzwfJ29", order: 5  },
  { id: "job-partnerships-lead",title: "Partnerships & Mentor Lead",     dept: "Business Development",icon: "🤝", tags: ["Full-Time", "Kolkata", "Partnerships"],     applyLink: "https://forms.gle/bWcwfJvqXJzzwfJ29", order: 6  },
  { id: "job-investment-mgr",   title: "Seed / Investment Manager",      dept: "Investment",          icon: "💰", tags: ["Full-Time", "Kolkata", "Funding"],           applyLink: "https://forms.gle/bWcwfJvqXJzzwfJ29", order: 7  },
  { id: "job-lab-mgrs",         title: "Lab / Makerspace Managers",      dept: "Operations",          icon: "🔧", tags: ["Full-Time", "Kolkata", "Makerspace"],        applyLink: "https://forms.gle/bWcwfJvqXJzzwfJ29", order: 8  },
  { id: "job-data-spec",        title: "MIS / Data Specialist",          dept: "Data & Systems",      icon: "📈", tags: ["Full-Time", "Kolkata", "Data"],              applyLink: "https://forms.gle/bWcwfJvqXJzzwfJ29", order: 9  },
  { id: "job-marketing-outreach",title: "Marketing & Outreach",          dept: "Marketing",           icon: "📣", tags: ["Full-Time", "Kolkata", "Outreach"],          applyLink: "https://forms.gle/bWcwfJvqXJzzwfJ29", order: 10 },
  { id: "job-legal-officer",    title: "Legal / IP Officer",             dept: "Legal",               icon: "⚖️", tags: ["Full-Time", "Kolkata", "Legal / IP"],        applyLink: "https://forms.gle/bWcwfJvqXJzzwfJ29", order: 11 },
  { id: "job-admin-coord",      title: "Admin & Coordination",           dept: "Operations",          icon: "🗂️", tags: ["Full-Time", "Kolkata", "Administration"],    applyLink: "https://forms.gle/bWcwfJvqXJzzwfJ29", order: 12 },
];

async function run() {
  console.log("🔧 Fixing careers collection: adding applyLink, tags, icon, dept, order fields...\n");
  for (const job of JOBS) {
    await db.collection("careers").doc(job.id).set(
      {
        applyLink: job.applyLink,
        tags: job.tags,
        icon: job.icon,
        dept: job.dept,
        title: job.title,
        order: job.order,
        active: true,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    console.log(`  ✅ ${job.title} — applyLink: ${job.applyLink}`);
  }
  console.log("\n🎉 All 12 career docs updated with applyLink & tags!");
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
