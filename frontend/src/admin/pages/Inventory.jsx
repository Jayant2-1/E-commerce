import { useState, useEffect } from 'react';
import { apiRequest, unwrapData } from '../../shared/services/api';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [inventoryMap, setInventoryMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [stockVal, setStockVal] = useState('');
  const [threshVal, setThreshVal] = useState('');

  // ---- Data fetching ----
  const fetchProducts = async () => {
    try {
      setError(null);
      const res = await apiRequest({
        path: '/api/v1/admin/products/search',
        query: { page: 0, size: 200 },
      });
      const data = unwrapData(res);
      const list = Array.isArray(data) ? data : (data?.content || []);
      setProducts(list);
      // Pre-load inventory for all products (in parallel)
      const invMap = {};
      await Promise.all(list.map(async (p) => {
        try {
          const invRes = await apiRequest({
            path: `/api/v1/admin/inventory/product/${p.id}`,
          });
          const invData = unwrapData(invRes);
          if (invData) invMap[p.id] = invData;
        } catch {
          // Fall back to empty inventory
        }
      }));
      setInventoryMap(invMap);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ---- Edit helpers ----
  const startEdit = (product) => {
    const inv = inventoryMap[product.id] || {};
    setEditingItem(product);
    setStockVal(String(inv.stockQuantity ?? product.stockQuantity ?? 0));
    setThreshVal(String(inv.lowStockThreshold ?? product.lowStockThreshold ?? 5));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      setError(null);
      await apiRequest({
        path: '/api/v1/admin/inventory',
        method: 'PUT',
        body: {
          productId: editingItem.id,
          stockQuantity: parseInt(stockVal) || 0,
          lowStockThreshold: parseInt(threshVal) || 0,
        },
      });
      // Update local inventory map
      setInventoryMap(prev => ({
        ...prev,
        [editingItem.id]: {
          productId: editingItem.id,
          stockQuantity: parseInt(stockVal) || 0,
          lowStockThreshold: parseInt(threshVal) || 0,
        },
      }));
      setEditingItem(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // ---- Derived data ----
  const items = products.map(p => {
    const inv = inventoryMap[p.id] || {};
    return {
      id: p.id,
      name: p.name,
      sku: p.sku,
      stockQuantity: inv.stockQuantity ?? p.stockQuantity ?? 0,
      lowStockThreshold: inv.lowStockThreshold ?? p.lowStockThreshold ?? 5,
      reservedQuantity: inv.reservedQuantity ?? 0,
      soldQuantity: inv.soldQuantity ?? 0,
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-tokyo-text-bright">Inventory</h1>
        <p className="text-sm text-gray-500 dark:text-tokyo-text mt-1">Audit stock levels, update safety thresholds, and monitor reservations.</p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Loading state */}
        {loading ? (
          <div className="lg:col-span-3 bg-white dark:bg-tokyo-card border border-gray-200 dark:border-tokyo-border rounded-xl p-10 text-center text-gray-400">
            Loading inventory...
          </div>
        ) : (
          <>
            {/* Inventory list */}
            <div className="lg:col-span-2 bg-white dark:bg-tokyo-card border border-gray-200 dark:border-tokyo-border rounded-xl shadow-sm overflow-hidden transition-colors duration-150">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm text-gray-500 dark:text-tokyo-text">
                  <thead>
                    <tr className="text-xs text-gray-700 dark:text-tokyo-text-bright uppercase bg-gray-50 dark:bg-tokyo-card-hover/50 border-b border-gray-200 dark:border-tokyo-border">
                      <th className="px-6 py-3 font-semibold">Product SKU</th>
                      <th className="px-6 py-3 font-semibold">Physical Stock</th>
                      <th className="px-6 py-3 font-semibold">Threshold</th>
                      <th className="px-6 py-3 font-semibold">Reserved</th>
                      <th className="px-6 py-3 font-semibold">Status</th>
                      <th className="px-6 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-tokyo-border">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-10 text-center text-gray-400 dark:text-tokyo-text">
                          No products found in the catalog.
                        </td>
                      </tr>
                    ) : (
                      items.map((i) => {
                        const isLow = i.stockQuantity <= i.lowStockThreshold;
                        return (
                          <tr key={i.id} className="hover:bg-gray-50 dark:hover:bg-tokyo-card-hover/30">
                            <td className="px-6 py-4">
                              <div className="font-semibold text-gray-900 dark:text-tokyo-text-bright">{i.name}</div>
                              <div className="text-xs font-mono text-gray-400">{i.sku}</div>
                            </td>
                            <td className="px-6 py-4 font-bold text-gray-900 dark:text-tokyo-text-bright">{i.stockQuantity}</td>
                            <td className="px-6 py-4 font-medium">{i.lowStockThreshold}</td>
                            <td className="px-6 py-4">{i.reservedQuantity}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                isLow
                                  ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-tokyo-red'
                                  : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                              }`}>
                                {isLow ? 'Low Stock' : 'Healthy'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => startEdit(i)}
                                className="px-2.5 py-1 text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-tokyo-card-hover text-gray-700 dark:text-tokyo-text-bright rounded-lg transition-colors"
                              >
                                Modify Stock
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Edit Panel card */}
            <div>
              {editingItem ? (
                <div className="bg-white dark:bg-tokyo-card border border-gray-200 dark:border-tokyo-border rounded-xl p-6 shadow-sm sticky top-24 transition-colors duration-150">
                  <h3 className="font-bold text-gray-900 dark:text-tokyo-text-bright text-lg pb-3 border-b border-gray-100 dark:border-tokyo-border mb-4">
                    Modify Stock Quantity
                  </h3>
                  
                  <div className="mb-4 text-sm">
                    Product: <strong className="text-gray-900 dark:text-tokyo-text-bright">{editingItem.name}</strong>
                  </div>

                  <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-tokyo-text uppercase mb-1">Physical Stock Count *</label>
                      <input
                        type="number"
                        required
                        value={stockVal}
                        onChange={e => setStockVal(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-tokyo-border rounded-lg bg-white dark:bg-tokyo-card text-gray-900 dark:text-tokyo-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-tokyo-text uppercase mb-1">Low Stock Threshold *</label>
                      <input
                        type="number"
                        required
                        value={threshVal}
                        onChange={e => setThreshVal(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-tokyo-border rounded-lg bg-white dark:bg-tokyo-card text-gray-900 dark:text-tokyo-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-brand-600 hover:bg-brand-700 dark:bg-tokyo-blue dark:hover:bg-tokyo-blue/80 text-white rounded-lg text-sm font-semibold transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingItem(null)}
                        className="px-4 py-2 border border-gray-300 dark:border-tokyo-border rounded-lg text-sm font-medium text-gray-700 dark:text-tokyo-text bg-white dark:bg-tokyo-card hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="bg-gray-100 dark:bg-tokyo-card border border-dashed border-gray-300 dark:border-tokyo-border rounded-xl p-8 text-center text-gray-400 dark:text-tokyo-text sticky top-24 transition-colors duration-150">
                  <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                  Select an item to edit its inventory details.
                </div>
              )}
            </div>
          </>
        )}

      </div>

    </div>
  );
}