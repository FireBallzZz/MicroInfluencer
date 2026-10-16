import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useStore, loadCreatorProfile, profileCompletion } from '../../state/Store';
import { fmtNumber, fmtDate, currency } from '../../data/seed';
import {
  PlatformIcon, VerifiedBadge, StatRow, SectionHeader, PageHeader,
} from '../../components/ui';
import { CheckCircle2, MapPin, ArrowUpRight, Pencil, Link as LinkIcon, Plus, Sparkles, Youtube } from 'lucide-react';

export default function CreatorProfile() {
  const { creator, connectedAccounts, loading, errors } = useStore();
  const [bootError, setBootError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadCreatorProfile();
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
  if (!creator) {
    return (
      <div className="container-page py-8">
        <div className="card p-8 text-center text-sm text-ink-500">
          {loading.creatorMe ? 'Loading your profile…' : 'No profile data yet.'}
        </div>
      </div>
    );
  }

  const yt = connectedAccounts.find((a) => a.platform === 'YouTube');
  const completion = profileCompletion(creator);
  const isComplete = completion === 100;
  const isVerified = isComplete && (yt?.verified ?? false);

  return (
    <div className="container-page py-6 sm:py-8">
      <div className="space-y-8">
        <PageHeader
          eyebrow="Profile"
          title="Your creator profile"
          description="This is how brands see you across discovery, campaign detail and proposal review."
          action={
            <Link to="/creator/profile/edit" className="btn btn-primary btn-md self-start sm:self-auto">
              <Pencil className="w-4 h-4" /> Edit profile
            </Link>
          }
        />

        {/* Hero / identity */}
        <article className="card p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
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
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display text-2xl sm:text-3xl text-ink-900 tracking-[-0.02em] leading-tight break-words">
                    {creator.fullName}
                  </h1>
                  {isVerified && <CheckCircle2 className="w-5 h-5 text-ember-500 shrink-0" />}
                </div>
                <div className="text-sm text-ink-500 mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  <span className="inline-flex items-center gap-1 font-medium text-ink-700">
                    <PlatformIcon platform={creator.primaryPlatform} className="w-4 h-4" />
                    {creator.primaryPlatform}
                  </span>
                  <span className="text-ink-300">·</span>
                  <span className="font-medium text-ink-700">{creator.niche}</span>
                  {creator.location && (
                    <>
                      <span className="text-ink-300">·</span>
                      <span className="inline-flex items-center gap-1 text-ink-600">
                        <MapPin className="w-3.5 h-3.5 text-ink-400" />
                        {creator.location}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap sm:self-center">
              {isVerified
                ? <VerifiedBadge verified />
                : <span className="tag tag-amber">Verification pending</span>
              }
              <span className="tag tag-paper">
                {isComplete ? 'Profile complete' : `Profile ${completion}%`}
              </span>
            </div>
          </div>
        </article>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            {/* About */}
            <section className="card p-5 sm:p-6">
              <SectionHeader eyebrow="About" title="Bio" />
              <p className="mt-4 text-ink-700 leading-relaxed text-[15px]">
                {creator.bio || (
                  <span className="text-ink-400 italic">No bio yet — add one to stand out to brands.</span>
                )}
              </p>
            </section>

            {/* Portfolio */}
            <section className="card p-5 sm:p-6">
              <SectionHeader
                eyebrow="Portfolio"
                title="Recent work"
                action={
                  <Link
                    to="/creator/profile/edit"
                    className="text-sm link-accent inline-flex items-center gap-1"
                  >
                    Manage <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                }
              />
              {creator.portfolio.length === 0 ? (
                <div className="mt-5 p-6 border border-dashed border-ink-200 rounded-md text-center">
                  <LinkIcon className="w-6 h-6 text-ink-300 mx-auto mb-2" />
                  <div className="text-sm text-ink-700 font-semibold">No portfolio links yet</div>
                  <div className="text-xs text-ink-500 mt-1">
                    Add up to 10 links — YouTube, Instagram, TikTok, articles, anything.
                  </div>
                  <Link to="/creator/profile/edit" className="btn btn-secondary btn-sm mt-4">
                    <Plus className="w-3.5 h-3.5" /> Add link
                  </Link>
                </div>
              ) : (
                <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 stagger">
                  {creator.portfolio.map((p) => (
                    <li key={p.id}>
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="card card-hover p-4 flex items-center gap-3 group"
                      >
                        <span className="w-9 h-9 rounded-md bg-ink-100 text-ink-700 flex items-center justify-center shrink-0">
                          <LinkIcon className="w-4 h-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-ink-900 truncate">
                            {p.title || p.url}
                          </div>
                          <div className="text-xs text-ink-500 truncate">{p.url}</div>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-ink-300 group-hover:text-ember-600 transition-colors shrink-0" />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <aside className="lg:col-span-4 space-y-5">
            <StatRow
              items={[
                { label: creator.primaryPlatform === 'YouTube' ? 'Subscribers' : 'Followers',  value: fmtNumber(creator.followers) },
                { label: 'Engagement', value: `${creator.engagementRate}%` },
                { label: 'Post rate',  value: currency(creator.ratePerPost) },
                { label: 'Video rate', value: currency(creator.ratePerVideo) },
              ]}
            />

            <div className="card p-5">
              <div className="eyebrow">Details</div>
              <dl className="mt-3 space-y-2.5 text-sm">
                <Row label="Niche">{creator.niche}</Row>
                <Row label="Primary platform">{creator.primaryPlatform}</Row>
                <Row label="Location">{creator.location}</Row>
                <Row label="Story rate">{currency(creator.ratePerStory)}</Row>
              </dl>
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between">
                <div className="eyebrow">Connected Channels</div>
                <Link to="/creator/accounts" className="text-xs text-ember-600 hover:text-ember-700 font-medium">
                  Manage
                </Link>
              </div>
              {connectedAccounts.length === 0 ? (
                <p className="mt-2.5 text-xs text-ink-500">
                  No accounts linked yet. Connect your YouTube, Instagram, or Facebook channels.
                </p>
              ) : (
                <ul className="mt-3 space-y-2.5">
                  {connectedAccounts.map((acc) => (
                    <li key={acc.id} className="flex items-center justify-between text-sm py-1 border-b border-ink-100 last:border-none">
                      <div className="flex items-center gap-2 min-w-0">
                        <PlatformIcon platform={acc.platform} className="w-4 h-4 shrink-0" />
                        <span className="font-medium text-ink-900 truncate">
                          {acc.url ? (
                            <a href={acc.url} target="_blank" rel="noreferrer noopener" className="hover:underline hover:text-ember-600">
                              {acc.handle}
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
              )}
            </div>

            <div className="card p-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-ember-500" />
                <div className="eyebrow">Verification</div>
              </div>
              <p className="mt-2.5 text-sm text-ink-700 leading-relaxed">
                {yt
                  ? <>YouTube connected. Last synced {fmtDate(yt.lastSyncedAt)}.</>
                  : 'Connect YouTube to verify your stats and unlock the Verified badge.'}
              </p>
              <Link to="/creator/accounts" className="btn btn-secondary btn-sm mt-3 w-full sm:w-auto">
                <Youtube className="w-3.5 h-3.5" />
                {yt ? 'Manage connection' : 'Connect YouTube'}
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-ink-500">{label}</dt>
      <dd className="font-semibold text-ink-900 text-right">{children}</dd>
    </div>
  );
}
