import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { BookOpen, Calculator, Menu, Users } from "lucide-react";
import businessWomen from "@/assets/images/businessWomen.jpg";
import businessMan from "@/assets/images/businessMan.jpg";
import calculator from "@/assets/images/calculator.jpg";
import pricing from "@/assets/images/pricing.jpg";
import { useNavigate } from "react-router-dom";
import LanguageSwitcher from "@/hooks/LanguageSwitcher";
import { useTheme } from "@/components/theme-provider";
import { useRef } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import FAQs from "./FAQs";

// NEW: dropdown + dialog
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import EnquiryForm from "./EnquiryForm";



const LandingPage = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const incorporationRef = useRef<HTMLDivElement>(null)
  const accountingRef = useRef<HTMLDivElement>(null)
  const pricingRef = useRef<HTMLDivElement>(null)
  const homeRef = useRef<HTMLDivElement>(null)


  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" })
  }
  const navigate = useNavigate();
  const openService = (svc: "quotation" | "tax-fee") => {
    navigate(`/services/${svc}`);
  };

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Top Row: Logo + (Desktop Nav & Auth OR Mobile Hamburger) */}
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          {/* Logo always visible */}
          <img
            src={
              theme === "light"
                ? "https://mirrasia-assets.s3.ap-southeast-1.amazonaws.com/logo+black+text+(420+%C3%97+60px).png"
                : "https://mirrasia-assets.s3.ap-southeast-1.amazonaws.com/logo+white+text+(420+%C3%97+60px).png"
            }
            alt="MIRRASIA"
            width={175}
            height={25}
            className="cursor-pointer"
            style={{ objectFit: "cover" }}
            onClick={() => scrollToSection(homeRef)}
          />

          {/* Desktop Nav + Auth (md+) */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            {/* Nav Links */}
            <nav className="flex items-center gap-2">
              <Button variant="ghost" className="text-foreground/70 hover:text-foreground" onClick={() => scrollToSection(incorporationRef)}>Incorporation</Button>
              <Button variant="ghost" className="text-foreground/70 hover:text-foreground" onClick={() => scrollToSection(accountingRef)}>Accounting & Taxation</Button>
              <Button variant="ghost" className="text-foreground/70 hover:text-foreground" onClick={() => scrollToSection(pricingRef)}>Pricing</Button>

              {/* NEW: Services dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-foreground/70 hover:text-foreground">
                    Services
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem onClick={() => openService("quotation")}>
                    Quotation Request
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openService("tax-fee")}>
                    Tax‑Fee Estimator
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>

            {/* Spacer */}
            <div className="w-px h-6 bg-gray-300" />

            {/* Language + Auth */}
            <LanguageSwitcher />
            <Button variant="ghost" asChild><Link to="/login">Log in</Link></Button>
            <Button asChild><Link to="/signup">Get started</Link></Button>
          </div>

          {/* Mobile Hamburger (below md) */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                <Button variant="ghost" className="justify-start" onClick={() => scrollToSection(incorporationRef)}>Incorporation</Button>
                <Button variant="ghost" className="justify-start" onClick={() => scrollToSection(accountingRef)}>Accounting & Taxation</Button>
                <Button variant="ghost" className="justify-start" onClick={() => scrollToSection(pricingRef)}>Pricing</Button>

                {/* NEW: Services buttons in mobile */}
                <Button variant="ghost" className="justify-start" onClick={() => openService("quotation")}>
                  Quotation Request
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => openService("tax-fee")}>
                  Tax‑Fee Estimator
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Mobile Breadcrumb (below md only) */}
        <nav
          aria-label="breadcrumb"
          className="flex items-center space-x-2 px-4 pb-2 text-xs text-foreground/70 md:hidden"
        >
          <LanguageSwitcher />
          <span>/</span>
          <Link to="/login" className="hover:text-foreground">Log in</Link>
          <span>/</span>
          <Link to="/signup" className="font-semibold hover:text-foreground">Get started</Link>
        </nav>
      </header>
      {/* Hero Section */}
      <section ref={homeRef} id="home" className="bg-gradient-to-b from-white to-gray-50 py-16 md:py-24">
        <div className="max-width mx-auto px-4 sm:px-6 lg:px-8">
          {/* First Row - Business Women */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center mb-16 md:mb-24">
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 transform hover:-translate-y-1">
              <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-800 tracking-tight">
                {t("landingPage.leftHeading")}
              </h1>
              <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-700">
                {t("landingPage.leftHDesc")}
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {t("landingPage.leftText")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className=" text-white font-medium transition-colors"
                >
                  <Link to="/signup">{t("landingPage.registerNow")}</Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className=" font-medium"
                >
                  {t("landingPage.contactUs")}
                </Button>
              </div>
            </div>
            <div className="hidden md:block relative">
              <div className="absolute inset-0 bg-blue-100 rounded-3xl transform rotate-3 scale-95 opacity-30"></div>
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <img
                  src={businessWomen}
                  alt="Business professional"
                  className="w-full h-[28rem] object-cover object-center"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent mix-blend-overlay"></div>
              </div>
            </div>
          </div>
          {/* Second Row - Business Man */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center md:mt-12">
            <div className="order-1 md:order-1 bg-white p-8 md:p-10 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 transform hover:-translate-y-1">
              <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-800 tracking-tight">
                {t("landingPage.rightHeading")}
              </h1>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Let us simplify your operations while you focus on growth. From accounting to compliance, we'll manage the backend so you can drive your business forward.
              </p>
            </div>
            <div className="order-2 md:order-2 bg-white p-8 md:p-10 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 transform hover:-translate-y-1">
              <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-800 tracking-tight">
                {t("landingPage.rightSubHeading")}
              </h1>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {t("landingPage.rightP")}
              </p>
              <Button
                size="lg"
                className="font-medium transition-colors"
              >
                {t("landingPage.TransferBtn")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-muted/30">
        <div className="max-width mx-auto px-0 sm:px-4 lg:px-8 text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Why Choose Us?
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
            We provide comprehensive business solutions to help you succeed
          </p>
        </div>
        <div className="max-width mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-0 sm:px-4 lg:px-8">
          {/* Card 1 */}
          <Card className="h-full">
            <CardHeader>
              <BookOpen className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Fast & Easy Company Registration</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>Start your business without the stress</li>
                <li>Quick, paperless business registration</li>
                <li>Expert help with choosing the right entity</li>
                <li>Government filing is handled for you</li>
              </ul>
            </CardContent>
          </Card>

          {/* Card 2 */}
          <Card className="h-full">
            <CardHeader>
              <Calculator className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Smart Accounting & Tax Services</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>Run your business; we'll manage your books</li>
                <li>Bookkeeping, payroll, and tax filing</li>
                <li>Real-time reporting and compliance updates</li>
                <li>Affordable plans tailored to your business size</li>
              </ul>
            </CardContent>
          </Card>

          {/* Card 3 */}
          <Card className="h-full sm:col-span-2 lg:col-span-1">
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Ongoing Expert Support</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>We're with you beyond registration</li>
                <li>Corporate secretary and compliance management</li>
                <li>Deadline tracking and documentation reminders</li>
                <li>Your dedicated team of company registration experts</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="bg-gradient-to-b from-white to-gray-50 py-16 md:py-24">
        <div className="max-width mx-auto px-4 sm:px-6 lg:px-8">
          {/* First Row - Incorporation */}
          <div ref={incorporationRef} id="incorporation" className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center mb-16 md:mb-24">
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 transform hover:-translate-y-1">
              <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-800 tracking-tight">
                Incorporation
              </h1>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Starting a business with Mirr Asia's comprehensive incorporation services offers a plethora of benefits. Our team of experts assists clients through every step, ensuring compliance with local regulations and facilitating a smooth setup process. From selecting the appropriate business structure to handling all necessary documentation, Mirr Asia provides end-to-end support for entrepreneurs and corporations alike.
                With a deep understanding of the corporate landscape, Mirr Asia ensures that businesses are well-established. Our incorporation services are designed to minimize administrative burdens, allowing clients to focus on core operations from day one.
              </p>
            </div>
            <div className="hidden md:block relative">
              <div className="absolute inset-0 bg-blue-100 rounded-3xl transform rotate-3 scale-95 opacity-30"></div>
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <img
                  src={businessMan}
                  alt="Business professional"
                  className="w-full h-[28rem] object-cover object-center"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent mix-blend-overlay"></div>
              </div>
            </div>
          </div>
          {/* Second Row - Accounting */}
          <div ref={accountingRef} id="accounting" className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center md:mt-12">
            <div className="order-1 md:order-1 bg-white p-8 md:p-10 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 transform hover:-translate-y-1">
              <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-800 tracking-tight">
                Accounting & Taxation
              </h1>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Accurate financial management is vital for business success. Mirr Asia provides a range of accounting & taxation services tailored to meet the unique needs of each client. Our offerings include bookkeeping, financial statement preparation, and management reporting, all designed to provide clear insights into a company's financial health.
                Utilizing the latest accounting software and methodologies, Mirr Asia ensures that clients receive timely and accurate financial information. This empowers businesses to make informed decisions, maintain financial stability, and plan effectively for future growth.
              </p>
            </div>
            <div className="hidden md:block relative">
              <div className="absolute inset-0 bg-blue-100 rounded-3xl transform rotate-3 scale-95 opacity-30"></div>
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <img
                  src={calculator}
                  alt="Business professional"
                  className="w-full h-[28rem] object-cover object-center"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent mix-blend-overlay"></div>
              </div>
            </div>
          </div>

          {/* Third Row - pricing (ORIGINAL KEPT) */}
          <div ref={pricingRef} id="pricing" className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center md:mt-12">
            <div className="order-0 md:order-0 bg-white p-8 md:p-10 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 transform hover:-translate-y-1">
              <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-800 tracking-tight">
                Pricing
              </h1>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Mirr Asia believes in transparent pricing and competitive pricing for all services. They offer customized packages tailored to each client's specific requirements, ensuring that businesses receive the support they need without unnecessary costs. Detailed pricing information is available upon consultation, allowing clients to make informed decisions based on their budgets and service needs.
                This approach to pricing reflects Mirr Asia's commitment to building long-term relationships with clients, providing value-driven services that support sustainable business success. These sections encapsulate the comprehensive services offered by Mirr Asia, highlighting expertise and commitment to helping businesses across the globe.
              </p>
            </div>
            <div className="hidden md:block relative">
              <div className="absolute inset-0 bg-blue-100 rounded-3xl transform rotate-3 scale-95 opacity-30"></div>
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <img
                  src={pricing}
                  alt="Business professional"
                  className="w-full h-[28rem] object-cover object-center"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent mix-blend-overlay"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-width mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {/* FAQs: 2 columns on md+ */}
            <div className="md:col-span-2">
              <FAQs />
            </div>

            {/* Enquiry: right side on desktop; below on mobile */}
            <aside className="md:col-span-1 md:sticky md:top-24">
              <EnquiryForm />
            </aside>
          </div>
        </div>
      </section>

      <footer className="bg-gray-800 text-white py-8">
        <div className="max-width mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-lg font-bold mb-4">HONG KONG OFFICE</h3>
              <p className="text-sm">
                WORKSHOP UNIT B50 & B58, KWAI SHING IND. BLDG (PHASE 1),<br />
                36-40 TAI LIN PAI RD, KWAI CHUNG, HK<br />
                Tel: 852-2187-2428
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">KOREA OFFICE</h3>
              <p className="text-sm">
                UNIT 937, 9/F, GOLDEN IT TOWER,<br />
                229 YANGJI-RO, BUCHEON-SI, GYEONGGI-DO,<br />
                REPUBLIC OF KOREA<br />
                Tel: 02-543-6187 / Fax: 02-6455-6187
              </p>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-sm">
              © Copyright 2024 Mirr Asia™ All rights reserved.<br />
              All rights to this website belong to MIRR ASIA BUSINESS ADVISORY & SECRETARIAL COMPANY LIMITED and may not be used without permission.
            </p>
            <p className="text-sm mt-4">
              <Link to="/privacy-policy" className="hover:underline">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
