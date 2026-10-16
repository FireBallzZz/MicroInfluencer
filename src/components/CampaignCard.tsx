import { Link } from 'react-router-dom';
import type { Campaign } from '../types';
import { EligibilityChip, CampaignStatusBadge, PlatformIcon, SaveButton } from './ui';
import { fmtDate, currency } from '../data/seed';
import { Eye, ArrowRight, Flame } from 'lucide-react';

export function CampaignCard({
  campaign,
  to,
  eligibility,
  reason,
  showStatus,
  onQuickView,
  isSaved,
  onToggleSave,
}: {
  campaign: Campaign;
  to: string;
  eligibility?: { eligible: boolean; reason?: string };
  reason?: string;
  showStatus?: boolean;
  onQuickView?: (c: Campaign) => void;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
}) {
  const diffDays = Math.ceil(
    (new Date(campaign.applicationDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const isExpiringSoon = diffDays > 0 && diffDays <= 5;

  return (
    <div className="card card-hover p-4 sm:p-5 group flex flex-col justify-between relative transition-all duration-200 hover:shadow-card-hover hover:border-ink-300">
      <div>
        {/* Top bar: Brand & Save button */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-ink-900 text-paper-50 flex items-center justify-center font-display text-sm font-bold shrink-0 shadow-xs ring-1 ring-ink-200">
              {campaign.brandName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs text-ink-500 truncate flex items-center gap-1.5 font-medium">
                <span className="truncate">{campaign.brandName}</span>
                <span className="text-ink-300">·</span>
                <span className="truncate">{campaign.category}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink-700 bg-paper-100 px-2 py-0.5 rounded-full border border-ink-200">
                  <PlatformIcon platform={campaign.requiredPlatform} className="w-3 h-3" />
                  {campaign.requiredPlatform}
                </span>
                {isExpiringSoon && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    <Flame className="w-3 h-3 text-rose-500 fill-rose-500" />
                    {diffDays === 1 ? '1 day left' : `${diffDays}d left`}
                  </span>
                )}
              </div>
            </div>
          </div>

          {onToggleSave && (
            <SaveButton
              saved={!!isSaved}
              onToggle={() => onToggleSave(campaign.id)}
              label={isSaved ? 'Remove from saved' : 'Save brief'}
            />
          )}
        </div>

        {/* Title & Description */}
        <div className="mt-3.5">
          <Link
            to={to}
            className="text-base font-semibold text-ink-900 leading-snug line-clamp-2 hover:text-ember-600 transition-colors block"
          >
            {campaign.title}
          </Link>
          {campaign.description && (
            <p className="mt-1.5 text-xs text-ink-500 line-clamp-2 leading-relaxed">
              {campaign.description}
            </p>
          )}
        </div>

        {/* Deliverables pill if present */}
        {campaign.deliverables && (
          <div className="mt-3 px-2.5 py-1.5 bg-paper-100/70 rounded-md border border-ink-100 text-[11px] text-ink-600 truncate flex items-center gap-1.5">
            <span className="font-semibold text-ink-700 shrink-0">Deliverables:</span>
            <span className="truncate">{campaign.deliverables}</span>
          </div>
        )}

        {/* Stat metrics */}
        <div className="mt-3.5 grid grid-cols-3 gap-px border border-ink-200 bg-ink-200 rounded-lg overflow-hidden shadow-2xs">
          <Cell label="Budget" value={currency(campaign.budgetPerCreator)} hint="/ creator" highlight />
          <Cell label="Creators" value={String(campaign.creatorsNeeded)} hint="needed" />
          <Cell
            label="Deadline"
            value={fmtDate(campaign.applicationDeadline)}
            hint={diffDays > 0 ? `${diffDays}d left` : 'Ending'}
          />
        </div>
      </div>

      {/* Footer: Eligibility & Interactive Action Buttons */}
      <div className="mt-4 pt-3.5 border-t border-ink-100 flex items-center justify-between gap-2">
        <div>
          {eligibility ? (
            <EligibilityChip eligible={eligibility.eligible} reason={reason ?? eligibility.reason} />
          ) : (
            showStatus ? <CampaignStatusBadge status={campaign.status} /> : <span />
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {onQuickView && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(campaign);
              }}
              className="btn btn-secondary btn-xs text-ink-700 hover:text-ink-900"
              title="Quick preview brief details"
            >
              <Eye className="w-3.5 h-3.5" /> Quick View
            </button>
          )}
          <Link
            to={to}
            className="btn btn-primary btn-xs"
          >
            Apply <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function Cell({ label, value, hint, highlight }: { label: string; value: string; hint?: string; highlight?: boolean }) {
  return (
    <div className="bg-paper-50 py-2 px-1.5 sm:px-2.5 text-center min-w-0 overflow-hidden">
      <div className="eyebrow !text-[9px] truncate">{label}</div>
      <div className={`num-display text-xs sm:text-sm mt-0.5 truncate ${highlight ? 'text-ink-900 font-bold' : ''}`}>
        {value}
      </div>
      {hint && <div className="text-[10px] text-ink-400 truncate mt-0.5 font-sans">{hint}</div>}
    </div>
  );
}
