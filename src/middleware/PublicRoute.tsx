import jwtDecode from "jwt-decode";
import { Navigate, Outlet } from "react-router-dom";
import { TokenData } from "./ProtectedRoutes";

const PublicRoute: React.FC = () => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const token = localStorage.getItem("token");

  // If the user is authenticated, redirect them to the appropriate dashboard
  if (isAuthenticated && token) {
    try {
      const decodedToken = jwtDecode<TokenData>(token);
      // console.log("Decoded Token:", decodedToken);

      if (['admin', 'master'].includes(decodedToken.role)) {
        return <Navigate to="/admin-dashboard" replace />;
      } else if (decodedToken.role === 'hk_shdr') {
        return <Navigate to="/viewboard" replace />;
      } else {
        return <Navigate to="/dashboard" replace />;
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      // If token is invalid, clear authentication and allow access to public routes
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("token");
    }
  }

  // If not authenticated or token is invalid, allow access to public routes
  return <Outlet />;
};

export default PublicRoute;