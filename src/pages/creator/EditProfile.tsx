import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FormField, Input, Textarea, Select, Button } from '../../components/ui';
import { useStore, updateCreator, setCreatorPortfolio } from '../../state/Store';
import { useToast } from '../../state/ToastContext';
import { NICHES, PLATFORMS } from '../../data/seed';
import { Trash2, Plus, ExternalLink } from 'lucide-react';

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
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Edit profile</h1>
        <p className="text-sm text-ink-500">Keep this up to date - it's how brands decide to work with you.</p>
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-semibold text-ink-900 mb-4">Basics</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Full name">
            <Input value={form.fullName} onChange={(e) => set('fullName', e.target.value)} />
          </FormField>
          <FormField label="Profile photo URL" helper="Paste a hosted image URL">
            <Input value={form.avatarUrl ?? ''} onChange={(e) => set('avatarUrl', e.target.value)} placeholder="https://…" />
          </FormField>
          <FormField label="Niche">
            <Select value={form.niche} onChange={(e) => set('niche', e.target.value as any)}>
              {NICHES.map((n) => <option key={n}>{n}</option>)}
            </Select>
          </FormField>
          <FormField label="Primary platform">
            <Select value={form.primaryPlatform} onChange={(e) => set('primaryPlatform', e.target.value as any)}>
              {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
            </Select>
          </FormField>
          <FormField label="Location">
            <Input value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="City, Country" />
          </FormField>
        </div>
        <FormField label="Bio" helper="Up to 600 characters">
          <Textarea rows={4} value={form.bio} onChange={(e) => set('bio', e.target.value)} />
        </FormField>
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-semibold text-ink-900 mb-4">Audience stats</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Followers" helper={form.primaryPlatform === 'YouTube' ? 'Pulled from your connected YouTube account' : 'Manually entered. Not verified.'}>
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
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-semibold text-ink-900 mb-4">Rates (USD)</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <FormField label="Per post"><Input type="number" value={form.ratePerPost} onChange={(e) => set('ratePerPost', Number(e.target.value))} /></FormField>
          <FormField label="Per story"><Input type="number" value={form.ratePerStory} onChange={(e) => set('ratePerStory', Number(e.target.value))} /></FormField>
          <FormField label="Per video"><Input type="number" value={form.ratePerVideo} onChange={(e) => set('ratePerVideo', Number(e.target.value))} /></FormField>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-semibold text-ink-900 mb-1">Portfolio links</h3>
        <p className="text-xs text-ink-500 mb-4">Up to 3 external links (YouTube, Vimeo, your site).</p>
        <div className="space-y-2">
          {links.map((l, i) => (
            <div key={l.id} className="flex gap-2">
              <Input
                placeholder="Title (optional)"
                value={l.title ?? ''}
                onChange={(e) => {
                  const next = [...links];
                  next[i] = { ...next[i], title: e.target.value };
                  setLinks(next);
                }}
                className="max-w-[200px]"
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
              <button
                className="btn btn-ghost btn-md"
                onClick={() => setLinks(links.filter((x) => x.id !== l.id))}
                aria-label="Remove link"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
              </button>
            </div>
          ))}
        </div>
        {links.length < 3 && (
          <button
            className="btn btn-secondary btn-sm mt-3"
            onClick={() => setLinks([...links, { id: 'p' + Date.now(), url: '', title: '' }])}
          >
            <Plus className="w-4 h-4" /> Add link
          </button>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <button className="btn btn-secondary btn-md" onClick={() => navigate('/creator/profile')}>Cancel</button>
        <button className="btn btn-primary btn-md" onClick={save}>Save changes</button>
      </div>
    </div>
  );
}