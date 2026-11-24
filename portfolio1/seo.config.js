// Build-time SEO: bakes Person/ProfilePage JSON-LD and a crawlable HTML copy of
// the portfolio into index.html, so search engines and AI crawlers that don't run
// JavaScript still see the name, links, projects and research. React replaces the
// #root contents on mount, so visitors see the same content, just interactive.
//
// It also emits the static, individually indexable pages (/about/, /achievements/…,
// /photos/, …) and sitemap.xml — see seo/pages.mjs for the content.
import {
  profile,
  socials,
  stats,
  experience,
  achievements,
  publications,
  projects,
} from './src/data/profile.js';
import { SITE_URL, SEO_NAME, NAME_VARIANTS, SAME_AS, NAV, abs, esc } from './seo/site.mjs';
import { buildPerson, PERSON_ID, PORTRAIT, PORTRAIT_4X3, PORTRAIT_16X9, imageObject } from './seo/schema.mjs';
import { PAGES, renderPage, renderSitemap, pageUrls } from './seo/render.mjs';

export { SITE_URL, SEO_NAME, SAME_AS };

function jsonLd() {
  const person = buildPerson();

  const works = [
    ...publications.map((p) => ({
      '@type': p.type === 'Book Chapter' ? 'Chapter' : 'ScholarlyArticle',
      name: p.title,
      headline: p.title,
      abstract: p.note,
      ...(p.date && /\d{4}/.test(p.date) ? { datePublished: p.date.match(/\d{4}/)[0] } : {}),
      ...(p.venue ? { publisher: { '@type': 'Organization', name: p.venue } } : {}),
      author: { '@id': PERSON_ID },
      url: SAME_AS[2],
    })),
    ...projects.map((p) => ({
      '@type': 'SoftwareSourceCode',
      name: `${p.title} — ${p.subtitle}`,
      description: p.description,
      ...(p.link ? { codeRepository: p.link } : {}),
      ...(p.image ? { image: abs(p.image) } : {}),
      programmingLanguage: p.tech,
      ...(p.year ? { dateCreated: p.year } : {}),
      creator: { '@id': PERSON_ID },
    })),
  ];

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}#website`,
        url: SITE_URL,
        name: `${SEO_NAME} — Portfolio`,
        alternateName: ['VH.OS', 'Vimal Harihar Portfolio', 'vimalharihar.dev'],
        publisher: { '@id': PERSON_ID },
        inLanguage: 'en',
      },
      {
        '@type': 'ProfilePage',
        '@id': `${SITE_URL}#profile`,
        url: SITE_URL,
        name: `${SEO_NAME} — Software Engineer · AI & ML`,
        isPartOf: { '@id': `${SITE_URL}#website` },
        mainEntity: person,
        primaryImageOfPage: { '@id': `${abs(PORTRAIT.src)}#image` },
        significantLink: pageUrls(),
        hasPart: works,
        dateModified: new Date().toISOString().slice(0, 10),
      },
      ...[PORTRAIT, PORTRAIT_4X3, PORTRAIT_16X9].map((p) => imageObject(p, { primary: p === PORTRAIT })),
    ],
  };
}

function staticHtml() {
  const li = (items) => items.map((x) => `<li>${x}</li>`).join('');
  return `
<main class="seo-static">
  <img src="${PORTRAIT.src}" alt="${esc(PORTRAIT.alt)}" width="160" height="160" />
  <h1>${esc(SEO_NAME)}</h1>
  <p>Also written ${NAME_VARIANTS.slice(0, 6).map(esc).join(', ')}.</p>
  <p><strong>${esc(profile.roles.slice(0, 3).join(' · '))}</strong> — ${esc(profile.location)}</p>
  <p>${esc(profile.tagline)}</p>
  <p>${esc(profile.summary)}</p>
  <ul>${li(stats.map((s) => `${s.value}${s.suffix} ${esc(s.label)} (${esc(s.note)})`))}</ul>
  <nav aria-label="Pages">${NAV.map(([label, href]) => `<a href="${href}">${label}</a>`).join(' · ')}</nav>
  <nav aria-label="Profiles">${socials
    .map((s) => `<a href="${esc(s.href)}" rel="me">${esc(s.label)}</a>`)
    .join(' · ')} · <a href="/resume.pdf">Résumé (PDF)</a></nav>
  <h2>Experience</h2>
  <ul>${li(experience.map((e) => `<strong>${esc(e.role)}</strong>, ${esc(e.org)} (${esc(e.period)}) — ${esc(e.points[0])}`))}</ul>
  <h2>Projects</h2>
  <ul>${li(
    projects.map(
      (p) =>
        `<strong>${p.link ? `<a href="${esc(p.link)}">${esc(p.title)}</a>` : esc(p.title)}</strong> — ${esc(p.subtitle)}${
          p.badge ? ` (${esc(p.badge)})` : ''
        }. ${esc(p.description)}`,
    ),
  )}</ul>
  <h2>Research &amp; Publications</h2>
  <ul>${li(publications.map((p) => `<strong>${esc(p.title)}</strong> — ${esc(p.type)}, ${esc(p.status)}${p.date ? `, ${esc(p.date)}` : ''}`))}</ul>
  <h2>Achievements</h2>
  <ul>${li(achievements.map((a) => `${esc(a.title)} — ${esc(a.event)}${a.year ? ` (${esc(a.year)})` : ''}`))}</ul>
  <h2>Education</h2>
  <p>${esc(profile.education.degree)}, ${esc(profile.education.school)} (${esc(profile.education.period)})</p>
  <p>Contact: <a href="mailto:${esc(profile.email)}">${esc(profile.email)}</a></p>
</main>`;
}

export function seoPlugin() {
  return {
    name: 'portfolio-seo',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html
          .replace('<!--seo:jsonld-->', `<script type="application/ld+json">${JSON.stringify(jsonLd())}</script>`)
          .replace('<div id="root"></div>', `<div id="root">${staticHtml()}</div>`);
      },
    },
    // Static pages + sitemap are written straight into the build output.
    generateBundle() {
      for (const p of PAGES) {
        this.emitFile({ type: 'asset', fileName: `${p.path}/index.html`, source: renderPage(p) });
      }
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: renderSitemap() });
    },
    // `npm run dev`: serve the same pages so they can be previewed without a build.
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url || '').split('?')[0].replace(/^\/|\/$/g, '');
        if (req.url === '/sitemap.xml') {
          res.setHeader('Content-Type', 'application/xml');
          return res.end(renderSitemap());
        }
        const page = PAGES.find((p) => p.path === path);
        if (!page) return next();
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(renderPage(page));
      });
    },
  };
}
