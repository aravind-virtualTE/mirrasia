import { Navigate, Outlet } from 'react-router-dom';

const checkAuth = () => {
    return localStorage.getItem('isAuthenticated') === 'true';
};

const ProtectedRoute: React.FC = () => {

    const isAuthenticated = checkAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;