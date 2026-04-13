import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);

  const heroSlides = [
    {
      image: 'https://images.unsplash.com/photo-1756483509164-e9e652cb51bb?w=1920&h=800&fit=crop',
      title: 'Festive Collection',
      subtitle: 'Celebrate in Style',
    },
    {
      image: 'https://images.unsplash.com/photo-1756483509177-bbabd67a3234?w=1920&h=800&fit=crop',
      title: 'Elegant Ethnic Wear',
      subtitle: 'Timeless Beauty',
    },
  ];

  const categories = [
    {
      name: 'Kurtis',
      slug: 'kurtis',
      image: 'https://images.unsplash.com/photo-1768651925875-d1523ed07cb6?w=400&h=500&fit=crop',
    },
    {
      name: 'Festive Collection',
      slug: 'festive',
      image: 'https://images.unsplash.com/photo-1756483510859-c0ab4c45782c?w=400&h=500&fit=crop',
    },
    {
      name: 'Co-ord Sets',
      slug: 'coord-sets',
      image: 'https://images.unsplash.com/photo-1768803968260-3dab844c1476?w=400&h=500&fit=crop',
    },
  ];

  useEffect(() => {
    fetchProducts();
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async () => {
    try {
      const [featured, newArr] = await Promise.all([
        axios.get(`${API_URL}/api/products/featured/list`),
        axios.get(`${API_URL}/api/products/new-arrivals/list`),
      ]);
      setFeaturedProducts(featured.data.products || []);
      setNewArrivals(newArr.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const ProductCard = ({ product }) => (
    <Link to={`/product/${product.id}`} className="card-product group" data-testid={`product-card-${product.id}`}>
      <div className="relative overflow-hidden aspect-[3/4]">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.discount_price && (
          <div className="absolute top-4 left-4 bg-[var(--brand-primary)] text-[var(--text-inverse)] px-3 py-1 text-xs uppercase tracking-wider">
            Sale
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          {product.name}
        </h3>
        <div className="flex items-center space-x-2">
          {product.discount_price ? (
            <>
              <span className="text-[var(--brand-primary)] font-medium">₹{product.discount_price}</span>
              <span className="text-[var(--text-secondary)] line-through text-sm">₹{product.price}</span>
            </>
          ) : (
            <span className="text-[var(--brand-primary)] font-medium">₹{product.price}</span>
          )}
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="relative h-[80vh] overflow-hidden" data-testid="hero-section">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
            <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full">
                <div className="max-w-xl">
                  <p className="text-xs uppercase tracking-[0.2em] mb-4 text-[var(--brand-secondary)]">
                    {slide.subtitle}
                  </p>
                  <h1
                    className="text-5xl sm:text-6xl lg:text-7xl mb-8 text-white font-light tracking-tight leading-none"
                    style={{ fontFamily: 'Cormorant Garamond, serif' }}
                  >
                    {slide.title}
                  </h1>
                  <Link
                    to="/shop"
                    data-testid="shop-now-button"
                    className="inline-block btn-primary"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={prevSlide}
          data-testid="prev-slide-button"
          className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all flex items-center justify-center"
        >
          <ChevronLeft className="text-white" size={24} />
        </button>
        <button
          onClick={nextSlide}
          data-testid="next-slide-button"
          className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all flex items-center justify-center"
        >
          <ChevronRight className="text-white" size={24} />
        </button>
      </section>

      <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto" data-testid="categories-section">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.2em] mb-4 text-[var(--brand-secondary)]">Explore</p>
          <h2
            className="text-3xl sm:text-4xl font-normal tracking-tight"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            Shop by Category
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/shop/${cat.slug}`}
              className="group relative overflow-hidden aspect-[4/5]" data-testid={`category-${cat.slug}`}
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
              <div className="absolute inset-0 flex items-end p-6">
                <h3
                  className="text-3xl text-white font-light"
                  style={{ fontFamily: 'Cormorant Garamond, serif' }}
                >
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {featuredProducts.length > 0 && (
        <section className="py-20 px-6 lg:px-12 bg-[var(--bg-secondary)]" data-testid="featured-section">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs uppercase tracking-[0.2em] mb-4 text-[var(--brand-secondary)]">
                Curated for You
              </p>
              <h2
                className="text-3xl sm:text-4xl font-normal tracking-tight"
                style={{ fontFamily: 'Cormorant Garamond, serif' }}
              >
                Best Sellers
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="text-center mt-12">
              <Link
                to="/shop"
                data-testid="view-all-button"
                className="inline-flex items-center space-x-2 text-sm uppercase tracking-[0.2em] text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] transition-colors"
              >
                <span>View All</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {newArrivals.length > 0 && (
        <section className="py-20 px-6 lg:px-12" data-testid="new-arrivals-section">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs uppercase tracking-[0.2em] mb-4 text-[var(--brand-secondary)]">
                Just In
              </p>
              <h2
                className="text-3xl sm:text-4xl font-normal tracking-tight"
                style={{ fontFamily: 'Cormorant Garamond, serif' }}
              >
                New Arrivals
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {newArrivals.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-20 px-6 lg:px-12 bg-[var(--bg-secondary)]" data-testid="newsletter-section">
        <div className="max-w-2xl mx-auto text-center">
          <h2
            className="text-3xl sm:text-4xl mb-4 font-normal tracking-tight"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            Stay Connected
          </h2>
          <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
            Subscribe to our newsletter for exclusive offers and new collection updates.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              data-testid="newsletter-email-input"
              className="flex-1 px-6 py-3 border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
            />
            <button
              type="submit"
              data-testid="newsletter-submit-button"
              className="btn-primary"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;