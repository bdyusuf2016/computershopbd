import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: 'admin' | 'staff';
  avatar?: string;
  permissions: string[]; // e.g., ['billing:read', 'billing:write', 'inventory:read']
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Mock login for now
    if (username === 'admin' && password === 'admin123') {
      const mockUser: User = {
        id: '1',
        username: 'admin',
        fullName: 'Admin User',
        role: 'admin',
        avatar: 'https://picsum.photos/seed/admin/40/40',
        permissions: ['*'] // Admin has all permissions
      };
      setUser(mockUser);
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      return true;
    } else if (username === 'staff' && password === 'staff123') {
      const mockUser: User = {
        id: '2',
        username: 'staff',
        fullName: 'Staff User',
        role: 'staff',
        avatar: 'https://picsum.photos/seed/staff/40/40',
        permissions: ['billing:read', 'customers:read', 'inventory:read']
      };
      setUser(mockUser);
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user || !user.permissions) return false;
    if (user.permissions.includes('*')) return true;
    return user.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
