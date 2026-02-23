/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Receipt, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
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
    originalAmountUsd?: number;
}

interface InvoiceWidgetProps {
    fees: McapFees | number | undefined;
    onNext: () => void;
    isSubmitting?: boolean;
    companyName?: string;
}

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
                            <p className="mt-1 text-xs text-muted-foreground">{item.info}</p>
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
                                <p className="mt-1 text-xs text-muted-foreground">{item.info}</p>
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
}: InvoiceWidgetProps) {
    const { t: i18nT } = useTranslation();
    const [hintOpen, setHintOpen] = useState<Record<string, boolean>>({});

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
                quantity: 1,
            })),
            government: (fees as any).government ?? 0,
            service: (fees as any).service ?? 0,
            total: fees.total ?? 0,
            currency: fees.currency ?? "USD",
            cardFeePct: (fees as any).cardFeePct,
            cardFeeSurcharge: (fees as any).cardFeeSurcharge,
            grandTotal: (fees as any).grandTotal,
            exchangeRateUsed: (fees as any).exchangeRateUsed,
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
        originalAmountUsd,
    } = invoiceData;
    const normalizedCardFeePct = Number(cardFeePct || 0);
    const normalizedCardFeeSurcharge = Number(cardFeeSurcharge || 0);
    const resolvedGrandTotal = Number.isFinite(Number(grandTotal))
        ? Number(grandTotal)
        : Number((total + normalizedCardFeeSurcharge).toFixed(2));
    const hasCardFeeLine = normalizedCardFeeSurcharge > 0 || resolvedGrandTotal > total;

    // Group items by kind
    const govItems = items.filter((i) => i.kind === "government");
    const svcItems = items.filter((i) => i.kind !== "government");

    const formatPrice = (amount: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);

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

            {/* Totals Card */}
            <Card className="border-2 border-primary/20 bg-background">
                <CardContent className="p-4 space-y-3">
                    {currency !== "USD" && typeof exchangeRateUsed === "number" && typeof originalAmountUsd === "number" ? (
                        <>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">{t("invoice.originalUsd", "Original (USD)")}</span>
                                <span className="font-medium">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(originalAmountUsd)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">{t("invoice.exchangeRate", "Exchange Rate")}</span>
                                <span className="font-medium">1 USD = {exchangeRateUsed.toFixed(4)} {currency}</span>
                            </div>
                        </>
                    ) : null}

                    {/* Subtotal */}
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">{t("invoice.subtotal", "Subtotal")}</span>
                        <span className="font-medium">{formatPrice(total)}</span>
                    </div>

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
                            <span className="font-medium">{formatPrice(normalizedCardFeeSurcharge)}</span>
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
            </Card>

            {/* Disclaimer */}
            <p className="text-center text-xs text-muted-foreground max-w-md mx-auto">
                {t("invoice.disclaimer", "By proceeding, you agree to our Terms of Service and Refund Policy.")}
            </p>
            <p className="text-center text-[10px] text-muted-foreground max-w-md mx-auto">
                {t("invoice.cardFeeNote", "Card processing fee is applied at payment: 6% (USD) / 4% (HKD).")}
            </p>
        </div>
    );
}
