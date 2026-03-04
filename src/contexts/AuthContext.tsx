'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'citizen' | 'health_worker' | 'doctor' | 'admin';
  language: string;
  district?: string;
  state?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateLanguage: (lang: string) => void;
}

interface RegisterData {
  name: string;
  phone: string;
  email?: string;
  password: string;
  role?: string;
  language?: string;
  district?: string;
  state?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check existing session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('session_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/auth', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phone: string, password: string) => {
    try {
      const response = await fetch('/api/auth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });

      const data = await response.json();

      if (data.success && data.user && data.token) {
        localStorage.setItem('session_token', data.token);
        setUser(data.user);
        return { success: true };
      }

      return { success: false, error: data.error || 'Login failed' };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success && result.user && result.token) {
        localStorage.setItem('session_token', result.token);
        setUser(result.user);
        return { success: true };
      }

      return { success: false, error: result.error || 'Registration failed' };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('session_token');
      setUser(null);
    }
  };

  const updateLanguage = (lang: string) => {
    if (user) {
      setUser({ ...user, language: lang });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      updateLanguage
    }}>
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

// Role-based permission checks
export const rolePermissions = {
  citizen: ['view_facilities', 'symptom_check', 'book_appointment', 'emergency', 'view_own_records'],
  health_worker: ['view_patients', 'edit_patients', 'view_alerts', 'create_alerts', 'vaccination', 'all_citizen'],
  doctor: ['view_all_patients', 'edit_health_records', 'prescribe', 'diagnose', 'all_health_worker'],
  admin: ['manage_users', 'manage_facilities', 'view_analytics', 'manage_system', 'all_doctor']
};

export function hasPermission(userRole: string, permission: string): boolean {
  const permissions = rolePermissions[userRole as keyof typeof rolePermissions] || [];
  if (permissions.includes(permission)) return true;
  if (permissions.includes('all_citizen') && rolePermissions.citizen.includes(permission)) return true;
  if (permissions.includes('all_health_worker')) {
    if (rolePermissions.citizen.includes(permission) || rolePermissions.health_worker.includes(permission)) return true;
  }
  if (permissions.includes('all_doctor')) {
    if (rolePermissions.citizen.includes(permission) || rolePermissions.health_worker.includes(permission) || rolePermissions.doctor.includes(permission)) return true;
  }
  return false;
}
