import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CampaignCard } from '../../components/CampaignCard';
import {
  EmptyState, Input, Button, PageHeader, EligibilityChip, PlatformIcon, SaveButton,
} from '../../components/ui';
import { Modal } from '../../components/Modal';
import { NICHES, PLATFORMS, currency, fmtDate } from '../../data/seed';
import {
  Search, X, SlidersHorizontal, Megaphone, Calendar, DollarSign, Sparkles,
  Compass, LayoutGrid, List, Flame, CheckCircle2, Bookmark,
  ArrowRight, Eye, ShieldCheck, RefreshCw, AlertCircle
} from 'lucide-react';
import { useStore, loadCreatorCampaigns, loadCreatorProfile } from '../../state/Store';
import { useToast } from '../../state/ToastContext';
import type { Campaign, Platform, Niche } from '../../types';

type CampaignFilters = {
  q: string;
  niche: string;
  platform: string;
  minBudget: string;
  deadlineBefore: string;
};

type TabFilter = 'all' | 'eligible' | 'expiring' | 'high_budget' | 'saved';
type SortOption = 'recommended' | 'budget_desc' | 'budget_asc' | 'deadline_asc' | 'newest';

export default function CampaignDiscovery() {
  const navigate = useNavigate();
  const { push } = useToast();
  const { campaigns, creator, loading, errors } = useStore();

  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [filters, setFilters] = useState<CampaignFilters>({
    q: '',
    niche: '',
    platform: '',
    minBudget: '',
    deadlineBefore: '',
  });
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [quickViewCampaign, setQuickViewCampaign] = useState<Campaign | null>(null);

  // Local storage for saved/bookmarked campaign IDs
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('microinf_saved_campaigns');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('microinf_saved_campaigns', JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      push(exists ? 'Brief removed from saved' : 'Brief saved to your bookmarks!', 'info');
      return next;
    });
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await Promise.all([loadCreatorCampaigns(), loadCreatorProfile()]);
      } catch {
        if (cancelled) return;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = () => {
    loadCreatorCampaigns({
      q: filters.q || undefined,
      niche: (filters.niche as Niche) || undefined,
      platform: (filters.platform as Platform) || undefined,
      minBudget: filters.minBudget ? Number(filters.minBudget) : undefined,
      deadlineBefore: filters.deadlineBefore || undefined,
    });
  };

  useEffect(() => {
    const id = setTimeout(refresh, 250);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.q, filters.niche, filters.platform, filters.minBudget, filters.deadlineBefore]);

  const resetFilters = () => {
    setFilters({ q: '', niche: '', platform: '', minBudget: '', deadlineBefore: '' });
    setActiveTab('all');
  };

  // Check creator eligibility for a given campaign
  const checkEligibility = (c: Campaign) => {
    const creatorPlatform = creator?.primaryPlatform?.toLowerCase();
    const reqPlatform = c.requiredPlatform?.toLowerCase();
    const platformOk = !reqPlatform || creatorPlatform === reqPlatform;
    const followersOk = !c.minFollowers || (creator?.followers ?? 0) >= c.minFollowers;
    const eligible = platformOk && followersOk;
    const reason = !platformOk
      ? `Requires ${c.requiredPlatform}`
      : !followersOk
        ? `Needs ${c.minFollowers?.toLocaleString()}+ followers`
        : undefined;
    return { eligible, reason, platformOk, followersOk };
  };

  // Filtered & Tab-matched Briefs
  const processedCampaigns = useMemo(() => {
    const published = campaigns.filter((c) => c.status === 'published');

    return published.filter((c) => {
      // Tab filter
      if (activeTab === 'eligible') {
        const { eligible } = checkEligibility(c);
        if (!eligible) return false;
      } else if (activeTab === 'expiring') {
        const diffDays = Math.ceil(
          (new Date(c.applicationDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        if (diffDays <= 0 || diffDays > 7) return false;
      } else if (activeTab === 'high_budget') {
        if (c.budgetPerCreator < 500) return false;
      } else if (activeTab === 'saved') {
        if (!savedIds.includes(c.id)) return false;
      }
      return true;
    });
  }, [campaigns, activeTab, creator, savedIds]);

  // Sorted Briefs
  const sortedCampaigns = useMemo(() => {
    const list = [...processedCampaigns];

    switch (sortBy) {
      case 'budget_desc':
        return list.sort((a, b) => b.budgetPerCreator - a.budgetPerCreator);
      case 'budget_asc':
        return list.sort((a, b) => a.budgetPerCreator - b.budgetPerCreator);
      case 'deadline_asc':
        return list.sort(
          (a, b) => new Date(a.applicationDeadline).getTime() - new Date(b.applicationDeadline).getTime()
        );
      case 'newest':
        return list.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'recommended':
      default:
        return list.sort((a, b) => {
          const aEl = checkEligibility(a).eligible ? 1 : 0;
          const bEl = checkEligibility(b).eligible ? 1 : 0;
          if (bEl !== aEl) return bEl - aEl;
          return b.budgetPerCreator - a.budgetPerCreator;
        });
    }
  }, [processedCampaigns, sortBy, creator]);

  const allPublished = campaigns.filter((c) => c.status === 'published');
  const eligibleCount = allPublished.filter((c) => checkEligibility(c).eligible).length;
  const expiringCount = allPublished.filter((c) => {
    const diff = Math.ceil((new Date(c.applicationDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff > 0 && diff <= 7;
  }).length;
  const highBudgetCount = allPublished.filter((c) => c.budgetPerCreator >= 500).length;
  const savedCount = allPublished.filter((c) => savedIds.includes(c.id)).length;

  const isFiltered = Boolean(
    filters.q || filters.niche || filters.platform || filters.minBudget || filters.deadlineBefore || activeTab !== 'all'
  );

  return (
    <div className="container-page py-6 sm:py-8 space-y-6">
      {/* Page Header */}
      <PageHeader
        eyebrow="Creator Marketplace"
        title="Find work"
        description="Browse open brand briefs, filter by your platform and rate, and apply to sponsorships that fit your audience."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={refresh}
              disabled={loading.creatorCampaigns}
              className="hidden sm:inline-flex"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading.creatorCampaigns ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <Link to="/creator/dashboard" className="btn btn-secondary btn-sm">
              <Compass className="w-3.5 h-3.5" /> Dashboard
            </Link>
          </div>
        }
      />

      {/* Creator Profile Fit Ribbon */}
      <div className="card p-4 sm:p-5 bg-gradient-to-r from-paper-50 via-paper-100/50 to-amber-50/40 border border-ink-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-ink-900 text-paper-50 flex items-center justify-center font-display font-bold text-base shrink-0 shadow-sm ring-2 ring-paper-100">
              {creator?.avatarUrl ? (
                <img src={creator.avatarUrl} alt={creator.fullName} className="w-full h-full rounded-xl object-cover" />
              ) : (
                (creator?.fullName || 'Creator').slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-ink-900 text-sm">{creator?.fullName || 'Your Profile'}</span>
                {creator?.primaryPlatform && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-700 bg-paper-200/80 px-2 py-0.5 rounded-full">
                    <PlatformIcon platform={creator.primaryPlatform} className="w-3 h-3" />
                    {creator.primaryPlatform}
                  </span>
                )}
                {creator?.verified && (
                  <span className="tag tag-emerald text-[10px]">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-ink-500 mt-0.5">
                {(creator?.followers ?? 0).toLocaleString()} reach ·
                <span className="text-emerald-700 font-semibold ml-1">
                  You qualify for {eligibleCount} of {allPublished.length} open briefs
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'eligible' ? 'all' : 'eligible')}
              className={`btn btn-xs sm:btn-sm transition-all ${
                activeTab === 'eligible'
                  ? 'btn-primary ring-2 ring-emerald-500 ring-offset-1'
                  : 'btn-secondary text-emerald-800 border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              {activeTab === 'eligible' ? 'Showing Qualified Only' : 'Show Only Briefs I Qualify For'}
            </button>
            <Link
              to="/creator/edit"
              className="btn btn-ghost btn-xs text-ink-600 hover:text-ink-900"
              title="Update your rates & platform handles"
            >
              Edit profile
            </Link>
          </div>
        </div>
      </div>

      {/* Main Filter & Navigation Hub */}
      <div className="card overflow-hidden space-y-4 p-4 sm:p-5">
        {/* Smart Filter Tabs */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-ink-150 -mx-4 sm:-mx-5 px-4 sm:px-5">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-ink-900 text-paper-50 shadow-xs'
                  : 'text-ink-600 hover:bg-paper-100 hover:text-ink-900'
              }`}
            >
              All Briefs
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'all' ? 'bg-ink-700 text-paper-100' : 'bg-paper-200 text-ink-600'
              }`}>
                {allPublished.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('eligible')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5 ${
                activeTab === 'eligible'
                  ? 'bg-emerald-700 text-paper-50 shadow-xs'
                  : 'text-ink-600 hover:bg-paper-100 hover:text-ink-900'
              }`}
            >
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Best Match
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'eligible' ? 'bg-emerald-900 text-emerald-100' : 'bg-paper-200 text-ink-600'
              }`}>
                {eligibleCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('expiring')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5 ${
                activeTab === 'expiring'
                  ? 'bg-rose-600 text-paper-50 shadow-xs'
                  : 'text-ink-600 hover:bg-paper-100 hover:text-ink-900'
              }`}
            >
              <Flame className="w-3 h-3 text-rose-300" />
              Expiring Soon
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'expiring' ? 'bg-rose-800 text-rose-100' : 'bg-paper-200 text-ink-600'
              }`}>
                {expiringCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('high_budget')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5 ${
                activeTab === 'high_budget'
                  ? 'bg-amber-600 text-paper-50 shadow-xs'
                  : 'text-ink-600 hover:bg-paper-100 hover:text-ink-900'
              }`}
            >
              <DollarSign className="w-3 h-3" />
              $500+ Payout
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'high_budget' ? 'bg-amber-800 text-amber-100' : 'bg-paper-200 text-ink-600'
              }`}>
                {highBudgetCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('saved')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5 ${
                activeTab === 'saved'
                  ? 'bg-ink-900 text-paper-50 shadow-xs'
                  : 'text-ink-600 hover:bg-paper-100 hover:text-ink-900'
              }`}
            >
              <Bookmark className={`w-3 h-3 ${savedCount > 0 ? 'fill-current' : ''}`} />
              Saved
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'saved' ? 'bg-ink-700 text-paper-100' : 'bg-paper-200 text-ink-600'
              }`}>
                {savedCount}
              </span>
            </button>
          </div>

          {/* View mode toggle */}
          <div className="hidden sm:flex items-center border border-ink-200 rounded-lg p-0.5 bg-paper-100 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-paper-50 text-ink-900 shadow-2xs' : 'text-ink-500 hover:text-ink-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-label="List view"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-paper-50 text-ink-900 shadow-2xs' : 'text-ink-500 hover:text-ink-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Search & Platform Filter Row */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              className="pl-10 pr-9 h-10 text-sm"
              placeholder="Search briefs by title, brand, or requirements…"
              value={filters.q}
              onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            />
            {filters.q && (
              <button
                type="button"
                onClick={() => setFilters({ ...filters, q: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Platform Quick Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setFilters({ ...filters, platform: '' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border shrink-0 transition-colors ${
                !filters.platform
                  ? 'bg-ink-900 text-paper-50 border-ink-900'
                  : 'bg-paper-50 text-ink-700 border-ink-200 hover:bg-paper-100'
              }`}
            >
              All Platforms
            </button>
            {PLATFORMS.map((p) => {
              const active = filters.platform.toLowerCase() === p.toLowerCase();
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFilters({ ...filters, platform: active ? '' : p })}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border shrink-0 inline-flex items-center gap-1.5 transition-colors ${
                    active
                      ? 'bg-ink-900 text-paper-50 border-ink-900'
                      : 'bg-paper-50 text-ink-700 border-ink-200 hover:bg-paper-100'
                  }`}
                >
                  <PlatformIcon platform={p} className="w-3.5 h-3.5" />
                  {p}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant={showAdvancedFilters ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setShowAdvancedFilters((v) => !v)}
              className="h-10 text-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {showAdvancedFilters ? 'Less' : 'Filters'}
            </Button>
          </div>
        </div>

        {/* Niche Category Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 scrollbar-none -mx-1 px-1">
          <span className="text-[11px] font-semibold text-ink-400 uppercase tracking-wider shrink-0 mr-1">
            Niche:
          </span>
          <button
            type="button"
            onClick={() => setFilters({ ...filters, niche: '' })}
            className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 transition-colors ${
              !filters.niche
                ? 'bg-ink-800 text-paper-50 shadow-2xs'
                : 'bg-paper-100 text-ink-600 hover:bg-paper-200'
            }`}
          >
            All
          </button>
          {NICHES.map((n) => {
            const active = filters.niche.toLowerCase() === n.toLowerCase();
            return (
              <button
                key={n}
                type="button"
                onClick={() => setFilters({ ...filters, niche: active ? '' : n })}
                className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 transition-colors ${
                  active
                    ? 'bg-ink-800 text-paper-50 shadow-2xs'
                    : 'bg-paper-100 text-ink-600 hover:bg-paper-200'
                }`}
              >
                {n}
              </button>
            );
          })}
        </div>

        {/* Advanced Filters Expandable Drawer */}
        {showAdvancedFilters && (
          <div className="border-t border-ink-200 pt-4 mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4 anim-fade-in bg-paper-100/40 p-4 rounded-xl">
            <div>
              <label className="text-xs font-semibold text-ink-700 block mb-1.5">
                Minimum Budget ($)
              </label>
              <div className="relative">
                <DollarSign className="w-3.5 h-3.5 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  type="number"
                  placeholder="e.g. 500"
                  className="pl-8 h-9 text-xs"
                  value={filters.minBudget}
                  onChange={(e) => setFilters({ ...filters, minBudget: e.target.value })}
                />
              </div>
              {/* Quick budget presets */}
              <div className="flex gap-1.5 mt-2">
                {['100', '250', '500', '1000'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setFilters({ ...filters, minBudget: filters.minBudget === preset ? '' : preset })}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                      filters.minBudget === preset
                        ? 'bg-ink-900 text-paper-50 border-ink-900'
                        : 'bg-paper-50 text-ink-600 border-ink-200 hover:bg-paper-100'
                    }`}
                  >
                    ${preset}+
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-700 block mb-1.5">
                Application Deadline Before
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  type="date"
                  className="pl-8 h-9 text-xs"
                  value={filters.deadlineBefore}
                  onChange={(e) => setFilters({ ...filters, deadlineBefore: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-700 block mb-1.5">
                Sort Results
              </label>
              <select
                className="input h-9 text-xs pr-8"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
              >
                <option value="recommended">Best Match (Eligible First)</option>
                <option value="budget_desc">Highest Budget First</option>
                <option value="budget_asc">Lowest Budget First</option>
                <option value="deadline_asc">Ending Soonest</option>
                <option value="newest">Newest Briefs</option>
              </select>
            </div>
          </div>
        )}

        {/* Active Filters & Match Count Summary */}
        <div className="pt-2 border-t border-ink-150 flex flex-wrap items-center justify-between text-xs text-ink-500 gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-ink-900">{sortedCampaigns.length}</span>
            <span>brief{sortedCampaigns.length === 1 ? '' : 's'} found</span>
            {activeTab !== 'all' && (
              <span className="inline-flex items-center gap-1 text-ink-600 bg-paper-100 px-2 py-0.5 rounded-full text-[11px]">
                Tab: <strong className="font-medium capitalize">{activeTab.replace('_', ' ')}</strong>
                <button type="button" onClick={() => setActiveTab('all')} className="hover:text-ink-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.platform && (
              <span className="inline-flex items-center gap-1 text-ink-600 bg-paper-100 px-2 py-0.5 rounded-full text-[11px]">
                Platform: <strong>{filters.platform}</strong>
                <button type="button" onClick={() => setFilters({ ...filters, platform: '' })} className="hover:text-ink-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.niche && (
              <span className="inline-flex items-center gap-1 text-ink-600 bg-paper-100 px-2 py-0.5 rounded-full text-[11px]">
                Niche: <strong>{filters.niche}</strong>
                <button type="button" onClick={() => setFilters({ ...filters, niche: '' })} className="hover:text-ink-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.minBudget && (
              <span className="inline-flex items-center gap-1 text-ink-600 bg-paper-100 px-2 py-0.5 rounded-full text-[11px]">
                Min: <strong>${filters.minBudget}</strong>
                <button type="button" onClick={() => setFilters({ ...filters, minBudget: '' })} className="hover:text-ink-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Sort picker inline */}
            <div className="flex items-center gap-1 text-ink-500">
              <span className="text-[11px]">Sort:</span>
              <select
                className="bg-transparent text-ink-900 font-semibold text-xs border-none cursor-pointer focus:ring-0 p-0"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
              >
                <option value="recommended">Best match</option>
                <option value="budget_desc">Budget: High to Low</option>
                <option value="budget_asc">Budget: Low to High</option>
                <option value="deadline_asc">Ending soonest</option>
                <option value="newest">Newest</option>
              </select>
            </div>

            {isFiltered && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs text-rose-600 hover:text-rose-800 font-medium inline-flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Reset all
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Campaign List / Grid Feed */}
      {loading.creatorCampaigns ? (
        <div className="card p-12 text-center text-sm text-ink-500 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-ink-400" />
          <span>Loading available marketplace briefs…</span>
        </div>
      ) : errors.creatorCampaigns ? (
        <div className="card p-10 text-center text-sm text-rose-700 bg-rose-50/50 border-rose-200">
          <AlertCircle className="w-6 h-6 mx-auto mb-2 text-rose-500" />
          <div className="font-semibold">{errors.creatorCampaigns}</div>
          <Button variant="secondary" size="sm" onClick={refresh} className="mt-3">
            Try again
          </Button>
        </div>
      ) : sortedCampaigns.length === 0 ? (
        <div className="card p-8">
          <EmptyState
            icon={<Megaphone className="w-6 h-6 text-ink-400" />}
            title={activeTab === 'saved' ? 'No saved briefs yet' : 'No briefs match your filters'}
            description={
              activeTab === 'saved'
                ? 'Click the bookmark icon on any campaign to save it here for later.'
                : 'Try adjusting your search keywords, budget threshold, or niche categories.'
            }
            action={
              <Button variant="secondary" onClick={resetFilters}>
                <X className="w-4 h-4" /> Clear all filters
              </Button>
            }
          />
        </div>
      ) : viewMode === 'grid' ? (
        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger">
          {sortedCampaigns.map((c) => {
            const { eligible, reason } = checkEligibility(c);
            const isSaved = savedIds.includes(c.id);

            return (
              <li key={c.id}>
                <CampaignCard
                  campaign={c}
                  to={`/creator/campaigns/${c.id}`}
                  eligibility={{ eligible, reason }}
                  onQuickView={(campaign) => setQuickViewCampaign(campaign)}
                  isSaved={isSaved}
                  onToggleSave={toggleSave}
                />
              </li>
            );
          })}
        </ul>
      ) : (
        /* Streamlined List View */
        <div className="card overflow-hidden divide-y divide-ink-150">
          {sortedCampaigns.map((c) => {
            const { eligible, reason } = checkEligibility(c);
            const isSaved = savedIds.includes(c.id);
            const diffDays = Math.ceil(
              (new Date(c.applicationDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );

            return (
              <div
                key={c.id}
                className="p-4 sm:p-5 hover:bg-paper-100/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-ink-900 text-paper-50 flex items-center justify-center font-display text-sm font-bold shrink-0 shadow-xs">
                    {c.brandName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap text-xs text-ink-500">
                      <span className="font-semibold text-ink-900 truncate">{c.brandName}</span>
                      <span className="text-ink-300">·</span>
                      <span className="truncate">{c.category}</span>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-paper-100 border border-ink-200 text-ink-700 text-[10px] font-medium">
                        <PlatformIcon platform={c.requiredPlatform} className="w-3 h-3" />
                        {c.requiredPlatform}
                      </span>
                      {diffDays > 0 && diffDays <= 5 && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 font-semibold">
                          <Flame className="w-3 h-3 text-rose-500" /> {diffDays}d left
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/creator/campaigns/${c.id}`}
                      className="font-semibold text-ink-900 text-sm sm:text-base hover:text-ember-600 transition-colors mt-0.5 block truncate"
                    >
                      {c.title}
                    </Link>
                    {c.deliverables && (
                      <div className="text-xs text-ink-500 truncate mt-1">
                        <span className="text-ink-400">Deliverables:</span> {c.deliverables}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-ink-100">
                  <div className="text-left sm:text-right">
                    <div className="text-sm sm:text-base font-bold text-ink-900 font-display">
                      {currency(c.budgetPerCreator)}
                    </div>
                    <div className="text-[11px] text-ink-400">
                      {c.creatorsNeeded} needed · Due {fmtDate(c.applicationDeadline)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <EligibilityChip eligible={eligible} reason={reason} />
                    <SaveButton
                      saved={isSaved}
                      onToggle={() => toggleSave(c.id)}
                    />
                    <button
                      type="button"
                      onClick={() => setQuickViewCampaign(c)}
                      className="btn btn-secondary btn-sm"
                      title="Quick preview"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <Link
                      to={`/creator/campaigns/${c.id}`}
                      className="btn btn-primary btn-sm"
                    >
                      Apply <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick View Interactive Slide-Over Modal */}
      {quickViewCampaign && (
        <Modal
          open={!!quickViewCampaign}
          onClose={() => setQuickViewCampaign(null)}
          title={`Brief Preview: ${quickViewCampaign.title}`}
          size="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <SaveButton
                saved={savedIds.includes(quickViewCampaign.id)}
                onToggle={() => toggleSave(quickViewCampaign.id)}
                label={savedIds.includes(quickViewCampaign.id) ? 'Saved' : 'Save brief'}
              />
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setQuickViewCampaign(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    navigate(`/creator/campaigns/${quickViewCampaign.id}`);
                  }}
                >
                  View Full Brief & Apply <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-5">
            {/* Modal header summary */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-paper-100/60 border border-ink-150">
              <div className="w-14 h-14 rounded-xl bg-ink-900 text-paper-50 flex items-center justify-center font-display text-lg font-bold shrink-0 shadow-sm">
                {quickViewCampaign.brandName.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-ink-500 font-medium">
                  {quickViewCampaign.brandName} · {quickViewCampaign.category}
                </div>
                <h3 className="font-semibold text-base sm:text-lg text-ink-900 mt-0.5 leading-snug">
                  {quickViewCampaign.title}
                </h3>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-paper-50 border border-ink-200 text-ink-800">
                    <PlatformIcon platform={quickViewCampaign.requiredPlatform} className="w-3.5 h-3.5" />
                    {quickViewCampaign.requiredPlatform}
                  </span>
                  <EligibilityChip
                    eligible={checkEligibility(quickViewCampaign).eligible}
                    reason={checkEligibility(quickViewCampaign).reason}
                  />
                </div>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="card p-3 text-center bg-paper-50">
                <div className="eyebrow !text-[10px]">Payout per Creator</div>
                <div className="text-lg font-bold font-display text-ink-900 mt-0.5">
                  {currency(quickViewCampaign.budgetPerCreator)}
                </div>
              </div>
              <div className="card p-3 text-center bg-paper-50">
                <div className="eyebrow !text-[10px]">Creators Needed</div>
                <div className="text-lg font-bold font-display text-ink-900 mt-0.5">
                  {quickViewCampaign.creatorsNeeded}
                </div>
              </div>
              <div className="card p-3 text-center bg-paper-50">
                <div className="eyebrow !text-[10px]">Apply Deadline</div>
                <div className="text-sm font-semibold text-ink-900 mt-1 truncate">
                  {fmtDate(quickViewCampaign.applicationDeadline)}
                </div>
              </div>
            </div>

            {/* Deliverables */}
            <div>
              <h4 className="text-xs font-semibold text-ink-700 uppercase tracking-wider mb-1.5">
                Expected Deliverables
              </h4>
              <div className="p-3.5 rounded-lg bg-paper-50 border border-ink-200 text-sm text-ink-800 leading-relaxed font-mono">
                {quickViewCampaign.deliverables || 'Standard branded post & video integration.'}
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-semibold text-ink-700 uppercase tracking-wider mb-1.5">
                Campaign Brief & Overview
              </h4>
              <p className="text-sm text-ink-600 leading-relaxed whitespace-pre-line p-3.5 rounded-lg bg-paper-50 border border-ink-200">
                {quickViewCampaign.description}
              </p>
            </div>

            {/* Eligibility Checklist */}
            <div className="p-4 rounded-xl bg-paper-100/60 border border-ink-200">
              <h4 className="text-xs font-semibold text-ink-900 uppercase tracking-wider mb-2">
                Your Eligibility Match
              </h4>
              <ul className="space-y-2 text-xs">
                <li className="flex items-center justify-between">
                  <span className="text-ink-600">Platform match ({quickViewCampaign.requiredPlatform}):</span>
                  {checkEligibility(quickViewCampaign).platformOk ? (
                    <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Matches ({creator?.primaryPlatform})
                    </span>
                  ) : (
                    <span className="text-rose-600 font-medium">
                      Requires {quickViewCampaign.requiredPlatform}
                    </span>
                  )}
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-ink-600">Minimum audience requirement:</span>
                  {checkEligibility(quickViewCampaign).followersOk ? (
                    <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {(creator?.followers ?? 0).toLocaleString()} reach (Qualified)
                    </span>
                  ) : (
                    <span className="text-rose-600 font-medium">
                      Requires {(quickViewCampaign.minFollowers ?? 0).toLocaleString()}+
                    </span>
                  )}
                </li>
              </ul>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
