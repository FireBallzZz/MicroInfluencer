import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Sparkles, Menu, X } from 'lucide-react';
import { useAuth } from '../state/AuthContext';
import { useEffect, useState } from 'react';

export default function PublicLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Sticky header glass effect after scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Esc + scroll lock while the mobile sheet is open
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

  return (
    <div className="min-h-screen bg-white">
      <header
        className={`sticky top-0 z-30 transition-all duration-300
          ${scrolled
            ? 'glass border-b border-ink-200/70 shadow-card'
            : 'border-b border-transparent bg-white'}
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
            <div className="relative w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-[0_4px_12px_-2px_rgba(20,168,0,.5)]">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-white/30" />
            </div>
            <span className="font-bold text-ink-900 text-lg tracking-tight">Microwork</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-ink-700">
            <a href="#how" className="hover:text-ink-900 transition-colors">How it works</a>
            <a href="#creators" className="hover:text-ink-900 transition-colors">For creators</a>
            <a href="#brands" className="hover:text-ink-900 transition-colors">For brands</a>
          </nav>
          <div className="flex items-center gap-1 sm:gap-2">
            {user ? (
              <Link
                to={user.role === 'creator' ? '/creator/dashboard' : '/brand/dashboard'}
                className="btn btn-primary btn-sm sm:btn-md"
              >
                <span className="hidden sm:inline">Open dashboard</span>
                <span className="sm:hidden">Dashboard</span>
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
                  Get started
                </button>
              </>
            )}
            <button
              type="button"
              className="md:hidden ml-1 inline-flex items-center justify-center w-10 h-10 rounded-full text-ink-700 hover:bg-ink-100"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile slide-down menu */}
        <div
          className={`md:hidden border-t border-ink-200 bg-white/95 backdrop-blur origin-top overflow-hidden transition-all duration-300
            ${menuOpen ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 pointer-events-none'}`}
        >
          <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1 text-sm font-medium text-ink-700">
            <a href="#how" onClick={closeMenu} className="py-2.5 hover:text-ink-900">How it works</a>
            <a href="#creators" onClick={closeMenu} className="py-2.5 hover:text-ink-900">For creators</a>
            <a href="#brands" onClick={closeMenu} className="py-2.5 hover:text-ink-900">For brands</a>
            {!user && (
              <Link to="/login" onClick={closeMenu} className="py-2.5 hover:text-ink-900">
                Log in
              </Link>
            )}
          </nav>
        </div>
      </header>
      <Outlet />
      <footer className="border-t border-ink-200 bg-ink-50 mt-12 sm:mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-ink-900 text-lg tracking-tight">Microwork</span>
              </div>
              <p className="mt-3 text-ink-600 max-w-sm">
                A demo marketplace for micro-influencers and brands. Built as part of an internship PRD.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500">Product</h4>
              <ul className="mt-3 space-y-2 text-ink-700">
                <li><a href="#how" className="hover:text-ink-900">How it works</a></li>
                <li><a href="#creators" className="hover:text-ink-900">For creators</a></li>
                <li><a href="#brands" className="hover:text-ink-900">For brands</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500">Resources</h4>
              <ul className="mt-3 space-y-2 text-ink-700">
                <li>Trust &amp; safety</li>
                <li>Help center</li>
                <li>Terms</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-ink-200 text-xs text-ink-500 flex flex-col sm:flex-row justify-between gap-3">
            <div>© Microwork demo · Built for the internship PRD</div>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <span>Privacy</span>
              <span>Cookies</span>
              <span>Status</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}