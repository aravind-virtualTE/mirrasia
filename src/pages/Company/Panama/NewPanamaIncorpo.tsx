/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo } from "react";
import { useAtom } from "jotai";
import { Trans, useTranslation } from "react-i18next";
import { paFormWithResetAtom1 } from "./PaState";
import { sendEmailOtpforVerification, validateOtpforVerification, sendMobileOtpforVerification, } from "@/hooks/useAuth";
import { sendInviteToShDir } from "@/services/dataFetch";
import { isValidEmail } from "@/middleware";
import { toast, useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, ChevronDown, ChevronUp, HelpCircle, Info, Landmark, Scale, Send, UserIcon, Users, X } from "lucide-react";
import CommonServiceAgrementTxt from "../CommonServiceAgrementTxt";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { StripeSuccessInfo, Tip } from "../NewHKForm/NewHKIncorporation";
import { createInvoicePaymentIntent, deleteIncorpoPaymentBankProof, updateCorporateInvoicePaymentIntent, uploadIncorpoPaymentBankProof } from "../NewHKForm/hkIncorpo";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";
import { TokenData } from "@/middleware/ProtectedRoutes";
import api from "@/services/fetch";
// import { FeeRow } from "../Singapore/SgState";
import SearchSelect, { Item } from "@/components/SearchSelect";
import { currencies } from "../HongKong/constants";
import CustomLoader from "@/components/ui/customLoader";
import { t } from "i18next";
import { money } from "../PanamaFoundation/PaConstants";
import { ROLE_OPTIONS,RoleOption } from "./PaConstants";

const SHARE_TYPES = [
    { id: "ordinary", label: "CompanyInformation.typeOfShare.ordinaryShares" },
    { id: "preference", label: "CompanyInformation.typeOfShare.preferenceShares" },
] as const;
type ShareTypeId = typeof SHARE_TYPES[number]["id"];
const DEFAULT_SHARE_ID: ShareTypeId = "ordinary";

const STRIPE_CLIENT_ID =
    import.meta.env.VITE_STRIPE_DETAILS || process.env.REACT_APP_STRIPE_DETAILS;

const stripePromise = loadStripe(STRIPE_CLIENT_ID);

type FieldType =
    | "text"
    | "email"
    | "number"
    | "textarea"
    | "select"
    | "checkbox"
    | "checkbox-group"
    | "radio-group"
    | "derived"
    | "search-select";

type Option = { label: string; value: string };

type Field = {
    type: FieldType;
    name: string;
    label: string;
    placeholder?: string;
    tooltip?: string;
    hint?: string;
    required?: boolean;
    colSpan?: 1 | 2;
    condition?: (form: any) => boolean;
    options?: Option[];
    rows?: number;
    compute?: (form: any) => string;
    defaultValue?: any;             // easily seed initial value
    disabled?: boolean;             // disable input if needed
    readOnly?: boolean;
    items?: Item[];
};

type Step = { id: string; title: string; description?: string; fields?: Field[]; widget?: "shareholders"; render?: React.ComponentType<{ form: any; setForm: (fn: (p: any) => any) => void }>; };

type FormConfig = { title: string; steps: Step[] };

type YesNoOption = { id: "yes" | "no"; value: string };
type ShareholderDirectorItem = {
    name: string;
    email: string;
    phone: string;
    shares: number;
    role: RoleOption;
    isLegalPerson: YesNoOption;
    invited?: boolean;
    status?: "Invited" | "Not Invited" | "";
    typeOfShare: ShareTypeId;
    isDcp?: boolean;
};

type LegalDirectorItem = {
    shares: number;
    role?: RoleOption;
    isLegalPerson: YesNoOption;
    invited?: boolean;
    status?: "Invited" | "Not Invited" | "";
};

const YES_NO: YesNoOption[] = [
    { id: "yes", value: "AmlCdd.options.yes" },
    { id: "no", value: "AmlCdd.options.no" },
];



const PRICE_NS = 1300;
const PRICE_EMI = 400;
const PRICE_BANK = 2000;
const PRICE_CBI = 3880;
const BASE_SETUP_CORP = 3000; // Mirr Asia setup fee + first-year services (corp)

type PanamaQuotePricing = {
    setupBase: number;       // base setup for corp (3,000)
    ndSetup: 0 | 1 | 2 | 3;  // nominee director count for setup
    nsSetup: boolean;        // nominee shareholder (setup)
    optEmi: boolean;         // EMI account opening
    optBank: boolean;        // Panama local bank account opening
    optCbi: boolean;         // Puerto Rico CBI account opening
    nd3ReasonSetup?: string; // reason for selecting 3 NDs
    total: number;           // computed setup total
};
const ND_PRICES: Record<number, number> = {
    0: 0,
    1: 1200,
    2: 1700,
    3: 2200,
};

function PartiesManager() {
    const { toast } = useToast();
    const [form, setForm] = useAtom(paFormWithResetAtom1);

    // hydrate from form state
    const shareholders: ShareholderDirectorItem[] = Array.isArray(form?.shareHolders)
        ? form.shareHolders.map((s: any) => ({
            name: s.name ?? "",
            email: s.email ?? "",
            phone: s.phone ?? "",
            shares: Number(s.shares ?? 0),
            role: s.role?.id ? s.role : { id: "", value: "" },
            isLegalPerson: s.isLegalPerson?.id ? s.isLegalPerson : { id: "no", value: "AmlCdd.options.no" },
            typeOfShare: (s.typeOfShare as ShareTypeId) || DEFAULT_SHARE_ID,
            invited: s.invited ?? false,
            status: s.status ?? "",
            isDcp: s.isDcp ?? false,
        }))
        : [
            {
                name: "",
                email: "",
                phone: "",
                shares: 0,
                role: { id: "", value: "" },
                isLegalPerson: { id: "no", value: "AmlCdd.options.no" },
                typeOfShare: DEFAULT_SHARE_ID,
                invited: false,
                status: "",
                isDcp: false,
            },
        ];

    const legalDirectors: LegalDirectorItem[] = Array.isArray(form?.legalDirectors)
        ? form.legalDirectors.map((l: any) => ({
            shares: Number(l.shares ?? 0),
            role: l.role?.id ? l.role : { id: "", value: "" },
            isLegalPerson: l.isLegalPerson?.id ? l.isLegalPerson : { id: "no", value: "AmlCdd.options.no" },
            invited: l.invited ?? false,
            status: l.status ?? "",
        }))
        : [];

    const setShareholders = (next: ShareholderDirectorItem[]) =>
        setForm((prev: any) => ({ ...prev, shareHolders: next }));
    const setLegalDirectors = (next: LegalDirectorItem[]) =>
        setForm((prev: any) => ({ ...prev, legalDirectors: next }));

    // totals
    const totalShares =
        (form.shareCount === "other"
            ? Number(form.shareOther || 0)
            : Number(form.shareCount || 0)) || 0;

    const allocatedShares =
        shareholders.reduce((s, p) => s + (Number(p.shares) || 0), 0) +
        legalDirectors.reduce((s, p) => s + (Number(p.shares) || 0), 0);

    // UI state
    const [expandedSH, setExpandedSH] = React.useState<number | null>(null);
    const [expandedLD, setExpandedLD] = React.useState<number | null>(null);
    const [isInviting, setIsInviting] = React.useState(false);

    // patch helpers
    const patchShareholder = (i: number, updates: Partial<ShareholderDirectorItem>) => {
        const next = [...shareholders];
        next[i] = { ...next[i], ...updates };
        setShareholders(next);
    };
    const patchLegalDirector = (i: number, updates: Partial<LegalDirectorItem>) => {
        const next = [...legalDirectors];
        next[i] = { ...next[i], ...updates };
        setLegalDirectors(next);
    };

    // add/remove
    const addShareholder = () => {
        const next: ShareholderDirectorItem[] = [
            ...shareholders,
            {
                name: "",
                email: "",
                phone: "",
                shares: 0,
                role: { id: "", value: "" },
                isLegalPerson: { id: "no", value: "AmlCdd.options.no" },
                typeOfShare: DEFAULT_SHARE_ID,
                invited: false,
                status: "",
                isDcp: false,
            },
        ];
        setShareholders(next);
        setExpandedSH(next.length - 1);
    };
    const removeShareholder = (i: number) => {
        const next = shareholders.filter((_, idx) => idx !== i);
        setShareholders(next);
        if (expandedSH === i) setExpandedSH(null);
    };

    const addLegalDirector = () => {
        const next: LegalDirectorItem[] = [
            ...legalDirectors,
            {
                shares: 0,
                role: { id: "", value: "" },
                isLegalPerson: { id: "no", value: "AmlCdd.options.no" },
                invited: false,
                status: "",
            },
        ];
        setLegalDirectors(next);
        setExpandedLD(next.length - 1);
    };
    const removeLegalDirector = (i: number) => {
        const next = legalDirectors.filter((_, idx) => idx !== i);
        setLegalDirectors(next);
        if (expandedLD === i) setExpandedLD(null);
    };

    // invites (shareholders list only, PA)
    const sendInvites = async () => {
        const invites = shareholders
            .filter((p) => p.email && isValidEmail(p.email))
            .map(({ name, email, isLegalPerson, isDcp }) => ({
                name,
                email,
                corporation: isLegalPerson.id, // "yes" | "no"
                isDcp
            }));

        if (!invites.length) {
            toast({
                title: t("newHk.parties.toasts.invalidEmail.title", "No valid emails"),
                description: t("newHk.parties.toasts.invalidEmail.desc", "Add at least one valid email to send invites."),
                variant: "destructive",
            });
            return;
        }

        try {
            setIsInviting(true);
            const docId = typeof window !== "undefined" ? localStorage.getItem("companyRecordId") : form?._id || "";
            const payload = { _id: docId || form?._id || "", inviteData: invites, country: "PA" };
            const res = await sendInviteToShDir(payload);

            const summary = res?.summary ?? { successful: 0, alreadyExists: 0, failed: 0 };

            if (summary.successful > 0 || summary.alreadyExists > 0) {
                setShareholders(
                    shareholders.map((p) => ({
                        ...p,
                        invited: true,
                        status: "Invited",
                    }))
                );
                setForm((prev: any) => ({ ...prev, users: res.users }));

                toast({
                    title: t("newHk.parties.toasts.invite.success.title", "Invitations sent"),
                    description: t("newHk.parties.toasts.invite.success.desc", "Invite emails were sent."),
                });
            }

            if (summary.failed > 0) {
                setShareholders(
                    shareholders.map((p) => ({
                        ...p,
                        status: p.invited ? p.status : ("Not Invited" as const),
                    }))
                );
                setForm((prev: any) => ({ ...prev, users: res.users }));
                toast({
                    title: t("newHk.parties.toasts.invite.failed.title", "Some invites failed"),
                    description: t("newHk.parties.toasts.invite.failed.desc", "Please verify emails and try again."),
                    variant: "destructive",
                });
            }
        } finally {
            setIsInviting(false);
        }
    };

    return (
        <div className="max-width mx-auto p-2 space-y-4">
            {/* Header with Status */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-base font-semibold text-gray-900">
                        {t("newHk.parties.title", "Shareholders / Directors / DCP")}
                    </h2>
                    <p
                        className={cn(
                            "text-sm",
                            totalShares > 0
                                ? allocatedShares === totalShares
                                    ? "text-green-600"
                                    : allocatedShares > totalShares
                                        ? "text-red-600"
                                        : "text-gray-500"
                                : "text-gray-500"
                        )}
                    >
                        {t("newHk.parties.of", "Allocated")} {allocatedShares.toLocaleString()} /{" "}
                        {totalShares.toLocaleString()} {t("newHk.parties.allocated", "shares")}
                    </p>
                </div>
            </div>

            {/* Shareholders/Directors list */}
            <div className="space-y-2">
                {shareholders.map((p, i) => {
                    const isExpanded = expandedSH === i;
                    const shareTypeLabel = SHARE_TYPES.find((s) => s.id === p.typeOfShare)?.label;
                    return (
                        <Card key={`sh-${i}`} className="overflow-hidden transition-all hover:shadow-md">
                            {/* Compact Header */}
                            <div
                                className="p-2 cursor-pointer flex items-center justify-between hover:bg-gray-50"
                                onClick={() => setExpandedSH(isExpanded ? null : i)}
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-100">
                                        <UserIcon className="w-4 h-4 text-blue-600" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900 truncate">
                                                {p.name || t("newHk.parties.new", "New Shareholder/Director")}
                                            </span>
                                            {p.status && (
                                                <span
                                                    className={cn(
                                                        "text-xs px-2 py-0.5 rounded-full",
                                                        p.status === "Invited" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                                                    )}
                                                >
                                                    {p.status}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 truncate">{p.email || t("common.noEmail", "No email")}</p>
                                    </div>

                                    <div className="text-right flex-shrink-0">
                                        <div className="font-semibold text-gray-900">{p.shares.toLocaleString()}</div>
                                        {p.role?.id && <div className="text-xs text-gray-500">{t(p.role.value)}</div>}
                                        {shareTypeLabel && <div className="text-[11px] text-gray-400">{t(shareTypeLabel)}</div>}
                                    </div>
                                </div>

                                <button className="ml-4 p-1 hover:bg-gray-200 rounded" type="button">
                                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
                                </button>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <CardContent className="pt-0 pb-4 px-4 border-t bg-gray-50">
                                    <div className="grid grid-cols-2 gap-3 mt-4">
                                        {/* Name */}
                                        <div className="col-span-2 sm:col-span-1">
                                            <Label className="text-xs text-gray-600 mb-1">{t("panama.sharehldrs", "Shareholder/Director")}</Label>
                                            <Input value={p.name} onChange={(e) => patchShareholder(i, { name: e.target.value })} className="h-9" />
                                        </div>

                                        {/* Email */}
                                        <div className="col-span-2 sm:col-span-1">
                                            <Label className="text-xs text-gray-600 mb-1">{t("ApplicantInfoForm.email", "Email")}</Label>
                                            <Input
                                                type="email"
                                                value={p.email}
                                                onChange={(e) => patchShareholder(i, { email: e.target.value })}
                                                className="h-9"
                                            />
                                        </div>

                                        {/* Phone */}
                                        <div className="col-span-2 sm:col-span-1">
                                            <Label className="text-xs text-gray-600 mb-1">{t("ApplicantInfoForm.phoneNum", "Phone")}</Label>
                                            <Input value={p.phone} onChange={(e) => patchShareholder(i, { phone: e.target.value })} className="h-9" />
                                        </div>

                                        {/* Shares */}
                                        <div className="col-span-2 sm:col-span-1">
                                            <Label className="text-xs text-gray-600 mb-1">{t("CompanyInformation.shares", "Number of Shares")}</Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                step={1}
                                                value={Number.isFinite(p.shares) ? p.shares : 0}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value, 10);
                                                    patchShareholder(i, { shares: Number.isFinite(val) ? val : 0 });
                                                }}
                                                className="h-9"
                                            />
                                        </div>

                                        {/* Role */}
                                        <div className="col-span-2 sm:col-span-1">
                                            <Label className="text-xs text-gray-600 mb-1">{t("panama.role", "Role")}</Label>
                                            <Select
                                                value={p.role?.id || ""}
                                                onValueChange={(id) => {
                                                    const selected = ROLE_OPTIONS.find((r) => r.id === id) || { id: "" as const, value: "" };
                                                    patchShareholder(i, { role: selected });
                                                }}
                                            >
                                                <SelectTrigger className="h-9">
                                                    <SelectValue placeholder={t("common.select", "Select")} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ROLE_OPTIONS.map((r) => (
                                                        <SelectItem key={r.id} value={r.id}>
                                                            {t(r.value)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Type of Share (NEW) */}
                                        <div className="col-span-2 sm:col-span-1">
                                            <Label className="text-xs text-gray-600 mb-1">
                                                {t("CompanyInformation.typeOfShare.label", "Type of Shares")}
                                            </Label>
                                            <Select
                                                value={p.typeOfShare || DEFAULT_SHARE_ID}
                                                onValueChange={(id) => patchShareholder(i, { typeOfShare: id as ShareTypeId })}
                                            >
                                                <SelectTrigger className="h-9">
                                                    <SelectValue placeholder={t("common.select", "Select")} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {SHARE_TYPES.map((opt) => (
                                                        <SelectItem key={opt.id} value={opt.id}>
                                                            {t(opt.label)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Is Legal Person */}
                                        <div className="col-span-2 sm:col-span-1">
                                            <Label className="text-xs text-gray-600 mb-1">{t("CompanyInformation.isLegal", "Is Legal Person?")}</Label>
                                            <Select
                                                value={p.isLegalPerson?.id || "no"}
                                                onValueChange={(id: "yes" | "no") => {
                                                    const selected = YES_NO.find((o) => o.id === id)!;
                                                    patchShareholder(i, { isLegalPerson: selected });
                                                }}
                                            >
                                                <SelectTrigger className="h-9">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {YES_NO.map((o) => (
                                                        <SelectItem key={o.id} value={o.id}>
                                                            {t(o.value)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
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
                                                value={String(p.isDcp ?? false)}
                                                onValueChange={(v) => patchShareholder(i, { isDcp: v === "true", })}
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

                                        {/* Remove */}
                                        <div className="col-span-2 flex justify-end mt-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeShareholder(i)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <X className="w-4 h-4 mr-1" />
                                                {t("newHk.parties.buttons.remove", "Remove")}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    );
                })}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
                <Button onClick={addShareholder} variant="outline" className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    {t("CompanyInformation.addShldrDir", "Add Shareholder/Director")}
                </Button>

                <Button onClick={sendInvites} variant="default" className="flex items-center gap-2 hover:bg-green-700" disabled={isInviting}>
                    {isInviting ? <CustomLoader /> : <Send className="w-4 h-4" />}
                    <span className="ml-1">{t("CompanyInformation.sendInvitation", "Send Invitations")}</span>
                </Button>
            </div>

            {/* Legal Directors header */}
            <div className="mt-4 flex items-center gap-2">
                <div className="w-5 h-5 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Landmark className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">{t("panama.localNominee", "Local Legal Directors")}</h3>
            </div>

            {/* Legal Directors list */}
            <div className="space-y-2">
                {legalDirectors.map((p, i) => {
                    const isExpanded = expandedLD === i;
                    return (
                        <Card key={`ld-${i}`} className="overflow-hidden transition-all hover:shadow-md">
                            {/* Compact Header */}
                            <div
                                className="p-2 cursor-pointer flex items-center justify-between hover:bg-gray-50"
                                onClick={() => setExpandedLD(isExpanded ? null : i)}
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-purple-100">
                                        <Scale className="w-4 h-4 text-purple-700" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900 truncate">
                                                {p.role?.id ? t(p.role.value) : t("panama.addLegalD", "Add Legal Director")}
                                            </span>
                                            {p.status && (
                                                <span
                                                    className={cn(
                                                        "text-xs px-2 py-0.5 rounded-full",
                                                        p.status === "Invited" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                                                    )}
                                                >
                                                    {p.status}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 truncate">
                                            {t("CompanyInformation.isLegal", "Is Legal Person?")}: {t(p.isLegalPerson?.value || "AmlCdd.options.no")}
                                        </p>
                                    </div>

                                    <div className="text-right flex-shrink-0">
                                        <div className="font-semibold text-gray-900">{p.shares.toLocaleString()}</div>
                                    </div>
                                </div>

                                <button className="ml-4 p-1 hover:bg-gray-200 rounded" type="button">
                                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
                                </button>
                            </div>

                            {/* Expanded */}
                            {isExpanded && (
                                <CardContent className="pt-0 pb-4 px-4 border-t bg-gray-50">
                                    <div className="grid grid-cols-2 gap-3 mt-4">
                                        {/* Role */}
                                        <div className="col-span-2 sm:col-span-1">
                                            <Label className="text-xs text-gray-600 mb-1">{t("panama.role", "Role")}</Label>
                                            <Select
                                                value={p.role?.id || ""}
                                                onValueChange={(id) => {
                                                    const selected = ROLE_OPTIONS.find((r) => r.id === id) || { id: "" as const, value: "" };
                                                    patchLegalDirector(i, { role: selected });
                                                }}
                                            >
                                                <SelectTrigger className="h-9">
                                                    <SelectValue placeholder={t("common.select", "Select")} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ROLE_OPTIONS.map((r) => (
                                                        <SelectItem key={r.id} value={r.id}>
                                                            {t(r.value)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Shares */}
                                        <div className="col-span-2 sm:col-span-1">
                                            <Label className="text-xs text-gray-600 mb-1">{t("CompanyInformation.shares", "Number of Shares")}</Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                step={1}
                                                value={Number.isFinite(p.shares) ? p.shares : 0}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value, 10);
                                                    patchLegalDirector(i, { shares: Number.isFinite(val) ? val : 0 });
                                                }}
                                                className="h-9"
                                            />
                                        </div>

                                        {/* Is Legal Person */}
                                        <div className="col-span-2 sm:col-span-1">
                                            <Label className="text-xs text-gray-600 mb-1">{t("CompanyInformation.isLegal", "Is Legal Person?")}</Label>
                                            <Select
                                                value={p.isLegalPerson?.id || "no"}
                                                onValueChange={(id: "yes" | "no") => {
                                                    const selected = YES_NO.find((o) => o.id === id)!;
                                                    patchLegalDirector(i, { isLegalPerson: selected });
                                                }}
                                            >
                                                <SelectTrigger className="h-9">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {YES_NO.map((o) => (
                                                        <SelectItem key={o.id} value={o.id}>
                                                            {t(o.value)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Remove */}
                                        <div className="col-span-2 flex justify-end mt-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeLegalDirector(i)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <X className="w-4 h-4 mr-1" />
                                                {t("newHk.parties.buttons.remove", "Remove")}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    );
                })}
            </div>

            {/* Actions for Legal Directors */}
            <div className="flex items-center justify-between pt-2">
                <Button onClick={addLegalDirector} variant="outline" className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    {t("panama.addLegalD", "Add Legal Director")}
                </Button>
                <div />
            </div>
        </div>
    );
}


const CompanyInfoStep = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useAtom(paFormWithResetAtom1);
    // const [isInviting, setIsInviting] = React.useState(false);

    // seed safe defaults once
    useEffect(() => {
        setFormData((p: any) => {
            const next = { ...p };
            if (next.currency === undefined) next.currency = "USD";
            if (next.capAmount === undefined) next.capAmount = "10000";
            if (next.shareCount === undefined) next.shareCount = "10000";
            if (!Array.isArray(next.selectedIndustry)) next.selectedIndustry = [];
            if (!Array.isArray(next.establishmentPurpose)) next.establishmentPurpose = [];

            return next;
        });
    }, [setFormData]);

    const industries = useMemo(
        () => [
            { id: "trade", value: "Singapore.industries.i1" },
            { id: "wholesale", value: "Singapore.industries.i2" },
            { id: "consulting", value: "Singapore.industries.i3" },
            { id: "manufacturing", value: "Singapore.industries.i4" },
            { id: "investment", value: "Singapore.industries.i5" },
            { id: "ecommerce", value: "Singapore.industries.i6" },
            { id: "online-purchase", value: "Singapore.industries.i7" },
            { id: "it-software", value: "Singapore.industries.i8" },
            { id: "crypto", value: "Singapore.industries.i9" },
            { id: "other", value: "InformationIncorporation.paymentOption_other" },
        ],
        []
    );

    const purposes = useMemo(
        () => [
            { id: "entry-expansion", value: "Singapore.purpose.p1" },
            { id: "asset-management", value: "Singapore.purpose.p2" },
            { id: "holding-company", value: "Singapore.purpose.p3" },
            { id: "proposal", value: "Singapore.purpose.p4" },
            { id: "geographical-benefits", value: "Singapore.purpose.p5" },
            { id: "business-diversification", value: "Singapore.purpose.p6" },
            { id: "competitive-advantage", value: "Singapore.purpose.p7" },
            // { id: "tax-advantage", value: "Singapore.purpose.p8" },
            { id: "capital-gain", value: "Singapore.purpose.p9" },
            { id: "other", value: "InformationIncorporation.paymentOption_other" },
        ],
        []
    );

    const addressList = useMemo(
        () => [
            { id: "mirrasiaAddress", value: "panama.useRegMirProide" },
            { id: "ownAddress", value: "panama.haveSepAddress" },
            { id: "other", value: "InformationIncorporation.paymentOption_other" },
        ],
        []
    );
    const sourceFundingList = [
        { id: "labourIncome", value: t("panama.sourceList.1") },
        { id: "depositsSaving", value: t("panama.sourceList.2") },
        { id: "incomeFromStocks", value: t("panama.sourceList.3") },
        { id: "loans", value: t("panama.sourceList.4") },
        { id: "saleOfCompany", value: t("panama.sourceList.5") },
        { id: "businessDivident", value: t("panama.sourceList.6") },
        { id: "inheritance", value: t("panama.sourceList.7") },
        { id: "other", value: t("InformationIncorporation.paymentOption_other"), },
    ]

    const toggleIndustry = (id: string, on: boolean) => {
        const selected = Array.isArray(formData.selectedIndustry) ? formData.selectedIndustry : [];
        const next = on ? Array.from(new Set([...selected, id])) : selected.filter((x: string) => x !== id);
        setFormData((p: any) => ({ ...p, selectedIndustry: next }));
    };

    const togglePurpose = (id: string, on: boolean) => {
        const selected = Array.isArray(formData.establishmentPurpose) ? formData.establishmentPurpose : [];
        const next = on ? Array.from(new Set([...selected, id])) : selected.filter((x: string) => x !== id);
        setFormData((p: any) => ({ ...p, establishmentPurpose: next }));
    };

    const onChangeBusinessAddress = (value: string) => {
        const sel = addressList.find((i) => t(i.value) === t(value)) || { id: "", value: "" };
        setFormData((p: any) => ({ ...p, businessAddress: sel }));
    };
    const entityOptions = [{ id: 'Yes', value: t('AmlCdd.options.yes') },
    { id: 'No', value: t('AmlCdd.options.no') }, { id: 'Other', value: t('InformationIncorporation.paymentOption_other') }]

    const handlePanamaEntity = (value: string) => {
        const selectedItem = entityOptions.find(item => (item.value) == (value));
        setFormData({ ...formData, panamaEntity: selectedItem || { id: '', value: "" } })
    }

    // const sendInvites = async () => {
    //     const invites = [{ "email": formData.dcpEmail, "name": formData.dcpName }].filter(i => i.email && i.email.includes("@"))

    //     if (!invites.length) {
    //         toast({
    //             title: t("newHk.parties.toasts.invalidEmail.title", "No valid emails"),
    //             description: t("newHk.parties.toasts.invalidEmail.desc", "Add at least one valid email to send invites."),
    //             variant: "destructive",
    //         });
    //         return;
    //     }

    //     try {
    //         setIsInviting(true);
    //         const docId = formData?._id || "";
    //         const payload = { _id: docId, inviteData: invites, country: "PA" };
    //         const res = await sendInviteToShDir(payload);

    //         const summary = res?.summary ?? { successful: 0, alreadyExists: 0, failed: 0 };

    //         if (summary.successful > 0 || summary.alreadyExists > 0) {
    //             setFormData({ ...formData, dcpStatus: "Invited" });
    //             toast({
    //                 title: t("newHk.parties.toasts.invite.success.title", "Invitations sent"),
    //                 description: t("newHk.parties.toasts.invite.success.desc", "Invite emails were sent."),
    //             });
    //         }

    //         if (summary.failed > 0) {
    //             toast({
    //                 title: t("newHk.parties.toasts.invite.failed.title", "Some invites failed"),
    //                 description: t("newHk.parties.toasts.invite.failed.desc", "Please verify emails and try again."),
    //                 variant: "destructive",
    //             });
    //         }
    //     } finally {
    //         setIsInviting(false);
    //     }
    // };
    return (
        <div className="space-y-3 max-width mx-auto">
            {/* Card A */}
            <Card className="shadow-sm border-gray-200">
                <CardContent className="p-6">
                    <div className="space-y-5">
                        <h3 className="text-base font-semibold text-gray-900 border-b pb-2">
                            {t("newHk.company.sections.a")}
                        </h3>
                        <div className="space-y-2">
                            <Label htmlFor="Relation" className="text-sm font-medium text-gray-700">
                                {t("panama.panamaEntity")}
                                <span className="text-red-500 inline-flex">*</span>
                            </Label>
                            <RadioGroup value={formData?.panamaEntity?.value ?? null} onValueChange={(e) => handlePanamaEntity(e)} className="gap-4" >
                                {entityOptions.map(option => (
                                    <div key={option.value} className="flex items-center space-x-2">
                                        <RadioGroupItem value={option.value} id={`bookkeeping-${option.value}`} />
                                        <Label className="font-normal" htmlFor={`bookkeeping-${option.value}`}>
                                            {option.value}
                                        </Label>
                                    </div>
                                ))}
                                {formData?.panamaEntity?.value == "Other" && (
                                    <Input placeholder="Please specify" value={formData.otherPanamaEntity} onChange={(e) => setFormData({ ...formData, otherPanamaEntity: e.target.value })} />
                                )}
                            </RadioGroup>
                            {formData?.panamaEntity?.id === 'Yes' && <div className="space-y-2">
                                <Label htmlFor="entity" className="inline-flex">
                                    {t("panama.descPanamaEntity")} <span className="text-red-500 font-bold ml-1 flex">*</span>
                                </Label>
                                <Input id="entity" placeholder="Descibe entity" className="w-full" value={formData.pEntityInfo} onChange={(e) => setFormData({ ...formData, pEntityInfo: e.target.value })} />
                            </div>}
                        </div>
                        {/* Industry */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                                {t("usa.bInfo.selectIndustryItems")} <span className="text-red-500">*</span>
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {industries.map((ind) => {
                                    const checked = Array.isArray(formData.selectedIndustry) && formData.selectedIndustry.includes(ind.id);
                                    return (
                                        <label
                                            key={ind.id}
                                            className="flex items-center gap-2.5 rounded-md border border-gray-200 px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                                        >
                                            <Checkbox
                                                checked={!!checked}
                                                onCheckedChange={(c) => toggleIndustry(ind.id, c === true)}
                                            />
                                            <span className="text-sm text-gray-700">{t(ind.value)}</span>
                                        </label>
                                    );
                                })}
                            </div>
                            {Array.isArray(formData.selectedIndustry) && formData.selectedIndustry.includes("other") && (
                                <Input
                                    placeholder={t("common.enterValue", "Please specify")}
                                    value={formData.otherIndustryText ?? ""}
                                    onChange={(e) => setFormData((p: any) => ({ ...p, otherIndustryText: e.target.value }))}
                                    className="max-w-md h-9"
                                />
                            )}
                        </div>

                        {/* Product description */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                                {t("Singapore.bInfoDescProdName")} <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                placeholder={t("common.enterValue", "Your answer")}
                                value={formData.productDescription ?? ""}
                                onChange={(e) => setFormData((p: any) => ({ ...p, productDescription: e.target.value }))}
                                className="h-9"
                            />
                        </div>
                        {/* Purpose */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                                {t("panama.purposeSetting")} <span className="text-red-500">*</span>
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {purposes.map((p) => {
                                    const checked = Array.isArray(formData.establishmentPurpose) && formData.establishmentPurpose.includes(p.id);
                                    return (
                                        <label
                                            key={p.id}
                                            className="flex items-center gap-2.5 rounded-md border border-gray-200 px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                                        >
                                            <Checkbox checked={!!checked} onCheckedChange={(c) => togglePurpose(p.id, c === true)} />
                                            <span className="text-sm text-gray-700">{t(p.value)}</span>
                                        </label>
                                    );
                                })}
                            </div>
                            {Array.isArray(formData.establishmentPurpose) && formData.establishmentPurpose.includes("other") && (
                                <Input
                                    placeholder={t("common.enterValue", "Please specify")}
                                    value={formData.otherEstablishmentPurpose ?? ""}
                                    onChange={(e) => setFormData((p: any) => ({ ...p, otherEstablishmentPurpose: e.target.value }))}
                                    className="max-w-md h-9"
                                />
                            )}
                        </div>
                        {/* Secondary industry */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                {t("panama.businessTransactions")}
                                <span className="text-red-500">*</span>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <HelpCircle className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-sm text-sm">
                                        {t("panama.btInfo")}
                                    </TooltipContent>
                                </Tooltip>
                            </Label>
                            <Input
                                placeholder={t("common.enterValue", "Your answer")}
                                value={formData.listCountry ?? ""}
                                onChange={(e) => setFormData((p: any) => ({ ...p, listCountry: e.target.value }))}
                                className="h-9"
                            />
                        </div>

                        {/* Source of funding */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                {t("panama.sourceOfFund")}
                                <span className="text-red-500">*</span>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <HelpCircle className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[500px] text-sm">
                                        {t("panama.sofInfo")}
                                    </TooltipContent>
                                </Tooltip>
                            </Label>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {sourceFundingList.map((opt) => {
                                    const selected = Array.isArray(formData.sourceFunding) ? formData.sourceFunding : [];
                                    const checked = selected.includes(opt.id);

                                    const toggle = (on: boolean) => {
                                        const next = on
                                            ? Array.from(new Set([...selected, opt.id]))
                                            : selected.filter((x: string) => x !== opt.id);
                                        setFormData((p: any) => ({ ...p, sourceFunding: next }));
                                    };

                                    return (
                                        <label
                                            key={opt.id}
                                            className="flex items-center gap-2.5 rounded-md border border-gray-200 px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                                            htmlFor={`sof-${opt.id}`}
                                        >
                                            <Checkbox
                                                id={`sof-${opt.id}`}
                                                checked={!!checked}
                                                onCheckedChange={(c) => toggle(c === true)}
                                            />
                                            <span className="text-sm text-gray-700">
                                                {typeof opt.value === "string" ? t(opt.value) : opt.value}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>

                            {Array.isArray(formData.sourceFunding) && formData.sourceFunding.includes("other") && (
                                <Input
                                    placeholder={t("common.enterValue", "Please specify")}
                                    value={formData.otherSourceFund ?? ""}
                                    onChange={(e) => setFormData((p: any) => ({ ...p, otherSourceFund: e.target.value }))}
                                    className="max-w-md h-9"
                                />
                            )}
                        </div>
                        {/* Business Address */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                {t("panama.regAddress")}
                                <span className="text-red-500">*</span>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <HelpCircle className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-sm text-sm">{t("panama.panamaRegInfo")}</TooltipContent>
                                </Tooltip>
                            </Label>

                            <RadioGroup
                                value={formData.businessAddress ? t(formData.businessAddress.value) : ""}
                                onValueChange={onChangeBusinessAddress}
                                className="space-y-2"
                            >
                                {addressList.map((opt) => (
                                    <div
                                        key={opt.id}
                                        className="flex items-center gap-2.5 rounded-md border border-gray-200 px-3 py-2 hover:bg-gray-50 transition-colors"
                                    >
                                        <RadioGroupItem value={t(opt.value)} id={`addr-${opt.id}`} />
                                        <Label className="font-normal cursor-pointer text-sm text-gray-700" htmlFor={`addr-${opt.id}`}>
                                            {t(opt.value)}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>

                            {formData.businessAddress?.id === "other" && (
                                <Input
                                    placeholder={t("common.enterValue", "Please specify")}
                                    value={formData.otherBusinessAddress ?? ""}
                                    onChange={(e) => setFormData((p: any) => ({ ...p, otherBusinessAddress: e.target.value }))}
                                    className="max-w-md h-9"
                                />
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Card B — styled to match */}
            <Card className="shadow-sm border-gray-200">
                <CardContent className="p-6">
                    <h3 className="text-base font-semibold text-gray-900 border-b pb-2 mb-4">
                        {t("newHk.company.sections.b")}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            field={{
                                type: "search-select",
                                name: "currency",
                                label: "newHk.company.fields.currency.label",
                                required: true,
                                defaultValue: "HKD",
                                items: currencies,
                            }}
                            form={formData}
                            setForm={setFormData}
                        />

                        <FormField
                            field={{
                                type: "select",
                                name: "capAmount",
                                label: "newHk.company.fields.capAmount.label",
                                required: true,
                                defaultValue: "10000",
                                options: [
                                    // { label: "newHk.company.fields.capAmount.options.1", value: "1" },
                                    // { label: "newHk.company.fields.capAmount.options.10", value: "10" },
                                    // { label: "newHk.company.fields.capAmount.options.100", value: "100" },
                                    // { label: "newHk.company.fields.capAmount.options.1000", value: "1000" },
                                    { label: "newHk.company.fields.capAmount.options.10000", value: "10000" },
                                    { label: "50,000", value: "50000" },
                                    { label: "newHk.company.fields.capAmount.options.100000", value: "100000" },
                                    { label: "newHk.company.fields.capAmount.options.other", value: "other" },
                                ],
                            }}
                            form={formData}
                            setForm={setFormData}
                        />

                        <FormField
                            field={{
                                type: "number",
                                name: "capOther",
                                label: "newHk.company.fields.capOther.label",
                                placeholder: "newHk.company.fields.capOther.placeholder",
                                condition: (f) => f.capAmount === "other",
                            }}
                            form={formData}
                            setForm={setFormData}
                        />

                        <FormField
                            field={{
                                type: "select",
                                name: "shareCount",
                                label: "newHk.company.fields.shareCount.label",
                                required: true,
                                defaultValue: "10000",
                                options: [
                                    { label: "newHk.company.fields.capAmount.options.1", value: "1" },
                                    { label: "newHk.company.fields.capAmount.options.10", value: "10" },
                                    { label: "newHk.company.fields.capAmount.options.100", value: "100" },
                                    { label: "newHk.company.fields.capAmount.options.1000", value: "1000" },
                                    { label: "newHk.company.fields.capAmount.options.10000", value: "10000" },
                                    { label: "newHk.company.fields.capAmount.options.100000", value: "100000" },
                                    { label: "newHk.company.fields.shareCount.options.other", value: "other" },
                                ],
                            }}
                            form={formData}
                            setForm={setFormData}
                        />

                        <FormField
                            field={{
                                type: "number",
                                name: "shareOther",
                                label: "newHk.company.fields.shareOther.label",
                                placeholder: "newHk.company.fields.shareOther.placeholder",
                                condition: (f) => f.shareCount === "other",
                            }}
                            form={formData}
                            setForm={setFormData}
                        />

                        <FormField
                            field={{
                                type: "derived",
                                name: "parValue",
                                label: "newHk.company.fields.parValue.label",
                                compute: (f) => {
                                    const currency = f.currency || "HKD";
                                    const total = f.capAmount === "other" ? Number(f.capOther || 0) : Number(f.capAmount || 0);
                                    const shares = f.shareCount === "other" ? Number(f.shareOther || 1) : Number(f.shareCount || 1);
                                    if (!total || !shares) return `${currency} 0.00`;
                                    const pv = total / shares;
                                    return `${currency} ${pv.toFixed(2)}`;
                                },
                                hint: "newHk.company.fields.parValue.hint",
                            }}
                            form={formData}
                            setForm={setFormData}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Card C */}
            <Card className="shadow-sm border-gray-200">
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <h3 className="text-base font-semibold text-gray-900 border-b pb-2">
                            {t("newHk.company.sections.c")}
                        </h3>
                        <PartiesManager />
                    </div>
                    {/* <div className="grid gap-4 mt-4 md:grid-cols-3">
                        <div className="space-y-2 md:col-span-1">
                            <Label className="text-sm font-medium text-gray-700">
                                {t("newHk.company.fields.dcpName.label")}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                placeholder={t("newHk.company.fields.dcpName.placeholder")}
                                value={formData.dcpName ?? ""}
                                onChange={(e) =>
                                    setFormData((p: any) => ({ ...p, dcpName: e.target.value }))
                                }
                                className="h-9"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-1">
                            <Label className="text-sm font-medium text-gray-700">
                                {t("newHk.company.fields.dcpEmail.label")}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                placeholder={t("newHk.company.fields.dcpEmail.placeholder")}
                                value={formData.dcpEmail ?? ""}
                                onChange={(e) =>
                                    setFormData((p: any) => ({ ...p, dcpEmail: e.target.value }))
                                }
                                className="h-9"
                            />
                        </div>
                        <div className="flex items-end gap-3">
                            <div className="flex-1 space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                    {t("newHk.company.fields.dcpNumber.label")}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    placeholder={t("newHk.company.fields.dcpNumber.placeholder")}
                                    value={formData.dcpNumber ?? ""}
                                    onChange={(e) =>
                                        setFormData((p: any) => ({ ...p, dcpNumber: e.target.value }))
                                    }
                                    className="h-9"
                                />
                            </div>
                            <div className="pb-[2px]">
                                <Button
                                    onClick={sendInvites}
                                    variant="default"
                                    className="flex h-9 items-center gap-2 hover:bg-green-700"
                                    disabled={isInviting}
                                >
                                    {isInviting ? <CustomLoader /> : <Send className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>
                    </div> */}
                    <Label className="text-lg text-red-600 m-2">
                        {t("newHk.company.fields.inviteText", "Invite Shareholders/Directors Members before proceeding Next")}
                    </Label>
                </CardContent>
            </Card>
        </div>
    );
};



function computePanamaSetupTotal(p: PanamaQuotePricing): number {
    return (
        p.setupBase +
        ND_PRICES[p.ndSetup] +
        (p.nsSetup ? PRICE_NS : 0) +
        (p.optEmi ? PRICE_EMI : 0) +
        (p.optBank ? PRICE_BANK : 0) +
        (p.optCbi ? PRICE_CBI : 0)
    );
}


const PanamaQuoteSetupStep = () => {
    const [form, setForm] = useAtom(paFormWithResetAtom1);

    // lock if already paid (optional – keep if you use this flag)
    const isLocked = form?.paymentStatus === "paid";

    const initialPricing: PanamaQuotePricing = React.useMemo(
        () => ({
            setupBase: BASE_SETUP_CORP,
            ndSetup: 0,
            nsSetup: false,
            optEmi: false,
            optBank: false,
            optCbi: false,
            nd3ReasonSetup: "",
            total: BASE_SETUP_CORP,
        }),
        []
    );

    const pricing: PanamaQuotePricing = React.useMemo(
        () => ({
            ...initialPricing,
            ...(form?.panamaQuote || {}),
        }),
        [form?.panamaQuote, initialPricing]
    );

    const updatePricing = <K extends keyof PanamaQuotePricing>(
        key: K,
        value: PanamaQuotePricing[K]
    ) => {
        if (isLocked) return;
        const next: PanamaQuotePricing = { ...pricing, [key]: value };
        next.total = computePanamaSetupTotal(next);
        setForm((prev: any) => ({
            ...prev,
            panamaQuote: next,
        }));
    };

    // Ensure total is synced on mount/atom change
    React.useEffect(() => {
        const computed = computePanamaSetupTotal(pricing);
        // console.log("computed",computed)
        if (computed !== pricing.total) {
            setForm((prev: any) => ({
                ...prev,
                totalOriginal: pricing.total,
                panamaQuote: { ...pricing, total: computed },
            }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pricing]);

    const totalSetup = pricing.total;
    // console.log("testing--->", form.totalOriginal, totalSetup)
    return (
        <div className="p-4 space-y-4">
            {/* Title */}
            <h1 className="text-lg sm:text-xl font-bold border-b border-dashed border-slate-200">
                {t("panama.quoteSetup.title")}
            </h1>

            {/* Initial Setup Heading */}
            <h3 className="font-semibold text-base">
                {t("panama.quoteSetup.initialSetupTitle")}
            </h3>

            {/* Locked Banner */}
            {isLocked && (
                <div className="border rounded-xl p-3 text-sm border-amber-200 bg-amber-50 text-amber-900 mb-2">
                    {t("panama.quoteSetup.lockedMessage")}
                </div>
            )}

            {/* Setup package base */}
            <div className="flex items-start justify-between gap-3 py-2 border-b border-dashed border-slate-200">
                <span className="text-sm">
                    {t("panama.quoteSetup.base.label")}
                    <span className="ml-1 text-xs text-slate-500">
                        {t("panama.quoteSetup.base.note")}
                    </span>
                </span>
                <span className="text-sm font-semibold">
                    {money(pricing.setupBase)}
                </span>
            </div>

            {/* Nominee Director (setup) */}
            <div className="flex items-center justify-between gap-3 py-2 border-b border-dashed border-slate-200">
                <Label htmlFor="nd-setup" className="text-sm font-normal whitespace-nowrap">
                    {t("panama.quoteSetup.ndSetup.label")}
                </Label>

                <Select
                    value={String(pricing.ndSetup)}
                    onValueChange={(v) => updatePricing("ndSetup", Number(v) as 0 | 1 | 2 | 3)}
                    disabled={isLocked}
                >
                    <SelectTrigger id="nd-setup" className="w-48">
                        <SelectValue placeholder={t("panama.quoteSetup.ndSetup.placeholder")} />
                    </SelectTrigger>

                    <SelectContent>
                        <SelectItem value="0">{t("panama.quoteSetup.ndSetup.options.0")}</SelectItem>
                        <SelectItem value="1">{t("panama.quoteSetup.ndSetup.options.1")}</SelectItem>
                        <SelectItem value="2">{t("panama.quoteSetup.ndSetup.options.2")}</SelectItem>
                        <SelectItem value="3">{t("panama.quoteSetup.ndSetup.options.3")}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Reason for 3 nominee directors */}
            {pricing.ndSetup === 3 && (
                <div className="mt-2 space-y-1">
                    <Label htmlFor="nd3-reason" className="text-xs">
                        {t("panama.quoteSetup.nd3Reason.label")}
                    </Label>

                    <Textarea
                        id="nd3-reason"
                        placeholder={t("panama.quoteSetup.nd3Reason.placeholder")}
                        value={pricing.nd3ReasonSetup ?? ""}
                        onChange={(e) => updatePricing("nd3ReasonSetup", e.target.value)}
                        disabled={isLocked}
                        className="min-h-[72px]"
                    />

                    <p className="text-[11px] text-muted-foreground">
                        {t("panama.quoteSetup.nd3Reason.hint")}
                    </p>
                </div>
            )}

            {/* Nominee Shareholder (setup) */}
            <div className="flex items-center justify-between gap-3 py-2 border-b border-dashed border-slate-200">
                <div className="flex items-center gap-2">
                    <Checkbox
                        id="ns-setup"
                        checked={pricing.nsSetup}
                        onCheckedChange={(c) => updatePricing("nsSetup", Boolean(c))}
                        disabled={isLocked}
                    />
                    <Label htmlFor="ns-setup" className="text-sm">
                        {t("panama.quoteSetup.nsSetup.label")}
                    </Label>
                </div>

                <span className="text-sm font-semibold">{money(PRICE_NS)}</span>
            </div>

            {/* Optional Services Title */}
            <h4 className="font-medium text-sm mt-3">
                {t("panama.quoteSetup.optional.title")}
            </h4>

            {/* EMI option */}
            <div className="flex items-center justify-between gap-3 py-1">
                <div className="flex items-center gap-2">
                    <Checkbox
                        id="opt-emi"
                        checked={pricing.optEmi}
                        onCheckedChange={(c) => updatePricing("optEmi", Boolean(c))}
                        disabled={isLocked}
                    />
                    <Label htmlFor="opt-emi" className="text-sm">
                        {t("panama.quoteSetup.optional.emi")}
                    </Label>
                </div>
                <span className="text-sm font-semibold">{money(PRICE_EMI)}</span>
            </div>

            {/* Bank account option */}
            <div className="flex items-center justify-between gap-3 py-1">
                <div className="flex items-center gap-2">
                    <Checkbox
                        id="opt-bank"
                        checked={pricing.optBank}
                        onCheckedChange={(c) => updatePricing("optBank", Boolean(c))}
                        disabled={isLocked}
                    />
                    <Label htmlFor="opt-bank" className="text-sm">
                        {t("panama.quoteSetup.optional.bank")}
                    </Label>
                </div>
                <span className="text-sm font-semibold">{money(PRICE_BANK)}</span>
            </div>

            {/* CBI option */}
            <div className="flex items-center justify-between gap-3 py-1">
                <div className="flex items-center gap-2">
                    <Checkbox
                        id="opt-cbi"
                        checked={pricing.optCbi}
                        onCheckedChange={(c) => updatePricing("optCbi", Boolean(c))}
                        disabled={isLocked}
                    />
                    <Label htmlFor="opt-cbi" className="text-sm">
                        {t("panama.quoteSetup.optional.cbi")}
                    </Label>
                </div>
                <span className="text-sm font-semibold">{money(PRICE_CBI)}</span>
            </div>

            {/* Total Setup */}
            <div className="mt-4 flex items-center justify-between rounded-xl bg-[#0e3a8a] text-white px-3 py-2">
                <span className="text-sm font-medium">
                    {t("panama.quoteSetup.totals.setupY1")}
                </span>
                <span className="text-sm font-semibold">
                    {money(totalSetup)}
                </span>
            </div>

            {/* Included List */}
            <div className="mt-4 rounded-xl p-3 text-xs leading-relaxed">
                <b>{t("panama.quoteSetup.includes.title")}</b>

                <ol className="mt-2 list-decimal pl-5 space-y-1">
                    <li>{t("panama.quoteSetup.includes.items.i1")}</li>
                    <li>{t("panama.quoteSetup.includes.items.i2")}</li>
                    <li>{t("panama.quoteSetup.includes.items.i3")}</li>
                    <li>{t("panama.quoteSetup.includes.items.i4")}</li>
                    <li>{t("panama.quoteSetup.includes.items.i5")}</li>
                    <li>{t("panama.quoteSetup.includes.items.i6")}</li>
                    <li>{t("panama.quoteSetup.includes.items.i7")}</li>
                    <li>{t("panama.quoteSetup.includes.items.i8")}</li>
                    <li>{t("panama.quoteSetup.includes.items.i9")}</li>
                    <li>{t("panama.quoteSetup.includes.items.i10")}</li>
                    <li>{t("panama.quoteSetup.includes.items.i11")}</li>
                    <li>{t("panama.quoteSetup.includes.items.i12")}</li>
                    <li>{t("panama.quoteSetup.includes.items.i13")}</li>
                    <li>{t("panama.quoteSetup.includes.items.i14")}</li>
                    <li>{t("panama.quoteSetup.includes.items.i15")}</li>
                    <li>{t("panama.quoteSetup.includes.items.i16")}</li>
                    <li>{t("panama.quoteSetup.includes.items.i17")}</li>
                </ol>
            </div>
        </div>

    );
};

function StripePaymentForm({ app, onSuccess, onClose, }: {
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
                            country: "SG",
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

function StripeCardDrawer({ open, onOpenChange, clientSecret, amountUSD, app, onSuccess }: {
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
                        Grand Total:{" "}
                        <b>USD {amountUSD.toFixed(2)}</b>{" "}
                        {app.payMethod === "card"
                            ? "(incl. 3.5% card fee)"
                            : ""}
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
function asNum(v: any) {
    return typeof v === "number" ? v : Number(v) || 0;
}

function computeSgGrandTotal(app: any): number {
    // Subtotal is whatever the invoice last wrote
    // console.log("App--->",app.totalOriginal)
    const subtotal = asNum(app.panamaQuote?.total ?? 0);

    const cardFeeRate = 0.035;
    const needsCardFee = app?.payMethod === "card";

    const total = needsCardFee ? subtotal * (1 + cardFeeRate) : subtotal;
    return Math.round(total * 100) / 100; // cents-safe
}

const PaymentStep = () => {
    const [form, setForm] = useAtom(paFormWithResetAtom1);
    const { t } = useTranslation();

    // Compute grand total using SG logic
    const grand = computeSgGrandTotal(form);
    // console.log("Computed SG grand total:", grand);
    const isPaid =
        form.paymentStatus === "paid" ||
        form.stripeLastStatus === "succeeded" ||
        form.stripePaymentStatus === "succeeded";

    // Expiry bootstrap (2 days) if not paid
    React.useEffect(() => {
        if (isPaid) return;
        const now = Date.now();
        const current = form.expiresAt ? new Date(form.expiresAt).getTime() : 0;
        if (!current || current <= now) {
            const twoDaysMs = 2 * 24 * 60 * 60 * 1000;
            const expiryISO = new Date(now + twoDaysMs).toISOString();
            setForm((prev: any) => ({
                ...prev,
                expiresAt: expiryISO,
                updatedAt: new Date().toISOString(),
            }));
        }
    }, [isPaid, setForm, form.expiresAt]);

    // Countdown
    const [nowTs, setNowTs] = React.useState(() => Date.now());
    React.useEffect(() => {
        if (isPaid) return;
        const id = window.setInterval(() => setNowTs(Date.now()), 1000);
        return () => window.clearInterval(id);
    }, [isPaid]);

    const expiresTs = form.expiresAt ? new Date(form.expiresAt).getTime() : 0;
    const remainingMs = Math.max(0, expiresTs - nowTs);
    const isExpired = !isPaid && (!expiresTs || remainingMs <= 0);

    const formatRemaining = (ms: number) => {
        const s = Math.floor(ms / 1000);
        const d = Math.floor(s / 86400);
        const h = Math.floor((s % 86400) / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        return d > 0
            ? `${d}d ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
            : `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    };

    // Local UI state
    const [creatingPI, setCreatingPI] = React.useState(false);
    const [uploading, setUploading] = React.useState(false);
    const [bankFile, setBankFile] = React.useState<File | null>(null);
    const [clientSecret, setClientSecret] = React.useState<string | null>(null);
    const [cardDrawerOpen, setCardDrawerOpen] = React.useState(false);

    const guard = (msg: string) => {
        if (isPaid) {
            alert(t("newHk.payment.alerts.alreadyPaid"));
            return true;
        }
        if (isExpired) {
            alert(msg);
            return true;
        }
        return false;
    };

    const handleBankProofSubmit = async () => {
        if (guard(t("newHk.payment.alerts.expiredGuard"))) return;
        if (!bankFile) return;
        setUploading(true);
        try {
            const method = form.payMethod;
            const expiresAt = form.expiresAt || "";
            const result = await uploadIncorpoPaymentBankProof(form._id || "", "PA", bankFile, method, expiresAt);
            if (result) {
                setForm((prev: any) => ({ ...prev, uploadReceiptUrl: result?.url }));
            }
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteBankProof = async () => {
        if (guard(t("newHk.payment.alerts.expiredGuard"))) return;
        await deleteIncorpoPaymentBankProof(form._id || "", "PA");
        setForm((prev: any) => ({ ...prev, uploadReceiptUrl: undefined }));
    };

    const handleProceedCard = async () => {
        if (guard(t("newHk.payment.alerts.expiredGuard"))) return;

        if (clientSecret && form.paymentIntentId) {
            setCardDrawerOpen(true);
            return;
        }
        // console.log("form", form)
        setCreatingPI(true);
        try {
            const fp = {
                companyId: form._id ?? null,
                totalCents: Math.round(grand * 100),
                country: "PA",
            };
            const result = await createInvoicePaymentIntent(fp);

            if (result?.clientSecret && result?.id) {
                setClientSecret(result.clientSecret);
                setForm((prev: any) => ({
                    ...prev,
                    paymentIntentId: result.id,
                    payMethod: "card",
                }));
                setCardDrawerOpen(true);
            } else {
                alert("Could not initialize card payment. Please try again.");
            }
        } catch (e) {
            console.error("PI creation failed:", e);
            alert(t("newHk.payment.alerts.prepareFailedDesc"));
        } finally {
            setCreatingPI(false);
        }
    };

    return (
        <>
            {/* PAID banner */}
            {isPaid && (
                <div className="mb-4 border rounded-md p-3 text-sm bg-emerald-50 border-emerald-200 text-emerald-900">
                    <div className="font-semibold mb-1">{t("newHk.payment.success.title")}</div>
                    <div className="space-y-1">
                        {typeof form.stripeAmountCents === "number" && form.stripeCurrency ? (
                            <div>
                                {t("newHk.payment.success.amountLabel")}{" "}
                                <b>
                                    {form.stripeCurrency.toUpperCase()} {(form.stripeAmountCents / 100).toFixed(2)}
                                </b>
                            </div>
                        ) : null}

                        <div>
                            {form.stripeReceiptUrl ? (
                                <>
                                    {t("newHk.payment.success.receiptLabel")}&nbsp;
                                    <a
                                        href={form.stripeReceiptUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline underline-offset-2"
                                    >
                                        {t("newHk.payment.success.viewStripeReceipt")}
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
                        isExpired ? "border-red-200 bg-red-50 text-red-900" : "border-amber-200 bg-amber-50 text-amber-900",
                    ].join(" ")}
                >
                    {isExpired ? (
                        <div className="font-medium">{t("newHk.payment.expiryBanner.expiredMessage")}</div>
                    ) : (
                        <div className="flex items-center justify-between gap-2">
                            <div className="font-medium">{t("newHk.payment.expiryBanner.timerTitle")}</div>
                            <div className="text-base font-bold tabular-nums">
                                {t("newHk.payment.expiryBanner.timeRemaining", { time: formatRemaining(remainingMs) })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
                {/* LEFT: payment method */}
                <Card>
                    <CardContent className="pt-6 space-y-2">
                        <div className="font-bold">{t("newHk.payment.methods.title")}</div>

                        {[
                            {
                                v: "card",
                                label: t("newHk.payment.methods.options.card.label"),
                                tip: t("newHk.payment.methods.options.card.tip"),
                            },
                            // { v: "fps", label: t("newHk.payment.methods.options.fps.label") },
                            { v: "bank", label: t("newHk.payment.methods.options.bank.label") },
                            { v: "other", label: t("newHk.payment.methods.options.other.label") },
                        ].map((o) => (
                            <label key={o.v} className="block space-x-2">
                                <input
                                    type="radio"
                                    name="pay"
                                    value={o.v}
                                    checked={form.payMethod === o.v}
                                    onChange={() =>
                                        setForm((prev: any) => ({
                                            ...prev,
                                            payMethod: o.v,
                                        }))
                                    }
                                    disabled={isPaid || isExpired}
                                />
                                <span className={isPaid || isExpired ? "text-muted-foreground" : ""}>{o.label}</span>
                                {o.tip && !(isPaid || isExpired) ? (
                                    <span className="inline-flex ml-1">
                                        <Tip text={o.tip} />
                                    </span>
                                ) : null}
                            </label>
                        ))}

                        {(isPaid || isExpired) && (
                            <div className="mt-2 text-xs text-muted-foreground">
                                {isPaid ? t("newHk.payment.methods.statusNote.paid") : t("newHk.payment.methods.statusNote.expired")}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* RIGHT: proof/card upload + totals */}
                <Card>
                    <CardContent className="pt-6 space-y-2">
                        <div className="font-bold">{t("newHk.payment.conditions.title")}</div>
                        <p className="text-sm">
                            <Trans i18nKey="newHk.payment.conditions.text">
                                100% advance payment. All payments are non-refundable. The remitter bears all bank charges (including
                                intermediary bank fees).
                            </Trans>
                        </p>

                        {["bank", "other", "fps"].includes(form.payMethod) && (
                            <div className="mt-4 grid gap-3">
                                <div className="grid gap-2">
                                    <Label>{t("newHk.payment.bankUpload.refLabel")}</Label>
                                    <Input
                                        placeholder={t("newHk.payment.bankUpload.refPlaceholder")}
                                        value={form.bankRef || ""}
                                        onChange={(e) =>
                                            setForm((prev: any) => ({
                                                ...prev,
                                                bankRef: e.target.value,
                                            }))
                                        }
                                        disabled={isPaid || isExpired}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label>{t("newHk.payment.bankUpload.proofLabel")}</Label>
                                    <Input
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={(e) => {
                                            const f = e.target.files?.[0] || null;
                                            setBankFile(f);
                                        }}
                                        disabled={isPaid || isExpired}
                                    />
                                    <Button onClick={handleBankProofSubmit} disabled={isPaid || isExpired || creatingPI || uploading}>
                                        {uploading ? t("newHk.payment.bankUpload.uploading") : t("newHk.payment.bankUpload.submit")}
                                    </Button>
                                </div>

                                {form.uploadReceiptUrl ? (
                                    <div className="mt-2 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm font-medium">{t("newHk.payment.bankUpload.previewTitle")}</div>
                                            <div className="flex items-center gap-2">
                                                <Button asChild variant="outline" size="sm" disabled={isPaid || isExpired}>
                                                    <a href={form.uploadReceiptUrl} target="_blank" rel="noopener noreferrer">
                                                        {t("newHk.payment.bankUpload.openInNewTab")}
                                                    </a>
                                                </Button>

                                                <Button variant="destructive" size="sm" onClick={handleDeleteBankProof} disabled={isPaid || isExpired}>
                                                    {t("newHk.payment.bankUpload.delete")}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="rounded-lg border overflow-hidden">
                                            <iframe key={form.uploadReceiptUrl} src={form.uploadReceiptUrl} title="Payment Proof" className="w-full h-[420px]" />
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        )}

                        {form.payMethod === "card" && !isPaid && (
                            <div className="mt-3">
                                <Button onClick={handleProceedCard} disabled={isPaid || isExpired || creatingPI}>
                                    {creatingPI ? t("newHk.payment.card.preparing") : t("newHk.payment.card.proceed")}
                                </Button>
                                <div className="text-xs text-muted-foreground mt-2">
                                    {isExpired ? t("newHk.payment.card.disabledExpired") : t("newHk.payment.card.drawerNote")}
                                </div>
                            </div>
                        )}

                        <div className="text-right font-bold mt-4">
                            {t("newHk.payment.totals.grandTotal", { amount: grand.toFixed(2) })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {clientSecret && !isPaid && !isExpired ? (
                <StripeCardDrawer
                    open={cardDrawerOpen}
                    onOpenChange={setCardDrawerOpen}
                    clientSecret={clientSecret}
                    amountUSD={grand}
                    app={form}
                    onSuccess={(info) => {
                        setForm((prev: any) => ({
                            ...prev,
                            paymentStatus: info?.paymentIntentStatus === "succeeded" ? "paid" : prev.paymentStatus,
                            stripeLastStatus: info?.paymentIntentStatus ?? prev.stripeLastStatus,
                            stripeReceiptUrl: info?.receiptUrl ?? prev.stripeReceiptUrl,
                            stripeAmountCents: typeof info?.amount === "number" ? info.amount : prev.stripeAmountCents,
                            stripeCurrency: info?.currency ?? prev.stripeCurrency,
                            updatedAt: new Date().toISOString(),
                        }));
                        setCardDrawerOpen(false);
                    }}
                />
            ) : null}
        </>
    );
};

function CongratsStep() {
    const [app,] = useAtom(paFormWithResetAtom1)
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
        t: t(`panama.congrats.steps.${i}.t`),
        s: t(`panama.congrats.steps.${i}.s`),
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

const CONFIG: FormConfig = {
    title: "panama.title",
    steps: [
        {
            id: "applicant",
            title: "ppif.section1",
            fields: [
                {
                    type: "text",
                    name: "name",
                    label: "newHk.steps.applicant.fields.applicantName.label",
                    placeholder: "newHk.steps.applicant.fields.applicantName.placeholder",
                    tooltip: "newHk.steps.applicant.fields.applicantName.tooltip",
                    required: true,
                    colSpan: 2,
                },
                { type: "text", name: "companyName_1", label: "Company Name (1st Choice)", placeholder: "usa.AppInfo.namePlaceholder", required: true, colSpan: 2, tooltip: "usa.AppInfo.usCompNamePopup" },
                { type: "text", name: "companyName_2", label: "Company Name (2nd Choice)", placeholder: "usa.AppInfo.namePlaceholder", required: true, colSpan: 2 },
                { type: "text", name: "companyName_3", label: "Company Name (3rd Choice)", placeholder: "usa.AppInfo.namePlaceholder", required: true, colSpan: 2 },
                {
                    type: "select",
                    name: "sns",
                    label: "newHk.steps.applicant.fields.sns.label",
                    placeholder: "newHk.steps.applicant.fields.sns.placeholder",
                    options: [
                        { label: "newHk.steps.applicant.fields.sns.options.WhatsApp", value: "WhatsApp" },
                        { label: "newHk.steps.applicant.fields.sns.options.WeChat", value: "WeChat" },
                        { label: "newHk.steps.applicant.fields.sns.options.Line", value: "Line" },
                        { label: "newHk.steps.applicant.fields.sns.options.KakaoTalk", value: "KakaoTalk" },
                        { label: "newHk.steps.applicant.fields.sns.options.Telegram", value: "Telegram" },
                    ],
                },
                {
                    type: "text",
                    name: "snsId",
                    label: "newHk.steps.applicant.fields.snsId.label",
                    placeholder: "newHk.steps.applicant.fields.snsId.placeholder",
                    condition: (f) => !!f.sns,
                },
            ],
        },
        {
            id: "kyc",
            title: "usa.steps.step2",
            description: "newHk.steps.compliance.description",
            fields: [
                {
                    type: "radio-group",
                    name: "annualRenewalConsent",
                    label: "aml.amlEstablishment",
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
                        "aml.plannedBusinessActivity",
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
        { id: "company", title: "newHk.steps.company.title", render: CompanyInfoStep },
        {
            id: "acct",
            title: "newHk.steps.acct.title",
            fields: [
                {
                    type: "select", name: "finYrEnd", label: "newHk.steps.acct.fields.finYrEnd.label",
                    options: [
                        { label: "newHk.steps.acct.fields.finYrEnd.options.December 31", value: "December 31" },
                        { label: "newHk.steps.acct.fields.finYrEnd.options.March 31", value: "March 31" },
                        { label: "newHk.steps.acct.fields.finYrEnd.options.June 30", value: "June 30" },
                        { label: "newHk.steps.acct.fields.finYrEnd.options.September 30", value: "September 30" }
                    ]
                },
                {
                    type: "radio-group", name: "bookKeepingCycle", label: "newHk.steps.acct.fields.bookKeepingCycle.label",
                    options: [
                        { label: "newHk.steps.acct.fields.bookKeepingCycle.options.Monthly", value: "Monthly" },
                        { label: "newHk.steps.acct.fields.bookKeepingCycle.options.Quarterly", value: "Quarterly" },
                        { label: "newHk.steps.acct.fields.bookKeepingCycle.options.Half-annually", value: "Half-annually" },
                        { label: "newHk.steps.acct.fields.bookKeepingCycle.options.Annually", value: "Annually" }
                    ],
                    colSpan: 2
                },
                {
                    type: "radio-group", name: "xero", label: "newHk.steps.acct.fields.xero.label",
                    options: [
                        { label: "newHk.steps.acct.fields.xero.options.Yes", value: "Yes" },
                        { label: "newHk.steps.acct.fields.xero.options.No", value: "No" },
                        { label: "newHk.steps.acct.fields.xero.options.Recommendation required", value: "Recommendation required" },
                        { label: "newHk.steps.acct.fields.xero.options.Other", value: "Other" }
                    ],
                    colSpan: 2
                },
                { type: "text", name: "softNote", label: "newHk.steps.acct.fields.softNote.label", placeholder: "newHk.steps.acct.fields.softNote.placeholder", colSpan: 2 }
            ]
        },
        {
            id: "agreement",
            title: "usa.steps.step4",
            description:
                "usa.steps.agreement.description",
            render: CommonServiceAgrementTxt
        },
        // {
        //     id: "services",
        //     title: "usa.steps.step5",
        //     description:
        //         "usa.steps.services.description",
        //     render: SgServiceSelectionStep,
        // },
        {
            id: "invoice",
            title: "usa.steps.step6",
            description:
                "usa.steps.invoice.description",
            render: PanamaQuoteSetupStep,
        },
        {
            id: "payment",
            title: "usa.steps.step7",
            description: "usa.steps.payment.description",
            render: PaymentStep,
        },
        {
            id: "incorp",
            title: "usa.steps.step9",
            description: "usa.steps.incorp.description",
            render: CongratsStep,
        },
    ],
};

/* =============================================================================
   Utils
============================================================================= */

const requiredMissing = (form: Record<string, any>, fields: Field[]): string[] =>
    fields.reduce<string[]>((acc, f) => {
        if (f.condition && !f.condition(form)) return acc;
        if (!f.required || f.type === "derived") return acc;

        const v = form[f.name];
        if (f.type === "checkbox-group") {
            if (!Array.isArray(v) || v.length === 0) acc.push(f.label);
        } else if (f.type === "checkbox") {
            if (!v) acc.push(f.label);
        } else if (v === undefined || v === null || String(v).trim() === "") {
            acc.push(f.label);
        }
        return acc;
    }, []);

/* =============================================================================
   Small UI bits
============================================================================= */

const TopBar: React.FC<{ idx: number; total: number }> = ({ idx, total }) => {
    const { t } = useTranslation();
    const progress = Math.round(((idx + 1) / total) * 100);
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl font-extrabold truncate">{t(CONFIG.title)}</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                    {t("newHk.infoHelpIcon", "Complete each step. Helpful tips (ⓘ) appear where needed.")}
                </p>
            </div>
            <div className="w-full sm:w-72 shrink-0">
                <Progress value={progress} />
                <p className="text-right text-xs text-muted-foreground mt-1">
                    Step {idx + 1} of {total}
                </p>
            </div>
        </div>
    );
};

const Sidebar: React.FC<{ steps: Step[]; currentIdx: number; onNavigate: (idx: number) => void; canProceed: boolean }> = ({
    steps,
    currentIdx,
    onNavigate,
    canProceed,
}) => {
    const { t } = useTranslation();
    return (
        <aside className="space-y-3 sticky top-0 h-[calc(100vh-2rem)] overflow-auto">
            <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-red-600 shrink-0" />
                <span className="text-xs font-semibold truncate">{t("panama.title")}</span>
            </div>

            <div className="flex flex-wrap gap-1 text-xs">
                <Badge variant="outline">SSL</Badge>
                <Badge variant="outline">AML/KYC</Badge>
                <Badge variant="outline">Secure</Badge>
            </div>
            <div className="space-y-1 mt-3">
                {steps.map((s, i) => {
                    const enabled = i <= currentIdx || canProceed;
                    const active = i === currentIdx;
                    return (
                        <button
                            key={s.id}
                            onClick={() => enabled && onNavigate(i)}
                            disabled={!enabled}
                            className={cn(
                                "w-full text-left rounded-lg border p-2 sm:p-3 transition",
                                active && "border-primary bg-accent/10",
                                !active && enabled && "hover:bg-accent/10",
                                !enabled && "opacity-60 cursor-not-allowed"
                            )}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold text-xs sm:text-sm truncate">
                                    {i + 1}. {t(s.title)}
                                </span>
                                {i < currentIdx && (
                                    <Badge variant="secondary" className="text-xs">
                                        Done
                                    </Badge>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </aside>
    );
};

const FieldLabel: React.FC<{ label: string; tooltip?: string; htmlFor: string; className?: string; }> = ({ label, tooltip, htmlFor, className = "", }) => {
    const { t } = useTranslation();
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <Label htmlFor={htmlFor} className="font-semibold">
                {t(label)}
            </Label>
            {tooltip && (
                <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Info className="size-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs text-sm">
                            {t(tooltip)}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </div>
    );
};

const EmailOTPField: React.FC = () => {
    const { t } = useTranslation();
    const [form, setForm] = useAtom(paFormWithResetAtom1);
    const [otp, setOtp] = React.useState("");
    const [sessionId, setSessionId] = React.useState<string | null>(null);

    const sendOTP = async () => {
        if (!form.email?.trim()) return;
        if (sessionId) {
            toast({ title: "Error", description: "Verify the OTP sent already", variant: "destructive" });
            return;
        }
        const res = await sendEmailOtpforVerification({ email: form.email, name: form.name });
        if (res.success) {
            setSessionId(res.id);
            toast({ title: "Success", description: "OTP sent successfully" });
        } else {
            toast({ title: "Error", description: "Failed to send OTP", variant: "destructive" });
        }
    };

    const verifyOTP = async () => {
        if (!otp.trim()) return;
        const res = await validateOtpforVerification({ otp, id: sessionId });
        if (res.success) {
            setForm((p: any) => ({ ...p, emailOtpVerified: true }));
            setSessionId(null);
            setOtp("");
            toast({ title: "Success", description: "Email verified successfully" });
        } else {
            toast({ title: "Error", description: "Invalid OTP", variant: "destructive" });
        }
    };

    return (
        <div className="grid gap-2 md:col-span-2">
            <div className="flex items-center justify-between">
                <Label className="font-semibold">{t("ApplicantInfoForm.email")} *</Label>
                {form.emailOtpVerified && <Badge variant="secondary">Verified ✓</Badge>}
                {sessionId && !form.emailOtpVerified && <Badge variant="outline">OTP Sent</Badge>}
            </div>

            <div className="flex gap-2">
                <Input
                    type="email"
                    placeholder={t("usa.AppInfo.emailPlaceholder", "Valid email")}
                    value={form.email ?? ""}
                    onChange={(e) => setForm((p: any) => ({ ...p, email: e.target.value, emailOtpVerified: false }))}
                />
                <Button type="button" variant="outline" onClick={sendOTP} disabled={!form.email?.trim()}>
                    Send OTP
                </Button>
            </div>

            {sessionId && !form.emailOtpVerified && (
                <div className="flex gap-2">
                    <Input placeholder={t("usa.email.enterOtp", "Enter OTP")} value={otp} onChange={(e) => setOtp(e.target.value)} />
                    <Button onClick={verifyOTP} disabled={!otp.trim()}>
                        Verify
                    </Button>
                </div>
            )}
        </div>
    );
};

const MobileOTPField: React.FC = () => {
    const { t } = useTranslation();
    const [form, setForm] = useAtom(paFormWithResetAtom1);
    const [otp, setOtp] = React.useState("");
    const [sessionId, setSessionId] = React.useState<string | null>(null);
    const [otpSent, setOtpSent] = React.useState(false);
    const [resendTimer, setResendTimer] = React.useState(0);

    React.useEffect(() => {
        if (resendTimer <= 0) return;
        const id = setInterval(() => setResendTimer((s) => s - 1), 1000);
        return () => clearInterval(id);
    }, [resendTimer]);

    const sendOTP = async () => {
        if (!form.phoneNum?.trim()) {
            toast({ title: "Missing Number", description: "Phone Number is required", variant: "default" });
            return;
        }
        if (sessionId) {
            toast({ title: "Error", description: "Verify the otp sent already", variant: "destructive" });
            return;
        }
        const res = await sendMobileOtpforVerification({ phoneNum: form.phoneNum });
        if (res.success) {
            setOtpSent(true);
            setResendTimer(60);
            setSessionId(res.id);
            toast({ title: "Success", description: "OTP sent successfully" });
        } else {
            setOtpSent(false);
            setResendTimer(0);
            setSessionId(null);
            toast({
                title: "Error",
                description: "Failed to send OTP. Please enter proper phone number along with country code.",
                variant: "destructive",
            });
        }
    };

    const verifyOTP = async () => {
        if (!otp.trim()) {
            toast({ title: "Error", description: "Please enter OTP", variant: "destructive" });
            return;
        }
        const res = await validateOtpforVerification({ otp, id: sessionId });
        if (res.success) {
            setForm((p: any) => ({ ...p, mobileOtpVerified: true }));
            setSessionId(null);
            toast({ title: "Success", description: "Phone number verified successfully" });
        } else {
            toast({ title: "Error", description: "Invalid OTP", variant: "destructive" });
        }
    };

    return (
        <div className="grid gap-2 md:col-span-2">
            <div className="flex items-center justify-between">
                <Label className="font-semibold">{t("ApplicantInfoForm.phoneNum", "Phone Number")} *</Label>
                {form.mobileOtpVerified && <Badge variant="secondary">Verified ✓</Badge>}
                {otpSent && !form.mobileOtpVerified && <Badge variant="outline">OTP Sent</Badge>}
            </div>

            <div className="flex gap-2">
                <Input
                    type="tel"
                    placeholder={t("ApplicantInfoForm.phoneNumInfo", "Enter phone with country code, e.g. +65...")}
                    value={form.phoneNum ?? ""}
                    onChange={(e) => setForm((p: any) => ({ ...p, phoneNum: e.target.value, mobileOtpVerified: false }))}
                />
                <Button type="button" variant="outline" onClick={sendOTP} disabled={resendTimer > 0}>
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Send OTP"}
                </Button>
            </div>

            {otpSent && !form.mobileOtpVerified && (
                <div className="flex gap-2">
                    <Input placeholder="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-32" />
                    <Button type="button" onClick={verifyOTP} disabled={!otp.trim()}>
                        Verify
                    </Button>
                </div>
            )}
        </div>
    );
};

const FormField: React.FC<{ field: Field; form: any; setForm: (fn: (p: any) => any) => void }> = ({ field, form, setForm }) => {
    const { t } = useTranslation();

    // apply defaultValue once if missing
    useEffect(() => {
        if (field.defaultValue !== undefined && form[field.name] === undefined) {
            setForm((p) => ({ ...p, [field.name]: field.defaultValue }));
        }
    }, [field.defaultValue, field.name, form, setForm]);
    if (field.condition && !field.condition(form)) return null;

    const span = field.colSpan === 2 ? "md:col-span-2" : "";
    const value = form[field.name];
    const set = (v: any) => setForm((p) => ({ ...p, [field.name]: v }));

    const labelCls = "text-sm font-medium text-gray-700";
    const hintCls = "text-xs text-muted-foreground";
    const wrapCls = cn("grid gap-2", span);
    const inputCls = "h-9 rounded-md";
    const selectTriggerCls = "h-9 rounded-md";

    switch (field.type) {
        case "text":
        case "email":
        case "number":
            return (
                <div className={wrapCls}>
                    <FieldLabel label={field.label} tooltip={field.tooltip} htmlFor={field.name} className={labelCls} />
                    <Input
                        id={field.name}
                        type={field.type === "number" ? "number" : field.type}
                        placeholder={field.placeholder ? t(field.placeholder) : ""}
                        value={value ?? ""}
                        onChange={(e) => set(e.target.value)}
                        className={inputCls}
                    />
                    {field.hint && <p className={hintCls}>{t(field.hint)}</p>}
                </div>
            );

        case "textarea":
            return (
                <div className={wrapCls}>
                    <FieldLabel label={field.label} tooltip={field.tooltip} htmlFor={field.name} className={labelCls} />
                    <Textarea
                        id={field.name}
                        rows={field.rows ?? 4}
                        placeholder={field.placeholder ? t(field.placeholder) : ""}
                        value={value ?? ""}
                        onChange={(e) => set(e.target.value)}
                        className="rounded-md"
                    />
                    {field.hint && <p className={hintCls}>{t(field.hint)}</p>}
                </div>
            );

        case "select": {
            const opts = field.options ?? [];
            return (
                <div className={wrapCls}>
                    <FieldLabel label={field.label} tooltip={field.tooltip} htmlFor={field.name} className={labelCls} />
                    <Select value={String(value ?? "")} onValueChange={set}>
                        <SelectTrigger id={field.name} className={selectTriggerCls}>
                            <SelectValue placeholder={t("common.select", "Select")} />
                        </SelectTrigger>
                        <SelectContent>
                            {opts.map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                    {t(o.label)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {field.hint && <p className={hintCls}>{t(field.hint)}</p>}
                </div>
            );
        }

        case "checkbox":
            return (
                <div className={cn("flex items-center gap-2", span)}>
                    <Checkbox id={field.name} checked={!!value} onCheckedChange={(v) => set(v === true)} />
                    <FieldLabel label={field.label} tooltip={field.tooltip} htmlFor={field.name} className={labelCls} />
                </div>
            );

        case "checkbox-group": {
            const selected: string[] = Array.isArray(value) ? value : [];
            const opts = field.options ?? [];
            const isOtherOption = (optValue: string) => optValue.toLowerCase() === "other";
            const otherPrefix = "other:";
            const hasOther = selected.some((v) => v === "Other" || v.startsWith(otherPrefix));
            const currentOtherVal = (() => {
                const v = selected.find((x) => x.startsWith(otherPrefix));
                return v ? v.slice(otherPrefix.length) : "";
            })();
            const setArray = (arr: string[]) => setForm((p) => ({ ...p, [field.name]: arr }));

            const toggleValue = (optValue: string, on: boolean) => {
                const next = new Set(selected);
                if (isOtherOption(optValue)) {
                    if (on) {
                        Array.from(next).forEach((v) => {
                            if (v === "Other") next.delete(v);
                        });
                        if (!Array.from(next).some((v) => v.startsWith(otherPrefix))) next.add(otherPrefix);
                    } else {
                        Array.from(next).forEach((v) => {
                            if (v === "Other" || v.startsWith(otherPrefix)) next.delete(v);
                        });
                    }
                } else {
                    if (on) next.add(optValue);
                    else next.delete(optValue);
                }
                setArray(Array.from(next));
            };

            const updateOtherText = (text: string) => {
                const base = selected.filter((v) => !(v === "Other" || v.startsWith(otherPrefix)));
                base.push(`${otherPrefix}${text}`);
                setArray(base);
            };

            return (
                <div className={wrapCls}>
                    <FieldLabel label={field.label} tooltip={field.tooltip} htmlFor={field.name} className={labelCls} />
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {opts.map((opt) => {
                            const isOther = isOtherOption(opt.value);
                            const isChecked = isOther ? hasOther : selected.includes(opt.value);
                            return (
                                <label key={opt.value} className="flex items-center gap-2 rounded-md border border-gray-200 p-2 hover:bg-gray-50">
                                    <Checkbox
                                        checked={isChecked}
                                        onCheckedChange={(checked) => toggleValue(opt.value, checked === true)}
                                    />
                                    <span className="text-sm text-gray-700">{t(opt.label)}</span>
                                </label>
                            );
                        })}
                    </div>

                    {hasOther && (
                        <div className="flex items-center gap-2 mt-1">
                            <Label htmlFor={`${field.name}-other`} className="text-sm text-muted-foreground">
                                {t("common.specifyOther", "Please specify")}
                            </Label>
                            <Input
                                id={`${field.name}-other`}
                                placeholder={t("common.enterValue", "Enter value")}
                                value={currentOtherVal}
                                onChange={(e) => updateOtherText(e.target.value)}
                                className={inputCls}
                            />
                        </div>
                    )}

                    {field.hint && <p className={hintCls}>{t(field.hint)}</p>}
                </div>
            );
        }

        case "radio-group": {
            const opts = field.options ?? [];
            return (
                <div className={wrapCls}>
                    <FieldLabel label={field.label} tooltip={field.tooltip} htmlFor={field.name} className={labelCls} />
                    <RadioGroup value={String(value ?? "")} onValueChange={set} className="space-y-2">
                        {opts.map((opt) => (
                            <label key={opt.value} className="flex items-start gap-3 text-sm cursor-pointer">
                                <RadioGroupItem value={opt.value} className="mt-0.5" />
                                <span>{t(opt.label)}</span>
                            </label>
                        ))}
                    </RadioGroup>
                    {field.hint && <p className={hintCls}>{t(field.hint)}</p>}
                </div>
            );
        }

        case "derived": {
            const computed = field.compute ? field.compute(form) : "";
            return (
                <div className={wrapCls}>
                    <FieldLabel label={field.label} tooltip={field.tooltip} htmlFor={field.name} className={labelCls} />
                    <Input id={field.name} readOnly value={computed} className={inputCls} />
                </div>
            );
        }
        case "search-select": {
            const selectedItem = form[field.name]
                ? field.items?.find(
                    (o: any) => o.code === form[field.name]
                ) || null
                : null;

            const handleSelect = (item: {
                code: string;
                label: string;
            }) => {
                set(item.code);
            };

            const items = (field.items || []).map((it: any) => ({
                ...it,
                label: t(it.label as any, it.label),
            }));

            return (
                <div className={cn("grid gap-2", span)}>
                    {t(field.label)}
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
                    {field.hint && <p className={hintCls}>{t(field.hint)}</p>}
                </div>
            );
        }

        default:
            return null;
    }
};


const PanamaIncorporationForm: React.FC = () => {
    const { t } = useTranslation();
    const [form, setForm] = useAtom(paFormWithResetAtom1);
    const [stepIdx, setStepIdx] = React.useState(0);
    const step = CONFIG.steps[stepIdx];
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const fields = step.fields ?? [];
    const missing = step.fields ? requiredMissing(form, fields) : [];

    // Applicant step: require email + phone + both verifications
    if (step.id === "applicant") {
        if (!String(form.email || "").trim()) missing.push("Email");
        if (!String(form.phoneNum || "").trim()) missing.push("ApplicantInfoForm.phoneNum");
        // if (!form.emailOtpVerified) missing.push("usa.email.otpRequired");
        // if (!form.mobileOtpVerified) missing.push("usa.mobile.otpRequired");
    }

    const canProceed = missing.length === 0;
    // console.log("stepIdx", stepIdx)
    // console.log("form-->", form)
    const updateDoc = async () => {
        // setIsSubmitting(true);
        if (isSubmitting) {
            return;
        }
        const token = localStorage.getItem("token") as string;
        const decodedToken = jwtDecode<TokenData>(token);
        setIsSubmitting(true);
        if (!form.userId) {
            form.userId = decodedToken.userId;
            form.users = [{ "userId": decodedToken.userId, "role": "applicant" }];
        } else {
            // If userId exists but belongs to someone else, do NOT override
            if (form.userId !== decodedToken.userId) {
                // Just leave it as is — do nothing
            } else {
                // Same user — keep as is or update (your choice)
            }
        }
        const payload = { ...form };
        try {
            // console.log("payload", payload)
            const response = await api.post("/company/pa-form", payload);
            if (response.status === 200) {
                // console.log("formdata", response.data);
                localStorage.setItem("companyRecordId", response.data.data._id);
                setForm(response.data.data)
                window.history.pushState(
                    {},
                    "",
                    `/company-register/PA/${response.data.data._id}`
                );
            } else {
                console.log("error-->", response);
            }
        } catch (error) {
            console.error("Submission error:", error);
        } finally {
            console.log("finally");
            setIsSubmitting(false);
            // setStepIdx((i) => Math.min(i + 1, CONFIG.steps.length - 1));
        }
    }

    const handleNext = async () => {
        if (!canProceed) {
            toast({ title: "Missing information", description: "Please complete required fields to continue.", variant: "destructive" });
            return;
        }
        // console.log("form", form)
        if (stepIdx == 1) {
            const q1 = form.annualRenewalConsent
            const q2 = form.legalAndEthicalConcern
            const q3 = form.q_country
            const q4 = form.sanctionsExposureDeclaration
            const q5 = form.crimeaSevastapolPresence
            const q6 = form.russianEnergyPresence
            const q1Valid = q1 === "yes" || q1 === "self_handle";
            // q2..q6 must all be "no"
            const q2to6AllNo = [q2, q3, q4, q5, q6].every((x) => x === "no");
            // anyRisk = risk exists when the combined condition FAILS
            const anyRisk = !(q1Valid && q2to6AllNo);
            if (anyRisk) {
                await updateDoc();
                toast({
                    title: "",
                    description: "Consultation Required.",
                });
                return;
            }
        }
        await updateDoc();
        setStepIdx((i) => Math.min(i + 1, CONFIG.steps.length - 1));
    };

    const back = () => setStepIdx((i) => Math.max(0, i - 1));
    // console.log("missing", missing)
    return (
        <div className="max-width mx-auto p-3 sm:p-6 space-y-4">
            <TopBar idx={stepIdx} total={CONFIG.steps.length} />

            <div className="grid lg:grid-cols-[280px_1fr] gap-6">
                {/* Sidebar */}
                <div className="hidden lg:block">
                    <Sidebar steps={CONFIG.steps} currentIdx={stepIdx} onNavigate={setStepIdx} canProceed={canProceed} />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            {stepIdx + 1}. {t(step.title)}
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* OTP Blocks on Applicant step */}
                        {step.id === "applicant" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <EmailOTPField />
                                <MobileOTPField />
                            </div>
                        )}

                        {/* Fields */}
                        {step.fields && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {fields.map((f) => (
                                    <FormField key={f.name} field={f} form={form} setForm={setForm} />
                                ))}
                            </div>
                        )}
                        {step.render ? <step.render form={form} setForm={setForm} /> : null}

                        {missing.length > 0 && (
                            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                                <div className="mb-2 text-destructive text-sm font-semibold">
                                    {t("Required")}
                                </div>
                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                    {missing.map((k) => (
                                        <li key={k} className="leading-tight">
                                            {t(k)}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline" disabled={stepIdx === 0} onClick={back}>
                            ← Back
                        </Button>
                        <Button onClick={handleNext}>{stepIdx < CONFIG.steps.length - 1 ? "Next →" : "Finish"}</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default PanamaIncorporationForm;