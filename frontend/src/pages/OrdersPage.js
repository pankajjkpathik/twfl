import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Package, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/orders`, { withCredentials: true });
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (<div className="min-h-screen"><Navbar /><div className="flex items-center justify-center py-20"><div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--brand-primary)]"></div></div></div>);
  }

  return (
    <div className="min-h-screen" data-testid="orders-page">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <h1 className="text-4xl sm:text-5xl font-light mb-8 tracking-tight" style={{ fontFamily: 'Cormorant Garamond, serif' }}>My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-[var(--surface-card)] border border-[var(--surface-border)]">
            <Package size={48} className="mx-auto mb-4 text-[var(--text-secondary)]" />
            <p className="text-[var(--text-secondary)] mb-6">No orders yet</p>
            <Link to="/shop" className="btn-primary inline-block">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link key={order.id} to={`/orders/${order.id}`} className="block bg-[var(--surface-card)] border border-[var(--surface-border)] p-6 hover:-translate-y-0.5 hover:shadow-lg transition-all" data-testid={`order-${order.id}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[var(--text-secondary)]">Order #{order.order_number}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`text-xs px-3 py-1 uppercase tracking-wider ${statusColors[order.order_status] || 'bg-gray-100 text-gray-800'}`}>{order.order_status}</span>
                      <span className="text-sm text-[var(--text-secondary)]">{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-lg mt-2 text-[var(--brand-primary)] font-medium">₹{order.total_amount?.toFixed(0)}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      {order.items?.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="w-10 h-12 bg-[var(--bg-secondary)] overflow-hidden border border-[var(--surface-border)]">
                          {item.product?.images?.[0] && <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />}
                        </div>
                      ))}
                      {order.items?.length > 3 && <span className="text-xs text-[var(--text-secondary)]">+{order.items.length - 3} more</span>}
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-[var(--text-secondary)]" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default OrdersPage;
