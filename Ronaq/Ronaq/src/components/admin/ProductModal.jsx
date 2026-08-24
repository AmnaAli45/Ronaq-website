import React, { useState, useEffect, useRef } from 'react';
import { catalogAPI } from '../../services/api';
import {
  X,
  Upload,
  Image as ImageIcon,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Sparkles,
  Layers,
  Boxes,
  Tag,
  Star,
  CheckCircle2,
  Crown,
  Loader2,
  Eye,
  Camera,
  RefreshCw,
  Link as LinkIcon
} from 'lucide-react';



const BRANDS = [
  { id: 1, name: 'Velora', slug: 'velora', theme: 'border-amber-500 bg-amber-50 text-amber-900', badge: 'bg-amber-100 text-amber-900 border-amber-300' },
  { id: 2, name: 'Elan', slug: 'elan', theme: 'border-indigo-500 bg-indigo-50 text-indigo-900', badge: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
  { id: 3, name: 'Stryde', slug: 'stryde', theme: 'border-cyan-500 bg-cyan-50 text-cyan-900', badge: 'bg-cyan-100 text-cyan-900 border-cyan-300' },
];

export const ProductModal = ({ isOpen, onClose, onSaved, onCategoryAdded, productToEdit = null, categories = [], brands = [] }) => {

  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    brand_id: 1,
    category_id: '',
    base_price: '',
    discount_price: '',
    discount_badge: '',
    sku: '',
    is_bestseller: false,
    is_new_arrival: false,
    is_active: true,
    description: '',
    features: [''],
    ingredients: '',
    how_to_use: '',
    variants: [
      { id: null, size_or_shade: 'Standard', color: '', sku: '', stock_quantity: 50, price_override: '', is_active: true }
    ],
    images: []
  });

  const [internalCategories, setInternalCategories] = useState(categories);

  useEffect(() => {
    if (categories && categories.length > 0) {
      setInternalCategories(categories);
    } else if (isOpen) {
      catalogAPI.getCategories().then(res => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        setInternalCategories(list);
      }).catch(err => console.warn('Failed to load categories in ProductModal:', err));
    }
  }, [categories, isOpen]);

  // URL Image input state
  const [newImageUrl, setNewImageUrl] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);

  const fileInputRef = useRef(null);
  const slotInputRef0 = useRef(null);
  const slotInputRef1 = useRef(null);
  const slotInputRef2 = useRef(null);



  // Populate data when editing
  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || '',
        slug: productToEdit.slug || '',
        brand_id: productToEdit.brand_id || (productToEdit.brand_slug === 'elan' ? 2 : productToEdit.brand_slug === 'stryde' ? 3 : 1),
        category_id: productToEdit.category_id || productToEdit.category || '',
        base_price: productToEdit.base_price || productToEdit.price || '',
        discount_price: productToEdit.discount_price || '',
        discount_badge: productToEdit.discount_badge || '',
        sku: productToEdit.sku || '',
        is_bestseller: !!productToEdit.is_bestseller,
        is_new_arrival: !!productToEdit.is_new_arrival,
        is_active: productToEdit.is_active !== undefined ? productToEdit.is_active : true,
        description: productToEdit.description || '',
        features: Array.isArray(productToEdit.features) && productToEdit.features.length > 0 ? productToEdit.features : [''],
        ingredients: productToEdit.ingredients || '',
        how_to_use: productToEdit.how_to_use || '',
        variants: Array.isArray(productToEdit.variants) && productToEdit.variants.length > 0
          ? productToEdit.variants.map(v => ({
              id: v.id,
              size_or_shade: v.size_or_shade || 'Standard',
              color: v.color || '',
              sku: v.sku || '',
              stock_quantity: v.stock_quantity !== undefined ? v.stock_quantity : 50,
              price_override: v.price_override || '',
              is_active: v.is_active !== undefined ? v.is_active : true
            }))
          : [{ id: null, size_or_shade: 'Standard', color: '', sku: '', stock_quantity: 50, price_override: '', is_active: true }],
        images: Array.isArray(productToEdit.images) && productToEdit.images.length > 0
          ? productToEdit.images.map((img, idx) => ({
              id: img.id,
              image_url: img.image_url,
              is_primary: img.is_primary !== undefined ? img.is_primary : idx === 0,
              display_order: img.display_order || idx
            }))
          : productToEdit.image || productToEdit.primary_image
            ? [{ id: null, image_url: productToEdit.image || productToEdit.primary_image, is_primary: true, display_order: 0 }]
            : []
      });
    } else {
      // Default new product
      setFormData({
        name: '',
        slug: '',
        brand_id: 1,
        category_id: categories.length > 0 ? categories[0].id : '',
        base_price: '',
        discount_price: '',
        discount_badge: '',
        sku: '',
        is_bestseller: false,
        is_new_arrival: true,
        is_active: true,
        description: '',
        features: ['100% Authentic Luxury Formulation', 'Premium Eco-Friendly Packaging', 'Dermatologist & Quality Tested'],
        ingredients: '',
        how_to_use: '',
        variants: [
          { id: null, size_or_shade: 'Standard', color: '', sku: '', stock_quantity: 50, price_override: '', is_active: true }
        ],
        images: []
      });
    }
    setError('');
    setSuccess('');
    setActiveTab('basic');
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  // Handle Photo File Upload
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setError('');

    try {
      for (const file of files) {
        const uploadData = new FormData();
        uploadData.append('image', file);

        if (productToEdit?.id) {
          uploadData.append('product_id', productToEdit.id);
        }

        const res = await catalogAPI.adminUploadImage(uploadData);
        const newUrl = res.data.image_url;

        setFormData(prev => {
          const isFirst = prev.images.length === 0;
          return {
            ...prev,
            images: [
              ...prev.images,
              {
                id: res.data.image_object?.id || null,
                image_url: newUrl,
                is_primary: isFirst,
                display_order: prev.images.length
              }
            ]
          };
        });
      }
      setSuccess('Photo(s) uploaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Image upload failed:', err);
      setError(err.response?.data?.error || 'Failed to upload photo. Please verify image format & size (<10MB).');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Dedicated Slot Upload Handler for 3-Angle Photos (Angles 1, 2, 3)
  const handleSlotFileUpload = async (slotIndex, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError('');

    try {
      const uploadData = new FormData();
      uploadData.append('image', file);

      if (productToEdit?.id) {
        uploadData.append('product_id', productToEdit.id);
      }

      const res = await catalogAPI.adminUploadImage(uploadData);
      const newUrl = res.data.image_url;

      setFormData(prev => {
        const updated = [...(prev.images || [])];
        const newImgObj = {
          id: res.data.image_object?.id || null,
          image_url: newUrl,
          is_primary: slotIndex === 0,
          display_order: slotIndex
        };

        if (slotIndex < updated.length) {
          updated[slotIndex] = newImgObj;
        } else {
          updated.push(newImgObj);
        }

        if (updated.length > 0 && !updated.some(img => img.is_primary)) {
          updated[0].is_primary = true;
        }

        return { ...prev, images: updated };
      });

      setSuccess(`Angle ${slotIndex + 1} photo uploaded successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Slot photo upload failed:', err);
      setError(err.response?.data?.error || 'Failed to upload angle photo.');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };


  // Add Image by URL
  const handleAddImageUrl = (e) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;

    const isFirst = formData.images.length === 0;
    setFormData(prev => ({
      ...prev,
      images: [
        ...prev.images,
        {
          id: null,
          image_url: newImageUrl.trim(),
          is_primary: isFirst,
          display_order: prev.images.length
        }
      ]
    }));
    setNewImageUrl('');
  };

  // Set Primary Image
  const handleSetPrimaryImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, idx) => ({
        ...img,
        is_primary: idx === index
      }))
    }));
  };

  // Remove Image
  const handleRemoveImage = (index) => {
    setFormData(prev => {
      const remaining = prev.images.filter((_, idx) => idx !== index);
      // If we removed the primary, assign the first remaining as primary
      if (remaining.length > 0 && !remaining.some(img => img.is_primary)) {
        remaining[0].is_primary = true;
      }
      return { ...prev, images: remaining };
    });
  };

  // Feature Bullet Handlers
  const handleFeatureChange = (index, value) => {
    const updated = [...formData.features];
    updated[index] = value;
    setFormData(prev => ({ ...prev, features: updated }));
  };

  const handleAddFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
  };

  const handleRemoveFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, idx) => idx !== index)
    }));
  };

  // Variant Handlers
  const handleVariantChange = (index, field, value) => {
    const updated = [...formData.variants];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, variants: updated }));
  };

  const handleAddVariant = () => {
    const brandPrefix = (formData.brand_id === 2 ? 'ELN' : formData.brand_id === 3 ? 'STY' : 'VEL');
    const autoSku = formData.sku ? `${formData.sku}-V${formData.variants.length + 1}` : `${brandPrefix}-${Date.now().toString().slice(-4)}`;
    setFormData(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          id: null,
          size_or_shade: '',
          color: '',
          sku: autoSku,
          stock_quantity: 50,
          price_override: '',
          is_active: true
        }
      ]
    }));
  };

  const handleRemoveVariant = (index) => {
    if (formData.variants.length <= 1) {
      alert('A product must have at least one variant.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, idx) => idx !== index)
    }));
  };

  // Create Category Inline
  const handleCreateCategory = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!newCategoryName.trim()) {
      setError('Please enter a category name.');
      return;
    }

    setCreatingCategory(true);
    setError('');
    try {
      const res = await catalogAPI.adminCreateCategory({
        name: newCategoryName.trim(),
        brand_id: formData.brand_id
      });
      const newCat = res.data?.category || res.data;
      if (newCat && newCat.id) {
        setInternalCategories(prev => {
          const list = Array.isArray(prev) ? [...prev] : [];
          const exists = list.some(c => c.id === newCat.id);
          return exists ? list : [...list, newCat];
        });
        setFormData(prev => ({ ...prev, category_id: newCat.id }));
        onCategoryAdded?.(newCat);
        setShowNewCategoryInput(false);
        setNewCategoryName('');
        setSuccess(`Category "${newCat.name}" created and selected!`);
        setTimeout(() => setSuccess(''), 4000);

      } else {
        throw new Error('Invalid server response');
      }
    } catch (err) {
      console.error('Failed to create category:', err);
      setError(err.response?.data?.error || err.response?.data?.detail || 'Failed to create category.');
    } finally {
      setCreatingCategory(false);
    }
  };


  // Submit Product Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.name.trim()) {
      setError('Product Name is required.');
      setActiveTab('basic');
      return;
    }

    if (!formData.base_price || parseFloat(formData.base_price) <= 0) {
      setError('Valid Base Price is required.');
      setActiveTab('basic');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug ? formData.slug.trim() : undefined,
        brand_id: parseInt(formData.brand_id),
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        base_price: parseFloat(formData.base_price),
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        discount_badge: formData.discount_badge.trim(),
        sku: formData.sku ? formData.sku.trim() : undefined,
        is_bestseller: formData.is_bestseller,
        is_new_arrival: formData.is_new_arrival,
        is_active: formData.is_active,
        description: formData.description,
        features: formData.features.filter(f => f && f.trim().length > 0),
        ingredients: formData.ingredients,
        how_to_use: formData.how_to_use,
        variants: formData.variants.map((v, i) => ({
          id: v.id || undefined,
          size_or_shade: v.size_or_shade.trim() || 'Standard',
          color: v.color.trim(),
          sku: v.sku.trim() || `${formData.sku || 'PROD'}-V${i+1}`,
          stock_quantity: parseInt(v.stock_quantity) || 0,
          price_override: v.price_override ? parseFloat(v.price_override) : null,
          is_active: v.is_active
        })),
        images: formData.images.map((img, i) => ({
          id: img.id || undefined,
          image_url: img.image_url,
          is_primary: img.is_primary,
          display_order: i
        }))
      };

      let res;
      if (productToEdit) {
        const identifier = productToEdit.id || productToEdit.slug;
        res = await catalogAPI.adminUpdateProduct(identifier, payload);
      } else {
        res = await catalogAPI.adminCreateProduct(payload);
      }

      onSaved(res.data.product || res.data);
      onClose();
    } catch (err) {
      console.error('Error saving product:', err);
      const serverErr = err.response?.data;
      if (typeof serverErr === 'object') {
        const msg = Object.entries(serverErr)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join(' | ');
        setError(msg || 'Failed to save product.');
      } else {
        setError(err.response?.data?.error || 'Failed to save product.');
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedBrand = BRANDS.find(b => b.id === parseInt(formData.brand_id)) || BRANDS[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-fade-in overflow-y-auto">

      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white flex items-center justify-between border-b border-amber-500/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                {productToEdit ? 'Edit Luxury Product' : 'Add New Luxury Product'}
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white leading-tight truncate max-w-md">
                {productToEdit ? productToEdit.name : 'Create New Catalog Item'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 gap-2 sm:gap-4 overflow-x-auto no-scrollbar shrink-0">
          {[
            { id: 'basic', label: '1. Basic Info & Pricing', icon: Tag },
            { id: 'details', label: '2. Details & Formula', icon: Layers },
            { id: 'photos', label: `3. Photos & Gallery (${formData.images.length})`, icon: ImageIcon },
            { id: 'variants', label: `4. Variants & Stock (${formData.variants.length})`, icon: Boxes },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 px-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-amber-600 text-amber-800 font-black'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>


        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
          
          {/* Alerts */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-900 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* TAB 1: BASIC INFORMATION */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Luminous Velvet Hydrating Serum"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-medium"
                />
              </div>

              {/* Brand Selector */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                  Select Brand / Label *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {BRANDS.map(brand => (
                    <button
                      key={brand.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, brand_id: brand.id }))}
                      className={`p-3.5 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                        parseInt(formData.brand_id) === brand.id
                          ? brand.theme + ' shadow-sm font-black'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span className="text-sm block font-serif font-bold">{brand.name}</span>
                      <span className="text-[10px] opacity-75 uppercase tracking-wider">
                        {brand.slug === 'velora' ? 'Cosmetics' : brand.slug === 'elan' ? 'Fashion' : 'Footwear'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category & Custom Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                      Category
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowNewCategoryInput(!showNewCategoryInput)}
                      className="text-[11px] font-bold text-amber-700 hover:underline"
                    >
                      {showNewCategoryInput ? 'Choose existing' : '+ Add New Category'}
                    </button>
                  </div>

                  {!showNewCategoryInput ? (
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs font-semibold bg-white"
                    >
                      <option value="">-- Select Category --</option>
                      {(internalCategories && internalCategories.length > 0 ? internalCategories : categories).map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} {cat.brand_name ? `(${cat.brand_name})` : ''}
                        </option>
                      ))}
                    </select>

                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="New category name (e.g. Cleansers)..."
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCreateCategory(e);
                          }
                        }}
                        className="flex-grow px-3.5 py-2.5 text-xs rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-amber-50/40 font-medium"
                        autoFocus
                      />
                      <button
                        type="button"
                        disabled={creatingCategory || !newCategoryName.trim()}
                        onClick={handleCreateCategory}
                        className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        {creatingCategory ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Adding...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                </div>

                {/* SKU Code */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                    SKU Code (Auto-generated if blank)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., VEL-8821"
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value.toUpperCase() }))}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs font-mono font-bold uppercase"
                  />
                </div>
              </div>

              {/* Pricing Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                    Base Price (Rs.) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">Rs.</span>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      required
                      placeholder="2400"
                      value={formData.base_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, base_price: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-bold bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                    Discount Price (Rs.) <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">Rs.</span>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      placeholder="1800"
                      value={formData.discount_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount_price: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-bold bg-white"
                    />
                  </div>
                </div>


                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                    Discount Badge
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 20% OFF / SALE"
                    value={formData.discount_badge}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount_badge: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs font-bold uppercase bg-white"
                  />
                </div>
              </div>

              {/* Status and Merchandising Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Active / Published</span>
                    <span className="text-[10px] text-slate-500">Visible on customer storefront</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.is_bestseller}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_bestseller: e.target.checked }))}
                    className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">⭐ Best Seller</span>
                    <span className="text-[10px] text-slate-500">Show on homepage bestsellers</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.is_new_arrival}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_new_arrival: e.target.checked }))}
                    className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">✨ New Arrival</span>
                    <span className="text-[10px] text-slate-500">Tag as brand new release</span>
                  </div>
                </label>
              </div>

            </div>
          )}

          {/* TAB 2: DETAILS & SPECS */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Description */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                  Product Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Crafted with pure luxury ingredients..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs leading-relaxed"
                />
              </div>

              {/* Key Features Bullet Points */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                    Key Features / Highlights ({formData.features.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Bullet Point
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-6 text-center text-xs font-mono font-bold text-slate-400">{idx + 1}.</span>
                      <input
                        type="text"
                        placeholder="e.g. Infused with 24K Gold particles & Hyaluronic Acid"
                        value={feat}
                        onChange={(e) => handleFeatureChange(idx, e.target.value)}
                        className="flex-grow px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                      />
                      {formData.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(idx)}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Formula & Ingredients */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                  Formula & Ingredients (Cosmetics / Fabric Specifications)
                </label>
                <textarea
                  rows={3}
                  placeholder="Aqua, Niacinamide, Glycerin, Rosa Damascena Extract..."
                  value={formData.ingredients}
                  onChange={(e) => setFormData(prev => ({ ...prev, ingredients: e.target.value }))}
                  className="w-full p-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs font-mono"
                />
              </div>

              {/* How To Use */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                  How To Use / Care Instructions
                </label>
                <textarea
                  rows={3}
                  placeholder="Apply 2-3 drops onto freshly cleansed face morning and night..."
                  value={formData.how_to_use}
                  onChange={(e) => setFormData(prev => ({ ...prev, how_to_use: e.target.value }))}
                  className="w-full p-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                />
              </div>
            </div>
          )}

          {/* TAB 3: PHOTOS & GALLERY (3 DEDICATED ANGLES) */}
          {activeTab === 'photos' && (
            <div className="space-y-6">

              {/* 3-Angle Info & Progress Banner */}
              <div className="p-4 sm:p-5 rounded-3xl bg-linear-to-r from-amber-500/10 via-amber-500/5 to-slate-100 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Product 3-Angle Studio Photos
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                    Upload 3 high-resolution photos of <span className="font-bold text-slate-900">this specific product</span> from different angles. These 3 photos power the live hover slideshow across the website.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                    (formData.images?.length || 0) >= 3
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : (formData.images?.length || 0) > 0
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-slate-200 text-slate-700 border-slate-300'
                  }`}>
                    {formData.images?.length || 0} / 3 Angles Added
                  </span>
                </div>
              </div>

              {/* 3 Dedicated Angle Upload Slots Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* SLOT 1: ANGLE 1 (FRONT STUDIO / PRIMARY) */}
                {(() => {
                  const img1 = formData.images?.[0];
                  return (
                    <div className={`p-4 rounded-3xl border-2 transition-all ${
                      img1?.image_url
                        ? 'border-amber-500/80 bg-white shadow-xs'
                        : 'border-dashed border-slate-300 bg-slate-50 hover:border-amber-400'
                    }`}>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5 text-amber-600" /> Angle 1: Front
                        </span>
                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 shadow-xs">
                          ⭐ Primary Cover
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mb-3 line-clamp-1">
                        Main studio front view of the product
                      </p>

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        ref={slotInputRef0}
                        onChange={(e) => handleSlotFileUpload(0, e)}
                        className="hidden"
                        id="slot-upload-0"
                      />

                      {img1?.image_url ? (
                        <div className="relative aspect-4/3 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group">
                          <img src={img1.image_url} alt="Angle 1 (Front)" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
                            <label
                              htmlFor="slot-upload-0"
                              className="px-3 py-1.5 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-amber-400 cursor-pointer transition-colors shadow-sm flex items-center gap-1"
                            >
                              <RefreshCw className="w-3 h-3" /> Replace
                            </label>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(0)}
                              className="p-1.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors shadow-sm"
                              title="Delete Angle 1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label
                          htmlFor="slot-upload-0"
                          className="aspect-4/3 rounded-2xl border-2 border-dashed border-slate-300 hover:border-amber-500 hover:bg-amber-50/50 flex flex-col items-center justify-center p-4 cursor-pointer transition-all text-center group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center text-amber-600 border border-slate-200 group-hover:scale-110 transition-transform mb-2">
                            {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                          </div>
                          <span className="text-xs font-bold text-slate-800">Upload Front Photo</span>
                          <span className="text-[10px] text-slate-400 mt-0.5">Click or drag image</span>
                        </label>
                      )}
                    </div>
                  );
                })()}

                {/* SLOT 2: ANGLE 2 (SIDE / 45° ANGLE) */}
                {(() => {
                  const img2 = formData.images?.[1];
                  return (
                    <div className={`p-4 rounded-3xl border-2 transition-all ${
                      img2?.image_url
                        ? 'border-indigo-500/80 bg-white shadow-xs'
                        : 'border-dashed border-slate-300 bg-slate-50 hover:border-indigo-400'
                    }`}>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5 text-indigo-600" /> Angle 2: Side
                        </span>
                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 border border-indigo-200">
                          🔄 Slideshow Angle 2
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mb-3 line-clamp-1">
                        45-degree angle or side profile shot
                      </p>

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        ref={slotInputRef1}
                        onChange={(e) => handleSlotFileUpload(1, e)}
                        className="hidden"
                        id="slot-upload-1"
                      />

                      {img2?.image_url ? (
                        <div className="relative aspect-4/3 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group">
                          <img src={img2.image_url} alt="Angle 2 (Side)" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
                            <label
                              htmlFor="slot-upload-1"
                              className="px-3 py-1.5 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-indigo-400 cursor-pointer transition-colors shadow-sm flex items-center gap-1"
                            >
                              <RefreshCw className="w-3 h-3" /> Replace
                            </label>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(1)}
                              className="p-1.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors shadow-sm"
                              title="Delete Angle 2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label
                          htmlFor="slot-upload-1"
                          className="aspect-4/3 rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/50 flex flex-col items-center justify-center p-4 cursor-pointer transition-all text-center group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center text-indigo-600 border border-slate-200 group-hover:scale-110 transition-transform mb-2">
                            {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                          </div>
                          <span className="text-xs font-bold text-slate-800">Upload Side Photo</span>
                          <span className="text-[10px] text-slate-400 mt-0.5">Click or drag image</span>
                        </label>
                      )}
                    </div>
                  );
                })()}

                {/* SLOT 3: ANGLE 3 (DETAIL / CLOSE-UP) */}
                {(() => {
                  const img3 = formData.images?.[2];
                  return (
                    <div className={`p-4 rounded-3xl border-2 transition-all ${
                      img3?.image_url
                        ? 'border-cyan-500/80 bg-white shadow-xs'
                        : 'border-dashed border-slate-300 bg-slate-50 hover:border-cyan-400'
                    }`}>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5 text-cyan-600" /> Angle 3: Detail
                        </span>
                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-900 border border-cyan-200">
                          🔄 Slideshow Angle 3
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mb-3 line-clamp-1">
                        Close-up dropper, texture, or packaging shot
                      </p>

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        ref={slotInputRef2}
                        onChange={(e) => handleSlotFileUpload(2, e)}
                        className="hidden"
                        id="slot-upload-2"
                      />

                      {img3?.image_url ? (
                        <div className="relative aspect-4/3 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group">
                          <img src={img3.image_url} alt="Angle 3 (Detail)" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
                            <label
                              htmlFor="slot-upload-2"
                              className="px-3 py-1.5 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-cyan-400 cursor-pointer transition-colors shadow-sm flex items-center gap-1"
                            >
                              <RefreshCw className="w-3 h-3" /> Replace
                            </label>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(2)}
                              className="p-1.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors shadow-sm"
                              title="Delete Angle 3"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label
                          htmlFor="slot-upload-2"
                          className="aspect-4/3 rounded-2xl border-2 border-dashed border-slate-300 hover:border-cyan-500 hover:bg-cyan-50/50 flex flex-col items-center justify-center p-4 cursor-pointer transition-all text-center group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center text-cyan-600 border border-slate-200 group-hover:scale-110 transition-transform mb-2">
                            {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                          </div>
                          <span className="text-xs font-bold text-slate-800">Upload Detail Photo</span>
                          <span className="text-[10px] text-slate-400 mt-0.5">Click or drag image</span>
                        </label>
                      )}
                    </div>
                  );
                })()}

              </div>

              {/* Bulk Multi-Upload & Direct URL Alternative */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Bulk Select Files */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-900">⚡ Bulk Upload All 3 Photos</p>
                    <p className="text-[10px] text-slate-500">Select 3 files simultaneously from your PC</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    id="admin-bulk-photo-upload"
                  />
                  <label
                    htmlFor="admin-bulk-photo-upload"
                    className="px-3.5 py-2 bg-slate-900 hover:bg-amber-600 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs shrink-0 flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" /> Choose Files
                  </label>
                </div>

                {/* Add Photo via URL */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-center space-y-1.5">
                  <p className="text-xs font-bold text-slate-900">🔗 Add Angle via Image URL</p>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://... image link"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="flex-grow px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Extra Gallery Items if more than 3 */}
              {formData.images?.length > 3 && (
                <div className="pt-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-3">
                    Additional Photos ({formData.images.length - 3} extra)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {formData.images.slice(3).map((img, extraIdx) => {
                      const actualIdx = extraIdx + 3;
                      return (
                        <div key={actualIdx} className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-100">
                          <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(actualIdx)}
                              className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                              title="Delete Photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}


          {/* TAB 4: VARIANTS & INVENTORY */}
          {activeTab === 'variants' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Product Variants & Stock ({formData.variants.length})
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Manage shades, sizes, stock levels, and price overrides for each variation.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="px-4 py-2 bg-slate-900 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Variant
                </button>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                {formData.variants.map((variant, idx) => (
                  <div key={idx} className="p-4 space-y-3 bg-white hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-800">
                        Variant #{idx + 1}
                      </span>
                      {formData.variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(idx)}
                          className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                          Size / Shade *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g., 50ml, S, Rose Gold"
                          value={variant.size_or_shade}
                          onChange={(e) => handleVariantChange(idx, 'size_or_shade', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                          Color / Hex (Opt)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. #D4AF37"
                          value={variant.color}
                          onChange={(e) => handleVariantChange(idx, 'color', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                          SKU Identifier
                        </label>
                        <input
                          type="text"
                          placeholder="Auto if blank"
                          value={variant.sku}
                          onChange={(e) => handleVariantChange(idx, 'sku', e.target.value.toUpperCase())}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono uppercase"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                          Stock Units *
                        </label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={variant.stock_quantity}
                          onChange={(e) => handleVariantChange(idx, 'stock_quantity', e.target.value)}
                          className={`w-full px-3 py-2 rounded-xl border font-bold ${
                            parseInt(variant.stock_quantity) <= 10 ? 'border-amber-400 bg-amber-50 text-amber-900' : 'border-slate-200'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                          Price Override (Rs.)
                        </label>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          placeholder={formData.base_price ? `Rs. ${formData.base_price}` : 'Rs. 0'}
                          value={variant.price_override}
                          onChange={(e) => handleVariantChange(idx, 'price_override', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200"
                        />
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-600/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Product...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{productToEdit ? 'Save Changes' : 'Publish Product'}</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
