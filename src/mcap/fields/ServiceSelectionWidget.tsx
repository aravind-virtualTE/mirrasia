/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, Minus, Plus, RefreshCw } from "lucide-react";
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
    supportedCurrencies?: string[];
    computeFees?: (data: Record<string, any>, entityMeta?: Record<string, any> | null) => any;
}

type QuantityScope = "totalParties" | "dcpParties";

interface QuantityControlMeta {
    enabled?: boolean;
    min?: number;
    maxBy?: QuantityScope;
    unitLabel?: string;
}

export function ServiceSelectionWidget({
    config,
    data,
    onChange,
    items,
    currency = "USD",
    supportedCurrencies,
    computeFees,
}: ServiceSelectionWidgetProps) {
    const { t } = useTranslation();
    const optionalIds: string[] = Array.isArray(data.optionalFeeIds) ? data.optionalFeeIds : [];
    const serviceIds: string[] = Array.isArray(data.serviceItemsSelected) ? data.serviceItemsSelected : [];
    const selectedIds: string[] = Array.from(new Set([...optionalIds, ...serviceIds]));
    const parties = Array.isArray(data?.parties) ? data.parties : [];
    const totalPartyCount = parties.length;
    const dcpPartyCount = parties.filter((p: any) => Array.isArray(p?.roles) && p.roles.includes("dcp")).length;
    const rawServiceQuantities = data?.serviceQuantities && typeof data.serviceQuantities === "object"
        ? data.serviceQuantities
        : {};
    const serviceQuantities = Object.entries(rawServiceQuantities).reduce((acc: Record<string, number>, [id, value]) => {
        const qty = Number(value);
        if (Number.isFinite(qty) && qty > 0) {
            acc[String(id)] = Math.floor(qty);
        }
        return acc;
    }, {} as Record<string, number>);
    const allowedCurrencies = useMemo(() => {
        const raw = Array.isArray(supportedCurrencies) && supportedCurrencies.length > 0
            ? supportedCurrencies
            : ["USD", "HKD"];
        const normalized = raw
            .map((entry) => String(entry || "").trim().toUpperCase())
            .filter(Boolean);
        return normalized.length > 0 ? Array.from(new Set(normalized)) : ["USD", "HKD"];
    }, [supportedCurrencies]);
    const selectedCurrencyRaw = String(data.paymentCurrency || data.currency || currency || "USD").toUpperCase();
    const selectedCurrency = allowedCurrencies.includes(selectedCurrencyRaw)
        ? selectedCurrencyRaw
        : allowedCurrencies[0];
    const isLocked = data.paymentStatus === "paid";

    // Extract fees from config or passed items
    const feesMeta = (config && (config as any).entityMeta && (config as any).entityMeta.fees) || null;
    const resolvedItems = typeof items === "function" ? items(data, (config as any).entityMeta || null) : items;

    const govSource = Array.isArray(feesMeta?.government) ? feesMeta.government : [];
    const svcSource = (resolvedItems && resolvedItems.length > 0) ? resolvedItems : (feesMeta?.service || []);

    const govItems = govSource;
    const svcItemsMeta = svcSource;
    const enableKycExtras = !!(config as any)?.entityMeta?.enableKycExtras;

    const getCardFeePct = (curr: string) => (String(curr).toUpperCase() === "USD" ? 0.06 : 0.04);
    const getQuantityMeta = (item: any): QuantityControlMeta => {
        const meta = item?.quantityControl;
        return meta && typeof meta === "object" ? meta : {};
    };
    const isQuantityItem = (item: any) => !!getQuantityMeta(item).enabled;
    const getQuantityCap = (item: any) => {
        const meta = getQuantityMeta(item);
        if (!meta.enabled) return 1;
        const maxBy = meta.maxBy || "totalParties";
        const rawCap = maxBy === "dcpParties" ? dcpPartyCount : totalPartyCount;
        return Math.max(0, Number(rawCap || 0));
    };
    const getNormalizedQuantity = (item: any, rawValue: any, selected: boolean) => {
        if (!isQuantityItem(item)) {
            return selected ? 1 : 0;
        }

        const cap = getQuantityCap(item);
        if (cap <= 0) return 0;

        const minQty = Math.max(1, Number(getQuantityMeta(item).min || 1));
        const parsed = Number(rawValue);
        const hasPositiveRawQty = Number.isFinite(parsed) && parsed > 0;
        const shouldInclude = selected || hasPositiveRawQty;
        if (!shouldInclude) return 0;

        const fallback = Math.min(minQty, cap);
        const base = hasPositiveRawQty ? Math.floor(parsed) : fallback;
        return Math.max(minQty, Math.min(cap, base));
    };
    const normalizeSelectionsAndQuantities = (
        candidateIds: string[],
        quantitySnapshot: Record<string, number>
    ) => {
        const ids = new Set(candidateIds);
        const normalizedQuantities: Record<string, number> = {};

        svcItemsMeta.forEach((item: any) => {
            const selected = item.mandatory || ids.has(item.id);
            const quantity = getNormalizedQuantity(item, quantitySnapshot[item.id], selected);

            if (isQuantityItem(item)) {
                if (quantity > 0) {
                    ids.add(item.id);
                    normalizedQuantities[item.id] = quantity;
                } else {
                    ids.delete(item.id);
                }
                return;
            }

            if (item.mandatory) ids.add(item.id);
        });

        return {
            ids: Array.from(ids),
            quantities: normalizedQuantities,
        };
    };

    // Auto-select mandatory items on mount
    useEffect(() => {
        const mandatoryIds = svcItemsMeta.filter((i: any) => i.mandatory).map((i: any) => i.id);
        const newIds = [...new Set([...selectedIds, ...mandatoryIds])];
        if (newIds.length !== selectedIds.length || !newIds.every(id => selectedIds.includes(id))) {
            handleChange(newIds, selectedCurrency);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [svcItemsMeta]);

    const [isConverting, setIsConverting] = useState(false);

    useEffect(() => {
        if (isLocked) return;
        if (selectedCurrencyRaw !== selectedCurrency) {
            handleChange(selectedIds, selectedCurrency);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCurrencyRaw, selectedCurrency, isLocked]);

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

    const computedItemsById = useMemo(() => {
        const map = new Map<string, any>();
        const computedItems = Array.isArray(data?.computedFees?.items) ? data.computedFees.items : [];
        computedItems.forEach((item: any) => {
            if (!item?.id) return;
            map.set(String(item.id), item);
        });
        return map;
    }, [data?.computedFees?.items]);

    // Compute pricing and propagate as single source of truth (service + invoice + payment).
    const handleChange = async (
        newIds: string[],
        payCurr: string,
        quantityOverrides?: Record<string, number>
    ) => {
        const idsSnapshot = Array.from(new Set(newIds));
        const mergedQuantities = {
            ...serviceQuantities,
            ...(quantityOverrides || {}),
        };
        const normalizedSelection = normalizeSelectionsAndQuantities(idsSnapshot, mergedQuantities);
        const normalizedIds = normalizedSelection.ids;
        const normalizedQuantities = normalizedSelection.quantities;
        setIsConverting(true);
        try {
            const normalizedCurrency = allowedCurrencies.includes(String(payCurr).toUpperCase())
                ? String(payCurr).toUpperCase()
                : allowedCurrencies[0];
            const nextData = {
                ...data,
                optionalFeeIds: normalizedIds,
                serviceItemsSelected: normalizedIds,
                serviceQuantities: normalizedQuantities,
                paymentCurrency: normalizedCurrency,
            };

            let computedFees: any = null;

            if (typeof computeFees === "function") {
                computedFees = computeFees(nextData, (config as any).entityMeta || null) || {};
                const needsHkdConversion =
                    normalizedCurrency === "HKD"
                    && !(Number.isFinite(Number(computedFees?.exchangeRateUsed)) && Number(computedFees?.exchangeRateUsed) > 0);

                if (needsHkdConversion) {
                    const totalUsd = Number(computedFees?.total || 0);
                    const conv = await convertUsdToHkd(totalUsd);
                    const rate = Number(conv.rate || 0);
                    const scale = (val: any) => Number((Number(val || 0) * rate).toFixed(2));
                    const cardFeePct = getCardFeePct("HKD");
                    const payMethod = String(nextData.payMethod || "card").toLowerCase();
                    const convertedTotal = Number(conv.hkdAmount || 0);
                    const cardFeeSurcharge = payMethod === "card"
                        ? Number((convertedTotal * cardFeePct).toFixed(2))
                        : 0;
                    const grandTotal = Number((convertedTotal + cardFeeSurcharge).toFixed(2));

                    computedFees = {
                        ...computedFees,
                        currency: "HKD",
                        items: Array.isArray(computedFees?.items)
                            ? computedFees.items.map((item: any) => ({
                                ...item,
                                amount: scale(item?.amount),
                                ...(item?.original !== undefined ? { original: scale(item?.original) } : {}),
                            }))
                            : [],
                        government: scale(computedFees?.government),
                        service: scale(computedFees?.service),
                        total: convertedTotal,
                        exchangeRateUsed: rate,
                        originalAmountUsd: totalUsd,
                        cardFeePct,
                        cardFeeSurcharge,
                        grandTotal,
                    };
                } else {
                    const cardFeePct = Number(computedFees?.cardFeePct || getCardFeePct(normalizedCurrency));
                    const payMethod = String(nextData.payMethod || "card").toLowerCase();
                    const total = Number(computedFees?.total || 0);
                    const cardFeeSurcharge = payMethod === "card"
                        ? Number((total * cardFeePct).toFixed(2))
                        : Number(computedFees?.cardFeeSurcharge || 0);
                    const grandTotal = Number((total + cardFeeSurcharge).toFixed(2));

                    computedFees = {
                        ...computedFees,
                        currency: normalizedCurrency,
                        cardFeePct,
                        cardFeeSurcharge,
                        grandTotal,
                    };
                }
            } else {
                const governmentTotalUsd = govItems.reduce((s: number, it: any) => s + Number(it.amount || 0), 0);
                const mandatoryServiceTotalUsd = svcItemsMeta
                    .filter((f: any) => f.mandatory)
                    .reduce((s: number, it: any) => {
                        const quantity = getNormalizedQuantity(it, normalizedQuantities[it.id], true);
                        return s + (Number(it.amount || 0) * Number(quantity || 0));
                    }, 0);
                const optionalSelectedTotalUsd = svcItemsMeta
                    .filter((f: any) => !f.mandatory && normalizedIds.includes(f.id))
                    .reduce((s: number, it: any) => {
                        const quantity = getNormalizedQuantity(it, normalizedQuantities[it.id], true);
                        return s + (Number(it.amount || 0) * Number(quantity || 0));
                    }, 0);

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

                let finalSubtotal = subtotalUsd;
                let rate: number | undefined;
                if (normalizedCurrency === "HKD") {
                    const conv = await convertUsdToHkd(subtotalUsd);
                    finalSubtotal = conv.hkdAmount;
                    rate = conv.rate;
                }

                const cardFeePct = getCardFeePct(normalizedCurrency);
                const payMethod = String(nextData.payMethod || "card").toLowerCase();
                const cardFeeSurcharge = payMethod === "card"
                    ? Number((finalSubtotal * cardFeePct).toFixed(2))
                    : 0;
                const grandTotal = Number((finalSubtotal + cardFeeSurcharge).toFixed(2));

                computedFees = {
                    currency: normalizedCurrency,
                    items: [
                        ...govItems.map((f: any) => ({
                            id: f.id,
                            label: f.label,
                            amount: normalizedCurrency === "HKD" ? Number((f.amount * (rate || 1)).toFixed(2)) : f.amount,
                            original: normalizedCurrency === "HKD" ? Number((f.original * (rate || 1)).toFixed(2)) : f.original,
                            info: f.info,
                            kind: "government" as const,
                            quantity: 1,
                        })),
                        ...svcItemsMeta
                            .filter((f: any) => f.mandatory || normalizedIds.includes(f.id))
                            .map((f: any) => {
                                const quantity = getNormalizedQuantity(f, normalizedQuantities[f.id], true);
                                return {
                                    id: f.id,
                                    label: f.label,
                                    amount: normalizedCurrency === "HKD" ? Number((f.amount * (rate || 1)).toFixed(2)) : f.amount,
                                    original: normalizedCurrency === "HKD" ? Number((f.original * (rate || 1)).toFixed(2)) : f.original,
                                    info: f.info,
                                    kind: "service" as const,
                                    quantity,
                                };
                            }),
                        ...(extraKycUsd > 0 ? [{
                            id: "extra_kyc",
                            label: "newHk.fees.items.extra_kyc.label",
                            amount: normalizedCurrency === "HKD" ? Number((extraKycUsd * (rate || 1)).toFixed(2)) : extraKycUsd,
                            original: normalizedCurrency === "HKD" ? Number((extraKycUsd * (rate || 1)).toFixed(2)) : extraKycUsd,
                            info: "Additional KYC fees for corporate shareholders and extra individual shareholders.",
                            kind: "service" as const,
                            quantity: 1,
                        }] : []),
                    ],
                    government: normalizedCurrency === "HKD" ? Number((governmentTotalUsd * (rate || 1)).toFixed(2)) : governmentTotalUsd,
                    service: normalizedCurrency === "HKD" ? Number((serviceTotalUsd * (rate || 1)).toFixed(2)) : serviceTotalUsd,
                    total: finalSubtotal,
                    exchangeRateUsed: rate,
                    originalAmountUsd: subtotalUsd,
                    cardFeePct,
                    cardFeeSurcharge,
                    grandTotal,
                };
            }

            const feesChanged = JSON.stringify(data.computedFees || {}) !== JSON.stringify(computedFees);
            const selectionChanged = !sameSelection(normalizedIds, selectedIds);
            const currencyChanged = normalizedCurrency !== selectedCurrency;
            const quantitiesChanged = JSON.stringify(serviceQuantities || {}) !== JSON.stringify(normalizedQuantities || {});

            if (feesChanged || selectionChanged || currencyChanged || quantitiesChanged) {
                onChange({
                    ...nextData,
                    optionalFeeIds: normalizedIds,
                    serviceItemsSelected: normalizedIds,
                    serviceQuantities: normalizedQuantities,
                    paymentCurrency: normalizedCurrency,
                    computedFees,
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

    const toNumber = (value: any) => {
        const n = Number(value ?? 0);
        return Number.isFinite(n) ? n : 0;
    };

    const getRowAmounts = (item: any) => {
        const rate = Number(data?.computedFees?.exchangeRateUsed || 0);
        const shouldConvert = selectedCurrency === "HKD" && rate > 0;
        const scale = (val: any) => shouldConvert ? Number((toNumber(val) * rate).toFixed(2)) : toNumber(val);
        const computed = item?.id ? computedItemsById.get(String(item.id)) : undefined;
        const computedQty = Number(computed?.quantity);
        const selected = item?.mandatory || selectedIds.includes(item?.id);
        const normalizedQty = getNormalizedQuantity(item, serviceQuantities[item?.id], selected);
        const quantity = Number.isFinite(computedQty) && computedQty > 0
            ? Math.floor(computedQty)
            : Math.max(0, normalizedQty);

        if (computed) {
            return {
                amountPerUnit: computed?.amount !== undefined ? toNumber(computed.amount) : scale(item?.amount),
                originalPerUnit: computed?.original !== undefined
                    ? toNumber(computed.original)
                    : (item?.original !== undefined ? scale(item.original) : undefined),
                quantity,
            };
        }

        return {
            amountPerUnit: scale(item?.amount),
            originalPerUnit: item?.original !== undefined ? scale(item.original) : undefined,
            quantity,
        };
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

    const adjustQuantity = (item: any, delta: number) => {
        if (isLocked || item?.mandatory || !isQuantityItem(item)) return;
        const cap = getQuantityCap(item);
        const { quantity } = getRowAmounts(item);
        const nextQty = Math.max(0, Math.min(cap, quantity + delta));

        const nextQuantities: Record<string, number> = {
            ...serviceQuantities,
            [item.id]: nextQty,
        };

        const ids = new Set(selectedIds);
        if (nextQty > 0) ids.add(item.id);
        else ids.delete(item.id);

        handleChange(Array.from(ids), selectedCurrency, nextQuantities);
    };

    // Render row for each fee item
    const Row = ({ item }: { item: any }) => {
        const label = typeof t(item.label, item.label) === 'string' ? t(item.label, item.label) : item.label;
        const info = item.info ? (typeof t(item.info, item.info) === 'string' ? t(item.info, item.info) : undefined) : undefined;
        const quantityMode = isQuantityItem(item);
        const cap = getQuantityCap(item);
        const { amountPerUnit, originalPerUnit, quantity } = getRowAmounts(item);
        const checked = quantityMode
            ? (quantity > 0)
            : (item.mandatory || selectedIds.includes(item.id));
        const disabled = item.mandatory || isLocked;
        const effectiveQty = quantityMode
            ? Math.max(0, quantity)
            : (checked ? 1 : 0);
        const amount = quantityMode && effectiveQty > 0
            ? amountPerUnit * effectiveQty
            : amountPerUnit;
        const original = originalPerUnit !== undefined
            ? (quantityMode && effectiveQty > 0 ? originalPerUnit * effectiveQty : originalPerUnit)
            : undefined;
        const unitLabelKey = getQuantityMeta(item).unitLabel;
        const unitLabel = quantityMode ? t(unitLabelKey || "service.quantity.unit", "person") : "";

        return (
            <TableRow>
                <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                        <span>{label}</span>
                        {info && renderTip(info)}
                    </div>
                </TableCell>
                <TableCell className="text-right">
                    {original !== undefined ? formatPrice(original, selectedCurrency) : "-"}
                </TableCell>
                <TableCell className="text-right">
                    {formatPrice(amount, selectedCurrency)}
                </TableCell>
                <TableCell className="text-center w-[180px]">
                    {quantityMode ? (
                        <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-2 justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7"
                                    disabled={disabled || effectiveQty <= 0}
                                    onClick={() => adjustQuantity(item, -1)}
                                >
                                    <Minus className="h-3.5 w-3.5" />
                                </Button>
                                <span className="inline-flex min-w-8 justify-center rounded border px-2 py-1 text-sm font-semibold">
                                    {effectiveQty}
                                </span>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7"
                                    disabled={disabled || cap <= 0 || effectiveQty >= cap}
                                    onClick={() => adjustQuantity(item, 1)}
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                            <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                                × {formatPrice(amountPerUnit, selectedCurrency)}/{unitLabel}
                            </span>
                        </div>
                    ) : (
                        <Checkbox
                            checked={checked}
                            disabled={disabled}
                            onCheckedChange={() => toggleService(item.id, item.mandatory)}
                        />
                    )}
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
    const mandatorySvcSubtotal = mandatorySvcItems.reduce((s: number, it: any) => {
        const qty = getNormalizedQuantity(it, serviceQuantities[it.id], true);
        return s + (Number(it.amount || 0) * Number(qty || 0));
    }, 0);
    const optionalSvcSubtotal = optionalSvcItems
        .filter((f: any) => selectedIds.includes(f.id))
        .reduce((s: number, it: any) => {
            const qty = getNormalizedQuantity(it, serviceQuantities[it.id], true);
            return s + (Number(it.amount || 0) * Number(qty || 0));
        }, 0);

    // Extra KYC subtotal
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
    const normalizedCardFeePct = Number(data.computedFees?.cardFeePct || 0);
    const normalizedCardFeeSurcharge = Number(data.computedFees?.cardFeeSurcharge || 0);
    const hasCardFeeLine = normalizedCardFeeSurcharge > 0;
    const totalConverted =
        typeof data.computedFees?.total === "number"
            ? Number(data.computedFees.total)
            : govSubtotalConverted + mandatorySvcSubtotalConverted + optionalSvcSubtotalConverted + extraKycSubtotalConverted;



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
                                    <TableHead className="text-center font-semibold w-[180px]">
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
                                        {allowedCurrencies.map((code) => (
                                            <SelectItem key={code} value={code}>
                                                {code === "USD" ? "USD ($)" : code === "HKD" ? "HKD (HK$)" : code}
                                            </SelectItem>
                                        ))}
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

            {hasCardFeeLine && (
                <div className="flex justify-between items-center text-sm px-4 py-3 bg-primary/5 border border-primary/10 rounded-lg">
                    <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">{t("invoice.cardFee", "Card Processing Fee")}</span>
                        {normalizedCardFeePct > 0 && (
                            <span className="text-[10px] text-primary border border-primary/20 rounded px-1.5 py-0.5 whitespace-nowrap">
                                {Math.round(normalizedCardFeePct * 100)}%
                            </span>
                        )}
                    </div>
                    <span className="font-medium">{formatPrice(normalizedCardFeeSurcharge, selectedCurrency)}</span>
                </div>
            )}

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
