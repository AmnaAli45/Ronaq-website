import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { PRODUCTS } from '../data/products';
import { catalogAPI } from '../services/api';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { ProductCard } from '../components/common/ProductCard';
import { FilterSidebar } from '../components/common/FilterSidebar';
import { SortDropdown } from '../components/common/SortDropdown';
import {
  Sparkles,
  SlidersHorizontal,
  Crown,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkle,
  Watch,
  Glasses,
  ShoppingBag,
  Award
} from 'lucide-react';

export const AccessoriesPage = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const { settings } = useSiteSettings();
  const [accessoriesProducts, setAccessoriesProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategories, setSelectedCategories] = useState(categoryParam ? [categoryParam] : []);
  const [priceRange, setPriceRange] = useState([0, 15000]);
  const [onlySale, setOnlySale] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('featured');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    }
  }, [categoryParam]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchAccessoriesProducts = async () => {
      setLoading(true);
      try {
        const res = await catalogAPI.getProducts({ brand: 'accessories' }, { signal: controller.signal });
        const items = res.data.results || res.data;
        if (items && items.length > 0) {
          const mapped = items.map(p => ({
            id: p.slug,
            dbId: p.id,
            brand: p.brand,
            brandSlug: p.brand_slug || 'accessories',
            name: p.name,
            category: p.category,
            price: parseFloat(p.price),
            originalPrice: p.discount_price ? parseFloat(p.discount_price) : parseFloat(p.price),
            discountBadge: p.discount_badge,
            rating: p.rating,
            reviewsCount: p.reviews_count,
            isBestSeller: p.is_bestseller,
            isNewArrival: p.is_new_arrival,
            image: p.image,
            images: p.images || (p.image ? [p.image] : []),
            additionalImages: p.images || []
          }));

          if (isMounted) {
            setAccessoriesProducts(mapped);
            setLoading(false);
          }
          return;
        }
      } catch (err) {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED' || err.name === 'AbortError') {
          return;
        }
        console.error('API Error, falling back to static catalog:', err);
      }
      if (isMounted) {
        const filtered = PRODUCTS.filter(p =>
          p.brandSlug === 'accessories' ||
          p.category === 'Wallets' ||
          p.category === 'Eyewear' ||
          p.category === 'Bags & Totes' ||
          p.category === 'Watches' ||
          p.category === 'Scarves' ||
          p.category === 'Belts' ||
          p.category === 'Pouches & Cases' ||
          p.category === 'Jewelry'
        );
        setAccessoriesProducts(filtered.length > 0 ? filtered : PRODUCTS.slice(0, 8));
        setLoading(false);
      }
    };

    fetchAccessoriesProducts();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const categories = useMemo(() => {
    return Array.from(new Set(accessoriesProducts.map(p => p.category)));
  }, [accessoriesProducts]);

  const handleCategoryChange = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 15000]);
    setOnlySale(false);
    setMinRating(0);
    setSortBy('featured');
  };

  const filteredProducts = useMemo(() => {
    return accessoriesProducts.filter(product => {
      if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
        return false;
      }
      if (product.price > priceRange[1]) {
        return false;
      }
      if (onlySale && !product.discountBadge) {
        return false;
      }
      if (minRating > 0 && product.rating < minRating) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'bestseller') return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
      if (sortBy === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
      return 0;
    });
  }, [accessoriesProducts, selectedCategories, priceRange, onlySale, minRating, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white py-12 sm:py-16 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=2000&q=80"
            alt="Ronak Luxury Accessories"
            className="w-full h-full object-cover object-center opacity-25 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">
            <Crown className="w-4 h-4" />
            <span>Ronak Luxury Accessories</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight mb-3 sm:mb-4">
            Artisanal Leather, Eyewear & Lifestyle Essentials
          </h1>
          <p className="text-xs sm:text-base text-slate-300 max-w-2xl font-light leading-relaxed mb-6 sm:mb-8">
            Curated accessories designed to elevate your everyday statement. From handcrafted full-grain leather wallets and polarized aviators to pure silk scarves and timepieces.
          </p>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-semibold text-slate-300 pt-4 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>100% Genuine Materials</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-400" />
              <span>Free Delivery Above Rs. 2,999</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>30-Day Easy Exchange</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex items-center justify-between mb-6 sm:mb-8 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900 text-white text-xs font-bold shadow-sm active:scale-95 transition-transform"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>Filters</span>
            </button>
            <span className="text-xs font-bold text-slate-500">
              Showing <strong className="text-slate-900">{filteredProducts.length}</strong> Luxury Accessories
            </span>
          </div>
          <SortDropdown sortBy={sortBy} onSortChange={setSortBy} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          <div>
            <FilterSidebar
              categories={categories}
              selectedCategories={selectedCategories}
              onCategoryChange={handleCategoryChange}
              priceRange={priceRange}
              maxPriceLimit={15000}
              onPriceChange={setPriceRange}
              onlySale={onlySale}
              onSaleChange={setOnlySale}
              minRating={minRating}
              onRatingChange={setMinRating}
              onResetFilters={handleResetFilters}
              totalResultsCount={filteredProducts.length}
              brandTheme="ronak"
              isMobileOpen={isMobileFilterOpen}
              onCloseMobile={() => setIsMobileFilterOpen(false)}
            />
          </div>

          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-16">
                <div className="w-9 h-9 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-slate-500 mt-3 font-semibold">Loading luxury accessories...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No accessories match your filters</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting your price range or selected categories to view available items.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 rounded-full bg-slate-900 text-white font-bold text-xs hover:bg-amber-600 transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
