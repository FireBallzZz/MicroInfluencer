import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, CheckCircle2, Megaphone, ArrowRight, Inbox, AlertTriangle, Users } from 'lucide-react';
import { setCampaignStatus, deleteCampaign, useStore } from '../../state/Store';
import { Button, CampaignStatusBadge, EmptyState, ChannelArt, StatRow, SectionHeader, PageHeader, ProposalStatusBadge, Avatar } from '../../components/ui';
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

  if (!c) {
    return (
      <div className="container-page py-6 sm:py-8">
        <div className="card p-10 text-center">
          <Megaphone className="w-7 h-7 text-ink-300 mx-auto mb-2" />
          <div className="text-sm font-semibold text-ink-900">Campaign not found</div>
          <Link to="/brand/campaigns" className="text-sm link-accent inline-flex items-center gap-1 mt-3">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to campaigns
          </Link>
        </div>
      </div>
    );
  }

  const myProposals = proposals.filter((p) => p.campaignId === c.id);
  const accepted = myProposals.filter((p) => p.status === 'accepted').length;
  const fill = c.creatorsNeeded > 0 ? Math.round((accepted / c.creatorsNeeded) * 100) : 0;

  return (
    <div className="container-page py-6 sm:py-8 space-y-6 max-w-3xl">
      <Link to="/brand/campaigns" className="text-sm text-ink-600 hover:text-ink-900 inline-flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to campaigns
      </Link>

      {/* Header */}
      <header className="card overflow-hidden">
        <ChannelArt name={c.title} seed={c.id} height={96} className="rounded-none" />
        <div className="p-5 sm:p-6 -mt-8 sm:-mt-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <CampaignStatusBadge status={c.status} />
                <span className="text-[11px] text-ink-500 font-mono uppercase tracking-[0.12em]">
                  {c.category} · {c.requiredPlatform}
                </span>
              </div>
              <h1 className="mt-1.5 font-display text-2xl sm:text-3xl text-ink-900 leading-[1.1] tracking-[-0.02em]">
                {c.title}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {c.status === 'draft' && (
                <>
                  <Link to={`/brand/campaigns/${c.id}/edit`} className="btn btn-secondary btn-sm">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Link>
                  <Button size="sm" onClick={() => setConfirmPublish(true)}>
                    <Megaphone className="w-3.5 h-3.5" /> Publish
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)} aria-label="Delete">
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  </Button>
                </>
              )}
              {c.status === 'published' && (
                <Button variant="secondary" size="sm" onClick={() => setConfirmClose(true)}>
                  Close campaign
                </Button>
              )}
            </div>
          </div>
          <p className="text-[15px] text-ink-700 mt-4 whitespace-pre-line leading-relaxed">{c.description}</p>
        </div>
      </header>

      <StatRow
        items={[
          { label: 'Budget / creator', value: currency(c.budgetPerCreator) },
          { label: 'Deadline', value: fmtDate(c.applicationDeadline) },
          { label: 'Creators', value: `${accepted} / ${c.creatorsNeeded}` },
          { label: 'Min followers', value: c.minFollowers?.toLocaleString() ?? 'None' },
        ]}
      />

      {/* Fill rate */}
      <section className="card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="eyebrow">Roster fill rate</div>
          <span className="text-[11px] font-mono uppercase tracking-[0.12em] text-ink-500">
            {fill}% filled
          </span>
        </div>
        <div className="h-2 bg-paper-100 rounded-sm overflow-hidden">
          <div className="h-full bg-ink-900 transition-all duration-500 ease-out-quint" style={{ width: fill + '%' }} />
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <SectionHeader eyebrow="Brief" title="Details" />
        <dl className="mt-5 grid sm:grid-cols-2 gap-x-10 gap-y-5 text-sm">
          <Row label="Deliverables"><span className="font-sans font-normal text-ink-700">{c.deliverables || '—'}</span></Row>
          <Row label="Status">{c.status}</Row>
        </dl>
      </section>

      {/* Proposals */}
      <section className="card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-3 gap-3">
          <SectionHeader eyebrow="Inbox" title="Recent proposals" />
          <Link to={`/brand/campaigns/${c.id}/proposals`} className="btn btn-primary btn-sm shrink-0">
            Manage <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {myProposals.length === 0 ? (
          <EmptyState
            icon={<Inbox className="w-5 h-5" />}
            title="No proposals yet"
            description="Once creators apply, you can shortlist, accept or reject them here."
          />
        ) : (
          <ul className="mt-2 divide-y divide-ink-200/60">
            {myProposals.slice(0, 5).map((p) => (
              <li key={p.id}>
                <Link
                  to={`/brand/campaigns/${c.id}/proposals`}
                  className="py-3 flex items-center gap-3 hover:bg-paper-100 -mx-2 px-2 rounded transition-colors"
                >
                  <Avatar name={p.creatorName} size="sm" tone="ink" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-ink-900 truncate">{p.creatorName}</div>
                    <div className="text-xs text-ink-500 truncate">{currency(p.proposedRate)} · {p.creatorNiche} · {p.creatorPlatform}</div>
                  </div>
                  <ProposalStatusBadge status={p.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

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

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-1.5 text-ink-700 font-semibold">{children}</dd>
    </div>
  );
}
