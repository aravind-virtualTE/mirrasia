import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { HelpCircle } from "lucide-react";
import { AppDoc } from "./hkIncorpo";

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


// ---- Money helpers
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
                                {isFree ? <Badge className="rounded-full px-2 py-0.5">FREE</Badge> : <span className="font-semibold">{fmt(ud)}</span>}
                            </div>
                        </div>

                        <div className="mt-1 flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Line total</span>
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
                                        aria-label="More info"
                                        title="More info"
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
                    {isFree ? <Badge className="rounded-full">FREE</Badge> : <span className="font-semibold">{item.discountedPrice}</span>}
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
); const feesConfig = {
    government: [
        {
            id: "cr_fee",
            label: "HK Company Incorporation Government Fee to Companies Registry",
            original: 221,
            amount: 221,
            mandatory: true,
            info: "Statutory filing fee payable to the Companies Registry.",
        },
        {
            id: "br_fee",
            label: "Business Registration (government) fee",
            original: 283,
            amount: 283,
            mandatory: true,
            info: "Annual Business Registration levy.",
        },
    ],
    service: [
        {
            id: "inc_service",
            label: "Hong Kong Company Incorporation — service fee (discounted)",
            original: 219,
            amount: 0,
            mandatory: true,
            info: "Mirr Asia incorporation service — fully discounted in the package.",
        },
        {
            id: "sec_annual",
            label: "Company Secretary Annual Service Charge",
            original: 450,
            amount: 225,
            mandatory: true,
            info: "Includes statutory record keeping and filings.",
        },
        {
            id: "kyc",
            label: "KYC / Due Diligence fee (1st year)",
            original: 65,
            amount: 0,
            mandatory: true,
            info: "Included for the first year.",
        },
        {
            id: "reg_office",
            label: "Registered Office Address (annual, optional)",
            original: 322,
            amount: 161,
            mandatory: false,
            info: "50% off for the first year.",
        },
        {
            id: "bank_arr",
            label: "Bank/EMI Account Opening Arrangement (optional)",
            original: 400,
            amount: 400,
            mandatory: false,
            info: "Introduction and scheduling support.",
        },
        {
            id: "kit",
            label: "Company Kit Producing cost (optional)",
            original: 70,
            amount: 70,
            mandatory: false,
            info: "Company chop, share certificates, etc.",
        },
        {
            id: "corr_addr",
            label: "Correspondence Address Annual Service (optional)",
            original: 65,
            amount: 65,
            mandatory: false,
            info: "Mail handling for directors/shareholders.",
        },
    ],
};

// ---- Main (builds from feesConfig + app)
export default function InvoicePreview({ app }: { app: AppDoc }) {
    // Info copy
    const infoByDesc: Record<string, React.ReactNode> = {
        "Hong Kong Company Incorporation Government Fee to Companies Registry":
            "Mandatory filing fee to the Companies Registry when establishing a new company.",
        "Business Registration (government) fee":
            "Annual Business Registration fee payable to the Inland Revenue Department (valid for 1 year).",
        "Hong Kong Company Incorporation":
            "Preparation of incorporation documents, name check, filing and liaison with Companies Registry until formation.",
        "Company Secretary Annual Service Charge":
            "We act as your company secretary: maintain registers, prepare & file annual returns, and manage routine filings.",
        "KYC / Due Diligence fee (1st year)":
            "Mandatory KYC/AML checks for shareholders and directors in line with regulations and our obligations.",
        "Registered Office Address (annual, optional)":
            "Registered office address for statutory records and official correspondence.",
        "Bank/EMI Account Opening Arrangement (optional)":
            "Introduction and scheduling support with the selected bank/EMI.",
        "Company Kit Producing cost (optional)":
            "Company chop, share certificates, and related items.",
        "Correspondence Address Annual Service (optional)":
            "Mail handling for directors/shareholders.",
    };

    const selectedOptionals = new Set(app.optionalFeeIds); // e.g. contains "reg_office" if chosen

    // Build items (government: always; service: mandatory OR selected optionals)
    const toItems = (category: "government" | "service") => {
        const list = category === "government" ? feesConfig.government : feesConfig.service;
        return list
            .filter((it) => it.mandatory || selectedOptionals.has(it.id)) // 👈 only include selected optionals
            .map((it) => {
                const original = Number(it.original ?? it.amount ?? 0);
                const discounted = Number(it.amount ?? 0);
                const discountLabel =
                    it.original && it.original > it.amount
                        ? `Discount applied (−${(((it.original - it.amount) / it.original) * 100).toFixed(0)}%)`
                        : undefined;

                return {
                    id: it.id,
                    description: it.label,
                    originalPrice: fmt(original),
                    discountedPrice: fmt(discounted),
                    quantity: 1,
                    totalOriginal: fmt(original),
                    totalDiscounted: fmt(discounted),
                    category,
                    sublabel: it.info,
                    discountLabel,
                } as InvoiceItem;
            });
    };

    const govItems = React.useMemo(() => toItems("government"), [app.optionalFeeIds]);
    const svcItems = React.useMemo(() => toItems("service"), [app.optionalFeeIds]);

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

    // Surcharge view (card only)
    const surcharge = app.form?.payMethod === "card" ? grand.discounted * 0.035 : 0;
    const grandWithSurcharge = grand.discounted + surcharge;

    // Hint state for (i) buttons
    const [hintOpen, setHintOpen] = React.useState<Record<string, boolean>>({});
    const toggleHint = (key: string) => setHintOpen((s) => ({ ...s, [key]: !s[key] }));

    return (
        <div className="w-full mx-auto max-w-6xl space-y-4 md:space-y-6">
            {/* Header */}
            <Card className="border bg-background">
                <CardHeader className="py-2">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <CardTitle className="text-base md:text-xl tracking-tight">
                            MIRR ASIA BUSINESS ADVISORY & SECRETARIAL COMPANY LIMITED
                        </CardTitle>
                        <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                            <span>Generated:</span>
                            <span className="font-medium">{new Date().toLocaleDateString()}</span>
                            <Badge variant="outline" className="ml-2">USD</Badge>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Government Fees */}
            <SectionCard
                title="Government Fees"
                badge="Mandatory"
                subtotal={gov.discounted}
                description="These are statutory fees collected by the authorities and payable by all companies."
            >
                {/* Mobile */}
                <div className="md:hidden">
                    {govItems.map((item) => {
                        const key = `gov-${item.id}`;
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

                {/* Desktop */}
                <div className="hidden md:block rounded-lg border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="w-[46%] py-2">Service Description</TableHead>
                                <TableHead className="text-right py-2">Qty</TableHead>
                                <TableHead className="text-right py-2">Original</TableHead>
                                <TableHead className="text-right py-2">Amount</TableHead>
                                <TableHead className="text-right py-2">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {govItems.map((item) => {
                                const key = `gov-${item.id}`;
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
                                <TableCell className="py-2 font-medium">Government Fees Subtotal</TableCell>
                                <TableCell className="py-2" />
                                <TableCell className="py-2" />
                                <TableCell className="py-2" />
                                <TableCell className="py-2 text-right font-semibold">{fmt(gov.discounted)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </SectionCard>

            {/* Our Service Fees (mandatory + selected optionals like reg_office) */}
            <SectionCard
                title="Our Service Fees"
                badge="company incorporation package + 1st year services"
                subtotal={svc.discounted}
                description="Core compliance services are required by law; selected add-ons are shown below."
            >
                {/* Mobile */}
                <div className="md:hidden">
                    {svcItems.map((item) => {
                        const key = `svc-${item.id}`;
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

                {/* Desktop */}
                <div className="hidden md:block rounded-lg border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="w-[46%] py-2">Service Description</TableHead>
                                <TableHead className="text-right py-2">Qty</TableHead>
                                <TableHead className="text-right py-2">Original</TableHead>
                                <TableHead className="text-right py-2">Amount</TableHead>
                                <TableHead className="text-right py-2">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {svcItems.map((item) => {
                                const key = `svc-${item.id}`;
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
                            <TableRow>
                                <TableCell className="py-2 text-muted-foreground">Service Fees Subtotal</TableCell>
                                <TableCell className="py-2" />
                                <TableCell className="py-2" />
                                <TableCell className="py-2" />
                                <TableCell className="py-2 text-right font-semibold">{fmt(svc.discounted)}</TableCell>
                            </TableRow>
                            <TableRow className="bg-muted/20">
                                <TableCell className="py-2 font-semibold text-base">Total Cost</TableCell>
                                <TableCell className="py-2" />
                                <TableCell className="py-2" />
                                <TableCell className="py-2" />
                                <TableCell className="py-2 text-right font-bold text-base">{fmt(grand.discounted)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile totals */}
                <div className="md:hidden mt-2 grid gap-2 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Government Fees Subtotal</span>
                        <span className="font-semibold">{fmt(gov.discounted)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Service Fees Subtotal</span>
                        <span className="font-semibold">{fmt(svc.discounted)}</span>
                    </div>
                    <div className="flex items-center justify-between text-base">
                        <span className="font-medium">Total Cost</span>
                        <span className="font-bold">{fmt(grand.discounted)}</span>
                    </div>
                </div>

                <p className="mt-3 text-[11px] text-muted-foreground">
                    Prices are in USD for convenience. Government fees may change based on official notices.
                    Selected add-ons are shown; others are not included here.
                </p>
            </SectionCard>

            {/* Surcharge (if card) */}
            <Card>
                <CardContent className="pt-4 text-sm">
                    <div className="flex items-center justify-end gap-6 flex-wrap">
                        <div className="text-right">
                            <div className="text-muted-foreground">Selected total</div>
                            <div className="font-semibold">{fmt(grand.discounted)}</div>
                        </div>
                        {app.form?.payMethod === "card" && (
                            <>
                                <div className="text-right">
                                    <div className="text-muted-foreground">Card processing fee (3.5%)</div>
                                    <div className="font-semibold">{fmt(surcharge)}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold">Grand Total</div>
                                    <div className="text-base font-extrabold">{fmt(grandWithSurcharge)}</div>
                                    <div className="text-[11px] text-muted-foreground mt-1">
                                        Includes 3.5% card processing surcharge.
                                    </div>
                                </div>
                            </>
                        )}
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