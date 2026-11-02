import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../../types';
import { api } from '../../lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  updateUser: (updated: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bharat_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
    };
    window.addEventListener('auth:logout', handleLogout);

    const checkAuth = async () => {
      const token = localStorage.getItem('bharat_access_token');
      if (token) {
        try {
          const res = await api.get<User>('/auth/me/');
          setUser(res.data);
          localStorage.setItem('bharat_user', JSON.stringify(res.data));
        } catch {
          // handled by interceptor
        }
      }
      setIsLoading(false);
    };

    checkAuth();
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<AuthResponse>('/auth/login/', { email, password });
    localStorage.setItem('bharat_access_token', res.data.access);
    localStorage.setItem('bharat_refresh_token', res.data.refresh);
    localStorage.setItem('bharat_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const register = async (email: string, password: string, displayName: string) => {
    const res = await api.post<AuthResponse>('/auth/register/', {
      email,
      password,
      display_name: displayName,
    });
    localStorage.setItem('bharat_access_token', res.data.access);
    localStorage.setItem('bharat_refresh_token', res.data.refresh);
    localStorage.setItem('bharat_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('bharat_access_token');
    localStorage.removeItem('bharat_refresh_token');
    localStorage.removeItem('bharat_user');
    setUser(null);
  };

  const updateUser = (updated: Partial<User>) => {
    if (user) {
      const merged = { ...user, ...updated };
      setUser(merged);
      localStorage.setItem('bharat_user', JSON.stringify(merged));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

