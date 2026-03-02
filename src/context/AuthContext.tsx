import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { authApi } from '../api/authApi';

export interface RegisterData {
  civility: 'MR' | 'MS' | 'MX';
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  confirmEmail: string;
  password: string;
}

export interface RegisterResponse {
  needsEmailVerification: boolean;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    const userData: User = {
      id: response.id,
      email: response.email,
      name: response.name,
      role: response.role,
    };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
  };

  const register = async (data: RegisterData): Promise<RegisterResponse> => {
    const response = await authApi.register(data);
    
    // Les candidats doivent vérifier leur email
    if (response.emailVerified === false) {
      return {
        needsEmailVerification: true,
        email: response.email,
      };
    }
    
    // Si l'email est déjà vérifié, connecter directement
    const userData: User = {
      id: response.employeeId.toString(),
      email: response.email,
      name: data.firstName + ' ' + data.lastName,
      role: 'candidate',
    };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    return {
      needsEmailVerification: false,
      email: response.email,
    };
  };

  const logout = async () => {
    try {
      // Appeler le backend pour blacklister le token
      await authApi.logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion backend:', error);
      // On continue quand même la déconnexion côté client
    } finally {
      // Nettoyer le state et le localStorage
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
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
