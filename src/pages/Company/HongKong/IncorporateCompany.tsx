import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import jwtDecode from "jwt-decode";
import { TokenData } from "@/middleware/ProtectedRoutes";
import {  useNavigate } from 'react-router-dom';
const IncorporateCompany = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token') as string;
    const decodedToken = jwtDecode<TokenData>(token);

  const navigateRoute = () => {
    localStorage.removeItem('companyRecordId');
    if (decodedToken.role === 'admin') {
        navigate('/admin-dashboard');
    }   
    else {
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
            Thank you for completing the Hong Kong company incorporation process with us. We're excited to inform you that your application has been successfully submitted.
          </p>
          <p className="text-700">
            One of our expert representatives will now handle the remaining steps of your incorporation process.
          </p>
          <p className="text-700">
            You can track the progress of your incorporation through your dashboard at any time. We are here to ensure a smooth and efficient experience for you.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <Button className="bg-green-600 hover:bg-green-700" onClick={navigateRoute}>Go to Dashboard</Button>
          {/* <Button variant="outline" className="border-green-600 text-green-600 ">
            Contact Support
          </Button> */}
        </CardFooter>
      </Card>
    </div>
  )
}

export default IncorporateCompany