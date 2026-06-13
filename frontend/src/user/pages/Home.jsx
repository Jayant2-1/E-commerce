import { useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ThreeBackground from '../../shared/components/ThreeBackground';
import useCinemaStore from '../../shared/store/cinemaStore';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ── Hardcoded cinematic product data (zero API dependency) ──
const PRODUCTS = [
  { id: 1, name: 'The Monolith', tagline: 'Black. Not because it\'s safe. Because it\'s final.', cat: 'Electronics', price: 2499, tone: '#00f0ff' },
  { id: 2, name: 'Aether Coat', tagline: 'Weightless. Until you need it.', cat: 'Fashion', price: 1890, tone: '#ff2d78' },
  { id: 3, name: 'Clay Brick Speaker', tagline: 'Sound that remembers where it came from.', cat: 'Music', price: 420, tone: '#7c4dff' },
  { id: 4, name: 'The Last Notebook', tagline: 'Ideas deserve ink. Not pixels.', cat: 'Books', price: 45, tone: '#d4a574' },
  { id: 5, name: 'Brass Compass', tagline: 'You don\'t need GPS. You need direction.', cat: 'Outdoor', price: 280, tone: '#1de9b6' },
  { id: 6, name: 'Ember Diffuser', tagline: 'Smoke that thinks.', cat: 'Home & Garden', price: 160, tone: '#ffb347' },
];

const CATEGORIES = [
  { name: 'Electronics', tone: '#00f0ff', slug: 'electronics' },
  { name: 'Fashion', tone: '#ff2d78', slug: 'fashion' },
  { name: 'Home & Garden', tone: '#ffb347', slug: 'home' },
  { name: 'Books & Media', tone: '#d4a574', slug: 'books' },
  { name: 'Sports', tone: '#00e676', slug: 'sports' },
  { name: 'Beauty', tone: '#e91e63', slug: 'beauty' },
  { name: 'Toys & Games', tone: '#ff6f00', slug: 'toys' },
  { name: 'Food & Drink', tone: '#ff8a65', slug: 'food' },
  { name: 'Music', tone: '#7c4dff', slug: 'music' },
  { name: 'Outdoor', tone: '#1de9b6', slug: 'outdoor' },
];

/* ═══════════════════════════════════════════════════════════════
   SCENE 1 — THE OPENING
   Asymmetric split: 60/40. Left: floating 3D particle field.
   Right: product emerges from darkness with light ray.
   ═══════════════════════════════════════════════════════════════ */
function OpeningScene({ onComplete }) {
  const textRef = useRef(null);
  const productRef = useRef(null);
  const subtitleRef = useRef(null);
  const navRef = useRef(null);
  const doneRef = useRef(false);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        if (!doneRef.current) {
          doneRef.current = true;
          onComplete?.();
        }
      },
    });

    // Phase 1: Text side emerges
    tl.fromTo(textRef.current,
      { opacity: 0, y: 40, filter: 'blur(8px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.8, ease: 'power3.out' }
    )
    // Phase 2: Product side emerges
    .fromTo(productRef.current,
      { opacity: 0, scale: 0.7, filter: 'brightness(0.2) blur(12px)' },
      { opacity: 1, scale: 1, filter: 'brightness(1) blur(0px)', duration: 2.2, ease: 'power4.out' },
      '-=1.2'
    )
    // Phase 3: Subtitle
    .fromTo(subtitleRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, ease: 'power2.out' },
      '-=0.5'
    )
    // Phase 4: Nav burns in
    .fromTo(navRef.current,
      { opacity: 0, y: -15 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
      '-=0.3'
    );
  }, [onComplete]);

  return (
    <div className="scene" style={{ height: '100vh', display: 'flex', overflow: 'hidden' }}>
      {/* Left: 60% — Text side */}
      <div style={{ flex: 3, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
        <ThreeBackground color="#060608" />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '520px' }}>
          {/* Scene marker */}
          <div ref={navRef} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.55rem', color: '#6b6b6b', letterSpacing: '0.2em', marginBottom: '2rem', opacity: 0 }}>
            THE STORE — OPENER
          </div>
          <div ref={textRef} style={{ opacity: 0 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', color: '#ededed', lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: '1.5rem' }}>
              Not everything<br />
              that can be counted<br />
              <span style={{ fontStyle: 'italic', opacity: 0.7 }}>counts.</span>
            </div>
            <div ref={subtitleRef} style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: '0.85rem', color: '#6b6b6b', lineHeight: 1.7, letterSpacing: '0.05em', maxWidth: '360px', opacity: 0 }}>
              And not everything that counts can be bought.<br />
              This is a different kind of store. The kind that starts in silence.
            </div>
          </div>
          {/* Bottom-left corner marker */}
          <div style={{ position: 'absolute', bottom: '-6rem', left: 0, width: '40px', height: '1px', background: 'rgba(255,255,255,0.2)' }} />
        </div>
      </div>

      {/* Right: 40% — Product emerges from darkness */}
      <div style={{ flex: 2, position: 'relative', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div
          ref={productRef}
          style={{
            opacity: 0,
            width: 'clamp(180px, 25vw, 320px)',
            height: 'clamp(180px, 25vw, 320px)',
            background: 'linear-gradient(145deg, #1a1a2e 0%, #0f3460 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            boxShadow: '0 0 80px rgba(15, 52, 96, 0.3)',
          }}
        >
          {/* Light ray */}
          <div style={{
            position: 'absolute', inset: '-30%',
            background: 'radial-gradient(ellipse at 45% 40%, rgba(196, 155, 94, 0.08) 0%, transparent 50%)',
            animation: 'pulse-glow 4s ease-in-out infinite',
          }} />
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1rem, 2vw, 1.6rem)', color: '#ededed', letterSpacing: '0.08em', padding: '1.5rem', textAlign: 'center', position: 'relative', zIndex: 2 }}>
            The Object<br />of Desire
          </span>
        </div>
        {/* Vignette */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.7) 100%)', pointerEvents: 'none' }} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SCENE 2 — CATEGORIES AS GENRE SHIFTS
   Horizontal scroll film strip. Each category is a panel
   with its own color tone, like a film genre shift.
   ═══════════════════════════════════════════════════════════════ */
function GenreStrip() {
  const trackRef = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const track = trackRef.current;
      if (!track) return;

      gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${track.scrollWidth}`,
          pin: true,
          scrub: 1.2,
          invalidateOnRefresh: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} style={{ height: '100vh', overflow: 'hidden', position: 'relative', background: '#060606' }}>
      <div style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.55rem', color: '#6b6b6b', letterSpacing: '0.2em', opacity: 0.4 }}>
        SCROLL → TEN GENRES
      </div>
      <div ref={trackRef} style={{ display: 'flex', height: '100vh', willChange: 'transform' }}>
        {CATEGORIES.map((cat, i) => (
          <div
            key={cat.name}
            data-panel
            style={{
              minWidth: '100vw',
              height: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              background: i % 2 === 0 ? '#080808' : '#0a0a0a',
            }}
          >
            <ThreeBackground color={i % 2 === 0 ? '#060608' : '#08080a'} />
            <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.5rem', color: cat.tone, letterSpacing: '0.3em', marginBottom: '1rem', opacity: 0.5 }}>
                GENRE {String(i + 1).padStart(2, '0')}
              </div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 'clamp(3rem, 8vw, 7rem)', color: '#ededed', letterSpacing: '0.02em', transition: 'color 0.5s' }}
                onMouseEnter={(e) => { e.target.style.color = cat.tone; }}
                onMouseLeave={(e) => { e.target.style.color = '#ededed'; }}
              >
                {cat.name}
              </div>
              <div style={{ marginTop: '2rem', width: '40px', height: '1px', background: cat.tone, margin: '2rem auto 0', opacity: 0.4 }} />
              <Link to="/products" className="btn-cinema" style={{ marginTop: '2.5rem', display: 'inline-block' }}>
                <span>Explore {cat.name}</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SCENE 3 — PRODUCT SHOWCASE (Split-screen staggered)
   Left: large product with rotating text orbit
   Right: product cards stacked vertically (cast list)
   ═══════════════════════════════════════════════════════════════ */
function ProductShowcase() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(card,
          { opacity: 0, x: 80, filter: 'brightness(0.5) blur(3px)' },
          {
            opacity: 1, x: 0, filter: 'brightness(1) blur(0px)',
            duration: 1, delay: i * 0.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="split-scene split-scene--60-40" style={{ minHeight: '100vh' }}>
      {/* Left: Large feature product */}
      <div style={{ position: 'relative', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <ThreeBackground color="#060608" />
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <div style={{
            width: 'clamp(180px, 25vw, 300px)',
            height: 'clamp(180px, 25vw, 300px)',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1a1a2e, #2a1a3e)',
            margin: '0 auto 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              width: '100%', height: '100%',
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.06)',
              animation: 'orbit-spin 15s linear infinite',
            }} />
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', color: '#ededed', letterSpacing: '0.08em' }}>
              THE<br />MONOLITH
            </span>
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.65rem', color: '#6b6b6b', letterSpacing: '0.15em', maxWidth: '240px', margin: '0 auto' }}>
            Black. Not because it's safe. Because it's final.
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', color: '#00f0ff', marginTop: '1rem', letterSpacing: '0.05em' }}>
            $2,499
          </div>
        </div>
        <div className="vignette" />
      </div>

      {/* Right: Product cards stacked */}
      <div style={{ position: 'relative', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1rem', background: '#0a0a0a' }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.5rem', color: '#6b6b6b', letterSpacing: '0.2em', marginBottom: '1rem', opacity: 0.4 }}>
          THE CAST
        </div>
        {PRODUCTS.slice(0, 4).map((p, i) => (
          <Link
            key={p.id}
            to={`/products/${p.id}`}
            ref={(el) => (cardsRef.current[i] = el)}
            style={{
              opacity: 0,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              border: '1px solid rgba(255,255,255,0.04)',
              transition: 'border-color 0.3s, background 0.3s',
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = `${p.tone}44`;
              e.currentTarget.style.background = `${p.tone}08`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <div style={{
              width: '48px', height: '48px',
              background: `linear-gradient(135deg, ${p.tone}22, transparent)`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.6rem',
              color: p.tone,
              flexShrink: 0,
            }}>
              {String(i + 1).padStart(2, '0')}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', color: '#ededed', fontWeight: 400 }}>
                {p.name}
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.65rem', color: '#6b6b6b', letterSpacing: '0.05em', marginTop: '0.2rem' }}>
                {p.cat}
              </div>
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: '#a0a0a0' }}>
              ${p.price}
            </div>
          </Link>
        ))}
        <Link to="/products" className="btn-cinema" style={{ marginTop: '1rem', textAlign: 'center' }}>
          <span>View Full Cast →</span>
        </Link>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SCENE 4 — PARALLAX FILM STRIP
   Full-width image wall with parallax depth
   ═══════════════════════════════════════════════════════════════ */
function FilmStripParallax() {
  const sectionRef = useRef(null);
  const imgsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      imgsRef.current.forEach((img, i) => {
        if (!img) return;
        gsap.to(img, {
          y: () => i % 2 === 0 ? img.offsetHeight * 0.15 : -img.offsetHeight * 0.15,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} style={{ padding: '4rem 0', position: 'relative', overflow: 'hidden' }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.5rem', color: '#6b6b6b', letterSpacing: '0.2em', marginBottom: '2rem', padding: '0 2rem', opacity: 0.4 }}>
        B-ROLL
      </div>
      <div style={{ display: 'flex', gap: '2px', overflow: 'hidden' }}>
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            ref={(el) => (imgsRef.current[i] = el)}
            style={{
              flexShrink: 0,
              width: 'clamp(120px, 12vw, 200px)',
              aspectRatio: '3/4',
              background: `linear-gradient(135deg, ${i % 2 === 0 ? '#1a1a2e' : '#16213e'}, ${i % 3 === 0 ? '#2a1a3e' : i % 2 === 0 ? '#0f3460' : '#1a2a1e'})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '0.7rem',
              color: 'rgba(255,255,255,0.15)',
              letterSpacing: '0.1em',
            }}
          >
            FRAME {String(i + 1).padStart(3, '0')}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SCENE 5 — CLOSING TITLE
   Minimal. One line. A single CTA that doesn't look like one.
   ═══════════════════════════════════════════════════════════════ */
function ClosingTitle() {
  const textRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: textRef.current,
          start: 'top 70%',
          toggleActions: 'play none none reverse',
        },
      });
      tl.fromTo(textRef.current,
        { opacity: 0, y: 40, filter: 'blur(6px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.5, ease: 'power3.out' }
      )
      .fromTo(btnRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, ease: 'power2.out' },
        '-=0.5'
      );
    }, textRef);
    return () => ctx.revert();
  }, []);

  return (
    <section style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '4rem 2rem', position: 'relative' }}>
      <div className="ambient-grid" />
      <div ref={textRef} style={{ maxWidth: '600px', opacity: 0 }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: '#ededed', lineHeight: 1.3, letterSpacing: '0.02em', marginBottom: '1.5rem' }}>
          "What you seek<br />
          <span style={{ fontStyle: 'italic', opacity: 0.7 }}>is seeking you."</span>
        </div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: '#6b6b6b', letterSpacing: '0.1em' }}>
          — Rumi
        </div>
      </div>
      <div ref={btnRef} style={{ marginTop: '3rem', opacity: 0 }}>
        <Link to="/products" className="btn-cinema btn-cinema--light" style={{ padding: '1rem 3rem' }}>
          <span>Begin Your Search</span>
        </Link>
      </div>
      <div style={{ position: 'absolute', bottom: '2rem', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.5rem', color: '#6b6b6b', letterSpacing: '0.2em', opacity: 0.2 }}>
        THE STORE — FIN
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HOMEPAGE
   ═══════════════════════════════════════════════════════════════ */
export default function Home() {
  const setNavbarVisible = useCinemaStore((s) => s.setNavbarVisible);
  const setOpeningComplete = useCinemaStore((s) => s.setOpeningComplete);
  const openingComplete = useCinemaStore((s) => s.openingComplete);

  const handleOpeningComplete = useCallback(() => {
    setNavbarVisible(true);
    setOpeningComplete();
  }, [setNavbarVisible, setOpeningComplete]);

  return (
    <div>
      {/* The opening is always rendered — it's self-contained */}
      <OpeningScene onComplete={handleOpeningComplete} />

      {/* Rest of scenes only show after opening completes */}
      {openingComplete && (
        <>
          <GenreStrip />
          <ProductShowcase />
          <FilmStripParallax />
          <ClosingTitle />

          {/* Scroll progress indicator */}
          <div id="scroll-progress">
            <span className="mono">SCROLL</span>
            <div className="line">
              <span id="progress-fill" />
            </div>
          </div>

          <div className="scene-marker">
            <span className="current">I</span>
            <span>II</span>
            <span>III</span>
            <span>IV</span>
            <span>V</span>
          </div>
        </>
      )}

      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes orbit-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}