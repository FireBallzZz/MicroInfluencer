import { Link } from 'react-router-dom';
import { useStore, profileCompletion } from '../../state/Store';
import { fmtNumber, fmtDate, currency, NICHES, PLATFORMS } from '../../data/seed';
import { useAuth } from '../../state/AuthContext';
import {
  PlatformIcon, ChannelArt, VerifiedBadge, StatRow, SectionHeader, PageHeader,
} from '../../components/ui';
import { BadgeCheck, MapPin, ArrowUpRight, Pencil, Link as LinkIcon, Plus } from 'lucide-react';
import { useState } from 'react';

export default function CreatorProfile() {
  const { user } = useAuth();
  const { creator, connectedAccounts, campaigns } = useStore();
  const yt = connectedAccounts.find((a) => a.platform === 'YouTube');
  const completion = profileCompletion(creator);
  const isComplete = completion === 100;
  const acceptedProposals = campaigns; // already filtered by caller
  const isVerified = isComplete && (yt?.verified ?? false);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Profile"
        title="Your creator profile"
        description="This is how brands see you across discovery, campaign detail and proposal review."
        action={
          <Link to="/creator/profile/edit" className="btn btn-primary btn-md">
            <Pencil className="w-4 h-4" /> Edit profile
          </Link>
        }
      />

      {/* Hero / identity */}
      <div className="card overflow-hidden">
        <ChannelArt name={creator.fullName} seed={creator.id} height={120} className="rounded-none" />
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-10 sm:-mt-12">
          <div className="flex items-end gap-4">
            <ChannelArt name={creator.fullName} seed={creator.id} height={88} className="w-20 sm:w-24 rounded-md ring-4 ring-paper-50" />
            <div className="min-w-0 pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-2xl sm:text-3xl text-ink-900 tracking-[-0.02em] leading-none">
                  {creator.fullName}
                </h1>
                {isVerified && <BadgeCheck className="w-5 h-5 text-ember-500" />}
              </div>
              <div className="text-sm text-ink-500 mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <span className="inline-flex items-center gap-1">
                  <PlatformIcon platform={creator.primaryPlatform} className="w-3.5 h-3.5" />
                  {creator.primaryPlatform}
                </span>
                <span className="text-ink-300">·</span>
                <span>{creator.niche}</span>
                <span className="text-ink-300">·</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {creator.location}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {isVerified
              ? <VerifiedBadge verified />
              : <span className="tag tag-amber">Verification pending</span>
            }
            <span className="tag tag-paper">
              {isComplete ? 'Profile complete' : `Profile ${completion}%`}
            </span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* About */}
          <section className="card p-5 sm:p-6">
            <SectionHeader
              eyebrow="About"
              title="Bio"
            />
            <p className="mt-4 text-ink-700 leading-relaxed text-[15px]">{creator.bio || '—'}</p>
          </section>

          {/* Portfolio */}
          <section className="card p-5 sm:p-6">
            <SectionHeader
              eyebrow="Portfolio"
              title="Recent work"
              action={
                <Link to="/creator/profile/edit" className="text-sm link-accent inline-flex items-center gap-1">
                  Manage <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              }
            />
            {creator.portfolio.length === 0 ? (
              <div className="mt-5 p-6 border border-dashed border-ink-200 rounded-md text-center">
                <LinkIcon className="w-6 h-6 text-ink-300 mx-auto mb-2" />
                <div className="text-sm text-ink-700 font-semibold">No portfolio links yet</div>
                <div className="text-xs text-ink-500 mt-1">Add up to 3 links — YouTube, Instagram, TikTok, articles, anything.</div>
                <Link to="/creator/profile/edit" className="btn btn-secondary btn-sm mt-4">
                  <Plus className="w-3.5 h-3.5" /> Add link
                </Link>
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
                        <LinkIcon className="w-4 h-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-ink-900 truncate">{p.title || p.url}</div>
                        <div className="text-xs text-ink-500 truncate">{p.url}</div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-ink-300 group-hover:text-ember-600 transition-colors" />
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
              { label: 'Followers', value: fmtNumber(creator.followers) },
              { label: 'Engagement', value: `${creator.engagementRate}%` },
              { label: 'Post rate', value: currency(creator.ratePerPost) },
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
            <div className="eyebrow">Verification</div>
            <p className="mt-2 text-sm text-ink-700">
              {yt
                ? `YouTube @${yt.handle} connected. Last synced ${fmtDate(yt.lastSyncedAt)}.`
                : 'Connect YouTube to verify your stats and unlock the Verified badge.'}
            </p>
            <Link to="/creator/accounts" className="btn btn-secondary btn-sm mt-3">
              {yt ? 'Manage connection' : 'Connect YouTube'}
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-ink-500">{label}</dt>
      <dd className="font-semibold text-ink-900">{children}</dd>
    </div>
  );
}
