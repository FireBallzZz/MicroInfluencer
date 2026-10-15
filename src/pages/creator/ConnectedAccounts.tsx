import { Youtube, AlertTriangle, RefreshCw, Unplug, CheckCircle2, Globe2, Lock } from 'lucide-react';
import { useState } from 'react';
import {
  connectYouTube,
  disconnectYouTube,
  updateConnectedAccount,
  useStore,
} from '../../state/Store';
import { ConfirmDialog } from '../../components/Modal';
import { useToast } from '../../state/ToastContext';
import { fmtRelativeTime } from '../../data/seed';
import { Button, PageHeader, SectionHeader, PlatformIcon, StatRow } from '../../components/ui';

export default function ConnectedAccounts() {
  const { connectedAccounts, creator } = useStore();
  const { push } = useToast();
  const yt = connectedAccounts.find((a) => a.platform === 'YouTube');
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Account"
        title="Connected accounts"
        description="Connect YouTube to verify your stats. Other platforms are manual entry only in this version."
      />

      <div className="card overflow-hidden">
        <div className="p-5 sm:p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Youtube className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-ink-900">YouTube</h3>
              <span className="tag tag-ember">Core integration</span>
            </div>
            <p className="text-xs text-ink-500 mt-1">Official OAuth · verified stats</p>
          </div>
          {!yt && (
            <Button onClick={() => {
              connectYouTube();
              push('YouTube connected', 'success');
            }}>Connect YouTube</Button>
          )}
        </div>

        {yt && (
          <>
            {yt.status === 'expired' && (
              <div className="bg-amber-50 border-y border-amber-200 px-5 py-3 flex items-center gap-2 text-sm text-amber-800">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Your YouTube connection expired. Reconnect to keep your stats verified.
              </div>
            )}

            <div className="p-5 sm:p-6 border-t border-ink-200">
              <StatRow
                items={[
                  { label: 'Account', value: `@${yt.handle}` },
                  { label: 'Status', value: yt.verified ? 'Verified' : 'Unverified' },
                  { label: 'Last synced', value: fmtRelativeTime(yt.lastSyncedAt) },
                  { label: 'Followers', value: creator.followers.toLocaleString() },
                ]}
              />
            </div>

            <div className="border-t border-ink-200 p-5 sm:p-6 flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => {
                updateConnectedAccount(yt.id, { lastSyncedAt: new Date().toISOString(), status: 'connected' });
                push('Stats refreshed', 'success');
              }}>
                <RefreshCw className="w-4 h-4" /> Refresh
              </Button>
              {yt.status === 'expired' && (
                <Button onClick={() => { connectYouTube(); push('Reconnected', 'success'); }}>
                  <CheckCircle2 className="w-4 h-4" /> Reconnect
                </Button>
              )}
              <Button variant="ghost" onClick={() => setConfirmDisconnect(true)}>
                <Unplug className="w-4 h-4 text-rose-600" /> Disconnect
              </Button>
            </div>
          </>
        )}
      </div>

      <div className="card p-5 sm:p-6">
        <SectionHeader
          eyebrow="Manual entry"
          title="Other platforms"
          description="OAuth for these platforms isn’t supported in this version. Enter stats on your profile (marked as Unverified)."
        />
        <div className="mt-5 grid sm:grid-cols-3 gap-3">
          {(['Instagram', 'TikTok', 'Facebook'] as const).map((p) => (
            <div key={p} className="p-4 border border-dashed border-ink-200 rounded-md">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink-900 text-sm inline-flex items-center gap-1.5">
                  <PlatformIcon platform={p as any} />
                  {p}
                </span>
                <span className="tag tag-amber"><Lock className="w-3 h-3" /> Manual</span>
              </div>
              <p className="text-xs text-ink-500 mt-2 leading-relaxed">
                OAuth not supported in this version. Enter stats manually on your profile.
              </p>
            </div>
          ))}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDisconnect}
        onClose={() => setConfirmDisconnect(false)}
        onConfirm={() => {
          disconnectYouTube();
          push('YouTube disconnected', 'info');
        }}
        title="Disconnect YouTube?"
        description="Your stats will stay on your profile but will be marked Unverified. You can reconnect any time."
        confirmLabel="Disconnect"
        destructive
      />
    </div>
  );
}
