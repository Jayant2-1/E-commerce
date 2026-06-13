import { useState } from 'react';

export default function Profile() {
  const [fullName, setFullName] = useState('Admin User');
  const [email, setEmail] = useState('admin@amazon.local');
  const [phone, setPhone] = useState('9999999999');
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message, setMessage] = useState(null);

  const handleUpdateDetails = (e) => {
    e.preventDefault();
    setMessage({ type: 'success', text: 'Personal details updated successfully (mocked).' });
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setMessage({ type: 'success', text: 'Account password changed successfully (mocked).' });
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-tokyo-text-bright">My Profile</h1>
        <p className="text-sm text-gray-500 dark:text-tokyo-text mt-1">Manage personal contact data, change sign-in credentials, and view permission levels.</p>
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
        
        {/* Profile Info Details Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-tokyo-card border border-gray-200 dark:border-tokyo-border rounded-xl p-6 shadow-sm transition-colors duration-150">
            <h3 className="font-bold text-gray-900 dark:text-tokyo-text-bright text-lg pb-3 border-b border-gray-100 dark:border-tokyo-border mb-4">
              Personal Information
            </h3>
            <form onSubmit={handleUpdateDetails} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-tokyo-text uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-tokyo-border rounded-lg bg-white dark:bg-tokyo-card text-gray-900 dark:text-tokyo-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-tokyo-text uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-tokyo-border rounded-lg bg-white dark:bg-tokyo-card text-gray-900 dark:text-tokyo-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-tokyo-text uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-tokyo-border rounded-lg bg-white dark:bg-tokyo-card text-gray-900 dark:text-tokyo-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 dark:bg-tokyo-blue dark:hover:bg-tokyo-blue/80 shadow"
                >
                  Update Personal Details
                </button>
              </div>
            </form>
          </div>

          {/* Password Form */}
          <div className="bg-white dark:bg-tokyo-card border border-gray-200 dark:border-tokyo-border rounded-xl p-6 shadow-sm transition-colors duration-150">
            <h3 className="font-bold text-gray-900 dark:text-tokyo-text-bright text-lg pb-3 border-b border-gray-100 dark:border-tokyo-border mb-4">
              Change Account Password
            </h3>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-tokyo-text uppercase mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-tokyo-border rounded-lg bg-white dark:bg-tokyo-card text-gray-900 dark:text-tokyo-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-tokyo-text uppercase mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-tokyo-border rounded-lg bg-white dark:bg-tokyo-card text-gray-900 dark:text-tokyo-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-tokyo-text uppercase mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-tokyo-border rounded-lg bg-white dark:bg-tokyo-card text-gray-900 dark:text-tokyo-text-bright text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 dark:bg-tokyo-blue dark:hover:bg-tokyo-blue/80 shadow"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Security Role overview panel */}
        <div className="bg-white dark:bg-tokyo-card border border-gray-200 dark:border-tokyo-border rounded-xl p-6 shadow-sm transition-colors duration-150 space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-tokyo-text-bright text-lg pb-3 border-b border-gray-100 dark:border-tokyo-border mb-2">
            System Privileges
          </h3>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-tokyo-blue border border-indigo-200 dark:border-indigo-500/20">
              ROLE_ADMIN
            </span>
            <span className="text-xs text-gray-400">Full System Operator</span>
          </div>

          <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-tokyo-border">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-tokyo-text uppercase">Granted Scopes:</h4>
            <ul className="text-xs text-gray-600 dark:text-tokyo-text space-y-2 list-disc pl-4">
              <li>Catalog Write / Read (Products, Categories)</li>
              <li>Order Fulfilment & Invoice status mapping</li>
              <li>Customer Profile moderation / status toggles</li>
              <li>Global system variables adjustment</li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
}
