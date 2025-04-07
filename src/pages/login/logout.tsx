import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useResetAllForms } from "@/lib/atom";
const Logout = () => {
  const navigate = useNavigate();
  const resetAllForms = useResetAllForms();
  useEffect(() => {
    const logout = async () => {
      localStorage.setItem("isAuthenticated", "false");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("companyRecordId");
      window.dispatchEvent(new Event("storage"));
      resetAllForms();
      navigate("/");
    };

    logout();
  }, [navigate, resetAllForms]);

  return <p>Logging out...</p>;
};

export default Logout;