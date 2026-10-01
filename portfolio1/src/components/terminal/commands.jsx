import {
  profile,
  socials,
  skillCategories,
  projects,
  experience,
  achievements,
  publications,
  certifications,
  neofetch,
  sections,
} from '../../data/profile';
import { THEMES, THEME_KEYS, setTheme } from '../../lib/themes';
import { getState, setState, robotDo, robotSay, emit } from '../../lib/store';
import { scrollToTarget } from '../../lib/smoothScroll';
import { SECRETS, getUnlocked, unlock } from '../../lib/secrets';
import { activateGodMode } from '../Overlays';

// Each handler receives (args, ctx). ctx.print(lines, kind) writes output;
// ctx.sequence([...]) prints lines over time; ctx.close() closes the window.

const A = ({ href, children }) => (
  <a className="t-link" href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
    {children}
  </a>
);

const bar = (level, width = 20) => {
  const n = Math.round((level / 100) * width);
  return '█'.repeat(n) + '░'.repeat(width - n);
};

const NEOFETCH_ART = [
  '__      __ _    _ ',
  '\\ \\    / /| |  | |',
  ' \\ \\  / / | |__| |',
  '  \\ \\/ /  |  __  |',
  '   \\  /   | |  | |',
  '    \\/    |_|  |_|',
];

const FILES = {
  'about.txt': () => [profile.summary],
  'skills.json': () =>
    JSON.stringify(
      Object.fromEntries(skillCategories.map((c) => [c.id, Object.fromEntries(c.skills.map((s) => [s.name, s.level]))])),
      null,
      2,
    ).split('\n'),
  'contact.sh': () => [`#!/bin/sh`, `echo "${profile.email}"`, `echo "${profile.phone}"`, `open ${socials[1].href}`],
  'publications.bib': () => publications.map((p) => `@article{ title = "${p.title}", status = "${p.status}" }`),
  'logs.git': () => experience.map((e) => `${e.hash}  ${e.role} @ ${e.org}  (${e.period})`),
  '.secrets': () => {
    const got = getUnlocked();
    return SECRETS.map((s) => `${got.includes(s.id) ? '[x]' : '[ ]'} ${got.includes(s.id) ? s.name : '???'} — ${s.hint}`);
  },
  'resume.pdf': () => ['cat: resume.pdf: binary file. Try `resume` instead.'],
};

const SECTION_IDS = [...sections.map((s) => s.id), 'top'];
const SECTION_ALIASES = {
  home: 'top',
  whoami: 'about',
  stack: 'skills',
  research: 'skills',
  os: 'desktop',
  'vh.os': 'desktop',
  games: 'desktop',
  missions: 'projects',
  logs: 'experience',
  connect: 'contact',
};
const APPS = ['terminal', 'quiz', 'firewall', 'life', 'secrets', 'readme', 'clock', 'trash'];
const ROBOT_ACTIONS = ['wave', 'dance', 'spin', 'glitch', 'happy', 'nod', 'say'];

const FORTUNES = [
  'There are 10 types of people: those who understand binary and those who do not.',
  'It works on my machine. — every developer, ever',
  'The best error message is the one that never shows up.',
  'First, solve the problem. Then, write the code.',
  'Weeks of coding can save you hours of planning.',
  'A model is only as good as the hardware it fits on.',
];

export const COMMANDS = {
  help: {
    desc: 'list commands',
    run: (_, { print }) => {
      print(['Available commands:', '']);
      print(
        Object.entries(COMMANDS)
          .filter(([, c]) => !c.hidden)
          .map(([name, c]) => `  ${name.padEnd(14)} ${c.desc}`),
      );
      print(['', 'Tab completes · ↑/↓ history · Ctrl+L clears'], 'dim');
    },
  },
  whoami: {
    desc: 'who is Vimal',
    run: (_, { print }) =>
      print([`${profile.name} — ${profile.roles[0]} & ${profile.roles[1]}.`, profile.tagline], 'out'),
  },
  about: {
    desc: 'the longer version',
    run: (_, { print }) => print([profile.summary, '', `Interests: ${profile.interests.join(' · ')}`]),
  },
  neofetch: {
    desc: 'system info',
    run: (_, { print }) => {
      const info = [
        `${profile.handle}@github`,
        '-----------------',
        ...neofetch.flat().map(([k, v]) => `${k}: ${v}`),
        `Theme: ${THEMES[getState().theme].label}`,
      ];
      const rows = Math.max(NEOFETCH_ART.length, info.length);
      const lines = Array.from({ length: rows }, (_, i) => (
        <span>
          <span className="accent">{(NEOFETCH_ART[i] || '').padEnd(22)}</span>
          {info[i] || ''}
        </span>
      ));
      print(lines);
      print([
        <span className="t-swatches" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>,
      ]);
    },
  },
  skills: {
    desc: 'loaded modules [lang|ml|web|cloud]',
    args: () => skillCategories.map((c) => c.id),
    run: (args, { print }) => {
      const cats = args[0] ? skillCategories.filter((c) => c.id === args[0]) : skillCategories;
      if (!cats.length) return print(`skills: unknown module '${args[0]}'`, 'err');
      cats.forEach((c) => {
        print(`[${c.file}]`, 'accent');
        print(c.skills.map((s) => `  ${s.name.padEnd(24)} ${bar(s.level)} ${s.level}%`));
      });
    },
  },
  projects: {
    desc: 'list missions',
    run: (_, { print }) => {
      print(projects.map((p) => `  ${p.id.padEnd(12)} ${p.title} — ${p.subtitle} (${p.metric.value})`));
      print('Run `project <id>` for details.', 'dim');
    },
  },
  project: {
    desc: 'mission details <id>',
    args: () => projects.map((p) => p.id),
    run: (args, { print }) => {
      const p = projects.find((x) => x.id === (args[0] || '').toLowerCase());
      if (!p) return print('usage: project <' + projects.map((x) => x.id).join('|') + '>', 'err');
      print(`${p.title} — ${p.subtitle} [${p.year}]`, 'accent');
      print([p.description, ...p.points.map((pt) => `  • ${pt}`), `  stack: ${p.tech.join(', ')}`]);
      print([<A href={p.link}>→ source on GitHub</A>]);
    },
  },
  decks: {
    desc: 'pitch decks',
    run: (_, { print }) => {
      print(projects.filter((p) => p.deck).map((p) => `  ${p.id.padEnd(12)} ${p.deck.slides} slides — ${p.deck.title}`));
      print('Run `deck <id>` to open one.', 'dim');
    },
  },
  deck: {
    desc: 'open a slide deck <id>',
    args: () => projects.filter((p) => p.deck).map((p) => p.id),
    run: (args, { print }) => {
      const p = projects.find((x) => x.id === (args[0] || '').toLowerCase() && x.deck);
      if (!p) return print(`usage: deck <${projects.filter((x) => x.deck).map((x) => x.id).join('|')}>`, 'err');
      emit('deck:open', p.id);
      return print([`opening ${p.title} deck (${p.deck.slides} slides)…`, <A href={p.deck.pdf}>{p.id}_deck.pdf</A>], 'ok');
    },
  },
  experience: {
    desc: 'work log',
    run: (_, { print }) =>
      experience.forEach((e) => {
        print(`${e.hash} ${e.head ? '(HEAD -> main) ' : ''}${e.role} @ ${e.org} — ${e.period}`, 'accent');
        print(e.points.map((pt) => `    ${pt}`));
      }),
  },
  achievements: {
    desc: 'trophy case',
    run: (_, { print }) => print(achievements.map((a) => `  ★ ${a.title.padEnd(16)} ${a.event}${a.year ? ` (${a.year})` : ''}`)),
  },
  research: {
    desc: 'research papers',
    run: (a, ctx) => COMMANDS.publications.run(a, ctx),
  },
  certs: {
    desc: 'certifications',
    run: (_, { print }) => print(certifications.map((c) => `  ✓ ${c.name} — ${c.org}`)),
  },
  publications: {
    hidden: true,
    desc: 'research papers',
    run: (_, { print }) => print(publications.map((p) => `  [${p.status}] ${p.title}${p.date ? ` — ${p.date}` : ''}`)),
  },
  contact: {
    desc: 'reach Vimal',
    run: (_, { print }) =>
      print([
        <span>
          email: <A href={`mailto:${profile.email}`}>{profile.email}</A>
        </span>,
        <span>
          phone: <A href={`tel:${profile.phone.replace(/-/g, '')}`}>{profile.phone}</A>
        </span>,
        ...socials
          .filter((s) => s.label !== 'Email')
          .map((s) => (
            <span>
              {s.label.toLowerCase()}: <A href={s.href}>{s.handle}</A>
            </span>
          )),
      ]),
  },
  socials: { desc: 'links', run: (a, ctx) => COMMANDS.contact.run(a, ctx), hidden: true },
  resume: {
    desc: 'download resume.pdf',
    run: (_, { print }) => {
      unlock('resume');
      window.open(profile.resume, '_blank', 'noopener');
      print([<A href={profile.resume}>resume.pdf</A>, 'Opening in a new tab…']);
    },
  },
  open: {
    desc: 'launch an app <name>',
    args: () => APPS,
    run: (args, { print }) => {
      const app = (args[0] || '').toLowerCase();
      if (!APPS.includes(app)) return print(`usage: open <${APPS.join('|')}>`, 'err');
      emit('os:open', app);
      print(`launching ${app}…`, 'ok');
    },
  },
  goto: {
    desc: 'scroll to a section',
    args: () => [...SECTION_IDS, ...Object.keys(SECTION_ALIASES)],
    run: (args, { print }) => {
      const raw = (args[0] || '').toLowerCase();
      const id = SECTION_ALIASES[raw] || raw;
      if (!SECTION_IDS.includes(id)) return print(`usage: goto <${SECTION_IDS.join('|')}>`, 'err');
      if (id === 'top') scrollToTarget(0);
      else if (id === 'desktop') scrollToTarget('#desk', { offset: -46 });
      else scrollToTarget(`#${id}`);
      print(`cd ~/${id}`, 'ok');
    },
  },
  theme: {
    desc: 'color scheme [name]',
    args: () => THEME_KEYS,
    run: (args, { print }) => {
      if (!args[0]) {
        print(THEME_KEYS.map((k) => `  ${k === getState().theme ? '●' : '○'} ${k}`));
        return print('usage: theme <name>', 'dim');
      }
      if (!setTheme(args[0].toLowerCase())) return print(`theme: no such theme '${args[0]}'`, 'err');
      unlock('theme');
      print(`theme → ${args[0]}`, 'ok');
    },
  },
  crt: {
    desc: 'scanlines on|off',
    args: () => ['on', 'off'],
    run: (args, { print }) => {
      const on = args[0] ? args[0] === 'on' : !getState().crt;
      setState({ crt: on });
      print(`crt ${on ? 'enabled' : 'disabled'}`, 'ok');
    },
  },
  matrix: {
    desc: 'toggle digital rain',
    run: (_, { print }) => {
      const on = !getState().matrix;
      setState({ matrix: on });
      print(on ? 'Wake up, visitor…' : 'Back to the desert of the real.', 'ok');
    },
  },
  robot: {
    desc: 'command VH-01 <action>',
    args: () => ROBOT_ACTIONS,
    run: (args, { print }) => {
      const action = (args[0] || '').toLowerCase();
      if (action === 'say') {
        const text = args.slice(1).join(' ') || 'Hello, world.';
        robotSay(text.slice(0, 120));
        return print('VH-01 is speaking (scroll to the top to see it).', 'ok');
      }
      if (!ROBOT_ACTIONS.includes(action)) return print(`usage: robot <${ROBOT_ACTIONS.join('|')}>`, 'err');
      robotDo(action);
      print(`VH-01: executing ${action}. (It lives at the top of the page.)`, 'ok');
    },
  },
  hack: {
    desc: 'totally real hacking <target>',
    run: (args, { sequence }) => {
      const target = args.join(' ') || 'mainframe';
      if (/nasa|pentagon|fbi|cia|bank/i.test(target)) {
        return sequence([
          [`[*] Resolving ${target}…`, 'out'],
          ['[!] Nice try. VH-01 has reported you to your mom.', 'err'],
        ]);
      }
      emit('scene:glitch', 0.7);
      return sequence([
        [`[*] Initiating connection to ${target}…`, 'out'],
        ['[*] Spoofing MAC address ......... done', 'out'],
        ['[*] Bypassing firewall ............ done', 'out'],
        ['[*] Injecting payload [■■■■■■■■□□] 82%', 'out'],
        ['[*] Cracking hash 5f4dcc3b5aa765d61d8327deb882cf99 → "password" (seriously?)', 'warn'],
        ['[+] ACCESS GRANTED', 'ok'],
        ['…just kidding. The only thing hacked here is your attention. For the real stuff: `contact`.', 'dim'],
      ]);
    },
  },
  sudo: {
    desc: 'try `sudo hire-vimal`',
    args: () => ['hire-vimal'],
    run: (args, { print, sequence }) => {
      const cmd = args.join(' ');
      if (/^hire[- ]?vimal/i.test(cmd)) {
        unlock('sudo');
        robotDo('dance');
        return sequence([
          ['[sudo] password for visitor: ********', 'dim'],
          ['Authenticated. Privileges escalated.', 'ok'],
          ['Drafting offer letter ........ done', 'out'],
          ['Attaching resume.pdf ......... done', 'out'],
          [
            <span>
              Ready to send → <A href={`mailto:${profile.email}?subject=Let%27s%20work%20together`}>{profile.email}</A>
            </span>,
            'ok',
          ],
        ]);
      }
      if (/rm\s+-rf/.test(cmd)) return print('Nice try. Permission denied (and also: why?)', 'err');
      if (!cmd) return print('usage: sudo <command>', 'err');
      return print('visitor is not in the sudoers file. This incident will be reported.', 'err');
    },
  },
  godmode: {
    desc: 'on|off',
    hidden: true,
    run: (args, { print }) => {
      if (args[0] === 'off') {
        setState({ godMode: false, matrix: false });
        setTheme('time');
        return print('God mode disabled. Mortality restored.', 'ok');
      }
      activateGodMode();
      return print('God mode enabled.', 'ok');
    },
  },
  ls: {
    desc: 'list files',
    run: (_, { print, cwd }) => {
      if (cwd === '~/missions') return print(projects.map((p) => `${p.id}.app`).join('   '));
      print(['about.txt   skills.json   missions/   logs.git', 'publications.bib   contact.sh   resume.pdf   .secrets']);
    },
  },
  cat: {
    desc: 'print a file',
    args: () => Object.keys(FILES),
    run: (args, { print }) => {
      const f = FILES[args[0]];
      if (!args[0]) return print('usage: cat <file>', 'err');
      if (args[0].startsWith('missions')) return print(`cat: ${args[0]}: Is a directory`, 'err');
      if (!f) return print(`cat: ${args[0]}: No such file or directory`, 'err');
      return print(f());
    },
  },
  cd: {
    desc: 'change directory',
    args: () => ['missions', '..', '~'],
    run: (args, { print, setCwd }) => {
      const d = args[0] || '~';
      if (d === 'missions' || d === 'missions/') return setCwd('~/missions');
      if (d === '..' || d === '~' || d === '/') return setCwd('~');
      return print(`cd: ${d}: No such file or directory`, 'err');
    },
  },
  pwd: { desc: 'where am i', run: (_, { print, cwd }) => print(cwd.replace('~', '/home/visitor')) },
  echo: { desc: 'print text', run: (args, { print }) => print(args.join(' ')) },
  date: { desc: 'current date', run: (_, { print }) => print(new Date().toString()) },
  history: { desc: 'command history', run: (_, { print, history }) => print(history.map((h, i) => `  ${i + 1}  ${h}`)) },
  fortune: { desc: 'words of wisdom', run: (_, { print }) => print(FORTUNES[(Math.random() * FORTUNES.length) | 0]) },
  coffee: {
    desc: 'brew',
    hidden: true,
    run: (_, { sequence }) =>
      sequence([
        ['Brewing coffee ……', 'out'],
        ['Error 418: I am a teapot.', 'err'],
      ]),
  },
  ping: {
    desc: 'ping a host',
    run: (args, { sequence }) => {
      const host = args[0] || 'vimal.dev';
      return sequence(
        [1, 2, 3].map((i) => [`64 bytes from ${host}: icmp_seq=${i} ttl=64 time=${(Math.random() * 20 + 8).toFixed(1)} ms`, 'out']),
      );
    },
  },
  rm: { desc: 'remove', hidden: true, run: (_, { print }) => print("rm: cannot remove: Vimal's code is load-bearing.", 'err') },
  vim: { desc: 'editor', hidden: true, run: (_, { print }) => print("You're stuck in vim now. Just kidding — type `exit`. Or don't.", 'warn') },
  exit: {
    desc: 'close the shell',
    run: (_, { print, close }) => {
      print('logout', 'dim');
      setTimeout(close, 350);
    },
  },
  clear: { desc: 'clear the screen', run: (_, { clear }) => clear() },
};

export const COMMAND_NAMES = Object.keys(COMMANDS);
