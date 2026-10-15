import { Link } from 'react-router-dom';
import {
  Megaphone, ArrowRight, FileText, CheckCircle2, XCircle, Clock, Plus, Inbox,
  Users, Building2,
} from 'lucide-react';
import { useStore } from '../../state/Store';
import {
  CampaignStatusBadge, ProposalStatusBadge, PageHeader, SectionHeader,
  ChannelArt, StatRow, EmptyState, Button, Avatar, ActionListItem,
} from '../../components/ui';
import { fmtRelativeTime, currency } from '../../data/seed';

export default function BrandDashboard() {
  const { brand, campaigns, proposals } = useStore();
  const mine = campaigns.filter((c) => c.brandId === brand.id);
  const myProposals = proposals.filter((p) => mine.some((c) => c.id === p.campaignId));
  const active = mine.filter((c) => c.status === 'published');

  const counts = {
    drafts: mine.filter((c) => c.status === 'draft').length,
    published: active.length,
    closed: mine.filter((c) => c.status === 'closed').length,
    newProposals: myProposals.filter((p) => p.status === 'pending').length,
    shortlist: myProposals.filter((p) => p.status === 'shortlisted').length,
  };

  const acceptedTotal = myProposals.filter((p) => p.status === 'accepted').length;
  const slotsTotal = active.reduce((s, c) => s + c.creatorsNeeded, 0);
  const fillRate = slotsTotal > 0 ? Math.round((acceptedTotal / slotsTotal) * 100) : 0;

  const latestProposals = myProposals.slice(0, 5);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Today"
        title={brand.companyName}
        description="A focused view of what needs attention. Newest first."
        action={
          <Link to="/brand/campaigns/create" className="btn btn-primary btn-md">
            <Plus className="w-4 h-4" /> New campaign
          </Link>
        }
      />

      {/* Action-first summary */}
      <div className="grid lg:grid-cols-2 gap-5">
        <article className="card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="eyebrow">Needs review</div>
              <div className="mt-1.5 font-display text-xl text-ink-900 tracking-[-0.01em]">
                {counts.newProposals + counts.shortlist} proposal{counts.newProposals + counts.shortlist === 1 ? '' : 's'}
              </div>
              <div className="text-xs text-ink-500 mt-1">
                {counts.newProposals} new · {counts.shortlist} shortlisted
              </div>
            </div>
            <Inbox className="w-5 h-5 text-ember-500" />
          </div>
          <Link to="/brand/campaigns" className="btn btn-secondary btn-sm mt-4">
            Review proposals <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </article>

        <article className="card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="eyebrow">Active campaign fill rate</div>
              <div className="mt-1.5 font-display text-xl text-ink-900 tracking-[-0.01em]">
                {fillRate}%
              </div>
              <div className="text-xs text-ink-500 mt-1">
                {acceptedTotal} of {slotsTotal} creator slots filled
              </div>
            </div>
            <Users className="w-5 h-5 text-sky-700" />
          </div>
          <div className="mt-4 h-1.5 bg-paper-100 rounded-sm overflow-hidden">
            <div
              className="h-full bg-ink-900"
              style={{ width: fillRate + '%' }}
            />
          </div>
        </article>
      </div>

      <StatRow
        items={[
          { label: 'Drafts', value: counts.drafts, hint: 'not live' },
          { label: 'Published', value: counts.published, hint: 'accepting' },
          { label: 'Closed', value: counts.closed, hint: 'wrapped up' },
          { label: 'New proposals', value: counts.newProposals, hint: 'awaiting review' },
        ]}
      />

      {/* Up next — most important list */}
      <section>
        <SectionHeader
          eyebrow="Up next"
          title="Active campaigns"
          description="Each row shows how full the roster is. Click to manage proposals."
          action={
            <Link to="/brand/campaigns" className="text-sm link-accent inline-flex items-center gap-1">
              All campaigns <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        />
        {active.length === 0 ? (
          <div className="card p-10 mt-5 text-center">
            <Megaphone className="w-8 h-8 text-ink-300 mx-auto mb-3" />
            <div className="text-sm font-semibold text-ink-900">No active campaigns</div>
            <div className="text-xs text-ink-500 mt-1">Publish a campaign to start receiving proposals.</div>
            <Link to="/brand/campaigns/create" className="btn btn-primary btn-sm mt-4">
              <Plus className="w-3.5 h-3.5" /> New campaign
            </Link>
          </div>
        ) : (
          <ul className="mt-5 grid sm:grid-cols-2 gap-3 stagger">
            {active.slice(0, 4).map((c) => {
              const accepted = myProposals.filter((p) => p.campaignId === c.id && p.status === 'accepted').length;
              const total = myProposals.filter((p) => p.campaignId === c.id).length;
              const pending = myProposals.filter((p) => p.campaignId === c.id && p.status === 'pending').length;
              const fill = c.creatorsNeeded > 0 ? Math.round((accepted / c.creatorsNeeded) * 100) : 0;
              return (
                <li key={c.id}>
                  <Link
                    to={`/brand/campaigns/${c.id}/proposals`}
                    className="card card-hover p-4 sm:p-5 group block h-full"
                  >
                    <div className="flex items-start gap-3">
                      <ChannelArt name={c.title} seed={c.id} height={48} className="w-12 rounded-md shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-ink-500">{c.category} · {c.requiredPlatform}</div>
                        <div className="font-semibold text-ink-900 leading-snug line-clamp-2">{c.title}</div>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-px border border-ink-200 bg-ink-200 rounded-md overflow-hidden">
                      <Cell label="Accepted" value={`${accepted} / ${c.creatorsNeeded}`} />
                      <Cell label="Proposals" value={String(total)} />
                      <Cell label="New" value={String(pending)} />
                    </div>
                    <div className="mt-3 h-1.5 bg-paper-100 rounded-sm overflow-hidden">
                      <div className="h-full bg-ink-900" style={{ width: fill + '%' }} />
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <CampaignStatusBadge status={c.status} />
                      <span className="text-[11px] font-mono uppercase tracking-[0.12em] text-ink-500">
                        {fill}% filled
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Latest proposals */}
      <section>
        <SectionHeader
          eyebrow="Inbox"
          title="Latest proposals"
          description="Newest applications across your campaigns."
          action={
            <Link to="/brand/campaigns" className="text-sm link-accent inline-flex items-center gap-1">
              Manage all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        />
        {latestProposals.length === 0 ? (
          <div className="card p-10 mt-5 text-center">
            <Inbox className="w-8 h-8 text-ink-300 mx-auto mb-3" />
            <div className="text-sm font-semibold text-ink-900">No proposals yet</div>
            <div className="text-xs text-ink-500 mt-1">Publish a campaign to start receiving them.</div>
          </div>
        ) : (
          <ul className="mt-5 card divide-y divide-ink-200/60 stagger">
            {latestProposals.map((p) => {
              const c = mine.find((x) => x.id === p.campaignId);
              return (
                <li key={p.id}>
                  <ActionListItem
                    icon={<Avatar name={p.creatorName} size="sm" tone="ink" />}
                    title={p.creatorName}
                    hint={`applied to “${c?.title}” · ${fmtRelativeTime(p.submittedAt)}`}
                    right={<ProposalStatusBadge status={p.status} />}
                    to={`/brand/campaigns/${p.campaignId}/proposals`}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-paper-50 py-2 px-3 text-center">
      <div className="eyebrow !text-[9px]">{label}</div>
      <div className="num-display text-sm mt-0.5">{value}</div>
    </div>
  );
}
