import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Package, ShoppingCart, Users, IndianRupee, ArrowRight } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const PIE_COLORS = ['#6B1724', '#D4AF37', '#800000', '#C5A059', '#4A3F3A'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/admin/dashboard/stats`, { withCredentials: true });
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (<div className="min-h-screen"><Navbar /><div className="flex items-center justify-center py-20"><div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--brand-primary)]"></div></div></div>);
  }

  const statCards = [
    { icon: IndianRupee, label: 'Revenue', value: `₹${(stats?.total_revenue || 0).toLocaleString()}`, color: 'text-[var(--brand-primary)]' },
    { icon: ShoppingCart, label: 'Orders', value: stats?.total_orders || 0, color: 'text-[var(--brand-secondary)]' },
    { icon: Package, label: 'Products', value: stats?.total_products || 0, color: 'text-[var(--surface-success)]' },
    { icon: Users, label: 'Customers', value: stats?.total_users || 0, color: 'text-[var(--text-secondary)]' },
  ];

  const recentOrders = stats?.recent_orders || [];
  const orderStatusData = recentOrders.reduce((acc, o) => {
    const s = o.order_status || 'pending';
    const existing = acc.find(x => x.name === s);
    if (existing) existing.value++;
    else acc.push({ name: s, value: 1 });
    return acc;
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]" data-testid="admin-dashboard">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-normal tracking-tight" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Admin Dashboard</h1>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((s) => (
            <div key={s.label} className="bg-[var(--surface-card)] border border-[var(--surface-border)] p-6" data-testid={`stat-${s.label.toLowerCase()}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-1">{s.label}</p>
                  <p className={`text-3xl font-light ${s.color}`} style={{ fontFamily: 'Cormorant Garamond, serif' }}>{s.value}</p>
                </div>
                <s.icon size={24} className="text-[var(--surface-border)]" />
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] p-6">
            <h2 className="text-xs uppercase tracking-[0.2em] mb-6 text-[var(--brand-secondary)]">Order Status Distribution</h2>
            {orderStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={orderStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name, value}) => `${name}: ${value}`}>
                    {orderStatusData.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-sm text-[var(--text-secondary)] py-16">No orders data yet</p>}
          </div>
          <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] p-6">
            <h2 className="text-xs uppercase tracking-[0.2em] mb-6 text-[var(--brand-secondary)]">Recent Revenue</h2>
            {recentOrders.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={recentOrders.slice(0, 7).map(o => ({ name: o.order_number?.slice(-6) || '...', amount: o.total_amount || 0 }))}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#6B1724" />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-sm text-[var(--text-secondary)] py-16">No revenue data yet</p>}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Manage Products', href: '/admin/products', desc: 'Add, edit, and manage inventory' },
            { label: 'Manage Orders', href: '/admin/orders', desc: 'View and update order statuses' },
            { label: 'Manage Coupons', href: '/admin/coupons', desc: 'Create and manage discount codes' },
          ].map(link => (
            <Link key={link.href} to={link.href} className="bg-[var(--surface-card)] border border-[var(--surface-border)] p-6 group hover:-translate-y-1 hover:shadow-lg transition-all" data-testid={`link-${link.label.replace(/\s+/g, '-').toLowerCase()}`}>
              <h3 className="text-xl mb-1 flex items-center justify-between" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{link.label}<ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" /></h3>
              <p className="text-sm text-[var(--text-secondary)]">{link.desc}</p>
            </Link>
          ))}
        </div>

        {/* Recent Orders Table */}
        <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] p-6">
          <h2 className="text-xs uppercase tracking-[0.2em] mb-6 text-[var(--brand-secondary)]">Recent Orders</h2>
          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-[var(--surface-border)]"><th className="py-3 text-left text-xs uppercase tracking-wider">Order #</th><th className="py-3 text-left text-xs uppercase tracking-wider">Status</th><th className="py-3 text-left text-xs uppercase tracking-wider">Payment</th><th className="py-3 text-right text-xs uppercase tracking-wider">Amount</th><th className="py-3 text-left text-xs uppercase tracking-wider">Date</th></tr></thead>
                <tbody>
                  {recentOrders.map(o => (
                    <tr key={o.id} className="border-b border-[var(--surface-border)]">
                      <td className="py-3">{o.order_number}</td>
                      <td className="py-3"><span className="capitalize">{o.order_status}</span></td>
                      <td className="py-3"><span className="capitalize">{o.payment_status}</span></td>
                      <td className="py-3 text-right text-[var(--brand-primary)]">₹{o.total_amount?.toFixed(0)}</td>
                      <td className="py-3 text-[var(--text-secondary)]">{new Date(o.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="text-center text-sm text-[var(--text-secondary)] py-8">No orders yet</p>}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
