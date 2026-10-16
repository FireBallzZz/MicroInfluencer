import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, Megaphone, ArrowRight, Inbox, AlertTriangle, Users, BarChart3 } from 'lucide-react';
import {
  setCampaignStatus, deleteCampaign, useStore, loadBrandCampaigns, loadBrandProfile,
} from '../../state/Store';
import {
  Button, CampaignStatusBadge, EmptyState, ChannelArt, StatRow, SectionHeader,
  PageHeader, ProposalStatusBadge, Avatar,
} from '../../components/ui';
import { currency, fmtDate } from '../../data/seed';
import { ConfirmDialog } from '../../components/Modal';
import { useState, useEffect } from 'react';
import { useToast } from '../../state/ToastContext';
import { listBrandCampaignProposals } from '../../api/endpoints';
import { isApiError } from '../../api/client';

export default function CampaignDetailBrand() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { push } = useToast();
  const { campaigns, brand } = useStore();
  const [proposals, setProposals] = useState<Awaited<ReturnType<typeof listBrandCampaignProposals>>['results']>([]);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await Promise.all([loadBrandProfile(), loadBrandCampaigns()]);
        if (!id) return;
        const res = await listBrandCampaignProposals(id);
        if (!cancelled) {
          setProposals(res.results);
          setAcceptedCount(res.acceptedCount);
        }
      } catch (err) {
        if (!cancelled) push(isApiError(err) ? err.message : 'Failed to load campaign.', 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const c = campaigns.find((x) => x.id === id);
  if (loading && !c) {
    return <div className="container-page py-8"><div className="card p-8 text-center text-sm text-ink-500">Loading…</div></div>;
  }
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

  const fill = c.creatorsNeeded > 0 ? Math.round((acceptedCount / c.creatorsNeeded) * 100) : 0;

  return (
    <div className="container-page py-6 sm:py-8 space-y-6 max-w-3xl">
      <Link to="/brand/campaigns" className="text-sm text-ink-600 hover:text-ink-900 inline-flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to campaigns
      </Link>

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
              {c.status === 'closed' && (
                <Button size="sm" onClick={async () => {
                  try { await setCampaignStatus(c.id, 'published'); push('Reopened', 'info'); }
                  catch (err) { push(isApiError(err) ? err.message : 'Failed to reopen.', 'error'); }
                }}>
                  Reopen
                </Button>
              )}
              <Link to={`/brand/campaigns/${c.id}/analytics`} className="btn btn-secondary btn-sm">
                <BarChart3 className="w-3.5 h-3.5" /> Analytics
              </Link>
            </div>
          </div>
          <p className="text-[15px] text-ink-700 mt-4 whitespace-pre-line leading-relaxed">{c.description}</p>
        </div>
      </header>

      <StatRow
        items={[
          { label: 'Budget / creator', value: currency(c.budgetPerCreator) },
          { label: 'Deadline', value: fmtDate(c.applicationDeadline) },
          { label: 'Creators', value: `${acceptedCount} / ${c.creatorsNeeded}` },
          { label: 'Min followers', value: c.minFollowers?.toLocaleString() ?? 'None' },
        ]}
      />

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
        <dl className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5 text-sm">
          <Row label="Deliverables"><span className="font-sans font-normal text-ink-700">{c.deliverables || '—'}</span></Row>
          <Row label="Status">{c.status}</Row>
        </dl>
      </section>

      <section className="card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-3 gap-3">
          <SectionHeader eyebrow="Inbox" title="Recent proposals" />
          <Link to={`/brand/campaigns/${c.id}/proposals`} className="btn btn-primary btn-sm shrink-0">
            Manage <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {proposals.length === 0 ? (
          <EmptyState
            icon={<Inbox className="w-5 h-5" />}
            title="No proposals yet"
            description="Once creators apply, you can shortlist, accept or reject them here."
          />
        ) : (
          <ul className="mt-2 divide-y divide-ink-200/60">
            {proposals.slice(0, 5).map((p) => (
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
        onConfirm={async () => {
          try { await setCampaignStatus(c.id, 'published'); push('Campaign published', 'success'); }
          catch (err) { push(isApiError(err) ? err.message : 'Failed to publish.', 'error'); }
          setConfirmPublish(false);
        }}
        title="Publish this campaign?"
        description="Once published, creators can apply and you won’t be able to edit or delete it."
        confirmLabel="Publish"
      />
      <ConfirmDialog
        open={confirmClose}
        onClose={() => setConfirmClose(false)}
        onConfirm={async () => {
          try { await setCampaignStatus(c.id, 'closed'); push('Campaign closed', 'info'); }
          catch (err) { push(isApiError(err) ? err.message : 'Failed to close.', 'error'); }
          setConfirmClose(false);
        }}
        title="Close this campaign?"
        description="The campaign will no longer accept new applications. Existing proposals can still be reviewed."
        confirmLabel="Close campaign"
      />
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={async () => {
          try {
            await deleteCampaign(c.id);
            push('Campaign deleted', 'info');
            navigate('/brand/campaigns');
          } catch (err) {
            push(isApiError(err) ? err.message : 'Failed to delete.', 'error');
          }
        }}
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
