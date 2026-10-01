// Vector artwork for the saga: Eye of Agamotto, mystic spell rings and the
// Infinity Gauntlet. Animated with CSS classes (see Saga.css).

const GOLD_STOPS = [
  ['0', '#fff3c4'],
  ['0.22', '#f4c95d'],
  ['0.48', '#b9822a'],
  ['0.7', '#7b4f12'],
  ['0.88', '#e3b14a'],
  ['1', '#fff0b5'],
];

function Gold({ id }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
      {GOLD_STOPS.map(([o, c]) => (
        <stop key={o} offset={o} stopColor={c} />
      ))}
    </linearGradient>
  );
}

/* ------------------------------------------------------------------------ */

export function EyeOfAgamotto({ open, stoneSrc }) {
  const lens = 'M-66 0 Q0 -50 66 0 Q0 50 -66 0 Z';
  return (
    <svg className={`eye${open ? ' is-open' : ''}`} viewBox="-110 -110 220 220" aria-hidden="true">
      <defs>
        <Gold id="eye-gold" />
        <radialGradient id="eye-stone" cx="0.42" cy="0.38" r="0.7">
          <stop offset="0" stopColor="#f2fff7" />
          <stop offset="0.22" stopColor="#8dffc0" />
          <stop offset="0.5" stopColor="#1fe27a" />
          <stop offset="0.82" stopColor="#077a3a" />
          <stop offset="1" stopColor="#03391b" />
        </radialGradient>
        <filter id="eye-glow" x="-1" y="-1" width="3" height="3">
          <feGaussianBlur stdDeviation="7" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="eye-lens">
          <path d={lens} />
        </clipPath>
      </defs>

      {/* light leaking out as it opens */}
      <g className="eye__rays">
        {Array.from({ length: 16 }, (_, i) => (
          <line key={i} x1="0" y1="0" x2="0" y2="-108" transform={`rotate(${i * 22.5})`} />
        ))}
      </g>

      {/* frame */}
      <circle r="94" className="eye__studs" />
      <circle r="86" fill="none" stroke="url(#eye-gold)" strokeWidth="13" />
      <circle r="78" fill="#120d05" stroke="#5a3a08" strokeWidth="1.5" />
      {[0, 90, 180, 270].map((a) => (
        <path key={a} d="M-9 -96 L9 -96 L5 -80 L-5 -80 Z" fill="url(#eye-gold)" stroke="#5a3a08" transform={`rotate(${a + 45})`} />
      ))}

      {/* the eye */}
      <path d={lens} fill="#030805" stroke="url(#eye-gold)" strokeWidth="6" />
      <g clipPath="url(#eye-lens)">
        <g className="eye__stone">
          <circle r="27" fill="url(#eye-stone)" filter="url(#eye-glow)" />
          {stoneSrc ? (
            <image href={stoneSrc} x="-36" y="-36" width="72" height="72" filter="url(#eye-glow)" />
          ) : (
            <>
              <path d="M0 -27 L14 -8 L0 27 L-14 -8 Z" className="eye__facet" />
              <path d="M-27 0 L27 0 M-14 -8 L14 -8" className="eye__facet" />
              <ellipse cx="-9" cy="-12" rx="7" ry="4" fill="#ffffff" opacity="0.55" />
            </>
          )}
        </g>
        <path className="eye__lid eye__lid--top" d="M-70 0 Q0 -54 70 0 L70 2 L-70 2 Z" fill="url(#eye-gold)" stroke="#5a3a08" />
        <path className="eye__lid eye__lid--bot" d="M-70 0 Q0 54 70 0 L70 -2 L-70 -2 Z" fill="url(#eye-gold)" stroke="#5a3a08" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------------ */

export function MysticRings({ reverse = false }) {
  const star = (r) => {
    const pts = Array.from({ length: 4 }, (_, i) => {
      const a = (i * Math.PI) / 2 - Math.PI / 4;
      return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`;
    });
    return pts.join(' ');
  };
  return (
    <svg className={`rings${reverse ? ' rings--reverse' : ''}`} viewBox="-300 -300 600 600" aria-hidden="true">
      <g className="rings__a">
        <circle r="150" />
        <circle r="138" />
        <circle r="144" className="rings__runes" strokeDasharray="2 5 7 4 1 6 4 3" />
        {Array.from({ length: 24 }, (_, i) => (
          <path key={i} d="M0 -150 L4 -158 L-4 -158 Z" transform={`rotate(${i * 15})`} className="rings__fill" />
        ))}
      </g>
      <g className="rings__b">
        <circle r="205" />
        <polygon points={star(205)} />
        <polygon points={star(205)} transform="rotate(45)" />
        {Array.from({ length: 8 }, (_, i) => (
          <circle key={i} r="7" cx="0" cy="-205" transform={`rotate(${i * 45})`} />
        ))}
        <circle r="186" className="rings__runes" strokeDasharray="10 4 2 4 2 8" />
      </g>
      <g className="rings__c">
        <circle r="262" strokeDasharray="1 7" />
        <circle r="250" />
        {Array.from({ length: 72 }, (_, i) => (
          <line key={i} x1="0" y1="-250" x2="0" y2={i % 6 === 0 ? -270 : -258} transform={`rotate(${i * 5})`} />
        ))}
      </g>
      <g className="rings__d">
        <circle r="96" strokeDasharray="3 3" />
        <circle r="110" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------------ */

const STONES = {
  space: ['#d9ecff', '#3b8bff', '#0b2f7a'],
  power: ['#f2dcff', '#a43bff', '#3d0a6e'],
  reality: ['#ffd9dd', '#ff2a3a', '#6e0710'],
  time: ['#e6fff0', '#2bff88', '#055c2b'],
  soul: ['#fff0d9', '#ff8a1f', '#7a3300'],
  mind: ['#fffbd6', '#ffd21a', '#7a5a00'],
};

function Stone({ id, cx, cy, rx, ry, empty = false }) {
  return (
    <g className={`g-stone g-stone--${id}${empty ? ' is-empty' : ''}`} data-socket={id}>
      <ellipse cx={cx} cy={cy} rx={rx + 2.5} ry={ry + 2.5} fill="#5a3a08" />
      <ellipse cx={cx} cy={cy} rx={rx + 1} ry={ry + 1} fill="#140c02" />
      <g className="g-stone__gem">
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#st-${id})`} filter="url(#g-glow)" />
        <ellipse cx={cx - rx * 0.3} cy={cy - ry * 0.35} rx={rx * 0.35} ry={ry * 0.22} fill="#fff" opacity="0.7" />
      </g>
    </g>
  );
}

export function GauntletArt({ full }) {
  return (
    <svg className="gauntlet__svg" viewBox="0 0 140 196" aria-hidden="true">
      <defs>
        <Gold id="g-gold" />
        {Object.entries(STONES).map(([id, [a, b, c]]) => (
          <radialGradient key={id} id={`st-${id}`} cx="0.4" cy="0.35" r="0.75">
            <stop offset="0" stopColor={a} />
            <stop offset="0.45" stopColor={b} />
            <stop offset="1" stopColor={c} />
          </radialGradient>
        ))}
        <filter id="g-glow" x="-1.5" y="-1.5" width="4" height="4">
          <feGaussianBlur stdDeviation="2.6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* fingers (behind the hand plate) */}
      <g className="g-finger g-index">
        <rect x="30" y="34" width="19" height="64" rx="9.5" fill="url(#g-gold)" stroke="#5a3a08" strokeWidth="1.4" />
        <path d="M31 56 H48 M31 76 H48" stroke="#7b4f12" strokeWidth="1.4" />
      </g>
      <g className="g-finger g-middle">
        <rect x="51" y="20" width="20" height="78" rx="10" fill="url(#g-gold)" stroke="#5a3a08" strokeWidth="1.4" />
        <path d="M52 44 H70 M52 68 H70" stroke="#7b4f12" strokeWidth="1.4" />
      </g>
      <g className="g-finger g-ring">
        <rect x="73" y="28" width="19" height="70" rx="9.5" fill="url(#g-gold)" stroke="#5a3a08" strokeWidth="1.4" />
        <path d="M74 52 H91 M74 74 H91" stroke="#7b4f12" strokeWidth="1.4" />
      </g>
      <g className="g-finger g-pinky">
        <rect x="94" y="46" width="16" height="54" rx="8" fill="url(#g-gold)" stroke="#5a3a08" strokeWidth="1.4" />
        <path d="M95 66 H109 M95 82 H109" stroke="#7b4f12" strokeWidth="1.4" />
      </g>

      {/* back of hand */}
      <path
        d="M28 160 C22 134 22 112 28 92 L112 90 C118 110 118 134 112 160 Z"
        fill="url(#g-gold)"
        stroke="#5a3a08"
        strokeWidth="1.6"
      />
      <path d="M40 100 L66 122 M60 98 L68 116 M82 98 L74 116 M100 100 L76 122" stroke="#8a5a12" strokeWidth="1.6" fill="none" />
      <path d="M44 146 Q70 156 96 146" stroke="#8a5a12" strokeWidth="1.4" fill="none" />

      {/* thumb */}
      <g className="g-finger g-thumb">
        <rect x="6" y="88" width="20" height="56" rx="10" fill="url(#g-gold)" stroke="#5a3a08" strokeWidth="1.4" transform="rotate(-28 16 140)" />
        <Stone id="soul" cx={10} cy={108} rx={5.5} ry={7} />
      </g>

      {/* cuff */}
      <path d="M26 156 L114 156 L120 194 L20 194 Z" fill="url(#g-gold)" stroke="#5a3a08" strokeWidth="1.6" />
      <path d="M24 166 H116 M22 178 H118" stroke="#7b4f12" strokeWidth="1.6" />

      {/* knuckle stones + centre */}
      <Stone id="space" cx={39.5} cy={100} rx={5.5} ry={6.5} />
      <Stone id="power" cx={61} cy={99} rx={6} ry={7} />
      <Stone id="reality" cx={82.5} cy={100} rx={5.5} ry={6.5} />
      <Stone id="time" cx={102} cy={103} rx={5} ry={6} empty={!full} />
      <Stone id="mind" cx={70} cy={130} rx={10} ry={12} />

      {/* snap sparks */}
      <g className="g-sparks">
        {Array.from({ length: 10 }, (_, i) => (
          <line key={i} x1="40" y1="30" x2="40" y2="6" transform={`rotate(${i * 36 - 160} 40 30)`} />
        ))}
      </g>
    </svg>
  );
}
