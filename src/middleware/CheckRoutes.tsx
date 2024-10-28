import { Navigate } from "react-router-dom";
import { ReactNode } from 'react';

const checkAuth = () => {
    return localStorage.getItem('isAuthenticated') === 'true';
  };
  
  const ProtectedRoute = ({ children }:  { children: ReactNode }) => {
    const isAuthenticated = checkAuth();
    
    if (!isAuthenticated) {
      return <Navigate to="/" replace />;
    }
  
    return children;
  };

  export default ProtectedRoute