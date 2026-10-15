import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CampaignForm, CampaignFormValues, validateCampaign } from './CampaignForm';
import { addCampaign, updateCampaign, useStore } from '../../state/Store';
import { Button, PageHeader } from '../../components/ui';
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
    <div className="container-page py-6 sm:py-8 space-y-6 max-w-3xl">
      <PageHeader
        eyebrow="New"
        title="Create a campaign"
        description="Save as a draft to keep editing, or publish to start receiving proposals."
      />
      <CampaignForm values={values} onChange={setValues} errors={errors} />
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={() => navigate('/brand/campaigns')} className="w-full sm:w-auto">Cancel</Button>
        <Button variant="secondary" onClick={() => handle('draft')} className="w-full sm:w-auto">Save draft</Button>
        <Button onClick={() => handle('publish')} className="w-full sm:w-auto">Publish</Button>
      </div>
    </div>
  );
}
