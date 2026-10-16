import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import {
  EmptyState, ProposalStatusBadge, PageHeader, ChannelArt, StatRow,
} from '../../components/ui';
import { fmtRelativeTime, currency } from '../../data/seed';
import clsx from 'clsx';
import { Compass, ListChecks, ArrowUpRight, Filter } from 'lucide-react';
import { useStore, loadMyProposals, loadCreatorCampaigns } from '../../state/Store';
import type { MyProposal } from '../../types';

const TABS = ['All', 'Pending', 'Shortlisted', 'Accepted', 'Rejected', 'Withdrawn'] as const;

export default function MyApplications() {
  const { proposals, campaigns, loading, errors } = useStore();
  const [tab, setTab] = useState<(typeof TABS)[number]>('All');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await Promise.all([loadMyProposals(), loadCreatorCampaigns()]);
      } catch {
        if (cancelled) return;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const myProposals = proposals as MyProposal[];
  const counts = useMemo(() => ({
    All: myProposals.length,
    Pending: myProposals.filter((p) => p.status === 'pending').length,
    Shortlisted: myProposals.filter((p) => p.status === 'shortlisted').length,
    Accepted: myProposals.filter((p) => p.status === 'accepted').length,
    Rejected: myProposals.filter((p) => p.status === 'rejected').length,
    Withdrawn: myProposals.filter((p) => p.status === 'withdrawn').length,
  }), [myProposals]);

  const filtered = useMemo(
    () => (tab === 'All' ? myProposals : myProposals.filter((p) => p.status === tab.toLowerCase())),
    [tab, myProposals],
  );

  const acceptedTotal = counts.Accepted;
  const acceptanceRate = myProposals.length > 0
    ? Math.round((acceptedTotal / myProposals.length) * 100)
    : 0;
  const inFlight = counts.Pending + counts.Shortlisted;

  const description = (() => {
    if (inFlight > 0) {
      return `${inFlight} in flight · ${acceptedTotal} accepted · ${myProposals.length} all time`;
    }
    if (myProposals.length > 0) {
      return `${acceptedTotal} accepted out of ${myProposals.length} sent`;
    }
    return 'Track every application. Withdraw if you change your mind.';
  })();

  return (
    <div className="container-page py-6 sm:py-8">
      <div className="space-y-6">
        <PageHeader
          eyebrow="Applications"
          title="My proposals"
          description={description}
          action={
            <Link to="/creator/campaigns" className="btn btn-primary btn-md self-start sm:self-auto">
              <Compass className="w-4 h-4" /> Find work
            </Link>
          }
        />

        <StatRow
          items={[
            { label: 'Total sent', value: myProposals.length, hint: 'all time' },
            { label: 'In flight', value: inFlight, hint: 'pending + shortlisted' },
            { label: 'Acceptance', value: `${acceptanceRate}%`, hint: 'of sent' },
            { label: 'Accepted', value: acceptedTotal, hint: 'hired' },
          ]}
        />

        <div className="card overflow-hidden">
          <div className="flex border-b border-ink-200 overflow-x-auto no-scrollbar">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={clsx(
                  'relative inline-flex items-center gap-2 px-4 sm:px-5 py-3.5 text-sm font-semibold whitespace-nowrap transition-colors shrink-0',
                  tab === t ? 'text-ink-900' : 'text-ink-500 hover:text-ink-900',
                )}
                aria-pressed={tab === t}
              >
                {t}
                <span
                  className={clsx(
                    'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-sm text-[10px] font-mono',
                    tab === t ? 'bg-ink-900 text-paper-50' : 'bg-paper-100 text-ink-500',
                  )}
                >
                  {counts[t]}
                </span>
                {tab === t && (
                  <span
                    aria-hidden
                    className="absolute left-3 right-3 sm:left-4 sm:right-4 -bottom-px h-0.5 bg-ember-500"
                  />
                )}
              </button>
            ))}
          </div>

          {loading.myProposals ? (
            <div className="p-10 text-center text-sm text-ink-500">Loading proposals…</div>
          ) : errors.myProposals ? (
            <div className="p-10 text-center text-sm text-rose-700">{errors.myProposals}</div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={tab === 'All' ? <ListChecks className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
              title={tab === 'All' ? 'No proposals yet' : `No ${tab.toLowerCase()} proposals`}
              description={
                tab === 'All'
                  ? 'Browse briefs and submit your first proposal.'
                  : 'Try a different tab or apply to more briefs.'
              }
              action={
                tab === 'All' ? (
                  <Link to="/creator/campaigns" className="btn btn-primary btn-md">
                    <Compass className="w-4 h-4" /> Find work
                  </Link>
                ) : (
                  <button onClick={() => setTab('All')} className="btn btn-secondary btn-md">
                    Show all
                  </button>
                )
              }
            />
          ) : (
            <ul className="divide-y divide-ink-200/60 stagger">
              {filtered.map((p) => {
                const c = campaigns.find((x) => x.id === p.campaignId) ?? null;
                return (
                  <li key={p.id}>
                    <Link
                      to={`/creator/applications/${p.id}`}
                      className="block p-4 sm:p-5 hover:bg-paper-100/60 transition-colors group"
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <ChannelArt
                          name={c?.brandName ?? p.brandName ?? 'Brand'}
                          seed={c?.brandId ?? p.brandId ?? 'unknown'}
                          height={48}
                          className="w-12 rounded-md shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="font-semibold text-ink-900 truncate">
                              {c?.title ?? p.campaignTitle ?? 'Campaign'}
                            </div>
                            <ProposalStatusBadge status={p.status} />
                          </div>
                          <div className="text-xs text-ink-500 mt-0.5 truncate">
                            {(c?.brandName ?? p.brandName)} · {c?.category ?? '—'} · {c?.requiredPlatform ?? '—'} · submitted {fmtRelativeTime(p.submittedAt)}
                            <span className="sm:hidden font-mono font-semibold text-ink-900 ml-1">· {currency(p.proposedRate)}</span>
                          </div>
                        </div>
                        <div className="hidden sm:flex flex-col items-end shrink-0">
                          <div className="font-mono text-sm font-semibold text-ink-900">
                            {currency(p.proposedRate)}
                          </div>
                          <div className="text-[10px] text-ink-400 uppercase tracking-[0.14em] font-mono">
                            proposed
                          </div>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-ink-300 group-hover:text-ember-600 group-hover:translate-x-0.5 transition-all shrink-0 hidden sm:block" />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
