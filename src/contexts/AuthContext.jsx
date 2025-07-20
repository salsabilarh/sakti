import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const ROLES = {
  ADMIN: 'admin',
  MANAJEMEN: 'manajemen',
  PDO: 'pdo',
  VIEWER: 'viewer',
};

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedAuth = localStorage.getItem('sakti_auth');
    if (savedAuth) {
      const authData = JSON.parse(savedAuth);
      setIsAuthenticated(true);
      setUser(authData.user);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch("https://api-sakti-production.up.railway.app/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.message || "Login gagal" };
      }

      const userData = {
        id: data.data.id,
        email: data.data.email,
        role: data.data.role,
        unit_kerja: data.data.unit_kerja?.name || "-",
        is_verified: data.data.is_verified,
        is_active: data.data.is_active,
      };

      // Simpan token dan user ke localStorage
      localStorage.setItem("sakti_auth", JSON.stringify({
        user: userData,
        token: data.token,
        timestamp: Date.now(),
      }));

      setUser(userData);
      setIsAuthenticated(true);

      return { success: true };
    } catch (err) {
      return { success: false, error: "Terjadi kesalahan saat login" };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('sakti_auth');
  };

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('sakti_auth', JSON.stringify({
      user: updatedUser,
      token: localStorage.getItem("sakti_auth")?.token || '',
      timestamp: Date.now()
    }));
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    updateUser,
    loading,
    ROLES
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
