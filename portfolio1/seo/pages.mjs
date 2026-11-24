// Content for the static, individually indexable pages (/about/, /achievements/…, /photos/ …).
// The interactive React site stays at "/"; these pages give search engines (and people who
// land from a search) one real URL per topic, each with its own named, captioned images.
//
// Facts here come from profile.js, the résumé and Vimal's own LinkedIn posts. No years are
// stated where the sources disagree.
import { profile, projects, publications, experience } from '../src/data/profile.js';
import { SEO_NAME, SAME_AS, NAME_VARIANTS } from './site.mjs';
import { PORTRAIT, PORTRAIT_BW, PORTRAIT_4X3, PORTRAIT_16X9 } from './schema.mjs';

const N = SEO_NAME;
const a = (href, text, rel) => `<a href="${href}"${rel ? ` rel="${rel}"` : ''}>${text}</a>`;
const ext = (href, text) => `<a href="${href}" rel="noopener">${text}</a>`;
const ul = (items) => `<ul>${items.map((x) => `<li>${x}</li>`).join('')}</ul>`;
const facts = (rows) =>
  `<dl class="facts">${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;

// ── images ────────────────────────────────────────────────────────────────────────────────────
// Only images that show no third-party faces, plus the portrait. Event photos where Vimal is
// visible are added here once he confirms which person he is in each shot.
export const IMG = {
  gtcCert: {
    src: '/images/gender-technology-2025-certificate-of-paper-presentation-vimal-harihar-s-k.jpg',
    alt: 'Certificate of Paper Presentation awarded to Vimal Harihar S K at the International Conference on Gender and Technology 2025, Amrita Vishwa Vidyapeetham',
    caption: 'Certificate of Paper Presentation — International Conference on Gender and Technology 2025 (Amrita Vishwa Vidyapeetham)',
  },
  infineonBoard: {
    src: '/images/infineon-psoc6-sequence-quest-keypad-lcd-board.jpg',
    alt: 'Infineon PSoC 6 board wired to a keypad and LCD, the hardware used in the Sequence Quest hackathon won by Vimal Harihar S K',
    caption: 'The PSoC 6 + keypad + LCD hardware from the Infineon Sequence Quest hackathon',
  },
  catOffice: {
    src: '/images/caterpillar-tech-challenge-2026-grand-finalist-caterpillar-office.jpg',
    alt: 'Caterpillar office reception where Vimal Harihar S K and team Phanovex presented as Top 10 Grand Finalists of the Caterpillar Tech Challenge 2026',
    caption: 'Caterpillar office — Grand Finals of the Caterpillar Tech Challenge 2026',
  },
  catModel: {
    src: '/images/phanovex-mining-dump-truck-3d-model-blender.jpg',
    alt: 'Blender 3D model of a mining dump truck used to simulate carry-back in the Phanovex project by Vimal Harihar S K',
    caption: 'Phanovex — 3D model of the dump truck used for the carry-back simulation',
  },
  rotaBadges: {
    src: '/images/rota-techx-2025-participant-badges-finstein.jpg',
    alt: 'Participant badges for Rota-TechX, the 24-hour hackathon hosted by Rotaract Club of Sri Venkateswara College of Engineering, where Vimal Harihar S K reached the Top 5',
    caption: 'Rota-TechX participant badges',
  },
  nitBoard: {
    src: '/images/nit-trichy-ai-for-all-one-day-ideathon-venue-board.jpg',
    alt: 'Venue board for the AI For ALL One Day Ideathon at NIT Tiruchirappalli, attended by Vimal Harihar S K with the Viyatra project',
    caption: 'AI For ALL One Day Ideathon — NIT Tiruchirappalli',
  },
  secureAi: {
    src: '/images/secureai-cyber-springer-itai-2025-paper-first-page.jpg',
    alt: 'First page of the paper SecureAI-Cyber: An AI-Powered Cybersecurity Solution for Scalable Threat Management, co-authored by Vimal Harihar S K',
    caption: 'SecureAI-Cyber (Springer, ITAI 2025) — first page',
  },
  rezoLogo: {
    src: '/images/rezo-vs-code-extension-logo.jpg',
    alt: 'REZO VS Code extension logo — encrypted team chat inside the editor, built by Vimal Harihar S K and team',
    caption: 'REZO — VS Code extension',
  },
  rezoMarket: {
    src: '/images/rezo-vs-code-marketplace-listing.jpg',
    alt: 'REZO listing on the Visual Studio Code Marketplace, published by Vimal Harihar S K',
    caption: 'REZO on the VS Code Marketplace',
  },
  phanovex: {
    src: '/images/phanovex-carry-back-intelligence-mining-trucks-vimal-harihar-s-k.jpg',
    alt: 'Phanovex predictive carry-back intelligence system for mining dump trucks — Caterpillar Tech Challenge 2026 project by Vimal Harihar S K',
    caption: 'Phanovex — predictive carry-back intelligence for mining trucks',
  },
  lazarus: {
    src: '/images/lazarus-multi-agent-legacy-code-resurrection-aws-vimal-harihar-s-k.jpg',
    alt: 'Lazarus multi-agent platform on AWS that revives legacy GitHub repositories — AWS AI for Bharat project with Vimal Harihar S K',
    caption: 'Lazarus — resurrect legacy repos on AWS',
  },
  avav: {
    src: '/images/avav-autonomous-visual-asset-validator-vimal-harihar-s-k.jpg',
    alt: 'AVAV Autonomous Visual Asset Validator, a self-correcting LangGraph 3D QA pipeline built by Vimal Harihar S K',
    caption: 'AVAV — Autonomous Visual Asset Validator',
  },
};

const withLinks = `
  <p>Elsewhere online: ${SAME_AS.map((u, i) => ext(u, ['GitHub', 'LinkedIn', 'Google Scholar', 'ORCID'][i] || u)).join(' · ')}.</p>`;

// ── page definitions ───────────────────────────────────────────────────────────────────────────
// type → schema.org type of the page itself. `og` feeds scripts/make-images.py (kicker/title/sub).
export const PAGES = [];
const add = (p) => PAGES.push(p);

// ───────── About ─────────
add({
  path: 'about',
  type: 'ProfilePage',
  title: `About ${N} — Software Engineer (AI & ML), Coimbatore`,
  description: `${N} (Vimalharihar S K, GitHub Goldmauler) is a Software Engineer and B.Tech CSE student at Amrita Vishwa Vidyapeetham, Coimbatore, working on AI/ML, RAG, multi-agent systems and edge AI.`,
  h1: `About ${N}`,
  kicker: 'whoami',
  lead: `${N} is a Software Engineer and Computer Science student at Amrita Vishwa Vidyapeetham in Coimbatore, India. He builds AI systems — retrieval-augmented generation (RAG), multi-agent pipelines, edge AI/TinyML — and the full-stack products around them.`,
  images: [{ ...PORTRAIT, primary: true }, PORTRAIT_BW],
  og: { kicker: 'whoami', title: `About ${N}`, sub: 'Software Engineer · AI & ML · Coimbatore' },
  sections: [
    {
      h: `Who is ${N}?`,
      html: `<p>${N} — also written ${NAME_VARIANTS.slice(1, 6).join(', ')} — is a software engineer from Coimbatore, India, studying ${profile.education.degree} (${profile.education.period}) at ${profile.education.school}. His GitHub handle is ${ext('https://github.com/Goldmauler', 'Goldmauler')}.</p>
<p>${profile.summary}</p>
<p>${profile.tagline}</p>`,
    },
    {
      h: 'What he works on',
      html: ul([
        'Retrieval-augmented generation and Deep Agents for production incident investigation',
        'Multi-agent systems on AWS (Bedrock, Lambda, DynamoDB, S3) and LangGraph',
        'Edge AI and TinyML — models small enough to run on a microcontroller',
        'Computer vision (YOLOv8, SAM) and sensor fusion',
        'Full-stack web: React, Next.js, Node.js, FastAPI, WebSockets, WebRTC',
        'Distributed systems: consistent hashing, replication, CRDTs',
      ]),
    },
    {
      h: 'Experience',
      html: ul(
        experience.map(
          (e) => `<strong>${e.role}</strong>, ${e.org} (${e.period}) — ${e.points[0]}`,
        ),
      ),
    },
    {
      h: 'Recognition, research and projects',
      html: `<p>35+ hackathons, four times a finalist. ${a('/achievements/infineon-psoc6-sequence-quest-hackathon/', 'Winner of the Infineon PSoC 6 Sequence Quest hackathon')}, ${a('/achievements/caterpillar-tech-challenge-2026/', 'Top 10 Grand Finalist at the Caterpillar Tech Challenge 2026')} (from 8,100+ teams), and ${a('/achievements/aws-ai-for-bharat-lazarus/', 'finalist at the AWS AI for Bharat hackathon')}.</p>
<p>Four research publications, including ${a('/research/ai-influence-gender-representation-ieee/', 'an IEEE paper on AI and gender representation')} and ${a('/research/secureai-cyber-springer-itai-2025/', 'a Springer, Scopus-indexed paper on AI-driven cybersecurity')}. See all ${a('/research/', 'research')}, ${a('/projects/', 'projects')} and ${a('/achievements/', 'achievements')}.</p>`,
    },
    {
      h: `${N} online`,
      html: `${withLinks}<p>Contact: ${a(`mailto:${profile.email}`, profile.email)} · ${a('/resume.pdf', 'Résumé (PDF)')} · ${a('/', 'interactive portfolio')}.</p>`,
    },
    {
      h: 'Name and spelling',
      html: `<p>The name is written <strong>${N}</strong>: given name “Vimal Harihar”, with the initials “S K” after it. It also appears as ${NAME_VARIANTS.map((v) => `“${v}”`).join(', ')}. On Google Scholar it is indexed as “S. K. Vimal Harihar”. All of these refer to the same person.</p>`,
    },
  ],
});

// ───────── Photos / press kit ─────────
add({
  path: 'photos',
  type: 'CollectionPage',
  title: `Photos of ${N} — Headshots & Press Kit`,
  description: `Official photos of ${N}, Software Engineer (AI & ML), Coimbatore: headshots in square, 4:3 and 16:9, plus a short bio, name spellings and links to his verified profiles.`,
  h1: `Photos of ${N}`,
  kicker: 'press kit',
  lead: `Official headshots of ${N} for event listings, articles and speaker pages. These are the same portrait used on his GitHub and LinkedIn profiles, in the sizes publishers usually ask for.`,
  images: [{ ...PORTRAIT, primary: true }, PORTRAIT_BW, PORTRAIT_4X3, PORTRAIT_16X9],
  og: { kicker: 'press kit', title: `Photos of ${N}`, sub: 'Official headshots · bio · verified profiles' },
  sections: [
    {
      h: 'Download',
      html: ul([
        `${a(PORTRAIT.src, 'Square portrait, 1200 × 1200 (JPG)')}`,
        `${a(PORTRAIT_BW.src, 'Black-and-white portrait, 1200 × 1200 (JPG)')}`,
        `${a(PORTRAIT_4X3.src, '4:3, 1600 × 1200 (JPG)')}`,
        `${a(PORTRAIT_16X9.src, '16:9, 1920 × 1080 (JPG)')}`,
      ]) + `<p class="note">Please credit “${N}” and link to ${a('/', 'vimalharihar.dev')} when you use these. For anything else, write to ${a(`mailto:${profile.email}`, profile.email)}.</p>`,
    },
    {
      h: 'Short bio (50 words)',
      html: `<p>${N} is a Software Engineer and B.Tech CSE student at Amrita Vishwa Vidyapeetham, Coimbatore. He builds RAG, multi-agent and edge-AI systems, won the Infineon PSoC 6 Sequence Quest hackathon, was a Top 10 Grand Finalist at the Caterpillar Tech Challenge 2026, and has four research publications.</p>`,
    },
    {
      h: 'How to write his name',
      html: `<p>Preferred: <strong>${N}</strong>. Acceptable: Vimal Harihar. Please do not shorten it to “Vimal”, which is a different (and very common) name. His GitHub handle is Goldmauler.</p>${withLinks}`,
    },
  ],
});

// ───────── Achievements ─────────
const evBase = (o) => ({ type: 'Article', ...o });

add({
  path: 'achievements',
  type: 'CollectionPage',
  title: `Hackathon Wins & Achievements of ${N}`,
  description: `Infineon PSoC 6 hackathon winner, Caterpillar Tech Challenge 2026 Top 10 Grand Finalist, AWS AI for Bharat finalist, Rota-TechX Top 5 — the achievements of ${N}.`,
  h1: `Achievements of ${N}`,
  kicker: 'trophy case',
  lead: `35+ hackathons, four times a finalist. These are the ones with their own write-up.`,
  images: [{ ...PORTRAIT, primary: true }],
  og: { kicker: 'trophy case', title: `Achievements of ${N}`, sub: 'Infineon winner · Caterpillar Top 10 · AWS finalist' },
  sections: [
    {
      h: 'Highlights',
      html: ul([
        `${a('/achievements/infineon-psoc6-sequence-quest-hackathon/', 'Winner — Infineon PSoC 6 Sequence Quest hackathon')} (Amrita Vishwa Vidyapeetham)`,
        `${a('/achievements/caterpillar-tech-challenge-2026/', 'Top 10 Grand Finalist — Caterpillar Tech Challenge 2026')} (8,100+ teams)`,
        `${a('/achievements/aws-ai-for-bharat-lazarus/', 'Finalist — AWS AI for Bharat hackathon')} (project Lazarus)`,
        `${a('/achievements/rota-techx-2025/', 'Top 5 — Rota-TechX hackathon')} (600+ registrations)`,
        `${a('/achievements/nit-trichy-ai-for-all-ideathon/', 'AI For ALL One Day Ideathon')} at NIT Tiruchirappalli (project Viyatra)`,
        `${a('/achievements/amazon-ml-challenge-2026/', 'Amazon ML Challenge 2026')} — entity resolution, score 0.9867`,
        `Finalist — Smart India Hackathon (SIH) and Technova Hackathon (CIT)`,
        `Top 50 of 500+ — IIT Delhi Hackathon · Top 50 of 650 — NIIT Ideathon`,
      ]),
    },
  ],
});

add(
  evBase({
    path: 'achievements/infineon-psoc6-sequence-quest-hackathon',
    title: `${N} — Winner, Infineon PSoC 6 Sequence Quest Hackathon`,
    description: `${N} was on the winning team of the Infineon Hackathon “Sequence Quest”, a PSoC 6 embedded-systems contest at Amrita Vishwa Vidyapeetham: keypad, LCD, interrupts and state machines.`,
    h1: `Winner — Infineon PSoC 6 “Sequence Quest” Hackathon`,
    kicker: 'achievement · winner',
    lead: `${N} was part of the winning team at the Infineon Hackathon “Sequence Quest”, run after a hands-on Infineon workshop on PSoC 6 microcontrollers at Amrita Vishwa Vidyapeetham.`,
    images: [IMG.infineonBoard],
    og: { kicker: 'achievement · winner', title: 'Infineon PSoC 6 Sequence Quest', sub: `Winner — ${N}` },
    sections: [
      {
        h: 'Quick facts',
        html: facts([
          ['Result', 'Winner (team event)'],
          ['Event', 'Infineon Hackathon — Sequence Quest'],
          ['Host institution', 'Amrita Vishwa Vidyapeetham'],
          ['Hardware', 'Infineon PSoC 6 microcontroller, keypad, LCD'],
          ['Prize', '₹15,000, split into three ₹5,000 Amazon vouchers'],
        ]),
      },
      {
        h: 'The challenge',
        html: `<p>The Infineon workshop gave a deep dive into PSoC 6 microcontrollers and real-time embedded concepts. The hackathon that followed tested it: keypad interfacing, LCD graphics, interrupts and complex state machines, all on the board, under time pressure.</p>
<p>The best part, in ${N}'s words, was the synergy inside the team — the win was a collective effort, and it pushed him to optimise for efficient embedded design rather than just getting something to work.</p>`,
      },
      {
        h: 'What it led to',
        html: `<p>The embedded skills from this contest carry into his edge-AI work, such as ${a('/projects/', 'CardioSync')} (TinyML arrhythmia detection on an Arduino) and the ESP32 live mode of ${a('/projects/phanovex-carry-back-intelligence/', 'Phanovex')}. Back to all ${a('/achievements/', 'achievements')}.</p>`,
      },
    ],
  }),
);

add(
  evBase({
    path: 'achievements/caterpillar-tech-challenge-2026',
    title: `${N} — Top 10 Grand Finalist, Caterpillar Tech Challenge 2026`,
    description: `${N} and team Phanovex went from 8,100+ teams to the Top 10 Grand Finalists of the Caterpillar Tech Challenge 2026 with a predictive carry-back intelligence system for mining dump trucks.`,
    h1: 'Top 10 Grand Finalist — Caterpillar Tech Challenge 2026',
    kicker: 'achievement · finalist',
    lead: `From 8,100+ teams to the Top 30 to the Top 10 Grand Finalists: ${N} and teammates built PHANOVEX, a predictive carry-back intelligence system for mining dump trucks.`,
    images: [IMG.catOffice, IMG.catModel],
    og: { kicker: 'achievement · top 10 finalist', title: 'Caterpillar Tech Challenge 2026', sub: `Team Phanovex — ${N}` },
    sections: [
      {
        h: 'Quick facts',
        html: facts([
          ['Result', 'Top 10 Grand Finalist (8,100+ → Top 30 → Top 10)'],
          ['Challenge', 'Caterpillar Tech Challenge 2026 — mining engineering'],
          ['Project', `${a('/projects/phanovex-carry-back-intelligence/', 'Phanovex')} — predictive carry-back intelligence`],
          ['Team', 'Keshav S, Yashwanth P T, Srividya Manikandan and Vimal Harihar S K'],
        ]),
      },
      {
        h: 'The problem and the answer',
        html: `<p>Carry-back — material stuck in the truck bed after dumping — quietly cuts payload capacity, burns extra fuel and wears the tray. The team's answer: <strong>see it, predict it, prevent it</strong>.</p>
${ul([
  '<strong>Detect</strong> — multi-sensor fusion: IP68 stereo vision with SAM 3 zero-shot segmentation, load-cell deltas, hydraulic pressure and a moisture index, running on an edge device (Jetson).',
  '<strong>Predict</strong> — an edge-AI pre-dump risk score with in-cab alerts, plus a cloud digital twin for continuous fleet learning.',
  '<strong>Prevent</strong> — a biomimetic UHMWPE smart liner with cactus- and bone-inspired micro-structures that passively resists adhesion, needs no power and retrofits existing beds.',
])}`,
      },
      {
        h: 'Learning the engineering stack from scratch',
        html: `<p>As a computer-science team they taught themselves AutoCAD design, LIGGGHTS discrete-element simulation for cohesive granular flow, and OpenFOAM CFD to validate multiphase discharge over the liner grooves. In the final stretch the Raspberry Pi module failed; the team switched to its backup plan on the spot and kept going — a lesson ${N} says taught him more about engineering under pressure than months of planning.</p>
<p>See the ${a('/projects/phanovex-carry-back-intelligence/', 'full Phanovex project page')} or the other ${a('/achievements/', 'achievements')}.</p>`,
      },
    ],
  }),
);

add(
  evBase({
    path: 'achievements/aws-ai-for-bharat-lazarus',
    title: `${N} — Finalist, AWS AI for Bharat Hackathon (Lazarus)`,
    description: `${N}, V Kiran Kishore and Keshav S built Lazarus for the AWS AI for Bharat hackathon: five AI agents on Amazon Bedrock that turn a dead GitHub repo into a live, modernised app.`,
    h1: 'Finalist — AWS AI for Bharat Hackathon (Lazarus)',
    kicker: 'achievement · finalist',
    lead: `Team Lazarus — ${N}, V Kiran Kishore and Keshav S — reached the finals of the AWS AI for Bharat hackathon (Hack2skill with Amazon Web Services) with an engine that resurrects legacy code.`,
    images: [IMG.lazarus],
    og: { kicker: 'achievement · finalist', title: 'AWS AI for Bharat — Lazarus', sub: `Team Lazarus — ${N}` },
    sections: [
      {
        h: 'Quick facts',
        html: facts([
          ['Result', 'Finalist'],
          ['Hackathon', 'AWS AI for Bharat (Hack2skill × Amazon Web Services)'],
          ['Project', `${a('/projects/lazarus-multi-agent-aws/', 'Lazarus')} — the resurrection engine`],
          ['Stack', 'Amazon Bedrock, Lambda, DynamoDB, S3, Docker, FastAPI'],
        ]),
      },
      {
        h: 'The idea',
        html: `<p>The team hit the problem themselves: broken repos, outdated dependencies, code that simply would not run any more. Lazarus takes a GitHub URL and returns a modernised, deployed, working app in about five minutes — reading the whole repository, writing a migration plan with reasoning, rewriting files in parallel, deploying to a live URL, and self-healing by reading logs and patching if the deploy breaks.</p>
<p>It is powered by specialised agents on AWS, with state persisted between stages. Read the ${a('/projects/lazarus-multi-agent-aws/', 'Lazarus project page')} or return to ${a('/achievements/', 'achievements')}.</p>`,
      },
    ],
  }),
);

add(
  evBase({
    path: 'achievements/rota-techx-2025',
    title: `${N} — Top 5, Rota-TechX Hackathon (UrbanPulse)`,
    description: `${N} and team reached the Top 5 of Rota-TechX, a 24-hour hackathon by Rotaract Club of Sri Venkateswara College of Engineering with 600+ registrations, presenting UrbanPulse to Finstein leaders.`,
    h1: 'Top 5 — Rota-TechX Hackathon',
    kicker: 'achievement · top 5',
    lead: `Out of 600+ registrations and 80 finalist teams across 7 themes, ${N}'s team made the Top 5 of Rota-TechX and presented to the leaders at Finstein.`,
    images: [IMG.rotaBadges],
    og: { kicker: 'achievement · top 5', title: 'Rota-TechX Hackathon', sub: `600+ teams → Top 5 — ${N}` },
    sections: [
      {
        h: 'Quick facts',
        html: facts([
          ['Result', 'Top 5 (80 finalist teams, 7 themes, 600+ registrations)'],
          ['Host', 'Rotaract Club of Sri Venkateswara College of Engineering'],
          ['Format', '24-hour hackathon with a grand finale'],
          ['Project', `${a('/projects/urbanpulse-civic-issue-detection/', 'UrbanPulse')} — transparent tech for civic infrastructure`],
          ['Team', 'Keshav S, Yashwanth P T, V Kiran Kishore, Arun Nanthakumar and Vimal Harihar S K'],
        ]),
      },
      {
        h: 'What happened',
        html: `<p>It started with a spark of an idea and a 24-hour countdown: frantic brainstorming, prototypes built from scratch, torn apart and rebuilt after each feedback round. The team presented a smarter, transparent approach to civic infrastructure challenges — a citizen-complaint portal whose auto-classification engine is ${a('/projects/urbanpulse-civic-issue-detection/', 'UrbanPulse')} — and, as Top 5, also sat down with the Finstein leaders to talk through ideas and see their real working practices.</p>
<p>More ${a('/achievements/', 'achievements')}.</p>`,
      },
    ],
  }),
);

add(
  evBase({
    path: 'achievements/nit-trichy-ai-for-all-ideathon',
    title: `${N} — AI For ALL Ideathon, NIT Trichy (Viyatra)`,
    description: `${N} and teammates presented Viyatra, an adaptive urban public-transport idea driven by real-time passenger demand, at the AI For ALL One Day Ideathon at NIT Tiruchirappalli.`,
    h1: 'AI For ALL One Day Ideathon — NIT Tiruchirappalli',
    kicker: 'achievement · ideathon',
    lead: `${N} and teammates Yashwanth P T and Keshav S travelled to NIT Tiruchirappalli to present Viyatra at the AI For ALL One Day Ideathon.`,
    images: [IMG.nitBoard],
    og: { kicker: 'achievement · ideathon', title: 'AI For ALL — NIT Trichy', sub: `Viyatra — ${N}` },
    sections: [
      {
        h: 'Quick facts',
        html: facts([
          ['Event', 'AI For ALL — One Day Ideathon'],
          ['Venue', 'National Institute of Technology, Tiruchirappalli'],
          ['Project', 'Viyatra — adaptive urban public transport'],
          ['Team', 'Yashwanth P T, Keshav S and Vimal Harihar S K'],
        ]),
      },
      {
        h: 'Viyatra',
        html: `<p>Viyatra aims to move urban public transport away from rigid, static timetables towards an adaptive system that responds to real-time passenger demand — reducing overcrowding and making daily commuting more efficient and reliable.</p>
<p>The evaluation, in ${N}'s words, was a masterclass in growth: the judges pushed the team to see the work from new angles and surfaced blind spots. Back to ${a('/achievements/', 'all achievements')}.</p>`,
      },
    ],
  }),
);

add(
  evBase({
    path: 'achievements/amazon-ml-challenge-2026',
    title: `${N} — Amazon ML Challenge 2026: Entity Resolution, Team REZO`,
    description: `Team REZO (${N} and Keshav S) matched real businesses across three noisy datasets in the Amazon ML Challenge 2026 using GPU candidate search, 127 features and two-level XGBoost — score 0.9867.`,
    h1: 'Amazon ML Challenge 2026 — Team REZO',
    kicker: 'achievement · competition',
    lead: `Two people, one laptop with an RTX 4060: Team REZO (${N} and Keshav S) took on the Amazon ML Challenge 2026 entity-resolution problem and reached a leaderboard score of 0.9867, against about 0.9907 at the top.`,
    images: [],
    og: { kicker: 'achievement · competition', title: 'Amazon ML Challenge 2026', sub: `Team REZO — score 0.9867` },
    sections: [
      {
        h: 'Quick facts',
        html: facts([
          ['Task', 'Match the same real businesses across three messy datasets (typos, gaps, planted fake businesses)'],
          ['Scoring', 'A wrong match cost four times a missed one, so knowing when not to predict mattered'],
          ['Approach', 'GPU-powered candidate search, 127 features, two-level XGBoost'],
          ['Score', '0.9749 on the first submission → 0.9867 final (top of the leaderboard ≈ 0.9907)'],
          ['Team', 'Keshav S and Vimal Harihar S K'],
        ]),
      },
      {
        h: 'What the team learned',
        html: `<p>The first score was 0.9749 despite a 0.989 validation score. Instead of tuning blindly, they used the leaderboard to investigate the test data and found differences in the fake-business patterns — and an unseen country, France. Adapting the features and rules pushed the score to 0.9867; the last seven submissions together improved it by just 0.00006.</p>
${ul([
  'Validation does not always reflect real-world performance.',
  'Understanding the data can matter more than a bigger model.',
  'Every assumption needs evidence.',
  'Sometimes you have to know when to stop.',
])}
<p>They did not win, and ${N} says the experience was worth far more than a month of tutorials. More ${a('/achievements/', 'achievements')}.</p>`,
      },
    ],
  }),
);

// ───────── Research ─────────
add({
  path: 'research',
  type: 'CollectionPage',
  title: `Research & Publications of ${N} — IEEE, Springer`,
  description: `Four publications by ${N}: IEEE (AI and gender representation), Springer/Scopus (SecureAI-Cyber), EfficientNet MRI classification (98.84%) and a book chapter on nutrition for Alzheimer's.`,
  h1: `Research & Publications — ${N}`,
  kicker: 'research',
  lead: `Four publications across AI ethics, AI cybersecurity, medical imaging and nutrition. Full list on ${ext(SAME_AS[2], 'Google Scholar')} (indexed as S. K. Vimal Harihar) and ${ext(SAME_AS[3], 'ORCID')}.`,
  images: [IMG.secureAi],
  og: { kicker: 'research', title: `Research of ${N}`, sub: 'IEEE · Springer · Scopus-indexed' },
  sections: [
    {
      h: 'Publications',
      html: ul(
        publications.map((p) => {
          const link =
            p.title.startsWith('AI’s Influence')
              ? a('/research/ai-influence-gender-representation-ieee/', p.title)
              : p.title.startsWith('SecureAI')
                ? a('/research/secureai-cyber-springer-itai-2025/', p.title)
                : p.title;
          return `<strong>${link}</strong> — ${p.type}, ${p.status}${p.date ? ` (${p.date})` : ''}. ${p.note}${p.metric ? ` Result: ${p.metric}.` : ''}`;
        }),
      ),
    },
  ],
});

add({
  path: 'research/ai-influence-gender-representation-ieee',
  type: 'ScholarlyArticle',
  title: `AI & Gender Representation (IEEE paper) — ${N}`,
  description: `IEEE-published paper by ${N}, Keshav S and Prof. Ramya G R on how VR chat, YouTube recommendations and GAN image generation reproduce gender bias — presented at the International Conference on Gender and Technology 2025.`,
  h1: 'AI’s Influence on Gender Representation and Societal Norms in Emerging Technologies',
  headline: 'AI’s Influence on Gender Representation and Societal Norms in Emerging Technologies',
  kicker: 'research · IEEE',
  lead: `A paper by ${N}, Keshav S and Prof. Ramya G R, presented at the International Conference on Gender and Technology 2025 (Amrita Vishwa Vidyapeetham, Amritapuri) and published in IEEE.`,
  images: [IMG.gtcCert],
  og: { kicker: 'research · IEEE', title: 'AI & Gender Representation', sub: `${N} · IEEE · 2025` },
  sections: [
    {
      h: 'Quick facts',
      html: facts([
        ['Authors', `${N}, Keshav S, Prof. Ramya G R`],
        ['Presented', 'International Conference on Gender and Technology 2025, Amrita Vishwa Vidyapeetham, Amritapuri Campus (16–19 January 2025; presented on 18 January)'],
        ['Published', 'IEEE'],
        ['Topic', 'Fairness-aware and inclusive AI'],
      ]),
    },
    {
      h: 'What the paper studies',
      html: `<p>Emerging technologies are not neutral: they reflect the data and assumptions they are built on. The study looked at three platforms:</p>
${ul([
  '<strong>VR chat platforms</strong> — avatar selection and social interaction patterns, where gender norms subtly shape virtual presence.',
  '<strong>YouTube recommendations</strong> — simulated user profiles showed gendered divergence in the content suggested.',
  '<strong>GAN image generation</strong> — prompts such as “CEO” or “nurse” returned skewed outputs: leadership roles male-presenting, caregiving roles female-presenting.',
])}
<p>The paper proposes practical fixes: curated inclusive datasets, regular bias audits and ethics built into the design process.</p>`,
    },
    {
      h: 'Presenting it',
      html: `<p>${N} and Keshav S travelled from Coimbatore to Amritapuri, prepared slides until the last minute, and presented to a hall of PhD scholars and professors. Each answered three questions, and faculty came up afterwards to discuss the work. Back to ${a('/research/', 'all research')}.</p>`,
    },
  ],
});

add({
  path: 'research/secureai-cyber-springer-itai-2025',
  type: 'ScholarlyArticle',
  title: `SecureAI-Cyber (Springer paper) — ${N}`,
  description: `SecureAI-Cyber, co-authored by ${N}, combines LLMs and federated learning for threat detection — 95% accuracy on CICIDS2017 and MITRE ATT&CK, 30% fewer false positives. Springer, Scopus-indexed, ITAI 2025.`,
  h1: 'SecureAI-Cyber: An AI-Powered Cybersecurity Solution for Scalable Threat Management',
  headline: 'SecureAI-Cyber: An AI-Powered Cybersecurity Solution for Scalable Threat Management',
  kicker: 'research · Springer',
  lead: `A Springer, Scopus-indexed paper by Ramya G R, ${N}, Keshav S and Niharika V, presented at the International Conference on Information Technology and Artificial Intelligence (ITAI 2025).`,
  images: [IMG.secureAi],
  og: { kicker: 'research · Springer · Scopus', title: 'SecureAI-Cyber', sub: `${N} · ITAI 2025` },
  sections: [
    {
      h: 'Quick facts',
      html: facts([
        ['Authors', `Ramya G R, ${N}, Keshav S, Niharika V`],
        ['Presented at', 'International Conference on Information Technology and Artificial Intelligence (ITAI 2025), Gurugram University (24–25 January 2025)'],
        ['Published', 'Springer · Scopus-indexed'],
        ['Method', 'Hybrid framework: large language models + federated learning'],
      ]),
    },
    {
      h: 'Key results',
      html: ul([
        '95% detection accuracy on benchmark datasets (CICIDS2017, MITRE ATT&CK)',
        '30% fewer false positives',
        'Privacy-preserving anomaly detection through federated learning',
        'Better threat intelligence and prediction with LLMs',
        'Stronger robustness against Advanced Persistent Threats (APTs)',
      ]) + `<p>Future directions named by the authors: blockchain-based audit trails and improved federated optimisation. Back to ${a('/research/', 'all research')}.</p>`,
    },
  ],
});

// ───────── Projects ─────────
const proj = (id) => projects.find((p) => p.id === id);
add({
  path: 'projects',
  type: 'CollectionPage',
  title: `Projects by ${N} — Phanovex, Lazarus, REZO, AVAV, UrbanPulse`,
  description: `Projects by ${N}: Phanovex (Caterpillar Tech Challenge), Lazarus (AWS AI for Bharat), REZO (VS Code extension), AVAV, UrbanPulse, Lekhaflow, CardioSync, LexRedact and a distributed key-value store.`,
  h1: `Projects by ${N}`,
  kicker: 'missions',
  lead: `AI systems, edge ML, distributed systems and developer tools — each with source on GitHub.`,
  images: [{ ...IMG.phanovex }, { ...IMG.lazarus }, { ...IMG.avav }],
  og: { kicker: 'missions', title: `Projects by ${N}`, sub: 'Phanovex · Lazarus · REZO · AVAV · UrbanPulse' },
  sections: [
    {
      h: 'All projects',
      html: ul(
        projects.map((p) => {
          const page = { phanovex: 'phanovex-carry-back-intelligence', lazarus: 'lazarus-multi-agent-aws', avav: 'avav-autonomous-visual-asset-validator', rezo: 'rezo-encrypted-chat-vs-code', urbanpulse: 'urbanpulse-civic-issue-detection' }[p.id];
          const title = page ? a(`/projects/${page}/`, p.title) : p.title;
          return `<strong>${title}</strong> — ${p.subtitle} (${p.year}; ${p.badge}). ${p.description} ${ext(p.link, 'Source on GitHub')}${p.live ? ` · ${ext(p.live, 'Live demo')}` : ''}`;
        }),
      ),
    },
  ],
});

const projectPage = (id, slug, image, extra = {}) => {
  const p = proj(id);
  return {
    path: `projects/${slug}`,
    type: 'SoftwareSourceCode',
    project: p,
    title: `${p.title} — ${extra.shortSub} | ${N}`,
    description: `${p.title} by ${N}: ${p.description}`.slice(0, 300),
    h1: `${p.title} — ${p.subtitle}`,
    kicker: `project · ${p.badge}`,
    lead: p.description,
    images: image ? [image] : [],
    og: { kicker: `project · ${p.year}`, title: p.title, sub: `${p.subtitle} — ${N}` },
    sections: [
      {
        h: 'Quick facts',
        html: facts([
          ['Built by', `${N}${extra.team ? ` with ${extra.team}` : ''}`],
          ['Year', p.year],
          ['Context', p.badge],
          ['Headline metric', `${p.metric.value} — ${p.metric.label}`],
          ['Stack', p.tech.join(', ')],
          ['Source', ext(p.link, p.link.replace('https://', ''))],
        ]),
      },
      { h: 'How it works', html: ul(p.points) },
      ...(extra.sections || []),
      {
        h: 'Links',
        html: `<p>${ext(p.link, 'Source code')}${p.deck ? ` · ${a(p.deck.pdf, `${p.deck.title} (PDF)`)}` : ''}${p.live ? ` · ${ext(p.live, 'Live demo')}` : ''} · ${a('/projects/', 'all projects')} · ${a('/', 'interactive portfolio')}</p>`,
      },
    ],
  };
};

add(
  projectPage('phanovex', 'phanovex-carry-back-intelligence', IMG.phanovex, {
    shortSub: 'Carry-Back Intelligence',
    team: 'Keshav S, Yashwanth P T and Srividya Manikandan',
    sections: [
      {
        h: 'Result',
        html: `<p>Phanovex took the team to the Top 10 Grand Finalists of the Caterpillar Tech Challenge 2026, out of 8,100+ teams. Read the ${a('/achievements/caterpillar-tech-challenge-2026/', 'full Caterpillar write-up')}.</p>`,
      },
    ],
  }),
);
add(
  projectPage('lazarus', 'lazarus-multi-agent-aws', IMG.lazarus, {
    shortSub: 'Multi-Agent Platform on AWS',
    team: 'V Kiran Kishore and Keshav S',
    sections: [
      {
        h: 'Result',
        html: `<p>Finalist at the AWS AI for Bharat hackathon. Read the ${a('/achievements/aws-ai-for-bharat-lazarus/', 'full write-up')}.</p>`,
      },
    ],
  }),
);
add(projectPage('avav', 'avav-autonomous-visual-asset-validator', IMG.avav, { shortSub: 'Visual Asset Validator' }));
add(
  projectPage('rezo', 'rezo-encrypted-chat-vs-code', IMG.rezoLogo, {
    shortSub: 'Encrypted Chat in VS Code',
    team: 'Arun Nanthakumar, V Kiran Kishore, Yashwanth P T and Keshav S',
    sections: [
      {
        h: 'Why it exists',
        html: `<p>Messaging a teammate usually means leaving the editor: switch tabs, open a chat app, get pulled into unread messages, then find your way back. REZO brings that into the code file itself, with one action to send and one to receive, so deep work is not broken. It is published on the Visual Studio Code Marketplace.</p>`,
      },
    ],
  }),
);
add(projectPage('urbanpulse', 'urbanpulse-civic-issue-detection', null, {
  shortSub: 'Civic-Issue Detection',
  team: 'Keshav S, Yashwanth P T, V Kiran Kishore and Arun Nanthakumar',
  sections: [
    {
      h: 'Result',
      html: `<p>Presented at Rota-TechX, where the team reached the Top 5 of 600+ registrations. Read the ${a('/achievements/rota-techx-2025/', 'full write-up')}.</p>`,
    },
  ],
}));
