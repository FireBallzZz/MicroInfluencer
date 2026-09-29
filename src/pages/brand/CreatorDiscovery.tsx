import { Link } from 'react-router-dom';
import { Search, X, BadgeCheck, MapPin } from 'lucide-react';
import { searchCreators } from '../../state/Store';
import { EmptyState, Input, Select, Button, VerifiedBadge } from '../../components/ui';
import { NICHES, PLATFORMS, fmtNumber, currency } from '../../data/seed';
import { useState, useMemo } from 'react';

export default function CreatorDiscovery() {
  const [keyword, setKeyword] = useState('');
  const [niche, setNiche] = useState('');
  const [platform, setPlatform] = useState('');
  const [location, setLocation] = useState('');
  const [minFollowers, setMinFollowers] = useState('');
  const [minEngagement, setMinEngagement] = useState('');

  const results = useMemo(
    () =>
      searchCreators({
        keyword: keyword || undefined,
        niche: niche || undefined,
        platform: platform || undefined,
        location: location || undefined,
        minFollowers: minFollowers ? Number(minFollowers) : undefined,
        minEngagement: minEngagement ? Number(minEngagement) : undefined,
      }),
    [keyword, niche, platform, location, minFollowers, minEngagement]
  );

  const reset = () => {
    setKeyword(''); setNiche(''); setPlatform(''); setLocation(''); setMinFollowers(''); setMinEngagement('');
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Find creators</h1>
        <p className="text-sm text-ink-500">Search by niche, platform, audience size ' or just type a keyword.</p>
      </div>

      <div className="card p-4">
        <div className="grid sm:grid-cols-6 gap-3">
          <div className="sm:col-span-2">
            <div className="relative">
              <Search className="w-4 h-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input className="pl-9" placeholder="Search creators…" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
            </div>
          </div>
          <Select value={niche} onChange={(e) => setNiche(e.target.value)}>
            <option value="">All niches</option>
            {NICHES.map((n) => <option key={n} value={n}>{n}</option>)}
          </Select>
          <Select value={platform} onChange={(e) => setPlatform(e.target.value)}>
            <option value="">All platforms</option>
            {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
          </Select>
          <Input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
          <Input type="number" placeholder="Min followers" value={minFollowers} onChange={(e) => setMinFollowers(e.target.value)} />
        </div>
        <div className="mt-3 grid sm:grid-cols-6 gap-3">
          <Input className="sm:col-start-5" type="number" step="0.1" placeholder="Min engagement %" value={minEngagement} onChange={(e) => setMinEngagement(e.target.value)} />
          <div className="flex items-center justify-between sm:col-span-6 mt-1">
            <div className="text-xs text-ink-500">{results.length} creators found</div>
            <button onClick={reset} className="text-xs text-ink-600 hover:text-ink-900 inline-flex items-center gap-1">
              <X className="w-3.5 h-3.5" /> Clear filters
            </button>
          </div>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="card">
          <EmptyState
            title="No creators match your filters"
            description="Try clearing filters or broadening your search."
            action={<Button variant="secondary" onClick={reset}>Clear filters</Button>}
          />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((c) => (
            <Link
              key={c.id}
              to={`/brand/creators/${c.id}`}
              className="card p-5 hover:border-brand-300 hover:shadow-pop transition-all flex flex-col"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center font-semibold shrink-0">
                  {c.fullName.split(' ').map((s) => s[0]).slice(0, 2).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-ink-900 truncate">{c.fullName}</div>
                  </div>
                  <div className="text-xs text-ink-500 truncate">{c.niche} · {c.primaryPlatform}</div>
                </div>
                <VerifiedBadge verified={c.verified} />
              </div>
              <p className="text-sm text-ink-600 mt-3 line-clamp-2 leading-relaxed">{c.bio}</p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <Cell label="Followers" value={fmtNumber(c.followers)} />
                <Cell label="Engagement" value={c.engagementRate + '%'} />
                <Cell label="From" value={`$${c.ratePerPost}`} hint="/ post" />
              </div>
              <div className="mt-3 flex items-center text-xs text-ink-500">
                <MapPin className="w-3.5 h-3.5 mr-1" /> {c.location}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Cell({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-md bg-ink-50 py-2">
      <div className="text-[10px] uppercase tracking-wide text-ink-500">{label}</div>
      <div className="text-sm font-semibold text-ink-900">{value}{hint && <span className="text-[10px] text-ink-500 font-normal"> {hint}</span>}</div>
    </div>
  );
}