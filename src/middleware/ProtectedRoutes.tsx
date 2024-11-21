// import { authAtom } from '@/hooks/useAuth';
// import { useAtom } from 'jotai';
import { Navigate, Outlet } from 'react-router-dom';
import jwtDecode from 'jwt-decode';

const checkAuth = () => {
    return localStorage.getItem('isAuthenticated') === 'true';
};

export interface TokenData {
    userId: string;
    role: string;
    iat: number;
    exp: number;
  }

const ProtectedRoute: React.FC<{ requiredRole?: string }> = ({ requiredRole }) => {
    // const [authUser,] = useAtom(authAtom);
    const isAuthenticated = checkAuth();
    // const { role } = authUser.user || {};
    const token = localStorage.getItem('token') as string;
    const decodedToken = jwtDecode<TokenData>(token);
    console.log("decodedToken",decodedToken);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && decodedToken.role !== requiredRole) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;