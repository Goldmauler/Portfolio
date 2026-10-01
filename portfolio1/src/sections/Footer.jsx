import { profile, sections, socials } from '../data/profile';
import { scrollToTarget } from '../lib/smoothScroll';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer" data-parallax-root>
      <div className="container footer__inner">
        <div className="win footer__ver">
          <div className="win__bar">
            <span className="win__title">VH.OS</span>
          </div>
          <div className="win__body pixel">
            Version 3.0
            <br />
            ©{new Date().getFullYear()} {profile.name}. All rights reserved.
            <br />
            Made in Coimbatore. With love.
          </div>
        </div>

        <div className="footer__cols">
          <div className="col">
            <span className="label">navigate</span>
            <ul>
              {sections.map((s) => (
                <li key={s.id}>
                  <button onClick={() => scrollToTarget(`#${s.id}`)}>~/{s.label}</button>
                </li>
              ))}
            </ul>
          </div>
          <div className="col">
            <span className="label">connect</span>
            <ul>
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target={s.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                    {s.label}
                  </a>
                </li>
              ))}
              <li>
                <a href={profile.resume} download>
                  resume.pdf
                </a>
              </li>
            </ul>
          </div>
          <div className="col footer__colophon">
            <span className="label">colophon</span>
            <p>
              Built with React, Three.js and GSAP. The robot is rendered in 1-bit through an ordered-dither shader. Psst —
              try ↑ ↑ ↓ ↓ ← → ← → B A.
            </p>
          </div>
        </div>

        <button className="btn footer__top" onClick={() => scrollToTarget(0)}>
          cd ~ ↑
        </button>
      </div>

      <div className="footer__mark" aria-hidden="true" data-speed="0.85">
        {profile.firstName}&nbsp;&nbsp;{profile.lastName}
      </div>
    </footer>
  );
}
