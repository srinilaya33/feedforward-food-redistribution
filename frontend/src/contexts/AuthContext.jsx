import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get('/api/auth/me');
        setUser(response.data.user);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      }
    }
    setLoading(false);
  };

  const setAuthSession = (token, userData) => {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    setIsAuthenticated(true);
  };

  const googleVerify = async (credential) => {
    try {
      const response = await axios.post('/api/auth/google/verify', { credential });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Google verification failed'
      };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user } = response.data;

      setAuthSession(token, user);
      toast.success('Login successful!');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return false;
    }
  };

  const signup = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      const { token, user, volunteerPin } = response.data;

      // For non-admin users, require email verification before allowing dashboard access.
      if (!user.isEmailVerified && user.role !== 'admin') {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        setIsAuthenticated(false);

        let message = 'Registration successful! Please verify your email before logging in.';
        if (volunteerPin) {
          message = `Registration successful! Your Volunteer PIN: ${volunteerPin}. Please verify your email before logging in.`;
        }
        toast.success(message);

        return { success: true, volunteerPin, requiresVerification: true };
      }

      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(user);
      setIsAuthenticated(true);

      if (volunteerPin) {
        toast.success(`Registration successful! Your Volunteer PIN: ${volunteerPin}`);
      } else {
        toast.success('Registration successful!');
      }

      return { success: true, volunteerPin };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
      return { success: false };
    }
  };

  const googleAuth = async (credential) => {
    try {
      const response = await axios.post('/api/auth/google', { credential });
      const { token, user } = response.data;

      setAuthSession(token, user);
      toast.success('Signed in with Google successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Google authentication failed';
      toast.error(message);
      return { success: false };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  const updateUser = (updatedUserData) => {
    setUser(prevUser => ({ ...prevUser, ...updatedUserData }));
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    signup,
    googleAuth,
    googleVerify,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
