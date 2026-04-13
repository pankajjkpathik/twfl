import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, MapPin, Edit } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AddressesPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ type: 'shipping', name: '', phone: '', address_line1: '', address_line2: '', city: '', state: '', pincode: '', is_default: false });

  useEffect(() => { fetchAddresses(); }, []);

  const fetchAddresses = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/addresses`, { withCredentials: true });
      setAddresses(data.addresses || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/api/addresses/${editingId}`, form, { withCredentials: true });
        toast.success('Address updated');
      } else {
        await axios.post(`${API_URL}/api/addresses`, form, { withCredentials: true });
        toast.success('Address added');
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ type: 'shipping', name: '', phone: '', address_line1: '', address_line2: '', city: '', state: '', pincode: '', is_default: false });
      fetchAddresses();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save address');
    }
  };

  const handleEdit = (addr) => {
    setForm({ type: addr.type, name: addr.name, phone: addr.phone, address_line1: addr.address_line1, address_line2: addr.address_line2 || '', city: addr.city, state: addr.state, pincode: addr.pincode, is_default: addr.is_default });
    setEditingId(addr.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/addresses/${id}`, { withCredentials: true });
      toast.success('Address deleted');
      fetchAddresses();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  if (loading) {
    return (<div className="min-h-screen"><Navbar /><div className="flex items-center justify-center py-20"><div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--brand-primary)]"></div></div></div>);
  }

  return (
    <div className="min-h-screen" data-testid="addresses-page">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight" style={{ fontFamily: 'Cormorant Garamond, serif' }}>My Addresses</h1>
          <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ type: 'shipping', name: '', phone: '', address_line1: '', address_line2: '', city: '', state: '', pincode: '', is_default: false }); }} className="btn-secondary flex items-center space-x-2" data-testid="add-address-button"><Plus size={16} /><span>Add New</span></button>
        </div>

        {addresses.length === 0 && !showForm ? (
          <div className="text-center py-20 bg-[var(--surface-card)] border border-[var(--surface-border)]">
            <MapPin size={48} className="mx-auto mb-4 text-[var(--text-secondary)]" />
            <p className="text-[var(--text-secondary)]">No addresses saved yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div key={addr.id} className="bg-[var(--surface-card)] border border-[var(--surface-border)] p-6 relative" data-testid={`address-card-${addr.id}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-[var(--brand-secondary)]">{addr.type}</span>
                  <div className="flex space-x-2">
                    <button onClick={() => handleEdit(addr)} className="text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors" data-testid={`edit-address-${addr.id}`}><Edit size={14} /></button>
                    <button onClick={() => handleDelete(addr.id)} className="text-[var(--text-secondary)] hover:text-[var(--surface-error)] transition-colors" data-testid={`delete-address-${addr.id}`}><Trash2 size={14} /></button>
                  </div>
                </div>
                <p className="font-medium">{addr.name}</p>
                <p className="text-sm text-[var(--text-secondary)]">{addr.address_line1}</p>
                {addr.address_line2 && <p className="text-sm text-[var(--text-secondary)]">{addr.address_line2}</p>}
                <p className="text-sm text-[var(--text-secondary)]">{addr.city}, {addr.state} - {addr.pincode}</p>
                <p className="text-sm text-[var(--text-secondary)]">Phone: {addr.phone}</p>
                {addr.is_default && <span className="text-xs text-[var(--surface-success)] mt-2 inline-block">Default</span>}
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6" onClick={() => setShowForm(false)}>
            <div className="bg-[var(--surface-card)] p-8 max-w-lg w-full border border-[var(--surface-border)] max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} data-testid="address-form">
              <h2 className="text-2xl font-normal mb-6" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{editingId ? 'Edit' : 'Add'} Address</h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-[0.15em] mb-1 text-[var(--brand-secondary)]">Type</label>
                  <select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})} className="w-full px-3 py-2 text-sm border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)]" data-testid="address-type-select">
                    <option value="shipping">Shipping</option>
                    <option value="billing">Billing</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-[0.15em] mb-1 text-[var(--brand-secondary)]">Name</label>
                    <input type="text" required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 text-sm border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)]" data-testid="form-name" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-[0.15em] mb-1 text-[var(--brand-secondary)]">Phone</label>
                    <input type="tel" required value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="w-full px-3 py-2 text-sm border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)]" data-testid="form-phone" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.15em] mb-1 text-[var(--brand-secondary)]">Address Line 1</label>
                  <input type="text" required value={form.address_line1} onChange={(e) => setForm({...form, address_line1: e.target.value})} className="w-full px-3 py-2 text-sm border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)]" data-testid="form-address1" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.15em] mb-1 text-[var(--brand-secondary)]">Address Line 2</label>
                  <input type="text" value={form.address_line2} onChange={(e) => setForm({...form, address_line2: e.target.value})} className="w-full px-3 py-2 text-sm border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)]" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-[0.15em] mb-1 text-[var(--brand-secondary)]">City</label>
                    <input type="text" required value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} className="w-full px-3 py-2 text-sm border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)]" data-testid="form-city" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-[0.15em] mb-1 text-[var(--brand-secondary)]">State</label>
                    <input type="text" required value={form.state} onChange={(e) => setForm({...form, state: e.target.value})} className="w-full px-3 py-2 text-sm border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)]" data-testid="form-state" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-[0.15em] mb-1 text-[var(--brand-secondary)]">Pincode</label>
                    <input type="text" required value={form.pincode} onChange={(e) => setForm({...form, pincode: e.target.value})} className="w-full px-3 py-2 text-sm border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)]" data-testid="form-pincode" />
                  </div>
                </div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_default} onChange={(e) => setForm({...form, is_default: e.target.checked})} />
                  <span className="text-sm">Set as default</span>
                </label>
                <div className="flex gap-4 mt-6">
                  <button type="submit" className="flex-1 btn-primary" data-testid="save-address-btn">Save</button>
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AddressesPage;
