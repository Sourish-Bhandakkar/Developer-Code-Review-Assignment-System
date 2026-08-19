import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [developerProfile, setDeveloperProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setDeveloperProfile(null);
      setLoading(false);
      return;
    }

    try {
      const data = await authService.getProfile();
      setUser(data.user);
      if (data.developerProfile) {
        setDeveloperProfile(data.developerProfile);
      } else {
        setDeveloperProfile(null);
      }
    } catch (err) {
      console.error('Session validation failed:', err);
      // Clear expired storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setDeveloperProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      await checkAuth(); // Load detailed profile info
      return data.user;
    } catch (err) {
      setError(err.message || 'Login failed');
      setLoading(false);
      throw err;
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.register(name, email, password);
      setUser(data.user);
      await checkAuth(); // Load profile defaults
      return data.user;
    } catch (err) {
      setError(err.message || 'Registration failed');
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setDeveloperProfile(null);
  };

  const updateLocalAvailability = (newAvailability) => {
    if (developerProfile) {
      setDeveloperProfile(prev => ({
        ...prev,
        availability: newAvailability
      }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        developerProfile,
        loading,
        error,
        login,
        register,
        logout,
        checkAuth,
        updateLocalAvailability
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
