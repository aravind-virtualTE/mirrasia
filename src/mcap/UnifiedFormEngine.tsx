/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UnifiedTextField } from "./fields/TextField";
import { UnifiedSignatureField } from "./fields/SignatureField";
import { UnifiedSelectField } from "./fields/SelectField";
import { UnifiedSearchSelectField } from "./fields/SearchSelectField";
import { PartyWidget } from "./fields/PartyWidget";
import { PaymentWidget } from "./fields/PaymentWidget";
import { ServiceSelectionWidget } from "./fields/ServiceSelectionWidget";
import { InvoiceWidget } from "./fields/InvoiceWidget";
import { RepeatableSectionWidget } from "./fields/RepeatableSectionWidget";
import { PanamaServiceSetupWidget } from "./fields/PanamaServiceSetupWidget";
import { FieldTooltip } from "./fields/FieldTooltip";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { McapConfig, McapField, McapJourneyType, McapReviewSummaryRow, RepeatableSection } from "./configs/types";
import { Progress } from "@/components/ui/progress";
import { buildDefaultsForFields, getDefaultValueForField } from "./fields/fieldDefaults";
import { API_URL } from "@/services/fetch";
import { getExchangeRate, getPricingBaseCurrency } from "@/services/exchangeRate";
import { DEFAULT_MCAP_JOURNEY_TYPE } from "./configs/types";
import {
    ADDITIONAL_EXECUTIVE_USD_TO_BASE_CURRENCY_FIELD,
    ADDITIONAL_EXECUTIVE_USD_TO_BASE_RATE_FIELD,
    applyAdditionalExecutiveFeesToFees,
    getAdditionalExecutiveUsdToBaseRate,
} from "./additionalExecutivePricing";
import {
    isExistingCompanyOnboardingJourney,
    resolveMcapConfigForJourney,
    resolveMcapJourneyType,
} from "./journey";

// --- API Helper (Inlined for Demo) ---
const API_BASE = API_URL.replace(/\/+$/, "");

const saveToBackend = async (payload: any) => {
    // In real implementation, use the api service
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/mcap/companies`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });
    return res.json();
};

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {};
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    return headers;
};

const uploadSignatureToBackend = async (companyId: string, field: string, file: File) => {
    const payload = new FormData();
    payload.append("file", file);
    payload.append("field", field);

    const res = await fetch(`${API_BASE}/mcap/companies/${companyId}/signature`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: payload,
    });

    return res.json();
};

const deleteSignatureFromBackend = async (companyId: string, field: string) => {
    const res = await fetch(`${API_BASE}/mcap/companies/${companyId}/signature/${field}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });

    return res.json();
};

const buildSignatureFile = (signatureDataUrl: string, fieldName: string) => {
    const matches = signatureDataUrl.match(/^data:(.*?);base64,(.*)$/);
    if (!matches) {
        throw new Error("Invalid signature image");
    }

    const [, mimeType = "image/png", base64 = ""] = matches;
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
    }

    const extension = mimeType.split("/")[1] || "png";
    return new File([bytes], `${fieldName}-${Date.now()}.${extension}`, { type: mimeType });
};

export const UnifiedFormEngine = ({
    config,
    journeyType = DEFAULT_MCAP_JOURNEY_TYPE,
    initialData,
    initialParties,
    initialCompanyId,
    initialStepIdx,
    isLoading = false,
}: {
    config: McapConfig;
    journeyType?: McapJourneyType;
    initialData?: Record<string, any> | null;
    initialParties?: any[];
    initialCompanyId?: string | null;
    initialStepIdx?: number;
    isLoading?: boolean;
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [currentStepIdx, setCurrentStepIdx] = useState(0);
    const [formData, setFormData] = useState<any>({}); // Stores the dynamic 'data' field
    const [parties, setParties] = useState<any[]>([]);   // Stores 'parties'
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionResult, setSubmissionResult] = useState<any>(null);
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [isAdvancingStep, setIsAdvancingStep] = useState(false);
    const companyIdRef = useRef<string | null>(null);
    const ensureDraftInFlightRef = useRef<Promise<string | null> | null>(null);
    const isAdvancingStepRef = useRef(false);
    // TEMP (admin testing only): keep true to bypass required-step blocking and unlock sidebar jumps.
    // Revert this to false after admin testing is complete.
    const ADMIN_TEST_RELAX_VALIDATION = true;

    const resolvedJourneyType = useMemo(() => resolveMcapJourneyType(journeyType), [journeyType]);
    const runtimeConfig = useMemo(
        () => resolveMcapConfigForJourney(config, resolvedJourneyType),
        [config, resolvedJourneyType]
    );
    const isExistingCompanyOnboarding = useMemo(
        () => isExistingCompanyOnboardingJourney(resolvedJourneyType),
        [resolvedJourneyType]
    );
    const currentStep = runtimeConfig.steps[currentStepIdx];
    const isLastStep = currentStepIdx === runtimeConfig.steps.length - 1;
    const entityMeta = useMemo(() => runtimeConfig.entityMeta || {}, [runtimeConfig.entityMeta]);
    const pricingBaseCurrency = useMemo(() => getPricingBaseCurrency(config.countryCode), [config.countryCode]);
    // Prefer fresh step-level computeFees. If converted FX metadata is missing from that output,
    // fall back to cached converted computedFees from ServiceSelectionWidget.
    const computedFees = useMemo(() => {
        const cachedFees = formData?.computedFees;
        const calculated = currentStep.computeFees
            ? currentStep.computeFees(formData, entityMeta)
            : (cachedFees || currentStep.fees);
        const withAdditionalExecutiveFees = (fees: any) =>
            applyAdditionalExecutiveFeesToFees(fees, {
                countryCode: config.countryCode,
                parties,
                payMethod: formData?.payMethod,
                enabled: Array.isArray(parties) && parties.length > 0,
                usdToBaseRate: getAdditionalExecutiveUsdToBaseRate(config.countryCode, formData),
            });

        if (!cachedFees || !currentStep.computeFees) return withAdditionalExecutiveFees(calculated);

        const requestedCurrency = String(formData?.paymentCurrency || formData?.currency || "").toUpperCase();
        const calculatedCurrency = String((calculated as any)?.currency || "").toUpperCase();
        const cachedCurrency = String((cachedFees as any)?.currency || "").toUpperCase();
        const cachedOriginalCurrency = String(
            (cachedFees as any)?.originalCurrency
            || ((cachedFees as any)?.originalAmountUsd !== undefined ? "USD" : "")
        ).toUpperCase();
        const hasCalculatedFx =
            Number.isFinite(Number((calculated as any)?.exchangeRateUsed))
            && Number((calculated as any)?.exchangeRateUsed) > 0;
        const cachedRepresentsConvertedState =
            !!cachedOriginalCurrency
            && cachedOriginalCurrency !== cachedCurrency;
        const shouldUseCachedFx = !!requestedCurrency
            && cachedRepresentsConvertedState
            && cachedCurrency === requestedCurrency
            && (!hasCalculatedFx || calculatedCurrency !== requestedCurrency);

        return withAdditionalExecutiveFees(shouldUseCachedFx ? cachedFees : calculated);
    }, [config.countryCode, currentStep, formData, entityMeta, parties]);

    useEffect(() => {
        companyIdRef.current = companyId;
    }, [companyId]);

    const currentUser = useMemo(() => {
        try {
            const rawUser = localStorage.getItem("user");
            return rawUser ? JSON.parse(rawUser) : null;
        } catch {
            return null;
        }
    }, []);
    const userId = currentUser?.id || null;
    const userRole = String(currentUser?.role || "").trim().toLowerCase();
    const isAdminOrMaster = userRole === "admin" || userRole === "master";
    const allowAdminTestingBypass = ADMIN_TEST_RELAX_VALIDATION && isAdminOrMaster;

    const defaultData = useMemo(() => {
        const initial: Record<string, any> = {};

        const applyFieldDefaults = (fields?: McapField[]) => {
            (fields || []).forEach((field) => {
                if (!field.name) return;
                if (initial[field.name] !== undefined) return;
                const value = getDefaultValueForField(field);
                if (value !== undefined) initial[field.name] = value;
            });
        };

        const applySectionDefaults = (sections?: RepeatableSection[]) => {
            (sections || []).forEach((section) => {
                if (!section.fieldName) return;
                if (initial[section.fieldName] !== undefined) return;
                if (section.kind === "list") {
                    const count = section.minItems || 0;
                    const itemDefaults = buildDefaultsForFields(section.itemFields || []);
                    initial[section.fieldName] = Array.from({ length: count }, () => ({ ...itemDefaults }));
                    return;
                }
                if (section.kind === "object") {
                    initial[section.fieldName] = {};
                }
            });
        };

        runtimeConfig.steps.forEach((step) => {
            applyFieldDefaults(step.fields);

            if (step.widget === "RepeatableSection" && step.widgetConfig) {
                const cfg = step.widgetConfig;
                applyFieldDefaults(cfg.preFields);
                if (cfg.modeField && initial[cfg.modeField] === undefined) {
                    initial[cfg.modeField] = "";
                }
                applySectionDefaults(cfg.sections);
                (cfg.modes || []).forEach((mode: any) => applySectionDefaults(mode.sections));
            }
        });

        return initial;
    }, [runtimeConfig.steps]);

    useEffect(() => {
        if (Object.keys(formData).length === 0) {
            if (initialData && Object.keys(initialData).length > 0) {
                setFormData({ ...defaultData, ...initialData });
            } else {
                setFormData(defaultData);
            }
        }
    }, [defaultData, formData, initialData]);

    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            setFormData((prev: any) => ({ ...defaultData, ...prev, ...initialData }));
        }
    }, [initialData, defaultData]);

    useEffect(() => {
        if (Array.isArray(initialParties) && initialParties.length > 0) {
            setParties(initialParties);
        }
    }, [initialParties]);

    useEffect(() => {
        if (initialCompanyId) {
            companyIdRef.current = initialCompanyId;
            setCompanyId(initialCompanyId);
        }
    }, [initialCompanyId]);

    useEffect(() => {
        if (typeof initialStepIdx === "number") {
            setCurrentStepIdx(Math.max(0, Math.min(initialStepIdx, runtimeConfig.steps.length - 1)));
        }
    }, [initialStepIdx, runtimeConfig.steps.length]);

    useEffect(() => {
        if (!Array.isArray(parties)) return;
        setFormData((prev: any) => ({ ...prev, parties }));
    }, [parties]);

    useEffect(() => {
        let cancelled = false;

        if (pricingBaseCurrency === "USD") {
            setFormData((prev: any) => {
                if (
                    Number(prev?.[ADDITIONAL_EXECUTIVE_USD_TO_BASE_RATE_FIELD] || 0) === 1
                    && String(prev?.[ADDITIONAL_EXECUTIVE_USD_TO_BASE_CURRENCY_FIELD] || "").toUpperCase() === "USD"
                ) {
                    return prev;
                }

                return {
                    ...prev,
                    [ADDITIONAL_EXECUTIVE_USD_TO_BASE_RATE_FIELD]: 1,
                    [ADDITIONAL_EXECUTIVE_USD_TO_BASE_CURRENCY_FIELD]: "USD",
                };
            });
            return () => {
                cancelled = true;
            };
        }

        const existingRate = getAdditionalExecutiveUsdToBaseRate(config.countryCode, formData);
        const existingTargetCurrency = String(
            formData?.[ADDITIONAL_EXECUTIVE_USD_TO_BASE_CURRENCY_FIELD] || ""
        ).toUpperCase();
        if (existingRate > 0 && existingTargetCurrency === pricingBaseCurrency) {
            return () => {
                cancelled = true;
            };
        }

        const loadAdditionalExecutiveRate = async () => {
            try {
                const rate = await getExchangeRate("USD", pricingBaseCurrency);
                if (cancelled) return;

                setFormData((prev: any) => {
                    const prevRate = getAdditionalExecutiveUsdToBaseRate(config.countryCode, prev);
                    const prevTargetCurrency = String(
                        prev?.[ADDITIONAL_EXECUTIVE_USD_TO_BASE_CURRENCY_FIELD] || ""
                    ).toUpperCase();
                    if (prevRate === rate && prevTargetCurrency === pricingBaseCurrency) {
                        return prev;
                    }

                    return {
                        ...prev,
                        [ADDITIONAL_EXECUTIVE_USD_TO_BASE_RATE_FIELD]: rate,
                        [ADDITIONAL_EXECUTIVE_USD_TO_BASE_CURRENCY_FIELD]: pricingBaseCurrency,
                    };
                });
            } catch (error) {
                if (!cancelled) {
                    console.error("Unable to load additional executive base currency rate:", error);
                }
            }
        };

        loadAdditionalExecutiveRate();

        return () => {
            cancelled = true;
        };
    }, [
        config.countryCode,
        formData,
        pricingBaseCurrency,
    ]);

    // --- Handlers ---
    const handleFieldChange = (name: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const getEntityMeta = (code?: string) => {
        if (!code) return null;
        return entityMeta[code] || null;
    };

    const missingFields = useMemo(() => {
        const missing: string[] = [];
        const normalizeStatus = (value: any) => String(value || "").trim().toLowerCase();
        const isTruthy = (value: any) => {
            if (typeof value === "boolean") return value;
            const normalized = normalizeStatus(value);
            return ["true", "yes", "1", "y"].includes(normalized);
        };
        // const dcpKycReadyStatuses = new Set(["in_progress", "submitted", "approved"]);
        const getStepSections = (cfg: any) => {
            if (!cfg) return [];
            if (cfg.modeField && Array.isArray(cfg.modes) && cfg.modes.length > 0) {
                const modeValue = formData[cfg.modeField];
                const active = cfg.modes.find((m: any) => m.value === modeValue);
                return active?.sections || [];
            }
            return cfg.sections || [];
        };

        const checkField = (
            field: McapField,
            value: any,
            dataContext: Record<string, any>,
            labelPrefix?: string
        ) => {
            if (!field || !field.required) return;
            if (field.type === "info" || field.type === "derived") return;
            if (!field.name) return;
            if (field.condition && !field.condition(dataContext)) return;

            const label = t(field.label || field.name, field.label || field.name);
            const labeled = labelPrefix ? `${labelPrefix}: ${label}` : label;

            if (field.type === "checkbox") {
                if (!value) missing.push(labeled);
                return;
            }
            if (field.type === "checkbox-group") {
                if (!Array.isArray(value) || value.length === 0) missing.push(labeled);
                return;
            }
            if (value === undefined || value === null || String(value).trim() === "") {
                missing.push(labeled);
            }
        };

        const checkFields = (fields: McapField[] | undefined, dataContext: Record<string, any>, prefix?: string) => {
            (fields || []).forEach((field) => {
                const value = field.name ? dataContext[field.name] : undefined;
                checkField(field, value, dataContext, prefix);
            });
        };

        checkFields(currentStep.fields, formData);

        if (currentStep.widget === "RepeatableSection" && currentStep.widgetConfig) {
            const cfg = currentStep.widgetConfig;
            checkFields(cfg.preFields, formData);

            if (cfg.modeField && cfg.modes && cfg.modes.length > 0) {
                const modeValue = formData[cfg.modeField];
                if (!modeValue) {
                    const modeLabel =
                        cfg.preFields?.find((f: any) => f.name === cfg.modeField)?.label || cfg.modeField;
                    missing.push(String(t(String(modeLabel), String(modeLabel))));
                }
            }

            const sections = getStepSections(cfg);
            sections.forEach((section: any) => {
                if (section.condition && !section.condition(formData)) return;
                const title = section.title ? t(section.title, section.title) : section.fieldName || t("common.item", "Item");

                const sectionItems = section.kind === "list"
                    ? (Array.isArray(formData[section.fieldName || ""]) ? formData[section.fieldName || ""] : [])
                    : [formData[section.fieldName || ""] || {}];

                if (section.kind === "list") {
                    const minItems = section.minItems || 0;
                    if (minItems > 0 && sectionItems.length < minItems) {
                        missing.push(`${title}: ${t("common.atLeastItems", "At least")} ${minItems}`);
                    }
                }

                sectionItems.forEach((item: any, idx: number) => {
                    const itemLabel = section.kind === "list"
                        ? (section.itemLabel ? t(section.itemLabel, { n: idx + 1, title }) : `${title} ${idx + 1}`)
                        : title;
                    checkFields(section.itemFields, { ...formData, ...(item || {}) }, itemLabel);
                });

                const includeDcpFromKey = section?.invite?.includeDcpFromKey;
                if (!includeDcpFromKey) return;
                const dcpEntries = sectionItems.filter((item: any) => isTruthy(item?.[includeDcpFromKey]));
                if (dcpEntries.length === 0) {
                    missing.push(t("mcap.validation.dcpRequired", "Designated Contact Person (DCP) required"));
                    return;
                }
                if (section.invite) {
                    const hasInvitedDcp = dcpEntries.some((entry: any) => {
                        if (entry?.invited === true) return true;
                        const statusKey = section.invite.statusKey || "status";
                        const status = normalizeStatus(entry?.inviteStatus || entry?.[statusKey]);
                        return ["invited", "sent", "accepted", "completed", "approved"].includes(status);
                    });
                    if (!hasInvitedDcp) {
                        missing.push(t("mcap.validation.dcpInviteRequired", "Designated Contact Person (DCP) must be invited before continuing"));
                    }
                }
            });
        }

        if (currentStep.widget === "PartiesManager") {
            const min = currentStep.minParties || 0;
            if (min > 0 && parties.length < min) {
                missing.push(
                    String(
                        t("mcap.validation.minParties", "At least {{count}} party(ies) required", { count: min })
                    )
                );
            }
            if (currentStep.requireDcp) {
                const dcpParties = parties.filter((p) =>
                    Array.isArray(p?.roles)
                    && p.roles.some((role: any) => String(role || "").trim().toLowerCase() === "dcp")
                );
                if (dcpParties.length === 0) {
                    missing.push(t("mcap.validation.dcpRequired", "Designated Contact Person (DCP) required"));
                } 
                // else {
                //     const hasKycSignal = dcpParties.some((p) => p?.kycStatus !== undefined && p?.kycStatus !== null && String(p?.kycStatus).trim() !== "");
                //     if (hasKycSignal) {
                //         const hasReadyDcp = dcpParties.some((p) => dcpKycReadyStatuses.has(normalizeStatus(p?.kycStatus)));
                //         if (!hasReadyDcp) {
                //             missing.push(
                //                 t(
                //                     "mcap.validation.dcpKycRequired",
                //                     "Designated Contact Person (DCP) must start or complete KYC before continuing"
                //                 )
                //             );
                //         }
                //     }
                // }
            }
            if (currentStep.requirePartyInvite) {
                const allInvited = parties.length > 0 && parties.every((p) => p.invited);
                if (!allInvited) {
                    missing.push(t("mcap.validation.inviteAllParties", "All parties must be invited before continuing"));
                }
            }
            if (currentStep.partyCoverageRules && currentStep.partyCoverageRules.length > 0) {
                const getPartyField = (party: any, key: string, storage?: "root" | "details") =>
                    storage === "root" ? party?.[key] : party?.details?.[key];

                currentStep.partyCoverageRules.forEach((rule) => {
                    const required = Array.isArray(rule.requiredValues) ? rule.requiredValues : [];
                    if (required.length === 0) return;

                    const missingValues = required.filter((requiredValue) => {
                        const expected = String(requiredValue).trim().toLowerCase();
                        return !parties.some((party) => {
                            const actual = getPartyField(party, rule.key, rule.storage);
                            if (Array.isArray(actual)) {
                                return actual.some(
                                    (entry: any) => String(entry ?? "").trim().toLowerCase() === expected
                                );
                            }
                            return String(actual ?? "").trim().toLowerCase() === expected;
                        });
                    });

                    if (missingValues.length > 0) {
                        const label = rule.label ? t(rule.label, rule.label) : rule.key;
                        const renderedValues = missingValues.map((value) => {
                            const valueLabel = rule.valueLabels?.[value] || value;
                            return t(valueLabel, valueLabel);
                        });
                        missing.push(
                            String(
                                t("mcap.validation.partyCoverageMissing", "{{label}}: missing required options ({{values}})", {
                                    label,
                                    values: renderedValues.join(", "),
                                })
                            )
                        );
                    }
                });
            }
        }

        return missing;
    }, [currentStep, formData, parties, t]);

    const ensureDraft = useCallback(async () => {
        if (ensureDraftInFlightRef.current) {
            return ensureDraftInFlightRef.current;
        }

        const request = (async () => {
            const currentCompanyId = companyIdRef.current;
            console.log("Ensuring draft...", currentCompanyId);

            const payload = {
                _id: currentCompanyId || undefined,
                countryCode: config.countryCode,
                countryName: config.countryName,
                journeyType: resolvedJourneyType,
                status: "Draft",
                stepIdx: currentStepIdx,
                data: formData,
                parties,
                userId: userId
            };
            const response = await saveToBackend(payload);
            if (response?.success && response?.data?._id) {
                const nextCompanyId = response.data._id as string;
                companyIdRef.current = nextCompanyId;
                setCompanyId((prev) => (prev === nextCompanyId ? prev : nextCompanyId));
                return nextCompanyId;
            }
            return null;
        })().finally(() => {
            ensureDraftInFlightRef.current = null;
        });

        ensureDraftInFlightRef.current = request;
        return request;
    }, [config.countryCode, config.countryName, currentStepIdx, formData, parties, resolvedJourneyType, userId]);

    useEffect(() => {
        if (currentStep.widget === "PaymentWidget" && !companyIdRef.current) {
            void ensureDraft();
        }
    }, [currentStep.widget, ensureDraft]);

    const uploadSignatureAsset = useCallback(async (fieldName: string, signature: string) => {
        const draftCompanyId = companyIdRef.current || await ensureDraft();
        if (!draftCompanyId) {
            throw new Error("Unable to create draft before uploading signature");
        }

        const file = buildSignatureFile(signature, fieldName);
        const response = await uploadSignatureToBackend(draftCompanyId, fieldName, file);

        if (!response?.success || !response?.data?.url) {
            throw new Error(response?.message || "Failed to upload signature");
        }

        return response.data.url as string;
    }, [ensureDraft]);

    const removeSignatureAsset = useCallback(async (fieldName: string) => {
        const currentCompanyId = companyIdRef.current;
        if (!currentCompanyId) return;

        const response = await deleteSignatureFromBackend(currentCompanyId, fieldName);
        if (!response?.success) {
            throw new Error(response?.message || "Failed to delete signature");
        }
    }, []);

    const handleNext = async () => {
        if (isLastStep) {
            // Submit
            await handleSubmit();
        } else {
            if (isAdvancingStepRef.current) return;
            isAdvancingStepRef.current = true;
            setIsAdvancingStep(true);

            try {
                const persistBlockedDraftIfNeeded = async () => {
                    if (!currentStep.saveDraftOnBlockedNext) return true;
                    const blockedDraftId = await ensureDraft();
                    if (blockedDraftId) return true;
                    toast({
                        title: t("mcap.error.title", "Error"),
                        description: t("mcap.error.draftSaveFailed", "Unable to save draft. Please try again."),
                        variant: "destructive",
                    });
                    return false;
                };
                // TEMP (admin testing only): required-field validation is bypassed only for admin/master when ADMIN_TEST_RELAX_VALIDATION is true.
                if (!allowAdminTestingBypass && missingFields.length > 0) {
                    const persisted = await persistBlockedDraftIfNeeded();
                    if (!persisted) return;
                    toast({
                        title: t("mcap.validation.missingInformation.title", "Missing information"),
                        description: t("mcap.validation.missingInformation.desc", "Please complete required fields to continue."),
                        variant: "destructive",
                    });
                    return;
                }
                const nextGuardResult = currentStep.nextGuard
                    ? await currentStep.nextGuard({ data: formData, parties, entityMeta })
                    : null;
                if (nextGuardResult?.block) {
                    if (nextGuardResult.saveDraftBeforeBlock !== false) {
                        const blockedDraftId = await ensureDraft();
                        if (!blockedDraftId) {
                            toast({
                                title: t("mcap.error.title", "Error"),
                                description: t("mcap.error.draftSaveFailed", "Unable to save draft. Please try again."),
                                variant: "destructive",
                            });
                            return;
                        }
                    }
                    toast({
                        title: nextGuardResult.title,
                        description: nextGuardResult.description,
                        variant: nextGuardResult.variant,
                    });
                    return;
                }
                console.log("Ensuring draft before next step...");
                const draftId = await ensureDraft();
                if (!draftId) {
                    toast({
                        title: t("mcap.error.title", "Error"),
                        description: t("mcap.error.draftSaveFailed", "Unable to save draft. Please try again."),
                        variant: "destructive",
                    });
                    return;
                }
                setCurrentStepIdx((prev) => prev + 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
            } catch (e) {
                console.error(e);
                toast({
                    title: t("mcap.error.title", "Error"),
                    description: t("mcap.error.draftSaveFailed", "Unable to save draft. Please try again."),
                    variant: "destructive",
                });
            } finally {
                isAdvancingStepRef.current = false;
                setIsAdvancingStep(false);
            }
        }
    };

    const handlePaymentComplete = async () => {
        await handleNext();
    };

    const handleBack = () => {
        setCurrentStepIdx(prev => Math.max(0, prev - 1));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Prepare Payload
            // 1. Save Parties? The backend controller we wrote expects parties in the payload or saved separately.
            // Our controller `saveCompany` accepts `parties` array.
            // But ideally we should map them to the unified model structure.

            const payload = {
                _id: companyIdRef.current || undefined,
                countryCode: config.countryCode,
                countryName: config.countryName,
                journeyType: resolvedJourneyType,
                status: "Submitted",
                stepIdx: currentStepIdx,
                data: formData, // The dynamic fields
                parties: parties, // The widget data
                userId: userId
            };

            const response = await saveToBackend(payload);

            if (response.success) {
                if (response?.data?._id) {
                    companyIdRef.current = response.data._id;
                    setCompanyId(response.data._id);
                }
                setSubmissionResult(response.data);
                toast({ title: "Success", description: "Company Application Created via MCAP Engine!" });
            } else {
                toast({ title: "Error", description: response.message, variant: "destructive" });
            }

        } catch (e) {
            console.error(e);
            toast({ title: "Error", description: "Submission Failed", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Renderers ---
    const renderFieldWithValue = (
        field: McapField,
        value: any,
        onChange: (val: any) => void,
        dataContext: Record<string, any>,
        fieldKey?: string
    ) => {
        if (field.condition && !field.condition(dataContext)) return null;

        // Type guard: ensure field.name exists for fields that need it
        if (!field.name && field.type !== "info" && field.type !== "info-list" && field.type !== "info-block") return null;

        const key = fieldKey || field.name || field.label || `field-${Math.random()}`;

        const commonProps = {
            field,
            value,
            onChange,
        };

        if (
            field.type === "text"
            || field.type === "textarea"
            || field.type === "number"
            || field.type === "email"
            || field.type === "date"
        ) {
            return <UnifiedTextField key={key} {...commonProps} />;
        }
        if (field.type === "signature") {
            return (
                <UnifiedSignatureField
                    key={key}
                    {...commonProps}
                    onUploadSignature={(signature) => uploadSignatureAsset(field.name!, signature)}
                    onRemoveSignature={() => removeSignatureAsset(field.name!)}
                />
            );
        }
        if (field.type === "select" || field.type === "radio") {
            return <UnifiedSelectField key={key} {...commonProps} />;
        }
        if (field.type === "radio-group") {
            return <UnifiedSelectField key={key} {...commonProps} />;
        }
        if (field.type === "search-select") {
            return <UnifiedSearchSelectField key={key} {...commonProps} />;
        }
        if (field.type === "checkbox") {
            const checkboxId = fieldKey || field.name!;
            return (
                <div key={key} className={cn("flex items-start gap-2", field.colSpan === 2 && "md:col-span-2")}>
                    <Checkbox
                        id={checkboxId}
                        checked={!!value}
                        onCheckedChange={(v) => onChange(!!v)}
                    />
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                            <Label htmlFor={checkboxId} className="font-medium">
                                {t(field.label || "", field.label || "")} {field.required && <span className="text-red-500">*</span>}
                            </Label>
                            <FieldTooltip content={t(field.tooltip || "", field.tooltip || "") as string} />
                        </div>
                    </div>
                </div>
            );
        }
        if (field.type === "checkbox-group") {
            const selected = Array.isArray(value) ? value : [];
            const toggle = (optValue: string, on: boolean) => {
                const next = new Set(selected);
                if (on) next.add(optValue);
                else next.delete(optValue);
                onChange(Array.from(next));
            };
            return (
                <div key={key} className="space-y-2">
                    <div className="flex items-center gap-1.5">
                        <Label className="font-medium">
                            {t(field.label || "", field.label || "")} {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        <FieldTooltip content={t(field.tooltip || "", field.tooltip || "") as string} />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2">
                        {field.options?.map((opt) => (
                            <label key={opt.value} className="flex items-center gap-2 border rounded-md p-2">
                                <Checkbox
                                    checked={selected.includes(opt.value)}
                                    onCheckedChange={(v) => toggle(opt.value, v === true)}
                                />
                                <span className="text-sm">{t(opt.label, opt.label)}</span>
                            </label>
                        ))}
                    </div>
                </div>
            );
        }
        if (field.type === "info") {
            const infoKey = key || `info-${Math.random()}`;
            const infoContent = typeof field.content === "string" ? t(field.content, field.content) : field.content;
            return (
                <div key={infoKey} className={cn("rounded-md border border-dashed bg-muted/5 p-3 text-sm text-foreground", field.colSpan === 2 && "md:col-span-2")}>
                    {field.label && <div className="font-semibold text-foreground mb-1">{t(field.label, field.label)}</div>}
                    {infoContent}
                </div>
            );
        }
        if (field.type === "info-block") {
            const listKeys = field.listItemKeys || [];
            const prefix = field.listPrefix || "";
            return (
                <div key={key} className={cn("rounded-md border bg-muted/40 p-3 text-[13px] text-foreground", field.colSpan === 2 && "md:col-span-2")}>
                    <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <div className="space-y-1 leading-relaxed">
                            {listKeys.map((k) => (
                                <div key={k}>
                                    <span className="font-bold">{t(`${prefix}.${k}Title`)}</span>
                                    {t(`${prefix}.${k}Body`)}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }
        if (field.type === "info-list") {
            const listKeys = field.listItemKeys || [];
            const prefix = field.listPrefix || "";
            return (
                <div key={key} className={cn("space-y-2", field.colSpan === 2 && "md:col-span-2")}>
                    {field.label && (
                        <div className="font-medium text-foreground">
                            {t(field.label, field.label)}
                        </div>
                    )}
                    <div className="rounded-md border p-2.5 text-[13px] text-muted-foreground">
                        {listKeys.map((k) => (
                            <details className="mb-1.5" key={k}>
                                <summary className="cursor-pointer font-medium hover:text-foreground">
                                    {t(`${prefix}.${k}.title`)}
                                </summary>
                                <div className="pl-2 pt-1">
                                    {t(`${prefix}.${k}.desc`)}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            );
        }
        if (field.type === "derived") {
            const meta = getEntityMeta(dataContext.entityType ?? formData.entityType);
            const derivedValue = field.compute ? field.compute(dataContext, meta) : "";
            return (
                <div key={key} className={cn("space-y-2", field.colSpan === 2 && "md:col-span-2")}>
                    <Label htmlFor={fieldKey || field.name!}>{t(field.label || "", field.label || "")}</Label>
                    <Input id={fieldKey || field.name!} value={derivedValue || ""} readOnly />
                </div>
            );
        }
        return null;
    };

    const renderField = (field: McapField) =>
        renderFieldWithValue(
            field,
            field.name ? formData[field.name] : undefined,
            (val) => field.name && handleFieldChange(field.name, val),
            formData,
            field.name
        );

    const renderReviewSummary = () => {
        if (currentStep.id !== "review") return null;

        const getValueEntry = (keys: string[]) => {
            for (const key of keys) {
                const val = formData?.[key];
                if (val === undefined || val === null) continue;
                if (Array.isArray(val) && val.length === 0) continue;
                if (!Array.isArray(val) && String(val).trim() === "") continue;
                return { key, value: val };
            }
            return null;
        };

        const findFieldByName = (name: string) =>
            runtimeConfig.steps
                .flatMap((step) => step.fields || [])
                .find((field) => field.name === name);

        const getOptionDisplay = (field: McapField, rawValue: any) => {
            if (field.type === "search-select") {
                const matchedItem = (field.items || []).find((item: any) => String(item?.code) === String(rawValue));
                return matchedItem?.label
                    ? t(String(matchedItem.label), String(matchedItem.label))
                    : String(rawValue);
            }

            const matchedOption = (field.options || []).find((option) => String(option.value) === String(rawValue));
            return matchedOption
                ? t(matchedOption.label, matchedOption.label)
                : String(rawValue);
        };

        const renderValue = (value: any) => {
            if (Array.isArray(value)) return value.length ? value.join(", ") : "-";
            if (typeof value === "boolean") {
                return value
                    ? t("common.yes", "Yes")
                    : t("common.no", "No");
            }
            return String(value);
        };

        const renderFieldEntryValue = (entry: { key: string; value: any } | null) => {
            if (!entry) return "-";
            const field = findFieldByName(entry.key);
            if (!field) return renderValue(entry.value);

            if (Array.isArray(entry.value)) {
                return entry.value.length
                    ? entry.value.map((v) => getOptionDisplay(field, v)).join(", ")
                    : "-";
            }

            if (
                field.type === "select"
                || field.type === "radio"
                || field.type === "radio-group"
                || field.type === "checkbox-group"
                || field.type === "search-select"
            ) {
                return getOptionDisplay(field, entry.value);
            }

            return renderValue(entry.value);
        };

        const getEntryLabel = (entry: { key: string; value: any } | null, fallback: string) => {
            if (!entry) return fallback;
            const field = findFieldByName(entry.key);
            return field?.label ? t(field.label, field.label) : fallback;
        };

        const applicantEntry = getValueEntry(["applicantName", "authorName", "name", "contactName", "primaryContactName"]);
        const applicantEmailEntry = getValueEntry(["email", "applicantEmail", "applicantEmailAddress", "contactEmail"]);
        const applicantPhoneEntry = getValueEntry(["phone", "phoneNum", "phoneNumber", "applicantPhone", "contactPhone"]);
        const companyNameEntry = getValueEntry([
            "companyName1",
            "companyName_1",
            "proposedCompanyName1",
            "name1",
            "foundationNameEn",
            "companyName",
            "desiredCompanyName",
            "companyNamePrimary",
        ]);
        const entityEntry = getValueEntry([
            "selectedEntity",
            "entityType",
            "panamaEntity",
            "relationshipToEstonianCorporation",
            "executiveComposition",
        ]);
        const industryEntry = getValueEntry(["industry", "industries", "selectedIndustry", "businessTypes"]);
        const partiesCount = Array.isArray(parties) ? parties.length : 0;
        const hasPartiesStep = runtimeConfig.steps.some((step) => step.widget === "PartiesManager");
        const hasServicesStep = runtimeConfig.steps.some((step) => step.widget === "ServiceSelectionWidget");
        const renderServicesValue = () => {
            const selectedIds = Array.from(
                new Set([
                    ...(Array.isArray(formData?.optionalFeeIds) ? formData.optionalFeeIds : []),
                    ...(Array.isArray(formData?.serviceItemsSelected) ? formData.serviceItemsSelected : []),
                ].map((id) => String(id)))
            );

            const labelMap = new Map<string, string>();
            const feeItems = Array.isArray((computedFees as any)?.items) ? (computedFees as any).items : [];
            feeItems.forEach((item: any) => {
                if (!item?.id) return;
                labelMap.set(
                    String(item.id),
                    item?.label ? t(String(item.label), String(item.label)) : String(item.id)
                );
            });

            const servicesStep = runtimeConfig.steps.find((step) => step.widget === "ServiceSelectionWidget");
            const serviceItemsSource = servicesStep?.serviceItems;
            const resolvedServiceItems =
                typeof serviceItemsSource === "function"
                    ? serviceItemsSource(formData, entityMeta)
                    : (Array.isArray(serviceItemsSource) ? serviceItemsSource : []);

            resolvedServiceItems.forEach((item: any) => {
                if (!item?.id) return;
                labelMap.set(
                    String(item.id),
                    item?.label ? t(String(item.label), String(item.label)) : String(item.id)
                );
            });

            if (selectedIds.length > 0) {
                return selectedIds.map((id) => labelMap.get(id) || id).join(", ");
            }

            if (feeItems.length > 0) {
                return feeItems
                    .map((item: any) => (item?.label ? t(String(item.label), String(item.label)) : String(item?.id || "")))
                    .filter(Boolean)
                    .join(", ");
            }

            return "-";
        };
        const servicesValue = renderServicesValue();
        const buildEntryRow = (
            id: string,
            fallbackLabel: string,
            entry: { key: string; value: any } | null,
            useFieldLabel = false
        ) => {
            if (!entry) return null;
            return {
                id,
                label: useFieldLabel ? getEntryLabel(entry, fallbackLabel) : fallbackLabel,
                value: renderFieldEntryValue(entry),
            };
        };
        const buildStaticRow = (id: string, label: string, value: any, visible = true) => {
            if (!visible) return null;
            return {
                id,
                label,
                value: typeof value === "string" ? value : renderValue(value),
            };
        };
        const configuredFieldEntries: Record<string, { key: string; value: any } | null> = {
            applicant: applicantEntry,
            applicantEmail: applicantEmailEntry,
            applicantPhone: applicantPhoneEntry,
            companyName: companyNameEntry,
            entityType: entityEntry,
            industry: industryEntry,
        };
        const buildConfiguredRow = (row: McapReviewSummaryRow) => {
            const translatedLabel = row.label ? t(row.label, row.label) : "";

            if (row.kind === "field") {
                const entry =
                    Array.isArray(row.fieldNames) && row.fieldNames.length > 0
                        ? getValueEntry(row.fieldNames)
                        : configuredFieldEntries[row.id] || null;

                if (!entry) {
                    if (!row.showWhenEmpty) return null;
                    return {
                        id: row.id,
                        label: translatedLabel || t("mcap.review.summary.value", "Value"),
                        value: "-",
                    };
                }

                return buildEntryRow(
                    row.id,
                    translatedLabel || t("mcap.review.summary.value", "Value"),
                    entry,
                    row.useFieldLabel
                );
            }

            if (row.kind === "parties") {
                return buildStaticRow(
                    row.id,
                    translatedLabel || t("mcap.review.summary.parties", "Parties"),
                    partiesCount,
                    row.showWhenEmpty ? true : (hasPartiesStep || partiesCount > 0)
                );
            }

            if (row.kind === "services") {
                return buildStaticRow(
                    row.id,
                    translatedLabel || t("mcap.review.summary.services", "Services Selected"),
                    servicesValue,
                    row.showWhenEmpty ? true : (hasServicesStep || servicesValue !== "-")
                );
            }

            return null;
        };
        const defaultSummaryRows = [
            buildEntryRow("applicant", t("mcap.review.summary.applicant", "Applicant"), applicantEntry),
            buildEntryRow("companyName", t("mcap.review.summary.companyName", "Company Name"), companyNameEntry),
            buildEntryRow("email", t("mcap.review.summary.email", "Email"), applicantEmailEntry),
            buildEntryRow("phone", t("mcap.review.summary.phone", "Phone"), applicantPhoneEntry),
            buildEntryRow("entityType", t("mcap.review.summary.entityType", "Entity Type"), entityEntry, true),
            buildEntryRow("industry", t("mcap.review.summary.industry", "Industry"), industryEntry, true),
            buildStaticRow("parties", t("mcap.review.summary.parties", "Parties"), partiesCount, hasPartiesStep),
            buildStaticRow(
                "services",
                t("mcap.review.summary.services", "Services Selected"),
                servicesValue,
                hasServicesStep || servicesValue !== "-"
            ),
        ].filter(Boolean) as Array<{ id: string; label: string; value: string }>;
        const summaryRows = Array.isArray(runtimeConfig.reviewSummary) && runtimeConfig.reviewSummary.length > 0
            ? runtimeConfig.reviewSummary
                .map((row) => buildConfiguredRow(row))
                .filter(Boolean) as Array<{ id: string; label: string; value: string }>
            : defaultSummaryRows;

        return (
            <div className="col-span-full w-full rounded-xl border bg-muted/10 p-4 sm:p-5 space-y-4">
                <div className="text-sm sm:text-base font-semibold">
                    {t("mcap.review.summary.title", "Review Summary")}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 text-sm">
                    {summaryRows.map((row) => (
                        <div key={row.id} className="min-w-0 rounded-lg bg-background/80 px-3 py-3 border border-border/60">
                            <div className="text-xs text-muted-foreground break-words">{row.label}</div>
                            <div className="mt-1 font-medium break-words text-foreground">{row.value}</div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const totalSteps = runtimeConfig.steps.length;
    const progressPct = Math.round(((currentStepIdx + 1) / totalSteps) * 100);

    // TEMP (admin testing only): only admin/master can use relaxed sidebar jumping.
    const canJumpTo = (idx: number) => {
        if (allowAdminTestingBypass) {
            return currentStepIdx > 0 || idx <= currentStepIdx;
        }
        return idx <= currentStepIdx;
    };

    // Memoize initialPaymentStatus to avoid unnecessary re-renders
    const memoizedPaymentStatus = useMemo(() => ({
        status: formData.paymentStatus || "",
        receiptUrl: formData.stripeReceiptUrl,
        bankProofUrl: formData.uploadReceiptUrl,
        lastStatus: formData.stripeLastStatus,
        paymentIntentId: formData.paymentIntentId,
        amount: formData.stripeAmountCents,
        currency: formData.stripeCurrency,
    }), [
        formData.paymentStatus,
        formData.stripeReceiptUrl,
        formData.uploadReceiptUrl,
        formData.stripeLastStatus,
        formData.paymentIntentId,
        formData.stripeAmountCents,
        formData.stripeCurrency,
    ]);
    const pageTitle = isExistingCompanyOnboarding
        ? t("mcap.journey.pageTitle", {
            country: runtimeConfig.countryName,
            defaultValue: `${runtimeConfig.countryName} Existing Company Onboarding`,
        })
        : (runtimeConfig.title
            ? t(runtimeConfig.title, runtimeConfig.title)
            : t("mcap.title", `${runtimeConfig.countryName} Incorporation`));
    const confirmationTitle = isExistingCompanyOnboarding
        ? t("mcap.journey.confirmation.title", "Onboarding Request Submitted")
        : (runtimeConfig.confirmationDetails?.title
            ? t(runtimeConfig.confirmationDetails.title, runtimeConfig.confirmationDetails.title)
            : "Application Submitted!");
    const confirmationMessage = isExistingCompanyOnboarding
        ? t(
            "mcap.journey.confirmation.message",
            "Your existing company onboarding request has been received. Our team will review the submitted details and contact you with the next steps."
        )
        : (runtimeConfig.confirmationDetails?.message
            ? t(runtimeConfig.confirmationDetails.message, runtimeConfig.confirmationDetails.message)
            : "Your application has been successfully submitted and is now under review.");

    // --- Success View ---
    if (submissionResult) {
        const details = runtimeConfig.confirmationDetails;
        return (
            <div className="flex flex-col items-center justify-center py-10 px-4 max-w-2xl mx-auto space-y-6 text-center">
                <div className="flex flex-col items-center space-y-2">
                    <CheckCircle2 className="w-16 h-16 text-green-500" />
                    <h2 className="text-3xl font-bold">{confirmationTitle}</h2>
                </div>

                <p className="text-muted-foreground text-lg leading-relaxed">
                    {confirmationMessage}
                </p>

                {!isExistingCompanyOnboarding && details?.steps && (
                    <div className="w-full space-y-4 text-left border rounded-xl p-6 bg-accent/5">
                        <h3 className="font-semibold text-lg mb-2">What Happens Next?</h3>
                        <div className="space-y-4">
                            {details.steps.map((s, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                                        {i + 1}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="font-medium leading-none">{t(s.title, s.title)}</div>
                                        <div className="text-sm text-muted-foreground">{t(s.description, s.description)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto pt-4">
                    <Button
                        size="lg"
                        className="px-8"
                        onClick={() => navigate("/incorporation-dashboard")}
                    >
                        Return to Dashboard
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => window.location.reload()}
                    >
                        Start Another Application
                    </Button>
                </div>

                <div className="text-xs text-muted-foreground pt-4 border-t w-full">
                    Application ID: <span className="font-mono bg-muted px-1 rounded">{submissionResult._id}</span>
                </div>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("mcap.loading", "Loading application...")}
            </div>
        );
    }
    return (
        <div className="max-width mx-auto p-3 sm:p-4 md:p-6 space-y-4">
            {/* Top Bar */}
            <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {pageTitle}
                    </h1>
                    {isExistingCompanyOnboarding && (
                        <Badge variant="secondary">
                            {t("mcap.journey.labels.existing_company_onboarding", "Existing Company Onboarding")}
                        </Badge>
                    )}
                </div>
                {isExistingCompanyOnboarding && (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
                        <div className="font-medium text-foreground">
                            {t("mcap.journey.banner.title", "Existing Company Onboarding")}
                        </div>                       
                    </div>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t("mcap.stepOf", "Step {{current}} of {{total}}", { current: currentStepIdx + 1, total: totalSteps })}</span>
                    <span>{progressPct}%</span>
                </div>
                <Progress value={progressPct} className="h-2" />
            </div>

            <div className="grid lg:grid-cols-[280px_1fr] gap-4 lg:gap-6">
                {/* Sidebar */}
                <aside className="hidden lg:block space-y-4 sticky top-0 h-[calc(100vh-2rem)] overflow-auto">
                    <div className="space-y-1">
                        {runtimeConfig.steps.map((s, idx) => (
                            <button
                                key={s.id}
                                onClick={() => canJumpTo(idx) && setCurrentStepIdx(idx)}
                                disabled={!canJumpTo(idx)}
                                className={cn(
                                    "w-full text-left rounded-lg border p-2 sm:p-3 transition",
                                    idx === currentStepIdx ? "border-primary bg-accent/10" : "hover:bg-accent/10",
                                    !canJumpTo(idx) && "opacity-60 cursor-not-allowed"
                                )}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="font-semibold text-xs sm:text-sm truncate">
                                        {idx + 1}. {t(s.title, s.title)}
                                    </div>
                                    {idx < currentStepIdx && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted">{t("newHk.sidebar.done")}</span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Main Content */}
                <div className="min-w-0">
                    <Card>
                        <CardHeader className="pb-4 sm:pb-6">
                            <CardTitle className="text-lg sm:text-xl">
                                {currentStepIdx + 1}. {t(currentStep.title, currentStep.title)}
                            </CardTitle>
                            {currentStep.description && (
                                <CardDescription className="text-xs sm:text-sm">
                                    {t(currentStep.description, currentStep.description)}
                                </CardDescription>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-4 px-4 sm:px-6">
                            {/* Widget Handling */}
                            {currentStep.widget === "PartiesManager" ? (
                                <div className="space-y-6">
                                    {currentStep.fields?.length ? (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                                            {currentStep.fields?.map((field: any) => renderField(field))}
                                        </div>
                                    ) : null}
                                    <PartyWidget
                                        parties={parties}
                                        onChange={setParties}
                                        companyId={companyId}
                                        partyFields={currentStep.partyFields}
                                        partyRoleOptions={currentStep.partyRoleOptions}
                                        defaultPartyRoles={currentStep.defaultPartyRoles}
                                        countryCode={config.countryCode}
                                    />
                                </div>
                            ) : currentStep.widget === "PaymentWidget" ? (
                                <PaymentWidget
                                    fees={computedFees}
                                    currency={runtimeConfig.currency}
                                    supportedCurrencies={currentStep.supportedCurrencies}
                                    companyId={companyId}
                                    onPaymentComplete={handlePaymentComplete}
                                    data={formData}
                                    onChange={(newData) => setFormData((prev: any) => ({ ...prev, ...newData }))}
                                    initialPaymentStatus={memoizedPaymentStatus}
                                />
                            ) : currentStep.widget === "ServiceSelectionWidget" ? (
                                <div className="space-y-6">
                                    {currentStep.fields?.length ? (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                                            {currentStep.fields?.map((field: any) => renderField(field))}
                                        </div>
                                    ) : null}
                                    <ServiceSelectionWidget
                                        config={runtimeConfig}
                                        data={formData}
                                        onChange={(newData) => setFormData((prev: any) => ({ ...prev, ...newData }))}
                                        items={currentStep.serviceItems}
                                        currency={runtimeConfig.currency}
                                        supportedCurrencies={
                                            currentStep.supportedCurrencies
                                            || runtimeConfig.steps.find((step) => step.widget === "PaymentWidget")?.supportedCurrencies
                                        }
                                        computeFees={
                                            currentStep.computeFees
                                            || runtimeConfig.steps.find((step) =>
                                                (step.id === "invoice" || step.id === "payment" || step.widget === "InvoiceWidget" || step.widget === "PaymentWidget")
                                                && typeof step.computeFees === "function"
                                            )?.computeFees
                                        }
                                    />
                                </div>
                            ) : currentStep.widget === "PanamaServiceSetupWidget" ? (
                                <PanamaServiceSetupWidget
                                    data={formData}
                                    onChange={(newData) => setFormData((prev: any) => ({ ...prev, ...newData }))}
                                    countryCode={config.countryCode}
                                    config={currentStep.widgetConfig}
                                />
                            ) : currentStep.widget === "InvoiceWidget" ? (
                                <InvoiceWidget
                                    fees={computedFees}
                                    onNext={handleNext}
                                    isSubmitting={isSubmitting}
                                />
                            ) : currentStep.widget === "RepeatableSection" ? (

                                <RepeatableSectionWidget
                                    config={currentStep.widgetConfig}
                                    data={formData}
                                    onChange={setFormData}
                                    companyId={companyId}
                                    renderField={renderFieldWithValue}
                                />
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                                    {renderReviewSummary()}
                                    {currentStep.fields?.map((field: any) => renderField(field))}
                                </div>
                            )}

                            {!allowAdminTestingBypass && missingFields.length > 0 && currentStep.widget !== "PaymentWidget" && (
                                <div className="text-xs sm:text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                                    <strong>{t("common.required", "Required")}:</strong> {missingFields.join(", ")}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Navigation */}
                    <div className="flex justify-between mt-6">
                        <Button variant="outline" onClick={handleBack} disabled={currentStepIdx === 0}>
                            {t("common.back", "Back")}
                        </Button>
                        {currentStep.widget !== "PaymentWidget" && currentStep.widget !== "InvoiceWidget" && (
                            <Button onClick={handleNext} disabled={isSubmitting || isAdvancingStep}>
                                {(isSubmitting || isAdvancingStep) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {isLastStep
                                    ? (
                                        isExistingCompanyOnboarding
                                            ? t("mcap.journey.actions.submit", "Submit Onboarding Request")
                                            : t("mcap.navigation.submit", "Submit Application")
                                    )
                                    : t("mcap.navigation.next", "Next Step")}
                            </Button>
                        )}
                        {/* Special Next Button for InvoiceWidget is inside the widget itself */}
                    </div>
                </div>
            </div>

            {/* Debug Info (Admin Only) */}
            {/* <div className="mt-8 p-4 bg-slate-100 rounded text-xs font-mono text-slate-500">
                <p className="font-bold">Form Data State:</p>
                <pre>{JSON.stringify(formData, null, 2)}</pre>
                <p className="font-bold mt-2">Parties State:</p>
                <pre>{JSON.stringify(parties, null, 2)}</pre>
            </div> */}
        </div>
    );
};




