import React from 'react';
import { ArrowUpDown } from 'lucide-react';

export const SortDropdown = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2 text-xs">
      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
      <span className="font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">Sort By:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-600 shadow-xs cursor-pointer"
      >
        <option value="featured">Featured Items</option>
        <option value="bestseller">Best Selling</option>
        <option value="price-low">Price: Low to High</option>
        <option value="price-high">Price: High to Low</option>
        <option value="rating">Highest Rated</option>
        <option value="newest">Newest Arrivals</option>
      </select>
    </div>
  );
};
