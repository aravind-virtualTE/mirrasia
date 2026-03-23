import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Building2,
  Calculator,
  CheckCircle2,
  Menu,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "@/components/theme-provider";
import LanguageSwitcher from "@/hooks/LanguageSwitcher";
import businessWomen from "@/assets/images/businessWomen.jpg";
import businessMan from "@/assets/images/businessMan.jpg";
import calculator from "@/assets/images/calculator.jpg";
import pricing from "@/assets/images/pricing.jpg";
import FAQs from "./FAQs";
import EnquiryForm from "./EnquiryForm";

type LandingImageCardProps = {
  src: string;
  alt: string;
  fit?: "cover" | "contain";
  imageClassName?: string;
  wrapperClassName?: string;
  heightClassName?: string;
};

const LandingImageCard = ({
  src,
  alt,
  fit = "cover",
  imageClassName = "",
  wrapperClassName = "relative hidden md:block",
  heightClassName = "h-[28rem]",
}: LandingImageCardProps) => {
  const foregroundClassName =
    fit === "contain"
      ? "h-full w-full object-contain drop-shadow-[0_24px_50px_rgba(15,23,42,0.18)]"
      : "h-full w-full object-cover";

  const frameClassName =
    fit === "contain"
      ? "relative flex h-full w-full items-end justify-center p-6 lg:p-8"
      : "relative h-full w-full";

  return (
    <div className={wrapperClassName}>
      <div className="absolute inset-4 rounded-[2rem] bg-gradient-to-br from-sky-100/70 via-white to-amber-100/60 blur-2xl" />
      <div
        className={`relative ${heightClassName} overflow-hidden rounded-[2rem] border border-slate-200/80 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.96),_rgba(241,245,249,0.94)_48%,_rgba(219,234,254,0.82))] shadow-[0_30px_80px_-35px_rgba(15,23,42,0.35)]`}
      >
        <img
          src={src}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-20 blur-2xl"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/10 to-sky-950/10" />
        <div className={frameClassName}>
          <img
            src={src}
            alt={alt}
            className={`${foregroundClassName} ${imageClassName}`.trim()}
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
};

const LandingPage = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const incorporationRef = useRef<HTMLDivElement>(null);
  const accountingRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const enquiryRef = useRef<HTMLDivElement>(null);
  const homeRef = useRef<HTMLElement>(null);

  const scrollToSection = <T extends HTMLElement>(ref: React.RefObject<T>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  const openService = (svc: "quotation" | "tax-fee") => {
    navigate(`/services/${svc}`);
  };

  const heroPillars = [
    {
      icon: Building2,
      title: t("landingPage.hero.pillars.incorporation.title"),
      description: t("landingPage.hero.pillars.incorporation.description"),
    },
    {
      icon: Calculator,
      title: t("landingPage.hero.pillars.accounting.title"),
      description: t("landingPage.hero.pillars.accounting.description"),
    },
    {
      icon: ShieldCheck,
      title: t("landingPage.hero.pillars.compliance.title"),
      description: t("landingPage.hero.pillars.compliance.description"),
    },
  ];

  const featureCards = [
    {
      icon: BookOpen,
      title: t("landingPage.whyChooseUs.cards.clearProcess.title"),
      description: t("landingPage.whyChooseUs.cards.clearProcess.description"),
      points: [
        t("landingPage.whyChooseUs.cards.clearProcess.point1"),
        t("landingPage.whyChooseUs.cards.clearProcess.point2"),
        t("landingPage.whyChooseUs.cards.clearProcess.point3"),
      ],
    },
    {
      icon: Calculator,
      title: t("landingPage.whyChooseUs.cards.financeTax.title"),
      description: t("landingPage.whyChooseUs.cards.financeTax.description"),
      points: [
        t("landingPage.whyChooseUs.cards.financeTax.point1"),
        t("landingPage.whyChooseUs.cards.financeTax.point2"),
        t("landingPage.whyChooseUs.cards.financeTax.point3"),
      ],
    },
    {
      icon: Users,
      title: t("landingPage.whyChooseUs.cards.ongoingSupport.title"),
      description: t("landingPage.whyChooseUs.cards.ongoingSupport.description"),
      points: [
        t("landingPage.whyChooseUs.cards.ongoingSupport.point1"),
        t("landingPage.whyChooseUs.cards.ongoingSupport.point2"),
        t("landingPage.whyChooseUs.cards.ongoingSupport.point3"),
      ],
    },
  ];

  const incorporationPoints = [
    t("landingPage.coreServices.incorporation.point1"),
    t("landingPage.coreServices.incorporation.point2"),
    t("landingPage.coreServices.incorporation.point3"),
  ];

  const accountingPoints = [
    t("landingPage.coreServices.accounting.point1"),
    t("landingPage.coreServices.accounting.point2"),
    t("landingPage.coreServices.accounting.point3"),
  ];

  const pricingPoints = [
    t("landingPage.coreServices.pricing.point1"),
    t("landingPage.coreServices.pricing.point2"),
    t("landingPage.coreServices.pricing.point3"),
  ];

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
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

          <div className="hidden items-center space-x-4 lg:space-x-6 md:flex">
            <nav className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="text-foreground/70 hover:text-foreground"
                onClick={() => scrollToSection(incorporationRef)}
              >
                {t("landingPage.nav.incorporation")}
              </Button>
              <Button
                variant="ghost"
                className="text-foreground/70 hover:text-foreground"
                onClick={() => scrollToSection(accountingRef)}
              >
                {t("landingPage.nav.accountingTaxation")}
              </Button>
              <Button
                variant="ghost"
                className="text-foreground/70 hover:text-foreground"
                onClick={() => scrollToSection(pricingRef)}
              >
                {t("landingPage.nav.pricing")}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-foreground/70 hover:text-foreground"
                  >
                    {t("landingPage.nav.services")}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem onClick={() => openService("quotation")}>
                    {t("landingPage.nav.quotationRequest")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openService("tax-fee")}>
                    {t("landingPage.nav.taxFeeEstimator")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>

            <div className="h-6 w-px bg-gray-300" />

            <LanguageSwitcher />
            <Button variant="ghost" asChild>
              <Link to="/login">{t("landingPage.nav.login")}</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">{t("landingPage.nav.getStarted")}</Link>
            </Button>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">{t("landingPage.nav.toggleMenu")}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="mt-8 flex flex-col gap-4">
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => scrollToSection(incorporationRef)}
                >
                  {t("landingPage.nav.incorporation")}
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => scrollToSection(accountingRef)}
                >
                  {t("landingPage.nav.accountingTaxation")}
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => scrollToSection(pricingRef)}
                >
                  {t("landingPage.nav.pricing")}
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => openService("quotation")}
                >
                  {t("landingPage.nav.quotationRequest")}
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => openService("tax-fee")}
                >
                  {t("landingPage.nav.taxFeeEstimator")}
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <nav
          aria-label="breadcrumb"
          className="flex items-center space-x-2 px-4 pb-2 text-xs text-foreground/70 md:hidden"
        >
          <LanguageSwitcher />
          <span>/</span>
          <Link to="/login" className="hover:text-foreground">
            {t("landingPage.nav.login")}
          </Link>
          <span>/</span>
          <Link to="/signup" className="font-semibold hover:text-foreground">
            {t("landingPage.nav.getStarted")}
          </Link>
        </nav>
      </header>

      <section
        ref={homeRef}
        id="home"
        className="relative overflow-hidden bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fafc_52%,_#fff7ed_100%)] py-16 md:py-24"
      >
        <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.12),transparent_72%)]" />
        <div className="absolute left-0 top-28 hidden h-80 w-80 rounded-full bg-sky-100/70 blur-3xl lg:block" />
        <div className="absolute right-0 top-20 hidden h-72 w-72 rounded-full bg-orange-100/70 blur-3xl lg:block" />

        <div className="max-width relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[1.04fr_0.96fr]">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-orange-700 shadow-sm backdrop-blur">
                {t("landingPage.hero.badge")}
              </div>

              <div className="mt-6 space-y-5">
                <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                  {t("landingPage.leftHeading")}
                </h1>
                <p className="max-w-2xl text-lg font-semibold text-slate-700 sm:text-xl">
                  {t("landingPage.leftHDesc")}
                </p>
                <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                  {t("landingPage.leftText")}
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button
                  size="lg"
                  className="h-12 px-6 font-medium shadow-lg shadow-orange-500/20"
                  asChild
                >
                  <Link to="/signup">{t("landingPage.registerNow")}</Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 border-slate-300 bg-white/80 px-6 font-medium"
                  onClick={() => scrollToSection(enquiryRef)}
                >
                  {t("landingPage.contactUs")}
                </Button>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {heroPillars.map(({ icon, title, description }) => {
                  const Icon = icon;

                  return (
                    <div
                      key={title}
                      className="rounded-[1.5rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.35)] backdrop-blur"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 text-lg font-semibold text-slate-900">
                        {title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative">
              <LandingImageCard
                src={businessWomen}
                alt={t("landingPage.hero.imageAlt")}
                fit="contain"
                wrapperClassName="relative"
                heightClassName="h-[22rem] sm:h-[28rem] lg:h-[34rem]"
                imageClassName="object-center scale-[1.06]"
              />

              <div className="absolute left-0 top-6 hidden -translate-x-4 rounded-[1.5rem] border border-white/80 bg-white/95 p-4 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.4)] backdrop-blur sm:block">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {t("landingPage.hero.founderReadyLabel")}
                </p>
                <p className="mt-2 max-w-[12rem] text-sm font-semibold leading-6 text-slate-900">
                  {t("landingPage.hero.founderReadyText")}
                </p>
              </div>

              <div className="absolute bottom-6 right-0 hidden translate-x-4 rounded-[1.5rem] border border-slate-200/80 bg-slate-900/95 p-5 text-white shadow-[0_24px_60px_-30px_rgba(15,23,42,0.55)] lg:block">
                <div className="flex items-start gap-3">
                  <BadgeCheck className="mt-0.5 h-5 w-5 text-orange-300" />
                  <div>
                    <p className="text-sm font-semibold">
                      {t("landingPage.hero.decisionTitle")}
                    </p>
                    <p className="mt-1 max-w-[14rem] text-sm leading-6 text-slate-300">
                      {t("landingPage.hero.decisionText")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 rounded-[2rem] border border-slate-200/80 bg-white/85 p-6 shadow-[0_28px_70px_-45px_rgba(15,23,42,0.4)] backdrop-blur lg:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
                  {t("landingPage.hero.existingCompaniesEyebrow")}
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                  {t("landingPage.rightHeading")}{" "}
                  <span className="text-orange-600">
                    {t("landingPage.rightSubHeading")}
                  </span>
                </h2>
                <p className="mt-3 text-base leading-7 text-slate-600 sm:text-lg">
                  {t("landingPage.rightP")}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-slate-300 bg-white/80"
                  onClick={() => scrollToSection(accountingRef)}
                >
                  {t("landingPage.hero.exploreSupport")}
                </Button>
                <Button
                  size="lg"
                  className="gap-2"
                  onClick={() => scrollToSection(enquiryRef)}
                >
                  {t("landingPage.TransferBtn")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-16 sm:py-20 md:py-24">
        <div className="max-width mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-600">
              {t("landingPage.whyChooseUs.eyebrow")}
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {t("landingPage.whyChooseUs.title")}
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">
              {t("landingPage.whyChooseUs.description")}
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {featureCards.map(({ icon, title, description, points }) => {
              const Icon = icon;

              return (
                <Card
                  key={title}
                  className="relative h-full overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white/90 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.35)]"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-400 via-amber-400 to-sky-400" />
                  <CardHeader className="space-y-6 p-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-3">
                      <CardTitle className="text-2xl tracking-tight text-slate-900">
                        {title}
                      </CardTitle>
                      <p className="text-sm leading-7 text-slate-600">
                        {description}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 pt-0">
                    <ul className="space-y-3">
                      {points.map((point) => (
                        <li
                          key={point}
                          className="flex items-start gap-3 text-sm leading-6 text-slate-600"
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-orange-500" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-white to-slate-50 py-16 md:py-24">
        <div className="max-width mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-600">
              {t("landingPage.coreServices.eyebrow")}
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {t("landingPage.coreServices.title")}
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">
              {t("landingPage.coreServices.description")}
            </p>
          </div>

          <div className="mt-12 space-y-8">
            <div
              ref={incorporationRef}
              id="incorporation"
              className="grid gap-8 rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_25px_70px_-45px_rgba(15,23,42,0.4)] md:p-8 lg:grid-cols-[0.98fr_1.02fr] lg:p-10"
            >
              <div className="space-y-6">
                <div className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-orange-700">
                  {t("landingPage.coreServices.incorporation.badge")}
                </div>
                <div>
                  <h3 className="text-3xl font-semibold tracking-tight text-slate-900">
                    {t("landingPage.coreServices.incorporation.title")}
                  </h3>
                  <p className="mt-4 text-base leading-8 text-slate-600">
                    {t("landingPage.coreServices.incorporation.description")}
                  </p>
                </div>
                <ul className="space-y-3">
                  {incorporationPoints.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-3 text-sm leading-6 text-slate-600"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-orange-500" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button size="lg" asChild>
                    <Link to="/signup">
                      {t("landingPage.coreServices.incorporation.primaryCta")}
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2 border-slate-300 bg-white"
                    onClick={() => scrollToSection(enquiryRef)}
                  >
                    {t("landingPage.coreServices.incorporation.secondaryCta")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <LandingImageCard
                src={businessMan}
                alt={t("landingPage.coreServices.incorporation.imageAlt")}
                fit="contain"
                imageClassName="object-center scale-[1.02]"
              />
            </div>

            <div
              ref={accountingRef}
              id="accounting"
              className="grid gap-8 rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_25px_70px_-45px_rgba(15,23,42,0.4)] md:p-8 lg:grid-cols-[1.02fr_0.98fr] lg:p-10"
            >
              <LandingImageCard
                src={calculator}
                alt={t("landingPage.coreServices.accounting.imageAlt")}
                wrapperClassName="relative hidden md:block lg:order-1"
                imageClassName="object-[center_45%]"
              />

              <div className="space-y-6 lg:order-2">
                <div className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                  {t("landingPage.coreServices.accounting.badge")}
                </div>
                <div>
                  <h3 className="text-3xl font-semibold tracking-tight text-slate-900">
                    {t("landingPage.coreServices.accounting.title")}
                  </h3>
                  <p className="mt-4 text-base leading-8 text-slate-600">
                    {t("landingPage.coreServices.accounting.description")}
                  </p>
                </div>
                <ul className="space-y-3">
                  {accountingPoints.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-3 text-sm leading-6 text-slate-600"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-orange-500" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-slate-300 bg-white"
                    onClick={() => openService("quotation")}
                  >
                    {t("landingPage.coreServices.accounting.primaryCta")}
                  </Button>
                  <Button
                    size="lg"
                    className="gap-2"
                    onClick={() => scrollToSection(enquiryRef)}
                  >
                    {t("landingPage.coreServices.accounting.secondaryCta")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div
              ref={pricingRef}
              id="pricing"
              className="grid gap-8 rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_25px_70px_-45px_rgba(15,23,42,0.4)] md:p-8 lg:grid-cols-[0.98fr_1.02fr] lg:p-10"
            >
              <div className="space-y-6">
                <div className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
                  {t("landingPage.coreServices.pricing.badge")}
                </div>
                <div>
                  <h3 className="text-3xl font-semibold tracking-tight text-slate-900">
                    {t("landingPage.coreServices.pricing.title")}
                  </h3>
                  <p className="mt-4 text-base leading-8 text-slate-600">
                    {t("landingPage.coreServices.pricing.description")}
                  </p>
                </div>
                <ul className="space-y-3">
                  {pricingPoints.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-3 text-sm leading-6 text-slate-600"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-orange-500" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button size="lg" onClick={() => openService("quotation")}>
                    {t("landingPage.coreServices.pricing.primaryCta")}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2 border-slate-300 bg-white"
                    onClick={() => scrollToSection(enquiryRef)}
                  >
                    {t("landingPage.coreServices.pricing.secondaryCta")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <LandingImageCard
                src={pricing}
                alt={t("landingPage.coreServices.pricing.imageAlt")}
                imageClassName="object-center"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-width mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={enquiryRef}
            className="grid grid-cols-1 items-start gap-8 md:grid-cols-3"
          >
            <div className="md:col-span-2">
              <FAQs />
            </div>

            <aside className="md:col-span-1 md:sticky md:top-24">
              <EnquiryForm />
            </aside>
          </div>
        </div>
      </section>

      <footer className="bg-gray-800 py-8 text-white">
        <div className="max-width mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            <div>
              <h3 className="mb-4 text-lg font-bold">
                {t("landingPage.footer.hkOfficeTitle")}
              </h3>
              <p className="text-sm">
                {t("landingPage.footer.hkLine1")}
                <br />
                {t("landingPage.footer.hkLine2")}
                <br />
                {t("landingPage.footer.hkPhone")}
              </p>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-bold">
                {t("landingPage.footer.koreaOfficeTitle")}
              </h3>
              <p className="text-sm">
                {t("landingPage.footer.koreaLine1")}
                <br />
                {t("landingPage.footer.koreaLine2")}
                <br />
                {t("landingPage.footer.koreaLine3")}
                <br />
                {t("landingPage.footer.koreaPhone")}
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-700 pt-8 text-center">
            <p className="text-sm">
              {t("landingPage.footer.copyright")}
              <br />
              {t("landingPage.footer.rightsText")}
            </p>
            <p className="mt-4 text-sm">
              <Link to="/privacy-policy" className="hover:underline">
                {t("landingPage.footer.privacyPolicy")}
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
