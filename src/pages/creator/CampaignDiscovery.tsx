import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../../state/Store';
import { CampaignCard } from '../../components/CampaignCard';
import { EmptyState, Input, Select, Button } from '../../components/ui';
import { NICHES, PLATFORMS } from '../../data/seed';
import { Search, X } from 'lucide-react';

export default function CampaignDiscovery() {
  const { campaigns, creator } = useStore();
  const [params, setParams] = useSearchParams();
  const [keyword, setKeyword] = useState(params.get('q') ?? '');
  const [niche, setNiche] = useState<string>('');
  const [platform, setPlatform] = useState<string>('');
  const [minBudget, setMinBudget] = useState('');
  const [deadline, setDeadline] = useState('');

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

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Find work</h1>
        <p className="text-sm text-ink-500">Campaigns you’re eligible for appear first.</p>
      </div>

      <div className="card p-4">
        <div className="grid sm:grid-cols-5 gap-3">
          <div className="sm:col-span-2">
            <div className="relative">
              <Search className="w-4 h-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input className="pl-9" placeholder="Search by title, brand…" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
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
          <div className="flex gap-2">
            <Input type="number" placeholder="Min $ budget" value={minBudget} onChange={(e) => setMinBudget(e.target.value)} />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs text-ink-500">{filtered.length} campaigns found</div>
          <button onClick={reset} className="text-xs text-ink-600 hover:text-ink-900 flex items-center gap-1">
            <X className="w-3.5 h-3.5" /> Clear filters
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            title="No campaigns match your filters"
            description="Try clearing filters or broadening your search."
            action={<Button variant="secondary" onClick={reset}>Clear filters</Button>}
          />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((c) => {
            const platformOk = c.requiredPlatform === creator.primaryPlatform;
            const followersOk = !c.minFollowers || creator.followers >= c.minFollowers;
            const eligible = platformOk && followersOk;
            const reason = !platformOk
              ? `Requires ${c.requiredPlatform}`
              : !followersOk
              ? `Needs ${c.minFollowers?.toLocaleString()}+ followers`
              : undefined;
            return (
              <CampaignCard
                key={c.id}
                campaign={c}
                to={`/creator/campaigns/${c.id}`}
                eligibility={{ eligible, reason }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}