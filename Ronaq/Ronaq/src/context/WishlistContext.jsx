import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { wishlistAPI } from '../services/api';
import { useAuth } from './AuthContext';
import { PRODUCTS } from '../data/products';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState(() => {
    try {
      const localData = localStorage.getItem('ronak_wishlist') || localStorage.getItem('ronaq_wishlist');
      return localData ? JSON.parse(localData) : [];
    } catch {
      return [];
    }
  });
  const [backendItems, setBackendItems] = useState([]);

  // Fetch Wishlist from backend for authenticated users
  const fetchWishlist = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await wishlistAPI.getWishlist();
      const items = res.data?.items || [];
      setBackendItems(items);
      const productIds = items.map(item => item.product_details?.slug || item.product_details?.id || item.product);
      
      // Merge with local wishlist so no locally added items are lost
      setWishlist(prev => {
        const merged = Array.from(new Set([...prev, ...productIds.map(String)]));
        try {
          localStorage.setItem('ronak_wishlist', JSON.stringify(merged));
        } catch (e) {
          console.error(e);
        }
        return merged;
      });
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated]);

  // Continuously sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ronak_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error('Error saving wishlist to localStorage:', e);
    }
  }, [wishlist]);

  // Toggle item in Wishlist
  const toggleWishlist = async (productId, dbProductId = null) => {
    if (!productId) return;
    const strId = String(productId);
    const isCurrentlyIn = wishlist.some(id => String(id) === strId);

    // Optimistic UI state update
    const updatedWishlist = isCurrentlyIn
      ? wishlist.filter(id => String(id) !== strId)
      : [...wishlist, strId];

    setWishlist(updatedWishlist);
    try {
      localStorage.setItem('ronak_wishlist', JSON.stringify(updatedWishlist));
    } catch (e) {
      console.error(e);
    }

    // Backend sync for logged in user
    if (isAuthenticated) {
      try {
        if (isCurrentlyIn) {
          await wishlistAPI.removeFromWishlist(dbProductId || strId);
        } else {
          await wishlistAPI.addToWishlist(dbProductId || strId);
        }
      } catch (err) {
        console.error('Wishlist backend sync error:', err);
      }
    }
  };

  const removeFromWishlist = (productId, dbProductId = null) => {
    if (!productId) return;
    const strId = String(productId);
    const updated = wishlist.filter(id => String(id) !== strId);
    setWishlist(updated);
    if (isAuthenticated) {
      wishlistAPI.removeFromWishlist(dbProductId || strId).catch(err => console.error(err));
    }
  };

  const clearWishlist = () => {
    setWishlist([]);
    try {
      localStorage.removeItem('ronak_wishlist');
      localStorage.removeItem('ronaq_wishlist');
    } catch (e) {
      console.error(e);
    }
  };

  const isInWishlist = (productId) => {
    if (!productId) return false;
    const strId = String(productId);
    return wishlist.some(id => String(id) === strId);
  };

  // Resolve full product objects from catalog or backend
  const wishlistProducts = useMemo(() => {
    return wishlist.map(id => {
      const match = PRODUCTS.find(p => String(p.id) === String(id) || String(p.slug) === String(id) || String(p.dbId) === String(id));
      if (match) return match;

      const backendMatch = backendItems.find(item => 
        String(item.product_details?.slug) === String(id) || 
        String(item.product_details?.id) === String(id) || 
        String(item.product) === String(id)
      );

      if (backendMatch?.product_details) {
        const pd = backendMatch.product_details;
        return {
          id: pd.slug || String(pd.id),
          dbId: pd.id,
          name: pd.name,
          brand: pd.brand?.name || 'Ronak Luxury',
          brandSlug: pd.brand?.slug || 'ronak',
          price: parseFloat(pd.price || 0),
          image: pd.image || (pd.images && pd.images[0]?.image_url) || '',
          category: pd.category?.name || 'Luxury',
          rating: 5.0,
          reviewsCount: 1,
          isNewArrival: false,
          isBestSeller: false
        };
      }

      return null;
    }).filter(Boolean);
  }, [wishlist, backendItems]);

  return (
    <WishlistContext.Provider value={{
      wishlist,
      wishlistProducts,
      toggleWishlist,
      removeFromWishlist,
      clearWishlist,
      isInWishlist,
      totalWishlist: wishlist.length,
      refetchWishlist: fetchWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);

