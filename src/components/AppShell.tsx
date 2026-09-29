import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Search,
  Bell,
  Compass,
  ListChecks,
  Link2,
  LogOut,
  Plus,
  Megaphone,
  Building2,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { useAuth } from '../state/AuthContext';
import { useStore, markAllNotificationsRead, markNotificationRead } from '../state/Store';
import { fmtRelativeTime, currency } from '../data/seed';
import type { AppNotification } from '../types';
import { useAnimatedOpen } from './useAnimatedOpen';

const creatorNav = [
  { to: '/creator/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/creator/profile', label: 'Profile', icon: User },
  { to: '/creator/campaigns', label: 'Find work', icon: Compass },
  { to: '/creator/applications', label: 'My proposals', icon: ListChecks },
  { to: '/creator/accounts', label: 'Connected accounts', icon: Link2 },
];

const brandNav = [
  { to: '/brand/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/brand/creators', label: 'Find creators', icon: Search },
  { to: '/brand/campaigns', label: 'My campaigns', icon: Megaphone },
  { to: '/brand/campaigns/create', label: 'Create campaign', icon: Plus },
  { to: '/brand/profile', label: 'Company profile', icon: Building2 },
];

// Header quick-action lists (per role)
const quickActionsByRole = {
  creator: [
    {
      label: 'Apply to a campaign',
      hint: 'Browse briefs that fit your niche',
      to: '/creator/campaigns',
      icon: Compass,
      accent: 'bg-brand-50 text-brand-700',
    },
    {
      label: 'Update your profile',
      hint: 'Stand out to brands',
      to: '/creator/profile/edit',
      icon: User,
      accent: 'bg-sky-50 text-sky-700',
    },
    {
      label: 'Reconnect YouTube',
      hint: 'Keep your stats verified',
      to: '/creator/accounts',
      icon: Link2,
      accent: 'bg-rose-50 text-rose-700',
    },
    {
      label: 'Review your proposals',
      hint: 'Track status and withdraw',
      to: '/creator/applications',
      icon: ListChecks,
      accent: 'bg-amber-50 text-amber-700',
    },
  ],
  brand: [
    {
      label: 'Create a campaign',
      hint: 'Reach creators in your niche',
      to: '/brand/campaigns/create',
      icon: Plus,
      accent: 'bg-brand-50 text-brand-700',
    },
    {
      label: 'Find creators',
      hint: 'Search by niche, platform, audience',
      to: '/brand/creators',
      icon: Search,
      accent: 'bg-sky-50 text-sky-700',
    },
    {
      label: 'Review proposals',
      hint: 'Shortlist, accept, reject',
      to: '/brand/campaigns',
      icon: Megaphone,
      accent: 'bg-amber-50 text-amber-700',
    },
    {
      label: 'Edit company profile',
      hint: 'How creators see you',
      to: '/brand/profile/edit',
      icon: Building2,
      accent: 'bg-ink-100 text-ink-700',
    },
  ],
} as const;

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (!user) return null;

  const nav = user.role === 'creator' ? creatorNav : brandNav;
  const quickActions = quickActionsByRole[user.role];

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-ink-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center gap-2 sm:gap-4">
          <button
            className="lg:hidden p-2 -ml-2 text-ink-700"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle navigation"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link to={user.role === 'creator' ? '/creator/dashboard' : '/brand/dashboard'} className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-ink-900 text-lg tracking-tight hidden sm:inline">Microwork</span>
          </Link>
          <div className="hidden md:flex flex-1 max-w-md ml-4">
            <GlobalSearch role={user.role} />
          </div>
          <div className="flex-1 md:hidden" />
          <div className="flex items-center gap-1 sm:gap-2">
            <QuickActionsButton actions={[...quickActions]} />
            <NotificationBell />
            <UserMenu onLogout={() => { logout(); navigate('/'); }} />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-6 py-6">
        {/* Sidebar */}
        <aside
          className={clsx(
            'lg:w-60 lg:shrink-0',
            'fixed lg:static inset-y-0 left-0 z-40 w-72 lg:w-60 bg-white border-r border-ink-200 lg:border-0 lg:bg-transparent',
            'transform transition-transform duration-200 lg:transition-none lg:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="h-full lg:bg-white lg:rounded-2xl lg:border lg:border-ink-100 p-3 lg:shadow-card overflow-y-auto">
            <nav className="flex flex-col gap-1">
              {nav.map((item, i) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to.endsWith('dashboard')}
                  className={({ isActive }) =>
                    clsx(
                      'anim-item-in flex items-center gap-3 px-3 py-2 rounded-full text-sm font-semibold transition-colors',
                      isActive ? 'nav-pill-active' : 'nav-pill'
                    )
                  }
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="my-3 border-t border-ink-100" />
            <NavLink
              to="/"
              className="flex items-center gap-3 px-3 py-2 rounded-full text-sm font-semibold text-ink-700 hover:bg-ink-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Switch demo role
            </NavLink>
          </div>
        </aside>
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-ink-900/30 lg:hidden animate-in"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main key={location.pathname} className="flex-1 min-w-0 anim-page-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function GlobalSearch({ role }: { role: 'creator' | 'brand' }) {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const target = role === 'creator' ? '/creator/campaigns' : '/brand/creators';
        navigate(`${target}?q=${encodeURIComponent(q)}`);
      }}
      className="w-full"
    >
      <div className="relative group">
        <Search className="w-4 h-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-brand-600" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={role === 'creator' ? 'Search campaigns' : 'Search creators'}
          className="input pl-9"
        />
      </div>
    </form>
  );
}

/* -------- Quick Actions (click button -> animated list appears) -------- */

function QuickActionsButton({
  actions,
}: {
  actions: { label: string; hint: string; to: string; icon: any; accent: string }[];
}) {
  const { open, setOpen, mounted } = useAnimatedOpen(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [setOpen]);

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        onClick={() => setOpen(!open)}
        className={clsx(
          'btn btn-secondary btn-sm transition-all',
          open && 'bg-ink-50 border-ink-300'
        )}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Plus className="w-4 h-4" />
        Quick actions
        <ChevronDown className={clsx('w-3.5 h-3.5 transition-transform duration-200', open && 'rotate-180')} />
      </button>

      {mounted && (
        <div
          role="menu"
          className={clsx(
            'absolute right-0 mt-2 w-80 bg-white border border-ink-200 rounded-2xl shadow-pop overflow-hidden z-50',
            open ? 'anim-pop-in' : 'anim-pop-out pointer-events-none'
          )}
          style={{ transformOrigin: 'top right' }}
        >
          <div className="px-4 py-3 border-b border-ink-100">
            <div className="text-xs uppercase tracking-wide text-ink-500 font-semibold">Quick actions</div>
            <div className="text-xs text-ink-400 mt-0.5">Jump straight to the next thing</div>
          </div>
          <ul className="max-h-80 overflow-y-auto p-2">
            {actions.map((a, i) => (
              <li key={a.to}>
                <Link
                  to={a.to}
                  onClick={() => setOpen(false)}
                  role="menuitem"
                  className="group flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-ink-50 transition-colors"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105', a.accent)}>
                    <a.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-ink-900 truncate">{a.label}</div>
                    <div className="text-xs text-ink-500 truncate">{a.hint}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-ink-300 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* -------- User Menu -------- */

function UserMenu({ onLogout }: { onLogout: () => void }) {
  const { user } = useAuth();
  const { open, setOpen, mounted } = useAnimatedOpen(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [setOpen]);

  if (!user) return null;
  const initials = user.fullName
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-ink-100 transition-colors"
        aria-expanded={open}
      >
        <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-semibold ring-2 ring-white">
          {initials}
        </div>
        <ChevronDown className={clsx('w-3.5 h-3.5 text-ink-500 transition-transform duration-200 hidden sm:block', open && 'rotate-180')} />
      </button>
      {mounted && (
        <div
          className={clsx(
            'absolute right-0 mt-2 w-64 bg-white border border-ink-200 rounded-2xl shadow-pop overflow-hidden z-50',
            open ? 'anim-pop-in' : 'anim-pop-out pointer-events-none'
          )}
          style={{ transformOrigin: 'top right' }}
        >
          <div className="px-4 py-3 border-b border-ink-100">
            <div className="text-sm font-semibold text-ink-900 truncate">{user.fullName}</div>
            <div className="text-xs text-ink-500 truncate">{user.email}</div>
          </div>
          <ul className="p-1.5">
            <li>
              <Link
                to={user.role === 'creator' ? '/creator/profile' : '/brand/profile'}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-ink-50 text-ink-700 transition-colors"
              >
                <User className="w-4 h-4" /> View profile
              </Link>
            </li>
            <li>
              <Link
                to={user.role === 'creator' ? '/creator/notifications' : '/brand/notifications'}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-ink-50 text-ink-700 transition-colors"
              >
                <Bell className="w-4 h-4" /> Notifications
              </Link>
            </li>
          </ul>
          <div className="border-t border-ink-100 p-1.5">
            <button
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-ink-50 text-ink-700 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Switch demo role
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------- Notification Bell -------- */

function NotificationBell() {
  const { user } = useAuth();
  const notifications = useStore().notifications;
  const { open, setOpen, mounted } = useAnimatedOpen(false);
  const ref = useRef<HTMLDivElement>(null);
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [setOpen]);

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-ink-100 text-ink-700 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 bg-rose-500 text-white text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 ring-2 ring-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {mounted && (
        <div
          className={clsx(
            'absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-ink-200 rounded-2xl shadow-pop overflow-hidden z-50',
            open ? 'anim-pop-in' : 'anim-pop-out pointer-events-none'
          )}
          style={{ transformOrigin: 'top right' }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100">
            <div>
              <div className="text-sm font-semibold text-ink-900">Notifications</div>
              <div className="text-xs text-ink-500">{unread} unread</div>
            </div>
            <button
              className="text-xs text-brand-600 hover:text-brand-700 hover:underline disabled:opacity-50 disabled:hover:no-underline transition-colors"
              onClick={() => markAllNotificationsRead()}
              disabled={unread === 0}
            >
              Mark all read
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-ink-500">
                <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-ink-300" />
                You’re all caught up.
              </div>
            ) : (
              <ul>
                {notifications.slice(0, 10).map((n) => (
                  <li key={n.id}>
                    <NotificationRow
                      n={n}
                      onClick={() => {
                        markNotificationRead(n.id);
                        setOpen(false);
                        if (n.link) window.location.assign(n.link);
                      }}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="border-t border-ink-100 px-4 py-2 text-center">
            <Link
              to={user.role === 'creator' ? '/creator/notifications' : '/brand/notifications'}
              onClick={() => setOpen(false)}
              className="text-xs text-brand-600 hover:underline"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationRow({ n, onClick }: { n: AppNotification; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full text-left px-4 py-3 border-b border-ink-50 hover:bg-ink-50 flex gap-3 transition-colors',
        !n.read && 'bg-brand-50/40'
      )}
    >
      <div className={clsx('mt-1.5 w-2 h-2 rounded-full shrink-0', n.read ? 'bg-transparent' : 'bg-brand-500')} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-ink-900 truncate">{n.title}</div>
        <div className="text-xs text-ink-600 line-clamp-2">{n.description}</div>
        <div className="text-[11px] text-ink-400 mt-0.5">{fmtRelativeTime(n.createdAt)}</div>
      </div>
    </button>
  );
}