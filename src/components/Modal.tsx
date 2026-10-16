import { ReactNode, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Esc-to-close + scroll lock + initial focus
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    // Defer focus until paint so the focus ring renders
    const t = setTimeout(() => {
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusables?.[0]?.focus();
    }, 30);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink-900/40 p-0 sm:p-4 anim-pop-in"
      onMouseDown={(e) => {
        // Close only when clicking the backdrop, not inside the panel
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={clsx(
          'relative bg-paper-50 border border-ink-200 rounded-t-2xl sm:rounded-2xl shadow-pop w-full overflow-hidden flex flex-col max-h-[88vh] sm:max-h-[90vh]',
          'safe-bottom',
          size === 'sm' && 'sm:max-w-sm',
          size === 'md' && 'sm:max-w-lg',
          size === 'lg' && 'sm:max-w-2xl'
        )}
      >
        {/* Bottom-sheet drag handle for mobile */}
        <div className="sm:hidden flex justify-center pt-2 shrink-0">
          <div className="w-10 h-1 rounded-full bg-ink-200" />
        </div>
        {title && (
          <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 border-b border-ink-200 shrink-0">
            <h3 className="text-base font-semibold text-ink-900 truncate pr-2">{title}</h3>
            <button
              ref={closeBtnRef}
              onClick={onClose}
              className="p-1 rounded-md hover:bg-ink-100 text-ink-500 shrink-0"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1">{children}</div>
        {footer && <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-t border-ink-200 bg-paper-100/60 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 shrink-0">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  destructive = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => unknown;
  title: string;
  description?: string;
  confirmLabel?: string;
  destructive?: boolean;
}) {
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      await Promise.resolve(onConfirm());
      onClose();
    } catch {
      // In case onConfirm throws, leave open so parent can show error toast
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={submitting ? () => {} : onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button
            type="button"
            className="btn btn-secondary btn-md w-full sm:w-auto"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className={clsx('btn btn-md w-full sm:w-auto', destructive ? 'btn-danger' : 'btn-primary')}
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting ? 'Please wait…' : confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm text-ink-700">{description}</p>
    </Modal>
  );
}