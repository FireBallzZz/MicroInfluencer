import { useEffect, useState } from 'react';
import { listAdminActions, type AdminAction } from '../../api/endpoints';
import { PageHeader, EmptyState } from '../../components/ui';
import { fmtRelativeTime } from '../../data/seed';
import { isApiError } from '../../api/client';

export default function Actions() {
  const [list, setList] = useState<AdminAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listAdminActions()
      .then((list) => { if (!cancelled) setList(list); })
      .catch((err) => { if (!cancelled) setError(isApiError(err) ? err.message : 'Failed to load audit log.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="FR-22"
        title="Audit log"
        description="Every action an admin has taken, newest first. Entries survive the deletion of the admin or the target."
      />

      {loading ? (
        <div className="card p-8 text-center text-sm text-ink-500">Loading…</div>
      ) : error ? (
        <div className="card p-8 text-center text-sm text-rose-700">{error}</div>
      ) : list.length === 0 ? (
        <div className="card">
          <EmptyState title="No admin actions yet" description="Suspensions, deletions, and campaign closures will appear here." />
        </div>
      ) : (
        <div className="card overflow-hidden">
          {/* Mobile card view */}
          <div className="sm:hidden divide-y divide-ink-200/60">
            {list.map((a) => (
              <div key={a.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="tag tag-paper font-mono text-[10px]">{a.action}</span>
                  <span className="text-xs text-ink-500">{fmtRelativeTime(a.createdAt)}</span>
                </div>
                <div className="text-xs text-ink-500">
                  By <strong className="text-ink-900">@{a.admin.username}</strong> on{' '}
                  <span className="text-ink-700">{a.targetType}#{a.targetId}</span>
                  {a.targetLabel && <div className="text-xs text-ink-500 truncate mt-0.5">{a.targetLabel}</div>}
                </div>
                <div className="text-sm text-ink-700 bg-paper-100 p-2.5 rounded-md break-words leading-relaxed">
                  {a.reason}
                </div>
              </div>
            ))}
          </div>

          {/* Tablet/desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="table-quiet min-w-[640px]">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Admin</th>
                  <th>Action</th>
                  <th>Target</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {list.map((a) => (
                  <tr key={a.id}>
                    <td className="text-xs text-ink-500 whitespace-nowrap">{fmtRelativeTime(a.createdAt)}</td>
                    <td>@{a.admin.username}</td>
                    <td><span className="tag tag-paper font-mono text-[10px]">{a.action}</span></td>
                    <td className="text-ink-700 text-sm">
                      <span className="text-ink-500">{a.targetType}#{a.targetId}</span>
                      {a.targetLabel && <div className="text-xs text-ink-500 truncate max-w-[200px]">{a.targetLabel}</div>}
                    </td>
                    <td className="text-sm text-ink-700 max-w-md">{a.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
