import { useState, useEffect } from 'react';
import { apiRequest, unwrapData } from '../../shared/services/api';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        const [ordersRes, usersRes, productsRes] = await Promise.all([
          apiRequest({ path: '/api/v1/admin/orders' }),
          apiRequest({ path: '/api/v1/admin/users' }),
          apiRequest({ path: '/api/v1/admin/products/search', query: { page: 0, size: 1 } }),
        ]);

        const orders = Array.isArray(unwrapData(ordersRes)) ? unwrapData(ordersRes) : (unwrapData(ordersRes)?.content || []);
        const users = Array.isArray(unwrapData(usersRes)) ? unwrapData(usersRes) : [];
        const productsData = unwrapData(productsRes);
        const totalProducts = productsData?.totalElements ?? (Array.isArray(productsData) ? productsData.length : 0);

        const revenue = orders.reduce((sum, o) => sum + (o.totalAmount ?? o.amount ?? 0), 0);
        const avgOrder = orders.length > 0 ? revenue / orders.length : 0;

        setTotalRevenue(revenue);
        setOrderCount(orders.length);
        setUserCount(users.length);
        setProductCount(totalProducts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const cards = [
    { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, iconBg: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
    { label: 'Total Orders', value: String(orderCount), iconBg: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    { label: 'Total Customers', value: String(userCount), iconBg: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
    { label: 'Active Products', value: String(productCount), iconBg: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-tokyo-text-bright">Analytics & Reports</h1>
        <p className="text-sm text-gray-500 dark:text-tokyo-text mt-1">Review operational benchmarks, visitor traffic reports, and export sales documents.</p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white dark:bg-tokyo-card border border-gray-200 dark:border-tokyo-border rounded-xl p-10 text-center text-gray-400">
          Loading analytics...
        </div>
      ) : (
        <>
          {/* Grid of stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((c, i) => (
              <div key={i} className="bg-white dark:bg-tokyo-card border border-gray-200 dark:border-tokyo-border rounded-xl p-6 shadow-sm transition-colors duration-150">
                <div className="text-xs font-semibold text-gray-500 dark:text-tokyo-text uppercase tracking-wider">{c.label}</div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-3xl font-bold text-gray-900 dark:text-tokyo-text-bright">{c.value}</span>
                </div>
                <p className="text-xs text-gray-400 dark:text-tokyo-text mt-2">Real-time data from database</p>
              </div>
            ))}
          </div>

          {/* Overview section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-tokyo-card border border-gray-200 dark:border-tokyo-border rounded-xl p-6 shadow-sm transition-colors duration-150">
              <h3 className="font-semibold text-gray-800 dark:text-tokyo-text-bright pb-4 border-b border-gray-100 dark:border-tokyo-border mb-6">
                Store Overview
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-tokyo-border/50">
                  <span className="text-sm font-medium text-gray-700 dark:text-tokyo-text-bright">Total Revenue Generated</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-tokyo-text-bright">${totalRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-tokyo-border/50">
                  <span className="text-sm font-medium text-gray-700 dark:text-tokyo-text-bright">Total Orders Placed</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-tokyo-text-bright">{orderCount}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-tokyo-border/50">
                  <span className="text-sm font-medium text-gray-700 dark:text-tokyo-text-bright">Registered Customers</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-tokyo-text-bright">{userCount}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-tokyo-text-bright">Products in Catalog</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-tokyo-text-bright">{productCount}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-tokyo-card border border-gray-200 dark:border-tokyo-border rounded-xl p-6 shadow-sm transition-colors duration-150 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-tokyo-text-bright pb-4 border-b border-gray-100 dark:border-tokyo-border mb-4">
                  Export Operations Report
                </h3>
                <p className="text-xs text-gray-400 dark:text-tokyo-text mb-4">Compile transactional data, user logs, or category details into a CSV file.</p>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-tokyo-text uppercase mb-1">Report Content</label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-tokyo-border rounded-lg bg-white dark:bg-tokyo-card text-gray-900 dark:text-tokyo-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                      <option>Sales Summary ({orderCount} orders, ${totalRevenue.toFixed(2)})</option>
                      <option>Products Inventory ({productCount} items)</option>
                      <option>Registered Users ({userCount} customers)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-tokyo-text uppercase mb-1">Reporting Period</label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-tokyo-border rounded-lg bg-white dark:bg-tokyo-card text-gray-900 dark:text-tokyo-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                      <option>All Time</option>
                      <option>Current Month</option>
                      <option>Last Quarter</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-tokyo-border mt-6">
                <a
                  href={`data:text/csv;charset=utf-8,${encodeURIComponent('Metric,Value\nTotal Revenue,' + totalRevenue.toFixed(2) + '\nTotal Orders,' + orderCount + '\nTotal Customers,' + userCount + '\nProducts,' + productCount)}`}
                  download="analytics-report.csv"
                  className="w-full py-2 bg-brand-600 hover:bg-brand-700 dark:bg-tokyo-blue dark:hover:bg-tokyo-blue/80 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Generate & Export CSV
                </a>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}