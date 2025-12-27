import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userId: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Profils de test disponibles
export const TEST_PROFILES: User[] = [
  {
    id: 'user-001',
    email: 'maitre1@example.com',
    name: 'Maître de Jeu 1',
  },
  {
    id: 'user-002',
    email: 'maitre2@example.com',
    name: 'Maître de Jeu 2',
  },
  {
    id: 'player-001',
    email: 'warrior@example.com',
    name: 'Thorgrim',
  },
  {
    id: 'player-002',
    email: 'mage@example.com',
    name: 'Lyra',
  },
  {
    id: 'player-003',
    email: 'rogue@example.com',
    name: 'Raven',
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (userId: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const selectedUser = TEST_PROFILES.find(p => p.id === userId);
      if (selectedUser) {
        setUser(selectedUser);
        localStorage.setItem('user', JSON.stringify(selectedUser));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}