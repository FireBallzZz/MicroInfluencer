import { Link } from 'react-router-dom';
import AuthShell from '../../components/AuthShell';
import { UserCircle2, Building2, ArrowRight, CheckCheck, Sparkles } from 'lucide-react';

export default function RoleSelection() {
  return (
    <AuthShell
      title="Join Microwork"
      subtitle="Pick how you want to use the platform. You can switch later from your account."
      side={
        <div className="relative">
          <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-brand-200/50 blur-3xl" />
          <div className="absolute -bottom-10 -right-10 w-56 h-56 rounded-full bg-accent-violet/30 blur-3xl" />
          <div className="relative">
            <span className="pill bg-brand-50 text-brand-700 border border-brand-200/60">
              <Sparkles className="w-3.5 h-3.5" /> Why pick a role
            </span>
            <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-[-0.02em] text-ink-900 leading-tight">
              Microwork is built for two different journeys.
            </h2>
            <p className="mt-3 text-ink-700 leading-relaxed">
              Creators get a profile, portfolio and proposals. Brands get discovery, campaign creation and review tools. Choosing the right role means we show you the right home screen from day one.
            </p>
            <ul className="mt-6 space-y-3 text-ink-700">
              {[
                'Free to create an account',
                'Connect YouTube to verify your stats',
                'Real brands, real briefs',
                'Switch demo roles any time',
              ].map((b) => (
                <li key={b} className="flex items-start gap-2.5">
                  <span className="mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-500 text-white">
                    <CheckCheck className="w-3.5 h-3.5" />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      }
    >
      <div className="grid gap-4">
        <Link
          to="/register/creator"
          className="group relative overflow-hidden rounded-2xl p-6 border border-brand-200/70 bg-gradient-to-br from-brand-50 via-white to-white card-hover"
        >
          <div className="pointer-events-none absolute -top-12 -right-12 w-44 h-44 rounded-full bg-brand-300/30 blur-2xl group-hover:scale-125 transition-transform duration-500 ease-out-expo" />
          <div className="relative flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-brand-500 text-white flex items-center justify-center shrink-0 shadow-[0_8px_24px_-6px_rgba(20,168,0,.55)]">
              <UserCircle2 className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-ink-900">I'm a creator</h3>
                <ArrowRight className="w-4 h-4 text-ink-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all duration-200" />
              </div>
              <p className="text-sm text-ink-600 mt-1">
                Build a profile, show your audience stats and apply to brand campaigns.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {['Verified stats', 'Proposals', 'Portfolio'].map((b) => (
                  <span key={b} className="pill bg-white border border-brand-200/60 text-brand-700">{b}</span>
                ))}
              </div>
            </div>
          </div>
        </Link>

        <Link
          to="/register/brand"
          className="group relative overflow-hidden rounded-2xl p-6 border border-violet-200/70 bg-gradient-to-br from-violet-50 via-white to-white card-hover"
        >
          <div className="pointer-events-none absolute -top-12 -right-12 w-44 h-44 rounded-full bg-accent-violet/25 blur-2xl group-hover:scale-125 transition-transform duration-500 ease-out-expo" />
          <div className="relative flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-ink-900 text-white flex items-center justify-center shrink-0 shadow-[0_8px_24px_-6px_rgba(20,22,24,.45)]">
              <Building2 className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-ink-900">I run a brand</h3>
                <ArrowRight className="w-4 h-4 text-ink-400 group-hover:text-accent-violet group-hover:translate-x-0.5 transition-all duration-200" />
              </div>
              <p className="text-sm text-ink-600 mt-1">
                Discover creators, run campaigns and manage proposals from one place.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {['Discovery', 'Campaigns', 'Proposals'].map((b) => (
                  <span key={b} className="pill bg-white border border-violet-200/60 text-accent-violet">{b}</span>
                ))}
              </div>
            </div>
          </div>
        </Link>
      </div>
      <div className="mt-6 text-center text-sm text-ink-500">
        Already have an account? <Link to="/login" className="text-brand-600 hover:underline font-semibold">Log in</Link>
      </div>
    </AuthShell>
  );
}