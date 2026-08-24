import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reviewsAPI, catalogAPI } from '../services/api';
import { CityManagementModal } from '../components/admin/CityManagementModal';
import { AuthModal } from '../components/common/AuthModal';
import {
  Star,
  Plus,
  Edit,
  Trash2,
  Check,
  Eye,
  EyeOff,
  Search,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Package,
  ShoppingBag,
  MapPin,
  ExternalLink,
  Crown,
  User,
  X,
  TrendingUp,
  SlidersHorizontal,
  ArrowLeft
} from 'lucide-react';

export const AdminReviewsPage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [submittingForm, setSubmittingForm] = useState(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_location: 'Lahore, Pakistan',
    rating: 5,
    comment: '',
    product_id: '',
    is_verified_purchase: true,
    is_published: true,
    is_featured: true
  });

  const isAuthorized = isAuthenticated && (user?.is_staff || user?.is_superuser || user?.role === 'ADMIN' || user?.role === 'STAFF');

  const fetchReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await reviewsAPI.adminGetReviews();
      const items = Array.isArray(res.data) ? res.data : res.data.results || [];
      setReviews(items);
    } catch (err) {
      console.error('Error fetching admin reviews:', err);
      setError(err.response?.data?.detail || 'Failed to load reviews. Please verify staff permissions.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await catalogAPI.getProducts();
      setProducts(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
      console.error('Error fetching products list:', err);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchReviews();
      fetchProducts();
    }
  }, [isAuthorized]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingReviewId(null);
    setFormData({
      customer_name: '',
      customer_location: 'Lahore, Pakistan',
      rating: 5,
      comment: '',
      product_id: '',
      is_verified_purchase: true,
      is_published: true,
      is_featured: true
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (review) => {
    setIsEditing(true);
    setEditingReviewId(review.id);
    setFormData({
      customer_name: review.customer_name || review.display_name || '',
      customer_location: review.customer_location || 'Pakistan',
      rating: review.rating || 5,
      comment: review.comment || '',
      product_id: review.product || (review.product_id || ''),
      is_verified_purchase: review.is_verified_purchase !== undefined ? review.is_verified_purchase : true,
      is_published: review.is_published !== undefined ? review.is_published : true,
      is_featured: review.is_featured !== undefined ? review.is_featured : true
    });
    setIsFormModalOpen(true);
  };

  const handleSaveReview = async (e) => {
    e.preventDefault();
    if (!formData.customer_name.trim() || !formData.comment.trim()) {
      setError('Customer name and review comment are required.');
      return;
    }

    setSubmittingForm(true);
    setError('');

    try {
      const payload = {
        customer_name: formData.customer_name.trim(),
        customer_location: formData.customer_location.trim(),
        rating: parseInt(formData.rating),
        comment: formData.comment.trim(),
        product_id: formData.product_id || null,
        is_verified_purchase: formData.is_verified_purchase,
        is_published: formData.is_published,
        is_featured: formData.is_featured
      };

      if (isEditing && editingReviewId) {
        await reviewsAPI.adminUpdateReview(editingReviewId, payload);
        setSuccessMessage('Review updated successfully!');
      } else {
        await reviewsAPI.adminCreateReview(payload);
        setSuccessMessage('New customer review added successfully!');
      }

      setIsFormModalOpen(false);
      fetchReviews();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Error saving review:', err);
      setError(err.response?.data?.error || err.response?.data?.detail || 'Failed to save review.');
    } finally {
      setSubmittingForm(false);
    }
  };

  const handleTogglePublish = async (review) => {
    try {
      await reviewsAPI.adminTogglePublish(review.id);
      fetchReviews();
      setSuccessMessage(`Review ${review.is_published ? 'hidden' : 'published'} successfully.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to toggle review status:', err);
      setError('Failed to update review visibility.');
    }
  };

  const handleDeleteClick = (id) => {
    setDeletingReviewId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingReviewId) return;
    setDeleteLoading(true);
    try {
      await reviewsAPI.adminDeleteReview(deletingReviewId);
      setSuccessMessage('Review deleted successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
      setIsDeleteModalOpen(false);
      setDeletingReviewId(null);
      fetchReviews();
    } catch (err) {
      console.error('Error deleting review:', err);
      setError('Failed to delete review.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filter and search computation
  const filteredReviews = reviews.filter(r => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term ||
      (r.customer_name || '').toLowerCase().includes(term) ||
      (r.comment || '').toLowerCase().includes(term) ||
      (r.product_name || '').toLowerCase().includes(term) ||
      (r.customer_location || '').toLowerCase().includes(term);

    const matchesRating = ratingFilter === 'ALL' || r.rating === parseInt(ratingFilter);
    const matchesStatus = statusFilter === 'ALL' ||
      (statusFilter === 'PUBLISHED' && r.is_published) ||
      (statusFilter === 'HIDDEN' && !r.is_published);

    return matchesSearch && matchesRating && matchesStatus;
  });

  // Calculate statistics
  const totalReviewsCount = reviews.length;
  const publishedCount = reviews.filter(r => r.is_published).length;
  const fiveStarCount = reviews.filter(r => r.rating === 5).length;
  const avgScore = totalReviewsCount > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / totalReviewsCount).toFixed(1)
    : '5.0';

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-950 border border-slate-800 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
            <Crown className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold font-serif text-white">Staff / Admin Access Required</h2>
            <p className="text-xs text-slate-400">
              Please sign in with your staff account (<code>admin@ronaq.com</code>) to manage customer reviews.
            </p>
          </div>
          <button
            onClick={() => setIsAuthOpen(true)}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-colors shadow-lg cursor-pointer"
          >
            Sign In As Admin
          </button>
        </div>
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-24">
      {/* HEADER BANNER */}
      <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
                Ronaq Administration
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">Customer Feedback & Social Proof</span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-white">Reviews & Ratings Management</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchReviews}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-2 border border-white/10 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Reviews
            </button>

            <button
              onClick={handleOpenAdd}
              className="px-5 py-2.5 bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-amber-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add New Review
            </button>

            <Link
              to="/admin/products"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Package className="w-3.5 h-3.5 text-amber-400" /> Products
            </Link>

            <Link
              to="/admin/orders"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" /> Orders
            </Link>

            <button
              onClick={() => setIsCityModalOpen(true)}
              className="px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-amber-500/30 transition-colors cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5" /> Delivery Cities
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ALERTS */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-900 flex items-center gap-3 animate-fade-in shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-xs font-bold text-rose-900 flex items-center gap-3 animate-fade-in shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-xl border border-amber-200">
              ★
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Avg Store Rating</span>
              <span className="text-2xl font-serif font-black text-slate-900">{avgScore} / 5.0</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black border border-indigo-200">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Reviews</span>
              <span className="text-2xl font-serif font-black text-slate-900">{totalReviewsCount}</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black border border-emerald-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Live on Store</span>
              <span className="text-2xl font-serif font-black text-emerald-700">{publishedCount}</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black border border-amber-200">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">5-Star Ratings</span>
              <span className="text-2xl font-serif font-black text-amber-600">{fiveStarCount}</span>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customer, comment, product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-slate-50/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-bold text-slate-400 uppercase mr-1">Rating:</span>
            {['ALL', '5', '4'].map(r => (
              <button
                key={r}
                onClick={() => setRatingFilter(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  ratingFilter === r
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r === 'ALL' ? 'All Ratings' : `⭐ ${r} Stars`}
              </button>
            ))}

            <span className="text-xs font-bold text-slate-400 uppercase ml-2 mr-1">Status:</span>
            {['ALL', 'PUBLISHED', 'HIDDEN'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  statusFilter === s
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s === 'ALL' ? 'All Status' : s === 'PUBLISHED' ? 'Published' : 'Hidden'}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN REVIEWS TABLE */}
        <div className="rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-24 text-center text-slate-400 space-y-2">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-600" />
              <p className="text-xs font-bold">Loading reviews from database...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="py-24 text-center text-slate-400 space-y-3">
              <MessageSquare className="w-12 h-12 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-700">No reviews found matching your search</p>
              <button
                onClick={handleOpenAdd}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-amber-600 transition-colors"
              >
                + Add Customer Review
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 uppercase font-black text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-4 px-6">Customer</th>
                    <th className="py-4 px-6">Rating</th>
                    <th className="py-4 px-6">Review Content</th>
                    <th className="py-4 px-6">Attached Product</th>
                    <th className="py-4 px-6 text-center">Store Visibility</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReviews.map((rev) => (
                    <tr key={rev.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Customer Info */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-xs border border-amber-200">
                            {(rev.customer_name || 'V')[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{rev.customer_name || rev.display_name}</p>
                            <span className="text-[10px] text-slate-400">{rev.customer_location || 'Pakistan'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Rating Stars */}
                      <td className="py-4 px-6 whitespace-nowrap">
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
                          <span className="font-mono font-bold text-slate-700 text-xs ml-1">({rev.rating || 5}.0)</span>
                        </div>
                      </td>

                      {/* Review Comment */}
                      <td className="py-4 px-6 min-w-[280px]">
                        <p className="text-slate-800 leading-relaxed font-normal italic">"{rev.comment}"</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          {rev.is_verified_purchase && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Verified Purchase
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400">
                            {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : ''}
                          </span>
                        </div>
                      </td>

                      {/* Attached Product */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        {rev.product_name && rev.product_name !== 'Store / General Brand' ? (
                          <div className="flex items-center gap-2">
                            {rev.product_image && (
                              <img src={rev.product_image} alt="" className="w-7 h-7 rounded-lg object-cover border border-slate-200 shrink-0" />
                            )}
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold text-[11px] border border-slate-200 truncate max-w-[170px] block">
                              {rev.product_name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-medium text-xs">General Brand Review</span>
                        )}
                      </td>

                      {/* Published Toggle */}
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(rev)}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 mx-auto transition-colors cursor-pointer ${
                            rev.is_published
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 shadow-xs'
                              : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                          }`}
                          title="Click to toggle store visibility"
                        >
                          {rev.is_published ? <Eye className="w-3 h-3 text-emerald-600" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
                          <span>{rev.is_published ? 'Published' : 'Hidden'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(rev)}
                            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                            title="Edit Review"
                          >
                            <Edit className="w-3.5 h-3.5 text-amber-700" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(rev.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title="Delete Review"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* ADD / EDIT REVIEW MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-scale-up">
            <div className="p-5 bg-slate-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-sm">
                  {isEditing ? 'Edit Customer Review' : 'Add New Customer Review'}
                </h4>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="p-6 space-y-4">
              {/* Rating Selector */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
                    Rating Stars *
                  </label>
                  <span className="text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                    {formData.rating === 5 ? '⭐⭐⭐⭐⭐ 5.0 Stars (Exceptional)' :
                     formData.rating === 4 ? '⭐⭐⭐⭐ 4.0 Stars (Very Good)' :
                     formData.rating === 3 ? '⭐⭐⭐ 3.0 Stars (Good)' :
                     formData.rating === 2 ? '⭐⭐ 2.0 Stars (Fair)' : '⭐ 1.0 Star (Poor)'}
                  </span>
                </div>
                <div className="flex items-center gap-1 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                      className="p-1 rounded-lg transition-transform hover:scale-125 focus:outline-none cursor-pointer group"
                      title={`Set ${star} Star${star > 1 ? 's' : ''}`}
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          formData.rating >= star
                            ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                            : 'text-slate-300 fill-slate-100 group-hover:text-amber-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ayesha Khan"
                    value={formData.customer_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Lahore, Pakistan"
                    value={formData.customer_location}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_location: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Product selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Associated Product (Optional)</label>
                <select
                  value={formData.product_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, product_id: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                >
                  <option value="">-- General Store / Brand Review --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.brand_name || p.brand || 'Velora'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Comment text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Review Feedback Comment *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter genuine customer review feedback..."
                  value={formData.comment}
                  onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={formData.is_verified_purchase}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_verified_purchase: e.target.checked }))}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <span className="font-bold text-slate-800">Verified Buyer</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <span className="font-bold text-slate-800">Publish to Store</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingForm}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  {submittingForm ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{isEditing ? 'Update Review' : 'Save & Publish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-sm">Delete Review?</h4>
              <p className="text-xs text-slate-500">Are you sure you want to permanently delete this customer review?</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleConfirmDelete}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md"
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Cities Manager Modal */}
      <CityManagementModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
      />
    </div>
  );
};
