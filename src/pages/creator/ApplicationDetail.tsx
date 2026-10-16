import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Plus, Trash2, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useStore, loadMyProposals, updateProposalStatus } from '../../state/Store';
import {
  listMyDeliverables, addDeliverable, deleteDeliverable,
  type Deliverable,
} from '../../api/endpoints';
import { Button, ProposalStatusBadge, SectionHeader, PageHeader, EmptyState } from '../../components/ui';
import { ConfirmDialog, Modal } from '../../components/Modal';
import { currency, fmtRelativeTime, fmtDate } from '../../data/seed';
import { Textarea, Input, Select, FormField, Label } from '../../components/ui';
import { useToast } from '../../state/ToastContext';
import { isApiError } from '../../api/client';
import type { MyProposal, Platform } from '../../types';
import { PLATFORM_OPTIONS } from '../../api/endpoints';

const TIMELINE = ['pending', 'shortlisted', 'accepted'] as const;

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { push } = useToast();
  const { proposals, campaigns } = useStore();
  const proposal = proposals.find((p) => p.id === id) as MyProposal | undefined;
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const [reasonModal, setReasonModal] = useState(false);
  const [reason, setReason] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  // FR-20: deliverables
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loadingDeliverables, setLoadingDeliverables] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newPlatform, setNewPlatform] = useState<Platform>('YouTube');
  const [newNote, setNewNote] = useState('');
  const [addingDeliverable, setAddingDeliverable] = useState(false);
  const [confirmDeleteDeliverable, setConfirmDeleteDeliverable] = useState<Deliverable | null>(null);

  useEffect(() => {
    if (!proposal || proposal.status !== 'accepted') return;
    let cancelled = false;
    setLoadingDeliverables(true);
    listMyDeliverables(Number(proposal.id))
      .then((d) => { if (!cancelled) setDeliverables(d); })
      .catch(() => { if (!cancelled) setDeliverables([]); })
      .finally(() => { if (!cancelled) setLoadingDeliverables(false); });
    return () => { cancelled = true; };
  }, [proposal?.id, proposal?.status]);

  if (!proposal) {
    return (
      <div className="container-page py-6 sm:py-8">
        <div className="card p-6">Proposal not found.</div>
      </div>
    );
  }
  const campaign = campaigns.find((c) => c.id === proposal.campaignId);
  const canWithdraw = ['pending', 'shortlisted', 'accepted'].includes(proposal.status);
  const isCompleted = !!proposal.completedAt;
  const canEditDeliverables = proposal.status === 'accepted' && !isCompleted;

  const onWithdraw = async (withReason: string | undefined) => {
    setWithdrawing(true);
    try {
      await updateProposalStatus(proposal.id, 'withdrawn', withReason);
      await loadMyProposals();
      setReasonModal(false);
      setReason('');
      setConfirmWithdraw(false);
      push('Proposal withdrawn', 'info');
    } catch {
      push('Could not withdraw proposal.', 'error');
    } finally {
      setWithdrawing(false);
    }
  };

  const onAddDeliverable = async () => {
    if (!newUrl) return;
    setAddingDeliverable(true);
    try {
      const d = await addDeliverable(Number(proposal.id), {
        postUrl: newUrl,
        platform: newPlatform,
        note: newNote,
      });
      setDeliverables((prev) => [...prev, d]);
      setAddOpen(false);
      setNewUrl('');
      setNewNote('');
      push('Deliverable added', 'success');
    } catch (err) {
      push(isApiError(err) ? err.message : 'Could not add deliverable.', 'error');
    } finally {
      setAddingDeliverable(false);
    }
  };

  const onDeleteDeliverable = async (d: Deliverable) => {
    try {
      await deleteDeliverable(Number(proposal.id), d.id);
      setDeliverables((prev) => prev.filter((x) => x.id !== d.id));
      push('Deliverable removed', 'info');
    } catch (err) {
      push(isApiError(err) ? err.message : 'Could not remove deliverable.', 'error');
    } finally {
      setConfirmDeleteDeliverable(null);
    }
  };

  return (
    <div className="container-page py-6 sm:py-8 space-y-5 max-w-3xl">
      <Link to="/creator/applications" className="text-sm text-ink-600 hover:text-ink-900 inline-flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to my proposals
      </Link>

      <div className="card p-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs text-ink-500">{campaign?.brandName ?? proposal.brandName}</div>
            <h1 className="text-xl font-bold text-ink-900">{campaign?.title ?? proposal.campaignTitle}</h1>
            <div className="text-xs text-ink-500 mt-1">
              Submitted {fmtRelativeTime(proposal.submittedAt)} · Proposed {currency(proposal.proposedRate)}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {isCompleted && <span className="tag tag-green">Completed</span>}
            <ProposalStatusBadge status={proposal.status} />
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-5 flex items-center gap-2 text-xs overflow-x-auto no-scrollbar py-1">
          {TIMELINE.map((step, i) => {
            const order = ['pending', 'shortlisted', 'accepted'];
            const statusIdx = order.indexOf(proposal.status as any);
            const stepIdx = order.indexOf(step);
            const active = statusIdx >= stepIdx && proposal.status !== 'rejected' && proposal.status !== 'withdrawn';
            return (
              <div key={step} className="flex items-center gap-2 shrink-0">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0 ${active ? 'bg-ink-900 text-paper-50' : 'bg-ink-100 text-ink-500'}`}>
                  {i + 1}
                </div>
                <span className={active ? 'text-ink-900 font-medium' : 'text-ink-500'}>{step[0].toUpperCase() + step.slice(1)}</span>
                {i < TIMELINE.length - 1 && <div className="w-4 sm:w-6 h-px bg-ink-200 shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>

      {proposal.coverMessage && (
        <div className="card p-5">
          <SectionHeader eyebrow="Message" title="Your cover message" />
          <p className="text-sm text-ink-700 whitespace-pre-line mt-4 leading-relaxed">{proposal.coverMessage}</p>
        </div>
      )}

      {proposal.relevantExperience && (
        <div className="card p-5">
          <SectionHeader eyebrow="Experience" title="Relevant experience" />
          <p className="text-sm text-ink-700 mt-4 leading-relaxed">{proposal.relevantExperience}</p>
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

      {/* FR-20: Deliverables */}
      {proposal.status === 'accepted' && (
        <div className="card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <SectionHeader
              eyebrow="FR-20"
              title="Deliverables"
              description="Add the links to the content you published for this campaign."
            />
            {canEditDeliverables && (
              <Button onClick={() => setAddOpen(true)} size="sm">
                <Plus className="w-3.5 h-3.5" /> Add link
              </Button>
            )}
          </div>
          {loadingDeliverables ? (
            <div className="mt-5 text-sm text-ink-500">Loading…</div>
          ) : deliverables.length === 0 ? (
            <div className="mt-5 border border-dashed border-ink-200 rounded-md p-6 text-center text-sm text-ink-500">
              No deliverables yet. {canEditDeliverables && <span>Click <strong>Add link</strong> to submit your first piece of content.</span>}
            </div>
          ) : (
            <ul className="mt-5 divide-y divide-ink-200/60">
              {deliverables.map((d) => (
                <li key={d.id} className="py-3 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-md bg-ink-100 text-ink-700 flex items-center justify-center shrink-0">
                    <ExternalLink className="w-4 h-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <a href={d.postUrl} target="_blank" rel="noreferrer noopener" className="text-sm font-semibold text-ink-900 hover:text-ember-600 transition-colors break-all line-clamp-1">
                      {d.postUrl}
                    </a>
                    <div className="text-xs text-ink-500">
                      {d.platform} · submitted {fmtDate(d.createdAt)}
                      {d.note ? ` · ${d.note}` : ''}
                    </div>
                  </div>
                  {canEditDeliverables && (
                    <button
                      className="p-1.5 text-ink-500 hover:text-rose-600"
                      onClick={() => setConfirmDeleteDeliverable(d)}
                      aria-label="Remove deliverable"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {proposal.status === 'withdrawn' && proposal.withdrawReason && (
        <div className="card p-4 bg-paper-100 border-ink-200 text-sm text-ink-700">
          <strong>You withdrew:</strong> {proposal.withdrawReason}
        </div>
      )}

      {proposal.status === 'rejected' && (
        <div className="card p-4 bg-rose-50 border-rose-200 text-sm text-rose-800">
          This proposal was rejected. You cannot resubmit it.
        </div>
      )}

      {isCompleted && (
        <div className="card p-4 bg-emerald-50 border-emerald-200 text-sm text-emerald-800">
          The brand has marked this collaboration as Completed. Deliverables are now read-only.
        </div>
      )}

      {canWithdraw && !isCompleted && (
        <div className="card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-ink-900">Withdraw proposal?</div>
            <div className="text-xs text-ink-500">
              {proposal.status === 'accepted'
                ? 'Withdrawing an accepted proposal needs a short reason.'
                : 'You can reapply while the campaign is still published.'}
            </div>
          </div>
          <Button
            variant="danger"
            className="self-start sm:self-auto"
            onClick={() => {
              if (proposal.status === 'accepted') setReasonModal(true);
              else setConfirmWithdraw(true);
            }}
            disabled={withdrawing}
          >
            Withdraw
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={confirmWithdraw}
        onClose={() => setConfirmWithdraw(false)}
        onConfirm={() => onWithdraw(undefined)}
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
              disabled={reason.length === 0 || withdrawing}
              onClick={() => onWithdraw(reason)}
            >
              {withdrawing ? 'Withdrawing…' : 'Withdraw'}
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

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add a deliverable"
        size="md"
        footer={
          <>
            <button className="btn btn-secondary btn-md" onClick={() => setAddOpen(false)}>Cancel</button>
            <button
              className="btn btn-primary btn-md"
              onClick={onAddDeliverable}
              disabled={!newUrl || addingDeliverable}
            >
              {addingDeliverable ? 'Adding…' : 'Add'}
            </button>
          </>
        }
      >
        <FormField label="Post URL" htmlFor="dl-url" required>
          <Input id="dl-url" placeholder="https://…" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
        </FormField>
        <FormField label="Platform" htmlFor="dl-platform">
          <Select id="dl-platform" value={newPlatform} onChange={(e) => setNewPlatform(e.target.value as Platform)}>
            {PLATFORM_OPTIONS.map((p) => <option key={p}>{p}</option>)}
          </Select>
        </FormField>
        <FormField label="Note" htmlFor="dl-note" helper="Optional · up to 500 characters">
          <Textarea id="dl-note" rows={3} maxLength={500} value={newNote} onChange={(e) => setNewNote(e.target.value)} />
        </FormField>
      </Modal>

      <ConfirmDialog
        open={!!confirmDeleteDeliverable}
        onClose={() => setConfirmDeleteDeliverable(null)}
        onConfirm={() => confirmDeleteDeliverable && onDeleteDeliverable(confirmDeleteDeliverable)}
        title="Remove this deliverable?"
        description="You can add it back later until the brand marks the collaboration as Completed."
        confirmLabel="Remove"
        destructive
      />
    </div>
  );
}
