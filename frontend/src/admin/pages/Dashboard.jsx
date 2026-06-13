import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest, unwrapData } from '../../shared/services/api';

export default function Dashboard() {
  const [stats, setStats] = useState([
    { label: 'Total Revenue', value: '$0.00', change: null, isUp: null, iconBg: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
    { label: 'Orders', value: '0', change: null, isUp: null, iconBg: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    { label: 'Active Products', value: '0', change: null, isUp: null, iconBg: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' },
    { label: 'Total Customers', value: '0', change: null, isUp: null, iconBg: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
  ]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setError(null);
        // Fetch orders for count and revenue
        const ordersRes = await apiRequest({ path: '/api/v1/admin/orders' });
        const ordersData = unwrapData(ordersRes);
        const orders = Array.isArray(ordersData) ? ordersData : (ordersData?.content || []);
        const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount ?? o.amount ?? 0), 0);
        const recent = orders.slice(0, 4);

        // Fetch products count
        const productsRes = await apiRequest({ path: '/api/v1/admin/products/search', query: { page: 0, size: 1 } });
        const productsData = unwrapData(productsRes);
        const totalProducts = productsData?.totalElements ?? (Array.isArray(productsData) ? productsData.length : 0);

        // Fetch users count
        const usersRes = await apiRequest({ path: '/api/v1/admin/users' });
        const usersData = unwrapData(usersRes);
        const totalUsers = Array.isArray(usersData) ? usersData.length : 0;

        setStats([
          { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, change: null, isUp: null, iconBg: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
          { label: 'Orders', value: String(orders.length), change: null, isUp: null, iconBg: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' },
          { label: 'Active Products', value: String(totalProducts), change: null, isUp: null, iconBg: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' },
          { label: 'Total Customers', value: String(totalUsers), change: null, isUp: null, iconBg: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
        ]);
        setRecentOrders(recent);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const statusColor = (status) => {
    switch (status) {
      case 'DELIVERED': case 'Delivered': return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
      case 'SHIPPED': case 'Shipped': return 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400';
      case 'PROCESSING': case 'Processing': return 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400';
      default: return 'bg-gray-50 dark:bg-zinc-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-tokyo-text-bright">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-tokyo-text mt-1">Real-time store metrics and recent activity overview.</p>
        </div>
        <Link to="/admin/analytics" className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-tokyo-border rounded-lg text-sm font-medium text-gray-700 dark:text-tokyo-text bg-white dark:bg-tokyo-card hover:bg-gray-50 dark:hover:bg-tokyo-card-hover transition-colors shadow-sm">
          View Detailed Analytics
        </Link>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Metrics Grid */}
      {loading ? (
        <div className="bg-white dark:bg-tokyo-card border border-gray-200 dark:border-tokyo-border rounded-xl p-10 text-center text-gray-400">
          Loading dashboard data...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white dark:bg-tokyo-card border border-gray-200 dark:border-tokyo-border rounded-xl p-6 shadow-sm transition-colors duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-tokyo-text">{stat.label}</span>
                  <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-gray-900 dark:text-tokyo-text-bright">{stat.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white dark:bg-tokyo-card border border-gray-200 dark:border-tokyo-border rounded-xl p-6 shadow-sm transition-colors duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-tokyo-border mb-4">
              <h3 className="font-semibold text-gray-800 dark:text-tokyo-text-bright">Recent Orders</h3>
              <Link to="/admin/orders" className="text-xs font-semibold text-brand-600 dark:text-tokyo-blue hover:underline">
                View All
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No orders yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm text-gray-500 dark:text-tokyo-text">
                  <thead>
                    <tr className="text-xs text-gray-700 dark:text-tokyo-text-bright uppercase bg-gray-50 dark:bg-tokyo-card-hover/50">
                      <th className="px-6 py-3 font-semibold">Order ID</th>
                      <th className="px-6 py-3 font-semibold">Customer</th>
                      <th className="px-6 py-3 font-semibold">Date</th>
                      <th className="px-6 py-3 font-semibold">Status</th>
                      <th className="px-6 py-3 font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-tokyo-border">
                    {recentOrders.map((order) => {
                      const status = order.orderStatus ?? order.status ?? 'PENDING';
                      return (
                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-tokyo-card-hover/30">
                          <td className="px-6 py-4 font-semibold text-gray-900 dark:text-tokyo-text-bright">{order.orderId ?? order.id}</td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900 dark:text-tokyo-text-bright">{order.user?.fullName ?? order.customer ?? ''}</div>
                            <div className="text-xs text-gray-400">{order.user?.email ?? order.email ?? ''}</div>
                          </td>
                          <td className="px-6 py-4">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : order.date}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColor(status)}`}>
                              {status}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-900 dark:text-tokyo-text-bright">
                            ${(order.totalAmount ?? order.amount ?? 0).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
}