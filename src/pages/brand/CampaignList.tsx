import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useStore, deleteCampaign } from '../../state/Store';
import { CampaignStatusBadge, EmptyState, Button } from '../../components/ui';
import { currency, fmtDate } from '../../data/seed';
import clsx from 'clsx';
import { ConfirmDialog } from '../../components/Modal';
import { useToast } from '../../state/ToastContext';

const TABS = ['All', 'Draft', 'Published', 'Closed'] as const;

export default function CampaignList() {
  const { campaigns, brand, proposals } = useStore();
  const { push } = useToast();
  const [tab, setTab] = useState<(typeof TABS)[number]>('All');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const mine = campaigns.filter((c) => c.brandId === brand.id);
  const filtered = tab === 'All' ? mine : mine.filter((c) => c.status === tab.toLowerCase());

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">My campaigns</h1>
          <p className="text-sm text-ink-500">Draft, publish and manage every campaign.</p>
        </div>
        <Link to="/brand/campaigns/create" className="btn btn-primary btn-md">
          <Plus className="w-4 h-4" /> Create campaign
        </Link>
      </div>

      <div className="border-b border-ink-200">
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={clsx(
                'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap',
                tab === t ? 'border-brand-500 text-brand-700' : 'border-transparent text-ink-600 hover:text-ink-900'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            title="No campaigns here yet"
            description="Create your first campaign to start receiving proposals."
            action={<Link to="/brand/campaigns/create" className="btn btn-primary btn-md"><Plus className="w-4 h-4" /> Create campaign</Link>}
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-ink-600 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Title</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Category</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Platform</th>
                  <th className="text-left px-4 py-3 font-medium">Budget</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Deadline</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Creators</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Proposals</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filtered.map((c) => {
                  const proposalCount = proposals.filter((p) => p.campaignId === c.id).length;
                  return (
                    <tr key={c.id} className="hover:bg-ink-50">
                      <td className="px-4 py-3">
                        <Link to={`/brand/campaigns/${c.id}`} className="font-semibold text-ink-900 hover:text-brand-700">
                          {c.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-ink-700">{c.category}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-ink-700">{c.requiredPlatform}</td>
                      <td className="px-4 py-3 font-semibold">{currency(c.budgetPerCreator)}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-ink-700">{fmtDate(c.applicationDeadline)}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-ink-700">{c.creatorsNeeded}</td>
                      <td className="px-4 py-3"><CampaignStatusBadge status={c.status} /></td>
                      <td className="px-4 py-3 text-ink-700">{proposalCount}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {c.status === 'draft' && (
                            <>
                              <Link to={`/brand/campaigns/${c.id}/edit`} className="btn btn-ghost btn-sm" aria-label="Edit"><Pencil className="w-4 h-4" /></Link>
                              <button className="btn btn-ghost btn-sm" aria-label="Delete" onClick={() => setConfirmDelete(c.id)}>
                                <Trash2 className="w-4 h-4 text-rose-600" />
                              </button>
                            </>
                          )}
                          <Link to={`/brand/campaigns/${c.id}`} className="btn btn-ghost btn-sm" aria-label="View">
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete) {
            deleteCampaign(confirmDelete);
            push('Campaign deleted', 'info');
          }
        }}
        title="Delete this draft?"
        description="This campaign is still a draft and will be removed. This action cannot be undone."
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
}