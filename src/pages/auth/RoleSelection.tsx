import { Link } from 'react-router-dom';
import AuthShell from '../../components/AuthShell';
import { UserCircle2, Building2, ArrowRight, Check, Sparkles } from 'lucide-react';

export default function RoleSelection() {
  return (
    <AuthShell
      title="Join Microwork"
      subtitle="Pick how you want to use the platform. You can switch later from your account."
      variant="neutral"
    >
      <div className="space-y-3">
        <RoleCard
          to="/register/creator"
          title="I’m a creator"
          body="Build a profile, show your audience stats and apply to brand campaigns."
          icon={<UserCircle2 className="w-6 h-6" />}
          points={['Verified stats', 'Proposals', 'Portfolio']}
          tone="ink"
        />
        <RoleCard
          to="/register/brand"
          title="I run a brand"
          body="Discover creators, run campaigns and manage proposals from one place."
          icon={<Building2 className="w-6 h-6" />}
          points={['Discovery', 'Campaigns', 'Proposals']}
          tone="ember"
        />
      </div>
      <div className="mt-6 text-center text-sm text-ink-500">
        Already have an account? <Link to="/login" className="text-ember-600 hover:text-ember-700 font-semibold">Log in</Link>
      </div>
    </AuthShell>
  );
}

function RoleCard({
  to, title, body, icon, points, tone,
}: {
  to: string; title: string; body: string;
  icon: React.ReactNode; points: string[]; tone: 'ink' | 'ember';
}) {
  return (
    <Link
      to={to}
      className="group card card-hover p-5 sm:p-6 block"
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-md flex items-center justify-center shrink-0
          ${tone === 'ink' ? 'bg-ink-900 text-paper-50' : 'bg-ember-500 text-paper-50'}`}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-ink-900">{title}</h3>
            <ArrowRight className="w-4 h-4 text-ink-300 group-hover:text-ember-600 group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
          </div>
          <p className="text-sm text-ink-500 mt-1 leading-relaxed">{body}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {points.map((b) => (
              <span key={b} className="tag tag-paper">
                <Check className="w-3 h-3" /> {b}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
