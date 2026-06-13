import { useState } from 'react';
import { apiRequest } from '../../shared/services/api';

export default function Settings() {
  const [storeName, setStoreName] = useState('E-Commerce Premium Marketplace');
  const [supportEmail, setSupportEmail] = useState('support@ecommerce.local');
  const [bootstrapKey, setBootstrapKey] = useState('change-this-admin-bootstrap-key');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const saveSettings = (e) => {
    e.preventDefault();
    setMessage({ type: 'success', text: 'General store settings updated successfully (mocked).' });
  };

  const handleBootstrap = async (endpoint) => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await apiRequest({
        path: `/api/v1/demo/${endpoint}`,
        method: 'POST',
        auth: false,
        headers: { 'X-Bootstrap-Key': bootstrapKey },
      });
      setMessage({ type: 'success', text: response?.message || 'Action executed successfully.' });
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-tokyo-text-bright">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-tokyo-text mt-1">Configure storefront behaviors, API connection options, and initialize database records.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg border text-sm ${
          message.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400'
            : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-tokyo-red'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* General Settings */}
        <div className="lg:col-span-2 bg-white dark:bg-tokyo-card border border-gray-200 dark:border-tokyo-border rounded-xl p-6 shadow-sm transition-colors duration-150">
          <h3 className="font-bold text-gray-900 dark:text-tokyo-text-bright text-lg pb-3 border-b border-gray-100 dark:border-tokyo-border mb-4">
            General Store Settings
          </h3>
          <form onSubmit={saveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-tokyo-text uppercase mb-1">Marketplace Name *</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-tokyo-border rounded-lg bg-white dark:bg-tokyo-card text-gray-900 dark:text-tokyo-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-tokyo-text uppercase mb-1">Customer Support Email *</label>
              <input
                type="email"
                required
                value={supportEmail}
                onChange={e => setSupportEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-tokyo-border rounded-lg bg-white dark:bg-tokyo-card text-gray-900 dark:text-tokyo-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-tokyo-text uppercase mb-1">Currency Symbol</label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-tokyo-border rounded-lg bg-white dark:bg-tokyo-card text-gray-900 dark:text-tokyo-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 dark:bg-tokyo-blue dark:hover:bg-tokyo-blue/80 shadow"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>

        {/* Database Bootstrapper Panel */}
        <div className="bg-white dark:bg-tokyo-card border border-gray-200 dark:border-tokyo-border rounded-xl p-6 shadow-sm transition-colors duration-150 space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-tokyo-text-bright text-lg pb-3 border-b border-gray-100 dark:border-tokyo-border mb-2">
            Developer Console
          </h3>
          <p className="text-xs text-gray-400 dark:text-tokyo-text">Use these bootstrap tools to initialize database seed records in development.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-tokyo-text uppercase mb-1">X-Bootstrap-Key</label>
              <input
                type="text"
                value={bootstrapKey}
                onChange={e => setBootstrapKey(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-tokyo-border rounded-lg bg-white dark:bg-tokyo-card text-gray-900 dark:text-tokyo-text-bright text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-tokyo-border">
              <button
                onClick={() => handleBootstrap('bootstrap')}
                disabled={loading}
                className="w-full py-2 border border-brand-500 text-brand-600 hover:bg-brand-50 dark:border-tokyo-blue/50 dark:text-tokyo-blue dark:hover:bg-tokyo-blue/10 rounded-lg text-xs font-semibold transition-colors disabled:opacity-55"
              >
                {loading ? 'Bootstrapping...' : 'Bootstrap Demo Data'}
              </button>

              <button
                onClick={() => handleBootstrap('clear-all-carts')}
                disabled={loading}
                className="w-full py-2 border border-red-500 text-red-600 hover:bg-red-50 dark:border-tokyo-red/50 dark:text-tokyo-red dark:hover:bg-tokyo-red/10 rounded-lg text-xs font-semibold transition-colors disabled:opacity-55"
              >
                Clear All Store Carts
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
