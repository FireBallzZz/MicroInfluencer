import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  User, Search, Bell, Compass, ListChecks, Link2, LogOut, Plus,
  Megaphone, Building2, Menu, X, ChevronDown, CheckCircle2, ArrowRight,
  Command, Sparkles, Home, ArrowUpRight, Mail,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { useAuth } from '../state/AuthContext';
import {
  useStore, markAllNotificationsRead, markNotificationRead, loadNotifications,
} from '../state/Store';
import { fmtRelativeTime } from '../data/seed';
import type { AppNotification, Role } from '../types';
import { useAnimatedOpen } from './useAnimatedOpen';
import { Avatar } from './ui';
import { Wordmark, Mark } from './Logo';

type NavItem = { to: string; label: string; end?: boolean };
type Accent = 'ink' | 'ember' | 'sky' | 'amber' | 'rose';
type QuickAction = { label: string; hint: string; to: string; icon: any; accent: Accent };

const creatorNav: NavItem[] = [
  { to: '/creator/dashboard',    label: 'Dashboard',   end: true },
  { to: '/creator/profile',      label: 'Profile' },
  { to: '/creator/campaigns',    label: 'Find work' },
  { to: '/creator/applications', label: 'Proposals' },
  { to: '/creator/accounts',     label: 'Accounts' },
];

const brandNav: NavItem[] = [
  { to: '/brand/dashboard', label: 'Dashboard',     end: true },
  { to: '/brand/creators',  label: 'Find creators' },
  { to: '/brand/campaigns', label: 'Campaigns' },
  { to: '/brand/profile',   label: 'Company' },
];

const creatorActions: QuickAction[] = [
  { label: 'Find work',           hint: 'Browse briefs that fit your niche',  to: '/creator/campaigns',    icon: Compass,   accent: 'ember' },
  { label: 'Update your profile', hint: 'Stand out to brands',                to: '/creator/profile/edit', icon: User,      accent: 'sky' },
  { label: 'Reconnect YouTube',   hint: 'Keep your stats verified',           to: '/creator/accounts',     icon: Link2,     accent: 'rose' },
  { label: 'Review proposals',    hint: 'Track status and withdraw',          to: '/creator/applications', icon: ListChecks, accent: 'amber' },
];

const brandActions: QuickAction[] = [
  { label: 'Create a campaign',   hint: 'Reach creators in your niche',          to: '/brand/campaigns/create', icon: Plus,      accent: 'ember' },
  { label: 'Find creators',       hint: 'Search by niche, platform, audience',   to: '/brand/creators',          icon: Search,    accent: 'sky' },
  { label: 'Review proposals',    hint: 'Shortlist, accept, reject',             to: '/brand/campaigns',         icon: Megaphone, accent: 'amber' },
  { label: 'Edit company profile',hint: 'How creators see you',                  to: '/brand/profile/edit',      icon: Building2, accent: 'ink' },
];

const quickActionsByRole: Record<Role, QuickAction[]> = {
  creator: creatorActions,
  brand: brandActions,
  admin: [],
};

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cmdkOpen, setCmdkOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdkOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
    setCmdkOpen(false);
    document.body.style.overflow = '';
  }, [location.pathname]);

  useEffect(() => {
    if (!sidebarOpen && !cmdkOpen) {
      document.body.style.overflow = '';
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false);
        setCmdkOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [sidebarOpen, cmdkOpen]);

  // Boot: pull the latest notifications so the bell badge is correct, then poll every 30s.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const load = () => {
      if (cancelled) return;
      loadNotifications().catch(() => undefined);
    };
    load();
    const id = window.setInterval(load, 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [user?.id]);

  if (!user) return null;

  const { creator, brand } = useStore();
  const avatarUrl = user.avatarUrl || (user.role === 'creator' ? creator?.avatarUrl : brand?.logoUrl);

  const nav = user.role === 'creator' ? creatorNav : brandNav;
  const quickActions = quickActionsByRole[user.role];
  const primaryAction = user.role === 'brand'
    ? { to: '/brand/campaigns/create', label: 'New campaign', icon: Plus }
    : { to: '/creator/campaigns', label: 'Find work', icon: Compass };



  return (
    <div className="min-h-screen bg-paper-100 flex flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-ink-900 focus:text-paper-50 focus:px-3 focus:py-2 focus:rounded-sm focus:text-sm focus:font-semibold"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-30 bg-paper-50/95 backdrop-blur-md border-b border-ink-200">
        <div className="container-page h-14 sm:h-16 flex items-center gap-1.5 sm:gap-3 lg:gap-6">
          <button
            className="lg:hidden -ml-1 inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 text-ink-700 rounded-md hover:bg-ink-100/60 shrink-0"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </button>

          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            <Wordmark
              to={user.role === 'creator' ? '/creator/dashboard' : '/brand/dashboard'}
              size="md"
            />
            <span
              aria-hidden
              className="hidden sm:inline-block font-mono text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-sm bg-paper-100 text-ink-500"
            >
              {user.role}
            </span>
          </div>

          <nav aria-label="Primary" className="hidden lg:flex flex-1 items-center justify-center min-w-0">
            <ul className="flex items-center gap-1 text-sm text-ink-700">
              {nav.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      clsx(
                        'inline-flex items-center px-3 py-2 rounded-md font-medium transition-colors',
                        isActive ? 'bg-ink-100 text-ink-900' : 'hover:text-ink-900 hover:bg-paper-100',
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-0.5 sm:gap-1.5 shrink-0 ml-auto">
            <button
              onClick={() => setCmdkOpen(true)}
              aria-label="Search"
              className="lg:hidden inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 text-ink-700 rounded-md hover:bg-ink-100/60"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={() => setCmdkOpen(true)}
              className="hidden lg:inline-flex items-center justify-center w-9 h-9 text-ink-500 hover:text-ink-900 hover:bg-paper-100 rounded-md transition-colors"
              aria-label="Open command palette"
            >
              <Search className="w-4 h-4" />
            </button>

            <Link
              to={user.role === 'creator' ? '/creator/dashboard' : '/brand/dashboard'}
              aria-label="Dashboard"
              className="hidden sm:inline-flex items-center justify-center gap-1.5 h-9 px-2.5 text-xs text-ink-500 hover:text-ink-900 hover:bg-paper-100 font-medium rounded-md transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Home</span>
            </Link>

            <NotificationBell />
            <UserMenu
              name={user.fullName}
              email={user.email}
              role={user.role}
              avatarUrl={avatarUrl}
              onLogout={() => { logout(); navigate('/'); }}
            />
          </div>
        </div>
      </header>

      {user && user.emailVerified === false && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="container-page py-2.5 flex items-center justify-between gap-3 text-sm">
            <span className="text-amber-900 inline-flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-600" />
              <span><strong>Verify your email</strong> to receive notification emails.</span>
            </span>
            <Link
              to="/verify-email"
              state={{ email: user.email }}
              className="text-amber-900 hover:text-amber-700 font-semibold text-sm underline shrink-0"
            >
              Verify
            </Link>
          </div>
        </div>
      )}

      <main key={location.pathname} id="main" className="flex-1 min-w-0 anim-page-in bg-paper-50">
        <Outlet />
      </main>

      <MobileDrawer
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        nav={nav}
        primaryAction={primaryAction}
        role={user.role}
        onLogout={() => { logout(); navigate('/'); }}
      />



      <CommandPalette
        open={cmdkOpen}
        onClose={() => setCmdkOpen(false)}
        role={user.role}
        nav={nav.map((n) => ({ ...n, icon: Link2 }))}
        quickActions={quickActions}
      />
    </div>
  );
}

function MobileDrawer({
  open, onClose, nav, primaryAction, role, onLogout,
}: {
  open: boolean;
  onClose: () => void;
  nav: NavItem[];
  primaryAction: { to: string; label: string; icon: any };
  role: Role;
  onLogout: () => void;
}) {
  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        className={clsx(
          'fixed inset-0 z-40 bg-ink-900/40 transition-opacity duration-300 ease-out-quint lg:hidden',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
      />
      <aside
        className={clsx(
          'fixed lg:hidden inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-paper-50 border-r border-ink-200 transform transition-transform duration-300 ease-out-quint flex flex-col',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Primary mobile"
        aria-hidden={!open}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-ink-200 shrink-0">
          <Link
            to={role === 'creator' ? '/creator/dashboard' : '/brand/dashboard'}
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <Mark size="md" />
            <span className="font-display text-[20px] font-semibold tracking-[-0.035em] text-ink-900">
              Micro<span className="text-ember-600 italic font-medium">·</span>work
            </span>
          </Link>
          <button
            onClick={onClose}
            aria-label="Close navigation"
            className="p-2 -mr-2 text-ink-700 rounded-md hover:bg-ink-100/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <Link to={primaryAction.to} onClick={onClose} className="btn btn-primary btn-md w-full mb-3">
            <primaryAction.icon className="w-4 h-4" /> {primaryAction.label}
          </Link>
          <nav className="flex flex-col" aria-label="Primary mobile drawer">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) => clsx('nav-item group', isActive && 'nav-item-active')}
              >
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="border-t border-ink-200 p-3 shrink-0">
          <button onClick={() => { onClose(); onLogout(); }} className="nav-item w-full text-danger hover:bg-rose-50">
            <LogOut className="w-4 h-4 text-danger" />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}


function CommandPalette({
  open, onClose, role, nav, quickActions,
}: {
  open: boolean;
  onClose: () => void;
  role: Role;
  nav: Array<{ to: string; label: string; icon: any; end?: boolean }>;
  quickActions: Array<{ label: string; to: string; icon: any; accent: Accent }>;
}) {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setQ('');
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const items = useMemo(() => {
    const all = [
      ...nav.map((n) => ({ type: 'Page' as const, label: n.label, to: n.to, icon: n.icon })),
      ...quickActions.map((a) => ({ type: 'Action' as const, label: a.label, to: a.to, icon: a.icon })),
      { type: 'External' as const, label: 'Landing page', to: '/', icon: Home },
      { type: 'Action' as const, label: 'Log out', to: '/', icon: LogOut },
    ];
    if (!q) return all;
    const k = q.toLowerCase();
    return all.filter((i) => i.label.toLowerCase().includes(k));
  }, [q, nav, quickActions]);

  useEffect(() => { setCursor(0); }, [q]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(items.length - 1, c + 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setCursor((c) => Math.max(0, c - 1)); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        const item = items[cursor];
        if (item) { onClose(); navigate(item.to); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, items, cursor, navigate, onClose]);

  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(`[data-cursor="${cursor}"]`);
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [cursor]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center pt-[10vh] px-3 bg-ink-900/40 anim-fade-in"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-label="Command palette"
      aria-modal="true"
    >
      <div
        className="w-full max-w-xl bg-paper-50 border border-ink-200 rounded-[16px] shadow-pop overflow-hidden"
        style={{ transformOrigin: 'top center' }}
      >
        <div className="flex items-center gap-3 px-4 h-14 border-b border-ink-200">
          <Search className="w-4 h-4 text-ink-500" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={role === 'creator' ? 'Search actions, pages…' : 'Search campaigns, creators…'}
            className="flex-1 bg-transparent outline-none text-[15px] text-ink-900 placeholder:text-ink-400"
          />
          <kbd className="font-mono text-[10px] text-ink-500 border border-ink-200 rounded-sm px-1.5 h-6 inline-flex items-center">ESC</kbd>
        </div>
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-1.5">
          {items.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-ink-500">No matches for &ldquo;{q}&rdquo;</div>
          ) : (
            items.map((item, i) => (
              <button
                key={`${item.type}-${item.label}-${i}`}
                data-cursor={i}
                onClick={() => { onClose(); navigate(item.to); }}
                onMouseEnter={() => setCursor(i)}
                className={clsx(
                  'w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors',
                  i === cursor ? 'bg-ink-100 text-ink-900' : 'text-ink-700 hover:bg-paper-100',
                )}
              >
                <span className={clsx(
                  'w-7 h-7 rounded-sm flex items-center justify-center shrink-0',
                  i === cursor ? 'bg-ink-900 text-paper-50' : 'bg-paper-100 text-ink-700',
                )}>
                  <item.icon className="w-3.5 h-3.5" />
                </span>
                <span className="flex-1 truncate font-semibold">{item.label}</span>
                <span className="eyebrow text-ink-400">{item.type}</span>
                {i === cursor && <ArrowRight className="w-3.5 h-3.5 text-ink-500" />}
              </button>
            ))
          )}
        </div>
        <div className="border-t border-ink-200 px-4 py-2.5 flex items-center justify-between text-[11px] text-ink-500 font-mono">
          <span>↑ ↓ navigate · ↵ open</span>
          <span>{items.length} result{items.length === 1 ? '' : 's'}</span>
        </div>
      </div>
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
        className="relative inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 text-ink-700 rounded-md hover:bg-ink-100/60 transition-colors"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
      >
        <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 bg-ember-500 text-paper-50 text-[10px] font-semibold rounded-sm min-w-[16px] sm:min-w-[18px] h-[16px] sm:h-[18px] flex items-center justify-center px-0.5 sm:px-1">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {mounted && (
        <div
          className={clsx(
            'absolute right-0 mt-2 w-[min(calc(100vw-1rem),24rem)] sm:w-96 bg-paper-50 border border-ink-200 rounded-[14px] shadow-pop overflow-hidden z-50 max-sm:-right-2',
            open ? 'anim-pop-in' : 'anim-pop-out pointer-events-none',
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
                You&rsquo;re all caught up.
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
                        if (n.link) window.location.assign(n.link);
                      }}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="border-t border-ink-200 px-4 py-2 flex items-center justify-between gap-2">
            <Link
              to={user.role === 'creator' ? '/creator/notifications' : '/brand/notifications'}
              onClick={() => setOpen(false)}
              className="text-xs text-ink-700 hover:text-ink-900 font-semibold"
            >
              View all
            </Link>
            <Link
              to={user.role === 'creator' ? '/creator/settings/notifications' : '/brand/settings/notifications'}
              onClick={() => setOpen(false)}
              className="text-xs text-ink-700 hover:text-ink-900 font-semibold"
            >
              Settings
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
        'w-full text-left px-4 py-3 border-b border-ink-200/60 hover:bg-paper-100 flex gap-3 transition-colors',
        !n.read && 'bg-ember-50/40',
      )}
    >
      <div className={clsx('mt-1.5 w-2 h-2 rounded-sm shrink-0', n.read ? 'bg-transparent' : 'bg-ember-500')} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-ink-900 truncate">{n.title}</div>
        <div className="text-xs text-ink-500 line-clamp-2 mt-0.5">{n.description}</div>
        <div className="text-[11px] text-ink-400 mt-1 font-mono uppercase tracking-[0.12em]">
          {fmtRelativeTime(n.createdAt)}
        </div>
      </div>
    </button>
  );
}

function UserMenu({
  name, email, role, avatarUrl, onLogout,
}: {
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  onLogout: () => void;
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
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 p-1 rounded-md hover:bg-ink-100/60 transition-colors"
        aria-expanded={open}
        aria-label="User menu"
      >
        <Avatar name={name} src={avatarUrl} size="sm" tone="ink" />
        <ChevronDown
          className={clsx('w-3.5 h-3.5 text-ink-500 transition-transform duration-200 hidden sm:block', open && 'rotate-180')}
        />
      </button>
      {mounted && (
        <div
          className={clsx(
            'absolute right-0 top-full mt-2 w-[min(calc(100vw-1.5rem),16rem)] bg-paper-50 border border-ink-200 rounded-[14px] shadow-pop overflow-hidden z-50',
            open ? 'anim-pop-in' : 'anim-pop-out pointer-events-none',
          )}
          style={{ transformOrigin: 'top right' }}
        >
          <div className="px-4 py-3 border-b border-ink-200">
            <div className="flex items-center gap-2.5">
              <Avatar name={name} src={avatarUrl} size="sm" tone="ink" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-ink-900 truncate">{name}</div>
                <div className="text-xs text-ink-500 truncate">{email}</div>
              </div>
            </div>
          </div>
          <ul className="p-1.5">
            <li>
              <Link
                to={role === 'creator' ? '/creator/profile' : '/brand/profile'}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-paper-100 text-ink-700 transition-colors"
              >
                <User className="w-4 h-4" /> View profile
              </Link>
            </li>
            <li>
              <Link
                to={role === 'creator' ? '/creator/notifications' : '/brand/notifications'}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-paper-100 text-ink-700 transition-colors"
              >
                <Bell className="w-4 h-4" /> Notifications
              </Link>
            </li>
            <li>
              <Link
                to={role === 'creator' ? '/creator/dashboard' : '/brand/dashboard'}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-paper-100 text-ink-700 transition-colors"
              >
                <Home className="w-4 h-4" /> Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-paper-100 text-ink-700 transition-colors"
              >
                <ArrowUpRight className="w-4 h-4" /> Public landing page
              </Link>
            </li>
          </ul>
          <div className="border-t border-ink-200 p-1.5">
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-rose-50 text-danger hover:text-danger transition-colors font-medium"
            >
              <LogOut className="w-4 h-4" /> Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
