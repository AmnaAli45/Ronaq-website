import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PRODUCTS, SUB_BRANDS } from '../data/products';
import { catalogAPI } from '../services/api';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { ProductCard } from '../components/common/ProductCard';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Crown,
  Star,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const HomePage = () => {
  const { settings } = useSiteSettings();
  const [activeTab, setActiveTab] = useState('all');
  const [bestsellerProducts, setBestsellerProducts] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchBestsellers = async () => {
      setLoading(true);
      try {
        const res = await catalogAPI.getProducts({ sort: 'bestselling' }, { signal: controller.signal });
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
            setBestsellerProducts(mapped);
            setLoading(false);
          }
          return;
        }
      } catch (err) {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED' || err.name === 'AbortError') {
          return;
        }
        console.error('API Error fetching bestsellers:', err);
      }
      if (isMounted) {
        setBestsellerProducts(PRODUCTS);
        setLoading(false);
      }
    };

    fetchBestsellers();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const filteredBestsellers = activeTab === 'all'
    ? bestsellerProducts.filter(p => p.isBestSeller)
    : bestsellerProducts.filter(p => p.isBestSeller && p.brandSlug === activeTab);

  return (
    <div className="space-y-16 font-sans bg-slate-50 text-slate-900 pb-16">

      {/* 1. Hero Banner / Carousel Section */}
      <section className="relative min-h-[550px] lg:min-h-[640px] bg-slate-950 text-white overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img
            src={settings.home_hero_image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2000&q=80'}
            alt={settings.site_name || 'Ronaq Luxury'}
            className="w-full h-full object-cover object-center opacity-30 scale-105 animate-pulse-slow"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-6 py-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest backdrop-blur-md">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>{settings.home_hero_badge || 'The Premier Luxury Umbrella Brand'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-white leading-tight">
            {settings.home_hero_title ? (
              <span>{settings.home_hero_title}</span>
            ) : (
              <>
                One Destination. <br />
                <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent">
                  Three Iconic Sub-Brands.
                </span>
              </>
            )}
          </h1>

          <p className="text-xs sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            {settings.home_hero_subtitle || 'Experience Velora skincare, Elan luxury apparel, and Stryde athletic footwear under Ronaq’s unified multi-brand house.'}
          </p>

          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-4 w-full max-w-md mx-auto sm:max-w-none">
            <Link
              to="/velora"
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              Explore Velora <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/elan"
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2"
            >
              Shop Elan Apparel <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/stryde"
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700 hover:bg-cyan-900 font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2"
            >
              Discover Stryde <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>


      {/* 2. Featured Sub-Brands Cards (Velora, Elan, Stryde) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
            House of Ronaq
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
            Explore Our Three Iconic Sub-Brands
          </h2>
          <p className="text-xs text-slate-500">
            Each sub-brand preserves its own distinct aesthetic, craftsmanship, and mood while sharing Ronaq's unified checkout experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
          {SUB_BRANDS.map((brand) => (
            <div
              key={brand.id}
              className="group rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between p-6 sm:p-8 relative"
            >
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    {brand.tagline}
                  </span>
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">{brand.name}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{brand.description}</p>
              </div>

              <div className="pt-6 sm:pt-8">
                <Link
                  to={brand.path}
                  className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Shop {brand.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Bestsellers Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
              Trending Across Ronaq
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
              Curated Best Sellers
            </h2>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {['all', 'velora', 'elan', 'stryde'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold capitalize transition-all shrink-0 ${
                  activeTab === tab
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500 mt-3 font-semibold">Loading bestsellers from backend...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredBestsellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Value Propositions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 bg-white p-5 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Free Express Delivery</h4>
              <p className="text-[11px] text-slate-500">On all orders over Rs. 2,500</p>
            </div>

          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-900 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">100% Authentic Guarantee</h4>
              <p className="text-[11px] text-slate-500">Direct from luxury brands</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">30-Day Hassle Free Returns</h4>
              <p className="text-[11px] text-slate-500">Easy self-service returns</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-800 flex items-center justify-center shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">24/7 VIP Concierge</h4>
              <p className="text-[11px] text-slate-500">Dedicated support line</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
