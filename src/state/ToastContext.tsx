import { createContext, useCallback, useContext, useState, ReactNode } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'info';
type Toast = { id: number; message: string; variant: ToastVariant };

type ToastCtx = {
  push: (message: string, variant?: ToastVariant) => void;
};

const Ctx = createContext<ToastCtx | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, variant: ToastVariant = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, variant }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3500);
  }, []);

  const dismiss = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`relative flex items-start gap-3 p-3 pr-8 rounded-2xl shadow-pop border bg-white text-sm anim-toast
              ${t.variant === 'success' ? 'border-emerald-200' : ''}
              ${t.variant === 'error' ? 'border-rose-200' : ''}
              ${t.variant === 'info' ? 'border-sky-200' : ''}
            `}
          >
            {t.variant === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
            {t.variant === 'error' && <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
            {t.variant === 'info' && <Info className="w-5 h-5 text-sky-600 shrink-0" />}
            <div className="flex-1 text-ink-800">{t.message}</div>
            <button onClick={() => dismiss(t.id)} className="absolute right-2 top-2 text-ink-400 hover:text-ink-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
