import { Outlet } from 'react-router-dom';
import ThemeToggle from '../../shared/components/ThemeToggle';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-tokyo-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative transition-colors duration-150">
      
      {/* Theme Toggle Button */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg">
            E
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-tokyo-text-bright">
          E-Commerce Admin
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-tokyo-text">
          SaaS Backend Administration Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-tokyo-card py-8 px-4 shadow-sm border border-gray-200 dark:border-tokyo-border sm:rounded-xl sm:px-10 transition-colors duration-150">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
