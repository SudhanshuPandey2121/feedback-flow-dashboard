
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'student' | 'teacher';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  studentId?: string;  // Only for students
  position?: string;   // Only for teachers
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock users for demo
      if (email === 'teacher@example.com' && password === 'password') {
        setUser({
          id: 't1',
          name: 'Dr. Smith',
          email: 'teacher@example.com',
          role: 'teacher',
          department: 'Computer Science',
          position: 'Associate Professor'
        });
      } else if (email === 'student@example.com' && password === 'password') {
        setUser({
          id: 's1',
          name: 'John Doe',
          email: 'student@example.com',
          role: 'student',
          department: 'Computer Science',
          studentId: 'CS2023001'
        });
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
