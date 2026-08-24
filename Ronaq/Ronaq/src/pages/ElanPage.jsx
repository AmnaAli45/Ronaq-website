import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PRODUCTS } from '../data/products';
import { catalogAPI } from '../services/api';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { ProductCard } from '../components/common/ProductCard';
import { FilterSidebar } from '../components/common/FilterSidebar';
import { SortDropdown } from '../components/common/SortDropdown';
import { Shirt, SlidersHorizontal, Scissors, Sparkles, Flame } from 'lucide-react';

export const ElanPage = () => {
  const { settings } = useSiteSettings();
  const [elanProducts, setElanProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 15000]);
  const [onlySale, setOnlySale] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('featured');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);



  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchElanProducts = async () => {
      setLoading(true);
      try {
        const res = await catalogAPI.getProducts({ brand: 'elan' }, { signal: controller.signal });
        const items = res.data.results || res.data;
        if (items && items.length > 0) {
          const mapped = items.map(p => ({
            id: p.slug,
            dbId: p.id,
            brand: p.brand,
            brandSlug: p.brand_slug,
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
            setElanProducts(mapped);
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
        setElanProducts(PRODUCTS.filter(p => p.brandSlug === 'elan'));
        setLoading(false);
      }
    };

    fetchElanProducts();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const categories = useMemo(() => {
    return Array.from(new Set(elanProducts.map(p => p.category)));
  }, [elanProducts]);

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
    return elanProducts.filter(product => {
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
  }, [elanProducts, selectedCategories, priceRange, onlySale, minRating, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white py-10 sm:py-16 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">
            <Shirt className="w-4 h-4" />
            <span>{settings.elan_hero_badge || 'Sub-Brand Spotlight'}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight mb-3 sm:mb-4">
            {settings.elan_hero_title || 'Elan Contemporary Apparel'}
          </h1>
          <p className="text-xs sm:text-base text-slate-300 max-w-2xl font-light leading-relaxed mb-6 sm:mb-8">
            {settings.elan_hero_subtitle || 'Elevated minimalist clothing for Men, Women, and Teens crafted from premium sustainable fabrics.'}
          </p>


          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-semibold text-slate-300 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-amber-400" />
              <span>Tailored Fits</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>100% Organic Cotton & Linen</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Ethically Manufactured</span>
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
              Showing <strong className="text-slate-900">{filteredProducts.length}</strong> Products
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
              brandTheme="elan"
              isMobileOpen={isMobileFilterOpen}
              onCloseMobile={() => setIsMobileFilterOpen(false)}
            />

          </div>

          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12">
                <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-slate-500 mt-3 font-semibold">Loading Elan collection...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-2">No products match your filters</h3>
                <p className="text-xs text-slate-500 mb-4">Try adjusting your filters.</p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 rounded-full bg-slate-900 text-white font-bold text-xs"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {filteredProducts.map(product => (
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
