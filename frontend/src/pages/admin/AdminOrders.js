import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [trackingInput, setTrackingInput] = useState('');

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/admin/orders`, { withCredentials: true });
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      const payload = { status: newStatus };
      if (trackingInput && updatingId === orderId) payload.tracking_id = trackingInput;
      await axios.put(`${API_URL}/api/admin/orders/${orderId}/status`, payload, { withCredentials: true });
      toast.success('Order status updated');
      setUpdatingId(null);
      setTrackingInput('');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update');
    }
  };

  if (loading) {
    return (<div className="min-h-screen"><Navbar /><div className="flex items-center justify-center py-20"><div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--brand-primary)]"></div></div></div>);
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]" data-testid="admin-orders-page">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <h1 className="text-4xl font-normal tracking-tight mb-8" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Order Management</h1>

        <div className="bg-[var(--surface-card)] border border-[var(--surface-border)]">
          {orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-[var(--surface-border)] bg-[var(--bg-secondary)]">
                  <th className="py-3 px-4 text-left text-xs uppercase tracking-wider">Order #</th>
                  <th className="py-3 px-4 text-left text-xs uppercase tracking-wider">Customer</th>
                  <th className="py-3 px-4 text-left text-xs uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-left text-xs uppercase tracking-wider">Payment</th>
                  <th className="py-3 px-4 text-right text-xs uppercase tracking-wider">Amount</th>
                  <th className="py-3 px-4 text-left text-xs uppercase tracking-wider">Date</th>
                  <th className="py-3 px-4 text-left text-xs uppercase tracking-wider">Actions</th>
                </tr></thead>
                <tbody>
                  {orders.map((order) => (
                    <React.Fragment key={order.id}>
                      <tr className="border-b border-[var(--surface-border)] hover:bg-[var(--bg-secondary)] transition-colors" data-testid={`admin-order-${order.id}`}>
                        <td className="py-3 px-4 font-medium">{order.order_number}</td>
                        <td className="py-3 px-4 text-[var(--text-secondary)]">{order.user_id?.slice(-8)}</td>
                        <td className="py-3 px-4"><span className={`text-xs px-2 py-0.5 uppercase tracking-wider ${statusColors[order.order_status] || 'bg-gray-100'}`}>{order.order_status}</span></td>
                        <td className="py-3 px-4 capitalize">{order.payment_status}</td>
                        <td className="py-3 px-4 text-right text-[var(--brand-primary)]">₹{order.total_amount?.toFixed(0)}</td>
                        <td className="py-3 px-4 text-[var(--text-secondary)]">{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <select onChange={(e) => updateStatus(order.id, e.target.value)} value={order.order_status} className="px-2 py-1 text-xs border border-[var(--surface-border)] bg-transparent focus:outline-none" data-testid={`status-select-${order.id}`}>
                              {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <button onClick={() => setUpdatingId(updatingId === order.id ? null : order.id)} className="text-xs text-[var(--brand-primary)] hover:underline" data-testid={`tracking-toggle-${order.id}`}>Tracking</button>
                          </div>
                        </td>
                      </tr>
                      {updatingId === order.id && (
                        <tr className="border-b border-[var(--surface-border)] bg-[var(--bg-secondary)]">
                          <td colSpan={7} className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <input type="text" placeholder="Enter tracking ID" value={trackingInput} onChange={(e) => setTrackingInput(e.target.value)}
                                className="px-3 py-1.5 text-sm border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)]" data-testid={`tracking-input-${order.id}`} />
                              <button onClick={() => updateStatus(order.id, 'shipped')} className="px-3 py-1.5 text-xs bg-[var(--brand-primary)] text-white" data-testid={`save-tracking-${order.id}`}>Save & Mark Shipped</button>
                            </div>
                            {order.tracking_id && <p className="text-xs mt-2 text-[var(--text-secondary)]">Current Tracking: {order.tracking_id}</p>}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="text-center py-12 text-sm text-[var(--text-secondary)]">No orders yet</p>}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminOrders;
