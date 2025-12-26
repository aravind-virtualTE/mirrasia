/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  authAtom,
  loginWithEmail,
  loginWithGoogle,
  sendResetPasswordCode,
  verify2FaLogin,
  verifyResetPasswordCodeAndReset,
} from "@/hooks/useAuth";
import { Eye, EyeOff, Shield } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useGoogleLogin } from "@react-oauth/google";
import { useAtom } from "jotai";
import Loader from "@/common/Loader";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import jwtDecode from "jwt-decode";
import { useNavigate } from "react-router-dom";

const RESEND_COOLDOWN_SECONDS = 60;

const isValidEmail = (val: string) =>
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val);

const validatePasswordPolicy = (pwd: string) => {
  // Enterprise baseline – adjust to your org requirements
  const minLen = 6;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasDigit = /\d/.test(pwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);

  if (pwd.length < minLen) return `Password must be at least ${minLen} characters.`;
  if (!(hasUpper && hasLower && hasDigit && hasSpecial)) {
    return "Password must include upper, lower, number, and special character.";
  }
  return "";
};

const LoginComponent: React.FC = () => {
  const navigate = useNavigate();

  // Login
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password dialog
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetStep, setResetStep] = useState<"enterEmail" | "enterCode">("enterEmail");
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetStatus, setResetStatus] = useState("");
  const [resetError, setResetError] = useState("");
  const [isResetLoading, setIsResetLoading] = useState(false);

  // Resend controls
  const [resendSecondsLeft, setResendSecondsLeft] = useState(0);
  const [sendCount, setSendCount] = useState(0); // client-side only; server must enforce too

  // 2FA
  const [show2FA, setShow2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorError, setTwoFactorError] = useState("");
  const [tempUserData, setTempUserData] = useState<string | null>(null);
  const [is2FALoading, setIs2FALoading] = useState(false);

  const [, setAuth] = useAtom(authAtom);

  useEffect(() => {
    if (!sessionStorage.getItem("refreshed")) {
      sessionStorage.setItem("refreshed", "true");
      window.location.reload();
    }
  }, []);

  // Resend countdown
  useEffect(() => {
    if (resendSecondsLeft <= 0) return;
    const timer = window.setInterval(() => {
      setResendSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendSecondsLeft]);

  const validateEmail = (value: string) => {
    if (!isValidEmail(value)) setEmailError("Invalid email address");
    else setEmailError("");
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  const completeLogin = (response: any) => {
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(response.user));

    setAuth({ user: response.user, isAuthenticated: true, loading: false, error: null });

    if (response.user.role === "admin" || response.user.role === "master") {
      navigate("/admin-dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  const handleLogin = async () => {
    setError("");
    setIsLoading(true);

    try {
      const response = await loginWithEmail(email, password);

      if (response.requiresTwoFactor) {
        const decodedToken = jwtDecode<any>(response.tempToken);
        setTempUserData(decodedToken.userId);
        setShow2FA(true);
        return;
      }

      completeLogin(response);
    } catch (err) {
      console.log("login error", err);
      setError("Failed to login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    handleLogin();
  };

  const handleTwoFactorVerification = async () => {
    setTwoFactorError("");
    setIs2FALoading(true);

    try {
      if (!tempUserData) throw new Error("Temporary user data is missing.");

      const response = await verify2FaLogin(tempUserData, twoFactorCode.replace(/\s/g, ""));

      if (!response || !response.success) {
        throw new Error((response && response.message) || "Verification failed");
      }

      completeLogin(response);
    } catch (err) {
      console.error("2FA verification error:", err);
      setTwoFactorError("Invalid verification code. Please try again.");
    } finally {
      setIs2FALoading(false);
    }
  };

  const handle2FASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (is2FALoading) return;
    handleTwoFactorVerification();
  };

  const handleTwoFactorCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setTwoFactorCode(value);
    setTwoFactorError("");
  };

  const cancel2FA = () => {
    setShow2FA(false);
    setTwoFactorCode("");
    setTwoFactorError("");
    setTempUserData(null);
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (credentialResponse) => {
      setIsLoading(true);
      try {
        const response = await loginWithGoogle(credentialResponse.access_token);

        if (response.requiresTwoFactor) {
          const decodedToken = jwtDecode<any>(response.tempToken);
          setTempUserData(decodedToken.userId);
          setShow2FA(true);
          return;
        }

        completeLogin(response);
      } catch (err) {
        console.error("Google login failed:", err);
        setError("Google sign in failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    onError: (err) => {
      console.log("google error", err);
      setError("Google sign in failed. Please try again.");
      setIsLoading(false);
    },
  });

  const onSignUp = () => navigate("/signup");

  // ---------------- Forgot Password logic (enterprise UX baseline) ----------------

  const resetForgotDialogState = () => {
    setResetStep("enterEmail");
    setResetEmail("");
    setResetCode("");
    setNewPassword("");
    setResetStatus("");
    setResetError("");
    setIsResetLoading(false);
    setResendSecondsLeft(0);
    setSendCount(0);
  };

  const onForgotDialogOpenChange = (open: boolean) => {
    setForgotPasswordOpen(open);
    if (!open) resetForgotDialogState();
  };

  const handleResetCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setResetCode(value);
    setResetError("");
  };

  const handleSendResetCode = async () => {
    setResetError("");
    setResetStatus("");

    const normalizedEmail = resetEmail.trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      setResetError("Please enter a valid email address.");
      return;
    }

    // client-side guard only; server must enforce real throttling
    if (sendCount >= 5) {
      setResetError("Too many requests. Please try again later.");
      return;
    }

    setIsResetLoading(true);
    try {
      await sendResetPasswordCode(normalizedEmail);

      // Generic success message to avoid user enumeration
      setResetStatus(
        "If an account exists for this email, a reset code has been sent. Please check your inbox."
      );

      setResetStep("enterCode");
      setSendCount((c) => c + 1);
      setResendSecondsLeft(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      console.error("send reset code error", err);

      // Still generic for enumeration safety
      setResetStatus(
        "If an account exists for this email, a reset code has been sent. Please check your inbox."
      );

      setResetStep("enterCode");
      setResendSecondsLeft(RESEND_COOLDOWN_SECONDS);
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleVerifyResetCode = async () => {
    setResetError("");
    setResetStatus("");

    const normalizedEmail = resetEmail.trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      setResetError("Please enter a valid email address.");
      return;
    }

    const code = resetCode.replace(/\D/g, "").slice(0, 6);
    if (code.length !== 6) {
      setResetError("Please enter the 6-digit reset code.");
      return;
    }

    const pwdErr = validatePasswordPolicy(newPassword);
    if (pwdErr) {
      setResetError(pwdErr);
      return;
    }

    setIsResetLoading(true);
    try {
      await verifyResetPasswordCodeAndReset(normalizedEmail, code, newPassword);

      setResetStatus("Password reset successful. You can now log in.");

      // Reset flow back to email step (keep dialog open)
      setResetStep("enterEmail");
      setResetCode("");
      setNewPassword("");
      setResendSecondsLeft(0);
    } catch (err) {
      console.error("verify reset error", err);
      // Generic error to avoid leaking which part failed
      setResetError("Unable to reset password. Please verify the code and try again.");
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleResetEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isResetLoading) return;
    handleSendResetCode();
  };

  const handleResetCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isResetLoading) return;
    handleVerifyResetCode();
  };

  // ---------------- UI ----------------

  if (isLoading) return <Loader />;

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

              <form onSubmit={handle2FASubmit} className="space-y-4">
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
                    type="submit"
                    className="flex-1"
                    disabled={is2FALoading || twoFactorCode.length < 6}
                  >
                    {is2FALoading ? "Verifying..." : "Verify"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const ForgotPasswordDialog = (
    <Dialog open={forgotPasswordOpen} onOpenChange={onForgotDialogOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {resetStep === "enterEmail" && (
            <form onSubmit={handleResetEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                />
              </div>

              {resetError && <p className="text-sm text-red-600">{resetError}</p>}
              {resetStatus && <p className="text-sm text-green-600">{resetStatus}</p>}

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => onForgotDialogOpenChange(false)} disabled={isResetLoading}>
                  Close
                </Button>
                <Button type="submit" className="flex-1" disabled={isResetLoading}>
                  {isResetLoading ? "Sending..." : "Send Reset Code"}
                </Button>
              </div>
            </form>
          )}

          {resetStep === "enterCode" && (
            <form onSubmit={handleResetCodeSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Reset Code</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={resetCode}
                  onChange={handleResetCodeChange}
                  placeholder="6-digit code"
                  autoComplete="one-time-code"
                />
              </div>

              <div className="space-y-2">
                <Label>New Password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  autoComplete="new-password"
                />
                <p className="text-xs text-gray-500">
                  Use at least 10 characters with upper/lowercase, number, and special character.
                </p>
              </div>

              {resetError && <p className="text-sm text-red-600">{resetError}</p>}
              {resetStatus && <p className="text-sm text-green-600">{resetStatus}</p>}

              <div className="flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setResetStep("enterEmail")}
                  disabled={isResetLoading}
                >
                  Back
                </Button>

                <Button type="submit" className="flex-1" disabled={isResetLoading}>
                  {isResetLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  className="text-sm text-blue-600 underline disabled:text-gray-400 disabled:no-underline"
                  onClick={handleSendResetCode}
                  disabled={isResetLoading || resendSecondsLeft > 0}
                >
                  {resendSecondsLeft > 0
                    ? `Resend code in ${resendSecondsLeft}s`
                    : "Resend code"}
                </button>

                <button
                  type="button"
                  className="text-sm text-gray-600 underline"
                  onClick={() => onForgotDialogOpenChange(false)}
                  disabled={isResetLoading}
                >
                  Close
                </button>
              </div>
            </form>
          )}
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
                style={{ width: "175px", height: "25px", objectFit: "cover" }}
                className="cursor-pointer"
                onClick={() => navigate("/")}
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

            <form onSubmit={handleLoginSubmit} className="space-y-4">
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
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

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "LOGIN"}
              </Button>

              <div className="relative my-4">
                <Separator className="my-4" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-gray-500">
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

      {ForgotPasswordDialog}
    </div>
  );
};

export default LoginComponent;
