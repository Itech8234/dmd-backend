import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Reveal-on-scroll: attaches a one-shot ScrollTrigger to every [data-reveal] descendant. */
export function useReveal(deps = []) {
  useEffect(() => {
    if (reduced()) {
      document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-revealed'));
      return;
    }
    const els = gsap.utils.toArray('[data-reveal]');
    const anims = els.map((el) =>
      gsap.fromTo(el,
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
          onComplete: () => el.classList.add('is-revealed'),
        })
    );
    return () => anims.forEach((a) => { a.scrollTrigger && a.scrollTrigger.kill(); a.kill(); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** Stagger children of a container on mount. */
export function useStagger(ref, deps = []) {
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    const children = el.children;
    if (!children.length) return;
    const anim = gsap.from(children, {
      opacity: 0, y: 18, scale: 0.97, duration: 0.5, ease: 'back.out(1.4)',
      stagger: 0.07, clearProps: 'all',
    });
    return () => anim.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** Reading progress bar (0–1) driven by scroll. */
export function useScrollProgress(onProgress) {
  useEffect(() => {
    let raf = 0;
    const update = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      onProgress(max > 0 ? h.scrollTop / max : 0);
    };
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export { gsap, ScrollTrigger };
