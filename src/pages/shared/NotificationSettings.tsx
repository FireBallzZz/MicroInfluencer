import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MailCheck, Bell, BellOff, ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import {
  fetchNotificationSettings, updateNotificationSettings,
  type NotificationSettings,
} from '../../api/endpoints';
import { useAuth } from '../../state/AuthContext';
import { useToast } from '../../state/ToastContext';
import { isApiError } from '../../api/client';
import { PageHeader, SectionHeader } from '../../components/ui';
import { fmtDate } from '../../data/seed';

const EVENTS = [
  {
    key: 'proposal_received',
    label: 'New proposal received',
    description: 'When a creator applies to one of your campaigns.',
    roles: ['brand'],
  },
  {
    key: 'proposal_withdrawn',
    label: 'A creator withdrew',
    description: 'When a creator withdraws a proposal. If it was accepted, the note also says a slot opened.',
    roles: ['brand'],
  },
  {
    key: 'campaign_auto_closed',
    label: 'Campaign closed at deadline',
    description: 'When one of your campaigns closes because its application deadline has passed.',
    roles: ['brand'],
  },
  {
    key: 'proposal_shortlisted',
    label: 'You were shortlisted',
    description: 'When a brand marks your proposal as a strong candidate.',
    roles: ['creator'],
  },
  {
    key: 'proposal_accepted',
    label: 'Proposal accepted',
    description: 'When a brand confirms you for a campaign.',
    roles: ['creator'],
  },
  {
    key: 'proposal_rejected',
    label: 'Proposal rejected',
    description: 'When a brand declines your proposal.',
    roles: ['creator'],
  },
  {
    key: 'account_reconnect',
    label: 'Account needs reconnecting',
    description: 'When your YouTube connection expires and stats need a refresh.',
    roles: ['creator'],
  },
] as const;

export default function NotificationSettingsPage() {
  const { user } = useAuth();
  const { push } = useToast();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchNotificationSettings()
      .then((s) => { if (!cancelled) setSettings(s); })
      .catch((err) => { if (!cancelled) setError(isApiError(err) ? err.message : 'Failed to load settings.'); });
    return () => { cancelled = true; };
  }, []);

  const toggle = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const next = await updateNotificationSettings({ emailEnabled: !settings.emailEnabled });
      setSettings(next);
      push('Notification preferences updated', 'success');
    } catch (err) {
      push(isApiError(err) ? err.message : 'Could not update settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;
  const role = user.role;

  return (
    <div className="container-page py-6 sm:py-8 space-y-6 max-w-3xl">
      <Link to={role === 'creator' ? '/creator/dashboard' : '/brand/dashboard'} className="text-sm text-ink-600 hover:text-ink-900 inline-flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <PageHeader
        eyebrow="FR-24"
        title="Notification settings"
        description="In-app notifications are always on. Use this page to also get them as emails."
      />

      {error ? (
        <div className="card p-6 text-sm text-rose-700">{error}</div>
      ) : !settings ? (
        <div className="card p-6 text-sm text-ink-500">Loading…</div>
      ) : (
        <div className="space-y-6">
          <section className="card p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="eyebrow">Email notifications</div>
                <div className="mt-1.5 font-display text-lg text-ink-900 tracking-[-0.01em]">
                  {settings.emailEnabled ? 'On' : 'Off'}
                </div>
                <div className="text-xs text-ink-500 mt-1">
                  When on, the same events that appear in the bell also get sent to {user.email}.
                </div>
              </div>
              <button
                type="button"
                onClick={toggle}
                disabled={saving}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  settings.emailEnabled ? 'bg-ink-900' : 'bg-ink-200'
                } ${saving ? 'opacity-60' : ''}`}
                aria-label="Toggle email notifications"
                aria-pressed={settings.emailEnabled}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    settings.emailEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className={`rounded-md border p-3 flex items-start gap-2 text-sm ${
                settings.emailVerified ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'
              }`}>
                {settings.emailVerified
                  ? <MailCheck className="w-4 h-4 shrink-0 mt-0.5" />
                  : <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
                <div>
                  <div className="font-semibold">
                    {settings.emailVerified ? 'Email verified' : 'Email not verified'}
                  </div>
                  <div className="text-xs mt-0.5">
                    {settings.emailVerified
                      ? 'Notification emails are delivered.'
                      : 'Verify your email to receive notification emails.'}
                  </div>
                  {!settings.emailVerified && (
                    <Link
                      to="/verify-email"
                      state={{ email: user.email }}
                      className="btn btn-secondary btn-sm mt-2"
                    >
                      Verify email
                    </Link>
                  )}
                </div>
              </div>
              <div className="rounded-md border border-ink-200 p-3 text-xs text-ink-500">
                Password-reset and email-verification codes are <strong>always</strong> sent, even with email notifications off.
              </div>
            </div>
          </section>

          <section className="card p-5 sm:p-6">
            <SectionHeader
              eyebrow="What you'll be notified about"
              title="Events"
              description="In-app only — the bell badge and the notifications page. Toggle above to also get these by email."
            />
            <ul className="mt-5 divide-y divide-ink-200/60">
              {EVENTS.filter((e) => (e.roles as readonly string[]).includes(role)).map((e) => (
                <li key={e.key} className="py-3 flex items-start gap-3">
                  <span className="w-8 h-8 rounded-md bg-ink-100 text-ink-700 flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-ink-900">{e.label}</div>
                    <div className="text-xs text-ink-500 mt-0.5">{e.description}</div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
