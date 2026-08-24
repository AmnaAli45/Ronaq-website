import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import {
  X,
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Search,
  AlertCircle,
  Loader2,
  Building
} from 'lucide-react';

export const CityManagementModal = ({ isOpen, onClose }) => {
  const { refreshDeliveryCities } = useCart();
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Add City Form
  const [newCityName, setNewCityName] = useState('');
  const [newEstimatedDays, setNewEstimatedDays] = useState('2-4 Business Days');
  const [newDeliveryFee, setNewDeliveryFee] = useState('0.00');
  const [newIsActive, setNewIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const fetchCities = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await ordersAPI.adminGetCities();
      const items = Array.isArray(res.data) ? res.data : res.data.results || [];
      setCities(items);
    } catch (err) {
      console.error('Error fetching admin cities:', err);
      setError('Could not load delivery cities. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCities();
      setError('');
      setSuccessMsg('');
    }
  }, [isOpen]);

  const handleAddCity = async (e) => {
    e.preventDefault();
    if (!newCityName.trim()) {
      setError('Please enter a city name.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const payload = {
        name: newCityName.trim(),
        estimated_days: newEstimatedDays.trim() || '2-4 Days',
        delivery_fee: parseFloat(newDeliveryFee) || 0.00,
        is_active: newIsActive
      };
      await ordersAPI.adminCreateCity(payload);
      setSuccessMsg(`City "${payload.name}" added successfully!`);
      setNewCityName('');
      setNewEstimatedDays('2-4 Business Days');
      setNewDeliveryFee('0.00');
      setNewIsActive(true);
      await fetchCities();
      if (refreshDeliveryCities) refreshDeliveryCities();
    } catch (err) {
      console.error('Error adding city:', err);
      const serverErr = err.response?.data?.name?.[0] || err.response?.data?.error || 'Failed to add city. Make sure city name is unique.';
      setError(serverErr);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (city) => {
    setTogglingId(city.id);
    setError('');
    setSuccessMsg('');
    try {
      const updatedStatus = !city.is_active;
      await ordersAPI.adminUpdateCity(city.id, { is_active: updatedStatus });
      setCities(prev => prev.map(c => c.id === city.id ? { ...c, is_active: updatedStatus } : c));
      setSuccessMsg(`"${city.name}" is now ${updatedStatus ? 'ACTIVE (Available for checkout)' : 'INACTIVE (Disabled)'}.`);
      if (refreshDeliveryCities) refreshDeliveryCities();
    } catch (err) {
      console.error('Error toggling city status:', err);
      setError('Failed to update city status.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteCity = async (city) => {
    if (!window.confirm(`Are you sure you want to remove "${city.name}" from delivery cities?`)) {
      return;
    }

    setDeletingId(city.id);
    setError('');
    setSuccessMsg('');
    try {
      await ordersAPI.adminDeleteCity(city.id);
      setCities(prev => prev.map(c => c.id === city.id ? null : c).filter(Boolean));
      setSuccessMsg(`City "${city.name}" deleted.`);
      if (refreshDeliveryCities) refreshDeliveryCities();
    } catch (err) {
      console.error('Error deleting city:', err);
      setError('Failed to delete city.');
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  const filteredCities = cities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = cities.filter(c => c.is_active).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative border border-slate-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-slate-900">
                Delivery Available Cities
              </h2>
              <p className="text-xs text-slate-500">
                Manage which cities can place Cash on Delivery (COD) orders
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Modal Body: Scrollable */}
        <div className="overflow-y-auto space-y-6 flex-grow pr-1">

          {/* Quick Add City Form */}
          <form onSubmit={handleAddCity} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <span className="text-[11px] font-extrabold uppercase text-amber-800 tracking-wider block">
              + Add New Delivery City
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">City Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rawalpindi, Peshawar"
                  value={newCityName}
                  onChange={(e) => setNewCityName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">Estimated Days</label>
                <input
                  type="text"
                  placeholder="e.g. 2-3 Days"
                  value={newEstimatedDays}
                  onChange={(e) => setNewEstimatedDays(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">Delivery Fee (Rs.)</label>
                <input
                  type="number"
                  step="1"
                  placeholder="0"
                  value={newDeliveryFee}
                  onChange={(e) => setNewDeliveryFee(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                />
              </div>

            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={newIsActive}
                  onChange={(e) => setNewIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                />
                <span>Active for immediate checkout</span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <span>Add City</span>
              </button>
            </div>
          </form>

          {/* Search & Stats Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search delivery cities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 text-xs font-bold self-end sm:self-auto">
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                Active: {activeCount}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                Total: {cities.length}
              </span>
            </div>
          </div>

          {/* Cities List */}
          {loading ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-600" />
              <p className="text-xs">Loading available cities...</p>
            </div>
          ) : filteredCities.length === 0 ? (
            <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Building className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-600">No delivery cities found</p>
              <p className="text-[11px] text-slate-400">Add a new city using the form above</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
              {filteredCities.map((city) => (
                <div
                  key={city.id}
                  className={`p-3.5 flex items-center justify-between gap-3 transition-colors ${
                    city.is_active ? 'hover:bg-slate-50/80' : 'bg-slate-50/50 opacity-75'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                      city.is_active ? 'bg-amber-100 text-amber-900' : 'bg-slate-200 text-slate-500'
                    }`}>
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{city.name}</span>
                        {city.is_active ? (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            Active
                          </span>
                        ) : (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">
                            Disabled
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {city.estimated_days || '2-4 Days'}
                        </span>
                        <span>•</span>
                        <span>
                          Fee: {parseFloat(city.delivery_fee) > 0 ? `Rs. ${Number(city.delivery_fee).toLocaleString()}` : 'Free'}
                        </span>

                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleActive(city)}
                      disabled={togglingId === city.id}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-colors cursor-pointer ${
                        city.is_active
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {togglingId === city.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : city.is_active ? (
                        'Deactivate'
                      ) : (
                        'Activate'
                      )}
                    </button>

                    <button
                      onClick={() => handleDeleteCity(city)}
                      disabled={deletingId === city.id}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete City"
                    >
                      {deletingId === city.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400">
            Changes reflect immediately in customer checkout form.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
