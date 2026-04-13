import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Minus, Plus, Trash2, ShoppingCart, Tag } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const CartPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  useEffect(() => {
    if (user) fetchCart();
    else setLoading(false);
    // eslint-disable-next-line
  }, [user]);

  const fetchCart = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/cart`, { withCredentials: true });
      setCart(data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (item, newQty) => {
    if (newQty < 1) return;
    try {
      await axios.put(`${API_URL}/api/cart/update`, { product_id: item.product_id, quantity: newQty, size: item.size, color: item.color }, { withCredentials: true });
      fetchCart();
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const removeItem = async (item) => {
    try {
      await axios.delete(`${API_URL}/api/cart/remove/${item.product_id}?size=${item.size}`, { withCredentials: true });
      toast.success('Item removed');
      fetchCart();
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const { data } = await axios.post(`${API_URL}/api/coupons/validate?code=${couponCode}&total_amount=${cart.total}`, {}, { withCredentials: true });
      setCouponDiscount(data.discount_amount);
      setAppliedCoupon(couponCode);
      toast.success(`Coupon applied! You save ₹${data.discount_amount.toFixed(0)}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid coupon');
      setCouponDiscount(0);
      setAppliedCoupon(null);
    }
  };

  const finalTotal = Math.max(0, cart.total - couponDiscount);

  if (loading) {
    return (<div className="min-h-screen"><Navbar /><div className="flex items-center justify-center py-20"><div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--brand-primary)]"></div></div></div>);
  }

  return (
    <div className="min-h-screen" data-testid="cart-page">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <h1 className="text-4xl sm:text-5xl font-light mb-8 tracking-tight" style={{ fontFamily: 'Cormorant Garamond, serif' }} data-testid="cart-title">Shopping Cart</h1>

        {!user ? (
          <div className="text-center py-20 border border-[var(--surface-border)] bg-[var(--surface-card)]">
            <ShoppingCart size={48} className="mx-auto mb-4 text-[var(--text-secondary)]" />
            <p className="text-[var(--text-secondary)] mb-6">Please login to view your cart</p>
            <Link to="/login" className="btn-primary inline-block" data-testid="login-cta">Login</Link>
          </div>
        ) : cart.items.length === 0 ? (
          <div className="text-center py-20 border border-[var(--surface-border)] bg-[var(--surface-card)]">
            <ShoppingCart size={48} className="mx-auto mb-4 text-[var(--text-secondary)]" />
            <p className="text-[var(--text-secondary)] mb-6">Your cart is empty</p>
            <Link to="/shop" className="btn-primary inline-block" data-testid="shop-cta">Continue Shopping</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 bg-[var(--surface-card)] border border-[var(--surface-border)]" data-testid={`cart-item-${idx}`}>
                  <Link to={`/product/${item.product_id}`} className="w-24 h-32 flex-shrink-0 overflow-hidden">
                    <img src={item.product?.images?.[0]} alt={item.product?.name} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.product_id}`} className="text-lg hover:text-[var(--brand-primary)] transition-colors" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{item.product?.name}</Link>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-[var(--text-secondary)]">
                      <span>Size: {item.size}</span>
                      {item.color && <span>Color: {item.color}</span>}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-3">
                        <button onClick={() => updateQuantity(item, item.quantity - 1)} className="w-8 h-8 border border-[var(--surface-border)] flex items-center justify-center hover:bg-[var(--bg-secondary)]" data-testid={`decrease-qty-${idx}`}><Minus size={14} /></button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item, item.quantity + 1)} className="w-8 h-8 border border-[var(--surface-border)] flex items-center justify-center hover:bg-[var(--bg-secondary)]" data-testid={`increase-qty-${idx}`}><Plus size={14} /></button>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-[var(--brand-primary)] font-medium">₹{item.item_total?.toFixed(0)}</span>
                        <button onClick={() => removeItem(item)} className="text-[var(--text-secondary)] hover:text-[var(--surface-error)] transition-colors" data-testid={`remove-item-${idx}`}><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] p-6 sticky top-24">
                <h3 className="text-xs uppercase tracking-[0.2em] mb-6 text-[var(--brand-secondary)]">Order Summary</h3>

                <div className="mb-4">
                  <div className="flex gap-2">
                    <input type="text" placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-2 text-sm border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)]" data-testid="coupon-input" />
                    <button onClick={applyCoupon} className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--surface-border)] text-sm hover:bg-[var(--bg-tertiary)] transition-colors" data-testid="apply-coupon-button">
                      <Tag size={14} />
                    </button>
                  </div>
                  {appliedCoupon && <p className="text-xs text-[var(--surface-success)] mt-1">Coupon "{appliedCoupon}" applied</p>}
                </div>

                <div className="space-y-3 text-sm border-t border-[var(--surface-border)] pt-4">
                  <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Subtotal</span><span>₹{cart.total.toFixed(0)}</span></div>
                  {couponDiscount > 0 && <div className="flex justify-between text-[var(--surface-success)]"><span>Coupon Discount</span><span>-₹{couponDiscount.toFixed(0)}</span></div>}
                  <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Shipping</span><span className="text-[var(--surface-success)]">Free</span></div>
                  <div className="flex justify-between text-lg font-medium pt-3 border-t border-[var(--surface-border)]"><span>Total</span><span className="text-[var(--brand-primary)]">₹{finalTotal.toFixed(0)}</span></div>
                </div>

                <button onClick={() => navigate('/checkout')} className="w-full btn-primary mt-6" data-testid="proceed-checkout-button">Proceed to Checkout</button>
                <Link to="/shop" className="block text-center text-sm text-[var(--text-secondary)] mt-4 hover:text-[var(--brand-primary)] transition-colors">Continue Shopping</Link>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CartPage;
