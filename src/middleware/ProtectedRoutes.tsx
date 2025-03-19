import { Navigate, Outlet } from "react-router-dom";
import jwtDecode from "jwt-decode";

const checkAuth = () => {
  return localStorage.getItem("isAuthenticated") === "true";
};

export interface TokenData {
  userId: string;
  role: string;
  iat: number;
  exp: number;
}

const ProtectedRoute: React.FC<{ allowedRoles?: string[] }> = ({ allowedRoles }) => {
  const isAuthenticated = checkAuth();
  const token = localStorage.getItem("token") as string;

  if (!token) {
    return <Navigate to="/" replace />;
  }

  const decodedToken = jwtDecode<TokenData>(token);
  // console.log("decodedToken", decodedToken.exp * 1000,Date.now());

  // if (!isAuthenticated) {
  //   return <Navigate to="/login" replace />;
  // }
  const isTokenExpired = decodedToken.exp * 1000 < Date.now();

  if (!isAuthenticated || isTokenExpired) {
    localStorage.removeItem("token");
    localStorage.removeItem("isAuthenticated");
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is not provided, allow access to all authenticated users
  if (!allowedRoles) {
    return <Outlet />;
  }

  // Check if the user's role is included in the allowedRoles array
  if (allowedRoles.length > 0 && !allowedRoles.includes(decodedToken.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;