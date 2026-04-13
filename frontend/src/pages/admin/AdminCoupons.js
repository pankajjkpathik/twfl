import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit, X } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const emptyCoupon = { code: '', discount_type: 'percentage', discount_value: '', min_order_value: '', expiry_date: '', usage_limit: '' };

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyCoupon });

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/admin/coupons`, { withCredentials: true });
      setCoupons(data.coupons || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      code: form.code.toUpperCase(),
      discount_type: form.discount_type,
      discount_value: parseFloat(form.discount_value),
      min_order_value: form.min_order_value ? parseFloat(form.min_order_value) : null,
      expiry_date: form.expiry_date ? new Date(form.expiry_date).toISOString() : null,
      usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
    };

    try {
      if (editingId) {
        await axios.put(`${API_URL}/api/admin/coupons/${editingId}`, payload, { withCredentials: true });
        toast.success('Coupon updated');
      } else {
        await axios.post(`${API_URL}/api/admin/coupons`, payload, { withCredentials: true });
        toast.success('Coupon created');
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ ...emptyCoupon });
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save coupon');
    }
  };

  const handleEdit = (coupon) => {
    setForm({
      code: coupon.code, discount_type: coupon.discount_type, discount_value: coupon.discount_value,
      min_order_value: coupon.min_order_value || '', expiry_date: coupon.expiry_date ? coupon.expiry_date.split('T')[0] : '',
      usage_limit: coupon.usage_limit || '',
    });
    setEditingId(coupon.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this coupon?')) return;
    try {
      await axios.delete(`${API_URL}/api/admin/coupons/${id}`, { withCredentials: true });
      toast.success('Coupon deactivated');
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to deactivate');
    }
  };

  if (loading) {
    return (<div className="min-h-screen"><Navbar /><div className="flex items-center justify-center py-20"><div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--brand-primary)]"></div></div></div>);
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]" data-testid="admin-coupons-page">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-normal tracking-tight" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Coupon Management</h1>
          <button onClick={() => { setShowForm(true); setEditingId(null); setForm({...emptyCoupon}); }} className="btn-primary flex items-center space-x-2" data-testid="add-coupon-button"><Plus size={16} /><span>Add Coupon</span></button>
        </div>

        <div className="bg-[var(--surface-card)] border border-[var(--surface-border)]">
          {coupons.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-[var(--surface-border)] bg-[var(--bg-secondary)]">
                  <th className="py-3 px-4 text-left text-xs uppercase tracking-wider">Code</th>
                  <th className="py-3 px-4 text-left text-xs uppercase tracking-wider">Discount</th>
                  <th className="py-3 px-4 text-left text-xs uppercase tracking-wider">Min Order</th>
                  <th className="py-3 px-4 text-left text-xs uppercase tracking-wider">Used / Limit</th>
                  <th className="py-3 px-4 text-left text-xs uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-right text-xs uppercase tracking-wider">Actions</th>
                </tr></thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c.id} className="border-b border-[var(--surface-border)] hover:bg-[var(--bg-secondary)] transition-colors" data-testid={`coupon-row-${c.id}`}>
                      <td className="py-3 px-4 font-medium">{c.code}</td>
                      <td className="py-3 px-4">{c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value}`}</td>
                      <td className="py-3 px-4">{c.min_order_value ? `₹${c.min_order_value}` : '—'}</td>
                      <td className="py-3 px-4">{c.used_count || 0} / {c.usage_limit || '∞'}</td>
                      <td className="py-3 px-4"><span className={`text-xs px-2 py-0.5 ${c.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{c.is_active ? 'Active' : 'Inactive'}</span></td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button onClick={() => handleEdit(c)} className="text-[var(--brand-primary)]" data-testid={`edit-coupon-${c.id}`}><Edit size={14} /></button>
                          <button onClick={() => handleDelete(c.id)} className="text-[var(--surface-error)]" data-testid={`delete-coupon-${c.id}`}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="text-center py-12 text-sm text-[var(--text-secondary)]">No coupons created yet</p>}
        </div>
      </div>

      {/* Coupon Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6" onClick={() => setShowForm(false)}>
          <div className="bg-[var(--surface-card)] p-8 max-w-lg w-full border border-[var(--surface-border)]" onClick={(e) => e.stopPropagation()} data-testid="coupon-form-modal">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-normal" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{editingId ? 'Edit' : 'Create'} Coupon</h2>
              <button onClick={() => setShowForm(false)} className="text-[var(--text-secondary)]"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] mb-1 text-[var(--brand-secondary)]">Coupon Code</label>
                <input type="text" required value={form.code} onChange={(e) => setForm({...form, code: e.target.value.toUpperCase()})} placeholder="e.g., SAVE20" className="w-full px-3 py-2 text-sm border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)]" data-testid="coupon-code-input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-[0.15em] mb-1 text-[var(--brand-secondary)]">Discount Type</label>
                  <select value={form.discount_type} onChange={(e) => setForm({...form, discount_type: e.target.value})} className="w-full px-3 py-2 text-sm border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)]" data-testid="coupon-type-select">
                    <option value="percentage">Percentage</option>
                    <option value="flat">Flat Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.15em] mb-1 text-[var(--brand-secondary)]">Discount Value</label>
                  <input type="number" required value={form.discount_value} onChange={(e) => setForm({...form, discount_value: e.target.value})} className="w-full px-3 py-2 text-sm border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)]" data-testid="coupon-value-input" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-[0.15em] mb-1 text-[var(--brand-secondary)]">Min Order Value (₹)</label>
                  <input type="number" value={form.min_order_value} onChange={(e) => setForm({...form, min_order_value: e.target.value})} className="w-full px-3 py-2 text-sm border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)]" data-testid="coupon-min-order-input" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.15em] mb-1 text-[var(--brand-secondary)]">Usage Limit</label>
                  <input type="number" value={form.usage_limit} onChange={(e) => setForm({...form, usage_limit: e.target.value})} className="w-full px-3 py-2 text-sm border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)]" data-testid="coupon-limit-input" />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] mb-1 text-[var(--brand-secondary)]">Expiry Date</label>
                <input type="date" value={form.expiry_date} onChange={(e) => setForm({...form, expiry_date: e.target.value})} className="w-full px-3 py-2 text-sm border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)]" data-testid="coupon-expiry-input" />
              </div>
              <div className="flex gap-4 mt-6">
                <button type="submit" className="flex-1 btn-primary" data-testid="save-coupon-button">Save Coupon</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminCoupons;
