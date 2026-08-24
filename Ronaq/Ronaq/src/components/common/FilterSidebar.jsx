import React from 'react';
import { Filter, X, RefreshCw, Star, Check } from 'lucide-react';

export const FilterSidebar = ({
  categories = [],
  selectedCategories = [],
  onCategoryChange,
  priceRange = [0, 150],
  maxPriceLimit = 150,
  onPriceChange,
  onlySale = false,
  onSaleChange,
  minRating = 0,
  onRatingChange,
  onResetFilters,
  totalResultsCount = 0,
  brandTheme = 'ronaq',
  isMobileOpen = false,
  onCloseMobile
}) => {
  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Filter className={`w-4 h-4 ${
            brandTheme === 'velora' ? 'text-amber-600' :
            brandTheme === 'stryde' ? 'text-cyan-400' : 'text-slate-900'
          }`} />
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900">
            Filter Products
          </h3>
        </div>
        <button
          onClick={onResetFilters}
          className="text-xs text-slate-500 hover:text-amber-700 font-medium flex items-center gap-1 transition-colors"
          title="Reset all filters"
        >
          <RefreshCw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Category Multi-select */}
      {categories.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Product Category
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {categories.map((cat) => {
              const isChecked = selectedCategories.includes(cat);
              return (
                <label
                  key={cat}
                  className="flex items-center gap-3 cursor-pointer group text-xs text-slate-700 hover:text-slate-900"
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                    isChecked
                      ? brandTheme === 'velora' ? 'bg-amber-600 border-amber-600 text-white' :
                        brandTheme === 'stryde' ? 'bg-cyan-500 border-cyan-500 text-slate-950' : 'bg-slate-900 border-slate-900 text-white'
                      : 'border-slate-300 bg-white group-hover:border-slate-400'
                  }`}>
                    {isChecked && <Check className="w-3 h-3" />}
                  </div>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isChecked}
                    onChange={() => onCategoryChange(cat)}
                  />
                  <span>{cat}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Price Range Slider */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs">
          <h4 className="font-bold uppercase tracking-wider text-slate-500">Price Range</h4>
          <span className="font-bold text-slate-900">Rs. {Number(priceRange[0]).toLocaleString()} - Rs. {Number(priceRange[1]).toLocaleString()}</span>
        </div>
        <input
          type="range"
          min="0"
          max={maxPriceLimit}
          step="100"
          value={priceRange[1]}
          onChange={(e) => onPriceChange([priceRange[0], Number(e.target.value)])}
          className="w-full accent-amber-600 cursor-pointer"
        />
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Rs. 0</span>
          <span>Rs. {Number(maxPriceLimit).toLocaleString()}</span>
        </div>
      </div>


      {/* On Sale / Discount Filter */}
      <div className="pt-4 border-t border-slate-100">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">On Sale / Discounted</span>
          <input
            type="checkbox"
            checked={onlySale}
            onChange={(e) => onSaleChange(e.target.checked)}
            className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
          />
        </label>
      </div>

      {/* Minimum Rating Filter */}
      <div className="space-y-2 pt-4 border-t border-slate-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Minimum Rating</h4>
        <div className="space-y-1.5">
          {[4.5, 4.0, 3.5].map((rating) => (
            <button
              key={rating}
              onClick={() => onRatingChange(minRating === rating ? 0 : rating)}
              className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                minRating === rating
                  ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200'
                  : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{rating} Stars & above</span>
              </div>
              {minRating === rating && <Check className="w-3.5 h-3.5 text-amber-700" />}
            </button>
          ))}
        </div>
      </div>

      {/* Total matching summary */}
      <div className="pt-4 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-500">
          Showing <strong className="text-slate-900">{totalResultsCount}</strong> products
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Container */}
      <div className="hidden lg:block w-64 shrink-0 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit sticky top-36">
        {content}
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full p-6 overflow-y-auto shadow-2xl flex flex-col justify-between z-10">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b">
                <h3 className="font-bold text-base text-slate-900">Filters</h3>
                <button onClick={onCloseMobile} className="p-1 rounded-full text-slate-400 hover:text-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {content}
            </div>
            <button
              onClick={onCloseMobile}
              className="mt-6 w-full py-3 bg-slate-900 text-white text-xs font-bold uppercase rounded-xl"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </>
  );
};
