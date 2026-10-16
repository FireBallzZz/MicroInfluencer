import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, MapPin, Megaphone, Star, CheckCircle2 } from 'lucide-react';
import { useAsyncLoader } from '../../state/useEffectAsync';
import { fetchCreatorDetail, listCreatorReviews, type Review } from '../../api/endpoints';
import {
  Button, VerifiedBadge, PlatformIcon, StatRow, SectionHeader, PageHeader, Rating,
} from '../../components/ui';
import { fmtNumber, currency, fmtDate, fmtRelativeTime } from '../../data/seed';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

export default function CreatorPublicProfile() {
  const { id } = useParams();
  const { data: creator, loading, error } = useAsyncLoader(
    () => fetchCreatorDetail(id!),
    [id],
  );
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    let cancelled = false;
    if (!id) return;
    listCreatorReviews(id).then((r) => { if (!cancelled) setReviews(r); }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return <div className="container-page py-8"><div className="card p-8 text-center text-sm text-ink-500">Loading…</div></div>;
  }
  if (error || !creator) {
    return (
      <div className="container-page py-6 sm:py-8">
        <div className="card p-10 text-center">
          <Megaphone className="w-7 h-7 text-ink-300 mx-auto mb-2" />
          <div className="text-sm font-semibold text-ink-900">Creator not found</div>
          <div className="text-xs text-ink-500 mt-1">{error ?? 'It may have been removed.'}</div>
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
      <div className="card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 min-w-0">
            {creator.avatarUrl ? (
              <img
                src={creator.avatarUrl}
                alt={creator.fullName}
                className="w-20 sm:w-24 h-20 sm:h-24 rounded-full object-cover ring-4 ring-paper-100 border border-ink-200 shrink-0 shadow-sm"
              />
            ) : (
              <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-full bg-ink-900 text-paper-50 flex items-center justify-center font-display text-2xl font-bold ring-4 ring-paper-100 border border-ink-200 shrink-0 select-none shadow-sm">
                {creator.fullName.split(' ').map((s) => s[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()}
              </div>
            )}
            <div className="min-w-0 pb-1 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-2xl sm:text-3xl text-ink-900 tracking-[-0.02em] leading-tight">
                  {creator.fullName}
                </h1>
                <VerifiedBadge verified={creator.verified} />
              </div>
              <div className="text-sm text-ink-500 mt-2 flex items-center gap-1.5 flex-wrap">
                <PlatformIcon platform={creator.primaryPlatform} />
                <span className="font-medium text-ink-700">{creator.niche}</span>
                {creator.location && (
                  <>
                    <span className="text-ink-300">·</span>
                    <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {creator.location}</span>
                  </>
                )}
              </div>
              <div className="mt-3">
                <Rating value={creator.ratingAvg ?? null} count={creator.ratingCount ?? 0} size="md" />
              </div>
            </div>
          </div>
          <div className="shrink-0 sm:self-center">
            <Button variant="primary" size="md" className="w-full sm:w-auto">Invite to campaign</Button>
          </div>
        </div>
      </div>

      <StatRow
        items={[
          { label: 'Followers', value: fmtNumber(creator.followers) },
          { label: 'Engagement', value: `${creator.engagementRate}%` },
          { label: 'Post rate', value: creator.ratePerPost > 0 ? currency(creator.ratePerPost) : '—' },
          { label: 'Video rate', value: creator.ratePerVideo > 0 ? currency(creator.ratePerVideo) : '—' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <section className="card p-5 sm:p-6">
            <SectionHeader eyebrow="About" title="Bio" />
            <p className="mt-4 text-ink-700 leading-relaxed text-[15px]">
              {creator.bio || <span className="italic text-ink-400">No bio yet.</span>}
            </p>
          </section>

          <section className="card p-5 sm:p-6">
            <SectionHeader eyebrow="Portfolio" title="Recent work" />
            {creator.portfolio.length === 0 ? (
              <div className="mt-5 border border-dashed border-ink-200 rounded-md p-6 text-center text-sm text-ink-500">
                This creator hasn’t added portfolio links yet.
              </div>
            ) : (
              <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <Row label="Post">{creator.ratePerPost > 0 ? currency(creator.ratePerPost) : '—'}</Row>
              <Row label="Story">{creator.ratePerStory > 0 ? currency(creator.ratePerStory) : '—'}</Row>
              <Row label="Video">{creator.ratePerVideo > 0 ? currency(creator.ratePerVideo) : '—'}</Row>
            </dl>
          </div>
          {creator.connectedAccounts && creator.connectedAccounts.length > 0 && (
            <div className="card p-5">
              <div className="eyebrow">Connected Channels</div>
              <ul className="mt-3 space-y-2.5">
                {creator.connectedAccounts.map((acc) => (
                  <li key={acc.id} className="flex items-center justify-between text-sm py-1 border-b border-ink-100 last:border-none">
                    <div className="flex items-center gap-2 min-w-0">
                      <PlatformIcon platform={acc.platform} className="w-4 h-4 shrink-0" />
                      <span className="font-medium text-ink-900 truncate">
                        {acc.url ? (
                          <a href={acc.url} target="_blank" rel="noreferrer noopener" className="hover:underline hover:text-ember-600 inline-flex items-center gap-1">
                            {acc.handle}
                            <ExternalLink className="w-3 h-3 text-ink-400" />
                          </a>
                        ) : (
                          acc.handle
                        )}
                      </span>
                      {acc.verified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    </div>
                    <span className="text-xs text-ink-500 font-medium shrink-0 ml-2">
                      {fmtNumber(acc.followers ?? 0)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

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

      <section className="card p-5 sm:p-6">
        <SectionHeader eyebrow="Reviews" title="Past collaborations" />
        {reviews.length === 0 ? (
          <div className="mt-5 border border-dashed border-ink-200 rounded-md p-6 text-center text-sm text-ink-500">
            No reviews yet.
          </div>
        ) : (
          <ul className="mt-5 space-y-4">
            {reviews.map((r) => (
              <li key={r.id} className="border border-ink-200 rounded-md p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-ink-900">{r.brand.name}</span>
                    <span className="text-xs text-ink-500">· for “{r.campaign.title}”</span>
                  </div>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={clsx('w-3.5 h-3.5', n <= r.rating ? 'fill-ember-500 text-ember-500' : 'text-ink-200')}
                      />
                    ))}
                  </div>
                </div>
                {r.text && <p className="text-sm text-ink-700 mt-2 leading-relaxed">{r.text}</p>}
                <div className="text-[11px] text-ink-400 mt-2">{fmtRelativeTime(r.createdAt)}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
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
