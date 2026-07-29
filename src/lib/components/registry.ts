// src/lib/components/registry.ts
// Defines all 16 reusable component types for the Visual Page Builder.
// Each ComponentDef drives: the Components Panel, the Properties Panel, and
// the Canvas preview renderer. FieldDef entries determine which controls
// appear in the Properties Panel when that component is selected.

// ─── Field Types ──────────────────────────────────────────────────────────────

export type FieldType =
  | "text"
  | "textarea"
  | "url"
  | "color"
  | "image"
  | "select"
  | "toggle"
  | "number"
  | "icon"
  | "repeater";

export interface SelectOption {
  value: string;
  label: string;
}

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: SelectOption[];
  min?: number;
  max?: number;
  step?: number;
  /** For repeater fields — defines the sub-fields for each list item */
  repeaterFields?: Omit<FieldDef, "repeaterFields">[];
  /** Label for the "add item" button in a repeater */
  repeaterAddLabel?: string;
}

// ─── Component Types ──────────────────────────────────────────────────────────

export type ComponentCategory = "layout" | "content" | "media" | "interactive";

export interface ComponentDef {
  type: string;
  label: string;
  /** Emoji icon shown in the Components Panel */
  icon: string;
  category: ComponentCategory;
  defaultProps: Record<string, unknown>;
  fields: FieldDef[];
}

// ─── Registry ─────────────────────────────────────────────────────────────────

export const COMPONENT_REGISTRY: ComponentDef[] = [
  // ── 1. Hero ────────────────────────────────────────────────────────────────
  {
    type: "hero",
    label: "Hero Section",
    icon: "🏔️",
    category: "layout",
    defaultProps: {
      title: "Your Powerful Headline Here",
      subtitle:
        "A compelling subtitle that explains your value proposition in one or two sentences.",
      backgroundImage: "",
      overlayOpacity: 0.55,
      buttonText: "Get Started",
      buttonUrl: "#",
      secondaryButtonText: "Learn More",
      secondaryButtonUrl: "#",
      alignment: "center",
      height: "large",
    },
    fields: [
      { key: "title", label: "Title", type: "text", placeholder: "Hero headline" },
      { key: "subtitle", label: "Subtitle", type: "textarea", placeholder: "Supporting text" },
      { key: "backgroundImage", label: "Background Image", type: "image" },
      { key: "overlayOpacity", label: "Overlay Opacity", type: "number", min: 0, max: 1, step: 0.05 },
      { key: "buttonText", label: "Primary Button Text", type: "text" },
      { key: "buttonUrl", label: "Primary Button URL", type: "url" },
      { key: "secondaryButtonText", label: "Secondary Button Text", type: "text" },
      { key: "secondaryButtonUrl", label: "Secondary Button URL", type: "url" },
      {
        key: "alignment",
        label: "Text Alignment",
        type: "select",
        options: [
          { value: "left", label: "Left" },
          { value: "center", label: "Center" },
          { value: "right", label: "Right" },
        ],
      },
      {
        key: "height",
        label: "Height",
        type: "select",
        options: [
          { value: "small", label: "Small (50vh)" },
          { value: "medium", label: "Medium (65vh)" },
          { value: "large", label: "Large (80vh)" },
          { value: "fullscreen", label: "Full Screen (100vh)" },
        ],
      },
    ],
  },

  // ── 2. About ───────────────────────────────────────────────────────────────
  {
    type: "about",
    label: "About",
    icon: "📝",
    category: "content",
    defaultProps: {
      tag: "About Us",
      heading: "Who We Are",
      body: "Tell your story here. Describe what makes your organisation unique, your mission, and your values.",
      image: "",
      imagePosition: "right",
    },
    fields: [
      { key: "tag", label: "Section Tag", type: "text", placeholder: "e.g. About Us" },
      { key: "heading", label: "Heading", type: "text" },
      { key: "body", label: "Body Text", type: "textarea" },
      { key: "image", label: "Image", type: "image" },
      {
        key: "imagePosition",
        label: "Image Position",
        type: "select",
        options: [
          { value: "left", label: "Left" },
          { value: "right", label: "Right" },
        ],
      },
    ],
  },

  // ── 3. Image + Text ────────────────────────────────────────────────────────
  {
    type: "image_text",
    label: "Image + Text",
    icon: "🖼️",
    category: "content",
    defaultProps: {
      image: "",
      heading: "Section Heading",
      body: "Describe this section. Keep it clear and concise.",
      buttonText: "Learn More",
      buttonUrl: "#",
      layout: "image-left",
    },
    fields: [
      { key: "image", label: "Image", type: "image" },
      { key: "heading", label: "Heading", type: "text" },
      { key: "body", label: "Body", type: "textarea" },
      { key: "buttonText", label: "Button Text", type: "text" },
      { key: "buttonUrl", label: "Button URL", type: "url" },
      {
        key: "layout",
        label: "Layout",
        type: "select",
        options: [
          { value: "image-left", label: "Image Left" },
          { value: "image-right", label: "Image Right" },
        ],
      },
    ],
  },

  // ── 4. Features ────────────────────────────────────────────────────────────
  {
    type: "features",
    label: "Features",
    icon: "✨",
    category: "content",
    defaultProps: {
      heading: "What We Offer",
      subtitle: "Everything you need to succeed.",
      cards: [
        { icon: "🚀", title: "Feature One", body: "Describe this feature and why it matters." },
        { icon: "💡", title: "Feature Two", body: "Describe this feature and why it matters." },
        { icon: "🛡️", title: "Feature Three", body: "Describe this feature and why it matters." },
      ],
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      {
        key: "cards",
        label: "Feature Cards",
        type: "repeater",
        repeaterAddLabel: "Add Feature",
        repeaterFields: [
          { key: "icon", label: "Icon (emoji)", type: "icon" },
          { key: "title", label: "Title", type: "text" },
          { key: "body", label: "Description", type: "textarea" },
        ],
      },
    ],
  },

  // ── 5. Services ────────────────────────────────────────────────────────────
  {
    type: "services",
    label: "Services",
    icon: "🛠️",
    category: "content",
    defaultProps: {
      heading: "Our Services",
      subtitle: "We provide end-to-end support for your journey.",
      cards: [
        { icon: "📊", title: "Service One", body: "Short description of this service.", link: "#" },
        { icon: "🎯", title: "Service Two", body: "Short description of this service.", link: "#" },
      ],
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      {
        key: "cards",
        label: "Service Cards",
        type: "repeater",
        repeaterAddLabel: "Add Service",
        repeaterFields: [
          { key: "icon", label: "Icon (emoji)", type: "icon" },
          { key: "title", label: "Title", type: "text" },
          { key: "body", label: "Description", type: "textarea" },
          { key: "link", label: "Link URL", type: "url" },
        ],
      },
    ],
  },

  // ── 6. Cards ───────────────────────────────────────────────────────────────
  {
    type: "cards",
    label: "Cards Grid",
    icon: "🃏",
    category: "content",
    defaultProps: {
      heading: "Our Programme Areas",
      subtitle: "",
      items: [
        { image: "", title: "Card One", body: "Description for this card.", link: "#" },
        { image: "", title: "Card Two", body: "Description for this card.", link: "#" },
        { image: "", title: "Card Three", body: "Description for this card.", link: "#" },
      ],
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      {
        key: "items",
        label: "Cards",
        type: "repeater",
        repeaterAddLabel: "Add Card",
        repeaterFields: [
          { key: "image", label: "Card Image", type: "image" },
          { key: "title", label: "Title", type: "text" },
          { key: "body", label: "Description", type: "textarea" },
          { key: "link", label: "Link URL", type: "url" },
        ],
      },
    ],
  },

  // ── 7. Statistics ──────────────────────────────────────────────────────────
  {
    type: "statistics",
    label: "Statistics",
    icon: "📊",
    category: "content",
    defaultProps: {
      heading: "By the Numbers",
      stats: [
        { value: "100+", label: "Startups Supported" },
        { value: "₹50Cr", label: "Funding Facilitated" },
        { value: "40+", label: "Expert Mentors" },
        { value: "5+", label: "Years of Excellence" },
      ],
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      {
        key: "stats",
        label: "Statistics",
        type: "repeater",
        repeaterAddLabel: "Add Stat",
        repeaterFields: [
          { key: "value", label: "Value", type: "text", placeholder: "e.g. 100+" },
          { key: "label", label: "Label", type: "text", placeholder: "e.g. Startups Supported" },
        ],
      },
    ],
  },

  // ── 8. Timeline ────────────────────────────────────────────────────────────
  {
    type: "timeline",
    label: "Timeline",
    icon: "📅",
    category: "content",
    defaultProps: {
      heading: "Our Journey",
      events: [
        { date: "2019", title: "Founded", body: "AIC Techno was established as West Bengal's first Atal Incubation Centre." },
        { date: "2020", title: "First Cohort", body: "Onboarded our first batch of innovative startups." },
        { date: "2021", title: "Expansion", body: "Expanded our mentorship network to 40+ industry experts." },
      ],
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      {
        key: "events",
        label: "Timeline Events",
        type: "repeater",
        repeaterAddLabel: "Add Event",
        repeaterFields: [
          { key: "date", label: "Date / Year", type: "text" },
          { key: "title", label: "Event Title", type: "text" },
          { key: "body", label: "Description", type: "textarea" },
        ],
      },
    ],
  },

  // ── 9. Team ────────────────────────────────────────────────────────────────
  {
    type: "team",
    label: "Team",
    icon: "👥",
    category: "content",
    defaultProps: {
      heading: "Meet Our Team",
      subtitle: "The people behind the mission.",
      members: [
        { name: "Team Member", role: "Title", photo: "", bio: "", linkedin: "" },
      ],
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      {
        key: "members",
        label: "Team Members",
        type: "repeater",
        repeaterAddLabel: "Add Member",
        repeaterFields: [
          { key: "name", label: "Name", type: "text" },
          { key: "role", label: "Role / Title", type: "text" },
          { key: "photo", label: "Photo", type: "image" },
          { key: "bio", label: "Short Bio", type: "textarea" },
          { key: "linkedin", label: "LinkedIn URL", type: "url" },
        ],
      },
    ],
  },

  // ── 10. Testimonials ───────────────────────────────────────────────────────
  {
    type: "testimonials",
    label: "Testimonials",
    icon: "💬",
    category: "content",
    defaultProps: {
      heading: "What Founders Say",
      items: [
        { quote: "AIC Techno transformed our startup from an idea to a funded company.", author: "Founder Name", role: "CEO, Startup Co.", photo: "" },
        { quote: "The mentorship and workspace support was invaluable for our growth.", author: "Another Founder", role: "CTO, Tech Startup", photo: "" },
      ],
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      {
        key: "items",
        label: "Testimonials",
        type: "repeater",
        repeaterAddLabel: "Add Testimonial",
        repeaterFields: [
          { key: "quote", label: "Quote", type: "textarea" },
          { key: "author", label: "Author Name", type: "text" },
          { key: "role", label: "Author Role", type: "text" },
          { key: "photo", label: "Photo", type: "image" },
        ],
      },
    ],
  },

  // ── 11. Gallery ────────────────────────────────────────────────────────────
  {
    type: "gallery",
    label: "Gallery",
    icon: "🖼️",
    category: "media",
    defaultProps: {
      heading: "Gallery",
      columns: 3,
      images: [],
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "columns", label: "Columns", type: "number", min: 2, max: 5 },
      {
        key: "images",
        label: "Images",
        type: "repeater",
        repeaterAddLabel: "Add Image",
        repeaterFields: [
          { key: "url", label: "Image", type: "image" },
          { key: "alt", label: "Alt Text", type: "text" },
          { key: "caption", label: "Caption (optional)", type: "text" },
        ],
      },
    ],
  },

  // ── 12. FAQ ────────────────────────────────────────────────────────────────
  {
    type: "faq",
    label: "FAQ",
    icon: "❓",
    category: "interactive",
    defaultProps: {
      heading: "Frequently Asked Questions",
      items: [
        { question: "How do I apply to the incubation programme?", answer: "Visit our Apply page and submit your application online. Our team reviews applications on a rolling basis." },
        { question: "What support do incubated startups receive?", answer: "Startups receive workspace, mentorship, investor connects, and funding support." },
      ],
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      {
        key: "items",
        label: "FAQ Items",
        type: "repeater",
        repeaterAddLabel: "Add Question",
        repeaterFields: [
          { key: "question", label: "Question", type: "text" },
          { key: "answer", label: "Answer", type: "textarea" },
        ],
      },
    ],
  },

  // ── 13. Contact Form ───────────────────────────────────────────────────────
  {
    type: "contact_form",
    label: "Contact Form",
    icon: "📧",
    category: "interactive",
    defaultProps: {
      heading: "Get in Touch",
      subtitle: "Fill out the form below and we'll get back to you within 24 hours.",
      email: "contact@aic-techno.com",
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "email", label: "Contact Email", type: "url", placeholder: "contact@example.com" },
    ],
  },

  // ── 14. CTA ────────────────────────────────────────────────────────────────
  {
    type: "cta",
    label: "Call to Action",
    icon: "📣",
    category: "interactive",
    defaultProps: {
      heading: "Ready to Launch Your Startup?",
      subtitle: "Apply to AIC Techno's incubation programme and take your idea to the next level.",
      primaryText: "Apply Now",
      primaryUrl: "#",
      secondaryText: "Learn More",
      secondaryUrl: "#",
      background: "maroon",
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "primaryText", label: "Primary Button Text", type: "text" },
      { key: "primaryUrl", label: "Primary Button URL", type: "url" },
      { key: "secondaryText", label: "Secondary Button Text", type: "text" },
      { key: "secondaryUrl", label: "Secondary Button URL", type: "url" },
      {
        key: "background",
        label: "Background",
        type: "select",
        options: [
          { value: "dark", label: "Dark" },
          { value: "maroon", label: "Maroon" },
          { value: "light", label: "Light" },
        ],
      },
    ],
  },

  // ── 15. Mentors ────────────────────────────────────────────────────────────
  {
    type: "mentors",
    label: "Mentors",
    icon: "🎓",
    category: "content",
    defaultProps: {
      heading: "Our Mentors",
      subtitle: "Industry leaders guiding the next generation of startups.",
      source: "static",
      members: [
        { name: "Mentor Name", role: "Title, Organisation", photo: "", linkedin: "" },
      ],
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      {
        key: "members",
        label: "Mentors",
        type: "repeater",
        repeaterAddLabel: "Add Mentor",
        repeaterFields: [
          { key: "name", label: "Name", type: "text" },
          { key: "role", label: "Role", type: "text" },
          { key: "photo", label: "Photo", type: "image" },
          { key: "linkedin", label: "LinkedIn URL", type: "url" },
        ],
      },
    ],
  },


  // ── 17. Pricing / Incubation Packages ──────────────────────────────────────
  {
    type: "pricing",
    label: "Pricing / Plans",
    icon: "💰",
    category: "interactive",
    defaultProps: {
      heading: "Incubation & Workspace Packages",
      subtitle: "Flexible plans tailored for early-stage startups and high-growth ventures.",
      plans: [
        {
          name: "Virtual Incubation",
          price: "₹5,000",
          period: "/month",
          description: "Ideal for remote founders needing legal address, mentorship & cloud credits.",
          features: "Registered Address, Mentorship Access, Cloud Credits, Legal & IP Support",
          buttonText: "Apply Virtual",
          buttonUrl: "#apply",
          popular: false,
        },
        {
          name: "Full Incubation",
          price: "₹15,000",
          period: "/month",
          description: "Dedicated seats, Fab Lab access, and direct investor acceleration.",
          features: "Dedicated Desk, GPU & Fab Lab, Seed Grant Eligibility, Investor Demo Day",
          buttonText: "Apply Full",
          buttonUrl: "#apply",
          popular: true,
        },
      ],
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      {
        key: "plans",
        label: "Pricing Plans",
        type: "repeater",
        repeaterAddLabel: "Add Plan",
        repeaterFields: [
          { key: "name", label: "Plan Name", type: "text" },
          { key: "price", label: "Price", type: "text" },
          { key: "period", label: "Period (e.g. /month)", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "features", label: "Features (comma separated)", type: "textarea" },
          { key: "buttonText", label: "Button Text", type: "text" },
          { key: "buttonUrl", label: "Button URL", type: "url" },
          { key: "popular", label: "Highlight as Popular", type: "toggle" },
        ],
      },
    ],
  },

  // ── 18. Partner Logo Cloud ─────────────────────────────────────────────────
  {
    type: "logos",
    label: "Partner Logos",
    icon: "🏢",
    category: "media",
    defaultProps: {
      heading: "Supported by Industry Leaders",
      subtitle: "Our strategic ecosystem partners and corporate sponsors.",
      logos: [
        { name: "NITI Aayog", image: "", link: "#" },
        { name: "Atal Innovation Mission", image: "", link: "#" },
        { name: "Techno India Group", image: "", link: "#" },
      ],
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      {
        key: "logos",
        label: "Partner Logos",
        type: "repeater",
        repeaterAddLabel: "Add Partner Logo",
        repeaterFields: [
          { key: "name", label: "Partner Name", type: "text" },
          { key: "image", label: "Logo Image", type: "image" },
          { key: "link", label: "Website URL", type: "url" },
        ],
      },
    ],
  },

  // ── 19. News & Announcements Grid ─────────────────────────────────────────
  {
    type: "news_grid",
    label: "News & Updates",
    icon: "📰",
    category: "content",
    defaultProps: {
      heading: "Latest News & Press Releases",
      subtitle: "Stay updated with cohort announcements, grants, and startup achievements.",
      articles: [
        {
          title: "AIC Techno Announces ₹2.5 Cr Seed Fund Cohort",
          date: "July 2026",
          category: "Funding",
          excerpt: "Selected deep-tech startups receive seed investment and mentorship acceleration.",
          image: "",
          link: "#",
        },
        {
          title: "State AI Excellence Hub Launched in Kolkata",
          date: "June 2026",
          category: "Infrastructure",
          excerpt: "New high-performance GPU lab powered by NITI Aayog guidelines opens for founders.",
          image: "",
          link: "#",
        },
      ],
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      {
        key: "articles",
        label: "News Articles",
        type: "repeater",
        repeaterAddLabel: "Add News Article",
        repeaterFields: [
          { key: "title", label: "Article Title", type: "text" },
          { key: "date", label: "Date / Month", type: "text" },
          { key: "category", label: "Category Tag", type: "text" },
          { key: "excerpt", label: "Excerpt", type: "textarea" },
          { key: "image", label: "Thumbnail Image", type: "image" },
          { key: "link", label: "Article URL", type: "url" },
        ],
      },
    ],
  },

  // ── 20. Video Showcase ─────────────────────────────────────────────────────
  {
    type: "video_modal",
    label: "Video Showcase",
    icon: "🎬",
    category: "media",
    defaultProps: {
      heading: "Watch Our Incubation Journey",
      subtitle: "See how AIC Techno empowers founders across Eastern India.",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      coverImage: "",
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "videoUrl", label: "Video Embed URL (YouTube/Vimeo)", type: "url" },
      { key: "coverImage", label: "Cover Thumbnail Image", type: "image" },
    ],
  },

  // ── 21. Announcement Banner Bar ───────────────────────────────────────────
  {
    type: "banner_alert",
    label: "Announcement Bar",
    icon: "📢",
    category: "layout",
    defaultProps: {
      badge: "NEW COHORT",
      text: "Applications open for 2026 Deep-Tech Acceleration Program!",
      buttonText: "Apply Now →",
      buttonUrl: "#apply",
      bgColor: "#800020",
    },
    fields: [
      { key: "badge", label: "Badge Tag", type: "text" },
      { key: "text", label: "Announcement Text", type: "text" },
      { key: "buttonText", label: "Button Text", type: "text" },
      { key: "buttonUrl", label: "Button URL", type: "url" },
      { key: "bgColor", label: "Background Color", type: "color" },
    ],
  },

  // ── 22. Accordion List ────────────────────────────────────────────────────
  {
    type: "accordion_list",
    label: "Accordion List",
    icon: "📂",
    category: "interactive",
    defaultProps: {
      heading: "Program Criteria & Guidelines",
      items: [
        { title: "Eligibility Criteria", content: "Registered DPIIT startups, innovators with working prototypes, and spin-off ventures." },
        { title: "Funding Limit", content: "Up to ₹25 Lakhs seed grant under SISFS and NITI Aayog AIM scheme guidelines." },
      ],
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      {
        key: "items",
        label: "Accordion Items",
        type: "repeater",
        repeaterAddLabel: "Add Item",
        repeaterFields: [
          { key: "title", label: "Item Title", type: "text" },
          { key: "content", label: "Item Details", type: "textarea" },
        ],
      },
    ],
  },

  // ── 23. Step-by-Step Process ─────────────────────────────────────────────
  {
    type: "step_process",
    label: "Step Process",
    icon: "🔢",
    category: "content",
    defaultProps: {
      heading: "How Incubation Works",
      subtitle: "Four simple steps from application to seed capital acceleration.",
      steps: [
        { step: "01", title: "Online Application", body: "Submit your startup deck, product demo, and business model." },
        { step: "02", title: "Pitch Screening", body: "Present your venture before our advisory panel and mentors." },
        { step: "03", title: "Onboarding & Lab Access", body: "Get physical seat allocation, GPU access, and ₹25L seed grant support." },
        { step: "04", title: "Investor Demo Day", body: "Scale product and pitch to top VC firms at our flagship Demo Day." },
      ],
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      {
        key: "steps",
        label: "Process Steps",
        type: "repeater",
        repeaterAddLabel: "Add Step",
        repeaterFields: [
          { key: "step", label: "Step Number (e.g. 01)", type: "text" },
          { key: "title", label: "Step Title", type: "text" },
          { key: "body", label: "Description", type: "textarea" },
        ],
      },
    ],
  },

  // ── 24. Executive Quote Banner ───────────────────────────────────────────
  {
    type: "quotes_banner",
    label: "Executive Quote",
    icon: "💬",
    category: "content",
    defaultProps: {
      quote: "Innovation is not just about building tech; it's about solving real-world human bottlenecks with scalable execution.",
      author: "Prof. (Dr.) Anupam Basu",
      role: "Chairman, Academic Advisory Board",
      photo: "",
    },
    fields: [
      { key: "quote", label: "Quote Text", type: "textarea" },
      { key: "author", label: "Author Name", type: "text" },
      { key: "role", label: "Author Title & Org", type: "text" },
      { key: "photo", label: "Author Photo", type: "image" },
    ],
  },

  // ── 25. Careers / Job Board ──────────────────────────────────────────────
  {
    type: "job_board",
    label: "Careers / Jobs",
    icon: "💼",
    category: "interactive",
    defaultProps: {
      heading: "Join Our Team & Incubated Ventures",
      subtitle: "Explore open positions across engineering, operations, and mentorship.",
      jobs: [
        { title: "AI & GPU Lab Manager", department: "Infrastructure", type: "Full-Time", location: "Kolkata, WB", applyUrl: "#apply" },
        { title: "Incubation Manager", department: "Programs", type: "Full-Time", location: "Kolkata, WB", applyUrl: "#apply" },
      ],
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      {
        key: "jobs",
        label: "Job Openings",
        type: "repeater",
        repeaterAddLabel: "Add Job Position",
        repeaterFields: [
          { key: "title", label: "Job Title", type: "text" },
          { key: "department", label: "Department", type: "text" },
          { key: "type", label: "Job Type (Full-time / Hybrid)", type: "text" },
          { key: "location", label: "Location", type: "text" },
          { key: "applyUrl", label: "Apply Link", type: "url" },
        ],
      },
    ],
  },

  // ── 26. Resource Downloads ───────────────────────────────────────────────
  {
    type: "download_resources",
    label: "Resource Downloads",
    icon: "📄",
    category: "media",
    defaultProps: {
      heading: "Guidelines & Downloads",
      subtitle: "Download official incubation handbooks, SISFS guidelines, and pitch templates.",
      resources: [
        { title: "Incubation Policy Handbook 2026", size: "PDF • 2.4 MB", downloadUrl: "#" },
        { title: "Startup Seed Fund Scheme Guidelines", size: "PDF • 1.8 MB", downloadUrl: "#" },
      ],
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      {
        key: "resources",
        label: "Resources",
        type: "repeater",
        repeaterAddLabel: "Add Resource File",
        repeaterFields: [
          { key: "title", label: "Document Title", type: "text" },
          { key: "size", label: "File Info (e.g. PDF • 2.4 MB)", type: "text" },
          { key: "downloadUrl", label: "Download Link / File URL", type: "url" },
        ],
      },
    ],
  },

  // ── 27. Location & Contact Card ──────────────────────────────────────────
  {
    type: "location_map",
    label: "Location Map",
    icon: "📍",
    category: "interactive",
    defaultProps: {
      heading: "Visit Our Innovation Hub",
      address: "Techno India Campus, EM-4, Sector V, Salt Lake, Kolkata, West Bengal 700091",
      email: "contact@aic-techno.com",
      phone: "+91 33 2357 5683",
      mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3684.053641775791!2d88.432654!3d22.577108!2m3!1f0!1f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjLCsDM0JzM3LjYiTiA4OMKwMjUnNTcuNiJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin",
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "address", label: "Address", type: "textarea" },
      { key: "email", label: "Contact Email", type: "text" },
      { key: "phone", label: "Contact Phone", type: "text" },
      { key: "mapEmbedUrl", label: "Google Maps Embed URL", type: "url" },
    ],
  },

  // ── 28. Split Hero with Lead Form ────────────────────────────────────────
  {
    type: "hero_split",
    label: "Hero with Lead Form",
    icon: "🚀",
    category: "layout",
    defaultProps: {
      heading: "Transform Your Idea into a Funded Deep-Tech Venture",
      subtitle: "Access up to ₹25 Lakhs seed capital, GPU labs, and top-tier mentorship.",
      formHeading: "Apply for Incubation",
      buttonText: "Submit Application →",
    },
    fields: [
      { key: "heading", label: "Hero Heading", type: "text" },
      { key: "subtitle", label: "Hero Subtitle", type: "textarea" },
      { key: "formHeading", label: "Form Title", type: "text" },
      { key: "buttonText", label: "Form Button Text", type: "text" },
    ],
  },

  // ── 29. Feature Comparison Matrix ────────────────────────────────────────
  {
    type: "comparison_table",
    label: "Comparison Matrix",
    icon: "⚖️",
    category: "interactive",
    defaultProps: {
      heading: "Why Choose AIC Techno Acceleration?",
      col1Title: "Traditional Incubators",
      col2Title: "AIC Techno Advantage",
      items: [
        { feature: "Seed Grant Support", col1: "Up to ₹5-10L", col2: "Up to ₹25L (SISFS Grant)" },
        { feature: "GPU & AI Compute Lab", col1: "Limited Cloud Credits", col2: "NVIDIA High-Perf GPU Lab" },
        { feature: "Mentorship Network", col1: "Generalist Advisors", col2: "40+ Industry C-Suite Executives" },
      ],
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "col1Title", label: "Column 1 Header", type: "text" },
      { key: "col2Title", label: "Column 2 Header (Advantage)", type: "text" },
      {
        key: "items",
        label: "Comparison Rows",
        type: "repeater",
        repeaterAddLabel: "Add Row",
        repeaterFields: [
          { key: "feature", label: "Feature Name", type: "text" },
          { key: "col1", label: "Traditional / Option 1 Value", type: "text" },
          { key: "col2", label: "AIC Techno Value", type: "text" },
        ],
      },
    ],
  },

  // ── 30. Metric Impact Cards ──────────────────────────────────────────────
  {
    type: "stats_cards",
    label: "Metric Impact Cards",
    icon: "📊",
    category: "content",
    defaultProps: {
      heading: "Our Incubation Impact in Numbers",
      cards: [
        { number: "100+", label: "Incubated Startups", badge: "+25% YoY" },
        { number: "₹25 Cr+", label: "Capital Raised", badge: "Follow-on Funding" },
        { number: "500+", label: "Jobs Created", badge: "Eastern India" },
      ],
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      {
        key: "cards",
        label: "Impact Cards",
        type: "repeater",
        repeaterAddLabel: "Add Impact Card",
        repeaterFields: [
          { key: "number", label: "Metric Number", type: "text" },
          { key: "label", label: "Metric Label", type: "text" },
          { key: "badge", label: "Sub-badge Tag", type: "text" },
        ],
      },
    ],
  },

  // ── 31. Event Schedule / Agenda ──────────────────────────────────────────
  {
    type: "event_schedule",
    label: "Event Agenda",
    icon: "📅",
    category: "interactive",
    defaultProps: {
      heading: "Demo Day & Summit Schedule",
      subtitle: "Join industry leaders, investors, and founders across 4 keynote tracks.",
      sessions: [
        { time: "10:00 AM", title: "Keynote: AI & Deep-Tech Frontier", speaker: "Dr. Anupam Basu", tag: "Keynote" },
        { time: "11:30 AM", title: "Cohort 2026 Startup Pitches", speaker: "12 Finalist Founders", tag: "Pitching" },
        { time: "02:00 PM", title: "VC Panel: Raising Seed Capital", speaker: "Sequoia & Accel Partners", tag: "Panel" },
      ],
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      {
        key: "sessions",
        label: "Schedule Sessions",
        type: "repeater",
        repeaterAddLabel: "Add Session",
        repeaterFields: [
          { key: "time", label: "Time Slot", type: "text" },
          { key: "title", label: "Session Title", type: "text" },
          { key: "speaker", label: "Speaker / Panelist", type: "text" },
          { key: "tag", label: "Category Tag", type: "text" },
        ],
      },
    ],
  },

  // ── 32. Stat Counter Bar / Ribbon ─────────────────────────────────────────
  {
    type: "stats_counter_bar",
    label: "Floating Stats Ribbon",
    icon: "⚡",
    category: "content",
    defaultProps: {
      items: [
        { value: "₹25 Lakhs", label: "Seed Grant per Venture" },
        { value: "40+", label: "C-Suite Mentors" },
        { value: "100%", label: "GPU Lab Support" },
        { value: "₹50 Cr+", label: "Total Valuation" },
      ],
    },
    fields: [
      {
        key: "items",
        label: "Ribbon Stat Items",
        type: "repeater",
        repeaterAddLabel: "Add Stat Item",
        repeaterFields: [
          { key: "value", label: "Stat Value", type: "text" },
          { key: "label", label: "Stat Label", type: "text" },
        ],
      },
    ],
  },

  // ── 33. Developer Code Block Showcase ─────────────────────────────────────
  {
    type: "code_block",
    label: "Code Showcase",
    icon: "💻",
    category: "media",
    defaultProps: {
      heading: "Open API & Compute Access",
      language: "python",
      code: `# AIC Techno High-Performance GPU Cluster API
import aic_techno as aic

client = aic.Client(api_key="aic_live_2026")
cluster = client.allocate_gpu(nodes=4, model="Llama-3-70B")

print("⚡ Allocated GPU Cluster:", cluster.status)`,
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "language", label: "Language Tag", type: "text" },
      { key: "code", label: "Code Content", type: "textarea" },
    ],
  },

  // ── 34. Tabbed Features Showcase ──────────────────────────────────────────
  {
    type: "tabbed_features",
    label: "Tabbed Features",
    icon: "📑",
    category: "interactive",
    defaultProps: {
      heading: "Everything Your Venture Needs to Scale",
      tabs: [
        { title: "NVIDIA GPU Lab", body: "High-performance compute clusters optimized for LLMs, computer vision, and deep learning training.", tag: "Infrastructure" },
        { title: "Legal & IP Advisory", body: "Dedicated patent attorneys and corporate legal counsel for company structuring and IP filing.", tag: "Support" },
        { title: "Investor Network", body: "Direct access to 50+ VCs, angel networks, and government grant schemes under SISFS.", tag: "Capital" },
      ],
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      {
        key: "tabs",
        label: "Feature Tabs",
        type: "repeater",
        repeaterAddLabel: "Add Feature Tab",
        repeaterFields: [
          { key: "title", label: "Tab Title", type: "text" },
          { key: "body", label: "Tab Description", type: "textarea" },
          { key: "tag", label: "Category Tag", type: "text" },
        ],
      },
    ],
  },

  // ── 35. Newsletter Subscription Card ──────────────────────────────────────
  {
    type: "newsletter",
    label: "Newsletter Subscribe",
    icon: "✉️",
    category: "interactive",
    defaultProps: {
      heading: "Subscribe to AIC Techno Insights",
      subtitle: "Get cohort announcements, grant updates, and deep-tech startup news delivered weekly.",
      buttonText: "Subscribe Now →",
      disclaimer: "We respect your privacy. Unsubscribe at any time.",
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "buttonText", label: "Button Text", type: "text" },
      { key: "disclaimer", label: "Privacy Disclaimer", type: "text" },
    ],
  },

  // ── 36. Executive Leader Spotlight ────────────────────────────────────────
  {
    type: "team_exec",
    label: "Executive Leader Spotlight",
    icon: "👑",
    category: "content",
    defaultProps: {
      name: "Prof. (Dr.) Anupam Basu",
      title: "Chairman, Advisory Board",
      organization: "AIC Techno Innovation and Incubation Council",
      bio: "Former Director of NIT Durgapur and esteemed Professor at IIT Kharagpur. Leading Eastern India's pioneer deep-tech incubation ecosystem.",
      quote: "Our mission is to cultivate world-class tech ventures that transform academic innovation into commercial market leaders.",
      photo: "",
      linkedin: "#",
    },
    fields: [
      { key: "name", label: "Leader Name", type: "text" },
      { key: "title", label: "Executive Title", type: "text" },
      { key: "organization", label: "Organization", type: "text" },
      { key: "bio", label: "Biography", type: "textarea" },
      { key: "quote", label: "Featured Quote", type: "textarea" },
      { key: "photo", label: "Photo URL", type: "image" },
      { key: "linkedin", label: "LinkedIn Profile", type: "url" },
    ],
  },

  // ── 37. Incubated Portfolio Grid ──────────────────────────────────────────
  {
    type: "portfolio_grid",
    label: "Incubated Portfolio",
    icon: "🚀",
    category: "media",
    defaultProps: {
      heading: "Our Incubated Ventures",
      subtitle: "High-growth deep-tech startups scaling across AI, Robotics, and MedTech.",
      startups: [
        { name: "NeuralVision AI", sector: "Computer Vision", stage: "Seed Funded (₹25L)", desc: "Autonomous industrial quality inspection powered by edge AI.", logo: "", link: "#" },
        { name: "AeroRobotics", sector: "Drone Technology", stage: "Pre-Series A", desc: "AI-driven agricultural mapping & surveillance drones.", logo: "", link: "#" },
      ],
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      {
        key: "startups",
        label: "Portfolio Startups",
        type: "repeater",
        repeaterAddLabel: "Add Startup Venture",
        repeaterFields: [
          { key: "name", label: "Startup Name", type: "text" },
          { key: "sector", label: "Sector / Domain", type: "text" },
          { key: "stage", label: "Funding Stage", type: "text" },
          { key: "desc", label: "Short Description", type: "textarea" },
          { key: "logo", label: "Logo Image", type: "image" },
          { key: "link", label: "Website Link", type: "url" },
        ],
      },
    ],
  },

  // ── 38. Custom Data Table ─────────────────────────────────────────────────
  {
    type: "table_data",
    label: "Data Table",
    icon: "📊",
    category: "content",
    defaultProps: {
      heading: "Cohort 2026 Milestone Schedule",
      columns: "Phase, Milestone, Timeline, Support",
      rows: [
        { col1: "Phase 1", col2: "Application & Deck Review", col3: "Month 1", col4: "Advisory Screening" },
        { col1: "Phase 2", col2: "Prototype Validation & GPU Lab", col3: "Months 2-3", col4: "₹10L Initial Grant" },
        { col1: "Phase 3", col2: "Commercialization & Demo Day", col3: "Months 4-6", col4: "₹15L Final Tranche" },
      ],
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "columns", label: "Table Headers (comma-separated)", type: "text" },
      {
        key: "rows",
        label: "Table Rows",
        type: "repeater",
        repeaterAddLabel: "Add Table Row",
        repeaterFields: [
          { key: "col1", label: "Column 1 Value", type: "text" },
          { key: "col2", label: "Column 2 Value", type: "text" },
          { key: "col3", label: "Column 3 Value", type: "text" },
          { key: "col4", label: "Column 4 Value", type: "text" },
        ],
      },
    ],
  },

  // ── 39. Cohort Deadline Countdown ─────────────────────────────────────────
  {
    type: "countdown",
    label: "Countdown Timer",
    icon: "⏳",
    category: "interactive",
    defaultProps: {
      heading: "Cohort 2026 Applications Closing Soon",
      subtitle: "Don't miss the chance to secure up to ₹25 Lakhs seed funding.",
      days: "14",
      hours: "08",
      minutes: "45",
      seconds: "12",
      buttonText: "Apply Before Deadline →",
      buttonUrl: "#apply",
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "days", label: "Days", type: "text" },
      { key: "hours", label: "Hours", type: "text" },
      { key: "minutes", label: "Minutes", type: "text" },
      { key: "seconds", label: "Seconds", type: "text" },
      { key: "buttonText", label: "Button Text", type: "text" },
      { key: "buttonUrl", label: "Button Link", type: "url" },
    ],
  },

  // ── 40. Video Background Hero ─────────────────────────────────────────────
  {
    type: "hero_video_bg",
    label: "Video Background Hero",
    icon: "🎥",
    category: "layout",
    defaultProps: {
      badge: "ATAL INCUBATION CENTRE",
      title: "Pioneering Deep-Tech & AI Innovation",
      subtitle: "West Bengal's premier incubator empowering founders with GPU labs, seed capital, and global market access.",
      buttonText: "Explore Cohort",
      buttonUrl: "#about",
      secondaryButtonText: "Watch Film 🎬",
      secondaryButtonUrl: "#video",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-network-lines-movement-31608-large.mp4",
    },
    fields: [
      { key: "badge", label: "Badge Tag", type: "text" },
      { key: "title", label: "Hero Title", type: "text" },
      { key: "subtitle", label: "Hero Subtitle", type: "textarea" },
      { key: "buttonText", label: "Primary Button Text", type: "text" },
      { key: "buttonUrl", label: "Primary Button Link", type: "url" },
      { key: "secondaryButtonText", label: "Secondary Button Text", type: "text" },
      { key: "secondaryButtonUrl", label: "Secondary Button Link", type: "url" },
      { key: "videoUrl", label: "Background Video URL (.mp4)", type: "url" },
    ],
  },
];

// ─── Lookup helpers ──────────────────────────────────────────────────────────

export function getComponentDef(type: string): ComponentDef | undefined {
  return COMPONENT_REGISTRY.find((c) => c.type === type);
}

export const COMPONENT_CATEGORIES: {
  id: ComponentCategory;
  label: string;
  icon: string;
}[] = [
  { id: "layout",      label: "Layout",      icon: "📐" },
  { id: "content",     label: "Content",     icon: "📝" },
  { id: "media",       label: "Media",       icon: "🖼️" },
  { id: "interactive", label: "Interactive", icon: "⚡" },
];
