import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Package, Heart, MapPin, LogOut } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => { await logout(); navigate('/'); };

  const menuItems = [
    { icon: Package, label: 'My Orders', href: '/orders', desc: 'Track and manage your orders' },
    { icon: Heart, label: 'Wishlist', href: '/wishlist', desc: 'Products you love' },
    { icon: MapPin, label: 'Addresses', href: '/addresses', desc: 'Manage your addresses' },
  ];

  return (
    <div className="min-h-screen" data-testid="user-dashboard">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <h1 className="text-4xl sm:text-5xl font-light mb-8 tracking-tight" style={{ fontFamily: 'Cormorant Garamond, serif' }}>My Account</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto bg-[var(--bg-secondary)] flex items-center justify-center mb-3">
                  <User size={28} className="text-[var(--brand-primary)]" />
                </div>
                <h3 className="text-lg" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{user?.name}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{user?.email}</p>
              </div>
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <Link key={item.href} to={item.href} className="flex items-center space-x-3 px-4 py-3 text-sm hover:bg-[var(--bg-secondary)] transition-colors" data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}>
                    <item.icon size={18} className="text-[var(--text-secondary)]" />
                    <span>{item.label}</span>
                  </Link>
                ))}
                <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 text-sm hover:bg-[var(--bg-secondary)] transition-colors text-[var(--surface-error)]" data-testid="dashboard-logout-button">
                  <LogOut size={18} /><span>Logout</span>
                </button>
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.map((item) => (
                <Link key={item.href} to={item.href} className="bg-[var(--surface-card)] border border-[var(--surface-border)] p-6 hover:-translate-y-1 hover:shadow-lg hover:shadow-[rgba(107,23,36,0.05)] transition-all" data-testid={`card-${item.label.toLowerCase().replace(/\s+/g, '-')}`}>
                  <item.icon size={24} className="text-[var(--brand-primary)] mb-3" />
                  <h3 className="text-xl mb-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{item.label}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">{item.desc}</p>
                </Link>
              ))}
            </div>

            <div className="mt-8 bg-[var(--surface-card)] border border-[var(--surface-border)] p-6">
              <h2 className="text-xs uppercase tracking-[0.2em] mb-4 text-[var(--brand-secondary)]">Profile Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div><span className="text-[var(--text-secondary)]">Name:</span> <span className="ml-2">{user?.name}</span></div>
                <div><span className="text-[var(--text-secondary)]">Email:</span> <span className="ml-2">{user?.email}</span></div>
                <div><span className="text-[var(--text-secondary)]">Phone:</span> <span className="ml-2">{user?.phone || 'Not set'}</span></div>
                <div><span className="text-[var(--text-secondary)]">Member Since:</span> <span className="ml-2">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserDashboard;
