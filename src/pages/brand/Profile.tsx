import { Link } from 'react-router-dom';
import { Pencil, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useStore, loadBrandProfile, loadBrandCampaigns } from '../../state/Store';
import { PageHeader, SectionHeader, StatRow } from '../../components/ui';

export default function BrandProfile() {
  const { brand, campaigns } = useStore();
  const [bootError, setBootError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await Promise.all([loadBrandProfile(), loadBrandCampaigns()]);
      } catch (err) {
        if (!cancelled) {
          const msg = (err as Error).message || 'Could not load your profile.';
          setBootError(msg);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (bootError) {
    return (
      <div className="container-page py-8">
        <div className="card p-6 text-sm text-rose-700">{bootError}</div>
      </div>
    );
  }
  if (!brand) {
    return (
      <div className="container-page py-8">
        <div className="card p-8 text-center text-sm text-ink-500">Loading your profile…</div>
      </div>
    );
  }

  const mine = campaigns.filter((c) => c.brandId === brand.id || !c.brandId);
  const published = mine.filter((c) => c.status === 'published').length;
  const draft = mine.filter((c) => c.status === 'draft').length;
  const closed = mine.filter((c) => c.status === 'closed').length;

  return (
    <div className="container-page py-6 sm:py-8 space-y-6 max-w-3xl">
      <PageHeader
        eyebrow="Profile"
        title="Company profile"
        description="How creators see your brand across the marketplace."
        action={
          <Link to="/brand/profile/edit" className="btn btn-primary btn-md">
            <Pencil className="w-4 h-4" /> Edit profile
          </Link>
        }
      />

      <div className="card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          {brand.logoUrl ? (
            <img
              src={brand.logoUrl}
              alt={brand.companyName}
              className="w-20 sm:w-24 h-20 sm:h-24 rounded-2xl object-contain bg-paper-100 p-2 ring-4 ring-paper-100 border border-ink-200 shrink-0 shadow-sm"
            />
          ) : (
            <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-2xl bg-ink-900 text-paper-50 flex items-center justify-center font-display text-2xl font-bold ring-4 ring-paper-100 border border-ink-200 shrink-0 select-none shadow-sm">
              {brand.companyName.split(' ').map((s) => s[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()}
            </div>
          )}
          <div className="min-w-0 pb-1 flex-1">
            <h1 className="font-display text-2xl sm:text-3xl text-ink-900 leading-tight tracking-[-0.02em]">
              {brand.companyName}
            </h1>
            <div className="text-sm text-ink-600 font-medium mt-1">{brand.industry}</div>
            {brand.website && (
              <a href={brand.website} target="_blank" rel="noreferrer noopener" className="mt-2 text-sm text-ember-600 hover:text-ember-700 inline-flex items-center gap-1 font-semibold">
                <ExternalLink className="w-3.5 h-3.5" /> {brand.website}
              </a>
            )}
          </div>
        </div>
      </div>

      <StatRow
        items={[
          { label: 'Campaigns', value: mine.length, hint: 'all time' },
          { label: 'Live', value: published, hint: 'accepting' },
          { label: 'Drafts', value: draft, hint: 'not live' },
          { label: 'Closed', value: closed, hint: 'wrapped up' },
        ]}
      />

      <section className="card p-5 sm:p-6">
        <SectionHeader eyebrow="About" title="What we do" />
        <p className="mt-4 text-ink-700 leading-relaxed text-[15px] whitespace-pre-line">
          {brand.about || '—'}
        </p>
      </section>
    </div>
  );
}
