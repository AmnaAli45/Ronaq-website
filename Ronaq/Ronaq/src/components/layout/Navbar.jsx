import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import defaultLogo from '../../assets/logo.png';
import { SearchModal } from '../common/SearchModal';
import { AuthModal } from '../common/AuthModal';
import {
  ShoppingBag,
  Heart,
  Search,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Crown,
  Layers,
  Shirt,
  Footprints,
  Sparkle,
  User,
  LogOut,
  Truck,
  Package,
  Star,
  Settings,
  Phone,
  Banknote,
  RotateCcw,
  ShieldCheck
} from 'lucide-react';


export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const { totalItems, setIsCartOpen } = useCart();
  const { totalWishlist } = useWishlist();
  const { user, isAuthenticated, logout } = useAuth();
  const { settings, getPhoneTel } = useSiteSettings();
  const isAdmin = Boolean(isAuthenticated && (user?.is_staff || user?.is_superuser || user?.role === 'ADMIN' || user?.role === 'STAFF'));
  const location = useLocation();
  const navigate = useNavigate();




  const handleLogout = () => {
    logout();
    setIsUserDropdownOpen(false);
    navigate('/');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsCategoryDropdownOpen(false);
    setIsUserDropdownOpen(false);
  }, [location.pathname]);

  const activeSubBrand = location.pathname.includes('/velora') ? 'velora'
    : location.pathname.includes('/elan') ? 'elan'
    : location.pathname.includes('/stryde') ? 'stryde'
    : location.pathname.includes('/accessories') ? 'accessories'
    : 'ronak';

  return (
    <>
      <header className="sticky top-0 z-40 w-full transition-all duration-300 font-sans shadow-sm">
        {/* Sub-Brand Navigation Strip */}
        <div className="bg-slate-900 border-b border-slate-800 text-slate-300 py-1.5 px-3 sm:px-4 text-xs font-semibold">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 text-slate-400 shrink-0">
              <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden sm:inline">Shop by Category:</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-0.5 min-w-0">
              <Link
                to="/velora"
                className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs transition-all flex items-center gap-1 sm:gap-1.5 shrink-0 ${
                  activeSubBrand === 'velora'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'hover:text-amber-300 hover:bg-slate-800'
                }`}
              >
                <Sparkle className="w-3 h-3 text-amber-400 shrink-0" />
                <span>Velora <span className="text-[10px] opacity-75 font-normal hidden sm:inline">({settings.subbrand_velora_tagline || 'Cosmetics'})</span></span>
              </Link>
              <span className="text-slate-700 hidden sm:inline">|</span>
              <Link
                to="/elan"
                className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs transition-all flex items-center gap-1 sm:gap-1.5 shrink-0 ${
                  activeSubBrand === 'elan'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'hover:text-amber-300 hover:bg-slate-800'
                }`}
              >
                <Shirt className="w-3 h-3 text-amber-400 shrink-0" />
                <span>Elan <span className="text-[10px] opacity-75 font-normal hidden sm:inline">({settings.subbrand_elan_tagline || 'Clothing'})</span></span>
              </Link>
              <span className="text-slate-700 hidden sm:inline">|</span>
              <Link
                to="/stryde"
                className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs transition-all flex items-center gap-1 sm:gap-1.5 shrink-0 ${
                  activeSubBrand === 'stryde'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'hover:text-amber-300 hover:bg-slate-800'
                }`}
              >
                <Footprints className="w-3 h-3 text-amber-400 shrink-0" />
                <span>Stryde <span className="text-[10px] opacity-75 font-normal hidden sm:inline">({settings.subbrand_stryde_tagline || 'Footwear'})</span></span>
              </Link>
              <span className="text-slate-700 hidden sm:inline">|</span>
              <Link
                to="/accessories"
                className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs transition-all flex items-center gap-1 sm:gap-1.5 shrink-0 ${
                  activeSubBrand === 'accessories'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'hover:text-amber-300 hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-3 h-3 text-rose-400 shrink-0" />
                <span>Accessories <span className="text-[10px] opacity-75 font-normal hidden sm:inline">(Luxe)</span></span>
              </Link>
            </div>
            <div className="hidden sm:flex items-center gap-3 shrink-0">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="px-2.5 py-1 rounded-full text-xs font-bold text-amber-300 bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 transition-all flex items-center gap-1 shrink-0"
                  title="Open Admin Command Center"
                >
                  <Crown className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>Admin Hub</span>
                </Link>
              )}
              <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-400">
                <span>Need Help?</span>
                <a href={getPhoneTel()} className="text-amber-400 font-bold hover:underline">
                  {settings.phone_display || settings.phone_number || '1-800-RONAK'}
                </a>
              </div>
            </div>
          </div>
        </div>


        {/* Main Navbar */}
        <div className={`bg-white/95 backdrop-blur-md transition-all ${isScrolled ? 'shadow-md py-2.5 sm:py-3' : 'py-3 sm:py-4'} border-b border-slate-100`}>
          <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between gap-2">

            {/* Left: Mobile Menu Toggle & Brand Logo */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden text-slate-700 hover:text-amber-600 p-1 sm:p-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>

              {/* Dynamic Brand Logo */}
              <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group min-w-0">
                <img
                  src={(!logoError && settings.logo_url) ? settings.logo_url : defaultLogo}
                  alt={settings.site_name || 'Store Logo'}
                  onError={(e) => {
                    if (e.target.src !== defaultLogo) {
                      e.target.src = defaultLogo;
                    } else {
                      setLogoError(true);
                    }
                  }}
                  className="h-8 sm:h-9 w-8 sm:w-9 rounded-lg object-contain shadow-sm group-hover:scale-105 transition-transform shrink-0 bg-slate-950"
                />
                <div className="flex flex-col min-w-0">
                  <span className="font-serif text-base sm:text-2xl font-bold tracking-wider text-slate-900 leading-none group-hover:text-amber-700 transition-colors truncate">
                    {settings.site_name || 'RONAK'}
                  </span>
                  <span className="text-[7px] sm:text-[9px] uppercase font-bold tracking-[0.15em] sm:tracking-[0.2em] text-amber-600 truncate">
                    {settings.site_tagline || 'Luxury Collective'}
                  </span>
                </div>
              </Link>
            </div>

            {/* Center: Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-8 text-sm font-bold text-slate-700">
              <Link
                to="/"
                className={`hover:text-amber-700 transition-colors ${location.pathname === '/' ? 'text-amber-700 font-extrabold border-b-2 border-amber-600 pb-1' : ''}`}
              >
                Home
              </Link>

              <Link
                to="/velora"
                className={`hover:text-amber-700 transition-colors ${location.pathname === '/velora' ? 'text-amber-700 font-extrabold border-b-2 border-amber-600 pb-1' : ''}`}
              >
                Velora <span className="text-[10px] font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">Cosmetics</span>
              </Link>

              <Link
                to="/elan"
                className={`hover:text-amber-700 transition-colors ${location.pathname === '/elan' ? 'text-amber-700 font-extrabold border-b-2 border-amber-600 pb-1' : ''}`}
              >
                Elan <span className="text-[10px] font-normal text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">Fashion</span>
              </Link>

              <Link
                to="/stryde"
                className={`hover:text-amber-700 transition-colors ${location.pathname === '/stryde' ? 'text-amber-700 font-extrabold border-b-2 border-amber-600 pb-1' : ''}`}
              >
                Stryde <span className="text-[10px] font-normal text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">Shoes</span>
              </Link>

              <Link
                to="/accessories"
                className={`hover:text-amber-700 transition-colors ${location.pathname === '/accessories' ? 'text-amber-700 font-extrabold border-b-2 border-amber-600 pb-1' : ''}`}
              >
                Accessories <span className="text-[10px] font-normal text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">Luxe</span>
              </Link>
            </nav>

            {/* Right: Search, Auth, Wishlist, Cart / Admin Hub Icons */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {/* Search Trigger */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-1.5 sm:p-2 rounded-full text-slate-700 hover:text-amber-700 hover:bg-slate-100 transition-colors relative shrink-0"
                title="Search products"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* User Account / Auth Dropdown */}
              {isAuthenticated ? (
                <div className="relative shrink-0">
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center gap-1 p-1.5 sm:p-2 rounded-full text-slate-700 hover:text-amber-700 hover:bg-slate-100 transition-colors"
                    title="User Profile"
                  >
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                  </button>
                  {isUserDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-fade-in">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-900 truncate">{user?.first_name || 'Account'}</p>
                          {(user?.is_staff || user?.role === 'ADMIN' || user?.role === 'STAFF') && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">Admin</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                      </div>

                      <div className="py-1 border-b border-slate-100">
                        <Link
                          to="/my-orders"
                          className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-amber-800 rounded-xl transition-colors"
                        >
                          <Truck className="w-3.5 h-3.5 text-amber-600" />
                          <span>My Orders & Tracking</span>
                        </Link>
                      </div>

                      {(user?.is_staff || user?.role === 'ADMIN' || user?.role === 'STAFF') && (
                        <div className="py-1 border-b border-slate-100 space-y-0.5">
                          <Link
                            to="/admin"
                            className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-black text-amber-900 bg-amber-50/80 hover:bg-amber-100 rounded-xl transition-colors"
                          >
                            <Crown className="w-3.5 h-3.5 text-amber-600" />
                            <span>👑 Executive Admin Hub</span>
                          </Link>
                          <Link
                            to="/admin/settings"
                            className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-bold text-amber-800 hover:bg-amber-50 rounded-xl transition-colors"
                          >
                            <Settings className="w-3.5 h-3.5 text-amber-600" />
                            <span>Offers, Logo & Banners</span>
                          </Link>
                          <Link
                            to="/admin/products"
                            className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                          >
                            <Package className="w-3.5 h-3.5 text-amber-600" />
                            <span>Manage Products & Photos</span>
                          </Link>
                          <Link
                            to="/admin/orders"
                            className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                          >
                            <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                            <span>Manage Orders</span>
                          </Link>
                          <Link
                            to="/admin/reviews"
                            className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                          >
                            <Star className="w-3.5 h-3.5 text-amber-600" />
                            <span>Manage Customer Reviews</span>
                          </Link>
                        </div>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors mt-1"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="p-1.5 sm:p-2 rounded-full text-slate-700 hover:text-amber-700 hover:bg-slate-100 transition-colors shrink-0"
                  title="Sign In / Register"
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}

              {/* If Admin: Show only prominent Admin Hub button; If Customer: Show Wishlist & Cart */}
              {isAdmin ? (
                <Link
                  to="/admin"
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-[11px] sm:text-xs shadow-md border border-amber-400/40 transition-all active:scale-95 shrink-0"
                  title="Open Admin Management Portal"
                >
                  <Crown className="w-3.5 h-3.5 shrink-0" />
                  <span>Admin Hub</span>
                </Link>
              ) : (
                <>
                  {/* Wishlist */}
                  <Link
                    to="/wishlist"
                    className="p-1.5 sm:p-2 rounded-full text-slate-700 hover:text-rose-600 hover:bg-rose-50 transition-colors relative shrink-0"
                    title="Wishlist"
                  >
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                    {totalWishlist > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {totalWishlist}
                      </span>
                    )}
                  </Link>

                  {/* Cart Drawer Trigger */}
                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-slate-900 hover:bg-amber-700 text-white transition-all shadow-md group cursor-pointer shrink-0"
                  >
                    <div className="relative">
                      <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                      {totalItems > 0 && (
                        <span className="absolute -top-2 -right-2.5 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold flex items-center justify-center animate-pulse">
                          {totalItems}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold hidden sm:inline">Cart</span>
                  </button>
                </>
              )}

            </div>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Out Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-fade-in"
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col z-50 transform transition-transform duration-300 ease-in-out">
            {/* Drawer Header */}
            <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white flex items-center justify-between border-b border-amber-500/20">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2.5"
              >
                <img
                  src={(!logoError && settings.logo_url) ? settings.logo_url : defaultLogo}
                  alt={settings.site_name || 'Logo'}
                  onError={(e) => {
                    if (e.target.src !== defaultLogo) {
                      e.target.src = defaultLogo;
                    } else {
                      setLogoError(true);
                    }
                  }}
                  className="h-8 w-8 rounded-lg object-contain shadow-sm bg-slate-950"
                />
                <div>
                  <span className="font-serif text-lg font-bold tracking-wider text-white block leading-tight">{settings.site_name || 'RONAK'}</span>
                  <span className="text-[8px] uppercase font-bold tracking-widest text-amber-300">{settings.site_tagline || 'Luxury Collective'}</span>
                </div>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>


            {/* Quick Search Trigger in Drawer */}
            <div className="p-4 border-b border-slate-100">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsSearchOpen(true);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-semibold flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-slate-400" />
                  Search products, brands...
                </span>
                <span className="text-[10px] bg-white px-2 py-0.5 rounded-md border border-slate-200 font-bold">Find</span>
              </button>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Main Links */}
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 pb-1">
                  Explore Collections
                </p>
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                    location.pathname === '/' ? 'bg-amber-50 text-amber-900' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>Home</span>
                  <Crown className="w-4 h-4 text-amber-500" />
                </Link>

                <Link
                  to="/velora"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                    location.pathname === '/velora' ? 'bg-amber-50 text-amber-900' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Sparkle className="w-4 h-4 text-amber-500" />
                    Velora Skincare
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-black px-2 py-0.5 rounded-full">Cosmetics</span>
                </Link>

                <Link
                  to="/elan"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                    location.pathname === '/elan' ? 'bg-amber-50 text-amber-900' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Shirt className="w-4 h-4 text-slate-700" />
                    Elan Apparel
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-800 font-black px-2 py-0.5 rounded-full">Fashion</span>
                </Link>

                <Link
                  to="/stryde"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                    location.pathname === '/stryde' ? 'bg-cyan-50 text-cyan-900' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Footprints className="w-4 h-4 text-cyan-600" />
                    Stryde Footwear
                  </span>
                  <span className="text-[10px] bg-cyan-100 text-cyan-800 font-black px-2 py-0.5 rounded-full">Shoes</span>
                </Link>

                <Link
                  to="/accessories"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                    location.pathname === '/accessories' ? 'bg-rose-50 text-rose-900' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-rose-600" />
                    Ronak Accessories
                  </span>
                  <span className="text-[10px] bg-rose-100 text-rose-800 font-black px-2 py-0.5 rounded-full">Luxe</span>
                </Link>
              </div>

              {/* Personal & Order Shortcuts */}
              <div className="space-y-1 pt-2 border-t border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 pb-1">
                  Customer Hub
                </p>

                {!isAdmin && (
                  <Link
                    to="/wishlist"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-500" />
                      My Luxury Wishlist
                    </span>
                    {totalWishlist > 0 && (
                      <span className="text-xs bg-rose-500 text-white font-bold px-2 py-0.5 rounded-full">
                        {totalWishlist}
                      </span>
                    )}
                  </Link>
                )}

                <Link
                  to="/track-order"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-600" />
                    Track Live Orders
                  </span>
                  <span className="text-[10px] text-slate-400">COD Pakistan</span>
                </Link>

                {isAuthenticated && (
                  <Link
                    to="/my-orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-indigo-600" />
                      Order History
                    </span>
                  </Link>
                )}

                {isAdmin && (
                  <div className="space-y-1.5 pt-2 mt-2 border-t border-amber-200/50 bg-amber-50/60 p-2.5 rounded-2xl border border-amber-200/60">
                    <p className="text-[10px] font-black uppercase tracking-wider text-amber-900 px-1">
                      Admin Command Portal
                    </p>
                    <Link
                      to="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-sm transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <Crown className="w-3.5 h-3.5" />
                        Executive Admin Hub
                      </span>
                      <span className="text-[10px] font-bold">Open →</span>
                    </Link>
                    <Link
                      to="/admin/settings"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-white/80 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Settings className="w-3.5 h-3.5 text-amber-600" />
                        Offers, Logo & Banners
                      </span>
                    </Link>
                    <Link
                      to="/admin/products"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-white/80 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Package className="w-3.5 h-3.5 text-amber-600" />
                        Manage Products & Photos
                      </span>
                    </Link>
                    <Link
                      to="/admin/orders"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-white/80 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                        Admin Order Management
                      </span>
                    </Link>
                    <Link
                      to="/admin/reviews"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-white/80 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Star className="w-3.5 h-3.5 text-amber-600" />
                        Customer Reviews Hub
                      </span>
                    </Link>
                  </div>
                )}




              </div>
            </div>

            {/* Drawer Footer: User Account & Sign Out */}
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{user?.first_name || 'Logged In Customer'}</p>
                      <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsAuthOpen(true);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-amber-600 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-md cursor-pointer"
                >
                  <User className="w-4 h-4" /> Sign In / Register
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Live Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Authentication Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};
