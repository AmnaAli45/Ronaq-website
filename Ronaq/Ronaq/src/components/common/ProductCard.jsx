import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { HoverImageSlideshow } from './HoverImageSlideshow';
import { Star, ShoppingBag, Heart, Eye, Edit3 } from 'lucide-react';

export const ProductCard = ({ product, theme = 'ronak' }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user, isAuthenticated } = useAuth();
  const isAdmin = Boolean(isAuthenticated && (user?.is_staff || user?.is_superuser || user?.role === 'ADMIN' || user?.role === 'STAFF'));
  const isFavorite = isInWishlist(product.id);

  // Sub-brand specific accent colors (all on clean white cards)
  const getThemeStyles = () => {
    switch (product.brandSlug || theme) {
      case 'velora':
        return {
          cardBg: 'bg-white border border-slate-200 hover:border-amber-400 hover:shadow-xl hover:shadow-amber-950/5',
          brandBadge: 'bg-amber-100/90 text-amber-900 border border-amber-200',
          btnBg: 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-amber-600/20',
          priceColor: 'text-amber-950',
          ratingColor: 'text-amber-500',
        };
      case 'elan':
        return {
          cardBg: 'bg-white border border-slate-200 hover:border-slate-400 hover:shadow-xl hover:shadow-slate-900/5',
          brandBadge: 'bg-slate-900 text-white',
          btnBg: 'bg-slate-900 hover:bg-amber-700 text-white shadow-slate-900/20',
          priceColor: 'text-slate-950',
          ratingColor: 'text-amber-500',
        };
      case 'stryde':
        return {
          cardBg: 'bg-white border border-slate-200 hover:border-cyan-500 hover:shadow-xl hover:shadow-cyan-900/5',
          brandBadge: 'bg-cyan-950 text-cyan-200 border border-cyan-800',
          btnBg: 'bg-slate-900 hover:bg-cyan-600 text-white shadow-slate-900/20',
          priceColor: 'text-slate-950',
          ratingColor: 'text-amber-500',
        };
      default:
        return {
          cardBg: 'bg-white border border-slate-200 hover:border-amber-300 hover:shadow-xl',
          brandBadge: 'bg-slate-100 text-slate-800',
          btnBg: 'bg-slate-900 hover:bg-amber-600 text-white',
          priceColor: 'text-slate-900',
          ratingColor: 'text-amber-500',
        };
    }
  };

  const style = getThemeStyles();

  return (
    <div className={`group rounded-2xl overflow-hidden transition-all duration-300 flex flex-col bg-white ${style.cardBg}`}>
      {/* Image Container with Hover Slideshow */}
      <HoverImageSlideshow
        images={product.images || product.additionalImages}
        primaryImage={product.image}
        alt={product.name}
        aspectRatio="aspect-[4/5]"
        showDots={true}
      >
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.discountBadge && (
            <span className="badge-discount">
              {product.discountBadge}
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-slate-900/90 backdrop-blur-xs text-amber-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Bestseller
            </span>
          )}
        </div>

        {/* Wishlist Button (Hidden for Admin) */}
        {!isAdmin && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product.id, product.dbId);
            }}
            className={`absolute top-2.5 right-2.5 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded-full backdrop-blur-md transition-all z-10 cursor-pointer ${
              isFavorite
                ? 'bg-rose-500 text-white shadow-lg'
                : 'bg-white/85 text-slate-700 hover:bg-white hover:text-rose-500'
            }`}
            title={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Quick View / Edit Link overlay on Hover */}
        <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2 sm:p-4 z-10">
          <Link
            to={`/product/${product.id}`}
            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white text-slate-900 text-[11px] sm:text-xs font-bold shadow-lg hover:bg-amber-50 hover:text-amber-800 transition-colors flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 cursor-pointer"
          >
            <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Quick View
          </Link>
          {isAdmin && (
            <Link
              to="/admin/products"
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-amber-600 text-white text-[11px] sm:text-xs font-bold shadow-lg hover:bg-amber-700 transition-colors flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 cursor-pointer"
            >
              <Edit3 className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Admin
            </Link>
          )}
        </div>
      </HoverImageSlideshow>


      {/* Content Section */}
      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between space-y-2.5 sm:space-y-3 bg-white">
        <div>
          <div className="flex items-center justify-between gap-1.5 mb-1 sm:mb-1.5">
            <span className={`text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 sm:px-2 rounded ${style.brandBadge}`}>
              {product.brand}
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-400 truncate">
              {product.category}
            </span>
          </div>

          <Link to={`/product/${product.id}`} className="block">
            <h3 className="font-semibold text-xs sm:text-sm line-clamp-2 transition-colors text-slate-900 hover:text-amber-700 leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 text-[11px] sm:text-xs">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                  i < Math.floor(product.rating)
                    ? `${style.ratingColor} fill-current`
                    : 'text-slate-300'
                }`}
              />
            ))}
          </div>
          <span className="font-bold text-slate-700 ml-0.5 sm:ml-1 text-[11px] sm:text-xs">{product.rating}</span>
          <span className="text-slate-400 text-[10px] sm:text-[11px]">({product.reviewsCount})</span>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-2 border-t border-slate-100/60 flex items-center justify-between gap-1.5">
          <div>
            <div className="flex items-baseline gap-1 sm:gap-1.5">
              <span className={`text-sm sm:text-base font-extrabold ${style.priceColor}`}>
                Rs. {Number(product.price).toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                  Rs. {Number(product.originalPrice).toLocaleString()}
                </span>
              )}
            </div>
          </div>


          <button
            onClick={() => addToCart(product)}
            className={`px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1 transition-all shadow-sm sm:shadow-md active:scale-95 cursor-pointer ${style.btnBg}`}
            title="Add to Cart"
          >
            <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="inline">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
