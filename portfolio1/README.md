# VH.OS — Vimal Harihar's portfolio

A hacker-themed, single-page portfolio built like a tiny retro operating system.
A procedural 3D robot rendered in 1-bit through an ordered-dither shader, scroll
parallax through a dithered data-space, and a playable desktop with a shell and
two hacking games.

## Highlights

- **1-bit 3D world** — React Three Fiber scene (robot, halftone planets, wireframes,
  dust, grid) rendered at a fraction of device resolution and dithered (Bayer 8×8)
  into the theme's inks. Cheap on the GPU and upscaled pixel-crisp.
- **VH-01, the robot** — procedural (no model files). Tracks the cursor, blinks,
  has expressions, waves, dances, glitches. Click it; or drive it from the shell.
- **Parallax everywhere** — the camera descends through the 3D world as you
  scroll, `data-speed` layers drift in the DOM, hero widgets react to the mouse,
  and the missions section is a pinned horizontal scroll with inner parallax.
- **VH.OS desktop** — draggable windows with retro zoom-rect animations:
  - `Terminal` — ~35 commands (`help`, `neofetch`, `projects`, `hack`, `sudo hire-vimal`, `theme`, `robot`, …), tab completion, history.
  - `KNOW_VIMAL.exe` — "how well do you know Vimal?" quiz: 10 random questions, timer, streaks, ranks.
  - `FIREWALL.exe` — typing-defense arcade game with combos and a high score.
  - `Glider 1.1` — paintable Conway's Game of Life.
  - Clock, README, Secrets, Trash.
- **11 hidden secrets** tracked in the menu bar (★), saved in `localStorage`.
- **5 themes** — phosphor, ice, redteam, amber and a light `paper` mode.
- Smooth scrolling (Lenis + GSAP ScrollTrigger), `prefers-reduced-motion`
  support, keyboard-playable games, and a compact launcher layout on phones.

## Stack

Vite · React 19 · three.js / @react-three/fiber · GSAP (ScrollTrigger, ScrambleText) · Lenis

## Develop

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # outputs to build/
npm run preview   # serve the production build
```

Requires Node 20.19+.

## Edit the content

Everything text-based lives in **`src/data/profile.js`** — roles, summary,
stats, skills, experience, achievements, publications and projects. Sections,
the terminal and the games all read from it.

The contact form posts to Formspree (`FORMSPREE` in `src/sections/Connect.jsx`).
If sending fails it falls back to a `mailto:` link.

## Structure

```
src/
  data/profile.js          content
  lib/                     store/event bus, themes, motion, smooth scroll, secrets
  components/three/        Scene, Robot, World, DitherPass
  components/terminal/     shell + command table
  components/games/        KnowVimal, Firewall, Life, TrophyShooter
  components/os/           desktop icons + small apps
  sections/                Hero, About, Stack, Desktop, Missions, Logs, Connect, Footer
```

## Deploy

`vercel.json` builds with `npm run build`, serves `build/`, rewrites every route
to `index.html` (old `/about`, `/projects` … links deep-link into the page) and
caches hashed assets forever.
