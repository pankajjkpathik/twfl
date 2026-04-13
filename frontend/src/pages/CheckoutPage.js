import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { MapPin, Plus, CreditCard, Banknote } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const CheckoutPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [addresses, setAddresses] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState('');
  const [selectedBilling, setSelectedBilling] = useState('');
  const [sameBilling, setSameBilling] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressType, setAddressType] = useState('shipping');
  const [processing, setProcessing] = useState(false);
  const [newAddress, setNewAddress] = useState({ name: '', phone: '', address_line1: '', address_line2: '', city: '', state: '', pincode: '', is_default: false });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  const fetchData = async () => {
    try {
      const [cartRes, addrRes] = await Promise.all([
        axios.get(`${API_URL}/api/cart`, { withCredentials: true }),
        axios.get(`${API_URL}/api/addresses`, { withCredentials: true }),
      ]);
      setCart(cartRes.data);
      setAddresses(addrRes.data.addresses || []);
      const shippingAddrs = (addrRes.data.addresses || []).filter(a => a.type === 'shipping');
      const billingAddrs = (addrRes.data.addresses || []).filter(a => a.type === 'billing');
      if (shippingAddrs.length > 0) setSelectedShipping(shippingAddrs[0].id);
      if (billingAddrs.length > 0) setSelectedBilling(billingAddrs[0].id);
    } catch (error) {
      console.error('Error fetching checkout data:', error);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/addresses`, { ...newAddress, type: addressType }, { withCredentials: true });
      toast.success('Address added');
      setShowAddressForm(false);
      setNewAddress({ name: '', phone: '', address_line1: '', address_line2: '', city: '', state: '', pincode: '', is_default: false });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedShipping) { toast.error('Please select a shipping address'); return; }
    const billingId = sameBilling ? selectedShipping : selectedBilling;
    if (!billingId) { toast.error('Please select a billing address'); return; }
    if (cart.items.length === 0) { toast.error('Cart is empty'); return; }

    setProcessing(true);
    try {
      const orderData = {
        items: cart.items.map(i => ({ product_id: i.product_id, quantity: i.quantity, size: i.size, color: i.color })),
        shipping_address_id: selectedShipping,
        billing_address_id: billingId,
        payment_method: paymentMethod,
      };

      if (paymentMethod === 'cod') {
        toast.success('Order placed successfully! (Cash on Delivery)');
        navigate('/orders');
      } else {
        // Razorpay integration - MOCKED since no real keys
        try {
          const { data } = await axios.post(`${API_URL}/api/orders/create-razorpay-order`, orderData, { withCredentials: true });
          toast.info('Razorpay payment gateway would open here. Order created with ID: ' + data.internal_order_id);
          navigate('/orders');
        } catch (err) {
          toast.error('Payment gateway error: ' + (err.response?.data?.detail || 'Please check Razorpay configuration'));
          navigate('/orders');
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to place order');
    } finally {
      setProcessing(false);
    }
  };

  const shippingAddresses = addresses.filter(a => a.type === 'shipping');
  const billingAddresses = addresses.filter(a => a.type === 'billing');

  return (
    <div className="min-h-screen" data-testid="checkout-page">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <h1 className="text-4xl sm:text-5xl font-light mb-8 tracking-tight" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Address */}
            <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--brand-secondary)]">Shipping Address</h2>
                <button onClick={() => { setAddressType('shipping'); setShowAddressForm(true); }} className="text-xs text-[var(--brand-primary)] hover:underline flex items-center space-x-1" data-testid="add-shipping-address"><Plus size={14} /><span>Add New</span></button>
              </div>
              {shippingAddresses.length === 0 ? (
                <p className="text-sm text-[var(--text-secondary)]">No shipping addresses found. Please add one.</p>
              ) : (
                <div className="space-y-3">
                  {shippingAddresses.map((addr) => (
                    <label key={addr.id} className={`flex items-start space-x-3 p-4 border cursor-pointer transition-colors ${selectedShipping === addr.id ? 'border-[var(--brand-primary)] bg-[var(--bg-secondary)]' : 'border-[var(--surface-border)]'}`} data-testid={`shipping-address-${addr.id}`}>
                      <input type="radio" name="shipping" checked={selectedShipping === addr.id} onChange={() => setSelectedShipping(addr.id)} className="mt-1" />
                      <div>
                        <p className="font-medium text-sm">{addr.name}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{addr.address_line1}{addr.address_line2 && `, ${addr.address_line2}`}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{addr.city}, {addr.state} - {addr.pincode}</p>
                        <p className="text-sm text-[var(--text-secondary)]">Phone: {addr.phone}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Billing Address */}
            <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] p-6">
              <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--brand-secondary)] mb-4">Billing Address</h2>
              <label className="flex items-center space-x-2 mb-4 cursor-pointer">
                <input type="checkbox" checked={sameBilling} onChange={(e) => setSameBilling(e.target.checked)} data-testid="same-billing-checkbox" />
                <span className="text-sm">Same as shipping address</span>
              </label>
              {!sameBilling && (
                <>
                  <button onClick={() => { setAddressType('billing'); setShowAddressForm(true); }} className="text-xs text-[var(--brand-primary)] hover:underline flex items-center space-x-1 mb-3" data-testid="add-billing-address"><Plus size={14} /><span>Add New</span></button>
                  <div className="space-y-3">
                    {billingAddresses.map((addr) => (
                      <label key={addr.id} className={`flex items-start space-x-3 p-4 border cursor-pointer transition-colors ${selectedBilling === addr.id ? 'border-[var(--brand-primary)] bg-[var(--bg-secondary)]' : 'border-[var(--surface-border)]'}`}>
                        <input type="radio" name="billing" checked={selectedBilling === addr.id} onChange={() => setSelectedBilling(addr.id)} className="mt-1" />
                        <div>
                          <p className="font-medium text-sm">{addr.name}</p>
                          <p className="text-sm text-[var(--text-secondary)]">{addr.address_line1}, {addr.city} - {addr.pincode}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] p-6">
              <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--brand-secondary)] mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className={`flex items-center space-x-3 p-4 border cursor-pointer transition-colors ${paymentMethod === 'razorpay' ? 'border-[var(--brand-primary)] bg-[var(--bg-secondary)]' : 'border-[var(--surface-border)]'}`} data-testid="payment-razorpay">
                  <input type="radio" name="payment" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={(e) => setPaymentMethod(e.target.value)} />
                  <CreditCard size={18} className="text-[var(--brand-primary)]" />
                  <div><p className="text-sm font-medium">Razorpay</p><p className="text-xs text-[var(--text-secondary)]">UPI, Cards, Net Banking</p></div>
                </label>
                <label className={`flex items-center space-x-3 p-4 border cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-[var(--brand-primary)] bg-[var(--bg-secondary)]' : 'border-[var(--surface-border)]'}`} data-testid="payment-cod">
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} />
                  <Banknote size={18} className="text-[var(--brand-primary)]" />
                  <div><p className="text-sm font-medium">Cash on Delivery</p><p className="text-xs text-[var(--text-secondary)]">Pay when you receive</p></div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] p-6 sticky top-24">
              <h3 className="text-xs uppercase tracking-[0.2em] mb-6 text-[var(--brand-secondary)]">Order Summary</h3>
              <div className="space-y-3 mb-6">
                {cart.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)] truncate pr-2">{item.product?.name} x{item.quantity}</span>
                    <span>₹{item.item_total?.toFixed(0)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3 text-sm border-t border-[var(--surface-border)] pt-4">
                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Subtotal</span><span>₹{cart.total.toFixed(0)}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Shipping</span><span className="text-[var(--surface-success)]">Free</span></div>
                <div className="flex justify-between text-lg font-medium pt-3 border-t border-[var(--surface-border)]"><span>Total</span><span className="text-[var(--brand-primary)]">₹{cart.total.toFixed(0)}</span></div>
              </div>
              <button onClick={handlePlaceOrder} disabled={processing} className="w-full btn-primary mt-6 disabled:opacity-50" data-testid="place-order-button">
                {processing ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      {showAddressForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6" onClick={() => setShowAddressForm(false)}>
          <div className="bg-[var(--surface-card)] p-8 max-w-lg w-full border border-[var(--surface-border)] max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} data-testid="address-form-modal">
            <h2 className="text-2xl font-normal mb-6" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Add {addressType === 'shipping' ? 'Shipping' : 'Billing'} Address</h2>
            <form onSubmit={handleAddAddress} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-[0.15em] mb-1 text-[var(--brand-secondary)]">Name</label>
                  <input type="text" required value={newAddress.name} onChange={(e) => setNewAddress({...newAddress, name: e.target.value})} className="w-full px-3 py-2 text-sm border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)]" data-testid="address-name-input" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.15em] mb-1 text-[var(--brand-secondary)]">Phone</label>
                  <input type="tel" required value={newAddress.phone} onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})} className="w-full px-3 py-2 text-sm border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)]" data-testid="address-phone-input" />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] mb-1 text-[var(--brand-secondary)]">Address Line 1</label>
                <input type="text" required value={newAddress.address_line1} onChange={(e) => setNewAddress({...newAddress, address_line1: e.target.value})} className="w-full px-3 py-2 text-sm border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)]" data-testid="address-line1-input" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] mb-1 text-[var(--brand-secondary)]">Address Line 2</label>
                <input type="text" value={newAddress.address_line2} onChange={(e) => setNewAddress({...newAddress, address_line2: e.target.value})} className="w-full px-3 py-2 text-sm border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)]" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-[0.15em] mb-1 text-[var(--brand-secondary)]">City</label>
                  <input type="text" required value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} className="w-full px-3 py-2 text-sm border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)]" data-testid="address-city-input" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.15em] mb-1 text-[var(--brand-secondary)]">State</label>
                  <input type="text" required value={newAddress.state} onChange={(e) => setNewAddress({...newAddress, state: e.target.value})} className="w-full px-3 py-2 text-sm border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)]" data-testid="address-state-input" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.15em] mb-1 text-[var(--brand-secondary)]">Pincode</label>
                  <input type="text" required value={newAddress.pincode} onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})} className="w-full px-3 py-2 text-sm border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)]" data-testid="address-pincode-input" />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button type="submit" className="flex-1 btn-primary" data-testid="save-address-button">Save Address</button>
                <button type="button" onClick={() => setShowAddressForm(false)} className="flex-1 btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default CheckoutPage;
