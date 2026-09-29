import { ButtonHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes, InputHTMLAttributes } from 'react';
import clsx from 'clsx';
import { Inbox, AlertTriangle, Loader2 } from 'lucide-react';

// --- Button ---
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';
  size?: 'sm' | 'md' | 'lg';
};
export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

// --- Inputs ---
export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="label">
      {children}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  const { invalid, className, ...rest } = props;
  return <input className={clsx('input', invalid && 'input-invalid', className)} {...rest} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  const { invalid, className, ...rest } = props;
  return <textarea className={clsx('textarea', invalid && 'input-invalid', className)} {...rest} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  const { invalid, className, ...rest } = props;
  return <select className={clsx('input pr-8', invalid && 'input-invalid', className)} {...rest} />;
}

export function FormField({
  label,
  htmlFor,
  error,
  helper,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  helper?: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-4">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? <div className="error">{error}</div> : helper ? <div className="helper">{helper}</div> : null}
    </div>
  );
}

// --- States ---
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="text-center py-12 px-4">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-ink-100 text-ink-500 mb-3">
        {icon ?? <Inbox className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-semibold text-ink-800">{title}</h3>
      {description && <p className="text-sm text-ink-500 mt-1 max-w-md mx-auto">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'We couldn’t load this. Please try again.',
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="text-center py-12 px-4">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-50 text-rose-600 mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-ink-800">{title}</h3>
      <p className="text-sm text-ink-500 mt-1 max-w-md mx-auto">{description}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-secondary btn-md mt-4">
          Try again
        </button>
      )}
    </div>
  );
}

export function LoadingSpinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-8 text-ink-500 text-sm">
      <Loader2 className="w-4 h-4 animate-spin" />
      {label ?? 'Loading…'}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('animate-pulse bg-ink-100 rounded-md', className)} />;
}

// --- Status badges ---
import type { CampaignStatus, ProposalStatus } from '../types';

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  const map = {
    draft: { label: 'Draft', cls: 'badge-gray' },
    published: { label: 'Published', cls: 'badge-green' },
    closed: { label: 'Closed', cls: 'badge-gray' },
  } as const;
  const s = map[status];
  return <span className={clsx('badge', s.cls)}>{s.label}</span>;
}

export function ProposalStatusBadge({ status }: { status: ProposalStatus }) {
  const map = {
    pending: { label: 'Pending', cls: 'badge-amber' },
    shortlisted: { label: 'Shortlisted', cls: 'badge-blue' },
    accepted: { label: 'Accepted', cls: 'badge-green' },
    rejected: { label: 'Rejected', cls: 'badge-rose' },
    withdrawn: { label: 'Withdrawn', cls: 'badge-gray' },
  } as const;
  const s = map[status];
  return <span className={clsx('badge', s.cls)}>{s.label}</span>;
}

export function EligibilityChip({ eligible, reason }: { eligible: boolean; reason?: string }) {
  if (eligible) return <span className="badge badge-green">Eligible</span>;
  return (
    <span className="badge badge-rose" title={reason}>
      Not eligible{reason ? ` - ${reason}` : ''}
    </span>
  );
}

export function VerifiedBadge({ verified }: { verified: boolean }) {
  if (verified) return <span className="badge badge-teal">Verified</span>;
  return <span className="badge badge-amber">Unverified</span>;
}
