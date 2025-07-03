import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';
import type { AdminMe, AdminLogin } from '../types/auth';

interface AuthContextType {
  user: AdminMe | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: AdminLogin) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AdminMe | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const login = async (credentials: AdminLogin) => {
    try {
      setIsLoading(true);
      
      const tokenResponse = await authApi.login(credentials);
      
      // Сохраняем токен в localStorage
      localStorage.setItem('token', tokenResponse.access_token);
      
      // Получаем информацию о пользователе
      const userResponse = await authApi.me();
      setUser(userResponse);
    } catch (error: any) {
      localStorage.removeItem('token');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const userResponse = await authApi.me();
      setUser(userResponse);
    } catch (error) {
      // Токен недействителен, удаляем его
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 