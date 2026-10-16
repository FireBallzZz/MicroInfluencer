import { Link } from 'react-router-dom';
import type { Campaign } from '../types';
import { EligibilityChip, CampaignStatusBadge, ChannelArt, PlatformIcon, SaveButton } from './ui';
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
    <Link
      to={to}
      className="card card-hover p-4 sm:p-5 group block"
    >
      <div className="flex items-start gap-3">
        <ChannelArt name={campaign.brandName} seed={campaign.brandId} height={48} className="w-12 rounded-md shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-xs text-ink-500 truncate flex items-center gap-1.5">
            <span className="truncate">{campaign.brandName}</span>
            <span className="text-ink-300">·</span>
            <span className="truncate">{campaign.category}</span>
            <span className="text-ink-300">·</span>
            <span className="inline-flex items-center gap-1 shrink-0">
              <PlatformIcon platform={campaign.requiredPlatform} className="w-3 h-3" />
              {campaign.requiredPlatform}
            </span>
          </div>
          <h3 className="mt-1 text-base font-semibold text-ink-900 leading-snug line-clamp-2 group-hover:text-ink-900 transition-colors">
            {campaign.title}
          </h3>
          {campaign.description && (
            <p className="mt-1.5 text-sm text-ink-500 line-clamp-2 leading-relaxed">{campaign.description}</p>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-px border border-ink-200 bg-ink-200 rounded-md overflow-hidden">
        <Cell label="Budget" value={currency(campaign.budgetPerCreator)} hint="/ creator" />
        <Cell label="Creators" value={String(campaign.creatorsNeeded)} hint="needed" />
        <Cell label="Deadline" value={fmtDate(campaign.applicationDeadline)} />
      </div>

      <div className="mt-4 flex items-center justify-between">
        {eligibility ? (
          <EligibilityChip eligible={eligibility.eligible} reason={reason ?? eligibility.reason} />
        ) : (
          <span />
        )}
        {showStatus ? <CampaignStatusBadge status={campaign.status} /> : <Megaphone className="w-4 h-4 text-ink-300" />}
      </div>
    </Link>
  );
}

function Cell({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="bg-paper-50 py-2 px-1.5 sm:px-3 text-center min-w-0 overflow-hidden">
      <div className="eyebrow !text-[9px] truncate">{label}</div>
      <div className="num-display text-xs sm:text-sm mt-0.5 truncate">
        {value}
        {hint && <span className="text-[10px] text-ink-500 font-sans font-normal ml-0.5 sm:ml-1 hidden sm:inline">{hint}</span>}
      </div>
    </div>
  );
}
