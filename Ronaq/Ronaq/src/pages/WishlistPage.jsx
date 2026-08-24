import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import {
  Heart,
  Zap,
  Trash2,
  ArrowRight,
  Sparkles,
  Star,
  ShieldCheck,
  Truck
} from 'lucide-react';

export const WishlistPage = () => {
  const navigate = useNavigate();
  const { wishlistProducts, removeFromWishlist, clearWishlist, totalWishlist } = useWishlist();
  const { addToCart, showToast } = useCart();

  const handleBuyNow = (product) => {
    addToCart(product);
    showToast(`Proceeding to checkout with "${product.name}"!`);
    navigate('/cart');
  };

  const handleBuyAllNow = () => {
    if (wishlistProducts.length === 0) return;
    wishlistProducts.forEach(product => {
      addToCart(product);
    });
    showToast(`Proceeding to checkout with all saved items!`);
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HERO BANNER */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-amber-500/20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold uppercase tracking-wider">
              <Heart className="w-3.5 h-3.5 fill-current" /> Saved Favorites
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-black tracking-tight text-white">
              My Luxury Wishlist
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg">
              Keep track of items you love. Click Buy Now to instantly checkout with Cash on Delivery across Pakistan.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto justify-center">
            {totalWishlist > 0 && (
              <>
                <button
                  onClick={handleBuyAllNow}
                  className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-transform active:scale-95 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-current" /> Buy All Now
                </button>
                <button
                  onClick={clearWishlist}
                  className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                  title="Clear all wishlist items"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* EMPTY STATE */}
        {wishlistProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-100 shadow-inner">
              <Heart className="w-8 h-8 sm:w-10 sm:h-10 stroke-1" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
                Your Wishlist is Empty
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                You haven't saved any luxury products yet. Click the heart icon on any product in Velora Skincare, Elan Fashion, or Stryde Footwear to add it here.
              </p>
            </div>

            {/* Quick Explore Brand Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 sm:pt-4 text-left">
              <Link
                to="/velora"
                className="p-3.5 sm:p-4 rounded-2xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/70 transition-colors group"
              >
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-800 block">Velora</span>
                <span className="font-bold text-xs text-slate-900 group-hover:text-amber-900">Skincare & Beauty →</span>
              </Link>

              <Link
                to="/elan"
                className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors group"
              >
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-600 block">Elan</span>
                <span className="font-bold text-xs text-slate-900 group-hover:text-slate-900">Luxury Apparel →</span>
              </Link>

              <Link
                to="/stryde"
                className="p-3.5 sm:p-4 rounded-2xl border border-cyan-200 bg-cyan-50/50 hover:bg-cyan-100/70 transition-colors group"
              >
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-800 block">Stryde</span>
                <span className="font-bold text-xs text-slate-900 group-hover:text-cyan-900">Footwear & Athletics →</span>
              </Link>
            </div>

            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
            >
              Start Exploring Collections <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* PRODUCT GRID */
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <p className="text-xs sm:text-sm font-semibold text-slate-600">
                Showing <strong className="text-slate-900">{wishlistProducts.length}</strong> saved {wishlistProducts.length === 1 ? 'item' : 'items'}
              </p>
              <Link
                to="/cart"
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
              >
                View Shopping Bag <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {wishlistProducts.map(product => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  {/* Product Image */}
                  <div className="relative aspect-[4/5] bg-slate-100 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Brand Badge */}
                    <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex flex-col gap-1 z-10">
                      <span className="bg-slate-900/90 backdrop-blur-xs text-amber-300 text-[9px] sm:text-[10px] font-black px-2 sm:px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {product.brand || product.brandSlug}
                      </span>
                      {product.discountBadge && (
                        <span className="bg-rose-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                          {product.discountBadge}
                        </span>
                      )}
                    </div>

                    {/* Remove Wishlist Button */}
                    <button
                      onClick={() => removeFromWishlist(product.id, product.dbId)}
                      className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded-full bg-white/90 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-md z-10 cursor-pointer"
                      title="Remove from Wishlist"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>

                  {/* Details */}
                  <div className="p-3 sm:p-5 flex-grow flex flex-col justify-between space-y-3 sm:space-y-4">
                    <div className="space-y-1 sm:space-y-1.5">
                      <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        {product.category}
                      </span>
                      <Link
                        to={`/product/${product.id}`}
                        className="font-bold text-xs sm:text-sm text-slate-900 hover:text-amber-700 transition-colors line-clamp-2 leading-snug"
                      >
                        {product.name}
                      </Link>

                      <div className="flex items-center gap-1 text-amber-500 text-[11px] sm:text-xs font-semibold pt-0.5">
                        <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                        <span>{product.rating || 4.9}</span>
                        <span className="text-slate-400 font-normal text-[10px] sm:text-[11px]">({product.reviewsCount || 40})</span>
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="pt-2 sm:pt-3 border-t border-slate-100 space-y-2 sm:space-y-3">
                      <div className="flex items-baseline gap-1.5 sm:gap-2">
                        <span className="text-base sm:text-lg font-black text-slate-900 font-serif">
                          Rs. {Number(product.price).toLocaleString()}
                        </span>
                        {product.originalPrice && (
                          <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                            Rs. {Number(product.originalPrice).toLocaleString()}
                          </span>
                        )}
                      </div>


                      <button
                        onClick={() => handleBuyNow(product)}
                        className="w-full py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-extrabold text-[11px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 transition-all shadow-md shadow-amber-600/20 active:scale-98 cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current text-amber-300" /> Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* TRUST BANNER */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
              <div className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center gap-3 shadow-xs">
                <Truck className="w-5 h-5 text-amber-600 shrink-0" />
                <div className="text-xs">
                  <strong className="text-slate-900 block font-bold">Fast Courier Delivery</strong>
                  <span className="text-slate-500">2-4 days across Lahore, Multan, Faisalabad & more</span>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center gap-3 shadow-xs">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <strong className="text-slate-900 block font-bold">100% Genuine Luxury</strong>
                  <span className="text-slate-500">Authentic Velora, Elan, & Stryde products</span>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center gap-3 shadow-xs">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
                <div className="text-xs">
                  <strong className="text-slate-900 block font-bold">Cash on Delivery</strong>
                  <span className="text-slate-500">Pay safely when parcel arrives at your doorstep</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default WishlistPage;
