import { Link } from 'react-router-dom';
import { useStore } from '../../state/Store';
import { EmptyState, ProposalStatusBadge } from '../../components/ui';
import { fmtRelativeTime, currency } from '../../data/seed';
import { useState } from 'react';
import clsx from 'clsx';

const TABS = ['All', 'Pending', 'Shortlisted', 'Accepted', 'Rejected', 'Withdrawn'] as const;

export default function MyApplications() {
  const { proposals, campaigns, creator } = useStore();
  const [tab, setTab] = useState<(typeof TABS)[number]>('All');
  const myProposals = proposals.filter((p) => p.creatorId === creator.id);
  const filtered = tab === 'All' ? myProposals : myProposals.filter((p) => p.status === tab.toLowerCase());

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">My proposals</h1>
        <p className="text-sm text-ink-500">Track every application in one place.</p>
      </div>

      <div className="border-b border-ink-200">
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={clsx(
                'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap',
                tab === t ? 'border-brand-500 text-brand-700' : 'border-transparent text-ink-600 hover:text-ink-900'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            title={tab === 'All' ? 'No proposals yet' : `No ${tab.toLowerCase()} proposals`}
            description={tab === 'All' ? 'Browse campaigns and submit your first proposal.' : 'Try a different tab.'}
            action={tab === 'All' ? <Link to="/creator/campaigns" className="btn btn-primary btn-md">Find work</Link> : undefined}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => {
            const c = campaigns.find((x) => x.id === p.campaignId);
            const isAccepted = p.status === 'accepted';
            return (
              <Link
                key={p.id}
                to={`/creator/applications/${p.id}`}
                className={clsx(
                  'card p-5 flex items-center gap-4 hover:shadow-pop transition-shadow block',
                  isAccepted && 'bg-emerald-50/40 border-emerald-200'
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-ink-900 truncate">{c?.title}</div>
                  <div className="text-xs text-ink-500 mt-0.5">
                    {c?.brandName} · Submitted {fmtRelativeTime(p.submittedAt)}
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-semibold text-ink-900">{currency(p.proposedRate)}</div>
                  <div className="text-xs text-ink-500">proposed</div>
                </div>
                <ProposalStatusBadge status={p.status} />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}