import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  CheckCircle2,
  BadgeCheck,
  ArrowRight,
  Briefcase,
  Users,
  Megaphone,
  Star,
  ShieldCheck,
  Heart,
  MessageCircle,
  Play,
  Zap,
  LineChart,
  CheckCheck,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../../state/AuthContext';
import { useState } from 'react';
import CountUp from '../../components/CountUp';
import { useReveal } from '../../hooks/useReveal';

const POPULAR_TALENT = ['Lifestyle', 'Beauty', 'Fitness', 'Food', 'Tech', 'Travel'];
const POPULAR_CAMPAIGNS = ['Product launch', 'Brand awareness', 'Recipe integration', 'Unboxing', 'How-to'];

const PARTNER_LOGOS = [
  'Northwind', 'Hana Studio', 'Brewly', 'Lumen Labs', 'Drift',
  'Kindred', 'Atlas Outdoors', 'Field & Folk', 'Pebble', 'Northwood',
];

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState<'talent' | 'jobs'>('talent');

  const dashboardLink = user
    ? user.role === 'creator'
      ? '/creator/dashboard'
      : '/brand/dashboard'
    : null;

  return (
    <div className="bg-white">
      {/* ===================== HERO ===================== */}
      <section className="relative bg-hero-mesh overflow-hidden">
        <div className="absolute inset-0 bg-grid-soft opacity-70" />
        {/* Animated mesh blobs */}
        <div className="pointer-events-none absolute -top-32 -left-24 w-[520px] h-[520px] rounded-full bg-brand-300/30 blur-3xl animate-mesh-pan" />
        <div className="pointer-events-none absolute -bottom-40 -right-24 w-[560px] h-[560px] rounded-full bg-accent-mint/35 blur-3xl animate-mesh-pan" style={{ animationDelay: '4s' }} />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[640px] rounded-full bg-accent-violet/15 blur-3xl animate-mesh-pan" style={{ animationDelay: '8s' }} />

        <div className="container-page relative pt-10 pb-16 sm:pt-20 sm:pb-28">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <Reveal>
                <div className="inline-flex flex-wrap items-center gap-2 bg-white/80 backdrop-blur border border-ink-200/80 text-ink-700 text-xs font-semibold pl-1.5 pr-3 py-1 rounded-full shadow-card max-w-full">
                  <span className="inline-flex items-center gap-1 bg-brand-500 text-white rounded-full px-2 py-0.5">
                    <Sparkles className="w-3 h-3" /> New
                  </span>
                  <span className="whitespace-normal">A marketplace built for micro-influencers</span>
                  <ArrowRight className="w-3.5 h-3.5 text-ink-400 hidden sm:inline" />
                </div>
              </Reveal>

              <Reveal delay={100}>
                <h1 className="mt-5 sm:mt-6 text-4xl sm:text-5xl lg:text-[72px] leading-[1.02] font-extrabold text-ink-900 tracking-[-0.025em]">
                  Where <span className="text-gradient-brand">small creators</span><br className="hidden sm:block" />
                  meet <span className="text-gradient-brand">real brands.</span>
                </h1>
              </Reveal>

              <Reveal delay={200}>
                <p className="mt-4 sm:mt-5 text-base sm:text-lg text-ink-600 leading-relaxed max-w-xl">
                  Microwork connects micro-influencers with the brands that fit them best. Connect YouTube, show your real stats, run campaigns that actually convert.
                </p>
              </Reveal>

              <Reveal delay={300}>
                <div className="mt-6 sm:mt-8">
                  <div className="hero-tabs mb-3 w-fit max-w-full overflow-x-auto no-scrollbar">
                    <button
                      onClick={() => setTab('talent')}
                      className={`hero-tab ${tab === 'talent' ? 'hero-tab-active' : ''}`}
                    >
                      <Users className="w-4 h-4" /> Find creators
                    </button>
                    <button
                      onClick={() => setTab('jobs')}
                      className={`hero-tab ${tab === 'jobs' ? 'hero-tab-active' : ''}`}
                    >
                      <Briefcase className="w-4 h-4" /> Find jobs
                    </button>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const input = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value;
                      if (tab === 'talent') navigate(`/login?next=/brand/creators&q=${encodeURIComponent(input)}`);
                      else navigate(`/login?next=/creator/campaigns&q=${encodeURIComponent(input)}`);
                    }}
                    className="hero-search"
                  >
                    <Search className="w-5 h-5 text-ink-400 ml-4 sm:ml-5 shrink-0" />
                    <input
                      name="q"
                      placeholder={
                        tab === 'talent'
                          ? 'Search by niche, keyword or platform'
                          : 'Search campaigns by title, brand or category'
                      }
                    />
                    <button type="submit">
                      <span className="hidden sm:inline">Search</span>
                      <span className="sm:hidden"><ArrowRight className="w-4 h-4" /></span>
                      <ArrowRight className="w-4 h-4 hidden sm:inline" />
                    </button>
                  </form>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-ink-500 uppercase tracking-wide mr-1">
                      {tab === 'talent' ? 'Popular talent' : 'Trending briefs'}
                    </span>
                    {(tab === 'talent' ? POPULAR_TALENT : POPULAR_CAMPAIGNS).map((s) => (
                      <button
                        key={s}
                        onClick={() => navigate('/login')}
                        className="pill bg-white border border-ink-200 text-ink-700 hover:border-brand-300 hover:text-brand-700 hover:bg-brand-50 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </Reveal>

              <Reveal delay={400}>
                <div className="mt-6 sm:mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                  <Stat icon={Users} value={<><CountUp to={10} duration={1400} suffix="k+" /></>} label="Sample creators" />
                  <Stat icon={Briefcase} value={<><CountUp to={2400} duration={1600} suffix="+" /></>} label="Sample brands" />
                  <Stat icon={Star} value={<><CountUp to={98} duration={1600} suffix="%" /></>} label="Demo satisfaction" />
                </div>
              </Reveal>
            </div>

            <div className="hidden lg:block lg:col-span-5">
              <HeroVisual />
            </div>
          </div>
        </div>

        <div className="h-12 sm:h-20 bg-gradient-to-b from-transparent to-white" />
      </section>

      {/* ===================== LOGO STRIP ===================== */}
      <section className="bg-white border-y border-ink-100">
        <div className="container-page py-8 sm:py-10">
          <Reveal>
            <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">
              Trusted by 2,400+ demo brands and 10k+ creators
            </p>
          </Reveal>
          <div className="mt-6 marquee-mask overflow-hidden">
            <div className="marquee-track gap-12 pr-12">
              {[...PARTNER_LOGOS, ...PARTNER_LOGOS].map((name, i) => (
                <div
                  key={`${name}-${i}`}
                  className="flex items-center gap-2 text-ink-400 hover:text-ink-700 transition-colors shrink-0"
                >
                  <div className="w-7 h-7 rounded-md bg-ink-100 flex items-center justify-center text-[11px] font-bold text-ink-500">
                    {name[0]}
                  </div>
                  <span className="text-base font-semibold tracking-tight whitespace-nowrap">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== HOW IT WORKS ===================== */}
      <section id="how" className="bg-section-mint py-16 sm:py-24">
        <div className="container-page">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto">
              <div className="pill bg-brand-50 text-brand-700 mx-auto border border-brand-200/60">
                <Zap className="w-3.5 h-3.5" /> How it works
              </div>
              <h2 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-[-0.02em]">A simple way to work together</h2>
              <p className="mt-3 text-ink-600 text-base sm:text-lg">
                No bidding wars, no DM chaos. Just real briefs, real proposals and clear status updates.
              </p>
            </div>
          </Reveal>

          <div className="relative mt-14">
            {/* Connector line (desktop only) */}
            <div className="hidden md:block absolute top-7 left-[14%] right-[14%] h-px bg-gradient-to-r from-transparent via-ink-200 to-transparent" />
            <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
              <Reveal delay={100}>
                <HowCard
                  step="01"
                  icon={ShieldCheck}
                  title="Verified stats"
                  body="Creators connect YouTube for verified follower counts and engagement rates. No more guessing."
                />
              </Reveal>
              <Reveal delay={200}>
                <HowCard
                  step="02"
                  icon={Megaphone}
                  title="Campaigns that fit"
                  body="Brands post briefs with deliverables, budget and deadlines — creators apply with one tap."
                />
              </Reveal>
              <Reveal delay={300}>
                <HowCard
                  step="03"
                  icon={LineChart}
                  title="Track everything"
                  body="Both sides see real-time proposal status. No more wondering where things stand."
                />
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FEATURE GRID ===================== */}
      <section className="bg-white py-16 sm:py-24">
        <div className="container-page">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <Reveal className="lg:col-span-5">
              <div className="pill bg-brand-50 text-brand-700 border border-brand-200/60">
                <Sparkles className="w-3.5 h-3.5" /> Built for both sides
              </div>
              <h2 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-[-0.02em] leading-[1.05]">
                One platform.<br />
                <span className="text-gradient-brand">Two great experiences.</span>
              </h2>
              <p className="mt-4 text-ink-600 text-base sm:text-lg max-w-md">
                Whether you’re a creator with 5k followers or a brand launching your next big campaign, Microwork gives you the tools to make it work.
              </p>
              <ul className="mt-6 space-y-2.5 text-sm text-ink-700 max-w-md">
                {[
                  'Verified YouTube stats — no inflated numbers',
                  'Real briefs with budgets, deliverables and deadlines',
                  'Live proposal status for creators and brands',
                  'Mobile-first design that feels right on any device',
                ].map((b) => (
                  <li key={b} className="flex items-start gap-2.5">
                    <span className="mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-50 text-brand-600 ring-1 ring-brand-200/60">
                      <CheckCheck className="w-3.5 h-3.5" />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </Reveal>

            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
              <Reveal delay={100}>
                <FeatureCard
                  tone="mint"
                  icon={BadgeCheck}
                  title="Verified YouTube"
                  body="OAuth connect pulls real follower counts, view metrics and engagement rate."
                />
              </Reveal>
              <Reveal delay={200}>
                <FeatureCard
                  tone="violet"
                  icon={Megaphone}
                  title="Smart matching"
                  body="Brands see creators whose niche, audience size and platform match the brief."
                />
              </Reveal>
              <Reveal delay={300}>
                <FeatureCard
                  tone="amber"
                  icon={LineChart}
                  title="Live status"
                  body="Pending, shortlisted, accepted, rejected — clear at a glance, no inbox archaeology."
                />
              </Reveal>
              <Reveal delay={400}>
                <FeatureCard
                  tone="coral"
                  icon={ShieldCheck}
                  title="Trust &amp; safety"
                  body="Both sides see real profiles. Demo simulates escrow and dispute handling for hires."
                />
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== DUAL CTA ===================== */}
      <section className="bg-white pb-16 sm:pb-24">
        <div className="container-page">
          <div className="grid md:grid-cols-2 gap-5">
            <Reveal>
              <div id="creators">
                <RoleCTA
                  tone="creator"
                  tag="For creators"
                  title="Build a profile brands actually want to work with."
                  body="Stand out with verified stats, a clean portfolio and one-tap proposals."
                  bullets={[
                    'Verified YouTube connection',
                    'Up to 3 portfolio links',
                    'Apply to relevant campaigns',
                    'Track every proposal in one place',
                  ]}
                  cta="Sign up as creator"
                  onClick={() => navigate('/register/creator')}
                />
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div id="brands">
                <RoleCTA
                  tone="brand"
                  tag="For brands"
                  title="Find the right creators and run real campaigns."
                  body="Discover vetted creators, post briefs in minutes and manage proposals in one place."
                  bullets={[
                    'Search 1,000s of vetted creators',
                    'Filter by niche, platform, followers',
                    'Post a campaign in minutes',
                    'Shortlist, accept and reject proposals',
                  ]}
                  cta="Sign up as brand"
                  onClick={() => navigate('/register/brand')}
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===================== TESTIMONIAL STRIP ===================== */}
      <section className="bg-section-mint py-16 sm:py-24">
        <div className="container-page">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto">
              <div className="pill bg-brand-50 text-brand-700 mx-auto border border-brand-200/60">
                <Heart className="w-3.5 h-3.5" /> Loved by both sides
              </div>
              <h2 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-[-0.02em]">A marketplace that actually works.</h2>
              <div className="mt-5 flex items-center justify-center gap-1.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
                <span className="ml-2 text-sm font-semibold text-ink-700">4.9 from demo participants</span>
              </div>
            </div>
          </Reveal>

          <div className="mt-12 grid md:grid-cols-3 gap-5">
            <Reveal delay={100}>
              <Testimonial
                initials="JL"
                tone="violet"
                quote="We found 3 creators for our launch in two days. The verified YouTube data saved us hours."
                author="Jamie Lee"
                role="Marketing lead"
                org="Northwind Beverages"
                side="brand"
              />
            </Reveal>
            <Reveal delay={200}>
              <Testimonial
                initials="AJ"
                tone="mint"
                quote="My acceptance rate doubled once I connected YouTube. Brands trust me more when my stats are real."
                author="Avery Johnson"
                role="Lifestyle creator"
                org="38.4K subscribers"
                side="creator"
              />
            </Reveal>
            <Reveal delay={300}>
              <Testimonial
                initials="MS"
                tone="amber"
                quote="The proposal flow is clean. No back-and-forth emails, no guessing. Just clear status."
                author="Morgan Singh"
                role="Founder"
                org="Hana Studio"
                side="brand"
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===================== FINAL CTA ===================== */}
      <section className="bg-white py-16 sm:py-24">
        <div className="container-page">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-ink-900 text-white px-5 sm:px-8 lg:px-12 py-10 sm:py-16">
              {/* Glow layers */}
              <div className="absolute -top-24 -right-20 w-[420px] h-[420px] rounded-full bg-brand-500/35 blur-3xl" />
              <div className="absolute -bottom-32 -left-20 w-[440px] h-[440px] rounded-full bg-accent-violet/30 blur-3xl" />
              <div className="absolute inset-0 bg-noise opacity-60 mix-blend-overlay" />
              <div className="absolute inset-0 bg-grid-soft opacity-30" />

              <div className="relative grid lg:grid-cols-3 gap-8 items-center">
                <div className="lg:col-span-2">
                  <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white text-xs font-semibold pl-1.5 pr-3 py-1 rounded-full">
                    <span className="inline-flex items-center gap-1 bg-brand-500 text-white rounded-full px-2 py-0.5">
                      <Sparkles className="w-3 h-3" /> Free
                    </span>
                    60 seconds to get started
                  </div>
                  <h2 className="mt-4 text-3xl sm:text-5xl font-extrabold leading-[1.05] text-white tracking-[-0.02em]">
                    Ready to try the <span className="text-gradient-light">marketplace?</span>
                  </h2>
                  <p className="mt-3 text-ink-300 max-w-xl text-base sm:text-lg">
                    Free to join, takes 60 seconds. Pick a role and explore a fully working demo.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  {dashboardLink ? (
                    <Link to={dashboardLink} className="btn btn-primary btn-lg w-full">
                      Open my dashboard <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <button onClick={() => navigate('/register/role')} className="btn btn-primary btn-lg w-full">
                      Get started — it’s free <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                  <Link
                    to="/login"
                    className="btn btn-lg w-full !text-white !bg-transparent !border-white/30 hover:!bg-white/10"
                  >
                    I already have an account
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

/* ============== helpers ============== */

function Stat({ icon: Icon, value, label }: { icon: typeof Users; value: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-white/80 backdrop-blur border border-ink-200 text-brand-600 flex items-center justify-center shadow-card">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <div className="text-xl sm:text-2xl font-extrabold text-ink-900 leading-none">{value}</div>
        <div className="text-xs text-ink-500 mt-1">{label}</div>
      </div>
    </div>
  );
}

function HowCard({
  step,
  icon: Icon,
  title,
  body,
}: {
  step: string;
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <div className="relative card card-hover p-6 sm:p-7 h-full group">
      {/* step number badge */}
      <div className="absolute -top-3 left-6 inline-flex items-center gap-1.5 bg-white border border-ink-200 text-ink-700 text-[11px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1 shadow-card">
        Step <span className="text-ink-900">{step}</span>
      </div>
      <div className="mt-2 w-12 h-12 rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 text-brand-600 flex items-center justify-center ring-1 ring-brand-200/60 group-hover:scale-110 transition-transform duration-300 ease-out-expo">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="mt-5 text-lg font-bold text-ink-900">{title}</h3>
      <p className="mt-2 text-sm text-ink-600 leading-relaxed">{body}</p>
    </div>
  );
}

function FeatureCard({
  tone,
  icon: Icon,
  title,
  body,
}: {
  tone: 'mint' | 'violet' | 'amber' | 'coral';
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  const tones: Record<string, { bg: string; text: string; ring: string }> = {
    mint:   { bg: 'bg-brand-50',     text: 'text-brand-700',  ring: 'ring-brand-200/60' },
    violet: { bg: 'bg-violet-50',    text: 'text-accent-violet', ring: 'ring-violet-200/60' },
    amber:  { bg: 'bg-amber-50',     text: 'text-amber-700',  ring: 'ring-amber-200/60' },
    coral:  { bg: 'bg-rose-50',      text: 'text-rose-700',   ring: 'ring-rose-200/60' },
  };
  const t = tones[tone];
  return (
    <div className="card card-hover p-5 h-full">
      <div className={`w-10 h-10 rounded-lg ${t.bg} ${t.text} flex items-center justify-center ring-1 ${t.ring}`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="mt-4 text-base font-bold text-ink-900">{title}</h3>
      <p className="mt-1.5 text-sm text-ink-600 leading-relaxed">{body}</p>
    </div>
  );
}

function RoleCTA({
  tone,
  tag,
  title,
  body,
  bullets,
  cta,
  onClick,
}: {
  tone: 'creator' | 'brand';
  tag: string;
  title: string;
  body: string;
  bullets: string[];
  cta: string;
  onClick: () => void;
}) {
  const creatorTone = tone === 'creator';
  return (
    <div
      className={`relative overflow-hidden rounded-3xl p-7 sm:p-9 h-full flex flex-col group
        ${creatorTone
          ? 'bg-gradient-to-br from-brand-50 via-white to-white border border-brand-200/60'
          : 'bg-gradient-to-br from-violet-50 via-white to-white border border-violet-200/60'}
      `}
    >
      {/* Decorative blob */}
      <div className={`pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl opacity-50 ${creatorTone ? 'bg-brand-300/40' : 'bg-accent-violet/30'}`} />

      <div className="relative flex items-center gap-2">
        <span className={`pill ${creatorTone ? 'bg-white text-brand-700 border border-brand-200/60' : 'bg-white text-accent-violet border border-violet-200/60'}`}>
          {tag}
        </span>
      </div>
      <h3 className="relative mt-4 text-2xl sm:text-3xl font-extrabold leading-tight text-ink-900 tracking-[-0.02em]">
        {title}
      </h3>
      <p className="relative mt-3 text-sm sm:text-base text-ink-600">{body}</p>

      <ul className="relative mt-5 space-y-2.5 text-sm text-ink-700 flex-1">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2.5">
            <span className={`mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full
              ${creatorTone ? 'bg-brand-500 text-white' : 'bg-accent-violet text-white'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
            {b}
          </li>
        ))}
      </ul>

      <button
        onClick={onClick}
        className={`btn btn-md mt-7 w-full group/cta
          ${creatorTone
            ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-[0_2px_4px_rgba(20,168,0,.18)] hover:shadow-[0_6px_16px_rgba(20,168,0,.28)]'
            : 'bg-ink-900 text-white hover:bg-ink-800 shadow-[0_2px_4px_rgba(20,22,24,.18)] hover:shadow-[0_6px_16px_rgba(20,22,24,.28)]'}
        `}
      >
        {cta}
        <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/cta:translate-x-0.5" />
      </button>
    </div>
  );
}

function Testimonial({
  initials,
  tone,
  quote,
  author,
  role,
  org,
  side,
}: {
  initials: string;
  tone: 'mint' | 'violet' | 'amber';
  quote: string;
  author: string;
  role: string;
  org: string;
  side: 'creator' | 'brand';
}) {
  const tones: Record<string, { bg: string; text: string }> = {
    mint:   { bg: 'bg-brand-500',     text: 'text-white' },
    violet: { bg: 'bg-accent-violet', text: 'text-white' },
    amber:  { bg: 'bg-amber-500',     text: 'text-white' },
  };
  const t = tones[tone];
  return (
    <div className="card card-hover p-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-0.5 text-amber-400">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-current" />
          ))}
        </div>
        <span className={`pill ${side === 'creator' ? 'bg-brand-50 text-brand-700' : 'bg-violet-50 text-accent-violet'}`}>
          {side === 'creator' ? <><Heart className="w-3 h-3" /> Creator</> : <><Megaphone className="w-3 h-3" /> Brand</>}
        </span>
      </div>
      <p className="mt-4 text-ink-800 leading-relaxed flex-1">“{quote}”</p>
      <div className="mt-5 flex items-center gap-3 pt-4 border-t border-ink-100">
        <div className={`w-10 h-10 rounded-full ${t.bg} ${t.text} flex items-center justify-center font-bold text-sm shrink-0`}>
          {initials}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-ink-900 flex items-center gap-1.5 truncate">
            {author}
            <BadgeCheck className="w-4 h-4 text-teal-600 shrink-0" />
          </div>
          <div className="text-xs text-ink-500 truncate">{role} · {org}</div>
        </div>
      </div>
    </div>
  );
}

function Reveal({
  children,
  className,
  delay,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: 100 | 200 | 300 | 400 | 500;
}) {
  const { ref, visible } = useReveal<HTMLDivElement>({ rootMargin: '0px 0px -8% 0px' });
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className ?? ''}`}
      data-delay={delay}
    >
      {children}
    </div>
  );
}

/* ===================== Hero Visual ===================== */
function HeroVisual() {
  return (
    <div className="relative h-[480px] sm:h-[560px]">
      {/* Backdrop glow */}
      <div className="absolute -inset-10 bg-gradient-radial from-brand-200/40 via-brand-100/10 to-transparent rounded-[2rem] blur-3xl animate-mesh-pan" />

      {/* Floating card 1: Creator profile */}
      <div
        className="absolute top-2 right-0 w-[300px] card p-5 anim-float anim-float-1 shadow-pop gradient-border"
      >
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

      {/* Floating card 2: New match / campaign */}
      <div className="absolute top-[200px] left-0 w-[320px] card p-5 anim-float anim-float-2 shadow-pop">
        <div className="flex items-center gap-2">
          <span className="pill bg-brand-50 text-brand-700">New match</span>
          <span className="pill bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="w-3 h-3" /> Eligible
          </span>
          <span className="ml-auto text-[10px] text-ink-400 font-semibold">2m ago</span>
        </div>
        <div className="mt-3 text-sm font-bold text-ink-900 leading-snug">
          Launch our new adaptogenic cold brew
        </div>
        <div className="mt-1 text-xs text-ink-500">Northwind Beverages · $1,200 / creator</div>
        <div className="mt-3 h-12 -mx-1">
          <Sparkline values={[6, 8, 5, 9, 7, 11, 9, 12, 10, 14, 13, 18]} />
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
          <button className="btn btn-primary btn-sm">
            Apply <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Floating card 3: Notification */}
      <div className="absolute bottom-0 right-6 w-[280px] card p-4 flex items-center gap-3 anim-float anim-float-3 shadow-pop">
        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="absolute inset-0 rounded-full ring-2 ring-emerald-300 animate-pulse-ring" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-ink-900 truncate">You were shortlisted!</div>
          <div className="text-xs text-ink-500 truncate">Northwind Beverages · 2h ago</div>
        </div>
      </div>

      {/* Floating card 4: tiny stat chip */}
      <div className="absolute top-[120px] right-12 card px-3 py-2 anim-float anim-float-2 hidden xl:flex items-center gap-2 text-xs shadow-pop">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span className="font-semibold text-ink-700">+128 proposals this hour</span>
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-ink-50 py-2">
      <div className="text-[10px] uppercase tracking-wide text-ink-500">{label}</div>
      <div className="text-sm font-bold text-ink-900">{value}</div>
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const w = 280;
  const h = 36;
  const stepX = w / (values.length - 1);
  const points = values
    .map((v, i) => `${i * stepX},${h - ((v - min) / Math.max(1, max - min)) * (h - 4) - 2}`)
    .join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkline-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#14a800" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#14a800" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={`0,${h} ${points} ${w},${h}`} fill="url(#sparkline-fade)" />
      <polyline points={points} fill="none" stroke="#14a800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
