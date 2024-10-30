import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Logo from '@/common/LogoComponent';
import { useNavigate } from 'react-router-dom';

const SignupPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Animated Text */}
      <div className="hidden lg:flex lg:w-1/2 bg-black p-12 relative flex-col">
        {/* Logo */}
        <div className="flex items-center space-x-2 mb-12">
          <Logo />
          <span className="text-xl font-bold text-white">Mirr Asia</span>
        </div>

        <div className="w-full h-full flex items-center justify-center">
          <div className="w-4/5">
            <p className="text-white text-lg leading-relaxed">
              <span className="font-semibold text-xl block mb-6">
                At Mirr Asia, we provide specialized, systematic business services with integrity and years of global experience.
              </span>

              <span className="block mb-4">
                Our expertise spans corporate setup across jurisdictions,
                <span className="font-medium text-blue-200"> financial and cryptocurrency licensing</span>,
                <span className="font-medium text-blue-200"> compliance, AML, KYC</span>, and
                <span className="font-medium text-blue-200"> tax management</span>,
                with a commitment to honest and cost-effective solutions.
              </span>

              <span className="block mb-4">
                We uphold ethical standards, avoiding support for illegal activities,
                and diligently adapt to regulatory changes to advise our clients responsibly.
              </span>

              <span className="block font-medium text-blue-100">
                Guided by trust and transparency, we strive to deliver the best results
                for our clients and contribute positively to society.
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="lg:hidden flex items-center space-x-2">
              <Logo />
              <span className="text-xl font-bold">Mirr Asia</span>
            </div>
            <Button
              variant="link"
              onClick={() => navigate('/login')}
              className="text-sm font-medium underline ml-auto p-0 h-auto"
            >
              Login
            </Button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                Create an account
              </h1>
              <p className="text-sm text-gray-500">
                Enter your email below to create your account
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Full Name"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Password"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  className="w-full"
                />
              </div>
              <Button className="w-full" size="lg">
                Sign Up
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button variant="outline" className="w-full" size="lg">
                <img
                  src="https://img.icons8.com/?size=100&id=17949&format=png&color=000000"
                  alt="Google"
                  className="mr-2 h-4 w-4"
                />
                Google
              </Button>
            </div>

            <p className="text-sm text-gray-500 text-center">
              By clicking continue, you agree to our{' '}
              <a href="#" className="underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;