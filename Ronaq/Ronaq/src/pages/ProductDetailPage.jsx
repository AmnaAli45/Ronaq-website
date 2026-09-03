import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PRODUCTS } from '../data/products';
import { catalogAPI, reviewsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/common/ProductCard';
import { ProductModal } from '../components/admin/ProductModal';
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  Plus,
  Minus,
  Check,
  Sparkles,
  Share2,
  ThumbsUp,
  MessageSquare,
  Zap,
  Edit,
  Crown,
  Layers,
  Settings,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user, isAuthenticated } = useAuth();
  const isUserAdmin = Boolean(isAuthenticated && (user?.is_staff || user?.is_superuser || user?.role === 'ADMIN' || user?.role === 'STAFF'));

  const [product, setProduct] = useState(null);
  const [rawProduct, setRawProduct] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editSuccessMsg, setEditSuccessMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details');
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [customerLocation, setCustomerLocation] = useState('');
  const [newComment, setNewComment] = useState('');

  const [reviewMsg, setReviewMsg] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const lastFetchedIdRef = useRef(null);


  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchProductData = async () => {
      setLoading(true);
      try {
        const res = await catalogAPI.getProductBySlug(id, { signal: controller.signal });
        const p = res.data;
        setRawProduct(p);
        const mappedProduct = {
          id: p.slug || p.id,
          dbId: p.id,
          brand: p.brand_name || p.brand,
          brandSlug: p.brand_slug,
          name: p.name,
          category: p.category_name || p.category,
          price: 0,
          originalPrice: p.discount_price ? parseFloat(p.discount_price) : parseFloat(p.base_price || p.price || 0),
          discountBadge: '100% FREE',
          rating: p.rating,
          reviewsCount: p.reviews_count,
          isBestSeller: p.is_bestseller,
          isNewArrival: p.is_new_arrival,
          is_active: p.is_active,
          image: p.primary_image || (p.images && p.images[0]?.image_url) || p.image,
          additionalImages: Array.isArray(p.images) ? p.images.map(img => img.image_url) : (p.images || []),
          description: p.description,
          features: p.features || [],
          shadesOrSizes: p.shades_or_sizes || [],
          ingredients: p.ingredients,
          howToUse: p.how_to_use,
          variants: p.variants || []
        };
        if (isMounted) {
          setProduct(mappedProduct);
          setSelectedImage(mappedProduct.image);
          setSelectedVariant(mappedProduct.shadesOrSizes[0] || 'Standard');
          setLoading(false);
        }
      } catch (err) {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED' || err.name === 'AbortError') {
          return;
        }
        // Fallback to local products.js dataset if API server unavailable
        const localP = PRODUCTS.find(p => p.id === id);
        if (isMounted) {
          if (localP) {
            setProduct(localP);
            setRawProduct(localP);
            setSelectedImage(localP.image);
            setSelectedVariant(localP.shadesOrSizes ? localP.shadesOrSizes[0] : 'Standard');
          }
          setLoading(false);
        }
      }
    };

    fetchProductData();


    // Fetch live product reviews
    reviewsAPI.getReviews(id, { signal: controller.signal })
      .then(res => {
        const reviewList = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        if (isMounted) setReviews(reviewList);
      })
      .catch((err) => {
        if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED' && err.name !== 'AbortError') {
          if (isMounted) setReviews([]);
        }
      });

    setQuantity(1);
    window.scrollTo(0, 0);

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [id]);

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setReviewMsg('');
    setReviewError('');
    setSubmittingReview(true);
    try {
      const res = await reviewsAPI.submitPublicReview({
        rating: newRating,
        comment: newComment.trim(),
        customer_name: customerName.trim() || user?.first_name || 'Verified Buyer',
        customer_location: customerLocation.trim() || 'Pakistan',
        product_id: product?.dbId || null
      });
      const savedReview = res.data?.review || res.data;
      setReviews(prev => [savedReview, ...(Array.isArray(prev) ? prev : [])]);
      setNewComment('');
      setCustomerName('');
      setCustomerLocation('');
      setReviewMsg('Thank you! Your verified star rating and review have been published.');
      if (product) {
        setProduct(prev => {
          if (!prev) return prev;
          const updatedCount = (prev.reviewsCount || 0) + 1;
          const updatedRating = Math.round(((prev.rating * (prev.reviewsCount || 1) + newRating) / (updatedCount || 1)) * 10) / 10;
          return { ...prev, reviewsCount: updatedCount, rating: updatedRating };
        });
      }
    } catch (err) {
      console.error('Error adding review:', err);
      setReviewError(err.response?.data?.error || 'Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 bg-slate-50">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 mt-4 font-semibold">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-slate-50">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Product Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">The product you are looking for does not exist or has been removed.</p>
        <Link to="/" className="px-6 py-3 rounded-full bg-slate-900 text-white text-xs font-bold uppercase tracking-wider">
          Return to Home
        </Link>
      </div>
    );
  }

  const handleProductSaved = async (savedProduct) => {
    setIsEditModalOpen(false);
    setEditSuccessMsg(`Product "${savedProduct.name || product.name}" specifications updated successfully!`);
    setTimeout(() => setEditSuccessMsg(''), 5000);

    // Refresh product details from backend
    try {
      const targetSlug = savedProduct.slug || savedProduct.id || id;
      const res = await catalogAPI.getProductBySlug(targetSlug);
      const p = res.data;
      setRawProduct(p);
      const mapped = {
        id: p.slug || p.id,
        dbId: p.id,
        brand: p.brand_name || p.brand,
        brandSlug: p.brand_slug,
        name: p.name,
        category: p.category_name || p.category,
        price: parseFloat(p.base_price || p.price),
        originalPrice: p.discount_price ? parseFloat(p.discount_price) : parseFloat(p.base_price || p.price),
        discountBadge: p.discount_badge,
        rating: p.rating,
        reviewsCount: p.reviews_count,
        isBestSeller: p.is_bestseller,
        isNewArrival: p.is_new_arrival,
        is_active: p.is_active,
        image: p.primary_image || (p.images && p.images[0]?.image_url) || p.image,
        additionalImages: Array.isArray(p.images) ? p.images.map(img => img.image_url) : (p.images || []),
        description: p.description,
        features: p.features || [],
        shadesOrSizes: p.shades_or_sizes || [],
        ingredients: p.ingredients,
        howToUse: p.how_to_use,
        variants: p.variants || []
      };
      setProduct(mapped);
      if (mapped.image) setSelectedImage(mapped.image);
      if (p.slug && p.slug !== id) {
        navigate(`/product/${p.slug}`, { replace: true });
      }
    } catch (err) {
      console.error('Error refreshing product details:', err);
    }
  };

  const isFavorite = isInWishlist(product.id);
  const relatedProducts = PRODUCTS.filter(p => p.brandSlug === product.brandSlug && p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, selectedVariant, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedVariant, quantity);
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">

      {/* Admin Floating / Inline Quick-Edit Control Ribbon */}
      {isUserAdmin && (
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 border-b border-amber-500/30 text-white px-4 sm:px-6 py-3 shadow-lg">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Crown className="w-4 h-4" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">Admin Control Mode</span>
                  <span className="text-slate-500">•</span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    product.is_active !== false ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {product.is_active !== false ? '✓ Live on Storefront' : 'Draft (Hidden)'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium">You can edit this product's formula, photos, prices (Rs.), variants & stock directly.</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" /> Edit Product Details
              </button>

              <Link
                to="/admin/products"
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5" /> All Catalog
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {editSuccessMsg && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2.5 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{editSuccessMsg}</span>
          </div>
        </div>
      )}

      {/* Breadcrumbs Navigation */}
      <div className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Link to="/" className="hover:text-amber-700">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <Link to={`/${product.brandSlug}`} className="hover:text-amber-700 font-medium">
            {product.brand}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-900 font-bold truncate max-w-xs">{product.name}</span>
        </div>
      </div>


      {/* Main Detail Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 bg-white p-4 sm:p-8 lg:p-10 rounded-3xl border border-slate-200 shadow-sm">

          {/* Left Column: Image Gallery */}
          <div className="space-y-3 sm:space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative group">
              <img
                src={selectedImage || product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {product.discountBadge && (
                <span className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-amber-500 text-slate-950 text-[11px] sm:text-xs font-black px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-md z-10">
                  {product.discountBadge}
                </span>
              )}
              <button
                onClick={() => toggleWishlist(product.id, product.dbId)}
                className={`absolute top-3 right-3 sm:top-4 sm:right-4 p-2 sm:p-3 rounded-full transition-all shadow-md z-10 cursor-pointer ${
                  isFavorite ? 'bg-rose-500 text-white' : 'bg-white/90 text-slate-700 hover:text-rose-500'
                }`}
              >
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Thumbnail Carousel */}
            {product.additionalImages && product.additionalImages.length > 0 && (
              <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 no-scrollbar">
                {[product.image, ...product.additionalImages].map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-slate-100 cursor-pointer ${
                      selectedImage === img ? 'border-amber-600 ring-2 ring-amber-500/20' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Information & Purchase Controls */}
          <div className="flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black tracking-widest uppercase text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  {product.brand}
                </span>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-semibold text-slate-400">SKU: {product.id.toUpperCase()}</span>
                  {isUserAdmin && (
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(true)}
                      className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-500/30 rounded-lg text-[11px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      title="Edit Product Details & Photos"
                    >
                      <Edit className="w-3 h-3 text-amber-700" /> Edit
                    </button>
                  )}
                </div>
              </div>


              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 leading-tight mb-3">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-4 text-xs">
                <div className="flex items-center gap-0.5 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating || 5)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-slate-100 text-slate-300'
                      }`}
                    />
                  ))}
                  <span className="font-extrabold text-slate-900 ml-1.5">{parseFloat(product.rating || 5).toFixed(1)}</span>
                </div>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('reviews')}
                  className="text-slate-500 hover:text-amber-700 underline font-medium cursor-pointer"
                >
                  {product.reviewsCount || reviews.length || 0} customer reviews
                </button>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-3xl font-extrabold text-slate-900">Rs. {Number(product.price).toLocaleString()}</span>
                {product.originalPrice > product.price && (
                  <span className="text-sm text-slate-400 line-through font-medium">
                    Rs. {Number(product.originalPrice).toLocaleString()}
                  </span>
                )}
                <span className="ml-auto text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  In Stock & Ready to Ship
                </span>
              </div>


              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Variant Selector */}
              {product.shadesOrSizes && product.shadesOrSizes.length > 0 && (
                <div className="mb-6">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Select Size / Shade:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.shadesOrSizes.map((variant) => (
                      <button
                        key={variant}
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          selectedVariant === variant
                            ? 'bg-slate-900 text-white shadow-md'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {variant}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-8">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Quantity:
                </label>
                <div className="inline-flex items-center border border-slate-300 rounded-xl bg-slate-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-5 font-bold text-sm text-slate-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  <span>Add to Bag</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 transition-all active:scale-98 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-current text-amber-300" />
                  <span>Buy Now</span>
                </button>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-[11px] text-center text-slate-500 font-medium">
                <div className="flex flex-col items-center gap-1">
                  <Truck className="w-4 h-4 text-amber-600" />
                  <span>Free Express Delivery</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <RotateCcw className="w-4 h-4 text-amber-600" />
                  <span>30 Days Easy Return</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>100% Authentic Guarantee</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Tabs: Details, Ingredients, How To Use, Reviews */}
        <div className="mt-8 sm:mt-12 bg-white rounded-3xl border border-slate-200 p-4 sm:p-8 lg:p-10 shadow-sm">
          <div className="flex border-b border-slate-200 gap-4 sm:gap-8 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-4 text-xs font-extrabold uppercase tracking-wider transition-colors border-b-2 shrink-0 ${
                activeTab === 'details' ? 'border-amber-600 text-amber-700' : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Key Features
            </button>
            {product.ingredients && (
              <button
                onClick={() => setActiveTab('ingredients')}
                className={`pb-4 text-xs font-extrabold uppercase tracking-wider transition-colors border-b-2 shrink-0 ${
                  activeTab === 'ingredients' ? 'border-amber-600 text-amber-700' : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Materials & Formula
              </button>
            )}
            {product.howToUse && (
              <button
                onClick={() => setActiveTab('howtouse')}
                className={`pb-4 text-xs font-extrabold uppercase tracking-wider transition-colors border-b-2 shrink-0 ${
                  activeTab === 'howtouse' ? 'border-amber-600 text-amber-700' : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                How To Use / Care
              </button>
            )}
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 text-xs font-extrabold uppercase tracking-wider transition-colors border-b-2 shrink-0 ${
                activeTab === 'reviews' ? 'border-amber-600 text-amber-700' : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Reviews ({reviews.length})
            </button>
          </div>

          <div className="py-6 text-sm text-slate-600 leading-relaxed">
            {activeTab === 'details' && (
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 mb-2">Highlights & Specifications:</h4>
                <ul className="space-y-2">
                  {product.features && product.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                      <Check className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'ingredients' && (
              <p className="text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100 font-mono">
                {product.ingredients}
              </p>
            )}

            {activeTab === 'howtouse' && (
              <p className="text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {product.howToUse}
              </p>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {/* Submit customer review with interactive star rating */}
                <form onSubmit={handleAddReview} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Share Your Rating for {product.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-bold">Verified Customer Review</span>
                  </div>

                  {reviewMsg && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>{reviewMsg}</span>
                    </div>
                  )}

                  {reviewError && (
                    <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold">
                      {reviewError}
                    </div>
                  )}

                  {/* Interactive Star Rating Selector */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
                        Choose Your Star Rating *
                      </label>
                      <span className="text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200 px-3 py-0.5 rounded-full">
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
                            title={`Rate ${star} Star${star > 1 ? 's' : ''}`}
                          >
                            <Star
                              className={`w-7 h-7 transition-all ${
                                isFilled
                                  ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                                  : 'text-slate-300 fill-slate-50 group-hover:text-amber-300'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Customer Name & Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Ayesha K."
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">City / Region</label>
                      <input
                        type="text"
                        placeholder="e.g. Lahore, Pakistan"
                        value={customerLocation}
                        onChange={(e) => setCustomerLocation(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                      />
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Your Feedback *</label>
                    <textarea
                      required
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your experience regarding texture, fit, quality, packaging..."
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white resize-none"
                      rows={3}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-amber-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    {submittingReview ? 'Submitting Review...' : 'Post Verified Rating'}
                  </button>
                </form>

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviews.length > 0 ? (
                    reviews.map((rev) => (
                      <div key={rev.id || Math.random()} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{rev.customer_name || rev.display_name || rev.user_name || 'Verified Buyer'}</span>
                            {rev.customer_location && (
                              <span className="text-[10px] text-slate-400">• {rev.customer_location}</span>
                            )}
                          </div>
                          <span className="text-slate-400 text-[10px]">
                            {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < (rev.rating || 5)
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-slate-200 fill-slate-100'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] font-bold text-slate-700 ml-1">({rev.rating || 5}.0)</span>
                          {rev.is_verified_purchase !== false && (
                            <span className="ml-2 text-[9px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              ✓ Verified Buyer
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-700 pt-1 leading-relaxed italic">"{rev.comment}"</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic py-4 text-center">No customer reviews yet for this product. Be the first to leave a rating!</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Admin Product Edit Modal */}
      {isUserAdmin && (
        <ProductModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSaved={handleProductSaved}
          productToEdit={rawProduct || product}
        />
      )}
    </div>
  );
};

