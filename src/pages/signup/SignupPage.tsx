import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAtom } from "jotai";
import { useGoogleLogin } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  authAtom,
  signupWithEmail,
  signupWithGoogle,
  validateToken,
  sendEmailOtpforVerification,
  validateOtpforVerification,
} from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";

const SignupPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const idToken = searchParams.get("token");
  const [isValidToken, setIsValidToken] = useState(false);

  const [auth, setAuth] = useAtom(authAtom);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    // phone: "",
  });

  const [emailError, setEmailError] = useState("");
  const [nameError, setNameError] = useState("");
  const [otpError, setOtpError] = useState({ email: "", phone: "" });
  const [emailOtpId, setEmailOtpId] = useState<string | null>(null);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpInput, setEmailOtpInput] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [resendTimer, setResendTimer] = useState(0);

  // Allow: A-Z a-z, spaces, dot, apostrophe, hyphen
  const sanitizeEnglishName = (raw: string) => {
    const cleaned = raw.replace(/[^A-Za-z .'-]/g, "");
    const hadInvalid = cleaned !== raw;
    return { cleaned, hadInvalid };
  };

  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  useEffect(() => {
    if (idToken) {
      const tokenValidate = async () => {
        try {
          const response = await validateToken({ token: idToken });
          setIsValidToken(response.isNotValid);
        } catch (error) {
          console.error("Invalid or expired token:", error);
          setIsValidToken(true);
        }
      };
      tokenValidate();
    } else {
      setIsValidToken(false);
    }
  }, [idToken]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setEmailError("Invalid email address");
    } else {
      setEmailError("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "fullName") {
      const { cleaned, hadInvalid } = sanitizeEnglishName(value);
      setFormData((prev) => ({ ...prev, fullName: cleaned }));

      if (hadInvalid) {
        setNameError("Name must be in English letters only.");
      } else {
        setNameError("");
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "email") validateEmail(value);
  };

  const handleSendEmailOtp = async () => {
    if (!formData.email || !formData.fullName || nameError) {
      setEmailError("Enter a valid email and English name before sending OTP");
      return;
    }
    if (emailOtpId != null) {
      toast({
        title: "Error",
        description: "Verify the otp sent already",
        variant: "destructive",
      });
      return;
    }

    const response = await sendEmailOtpforVerification({
      email: formData.email,
      name: formData.fullName,
    });

    if (response.success) {
      setEmailOtpId(response.id);
      setEmailError("");
      setResendTimer(60);
      toast({
        title: "Email OTP sent",
        description: "Please check your email for the OTP.",
      });
      setEmailOtpSent(true);
      setOtpError((prev) => ({ ...prev, email: "" }));
    } else {
      setEmailOtpId(null);
      setResendTimer(0);
      setEmailOtpSent(false);
      toast({
        title: "Error",
        description: "Failed to send OTP. Please Try Later.",
        variant: "destructive",
      });
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!emailOtpInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter OTP",
        variant: "destructive",
      });
      return;
    }
    const data = {
      otp: emailOtpInput,
      id: emailOtpId,
    };
    const result = await validateOtpforVerification(data);

    if (result.success) {
      setEmailVerified(true);
      setEmailOtpSent(false);
      setEmailOtpId(null);
      setResendTimer(0);
      toast({
        title: "Success",
        description: "Email OTP Verified.",
      });
    } else {
      setOtpError((prev) => ({ ...prev, email: "Incorrect OTP" }));
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim() || nameError) {
      setAuth((prev) => ({ ...prev, error: "Please enter your name in English." }));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setAuth((prev) => ({ ...prev, error: "Passwords don't match" }));
      return;
    }
    if (!emailVerified) {
      setAuth((prev) => ({ ...prev, error: "Please verify email" }));
      return;
    }

    try {
      setAuth((prev) => ({ ...prev, loading: true }));
      const response = await signupWithEmail(
        formData.fullName,
        formData.email,
        formData.password
        // formData.phone
      );
      const { token, user } = response;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setAuth({ user, isAuthenticated: true, loading: false, error: null });
      localStorage.setItem("isAuthenticated", "true");
      navigate(user.role === "admin" ? "/admin-dashboard" : "/dashboard");
    } catch (error) {
      setAuth((prev) => ({
        ...prev,
        loading: false,
        error: "Signup failed. Please try again.",
      }));
      console.log(error);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setAuth((prev) => ({ ...prev, loading: true }));
        const response = await signupWithGoogle(tokenResponse.access_token, idToken!);
        const { token, user } = response;
        localStorage.setItem("token", token);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("user", JSON.stringify(user));
        setAuth({ user, isAuthenticated: true, loading: false, error: null });
        navigate(["admin", "master"].includes(user.role) ? "/admin-dashboard" : "/dashboard");
      } catch (error) {
        setAuth((prev) => ({
          ...prev,
          loading: false,
          error: "Google signup failed. Please try again.",
        }));
        console.log(error);
      }
    },
  });

  if (searchParams.size !== 0 && isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-500">Invalid token link</h1>
          <p className="text-lg text-gray-500">
            Please use same email you received the link to complete sign up.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="flex w-full lg:w-1/2 bg-black p-4 lg:p-12 flex-col">
        <div className="flex items-center space-x-2 mb-6">
          <img
            src="https://mirrasia-assets.s3.ap-southeast-1.amazonaws.com/logo+white+text+(420+%C3%97+60px).png"
            alt="MIRR ASIA"
            width={175}
            height={25}
            className="cursor-pointer"
            style={{ objectFit: "cover" }}
            onClick={() => navigate("/")}
          />
        </div>
        <div className="hidden lg:flex flex-1 items-center justify-center">
          <div className="w-4/5">
            <p className="text-white text-lg leading-relaxed">
              <span className="font-semibold text-xl block mb-6">
                At Mirr Asia, we provide specialized, systematic business services with integrity and years
                of global experience.
              </span>
              <span className="block mb-4">
                Our expertise spans corporate setup across jurisdictions,
                <span className="font-medium text-blue-200"> financial and cryptocurrency licensing</span>,
                <span className="font-medium text-blue-200"> compliance, AML, KYC</span>, and
                <span className="font-medium text-blue-200"> tax management</span>, with a commitment to honest
                and cost-effective solutions.
              </span>
              <span className="block mb-4">
                We uphold ethical standards, avoiding support for illegal activities, and diligently adapt to
                regulatory changes to advise our clients responsibly.
              </span>
              <span className="block font-medium text-blue-100">
                Guided by trust and transparency, we strive to deliver the best results for our clients and
                contribute positively to society.
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <form onSubmit={handleEmailSignup} className="space-y-6">
            <div className="space-y-2">
              <Input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Full Name"
                className="w-full"
                inputMode="text"
                autoComplete="name"
              />
              {nameError && <div className="text-red-500 text-sm">{nameError}</div>}
            </div>

            <div className="flex space-x-2">
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="name@example.com"
                className="flex-1"
                disabled={emailVerified}
                autoComplete="email"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleSendEmailOtp}
                disabled={resendTimer > 0 || emailVerified}
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Send OTP"}
              </Button>
            </div>

            {emailError && <div className="text-red-500">{emailError}</div>}

            {emailOtpSent && !emailVerified && (
              <div className="flex space-x-2 items-center">
                <Input
                  type="text"
                  placeholder="Enter OTP"
                  value={emailOtpInput}
                  onChange={(e) => setEmailOtpInput(e.target.value)}
                  className="flex-1"
                  inputMode="numeric"
                />
                <Button type="button" onClick={handleVerifyEmailOtp}>
                  Verify
                </Button>
              </div>
            )}

            {otpError.email && <div className="text-red-500">{otpError.email}</div>}

            {/* Password with eye toggle */}
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                className="w-full pr-12"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Confirm Password with eye toggle */}
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm Password"
                className="w-full pr-12"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {auth.error && <div className="text-red-500 text-sm">{auth.error}</div>}

            <Button type="submit" className="w-full" size="lg" disabled={auth.loading || !emailVerified}>
              {auth.loading ? "Signing up..." : "Sign Up"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              size="lg"
              onClick={() => googleLogin()}
              disabled={auth.loading}
            >
              <img
                src="https://img.icons8.com/?size=100&id=17949&format=png&color=000000"
                alt="Google"
                className="mr-2 h-4 w-4"
              />
              Continue with Google
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
