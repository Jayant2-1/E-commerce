import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiRequest, storeTokens, unwrapData } from '../../../shared/services/api';

export default function Login() {
  const [email, setEmail] = useState('admin@amazon.local');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest({
        path: '/api/v1/auth/login',
        method: 'POST',
        auth: false,
        body: { email, password },
      });
      
      const data = unwrapData(response);
      const tokens = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      };
      
      // Store admin token (separate from user tokens) and redirect to dashboard
      localStorage.setItem('ecommerce_admin_tokens', JSON.stringify(tokens));
      navigate('/admin/dashboard', { replace: true });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-tokyo-text-bright text-center">
        Sign in to your account
      </h3>

      {error && (
        <div className="p-3 rounded-lg border bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-xs text-rose-800 dark:text-tokyo-red">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-gray-500 dark:text-tokyo-text uppercase mb-1">Email Address</label>
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-tokyo-border rounded-lg bg-white dark:bg-tokyo-card text-gray-900 dark:text-tokyo-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-tokyo-blue"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-xs font-semibold text-gray-500 dark:text-tokyo-text uppercase">Password</label>
          <Link to="/admin/forgot-password" className="text-xs text-brand-600 dark:text-tokyo-blue hover:underline">
            Forgot Password?
          </Link>
        </div>
        <input
          type="password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-tokyo-border rounded-lg bg-white dark:bg-tokyo-card text-gray-900 dark:text-tokyo-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-tokyo-blue"
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-brand-600 hover:bg-brand-700 dark:bg-tokyo-blue dark:hover:bg-tokyo-blue/80 text-white rounded-lg text-sm font-semibold transition-colors shadow flex justify-center items-center disabled:opacity-55"
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </div>
    </form>
  );
}
