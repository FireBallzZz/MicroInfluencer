import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import {
  FormField, Input, Textarea, Select, Button, PageHeader, SectionHeader, PlatformIcon,
} from '../../components/ui';
import {
  useStore, updateCreator, setCreatorPortfolio, loadCreatorProfile,
  uploadCreatorPhoto, removeCreatorPhoto, directConnectYouTube, saveManualPlatformStats,
} from '../../state/Store';
import { useToast } from '../../state/ToastContext';
import { NICHES, PLATFORMS } from '../../data/seed';
import {
  Trash2, Save, X, RotateCcw, ExternalLink, ArrowLeft, AlertTriangle,
  CheckCircle2, Image as ImageIcon, Camera, Upload, Youtube, Sparkles, RefreshCw,
} from 'lucide-react';
import type { CreatorProfile } from '../../types';
import clsx from 'clsx';
import { isApiError } from '../../api/client';
import { cleanYouTubeHandle, cleanSocialHandle, normalizeSocialUrl } from '../../api/endpoints';

export default function EditCreatorProfile() {
  const { creator } = useStore();
  const navigate = useNavigate();
  const { push } = useToast();
  const [form, setForm] = useState<CreatorProfile | null>(creator);
  const [links, setLinks] = useState(creator?.portfolio ?? []);

  // YouTube
  const [ytHandle, setYtHandle] = useState(
    creator?.connectedAccount?.handle ? cleanYouTubeHandle(creator.connectedAccount.handle) : ''
  );
  const [followers, setFollowers] = useState<number | string>(creator?.followers ?? 0);
  const [engagementRate, setEngagementRate] = useState<number | string>(creator?.engagementRate ?? 3.5);

  // Instagram
  const [igHandle, setIgHandle] = useState('');
  const [igFollowers, setIgFollowers] = useState<number | string>('');
  const [igEngagement, setIgEngagement] = useState<number | string>('3.5');

  // Facebook
  const [fbHandle, setFbHandle] = useState('');
  const [fbFollowers, setFbFollowers] = useState<number | string>('');
  const [fbEngagement, setFbEngagement] = useState<number | string>('3.5');

  const [saving, setSaving] = useState(false);
  const [fetchingLiveYt, setFetchingLiveYt] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Ensure the latest profile is loaded before the user edits stale data.
    if (!creator || !creator.id) {
      loadCreatorProfile().catch(() => undefined);
    } else {
      setForm(creator);
      setLinks(creator.portfolio);
      const h = creator.connectedAccount?.handle || '';
      setYtHandle(h ? cleanYouTubeHandle(h) : '');
      setFollowers(creator.followers ?? 0);
      setEngagementRate(creator.engagementRate ?? 3.5);

      const ig = creator.connectedAccounts?.find((a) => a.platform.toLowerCase() === 'instagram');
      if (ig) {
        setIgHandle(cleanSocialHandle(ig.handle || ig.url || '', 'Instagram'));
        setIgFollowers(ig.followers ?? '');
        setIgEngagement(ig.engagementRate ?? '3.5');
      } else {
        setIgHandle('');
        setIgFollowers('');
        setIgEngagement('3.5');
      }

      const fb = creator.connectedAccounts?.find((a) => a.platform.toLowerCase() === 'facebook');
      if (fb) {
        setFbHandle(cleanSocialHandle(fb.handle || fb.url || '', 'Facebook'));
        setFbFollowers(fb.followers ?? '');
        setFbEngagement(fb.engagementRate ?? '3.5');
      } else {
        setFbHandle('');
        setFbFollowers('');
        setFbEngagement('3.5');
      }
    }
  }, [creator?.id]);

  if (!creator || !creator.id || !form) {
    return (
      <div className="container-page py-8">
        <div className="card p-8 text-center text-sm text-ink-500">Loading your profile…</div>
      </div>
    );
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const updated = await uploadCreatorPhoto(file);
      if (updated) {
        setForm((prev) => (prev ? { ...prev, avatarUrl: updated.avatarUrl } : prev));
        push('Profile picture updated successfully', 'success');
      }
    } catch (err) {
      const msg = isApiError(err) ? err.message : 'Could not upload profile picture.';
      push(msg, 'error');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePhotoDelete = async () => {
    setUploadingPhoto(true);
    try {
      const updated = await removeCreatorPhoto();
      if (updated) {
        setForm((prev) => (prev ? { ...prev, avatarUrl: undefined } : prev));
        push('Profile picture removed', 'info');
      }
    } catch (err) {
      const msg = isApiError(err) ? err.message : 'Could not remove profile picture.';
      push(msg, 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const set = <K extends keyof CreatorProfile>(k: K, v: CreatorProfile[K]) =>
    setForm((prev) => (prev ? { ...prev, [k]: v } : prev));

  const dirty =
    JSON.stringify({ ...form, portfolio: links }) !==
    JSON.stringify({ ...creator, portfolio: creator.portfolio });

  const handleFetchLiveStats = async () => {
    const handleTrimmed = ytHandle.trim();
    if (!handleTrimmed) {
      push('Please enter your YouTube handle or channel link first.', 'error');
      return;
    }
    setFetchingLiveYt(true);
    try {
      await directConnectYouTube({ handle_url: handleTrimmed });
      const refreshed = await loadCreatorProfile();
      if (refreshed) {
        setFollowers(refreshed.followers);
        setEngagementRate(refreshed.engagementRate);
        const h = refreshed.connectedAccount?.handle || '';
        setYtHandle(h ? cleanYouTubeHandle(h) : '');
      }
      push('Live subscribers and channel details fetched from YouTube!', 'success');
    } catch (err) {
      push(isApiError(err) ? err.message : 'Could not fetch live YouTube channel stats.', 'error');
    } finally {
      setFetchingLiveYt(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateCreator({
        fullName: form.fullName,
        avatarUrl: form.avatarUrl ?? null,
        bio: form.bio,
        niche: form.niche,
        primaryPlatform: form.primaryPlatform,
        location: form.location,
        ratePerPost: form.ratePerPost,
        ratePerStory: form.ratePerStory,
        ratePerVideo: form.ratePerVideo,
      });

      const handleTrimmed = ytHandle.trim();
      if (handleTrimmed) {
        await directConnectYouTube({
          handle_url: handleTrimmed,
        }).catch((err) => console.warn('YouTube channel direct connect sync:', err));
      }

      if (igHandle.trim()) {
        const fCount = parseInt(String(igFollowers).replace(/,/g, ''), 10) || 0;
        await saveManualPlatformStats('instagram', {
          followers: fCount,
          engagement_rate: parseFloat(String(igEngagement)) || 0,
          handle_url: normalizeSocialUrl('instagram', igHandle.trim()),
        }).catch((err) => console.warn('Instagram save:', err));
      }

      if (fbHandle.trim()) {
        const fCount = parseInt(String(fbFollowers).replace(/,/g, ''), 10) || 0;
        await saveManualPlatformStats('facebook', {
          followers: fCount,
          engagement_rate: parseFloat(String(fbEngagement)) || 0,
          handle_url: normalizeSocialUrl('facebook', fbHandle.trim()),
        }).catch((err) => console.warn('Facebook save:', err));
      }

      await setCreatorPortfolio(links.filter((l) => l.url));
      push('Profile saved successfully', 'success');
      navigate('/creator/profile');
    } catch (err) {
      const msg = isApiError(err) ? err.message : 'Could not save your profile.';
      push(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setForm(creator);
    setLinks(creator.portfolio);
    push('Reverted unsaved changes', 'info');
  };

  return (
    <div className="container-page py-6 sm:py-8">
      <div className="space-y-6 max-w-3xl mx-auto">
        <PageHeader
          eyebrow="Profile"
          title="Edit profile"
          description="Keep this up to date — it’s how brands decide to work with you."
          action={
            <Link to="/creator/profile" className="btn btn-secondary btn-sm self-start sm:self-auto">
              <ArrowLeft className="w-4 h-4" /> Back to profile
            </Link>
          }
        />

        {/* Profile Picture */}
        <section className="card p-5 sm:p-6">
          <SectionHeader
            eyebrow="Profile photo"
            title="Profile picture"
            description="Upload your picture so brands recognize you instantly across the marketplace."
          />
          <div className="mt-5 flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group shrink-0">
              {form.avatarUrl ? (
                <img
                  src={form.avatarUrl}
                  alt={form.fullName}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-paper-100 border border-ink-200 shadow-sm"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-ink-900 text-paper-50 flex items-center justify-center font-display text-3xl font-bold ring-4 ring-paper-100 border border-ink-200 shadow-sm select-none">
                  {form.fullName.split(' ').map((s) => s[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()}
                </div>
              )}
              {uploadingPhoto && (
                <div className="absolute inset-0 bg-ink-900/60 rounded-full flex items-center justify-center text-paper-50 text-xs font-semibold backdrop-blur-xs">
                  Uploading…
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                >
                  <Camera className="w-4 h-4" />
                  {form.avatarUrl ? 'Change photo' : 'Upload photo'}
                </Button>
                {form.avatarUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-danger hover:bg-rose-50 hover:text-danger"
                    onClick={handlePhotoDelete}
                    disabled={uploadingPhoto}
                  >
                    <Trash2 className="w-4 h-4" /> Remove
                  </Button>
                )}
              </div>
              <p className="text-xs text-ink-500">
                Recommended: Square JPG, PNG, or WebP. Max 5 MB.
              </p>
            </div>
          </div>
        </section>

        <section className="card p-5 sm:p-6">
          <SectionHeader eyebrow="Basics" title="Identity & niche" />
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Full name" htmlFor="fullName" required>
              <Input id="fullName" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder="Your display name" />
            </FormField>
            <FormField label="Location" htmlFor="loc" required>
              <Input id="loc" value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="City, Country" />
            </FormField>
            <FormField label="Niche" htmlFor="niche" required>
              <Select id="niche" value={form.niche} onChange={(e) => set('niche', e.target.value as any)}>
                {NICHES.map((n) => <option key={n}>{n}</option>)}
              </Select>
            </FormField>
            <FormField label="Primary platform" htmlFor="platform" required>
              <Select id="platform" value={form.primaryPlatform} onChange={(e) => set('primaryPlatform', e.target.value as any)}>
                {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
              </Select>
            </FormField>
          </div>
          <div className="mt-4">
            <FormField label="Bio" htmlFor="bio" helper={`${form.bio.length} / 1000 characters`}>
              <Textarea id="bio" rows={4} maxLength={1000} value={form.bio} onChange={(e) => set('bio', e.target.value)} placeholder="Tell brands about you and the work you do best." />
            </FormField>
          </div>
        </section>

        <section className="card p-5 sm:p-6">
          <SectionHeader
            eyebrow="Channels & Reach"
            title="Social Channels & Stats"
            description="Enter your handles and audience metrics across YouTube, Instagram, and Facebook so brands can discover your full reach."
          />
          <div className="mt-5 space-y-6">
            {/* YouTube */}
            <div className="p-4 sm:p-5 rounded-xl border border-ink-200 bg-paper-50/50 space-y-4">
              <div className="flex items-center gap-2">
                <PlatformIcon platform="YouTube" className="w-5 h-5" />
                <h4 className="text-sm font-semibold text-ink-900">YouTube Channel</h4>
                <span className="tag tag-ember text-[10px]">Live Sync Supported</span>
              </div>

              <FormField
                label="YouTube Channel Handle or URL"
                htmlFor="ytHandle"
                helper="e.g. @rajonahmed or https://www.youtube.com/@rajonahmed"
              >
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    id="ytHandle"
                    value={ytHandle}
                    onChange={(e) => setYtHandle(e.target.value)}
                    placeholder="@rajonahmed"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={handleFetchLiveStats}
                    disabled={fetchingLiveYt || !ytHandle.trim()}
                    className="shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${fetchingLiveYt ? 'animate-spin' : ''}`} />
                    {fetchingLiveYt ? 'Fetching…' : 'Fetch live from YouTube'}
                  </Button>
                </div>
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Subscribers / Followers" htmlFor="followers" helper="Verified from YouTube">
                  <Input
                    id="followers"
                    type="number"
                    min={0}
                    value={followers}
                    onChange={(e) => setFollowers(e.target.value)}
                    placeholder="e.g. 25000"
                  />
                </FormField>
                <FormField label="Engagement rate (%)" htmlFor="er" helper="Average engagement (e.g. 3.5)">
                  <Input
                    id="er"
                    type="number"
                    min={0}
                    step="0.1"
                    max={100}
                    value={engagementRate}
                    onChange={(e) => setEngagementRate(e.target.value)}
                    placeholder="e.g. 4.2"
                  />
                </FormField>
              </div>
            </div>

            {/* Instagram */}
            <div className="p-4 sm:p-5 rounded-xl border border-ink-200 bg-paper-50/50 space-y-4">
              <div className="flex items-center gap-2">
                <PlatformIcon platform="Instagram" className="w-5 h-5" />
                <h4 className="text-sm font-semibold text-ink-900">Instagram Profile</h4>
              </div>

              <FormField
                label="Instagram Handle or Link"
                htmlFor="igHandle"
                helper="e.g. @username or https://instagram.com/username"
              >
                <Input
                  id="igHandle"
                  value={igHandle}
                  onChange={(e) => setIgHandle(e.target.value)}
                  placeholder="@username"
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Instagram Followers" htmlFor="igFollowers" helper="Total followers">
                  <Input
                    id="igFollowers"
                    type="number"
                    min={0}
                    value={igFollowers}
                    onChange={(e) => setIgFollowers(e.target.value)}
                    placeholder="e.g. 15000"
                  />
                </FormField>
                <FormField label="Engagement rate (%)" htmlFor="igEr" helper="Estimated %">
                  <Input
                    id="igEr"
                    type="number"
                    min={0}
                    step="0.1"
                    max={100}
                    value={igEngagement}
                    onChange={(e) => setIgEngagement(e.target.value)}
                    placeholder="e.g. 3.8"
                  />
                </FormField>
              </div>
            </div>

            {/* Facebook */}
            <div className="p-4 sm:p-5 rounded-xl border border-ink-200 bg-paper-50/50 space-y-4">
              <div className="flex items-center gap-2">
                <PlatformIcon platform="Facebook" className="w-5 h-5" />
                <h4 className="text-sm font-semibold text-ink-900">Facebook Page</h4>
              </div>

              <FormField
                label="Facebook Page Handle or URL"
                htmlFor="fbHandle"
                helper="e.g. @pagename or https://facebook.com/pagename"
              >
                <Input
                  id="fbHandle"
                  value={fbHandle}
                  onChange={(e) => setFbHandle(e.target.value)}
                  placeholder="@pagename"
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Page Followers / Likes" htmlFor="fbFollowers" helper="Total followers">
                  <Input
                    id="fbFollowers"
                    type="number"
                    min={0}
                    value={fbFollowers}
                    onChange={(e) => setFbFollowers(e.target.value)}
                    placeholder="e.g. 10000"
                  />
                </FormField>
                <FormField label="Engagement rate (%)" htmlFor="fbEr" helper="Estimated %">
                  <Input
                    id="fbEr"
                    type="number"
                    min={0}
                    step="0.1"
                    max={100}
                    value={fbEngagement}
                    onChange={(e) => setFbEngagement(e.target.value)}
                    placeholder="e.g. 2.5"
                  />
                </FormField>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs text-ink-500 pt-1 gap-2">
              <Link to="/creator/accounts" className="text-xs text-rose-600 hover:text-rose-700 hover:underline inline-flex items-center gap-1 font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> Manage OAuth connections & all connected channels
              </Link>
            </div>
          </div>
        </section>

        <section className="card p-5 sm:p-6">
          <SectionHeader
            eyebrow="Rates"
            title="Pricing (USD)"
            description="Set what you charge for each deliverable type. Brands see these on your profile."
          />
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Per post" htmlFor="r-post">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 text-sm">$</span>
                <Input id="r-post" type="number" min={0} className="pl-6" value={form.ratePerPost} onChange={(e) => set('ratePerPost', Number(e.target.value))} />
              </div>
            </FormField>
            <FormField label="Per story" htmlFor="r-story">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 text-sm">$</span>
                <Input id="r-story" type="number" min={0} className="pl-6" value={form.ratePerStory} onChange={(e) => set('ratePerStory', Number(e.target.value))} />
              </div>
            </FormField>
            <FormField label="Per video" htmlFor="r-video">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 text-sm">$</span>
                <Input id="r-video" type="number" min={0} className="pl-6" value={form.ratePerVideo} onChange={(e) => set('ratePerVideo', Number(e.target.value))} />
              </div>
            </FormField>
          </div>
        </section>

        <section className="card p-5 sm:p-6">
          <SectionHeader
            eyebrow="Portfolio"
            title="External links"
            description="Up to 10 links — YouTube, Instagram, your site, anything."
            action={
              links.length < 10 ? (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setLinks([...links, { id: 'p' + Date.now() + Math.random(), url: '', title: '' }])}
                >
                  Add link
                </Button>
              ) : null
            }
          />
          <div className="mt-5 space-y-3">
            {links.length === 0 ? (
              <div className="border border-dashed border-ink-200 rounded-md p-6 text-center">
                <ImageIcon className="w-6 h-6 text-ink-300 mx-auto mb-2" />
                <div className="text-sm text-ink-700 font-semibold">No portfolio links yet</div>
                <div className="text-xs text-ink-500 mt-1">Add up to 10 links to your best work.</div>
              </div>
            ) : (
              links.map((l, i) => (
                <div key={l.id} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center p-3 bg-paper-100/50 rounded-md border border-ink-200">
                  <Input
                    placeholder="Title (optional)"
                    className="sm:w-48 shrink-0"
                    value={l.title ?? ''}
                    onChange={(e) => {
                      const next = [...links];
                      next[i] = { ...next[i], title: e.target.value };
                      setLinks(next);
                    }}
                  />
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Input
                      placeholder="https://…"
                      className="flex-1 min-w-0"
                      value={l.url}
                      onChange={(e) => {
                        const next = [...links];
                        next[i] = { ...next[i], url: e.target.value };
                        setLinks(next);
                      }}
                    />
                    <Button variant="ghost" size="sm" onClick={() => setLinks(links.filter((x) => x.id !== l.id))} aria-label="Remove link" className="shrink-0 p-2 text-rose-600 hover:bg-rose-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <div className="h-20" aria-hidden />
      </div>

      <div
        className={clsx(
          'fixed bottom-0 inset-x-0 z-30 border-t backdrop-blur-md transition-colors',
          dirty ? 'bg-paper-50/95 border-ink-200' : 'bg-paper-50/80 border-ink-200/60',
        )}
      >
        <div className="container-page py-3 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <div className="text-xs text-ink-500 inline-flex items-center gap-2">
            {dirty ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-ember-500" />
                You have unsaved changes
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                All changes saved
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-end">
            <Button variant="ghost" size="sm" onClick={reset} disabled={!dirty} className="px-2 sm:px-3">
              <RotateCcw className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Reset</span>
            </Button>
            <Button variant="secondary" size="sm" onClick={() => navigate('/creator/profile')}>
              <X className="w-3.5 h-3.5" /> Cancel
            </Button>
            <Button size="sm" onClick={save} disabled={!dirty || saving} className="flex-1 sm:flex-initial">
              <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
