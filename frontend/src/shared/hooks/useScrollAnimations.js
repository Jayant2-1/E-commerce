import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useSceneReveal(ref, options = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const children = el.querySelectorAll('[data-reveal]');
      children.forEach((child, i) => {
        gsap.fromTo(child,
          { opacity: 0, y: 60, scale: 0.97, filter: 'brightness(0.6) blur(4px)' },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'brightness(1) blur(0px)',
            duration: 1.2,
            delay: i * 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: child,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, el);

    return () => ctx.revert();
  }, [ref]);
}

export function useParallax(ref, speed = 0.3) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.to(el, {
        y: () => el.offsetHeight * speed,
        ease: 'none',
        scrollTrigger: {
          trigger: el.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, el);
    return () => ctx.revert();
  }, [ref, speed]);
}

export function useHorizontalScroll(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const track = el.querySelector('[data-track]');
    if (!track) return;

    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray('[data-panel]');
      const totalWidth = panels.length * 100;

      gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: () => `+=${track.scrollWidth}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    }, el);
    return () => ctx.revert();
  }, [ref]);
}