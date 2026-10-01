import { useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger, SCRAMBLE_CHARS, randomGlyphs } from '../lib/motion';
import { prefersReducedMotion } from '../lib/device';

/**
 * Text that "decrypts" into place. Screen readers get the real text
 * immediately via a visually-hidden copy; the animated copy is aria-hidden.
 */
export default function ScrambleText({
  text,
  as: Tag = 'span',
  className,
  trigger = 'view',
  delay = 0,
  duration = 1.1,
  chars = SCRAMBLE_CHARS,
  replayOnHover = false,
}) {
  const ref = useRef(null);
  const tweenRef = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (prefersReducedMotion()) {
      el.textContent = text;
      return undefined;
    }

    const run = () => {
      tweenRef.current?.kill();
      tweenRef.current = gsap.to(el, {
        duration,
        delay,
        ease: 'none',
        scrambleText: { text, chars, revealDelay: 0.25, speed: 0.6 },
      });
    };

    if (trigger === 'mount') {
      el.textContent = randomGlyphs(text.length, chars);
      run();
      return () => tweenRef.current?.kill();
    }

    el.textContent = randomGlyphs(text.length, chars);
    const st = ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: run });
    return () => {
      st.kill();
      tweenRef.current?.kill();
    };
  }, [text, trigger, delay, duration, chars]);

  const onEnter = () => {
    if (!replayOnHover || prefersReducedMotion() || tweenRef.current?.isActive()) return;
    tweenRef.current = gsap.to(ref.current, {
      duration: 0.6,
      ease: 'none',
      scrambleText: { text, chars, speed: 0.9 },
    });
  };

  return (
    <Tag className={className} onMouseEnter={replayOnHover ? onEnter : undefined}>
      <span className="sr-only">{text}</span>
      <span ref={ref} aria-hidden="true">
        {text}
      </span>
    </Tag>
  );
}
