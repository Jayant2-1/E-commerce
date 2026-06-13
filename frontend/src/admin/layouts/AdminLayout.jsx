import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { getStoredTokens } from '../../shared/services/api';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Route guarding: check tokens before showing admin shell
  useEffect(() => {
    const tokens = getStoredTokens();
    if (!tokens.accessToken) {
      navigate('/admin/login', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-tokyo-bg transition-colors duration-150 overflow-hidden">
      
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Content wrapper */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        
        {/* Topbar Header */}
        <Header onMenuOpen={() => setSidebarOpen(true)} />
        
        {/* Main section */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <Outlet />
          </div>
        </main>
        
      </div>
    </div>
  );
}
