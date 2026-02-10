/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getExchangeRate } from "@/services/exchangeRate";
import { RefreshCw } from "lucide-react";

const BASE_SETUP_CORP = 3000;
const PRICE_NS = 1300;
const PRICE_EMI = 400;
const PRICE_BANK = 2000;
const PRICE_CBI = 3880;
const PRICE_RECORD_STORAGE = 350;

const ND_PRICES: Record<number, number> = {
    0: 0,
    1: 1200,
    2: 1700,
    3: 2200,
};

type PanamaServiceSetupWidgetProps = {
    data: Record<string, any>;
    onChange: (data: Record<string, any>) => void;
};

const round2 = (value: number) => Number((value || 0).toFixed(2));

const toCurrency = (amount: number, currency: string) => (
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency.toUpperCase(),
    }).format(round2(amount))
);

export function PanamaServiceSetupWidget({ data, onChange }: PanamaServiceSetupWidgetProps) {
    const { t } = useTranslation();
    const isLocked = data.paymentStatus === "paid";
    const selectedCurrency = String(data.paymentCurrency || data.stripeCurrency || "USD").toUpperCase();
    const useMirrStorage = Boolean(data.recordStorageUseMirr);
    const [isConverting, setIsConverting] = useState(false);
    const [displayRate, setDisplayRate] = useState<number>(
        Number(data.pa_exchangeRate || (selectedCurrency === "HKD" ? 7.8 : 1)) || 1
    );

    const mergeData = (patch: Record<string, any>) => onChange({ ...data, ...patch });

    useEffect(() => {
        const defaults: Record<string, any> = {};
        if (data.pa_ndSetup === undefined) defaults.pa_ndSetup = "0";
        if (data.pa_nsSetup === undefined) defaults.pa_nsSetup = false;
        if (data.pa_optEmi === undefined) defaults.pa_optEmi = false;
        if (data.pa_optBank === undefined) defaults.pa_optBank = false;
        if (data.pa_optCbi === undefined) defaults.pa_optCbi = false;
        if (!data.paymentCurrency && !data.stripeCurrency) {
            defaults.paymentCurrency = "USD";
            defaults.stripeCurrency = "USD";
        }
        if (Object.keys(defaults).length > 0) mergeData(defaults);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        let cancelled = false;
        const syncRate = async () => {
            if (selectedCurrency !== "HKD") {
                setDisplayRate(1);
                setIsConverting(false);
                return;
            }
            setIsConverting(true);
            try {
                const rate = await getExchangeRate("USD", "HKD");
                if (cancelled) return;
                const nextRate = Number(rate || 1);
                setDisplayRate(nextRate);
                const patch: Record<string, any> = {};
                if (Number(data.pa_exchangeRate || 0) !== nextRate) patch.pa_exchangeRate = nextRate;
                if (data.pa_exchangeBase !== "USD") patch.pa_exchangeBase = "USD";
                if (data.pa_exchangeQuote !== "HKD") patch.pa_exchangeQuote = "HKD";
                if (Object.keys(patch).length > 0) mergeData(patch);
            } catch {
                if (cancelled) return;
                setDisplayRate(Number(data.pa_exchangeRate || 7.8) || 7.8);
            } finally {
                if (!cancelled) setIsConverting(false);
            }
        };
        syncRate();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCurrency]);

    const ndSetup = Number(data.pa_ndSetup || 0) as 0 | 1 | 2 | 3;
    const nsSetup = Boolean(data.pa_nsSetup);
    const optEmi = Boolean(data.pa_optEmi);
    const optBank = Boolean(data.pa_optBank);
    const optCbi = Boolean(data.pa_optCbi);

    const totalUsd = useMemo(() => {
        return BASE_SETUP_CORP
            + ND_PRICES[ndSetup]
            + (nsSetup ? PRICE_NS : 0)
            + (optEmi ? PRICE_EMI : 0)
            + (optBank ? PRICE_BANK : 0)
            + (optCbi ? PRICE_CBI : 0)
            + (useMirrStorage ? PRICE_RECORD_STORAGE : 0);
    }, [ndSetup, nsSetup, optEmi, optBank, optCbi, useMirrStorage]);

    const toDisplayAmount = (usdAmount: number) => (
        selectedCurrency === "HKD" ? round2(usdAmount * displayRate) : round2(usdAmount)
    );

    const formatAmount = (usdAmount: number) => toCurrency(toDisplayAmount(usdAmount), selectedCurrency);

    const setField = (key: string, value: any) => {
        if (isLocked) return;
        mergeData({ [key]: value });
    };

    const handleCurrencyChange = (currency: string) => {
        if (isLocked) return;
        const next = String(currency || "USD").toUpperCase();
        const patch: Record<string, any> = {
            paymentCurrency: next,
            stripeCurrency: next,
        };
        if (next === "USD") {
            patch.pa_exchangeRate = 1;
            patch.pa_exchangeBase = "USD";
            patch.pa_exchangeQuote = "USD";
        } else {
            patch.pa_exchangeRate = Number(data.pa_exchangeRate || 7.8);
            patch.pa_exchangeBase = "USD";
            patch.pa_exchangeQuote = "HKD";
            setIsConverting(true);
        }
        mergeData(patch);
    };

    return (
        <div className="space-y-4">
            {isLocked && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                    {t("panama.quoteSetup.lockedMessage")}
                </div>
            )}

            <Card className="border">
                <CardContent className="space-y-3 pt-4">
                    <div className="flex items-center justify-between border-b pb-2">
                        <div className="text-sm font-medium">
                            {t("panama.quoteSetup.base.label", "Panama Incorporation Base Setup")}
                            <span className="ml-1 text-xs text-muted-foreground">
                                {t("panama.quoteSetup.base.note", "(includes government fees, Resident Agent, Registered Office)")}
                            </span>
                        </div>
                        <div className="text-sm font-semibold">{formatAmount(BASE_SETUP_CORP)}</div>
                    </div>

                    <div className="grid gap-2 md:grid-cols-[1fr_240px] md:items-center">
                        <Label className="text-sm">{t("panama.quoteSetup.ndSetup.label")}</Label>
                        <Select
                            value={String(data.pa_ndSetup ?? "0")}
                            onValueChange={(v) => setField("pa_ndSetup", v)}
                            disabled={isLocked}
                        >
                            <SelectTrigger className="h-9">
                                <SelectValue placeholder={t("panama.quoteSetup.ndSetup.placeholder", "Select")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">{t("panama.quoteSetup.ndSetup.options.0")}</SelectItem>
                                <SelectItem value="1">{t("panama.quoteSetup.ndSetup.options.1", { price: formatAmount(ND_PRICES[1]) })}</SelectItem>
                                <SelectItem value="2">{t("panama.quoteSetup.ndSetup.options.2", { price: formatAmount(ND_PRICES[2]) })}</SelectItem>
                                <SelectItem value="3">{t("panama.quoteSetup.ndSetup.options.3", { price: formatAmount(ND_PRICES[3]) })}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {String(data.pa_ndSetup || "0") === "3" && (
                        <div className="space-y-1">
                            <Label className="text-sm">{t("panama.quoteSetup.nd3Reason.label")}</Label>
                            <Textarea
                                rows={3}
                                value={String(data.pa_nd3ReasonSetup || "")}
                                onChange={(e) => setField("pa_nd3ReasonSetup", e.target.value)}
                                disabled={isLocked}
                                placeholder={t("panama.quoteSetup.nd3Reason.placeholder", "")}
                            />
                            <p className="text-[11px] text-muted-foreground">
                                {t("panama.quoteSetup.nd3Reason.hint", "")}
                            </p>
                        </div>
                    )}

                    <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-sm">
                                <Checkbox checked={nsSetup} onCheckedChange={(v) => setField("pa_nsSetup", v === true)} disabled={isLocked} />
                                <span>{t("panama.quoteSetup.nsSetup.label", { price: formatAmount(PRICE_NS) })}</span>
                            </label>
                            <span className="text-sm font-semibold">{formatAmount(PRICE_NS)}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-sm">
                                <Checkbox checked={optEmi} onCheckedChange={(v) => setField("pa_optEmi", v === true)} disabled={isLocked} />
                                <span>{t("panama.quoteSetup.optional.emi", { price: formatAmount(PRICE_EMI) })}</span>
                            </label>
                            <span className="text-sm font-semibold">{formatAmount(PRICE_EMI)}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-sm">
                                <Checkbox checked={optBank} onCheckedChange={(v) => setField("pa_optBank", v === true)} disabled={isLocked} />
                                <span>{t("panama.quoteSetup.optional.bank", { price: formatAmount(PRICE_BANK) })}</span>
                            </label>
                            <span className="text-sm font-semibold">{formatAmount(PRICE_BANK)}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-sm">
                                <Checkbox checked={optCbi} onCheckedChange={(v) => setField("pa_optCbi", v === true)} disabled={isLocked} />
                                <span>{t("panama.quoteSetup.optional.cbi", { price: formatAmount(PRICE_CBI) })}</span>
                            </label>
                            <span className="text-sm font-semibold">{formatAmount(PRICE_CBI)}</span>
                        </div>
                    </div>

                    {useMirrStorage && (
                        <div className="flex items-center justify-between border-t pt-2">
                            <span className="text-sm">{t("ppif.invoice.setup.storage.label", "Record Storage (Mirr)")}</span>
                            <span className="text-sm font-semibold">{formatAmount(PRICE_RECORD_STORAGE)}</span>
                        </div>
                    )}

                    <div className="mt-2 rounded-lg bg-primary/10 p-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{t("panama.quoteSetup.totals.setupY1")}</span>
                            <span className="text-sm font-bold">{toCurrency(toDisplayAmount(totalUsd), selectedCurrency)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

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

                        {selectedCurrency === "HKD" && (
                            <div className="px-3 py-1 bg-primary/10 rounded-md border border-primary/20">
                                <p className="text-[10px] text-primary font-medium">
                                    1 USD = {displayRate.toFixed(4)} HKD
                                </p>
                            </div>
                        )}
                    </div>

                    <p className="text-[10px] text-muted-foreground max-w-xs text-center md:text-right">
                        {t("service.currencyNote", "All prices are originally computed in USD. Conversion rates are updated live.")}
                    </p>
                </CardContent>
            </Card>

            <Card className="border">
                <CardContent className="pt-4 text-xs">
                    <div className="mb-2 font-semibold">{t("panama.quoteSetup.includes.title")}</div>
                    <ol className="list-decimal space-y-1 pl-5">
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
                </CardContent>
            </Card>
        </div>
    );
}
