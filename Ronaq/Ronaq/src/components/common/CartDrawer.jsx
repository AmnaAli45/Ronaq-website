import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Tag, ShieldCheck, Check } from 'lucide-react';

export const CartDrawer = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    discount,
    shipping,
    total,
    totalItems,
    couponCode,
    applyCoupon,
    removeCoupon,
    couponError
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');
  const [checkoutStep, setCheckoutStep] = useState(false);
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (inputCoupon.trim()) {
      applyCoupon(inputCoupon);
      setInputCoupon('');
    }
  };

  const freeShippingGoal = 2999.00;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingGoal) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-full sm:max-w-md bg-white shadow-2xl flex flex-col">

          {/* Header */}
          <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold tracking-wide">Your Ronak Cart</h2>
              <span className="bg-amber-500/20 text-amber-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-500/30">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free shipping banner */}
          <div className="bg-amber-50 border-b border-amber-100 p-3.5 px-5">
            {subtotal >= freeShippingGoal ? (
              <p className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>You've unlocked <strong className="text-emerald-700 uppercase">FREE Delivery!</strong></span>
              </p>
            ) : (
              <div>
                <p className="text-xs text-amber-900 font-medium mb-1.5">
                  Add <strong className="font-bold text-amber-950">Rs. {Number(freeShippingGoal - subtotal).toLocaleString()}</strong> more to get <span className="font-bold text-emerald-700">FREE Shipping!</span>
                </p>
                <div className="w-full h-1.5 bg-amber-200/70 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${progressToFreeShipping}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cart items list */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">Your cart is empty</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mb-6">
                  Explore our sub-brands Velora, Elan, and Stryde to add premium products to your cart.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-amber-600 transition-colors shadow-md"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.cartItemId}
                  className="flex gap-4 p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 transition-all relative group"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-lg bg-white shrink-0"
                  />
                  <div className="flex-1 min-w-0 pr-6">
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                      {item.product.brand}
                    </span>
                    <h4 className="text-xs font-bold text-slate-800 truncate mb-1">
                      {item.product.name}
                    </h4>
                    <p className="text-xs text-slate-500 mb-2">Option: <span className="font-semibold text-slate-700">{item.variant}</span></p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          className="p-1 hover:text-amber-600 text-slate-500 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-slate-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          className="p-1 hover:text-amber-600 text-slate-500 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-slate-900">
                        Rs. {Number(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.cartItemId)}
                    className="absolute top-3 right-3 text-slate-300 hover:text-rose-600 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer calculation */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-slate-50">
              {/* Promo code */}
              {couponCode ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 px-3 mb-3 text-xs">
                  <span className="font-semibold text-emerald-800 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" /> Code <strong>{couponCode}</strong> applied
                  </span>
                  <button onClick={removeCoupon} className="text-emerald-700 hover:text-emerald-900 font-bold underline">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    value={inputCoupon}
                    onChange={(e) => setInputCoupon(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 uppercase"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-amber-600 transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && <p className="text-[11px] text-rose-600 mb-2">{couponError}</p>}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-800">Rs. {Number(subtotal).toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount</span>
                    <span>-Rs. {Number(discount).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span>{shipping === 0 ? <strong className="text-emerald-600 uppercase">FREE</strong> : `Rs. ${Number(shipping).toLocaleString()}`}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total</span>
                  <span className="text-amber-700">Rs. {Number(total).toLocaleString()}</span>
                </div>
              </div>


              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/cart');
                  }}
                  className="py-3 px-4 rounded-xl border border-slate-300 text-slate-800 text-xs font-bold uppercase tracking-wider hover:bg-slate-200 transition-colors text-center"
                >
                  View Cart Page
                </button>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/cart');
                  }}
                  className="py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-amber-600/20 text-center flex items-center justify-center gap-1.5"
                >
                  Checkout <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 256-Bit SSL Encrypted & Guaranteed Safe Checkout
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
