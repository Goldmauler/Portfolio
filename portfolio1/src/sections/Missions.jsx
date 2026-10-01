import { useLayoutEffect, useRef } from 'react';
import { projects, socials, alsoShipped } from '../data/profile';
import { gsap } from '../lib/motion';
import { emit } from '../lib/store';
import { hasFinePointer } from '../lib/device';
import ProjectVisual from '../components/ProjectVisual';
import SectionMeta from '../components/SectionMeta';
import './Missions.css';

function Mission({ p, i }) {
  const ref = useRef(null);

  // Subtle 3D tilt toward the pointer.
  const onMove = (e) => {
    if (!hasFinePointer()) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.setProperty('--rx', `${(-y * 5).toFixed(2)}deg`);
    ref.current.style.setProperty('--ry', `${(x * 6).toFixed(2)}deg`);
    ref.current.style.setProperty('--gx', `${((x + 0.5) * 100).toFixed(1)}%`);
    ref.current.style.setProperty('--gy', `${((y + 0.5) * 100).toFixed(1)}%`);
  };
  const onLeave = () => {
    ref.current.style.setProperty('--rx', '0deg');
    ref.current.style.setProperty('--ry', '0deg');
  };

  return (
    <article ref={ref} className="win mission" onPointerMove={onMove} onPointerLeave={onLeave}>
      <div className="win__bar">
        <span className="win__title">{p.title.toUpperCase()}.app</span>
        <span className="mission__year">{p.year}</span>
      </div>
      <div className="mission__visual dots">
        <div className="mission__visual-inner">
          <ProjectVisual kind={p.visual} />
        </div>
        <span className="mission__num pixel">{String(i + 1).padStart(2, '0')}</span>
        {p.deck && (
          <button className="mission__deckbadge" onClick={() => emit('deck:open', p.id)}>
            <span className="pixel">▶ DECK</span> {p.deck.slides} slides
          </button>
        )}
      </div>
      <div className="mission__body">
        <div className="mission__top">
          <span className="tag">{p.code}</span>
          <span className="label">{p.badge}</span>
        </div>
        <h3 className="mission__title">{p.title}</h3>
        <p className="mission__sub">{p.subtitle}</p>
        <div className="mission__metric">
          <b>{p.metric.value}</b>
          <span>{p.metric.label}</span>
        </div>
        <p className="mission__desc">{p.description}</p>
        <ul className="mission__points">
          {p.points.map((pt) => (
            <li key={pt}>{pt}</li>
          ))}
        </ul>
        <div className="mission__foot">
          <div className="mission__tech">
            {p.tech.map((t) => (
              <span key={t} className="chip">
                {t}
              </span>
            ))}
          </div>
          <div className="mission__links">
            {p.deck && (
              <>
                <button className="mission__link" onClick={() => emit('deck:open', p.id)}>
                  ▶ deck
                </button>
                <a className="mission__link" href={p.deck.pdf} download>
                  deck.pdf ↓
                </a>
              </>
            )}
            {p.live && (
              <a className="mission__link" href={p.live} target="_blank" rel="noreferrer">
                live ↗
              </a>
            )}
            <a className="mission__link" href={p.link} target="_blank" rel="noreferrer">
              {p.link.endsWith('/Goldmauler') ? 'github ↗' : 'source ↗'}
            </a>
          </div>
        </div>
      </div>
      <span className="mission__glare" aria-hidden="true" />
    </article>
  );
}

export default function Missions() {
  const pinRef = useRef(null);
  const trackRef = useRef(null);
  const barRef = useRef(null);
  const countRef = useRef(null);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const track = trackRef.current;
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: pinRef.current,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            if (barRef.current) barRef.current.style.transform = `scaleX(${self.progress})`;
            if (countRef.current) {
              const n = Math.min(projects.length, Math.max(1, Math.ceil(self.progress * projects.length + 0.001)));
              countRef.current.textContent = String(n).padStart(2, '0');
            }
          },
        },
      });

      // Inner parallax: each card's illustration drifts against the scroll.
      gsap.utils.toArray(track.querySelectorAll('.mission__visual-inner')).forEach((el) => {
        gsap.fromTo(
          el,
          { xPercent: -10 },
          {
            xPercent: 10,
            ease: 'none',
            scrollTrigger: { trigger: el, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true },
          },
        );
      });
      gsap.utils.toArray(track.querySelectorAll('.mission__num')).forEach((el) => {
        gsap.fromTo(
          el,
          { x: 60 },
          {
            x: -60,
            ease: 'none',
            scrollTrigger: { trigger: el, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true },
          },
        );
      });
    });
    return () => mm.revert();
  }, []);

  const github = socials.find((s) => s.label === 'GitHub');

  return (
    <section id="projects" className="missions">
      <div className="container missions__head">
        <SectionMeta index="04" path="~/missions" />
        <h2 className="display" data-reveal>
          Missions,
          <br />
          Shipped.
        </h2>
      </div>

      <div ref={pinRef} className="missions__pin">
        <div ref={trackRef} className="missions__track">
          <div className="missions__intro">
            <p className="lead">
              {projects.length} missions across agentic AI, computer vision, edge ML and distributed systems — built,
              shipped and battle-tested at hackathons.
            </p>
            <p className="label missions__hint">scroll → to fly through</p>
          </div>
          {projects.map((p, i) => (
            <Mission key={p.id} p={p} i={i} />
          ))}
          <div className="missions__end win">
            <div className="win__bar">
              <span className="win__title">ALSO_SHIPPED.txt</span>
            </div>
            <ul className="win__body">
              {alsoShipped.map((a) => (
                <li key={a.name}>
                  <a href={a.href} target="_blank" rel="noreferrer">
                    <span className="missions__end-name">{a.name} ↗</span>
                    <span className="label">{a.note}</span>
                  </a>
                </li>
              ))}
              <li>
                <a href={github.href} target="_blank" rel="noreferrer" className="missions__end-gh pixel">
                  all repos on GitHub ↗
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="missions__progress container" aria-hidden="true">
          <span className="pixel">
            MISSION <span ref={countRef}>01</span> / {String(projects.length).padStart(2, '0')}
          </span>
          <span className="missions__bar">
            <span ref={barRef} />
          </span>
        </div>
      </div>
    </section>
  );
}
