/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UnifiedFormEngine } from "./UnifiedFormEngine";
import { MCAP_CONFIGS, MCAP_CONFIG_MAP } from "./configs/registry";
import type { McapConfig } from "./configs/types";
import { ArrowLeft, Globe } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import api from "@/services/fetch";
import { toast } from "@/hooks/use-toast";
import { t } from "i18next";
import jwtDecode from "jwt-decode";

export default function McapDashboard() {
  const [selectedConfig, setSelectedConfig] = useState<McapConfig | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith("/incorporation-dashboard") ? "/incorporation-dashboard" : "/incorporation";
  const [initialData, setInitialData] = useState<any>(null);
  const [initialParties, setInitialParties] = useState<any[]>([]);
  const [initialCompanyId, setInitialCompanyId] = useState<string | null>(null);
  const [initialStepIdx, setInitialStepIdx] = useState<number | undefined>(undefined);
  const [isLoadingCompany, setIsLoadingCompany] = useState(false);
  const [accessDenied, setAccessDenied] = useState<string | null>(null);

  const token = useMemo(() => (localStorage.getItem("token") as string) ?? "", []);
  const decoded = useMemo(() => {
    try {
      return jwtDecode<{ userId?: string; role?: string; email?: string }>(token);
    } catch {
      return {};
    }
  }, [token]);

  const storedUser = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const currentUserId = storedUser?.id || storedUser?._id || decoded?.userId || "";
  const currentEmail = (storedUser?.email || decoded?.email || "").toLowerCase();
  const currentRole = storedUser?.role || decoded?.role || "";

  const requestedConfig = useMemo(() => {
    const id = searchParams.get("country");
    if (!id) return null;
    return MCAP_CONFIG_MAP[id] || null;
  }, [searchParams]);

  const requestedCompanyId = useMemo(() => searchParams.get("companyId"), [searchParams]);

  useEffect(() => {
    if (!requestedCompanyId) setAccessDenied(null);
  }, [requestedCompanyId]);

  useEffect(() => {
    if (!requestedCompanyId) return;
    let active = true;
    (async () => {
      setIsLoadingCompany(true);
      try {
        const res = await api.get(`/mcap/companies/${requestedCompanyId}`);
        const payload = res?.data?.data || res?.data;
        if (!payload?._id) throw new Error("Company not found");
        const cfg = MCAP_CONFIG_MAP[payload.countryCode] || null;
        if (!cfg) throw new Error("Unsupported country configuration");
        const ownerId = payload.userId?._id || payload.userId;
        const isApplicant = currentUserId && ownerId && String(ownerId) === String(currentUserId);
        const isDcp =
          currentEmail &&
          (payload.parties || []).some(
            (p: any) =>
              Array.isArray(p.roles) &&
              p.roles.includes("dcp") &&
              p.email &&
              String(p.email).toLowerCase() === currentEmail
          );
        const isAdmin = ["admin", "master"].includes(String(currentRole || "").toLowerCase());
        if (!isApplicant && !isDcp && !isAdmin) {
          setAccessDenied("You do not have access to this incorporation form.");
          setSelectedConfig(null);
          setInitialCompanyId(null);
          setInitialData(null);
          setInitialParties([]);
          setInitialStepIdx(undefined);
          return;
        }
        if (!active) return;
        setAccessDenied(null);
        setSelectedConfig(cfg);
        setInitialCompanyId(payload._id);
        const mergedData = { ...(payload.data || {}) };
        const paymentMeta = {
          paymentStatus: payload.paymentStatus,
          payMethod: payload.payMethod,
          paymentIntentId: payload.paymentIntentId,
          stripeLastStatus: payload.stripeLastStatus,
          stripeReceiptUrl: payload.stripeReceiptUrl,
          stripeAmountCents: payload.stripeAmountCents,
          stripeCurrency: payload.stripeCurrency,
          uploadReceiptUrl: payload.uploadReceiptUrl,
        };
        Object.entries(paymentMeta).forEach(([key, value]) => {
          if (value !== undefined) mergedData[key] = value;
        });
        setInitialData(mergedData);
        setInitialParties(payload.parties || []);
        setInitialStepIdx(typeof payload.stepIdx === "number" ? payload.stepIdx : 0);
      } catch (err: any) {
        toast({ title: "Unable to load application", description: err?.message || "Please try again.", variant: "destructive" });
      } finally {
        if (active) setIsLoadingCompany(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [requestedCompanyId]);

  useEffect(() => {
    if (requestedConfig) {
      setSelectedConfig(requestedConfig);
    }
  }, [requestedConfig]);
  // console.log("selectedConfig",selectedConfig)
  // console.log("initialData",initialData)
  // console.log("initialParties",initialParties)
  if (selectedConfig) {
    return (
      <div className="p-6">
        <Button
          variant="ghost"
          onClick={() => {
            setSelectedConfig(null);
            setInitialCompanyId(null);
            setInitialData(null);
            setInitialParties([]);
            setInitialStepIdx(undefined);
            navigate(basePath);
          }}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>
        <UnifiedFormEngine
          config={selectedConfig}
          initialData={initialData}
          initialParties={initialParties}
          initialCompanyId={initialCompanyId}
          initialStepIdx={initialStepIdx}
          isLoading={isLoadingCompany}
        />
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="max-width mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Access restricted</CardTitle>
            <CardDescription>{accessDenied}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(basePath)} variant="outline">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const grouped = MCAP_CONFIGS.reduce<Record<string, McapConfig[]>>((acc, cfg) => {
    const code = String(cfg.countryCode || "Other");
    const key = code.split("_")[0] || "Other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(cfg);
    return acc;
  }, {});

  const groupEntries = Object.entries(grouped);
  // console.log("groupEntries",groupEntries)
  return (
    <div className="min-h-[calc(100vh-120px)] p-2 md:p-8 max-width mx-auto">
      {/* Hero / Header */}
      <div className="relative overflow-hidden rounded-2xl border bg-card text-card-foreground p-6 md:p-8 shadow-sm">
        {/* subtle theme-aware glow using primary token */}
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          aria-hidden="true"
        >
          <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -top-12 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]" />
            Incorporation Hub
          </div>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
            Select a jurisdiction to launch the unified incorporation flow with compliance, parties, and payment steps.
          </p>
        </div>
      </div>

      <TooltipProvider delayDuration={0}>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2">
          {groupEntries.map(([group, configs]: any) => (
            <Card key={group} className="border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
                  {group}
                </CardTitle>
                <CardDescription className="text-xs">
                  {configs.length} configuration{configs.length > 1 ? "s" : ""} available
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="divide-y divide-border">
                  {configs.map((config: any) => (
                    <div
                      key={config.id}
                      className="flex items-center justify-between gap-3 py-2.5"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Icon pill - theme adaptive */}
                        <div className="h-8 w-8 rounded-lg border bg-muted/50 text-foreground flex items-center justify-center shrink-0">
                          <Globe className="w-4 h-4" />
                        </div>

                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate text-foreground">
                            {config.countryName}
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate">
                            {t(config.title) || "MCAP Configuration"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {/* Badge - theme adaptive */}
                            <div className="text-[10px] uppercase tracking-widest text-muted-foreground border border-border rounded-full px-2 py-0.5 bg-background">
                              {config.countryCode}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="text-xs">
                            <div>Currency: {config.currency}</div>
                            <div>Steps: {config.steps.length}</div>
                          </TooltipContent>
                        </Tooltip>

                        {/* Button - use shadcn variants instead of custom colors */}
                        <Button
                          size="sm"
                          variant="default"
                          className="h-7 px-3 text-xs"
                          onClick={() => setSelectedConfig(config)}
                        >
                          Start
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
}
