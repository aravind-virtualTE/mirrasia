import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
// import Logo from '@/common/LogoComponent';
import { useNavigate } from 'react-router-dom';
import { authAtom, loginWithEmail, loginWithGoogle } from '@/hooks/useAuth';
import { Eye, EyeOff } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useGoogleLogin } from '@react-oauth/google';
import { useAtom } from 'jotai';
import Loader from '@/common/Loader';
const LoginComponent: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, setAuth] = useAtom(authAtom);
  const handleLogin = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // localStorage.setItem('isAuthenticated', 'true');
      const response = await loginWithEmail(email, password);    
      // console.log("response", response)
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem("token", response.token);
      setAuth({ user: response.user, isAuthenticated: true, loading: false, error: null });
      if(response.user.role === 'admin' || response.user.role === 'master') {
        navigate('/admin-dashboard');
      }
      else if(response.user.role === 'sh_dir'){
        navigate('/viewboard');
      }
      else{
        navigate('/dashboard');
      }
    } catch (err) {
      console.log("err.response?.data?.message", err)
      setError('Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (credentialResponse) => {
      setIsLoading(true); // Show loader
      // Handle successful login, e.g., send credentialResponse to your backend
      // console.log('credentialResponse', credentialResponse);
      await loginWithGoogle(credentialResponse.access_token)
        .then((response) => {
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('token', response.token);
          // console.log('response', response);
  
          setAuth({ user: response.user, isAuthenticated: true, loading: false, error: null });
  
          if (response.user.role === 'admin') {
            navigate('/admin-dashboard');
          } else {
            navigate('/dashboard');
          }
        })
        .catch((error) => {
          console.error('Google login failed:', error);
          setError('Google sign in failed. Please try again.');
        })
        .finally(() => {
          setIsLoading(false); // Hide loader in all cases
        });
    },
    onError: (error) => {
      // Handle errors, e.g., display an error message to the user
      console.log("err", error)
      setError('Google sign in failed. Please try again.');
      setIsLoading(false); // Hide loader for error case
    },
  });



  const onSignUp = () => {
    navigate('/signup');
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setEmailError('Invalid email address');
    } else {
      setEmailError('');
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    validateEmail(e.target.value);
  };
  if (isLoading) {
    // Show full-page loader
    return <Loader />;
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-4">
        <Card className="bg-white shadow-lg">
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-center mb-4">
              {/* <Logo width={30} height={30} />
              <h1 className="text-2xl font-bold">
                MirAsia
              </h1> */}
               <img
                    src= "https://mirrasia-assets.s3.ap-southeast-1.amazonaws.com/logo+black+text+(420+%C3%97+60px).png"
                    alt="MIRR ASIA"
                    width={175}
                    height={25}
                    srcSet="https://mirrasia-assets.s3.ap-southeast-1.amazonaws.com/logo+black+text+(420+%C3%97+60px).png"
                    // fetchPriority="high"
                    style={{ width: '175px', height: '25px', objectFit: 'cover',  }}
                />
            </div>
            <h2 className="text-2xl font-semibold">Welcome</h2>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email address*"
                  value={email}
                  // onChange={(e) => setEmail(e.target.value)}
                  onChange={handleEmailChange}
                  className="w-full px-3 py-2"
                  required
                />
                {emailError && <div className="text-red-500">{emailError}</div>}
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password*"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <a href="#" className="text-sm">
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'LOGIN'}
              </Button>

              <div className="relative my-4">
                <Separator className="my-4" />
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-gray-500">
                  OR
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-2"
                onClick={() => handleGoogleLogin()}
                disabled={isLoading}
              >
                <img
                  src="https://img.icons8.com/?size=100&id=17949&format=png&color=000000"
                  alt="Google"
                  className="mr-2 h-4 w-4"
                />
                Continue with Google
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-white p-4 shadow-lg">
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
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