/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from "react";
import { useAtom } from "jotai";
import { Trans, useTranslation } from "react-i18next";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Info, Trash2, HelpCircle, Users, UserIcon, ChevronUp, ChevronDown } from "lucide-react";
import SearchSelect from "@/components/SearchSelect";
import DropdownSelect from "@/components/DropdownSelect";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import { usaAppWithResetAtom, usaPriceAtom } from "./UsState"; // <- updated atom must include new fields (see bottom)
import {
    FormConfig,
    SectionDef,
    StepDef,
    usaList,
    service_list,
    getEntityBasicPrice,
} from "./constants";
import {
    createInvoicePaymentIntent,
    deleteIncorpoPaymentBankProof,
    FieldBase,
    updateCorporateInvoicePaymentIntent,
    uploadIncorpoPaymentBankProof,
    updateInvoicePaymentIntent,
    currencyOptions,
} from "../NewHKForm/hkIncorpo";
import { toast, useToast } from "@/hooks/use-toast";
import {
    Elements,
    PaymentElement,
    useElements,
    useStripe,
} from "@stripe/react-stripe-js";
import { StripeSuccessInfo, Tip } from "../NewHKForm/NewHKIncorporation";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { loadStripe } from "@stripe/stripe-js";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";
// import { t } from "i18next";
import api from "@/services/fetch";
import CustomLoader from "@/components/ui/customLoader";
import { sendInviteToShDir } from "@/services/dataFetch";
import { isValidEmail } from "@/middleware";
import { sendEmailOtpforVerification, validateOtpforVerification } from "@/hooks/useAuth";

const STRIPE_CLIENT_ID =
    import.meta.env.VITE_STRIPE_DETAILS || process.env.REACT_APP_STRIPE_DETAILS;

const stripePromise = loadStripe(STRIPE_CLIENT_ID);

const EngagementTerms = React.lazy(() =>
    import("../CommonServiceAgrementTxt").then((mod) => {
        const Comp =
            (mod as any).CommonServiceAgrementTxt ??
            (mod as any).default ??
            mod;
        return { default: Comp };
    })
);
const token = localStorage.getItem("token") as string;

type RenderStep = {
    id: string;
    title: string;
    description?: string;
    render: (ctx?: any) => React.ReactNode;
};
type AnyStep = StepDef | RenderStep;
type LocalFormConfig = Omit<FormConfig, "steps"> & { steps: AnyStep[] };

const hasType = (s: AnyStep): s is Extract<StepDef, { type: string }> =>
    "type" in (s as any);
const hasRender = (s: AnyStep): s is RenderStep =>
    typeof (s as any)?.render === "function";

// ---------- Shared helpers ----------
const cn = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(" ");
const unique = (xs: string[]) => Array.from(new Set(xs));

// ---------- Validation helpers ----------
function requiredMissing(form: Record<string, any>, fields: FieldBase[]) {
    const missing: string[] = [];
    // console.log("fields",fields)
    fields.forEach((f) => {
        const visible = f.condition ? f.condition(form) : true;
        if (!visible || !f.required || f.type === "derived") return;
        const v = form[f.name];
        if (f.type === "checkbox-group") {
            if (!Array.isArray(v) || v.length === 0) missing.push(f.label);
        } else if (f.type === "checkbox") {
            if (!v) missing.push(f.label);
        } else {
            if (v === undefined || v === null || String(v).trim() === "")
                missing.push(f.label);
        }
    });
    return missing;
}

function EmailWithOtp() {
    const { t } = useTranslation();
    const [form, setForm] = useAtom(usaAppWithResetAtom);
    const set = (patch: Partial<typeof form>) =>
        setForm((prev: any) => ({ ...prev, ...patch }));

    type OtpSession = { sms: string | null; email: string | null };
    const [otpSession, setOtpSession] = React.useState<OtpSession>({ sms: null, email: null });
    const [emailOtp, setEmailOtp] = React.useState("");
    const [emailOtpSent, setEmailOtpSent] = React.useState(false);

    // const sendOtp = () => {
    //     if (!String(form.email || "").trim()) return;
    //     const code = Math.floor(100000 + Math.random() * 900000).toString();
    //     set({
    //         _emailOtpGenerated: code,
    //         emailOtpSent: true,
    //         emailOtpVerified: false,
    //         emailOtpInput: "",
    //     });
    // };
    // const verifyOtp = () => {
    //     const ok =
    //         form.emailOtpInput && form.emailOtpInput === form._emailOtpGenerated;
    //     set({ emailOtpVerified: !!ok });
    // };

    const handleSendEmailOtp = async () => {
        if (!form.email) return;

        const data = {
            email: form.email,
            name: form.name,
        }
        if (otpSession.email != null) {
            toast({
                title: "Error",
                description: "Verify the otp sent already",
                variant: "destructive"
            })
            return
        }

        const result = await sendEmailOtpforVerification(data)

        if (result.success) {
            setEmailOtpSent(true);
            setOtpSession((s) => ({ ...s, email: result.id }));
            toast({
                title: "Success",
                description: "OTP sent successfully",
                variant: "default"
            })
        } else {
            // console.log("testing send otp")
            setEmailOtpSent(false);
            setOtpSession((s) => ({ ...s, sms: null }));
            toast({
                title: "Error",
                description: "Failed to send OTP. Please Try Later.",
                variant: "destructive"
            })
        }

    };

    const handleVerifyEmailOtp = async () => {
        if (!emailOtp.trim()) {
            toast({
                title: "Error",
                description: "Please enter OTP",
                variant: "destructive"
            })
            return;
        }
        const data = {
            otp: emailOtp,
            id: otpSession.email
        }
        const result = await validateOtpforVerification(data)
        if (result.success) {
            set({ emailOtpVerified: true })
            setOtpSession((s) => ({ ...s, sms: null }));
            setEmailOtpSent(false)
        } else {
            toast({
                title: "Error",
                description: "Invalid OTP",
                variant: "destructive"
            })
        }
    };

    return (
        <div className="grid gap-2 md:col-span-2">
            <div className="flex items-center justify-between">
                <Label htmlFor="email" className="font-semibold">
                    {t("ApplicantInfoForm.email", "Email")} *
                </Label>
                <div className="flex items-center gap-2">
                    {form.emailOtpVerified ? (
                        <Badge variant="secondary">
                            {t("usa.email.verified", "Email verified ✓")}
                        </Badge>
                    ) : form.emailOtpSent ? (
                        <Badge variant="outline">
                            {t("usa.email.otpSent", "OTP sent")}
                        </Badge>
                    ) : null}
                </div>
            </div>

            <div className="flex gap-2">
                <Input
                    id="email"
                    type="email"
                    placeholder={t(
                        "usa.AppInfo.emailPlaceholder",
                        "Valid email"
                    )}
                    value={form.email ?? ""}
                    onChange={(e) =>
                        set({
                            email: e.target.value,
                            emailOtpVerified: false,
                            emailOtpSent: false,
                            emailOtpInput: "",
                            _emailOtpGenerated: "",
                        })
                    }
                />
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleSendEmailOtp}
                    disabled={!String(form.email || "").trim()}
                >
                    {t("usa.email.sendOtp", "Send OTP")}
                </Button>
            </div>

            {emailOtpSent && (
                <div className="flex gap-2">
                    <Input
                        placeholder={t("usa.email.enterOtp", "Enter OTP")}
                        value={emailOtp ?? ""}
                        onChange={(e) => setEmailOtp(e.target.value)}
                    />
                    <Button
                        type="button"
                        onClick={handleVerifyEmailOtp}
                        disabled={!String(emailOtp || "").trim()}
                    >
                        {t("usa.email.verify", "Verify")}
                    </Button>
                </div>
            )}
        </div>
    );
}

// ---------- Field renderer ----------
function Field({
    field,
    form,
    setForm,
}: {
    field: FieldBase;
    form: any;
    setForm: (fn: (prev: any) => any) => void;
}) {
    const { t } = useTranslation();
    const visible = field.condition ? field.condition(form) : true;
    if (!visible) return null;

    const set = (name: string, value: any) =>
        setForm((prev) => ({ ...prev, [name]: value }));

    const labelText = t(field.label as any, field.label);
    const tooltipText = field.tooltip
        ? t(field.tooltip as any, field.tooltip)
        : undefined;
    const placeholderText = field.placeholder
        ? t(field.placeholder as any, field.placeholder)
        : undefined;
    const hintText = field.hint ? t(field.hint as any, field.hint) : undefined;
    const spanClass = field.colSpan === 2 ? "md:col-span-2" : "";

    const labelEl = (
        <div className="flex items-center gap-2">
            <Label htmlFor={field.name} className="font-semibold">
                {labelText}
            </Label>
            {tooltipText && (
                <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Info className="size-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs text-sm">
                            {tooltipText}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </div>
    );
    const hintEl = hintText ? (
        <p className="text-xs text-muted-foreground mt-1">{hintText}</p>
    ) : null;

    switch (field.type) {
        case "text":
        case "email":
        case "number":
            return (
                <div className={cn("grid gap-2", spanClass)}>
                    {labelEl}
                    <Input
                        id={field.name}
                        type={field.type === "number" ? "number" : field.type}
                        placeholder={placeholderText}
                        value={form[field.name] ?? ""}
                        onChange={(e) => set(field.name, e.target.value)}
                    />
                    {hintEl}
                </div>
            );

        case "textarea":
            return (
                <div className={cn("grid gap-2", spanClass)}>
                    {labelEl}
                    <Textarea
                        id={field.name}
                        rows={field.rows ?? 4}
                        placeholder={placeholderText}
                        value={form[field.name] ?? ""}
                        onChange={(e) => set(field.name, e.target.value)}
                    />
                    {hintEl}
                </div>
            );

        case "select": {
            const options = (field.options || []).map((o) => ({
                ...o,
                _label: t(o.label as any, o.label),
            }));
            return (
                <div className={cn("grid gap-2", spanClass)}>
                    {labelEl}
                    <Select
                        value={String(form[field.name] ?? "")}
                        onValueChange={(v) => set(field.name, v)}
                    >
                        <SelectTrigger id={field.name}>
                            <SelectValue
                                placeholder={t("common.select", "Select")}
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {options.map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                    {o._label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {hintEl}
                </div>
            );
        }

        case "checkbox":
            return (
                <div className={cn("flex items-center gap-2", spanClass)}>
                    <Checkbox
                        id={field.name}
                        checked={!!form[field.name]}
                        onCheckedChange={(v) => set(field.name, !!v)}
                    />
                    {labelEl}
                    {hintEl}
                </div>
            );

        case "checkbox-group": {
            const arr: string[] = Array.isArray(form[field.name])
                ? form[field.name]
                : [];

            const toggle = (val: string, on: boolean) => {
                const next = new Set(arr);
                if (on) next.add(val);
                else next.delete(val);
                set(field.name, Array.from(next));
            };

            const options = (field.options || []).map((o) => ({
                ...o,
                _label: t(o.label as any, o.label),
            }));

            return (
                <div className={cn("grid gap-2", spanClass)}>
                    {labelEl}
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {options.map((o) => (
                            <label
                                key={o.value}
                                className="flex items-center gap-2 rounded-md border p-2"
                            >
                                <Checkbox
                                    checked={arr.includes(o.value)}
                                    onCheckedChange={(v) => toggle(o.value, !!v)}
                                />
                                <span className="text-sm">{o._label}</span>
                            </label>
                        ))}
                    </div>
                    {hintEl}
                </div>
            );
        }

        case "radio-group": {
            const options = (field.options || []).map((o) => ({
                ...o,
                _label: t(o.label as any, o.label),
            }));
            return (
                <div className={cn("grid gap-2", spanClass)}>
                    {labelEl}
                    <RadioGroup
                        value={String(form[field.name] ?? "")}
                        onValueChange={(v) => set(field.name, v)}
                        className="flex flex-col gap-3"
                    >
                        {options.map((o) => (
                            <label
                                key={o.value}
                                className="flex items-start gap-3 text-sm text-gray-700 cursor-pointer"
                            >
                                <RadioGroupItem
                                    value={o.value}
                                    id={`${field.name}-${o.value}`}
                                    className="w-4 h-4 mt-0.5 shrink-0"
                                />
                                <span className="leading-relaxed">
                                    {o._label}
                                </span>
                            </label>
                        ))}
                    </RadioGroup>
                    {hintEl}
                </div>
            );
        }

        case "derived": {
            const val = (field.compute ? field.compute(form) : "") ?? "";
            return (
                <div className={cn("grid gap-2", spanClass)}>
                    {labelEl}
                    <Input id={field.name} readOnly value={val} />
                    {hintEl}
                </div>
            );
        }

        case "select-custom": {
            const cfgOptions = Array.isArray(field.options)
                ? field.options
                : [];
            const fallbackFromShareholders = Array.isArray(
                form.shareHolders
            )
                ? form.shareHolders.map(
                    (sh: any, i: number) => sh?.name || `#${i + 1}`
                )
                : [];

            const rawOptions =
                cfgOptions.length > 0
                    ? cfgOptions
                    : fallbackFromShareholders;

            const options: Array<string | number> = rawOptions.map(
                (o: any) => {
                    if (
                        typeof o === "string" ||
                        typeof o === "number"
                    )
                        return o;
                    const v = o?.value ?? o?.label ?? "";
                    return typeof v === "number" ? v : String(v);
                }
            );

            const placeholder = field.placeholder
                ? t(field.placeholder as any, field.placeholder)
                : t("common.select", "Select");
            const disabled =
                typeof (field as any).disabled === "boolean"
                    ? (field as any).disabled
                    : false;

            const currentRaw = form[field.name];
            const selectedValue: string | number =
                currentRaw == null
                    ? ""
                    : typeof currentRaw === "object"
                        ? currentRaw.value ?? currentRaw.label ?? ""
                        : currentRaw;

            const handleSelect = (val: string | number) => {
                set(field.name, val);
            };

            return (
                <div className={cn("grid gap-2", spanClass)}>
                    {labelEl}
                    <DropdownSelect
                        options={options}
                        placeholder={placeholder}
                        onSelect={handleSelect}
                        selectedValue={
                            selectedValue === undefined ||
                                selectedValue === null
                                ? ""
                                : selectedValue
                        }
                        disabled={disabled}
                    />
                    {hintEl}
                </div>
            );
        }

        case "search-select" as any: {
            const selectedItem = form[field.name]
                ? field.items?.find(
                    (o: any) => o.code === form[field.name]
                ) || null
                : null;

            const handleSelect = (item: {
                code: string;
                label: string;
            }) => {
                set(field.name, item.code);
            };

            const items = (field.items || []).map((it: any) => ({
                ...it,
                label: t(it.label as any, it.label),
            }));

            return (
                <div className={cn("grid gap-2", spanClass)}>
                    {labelEl}
                    <SearchSelect
                        items={items}
                        placeholder={t("common.select", "Select")}
                        onSelect={handleSelect}
                        selectedItem={
                            selectedItem
                                ? {
                                    ...selectedItem,
                                    label: t(
                                        selectedItem.label as any,
                                        selectedItem.label
                                    ),
                                }
                                : null
                        }
                    />
                    {hintEl}
                </div>
            );
        }
    }
    return null;
}

// ---------- Shareholders widget ----------
function ShareholdersWidget({
    form,
    setForm,
}: {
    form: any;
    setForm: (fn: (prev: any) => any) => void;
}) {
    const { t } = useTranslation();
    const { toast } = useToast();

    const shareholders = (form.shareHolders || []) as any[];
    // console.log("shareholders--->", shareholders);
    const setShareholders = (next: any[]) =>
        setForm((p) => ({ ...p, shareHolders: next }));

    const yesNo = [
        { id: "yes", label: "AmlCdd.options.yes" },
        { id: "no", label: "AmlCdd.options.no" },
    ];

    const [isLoading, setIsLoading] = React.useState(false);
    const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);

    const totalOwnership = shareholders.reduce(
        (sum, s) => sum + (Number(s.ownershipRate) || 0),
        0
    );

    const updateAt = (idx: number, patch: any) => {
        const next = [...shareholders];
        next[idx] = { ...next[idx], ...patch };
        setShareholders(next);
    };

    const removeAt = (idx: number) => {
        if (shareholders.length <= 1) return;
        setShareholders(shareholders.filter((_, i) => i !== idx));
    };

    const addShareholder = () =>
        setShareholders([
            ...shareholders,
            {
                name: "",
                email: "",
                phone: "",
                ownershipRate: 0,
                isDirector: { id: "no", label: "AmlCdd.options.no" },
                isLegalPerson: { id: "no", label: "AmlCdd.options.no" },
                isDcp: false,
            },
        ]);

    const sendMailFunction = async () => {
        try {
            setIsLoading(true);

            const extractedData = shareholders.map((item) => {
                const { name, email, isDcp } = item;
                if (!isValidEmail(email)) {
                    alert(`Invalid email format for ${name}: ${email}`);
                }
                return { name, email, isDcp };
            });

            const docId = localStorage.getItem("companyRecordId");
            let country = "US_Individual";
            if (form.selectedEntity === "Corporation") {
                country = "US_Corporate";
            }

            const payload = { _id: docId, inviteData: extractedData, country };
            const response = await sendInviteToShDir(payload);
            // console.log("Invitation Response:", response);
            if (response.summary.successful > 0) {
                const next = [...shareholders.map((sh) => {
                    sh.status = "Invited"
                })];

                setForm((p) => ({ ...p, users: response.users, shareholders: next,partyInvited:true }));
                toast({
                    title: "Success",
                    description: `Successfully sent invitation mail to ${response.summary.successful} people`,
                });
            }
            if (response.summary.alreadyExists > 0) {
                const next = [...shareholders.map((sh) => {
                    sh.status = "Resent Invitation"
                })];
                setForm((p) => ({ ...p, users: response.users, shareholders: next,partyInvited:true }));
                toast({
                    title: "Success",
                    description: `Invite sent to member/director`,
                });
            }
            if (response.summary.failed > 0) {
                toast({
                    title: "Failed",
                    description: `Some Invitations Failed`,
                });
            }
        } catch (e) {
            console.log(e);
        } finally {
            setIsLoading(false);
        }
    };

    // Ownership summary (Panama-style banner but compact)
    let ownershipMessage = "";
    let ownershipClass = "text-destructive";

    if (totalOwnership === 0) {
        ownershipMessage = t("usa.bInfo.shrldSection.ownerShp0");
    } else if (totalOwnership > 0 && totalOwnership < 100) {
        ownershipMessage = `${t("CompanyInformation.totalShrldrName")}: ${totalOwnership.toFixed(
            2
        )}%`;
    } else if (totalOwnership === 100) {
        ownershipMessage = `✅ ${t("usa.bInfo.shrldSection.ownerShip100")}`;
        ownershipClass = "text-green-600 font-medium";
    } else if (totalOwnership > 100) {
        ownershipMessage = `${t("CompanyInformation.totalShrldrName")}: ${totalOwnership.toFixed(
            2
        )}%`;
    }

    return (
        <div className="max-width mx-auto p-2 space-y-4">
            {/* Header + ownership summary */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">
                            {t(
                                "usa.bInfo.shrldSection.shareholderOfficer",
                                "Shareholders / Owners"
                            )}
                        </h2>
                        {ownershipMessage && (
                            <p className={cn("text-xs mt-1", ownershipClass)}>
                                {ownershipMessage}
                            </p>
                        )}
                    </div>
                </div>

                <div className="text-right text-xs text-muted-foreground">
                    {t("CompanyInformation.totalShrldrName")}:{" "}
                    {totalOwnership.toFixed(2)}%
                </div>
            </div>

            {/* Shareholders list (Panama-style cards with compact headers) */}
            <div className="space-y-2">
                {shareholders.map((sh, idx) => {
                    const isExpanded = expandedIndex === idx;
                    const ownershipRate = Number(sh.ownershipRate || 0);

                    return (
                        <Card
                            key={idx}
                            className="overflow-hidden transition-all hover:shadow-md"
                        >
                            {/* Compact header */}
                            <div
                                className="p-2 cursor-pointer flex items-center justify-between hover:bg-gray-50"
                                onClick={() =>
                                    setExpandedIndex(
                                        isExpanded ? null : idx
                                    )
                                }
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-100">
                                        <UserIcon className="w-4 h-4 text-blue-600" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900 truncate">
                                                {sh.name ||
                                                    t(
                                                        "usa.bInfo.shrldSection.shareholderOfficer",
                                                        "Shareholder/Officer"
                                                    )}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 truncate">
                                            {sh.email ||
                                                t("common.noEmail", "No email")}
                                        </p>
                                    </div>

                                    <div className="text-right flex-shrink-0">
                                        <div className="font-semibold text-gray-900">
                                            {ownershipRate.toFixed(2)}%
                                        </div>
                                    </div>
                                </div>

                                <button
                                    className="ml-4 p-1 hover:bg-gray-200 rounded"
                                    type="button"
                                >
                                    {isExpanded ? (
                                        <ChevronUp className="w-4 h-4 text-gray-600" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-gray-600" />
                                    )}
                                </button>
                            </div>

                            {/* Expanded details */}
                            {isExpanded && (
                                <CardContent className="pt-0 pb-4 px-4 border-t bg-gray-50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                        {/* Name */}
                                        <div className="grid gap-2">
                                            <Label className="text-xs text-gray-600 mb-1">
                                                {t(
                                                    "usa.bInfo.shrldSection.shareholderOfficer"
                                                )}
                                            </Label>
                                            <Input
                                                className="h-9"
                                                placeholder="Name on passport/official documents"
                                                value={sh.name}
                                                onChange={(e) =>
                                                    updateAt(idx, {
                                                        name: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>

                                        {/* Ownership rate */}
                                        <div className="grid gap-2">
                                            <Label className="text-xs text-gray-600 mb-1">
                                                {t(
                                                    "CompanyInformation.ownerShpRte"
                                                )}
                                            </Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                max={100}
                                                step={0.01}
                                                className="h-9"
                                                value={sh.ownershipRate}
                                                onChange={(e) =>
                                                    updateAt(idx, {
                                                        ownershipRate:
                                                            parseFloat(
                                                                e.target
                                                                    .value ||
                                                                "0"
                                                            ),
                                                    })
                                                }
                                            />
                                        </div>

                                        {/* Email */}
                                        <div className="grid gap-2">
                                            <Label className="text-xs text-gray-600 mb-1">
                                                {t("ApplicantInfoForm.email")}
                                            </Label>
                                            <Input
                                                type="email"
                                                className="h-9"
                                                placeholder="email@example.com"
                                                value={sh.email}
                                                onChange={(e) =>
                                                    updateAt(idx, {
                                                        email: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>

                                        {/* Phone */}
                                        <div className="grid gap-2">
                                            <Label className="text-xs text-gray-600 mb-1">
                                                {t("ApplicantInfoForm.phoneNum")}
                                            </Label>
                                            <Input
                                                type="tel"
                                                className="h-9"
                                                placeholder="+1234567890"
                                                value={sh.phone}
                                                onChange={(e) =>
                                                    updateAt(idx, {
                                                        phone: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>

                                        {/* Is Director */}
                                        <div className="grid gap-2">
                                            <Label className="text-xs text-gray-600 mb-1">
                                                {t(
                                                    "CompanyInformation.actDirector"
                                                )}
                                            </Label>
                                            <Select
                                                value={sh.isDirector?.id || "no"}
                                                onValueChange={(val) =>
                                                    updateAt(idx, {
                                                        isDirector:
                                                            yesNo.find(
                                                                (x) =>
                                                                    x.id ===
                                                                    val
                                                            ) || {
                                                                id: "no",
                                                                label:
                                                                    "AmlCdd.options.no",
                                                            },
                                                    })
                                                }
                                            >
                                                <SelectTrigger className="h-9">
                                                    <SelectValue
                                                        placeholder={t(
                                                            "common.select",
                                                            "Select"
                                                        )}
                                                    />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {yesNo.map((o) => (
                                                        <SelectItem
                                                            key={o.id}
                                                            value={o.id}
                                                        >
                                                            {t(o.label)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Is Legal Person */}
                                        <div className="grid gap-2">
                                            <Label className="text-xs text-gray-600 mb-1">
                                                {t("CompanyInformation.isLegal")}
                                            </Label>
                                            <Select
                                                value={
                                                    sh.isLegalPerson?.id ||
                                                    "no"
                                                }
                                                onValueChange={(val) =>
                                                    updateAt(idx, {
                                                        isLegalPerson:
                                                            yesNo.find(
                                                                (x) =>
                                                                    x.id ===
                                                                    val
                                                            ) || {
                                                                id: "no",
                                                                label:
                                                                    "AmlCdd.options.no",
                                                            },
                                                    })
                                                }
                                            >
                                                <SelectTrigger className="h-9">
                                                    <SelectValue
                                                        placeholder={t(
                                                            "common.select",
                                                            "Select"
                                                        )}
                                                    />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {yesNo.map((o) => (
                                                        <SelectItem
                                                            key={o.id}
                                                            value={o.id}
                                                        >
                                                            {t(o.label)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* DCP */}
                                        <div className="grid gap-2">
                                            <Label className="text-xs text-gray-600 mb-1">
                                                {t(
                                                    "newHk.company.fields.isDcp.label",
                                                    "Will this person act as DCP?"
                                                )}{" "}
                                                <Tip
                                                    text={t(
                                                        "newHk.company.fields.isDcp.tip",
                                                        "Designated Contact Person for compliance/communication."
                                                    )}
                                                />
                                            </Label>
                                            <Select
                                                value={String(
                                                    sh.isDcp ?? false
                                                )}
                                                onValueChange={(v) =>
                                                    updateAt(idx, {
                                                        isDcp: v === "true",
                                                    })
                                                }
                                            >
                                                <SelectTrigger className="h-9">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="true">
                                                        {t(
                                                            "newHk.parties.fields.isDirector.options.yes"
                                                        )}
                                                    </SelectItem>
                                                    <SelectItem value="false">
                                                        {t(
                                                            "newHk.parties.fields.isDirector.options.no"
                                                        )}
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Remove button */}
                                    <div className="flex items-center justify-between mt-4">
                                        {shareholders.length > 1 && (
                                            <Button
                                                variant="ghost"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => removeAt(idx)}
                                            >
                                                <Trash2 className="w-4 h-4 mr-1" />
                                                {t(
                                                    "newHk.parties.buttons.remove",
                                                    "Remove"
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    );
                })}
            </div>

            {/* Actions row (Panama-style) */}
            <div className="flex flex-wrap items-center gap-3 mt-4">
                <Button
                    onClick={sendMailFunction}
                    disabled={isLoading}
                    className="flex items-center"
                    aria-busy={isLoading}
                    aria-live="polite"
                >
                    {isLoading ? (
                        <>
                            <CustomLoader />
                            <span className="ml-2">Processing...</span>
                        </>
                    ) : (
                        <span>{t("newHk.parties.buttons.invite")}</span>
                    )}
                </Button>

                <Button
                    onClick={addShareholder}
                    disabled={totalOwnership >= 100}
                    variant="outline"
                >
                    {t("CompanyInformation.addShldrDir")}
                </Button>
            </div>
        </div>
    );
}


// function DcpWidget({ form, setForm, }: { form: any; setForm: (fn: (prev: any) => any) => void; }) {
//     const { toast } = useToast();
//     const [isLoading, setIsLoading] = React.useState(false);
//     const { t } = useTranslation();

//     const fields: FieldBase[] = [
//         {
//             type: "text",
//             name: "dcpName",
//             label: "newHk.company.fields.dcpName.label",
//             placeholder: "newHk.company.fields.dcpName.placeholder",
//             tooltip: "usa.bInfo.shrldSection.desgnToolTip",
//             required: true,
//             options: [],
//             colSpan: 2,
//         },
//         {
//             type: "text",
//             name: "dcpEmail",
//             label: "newHk.company.fields.dcpEmail.label",
//             placeholder: "newHk.company.fields.dcpEmail.placeholder",
//             required: true,
//             options: [],
//             colSpan: 1,
//         },
//         {
//             type: "text",
//             name: "dcpNumber",
//             label: "newHk.company.fields.dcpNumber.label",
//             placeholder: "newHk.company.fields.dcpNumber.placeholder",
//             required: true,
//             options: [],
//             colSpan: 1,
//         },
//     ];

//     const sendMailFunction = async () => {
//         try {
//             setIsLoading(true);

//             const extractedData = [{name: form.dcpName, email: form.dcpEmail}];

//             const docId = localStorage.getItem("companyRecordId");
//             let country = "US_Individual";
//             if (form.selectedEntity === "Corporation") {
//                 country = "US_Corporate";
//             }

//             const payload = { _id: docId, inviteData: extractedData, country };
//             const response = await sendInviteToShDir(payload);

//             if (response.summary.successful > 0) {
//                 toast({
//                     title: "Success",
//                     description: `Successfully sent invitation mail to ${response.summary.successful} people`,
//                 });
//             }
//             if (response.summary.alreadyExists > 0) {
//                 toast({
//                     title: "Success",
//                     description: `Invite sent to member/director`,
//                 });
//             }
//             if (response.summary.failed > 0) {
//                 toast({
//                     title: "Failed",
//                     description: `Some Invitations Failed`,
//                 });
//             }
//         } catch (e) {
//             console.log(e);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     return (
//         <div className="max-width mx-auto p-2 space-y-2">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {fields.map((f) => (
//                     <Field
//                         key={f.name}
//                         field={f}
//                         form={form}
//                         setForm={setForm}
//                     />
//                 ))}
//             </div>
//             <Button
//                 onClick={sendMailFunction}
//                 disabled={isLoading}
//                 className="flex items-center"
//                 aria-busy={isLoading}
//                 aria-live="polite"
//             >
//                 {isLoading ? (
//                     <>
//                         <CustomLoader />
//                         <span className="ml-2">Processing...</span>
//                     </>
//                 ) : (
//                     <span>{t("newHk.parties.buttons.invite")}</span>
//                 )}
//             </Button>
//         </div>
//     );
// }


// ---------- Corp vs LLC dialog ----------
function CorpVsLlcDialog({ open, onOpenChange, }: { open: boolean; onOpenChange: (v: boolean) => void; }) {
    const { t } = useTranslation();
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[70%] w-full mx-auto my-auto p-6">
                <DialogHeader className="text-center">
                    <DialogTitle className="text-2xl font-bold mb-2">
                        {t("usa.compInfo.corpandLlc")}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground mb-4">
                        {t("usa.compInfo.fundamentalDiff")}
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[70vh] w-full pr-2 overflow-auto">
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-left">
                                <tr>
                                    <th className="w-[200px] min-w-[150px] p-2">
                                        {t("usa.compInfo.category")}
                                    </th>
                                    <th className="min-w-[250px] p-2">
                                        {t("usa.compInfo.corporation")}
                                    </th>
                                    <th className="min-w-[250px] p-2">
                                        {t("usa.compInfo.llc")}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="font-medium p-2">
                                        {t("usa.compInfo.definition")}
                                    </td>
                                    <td className="p-2">
                                        {t("usa.compInfo.knownAsCorpo")}
                                    </td>
                                    <td className="p-2">
                                        {t("usa.compInfo.llcProprietoryPartner")}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="font-medium p-2">
                                        {t("usa.compInfo.tax")}
                                    </td>
                                    <td className="p-2">
                                        {t("usa.compInfo.corporateTax")}
                                    </td>
                                    <td className="p-2">
                                        {t("usa.compInfo.llcIncome")}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="font-medium p-2">
                                        {t("usa.compInfo.profitRealiz")}
                                    </td>
                                    <td className="p-2">
                                        {t("usa.compInfo.profitDividend")}
                                    </td>
                                    <td className="p-2">
                                        {t("usa.compInfo.noDividend")}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="font-medium p-2">
                                        {t("usa.compInfo.retainedEarning")}
                                    </td>
                                    <td className="p-2">
                                        {t("usa.compInfo.dividentTaxed")}
                                    </td>
                                    <td className="p-2">
                                        {t("usa.compInfo.profitPersonalIncome")}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="font-medium p-2">
                                        {t("usa.compInfo.otherConsideration")}
                                    </td>
                                    <td className="p-2">
                                        {t("usa.compInfo.koreanConsideration")}
                                    </td>
                                    <td className="p-2">
                                        {t("usa.compInfo.koreanLlcRule")}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="font-medium p-2">
                                        {t("usa.compInfo.spclCase")}
                                    </td>
                                    <td className="p-2">
                                        {t("usa.compInfo.cryptoLegalBusiness")}
                                    </td>
                                    <td className="p-2">
                                        {t("usa.compInfo.cryptoNotTaxed")}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="flex justify-center mt-4">
                    <Button
                        onClick={() => onOpenChange(false)}
                        className="w-full md:w-auto"
                    >
                        {t("usa.compInfo.close")}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ---------- Registration Details Step (Step 8 / info) ----------
function RegistrationDetailsSection({
    app,
    setApp,
    canEdit = true,
}: {
    app: any;
    setApp: (fn: (prev: any) => any) => void;
    canEdit?: boolean;
}) {
    const { t } = useTranslation();

    // dropdown option lists
    const capitalOptions = ["1", "100", "1000", "10000"];
    const executivesOptions = [
        "1 person",
        "2 or more individuals",
        "Corporation (agent participates in the decision-making of the U.S. company) + individual",
    ];
    const addressOptions = [
        "Use MirAsia’s U.S. company registration address service",
        "There is a separate address to use as a business address in the United States (do not use Mir Asia’s registered address service)",
    ];
    const sharesOptions = [
        "Total capital divided by $1 (1 share price = $1; universal method)",
        "1 share (minimum) (1 share price = total capital)",
        "100",
        "1,000",
        "10,000",
    ];

    const showBusinessAddressInput =
        app.localCompanyRegistration ===
        "There is a separate address to use as a business address in the United States (do not use Mir Asia’s registered address service)";

    // handlers
    const setField = (patch: Partial<any>) =>
        setApp((prev: any) => ({ ...prev, ...patch }));

    const handlePriceSelect = (val: string | number) => {
        setField({ totalCapital: val });
    };

    const handleExecutivesSelect = (val: string | number) => {
        setField({ companyExecutives: val });
    };

    const handleAddressSelect = (val: string) => {
        setField({ localCompanyRegistration: val });
        if (val == addressOptions[0]) setField({ businessAddress: '' })
    };

    const handleSharesSelect = (val: string | number) => {
        setField({ noOfSharesSelected: val });
    };

    return (
        <Card className="w-full mx-auto">
            <CardContent className="pt-6 space-y-6">
                {/* Heading + helper text */}
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-base md:text-lg font-semibold">
                            {t("usa.regDetails.heading", "Registration details")}
                        </h2>

                        <TooltipProvider delayDuration={0}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 text-red-500 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[500px] text-sm">
                                    {t("usa.regDetails.htoolTip", "")}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <span className="text-red-500">*</span>
                    </div>
                </div>

                {/* Grid fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Total Paid-in / Capital */}
                    <div className="grid gap-2">
                        <div className="flex items-center gap-2">
                            <Label className="font-semibold">
                                {t("usa.regDetails.totalPaid", "Total paid-in capital")}
                            </Label>
                            <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[500px] text-sm">
                                        {t(
                                            "usa.regDetails.totalPaidTtip",
                                            "This is the total amount of capital you intend to register."
                                        )}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <span className="text-red-500 font-bold ml-1">*</span>
                        </div>

                        <DropdownSelect
                            options={capitalOptions}
                            placeholder="Enter custom price or select"
                            selectedValue={app.totalCapital ?? ""}
                            onSelect={handlePriceSelect}
                            disabled={!canEdit}
                        />
                    </div>

                    {/* Executive team / management structure */}
                    <div className="grid gap-2">
                        <div className="flex items-center gap-2">
                            <Label className="font-semibold">
                                {t(
                                    "usa.regDetails.executiveTeam",
                                    "Company executives / decision makers"
                                )}
                            </Label>
                            <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[500px] text-sm">
                                        {t(
                                            "usa.regDetails.executiveTeamTtip",
                                            "Select who will control / direct the company."
                                        )}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <span className="text-red-500 font-bold ml-1">*</span>
                        </div>

                        <DropdownSelect
                            options={executivesOptions}
                            placeholder="Select..."
                            selectedValue={app.companyExecutives ?? ""}
                            onSelect={handleExecutivesSelect}
                            disabled={!canEdit}
                        />
                    </div>

                    {/* U.S. registration address */}
                    <div className="grid gap-2">
                        <div className="flex items-center gap-2">
                            <Label className="font-semibold">
                                {t("usa.regDetails.usLocalReg", "U.S. local registration / address")}
                            </Label>
                            <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[500px] text-sm">
                                        {t(
                                            "usa.regDetails.usLocalRegTtip",
                                            "Tell us if you'll use Mirr Asia’s registered address or provide your own U.S. business address."
                                        )}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <span className="text-red-500 font-bold ml-1">*</span>
                        </div>
                        <Select
                            value={app.localCompanyRegistration ?? ""}
                            onValueChange={handleAddressSelect}
                            disabled={!canEdit}
                        >
                            <SelectTrigger className="w-full max-w-[500px] text-wrap">
                                <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                                {addressOptions.map((opt) => (
                                    <SelectItem
                                        key={opt}
                                        value={opt}
                                        className="max-w-[500px] text-wrap"
                                    >
                                        {opt}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Number of shares / share structure */}
                    <div className="grid gap-2">
                        <div className="flex items-center gap-2">
                            <Label className="font-semibold">
                                {t(
                                    "usa.regDetails.totalNumShares",
                                    "Total number of shares / share structure"
                                )}
                            </Label>
                            <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[500px] text-sm">
                                        {t(
                                            "usa.regDetails.additionalCosts",
                                            "Choosing a very high authorized share count can increase filing fees in some states."
                                        )}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <span className="text-red-500 font-bold ml-1">*</span>
                        </div>

                        <DropdownSelect
                            options={sharesOptions}
                            placeholder="Select..."
                            selectedValue={app.noOfSharesSelected ?? ""}
                            onSelect={handleSharesSelect}
                            disabled={!canEdit}
                        />
                    </div>
                    {showBusinessAddressInput && (
                        <div className="grid gap-2">
                            <Label className="font-medium">
                                {t("usa.regDetails.enterUsAddress", "Enter your U.S. business address")}
                            </Label>
                            <Input
                                className="w-full"
                                placeholder="Street, City, State, ZIP"
                                value={app.businessAddress ?? ""}
                                onChange={(e) =>
                                    setField({
                                        businessAddress: e.target.value,
                                    })
                                }
                                disabled={!canEdit}
                            />
                        </div>
                    )}
                </div>
            </CardContent>
            <CardContent className="pt-6 space-y-2 text-sm">
                <div className="font-semibold">{t("newHk.review.declarations.title")}</div>

                <div>
                    <label className="flex items-center gap-2">
                        <Checkbox
                            id="truthfulnessDeclaration"
                            checked={!!app.truthfulnessDeclaration}
                            onCheckedChange={(v) => setApp((p) => ({ ...p, truthfulnessDeclaration: !!v }))}
                        />{" "}
                        {t("newHk.review.declarations.truth")}
                    </label>

                    <label className="flex items-center gap-2 mt-2">
                        <Checkbox
                            id="legalTermsAcknowledgment"
                            checked={!!app.legalTermsAcknowledgment}
                            onCheckedChange={(v) => setApp((p) => ({ ...p, legalTermsAcknowledgment: !!v }))}
                        />{" "}
                        {t("newHk.review.declarations.terms")}
                    </label>

                    <label className="flex items-center gap-2 mt-2">
                        <Checkbox
                            id="compliancePreconditionAcknowledgment"
                            checked={!!app.compliancePreconditionAcknowledgment}
                            onCheckedChange={(v) => setApp((p) => ({ ...p, compliancePreconditionAcknowledgment: !!v }))}
                        />{" "}
                        {t("newHk.review.declarations.compliance")}
                    </label>
                </div>

                <div className="grid gap-2 mt-2">
                    <Label>{t("newHk.review.esign.label")}</Label>
                    <Input
                        id="eSign"
                        placeholder={t("newHk.review.placeholders.signaturePlaceholder")}
                        value={app.eSign || ""}
                        onChange={(e) => setApp((p) => ({ ...p, eSign: e.target.value }))}
                    />
                    <div className="text-xs text-muted-foreground">
                        {t("newHk.review.esign.helper")}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// ---------- Service selection ----------
function UsServiceSelectionStep() {
    const { t } = useTranslation();
    const [formData, setFormData] = useAtom(usaAppWithResetAtom);

    const [selectedServices, setSelectedServices] = React.useState<
        string[]
    >(formData.serviceItemsSelected ?? []);

    const state = formData.selectedState;
    const entity = formData.selectedEntity;
    const basePriceData = getEntityBasicPrice(state ?? "", entity);

    const baseFees = [
        {
            id: "state",
            description: `${state ?? ""} (${entity})`,
            originalPrice: Number(basePriceData?.price || 0),
            discountedPrice: Number(basePriceData?.price || 0),
            note: `${basePriceData?.note || ""}`,
            isHighlight: false,
            isOptional: false,
            isChecked: false,
        },
    ];

    const optionalFees = service_list.map((service) => ({
        id: service.id,
        description: t(service.key),
        originalPrice: service.price || 0,
        discountedPrice: service.price || 0,
        isHighlight: false,
        isOptional: true,
        isChecked: false,
    }));

    const handleCheckboxChange = (id: string) => {
        if (formData.sessionId !== "") {
            toast({
                title: "Payment Session Initiated",
                description: `Cant select extra items once payment session initiated`,
            });
            return;
        }

        setSelectedServices((prev) => {
            const updated = prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id];

            setFormData({
                ...formData,
                serviceItemsSelected: updated,
            });

            return updated;
        });
    };

    const displayedFees = [
        ...baseFees,
        ...optionalFees.map((fee) => ({
            ...fee,
            isChecked: (selectedServices ?? []).includes(
                fee.id
            ),
        })),
    ];

    const totalOriginal = baseFees.reduce(
        (sum, item) => sum + item.originalPrice,
        0
    );
    const totalDiscounted = baseFees.reduce(
        (sum, item) => sum + item.discountedPrice,
        0
    );

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="text-xl text-cyan-400">
                    {t("usa.serviceSelection.heading")}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-1/2">
                                {t("usa.serviceSelection.col1")}
                            </TableHead>
                            <TableHead className="text-right">
                                {t("usa.serviceSelection.col2")}
                            </TableHead>
                            <TableHead className="text-right">
                                {t("usa.serviceSelection.col3")}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {displayedFees.map((fee, index) => (
                            <TableRow
                                key={index}
                                className={
                                    fee.isOptional ? "text-gray-600" : ""
                                }
                            >
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {fee.isOptional && (
                                            <Checkbox
                                                checked={fee.isChecked}
                                                onCheckedChange={() =>
                                                    handleCheckboxChange(fee.id)
                                                }
                                            />
                                        )}
                                        {fee.description}
                                    </div>
                                </TableCell>
                                <TableCell
                                    className={cn(
                                        "text-right",
                                        fee.originalPrice !==
                                        fee.discountedPrice &&
                                        "line-through text-gray-500"
                                    )}
                                >
                                    USD {fee.originalPrice}
                                </TableCell>
                                <TableCell
                                    className={cn(
                                        "text-right",
                                        fee.discountedPrice === 0 &&
                                        "text-red-500 font-semibold"
                                    )}
                                >
                                    {fee.discountedPrice === 0
                                        ? t("ServiceSelection.FREE")
                                        : `USD ${fee.discountedPrice}`}
                                </TableCell>
                            </TableRow>
                        ))}

                        <TableRow className="font-bold bg-gray-100">
                            <TableCell>
                                {t("usa.serviceSelection.totalCost")}
                            </TableCell>
                            <TableCell className="text-right line-through text-gray-500">
                                USD {totalOriginal}
                            </TableCell>
                            <TableCell className="text-right text-yellow-600">
                                USD {totalDiscounted}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

// ---------- Invoice step ----------
export function InvoiceUsStep() {
    const { t } = useTranslation();
    const [formData] = useAtom(usaAppWithResetAtom);
    const [, setUsPrice] = useAtom(usaPriceAtom);

    const selectedServices = formData.serviceItemsSelected ?? [];
    const state = formData.selectedState;
    const entity = formData.selectedEntity;
    const basePrice = getEntityBasicPrice(state ?? "", entity);

    const baseFee = {
        description: `${state ?? ""} (${entity})`,
        originalPrice: Number(basePrice?.price || 0),
        discountedPrice: Number(basePrice?.price || 0),
        note: basePrice?.note || "",
        isHighlight: false,
        isOptional: false,
    };

    const selectedOptionalFees = service_list
        .filter((service) =>
            selectedServices.includes(service.id)
        )
        .map((service) => ({
            description: t(service.key),
            originalPrice: service.price || 0,
            discountedPrice: service.price || 0,
            note: "",
            isHighlight: false,
            isOptional: true,
        }));

    const fees = [baseFee, ...selectedOptionalFees];

    const totalOriginal = fees.reduce(
        (sum, item) => sum + Number(item.originalPrice),
        0
    );
    const totalDiscounted = fees.reduce(
        (sum, item) => sum + Number(item.discountedPrice),
        0
    );

    React.useEffect(() => {
        setUsPrice(totalDiscounted || 0);
    }, [totalDiscounted, setUsPrice]);

    return (
        <div className="w-full max-w-4xl mx-auto py-8 px-4">
            <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>
                        MIRR ASIA BUSINESS ADVISORY &amp; SECRETARIAL
                        SERVICES LIMITED
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">
                                    Original Price
                                </TableHead>
                                <TableHead className="text-right">
                                    Discounted Price
                                </TableHead>
                                <TableHead className="text-right">
                                    Notes
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fees.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={
                                                    item.isHighlight
                                                        ? "font-semibold"
                                                        : ""
                                                }
                                            >
                                                {item.description}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground">
                                        {item.originalPrice > 0
                                            ? `USD ${item.originalPrice}`
                                            : "USD 0.00"}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {item.discountedPrice > 0
                                            ? `USD ${item.discountedPrice}`
                                            : "USD 0.00"}
                                    </TableCell>
                                    <TableCell className="text-right text-sm text-muted-foreground">
                                        {item.note}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <div className="mt-4 flex justify-end">
                        <Card className="w-80">
                            <CardContent className="pt-4">
                                <div className="flex justify-between mb-2">
                                    <span className="font-xs text-xs line-through text-gray-500">
                                        Total (Original):
                                    </span>
                                    <span className="font-xs text-xs line-through text-gray-500">
                                        USD {totalOriginal.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-green-600">
                                    <span className="font-medium">
                                        Total (Discounted):
                                    </span>
                                    <span className="font-bold">
                                        USD {totalDiscounted.toFixed(2)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// ---------- Payment helpers ----------
function computeUsGrandTotal(app: any): number {
    const base = getEntityBasicPrice(
        app.selectedState ?? "",
        app.selectedEntity ?? ""
    );
    const basePrice = Number(base?.price || 0);

    const selectedServices: string[] = Array.isArray(
        app.serviceItemsSelected
    )
        ? app.serviceItemsSelected
        : [];
    const addonsTotal = service_list
        .filter((svc) => selectedServices.includes(svc.id))
        .reduce(
            (sum, svc) => sum + (svc.price || 0),
            0
        );

    const subtotal = basePrice + addonsTotal;
    const currency = app.stripeCurrency;
    const cardFeeRate = currency && String(currency).toUpperCase() === "USD" ? 0.06 : 0.035;
    const grand =
        app.payMethod === "card"
            ? subtotal * (1 + cardFeeRate)
            : subtotal;

    return grand;
}

// ---------- Stripe / Payment UI ----------
function StripePaymentForm({
    app,
    onSuccess,
    onClose,
}: {
    app: any;
    onSuccess: (info: StripeSuccessInfo) => void;
    onClose: () => void;
}) {
    const stripe = useStripe();
    const elements = useElements();
    const [submitting, setSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(
        null
    );

    // Success / processing UI
    const [successPayload, setSuccessPayload] =
        React.useState<StripeSuccessInfo | null>(null);
    const [processingMsg, setProcessingMsg] =
        React.useState<string | null>(null);

    const handleConfirm = async () => {
        if (!stripe || !elements) return;
        setSubmitting(true);
        setError(null);
        setSuccessPayload(null);
        setProcessingMsg(null);

        try {
            const { error, paymentIntent } =
                await stripe.confirmPayment({
                    elements,
                    confirmParams: {
                        return_url:
                            typeof window !== "undefined"
                                ? window.location.href
                                : "",
                    },
                    redirect: "if_required",
                });

            if (error) {
                setError(
                    error.message ??
                    "Payment failed. Please try again."
                );
                setSubmitting(false);
                return;
            }

            const status = paymentIntent?.status;

            const notifyBackend = async () => {
                try {
                    const result =
                        await updateCorporateInvoicePaymentIntent({
                            paymentIntentId:
                                app.paymentIntentId,
                            companyId: app._id,
                            companyName:
                                app.companyName_1 ||
                                app.companyName_2 ||
                                app.companyName_3 ||
                                "Company (TBD)",
                            userEmail: app.email,
                            country: "US",
                        });

                    if (result?.ok) {
                        const payload: StripeSuccessInfo = {
                            receiptUrl: result?.receiptUrl,
                            amount: result?.amount,
                            currency: result?.currency,
                            paymentIntentStatus:
                                result?.paymentIntentStatus,
                        };

                        if (
                            result?.paymentIntentStatus ===
                            "succeeded"
                        ) {
                            setSuccessPayload(payload);
                            onSuccess(payload);
                            setSubmitting(false);
                            return;
                        }

                        if (
                            result?.paymentIntentStatus ===
                            "processing" ||
                            result?.paymentIntentStatus ===
                            "requires_capture"
                        ) {
                            setProcessingMsg(
                                "Your payment is processing. You’ll receive a receipt once the transaction is confirmed."
                            );
                            onSuccess(payload);
                            setSubmitting(false);
                            return;
                        }
                    }

                    // fallback
                    setError(
                        "Payment confirmed, but we couldn’t retrieve the receipt from the server. Please contact support if you didn’t receive an email."
                    );
                    setSubmitting(false);
                } catch (e: any) {
                    console.error(
                        "Failed to notify backend about PI update:",
                        e
                    );
                    setError(
                        "Payment confirmed, but saving the payment on the server failed. We’ll email your receipt soon or contact support."
                    );
                    setSubmitting(false);
                }
            };

            if (status === "succeeded") {
                await notifyBackend();
            } else if (
                status === "processing" ||
                status === "requires_capture"
            ) {
                await notifyBackend();
            } else {
                setError(
                    `Payment status: ${status ?? "unknown"
                    }. If this persists, contact support.`
                );
                setSubmitting(false);
            }
        } catch (e: any) {
            console.error(e);
            setError(
                e?.message ||
                "Something went wrong while confirming payment."
            );
            setSubmitting(false);
        }
    };

    if (successPayload) {
        const amt =
            typeof successPayload.amount === "number"
                ? successPayload.amount
                : undefined;
        const currency = successPayload.currency
            ? successPayload.currency.toUpperCase()
            : undefined;
        return (
            <div className="space-y-4">
                <div className="border rounded-md p-3 text-sm bg-emerald-50 border-emerald-200 text-emerald-900">
                    <div className="font-semibold mb-1">
                        Payment successful
                    </div>
                    <div className="space-y-1">
                        {amt != null && currency ? (
                            <div>
                                Amount:{" "}
                                <b>
                                    {currency}{" "}
                                    {(amt / 100).toFixed(2)}
                                </b>
                            </div>
                        ) : null}
                        <div>
                            {successPayload.receiptUrl ? (
                                <>
                                    Receipt:&nbsp;
                                    <a
                                        href={successPayload.receiptUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline underline-offset-2"
                                    >
                                        View Stripe receipt
                                    </a>
                                </>
                            ) : null}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end">
                    <Button onClick={onClose}>Done</Button>
                </div>
            </div>
        );
    }

    if (processingMsg) {
        return (
            <div className="space-y-4">
                <div className="border rounded-md p-3 text-sm bg-amber-50 border-amber-200 text-amber-900">
                    <div className="font-semibold mb-1">
                        Payment is processing
                    </div>
                    <div>{processingMsg}</div>
                </div>
                <div className="flex items-center justify-end">
                    <Button onClick={onClose}>Close</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <PaymentElement />
            {error ? (
                <div className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-2">
                    {error}
                </div>
            ) : null}
            <div className="flex items-center justify-end gap-2">
                <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={submitting}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleConfirm}
                    disabled={!stripe || !elements || submitting}
                >
                    {submitting ? "Processing…" : "Pay now"}
                </Button>
            </div>
        </div>
    );
}

function StripeCardDrawer({
    open,
    onOpenChange,
    clientSecret,
    amountUSD,
    app,
    onSuccess,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    clientSecret: string;
    amountUSD: number;
    app: any;
    onSuccess: (info: StripeSuccessInfo) => void;
}) {
    const options = React.useMemo(
        () => ({
            clientSecret,
            appearance: { theme: "stripe" as const },
        }),
        [clientSecret]
    );

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-full sm:max-w-md"
            >
                <SheetHeader>
                    <SheetTitle>
                        Stripe Card Payment
                    </SheetTitle>
                    <SheetDescription>
                        Grand Total: {app.stripeCurrency ?? "USD"} <b>{amountUSD.toFixed(2)}</b>{" "}
                        {app.payMethod === "card" ? `(incl. ${(app.stripeCurrency && String(app.stripeCurrency).toUpperCase() === "USD" ? 6 : 3.5)}% card fee)` : ""}
                    </SheetDescription>
                </SheetHeader>

                {clientSecret ? (
                    <div className="mt-4">
                        <Elements
                            stripe={stripePromise}
                            options={options}
                        >
                            <StripePaymentForm
                                app={app}
                                onSuccess={onSuccess}
                                onClose={() => onOpenChange(false)}
                            />
                        </Elements>
                    </div>
                ) : (
                    <div className="mt-4 text-sm text-muted-foreground">
                        Preparing secure payment…
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}

function PaymentStep() {
    const { t } = useTranslation();
    const [app, setApp] = useAtom(usaAppWithResetAtom);

    const grand = computeUsGrandTotal(app);

    const isPaid =
        app.paymentStatus === "paid" ||
        app.stripeLastStatus === "succeeded" ||
        app.stripePaymentStatus === "succeeded";

    React.useEffect(() => {
        if (isPaid) return;
        const now = Date.now();
        const current = app.expiresAt
            ? new Date(app.expiresAt).getTime()
            : 0;
        if (!current || current <= now) {
            const twoDaysMs =
                2 * 24 * 60 * 60 * 1000;
            const expiryISO = new Date(
                now + twoDaysMs
            ).toISOString();
            setApp((prev: any) => ({
                ...prev,
                expiresAt: expiryISO,
                updatedAt: new Date().toISOString(),
            }));
        }
    }, [isPaid, setApp]);

    const [nowTs, setNowTs] = React.useState(() =>
        Date.now()
    );
    React.useEffect(() => {
        if (isPaid) return;
        const id = window.setInterval(
            () => setNowTs(Date.now()),
            1000
        );
        return () => window.clearInterval(id);
    }, [isPaid]);

    const expiresTs = app.expiresAt
        ? new Date(app.expiresAt).getTime()
        : 0;
    const remainingMs = Math.max(
        0,
        expiresTs - nowTs
    );
    const isExpired =
        !isPaid &&
        (!expiresTs || remainingMs <= 0);

    const formatRemaining = (ms: number) => {
        const s = Math.floor(ms / 1000);
        const d = Math.floor(s / 86400);
        const h = Math.floor(
            (s % 86400) / 3600
        );
        const m = Math.floor(
            (s % 3600) / 60
        );
        const sec = s % 60;
        return d > 0
            ? `${d}d ${String(h).padStart(
                2,
                "0"
            )}:${String(m).padStart(
                2,
                "0"
            )}:${String(sec).padStart(
                2,
                "0"
            )}`
            : `${String(h).padStart(
                2,
                "0"
            )}:${String(m).padStart(
                2,
                "0"
            )}:${String(sec).padStart(
                2,
                "0"
            )}`;
    };

    const [creatingPI, setCreatingPI] =
        React.useState(false);
    const [uploading, setUploading] =
        React.useState(false);
    const [bankFile, setBankFile] =
        React.useState<File | null>(null);
    const [clientSecret, setClientSecret] =
        React.useState<string | null>(null);
    const [cardDrawerOpen, setCardDrawerOpen] =
        React.useState(false);

    const guard = (msg: string) => {
        if (isPaid) {
            alert(
                t(
                    "newHk.payment.alerts.alreadyPaid"
                )
            );
            return true;
        }
        if (isExpired) {
            alert(msg);
            return true;
        }
        return false;
    };

    const handleBankProofSubmit = async () => {
        if (
            guard(
                t(
                    "newHk.payment.alerts.expiredGuard"
                )
            )
        )
            return;
        if (!bankFile) return;
        setUploading(true);
        try {
            const method = app.payMethod;
            const expiresAt =
                app.expiresAt || "";
            const result =
                await uploadIncorpoPaymentBankProof(
                    app._id || "",
                    "us",
                    bankFile,
                    method,
                    expiresAt
                );
            if (result) {
                setApp((prev: any) => ({
                    ...prev,
                    uploadReceiptUrl:
                        result?.url,
                }));
            }
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteBankProof = async () => {
        if (
            guard(
                t(
                    "newHk.payment.alerts.expiredGuard"
                )
            )
        )
            return;
        await deleteIncorpoPaymentBankProof(
            app._id || "",
            "us"
        );
        setApp((prev: any) => ({
            ...prev,
            uploadReceiptUrl:
                undefined,
        }));
    };

    const handleProceedCard = async () => {
        if (
            guard(
                t(
                    "newHk.payment.alerts.expiredGuard"
                )
            )
        )
            return;

        if (
            clientSecret &&
            app.paymentIntentId
        ) {
            setCardDrawerOpen(true);
            return;
        }

        setCreatingPI(true);
        try {
            const usedCurrency = app.stripeCurrency ?? "USD";
            const fp = {
                companyId:
                    app._id ?? null,
                totalCents:
                    Math.round(grand * 100),
                country: "USA",
                currency: usedCurrency,
            };
            const result =
                await createInvoicePaymentIntent(
                    fp
                );

            if (
                result?.clientSecret &&
                result?.id
            ) {
                setClientSecret(
                    result.clientSecret
                );

                const usedCurrency = app.stripeCurrency ?? "USD";
                setApp((prev: any) => ({
                    ...prev,
                    paymentIntentId:
                        result.id,
                    payMethod:
                        "card",
                    paymentIntentCurrency: usedCurrency,
                    stripeCurrency: usedCurrency,
                }));

                setCardDrawerOpen(true);
            } else {
                alert(
                    "Could not initialize card payment. Please try again."
                );
            }
        } catch (e) {
            console.error(
                "PI creation failed:",
                e
            );
            alert(
                t(
                    "newHk.payment.alerts.prepareFailedDesc"
                )
            );
        } finally {
            setCreatingPI(false);
        }
    };

    return (
        <>
            {/* PAID banner */}
            {isPaid && (
                <div className="mb-4 border rounded-md p-3 text-sm bg-emerald-50 border-emerald-200 text-emerald-900">
                    <div className="font-semibold mb-1">
                        {t(
                            "newHk.payment.success.title"
                        )}
                    </div>
                    <div className="space-y-1">
                        {typeof app.stripeAmountCents ===
                            "number" &&
                            app.stripeCurrency ? (
                            <div>
                                {t(
                                    "newHk.payment.success.amountLabel"
                                )}{" "}
                                <b>
                                    {app.stripeCurrency.toUpperCase()}{" "}
                                    {(
                                        app.stripeAmountCents /
                                        100
                                    ).toFixed(2)}
                                </b>
                            </div>
                        ) : null}

                        <div>
                            {app.stripeReceiptUrl ? (
                                <>
                                    {t(
                                        "newHk.payment.success.receiptLabel"
                                    )}
                                    &nbsp;
                                    <a
                                        href={
                                            app.stripeReceiptUrl
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline underline-offset-2"
                                    >
                                        {t(
                                            "newHk.payment.success.viewStripeReceipt"
                                        )}
                                    </a>
                                </>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}

            {/* Expiry / countdown */}
            {!isPaid && (
                <div
                    className={[
                        "mb-4 rounded-md border p-3 text-sm",
                        isExpired
                            ? "border-red-200 bg-red-50 text-red-900"
                            : "border-amber-200 bg-amber-50 text-amber-900",
                    ].join(" ")}
                >
                    {isExpired ? (
                        <div className="font-medium">
                            {t(
                                "newHk.payment.expiryBanner.expiredMessage"
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-between gap-2">
                            <div className="font-medium">
                                {t(
                                    "newHk.payment.expiryBanner.timerTitle"
                                )}
                            </div>
                            <div className="text-base font-bold tabular-nums">
                                {t(
                                    "newHk.payment.expiryBanner.timeRemaining",
                                    {
                                        time: formatRemaining(
                                            remainingMs
                                        ),
                                    }
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
                {/* LEFT: payment method */}
                <Card>
                    <CardContent className="pt-6 space-y-2">
                        <div className="font-bold">
                            {t(
                                "newHk.payment.methods.title"
                            )}
                        </div>

                        {[
                            {
                                v: "card",
                                label: t(
                                    "newHk.payment.methods.options.card.label"
                                ),
                                tip: t(
                                    "newHk.payment.methods.options.card.tip"
                                ),
                            },
                            {
                                v: "fps",
                                label: t(
                                    "newHk.payment.methods.options.fps.label"
                                ),
                            },
                            {
                                v: "bank",
                                label: t(
                                    "newHk.payment.methods.options.bank.label"
                                ),
                            },
                            {
                                v: "other",
                                label: t(
                                    "newHk.payment.methods.options.other.label"
                                ),
                            },
                        ].map((o) => (
                            <label
                                key={o.v}
                                className="block space-x-2"
                            >
                                <input
                                    type="radio"
                                    name="pay"
                                    value={o.v}
                                    checked={
                                        app.payMethod === o.v
                                    }
                                    onChange={() =>
                                        setApp(
                                            (prev: any) => ({
                                                ...prev,
                                                payMethod: o.v,
                                            })
                                        )
                                    }
                                    disabled={
                                        isPaid ||
                                        isExpired
                                    }
                                />
                                <span
                                    className={
                                        isPaid ||
                                            isExpired
                                            ? "text-muted-foreground"
                                            : ""
                                    }
                                >
                                    {o.label}
                                </span>
                                {o.tip &&
                                    !(
                                        isPaid ||
                                        isExpired
                                    ) && (
                                        <span className="inline-flex ml-1">
                                            <Tip
                                                text={o.tip}
                                            />
                                        </span>
                                    )}
                            </label>
                        ))}

                        {(isPaid ||
                            isExpired) && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                    {isPaid
                                        ? t(
                                            "newHk.payment.methods.statusNote.paid"
                                        )
                                        : t(
                                            "newHk.payment.methods.statusNote.expired"
                                        )}
                                </div>
                            )}
                    </CardContent>
                </Card>

                {/* RIGHT: proof/card upload + totals */}
                <Card>
                    <CardContent className="pt-6 space-y-2">
                        <div className="font-bold">
                            {t(
                                "newHk.payment.conditions.title"
                            )}
                        </div>
                        <p className="text-sm">
                            <Trans i18nKey="newHk.payment.conditions.text">
                                100% advance payment. All
                                payments are
                                non-refundable.The
                                remitter bears all bank
                                charges (including
                                intermediary bank
                                fees).
                            </Trans>
                        </p>

                        {["bank", "other", "fps"].includes(
                            app.payMethod
                        ) && (
                                <div className="mt-4 grid gap-3">
                                    <div className="grid gap-2">
                                        <Label>
                                            {t(
                                                "newHk.payment.bankUpload.refLabel"
                                            )}
                                        </Label>
                                        <Input
                                            placeholder={t(
                                                "newHk.payment.bankUpload.refPlaceholder"
                                            )}
                                            value={
                                                app.bankRef ||
                                                ""
                                            }
                                            onChange={(e) =>
                                                setApp(
                                                    (prev: any) => ({
                                                        ...prev,
                                                        bankRef:
                                                            e.target
                                                                .value,
                                                    })
                                                )
                                            }
                                            disabled={
                                                isPaid ||
                                                isExpired
                                            }
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>
                                            {t(
                                                "newHk.payment.bankUpload.proofLabel"
                                            )}
                                        </Label>
                                        <Input
                                            type="file"
                                            accept="image/*,.pdf"
                                            onChange={(e) => {
                                                const f =
                                                    e.target
                                                        .files?.[0] ||
                                                    null;
                                                setBankFile(f);
                                            }}
                                            disabled={
                                                isPaid ||
                                                isExpired
                                            }
                                        />
                                        <Button
                                            onClick={
                                                handleBankProofSubmit
                                            }
                                            disabled={
                                                isPaid ||
                                                isExpired ||
                                                creatingPI ||
                                                uploading
                                            }
                                        >
                                            {uploading
                                                ? t(
                                                    "newHk.payment.bankUpload.uploading"
                                                )
                                                : t(
                                                    "newHk.payment.bankUpload.submit"
                                                )}
                                        </Button>
                                    </div>

                                    {app.uploadReceiptUrl ? (
                                        <div className="mt-2 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm font-medium">
                                                    {t(
                                                        "newHk.payment.bankUpload.previewTitle"
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        asChild
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={
                                                            isPaid ||
                                                            isExpired
                                                        }
                                                    >
                                                        <a
                                                            href={
                                                                app.uploadReceiptUrl
                                                            }
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            {t(
                                                                "newHk.payment.bankUpload.openInNewTab"
                                                            )}
                                                        </a>
                                                    </Button>

                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={
                                                            handleDeleteBankProof
                                                        }
                                                        disabled={
                                                            isPaid ||
                                                            isExpired
                                                        }
                                                    >
                                                        {t(
                                                            "newHk.payment.bankUpload.delete"
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="rounded-lg border overflow-hidden">
                                                <iframe
                                                    key={
                                                        app.uploadReceiptUrl
                                                    }
                                                    src={
                                                        app.uploadReceiptUrl
                                                    }
                                                    title="Payment Proof"
                                                    className="w-full h-[420px]"
                                                />
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            )}

                        {app.payMethod === "card" &&
                            !isPaid && (
                                <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="text-sm text-muted-foreground">Currency:</div>
                                        <Select value={String(app.stripeCurrency ?? "USD")} onValueChange={async (val) => {
                                            const newCurrency = String(val || "USD");
                                            setApp((prev: any) => ({ ...prev, stripeCurrency: newCurrency }));

                                            // Recompute and update payment intent if exists
                                            const newGrand = computeUsGrandTotal({ ...app, stripeCurrency: newCurrency });
                                            if (app.paymentIntentId) {
                                                try {
                                                    await updateInvoicePaymentIntent(app.paymentIntentId, { totalCents: Math.round(newGrand * 100), currency: newCurrency });
                                                    setApp((prev: any) => ({ ...prev, paymentIntentCurrency: newCurrency }));
                                                    toast({ title: t("newHk.payment.totals.updated"), description: t("newHk.payment.totals.updatedDesc") });
                                                } catch (err) {
                                                    console.error("Failed to update payment intent:", err);
                                                    toast({ title: t("newHk.payment.totals.updateFailed"), description: t("newHk.payment.totals.tryAgain"), variant: "destructive" });
                                                }
                                            }
                                        }}>
                                            <SelectTrigger className="h-8">
                                                <SelectValue placeholder={t("common.select","Select")} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {currencyOptions.map((o) => (
                                                    <SelectItem key={o.value} value={o.value}>{t(o.label as any, o.label)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="mt-2 sm:mt-0">
                                        <Button
                                            onClick={
                                                handleProceedCard
                                            }
                                            disabled={
                                                isPaid ||
                                                isExpired ||
                                                creatingPI
                                            }
                                        >
                                            {creatingPI
                                                ? t(
                                                    "newHk.payment.card.preparing"
                                                )
                                                : t(
                                                    "newHk.payment.card.proceed"
                                                )}
                                        </Button>
                                        <div className="text-xs text-muted-foreground mt-2">
                                            {isExpired
                                                ? t(
                                                    "newHk.payment.card.disabledExpired"
                                                )
                                                : t(
                                                    "newHk.payment.card.drawerNote"
                                                )}
                                        </div>
                                    </div>
                                </div>
                            )}

                        <div className="text-right font-bold mt-4">
                            {t(
                                "newHk.payment.totals.grandTotal",
                                {
                                    amount:  grand.toFixed(2),
                                    currency:app.stripeCurrency
                                }
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {clientSecret &&
                !isPaid &&
                !isExpired ? (
                <StripeCardDrawer
                    open={cardDrawerOpen}
                    onOpenChange={
                        setCardDrawerOpen
                    }
                    clientSecret={
                        clientSecret
                    }
                    amountUSD={grand}
                    app={app}
                    onSuccess={(info) => {
                        setApp(
                            (prev: any) => ({
                                ...prev,
                                paymentStatus:"paid",
                                stripeLastStatus:
                                    info?.paymentIntentStatus ??
                                    prev.stripeLastStatus,
                                stripeReceiptUrl:
                                    info?.receiptUrl ??
                                    prev.stripeReceiptUrl,
                                stripeAmountCents:
                                    typeof info?.amount ===
                                        "number"
                                        ? info.amount
                                        : prev.stripeAmountCents,
                                stripeCurrency:
                                    info?.currency ??
                                    prev.stripeCurrency,
                                updatedAt:
                                    new Date().toISOString(),
                            })
                        );
                        setCardDrawerOpen(
                            false
                        );
                    }}
                />
            ) : null}
        </>
    );
}

// function CongratsStep() {
//     const navigate = useNavigate();

//     const navigateRoute = () => {
//         localStorage.removeItem("companyRecordId");
//         const decodedToken = jwtDecode<any>(token);
//         if (["admin", "master"].includes(decodedToken.role)) navigate("/admin-dashboard");
//         else navigate("/dashboard");
//     };

//     return (
//         <div className="grid place-items-center gap-4 text-center py-6">
//             <h2 className="text-xl font-extrabold">{t("newHk.congrats.title")}</h2>
//             {/* <p className="text-sm">
//         {t("newHk.congrats.thankYou", { name: namePart })}
//       </p>

//       <div className="grid gap-3 w-full max-w-3xl text-left">
//         {steps.map((x, i) => (
//           <div key={i} className="grid grid-cols-[12px_1fr] gap-3 text-sm">
//             <div className="mt-2 w-3 h-3 rounded-full bg-sky-500" />
//             <div>
//               <b>{x.t}</b>
//               <br />
//               <span className="text-muted-foreground">{x.s}</span>
//             </div>
//           </div>
//         ))}
//       </div> */}

//             <div className="flex items-center gap-2 justify-center">
//                 <Button onClick={navigateRoute}>{t("newHk.congrats.buttons.dashboard")}</Button>
//             </div>
//         </div>
//     );
// }

function CongratsStep() {
    const [app,] = useAtom(usaAppWithResetAtom)
    const { t } = useTranslation();

    const navigate = useNavigate();
    const token = localStorage.getItem("token") as string;
    const decodedToken = jwtDecode<any>(token);

    const navigateRoute = () => {
        localStorage.removeItem("companyRecordId");
        if (["admin", "master"].includes(decodedToken.role)) navigate("/admin-dashboard");
        else navigate("/dashboard");
    };

    const namePart = app.name ? t("newHk.congrats.thankYouName", { applicantName: app.name }) : "";

    const steps = [1, 2, 3, 4].map((i) => ({
        t: t(`Singapore.congrats.steps.${i}.t`),
        s: t(`Singapore.congrats.steps.${i}.s`),
    }));

    return (
        <div className="grid place-items-center gap-4 text-center py-6">
            <h2 className="text-xl font-extrabold">{t("newHk.congrats.title")}</h2>
            <p className="text-sm">
                {t("newHk.congrats.thankYou", { name: namePart })}
            </p>

            <div className="grid gap-3 w-full max-w-3xl text-left">
                {steps.map((x, i) => (
                    <div key={i} className="grid grid-cols-[12px_1fr] gap-3 text-sm">
                        <div className="mt-2 w-3 h-3 rounded-full bg-sky-500" />
                        <div>
                            <b>{x.t}</b>
                            <br />
                            <span className="text-muted-foreground">{x.s}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-2 justify-center">
                <Button onClick={navigateRoute}>{t("newHk.congrats.buttons.dashboard")}</Button>
            </div>
        </div>
    );
}

// ---------- Step config ----------
const usaIncorpConfig: LocalFormConfig = {
    title: "usa.title",
    steps: [
        {
            id: "applicant",
            title: "usa.steps.step1",
            description: "usa.steps.applicant.description",
            type: "fields",
            fields: [
                {
                    type: "text",
                    name: "name",
                    label:
                        "newHk.steps.applicant.fields.applicantName.label",
                    placeholder:
                        "newHk.steps.applicant.fields.applicantName.placeholder",
                    required: true,
                    tooltip:
                        "newHk.steps.applicant.fields.applicantName.tooltip",
                    colSpan: 2,
                },
                {
                    type: "text",
                    name: "companyName_1",
                    label: "usa.AppInfo.usCompName",
                    placeholder: "usa.AppInfo.namePlaceholder",
                    required: true,
                    tooltip: "usa.AppInfo.usCompNamePopup",
                    colSpan: 2,
                },
                {
                    type: "text",
                    name: "companyName_2",
                    label:
                        "newHk.steps.applicant.fields.name2.label",
                    placeholder:
                        "usa.AppInfo.namePlaceholder",
                    required: true,
                    colSpan: 2,
                },
                {
                    type: "text",
                    name: "companyName_3",
                    label:
                        "newHk.steps.applicant.fields.name3.label",
                    placeholder:
                        "usa.AppInfo.namePlaceholder",
                    required: true,
                    colSpan: 2,
                },
                {
                    type: "checkbox-group",
                    name: "establishedRelationshipType",
                    label:
                        "newHk.steps.applicant.fields.roles.label",
                    tooltip:
                        "newHk.steps.applicant.fields.roles.tooltip",
                    // hint: "usa.steps.applicant.fields.relationship.hint",
                    options: [
                        {
                            label:
                                "newHk.steps.applicant.fields.roles.options.Director",
                            value: "Director",
                        },
                        {
                            label:
                                "newHk.steps.applicant.fields.roles.options.Shareholder",
                            value: "Shareholder",
                        },
                        {
                            label:
                                "newHk.steps.applicant.fields.roles.options.Authorized",
                            value: "Authorized",
                        },
                        {
                            label:
                                "newHk.steps.applicant.fields.roles.options.Professional",
                            value: "Professional",
                        },
                        {
                            label:
                                "newHk.steps.applicant.fields.roles.options.Other",
                            value: "Other",
                        },
                    ],
                    required: true,
                    colSpan: 2,
                },
                {
                    type: "text",
                    name: "phoneNum",
                    label:
                        "newHk.steps.applicant.fields.phone.label",
                    placeholder:
                        "newHk.steps.applicant.fields.phone.placeholder",
                    required: false,
                },
                {
                    type: "select",
                    name: "sns",
                    label:
                        "newHk.steps.applicant.fields.sns.label",
                    placeholder:
                        "newHk.steps.applicant.fields.sns.placeholder",
                    options: [
                        {
                            label:
                                "newHk.steps.applicant.fields.sns.options.WhatsApp",
                            value: "WhatsApp",
                        },
                        {
                            label:
                                "newHk.steps.applicant.fields.sns.options.WeChat",
                            value: "WeChat",
                        },
                        {
                            label:
                                "newHk.steps.applicant.fields.sns.options.Line",
                            value: "Line",
                        },
                        {
                            label:
                                "newHk.steps.applicant.fields.sns.options.KakaoTalk",
                            value: "KakaoTalk",
                        },
                        {
                            label:
                                "newHk.steps.applicant.fields.sns.options.Telegram",
                            value: "Telegram",
                        },
                    ],
                    colSpan: 1,
                    required: false,
                },
                {
                    type: "text",
                    name: "snsId",
                    label:
                        "newHk.steps.applicant.fields.snsId.label",
                    placeholder:
                        "newHk.steps.applicant.fields.snsId.placeholder",
                    condition: (f) => !!f.sns,
                },
            ],
        },
        {
            id: "kyc",
            title: "usa.steps.step2",
            description: "newHk.steps.compliance.description",
            type: "fields",
            fields: [
                {
                    type: "radio-group",
                    name: "annualRenewalConsent",
                    label: "usa.AppInfo.amlUsEstablishment",
                    required: true,
                    options: [
                        {
                            label:
                                "newHk.steps.compliance.options.yes",
                            value: "yes",
                        },
                        {
                            label:
                                "newHk.steps.compliance.options.no",
                            value: "no",
                        },
                        {
                            label:
                                "usa.AppInfo.handleOwnIncorpo",
                            value: "self_handle",
                        },
                        {
                            label:
                                "usa.AppInfo.didntIntedEveryYear",
                            value: "no_if_fixed_cost",
                        },
                        {
                            label:
                                "usa.AppInfo.consultationRequired",
                            value: "consultation_required",
                        },
                    ],
                    colSpan: 2,
                },
                {
                    type: "radio-group",
                    name: "legalAndEthicalConcern",
                    label:
                        "newHk.steps.compliance.questions.legalAndEthicalConcern",
                    required: true,
                    options: [
                        {
                            label:
                                "newHk.steps.compliance.options.yes",
                            value: "yes",
                        },
                        {
                            label:
                                "newHk.steps.compliance.options.no",
                            value: "no",
                        },
                        {
                            label:
                                "newHk.steps.compliance.options.unsure",
                            value: "unsure",
                        },
                    ],
                    colSpan: 2,
                },
                {
                    type: "radio-group",
                    name: "q_country",
                    label:
                        "newHk.steps.compliance.questions.q_country",
                    required: true,
                    options: [
                        {
                            label:
                                "newHk.steps.compliance.options.yes",
                            value: "yes",
                        },
                        {
                            label:
                                "newHk.steps.compliance.options.no",
                            value: "no",
                        },
                        {
                            label:
                                "newHk.steps.compliance.options.unsure",
                            value: "unsure",
                        },
                    ],
                    colSpan: 2,
                },
                {
                    type: "radio-group",
                    name: "sanctionsExposureDeclaration",
                    label:
                        "newHk.steps.compliance.questions.sanctionsExposureDeclaration",
                    required: true,
                    options: [
                        {
                            label:
                                "newHk.steps.compliance.options.yes",
                            value: "yes",
                        },
                        {
                            label:
                                "newHk.steps.compliance.options.no",
                            value: "no",
                        },
                        {
                            label:
                                "newHk.steps.compliance.options.unsure",
                            value: "unsure",
                        },
                    ],
                    colSpan: 2,
                },
                {
                    type: "radio-group",
                    name: "crimeaSevastapolPresence",
                    label:
                        "newHk.steps.compliance.questions.crimeaSevastapolPresence",
                    required: true,
                    options: [
                        {
                            label:
                                "newHk.steps.compliance.options.yes",
                            value: "yes",
                        },
                        {
                            label:
                                "newHk.steps.compliance.options.no",
                            value: "no",
                        },
                        {
                            label:
                                "newHk.steps.compliance.options.unsure",
                            value: "unsure",
                        },
                    ],
                    colSpan: 2,
                },
                {
                    type: "radio-group",
                    name: "russianEnergyPresence",
                    label:
                        "newHk.steps.compliance.questions.russianEnergyPresence",
                    required: true,
                    options: [
                        {
                            label:
                                "newHk.steps.compliance.options.yes",
                            value: "yes",
                        },
                        {
                            label:
                                "newHk.steps.compliance.options.no",
                            value: "no",
                        },
                        {
                            label:
                                "newHk.steps.compliance.options.unsure",
                            value: "unsure",
                        },
                    ],
                    colSpan: 2,
                },
            ],
        },
        {
            id: "company",
            title: "usa.steps.step3",
            description: "usa.steps.company.description",
            type: "sections",
            sections: [
                {
                    kind: "fields",
                    asideTitle: "usa.compInfo.infoHeading",
                    fields: [
                        {
                            type: "select",
                            name: "selectedEntity",
                            label: "usa.usCompanyEntity",
                            required: true,
                            placeholder: "common.select",
                            options: [
                                {
                                    label:
                                        "LLC (limited liability company)",
                                    value:
                                        "LLC (limited liability company)",
                                },
                                {
                                    label: "Corporation",
                                    value: "Corporation",
                                },
                                {
                                    label:
                                        "Consultation required before proceeding",
                                    value:
                                        "Consultation required before proceeding",
                                },
                            ],
                            colSpan: 2,
                        },
                        {
                            type: "search-select" as any,
                            name: "selectedState",
                            label: "usa.Section2StateQuestion",
                            required: true,
                            placeholder: "common.select",
                            items: usaList,
                            colSpan: 2,
                        },
                    ],
                },
                {
                    kind: "fields",
                    asideTitle: "usa.bInfo.bInfoHeading",
                    asideText: "usa.bInfo.bInfoPara",
                    fields: [
                        {
                            type: "checkbox-group",
                            name: "selectedIndustry",
                            label:
                                "usa.bInfo.selectIndustryItems",
                            required: true,
                            options: [
                                {
                                    label:
                                        "usa.bInfo.iList.1",
                                    value:
                                        "cryptocurrency-related",
                                },
                                {
                                    label:
                                        "usa.bInfo.iList.2",
                                    value:
                                        "development-of-it-blockchain",
                                },
                                {
                                    label:
                                        "usa.bInfo.iList.3",
                                    value:
                                        "cryptocurrency-based-investment",
                                },
                                {
                                    label:
                                        "usa.bInfo.iList.4",
                                    value:
                                        "cryptocurrency-based-games",
                                },
                                {
                                    label:
                                        "usa.bInfo.iList.5",
                                    value:
                                        "foreign-exchange-trading",
                                },
                                {
                                    label:
                                        "usa.bInfo.iList.6",
                                    value:
                                        "finance-investment-advisory-loan",
                                },
                                {
                                    label:
                                        "usa.bInfo.iList.7",
                                    value:
                                        "trade-industry",
                                },
                                {
                                    label:
                                        "usa.bInfo.iList.8",
                                    value:
                                        "wholesaleretail-distribution-industry",
                                },
                                {
                                    label:
                                        "usa.bInfo.iList.9",
                                    value: "consulting",
                                },
                                {
                                    label:
                                        "usa.bInfo.iList.10",
                                    value:
                                        "manufacturing",
                                },
                                {
                                    label:
                                        "usa.bInfo.iList.11",
                                    value:
                                        "online-service-industry-e-commerce",
                                },
                                {
                                    label:
                                        "usa.bInfo.iList.12",
                                    value:
                                        "online-direct-purchasedeliverypurchase-agency",
                                },
                                {
                                    label:
                                        "usa.bInfo.pList.8",
                                    value: "other",
                                },
                            ],
                            colSpan: 2,
                        },
                        {
                            type: "text",
                            name: "otherIndustryText",
                            label:
                                "usa.bInfo.pList.8",
                            placeholder:
                                "usa.AppInfo.namePlaceholder",
                            condition: (f) =>
                                Array.isArray(f.selectedIndustry) && f.selectedIndustry.includes("other"),
                            colSpan: 2,
                        },
                        {
                            type: "text",
                            name: "descriptionOfProducts",
                            label:
                                "usa.bInfo.descProductName",
                            placeholder:
                                "usa.AppInfo.namePlaceholder",
                            required: true,
                            colSpan: 2,
                        },
                        {
                            type: "text",
                            name: "descriptionOfBusiness",
                            label: "usa.bInfo.descBusinessInfo",
                            placeholder: "usa.AppInfo.namePlaceholder",
                            required: true,
                            colSpan: 2,
                        },
                        {
                            type: "text",
                            name: "webAddress",
                            label: "usa.bInfo.enterWeb",
                            placeholder: "https://",
                            colSpan: 2,
                        },
                        {
                            type: "checkbox-group",
                            name: "purposeOfEstablishmentCompany",
                            label: "usa.bInfo.purposeEstablish",
                            required: true,
                            options: [
                                {
                                    label: "usa.bInfo.pList.1",
                                    value: "business-diversification-through-regulatory",
                                },
                                {
                                    label: "usa.bInfo.pList.2",
                                    value: "a-legal-advisor-investor-or-business-partner-suggests-forming-a-us",
                                },
                                {
                                    label: "usa.bInfo.pList.3",
                                    value: "expanding-business-into-various-overseas-countries",
                                },
                                {
                                    label: "usa.bInfo.pList.4",
                                    value: "asset-management-by-investing-in-real-estate-or-financial",
                                },
                                {
                                    label: "usa.bInfo.pList.5",
                                    value: "as-a-holding-company-the-purpose-is-to-invest-in-and-manage-subsidiariesk",
                                },
                                {
                                    label: "usa.bInfo.pList.6",
                                    value: "pursuing-competitive-advantage-through-liberal",
                                },
                                {
                                    label: "usa.bInfo.pList.7",
                                    value: "increased-transaction-volume-due-to-low-tax-rate",
                                },
                                {
                                    label: "usa.bInfo.pList.8",
                                    value: "other",
                                },
                            ],
                            colSpan: 2,
                        },
                        {
                            type: "text",
                            name: "otherCompanyPurposeText",
                            label:
                                "usa.bInfo.pList.8",
                            placeholder:
                                "usa.AppInfo.namePlaceholder",
                            condition: (f) =>
                                Array.isArray(f.purposeOfEstablishmentCompany) && f.purposeOfEstablishmentCompany.includes("other"),
                            colSpan: 2,
                        },
                    ],
                },
                {
                    kind: "widget",
                    widget: "shareholders",
                    asideTitle: "usa.bInfo.shrldSection.heading",
                    asideText: "usa.bInfo.shrldSection.para",
                },
                {
                    kind: "widget",
                    widget: "custom-dcp",
                    asideTitle: "newHk.company.fields.dcpName.label",
                    tooltip: "usa.bInfo.shrldSection.desgnToolTip"
                },
                {
                    kind: "fields",
                    // asideTitle: "usa.bInfo.shrldSection.heading",
                    // asideText: "usa.bInfo.shrldSection.para",
                    fields: [
                        {
                            type: "select-custom",
                            name: "beneficialOwner",
                            label: "usa.bInfo.shrldSection.benificialOwner",
                            placeholder: "usa.bInfo.shrldSection.selectBenificial",
                            required: true,
                            options: [],
                            colSpan: 2,
                        },
                    ],
                },
                {
                    kind: "fields",
                    asideTitle: "usa.bInfo.accountHeading",
                    asideText: "usa.bInfo.accountingAddress",
                    fields: [
                        {
                            type: "text",
                            name: "accountingDataAddress",
                            label: "usa.bInfo.enterAddress",
                            placeholder: "usa.AppInfo.namePlaceholder",
                            colSpan: 2,
                        },
                    ],
                },
            ],
        },
        // Engagement terms
        {
            id: "agreement",
            title: "usa.steps.step4",
            description:
                "usa.steps.agreement.description",
            render: () => (
                <React.Suspense
                    fallback={
                        <div className="text-sm text-muted-foreground">
                            Loading…
                        </div>
                    }
                >
                    <EngagementTerms />
                </React.Suspense>
            ),
        },
        // Service selection
        {
            id: "services",
            title: "usa.steps.step5",
            description:
                "usa.steps.services.description",
            render: () => <UsServiceSelectionStep />,
        },
        // Invoice / total summary
        {
            id: "invoice",
            title: "usa.steps.step6",
            description:
                "usa.steps.invoice.description",
            render: () => <InvoiceUsStep />,
        },
        // Payment
        {
            id: "payment",
            title: "usa.steps.step7",
            description: "usa.steps.payment.description",
            render: () => <PaymentStep />,
        },
        // Registration details (NEW STEP 8)
        {
            id: "info",
            title: "usa.steps.step8",
            description:
                "usa.steps.info.description",
            render: ({ app, setApp }: any) => (
                <RegistrationDetailsSection
                    app={app}
                    setApp={setApp}
                    canEdit={true}
                />
            ),
        },
        // Incorporation progress / placeholder
        {
            id: "incorp",
            title: "usa.steps.step9",
            description: "usa.steps.incorp.description",
            render: () => <CongratsStep />,
        },
    ],
};

// ---------- Extra validation for step1 ----------
function step1Missing(form: any, fields: FieldBase[]) {
    const base = requiredMissing(form, fields);
    if (!String(form.email || "").trim())
        base.push("usa.AppInfo.emailPlaceholder");
    // if ( String(form.email || "").trim() &&  !form.emailOtpVerified ) base.push("usa.email.otpRequired");
    return base;
}

// ---------- Top bar, sidebar, placeholder ----------
function TopBar({ title, total, idx, }: {
    title: string;
    total: number;
    idx: number;
}) {
    const { t } = useTranslation();
    const pct = Math.round(
        ((idx + 1) / total) * 100
    );
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
                <div className="text-lg sm:text-xl font-extrabold truncate">
                    {t(
                        title as any,
                        "Company Incorporation — USA"
                    )}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                    {t(
                        "newHk.infoHelpIcon",
                        "Complete each step. Helpful tips (ⓘ) appear where terms may be unclear."
                    )}
                </div>
            </div>
            <div className="w-full sm:w-72 shrink-0">
                <Progress value={pct} />
                <div className="text-right text-xs text-muted-foreground mt-1">
                    {t(
                        "newHk.topbar.stepOf",
                        {
                            current: idx + 1,
                            total,
                        }
                    )}
                </div>
            </div>
        </div>
    );
}

function Sidebar({ steps, idx, 
    // goto, 
    canProceedFromCurrent, }: {
    steps: AnyStep[];
    idx: number;
    // goto: (i: number) => void;
    canProceedFromCurrent: boolean;
}) {
    const { t } = useTranslation();

    const canJumpTo = (target: number) => {
        if (target === idx) return true;
        if (target < idx) return true;
        if (!canProceedFromCurrent) return false;
        return true;
    };
    return (
        <aside className="space-y-3 sticky top-0 h-[calc(100vh-2rem)] overflow-auto p-0 lg:block">
            <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded bg-red-600 shrink-0" />
                <div className="text-[11px] sm:text[13px] tracking-wide font-semibold truncate">
                    {t(
                        "newHk.sidebar.brand",
                        "MIRR ASIA — USA"
                    )}
                </div>
            </div>
            <div className="text-xs text-muted-foreground">
                <div className="flex flex-wrap gap-1">
                    <span className="inline-flex items-center gap-1 border rounded-full px-2 py-1 text-[10px] sm:text-xs">
                        {t(
                            "newHk.sidebar.badges.ssl",
                            "SSL"
                        )}
                    </span>
                    <span className="inline-flex items-center gap-1 border rounded-full px-2 py-1 text-[10px] sm:text-xs">
                        {t(
                            "newHk.sidebar.badges.aml",
                            "AML/KYC"
                        )}
                    </span>
                    <span className="inline-flex items-center gap-1 border rounded-full px-2 py-1 text-[10px] sm:text-xs">
                        {t(
                            "newHk.sidebar.badges.registry",
                            "Secure"
                        )}
                    </span>
                </div>
            </div>

            <div className="space-y-1 mt-3">
                {steps.map((s, i) => {
                    const enabled = canJumpTo(i);
                    return (
                        <button
                            key={s.id}
                            // onClick={() =>
                            //     enabled && goto(i)
                            // }
                            disabled={!enabled}
                            className={cn(
                                "w-full text-left rounded-lg border p-2 sm:p-3 transition touch-manipulation",
                                i === idx
                                    ? "border-primary bg-accent/10"
                                    : "hover:bg-accent/10",
                                !enabled &&
                                "opacity-60 cursor-not-allowed"
                            )}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <div className="font-semibold text-xs sm:text-sm truncate">
                                    {i + 1}.{" "}
                                    {t(
                                        s.title as any,
                                        s.title
                                    )}
                                </div>
                                {i < idx && (
                                    <Badge
                                        variant="secondary"
                                        className="shrink-0 text-xs"
                                    >
                                        {t("usa.sidebar.done", "Done")}
                                    </Badge>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </aside>
    );
}

function Placeholder({ title }: { title: string }) {
    const { t } = useTranslation();
    return (
        <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
                {t(
                    "usa.placeholder",
                    "Placeholder step"
                )}{" "}
                —{" "}
                {t("usa.placeholder.cta", 'click "Next" to continue.')}{" "}
                ({t(title)})
            </CardContent>
        </Card>
    );
}

// ---------- Main unified component ----------
export default function ConfigDrivenUSAForm() {
    const { t } = useTranslation();
    const [idx, setIdx] = React.useState(0);
    const [form, setForm] = useAtom(usaAppWithResetAtom);
    const [sidebarOpen, setSidebarOpen] = React.useState(false);
    const [corpVsLlcOpen, setCorpVsLlcOpen] = React.useState(false);

    const goto = (i: number) => setIdx(Math.max(0, Math.min(usaIncorpConfig.steps.length - 1, i)));

    const step = usaIncorpConfig.steps[idx];

    // inject dynamic shareholder options into "company" step
    const hydrateDynamicOptions = (s: AnyStep) => {
        if (!hasType(s) || s.type !== "sections")
            return s;
        const shOptions = (Array.isArray(form.shareHolders) ? form.shareHolders : []).map((sh: any, i: number) => ({
            label: sh?.name || `#${i + 1}`,
            value: sh?.name || `#${i + 1}`,
        }));

        const patchedSections = s.sections.map((sec) => {
            if (sec.kind === "fields") {
                const fields =
                    sec.fields?.map((f) => {
                        if (
                            (f.name === "designatedContact" || f.name === "beneficialOwner") && (!f.options || f.options.length === 0)
                        ) {
                            return { ...f, options: shOptions, };
                        }
                        return f;
                    }) || [];
                return {
                    ...sec,
                    fields,
                };
            }
            return sec;
        });
        return { ...s, sections: patchedSections, };
    };

    const activeStep = hasType(step) && step.type === "sections" ? (hydrateDynamicOptions(step) as AnyStep) : step;

    // Validation for current step
    const stepMissing = React.useMemo(() => {
        if (hasType(activeStep) && activeStep.type === "fields") {
            if (activeStep.id === "applicant")
                return step1Missing(form, activeStep.fields);
            return requiredMissing(form, activeStep.fields);
        }
        if (hasType(activeStep) && activeStep.type === "sections") {
            const allFields =
                activeStep.sections.filter(
                    (sec): sec is Extract<SectionDef, { kind: "fields" }> => sec.kind === "fields").flatMap((sec) => sec.fields);
            return requiredMissing(form, allFields);
        }
        return [];
    }, [activeStep, form]);
    const decodedToken = jwtDecode<any>(token);
    // console.log("decodedToken",decodedToken)
    const canNext = true;
    const updateDoc = async () => {
        // const docId = localStorage.getItem("companyRecordId");
        const payload = { ...form };
        // console.log("payload before adjustment", payload.userId);
        if (!payload.userId) {
            payload.userId = decodedToken.userId;
            payload.users = [{ "userId": decodedToken.userId, "role": "applicant" }];
        } else {
            // If userId exists but belongs to someone else, do NOT override
            if (payload.userId !== decodedToken.userId) {
                // Just leave it as is — do nothing
            } else {
                // Same user — keep as is or update (your choice)
            }
        }
        console.log("idx",idx)
        if (idx === 1) payload.isDisabled = true;
        // console.log("formdata", formData)
         
        try {
            const response = await api.post("/company/usa-form", payload);
            if (response.status === 200) {
                // console.log("formdata", response.data);
                localStorage.setItem("companyRecordId", response.data.data._id);
                setForm(response.data.data)
                window.history.pushState({}, "", `/company-register/US/${response.data.data._id}`);
            } else {
                console.log("error-->", response);
            }
        } catch (error) {
            console.error("Submission error:", error);
        } finally {
            // setIsSubmitting(false);
        }
    }

    const handleNext = async () => {
        // console.log("Next clicked", form);
        // console.log("stepMissing", stepMissing)
        if (stepMissing.length > 0) {
            toast({
                title: t("usa.validation.missingFieldsTitle", "Please complete all required fields before proceeding."),
                description: t(
                    "usa.validation.missingFieldsDescription",
                    "The following required fields are missing: {{fields}}",
                    { fields: unique(stepMissing.map((k) => t(k as any, k))).join(", "), }
                ),
                variant: "destructive",

            })
            return
        }
        else if (idx == 1) {
            const rcActivity = form.sanctionsExposureDeclaration
            const rcSanctions = form.q_country
            const bsnsCremia = form.crimeaSevastapolPresence
            const involved = form.russianEnergyPresence
            const legalInfo = form.legalAndEthicalConcern

            const annualRenew = form.annualRenewalConsent
            const values = [rcActivity, rcSanctions, bsnsCremia, involved, legalInfo, annualRenew];
            // console.log('\n rcActivity==>',rcActivity, '\n rcSanctions==>',rcSanctions,'\n bsnsCremia==>', bsnsCremia,'\n involved==>',  involved,'\n legalInfo==>', legalInfo, '\n annualRenew==>',annualRenew)

            if (values.some(value => value.value === "")) {
                toast({
                    title: "Incomplete Information",
                    description: "Please complete all fields before proceeding.",
                });
                return;
            }
            if (rcActivity == 'no' && rcSanctions == 'no' && bsnsCremia == 'no' && involved == 'no' && legalInfo == 'no' && ['yes', 'self_handle'].includes(annualRenew)) {
                await updateDoc();
                goto(idx + 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                // setFormData({ ...formData, confirmationBusinessIntention: true });
                await updateDoc();
                toast({
                    title: "Consultation required before proceeding",
                    description: "It appears that you need to consult before proceeding. We will review the content of your reply and our consultant will contact you shortly. Thank you very much.",
                });
                return
            }
        }
        else if (idx === 2) {
            const emptyNameShareholders = form.shareHolders.filter(
                (shareholder: any) => !shareholder.name.trim()
            );
            if(!form.partyInvited ) {
                toast({ title: "Shareholders/Directors Members Invitation Pending", description: "Please invite Shareholders/Directors Members before proceeding Next" });
                return 
            }
            if (emptyNameShareholders.length > 0) {
                toast({
                    title: "Fill Details (Shareholder(s) / Director(s)), State, designated Contact",
                    description: "Fill the required fields Shareholder(s) / Director(s)",
                });
            } else {
                await updateDoc();
                goto(idx + 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        }
        else if(idx == 6 && form.paymentStatus !== "paid"){
            toast({ title: "Payment Pending", description: "Please complete the payment before proceeding Next" });
            return
        }
        else {
            await updateDoc()
            goto(idx + 1);
        }
    };

    const renderApplicant = (s: Extract<StepDef, { type: "fields" }>) => (
        <Card>
            <CardContent className="pt-6 space-y-4">
                <div className="border border-dashed rounded-lg p-3 bg-muted/20 text-xs sm:text-sm">
                    {t(
                        "usa.steps.applicant.note",
                        "Provide your details and at least three proposed company names. Verify your email via OTP to proceed."
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <EmailWithOtp />
                    {s.fields.map((f) => (
                        <Field
                            key={f.name}
                            field={f}
                            form={form}
                            setForm={setForm}
                        />
                    ))}
                </div>

                {stepMissing.length > 0 && (
                    <div className="text-xs sm:text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                        <strong>
                            {t(
                                "usa.validation.requiredFieldsPrefix",
                                "Required:"
                            )}
                        </strong>{" "}
                        {unique(
                            stepMissing.map((k) =>
                                t(k as any, k)
                            )
                        ).join(", ")}
                    </div>
                )}
            </CardContent>
        </Card>
    );

    const renderFieldsStep = (s: Extract<StepDef, { type: "fields" }>) => (
        <Card>
            <CardContent className="pt-6 space-y-4">
                {s.description && (
                    <div className="border border-dashed rounded-lg p-3 bg-muted/20 text-xs sm:text-sm">
                        {t(
                            s.description as any,
                            s.description
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {s.fields.map((f) => (
                        <Field
                            key={f.name}
                            field={f}
                            form={form}
                            setForm={setForm}
                        />
                    ))}
                </div>

                {stepMissing.length > 0 && (
                    <div className="text-xs sm:text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                        <strong>
                            {t(
                                "usa.validation.requiredFieldsPrefix",
                                "Required:"
                            )}
                        </strong>{" "}
                        {unique(
                            stepMissing.map((k) =>
                                t(k as any, k)
                            )
                        ).join(", ")}
                    </div>
                )}
            </CardContent>
        </Card>
    );
    const renderSectionsStep = (s: Extract<StepDef, { type: "sections" }>) => (
        <>
            <Card>
                <CardContent className="pt-6 space-y-6">
                    {s.sections.map((sec, i) => (
                        <SectionRenderer
                            key={i}
                            section={sec}
                            form={form}
                            setForm={setForm}
                            setOpenDialog={
                                setCorpVsLlcOpen
                            }
                        />
                    ))}
                    {stepMissing.length > 0 && (
                        <div className="text-xs sm:text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                            <strong>
                                {t(
                                    "usa.validation.requiredFieldsPrefix",
                                    "Required:"
                                )}
                            </strong>{" "}
                            {unique(
                                stepMissing.map(
                                    (k) =>
                                        t(
                                            k as any,
                                            k
                                        )
                                )
                            ).join(", ")}
                        </div>
                    )}
                </CardContent>
            </Card>

            <CorpVsLlcDialog
                open={corpVsLlcOpen}
                onOpenChange={
                    setCorpVsLlcOpen
                }
            />
        </>
    );

    const content = (() => {
        if (hasRender(activeStep)) {
            return (
                <React.Suspense
                    fallback={
                        <div className="text-sm text-muted-foreground">
                            Loading…
                        </div>
                    }
                >
                    {activeStep.render({
                        app: form,
                        setApp: setForm,
                    })}
                </React.Suspense>
            );
        }

        if (hasType(activeStep) && activeStep.type === "fields") {
            if (activeStep.id === "applicant")
                return renderApplicant(activeStep);
            return renderFieldsStep(activeStep);
        }

        if (hasType(activeStep) && activeStep.type === "sections") {
            return renderSectionsStep(activeStep);
        }

        return (
            <Placeholder title={String(t((activeStep as any).title as any, (activeStep as any).title))} />
        );
    })();

    return (
        <div className="max-width mx-auto p-3 sm:p-4 md:p-6 space-y-4">
            <TopBar
                title={usaIncorpConfig.title}
                total={usaIncorpConfig.steps.length}
                idx={idx}
            />
            {/* Mobile sidebar toggle */}
            <div className="lg:hidden">
                <Button
                    variant="outline"
                    onClick={() =>
                        setSidebarOpen(!sidebarOpen)
                    }
                    className="w-full justify-between touch-manipulation"
                >
                    <span>
                        {t(
                            "usa.buttons.stepsMenu",
                            "Steps Menu"
                        )}
                    </span>
                    <span className="text-xs">
                        {t(
                            "newHk.topbar.stepOf",
                            {
                                current: idx + 1,
                                total: usaIncorpConfig.steps.length,
                            }
                        )}
                    </span>
                </Button>
            </div>

            <div className="grid lg:grid-cols-[280px_1fr] gap-4 lg:gap-6">
                {/* Mobile overlay sidebar */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div
                            className="absolute inset-0 bg-black/50"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-background border-r p-4 overflow-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-semibold">
                                    {t(
                                        "usa.sidebar.stepsMenu",
                                        "Steps"
                                    )}
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSidebarOpen(false)}
                                    className="h-8 w-8 p-0"
                                >
                                    {t("usa.sidebar.close", "✕")}
                                </Button>
                            </div>
                            <Sidebar
                                steps={usaIncorpConfig.steps}
                                idx={idx}
                                // goto={(i) => {
                                //     setSidebarOpen(false);
                                //     goto(i);
                                // }}
                                canProceedFromCurrent={canNext}
                            />
                        </div>
                    </div>
                )}

                {/* Desktop sidebar */}
                <div className="hidden lg:block">
                    <Sidebar
                        steps={
                            usaIncorpConfig.steps
                        }
                        idx={idx}
                        // goto={goto}
                        canProceedFromCurrent={
                            canNext
                        }
                    />
                </div>
                {/* Main card */}
                <div className="min-w-0">
                    <Card>
                        <CardHeader className="pb-4 sm:pb-6">
                            <CardTitle className="text-lg sm:text-xl">
                                {idx + 1}.{" "}
                                {String(t((step as any).title as any, (step as any).title))}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 px-4 sm:px-6">
                            {content}
                        </CardContent>
                        <CardFooter className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 sm:pt-6 px-4 sm:px-6">
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Button
                                    variant="outline"
                                    disabled={idx === 0}
                                    onClick={() => goto(idx - 1)}
                                    className="flex-1 sm:flex-none touch-manipulation"
                                >
                                    {t("usa.buttons.back", "← Back")}
                                </Button>
                            </div>
                            <div className="w-full sm:w-auto">
                                <Button
                                    onClick={handleNext}
                                    className="w-full sm:w-auto touch-manipulation"
                                >
                                    {idx <
                                        usaIncorpConfig
                                            .steps
                                            .length -
                                        1
                                        ? t(
                                            "usa.buttons.next",
                                            "Next →"
                                        )
                                        : t(
                                            "usa.buttons.finish",
                                            "Finish"
                                        )}
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// ---------- Section renderer (kept at bottom so it can use Field etc.) ----------
function SectionRenderer({ section, form, setForm, setOpenDialog, }: {
    section: SectionDef; form: any; setForm: (fn: (prev: any) => any) => void;
    setOpenDialog: (v: boolean) => void;
}) {
    const { t } = useTranslation();
    if (section.kind === "fields") {
        return (
            <div className="w-full p-4">
                {section.asideTitle && (
                    <h2
                        className={cn(
                            "text-base md:text-lg font-semibold mb-1",
                            section.asideTitle ===
                            "usa.compInfo.infoHeading" &&
                            "underline cursor-pointer"
                        )}
                        onClick={() => {
                            if (section.asideTitle == "usa.compInfo.infoHeading")
                                setOpenDialog(true);
                        }}
                    >
                        {t(section.asideTitle)}
                    </h2>
                )}
                {section.asideText && (
                    <p className="text-sm text-muted-foreground mb-4">
                        {t(section.asideText)}
                    </p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.fields.map((f) => (
                        <Field
                            key={f.name}
                            field={f}
                            form={form}
                            setForm={setForm}
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (section.kind === "widget" && section.widget === "shareholders") {
        return (
            <div className="w-full p-4">
                <h2 className="text-base md:text-lg font-semibold mb-1">
                    {t(
                        section.asideTitle ||
                        "usa.bInfo.shrldSection.heading"
                    )}
                </h2>
                {section.asideText && (
                    <p className="text-sm text-muted-foreground mb-4">
                        {t(section.asideText)}
                    </p>
                )}
                <ShareholdersWidget
                    form={form}
                    setForm={setForm}
                />
                <Label className="text-lg text-red-600 m-2">
                    {t("newHk.company.fields.inviteText", "Invite Shareholders/Directors Members before proceeding Next")}
                </Label>
            </div>
        );
    }
    // if (section.kind === "widget" && section.widget === "custom-dcp") {
    //     return (
    //         <div className="w-full">
    //             <DcpWidget
    //                 form={form}
    //                 setForm={setForm}
    //             />
    //         </div>
    //     );
    // }
    return null;
}
