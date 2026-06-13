import { useState, useEffect } from 'react';
import { apiRequest, unwrapData } from '../../shared/services/api';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');

  // ---- Data fetching ----
  const fetchCategories = async () => {
    try {
      setError(null);
      const res = await apiRequest({ path: '/api/v1/admin/categories' });
      const data = unwrapData(res);
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ---- Modal helpers ----
  const openCreateModal = () => {
    setEditCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setParentId('');
    setShowModal(true);
  };

  const openEditModal = (cat) => {
    setEditCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setParentId(cat.parentId || '');
    setShowModal(true);
  };

  // ---- CRUD operations ----
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const body = {
        name,
        slug,
        description,
        parentId: parentId === '' ? null : parentId,
      };

      if (editCategory) {
        await apiRequest({
          path: `/api/v1/admin/categories/${editCategory.id}`,
          method: 'PUT',
          body,
        });
      } else {
        await apiRequest({
          path: '/api/v1/admin/categories',
          method: 'POST',
          body,
        });
      }
      setShowModal(false);
      await fetchCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? All subcategories will lose their parent relation.')) return;
    try {
      setError(null);
      await apiRequest({ path: `/api/v1/admin/categories/${id}`, method: 'DELETE' });
      await fetchCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  // ---- Helpers ----
  const getParentName = (pid) => {
    if (!pid) return '—';
    const parent = categories.find(c => c.id === pid);
    return parent ? parent.name : '—';
  };

  // ---- Render ----
  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-tokyo-text-bright">Categories</h1>
          <p className="text-sm text-gray-500 dark:text-tokyo-text mt-1">Organize catalog items into nested and structured collections.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 dark:bg-tokyo-blue dark:hover:bg-tokyo-blue/80 shadow transition-colors"
        >
          Add Category
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="bg-white dark:bg-tokyo-card border border-gray-200 dark:border-tokyo-border rounded-xl p-10 text-center text-gray-400">
          Loading categories...
        </div>
      ) : (
        /* Categories tree table */
        <div className="bg-white dark:bg-tokyo-card border border-gray-200 dark:border-tokyo-border rounded-xl shadow-sm overflow-hidden transition-colors duration-150">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-gray-500 dark:text-tokyo-text">
              <thead>
                <tr className="text-xs text-gray-700 dark:text-tokyo-text-bright uppercase bg-gray-50 dark:bg-tokyo-card-hover/50 border-b border-gray-200 dark:border-tokyo-border">
                  <th className="px-6 py-3 font-semibold">Category Name</th>
                  <th className="px-6 py-3 font-semibold">Slug Reference</th>
                  <th className="px-6 py-3 font-semibold">Parent Category</th>
                  <th className="px-6 py-3 font-semibold">Description</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-tokyo-border">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-gray-400 dark:text-tokyo-text">
                      No categories registered. Add one to begin.
                    </td>
                  </tr>
                ) : (
                  categories.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-tokyo-card-hover/30">
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-tokyo-text-bright">
                        <span className={c.parentId ? 'pl-4 text-gray-600 dark:text-tokyo-text' : ''}>
                          {c.parentId ? '└ ' : ''}{c.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono">{c.slug}</td>
                      <td className="px-6 py-4">
                        {c.parentId ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-tokyo-card-hover text-gray-800 dark:text-tokyo-text-bright">
                            {getParentName(c.parentId)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">Root Collection</span>
                        )}
                      </td>
                      <td className="px-6 py-4 truncate max-w-xs">{c.description || '—'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(c)}
                            className="p-1 rounded-md text-gray-500 dark:text-tokyo-text hover:text-gray-900 dark:hover:text-tokyo-text-bright hover:bg-gray-100 dark:hover:bg-tokyo-card-hover"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
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
          <div className="bg-white dark:bg-tokyo-card border border-gray-200 dark:border-tokyo-border rounded-xl w-full max-w-md shadow-xl overflow-hidden transition-colors duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-tokyo-border">
              <h3 className="font-bold text-gray-900 dark:text-tokyo-text-bright text-lg">
                {editCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-tokyo-text-bright">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-tokyo-text uppercase mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => {
                    setName(e.target.value);
                    if (!editCategory) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-tokyo-border rounded-lg bg-white dark:bg-tokyo-card text-gray-900 dark:text-tokyo-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-tokyo-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-tokyo-text uppercase mb-1">Slug Reference *</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-tokyo-border rounded-lg bg-white dark:bg-tokyo-card text-gray-900 dark:text-tokyo-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-tokyo-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-tokyo-text uppercase mb-1">Parent Category</label>
                <select
                  value={parentId}
                  onChange={e => setParentId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-tokyo-border rounded-lg bg-white dark:bg-tokyo-card text-gray-900 dark:text-tokyo-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-tokyo-blue"
                >
                  <option value="">-- None (Root Category) --</option>
                  {categories
                    .filter(c => !editCategory || c.id !== editCategory.id) // Avoid self-parenting loop
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))
                  }
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-tokyo-text uppercase mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-tokyo-border rounded-lg bg-white dark:bg-tokyo-card text-gray-900 dark:text-tokyo-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-tokyo-blue"
                />
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
                  {editCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}