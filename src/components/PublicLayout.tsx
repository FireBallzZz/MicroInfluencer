import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ArrowUpRight, Sparkles, LayoutDashboard, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Logo } from './Logo';
import { useAuth } from '../state/AuthContext';
import clsx from 'clsx';

const PUBLIC_NAV = [
  { href: '#how',         label: 'How it works' },
  { href: '#marketplace', label: 'Marketplace' },
  { href: '#creators',    label: 'For creators' },
  { href: '#brands',      label: 'For brands' },
] as const;

export default function PublicLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const dashboardLink = user
    ? user.role === 'creator' ? '/creator/dashboard' : '/brand/dashboard'
    : null;

  useEffect(() => {
    setMenuOpen(false);
    document.body.style.overflow = '';
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      document.body.style.overflow = '';
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen bg-paper-50 text-ink-700 flex flex-col">
      {/* Skip link for keyboard users */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50
                   focus:bg-ink-900 focus:text-paper-50 focus:px-3 focus:py-2 focus:rounded-sm
                   focus:text-sm focus:font-semibold"
      >
        Skip to main content
      </a>

      <header
        className={clsx(
          'sticky top-0 z-40 transition-all duration-300 ease-out-quint',
          scrolled
            ? 'bg-paper-50/95 backdrop-blur-md border-b border-ink-200/80 shadow-[0_1px_0_rgba(11,10,8,0.02)]'
            : 'bg-paper-50/0 border-b border-transparent',
        )}
      >
        <div className="container-page h-16 flex items-center justify-between gap-3 sm:gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <Logo to={dashboardLink || '/'} onClick={closeMenu} size="md" />
            <span
              aria-hidden
              className="hidden sm:inline-block font-mono text-[10px] uppercase tracking-[0.18em]
                         px-1.5 py-0.5 rounded-sm bg-paper-100 text-ink-500"
            >
              {user ? user.role : 'demo'}
            </span>
          </div>

          {/* Center nav (desktop & tablet) */}
          <nav
            aria-label="Primary"
            className="hidden lg:flex items-center gap-1 text-sm text-ink-700"
          >
            {PUBLIC_NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-3 py-2 rounded-md font-medium hover:text-ink-900 hover:bg-paper-100 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {user ? (
              <Link
                to={dashboardLink!}
                className="btn btn-primary btn-sm sm:btn-md"
              >
                <LayoutDashboard className="w-4 h-4 hidden sm:inline" />
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn btn-ghost btn-sm sm:btn-md hidden sm:inline-flex"
                >
                  Log in
                </Link>
                <button
                  onClick={() => navigate('/register/role')}
                  className="btn btn-primary btn-sm sm:btn-md"
                >
                  <Sparkles className="w-3.5 h-3.5 hidden sm:inline" />
                  Sign up
                  <ArrowUpRight className="w-3.5 h-3.5 hidden sm:inline" />
                </button>
              </>
            )}

            {/* Hamburger (below lg) */}
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="primary-mobile-menu"
              className="lg:hidden ml-1 inline-flex items-center justify-center w-10 h-10
                         text-ink-700 hover:bg-ink-100/60 rounded-md"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile sheet */}
        <div
          id="primary-mobile-menu"
          className={clsx(
            'lg:hidden overflow-hidden border-t border-ink-200 bg-paper-50',
            'transition-all duration-300 ease-out-quint',
            menuOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0 pointer-events-none',
          )}
          aria-hidden={!menuOpen}
        >
          <nav
            className="container-page py-3 flex flex-col text-sm text-ink-700"
            aria-label="Primary mobile"
          >
            {PUBLIC_NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="py-3 border-b border-ink-200/60 last:border-b-0 font-medium
                           hover:text-ink-900 transition-colors"
              >
                {item.label}
              </a>
            ))}
            {user ? (
              <Link
                to={dashboardLink!}
                onClick={closeMenu}
                className="py-3 border-b border-ink-200/60 font-semibold text-ember-700 hover:text-ember-800 transition-colors flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to Dashboard ({user.role})</span>
                </span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="py-3 border-b border-ink-200/60 font-medium hover:text-ink-900 transition-colors"
                >
                  Log in
                </Link>
                <button
                  onClick={() => { closeMenu(); navigate('/register/role'); }}
                  className="py-3 text-left font-medium text-ember-700 hover:text-ember-800 transition-colors"
                >
                  Sign up →
                </button>
              </>
            )}
            <p className="mt-3 eyebrow text-ink-400">
              Demo data · localStorage
            </p>
          </nav>
        </div>
      </header>

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-ink-900 text-ink-200 mt-16 sm:mt-24">
        <div className="container-page py-14 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5">
              <Logo variant="invert" size="md" />
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

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm">
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
                  <li><Link to="/terms" className="hover:text-paper-50 transition-colors">Terms</Link></li>
                  <li><Link to="/privacy" className="hover:text-paper-50 transition-colors">Privacy</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="eyebrow text-ink-400">Demo</h4>
                <ul className="mt-4 space-y-2.5">
                  <li className="hover:text-paper-50 transition-colors cursor-default">Internship PRD</li>
                  <li className="hover:text-paper-50 transition-colors cursor-default">Source on request</li>
                  <li className="hover:text-paper-50 transition-colors cursor-default">v0.3 · 2026</li>
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
