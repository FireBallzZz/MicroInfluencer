import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { searchCreators } from '../../state/Store';
import {
  EmptyState, Input, Select, Button, PageHeader, Avatar, ChannelArt, PlatformIcon,
  VerifiedBadge, Label,
} from '../../components/ui';
import { NICHES, PLATFORMS, fmtNumber, currency } from '../../data/seed';
import { Search, X, SlidersHorizontal, MapPin, ArrowUpRight, Users } from 'lucide-react';

type Sort = 'relevance' | 'followers' | 'engagement' | 'rateLow' | 'rateHigh';

export default function CreatorDiscovery() {
  const [params, setParams] = useSearchParams();
  const [keyword, setKeyword] = useState(params.get('q') ?? '');
  const [niche, setNiche] = useState('');
  const [platform, setPlatform] = useState('');
  const [location, setLocation] = useState('');
  const [minFollowers, setMinFollowers] = useState('');
  const [maxFollowers, setMaxFollowers] = useState('');
  const [minEngagement, setMinEngagement] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sort, setSort] = useState<Sort>('relevance');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const results = useMemo(() => {
    const base = searchCreators({
      keyword: keyword || undefined,
      niche: niche || undefined,
      platform: platform || undefined,
      location: location || undefined,
      minFollowers: minFollowers ? Number(minFollowers) : undefined,
      maxFollowers: maxFollowers ? Number(maxFollowers) : undefined,
      minEngagement: minEngagement ? Number(minEngagement) : undefined,
    });
    const filtered = verifiedOnly ? base.filter((c) => c.verified) : base;
    const sorted = [...filtered];
    if (sort === 'followers')   sorted.sort((a, b) => b.followers - a.followers);
    if (sort === 'engagement')  sorted.sort((a, b) => b.engagementRate - a.engagementRate);
    if (sort === 'rateLow')     sorted.sort((a, b) => a.ratePerPost - b.ratePerPost);
    if (sort === 'rateHigh')    sorted.sort((a, b) => b.ratePerPost - a.ratePerPost);
    return sorted;
  }, [keyword, niche, platform, location, minFollowers, maxFollowers, minEngagement, verifiedOnly, sort]);

  const reset = () => {
    setKeyword(''); setNiche(''); setPlatform(''); setLocation('');
    setMinFollowers(''); setMaxFollowers(''); setMinEngagement('');
    setVerifiedOnly(false);
    setParams({});
  };

  const hasFilters = !!(
    keyword || niche || platform || location || minFollowers || maxFollowers || minEngagement || verifiedOnly
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Marketplace"
        title="Find creators"
        description={`${results.length} of ${NICHES.length}× platform filters · demo data only.`}
      />

      <div className="card">
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              className="pl-10 h-11"
              placeholder="Search by name, niche, location or bio"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <div className="hidden sm:flex gap-2">
            <Select value={niche} onChange={(e) => setNiche(e.target.value)} className="min-w-[160px]">
              <option value="">All niches</option>
              {NICHES.map((n) => <option key={n} value={n}>{n}</option>)}
            </Select>
            <Select value={platform} onChange={(e) => setPlatform(e.target.value)} className="min-w-[160px]">
              <option value="">All platforms</option>
              {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
            </Select>
            <Button
              variant={showAdvanced ? 'primary' : 'secondary'}
              onClick={() => setShowAdvanced((v) => !v)}
              aria-expanded={showAdvanced}
            >
              <SlidersHorizontal className="w-4 h-4" /> More filters
            </Button>
          </div>
          <Button
            variant={showAdvanced ? 'primary' : 'secondary'}
            onClick={() => setShowAdvanced((v) => !v)}
            className="sm:hidden"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </Button>
        </div>

        {showAdvanced && (
          <div className="border-t border-ink-200 p-4 sm:p-5 grid sm:grid-cols-4 gap-3 anim-fade-in bg-paper-50">
            <Field label="Location">
              <div className="relative">
                <MapPin className="w-4 h-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  className="pl-9"
                  placeholder="City or country"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </Field>
            <Field label="Min followers">
              <Input type="number" placeholder="10,000" value={minFollowers} onChange={(e) => setMinFollowers(e.target.value)} />
            </Field>
            <Field label="Max followers">
              <Input type="number" placeholder="100,000" value={maxFollowers} onChange={(e) => setMaxFollowers(e.target.value)} />
            </Field>
            <Field label="Min engagement (%)">
              <Input type="number" step="0.1" placeholder="3" value={minEngagement} onChange={(e) => setMinEngagement(e.target.value)} />
            </Field>
            <label className="flex items-center gap-2 sm:col-span-4 text-sm text-ink-700">
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

        <div className="px-4 sm:px-5 py-2.5 border-t border-ink-200 flex items-center justify-between gap-3 text-xs text-ink-500">
          <span>
            <span className="font-mono text-ink-900">{results.length}</span> creators
            {hasFilters && <span className="text-ink-400"> · filtered</span>}
          </span>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">Sort by</span>
            <Select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="h-8 py-0 text-xs min-w-[140px]">
              <option value="relevance">Relevance</option>
              <option value="followers">Followers (high to low)</option>
              <option value="engagement">Engagement (high to low)</option>
              <option value="rateLow">Rate (low to high)</option>
              <option value="rateHigh">Rate (high to low)</option>
            </Select>
            {hasFilters && (
              <Button variant="ghost" size="xs" onClick={reset}>
                <X className="w-3.5 h-3.5" /> Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Users className="w-5 h-5" />}
            title="No creators match your filters"
            description="Try clearing filters or broadening your search."
            action={<Button variant="secondary" onClick={reset}>Clear filters</Button>}
            hint="Demo only — search runs against the local seed data."
          />
        </div>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 stagger">
          {results.map((c) => (
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
                      <span className="text-ink-300">·</span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {c.location}
                      </span>
                    </div>
                  </div>
                  <VerifiedBadge verified={c.verified} />
                </div>
                <p className="text-sm text-ink-500 mt-3 line-clamp-2 leading-relaxed">{c.bio}</p>
                <dl className="mt-4 grid grid-cols-3 gap-px bg-ink-200 border border-ink-200 rounded-md overflow-hidden">
                  <Stat label="Followers" value={fmtNumber(c.followers)} />
                  <Stat label="Engagement" value={c.engagementRate + '%'} />
                  <Stat label="Post rate" value={currency(c.ratePerPost)} />
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
    <div className="bg-paper-50 py-2 px-2.5 text-center">
      <div className="eyebrow !text-[9px]">{label}</div>
      <div className="num-display text-sm mt-0.5">{value}</div>
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
