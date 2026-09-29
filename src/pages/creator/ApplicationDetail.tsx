import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useStore, updateProposalStatus } from '../../state/Store';
import { Button, ProposalStatusBadge } from '../../components/ui';
import { ConfirmDialog, Modal } from '../../components/Modal';
import { currency, fmtRelativeTime } from '../../data/seed';
import { Textarea } from '../../components/ui';
import { useToast } from '../../state/ToastContext';

const TIMELINE = ['pending', 'shortlisted', 'accepted'] as const;

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { push } = useToast();
  const { proposals, campaigns } = useStore();
  const proposal = proposals.find((p) => p.id === id);
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const [reasonModal, setReasonModal] = useState(false);
  const [reason, setReason] = useState('');

  if (!proposal) return <div className="card p-6">Proposal not found.</div>;
  const campaign = campaigns.find((c) => c.id === proposal.campaignId);

  const canWithdraw = ['pending', 'shortlisted', 'accepted'].includes(proposal.status);

  const onWithdraw = () => {
    updateProposalStatus(proposal.id, 'withdrawn', reason || undefined);
    setReasonModal(false);
    setReason('');
    setConfirmWithdraw(false);
    push('Proposal withdrawn', 'info');
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <Link to="/creator/applications" className="text-sm text-ink-600 hover:text-ink-900 inline-flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to my proposals
      </Link>

      <div className="card p-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs text-ink-500">{campaign?.brandName}</div>
            <h1 className="text-xl font-bold text-ink-900">{campaign?.title}</h1>
            <div className="text-xs text-ink-500 mt-1">
              Submitted {fmtRelativeTime(proposal.submittedAt)} · Proposed {currency(proposal.proposedRate)}
            </div>
          </div>
          <ProposalStatusBadge status={proposal.status} />
        </div>

        {/* Timeline */}
        <div className="mt-5 flex items-center gap-2 text-xs">
          {TIMELINE.map((step, i) => {
            const order = ['pending', 'shortlisted', 'accepted'];
            const statusIdx = order.indexOf(proposal.status as any);
            const stepIdx = order.indexOf(step);
            const active = statusIdx >= stepIdx && proposal.status !== 'rejected' && proposal.status !== 'withdrawn';
            return (
              <div key={step} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${active ? 'bg-brand-500 text-white' : 'bg-ink-100 text-ink-500'}`}>
                  {i + 1}
                </div>
                <span className={active ? 'text-ink-900 font-medium' : 'text-ink-500'}>{step[0].toUpperCase() + step.slice(1)}</span>
                {i < TIMELINE.length - 1 && <div className="w-6 h-px bg-ink-200" />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-semibold text-ink-900 mb-2">Your cover message</h3>
        <p className="text-sm text-ink-700 whitespace-pre-line">{proposal.coverMessage}</p>
      </div>

      {proposal.relevantExperience && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-ink-900 mb-2">Relevant experience</h3>
          <p className="text-sm text-ink-700">{proposal.relevantExperience}</p>
        </div>
      )}

      {proposal.portfolio.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-ink-900 mb-2">Portfolio</h3>
          <ul className="space-y-1.5">
            {proposal.portfolio.map((p) => (
              <li key={p.id}>
                <a href={p.url} target="_blank" rel="noreferrer noopener" className="text-sm text-brand-600 hover:underline inline-flex items-center gap-1">
                  <ExternalLink className="w-4 h-4" /> {p.title || p.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {canWithdraw && (
        <div className="card p-5 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-ink-900">Withdraw proposal?</div>
            <div className="text-xs text-ink-500">
              {proposal.status === 'accepted'
                ? 'Withdrawing an accepted proposal will open the slot for other creators.'
                : 'You can reapply while the campaign is still published.'}
            </div>
          </div>
          <Button variant="danger" onClick={() => {
            if (proposal.status === 'accepted') setReasonModal(true);
            else setConfirmWithdraw(true);
          }}>Withdraw</Button>
        </div>
      )}

      {proposal.status === 'rejected' && (
        <div className="card p-4 bg-rose-50 border-rose-200 text-sm text-rose-800">
          This proposal was rejected. You cannot resubmit it.
        </div>
      )}

      <ConfirmDialog
        open={confirmWithdraw}
        onClose={() => setConfirmWithdraw(false)}
        onConfirm={onWithdraw}
        title="Withdraw this proposal?"
        description="The brand will see that you’ve withdrawn. You can reapply while the campaign is published."
        confirmLabel="Withdraw"
        destructive
      />

      <Modal
        open={reasonModal}
        onClose={() => setReasonModal(false)}
        title="Why are you withdrawing?"
        size="md"
        footer={
          <>
            <button className="btn btn-secondary btn-md" onClick={() => setReasonModal(false)}>Cancel</button>
            <button
              className="btn btn-danger btn-md"
              disabled={reason.length === 0}
              onClick={onWithdraw}
            >
              Withdraw
            </button>
          </>
        }
      >
        <p className="text-sm text-ink-600 mb-3">
          Briefly tell the brand why you can’t continue. Up to 300 characters.
        </p>
        <Textarea
          rows={4}
          maxLength={300}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Schedule conflict, brand mismatch, etc."
        />
        <div className="text-xs text-ink-400 mt-1 text-right">{reason.length}/300</div>
      </Modal>
    </div>
  );
}