import { Link } from 'react-router-dom';
import { Pencil, ExternalLink } from 'lucide-react';
import { useStore } from '../../state/Store';
import { Button } from '../../components/ui';

export default function BrandProfile() {
  const { brand } = useStore();
  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Company profile</h1>
          <p className="text-sm text-ink-500">How creators see your brand.</p>
        </div>
        <Link to="/brand/profile/edit" className="btn btn-secondary btn-md">
          <Pencil className="w-4 h-4" /> Edit
        </Link>
      </div>

      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold text-xl">
            {brand.companyName.split(' ').map((s) => s[0]).slice(0, 2).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-ink-900">{brand.companyName}</h2>
            <div className="text-sm text-ink-500">{brand.industry}</div>
            {brand.website && (
              <a href={brand.website} target="_blank" rel="noreferrer noopener" className="mt-2 text-sm text-brand-600 hover:underline inline-flex items-center gap-1">
                <ExternalLink className="w-3.5 h-3.5" /> {brand.website}
              </a>
            )}
          </div>
        </div>
        <div className="mt-5">
          <div className="text-sm font-semibold text-ink-900 mb-1">About</div>
          <p className="text-sm text-ink-700 leading-relaxed">{brand.about}</p>
        </div>
      </div>
    </div>
  );
}