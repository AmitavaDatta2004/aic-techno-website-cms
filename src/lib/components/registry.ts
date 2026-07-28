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

  // ── 16. Footer ─────────────────────────────────────────────────────────────
  {
    type: "footer",
    label: "Footer",
    icon: "🔻",
    category: "layout",
    defaultProps: {
      logo: "AIC Techno",
      tagline: "West Bengal's First Atal Incubation Centre",
      links: [
        { label: "Home", url: "/" },
        { label: "About", url: "#about" },
        { label: "Apply", url: "#apply" },
        { label: "Contact", url: "mailto:contact@aic-techno.com" },
      ],
      copyright: `© ${new Date().getFullYear()} AIC Techno Innovation and Incubation Council. All rights reserved.`,
    },
    fields: [
      { key: "logo", label: "Logo Text", type: "text" },
      { key: "tagline", label: "Tagline", type: "text" },
      {
        key: "links",
        label: "Links",
        type: "repeater",
        repeaterAddLabel: "Add Link",
        repeaterFields: [
          { key: "label", label: "Link Label", type: "text" },
          { key: "url", label: "Link URL", type: "url" },
        ],
      },
      { key: "copyright", label: "Copyright Text", type: "text" },
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
