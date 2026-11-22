import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('bhookh_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            logout();
          }
        } catch (e) {
          logout();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res.success && res.token) {
      localStorage.setItem('bhookh_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return { success: true, user: res.user };
    }
    return { success: false, message: res.message || 'Login failed' };
  };

  const register = async (data) => {
    const res = await api.register(data);
    if (res.success && res.token) {
      localStorage.setItem('bhookh_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return { success: true, user: res.user };
    }
    return { success: false, message: res.message || 'Registration failed' };
  };

  const logout = () => {
    localStorage.removeItem('bhookh_token');
    setToken(null);
    setUser(null);
  };

  // Demo shortcut login helper
  const quickLogin = async (roleType) => {
    let email = 'aarav@gmail.com';
    if (roleType === 'super_admin') email = 'admin@bhookh.com';
    if (roleType === 'flora_admin') email = 'flora@bhookh.com';
    return login(email, 'Bhookh@2026');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, quickLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
