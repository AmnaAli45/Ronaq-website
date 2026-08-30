import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI, catalogAPI, ordersAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const DEFAULT_CITIES = [
  'Lahore',
  'Multan',
  'Faisalabad',
  'Gojra',
  'Shahkot',
  'Shukhupura',
  'Sahiwal',
  'Karachi',
  'Islamabad',
  'Rawalpindi'
];

export const ALLOWED_CITIES = DEFAULT_CITIES;


export const COUPONS = {
  'RONAK10': { discount: 0.10, label: '10% OFF Storewide' },
  'RONAQ10': { discount: 0.10, label: '10% OFF Storewide' },
  'VELORA20': { discount: 0.20, label: '20% OFF Velora Skincare' },
  'ELAN15': { discount: 0.15, label: '15% OFF Elan Luxury' },
  'STRYDE15': { discount: 0.15, label: '15% OFF Stryde Footwear' },
  'WELCOME10': { discount: 0.10, label: '10% OFF Welcome Bonus' },
  'LUXURY25': { discount: 0.25, label: '25% OFF Luxury VIP' },
  'SAVE20': { discount: 0.20, label: '20% OFF Special Discount' },
  'RONAK50': { discount: 0.50, label: '50% OFF Mega Promo' },
  'RONAQ50': { discount: 0.50, label: '50% OFF Mega Promo' }
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(() => {
    try {
      const localData = localStorage.getItem('ronak_cart') || localStorage.getItem('ronaq_cart');
      return localData ? JSON.parse(localData) : [];
    } catch {
      return [];
    }
  });

  const [dbCart, setDbCart] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState(() => {
    try {
      return localStorage.getItem('ronak_coupon_code') || localStorage.getItem('ronaq_coupon_code') || '';
    } catch {
      return '';
    }
  });
  const [discountPercent, setDiscountPercent] = useState(() => {
    try {
      const savedCode = localStorage.getItem('ronak_coupon_code') || localStorage.getItem('ronaq_coupon_code') || '';
      return COUPONS[savedCode]?.discount || 0;
    } catch {
      return 0;
    }
  });
  const [couponError, setCouponError] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [allowedCities, setAllowedCities] = useState(DEFAULT_CITIES);

  // Fetch active delivery cities from backend
  const fetchDeliveryCities = useCallback(async () => {
    try {
      const res = await ordersAPI.getDeliveryCities();
      const items = Array.isArray(res.data) ? res.data : res.data.results || [];
      if (items && items.length > 0) {
        const cityNames = items.filter(c => c.is_active !== false).map(c => c.name);
        if (cityNames.length > 0) {
          setAllowedCities(cityNames);
        }
      }
    } catch (err) {
      console.warn('Could not fetch delivery cities, using defaults:', err);
    }
  }, []);

  useEffect(() => {
    fetchDeliveryCities();
  }, [fetchDeliveryCities]);

  // Keep localStorage continuously updated as a reliable persistent backup
  useEffect(() => {

    try {
      localStorage.setItem('ronak_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart to localStorage:', e);
    }
  }, [cart]);

  const fetchBackendCart = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await cartAPI.getCart();
      setDbCart(res.data);
      const backendItems = (res.data?.items || []).map(item => ({
        cartItemId: `db-${item.id}`,
        backendId: item.id,
        variantId: item.variant,
        product: {
          id: item.product_slug,
          dbId: item.product_id,
          name: item.product_name,
          brand: item.brand,
          brandSlug: item.brand_slug,
          price: parseFloat(item.unit_price),
          image: item.image
        },
        variant: item.size_or_shade,
        quantity: item.quantity,
        price: parseFloat(item.unit_price)
      }));

      // If backend has items, set cart to backend items
      if (backendItems.length > 0) {
        setCart(backendItems);
      } else {
        // If backend is empty, only clear cart if local cart was also empty
        const localData = localStorage.getItem('ronak_cart') || localStorage.getItem('ronaq_cart');
        const localItems = localData ? JSON.parse(localData) : [];
        if (!localItems || localItems.length === 0) {
          setCart([]);
        }
      }
    } catch (err) {
      console.error('Error fetching backend cart:', err);
    }
  }, [isAuthenticated]);

  // Sync local cart items to backend cart safely when user logs in
  useEffect(() => {
    let isMounted = true;
    const syncLocalCartToBackend = async () => {
      if (isAuthenticated) {
        try {
          const localData = localStorage.getItem('ronak_cart') || localStorage.getItem('ronaq_cart');
          const localItems = localData ? JSON.parse(localData) : [];
          if (localItems.length > 0) {
            // First fetch current backend items to avoid duplicates
            const currentBackend = await cartAPI.getCart().catch(() => ({ data: { items: [] } }));
            const existingBackendVariants = new Set((currentBackend.data?.items || []).map(it => it.variant));

            for (const item of localItems) {
              try {
                let variantId = item.variantId;
                if (!variantId && (item.product?.id || item.product?.slug || item.product?.dbId)) {
                  const identifier = item.product?.id || item.product?.slug || item.product?.dbId;
                  const prodRes = await catalogAPI.getProductBySlug(identifier);
                  const variants = prodRes.data?.variants || [];
                  const matched = variants.find(v => v.size_or_shade === item.variant) || variants[0];
                  if (matched) variantId = matched.id;
                }
                if (variantId && !existingBackendVariants.has(variantId)) {
                  await cartAPI.addToCart(variantId, item.quantity);
                  existingBackendVariants.add(variantId);
                }
              } catch (itemErr) {
                console.warn('Error syncing item to backend cart:', itemErr);
              }
            }
          }
        } catch (e) {
          console.error('Error in syncLocalCartToBackend:', e);
        }
        if (isMounted) {
          await fetchBackendCart();
        }
      }
    };

    syncLocalCartToBackend();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, fetchBackendCart]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const addToCart = async (product, selectedVariant = null, quantity = 1) => {
    const variantStr = selectedVariant || (product.shadesOrSizes ? product.shadesOrSizes[0] : (product.variants?.[0]?.size_or_shade || 'Standard'));
    let resolvedVariantId = product.variantId || null;

    if (product.variants && product.variants.length > 0) {
      const matchedVariant = product.variants.find(v => v.size_or_shade === variantStr) || product.variants[0];
      resolvedVariantId = matchedVariant?.id;
    }

    const cartItemId = `${product.id || product.slug || product.name}-${variantStr}`;

    // Optimistically update local cart state immediately so items are never missing
    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(item => item.cartItemId === cartItemId || (resolvedVariantId && item.variantId === resolvedVariantId));
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          variantId: resolvedVariantId || updated[existingIndex].variantId,
          quantity: updated[existingIndex].quantity + quantity
        };
        return updated;
      } else {
        return [
          ...prevCart,
          {
            cartItemId,
            variantId: resolvedVariantId,
            product,
            variant: variantStr,
            quantity,
            price: product.price
          }
        ];
      }
    });

    showToast(`Added "${product.name}" (${variantStr}) to your cart!`);
    setIsCartOpen(true);

    if (isAuthenticated) {
      if (!resolvedVariantId && (product.id || product.slug || product.dbId)) {
        try {
          const prodRes = await catalogAPI.getProductBySlug(product.id || product.slug || product.dbId);
          const variants = prodRes.data?.variants || [];
          const matchedVariant = variants.find(v => v.size_or_shade === variantStr) || variants[0];
          resolvedVariantId = matchedVariant?.id;
        } catch (fetchErr) {
          console.warn('Could not fetch variants for adding to cart:', fetchErr);
        }
      }

      if (resolvedVariantId) {
        try {
          await cartAPI.addToCart(resolvedVariantId, quantity);
          await fetchBackendCart();
        } catch (err) {
          console.warn('Backend addToCart sync failed:', err);
        }
      }
    }
  };

  const removeFromCart = async (cartItemId) => {
    const target = cart.find(item => item.cartItemId === cartItemId);
    setCart(prevCart => prevCart.filter(item => item.cartItemId !== cartItemId));
    if (isAuthenticated && target && target.backendId) {
      try {
        await cartAPI.removeCartItem(target.backendId);
        await fetchBackendCart();
      } catch (err) {
        console.error('Failed to remove item from backend cart:', err);
      }
    }
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    const target = cart.find(item => item.cartItemId === cartItemId);
    setCart(prevCart =>
      prevCart.map(item =>
        item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
      )
    );

    if (isAuthenticated && target && target.backendId) {
      try {
        await cartAPI.updateCartItem(target.backendId, newQuantity);
        await fetchBackendCart();
      } catch (err) {
        showToast(err.response?.data?.error || 'Failed to update quantity');
      }
    }
  };

  const clearCart = async () => {
    setCart([]);
    setDiscountPercent(0);
    setCouponCode('');
    try {
      localStorage.removeItem('ronak_coupon_code');
      localStorage.removeItem('ronak_cart');
      localStorage.removeItem('ronaq_coupon_code');
      localStorage.removeItem('ronaq_cart');
    } catch (e) {
      console.error(e);
    }
    if (isAuthenticated) {
      try {
        await cartAPI.clearCart();
      } catch (err) {
        console.error('Failed to clear backend cart:', err);
      }
    }
  };

  const applyCoupon = (code) => {
    const formatted = (code || '').trim().toUpperCase();
    if (COUPONS[formatted]) {
      const discountVal = COUPONS[formatted].discount;
      setDiscountPercent(discountVal);
      setCouponCode(formatted);
      setCouponError('');
      try {
        localStorage.setItem('ronak_coupon_code', formatted);
      } catch (e) {
        console.error(e);
      }
      showToast(`🎉 Promo code "${formatted}" applied! Saved ${(discountVal * 100)}% (${COUPONS[formatted].label})`);
      return true;
    } else {
      setCouponError('Invalid or expired promo code. Please check and try again.');
      return false;
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setDiscountPercent(0);
    setCouponError('');
    try {
      localStorage.removeItem('ronak_coupon_code');
      localStorage.removeItem('ronaq_coupon_code');
    } catch (e) {
      console.error(e);
    }
    showToast('Promo code removed.');
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discount = subtotal * discountPercent;
  const shipping = subtotal >= 2999 || subtotal === 0 ? 0 : 250;
  const total = subtotal - discount + shipping;
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);


  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isCartOpen,
      setIsCartOpen,
      subtotal,
      discount,
      shipping,
      total,
      totalItems,
      couponCode,
      discountPercent,
      couponError,
      applyCoupon,
      removeCoupon,
      toastMessage,
      showToast,
      refetchCart: fetchBackendCart,
      allowedCities,
      refreshDeliveryCities: fetchDeliveryCities
    }}>
      {children}
    </CartContext.Provider>

  );
};

export const useCart = () => useContext(CartContext);
