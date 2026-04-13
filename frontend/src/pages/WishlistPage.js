import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Heart, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const WishlistPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchWishlist(); }, []);

  const fetchWishlist = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/wishlist`, { withCredentials: true });
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await axios.delete(`${API_URL}/api/wishlist/remove/${productId}`, { withCredentials: true });
      setProducts(products.filter(p => p.id !== productId));
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove');
    }
  };

  if (loading) {
    return (<div className="min-h-screen"><Navbar /><div className="flex items-center justify-center py-20"><div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--brand-primary)]"></div></div></div>);
  }

  return (
    <div className="min-h-screen" data-testid="wishlist-page">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <h1 className="text-4xl sm:text-5xl font-light mb-8 tracking-tight" style={{ fontFamily: 'Cormorant Garamond, serif' }}>My Wishlist</h1>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-[var(--surface-card)] border border-[var(--surface-border)]">
            <Heart size={48} className="mx-auto mb-4 text-[var(--text-secondary)]" />
            <p className="text-[var(--text-secondary)] mb-6">Your wishlist is empty</p>
            <Link to="/shop" className="btn-primary inline-block">Explore Collection</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <div key={product.id} className="card-product group relative" data-testid={`wishlist-item-${product.id}`}>
                <button onClick={() => removeFromWishlist(product.id)} className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors" data-testid={`remove-wishlist-${product.id}`}>
                  <Trash2 size={14} className="text-[var(--surface-error)]" />
                </button>
                <Link to={`/product/${product.id}`}>
                  <div className="relative overflow-hidden aspect-[3/4]">
                    <img src={product.images?.[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {product.discount_price && <div className="absolute top-4 left-4 bg-[var(--brand-primary)] text-[var(--text-inverse)] px-3 py-1 text-xs uppercase tracking-wider">Sale</div>}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg mb-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{product.name}</h3>
                    <div className="flex items-center space-x-2">
                      {product.discount_price ? (<><span className="text-[var(--brand-primary)] font-medium">₹{product.discount_price}</span><span className="text-[var(--text-secondary)] line-through text-sm">₹{product.price}</span></>) : (<span className="text-[var(--brand-primary)] font-medium">₹{product.price}</span>)}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default WishlistPage;
