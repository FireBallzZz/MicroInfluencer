import { Link } from 'react-router-dom';
import { ArrowLeft, Scale, AlertCircle, ShieldCheck } from 'lucide-react';
import { PageHeader, SectionHeader } from '../../components/ui';

export default function Terms() {
  return (
    <div className="container-page py-8 sm:py-12 max-w-3xl space-y-6">
      <Link to="/" className="text-sm text-ink-600 hover:text-ink-900 inline-flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Home
      </Link>
      <PageHeader
        eyebrow="Last updated"
        title="Terms of Service"
        description="The rules of the road. Short version: be honest, be respectful, don't try to game the system."
      />

      <section className="card p-5 sm:p-6">
        <SectionHeader eyebrow="Accounts" title="1. Your account" />
        <ul className="mt-4 space-y-2 text-sm text-ink-700">
          <li>• You must give accurate registration details. Faking your name, niche, or audience size is a violation.</li>
          <li>• You are responsible for your password. Treat your JWT like a password — it's valid for 24 hours.</li>
          <li>• The role you pick at registration (Creator or Brand) is fixed. To switch, contact support.</li>
        </ul>
      </section>

      <section className="card p-5 sm:p-6">
        <SectionHeader eyebrow="Content" title="2. What you can post" />
        <ul className="mt-4 space-y-2 text-sm text-ink-700">
          <li>• Portfolio links must be yours or work you have the right to share.</li>
          <li>• Proposal cover messages and reviews must be your own words.</li>
          <li>• Don't impersonate, harass, or post illegal content. Admins can suspend or delete accounts that do.</li>
        </ul>
      </section>

      <section className="card p-5 sm:p-6">
        <SectionHeader eyebrow="Proposals" title="3. Working together" />
        <ul className="mt-4 space-y-2 text-sm text-ink-700">
          <li>• Proposals are status-only — no in-platform messaging or negotiation. Email or other tools are fine.</li>
          <li>• A brand's accept or reject is final. The brand can still review the rest of the campaign's proposals.</li>
          <li>• A creator's accepted proposal can be withdrawn (with a reason) — that opens the slot for another creator.</li>
          <li>• "Influencer marketing" is governed by your local advertising-disclosure laws. The platform is not responsible for your compliance.</li>
        </ul>
      </section>

      <section className="card p-5 sm:p-6">
        <SectionHeader eyebrow="Liability" title="4. Disclaimers" />
        <p className="text-sm text-ink-700 mt-4 leading-relaxed">
          Microwork is a matching platform. We do not guarantee audience accuracy, payment, or the behaviour of
          any user. Use the platform at your own discretion.
        </p>
      </section>

      <section className="card p-5 sm:p-6">
        <SectionHeader eyebrow="Termination" title="5. Closing your account" />
        <p className="text-sm text-ink-700 mt-4 leading-relaxed">
          You can stop using the platform at any time. Whole-account deletion is not yet available (Phase 2);
          in the meantime, contact <a className="text-ember-600 hover:text-ember-700 font-semibold" href="mailto:support@microwork.example">support@microwork.example</a>.
        </p>
      </section>

      <div className="text-xs text-ink-500">
        Placeholder terms. Production version will be reviewed by counsel before public launch.
      </div>
    </div>
  );
}
