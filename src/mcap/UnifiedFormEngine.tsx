/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UnifiedTextField } from "./fields/TextField";
import { UnifiedSelectField } from "./fields/SelectField";
import { PartyWidget } from "./fields/PartyWidget";
import { PaymentWidget } from "./fields/PaymentWidget";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { McapConfig, McapField } from "./configs/types";
import { Progress } from "@/components/ui/progress";

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
    const computedFees = currentStep.computeFees ? currentStep.computeFees(formData, entityMeta) : currentStep.fees;

    useEffect(() => {
        if (currentStep.widget === "PaymentWidget" && !companyId) {
            ensureDraft();
        }
    }, [currentStep.widget, companyId]);
    const user = localStorage.getItem("user");
    const userId = user ? JSON.parse(user).id : null;

    const defaultData = useMemo(() => {
        const initial: Record<string, any> = {};
        config.steps.forEach((step) => {
            (step.fields || []).forEach((field) => {
                if (!field.name) return;
                if (field.defaultValue !== undefined) {
                    initial[field.name] = field.defaultValue;
                    return;
                }
                if (field.type === "checkbox") initial[field.name] = false;
                if (field.type === "checkbox-group") initial[field.name] = [];
                if (field.type === "select" || field.type === "radio" || field.type === "radio-group") {
                    initial[field.name] = "";
                }
                if (field.type === "text" || field.type === "email" || field.type === "number" || field.type === "textarea") {
                    initial[field.name] = "";
                }
            });
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
        const stepFields = currentStep.fields || [];
        for (const field of stepFields) {
            if (!field || !field.required) continue;
            if (field.type === "info" || field.type === "derived") continue;
            if (!field.name) continue;
            if (field.condition && !field.condition(formData)) continue;

            const value = formData[field.name!];
            if (field.type === "checkbox") {
                if (!value) missing.push(field.label || field.name);
                continue;
            }
            if (field.type === "checkbox-group") {
                if (!Array.isArray(value) || value.length === 0) missing.push(field.label || field.name);
                continue;
            }
            if (value === undefined || value === null || String(value).trim() === "") {
                missing.push(field.label || field.name);
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
        if (companyId) return companyId;
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
    const renderField = (field: McapField) => {
        if (field.condition && !field.condition(formData)) return null;

        // Type guard: ensure field.name exists for fields that need it
        if (!field.name && field.type !== "info") return null;

        const fieldKey = field.name || field.label || `field-${Math.random()}`;

        const commonProps = {
            field,
            value: formData[field.name!],
            onChange: (val: any) => handleFieldChange(field.name!, val)
        };

        if (field.type === "text" || field.type === "textarea" || field.type === "number" || field.type === "email") {
            return <UnifiedTextField key={fieldKey} {...commonProps} />;
        }
        if (field.type === "select" || field.type === "radio") {
            return <UnifiedSelectField key={fieldKey} {...commonProps} />;
        }
        if (field.type === "radio-group") {
            return <UnifiedSelectField key={fieldKey} {...commonProps} />;
        }
        if (field.type === "checkbox") {
            return (
                <div key={field.name!} className="flex items-start gap-2">
                    <Checkbox
                        id={field.name!}
                        checked={!!formData[field.name!]}
                        onCheckedChange={(v) => handleFieldChange(field.name!, !!v)}
                    />
                    <div className="space-y-1">
                        <Label htmlFor={field.name!} className="font-medium">
                            {t(field.label || "", field.label || "")} {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        {field.tooltip && <p className="text-xs text-muted-foreground">{t(field.tooltip, field.tooltip)}</p>}
                    </div>
                </div>
            );
        }
        if (field.type === "checkbox-group") {
            const selected = Array.isArray(formData[field.name!]) ? formData[field.name!] : [];
            const toggle = (value: string, on: boolean) => {
                const next = new Set(selected);
                if (on) next.add(value);
                else next.delete(value);
                handleFieldChange(field.name!, Array.from(next));
            };
            return (
                <div key={field.name!} className="space-y-2">
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
            const infoKey = field.name || field.label || `info-${Math.random()}`;
            return (
                <div key={infoKey} className={cn("rounded-md border border-dashed bg-muted/20 p-3 text-sm text-muted-foreground", field.colSpan === 2 && "md:col-span-2")}>
                    {field.label && <div className="font-semibold text-foreground mb-1">{t(field.label, field.label)}</div>}
                    {field.content}
                </div>
            );
        }
        if (field.type === "derived") {
            const value = field.compute ? field.compute(formData, getEntityMeta(formData.entityType)) : "";
            return (
                <div key={field.name!} className={cn("space-y-2", field.colSpan === 2 && "md:col-span-2")}>
                    <Label htmlFor={field.name!}>{t(field.label || "", field.label || "")}</Label>
                    <Input id={field.name!} value={value || ""} readOnly />
                </div>
            );
        }
        return null;
    };

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

    const totalSteps = config.steps.length;
    const progressPct = Math.round(((currentStepIdx + 1) / totalSteps) * 100);

    const canJumpTo = (idx: number) => idx <= currentStepIdx;

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
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted">Done</span>
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
                                />
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
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
                        {currentStep.widget !== "PaymentWidget" && (
                            <Button onClick={handleNext} disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {isLastStep ? "Submit Application" : "Next Step"}
                            </Button>
                        )}
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
