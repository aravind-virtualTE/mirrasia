/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Loader2, CreditCard, Building2, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { API_URL } from "@/services/fetch";
// import type { McapFees } from "../configs/types";

// --- Constants & API ---
const STRIPE_CLIENT_ID = import.meta.env.VITE_STRIPE_DETAILS || process.env.REACT_APP_STRIPE_DETAILS;
const stripePromise = loadStripe(STRIPE_CLIENT_ID);
const API_BASE = API_URL.replace(/\/+$/, "");

const createPaymentIntent = async (payload: { amount: number; currency: string; companyId: string }) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/mcap/invoice-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ companyId: payload.companyId, totalCents: payload.amount, currency: payload.currency })
    });
    return res.json();
};

// const updatePaymentIntent = async (payload: { paymentIntentId: string; amount: number; currency: string; companyId: string }) => {
//     const token = localStorage.getItem("token");
//     const res = await fetch(`${API_BASE}/mcap/update-intent`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
//         body: JSON.stringify({ paymentIntentId: payload.paymentIntentId, totalCents: payload.amount, currency: payload.currency, companyId: payload.companyId })
//     });
//     return res.json();
// };

const updateBackendWithPayment = async (payload: any) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/mcap/confirm-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        // We'll need t here but these are outside component. 
        // We can pass t in or use a translation key from the error if available.
        // For now, I'll keep the error structure and handle translation in the component UI if possible.
        // But the task is to implement i18n for hardcoded strings.
        const message = data?.error || data?.message || "Failed to confirm payment.";
        throw new Error(message);
    }
    return data;
};

const uploadBankProof = async (companyId: string, file: File, bankRef: string) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("paymethod", "bank");
    if (bankRef) formData.append("bankRef", bankRef);

    const res = await fetch(`${API_BASE}/mcap/companies/${companyId}/bank-proof`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
    });
    return res.json();
};

const deleteBankProof = async (companyId: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/mcap/companies/${companyId}/bank-proof`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const message = data?.error || data?.message || "Failed to delete proof.";
        throw new Error(message);
    }
    return data;
};

const fetchCompanyPayment = async (companyId: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/mcap/companies/${companyId}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const message = data?.error || data?.message || "Failed to fetch payment status.";
        throw new Error(message);
    }
    return data?.data || data;
};

// --- Types ---
interface StripeSuccessInfo {
    receiptUrl?: string;
    amount?: number;
    currency?: string;
    paymentIntentStatus?: string;
    paymentIntentId?: string;
}

// --- Stripe Components ---

function StripePaymentForm({
    amount,
    currency,
    companyId,
    paymentIntentId,
    onSuccess,
    onClose
}: {
    amount: number;
    currency: string;
    companyId: string;
    paymentIntentId: string;
    onSuccess: (info: StripeSuccessInfo) => void;
    onClose: () => void;
}) {
    const stripe = useStripe();
    const elements = useElements();
    const { t } = useTranslation();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConfirm = async () => {
        if (!stripe || !elements) return;
        setSubmitting(true);
        setError(null);

        try {
            const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: window.location.href, // Not used if redirect: if_required
                },
                redirect: "if_required",
            });

            if (stripeError) {
                setError(stripeError.message ?? t("mcap.payment.errors.paymentFailed", "Payment failed. Please try again."));
                setSubmitting(false);
                return;
            }

            // Sync with backend
            if (paymentIntent?.status === "succeeded" || paymentIntent?.status === "processing") {
                try {
                    const result = await updateBackendWithPayment({
                        paymentIntentId,
                        companyId,
                    });

                    onSuccess({
                        receiptUrl: result?.receiptUrl,
                        amount: result?.amount ?? paymentIntent.amount,
                        currency: result?.currency ?? paymentIntent.currency,
                        paymentIntentStatus: result?.status ?? paymentIntent.status,
                        paymentIntentId: paymentIntent.id,
                    });
                } catch (err) {
                    const message = err instanceof Error ? err.message : t("mcap.payment.errors.serverSyncFailed", "Payment confirmed but server communication failed.");
                    setError(message);
                    console.error(err);
                }
            }
        } catch (e: any) {
            setError(e.message || t("mcap.payment.errors.unexpected", "An unexpected error occurred."));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-4">
            <PaymentElement />
            {error && (
                <div className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-2 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}
            <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="outline" onClick={onClose} disabled={submitting}>{t("mcap.payment.cancel", "Cancel")}</Button>
                <Button onClick={handleConfirm} disabled={!stripe || !elements || submitting}>
                    {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {t("mcap.payment.pay", {
                        amount: new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount),
                        defaultValue: `Pay ${new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount)}`
                    })}
                </Button>
            </div>
        </div>
    );
}

function StripeCardDrawer({
    open,
    onOpenChange,
    clientSecret,
    amount,
    currency,
    companyId,
    paymentIntentId,
    onSuccess
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    clientSecret: string;
    amount: number;
    currency: string;
    companyId: string;
    paymentIntentId: string;
    onSuccess: (info: StripeSuccessInfo) => void;
}) {
    const options = useMemo(() => ({
        clientSecret,
        appearance: { theme: "stripe" as const },
    }), [clientSecret]);
    const { t } = useTranslation();

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{t("mcap.payment.securePayment", "Secure Payment")}</SheetTitle>
                    <SheetDescription>
                        {t("mcap.payment.totalToPay", "Total to pay:")} <b>{new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount)}</b>
                    </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                    {clientSecret ? (
                        <Elements stripe={stripePromise} options={options}>
                            <StripePaymentForm
                                amount={amount}
                                currency={currency}
                                companyId={companyId}
                                paymentIntentId={paymentIntentId}
                                onSuccess={onSuccess}
                                onClose={() => onOpenChange(false)}
                            />
                        </Elements>
                    ) : (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}

// --- Main Widget ---

export const PaymentWidget = ({
    fees,
    currency,
    companyId,
    onPaymentComplete,
    data,
    onChange,
    initialPaymentStatus,
}: {
    fees?: any; // Accepting flexible fees object or number
    currency: string;
    supportedCurrencies?: string[];
    companyId?: string | null;
    onPaymentComplete: () => void | Promise<void>;
    data: any;
    onChange: (data: any) => void;
    initialPaymentStatus?: {
        status: string;
        receiptUrl?: string;
        bankProofUrl?: string;
        lastStatus?: string;
        paymentIntentId?: string;
        amount?: number;
        currency?: string;
    };
}) => {
    const { t } = useTranslation();

    // 2. State
    const [payMethod, setPayMethod] = useState<"card" | "bank">(data?.payMethod || "card");
    const [stripeDrawerOpen, setStripeDrawerOpen] = useState(false);

    // 1. Parsing Fees
    // The previous steps (InvoiceWidget) finalized the currency and total.
    // Ideally 'fees' here is the final object { total, currency, items }.
    // If it's a number, we fallback.
    const fallbackCurrency = data?.paymentCurrency || data?.currency || currency || "HKD";
    const finalFees = useMemo(() => {
        if (typeof fees === "number") return { total: fees, currency: fallbackCurrency, items: [] };
        if (fees && typeof fees.total === "number") return { ...fees, currency: fees.currency || fallbackCurrency };
        return { total: 0, currency: fallbackCurrency, items: [] };
    }, [fees, fallbackCurrency]);

    const activeCurrency = finalFees.currency || fallbackCurrency;
    const subtotal = finalFees.total;
    const cardFeePct = String(activeCurrency).toUpperCase() === "USD" ? 0.06 : 0.04;
    const exchangeRateUsed = typeof (finalFees as any).exchangeRateUsed === "number"
        ? Number((finalFees as any).exchangeRateUsed)
        : undefined;
    const originalAmountUsd = typeof (finalFees as any).originalAmountUsd === "number"
        ? Number((finalFees as any).originalAmountUsd)
        : undefined;
    const hasFxBreakdown = String(activeCurrency).toUpperCase() !== "USD"
        && typeof exchangeRateUsed === "number"
        && typeof originalAmountUsd === "number";

    // If payMethod is card, use grandTotal (which includes surcharge). 
    // If payMethod is bank, use the base total (subtotal).
    const amountToPay = useMemo(() => {
        const fee = payMethod === "card" ? (finalFees.cardFeeSurcharge || (subtotal * cardFeePct)) : 0;
        return subtotal + fee;
    }, [payMethod, finalFees, subtotal, cardFeePct]);

    const cardFee = payMethod === "card" ? (amountToPay - subtotal) : 0;

    const formatAmount = (amt: number, cur: string) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: cur.toUpperCase(),
        }).format(amt);
    };

    // Stripe State
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
    const [isInitStripe, setIsInitStripe] = useState(false);

    // Bank State
    const [bankRef, setBankRef] = useState("");
    const [bankFile, setBankFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [bankUploadedUrl, setBankUploadedUrl] = useState<string | null>(null);
    const [bankProofDenied, setBankProofDenied] = useState(false);
    const [approvedByAdmin, setApprovedByAdmin] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Success State
    const [successInfo, setSuccessInfo] = useState<StripeSuccessInfo | null>(null);

    // Check initial payment status on mount
    useEffect(() => {
        const status = (initialPaymentStatus?.status || "").toLowerCase();
        const isPaid = ["paid", "completed", "succeeded"].includes(status);
        const isPending = ["pending", "pending_review", "pending-review", "under_review", "unpaid"].includes(status);
        const isDenied = ["denied", "rejected", "declined", "failed"].includes(status);

        if (isPaid) {
            setSuccessInfo({
                receiptUrl: initialPaymentStatus?.receiptUrl || initialPaymentStatus?.bankProofUrl || "",
                paymentIntentStatus: initialPaymentStatus?.lastStatus || "succeeded",
                paymentIntentId: initialPaymentStatus?.paymentIntentId,
                amount: initialPaymentStatus?.amount,
                currency: initialPaymentStatus?.currency,
            });
            setBankUploadedUrl(null);
            setBankProofDenied(false);
            const adminApproved =
                !initialPaymentStatus?.receiptUrl &&
                (
                    data?.payMethod === "bank" ||
                    !!initialPaymentStatus?.bankProofUrl ||
                    initialPaymentStatus?.lastStatus !== "succeeded"
                );
            setApprovedByAdmin(adminApproved);
            return;
        }

        setSuccessInfo(null);
        if ((isPending || isDenied) && initialPaymentStatus?.bankProofUrl) {
            setBankUploadedUrl(initialPaymentStatus.bankProofUrl);
        } else {
            setBankUploadedUrl(null);
        }
        setBankProofDenied(isDenied);
        setApprovedByAdmin(false);
    }, [
        initialPaymentStatus?.status,
        initialPaymentStatus?.receiptUrl,
        initialPaymentStatus?.bankProofUrl,
        initialPaymentStatus?.lastStatus,
        initialPaymentStatus?.paymentIntentId,
        initialPaymentStatus?.amount,
        initialPaymentStatus?.currency,
        data?.payMethod,
    ]);

    useEffect(() => {
        if (data?.payMethod && data.payMethod !== payMethod) {
            setPayMethod(data.payMethod);
        }
    }, [data?.payMethod]);

    // 3. Handlers
    const handleMethodChange = (v: "card" | "bank") => {
        setPayMethod(v);
        if (onChange) {
            onChange({ ...data, payMethod: v });
        }
    };


    const handleInitStripe = async () => {
        if (!companyId) {
            toast({ title: t("mcap.payment.errors.generic", "Error"), description: t("mcap.payment.errors.notSaved", "Application not saved."), variant: "destructive" });
            return;
        }
        if (amountToPay <= 0) {
            onPaymentComplete(); // Nothing to pay
            return;
        }

        setIsInitStripe(true);
        try {
            const res = await createPaymentIntent({
                amount: Math.round(amountToPay * 100),
                currency: activeCurrency.toLowerCase(),
                companyId
            });

            if (res?.clientSecret) {
                setClientSecret(res.clientSecret);
                setPaymentIntentId(res.id);
                setStripeDrawerOpen(true);
            } else {
                toast({ title: t("mcap.payment.errors.generic", "Error"), description: t("mcap.payment.errors.stripeInitFailed", "Could not initialize Stripe."), variant: "destructive" });
            }
        } catch (e) {
            console.error(e);
            toast({ title: t("mcap.payment.errors.generic", "Error"), description: t("mcap.payment.errors.networkError", "Network error initializing payment."), variant: "destructive" });
        } finally {
            setIsInitStripe(false);
        }
    };

    const handleBankSubmit = async () => {
        if (!companyId || !bankFile) return;
        setIsUploading(true);
        try {
            const res = await uploadBankProof(companyId, bankFile, bankRef);
            if (res?.success || res?.url) { // backend returns { success: true, url: ... } or just url sometimes
                const url = res.url || res.data?.uploadReceiptUrl;
                setBankUploadedUrl(url);
                setBankProofDenied(false);
                setApprovedByAdmin(false);
                if (onChange) {
                    onChange({
                        ...data,
                        payMethod: "bank",
                        paymentStatus: "pending",
                        uploadReceiptUrl: url || "",
                    });
                }
                toast({ title: t("mcap.payment.messages.success", "Success"), description: t("mcap.payment.messages.proofUploaded", "Proof uploaded successfully.") });
                // We don't auto-advance instantly for bank, or do we?
                // Usually we let them see the success state, then click "Continue" or auto-advance.
                // Note: onPaymentComplete is called after timeout or manual button
            } else {
                toast({ title: t("mcap.payment.errors.generic", "Error"), description: t("mcap.payment.errors.uploadFailed", "Upload failed."), variant: "destructive" });
            }
        } catch (e) {
            console.error(e);
            toast({ title: t("mcap.payment.errors.generic", "Error"), description: t("mcap.payment.errors.uploadException", "Upload exception."), variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };

    const handleRefreshStatus = async () => {
        if (!companyId) return;
        setIsRefreshing(true);
        try {
            const company = await fetchCompanyPayment(companyId);
            const status = (company?.paymentStatus || "").toLowerCase();
            const paymentMeta = {
                paymentStatus: company?.paymentStatus,
                payMethod: company?.payMethod,
                paymentIntentId: company?.paymentIntentId,
                stripeLastStatus: company?.stripeLastStatus,
                stripeReceiptUrl: company?.stripeReceiptUrl,
                stripeAmountCents: company?.stripeAmountCents,
                stripeCurrency: company?.stripeCurrency,
                uploadReceiptUrl: company?.uploadReceiptUrl,
            };

            if (onChange) {
                onChange({ ...data, ...paymentMeta });
            }
            if (company?.payMethod) {
                setPayMethod(company.payMethod);
            }

            const isPaid = ["paid", "completed", "succeeded"].includes(status);
            const isDenied = ["denied", "rejected", "declined", "failed"].includes(status);
            const isPending = ["pending", "pending_review", "pending-review", "under_review", "unpaid"].includes(status);

            if (isPaid) {
                setSuccessInfo({
                    receiptUrl: company?.stripeReceiptUrl || company?.uploadReceiptUrl || "",
                    paymentIntentStatus: company?.stripeLastStatus || "succeeded",
                    paymentIntentId: company?.paymentIntentId,
                    amount: company?.stripeAmountCents,
                    currency: company?.stripeCurrency,
                });
                setBankUploadedUrl(null);
                setBankProofDenied(false);
                const adminApproved =
                    (company?.payMethod === "bank" || !!company?.uploadReceiptUrl);
                setApprovedByAdmin(adminApproved);
                toast({ title: t("mcap.payment.messages.updated", "Updated"), description: t("mcap.payment.messages.statusRefreshed", "Payment status refreshed.") });
                return;
            }

            setSuccessInfo(null);
            if ((isPending || isDenied) && company?.uploadReceiptUrl) {
                setBankUploadedUrl(company.uploadReceiptUrl);
            } else {
                setBankUploadedUrl(null);
            }
            setBankProofDenied(isDenied);
            setApprovedByAdmin(false);
            toast({ title: t("mcap.payment.messages.updated", "Updated"), description: t("mcap.payment.messages.statusRefreshed", "Payment status refreshed.") });
        } catch (err) {
            const message = err instanceof Error ? err.message : t("mcap.payment.errors.fetchFailed", "Failed to refresh payment status.");
            toast({ title: t("mcap.payment.errors.generic", "Error"), description: message, variant: "destructive" });
        } finally {
            setIsRefreshing(false);
        }
    };

    // 4. Render

    // Success View
    if (successInfo) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-6 border-2 border-green-100 rounded-xl bg-green-50/30 shadow-sm animate-in fade-in duration-500">
                <div className="relative">
                    <CheckCircle2 className="w-20 h-20 text-green-500 animate-in zoom-in spin-in-3 duration-700" />
                </div>

                <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-green-900">{t("mcap.payment.success", "Payment Successful!")}</h3>
                    <p className="text-green-700 max-w-sm mx-auto text-sm">
                        {t("mcap.payment.successDesc", "Your payment has been processed and verified. Our accounting team has been notified.")}
                    </p>
                </div>

                <div className="w-full max-w-sm bg-white border border-green-100 rounded-lg p-4 space-y-3 shadow-sm text-sm">
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground font-medium">{t("mcap.payment.paymentId", "Payment ID")}</span>
                        <span className="font-mono text-xs text-green-800">{successInfo.paymentIntentId || paymentIntentId}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground font-medium">{t("mcap.payment.amountPaid", "Amount Paid")}</span>
                        <span className="font-bold text-green-700">
                            {successInfo.amount
                                ? formatAmount(successInfo.amount / 100, successInfo.currency || "USD")
                                : formatAmount(amountToPay, activeCurrency)}
                        </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground font-medium">{t("mcap.payment.status", "Status")}</span>
                        <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-800 border-green-300">{t("mcap.payment.paid", "Paid")}</Badge>
                            {approvedByAdmin && (
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                    {t("mcap.payment.adminApproved", "Admin Approved")}
                                </Badge>
                            )}
                        </div>
                    </div>
                    {payMethod === "card" && successInfo.paymentIntentStatus && (
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground font-medium">{t("mcap.payment.stripeStatus", "Stripe Status")}</span>
                            <Badge variant="outline">{successInfo.paymentIntentStatus}</Badge>
                        </div>
                    )}
                    {successInfo.receiptUrl && (
                        <div className="flex justify-between items-center pt-1">
                            <span className="text-muted-foreground font-medium">{t("mcap.payment.receipt", "Receipt")}</span>
                            <a
                                href={successInfo.receiptUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors font-semibold text-xs"
                            >
                                <FileText className="w-3.5 h-3.5" />
                                {t("mcap.payment.viewReceipt", "View Receipt")}
                            </a>
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-center gap-2">
                    <div className="flex gap-3">
                        <Button
                            onClick={handleRefreshStatus}
                            variant="outline"
                            disabled={isRefreshing}
                        >
                            {isRefreshing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            {t("mcap.payment.refreshStatus", "Refresh Status")}
                        </Button>
                        <Button onClick={onPaymentComplete} size="lg" className="px-10 font-bold shadow-md hover:scale-105 transition-transform bg-green-600 hover:bg-green-700">
                            {t("mcap.payment.continue", "Continue to Next Step")}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (bankUploadedUrl) {
        const handleDeleteProof = async () => {
            if (!companyId) return;
            try {
                await deleteBankProof(companyId);
                setBankUploadedUrl(null);
                setBankFile(null);
                setBankRef("");
                setBankProofDenied(false);
                setApprovedByAdmin(false);
                if (onChange) {
                    onChange({
                        ...data,
                        uploadReceiptUrl: "",
                    });
                }
                toast({ title: t("mcap.payment.messages.deleted", "Deleted"), description: t("mcap.payment.messages.proofRemoved", "Proof removed. Please upload a new file.") });
            } catch (err) {
                const message = err instanceof Error ? err.message : t("mcap.payment.errors.deleteFailed", "Failed to delete proof.");
                toast({ title: t("mcap.payment.errors.generic", "Error"), description: message, variant: "destructive" });
            }
        };

        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-6 border-2 border-blue-100 rounded-xl bg-blue-50/30 shadow-sm animate-in fade-in duration-500">
                <div className="relative">
                    <CheckCircle2 className="w-20 h-20 text-blue-500 animate-in zoom-in duration-700" />
                </div>

                <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-blue-900">{t("mcap.payment.proofSubmitted", "Proof Submitted")}</h3>
                    <p className="text-blue-700 max-w-sm mx-auto text-sm">
                        {t("mcap.payment.proofSubmittedDesc", "Your bank transfer proof has been uploaded. Our accounting team will verify the payment and update the status within 24 hours.")}
                    </p>
                </div>

                <div className="w-full max-w-sm bg-white border border-blue-100 rounded-lg p-4 space-y-3 shadow-sm text-sm">
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground font-medium">{t("mcap.payment.reference", "Reference")}</span>
                        <span className="font-mono text-xs text-blue-800">{bankRef || "N/A"}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground font-medium">{t("mcap.payment.status", "Status")}</span>
                        {bankProofDenied ? (
                            <Badge variant="outline" className="bg-red-100/50 text-red-700 border-red-200">{t("mcap.payment.rejected", "Rejected")}</Badge>
                        ) : (
                            <Badge variant="outline" className="bg-blue-100/50 text-blue-700 border-blue-200">{t("mcap.payment.pendingReview", "Pending Review")}</Badge>
                        )}
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground font-medium">{t("mcap.payment.amountDue", "Amount Due")}</span>
                        <span className="font-bold text-blue-700">{formatAmount(amountToPay, activeCurrency)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                        <span className="text-muted-foreground font-medium">{t("mcap.payment.proofDocument", "Proof Document")}</span>
                        <a
                            href={bankUploadedUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors font-semibold text-xs"
                        >
                            <FileText className="w-3.5 h-3.5" />
                            {t("mcap.payment.viewProof", "View Proof")}
                        </a>
                    </div>
                </div>

                <p className="text-xs text-muted-foreground max-w-sm text-center">
                    {bankProofDenied
                        ? t("mcap.payment.proofDeniedShort", "Your proof was denied. Please delete it and upload a new receipt.")
                        : t("mcap.payment.proofDeleteNote", "If your proof is denied, you can delete it below and upload a new one.")}
                </p>

                <div className="flex flex-col items-center gap-2">
                    <div className="flex gap-3">
                        <Button
                            onClick={handleRefreshStatus}
                            variant="outline"
                            disabled={isRefreshing}
                        >
                            {isRefreshing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            {t("mcap.payment.refreshStatus", "Refresh Status")}
                        </Button>
                        <Button
                            onClick={handleDeleteProof}
                            variant="outline"
                            className="px-6 text-red-600 hover:bg-red-50"
                        >
                            {t("mcap.payment.deleteReupload", "Delete & Re-upload")}
                        </Button>
                    </div>
                    {!bankProofDenied && (
                        <div className="text-xs text-muted-foreground text-center">
                            {t("mcap.payment.waitingApproval", "Waiting for admin approval. You can continue after approval.")}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">

                {/* Left: Method Selection */}
                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <div className="font-semibold">{t("mcap.payment.selectMethod", "Select Payment Method")}</div>
                        <RadioGroup
                            value={payMethod}
                            onValueChange={(v) => handleMethodChange(v as "card" | "bank")}
                            className="space-y-3"
                        >
                            <label className={cn(
                                "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all",
                                payMethod === "card" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-muted/50"
                            )}>
                                <RadioGroupItem value="card" className="mt-0.5" />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-primary" />
                                        <span className="font-medium">{t("mcap.payment.cardPayment", "Card Payment")}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">{t("mcap.payment.cardPaymentDesc", "Secure payment via Stripe")}</p>
                                </div>
                            </label>

                            <label className={cn(
                                "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all",
                                payMethod === "bank" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-muted/50"
                            )}>
                                <RadioGroupItem value="bank" className="mt-0.5" />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-primary" />
                                        <span className="font-medium">{t("mcap.payment.bankTransfer", "Bank Transfer")}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">{t("mcap.payment.bankTransferDesc", "Wire transfer to our account")}</p>
                                </div>
                            </label>
                        </RadioGroup>
                    </CardContent>
                </Card>

                {/* Right: Action Area */}
                <Card>
                    <CardContent className="pt-6 space-y-6">
                        <div className="font-semibold">{t("mcap.payment.details", "Payment Details")}</div>

                        {hasFxBreakdown && (
                            <div className="space-y-1 p-3 bg-muted/40 rounded-md border text-xs">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t("mcap.payment.originalUsd", "Original (USD)")}</span>
                                    <span className="font-medium">{formatAmount(originalAmountUsd, "USD")}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t("mcap.payment.exchangeRate", "Exchange Rate")}</span>
                                    <span className="font-medium">1 USD = {exchangeRateUsed.toFixed(4)} {String(activeCurrency).toUpperCase()}</span>
                                </div>
                            </div>
                        )}

                        {payMethod === "card" && (
                            <div className="space-y-4">
                                <div className="text-sm text-muted-foreground">
                                    {t("mcap.payment.cardRedirectNote", "You will be redirected to a secure payment drawer to complete your purchase using a credit or debit card.")}
                                </div>
                                <div className="space-y-2 p-3 bg-muted rounded-lg border">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">{t("mcap.payment.subtotal", "Subtotal")}</span>
                                        <span className="font-medium text-slate-700">{formatAmount(subtotal, activeCurrency)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-1">
                                            <span className="text-muted-foreground">{t("mcap.payment.cardFee", "Card Processing Fee")}</span>
                                            <Badge variant="outline" className="text-[10px] py-0 h-4 bg-primary/5 text-primary border-primary/20">
                                                {Math.round(cardFeePct * 100)}%
                                            </Badge>
                                        </div>
                                        <span className="font-medium text-slate-700">{formatAmount(cardFee, activeCurrency)}</span>
                                    </div>
                                    <Separator className="my-1 opacity-50" />
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-slate-900">{t("mcap.payment.totalAmount", "Total Amount")}</span>
                                        <span className="font-bold text-xl text-primary">
                                            {formatAmount(amountToPay, activeCurrency)}
                                        </span>
                                    </div>
                                </div>
                                <Button className="w-full" size="lg" onClick={handleInitStripe} disabled={isInitStripe}>
                                    {isInitStripe ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4 mr-2" />}
                                    {t("mcap.payment.proceedToPay", "Proceed to Pay")}
                                </Button>
                            </div>
                        )}

                        {payMethod === "bank" && (
                            <div className="space-y-4 animate-in fade-in">
                                {bankProofDenied && (
                                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-2">
                                        <span>{t("mcap.payment.proofDenied", "Your previous proof was denied. Please upload a new receipt.")}</span>
                                        <Button
                                            onClick={handleRefreshStatus}
                                            variant="outline"
                                            size="sm"
                                            disabled={isRefreshing}
                                        >
                                            {isRefreshing ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : null}
                                            {t("mcap.payment.refreshStatus", "Refresh Status")}
                                        </Button>
                                    </div>
                                )}
                                <div className="space-y-2 p-3 bg-muted rounded-lg border">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-slate-900">{t("mcap.payment.totalToTransfer", "Total Amount to Transfer")}</span>
                                        <span className="font-bold text-xl text-primary">
                                            {formatAmount(amountToPay, activeCurrency)}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-1 text-center italic">
                                        {t("mcap.payment.noCardFeeNote", "No card processing fees apply to bank transfers.")}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label>{t("mcap.payment.refNumber", "Reference Number (Optional)")}</Label>
                                    <Input
                                        placeholder={t("mcap.payment.refPlaceholder", "e.g. REF-123456")}
                                        value={bankRef}
                                        onChange={(e) => setBankRef(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t("mcap.payment.uploadProof", "Upload Receipt/Proof")} <span className="text-red-500">*</span></Label>
                                    <div className="grid w-full max-w-sm items-center gap-1.5">
                                        <Input
                                            type="file"
                                            accept="image/*,.pdf"
                                            onChange={(e) => setBankFile(e.target.files?.[0] || null)}
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">{t("mcap.payment.supportedFormats", "Supported formats: PDF, JPG, PNG.")}</p>
                                </div>
                                <Button
                                    className="w-full"
                                    onClick={handleBankSubmit}
                                    disabled={!bankFile || isUploading}
                                >
                                    {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : t("mcap.payment.submitProof", "Submit Proof")}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Stripe Drawer Component */}
            {clientSecret && paymentIntentId && (
                <StripeCardDrawer
                    open={stripeDrawerOpen}
                    onOpenChange={setStripeDrawerOpen}
                    clientSecret={clientSecret}
                    amount={amountToPay}
                    currency={activeCurrency}
                    companyId={companyId || ""}
                    paymentIntentId={paymentIntentId}
                    onSuccess={(info) => {
                        // Update parent with payment status
                        if (onChange) {
                            onChange({
                                ...data,
                                payMethod: "card",
                                paymentStatus: "paid",
                                stripeLastStatus: info.paymentIntentStatus || "succeeded",
                                stripeReceiptUrl: info.receiptUrl || "",
                                paymentIntentId: info.paymentIntentId || paymentIntentId,
                                stripeAmountCents: info.amount,
                                stripeCurrency: info.currency,
                            });
                        }
                        setSuccessInfo(info);
                        setApprovedByAdmin(false);
                        setStripeDrawerOpen(false);
                    }}
                />
            )}
        </div>
    );
};
