import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PRODUCTS } from '../../data/products';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';

export const SearchModal = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const results = searchTerm.trim() === '' ? [] : PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProductClick = (id) => {
    onClose();
    navigate(`/product/${id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-6 sm:pt-16 p-3 sm:px-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 max-h-[85vh] flex flex-col">
        {/* Search Header */}
        <div className="flex items-center px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 shrink-0">
          <Search className="w-5 h-5 text-amber-600 mr-2.5 sm:mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search Velora, Elan, Stryde..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-sm sm:text-base focus:outline-none placeholder:text-slate-400 text-slate-800"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-600 mr-2.5 text-xs font-semibold">
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Popular searches / Results */}
        <div className="p-4 sm:p-6 overflow-y-auto">
          {searchTerm.trim() === '' ? (
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Trending Searches
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-5 sm:mb-6">
                {['Vitamin C Serum', 'Sunscreen SPF 50', 'Denim Jeans', 'Men Kurta', 'Sneakers', 'Formal Shoes', 'Lip Tint', 'Abaya'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchTerm(tag)}
                    className="px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium hover:bg-amber-100 hover:text-amber-900 transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Sub-Brands</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  <button
                    onClick={() => { onClose(); navigate('/velora'); }}
                    className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 hover:border-amber-300 text-left transition-all group cursor-pointer"
                  >
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">Velora</span>
                    <span className="text-xs text-amber-600">Cosmetics & Skincare</span>
                  </button>
                  <button
                    onClick={() => { onClose(); navigate('/elan'); }}
                    className="p-3 rounded-xl bg-slate-100 border border-slate-200 hover:border-slate-400 text-left transition-all group cursor-pointer"
                  >
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">Elan</span>
                    <span className="text-xs text-slate-500">Men • Women • Teens</span>
                  </button>
                  <button
                    onClick={() => { onClose(); navigate('/stryde'); }}
                    className="p-3 rounded-xl bg-cyan-950/10 border border-cyan-200 hover:border-cyan-400 text-left transition-all group cursor-pointer"
                  >
                    <span className="text-xs font-bold text-cyan-900 uppercase tracking-wider block">Stryde</span>
                    <span className="text-xs text-cyan-700">Footwear & Shoes</span>
                  </button>
                </div>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Found {results.length} item{results.length > 1 ? 's' : ''}
              </p>
              {results.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product.id)}
                  className="flex items-center gap-4 p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-all border border-transparent hover:border-slate-200 group"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-14 h-14 object-cover rounded-lg shrink-0 bg-slate-100"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        product.brandSlug === 'velora' ? 'bg-amber-100 text-amber-800' :
                        product.brandSlug === 'elan' ? 'bg-slate-900 text-white' : 'bg-cyan-100 text-cyan-800'
                      }`}>
                        {product.brand}
                      </span>
                      <span className="text-xs text-slate-400">{product.category}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-800 truncate group-hover:text-amber-600 transition-colors">
                      {product.name}
                    </h4>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-slate-900">Rs. {Number(product.price).toLocaleString()}</span>
                    {product.originalPrice && (
                      <span className="text-xs text-slate-400 line-through block">Rs. {Number(product.originalPrice).toLocaleString()}</span>
                    )}
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500">
              <p className="text-sm">No products found matching "{searchTerm}"</p>
              <p className="text-xs text-slate-400 mt-1">Try searching for keywords like "Serum", "Jeans", or "Sneakers"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
