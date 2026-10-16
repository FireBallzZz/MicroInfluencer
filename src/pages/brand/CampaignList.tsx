import { Link, useNavigate } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import clsx from 'clsx';
import { Plus, ArrowRight, Megaphone, Edit, Trash2, Users } from 'lucide-react';
import {
  CampaignStatusBadge, ChannelArt, EmptyState, Button, PageHeader,
} from '../../components/ui';
import { fmtDate, currency } from '../../data/seed';
import { ConfirmDialog } from '../../components/Modal';
import { useToast } from '../../state/ToastContext';
import {
  useStore, loadBrandCampaigns, loadBrandProfile, setCampaignStatus, deleteCampaign,
  loadMyProposals,
} from '../../state/Store';
import { listBrandCampaignProposals } from '../../api/endpoints';
import { isApiError } from '../../api/client';
import type { CampaignStatus as CS } from '../../types';

const TABS = ['All', 'Published', 'Draft', 'Closed'] as const;

export default function CampaignList() {
  const { campaigns, brand, loading, errors } = useStore();
  const navigate = useNavigate();
  const { push } = useToast();
  const [tab, setTab] = useState<(typeof TABS)[number]>('All');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [proposalCounts, setProposalCounts] = useState<Record<string, { total: number; accepted: number }>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadBrandProfile();
        const list = await loadBrandCampaigns();
        // Pull proposal counts for the visible cards.
        const counts: Record<string, { total: number; accepted: number }> = {};
        await Promise.all(
          list.slice(0, 20).map(async (c) => {
            try {
              const { results } = await listBrandCampaignProposals(c.id);
              counts[c.id] = {
                total: results.length,
                accepted: results.filter((p) => p.status === 'accepted').length,
              };
            } catch {
              counts[c.id] = { total: 0, accepted: 0 };
            }
          }),
        );
        if (!cancelled) setProposalCounts(counts);
      } catch (err) {
        if (!cancelled) push(isApiError(err) ? err.message : 'Failed to load campaigns.', 'error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const mine = useMemo(
    // Backend already filters the brand's own campaigns, so the list
    // doesn't need a brand.id check.
    () => [...campaigns].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [campaigns],
  );

  const counts = {
    All: mine.length,
    Published: mine.filter((c) => c.status === 'published').length,
    Draft: mine.filter((c) => c.status === 'draft').length,
    Closed: mine.filter((c) => c.status === 'closed').length,
  };
  const filtered = tab === 'All' ? mine : mine.filter((c) => c.status === tab.toLowerCase());

  return (
    <div className="container-page py-6 sm:py-8 space-y-6">
      <PageHeader
        eyebrow="Campaigns"
        title="My campaigns"
        description="Post briefs, review proposals, accept or pass on creators."
        action={
          <Link to="/brand/campaigns/create" className="btn btn-primary btn-md">
            <Plus className="w-4 h-4" /> New campaign
          </Link>
        }
      />

      <div className="border-b border-ink-200 -mx-3 sm:mx-0">
        <div className="flex gap-0 overflow-x-auto no-scrollbar px-3 sm:px-0">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={clsx(
                'px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px whitespace-nowrap transition-colors',
                tab === t
                  ? 'border-ember-500 text-ink-900'
                  : 'border-transparent text-ink-500 hover:text-ink-900'
              )}
            >
              {t}
              <span className="ml-1.5 text-[10px] font-mono text-ink-400">{counts[t]}</span>
            </button>
          ))}
        </div>
      </div>

      {loading.brandCampaigns ? (
        <div className="card p-10 text-center text-sm text-ink-500">Loading campaigns…</div>
      ) : errors.brandCampaigns ? (
        <div className="card p-10 text-center text-sm text-rose-700">{errors.brandCampaigns}</div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Megaphone className="w-5 h-5" />}
            title={tab === 'All' ? 'No campaigns yet' : `No ${tab.toLowerCase()} campaigns`}
            description="Get your first brief in front of creators."
            action={
              <Link to="/brand/campaigns/create" className="btn btn-primary btn-md">
                <Plus className="w-4 h-4" /> New campaign
              </Link>
            }
          />
        </div>
      ) : (
        <ul className="space-y-3 stagger">
          {filtered.map((c) => {
            const pc = proposalCounts[c.id] ?? { total: 0, accepted: 0 };
            return (
              <li key={c.id}>
                <article className="card card-hover p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <ChannelArt name={c.title} seed={c.id} height={56} className="w-14 rounded-md shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CampaignStatusBadge status={c.status} />
                      <span className="text-[11px] text-ink-500 font-mono uppercase tracking-[0.12em]">
                        {c.category} · {c.requiredPlatform}
                      </span>
                    </div>
                    <h3 className="mt-1.5 font-semibold text-ink-900 leading-snug line-clamp-1">{c.title}</h3>
                    <div className="text-xs text-ink-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>Due {fmtDate(c.applicationDeadline)}</span>
                      <span>·</span>
                      <span>{currency(c.budgetPerCreator)} / creator</span>
                      <span>·</span>
                      <span>{c.creatorsNeeded} creators</span>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0.5 shrink-0">
                    <div className="text-sm font-mono font-semibold text-ink-900 inline-flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-ink-500" />
                      {pc.accepted} / {c.creatorsNeeded}
                    </div>
                    <div className="text-[11px] text-ink-500">
                      {pc.total} proposal{pc.total === 1 ? '' : 's'}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    {c.status === 'draft' && (
                      <Button
                        size="sm"
                        onClick={async () => {
                          try {
                            await setCampaignStatus(c.id, 'published');
                            push('Campaign published', 'success');
                          } catch (err) {
                            push(isApiError(err) ? err.message : 'Failed to publish.', 'error');
                          }
                        }}
                      >
                        Publish
                      </Button>
                    )}
                    {c.status === 'published' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={async () => {
                          try {
                            await setCampaignStatus(c.id, 'closed');
                            push('Campaign closed', 'info');
                          } catch (err) {
                            push(isApiError(err) ? err.message : 'Failed to close.', 'error');
                          }
                        }}
                      >
                        Close
                      </Button>
                    )}
                    {c.status === 'closed' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={async () => {
                          try {
                            await setCampaignStatus(c.id, 'published');
                            push('Campaign reopened', 'info');
                          } catch (err) {
                            push(isApiError(err) ? err.message : 'Failed to reopen.', 'error');
                          }
                        }}
                      >
                        Reopen
                      </Button>
                    )}
                    <Button variant="secondary" size="sm" onClick={() => navigate(`/brand/campaigns/${c.id}/proposals`)}>
                      Review <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                    {c.status === 'draft' && (
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/brand/campaigns/${c.id}/edit`)}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    {c.status === 'draft' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmDelete(c.id)}
                        aria-label="Delete campaign"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      </Button>
                    )}
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={async () => {
          if (confirmDelete) {
            try {
              await deleteCampaign(confirmDelete);
              push('Campaign deleted', 'info');
            } catch (err) {
              push(isApiError(err) ? err.message : 'Failed to delete.', 'error');
            }
          }
        }}
        title="Delete this campaign?"
        description="This can’t be undone. All proposals will be removed from your view."
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
}
