import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  FormField, Input, Textarea, Select, Button, PageHeader, SectionHeader, AddChip,
} from '../../components/ui';
import { useStore, updateCreator } from '../../state/Store';
import { useToast } from '../../state/ToastContext';
import { NICHES, PLATFORMS } from '../../data/seed';
import {
  Trash2, Save, X, RotateCcw, ExternalLink, ArrowLeft, AlertTriangle,
  CheckCircle2, Image as ImageIcon,
} from 'lucide-react';
import { ImagePicker } from '../../components/ImagePicker';
import { ChannelArt } from '../../components/ui';
import clsx from 'clsx';

export default function EditCreatorProfile() {
  const { creator } = useStore();
  const navigate = useNavigate();
  const { push } = useToast();

  // Form state — initialised from the store once, then kept locally so the
  // user can cancel without committing.
  const [form, setForm] = useState({ ...creator });
  const [links, setLinks] = useState(creator.portfolio);

  // When the store changes (e.g. navigation back from elsewhere) we want
  // the form to follow. We only update if the user hasn't already started
  // editing — i.e. we just track the current creator.id and re-init when
  // it changes.
  useEffect(() => {
    setForm({ ...creator });
    setLinks(creator.portfolio);
  }, [creator.id]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm({ ...form, [k]: v });

  const dirty =
    JSON.stringify({ ...form, portfolio: links }) !==
    JSON.stringify({ ...creator, portfolio: creator.portfolio });

  const save = () => {
    updateCreator({ ...form, portfolio: links });
    push('Profile saved', 'success');
    navigate('/creator/profile');
  };

  const reset = () => {
    setForm({ ...creator });
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

        {/* Cover + avatar preview */}
        <section className="card overflow-hidden">
          <div className="px-5 sm:px-6 pt-5 pb-3 flex items-center justify-between gap-2">
            <div>
              <div className="eyebrow">Identity</div>
              <h2 className="font-display text-lg text-ink-900 tracking-[-0.01em] mt-0.5">
                Cover &amp; profile photo
              </h2>
            </div>
            <Link
              to="/creator/profile"
              className="text-xs text-ink-500 hover:text-ink-900 inline-flex items-center gap-1 transition-colors shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View public profile</span>
            </Link>
          </div>

          {/* Live preview */}
          <div className="px-5 sm:px-6 pb-3">
            <div className="relative rounded-md overflow-hidden border border-ink-200">
              {form.coverUrl ? (
                <img
                  src={form.coverUrl}
                  alt="Cover preview"
                  className="w-full aspect-[16/5] object-cover"
                />
              ) : (
                <ChannelArt
                  name={form.fullName}
                  seed={form.id}
                  height={120}
                  className="rounded-none w-full"
                />
              )}
              <div className="absolute -bottom-8 left-5 sm:left-6">
                {form.avatarUrl ? (
                  <img
                    src={form.avatarUrl}
                    alt={form.fullName}
                    className="w-20 h-20 rounded-md object-cover ring-4 ring-paper-50"
                  />
                ) : (
                  <ChannelArt
                    name={form.fullName}
                    seed={form.id}
                    height={80}
                    className="w-20 h-20 rounded-md object-cover ring-4 ring-paper-50"
                  />
                )}
              </div>
            </div>
            <div className="h-10" />
          </div>

          {/* Pickers — stacked so the wide cover sits above the small avatar
              and they don't compete for column space. */}
          <div className="px-5 sm:px-6 pb-5 sm:pb-6 space-y-5">
            <div>
              <Label>Cover image</Label>
              <div className="mt-2">
                <ImagePicker
                  variant="cover"
                  value={form.coverUrl}
                  onChange={(url) => set('coverUrl', url)}
                  onClear={() => set('coverUrl', undefined)}
                  name={form.fullName}
                  helperText="Recommended 1600 × 500. Drag a file or paste a URL."
                />
              </div>
            </div>
            <div>
              <Label>Profile photo</Label>
              <div className="mt-2 max-w-[240px]">
                <ImagePicker
                  variant="avatar"
                  value={form.avatarUrl}
                  onChange={(url) => set('avatarUrl', url)}
                  onClear={() => set('avatarUrl', undefined)}
                  name={form.fullName}
                  aspect="1 / 1"
                  helperText="Square · at least 400 × 400."
                />
              </div>
            </div>
          </div>
        </section>

        {/* Basics */}
        <section className="card p-5 sm:p-6">
          <SectionHeader eyebrow="Basics" title="Identity & niche" />
          <div className="mt-5 grid sm:grid-cols-2 gap-4">
            <FormField label="Full name" htmlFor="fullName" required>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) => set('fullName', e.target.value)}
                placeholder="Your display name"
              />
            </FormField>
            <FormField label="Location" htmlFor="loc" required>
              <Input
                id="loc"
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                placeholder="City, Country"
              />
            </FormField>
            <FormField label="Niche" htmlFor="niche" required>
              <Select
                id="niche"
                value={form.niche}
                onChange={(e) => set('niche', e.target.value as any)}
              >
                {NICHES.map((n) => <option key={n}>{n}</option>)}
              </Select>
            </FormField>
            <FormField label="Primary platform" htmlFor="platform" required>
              <Select
                id="platform"
                value={form.primaryPlatform}
                onChange={(e) => set('primaryPlatform', e.target.value as any)}
              >
                {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
              </Select>
            </FormField>
          </div>
          <div className="mt-4">
            <FormField
              label="Bio"
              htmlFor="bio"
              helper={`${form.bio.length} / 600 characters`}
            >
              <Textarea
                id="bio"
                rows={4}
                maxLength={600}
                value={form.bio}
                onChange={(e) => set('bio', e.target.value)}
                placeholder="Tell brands about you and the work you do best."
              />
            </FormField>
          </div>
        </section>

        {/* Stats */}
        <section className="card p-5 sm:p-6">
          <SectionHeader
            eyebrow="Audience"
            title="Stats"
            description={
              form.primaryPlatform === 'YouTube'
                ? 'YouTube stats are pulled from your connected account. To change them, reconnect or update via YouTube Studio.'
                : 'YouTube is the only platform that auto-verifies stats. For others, numbers here are entered manually.'
            }
          />
          <div className="mt-5 grid sm:grid-cols-2 gap-4">
            <FormField
              label="Followers"
              htmlFor="followers"
              helper={form.primaryPlatform === 'YouTube' ? 'Locked — managed by YouTube' : 'Manually entered. Not verified.'}
            >
              <Input
                id="followers"
                type="number"
                min={0}
                value={form.followers}
                disabled={form.primaryPlatform === 'YouTube'}
                onChange={(e) => set('followers', Number(e.target.value))}
              />
            </FormField>
            <FormField
              label="Engagement rate (%)"
              htmlFor="er"
              helper={form.primaryPlatform === 'YouTube' ? 'Locked — managed by YouTube' : 'Manually entered.'}
            >
              <Input
                id="er"
                type="number"
                min={0}
                step="0.1"
                value={form.engagementRate}
                disabled={form.primaryPlatform === 'YouTube'}
                onChange={(e) => set('engagementRate', Number(e.target.value))}
              />
            </FormField>
          </div>
        </section>

        {/* Rates */}
        <section className="card p-5 sm:p-6">
          <SectionHeader
            eyebrow="Rates"
            title="Pricing (USD)"
            description="Set what you charge for each deliverable type. Brands see these on your profile."
          />
          <div className="mt-5 grid sm:grid-cols-3 gap-4">
            <FormField label="Per post" htmlFor="r-post">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 text-sm">$</span>
                <Input
                  id="r-post"
                  type="number"
                  min={0}
                  className="pl-6"
                  value={form.ratePerPost}
                  onChange={(e) => set('ratePerPost', Number(e.target.value))}
                />
              </div>
            </FormField>
            <FormField label="Per story" htmlFor="r-story">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 text-sm">$</span>
                <Input
                  id="r-story"
                  type="number"
                  min={0}
                  className="pl-6"
                  value={form.ratePerStory}
                  onChange={(e) => set('ratePerStory', Number(e.target.value))}
                />
              </div>
            </FormField>
            <FormField label="Per video" htmlFor="r-video">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 text-sm">$</span>
                <Input
                  id="r-video"
                  type="number"
                  min={0}
                  className="pl-6"
                  value={form.ratePerVideo}
                  onChange={(e) => set('ratePerVideo', Number(e.target.value))}
                />
              </div>
            </FormField>
          </div>
        </section>

        {/* Portfolio */}
        <section className="card p-5 sm:p-6">
          <SectionHeader
            eyebrow="Portfolio"
            title="External links"
            description="Up to 3 links — YouTube, Instagram, your site, anything."
            action={
              links.length < 3 ? (
                <AddChip
                  onClick={() =>
                    setLinks([...links, { id: 'p' + Date.now(), url: '', title: '' }])
                  }
                >
                  Add link
                </AddChip>
              ) : null
            }
          />
          <div className="mt-5 space-y-3">
            {links.length === 0 ? (
              <div className="border border-dashed border-ink-200 rounded-md p-6 text-center">
                <ImageIcon className="w-6 h-6 text-ink-300 mx-auto mb-2" />
                <div className="text-sm text-ink-700 font-semibold">No portfolio links yet</div>
                <div className="text-xs text-ink-500 mt-1">Add up to 3 links to your best work.</div>
              </div>
            ) : (
              links.map((l, i) => (
                <div
                  key={l.id}
                  className="grid sm:grid-cols-[180px_1fr_auto] gap-2 items-start p-3 bg-paper-100/50 rounded-md border border-ink-200"
                >
                  <Input
                    placeholder="Title (optional)"
                    value={l.title ?? ''}
                    onChange={(e) => {
                      const next = [...links];
                      next[i] = { ...next[i], title: e.target.value };
                      setLinks(next);
                    }}
                  />
                  <Input
                    placeholder="https://…"
                    value={l.url}
                    onChange={(e) => {
                      const next = [...links];
                      next[i] = { ...next[i], url: e.target.value };
                      setLinks(next);
                    }}
                  />
                  <Button
                    variant="ghost"
                    onClick={() => setLinks(links.filter((x) => x.id !== l.id))}
                    aria-label="Remove link"
                  >
                    <Trash2 className="w-4 h-4 text-rose-600" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Spacer for sticky save bar */}
        <div className="h-20" aria-hidden />
      </div>

      {/* Sticky save bar */}
      <div
        className={clsx(
          'fixed bottom-0 inset-x-0 z-30 border-t backdrop-blur-md transition-colors',
          dirty
            ? 'bg-paper-50/95 border-ink-200'
            : 'bg-paper-50/80 border-ink-200/60',
        )}
      >
        <div className="container-page py-3 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2">
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
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={reset} disabled={!dirty}>
              <RotateCcw className="w-4 h-4" /> Reset
            </Button>
            <Button variant="secondary" onClick={() => navigate('/creator/profile')}>
              <X className="w-4 h-4" /> Cancel
            </Button>
            <Button onClick={save} disabled={!dirty}>
              <Save className="w-4 h-4" /> Save changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-sm font-semibold text-ink-700">{children}</div>
  );
}
