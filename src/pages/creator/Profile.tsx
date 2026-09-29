import { Link } from 'react-router-dom';
import { Pencil, ExternalLink } from 'lucide-react';
import { useStore, profileCompletion } from '../../state/Store';
import { VerifiedBadge } from '../../components/ui';
import { fmtNumber, fmtRelativeTime, currency } from '../../data/seed';

export default function CreatorProfile() {
  const { creator, connectedAccounts } = useStore();
  const yt = connectedAccounts.find((a) => a.platform === 'YouTube');
  const completion = profileCompletion(creator);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">My profile</h1>
          <p className="text-sm text-ink-500">This is what brands see when they find you.</p>
        </div>
        <Link to="/creator/profile/edit" className="btn btn-secondary btn-md">
          <Pencil className="w-4 h-4" /> Edit profile
        </Link>
      </div>

      {/* Header */}
      <div className="card overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-brand-100 to-brand-50" />
        <div className="px-5 pb-5 -mt-10 flex items-end gap-4">
          <div className="w-20 h-20 rounded-xl bg-white border-4 border-white shadow-card flex items-center justify-center text-2xl font-bold text-brand-700">
            {creator.fullName.split(' ').map((s) => s[0]).slice(0, 2).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-ink-900 truncate">{creator.fullName}</h2>
              <VerifiedBadge verified={creator.verified} />
            </div>
            <div className="text-sm text-ink-500 truncate">
              {creator.niche} · {creator.primaryPlatform} · {creator.location}
            </div>
          </div>
        </div>
        <div className="px-5 pb-5">
          <div className="flex items-center justify-between text-xs text-ink-500 mb-1.5">
            <span>Profile completion</span>
            <span className="font-semibold text-ink-700">{completion}%</span>
          </div>
          <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
            <div className="h-full bg-brand-500" style={{ width: completion + '%' }} />
          </div>
        </div>
      </div>

      {/* About */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-ink-900">About</h3>
        <p className="text-sm text-ink-700 mt-2 leading-relaxed">{creator.bio || 'Tell brands about yourself and the kind of work you love.'}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Followers" value={fmtNumber(creator.followers)} sub={yt ? `via YouTube · synced ${fmtRelativeTime(yt.lastSyncedAt)}` : 'manually entered'} />
        <Stat label="Engagement" value={creator.engagementRate + '%'} />
        <Stat label="Rate / post" value={currency(creator.ratePerPost)} />
        <Stat label="Rate / video" value={currency(creator.ratePerVideo)} />
      </div>

      {/* Rates */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-ink-900 mb-3">Rates</h3>
        <div className="grid grid-cols-3 gap-3">
          <RateCard label="Post" value={currency(creator.ratePerPost)} />
          <RateCard label="Story" value={currency(creator.ratePerStory)} />
          <RateCard label="Video" value={currency(creator.ratePerVideo)} />
        </div>
      </div>

      {/* Connected account */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-ink-900 mb-3">Connected account</h3>
        {yt ? (
          <div className="flex items-center justify-between p-3 border border-ink-200 rounded-lg">
            <div>
              <div className="text-sm font-semibold text-ink-900">YouTube · @{yt.handle}</div>
              <div className="text-xs text-ink-500">Last synced {fmtRelativeTime(yt.lastSyncedAt)}</div>
            </div>
            <VerifiedBadge verified={yt.verified} />
          </div>
        ) : (
          <div className="text-sm text-ink-500">No YouTube account connected yet.</div>
        )}
        <Link to="/creator/accounts" className="btn btn-secondary btn-sm mt-3">Manage connected accounts</Link>
      </div>

      {/* Portfolio */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-ink-900 mb-3">Portfolio</h3>
        {creator.portfolio.length === 0 ? (
          <p className="text-sm text-ink-500">No portfolio links yet. Add up to 3 to strengthen your proposals.</p>
        ) : (
          <ul className="space-y-2">
            {creator.portfolio.map((p) => (
              <li key={p.id}>
                <a href={p.url} target="_blank" rel="noreferrer noopener" className="flex items-center gap-2 text-sm text-brand-600 hover:underline">
                  <ExternalLink className="w-4 h-4" />
                  {p.title || p.url}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-ink-500">{label}</div>
      <div className="text-xl font-bold text-ink-900 mt-1">{value}</div>
      {sub && <div className="text-xs text-ink-500 mt-1">{sub}</div>}
    </div>
  );
}

function RateCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg border border-ink-200">
      <div className="text-xs text-ink-500">{label}</div>
      <div className="text-lg font-semibold text-ink-900 mt-1">{value}</div>
    </div>
  );
}