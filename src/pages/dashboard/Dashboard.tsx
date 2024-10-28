import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const navigate = useNavigate();
    
    const handleLogout = () => {
      localStorage.setItem('isAuthenticated', 'false');
      navigate('/');
    };
  
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <ModeToggle />
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Welcome to your logged dashboard!
          </p>
        </div>
      </div>
    );
  };

  export default Dashboard