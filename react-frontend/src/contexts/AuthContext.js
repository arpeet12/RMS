import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { getPermissionsByUsername, getPermissionsById } from '../utils/permissionsStore';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/current-user`, {
        withCredentials: true
      });
      if (response.data.authenticated) {
        let perms = {};
        try {
          if (response.data.permissionsJson) {
            perms = JSON.parse(response.data.permissionsJson) || {};
          }
        } catch (e) {
          perms = {};
        }
        const role = response.data.role;
        if (role === 'AGENT') {
          const uname = response.data.username;
          const id = response.data.id;
          const localPerms = getPermissionsByUsername(uname) || getPermissionsById(id);
          if (localPerms) {
            perms = { ...perms, ...localPerms };
          }
        }
        setUser({ ...response.data, permissions: perms });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        username,
        password
      }, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.data.success) {
        // Update user state with the logged in user
        if (response.data.user) {
          let perms = {};
          try {
            if (response.data.user.permissionsJson) {
              perms = JSON.parse(response.data.user.permissionsJson) || {};
            }
          } catch (e) {
            perms = {};
          }
          const role = response.data.user.role;
          if (role === 'AGENT') {
            const uname = response.data.user.username;
            const id = response.data.user.id;
            const localPerms = getPermissionsByUsername(uname) || getPermissionsById(id);
            if (localPerms) {
              perms = { ...perms, ...localPerms };
            }
          }
          setUser({
            authenticated: true,
            ...response.data.user,
            permissions: perms
          });
        }
        // Also check auth to ensure session is valid
        await checkAuth();
        return { success: true, user: response.data.user };
      } else {
        return { success: false, error: response.data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || 'Invalid username or password';
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
    }
  };

  const register = async (username, password, role = 'CANDIDATE') => {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/register`, {
        username,
        password,
        role
      });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    checkAuth,
    hasPermission: (moduleKey, action) => {
      const role = user?.role;
      if (!role) return false;
      if (role === 'ADMIN' || role === 'OFFICER') return true;
      const perms = user?.permissions || {};
      const modulePerm = perms[moduleKey];
      if (!modulePerm) return false;
      return !!modulePerm[action];
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
