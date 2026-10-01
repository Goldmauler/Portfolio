import { useEffect, useRef } from 'react';
import { skillCategories, stats, extraTech, publications } from '../data/profile';
import { gsap, ScrollTrigger, countUp } from '../lib/motion';
import { scrollToTarget } from '../lib/smoothScroll';
import { prefersReducedMotion } from '../lib/device';
import SectionMeta from '../components/SectionMeta';
import './Stack.css';

function Stat({ stat }) {
  const ref = useRef(null);
  useEffect(() => countUp(ref.current, stat), [stat]);
  return (
    <div className="col stat" data-reveal>
      <span className="label">{stat.note}</span>
      <span ref={ref} className="stat__value">
        {stat.prefix}
        {stat.value}
        {stat.suffix}
      </span>
      <span className="stat__label">{stat.label}</span>
    </div>
  );
}

function ModuleWindow({ cat, offset }) {
  const ref = useRef(null);

  useEffect(() => {
    const handles = ref.current.querySelectorAll('.slider__handle');
    if (prefersReducedMotion()) return undefined;
    gsap.set(handles, { left: '0%' });
    const st = ScrollTrigger.create({
      trigger: ref.current,
      start: 'top 85%',
      once: true,
      onEnter: () =>
        gsap.to(handles, {
          left: (i) => `${cat.skills[i].level}%`,
          duration: 1.4,
          ease: 'steps(14)',
          stagger: 0.12,
        }),
    });
    return () => st.kill();
  }, [cat]);

  return (
    <div ref={ref} className="win module" style={{ '--offset': offset }} data-reveal="pop">
      <div className="win__bar">
        <span className="win__title">{cat.file}</span>
        <span className="module__count">{cat.skills.length} loaded</span>
      </div>
      <div className="win__body">
        {cat.skills.map((s) => (
          <div key={s.name} className="slider">
            <div className="slider__head">
              <span className="tag">{s.name}</span>
              <span className="slider__val">{s.level}%</span>
            </div>
            <div className="slider__track">
              <span className="slider__handle" style={{ left: `${s.level}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Papers() {
  const ref = useRef(null);
  useEffect(() => {
    const titles = ref.current.querySelectorAll('.redact');
    if (prefersReducedMotion()) {
      titles.forEach((el) => el.classList.add('is-revealed'));
      return undefined;
    }
    const triggers = ScrollTrigger.batch(titles, {
      start: 'top 88%',
      once: true,
      onEnter: (els) => els.forEach((el, i) => setTimeout(() => el.classList.add('is-revealed'), i * 160)),
    });
    return () => triggers.forEach((t) => t.kill());
  }, []);

  return (
    <div ref={ref} className="papers dots">
      <span className="tag papers__tag">Research.bib</span>
      <div className="papers__grid">
        {publications.map((p, i) => (
          <article key={p.title} className="win paper-card" data-reveal="pop">
            <div className="win__bar">
              <span className="win__title">paper_0{i + 1}.pdf</span>
              <span className="paper-card__type">{p.type}</span>
            </div>
            <div className="win__body">
              <div className="paper-card__meta">
                <span className={`tag${/published/i.test(p.status) ? '' : ' tag--ghost'}`}>{p.status}</span>
                {p.date && <span className="label">{p.date}</span>}
                {p.metric && <span className="paper-card__metric">{p.metric}</span>}
              </div>
              <h3 className="paper-card__title">
                <span className="redact">{p.title}</span>
              </h3>
              <p className="paper-card__note">{p.note}</p>
              <p className="label">Vimal Harihar et al.</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default function Stack() {
  const ticker = [...extraTech, ...skillCategories.flatMap((c) => c.skills.map((s) => s.name))];
  return (
    <section id="skills" className="section stack" data-parallax-root>
      <div className="ghost ghost--right" data-speed="0.65" aria-hidden="true">
        research
      </div>
      <div className="container">
        <SectionMeta index="02" path="~/research" />

        <div className="brackets stack__headline">
          <h2 className="display" data-reveal>
            98.84% Accurate,
            <br />
            IEEE Published.
          </h2>
          <p className="label stack__foot" data-reveal>
            *EfficientNet-B1 MRI brain-tumor classification (peer-reviewed) · AI &amp; Gender Representation (IEEE) ·
            SecureAI-Cyber (2026){' '}
            <button className="stack__proof" onClick={() => scrollToTarget('#projects')}>
              (and the builds →)
            </button>
          </p>
        </div>

        <Papers />

        <div className="stack__stats">
          {stats.map((s) => (
            <Stat key={s.label} stat={s} />
          ))}
        </div>

        <div className="stack__desk dots">
          <span className="tag stack__desk-tag">Kernel Modules</span>
          <div className="stack__mods">
            {skillCategories.map((cat, i) => (
              <ModuleWindow key={cat.id} cat={cat} offset={i % 2 ? '28px' : '0px'} />
            ))}
          </div>
        </div>
      </div>

      <div className="ticker" aria-label="Also in the toolbox">
        <div className="ticker__track">
          {[0, 1].map((dup) => (
            <ul key={dup} aria-hidden={dup === 1 ? 'true' : undefined}>
              {ticker.map((t, i) => (
                <li key={i}>+ {t}</li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
