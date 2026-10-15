import { Link } from 'react-router-dom';
import { Bell, CheckCheck, BellOff } from 'lucide-react';
import { useStore, markAllNotificationsRead, markNotificationRead, pushNotification } from '../../state/Store';
import { fmtRelativeTime } from '../../data/seed';
import { useAuth } from '../../state/AuthContext';
import { Button, EmptyState, PageHeader, SectionHeader } from '../../components/ui';
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
  const { notifications } = useStore();
  const sorted = [...notifications].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const groups = groupByDay(sorted);
  const unread = notifications.filter((n) => !n.read).length;

  const goTo = (n: AppNotification) => {
    markNotificationRead(n.id);
    if (n.link) window.location.assign(n.link);
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        description={unread > 0 ? `${unread} unread · all activity from your demo data.` : 'You’re all caught up.'}
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

      {/* Tiny dev tool to seed an extra notification (demo only) */}
      {role === 'creator' && (
        <div className="card p-4 sm:p-5 flex items-center justify-between gap-3">
          <div>
            <div className="eyebrow">Demo tool</div>
            <div className="text-sm text-ink-700 mt-0.5">Add a sample notification to see the animation.</div>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => pushNotification({
              type: 'proposal_shortlisted',
              title: 'You were shortlisted',
              description: 'Northwind Beverages shortlisted you for “Launch our new cold brew”.',
              link: '/creator/applications',
            })}
          >
            Send a sample
          </Button>
        </div>
      )}

      {groups.every((g) => g.items.length === 0) ? (
        <div className="card">
          <EmptyState
            icon={<BellOff className="w-5 h-5" />}
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
