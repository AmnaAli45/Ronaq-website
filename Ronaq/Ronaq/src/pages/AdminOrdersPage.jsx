import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import { CityManagementModal } from '../components/admin/CityManagementModal';
import { ReviewManagementModal } from '../components/admin/ReviewManagementModal';
import { AuthModal } from '../components/common/AuthModal';
import {

  Package,
  Search,
  RefreshCw,
  Filter,
  CheckCircle2,
  Truck,
  Clock,
  XCircle,
  AlertCircle,
  Eye,
  MapPin,
  Banknote,
  DollarSign,
  Calendar,
  ShoppingBag,
  ExternalLink,
  ChevronDown,
  ShieldAlert,
  Copy,
  Check,
  Star,

  ArrowLeft,
  Home,
  UserCheck
} from 'lucide-react';

const STATUS_CONFIG = {
  CONFIRMED: { label: 'Confirmed', bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-300', dot: 'bg-amber-500' },
  PACKED: { label: 'Packed', bg: 'bg-indigo-100', text: 'text-indigo-900', border: 'border-indigo-300', dot: 'bg-indigo-500' },
  SHIPPED: { label: 'Shipped', bg: 'bg-cyan-100', text: 'text-cyan-900', border: 'border-cyan-300', dot: 'bg-cyan-500' },
  DELIVERED: { label: 'Delivered', bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-300', dot: 'bg-emerald-500' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-rose-100', text: 'text-rose-900', border: 'border-rose-300', dot: 'bg-rose-500' },
  RETURNED: { label: 'Returned', bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300', dot: 'bg-slate-500' },
  PENDING: { label: 'Pending', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-400' },
};

export const AdminOrdersPage = () => {

  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);



  const isAuthorized = isAuthenticated && (user?.is_staff || user?.is_superuser || user?.role === 'ADMIN' || user?.role === 'STAFF');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await ordersAPI.getAdminOrders(params);
      setOrders(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
      setError(err.response?.data?.detail || 'Failed to load orders. Please verify staff permissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchOrders();
    }
  }, [isAuthorized, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    setSuccessMessage('');
    try {
      const res = await ordersAPI.updateOrderStatus(orderId, { status: newStatus });
      const updatedOrder = res.data.order;

      // Update state locally
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updatedOrder } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, ...updatedOrder }));
      }

      setSuccessMessage(`Order #${updatedOrder.order_number} status updated to ${updatedOrder.status_display || newStatus}! Customer notification email dispatched.`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Error updating order status:', err);
      alert(err.response?.data?.error || 'Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePaymentStatusChange = async (orderId, newPaymentStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await ordersAPI.updateOrderStatus(orderId, { payment_status: newPaymentStatus });
      const updatedOrder = res.data.order;
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updatedOrder } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, ...updatedOrder }));
      }
      setSuccessMessage(`Order #${updatedOrder.order_number} payment status marked as ${newPaymentStatus}!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating payment status:', err);
      alert('Failed to update payment status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSwitchAccount = () => {
    logout();
    setIsAuthOpen(true);
  };

  // KPIs
  const totalOrdersCount = orders.length;
  const totalRevenue = orders.reduce((sum, o) => o.status !== 'CANCELLED' ? sum + parseFloat(o.total_amount || 0) : sum, 0);
  const confirmedCount = orders.filter(o => o.status === 'CONFIRMED' || o.status === 'PENDING').length;
  const inTransitCount = orders.filter(o => o.status === 'SHIPPED' || o.status === 'PACKED').length;
  const deliveredCount = orders.filter(o => o.status === 'DELIVERED').length;

  if (!isAuthorized) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center space-y-5">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-slate-900">Admin Portal Access Restricted</h2>
        
        {isAuthenticated ? (
          <div className="space-y-4 max-w-md mx-auto">
            <p className="text-xs text-slate-500">
              You are currently signed in as <strong className="text-slate-800">{user?.email}</strong> (Customer Account). Only staff and administrator accounts can manage orders.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition-colors"
              >
                <Home className="w-4 h-4" /> Return to Home Page
              </button>
              <button
                onClick={handleSwitchAccount}
                className="px-5 py-3 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              >
                <UserCheck className="w-4 h-4" /> Sign In as Admin
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-md mx-auto">
            <p className="text-xs text-slate-500">
              You must be logged in with an administrator or staff account to manage and update customer orders.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-6 py-3 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-colors"
              >
                Sign In As Admin
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-5 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Back to Home Page
              </button>
            </div>
          </div>
        )}

        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-24">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
                Ronak Administration
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">Order Fulfilment Hub</span>
            </div>
            <h1 className="text-3xl font-serif font-bold">Order Management Portal</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/products"
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-colors"
            >
              <Package className="w-3.5 h-3.5" /> Manage Products & Photos
            </Link>

            <button
              onClick={() => setIsCityModalOpen(true)}
              className="px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-amber-500/30 transition-colors cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5" /> Delivery Cities
            </button>

            <Link
              to="/admin/reviews"
              className="px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-amber-500/30 transition-colors cursor-pointer"
            >
              <Star className="w-3.5 h-3.5" /> Customer Reviews
            </Link>




            <button
              onClick={fetchOrders}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-2 border border-white/10 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
            </button>
            <a
              href="http://127.0.0.1:8000/admin/orders/order/"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              Django Admin <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-900 flex items-center gap-3 animate-fade-in shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Active Orders</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-serif font-black text-slate-900">{totalOrdersCount}</span>
              <span className="p-2 rounded-xl bg-slate-100 text-slate-700"><Package className="w-4 h-4" /></span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Awaiting Dispatch</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-serif font-black text-amber-700">{confirmedCount}</span>
              <span className="p-2 rounded-xl bg-amber-50 text-amber-600"><Clock className="w-4 h-4" /></span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-cyan-700 uppercase tracking-wider block">In Transit (Courier)</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-serif font-black text-cyan-700">{inTransitCount}</span>
              <span className="p-2 rounded-xl bg-cyan-50 text-cyan-600"><Truck className="w-4 h-4" /></span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Delivered & Collected</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-serif font-black text-emerald-700">{deliveredCount}</span>
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600"><CheckCircle2 className="w-4 h-4" /></span>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
            {['ALL', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${
                  statusFilter === st
                    ? 'bg-slate-900 text-amber-300 shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-80">
            <div className="relative flex-grow">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search order #, name, city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-amber-700 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-500">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-serif font-bold text-base text-slate-700">No orders found</h3>
              <p className="text-xs text-slate-400">Try changing your search term or status filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    <th className="py-4 px-6">Order Reference</th>
                    <th className="py-4 px-6">Customer / Contact</th>
                    <th className="py-4 px-6">Delivery City</th>
                    <th className="py-4 px-6">Total Amount</th>
                    <th className="py-4 px-6">Payment (COD)</th>
                    <th className="py-4 px-6">Order Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => {
                    const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.CONFIRMED;
                    const itemsCount = (order.items || []).reduce((acc, it) => acc + (it.quantity || 1), 0);

                    return (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Order Number */}
                        <td className="py-4 px-6 font-mono font-bold text-slate-900 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="text-amber-800">{order.order_number}</span>
                            <button
                              onClick={() => copyToClipboard(order.order_number, order.id)}
                              className="text-slate-400 hover:text-slate-700"
                              title="Copy Order ID"
                            >
                              {copiedId === order.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
                            {order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <p className="font-bold text-slate-900">{order.shipping_full_name}</p>
                          <p className="text-[11px] text-slate-500">{order.shipping_phone}</p>
                          <p className="text-[10px] text-slate-400">{order.shipping_email}</p>
                        </td>

                        {/* City */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 font-bold border border-amber-200 text-[11px]">
                            {order.city}
                          </span>
                        </td>

                        {/* Total */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className="font-serif font-black text-sm text-slate-900">
                            Rs. {Number(order.total_amount || 0).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-semibold">
                            {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                          </span>
                        </td>


                        {/* Payment Status */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <button
                            onClick={() => handlePaymentStatusChange(order.id, order.payment_status === 'PAID' ? 'UNPAID' : 'PAID')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors ${
                              order.payment_status === 'PAID'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}
                            title="Click to toggle Payment Status"
                          >
                            {order.payment_status === 'PAID' ? '✓ Paid' : '⏳ Unpaid (COD)'}
                          </button>
                        </td>

                        {/* Order Status Select / Dropdown */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="relative inline-block">
                            <select
                              value={order.status}
                              disabled={updatingId === order.id}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              className={`text-[11px] font-extrabold px-3 py-1.5 rounded-xl border appearance-none pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500 ${st.bg} ${st.text} ${st.border}`}
                            >
                              <option value="CONFIRMED">Confirmed</option>
                              <option value="PACKED">Packed (Prep)</option>
                              <option value="SHIPPED">Shipped (In Transit)</option>
                              <option value="DELIVERED">Delivered (Completed)</option>
                              <option value="CANCELLED">Cancelled</option>
                              <option value="RETURNED">Returned</option>
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                          </div>
                        </td>

                        {/* Action Details */}
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-amber-100 text-slate-800 hover:text-amber-900 font-bold rounded-xl text-xs flex items-center gap-1.5 ml-auto transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" /> Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Order Details Slide-Over Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative border border-slate-100 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 block">
                  Order Details
                </span>
                <h3 className="font-serif font-bold text-xl text-slate-900">
                  #{selectedOrder.order_number}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-xl"
              >
                ✕
              </button>
            </div>

            {/* Quick Status Bar */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-600">Update Status:</span>
                <select
                  value={selectedOrder.status}
                  disabled={updatingId === selectedOrder.id}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  className="font-extrabold px-3 py-1.5 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PACKED">Packed</option>
                  <option value="SHIPPED">Shipped (In Transit)</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="RETURNED">Returned</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-600">Payment:</span>
                <button
                  onClick={() => handlePaymentStatusChange(selectedOrder.id, selectedOrder.payment_status === 'PAID' ? 'UNPAID' : 'PAID')}
                  className={`px-3 py-1.5 rounded-xl font-bold ${
                    selectedOrder.payment_status === 'PAID'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  {selectedOrder.payment_status === 'PAID' ? 'Marked as Paid' : 'Cash on Delivery (Unpaid)'}
                </button>
              </div>
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Customer Information</span>
                <p className="font-bold text-slate-900 text-sm">{selectedOrder.shipping_full_name}</p>
                <p className="text-slate-600">{selectedOrder.shipping_phone}</p>
                <p className="text-slate-600">{selectedOrder.shipping_email}</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Delivery Address</span>
                <p className="font-semibold text-slate-800">{selectedOrder.shipping_address}</p>
                <p className="font-bold text-amber-800">
                  {selectedOrder.city} {selectedOrder.postal_code && `(${selectedOrder.postal_code})`}
                </p>
              </div>
            </div>

            {/* Ordered Items List */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Purchased Luxury Items ({(selectedOrder.items || []).length})
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                {(selectedOrder.items || []).map((item, i) => (
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
                          {item.variant_name} • Qty: {item.quantity} × Rs. {Number(item.unit_price || 0).toLocaleString()}
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

            {/* Totals Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">Rs. {Number(selectedOrder.subtotal || 0).toLocaleString()}</span>
              </div>
              {parseFloat(selectedOrder.discount || 0) > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Discount</span>
                  <span>-Rs. {Number(selectedOrder.discount).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Delivery Fee</span>
                <span className="font-bold text-slate-900">Rs. {Number(selectedOrder.shipping_fee || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount</span>
                <span className="text-amber-800 text-lg font-black">Rs. {Number(selectedOrder.total_amount || 0).toLocaleString()}</span>
              </div>
            </div>


            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-2">
              <a
                href={`http://127.0.0.1:8000/admin/orders/order/${selectedOrder.id}/change/`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-slate-600 hover:text-amber-700 flex items-center gap-1"
              >
                Edit in Django Admin <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Available Cities Manager Modal */}
      <CityManagementModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
      />

      {/* Customer Reviews Management Modal */}
      <ReviewManagementModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onUpdated={fetchOrders}
      />
    </div>
  );

};

