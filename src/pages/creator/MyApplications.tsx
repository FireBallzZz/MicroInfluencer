import { Link } from 'react-router-dom';
import { useStore } from '../../state/Store';
import {
  EmptyState, ProposalStatusBadge, PageHeader, ChannelArt, SectionHeader,
} from '../../components/ui';
import { fmtRelativeTime, currency } from '../../data/seed';
import { useState, useMemo } from 'react';
import clsx from 'clsx';
import { Compass, ListChecks } from 'lucide-react';

const TABS = ['All', 'Pending', 'Shortlisted', 'Accepted', 'Rejected', 'Withdrawn'] as const;

export default function MyApplications() {
  const { proposals, campaigns, creator } = useStore();
  const [tab, setTab] = useState<(typeof TABS)[number]>('All');
  const myProposals = proposals.filter((p) => p.creatorId === creator.id);

  const counts = useMemo(() => ({
    All: myProposals.length,
    Pending: myProposals.filter((p) => p.status === 'pending').length,
    Shortlisted: myProposals.filter((p) => p.status === 'shortlisted').length,
    Accepted: myProposals.filter((p) => p.status === 'accepted').length,
    Rejected: myProposals.filter((p) => p.status === 'rejected').length,
    Withdrawn: myProposals.filter((p) => p.status === 'withdrawn').length,
  }), [myProposals]);

  const filtered = tab === 'All' ? myProposals : myProposals.filter((p) => p.status === tab.toLowerCase());

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Applications"
        title="My proposals"
        description="Track every application. Withdraw if you change your mind."
      />

      <div className="border-b border-ink-200 -mx-3 sm:mx-0">
        <div className="flex gap-0 overflow-x-auto no-scrollbar px-3 sm:px-0">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={clsx(
                'px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px whitespace-nowrap transition-colors',
                tab === t
                  ? 'border-ember-500 text-ink-900'
                  : 'border-transparent text-ink-500 hover:text-ink-900'
              )}
            >
              {t}
              <span className="ml-1.5 text-[10px] font-mono text-ink-400">
                {counts[t]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={tab === 'All' ? <ListChecks className="w-5 h-5" /> : undefined}
            title={tab === 'All' ? 'No proposals yet' : `No ${tab.toLowerCase()} proposals`}
            description={tab === 'All' ? 'Browse briefs and submit your first proposal.' : 'Try a different tab.'}
            action={tab === 'All' ? (
              <Link to="/creator/campaigns" className="btn btn-primary btn-md">
                <Compass className="w-4 h-4" /> Find work
              </Link>
            ) : null}
            hint="Demo only — proposals live in localStorage."
          />
        </div>
      ) : (
        <ul className="space-y-3 stagger">
          {filtered.map((p) => {
            const c = campaigns.find((x) => x.id === p.campaignId);
            return (
              <li key={p.id}>
                <Link
                  to={`/creator/applications/${p.id}`}
                  className="card card-hover p-4 sm:p-5 flex items-center gap-4 block"
                >
                  <ChannelArt name={c?.brandName ?? 'Brand'} seed={c?.brandId ?? 'unknown'} height={48} className="w-12 rounded-md shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-ink-900 truncate">{c?.title}</div>
                    <div className="text-xs text-ink-500 mt-0.5">
                      {c?.brandName} · {c?.category} · {c?.requiredPlatform} · submitted {fmtRelativeTime(p.submittedAt)}
                    </div>
                  </div>
                  <div className="text-right hidden sm:block shrink-0">
                    <div className="font-mono text-sm font-semibold text-ink-900">{currency(p.proposedRate)}</div>
                    <div className="text-[11px] text-ink-500 uppercase tracking-[0.12em]">Proposed</div>
                  </div>
                  <ProposalStatusBadge status={p.status} />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
