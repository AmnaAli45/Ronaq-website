import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import {
  Package,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  Copy,
  Check,
  ChevronRight,
  Eye,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Phone,
  Mail
} from 'lucide-react';

const STATUS_CONFIG = {
  CONFIRMED: { label: 'Order Confirmed', step: 1, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  PACKED: { label: 'Processing & Packed', step: 2, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  SHIPPED: { label: 'Out For Delivery (In Transit)', step: 3, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200' },
  DELIVERED: { label: 'Delivered Successfully', step: 4, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  CANCELLED: { label: 'Order Cancelled', step: 0, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
  RETURNED: { label: 'Order Returned', step: 0, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
  PENDING: { label: 'Order Placed (Pending)', step: 1, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
};

export const CustomerOrdersPage = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const [orderNumberInput, setOrderNumberInput] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [myOrders, setMyOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [selectedModalOrder, setSelectedModalOrder] = useState(null);

  // Fetch logged in customer's order history
  const fetchMyOrders = async () => {
    if (!isAuthenticated) return;
    setLoadingOrders(true);
    try {
      const res = await ordersAPI.getOrders();
      const orderList = Array.isArray(res.data) ? res.data : res.data.results || [];
      setMyOrders(orderList);
      // Auto-select first order if available
      if (orderList.length > 0 && !trackedOrder) {
        setTrackedOrder(orderList[0]);
      }
    } catch (err) {
      console.error('Failed to load user orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyOrders();
    }
  }, [isAuthenticated]);

  // Read URL query params (e.g. ?order=RNQ-1234)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryOrder = params.get('order') || params.get('order_number');
    if (queryOrder) {
      setOrderNumberInput(queryOrder);
      handleTrackSubmit(null, queryOrder);
    }
  }, [location.search]);

  const handleTrackSubmit = async (e, directOrderNum = null) => {
    if (e) e.preventDefault();
    const queryNum = directOrderNum || orderNumberInput.trim();
    if (!queryNum) {
      setSearchError('Please enter your Order Reference Number (e.g. RNQ-ADC7697F).');
      return;
    }

    setTrackingLoading(true);
    setSearchError('');
    try {
      const res = await ordersAPI.trackOrder({ order_number: queryNum });
      setTrackedOrder(res.data.order);
      // Scroll to track result
      const trackSection = document.getElementById('tracking-result-section');
      if (trackSection) {
        trackSection.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Track error:', err);
      setSearchError(err.response?.data?.error || `No matching order found for '${queryNum}'. Please verify your Order Reference Number.`);
      setTrackedOrder(null);
    } finally {
      setTrackingLoading(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStepProgress = (orderStatus) => {
    const st = STATUS_CONFIG[orderStatus] || STATUS_CONFIG.CONFIRMED;
    return st.step;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-28">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Ronak Customer Care</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight">
            Track Your Luxury Orders
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Real-time fulfillment tracking from our warehouse dispatch to your doorstep with Cash on Delivery verification.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 space-y-8">
        
        {/* Track Order Search Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100">
          <form onSubmit={(e) => handleTrackSubmit(e)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Enter Order Reference Number *
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                  <Package className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. RNQ-ADC7697F or ADC7697F"
                    value={orderNumberInput}
                    onChange={(e) => setOrderNumberInput(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={trackingLoading}
                  className="py-3.5 px-8 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-98 text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all shrink-0 disabled:opacity-50"
                >
                  {trackingLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Search className="w-4 h-4" /> Track Order
                    </>
                  )}
                </button>
              </div>
            </div>

            {searchError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{searchError}</span>
              </div>
            )}
          </form>
        </div>

        {/* Live Tracked Order Display */}
        {trackedOrder && (
          <div id="tracking-result-section" className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 space-y-8 animate-fade-in">
            {/* Header / Reference */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 block mb-1">
                  Active Shipment Status
                </span>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-serif font-black text-slate-900">
                    Order #{trackedOrder.order_number}
                  </h2>
                  <button
                    onClick={() => copyToClipboard(trackedOrder.order_number, 'track_copy')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Copy Order Reference"
                  >
                    {copiedId === 'track_copy' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Placed on {new Date(trackedOrder.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <span className={`px-4 py-2 rounded-2xl text-xs font-extrabold border ${
                  STATUS_CONFIG[trackedOrder.status]?.bg || 'bg-amber-50'
                } ${STATUS_CONFIG[trackedOrder.status]?.color || 'text-amber-700'} ${
                  STATUS_CONFIG[trackedOrder.status]?.border || 'border-amber-200'
                }`}>
                  ● {trackedOrder.status_display || trackedOrder.status}
                </span>
              </div>
            </div>

            {/* 4-Stage Visual Fulfillment Timeline */}
            <div className="py-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                Fulfillment Timeline
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
                {[
                  {
                    step: 1,
                    title: 'Order Confirmed',
                    desc: 'Received & Verified',
                    icon: CheckCircle2,
                    isDone: getStepProgress(trackedOrder.status) >= 1 && trackedOrder.status !== 'CANCELLED',
                    isCurrent: trackedOrder.status === 'CONFIRMED' || trackedOrder.status === 'PENDING'
                  },
                  {
                    step: 2,
                    title: 'Processing & Packing',
                    desc: 'Warehouse Prep',
                    icon: Package,
                    isDone: getStepProgress(trackedOrder.status) >= 2 && trackedOrder.status !== 'CANCELLED',
                    isCurrent: trackedOrder.status === 'PACKED'
                  },
                  {
                    step: 3,
                    title: 'Out For Delivery',
                    desc: 'Courier Dispatch',
                    icon: Truck,
                    isDone: getStepProgress(trackedOrder.status) >= 3 && trackedOrder.status !== 'CANCELLED',
                    isCurrent: trackedOrder.status === 'SHIPPED'
                  },
                  {
                    step: 4,
                    title: 'Delivered',
                    desc: 'Cash Collected (COD)',
                    icon: CheckCircle2,
                    isDone: getStepProgress(trackedOrder.status) >= 4 && trackedOrder.status !== 'CANCELLED',
                    isCurrent: trackedOrder.status === 'DELIVERED'
                  },
                ].map((st) => {
                  const Icon = st.icon;
                  return (
                    <div
                      key={st.step}
                      className={`p-4 rounded-2xl border text-center transition-all ${
                        st.isCurrent
                          ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/30'
                          : st.isDone
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                          : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2.5 ${
                        st.isCurrent
                          ? 'bg-amber-600 text-white animate-pulse'
                          : st.isDone
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-400'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-xs text-slate-900">{st.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{st.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Destination & Payment Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Delivery Destination
                </span>
                <p className="font-bold text-slate-900 text-sm">{trackedOrder.shipping_full_name}</p>
                <p className="text-slate-600">{trackedOrder.shipping_address}</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300 text-[11px]">
                    📍 {trackedOrder.city}
                  </span>
                  <span className="text-slate-500 font-medium">{trackedOrder.shipping_phone}</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Payment Details
                </span>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Payment Method:</span>
                  <span className="font-bold text-slate-900">Cash on Delivery (COD)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Payment Status:</span>
                  <span className={`font-bold px-2 py-0.5 rounded-lg text-[10px] uppercase tracking-wider ${
                    trackedOrder.payment_status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {trackedOrder.payment_status === 'PAID' ? '✓ Paid' : 'Cash Payable at Door'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-sm">
                  <span className="font-bold text-slate-900">Total Payable:</span>
                  <span className="font-serif font-black text-amber-800 text-base">
                    Rs. {Number(trackedOrder.total_amount || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Ordered Items Preview */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Purchased Luxury Items ({(trackedOrder.items || []).length})
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                {(trackedOrder.items || []).map((item, i) => (
                  <div key={item.id || i} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.product_name}
                          className="w-12 h-12 rounded-lg object-cover bg-slate-100 border border-slate-200"
                        />
                      )}
                      <div>
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                          {item.brand_name || 'Ronak'}
                        </span>
                        <p className="font-bold text-slate-900">{item.product_name}</p>
                        <p className="text-[11px] text-slate-500">
                          Size/Variant: {item.variant_name} • Qty: {item.quantity} × Rs. {Number(item.unit_price || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className="font-black text-slate-900">
                      Rs. {Number(item.total_price || (item.unit_price * item.quantity) || 0).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Customer Account Order History (If Logged In) */}
        {isAuthenticated && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 block mb-0.5">
                  My Orders History
                </span>
                <h3 className="text-xl font-serif font-bold text-slate-900">
                  Your Account Orders ({myOrders.length})
                </h3>
              </div>
              <button
                onClick={fetchMyOrders}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Refresh Orders"
              >
                <RefreshCw className={`w-4 h-4 ${loadingOrders ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loadingOrders ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-400">Loading your orders...</p>
              </div>
            ) : myOrders.length === 0 ? (
              <div className="p-8 text-center space-y-3 bg-slate-50 rounded-2xl border border-slate-200">
                <Package className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="font-bold text-sm text-slate-700">No orders placed yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  When you place orders on Ronak, Velora, Elan, or Stryde, you will be able to track live delivery status right here.
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-amber-700 transition-colors"
                >
                  Start Shopping <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                {myOrders.map((ord) => {
                  const st = STATUS_CONFIG[ord.status] || STATUS_CONFIG.CONFIRMED;
                  const isSelected = trackedOrder?.id === ord.id;
                  const itemsCount = (ord.items || []).reduce((acc, it) => acc + (it.quantity || 1), 0);

                  return (
                    <div
                      key={ord.id}
                      className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                        isSelected ? 'bg-amber-50/50' : 'hover:bg-slate-50/70'
                      }`}
                    >
                      {/* Left info */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-amber-800">
                            #{ord.order_number}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${st.bg} ${st.color} ${st.border}`}>
                            ● {ord.status_display || ord.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {new Date(ord.created_at).toLocaleDateString()} • {itemsCount} {itemsCount === 1 ? 'item' : 'items'} • Destination: <strong className="text-slate-700">{ord.city}</strong>
                        </p>
                      </div>

                      {/* Right total & actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <div className="text-right">
                          <span className="font-serif font-black text-base text-slate-900 block">
                            Rs. {Number(ord.total_amount || 0).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            COD Payment
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            setTrackedOrder(ord);
                            const trackSection = document.getElementById('tracking-result-section');
                            if (trackSection) trackSection.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                            isSelected
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-900 text-white hover:bg-amber-700'
                          }`}
                        >
                          <Truck className="w-3.5 h-3.5" /> Track Live
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}


      </div>
    </div>
  );
};
