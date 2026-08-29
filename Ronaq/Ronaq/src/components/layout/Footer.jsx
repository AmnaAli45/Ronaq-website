import React from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { Crown, Sparkles, Shirt, Footprints, Mail, Phone, MapPin, Instagram, Facebook, Twitter, Youtube } from 'lucide-react';

export const Footer = () => {
  const { settings, getPhoneTel } = useSiteSettings();

  return (
    <footer className="bg-slate-950 text-slate-300 font-sans border-t border-slate-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">

        {/* Col 1 & 2: Brand Info */}
        <div className="lg:col-span-2 space-y-4">
          <Link to="/" className="flex items-center gap-2.5">
            {settings.logo_url ? (
              <img
                src={settings.logo_url}
                alt={settings.site_name || 'Store Logo'}
                className="h-9 w-9 rounded-lg object-contain shadow-sm"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-900 shadow-md">
                <Crown className="w-5 h-5" />
              </div>
            )}
            <span className="font-serif text-2xl font-bold tracking-wider text-white">
              {settings.site_name || 'RONAK'}
            </span>
          </Link>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
            {settings.site_description || 'Ronak is a premier luxury collective bringing together three distinct worlds of cosmetics, fashion, and athletic footwear under one standard of elegance.'}
          </p>
          <div className="pt-2 flex items-center gap-3 text-slate-400">
            {settings.instagram_url && (
              <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-slate-900 hover:bg-amber-600 hover:text-white transition-colors" title="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {settings.facebook_url && (
              <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-slate-900 hover:bg-amber-600 hover:text-white transition-colors" title="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
            )}
            {settings.twitter_url && (
              <a href={settings.twitter_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-slate-900 hover:bg-amber-600 hover:text-white transition-colors" title="Twitter / X">
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {settings.youtube_url && (
              <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-slate-900 hover:bg-amber-600 hover:text-white transition-colors" title="YouTube">
                <Youtube className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Col 3: Quick Links & Brands */}
        <div>
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-4">Customer Links</h4>
          <ul className="space-y-3 text-xs">
            <li>
              <Link to="/wishlist" className="hover:text-rose-300 transition-colors flex items-center gap-2">
                <span className="text-rose-400">♥</span> My Wishlist
              </Link>
            </li>
            <li>
              <Link to="/track-order" className="hover:text-amber-300 transition-colors flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Track Live Order
              </Link>
            </li>
            <li>
              <Link to="/velora" className="hover:text-amber-300 transition-colors flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Velora ({settings.subbrand_velora_tagline || 'Cosmetics'})
              </Link>
            </li>
            <li>
              <Link to="/elan" className="hover:text-amber-300 transition-colors flex items-center gap-2">
                <Shirt className="w-3.5 h-3.5 text-amber-500" /> Elan ({settings.subbrand_elan_tagline || 'Fashion'})
              </Link>
            </li>
            <li>
              <Link to="/stryde" className="hover:text-amber-300 transition-colors flex items-center gap-2">
                <Footprints className="w-3.5 h-3.5 text-amber-500" /> Stryde ({settings.subbrand_stryde_tagline || 'Shoes'})
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Contact Information */}
        <div>
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-4">Get In Touch</h4>
          <ul className="space-y-3 text-xs text-slate-400">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>{settings.address || 'Ronak Luxury HQ, Lahore, Pakistan'}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-amber-500 shrink-0" />
              <a href={getPhoneTel()} className="hover:text-amber-300 transition-colors">
                {settings.phone_display || settings.phone_number || '+92 300 1234567'}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-amber-500 shrink-0" />
              <a href={`mailto:${settings.email || 'support@ronak.com'}`} className="hover:text-amber-300 transition-colors">
                {settings.email || 'support@ronak.com'}
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-900 py-6 px-4 sm:px-6 text-xs text-slate-500 bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} {settings.site_name || 'Ronak'} {settings.site_tagline || 'Luxury Collective'}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};



