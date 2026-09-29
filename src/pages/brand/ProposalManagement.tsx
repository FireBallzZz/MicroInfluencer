import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useState, useMemo } from 'react';
import { updateProposalStatus, useStore } from '../../state/Store';
import { Button, EmptyState, ProposalStatusBadge } from '../../components/ui';
import { fmtNumber, fmtRelativeTime, currency } from '../../data/seed';
import type { Proposal, ProposalStatus } from '../../types';
import { ConfirmDialog } from '../../components/Modal';
import { useToast } from '../../state/ToastContext';
import clsx from 'clsx';

const STATUSES: ('all' | ProposalStatus)[] = ['all', 'pending', 'shortlisted', 'accepted', 'rejected'];

export default function ProposalManagement() {
  const { id } = useParams();
  const { push } = useToast();
  const { campaigns, proposals } = useStore();
  const campaign = campaigns.find((c) => c.id === id);

  const [filter, setFilter] = useState<'all' | ProposalStatus>('all');
  const [showWithdrawn, setShowWithdrawn] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ p: Proposal; status: ProposalStatus } | null>(null);

  if (!campaign) return <div className="card p-6">Campaign not found.</div>;

  const mine = useMemo(() => {
    let list = proposals.filter((p) => p.campaignId === campaign.id);
    if (!showWithdrawn) list = list.filter((p) => p.status !== 'withdrawn');
    if (filter !== 'all') list = list.filter((p) => p.status === filter);
    return list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }, [proposals, campaign.id, filter, showWithdrawn]);

  const acceptedCount = proposals.filter((p) => p.campaignId === campaign.id && p.status === 'accepted').length;

  const applyChange = (p: Proposal, status: ProposalStatus) => {
    updateProposalStatus(p.id, status);
    push(`Proposal ${status}`, 'success');
  };

  return (
    <div className="space-y-5">
      <Link to={`/brand/campaigns/${campaign.id}`} className="text-sm text-ink-600 hover:text-ink-900 inline-flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to campaign
      </Link>

      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">{campaign.title}</h1>
          <p className="text-sm text-ink-500">{acceptedCount} of {campaign.creatorsNeeded} creators accepted</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <label className="flex items-center gap-2 text-ink-600">
            <input type="checkbox" checked={showWithdrawn} onChange={(e) => setShowWithdrawn(e.target.checked)} />
            Show withdrawn
          </label>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-ink-200">
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={clsx(
                'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap capitalize',
                filter === s ? 'border-brand-500 text-brand-700' : 'border-transparent text-ink-600 hover:text-ink-900'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {mine.length === 0 ? (
        <div className="card">
          <EmptyState
            title="No proposals here"
            description="Once creators apply to your campaign, they’ll appear here."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {mine.map((p) => (
            <div key={p.id} className="card p-5">
              <div className="flex items-start gap-4 flex-wrap">
                <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center font-semibold shrink-0">
                  {p.creatorName.split(' ').map((s) => s[0]).slice(0, 2).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link to={`/brand/creators/${p.creatorId}`} className="font-semibold text-ink-900 hover:text-brand-700">{p.creatorName}</Link>
                    <ProposalStatusBadge status={p.status} />
                  </div>
                  <div className="text-xs text-ink-500 mt-1">
                    {p.creatorNiche} · {p.creatorPlatform} · {fmtNumber(p.creatorFollowers)} followers · {p.creatorEngagement}% engagement
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-ink-900">{currency(p.proposedRate)}</div>
                  <div className="text-xs text-ink-500">proposed · {fmtRelativeTime(p.submittedAt)}</div>
                </div>
              </div>

              <div className="mt-3 text-sm text-ink-700 leading-relaxed bg-ink-50 rounded-lg p-3">
                {p.coverMessage}
              </div>

              {(p.relevantExperience || p.portfolio.length > 0) && (
                <div className="mt-3 grid sm:grid-cols-2 gap-3 text-sm">
                  {p.relevantExperience && (
                    <div>
                      <div className="text-xs text-ink-500 mb-1">Relevant experience</div>
                      <div className="text-ink-700">{p.relevantExperience}</div>
                    </div>
                  )}
                  {p.portfolio.length > 0 && (
                    <div>
                      <div className="text-xs text-ink-500 mb-1">Portfolio</div>
                      <ul className="space-y-1">
                        {p.portfolio.map((link) => (
                          <li key={link.id}>
                            <a href={link.url} target="_blank" rel="noreferrer noopener" className="text-brand-600 hover:underline inline-flex items-center gap-1">
                              <ExternalLink className="w-3.5 h-3.5" /> {link.title || link.url}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {p.status === 'withdrawn' && p.withdrawReason && (
                <div className="mt-3 text-xs text-ink-600 bg-ink-50 border border-ink-200 rounded-md p-2">
                  <strong className="text-ink-700">Creator reason:</strong> {p.withdrawReason}
                </div>
              )}

              <ProposalActions
                p={p}
                onAction={(status) => setConfirmAction({ p, status })}
              />
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => confirmAction && applyChange(confirmAction.p, confirmAction.status)}
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

function ProposalActions({ p, onAction }: { p: Proposal; onAction: (s: ProposalStatus) => void }) {
  if (p.status === 'pending') {
    return (
      <div className="mt-4 flex flex-wrap gap-2 justify-end">
        <Button variant="secondary" onClick={() => onAction('shortlisted')}>Shortlist</Button>
        <Button variant="danger" onClick={() => onAction('rejected')}>Reject</Button>
        <Button onClick={() => onAction('accepted')}>Accept</Button>
      </div>
    );
  }
  if (p.status === 'shortlisted') {
    return (
      <div className="mt-4 flex flex-wrap gap-2 justify-end">
        <Button variant="danger" onClick={() => onAction('rejected')}>Reject</Button>
        <Button onClick={() => onAction('accepted')}>Accept</Button>
      </div>
    );
  }
  if (p.status === 'accepted' || p.status === 'rejected') {
    return (
      <div className="mt-4 flex justify-end">
        <span className="text-xs text-ink-500">Final ' no further action available.</span>
      </div>
    );
  }
  return null;
}
