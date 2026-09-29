import { Link } from 'react-router-dom';
import AuthShell from '../../components/AuthShell';
import { UserCircle2, Building2, ArrowRight } from 'lucide-react';

export default function RoleSelection() {
  return (
    <AuthShell
      title="Join Microwork"
      subtitle="Choose how you want to use the platform. You can't switch later - so pick the one that fits."
      side={
        <div>
          <h2 className="text-2xl font-bold text-ink-900">Why pick a role?</h2>
          <p className="mt-3 text-ink-700 leading-relaxed">
            Microwork is built for two different journeys. Creators get a profile, portfolio and proposals. Brands get discovery, campaign creation and review tools.
          </p>
          <ul className="mt-6 space-y-3 text-ink-700">
            <li>✓ Free to create an account</li>
            <li>✓ Connect YouTube to verify your stats</li>
            <li>✓ Real brands, real briefs</li>
          </ul>
        </div>
      }
    >
      <div className="grid gap-4">
        <Link
          to="/register/creator"
          className="card p-5 hover:border-brand-500 hover:shadow-pop transition-all group flex items-start gap-4"
        >
          <div className="w-12 h-12 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
            <UserCircle2 className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-ink-900">I’m a creator</h3>
              <ArrowRight className="w-4 h-4 text-ink-400 group-hover:text-brand-500 transition-colors" />
            </div>
            <p className="text-sm text-ink-600 mt-1">
              Build a profile, show your audience stats and apply to brand campaigns.
            </p>
          </div>
        </Link>
        <Link
          to="/register/brand"
          className="card p-5 hover:border-brand-500 hover:shadow-pop transition-all group flex items-start gap-4"
        >
          <div className="w-12 h-12 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-ink-900">I run a brand</h3>
              <ArrowRight className="w-4 h-4 text-ink-400 group-hover:text-brand-500 transition-colors" />
            </div>
            <p className="text-sm text-ink-600 mt-1">
              Discover creators, run campaigns and manage proposals from one place.
            </p>
          </div>
        </Link>
      </div>
      <div className="mt-6 text-center text-sm text-ink-500">
        Already have an account? <Link to="/login" className="text-brand-600 hover:underline">Log in</Link>
      </div>
    </AuthShell>
  );
}