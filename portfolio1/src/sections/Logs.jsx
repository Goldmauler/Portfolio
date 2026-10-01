import { useEffect, useRef } from 'react';
import { experience, achievements, certifications, profile } from '../data/profile';
import { gsap } from '../lib/motion';
import { prefersReducedMotion } from '../lib/device';
import SectionMeta from '../components/SectionMeta';
import './Logs.css';

const TIER_STARS = { gold: '★★★', silver: '★★', bronze: '★' };

export default function Logs() {
  const logRef = useRef(null);
  const fillRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        fillRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: logRef.current, start: 'top 70%', end: 'bottom 60%', scrub: true },
        },
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <section id="experience" className="section logs" data-parallax-root>
      <div className="ghost ghost--right" data-speed="0.7" aria-hidden="true">
        logs
      </div>
      <div className="container">
        <SectionMeta index="05" path="~/logs" />
        <div className="logs__head">
          <h2 className="display" data-reveal>
            Commit
            <br />
            History.
          </h2>
          <p className="label logs__cmd" data-reveal>
            $ git log --graph --oneline career
          </p>
        </div>

        <div className="logs__grid">
          <div ref={logRef} className="gitlog">
            <span className="gitlog__rail" aria-hidden="true">
              <span ref={fillRef} className="gitlog__fill" />
            </span>
            <ol className="gitlog__list">
            {experience.map((e) => (
              <li key={e.hash} className="commit" data-reveal="left">
                <span className="commit__node" aria-hidden="true" />
                <div className="commit__meta">
                  <span className="commit__hash">{e.hash}</span>
                  {e.head && <span className="tag tag--ghost">HEAD → main</span>}
                  <span className="label">{e.period}</span>
                </div>
                <h3 className="commit__role">{e.role}</h3>
                <p className="commit__org">
                  {e.org}
                  {e.link && (
                    <a className="commit__link" href={e.link} target="_blank" rel="noreferrer">
                      live ↗
                    </a>
                  )}
                </p>
                <ul className="commit__points">
                  {e.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
                <div className="commit__tags">
                  {e.tags.map((t) => (
                    <span key={t} className="chip">
                      {t}
                    </span>
                  ))}
                </div>
              </li>
            ))}
            <li className="commit commit--root" data-reveal="left">
              <span className="commit__node" aria-hidden="true" />
              <div className="commit__meta">
                <span className="commit__hash">0000001</span>
                <span className="label">Aug 2023</span>
              </div>
              <p className="commit__org">initial commit — enrolled in {profile.education.degree}, Amrita</p>
            </li>
            </ol>
          </div>

          <aside className="logs__side">
            <div className="win trophies" data-reveal="pop">
              <div className="win__bar">
                <span className="win__title">TROPHY_CASE.dat</span>
              </div>
              <ul className="win__body">
                {achievements.map((a) => (
                  <li key={a.event} className={`trophy trophy--${a.tier}`}>
                    <span className="trophy__stars" aria-hidden="true">
                      {TIER_STARS[a.tier]}
                    </span>
                    <span className="trophy__title">{a.title}</span>
                    <span className="trophy__event">
                      {a.event}
                      {a.year && <span className="faint"> · {a.year}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="win certs" data-reveal="pop">
              <div className="win__bar">
                <span className="win__title">CERTS.log</span>
              </div>
              <ul className="win__body">
                {certifications.map((c) => (
                  <li key={c.name} className="cert">
                    <span className="cert__mark" aria-hidden="true">
                      ✓
                    </span>
                    <span>
                      <span className="cert__name">{c.name}</span>
                      <span className="cert__org">{c.org}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
