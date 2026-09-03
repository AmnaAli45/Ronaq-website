import React, { useState, useEffect } from 'react';
import { X, Sparkles, Tag, ArrowRight, Gift, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PromoPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(7); // 7 seconds countdown
  const navigate = useNavigate();

  useEffect(() => {
    // Show popup shortly after mount
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 400);

    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    // Countdown interval
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
    }, 350); // Match fade out animation duration
  };

  const handleExplore = (path) => {
    handleClose();
    if (path) {
      navigate(path);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-all duration-350 ${
        isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Popup Modal Box */}
      <div
        className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl shadow-2xl shadow-amber-950/40 p-6 sm:p-7 text-white overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-300"
        role="dialog"
        aria-modal="true"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Auto-Dismiss Progress Bar at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-1000 ease-linear"
            style={{ width: `${(timeLeft / 7) * 100}%` }}
          />
        </div>

        {/* Close Icon Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none"
          aria-label="Close popup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          </span>
          <span>Special Flash Announcement</span>
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-serif font-black text-white leading-tight mb-2">
          Storewide <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400">Rs. 0 Pricing Live!</span>
        </h3>

        {/* Description */}
        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-5">
          All luxury skincare, high fashion apparel, footwear, and accessories are currently available for <strong className="text-amber-300 font-bold">Rs. 0 (Free)</strong> for testing & demonstration!
        </p>

        {/* Highlight Perks */}
        <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800 mb-5 space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>All Catalog Products Set to <strong>Rs. 0</strong></span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-200">
            <Tag className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Velora, Elan, Stryde & Accessories Included</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-200">
            <Gift className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Free Checkout Available</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={() => handleExplore('/velora')}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5"
          >
            <span>Explore Store</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleClose}
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs transition-colors"
          >
            Dismiss ({timeLeft}s)
          </button>
        </div>

        {/* Bottom subtle timer note */}
        <div className="mt-3 text-center">
          <p className="text-[10px] text-slate-400">
            This popup will automatically close in <strong className="text-amber-400">{timeLeft} seconds</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
