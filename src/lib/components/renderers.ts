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
    <h1 class="pb-hero-title" data-prop="title">${esc(props.title)}</h1>
    ${props.subtitle ? `<p class="pb-hero-sub" data-prop="subtitle">${esc(props.subtitle)}</p>` : ""}
    <div class="pb-btn-group" style="justify-content:${align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start"}">
      ${props.buttonText ? `<a class="pb-btn-primary" data-prop="buttonText" href="${esc(props.buttonUrl) || "#"}">${esc(props.buttonText)}</a>` : ""}
      ${props.secondaryButtonText ? `<a class="pb-btn-secondary" data-prop="secondaryButtonText" href="${esc(props.secondaryButtonUrl) || "#"}">${esc(props.secondaryButtonText)}</a>` : ""}
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
      ${props.tag ? `<div class="pb-sec-tag" data-prop="tag">${esc(props.tag)}</div>` : ""}
      <h2 class="pb-sec-h" data-prop="heading">${esc(props.heading)}</h2>
      <p class="pb-sec-p" data-prop="body">${esc(props.body)}</p>
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
      <h2 class="pb-sec-h pb-light" data-prop="heading">${esc(props.heading)}</h2>
      <p class="pb-sec-p pb-light" data-prop="body">${esc(props.body)}</p>
      ${props.buttonText ? `<a class="pb-btn-primary" data-prop="buttonText" href="${esc(props.buttonUrl) || "#"}">${esc(props.buttonText)}</a>` : ""}
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
      <h2 class="pb-sec-h pb-light" data-prop="heading">${esc(props.heading)}</h2>
      ${props.subtitle ? `<p class="pb-sec-p pb-light" data-prop="subtitle">${esc(props.subtitle)}</p>` : ""}
    </div>
    <div class="pb-grid-3">
      ${cards.map((c, idx) => `
      <div class="pb-card">
        <div class="pb-card-icon" data-array-prop="cards" data-array-idx="${idx}" data-field="icon">${esc(c.icon) || "✨"}</div>
        <div class="pb-card-title" data-array-prop="cards" data-array-idx="${idx}" data-field="title">${esc(c.title)}</div>
        <p class="pb-card-body" data-array-prop="cards" data-array-idx="${idx}" data-field="body">${esc(c.body)}</p>
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
      <h2 class="pb-sec-h" data-prop="heading">${esc(props.heading)}</h2>
      ${props.subtitle ? `<p class="pb-sec-p" data-prop="subtitle">${esc(props.subtitle)}</p>` : ""}
    </div>
    <div class="pb-grid-3">
      ${cards.map((c, idx) => `
      <div class="pb-card pb-card-light">
        <div class="pb-card-icon" data-array-prop="cards" data-array-idx="${idx}" data-field="icon">${esc(c.icon) || "🛠️"}</div>
        <div class="pb-card-title pb-dark" data-array-prop="cards" data-array-idx="${idx}" data-field="title">${esc(c.title)}</div>
        <p class="pb-card-body pb-dark-sub" data-array-prop="cards" data-array-idx="${idx}" data-field="body">${esc(c.body)}</p>
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
      <h2 class="pb-sec-h pb-light" data-prop="heading">${esc(props.heading)}</h2>
      ${props.subtitle ? `<p class="pb-sec-p pb-light" data-prop="subtitle">${esc(props.subtitle)}</p>` : ""}
    </div>
    <div class="pb-grid-3">
      ${items.map((item, idx) => `
      <div class="pb-img-card">
        ${item.image
          ? `<div class="pb-img-card-img"><img src="${esc(item.image)}" alt="${esc(item.title)}"></div>`
          : `<div class="pb-img-card-img pb-img-placeholder-sm">🃏</div>`}
        <div class="pb-img-card-body">
          <div class="pb-card-title pb-light" data-array-prop="items" data-array-idx="${idx}" data-field="title">${esc(item.title)}</div>
          <p class="pb-card-body pb-light-sub" data-array-prop="items" data-array-idx="${idx}" data-field="body">${esc(item.body)}</p>
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
    <h2 class="pb-sec-h pb-light" data-prop="heading">${esc(props.heading)}</h2>
    <div class="pb-stats-grid">
      ${stats.map((s, idx) => `
      <div class="pb-stat">
        <div class="pb-stat-value" data-array-prop="stats" data-array-idx="${idx}" data-field="value">${esc(s.value)}</div>
        <div class="pb-stat-label" data-array-prop="stats" data-array-idx="${idx}" data-field="label">${esc(s.label)}</div>
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
    <h2 class="pb-sec-h" data-prop="heading">${esc(props.heading)}</h2>
    <div class="pb-timeline">
      ${events.map((e, idx) => `
      <div class="pb-timeline-item ${idx % 2 === 0 ? "pb-tl-left" : "pb-tl-right"}">
        <div class="pb-timeline-dot"></div>
        <div class="pb-timeline-card">
          <div class="pb-timeline-date" data-array-prop="events" data-array-idx="${idx}" data-field="date">${esc(e.date)}</div>
          <div class="pb-timeline-title" data-array-prop="events" data-array-idx="${idx}" data-field="title">${esc(e.title)}</div>
          <p class="pb-timeline-body" data-array-prop="events" data-array-idx="${idx}" data-field="body">${esc(e.body)}</p>
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
      <h2 class="pb-sec-h pb-light" data-prop="heading">${esc(props.heading)}</h2>
      ${props.subtitle ? `<p class="pb-sec-p pb-light" data-prop="subtitle">${esc(props.subtitle)}</p>` : ""}
    </div>
    <div class="pb-grid-4">
      ${members.map((m, idx) => `
      <div class="pb-person-card">
        <div class="pb-person-avatar">
          <span class="pb-person-initials">${initials(str(m.name, "?"))}</span>
          ${m.photo ? `<img src="${esc(m.photo)}" alt="${esc(m.name)}">` : ""}
        </div>
        <div class="pb-person-name" data-array-prop="members" data-array-idx="${idx}" data-field="name">${esc(m.name)}</div>
        <div class="pb-person-role" data-array-prop="members" data-array-idx="${idx}" data-field="role">${esc(m.role)}</div>
        ${m.bio ? `<p class="pb-person-bio" data-array-prop="members" data-array-idx="${idx}" data-field="bio">${esc(m.bio)}</p>` : ""}
        ${m.linkedin ? `<a class="pb-linkedin" href="${esc(m.linkedin)}" target="_blank" rel="noopener">LinkedIn ↗</a>` : ""}
      </div>`).join("")}
    </div>
  </div>
</section>`;
}

function renderMentors(props: Record<string, unknown>): string {
  const members = arr<{ name?: string; role?: string; photo?: string; linkedin?: string }>(props.members);
  return `
<section class="pb-section pb-section-light">
  <div class="pb-container">
    <div class="pb-sec-header">
      <h2 class="pb-sec-h" data-prop="heading">${esc(props.heading)}</h2>
      ${props.subtitle ? `<p class="pb-sec-p" data-prop="subtitle">${esc(props.subtitle)}</p>` : ""}
    </div>
    <div class="pb-grid-4">
      ${members.map((m, idx) => `
      <div class="pb-person-card pb-person-card-light">
        <div class="pb-person-avatar pb-avatar-maroon">
          <span class="pb-person-initials">${initials(str(m.name, "?"))}</span>
          ${m.photo ? `<img src="${esc(m.photo)}" alt="${esc(m.name)}">` : ""}
        </div>
        <div class="pb-person-name pb-dark" data-array-prop="members" data-array-idx="${idx}" data-field="name">${esc(m.name)}</div>
        <div class="pb-person-role pb-dark-sub" data-array-prop="members" data-array-idx="${idx}" data-field="role">${esc(m.role)}</div>
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
      <h2 class="pb-sec-h pb-light" data-prop="heading">${esc(props.heading)}</h2>
    </div>
    <div class="pb-grid-2">
      ${items.map((t, idx) => `
      <div class="pb-testimonial">
        <div class="pb-quote-mark">"</div>
        <p class="pb-quote-text" data-array-prop="items" data-array-idx="${idx}" data-field="quote">${esc(t.quote)}</p>
        <div class="pb-quote-author">
          ${t.photo
            ? `<img src="${esc(t.photo)}" alt="${esc(t.author)}" class="pb-quote-photo">`
            : `<div class="pb-quote-avatar">${initials(str(t.author, "?"))}</div>`}
          <div>
            <div class="pb-quote-name" data-array-prop="items" data-array-idx="${idx}" data-field="author">${esc(t.author)}</div>
            <div class="pb-quote-role" data-array-prop="items" data-array-idx="${idx}" data-field="role">${esc(t.role)}</div>
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
    <h2 class="pb-sec-h" data-prop="heading">${esc(props.heading)}</h2>
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
    <h2 class="pb-sec-h pb-light pb-center" data-prop="heading">${esc(props.heading)}</h2>
    <div class="pb-faq">
      ${items.map((item, idx) => `
      <div class="pb-faq-item" id="faq-${idx}">
        <button class="pb-faq-q">
          <span data-array-prop="items" data-array-idx="${idx}" data-field="question">${esc(item.question)}</span>
          <span class="pb-faq-arrow">▾</span>
        </button>
        <div class="pb-faq-a" id="faq-a-${idx}" data-array-prop="items" data-array-idx="${idx}" data-field="answer">${esc(item.answer)}</div>
      </div>`).join("")}
    </div>
  </div>
</section>`;
}

function renderContactForm(props: Record<string, unknown>): string {
  return `
<section class="pb-section pb-section-light">
  <div class="pb-container pb-narrow pb-center">
    <h2 class="pb-sec-h" data-prop="heading">${esc(props.heading)}</h2>
    ${props.subtitle ? `<p class="pb-sec-p" data-prop="subtitle">${esc(props.subtitle)}</p>` : ""}
    <form class="pb-form" action="mailto:${esc(props.email)}" method="get" enctype="text/plain">
      <div class="pb-form-row">
        <input class="pb-form-input" type="text" name="name" placeholder="Your Name" required>
        <input class="pb-form-input" type="email" name="email" placeholder="Your Email" required>
      </div>
      <input class="pb-form-input" type="text" name="subject" placeholder="Subject">
      <textarea class="pb-form-input pb-form-textarea" name="body" placeholder="Your Message" rows="5" required></textarea>
      <button class="pb-btn-primary" type="submit" data-prop="submitButtonText">Send Message →</button>
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
    <h2 class="pb-sec-h ${textClass}" data-prop="heading">${esc(props.heading)}</h2>
    ${props.subtitle ? `<p class="pb-sec-p ${textClass}" data-prop="subtitle">${esc(props.subtitle)}</p>` : ""}
    <div class="pb-btn-group pb-center-row">
      ${props.primaryText ? `<a class="pb-btn-primary pb-btn-white" data-prop="primaryText" href="${esc(props.primaryUrl) || "#"}">${esc(props.primaryText)}</a>` : ""}
      ${props.secondaryText ? `<a class="pb-btn-ghost" data-prop="secondaryText" href="${esc(props.secondaryUrl) || "#"}">${esc(props.secondaryText)}</a>` : ""}
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
        <div class="pb-footer-logo" data-prop="logo">${esc(props.logo)}</div>
        ${props.tagline ? `<div class="pb-footer-tagline" data-prop="tagline">${esc(props.tagline)}</div>` : ""}
      </div>
      <nav class="pb-footer-nav">
        ${links.map(l => `<a href="${esc(l.url) || "#"}">${esc(l.label)}</a>`).join("")}
      </nav>
    </div>
    <div class="pb-footer-copy" data-prop="copyright">${esc(props.copyright)}</div>
  </div>
</footer>`;
}

function renderPricing(props: Record<string, unknown>): string {
  const plans = arr<{
    name?: string;
    price?: string;
    period?: string;
    description?: string;
    features?: string;
    buttonText?: string;
    buttonUrl?: string;
    popular?: boolean;
  }>(props.plans);

  return `
<section class="pb-section pb-section-dark">
  <div class="pb-container">
    <div class="pb-sec-header">
      <h2 class="pb-sec-h pb-light" data-prop="heading">${esc(props.heading)}</h2>
      ${props.subtitle ? `<p class="pb-sec-p pb-light" data-prop="subtitle">${esc(props.subtitle)}</p>` : ""}
    </div>
    <div class="pb-grid-2" style="max-width:840px;margin:0 auto;">
      ${plans.map((p, idx) => {
        const featList = str(p.features, "").split(",").map(f => f.trim()).filter(Boolean);
        return `
        <div class="pb-pricing-card ${p.popular ? "pb-pricing-popular" : ""}">
          ${p.popular ? `<span class="pb-pricing-badge">MOST POPULAR</span>` : ""}
          <h3 class="pb-pricing-name" data-array-prop="plans" data-array-idx="${idx}" data-field="name">${esc(p.name)}</h3>
          <div class="pb-pricing-price-wrap">
            <span class="pb-pricing-price" data-array-prop="plans" data-array-idx="${idx}" data-field="price">${esc(p.price)}</span>
            <span class="pb-pricing-period" data-array-prop="plans" data-array-idx="${idx}" data-field="period">${esc(p.period)}</span>
          </div>
          <p class="pb-pricing-desc" data-array-prop="plans" data-array-idx="${idx}" data-field="description">${esc(p.description)}</p>
          <ul class="pb-pricing-feats">
            ${featList.map(f => `<li>✓ ${esc(f)}</li>`).join("")}
          </ul>
          ${p.buttonText ? `<a class="pb-btn-primary ${p.popular ? "" : "pb-btn-ghost"}" data-array-prop="plans" data-array-idx="${idx}" data-field="buttonText" href="${esc(p.buttonUrl) || "#"}">${esc(p.buttonText)}</a>` : ""}
        </div>`;
      }).join("")}
    </div>
  </div>
</section>`;
}

function renderLogos(props: Record<string, unknown>): string {
  const logos = arr<{ name?: string; image?: string; link?: string }>(props.logos);
  return `
<section class="pb-section pb-section-light">
  <div class="pb-container pb-center">
    <h2 class="pb-sec-h" data-prop="heading">${esc(props.heading)}</h2>
    ${props.subtitle ? `<p class="pb-sec-p" data-prop="subtitle">${esc(props.subtitle)}</p>` : ""}
    <div class="pb-logos-row">
      ${logos.map((l, idx) => `
      <a class="pb-logo-item" href="${esc(l.link) || "#"}" target="_blank" rel="noopener">
        ${l.image ? `<img src="${esc(l.image)}" alt="${esc(l.name)}">` : `<span data-array-prop="logos" data-array-idx="${idx}" data-field="name">${esc(l.name)}</span>`}
      </a>`).join("")}
    </div>
  </div>
</section>`;
}

function renderNewsGrid(props: Record<string, unknown>): string {
  const articles = arr<{ title?: string; date?: string; category?: string; excerpt?: string; image?: string; link?: string }>(props.articles);
  return `
<section class="pb-section pb-section-dark">
  <div class="pb-container">
    <div class="pb-sec-header">
      <h2 class="pb-sec-h pb-light" data-prop="heading">${esc(props.heading)}</h2>
      ${props.subtitle ? `<p class="pb-sec-p pb-light" data-prop="subtitle">${esc(props.subtitle)}</p>` : ""}
    </div>
    <div class="pb-grid-2">
      ${articles.map((art, idx) => `
      <div class="pb-news-card">
        ${art.image ? `<div class="pb-news-img"><img src="${esc(art.image)}" alt="${esc(art.title)}"></div>` : ""}
        <div class="pb-news-content">
          <div class="pb-news-meta">
            <span class="pb-sec-tag" data-array-prop="articles" data-array-idx="${idx}" data-field="category">${esc(art.category)}</span>
            <span class="pb-news-date" data-array-prop="articles" data-array-idx="${idx}" data-field="date">${esc(art.date)}</span>
          </div>
          <h3 class="pb-card-title pb-light" data-array-prop="articles" data-array-idx="${idx}" data-field="title">${esc(art.title)}</h3>
          <p class="pb-card-body pb-light-sub" data-array-prop="articles" data-array-idx="${idx}" data-field="excerpt">${esc(art.excerpt)}</p>
          ${art.link ? `<a class="pb-card-link pb-light-link" href="${esc(art.link)}">Read Article →</a>` : ""}
        </div>
      </div>`).join("")}
    </div>
  </div>
</section>`;
}

function renderVideoModal(props: Record<string, unknown>): string {
  return `
<section class="pb-section pb-section-dark pb-center">
  <div class="pb-container pb-narrow">
    <h2 class="pb-sec-h pb-light" data-prop="heading">${esc(props.heading)}</h2>
    ${props.subtitle ? `<p class="pb-sec-p pb-light" data-prop="subtitle">${esc(props.subtitle)}</p>` : ""}
    <div class="pb-video-wrap">
      ${props.videoUrl ? `
      <iframe src="${esc(props.videoUrl)}" title="${esc(props.heading)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      ` : `
      <div class="pb-video-placeholder">🎬 Click to set Video Embed URL in properties</div>
      `}
    </div>
  </div>
</section>`;
}

function renderBannerAlert(props: Record<string, unknown>): string {
  const bg = str(props.bgColor, "#800020");
  return `
<div class="pb-banner-alert" style="background:${bg};">
  <div class="pb-container pb-banner-inner">
    ${props.badge ? `<span class="pb-banner-badge" data-prop="badge">${esc(props.badge)}</span>` : ""}
    <span class="pb-banner-text" data-prop="text">${esc(props.text)}</span>
    ${props.buttonText ? `<a class="pb-banner-btn" data-prop="buttonText" href="${esc(props.buttonUrl) || "#"}">${esc(props.buttonText)}</a>` : ""}
  </div>
</div>`;
}

function renderAccordionList(props: Record<string, unknown>): string {
  const items = arr<{ title?: string; content?: string }>(props.items);
  return `
<section class="pb-section pb-section-light">
  <div class="pb-container pb-narrow">
    <h2 class="pb-sec-h pb-center" data-prop="heading">${esc(props.heading)}</h2>
    <div class="pb-faq">
      ${items.map((item, idx) => `
      <div class="pb-faq-item">
        <div class="pb-faq-q" style="font-weight:800;color:#0F172A;">
          <span data-array-prop="items" data-array-idx="${idx}" data-field="title">${esc(item.title)}</span>
        </div>
        <div class="pb-faq-a" style="display:block;" data-array-prop="items" data-array-idx="${idx}" data-field="content">${esc(item.content)}</div>
      </div>`).join("")}
    </div>
  </div>
</section>`;
}

function renderStepProcess(props: Record<string, unknown>): string {
  const steps = arr<{ step?: string; title?: string; body?: string }>(props.steps);
  return `
<section class="pb-section pb-section-dark">
  <div class="pb-container">
    <div class="pb-sec-header">
      <h2 class="pb-sec-h pb-light" data-prop="heading">${esc(props.heading)}</h2>
      ${props.subtitle ? `<p class="pb-sec-p pb-light" data-prop="subtitle">${esc(props.subtitle)}</p>` : ""}
    </div>
    <div class="pb-grid-4">
      ${steps.map((s, idx) => `
      <div class="pb-step-card">
        <div class="pb-step-num" data-array-prop="steps" data-array-idx="${idx}" data-field="step">${esc(s.step)}</div>
        <h3 class="pb-card-title pb-light" data-array-prop="steps" data-array-idx="${idx}" data-field="title">${esc(s.title)}</h3>
        <p class="pb-card-body pb-light-sub" data-array-prop="steps" data-array-idx="${idx}" data-field="body">${esc(s.body)}</p>
      </div>`).join("")}
    </div>
  </div>
</section>`;
}

function renderQuotesBanner(props: Record<string, unknown>): string {
  return `
<section class="pb-section pb-section-maroon pb-center">
  <div class="pb-container pb-narrow">
    <div class="pb-quote-mark" style="color:rgba(255,255,255,.3);font-size:4rem;">"</div>
    <blockquote class="pb-big-quote" data-prop="quote">"${esc(props.quote)}"</blockquote>
    <div class="pb-quote-author" style="justify-content:center;margin-top:1.5rem;">
      ${props.photo ? `<img src="${esc(props.photo)}" alt="${esc(props.author)}" class="pb-quote-photo" style="width:48px;height:48px;">` : ""}
      <div style="text-align:left;">
        <div class="pb-quote-name" data-prop="author" style="font-size:1rem;">${esc(props.author)}</div>
        <div class="pb-quote-role" data-prop="role" style="color:rgba(255,255,255,.7);">${esc(props.role)}</div>
      </div>
    </div>
  </div>
</section>`;
}

function renderJobBoard(props: Record<string, unknown>): string {
  const jobs = arr<{ title?: string; department?: string; type?: string; location?: string; applyUrl?: string }>(props.jobs);
  return `
<section class="pb-section pb-section-light">
  <div class="pb-container">
    <div class="pb-sec-header">
      <h2 class="pb-sec-h" data-prop="heading">${esc(props.heading)}</h2>
      ${props.subtitle ? `<p class="pb-sec-p" data-prop="subtitle">${esc(props.subtitle)}</p>` : ""}
    </div>
    <div class="pb-jobs-list">
      ${jobs.map((j, idx) => `
      <div class="pb-job-card">
        <div>
          <div class="pb-sec-tag" data-array-prop="jobs" data-array-idx="${idx}" data-field="department">${esc(j.department)}</div>
          <h3 class="pb-card-title pb-dark" data-array-prop="jobs" data-array-idx="${idx}" data-field="title">${esc(j.title)}</h3>
          <div style="font-size:.75rem;color:#64748b;margin-top:4px;">
            <span data-array-prop="jobs" data-array-idx="${idx}" data-field="type">${esc(j.type)}</span> • 
            <span data-array-prop="jobs" data-array-idx="${idx}" data-field="location">${esc(j.location)}</span>
          </div>
        </div>
        <a class="pb-btn-primary" data-array-prop="jobs" data-array-idx="${idx}" data-field="applyUrl" href="${esc(j.applyUrl) || "#"}">Apply Now →</a>
      </div>`).join("")}
    </div>
  </div>
</section>`;
}

function renderDownloadResources(props: Record<string, unknown>): string {
  const resources = arr<{ title?: string; size?: string; downloadUrl?: string }>(props.resources);
  return `
<section class="pb-section pb-section-dark">
  <div class="pb-container">
    <div class="pb-sec-header">
      <h2 class="pb-sec-h pb-light" data-prop="heading">${esc(props.heading)}</h2>
      ${props.subtitle ? `<p class="pb-sec-p pb-light" data-prop="subtitle">${esc(props.subtitle)}</p>` : ""}
    </div>
    <div class="pb-grid-2">
      ${resources.map((r, idx) => `
      <div class="pb-res-card">
        <div class="pb-res-icon">📄</div>
        <div style="flex:1;">
          <h3 class="pb-card-title pb-light" data-array-prop="resources" data-array-idx="${idx}" data-field="title">${esc(r.title)}</h3>
          <div class="pb-card-body pb-light-sub" data-array-prop="resources" data-array-idx="${idx}" data-field="size">${esc(r.size)}</div>
        </div>
        <a class="pb-btn-secondary" href="${esc(r.downloadUrl) || "#"}" target="_blank" rel="noopener">Download 📥</a>
      </div>`).join("")}
    </div>
  </div>
</section>`;
}

function renderLocationMap(props: Record<string, unknown>): string {
  return `
<section class="pb-section pb-section-light">
  <div class="pb-container pb-two-col">
    <div>
      <h2 class="pb-sec-h" data-prop="heading">${esc(props.heading)}</h2>
      <p class="pb-sec-p" data-prop="address" style="margin-bottom:1.5rem;">${esc(props.address)}</p>
      <div style="font-size:.85rem;color:#0F172A;line-height:1.8;">
        <div><strong>Email:</strong> <span data-prop="email">${esc(props.email)}</span></div>
        <div><strong>Phone:</strong> <span data-prop="phone">${esc(props.phone)}</span></div>
      </div>
    </div>
    <div class="pb-map-wrap">
      ${props.mapEmbedUrl ? `<iframe src="${esc(props.mapEmbedUrl)}" width="100%" height="280" style="border:0;border-radius:14px;" allowfullscreen loading="lazy"></iframe>` : `<div class="pb-img-placeholder">📍 Map View</div>`}
    </div>
  </div>
</section>`;
}

function renderHeroSplit(props: Record<string, unknown>): string {
  return `
<section class="pb-hero" style="min-height:75vh;background:linear-gradient(135deg, #0A0A0F 0%, #1a0a1f 100%);">
  <div class="pb-container pb-two-col" style="padding:4rem 1.5rem;">
    <div>
      <h1 class="pb-hero-title" data-prop="heading">${esc(props.heading)}</h1>
      <p class="pb-hero-sub" data-prop="subtitle" style="text-align:left;">${esc(props.subtitle)}</p>
    </div>
    <div className="pb-card pb-card-light" style="background:#fff;padding:2rem;border-radius:18px;color:#0F172A;">
      <h3 style="font-size:1.2rem;font-weight:900;margin-bottom:1rem;" data-prop="formHeading">${esc(props.formHeading)}</h3>
      <form class="pb-form" onsubmit="event.preventDefault();alert('Application submitted!');">
        <input class="pb-form-input" type="text" placeholder="Startup Name" required />
        <input class="pb-form-input" type="email" placeholder="Founder Email" required />
        <input class="pb-form-input" type="tel" placeholder="Phone Number" required />
        <button class="pb-btn-primary" type="submit" data-prop="buttonText">${esc(props.buttonText)}</button>
      </form>
    </div>
  </div>
</section>`;
}

function renderComparisonTable(props: Record<string, unknown>): string {
  const items = arr<{ feature?: string; col1?: string; col2?: string }>(props.items);
  return `
<section class="pb-section pb-section-dark">
  <div class="pb-container pb-narrow pb-center">
    <h2 class="pb-sec-h pb-light" data-prop="heading">${esc(props.heading)}</h2>
    <div class="pb-comp-table">
      <div class="pb-comp-row pb-comp-head">
        <div data-prop="heading">Feature / Support</div>
        <div data-prop="col1Title">${esc(props.col1Title)}</div>
        <div class="pb-comp-highlight" data-prop="col2Title">${esc(props.col2Title)}</div>
      </div>
      ${items.map((item, idx) => `
      <div class="pb-comp-row">
        <div data-array-prop="items" data-array-idx="${idx}" data-field="feature">${esc(item.feature)}</div>
        <div data-array-prop="items" data-array-idx="${idx}" data-field="col1" style="color:rgba(255,255,255,.5);">${esc(item.col1)}</div>
        <div class="pb-comp-highlight" data-array-prop="items" data-array-idx="${idx}" data-field="col2">${esc(item.col2)}</div>
      </div>`).join("")}
    </div>
  </div>
</section>`;
}

function renderStatsCards(props: Record<string, unknown>): string {
  const cards = arr<{ number?: string; label?: string; badge?: string }>(props.cards);
  return `
<section class="pb-section pb-section-light">
  <div class="pb-container">
    <h2 class="pb-sec-h pb-center" data-prop="heading" style="margin-bottom:2rem;">${esc(props.heading)}</h2>
    <div class="pb-grid-3">
      ${cards.map((c, idx) => `
      <div class="pb-card pb-card-light pb-center">
        <div class="pb-sec-tag" data-array-prop="cards" data-array-idx="${idx}" data-field="badge">${esc(c.badge)}</div>
        <div class="pb-stat-value" style="color:#800020;font-size:2.5rem;" data-array-prop="cards" data-array-idx="${idx}" data-field="number">${esc(c.number)}</div>
        <div class="pb-stat-label" style="color:#64748b;font-size:.85rem;" data-array-prop="cards" data-array-idx="${idx}" data-field="label">${esc(c.label)}</div>
      </div>`).join("")}
    </div>
  </div>
</section>`;
}

function renderEventSchedule(props: Record<string, unknown>): string {
  const sessions = arr<{ time?: string; title?: string; speaker?: string; tag?: string }>(props.sessions);
  return `
<section class="pb-section pb-section-dark">
  <div class="pb-container">
    <div class="pb-sec-header">
      <h2 class="pb-sec-h pb-light" data-prop="heading">${esc(props.heading)}</h2>
      ${props.subtitle ? `<p class="pb-sec-p pb-light" data-prop="subtitle">${esc(props.subtitle)}</p>` : ""}
    </div>
    <div class="pb-jobs-list">
      ${sessions.map((s, idx) => `
      <div class="pb-job-card" style="background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.08);color:#fff;">
        <div style="display:flex;align-items:center;gap:1.25rem;">
          <div style="font-size:1.1rem;font-weight:900;color:#800020;" data-array-prop="sessions" data-array-idx="${idx}" data-field="time">${esc(s.time)}</div>
          <div>
            <h3 class="pb-card-title pb-light" data-array-prop="sessions" data-array-idx="${idx}" data-field="title">${esc(s.title)}</h3>
            <div className="pb-card-body pb-light-sub" data-array-prop="sessions" data-array-idx="${idx}" data-field="speaker">${esc(s.speaker)}</div>
          </div>
        </div>
        <span class="pb-sec-tag" data-array-prop="sessions" data-array-idx="${idx}" data-field="tag">${esc(s.tag)}</span>
      </div>`).join("")}
    </div>
  </div>
</section>`;
}

function renderStatsCounterBar(props: Record<string, unknown>): string {
  const items = arr<{ value?: string; label?: string }>(props.items);
  return `
<div style="background:linear-gradient(135deg,#800020,#5a0017);padding:1.5rem 0;color:#fff;">
  <div class="pb-container" style="display:flex;justify-content:space-around;align-items:center;flex-wrap:wrap;gap:1.5rem;text-align:center;">
    ${items.map((item, idx) => `
    <div>
      <div style="font-size:1.75rem;font-weight:900;" data-array-prop="items" data-array-idx="${idx}" data-field="value">${esc(item.value)}</div>
      <div style="font-size:.75rem;color:rgba(255,255,255,.75);font-weight:600;" data-array-prop="items" data-array-idx="${idx}" data-field="label">${esc(item.label)}</div>
    </div>`).join("")}
  </div>
</div>`;
}

function renderCodeBlock(props: Record<string, unknown>): string {
  return `
<section class="pb-section pb-section-dark pb-center">
  <div class="pb-container pb-narrow">
    <h2 class="pb-sec-h pb-light" data-prop="heading">${esc(props.heading)}</h2>
    <div style="background:#000;border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:1.5rem;text-align:left;font-family:monospace;font-size:.85rem;color:#38bdf8;overflow-x:auto;">
      <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:.5rem;margin-bottom:1rem;color:#64748b;font-size:.75rem;">
        <span>Terminal / API</span>
        <span data-prop="language">${esc(props.language)}</span>
      </div>
      <pre style="margin:0;white-space:pre-wrap;" data-prop="code">${esc(props.code)}</pre>
    </div>
  </div>
</section>`;
}

function renderTabbedFeatures(props: Record<string, unknown>): string {
  const tabs = arr<{ title?: string; body?: string; tag?: string }>(props.tabs);
  return `
<section class="pb-section pb-section-light">
  <div class="pb-container">
    <h2 class="pb-sec-h pb-center" data-prop="heading" style="margin-bottom:2rem;">${esc(props.heading)}</h2>
    <div class="pb-grid-3">
      ${tabs.map((tab, idx) => `
      <div class="pb-card pb-card-light">
        <span class="pb-sec-tag" data-array-prop="tabs" data-array-idx="${idx}" data-field="tag">${esc(tab.tag)}</span>
        <h3 class="pb-card-title pb-dark" data-array-prop="tabs" data-array-idx="${idx}" data-field="title">${esc(tab.title)}</h3>
        <p class="pb-card-body pb-dark-sub" data-array-prop="tabs" data-array-idx="${idx}" data-field="body">${esc(tab.body)}</p>
      </div>`).join("")}
    </div>
  </div>
</section>`;
}

function renderNewsletter(props: Record<string, unknown>): string {
  return `
<section class="pb-section pb-section-maroon pb-center">
  <div class="pb-container pb-narrow">
    <h2 class="pb-sec-h pb-light" data-prop="heading">${esc(props.heading)}</h2>
    ${props.subtitle ? `<p class="pb-sec-p pb-light" data-prop="subtitle">${esc(props.subtitle)}</p>` : ""}
    <form class="pb-form" onsubmit="event.preventDefault();alert('Subscribed successfully!');" style="flex-direction:row;justify-content:center;gap:.5rem;max-width:500px;margin:1.5rem auto 0;">
      <input class="pb-form-input" type="email" placeholder="Enter your business email..." required style="border-radius:10px;background:#fff;" />
      <button class="pb-btn-primary pb-btn-white" type="submit" data-prop="buttonText" style="white-space:nowrap;">${esc(props.buttonText)}</button>
    </form>
    ${props.disclaimer ? `<div style="font-size:.7rem;color:rgba(255,255,255,.6);margin-top:.75rem;" data-prop="disclaimer">${esc(props.disclaimer)}</div>` : ""}
  </div>
</section>`;
}

function renderTeamExec(props: Record<string, unknown>): string {
  return `
<section class="pb-section pb-section-dark">
  <div class="pb-container pb-two-col">
    <div style="text-align:center;">
      <div class="pb-person-avatar" style="width:120px;height:120px;margin:0 auto 1.5rem;">
        <span class="pb-person-initials" style="font-size:2.5rem;">${initials(str(props.name, "?"))}</span>
        ${props.photo ? `<img src="${esc(props.photo)}" alt="${esc(props.name)}">` : ""}
      </div>
      <h3 class="pb-card-title pb-light" style="font-size:1.25rem;" data-prop="name">${esc(props.name)}</h3>
      <div class="pb-card-body pb-light-sub" style="color:#800020;font-weight:800;" data-prop="title">${esc(props.title)}</div>
      <div class="pb-card-body pb-light-sub" data-prop="organization">${esc(props.organization)}</div>
    </div>
    <div>
      <blockquote class="pb-big-quote" style="font-size:1.1rem;text-align:left;margin-bottom:1.25rem;" data-prop="quote">"${esc(props.quote)}"</blockquote>
      <p class="pb-sec-p pb-light" data-prop="bio">${esc(props.bio)}</p>
      ${props.linkedin ? `<a class="pb-linkedin" href="${esc(props.linkedin)}" target="_blank" rel="noopener" style="font-size:.85rem;">Connect on LinkedIn ↗</a>` : ""}
    </div>
  </div>
</section>`;
}

function renderPortfolioGrid(props: Record<string, unknown>): string {
  const startups = arr<{ name?: string; sector?: string; stage?: string; desc?: string; logo?: string; link?: string }>(props.startups);
  return `
<section class="pb-section pb-section-dark">
  <div class="pb-container">
    <div class="pb-sec-header">
      <h2 class="pb-sec-h pb-light" data-prop="heading">${esc(props.heading)}</h2>
      ${props.subtitle ? `<p class="pb-sec-p pb-light" data-prop="subtitle">${esc(props.subtitle)}</p>` : ""}
    </div>
    <div class="pb-grid-2">
      ${startups.map((s, idx) => `
      <div class="pb-card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem;">
          <span class="pb-sec-tag" data-array-prop="startups" data-array-idx="${idx}" data-field="sector">${esc(s.sector)}</span>
          <span style="font-size:.7rem;color:#38bdf8;font-weight:700;" data-array-prop="startups" data-array-idx="${idx}" data-field="stage">${esc(s.stage)}</span>
        </div>
        <h3 class="pb-card-title pb-light" style="font-size:1.1rem;" data-array-prop="startups" data-array-idx="${idx}" data-field="name">${esc(s.name)}</h3>
        <p class="pb-card-body pb-light-sub" data-array-prop="startups" data-array-idx="${idx}" data-field="desc">${esc(s.desc)}</p>
        ${s.link ? `<a class="pb-card-link pb-light-link" href="${esc(s.link)}" target="_blank">Visit Website ↗</a>` : ""}
      </div>`).join("")}
    </div>
  </div>
</section>`;
}

function renderTableData(props: Record<string, unknown>): string {
  const headers = str(props.columns, "").split(",").map(h => h.trim()).filter(Boolean);
  const rows = arr<Record<string, unknown>>(props.rows);
  return `
<section class="pb-section pb-section-light">
  <div class="pb-container">
    <h2 class="pb-sec-h pb-center" data-prop="heading" style="margin-bottom:1.5rem;">${esc(props.heading)}</h2>
    <div class="pb-comp-table" style="background:#fff;border-color:#e5e7eb;">
      <div class="pb-comp-row pb-comp-head" style="background:#f8f9fa;color:#0F172A;grid-template-columns:repeat(${headers.length || 4}, 1fr);">
        ${headers.map(h => `<div>${esc(h)}</div>`).join("")}
      </div>
      ${rows.map((r, idx) => `
      <div class="pb-comp-row" style="color:#64748b;grid-template-columns:repeat(${headers.length || 4}, 1fr);">
        <div data-array-prop="rows" data-array-idx="${idx}" data-field="col1">${esc(r.col1)}</div>
        <div data-array-prop="rows" data-array-idx="${idx}" data-field="col2">${esc(r.col2)}</div>
        <div data-array-prop="rows" data-array-idx="${idx}" data-field="col3">${esc(r.col3)}</div>
        <div data-array-prop="rows" data-array-idx="${idx}" data-field="col4">${esc(r.col4)}</div>
      </div>`).join("")}
    </div>
  </div>
</section>`;
}

function renderCountdown(props: Record<string, unknown>): string {
  return `
<section class="pb-section pb-section-dark pb-center">
  <div class="pb-container pb-narrow">
    <h2 class="pb-sec-h pb-light" data-prop="heading">${esc(props.heading)}</h2>
    ${props.subtitle ? `<p class="pb-sec-p pb-light" data-prop="subtitle">${esc(props.subtitle)}</p>` : ""}
    <div style="display:flex;justify-content:center;gap:1.5rem;margin:2rem 0;">
      <div className="pb-card" style="min-width:70px;padding:1rem;">
        <div style="font-size:2rem;font-weight:900;color:#fff;" data-prop="days">${esc(props.days)}</div>
        <div style="font-size:.65rem;color:rgba(255,255,255,.5);font-weight:700;">DAYS</div>
      </div>
      <div className="pb-card" style="min-width:70px;padding:1rem;">
        <div style="font-size:2rem;font-weight:900;color:#fff;" data-prop="hours">${esc(props.hours)}</div>
        <div style="font-size:.65rem;color:rgba(255,255,255,.5);font-weight:700;">HOURS</div>
      </div>
      <div className="pb-card" style="min-width:70px;padding:1rem;">
        <div style="font-size:2rem;font-weight:900;color:#fff;" data-prop="minutes">${esc(props.minutes)}</div>
        <div style="font-size:.65rem;color:rgba(255,255,255,.5);font-weight:700;">MINUTES</div>
      </div>
      <div className="pb-card" style="min-width:70px;padding:1rem;">
        <div style="font-size:2rem;font-weight:900;color:#fff;" data-prop="seconds">${esc(props.seconds)}</div>
        <div style="font-size:.65rem;color:rgba(255,255,255,.5);font-weight:700;">SECONDS</div>
      </div>
    </div>
    ${props.buttonText ? `<a class="pb-btn-primary" data-prop="buttonText" href="${esc(props.buttonUrl) || "#"}">${esc(props.buttonText)}</a>` : ""}
  </div>
</section>`;
}

function renderHeroVideoBg(props: Record<string, unknown>): string {
  return `
<section class="pb-hero" style="min-height:85vh;position:relative;">
  ${props.videoUrl ? `
  <video autoplay loop muted playsinline style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;opacity:0.35;">
    <source src="${esc(props.videoUrl)}" type="video/mp4" />
  </video>` : ""}
  <div class="pb-hero-overlay" style="z-index:1;"></div>
  <div class="pb-container" style="position:relative;z-index:2;text-align:center;padding:4rem 2rem;">
    ${props.badge ? `<div class="pb-sec-tag" data-prop="badge" style="background:rgba(255,255,255,.15);color:#fff;">${esc(props.badge)}</div>` : ""}
    <h1 class="pb-hero-title" data-prop="title">${esc(props.title)}</h1>
    ${props.subtitle ? `<p class="pb-hero-sub" data-prop="subtitle">${esc(props.subtitle)}</p>` : ""}
    <div class="pb-btn-group pb-center-row">
      ${props.buttonText ? `<a class="pb-btn-primary" data-prop="buttonText" href="${esc(props.buttonUrl) || "#"}">${esc(props.buttonText)}</a>` : ""}
      ${props.secondaryButtonText ? `<a class="pb-btn-secondary" data-prop="secondaryButtonText" href="${esc(props.secondaryButtonUrl) || "#"}">${esc(props.secondaryButtonText)}</a>` : ""}
    </div>
  </div>
</section>`;
}

// ─── Renderer Map ─────────────────────────────────────────────────────────────

const RENDERERS: Record<string, (props: Record<string, unknown>) => string> = {
  hero:               renderHero,
  about:              renderAbout,
  image_text:         renderImageText,
  features:           renderFeatures,
  services:           renderServices,
  cards:              renderCards,
  statistics:         renderStatistics,
  timeline:           renderTimeline,
  team:               renderTeam,
  mentors:            renderMentors,
  testimonials:       renderTestimonials,
  gallery:            renderGallery,
  faq:                renderFaq,
  contact_form:       renderContactForm,
  cta:                renderCta,
  footer:             renderFooter,
  pricing:            renderPricing,
  logos:              renderLogos,
  news_grid:          renderNewsGrid,
  video_modal:        renderVideoModal,
  banner_alert:       renderBannerAlert,
  accordion_list:     renderAccordionList,
  step_process:       renderStepProcess,
  quotes_banner:      renderQuotesBanner,
  job_board:          renderJobBoard,
  download_resources: renderDownloadResources,
  location_map:       renderLocationMap,
  hero_split:         renderHeroSplit,
  comparison_table:   renderComparisonTable,
  stats_cards:        renderStatsCards,
  event_schedule:     renderEventSchedule,
  stats_counter_bar:  renderStatsCounterBar,
  code_block:         renderCodeBlock,
  tabbed_features:    renderTabbedFeatures,
  newsletter:         renderNewsletter,
  team_exec:          renderTeamExec,
  portfolio_grid:     renderPortfolioGrid,
  table_data:         renderTableData,
  countdown:          renderCountdown,
  hero_video_bg:      renderHeroVideoBg,
};

// ─── Public API ───────────────────────────────────────────────────────────────

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

export function renderPage(components: PageComponent[]): string {
  return [...components]
    .filter((c) => c.visible)
    .sort((a, b) => a.order - b.order)
    .map(renderComponent)
    .join("\n");
}

export const PAGE_BUILDER_CSS = `/* Page Builder Components CSS */`;

export type { ComponentDef };
