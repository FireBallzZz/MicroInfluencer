import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, MapPin, Megaphone } from 'lucide-react';
import { discoverableCreators } from '../../data/seed';
import {
  Button, VerifiedBadge, ChannelArt, PlatformIcon, StatRow, SectionHeader, PageHeader,
} from '../../components/ui';
import { fmtNumber, currency, fmtDate } from '../../data/seed';

export default function CreatorPublicProfile() {
  const { id } = useParams();
  const creator = discoverableCreators.find((c) => c.id === id);

  if (!creator) {
    return (
      <div className="container-page py-6 sm:py-8">
        <div className="card p-10 text-center">
          <Megaphone className="w-7 h-7 text-ink-300 mx-auto mb-2" />
          <div className="text-sm font-semibold text-ink-900">Creator not found</div>
          <Link to="/brand/creators" className="text-sm link-accent inline-flex items-center gap-1 mt-3">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-6 sm:py-8 space-y-6 max-w-4xl">
      <Link to="/brand/creators" className="text-sm text-ink-600 hover:text-ink-900 inline-flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to search
      </Link>

      {/* Identity */}
      <div className="card overflow-hidden">
        <ChannelArt name={creator.fullName} seed={creator.id} height={120} className="rounded-none" />
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 sm:-mt-12">
          <ChannelArt
            name={creator.fullName}
            seed={creator.id}
            height={88}
            className="w-20 sm:w-24 rounded-md ring-4 ring-paper-50 shrink-0"
          />
          <div className="min-w-0 pb-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-2xl sm:text-3xl text-ink-900 tracking-[-0.02em] leading-none">
                {creator.fullName}
              </h1>
              <VerifiedBadge verified={creator.verified} />
            </div>
            <div className="text-sm text-ink-500 mt-2 flex items-center gap-1.5 flex-wrap">
              <PlatformIcon platform={creator.primaryPlatform} />
              <span>{creator.niche}</span>
              <span className="text-ink-300">·</span>
              <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {creator.location}</span>
            </div>
          </div>
          <div className="shrink-0">
            <Button variant="primary" size="md" className="w-full sm:w-auto">Invite to campaign</Button>
          </div>
        </div>
      </div>

      <StatRow
        items={[
          { label: 'Followers', value: fmtNumber(creator.followers) },
          { label: 'Engagement', value: creator.engagementRate + '%' },
          { label: 'Post rate', value: currency(creator.ratePerPost) },
          { label: 'Video rate', value: currency(creator.ratePerVideo) },
        ]}
      />

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <section className="card p-5 sm:p-6">
            <SectionHeader eyebrow="About" title="Bio" />
            <p className="mt-4 text-ink-700 leading-relaxed text-[15px]">{creator.bio}</p>
          </section>

          <section className="card p-5 sm:p-6">
            <SectionHeader eyebrow="Portfolio" title="Recent work" />
            {creator.portfolio.length === 0 ? (
              <div className="mt-5 border border-dashed border-ink-200 rounded-md p-6 text-center text-sm text-ink-500">
                This creator hasn’t added portfolio links yet.
              </div>
            ) : (
              <ul className="mt-5 grid sm:grid-cols-2 gap-3">
                {creator.portfolio.map((p) => (
                  <li key={p.id}>
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="card card-hover p-4 flex items-center gap-3 group"
                    >
                      <span className="w-9 h-9 rounded-md bg-ink-100 text-ink-700 flex items-center justify-center shrink-0">
                        <ExternalLink className="w-4 h-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-ink-900 truncate">{p.title || p.url}</div>
                        <div className="text-xs text-ink-500 truncate">{p.url}</div>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="lg:col-span-4 space-y-5">
          <div className="card p-5">
            <div className="eyebrow">Rates</div>
            <dl className="mt-3 space-y-2.5 text-sm">
              <Row label="Post">{currency(creator.ratePerPost)}</Row>
              <Row label="Story">{currency(creator.ratePerStory)}</Row>
              <Row label="Video">{currency(creator.ratePerVideo)}</Row>
            </dl>
          </div>
          <div className="card p-5">
            <div className="eyebrow">Verification</div>
            <p className="mt-2 text-sm text-ink-700">
              {creator.verified
                ? 'This creator’s audience stats are verified through YouTube.'
                : 'Stats on this profile are manually entered and have not been verified.'}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink-500">{label}</dt>
      <dd className="font-semibold text-ink-900">{children}</dd>
    </div>
  );
}
