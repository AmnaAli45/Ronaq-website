import React from 'react';
import { useCart } from '../../context/CartContext';
import { CheckCircle2, X } from 'lucide-react';

export const Toast = () => {
  const { toastMessage, showToast } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
      <div className="flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-slate-700/80 backdrop-blur-md">
        <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
        <span className="text-sm font-medium pr-2">{toastMessage}</span>
        <button
          onClick={() => showToast(null)}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
