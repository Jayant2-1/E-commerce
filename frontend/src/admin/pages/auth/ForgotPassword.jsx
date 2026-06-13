import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-tokyo-text-bright text-center">
        Reset password
      </h3>

      {submitted ? (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-sm text-emerald-800 dark:text-emerald-400">
            If an administrator account is registered with <strong>{email}</strong>, a password recovery email will be delivered shortly.
          </div>
          <Link
            to="/admin/login"
            className="block w-full py-2 text-center border border-gray-300 dark:border-tokyo-border rounded-lg text-sm font-medium text-gray-700 dark:text-tokyo-text bg-white dark:bg-tokyo-card hover:bg-gray-50"
          >
            Back to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <p className="text-xs text-gray-500 dark:text-tokyo-text text-center">
            Enter your registered administrator email address and we'll dispatch password recovery options.
          </p>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-tokyo-text uppercase mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-tokyo-border rounded-lg bg-white dark:bg-tokyo-card text-gray-900 dark:text-tokyo-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-tokyo-blue"
              placeholder="admin@amazon.local"
            />
          </div>

          <div className="flex flex-col space-y-3">
            <button
              type="submit"
              className="w-full py-2 bg-brand-600 hover:bg-brand-700 dark:bg-tokyo-blue dark:hover:bg-tokyo-blue/80 text-white rounded-lg text-sm font-semibold transition-colors shadow"
            >
              Send Password Recovery Link
            </button>
            <Link
              to="/admin/login"
              className="w-full py-2 text-center border border-gray-300 dark:border-tokyo-border rounded-lg text-sm font-medium text-gray-700 dark:text-tokyo-text bg-white dark:bg-tokyo-card hover:bg-gray-50 transition-colors"
            >
              Cancel & Return
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
