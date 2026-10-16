import { Link } from 'react-router-dom';
import { Plus, ArrowRight, Inbox, Users, Megaphone, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useStore, loadBrandProfile, loadBrandCampaigns } from '../../state/Store';
import { fetchBrandDashboard, type BrandDashboardData } from '../../api/endpoints';
import { fmtRelativeTime, currency } from '../../data/seed';
import { useAuth } from '../../state/AuthContext';
import {
  CampaignStatusBadge, PageHeader, ChannelArt, StatRow, EmptyState, SectionHeader,
} from '../../components/ui';
import { isApiError } from '../../api/client';

export default function BrandDashboard() {
  const { user } = useAuth();
  const { brand } = useStore();
  const [data, setData] = useState<BrandDashboardData | null>(null);
  const [bootError, setBootError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadBrandProfile();
        const [dash, _] = await Promise.all([
          fetchBrandDashboard(),
          loadBrandCampaigns(),
        ]);
        if (!cancelled) setData(dash);
      } catch (err) {
        if (!cancelled) {
          setBootError(isApiError(err) ? err.message : 'Could not load the dashboard.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (bootError) {
    return (
      <div className="container-page py-8">
        <div className="card p-6 text-sm text-rose-700">{bootError}</div>
      </div>
    );
  }

  const campaigns = data?.campaigns ?? [];
  const totalProposals = data?.totalProposals ?? 0;
  const shortlisted = data?.shortlistedCount ?? 0;
  const accepted = data?.acceptedCount ?? 0;
  const activeCampaigns = data?.activeCampaigns ?? 0;
  const totalCampaigns = data?.totalCampaigns ?? 0;

  const summary =
    totalProposals > 0
      ? `${totalProposals} proposal${totalProposals === 1 ? '' : 's'} across ${totalCampaigns} campaign${totalCampaigns === 1 ? '' : 's'} — ${shortlisted} shortlisted, ${accepted} accepted.`
      : activeCampaigns > 0
        ? `${activeCampaigns} live campaign${activeCampaigns === 1 ? '' : 's'} — share them with creators to fill faster.`
        : 'Get started by creating your first campaign.';

  return (
    <div className="container-page py-6 sm:py-8">
      <PageHeader
        eyebrow={`Today · ${new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}`}
        title={
          <>
            {brand?.companyName || user?.fullName} <span className="text-ink-400">/</span> <span className="italic font-medium">control room</span>
          </>
        }
        description={summary}
        action={
          <Link to="/brand/campaigns/create" className="btn btn-primary btn-md self-start sm:self-auto">
            <Plus className="w-4 h-4" /> New campaign <ArrowRight className="w-4 h-4" />
          </Link>
        }
      />

      <div className="space-y-8">
        <StatRow
          items={[
            { label: 'Total campaigns', value: totalCampaigns, hint: 'all time' },
            { label: 'Active', value: activeCampaigns, hint: 'live now' },
            { label: 'Shortlisted', value: shortlisted, hint: 'awaiting you' },
            { label: 'Accepted', value: accepted, hint: 'in progress' },
          ]}
        />

        <section>
          <SectionHeader
            eyebrow="Proposals"
            title="Your campaigns"
            description="Open a campaign to manage its proposals, publish, or close it."
            action={
              <Link to="/brand/campaigns" className="text-sm link-accent inline-flex items-center gap-1">
                All campaigns <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          />
          {campaigns.length === 0 ? (
            <div className="card mt-5">
              <EmptyState
                icon={<Megaphone className="w-5 h-5" />}
                title="No campaigns yet"
                description="Create your first brief to start receiving proposals."
                action={
                  <Link to="/brand/campaigns/create" className="btn btn-primary btn-md">
                    <Plus className="w-4 h-4" /> New campaign
                  </Link>
                }
              />
            </div>
          ) : (
            <ul className="mt-5 card divide-y divide-ink-200/60 stagger">
              {campaigns.slice(0, 8).map((c) => {
                const fill = c.creatorsNeeded > 0 ? Math.round((c.acceptedCount / c.creatorsNeeded) * 100) : 0;
                return (
                  <li key={c.id}>
                    <Link
                      to={`/brand/campaigns/${c.id}/proposals`}
                      className="block p-4 sm:p-5 hover:bg-paper-100/60 transition-colors group"
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <ChannelArt name={c.title} seed={String(c.id)} height={48} className="w-12 rounded-md shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <CampaignStatusBadge status={c.status} />
                            <span className="text-[11px] text-ink-500 font-mono uppercase tracking-[0.12em]">
                              {c.acceptedCount} of {c.creatorsNeeded} filled
                            </span>
                            <span className="sm:hidden text-[11px] text-ink-500 font-mono">
                              · {c.proposalCount} proposal{c.proposalCount === 1 ? '' : 's'}
                            </span>
                          </div>
                          <div className="mt-1 font-semibold text-ink-900 line-clamp-1 leading-snug">{c.title}</div>
                          <div className="mt-1.5 h-1.5 bg-paper-100 rounded-sm overflow-hidden max-w-xs">
                            <div
                              className="h-full bg-ink-900 transition-all duration-500 ease-out-quint"
                              style={{ width: fill + '%' }}
                            />
                          </div>
                        </div>
                        <div className="hidden sm:flex flex-col items-end shrink-0">
                          <div className="text-sm font-mono font-semibold text-ink-900 inline-flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-ink-500" />
                            {c.proposalCount} proposal{c.proposalCount === 1 ? '' : 's'}
                          </div>
                          <div className="text-[11px] text-ink-500">{c.acceptedCount} accepted · {fill}%</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-ink-300 group-hover:text-ember-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="eyebrow mb-1.5">Total spend committed</div>
            <div className="font-display text-xl text-ink-900 tracking-[-0.01em]">
              {currency(0)}
            </div>
            <div className="text-xs text-ink-500 mt-0.5">
              See a campaign for its per-creator budget and total commitment.
            </div>
          </div>
          <Link to="/brand/campaigns" className="btn btn-secondary btn-md">
            Open campaigns <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </section>
      </div>
    </div>
  );
}
