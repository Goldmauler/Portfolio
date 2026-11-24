// Renders the static pages (plain HTML, no JS) and the sitemap.
import { SITE_URL, SEO_NAME, NAME_VARIANTS, SAME_AS, NAV, abs, esc } from './site.mjs';
import { PAGES } from './pages.mjs';
import { buildPerson, imageObject, imageSize, personRef, PERSON_ID, PORTRAIT } from './schema.mjs';

const today = () => new Date().toISOString().slice(0, 10);
const pageUrl = (p) => abs(`/${p.path}/`);
const ogImage = (p) => `/images/og/${p.path.replace(/\//g, '-')}.jpg`;
export const ogFile = ogImage;

function crumbs(p) {
  const parts = p.path.split('/');
  const items = [{ name: 'Home', url: SITE_URL }];
  let acc = '';
  parts.forEach((seg, i) => {
    acc += `/${seg}`;
    const hub = PAGES.find((x) => `/${x.path}` === acc);
    items.push({ name: i === parts.length - 1 ? p.h1 : hub ? hub.h1 : seg, url: abs(`${acc}/`) });
  });
  return items;
}

function jsonLd(p) {
  const url = pageUrl(p);
  const images = p.images.map((img, i) => imageObject(img, { primary: i === 0 }));
  const breadcrumb = {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs(p).map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.url })),
  };
  const page = {
    '@type': p.type === 'ProfilePage' ? 'ProfilePage' : p.type === 'CollectionPage' ? 'CollectionPage' : 'WebPage',
    '@id': `${url}#page`,
    url,
    name: p.title,
    description: p.description,
    inLanguage: 'en',
    isPartOf: { '@id': `${SITE_URL}#website` },
    breadcrumb: { '@id': `${url}#breadcrumb` },
    about: { '@id': PERSON_ID },
    dateModified: today(),
    primaryImageOfPage: { '@id': `${abs((p.images[0] || PORTRAIT).src)}#image` },
    ...(p.type === 'ProfilePage' ? { mainEntity: { '@id': PERSON_ID } } : {}),
  };
  const main = { ...breadcrumb, '@id': `${url}#breadcrumb` };
  const graph = [page, main, ...images];

  if (p.type === 'ProfilePage') graph.push(buildPerson());
  else graph.push(personRef);

  if (p.type === 'Article') {
    graph.push({
      '@type': 'Article',
      '@id': `${url}#article`,
      headline: p.h1,
      description: p.description,
      mainEntityOfPage: { '@id': `${url}#page` },
      author: { '@id': PERSON_ID },
      publisher: { '@id': PERSON_ID },
      image: [...p.images.map((i) => abs(i.src)), abs(ogImage(p))],
      dateModified: today(),
      about: { '@id': PERSON_ID },
    });
  }
  if (p.type === 'ScholarlyArticle') {
    graph.push({
      '@type': 'ScholarlyArticle',
      '@id': `${url}#article`,
      headline: p.headline,
      name: p.headline,
      description: p.description,
      mainEntityOfPage: { '@id': `${url}#page` },
      author: { '@id': PERSON_ID },
      image: [...p.images.map((i) => abs(i.src)), abs(ogImage(p))],
      sameAs: SAME_AS[2],
    });
  }
  if (p.type === 'SoftwareSourceCode' && p.project) {
    graph.push({
      '@type': 'SoftwareSourceCode',
      '@id': `${url}#code`,
      name: `${p.project.title} — ${p.project.subtitle}`,
      description: p.project.description,
      codeRepository: p.project.link,
      programmingLanguage: p.project.tech,
      dateCreated: p.project.year,
      author: { '@id': PERSON_ID },
      creator: { '@id': PERSON_ID },
      image: [...p.images.map((i) => abs(i.src)), abs(ogImage(p))],
      mainEntityOfPage: { '@id': `${url}#page` },
    });
  }
  if (p.path === 'photos') {
    graph.push({
      '@type': 'ImageGallery',
      '@id': `${url}#gallery`,
      name: `Photos of ${SEO_NAME}`,
      about: { '@id': PERSON_ID },
      image: p.images.map((i) => ({ '@id': `${abs(i.src)}#image` })),
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
body{margin:0;background:#030605;color:#cdeedc;font:16px/1.7 system-ui,-apple-system,"Segoe UI",sans-serif}
a{color:#00ff9d;text-underline-offset:3px}a:hover{color:#fff}
.wrap{max-width:820px;margin:0 auto;padding:0 20px}
header.top{border-bottom:1px solid #0f2a1d;background:#04100b}
header.top .wrap{display:flex;flex-wrap:wrap;gap:6px 18px;align-items:center;padding:14px 20px;font:14px ui-monospace,Consolas,monospace}
header.top .brand{color:#00ff9d;font-weight:700;text-decoration:none;margin-right:auto}
header.top nav{display:flex;flex-wrap:wrap;gap:6px 18px}
header.top nav a{text-decoration:none;color:#9fd6b9}
header.top nav a[aria-current]{color:#fff;border-bottom:1px solid #00ff9d}
.crumbs{font:13px ui-monospace,Consolas,monospace;color:#6b9a82;margin:28px 0 0}
.crumbs a{color:#6b9a82}
.kicker{font:13px ui-monospace,Consolas,monospace;color:#00ff9d;letter-spacing:.04em;margin:18px 0 0}
.kicker:before{content:"> "}
h1{font:700 clamp(28px,5vw,42px)/1.15 system-ui,sans-serif;margin:6px 0 14px;color:#f1fff8}
h2{font-size:22px;margin:38px 0 8px;color:#e6fff2}
.lead{font-size:19px;color:#e2f7ec}
ul{padding-left:20px}li{margin:6px 0}
figure{margin:26px 0}
figure img{display:block;max-width:100%;max-height:520px;width:auto;height:auto;border-radius:10px;border:1px solid #12392a;background:#000}
figure.portrait img{max-width:420px}
figcaption{font-size:14px;color:#7fae96;margin-top:8px}
.facts{display:grid;grid-template-columns:max-content 1fr;gap:6px 18px;background:#06150e;border:1px solid #12392a;border-radius:10px;padding:16px 18px;margin:12px 0}
.facts dt{color:#00ff9d;font:13px ui-monospace,Consolas,monospace}.facts dd{margin:0}
.note{font-size:14px;color:#8dbba4}
footer.site{border-top:1px solid #0f2a1d;margin-top:60px;padding:26px 0 50px;font-size:14px;color:#7fae96}
footer.site p{margin:6px 0}
@media(max-width:560px){.facts{grid-template-columns:1fr}.facts dt{margin-top:6px}}
`;

function figure(img, i, p) {
  const { w, h } = img.w ? { w: img.w, h: img.h } : imageSize(img.src);
  const first = i === 0;
  const cls = /portrait/.test(img.src) ? ' class="portrait"' : '';
  return `<figure${cls}><img src="${esc(img.src)}" alt="${esc(img.alt)}" ${w ? `width="${w}" height="${h}" ` : ''}${
    first ? 'fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"'
  } /><figcaption>${esc(img.caption || img.alt)} — ${esc(SEO_NAME)}</figcaption></figure>`;
}

export function renderPage(p) {
  const url = pageUrl(p);
  const og = abs(ogImage(p));
  const nav = NAV.map(([label, href]) => {
    const here = `/${p.path}/`.startsWith(href) ? ' aria-current="page"' : '';
    return `<a href="${href}"${here}>${label}</a>`;
  }).join('');
  const crumbHtml = crumbs(p)
    .map((c, i, all) => (i === all.length - 1 ? esc(c.name) : `<a href="${new URL(c.url).pathname}">${esc(c.name)}</a>`))
    .join(' / ');
  const body = p.sections.map((s) => `<section><h2>${esc(s.h)}</h2>${s.html}</section>`).join('\n');
  const figs = p.images.map((img, i) => figure(img, i, p)).join('\n');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.description)}" />
<meta name="author" content="${esc(SEO_NAME)}" />
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
<meta name="theme-color" content="#030605" />
<link rel="canonical" href="${url}" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="apple-touch-icon" href="/images/vimal-harihar-s-k-portrait.jpg" />
<link rel="me" href="https://github.com/Goldmauler" />
<link rel="me" href="https://www.linkedin.com/in/vimal-harihar-s-k-27979a255/" />
<meta property="og:type" content="${p.type === 'ProfilePage' ? 'profile' : p.type === 'Article' || p.type === 'ScholarlyArticle' ? 'article' : 'website'}" />
<meta property="og:site_name" content="${esc(SEO_NAME)}" />
<meta property="og:title" content="${esc(p.title)}" />
<meta property="og:description" content="${esc(p.description)}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${og}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="${esc(`${p.h1} — ${SEO_NAME}`)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(p.title)}" />
<meta name="twitter:description" content="${esc(p.description)}" />
<meta name="twitter:image" content="${og}" />
<script type="application/ld+json">${JSON.stringify(jsonLd(p))}</script>
<style>${CSS}</style>
</head>
<body>
<header class="top"><div class="wrap"><a class="brand" href="/">~/${esc(SEO_NAME.toLowerCase().replace(/ /g, '-'))}</a><nav aria-label="Main">${nav}</nav></div></header>
<main class="wrap">
<p class="crumbs">${crumbHtml}</p>
<p class="kicker">${esc(p.kicker)}</p>
<h1>${esc(p.h1)}</h1>
<p class="lead">${p.lead}</p>
${figs}
${body}
</main>
<footer class="site"><div class="wrap">
<p><strong>${esc(SEO_NAME)}</strong> — Software Engineer · AI &amp; ML · Amrita Vishwa Vidyapeetham, Coimbatore, India. Also written ${NAME_VARIANTS.slice(0, 6).map(esc).join(', ')}.</p>
<p><a href="/">Interactive portfolio</a> · <a href="/resume.pdf">Résumé</a> · ${SAME_AS.map((u, i) => `<a href="${u}" rel="me noopener">${['GitHub', 'LinkedIn', 'Google Scholar', 'ORCID'][i]}</a>`).join(' · ')}</p>
</div></footer>
</body>
</html>
`;
}

export function renderSitemap() {
  const d = today();
  const home = {
    loc: SITE_URL,
    images: [
      ...[PORTRAIT.src, '/images/vimal-harihar-s-k-portrait-bw.jpg', '/images/vimal-harihar-s-k-portrait-4x3.jpg', '/images/vimal-harihar-s-k-portrait-16x9.jpg'].map((s) => ({ src: s })),
      { src: '/vimal-harihar-s-k-og.png' },
    ],
  };
  const urls = [
    home,
    ...PAGES.map((p) => ({ loc: pageUrl(p), images: [...p.images, { src: ogImage(p) }] })),
  ];
  const tag = (u) =>
    `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${d}</lastmod>\n${u.images
      .map((i) => `    <image:image><image:loc>${abs(i.src)}</image:loc></image:image>`)
      .join('\n')}\n  </url>`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map(tag).join('\n')}
  <url>
    <loc>${abs('/resume.pdf')}</loc>
    <lastmod>${d}</lastmod>
  </url>
</urlset>
`;
}

export const pageUrls = () => PAGES.map(pageUrl);
export { PAGES };
