import { Link } from 'react-router-dom';
import {
  ArrowRight, Megaphone, Youtube, AlertTriangle, CheckCircle2, Compass,
  ListChecks, ArrowUpRight,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  useStore, loadCreatorProfile, loadMyProposals, loadCreatorCampaigns,
} from '../../state/Store';
import { fetchCreatorDashboard, cleanYouTubeHandle, type CreatorDashboardData } from '../../api/endpoints';
import { fmtNumber, fmtRelativeTime, currency } from '../../data/seed';
import { useAuth } from '../../state/AuthContext';
import {
  SectionHeader, CampaignStatusBadge, EligibilityChip,
  ChannelArt, StatRow, ProposalStatusBadge, PageHeader, EmptyState,
} from '../../components/ui';
import type { CreatorProfile, MyProposal } from '../../types';

function calcLocalCompletion(c: CreatorProfile | null): number {
  if (!c) return 0;
  const checks = [
    !!c.fullName,
    !!c.location,
    !!c.niche,
    c.bio.length >= 40,
    c.followers > 0,
    c.engagementRate > 0,
    c.portfolio.length >= 2,
    c.ratePerPost > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export default function CreatorDashboard() {
  const { user } = useAuth();
  const { creator, proposals, loading, errors, connectedAccounts } = useStore();
  const [data, setData] = useState<CreatorDashboardData | null>(null);
  const [bootError, setBootError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [dash] = await Promise.all([
          fetchCreatorDashboard(),
          loadCreatorProfile().catch(() => undefined),
          loadMyProposals(),
          loadCreatorCampaigns(),
        ]);
        if (!cancelled) setData(dash);
      } catch (err) {
        if (!cancelled) {
          const msg = (err as Error).message || 'Could not load the dashboard.';
          setBootError(msg);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const yt = connectedAccounts.find((a) => a.platform === 'YouTube');
  const completion = data?.profileCompletion ?? calcLocalCompletion(creator);
  const ytStatus = data?.youtube;
  const available = data?.availableCampaigns ?? [];
  const myProposals = (data?.applications ?? (proposals as MyProposal[])) as MyProposal[];
  const accepted = data?.acceptedCampaigns ?? [];
  const perf = data?.performance ?? { proposalsSent: 0, accepted: 0, acceptanceRate: null };

  const counts = {
    pending: myProposals.filter((p) => p.status === 'pending').length,
    shortlisted: myProposals.filter((p) => p.status === 'shortlisted').length,
    accepted: accepted.length,
    rejected: myProposals.filter((p) => p.status === 'rejected').length,
    withdrawn: myProposals.filter((p) => p.status === 'withdrawn').length,
  };

  const acceptancePct = perf.acceptanceRate !== null ? Math.round(perf.acceptanceRate * 100) : 0;
  const summary =
    counts.shortlisted > 0
      ? `You have ${counts.shortlisted} shortlist${counts.shortlisted === 1 ? '' : 's'} and ${counts.pending} pending proposal${counts.pending === 1 ? '' : 's'}.`
      : counts.pending > 0
        ? `You have ${counts.pending} pending proposal${counts.pending === 1 ? '' : 's'} awaiting review.`
        : counts.accepted > 0
          ? `You have ${counts.accepted} active collaboration${counts.accepted === 1 ? '' : 's'}.`
          : 'A fresh slate. Browse the latest briefs to get started.';

  if (bootError) {
    return (
      <div className="container-page py-8">
        <div className="card p-6 text-sm text-rose-700">{bootError}</div>
      </div>
    );
  }

  return (
    <div className="container-page py-6 sm:py-8">
      <PageHeader
        eyebrow={`Today · ${new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}`}
        title={
          <>
            Welcome back, <span className="italic font-medium">{user?.fullName.split(' ')[0]}.</span>
          </>
        }
        description={summary}
        action={
          <Link to="/creator/campaigns" className="btn btn-primary btn-md self-start sm:self-auto">
            <Compass className="w-4 h-4" /> Find work <ArrowRight className="w-4 h-4" />
          </Link>
        }
      />

      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <article className="card p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="eyebrow">Profile</div>
                <div className="mt-1.5 font-display text-xl text-ink-900 tracking-[-0.01em]">
                  {completion === 100 ? 'Profile complete' : `${completion}% complete`}
                </div>
                <div className="text-xs text-ink-500 mt-1">
                  {completion === 100
                    ? 'Brands see the full picture when you apply.'
                    : 'Brands can filter creators by these fields.'}
                </div>
              </div>
            </div>
            <div className="mt-4 h-1.5 bg-paper-100 rounded-sm overflow-hidden">
              <div
                className="h-full bg-ink-900 transition-all duration-700 ease-out-quint"
                style={{ width: completion + '%' }}
              />
            </div>
            {completion < 100 ? (
              <Link to="/creator/profile/edit" className="btn btn-secondary btn-sm mt-4">
                Complete profile <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link to="/creator/profile" className="btn btn-secondary btn-sm mt-4">
                View profile <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </article>

          <article className="card p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="eyebrow">YouTube</div>
                <div className="mt-1.5 font-display text-xl text-ink-900 tracking-[-0.01em]">
                  {yt ? (yt.handle && yt.handle !== 'YouTube channel' ? cleanYouTubeHandle(yt.handle) : 'Connected') : 'Not connected'}
                </div>
                <div className="text-xs text-ink-500 mt-1">
                  {yt
                    ? `Last synced ${fmtRelativeTime(yt.lastSyncedAt)}`
                    : 'Verify your stats in one OAuth step.'}
                </div>
              </div>
              <Youtube className="w-5 h-5 text-rose-600" />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {yt?.status === 'connected' && (
                <>
                  <span className="tag tag-ember"><CheckCircle2 className="w-3 h-3" /> Verified</span>
                  <span className="text-xs text-ink-500">
                    {(creator?.followers ?? 0).toLocaleString()} {creator?.followers === 1 ? 'subscriber' : 'subscribers'} · {creator?.engagementRate ?? 0}% engagement
                  </span>
                </>
              )}
              {yt?.status === 'expired' && (
                <span className="tag tag-amber">
                  <AlertTriangle className="w-3 h-3" /> Reconnect needed
                </span>
              )}
              {ytStatus?.isOutdated && (
                <span className="tag tag-amber"><AlertTriangle className="w-3 h-3" /> Stats outdated</span>
              )}
              {!yt && <span className="tag tag-amber">Unverified</span>}
            </div>
            <Link to="/creator/accounts" className="btn btn-secondary btn-sm mt-4">
              {yt ? 'Manage connection' : 'Connect YouTube'}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </article>
        </div>

        <StatRow
          items={[
            { label: 'Proposals sent', value: perf.proposalsSent, hint: 'all time' },
            { label: 'Acceptance', value: perf.acceptanceRate !== null ? `${acceptancePct}%` : '—', hint: 'from sent' },
            { label: 'In flight', value: counts.pending + counts.shortlisted, hint: 'pending + shortlist' },
            { label: 'Accepted', value: perf.accepted, hint: 'hired' },
          ]}
        />

        <section>
          <SectionHeader
            eyebrow="Three to do"
            title="Up next"
            description="The actions with the highest expected value based on your current state."
            action={
              <Link to="/creator/campaigns" className="btn btn-secondary btn-sm">
                See all briefs <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          />
          <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 stagger">
            {[
              { to: '/creator/campaigns', icon: <Compass className="w-4 h-4" />, title: 'Browse new briefs', hint: `${available.length} live`, accent: 'ember' as const },
              { to: '/creator/applications', icon: <ListChecks className="w-4 h-4" />, title: 'Check proposal status', hint: `${counts.pending} pending`, accent: 'amber' as const },
              { to: '/creator/accounts', icon: <Youtube className="w-4 h-4" />, title: 'Verify your stats', hint: yt ? 'Connected' : 'Not connected', accent: 'rose' as const },
            ].map((a) => (
              <li key={a.to}>
                <Link to={a.to} className="card card-hover p-5 flex items-center gap-3 group h-full">
                  <span className={
                    a.accent === 'ember' ? 'w-10 h-10 rounded-md bg-ember-50 text-ember-700 flex items-center justify-center shrink-0'
                    : a.accent === 'amber' ? 'w-10 h-10 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center shrink-0'
                    : a.accent === 'rose'  ? 'w-10 h-10 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center shrink-0'
                    : 'w-10 h-10 rounded-md bg-ink-100 text-ink-700 flex items-center justify-center shrink-0'
                  }>{a.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-ink-900 truncate">{a.title}</div>
                    <div className="text-xs text-ink-500 mt-0.5">{a.hint}</div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-ink-300 group-hover:text-ember-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <SectionHeader
            eyebrow="Latest"
            title="Briefs you might be a fit for"
            action={
              <Link to="/creator/campaigns" className="text-sm link-accent inline-flex items-center gap-1">
                See all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          />
          {available.length === 0 ? (
            <div className="card p-10 mt-5 text-center">
              <Megaphone className="w-8 h-8 text-ink-300 mx-auto mb-3" />
              <div className="text-sm font-semibold text-ink-900">No live briefs right now</div>
              <div className="text-xs text-ink-500 mt-1">Check back soon — the marketplace updates daily.</div>
            </div>
          ) : (
            <ul className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 stagger">
              {available.slice(0, 4).map((c) => {
                const eligible =
                  c.requiredPlatform === creator?.primaryPlatform &&
                  (!c.minFollowers || (creator?.followers ?? 0) >= c.minFollowers);
                return (
                  <li key={c.id}>
                    <Link to={`/creator/campaigns/${c.id}`} className="card card-hover p-4 sm:p-5 group block">
                      <div className="flex items-start gap-3">
                        <ChannelArt name={c.brandName} seed={c.brandId} height={48} className="w-12 rounded-md shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs text-ink-500 truncate">{c.brandName} · {c.category} · {c.requiredPlatform}</div>
                          <div className="mt-1 font-semibold text-ink-900 line-clamp-2 leading-snug">{c.title}</div>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-px bg-ink-200 rounded-md overflow-hidden border border-ink-200">
                        <Cell label="Budget" value={currency(c.budgetPerCreator)} hint="/ creator" />
                        <Cell label="Deadline" value={fmtRelativeTime(c.applicationDeadline)} />
                        <Cell label="Need" value={`${c.creatorsNeeded}`} hint="creators" />
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <EligibilityChip eligible={eligible} />
                        <CampaignStatusBadge status={c.status} />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section>
          <SectionHeader
            eyebrow="Accepted"
            title="Active collaborations"
            description="Each card is a collaboration you've been accepted for."
            action={
              <Link to="/creator/applications" className="text-sm link-accent inline-flex items-center gap-1">
                All applications <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          />
          {accepted.length === 0 ? (
            <div className="card p-10 mt-5 text-center">
              <ListChecks className="w-8 h-8 text-ink-300 mx-auto mb-3" />
              <div className="text-sm font-semibold text-ink-900">No active collaborations</div>
              <div className="text-xs text-ink-500 mt-1">When a brand accepts you, it'll show up here.</div>
            </div>
          ) : (
            <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 stagger">
              {accepted.slice(0, 4).map((p) => (
                <li key={p.id}>
                  <Link to={`/creator/applications/${p.id}`} className="card card-hover p-4 sm:p-5 group block h-full">
                    <div className="flex items-start gap-3">
                      <ChannelArt name={p.brandName} seed={p.brandId} height={48} className="w-12 rounded-md shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs text-ink-500 truncate">{p.brandName}</div>
                        <div className="font-semibold text-ink-900 line-clamp-2 leading-snug">{p.campaignTitle}</div>
                        <div className="mt-2 text-xs text-ink-500">Proposed {currency(p.proposedRate)}</div>
                      </div>
                      <ProposalStatusBadge status={p.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <SectionHeader
            eyebrow="Applications"
            title="My proposals"
            action={
              <Link to="/creator/applications" className="text-sm link-accent inline-flex items-center gap-1">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          />
          {myProposals.length === 0 ? (
            <div className="card p-10 mt-5 text-center">
              <ListChecks className="w-8 h-8 text-ink-300 mx-auto mb-3" />
              <div className="text-sm font-semibold text-ink-900">No proposals yet</div>
              <div className="text-xs text-ink-500 mt-1">When you apply to a brief, it shows up here.</div>
              <Link to="/creator/campaigns" className="btn btn-primary btn-sm mt-4">
                Find work <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="card mt-5 overflow-hidden">
              {/* Mobile card view */}
              <div className="sm:hidden divide-y divide-ink-200/60">
                {myProposals.slice(0, 6).map((p) => (
                  <Link
                    key={p.id}
                    to={`/creator/applications/${p.id}`}
                    className="p-4 block hover:bg-paper-100/60 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-ink-900 line-clamp-1">{p.campaignTitle}</div>
                        <div className="text-xs text-ink-500 mt-0.5">{p.brandName}</div>
                      </div>
                      <ProposalStatusBadge status={p.status} />
                    </div>
                    <div className="mt-2.5 flex items-center justify-between text-xs">
                      <span className="text-ink-500">{fmtRelativeTime(p.submittedAt)}</span>
                      <span className="font-mono font-semibold text-ink-900">{currency(p.proposedRate)}</span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Tablet/desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="table-quiet min-w-[600px]">
                  <thead>
                    <tr>
                      <th>Campaign</th>
                      <th>Submitted</th>
                      <th>Rate</th>
                      <th className="text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myProposals.slice(0, 6).map((p) => (
                      <tr key={p.id}>
                        <td>
                          <Link
                            to={`/creator/applications/${p.id}`}
                            className="font-semibold text-ink-900 hover:text-ember-600 transition-colors line-clamp-1"
                          >
                            {p.campaignTitle}
                          </Link>
                          <div className="text-xs text-ink-500">{p.brandName}</div>
                        </td>
                        <td className="text-ink-500 whitespace-nowrap">{fmtRelativeTime(p.submittedAt)}</td>
                        <td className="text-ink-700 font-mono whitespace-nowrap">{currency(p.proposedRate)}</td>
                        <td className="text-right"><ProposalStatusBadge status={p.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Cell({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="bg-paper-50 py-2 px-1.5 sm:px-3 text-center min-w-0 overflow-hidden">
      <div className="eyebrow !text-[9px] truncate">{label}</div>
      <div className="num-display text-xs sm:text-sm mt-0.5 truncate">
        {value}
        {hint && <span className="text-[10px] text-ink-500 font-sans font-normal ml-0.5 sm:ml-1 hidden sm:inline">{hint}</span>}
      </div>
    </div>
  );
}
