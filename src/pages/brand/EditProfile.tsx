import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FormField, Input, Textarea, Select, Button, PageHeader, SectionHeader,
} from '../../components/ui';
import {
  useStore, updateBrand, loadBrandProfile,
  uploadBrandLogo, removeBrandLogo,
} from '../../state/Store';
import { useToast } from '../../state/ToastContext';
import {
  Save, X, RotateCcw, ArrowLeft, AlertTriangle, CheckCircle2, Image as ImageIcon,
  Camera, Upload, Trash2, Building2,
} from 'lucide-react';
import type { BrandProfile } from '../../types';
import clsx from 'clsx';
import { isApiError } from '../../api/client';

const INDUSTRIES = [
  'Food & Beverage', 'Beauty', 'Fashion', 'Tech', 'Travel',
  'Finance', 'Health & Wellness', 'Lifestyle', 'Other',
];

const COMPANY_SIZES = ['1–10', '11–50', '51–200', '201–1000', '1000+'] as const;

export default function EditBrandProfile() {
  const { brand } = useStore();
  const navigate = useNavigate();
  const { push } = useToast();
  const [form, setForm] = useState<BrandProfile | null>(brand);
  const [initial, setInitial] = useState<BrandProfile | null>(brand);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!brand || !brand.id) {
      loadBrandProfile().catch(() => undefined);
    } else {
      setForm(brand);
      setInitial(brand);
    }
  }, [brand?.id]);

  if (!brand || !brand.id || !form) {
    return (
      <div className="container-page py-8">
        <div className="card p-8 text-center text-sm text-ink-500">Loading your company profile…</div>
      </div>
    );
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const updated = await uploadBrandLogo(file);
      if (updated) {
        setForm((prev) => (prev ? { ...prev, logoUrl: updated.logoUrl } : prev));
        push('Brand logo updated successfully', 'success');
      }
    } catch (err) {
      const msg = isApiError(err) ? err.message : 'Could not upload brand logo.';
      push(msg, 'error');
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLogoDelete = async () => {
    setUploadingLogo(true);
    try {
      const updated = await removeBrandLogo();
      if (updated) {
        setForm((prev) => (prev ? { ...prev, logoUrl: undefined } : prev));
        push('Brand logo removed', 'info');
      }
    } catch (err) {
      const msg = isApiError(err) ? err.message : 'Could not remove brand logo.';
      push(msg, 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  const set = <K extends keyof BrandProfile>(k: K, v: BrandProfile[K]) =>
    setForm((prev) => (prev ? { ...prev, [k]: v } : prev));

  const dirty = JSON.stringify(form) !== JSON.stringify(initial);

  const save = async () => {
    setSaving(true);
    try {
      await updateBrand({
        companyName: form.companyName,
        industry: form.industry,
        website: form.website,
        about: form.about,
        logoUrl: form.logoUrl ?? null,
      });
      setInitial(form);
      push('Company profile saved', 'success');
      navigate('/brand/profile');
    } catch (err) {
      const msg = isApiError(err) ? err.message : 'Could not save your company profile.';
      push(msg, 'error');
    } finally {
      setSaving(false);
    }
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

        {/* Company logo */}
        <section className="card p-5 sm:p-6">
          <SectionHeader
            eyebrow="Company logo"
            title="Brand logo"
            description="Upload your official logo so creators recognize your brand across discovery and campaigns."
          />
          <div className="mt-5 flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group shrink-0">
              {form.logoUrl ? (
                <img
                  src={form.logoUrl}
                  alt={form.companyName}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-contain bg-paper-100 p-2 ring-4 ring-paper-100 border border-ink-200 shadow-sm"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-ink-900 text-paper-50 flex items-center justify-center font-display text-3xl font-bold ring-4 ring-paper-100 border border-ink-200 shadow-sm select-none">
                  {form.companyName.split(' ').map((s) => s[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()}
                </div>
              )}
              {uploadingLogo && (
                <div className="absolute inset-0 bg-ink-900/60 rounded-2xl flex items-center justify-center text-paper-50 text-xs font-semibold backdrop-blur-xs">
                  Uploading…
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingLogo}
                >
                  <Camera className="w-4 h-4" />
                  {form.logoUrl ? 'Change logo' : 'Upload logo'}
                </Button>
                {form.logoUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-danger hover:bg-rose-50 hover:text-danger"
                    onClick={handleLogoDelete}
                    disabled={uploadingLogo}
                  >
                    <Trash2 className="w-4 h-4" /> Remove
                  </Button>
                )}
              </div>
              <p className="text-xs text-ink-500">
                Recommended: Square PNG, SVG, JPG, or WebP. Transparent background works best. Max 5 MB.
              </p>
            </div>
          </div>
        </section>

        <section className="card p-5 sm:p-6">
          <SectionHeader eyebrow="Identity" title="Company info" />
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Company name" htmlFor="company" required>
              <Input id="company" value={form.companyName} onChange={(e) => set('companyName', e.target.value)} placeholder="e.g. Northwind Beverages" />
            </FormField>
            <FormField label="Industry" htmlFor="industry" required>
              <Select id="industry" value={form.industry} onChange={(e) => set('industry', e.target.value)}>
                {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
              </Select>
            </FormField>
            <FormField label="Website" htmlFor="website">
              <Input id="website" value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="https://example.com" type="url" />
            </FormField>
            <FormField label="Company size" htmlFor="size" helper="Optional — affects how creators see you">
              <Select
                id="size"
                value={form.size ?? ''}
                onChange={(e) => set('size', (e.target.value || undefined) as BrandProfile['size'])}
              >
                <option value="">Prefer not to say</option>
                {COMPANY_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </FormField>
            <FormField label="Headquarters" htmlFor="hq" optional>
              <Input id="hq" value={form.headquarters ?? ''} onChange={(e) => set('headquarters', e.target.value || undefined)} placeholder="City, Country" />
            </FormField>
            <FormField label="Year founded" htmlFor="yr" optional>
              <Input id="yr" type="number" min={1800} max={new Date().getFullYear()} value={form.foundedYear ?? ''} onChange={(e) => set('foundedYear', e.target.value ? Number(e.target.value) : undefined)} placeholder="e.g. 2019" />
            </FormField>
          </div>
          <div className="mt-4">
            <FormField label="About" htmlFor="about" helper={`${form.about.length} / 2000 characters`}>
              <Textarea id="about" rows={5} maxLength={2000} value={form.about} onChange={(e) => set('about', e.target.value)} placeholder="What you make, who you make it for, what you value in a partnership." />
            </FormField>
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
            <Button onClick={save} disabled={!dirty || saving}>
              <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
