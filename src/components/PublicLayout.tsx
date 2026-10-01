import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Sparkles, Menu, X } from 'lucide-react';
import { useAuth } from '../state/AuthContext';
import { useEffect, useState } from 'react';

export default function PublicLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Lock body scroll while the mobile sheet is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-ink-200 bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-ink-900 text-lg tracking-tight">Microwork</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-ink-700">
            <a href="#how" className="hover:text-ink-900">How it works</a>
            <a href="#creators" className="hover:text-ink-900">For creators</a>
            <a href="#brands" className="hover:text-ink-900">For brands</a>
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
            {/* Mobile menu trigger */}
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
        {menuOpen && (
          <div className="md:hidden border-t border-ink-200 bg-white">
            <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1 text-sm font-medium text-ink-700">
              <a href="#how" onClick={closeMenu} className="py-2.5 hover:text-ink-900">How it works</a>
              <a href="#creators" onClick={closeMenu} className="py-2.5 hover:text-ink-900">For creators</a>
              <a href="#brands" onClick={closeMenu} className="py-2.5 hover:text-ink-900">For brands</a>
              {!user && (
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="py-2.5 hover:text-ink-900"
                >
                  Log in
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>
      <Outlet />
      <footer className="border-t border-ink-200 bg-ink-50 mt-12 sm:mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-sm text-ink-500 flex flex-col sm:flex-row justify-between gap-3">
          <div>© Microwork demo · Built for the internship PRD</div>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <span>Trust &amp; safety</span>
            <span>Help center</span>
            <span>Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
