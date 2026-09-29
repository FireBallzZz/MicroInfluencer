import { Link } from 'react-router-dom';
import {
  Megaphone,
  Users,
  CheckCircle2,
  FileText,
  ArrowRight,
  Clock,
  XCircle,
} from 'lucide-react';
import { useStore } from '../../state/Store';
import { CampaignStatusBadge, ProposalStatusBadge } from '../../components/ui';
import { fmtRelativeTime, currency } from '../../data/seed';

export default function BrandDashboard() {
  const { brand, campaigns, proposals } = useStore();
  const mine = campaigns.filter((c) => c.brandId === brand.id);
  const myProposals = proposals.filter((p) => mine.some((c) => c.id === p.campaignId));

  const counts = {
    drafts: mine.filter((c) => c.status === 'draft').length,
    published: mine.filter((c) => c.status === 'published').length,
    closed: mine.filter((c) => c.status === 'closed').length,
    newProposals: myProposals.filter((p) => p.status === 'pending').length,
  };

  const latestProposals = myProposals.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">{brand.companyName}</h1>
          <p className="text-sm text-ink-500">Your campaigns at a glance.</p>
        </div>
        <Link to="/brand/campaigns/create" className="btn btn-primary btn-md">
          <Megaphone className="w-4 h-4" /> New campaign
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Drafts" value={counts.drafts} icon={<FileText className="w-4 h-4" />} />
        <Stat label="Published" value={counts.published} icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />} />
        <Stat label="Closed" value={counts.closed} icon={<XCircle className="w-4 h-4 text-ink-500" />} />
        <Stat label="New proposals" value={counts.newProposals} icon={<Clock className="w-4 h-4 text-amber-500" />} />
      </div>

      {/* Active campaigns with progress */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-ink-900">Active campaigns</h2>
          <Link to="/brand/campaigns" className="text-sm text-brand-600 hover:underline">All campaigns</Link>
        </div>
        {mine.filter((c) => c.status !== 'closed').length === 0 ? (
          <div className="text-sm text-ink-500 py-6 text-center">No campaigns yet. Create your first one.</div>
        ) : (
          <div className="divide-y divide-ink-100">
            {mine.filter((c) => c.status !== 'closed').slice(0, 4).map((c) => {
              const accepted = myProposals.filter((p) => p.campaignId === c.id && p.status === 'accepted').length;
              const total = myProposals.filter((p) => p.campaignId === c.id).length;
              return (
                <Link key={c.id} to={`/brand/campaigns/${c.id}`} className="py-3 flex items-center gap-3 hover:bg-ink-50 -mx-2 px-2 rounded">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-ink-900 truncate">{c.title}</div>
                    <div className="text-xs text-ink-500">{c.category} · {c.requiredPlatform} · {currency(c.budgetPerCreator)} / creator</div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-semibold text-ink-900">{accepted} of {c.creatorsNeeded}</div>
                    <div className="text-xs text-ink-500">creators accepted · {total} proposals</div>
                  </div>
                  <CampaignStatusBadge status={c.status} />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Latest proposals */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-ink-900">Latest proposals</h2>
          <Link to="/brand/campaigns" className="text-sm text-brand-600 hover:underline">Manage proposals</Link>
        </div>
        {latestProposals.length === 0 ? (
          <div className="text-sm text-ink-500 py-6 text-center">No proposals yet.</div>
        ) : (
          <div className="divide-y divide-ink-100">
            {latestProposals.map((p) => {
              const c = mine.find((x) => x.id === p.campaignId);
              return (
                <Link key={p.id} to={`/brand/campaigns/${p.campaignId}/proposals`} className="py-3 flex items-center gap-3 hover:bg-ink-50 -mx-2 px-2 rounded">
                  <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center font-semibold text-sm shrink-0">
                    {p.creatorName.split(' ').map((s) => s[0]).slice(0, 2).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-ink-900 truncate">{p.creatorName}</div>
                    <div className="text-xs text-ink-500 truncate">applied to “{c?.title}” · {fmtRelativeTime(p.submittedAt)}</div>
                  </div>
                  <ProposalStatusBadge status={p.status} />
                  <ArrowRight className="w-4 h-4 text-ink-300" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-1.5 text-xs text-ink-500">{icon} {label}</div>
      <div className="mt-1 text-2xl font-bold text-ink-900">{value}</div>
    </div>
  );
}