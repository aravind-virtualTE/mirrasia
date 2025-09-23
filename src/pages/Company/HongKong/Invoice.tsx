import React, { useMemo, useState } from "react";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { companyIncorporateInvoiceAtom } from "@/services/state";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { HelpCircle } from "lucide-react";

// ==== Types ====
interface InvoiceItem {
  description: string;
  originalPrice: string;
  discountedPrice: string;
  quantity: number;
  totalOriginal: string;
  totalDiscounted: string;
  note: string | null;

  category?: "government" | "service";
  optional?: boolean;
  free?: boolean;
  sublabel?: string;
  discountLabel?: string;
}
interface ShareholderCount { legalPerson: number; individual: number; }
interface InvoiceTotals { original: string; discounted: string; }
interface InvoiceMetadata { generatedAt: string; correspondenceCount?: number; }
export interface InvoiceData {
  items: InvoiceItem[];
  totals: InvoiceTotals;
  customer: { shareholderCount: ShareholderCount };
  metadata: InvoiceMetadata;
}

// ==== Utils ====
const parseMoney = (val: string) => {
  if (!val) return 0;
  const cleaned = val.replace(/[^\d.-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
};
const fmt = (n: number) => `USD ${n.toFixed(2)}`;
const isFreeLike = (item: InvoiceItem) =>
  item.free || parseMoney(item.discountedPrice) === 0 || parseMoney(item.totalDiscounted) === 0;

// ==== Compact Row (responsive) ====
const CompactRow: React.FC<{
  item: InvoiceItem;
  info?: React.ReactNode;
  hintOpen?: boolean;
  onToggleHint?: () => void;
  enabled?: boolean;
  onToggle?: (v: boolean) => void;
  showToggle?: boolean;
}> = ({ item, info, hintOpen = false, onToggleHint, enabled = true, onToggle, showToggle = false }) => {
  const qty = Math.max(1, item.quantity ?? 1);
  const uo = parseMoney(item.originalPrice);
  const ud = parseMoney(item.discountedPrice);
  const to = parseMoney(item.totalOriginal) || uo * qty;
  const td = parseMoney(item.totalDiscounted) || ud * qty;
  const free = isFreeLike(item);

  // MOBILE (≤ md): card-like row
  return (
    <>
      {/* Mobile layout */}
      <div className={`md:hidden py-3 border-b last:border-b-0 ${!enabled ? "opacity-60" : ""}`}>
        <div className="flex items-start gap-2">
          {showToggle ? (
            <div className="pt-0.5">
              <Switch checked={enabled} onCheckedChange={onToggle} aria-label="Toggle optional service" />
            </div>
          ) : null}

          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              <p className="font-medium leading-snug truncate">{item.description}</p>
              {info ? (
                <button
                  type="button"
                  onClick={onToggleHint}
                  aria-expanded={hintOpen}
                  aria-label="More info"
                  title="More info"
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

            {/* prices grid */}
            <div className="mt-2 grid grid-cols-3 items-end gap-2 text-sm">
              <div className="text-muted-foreground">
                <span className="block text-[11px] uppercase tracking-wide opacity-80">Qty</span>
                <span className="font-medium">{qty}</span>
              </div>
              <div className="text-right">
                <span className="block text-[11px] uppercase tracking-wide text-muted-foreground/80">Original</span>
                <span className="line-through text-muted-foreground">{fmt(uo)}</span>
              </div>
              <div className="text-right">
                <span className="block text-[11px] uppercase tracking-wide text-muted-foreground/80">You pay</span>
                {free ? <Badge className="rounded-full px-2 py-0.5">FREE</Badge> : <span className="font-semibold">{fmt(ud)}</span>}
              </div>
            </div>

            {/* line total */}
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Line total</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xs line-through text-muted-foreground">{fmt(to)}</span>
                <span className="font-semibold">{free ? fmt(0) : fmt(td)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop (md+) table row */}
      <TableRow className={`hidden md:table-row ${!enabled ? "opacity-60" : ""} hover:bg-muted/30`}>
        <TableCell className="py-2 align-top">
          <div className="flex items-start gap-2">
            {showToggle ? (
              <div className="pt-0.5">
                <Switch checked={enabled} onCheckedChange={onToggle} aria-label="Toggle optional service" />
              </div>
            ) : null}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium leading-tight">{item.description}</span>
                {info ? (
                  <button
                    type="button"
                    onClick={onToggleHint}
                    aria-expanded={hintOpen}
                    aria-label="More info"
                    title="More info"
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border text-sky-300 hover:bg-sky-500/10"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
              {item.sublabel ? (
                <div className="text-xs text-muted-foreground">{item.sublabel}</div>
              ) : null}
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
          <span className="line-through text-muted-foreground">{fmt(uo)}</span>
        </TableCell>
        <TableCell className="py-2 text-right align-top">
          {free ? <Badge className="rounded-full">FREE</Badge> : <span className="font-semibold">{fmt(ud)}</span>}
        </TableCell>
        <TableCell className="py-2 text-right align-top">
          <div className="flex flex-col items-end">
            <span className="text-xs line-through text-muted-foreground">{fmt(to)}</span>
            <span className="text-sm font-semibold">{free ? fmt(0) : fmt(td)}</span>
          </div>
        </TableCell>
      </TableRow>
    </>
  );
};

// ==== Section card (compact paddings) ====
const SectionCard: React.FC<{
  title: string;
  badge?: string;
  description?: string;
  subtotal?: number;
  children: React.ReactNode;
}> = ({ title, badge, description, subtotal, children }) => (
  <Card className="border bg-background">
    <CardHeader className="py-2">
      <div className="flex items-center justify-between gap-2">
        <CardTitle className="text-base md:text-lg">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {typeof subtotal === "number" && (
            <div className="hidden md:flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Subtotal</span>
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

// ==== Main (compact + responsive) ====
const StackedInvoice: React.FC<{ data: InvoiceData }> = ({ data }) => {
  const { t } = useTranslation();

  // Info copy (same as before)
  const infoByDesc: Record<string, React.ReactNode> = {
    "Hong Kong Company Incorporation": t(
      "invoice.info.incorpService",
      "Preparation of incorporation documents, name check, filing and liaison with the Companies Registry until the company is formed."
    ),
    "Hong Kong Company Incorporation Government Fee to Companies Registry": t(
      "invoice.info.incorpGov",
      "Mandatory filing fee to the Companies Registry when establishing a new company."
    ),
    "Business Registration (government) fee": t(
      "invoice.info.br",
      "Annual Business Registration fee payable to the Inland Revenue Department (valid for 1 year)."
    ),
    "Company Secretary Annual Service Charge": t(
      "invoice.info.cs",
      "Statutory requirement. We act as your company secretary: maintain registers, prepare & file annual returns, and manage routine filings/notices."
    ),
    "KYC / Due Diligence fee": t(
      "invoice.info.kyc",
      "Mandatory KYC/AML checks for shareholders and directors in line with regulations and our compliance obligations."
    ),
  };

  const govItems = data.items.filter((i) => i.description.toLowerCase().includes("government"));
  const svcItems = data.items.filter((i) => !i.description.toLowerCase().includes("government"));

  const [hintOpen, setHintOpen] = useState<Record<string, boolean>>({});
  const toggleHint = (key: string) => setHintOpen((s) => ({ ...s, [key]: !s[key] }));

  const [enabled, setEnabled] = useState<Record<number, boolean>>(() => {
    const map: Record<number, boolean> = {};
    svcItems.forEach((it, idx) => (map[idx] = it.optional ? false : true));
    return map;
  });

  const totals = useMemo(() => {
    const calc = (items: InvoiceItem[], enabledFilter?: (i: number) => boolean) => {
      let original = 0;
      let discounted = 0;
      items.forEach((it, idx) => {
        if (enabledFilter && !enabledFilter(idx)) return;
        const qty = Math.max(1, it.quantity ?? 1);
        const uo = parseMoney(it.originalPrice);
        const ud = parseMoney(it.discountedPrice);
        const to = parseMoney(it.totalOriginal) || uo * qty;
        const td = parseMoney(it.totalDiscounted) || ud * qty;
        original += to;
        discounted += isFreeLike(it) ? 0 : td;
      });
      return { original, discounted, savings: Math.max(original - discounted, 0) };
    };

    const gov = calc(govItems);
    const svc = calc(svcItems, (idx) => enabled[idx] !== false);
    const grand = { original: gov.original + svc.original, discounted: gov.discounted + svc.discounted };
    return {
      gov,
      svc,
      grand,
      packageDiscount: Math.max(svc.original - svc.discounted, 0),
      totalSavings: Math.max(gov.original + svc.original - (gov.discounted + svc.discounted), 0),
    };
  }, [govItems, svcItems, enabled]);

  return (
    <div className="w-full mx-auto max-w-6xl space-y-4 md:space-y-6">
      {/* Header (denser) */}
      <Card className="border bg-background">
        <CardHeader className="py-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <CardTitle className="text-base md:text-xl tracking-tight">
              MIRR ASIA BUSINESS ADVISORY & SECRETARIAL COMPANY LIMITED
            </CardTitle>
            <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
              <span>{t("invoice.generated", "Generated")}:</span>
              <span className="font-medium">
                {data.metadata.generatedAt ? new Date(data.metadata.generatedAt).toLocaleDateString() : "—"}
              </span>
              <Badge variant="outline" className="ml-2">USD</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Government Fees */}
      <SectionCard
        title={t("invoice.govFees", "Government Fees")}
        badge={t("invoice.mandatory", "Mandatory")}
        subtotal={totals.gov.discounted}
        description={t(
          "invoice.govDesc",
          "These are statutory fees collected by the authorities and payable by all companies."
        )}
      >
        {/* mobile list */}
        <div className="md:hidden">
          {govItems.map((item, idx) => {
            const key = `gov-${idx}`;
            return (
              <CompactRow
                key={key}
                item={item}
                info={infoByDesc[item.description]}
                hintOpen={!!hintOpen[key]}
                onToggleHint={() => toggleHint(key)}
              />
            );
          })}
        </div>

        {/* desktop table */}
        <div className="hidden md:block rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[46%] py-2">{t("invoice.serviceDescription", "Service Description")}</TableHead>
                <TableHead className="text-right py-2">{t("invoice.qty", "Qty")}</TableHead>
                <TableHead className="text-right py-2">{t("invoice.originalPrice", "Original")}</TableHead>
                <TableHead className="text-right py-2">{t("invoice.amount", "Amount")}</TableHead>
                <TableHead className="text-right py-2">{t("invoice.total", "Total")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {govItems.map((item, idx) => {
                const key = `gov-${idx}`;
                return (
                  <CompactRow
                    key={key}
                    item={item}
                    info={infoByDesc[item.description]}
                    hintOpen={!!hintOpen[key]}
                    onToggleHint={() => toggleHint(key)}
                  />
                );
              })}
              <TableRow className="bg-muted/20">
                <TableCell className="py-2 font-medium">{t("invoice.subtotalGov", "Government Fees Subtotal")}</TableCell>
                <TableCell className="py-2" />
                <TableCell className="py-2" />
                <TableCell className="py-2" />
                <TableCell className="py-2 text-right font-semibold">{fmt(totals.gov.discounted)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </SectionCard>

      {/* Our Service Fees */}
      <SectionCard
        title={t("invoice.serviceFees", "Our Service Fees")}
        badge={t("invoice.package", "company incorporation package + 1st year services")}
        subtotal={totals.svc.discounted}
        description={t(
          "invoice.serviceDesc",
          "Core compliance services are required by law; others are optional add‑ons you may toggle."
        )}
      >
        {/* mobile list */}
        <div className="md:hidden">
          {svcItems.map((item, idx) => {
            const key = `svc-${idx}`;
            return (
              <CompactRow
                key={key}
                item={item}
                info={infoByDesc[item.description]}
                hintOpen={!!hintOpen[key]}
                onToggleHint={() => toggleHint(key)}
                enabled={enabled[idx] !== false}
                onToggle={(v) => setEnabled((s) => ({ ...s, [idx]: v }))}
                showToggle={!!item.optional}
              />
            );
          })}
        </div>

        {/* desktop table */}
        <div className="hidden md:block rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[46%] py-2">{t("invoice.serviceDescription", "Service Description")}</TableHead>
                <TableHead className="text-right py-2">{t("invoice.qty", "Qty")}</TableHead>
                <TableHead className="text-right py-2">{t("invoice.originalPrice", "Original")}</TableHead>
                <TableHead className="text-right py-2">{t("invoice.amount", "Amount")}</TableHead>
                <TableHead className="text-right py-2">{t("invoice.total", "Total")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {svcItems.map((item, idx) => {
                const key = `svc-${idx}`;
                return (
                  <CompactRow
                    key={key}
                    item={item}
                    info={infoByDesc[item.description]}
                    hintOpen={!!hintOpen[key]}
                    onToggleHint={() => toggleHint(key)}
                    enabled={enabled[idx] !== false}
                    onToggle={(v) => setEnabled((s) => ({ ...s, [idx]: v }))}
                    showToggle={!!item.optional}
                  />
                );
              })}
              <TableRow>
                <TableCell className="py-2 text-muted-foreground">{t("invoice.subtotalSvc", "Service Fees Subtotal")}</TableCell>
                <TableCell className="py-2" />
                <TableCell className="py-2" />
                <TableCell className="py-2" />
                <TableCell className="py-2 text-right font-semibold">{fmt(totals.svc.discounted)}</TableCell>
              </TableRow>
              {totals.packageDiscount > 0 && (
                <TableRow>
                  <TableCell className="py-2 text-green-700 dark:text-green-400">
                    {t("invoice.packageDiscount", "Package Discount (auto‑applied)")}
                  </TableCell>
                  <TableCell className="py-2" />
                  <TableCell className="py-2" />
                  <TableCell className="py-2" />
                  <TableCell className="py-2 text-right font-semibold text-green-700 dark:text-green-400">
                    − {fmt(totals.packageDiscount)}
                  </TableCell>
                </TableRow>
              )}
              <TableRow className="bg-muted/20">
                <TableCell className="py-2 font-semibold text-base">{t("invoice.totalCost", "Total Cost")}</TableCell>
                <TableCell className="py-2" />
                <TableCell className="py-2" />
                <TableCell className="py-2" />
                <TableCell className="py-2 text-right font-bold text-base">{fmt(totals.grand.discounted)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* mobile totals */}
        <div className="md:hidden mt-2 grid gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t("invoice.subtotalGov", "Government Fees Subtotal")}</span>
            <span className="font-semibold">{fmt(totals.gov.discounted)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t("invoice.subtotalSvc", "Service Fees Subtotal")}</span>
            <span className="font-semibold">{fmt(totals.svc.discounted)}</span>
          </div>
          {totals.packageDiscount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-green-700 dark:text-green-400">{t("invoice.packageDiscount", "Package Discount")}</span>
              <span className="font-semibold text-green-700 dark:text-green-400">− {fmt(totals.packageDiscount)}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-base">
            <span className="font-medium">{t("invoice.totalCost", "Total Cost")}</span>
            <span className="font-bold">{fmt(totals.grand.discounted)}</span>
          </div>
        </div>

        <p className="mt-3 text-[11px] text-muted-foreground">
          {t(
            "invoice.pricingNotice",
            "Prices are in USD for convenience. Government fees may change based on official notices. Optional items can be added/removed before payment. Accounting/taxation services are not included here—use the estimator below."
          )}
        </p>
      </SectionCard>
    </div>
  );
};

// ==== State wrapper ====
export default function Invoice() {
  const [corpoInvoiceAtom] = useAtom(companyIncorporateInvoiceAtom);
  const invoiceData = corpoInvoiceAtom[0] as unknown as InvoiceData;
  return <StackedInvoice data={invoiceData} />;
}