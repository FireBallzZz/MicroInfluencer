import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, ArrowRight, ArrowUpRight, Inbox, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useStore, loadBrandCampaigns, setBrandProposals, updateProposalStatus } from '../../state/Store';
import { listBrandCampaignProposals, fetchCreatorDetail } from '../../api/endpoints';
import { Button, EmptyState, ProposalStatusBadge, ChannelArt, PageHeader, StatRow } from '../../components/ui';
import { fmtNumber, fmtRelativeTime, currency } from '../../data/seed';
import type { Proposal, ProposalStatus } from '../../types';
import { ConfirmDialog } from '../../components/Modal';
import { useToast } from '../../state/ToastContext';
import clsx from 'clsx';
import { isApiError } from '../../api/client';
import { useAuth } from '../../state/AuthContext';

const STATUSES: ('all' | ProposalStatus)[] = ['all', 'pending', 'shortlisted', 'accepted', 'rejected'];

export default function ProposalManagement() {
  const { id } = useParams();
  const { push } = useToast();
  const { user } = useAuth();
  const { campaigns } = useStore();
  const campaign = campaigns.find((c) => c.id === id);

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | ProposalStatus>('all');
  const [showWithdrawn, setShowWithdrawn] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ p: Proposal; status: ProposalStatus } | null>(null);
  const [followers, setFollowers] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) return;
      setLoading(true);
      try {
        await loadBrandCampaigns();
        const res = await listBrandCampaignProposals(id);
        if (cancelled) return;
        setProposals(res.results);
        setAcceptedCount(res.acceptedCount);
        setBrandProposals(res.results);
        // Best-effort: fetch the engagement-rate-bearing detail for each creator.
        const map: Record<string, number> = {};
        await Promise.all(
          res.results.slice(0, 10).map(async (p) => {
            try {
              const detail = await fetchCreatorDetail(p.creatorId);
              map[p.creatorId] = detail.followers;
            } catch {
              /* ignore */
            }
          }),
        );
        if (!cancelled) setFollowers(map);
      } catch (err) {
        if (!cancelled) {
          push(isApiError(err) ? err.message : 'Failed to load proposals.', 'error');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const counts = useMemo(() => ({
    all: proposals.length,
    pending: proposals.filter((p) => p.status === 'pending').length,
    shortlisted: proposals.filter((p) => p.status === 'shortlisted').length,
    accepted: proposals.filter((p) => p.status === 'accepted').length,
    rejected: proposals.filter((p) => p.status === 'rejected').length,
  }), [proposals]);

  const mine = useMemo(() => {
    let list = [...proposals];
    if (!showWithdrawn) list = list.filter((p) => p.status !== 'withdrawn');
    if (filter !== 'all') list = list.filter((p) => p.status === filter);
    return list.sort((a, b) => +new Date(b.submittedAt) - +new Date(a.submittedAt));
  }, [proposals, filter, showWithdrawn]);

  const applyChange = async (p: Proposal, status: ProposalStatus) => {
    try {
      const res = await updateProposalStatus(p.id, status) as unknown as { accepted_count?: number; creators_needed?: number } | void;
      // Refetch the list to keep the UI in sync.
      if (id) {
        const fresh = await listBrandCampaignProposals(id);
        setProposals(fresh.results);
        setAcceptedCount(fresh.acceptedCount);
        setBrandProposals(fresh.results);
        // The action may also have updated campaign status (slot reached).
        await loadBrandCampaigns();
      }
      push(`Proposal ${status}`, 'success');
    } catch (err) {
      push(isApiError(err) ? err.message : 'Failed to update proposal.', 'error');
    }
  };

  if (loading) {
    return <div className="container-page py-8"><div className="card p-8 text-center text-sm text-ink-500">Loading proposals…</div></div>;
  }
  if (!campaign) {
    return (
      <div className="container-page py-6 sm:py-8">
        <div className="card p-10 text-center">
          <div className="text-sm font-semibold text-ink-900">Campaign not found</div>
          <Link to="/brand/campaigns" className="text-sm link-accent inline-flex items-center gap-1 mt-3">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to campaigns
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-6 sm:py-8 space-y-6">
      <Link to={`/brand/campaigns/${campaign.id}`} className="text-sm text-ink-600 hover:text-ink-900 inline-flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to campaign
      </Link>

      <PageHeader
        eyebrow="Proposals"
        title={campaign.title}
        description={`${acceptedCount} of ${campaign.creatorsNeeded} creators accepted · ${counts.pending} pending · ${counts.shortlisted} shortlisted`}
        action={
          <label className="text-sm text-ink-500 flex items-center gap-2">
            <input
              type="checkbox"
              checked={showWithdrawn}
              onChange={(e) => setShowWithdrawn(e.target.checked)}
              className="w-4 h-4 accent-ink-900"
            />
            Show withdrawn
          </label>
        }
      />

      <StatRow
        items={[
          { label: 'Pending', value: counts.pending, hint: 'awaiting review' },
          { label: 'Shortlisted', value: counts.shortlisted },
          { label: 'Accepted', value: counts.accepted, hint: `of ${campaign.creatorsNeeded}` },
          { label: 'Total', value: counts.all },
        ]}
      />

      <div className="border-b border-ink-200 -mx-3 sm:mx-0">
        <div className="flex gap-0 overflow-x-auto no-scrollbar px-3 sm:px-0">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={clsx(
                'px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px whitespace-nowrap transition-colors capitalize',
                filter === s
                  ? 'border-ember-500 text-ink-900'
                  : 'border-transparent text-ink-500 hover:text-ink-900'
              )}
            >
              {s}
              <span className="ml-1.5 text-[10px] font-mono text-ink-400">{counts[s as keyof typeof counts]}</span>
            </button>
          ))}
        </div>
      </div>

      {mine.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Inbox className="w-5 h-5" />}
            title="No proposals here"
            description="Once creators apply, they’ll appear here."
          />
        </div>
      ) : (
        <ul className="space-y-3 stagger">
          {mine.map((p) => (
            <li key={p.id}>
              <article className="card p-4 sm:p-5">
                <div className="flex items-start gap-3 sm:gap-4 flex-wrap">
                  <ChannelArt name={p.creatorName} seed={p.creatorId} height={48} className="w-12 rounded-md shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link to={`/brand/creators/${p.creatorId}`} className="font-semibold text-ink-900 hover:text-ember-600 transition-colors">
                        {p.creatorName}
                      </Link>
                      <ProposalStatusBadge status={p.status} />
                    </div>
                    <div className="text-xs text-ink-500 mt-1 break-words">
                      {p.creatorNiche} · {p.creatorPlatform} · {fmtNumber(followers[p.creatorId] ?? p.creatorFollowers)} followers · {p.creatorEngagement}% engagement
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-lg font-semibold text-ink-900 num-display">{currency(p.proposedRate)}</div>
                    <div className="text-xs text-ink-500">proposed · {fmtRelativeTime(p.submittedAt)}</div>
                  </div>
                </div>

                {p.coverMessage && (
                  <blockquote className="mt-4 text-sm text-ink-700 leading-relaxed bg-paper-100 border-l-2 border-ember-500 rounded-r-md p-3 whitespace-pre-line break-words">
                    {p.coverMessage}
                  </blockquote>
                )}

                {(p.relevantExperience || p.portfolio.length > 0) && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    {p.relevantExperience && (
                      <div>
                        <div className="eyebrow">Relevant experience</div>
                        <div className="mt-1.5 text-ink-700">{p.relevantExperience}</div>
                      </div>
                    )}
                    {p.portfolio.length > 0 && (
                      <div>
                        <div className="eyebrow">Portfolio</div>
                        <ul className="mt-1.5 space-y-1.5">
                          {p.portfolio.map((link) => (
                            <li key={link.id}>
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="text-ember-600 hover:text-ember-700 font-semibold inline-flex items-center gap-1 break-all min-w-0"
                              >
                                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                                <span className="break-all min-w-0">{link.title || link.url}</span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {p.status === 'withdrawn' && p.withdrawReason && (
                  <div className="mt-3 text-xs text-ink-500 bg-paper-100 border border-ink-200 rounded-md p-2.5">
                    <strong className="text-ink-700">Creator reason:</strong> {p.withdrawReason}
                  </div>
                )}

                <ProposalActions p={p} onAction={(status) => setConfirmAction({ p, status })} campaignId={campaign.id} />
              </article>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={async () => {
          if (confirmAction) await applyChange(confirmAction.p, confirmAction.status);
          setConfirmAction(null);
        }}
        title={
          confirmAction?.status === 'accepted' ? 'Accept this proposal?' :
          confirmAction?.status === 'rejected' ? 'Reject this proposal?' :
          'Shortlist this proposal?'
        }
        description={
          confirmAction?.status === 'accepted'
            ? 'Once accepted, this decision is final. The creator will be notified.'
            : confirmAction?.status === 'rejected'
            ? 'Once rejected, this decision is final. The creator will be notified.'
            : 'The creator will be notified that they’ve been shortlisted.'
        }
        confirmLabel={
          confirmAction?.status === 'accepted' ? 'Accept' :
          confirmAction?.status === 'rejected' ? 'Reject' :
          'Shortlist'
        }
        destructive={confirmAction?.status === 'rejected'}
      />
    </div>
  );
}

function ProposalActions({ p, onAction, campaignId }: { p: Proposal; onAction: (s: ProposalStatus) => void; campaignId: string }) {
  if (p.status === 'pending') {
    return (
      <div className="mt-4 flex flex-wrap gap-2 justify-start sm:justify-end">
        <Link to={`/brand/proposals/${p.id}`} className="btn btn-secondary btn-sm">
          Open <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
        <Button variant="secondary" size="sm" onClick={() => onAction('shortlisted')}>Shortlist</Button>
        <Button variant="danger" size="sm" onClick={() => onAction('rejected')}>Reject</Button>
        <Button size="sm" onClick={() => onAction('accepted')}>Accept <ArrowRight className="w-3.5 h-3.5" /></Button>
      </div>
    );
  }
  if (p.status === 'shortlisted') {
    return (
      <div className="mt-4 flex flex-wrap gap-2 justify-start sm:justify-end">
        <Link to={`/brand/proposals/${p.id}`} className="btn btn-secondary btn-sm">
          Open <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
        <Button variant="danger" size="sm" onClick={() => onAction('rejected')}>Reject</Button>
        <Button size="sm" onClick={() => onAction('accepted')}>Accept <ArrowRight className="w-3.5 h-3.5" /></Button>
      </div>
    );
  }
  if (p.status === 'accepted' || p.status === 'rejected') {
    return (
      <div className="mt-4 flex flex-wrap gap-2 justify-start sm:justify-end">
        <Link to={`/brand/proposals/${p.id}`} className="btn btn-secondary btn-sm">
          {p.status === 'accepted' ? 'Manage & review' : 'Open'} <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }
  return (
    <div className="mt-4 flex justify-start sm:justify-end">
      <Link to={`/brand/proposals/${p.id}`} className="btn btn-secondary btn-sm">
        Open <ArrowUpRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
