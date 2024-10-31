import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Logo from '@/common/LogoComponent';
import { useNavigate } from 'react-router-dom';

const LoginComponent = () => {
    const navigate = useNavigate();
    const handleLogin = () => {
        localStorage.setItem('isAuthenticated', 'true');
        navigate('/dashboard');
    };
    const onSignUp = () => {
        navigate('/signup');
      }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Main Login Card */}
        <Card className="bg-white shadow-lg">
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-center mb-4">
              {/* Replace this with your actual Logo component */}
              <Logo width = {30} height = {30} />
              <h1 className="text-2xl font-bold">
                MirAsia
              </h1>
            </div>
            <h2 className="text-2xl font-semibold">Welcome</h2>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Login Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email address*"
                  className="w-full px-3 py-2"
                />
              </div>
              
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="Password*"
                    className="w-full px-3 py-2"
                  />
                  <button 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    aria-label="Toggle password visibility"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="text-right">
                <a href="#" className=" text-sm">
                  Forgot password?
                </a>
              </div>

              <Button className="w-full" onClick={handleLogin}>
                LOGIN
              </Button>

              <div className="relative my-4">
                <Separator className="my-4" />
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-gray-500">
                  OR
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full border-2"
              >
                
                 <img
                src="https://img.icons8.com/?size=100&id=17949&format=png&color=000000"
                alt="Google"
                className="mr-2 h-4 w-4"
              />
                Continue with Google
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sign Up Card */}
        <Card className="bg-white p-4 shadow-lg">
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* <img
                src="/api/placeholder/40/40"
                alt="Sign up illustration"
                className="w-10 h-10"
              /> */}
              <p className="text-sm">Don't have an account yet?</p>
            </div>
            <Button className="underline" onClick={onSignUp}>
              Sign up here
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginComponent;