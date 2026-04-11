import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../types';
import { authApi } from '../api/authApi';
import {
  SESSION_EXPIRED_EVENT,
  endSessionDueToExpiredToken,
  getJwtExpiresAtMs,
  isAccessTokenExpired,
} from '../api/authFetch';

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
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    const onSessionExpired = () => {
      setUser(null);
      navigate('/login', { replace: true, state: { sessionExpired: true } });
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedUser && token && isAccessTokenExpired(token)) {
      endSessionDueToExpiredToken();
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const check = () => {
      const t = localStorage.getItem('token');
      if (t && isAccessTokenExpired(t)) {
        endSessionDueToExpiredToken();
      }
    };
    check();
    const onVis = () => {
      if (document.visibilityState === 'visible') check();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const t = localStorage.getItem('token');
    if (!t) return;
    const expMs = getJwtExpiresAtMs(t);
    if (expMs == null) return;
    const delay = Math.max(0, expMs - Date.now() + 500);
    const id = window.setTimeout(() => {
      const still = localStorage.getItem('token');
      if (still && isAccessTokenExpired(still, 0)) {
        endSessionDueToExpiredToken();
      }
    }, delay);
    return () => window.clearTimeout(id);
  }, [user]);

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
