import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, Search, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { name: 'Kurtis', slug: 'kurtis' },
    { name: 'Ethnic Dresses', slug: 'ethnic-dresses' },
    { name: 'Ethnic Sets', slug: 'ethnic-sets-dupatta' },
    { name: 'Co-ord Sets', slug: 'coord-sets' },
    { name: 'Festive', slug: 'festive' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${searchQuery}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          <button
            data-testid="mobile-menu-button"
            className="lg:hidden text-[var(--text-primary)]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link
            to="/"
            data-testid="logo-link"
            className="text-3xl font-light tracking-tight text-[var(--text-accent)]"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            THE WOMEN
          </Link>

          <div className="hidden lg:flex items-center space-x-8">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/shop/${cat.slug}`}
                data-testid={`nav-link-${cat.slug}`}
                className="text-sm uppercase tracking-[0.2em] text-[var(--text-secondary)] hover:text-[var(--text-accent)] transition-colors duration-200"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  data-testid="search-input"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-4 pr-10 py-2 border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
                />
                <button
                  type="submit"
                  data-testid="search-button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <Search size={18} className="text-[var(--text-secondary)]" />
                </button>
              </div>
            </form>

            {user && (
              <Link
                to="/wishlist"
                data-testid="wishlist-link"
                className="text-[var(--text-primary)] hover:text-[var(--brand-primary)] transition-colors"
              >
                <Heart size={20} strokeWidth={1.5} />
              </Link>
            )}

            <Link
              to="/cart"
              data-testid="cart-link"
              className="text-[var(--text-primary)] hover:text-[var(--brand-primary)] transition-colors"
            >
              <ShoppingCart size={20} strokeWidth={1.5} />
            </Link>

            {user ? (
              <div className="relative group">
                <button
                  data-testid="user-menu-button"
                  className="text-[var(--text-primary)] hover:text-[var(--brand-primary)] transition-colors"
                >
                  <User size={20} strokeWidth={1.5} />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      data-testid="admin-link"
                      className="block px-4 py-2 text-sm hover:bg-[var(--bg-secondary)] transition-colors"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <Link
                    to="/dashboard"
                    data-testid="dashboard-link"
                    className="block px-4 py-2 text-sm hover:bg-[var(--bg-secondary)] transition-colors"
                  >
                    My Account
                  </Link>
                  <Link
                    to="/orders"
                    data-testid="orders-link"
                    className="block px-4 py-2 text-sm hover:bg-[var(--bg-secondary)] transition-colors"
                  >
                    Orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    data-testid="logout-button"
                    className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-secondary)] transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                data-testid="login-link"
                className="text-sm uppercase tracking-[0.2em] text-[var(--text-primary)] hover:text-[var(--brand-primary)] transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden bg-[var(--surface-card)] border-t border-[var(--surface-border)] py-4 px-6">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/shop/${cat.slug}`}
              className="block py-2 text-sm uppercase tracking-[0.2em] text-[var(--text-secondary)] hover:text-[var(--text-accent)] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;