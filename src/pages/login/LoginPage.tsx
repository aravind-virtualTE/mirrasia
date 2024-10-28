import { LoginForm } from "@/components/login-form"
import { useState } from "react";
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [reset, setReset] = useState(false)
  const navigate = useNavigate();

  const handleLogin = (formData: { email: string; password: string }) => {
    console.log("Form Data:", formData);
    setReset(true); 
    // localStorage.setItem('isAuthenticated', 'true');
    // navigate('/dashboard');
  };

  const handleGoogleLogin = async () => {
    try {
      // Replace this section with actual Google Auth logic (e.g., Firebase, Auth0)
      // Example: await googleAuth.signInWithGoogle();
      console.log("Logged in with Google");
      localStorage.setItem('isAuthenticated', 'true');
      setReset(true); 
      navigate('/dashboard');
    } catch (error) {
      console.error("Google login failed:", error);
    }
  };


  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <LoginForm onLogin={handleLogin}  onGoogleLogin={handleGoogleLogin} reset={reset}  />
    </div>
  )
}
