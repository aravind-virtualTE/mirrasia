/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import jwtDecode from "jwt-decode";
import { ArrowLeft, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import api from "@/services/fetch";
import { UnifiedFormEngine } from "./UnifiedFormEngine";
import { MCAP_CONFIGS, MCAP_CONFIG_MAP } from "./configs/registry";
import type { McapConfig, McapJourneyType } from "./configs/types";
import { DEFAULT_MCAP_JOURNEY_TYPE } from "./configs/types";
import { resolveMcapJourneyType } from "./journey";

export default function McapDashboard() {
  const { t } = useTranslation();
  const [selectedConfig, setSelectedConfig] = useState<McapConfig | null>(null);
  const [selectedJourneyType, setSelectedJourneyType] = useState<McapJourneyType>(DEFAULT_MCAP_JOURNEY_TYPE);
  const [pendingConfig, setPendingConfig] = useState<McapConfig | null>(null);
  const [journeyDialogOpen, setJourneyDialogOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const basePath = "/incorporation-dashboard";
  const [initialData, setInitialData] = useState<any>(null);
  const [initialParties, setInitialParties] = useState<any[]>([]);
  const [initialCompanyId, setInitialCompanyId] = useState<string | null>(null);
  const [initialStepIdx, setInitialStepIdx] = useState<number | undefined>(undefined);
  const [isLoadingCompany, setIsLoadingCompany] = useState(false);
  const [hasAccessDenied, setHasAccessDenied] = useState(false);

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
  const fallbackConfigTitle = t("mcap.dashboard.launcher.config.fallbackTitle", "MCAP Configuration");

  const requestedConfig = useMemo(() => {
    const id = searchParams.get("country");
    if (!id) return null;
    return MCAP_CONFIG_MAP[id] || null;
  }, [searchParams]);

  const requestedCompanyId = useMemo(() => searchParams.get("companyId"), [searchParams]);

  useEffect(() => {
    if (!requestedCompanyId) setHasAccessDenied(false);
  }, [requestedCompanyId]);

  useEffect(() => {
    if (!requestedCompanyId) return;
    let active = true;

    (async () => {
      setIsLoadingCompany(true);
      setHasAccessDenied(false);
      try {
        const res = await api.get(`/mcap/companies/${requestedCompanyId}`);
        const payload = res?.data?.data || res?.data;
        if (!payload?._id) throw new Error("company_not_found");

        const cfg = MCAP_CONFIG_MAP[payload.countryCode] || null;
        if (!cfg) throw new Error("unsupported_country_configuration");
        if (!active) return;

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
          setHasAccessDenied(true);
          setSelectedConfig(null);
          setInitialCompanyId(null);
          setInitialData(null);
          setInitialParties([]);
          setInitialStepIdx(undefined);
          return;
        }

        setHasAccessDenied(false);
        setSelectedConfig(cfg);
        setSelectedJourneyType(resolveMcapJourneyType(payload.journeyType));
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
        if (!active) return;

        const errorMessage = String(err?.message || "");
        const description =
          errorMessage === "company_not_found"
            ? t("mcap.dashboard.launcher.errors.companyNotFound", "Company not found")
            : errorMessage === "unsupported_country_configuration"
              ? t(
                "mcap.dashboard.launcher.errors.unsupportedCountryConfiguration",
                "Unsupported country configuration"
              )
              : errorMessage || t("mcap.dashboard.launcher.errors.retry", "Please try again.");

        toast({
          title: t("mcap.dashboard.launcher.errors.loadTitle", "Unable to load application"),
          description,
          variant: "destructive",
        });
      } finally {
        if (active) setIsLoadingCompany(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [currentEmail, currentRole, currentUserId, requestedCompanyId, t]);

  useEffect(() => {
    if (requestedConfig) {
      setSelectedConfig(requestedConfig);
      setSelectedJourneyType(DEFAULT_MCAP_JOURNEY_TYPE);
    }
  }, [requestedConfig]);

  const handleJourneyDialogChange = (open: boolean) => {
    setJourneyDialogOpen(open);
    if (!open) {
      setPendingConfig(null);
    }
  };

  const handleStart = (config: McapConfig) => {
    setPendingConfig(config);
    setJourneyDialogOpen(true);
  };

  const handleSelectJourney = (journeyType: McapJourneyType) => {
    if (!pendingConfig) return;
    setSelectedConfig(pendingConfig);
    setSelectedJourneyType(journeyType);
    setPendingConfig(null);
    setJourneyDialogOpen(false);
  };

  if (selectedConfig) {
    return (
      <div className="p-6">
        <Button
          variant="ghost"
          onClick={() => {
            setSelectedConfig(null);
            setSelectedJourneyType(DEFAULT_MCAP_JOURNEY_TYPE);
            setInitialCompanyId(null);
            setInitialData(null);
            setInitialParties([]);
            setInitialStepIdx(undefined);
            navigate(basePath);
          }}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("mcap.dashboard.launcher.back", "Back to Dashboard")}
        </Button>
        <UnifiedFormEngine
          config={selectedConfig}
          journeyType={selectedJourneyType}
          initialData={initialData}
          initialParties={initialParties}
          initialCompanyId={initialCompanyId}
          initialStepIdx={initialStepIdx}
          isLoading={isLoadingCompany}
        />
      </div>
    );
  }

  if (hasAccessDenied) {
    return (
      <div className="max-width mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("mcap.dashboard.launcher.accessRestricted.title", "Access restricted")}</CardTitle>
            <CardDescription>
              {t(
                "mcap.dashboard.launcher.accessRestricted.description",
                "You do not have access to this incorporation form."
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(basePath)} variant="outline">
              {t("mcap.dashboard.launcher.back", "Back to Dashboard")}
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

  return (
    <div className="min-h-[calc(100vh-120px)] p-2 md:p-8 max-width mx-auto">
      <div className="relative overflow-hidden rounded-2xl border bg-card p-6 text-card-foreground shadow-sm md:p-8">
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
            {t("mcap.dashboard.launcher.hero.eyebrow", "Incorporation Hub")}
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
            {t(
              "mcap.dashboard.launcher.hero.description",
              "Select a jurisdiction to launch the unified incorporation flow with compliance, parties, and payment steps."
            )}
          </p>
        </div>
      </div>

      <TooltipProvider delayDuration={0}>
        <div className="mt-6 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
          {groupEntries.map(([group, configs]: any) => (
            <Card key={group} className="border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
                  {group}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t("mcap.dashboard.launcher.groups.available", {
                    count: configs.length,
                    defaultValue: `${configs.length} configurations available`,
                  })}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="divide-y divide-border">
                  {configs.map((config: McapConfig) => (
                    <div
                      key={config.id}
                      className="flex items-center justify-between gap-3 py-2.5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-muted/50 text-foreground">
                          <Globe className="h-4 w-4" />
                        </div>

                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-foreground">
                            {t(`mcap.dashboard.launcher.countries.${config.id}`, {
                              defaultValue: config.countryName,
                            })}
                          </div>
                          <div className="truncate text-[11px] text-muted-foreground">
                            {config.title
                              ? t(config.title, { defaultValue: fallbackConfigTitle })
                              : fallbackConfigTitle}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                              {config.countryCode}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="text-xs">
                            <div>
                              {t("mcap.dashboard.launcher.tooltip.currency", {
                                currency: config.currency,
                                defaultValue: "Currency: {{currency}}",
                              })}
                            </div>
                            <div>
                              {t("mcap.dashboard.launcher.tooltip.steps", {
                                count: config.steps.length,
                                defaultValue: "Steps: {{count}}",
                              })}
                            </div>
                          </TooltipContent>
                        </Tooltip>

                        <Button
                          size="sm"
                          variant="default"
                          className="h-7 px-3 text-xs"
                          onClick={() => handleStart(config)}
                        >
                          {t("mcap.dashboard.launcher.actions.start", "Start")}
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
      <Dialog open={journeyDialogOpen} onOpenChange={handleJourneyDialogChange}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-[720px] max-h-[85vh] overflow-y-auto p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle>
              {t("mcap.journey.chooser.title", "Choose Application Type")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "mcap.journey.chooser.description",
                "Select whether this request is for a new incorporation or an existing company onboarding."
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Button
              type="button"
              className="min-h-[112px] items-start justify-start whitespace-normal px-5 py-6 text-left sm:min-h-[128px] sm:px-6"
              onClick={() => handleSelectJourney("new_incorporation")}
            >
                <span className="block font-semibold">
                  {t("mcap.journey.labels.new_incorporation", "New Incorporation")}
                </span>             
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-h-[112px] items-start justify-start whitespace-normal px-5 py-6 text-left sm:min-h-[128px] sm:px-6"
              onClick={() => handleSelectJourney("existing_company_onboarding")}
            >
                <span className="block font-semibold">
                  {t("mcap.journey.labels.existing_company_onboarding", "Existing Company Onboarding")}
                </span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
