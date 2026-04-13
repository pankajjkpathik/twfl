import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const emptyProduct = { name: '', description: '', price: '', discount_price: '', images: [''], sizes: ['S', 'M', 'L', 'XL'], colors: [''], fabric: '', category: 'kurtis', stock: '', featured: false, is_new: false, care_instructions: '' };

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyProduct });

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/admin/products`, { withCredentials: true });
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: parseFloat(form.price),
      discount_price: form.discount_price ? parseFloat(form.discount_price) : null,
      stock: parseInt(form.stock),
      images: form.images.filter(Boolean),
      colors: form.colors.filter(Boolean),
    };

    try {
      if (editingId) {
        await axios.put(`${API_URL}/api/admin/products/${editingId}`, payload, { withCredentials: true });
        toast.success('Product updated');
      } else {
        await axios.post(`${API_URL}/api/admin/products`, payload, { withCredentials: true });
        toast.success('Product created');
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ ...emptyProduct });
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name, description: product.description, price: product.price, discount_price: product.discount_price || '',
      images: product.images?.length > 0 ? product.images : [''], sizes: product.sizes || ['S', 'M', 'L', 'XL'],
      colors: product.colors?.length > 0 ? product.colors : [''], fabric: product.fabric || '', category: product.category,
      stock: product.stock, featured: product.featured, is_new: product.is_new, care_instructions: product.care_instructions || '',
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete(`${API_URL}/api/admin/products/${id}`, { withCredentials: true });
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const updateImage = (idx, val) => { const imgs = [...form.images]; imgs[idx] = val; setForm({...form, images: imgs}); };
  const addImage = () => setForm({...form, images: [...form.images, '']});
  const removeImage = (idx) => setForm({...form, images: form.images.filter((_, i) => i !== idx)});
  const updateColor = (idx, val) => { const cols = [...form.colors]; cols[idx] = val; setForm({...form, colors: cols}); };
  const addColor = () => setForm({...form, colors: [...form.colors, '']});
  const removeColor = (idx) => setForm({...form, colors: form.colors.filter((_, i) => i !== idx)});

  const toggleSize = (size) => {
    const sizes = form.sizes.includes(size) ? form.sizes.filter(s => s !== size) : [...form.sizes, size];
    setForm({...form, sizes});
  };

  if (loading) {
    return (<div className="min-h-screen"><Navbar /><div className="flex items-center justify-center py-20"><div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--brand-primary)]"></div></div></div>);
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]" data-testid="admin-products-page">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-normal tracking-tight" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Product Management</h1>
          <button onClick={() => { setShowForm(true); setEditingId(null); setForm({...emptyProduct}); }} className="btn-primary flex items-center space-x-2" data-testid="add-product-button"><Plus size={16} /><span>Add Product</span></button>
        </div>

        <div className="bg-[var(--surface-card)] border border-[var(--surface-border)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-[var(--surface-border)] bg-[var(--bg-secondary)]"><th className="py-3 px-4 text-left text-xs uppercase tracking-wider">Product</th><th className="py-3 px-4 text-left text-xs uppercase tracking-wider">Category</th><th className="py-3 px-4 text-right text-xs uppercase tracking-wider">Price</th><th className="py-3 px-4 text-right text-xs uppercase tracking-wider">Stock</th><th className="py-3 px-4 text-center text-xs uppercase tracking-wider">Featured</th><th className="py-3 px-4 text-right text-xs uppercase tracking-wider">Actions</th></tr></thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-[var(--surface-border)] hover:bg-[var(--bg-secondary)] transition-colors" data-testid={`product-row-${p.id}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-12 overflow-hidden bg-[var(--bg-secondary)] flex-shrink-0 border border-[var(--surface-border)]">
                          {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <span className="truncate max-w-[200px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 capitalize">{p.category?.replace(/-/g, ' ')}</td>
                    <td className="py-3 px-4 text-right">
                      {p.discount_price ? (<><span className="text-[var(--brand-primary)]">₹{p.discount_price}</span><span className="text-[var(--text-secondary)] line-through ml-1 text-xs">₹{p.price}</span></>) : (<span>₹{p.price}</span>)}
                    </td>
                    <td className="py-3 px-4 text-right">{p.stock}</td>
                    <td className="py-3 px-4 text-center">{p.featured ? '⭐' : '—'}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => handleEdit(p)} className="text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)]" data-testid={`edit-product-${p.id}`}><Edit size={14} /></button>
                        <button onClick={() => handleDelete(p.id)} className="text-[var(--surface-error)]" data-testid={`delete-product-${p.id}`}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {products.length === 0 && <p className="text-center py-12 text-sm text-[var(--text-secondary)]">No products found</p>}
        </div>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8" data-testid="product-form-modal">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-normal" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{editingId ? 'Edit' : 'Add'} Product</h2>
              <button onClick={() => setShowForm(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] mb-1 text-[var(--brand-secondary)]">Name</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 text-sm border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)]" data-testid="product-name-input" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] mb-1 text-[var(--brand-secondary)]">Description</label>
                <textarea required value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={3} className="w-full px-3 py-2 text-sm border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)]" data-testid="product-description-input" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-[0.15em] mb-1 text-[var(--brand-secondary)]">Price (₹)</label>
                  <input type="number" required value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} className="w-full px-3 py-2 text-sm border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)]" data-testid="product-price-input" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.15em] mb-1 text-[var(--brand-secondary)]">Sale Price</label>
                  <input type="number" value={form.discount_price} onChange={(e) => setForm({...form, discount_price: e.target.value})} className="w-full px-3 py-2 text-sm border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)]" data-testid="product-sale-price-input" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.15em] mb-1 text-[var(--brand-secondary)]">Stock</label>
                  <input type="number" required value={form.stock} onChange={(e) => setForm({...form, stock: e.target.value})} className="w-full px-3 py-2 text-sm border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)]" data-testid="product-stock-input" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-[0.15em] mb-1 text-[var(--brand-secondary)]">Category</label>
                  <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="w-full px-3 py-2 text-sm border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)]" data-testid="product-category-select">
                    <option value="kurtis">Kurtis</option>
                    <option value="ethnic-dresses">Ethnic Dresses</option>
                    <option value="ethnic-sets-dupatta">Ethnic Sets with Dupatta</option>
                    <option value="ethnic-sets">Ethnic Sets</option>
                    <option value="coord-sets">Co-ord Sets</option>
                    <option value="festive">Festive Collection</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.15em] mb-1 text-[var(--brand-secondary)]">Fabric</label>
                  <input type="text" value={form.fabric} onChange={(e) => setForm({...form, fabric: e.target.value})} className="w-full px-3 py-2 text-sm border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)]" data-testid="product-fabric-input" />
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] mb-2 text-[var(--brand-secondary)]">Image URLs</label>
                {form.images.map((img, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input type="text" value={img} onChange={(e) => updateImage(idx, e.target.value)} placeholder="Image URL" className="flex-1 px-3 py-2 text-sm border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)]" data-testid={`image-input-${idx}`} />
                    {form.images.length > 1 && <button type="button" onClick={() => removeImage(idx)} className="text-[var(--surface-error)]"><X size={16} /></button>}
                  </div>
                ))}
                <button type="button" onClick={addImage} className="text-xs text-[var(--brand-primary)] hover:underline">+ Add Image</button>
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] mb-2 text-[var(--brand-secondary)]">Sizes</label>
                <div className="flex flex-wrap gap-2">
                  {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                    <button key={size} type="button" onClick={() => toggleSize(size)} data-testid={`toggle-size-${size}`}
                      className={`px-4 py-1.5 text-sm border transition-all ${form.sizes.includes(size) ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white' : 'border-[var(--surface-border)]'}`}>{size}</button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] mb-2 text-[var(--brand-secondary)]">Colors</label>
                {form.colors.map((col, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input type="text" value={col} onChange={(e) => updateColor(idx, e.target.value)} placeholder="Color name" className="flex-1 px-3 py-2 text-sm border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)]" />
                    {form.colors.length > 1 && <button type="button" onClick={() => removeColor(idx)} className="text-[var(--surface-error)]"><X size={16} /></button>}
                  </div>
                ))}
                <button type="button" onClick={addColor} className="text-xs text-[var(--brand-primary)] hover:underline">+ Add Color</button>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.15em] mb-1 text-[var(--brand-secondary)]">Care Instructions</label>
                <textarea value={form.care_instructions} onChange={(e) => setForm({...form, care_instructions: e.target.value})} rows={2} className="w-full px-3 py-2 text-sm border border-[var(--surface-border)] bg-transparent focus:outline-none focus:border-[var(--brand-primary)]" />
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm({...form, featured: e.target.checked})} data-testid="product-featured-checkbox" /><span className="text-sm">Featured</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_new} onChange={(e) => setForm({...form, is_new: e.target.checked})} data-testid="product-new-checkbox" /><span className="text-sm">New Arrival</span>
                </label>
              </div>

              <div className="flex gap-4 mt-6">
                <button type="submit" className="flex-1 btn-primary" data-testid="save-product-button">Save Product</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminProducts;
