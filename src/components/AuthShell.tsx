import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
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
      <div className="flex-1 flex items-center justify-center py-10 sm:py-14 px-5 sm:px-6">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 mb-8"
            aria-label="Microwork home"
          >
            <span className="inline-flex items-center justify-center w-7 h-7 bg-ink-900 text-paper-50 rounded-sm">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" aria-hidden>
                <path
                  d="M3 19V5h2.5L12 14 18.5 5H21v14h-2.5V10.6L13 18h-2L5 10.6V19H3z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span className="font-display text-[19px] font-semibold leading-none tracking-[-0.02em] text-ink-900">
              Microwork
            </span>
            <span
              aria-hidden
              className="font-mono text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-sm bg-paper-100 text-ink-500"
            >
              demo
            </span>
          </Link>

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
