import { FormField, Input, Textarea, Select } from '../../components/ui';
import type { Campaign, Niche, Platform } from '../../types';
import { NICHES, PLATFORMS } from '../../data/seed';

export type CampaignFormValues = Omit<Campaign, 'id' | 'createdAt' | 'status' | 'brandId' | 'brandName'>;

export function CampaignForm({
  values,
  onChange,
  errors,
}: {
  values: CampaignFormValues;
  onChange: (v: CampaignFormValues) => void;
  errors?: Record<string, string>;
}) {
  const set = <K extends keyof CampaignFormValues>(k: K, v: CampaignFormValues[K]) =>
    onChange({ ...values, [k]: v });

  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-ink-900 mb-4">The basics</h3>
        <FormField label="Campaign title" error={errors?.title}>
          <Input value={values.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Launch our new cold brew" invalid={!!errors?.title} />
        </FormField>
        <FormField label="Description" error={errors?.description} helper="Up to 2000 characters">
          <Textarea rows={6} value={values.description} onChange={(e) => set('description', e.target.value)} placeholder="What’s the brief? What kind of creator are you looking for?" invalid={!!errors?.description} />
        </FormField>
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Category / niche" error={errors?.category}>
            <Select value={values.category} onChange={(e) => set('category', e.target.value as Niche)} invalid={!!errors?.category}>
              {NICHES.map((n) => <option key={n}>{n}</option>)}
            </Select>
          </FormField>
          <FormField label="Required platform" error={errors?.requiredPlatform}>
            <Select value={values.requiredPlatform} onChange={(e) => set('requiredPlatform', e.target.value as Platform)} invalid={!!errors?.requiredPlatform}>
              {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
            </Select>
          </FormField>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-semibold text-ink-900 mb-4">Budget &amp; logistics</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Budget per creator (USD)" error={errors?.budgetPerCreator}>
            <Input type="number" value={values.budgetPerCreator} onChange={(e) => set('budgetPerCreator', Number(e.target.value))} invalid={!!errors?.budgetPerCreator} />
          </FormField>
          <FormField label="Application deadline" error={errors?.applicationDeadline} helper="Must be at least tomorrow">
            <Input type="date" min={tomorrow} value={values.applicationDeadline.slice(0, 10)} onChange={(e) => set('applicationDeadline', new Date(e.target.value).toISOString())} invalid={!!errors?.applicationDeadline} />
          </FormField>
          <FormField label="Creators needed (1-20)">
            <Input type="number" min={1} max={20} value={values.creatorsNeeded} onChange={(e) => set('creatorsNeeded', Math.max(1, Math.min(20, Number(e.target.value))))} />
          </FormField>
          <FormField label="Minimum followers (optional)" helper="Leave blank to allow any follower count">
            <Input type="number" value={values.minFollowers ?? 0} onChange={(e) => set('minFollowers', Number(e.target.value) || undefined)} placeholder="e.g. 10000" />
          </FormField>
        </div>
        <FormField label="Deliverables per creator" helper="Be specific ' creators want clarity">
          <Textarea rows={3} value={values.deliverables} onChange={(e) => set('deliverables', e.target.value)} placeholder="e.g. 1 long-form video (8–12 min) + 1 short" />
        </FormField>
      </div>
    </div>
  );
}

export function validateCampaign(values: CampaignFormValues): Record<string, string> {
  const errs: Record<string, string> = {};
  if (!values.title.trim()) errs.title = 'Required';
  if (!values.description.trim()) errs.description = 'Required';
  if (!values.category) errs.category = 'Required';
  if (!values.requiredPlatform) errs.requiredPlatform = 'Required';
  if (values.budgetPerCreator <= 0) errs.budgetPerCreator = 'Must be greater than 0';
  if (values.creatorsNeeded < 1 || values.creatorsNeeded > 20) errs.creatorsNeeded = 'Between 1 and 20';
  if (new Date(values.applicationDeadline).getTime() <= Date.now()) errs.applicationDeadline = 'Deadline must be in the future';
  return errs;
}