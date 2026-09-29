import { useStore, markAllNotificationsRead, markNotificationRead } from '../../state/Store';
import { EmptyState } from '../../components/ui';
import { Bell } from 'lucide-react';
import { fmtRelativeTime } from '../../data/seed';
import { useNavigate } from 'react-router-dom';

export default function NotificationsPage({ role }: { role: 'creator' | 'brand' }) {
  const navigate = useNavigate();
  const notifications = useStore().notifications;

  const onClick = (id: string, link?: string) => {
    markNotificationRead(id);
    if (link) navigate(link);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Notifications</h1>
          <p className="text-sm text-ink-500">{role === 'creator' ? 'Updates on your proposals and account' : 'Updates on your proposals and campaigns'}</p>
        </div>
        <button onClick={markAllNotificationsRead} className="btn btn-secondary btn-md">Mark all as read</button>
      </div>

      <div className="card divide-y divide-ink-100">
        {notifications.length === 0 ? (
          <EmptyState icon={<Bell className="w-6 h-6" />} title="You’re all caught up" description="New notifications will appear here." />
        ) : (
          notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => onClick(n.id, n.link)}
              className={`w-full text-left p-4 flex items-start gap-3 hover:bg-ink-50 ${!n.read ? 'bg-brand-50/40' : ''}`}
            >
              <div className={`mt-2 w-2 h-2 rounded-full shrink-0 ${!n.read ? 'bg-brand-500' : 'bg-transparent'}`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-ink-900">{n.title}</div>
                <div className="text-sm text-ink-600 mt-0.5">{n.description}</div>
                <div className="text-xs text-ink-400 mt-1">{fmtRelativeTime(n.createdAt)}</div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}