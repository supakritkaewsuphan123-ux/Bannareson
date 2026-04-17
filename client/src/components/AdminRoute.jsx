import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { profile, loading } = useAuth();

  if (loading) {
    return <div className="h-screen flex items-center justify-center font-bold text-slate-400">Loading...</div>;
  }

  if (!profile || profile.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
