/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { convertUsdToHkd } from "@/services/exchangeRate";
import type { McapConfig } from "../configs/types";

interface ServiceSelectionWidgetProps {
    config: McapConfig;
    data: any;
    onChange: (data: any) => void;
    items?: any[] | ((data: any, entityMeta?: any) => any[]);
    currency?: string;
}

export function ServiceSelectionWidget({
    config,
    data,
    onChange,
    items,
    currency = "USD"
}: ServiceSelectionWidgetProps) {
    const { t } = useTranslation();
    const optionalIds: string[] = Array.isArray(data.optionalFeeIds) ? data.optionalFeeIds : [];
    const serviceIds: string[] = Array.isArray(data.serviceItemsSelected) ? data.serviceItemsSelected : [];
    const selectedIds: string[] = Array.from(new Set([...optionalIds, ...serviceIds]));
    const selectedCurrency = data.paymentCurrency || data.currency || currency;
    const isLocked = data.paymentStatus === "paid";

    // Extract fees from config or passed items
    const feesMeta = (config && (config as any).entityMeta && (config as any).entityMeta.fees) || null;
    const resolvedItems = typeof items === "function" ? items(data, (config as any).entityMeta || null) : items;
    const govItems = feesMeta?.government || [];
    const svcItemsMeta = (resolvedItems && resolvedItems.length > 0) ? resolvedItems : (feesMeta?.service || []);
    const enableKycExtras = !!(config as any)?.entityMeta?.enableKycExtras;

    // Auto-select mandatory items on mount
    useEffect(() => {
        const mandatoryIds = svcItemsMeta.filter((i: any) => i.mandatory).map((i: any) => i.id);
        const newIds = [...new Set([...selectedIds, ...mandatoryIds])];
        if (newIds.length !== selectedIds.length || !newIds.every(id => selectedIds.includes(id))) {
            handleChange(newIds, selectedCurrency);
        }
    }, [svcItemsMeta]);

    const [isConverting, setIsConverting] = useState(false);

    const toggleService = (id: string, mandatory: boolean = false) => {
        if (mandatory || isLocked) return;
        const newIds = selectedIds.includes(id)
            ? selectedIds.filter(s => s !== id)
            : [...selectedIds, id];
        handleChange(newIds, selectedCurrency);
    };

    const handleCurrencyChange = (newCurr: string) => {
        handleChange(selectedIds, newCurr);
    };

    const sameSelection = (a: string[], b: string[]) =>
        a.length === b.length && a.every(id => b.includes(id));

    // Compute pricing and propagate as single source of truth (subtotal only)
    const handleChange = async (newIds: string[], payCurr: string) => {
        const normalizedIds = Array.from(new Set(newIds));
        setIsConverting(true);
        try {
            const governmentTotalUsd = govItems.reduce((s: number, it: any) => s + Number(it.amount || 0), 0);
            const mandatoryServiceTotalUsd = svcItemsMeta.filter((f: any) => f.mandatory).reduce((s: number, it: any) => s + Number(it.amount || 0), 0);
            const optionalSelectedTotalUsd = svcItemsMeta
                .filter((f: any) => !f.mandatory && normalizedIds.includes(f.id))
                .reduce((s: number, it: any) => s + Number(it.amount || 0), 0);

            // KYC extras based on parties
            const parties = Array.isArray(data.parties) ? data.parties : [];
            const legalPersonCount = parties.filter((p: any) => p?.isCorp === true || p?.type === "entity").length;
            const individualCount = Math.max(0, parties.length - legalPersonCount);
            let extraKycUsd = 0;
            if (enableKycExtras) {
                if (legalPersonCount > 0) extraKycUsd += legalPersonCount * 130;
                if (individualCount > 2) {
                    const peopleNeedingKyc = individualCount - 2;
                    const kycSlots = Math.ceil(peopleNeedingKyc / 2);
                    extraKycUsd += kycSlots * 65;
                }
            }

            const serviceTotalUsd = mandatoryServiceTotalUsd + optionalSelectedTotalUsd + extraKycUsd;
            const subtotalUsd = governmentTotalUsd + serviceTotalUsd;

            // Currency conversion
            let finalSubtotal = subtotalUsd;
            let rate: number | undefined;
            if (payCurr === "HKD") {
                const conv = await convertUsdToHkd(subtotalUsd);
                finalSubtotal = conv.hkdAmount;
                rate = conv.rate;
            }

            const computedFees = {
                currency: payCurr,
                items: [
                    ...govItems.map((f: any) => ({
                        id: f.id,
                        label: f.label,
                        amount: payCurr === "HKD" ? Number((f.amount * (rate || 1)).toFixed(2)) : f.amount,
                        original: payCurr === "HKD" ? Number((f.original * (rate || 1)).toFixed(2)) : f.original,
                        info: f.info,
                        kind: "government" as const,
                    })),
                    ...svcItemsMeta.filter((f: any) => f.mandatory || normalizedIds.includes(f.id)).map((f: any) => ({
                        id: f.id,
                        label: f.label,
                        amount: payCurr === "HKD" ? Number((f.amount * (rate || 1)).toFixed(2)) : f.amount,
                        original: payCurr === "HKD" ? Number((f.original * (rate || 1)).toFixed(2)) : f.original,
                        info: f.info,
                        kind: "service" as const,
                    })),
                    ...(extraKycUsd > 0 ? [{
                        id: "extra_kyc",
                        label: "newHk.fees.items.extra_kyc.label",
                        amount: payCurr === "HKD" ? Number((extraKycUsd * (rate || 1)).toFixed(2)) : extraKycUsd,
                        original: payCurr === "HKD" ? Number((extraKycUsd * (rate || 1)).toFixed(2)) : extraKycUsd,
                        info: "Additional KYC fees for corporate shareholders and extra individual shareholders.",
                        kind: "service" as const,
                    }] : [])
                ],
                government: payCurr === "HKD" ? Number((governmentTotalUsd * (rate || 1)).toFixed(2)) : governmentTotalUsd,
                service: payCurr === "HKD" ? Number((serviceTotalUsd * (rate || 1)).toFixed(2)) : serviceTotalUsd,
                total: finalSubtotal,
                exchangeRateUsed: rate,
                originalAmountUsd: subtotalUsd,
            };

            const feesChanged = JSON.stringify(data.computedFees || {}) !== JSON.stringify(computedFees);
            const selectionChanged = !sameSelection(normalizedIds, selectedIds);
            const currencyChanged = payCurr !== selectedCurrency;

            if (feesChanged || selectionChanged || currencyChanged) {
                onChange({
                    ...data,
                    optionalFeeIds: normalizedIds,
                    serviceItemsSelected: normalizedIds,
                    paymentCurrency: payCurr,
                    computedFees
                });
            }
        } catch (err) {
            console.error("Fee computation error:", err);
        } finally {
            setIsConverting(false);
        }
    };

    // Recompute totals when key pricing inputs change (e.g., base selection or parties)
    useEffect(() => {
        if (data.selectedState || data.selectedEntity || enableKycExtras) {
            handleChange(selectedIds, selectedCurrency);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.selectedState, data.selectedEntity, data.parties, enableKycExtras]);

    const formatPrice = (amount: number, curr: string) => {
        if (amount === 0) return t("common.free", "Included");
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: curr,
        }).format(amount);
    };

    // Helper to show hint tooltip
    const renderTip = (text?: string | object) => {
        if (!text) return null;
        const textStr = typeof text === 'string' ? text : JSON.stringify(text);
        return (
            <TooltipProvider delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm text-sm">
                        <p>{textStr}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    };

    // Render row for each fee item
    const Row = ({ item }: { item: any }) => {
        const label = typeof t(item.label, item.label) === 'string' ? t(item.label, item.label) : item.label;
        const info = item.info ? (typeof t(item.info, item.info) === 'string' ? t(item.info, item.info) : undefined) : undefined;
        const checked = item.mandatory || selectedIds.includes(item.id);
        const disabled = item.mandatory || isLocked;

        return (
            <TableRow>
                <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                        <span>{label}</span>
                        {info && renderTip(info)}
                    </div>
                </TableCell>
                <TableCell className="text-right">
                    {item.original ? formatPrice(item.original, selectedCurrency) : "—"}
                </TableCell>
                <TableCell className="text-right">
                    {formatPrice(item.amount, selectedCurrency)}
                </TableCell>
                <TableCell className="text-center w-[80px]">
                    <Checkbox
                        checked={checked}
                        disabled={disabled}
                        onCheckedChange={() => toggleService(item.id, item.mandatory)}
                    />
                </TableCell>
            </TableRow>
        );
    };

    // Group items by category
    const govItemsWithFees = govItems.map((f: any) => ({
        ...f,
        category: "government",
        checked: true, // always checked
    }));

    const mandatorySvcItems = svcItemsMeta.filter((f: any) => f.mandatory);
    const optionalSvcItems = svcItemsMeta.filter((f: any) => !f.mandatory);
    const mandatorySvcWithFees = mandatorySvcItems.map((f: any) => ({
        ...f,
        category: "service",
        checked: true,
    }));
    const optionalSvcWithFees = optionalSvcItems.map((f: any) => ({
        ...f,
        category: "service",
        checked: selectedIds.includes(f.id),
    }));

    // Compute subtotals
    const govSubtotal = govItems.reduce((s: number, it: any) => s + Number(it.amount || 0), 0);
    const mandatorySvcSubtotal = mandatorySvcItems.reduce((s: number, it: any) => s + Number(it.amount || 0), 0);
    const optionalSvcSubtotal = optionalSvcItems
        .filter((f: any) => selectedIds.includes(f.id))
        .reduce((s: number, it: any) => s + Number(it.amount || 0), 0);

    // Extra KYC subtotal
    const parties = Array.isArray(data.parties) ? data.parties : [];
    const legalPersonCount = parties.filter((p: any) => p?.isCorp === true || p?.type === "entity").length;
    const individualCount = Math.max(0, parties.length - legalPersonCount);
    let extraKycSubtotal = 0;
    if (enableKycExtras) {
        if (legalPersonCount > 0) extraKycSubtotal += legalPersonCount * 130;
        if (individualCount > 2) {
            const peopleNeedingKyc = individualCount - 2;
            const kycSlots = Math.ceil(peopleNeedingKyc / 2);
            extraKycSubtotal += kycSlots * 65;
        }
    }

    // Extra KYC items for table
    const extraKycItems: any[] = [];
    if (enableKycExtras) {
        for (let i = 0; i < legalPersonCount; i++) {
            extraKycItems.push({
                id: `kyc_legal_${i + 1}`,
                label: "KYC / Due Diligence fee (Corporate Shareholder)",
                original: 130,
                amount: 130,
                mandatory: true,
                info: "KYC for corporate shareholders. Includes company documents, registers and UBO checks.",
                category: "kyc",
            });
        }
        if (individualCount > 2) {
            const peopleNeedingKyc = individualCount - 2;
            const kycSlots = Math.ceil(peopleNeedingKyc / 2);
            for (let i = 0; i < kycSlots; i++) {
                extraKycItems.push({
                    id: `kyc_extra_${i + 1}`,
                    label: "KYC / Due Diligence fee (Additional Individuals)",
                    original: 65,
                    amount: 65,
                    mandatory: true,
                    info: "Additional KYC for individual shareholders beyond the two included.",
                    category: "kyc",
                });
            }
        }
    }

    // Convert to selected currency
    const convertAmount = (amountUsd: number): number => {
        if (selectedCurrency === "HKD" && data.computedFees?.exchangeRateUsed) {
            return Number((amountUsd * data.computedFees.exchangeRateUsed).toFixed(2));
        }
        return amountUsd;
    };

    const govSubtotalConverted = convertAmount(govSubtotal);
    const mandatorySvcSubtotalConverted = convertAmount(mandatorySvcSubtotal);
    const optionalSvcSubtotalConverted = convertAmount(optionalSvcSubtotal);
    const extraKycSubtotalConverted = convertAmount(extraKycSubtotal);
    const totalConverted = govSubtotalConverted + mandatorySvcSubtotalConverted + optionalSvcSubtotalConverted + extraKycSubtotalConverted;



    return (
        <div className="space-y-4">
            {/* Fee Table */}
            <Card className="border">
                <CardContent className="pt-4 pb-0">
                    <div className="rounded-lg border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="font-semibold">
                                        {t("service.table.description", "Service Description")}
                                    </TableHead>
                                    <TableHead className="text-right font-semibold">
                                        {t("service.table.original", "Original")}
                                    </TableHead>
                                    <TableHead className="text-right font-semibold">
                                        {t("service.table.amount", "Amount")}
                                    </TableHead>
                                    <TableHead className="text-center font-semibold w-[80px]">
                                        {t("service.table.select", "Select")}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {/* Unified view: all items in one list */}
                                {[
                                    ...govItemsWithFees,
                                    ...mandatorySvcWithFees,
                                    ...optionalSvcWithFees,
                                    ...extraKycItems,
                                ].map((item) => (
                                    <Row key={item.id} item={item} />
                                ))}

                                {/* Grand Total Row */}
                                <TableRow className="bg-primary/10 hover:bg-primary/10">
                                    <TableCell colSpan={2} className="text-right font-bold text-base">
                                        {t("service.grandTotal", "Grand Total")}
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-base text-primary">
                                        {formatPrice(totalConverted, selectedCurrency)}
                                    </TableCell>
                                    <TableCell />
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>

                    {/* Notes */}
                    <p className="text-xs text-muted-foreground mt-3 mb-4">
                        {t("service.note", "Government fees are statutory and mandatory. Optional services can be toggled to customize your package.")}
                        {isLocked && (
                            <> {" "}
                                {t("service.lockedNote", "After payment, selections are locked.")}
                            </>
                        )}
                    </p>
                </CardContent>
            </Card>

            {/* Currency Selector */}
            <Card className="bg-muted/20 border">
                <CardContent className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                {t("service.paymentCurrency", "Payment Currency For Card Payment")}
                            </label>
                            <div className="flex items-center gap-2">
                                <Select value={selectedCurrency} onValueChange={handleCurrencyChange} disabled={isLocked}>
                                    <SelectTrigger className="w-[120px] h-9 bg-background">
                                        <SelectValue placeholder="Currency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USD">USD ($)</SelectItem>
                                        <SelectItem value="HKD">HKD (HK$)</SelectItem>
                                    </SelectContent>
                                </Select>
                                {isConverting && <RefreshCw className="h-4 w-4 animate-spin text-primary" />}
                            </div>
                        </div>

                        {data.computedFees?.exchangeRateUsed && selectedCurrency === "HKD" && (
                            <div className="px-3 py-1 bg-primary/10 rounded-md border border-primary/20">
                                <p className="text-[10px] text-primary font-medium">
                                    1 USD = {data.computedFees.exchangeRateUsed.toFixed(4)} HKD
                                </p>
                            </div>
                        )}
                    </div>

                    <p className="text-[10px] text-muted-foreground max-w-xs text-center md:text-right">
                        {t("service.currencyNote", "All prices are originally computed in USD. Conversion rates are updated live.")}
                    </p>
                </CardContent>
            </Card>

            {/* Status Badge */}
            {isLocked && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <p className="text-xs text-amber-900 font-medium">
                        {t("service.paymentLocked", "Payment completed. Service selections are locked and cannot be changed.")}
                    </p>
                </div>
            )}
        </div>
    );
}
