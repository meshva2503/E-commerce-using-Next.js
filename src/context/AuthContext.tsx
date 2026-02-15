'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

// Create Auth Context
const AuthContext = createContext<any>(null);

// Custom Hook to Use Auth Context
export function useAuth() {
  return useContext(AuthContext);
}

// AuthProvider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Prevents flickering

  // Check authentication status on mount
  useEffect(() => {
    async function checkAuth() {
      const res = await fetch('/api/auth/check-auth'); // API to verify JWT
      setIsAuthenticated(res.ok);
      setLoading(false);
    }
    checkAuth();
  }, []);

  // Function to log out
  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsAuthenticated(false);
  }

  if (loading) return null; // Prevents rendering issues

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
