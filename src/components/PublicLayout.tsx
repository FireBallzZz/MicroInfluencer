import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../state/AuthContext';

export default function PublicLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-ink-200 bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
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
          <div className="flex items-center gap-2">
            {user ? (
              <Link
                to={user.role === 'creator' ? '/creator/dashboard' : '/brand/dashboard'}
                className="btn btn-primary btn-md"
              >
                Open dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-md">Log in</Link>
                <button
                  onClick={() => navigate('/register/role')}
                  className="btn btn-primary btn-md"
                >
                  Get started
                </button>
              </>
            )}
          </div>
        </div>
      </header>
      <Outlet />
      <footer className="border-t border-ink-200 bg-ink-50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-sm text-ink-500 flex flex-col sm:flex-row justify-between gap-3">
          <div>© Microwork demo · Built for the internship PRD</div>
          <div className="flex gap-5">
            <span>Trust &amp; safety</span>
            <span>Help center</span>
            <span>Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
