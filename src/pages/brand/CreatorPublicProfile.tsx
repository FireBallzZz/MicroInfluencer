import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, MapPin } from 'lucide-react';
import { discoverableCreators } from '../../data/seed';
import { Button, VerifiedBadge } from '../../components/ui';
import { fmtNumber, currency } from '../../data/seed';

export default function CreatorPublicProfile() {
  const { id } = useParams();
  const creator = discoverableCreators.find((c) => c.id === id);

  if (!creator) return <div className="card p-6">Creator not found.</div>;

  return (
    <div className="space-y-5 max-w-3xl">
      <Link to="/brand/creators" className="text-sm text-ink-600 hover:text-ink-900 inline-flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to search
      </Link>

      <div className="card overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-brand-100 to-brand-50" />
        <div className="px-6 pb-6 -mt-12">
          <div className="flex items-end gap-4">
            <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-card flex items-center justify-center text-3xl font-bold text-brand-700">
              {creator.fullName.split(' ').map((s) => s[0]).slice(0, 2).join('')}
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-ink-900">{creator.fullName}</h1>
                <VerifiedBadge verified={creator.verified} />
              </div>
              <div className="text-sm text-ink-500 mt-0.5">{creator.niche} · {creator.primaryPlatform}</div>
              <div className="text-xs text-ink-500 mt-1 inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {creator.location}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-sm font-semibold text-ink-900 mb-2">About</h2>
        <p className="text-sm text-ink-700 leading-relaxed">{creator.bio}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Followers" value={fmtNumber(creator.followers)} />
        <Stat label="Engagement" value={creator.engagementRate + '%'} />
        <Stat label="Rate / post" value={currency(creator.ratePerPost)} />
        <Stat label="Rate / video" value={currency(creator.ratePerVideo)} />
      </div>

      <div className="card p-6">
        <h2 className="text-sm font-semibold text-ink-900 mb-3">Portfolio</h2>
        {creator.portfolio.length === 0 ? (
          <p className="text-sm text-ink-500">No portfolio links added yet.</p>
        ) : (
          <ul className="space-y-2">
            {creator.portfolio.map((p) => (
              <li key={p.id}>
                <a href={p.url} target="_blank" rel="noreferrer noopener" className="text-sm text-brand-600 hover:underline inline-flex items-center gap-1">
                  <ExternalLink className="w-4 h-4" /> {p.title || p.url}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card p-6">
        <h2 className="text-sm font-semibold text-ink-900 mb-3">Verification</h2>
        <div className="text-sm text-ink-700">
          {creator.verified
            ? 'This creator’s audience stats are verified through YouTube.'
            : 'Stats on this profile are manually entered by the creator and have not been verified.'}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-ink-500">{label}</div>
      <div className="text-xl font-bold text-ink-900 mt-1">{value}</div>
    </div>
  );
}