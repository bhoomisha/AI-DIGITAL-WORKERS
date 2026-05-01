import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, role } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && role !== requiredRole)
    return <Navigate to={role === 'worker' ? '/worker/dashboard' : '/client/dashboard'} replace />;
  return children;
}
