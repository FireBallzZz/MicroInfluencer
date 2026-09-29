import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, CheckCircle2, Megaphone } from 'lucide-react';
import { setCampaignStatus, deleteCampaign, useStore } from '../../state/Store';
import { Button, CampaignStatusBadge, EmptyState } from '../../components/ui';
import { currency, fmtDate } from '../../data/seed';
import { ConfirmDialog } from '../../components/Modal';
import { useState } from 'react';
import { useToast } from '../../state/ToastContext';

export default function CampaignDetailBrand() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { push } = useToast();
  const { campaigns, proposals } = useStore();
  const c = campaigns.find((x) => x.id === id);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);

  if (!c) return <div className="card p-6">Campaign not found.</div>;

  const myProposals = proposals.filter((p) => p.campaignId === c.id);
  const accepted = myProposals.filter((p) => p.status === 'accepted').length;

  return (
    <div className="space-y-5 max-w-3xl">
      <Link to="/brand/campaigns" className="text-sm text-ink-600 hover:text-ink-900 inline-flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to campaigns
      </Link>

      <div className="card p-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-ink-900">{c.title}</h1>
              <CampaignStatusBadge status={c.status} />
            </div>
            <div className="text-xs text-ink-500 mt-1">{c.category} · {c.requiredPlatform}</div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {c.status === 'draft' && (
              <>
                <Link to={`/brand/campaigns/${c.id}/edit`} className="btn btn-secondary btn-md"><Pencil className="w-4 h-4" /> Edit</Link>
                <button className="btn btn-primary btn-md" onClick={() => setConfirmPublish(true)}><Megaphone className="w-4 h-4" /> Publish</button>
                <button className="btn btn-ghost btn-md" onClick={() => setConfirmDelete(true)}><Trash2 className="w-4 h-4 text-rose-600" /></button>
              </>
            )}
            {c.status === 'published' && (
              <button className="btn btn-secondary btn-md" onClick={() => setConfirmClose(true)}>Close campaign</button>
            )}
          </div>
        </div>

        <p className="text-sm text-ink-700 mt-4 whitespace-pre-line">{c.description}</p>

        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Budget / creator" value={currency(c.budgetPerCreator)} />
          <Stat label="Deadline" value={fmtDate(c.applicationDeadline)} />
          <Stat label="Creators needed" value={String(c.creatorsNeeded)} />
          <Stat label="Min followers" value={c.minFollowers?.toLocaleString() ?? 'None'} />
        </div>
        <div className="mt-4">
          <div className="text-xs text-ink-500 mb-1">Deliverables</div>
          <div className="text-sm text-ink-800">{c.deliverables}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Stat label="Proposals received" value={String(myProposals.length)} />
        <Stat label="Accepted" value={`${accepted} of ${c.creatorsNeeded}`} />
        <Stat label="Pending review" value={String(myProposals.filter((p) => p.status === 'pending').length)} />
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-ink-900">Recent proposals</h2>
          <Link to={`/brand/campaigns/${c.id}/proposals`} className="btn btn-primary btn-md">Manage proposals</Link>
        </div>
        {myProposals.length === 0 ? (
          <EmptyState
            title="No proposals yet"
            description="Once creators apply, you can shortlist, accept or reject them here."
          />
        ) : (
          <div className="divide-y divide-ink-100">
            {myProposals.slice(0, 5).map((p) => (
              <Link key={p.id} to={`/brand/campaigns/${c.id}/proposals`} className="py-3 flex items-center gap-3 hover:bg-ink-50 -mx-2 px-2 rounded">
                <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center font-semibold text-sm">
                  {p.creatorName.split(' ').map((s) => s[0]).slice(0, 2).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-ink-900 truncate">{p.creatorName}</div>
                  <div className="text-xs text-ink-500 truncate">{currency(p.proposedRate)} · {p.creatorNiche}</div>
                </div>
                <span className={`badge ${badgeFor(p.status)}`}>{p.status}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmPublish}
        onClose={() => setConfirmPublish(false)}
        onConfirm={() => { setCampaignStatus(c.id, 'published'); push('Campaign published', 'success'); }}
        title="Publish this campaign?"
        description="Once published, creators can apply and you won’t be able to edit or delete it."
        confirmLabel="Publish"
      />
      <ConfirmDialog
        open={confirmClose}
        onClose={() => setConfirmClose(false)}
        onConfirm={() => { setCampaignStatus(c.id, 'closed'); push('Campaign closed', 'info'); }}
        title="Close this campaign?"
        description="The campaign will no longer accept new applications. Existing proposals can still be reviewed."
        confirmLabel="Close campaign"
      />
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => { deleteCampaign(c.id); push('Campaign deleted', 'info'); navigate('/brand/campaigns'); }}
        title="Delete this draft?"
        description="This campaign is still a draft and will be removed permanently."
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
}

function badgeFor(s: string) {
  switch (s) {
    case 'pending': return 'badge-amber';
    case 'shortlisted': return 'badge-blue';
    case 'accepted': return 'badge-green';
    case 'rejected': return 'badge-rose';
    default: return 'badge-gray';
  }
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-ink-500">{label}</div>
      <div className="text-xl font-bold text-ink-900 mt-1">{value}</div>
    </div>
  );
}