import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FormField, Input, Textarea, Select, Button, PageHeader, SectionHeader, AddChip } from '../../components/ui';
import { useStore, updateCreator } from '../../state/Store';
import { useToast } from '../../state/ToastContext';
import { NICHES, PLATFORMS } from '../../data/seed';
import { Trash2, Plus } from 'lucide-react';

export default function EditCreatorProfile() {
  const { creator } = useStore();
  const navigate = useNavigate();
  const { push } = useToast();
  const [form, setForm] = useState({ ...creator });
  const [links, setLinks] = useState(creator.portfolio);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm({ ...form, [k]: v });

  const save = () => {
    updateCreator({ ...form, portfolio: links });
    push('Profile saved', 'success');
    navigate('/creator/profile');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        eyebrow="Profile"
        title="Edit profile"
        description="Keep this up to date — it’s how brands decide to work with you."
      />

      <section className="card p-5 sm:p-6">
        <SectionHeader eyebrow="Basics" title="Identity &amp; niche" />
        <div className="mt-5 grid sm:grid-cols-2 gap-4">
          <FormField label="Full name" htmlFor="fullName">
            <Input id="fullName" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} />
          </FormField>
          <FormField label="Profile photo URL" htmlFor="avatar" helper="Paste a hosted image URL" optional>
            <Input id="avatar" value={form.avatarUrl ?? ''} onChange={(e) => set('avatarUrl', e.target.value)} placeholder="https://…" />
          </FormField>
          <FormField label="Niche" htmlFor="niche">
            <Select id="niche" value={form.niche} onChange={(e) => set('niche', e.target.value as any)}>
              {NICHES.map((n) => <option key={n}>{n}</option>)}
            </Select>
          </FormField>
          <FormField label="Primary platform" htmlFor="platform">
            <Select id="platform" value={form.primaryPlatform} onChange={(e) => set('primaryPlatform', e.target.value as any)}>
              {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
            </Select>
          </FormField>
          <FormField label="Location" htmlFor="loc">
            <Input id="loc" value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="City, Country" />
          </FormField>
        </div>
        <div className="mt-4">
          <FormField label="Bio" htmlFor="bio" helper="Up to 600 characters">
            <Textarea id="bio" rows={4} value={form.bio} onChange={(e) => set('bio', e.target.value)} />
          </FormField>
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <SectionHeader eyebrow="Audience" title="Stats" />
        <div className="mt-5 grid sm:grid-cols-2 gap-4">
          <FormField
            label="Followers"
            helper={form.primaryPlatform === 'YouTube' ? 'Pulled from your connected YouTube account.' : 'Manually entered. Not verified.'}
          >
            <Input
              type="number"
              value={form.followers}
              disabled={form.primaryPlatform === 'YouTube'}
              onChange={(e) => set('followers', Number(e.target.value))}
            />
          </FormField>
          <FormField label="Engagement rate (%)">
            <Input
              type="number"
              step="0.1"
              value={form.engagementRate}
              disabled={form.primaryPlatform === 'YouTube'}
              onChange={(e) => set('engagementRate', Number(e.target.value))}
            />
          </FormField>
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <SectionHeader eyebrow="Rates" title="Pricing (USD)" />
        <div className="mt-5 grid sm:grid-cols-3 gap-4">
          <FormField label="Per post">
            <Input type="number" value={form.ratePerPost} onChange={(e) => set('ratePerPost', Number(e.target.value))} />
          </FormField>
          <FormField label="Per story">
            <Input type="number" value={form.ratePerStory} onChange={(e) => set('ratePerStory', Number(e.target.value))} />
          </FormField>
          <FormField label="Per video">
            <Input type="number" value={form.ratePerVideo} onChange={(e) => set('ratePerVideo', Number(e.target.value))} />
          </FormField>
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <SectionHeader
          eyebrow="Portfolio"
          title="External links"
          description="Up to 3 links — YouTube, Instagram, your site."
          action={
            links.length < 3 ? (
              <AddChip onClick={() => setLinks([...links, { id: 'p' + Date.now(), url: '', title: '' }])}>
                Add link
              </AddChip>
            ) : null
          }
        />
        <div className="mt-5 space-y-2.5">
          {links.length === 0 ? (
            <div className="border border-dashed border-ink-200 rounded-md p-5 text-center text-sm text-ink-500">
              No links yet — add up to 3.
            </div>
          ) : (
            links.map((l, i) => (
              <div key={l.id} className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="Title (optional)"
                  value={l.title ?? ''}
                  onChange={(e) => {
                    const next = [...links];
                    next[i] = { ...next[i], title: e.target.value };
                    setLinks(next);
                  }}
                  className="sm:max-w-[200px]"
                />
                <Input
                  placeholder="https://…"
                  value={l.url}
                  onChange={(e) => {
                    const next = [...links];
                    next[i] = { ...next[i], url: e.target.value };
                    setLinks(next);
                  }}
                  className="flex-1"
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

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={() => navigate('/creator/profile')}>Cancel</Button>
        <Button onClick={save}>Save changes</Button>
      </div>
    </div>
  );
}
