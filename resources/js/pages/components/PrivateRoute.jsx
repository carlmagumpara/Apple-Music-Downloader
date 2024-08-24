import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from 'src/hooks/useAuth';
import { useAntMessage } from 'src/context/ant-message';

const PrivateRoute = () => {
  const antMessage = useAntMessage();
  const location = useLocation();
  const auth = useAuth();

  useEffect(() => {
    if(!auth.isAuthenticated) {
      antMessage.error('Please login or register to view this page');
    }
  }, [auth]);

  return auth.isAuthenticated ? <Outlet /> : <Navigate to={`/login?previousLocation=${location.pathname}`} />;
};

export default PrivateRoute;