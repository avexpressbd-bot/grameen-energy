
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CustomerUser } from '../types';
import { db, auth } from '../services/firebase';
import firebaseConfig from '../firebase-applet-config.json';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

interface AuthContextType {
  user: CustomerUser | null;
  staffRole: 'admin' | 'pos' | null;
  login: (id: string, password: string) => Promise<'admin' | 'pos' | 'customer' | 'technician' | false>;
  register: (userData: Omit<CustomerUser, 'uid' | 'createdAt' | 'accountId'>, password: string, role?: 'customer' | 'technician') => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<CustomerUser>) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [staffRole, setStaffRole] = useState<'admin' | 'pos' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Handle Firebase Auth (Anonymous as fallback)
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        signInAnonymously(auth).catch(err => {
          console.error("Anonymous Auth Error:", err.message);
          if (err.code === 'auth/admin-restricted-operation') {
            const projectId = (firebaseConfig as any).projectId;
            console.warn(`ACTION REQUIRED: Enable 'Anonymous' sign-in provider in Firebase Console for project [${projectId}].`);
            console.warn(`Go to: https://console.firebase.google.com/project/${projectId}/authentication/providers`);
          }
        });
      }
    });

    // 2. Handle Local Custom Auth
    const savedUser = localStorage.getItem('ge_customer_user');
    const savedStaff = localStorage.getItem('ge_staff_role');
    
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Auth: Failed to parse saved user", e);
        localStorage.removeItem('ge_customer_user');
      }
    }
    if (savedStaff) setStaffRole(savedStaff as 'admin' | 'pos');
    
    setLoading(false);

    return () => unsubAuth();
  }, []);

  const login = async (id: string, password: string): Promise<'admin' | 'pos' | 'customer' | 'technician' | false> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      if (data.success) {
        if (data.role === 'admin') {
          setStaffRole('admin');
          localStorage.setItem('ge_staff_role', 'admin');
          return 'admin';
        } else if (data.role === 'pos') {
          setStaffRole('pos');
          localStorage.setItem('ge_staff_role', 'pos');
          return 'pos';
        } else {
          setUser(data.user);
          localStorage.setItem('ge_customer_user', JSON.stringify(data.user));
          return data.user.role === 'technician' ? 'technician' : 'customer';
        }
      }
    } catch (error: any) {
      console.error("AuthContext Login error:", error);
      throw error;
    }
    return false;
  };

  const register = async (userData: Omit<CustomerUser, 'uid' | 'createdAt' | 'accountId'>, password: string, role: 'customer' | 'technician' = 'customer') => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userData, password, role })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('ge_customer_user', JSON.stringify(data.user));
        return true;
      }
    } catch (error: any) {
      console.error("AuthContext Register error:", error);
      throw error;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setStaffRole(null);
    localStorage.removeItem('ge_customer_user');
    localStorage.removeItem('ge_staff_role');
  };

  const updateProfile = async (data: Partial<CustomerUser>) => {
    if (!user) return;
    try {
      const updated = { ...user, ...data };
      const response = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: user.phone, data })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Profile update failed');
      }

      setUser(updated);
      localStorage.setItem('ge_customer_user', JSON.stringify(updated));
    } catch (error: any) {
      console.error("AuthContext Profile Update error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, staffRole, login, register, logout, updateProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
