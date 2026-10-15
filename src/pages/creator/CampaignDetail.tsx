import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStore, addProposal } from '../../state/Store';
import {
  Button, CampaignStatusBadge, EligibilityChip, ChannelArt, PlatformIcon,
  SectionHeader, StatRow, PageHeader,
} from '../../components/ui';
import { currency, fmtDate } from '../../data/seed';
import { ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, Megaphone } from 'lucide-react';
import { useState } from 'react';
import { Modal } from '../../components/Modal';
import { FormField, Textarea, Input } from '../../components/ui';
import { useToast } from '../../state/ToastContext';

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { push } = useToast();
  const { campaigns, proposals, creator } = useStore();
  const campaign = campaigns.find((c) => c.id === id);
  const [applyOpen, setApplyOpen] = useState(false);

  if (!campaign) {
    return (
      <div className="container-page py-6 sm:py-8">
        <div className="card p-10 text-center">
          <Megaphone className="w-7 h-7 text-ink-300 mx-auto mb-2" />
          <div className="text-sm font-semibold text-ink-900">Campaign not found</div>
          <Link to="/creator/campaigns" className="text-sm link-accent inline-flex items-center gap-1 mt-3">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to campaigns
          </Link>
        </div>
      </div>
    );
  }

  const myProposalForCampaign = proposals.find(
    (p) => p.campaignId === campaign.id && p.creatorId === creator.id
  );

  const platformOk = campaign.requiredPlatform === creator.primaryPlatform;
  const followersOk = !campaign.minFollowers || creator.followers >= campaign.minFollowers;
  const eligible = platformOk && followersOk;

  const acceptedCount = proposals.filter(
    (p) => p.campaignId === campaign.id && p.status === 'accepted'
  ).length;
  const allFilled = acceptedCount >= campaign.creatorsNeeded;

  const hasActive = myProposalForCampaign &&
    (myProposalForCampaign.status === 'pending' ||
      myProposalForCampaign.status === 'shortlisted' ||
      myProposalForCampaign.status === 'accepted');
  const wasRejected = myProposalForCampaign?.status === 'rejected';

  let buttonState: { label: string; disabled: boolean; reason?: string };
  if (campaign.status === 'closed') {
    buttonState = { label: 'Campaign closed', disabled: true };
  } else if (hasActive) {
    buttonState = { label: 'You already applied', disabled: true, reason: 'You can only have one active proposal per campaign.' };
  } else if (wasRejected) {
    buttonState = { label: 'Application closed', disabled: true, reason: 'Your previous application was rejected.' };
  } else if (allFilled) {
    buttonState = { label: 'All creators selected', disabled: true };
  } else if (!eligible) {
    buttonState = { label: 'Not eligible', disabled: true };
  } else {
    buttonState = { label: 'Apply now', disabled: false };
  }

  return (
    <div className="container-page py-6 sm:py-8 space-y-6">
      <Link to="/creator/campaigns" className="text-sm text-ink-600 hover:text-ink-900 inline-flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to campaigns
      </Link>

      {/* Brief header */}
      <header className="card overflow-hidden">
        <ChannelArt name={campaign.brandName} seed={campaign.brandId} height={96} className="rounded-none" />
        <div className="p-5 sm:p-6 -mt-10 sm:-mt-12">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-end gap-3 min-w-0">
              <ChannelArt name={campaign.brandName} seed={campaign.brandId} height={56} className="w-12 sm:w-14 rounded-md ring-4 ring-paper-50 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-ink-500 truncate">{campaign.brandName} · {campaign.category}</div>
                <h1 className="font-display text-2xl sm:text-3xl text-ink-900 leading-[1.1] tracking-[-0.02em] mt-0.5">
                  {campaign.title}
                </h1>
              </div>
            </div>
            <CampaignStatusBadge status={campaign.status} />
          </div>
          <p className="text-[15px] text-ink-700 mt-5 leading-relaxed whitespace-pre-line">{campaign.description}</p>
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
        <dl className="mt-5 grid sm:grid-cols-2 gap-x-10 gap-y-5 text-sm">
          <Row label="Required platform">
            <span className="inline-flex items-center gap-1.5">
              <PlatformIcon platform={campaign.requiredPlatform} />
              {campaign.requiredPlatform}
            </span>
          </Row>
          <Row label="Category">{campaign.category}</Row>
          <Row label="Deliverables"><span className="font-sans font-normal text-ink-700">{campaign.deliverables}</span></Row>
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

      {allFilled && (
        <div className="card p-4 flex items-center gap-3 border-emerald-200 bg-emerald-50 text-sm text-emerald-800">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Brand has selected all creators for this campaign.
        </div>
      )}
      {campaign.status === 'closed' && !allFilled && (
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
          disabled={buttonState.disabled}
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
          onSubmitted={(newId) => {
            setApplyOpen(false);
            push('Proposal submitted!', 'success');
            navigate(`/creator/applications/${newId}`);
          }}
          campaignId={campaign.id}
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
  onClose,
  onSubmitted,
  campaignId,
}: {
  onClose: () => void;
  onSubmitted: (proposalId: string) => void;
  campaignId: string;
}) {
  const { creator } = useStore();
  const [cover, setCover] = useState('');
  const [rate, setRate] = useState(creator.ratePerPost);
  const [experience, setExperience] = useState('');
  const [links, setLinks] = useState(creator.portfolio.map((p) => ({ ...p })));
  const [error, setError] = useState('');

  const valid = cover.length >= 30 && rate > 0 && links.filter((l) => l.url).length <= 3;

  const submit = () => {
    if (!valid) {
      setError('Cover message must be at least 30 characters and proposed rate must be > 0.');
      return;
    }
    const p = addProposal(campaignId, {
      coverMessage: cover,
      proposedRate: rate,
      portfolio: links.filter((l) => l.url).slice(0, 3),
      relevantExperience: experience,
    });
    onSubmitted(p.id);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Submit a proposal"
      size="lg"
      footer={
        <>
          <button className="btn btn-secondary btn-md" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-md" disabled={!valid} onClick={submit}>Submit proposal</button>
        </>
      }
    >
      <FormField label="Cover message" helper={`${cover.length}/1000 · at least 30 characters`}>
        <Textarea rows={5} value={cover} onChange={(e) => setCover(e.target.value)} placeholder="Tell the brand why you’re a fit…" />
      </FormField>
      <div className="grid sm:grid-cols-2 gap-3">
        <FormField label="Proposed rate (USD)">
          <Input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} />
        </FormField>
        <FormField label="Relevant experience" helper="Optional, up to 500 chars">
          <Input value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="e.g. 3 beverage collabs in 2024" />
        </FormField>
      </div>
      <FormField label="Portfolio links" helper="Up to 3 · pre-filled from your profile">
        {links.map((l, i) => (
          <div key={l.id} className="flex gap-2 mb-2">
            <Input
              placeholder="https://…"
              value={l.url}
              onChange={(e) => {
                const next = [...links];
                next[i] = { ...next[i], url: e.target.value };
                setLinks(next);
              }}
            />
          </div>
        ))}
      </FormField>
      {error && <div className="error">{error}</div>}
    </Modal>
  );
}
