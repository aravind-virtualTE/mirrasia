/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HelpCircle, RefreshCw } from "lucide-react";
import { AppDoc } from "./hkIncorpo";
import { useTranslation } from "react-i18next";
import { convertUsdToHkd } from "@/services/exchangeRate";

const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD" },
  { value: "HKD", label: "HKD" },
];

// ---- Types
interface InvoiceItem {
  id: string;
  description: string;
  originalPrice: string;    // "USD 100.00"
  discountedPrice: string;  // "USD 80.00"
  quantity: number;         // default 1
  totalOriginal?: string;
  totalDiscounted?: string;
  note?: string | null;
  category?: "government" | "service";
  sublabel?: string;
  discountLabel?: string;
}
const parseMoney = (val: string) => {
  if (!val) return 0;
  const cleaned = val.replace(/[^\d.-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
};
const fmt = (n: number) => `USD ${n.toFixed(2)}`;

// ---- Compact row (mobile + desktop), NO SWITCH
const CompactRow: React.FC<{
  item: InvoiceItem;
  info?: React.ReactNode;
  hintOpen?: boolean;
  onToggleHint?: () => void;
}> = ({ item, info, hintOpen = false, onToggleHint }) => {
  const { t } = useTranslation();
  const qty = Math.max(1, item.quantity ?? 1);
  const uo = parseMoney(item.originalPrice);
  const ud = parseMoney(item.discountedPrice);
  const to = parseMoney(item.totalOriginal || "") || uo * qty;
  const td = parseMoney(item.totalDiscounted || "") || ud * qty;
  const isFree = td === 0;

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden py-3 border-b last:border-b-0">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              <p className="font-medium leading-snug truncate">{item.description}</p>
              {info ? (
                <button
                  type="button"
                  onClick={onToggleHint}
                  aria-expanded={hintOpen}
                  aria-label={t("newHk.invoice.aria.moreInfo", "More info")}
                  title={t("newHk.invoice.aria.moreInfo", "More info")}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border text-sky-300 hover:bg-sky-500/10 shrink-0"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>

            {item.sublabel ? (
              <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{item.sublabel}</div>
            ) : null}

            {info && (
              <div className={`mt-1 text-[12px] text-muted-foreground ${hintOpen ? "block" : "hidden"}`}>{info}</div>
            )}

            {item.discountLabel ? (
              <div className="text-[11px] text-green-700 dark:text-green-400 mt-1">{item.discountLabel}</div>
            ) : null}

            <div className="mt-2 grid grid-cols-3 items-end gap-2 text-sm">
              <div className="text-muted-foreground">
                <span className="block text-[11px] uppercase tracking-wide opacity-80">
                  {t("newHk.invoice.compact.qty")}
                </span>
                <span className="font-medium">{qty}</span>
              </div>
              <div className="text-right">
                <span className="block text-[11px] uppercase tracking-wide text-muted-foreground/80">
                  {t("newHk.invoice.compact.original")}
                </span>
                <span className="line-through text-muted-foreground">{fmt(uo)}</span>
              </div>
              <div className="text-right">
                <span className="block text-[11px] uppercase tracking-wide text-muted-foreground/80">
                  {t("newHk.invoice.compact.youPay")}
                </span>
                {isFree ? (
                  <Badge className="rounded-full px-2 py-0.5">{t("newHk.invoice.compact.free")}</Badge>
                ) : (
                  <span className="font-semibold">{fmt(ud)}</span>
                )}
              </div>
            </div>

            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t("newHk.invoice.compact.lineTotal")}</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xs line-through text-muted-foreground">{fmt(to)}</span>
                <span className="font-semibold">{isFree ? fmt(0) : fmt(td)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop */}
      <TableRow className="hidden md:table-row hover:bg-muted/30">
        <TableCell className="py-2 align-top">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium leading-tight">{item.description}</span>
                {info ? (
                  <button
                    type="button"
                    onClick={onToggleHint}
                    aria-expanded={hintOpen}
                    aria-label={t("newHk.invoice.aria.moreInfo", "More info")}
                    title={t("newHk.invoice.aria.moreInfo", "More info")}
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border text-sky-300 hover:bg-sky-500/10"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
              {item.sublabel ? <div className="text-xs text-muted-foreground">{item.sublabel}</div> : null}
              {info ? (
                <div className={`mt-1 text-[12px] text-muted-foreground ${hintOpen ? "block" : "hidden"}`}>{info}</div>
              ) : null}
              {item.discountLabel ? (
                <div className="text-[11px] text-green-700 dark:text-green-400">{item.discountLabel}</div>
              ) : null}
            </div>
          </div>
        </TableCell>
        <TableCell className="py-2 text-right align-top">{qty}</TableCell>
        <TableCell className="py-2 text-right align-top">
          <span className="line-through text-muted-foreground">{item.originalPrice}</span>
        </TableCell>
        <TableCell className="py-2 text-right align-top">
          {isFree ? <Badge className="rounded-full">{t("newHk.invoice.compact.free")}</Badge> : <span className="font-semibold">{item.discountedPrice}</span>}
        </TableCell>
        <TableCell className="py-2 text-right align-top">
          <div className="flex flex-col items-end">
            <span className="text-xs line-through text-muted-foreground">{item.totalOriginal || item.originalPrice}</span>
            <span className="text-sm font-semibold">{item.totalDiscounted || item.discountedPrice}</span>
          </div>
        </TableCell>
      </TableRow>
    </>
  );
};

const SectionCard: React.FC<{
  title: string;
  badge?: string;
  description?: string;
  subtotal?: number;
  children: React.ReactNode;
}> = ({ title, badge, description, subtotal, children }) => {
  const { t } = useTranslation();
  return (
    <Card className="border bg-background">
      <CardHeader className="py-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base md:text-lg">{title}</CardTitle>
          <div className="flex items-center gap-2">
            {typeof subtotal === "number" && (
              <div className="hidden md:flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">{t("newHk.invoice.common.subtotal", "Subtotal")}</span>
                <span className="font-semibold">{fmt(subtotal)}</span>
              </div>
            )}
            {badge ? <Badge variant="secondary" className="whitespace-nowrap">{badge}</Badge> : null}
          </div>
        </div>
        {description ? <p className="mt-1 text-[12px] text-muted-foreground">{description}</p> : null}
      </CardHeader>
      <CardContent className="pt-2">{children}</CardContent>
    </Card>
  );
};

// Fees config (unchanged numbers; labels/info will be translated at render)
const feesConfig = {
  government: [
    { id: "cr_fee", label: "HK Company Incorporation Government Fee to Companies Registry", original: 221, amount: 221, mandatory: true, info: undefined },
    { id: "br_fee", label: "Business Registration (government) fee", original: 283, amount: 283, mandatory: true, info: undefined }
  ],
  service: [
    { id: "inc_service", label: "Hong Kong Company Incorporation — service fee (discounted)", original: 219, amount: 0, mandatory: true, info: undefined },
    { id: "sec_annual", label: "Company Secretary Annual Service Charge", original: 450, amount: 225, mandatory: true, info: undefined },
    { id: "kyc", label: "KYC / Due Diligence fee (1st year)", original: 65, amount: 0, mandatory: true, info: undefined },
    { id: "reg_office", label: "Registered Office Address (annual, optional)", original: 322, amount: 161, mandatory: false, info: undefined },
    { id: "bank_arr", label: "Bank/EMI Account Opening Arrangement (optional)", original: 400, amount: 400, mandatory: false, info: undefined },
    { id: "kit", label: "Company Kit Producing cost (optional)", original: 70, amount: 70, mandatory: false, info: undefined },
    { id: "corr_addr", label: "Correspondence Address Annual Service (optional)", original: 65, amount: 65, mandatory: false, info: undefined }
  ]
};

// ---- Main (builds from feesConfig + app)
export default function InvoicePreview({ app, setForm }: { app: AppDoc; setForm?: (fn: (prev: any) => any) => void }) {
  const { t } = useTranslation();

  // Currency state
  const [selectedCurrency, setSelectedCurrency] = React.useState<string>(
    (app.form as any).paymentCurrency || "USD"
  );
  const [convertedAmount, setConvertedAmount] = React.useState<number | null>(null);
  const [exchangeRate, setExchangeRate] = React.useState<number | null>(null);
  const [isConverting, setIsConverting] = React.useState(false);

  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency);
  };

  // Format amount based on selected currency
  const fmtCurrency = (n: number) => {
    if (selectedCurrency === "HKD" && exchangeRate !== null) {
      const converted = n * exchangeRate;
      return `HKD ${converted.toFixed(2)}`;
    }
    return `USD ${n.toFixed(2)}`;
  };

  // Info copy by item id (translated)
  const infoById: Record<string, React.ReactNode> = {
    cr_fee: t("newHk.invoice.info.cr_fee"),
    br_fee: t("newHk.invoice.info.br_fee"),
    inc_service: t("newHk.invoice.info.inc_service"),
    sec_annual: t("newHk.invoice.info.sec_annual"),
    kyc: t("newHk.invoice.info.kyc"),
    reg_office: t("newHk.invoice.info.reg_office"),
    bank_arr: t("newHk.invoice.info.bank_arr"),
    kit: t("newHk.invoice.info.kit"),
    corr_addr: t("newHk.invoice.info.corr_addr"),
  };

  const selectedOptionals = new Set(app.optionalFeeIds || []);

  // ---------- EXTRA KYC ITEMS BASED ON SHAREHOLDERS ----------

  // defensive: ensure parties is an array
  const parties = Array.isArray((app as any).parties) ? (app as any).parties : [];

  // count shareholders = parties with > 0 shares
  const shareholders = parties.filter((p: any) => {
    const shares = Number(p?.shares ?? 0);
    return shares > 0;
  });

  const legalPersonCount = shareholders.filter((p: any) => p?.isCorp === true).length;
  const individualCount = shareholders.length - legalPersonCount;

  // build dynamic KYC fee lines (service category)
  const extraKycItems: {
    id: string;
    label: string;
    original: number;
    amount: number;
    mandatory: boolean;
    info?: string;
  }[] = [];

  // 1) Legal person KYC (130 each)
  for (let i = 0; i < legalPersonCount; i++) {
    extraKycItems.push({
      id: `kyc_legal_${i + 1}`,
      label: "KYC / Due Diligence fee (Legal Person)",
      original: 130,
      amount: 130,
      mandatory: true,
      info:
        "KYC for corporate shareholders (legal persons). Includes company documents, registers and UBO/KYC checks.",
    });
  }

  // 2) Additional individual KYC beyond 2 individuals included
  if (individualCount > 2) {
    const peopleNeedingKyc = individualCount - 2;
    const kycSlots = Math.ceil(peopleNeedingKyc / 2); // 1 slot = up to 2 people

    for (let i = 0; i < kycSlots; i++) {
      extraKycItems.push({
        id: `kyc_extra_${i + 1}`,
        label: "KYC / Due Diligence fee (Additional individuals)",
        original: 65,
        amount: 65,
        mandatory: true,
        info:
          "Additional KYC checks for individual shareholders/directors beyond the two already included in the package.",
      });
    }
  }

  // ---------- BUILD INVOICE ITEMS (GOV + SERVICE + EXTRA KYC) ----------

  const toItems = (category: "government" | "service") => {
    const baseList =
      category === "government"
        ? feesConfig.government
        : [...feesConfig.service, ...extraKycItems];

    return baseList
      .filter((it) => it.mandatory || selectedOptionals.has(it.id))
      .map((it) => {
        const original = Number(it.original ?? it.amount ?? 0);
        const discounted = Number(it.amount ?? 0);
        const discountLabel =
          it.original && it.original > it.amount
            ? t("newHk.fees.discountApplied", "Discount applied (−{{pct}}%)", {
              pct: (((it.original - it.amount) / it.original) * 100).toFixed(0),
            })
            : undefined;

        const itemKey = `newHk.fees.items.${it.id}`;
        const translatedLabel = t(`${itemKey}.label`, it.label);
        const translatedInfo = t(`${itemKey}.info`, it.info || "");

        return {
          id: it.id,
          description: translatedLabel,
          originalPrice: fmtCurrency(original),
          discountedPrice: fmtCurrency(discounted),
          quantity: 1,
          totalOriginal: fmtCurrency(original),
          totalDiscounted: fmtCurrency(discounted),
          category,
          sublabel: translatedInfo || (infoById[it.id] as string | undefined),
          discountLabel,
        } as InvoiceItem;
      });
  };

  const govItems = React.useMemo(
    () => toItems("government"),
    // government items depend only on optionals + t (no KYC extras there)
    [app.optionalFeeIds, t]
  );

  const svcItems = React.useMemo(
    () => toItems("service"),
    // service items depend on optionals + t + parties (for extra KYC rows)
    [app.optionalFeeIds, t, app.parties]
  );

  // Totals
  const sum = (items: InvoiceItem[]) =>
    items.reduce(
      (acc, it) => {
        const qty = Math.max(1, it.quantity ?? 1);
        const to = parseMoney(it.totalOriginal || "") || parseMoney(it.originalPrice) * qty;
        const td = parseMoney(it.totalDiscounted || "") || parseMoney(it.discountedPrice) * qty;
        return { original: acc.original + to, discounted: acc.discounted + td };
      },
      { original: 0, discounted: 0 }
    );

  const gov = sum(govItems);
  const svc = sum(svcItems);
  const grand = { original: gov.original + svc.original, discounted: gov.discounted + svc.discounted };

  // Currency conversion effect
  React.useEffect(() => {
    const convertAmount = async () => {
      if (selectedCurrency === "HKD") {
        setIsConverting(true);
        try {
          const { hkdAmount, rate } = await convertUsdToHkd(grand.discounted);
          setConvertedAmount(hkdAmount);
          setExchangeRate(rate);
          // Persist to formData
          if (setForm) {
            setForm((prev: any) => ({
              ...prev,
              form: {
                ...prev.form,
                paymentCurrency: "HKD",
                exchangeRateUsed: rate,
                originalAmountUsd: grand.discounted,
                amount: hkdAmount,
              },
            }));
          }
        } catch (err) {
          console.error("Exchange rate fetch failed:", err);
        } finally {
          setIsConverting(false);
        }
      } else {
        setConvertedAmount(null);
        setExchangeRate(null);
        if (setForm) {
          setForm((prev: any) => ({
            ...prev,
            form: {
              ...prev.form,
              paymentCurrency: "USD",
              exchangeRateUsed: undefined,
              originalAmountUsd: undefined,
              amount: grand.discounted,
            },
          }));
        }
      }
    };

    convertAmount();
  }, [selectedCurrency, grand.discounted, setForm]);

  // Display grand total
  const displayGrandTotal = selectedCurrency === "HKD" && convertedAmount !== null
    ? convertedAmount
    : grand.discounted;

  const [hintOpen, setHintOpen] = React.useState<Record<string, boolean>>({});
  const toggleHint = (key: string) => setHintOpen((s) => ({ ...s, [key]: !s[key] }));

  return (
    <div className="w-full mx-auto max-width space-y-4 md:space-y-6">
      {/* Header */}
      <Card className="border bg-background">
        <CardHeader className="py-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <CardTitle className="text-base md:text-xl tracking-tight">
              MIRR ASIA BUSINESS ADVISORY & SECRETARIAL COMPANY LIMITED
            </CardTitle>
            <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
              <span className="text-sm">Payment Currency:</span>
              <Select value={selectedCurrency} onValueChange={handleCurrencyChange}>
                <SelectTrigger className="w-[100px] h-8">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isConverting && <RefreshCw className="h-4 w-4 animate-spin" />}
            </div>
          </div>
          {selectedCurrency === "HKD" && exchangeRate && (
            <p className="text-xs text-muted-foreground mt-1">
              Exchange rate: 1 USD = {exchangeRate.toFixed(4)} HKD
            </p>
          )}
        </CardHeader>
      </Card>

      {/* Government Fees */}
      <SectionCard
        title={t("newHk.invoice.sections.government.title")}
        badge={t("newHk.invoice.sections.government.badge")}
        subtotal={gov.discounted}
        description={t("newHk.invoice.sections.government.description")}
      >
        {/* Mobile */}
        <div className="md:hidden">
          {govItems.map((item) => {
            const key = `gov-${item.id}`;
            return (
              <CompactRow
                key={key}
                item={item}
                info={infoById[item.id]}
                hintOpen={!!hintOpen[key]}
                onToggleHint={() => toggleHint(key)}
              />
            );
          })}
        </div>

        {/* Desktop */}
        <div className="hidden md:block rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[46%] py-2">
                  {t("newHk.invoice.table.headers.serviceDescription")}
                </TableHead>
                <TableHead className="text-right py-2">
                  {t("newHk.invoice.table.headers.qty")}
                </TableHead>
                <TableHead className="text-right py-2">
                  {t("newHk.invoice.table.headers.original")}
                </TableHead>
                <TableHead className="text-right py-2">
                  {t("newHk.invoice.table.headers.amount")}
                </TableHead>
                <TableHead className="text-right py-2">
                  {t("newHk.invoice.table.headers.total")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {govItems.map((item) => {
                const key = `gov-${item.id}`;
                return (
                  <CompactRow
                    key={key}
                    item={item}
                    info={infoById[item.id]}
                    hintOpen={!!hintOpen[key]}
                    onToggleHint={() => toggleHint(key)}
                  />
                );
              })}
              <TableRow className="bg-muted/20">
                <TableCell className="py-2 font-medium">
                  {t("newHk.invoice.sections.government.subtotal")}
                </TableCell>
                <TableCell className="py-2" />
                <TableCell className="py-2" />
                <TableCell className="py-2" />
                <TableCell className="py-2 text-right font-semibold">
                  {fmt(gov.discounted)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </SectionCard>

      {/* Our Service Fees (mandatory + selected optionals + extra KYC) */}
      <SectionCard
        title={t("newHk.invoice.sections.service.title")}
        badge={t("newHk.invoice.sections.service.badge")}
        subtotal={svc.discounted}
        description={t("newHk.invoice.sections.service.description")}
      >
        {/* Mobile */}
        <div className="md:hidden">
          {svcItems.map((item) => {
            const key = `svc-${item.id}`;
            return (
              <CompactRow
                key={key}
                item={item}
                info={infoById[item.id]}
                hintOpen={!!hintOpen[key]}
                onToggleHint={() => toggleHint(key)}
              />
            );
          })}
        </div>

        {/* Desktop */}
        <div className="hidden md:block rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[46%] py-2">
                  {t("newHk.invoice.table.headers.serviceDescription")}
                </TableHead>
                <TableHead className="text-right py-2">
                  {t("newHk.invoice.table.headers.qty")}
                </TableHead>
                <TableHead className="text-right py-2">
                  {t("newHk.invoice.table.headers.original")}
                </TableHead>
                <TableHead className="text-right py-2">
                  {t("newHk.invoice.table.headers.amount")}
                </TableHead>
                <TableHead className="text-right py-2">
                  {t("newHk.invoice.table.headers.total")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {svcItems.map((item) => {
                const key = `svc-${item.id}`;
                return (
                  <CompactRow
                    key={key}
                    item={item}
                    info={infoById[item.id]}
                    hintOpen={!!hintOpen[key]}
                    onToggleHint={() => toggleHint(key)}
                  />
                );
              })}
              <TableRow>
                <TableCell className="py-2 text-muted-foreground">
                  {t("newHk.invoice.sections.service.subtotal")}
                </TableCell>
                <TableCell className="py-2" />
                <TableCell className="py-2" />
                <TableCell className="py-2" />
                <TableCell className="py-2 text-right font-semibold">
                  {fmtCurrency(svc.discounted)}
                </TableCell>
              </TableRow>
              <TableRow className="bg-muted/20">
                <TableCell className="py-2 font-semibold text-base">
                  {t("newHk.invoice.sections.grandTotal")}
                </TableCell>
                <TableCell className="py-2" />
                <TableCell className="py-2" />
                <TableCell className="py-2" />
                <TableCell className="py-2 text-right font-bold text-base">
                  {fmtCurrency(grand.discounted)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Mobile totals */}
        <div className="md:hidden mt-2 grid gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              {t("newHk.invoice.sections.government.subtotal")}
            </span>
            <span className="font-semibold">{fmt(gov.discounted)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              {t("newHk.invoice.sections.service.subtotal")}
            </span>
            <span className="font-semibold">{fmt(svc.discounted)}</span>
          </div>
          <div className="flex items-center justify-between text-base">
            <span className="font-medium">
              {t("newHk.invoice.sections.grandTotal")}
            </span>
            <span className="font-bold">{fmtCurrency(grand.discounted)}</span>
          </div>
        </div>

        <p className="mt-3 text[11px] text-muted-foreground">
          {t("newHk.invoice.footnote")}
        </p>
      </SectionCard>

      {/* Surcharge (if card) */}
      <Card>
        <CardContent className="pt-4 text-sm">
          <div className="flex items-center justify-end gap-6 flex-wrap">
            <div className="text-right">
              <div className="text-base font-bold">
                {t("newHk.invoice.surcharge.cardFee")}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



// function InvoicePreview({ app }: { app: AppDoc }) {
//   const grand = computeGrandTotal(app);
//   const chosenGov = feesConfig.government; // always mandatory
//   const chosenSvc = feesConfig.service.filter((x) => x.mandatory || app.optionalFeeIds.includes(x.id));

//   const TableMini = ({ list }: { list: any[] }) => (
//     <Table>
//       <TableBody>
//         {list.map((x) => (
//           <TableRow key={x.id}>
//             <TableCell className="font-medium">{x.label}</TableCell>
//             <TableCell className="w-36">USD {x.amount.toFixed(2)}</TableCell>
//           </TableRow>
//         ))}
//       </TableBody>
//     </Table>
//   );

//   return (
//     <div className="grid gap-3">
//       <Card>
//         <CardContent className="pt-6">
//           <h1 className="font-bold">MIRR ASIA BUSINESS ADVISORY & SECRETARIAL COMPANY LIMITED</h1>
//           <div className="mt-4 font-bold">Government Fees</div>
//           <TableMini list={chosenGov} />
//           <div className="mt-4 font-bold">Our Service Fees</div>
//           <TableMini list={chosenSvc} />
//           <div className="text-right mt-3 text-base font-bold">Grand Total: USD {grand.toFixed(2)}</div>
//           <div className="text-xs text-muted-foreground mt-1">
//             Prices are in USD for convenience. Government fees may change based on official notices.
//           </div>
//           {app.form.payMethod === "card" && (
//             <div className="text-xs text-muted-foreground mt-2">Includes 3.5% card processing surcharge.</div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }