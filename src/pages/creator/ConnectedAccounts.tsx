import {
  Youtube, AlertTriangle, RefreshCw, Unplug, CheckCircle2, Lock,
  ArrowUpRight, Sparkles, Link as LinkIcon, Plus, ExternalLink
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  useStore, connectYouTube, completeYouTubeConnect, directConnectYouTube, disconnectYouTube,
  disconnectPlatform, updateConnectedAccount, loadCreatorProfile, saveManualPlatformStats
} from '../../state/Store';
import * as api from '../../api/endpoints';
import { cleanYouTubeHandle, cleanSocialHandle, normalizeSocialUrl } from '../../api/endpoints';
import { ConfirmDialog, Modal } from '../../components/Modal';
import { useToast } from '../../state/ToastContext';
import { fmtRelativeTime, fmtDate } from '../../data/seed';
import { Button, PageHeader, SectionHeader, PlatformIcon, StatRow, FormField, Input } from '../../components/ui';
import { isApiError } from '../../api/client';
import { useLocation } from 'react-router-dom';

export default function ConnectedAccounts() {
  const { connectedAccounts, creator } = useStore();
  const { push } = useToast();
  const yt = connectedAccounts.find((a) => a.platform === 'YouTube');
  const [disconnectTarget, setDisconnectTarget] = useState<{ platform: string; label: string } | null>(null);
  const [working, setWorking] = useState(false);
  const [connectingOAuth, setConnectingOAuth] = useState(false);

  // Modal state
  const [directModalOpen, setDirectModalOpen] = useState(false);
  const [targetPlatform, setTargetPlatform] = useState<'youtube' | 'instagram' | 'tiktok' | 'facebook'>('youtube');
  const [handleUrlInput, setHandleUrlInput] = useState('');
  const [followersInput, setFollowersInput] = useState('');
  const [engagementInput, setEngagementInput] = useState('3.5');
  const [savingStats, setSavingStats] = useState(false);

  const location = useLocation();

  useEffect(() => {
    loadCreatorProfile().catch(() => undefined);

    const params = new URLSearchParams(location.search);
    const ytParam = params.get('youtube');
    const code = params.get('code');
    const stateParam = params.get('state');

    if (ytParam === 'confirm') {
      if (code && stateParam) {
        setConnectingOAuth(true);
        completeYouTubeConnect(code, stateParam)
          .then(async () => {
            await loadCreatorProfile();
            push('YouTube channel connected and verified successfully via Google OAuth!', 'success');
          })
          .catch((err) => {
            const msg = isApiError(err) ? err.message : 'Could not complete YouTube connection.';
            push(msg, 'error');
          })
          .finally(() => {
            setConnectingOAuth(false);
          });
      } else {
        push('YouTube authorisation received. Completing connection…', 'info');
      }
    } else if (ytParam === 'error') {
      const reason = params.get('reason') ?? 'Could not connect YouTube';
      push(`YouTube connect failed: ${reason}`, 'error');
    }

    if (ytParam) {
      const url = new URL(window.location.href);
      url.searchParams.delete('youtube');
      url.searchParams.delete('reason');
      url.searchParams.delete('code');
      url.searchParams.delete('state');
      window.history.replaceState({}, '', url.toString());
    }
  }, [location.search]);

  const onConnectOAuth = async () => {
    setWorking(true);
    try {
      const url = await api.startYouTubeConnect();
      if (!url || url.includes('client_id=&') || !url.includes('client_id=')) {
        push('Google OAuth credentials not configured in .env yet. You can link your YouTube channel below.', 'info');
        openLinkModal('youtube');
        return;
      }
      window.location.assign(url);
    } catch (err) {
      const msg = isApiError(err) ? err.message : 'Could not start YouTube Google connect.';
      push(msg, 'error');
      openLinkModal('youtube');
    } finally {
      setWorking(false);
    }
  };

  const openLinkModal = (platform: 'youtube' | 'instagram' | 'tiktok' | 'facebook') => {
    setTargetPlatform(platform);
    if (platform === 'youtube') {
      const existingHandle = yt?.handle ? cleanYouTubeHandle(yt.handle) : '';
      setHandleUrlInput(existingHandle);
      setFollowersInput(creator?.followers ? String(creator.followers) : '');
      setEngagementInput(creator?.engagementRate ? String(creator.engagementRate) : '3.5');
    } else {
      const acc = connectedAccounts.find((a) => a.platform.toLowerCase() === platform);
      if (acc) {
        setHandleUrlInput(acc.handle || acc.url || '');
        setFollowersInput(acc.followers !== undefined && acc.followers !== null ? String(acc.followers) : '');
        setEngagementInput(acc.engagementRate !== undefined && acc.engagementRate !== null ? String(acc.engagementRate) : '3.5');
      } else {
        setHandleUrlInput('');
        setFollowersInput('');
        setEngagementInput('3.5');
      }
    }
    setDirectModalOpen(true);
  };

  const handleSaveStats = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleUrlInput.trim()) {
      push('Please enter a handle or profile link.', 'error');
      return;
    }

    setSavingStats(true);
    try {
      if (targetPlatform === 'youtube') {
        await directConnectYouTube({
          handle_url: handleUrlInput.trim(),
        });
        await loadCreatorProfile();
        push('YouTube channel connected! Live subscribers and stats fetched directly from YouTube.', 'success');
        setDirectModalOpen(false);
      } else {
        const followers = parseInt(followersInput.replace(/,/g, ''), 10);
        if (isNaN(followers) || followers < 0) {
          push('Please enter a valid follower count.', 'error');
          setSavingStats(false);
          return;
        }

        const formattedUrl = normalizeSocialUrl(targetPlatform, handleUrlInput.trim());

        await saveManualPlatformStats(targetPlatform, {
          followers,
          engagement_rate: parseFloat(engagementInput) || 3.5,
          handle_url: formattedUrl,
        });

        await loadCreatorProfile();
        const platLabel = targetPlatform.charAt(0).toUpperCase() + targetPlatform.slice(1);
        push(`${platLabel} link connected successfully!`, 'success');
        setDirectModalOpen(false);
      }
    } catch (err) {
      const msg = isApiError(err) ? err.message : 'Failed to connect link.';
      push(msg, 'error');
    } finally {
      setSavingStats(false);
    }
  };

  const otherPlatforms = ['Instagram', 'Facebook', 'TikTok'] as const;
  const connectedNonYt = connectedAccounts.filter((a) => a.platform !== 'YouTube');

  return (
    <div className="container-page py-6 sm:py-8">
      <div className="space-y-8 max-w-4xl mx-auto">
        <PageHeader
          eyebrow="Account"
          title="Connected accounts"
          description="Connect via Google OAuth for automated sync and official verification, and link your other social media profiles to showcase your reach."
        />

        {connectingOAuth && (
          <div className="card p-5 bg-ember-50 border-ember-200 flex items-center gap-3 anim-pulse">
            <RefreshCw className="w-5 h-5 text-ember-600 animate-spin shrink-0" />
            <div>
              <div className="text-sm font-semibold text-ember-900">Finalising YouTube connection…</div>
              <div className="text-xs text-ember-700">Verifying your Google authorisation and fetching channel metrics.</div>
            </div>
          </div>
        )}

        {/* YouTube — Primary / OAuth Core */}
        <article className="card overflow-hidden">
          <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100 shadow-xs">
                <Youtube className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-semibold text-ink-900">YouTube Channel</h3>
                  <span className="tag tag-ember">
                    <Sparkles className="w-3 h-3" /> Core integration
                  </span>
                  {yt && (
                    <span className={yt.verified ? 'tag tag-emerald' : 'tag tag-amber'}>
                      {yt.verified ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> OAuth Verified
                        </>
                      ) : (
                        'Channel Linked'
                      )}
                    </span>
                  )}
                </div>
                <p className="text-xs text-ink-500 mt-1">
                  Connect via Google OAuth for automated sync and official verification, or link your channel handle directly.
                </p>
              </div>
            </div>

            {!yt && (
              <div className="flex flex-col sm:flex-row gap-2.5 shrink-0 w-full sm:w-auto">
                <Button
                  variant="primary"
                  onClick={onConnectOAuth}
                  disabled={working || connectingOAuth}
                  className="w-full sm:w-auto"
                >
                  <Youtube className="w-4 h-4" />
                  {working ? 'Opening Google…' : 'Connect via Google OAuth'}
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => openLinkModal('youtube')}
                  disabled={working || connectingOAuth}
                  className="w-full sm:w-auto"
                >
                  Link Handle Directly
                </Button>
              </div>
            )}
          </div>

          {yt && (
            <>
              {yt.status === 'expired' && (
                <div className="bg-amber-50 border-y border-amber-200 px-5 py-3 flex items-center gap-2 text-sm text-amber-800">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Your YouTube OAuth connection expired. Reconnect to keep your automated sync verified.
                </div>
              )}

              <div className="p-5 sm:p-6 border-t border-ink-200 bg-paper-50/50">
                <StatRow
                  items={[
                    {
                      label: 'Account',
                      value: cleanYouTubeHandle(yt.handle),
                    },
                    {
                      label: 'Verification',
                      value: yt.verified ? 'OAuth Verified' : 'Self-reported',
                    },
                    {
                      label: 'Last synced',
                      value: fmtRelativeTime(yt.lastSyncedAt),
                    },
                    {
                      label: 'Subscribers',
                      value: (yt.followers ?? creator?.followers ?? 0).toLocaleString(),
                    },
                  ]}
                />
              </div>

              <div className="border-t border-ink-200 p-4 sm:p-6 flex flex-wrap items-center justify-between gap-3 bg-paper-50">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={working}
                    onClick={async () => {
                      setWorking(true);
                      try {
                        await directConnectYouTube({ handle_url: yt.handle });
                        await loadCreatorProfile();
                        push('Channel statistics refreshed live from YouTube!', 'success');
                      } catch (err) {
                        push(isApiError(err) ? err.message : 'Could not refresh stats.', 'error');
                      } finally {
                        setWorking(false);
                      }
                    }}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${working ? 'animate-spin' : ''}`} /> Refresh stats
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openLinkModal('youtube')}
                  >
                    <LinkIcon className="w-3.5 h-3.5" /> Edit channel info
                  </Button>

                  {yt.status === 'expired' && (
                    <Button size="sm" onClick={onConnectOAuth} disabled={working}>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Reconnect OAuth
                    </Button>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDisconnectTarget({ platform: 'YouTube', label: 'YouTube channel' })}
                  disabled={working}
                  className="text-danger hover:bg-rose-50 hover:text-danger"
                >
                  <Unplug className="w-3.5 h-3.5" /> Disconnect channel
                </Button>
              </div>
            </>
          )}
        </article>

        {/* Connected Non-YouTube Accounts */}
        {connectedNonYt.length > 0 && (
          <section className="space-y-4">
            <SectionHeader
              eyebrow="Linked profiles"
              title="Connected Social Media"
              description="Your linked social media channels with profile links and audience metrics."
            />
            <div className="grid grid-cols-1 gap-4">
              {connectedNonYt.map((acc) => {
                const platformKey = acc.platform.toLowerCase() as 'instagram' | 'tiktok' | 'facebook';
                const isPrimary = creator?.primaryPlatform === acc.platform;
                return (
                  <article key={acc.id} className="card p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-paper-100 flex items-center justify-center shrink-0 border border-ink-200 shadow-xs">
                          <PlatformIcon platform={acc.platform} className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-semibold text-ink-900">{acc.platform} Profile</h3>
                            <span className="tag tag-paper text-[10px]">Profile Linked</span>
                            {isPrimary && (
                              <span className="tag tag-ember text-[10px]">Primary Platform</span>
                            )}
                          </div>
                          {acc.url ? (
                            <a
                              href={acc.url}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="text-xs text-ink-600 hover:text-ink-900 hover:underline mt-1 inline-flex items-center gap-1 font-mono"
                            >
                              {acc.handle}
                              <ExternalLink className="w-3 h-3 text-ink-400" />
                            </a>
                          ) : (
                            <div className="text-xs text-ink-600 font-mono mt-1">{acc.handle}</div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openLinkModal(platformKey)}
                        >
                          <LinkIcon className="w-3.5 h-3.5" /> Edit link
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDisconnectTarget({ platform: acc.platform, label: `${acc.platform} profile` })}
                          className="text-danger hover:bg-rose-50 hover:text-danger"
                        >
                          <Unplug className="w-3.5 h-3.5" /> Disconnect
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-ink-100 grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div>
                        <div className="text-[11px] font-medium text-ink-500 uppercase tracking-wider">Followers</div>
                        <div className="text-sm font-semibold text-ink-900 mt-0.5">
                          {(acc.followers ?? 0).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] font-medium text-ink-500 uppercase tracking-wider">Engagement Rate</div>
                        <div className="text-sm font-semibold text-ink-900 mt-0.5">
                          {acc.engagementRate ?? 0}%
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] font-medium text-ink-500 uppercase tracking-wider">Last Updated</div>
                        <div className="text-sm font-semibold text-ink-900 mt-0.5">
                          {fmtRelativeTime(acc.lastSyncedAt)}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* Link Other Social Platforms */}
        <section className="card p-5 sm:p-6">
          <SectionHeader
            eyebrow="Social links"
            title="Other Social Media"
            description="Add your Instagram, Facebook, or TikTok profile link and audience size."
          />
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {otherPlatforms.map((p) => {
              const platformKey = p.toLowerCase() as 'instagram' | 'tiktok' | 'facebook';
              const isConnected = connectedAccounts.some((a) => a.platform.toLowerCase() === platformKey);
              const isPrimary = creator?.primaryPlatform === p;
              return (
                <div key={p} className="p-4 border border-ink-200 rounded-xl bg-paper-50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-ink-900 text-sm inline-flex items-center gap-1.5 truncate">
                        <PlatformIcon platform={p as any} />
                        {p}
                      </span>
                      {isConnected ? (
                        <span className="tag tag-paper text-[10px]">Linked</span>
                      ) : isPrimary ? (
                        <span className="tag tag-ember shrink-0 text-[10px]">Primary</span>
                      ) : null}
                    </div>
                    <p className="text-xs text-ink-500 mt-2 leading-relaxed">
                      {isConnected
                        ? `Your ${p} link is connected. Click to update metrics or link URL.`
                        : `Add your ${p} link and follower count so brands can view your profile.`}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-ink-100 flex items-center justify-end">
                    <Button
                      variant={isConnected ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => openLinkModal(platformKey)}
                    >
                      {isConnected ? (
                        <>
                          <LinkIcon className="w-3.5 h-3.5" /> Edit {p}
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" /> Link {p}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Link Modal */}
        <Modal
          open={directModalOpen}
          onClose={() => setDirectModalOpen(false)}
          title={
            targetPlatform === 'youtube'
              ? 'Link YouTube Channel'
              : `Link ${targetPlatform.charAt(0).toUpperCase() + targetPlatform.slice(1)} Profile`
          }
          size="md"
        >
          <form onSubmit={handleSaveStats} className="space-y-4 pt-2">
            <p className="text-xs text-ink-600 leading-relaxed">
              {targetPlatform === 'youtube'
                ? 'Enter your YouTube channel handle (e.g. @rajonahmed) or link. We automatically fetch your channel details.'
                : `Enter your ${targetPlatform} profile link or @handle and your follower count.`}
            </p>

            <FormField
              label={
                targetPlatform === 'youtube'
                  ? 'YouTube Channel Handle or URL'
                  : `${targetPlatform.charAt(0).toUpperCase() + targetPlatform.slice(1)} Profile Link or Handle`
              }
              htmlFor="handleUrl"
              required
              helper={
                targetPlatform === 'youtube'
                  ? 'e.g. @rajonahmed or https://www.youtube.com/@rajonahmed'
                  : `e.g. @username or https://${targetPlatform}.com/username`
              }
            >
              <Input
                id="handleUrl"
                value={handleUrlInput}
                onChange={(e) => setHandleUrlInput(e.target.value)}
                placeholder={targetPlatform === 'youtube' ? '@rajonahmed' : '@username'}
                required
              />
            </FormField>

            {targetPlatform !== 'youtube' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  label="Followers / Audience"
                  htmlFor="followers"
                  required
                  helper="Numbers only"
                >
                  <Input
                    id="followers"
                    type="number"
                    min={0}
                    value={followersInput}
                    onChange={(e) => setFollowersInput(e.target.value)}
                    placeholder="e.g. 25000"
                    required
                  />
                </FormField>

                <FormField
                  label="Engagement rate (%)"
                  htmlFor="er"
                  helper="Estimated %"
                >
                  <Input
                    id="er"
                    type="number"
                    step="0.1"
                    min={0}
                    max={100}
                    value={engagementInput}
                    onChange={(e) => setEngagementInput(e.target.value)}
                    placeholder="e.g. 3.5"
                  />
                </FormField>
              </div>
            )}

            <div className="pt-3 border-t border-ink-200 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setDirectModalOpen(false)}
                disabled={savingStats}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={savingStats}
              >
                {savingStats
                  ? (targetPlatform === 'youtube' ? 'Fetching from YouTube…' : 'Saving link…')
                  : (targetPlatform === 'youtube' ? 'Fetch & Link Channel' : 'Save & Link Profile')}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Disconnect confirmation dialog */}
        <ConfirmDialog
          open={!!disconnectTarget}
          onClose={() => setDisconnectTarget(null)}
          onConfirm={async () => {
            const target = disconnectTarget;
            if (!target) return;
            try {
              await disconnectPlatform(target.platform.toLowerCase());
              push(`${target.label} disconnected`, 'info');
            } catch (err) {
              push(isApiError(err) ? err.message : `Could not disconnect ${target.label}.`, 'error');
            } finally {
              setDisconnectTarget(null);
            }
          }}
          title={`Disconnect ${disconnectTarget?.label ?? 'account'}?`}
          description="Your stats for this platform will be removed from your profile. You can re-link at any time."
          confirmLabel="Disconnect"
          destructive
        />
      </div>
    </div>
  );
}
