import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { settingsAPI, catalogAPI } from '../services/api';
import { AuthModal } from '../components/common/AuthModal';
import {
  Crown,
  Settings,
  Sparkles,
  Image as ImageIcon,
  Upload,
  Phone,
  Megaphone,
  Layers,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Truck,
  Mail,
  MapPin,
  Globe,
  Plus,
  Trash2,
  Sparkle,
  Shirt,
  Footprints
} from 'lucide-react';


export const AdminSettingsPage = () => {
  const { user, isAuthenticated, loginAsAdmin } = useAuth();
  const { settings, updateSettingsLocally, refreshSettings } = useSiteSettings();
  const navigate = useNavigate();

  const isAuthorized = Boolean(isAuthenticated && (user?.is_staff || user?.is_superuser || user?.role === 'ADMIN' || user?.role === 'STAFF' || user?.email === 'admin@ronak.com' || user?.email === 'admin@ronaq.com'));

  const [activeTab, setActiveTab] = useState('branding');
  const [formData, setFormData] = useState({ ...settings });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState('');
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const logoFileInputRef = useRef(null);
  const bannerFileInputRef = useRef(null);
  const [currentBannerField, setCurrentBannerField] = useState('home_hero_image');

  useEffect(() => {
    const fetchAdminSettings = async () => {
      setLoading(true);
      try {
        const res = await settingsAPI.adminGetSettings();
        if (res.data) {
          setFormData(prev => ({
            ...prev,
            ...res.data,
          }));
        }
      } catch (err) {
        console.warn('Using local settings data:', err.message);
        setFormData({ ...settings });
      } finally {
        setLoading(false);
      }
    };

    if (isAuthorized) {
      fetchAdminSettings();
    } else {
      setFormData({ ...settings });
    }
  }, [isAuthorized, settings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const res = await settingsAPI.adminUpdateSettings(formData);
      const updated = res.data.settings || res.data;
      setFormData(updated);
      updateSettingsLocally(updated);
      refreshSettings();

      setStatusMessage({
        type: 'success',
        text: '🎉 Store settings, branding, offers, and banners updated successfully!'
      });

      // Clear success message after 4s
      setTimeout(() => {
        setStatusMessage({ type: '', text: '' });
      }, 4000);
    } catch (err) {
      console.error('Error updating settings:', err);
      // Even if API fails due to auth or network, update locally for instant demo
      updateSettingsLocally(formData);
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.detail || err.response?.data?.message || 'Failed to save to backend server. Check admin permissions.'
      });
    } finally {
      setSaving(false);
    }
  };

  // Upload Logo file directly to backend
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const uploadData = new FormData();
      uploadData.append('image', file);

      const res = await catalogAPI.adminUploadImage(uploadData);
      const imageUrl = res.data.image_url || res.data.relative_url;

      setFormData(prev => ({
        ...prev,
        logo_url: imageUrl,
      }));

      setStatusMessage({
        type: 'success',
        text: 'Logo image uploaded! Remember to click "Save All Changes" to publish.'
      });
    } catch (err) {
      console.error('Logo upload failed:', err);
      setStatusMessage({
        type: 'error',
        text: 'Failed to upload logo image. Please try again or provide an image URL.'
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  // Upload Banner file directly
  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(currentBannerField);
    setStatusMessage({ type: '', text: '' });

    try {
      const uploadData = new FormData();
      uploadData.append('image', file);

      const res = await catalogAPI.adminUploadImage(uploadData);
      const imageUrl = res.data.image_url || res.data.relative_url;

      setFormData(prev => ({
        ...prev,
        [currentBannerField]: imageUrl,
      }));

      setStatusMessage({
        type: 'success',
        text: `Banner photo uploaded for ${currentBannerField}! Remember to click "Save All Changes".`
      });
    } catch (err) {
      console.error('Banner upload failed:', err);
      setStatusMessage({
        type: 'error',
        text: 'Failed to upload banner image. Please try again or paste image URL.'
      });
    } finally {
      setUploadingBanner('');
    }
  };

  const triggerBannerUpload = (fieldName) => {
    setCurrentBannerField(fieldName);
    if (bannerFileInputRef.current) {
      bannerFileInputRef.current.click();
    }
  };

  // Restore defaults
  const handleResetDefaults = () => {
    if (window.confirm('Are you sure you want to reset all store settings and banners back to default values?')) {
      const defaultState = {
        site_name: 'RONAK',
        site_tagline: 'Luxury Collective',
        site_description: 'Ronak is a premier luxury collective bringing together three distinct worlds of cosmetics, fashion, and athletic footwear under one standard of elegance.',
        logo_url: '',
        custom_logo_text: 'RONAK',
        subbrand_velora_tagline: 'Cosmetics & Skincare',
        subbrand_elan_tagline: 'Luxury Apparel',
        subbrand_stryde_tagline: 'Athletic Footwear',
        announcement_enabled: true,
        announcement_text: '🎉 FREE EXPRESS COURIER SHIPPING on all orders over Rs. 2,500 across Pakistan',
        announcement_badge: 'SPECIAL OFFER',
        announcement_link: '/velora',
        top_welcome_text: 'Welcome to RONAK — House of Premium Brands',
        phone_number: '+92 300 1234567',
        phone_display: '1-800-RONAK',
        email: 'support@ronak.com',
        address: 'Ronak Luxury HQ, Lahore, Pakistan',

        free_shipping_threshold: 2500.00,
        currency_symbol: 'Rs.',
        instagram_url: 'https://instagram.com',

        facebook_url: 'https://facebook.com',
        twitter_url: 'https://twitter.com',
        youtube_url: 'https://youtube.com',
        home_hero_title: 'One Destination. Three Iconic Sub-Brands.',
        home_hero_subtitle: 'Experience Velora skincare, Elan luxury apparel, and Stryde athletic footwear under Ronak’s unified multi-brand house.',
        home_hero_badge: 'The Premier Luxury Umbrella Brand',
        home_hero_image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2000&q=80',
        velora_hero_title: 'Velora Cosmetics & Skincare',
        velora_hero_subtitle: 'Pure, dermatologically tested skincare and luminous makeup formulas crafted for glowing, healthy skin.',
        velora_hero_badge: 'Sub-Brand Spotlight',
        velora_hero_image: '',
        elan_hero_title: 'Elan Luxury Apparel & Fashion',
        elan_hero_subtitle: 'Bespoke tailoring, signature ready-to-wear silhouettes, and timeless couture created for the modern connoisseur.',
        elan_hero_badge: 'Haute Couture Collection',
        elan_hero_image: '',
        stryde_hero_title: 'Stryde Performance & Athletic Footwear',
        stryde_hero_subtitle: 'High-performance engineering, responsive cushioning, and sleek urban aesthetics built for all-day motion.',
        stryde_hero_badge: 'Athletic Innovation',
        stryde_hero_image: '',
      };
      setFormData(defaultState);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-amber-400 selection:text-slate-950 pb-24">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={logoFileInputRef}
        onChange={handleLogoUpload}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={bannerFileInputRef}
        onChange={handleBannerUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-amber-500/20 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-400">
              <Crown className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Store Configuration & Customization Hub</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-white">
              Offers, Header, Logo, Phone & Banners
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-light leading-relaxed">
              Dynamically customize top announcement offers, brand logo, support phone, and page banners in real time across the entire store.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
            <Link
              to="/admin"
              className="flex-1 sm:flex-none justify-center px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
            >
              <span>← Back to Admin Hub</span>
            </Link>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 sm:flex-none justify-center px-6 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-amber-500/20 flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 shrink-0"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save All Changes'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Status Notification */}
        {statusMessage.text && (
          <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold animate-fade-in ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}>
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage({ type: '', text: '' })}
              className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 border-b border-slate-200">
          {[
            { id: 'branding', label: '👑 Brand & Logo', icon: Crown },
            { id: 'offers', label: '🎉 Offers & Header', icon: Megaphone },
            { id: 'contact', label: '📞 Phone & Support', icon: Phone },
            { id: 'banners', label: '🖼️ Hero Banners', icon: ImageIcon },
            { id: 'footer', label: '🌐 Footer & Social', icon: Globe },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>


        {/* TAB 1: BRANDING & LOGO */}
        {activeTab === 'branding' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div>
                <h3 className="text-xl font-serif font-bold text-slate-900">Brand Identity & Logo Configuration</h3>
                <p className="text-xs text-slate-500 mt-1">Configure your luxury house name, tagline, and logo image.</p>
              </div>

              <div className="space-y-5">
                {/* Brand Name & Tagline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Store / Brand Name
                    </label>
                    <input
                      type="text"
                      name="site_name"
                      value={formData.site_name || ''}
                      onChange={handleChange}
                      placeholder="e.g. RONAK"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Store Tagline
                    </label>
                    <input
                      type="text"
                      name="site_tagline"
                      value={formData.site_tagline || ''}
                      onChange={handleChange}
                      placeholder="e.g. Luxury Collective"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Logo Image Upload / URL */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Logo Image URL / Direct Upload
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <input
                      type="text"
                      name="logo_url"
                      value={formData.logo_url || ''}
                      onChange={handleChange}
                      placeholder="https://... (or click upload button)"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => logoFileInputRef.current?.click()}
                      disabled={uploadingLogo}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-amber-600 text-white text-xs font-bold shrink-0 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    PNG, SVG, or WEBP with transparent background recommended. If empty, default gold luxury Crown logo is used.
                  </p>
                </div>

                {/* Sub-Brand Taglines */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Sub-Brand Subtitles</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-amber-700 mb-1">
                        Velora Label
                      </label>
                      <input
                        type="text"
                        name="subbrand_velora_tagline"
                        value={formData.subbrand_velora_tagline || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-indigo-700 mb-1">
                        Elan Label
                      </label>
                      <input
                        type="text"
                        name="subbrand_elan_tagline"
                        value={formData.subbrand_elan_tagline || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-cyan-700 mb-1">
                        Stryde Label
                      </label>
                      <input
                        type="text"
                        name="subbrand_stryde_tagline"
                        value={formData.subbrand_stryde_tagline || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Live Logo Preview Box */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Eye className="w-4 h-4 text-amber-600" />
                  <span>Header Logo Live Preview</span>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center min-h-[140px]">
                  {formData.logo_url ? (
                    <img
                      src={formData.logo_url}
                      alt={formData.site_name}
                      className="max-h-16 max-w-full object-contain"
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 shadow-md">
                        <Crown className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="font-serif text-2xl font-bold tracking-wider text-white block leading-none">
                          {formData.site_name || 'RONAK'}
                        </span>
                        <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-amber-400">
                          {formData.site_tagline || 'Luxury Collective'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">Site Name:</span>
                    <strong className="text-slate-900">{formData.site_name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">Tagline:</span>
                    <strong className="text-slate-900">{formData.site_tagline}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">Logo Type:</span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">
                      {formData.logo_url ? 'Custom Image' : 'Default Emblem'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: OFFERS & ANNOUNCEMENT HEADER */}
        {activeTab === 'offers' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div>
                <h3 className="text-xl font-serif font-bold text-slate-900">Header Offers & Announcement Bar</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Control the top promotional bar that appears above the navigation on all customer-facing pages.
                </p>
              </div>

              <div className="space-y-5">
                {/* Enable / Disable Toggle */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60">
                  <div>
                    <h4 className="text-xs font-bold text-amber-900">Enable Announcement Bar</h4>
                    <p className="text-[11px] text-amber-700">Display the top ribbon announcement across the store.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="announcement_enabled"
                      checked={Boolean(formData.announcement_enabled)}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                {/* Announcement Offer Message */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Main Offer / Free Shipping Text
                  </label>
                  <input
                    type="text"
                    name="announcement_text"
                    value={formData.announcement_text || ''}
                    onChange={handleChange}
                    placeholder="e.g. 🎉 FREE EXPRESS COURIER SHIPPING on all orders over Rs. 2,500 across Pakistan"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                {/* Welcome Message (Left side of header) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Top Bar Welcome Text (Desktop Left)
                  </label>
                  <input
                    type="text"
                    name="top_welcome_text"
                    value={formData.top_welcome_text || ''}
                    onChange={handleChange}
                    placeholder="e.g. Welcome to RONAK — House of Premium Brands"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                {/* Announcement Action Badge Text */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Badge Label
                    </label>
                    <input
                      type="text"
                      name="announcement_badge"
                      value={formData.announcement_badge || ''}
                      onChange={handleChange}
                      placeholder="e.g. SPECIAL OFFER"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Destination Link
                    </label>
                    <input
                      type="text"
                      name="announcement_link"
                      value={formData.announcement_link || ''}
                      onChange={handleChange}
                      placeholder="e.g. /velora or /elan"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Live Announcement Bar Preview */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Eye className="w-4 h-4 text-amber-600" />
                  <span>Announcement Ribbon Preview</span>
                </div>

                {formData.announcement_enabled ? (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-amber-200 text-xs text-center border border-amber-500/30 space-y-1 shadow-md">
                    <p className="text-[11px] font-bold">
                      {formData.announcement_text || 'FREE EXPRESS COURIER SHIPPING on all orders over Rs. 2,500 across Pakistan'}
                    </p>
                    <p className="text-[10px] text-amber-400/80 font-normal">
                      {formData.top_welcome_text}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-100 text-slate-500 text-xs text-center font-bold">
                    Announcement Bar is currently disabled.
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 text-xs text-slate-600 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">Free Shipping Limit:</span>
                    <strong className="text-amber-800">Rs. {Number(formData.free_shipping_threshold).toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">Status:</span>
                    <strong className={formData.announcement_enabled ? 'text-emerald-700' : 'text-slate-500'}>
                      {formData.announcement_enabled ? 'Active on Storefront' : 'Hidden'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CONTACT, PHONE & SUPPORT */}
        {activeTab === 'contact' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div>
                <h3 className="text-xl font-serif font-bold text-slate-900">Phone & Customer Support Configuration</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Configure your customer service helpline phone number, support email, and physical headquarters.
                </p>
              </div>

              <div className="space-y-5">
                {/* Phone Numbers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Customer Helpline Phone (Dialable)
                    </label>
                    <input
                      type="text"
                      name="phone_number"
                      value={formData.phone_number || ''}
                      onChange={handleChange}
                      placeholder="+92 300 1234567"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Helpline Display Text (Navbar & Footer)
                    </label>
                    <input
                      type="text"
                      name="phone_display"
                      value={formData.phone_display || ''}
                      onChange={handleChange}
                      placeholder="e.g. 1-800-RONAK or +92 300 1234567"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Email & Physical Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Support Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleChange}
                      placeholder="support@ronak.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Headquarters Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address || ''}
                      onChange={handleChange}
                      placeholder="Ronak Luxury HQ, Lahore, Pakistan"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Helpline Preview Card */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Eye className="w-4 h-4 text-amber-600" />
                  <span>Customer Support Preview</span>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-amber-950 text-white space-y-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 mx-auto flex items-center justify-center">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-300">Customer Helpline</h4>
                    <p className="text-xs font-mono font-bold text-white mt-1">
                      {formData.phone_display || formData.phone_number || '+92 300 1234567'}
                    </p>
                    <p className="text-[11px] text-slate-300 mt-2">
                      Appears in the top navigation strip and the global footer.
                    </p>
                  </div>

                  <a
                    href={`tel:${(formData.phone_number || '').replace(/[^0-9+]/g, '')}`}
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/30 transition-all cursor-pointer"
                  >
                    <span>Test Helpline Dial (tel:)</span>
                  </a>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">Email:</span>
                    <strong className="text-slate-900">{formData.email || 'support@ronak.com'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">Address:</span>
                    <strong className="text-slate-900 text-right truncate max-w-[160px]">{formData.address || 'Lahore, Pakistan'}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* TAB 4: BANNERS & HERO SECTIONS */}
        {activeTab === 'banners' && (
          <div className="space-y-8">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
              <div>
                <h3 className="text-xl font-serif font-bold text-slate-900">Hero Banners & Visual Management</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Customize the headline, subtitle, badge, and background photo for the Home, Velora, Elan, and Stryde pages.
                </p>
              </div>

              {/* BANNER 1: HOME PAGE HERO */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-600" />
                    <h4 className="text-sm font-bold text-slate-900">1. Home Page Hero Banner</h4>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
                    Main Storefront
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Hero Headline
                    </label>
                    <input
                      type="text"
                      name="home_hero_title"
                      value={formData.home_hero_title || ''}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      name="home_hero_badge"
                      value={formData.home_hero_badge || ''}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Hero Subtitle / Description
                  </label>
                  <textarea
                    rows={2}
                    name="home_hero_subtitle"
                    value={formData.home_hero_subtitle || ''}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Hero Background Image URL / Upload
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <input
                      type="text"
                      name="home_hero_image"
                      value={formData.home_hero_image || ''}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => triggerBannerUpload('home_hero_image')}
                      disabled={uploadingBanner === 'home_hero_image'}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-amber-600 text-white text-xs font-bold shrink-0 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingBanner === 'home_hero_image' ? 'Uploading...' : 'Upload Image'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* BANNER 2: VELORA HERO */}
              <div className="p-6 rounded-2xl bg-amber-50/40 border border-amber-200/70 space-y-4">
                <div className="flex items-center justify-between border-b border-amber-200/50 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkle className="w-5 h-5 text-amber-600" />
                    <h4 className="text-sm font-bold text-amber-950">2. Velora Cosmetics Page Banner</h4>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
                    Velora Hub
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-amber-900 uppercase mb-1">
                      Velora Headline
                    </label>
                    <input
                      type="text"
                      name="velora_hero_title"
                      value={formData.velora_hero_title || ''}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-amber-200 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-amber-900 uppercase mb-1">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      name="velora_hero_badge"
                      value={formData.velora_hero_badge || ''}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-amber-200 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-amber-900 uppercase mb-1">
                    Velora Subtitle
                  </label>
                  <textarea
                    rows={2}
                    name="velora_hero_subtitle"
                    value={formData.velora_hero_subtitle || ''}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-amber-200 text-xs"
                  />
                </div>
              </div>

              {/* BANNER 3: ELAN HERO */}
              <div className="p-6 rounded-2xl bg-indigo-50/40 border border-indigo-200/70 space-y-4">
                <div className="flex items-center justify-between border-b border-indigo-200/50 pb-3">
                  <div className="flex items-center gap-2">
                    <Shirt className="w-5 h-5 text-indigo-600" />
                    <h4 className="text-sm font-bold text-indigo-950">3. Elan Luxury Apparel Page Banner</h4>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-800 bg-indigo-100 px-2.5 py-1 rounded-full">
                    Elan Fashion
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-indigo-900 uppercase mb-1">
                      Elan Headline
                    </label>
                    <input
                      type="text"
                      name="elan_hero_title"
                      value={formData.elan_hero_title || ''}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-indigo-200 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-indigo-900 uppercase mb-1">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      name="elan_hero_badge"
                      value={formData.elan_hero_badge || ''}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-indigo-200 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-indigo-900 uppercase mb-1">
                    Elan Subtitle
                  </label>
                  <textarea
                    rows={2}
                    name="elan_hero_subtitle"
                    value={formData.elan_hero_subtitle || ''}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-indigo-200 text-xs"
                  />
                </div>
              </div>

              {/* BANNER 4: STRYDE HERO */}
              <div className="p-6 rounded-2xl bg-cyan-50/40 border border-cyan-200/70 space-y-4">
                <div className="flex items-center justify-between border-b border-cyan-200/50 pb-3">
                  <div className="flex items-center gap-2">
                    <Footprints className="w-5 h-5 text-cyan-600" />
                    <h4 className="text-sm font-bold text-cyan-950">4. Stryde Footwear Page Banner</h4>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-cyan-800 bg-cyan-100 px-2.5 py-1 rounded-full">
                    Stryde Shoes
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-cyan-900 uppercase mb-1">
                      Stryde Headline
                    </label>
                    <input
                      type="text"
                      name="stryde_hero_title"
                      value={formData.stryde_hero_title || ''}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-cyan-200 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-cyan-900 uppercase mb-1">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      name="stryde_hero_badge"
                      value={formData.stryde_hero_badge || ''}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-cyan-200 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-cyan-900 uppercase mb-1">
                    Stryde Subtitle
                  </label>
                  <textarea
                    rows={2}
                    name="stryde_hero_subtitle"
                    value={formData.stryde_hero_subtitle || ''}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-cyan-200 text-xs"
                  />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: FOOTER & SOCIAL LINKS */}
        {activeTab === 'footer' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-xl font-serif font-bold text-slate-900">Footer Content & Social Media Profiles</h3>
              <p className="text-xs text-slate-500 mt-1">
                Customize store description, copyright, and official social media profile URLs.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  About Store / Footer Description
                </label>
                <textarea
                  rows={3}
                  name="site_description"
                  value={formData.site_description || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Instagram URL
                  </label>
                  <input
                    type="text"
                    name="instagram_url"
                    value={formData.instagram_url || ''}
                    onChange={handleChange}
                    placeholder="https://instagram.com/..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Facebook URL
                  </label>
                  <input
                    type="text"
                    name="facebook_url"
                    value={formData.facebook_url || ''}
                    onChange={handleChange}
                    placeholder="https://facebook.com/..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Twitter / X URL
                  </label>
                  <input
                    type="text"
                    name="twitter_url"
                    value={formData.twitter_url || ''}
                    onChange={handleChange}
                    placeholder="https://twitter.com/..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    YouTube URL
                  </label>
                  <input
                    type="text"
                    name="youtube_url"
                    value={formData.youtube_url || ''}
                    onChange={handleChange}
                    placeholder="https://youtube.com/..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Floating Bar with Save & Reset */}
        <div className="sticky bottom-6 z-30 p-4 rounded-3xl bg-slate-900 text-white shadow-2xl border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Save Changes to Storefront</p>
              <p className="text-[11px] text-slate-400">All modifications will immediately take effect across the live website.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
            </button>
          </div>
        </div>

      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
};

export default AdminSettingsPage;
