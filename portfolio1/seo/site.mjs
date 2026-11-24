// Shared constants for the build-time SEO layer (homepage plugin + static pages).
export const SITE_URL = 'https://www.vimalharihar.dev/';
export const SEO_NAME = 'Vimal Harihar S K';

// Every spelling people actually type. Used in JSON-LD `alternateName` and in the
// visible "also written as" line, so the entity is matched whichever way it is typed.
export const NAME_VARIANTS = [
  'Vimal Harihar',
  'Vimalharihar S K',
  'Vimal Harihar SK',
  'Vimal HariHar S K',
  'S. K. Vimal Harihar',
  'S K Vimal Harihar',
  'Goldmauler',
];

// Every public profile that belongs to this person. Search engines use `sameAs`
// to tie them into one entity — add new profiles here (Devpost, Hugging Face, etc.).
export const SAME_AS = [
  'https://github.com/Goldmauler',
  'https://www.linkedin.com/in/vimal-harihar-s-k-27979a255/',
  'https://scholar.google.com/citations?user=fFkE2O0AAAAJ',
  'https://orcid.org/0009-0007-5084-4585',
];

export const NAV = [
  ['About', '/about/'],
  ['Achievements', '/achievements/'],
  ['Projects', '/projects/'],
  ['Research', '/research/'],
  ['Photos', '/photos/'],
];

export const abs = (p) => new URL(String(p).replace(/^\//, ''), SITE_URL).href;
export const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
