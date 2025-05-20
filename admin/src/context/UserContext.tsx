import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api } from '../api/api';

interface User {
  username: string;
  isAdmin: boolean;
}

export interface CurrentAdmin {
  username: string;
  is_superuser: boolean;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  currentAdmin: CurrentAdmin | null;
  setUser: (user: User | null) => void;
  fetchUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentAdmin, setCurrentAdmin] = useState<CurrentAdmin | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        const response = await api.get('/admin/auth/me');
        setUser({
          username: response.data.username,
          isAdmin: response.data.is_superuser
        });
        setCurrentAdmin({
          username: response.data.username,
          is_superuser: response.data.is_superuser
        });
      } catch (error) {
        console.error('Failed to fetch user data', error);
        setUser(null);
        setCurrentAdmin(null);
      }
    } else {
      setUser(null);
      setCurrentAdmin(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (localStorage.getItem('token')) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, currentAdmin, loading, setUser, fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 