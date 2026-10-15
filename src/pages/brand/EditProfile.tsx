import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FormField, Input, Textarea, Select, Button, PageHeader, SectionHeader, ChannelArt,
} from '../../components/ui';
import { useStore, updateBrand } from '../../state/Store';
import { useToast } from '../../state/ToastContext';
import {
  Save, X, RotateCcw, ExternalLink, ArrowLeft, AlertTriangle,
  CheckCircle2, Image as ImageIcon,
} from 'lucide-react';
import { ImagePicker } from '../../components/ImagePicker';
import type { BrandProfile } from '../../types';
import clsx from 'clsx';

const INDUSTRIES = [
  'Food & Beverage', 'Beauty', 'Fashion', 'Tech', 'Travel',
  'Finance', 'Health & Wellness', 'Lifestyle', 'Other',
];

const COMPANY_SIZES = ['1–10', '11–50', '51–200', '201–1000', '1000+'] as const;

export default function EditBrandProfile() {
  const { brand } = useStore();
  const navigate = useNavigate();
  const { push } = useToast();
  const [form, setForm] = useState({ ...brand });
  const [initial, setInitial] = useState({ ...brand });

  useEffect(() => {
    setForm({ ...brand });
    setInitial({ ...brand });
  }, [brand.id]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm({ ...form, [k]: v });

  const dirty = JSON.stringify(form) !== JSON.stringify(initial);

  const save = () => {
    updateBrand(form);
    setInitial(form);
    push('Company profile saved', 'success');
    navigate('/brand/profile');
  };

  const reset = () => {
    setForm(initial);
    push('Reverted unsaved changes', 'info');
  };

  return (
    <div className="container-page py-6 sm:py-8">
      <div className="space-y-6 max-w-3xl mx-auto">
        <PageHeader
          eyebrow="Profile"
          title="Edit company profile"
          description="Update how creators see your brand."
          action={
            <Link to="/brand/profile" className="btn btn-secondary btn-sm self-start sm:self-auto">
              <ArrowLeft className="w-4 h-4" /> Back to profile
            </Link>
          }
        />

        {/* Cover + logo */}
        <section className="card overflow-hidden">
          <div className="px-5 sm:px-6 pt-5 pb-3 flex items-center justify-between gap-2">
            <div>
              <div className="eyebrow">Brand</div>
              <h2 className="font-display text-lg text-ink-900 tracking-[-0.01em] mt-0.5">
                Cover &amp; logo
              </h2>
            </div>
            <Link
              to="/brand/profile"
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
                  name={form.companyName}
                  seed={form.id}
                  height={120}
                  className="rounded-none w-full"
                />
              )}
              <div className="absolute -bottom-8 left-5 sm:left-6">
                {form.logoUrl ? (
                  <img
                    src={form.logoUrl}
                    alt={form.companyName}
                    className="w-20 h-20 rounded-md object-cover ring-4 ring-paper-50"
                  />
                ) : (
                  <ChannelArt
                    name={form.companyName}
                    seed={form.id}
                    height={80}
                    className="w-20 h-20 rounded-md ring-4 ring-paper-50"
                  />
                )}
              </div>
            </div>
            <div className="h-10" />
          </div>

          {/* Pickers — stacked so the wide cover sits above the small logo
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
                  name={form.companyName}
                  helperText="Recommended 1600 × 500. Drag a file or paste a URL."
                />
              </div>
            </div>
            <div>
              <Label>Logo</Label>
              <div className="mt-2 max-w-[240px]">
                <ImagePicker
                  variant="avatar"
                  value={form.logoUrl}
                  onChange={(url) => set('logoUrl', url)}
                  onClear={() => set('logoUrl', undefined)}
                  name={form.companyName}
                  aspect="1 / 1"
                  helperText="Square · at least 400 × 400."
                />
              </div>
            </div>
          </div>
        </section>

        {/* Identity */}
        <section className="card p-5 sm:p-6">
          <SectionHeader eyebrow="Identity" title="Company info" />
          <div className="mt-5 grid sm:grid-cols-2 gap-4">
            <FormField label="Company name" htmlFor="company" required>
              <Input
                id="company"
                value={form.companyName}
                onChange={(e) => set('companyName', e.target.value)}
                placeholder="e.g. Northwind Beverages"
              />
            </FormField>
            <FormField label="Industry" htmlFor="industry" required>
              <Select
                id="industry"
                value={form.industry}
                onChange={(e) => set('industry', e.target.value)}
              >
                {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
              </Select>
            </FormField>
            <FormField label="Website" htmlFor="website">
              <Input
                id="website"
                value={form.website}
                onChange={(e) => set('website', e.target.value)}
                placeholder="https://example.com"
                type="url"
              />
            </FormField>
            <FormField label="Company size" htmlFor="size" helper="Optional — affects how creators see you">
              <Select
                id="size"
                value={form.size ?? ''}
                onChange={(e) =>
                  set('size', (e.target.value || undefined) as BrandProfile['size'])
                }
              >
                <option value="">Prefer not to say</option>
                {COMPANY_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </FormField>
            <FormField label="Headquarters" htmlFor="hq" optional>
              <Input
                id="hq"
                value={form.headquarters ?? ''}
                onChange={(e) => set('headquarters', e.target.value || undefined)}
                placeholder="City, Country"
              />
            </FormField>
            <FormField label="Year founded" htmlFor="yr" optional>
              <Input
                id="yr"
                type="number"
                min={1800}
                max={new Date().getFullYear()}
                value={form.foundedYear ?? ''}
                onChange={(e) =>
                  set('foundedYear', e.target.value ? Number(e.target.value) : undefined)
                }
                placeholder="e.g. 2019"
              />
            </FormField>
          </div>
          <div className="mt-4">
            <FormField
              label="About"
              htmlFor="about"
              helper={`${form.about.length} / 800 characters`}
            >
              <Textarea
                id="about"
                rows={5}
                maxLength={800}
                value={form.about}
                onChange={(e) => set('about', e.target.value)}
                placeholder="What you make, who you make it for, what you value in a partnership."
              />
            </FormField>
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
            <Button variant="secondary" onClick={() => navigate('/brand/profile')}>
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
