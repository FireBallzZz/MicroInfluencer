import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CampaignForm, validateCampaign } from './CampaignForm';
import type { CampaignFormValues } from './CampaignForm';
import { updateCampaign, useStore, loadBrandCampaigns } from '../../state/Store';
import { Button, PageHeader } from '../../components/ui';
import { useToast } from '../../state/ToastContext';
import { isApiError } from '../../api/client';

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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!c) {
      loadBrandCampaigns().catch(() => undefined);
    } else if (values === null) {
      setValues({
        title: c.title,
        description: c.description,
        category: c.category,
        requiredPlatform: c.requiredPlatform,
        budgetPerCreator: c.budgetPerCreator,
        applicationDeadline: c.applicationDeadline,
        deliverables: c.deliverables,
        creatorsNeeded: c.creatorsNeeded,
        minFollowers: c.minFollowers,
      });
    }
  }, [c?.id]);

  if (!c) {
    return (
      <div className="container-page py-6 sm:py-8">
        <div className="card p-6 max-w-xl">
          <h1 className="font-display text-lg text-ink-900">Campaign not found</h1>
          <p className="text-sm text-ink-500 mt-1">It may have been deleted.</p>
          <Button className="mt-4" onClick={() => navigate('/brand/campaigns')}>Back to campaigns</Button>
        </div>
      </div>
    );
  }

  if (c.status !== 'draft') {
    return (
      <div className="container-page py-6 sm:py-8">
        <div className="card p-6 max-w-xl">
          <h1 className="font-display text-lg text-ink-900">Editing is locked</h1>
          <p className="text-sm text-ink-500 mt-1">Published and closed campaigns can’t be edited.</p>
          <Button className="mt-4" onClick={() => navigate(`/brand/campaigns/${c.id}`)}>Back to campaign</Button>
        </div>
      </div>
    );
  }

  const save = async () => {
    if (!values) return;
    const errs = validateCampaign(values);
    setErrors(errs);
    if (Object.keys(errs).length) {
      push('Please fix the highlighted fields', 'error');
      return;
    }
    setSaving(true);
    try {
      await updateCampaign(c.id, values);
      push('Draft updated', 'success');
      navigate(`/brand/campaigns/${c.id}`);
    } catch (err) {
      push(isApiError(err) ? err.message : 'Failed to update campaign.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-page py-6 sm:py-8 space-y-6 max-w-3xl">
      <PageHeader
        eyebrow="Edit"
        title="Edit campaign"
        description="Changes apply to this draft. You can publish it when ready."
      />
      {values && <CampaignForm values={values} onChange={setValues} errors={errors} />}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={() => navigate('/brand/campaigns')} className="w-full sm:w-auto" disabled={saving}>
          Cancel
        </Button>
        <Button onClick={save} className="w-full sm:w-auto" disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </div>
  );
}
