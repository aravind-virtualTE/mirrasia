import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Logo from '@/common/LogoComponent';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen, Calculator, Users } from 'lucide-react';
import businessIllustration from '@/assets/images/Business Plan-amico.svg';
import LanguageSwitcher from '@/hooks/LanguageSwitcher';
// import { ModeToggle } from '@/components/mode-toggle';


const LandingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const handleLoginClick = () => {
    navigate('/login');
  };
  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Nav Items */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center">
                  <Logo width={30} height={30} />
                  <span className="ml-2 text-4xl font-bold">MIRR ASIA</span>
                </div>
                {/* <ModeToggle /> */}
              </div>
              <div className="hidden md:block ml-10">
                <div className="flex items-center space-x-4">
                  <a href="#" className="text-gray-700 hover:text-gray-900 px-3 py-2">Incorporation</a>
                  <a href="#" className="text-gray-700 hover:text-gray-900 px-3 py-2">Corporate Secretary</a>
                  <a href="#" className="text-gray-700 hover:text-gray-900 px-3 py-2">Accounting</a>
                  <a href="#" className="text-gray-700 hover:text-gray-900 px-3 py-2">Visas</a>
                  <a href="#" className="text-gray-700 hover:text-gray-900 px-3 py-2">Resources</a>
                  <a href="#" className="text-gray-700 hover:text-gray-900 px-3 py-2">Pricing</a>
                </div>
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleLoginClick}>Log in</Button>
              <LanguageSwitcher />
              <Button>Get started</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
            <h1 className="text-4xl font-bold mb-4">{t('landingPage.leftHeading')}</h1>
            <p className="text-600 mb-6">
            {t('landingPage.leftText')}
            </p>
            <div className="space-x-4">
              <Button size="lg">{t('landingPage.registerNow')}</Button>
              <Button variant="outline" size="lg">{t('landingPage.contactUs')}</Button>
            </div>
          </div>
          <div className="hidden md:flex justify-center">
            <img
              src={businessIllustration}
              alt="Business illustration"
              className="max-w-md rounded-lg"
            />
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
            <h1 className="text-4xl font-bold mb-4">{t('landingPage.rightHeading')}</h1>
            <h2 className="text-lg font-bold mb-4">
            {t('landingPage.rightSubHeading')}
            </h2>
            <p className="text-600 mb-6">{t('landingPage.rightP')}</p>
            <div className="flex">
              <Button >{t('landingPage.TransferBtn')}
              </Button>
            </div>
          </div>

        </div>
      </div>

      {/* Features Cards */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <BookOpen className="h-8 w-8 text-blue-500 mb-2" />
                <CardTitle>Easy Registration</CardTitle>
                <CardDescription>
                  Register your company in minutes with our streamlined digital process
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Calculator className="h-8 w-8 text-blue-500 mb-2" />
                <CardTitle>Accounting & Tax</CardTitle>
                <CardDescription>
                  Professional bookkeeping and tax filing services for your business
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-blue-500 mb-2" />
                <CardTitle>Expert Support</CardTitle>
                <CardDescription>
                  Dedicated support team to help you every step of the way
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* Trust Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h2 className="text-2xl font-bold mb-8">Trusted by over 450,000 businesses globally</h2>
        <div className="flex justify-center items-center space-x-8">
          {/* Placeholder for partner logos */}
          <div className="w-32 h-12 bg-gray-200 rounded flex items-center justify-center">
            Logo 1
          </div>
          <div className="w-32 h-12 bg-gray-200 rounded flex items-center justify-center">
            Logo 2
          </div>
          <div className="w-32 h-12 bg-gray-200 rounded flex items-center justify-center">
            Logo 3
          </div>
        </div>
      </div>
    </div>
  )
};

export default LandingPage