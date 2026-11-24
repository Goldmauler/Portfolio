// Prints the social-card list (one per static page) for scripts/make-images.py.
import { PAGES, ogFile } from '../seo/render.mjs';

const cards = [
  ...PAGES.map((p) => ({ file: ogFile(p), ...p.og })),
];
console.log(JSON.stringify(cards, null, 1));
