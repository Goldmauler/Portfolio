import { useRef, useState } from 'react';
import { profile, socials } from '../data/profile';
import { robotDo } from '../lib/store';
import { unlock } from '../lib/secrets';
import SectionMeta from '../components/SectionMeta';
import './Connect.css';

const FORMSPREE = 'https://formspree.io/f/xyzqwvab';

const LINKS = [
  { label: 'email', value: profile.email, href: `mailto:${profile.email}` },
  { label: 'phone', value: profile.phone, href: `tel:${profile.phone.replace(/-/g, '')}` },
  ...socials.filter((s) => s.label !== 'Email').map((s) => ({ label: s.label.toLowerCase(), value: s.handle, href: s.href, ext: true })),
  { label: 'resume', value: 'resume.pdf', href: profile.resume, download: true },
];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Connect() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [log, setLog] = useState([]);
  const [state, setState] = useState('idle'); // idle | sending | sent | failed
  const honeypot = useRef(null);

  const push = (text, kind = 'out') => setLog((l) => [...l, { text, kind, id: Math.random() }]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (state === 'sending') return;
    if (honeypot.current?.value) return;
    setState('sending');
    setLog([]);
    push(`> ./send_message.sh --to vimal --from "${form.name}"`, 'in');
    await wait(350);
    push('encrypting payload ........ done');
    await wait(350);
    push('opening secure channel ....');
    try {
      const res = await fetch(FORMSPREE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      push(`packet delivered. Thanks, ${form.name.split(' ')[0] || 'friend'} — talk soon.`, 'ok');
      setState('sent');
      setForm({ name: '', email: '', message: '' });
      robotDo('happy');
    } catch {
      push('transmission failed. Falling back to your mail client:', 'err');
      setState('failed');
    }
  };

  const mailto = `mailto:${profile.email}?subject=${encodeURIComponent(`Hello from ${form.name || 'your portfolio'}`)}&body=${encodeURIComponent(form.message)}`;

  return (
    <section id="contact" className="section connect" data-parallax-root>
      <div className="ghost" data-speed="0.7" aria-hidden="true">
        connect
      </div>
      <div className="container">
        <SectionMeta index="06" path="~/connect" />
        <div className="brackets connect__headline">
          <h2 className="display display--md" data-reveal>
            Let’s Build Something
            <br />
            That <em>Thinks.</em>
          </h2>
        </div>

        <div className="connect__grid">
          <div className="connect__left" data-reveal>
            <p className="lead">
              Open to internships, research collaborations and hackathon teams. The fastest route is email — or send a
              packet through the form.
            </p>
            <dl className="connect__links">
              {LINKS.map((l) => (
                <div key={l.label} className="connect__row">
                  <dt className="label">{l.label}</dt>
                  <dd>
                    <a
                      href={l.href}
                      target={l.ext ? '_blank' : undefined}
                      rel={l.ext ? 'noreferrer' : undefined}
                      download={l.download || undefined}
                      onClick={l.download ? () => unlock('resume') : undefined}
                    >
                      {l.value}
                      <span aria-hidden="true"> ↗</span>
                    </a>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <form className="win connect__form" onSubmit={onSubmit} data-reveal="pop" data-no-robot>
            <div className="win__bar">
              <span className="win__title">send_message.sh</span>
            </div>
            <div className="win__body">
              <label className="field">
                <span className="field__k">$ name:</span>
                <input name="name" value={form.name} onChange={onChange} required autoComplete="name" placeholder="Ada Lovelace" />
              </label>
              <label className="field">
                <span className="field__k">$ email:</span>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  required
                  autoComplete="email"
                  placeholder="ada@engine.dev"
                />
              </label>
              <label className="field field--area">
                <span className="field__k">$ message:</span>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={onChange}
                  required
                  rows={5}
                  placeholder="Let’s build something that thinks…"
                />
              </label>
              <input ref={honeypot} className="connect__hp" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              <div className="connect__actions">
                <button type="submit" className="btn btn--solid" disabled={state === 'sending'}>
                  {state === 'sending' ? 'Transmitting…' : 'Transmit ↵'}
                </button>
                <span className="label">end-to-end vibes</span>
              </div>
              {log.length > 0 && (
                <div className="connect__log" aria-live="polite">
                  {log.map((l) => (
                    <p key={l.id} className={`t-line t-line--${l.kind}`}>
                      {l.text}
                    </p>
                  ))}
                  {state === 'failed' && (
                    <a className="t-link" href={mailto}>
                      → open mail to {profile.email}
                    </a>
                  )}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
