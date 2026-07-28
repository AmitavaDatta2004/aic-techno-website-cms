// src/lib/components/renderers.ts
// HTML string renderers for every component type in the Page Builder.
// These renderers are used by the Canvas preview and by page.html on the
// static website to produce identical output.

import type { ComponentDef } from "./registry";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PageComponent {
  id: string;
  type: string;
  order: number;
  visible: boolean;
  props: Record<string, unknown>;
}

// ─── Shared Helpers ───────────────────────────────────────────────────────────

function esc(val: unknown): string {
  if (val === null || val === undefined) return "";
  return String(val)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function str(val: unknown, fallback = ""): string {
  return val ? String(val) : fallback;
}

function arr<T>(val: unknown): T[] {
  return Array.isArray(val) ? (val as T[]) : [];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

// ─── Individual Renderers ─────────────────────────────────────────────────────

function renderHero(props: Record<string, unknown>): string {
  const heightMap: Record<string, string> = {
    small: "50vh",
    medium: "65vh",
    large: "80vh",
    fullscreen: "100vh",
  };
  const height = heightMap[str(props.height, "large")] ?? "80vh";
  const align = str(props.alignment, "center");
  const opacity = Number(props.overlayOpacity ?? 0.55);
  const bg = props.backgroundImage
    ? `url('${esc(props.backgroundImage)}') center/cover no-repeat`
    : "linear-gradient(135deg, #0A0A0F 0%, #1a0a1f 50%, #0A0A0F 100%)";

  return `
<section class="pb-hero" style="
  min-height:${height};
  background:${bg};
  display:flex;
  align-items:center;
  justify-content:center;
  position:relative;
  overflow:hidden;
">
  <div class="pb-hero-overlay" style="
    position:absolute;inset:0;
    background:rgba(0,0,0,${opacity});
  "></div>
  <div class="pb-container" style="position:relative;z-index:2;text-align:${align};padding:4rem 2rem;">
    <h1 class="pb-hero-title">${esc(props.title)}</h1>
    ${props.subtitle ? `<p class="pb-hero-sub">${esc(props.subtitle)}</p>` : ""}
    <div class="pb-btn-group" style="justify-content:${align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start"}">
      ${props.buttonText ? `<a class="pb-btn-primary" href="${esc(props.buttonUrl) || "#"}">${esc(props.buttonText)}</a>` : ""}
      ${props.secondaryButtonText ? `<a class="pb-btn-secondary" href="${esc(props.secondaryButtonUrl) || "#"}">${esc(props.secondaryButtonText)}</a>` : ""}
    </div>
  </div>
</section>`;
}

function renderAbout(props: Record<string, unknown>): string {
  const imageLeft = str(props.imagePosition, "right") === "left";
  const imgHtml = props.image
    ? `<div class="pb-about-img-wrap"><img src="${esc(props.image)}" alt="${esc(props.heading)}" class="pb-about-img"></div>`
    : `<div class="pb-about-img-wrap pb-img-placeholder">📷</div>`;
  const textHtml = `
    <div class="pb-about-text">
      ${props.tag ? `<div class="pb-sec-tag">${esc(props.tag)}</div>` : ""}
      <h2 class="pb-sec-h">${esc(props.heading)}</h2>
      <p class="pb-sec-p">${esc(props.body)}</p>
    </div>`;
  return `
<section class="pb-section pb-section-light">
  <div class="pb-container pb-two-col" style="flex-direction:${imageLeft ? "row" : "row-reverse"}">
    ${imgHtml}
    ${textHtml}
  </div>
</section>`;
}

function renderImageText(props: Record<string, unknown>): string {
  const imageLeft = str(props.layout, "image-left") === "image-left";
  const imgHtml = props.image
    ? `<div class="pb-about-img-wrap"><img src="${esc(props.image)}" alt="${esc(props.heading)}" class="pb-about-img"></div>`
    : `<div class="pb-about-img-wrap pb-img-placeholder">🖼️</div>`;
  return `
<section class="pb-section pb-section-dark">
  <div class="pb-container pb-two-col" style="flex-direction:${imageLeft ? "row" : "row-reverse"}">
    ${imgHtml}
    <div class="pb-about-text">
      <h2 class="pb-sec-h pb-light">${esc(props.heading)}</h2>
      <p class="pb-sec-p pb-light">${esc(props.body)}</p>
      ${props.buttonText ? `<a class="pb-btn-primary" href="${esc(props.buttonUrl) || "#"}">${esc(props.buttonText)}</a>` : ""}
    </div>
  </div>
</section>`;
}

function renderFeatures(props: Record<string, unknown>): string {
  const cards = arr<{ icon?: string; title?: string; body?: string }>(props.cards);
  return `
<section class="pb-section pb-section-dark">
  <div class="pb-container">
    <div class="pb-sec-header">
      <h2 class="pb-sec-h pb-light">${esc(props.heading)}</h2>
      ${props.subtitle ? `<p class="pb-sec-p pb-light">${esc(props.subtitle)}</p>` : ""}
    </div>
    <div class="pb-grid-3">
      ${cards.map(c => `
      <div class="pb-card">
        <div class="pb-card-icon">${esc(c.icon) || "✨"}</div>
        <div class="pb-card-title">${esc(c.title)}</div>
        <p class="pb-card-body">${esc(c.body)}</p>
      </div>`).join("")}
    </div>
  </div>
</section>`;
}

function renderServices(props: Record<string, unknown>): string {
  const cards = arr<{ icon?: string; title?: string; body?: string; link?: string }>(props.cards);
  return `
<section class="pb-section pb-section-light">
  <div class="pb-container">
    <div class="pb-sec-header">
      <h2 class="pb-sec-h">${esc(props.heading)}</h2>
      ${props.subtitle ? `<p class="pb-sec-p">${esc(props.subtitle)}</p>` : ""}
    </div>
    <div class="pb-grid-3">
      ${cards.map(c => `
      <div class="pb-card pb-card-light">
        <div class="pb-card-icon">${esc(c.icon) || "🛠️"}</div>
        <div class="pb-card-title pb-dark">${esc(c.title)}</div>
        <p class="pb-card-body pb-dark-sub">${esc(c.body)}</p>
        ${c.link ? `<a class="pb-card-link" href="${esc(c.link)}">Learn More →</a>` : ""}
      </div>`).join("")}
    </div>
  </div>
</section>`;
}

function renderCards(props: Record<string, unknown>): string {
  const items = arr<{ image?: string; title?: string; body?: string; link?: string }>(props.items);
  return `
<section class="pb-section pb-section-dark">
  <div class="pb-container">
    <div class="pb-sec-header">
      <h2 class="pb-sec-h pb-light">${esc(props.heading)}</h2>
      ${props.subtitle ? `<p class="pb-sec-p pb-light">${esc(props.subtitle)}</p>` : ""}
    </div>
    <div class="pb-grid-3">
      ${items.map(item => `
      <div class="pb-img-card">
        ${item.image
          ? `<div class="pb-img-card-img"><img src="${esc(item.image)}" alt="${esc(item.title)}"></div>`
          : `<div class="pb-img-card-img pb-img-placeholder-sm">🃏</div>`}
        <div class="pb-img-card-body">
          <div class="pb-card-title pb-light">${esc(item.title)}</div>
          <p class="pb-card-body pb-light-sub">${esc(item.body)}</p>
          ${item.link ? `<a class="pb-card-link pb-light-link" href="${esc(item.link)}">View →</a>` : ""}
        </div>
      </div>`).join("")}
    </div>
  </div>
</section>`;
}

function renderStatistics(props: Record<string, unknown>): string {
  const stats = arr<{ value?: string; label?: string }>(props.stats);
  return `
<section class="pb-section pb-section-maroon">
  <div class="pb-container pb-center">
    <h2 class="pb-sec-h pb-light">${esc(props.heading)}</h2>
    <div class="pb-stats-grid">
      ${stats.map(s => `
      <div class="pb-stat">
        <div class="pb-stat-value">${esc(s.value)}</div>
        <div class="pb-stat-label">${esc(s.label)}</div>
      </div>`).join("")}
    </div>
  </div>
</section>`;
}

function renderTimeline(props: Record<string, unknown>): string {
  const events = arr<{ date?: string; title?: string; body?: string }>(props.events);
  return `
<section class="pb-section pb-section-light">
  <div class="pb-container pb-center">
    <h2 class="pb-sec-h">${esc(props.heading)}</h2>
    <div class="pb-timeline">
      ${events.map((e, i) => `
      <div class="pb-timeline-item ${i % 2 === 0 ? "pb-tl-left" : "pb-tl-right"}">
        <div class="pb-timeline-dot"></div>
        <div class="pb-timeline-card">
          <div class="pb-timeline-date">${esc(e.date)}</div>
          <div class="pb-timeline-title">${esc(e.title)}</div>
          <p class="pb-timeline-body">${esc(e.body)}</p>
        </div>
      </div>`).join("")}
    </div>
  </div>
</section>`;
}

function renderTeam(props: Record<string, unknown>): string {
  const members = arr<{ name?: string; role?: string; photo?: string; bio?: string; linkedin?: string }>(props.members);
  return `
<section class="pb-section pb-section-dark">
  <div class="pb-container">
    <div class="pb-sec-header">
      <h2 class="pb-sec-h pb-light">${esc(props.heading)}</h2>
      ${props.subtitle ? `<p class="pb-sec-p pb-light">${esc(props.subtitle)}</p>` : ""}
    </div>
    <div class="pb-grid-4">
      ${members.map(m => `
      <div class="pb-person-card">
        <div class="pb-person-avatar">
          <span class="pb-person-initials">${initials(str(m.name, "?"))}</span>
          ${m.photo ? `<img src="${esc(m.photo)}" alt="${esc(m.name)}">` : ""}
        </div>
        <div class="pb-person-name">${esc(m.name)}</div>
        <div class="pb-person-role">${esc(m.role)}</div>
        ${m.bio ? `<p class="pb-person-bio">${esc(m.bio)}</p>` : ""}
        ${m.linkedin ? `<a class="pb-linkedin" href="${esc(m.linkedin)}" target="_blank" rel="noopener">LinkedIn ↗</a>` : ""}
      </div>`).join("")}
    </div>
  </div>
</section>`;
}

function renderMentors(props: Record<string, unknown>): string {
  // Same structure as team but with slightly different card style
  const members = arr<{ name?: string; role?: string; photo?: string; linkedin?: string }>(props.members);
  return `
<section class="pb-section pb-section-light">
  <div class="pb-container">
    <div class="pb-sec-header">
      <h2 class="pb-sec-h">${esc(props.heading)}</h2>
      ${props.subtitle ? `<p class="pb-sec-p">${esc(props.subtitle)}</p>` : ""}
    </div>
    <div class="pb-grid-4">
      ${members.map(m => `
      <div class="pb-person-card pb-person-card-light">
        <div class="pb-person-avatar pb-avatar-maroon">
          <span class="pb-person-initials">${initials(str(m.name, "?"))}</span>
          ${m.photo ? `<img src="${esc(m.photo)}" alt="${esc(m.name)}">` : ""}
        </div>
        <div class="pb-person-name pb-dark">${esc(m.name)}</div>
        <div class="pb-person-role pb-dark-sub">${esc(m.role)}</div>
        ${m.linkedin ? `<a class="pb-linkedin pb-linkedin-dark" href="${esc(m.linkedin)}" target="_blank" rel="noopener">LinkedIn ↗</a>` : ""}
      </div>`).join("")}
    </div>
  </div>
</section>`;
}

function renderTestimonials(props: Record<string, unknown>): string {
  const items = arr<{ quote?: string; author?: string; role?: string; photo?: string }>(props.items);
  return `
<section class="pb-section pb-section-dark">
  <div class="pb-container">
    <div class="pb-sec-header">
      <h2 class="pb-sec-h pb-light">${esc(props.heading)}</h2>
    </div>
    <div class="pb-grid-2">
      ${items.map(t => `
      <div class="pb-testimonial">
        <div class="pb-quote-mark">"</div>
        <p class="pb-quote-text">${esc(t.quote)}</p>
        <div class="pb-quote-author">
          ${t.photo
            ? `<img src="${esc(t.photo)}" alt="${esc(t.author)}" class="pb-quote-photo">`
            : `<div class="pb-quote-avatar">${initials(str(t.author, "?"))}</div>`}
          <div>
            <div class="pb-quote-name">${esc(t.author)}</div>
            <div class="pb-quote-role">${esc(t.role)}</div>
          </div>
        </div>
      </div>`).join("")}
    </div>
  </div>
</section>`;
}

function renderGallery(props: Record<string, unknown>): string {
  const images = arr<{ url?: string; alt?: string; caption?: string }>(props.images);
  const cols = Math.max(2, Math.min(5, Number(props.columns ?? 3)));
  return `
<section class="pb-section pb-section-light">
  <div class="pb-container">
    <h2 class="pb-sec-h">${esc(props.heading)}</h2>
    <div class="pb-gallery" style="columns:${cols};column-gap:16px;">
      ${images.map(img => `
      <div class="pb-gallery-item">
        <img src="${esc(img.url)}" alt="${esc(img.alt) || esc(props.heading)}" loading="lazy">
        ${img.caption ? `<p class="pb-gallery-caption">${esc(img.caption)}</p>` : ""}
      </div>`).join("")}
      ${images.length === 0 ? `<div class="pb-gallery-empty">No images added yet</div>` : ""}
    </div>
  </div>
</section>`;
}

function renderFaq(props: Record<string, unknown>): string {
  const items = arr<{ question?: string; answer?: string }>(props.items);
  return `
<section class="pb-section pb-section-dark">
  <div class="pb-container pb-narrow">
    <h2 class="pb-sec-h pb-light pb-center">${esc(props.heading)}</h2>
    <div class="pb-faq">
      ${items.map((item, i) => `
      <div class="pb-faq-item" id="faq-${i}">
        <button class="pb-faq-q" onclick="pbToggleFaq(${i})">
          ${esc(item.question)}
          <span class="pb-faq-arrow">▾</span>
        </button>
        <div class="pb-faq-a" id="faq-a-${i}">${esc(item.answer)}</div>
      </div>`).join("")}
    </div>
  </div>
</section>`;
}

function renderContactForm(props: Record<string, unknown>): string {
  return `
<section class="pb-section pb-section-light">
  <div class="pb-container pb-narrow pb-center">
    <h2 class="pb-sec-h">${esc(props.heading)}</h2>
    ${props.subtitle ? `<p class="pb-sec-p">${esc(props.subtitle)}</p>` : ""}
    <form class="pb-form" action="mailto:${esc(props.email)}" method="get" enctype="text/plain">
      <div class="pb-form-row">
        <input class="pb-form-input" type="text" name="name" placeholder="Your Name" required>
        <input class="pb-form-input" type="email" name="email" placeholder="Your Email" required>
      </div>
      <input class="pb-form-input" type="text" name="subject" placeholder="Subject">
      <textarea class="pb-form-input pb-form-textarea" name="body" placeholder="Your Message" rows="5" required></textarea>
      <button class="pb-btn-primary" type="submit">Send Message →</button>
    </form>
  </div>
</section>`;
}

function renderCta(props: Record<string, unknown>): string {
  const bg = str(props.background, "maroon");
  const bgStyle =
    bg === "maroon"
      ? "background:linear-gradient(135deg,#800020 0%,#5a0017 100%)"
      : bg === "dark"
      ? "background:linear-gradient(135deg,#0A0A0F 0%,#1a0a1f 100%)"
      : "background:#f8f9fa";
  const textClass = bg === "light" ? "" : "pb-light";
  return `
<section class="pb-section" style="${bgStyle}">
  <div class="pb-container pb-center">
    <h2 class="pb-sec-h ${textClass}">${esc(props.heading)}</h2>
    ${props.subtitle ? `<p class="pb-sec-p ${textClass}">${esc(props.subtitle)}</p>` : ""}
    <div class="pb-btn-group pb-center-row">
      ${props.primaryText ? `<a class="pb-btn-primary pb-btn-white" href="${esc(props.primaryUrl) || "#"}">${esc(props.primaryText)}</a>` : ""}
      ${props.secondaryText ? `<a class="pb-btn-ghost" href="${esc(props.secondaryUrl) || "#"}">${esc(props.secondaryText)}</a>` : ""}
    </div>
  </div>
</section>`;
}

function renderFooter(props: Record<string, unknown>): string {
  const links = arr<{ label?: string; url?: string }>(props.links);
  return `
<footer class="pb-footer">
  <div class="pb-container">
    <div class="pb-footer-inner">
      <div>
        <div class="pb-footer-logo">${esc(props.logo)}</div>
        ${props.tagline ? `<div class="pb-footer-tagline">${esc(props.tagline)}</div>` : ""}
      </div>
      <nav class="pb-footer-nav">
        ${links.map(l => `<a href="${esc(l.url) || "#"}">${esc(l.label)}</a>`).join("")}
      </nav>
    </div>
    <div class="pb-footer-copy">${esc(props.copyright)}</div>
  </div>
</footer>`;
}

// ─── Renderer Map ─────────────────────────────────────────────────────────────

const RENDERERS: Record<string, (props: Record<string, unknown>) => string> = {
  hero:         renderHero,
  about:        renderAbout,
  image_text:   renderImageText,
  features:     renderFeatures,
  services:     renderServices,
  cards:        renderCards,
  statistics:   renderStatistics,
  timeline:     renderTimeline,
  team:         renderTeam,
  mentors:      renderMentors,
  testimonials: renderTestimonials,
  gallery:      renderGallery,
  faq:          renderFaq,
  contact_form: renderContactForm,
  cta:          renderCta,
  footer:       renderFooter,
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Render a single component to an HTML string.
 * Returns empty string for unknown types (silent skip).
 */
export function renderComponent(component: PageComponent): string {
  if (!component.visible) return "";
  const renderer = RENDERERS[component.type];
  if (!renderer) return "";
  try {
    return renderer(component.props);
  } catch {
    return `<!-- Error rendering component type: ${component.type} -->`;
  }
}

/**
 * Render all visible components for a page, sorted by order.
 */
export function renderPage(components: PageComponent[]): string {
  return [...components]
    .filter((c) => c.visible)
    .sort((a, b) => a.order - b.order)
    .map(renderComponent)
    .join("\n");
}

/**
 * The CSS that must be included alongside rendered HTML.
 * Include this once in the <head> of any page that uses these renderers.
 */
export const PAGE_BUILDER_CSS = `/* Page Builder Components CSS */`;

export type { ComponentDef };
