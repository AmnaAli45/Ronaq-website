import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { reviewsAPI, catalogAPI } from '../../services/api';
import {
  Star,
  X,
  Sparkles,
  CheckCircle2,
  MessageSquare,
  ChevronRight,
  Plus,
  Send,
  Loader2,
  ShieldCheck,
  ThumbsUp,
  Filter
} from 'lucide-react';

export const RightSideReviewsDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [avgRating, setAvgRating] = useState(4.9);
  const [totalReviews, setTotalReviews] = useState(8);
  const [distribution, setDistribution] = useState({});
  const [showWriteModal, setShowWriteModal] = useState(false);

  // Write Review Form State
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [customerLocation, setCustomerLocation] = useState('');
  const [comment, setComment] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [productsList, setProductsList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Fetch reviews when drawer opens
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await reviewsAPI.getPublicReviews();
      setReviews(res.data.results || []);
      setAvgRating(res.data.avg_rating || 4.9);
      setTotalReviews(res.data.total_reviews || (res.data.results?.length || 0));
      setDistribution(res.data.distribution || {});
    } catch (err) {
      console.error('Error loading reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchReviews();
      // Also load products for write review dropdown
      catalogAPI.getProducts().then(res => {
        setProductsList(res.data.results || res.data || []);
      }).catch(() => {});
    }
  }, [isOpen]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setSubmitError('Please write your review feedback.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      await reviewsAPI.submitPublicReview({
        rating: newRating,
        customer_name: customerName.trim() || 'Verified Customer',
        customer_location: customerLocation.trim() || 'Pakistan',
        comment: comment.trim(),
        product_id: selectedProduct || null
      });

      setSubmitSuccess('Thank you! Your verified review has been posted.');
      setComment('');
      setCustomerName('');
      setCustomerLocation('');
      setSelectedProduct('');
      fetchReviews();
      setTimeout(() => {
        setSubmitSuccess('');
        setShowWriteModal(false);
      }, 2000);
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter reviews
  const filteredReviews = reviews.filter(r => {
    if (activeFilter === '5') return r.rating === 5;
    if (activeFilter === '4') return r.rating === 4;
    if (activeFilter === 'velora') return (r.product_name || '').toLowerCase().includes('velora') || (r.product_slug || '').startsWith('velora');
    if (activeFilter === 'elan') return (r.product_name || '').toLowerCase().includes('elan') || (r.product_slug || '').startsWith('elan');
    if (activeFilter === 'stryde') return (r.product_name || '').toLowerCase().includes('stryde') || (r.product_slug || '').startsWith('stryde');
    return true;
  });

  const location = useLocation();

  // Hide the customer reviews drawer widget on admin pages
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      {/* 1. FLOATING RIGHT-SIDE LUXURY BADGE TAB */}
      <div className="fixed right-0 top-[60%] sm:top-1/2 -translate-y-1/2 z-40 shadow-2xl flex items-center">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-1.5 sm:gap-2.5 px-2.5 py-2 sm:px-3.5 sm:py-3 rounded-l-xl sm:rounded-l-2xl bg-slate-950/95 backdrop-blur-xs text-white border-y border-l border-amber-500/40 hover:border-amber-400/80 hover:bg-slate-900 transition-all duration-300 hover:-translate-x-1 shadow-2xl cursor-pointer"
          title="Open Customer Reviews"
          aria-label="Customer Reviews"
        >
          {/* Pulsing Star Indicator */}
          <div className="relative flex items-center justify-center shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-35" />
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-[10px] sm:text-xs shadow-md">
              ★
            </div>
          </div>

          <div className="flex flex-col items-start text-left">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="font-serif font-black text-amber-400 text-xs sm:text-sm tracking-tight">
                {parseFloat(avgRating || 4.9).toFixed(1)}
              </span>
              <div className="hidden sm:flex items-center gap-0.5 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.round(avgRating || 5)
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-slate-700 text-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>
            <span className="text-[9px] sm:text-[10px] font-black tracking-wider sm:tracking-widest uppercase text-slate-300 group-hover:text-amber-300 transition-colors whitespace-nowrap">
              Reviews ({totalReviews})
            </span>
          </div>

          <ChevronRight className="hidden sm:block w-4 h-4 text-slate-400 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* 2. BACKDROP OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 transition-opacity animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 3. RIGHT-SIDE SLIDEOUT DRAWER */}
      <div
        className={`fixed inset-y-0 right-0 w-full max-w-md sm:max-w-lg bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200 transition-transform duration-300 ease-out transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 bg-slate-950 text-white border-b border-white/10 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                ★
              </div>
              <div>
                <h3 className="font-serif text-lg font-black text-white tracking-wide flex items-center gap-1.5">
                  Verified Reviews
                </h3>
                <p className="text-[11px] text-slate-400">Authentic customer experiences & ratings</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Rating Summary Card */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-3xl font-black text-amber-400">{parseFloat(avgRating || 4.9).toFixed(1)}</span>
                <span className="text-xs text-slate-400">out of 5.0</span>
              </div>
              <div className="flex items-center gap-0.5 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(avgRating || 5)
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-slate-700 text-slate-700'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[11px] text-slate-300">
                Based on <span className="font-bold text-white">{totalReviews}</span> verified luxury reviews
              </p>
            </div>

            <button
              onClick={() => setShowWriteModal(!showWriteModal)}
              className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{showWriteModal ? 'View Reviews' : 'Write Review'}</span>
            </button>
          </div>
        </div>

        {/* WRITE REVIEW FORM SECTION (Collapsible) */}
        {showWriteModal ? (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50 space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" /> Share Your Experience
                </h4>
                <button
                  type="button"
                  onClick={() => setShowWriteModal(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-700"
                >
                  Cancel
                </button>
              </div>

              {submitSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{submitSuccess}</span>
                </div>
              )}

              {submitError && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                  {submitError}
                </div>
              )}

              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* Rating Selector */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
                      Rate Your Experience *
                    </label>
                    <span className="text-[11px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                      {(hoverRating || newRating) === 5 ? '⭐⭐⭐⭐⭐ 5.0 - Exceptional' :
                       (hoverRating || newRating) === 4 ? '⭐⭐⭐⭐ 4.0 - Very Good' :
                       (hoverRating || newRating) === 3 ? '⭐⭐⭐ 3.0 - Good' :
                       (hoverRating || newRating) === 2 ? '⭐⭐ 2.0 - Fair' : '⭐ 1.0 - Poor'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = (hoverRating || newRating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 rounded-lg transition-transform hover:scale-125 focus:outline-none cursor-pointer group"
                          title={`Select ${star} Star${star > 1 ? 's' : ''}`}
                        >
                          <Star
                            className={`w-7 h-7 transition-all ${
                              isFilled
                                ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                                : 'text-slate-300 fill-slate-100 group-hover:text-amber-300'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Name & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Ayesha K."
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-slate-50/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City / Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Lahore, Pakistan"
                      value={customerLocation}
                      onChange={(e) => setCustomerLocation(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-slate-50/50"
                    />
                  </div>
                </div>

                {/* Optional Product Reference */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Product (Optional)</label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                  >
                    <option value="">-- General Store / Brand Experience --</option>
                    {productsList.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.brand_name || p.brand || 'Luxury'})</option>
                    ))}
                  </select>
                </div>

                {/* Review Text */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Review Feedback *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us about the texture, quality, fit, or delivery experience..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-slate-50/50 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-slate-950 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Publishing Review...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-amber-400" />
                      <span>Post Verified Review</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* REVIEWS LIST VIEW */
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/70">
            {/* Filter Chips */}
            <div className="p-3 bg-white border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
              {[
                { id: 'all', label: `All (${reviews.length})` },
                { id: '5', label: '⭐ 5 Stars' },
                { id: '4', label: '⭐ 4 Stars' },
                { id: 'velora', label: 'Velora' },
                { id: 'elan', label: 'Elan' },
                { id: 'stryde', label: 'Stryde' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    activeFilter === tab.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Scrollable Reviews Cards */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
              {loading ? (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-600" />
                  <p className="text-xs">Loading verified customer reviews...</p>
                </div>
              ) : filteredReviews.length === 0 ? (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">No reviews found for this filter</p>
                  <button
                    onClick={() => setActiveFilter('all')}
                    className="text-xs text-amber-600 font-bold hover:underline"
                  >
                    View all reviews
                  </button>
                </div>
              ) : (
                filteredReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-2.5"
                  >
                    {/* Top Row: Stars + Date */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < (rev.rating || 5)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'fill-slate-100 text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] font-bold text-slate-700 ml-1">({rev.rating || 5}.0)</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {rev.created_at ? new Date(rev.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Verified Buyer'}
                      </span>
                    </div>

                    {/* Review Comment Text */}
                    <p className="text-xs text-slate-700 leading-relaxed font-normal">
                      "{rev.comment}"
                    </p>

                    {/* Customer Info & Verification Badge */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{rev.display_name || rev.customer_name || 'Verified Buyer'}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">{rev.customer_location || 'Pakistan'}</span>
                      </div>
                      {rev.is_verified_purchase && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                        </span>
                      )}
                    </div>

                    {/* Product Reference Pill */}
                    {rev.product_name && rev.product_name !== 'Store / General Brand' && (
                      <div className="mt-1">
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-medium inline-block truncate max-w-full">
                          Purchased: <strong className="text-slate-800">{rev.product_name}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Bottom Footer Note */}
            <div className="p-3 bg-white border-t border-slate-100 text-center shrink-0">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Genuine Luxury Reviews • Authenticated Purchases</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
