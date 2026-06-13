import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getStoredTokens, clearTokens, apiRequest, unwrapData } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!getStoredTokens().accessToken);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [isCartDrawerOpen, setCartDrawerOpen] = useState(false);

  const refreshAuth = useCallback(async () => {
    const tokens = getStoredTokens();
    const hasToken = !!tokens.accessToken;

    if (!hasToken) {
      setIsLoggedIn(false);
      setUser(null);
      setCartCount(0);
      return;
    }

    setIsLoggedIn(true);

    try {
      const res = await apiRequest({ path: '/api/v1/auth/me' });
      setUser(unwrapData(res));
    } catch {
      // Token might have expired - try refreshing
      if (tokens.refreshToken) {
        try {
          const refreshRes = await apiRequest({ path: '/api/v1/auth/refresh', method: 'POST', body: { refreshToken: tokens.refreshToken }, auth: false });
          const refreshData = unwrapData(refreshRes);
          if (refreshData?.accessToken) {
            localStorage.setItem('ecommerce_user_tokens', JSON.stringify({
              accessToken: refreshData.accessToken,
              refreshToken: refreshData.refreshToken || tokens.refreshToken,
            }));
            setIsLoggedIn(true);
            const meRes = await apiRequest({ path: '/api/v1/auth/me' });
            setUser(unwrapData(meRes));
          } else {
            throw new Error('Refresh failed');
          }
        } catch {
          clearTokens();
          setIsLoggedIn(false);
          setUser(null);
          setCartCount(0);
          return;
        }
      } else {
        clearTokens();
        setIsLoggedIn(false);
        setUser(null);
        setCartCount(0);
        return;
      }
    }

    try {
      const res = await apiRequest({ path: '/api/v1/cart' });
      const cart = unwrapData(res);
      setCartCount(cart?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0);
    } catch {
      // Cart may not exist yet for new users, ignore
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const login = (tokens) => {
    if (tokens?.accessToken) {
      localStorage.setItem('ecommerce_user_tokens', JSON.stringify(tokens));
      setIsLoggedIn(true);
      refreshAuth();
    }
  };

  const logout = () => {
    clearTokens();
    setIsLoggedIn(false);
    setUser(null);
    setCartCount(0);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, cartCount, setCartCount, refreshAuth, login, logout, isCartDrawerOpen, setCartDrawerOpen }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}