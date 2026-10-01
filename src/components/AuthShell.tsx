import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import AuthVisual from './AuthVisual';

type Variant = 'neutral' | 'creator' | 'brand';

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
  side,
  variant = 'neutral',
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  side?: ReactNode;
  variant?: Variant;
}) {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col lg:flex-row">
      <div className="flex-1 flex items-center justify-center py-8 sm:py-10 px-4 sm:px-6">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 sm:mb-8">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-ink-900 text-lg">Microwork</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-ink-900">{title}</h1>
          {subtitle && <p className="text-sm text-ink-500 mt-1">{subtitle}</p>}
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 text-sm text-ink-600">{footer}</div>}
        </div>
      </div>
      {/* Visual side panel — desktop & large tablets only.
          Renders the animated AuthVisual by default, falls back to caller-provided side. */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-6 xl:p-10 border-l border-ink-200 bg-ink-50/40">
        <div className="w-full max-w-[560px]">
          {side ?? <AuthVisual variant={variant} />}
        </div>
      </div>
    </div>
  );
}