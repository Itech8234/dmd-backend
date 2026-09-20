import { createContext, useContext, useCallback, useState } from 'react';
import { CheckCircle, WarningCircle, Info, X } from '@phosphor-icons/react';

const ToastCtx = createContext(null);
let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((message, kind = 'info') => {
    const id = ++idCounter;
    setToasts((list) => [...list, { id, message, kind }]);
    setTimeout(() => dismiss(id), kind === 'danger' ? 6500 : 4200);
  }, [dismiss]);

  const styles = {
    success: 'border-l-emerald-500',
    danger: 'border-l-red-500',
    warn: 'border-l-amber-500',
    info: 'border-l-yellow',
  };
  const icons = { success: CheckCircle, danger: WarningCircle, warn: WarningCircle, info: Info };
  const iconColors = { success: 'text-emerald-500', danger: 'text-red-500', warn: 'text-amber-500', info: 'text-yellow-500' };

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[70] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
        role="status"
        aria-live="polite"
      >
        {toasts.map((tst) => {
          const Icon = icons[tst.kind] || Info;
          return (
            <div
              key={tst.id}
              className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-ink-100 dark:border-ink-700/60 border-l-4 bg-white dark:bg-ink-900 px-4 py-3 shadow-card-hover text-sm text-ink dark:text-ink-50 animate-[toast-in_0.25s_ease-out] ${styles[tst.kind] || ''}`}
            >
              <Icon size={20} weight="fill" className={`shrink-0 mt-0.5 ${iconColors[tst.kind] || ''}`} aria-hidden="true" />
              <p className="grow font-medium leading-snug">{tst.message}</p>
              <button
                type="button"
                onClick={() => dismiss(tst.id)}
                aria-label="Dismiss notification"
                className="shrink-0 text-ink-400 hover:text-ink dark:text-ink-300 dark:hover:text-white cursor-pointer transition-colors"
              >
                <X size={16} weight="bold" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
      <style>{`@keyframes toast-in { from { opacity: 0; transform: translateY(8px) scale(0.98); } to { opacity: 1; transform: none; } }`}</style>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
