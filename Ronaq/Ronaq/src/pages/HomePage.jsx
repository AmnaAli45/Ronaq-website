import React, { useState, useEffect } from 'react';
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
  Banknote,
  Lock,
  Flame,
  ShoppingBag,
  Zap,
  Layers,
  ArrowUpRight,
  Check,
  Gift,
  HelpCircle
} from 'lucide-react';

const CATEGORIES_DATA = [
  {
    id: 'women',
    title: 'Women',
    subtitle: 'Luxury Pret, Kurtis & Dresses',
    badge: 'Trending Now',
    brand: 'Elan',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    link: '/elan?category=Women+Apparel',
    accentColor: 'from-amber-600/90 via-slate-900/80 to-slate-950'
  },
  {
    id: 'footwear',
    title: 'Footwear',
    subtitle: 'Sneakers, Loafers & Boots',
    badge: 'Engineered Comfort',
    brand: 'Stryde',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    link: '/stryde',
    accentColor: 'from-cyan-600/90 via-slate-900/80 to-slate-950'
  },
  {
    id: 'beauty',
    title: 'Beauty',
    subtitle: 'Glow Serums, Cleansers & Sunscreen',
    badge: 'Dermatologist Tested',
    brand: 'Velora',
    image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80',
    link: '/velora',
    accentColor: 'from-amber-500/90 via-slate-900/80 to-slate-950'
  },
  {
    id: 'accessories',
    title: 'Accessories',
    subtitle: 'Wallets, Eyewear, Bags & Watches',
    badge: 'Must Haves',
    brand: 'Ronak Luxe',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    link: '/accessories',
    accentColor: 'from-rose-600/90 via-slate-900/80 to-slate-950'
  },
  {
    id: 'men',
    title: 'Men',
    subtitle: 'Crisp Shirts, Polos & Streetwear',
    badge: 'Premium Fit',
    brand: 'Elan',
    image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80',
    link: '/elan?category=Men+Apparel',
    accentColor: 'from-slate-700/90 via-slate-900/80 to-slate-950'
  }
];

const WHY_SHOP_RONAK = [
  {
    icon: ShieldCheck,
    title: 'Quality Products',
    tagline: '100% Authentic Guarantee',
    desc: 'Pure dermatologically certified skincare, premium breathable cotton fabrics, and engineered high-durability footwear.',
    badge: 'Verified Genuine',
    accent: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    tagline: '2–4 Day Express Courier',
    desc: 'Swift dispatch and live SMS/WhatsApp tracking straight to your doorstep across all cities in Pakistan.',
    badge: 'Express Shipping',
    accent: 'text-blue-400 bg-blue-500/10 border-blue-500/30'
  },
  {
    icon: Banknote,
    title: 'Cash on Delivery',
    tagline: 'Pay Safely at Doorstep',
    desc: 'Zero risk shopping. Inspect your parcel at delivery and pay with complete confidence anywhere nationwide.',
    badge: 'COD Nationwide',
    accent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
  },
  {
    icon: RotateCcw,
    title: 'Easy Exchange',
    tagline: '30-Day Hassle-Free Policy',
    desc: 'Need a different size or shade? Enjoy quick, easy self-service exchanges and friendly support.',
    badge: 'Hassle-Free',
    accent: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
  },
  {
    icon: Lock,
    title: 'Secure Payment',
    tagline: 'Bank-Grade Protection',
    desc: '100% encrypted SSL checkout. Choose Cash on Delivery, Credit/Debit cards, or online bank transfer.',
    badge: '100% Protected',
    accent: 'text-purple-400 bg-purple-500/10 border-purple-500/30'
  }
];

const REVIEWS_DATA = [
  {
    name: 'Ayesha K.',
    city: 'Lahore',
    rating: 5,
    date: 'Verified Buyer',
    text: 'Ordered the Velora Vitamin C Serum and Elan Lawn Kurti in one cart. Received within 3 days via COD. The quality is phenomenal!',
    item: 'Velora Skincare & Elan Pret'
  },
  {
    name: 'Hamza Tariq',
    city: 'Karachi',
    rating: 5,
    date: 'Verified Buyer',
    text: 'Stryde sneakers are ultra comfortable and fit true to size. Free delivery over Rs. 2,999 is a great plus. 10/10 service.',
    item: 'Stryde Urban Runners'
  },
  {
    name: 'Zainab M.',
    city: 'Islamabad',
    rating: 5,
    date: 'Verified Buyer',
    text: 'Had to exchange a dress size, and Ronak’s customer team handled it smoothly within 48 hours. Genuine luxury experience!',
    item: 'Elan Contemporary Collection'
  }
];

export const HomePage = () => {
  const { settings } = useSiteSettings();
  const [activeTab, setActiveTab] = useState('all');
  const [bestsellerProducts, setBestsellerProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

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
    ? bestsellerProducts.filter(p => p.isBestSeller || p.rating >= 4.8).slice(0, 8)
    : bestsellerProducts.filter(p => (p.isBestSeller || p.rating >= 4.8) && p.brandSlug === activeTab).slice(0, 8);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const scrollToBestsellers = () => {
    const el = document.getElementById('bestsellers-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 font-sans bg-slate-50 text-slate-900 pb-20">

      {/* ========================================================================= */}
      {/* 1. MAIN HERO BANNER (High-Converting 5-10 Second Comprehension Hook) */}
      {/* ========================================================================= */}
      <section className="relative min-h-[580px] sm:min-h-[640px] lg:min-h-[720px] bg-slate-950 text-white overflow-hidden flex items-center justify-center">
        {/* Lifestyle Background Visual with Aesthetic Vignette */}
        <div className="absolute inset-0 z-0">
          <img
            src={settings.home_hero_image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2000&q=80'}
            alt={settings.site_name || 'Ronak Multi-Brand House'}
            className="w-full h-full object-cover object-center opacity-40 scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/40" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.85)_100%)]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6 sm:space-y-8 py-16 sm:py-20">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] sm:text-xs font-bold uppercase tracking-widest backdrop-blur-md shadow-lg shadow-amber-500/10 animate-fade-in">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>{settings.home_hero_badge || 'Pakistan’s Premier Multi-Brand House'}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-black tracking-tight text-white leading-[1.1]">
            {settings.home_hero_title ? (
              <span>{settings.home_hero_title}</span>
            ) : (
              <>
                Your Style. <br />
                <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent drop-shadow-sm">
                  Your RONAK.
                </span>
              </>
            )}
          </h1>

          {/* Value Pitch (What Ronak sells & benefits) */}
          <p className="text-sm sm:text-lg md:text-xl text-slate-200 max-w-3xl mx-auto font-light leading-relaxed">
            {settings.home_hero_subtitle || 'Discover Pakistan’s ultimate collective: Pure Velora Skincare, Luxury Elan Apparel, and High-Performance Stryde Footwear — with 1 Unified Cart and Nationwide Cash on Delivery.'}
          </p>

          {/* Primary Action Buttons */}
          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-md mx-auto sm:max-w-none">
            <button
              onClick={scrollToBestsellers}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transform active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-slate-950" />
              <span>SHOP NOW</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>

            <Link
              to="/elan"
              className="w-full sm:w-auto px-7 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs uppercase tracking-wider transition-all backdrop-blur-md flex items-center justify-center gap-2"
            >
              <span>Explore Collections</span>
            </Link>
          </div>

          {/* Social Proof & Trust Badges Strip Under Hero */}
          <div className="pt-8 sm:pt-10 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-slate-300 text-xs font-semibold">
            <div className="flex items-center justify-center gap-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span><strong>4.9/5</strong> (10k+ Reviews)</span>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Truck className="w-4 h-4 text-amber-400" />
              <span><strong>Free Delivery</strong> &gt; Rs. 2,999</span>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Banknote className="w-4 h-4 text-emerald-400" />
              <span><strong>COD Available</strong> Across Pakistan</span>
            </div>

            <div className="flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4 text-cyan-400" />
              <span><strong>Easy 30-Day</strong> Returns & Exchange</span>
            </div>
          </div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 2. SHOP BY CATEGORY (5 Requested Visual Category Cards) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Instant Discovery</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif font-black text-slate-900 tracking-tight">
              Shop by Category
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md">
            Explore premium fashion, authentic beauty serums, and athletic footwear crafted for everyday luxury.
          </p>
        </div>

        {/* 5-Card Grid: Responsive layout */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-6">
          {CATEGORIES_DATA.map((cat) => (
            <Link
              key={cat.id}
              to={cat.link}
              className="group relative rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 flex flex-col justify-end aspect-[3/4] bg-slate-900 border border-slate-200/60"
            >
              {/* Category Lifestyle Image */}
              <img
                src={cat.image}
                alt={cat.title}
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 brightness-95 group-hover:brightness-105"
              />

              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${cat.accentColor} opacity-75 group-hover:opacity-65 transition-opacity duration-300`} />

              {/* Badge */}
              <div className="absolute top-3 left-3 z-10">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/90 text-slate-900 backdrop-blur-md shadow-sm">
                  {cat.badge}
                </span>
              </div>

              {/* Content at Bottom */}
              <div className="relative z-10 p-4 sm:p-5 text-white space-y-1.5">
                <div className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">
                  {cat.brand}
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white group-hover:text-amber-300 transition-colors flex items-center justify-between">
                  <span>{cat.title}</span>
                  <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transform translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300 text-amber-400" />
                </h3>
                <p className="text-[11px] text-slate-200 line-clamp-1 font-light">
                  {cat.subtitle}
                </p>

                <div className="pt-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 group-hover:underline">
                    Shop Now <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 3. URGENCY / FLASH SELLING BANNER */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-amber-950 to-slate-900 text-white p-6 sm:p-10 border border-amber-500/30 shadow-xl">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-left">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-widest border border-amber-500/40">
                <Gift className="w-3.5 h-3.5 text-amber-400" />
                <span>Special Welcome Incentive</span>
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white">
                FREE Delivery on all orders above <span className="text-amber-400">Rs. 2,999</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Combine items from Velora, Elan, and Stryde in a single cart. Enjoy fast nationwide courier dispatch and Cash on Delivery.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
              <button
                onClick={scrollToBestsellers}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Claim Offer & Shop</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                to="/velora"
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-all border border-slate-700 flex items-center justify-center gap-2"
              >
                <span>View Skincare Deals</span>
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 4. "WHAT TO BUY RIGHT NOW" (Curated Bestsellers with Instant Action) */}
      {/* ========================================================================= */}
      <section id="bestsellers-section" className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>Trending Across Ronak</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif font-black text-slate-900">
              Curated Best Sellers
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Hand-picked customer favorites with 5-star ratings, instant COD checkout, and free shipping.
            </p>
          </div>

          {/* Sub-Brand Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Products' },
              { id: 'velora', label: 'Velora Skincare' },
              { id: 'elan', label: 'Elan Apparel' },
              { id: 'stryde', label: 'Stryde Footwear' },
              { id: 'accessories', label: 'Accessories Luxe' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-16">
            <div className="w-9 h-9 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500 mt-3 font-semibold">Loading verified bestsellers...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredBestsellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="text-center pt-4">
          <Link
            to={activeTab === 'velora' ? '/velora' : activeTab === 'elan' ? '/elan' : activeTab === 'stryde' ? '/stryde' : activeTab === 'accessories' ? '/accessories' : '/elan'}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-slate-900 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md"
          >
            <span>Explore Full Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 5. HOUSE OF RONAK: 3 ICONIC SUB-BRANDS */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
            House of Ronak
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-black text-slate-900">
            Three Distinct Worlds. One Unified Cart.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Each sub-brand preserves its own distinct aesthetic, formulation, and craftsmanship while sharing Ronak's unified checkout and COD experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {SUB_BRANDS.map((brand) => (
            <div
              key={brand.id}
              className="group rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-6 sm:p-8 relative"
            >
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
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
                  className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Shop {brand.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 6. "WHY SHOP RONAK?" (The 5 Core Selling & Trust Pillars) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>The Ronak Advantage</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-black text-slate-900">
            Why Shop Ronak?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            We combine premium quality with complete buyer protection for a seamless, risk-free shopping journey.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          {WHY_SHOP_RONAK.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-amber-400 transition-all duration-300 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${pillar.accent} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      {pillar.badge}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{pillar.title}</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-light">
                    {pillar.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-amber-700">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{pillar.tagline}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 7. REAL CUSTOMER REVIEWS / SOCIAL PROOF */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>Verified Buyer Feedback</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                Loved by Shoppers Across Pakistan
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-bold text-white">4.9 out of 5 Stars</div>
                <div className="text-[11px] text-slate-400">Based on 10,000+ Verified Orders</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {REVIEWS_DATA.map((rev, idx) => (
              <div key={idx} className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
                      {rev.date}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    "{rev.text}"
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{rev.name}</div>
                    <div className="text-[10px] text-slate-400">{rev.city}, Pakistan</div>
                  </div>
                  <div className="text-[10px] text-amber-300/80 text-right">
                    {rev.item}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 8. SHOPPING PEACE OF MIND / QUICK FAQ ACCORDION */}
      {/* ========================================================================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 uppercase tracking-widest">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Frictionless Shopping</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-500">
            Everything you need to know about our fast delivery, COD, and simple exchange process.
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'How does Cash on Delivery (COD) work?',
              a: 'You can place your order online without entering any credit card details. When our courier partner arrives at your address, simply inspect the package and pay the exact amount in cash.'
            },
            {
              q: 'When will I receive my order?',
              a: 'All orders are dispatched within 24 hours. Standard delivery across major cities in Pakistan (Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad) takes 2–4 business days.'
            },
            {
              q: 'How does the 30-Day Easy Exchange work?',
              a: 'If an apparel item does not fit or if you need a replacement, simply contact our WhatsApp support or use the self-service returns portal within 30 days. We arrange quick pickup or replacement with zero hassle.'
            },
            {
              q: 'Can I order products from Velora, Elan, and Stryde together in one cart?',
              a: 'Yes! Ronak is a unified collective. You can add skincare, clothing, and footwear to the same cart and receive everything in one single parcel with unified shipping.'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:text-amber-700 transition-colors cursor-pointer"
              >
                <span>{item.q}</span>
                <span className="text-slate-400 text-lg font-mono">
                  {openFaq === idx ? '−' : '+'}
                </span>
              </button>
              {openFaq === idx && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
