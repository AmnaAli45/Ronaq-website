import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart, ALLOWED_CITIES, COUPONS } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import { AuthModal } from '../components/common/AuthModal';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Tag,
  CheckCircle2,
  Truck,
  RotateCcw,
  Sparkles,
  Lock,
  MapPin,
  Banknote,
  CheckSquare,
  Square,
  AlertCircle,
  ChevronRight,
  Edit3,
  Heart
} from 'lucide-react';

export const CartPage = () => {
  const {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    discount,
    shipping,
    total,
    totalItems,
    couponCode,
    discountPercent,
    applyCoupon,
    removeCoupon,
    couponError,
    showToast,
    allowedCities = ALLOWED_CITIES
  } = useCart();

  const { wishlistProducts, removeFromWishlist } = useWishlist();

  const { user, isAuthenticated } = useAuth();
  const [inputCoupon, setInputCoupon] = useState('');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('form'); // 'form' | 'confirm'
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDataResponse, setOrderDataResponse] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [addressConfirmed, setAddressConfirmed] = useState(true);

  const [shippingForm, setShippingForm] = useState({
    shipping_full_name: '',
    shipping_email: '',
    shipping_phone: '',
    shipping_address: '',
    city: 'Lahore',
    postal_code: '',
    payment_method: 'COD'
  });

  useEffect(() => {
    if (user) {
      const activeList = allowedCities || ALLOWED_CITIES;
      setShippingForm(prev => ({
        ...prev,
        shipping_full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || (user.email ? user.email.split('@')[0] : ''),
        shipping_email: user.email || '',
        shipping_phone: user.phone_number || '',
        shipping_address: user.address || '',
        city: user.city && activeList.includes(user.city) ? user.city : (activeList[0] || 'Lahore'),
        payment_method: 'COD'
      }));
    }
  }, [user, allowedCities]);

  const navigate = useNavigate();

  const freeShippingGoal = 2500.00;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingGoal) * 100);


  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (inputCoupon.trim()) {
      applyCoupon(inputCoupon);
      setInputCoupon('');
    }
  };

  const handleShippingChange = (e) => {
    setShippingForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleOpenCheckout = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    setCheckoutStep('form');
    setCheckoutError('');
    setIsCheckoutModalOpen(true);
  };

  const handleProceedToConfirmation = (e) => {
    e.preventDefault();
    const activeList = allowedCities || ALLOWED_CITIES;
    if (!shippingForm.shipping_full_name.trim()) {
      setCheckoutError('Please enter your full name.');
      return;
    }
    if (!shippingForm.shipping_email.trim()) {
      setCheckoutError('Please enter your email address.');
      return;
    }
    if (!shippingForm.shipping_phone.trim()) {
      setCheckoutError('Please enter your phone number.');
      return;
    }
    if (!shippingForm.shipping_address.trim()) {
      setCheckoutError('Please enter your complete delivery street address.');
      return;
    }
    if (!shippingForm.city || !activeList.some(c => c.toLowerCase() === shippingForm.city.toLowerCase())) {
      setCheckoutError('Please select a valid delivery city.');
      return;
    }

    setCheckoutError('');
    setCheckoutStep('confirm');
  };


  const handlePlaceOrder = async (e) => {
    if (e) e.preventDefault();
    if (!isAuthenticated) {
      setIsCheckoutModalOpen(false);
      setIsAuthModalOpen(true);
      return;
    }

    if (!cart || cart.length === 0) {
      setCheckoutError('Your cart is empty. Please add items to your cart before proceeding.');
      return;
    }

    if (!addressConfirmed) {
      setCheckoutError('Please confirm that your delivery address is accurate before placing your order.');
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError('');

    try {
      const checkoutPayload = {
        shipping_full_name: shippingForm.shipping_full_name.trim(),
        shipping_email: shippingForm.shipping_email.trim(),
        shipping_phone: shippingForm.shipping_phone.trim(),
        shipping_address: shippingForm.shipping_address.trim(),
        city: shippingForm.city,
        postal_code: shippingForm.postal_code || '',
        payment_method: 'COD',
        coupon_code: couponCode || '',
        discount: discount || 0,
        items: cart.map(item => ({
          variant_id: item.variantId || null,
          product_id: item.product?.dbId || (typeof item.product?.id === 'number' ? item.product.id : null),
          product_slug: item.product?.slug || (typeof item.product?.id === 'string' ? item.product.id : null),
          product_name: item.product?.name || item.productName || 'Luxury Item',
          brand_name: item.product?.brand || item.brandName || 'Ronaq Luxury',
          variant_name: item.variant || 'Standard',
          unit_price: item.price,
          quantity: item.quantity,
          image: item.product?.image || ''
        }))
      };

      const res = await ordersAPI.checkout(checkoutPayload);
      const placedOrder = res.data.order;
      setOrderDataResponse(placedOrder);
      setOrderPlaced(true);
      localStorage.setItem('last_placed_order', JSON.stringify(placedOrder));
      clearCart();
      setIsCheckoutModalOpen(false);
      navigate('/order-confirmation', { state: { order: placedOrder } });
    } catch (err) {
      console.error('Checkout error:', err);
      const serverErr = (
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.response?.data?.city?.[0] ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        (err.response?.data && typeof err.response.data === 'object' ? Object.values(err.response.data).flat().join(' ') : null) ||
        'Failed to place order. Please verify that your cart is not empty and items are in stock.'
      );
      setCheckoutError(serverErr);
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">

      {/* Header Banner */}
      <div className="bg-slate-900 text-white py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">
              Ronaq Unified Bag
            </span>
            <h1 className="text-3xl font-serif font-bold">Shopping Cart</h1>
          </div>
          <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30">
            {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {orderPlaced && orderDataResponse ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200 shadow-xl max-w-2xl mx-auto space-y-6">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block">
              ✨ Order Placed Successfully
            </span>
            <h2 className="text-3xl font-serif font-bold text-slate-900">Thank You For Your Order!</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Your order <strong className="text-amber-700 font-extrabold">{orderDataResponse.order_number}</strong> has been received and confirmed.
            </p>
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-xs text-left space-y-2 max-w-lg mx-auto">
              <p>• Delivery To: <strong>{orderDataResponse.shipping_full_name}</strong> ({orderDataResponse.city})</p>
              <p>• Address: <strong>{orderDataResponse.shipping_address}</strong></p>
              <p>• Payment Method: <strong>Cash on Delivery (COD)</strong></p>
              <p>• Total Amount: <strong className="text-amber-800 font-extrabold">${parseFloat(orderDataResponse.total_amount || 0).toFixed(2)}</strong></p>
            </div>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => navigate('/order-confirmation', { state: { order: orderDataResponse } })}
                className="px-6 py-3 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-colors"
              >
                View Full Receipt
              </button>
              <Link
                to="/"
                className="px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Return to Home
              </Link>
            </div>
          </div>
        ) : cart.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-xl mx-auto space-y-4">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-600">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-900">Your Ronaq bag is empty</h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              Explore Velora skincare, Elan fashion, and Stryde shoes to add items to your cart.
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-3">
              <Link
                to="/velora"
                className="px-5 py-2.5 rounded-full bg-amber-700 text-white font-bold text-xs uppercase tracking-wider hover:bg-amber-800 transition-colors"
              >
                Shop Velora
              </Link>
              <Link
                to="/elan"
                className="px-5 py-2.5 rounded-full bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-colors"
              >
                Shop Elan
              </Link>
              <Link
                to="/stryde"
                className="px-5 py-2.5 rounded-full bg-cyan-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-cyan-950 transition-colors"
              >
                Shop Stryde
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left: Cart Items List */}
            <div className="lg:col-span-2 space-y-6">

              {/* Free Shipping Progress Bar */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <span className="flex items-center gap-1.5 text-slate-800">
                    <Truck className="w-4 h-4 text-amber-600" />
                    {subtotal >= freeShippingGoal
                      ? '🎉 You unlocked FREE Express Shipping!'
                      : `Add Rs. ${Number(freeShippingGoal - subtotal).toLocaleString()} more for FREE Express Shipping`}
                  </span>
                  <span className="text-amber-700">{Math.round(progressToFreeShipping)}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500 rounded-full"
                    style={{ width: `${progressToFreeShipping}%` }}
                  />
                </div>
              </div>

              {/* Items Card */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
                {cart.map((item) => (
                  <div key={item.cartItemId} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-3.5 sm:gap-4 group">
                    <div className="flex items-center gap-3.5 w-full sm:w-auto">
                      <img
                        src={item.product?.image || item.image}
                        alt={item.product?.name || item.productName}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                      />
                      <div className="flex-grow min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            {item.product?.brand || item.product?.brandSlug || 'Ronaq Luxury'}
                          </span>
                          {item.variant && (
                            <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              {item.variant}
                            </span>
                          )}
                        </div>
                        <Link to={`/product/${item.product?.id || item.product?.slug || ''}`} className="font-bold text-xs sm:text-sm text-slate-900 hover:text-amber-700 transition-colors block truncate">
                          {item.product?.name || item.productName}
                        </Link>
                        <p className="text-[11px] sm:text-xs font-semibold text-slate-500">
                          Rs. {Number(item.price).toLocaleString()} each
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t border-slate-100/60 sm:border-0">
                      <div className="inline-flex items-center border border-slate-200 rounded-xl bg-slate-50">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          className="p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 sm:px-3 font-bold text-xs text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          className="p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-sm text-slate-900 block">
                          Rs. {Number(item.price * item.quantity).toLocaleString()}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.cartItemId)}
                          className="text-slate-400 hover:text-rose-600 text-[11px] flex items-center gap-1 mt-0.5 ml-auto transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>


              {/* Delivery Coverage Highlight Notice */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-5 flex items-start gap-3.5">
                <MapPin className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 space-y-1">
                  <p className="font-bold text-amber-950">
                    🚚 Exclusive Delivery Coverage in 7 Designated Cities:
                  </p>
                  <p className="text-amber-800">
                    Deliveries are currently available in: <strong className="text-amber-950 font-extrabold">{ALLOWED_CITIES.join(', ')}</strong>.
                  </p>
                </div>
              </div>

            </div>

            {/* Right: Order Summary */}
            <div className="space-y-6">

              {/* Promo Code Box */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-600" /> Apply Promo Code
                </h3>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={inputCoupon}
                    onChange={(e) => setInputCoupon(e.target.value)}
                    placeholder="Enter promo code"
                    className="flex-grow text-xs px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase font-semibold"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </form>

                {couponError && (
                  <p className="text-[11px] text-rose-600 font-semibold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                    {couponError}
                  </p>
                )}

                {couponCode && (
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900">
                    <div>
                      <span className="block text-emerald-800 font-extrabold">🏷️ Promo Applied: {couponCode}</span>
                      <span className="text-[11px] text-emerald-700">{(discountPercent * 100)}% Discount (-Rs. {Number(discount).toLocaleString()})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Summary Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-3">
                  Order Summary
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-900">Rs. {Number(subtotal).toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50/60 p-2 rounded-xl border border-emerald-100">
                      <span>Promo Discount ({couponCode})</span>
                      <span>-Rs. {Number(discount).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Delivery Charges</span>
                    <span className="font-bold text-slate-900">
                      {shipping === 0 ? <span className="text-emerald-600 font-extrabold">FREE</span> : `Rs. ${Number(shipping).toLocaleString()}`}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Payment: <strong className="text-slate-900">Cash on Delivery (COD)</strong></span>
                  </div>

                  <div className="flex justify-between text-base font-extrabold text-slate-900 pt-3 border-t border-slate-200">
                    <span>Total Payable</span>
                    <span className="text-amber-700 text-xl">Rs. {Number(total).toLocaleString()}</span>
                  </div>
                </div>


                <button
                  onClick={handleOpenCheckout}
                  className="w-full py-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Cash on Delivery • 100% Secure Checkout
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Saved in Wishlist Recommendation Section */}
        {wishlistProducts && wishlistProducts.length > 0 && (
          <div className="mt-12 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-500">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-slate-900">Saved in Your Wishlist</h3>
                  <p className="text-xs text-slate-500">Items you previously liked and saved for later</p>
                </div>
              </div>
              <Link
                to="/wishlist"
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
              >
                View Full Wishlist ({wishlistProducts.length}) <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {wishlistProducts.slice(0, 4).map(product => (
                <div
                  key={product.id}
                  className="rounded-2xl border border-slate-200 p-3.5 hover:border-amber-300 hover:shadow-md transition-all bg-white flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 rounded-xl object-cover bg-white shrink-0"
                    />
                    <div className="min-w-0 flex-grow">
                      <span className="text-[10px] font-extrabold uppercase text-amber-800 tracking-wider block">
                        {product.brand || product.brandSlug}
                      </span>
                      <Link
                        to={`/product/${product.id}`}
                        className="font-bold text-xs text-slate-900 hover:text-amber-700 truncate block"
                      >
                        {product.name}
                      </Link>
                      <span className="text-xs font-black text-slate-900 mt-1 block">
                        ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-200/60">
                    <button
                      onClick={() => {
                        addToCart(product);
                        removeFromWishlist(product.id, product.dbId);
                        showToast(`Added "${product.name}" to cart!`);
                      }}
                      className="py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      + Add to Bag
                    </button>
                    <button
                      onClick={() => removeFromWishlist(product.id, product.dbId)}
                      className="py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-500 font-semibold text-[11px] border border-slate-200 transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* 2-Step Checkout Modal with Delivery & Payment Address Confirmation */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative border border-slate-100 max-h-[90vh] overflow-y-auto">
            {orderPlaced ? (
              <div className="text-center space-y-4 py-6">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-slate-900">Order Successfully Placed!</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Thank you for shopping with Ronaq Luxury. Your order ID is <strong className="text-amber-700 font-extrabold">{orderDataResponse?.order_number || '#RNQ-CONFIRMED'}</strong>.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 text-left space-y-1.5">
                  <p className="font-bold">📦 Delivery & Payment Summary:</p>
                  <p>• Delivery To: <strong>{shippingForm.shipping_full_name}</strong> ({shippingForm.city})</p>
                  <p>• Address: <strong>{shippingForm.shipping_address}</strong></p>
                  <p>• Payment Method: <strong>Cash on Delivery (COD)</strong></p>
                  <p>• Total Amount to Pay: <strong className="text-amber-800">${(orderDataResponse?.total_amount || total).toFixed(2)}</strong></p>
                </div>
                <button
                  onClick={() => {
                    setIsCheckoutModalOpen(false);
                    setOrderPlaced(false);
                    navigate('/');
                  }}
                  className="px-6 py-3 rounded-full bg-slate-900 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Back to Ronaq Home
                </button>
              </div>
            ) : (
              <div>
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <div>
                    <h3 className="font-serif font-bold text-xl text-slate-900">
                      {checkoutStep === 'form' ? 'Delivery Details' : 'Confirm Address & Place Order'}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {checkoutStep === 'form' ? 'Step 1 of 2: Shipping Information' : 'Step 2 of 2: Review & Final Confirmation'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCheckoutModalOpen(false)}
                    className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg"
                  >
                    ✕
                  </button>
                </div>

                {checkoutError && (
                  <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{checkoutError}</span>
                  </div>
                )}

                {/* STEP 1: Enter Delivery Details */}
                {checkoutStep === 'form' && (
                  <form onSubmit={handleProceedToConfirmation} className="space-y-4 text-xs">
                    {/* City Restriction Alert */}
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <span>
                        <strong>Deliveries Available Exclusively In:</strong> Lahore, Multan, Faisalabad, Gojra, Shahkot, Shukhupura, and Sahiwal.
                      </span>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                      <input
                        type="text"
                        name="shipping_full_name"
                        required
                        value={shippingForm.shipping_full_name}
                        onChange={handleShippingChange}
                        placeholder="e.g. Amna Ali"
                        className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
                        <input
                          type="email"
                          name="shipping_email"
                          required
                          value={shippingForm.shipping_email}
                          onChange={handleShippingChange}
                          placeholder="name@example.com"
                          className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          name="shipping_phone"
                          required
                          value={shippingForm.shipping_phone}
                          onChange={handleShippingChange}
                          placeholder="e.g. 03001234567"
                          className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Complete Delivery Address *</label>
                      <textarea
                        name="shipping_address"
                        required
                        rows={2}
                        value={shippingForm.shipping_address}
                        onChange={handleShippingChange}
                        placeholder="House / Apartment #, Street, Block, Area"
                        className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Delivery City (Allowed Cities) *</label>
                        <select
                          name="city"
                          required
                          value={shippingForm.city}
                          onChange={handleShippingChange}
                          className="w-full p-3 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                          {(allowedCities || ALLOWED_CITIES).map(cityName => (
                            <option key={cityName} value={cityName}>
                              {cityName}
                            </option>
                          ))}
                        </select>

                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Payment Method</label>
                        <div className="w-full p-3 rounded-xl border border-emerald-200 bg-emerald-50/80 font-bold text-emerald-900 flex items-center gap-2">
                          <Banknote className="w-4 h-4 text-emerald-700" />
                          <span>Cash on Delivery (COD)</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-sm">
                      <span className="font-bold text-slate-700">Total to Pay (COD):</span>
                      <span className="font-extrabold text-amber-700 text-xl">Rs. {Number(total).toLocaleString()}</span>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      Review & Confirm Order Details <ChevronRight className="w-4 h-4" />
                    </button>
                  </form>
                )}

                {/* STEP 2: Delivery & Payment Address Confirmation */}
                {checkoutStep === 'confirm' && (
                  <div className="space-y-5 text-xs">

                    {/* Delivery Destination Confirmation Card */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 relative">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                          <MapPin className="w-4 h-4 text-amber-700" /> Delivery Address Confirmation
                        </span>
                        <button
                          type="button"
                          onClick={() => setCheckoutStep('form')}
                          className="text-amber-700 hover:text-amber-900 font-bold text-[11px] flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" /> Edit
                        </button>
                      </div>
                      <div className="text-slate-700 space-y-1 pt-1 border-t border-slate-200/60">
                        <p><strong className="text-slate-900">Recipient:</strong> {shippingForm.shipping_full_name}</p>
                        <p><strong className="text-slate-900">Phone:</strong> {shippingForm.shipping_phone}</p>
                        <p><strong className="text-slate-900">Email:</strong> {shippingForm.shipping_email}</p>
                        <p><strong className="text-slate-900">Street Address:</strong> {shippingForm.shipping_address}</p>
                        <div className="flex items-center gap-2 pt-1">
                          <strong className="text-slate-900">City:</strong>
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[11px] border border-amber-300">
                            {shippingForm.city}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Confirmation Card */}
                    <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200 flex items-start gap-3">
                      <Banknote className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-emerald-950">Payment Method: Cash on Delivery (COD)</p>
                        <p className="text-[11px] text-emerald-800">
                          No advance payment needed. Pay in cash directly to our delivery courier when your order arrives.
                        </p>
                      </div>
                    </div>

                    {/* Order Price Breakdown */}
                    <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2">
                      <div className="flex justify-between text-slate-600">
                        <span>Items ({totalItems})</span>
                        <span className="font-semibold text-slate-900">Rs. {Number(subtotal).toLocaleString()}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-emerald-700 font-bold">
                          <span>Promo Discount ({couponCode})</span>
                          <span>-Rs. {Number(discount).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-600">
                        <span>Delivery Charges</span>
                        <span className="font-semibold text-slate-900">
                          {shipping === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `Rs. ${Number(shipping).toLocaleString()}`}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                        <span>Total Payable at Doorstep</span>
                        <span className="text-amber-700 text-lg">Rs. {Number(total).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* User Confirmation Checkbox */}
                    <label className="flex items-start gap-2.5 cursor-pointer select-none p-3 rounded-xl bg-amber-50/50 border border-amber-200/80">
                      <input
                        type="checkbox"
                        checked={addressConfirmed}
                        onChange={(e) => setAddressConfirmed(e.target.checked)}
                        className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-[11px] font-semibold text-slate-700">
                        I confirm that my delivery address, contact number, and city (<strong className="text-slate-900">{shippingForm.city}</strong>) are correct and I will pay <strong className="text-amber-700">Rs. {Number(total).toLocaleString()}</strong> in Cash on Delivery.
                      </span>
                    </label>

                    {/* Buttons */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setCheckoutStep('form')}
                        disabled={checkoutLoading}
                        className="w-1/3 py-3.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-colors"
                      >
                        ← Edit
                      </button>

                      <button
                        type="button"
                        onClick={handlePlaceOrder}
                        disabled={checkoutLoading || !addressConfirmed}
                        className="w-2/3 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold uppercase tracking-wider shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {checkoutLoading ? 'Placing Order...' : `Confirm & Place Order (Rs. ${Number(total).toLocaleString()})`}
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal for Unauthenticated Users */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

