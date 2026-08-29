import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { catalogAPI } from '../services/api';
import { ProductModal } from '../components/admin/ProductModal';
import { DeleteConfirmModal } from '../components/admin/DeleteConfirmModal';
import { CityManagementModal } from '../components/admin/CityManagementModal';
import { ReviewManagementModal } from '../components/admin/ReviewManagementModal';
import { HoverImageSlideshow } from '../components/common/HoverImageSlideshow';
import { AuthModal } from '../components/common/AuthModal';


import {
  Package,
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  ExternalLink,
  ShieldAlert,
  Home,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  ShoppingBag,
  Crown,
  Tag,
  SlidersHorizontal,
  ChevronRight,
  TrendingDown,
  Sparkle,
  Shirt,
  Footprints,
  MapPin,
  Star
} from 'lucide-react';


const BRAND_CONFIG = {
  velora: { name: 'Velora', badge: 'bg-amber-100 text-amber-900 border-amber-300', icon: Sparkle },
  elan: { name: 'Elan', badge: 'bg-indigo-100 text-indigo-900 border-indigo-300', icon: Shirt },
  stryde: { name: 'Stryde', badge: 'bg-cyan-100 text-cyan-900 border-cyan-300', icon: Footprints },
};

export const AdminProductsPage = () => {
  const { user, isAuthenticated, logout, loginAsAdmin } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);



  const isAuthorized = Boolean(isAuthenticated && (user?.is_staff || user?.is_superuser || user?.role === 'ADMIN' || user?.role === 'STAFF' || user?.email === 'admin@ronak.com' || user?.email === 'admin@ronaq.com'));

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (brandFilter !== 'ALL') params.brand = brandFilter.toLowerCase();
      if (statusFilter === 'ACTIVE') params.status = 'active';
      if (statusFilter === 'INACTIVE') params.status = 'inactive';
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const [prodRes, catRes, brandRes] = await Promise.all([
        catalogAPI.adminGetProducts(params),
        catalogAPI.getCategories(),
        catalogAPI.getBrands()
      ]);

      const prods = Array.isArray(prodRes.data) ? prodRes.data : prodRes.data.results || [];
      setProducts(prods);
      setCategories(Array.isArray(catRes.data) ? catRes.data : catRes.data.results || []);
      setBrands(Array.isArray(brandRes.data) ? brandRes.data : brandRes.data.results || []);
    } catch (err) {
      console.error('Error fetching admin products:', err);
      setError(err.response?.data?.detail || 'Failed to load catalog. Please verify staff permissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchProducts();
    }
  }, [isAuthorized, brandFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleOpenAddModal = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = async (product) => {
    try {
      // Fetch full product details including all variants and images
      const identifier = product.slug || product.id;
      const res = await catalogAPI.getProductBySlug(identifier);
      setProductToEdit(res.data);
    } catch (err) {
      console.warn('Could not fetch detail by slug, using list record:', err);
      setProductToEdit(product);
    }
    setIsModalOpen(true);
  };

  const handleProductSaved = (savedProduct) => {
    setSuccessMessage(`Product "${savedProduct.name}" saved successfully!`);
    setTimeout(() => setSuccessMessage(''), 4000);
    fetchProducts();
  };

  const handleOpenDeleteModal = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setDeleteLoading(true);
    try {
      const identifier = productToDelete.slug || productToDelete.id;
      await catalogAPI.adminDeleteProduct(identifier);
      setSuccessMessage(`Product "${productToDelete.name}" deleted successfully.`);
      setTimeout(() => setSuccessMessage(''), 4000);
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      alert(err.response?.data?.error || 'Failed to delete product.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleActive = async (product) => {
    try {
      const identifier = product.slug || product.id;
      await catalogAPI.adminPatchProduct(identifier, { is_active: !product.is_active });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_active: !p.is_active } : p));
      setSuccessMessage(`Product "${product.name}" status updated to ${!product.is_active ? 'Active' : 'Draft'}.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error toggling product status:', err);
      alert('Failed to update product status.');
    }
  };

  // KPIs
  const totalCount = products.length;
  const activeCount = products.filter(p => p.is_active).length;
  const lowStockCount = products.filter(p => (p.total_stock !== undefined ? p.total_stock : 10) <= 10).length;
  const veloraCount = products.filter(p => (p.brand_slug || '').toLowerCase() === 'velora').length;

  const handleQuickAdminLogin = async () => {
    setLoggingIn(true);
    try {
      await loginAsAdmin();
    } catch (err) {
      console.error('Quick admin login failed:', err);
      setIsAuthOpen(true);
    } finally {
      setLoggingIn(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center space-y-5">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-slate-900">Admin Catalog Access Restricted</h2>
        
        {isAuthenticated ? (
          <div className="space-y-4 max-w-md mx-auto">
            <p className="text-xs text-slate-500">
              You are currently signed in as <strong className="text-slate-800">{user?.email}</strong> (Customer Account). Only staff and administrator accounts have permission to create and manage products.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handleQuickAdminLogin}
                disabled={loggingIn}
                className="px-5 py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <Crown className="w-4 h-4" /> {loggingIn ? 'Authenticating...' : '⚡ 1-Click Admin Sign-In'}
              </button>
              <button
                onClick={() => { logout(); setIsAuthOpen(true); }}
                className="px-5 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              >
                <UserCheck className="w-4 h-4" /> Sign In with Credentials
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-5 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors"
              >
                <Home className="w-4 h-4" /> Home
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-md mx-auto">
            <p className="text-xs text-slate-500">
              You must be logged in with an administrator account to add products, modify specifications, and upload photos.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handleQuickAdminLogin}
                disabled={loggingIn}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Crown className="w-4 h-4" /> {loggingIn ? 'Authenticating...' : '⚡ 1-Click Admin Sign-In'}
              </button>
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-5 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-colors"
              >
                Sign In As Admin
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-5 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Back to Home Page
              </button>
            </div>
          </div>
        )}

        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-24">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
                Ronak Administration
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">Catalog & Inventory Control</span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-white">Product Management Portal</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchProducts}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-2 border border-white/10 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Catalog
            </button>

            <button
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-amber-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add New Product
            </button>

            <button
              onClick={() => setIsCityModalOpen(true)}
              className="px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-amber-500/30 transition-colors cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5" /> Delivery Cities
            </button>

            <Link
              to="/admin/reviews"
              className="px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-amber-500/30 transition-colors cursor-pointer"
            >
              <Star className="w-3.5 h-3.5" /> Customer Reviews
            </Link>


            <Link
              to="/admin/orders"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" /> Orders Portal
            </Link>



            <a
              href="http://127.0.0.1:8000/admin/catalog/product/"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              Django Admin <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-900 flex items-center gap-3 animate-fade-in shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Products</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-serif font-black text-slate-900">{totalCount}</span>
              <span className="p-2 rounded-xl bg-slate-100 text-slate-700"><Package className="w-4 h-4" /></span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Active & Published</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-serif font-black text-emerald-700">{activeCount}</span>
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600"><CheckCircle2 className="w-4 h-4" /></span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Low Stock Items</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-serif font-black text-amber-700">{lowStockCount}</span>
              <span className="p-2 rounded-xl bg-amber-50 text-amber-600"><TrendingDown className="w-4 h-4" /></span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">Velora Cosmetics</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-serif font-black text-indigo-700">{veloraCount}</span>
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600"><Sparkle className="w-4 h-4" /></span>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Brand Tabs */}
          <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
            {['ALL', 'VELORA', 'ELAN', 'STRYDE'].map((b) => (
              <button
                key={b}
                onClick={() => setBrandFilter(b)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                  brandFilter === b
                    ? 'bg-slate-900 text-amber-300 shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {b}
              </button>
            ))}

            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block self-center" />

            {['ALL', 'ACTIVE', 'INACTIVE'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {st === 'ALL' ? 'All Status' : st}
              </button>
            ))}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-80">
            <div className="relative flex-grow">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search product, SKU, tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-amber-700 transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-500">Loading catalog items...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <div>
                <h3 className="font-serif font-bold text-base text-slate-700">No products found</h3>
                <p className="text-xs text-slate-400 mt-1">Try clearing search or filters, or add a brand new product.</p>
              </div>
              <button
                onClick={handleOpenAddModal}
                className="px-5 py-2.5 bg-amber-600 text-white font-bold text-xs rounded-full hover:bg-amber-700 transition-colors"
              >
                + Add Your First Product
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    <th className="py-4 px-6">Product & Image</th>
                    <th className="py-4 px-6">Brand / Label</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Price</th>
                    <th className="py-4 px-6">Stock Status</th>
                    <th className="py-4 px-6">Catalog Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((product) => {
                    const bSlug = (product.brand_slug || '').toLowerCase();
                    const brandMeta = BRAND_CONFIG[bSlug] || BRAND_CONFIG.velora;
                    const BrandIcon = brandMeta.icon;
                    const primaryImg = product.primary_image || product.image || '';
                    const totalStock = product.total_stock !== undefined ? product.total_stock : 50;

                    return (
                      <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Product Thumbnail & Title */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3.5">
                            <div className="w-14 h-14 rounded-xl border border-slate-200 overflow-hidden shrink-0 shadow-xs bg-slate-100">
                              {primaryImg || (product.images && product.images.length > 0) ? (
                                <HoverImageSlideshow
                                  images={product.images}
                                  primaryImage={primaryImg}
                                  alt={product.name}
                                  aspectRatio="w-14 h-14"
                                  showDots={false}
                                  intervalMs={1000}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                  <Package className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 text-sm truncate max-w-xs">{product.name}</p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                <span className="font-mono font-bold text-slate-600">{product.sku}</span>

                                {product.is_bestseller && (
                                  <span className="text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 font-bold">
                                    ⭐ Best Seller
                                  </span>
                                )}
                                {product.is_new_arrival && (
                                  <span className="text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200 font-bold">
                                    ✨ New
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Brand */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 w-fit ${brandMeta.badge}`}>
                            <BrandIcon className="w-3 h-3" />
                            <span>{product.brand_name || product.brand || 'Velora'}</span>
                          </span>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-6 whitespace-nowrap text-slate-700 font-medium">
                          {product.category_name || product.category || 'General'}
                        </td>

                        {/* Price */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-serif font-black text-sm text-slate-900">
                              Rs. {Number(product.base_price || product.price || 0).toLocaleString()}
                            </span>
                            {product.discount_price && (
                              <span className="text-[10px] text-slate-400 line-through">
                                Rs. {Number(product.discount_price).toLocaleString()}
                              </span>
                            )}
                          </div>
                          {product.discount_badge && (
                            <span className="text-[9px] font-bold text-amber-700 uppercase block">
                              {product.discount_badge}
                            </span>
                          )}
                        </td>

                        {/* Stock */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              totalStock <= 0 ? 'bg-rose-500' : totalStock <= 10 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`} />
                            <span className="font-bold text-slate-800">
                              {totalStock} in stock
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            {product.variants_count || 1} {product.variants_count === 1 ? 'variant' : 'variants'}
                          </span>
                        </td>

                        {/* Active Toggle */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleActive(product)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                              product.is_active
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : 'bg-slate-100 text-slate-600 border border-slate-300'
                            }`}
                            title="Click to toggle publish status"
                          >
                            {product.is_active ? '✓ Published' : 'Draft (Hidden)'}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              to={`/product/${product.slug || product.id}`}
                              target="_blank"
                              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                              title="View on Storefront"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            <button
                              onClick={() => handleOpenEditModal(product)}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                              title="Edit Product Details & Photos"
                            >
                              <Edit className="w-3.5 h-3.5" /> Edit
                            </button>

                            <button
                              onClick={() => handleOpenDeleteModal(product)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Product Add / Edit Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={handleProductSaved}
        onCategoryAdded={(newCat) => setCategories(prev => [newCat, ...prev])}
        productToEdit={productToEdit}
        categories={categories}
        brands={brands}
      />


      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        product={productToDelete}
        loading={deleteLoading}
      />

      {/* Delivery Available Cities Manager Modal */}
      <CityManagementModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
      />

      {/* Customer Reviews Management Modal */}
      <ReviewManagementModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onUpdated={fetchProducts}
      />
    </div>

  );
};

