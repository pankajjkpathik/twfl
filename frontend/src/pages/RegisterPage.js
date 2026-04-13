import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await register(email, password, name, phone);
    setLoading(false);

    if (result.success) {
      toast.success('Account created successfully!');
      navigate('/');
    } else {
      toast.error(result.error || 'Registration failed');
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
            Join Us
          </h1>
          <p className="text-center text-[var(--text-secondary)] mb-8">Create your account</p>

          <form onSubmit={handleSubmit} data-testid="register-form">
            <div className="mb-6">
              <label className="block text-xs uppercase tracking-[0.2em] mb-2 text-[var(--brand-secondary)]">
                Full Name
              </label>
              <input
                type="text"
                data-testid="name-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
              />
            </div>

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
                Phone Number
              </label>
              <input
                type="tel"
                data-testid="phone-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit number"
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

            <div className="mb-6">
              <label className="block text-xs uppercase tracking-[0.2em] mb-2 text-[var(--brand-secondary)]">
                Confirm Password
              </label>
              <input
                type="password"
                data-testid="confirm-password-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
              />
            </div>

            <button
              type="submit"
              data-testid="register-button"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              Already have an account?{' '}
              <Link
                to="/login"
                data-testid="login-link"
                className="text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] transition-colors"
              >
                Sign in
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

export default RegisterPage;