import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
  side,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  side?: ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col lg:flex-row">
      <div className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-ink-900 text-lg">Microwork</span>
          </Link>
          <h1 className="text-2xl font-bold text-ink-900">{title}</h1>
          {subtitle && <p className="text-sm text-ink-500 mt-1">{subtitle}</p>}
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 text-sm text-ink-600">{footer}</div>}
        </div>
      </div>
      {side && (
        <div className="hidden lg:flex flex-1 bg-section-mint items-center justify-center p-12 border-l border-ink-200">
          <div className="max-w-md">{side}</div>
        </div>
      )}
    </div>
  );
}
