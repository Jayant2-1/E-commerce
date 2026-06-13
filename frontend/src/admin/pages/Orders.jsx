import { useState, useEffect } from 'react';
import { apiRequest, unwrapData } from '../../shared/services/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');

  // ---- Data fetching ----
  const fetchOrders = async () => {
    try {
      setError(null);
      const res = await apiRequest({ path: '/api/v1/admin/orders' });
      const data = unwrapData(res);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ---- Status update ----
  const updateOrderStatus = async (id, newStatus) => {
    try {
      setError(null);
      await apiRequest({
        path: `/api/v1/admin/orders/${id}/status`,
        method: 'PATCH',
        body: { orderStatus: newStatus },
      });
      // Update local state
      setOrders(prev =>
        prev.map(o => (o.id === id ? { ...o, orderStatus: newStatus } : o))
      );
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder(prev => ({ ...prev, orderStatus: newStatus }));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // ---- Derived data ----
  const filteredOrders = orders.filter(o => {
    const status = o.orderStatus ?? o.status ?? '';
    return filterStatus === 'All' || status === filterStatus;
  });

  // ---- Render helpers ----
  const statusColor = (status) => {
    switch (status) {
      case 'DELIVERED': case 'Delivered': return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
      case 'SHIPPED': case 'Shipped': return 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400';
      case 'PROCESSING': case 'Processing': return 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400';
      default: return 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-tokyo-text-bright">Orders</h1>
        <p className="text-sm text-gray-500 dark:text-tokyo-text mt-1">Review orders, manage delivery statuses, and examine transactions.</p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Filter panel */}
      <div className="bg-white dark:bg-tokyo-card border border-gray-200 dark:border-tokyo-border rounded-xl p-4 shadow-sm flex items-center justify-between transition-colors duration-150">
        <span className="text-sm font-medium text-gray-500 dark:text-tokyo-text">Filter by status:</span>
        <div className="flex space-x-2">
          {['All', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterStatus === status
                  ? 'bg-brand-600 text-white dark:bg-tokyo-blue dark:text-tokyo-text-bright'
                  : 'bg-gray-100 hover:bg-gray-200 dark:bg-tokyo-card-hover dark:hover:bg-tokyo-card-hover/80 text-gray-600 dark:text-tokyo-text'
              }`}
            >
              {status === 'PENDING' ? 'Pending' :
               status === 'PROCESSING' ? 'Processing' :
               status === 'SHIPPED' ? 'Shipped' :
               status === 'DELIVERED' ? 'Delivered' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="bg-white dark:bg-tokyo-card border border-gray-200 dark:border-tokyo-border rounded-xl p-10 text-center text-gray-400">
          Loading orders...
        </div>
      ) : (
        /* Orders Table */
        <div className="bg-white dark:bg-tokyo-card border border-gray-200 dark:border-tokyo-border rounded-xl shadow-sm overflow-hidden transition-colors duration-150">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-gray-500 dark:text-tokyo-text">
              <thead>
                <tr className="text-xs text-gray-700 dark:text-tokyo-text-bright uppercase bg-gray-50 dark:bg-tokyo-card-hover/50 border-b border-gray-200 dark:border-tokyo-border">
                  <th className="px-6 py-3 font-semibold">Order ID</th>
                  <th className="px-6 py-3 font-semibold">Customer</th>
                  <th className="px-6 py-3 font-semibold">Purchase Date</th>
                  <th className="px-6 py-3 font-semibold">Payment</th>
                  <th className="px-6 py-3 font-semibold">Total Amount</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-tokyo-border">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center text-gray-400 dark:text-tokyo-text">
                      No orders matching status "{filterStatus === 'All' ? 'All' : filterStatus}".
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => {
                    const status = o.orderStatus ?? o.status ?? 'PENDING';
                    return (
                      <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-tokyo-card-hover/30">
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-tokyo-text-bright">{o.orderId ?? o.id}</td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900 dark:text-tokyo-text-bright">{o.user?.fullName ?? o.customer ?? ''}</div>
                          <div className="text-xs text-gray-400">{o.user?.email ?? o.email ?? ''}</div>
                        </td>
                        <td className="px-6 py-4">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : o.date}</td>
                        <td className="px-6 py-4 text-xs font-medium">{o.paymentMethod ?? o.payment ?? ''}</td>
                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-tokyo-text-bright">
                          ${(o.totalAmount ?? o.amount ?? 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColor(status)}`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-tokyo-card-hover dark:hover:bg-zinc-800 text-gray-700 dark:text-tokyo-text-bright rounded-lg text-xs font-medium transition-colors"
                          >
                            Inspect Details
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
      )}

      {/* Slide-out details drawer overlay */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-gray-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-tokyo-card border-l border-gray-200 dark:border-tokyo-border h-full flex flex-col shadow-2xl transition-colors duration-150">
            
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-tokyo-border flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-tokyo-text-bright text-lg">Order Details</h3>
                <span className="text-xs text-gray-400">{selectedOrder.orderId ?? selectedOrder.id}</span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-tokyo-text-bright"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Drawer Body Scroll */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Order Status Control */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-500 dark:text-tokyo-text uppercase">Modify Status</label>
                <select
                  value={selectedOrder.orderStatus ?? selectedOrder.status ?? 'PENDING'}
                  onChange={e => updateOrderStatus(selectedOrder.id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-tokyo-border rounded-lg bg-white dark:bg-tokyo-card text-gray-900 dark:text-tokyo-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="PENDING">Pending</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                </select>
              </div>

              {/* Customer Info Card */}
              <div className="bg-gray-50 dark:bg-tokyo-card-hover/20 rounded-xl p-4 border border-gray-100 dark:border-tokyo-border/50">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-tokyo-text uppercase mb-2">Customer Information</h4>
                <div className="text-sm font-semibold text-gray-900 dark:text-tokyo-text-bright">{selectedOrder.user?.fullName ?? selectedOrder.customer ?? ''}</div>
                <div className="text-xs text-gray-500 dark:text-tokyo-text mb-3">{selectedOrder.user?.email ?? selectedOrder.email ?? ''}</div>
                
                <h5 className="text-[10px] font-bold text-gray-400 dark:text-tokyo-text uppercase mb-1">Shipping Address</h5>
                <p className="text-xs text-gray-700 dark:text-tokyo-text-bright">
                  {selectedOrder.shippingAddress
                    ? `${selectedOrder.shippingAddress.addressLine1 ?? ''}, ${selectedOrder.shippingAddress.city ?? ''}, ${selectedOrder.shippingAddress.state ?? ''} ${selectedOrder.shippingAddress.postalCode ?? ''}`
                    : selectedOrder.address ?? ''}
                </p>
              </div>

              {/* Items Card */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-tokyo-text uppercase mb-3">Items Summary</h4>
                <div className="divide-y divide-gray-100 dark:divide-tokyo-border">
                  {(selectedOrder.items ?? []).map((item, i) => (
                    <div key={i} className="py-2 flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-tokyo-text-bright">{item.product?.name ?? item.name ?? ''}</span>
                        <span className="text-xs text-gray-400 dark:text-tokyo-text ml-2">x{item.quantity ?? item.qty ?? 0}</span>
                      </div>
                      <span className="font-semibold text-gray-700 dark:text-tokyo-text-bright">${((item.price ?? 0) * (item.quantity ?? item.qty ?? 1)).toFixed(2)}</span>
                    </div>
                  ))}
                  {(!selectedOrder.items || selectedOrder.items.length === 0) && (
                    <div className="py-2 text-sm text-gray-400">No items data available.</div>
                  )}
                </div>
              </div>

              {/* Total Calculation */}
              <div className="pt-4 border-t border-gray-100 dark:border-tokyo-border flex justify-between items-center">
                <span className="text-sm font-bold text-gray-800 dark:text-tokyo-text-bright">Total Invoice Amount</span>
                <span className="text-lg font-black text-gray-900 dark:text-tokyo-text-bright">${(selectedOrder.totalAmount ?? selectedOrder.amount ?? 0).toFixed(2)}</span>
              </div>

            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-gray-100 dark:border-tokyo-border bg-gray-50 dark:bg-tokyo-card-hover/20">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full py-2 bg-brand-600 hover:bg-brand-700 dark:bg-tokyo-blue dark:hover:bg-tokyo-blue/80 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}