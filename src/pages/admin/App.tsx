import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../state/AdminAuthContext';
import { LogOut, ShieldCheck, Users, BarChart3, ListChecks } from 'lucide-react';
import clsx from 'clsx';

export default function AdminApp() {
  const { user, logout, ready } = useAdminAuth();
  const navigate = useNavigate();

  if (!ready) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-ink-500">Loading…</div>;
  }
  if (!user || user.role !== 'admin') {
    navigate('/admin/login', { replace: true });
    return null;
  }

  const onLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-paper-50">
      <header className="border-b border-ink-200 bg-paper-50/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <Link to="/admin/overview" className="flex items-center gap-2 font-display text-lg text-ink-900">
            <span className="w-7 h-7 rounded-md bg-ink-900 text-paper-50 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </span>
            Microwork · Admin
          </Link>
          <nav className="hidden md:flex items-center gap-1 ml-4 text-sm">
            <AdminNavLink to="/admin/overview" icon={<BarChart3 className="w-4 h-4" />}>Overview</AdminNavLink>
            <AdminNavLink to="/admin/users" icon={<Users className="w-4 h-4" />}>Users</AdminNavLink>
            <AdminNavLink to="/admin/actions" icon={<ListChecks className="w-4 h-4" />}>Audit log</AdminNavLink>
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="hidden sm:inline text-ink-500">@{user.username}</span>
            <button onClick={onLogout} className="btn btn-secondary btn-sm">
              <LogOut className="w-3.5 h-3.5" /> Log out
            </button>
          </div>
        </div>
        {/* Mobile navigation row */}
        <nav aria-label="Admin mobile navigation" className="md:hidden border-t border-ink-200/60 bg-paper-100/50 px-3 py-2 flex items-center justify-around gap-1 text-xs">
          <AdminNavLink to="/admin/overview" icon={<BarChart3 className="w-3.5 h-3.5" />}>Overview</AdminNavLink>
          <AdminNavLink to="/admin/users" icon={<Users className="w-3.5 h-3.5" />}>Users</AdminNavLink>
          <AdminNavLink to="/admin/actions" icon={<ListChecks className="w-3.5 h-3.5" />}>Audit log</AdminNavLink>
        </nav>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}

function AdminNavLink({ to, icon, children }: { to: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          'inline-flex items-center gap-2 px-3 h-9 rounded-md transition-colors',
          isActive ? 'bg-ink-900 text-paper-50' : 'text-ink-700 hover:bg-paper-100',
        )
      }
    >
      {icon}
      {children}
    </NavLink>
  );
}
