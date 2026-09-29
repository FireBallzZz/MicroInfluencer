import { Link } from 'react-router-dom';
import type { Campaign } from '../types';
import { EligibilityChip, CampaignStatusBadge } from './ui';
import { fmtDate, currency } from '../data/seed';
import { Megaphone } from 'lucide-react';

export function CampaignCard({
  campaign,
  to,
  eligibility,
  reason,
  showStatus,
}: {
  campaign: Campaign;
  to: string;
  eligibility?: { eligible: boolean; reason?: string };
  reason?: string;
  showStatus?: boolean;
}) {
  return (
    <Link to={to} className="card p-5 hover:border-brand-300 hover:shadow-pop transition-all block">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-ink-900 line-clamp-1">{campaign.title}</h3>
          <p className="text-xs text-ink-500 mt-0.5">{campaign.brandName}</p>
        </div>
        {showStatus && <CampaignStatusBadge status={campaign.status} />}
        {eligibility && <EligibilityChip eligible={eligibility.eligible} reason={reason ?? eligibility.reason} />}
      </div>
      <p className="text-sm text-ink-600 mt-3 line-clamp-2 leading-relaxed">{campaign.description}</p>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <Cell label="Budget" value={currency(campaign.budgetPerCreator)} />
        <Cell label="Platform" value={campaign.requiredPlatform} />
        <Cell label="Creators" value={`${campaign.creatorsNeeded} needed`} />
        <Cell label="Deadline" value={fmtDate(campaign.applicationDeadline)} />
      </div>
    </Link>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-ink-500">{label}</div>
      <div className="font-semibold text-ink-800">{value}</div>
    </div>
  );
}