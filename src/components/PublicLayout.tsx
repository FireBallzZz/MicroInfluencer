import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../state/AuthContext';
import { useEffect, useState } from 'react';

function Logo({ onClick, invert = false }: { onClick?: () => void; invert?: boolean }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      className="group inline-flex items-center gap-2.5"
      aria-label="Microwork home"
    >
      <span
        className={`relative inline-flex items-center justify-center w-7 h-7
        ${invert ? 'bg-paper-50 text-ink-900' : 'bg-ink-900 text-paper-50'}
        rounded-sm overflow-hidden`}
      >
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" aria-hidden>
          <path
            d="M3 19V5h2.5L12 14 18.5 5H21v14h-2.5V10.6L13 18h-2L5 10.6V19H3z"
            fill="currentColor"
          />
        </svg>
      </span>
      <span
        className={`font-display text-[19px] font-semibold leading-none tracking-[-0.02em]
        ${invert ? 'text-paper-50' : 'text-ink-900'}`}
      >
        Microwork
      </span>
      <span
        aria-hidden
        className={`hidden sm:inline-block font-mono text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-sm
        ${invert ? 'bg-ink-700 text-ink-300' : 'bg-paper-100 text-ink-500'}`}
      >
        demo
      </span>
    </Link>
  );
}

export default function PublicLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    if (menuOpen) {
      window.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', onKey);
      if (menuOpen) document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const dashboardLink = user
    ? user.role === 'creator' ? '/creator/dashboard' : '/brand/dashboard'
    : null;

  return (
    <div className="min-h-screen bg-paper-50 text-ink-700 flex flex-col">
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ease-out-quint
        ${scrolled
          ? 'bg-paper-50/85 backdrop-blur-md border-b border-ink-200/80'
          : 'bg-paper-50/0 border-b border-transparent'}
        `}
      >
        <div className="container-page h-16 flex items-center justify-between">
          <Logo onClick={closeMenu} />

          <nav className="hidden md:flex items-center gap-8 text-sm text-ink-700">
            <a href="#how" className="hover:text-ink-900 transition-colors">How it works</a>
            <a href="#marketplace" className="hover:text-ink-900 transition-colors">Marketplace</a>
            <a href="#creators" className="hover:text-ink-900 transition-colors">For creators</a>
            <a href="#brands" className="hover:text-ink-900 transition-colors">For brands</a>
          </nav>

          <div className="flex items-center gap-1">
            {user ? (
              <Link
                to={dashboardLink!}
                className="btn btn-primary btn-sm sm:btn-md"
              >
                Dashboard
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm sm:btn-md hidden sm:inline-flex">
                  Log in
                </Link>
                <button
                  onClick={() => navigate('/register/role')}
                  className="btn btn-primary btn-sm sm:btn-md"
                >
                  Get started
                  <ArrowUpRight className="w-3.5 h-3.5 hidden sm:inline" />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              className="md:hidden ml-1 inline-flex items-center justify-center w-10 h-10
                         text-ink-700 hover:bg-ink-100/60 rounded-md"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div
          className={`md:hidden overflow-hidden border-t border-ink-200 bg-paper-50
          transition-all duration-300 ease-out-quint
          ${menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <nav className="container-page py-4 flex flex-col gap-1 text-sm text-ink-700">
            <a href="#how" onClick={closeMenu} className="py-2.5">How it works</a>
            <a href="#marketplace" onClick={closeMenu} className="py-2.5">Marketplace</a>
            <a href="#creators" onClick={closeMenu} className="py-2.5">For creators</a>
            <a href="#brands" onClick={closeMenu} className="py-2.5">For brands</a>
            {!user && (
              <Link to="/login" onClick={closeMenu} className="py-2.5">Log in</Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-ink-900 text-ink-200 mt-16 sm:mt-24">
        <div className="container-page py-14 sm:py-20">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5">
              <Logo invert />
              <p className="mt-5 text-ink-300 max-w-sm leading-relaxed">
                A working demo marketplace for micro-influencers and the brands
                that hire them. Built end-to-end as an internship PRD.
              </p>
              <div className="mt-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-blink" />
                <span className="text-xs font-mono uppercase tracking-[0.18em] text-ink-400">
                  Demo data — localStorage
                </span>
              </div>
            </div>

            <div className="lg:col-span-7 grid sm:grid-cols-3 gap-8 text-sm">
              <div>
                <h4 className="eyebrow text-ink-400">Product</h4>
                <ul className="mt-4 space-y-2.5">
                  <li><a href="#how" className="hover:text-paper-50 transition-colors">How it works</a></li>
                  <li><a href="#marketplace" className="hover:text-paper-50 transition-colors">Marketplace</a></li>
                  <li><a href="#creators" className="hover:text-paper-50 transition-colors">For creators</a></li>
                  <li><a href="#brands" className="hover:text-paper-50 transition-colors">For brands</a></li>
                </ul>
              </div>
              <div>
                <h4 className="eyebrow text-ink-400">Resources</h4>
                <ul className="mt-4 space-y-2.5">
                  <li className="hover:text-paper-50 transition-colors cursor-default">Trust &amp; safety</li>
                  <li className="hover:text-paper-50 transition-colors cursor-default">Help center</li>
                  <li className="hover:text-paper-50 transition-colors cursor-default">Terms</li>
                  <li className="hover:text-paper-50 transition-colors cursor-default">Privacy</li>
                </ul>
              </div>
              <div>
                <h4 className="eyebrow text-ink-400">Demo</h4>
                <ul className="mt-4 space-y-2.5">
                  <li className="hover:text-paper-50 transition-colors cursor-default">Internship PRD</li>
                  <li className="hover:text-paper-50 transition-colors cursor-default">Source on request</li>
                  <li className="hover:text-paper-50 transition-colors cursor-default">v0.2.0 · 2026</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-14 pt-6 border-t border-ink-700/70 flex flex-col sm:flex-row justify-between gap-3 text-xs text-ink-400">
            <span>© 2026 Microwork demo. Built for the internship PRD.</span>
            <span className="font-mono">designed with restraint, not gradients</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
