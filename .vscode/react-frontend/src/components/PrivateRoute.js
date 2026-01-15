import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children, role, permission }) => {
  const { user, loading, hasPermission } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role-based access control
  if (role) {
    // For ADMIN routes, allow both ADMIN and OFFICER roles
    if (role === 'ADMIN') {
      if (user.role !== 'ADMIN' && user.role !== 'OFFICER') {
        return <Navigate to="/" replace />;
      }
    } else if (role === 'AGENT') {
      if (user.role !== 'AGENT') {
        return <Navigate to="/" replace />;
      }
      if (permission && !hasPermission(permission.module, permission.action)) {
        return <Navigate to="/" replace />;
      }
    } else if (user.role !== role) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default PrivateRoute;
