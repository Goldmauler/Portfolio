// JSON-LD builders shared by the homepage (seo.config.js) and the static pages (seo/render.mjs).
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { profile, achievements, certifications } from '../src/data/profile.js';
import { SITE_URL, SEO_NAME, NAME_VARIANTS, SAME_AS, abs } from './site.mjs';

export const PERSON_ID = `${SITE_URL}#person`;

// Read width/height straight from the file header (JPEG SOF / PNG IHDR) so markup and
// structured data always carry the real dimensions.
export function imageSize(src) {
  try {
    const buf = fs.readFileSync(fileURLToPath(new URL(`../public${src}`, import.meta.url)));
    if (buf[0] === 0x89 && buf[1] === 0x50) return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
    let i = 2;
    while (i < buf.length) {
      if (buf[i] !== 0xff) { i++; continue; }
      const m = buf[i + 1];
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
        return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
      }
      i += 2 + buf.readUInt16BE(i + 2);
    }
  } catch {
    /* fall through */
  }
  return { w: undefined, h: undefined };
}

// A schema.org ImageObject that names the person as creator AND subject. The `about`
// link is what ties a photo to this identity rather than to a namesake.
export function imageObject(img, { primary = false } = {}) {
  const { w, h } = img.w ? { w: img.w, h: img.h } : imageSize(img.src);
  return {
    '@type': 'ImageObject',
    '@id': `${abs(img.src)}#image`,
    url: abs(img.src),
    contentUrl: abs(img.src),
    ...(w ? { width: w, height: h } : {}),
    name: img.name || img.caption || img.alt,
    caption: img.caption || img.alt,
    description: img.alt,
    creditText: SEO_NAME,
    creator: { '@id': PERSON_ID },
    copyrightNotice: `© ${new Date().getFullYear()} ${SEO_NAME}`,
    about: { '@id': PERSON_ID },
    ...(primary ? { representativeOfPage: true } : {}),
  };
}

export const PORTRAIT = {
  src: '/images/vimal-harihar-s-k-portrait.jpg',
  alt: 'Portrait of Vimal Harihar S K, Software Engineer (AI & ML) at Amrita Vishwa Vidyapeetham, Coimbatore',
  caption: `${SEO_NAME} — Software Engineer, AI & ML`,
};
export const PORTRAIT_4X3 = { ...PORTRAIT, src: '/images/vimal-harihar-s-k-portrait-4x3.jpg' };
export const PORTRAIT_16X9 = { ...PORTRAIT, src: '/images/vimal-harihar-s-k-portrait-16x9.jpg' };
export const PORTRAIT_BW = {
  ...PORTRAIT,
  src: '/images/vimal-harihar-s-k-portrait-bw.jpg',
  alt: 'Black-and-white portrait of Vimal Harihar S K, the same photo used on his GitHub and LinkedIn profiles',
};

export function buildPerson() {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: SEO_NAME,
    alternateName: NAME_VARIANTS,
    givenName: 'Vimal Harihar',
    familyName: 'S K',
    url: SITE_URL,
    mainEntityOfPage: SITE_URL,
    // 1:1, 4:3 and 16:9 versions of the same portrait — what Google asks for in structured data.
    image: [PORTRAIT, PORTRAIT_4X3, PORTRAIT_16X9].map((p) => imageObject(p, { primary: p === PORTRAIT })),
    jobTitle: 'Software Engineer · AI & ML',
    description: profile.summary,
    email: `mailto:${profile.email}`,
    address: { '@type': 'PostalAddress', addressLocality: 'Coimbatore', addressRegion: 'Tamil Nadu', addressCountry: 'IN' },
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'Amrita Vishwa Vidyapeetham', url: 'https://www.amrita.edu/' },
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
}

// Light reference used on sub-pages so every page points at the same entity.
export const personRef = { '@type': 'Person', '@id': PERSON_ID, name: SEO_NAME, url: SITE_URL };
