import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminOverview, type AdminOverview } from '../../api/endpoints';
import { useAsyncLoader } from '../../state/useEffectAsync';
import { PageHeader, SectionHeader, StatRow } from '../../components/ui';
import { Users, Megaphone, Inbox, ShieldAlert } from 'lucide-react';
import { isApiError } from '../../api/client';

export default function Overview() {
  const { data, loading, error } = useAsyncLoader<AdminOverview>(() => fetchAdminOverview(), []);

  if (loading) {
    return <div className="card p-8 text-center text-sm text-ink-500">Loading…</div>;
  }
  if (error || !data) {
    return <div className="card p-8 text-center text-sm text-rose-700">{error ?? 'Failed to load overview.'}</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="FR-22"
        title="Platform overview"
        description="High-level counts. For details, go to Users or the Audit log."
      />

      <StatRow
        items={[
          { label: 'Total users', value: data.users.total, hint: 'all roles' },
          { label: 'Suspended', value: data.users.suspended, hint: 'cannot log in' },
          { label: 'Proposals', value: data.totalProposals, hint: 'all time' },
          { label: 'Active campaigns', value: data.campaignsByStatus.published ?? 0, hint: 'live now' },
        ]}
      />

      <section className="card p-5 sm:p-6">
        <SectionHeader
          eyebrow="By role"
          title="User mix"
        />
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['creator', 'brand', 'admin'] as const).map((r) => (
            <div key={r} className="rounded-md border border-ink-200 p-4">
              <div className="eyebrow capitalize">{r}s</div>
              <div className="font-display text-2xl text-ink-900 mt-1">{data.users.byRole[r] ?? 0}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <SectionHeader
          eyebrow="Campaigns"
          title="By status"
        />
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['draft', 'published', 'closed'] as const).map((s) => (
            <div key={s} className="rounded-md border border-ink-200 p-4">
              <div className="eyebrow capitalize">{s}</div>
              <div className="font-display text-2xl text-ink-900 mt-1">{data.campaignsByStatus[s] ?? 0}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <SectionHeader eyebrow="Activity" title="Signups (last 14 days)" />
        <div className="overflow-x-auto no-scrollbar -mx-1 px-1">
          <div className="mt-5 flex items-end gap-1.5 h-32 min-w-[360px] sm:min-w-0">
            {data.signups.slice(-14).map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center justify-end gap-1 min-w-0" title={`${d.date}: ${d.count}`}>
                <div
                  className="w-full bg-ink-900 rounded-t"
                  style={{ height: `${Math.min(100, d.count * 12 + 4)}%` }}
                />
                <div className="text-[10px] font-mono text-ink-500 truncate">{d.date.slice(5)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
