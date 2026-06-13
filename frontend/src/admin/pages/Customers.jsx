import { useState, useEffect } from 'react';
import { apiRequest, unwrapData } from '../../shared/services/api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // ---- Data fetching ----
  const fetchCustomers = async () => {
    try {
      setError(null);
      const res = await apiRequest({ path: '/api/v1/admin/users' });
      const data = unwrapData(res);
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // ---- Actions ----
  const toggleStatus = async (id, currentActive) => {
    try {
      setError(null);
      await apiRequest({
        path: `/api/v1/admin/users/${id}/status`,
        method: 'PATCH',
        body: { active: !currentActive },
      });
      setCustomers(prev =>
        prev.map(c => (c.id === id ? { ...c, isActive: !currentActive } : c))
      );
      if (selectedCustomer?.id === id) {
        setSelectedCustomer(prev => ({ ...prev, isActive: !currentActive }));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer account?')) return;
    try {
      setError(null);
      await apiRequest({ path: `/api/v1/admin/users/${id}`, method: 'DELETE' });
      setCustomers(prev => prev.filter(c => c.id !== id));
      if (selectedCustomer?.id === id) setSelectedCustomer(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // ---- Derived data ----
  const filteredCustomers = customers.filter(c => {
    const name = `${c.fullName ?? c.name ?? ''}`.toLowerCase();
    const email = (c.email ?? '').toLowerCase();
    const role = (c.role ?? '').toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || email.includes(q) || role.includes(q);
  });

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-tokyo-text-bright">Customers</h1>
        <p className="text-sm text-gray-500 dark:text-tokyo-text mt-1">Audit customer details, manage roles, toggle profile statuses, and view all user metadata.</p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Search Filter bar */}
      <div className="bg-white dark:bg-tokyo-card border border-gray-200 dark:border-tokyo-border rounded-xl p-4 shadow-sm transition-colors duration-150">
        <div className="relative max-w-md">
          <input
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-tokyo-border rounded-lg bg-gray-50 dark:bg-tokyo-card-hover/20 text-gray-900 dark:text-tokyo-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
            placeholder="Search by name, email, or role..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="bg-white dark:bg-tokyo-card border border-gray-200 dark:border-tokyo-border rounded-xl p-10 text-center text-gray-400">
          Loading customers...
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Customers Table */}
          <div className="xl:col-span-2 bg-white dark:bg-tokyo-card border border-gray-200 dark:border-tokyo-border rounded-xl shadow-sm overflow-hidden transition-colors duration-150">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-gray-500 dark:text-tokyo-text">
                <thead>
                  <tr className="text-xs text-gray-700 dark:text-tokyo-text-bright uppercase bg-gray-50 dark:bg-tokyo-card-hover/50 border-b border-gray-200 dark:border-tokyo-border">
                    <th className="px-6 py-3 font-semibold">Avatar</th>
                    <th className="px-6 py-3 font-semibold">Customer Details</th>
                    <th className="px-6 py-3 font-semibold">Role</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-tokyo-border">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-gray-400 dark:text-tokyo-text">
                        No customers found with search query "{search}".
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((c) => {
                      const displayName = c.fullName ?? c.name ?? 'Unknown';
                      const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase();
                      const isSelected = selectedCustomer?.id === c.id;
                      return (
                        <tr
                          key={c.id}
                          className={`hover:bg-gray-50 dark:hover:bg-tokyo-card-hover/30 cursor-pointer transition-colors ${isSelected ? 'bg-brand-50/50 dark:bg-tokyo-blue/5' : ''}`}
                          onClick={() => setSelectedCustomer(c)}
                        >
                          <td className="px-6 py-4">
                            <div className="w-9 h-9 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-tokyo-blue font-semibold text-sm flex items-center justify-center">
                              {initials}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900 dark:text-tokyo-text-bright">{displayName}</div>
                            <div className="text-xs text-gray-400">{c.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                              c.role === 'ADMIN' ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400' : 'bg-gray-100 dark:bg-zinc-500/10 text-gray-700 dark:text-gray-400'
                            }`}>
                              {c.role || 'USER'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              c.isActive ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'
                            }`}>
                              {c.isActive ? 'Active' : 'Deactivated'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleStatus(c.id, c.isActive); }}
                                className={`px-2.5 py-1 text-xs rounded-lg font-medium border transition-colors ${
                                  c.isActive
                                    ? 'border-gray-300 dark:border-tokyo-border hover:bg-gray-50 dark:hover:bg-tokyo-card-hover text-gray-700 dark:text-tokyo-text-bright'
                                    : 'border-emerald-300 dark:border-emerald-500/20 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                }`}
                              >
                                {c.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                                className="p-1.5 rounded-lg text-red-600 dark:text-tokyo-red hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10"
                                title="Delete Account"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Customer Detail Panel */}
          <div>
            {selectedCustomer ? (
              <div className="bg-white dark:bg-tokyo-card border border-gray-200 dark:border-tokyo-border rounded-xl p-6 shadow-sm sticky top-24 transition-colors duration-150">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-tokyo-border mb-4">
                  <h3 className="font-bold text-gray-900 dark:text-tokyo-text-bright text-lg">User Details</h3>
                  <button onClick={() => setSelectedCustomer(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-tokyo-text-bright">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Avatar + Name */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-14 h-14 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-tokyo-blue font-bold text-xl flex items-center justify-center">
                    {selectedCustomer.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-tokyo-text-bright text-lg">{selectedCustomer.fullName}</p>
                    <p className="text-sm text-gray-500 dark:text-tokyo-text">{selectedCustomer.email}</p>
                  </div>
                </div>

                {/* All Fields */}
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-tokyo-card-hover/20 rounded-xl p-4 border border-gray-100 dark:border-tokyo-border/50">
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-tokyo-text uppercase mb-3">Account Information</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-500 dark:text-tokyo-text">User ID (UUID)</span>
                        <span className="text-xs font-mono text-gray-900 dark:text-tokyo-text-bright ml-2 text-right break-all max-w-[200px]">{selectedCustomer.id}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-500 dark:text-tokyo-text">Full Name</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-tokyo-text-bright">{selectedCustomer.fullName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-500 dark:text-tokyo-text">Email Address</span>
                        <span className="text-sm text-gray-900 dark:text-tokyo-text-bright">{selectedCustomer.email}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-500 dark:text-tokyo-text">Phone Number</span>
                        <span className="text-sm text-gray-900 dark:text-tokyo-text-bright font-mono">{selectedCustomer.phone || '—'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-500 dark:text-tokyo-text">Password Hash (bcrypt)</span>
                        <span className="text-xs font-mono text-gray-900 dark:text-tokyo-text-bright ml-2 text-right break-all max-w-[200px] select-all">{selectedCustomer.password || '—'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-tokyo-card-hover/20 rounded-xl p-4 border border-gray-100 dark:border-tokyo-border/50">
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-tokyo-text uppercase mb-3">Status & Permissions</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-500 dark:text-tokyo-text">Role</span>
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                          selectedCustomer.role === 'ADMIN' ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400' : 'bg-gray-100 dark:bg-zinc-500/10 text-gray-700 dark:text-gray-400'
                        }`}>
                          {selectedCustomer.role || 'USER'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-500 dark:text-tokyo-text">Active Status</span>
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          selectedCustomer.isActive ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'
                        }`}>
                          {selectedCustomer.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-500 dark:text-tokyo-text">Email Verified</span>
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                          selectedCustomer.isEmailVerified ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
                        }`}>
                          {selectedCustomer.isEmailVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-tokyo-card-hover/20 rounded-xl p-4 border border-gray-100 dark:border-tokyo-border/50">
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-tokyo-text uppercase mb-3">Metadata</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-500 dark:text-tokyo-text">Profile Image URL</span>
                        <span className="text-xs text-gray-900 dark:text-tokyo-text-bright text-right break-all max-w-[200px]">{selectedCustomer.profileImageUrl || '—'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-500 dark:text-tokyo-text">Registered At</span>
                        <span className="text-xs text-gray-900 dark:text-tokyo-text-bright">{formatDate(selectedCustomer.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Copy hash note */}
                  <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-xl px-4 py-3 text-xs text-amber-700 dark:text-amber-400">
                    <strong>Note:</strong> This is the bcrypt password hash from the database. Click and copy to inspect. Token fields are not exposed via the admin API endpoint.
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 mt-6 pt-4 border-t border-gray-100 dark:border-tokyo-border">
                  <button
                    onClick={() => toggleStatus(selectedCustomer.id, selectedCustomer.isActive)}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg border transition-colors ${
                      selectedCustomer.isActive
                        ? 'border-gray-300 dark:border-tokyo-border text-gray-700 dark:text-tokyo-text hover:bg-gray-50 dark:hover:bg-tokyo-card-hover'
                        : 'border-emerald-300 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                    }`}
                  >
                    {selectedCustomer.isActive ? 'Deactivate User' : 'Activate User'}
                  </button>
                  <button
                    onClick={() => handleDelete(selectedCustomer.id)}
                    className="flex-1 py-2 text-sm font-semibold rounded-lg border border-red-300 dark:border-red-500/20 text-red-600 dark:text-tokyo-red hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    Delete User
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-100 dark:bg-tokyo-card border border-dashed border-gray-300 dark:border-tokyo-border rounded-xl p-8 text-center text-gray-400 dark:text-tokyo-text sticky top-24 transition-colors duration-150">
                <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
                Select a customer to view full account details.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}