import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Unauthorized: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center p-6">
            <h1 className="text-4xl font-semibold text-red-600 mb-4">Access Denied</h1>
            <p className="text-lg text-gray-700 mb-6">
                You do not have permission to view this page.
            </p>
            <Button 
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => navigate("/")}
            >
                Go to Home
            </Button>
        </div>
    );
};

export default Unauthorized;
