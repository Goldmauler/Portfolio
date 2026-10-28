// Build-time SEO: bakes Person/ProfilePage JSON-LD and a crawlable HTML copy of
// the portfolio into index.html, so search engines and AI crawlers that don't run
// JavaScript still see the name, links, projects and research. React replaces the
// #root contents on mount, so visitors see the same content, just interactive.
import {
  profile,
  socials,
  stats,
  experience,
  achievements,
  publications,
  projects,
  certifications,
} from './src/data/profile.js';

export const SITE_URL = 'https://www.vimalharihar.dev/';
export const SEO_NAME = 'Vimal Harihar S K';

// Every public profile that belongs to this person. Search engines use `sameAs`
// to tie them into one entity — add new profiles here (Scholar, ORCID, etc.).
export const SAME_AS = [
  'https://github.com/Goldmauler',
  'https://www.linkedin.com/in/vimal-harihar-s-k-27979a255/',
  'https://scholar.google.com/citations?user=fFkE2O0AAAAJ',
  'https://orcid.org/0009-0007-5084-4585',
];

const abs = (p) => new URL(p.replace(/^\//, ''), SITE_URL).href;
const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function jsonLd() {
  const person = {
    '@type': 'Person',
    '@id': `${SITE_URL}#person`,
    name: SEO_NAME,
    alternateName: ['Vimal Harihar', 'S. K. Vimal Harihar', 'Vimalharihar S K', 'Vimal Harihar SK', 'Goldmauler'],
    givenName: 'Vimal Harihar',
    familyName: 'S K',
    url: SITE_URL,
    image: {
      '@type': 'ImageObject',
      url: abs('/vimal-harihar-s-k.jpg'),
      caption: `${SEO_NAME} — Software Engineer, AI & ML`,
    },
    jobTitle: 'Software Engineer · AI & ML',
    description: profile.summary,
    email: `mailto:${profile.email}`,
    address: { '@type': 'PostalAddress', addressLocality: 'Coimbatore', addressRegion: 'Tamil Nadu', addressCountry: 'IN' },
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: 'Amrita Vishwa Vidyapeetham',
      url: 'https://www.amrita.edu/',
    },
    affiliation: { '@type': 'CollegeOrUniversity', name: 'Amrita Vishwa Vidyapeetham, Coimbatore' },
    knowsAbout: [
      'Artificial Intelligence',
      'Machine Learning',
      'Retrieval-Augmented Generation',
      'Multi-Agent Systems',
      'Edge AI',
      'TinyML',
      'Distributed Systems',
      'Full Stack Development',
      'AWS',
    ],
    award: achievements.map((a) => `${a.title} — ${a.event}${a.year ? ` (${a.year})` : ''}`),
    hasCredential: certifications.map((c) => ({
      '@type': 'EducationalOccupationalCredential',
      name: c.name,
      recognizedBy: { '@type': 'Organization', name: c.org.split(' · ')[0] },
    })),
    identifier: {
      '@type': 'PropertyValue',
      propertyID: 'ORCID',
      value: '0009-0007-5084-4585',
      url: 'https://orcid.org/0009-0007-5084-4585',
    },
    sameAs: SAME_AS,
  };

  const works = [
    ...publications.map((p) => ({
      '@type': p.type === 'Book Chapter' ? 'Chapter' : 'ScholarlyArticle',
      name: p.title,
      headline: p.title,
      abstract: p.note,
      ...(p.date && /\d{4}/.test(p.date) ? { datePublished: p.date.match(/\d{4}/)[0] } : {}),
      ...(p.venue ? { publisher: { '@type': 'Organization', name: p.venue } } : {}),
      author: { '@id': `${SITE_URL}#person` },
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
      creator: { '@id': `${SITE_URL}#person` },
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
        alternateName: ['VH.OS', 'Vimal Harihar Portfolio'],
        publisher: { '@id': `${SITE_URL}#person` },
        inLanguage: 'en',
      },
      {
        '@type': 'ProfilePage',
        '@id': `${SITE_URL}#profile`,
        url: SITE_URL,
        name: `${SEO_NAME} — Software Engineer · AI & ML`,
        isPartOf: { '@id': `${SITE_URL}#website` },
        mainEntity: person,
        hasPart: works,
        dateModified: new Date().toISOString().slice(0, 10),
      },
    ],
  };
}

function staticHtml() {
  const li = (items) => items.map((x) => `<li>${x}</li>`).join('');
  return `
<main class="seo-static">
  <img src="/vimal-harihar-s-k.jpg" alt="${esc(SEO_NAME)} — Software Engineer, AI &amp; ML, Amrita Vishwa Vidyapeetham" width="160" height="160" />
  <h1>${esc(SEO_NAME)}</h1>
  <p><strong>${esc(profile.roles.slice(0, 3).join(' · '))}</strong> — ${esc(profile.location)}</p>
  <p>${esc(profile.tagline)}</p>
  <p>${esc(profile.summary)}</p>
  <ul>${li(stats.map((s) => `${s.value}${s.suffix} ${esc(s.label)} (${esc(s.note)})`))}</ul>
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
  };
}
