import { Link } from 'react-router-dom';
import {
  TrendingUp,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Youtube,
  AlertTriangle,
  Megaphone,
} from 'lucide-react';
import { useStore, profileCompletion } from '../../state/Store';
import { fmtDate, fmtNumber, fmtRelativeTime, currency } from '../../data/seed';
import { useAuth } from '../../state/AuthContext';

export default function CreatorDashboard() {
  const { user } = useAuth();
  const { creator, campaigns, proposals, connectedAccounts } = useStore();

  const yt = connectedAccounts.find((a) => a.platform === 'YouTube');
  const completion = profileCompletion(creator);
  const latestPublished = campaigns.filter((c) => c.status === 'published').slice(0, 5);

  const myProposals = proposals.filter((p) => p.creatorId === creator.id);
  const accepted = myProposals.filter((p) => p.status === 'accepted');
  const counts = {
    pending: myProposals.filter((p) => p.status === 'pending').length,
    shortlisted: myProposals.filter((p) => p.status === 'shortlisted').length,
    accepted: accepted.length,
    rejected: myProposals.filter((p) => p.status === 'rejected').length,
    withdrawn: myProposals.filter((p) => p.status === 'withdrawn').length,
  };

  const proposalsSent = myProposals.length;
  const acceptanceRate = proposalsSent > 0 ? Math.round((accepted.length / proposalsSent) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Welcome back, {user?.fullName.split(' ')[0]}.</h1>
          <p className="text-sm text-ink-500">Here’s what’s happening with your work today.</p>
        </div>
        <Link to="/creator/campaigns" className="btn btn-primary btn-md hidden sm:inline-flex">
          Find jobs <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Top row: profile + youtube */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="card p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-semibold text-ink-900">Profile completion</div>
              <div className="text-xs text-ink-500 mt-0.5">
                {completion === 100 ? 'Your profile is complete!' : `Your profile is ${completion}% complete`}
              </div>
            </div>
            <Sparkles className="w-5 h-5 text-brand-600" />
          </div>
          <div className="mt-4 h-2 bg-ink-100 rounded-full overflow-hidden">
            <div className="h-full bg-brand-500 transition-all" style={{ width: completion + '%' }} />
          </div>
          {completion < 100 && (
            <Link to="/creator/profile/edit" className="btn btn-secondary btn-sm mt-4">Complete your profile</Link>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-semibold text-ink-900">YouTube connection</div>
              {yt ? (
                <div className="text-xs text-ink-500 mt-0.5">
                  @{yt.handle} · last synced {fmtRelativeTime(yt.lastSyncedAt)}
                </div>
              ) : (
                <div className="text-xs text-ink-500 mt-0.5">Not connected yet</div>
              )}
            </div>
            <Youtube className="w-5 h-5 text-rose-600" />
          </div>
          <div className="mt-4 flex items-center gap-2">
            {yt?.status === 'connected' && (
              <>
                <span className="badge badge-teal"><CheckCircle2 className="w-3 h-3" /> Verified</span>
                <span className="text-xs text-ink-500">{fmtNumber(creator.followers)} followers · {creator.engagementRate}% engagement</span>
              </>
            )}
            {yt?.status === 'expired' && (
              <>
                <span className="badge badge-amber"><AlertTriangle className="w-3 h-3" /> Reconnect needed</span>
              </>
            )}
            {!yt && <span className="badge badge-amber">Unverified</span>}
          </div>
          <Link to="/creator/accounts" className="btn btn-secondary btn-sm mt-4">
            {yt ? 'Manage connection' : 'Connect YouTube'}
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Proposals sent" value={proposalsSent} icon={<Megaphone className="w-4 h-4" />} />
        <StatCard label="Acceptance rate" value={acceptanceRate + '%'} icon={<TrendingUp className="w-4 h-4" />} />
        <StatCard label="Pending" value={counts.pending} icon={<span className="w-2 h-2 rounded-full bg-amber-500" />} />
        <StatCard label="Accepted" value={counts.accepted} icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />} />
      </div>

      {/* Latest campaigns */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-ink-900">Latest campaigns for you</h2>
          <Link to="/creator/campaigns" className="text-sm text-brand-600 hover:underline">See all</Link>
        </div>
        {latestPublished.length === 0 ? (
          <div className="text-sm text-ink-500 py-6 text-center">No campaigns available right now. Check back soon.</div>
        ) : (
          <div className="grid gap-3">
            {latestPublished.map((c) => {
              const eligible =
                c.requiredPlatform === creator.primaryPlatform &&
                (!c.minFollowers || creator.followers >= c.minFollowers);
              return (
                <Link key={c.id} to={`/creator/campaigns/${c.id}`} className="p-3 -m-1 rounded-lg hover:bg-ink-50 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-ink-900 truncate">{c.title}</div>
                    <div className="text-xs text-ink-500 truncate">{c.brandName} · {c.category} · {c.requiredPlatform}</div>
                  </div>
                  <div className="hidden sm:flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-semibold text-ink-900">{currency(c.budgetPerCreator)}</div>
                      <div className="text-xs text-ink-500">/ creator</div>
                    </div>
                    <span className={`badge ${eligible ? 'badge-green' : 'badge-amber'}`}>{eligible ? 'Eligible' : 'Check fit'}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* My applications + accepted highlight */}
      <div className="grid md:grid-cols-3 gap-5">
        <div className="card p-5 md:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-ink-900">My applications</h2>
            <Link to="/creator/applications" className="text-sm text-brand-600 hover:underline">View all</Link>
          </div>
          {myProposals.length === 0 ? (
            <div className="text-sm text-ink-500 py-6 text-center">You haven’t applied to any campaigns yet.</div>
          ) : (
            <div className="divide-y divide-ink-100">
              {myProposals.slice(0, 5).map((p) => {
                const c = campaigns.find((x) => x.id === p.campaignId);
                return (
                  <Link key={p.id} to={`/creator/applications/${p.id}`} className="py-3 flex items-center gap-3 hover:bg-ink-50 -mx-2 px-2 rounded">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-ink-900 truncate">{c?.title ?? 'Campaign'}</div>
                      <div className="text-xs text-ink-500">Submitted {fmtRelativeTime(p.submittedAt)}</div>
                    </div>
                    <span className={`badge ${
                      p.status === 'pending' ? 'badge-amber' :
                      p.status === 'shortlisted' ? 'badge-blue' :
                      p.status === 'accepted' ? 'badge-green' :
                      p.status === 'rejected' ? 'badge-rose' :
                      'badge-gray'
                    }`}>{p.status[0].toUpperCase() + p.status.slice(1)}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        <div className="card p-5 bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-semibold text-ink-900">Accepted</h2>
          </div>
          {accepted.length === 0 ? (
            <p className="text-sm text-ink-500 mt-2">No accepted campaigns yet. Keep applying!</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {accepted.map((p) => {
                const c = campaigns.find((x) => x.id === p.campaignId);
                return (
                  <li key={p.id} className="text-sm">
                    <Link to={`/creator/applications/${p.id}`} className="font-medium text-ink-900 hover:underline">
                      {c?.title}
                    </Link>
                    <div className="text-xs text-ink-500">Due {c ? fmtDate(c.applicationDeadline) : ''}</div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-1.5 text-xs text-ink-500">{icon} {label}</div>
      <div className="mt-1 text-2xl font-bold text-ink-900">{value}</div>
    </div>
  );
}