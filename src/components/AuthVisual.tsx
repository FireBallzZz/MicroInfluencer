import {
  BadgeCheck,
  CheckCircle2,
  Sparkles,
  Play,
  MessageCircle,
  Megaphone,
  Search,
  Star,
  LineChart,
  Building2,
  ArrowUpRight,
} from 'lucide-react';

type Variant = 'neutral' | 'creator' | 'brand';

/**
 * AuthVisual — animated illustration panel for the right side of auth pages.
 * Variant picks the scene: 'neutral' (Login), 'creator' (RegisterCreator), 'brand' (RegisterBrand).
 */
export default function AuthVisual({ variant = 'neutral' }: { variant?: Variant }) {
  return (
    <div className="relative w-full h-full min-h-[420px] flex items-center justify-center">
      {/* Background mesh + grid */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden bg-hero-mesh">
        <div className="absolute inset-0 bg-grid-soft opacity-70" />
        <div className="pointer-events-none absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-brand-300/35 blur-3xl animate-mesh-pan" />
        <div className="pointer-events-none absolute -bottom-32 -right-24 w-[460px] h-[460px] rounded-full bg-accent-violet/25 blur-3xl animate-mesh-pan" style={{ animationDelay: '5s' }} />
        <div className="pointer-events-none absolute top-1/3 right-1/4 w-[360px] h-[360px] rounded-full bg-accent-mint/35 blur-3xl animate-mesh-pan" style={{ animationDelay: '9s' }} />
        <div className="absolute inset-0 bg-noise opacity-50 mix-blend-overlay" />
      </div>

      {/* Headline copy */}
      <div className="absolute top-6 left-6 right-6 text-center px-4">
        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-ink-200/80 text-ink-700 text-xs font-semibold pl-1.5 pr-3 py-1 rounded-full shadow-card">
          <span className="inline-flex items-center gap-1 bg-brand-500 text-white rounded-full px-2 py-0.5">
            <Sparkles className="w-3 h-3" /> {variant === 'creator' ? 'Creators' : variant === 'brand' ? 'Brands' : 'Microwork'}
          </span>
          <span className="whitespace-nowrap">
            {variant === 'creator'
              ? 'Where 38K creators start their week'
              : variant === 'brand'
              ? 'Trusted by 2,400+ demo brands'
              : 'Built for the next generation of work'}
          </span>
        </div>
      </div>

      {/* Floating cards (positioned over the mesh) */}
      <div className="relative w-full max-w-[520px] h-[460px]">
        {variant === 'creator' && <CreatorScene />}
        {variant === 'brand' && <BrandScene />}
        {variant === 'neutral' && <NeutralScene />}
      </div>
    </div>
  );
}

/* ---------- Scene 1: Creator (used by RegisterCreator) ---------- */
function CreatorScene() {
  return (
    <>
      {/* Creator profile card */}
      <div className="absolute top-8 right-2 w-[290px] card p-5 anim-float anim-float-1 shadow-pop gradient-border">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center font-bold">AJ</div>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-white flex items-center justify-center">
              <BadgeCheck className="w-3.5 h-3.5 text-teal-600 fill-white" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-ink-900 truncate">Avery Johnson</span>
            </div>
            <div className="text-xs text-ink-500 truncate">Lifestyle · YouTube · 38.4K</div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <Mini label="Engagement" value="4.8%" />
          <Mini label="Rate" value="$450" />
          <Mini label="Profile" value="90%" />
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-ink-500">
          <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> 92% reply</span>
          <span className="flex items-center gap-1"><Play className="w-3.5 h-3.5" /> 24 videos</span>
        </div>
      </div>

      {/* Stats card with sparkline */}
      <div className="absolute top-[220px] left-0 w-[300px] card p-5 anim-float anim-float-2 shadow-pop">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-ink-500 uppercase tracking-wide">Weekly views</div>
            <div className="mt-1 text-xl font-extrabold text-ink-900">48,210</div>
          </div>
          <span className="pill bg-emerald-50 text-emerald-700">
            <ArrowUpRight className="w-3 h-3" /> +18%
          </span>
        </div>
        <div className="mt-3 h-14 -mx-1">
          <Sparkline values={[6, 8, 5, 9, 7, 11, 9, 12, 10, 14, 13, 18]} />
        </div>
      </div>

      {/* Shortlisted notification */}
      <div className="absolute bottom-4 right-6 w-[260px] card p-4 flex items-center gap-3 anim-float anim-float-3 shadow-pop">
        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="absolute inset-0 rounded-full ring-2 ring-emerald-300 animate-pulse-ring" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-ink-900 truncate">You were shortlisted!</div>
          <div className="text-xs text-ink-500 truncate">Northwind · 2h ago</div>
        </div>
      </div>

      {/* Activity chip */}
      <div className="absolute top-[140px] right-12 card px-3 py-2 anim-float anim-float-2 hidden xl:flex items-center gap-2 text-xs shadow-pop">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span className="font-semibold text-ink-700">+128 proposals today</span>
      </div>
    </>
  );
}

/* ---------- Scene 2: Brand (used by RegisterBrand) ---------- */
function BrandScene() {
  return (
    <>
      {/* Search / discovery card */}
      <div className="absolute top-6 right-2 w-[300px] card p-5 anim-float anim-float-1 shadow-pop">
        <div className="flex items-center gap-2">
          <div className="pill bg-violet-50 text-accent-violet">
            <Search className="w-3 h-3" /> Discovery
          </div>
          <span className="ml-auto text-[10px] text-ink-400 font-semibold">Live</span>
        </div>
        <div className="mt-3 flex items-center gap-2 bg-ink-50 rounded-full px-3 h-10 text-sm text-ink-500">
          <Search className="w-4 h-4" />
          beauty · lifestyle
        </div>
        <div className="mt-3 space-y-2">
          {[
            { initials: 'AJ', tone: 'bg-brand-500',   name: 'Avery Johnson', meta: 'Lifestyle · 38.4K', match: '98%' },
            { initials: 'MP', tone: 'bg-amber-500',   name: 'Mia Park',      meta: 'Beauty · 22.1K',    match: '94%' },
            { initials: 'HK', tone: 'bg-sky-500',     name: 'Hassan Khan',   meta: 'Tech · 14.8K',      match: '91%' },
          ].map((row) => (
            <div key={row.name} className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-ink-50 transition-colors">
              <div className={`w-8 h-8 rounded-full ${row.tone} text-white flex items-center justify-center text-[11px] font-bold`}>
                {row.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-ink-900 truncate flex items-center gap-1">
                  {row.name}
                  <BadgeCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                </div>
                <div className="text-[11px] text-ink-500 truncate">{row.meta}</div>
              </div>
              <span className="pill bg-emerald-50 text-emerald-700">{row.match}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Campaign card with sparkline */}
      <div className="absolute top-[260px] left-0 w-[300px] card p-5 anim-float anim-float-2 shadow-pop">
        <div className="flex items-center gap-2">
          <span className="pill bg-brand-50 text-brand-700">
            <Megaphone className="w-3 h-3" /> Campaign
          </span>
          <span className="ml-auto text-[10px] text-ink-400 font-semibold">12 proposals</span>
        </div>
        <div className="mt-2 text-sm font-bold text-ink-900 leading-snug">
          Launch our adaptogenic cold brew
        </div>
        <div className="mt-1 text-xs text-ink-500">Northwind · $1,200 / creator</div>
        <div className="mt-3 h-12 -mx-1">
          <Sparkline values={[5, 7, 6, 9, 8, 12, 10, 13, 11, 15, 14, 17]} tone="violet" />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex -space-x-2">
            {['AJ', 'MP', 'HK', '+5'].map((i, idx) => (
              <div
                key={i}
                className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white
                  ${idx === 0 ? 'bg-brand-500' : idx === 1 ? 'bg-amber-500' : idx === 2 ? 'bg-sky-500' : 'bg-ink-500'}`}
              >
                {i}
              </div>
            ))}
          </div>
          <span className="pill bg-ink-100 text-ink-700">
            <LineChart className="w-3 h-3" /> 3.2x ROI
          </span>
        </div>
      </div>

      {/* Rating chip */}
      <div className="absolute bottom-6 right-6 card px-3 py-2 anim-float anim-float-3 flex items-center gap-2 text-xs shadow-pop">
        <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
        <span className="font-semibold text-ink-700">4.9 · Demo satisfaction</span>
      </div>

      {/* Verified brand chip */}
      <div className="absolute top-[160px] right-12 card px-3 py-2 anim-float anim-float-2 hidden xl:flex items-center gap-2 text-xs shadow-pop">
        <Building2 className="w-3.5 h-3.5 text-ink-600" />
        <span className="font-semibold text-ink-700">2,400+ demo brands</span>
      </div>
    </>
  );
}

/* ---------- Scene 3: Neutral (used by Login) ---------- */
function NeutralScene() {
  return (
    <>
      {/* Left card: creator profile (small) */}
      <div className="absolute top-6 left-2 w-[240px] card p-4 anim-float anim-float-1 shadow-pop gradient-border">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center text-sm font-bold">AJ</div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center">
              <BadgeCheck className="w-3 h-3 text-teal-600 fill-white" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-ink-900 truncate">Avery Johnson</div>
            <div className="text-xs text-ink-500 truncate">Lifestyle · 38.4K</div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5 text-center">
          <Mini label="Engage" value="4.8%" />
          <Mini label="Rate" value="$450" />
          <Mini label="Match" value="98%" />
        </div>
      </div>

      {/* Right card: campaign match (small) */}
      <div className="absolute top-10 right-0 w-[240px] card p-4 anim-float anim-float-2 shadow-pop">
        <div className="flex items-center gap-2">
          <span className="pill bg-brand-50 text-brand-700">
            <Megaphone className="w-3 h-3" /> Match
          </span>
          <span className="ml-auto text-[10px] text-ink-400 font-semibold">2m</span>
        </div>
        <div className="mt-2 text-sm font-bold text-ink-900 leading-snug">
          Launch our cold brew
        </div>
        <div className="mt-1 text-xs text-ink-500">Northwind · $1,200</div>
        <div className="mt-3 h-9 -mx-1">
          <Sparkline values={[5, 7, 6, 9, 8, 12, 10, 13, 11, 15, 14, 17]} />
        </div>
      </div>

      {/* Bottom card: trust stats */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-[360px] card p-5 anim-float anim-float-3 shadow-pop">
        <div className="grid grid-cols-3 gap-3 text-center">
          <BigStat value="10k+" label="Creators" />
          <BigStat value="2.4k+" label="Brands" />
          <BigStat value="98%" label="Demo love" />
        </div>
        <div className="mt-4 flex items-center justify-center gap-0.5 text-amber-500">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-current" />
          ))}
          <span className="ml-2 text-xs font-semibold text-ink-700">4.9 demo rating</span>
        </div>
      </div>

      {/* Activity chip */}
      <div className="absolute bottom-3 right-6 card px-3 py-2 anim-float anim-float-2 hidden xl:flex items-center gap-2 text-xs shadow-pop">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span className="font-semibold text-ink-700">+128 proposals today</span>
      </div>
    </>
  );
}

/* ---------- Helpers ---------- */
function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-ink-50 py-1.5">
      <div className="text-[9px] uppercase tracking-wide text-ink-500">{label}</div>
      <div className="text-xs font-bold text-ink-900">{value}</div>
    </div>
  );
}

function BigStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-xl font-extrabold text-ink-900 leading-none">{value}</div>
      <div className="text-[11px] text-ink-500 mt-1">{label}</div>
    </div>
  );
}

function Sparkline({ values, tone = 'brand' }: { values: number[]; tone?: 'brand' | 'violet' }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const w = 280;
  const h = 36;
  const stepX = w / (values.length - 1);
  const points = values
    .map((v, i) => `${i * stepX},${h - ((v - min) / Math.max(1, max - min)) * (h - 4) - 2}`)
    .join(' ');
  const color = tone === 'violet' ? '#8B7CFF' : '#14a800';
  const gradId = tone === 'violet' ? 'sparkline-fade-violet' : 'sparkline-fade';
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={`0,${h} ${points} ${w},${h}`} fill={`url(#${gradId})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}