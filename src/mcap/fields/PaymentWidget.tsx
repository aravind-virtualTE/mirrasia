/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Loader2, CreditCard, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { convertCurrency, convertUsdToHkd } from "@/services/exchangeRate";
import type { McapFees } from "../configs/types";

const STRIPE_CLIENT_ID = import.meta.env.VITE_STRIPE_DETAILS || process.env.REACT_APP_STRIPE_DETAILS;
const stripePromise = loadStripe(STRIPE_CLIENT_ID);

const createPaymentIntent = async (payload: { amount: number; currency: string; companyId: string }) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${import.meta.env.VITE_API_ORIGIN || "http://localhost:5000"}/api/mcap/invoice-intent`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ companyId: payload.companyId, totalCents: payload.amount, currency: payload.currency })
    });
    return res.json();
};

const updatePaymentIntent = async (payload: { paymentIntentId: string; amount: number; currency: string; companyId: string }) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${import.meta.env.VITE_API_ORIGIN || "http://localhost:5000"}/api/mcap/update-intent`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ paymentIntentId: payload.paymentIntentId, totalCents: payload.amount, currency: payload.currency, companyId: payload.companyId })
    });
    return res.json();
};

const confirmPaymentIntent = async (payload: { paymentIntentId: string; companyId: string }) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${import.meta.env.VITE_API_ORIGIN || "http://localhost:5000"}/api/mcap/confirm-payment`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });
    return res.json();
};

const uploadBankProof = async (companyId: string, file: File) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("paymethod", "bank");
    const res = await fetch(`${import.meta.env.VITE_API_ORIGIN || "http://localhost:5000"}/api/mcap/companies/${companyId}/bank-proof`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        },
        body: formData
    });
    return res.json();
};

const deleteBankProof = async (companyId: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${import.meta.env.VITE_API_ORIGIN || "http://localhost:5000"}/api/mcap/companies/${companyId}/bank-proof`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    return res.json();
};

function StripeCheckoutForm({ onSuccess }: { onSuccess: () => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setIsProcessing(true);
        try {
            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/mcap-demo`,
                },
                redirect: "if_required"
            });

            if (error) {
                toast({ title: "Payment Failed", description: error.message, variant: "destructive" });
            } else {
                toast({ title: "Payment Successful", description: "Your incorporation is being processed!" });
                onSuccess();
            }
        } catch (err) {
            toast({ title: "Error", description: "Payment processing failed", variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement />
            <Button type="submit" disabled={!stripe || isProcessing} className="w-full">
                {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Pay Now
            </Button>
        </form>
    );
}

const fmtMoney = (amount: number, currency: string) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(amount || 0);

export const PaymentWidget = ({
    fees,
    currency,
    supportedCurrencies,
    companyId,
    onPaymentComplete,
}: {
    fees?: McapFees;
    currency: string;
    supportedCurrencies?: string[];
    companyId?: string | null;
    onPaymentComplete: () => void;
}) => {
    const { t } = useTranslation();
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
    const [paymentComplete, setPaymentComplete] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [payMethod, setPayMethod] = useState<"card" | "bank">("card");
    const [bankFile, setBankFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const baseCurrency = (fees?.currency || "USD").toUpperCase();
    const currencyOptions = (supportedCurrencies && supportedCurrencies.length > 0)
        ? supportedCurrencies
        : [currency || baseCurrency];
    const [selectedCurrency, setSelectedCurrency] = useState<string>((currency || baseCurrency).toUpperCase());
    const [conversionRate, setConversionRate] = useState(1);
    const [convertedSubtotal, setConvertedSubtotal] = useState(0);

    const items = fees?.items || [];
    const subtotalBase = useMemo(() => {
        if (typeof fees?.total === "number") return fees.total;
        if (items.length > 0) return items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        return Number(fees?.government || 0) + Number(fees?.service || 0);
    }, [fees?.total, fees?.government, fees?.service, items]);

    const cardFeeRate = useMemo(() => {
        if (payMethod !== "card") return 0;
        const cur = selectedCurrency.toUpperCase();
        if (cur === "HKD") return 0.035;
        if (cur === "USD") return 0.06;
        return 0.06;
    }, [selectedCurrency, payMethod]);

    React.useEffect(() => {
        const run = async () => {
            if (!subtotalBase) {
                setConvertedSubtotal(0);
                setConversionRate(1);
                return;
            }
            if (selectedCurrency.toUpperCase() === baseCurrency.toUpperCase()) {
                setConvertedSubtotal(subtotalBase);
                setConversionRate(1);
                return;
            }
            try {
                if (baseCurrency === "USD" && selectedCurrency.toUpperCase() === "HKD") {
                    const { hkdAmount, rate } = await convertUsdToHkd(subtotalBase);
                    setConvertedSubtotal(hkdAmount);
                    setConversionRate(rate);
                    return;
                }
                const { convertedAmount, rate } = await convertCurrency(subtotalBase, baseCurrency, selectedCurrency);
                setConvertedSubtotal(convertedAmount);
                setConversionRate(rate);
            } catch (err) {
                console.error("Currency conversion failed", err);
                setConvertedSubtotal(subtotalBase);
                setConversionRate(1);
            }
        };
        run();
    }, [subtotalBase, selectedCurrency, baseCurrency]);

    const feeAmount = convertedSubtotal * cardFeeRate;
    const totalDue = convertedSubtotal + feeAmount;

    const initializePayment = async () => {
        if (!companyId) {
            toast({ title: "Save required", description: "Please save your application before paying.", variant: "destructive" });
            return;
        }
        setIsLoading(true);
        try {
            const cents = Math.round(totalDue * 100);
            const response = await createPaymentIntent({ amount: cents, currency: selectedCurrency.toLowerCase(), companyId });
            if (response.clientSecret) {
                setClientSecret(response.clientSecret);
                setPaymentIntentId(response.id || null);
            } else {
                toast({ title: "Error", description: "Could not initialize payment", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Payment initialization failed", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        if (!paymentIntentId || payMethod !== "card") return;
        if (!companyId) return;
        const cents = Math.round(totalDue * 100);
        updatePaymentIntent({ paymentIntentId, amount: cents, currency: selectedCurrency.toLowerCase(), companyId })
            .then((res) => {
                if (res?.clientSecret) {
                    setClientSecret(res.clientSecret);
                }
            })
            .catch(() => null);
    }, [totalDue, selectedCurrency, payMethod, paymentIntentId, companyId]);

    const handleSuccess = async () => {
        if (paymentIntentId && companyId) {
            await confirmPaymentIntent({ paymentIntentId, companyId });
        }
        setPaymentComplete(true);
        setTimeout(() => onPaymentComplete(), 1500);
    };

    const handleBankUpload = async () => {
        if (!companyId) {
            toast({ title: "Save required", description: "Please save your application before uploading proof.", variant: "destructive" });
            return;
        }
        if (!bankFile) {
            toast({ title: "Missing file", description: "Please select a receipt file.", variant: "destructive" });
            return;
        }
        setIsUploading(true);
        try {
            await uploadBankProof(companyId, bankFile);
            toast({ title: "Uploaded", description: "Bank proof uploaded successfully." });
            setBankFile(null);
            onPaymentComplete();
        } catch (err) {
            toast({ title: "Upload failed", description: "Could not upload bank proof.", variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };

    const handleBankDelete = async () => {
        if (!companyId) return;
        await deleteBankProof(companyId);
        toast({ title: "Deleted", description: "Bank proof deleted." });
    };

    if (paymentComplete) {
        return (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <CheckCircle2 className="w-16 h-16 text-green-500 animate-in zoom-in" />
                <h3 className="text-xl font-bold">{t("mcap.payment.success", "Payment Successful!")}</h3>
                <p className="text-muted-foreground">{t("mcap.payment.processing", "Processing your incorporation...")}</p>
            </div>
        );
    }

    if (!subtotalBase || subtotalBase <= 0) {
        return (
            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>{t("mcap.payment.summary", "Invoice Summary")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            {t("mcap.payment.noCharge", "No payment is required for this configuration. You can proceed to submit the application.")}
                        </p>
                    </CardContent>
                </Card>
                <Button onClick={onPaymentComplete} className="w-full">
                    {t("mcap.payment.continue", "Continue")}
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        {t("mcap.payment.summary", "Invoice Summary")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {currencyOptions.length > 1 && (
                        <div className="space-y-2">
                            <span className="text-sm text-muted-foreground">{t("mcap.payment.currency", "Payment Currency")}</span>
                            <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t("common.select", "Select an option")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {currencyOptions.map((cur) => (
                                        <SelectItem key={cur} value={cur.toUpperCase()}>
                                            {cur.toUpperCase()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <span className="text-sm text-muted-foreground">{t("mcap.payment.method", "Payment Method")}</span>
                        <Select value={payMethod} onValueChange={(val) => setPayMethod(val as "card" | "bank")}>
                            <SelectTrigger>
                                <SelectValue placeholder={t("common.select", "Select an option")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="card">{t("mcap.payment.method.card", "Card (Stripe)")}</SelectItem>
                                <SelectItem value="bank">{t("mcap.payment.method.bank", "Bank Transfer")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {items.length > 0 ? (
                        <div className="space-y-2">
                            {items.map((item) => (
                                <div key={item.id || item.label} className="flex justify-between">
                                    <span className="text-muted-foreground">{t(item.label, item.label)}</span>
                                    <span className="font-medium">{fmtMoney(item.amount, baseCurrency)}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t("mcap.payment.government", "Government Fees")}</span>
                                <span className="font-medium">{fmtMoney(Number(fees?.government || 0), baseCurrency)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t("mcap.payment.service", "Service Fees")}</span>
                                <span className="font-medium">{fmtMoney(Number(fees?.service || 0), baseCurrency)}</span>
                            </div>
                        </>
                    )}

                    {baseCurrency !== selectedCurrency.toUpperCase() && (
                        <div className="text-xs text-muted-foreground">
                            {t("mcap.payment.fx", "Converted at rate {{rate}}", { rate: conversionRate.toFixed(4) })}
                        </div>
                    )}

                    <Separator />
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("mcap.payment.subtotal", "Subtotal")}</span>
                        <span className="font-medium">{fmtMoney(convertedSubtotal, selectedCurrency)}</span>
                    </div>
                    {payMethod === "card" && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                {t("mcap.payment.cardFee", "Card Fee ({{rate}}%)", { rate: (cardFeeRate * 100).toFixed(1) })}
                            </span>
                            <span className="font-medium">{fmtMoney(feeAmount, selectedCurrency)}</span>
                        </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                        <span>{t("mcap.payment.total", "Total Due")}</span>
                        <Badge variant="default" className="text-base px-3 py-1">
                            {fmtMoney(totalDue, selectedCurrency)}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t("mcap.payment.checkout", "Checkout")}</CardTitle>
                </CardHeader>
                <CardContent>
                    {payMethod === "bank" ? (
                        <div className="space-y-4 text-sm text-muted-foreground">
                            <div>{t("mcap.payment.bankNote", "Bank transfer selected. Upload your payment receipt for admin review.")}</div>
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => setBankFile(e.target.files?.[0] || null)}
                            />
                            <div className="flex gap-2">
                                <Button onClick={handleBankUpload} disabled={isUploading} className="w-full">
                                    {isUploading ? t("mcap.payment.uploading", "Uploading...") : t("mcap.payment.upload", "Upload Receipt")}
                                </Button>
                                <Button variant="outline" onClick={handleBankDelete} className="w-full">
                                    {t("mcap.payment.delete", "Delete Receipt")}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {!clientSecret ? (
                                <Button onClick={initializePayment} disabled={isLoading} className="w-full">
                                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    {t("mcap.payment.proceed", "Proceed to Payment")}
                                </Button>
                            ) : (
                                <Elements stripe={stripePromise} options={{ clientSecret }}>
                                    <StripeCheckoutForm onSuccess={handleSuccess} />
                                </Elements>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
