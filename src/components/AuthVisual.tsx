import {
  BadgeCheck,
  Sparkles,
  Megaphone,
  Users,
  ArrowUpRight,
  Check,
} from 'lucide-react';
import { useEffect, useState } from 'react';

type Variant = 'neutral' | 'creator' | 'brand';

/**
 * AuthVisual — replaces the generic "mesh + glass cards" pattern with an
 * editorial ink panel: a single content card (role-specific sample) plus a
 * live activity list. No floating decorative cards, no blurred blobs.
 */
export default function AuthVisual({ variant = 'neutral' }: { variant?: Variant }) {
  return (
    <div className="w-full flex flex-col gap-6 text-paper-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-ember-400" />
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
            {variant === 'creator' ? 'For creators' : variant === 'brand' ? 'For brands' : 'The platform'}
          </span>
        </div>
        <span className="font-mono text-[11px] text-ink-400">
          v0.1 · 2026
        </span>
      </div>

      {variant === 'creator' && <CreatorEditorial />}
      {variant === 'brand'   && <BrandEditorial />}
      {variant === 'neutral' && <NeutralEditorial />}

      <ActivityFeed variant={variant} />

      <div className="grid grid-cols-3 gap-px bg-ink-700/70 border border-ink-700/70">
        {variant === 'creator'
          ? [['38.4K', 'Subscribers'], ['4.8%', 'Engagement'], ['92%', 'Reply rate']]
              .map(([v, l]) => <Kv key={l} value={v} label={l} />)
          : variant === 'brand'
            ? [['2.4k+', 'Demo brands'], ['312', 'Active briefs'], ['3.2x', 'Median ROI']]
                .map(([v, l]) => <Kv key={l} value={v} label={l} />)
            : [['10k+', 'Creators'], ['2.4k+', 'Brands'], ['94%', 'Filled in 7d']]
                .map(([v, l]) => <Kv key={l} value={v} label={l} />)
        }
      </div>
    </div>
  );
}

/* ────────────── Editorial copy + sample UI ────────────── */

function CreatorEditorial() {
  return (
    <div className="bg-ink-800/60 border border-ink-700 rounded-[18px] p-6 sm:p-7">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="tag tag-ember flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" /> Creator
        </span>
        <span className="text-[11px] text-ink-400 font-mono uppercase tracking-[0.14em]">
          Profile preview
        </span>
      </div>

      <h3 className="font-display text-[clamp(1.5rem,2.6vw,2.1rem)] leading-[1.1] tracking-[-0.02em] text-paper-50">
        Your stats, <span className="text-ember-300 italic font-medium">verified.</span>
      </h3>
      <p className="mt-3 text-[14px] text-ink-300 leading-relaxed max-w-md">
        One OAuth and your YouTube numbers — subscribers, view rate,
        engagement — appear on your profile. Brands can filter on real data.
      </p>

      <div className="mt-5 flex items-center gap-3 p-3.5 bg-ink-900 border border-ink-700 rounded-sm">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ember-500 to-ember-700 text-paper-50 flex items-center justify-center font-bold text-sm">
          AJ
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-paper-50">
            Avery Johnson
            <BadgeCheck className="w-3.5 h-3.5 text-ember-300" />
          </div>
          <div className="text-xs text-ink-400">Lifestyle · YouTube · 38.4K</div>
        </div>
        <ArrowUpRight className="w-4 h-4 text-ink-400" />
      </div>
    </div>
  );
}

function BrandEditorial() {
  return (
    <div className="bg-ink-800/60 border border-ink-700 rounded-[18px] p-6 sm:p-7">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="tag tag-ember flex items-center gap-1.5">
          <Megaphone className="w-3 h-3" /> Brand
        </span>
        <span className="text-[11px] text-ink-400 font-mono uppercase tracking-[0.14em]">
          Brief template
        </span>
      </div>

      <h3 className="font-display text-[clamp(1.5rem,2.6vw,2.1rem)] leading-[1.1] tracking-[-0.02em] text-paper-50">
        Briefs in minutes, <span className="text-ember-300 italic font-medium">not weeks.</span>
      </h3>
      <p className="mt-3 text-[14px] text-ink-300 leading-relaxed max-w-md">
        Drop in a title, deliverables, deadline, rate. Your brief goes live to
        matched creators in minutes — no PDF, no Zoom, no &ldquo;just
        circling back&rdquo;.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-px bg-ink-700/70 border border-ink-700/70">
        <div className="bg-ink-900 p-3.5">
          <div className="text-[10px] uppercase tracking-[0.14em] text-ink-400 font-semibold">Per creator</div>
          <div className="mt-1 font-display text-2xl text-paper-50 leading-none">$1,200</div>
        </div>
        <div className="bg-ink-900 p-3.5">
          <div className="text-[10px] uppercase tracking-[0.14em] text-ink-400 font-semibold">Deliverables</div>
          <div className="mt-1 text-sm text-paper-200">1 video + 1 reel</div>
        </div>
      </div>
    </div>
  );
}

function NeutralEditorial() {
  return (
    <div className="bg-ink-800/60 border border-ink-700 rounded-[18px] p-6 sm:p-7">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="tag tag-ember flex items-center gap-1.5">
          <Users className="w-3 h-3" /> Marketplace
        </span>
        <span className="text-[11px] text-ink-400 font-mono uppercase tracking-[0.14em]">
          Two sides, one flow
        </span>
      </div>

      <h3 className="font-display text-[clamp(1.5rem,2.6vw,2.1rem)] leading-[1.1] tracking-[-0.02em] text-paper-50">
        Welcome back. <span className="text-ember-300 italic font-medium">Pick up where you left off.</span>
      </h3>
      <p className="mt-3 text-[14px] text-ink-300 leading-relaxed max-w-md">
        Sign in to your dashboard, or create an account in under 60 seconds
        to try the demo as a creator or a brand.
      </p>

      <div className="mt-5 space-y-2">
        {[
          'Verified YouTube stats',
          'Briefs with transparent budgets',
          'Clean status flow on both sides',
        ].map((line) => (
          <div key={line} className="flex items-center gap-2.5 text-sm text-paper-200">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-sm bg-ember-500 text-paper-50">
              <Check className="w-3 h-3" />
            </span>
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────────── Live activity feed ────────────── */

const FEED = [
  { who: 'Northwind', on: 'Avery Johnson',  tone: 'accept',    time: '2m' },
  { who: 'Hana Studio', on: 'Mia Park',     tone: 'shortlist', time: '4m' },
  { who: 'Brewly',      on: 'Hassan Khan',  tone: 'proposal',  time: '6m' },
  { who: 'Drift',       on: 'Eun-ji Park',  tone: 'shortlist', time: '9m' },
  { who: 'Kindred',     on: 'Liam Carter',  tone: 'accept',    time: '12m' },
  { who: 'Lumen Labs',  on: 'Priya Anand',  tone: 'proposal',  time: '15m' },
];

const TONE: Record<string, { dot: string; text: string; label: string }> = {
  shortlist: { dot: 'bg-amber-400',  text: 'text-amber-300',  label: 'Shortlisted' },
  proposal:  { dot: 'bg-paper-50',   text: 'text-paper-50',   label: 'New proposal' },
  accept:    { dot: 'bg-emerald-400',text: 'text-emerald-300',label: 'Accepted' },
};

function ActivityFeed({ variant }: { variant: Variant }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setI((v) => (v + 1) % FEED.length), 3000);
    return () => window.clearInterval(id);
  }, []);

  const visible = [0, 1].map((o) => FEED[(i + o) % FEED.length]);
  const heading = variant === 'creator'
    ? 'Opportunities moving'
    : variant === 'brand'
      ? 'Proposals moving'
      : 'Marketplace activity';

  return (
    <div className="border border-ink-700/70 rounded-[18px] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-ink-700/70 bg-ink-900/40">
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-blink" />
          <span className="text-[13px] font-semibold text-paper-50">{heading}</span>
        </div>
        <span className="font-mono text-[10px] text-ink-400">last 30m</span>
      </div>

      <ul className="divide-y divide-ink-700/70">
        {visible.map((row, idx) => {
          const t = TONE[row.tone];
          return (
            <li
              key={`${i}-${idx}-${row.who}`}
              className="flex items-center gap-3 px-5 py-3.5 animate-fade-in"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${t.dot} shrink-0`} />
              <div className="min-w-0 flex-1 text-[13px] text-ink-200">
                <span className={`font-semibold ${t.text}`}>{t.label}</span>
                <span className="text-ink-400"> · {row.who} → </span>
                <span className="font-semibold text-paper-50">{row.on}</span>
              </div>
              <span className="font-mono text-[10px] text-ink-400 uppercase tracking-[0.12em]">
                {row.time}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ────────────── Stat key-value ────────────── */

function Kv({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-ink-900/60 px-4 py-3.5">
      <div className="font-display text-xl text-paper-50 leading-none tracking-[-0.02em]">
        {value}
      </div>
      <div className="mt-1.5 text-[10px] uppercase tracking-[0.14em] text-ink-400 font-semibold">
        {label}
      </div>
    </div>
  );
}
