import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CampaignForm, CampaignFormValues, validateCampaign } from './CampaignForm';
import { addCampaign, setCampaignStatus, loadBrandCampaigns, useStore, loadBrandProfile } from '../../state/Store';
import { Button, PageHeader } from '../../components/ui';
import { useToast } from '../../state/ToastContext';
import { useEffect } from 'react';
import { isApiError } from '../../api/client';

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
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadBrandProfile().catch(() => undefined);
  }, []);

  const handle = async (action: 'draft' | 'publish') => {
    const errs = validateCampaign(values);
    setErrors(errs);
    if (Object.keys(errs).length) {
      push('Please fix the highlighted fields', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const created = await addCampaign(values);
      if (action === 'publish') {
        await setCampaignStatus(created.id, 'published');
        push('Campaign published', 'success');
      } else {
        push('Draft saved', 'success');
      }
      await loadBrandCampaigns();
      navigate(`/brand/campaigns/${created.id}`);
    } catch (err) {
      const msg = isApiError(err) ? err.message : 'Could not create campaign.';
      push(msg, 'error');
    } finally {
      setSubmitting(false);
    }
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
        <Button variant="ghost" onClick={() => navigate('/brand/campaigns')} className="w-full sm:w-auto" disabled={submitting}>
          Cancel
        </Button>
        <Button variant="secondary" onClick={() => handle('draft')} className="w-full sm:w-auto" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save draft'}
        </Button>
        <Button onClick={() => handle('publish')} className="w-full sm:w-auto" disabled={submitting}>
          {submitting ? 'Publishing…' : 'Publish'}
        </Button>
      </div>
    </div>
  );
}
