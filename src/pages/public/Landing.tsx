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
  TrendingUp,
  Star,
} from 'lucide-react';
import { useAuth } from '../../state/AuthContext';
import { useState } from 'react';

const POPULAR_TALENT = ['Lifestyle', 'Beauty', 'Fitness', 'Food', 'Tech', 'Travel'];
const POPULAR_CAMPAIGNS = ['Product launch', 'Brand awareness', 'Recipe integration', 'Unboxing', 'How-to'];

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
    <div>
      {/* ===================== HERO ===================== */}
      <section className="relative bg-hero-mint overflow-hidden">
        <div className="container-page pt-12 pb-20 sm:pt-20 sm:pb-28">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 bg-white border border-ink-200 text-ink-700 text-xs font-semibold pl-1.5 pr-3 py-1 rounded-full shadow-card">
                <span className="inline-flex items-center gap-1 bg-brand-500 text-white rounded-full px-2 py-0.5">
                  <Sparkles className="w-3 h-3" /> New
                </span>
                A marketplace built for micro-influencers
                <ArrowRight className="w-3.5 h-3.5 text-ink-400" />
              </div>

              <h1 className="anim-hero mt-6 text-[44px] sm:text-[56px] lg:text-[64px] leading-[1.05] font-extrabold text-ink-900 tracking-[-0.02em]">
                Where <span className="text-brand-500">small creators</span><br className="hidden sm:block" />
                meet <span className="text-brand-500">real brands.</span>
              </h1>

              <p className="mt-5 text-lg text-ink-600 leading-relaxed max-w-xl">
                Microwork connects micro-influencers with the brands that fit them best. Connect YouTube, show your real stats, run campaigns that actually convert.
              </p>

              {/* The signature Upwork search */}
              <div className="anim-hero mt-8" style={{ animationDelay: '120ms' }}>
                <div className="hero-tabs mb-3">
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
                  <Search className="w-5 h-5 text-ink-400 ml-5" />
                  <input
                    name="q"
                    placeholder={
                      tab === 'talent'
                        ? 'Search by niche, keyword or platform'
                        : 'Search campaigns by title, brand or category'
                    }
                  />
                  <button type="submit">
                    Search <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-ink-500 uppercase tracking-wide">
                    {tab === 'talent' ? 'Popular talent' : 'Trending briefs'}
                  </span>
                  {(tab === 'talent' ? POPULAR_TALENT : POPULAR_CAMPAIGNS).map((s) => (
                    <button
                      key={s}
                      onClick={() => navigate('/login')}
                      className="pill bg-white border border-ink-200 text-ink-700 hover:border-brand-300 hover:text-brand-700 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="anim-hero mt-8 grid grid-cols-3 gap-6 max-w-lg" style={{ animationDelay: '200ms' }}>
                <Stat value="10k+" label="Sample creators" />
                <Stat value="2.4k+" label="Sample brands" />
                <Stat value="98%" label="Demo satisfaction" />
              </div>
            </div>

            <div className="hidden lg:block lg:col-span-5">
              <HeroVisual />
            </div>
          </div>
        </div>

        <div className="h-10 bg-gradient-to-b from-transparent to-white" />
      </section>

      {/* ===================== HOW IT WORKS ===================== */}
      <section id="how" className="bg-section-mint py-20">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto">
            <div className="pill bg-brand-50 text-brand-700 mx-auto">How it works</div>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold">A simple way to work together</h2>
            <p className="mt-3 text-ink-600">
              No bidding wars, no DM chaos. Just real briefs, real proposals and clear status updates.
            </p>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-5">
            <HowCard
              step="01"
              icon={BadgeCheck}
              title="Verified stats"
              body="Creators connect YouTube for verified follower counts and engagement rates. No more guessing."
            />
            <HowCard
              step="02"
              icon={Megaphone}
              title="Campaigns that fit"
              body="Brands post briefs with deliverables, budget and deadlines - creators apply with one tap."
            />
            <HowCard
              step="03"
              icon={TrendingUp}
              title="Track everything"
              body="Both sides see real-time proposal status. No more wondering where things stand."
            />
          </div>
        </div>
      </section>

      {/* ===================== DUAL CTA ===================== */}
      <section className="bg-white py-20">
        <div className="container-page">
          <div className="grid md:grid-cols-2 gap-5">
            <div id="creators">
              <CTACard
                tag="For creators"
                title="Build a profile brands actually want to work with."
                bullets={[
                  'Verified YouTube connection',
                  'Up to 3 portfolio links',
                  'Apply to relevant campaigns',
                  'Track every proposal',
                ]}
                cta="Sign up as creator"
                onClick={() => navigate('/register/creator')}
              />
            </div>
            <div id="brands">
              <CTACard
                tag="For brands"
                title="Find the right creators and run real campaigns."
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
          </div>
        </div>
      </section>

      {/* ===================== TESTIMONIAL STRIP ===================== */}
      <section className="bg-section-mint py-20">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto">
            <div className="pill bg-brand-50 text-brand-700 mx-auto">Loved by both sides</div>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold">A marketplace that actually works.</h2>
          </div>
          <div className="mt-10 grid md:grid-cols-3 gap-5">
            <Testimonial
              stars={5}
              quote="We found 3 creators for our launch in two days. The verified YouTube data saved us hours."
              author="Marketing lead"
              org="Northwind Beverages"
            />
            <Testimonial
              stars={5}
              quote="My acceptance rate doubled once I connected YouTube. Brands trust me more when my stats are real."
              author="Avery Johnson"
              org="Lifestyle creator · 38K followers"
            />
            <Testimonial
              stars={5}
              quote="The proposal flow is clean. No back-and-forth emails, no guessing. Just clear status."
              author="Founder"
              org="Hana Studio"
            />
          </div>
        </div>
      </section>

      {/* ===================== FINAL CTA ===================== */}
      <section className="bg-white py-20">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-3xl bg-ink-900 text-white px-5 sm:px-8 lg:px-12 py-10 sm:py-14">
            <div className="absolute -top-24 -right-20 w-96 h-96 rounded-full bg-brand-500/30 blur-3xl" />
            <div className="absolute -bottom-24 -left-20 w-96 h-96 rounded-full bg-brand-500/20 blur-3xl" />
            <div className="relative grid lg:grid-cols-3 gap-8 items-center">
              <div className="lg:col-span-2">
                <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight text-white">
                  Ready to try the marketplace?
                </h2>
                <p className="mt-3 text-ink-300 max-w-xl">
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
                  className="btn btn-outline-brand btn-lg w-full !text-white !bg-transparent !border-white/30 hover:!bg-white/10"
                >
                  I already have an account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-extrabold text-ink-900">{value}</div>
      <div className="text-xs text-ink-500 mt-0.5">{label}</div>
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
  icon: typeof BadgeCheck;
  title: string;
  body: string;
}) {
  return (
    <div className="card card-hover p-6 relative overflow-hidden group">
      <div className="absolute top-3 right-4 text-5xl font-extrabold text-ink-900 select-none">{step}</div>
      <div className="w-11 h-11 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm text-ink-600 leading-relaxed">{body}</p>
    </div>
  );
}

function CTACard({
  tag,
  title,
  bullets,
  cta,
  onClick,
}: {
  tag: string;
  title: string;
  bullets: string[];
  cta: string;
  onClick: () => void;
}) {
  return (
    <div className="card p-7 flex flex-col">
      <span className="pill bg-brand-50 text-brand-700 self-start">{tag}</span>
      <h3 className="mt-4 text-2xl font-extrabold leading-tight">{title}</h3>
      <ul className="mt-5 space-y-2.5 text-sm text-ink-700 flex-1">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2.5">
            <span className="mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-50 text-brand-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
            {b}
          </li>
        ))}
      </ul>
      <button onClick={onClick} className="btn btn-primary btn-md mt-6 w-full">
        {cta} <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function Testimonial({ stars, quote, author, org }: { stars: number; quote: string; author: string; org: string }) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-0.5 text-amber-400">
        {Array.from({ length: stars }).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-current" />
        ))}
      </div>
      <p className="mt-3 text-ink-800 leading-relaxed">“{quote}”</p>
      <div className="mt-4 text-sm">
        <div className="font-semibold text-ink-900">{author}</div>
        <div className="text-ink-500">{org}</div>
      </div>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative h-[460px] sm:h-[520px]">
      <div className="absolute -inset-6 bg-brand-200/40 rounded-[2rem] blur-3xl" />

      <div className="absolute top-0 right-0 w-[280px] card p-5 anim-float anim-float-1">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold">AJ</div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-ink-900 truncate">Avery Johnson</span>
              <BadgeCheck className="w-4 h-4 text-teal-600 shrink-0" />
            </div>
            <div className="text-xs text-ink-500 truncate">Lifestyle · YouTube · 38.4K</div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <Mini label="Engagement" value="4.8%" />
          <Mini label="Rate" value="$450" />
          <Mini label="Profile" value="90%" />
        </div>
      </div>

      <div className="absolute top-[160px] left-0 w-[300px] card p-5 anim-float anim-float-2">
        <div className="flex items-center gap-2">
          <span className="pill bg-brand-50 text-brand-700">New match</span>
          <span className="pill bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="w-3 h-3" /> Eligible
          </span>
        </div>
        <div className="mt-3 text-sm font-bold text-ink-900 leading-snug">
          Launch our new adaptogenic cold brew
        </div>
        <div className="mt-1 text-xs text-ink-500">Northwind Beverages · $1,200 / creator</div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex -space-x-2">
            {['AJ', 'MP', 'HK'].map((i, idx) => (
              <div key={i} className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white ${idx === 0 ? 'bg-brand-500' : idx === 1 ? 'bg-amber-500' : 'bg-sky-500'}`}>{i}</div>
            ))}
          </div>
          <button className="btn btn-primary btn-sm">Apply</button>
        </div>
      </div>

      <div className="absolute bottom-0 right-6 w-[260px] card p-4 flex items-center gap-3 anim-float anim-float-3">
        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-ink-900 truncate">You were shortlisted!</div>
          <div className="text-xs text-ink-500 truncate">Northwind Beverages · 2h ago</div>
        </div>
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