/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
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
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { McapConfig, McapField, RepeatableSection } from "./configs/types";
import { Progress } from "@/components/ui/progress";
import { buildDefaultsForFields, getDefaultValueForField } from "./fields/fieldDefaults";

// --- API Helper (Inlined for Demo) ---
const saveToBackend = async (payload: any) => {
    // In real implementation, use the api service
    const token = localStorage.getItem("token");
    const res = await fetch(`${import.meta.env.VITE_API_ORIGIN || "http://localhost:5000"}/api/mcap/companies`, {
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
    const [currentStepIdx, setCurrentStepIdx] = useState(0);
    const [formData, setFormData] = useState<any>({}); // Stores the dynamic 'data' field
    const [parties, setParties] = useState<any[]>([]);   // Stores 'parties'
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionResult, setSubmissionResult] = useState<any>(null);
    const [companyId, setCompanyId] = useState<string | null>(null);

    const currentStep = config.steps[currentStepIdx];
    const isLastStep = currentStepIdx === config.steps.length - 1;
    const entityMeta = config.entityMeta || {};
    // Prefer a precomputed live preview from formData (single source of truth).
    // Fall back to step.computeFees or static step.fees when not available.
    const computedFees = (formData && formData.computedFees) || (currentStep.computeFees ? currentStep.computeFees(formData, entityMeta) : currentStep.fees);

    useEffect(() => {
        if (currentStep.widget === "PaymentWidget" && !companyId) {
            ensureDraft();
        }
    }, [currentStep.widget, companyId]);
    const user = localStorage.getItem("user");
    const userId = user ? JSON.parse(user).id : null;

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
                (cfg.modes || []).forEach((mode) => applySectionDefaults(mode.sections));
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
        if (initialCompanyId) setCompanyId(initialCompanyId);
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
                        cfg.preFields?.find((f) => f.name === cfg.modeField)?.label || cfg.modeField;
                    missing.push(t(modeLabel, modeLabel));
                }
                const active = cfg.modes.find((m) => m.value === modeValue);
                const sections = active?.sections || [];
                sections.forEach((section) => {
                    if (section.condition && !section.condition(formData)) return;
                    const title = section.title ? t(section.title, section.title) : section.fieldName || "Item";

                    if (section.kind === "list") {
                        const list = Array.isArray(formData[section.fieldName || ""]) ? formData[section.fieldName || ""] : [];
                        const minItems = section.minItems || 0;
                        if (minItems > 0 && list.length < minItems) {
                            missing.push(`${title}: ${t("common.atLeastItems", "At least")} ${minItems}`);
                        }
                        list.forEach((item: any, idx: number) => {
                            const itemLabel = section.itemLabel
                                ? t(section.itemLabel, { n: idx + 1, title })
                                : `${title} ${idx + 1}`;
                            checkFields(section.itemFields, { ...formData, ...item }, itemLabel);
                        });
                        return;
                    }

                    if (section.kind === "object") {
                        const obj = formData[section.fieldName || ""] || {};
                        checkFields(section.itemFields, { ...formData, ...obj }, title);
                    }
                });
            } else {
                (cfg.sections || []).forEach((section) => {
                    if (section.condition && !section.condition(formData)) return;
                    const title = section.title ? t(section.title, section.title) : section.fieldName || "Item";

                    if (section.kind === "list") {
                        const list = Array.isArray(formData[section.fieldName || ""]) ? formData[section.fieldName || ""] : [];
                        const minItems = section.minItems || 0;
                        if (minItems > 0 && list.length < minItems) {
                            missing.push(`${title}: ${t("common.atLeastItems", "At least")} ${minItems}`);
                        }
                        list.forEach((item: any, idx: number) => {
                            const itemLabel = section.itemLabel
                                ? t(section.itemLabel, { n: idx + 1, title })
                                : `${title} ${idx + 1}`;
                            checkFields(section.itemFields, { ...formData, ...item }, itemLabel);
                        });
                        return;
                    }

                    if (section.kind === "object") {
                        const obj = formData[section.fieldName || ""] || {};
                        checkFields(section.itemFields, { ...formData, ...obj }, title);
                    }
                });
            }
        }

        if (currentStep.widget === "PartiesManager") {
            const min = currentStep.minParties || 0;
            if (min > 0 && parties.length < min) {
                missing.push(`At least ${min} party(ies) required`);
            }
            if (currentStep.requireDcp) {
                const hasDcp = parties.some((p) => (p.roles || []).includes("dcp"));
                if (!hasDcp) missing.push("Designated Contact Person (DCP) required");
            }
            if (currentStep.requirePartyInvite) {
                const allInvited = parties.length > 0 && parties.every((p) => p.invited);
                if (!allInvited) missing.push("All parties must be invited before continuing");
            }
        }

        return missing;
    }, [currentStep, formData, parties]);

    const ensureDraft = async () => {
        console.log("Ensuring draft...", companyId);
        // if (companyId) return companyId; // REMOVED: Must update on every step!
        const payload = {
            _id: companyId || undefined,
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
            setCompanyId(response.data._id);
            return response.data._id as string;
        }
        return null;
    };

    const handleNext = async () => {
        if (isLastStep) {
            // Submit
            await handleSubmit();
        } else {
            if (missingFields.length > 0) {
                toast({ title: "Missing information", description: "Please complete required fields to continue.", variant: "destructive" });
                return;
            }
            console.log("Ensuring draft before next step...");
            await ensureDraft();
            setCurrentStepIdx((prev) => prev + 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
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
                _id: companyId || undefined,
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
                if (response?.data?._id) setCompanyId(response.data._id);
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
        if (!field.name && field.type !== "info") return null;

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
                <div key={key} className="flex items-start gap-2">
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

        const getValue = (keys: string[]) => {
            for (const key of keys) {
                const val = formData?.[key];
                if (val !== undefined && val !== null && String(val).trim() !== "") return val;
            }
            return null;
        };

        const applicantName = getValue(["applicantName", "name", "contactName"]) || "-";
        const applicantEmail = getValue(["email", "applicantEmail", "applicantEmailAddress"]) || "-";
        const applicantPhone = getValue(["phone", "phoneNum", "contactPhone"]) || "-";
        const companyName = getValue(["companyName_1", "name1", "foundationNameEn", "companyName"]) || "-";
        const entityType = getValue(["selectedEntity", "entityType", "panamaEntity"]) || "-";
        const industry = getValue(["industry", "selectedIndustry", "businessTypes"]) || "-";
        const partiesCount = Array.isArray(parties) ? parties.length : 0;
        const services = getValue(["optionalFeeIds", "serviceItemsSelected", "services", "pif_optEmi"]) || "—";

        const renderValue = (value: any) => {
            if (Array.isArray(value)) return value.length ? value.join(", ") : "-";
            if (typeof value === "boolean") return value ? "Yes" : "No";
            return String(value);
        };

        return (
            <div className="rounded-lg border bg-muted/10 p-4 space-y-3">
                <div className="text-sm font-semibold">Review Summary</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                        <div className="text-xs text-muted-foreground">Applicant</div>
                        <div className="font-medium">{renderValue(applicantName)}</div>
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground">Company Name</div>
                        <div className="font-medium">{renderValue(companyName)}</div>
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground">Email</div>
                        <div className="font-medium">{renderValue(applicantEmail)}</div>
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground">Phone</div>
                        <div className="font-medium">{renderValue(applicantPhone)}</div>
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground">Entity Type</div>
                        <div className="font-medium">{renderValue(entityType)}</div>
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground">Industry</div>
                        <div className="font-medium">{renderValue(industry)}</div>
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground">Parties</div>
                        <div className="font-medium">{partiesCount}</div>
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground">Services Selected</div>
                        <div className="font-medium">{renderValue(services)}</div>
                    </div>
                </div>
            </div>
        );
    };

    const totalSteps = config.steps.length;
    const progressPct = Math.round(((currentStepIdx + 1) / totalSteps) * 100);

    const canJumpTo = (idx: number) => idx <= currentStepIdx;

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
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
                <h2 className="text-2xl font-bold">Application Created!</h2>
                <p className="text-muted-foreground">ID: {submissionResult._id}</p>
                <Button onClick={() => window.location.reload()}>Start Another</Button>
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
                                    <PartyWidget parties={parties} onChange={setParties} companyId={companyId} />
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
                                <ServiceSelectionWidget
                                    config={config}
                                    data={formData}
                                    onChange={(newData) => setFormData((prev: any) => ({ ...prev, ...newData }))}
                                    items={currentStep.serviceItems}
                                    currency={config.currency}
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
                                    renderField={renderFieldWithValue}
                                />
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                                    {renderReviewSummary()}
                                    {currentStep.fields?.map((field: any) => renderField(field))}
                                </div>
                            )}

                            {missingFields.length > 0 && currentStep.widget !== "PaymentWidget" && (
                                <div className="text-xs sm:text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                                    <strong>Required:</strong> {missingFields.join(", ")}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Navigation */}
                    <div className="flex justify-between mt-6">
                        <Button variant="outline" onClick={handleBack} disabled={currentStepIdx === 0}>
                            Back
                        </Button>
                        {currentStep.widget !== "PaymentWidget" && currentStep.widget !== "InvoiceWidget" && (
                            <Button onClick={handleNext} disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {isLastStep ? "Submit Application" : "Next Step"}
                            </Button>
                        )}
                        {/* Special Next Button for InvoiceWidget is inside the widget itself */}
                    </div>
                </div>
            </div>

            {/* Debug Info (Admin Only) */}
            <div className="mt-8 p-4 bg-slate-100 rounded text-xs font-mono text-slate-500">
                <p className="font-bold">Form Data State:</p>
                <pre>{JSON.stringify(formData, null, 2)}</pre>
                <p className="font-bold mt-2">Parties State:</p>
                <pre>{JSON.stringify(parties, null, 2)}</pre>
            </div>
        </div>
    );
};
