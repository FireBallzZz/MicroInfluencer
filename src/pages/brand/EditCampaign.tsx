import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CampaignForm, validateCampaign } from './CampaignForm';
import type { CampaignFormValues } from './CampaignForm';
import { updateCampaign, useStore } from '../../state/Store';
import { Button } from '../../components/ui';
import { useToast } from '../../state/ToastContext';

export default function EditCampaign() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { push } = useToast();
  const { campaigns } = useStore();
  const c = campaigns.find((x) => x.id === id);

  const [values, setValues] = useState<CampaignFormValues | null>(c ? {
    title: c.title,
    description: c.description,
    category: c.category,
    requiredPlatform: c.requiredPlatform,
    budgetPerCreator: c.budgetPerCreator,
    applicationDeadline: c.applicationDeadline,
    deliverables: c.deliverables,
    creatorsNeeded: c.creatorsNeeded,
    minFollowers: c.minFollowers,
  } : null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!c || !values) return <div className="card p-6">Campaign not found.</div>;

  if (c.status !== 'draft') {
    return (
      <div className="card p-6 max-w-xl">
        <h1 className="text-lg font-bold text-ink-900">Editing is locked</h1>
        <p className="text-sm text-ink-600 mt-1">Published and closed campaigns can’t be edited.</p>
        <Button className="mt-4" onClick={() => navigate(`/brand/campaigns/${c.id}`)}>Back to campaign</Button>
      </div>
    );
  }

  const save = () => {
    const errs = validateCampaign(values);
    setErrors(errs);
    if (Object.keys(errs).length) {
      push('Please fix the highlighted fields', 'error');
      return;
    }
    updateCampaign(c.id, values);
    push('Draft updated', 'success');
    navigate(`/brand/campaigns/${c.id}`);
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <h1 className="text-2xl font-bold text-ink-900">Edit campaign</h1>
      <CampaignForm values={values} onChange={setValues} errors={errors} />
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={() => navigate(`/brand/campaigns/${c.id}`)}>Cancel</Button>
        <Button onClick={save}>Save draft</Button>
      </div>
    </div>
  );
}