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
  ChevronDown,
  CheckCircle2,
  ArrowRight,
  Filter,
  Command,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { useAuth } from '../state/AuthContext';
import { useStore, markAllNotificationsRead, markNotificationRead } from '../state/Store';
import { fmtRelativeTime } from '../data/seed';
import type { AppNotification, Role } from '../types';
import { useAnimatedOpen } from './useAnimatedOpen';
import { Avatar } from './ui';

const creatorNav = [
  { to: '/creator/dashboard',    label: 'Dashboard',   icon: LayoutDashboard, end: true  },
  { to: '/creator/profile',      label: 'Profile',     icon: User,            end: false },
  { to: '/creator/campaigns',    label: 'Find work',   icon: Compass,         end: false },
  { to: '/creator/applications', label: 'My proposals',icon: ListChecks,      end: false },
  { to: '/creator/accounts',     label: 'Connected accounts', icon: Link2,    end: false },
] as const;

const brandNav = [
  { to: '/brand/dashboard',         label: 'Dashboard',       icon: LayoutDashboard, end: true  },
  { to: '/brand/creators',          label: 'Find creators',   icon: Search,           end: false },
  { to: '/brand/campaigns',         label: 'My campaigns',    icon: Megaphone,        end: false },
  { to: '/brand/campaigns/create',  label: 'Create campaign', icon: Plus,             end: false },
  { to: '/brand/profile',           label: 'Company profile', icon: Building2,        end: false },
] as const;

const quickActionsByRole: Record<Role, Array<{ label: string; hint: string; to: string; icon: any; accent: 'ink' | 'ember' | 'sky' | 'amber' | 'rose' }>> = {
  creator: [
    { label: 'Find work',         hint: 'Browse briefs that fit your niche', to: '/creator/campaigns',    icon: Compass,   accent: 'ember' },
    { label: 'Update your profile',hint: 'Stand out to brands',              to: '/creator/profile/edit', icon: User,      accent: 'sky' },
    { label: 'Reconnect YouTube', hint: 'Keep your stats verified',         to: '/creator/accounts',     icon: Link2,     accent: 'rose' },
    { label: 'Review proposals',  hint: 'Track status and withdraw',        to: '/creator/applications', icon: ListChecks,accent: 'amber' },
  ],
  brand: [
    { label: 'Create a campaign', hint: 'Reach creators in your niche',     to: '/brand/campaigns/create', icon: Plus,        accent: 'ember' },
    { label: 'Find creators',     hint: 'Search by niche, platform, audience', to: '/brand/creators',     icon: Search,      accent: 'sky' },
    { label: 'Review proposals',  hint: 'Shortlist, accept, reject',        to: '/brand/campaigns',       icon: Megaphone,   accent: 'amber' },
    { label: 'Edit company profile', hint: 'How creators see you',           to: '/brand/profile/edit',    icon: Building2,   accent: 'ink' },
  ],
};

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  if (!user) return null;

  const nav = user.role === 'creator' ? creatorNav : brandNav;
  const quickActions = quickActionsByRole[user.role];

  return (
    <div className="min-h-screen bg-paper-100/40">
      <header className="sticky top-0 z-30 bg-paper-50/90 backdrop-blur-md border-b border-ink-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center gap-2 sm:gap-4">
          <button
            className="lg:hidden p-2 -ml-2 text-ink-700 rounded-md hover:bg-ink-100/60"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle navigation"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link
            to={user.role === 'creator' ? '/creator/dashboard' : '/brand/dashboard'}
            className="flex items-center gap-2 shrink-0"
            aria-label="Microwork home"
          >
            <span className="inline-flex items-center justify-center w-7 h-7 bg-ink-900 text-paper-50 rounded-sm">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" aria-hidden>
                <path
                  d="M3 19V5h2.5L12 14 18.5 5H21v14h-2.5V10.6L13 18h-2L5 10.6V19H3z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span className="font-display text-[17px] font-semibold leading-none tracking-[-0.02em] text-ink-900 hidden sm:inline">
              Microwork
            </span>
          </Link>

          <div className="hidden md:flex flex-1 max-w-md ml-4">
            <GlobalSearch role={user.role} />
          </div>
          <div className="flex-1 md:hidden" />

          <div className="flex items-center gap-1 sm:gap-2">
            <div className="hidden sm:block">
              <QuickActionsButton actions={quickActions} />
            </div>
            <NotificationBell />
            <UserMenu onLogout={() => { logout(); navigate('/'); }} />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex gap-6 py-5 sm:py-6">
        {/* Sidebar — desktop */}
        <aside className="hidden lg:block w-60 shrink-0">
          <div className="sticky top-[88px] card p-2">
            <div className="px-3 py-2 mb-1.5 flex items-center justify-between">
              <span className="eyebrow">{user.role === 'creator' ? 'Creator' : 'Brand'}</span>
              <span className="font-mono text-[10px] text-ink-400">v0.2</span>
            </div>
            <nav className="flex flex-col">
              {nav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    clsx('nav-item group', isActive && 'nav-item-active')
                  }
                >
                  <item.icon className="w-4 h-4 text-ink-500 group-[.nav-item-active]:text-ink-900" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              ))}
            </nav>
            <div className="my-2 border-t border-ink-200/70" />
            <Link
              to="/"
              className="nav-item"
            >
              <LogOut className="w-4 h-4 text-ink-500" />
              <span>Switch demo role</span>
            </Link>
          </div>
        </aside>

        {/* Mobile drawer */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-ink-900/40 anim-fade-in lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
        )}
        <aside
          className={clsx(
            'fixed lg:hidden inset-y-0 left-0 z-40 w-72 bg-paper-50 border-r border-ink-200',
            'transform transition-transform duration-300 ease-out-quint',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          )}
          aria-label="Primary"
        >
          <div className="h-16 flex items-center justify-between px-4 border-b border-ink-200">
            <Link
              to={user.role === 'creator' ? '/creator/dashboard' : '/brand/dashboard'}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-2"
            >
              <span className="inline-flex items-center justify-center w-7 h-7 bg-ink-900 text-paper-50 rounded-sm">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" aria-hidden>
                  <path d="M3 19V5h2.5L12 14 18.5 5H21v14h-2.5V10.6L13 18h-2L5 10.6V19H3z" fill="currentColor" />
                </svg>
              </span>
              <span className="font-display text-[17px] font-semibold tracking-[-0.02em] text-ink-900">
                Microwork
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Close navigation"
              className="p-2 -mr-2 text-ink-700 rounded-md hover:bg-ink-100/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-3 overflow-y-auto h-[calc(100vh-64px)]">
            <div className="px-3 py-2 mb-1.5 flex items-center justify-between">
              <span className="eyebrow">{user.role === 'creator' ? 'Creator' : 'Brand'}</span>
            </div>
            <nav className="flex flex-col">
              {nav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    clsx('nav-item group', isActive && 'nav-item-active')
                  }
                >
                  <item.icon className="w-4 h-4 text-ink-500 group-[.nav-item-active]:text-ink-900" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              ))}
            </nav>
            <div className="my-2 border-t border-ink-200" />
            <Link to="/" onClick={() => setSidebarOpen(false)} className="nav-item">
              <LogOut className="w-4 h-4 text-ink-500" />
              <span>Switch demo role</span>
            </Link>
            <div className="mt-4 pt-3 border-t border-ink-200">
              <div className="px-3 mb-2 eyebrow">Quick actions</div>
              <div className="flex flex-col">
                {quickActions.map((a) => (
                  <Link
                    key={a.to}
                    to={a.to}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm hover:bg-paper-100"
                  >
                    <span className={clsx(
                      'w-7 h-7 rounded-md flex items-center justify-center shrink-0',
                      a.accent === 'ember' ? 'bg-ember-50 text-ember-700'
                      : a.accent === 'sky' ? 'bg-sky-50 text-sky-700'
                      : a.accent === 'amber' ? 'bg-amber-50 text-amber-700'
                      : a.accent === 'rose' ? 'bg-rose-50 text-rose-600'
                      : 'bg-ink-100 text-ink-700'
                    )}>
                      <a.icon className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-ink-700 font-semibold truncate">{a.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

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
      <label className="sr-only" htmlFor="global-search">Search</label>
      <div className="relative group">
        <Search className="w-4 h-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-ink-900" />
        <input
          id="global-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={role === 'creator' ? 'Search campaigns' : 'Search creators'}
          className="input pl-9 pr-12 h-10"
        />
        <kbd className="hidden lg:inline-flex items-center gap-1 absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] text-ink-400 border border-ink-200 rounded-sm px-1.5 h-6">
          <Command className="w-3 h-3" />K
        </kbd>
      </div>
    </form>
  );
}

function QuickActionsButton({
  actions,
}: {
  actions: Array<{ label: string; hint: string; to: string; icon: any; accent: 'ink' | 'ember' | 'sky' | 'amber' | 'rose' }>;
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
            'absolute right-0 mt-2 w-80 bg-paper-50 border border-ink-200 rounded-[14px] shadow-pop overflow-hidden z-50',
            open ? 'anim-pop-in' : 'anim-pop-out pointer-events-none'
          )}
          style={{ transformOrigin: 'top right' }}
        >
          <div className="px-4 py-3 border-b border-ink-200">
            <div className="eyebrow">Quick actions</div>
            <div className="text-xs text-ink-500 mt-0.5">Jump straight to the next thing</div>
          </div>
          <ul className="max-h-80 overflow-y-auto p-2">
            {actions.map((a) => (
              <li key={a.to}>
                <Link
                  to={a.to}
                  onClick={() => setOpen(false)}
                  role="menuitem"
                  className="group flex items-center gap-3 px-2 py-2.5 rounded-md hover:bg-paper-100 transition-colors"
                >
                  <span className={clsx(
                    'w-9 h-9 rounded-md flex items-center justify-center shrink-0 transition-transform group-hover:scale-105',
                    a.accent === 'ember' ? 'bg-ember-50 text-ember-700'
                    : a.accent === 'sky' ? 'bg-sky-50 text-sky-700'
                    : a.accent === 'amber' ? 'bg-amber-50 text-amber-700'
                    : a.accent === 'rose' ? 'bg-rose-50 text-rose-600'
                    : 'bg-ink-100 text-ink-700'
                  )}>
                    <a.icon className="w-4 h-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-ink-900 truncate">{a.label}</div>
                    <div className="text-xs text-ink-500 truncate">{a.hint}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-ink-300 group-hover:text-ember-600 group-hover:translate-x-0.5 transition-all" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

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

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 p-1 rounded-md hover:bg-ink-100/60 transition-colors"
        aria-expanded={open}
        aria-label="User menu"
      >
        <Avatar name={user.fullName} size="sm" tone="ink" />
        <ChevronDown className={clsx('w-3.5 h-3.5 text-ink-500 transition-transform duration-200 hidden sm:block', open && 'rotate-180')} />
      </button>
      {mounted && (
        <div
          className={clsx(
            'absolute right-0 mt-2 w-64 bg-paper-50 border border-ink-200 rounded-[14px] shadow-pop overflow-hidden z-50',
            open ? 'anim-pop-in' : 'anim-pop-out pointer-events-none'
          )}
          style={{ transformOrigin: 'top right' }}
        >
          <div className="px-4 py-3 border-b border-ink-200">
            <div className="flex items-center gap-2.5">
              <Avatar name={user.fullName} size="sm" tone="ink" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-ink-900 truncate">{user.fullName}</div>
                <div className="text-xs text-ink-500 truncate">{user.email}</div>
              </div>
            </div>
          </div>
          <ul className="p-1.5">
            <li>
              <Link
                to={user.role === 'creator' ? '/creator/profile' : '/brand/profile'}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-paper-100 text-ink-700 transition-colors"
              >
                <User className="w-4 h-4" /> View profile
              </Link>
            </li>
            <li>
              <Link
                to={user.role === 'creator' ? '/creator/notifications' : '/brand/notifications'}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-paper-100 text-ink-700 transition-colors"
              >
                <Bell className="w-4 h-4" /> Notifications
              </Link>
            </li>
          </ul>
          <div className="border-t border-ink-200 p-1.5">
            <button
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-paper-100 text-ink-700 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Switch demo role
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

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
        className="relative p-2 rounded-md hover:bg-ink-100/60 text-ink-700 transition-colors"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 bg-ember-500 text-paper-50 text-[10px] font-semibold rounded-sm min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {mounted && (
        <div
          className={clsx(
            'absolute right-0 mt-2 w-[min(92vw,24rem)] sm:w-96 bg-paper-50 border border-ink-200 rounded-[14px] shadow-pop overflow-hidden z-50',
            open ? 'anim-pop-in' : 'anim-pop-out pointer-events-none'
          )}
          style={{ transformOrigin: 'top right' }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-ink-200">
            <div>
              <div className="eyebrow">Notifications</div>
              <div className="text-xs text-ink-500 mt-0.5">{unread} unread</div>
            </div>
            <button
              className="text-xs text-ember-600 hover:text-ember-700 hover:underline disabled:opacity-50 disabled:hover:no-underline transition-colors font-semibold"
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
                {notifications.slice(0, 8).map((n) => (
                  <li key={n.id}>
                    <NotificationRow
                      n={n}
                      onClick={() => {
                        markNotificationRead(n.id);
                        setOpen(false);
                        if (n.link) navigate(n.link);
                      }}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="border-t border-ink-200 px-4 py-2 text-center">
            <Link
              to={user.role === 'creator' ? '/creator/notifications' : '/brand/notifications'}
              onClick={() => setOpen(false)}
              className="text-xs text-ink-700 hover:text-ink-900 font-semibold"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );

  function navigate(url: string) {
    window.location.assign(url);
  }
}

function NotificationRow({ n, onClick }: { n: AppNotification; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full text-left px-4 py-3 border-b border-ink-200/60 hover:bg-paper-100 flex gap-3 transition-colors',
        !n.read && 'bg-ember-50/40',
      )}
    >
      <div className={clsx('mt-1.5 w-2 h-2 rounded-sm shrink-0', n.read ? 'bg-transparent' : 'bg-ember-500')} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-ink-900 truncate">{n.title}</div>
        <div className="text-xs text-ink-500 line-clamp-2 mt-0.5">{n.description}</div>
        <div className="text-[11px] text-ink-400 mt-1 font-mono uppercase tracking-[0.12em]">{fmtRelativeTime(n.createdAt)}</div>
      </div>
    </button>
  );
}

export { Filter };
