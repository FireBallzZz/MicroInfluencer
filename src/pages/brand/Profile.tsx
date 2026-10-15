import { Link } from 'react-router-dom';
import { Pencil, ExternalLink } from 'lucide-react';
import { useStore } from '../../state/Store';
import { PageHeader, SectionHeader, StatRow, ChannelArt } from '../../components/ui';

export default function BrandProfile() {
  const { brand, campaigns } = useStore();
  const mine = campaigns.filter((c) => c.brandId === brand.id);
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

      <div className="card overflow-hidden">
        {brand.coverUrl ? (
          <img
            src={brand.coverUrl}
            alt="Cover"
            className="w-full h-[160px] sm:h-[200px] object-cover"
          />
        ) : (
          <ChannelArt name={brand.companyName} seed={brand.id} height={120} className="rounded-none w-full" />
        )}
        <div className="p-5 sm:p-6 flex items-end gap-4 -mt-10 sm:-mt-12">
          {brand.logoUrl ? (
            <img
              src={brand.logoUrl}
              alt={brand.companyName}
              className="w-20 sm:w-24 h-20 sm:h-24 rounded-md object-cover ring-4 ring-paper-50 shrink-0"
            />
          ) : (
            <ChannelArt name={brand.companyName} seed={brand.id} height={72} className="w-20 sm:w-24 rounded-md ring-4 ring-paper-50 shrink-0" />
          )}
          <div className="min-w-0 pb-1 flex-1">
            <h1 className="font-display text-2xl sm:text-3xl text-ink-900 leading-none tracking-[-0.02em]">
              {brand.companyName}
            </h1>
            <div className="text-sm text-ink-500 mt-1.5">{brand.industry}</div>
            {brand.website && (
              <a
                href={brand.website}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-2 text-sm text-ember-600 hover:text-ember-700 inline-flex items-center gap-1 font-semibold"
              >
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
