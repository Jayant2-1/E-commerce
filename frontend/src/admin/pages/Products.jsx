import { useState, useEffect } from 'react';
import { apiRequest, unwrapData } from '../../shared/services/api';
import ImagePlaceholder from '../../shared/components/ImagePlaceholder';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [active, setActive] = useState(true);

  // ---- Data fetching ----
  const fetchProducts = async () => {
    try {
      setError(null);
      const res = await apiRequest({
        path: '/api/v1/admin/products/search',
        query: { keyword: search, page: 0, size: 200 },
      });
      const data = unwrapData(res);
      // The response may be a paged object with .content or an array directly
      const list = Array.isArray(data) ? data : (data?.content || []);
      setProducts(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await apiRequest({ path: '/api/v1/admin/categories' });
      const data = unwrapData(res);
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      // Non-critical – fall back to empty list
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Re-fetch on search after a debounce-like timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // ---- Modal helpers ----
  const openCreateModal = () => {
    setEditProduct(null);
    setName('');
    setSku('');
    setPrice('');
    setStock('');
    setCategoryId('');
    setActive(true);
    setShowModal(true);
  };

  const openEditModal = (p) => {
    setEditProduct(p);
    setName(p.name);
    setSku(p.sku);
    setPrice(String(p.price));
    setStock(String(p.stockQuantity ?? p.stock ?? ''));
    setCategoryId(p.categoryId ?? p.category?.id ?? '');
    setActive(p.active);
    setShowModal(true);
  };

  // ---- CRUD operations ----
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const body = {
        name,
        sku,
        price: parseFloat(price) || 0,
        active,
        categoryId: categoryId || null,
        stockQuantity: parseInt(stock) || 0,
        lowStockThreshold: 5,
      };

      if (editProduct) {
        await apiRequest({
          path: `/api/v1/admin/products/${editProduct.id}`,
          method: 'PUT',
          body,
        });
      } else {
        await apiRequest({
          path: '/api/v1/admin/products',
          method: 'POST',
          body,
        });
      }
      setShowModal(false);
      await fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      setError(null);
      await apiRequest({ path: `/api/v1/admin/products/${id}`, method: 'DELETE' });
      await fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  // ---- Derived data ----
  const filteredProducts = products.filter(p => {
    if (categoryFilter === 'All') return true;
    const catId = p.categoryId ?? p.category?.id ?? '';
    return String(catId) === categoryFilter;
  });

  // ---- Render ----
  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-tokyo-text-bright">Products</h1>
          <p className="text-sm text-gray-500 dark:text-tokyo-text mt-1">Manage catalog items, pricing, SKUs, and stock records.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 dark:bg-tokyo-blue dark:hover:bg-tokyo-blue/80 shadow transition-colors"
        >
          Add Product
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Filter and search bar */}
      <div className="bg-white dark:bg-tokyo-card border border-gray-200 dark:border-tokyo-border rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-colors duration-150">
        <div className="relative flex-1 max-w-md">
          <input
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-tokyo-border rounded-lg bg-gray-50 dark:bg-tokyo-card-hover/20 text-gray-900 dark:text-tokyo-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-tokyo-blue transition-all"
            placeholder="Search by name, SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-tokyo-border rounded-lg bg-white dark:bg-tokyo-card text-gray-700 dark:text-tokyo-text text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-tokyo-blue transition-all"
          >
            <option value="All">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="bg-white dark:bg-tokyo-card border border-gray-200 dark:border-tokyo-border rounded-xl p-10 text-center text-gray-400">
          Loading products...
        </div>
      ) : (
        /* Products list grid/table */
        <div className="bg-white dark:bg-tokyo-card border border-gray-200 dark:border-tokyo-border rounded-xl shadow-sm overflow-hidden transition-colors duration-150">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-gray-500 dark:text-tokyo-text">
              <thead>
                <tr className="text-xs text-gray-700 dark:text-tokyo-text-bright uppercase bg-gray-50 dark:bg-tokyo-card-hover/50 border-b border-gray-200 dark:border-tokyo-border">
                  <th className="px-6 py-3 font-semibold w-20">Image</th>
                  <th className="px-6 py-3 font-semibold">Product Name</th>
                  <th className="px-6 py-3 font-semibold">SKU</th>
                  <th className="px-6 py-3 font-semibold">Category</th>
                  <th className="px-6 py-3 font-semibold">Price</th>
                  <th className="px-6 py-3 font-semibold">Stock</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-tokyo-border">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-10 text-center text-gray-400 dark:text-tokyo-text">
                      No products found. Add a new item to get started.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-tokyo-card-hover/30">
                      <td className="px-6 py-4">
                        <ImagePlaceholder className="w-12 h-12" text="" />
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-tokyo-text-bright">
                        {p.name}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono">{p.sku}</td>
                      <td className="px-6 py-4">{p.category?.name ?? p.categoryName ?? ''}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-tokyo-text-bright">
                        ${(p.price ?? 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        <span className={(p.stockQuantity ?? p.stock ?? 0) <= 10 ? 'text-red-500 font-bold' : ''}>
                          {p.stockQuantity ?? p.stock ?? 0} units
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          p.active ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'
                        }`}>
                          {p.active ? 'Active' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1 rounded-md text-gray-500 dark:text-tokyo-text hover:text-gray-900 dark:hover:text-tokyo-text-bright hover:bg-gray-100 dark:hover:bg-tokyo-card-hover"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1 rounded-md text-red-600 dark:text-tokyo-red hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10"
                            title="Delete"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Dialog Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-tokyo-card border border-gray-200 dark:border-tokyo-border rounded-xl w-full max-w-lg shadow-xl overflow-hidden transition-colors duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-tokyo-border">
              <h3 className="font-bold text-gray-900 dark:text-tokyo-text-bright text-lg">
                {editProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-tokyo-text-bright">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-tokyo-text uppercase mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-tokyo-border rounded-lg bg-white dark:bg-tokyo-card text-gray-900 dark:text-tokyo-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-tokyo-blue"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-tokyo-text uppercase mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={e => setSku(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-tokyo-border rounded-lg bg-white dark:bg-tokyo-card text-gray-900 dark:text-tokyo-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-tokyo-blue"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-tokyo-text uppercase mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-tokyo-border rounded-lg bg-white dark:bg-tokyo-card text-gray-900 dark:text-tokyo-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-tokyo-blue"
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-tokyo-text uppercase mb-1">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-tokyo-border rounded-lg bg-white dark:bg-tokyo-card text-gray-900 dark:text-tokyo-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-tokyo-blue"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-tokyo-text uppercase mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={e => setStock(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-tokyo-border rounded-lg bg-white dark:bg-tokyo-card text-gray-900 dark:text-tokyo-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-tokyo-blue"
                  />
                </div>
              </div>

              {/* Empty Image Container Placeholder Area */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-tokyo-text uppercase mb-1">Product Images</label>
                <div className="grid grid-cols-3 gap-2">
                  <ImagePlaceholder className="h-20" text="Main Image" />
                  <ImagePlaceholder className="h-20" text="Detail 1" />
                  <ImagePlaceholder className="h-20" text="Detail 2" />
                </div>
                <p className="text-[10px] text-gray-400 dark:text-tokyo-text mt-1">Image uploads will write empty frames to this space.</p>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="active-check"
                  checked={active}
                  onChange={e => setActive(e.target.checked)}
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:focus:ring-tokyo-blue bg-white dark:bg-tokyo-card"
                />
                <label htmlFor="active-check" className="text-sm font-medium text-gray-700 dark:text-tokyo-text-bright">Make Active and publish to storefront</label>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100 dark:border-tokyo-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-tokyo-border rounded-lg text-sm font-medium text-gray-700 dark:text-tokyo-text bg-white dark:bg-tokyo-card hover:bg-gray-50 dark:hover:bg-tokyo-card-hover"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 dark:bg-tokyo-blue dark:hover:bg-tokyo-blue/80"
                >
                  {editProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}