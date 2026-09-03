import React, { useState, useEffect } from 'react';
import { X, Truck, Banknote, RotateCcw, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PromoPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(6); // 6 seconds auto-dismiss
  const navigate = useNavigate();

  useEffect(() => {
    // Show popup shortly after page loads
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 300);

    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    // 1-second interval countdown
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  const handleNavigate = (path) => {
    handleClose();
    if (path) navigate(path);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${
        isClosing ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Dim Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Luxury Popup Card */}
      <div
        className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl shadow-2xl shadow-amber-950/50 p-6 sm:p-7 text-white overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-300"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Glow Ambient Lighting */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-16 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Progress Bar for Auto-Dismiss */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-1000 ease-linear"
            style={{ width: `${(timeLeft / 6) * 100}%` }}
          />
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none"
          aria-label="Close popup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </span>
          <span className="font-serif tracking-widest text-amber-300">RONAK LUXURY COLLECTIVE</span>
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-serif font-black text-white leading-tight mb-4">
          Customer Service & Benefits
        </h3>

        {/* The 3 Core Pillars From Header */}
        <div className="space-y-3 bg-slate-950/70 rounded-xl p-4 border border-slate-800/90 mb-5">
          {/* Pillar 1: Free Delivery */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">
                Free Delivery above <strong className="text-amber-300 font-bold">Rs. 2,999</strong>
              </p>
            </div>
          </div>

          {/* Pillar 2: Cash on Delivery */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Banknote className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">
                Cash on Delivery <strong className="text-white font-bold">Available Nationwide</strong>
              </p>
            </div>
          </div>

          {/* Pillar 3: Easy Return & Exchange */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <RotateCcw className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">
                Easy <strong className="text-white font-bold">Return & Exchange</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Sub-Brands Quick List */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 mb-5 pb-3 border-b border-slate-800">
          <span className="hover:text-amber-300 cursor-pointer" onClick={() => handleNavigate('/velora')}>Velora</span>
          <span>•</span>
          <span className="hover:text-amber-300 cursor-pointer" onClick={() => handleNavigate('/elan')}>Elan</span>
          <span>•</span>
          <span className="hover:text-amber-300 cursor-pointer" onClick={() => handleNavigate('/stryde')}>Stryde</span>
          <span>•</span>
          <span className="hover:text-amber-300 cursor-pointer" onClick={() => handleNavigate('/accessories')}>Accessories</span>
        </div>

        {/* Action Button & Timer */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handleClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5"
          >
            <span>Continue to Store</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Auto-Close Info */}
        <div className="mt-3 text-center">
          <p className="text-[10px] text-slate-400">
            Auto-closing in <strong className="text-amber-400">{timeLeft}s</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
