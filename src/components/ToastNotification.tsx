'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'SUCCESS' | 'INFO' | 'WARNING' | 'CRITICAL';

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  addToast: (title: string, message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (title: string, message: string, type: ToastType = 'INFO', duration: number = 4000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
      const newToast: ToastItem = { id, title, message, type, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'SUCCESS':
        return {
          bg: 'bg-emerald-950 text-white border-emerald-500/60',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
        };
      case 'WARNING':
        return {
          bg: 'bg-amber-950 text-white border-amber-500/60',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
        };
      case 'CRITICAL':
        return {
          bg: 'bg-rose-950 text-white border-rose-500/80 animate-emergency-pulse',
          icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
        };
      case 'INFO':
      default:
        return {
          bg: 'bg-slate-900 text-white border-sky-500/60',
          icon: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
        };
    }
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}

      {/* Fixed Toast Stack in Bottom Right */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-2">
        {toasts.map((toast) => {
          const styles = getToastStyles(toast.type);
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto p-4 rounded-2xl shadow-2xl border backdrop-blur-md flex items-start gap-3 transition-all duration-300 animate-in slide-in-from-bottom-3 ${styles.bg}`}
            >
              {styles.icon}
              <div className="flex-1 min-w-0">
                <h5 className="text-xs font-bold leading-tight">{toast.title}</h5>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white p-0.5 rounded transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
