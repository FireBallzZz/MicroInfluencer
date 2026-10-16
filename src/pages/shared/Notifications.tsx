import { Link } from 'react-router-dom';
import { Bell, CheckCheck, BellOff, Inbox } from 'lucide-react';
import {
  useStore, markAllNotificationsRead, markNotificationRead, loadNotifications,
} from '../../state/Store';
import { fmtRelativeTime } from '../../data/seed';
import { useAuth } from '../../state/AuthContext';
import { Button, EmptyState, PageHeader } from '../../components/ui';
import clsx from 'clsx';
import type { AppNotification, Role } from '../../types';

type Group = { key: string; label: string; items: AppNotification[] };

function groupByDay(items: AppNotification[]): Group[] {
  const today: AppNotification[] = [];
  const earlier: AppNotification[] = [];
  const now = new Date();
  for (const n of items) {
    const d = new Date(n.createdAt);
    const sameDay =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
    if (sameDay) today.push(n);
    else earlier.push(n);
  }
  return [
    { key: 'today', label: 'Today', items: today },
    { key: 'earlier', label: 'Earlier', items: earlier },
  ];
}

const ICONS: Record<string, string> = {
  proposal_shortlisted: '★',
  proposal_accepted:    '✓',
  proposal_rejected:    '×',
  proposal_received:    '✉',
  proposal_withdrawn:   '↩',
  account_reconnect:    '!',
  slot_opened:          '↗',
  campaign_closed:      '■',
};

export default function NotificationsPage({ role }: { role: Role }) {
  const { user } = useAuth();
  const { notifications, loading, errors } = useStore();

  // Boot: fetch notifications (the in-memory list starts empty after a refresh).
  // useEffect(() => {
  //   loadNotifications().catch(() => undefined);
  // }, []);

  const sorted = [...notifications].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const groups = groupByDay(sorted);
  const unread = notifications.filter((n) => !n.read).length;

  const goTo = (n: AppNotification) => {
    markNotificationRead(n.id).catch(() => undefined);
    if (n.link) window.location.assign(n.link);
  };

  if (!user) return null;

  return (
    <div className="container-page py-6 sm:py-8 space-y-6 max-w-4xl">
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        description={unread > 0 ? `${unread} unread` : 'You’re all caught up.'}
        action={
          <Button
            variant="secondary"
            size="md"
            disabled={unread === 0}
            onClick={() => markAllNotificationsRead()}
          >
            <CheckCheck className="w-4 h-4" /> Mark all read
          </Button>
        }
      />

      {loading.notifications && (
        <div className="card p-6 text-center text-sm text-ink-500">Loading notifications…</div>
      )}

      {errors.notifications && (
        <div className="card p-6 text-center text-sm text-rose-700">{errors.notifications}</div>
      )}

      {groups.every((g) => g.items.length === 0) && !loading.notifications ? (
        <div className="card">
          <EmptyState
            icon={<Inbox className="w-5 h-5" />}
            title="You’re all caught up"
            description="New activity will appear here."
          />
        </div>
      ) : (
        <div className="space-y-6 stagger">
          {groups.map((g) => g.items.length === 0 ? null : (
            <section key={g.key} className="card p-0 overflow-hidden">
              <div className="px-4 sm:px-5 py-3 border-b border-ink-200">
                <div className="eyebrow">{g.label}</div>
              </div>
              <ul>
                {g.items.map((n) => (
                  <li key={n.id}>
                    <NotificationRow n={n} onClick={() => goTo(n)} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
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
        'w-full text-left px-4 sm:px-5 py-4 border-b border-ink-200/60 last:border-b-0 flex items-start gap-3 transition-colors hover:bg-paper-100',
        !n.read && 'bg-ember-50/40',
      )}
    >
      <div
        className={clsx(
          'w-9 h-9 rounded-md flex items-center justify-center shrink-0 font-mono text-sm',
          !n.read ? 'bg-ink-900 text-paper-50' : 'bg-ink-100 text-ink-500',
        )}
        aria-hidden
      >
        {ICONS[n.type] ?? '·'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className={clsx('text-sm font-semibold truncate', !n.read ? 'text-ink-900' : 'text-ink-700')}>
            {n.title}
          </div>
          {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-ember-500 shrink-0" />}
        </div>
        <div className="text-xs text-ink-500 mt-0.5 line-clamp-2">{n.description}</div>
        <div className="text-[11px] text-ink-400 mt-1 font-mono uppercase tracking-[0.12em]">
          {fmtRelativeTime(n.createdAt)}
        </div>
      </div>
    </button>
  );
}
