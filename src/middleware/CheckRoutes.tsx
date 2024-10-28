import { Navigate } from "react-router-dom";


const checkAuth = () => {
    return localStorage.getItem('isAuthenticated') === 'true';
  };
  
  const ProtectedRoute = ({ children }) => {
    const isAuthenticated = checkAuth();
    
    if (!isAuthenticated) {
      return <Navigate to="/" replace />;
    }
  
    return children;
  };

  export default ProtectedRoute