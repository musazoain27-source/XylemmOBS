'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { cn } from '@/lib/utils';

interface Toast {
  id: number;
  message: string;
  variant: 'success' | 'error' | 'info';
}

interface ToastContextValue {
  push: (message: string, variant?: Toast['variant']) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, variant: Toast['variant'] = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, variant }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2 sm:bottom-6 sm:right-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto animate-fadeIn rounded-lg border px-4 py-3 text-sm shadow-lg backdrop-blur-md',
              t.variant === 'success' && 'border-moss-500/40 bg-moss-950/90 text-moss-200',
              t.variant === 'error' && 'border-ember-500/40 bg-charcoal-900/95 text-ember-300',
              t.variant === 'info' && 'border-charcoal-700 bg-charcoal-900/95 text-charcoal-200'
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
