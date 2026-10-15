import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  Search,
  BadgeCheck,
  Briefcase,
  Users,
  Megaphone,
  LineChart,
  Check,
  Play,
  Sparkles,
  ArrowRight,
  ChevronRight,
  CircleDot,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../../state/AuthContext';
import { useEffect, useState } from 'react';
import CountUp from '../../components/CountUp';
import { useReveal } from '../../hooks/useReveal';

/* ─────────────────────── Data ─────────────────────── */

const TALENT = ['Lifestyle', 'Beauty', 'Fitness', 'Food', 'Tech', 'Travel', 'Gaming', 'Finance'];
const BRIEFS  = ['Product launch', 'Brand awareness', 'Recipe integration', 'Unboxing', 'How-to', 'Series deal'];

const PARTNERS = [
  'Northwind', 'Hana Studio', 'Brewly', 'Lumen Labs', 'Drift',
  'Kindred', 'Atlas Outdoors', 'Field & Folk', 'Pebble', 'Northwood',
  'Coriander', 'Vela Goods', 'Otto Coffee', 'Mara Skincare', 'Loomwell',
];

/* Live, deterministic-looking activity feed for the "Live market" section. */
const FEED = [
  { tone: 'shortlist', who: 'Northwind Beverages', on: 'Avery Johnson', niche: 'Lifestyle', time: '2m' },
  { tone: 'proposal',  who: 'Hana Studio',         on: 'Mia Park',       niche: 'Beauty',    time: '4m' },
  { tone: 'accept',    who: 'Brewly Coffee',       on: 'Hassan Khan',    niche: 'Tech',      time: '6m' },
  { tone: 'shortlist', who: 'Drift Apparel',       on: 'Eun-ji Park',    niche: 'Streetwear',time: '9m' },
  { tone: 'proposal',  who: 'Kindred Snacks',      on: 'Liam Carter',    niche: 'Food',      time: '12m' },
  { tone: 'accept',    who: 'Lumen Labs',          on: 'Priya Anand',    niche: 'Wellness',  time: '14m' },
  { tone: 'reject',    who: 'Otto Coffee',         on: 'Devon Reyes',    niche: 'Lifestyle', time: '17m' },
  { tone: 'shortlist', who: 'Vela Goods',          on: 'Noor Hassan',    niche: 'Home',      time: '21m' },
];

const TONE_STYLES: Record<string, { icon: JSX.Element; dot: string; text: string; label: string }> = {
  shortlist: { icon: <CircleDot className="w-3 h-3" />, dot: 'bg-amber-500',  text: 'text-amber-700',  label: 'Shortlisted' },
  proposal:  { icon: <TrendingUp className="w-3 h-3" />, dot: 'bg-ink-900',    text: 'text-ink-700',    label: 'New proposal' },
  accept:    { icon: <Check className="w-3 h-3" />,      dot: 'bg-emerald-600',text: 'text-emerald-700',label: 'Accepted' },
  reject:    { icon: <XCircle className="w-3 h-3" />,    dot: 'bg-ink-300',    text: 'text-ink-500',    label: 'Passed' },
};

/* ─────────────────────── Page ─────────────────────── */

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState<'talent' | 'jobs'>('talent');
  const [query, setQuery] = useState('');

  const dashboardLink = user
    ? user.role === 'creator' ? '/creator/dashboard' : '/brand/dashboard'
    : null;

  return (
    <div className="bg-paper-50 text-ink-700">
      <Hero
        tab={tab}
        setTab={setTab}
        query={query}
        setQuery={setQuery}
        onSearch={() => {
          if (tab === 'talent') navigate(`/login?next=/brand/creators&q=${encodeURIComponent(query)}`);
          else navigate(`/login?next=/creator/campaigns&q=${encodeURIComponent(query)}`);
        }}
      />

      <TickerBar />

      <Manifesto />

      <HowItWorks />

      <Roles />

      <LiveMarket />

      <Process />

      <FinalCTA dashboardLink={dashboardLink} onStart={() => navigate('/register/role')} />
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   HERO — type-led, no decorative blobs or floating cards.
   ════════════════════════════════════════════════════════ */

function Hero({
  tab, setTab, query, setQuery, onSearch,
}: {
  tab: 'talent' | 'jobs';
  setTab: (t: 'talent' | 'jobs') => void;
  query: string;
  setQuery: (q: string) => void;
  onSearch: () => void;
}) {
  const navigate = useNavigate();
  return (
    <section className="relative bg-paper-50 overflow-hidden">
      <div className="absolute inset-0 bg-grid-faint pointer-events-none" aria-hidden />

      <div className="container-page relative pt-10 sm:pt-16 pb-14 sm:pb-20">
        {/* Top meta row */}
        <div className="flex items-center justify-between text-xs text-ink-500">
          <div className="eyebrow flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-ember-500" />
            <span>Internship PRD · v0.1</span>
          </div>
          <div className="hidden sm:flex items-center gap-5">
            <span className="font-mono text-ink-400">No. 002 — Marketplace</span>
            <span className="font-mono text-ink-400">/ 2026</span>
          </div>
        </div>

        <div className="mt-10 sm:mt-14 grid lg:grid-cols-12 gap-10 lg:gap-16 items-end">
          {/* Headline */}
          <div className="lg:col-span-8">
            <Reveal>
              <h1 className="display-xl">
                A marketplace for
                <span className="block">
                  <span className="relative inline-block">
                    <span className="relative z-10 italic font-medium">micro</span>
                    <span
                      aria-hidden
                      className="absolute left-0 right-0 bottom-1 h-2.5 bg-ember-200/80 -z-0"
                    />
                  </span>
                  <span>-influencers</span>
                  <span className="text-ink-400"> &amp; </span>
                  <br className="hidden sm:block" />
                  the brands that hire them.
                </span>
              </h1>
            </Reveal>

            <Reveal delay={100}>
              <p className="mt-6 sm:mt-8 text-base sm:text-lg text-ink-500 leading-relaxed max-w-xl">
                Microwork is a working demo of a two-sided marketplace. Creators
                connect YouTube for verified stats; brands post briefs with real
                budgets; proposals move through a clean status flow. No bidding
                wars, no DM archaeology.
              </p>
            </Reveal>

            <Reveal delay={200}>
              <div className="mt-7 sm:mt-9 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate('/register/role')}
                  className="btn btn-primary btn-lg"
                >
                  Try the demo
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a href="#how" className="btn btn-secondary btn-lg">
                  <Play className="w-3.5 h-3.5 fill-current" />
                  See how it works
                </a>
              </div>
            </Reveal>
          </div>

          {/* Search — desktop right column */}
          <div className="lg:col-span-4">
            <Reveal delay={300}>
              <div className="card p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <span className="eyebrow">Try a search</span>
                  <span className="tag tag-outline">Live</span>
                </div>

                <div className="mt-4 flex border border-ink-200 rounded-sm overflow-hidden">
                  <button
                    onClick={() => setTab('talent')}
                    className={`flex-1 h-10 text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors
                      ${tab === 'talent' ? 'bg-ink-900 text-paper-50' : 'bg-paper-50 text-ink-700 hover:bg-paper-100'}`}
                  >
                    <Users className="w-3.5 h-3.5" /> Creators
                  </button>
                  <button
                    onClick={() => setTab('jobs')}
                    className={`flex-1 h-10 text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors
                      ${tab === 'jobs' ? 'bg-ink-900 text-paper-50' : 'bg-paper-50 text-ink-700 hover:bg-paper-100'}`}
                  >
                    <Briefcase className="w-3.5 h-3.5" /> Briefs
                  </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); onSearch(); }} className="mt-3 flex items-center border border-ink-200 bg-paper-50 rounded-sm focus-within:border-ink-900 transition-colors">
                  <Search className="w-4 h-4 text-ink-400 ml-3.5 shrink-0" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={tab === 'talent' ? 'Try “beauty · 30K-80K”' : 'Try “unboxing · <$2k”'}
                    className="flex-1 h-11 px-3 bg-transparent text-sm text-ink-900 placeholder:text-ink-400 outline-none"
                  />
                  <button
                    type="submit"
                    className="h-11 px-4 text-ink-900 hover:text-ember-600 text-[13px] font-semibold flex items-center gap-1 border-l border-ink-200"
                    aria-label="Search"
                  >
                    Go <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {(tab === 'talent' ? TALENT : BRIEFS).slice(0, 6).map((s) => (
                    <button
                      key={s}
                      onClick={() => onSearch()}
                      className="tag tag-paper hover:bg-ink-100 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Stat band */}
        <Reveal delay={300}>
          <div className="mt-14 sm:mt-20 grid grid-cols-2 sm:grid-cols-4 gap-y-8 gap-x-6 border-t border-ink-200 pt-8">
            <Stat n={<CountUp to={10420} duration={1400} />} label="Creators on platform" />
            <Stat n={<><CountUp to={2418} duration={1400} suffix="+" /></>} label="Brands running briefs" />
            <Stat n={<><CountUp to={3.2} duration={1400} decimals={1} suffix="x" /></>} label="Median ROI on hires" />
            <Stat n={<><CountUp to={94} duration={1400} suffix="%" /></>} label="Briefs filled in 7d" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Stat({ n, label }: { n: React.ReactNode; label: string }) {
  return (
    <div>
      <div className="font-display text-[clamp(1.75rem,3.4vw,2.6rem)] font-semibold leading-none text-ink-900 tracking-[-0.025em]">
        {n}
      </div>
      <div className="mt-2 text-[12px] font-medium text-ink-500 leading-snug max-w-[18ch]">
        {label}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   TICKER — partner strip as a slow, deliberate marquee.
   ════════════════════════════════════════════════════════ */

function TickerBar() {
  return (
    <section className="border-y border-ink-200 bg-paper-100/50 py-6 overflow-hidden">
      <div className="container-page mb-3 flex items-center justify-between text-ink-500">
        <span className="eyebrow">Trusted by teams at</span>
        <span className="hidden sm:block eyebrow text-ink-400">2,400+ demo brands</span>
      </div>
      <div className="marquee-mask overflow-hidden">
        <div className="marquee-track gap-12 pr-12">
          {[...PARTNERS, ...PARTNERS].map((name, i) => (
            <div
              key={`${name}-${i}`}
              className="flex items-center gap-2.5 text-ink-500 hover:text-ink-900 transition-colors shrink-0"
            >
              <span className="font-mono text-[11px] text-ink-400">0{(i % PARTNERS.length) + 1}</span>
              <span className="font-display text-[20px] font-medium tracking-[-0.01em] whitespace-nowrap">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════
   MANIFESTO — single editorial line + a 3-line grid.
   ════════════════════════════════════════════════════════ */

function Manifesto() {
  return (
    <section className="container-page py-20 sm:py-28">
      <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
        <div className="lg:col-span-4">
          <Reveal>
            <span className="eyebrow">/ 01 — The problem</span>
            <h2 className="display-md mt-4">
              Influencer marketing<br />
              stopped making sense.
            </h2>
          </Reveal>
        </div>
        <div className="lg:col-span-7 lg:col-start-6">
          <Reveal delay={100}>
            <p className="text-ink-700 text-lg sm:text-xl leading-relaxed">
              Big platforms reward big creators. Brands pay inflated rates for
              audiences they can&apos;t verify. Smaller creators — the ones with
              real, loyal followings — get buried in DMs.
            </p>
            <p className="mt-4 text-ink-500 text-base sm:text-lg leading-relaxed">
              Microwork is a working prototype that flips the model: verified
              stats, transparent briefs, a single status flow for both sides.
            </p>
          </Reveal>

          <Reveal delay={200}>
            <ul className="mt-10 grid sm:grid-cols-2 gap-x-10 gap-y-5 text-sm">
              {[
                ['Verified YouTube stats', 'No inflated follower counts. Engagement and views come straight from the API.'],
                ['Briefs with budgets',    'Every campaign lists deliverables, deadline and per-creator rate up front.'],
                ['One status flow',        'Shortlist, accept, reject — visible to both sides at all times.'],
                ['No DM archaeology',      'Proposals, comments and files all live next to the brief.'],
              ].map(([title, body]) => (
                <li key={title} className="flex gap-3">
                  <span className="mt-1.5 inline-block w-1.5 h-1.5 rounded-full bg-ember-500 shrink-0" />
                  <div>
                    <div className="font-semibold text-ink-900">{title}</div>
                    <div className="mt-1 text-ink-500 leading-relaxed">{body}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════
   HOW IT WORKS — three editorial step cards.
   ════════════════════════════════════════════════════════ */

function HowItWorks() {
  return (
    <section id="how" className="bg-ink-900 text-ink-200 py-20 sm:py-28 relative overflow-hidden">
      {/* Very subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
        aria-hidden
      />

      <div className="container-page relative">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-ink-700/70 pb-8">
          <Reveal>
            <span className="eyebrow text-ink-400">/ 02 — How it works</span>
            <h2 className="display-lg mt-3 text-paper-50 max-w-xl">
              Three steps. <span className="text-ink-400">Both sides.</span>
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-ink-300 max-w-sm text-base sm:text-lg">
              The whole flow takes about 60 seconds to grasp. We&apos;ll walk
              it through both sides of the marketplace.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-px bg-ink-700/70 border border-ink-700/70">
          <Reveal delay={100}>
            <Step
              n="01"
              side="Creator"
              icon={<BadgeCheck className="w-4 h-4" />}
              title="Connect &amp; get verified."
              body="OAuth your YouTube channel. We pull your real subscriber count, view rate and engagement. No screenshots, no claims."
              meta="~ 30 seconds"
            />
          </Reveal>
          <Reveal delay={200}>
            <Step
              n="02"
              side="Brand"
              icon={<Megaphone className="w-4 h-4" />}
              title="Post a brief with a budget."
              body="Set deliverables, deadline and per-creator rate. The brief goes live to matched creators within minutes."
              meta="~ 5 minutes"
            />
          </Reveal>
          <Reveal delay={300}>
            <Step
              n="03"
              side="Both"
              icon={<LineChart className="w-4 h-4" />}
              title="Move proposals through a clean status."
              body="Shortlist, accept, reject — visible to both sides. No inbox archaeology, no &ldquo;just checking in&rdquo; emails."
              meta="Ongoing"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Step({
  n, side, icon, title, body, meta,
}: {
  n: string; side: string;
  icon: JSX.Element; title: React.ReactNode; body: string; meta: string;
}) {
  return (
    <article className="bg-ink-900 p-7 sm:p-9 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] tracking-[0.2em] text-ink-400">STEP {n}</span>
        <span className="tag tag-outline !text-ink-300 !border-ink-600 flex items-center gap-1.5">
          {icon} {side}
        </span>
      </div>
      <h3 className="mt-10 font-display text-2xl sm:text-3xl text-paper-50 leading-[1.1] tracking-[-0.02em]"
          dangerouslySetInnerHTML={{ __html: title as string }} />
      <p className="mt-4 text-ink-300 leading-relaxed text-[15px]"
         dangerouslySetInnerHTML={{ __html: body }} />
      <div className="mt-auto pt-8 flex items-center gap-2 text-xs text-ink-400">
        <span className="w-1.5 h-1.5 rounded-full bg-ember-400" />
        <span className="font-mono uppercase tracking-[0.14em]">{meta}</span>
      </div>
    </article>
  );
}

/* ════════════════════════════════════════════════════════
   ROLES — two stacked editorial cards (creator / brand).
   ════════════════════════════════════════════════════════ */

function Roles() {
  const navigate = useNavigate();
  return (
    <section className="container-page py-20 sm:py-28">
      <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-end mb-12 sm:mb-16">
        <div className="lg:col-span-7">
          <Reveal>
            <span className="eyebrow">/ 03 — Pick a side</span>
            <h2 className="display-lg mt-3">
              Two roles, <span className="text-ink-400">one</span> clean flow.
            </h2>
          </Reveal>
        </div>
        <Reveal delay={100} className="lg:col-span-5">
          <p className="text-ink-500 text-lg leading-relaxed">
            The demo ships with both sides fully wired. Sign up as a creator or
            a brand and you can move through a complete proposal loop in a few
            minutes.
          </p>
        </Reveal>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Reveal>
          <RoleCard
            id="creators"
            tone="creator"
            tag="For creators"
            title="Build a profile brands actually want to work with."
            body="Stand out with verified stats, a clean portfolio and one-tap proposals."
            points={[
              'Verified YouTube connection',
              'Up to 3 portfolio links',
              'Apply to relevant campaigns',
              'Track every proposal in one place',
            ]}
            cta="Sign up as creator"
            onClick={() => navigate('/register/creator')}
          />
        </Reveal>
        <Reveal delay={100}>
          <RoleCard
            id="brands"
            tone="brand"
            tag="For brands"
            title="Find the right creators and run real campaigns."
            body="Discover vetted creators, post briefs in minutes and manage proposals in one place."
            points={[
              'Search 1,000s of vetted creators',
              'Filter by niche, platform, followers',
              'Post a campaign in minutes',
              'Shortlist, accept and reject proposals',
            ]}
            cta="Sign up as brand"
            onClick={() => navigate('/register/brand')}
          />
        </Reveal>
      </div>
    </section>
  );
}

function RoleCard({
  id, tone, tag, title, body, points, cta, onClick,
}: {
  id: string;
  tone: 'creator' | 'brand';
  tag: string; title: string; body: string;
  points: string[]; cta: string; onClick: () => void;
}) {
  const isCreator = tone === 'creator';
  return (
    <article
      id={id}
      className={`relative overflow-hidden rounded-[20px] border p-7 sm:p-10
        ${isCreator
          ? 'bg-ink-900 text-paper-50 border-ink-900'
          : 'bg-paper-50 text-ink-900 border-ink-200'}`}
    >
      {/* Tiny corner mark */}
      <div
        className={`absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 rounded-full
        ${isCreator ? 'bg-ember-500/15' : 'bg-ember-500/10'}`}
        aria-hidden
      />

      <div className="relative flex items-center justify-between">
        <span className={`eyebrow ${isCreator ? 'text-ink-400' : 'text-ink-500'}`}>
          {tag}
        </span>
        <ArrowUpRight
          className={`w-4 h-4 ${isCreator ? 'text-ink-400' : 'text-ink-500'}`}
        />
      </div>

      <h3
        className={`relative mt-6 font-display tracking-[-0.02em] leading-[1.05]
        text-[clamp(1.5rem,2.6vw,2rem)]
        ${isCreator ? 'text-paper-50' : 'text-ink-900'}`}
      >
        {title}
      </h3>
      <p className={`relative mt-3 text-[15px] leading-relaxed max-w-md ${isCreator ? 'text-ink-300' : 'text-ink-500'}`}>
        {body}
      </p>

      <ul className="relative mt-7 grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-2.5">
            <span
              className={`mt-0.5 inline-flex items-center justify-center w-4 h-4 shrink-0
              ${isCreator
                ? 'bg-ember-500 text-paper-50'
                : 'bg-ink-900 text-paper-50'}`}
              style={{ borderRadius: 3 }}
            >
              <Check className="w-3 h-3" />
            </span>
            <span className={isCreator ? 'text-paper-200' : 'text-ink-700'}>
              {p}
            </span>
          </li>
        ))}
      </ul>

      <div className="relative mt-9">
        <button
          onClick={onClick}
          className={`btn btn-md
            ${isCreator
              ? 'bg-paper-50 text-ink-900 hover:bg-paper-100'
              : 'btn-primary'}`}
        >
          {cta}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </article>
  );
}

/* ════════════════════════════════════════════════════════
   LIVE MARKET — activity ticker + a sample brief card.
   ════════════════════════════════════════════════════════ */

function LiveMarket() {
  const [feedIndex, setFeedIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setFeedIndex((i) => (i + 1) % FEED.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, []);

  // Show three items rotating through the feed
  const visible = [0, 1, 2].map((o) => FEED[(feedIndex + o) % FEED.length]);

  return (
    <section id="market" className="bg-paper-100/60 border-y border-ink-200 py-20 sm:py-28">
      <div className="container-page">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-5">
            <Reveal>
              <span className="eyebrow">/ 04 — Live market</span>
              <h2 className="display-lg mt-3">
                Proposals, <span className="text-ink-400">moving.</span>
              </h2>
              <p className="mt-5 text-ink-500 text-lg max-w-md leading-relaxed">
                A taste of what activity looks like inside the platform. Every
                row is a real status change — shortlist, new proposal, accept,
                pass — flowing through the marketplace right now.
              </p>

              <div className="mt-8 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-blink" />
                <span className="eyebrow text-ink-700">Streaming demo data</span>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal delay={100}>
              <div className="card overflow-hidden">
                <div className="flex items-center justify-between px-5 sm:px-6 py-3 border-b border-ink-200">
                  <div className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-blink" />
                    <span className="text-[13px] font-semibold text-ink-900">Activity</span>
                    <span className="text-ink-400 text-xs">·</span>
                    <span className="font-mono text-[11px] text-ink-500">last 30m</span>
                  </div>
                  <span className="font-mono text-[11px] text-ink-500 hidden sm:inline">
                    auto-refresh 3s
                  </span>
                </div>

                <ul className="divide-y divide-ink-200">
                  {visible.map((row, idx) => {
                    const t = TONE_STYLES[row.tone];
                    return (
                      <li
                        key={`${feedIndex}-${idx}-${row.who}`}
                        className="grid grid-cols-12 items-center gap-3 px-5 sm:px-6 py-4 animate-fade-in"
                      >
                        <div className="col-span-1 flex justify-center">
                          <span className={`w-2 h-2 rounded-full ${t.dot}`} />
                        </div>
                        <div className="col-span-7 sm:col-span-7 min-w-0">
                          <div className="text-sm text-ink-900 truncate">
                            <span className={`font-semibold ${t.text}`}>{t.label}</span>
                            <span className="text-ink-500"> · {row.who} → </span>
                            <span className="font-semibold">{row.on}</span>
                          </div>
                          <div className="text-xs text-ink-500 truncate mt-0.5">
                            {row.niche} · YouTube
                          </div>
                        </div>
                        <div className="col-span-4 sm:col-span-4 text-right">
                          <span className="font-mono text-[11px] text-ink-500 uppercase tracking-[0.1em]">
                            {row.time} ago
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div className="px-5 sm:px-6 py-3 border-t border-ink-200 bg-paper-50 flex items-center justify-between">
                  <span className="text-[12px] text-ink-500">
                    Showing 3 of <span className="font-mono text-ink-900">128</span> events
                  </span>
                  <a href="#" className="text-[12px] font-semibold text-ink-900 hover:text-ember-600 inline-flex items-center gap-1">
                    Open full feed <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="mt-5 grid sm:grid-cols-3 gap-px border border-ink-200 bg-ink-200">
                <MiniStat label="Active briefs"      value="312" />
                <MiniStat label="Open proposals"     value="1,840" />
                <MiniStat label="Avg. fill time"     value="4.6d" />
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-paper-50 px-5 py-4">
      <div className="font-display text-2xl text-ink-900 leading-none tracking-[-0.02em]">
        {value}
      </div>
      <div className="mt-1.5 text-[11px] uppercase tracking-[0.14em] text-ink-500 font-semibold">
        {label}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   PROCESS — sample brief structure (for brands).
   ════════════════════════════════════════════════════════ */

function Process() {
  return (
    <section className="container-page py-20 sm:py-28">
      <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
        <div className="lg:col-span-4">
          <Reveal>
            <span className="eyebrow">/ 05 — Brief anatomy</span>
            <h2 className="display-md mt-3">
              Every brief looks like this.
            </h2>
            <p className="mt-5 text-ink-500 leading-relaxed">
              A short, opinionated template that&apos;s clear for creators and
              structured for brands. No 12-page PDFs.
            </p>
          </Reveal>
        </div>

        <div className="lg:col-span-8">
          <Reveal delay={100}>
            <article className="card p-6 sm:p-8">
              <header className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="tag tag-ember">Brief</span>
                    <span className="tag tag-paper">Product launch</span>
                    <span className="tag tag-outline">YouTube · 30K–80K</span>
                  </div>
                  <h3 className="mt-3 font-display text-[clamp(1.5rem,2.6vw,2rem)] leading-[1.1] text-ink-900 tracking-[-0.02em]">
                    Launch our new adaptogenic cold brew
                  </h3>
                  <p className="mt-1 text-sm text-ink-500">
                    Northwind Beverages · Posted 2h ago · 12 proposals
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-semibold">
                    Per creator
                  </div>
                  <div className="font-display text-2xl text-ink-900 mt-1">$1,200</div>
                </div>
              </header>

              <dl className="mt-7 grid sm:grid-cols-2 gap-6 text-sm">
                <DefRow label="Deliverables">
                  1 dedicated video (60–90s) + 1 short reel cut
                </DefRow>
                <DefRow label="Deadline">Within 21 days of acceptance</DefRow>
                <DefRow label="Usage rights">Organic only · 90 days</DefRow>
                <DefRow label="Niche">Lifestyle, wellness, morning routines</DefRow>
              </dl>

              <footer className="mt-7 pt-5 border-t border-ink-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex -space-x-2">
                  {['bg-ember-500', 'bg-ink-900', 'bg-ink-500', 'bg-paper-300'].map((c, i) => (
                    <div
                      key={i}
                      className={`w-7 h-7 rounded-full border-2 border-paper-50 flex items-center justify-center text-[10px] font-bold text-paper-50 ${c}`}
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                  <span className="ml-3 text-[11px] uppercase tracking-[0.14em] text-ink-500 font-semibold self-center">
                    + 8 more
                  </span>
                </div>
                <button className="btn btn-primary btn-sm">
                  Apply <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </footer>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function DefRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-1.5 text-ink-700 leading-relaxed">{children}</dd>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   FINAL CTA — confident single band.
   ════════════════════════════════════════════════════════ */

function FinalCTA({ dashboardLink, onStart }: { dashboardLink: string | null; onStart: () => void }) {
  return (
    <section className="container-page pb-20 sm:pb-28">
      <Reveal>
        <div className="relative overflow-hidden bg-ink-900 text-paper-50 rounded-[24px] px-6 sm:px-10 lg:px-14 py-12 sm:py-16">
          {/* Decorative grid */}
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
            aria-hidden
          />
          {/* Ember wedge */}
          <div
            className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-ember-500/30 blur-3xl"
            aria-hidden
          />

          <div className="relative grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7">
              <span className="eyebrow text-ink-400">/ 06 — Get started</span>
              <h2 className="display-lg mt-3 text-paper-50">
                Take it for a spin.<br />
                <span className="text-ember-300 italic font-medium">60 seconds</span> to set up.
              </h2>
              <p className="mt-5 text-ink-300 text-lg max-w-md leading-relaxed">
                Free to explore. Pick a role and you&apos;ll have a working
                dashboard, sample data and a real proposal flow in front of you.
              </p>
            </div>

            <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3">
              {dashboardLink ? (
                <Link to={dashboardLink} className="btn btn-accent btn-lg w-full">
                  Open my dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <button onClick={onStart} className="btn btn-accent btn-lg w-full">
                  Start the demo
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              <Link
                to="/login"
                className="btn btn-lg w-full bg-transparent text-paper-50 border border-ink-600 hover:bg-ink-800"
              >
                I already have an account
              </Link>
              <p className="text-[12px] text-ink-400 mt-1">
                No credit card. No email confirmation. Pure demo.
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ─────────────────────── Reveal wrapper ─────────────────────── */

function Reveal({
  children, className, delay,
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
