import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import {
  CheckCircle2,
  Package,
  MapPin,
  Calendar,
  CreditCard,
  Truck,
  ArrowRight,
  Printer,
  ShoppingBag,
  Clock,
  Sparkles,
  ShieldCheck,
  Copy,
  Check
} from 'lucide-react';

export const OrderConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [order, setOrder] = useState(() => {
    if (location.state?.order) return location.state.order;
    try {
      const saved = localStorage.getItem('last_placed_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (location.state?.order) {
      setOrder(location.state.order);
      localStorage.setItem('last_placed_order', JSON.stringify(location.state.order));
      return;
    }

    if (id) {
      setLoading(true);
      ordersAPI.getOrderDetails(id)
        .then(res => {
          setOrder(res.data);
          localStorage.setItem('last_placed_order', JSON.stringify(res.data));
        })
        .catch(err => console.error('Failed to load order by id:', err))
        .finally(() => setLoading(false));
    } else if (!order) {
      // Try fetching latest order from user account
      setLoading(true);
      ordersAPI.getOrders()
        .then(res => {
          const list = Array.isArray(res.data) ? res.data : res.data.results || [];
          if (list.length > 0) {
            setOrder(list[0]);
            localStorage.setItem('last_placed_order', JSON.stringify(list[0]));
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id, location.state]);

  const handleCopyOrderNumber = () => {
    if (order?.order_number) {
      navigator.clipboard.writeText(order.order_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Retrieving your order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center space-y-5">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-700">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-slate-900">No Recent Order Found</h2>
        <p className="text-xs text-slate-500 max-w-md">
          We could not locate an active order receipt. Please check your email or visit your shopping cart to explore our luxury collections.
        </p>
        <Link
          to="/"
          className="px-6 py-3 rounded-full bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-amber-700 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  const items = order.items || [];
  const subtotal = parseFloat(order.subtotal || 0);
  const discount = parseFloat(order.discount || 0);
  const shippingFee = parseFloat(order.shipping_fee || 0);
  const totalAmount = parseFloat(order.total_amount || 0);
  const orderDate = order.created_at ? new Date(order.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* HERO SUCCESS BANNER */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-amber-500/20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
              ✨ Order Placed Successfully
            </span>

            <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-white">
              Thank You For Your Order!
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
              Your luxury order has been received and confirmed. We are packing your items with care for dispatch to your doorstep.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 text-xs font-semibold">
                <span className="text-slate-400">Order Reference:</span>
                <strong className="text-amber-300 font-mono tracking-wider">{order.order_number}</strong>
                <button
                  onClick={handleCopyOrderNumber}
                  className="p-1 text-slate-300 hover:text-white transition-colors"
                  title="Copy Order Reference"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-2xl border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Status: {order.status_display || order.status || 'Confirmed'}
              </span>
            </div>
          </div>
        </div>

        {/* ORDER PROGRESS TIMELINE */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-6 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" /> Fulfillment Timeline
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative">
            <div className="space-y-1 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                <Check className="w-5 h-5" />
              </div>
              <p className="font-bold text-xs text-slate-900 pt-1">Order Confirmed</p>
              <p className="text-[10px] text-slate-400">Received & Verified</p>
            </div>

            <div className="space-y-1 text-center">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 border-2 border-amber-500 flex items-center justify-center mx-auto shadow-md">
                <Package className="w-5 h-5" />
              </div>
              <p className="font-bold text-xs text-slate-900 pt-1">Processing & Packing</p>
              <p className="text-[10px] text-slate-400">Warehouse Prep</p>
            </div>

            <div className="space-y-1 text-center">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Truck className="w-5 h-5" />
              </div>
              <p className="font-semibold text-xs text-slate-400 pt-1">Out For Delivery</p>
              <p className="text-[10px] text-slate-400">Courier Dispatch</p>
            </div>

            <div className="space-y-1 text-center">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="font-semibold text-xs text-slate-400 pt-1">Delivered</p>
              <p className="text-[10px] text-slate-400">Cash Collected (COD)</p>
            </div>
          </div>
        </div>

        {/* ORDER DETAILS & ITEMS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left 2 Cols: Items & Shipping */}
          <div className="lg:col-span-2 space-y-6">

            {/* Ordered Items Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-amber-600" />
                  Purchased Items ({items.reduce((acc, it) => acc + (it.quantity || 1), 0)})
                </h3>
                <span className="text-xs text-slate-400">{orderDate}</span>
              </div>

              <div className="divide-y divide-slate-100">
                {items.map((item, idx) => (
                  <div key={item.id || idx} className="p-5 flex items-center gap-4">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.product_name}
                        className="w-16 h-16 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                    )}

                    <div className="flex-grow space-y-0.5">
                      <div className="flex items-center gap-2">
                        {item.brand_name && (
                          <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            {item.brand_name}
                          </span>
                        )}
                        {item.variant_name && (
                          <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {item.variant_name}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{item.product_name}</h4>
                      <p className="text-[11px] text-slate-500 font-semibold">
                        Quantity: {item.quantity} × Rs. {Number(item.unit_price || 0).toLocaleString()}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-sm text-slate-900">
                        Rs. {Number(item.total_price || (item.unit_price * item.quantity) || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Destination & Contact Details */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-3">
                <MapPin className="w-4 h-4 text-amber-600" /> Delivery Address & Recipient
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recipient</span>
                  <p className="font-bold text-slate-900">{order.shipping_full_name}</p>
                  <p className="text-slate-600">{order.shipping_phone}</p>
                  <p className="text-slate-600">{order.shipping_email}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Shipping Address</span>
                  <p className="font-semibold text-slate-800">{order.shipping_address}</p>
                  <p className="font-bold text-amber-800 flex items-center gap-1 mt-1">
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-black">
                      {order.city}
                    </span>
                    {order.postal_code && <span className="text-slate-500">({order.postal_code})</span>}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
                <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Estimated Doorstep Delivery: <strong>2 - 4 Business Days</strong></span>
              </div>
            </div>

          </div>

          {/* Right Col: Payment Summary & Next Steps */}
          <div className="space-y-6">

            {/* Payment Breakdown Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-3">
                Payment Summary
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">Rs. {Number(subtotal).toLocaleString()}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50/70 p-2 rounded-xl border border-emerald-100">
                    <span>Discount Applied</span>
                    <span>-Rs. {Number(discount).toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charges</span>
                  <span className="font-semibold text-slate-900">
                    {shippingFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `Rs. ${Number(shippingFee).toLocaleString()}`}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider block text-amber-800">
                    Payment Method
                  </span>
                  <p className="font-extrabold text-xs flex items-center gap-1.5">
                    💵 Cash on Delivery (COD)
                  </p>
                  <p className="text-[10px] text-amber-700">
                    Please keep exact cash ready upon parcel arrival.
                  </p>
                </div>

                <div className="flex justify-between text-base font-extrabold text-slate-900 pt-3 border-t border-slate-200">
                  <span>Amount to Pay at Doorstep</span>
                  <span className="text-amber-700 text-xl font-serif font-black">Rs. {Number(totalAmount).toLocaleString()}</span>
                </div>
              </div>
            </div>


            {/* Actions Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <Link
                to={`/track-order?order=${order.order_number || ''}`}
                className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <Truck className="w-4 h-4" /> Track This Order Live
              </Link>

              <button
                onClick={handlePrint}
                className="w-full py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Printer className="w-4 h-4" /> Print / Save Order Receipt
              </button>

              <Link
                to="/"
                className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                Continue Shopping <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Security Guarantee Badge */}
            <div className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Ronak 100% Genuine Luxury Assurance
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
