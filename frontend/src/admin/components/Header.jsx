import { useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from '../../shared/components/ThemeToggle';
import { clearTokens } from '../../shared/services/api';

export default function Header({ onMenuOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Convert pathname to readable title
  const getPageTitle = () => {
    const segments = location.pathname.split('/').filter(Boolean);
    if (segments.length <= 1) return 'Admin Panel';
    const lastSegment = segments[segments.length - 1];
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
  };

  const handleLogout = () => {
    clearTokens();
    navigate('/admin/login');
  };

  return (
    <header className="h-16 bg-white dark:bg-tokyo-card border-b border-gray-200 dark:border-tokyo-border flex items-center justify-between px-6 sticky top-0 z-10 transition-colors duration-150">
      
      {/* Left section: Breadcrumb and Hamburger */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuOpen}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-tokyo-text focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <h2 className="font-semibold text-gray-800 dark:text-tokyo-text-bright text-lg">
          {getPageTitle()}
        </h2>
      </div>

      {/* Right section: Theme and logout */}
      <div className="flex items-center space-x-3">
        <ThemeToggle />
        
        <div className="h-6 w-px bg-gray-200 dark:bg-tokyo-border" />
        
        <button
          onClick={handleLogout}
          className="flex items-center px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 focus:outline-none transition-colors duration-150"
        >
          <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>

    </header>
  );
}
