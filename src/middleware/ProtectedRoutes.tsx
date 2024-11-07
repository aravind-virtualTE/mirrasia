import { authAtom } from '@/hooks/useAuth';
import { useAtom } from 'jotai';
import { Navigate, Outlet } from 'react-router-dom';

const checkAuth = () => {
    return localStorage.getItem('isAuthenticated') === 'true';
};

const ProtectedRoute: React.FC<{ requiredRole?: string }> = ({ requiredRole }) => {
    const [authUser, ] = useAtom(authAtom);
    const isAuthenticated = checkAuth();
    const { role } = authUser.user || {};
    console.log(requiredRole,"userRole--->",role)
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && role !== requiredRole) {
        return <Navigate to="/unauthorized" replace />;
      }
    

    return <Outlet />;
};

export default ProtectedRoute;