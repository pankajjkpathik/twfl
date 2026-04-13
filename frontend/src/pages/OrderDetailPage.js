import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const trackingSteps = ['pending', 'processing', 'shipped', 'delivered'];

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line
  }, [id]);

  const fetchOrder = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/orders/${id}`, { withCredentials: true });
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (<div className="min-h-screen"><Navbar /><div className="flex items-center justify-center py-20"><div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--brand-primary)]"></div></div></div>);
  }

  if (!order) {
    return (<div className="min-h-screen"><Navbar /><div className="max-w-7xl mx-auto px-6 py-20 text-center"><p>Order not found</p></div></div>);
  }

  const currentStep = trackingSteps.indexOf(order.order_status);
  const stepIcons = [Clock, Package, Truck, CheckCircle];

  return (
    <div className="min-h-screen" data-testid="order-detail-page">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <button onClick={() => navigate('/orders')} className="flex items-center space-x-1 text-sm text-[var(--text-secondary)] hover:text-[var(--brand-primary)] mb-6 transition-colors" data-testid="back-to-orders"><ChevronLeft size={16} /><span>Back to Orders</span></button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-normal tracking-tight" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Order #{order.order_number}</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">{new Date(order.created_at).toLocaleString()}</p>
          </div>
          <span className="text-2xl text-[var(--brand-primary)] font-medium">₹{order.total_amount?.toFixed(0)}</span>
        </div>

        {/* Order Tracking */}
        <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] p-6 mb-8">
          <h2 className="text-xs uppercase tracking-[0.2em] mb-6 text-[var(--brand-secondary)]">Order Tracking</h2>
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-[var(--surface-border)]"><div className="h-full bg-[var(--brand-primary)] transition-all" style={{ width: `${(currentStep / (trackingSteps.length - 1)) * 100}%` }}></div></div>
            {trackingSteps.map((step, idx) => {
              const StepIcon = stepIcons[idx];
              const isActive = idx <= currentStep;
              return (
                <div key={step} className="relative flex flex-col items-center z-10" data-testid={`tracking-step-${step}`}>
                  <div className={`w-10 h-10 flex items-center justify-center ${isActive ? 'bg-[var(--brand-primary)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'}`}><StepIcon size={18} /></div>
                  <span className="text-xs mt-2 capitalize">{step}</span>
                </div>
              );
            })}
          </div>
          {order.tracking_id && <p className="mt-4 text-sm text-[var(--text-secondary)]">Tracking ID: <span className="text-[var(--text-primary)]">{order.tracking_id}</span></p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Items */}
          <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] p-6">
            <h2 className="text-xs uppercase tracking-[0.2em] mb-4 text-[var(--brand-secondary)]">Items</h2>
            <div className="space-y-4">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex gap-4" data-testid={`order-item-${idx}`}>
                  <div className="w-16 h-20 overflow-hidden bg-[var(--bg-secondary)] border border-[var(--surface-border)] flex-shrink-0">
                    {item.product?.images?.[0] && <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{item.product?.name || 'Product'}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">Size: {item.size} | Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Address & Payment Info */}
          <div className="space-y-6">
            {order.shipping_address && (
              <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] p-6">
                <h2 className="text-xs uppercase tracking-[0.2em] mb-3 text-[var(--brand-secondary)]">Shipping Address</h2>
                <p className="text-sm">{order.shipping_address.name}</p>
                <p className="text-sm text-[var(--text-secondary)]">{order.shipping_address.address_line1}</p>
                <p className="text-sm text-[var(--text-secondary)]">{order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}</p>
              </div>
            )}
            <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] p-6">
              <h2 className="text-xs uppercase tracking-[0.2em] mb-3 text-[var(--brand-secondary)]">Payment</h2>
              <div className="text-sm space-y-1">
                <p>Method: <span className="capitalize">{order.payment_method}</span></p>
                <p>Status: <span className="capitalize">{order.payment_status}</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderDetailPage;
