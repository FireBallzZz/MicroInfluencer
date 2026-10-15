import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormField, Input, Textarea, Select, Button, PageHeader, SectionHeader } from '../../components/ui';
import { useStore, updateBrand } from '../../state/Store';
import { useToast } from '../../state/ToastContext';

const INDUSTRIES = ['Food & Beverage', 'Beauty', 'Fashion', 'Tech', 'Travel', 'Finance', 'Health & Wellness', 'Lifestyle', 'Other'];

export default function EditBrandProfile() {
  const { brand } = useStore();
  const navigate = useNavigate();
  const { push } = useToast();
  const [form, setForm] = useState({ ...brand });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm({ ...form, [k]: v });

  const save = () => {
    updateBrand(form);
    push('Brand profile saved', 'success');
    navigate('/brand/profile');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        eyebrow="Profile"
        title="Edit company profile"
        description="Update how creators see your brand."
      />
      <section className="card p-5 sm:p-6">
        <SectionHeader eyebrow="Basics" title="Identity" />
        <div className="mt-5">
          <FormField label="Company name">
            <Input value={form.companyName} onChange={(e) => set('companyName', e.target.value)} />
          </FormField>
          <FormField label="Industry">
            <Select value={form.industry} onChange={(e) => set('industry', e.target.value)}>
              {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
            </Select>
          </FormField>
          <FormField label="Website">
            <Input value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="https://…" />
          </FormField>
          <FormField label="Logo URL" helper="Paste a hosted image URL" optional>
            <Input value={form.logoUrl ?? ''} onChange={(e) => set('logoUrl', e.target.value)} placeholder="https://…" />
          </FormField>
          <FormField label="About">
            <Textarea rows={5} value={form.about} onChange={(e) => set('about', e.target.value)} />
          </FormField>
        </div>
      </section>
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={() => navigate('/brand/profile')}>Cancel</Button>
        <Button onClick={save}>Save changes</Button>
      </div>
    </div>
  );
}
