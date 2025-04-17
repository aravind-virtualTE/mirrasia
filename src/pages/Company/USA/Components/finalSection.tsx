import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import jwtDecode from "jwt-decode";
import { TokenData } from "@/middleware/ProtectedRoutes";
import {  useNavigate } from 'react-router-dom';
const FinalSection = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token') as string;
    const decodedToken = jwtDecode<TokenData>(token);

  const navigateRoute = () => {
    // console.log(`decodedToken`,decodedToken)
    if (decodedToken.role === 'admin'|| decodedToken.role === "master") {
        navigate('/admin-dashboard');
    }
    else if (decodedToken.role === 'hk_shdr') {
        navigate('/viewboard');
    }
    else {
        localStorage.removeItem('companyRecordId');
        navigate('/dashboard');
    }
}

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-md shadow-lg border border-green-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-green-600">Congratulations!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-700">
            Thank you for completing the USA company incorporation process with us. We will review the content of your response and our consultant will contact you shortly.
          </p>
          <p>Thank you.</p>
        
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <Button className="bg-green-600 hover:bg-green-700" onClick={navigateRoute}>Go to Dashboard</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default FinalSection