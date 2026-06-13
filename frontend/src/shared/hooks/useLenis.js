import { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';

export default function useLenis() {
  const lenisRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.8,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      wheelMultiplier: 0.8,
    });

    lenisRef.current = lenis;
    let running = true;

    function raf(time) {
      if (!running) return;
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      running = false;
      lenis.destroy();
    };
  }, []);

  return lenisRef;
}