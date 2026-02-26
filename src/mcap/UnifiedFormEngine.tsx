/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UnifiedTextField } from "./fields/TextField";
import { UnifiedSelectField } from "./fields/SelectField";
import { UnifiedSearchSelectField } from "./fields/SearchSelectField";
import { PartyWidget } from "./fields/PartyWidget";
import { PaymentWidget } from "./fields/PaymentWidget";
import { ServiceSelectionWidget } from "./fields/ServiceSelectionWidget";
import { InvoiceWidget } from "./fields/InvoiceWidget";
import { RepeatableSectionWidget } from "./fields/RepeatableSectionWidget";
import { PanamaServiceSetupWidget } from "./fields/PanamaServiceSetupWidget";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { McapConfig, McapField, RepeatableSection } from "./configs/types";
import { Progress } from "@/components/ui/progress";
import { buildDefaultsForFields, getDefaultValueForField } from "./fields/fieldDefaults";
import { API_URL } from "@/services/fetch";

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

export const UnifiedFormEngine = ({
    config,
    initialData,
    initialParties,
    initialCompanyId,
    initialStepIdx,
    isLoading = false,
}: {
    config: McapConfig;
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

    const currentStep = config.steps[currentStepIdx];
    const isLastStep = currentStepIdx === config.steps.length - 1;
    const entityMeta = config.entityMeta || {};
    // Prefer step-level computeFees. For legacy configs lacking FX metadata in computeFees,
    // use cached computedFees from ServiceSelectionWidget when HKD conversion was already computed.
    const computedFees = useMemo(() => {
        const cachedFees = formData?.computedFees;
        const shouldPreferCachedFees =
            currentStep.widget === "InvoiceWidget" || currentStep.widget === "PaymentWidget";

        if (cachedFees && shouldPreferCachedFees) {
            return cachedFees;
        }

        const calculated = currentStep.computeFees
            ? currentStep.computeFees(formData, entityMeta)
            : (cachedFees || currentStep.fees);

        if (!cachedFees || !currentStep.computeFees) return calculated;

        const requestedCurrency = String(formData?.paymentCurrency || formData?.currency || "").toUpperCase();
        const calculatedCurrency = String((calculated as any)?.currency || "").toUpperCase();
        const cachedCurrency = String((cachedFees as any)?.currency || "").toUpperCase();
        const hasCalculatedFx =
            Number.isFinite(Number((calculated as any)?.exchangeRateUsed))
            && Number((calculated as any)?.exchangeRateUsed) > 0;
        const shouldUseCachedFx = requestedCurrency === "HKD"
            && cachedCurrency === "HKD"
            && (!hasCalculatedFx || calculatedCurrency !== "HKD");

        return shouldUseCachedFx ? cachedFees : calculated;
    }, [currentStep, formData, entityMeta]);

    useEffect(() => {
        companyIdRef.current = companyId;
    }, [companyId]);

    useEffect(() => {
        if (currentStep.widget === "PaymentWidget" && !companyIdRef.current) {
            void ensureDraft();
        }
    }, [currentStep.widget, companyId]);
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

        config.steps.forEach((step) => {
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
    }, [config.steps]);

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
            setCurrentStepIdx(Math.max(0, Math.min(initialStepIdx, config.steps.length - 1)));
        }
    }, [initialStepIdx, config.steps.length]);

    useEffect(() => {
        if (!Array.isArray(parties)) return;
        setFormData((prev: any) => ({ ...prev, parties }));
    }, [parties]);

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
                const dcpParties = parties.filter((p) => (p.roles || []).includes("dcp"));
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

    const ensureDraft = async () => {
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
            return currentCompanyId || null;
        })().finally(() => {
            ensureDraftInFlightRef.current = null;
        });

        ensureDraftInFlightRef.current = request;
        return request;
    };

    const handleNext = async () => {
        if (isLastStep) {
            // Submit
            await handleSubmit();
        } else {
            if (isAdvancingStepRef.current) return;
            isAdvancingStepRef.current = true;
            setIsAdvancingStep(true);

            try {
                // TEMP (admin testing only): required-field validation is bypassed when ADMIN_TEST_RELAX_VALIDATION is true.
                if (!ADMIN_TEST_RELAX_VALIDATION && missingFields.length > 0) {
                    toast({
                        title: t("mcap.validation.missingInformation.title", "Missing information"),
                        description: t("mcap.validation.missingInformation.desc", "Please complete required fields to continue."),
                        variant: "destructive",
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

        if (field.type === "text" || field.type === "textarea" || field.type === "number" || field.type === "email") {
            return <UnifiedTextField key={key} {...commonProps} />;
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
                        <Label htmlFor={checkboxId} className="font-medium">
                            {t(field.label || "", field.label || "")} {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        {field.tooltip && <p className="text-xs text-muted-foreground">{t(field.tooltip, field.tooltip)}</p>}
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
                    <Label className="font-medium">
                        {t(field.label || "", field.label || "")} {field.required && <span className="text-red-500">*</span>}
                    </Label>
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
                    {field.tooltip && <p className="text-xs text-muted-foreground">{t(field.tooltip, field.tooltip)}</p>}
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
            config.steps
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

        const applicantName = getValueEntry(["applicantName", "name", "contactName"])?.value || "-";
        const applicantEmail = getValueEntry(["email", "applicantEmail", "applicantEmailAddress"])?.value || "-";
        const applicantPhone = getValueEntry(["phone", "phoneNum", "contactPhone"])?.value || "-";
        const companyName = getValueEntry(["companyName_1", "name1", "foundationNameEn", "companyName"])?.value || "-";
        const entityType = getValueEntry(["selectedEntity", "entityType", "panamaEntity"])?.value || "-";
        const industryEntry = getValueEntry(["industry", "selectedIndustry", "businessTypes"]);
        const partiesCount = Array.isArray(parties) ? parties.length : 0;
        const services = getValueEntry(["optionalFeeIds", "serviceItemsSelected", "services", "pif_optEmi"])?.value || "-";

        const renderValue = (value: any) => {
            if (Array.isArray(value)) return value.length ? value.join(", ") : "-";
            if (typeof value === "boolean") {
                return value
                    ? t("common.yes", "Yes")
                    : t("common.no", "No");
            }
            return String(value);
        };

        const renderIndustryValue = () => {
            if (!industryEntry) return "-";
            const field = findFieldByName(industryEntry.key);
            if (!field) return renderValue(industryEntry.value);

            if (Array.isArray(industryEntry.value)) {
                return industryEntry.value.length
                    ? industryEntry.value.map((v) => getOptionDisplay(field, v)).join(", ")
                    : "-";
            }

            return getOptionDisplay(field, industryEntry.value);
        };

        return (
            <div className="rounded-lg border bg-muted/10 p-4 space-y-3">
                <div className="text-sm font-semibold">{t("mcap.review.summary.title", "Review Summary")}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                        <div className="text-xs text-muted-foreground">{t("mcap.review.summary.applicant", "Applicant")}</div>
                        <div className="font-medium">{renderValue(applicantName)}</div>
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground">{t("mcap.review.summary.companyName", "Company Name")}</div>
                        <div className="font-medium">{renderValue(companyName)}</div>
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground">{t("mcap.review.summary.email", "Email")}</div>
                        <div className="font-medium">{renderValue(applicantEmail)}</div>
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground">{t("mcap.review.summary.phone", "Phone")}</div>
                        <div className="font-medium">{renderValue(applicantPhone)}</div>
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground">{t("mcap.review.summary.entityType", "Entity Type")}</div>
                        <div className="font-medium">{renderValue(entityType)}</div>
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground">{t("mcap.review.summary.industry", "Industry")}</div>
                        <div className="font-medium">{renderIndustryValue()}</div>
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground">{t("mcap.review.summary.parties", "Parties")}</div>
                        <div className="font-medium">{partiesCount}</div>
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground">{t("mcap.review.summary.services", "Services Selected")}</div>
                        <div className="font-medium">{renderValue(services)}</div>
                    </div>
                </div>
            </div>
        );
    };

    const totalSteps = config.steps.length;
    const progressPct = Math.round(((currentStepIdx + 1) / totalSteps) * 100);

    // TEMP (admin testing only): only admin/master can use relaxed sidebar jumping.
    const canJumpTo = (idx: number) => {
        if (ADMIN_TEST_RELAX_VALIDATION && isAdminOrMaster) {
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

    // --- Success View ---
    if (submissionResult) {
        const details = config.confirmationDetails;
        return (
            <div className="flex flex-col items-center justify-center py-10 px-4 max-w-2xl mx-auto space-y-6 text-center">
                <div className="flex flex-col items-center space-y-2">
                    <CheckCircle2 className="w-16 h-16 text-green-500" />
                    <h2 className="text-3xl font-bold">{details?.title ? t(details.title, details.title) : "Application Submitted!"}</h2>
                </div>

                <p className="text-muted-foreground text-lg leading-relaxed">
                    {details?.message ? t(details.message, details.message) : "Your application has been successfully submitted and is now under review."}
                </p>

                {details?.steps && (
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
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {config.title ? t(config.title, config.title) : t("mcap.title", `${config.countryName} Incorporation`)}
                </h1>
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
                        {config.steps.map((s, idx) => (
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
                                        countryCode={config.countryCode}
                                    />
                                </div>
                            ) : currentStep.widget === "PaymentWidget" ? (
                                <PaymentWidget
                                    fees={computedFees}
                                    currency={config.currency}
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
                                        config={config}
                                        data={formData}
                                        onChange={(newData) => setFormData((prev: any) => ({ ...prev, ...newData }))}
                                        items={currentStep.serviceItems}
                                        currency={config.currency}
                                        supportedCurrencies={
                                            currentStep.supportedCurrencies
                                            || config.steps.find((step) => step.widget === "PaymentWidget")?.supportedCurrencies
                                        }
                                        computeFees={
                                            currentStep.computeFees
                                            || config.steps.find((step) =>
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

                            {!ADMIN_TEST_RELAX_VALIDATION && missingFields.length > 0 && currentStep.widget !== "PaymentWidget" && (
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
                                    ? t("mcap.navigation.submit", "Submit Application")
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
