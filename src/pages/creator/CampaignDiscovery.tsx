import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useStore } from '../../state/Store';
import { CampaignCard } from '../../components/CampaignCard';
import { EmptyState, Input, Select, Button, SectionHeader, PageHeader, EligibilityChip, ChannelArt, CampaignStatusBadge, PlatformIcon } from '../../components/ui';
import { NICHES, PLATFORMS, currency, fmtDate } from '../../data/seed';
import { Search, X, SlidersHorizontal, ArrowUpRight, Megaphone, Calendar, DollarSign, Layers, Sparkles } from 'lucide-react';

export default function CampaignDiscovery() {
  const { campaigns, creator } = useStore();
  const [params, setParams] = useSearchParams();
  const [keyword, setKeyword] = useState(params.get('q') ?? '');
  const [niche, setNiche] = useState<string>('');
  const [platform, setPlatform] = useState<string>('');
  const [minBudget, setMinBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const reset = () => {
    setKeyword(''); setNiche(''); setPlatform(''); setMinBudget(''); setDeadline('');
    setParams({});
  };

  const filtered = useMemo(() => {
    return campaigns
      .filter((c) => c.status === 'published')
      .filter((c) => {
        if (keyword && !`${c.title} ${c.brandName} ${c.description}`.toLowerCase().includes(keyword.toLowerCase())) return false;
        if (niche && c.category !== niche) return false;
        if (platform && c.requiredPlatform !== platform) return false;
        if (minBudget && c.budgetPerCreator < Number(minBudget)) return false;
        if (deadline && new Date(c.applicationDeadline) > new Date(deadline)) return false;
        return true;
      });
  }, [campaigns, keyword, niche, platform, minBudget, deadline]);

  // Sort eligible first.
  const sorted = useMemo(() => {
    const isEligible = (c: typeof campaigns[number]) =>
      c.requiredPlatform === creator.primaryPlatform &&
      (!c.minFollowers || creator.followers >= c.minFollowers);
    return [...filtered].sort((a, b) => (isEligible(b) ? 1 : 0) - (isEligible(a) ? 1 : 0));
  }, [filtered, creator]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Marketplace"
        title="Find work"
        description="Live briefs from demo brands. Campaigns you’re eligible for appear first."
      />

      <div className="card">
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              className="pl-10 h-11"
              placeholder="Search by title, brand, or keyword"
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
              variant={showFilters ? 'primary' : 'secondary'}
              onClick={() => setShowFilters((v) => !v)}
              aria-expanded={showFilters}
            >
              <SlidersHorizontal className="w-4 h-4" /> More filters
            </Button>
          </div>
          <Button
            variant={showFilters ? 'primary' : 'secondary'}
            onClick={() => setShowFilters((v) => !v)}
            className="sm:hidden"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </Button>
        </div>

        {showFilters && (
          <div className="border-t border-ink-200 p-4 sm:p-5 bg-paper-50 grid sm:grid-cols-3 gap-3 anim-fade-in">
            <FormField label="Min budget per creator">
              <div className="relative">
                <DollarSign className="w-4 h-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="number"
                  className="pl-9"
                  placeholder="500"
                  value={minBudget}
                  onChange={(e) => setMinBudget(e.target.value)}
                />
              </div>
            </FormField>
            <FormField label="Apply by">
              <div className="relative">
                <Calendar className="w-4 h-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="date"
                  className="pl-9"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
            </FormField>
            <div className="flex items-end">
              <Button variant="ghost" onClick={reset}>
                <X className="w-4 h-4" /> Clear all
              </Button>
            </div>
          </div>
        )}

        <div className="px-4 sm:px-5 py-2.5 border-t border-ink-200 flex items-center justify-between text-xs text-ink-500">
          <span>
            <span className="font-mono text-ink-900">{filtered.length}</span> live briefs
            {keyword || niche || platform || minBudget || deadline ? (
              <span className="text-ink-400"> · filtered</span>
            ) : null}
          </span>
          {sorted[0] && (
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-ember-500" />
              Eligible first
            </span>
          )}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Megaphone className="w-5 h-5" />}
            title="No live briefs match your filters"
            description="Try clearing filters or broadening your search. New briefs are added regularly."
            action={<Button variant="secondary" onClick={reset}>Clear filters</Button>}
          />
        </div>
      ) : (
        <ul className="grid md:grid-cols-2 gap-3 stagger">
          {sorted.map((c) => {
            const platformOk = c.requiredPlatform === creator.primaryPlatform;
            const followersOk = !c.minFollowers || creator.followers >= c.minFollowers;
            const eligible = platformOk && followersOk;
            const reason = !platformOk
              ? `Requires ${c.requiredPlatform}`
              : !followersOk
              ? `Needs ${c.minFollowers?.toLocaleString()}+ followers`
              : undefined;
            return (
              <li key={c.id}>
                <CampaignCard
                  campaign={c}
                  to={`/creator/campaigns/${c.id}`}
                  eligibility={{ eligible, reason }}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// Local form field (kept inline so this file doesn't depend on FormField
// having a particular implementation; same visual as the shared one).
import { Label } from '../../components/ui';
function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
