/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { authAtom, loginWithEmail, loginWithGoogle, sendResetPasswordCode, verify2FaLogin, verifyResetPasswordCodeAndReset } from '@/hooks/useAuth';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useGoogleLogin } from '@react-oauth/google';
import { useAtom } from 'jotai';
import Loader from '@/common/Loader';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,  
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import jwtDecode from "jwt-decode"
import { useNavigate } from 'react-router-dom';


const LoginComponent: React.FC = () => {
  // Replace useNavigate with your navigation method
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState('');
  const [, setAuth] = useAtom(authAtom);
  const [resetStep, setResetStep] = useState<'enterEmail' | 'enterCode'>('enterEmail');
  const [resetCode, setResetCode] = useState('');
  const [resetError, setResetError] = useState('');
  // 2FA states
  const [show2FA, setShow2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorError, setTwoFactorError] = useState('');
  const [tempUserData, setTempUserData] = useState(null);
  const [is2FALoading, setIs2FALoading] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem("refreshed")) {
      sessionStorage.setItem("refreshed", "true");
      window.location.reload();
    }
  }, []);

  const handleLogin = async () => {
    setError('');
    setIsLoading(true);

    try {
      const response = await loginWithEmail(email, password);
      // console.log("response", response)
      // Check if user has 2FA enabled
      if (response.requiresTwoFactor) {
        const decodedToken = jwtDecode<any>(response.tempToken)
        // console.log("decodedToken", decodedToken)
        setTempUserData(decodedToken.userId);
        setShow2FA(true);
        setIsLoading(false);
        return;
      }
      else {
        // Complete login if no 2FA
        completeLogin(response);
      }
    } catch (err) {
      console.log("err.response?.data?.message", err)
      setError('Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const completeLogin = (response: any) => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(response.user));
    setAuth({ user: response.user, isAuthenticated: true, loading: false, error: null });

    if (response.user.role === 'admin' || response.user.role === 'master') {
      navigate('/admin-dashboard');
    } else if (response.user.role === 'hk_shdr') {
      navigate('/viewboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handleTwoFactorVerification = async () => {
    setTwoFactorError('');
    setIs2FALoading(true);

    try {
      if (!tempUserData) {
        throw new Error('Temporary user data is missing.');
      }
      const response = await verify2FaLogin(tempUserData, twoFactorCode.replace(/\s/g, ''))

      if (!response || !response.success) {
        throw new Error((response && response.message) || 'Verification failed');
      }
      // console.log("response", response)
      // 2FA verification successful, complete login
      completeLogin(response);
    } catch (err) {
      console.error('2FA verification error:', err);
      setTwoFactorError('Invalid verification code. Please try again.');
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (credentialResponse) => {
      setIsLoading(true);

      try {
        const response = await loginWithGoogle(credentialResponse.access_token);

        // Check if user has 2FA enabled
        if (response.requiresTwoFactor) {
          const decodedToken = jwtDecode<any>(response.tempToken)
          // console.log("decodedToken", decodedToken)
          setTempUserData(decodedToken.userId);
          setShow2FA(true);
          setIsLoading(false);
          return;
        } else {
          // Complete login if no 2FA
          completeLogin(response);
        }

      } catch (error) {
        console.error('Google login failed:', error);
        setError('Google sign in failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.log("err", error)
      setError('Google sign in failed. Please try again.');
      setIsLoading(false);
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

  const handleSendResetCode = async () => {
    setResetError('');
    setResetStatus('');
    try {
      const res = await sendResetPasswordCode(resetEmail);
      setResetStatus(res.message);
      setResetStep('enterCode');
    } catch (err) {
      console.error(err);
      setResetError('Failed to send reset code. Please check email.');
    }
  };

  const handleVerifyResetCode = async () => {
    setResetError('');
    setResetStatus('');
    try {
      const res = await verifyResetPasswordCodeAndReset(resetEmail, resetCode, newPassword);
      console.log("res", res)
      setResetStatus('Password reset successful. You can now log in.');
      setResetStep('enterEmail');
      setResetCode('');
      setNewPassword('');
    } catch (err) {
      console.error(err);
      setResetError('Invalid reset code or error resetting password.');
    }
  };

  // const handlePasswordReset = async () => {
  //   setResetStatus('');
  //   try {
  //     await resetPassword(resetEmail, newPassword);
  //     setResetStatus('Password updated successfully.');
  //   } catch (err) {
  //     console.error('Error resetting password:', err);
  //     setResetStatus('Failed to reset password. Please try again.');
  //   }
  // };

  const handleTwoFactorCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers and limit to 6 digits
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setTwoFactorCode(value);
    setTwoFactorError('');
  };

  const cancel2FA = () => {
    setShow2FA(false);
    setTwoFactorCode('');
    setTwoFactorError('');
    setTempUserData(null);
  };

  if (isLoading) {
    return <Loader />;
  }

  // 2FA Verification Screen
  if (show2FA) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md space-y-4">
          <Card className="bg-white shadow-lg">
            <CardHeader className="space-y-2 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <h2 className="text-2xl font-semibold">Two-Factor Authentication</h2>
              <p className="text-gray-600 text-sm">
                Enter the 6-digit code from your authenticator app or use a backup code
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              {twoFactorError && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{twoFactorError}</AlertDescription>
                </Alert>
              )}

              <div onSubmit={handleTwoFactorVerification} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={twoFactorCode}
                    onChange={handleTwoFactorCodeChange}
                    className="w-full px-3 py-2 text-center text-2xl tracking-widest font-mono"
                    maxLength={6}
                    autoComplete="one-time-code"
                    autoFocus
                    required
                  />
                  <p className="text-xs text-gray-500 text-center">
                    You can also use a backup code if you don't have access to your authenticator app
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={cancel2FA}
                    disabled={is2FALoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleTwoFactorVerification}
                    className="flex-1"
                    disabled={is2FALoading || twoFactorCode.length < 6}
                  >
                    {is2FALoading ? 'Verifying...' : 'Verify'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const ForgotPasswordDialog = (
    <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {resetStep === 'enterEmail' && (
            <>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
              </div>
              {resetError && <p className="text-red-500">{resetError}</p>}
              <Button onClick={handleSendResetCode}>Send Reset Code</Button>
            </>
          )}

          {resetStep === 'enterCode' && (
            <>
              <div>
                <Label>Reset Code</Label>
                <Input
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                />
              </div>
              <div>
                <Label>New Password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              {resetError && <p className="text-red-500">{resetError}</p>}
              <Button onClick={handleVerifyResetCode}>Reset Password</Button>
            </>
          )}

          {resetStatus && <p className="text-green-600">{resetStatus}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );

  // Main Login Screen
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-4">
        <Card className="bg-white shadow-lg">
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-center mb-4">
              <img
                src="https://mirrasia-assets.s3.ap-southeast-1.amazonaws.com/logo+black+text+(420+%C3%97+60px).png"
                alt="MIRR ASIA"
                width={175}
                height={25}
                srcSet="https://mirrasia-assets.s3.ap-southeast-1.amazonaws.com/logo+black+text+(420+%C3%97+60px).png"
                style={{ width: '175px', height: '25px', objectFit: 'cover', }}
                className="cursor-pointer"
                onClick={() => navigate('/')}
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

            <div onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email address*"
                  value={email}
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
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(true)}
                  className="text-sm text-blue-600 underline"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                onClick={handleLogin}
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
            </div>
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

      {/* <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </div>
            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            {resetStatus && (
              <div className="text-sm text-center text-red-500">{resetStatus}</div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handlePasswordReset}>Reset Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
      {ForgotPasswordDialog}
    </div>
  );
};

export default LoginComponent;