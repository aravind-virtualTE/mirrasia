import { userAtom } from '@/hooks/useAuth';
import { useAtom } from 'jotai';
import { Navigate, Outlet } from 'react-router-dom';

const checkAuth = () => {
    return localStorage.getItem('isAuthenticated') === 'true';
};

const ProtectedRoute: React.FC = () => {
    const [user, ] = useAtom(userAtom);
    const isAuthenticated = checkAuth();
    console.log("user--->",user)
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;