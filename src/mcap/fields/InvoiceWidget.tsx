/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Receipt, HelpCircle, ChevronDown, ChevronUp, Loader2, AlertCircle, Tag, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { getExchangeRate } from "@/services/exchangeRate";
import { API_URL } from "@/services/fetch";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { McapFees } from "../configs/types";

// ============================================
// TYPES
// ============================================

export interface InvoiceFeeItem {
    id: string;
    label: string;
    amount: number;
    original?: number;
    info?: string;
    kind?: "government" | "service" | "tax" | "other";
    quantity?: number;
}

export interface InvoiceData {
    items: InvoiceFeeItem[];
    government: number;
    service: number;
    total: number;
    currency: string;
    cardFeePct?: number;
    cardFeeSurcharge?: number;
    grandTotal?: number;
    exchangeRateUsed?: number;
    originalAmount?: number;
    originalCurrency?: string;
    originalAmountUsd?: number;
}

interface InvoiceWidgetProps {
    fees: McapFees | number | undefined;
    onNext?: () => void;
    isSubmitting?: boolean;
    companyName?: string;
    readOnly?: boolean;
    data?: any;
    onChange?: (data: any) => void;
    companyId?: string | null;
}

const API_BASE = API_URL.replace(/\/+$/, "");
const validateCouponApi = async (code: string, companyId: string | null) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/mcap/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ code, companyId }),
    });
    return res.json();
};

// ============================================
// HELPER COMPONENTS
// ============================================

/** Section card wrapper for fee groups */
const SectionCard: React.FC<{
    title: string;
    badge?: string;
    description?: string;
    subtotal?: number;
    currency: string;
    children: React.ReactNode;
}> = ({ title, badge, description, subtotal, currency, children }) => {
    const formatPrice = (amount: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);

    return (
        <Card className="border bg-background">
            <CardHeader className="py-3 px-4">
                <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base md:text-lg">{title}</CardTitle>
                    <div className="flex items-center gap-2">
                        {typeof subtotal === "number" && (
                            <div className="hidden md:flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-semibold">{formatPrice(subtotal)}</span>
                            </div>
                        )}
                        {badge && (
                            <Badge variant="secondary" className="whitespace-nowrap text-xs">
                                {badge}
                            </Badge>
                        )}
                    </div>
                </div>
                {description && (
                    <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                )}
            </CardHeader>
            <CardContent className="pt-0 px-4 pb-4">{children}</CardContent>
        </Card>
    );
};

/** Single fee row - desktop table version */
const DesktopFeeRow: React.FC<{
    item: InvoiceFeeItem;
    currency: string;
    hintOpen: boolean;
    onToggleHint: () => void;
    t: (key: string, fallback?: string) => string;
}> = ({ item, currency, hintOpen, onToggleHint, t }) => {
    const qty = item.quantity ?? 1;
    const original = item.original ?? item.amount;
    const discounted = item.amount;
    const hasDiscount = original > discounted;
    const isFree = discounted === 0;

    const formatPrice = (amount: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);

    return (
        <TableRow className="hover:bg-muted/30">
            <TableCell className="py-2.5 align-top">
                <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-medium leading-tight">
                                {t(item.label, item.label)}
                            </span>
                            {item.info && (
                                <button
                                    type="button"
                                    onClick={onToggleHint}
                                    className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-accent shrink-0"
                                    aria-expanded={hintOpen}
                                >
                                    <HelpCircle className="h-3 w-3" />
                                </button>
                            )}
                        </div>
                        {hintOpen && item.info && (
                            <p className="mt-1 text-xs text-muted-foreground">{t(item.info, item.info)}</p>
                        )}
                        {hasDiscount && (
                            <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                                Discount applied (−{Math.round(((original - discounted) / original) * 100)}%)
                            </p>
                        )}
                    </div>
                </div>
            </TableCell>
            <TableCell className="py-2.5 text-right align-top">{qty}</TableCell>
            <TableCell className="py-2.5 text-right align-top">
                <span className={cn(hasDiscount && "line-through text-muted-foreground")}>
                    {formatPrice(original)}
                </span>
            </TableCell>
            <TableCell className="py-2.5 text-right align-top">
                {isFree ? (
                    <Badge className="rounded-full">FREE</Badge>
                ) : (
                    <span className="font-semibold">{formatPrice(discounted)}</span>
                )}
            </TableCell>
            <TableCell className="py-2.5 text-right align-top">
                <div className="flex flex-col items-end">
                    {hasDiscount && (
                        <span className="text-xs line-through text-muted-foreground">
                            {formatPrice(original * qty)}
                        </span>
                    )}
                    <span className="font-semibold">{formatPrice(discounted * qty)}</span>
                </div>
            </TableCell>
        </TableRow>
    );
};

/** Single fee row - mobile compact version */
const MobileFeeRow: React.FC<{
    item: InvoiceFeeItem;
    currency: string;
    hintOpen: boolean;
    onToggleHint: () => void;
    t: (key: string, fallback?: string) => string;
}> = ({ item, currency, hintOpen, onToggleHint, t }) => {
    const qty = item.quantity ?? 1;
    const original = item.original ?? item.amount;
    const discounted = item.amount;
    const hasDiscount = original > discounted;
    const isFree = discounted === 0;
    const rowTotal = discounted * qty;

    const formatPrice = (amount: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);

    return (
        <div className="py-3 border-b last:border-b-0">
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <div className="min-w-0">
                            <p className="font-medium leading-snug">{t(item.label, item.label)}</p>
                            {hintOpen && item.info && (
                                <p className="mt-1 text-xs text-muted-foreground">{t(item.info, item.info)}</p>
                            )}
                        </div>
                        {item.info && (
                            <button
                                type="button"
                                onClick={onToggleHint}
                                className="inline-flex h-5 w-5 items-center justify-center rounded-full border text-muted-foreground hover:bg-accent shrink-0"
                                aria-expanded={hintOpen}
                            >
                                {hintOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            </button>
                        )}
                    </div>

                    {hasDiscount && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            Discount (−{Math.round(((original - discounted) / original) * 100)}%)
                        </p>
                    )}

                    {qty > 1 && (
                        <p className="text-xs text-muted-foreground mt-1">Qty: {qty}</p>
                    )}
                </div>

                <div className="text-right shrink-0 flex flex-col items-end">
                    {hasDiscount && (
                        <p className="text-xs line-through text-muted-foreground">{formatPrice(original * qty)}</p>
                    )}

                    {isFree ? (
                        <Badge className="rounded-full text-xs">FREE</Badge>
                    ) : (
                        <>
                            <p className="font-semibold">{formatPrice(discounted)}</p>
                            <p className="text-sm font-semibold mt-1">{formatPrice(rowTotal)}</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// ============================================
// MAIN INVOICE WIDGET
// ============================================

export function InvoiceWidget({
    fees,
    onNext,
    isSubmitting = false,
    companyName = "MIRR ASIA BUSINESS ADVISORY & SECRETARIAL COMPANY LIMITED",
    readOnly = false,
    data,
    onChange,
    companyId,
}: InvoiceWidgetProps) {
    const { t: i18nT } = useTranslation(["common", "incorporation"]);
    const [hintOpen, setHintOpen] = useState<Record<string, boolean>>({});

    const initialCouponCode = data?.couponCode || data?.data?.couponCode || "";
    const initialCouponDiscount = data?.couponDiscount || data?.data?.couponDiscount || 0;

    const [couponInput, setCouponInput] = useState(initialCouponCode);
    const [couponApplied, setCouponApplied] = useState<{ code: string; discountAmount: number; currency: string } | null>(
        initialCouponCode && initialCouponDiscount ? { code: initialCouponCode, discountAmount: initialCouponDiscount, currency: "USD" } : null
    );
    const [couponValidating, setCouponValidating] = useState(false);
    const [couponError, setCouponError] = useState<string | null>(null);
    const [couponOpen, setCouponOpen] = useState(!!initialCouponCode);
    const [couponFxRate, setCouponFxRate] = useState<number>(1);

    useEffect(() => {
        if (readOnly) {
            const code = data?.couponCode || data?.data?.couponCode;
            const discount = data?.couponDiscount || data?.data?.couponDiscount;
            if (code && discount) {
                setCouponApplied({ code, discountAmount: discount, currency: "USD" });
            }
        }
    }, [data, readOnly]);

    const toggleHint = (key: string) => setHintOpen((s) => ({ ...s, [key]: !s[key] }));

    // Wrapper function to match component signature
    const t = (key: string, fallback?: string): string => {
        const result = i18nT(key);
        return (typeof result === 'string' ? result : fallback) || key;
    };

    // Normalize fees to InvoiceData
    const invoiceData: InvoiceData = useMemo(() => {
        if (typeof fees === "number") {
            return {
                items: [{ id: "base", label: "Incorporation Fee", amount: fees }],
                government: 0,
                service: fees,
                total: fees,
                currency: "USD",
            };
        }

        if (!fees) {
            return { items: [], government: 0, service: 0, total: 0, currency: "USD" };
        }

        return {
            items: (fees.items || []).map((item, idx) => ({
                id: item.id || `fee-${idx}`,
                label: item.label,
                amount: item.amount,
                original: (item as any).original,
                info: (item as any).info,
                kind: item.kind as any,
                quantity: Math.max(1, Number((item as any).quantity || 1)),
            })),
            government: (fees as any).government ?? 0,
            service: (fees as any).service ?? 0,
            total: fees.total ?? 0,
            currency: fees.currency ?? "USD",
            cardFeePct: (fees as any).cardFeePct,
            cardFeeSurcharge: (fees as any).cardFeeSurcharge,
            grandTotal: (fees as any).grandTotal,
            exchangeRateUsed: (fees as any).exchangeRateUsed,
            originalAmount: (fees as any).originalAmount,
            originalCurrency: (fees as any).originalCurrency,
            originalAmountUsd: (fees as any).originalAmountUsd,
        };
    }, [fees]);

    const {
        items,
        government,
        service,
        total,
        currency,
        cardFeePct,
        cardFeeSurcharge,
        grandTotal,
        exchangeRateUsed,
        originalAmount,
        originalCurrency,
        originalAmountUsd,
    } = invoiceData;
    const normalizedCardFeePct = Number(cardFeePct || 0);
    const normalizedCardFeeSurcharge = Number(cardFeeSurcharge || 0);

    const resolvedOriginalCurrency = String(
        originalCurrency || (typeof originalAmountUsd === "number" ? "USD" : currency)
    ).toUpperCase();

    // FX Calculation for Coupon
    useEffect(() => {
        if (!couponApplied) return;
        if (couponApplied.currency === currency) {
            setCouponFxRate(1);
            return;
        }
        if (couponApplied.currency === "USD" && resolvedOriginalCurrency === "USD" && exchangeRateUsed) {
            setCouponFxRate(exchangeRateUsed);
            return;
        }
        let mounted = true;
        getExchangeRate(couponApplied.currency, currency).then(rate => {
            if (mounted) {
                setCouponFxRate(rate);
                if (onChange && data?.couponCode) {
                    onChange({ ...data, couponLocalDiscount: couponApplied.discountAmount * rate });
                }
            }
        }).catch(err => {
            console.error("Failed to fetch coupon exchange rate", err);
            if (mounted) setCouponFxRate(1);
        });
        return () => { mounted = false; };
    }, [couponApplied, currency, resolvedOriginalCurrency, exchangeRateUsed]);

    const couponDiscountValue = couponApplied ? couponApplied.discountAmount * couponFxRate : 0;
    const finalSubtotal = Math.max(0, total - couponDiscountValue);

    // Adjust Card Fee based on new subtotal if a percentage was provided
    const adjustedCardFeeSurcharge = normalizedCardFeePct > 0
        ? Number((finalSubtotal * normalizedCardFeePct).toFixed(2))
        : normalizedCardFeeSurcharge;

    const resolvedGrandTotal = Number.isFinite(Number(grandTotal)) && !couponApplied
        ? Number(grandTotal)
        : Number((finalSubtotal + adjustedCardFeeSurcharge).toFixed(2));

    const hasCardFeeLine = adjustedCardFeeSurcharge > 0 || resolvedGrandTotal > finalSubtotal;

    const resolvedOriginalAmount = typeof originalAmount === "number" ? originalAmount : originalAmountUsd;
    const hasFxBreakdown =
        resolvedOriginalCurrency !== String(currency).toUpperCase()
        && typeof exchangeRateUsed === "number"
        && typeof resolvedOriginalAmount === "number";

    // Group items by kind
    const govItems = items.filter((i) => i.kind === "government");
    const svcItems = items.filter((i) => i.kind !== "government");

    const formatPrice = (amount: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);

    const handleApplyCoupon = async () => {
        if (!couponInput.trim() || !companyId) return;
        setCouponValidating(true);
        setCouponError(null);
        try {
            const res = await validateCouponApi(couponInput.trim(), companyId);
            if (!res.success || !res.valid) {
                setCouponError(res.message || t("mcap.payment.coupon.invalid", "Invalid coupon code."));
                return;
            }
            const couponData = res.data;
            setCouponApplied(couponData);
            if (onChange) {
                // Determine fx rate immediately for the update if possible, otherwise rely on the effect
                const currentFx = (couponData.currency === currency) ? 1 : (couponData.currency === "USD" && resolvedOriginalCurrency === "USD" && exchangeRateUsed ? exchangeRateUsed : couponFxRate);
                onChange({ ...data, couponCode: couponData.code, couponDiscount: couponData.discountAmount, couponLocalDiscount: couponData.discountAmount * currentFx });
            }
            toast({ title: t("mcap.payment.coupon.success", "Success"), description: t("mcap.payment.coupon.applied", "Coupon applied successfully.") });
        } catch (err) {
            console.log("Err",err)
            setCouponError(t("mcap.payment.coupon.error", "Failed to validate coupon."));
        } finally {
            setCouponValidating(false);
        }
    };

    const handleRemoveCoupon = () => {
        setCouponApplied(null);
        setCouponInput("");
        setCouponError(null);
        if (onChange) {
            onChange({ ...data, couponCode: "", couponDiscount: 0, couponLocalDiscount: 0 });
        }
    };

    // Render a section (government or service fees)
    const renderSection = (
        sectionItems: InvoiceFeeItem[],
        title: string,
        badge: string,
        description: string,
        subtotal: number
    ) => {
        if (sectionItems.length === 0) return null;

        return (
            <SectionCard
                title={t(title, title)}
                badge={t(badge, badge)}
                description={t(description, description)}
                subtotal={subtotal}
                currency={currency}
            >
                {/* Mobile View */}
                <div className="md:hidden">
                    {sectionItems.map((item) => (
                        <MobileFeeRow
                            key={item.id}
                            item={item}
                            currency={currency}
                            hintOpen={!!hintOpen[item.id]}
                            onToggleHint={() => toggleHint(item.id)}
                            t={t}
                        />
                    ))}
                    <div className="flex justify-between items-center pt-2 mt-2 border-t">
                        <span className="text-sm text-muted-foreground">{t("invoice.subtotal", "Subtotal")}</span>
                        <span className="font-semibold">{formatPrice(subtotal)}</span>
                    </div>
                </div>

                {/* Desktop View */}
                <div className="hidden md:block rounded-lg border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="w-[46%] py-2">
                                    {t("invoice.table.description", "Service Description")}
                                </TableHead>
                                <TableHead className="text-right py-2">
                                    {t("invoice.table.qty", "Qty")}
                                </TableHead>
                                <TableHead className="text-right py-2">
                                    {t("invoice.table.original", "Original")}
                                </TableHead>
                                <TableHead className="text-right py-2">
                                    {t("invoice.table.amount", "Amount")}
                                </TableHead>
                                <TableHead className="text-right py-2">
                                    {t("invoice.table.total", "Total")}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sectionItems.map((item) => (
                                <DesktopFeeRow
                                    key={item.id}
                                    item={item}
                                    currency={currency}
                                    hintOpen={!!hintOpen[item.id]}
                                    onToggleHint={() => toggleHint(item.id)}
                                    t={t}
                                />
                            ))}
                            <TableRow className="bg-muted/20">
                                <TableCell className="py-2 font-medium">{t("invoice.subtotal", "Subtotal")}</TableCell>
                                <TableCell className="py-2" />
                                <TableCell className="py-2" />
                                <TableCell className="py-2" />
                                <TableCell className="py-2 text-right font-semibold">
                                    {formatPrice(subtotal)}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </SectionCard>
        );
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-4">
            {/* Header Card */}
            <Card className="border bg-background">
                <CardHeader className="py-3 px-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Receipt className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-base md:text-lg">
                                    {t("invoice.title", "Order Summary")}
                                </CardTitle>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {companyName}
                                </p>
                            </div>
                        </div>
                        <Badge variant="outline" className="w-fit">
                            {currency}
                        </Badge>
                    </div>
                </CardHeader>
            </Card>

            {/* Government Fees Section */}
            {renderSection(
                govItems,
                "invoice.sections.government.title",
                "invoice.sections.government.badge",
                "invoice.sections.government.description",
                government
            )}

            {/* Service Fees Section */}
            {renderSection(
                svcItems,
                "invoice.sections.service.title",
                "invoice.sections.service.badge",
                "invoice.sections.service.description",
                service
            )}

            {/* Coupon Section */}
            {!readOnly && companyId && (
                <Collapsible open={couponOpen} onOpenChange={setCouponOpen}>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary px-0">
                            <Tag className="w-4 h-4" />
                            {t("mcap.payment.coupon.haveCoupon", "Have a coupon code?")}
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                        <Card>
                            <CardContent className="pt-4 space-y-3">
                                {couponApplied ? (
                                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Tag className="w-4 h-4 text-green-600" />
                                            <span className="text-sm font-medium text-green-800">
                                                {t("mcap.payment.coupon.codeApplied", "Coupon applied:")}{" "}
                                                <Badge className="bg-green-100 text-green-800 border-green-300 ml-1">{couponApplied.code}</Badge>
                                            </span>
                                            <span className="text-sm font-bold text-green-700">
                                                -{formatPrice(couponDiscountValue)}
                                            </span>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={handleRemoveCoupon} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder={t("mcap.payment.coupon.enterCode", "Enter coupon code")}
                                                value={couponInput}
                                                onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(null); }}
                                                onKeyDown={(e) => { if (e.key === "Enter") handleApplyCoupon(); }}
                                                className="flex-1"
                                            />
                                            <Button onClick={handleApplyCoupon} disabled={!couponInput.trim() || couponValidating} variant="outline">
                                                {couponValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : t("mcap.payment.coupon.apply", "Apply")}
                                            </Button>
                                        </div>
                                        {couponError && (
                                            <div className="text-xs text-destructive flex items-center gap-1.5">
                                                <AlertCircle className="w-3.5 h-3.5" />
                                                {couponError}
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </CollapsibleContent>
                </Collapsible>
            )}

            {/* Totals Card */}
            <Card className="border-2 border-primary/20 bg-background">
                <CardContent className="p-4 space-y-3">
                    {hasFxBreakdown ? (
                        <>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">
                                    {(t as any)(
                                        "invoice.originalUsd",
                                        {
                                            defaultValue: "Original ({{currency}})",
                                            currency: resolvedOriginalCurrency,
                                        }
                                    )}
                                </span>
                                <span className="font-medium">
                                    {new Intl.NumberFormat("en-US", { style: "currency", currency: resolvedOriginalCurrency }).format(Number(resolvedOriginalAmount))}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">{t("invoice.exchangeRate", "Exchange Rate")}</span>
                                <span className="font-medium">1 {resolvedOriginalCurrency} = {Number(exchangeRateUsed).toFixed(4)} {currency}</span>
                            </div>
                        </>
                    ) : null}

                    {/* Subtotal Before Coupon */}
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">{t("invoice.subtotal", "Subtotal")}</span>
                        <span className={cn("font-medium", couponApplied && "line-through text-muted-foreground")}>{formatPrice(total)}</span>
                    </div>

                    {couponApplied && (
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-1">
                                <Tag className="w-3.5 h-3.5 text-green-600" />
                                <span className="text-green-700 font-medium">{t("mcap.payment.coupon.couponDiscount", "Coupon Discount")}</span>
                                <Badge className="text-[10px] py-0 h-4 bg-green-100 text-green-800 border-green-300">{couponApplied.code}</Badge>
                            </div>
                            <span className="font-medium text-green-700">-{formatPrice(couponDiscountValue)}</span>
                        </div>
                    )}

                    {hasCardFeeLine && (
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">{t("invoice.cardFee", "Card Processing Fee")}</span>
                                {normalizedCardFeePct > 0 && (
                                    <span className="text-[10px] text-primary border border-primary/20 rounded px-1.5 py-0.5">
                                        {Math.round(normalizedCardFeePct * 100)}%
                                    </span>
                                )}
                            </div>
                            <span className="font-medium">{formatPrice(adjustedCardFeeSurcharge)}</span>
                        </div>
                    )}

                    {/* Grand Total */}
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-bold">{t("invoice.grandTotal", "Total Due")}</span>
                        <div className="text-right">
                            <span className="text-2xl font-bold text-primary">
                                {formatPrice(resolvedGrandTotal)}
                            </span>
                            <span className="text-xs text-muted-foreground block uppercase">{currency}</span>
                        </div>
                    </div>
                </CardContent>

                {!readOnly && onNext && (
                    <CardFooter className="p-4 pt-0">
                        <Button
                            size="lg"
                            onClick={onNext}
                            disabled={isSubmitting}
                            className="w-full font-semibold shadow-md"
                        >
                            {isSubmitting ? (
                                t("common.processing", "Processing...")
                            ) : (
                                <>
                                    {t("invoice.proceed", "Proceed to Payment")}
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </CardFooter>
                )}
            </Card>

            {!readOnly && (
                <>
                    {/* Disclaimer */}
                    <p className="text-center text-xs text-muted-foreground max-w-md mx-auto">
                        {t("invoice.disclaimer", "By proceeding, you agree to our Terms of Service and Refund Policy.")}
                    </p>
                    <p className="text-center text-[10px] text-muted-foreground max-w-md mx-auto">
                        {t("invoice.cardFeeNote", "Card processing fee is applied at payment: 6% for USD/EUR and 4% for HKD.")}
                    </p>
                </>
            )}
        </div>
    );
}
