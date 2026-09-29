import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CampaignForm, CampaignFormValues, validateCampaign } from './CampaignForm';
import { addCampaign, updateCampaign, useStore } from '../../state/Store';
import { Button } from '../../components/ui';
import { useToast } from '../../state/ToastContext';

const blank: CampaignFormValues = {
  title: '',
  description: '',
  category: 'Lifestyle',
  requiredPlatform: 'YouTube',
  budgetPerCreator: 500,
  applicationDeadline: new Date(Date.now() + 14 * 86400000).toISOString(),
  deliverables: '',
  creatorsNeeded: 1,
  minFollowers: undefined,
};

export default function CreateCampaign() {
  const navigate = useNavigate();
  const { push } = useToast();
  const { brand } = useStore();
  const [values, setValues] = useState<CampaignFormValues>(blank);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handle = (action: 'draft' | 'publish') => {
    const errs = validateCampaign(values);
    setErrors(errs);
    if (Object.keys(errs).length) {
      push('Please fix the highlighted fields', 'error');
      return;
    }
    const created = addCampaign({
      ...values,
      brandId: brand.id,
      brandName: brand.companyName,
    });
    if (action === 'publish') {
      updateCampaign(created.id, { status: 'published' });
      push('Campaign published', 'success');
    } else {
      push('Draft saved', 'success');
    }
    navigate('/brand/campaigns');
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Create a campaign</h1>
        <p className="text-sm text-ink-500">Save as a draft to keep editing, or publish to start receiving proposals.</p>
      </div>
      <CampaignForm values={values} onChange={setValues} errors={errors} />
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={() => handle('draft')}>Save draft</Button>
        <Button onClick={() => handle('publish')}>Publish</Button>
      </div>
    </div>
  );
}