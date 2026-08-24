import React, { useState, useEffect } from 'react';
import { reviewsAPI, catalogAPI } from '../../services/api';
import {
  X,
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
  User
} from 'lucide-react';

export const ReviewManagementModal = ({ isOpen, onClose, onUpdated }) => {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add / Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [submittingForm, setSubmittingForm] = useState(false);

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

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchAdminReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await reviewsAPI.adminGetReviews();
      setReviews(res.data.results || res.data || []);
    } catch (err) {
      console.error('Error fetching admin reviews:', err);
      setError('Failed to load reviews. Please verify admin authentication.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await catalogAPI.getProducts();
      setProducts(res.data.results || res.data || []);
    } catch (err) {
      console.error('Error fetching products for review dropdown:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAdminReviews();
      fetchProducts();
      setShowFormModal(false);
      setShowDeleteConfirm(false);
    }
  }, [isOpen]);

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
    setShowFormModal(true);
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
    setShowFormModal(true);
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
        setSuccess('Review updated successfully!');
      } else {
        await reviewsAPI.adminCreateReview(payload);
        setSuccess('New review added successfully!');
      }

      setTimeout(() => setSuccess(''), 3000);
      setShowFormModal(false);
      fetchAdminReviews();
      if (onUpdated) onUpdated();
    } catch (err) {
      console.error('Error saving review:', err);
      setError(err.response?.data?.error || 'Failed to save review. Please check inputs.');
    } finally {
      setSubmittingForm(false);
    }
  };

  const handleTogglePublish = async (review) => {
    try {
      await reviewsAPI.adminTogglePublish(review.id);
      fetchAdminReviews();
      if (onUpdated) onUpdated();
    } catch (err) {
      console.error('Failed to toggle review status:', err);
      setError('Failed to update review visibility.');
    }
  };

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);
    try {
      await reviewsAPI.adminDeleteReview(deletingId);
      setSuccess('Review deleted successfully.');
      setTimeout(() => setSuccess(''), 3000);
      setShowDeleteConfirm(false);
      setDeletingId(null);
      fetchAdminReviews();
      if (onUpdated) onUpdated();
    } catch (err) {
      console.error('Error deleting review:', err);
      setError('Failed to delete review.');
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen) return null;

  const filteredReviews = reviews.filter(r => {
    const matchesSearch = (r.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.comment || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.product_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterRating === '5') return matchesSearch && r.rating === 5;
    if (filterRating === '4') return matchesSearch && r.rating === 4;
    if (filterRating === 'published') return matchesSearch && r.is_published;
    if (filterRating === 'hidden') return matchesSearch && !r.is_published;
    return matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] my-auto">
        
        {/* MODAL HEADER */}
        <div className="p-5 sm:p-6 bg-slate-950 text-white border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md">
              ★
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                Reviews & Ratings Management
              </h3>
              <p className="text-xs text-slate-400">
                Add, edit, delete, and control verified reviews shown on the website
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Review
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ALERTS */}
        {success && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-2xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* FILTER & SEARCH TOOLBAR */}
        <div className="p-4 sm:px-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customer, comment, product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {[
              { id: 'all', label: `All (${reviews.length})` },
              { id: '5', label: '⭐ 5 Stars' },
              { id: '4', label: '⭐ 4 Stars' },
              { id: 'published', label: 'Published' },
              { id: 'hidden', label: 'Hidden' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterRating(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  filterRating === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}

            <button
              onClick={fetchAdminReviews}
              className="p-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
              title="Refresh Reviews"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* REVIEWS TABLE / LIST */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="py-20 text-center text-slate-400 space-y-2">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-600" />
              <p className="text-xs font-bold">Loading reviews from database...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="py-20 text-center text-slate-400 space-y-3">
              <MessageSquare className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-700">No reviews found</p>
              <p className="text-xs text-slate-500">Click "+ Add Review" above to create a new customer review.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 uppercase font-black text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Rating</th>
                    <th className="py-3.5 px-4">Review Content</th>
                    <th className="py-3.5 px-4">Associated Product</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReviews.map((rev) => (
                    <tr key={rev.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Customer Info */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-xs">
                            {(rev.customer_name || 'V')[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{rev.customer_name || rev.display_name}</p>
                            <span className="text-[10px] text-slate-400">{rev.customer_location || 'Pakistan'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Rating Stars */}
                      <td className="py-4 px-4 whitespace-nowrap">
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

                      {/* Comment */}
                      <td className="py-4 px-4 min-w-[220px]">
                        <p className="text-slate-800 line-clamp-2 italic">"{rev.comment}"</p>
                        {rev.is_verified_purchase && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 mt-1">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Verified Purchase
                          </span>
                        )}
                      </td>

                      {/* Associated Product */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {rev.product_name && rev.product_name !== 'Store / General Brand' ? (
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold text-[11px] border border-slate-200 block truncate max-w-[160px]">
                            {rev.product_name}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">General Brand Review</span>
                        )}
                      </td>

                      {/* Published Status Toggle */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(rev)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 mx-auto transition-colors cursor-pointer ${
                            rev.is_published
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                          }`}
                          title="Click to toggle publish status"
                        >
                          {rev.is_published ? <Eye className="w-3 h-3 text-emerald-600" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
                          <span>{rev.is_published ? 'Published' : 'Hidden'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(rev)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Review"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(rev.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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

        {/* MODAL FOOTER */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Total: <strong>{reviews.length}</strong> reviews ({reviews.filter(r => r.is_published).length} live on website)</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* SUB-MODAL: ADD / EDIT REVIEW */}
      {showFormModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="p-5 bg-slate-950 text-white flex items-center justify-between">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{isEditing ? 'Edit Customer Review' : 'Add New Customer Review'}</span>
              </h4>
              <button
                onClick={() => setShowFormModal(false)}
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

              {/* Customer Name & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Ayesha Khan"
                    value={formData.customer_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City / Location</label>
                  <input
                    type="text"
                    placeholder="e.g., Lahore, Pakistan"
                    value={formData.customer_location}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_location: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Associated Product */}
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

              {/* Review Comment Text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Review Feedback Comment *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter genuine customer feedback text..."
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
                  <span className="font-bold text-slate-800">Verified Buyer Badge</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <span className="font-bold text-slate-800">Publish Immediately</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingForm}
                  className="px-5 py-2 bg-slate-950 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  {submittingForm ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{isEditing ? 'Update Review' : 'Save & Publish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL: DELETE CONFIRMATION */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in">
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
                onClick={() => setShowDeleteConfirm(false)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
