import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Heart, ShoppingCart, Minus, Plus, Check, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/products/${id}`);
      setProduct(data);
      if (data.sizes?.length > 0) setSelectedSize(data.sizes[0]);
      if (data.colors?.length > 0) setSelectedColor(data.colors[0]);
      const related = await axios.get(`${API_URL}/api/products`, { params: { category: data.category, limit: 4 } });
      setRelatedProducts((related.data.products || []).filter(p => p.id !== id));
    } catch (error) {
      toast.error('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please login to add items to cart'); navigate('/login'); return; }
    if (!selectedSize) { toast.error('Please select a size'); return; }
    try {
      await axios.post(`${API_URL}/api/cart/add`, { product_id: product.id, quantity, size: selectedSize, color: selectedColor || null }, { withCredentials: true });
      toast.success('Added to cart!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add to cart');
    }
  };

  const handleBuyNow = async () => {
    if (!user) { toast.error('Please login first'); navigate('/login'); return; }
    if (!selectedSize) { toast.error('Please select a size'); return; }
    try {
      await axios.post(`${API_URL}/api/cart/add`, { product_id: product.id, quantity, size: selectedSize, color: selectedColor || null }, { withCredentials: true });
      navigate('/cart');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) { toast.error('Please login to add to wishlist'); navigate('/login'); return; }
    try {
      if (isInWishlist) {
        await axios.delete(`${API_URL}/api/wishlist/remove/${product.id}`, { withCredentials: true });
        setIsInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        await axios.post(`${API_URL}/api/wishlist/add/${product.id}`, {}, { withCredentials: true });
        setIsInWishlist(true);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  if (loading) {
    return (<div className="min-h-screen"><Navbar /><div className="flex items-center justify-center py-20"><div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--brand-primary)]"></div></div></div>);
  }

  if (!product) {
    return (<div className="min-h-screen"><Navbar /><div className="max-w-7xl mx-auto px-6 lg:px-12 py-20 text-center"><h1 className="text-2xl mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Product not found</h1><button onClick={() => navigate('/shop')} className="btn-primary">Continue Shopping</button></div></div>);
  }

  return (
    <div className="min-h-screen" data-testid="product-detail-page">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center space-x-1 text-sm text-[var(--text-secondary)] hover:text-[var(--brand-primary)] mb-6 transition-colors" data-testid="back-button">
          <ChevronLeft size={16} /><span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div>
            <div className="aspect-[3/4] mb-4 overflow-hidden border border-[var(--surface-border)] group">
              <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" data-testid="main-product-image" />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img, idx) => (
                  <button key={idx} onClick={() => setSelectedImage(idx)} data-testid={`thumbnail-${idx}`}
                    className={`aspect-square overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-[var(--brand-primary)]' : 'border-[var(--surface-border)] hover:border-[var(--brand-primary)]/50'}`}>
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <p className="text-xs uppercase tracking-[0.2em] mb-2 text-[var(--brand-secondary)]">{product.category?.replace(/-/g, ' ')}</p>
            <h1 className="text-4xl sm:text-5xl font-light mb-4 tracking-tight leading-none" style={{ fontFamily: 'Cormorant Garamond, serif' }} data-testid="product-name">{product.name}</h1>

            <div className="flex items-center space-x-3 mb-6">
              {product.discount_price ? (
                <>
                  <span className="text-3xl text-[var(--brand-primary)] font-medium" data-testid="product-price">₹{product.discount_price}</span>
                  <span className="text-xl text-[var(--text-secondary)] line-through">₹{product.price}</span>
                  <span className="text-xs px-3 py-1 bg-[var(--surface-success)] text-white uppercase tracking-wider">{Math.round(((product.price - product.discount_price) / product.price) * 100)}% OFF</span>
                </>
              ) : (
                <span className="text-3xl text-[var(--brand-primary)] font-medium" data-testid="product-price">₹{product.price}</span>
              )}
            </div>

            <p className="text-[var(--text-secondary)] mb-6 leading-relaxed font-light" data-testid="product-description">{product.description}</p>

            {product.fabric && (
              <div className="mb-4 flex items-center space-x-2">
                <span className="text-xs uppercase tracking-[0.2em] text-[var(--brand-secondary)]">Fabric</span>
                <span className="text-sm text-[var(--text-primary)]">{product.fabric}</span>
              </div>
            )}

            {/* Size Selection */}
            <div className="mb-6 border-t border-[var(--surface-border)] pt-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs uppercase tracking-[0.2em] text-[var(--brand-secondary)]">Select Size</label>
                <button onClick={() => setShowSizeChart(true)} data-testid="size-chart-button" className="text-xs text-[var(--brand-primary)] hover:underline underline-offset-4">Size Chart</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button key={size} onClick={() => setSelectedSize(size)} data-testid={`size-${size}`}
                    className={`px-6 py-2.5 border text-sm tracking-wider transition-all ${selectedSize === size ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white' : 'border-[var(--surface-border)] hover:border-[var(--brand-primary)] text-[var(--text-primary)]'}`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            {product.colors?.length > 0 && (
              <div className="mb-6">
                <label className="text-xs uppercase tracking-[0.2em] mb-3 block text-[var(--brand-secondary)]">Color</label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button key={color} onClick={() => setSelectedColor(color)} data-testid={`color-${color}`}
                      className={`px-6 py-2.5 border text-sm tracking-wider transition-all ${selectedColor === color ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white' : 'border-[var(--surface-border)] hover:border-[var(--brand-primary)]'}`}>
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="text-xs uppercase tracking-[0.2em] mb-3 block text-[var(--brand-secondary)]">Quantity</label>
              <div className="flex items-center space-x-4">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} data-testid="decrease-quantity" className="w-10 h-10 border border-[var(--surface-border)] flex items-center justify-center hover:bg-[var(--bg-secondary)] transition-colors"><Minus size={16} /></button>
                <span className="text-lg font-medium w-8 text-center" data-testid="quantity-display">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} data-testid="increase-quantity" className="w-10 h-10 border border-[var(--surface-border)] flex items-center justify-center hover:bg-[var(--bg-secondary)] transition-colors"><Plus size={16} /></button>
              </div>
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {product.stock > 0 ? (
                <div className="flex items-center space-x-2 text-[var(--surface-success)]"><Check size={16} /><span className="text-sm">In Stock ({product.stock} available)</span></div>
              ) : (
                <span className="text-[var(--surface-error)] text-sm">Out of Stock</span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-8">
              <button onClick={handleAddToCart} data-testid="add-to-cart-button" disabled={product.stock === 0}
                className="flex-1 btn-secondary flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed">
                <ShoppingCart size={18} /><span>Add to Cart</span>
              </button>
              <button onClick={handleBuyNow} data-testid="buy-now-button" disabled={product.stock === 0}
                className="flex-1 btn-primary disabled:opacity-40 disabled:cursor-not-allowed">Buy Now</button>
              <button onClick={handleToggleWishlist} data-testid="wishlist-toggle-button"
                className="w-12 h-12 border border-[var(--surface-border)] flex items-center justify-center hover:bg-[var(--bg-secondary)] transition-colors flex-shrink-0">
                <Heart size={20} className={isInWishlist ? 'fill-[var(--brand-primary)] text-[var(--brand-primary)]' : 'text-[var(--text-secondary)]'} />
              </button>
            </div>

            {/* Care Instructions */}
            {product.care_instructions && (
              <div className="border-t border-[var(--surface-border)] pt-6">
                <h3 className="text-xs uppercase tracking-[0.2em] mb-2 text-[var(--brand-secondary)]">Care Instructions</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{product.care_instructions}</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 pt-12 border-t border-[var(--surface-border)]">
            <h2 className="text-3xl font-normal mb-8 text-center" style={{ fontFamily: 'Cormorant Garamond, serif' }}>You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.slice(0, 4).map((p) => (
                <Link key={p.id} to={`/product/${p.id}`} className="card-product group" data-testid={`related-product-${p.id}`}>
                  <div className="relative overflow-hidden aspect-[3/4]">
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {p.discount_price && <div className="absolute top-4 left-4 bg-[var(--brand-primary)] text-[var(--text-inverse)] px-3 py-1 text-xs uppercase tracking-wider">Sale</div>}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg mb-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{p.name}</h3>
                    <div className="flex items-center space-x-2">
                      {p.discount_price ? (<><span className="text-[var(--brand-primary)] font-medium">₹{p.discount_price}</span><span className="text-[var(--text-secondary)] line-through text-sm">₹{p.price}</span></>) : (<span className="text-[var(--brand-primary)] font-medium">₹{p.price}</span>)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Size Chart Modal */}
      {showSizeChart && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6" onClick={() => setShowSizeChart(false)}>
          <div className="bg-[var(--surface-card)] p-8 max-w-2xl w-full border border-[var(--surface-border)]" onClick={(e) => e.stopPropagation()} data-testid="size-chart-modal">
            <h2 className="text-2xl font-normal mb-6" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Size Chart</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-[var(--surface-border)]"><th className="py-3 text-left text-xs uppercase tracking-[0.15em]">Size</th><th className="py-3 text-left text-xs uppercase tracking-[0.15em]">Bust (in)</th><th className="py-3 text-left text-xs uppercase tracking-[0.15em]">Waist (in)</th><th className="py-3 text-left text-xs uppercase tracking-[0.15em]">Hips (in)</th></tr></thead>
                <tbody>
                  {[['S','32-34','26-28','34-36'],['M','34-36','28-30','36-38'],['L','36-38','30-32','38-40'],['XL','38-40','32-34','40-42'],['XXL','40-42','34-36','42-44']].map(([s,b,w,h]) => (
                    <tr key={s} className="border-b border-[var(--surface-border)]"><td className="py-3">{s}</td><td className="py-3">{b}</td><td className="py-3">{w}</td><td className="py-3">{h}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={() => setShowSizeChart(false)} className="mt-6 btn-primary" data-testid="close-size-chart">Close</button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
