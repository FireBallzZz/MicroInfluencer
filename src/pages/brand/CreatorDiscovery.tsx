import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { searchCreators } from '../../state/Store';
import type { CreatorProfile } from '../../types';
import {
  EmptyState, Input, Select, Button, PageHeader, ChannelArt, PlatformIcon,
  VerifiedBadge, Label,
} from '../../components/ui';
import { NICHES, PLATFORMS, fmtNumber, currency } from '../../data/seed';
import { Search, X, SlidersHorizontal, MapPin, ArrowUpRight, Users } from 'lucide-react';

type Sort = 'relevance' | 'followers' | 'engagement' | 'rateLow' | 'rateHigh';

export default function CreatorDiscovery() {
  const [keyword, setKeyword] = useState('');
  const [niche, setNiche] = useState('');
  const [platform, setPlatform] = useState('');
  const [location, setLocation] = useState('');
  const [minFollowers, setMinFollowers] = useState('');
  const [maxFollowers, setMaxFollowers] = useState('');
  const [minEngagement, setMinEngagement] = useState('');
  const [minRate, setMinRate] = useState('');
  const [maxRate, setMaxRate] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sort, setSort] = useState<Sort>('relevance');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [results, setResults] = useState<CreatorProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const ordering =
      sort === 'followers' ? 'followers' :
      sort === 'engagement' ? 'engagement' :
      sort === 'rateLow' ? 'rate' :
      sort === 'rateHigh' ? '-rate' : '';
    searchCreators({
      q: keyword || undefined,
      niche: niche || undefined,
      platform: platform || undefined,
      location: location || undefined,
      minFollowers: minFollowers ? Number(minFollowers) : undefined,
      maxFollowers: maxFollowers ? Number(maxFollowers) : undefined,
      minEngagement: minEngagement ? Number(minEngagement) : undefined,
      minRate: minRate ? Number(minRate) : undefined,
      maxRate: maxRate ? Number(maxRate) : undefined,
      verifiedOnly,
      // Ordering is handled server-side when set.
      ...(ordering ? { ordering } : {}),
    })
      .then((list) => {
        if (cancelled) return;
        setResults(list);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message ?? 'Could not load creators.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [keyword, niche, platform, location, minFollowers, maxFollowers, minEngagement, minRate, maxRate, verifiedOnly, sort]);

  const sorted = useMemo(() => {
    // Server already returns ordered results when the user picked a sort;
    // this is the client-side fallback for "relevance" (default order = -followers).
    return [...results];
  }, [results]);

  const reset = () => {
    setKeyword(''); setNiche(''); setPlatform(''); setLocation('');
    setMinFollowers(''); setMaxFollowers(''); setMinEngagement('');
    setMinRate(''); setMaxRate('');
    setVerifiedOnly(false);
  };

  const hasFilters = !!(
    keyword || niche || platform || location ||
    minFollowers || maxFollowers || minEngagement ||
    minRate || maxRate || verifiedOnly
  );

  return (
    <div className="container-page py-6 sm:py-8 space-y-6">
      <PageHeader
        eyebrow="Marketplace"
        title="Find creators"
        description={
          loading
            ? 'Searching…'
            : `${sorted.length} creator${sorted.length === 1 ? '' : 's'}${hasFilters ? ' match your filters' : ' in the marketplace'}.`
        }
      />

      <div className="card">
        <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
            <Input
              className="pl-10 h-11 w-full"
              placeholder="Search by name, niche, location or bio"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <Select value={niche} onChange={(e) => setNiche(e.target.value)} className="w-40 h-11">
              <option value="">All niches</option>
              {NICHES.map((n) => <option key={n} value={n}>{n}</option>)}
            </Select>
            <Select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-40 h-11">
              <option value="">All platforms</option>
              {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
            </Select>
            <Button
              variant={showAdvanced ? 'primary' : 'secondary'}
              onClick={() => setShowAdvanced((v) => !v)}
              aria-expanded={showAdvanced}
              className="shrink-0 h-11"
            >
              <SlidersHorizontal className="w-4 h-4" /> More filters
            </Button>
          </div>
          <Button
            variant={showAdvanced ? 'primary' : 'secondary'}
            onClick={() => setShowAdvanced((v) => !v)}
            className="md:hidden w-full h-11"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </Button>
        </div>

        {showAdvanced && (
          <div className="border-t border-ink-200 p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 anim-fade-in bg-paper-50">
            <div className="md:hidden">
              <Field label="Niche">
                <Select value={niche} onChange={(e) => setNiche(e.target.value)}>
                  <option value="">All niches</option>
                  {NICHES.map((n) => <option key={n} value={n}>{n}</option>)}
                </Select>
              </Field>
            </div>
            <div className="md:hidden">
              <Field label="Platform">
                <Select value={platform} onChange={(e) => setPlatform(e.target.value)}>
                  <option value="">All platforms</option>
                  {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                </Select>
              </Field>
            </div>
            <Field label="Min followers">
              <Input type="number" placeholder="10,000" value={minFollowers} onChange={(e) => setMinFollowers(e.target.value)} />
            </Field>
            <Field label="Max followers">
              <Input type="number" placeholder="100,000" value={maxFollowers} onChange={(e) => setMaxFollowers(e.target.value)} />
            </Field>
            <Field label="Min engagement (%)">
              <Input type="number" step="0.1" placeholder="3" value={minEngagement} onChange={(e) => setMinEngagement(e.target.value)} />
            </Field>
            <Field label="Location">
              <Input placeholder="City or country" value={location} onChange={(e) => setLocation(e.target.value)} />
            </Field>
            <Field label="Min rate (USD)">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 text-sm">$</span>
                <Input type="number" min={0} className="pl-6" placeholder="200" value={minRate} onChange={(e) => setMinRate(e.target.value)} />
              </div>
            </Field>
            <Field label="Max rate (USD)">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 text-sm">$</span>
                <Input type="number" min={0} className="pl-6" placeholder="2000" value={maxRate} onChange={(e) => setMaxRate(e.target.value)} />
              </div>
            </Field>
            <label className="flex items-center gap-2 sm:col-span-2 lg:col-span-4 text-sm text-ink-700">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="w-4 h-4 accent-ink-900"
              />
              Verified creators only
            </label>
          </div>
        )}

        <div className="px-4 sm:px-5 py-2.5 border-t border-ink-200 flex flex-wrap items-center justify-between gap-2 sm:gap-3 text-xs text-ink-500">
          <span>
            <span className="font-mono text-ink-900">{sorted.length}</span> creators
            {hasFilters && <span className="text-ink-400"> · filtered</span>}
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="hidden sm:inline">Sort by</span>
            <Select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="h-8 py-0 text-xs w-full sm:w-auto sm:min-w-[140px]">
              <option value="relevance">Relevance</option>
              <option value="followers">Followers (high to low)</option>
              <option value="engagement">Engagement (high to low)</option>
              <option value="rateLow">Rate (low to high)</option>
              <option value="rateHigh">Rate (high to high)</option>
            </Select>
            {hasFilters && (
              <Button variant="ghost" size="xs" onClick={reset}>
                <X className="w-3.5 h-3.5" /> Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {error ? (
        <div className="card p-8 text-center text-sm text-rose-700">{error}</div>
      ) : sorted.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Users className="w-5 h-5" />}
            title={loading ? 'Searching…' : 'No creators match your filters'}
            description={loading ? 'Give it a moment.' : 'Try clearing filters or broadening your search.'}
            action={
              !loading ? (
                <Button variant="secondary" onClick={reset}>Clear filters</Button>
              ) : null
            }
          />
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 stagger">
          {sorted.map((c) => (
            <li key={c.id}>
              <Link
                to={`/brand/creators/${c.id}`}
                className="card card-hover p-4 sm:p-5 group block h-full"
              >
                <div className="flex items-start gap-3">
                  <ChannelArt name={c.fullName} seed={c.id} height={48} className="w-12 rounded-md shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-ink-900 truncate flex items-center gap-1.5">
                      {c.fullName}
                    </div>
                    <div className="text-xs text-ink-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <PlatformIcon platform={c.primaryPlatform} className="w-3 h-3" />
                      <span>{c.niche}</span>
                    </div>
                  </div>
                  <VerifiedBadge verified={c.verified} />
                </div>
                <p className="text-sm text-ink-500 mt-3 line-clamp-2 leading-relaxed min-h-[2.5em]">
                  {c.bio || <span className="italic text-ink-400">No bio yet.</span>}
                </p>
                <dl className="mt-4 grid grid-cols-3 gap-px bg-ink-200 border border-ink-200 rounded-md overflow-hidden">
                  <Stat label="Followers" value={fmtNumber(c.followers)} />
                  <Stat label="Engagement" value={c.engagementRate + '%'} />
                  <Stat label="Post rate" value={c.ratePerPost > 0 ? currency(c.ratePerPost) : '—'} />
                </dl>
                <div className="mt-3 flex items-center justify-end text-[11px] font-mono uppercase tracking-[0.12em] text-ink-500 group-hover:text-ink-900 transition-colors">
                  View profile
                  <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-paper-50 py-2 px-2 text-center min-w-0 overflow-hidden">
      <div className="eyebrow !text-[10px] truncate">{label}</div>
      <div className="num-display text-sm mt-0.5 truncate">{value}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
