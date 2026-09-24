import React from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const getStyles = () => {
          switch (toast.type) {
            case 'success':
              return {
                bg: 'bg-emerald-400',
                icon: <CheckCircle2 className="w-5 h-5 text-black stroke-[2.5]" />,
              };
            case 'warning':
              return {
                bg: 'bg-amber-300',
                icon: <AlertTriangle className="w-5 h-5 text-black stroke-[2.5]" />,
              };
            case 'error':
              return {
                bg: 'bg-rose-400',
                icon: <XCircle className="w-5 h-5 text-black stroke-[2.5]" />,
              };
            default:
              return {
                bg: 'bg-[#FFFDF8]',
                icon: <Info className="w-5 h-5 text-black stroke-[2.5]" />,
              };
          }
        };

        const { bg, icon } = getStyles();

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-2xl border-3 border-black shadow-[4px_5px_0px_#000] ${bg} animate-in slide-in-from-right-4 duration-200`}
          >
            <div className="flex items-center gap-2.5">
              {icon}
              <span className="font-black text-xs sm:text-sm text-black leading-tight">
                {toast.message}
              </span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg hover:bg-black/10 text-black transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
