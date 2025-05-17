import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api } from '../api/api';

interface User {
  username: string;
  isAdmin: boolean;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  fetchUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
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
      } catch (error) {
        console.error('Failed to fetch user data', error);
        setUser(null);
      }
    } else {
      setUser(null);
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
    <UserContext.Provider value={{ user, loading, setUser, fetchUser }}>
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