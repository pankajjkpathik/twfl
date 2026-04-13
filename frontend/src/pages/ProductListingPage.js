import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Filter, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ProductListingPage = () => {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    size: '',
    color: '',
    fabric: '',
    sort: 'newest',
  });

  useEffect(() => {
    fetchProducts();
  }, [category, filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        ...(category && { category }),
        ...(filters.minPrice && { min_price: filters.minPrice }),
        ...(filters.maxPrice && { max_price: filters.maxPrice }),
        ...(filters.size && { size: filters.size }),
        ...(filters.color && { color: filters.color }),
        ...(filters.fabric && { fabric: filters.fabric }),
        sort: filters.sort,
      };

      const { data } = await axios.get(`${API_URL}/api/products`, { params });
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      size: '',
      color: '',
      fabric: '',
      sort: 'newest',
    });
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1
            className="text-4xl font-normal tracking-tight"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
            data-testid="page-title"
          >
            {category ? category.replace(/-/g, ' ').toUpperCase() : 'All Products'}
          </h1>

          <button
            onClick={() => setShowFilters(!showFilters)}
            data-testid="filter-toggle-button"
            className="lg:hidden flex items-center space-x-2 text-sm uppercase tracking-[0.2em] text-[var(--brand-primary)]"
          >
            <Filter size={16} />
            <span>Filters</span>
          </button>
        </div>

        <div className="flex gap-8">
          <div
            className={`${
              showFilters ? 'block' : 'hidden'
            } lg:block w-full lg:w-64 bg-[var(--surface-card)] border border-[var(--surface-border)] p-6 lg:sticky lg:top-24 h-fit`}
            data-testid="filters-panel"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs uppercase tracking-[0.2em] text-[var(--brand-secondary)]">
                Filters
              </h3>
              <button
                onClick={clearFilters}
                data-testid="clear-filters-button"
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--brand-primary)]"
              >
                Clear
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm mb-2 text-[var(--text-primary)]">
                  Price Range
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    data-testid="min-price-input"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)]"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    data-testid="max-price-input"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-[var(--text-primary)]">Size</label>
                <select
                  value={filters.size}
                  onChange={(e) => handleFilterChange('size', e.target.value)}
                  data-testid="size-filter-select"
                  className="w-full px-3 py-2 text-sm border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)]"
                >
                  <option value="">All Sizes</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2 text-[var(--text-primary)]">Fabric</label>
                <select
                  value={filters.fabric}
                  onChange={(e) => handleFilterChange('fabric', e.target.value)}
                  data-testid="fabric-filter-select"
                  className="w-full px-3 py-2 text-sm border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)]"
                >
                  <option value="">All Fabrics</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Silk">Silk</option>
                  <option value="Georgette">Georgette</option>
                  <option value="Rayon">Rayon</option>
                  <option value="Cotton Silk">Cotton Silk</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2 text-[var(--text-primary)]">Sort By</label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  data-testid="sort-select"
                  className="w-full px-3 py-2 text-sm border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)]"
                >
                  <option value="newest">Newest</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="popular">Popular</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex-1">
            {loading ? (
              <div className="text-center py-20" data-testid="loading-state">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--brand-primary)]"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20" data-testid="empty-state">
                <p className="text-[var(--text-secondary)]">No products found</p>
              </div>
            ) : (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                data-testid="products-grid"
              >
                {products.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="card-product group"
                    data-testid={`product-card-${product.id}`}
                  >
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
                      <h3
                        className="text-lg mb-2"
                        style={{ fontFamily: 'Cormorant Garamond, serif' }}
                      >
                        {product.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {product.discount_price ? (
                          <>
                            <span className="text-[var(--brand-primary)] font-medium">
                              ₹{product.discount_price}
                            </span>
                            <span className="text-[var(--text-secondary)] line-through text-sm">
                              ₹{product.price}
                            </span>
                          </>
                        ) : (
                          <span className="text-[var(--brand-primary)] font-medium">
                            ₹{product.price}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductListingPage;
