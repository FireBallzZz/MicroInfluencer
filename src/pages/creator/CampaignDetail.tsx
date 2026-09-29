import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStore, useStore as _useStore, addProposal, activeProposalsForCreator } from '../../state/Store';
import { Button, CampaignStatusBadge, EligibilityChip } from '../../components/ui';
import { currency, fmtDate } from '../../data/seed';
import { CalendarDays, Users, DollarSign, Link2, ArrowLeft } from 'lucide-react';
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

  if (!campaign) return <div className="card p-6">Campaign not found.</div>;

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
    <div className="space-y-5">
      <Link to="/creator/campaigns" className="text-sm text-ink-600 hover:text-ink-900 inline-flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to campaigns
      </Link>

      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs text-ink-500 mb-1">{campaign.brandName}</div>
            <h1 className="text-2xl font-bold text-ink-900">{campaign.title}</h1>
          </div>
          <CampaignStatusBadge status={campaign.status} />
        </div>
        <p className="text-sm text-ink-700 mt-4 leading-relaxed whitespace-pre-line">{campaign.description}</p>

        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat icon={<DollarSign className="w-4 h-4" />} label="Budget / creator" value={currency(campaign.budgetPerCreator)} />
          <Stat icon={<CalendarDays className="w-4 h-4" />} label="Deadline" value={fmtDate(campaign.applicationDeadline)} />
          <Stat icon={<Users className="w-4 h-4" />} label="Creators needed" value={String(campaign.creatorsNeeded)} />
          <Stat icon={<Link2 className="w-4 h-4" />} label="Min followers" value={campaign.minFollowers?.toLocaleString() ?? 'None'} />
        </div>

        <div className="mt-5 grid md:grid-cols-2 gap-4">
          <KV label="Required platform" value={campaign.requiredPlatform} />
          <KV label="Category" value={campaign.category} />
          <div className="md:col-span-2">
            <KV label="Deliverables" value={campaign.deliverables} />
          </div>
        </div>
      </div>

      {/* Eligibility */}
      <div className="card p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-ink-900 mb-1">Eligibility check</div>
          <div className="text-sm text-ink-600">
            {eligible
              ? "You meet this campaign's requirements."
              : "You're not eligible - " +
                (!platformOk
                  ? 'Requires ' + campaign.requiredPlatform
                  : 'Needs ' + (campaign.minFollowers?.toLocaleString() ?? '0') + '+ followers') +
                '.'
            }
          </div>
        </div>
        <EligibilityChip eligible={eligible} reason={!platformOk ? `Requires ${campaign.requiredPlatform}` : `Needs ${campaign.minFollowers?.toLocaleString()}+ followers`} />
      </div>

      {allFilled && (
        <div className="card p-4 bg-emerald-50 border-emerald-200 text-sm text-emerald-800">
          Brand has selected all creators for this campaign.
        </div>
      )}

      <div className="card p-5 flex items-center justify-between">
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

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-ink-50">
      <div className="text-xs text-ink-500 flex items-center gap-1">{icon} {label}</div>
      <div className="font-semibold text-ink-900 mt-0.5">{value}</div>
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-ink-500">{label}</div>
      <div className="text-sm font-semibold text-ink-900 mt-0.5">{value}</div>
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
      <FormField label="Cover message" helper={`${cover.length}/1000 ' at least 30 characters`}>
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
      <FormField label="Portfolio links" helper="Up to 3 ' pre-filled from your profile">
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