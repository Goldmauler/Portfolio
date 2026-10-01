import './ProjectVisual.css';

// Animated 1-bit illustrations for each mission card (pure SVG + CSS).

const ecgBeat = (x0) =>
  [
    [0, 0],
    [20, 0],
    [25, -5],
    [30, 0],
    [38, 0],
    [41, 8],
    [45, -50],
    [49, 18],
    [53, 0],
    [65, 0],
    [72, -10],
    [80, 0],
    [100, 0],
  ]
    .map(([x, y]) => `${x0 + x},${110 + y}`)
    .join(' ');

const ECG = Array.from({ length: 9 }, (_, i) => ecgBeat(i * 100)).join(' ');

function Agents() {
  const stages = ['INSPECT', 'ARCHITECT', 'BUILD', 'DEPLOY', 'VALIDATE'];
  return (
    <svg viewBox="0 0 400 200" className="pv pv--agents">
      <text x="10" y="40" className="pv-label">repo.git</text>
      <text x="390" y="40" className="pv-label" textAnchor="end">
        → live URL
      </text>
      <line x1="10" y1="95" x2="390" y2="95" className="pv-line" />
      {stages.map((s, i) => (
        <g key={s} transform={`translate(${12 + i * 77} 78)`}>
          <rect width="66" height="34" className={`pv-box pv-box--${i}`} />
          <text x="33" y="21" textAnchor="middle" className="pv-mini">
            {s}
          </text>
        </g>
      ))}
      <rect className="pv-packet" x="10" y="91" width="8" height="8" />
      <path d="M352 112 C352 170, 186 170, 186 112" className="pv-loop" />
      <text x="269" y="168" textAnchor="middle" className="pv-label pv-acc">
        self-heal loop
      </text>
    </svg>
  );
}

function Ecg() {
  return (
    <svg viewBox="0 0 400 200" className="pv pv--ecg">
      <g className="pv-ecg">
        <polyline points={ECG} className="pv-wave" />
      </g>
      <rect x="0" y="0" width="400" height="200" className="pv-ecg-fade" />
      <text x="12" y="30" className="pv-label">
        HR <tspan className="pv-acc">72</tspan> bpm
      </text>
      <text x="12" y="48" className="pv-label">
        class: <tspan className="pv-acc">N</tspan> (normal) · 5-class 1D-CNN
      </text>
      <text x="388" y="188" textAnchor="end" className="pv-mini">
        nano 33 ble · 128 sps · tflite-micro
      </text>
    </svg>
  );
}

function Cursors() {
  return (
    <svg viewBox="0 0 400 200" className="pv pv--cursors">
      <path d="M40 150 C100 40, 180 180, 250 90 S360 60, 370 120" className="pv-stroke" />
      <rect x="230" y="40" width="110" height="46" className="pv-sticky" />
      <text x="240" y="60" className="pv-mini">
        crdt: merged ✓
      </text>
      <text x="240" y="76" className="pv-mini">
        3 peers · 60 fps
      </text>
      {[
        ['vimal', 'pv-cur pv-cur--a'],
        ['ana', 'pv-cur pv-cur--b'],
        ['dev', 'pv-cur pv-cur--c'],
      ].map(([name, cls]) => (
        <g key={name} className={cls}>
          <path d="M0 0 L0 14 L4 10 L7 17 L9 16 L6 9 L11 9 Z" className="pv-arrow" />
          <rect x="10" y="14" width={name.length * 7 + 8} height="13" className="pv-name" />
          <text x="14" y="24" className="pv-mini pv-inv">
            {name}
          </text>
        </g>
      ))}
    </svg>
  );
}

function Layers() {
  const layer = (y, cls) => <path d={`M200 ${y} L330 ${y + 38} L200 ${y + 76} L70 ${y + 38} Z`} className={cls} />;
  return (
    <svg viewBox="0 0 400 200" className="pv pv--layers">
      <defs>
        <pattern id="pv-dots" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="1.2" height="1.2" className="pv-fill" />
        </pattern>
        <pattern id="pv-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="1.2" height="5" className="pv-fill" />
        </pattern>
      </defs>
      <g className="pv-layer pv-layer--3">{layer(104, 'pv-iso pv-iso--hatch')}</g>
      <g className="pv-layer pv-layer--2">{layer(72, 'pv-iso pv-iso--dots')}</g>
      <g className="pv-layer pv-layer--1">{layer(40, 'pv-iso')}</g>
      <line x1="150" y1="20" x2="250" y2="196" className="pv-fault" />
      <text x="12" y="30" className="pv-label">
        horizons: <tspan className="pv-acc">3</tspan>
      </text>
      <text x="12" y="48" className="pv-label">
        fault: <tspan className="pv-acc">F-01</tspan>
      </text>
    </svg>
  );
}

function Browser() {
  return (
    <svg viewBox="0 0 400 200" className="pv pv--browser">
      <rect x="40" y="16" width="320" height="172" className="pv-box" />
      <line x1="40" y1="36" x2="360" y2="36" className="pv-line" />
      <rect x="110" y="21" width="180" height="10" className="pv-url" />
      <text x="116" y="30" className="pv-mini">
        https://hivetz.in
      </text>
      <rect x="40" y="36" width="320" height="2" className="pv-load" />
      <rect x="56" y="50" width="288" height="56" className="pv-block pv-block--1" />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={56 + i * 99} y="116" width="90" height="58" className={`pv-block pv-block--${i + 2}`} />
      ))}
    </svg>
  );
}

// Side profile of a CAT-797-style haul truck (front to the right). The dump
// body is drawn "x-ray" so the carry-back pile and its SAM mask show through.
const BODY = 'M52 50 L298 42 L304 106 L112 110 L72 94 L54 68 Z';
const bodyTop = (x) => 50 - (8 * (x - 52)) / 246;
const bodyBottom = (x) => (x >= 112 ? 110 - (4 * (x - 112)) / 192 : 94 + (16 * (x - 72)) / 40);
const RIBS = [92, 132, 172, 212, 252];
const TREAD_DASH = '5.2 3.4';

function Tire({ cx, cy }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="33" className="pv-tire" />
      <circle cx={cx} cy={cy} r="29" className="pv-tread" strokeDasharray={TREAD_DASH} />
      <circle cx={cx} cy={cy} r="17" className="pv-rim" />
      <circle cx={cx} cy={cy} r="12" className="pv-rim pv-rim--inner" />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <circle
          key={a}
          cx={cx + 8.5 * Math.cos((a * Math.PI) / 180)}
          cy={cy + 8.5 * Math.sin((a * Math.PI) / 180)}
          r="1.6"
          className="pv-hub"
        />
      ))}
      <circle cx={cx} cy={cy} r="4.5" className="pv-hub" />
    </g>
  );
}

function Truck() {
  return (
    <svg viewBox="0 0 400 200" className="pv pv--truck">
      <defs>
        <pattern id="pv-dots-truck" width="3" height="3" patternUnits="userSpaceOnUse">
          <rect width="1.5" height="1.5" className="pv-fill-acc" />
        </pattern>
        <clipPath id="pv-body-clip">
          <path d={BODY} />
        </clipPath>
      </defs>

      {/* ground + dust */}
      <line x1="6" y1="189" x2="394" y2="189" className="pv-line" />
      {[30, 46, 380].map((x, i) => (
        <rect key={x} x={x} y={190 + (i % 2) * 3} width="6" height="1.5" className="pv-fill" />
      ))}

      <g className="pv-truck">
        {/* hoist cylinder + frame */}
        <line x1="166" y1="122" x2="200" y2="108" className="pv-hoist" />
        <rect x="90" y="113" width="268" height="11" className="pv-box" />
        <rect x="90" y="113" width="268" height="3" className="pv-fill" />

        {/* dump body (x-ray) */}
        <path d={BODY} className="pv-body" />
        <g clipPath="url(#pv-body-clip)">
          {/* carry-back stuck in the tail corner + floor */}
          <path
            d="M70 92 Q84 82 98 95 Q112 88 128 100 Q150 94 168 104 Q186 100 204 108 L204 112 L112 112 L72 96 Z"
            fill="url(#pv-dots-truck)"
          />
          <line x1="0" y1="40" x2="0" y2="112" className="pv-sweep" />
        </g>
        <path d="M66 89 Q84 77 99 91 Q113 84 129 96 Q151 90 169 100 Q188 96 208 104" className="pv-mask" />
        {RIBS.map((x) => (
          <line key={x} x1={x} y1={bodyTop(x) + 4} x2={x} y2={bodyBottom(x) - 2} className="pv-rib" />
        ))}
        <line x1="48" y1="51" x2="302" y2="41" className="pv-rail" />
        <line x1="60" y1="70" x2="300" y2="62" className="pv-rib" />

        {/* canopy over the cab */}
        <path d="M296 41 L366 36 L368 46 L302 52 Z" className="pv-canopy" />
        {/* cab, deck, grille, bumper, ladder */}
        <rect x="314" y="58" width="38" height="38" className="pv-box" />
        <rect x="319" y="62" width="28" height="15" className="pv-glass" />
        <line x1="333" y1="62" x2="333" y2="94" className="pv-rib" />
        <rect x="304" y="96" width="70" height="6" className="pv-box" />
        <rect x="356" y="102" width="16" height="24" className="pv-box" />
        {[107, 112, 117, 122].map((y) => (
          <line key={y} x1="359" y1={y} x2="369" y2={y} className="pv-rib" />
        ))}
        <rect x="352" y="124" width="26" height="8" className="pv-box" />
        <line x1="378" y1="102" x2="362" y2="146" className="pv-ladder" />
        <line x1="386" y1="102" x2="370" y2="146" className="pv-ladder" />
        {[110, 119, 128, 137].map((y) => {
          const t = (y - 102) / 44;
          return <line key={y} x1={378 - 16 * t} y1={y} x2={386 - 16 * t} y2={y} className="pv-ladder" />;
        })}
        <path d="M286 128 A40 40 0 0 1 358 128" className="pv-fender" />

        {/* sensors: stereo camera on the canopy, load cells on the frame */}
        <rect x="284" y="28" width="20" height="10" className="pv-cam" />
        <circle cx="290" cy="33" r="2" className="pv-hub" />
        <circle cx="298" cy="33" r="2" className="pv-hub" />
        <line x1="288" y1="38" x2="90" y2="92" className="pv-ray" />
        <line x1="300" y1="38" x2="200" y2="106" className="pv-ray" />
        <rect x="118" y="108" width="7" height="5" className="pv-lc" />
        <rect x="282" y="104" width="7" height="5" className="pv-lc pv-lc--b" />

        <Tire cx={136} cy={155} />
        <Tire cx={322} cy={155} />
      </g>

      {/* HUD */}
      <text x="10" y="18" className="pv-label">
        SAM3 mask · carry-back <tspan className="pv-acc">6.8%</tspan>
      </text>
      <text x="10" y="31" className="pv-mini pv-blink">
        risk ▲ <tspan className="pv-acc">HIGH</tspan> — clean before next load
      </text>
    </svg>
  );
}

const LOOP_PATH = 'M200 40 L320 128 L80 128 Z';

function Loop3d() {
  const nodes = [
    [200, 40, 'GENERATE', 'meshy.ai'],
    [320, 128, 'AUDIT', 'gemini vision'],
    [80, 128, 'CORRECT', 'memory agent'],
  ];
  return (
    <svg viewBox="0 0 400 200" className="pv pv--loop">
      <path d={LOOP_PATH} className="pv-loop" />
      <circle r="5" className="pv-dot">
        <animateMotion dur="3.6s" repeatCount="indefinite" path={LOOP_PATH} />
      </circle>
      {nodes.map(([x, y, a, b]) => (
        <g key={a} transform={`translate(${x - 44} ${y - 15})`}>
          <rect width="88" height="30" className="pv-box" />
          <text x="44" y="13" textAnchor="middle" className="pv-mini">
            {a}
          </text>
          <text x="44" y="24" textAnchor="middle" className="pv-mini pv-dim">
            {b}
          </text>
        </g>
      ))}
      <g className="pv-cube" transform="translate(200 102)">
        <path d="M0 -18 L18 -8 L18 12 L0 22 L-18 12 L-18 -8 Z" className="pv-box" />
        <path d="M0 -18 L0 2 M0 2 L18 -8 M0 2 L-18 -8 M0 2 L0 22" className="pv-line" />
      </g>
      <text x="200" y="178" textAnchor="middle" className="pv-label pv-cyc pv-cyc--1">
        cycle 1/3 · FAIL → fix
      </text>
      <text x="200" y="178" textAnchor="middle" className="pv-label pv-cyc pv-cyc--2">
        cycle 2/3 · FAIL → fix
      </text>
      <text x="200" y="178" textAnchor="middle" className="pv-label pv-acc pv-cyc pv-cyc--3">
        cycle 3/3 · PASS ✓
      </text>
    </svg>
  );
}

const RING = { cx: 200, cy: 100, r: 66 };
const RING_NODES = [0, 72, 144, 216, 288].map((deg, i) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: RING.cx + RING.r * Math.cos(a), y: RING.cy + RING.r * Math.sin(a), i };
});
const RING_PATH = `M ${RING.cx} ${RING.cy - RING.r} a ${RING.r} ${RING.r} 0 1 1 -0.01 0`;

function Ring() {
  const [n0, n1, n2, n3, n4] = RING_NODES;
  return (
    <svg viewBox="0 0 400 200" className="pv pv--ring">
      <circle cx={RING.cx} cy={RING.cy} r={RING.r} className="pv-ring" />
      {['0s', '1.2s', '2.4s'].map((d) => (
        <circle key={d} r="3.5" className="pv-dot">
          <animateMotion dur="3.6s" begin={d} repeatCount="indefinite" path={RING_PATH} />
        </circle>
      ))}
      <line x1={n0.x} y1={n0.y} x2={n1.x} y2={n1.y} className="pv-repl" />
      <line x1={n0.x} y1={n0.y} x2={n4.x} y2={n4.y} className="pv-repl" />
      {RING_NODES.map((n) => (
        <g key={n.i} className={n.i === 2 ? 'pv-node pv-node--fail' : 'pv-node'}>
          <rect x={n.x - 13} y={n.y - 11} width="26" height="22" className="pv-box" />
          <text x={n.x} y={n.y + 4} textAnchor="middle" className="pv-mini">
            N{n.i + 1}
          </text>
        </g>
      ))}
      <text x={n0.x + 18} y={n0.y - 6} className="pv-mini pv-acc">
        ★ leader
      </text>
      <path d={`M${n2.x - 4} ${n2.y + 14} Q ${RING.cx} ${RING.cy + 104} ${n3.x + 4} ${n3.y + 14}`} className="pv-handoff" />
      <text x="12" y="26" className="pv-label">
        consistent hashing · RF=3
      </text>
      <text x="12" y="44" className="pv-label pv-blink">
        N3 down → <tspan className="pv-acc">hinted handoff</tspan>
      </text>
      <text x="388" y="188" textAnchor="end" className="pv-mini">
        0 keys lost
      </text>
    </svg>
  );
}

function Detect() {
  const boxes = [
    [108, 128, 84, 40, 'pothole 0.94'],
    [270, 74, 52, 40, 'garbage 0.88'],
    [214, 150, 60, 30, 'sewage 0.81'],
  ];
  return (
    <svg viewBox="0 0 400 200" className="pv pv--detect">
      <defs>
        <pattern id="pv-dots-det" width="3" height="3" patternUnits="userSpaceOnUse">
          <rect width="1.2" height="1.2" className="pv-fill" />
        </pattern>
      </defs>
      <path d="M150 20 L60 196 M250 20 L340 196 M200 30 L200 60 M200 80 L200 110 M200 130 L200 170" className="pv-line" />
      <ellipse cx="150" cy="150" rx="32" ry="11" fill="url(#pv-dots-det)" className="pv-mask" />
      {boxes.map(([x, y, w, h, label], i) => (
        <g key={label} className={`pv-bb pv-bb--${i + 1}`}>
          <rect x={x} y={y} width={w} height={h} className="pv-bbox" />
          <rect x={x} y={y - 12} width={label.length * 5.6 + 8} height="12" className="pv-bbtag" />
          <text x={x + 4} y={y - 3} className="pv-mini pv-inv">
            {label}
          </text>
        </g>
      ))}
      <text x="12" y="26" className="pv-label">
        YOLOv8 · <tspan className="pv-acc">13</tspan> classes
      </text>
      <text x="12" y="44" className="pv-label">
        SAM mask → severity
      </text>
    </svg>
  );
}

const CODE_WIDTHS = [120, 180, 90, 210, 150, 60, 170, 110];

function Editor() {
  return (
    <svg viewBox="0 0 400 200" className="pv pv--editor">
      <rect x="30" y="14" width="340" height="174" className="pv-box" />
      <line x1="30" y1="30" x2="370" y2="30" className="pv-line" />
      <text x="40" y="25" className="pv-mini">
        server.ts
      </text>
      {CODE_WIDTHS.map((w, i) => (
        <g key={i}>
          <text x="40" y={48 + i * 16} className="pv-mini pv-dim">
            {i + 1}
          </text>
          <rect x="60" y={41 + i * 16} width={w} height="6" className={i === 3 ? 'pv-sel' : 'pv-code'} />
        </g>
      ))}
      <g className="pv-msg">
        <rect x="150" y="122" width="200" height="30" className="pv-sticky" />
        <text x="158" y="135" className="pv-mini">
          // @ana: shipping this?
        </text>
        <text x="158" y="147" className="pv-mini pv-acc">
          // @vimal: merged, thanks!
        </text>
      </g>
      <rect x="30" y="172" width="340" height="16" className="pv-status" />
      <text x="38" y="183" className="pv-mini pv-inv">
        REZO-7K9P · 3 online
      </text>
      <text x="362" y="183" textAnchor="end" className="pv-mini pv-inv pv-blink">
        Ctrl+Shift+S
      </text>
    </svg>
  );
}

const DOC_LINES = [
  [150, 'bar'],
  [230, ''],
  [110, 'review'],
  [190, ''],
  [140, 'missed'],
  [220, ''],
  [90, 'bar'],
];

function Redact() {
  return (
    <svg viewBox="0 0 400 200" className="pv pv--redact">
      <rect x="40" y="12" width="320" height="180" className="pv-box" />
      {DOC_LINES.map(([w, kind], i) => {
        const y = 30 + i * 22;
        return (
          <g key={i}>
            <rect x="60" y={y} width={w} height="6" className="pv-code" />
            {kind === 'bar' && <rect x="90" y={y - 4} width="70" height="14" className="pv-bar" />}
            {kind === 'review' && <rect x="70" y={y - 4} width="80" height="14" className="pv-review" />}
            {kind === 'missed' && (
              <>
                <rect x="100" y={y - 4} width="76" height="14" className="pv-missed" />
                <rect x="100" y={y - 4} width="76" height="14" className="pv-bar pv-bar--late" />
              </>
            )}
          </g>
        );
      })}
      <text x="270" y="78" className="pv-mini pv-blink">
        REVIEW · conf 0.61
      </text>
      <text x="270" y="122" className="pv-mini pv-acc">
        missed phone → fixed
      </text>
    </svg>
  );
}

const MAP = {
  agents: Agents,
  ecg: Ecg,
  cursors: Cursors,
  layers: Layers,
  browser: Browser,
  truck: Truck,
  loop3d: Loop3d,
  ring: Ring,
  detect: Detect,
  editor: Editor,
  redact: Redact,
};

export default function ProjectVisual({ kind }) {
  const C = MAP[kind] || Browser;
  return <C />;
}
