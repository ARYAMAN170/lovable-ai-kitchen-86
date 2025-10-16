import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Mock User interface
export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for development
const mockUser: User = {
  id: "mock-user-id",
  email: "demo@example.com",
  name: "Demo User",
  created_at: new Date().toISOString(),
  is_active: true
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Automatically set mock user for development
    setTimeout(() => {
      setUser(mockUser);
      setLoading(false);
    }, 500); // Small delay to simulate loading
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Mock successful login
      setUser(mockUser);
      return { error: null };
    } catch (error: any) {
      return { error: 'Login failed' };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Mock successful registration
      const newMockUser = {
        ...mockUser,
        email,
        name,
        id: `mock-${Date.now()}`
      };
      setUser(newMockUser);
      return { error: null };
    } catch (error: any) {
      return { error: 'Registration failed' };
    }
  };

  const signOut = async () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
