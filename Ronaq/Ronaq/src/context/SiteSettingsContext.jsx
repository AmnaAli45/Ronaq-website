import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { settingsAPI } from '../services/api';

const DEFAULT_SETTINGS = {
  // Brand Identity & Logo
  site_name: 'RONAQ',
  site_tagline: 'Luxury Collective',
  site_description: 'Ronaq is a premier luxury collective bringing together three distinct worlds of cosmetics, fashion, and athletic footwear under one standard of elegance.',
  logo_url: '',
  custom_logo_text: 'RONAQ',
  subbrand_velora_tagline: 'Cosmetics & Skincare',
  subbrand_elan_tagline: 'Luxury Apparel',
  subbrand_stryde_tagline: 'Athletic Footwear',

  // Top Announcement Bar & Offers
  announcement_enabled: true,
  announcement_text: '🎉 FREE EXPRESS COURIER SHIPPING on all orders over Rs. 2,500 across Pakistan',
  announcement_badge: 'SPECIAL OFFER',
  announcement_link: '/velora',
  top_welcome_text: 'Welcome to RONAQ — House of Premium Brands',

  // Contact & Phone
  phone_number: '+92 300 1234567',
  phone_display: '1-800-RONAQ',
  email: 'support@ronaq.com',
  address: 'Ronaq Luxury HQ, Lahore, Pakistan',

  // Shipping Thresholds & Currency
  free_shipping_threshold: 2500.00,
  currency_symbol: 'Rs.',


  // Social Links
  instagram_url: 'https://instagram.com',
  facebook_url: 'https://facebook.com',
  twitter_url: 'https://twitter.com',
  youtube_url: 'https://youtube.com',

  // Hero Banners
  home_hero_title: 'One Destination. Three Iconic Sub-Brands.',
  home_hero_subtitle: 'Experience Velora skincare, Elan luxury apparel, and Stryde athletic footwear under Ronaq’s unified multi-brand house.',
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

const SiteSettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  banners: [],
  loading: true,
  refreshSettings: () => {},
  updateSettingsLocally: () => {},
  getPhoneTel: () => '',
});

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await settingsAPI.getPublicSettings();
      if (res.data) {
        if (res.data.settings) {
          setSettings(prev => ({
            ...prev,
            ...res.data.settings,
          }));
        }
        if (res.data.banners) {
          setBanners(res.data.banners);
        }
      }
    } catch (err) {
      console.warn('Could not fetch remote site settings, using defaults:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Clean phone number for tel: links
  const getPhoneTel = useCallback(() => {
    const raw = settings.phone_number || settings.phone_display || '+923001234567';
    return `tel:${raw.replace(/[^0-9+]/g, '')}`;
  }, [settings.phone_number, settings.phone_display]);

  const updateSettingsLocally = useCallback((newSettings) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings,
    }));
  }, []);

  return (
    <SiteSettingsContext.Provider
      value={{
        settings,
        banners,
        loading,
        refreshSettings: fetchSettings,
        updateSettingsLocally,
        getPhoneTel,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
};


export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
};

export default SiteSettingsContext;
