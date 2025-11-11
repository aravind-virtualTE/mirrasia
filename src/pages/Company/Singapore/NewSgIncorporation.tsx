/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo } from "react";
import { useAtom } from "jotai";
import { Trans, useTranslation } from "react-i18next";
import { FeeRow, Party, sgFormWithResetAtom1 } from "./SgState";
import {
    sendEmailOtpforVerification,
    validateOtpforVerification,
    sendMobileOtpforVerification,
} from "@/hooks/useAuth";
import { sendInviteToShDir } from "@/services/dataFetch";
import { isValidEmail } from "@/middleware";
import { toast } from "@/hooks/use-toast";

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
import { Building2, ChevronDown, ChevronUp, HelpCircle, Info, Send, UserIcon, Users, X } from "lucide-react";
import CommonServiceAgrementTxt from "../CommonServiceAgrementTxt";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { StripeSuccessInfo, Tip } from "../NewHKForm/NewHKIncorporation";
import { createInvoicePaymentIntent, deleteIncorpoPaymentBankProof, updateCorporateInvoicePaymentIntent, uploadIncorpoPaymentBankProof } from "../NewHKForm/hkIncorpo";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";
import { TokenData } from "@/middleware/ProtectedRoutes";
import api from "@/services/fetch";

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
    | "derived";

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
};

type Step = { id: string; title: string; description?: string; fields?: Field[]; widget?: "shareholders"; render?: React.ComponentType<{ form: any; setForm: (fn: (p: any) => any) => void }>; };

type FormConfig = { title: string; steps: Step[] };

function PartiesManager() {
    const { t } = useTranslation();
    const [form, setForm] = useAtom(sgFormWithResetAtom1);

    // Normalize parties
    const parties: Party[] = Array.isArray(form.parties) ? form.parties : [];

    // Total shares from your form config
    const totalShares: number =
        (form.shareCount === "other"
            ? Number(form.shareOther || 0)
            : Number(form.shareCount || 0)) || 0;

    const assigned = parties.reduce((s, p) => s + (Number(p.shares) || 0), 0);
    //   const isBalanced = totalShares > 0 && assigned === totalShares;
    const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);
    const toggleExpand = (i: number) => setExpandedIndex(expandedIndex === i ? null : i);

    const patch = (i: number, updates: Partial<Party>) => {
        const next = [...parties];
        next[i] = { ...next[i], ...updates };
        setForm((prev: any) => ({ ...prev, parties: next }));
    };

    const remove = (i: number) => {
        const next = parties.filter((_, idx) => idx !== i);
        setForm((prev: any) => ({ ...prev, parties: next }));
        if (expandedIndex === i) setExpandedIndex(null);
    };

    const add = () => {
        const next: Party[] = [
            ...parties,
            {
                name: "",
                email: "",
                phone: "",
                isCorp: false,
                shares: 0,
                typeOfShare: DEFAULT_SHARE_ID,
                address: "",
                isSignificant: false,
                isDesignatedContact: false,
                isDirector: false,
                status: "",
            },
        ];
        setForm((prev: any) => ({ ...prev, parties: next }));
        setExpandedIndex(parties.length);
    };

    const sendInvites = async () => {
        const invites = parties
            .filter((p) => p.email && isValidEmail(p.email))
            .map(({ name, email, isCorp }) => ({ name, email, isCorp }));

        if (!invites.length) {
            toast({
                title: t("newHk.parties.toasts.invalidEmail.title", "No valid emails"),
                description: t("newHk.parties.toasts.invalidEmail.desc", "Add at least one valid email to send invites."),
                variant: "destructive",
            });
            return;
        }

        const res = await sendInviteToShDir({
            _id: form._id || "",
            inviteData: invites,
            country: "SG",
        });

        const summary = res?.summary ?? { successful: 0, alreadyExists: 0, failed: 0 };

        if (summary.successful > 0 || summary.alreadyExists > 0) {
            setForm((prev: any) => {
                const updated = (Array.isArray(prev.parties) ? prev.parties : []).map((p: Party) => ({
                    ...p,
                    invited: true,
                    status: "Invited" as const,
                }));
                return { ...prev, parties: updated };
            });
            toast({
                title: t("newHk.parties.toasts.invite.success.title", "Invitations sent"),
                description: t("newHk.parties.toasts.invite.success.desc"),
            });
        }

        if (summary.failed > 0) {
            setForm((prev: any) => {
                const updated = (Array.isArray(prev.parties) ? prev.parties : []).map((p: Party) => ({
                    ...p,
                    status: p.invited ? p.status : ("Not Invited" as const),
                }));
                return { ...prev, parties: updated };
            });
            toast({
                title: t("newHk.parties.toasts.invite.failed.title", "Some invites failed"),
                description: t("newHk.parties.toasts.invite.failed.desc", "Please verify emails and try again."),
                variant: "destructive",
            });
        }
    };

    return (
        <div className="max-width mx-auto p-2 space-y-2">
            {/* Header with Status */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">
                            {t("newHk.parties.title", "Shareholders")}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {assigned.toLocaleString()} {t("newHk.parties.of", "of")} {totalShares.toLocaleString()} {t("newHk.parties.allocated", "shares allocated")}
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                {(parties || []).map((p, i) => {
                    const pct = totalShares > 0 ? ((Number(p.shares) / totalShares) * 100).toFixed(1) : "0.0";
                    const isExpanded = expandedIndex === i;

                    return (
                        <Card key={i} className="overflow-hidden transition-all hover:shadow-md">
                            {/* Compact Header */}
                            <div
                                className="p-2 cursor-pointer flex items-center justify-between hover:bg-gray-50"
                                onClick={() => toggleExpand(i)}
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div
                                        className={cn(
                                            "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                                            p.isCorp ? "bg-purple-100" : "bg-blue-100"
                                        )}
                                    >
                                        {p.isCorp ? (
                                            <Building2 className="w-4 h-4 text-purple-600" />
                                        ) : (
                                            <UserIcon className="w-4 h-4 text-blue-600" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900 truncate">
                                                {p.name || t("newHk.parties.new", "New Shareholder/Director")}
                                            </span>
                                            {p.status && (
                                                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                                                    {p.status}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 truncate">{p.email || t("common.noEmail", "No email")}</p>
                                    </div>

                                    <div className="text-right flex-shrink-0">
                                        <div className="font-semibold text-gray-900">{(p.shares || 0).toLocaleString()}</div>
                                        <div className="text-xs text-gray-500">{pct}%</div>
                                    </div>
                                </div>

                                <button className="ml-4 p-1 hover:bg-gray-200 rounded" type="button">
                                    {isExpanded ? (
                                        <ChevronUp className="w-4 h-4 text-gray-600" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-gray-600" />
                                    )}
                                </button>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <CardContent className="pt-0 pb-4 px-4 border-t bg-gray-50">
                                    <div className="grid grid-cols-2 gap-3 mt-4">
                                        {/* Name */}
                                        <div className="col-span-2 sm:col-span-1">
                                            <Label className="text-xs text-gray-600 mb-1">
                                                {t("newHk.parties.fields.name.label", "Name")}
                                            </Label>
                                            <Input
                                                value={p.name}
                                                onChange={(e) => patch(i, { name: e.target.value })}
                                                className="h-9"
                                            />
                                        </div>

                                        {/* Email */}
                                        <div className="col-span-2 sm:col-span-1">
                                            <Label className="text-xs text-gray-600 mb-1">
                                                {t("newHk.parties.fields.email.label", "Email")}
                                            </Label>
                                            <Input
                                                type="email"
                                                value={p.email}
                                                onChange={(e) => patch(i, { email: e.target.value })}
                                                className="h-9"
                                            />
                                        </div>

                                        {/* Phone */}
                                        <div className="col-span-2 sm:col-span-1">
                                            <Label className="text-xs text-gray-600 mb-1">
                                                {t("newHk.parties.fields.phone.label", "Phone")}
                                            </Label>
                                            <Input
                                                value={p.phone}
                                                onChange={(e) => patch(i, { phone: e.target.value })}
                                                className="h-9"
                                            />
                                        </div>

                                        {/* Shares */}
                                        <div className="col-span-2 sm:col-span-1">
                                            <Label className="text-xs text-gray-600 mb-1">
                                                {t("newHk.parties.fields.shares.label", "Shares")}
                                            </Label>
                                            <Input
                                                type="number"
                                                value={Number.isFinite(p.shares) ? p.shares : 0}
                                                onChange={(e) => {
                                                    const val = Number(e.target.value);
                                                    patch(i, { shares: Number.isFinite(val) ? val : 0 });
                                                }}
                                                className="h-9"
                                            />
                                        </div>

                                        {/* Address */}
                                        <div className="col-span-2">
                                            <Label className="text-xs text-gray-600 mb-1">
                                                {t("newHk.parties.fields.address.label", "Address")}
                                            </Label>
                                            <Input
                                                value={p.address ?? ""}
                                                onChange={(e) => patch(i, { address: e.target.value })}
                                                placeholder={t("newHk.parties.fields.address.placeholder", "Street, City, Country")}
                                                className="h-9"
                                            />
                                        </div>

                                        {/* Share Type */}
                                        <div className="col-span-2">
                                            <Label className="text-xs text-gray-600 mb-2">
                                                {t("newHk.parties.fields.type.label", "Share Type")}
                                            </Label>
                                            <RadioGroup
                                                value={p.typeOfShare ?? DEFAULT_SHARE_ID}
                                                onValueChange={(v) => patch(i, { typeOfShare: v })}
                                                className="flex gap-4"
                                            >
                                                {SHARE_TYPES.map((type) => (
                                                    <label key={type.id} className="flex items-center gap-2 cursor-pointer">
                                                        <RadioGroupItem value={type.id} />
                                                        <span className="text-sm">{t(type.label, type.label)}</span>
                                                    </label>
                                                ))}
                                            </RadioGroup>
                                        </div>

                                        {/* Corporate Entity */}
                                        <div className="col-span-2 sm:col-span-1">
                                            <Label className="text-xs text-gray-600 mb-1">
                                                {t("newHk.parties.fields.isCorp.label", "Corporate Entity")}
                                            </Label>
                                            <Select
                                                value={String(p.isCorp)}
                                                onValueChange={(v) => patch(i, { isCorp: v === "true" })}
                                            >
                                                <SelectTrigger className="h-9">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="false">{t("common.no", "No")}</SelectItem>
                                                    <SelectItem value="true">{t("common.yes", "Yes")}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Significant Controller */}
                                        <div className="col-span-2 sm:col-span-1">
                                            <Label className="text-xs text-gray-600 mb-1">
                                                {t("newHk.parties.fields.isSignificant.label", "Significant Controller")}
                                            </Label>
                                            <Select
                                                value={String(p.isSignificant ?? false)}
                                                onValueChange={(v) => patch(i, { isSignificant: v === "true" })}
                                            >
                                                <SelectTrigger className="h-9">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="false">{t("common.no", "No")}</SelectItem>
                                                    <SelectItem value="true">{t("common.yes", "Yes")}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Designated Contact */}
                                        <div className="col-span-2 sm:col-span-1">
                                            <Label className="text-xs text-gray-600 mb-1">
                                                {t("newHk.parties.fields.isDesignatedContact.label", "Designated Contact")}
                                            </Label>
                                            <Select
                                                value={String(p.isDesignatedContact ?? false)}
                                                onValueChange={(v) => patch(i, { isDesignatedContact: v === "true" })}
                                            >
                                                <SelectTrigger className="h-9">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="false">{t("common.no", "No")}</SelectItem>
                                                    <SelectItem value="true">{t("common.yes", "Yes")}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <Label className="text-xs text-gray-600 mb-1">
                                                {t("newHk.parties.fields.isDirector.label", "Is Director?")}
                                            </Label>
                                            <Select
                                                value={String(p.isDirector ?? false)}
                                                onValueChange={(v) => patch(i, { isDirector: v === "true" })}
                                            >
                                                <SelectTrigger className="h-9">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="false">{t("common.no", "No")}</SelectItem>
                                                    <SelectItem value="true">{t("common.yes", "Yes")}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Remove */}
                                        <div className="col-span-2 flex justify-end mt-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => remove(i)}
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
                <div className="flex items-center gap-3">
                    <Button
                        onClick={add}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        {t("newHk.parties.buttons.add", "Add Shareholder")}
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        At least 1 local director must be registered
                    </span>
                </div>

                <Button
                    onClick={sendInvites}
                    variant="default"
                    className="flex items-center gap-2 hover:bg-green-700"
                >
                    <Send className="w-4 h-4" />
                    {t("newHk.parties.buttons.invite", "Send Invitations")}
                </Button>
            </div>
        </div>
    );
}


const CompanyInfoStep = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useAtom(sgFormWithResetAtom1);

    // seed safe defaults once
    useEffect(() => {
        setFormData((p: any) => {
            const next = { ...p };
            if (next.currency === undefined) next.currency = "HKD";
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
            { id: "mirrasiaAddress", value: "Singapore.mirraddress" },
            { id: "ownAddress", value: "Singapore.ownAddress" },
            { id: "other", value: "InformationIncorporation.paymentOption_other" },
        ],
        []
    );

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
    return (
        <div className="space-y-3 max-width mx-auto">
            {/* Card A */}
            <Card className="shadow-sm border-gray-200">
                <CardContent className="p-6">
                    <div className="space-y-5">
                        <h3 className="text-base font-semibold text-gray-900 border-b pb-2">
                            {t("newHk.company.sections.a")}
                        </h3>

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

                        {/* Secondary industry */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                {t("Singapore.bInfoSingSecondIndustries")}
                                <span className="text-red-500">*</span>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <HelpCircle className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-sm text-sm">
                                        {t("Singapore.twoBizTypesInfo", "A Singapore corporation can register up to two types of business.")}
                                    </TooltipContent>
                                </Tooltip>
                            </Label>
                            <Input
                                placeholder={t("common.enterValue", "Your answer")}
                                value={formData.sgBusinessList ?? ""}
                                onChange={(e) => setFormData((p: any) => ({ ...p, sgBusinessList: e.target.value }))}
                                className="h-9"
                            />
                        </div>

                        {/* Website */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">{t("usa.bInfo.enterWeb")}</Label>
                            <Input
                                placeholder={t("common.enterValue", "Your answer")}
                                value={formData.webAddress ?? ""}
                                onChange={(e) => setFormData((p: any) => ({ ...p, webAddress: e.target.value }))}
                                className="h-9"
                            />
                        </div>

                        {/* Purpose */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                                {t("Singapore.purposeEstablisSingapore")} <span className="text-red-500">*</span>
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

                        {/* Business Address */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                {t("Singapore.bInfoAddressReg")}
                                <span className="text-red-500">*</span>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <HelpCircle className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-sm text-sm">{t("Singapore.bInfoAddRegParaInfo")}</TooltipContent>
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
                                type: "select",
                                name: "currency",
                                label: "newHk.company.fields.currency.label",
                                required: true,
                                defaultValue: "HKD",
                                options: [
                                    { label: "newHk.company.fields.currency.options.HKD", value: "HKD" },
                                    { label: "newHk.company.fields.currency.options.USD", value: "USD" },
                                    { label: "newHk.company.fields.currency.options.CNY", value: "CNY" },
                                ],
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
                                    { label: "newHk.company.fields.capAmount.options.1", value: "1" },
                                    { label: "newHk.company.fields.capAmount.options.10", value: "10" },
                                    { label: "newHk.company.fields.capAmount.options.100", value: "100" },
                                    { label: "newHk.company.fields.capAmount.options.1000", value: "1000" },
                                    { label: "newHk.company.fields.capAmount.options.10000", value: "10000" },
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
                </CardContent>
            </Card>
        </div>
    );
};
type YesNo = "yes" | "no";
type Security = "deposit" | "prepay";

const fmtUSD = (n: number) => `USD ${Number(n || 0).toLocaleString()}`;

const SgServiceSelectionStep: React.FC = () => {
    const [form, setForm] = useAtom(sgFormWithResetAtom1);
    React.useEffect(() => {
        if (!form?.sg_preAnswers) {
            setForm((prev: any) => ({
                ...prev,
                sg_preAnswers: { hasLocalDir: "no", ndSecurity: "deposit" },
            }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // Persisted pre-answers (so navigation keeps state)
    const hasLocalDir: YesNo = form?.sg_preAnswers?.hasLocalDir ?? "no";
    const ndSecurity: Security = form?.sg_preAnswers?.ndSecurity ?? "deposit";

    const setPreAnswers = (updates: Partial<{ hasLocalDir: YesNo; ndSecurity: Security }>) => {
        setForm((prev: any) => ({
            ...prev,
            sg_preAnswers: {
                // read the latest values from state, not from render-time variables
                hasLocalDir: prev?.sg_preAnswers?.hasLocalDir ?? "no",
                ndSecurity: prev?.sg_preAnswers?.ndSecurity ?? "deposit",
                ...(prev?.sg_preAnswers || {}),
                ...updates,
            },
        }));
    };

    // Optional selections (bank advisory, EMI, etc.)
    const selected: string[] = Array.isArray(form.serviceItemsSelected) ? form.serviceItemsSelected : [];
    const includeOptional = (id: string, on: boolean) => {
        const curr = Array.isArray(form.serviceItemsSelected) ? form.serviceItemsSelected : [];
        const exists = curr.includes(id);
        if (on && !exists) setForm({ ...form, serviceItemsSelected: [...curr, id] });
        if (!on && exists) setForm({ ...form, serviceItemsSelected: curr.filter((x: string) => x !== id) });
    };

    // ===== Fixed mandatory rows (always) =====
    const MANDATORY = [
        { id: "companyIncorporation", label: "Company Incorporation (filing)", price: 350 },
        { id: "nomineeDirector", label: "Nominee Director (1 year)", price: 2000 }, // always mandatory now
        { id: "companySecretary", label: "Company Secretary (1 year)", price: 480 },
        { id: "registeredAddress", label: "Registered Address (1 year)", price: 300 },
    ];

    // Base mandatory sum (without security)
    const baseMandatoryTotal = MANDATORY.reduce((s, r) => s + r.price, 0); // 350+2000+480+300 = 3,130

    // Extra mandatory security (only when nominee REQUIRED)
    const extraSecurityMandatory = hasLocalDir === "no" ? 2000 : 0;

    // ===== Optionals (paid options excluding security; EMI is 0) =====
    const OPTIONALS = [
        { id: "bankAccountAdvisory", label: "Bank Account Advisory (optional)", price: 1200 },
        { id: "emiEAccount", label: "EMI e-Account Opening (basic) Free", price: 0 },
    ];

    // Totals
    const paidOptionalSum = OPTIONALS
        .filter((r) => selected.includes(r.id))
        .reduce((s, r) => s + r.price, 0);

    const initialMandatoryTotal = baseMandatoryTotal + extraSecurityMandatory;
    const totalInclOptions = initialMandatoryTotal + paidOptionalSum; // equals mandatory when no paid optionals

    // Guards
    const canToggle = () => {
        if (form.sessionId) {
            toast({
                title: "Payment Session Initiated",
                description: "Can't select extra items once payment session initiated",
            });
            return false;
        }
        return true;
    };

    const toggleOptional = (id: string) => {
        if (!canToggle()) return;
        includeOptional(id, !selected.includes(id));
    };

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="text-xl text-cyan-400">Pricing &amp; Quote</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* === Pre-Questions (exact text) === */}
                <div className="card qs rounded-lg border p-4 space-y-4" id="pre-questions">
                    <div className="font-semibold">Pre-Questions (auto-applies to the quote below)</div>

                    <ol style={{ marginLeft: 18 }}>
                        <li>
                            Do you have a Singapore-based individual who can act as your company’s local director?
                            <div style={{ marginTop: 6 }}>
                                <label className="mr-4">
                                    <input
                                        type="radio"
                                        name="q-local-dir"
                                        value="yes"
                                        checked={hasLocalDir === "yes"}
                                        onChange={() => setPreAnswers({ hasLocalDir: "yes" })}
                                    />{" "}
                                    Yes, we can appoint an internal local director
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="q-local-dir"
                                        value="no"
                                        checked={hasLocalDir === "no"}
                                        onChange={() => setPreAnswers({ hasLocalDir: "no" })}
                                    />{" "}
                                    No, nominee director is required
                                </label>
                            </div>
                        </li>

                        {hasLocalDir === "no" && (
                            <li style={{ marginTop: 8 }}>
                                Security Deposit for nominee director:
                                <div style={{ marginTop: 6 }}>
                                    <label className="mr-4">
                                        <input
                                            type="radio"
                                            name="q-security"
                                            value="deposit"
                                            checked={ndSecurity === "deposit"}
                                            onChange={() => setPreAnswers({ ndSecurity: "deposit" })}
                                        />{" "}
                                        Security deposit USD 2,000
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="q-security"
                                            value="prepay"
                                            checked={ndSecurity === "prepay"}
                                            onChange={() => setPreAnswers({ ndSecurity: "prepay" })}
                                        />{" "}
                                        Prepay accounting/tax USD 2,000
                                    </label>
                                </div>
                            </li>
                        )}
                    </ol>

                    <div className="text-xs text-muted-foreground">
                        Choices above will toggle the security/prepay options in the initial cost below.
                    </div>
                </div>

                {/* === Table === */}
                <div className="card rounded-lg border">
                    <h3 className="px-4 pt-4 text-lg font-semibold">Incorporation + First Year</h3>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-1/2">Item</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">Selected</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {/* Always mandatory rows */}
                            {MANDATORY.map((r) => (
                                <TableRow key={r.id}>
                                    <TableCell>{r.label}</TableCell>
                                    <TableCell className="text-right">{fmtUSD(r.price)}</TableCell>
                                    <TableCell className="text-right">
                                        <Checkbox checked disabled />
                                    </TableCell>
                                </TableRow>
                            ))}

                            {/* Extra mandatory security (no checkbox; method chosen above) */}
                            {hasLocalDir === "no" && (
                                <>
                                    <TableRow>
                                        <TableCell className="font-medium">
                                            {/* Show the two lines exactly as you asked, but these are informative (no extra beyond the +2000 already counted). */}
                                            <div>[Optional] Accounting/Tax Prepayment</div>
                                            <div className="text-xs text-muted-foreground">
                                                (i) Bookkeeping &amp; CIT filing for the first YA. Alternative to a nominee director deposit.
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">{fmtUSD(2000)}</TableCell>
                                        <TableCell className="text-right">—</TableCell>
                                    </TableRow>

                                    <TableRow>
                                        <TableCell className="font-medium">
                                            <div>[Optional] Nominee Director Deposit</div>
                                            <div className="text-xs text-muted-foreground">
                                                (i) Refundable upon 1-month prior written termination notice.
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">{fmtUSD(2000)}</TableCell>
                                        <TableCell className="text-right">—</TableCell>
                                    </TableRow>
                                </>
                            )}

                            {/* Other optionals (user can toggle) */}
                            {OPTIONALS.map((r) => {
                                const isChecked = selected.includes(r.id);
                                return (
                                    <TableRow key={r.id} className="text-gray-600">
                                        <TableCell>{r.label}</TableCell>
                                        <TableCell className={`text-right ${r.price === 0 ? "text-red-500 font-semibold" : ""}`}>
                                            {fmtUSD(r.price)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Checkbox checked={isChecked} onCheckedChange={() => toggleOptional(r.id)} />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}

                            {/* Totals */}
                            <TableRow className="font-bold bg-gray-50">
                                <TableCell>
                                    Initial <b>mandatory</b> total
                                </TableCell>
                                <TableCell className="text-right" colSpan={2}>
                                    {fmtUSD(initialMandatoryTotal)}
                                </TableCell>
                            </TableRow>
                            <TableRow className="font-bold bg-gray-100">
                                <TableCell>Total incl. options</TableCell>
                                <TableCell className="text-right text-yellow-600" colSpan={2}>
                                    {fmtUSD(totalInclOptions)}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={3} className="text-xs text-muted-foreground">
                                    Assumes standard profile (≤5 individual shareholders). Notarization/translation/apostille &amp; complex KYC are extra.
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};

// const SgServiceSelectionStep = () => {
//     const [form, setForm] = useAtom(sgFormWithResetAtom1);
//     const { t } = useTranslation();
//     console.log("form in service selection step:", form.serviceItemsSelected);
//     const selected: string[] = Array.isArray(form.serviceItemsSelected) ? form.serviceItemsSelected : [];
//     const address = form.businessAddress;
//     const shareholders = Array.isArray(form.shareHolders) ? form.shareHolders : [];
//     const directors = Array.isArray(form.directors) ? form.directors : [];

//     // 1) Base catalog from constants   
//     const catalog: any = service_list.map((s) => ({
//         id: s.id,
//         description: t(s.key),
//         originalPrice: Number(s.price) || 0,
//         discountedPrice: Number(s.price) || 0,
//         isOptional: !!s.isOptional,
//     }));

//     // 2) Dynamic add: Registered business address if Mirr Asia address chosen
//     if (address && address.id === "mirrasiaAddress") {
//         catalog.push({
//             id: "registeredBusinessAddress",
//             description: t("Singapore.regBsnsService"),
//             originalPrice: 350,
//             discountedPrice: 350,
//             isOptional: false,
//         });
//     }

//     // 3) Dynamic add: Corporate Secretary Annual Service per legal entity
//     const legalEntityYesCount =
//         shareholders.filter((x: any) => x?.legalEntity?.id === "Yes").length +
//         directors.filter((x: any) => x?.legalEntity?.id === "Yes").length;

//     if (legalEntityYesCount > 0) {
//         catalog.push({
//             id: "corporateSecretaryAnnualService",
//             description: `${t("Singapore.crpSecAnnualServ")} (${legalEntityYesCount})`,
//             originalPrice: legalEntityYesCount * 550,
//             discountedPrice: legalEntityYesCount * 550,
//             isOptional: false,
//         });
//     }

//     // 4) Dynamic add: Online accounting software package
//     if (form.onlineAccountingSoftware?.value === "yes") {
//         catalog.push({
//             id: "onlineAccountingSoftware",
//             description: t("Singapore.accPackageSixMonths"),
//             originalPrice: 2000,
//             discountedPrice: 2000,
//             isOptional: false,
//         });
//     }

//     // Only include optional items if user selected them; always include non-optional
//     const displayed = catalog.filter((row: any) => !row.isOptional || selected.includes(row.id));

//     // Totals: of displayed items
//     const totalOriginal = displayed.reduce((sum: any, r: any) => sum + (Number(r.originalPrice) || 0), 0);
//     const totalDiscounted = displayed.reduce((sum: any, r: any) => sum + (Number(r.discountedPrice) || 0), 0);

//     const toggleOptional = (id: string) => {
//         if (form.sessionId) {
//             toast({
//                 title: t("Payment Session Initiated"),
//                 description: t("Cant select extra items once payment session initiated"),
//             });
//             return;
//         }
//         const next = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id];
//         setForm({ ...form, serviceItemsSelected: next });
//     };

//     return (
//         <Card className="w-full">
//             <CardHeader className="flex flex-row justify-between items-center">
//                 <CardTitle className="text-xl text-cyan-400">
//                     {t("usa.serviceSelection.heading")}
//                 </CardTitle>
//             </CardHeader>
//             <CardContent>
//                 <Table>
//                     <TableHeader>
//                         <TableRow>
//                             <TableHead className="w-1/2">{t("usa.serviceSelection.col1")}</TableHead>
//                             <TableHead className="text-right">{t("usa.serviceSelection.col2")}</TableHead>
//                             <TableHead className="text-right">{t("usa.serviceSelection.col3")}</TableHead>
//                         </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                         {/* Render non-optional first, then optional that are selected (with checkbox to deselect) */}
//                         {catalog.map((row: any) => {
//                             const isChecked = selected.includes(row.id);
//                             const shouldShow = !row.isOptional || isChecked;
//                             if (!shouldShow) return null;

//                             return (
//                                 <TableRow key={row.id} className={row.isOptional ? "text-gray-600" : ""}>
//                                     <TableCell>
//                                         <div className="flex items-center gap-2">
//                                             {row.isOptional && (
//                                                 <Checkbox checked={isChecked} onCheckedChange={() => toggleOptional(row.id)} />
//                                             )}
//                                             {row.description}
//                                         </div>
//                                     </TableCell>
//                                     <TableCell className={`text-right ${row.originalPrice !== row.discountedPrice ? "line-through text-gray-500" : ""}`}>
//                                         USD {row.originalPrice}
//                                     </TableCell>
//                                     <TableCell className={`text-right ${row.discountedPrice === 0 ? "text-red-500 font-semibold" : ""}`}>
//                                         {row.discountedPrice === 0 ? t("ServiceSelection.FREE") : `USD ${row.discountedPrice}`}
//                                     </TableCell>
//                                 </TableRow>
//                             );
//                         })}
//                         <TableRow className="font-bold bg-gray-100">
//                             <TableCell>{t("usa.serviceSelection.totalCost")}</TableCell>
//                             <TableCell className="text-right line-through text-gray-500">USD {totalOriginal}</TableCell>
//                             <TableCell className="text-right text-yellow-600">USD {totalDiscounted}</TableCell>
//                         </TableRow>
//                     </TableBody>
//                 </Table>
//             </CardContent>
//         </Card>
//     );
// };

const asNumber = (v: any) => (typeof v === "number" ? v : Number(v) || 0);
const fmt = (n: number) => (n > 0 ? `USD ${n.toFixed(2)}` : "USD 0.00");

const InvoiceSgStep: React.FC = () => {
    const [form, setForm] = useAtom(sgFormWithResetAtom1);
    const { t } = useTranslation();



    const hasLocalDir: YesNo = (form?.sg_preAnswers?.hasLocalDir as YesNo) ?? "no";
    const ndSecurity: Security = (form?.sg_preAnswers?.ndSecurity as Security) ?? "deposit";

    const selectedOptionals: string[] = Array.isArray(form?.serviceItemsSelected)
        ? form.serviceItemsSelected
        : [];



    // Build invoice rows to EXACTLY reflect the selection component
    const rows: FeeRow[] = React.useMemo(() => {
        const list: FeeRow[] = [];

        // Always mandatory (same labels & prices)
        list.push(
            { id: "companyIncorporation", description: "Company Incorporation (filing)", originalPrice: 350, discountedPrice: 350 },
            { id: "nomineeDirector", description: "Nominee Director (1 year)", originalPrice: 2000, discountedPrice: 2000 },
            { id: "companySecretary", description: "Company Secretary (1 year)", originalPrice: 480, discountedPrice: 480 },
            { id: "registeredAddress", description: "Registered Address (1 year)", originalPrice: 300, discountedPrice: 300 },
        );

        // Extra mandatory: security 2,000 only if nominee director is required
        if (hasLocalDir === "no") {
            const secLabel =
                ndSecurity === "prepay"
                    ? "Prepay accounting/tax (Nominee Director)"
                    : "Security deposit (Nominee Director)";
            list.push({
                id: "nomineeSecurity",
                description: secLabel,
                originalPrice: 2000,
                discountedPrice: 2000,
            });
        }

        // Optionals shown only if selected (match IDs from ServiceSelectionStep)
        if (selectedOptionals.includes("bankAccountAdvisory")) {
            list.push({
                id: "bankAccountAdvisory",
                description: "Bank Account Advisory (optional)",
                originalPrice: 1200,
                discountedPrice: 1200,
                isOptional: true,
            });
        }
        if (selectedOptionals.includes("emiEAccount")) {
            list.push({
                id: "emiEAccount",
                description: "EMI e-Account Opening (basic) Free",
                originalPrice: 0,
                discountedPrice: 0,
                isOptional: true,
            });
        }

        return list;
    }, [hasLocalDir, ndSecurity, selectedOptionals]);

    // Totals (original == discounted here, but we keep both fields)
    const initialMandatoryTotal = React.useMemo(() => {
        // mandatory = everything except the selected optionals
        return rows
            .filter((r) => !r.isOptional)
            .reduce((s, r) => s + asNumber(r.discountedPrice), 0);
    }, [rows]);

    const totalInclOptions = React.useMemo(() => {
        return rows.reduce((s, r) => s + asNumber(r.discountedPrice), 0);
    }, [rows]);

    // Persist totals & currency back to form for payment step
    React.useEffect(() => {
        setForm((prev: any) => ({
            ...prev,
            initialMandatoryTotal,             // keep for display/analytics
            totalInclOptions,                  // final invoice subtotal (before card fee)
            totalOriginal: totalInclOptions,   // <<— write to legacy field for downstream
            totalDiscounted: totalInclOptions, // <<— keep both in sync
            currency: "USD",
            invoiceItems: rows.map((r) => ({
                id: r.id,
                description: r.description,
                amount: asNumber(r.discountedPrice),
            })),
        }));
    }, [initialMandatoryTotal, totalInclOptions, rows, setForm]);

    return (
        <div className="w-full py-8 px-4">
            <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{t("mirrasisaSSL")}</CardTitle>
                </CardHeader>

                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("invoice.desc")}</TableHead>
                                <TableHead className="text-right">{t("invoice.originalPrice")}</TableHead>
                                <TableHead className="text-right">{t("invoice.discPrice")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className={item.isHighlight ? "font-semibold" : ""}>{item.description}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground">
                                        {fmt(asNumber(item.originalPrice))}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {fmt(asNumber(item.discountedPrice))}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Totals Card */}
                    <div className="mt-4 flex justify-end">
                        <Card className="w-80">
                            <CardContent className="pt-4">
                                <div className="flex justify-between mb-2">
                                    <span className="font-xs text-xs line-through text-gray-500">{t("invoice.total")}:</span>
                                    <span className="font-xs text-xs line-through text-gray-500">
                                        {fmt(totalInclOptions)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-green-600">
                                    <span className="font-medium">{t("invoice.totalDisc")}:</span>
                                    <span className="font-bold">{fmt(totalInclOptions)}</span>
                                </div>
                                {/* If you want to show the initial mandatory in the card too, uncomment: */}
                                {/* <div className="flex justify-between text-sm mt-2">
                  <span>Initial mandatory total:</span>
                  <span>{fmt(initialMandatoryTotal)}</span>
                </div> */}
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// const InvoiceSgStep = () => {
//     const [form, setForm] = useAtom(sgFormWithResetAtom1);
//     const { t } = useTranslation();

//     const selectedOptionals: string[] = Array.isArray(form?.serviceItemsSelected)
//         ? form.serviceItemsSelected
//         : [];

//     const rows: FeeRow[] = useMemo(() => {
//         // derive parties/address inside memo to avoid unstable deps caused by inline conditionals
//         const parties = Array.isArray(form?.parties) ? form.parties : [];
//         const address = form?.businessAddress;

//         // 1) Base catalog
//         const base: FeeRow[] = service_list.map((s) => ({
//             id: s.id,
//             description: t(s.key),
//             originalPrice: asNumber(s.price),
//             discountedPrice: asNumber(s.price),
//             isOptional: !!s.isOptional,
//             note: "",
//             isHighlight: false,
//         }));

//         // 2) Dynamic adds (always included; these are not optional)
//         const out: FeeRow[] = [...base];

//         if (address && address.id === "mirrasiaAddress") {
//             out.push({
//                 id: "registeredBusinessAddress",
//                 description: t("Singapore.regBsnsService"),
//                 originalPrice: 350,
//                 discountedPrice: 350,
//                 isOptional: false,
//                 note: "",
//             });
//         }

//         const legalEntityYesCount = parties.filter(
//             (p: any) => p?.isCorp === true && (p?.isDirector === true || (Number(p?.shares) || 0) > 0)
//         ).length;

//         if (legalEntityYesCount > 0) {
//             out.push({
//                 id: "corporateSecretaryAnnualService",
//                 description: `${t("Singapore.crpSecAnnualServ")} (${legalEntityYesCount})`,
//                 originalPrice: legalEntityYesCount * 550,
//                 discountedPrice: legalEntityYesCount * 550,
//                 isOptional: false,
//                 note: "",
//             });
//         }

//         if (form?.onlineAccountingSoftware?.value === "yes") {
//             out.push({
//                 id: "onlineAccountingSoftware",
//                 description: t("Singapore.accPackageSixMonths"),
//                 originalPrice: 2000,
//                 discountedPrice: 2000,
//                 isOptional: false,
//                 note: "",
//             });
//         }

//         // 3) For invoice display:
//         //    - Always include non-optional items
//         //    - Include optional items ONLY if selected
//         return out.filter((r) => !r.isOptional || selectedOptionals.includes(r.id));
//     }, [t, form, selectedOptionals]);

//     const totalOriginal = rows.reduce((sum, r) => sum + asNumber(r.originalPrice), 0);
//     const totalDiscounted = rows.reduce((sum, r) => sum + asNumber(r.discountedPrice), 0);
//     React.useEffect(() => {
//         setForm((prev: any) => ({
//             ...prev,
//             totalOriginal,
//             totalDiscounted,
//             currency: "USD",
//         }));
//     }, [totalOriginal, totalDiscounted, setForm]);

//     return (
//         <div className="w-full py-8 px-4">
//             <Card className="w-full">
//                 <CardHeader className="flex flex-row items-center justify-between">
//                     <CardTitle>{t("mirrasisaSSL")}</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                     <Table>
//                         <TableHeader>
//                             <TableRow>
//                                 <TableHead>{t("invoice.desc")}</TableHead>
//                                 <TableHead className="text-right">{t("invoice.originalPrice")}</TableHead>
//                                 <TableHead className="text-right">{t("invoice.discPrice")}</TableHead>
//                                 {/* <TableHead className="text-right">{t("invoice.notes")}</TableHead> */}
//                             </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                             {rows.map((item) => (
//                                 <TableRow key={item.id}>
//                                     <TableCell>
//                                         <div className="flex items-center gap-2">
//                                             <span className={item.isHighlight ? "font-semibold" : ""}>{item.description}</span>
//                                         </div>
//                                     </TableCell>
//                                     <TableCell className="text-right text-muted-foreground">
//                                         {asNumber(item.originalPrice) > 0 ? `USD ${asNumber(item.originalPrice).toFixed(2)}` : "USD 0.00"}
//                                     </TableCell>
//                                     <TableCell className="text-right font-medium">
//                                         {asNumber(item.discountedPrice) > 0 ? `USD ${asNumber(item.discountedPrice).toFixed(2)}` : "USD 0.00"}
//                                     </TableCell>
//                                     {/* <TableCell className="text-right text-sm text-muted-foreground">{item.note || ""}</TableCell> */}
//                                 </TableRow>
//                             ))}
//                         </TableBody>
//                     </Table>

//                     {/* Totals */}
//                     <div className="mt-4 flex justify-end">
//                         <Card className="w-80">
//                             <CardContent className="pt-4">
//                                 <div className="flex justify-between mb-2">
//                                     <span className="font-xs text-xs line-through text-gray-500">{t("invoice.total")}:</span>
//                                     <span className="font-xs text-xs line-through text-gray-500">USD {totalOriginal.toFixed(2)}</span>
//                                 </div>
//                                 <div className="flex justify-between text-green-600">
//                                     <span className="font-medium">{t("invoice.totalDisc")}:</span>
//                                     <span className="font-bold">USD {totalDiscounted.toFixed(2)}</span>
//                                 </div>
//                             </CardContent>
//                         </Card>
//                     </div>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// };

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
    const subtotal = asNum(app?.totalInclOptions ?? app?.totalOriginal ?? 0);

    const cardFeeRate = 0.035;
    const needsCardFee = app?.payMethod === "card";

    const total = needsCardFee ? subtotal * (1 + cardFeeRate) : subtotal;
    return Math.round(total * 100) / 100; // cents-safe
}

const PaymentStep = () => {
    const [form, setForm] = useAtom(sgFormWithResetAtom1);
    const { t } = useTranslation();

    // Compute grand total using SG logic
    const grand = computeSgGrandTotal(form);
    console.log("Computed SG grand total:", grand);
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
            const result = await uploadIncorpoPaymentBankProof(form._id || "", "sg", bankFile, method, expiresAt);
            if (result) {
                setForm((prev: any) => ({ ...prev, uploadReceiptUrl: result?.url }));
            }
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteBankProof = async () => {
        if (guard(t("newHk.payment.alerts.expiredGuard"))) return;
        await deleteIncorpoPaymentBankProof(form._id || "", "sg");
        setForm((prev: any) => ({ ...prev, uploadReceiptUrl: undefined }));
    };

    const handleProceedCard = async () => {
        if (guard(t("newHk.payment.alerts.expiredGuard"))) return;

        if (clientSecret && form.paymentIntentId) {
            setCardDrawerOpen(true);
            return;
        }
        console.log("form", form)
        setCreatingPI(true);
        try {
            const fp = {
                companyId: form._id ?? null,
                totalCents: Math.round(grand * 100),
                country: "SG",
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

const SgFinalSectionStep: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    let role: string | undefined;
    try {
        const token = localStorage.getItem("token") || "";
        if (token) role = (jwtDecode(token) as TokenData)?.role;
    } catch {
        role = undefined;
    }

    const handleReturn = () => {
        if (role && ["admin", "master"].includes(role)) {
            navigate("/admin-dashboard");
        } else {
            localStorage.removeItem("companyRecordId");
            navigate("/dashboard");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[70vh] px-4">
            <Card className="w-full max-w-md shadow-md border border-green-200">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-semibold text-green-600">
                        {t("finalMsg.congrats")}
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4 text-center text-gray-700">
                    <p>{t("Singapore.finalSgTake")}</p>
                    <p>{t("SwitchService.Consultation.thanks")}</p>
                </CardContent>

                <CardFooter className="flex justify-center">
                    <Button className="bg-green-600 hover:bg-green-700" onClick={handleReturn}>
                        {t("finalMsg.returntoDash")}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

const CONFIG: FormConfig = {
    title: "Company Incorporation — Singapore",
    steps: [
        {
            id: "applicant",
            title: "Applicant Information",
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
                    type: "checkbox-group",
                    name: "establishedRelationshipType",
                    label: "newHk.steps.applicant.fields.roles.label",
                    tooltip: "newHk.steps.applicant.fields.roles.tooltip",
                    required: true,
                    colSpan: 2,
                    options: [
                        { label: "newHk.steps.applicant.fields.roles.options.Director", value: "Director" },
                        { label: "newHk.steps.applicant.fields.roles.options.Shareholder", value: "Shareholder" },
                        { label: "newHk.steps.applicant.fields.roles.options.Authorized", value: "Authorized" },
                        { label: "newHk.steps.applicant.fields.roles.options.Professional", value: "Professional" },
                        { label: "newHk.steps.applicant.fields.roles.options.Other", value: "Other" },
                    ],
                },
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
                    name: "sgAccountingDeclarationIssues",
                    label:
                        "Singapore.clientAccountTax",
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
                // 
                {
                    type: "radio-group",
                    name: "annualRenewalConsent",
                    label: "Singapore.clientAnnualRenew",
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
                        "Singapore.singFollowingCompaniesActivity",
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
        {
            id: "services",
            title: "usa.steps.step5",
            description:
                "usa.steps.services.description",
            render: SgServiceSelectionStep,
        },
        {
            id: "invoice",
            title: "usa.steps.step6",
            description:
                "usa.steps.invoice.description",
            render: InvoiceSgStep,
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
            render: SgFinalSectionStep,
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
                <span className="text-xs font-semibold truncate">Company Incorporation — Singapore</span>
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
    const [form, setForm] = useAtom(sgFormWithResetAtom1);
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
    const [form, setForm] = useAtom(sgFormWithResetAtom1);
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

        default:
            return null;
    }
};


const SgIncorpForm: React.FC = () => {
    const { t } = useTranslation();
    const [form, setForm] = useAtom(sgFormWithResetAtom1);
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

    const updateDoc = async () => {
        // setIsSubmitting(true);
        if (isSubmitting) {
            return;
        }
        const token = localStorage.getItem("token") as string;
        const decodedToken = jwtDecode<TokenData>(token);
        setIsSubmitting(true);
        form.userId = `${decodedToken.userId}`
        const payload = { ...form };
        try {
            // console.log("payload", payload)
            const response = await api.post("/company/sg-form", payload);
            if (response.status === 200) {
                // console.log("formdata", response.data);
                localStorage.setItem("companyRecordId", response.data.data._id);
                setForm(response.data.data)
                window.history.pushState(
                    {},
                    "",
                    `/company-register/SG/${response.data.data._id}`
                );
            } else {
                console.log("error-->", response);
            }
        } catch (error) {
            console.error("Submission error:", error);
        } finally {
            console.log("finally");
            setIsSubmitting(false);
            setStepIdx((i) => Math.min(i + 1, CONFIG.steps.length - 1));
        }
    }

    const handleNext = async () => {
        if (!canProceed) {
            toast({ title: "Missing information", description: "Please complete required fields to continue.", variant: "destructive" });
            return;
        }
        console.log("form", form)
        await updateDoc();
    };

    const back = () => setStepIdx((i) => Math.max(0, i - 1));
    console.log("missing", missing)
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

export default SgIncorpForm;