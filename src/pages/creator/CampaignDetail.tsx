import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStore, addProposal, loadMyProposals } from '../../state/Store';
import { useAsyncLoader } from '../../state/useEffectAsync';
import { fetchCreatorCampaign } from '../../api/endpoints';
import {
  Button, CampaignStatusBadge, EligibilityChip, ChannelArt, PlatformIcon,
  SectionHeader, StatRow, PageHeader,
} from '../../components/ui';
import { currency, fmtDate } from '../../data/seed';
import { ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, Megaphone, X } from 'lucide-react';
import { useState } from 'react';
import { Modal } from '../../components/Modal';
import { FormField, Textarea, Input } from '../../components/ui';
import { useToast } from '../../state/ToastContext';
import { isApiError } from '../../api/client';

type Detail = Awaited<ReturnType<typeof fetchCreatorCampaign>>;

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { push } = useToast();
  const { creator, proposals } = useStore();
  const { data, loading, error, refresh } = useAsyncLoader<Detail>(
    () => fetchCreatorCampaign(id!),
    [id],
  );
  const [applyOpen, setApplyOpen] = useState(false);
  const [applying, setApplying] = useState(false);

  if (loading) {
    return <div className="container-page py-8"><div className="card p-8 text-center text-sm text-ink-500">Loading…</div></div>;
  }
  if (error || !data) {
    return (
      <div className="container-page py-6 sm:py-8">
        <div className="card p-10 text-center">
          <Megaphone className="w-7 h-7 text-ink-300 mx-auto mb-2" />
          <div className="text-sm font-semibold text-ink-900">Couldn’t load this brief</div>
          <div className="text-xs text-ink-500 mt-1">{error ?? 'Try again from the list.'}</div>
          <Link to="/creator/campaigns" className="text-sm link-accent inline-flex items-center gap-1 mt-3">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to briefs
          </Link>
        </div>
      </div>
    );
  }

  const { campaign, acceptedCount, allSelected, canApply, applyBlockedReason } = data;
  const myProposalForCampaign = proposals.find(
    (p) => p.campaignId === campaign.id,
  );

  const platformOk = campaign.requiredPlatform === creator?.primaryPlatform;
  const followersOk = !campaign.minFollowers || (creator?.followers ?? 0) >= campaign.minFollowers;
  const eligible = platformOk && followersOk;

  const hasActive = myProposalForCampaign &&
    (myProposalForCampaign.status === 'pending' ||
      myProposalForCampaign.status === 'shortlisted' ||
      myProposalForCampaign.status === 'accepted');
  const wasRejected = myProposalForCampaign?.status === 'rejected';

  let buttonState: { label: string; disabled: boolean; reason?: string };
  if (campaign.status === 'closed') {
    buttonState = { label: 'Campaign closed', disabled: true };
  } else if (allSelected) {
    buttonState = { label: 'All creators selected', disabled: true };
  } else if (!canApply) {
    buttonState = { label: 'Application closed', disabled: true, reason: applyBlockedReason ?? 'You can’t apply right now.' };
  } else if (hasActive) {
    buttonState = { label: 'You already applied', disabled: true };
  } else if (wasRejected) {
    buttonState = { label: 'Application closed', disabled: true };
  } else if (!eligible) {
    buttonState = { label: 'Not eligible', disabled: true };
  } else {
    buttonState = { label: 'Apply now', disabled: false };
  }

  return (
    <div className="container-page py-6 sm:py-8 space-y-6">
      <Link to="/creator/campaigns" className="text-sm text-ink-600 hover:text-ink-900 inline-flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to briefs
      </Link>

      <header className="card overflow-hidden">
        <ChannelArt name={campaign.brandName} seed={campaign.brandId} height={96} className="rounded-none" />
        <div className="p-4 sm:p-6 -mt-10 sm:-mt-12">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="flex flex-col sm:flex-row sm:items-end gap-3 min-w-0">
              <ChannelArt name={campaign.brandName} seed={campaign.brandId} height={56} className="w-12 sm:w-14 rounded-md ring-4 ring-paper-50 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-ink-500 truncate">{campaign.brandName} · {campaign.category}</div>
                <h1 className="font-display text-xl sm:text-2xl md:text-3xl text-ink-900 leading-[1.15] tracking-[-0.02em] mt-1 break-words">
                  {campaign.title}
                </h1>
              </div>
            </div>
            <div className="self-start sm:self-auto shrink-0">
              <CampaignStatusBadge status={campaign.status} />
            </div>
          </div>
          <p className="text-[15px] text-ink-700 mt-5 leading-relaxed whitespace-pre-line break-words">{campaign.description}</p>
        </div>
      </header>

      <StatRow
        items={[
          { label: 'Budget', value: currency(campaign.budgetPerCreator), hint: 'per creator' },
          { label: 'Deadline', value: fmtDate(campaign.applicationDeadline) },
          { label: 'Creators', value: String(campaign.creatorsNeeded), hint: 'needed' },
          { label: 'Min followers', value: campaign.minFollowers?.toLocaleString() ?? '—' },
        ]}
      />

      <section className="card p-5 sm:p-6">
        <SectionHeader eyebrow="Brief" title="Details" />
        <dl className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5 text-sm">
          <Row label="Required platform">
            <span className="inline-flex items-center gap-1.5">
              <PlatformIcon platform={campaign.requiredPlatform} />
              {campaign.requiredPlatform}
            </span>
          </Row>
          <Row label="Category">{campaign.category}</Row>
          <Row label="Deliverables"><span className="font-sans font-normal text-ink-700">{campaign.deliverables || '—'}</span></Row>
        </dl>
      </section>

      <section className="card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="eyebrow mb-1.5">Eligibility</div>
          <div className="text-sm font-semibold text-ink-900">
            {eligible ? 'You meet the requirements.' : 'Not eligible for this brief.'}
          </div>
          {!eligible && (
            <div className="text-xs text-ink-500 mt-1">
              {!platformOk ? `Requires ${campaign.requiredPlatform}.` : `Needs ${campaign.minFollowers?.toLocaleString()}+ followers.`}
            </div>
          )}
        </div>
        <EligibilityChip
          eligible={eligible}
          reason={!platformOk ? `Requires ${campaign.requiredPlatform}` : `Needs ${campaign.minFollowers?.toLocaleString()}+ followers`}
        />
      </section>

      {allSelected && (
        <div className="card p-4 flex items-center gap-3 border-emerald-200 bg-emerald-50 text-sm text-emerald-800">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Brand has selected all creators for this campaign.
        </div>
      )}
      {campaign.status === 'closed' && !allSelected && (
        <div className="card p-4 flex items-center gap-3 border-amber-200 bg-amber-50 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          This campaign has been closed to new proposals.
        </div>
      )}

      <div className="card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-ink-900">Ready to apply?</div>
          {buttonState.reason && <div className="text-xs text-ink-500 mt-0.5">{buttonState.reason}</div>}
        </div>
        <Button
          disabled={buttonState.disabled || applying}
          onClick={() => setApplyOpen(true)}
          size="lg"
        >
          {buttonState.label}
          {!buttonState.disabled && <ArrowRight className="w-4 h-4" />}
        </Button>
      </div>

      {applyOpen && (
        <ApplyModal
          onClose={() => setApplyOpen(false)}
          onSubmitted={async (newId) => {
            setApplyOpen(false);
            push('Proposal submitted!', 'success');
            await loadMyProposals();
            refresh();
            navigate(`/creator/applications/${newId}`);
          }}
          campaignId={campaign.id}
          applying={applying}
          setApplying={setApplying}
        />
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-1.5 text-ink-700 font-semibold">{children}</dd>
    </div>
  );
}

function ApplyModal({
  onClose, onSubmitted, campaignId, applying, setApplying,
}: {
  onClose: () => void;
  onSubmitted: (proposalId: string) => void;
  campaignId: string;
  applying: boolean;
  setApplying: (b: boolean) => void;
}) {
  const { creator } = useStore();
  const [cover, setCover] = useState('');
  const [rate, setRate] = useState(creator?.ratePerPost ?? 1000);
  const [experience, setExperience] = useState('');
  const [links, setLinks] = useState((creator?.portfolio ?? []).slice(0, 3).map((p) => ({ ...p })));
  const [error, setError] = useState('');

  const valid = cover.length >= 30 && rate > 0;

  const submit = async () => {
    if (!valid) {
      setError('Cover message must be at least 30 characters and proposed rate must be > 0.');
      return;
    }
    setApplying(true);
    setError('');
    try {
      const p = await addProposal(campaignId, {
        coverMessage: cover,
        proposedRate: rate,
        portfolio: links.filter((l) => l.url).slice(0, 3),
        relevantExperience: experience,
      });
      onSubmitted(p.id);
    } catch (err) {
      const msg = isApiError(err) ? err.message : 'Could not submit your proposal.';
      setError(msg);
    } finally {
      setApplying(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Submit a proposal"
      size="lg"
      footer={
        <>
          <button className="btn btn-secondary btn-md" onClick={onClose} disabled={applying}>Cancel</button>
          <button className="btn btn-primary btn-md" disabled={!valid || applying} onClick={submit}>
            {applying ? 'Submitting…' : 'Submit proposal'}
          </button>
        </>
      }
    >
      <FormField label="Cover message" helper={`${cover.length}/3000 · at least 30 characters`}>
        <Textarea rows={5} maxLength={3000} value={cover} onChange={(e) => setCover(e.target.value)} placeholder="Tell the brand why you’re a fit…" />
      </FormField>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField label="Proposed rate (USD)">
          <Input type="number" min={1} value={rate} onChange={(e) => setRate(Number(e.target.value))} />
        </FormField>
        <FormField label="Relevant experience" helper="Optional, up to 2000 chars">
          <Input value={experience} onChange={(e) => setExperience(e.target.value)} maxLength={2000} placeholder="e.g. 3 beverage collabs in 2024" />
        </FormField>
      </div>
      <FormField label="Portfolio links" helper="Up to 3 · pre-filled from your profile">
        {links.map((l, i) => (
          <div key={l.id} className="flex gap-2 mb-2">
            <Input
              placeholder="https://…"
              className="flex-1 min-w-0"
              value={l.url}
              onChange={(e) => {
                const next = [...links];
                next[i] = { ...next[i], url: e.target.value };
                setLinks(next);
              }}
            />
            <button
              type="button"
              className="text-ink-500 hover:text-rose-600 transition-colors px-2"
              onClick={() => setLinks(links.filter((_, idx) => idx !== i))}
              aria-label="Remove link"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        {links.length === 0 && (
          <div className="text-xs text-ink-500 italic">No portfolio links yet — add some to your profile first.</div>
        )}
      </FormField>
      {error && <div className="error">{error}</div>}
    </Modal>
  );
}
