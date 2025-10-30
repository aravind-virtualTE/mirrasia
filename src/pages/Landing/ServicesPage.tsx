import { Suspense, lazy } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import LanguageSwitcher from "@/hooks/LanguageSwitcher";

const QuoteBuilder = lazy(() => import("@/components/InvoiceManager/InvoiceQuotation"));
const HKAccountingEstimator = lazy(() => import("@/components/InvoiceManager/AccTaxEstimator"));

const VALID_TABS = ["quotation", "tax-fee"] as const;
type TabKey = typeof VALID_TABS[number];

export default function ServicesPage() {
  const { theme } = useTheme();
  const { tab } = useParams();
  const navigate = useNavigate();

  const currentTab: TabKey =
    (VALID_TABS.includes(tab as TabKey) ? (tab as TabKey) : "quotation");

  const openService = (svc: TabKey) => navigate(`/services/${svc}`);

  // landing section helpers (we'll use hash so Landing can scroll)
  const goHome = () => navigate("/#home");
  const goIncorp = () => navigate("/#incorporation");
  const goAccounting = () => navigate("/#accounting");
  const goPricing = () => navigate("/#pricing");

  const onTabChange = (val: string) => navigate(`/services/${val}`);

  return (
    <div className="min-h-screen">
      {/* ---- Header copied/adapted from Landing ---- */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          {/* Logo -> go back to Landing (home section) */}
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
            onClick={goHome}
          />

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <nav className="flex items-center gap-2">
              <Button variant="ghost" className="text-foreground/70 hover:text-foreground" onClick={goIncorp}>
                Incorporation
              </Button>
              <Button variant="ghost" className="text-foreground/70 hover:text-foreground" onClick={goAccounting}>
                Accounting & Taxation
              </Button>
              <Button variant="ghost" className="text-foreground/70 hover:text-foreground" onClick={goPricing}>
                Pricing
              </Button>

              {/* Services dropdown (stays on this page, switches tab) */}
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
                    Tax-Fee Estimator
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>

            <div className="w-px h-6 bg-gray-300" />
            <LanguageSwitcher />
            <Button variant="ghost" asChild><Link to="/login">Log in</Link></Button>
            <Button asChild><Link to="/signup">Get started</Link></Button>
          </div>

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                <Button variant="ghost" className="justify-start" onClick={goIncorp}>Incorporation</Button>
                <Button variant="ghost" className="justify-start" onClick={goAccounting}>Accounting & Taxation</Button>
                <Button variant="ghost" className="justify-start" onClick={goPricing}>Pricing</Button>
                <Button variant="ghost" className="justify-start" onClick={() => openService("quotation")}>
                  Quotation Request
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => openService("tax-fee")}>
                  Tax-Fee Estimator
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Mobile crumb row (kept minimal here) */}
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

      {/* ---- Services Tabs ---- */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">Services</h1>

        <Tabs value={currentTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="grid grid-cols-2 w-full sm:w-auto">
            <TabsTrigger value="quotation">Quotation Request</TabsTrigger>
            <TabsTrigger value="tax-fee">Tax-Fee Estimator</TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <Suspense fallback={<Card className="p-6">Loading…</Card>}>
              <TabsContent value="quotation" asChild>
                <div className="p-0">
                  <QuoteBuilder lockInvoiceWidth />
                </div>
              </TabsContent>

              <TabsContent value="tax-fee" asChild>
                <div className="p-0">
                  <HKAccountingEstimator />
                </div>
              </TabsContent>
            </Suspense>
          </div>
        </Tabs>
      </main>
    </div>
  );
}
