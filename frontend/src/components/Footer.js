import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[var(--bg-secondary)] border-t border-[var(--surface-border)] mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3
              className="text-2xl font-light mb-4 text-[var(--text-accent)]"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              THE WOMEN
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Premium Indian Ethnic Wear for Women. Elegant, Minimal, Cultural + Modern Fusion.
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] mb-4 text-[var(--brand-secondary)]">
              Shop
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/shop/kurtis"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-accent)] transition-colors"
                >
                  Kurtis
                </Link>
              </li>
              <li>
                <Link
                  to="/shop/ethnic-dresses"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-accent)] transition-colors"
                >
                  Ethnic Dresses
                </Link>
              </li>
              <li>
                <Link
                  to="/shop/festive"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-accent)] transition-colors"
                >
                  Festive Collection
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] mb-4 text-[var(--brand-secondary)]">
              Customer Service
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-accent)] transition-colors"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-accent)] transition-colors"
                >
                  Shipping & Returns
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-accent)] transition-colors"
                >
                  Size Guide
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] mb-4 text-[var(--brand-secondary)]">
              Connect
            </h4>
            <div className="flex space-x-4 mb-4">
              <a
                href="#"
                className="text-[var(--text-secondary)] hover:text-[var(--text-accent)] transition-colors"
              >
                <Instagram size={20} strokeWidth={1.5} />
              </a>
              <a
                href="#"
                className="text-[var(--text-secondary)] hover:text-[var(--text-accent)] transition-colors"
              >
                <Facebook size={20} strokeWidth={1.5} />
              </a>
              <a
                href="#"
                className="text-[var(--text-secondary)] hover:text-[var(--text-accent)] transition-colors"
              >
                <Twitter size={20} strokeWidth={1.5} />
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <Mail size={16} className="text-[var(--text-secondary)]" />
              <a
                href="mailto:hello@thewomen.com"
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-accent)] transition-colors"
              >
                hello@thewomen.com
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--surface-border)] text-center">
          <p className="text-sm text-[var(--text-secondary)]">
            &copy; 2026 The Women. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;