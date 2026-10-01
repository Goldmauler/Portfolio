import { useMemo, useRef, useState } from 'react';
import { profile, secretMessage } from '../data/profile';
import { gsap, SCRAMBLE_CHARS } from '../lib/motion';
import { unlock } from '../lib/secrets';
import { prefersReducedMotion } from '../lib/device';
import SectionMeta from '../components/SectionMeta';
import HoloPortrait from '../components/HoloPortrait';
import './About.css';

const PILLARS = [
  {
    label: 'In Production',
    text: 'At Innoboon: RAG + Deep Agents over GCP audit logs, ranking evidence with BM25 and embeddings so engineers reach root causes faster.',
  },
  {
    label: 'With Agents',
    text: 'Multi-agent systems that migrate legacy repos on AWS (Lazarus) and audit and fix their own 3D assets with LangGraph (AVAV).',
  },
  {
    label: 'On The Edge',
    text: 'A 1D-CNN classifying arrhythmias at 95.37% on an Arduino Nano 33 BLE — and SAM-powered vision for CAT mining trucks. Models that live on the hardware they serve.',
  },
];

const FACTS = [
  { label: 'Recently', text: 'Software & AI Intern at Innoboon (Apr – Jun 2026).' },
  { label: 'Studying', text: `B.Tech CSE at Amrita · ${profile.education.period} · CGPA ${profile.education.cgpa}` },
  { label: 'Based In', text: 'Coimbatore, India. Open to SWE / AI roles, research and hackathon teams.' },
];

const toBase64 = (s) => btoa(String.fromCharCode(...new TextEncoder().encode(s)));

function Base64Block() {
  const encoded = useMemo(() => toBase64(secretMessage), []);
  const [decoded, setDecoded] = useState(false);
  const textRef = useRef(null);

  const decode = () => {
    if (decoded) return;
    setDecoded(true);
    unlock('decoder');
    const el = textRef.current;
    if (prefersReducedMotion()) {
      el.textContent = secretMessage;
      return;
    }
    gsap.to(el, { duration: 1.8, ease: 'none', scrambleText: { text: secretMessage, chars: SCRAMBLE_CHARS, speed: 0.8 } });
  };

  return (
    <button
      className={`b64${decoded ? ' is-decoded' : ''}`}
      onClick={decode}
      aria-label={decoded ? 'Decoded message' : 'Encoded message — click to decode'}
      data-reveal
    >
      <span className="b64__label">[B.64]{decoded ? ' → utf-8' : ' · click to decode'}</span>
      <span ref={textRef} className="b64__text">
        {encoded}
      </span>
    </button>
  );
}

export default function About() {
  return (
    <section id="about" className="section about" data-parallax-root>
      <div className="ghost" data-speed="0.7" aria-hidden="true">
        whoami
      </div>
      <div className="container">
        <SectionMeta index="01" path="~/whoami" />

        <div className="whoami" data-reveal="pop">
          <HoloPortrait src={profile.photo} label="ASCII hologram portrait of Vimal Harihar" />
        </div>

        <div className="brackets about__headline">
          <h2 className="display display--md" data-reveal>
            Build. Break. Learn.
            <br />
            Ship. <em>Repeat.</em>
          </h2>
        </div>

        <div className="about__grid">
          {PILLARS.map((p) => (
            <div key={p.label} className="col" data-reveal>
              <span className="label">{p.label}</span>
              <p className="lead">{p.text}</p>
            </div>
          ))}
          <Base64Block />
        </div>

        <div className="about__facts">
          {FACTS.map((f) => (
            <div key={f.label} className="col" data-reveal>
              <span className="label">{f.label}</span>
              <p>{f.text}</p>
            </div>
          ))}
          <div className="col about__summary" data-reveal>
            <span className="label">Summary</span>
            <p className="dim">{profile.summary}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
