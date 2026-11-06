import React from 'react';
import { cn } from '../../lib/utils';
import { CheckCircle2, AlertCircle, Info, HandMetal, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'wave';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
    wave: <HandMetal className="w-5 h-5 text-brand-400 shrink-0 animate-pulse" />,
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 bg-surface-card border border-surface-border rounded-2xl shadow-modal text-slate-900 dark:text-slate-100 max-w-sm w-full animate-in slide-in-from-top-2 duration-200'
      )}
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold truncate">{toast.title}</h4>
        {toast.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
            {toast.description}
          </p>
        )}
      </div>
      {toast.action && (
        <button
          onClick={toast.action.onClick}
          className="min-h-[44px] px-3 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-500 dark:hover:text-brand-300 hover:bg-brand-500/10 rounded-lg transition-colors shrink-0"
        >
          {toast.action.label}
        </button>
      )}
      <button
        onClick={() => onDismiss(toast.id)}
        className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg -mr-2"
        aria-label="Dismiss toast"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
