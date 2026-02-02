import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isKycFullyApproved, parseStoredUser } from "@/lib/kyc";

const KycGuard = () => {
  const location = useLocation();
  const storedUser = parseStoredUser();
  // console.log("storedUser",storedUser)
  if (storedUser && (storedUser?.role === 'admin' || storedUser?.role === 'master')) {
    return <Outlet />;
  }
  if (!storedUser || !isKycFullyApproved(storedUser)) {
    return <Navigate to="/profile" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
};

export default KycGuard;
