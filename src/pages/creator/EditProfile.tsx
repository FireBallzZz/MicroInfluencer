import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  FormField, Input, Textarea, Select, Button, PageHeader, SectionHeader,
} from '../../components/ui';
import {
  useStore, updateCreator, setCreatorPortfolio, loadCreatorProfile,
} from '../../state/Store';
import { useToast } from '../../state/ToastContext';
import { NICHES, PLATFORMS } from '../../data/seed';
import {
  Trash2, Save, X, RotateCcw, ExternalLink, ArrowLeft, AlertTriangle,
  CheckCircle2, Image as ImageIcon,
} from 'lucide-react';
import { ImagePicker } from '../../components/ImagePicker';
import { ChannelArt } from '../../components/ui';
import type { CreatorProfile } from '../../types';
import clsx from 'clsx';
import { isApiError } from '../../api/client';

export default function EditCreatorProfile() {
  const { creator } = useStore();
  const navigate = useNavigate();
  const { push } = useToast();
  const [form, setForm] = useState<CreatorProfile | null>(creator);
  const [links, setLinks] = useState(creator?.portfolio ?? []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Ensure the latest profile is loaded before the user edits stale data.
    if (!creator || !creator.id) {
      loadCreatorProfile().catch(() => undefined);
    } else {
      setForm(creator);
      setLinks(creator.portfolio);
    }
  }, [creator?.id]);

  if (!creator || !creator.id || !form) {
    return (
      <div className="container-page py-8">
        <div className="card p-8 text-center text-sm text-ink-500">Loading your profile…</div>
      </div>
    );
  }

  const set = <K extends keyof CreatorProfile>(k: K, v: CreatorProfile[K]) =>
    setForm((prev) => (prev ? { ...prev, [k]: v } : prev));

  const dirty =
    JSON.stringify({ ...form, portfolio: links }) !==
    JSON.stringify({ ...creator, portfolio: creator.portfolio });

  const save = async () => {
    setSaving(true);
    try {
      await updateCreator({
        fullName: form.fullName,
        bio: form.bio,
        niche: form.niche,
        primaryPlatform: form.primaryPlatform,
        location: form.location,
        ratePerPost: form.ratePerPost,
        ratePerStory: form.ratePerStory,
        ratePerVideo: form.ratePerVideo,
      });
      await setCreatorPortfolio(links.filter((l) => l.url));
      push('Profile saved', 'success');
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
            eyebrow="Audience"
            title="Stats"
            description={
              form.primaryPlatform === 'YouTube'
                ? 'YouTube stats come from your connected account. To change them, reconnect via the Accounts page.'
                : 'YouTube is the only platform that auto-verifies stats. For others, the numbers below are entered manually.'
            }
          />
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Followers" htmlFor="followers" helper={form.primaryPlatform === 'YouTube' ? 'Managed by YouTube' : 'Manually entered. Not verified.'}>
              <Input id="followers" type="number" min={0} value={creator.followers} disabled={form.primaryPlatform === 'YouTube'} />
            </FormField>
            <FormField label="Engagement rate (%)" htmlFor="er" helper={form.primaryPlatform === 'YouTube' ? 'Managed by YouTube' : 'Manually entered.'}>
              <Input id="er" type="number" min={0} step="0.1" value={creator.engagementRate} disabled={form.primaryPlatform === 'YouTube'} />
            </FormField>
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
