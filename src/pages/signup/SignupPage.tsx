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
} from "@/hooks/useAuth";

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
  });

  const [emailError, setEmailError] = useState("");

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
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "email") {
      validateEmail(e.target.value);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setAuth((prev) => ({ ...prev, error: "Passwords don't match" }));
      return;
    }

    try {
      setAuth((prev) => ({ ...prev, loading: true }));
      const response = await signupWithEmail(
        formData.fullName,
        formData.email,
        formData.password
      );
      const { token, user } = response;
      // console.log("response==>", token, user);
      // Save the token to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user))
      setAuth({ user, isAuthenticated: true, loading: false, error: null });
      localStorage.setItem("isAuthenticated", "true");
      if (user.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/dashboard");
      }
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
        const response = await signupWithGoogle(
          tokenResponse.access_token,
          idToken!
        );
        const { token, user } = response;
        // console.log('Google signup response-->',response, '\n user--->', user);
        // Save the token to localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("user", JSON.stringify(user))
        setAuth({ user, isAuthenticated: true, loading: false, error: null });
        if (user.role === "admin" || user.role === "master") {
          navigate("/admin-dashboard");
        } else {
          navigate("/dashboard");
        }
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

  if (searchParams.size !== 0) {
    // console.log("searchParams-->", searchParams.size);
    if (isValidToken) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-red-500">
              Invalid token link
            </h1>
            <p className="text-lg text-gray-500">
              Please use same email you received the link to complete sign up.
            </p>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
  {/* Left Panel – always shows logo, text only at lg+ */}
  <div className="flex w-full lg:w-1/2 bg-black p-4 lg:p-12 flex-col">
    {/* Logo */}
    <div className="flex items-center space-x-2 mb-6">
      <img
        src="https://mirrasia-assets.s3.ap-southeast-1.amazonaws.com/logo+white+text+(420+%C3%97+60px).png"
        alt="MIRR ASIA"
        width={175}
        height={25}
        className="cursor-pointer"
        style={{ objectFit: "cover" }}
        onClick={() => navigate('/')}
      />
    </div>

    {/* Descriptive text – only on lg+ */}
    <div className="hidden lg:flex flex-1 items-center justify-center">
      <div className="w-4/5">
        <p className="text-white text-lg leading-relaxed">
          <span className="font-semibold text-xl block mb-6">
            At Mirr Asia, we provide specialized, systematic business services with integrity and years of global experience.
          </span>
          <span className="block mb-4">
            Our expertise spans corporate setup across jurisdictions,
            <span className="font-medium text-blue-200"> financial and cryptocurrency licensing</span>,
            <span className="font-medium text-blue-200"> compliance, AML, KYC</span>, and
            <span className="font-medium text-blue-200"> tax management</span>, with a commitment to honest and cost-effective solutions.
          </span>
          <span className="block mb-4">
            We uphold ethical standards, avoiding support for illegal activities, and diligently adapt to regulatory changes to advise our clients responsibly.
          </span>
          <span className="block font-medium text-blue-100">
            Guided by trust and transparency, we strive to deliver the best results for our clients and contribute positively to society.
          </span>
        </p>
      </div>
    </div>
  </div>

  {/* Right Panel – Sign Up Form */}
  <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
    <div className="mx-auto w-full max-w-sm">
      <form onSubmit={handleEmailSignup} className="space-y-6">
        <Input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
          placeholder="Full Name"
          className="w-full"
        />
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="name@example.com"
          className="w-full"
        />
        {emailError && <div className="text-red-500">{emailError}</div>}
        <Input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Password"
          className="w-full"
        />
        <Input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          placeholder="Confirm Password"
          className="w-full"
        />

        {auth.error && (
          <div className="text-red-500 text-sm">{auth.error}</div>
        )}

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={auth.loading}
        >
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
