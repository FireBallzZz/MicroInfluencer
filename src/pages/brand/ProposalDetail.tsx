import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Megaphone, Star, CheckCircle2, ClipboardCheck, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useStore, loadBrandCampaigns } from '../../state/Store';
import { listBrandCampaignProposals, listCampaignDeliverables, completeProposal, createReview, type CampaignDeliverableRow } from '../../api/endpoints';
import { Button, ChannelArt, ProposalStatusBadge, SectionHeader, PageHeader, StatRow } from '../../components/ui';
import { currency, fmtDate, fmtRelativeTime } from '../../data/seed';
import { Modal, ConfirmDialog } from '../../components/Modal';
import { Textarea } from '../../components/ui';
import { useToast } from '../../state/ToastContext';
import { isApiError } from '../../api/client';
import type { Proposal } from '../../types';

export default function BrandProposalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { push } = useToast();
  const { campaigns } = useStore();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [deliverablesByProposal, setDeliverablesByProposal] = useState<Record<number, CampaignDeliverableRow>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmComplete, setConfirmComplete] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [saving, setSaving] = useState(false);

  const proposal = proposals.find((p) => p.id === id);
  // The campaign this proposal belongs to. The proposal's own `campaignId`
  // is empty (FE type), so we use the deliverables row (which is keyed by
  // proposalId) to find the campaign in a follow-up lookup.
  const campaign = proposal && proposal.campaignId
    ? campaigns.find((c) => c.id === proposal.campaignId)
    : undefined;
  const deliverablesRow = proposal ? deliverablesByProposal[Number(proposal.id)] : undefined;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        // Ensure the brand's campaign list is loaded so the back-link works.
        await loadBrandCampaigns();
        // Search every brand campaign for this proposal — needed because
        // we don't know which campaign it belongs to.
        const { listBrandCampaigns } = await import('../../api/endpoints');
        const cs = await listBrandCampaigns();
        for (const c of cs) {
          if (cancelled) return;
          try {
            const { results } = await listBrandCampaignProposals(c.id);
            if (cancelled) return;
            setProposals((prev) => {
              const seen = new Set(prev.map((p) => p.id));
              return [...prev, ...results.filter((p) => !seen.has(p.id))];
            });
            const match = results.find((p) => p.id === id);
            if (match) {
              try {
                const rows = await listCampaignDeliverables(c.id);
                if (cancelled) return;
                const map: Record<number, CampaignDeliverableRow> = {};
                for (const row of rows) map[row.proposalId] = row;
                setDeliverablesByProposal(map);
              } catch {
                /* no deliverables yet is fine */
              }
            }
          } catch {
            /* skip */
          }
        }
      } catch (err) {
        if (!cancelled) setError(isApiError(err) ? err.message : 'Failed to load proposal.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const onComplete = async () => {
    if (!proposal) return;
    try {
      await completeProposal(Number(proposal.id));
      // Refresh the proposal list so the local "completed" state is accurate.
      const { results } = await listBrandCampaignProposals(proposal.campaignId);
      setProposals(results);
      push('Collaboration marked Completed', 'success');
      setConfirmComplete(false);
      setReviewOpen(true); // Open the review modal right after
    } catch (err) {
      push(isApiError(err) ? err.message : 'Could not complete collaboration.', 'error');
    }
  };

  const onSubmitReview = async () => {
    if (!proposal) return;
    setSaving(true);
    try {
      await createReview(Number(proposal.id), { rating, text: reviewText });
      push('Review submitted', 'success');
      setReviewOpen(false);
      setRating(5);
      setReviewText('');
    } catch (err) {
      push(isApiError(err) ? err.message : 'Could not submit review.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="container-page py-8"><div className="card p-8 text-center text-sm text-ink-500">Loading…</div></div>;
  }
  if (error) {
    return (
      <div className="container-page py-6 sm:py-8">
        <div className="card p-10 text-center text-sm text-rose-700">{error}</div>
      </div>
    );
  }
  if (!proposal) {
    return (
      <div className="container-page py-6 sm:py-8">
        <div className="card p-10 text-center">
          <Megaphone className="w-7 h-7 text-ink-300 mx-auto mb-2" />
          <div className="text-sm font-semibold text-ink-900">Proposal not found</div>
          <Link to="/brand/campaigns" className="text-sm link-accent inline-flex items-center gap-1 mt-3">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to campaigns
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-6 sm:py-8 space-y-5 max-w-3xl">
      <Link to={campaign ? `/brand/campaigns/${campaign.id}/proposals` : '/brand/campaigns'} className="text-sm text-ink-600 hover:text-ink-900 inline-flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to proposals
      </Link>

      <div className="card p-6">
        <div className="flex items-start gap-3 justify-between flex-wrap">
          <div className="flex items-start gap-3 min-w-0">
            <ChannelArt name={proposal.creatorName} seed={proposal.creatorId} height={56} className="w-14 rounded-md shrink-0" />
            <div className="min-w-0">
              <Link to={`/brand/creators/${proposal.creatorId}`} className="font-display text-xl text-ink-900 hover:text-ember-600 transition-colors block truncate">
                {proposal.creatorName}
              </Link>
              <div className="text-xs text-ink-500 mt-0.5">{campaign?.title ?? 'Campaign'}</div>
              <div className="text-xs text-ink-500 mt-0.5">
                Proposed {currency(proposal.proposedRate)} · {fmtRelativeTime(proposal.submittedAt)}
              </div>
            </div>
          </div>
          <ProposalStatusBadge status={proposal.status} />
        </div>
      </div>

      {proposal.coverMessage && (
        <div className="card p-5">
          <SectionHeader eyebrow="Message" title="Cover message" />
          <p className="text-sm text-ink-700 whitespace-pre-line mt-4 leading-relaxed">{proposal.coverMessage}</p>
        </div>
      )}

      {proposal.portfolio.length > 0 && (
        <div className="card p-5">
          <SectionHeader eyebrow="Portfolio" title="Attached links" />
          <ul className="mt-4 space-y-1.5">
            {proposal.portfolio.map((p) => (
              <li key={p.id}>
                <a href={p.url} target="_blank" rel="noreferrer noopener" className="text-sm text-brand-600 hover:underline inline-flex items-start gap-1 break-all">
                  <ExternalLink className="w-4 h-4 mt-0.5 shrink-0" />
                  <span className="break-all min-w-0">{p.title || p.url}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {proposal.relevantExperience && (
        <div className="card p-5">
          <SectionHeader eyebrow="Experience" title="Relevant experience" />
          <p className="text-sm text-ink-700 mt-4 leading-relaxed">{proposal.relevantExperience}</p>
        </div>
      )}

      {proposal.status === 'accepted' && (
        <>
          <div className="card p-5 sm:p-6">
            <SectionHeader
              eyebrow="FR-20"
              title="Deliverables"
              description="Links the creator submitted for this campaign."
            />
            {!deliverablesRow || deliverablesRow.deliverables.length === 0 ? (
              <div className="mt-5 border border-dashed border-ink-200 rounded-md p-6 text-center text-sm text-ink-500">
                No deliverables yet. The creator will add them after the proposal is accepted.
              </div>
            ) : (
              <ul className="mt-5 divide-y divide-ink-200/60">
                {deliverablesRow.deliverables.map((d) => (
                  <li key={d.id} className="py-3 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-md bg-ink-100 text-ink-700 flex items-center justify-center shrink-0">
                      <ExternalLink className="w-4 h-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <a href={d.postUrl} target="_blank" rel="noreferrer noopener" className="text-sm font-semibold text-ink-900 hover:text-ember-600 transition-colors break-all line-clamp-1">
                        {d.postUrl}
                      </a>
                      <div className="text-xs text-ink-500">
                        {d.platform} · submitted {fmtRelativeTime(d.createdAt)}
                        {d.note ? ` · ${d.note}` : ''}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-ink-900">Mark collaboration as Completed?</div>
              <div className="text-xs text-ink-500">
                Once marked Completed, you can leave a rating and a short review. This is final.
              </div>
            </div>
            <Button onClick={() => setConfirmComplete(true)} disabled={!!proposal.completedAt}>
              <CheckCircle2 className="w-4 h-4" />
              {proposal.completedAt ? 'Already completed' : 'Mark completed'}
            </Button>
          </div>
        </>
      )}

      {proposal.status === 'withdrawn' && proposal.withdrawReason && (
        <div className="card p-4 bg-paper-100 border-ink-200 text-sm text-ink-700">
          <strong>Creator reason:</strong> {proposal.withdrawReason}
        </div>
      )}

      <ConfirmDialog
        open={confirmComplete}
        onClose={() => setConfirmComplete(false)}
        onConfirm={onComplete}
        title="Mark this collaboration as Completed?"
        description="This is final. You'll be able to leave a rating and a short review next."
        confirmLabel="Mark completed"
      />

      <Modal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        title="Leave a review"
        size="md"
        footer={
          <>
            <button className="btn btn-secondary btn-md" onClick={() => setReviewOpen(false)} disabled={saving}>
              Skip
            </button>
            <button className="btn btn-primary btn-md" onClick={onSubmitReview} disabled={saving}>
              {saving ? 'Submitting…' : 'Submit review'}
            </button>
          </>
        }
      >
        <p className="text-sm text-ink-600 mb-3">
          Rate this creator and optionally leave a short review (up to 500 characters). One review per collaboration.
        </p>
        <div className="flex items-center gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className="p-1"
              aria-label={`Rate ${n} of 5`}
            >
              <Star
                className={n <= rating ? 'w-7 h-7 fill-ember-500 text-ember-500' : 'w-7 h-7 text-ink-300 hover:text-ink-500'}
              />
            </button>
          ))}
          <span className="text-sm text-ink-600 ml-2">{rating} of 5</span>
        </div>
        <Textarea
          rows={4}
          maxLength={500}
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="What did the creator do well?"
        />
        <div className="text-xs text-ink-400 mt-1 text-right">{reviewText.length}/500</div>
      </Modal>
    </div>
  );
}
