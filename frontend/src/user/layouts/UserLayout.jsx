import { Link, Outlet } from 'react-router-dom';
import useCinemaStore from '../../shared/store/cinemaStore';
import useLenis from '../../shared/hooks/useLenis';

export default function UserLayout() {
  const navbarVisible = useCinemaStore((s) => s.navbarVisible);

  useLenis();

  return (
    <div style={{ minHeight: '100vh', background: '#060606', color: '#ededed', fontFamily: "'Inter', sans-serif" }}>
      {/* Letterbox */}
      <div className="letterbox letterbox-t" />
      <div className="letterbox letterbox-b" />

      {/* Cinematic Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        opacity: navbarVisible ? 1 : 0,
        transition: 'opacity 0.8s ease',
        background: 'linear-gradient(180deg, rgba(6,6,6,0.95) 0%, transparent 100%)',
        padding: '1.5rem 2rem',
        pointerEvents: navbarVisible ? 'auto' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1440px', margin: '0 auto' }}>
          <Link to="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', color: '#ededed', textDecoration: 'none', letterSpacing: '0.1em' }}>
            <span style={{ opacity: 0.5 }}>THE</span> STORE
          </Link>
          <div style={{ display: 'flex', gap: '2rem', fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            {['/', '/products', '/cart', '/login'].map((path) => {
              const labels = { '/': 'Home', '/products': 'Products', '/cart': 'Cart', '/login': 'Sign In' };
              return (
                <Link key={path} to={path} style={{ color: '#6b6b6b', textDecoration: 'none', transition: 'color 0.3s' }}
                  onMouseEnter={(e) => { e.target.style.color = '#ededed'; }}
                  onMouseLeave={(e) => { e.target.style.color = '#6b6b6b'; }}>
                  {labels[path]}
                </Link>
              );
            })}
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: '10%', right: '10%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />
      </nav>

      {/* Main Content */}
      <main style={{ minHeight: '100vh', position: 'relative' }}>
        <Outlet />
      </main>

      {/* Hide default cursor */}
      <style>{`*{cursor:none!important;}`}</style>
    </div>
  );
}