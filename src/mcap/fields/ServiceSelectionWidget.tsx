/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { convertCurrency, DEFAULT_PRICING_BASE_CURRENCY, getPricingBaseCurrency } from "@/services/exchangeRate";
import type { McapConfig } from "../configs/types";
import {
    ADDITIONAL_EXECUTIVE_CORPORATES_ID,
    ADDITIONAL_EXECUTIVE_INDIVIDUALS_ID,
    ADDITIONAL_EXECUTIVE_ITEM_IDS,
    applyAdditionalExecutiveFeesToFees,
    buildAdditionalExecutiveServiceItems,
    getAdditionalExecutivePreview,
    getAdditionalExecutiveUsdToBaseRate,
} from "../additionalExecutivePricing";

interface ServiceSelectionWidgetProps {
    config: McapConfig;
    data: any;
    onChange: (data: any) => void;
    fees?: any;
    items?: any[] | ((data: any, entityMeta?: any) => any[]);
    currency?: string;
    supportedCurrencies?: string[];
    computeFees?: (data: Record<string, any>, entityMeta?: Record<string, any> | null) => any;
}

type QuantityScope = "totalParties" | "dcpParties";

interface QuantityControlMeta {
    enabled?: boolean;
    min?: number;
    max?: number;
    maxBy?: QuantityScope;
    unitLabel?: string;
}

export function ServiceSelectionWidget({
    config,
    data,
    onChange,
    fees,
    items,
    currency,
    supportedCurrencies,
    computeFees,
}: ServiceSelectionWidgetProps) {
    const { t } = useTranslation(["common", "incorporation"]);
    const optionalIds: string[] = Array.isArray(data.optionalFeeIds) ? data.optionalFeeIds : [];
    const serviceIds: string[] = Array.isArray(data.serviceItemsSelected) ? data.serviceItemsSelected : [];
    const selectedIds: string[] = Array.from(new Set([...optionalIds, ...serviceIds]));
    const parties = useMemo(() => (Array.isArray(data?.parties) ? data.parties : []), [data?.parties]);
    const totalPartyCount = parties.length;
    const dcpPartyCount = parties.filter((p: any) => Array.isArray(p?.roles) && p.roles.includes("dcp")).length;
    const shouldShowAdditionalExecutiveRows = totalPartyCount > 0;
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
    const basePricingCurrency = getPricingBaseCurrency(config?.countryCode);
    const hasExplicitPaymentCurrencyChoice = data?.paymentCurrencyTouched === true;
    const shouldForceBaseCurrencyDefault = config?.countryCode === "EE" && !hasExplicitPaymentCurrencyChoice;
    const allowedCurrencies = useMemo(() => {
        const raw = Array.isArray(supportedCurrencies) && supportedCurrencies.length > 0
            ? supportedCurrencies
            : ["USD", "HKD"];
        const normalized = raw
            .map((entry) => String(entry || "").trim().toUpperCase())
            .filter(Boolean);
        return normalized.length > 0 ? Array.from(new Set(normalized)) : ["USD", "HKD"];
    }, [supportedCurrencies]);
    const defaultCurrencySeed = shouldForceBaseCurrencyDefault
        ? (currency || basePricingCurrency)
        : (
            data.paymentCurrency
            || (basePricingCurrency !== DEFAULT_PRICING_BASE_CURRENCY
                ? (currency || basePricingCurrency)
                : (data.currency || currency || basePricingCurrency))
        );
    const selectedCurrencyRaw = String(defaultCurrencySeed).toUpperCase();
    const selectedCurrency = allowedCurrencies.includes(selectedCurrencyRaw)
        ? selectedCurrencyRaw
        : allowedCurrencies[0];
    const isLocked = data.paymentStatus === "paid";

    // Extract fees from config or passed items
    const feesMeta = (config && (config as any).entityMeta && (config as any).entityMeta.fees) || null;
    const resolvedItems = typeof items === "function" ? items(data, (config as any).entityMeta || null) : items;
    const additionalExecutiveUsdToBaseRate = useMemo(
        () => getAdditionalExecutiveUsdToBaseRate(config?.countryCode, data),
        [config?.countryCode, data]
    );
    const additionalExecutiveItems = useMemo(
        () => buildAdditionalExecutiveServiceItems(config?.countryCode, parties, shouldShowAdditionalExecutiveRows, {
            usdToBaseRate: additionalExecutiveUsdToBaseRate,
        }),
        [shouldShowAdditionalExecutiveRows, additionalExecutiveUsdToBaseRate, config?.countryCode, parties]
    );
    const additionalExecutivePreview = useMemo(
        () => getAdditionalExecutivePreview(config?.countryCode, parties, {
            usdToBaseRate: additionalExecutiveUsdToBaseRate,
        }),
        [additionalExecutiveUsdToBaseRate, config?.countryCode, parties]
    );

    const resolvedServiceItems = useMemo(
        () => (Array.isArray(resolvedItems) ? resolvedItems : []),
        [resolvedItems]
    );
    const hasResolvedServiceItems = resolvedServiceItems.length > 0;
    const isGovernmentItem = (item: any) => String(item?.kind || "").toLowerCase() === "government";
    const govItems = useMemo(() => {
        if (hasResolvedServiceItems) {
            return resolvedServiceItems.filter((item: any) => isGovernmentItem(item));
        }
        return Array.isArray(feesMeta?.government) ? feesMeta.government : [];
    }, [feesMeta?.government, hasResolvedServiceItems, resolvedServiceItems]);
    const svcSource = useMemo(
        () => {
            const source = hasResolvedServiceItems
                ? resolvedServiceItems.filter((item: any) => !isGovernmentItem(item))
                : (Array.isArray(feesMeta?.service) ? feesMeta.service : []);
            return source.filter((item: any) => !ADDITIONAL_EXECUTIVE_ITEM_IDS.has(String(item?.id || "")));
        },
        [feesMeta?.service, hasResolvedServiceItems, resolvedServiceItems]
    );
    const svcItemsMeta = useMemo(() => [...svcSource, ...additionalExecutiveItems], [additionalExecutiveItems, svcSource]);
    const servicePricingSignature = useMemo(
        () => JSON.stringify(
            (svcItemsMeta || []).map((item: any) => ({
                id: String(item?.id || ""),
                amount: Number(item?.amount || 0),
                original: Number(item?.original ?? item?.amount ?? 0),
                mandatory: !!item?.mandatory,
                quantity: Number(item?.quantity || 1),
                managedByPartyKyc: !!item?.managedByPartyKyc,
                managedByPartyData: !!item?.managedByPartyData,
            }))
        ),
        [svcItemsMeta]
    );

    const getCardFeePct = (curr: string) => (String(curr).toUpperCase() === "HKD" ? 0.04 : 0.06);
    const getQuantityMeta = (item: any): QuantityControlMeta => {
        const meta = item?.quantityControl;
        return meta && typeof meta === "object" ? meta : {};
    };
    const isQuantityItem = (item: any) => !!getQuantityMeta(item).enabled;
    const isPartyManagedItem = (item: any) => !!item?.managedByPartyKyc;
    const isManagedByPartyDataItem = (item: any) => !!item?.managedByPartyData;
    const isManagedComputedItem = (item: any) => isPartyManagedItem(item) || isManagedByPartyDataItem(item);
    const getQuantityCap = (item: any) => {
        const meta = getQuantityMeta(item);
        if (!meta.enabled) return 1;
        const fixedMax = Number(meta.max);
        if (Number.isFinite(fixedMax) && fixedMax > 0) {
            return Math.max(1, Math.floor(fixedMax));
        }
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

        const minQty = Math.max(1, Math.floor(Number(getQuantityMeta(item).min || 1)));
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

            if (isManagedComputedItem(item)) {
                ids.delete(item.id);
                return;
            }

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
        const allowedIds = new Set(svcItemsMeta.map((item: any) => String(item.id)));
        const sanitizedSelectedIds = selectedIds.filter((id) => allowedIds.has(String(id)));
        const mandatoryIds = svcItemsMeta.filter((i: any) => i.mandatory).map((i: any) => i.id);
        const newIds = [...new Set([...sanitizedSelectedIds, ...mandatoryIds])];
        if (newIds.length !== selectedIds.length || !newIds.every(id => selectedIds.includes(id))) {
            handleChange(newIds, selectedCurrency);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [svcItemsMeta]);

    const [isConverting, setIsConverting] = useState(false);

    useEffect(() => {
        if (isLocked) return;
        if (
            selectedCurrencyRaw !== selectedCurrency
            || (shouldForceBaseCurrencyDefault && String(data?.paymentCurrency || "").toUpperCase() !== selectedCurrency)
        ) {
            handleChange(selectedIds, selectedCurrency);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCurrencyRaw, selectedCurrency, isLocked, shouldForceBaseCurrencyDefault, data?.paymentCurrency]);

    const toggleService = (id: string, mandatory: boolean = false) => {
        if (mandatory || isLocked) return;
        const newIds = selectedIds.includes(id)
            ? selectedIds.filter(s => s !== id)
            : [...selectedIds, id];
        handleChange(newIds, selectedCurrency);
    };

    const handleCurrencyChange = (newCurr: string) => {
        handleChange(selectedIds, newCurr, undefined, true);
    };

    const sameSelection = (a: string[], b: string[]) =>
        a.length === b.length && a.every(id => b.includes(id));

    const effectiveComputedFees = useMemo(() => {
        const external = fees && typeof fees === "object" ? fees : null;
        if (external) return external;
        return data?.computedFees && typeof data.computedFees === "object" ? data.computedFees : {};
    }, [data?.computedFees, fees]);

    const computedItemsById = useMemo(() => {
        const map = new Map<string, any>();
        const computedItems = Array.isArray(effectiveComputedFees?.items) ? effectiveComputedFees.items : [];
        computedItems.forEach((item: any) => {
            if (!item?.id) return;
            map.set(String(item.id), item);
        });
        return map;
    }, [effectiveComputedFees?.items]);

    // Compute pricing and propagate as single source of truth (service + invoice + payment).
    const handleChange = async (
        newIds: string[],
        payCurr: string,
        quantityOverrides?: Record<string, number>,
        markPaymentCurrencyTouched: boolean = false,
        dataPatch: Record<string, any> = {}
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
            const resolveFallbackCurrency = (preferredCurrency?: string) => {
                const preferred = String(preferredCurrency || "").toUpperCase();
                if (preferred && allowedCurrencies.includes(preferred)) return preferred;
                if (allowedCurrencies.includes(basePricingCurrency)) return basePricingCurrency;
                if (allowedCurrencies.includes(DEFAULT_PRICING_BASE_CURRENCY)) return DEFAULT_PRICING_BASE_CURRENCY;
                return allowedCurrencies[0];
            };
            let effectivePaymentCurrency = normalizedCurrency;
            let conversionFallback = false;
            const nextData = {
                ...data,
                ...dataPatch,
                optionalFeeIds: normalizedIds,
                serviceItemsSelected: normalizedIds,
                serviceQuantities: normalizedQuantities,
                paymentCurrency: normalizedCurrency,
                paymentCurrencyTouched: markPaymentCurrencyTouched ? true : data?.paymentCurrencyTouched,
            };

            let computedFees: any = null;

            if (typeof computeFees === "function") {
                computedFees = computeFees(nextData, (config as any).entityMeta || null) || {};
                const computedCurrency = String(computedFees?.currency || "").toUpperCase();
                const needsCurrencyConversion =
                    !!computedCurrency
                    && computedCurrency !== normalizedCurrency;

                if (needsCurrencyConversion) {
                    const sourceCurrency = computedCurrency;
                    const sourceTotal = Number(computedFees?.total ?? 0);
                    try {
                        const conv = await convertCurrency(sourceTotal, sourceCurrency, normalizedCurrency);
                        const rate = Number(conv.rate || 0);
                        const scale = (val: any) => Number((Number(val || 0) * rate).toFixed(2));
                        const cardFeePct = getCardFeePct(normalizedCurrency);
                        const payMethod = String(nextData.payMethod || "card").toLowerCase();
                        const convertedTotal = Number(conv.convertedAmount || 0);
                        const cardFeeSurcharge = payMethod === "card"
                            ? Number((convertedTotal * cardFeePct).toFixed(2))
                            : 0;
                        const grandTotal = Number((convertedTotal + cardFeeSurcharge).toFixed(2));

                        computedFees = {
                            ...computedFees,
                            currency: normalizedCurrency,
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
                            originalCurrency: sourceCurrency,
                            originalAmount: sourceTotal,
                            ...(sourceCurrency === "USD" ? { originalAmountUsd: sourceTotal } : {}),
                            cardFeePct,
                            cardFeeSurcharge,
                            grandTotal,
                        };
                    } catch (conversionError) {
                        conversionFallback = true;
                        effectivePaymentCurrency = resolveFallbackCurrency(sourceCurrency || basePricingCurrency);
                        console.error("Currency conversion failed. Falling back to base pricing currency.", conversionError);

                        const normalizedOriginalCurrency = String(
                            computedFees?.originalCurrency
                            || (computedFees?.originalAmountUsd !== undefined ? "USD" : sourceCurrency || basePricingCurrency)
                        ).toUpperCase();
                        const normalizedOriginalAmount = Number(
                            computedFees?.originalAmount
                            ?? (computedFees?.originalAmountUsd !== undefined
                                ? computedFees.originalAmountUsd
                                : computedFees?.total ?? 0)
                        );
                        const fallbackCurrency = effectivePaymentCurrency;
                        const fallbackTotal = Number(computedFees?.total || 0);
                        const fallbackCardFeePct = Number(computedFees?.cardFeePct || getCardFeePct(fallbackCurrency));
                        const payMethod = String(nextData.payMethod || "card").toLowerCase();
                        const fallbackCardFeeSurcharge = payMethod === "card"
                            ? Number((fallbackTotal * fallbackCardFeePct).toFixed(2))
                            : Number(computedFees?.cardFeeSurcharge || 0);
                        const fallbackGrandTotal = Number((fallbackTotal + fallbackCardFeeSurcharge).toFixed(2));
                        const { exchangeRateUsed: _ignoredExchangeRateUsed, ...computedFeesWithoutLegacyUsd } = computedFees || {};

                        computedFees = {
                            ...computedFeesWithoutLegacyUsd,
                            currency: fallbackCurrency,
                            originalCurrency: normalizedOriginalCurrency,
                            originalAmount: normalizedOriginalAmount,
                            ...(normalizedOriginalCurrency === "USD" ? { originalAmountUsd: normalizedOriginalAmount } : {}),
                            cardFeePct: fallbackCardFeePct,
                            cardFeeSurcharge: fallbackCardFeeSurcharge,
                            grandTotal: fallbackGrandTotal,
                        };
                    }
                } else {
                    const normalizedOriginalCurrency = String(
                        computedFees?.originalCurrency
                        || (computedFees?.originalAmountUsd !== undefined ? "USD" : basePricingCurrency)
                    ).toUpperCase();
                    const normalizedOriginalAmount = Number(
                        computedFees?.originalAmount
                        ?? (computedFees?.originalAmountUsd !== undefined
                            ? computedFees.originalAmountUsd
                            : computedFees?.total ?? 0)
                    );
                    const cardFeePct = Number(computedFees?.cardFeePct || getCardFeePct(normalizedCurrency));
                    const payMethod = String(nextData.payMethod || "card").toLowerCase();
                    const total = Number(computedFees?.total || 0);
                    const cardFeeSurcharge = payMethod === "card"
                        ? Number((total * cardFeePct).toFixed(2))
                        : Number(computedFees?.cardFeeSurcharge || 0);
                    const grandTotal = Number((total + cardFeeSurcharge).toFixed(2));
                    const { ...computedFeesWithoutLegacyUsd } = computedFees;

                    computedFees = {
                        ...computedFeesWithoutLegacyUsd,
                        currency: normalizedCurrency,
                        originalCurrency: normalizedOriginalCurrency,
                        originalAmount: normalizedOriginalAmount,
                        ...(normalizedOriginalCurrency === "USD" ? { originalAmountUsd: normalizedOriginalAmount } : {}),
                        cardFeePct,
                        cardFeeSurcharge,
                        grandTotal,
                    };
                }
            } else {
                const governmentTotalBase = govItems.reduce((s: number, it: any) => s + Number(it.amount || 0), 0);
                const mandatoryServiceTotalBase = svcItemsMeta
                    .filter((f: any) => f.mandatory)
                    .reduce((s: number, it: any) => {
                        const quantity = getNormalizedQuantity(it, normalizedQuantities[it.id], true);
                        return s + (Number(it.amount || 0) * Number(quantity || 0));
                    }, 0);
                const managedServiceTotalBase = svcItemsMeta
                    .filter((f: any) => !f.mandatory && isManagedComputedItem(f))
                    .reduce((s: number, it: any) => {
                        const quantity = getNormalizedQuantity(it, normalizedQuantities[it.id], true);
                        return s + (Number(it.amount || 0) * Number(quantity || 0));
                    }, 0);
                const optionalSelectedTotalBase = svcItemsMeta
                    .filter((f: any) => !f.mandatory && !isManagedComputedItem(f) && normalizedIds.includes(f.id))
                    .reduce((s: number, it: any) => {
                        const quantity = getNormalizedQuantity(it, normalizedQuantities[it.id], true);
                        return s + (Number(it.amount || 0) * Number(quantity || 0));
                    }, 0);

                const serviceTotalBase = mandatoryServiceTotalBase + managedServiceTotalBase + optionalSelectedTotalBase;
                const subtotalBase = governmentTotalBase + serviceTotalBase;

                let finalSubtotal = subtotalBase;
                let rate: number | undefined;
                let displayCurrency = normalizedCurrency;
                if (normalizedCurrency !== basePricingCurrency) {
                    try {
                        const conv = await convertCurrency(subtotalBase, basePricingCurrency, normalizedCurrency);
                        finalSubtotal = conv.convertedAmount;
                        rate = conv.rate;
                    } catch (conversionError) {
                        conversionFallback = true;
                        displayCurrency = resolveFallbackCurrency(basePricingCurrency);
                        effectivePaymentCurrency = displayCurrency;
                        finalSubtotal = subtotalBase;
                        rate = undefined;
                        console.error("Currency conversion failed. Falling back to base pricing currency.", conversionError);
                    }
                }
                const isConvertedDisplay =
                    displayCurrency !== basePricingCurrency
                    && Number.isFinite(Number(rate))
                    && Number(rate) > 0;

                const cardFeePct = getCardFeePct(displayCurrency);
                const payMethod = String(nextData.payMethod || "card").toLowerCase();
                const cardFeeSurcharge = payMethod === "card"
                    ? Number((finalSubtotal * cardFeePct).toFixed(2))
                    : 0;
                const grandTotal = Number((finalSubtotal + cardFeeSurcharge).toFixed(2));

                computedFees = {
                    currency: displayCurrency,
                    items: [
                        ...govItems.map((f: any) => ({
                            id: f.id,
                            label: f.label,
                            amount: isConvertedDisplay ? Number((f.amount * Number(rate || 1)).toFixed(2)) : f.amount,
                            original: isConvertedDisplay ? Number((f.original * Number(rate || 1)).toFixed(2)) : f.original,
                            info: f.info,
                            kind: "government" as const,
                            quantity: 1,
                        })),
                        ...svcItemsMeta
                            .filter((f: any) =>
                                f.mandatory
                                || isManagedComputedItem(f)
                                || normalizedIds.includes(f.id)
                            )
                            .map((f: any) => {
                                const quantity = getNormalizedQuantity(f, normalizedQuantities[f.id], true);
                                return {
                                    id: f.id,
                                    label: f.label,
                                    amount: isConvertedDisplay ? Number((f.amount * Number(rate || 1)).toFixed(2)) : f.amount,
                                    original: isConvertedDisplay ? Number((f.original * Number(rate || 1)).toFixed(2)) : f.original,
                                    info: f.info,
                                    kind: "service" as const,
                                    quantity,
                                    managedByPartyData: f.managedByPartyData,
                                };
                            }),
                    ],
                    government: isConvertedDisplay ? Number((governmentTotalBase * Number(rate || 1)).toFixed(2)) : governmentTotalBase,
                    service: isConvertedDisplay ? Number((serviceTotalBase * Number(rate || 1)).toFixed(2)) : serviceTotalBase,
                    total: finalSubtotal,
                    exchangeRateUsed: isConvertedDisplay ? rate : undefined,
                    originalCurrency: basePricingCurrency,
                    originalAmount: subtotalBase,
                    ...(basePricingCurrency === "USD" ? { originalAmountUsd: subtotalBase } : {}),
                    cardFeePct,
                    cardFeeSurcharge,
                    grandTotal,
                };
            }

            computedFees = applyAdditionalExecutiveFeesToFees(computedFees, {
                countryCode: config?.countryCode,
                parties: nextData.parties,
                payMethod: nextData.payMethod,
                enabled: Array.isArray(nextData?.parties) && nextData.parties.length > 0,
                usdToBaseRate: getAdditionalExecutiveUsdToBaseRate(config?.countryCode, nextData),
            });
            if (conversionFallback && computedFees && typeof computedFees === "object") {
                computedFees = {
                    ...computedFees,
                    conversionFallback: true,
                    requestedCurrency: normalizedCurrency,
                };
            }

            const resolvedPaymentCurrency = effectivePaymentCurrency;
            const nextDataWithResolvedCurrency = {
                ...nextData,
                paymentCurrency: resolvedPaymentCurrency,
            };
            const feesChanged = JSON.stringify(data.computedFees || {}) !== JSON.stringify(computedFees);
            const selectionChanged = !sameSelection(normalizedIds, selectedIds);
            const currencyChanged = resolvedPaymentCurrency !== selectedCurrency;
            const quantitiesChanged = JSON.stringify(serviceQuantities || {}) !== JSON.stringify(normalizedQuantities || {});
            const patchChanged = Object.keys(dataPatch).some((key) =>
                JSON.stringify(data?.[key]) !== JSON.stringify(nextDataWithResolvedCurrency[key])
            );

            if (feesChanged || selectionChanged || currencyChanged || quantitiesChanged || patchChanged) {
                onChange({
                    ...nextDataWithResolvedCurrency,
                    optionalFeeIds: normalizedIds,
                    serviceItemsSelected: normalizedIds,
                    serviceQuantities: normalizedQuantities,
                    paymentCurrency: resolvedPaymentCurrency,
                    paymentCurrencyTouched: markPaymentCurrencyTouched ? true : data?.paymentCurrencyTouched,
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
        if (data.selectedState || data.selectedEntity || svcItemsMeta.length > 0) {
            handleChange(selectedIds, selectedCurrency);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.selectedState, data.selectedEntity, data.parties, servicePricingSignature]);

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

    const computedFeesCurrency = String(effectiveComputedFees?.currency || "").toUpperCase();
    const computedFeesSourceCurrency = String(
        effectiveComputedFees?.originalCurrency
        || (effectiveComputedFees?.originalAmountUsd !== undefined ? "USD" : basePricingCurrency)
    ).toUpperCase();

    const getRowAmounts = (item: any) => {
        const rate = Number(effectiveComputedFees?.exchangeRateUsed || 0);
        const hasMatchingComputedCurrency = computedFeesCurrency === selectedCurrency;
        const shouldConvert =
            computedFeesSourceCurrency !== selectedCurrency
            && hasMatchingComputedCurrency
            && rate > 0;
        const scale = (val: any) => shouldConvert ? Number((toNumber(val) * rate).toFixed(2)) : toNumber(val);
        const computed = item?.id ? computedItemsById.get(String(item.id)) : undefined;
        const computedQty = Number(computed?.quantity);
        const selected = item?.mandatory || selectedIds.includes(item?.id);
        const normalizedQty = isManagedComputedItem(item)
            ? Math.max(0, Math.floor(toNumber(item?.quantity)))
            : getNormalizedQuantity(item, serviceQuantities[item?.id], selected);
        const quantity = Number.isFinite(computedQty)
            ? Math.max(0, Math.floor(computedQty))
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
        const partyManaged = isPartyManagedItem(item);
        const managedComputed = isManagedComputedItem(item);
        const quantityMode = isQuantityItem(item);
        const cap = getQuantityCap(item);
        const { amountPerUnit, originalPerUnit, quantity } = getRowAmounts(item);
        const checked = quantityMode
            ? quantity > 0
            : (item.mandatory || selectedIds.includes(item.id));
        const disabled = item.mandatory || isLocked;
        const effectiveQty = managedComputed || quantityMode
            ? Math.max(0, quantity)
            : (checked ? 1 : 0);
        const amount = managedComputed || quantityMode
            ? (effectiveQty > 0 ? amountPerUnit * effectiveQty : 0)
            : amountPerUnit;
        const original = originalPerUnit !== undefined
            ? ((managedComputed || quantityMode)
                ? (effectiveQty > 0 ? originalPerUnit * effectiveQty : 0)
                : originalPerUnit)
            : undefined;
        const unitLabelKey = item?.unitLabel || getQuantityMeta(item).unitLabel;
        const unitLabel = managedComputed || quantityMode ? t(unitLabelKey || "service.quantity.unit", "person") : "";
        const displayOriginal = original !== undefined && (!(managedComputed || quantityMode) || effectiveQty > 0)
            ? formatPrice(original, selectedCurrency)
            : "-";
        const displayAmount = (managedComputed || quantityMode) && effectiveQty <= 0
            ? "-"
            : formatPrice(amount, selectedCurrency);
        const unitRateText = (managedComputed || quantityMode) && amountPerUnit > 0
            ? `${formatPrice(amountPerUnit, selectedCurrency)}/${unitLabel}`
            : "";
        const managedStatusKey = typeof item?.managedStatusLabel === "string"
            ? item.managedStatusLabel
            : "service.managedByPartySetup";
        const managedStatusFallback = typeof item?.managedStatusLabel === "string"
            ? item.managedStatusLabel
            : "Calculated from Associated party setup";
        const managedStatusText = partyManaged
            ? String(
                effectiveQty > 0
                    ? t("service.managedByPartyKycSelected", "Selected in Party KYC")
                    : t("service.managedByPartyKycNotSelected", "Not selected in Party KYC")
            )
            : String(t(managedStatusKey, managedStatusFallback));
        const managedRateText = unitRateText
            ? (effectiveQty > 0 ? `${effectiveQty} x ${unitRateText}` : unitRateText)
            : "";

        return (
            <TableRow>
                <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                        <span>{label}</span>
                        {info && renderTip(info)}
                    </div>
                </TableCell>
                <TableCell className="text-right">
                    {displayOriginal}
                </TableCell>
                <TableCell className="text-right">
                    {displayAmount}
                </TableCell>
                <TableCell className="text-center w-[180px]">
                    {managedComputed ? (
                        <div className="flex flex-col items-end gap-1 text-right">
                            <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                                {managedStatusText}
                            </span>
                            {managedRateText && (
                                <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                                    {managedRateText}
                                </span>
                            )}
                        </div>
                    ) : quantityMode ? (
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
                                x {formatPrice(amountPerUnit, selectedCurrency)}/{unitLabel}
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
        mandatory: true,
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
        const qty = isManagedComputedItem(it)
            ? Math.max(0, Math.floor(toNumber(it?.quantity)))
            : getNormalizedQuantity(it, serviceQuantities[it.id], true);
        return s + (Number(it.amount || 0) * Number(qty || 0));
    }, 0);
    const managedSvcSubtotal = optionalSvcItems
        .filter((f: any) => isManagedComputedItem(f))
        .reduce((s: number, it: any) => {
            const qty = isManagedComputedItem(it)
                ? Math.max(0, Math.floor(toNumber(it?.quantity)))
                : getNormalizedQuantity(it, serviceQuantities[it.id], true);
            return s + (Number(it.amount || 0) * Number(qty || 0));
        }, 0);
    const optionalSvcSubtotal = optionalSvcItems
        .filter((f: any) => !isManagedComputedItem(f) && selectedIds.includes(f.id))
        .reduce((s: number, it: any) => {
            const qty = getNormalizedQuantity(it, serviceQuantities[it.id], true);
            return s + (Number(it.amount || 0) * Number(qty || 0));
        }, 0);

    // Convert to selected currency
    const convertAmount = (amount: number): number => {
        if (
            computedFeesSourceCurrency !== selectedCurrency
            && computedFeesCurrency === selectedCurrency
            && effectiveComputedFees?.exchangeRateUsed
        ) {
            return Number((amount * effectiveComputedFees.exchangeRateUsed).toFixed(2));
        }
        return amount;
    };

    const govSubtotalConverted = convertAmount(govSubtotal);
    const mandatorySvcSubtotalConverted = convertAmount(mandatorySvcSubtotal);
    const managedSvcSubtotalConverted = convertAmount(managedSvcSubtotal);
    const optionalSvcSubtotalConverted = convertAmount(optionalSvcSubtotal);
    const normalizedCardFeePct = Number(effectiveComputedFees?.cardFeePct || 0);
    const normalizedCardFeeSurcharge = Number(effectiveComputedFees?.cardFeeSurcharge || 0);
    const hasCardFeeLine = normalizedCardFeeSurcharge > 0;
    const totalConverted =
        typeof effectiveComputedFees?.total === "number"
            ? Number(effectiveComputedFees.total)
            : govSubtotalConverted + mandatorySvcSubtotalConverted + managedSvcSubtotalConverted + optionalSvcSubtotalConverted;
    const computedIndividualPreviewItem = computedItemsById.get(ADDITIONAL_EXECUTIVE_INDIVIDUALS_ID);
    const computedCorporatePreviewItem = computedItemsById.get(ADDITIONAL_EXECUTIVE_CORPORATES_ID);
    const previewIndividualRate = computedIndividualPreviewItem
        ? toNumber(computedIndividualPreviewItem.amount)
        : convertAmount(additionalExecutivePreview.rates.individual);
    const previewCorporateRate = computedCorporatePreviewItem
        ? toNumber(computedCorporatePreviewItem.amount)
        : convertAmount(additionalExecutivePreview.rates.corporate);
    const previewIndividualSubtotal = computedIndividualPreviewItem
        ? Number((
            toNumber(computedIndividualPreviewItem.amount)
            * Math.max(0, Math.floor(toNumber(computedIndividualPreviewItem.quantity || 1)))
        ).toFixed(2))
        : convertAmount(additionalExecutivePreview.individualSubtotal);
    const previewCorporateSubtotal = computedCorporatePreviewItem
        ? Number((
            toNumber(computedCorporatePreviewItem.amount)
            * Math.max(0, Math.floor(toNumber(computedCorporatePreviewItem.quantity || 1)))
        ).toFixed(2))
        : convertAmount(additionalExecutivePreview.corporateSubtotal);
    const previewTotal = Number((previewIndividualSubtotal + previewCorporateSubtotal).toFixed(2));
    const hasAdditionalExecutivePreview =
        additionalExecutivePreview.individualCount > 0 || additionalExecutivePreview.corporateCount > 0;
    return (
        <div className="space-y-4">
            <Card className="hidden border">
                <CardContent className="pt-4">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div className="space-y-3 xl:max-w-md">
                            <div className="space-y-1">
                                <div className="text-sm font-semibold text-foreground">
                                    {t("service.additionalExecutive.autoLabel", "Additional Executive KYC / Due Diligence")}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {t(
                                        "service.additionalExecutive.autoInfo",
                                        "This service is calculated automatically from the current party list. When parties are added, the charge appears in the table and is included in totals."
                                    )}
                                </p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {hasAdditionalExecutivePreview
                                    ? t(
                                        "service.additionalExecutive.previewIncluded",
                                        "Charges are active and included in totals based on the current party setup."
                                    )
                                    : t(
                                        "service.additionalExecutive.previewWaiting",
                                        "Add parties to generate the KYC / due diligence charge."
                                    )}
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[540px]">
                            <div className="rounded-lg border bg-background/80 p-3">
                                <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                                    {t("service.additionalExecutive.individualPreviewLabel", "Individual KYC")}
                                </div>
                                <div className="mt-2 text-sm font-semibold text-foreground">
                                    {formatPrice(previewIndividualSubtotal, selectedCurrency)}
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {t("service.additionalExecutive.individualPreviewInfo", {
                                        count: additionalExecutivePreview.individualCount,
                                        packs: additionalExecutivePreview.individualPacks,
                                        rate: formatPrice(previewIndividualRate, selectedCurrency),
                                        defaultValue: "{{count}} parties • {{packs}} packs • {{rate}} per pack",
                                    })}
                                </p>
                            </div>

                            <div className="rounded-lg border bg-background/80 p-3">
                                <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                                    {t("service.additionalExecutive.corporatePreviewLabel", "Corporate KYC")}
                                </div>
                                <div className="mt-2 text-sm font-semibold text-foreground">
                                    {formatPrice(previewCorporateSubtotal, selectedCurrency)}
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {t("service.additionalExecutive.corporatePreviewInfo", {
                                        count: additionalExecutivePreview.corporateCount,
                                        packs: additionalExecutivePreview.corporatePacks,
                                        rate: formatPrice(previewCorporateRate, selectedCurrency),
                                        defaultValue: "{{count}} parties • {{packs}} packs • {{rate}} per pack",
                                    })}
                                </p>
                            </div>

                            <div className="rounded-lg border bg-background/80 p-3">
                                <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                                    {t("service.additionalExecutive.previewTotalLabel", "Preview Total")}
                                </div>
                                <div className="mt-2 text-sm font-semibold text-foreground">
                                    {formatPrice(previewTotal, selectedCurrency)}
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {hasAdditionalExecutivePreview
                                        ? t(
                                            "service.additionalExecutive.previewHelp",
                                            "Preview is derived from the current party list. Individual and corporate parties are charged separately in packs of two."
                                        )
                                        : t(
                                            "service.additionalExecutive.previewEmpty",
                                            "No parties yet. Add parties first to preview the KYC charge."
                                        )}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

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
                                {/* Government Fees Section */}
                                {govItemsWithFees.length > 0 && (
                                    <>
                                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                                            <TableCell colSpan={4} className="py-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-sm">
                                                        {t("service.sections.government.title", "Government Fees")}
                                                    </span>
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                                        {t("service.sections.government.badge", "Mandatory")}
                                                    </span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                        {govItemsWithFees.map((item: any) => (
                                            <Row key={item.id} item={item} />
                                        ))}
                                        <TableRow className="bg-muted/10 hover:bg-muted/10">
                                            <TableCell colSpan={2} className="text-right text-sm font-semibold text-muted-foreground">
                                                {t("service.sections.subtotal", "Subtotal")}
                                            </TableCell>
                                            <TableCell className="text-right text-sm font-semibold">
                                                {formatPrice(govSubtotalConverted, selectedCurrency)}
                                            </TableCell>
                                            <TableCell />
                                        </TableRow>
                                    </>
                                )}

                                {/* Mandatory Service Fees Section */}
                                {mandatorySvcWithFees.length > 0 && (
                                    <>
                                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                                            <TableCell colSpan={4} className="py-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-sm">
                                                        {t("service.sections.service.title", "Our Service Fees")}
                                                    </span>
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                                        {t("service.sections.service.badge", "Service")}
                                                    </span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                        {mandatorySvcWithFees.map((item: any) => (
                                            <Row key={item.id} item={item} />
                                        ))}
                                    </>
                                )}

                                {/* Optional Add-On Services Section */}
                                {optionalSvcWithFees.length > 0 && (
                                    <>
                                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                                            <TableCell colSpan={4} className="py-2">
                                                <span className="font-semibold text-sm">
                                                    {t("service.sections.optionalAddons.title", "Optional Add-On Services")}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                        {optionalSvcWithFees.map((item: any) => (
                                            <Row key={item.id} item={item} />
                                        ))}
                                    </>
                                )}

                                {/* Service Subtotal (mandatory + optional combined) */}
                                {(mandatorySvcWithFees.length > 0 || optionalSvcWithFees.length > 0) && (
                                    <TableRow className="bg-muted/10 hover:bg-muted/10">
                                        <TableCell colSpan={2} className="text-right text-sm font-semibold text-muted-foreground">
                                            {t("service.sections.subtotal", "Subtotal")}
                                        </TableCell>
                                        <TableCell className="text-right text-sm font-semibold">
                                            {formatPrice(
                                                mandatorySvcSubtotalConverted + managedSvcSubtotalConverted + optionalSvcSubtotalConverted,
                                                selectedCurrency
                                            )}
                                        </TableCell>
                                        <TableCell />
                                    </TableRow>
                                )}

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
                                                {code === "EUR"
                                                    ? "EUR (Euro)"
                                                    : code === "USD"
                                                        ? "USD ($)"
                                                        : code === "HKD"
                                                            ? "HKD (HK$)"
                                                            : code === "EUR"
                                                                ? "EUR (€)"
                                                                : code}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {isConverting && <RefreshCw className="h-4 w-4 animate-spin text-primary" />}
                            </div>
                        </div>

                        {effectiveComputedFees?.exchangeRateUsed
                            && computedFeesSourceCurrency !== selectedCurrency
                            && computedFeesCurrency === selectedCurrency && (
                                <div className="px-3 py-1 bg-primary/10 rounded-md border border-primary/20">
                                    <p className="text-[10px] text-primary font-medium">
                                        1 {computedFeesSourceCurrency} = {effectiveComputedFees.exchangeRateUsed.toFixed(4)} {selectedCurrency}
                                    </p>
                                </div>
                            )}
                    </div>

                    <p className="text-[10px] text-muted-foreground max-w-xs text-center md:text-right">
                        {(t as any)(
                            "service.currencyNote",
                            {
                                defaultValue: "All prices are originally computed in {{currency}}. Conversion rates are updated live.",
                                currency: computedFeesSourceCurrency || selectedCurrency,
                            }
                        )}
                    </p>
                    {effectiveComputedFees?.conversionFallback && (
                        <p className="text-[10px] text-amber-700 max-w-xs text-center md:text-right">
                            {(t as any)(
                                "service.currencyFallbackNote",
                                {
                                    defaultValue: "Live currency conversion is temporarily unavailable. Showing default prices in {{currency}}.",
                                    currency: selectedCurrency,
                                }
                            )}
                        </p>
                    )}
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
