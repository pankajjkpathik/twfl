import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      toast.success('Login successful!');
      navigate('/');
    } else {
      toast.error(result.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-[var(--bg-secondary)]">
      <div className="w-full max-w-md">
        <div className="bg-[var(--surface-card)] p-8 lg:p-12 border border-[var(--surface-border)]">
          <h1
            className="text-4xl font-light mb-2 text-center text-[var(--text-accent)]"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            Welcome Back
          </h1>
          <p className="text-center text-[var(--text-secondary)] mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit} data-testid="login-form">
            <div className="mb-6">
              <label className="block text-xs uppercase tracking-[0.2em] mb-2 text-[var(--brand-secondary)]">
                Email
              </label>
              <input
                type="email"
                data-testid="email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
              />
            </div>

            <div className="mb-6">
              <label className="block text-xs uppercase tracking-[0.2em] mb-2 text-[var(--brand-secondary)]">
                Password
              </label>
              <input
                type="password"
                data-testid="password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
              />
            </div>

            <button
              type="submit"
              data-testid="login-button"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              Don't have an account?{' '}
              <Link
                to="/register"
                data-testid="register-link"
                className="text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/"
            data-testid="back-home-link"
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-accent)] transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;