import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import AuthVisual from './AuthVisual';
import { Wordmark } from './Logo';

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
      <div className="flex-1 flex items-center justify-center py-10 sm:py-14 px-5 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3">
            <Wordmark to="/" size="md" />
            <span
              aria-hidden
              className="font-mono text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-sm bg-paper-100 text-ink-500"
            >
              demo
            </span>
          </div>

          <h1 className="font-display text-ink-900 text-[clamp(1.75rem,3.2vw,2.4rem)] leading-[1.05] tracking-[-0.02em]">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm sm:text-[15px] text-ink-500 mt-2.5 leading-relaxed">
              {subtitle}
            </p>
          )}

          <div className="mt-7">{children}</div>
          {footer && <div className="mt-6 text-sm text-ink-600">{footer}</div>}
        </div>
      </div>

      <div className="hidden lg:flex flex-1 items-stretch p-6 xl:p-10 border-l border-ink-200 bg-ink-900 overflow-hidden">
        <div className="w-full max-w-[560px] mx-auto flex items-center">
          {side ?? <AuthVisual variant={variant} />}
        </div>
      </div>
    </div>
  );
}
