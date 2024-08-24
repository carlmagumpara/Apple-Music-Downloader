import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from 'src/hooks/useAuth';

const GuestRoute = () => {
  const auth = useAuth();

  return !auth.isAuthenticated ? <Outlet /> : <Navigate to="/" />;
};

export default GuestRoute;