import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge as StatusBadge } from "@/components/ui/badge";

import { Company } from "../companyDocumentManager/CompanyDocumentManager";
import { TokenData } from "@/middleware/ProtectedRoutes";
import jwtDecode from "jwt-decode";
import { getCompDocs } from "@/services/dataFetch";
import { Building2, RefreshCw, Printer, Info, CreditCard } from "lucide-react";

// Stripe
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { cartFingerprint, createInvoicePaymentIntent, notifyPaymentSuccess, updateInvoicePaymentIntent } from "@/lib/api/payment";

// ----------------- Types & Utils -----------------

type Line = { label: string; qty: number; unit: number; amount: number };

const ceilPairs = (n: number) => (n <= 0 ? 0 : Math.ceil(n / 2));
const USD = (v: number) => v.toLocaleString(undefined, { style: "currency", currency: "USD" });
const STRIPE_CLIENT_ID = import.meta.env.VITE_STRIPE_DETAILS || process.env.REACT_APP_STRIPE_DETAILS;

const stripePromise = loadStripe(STRIPE_CLIENT_ID);

// ----------------- Payment Form -----------------

function PaymentForm({
  amount,
  company,
  lines,
  description,
  clientSecret,
  onClose,
  onSuccess,   // <-- new
}: {
  amount: number;
  company: Company;
  lines: Line[];
  description: string;
  clientSecret: string | null;
  onClose: () => void;
  onSuccess?: (info: { paymentIntentId: string; receiptUrl?: string }) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = React.useState(false);
  const disabled = !stripe || !elements || !clientSecret || amount <= 0;

  const handlePay = async () => {
    if (!stripe || !elements || !clientSecret) return;
    setSubmitting(true);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Optional redirect page if Stripe requires it later
        return_url: typeof window !== "undefined" ? `${window.location.origin}/billing/success` : undefined,
        payment_method_data: {
          billing_details: { name: company?.companyName || "Company" },
        },
      },
      redirect: "if_required",
    });

    setSubmitting(false);

    if (result.error) {
      console.error(result.error.message);
      return;
    }
    console.log("PaymentResult:", result);
    const pi = result.paymentIntent;
    if (pi?.status === "succeeded") {
      // Tell your backend so it can persist + send email
      try {
        const data = await notifyPaymentSuccess({
          paymentIntentId: pi.id,
          amount: amount * 100 === Math.round(amount * 100) ? amount : Math.round(amount), // if you passed cents earlier, adjust accordingly
          currency: "usd",
          companyId: String(company.id),
          companyName: company.companyName,
          description,
          lines,
        });
        // optional fields from backend (e.g., receiptUrl)
        onSuccess?.({ paymentIntentId: pi.id, receiptUrl: data?.receiptUrl });
      } catch (e) {
        // If backend notify fails, still close; but you may want to show a warning/toast.
        console.warn("Payment succeeded but backend notify failed.", e);
      }

      onClose(); // close the payment dialog
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border p-3">
        <div className="text-sm text-muted-foreground">You are paying</div>
        <div className="text-2xl font-semibold">{USD(amount)}</div>
        <div className="text-xs text-muted-foreground mt-1">{company?.companyName}</div>
      </div>
      <PaymentElement />
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button disabled={disabled || submitting} onClick={handlePay}>
          <CreditCard className="mr-2 h-4 w-4" /> {submitting ? "Processing…" : "Pay Now"}
        </Button>
      </div>
    </div>
  );
}

// ----------------- Main Component -----------------

export default function MemberDirectorManagerPro({ className = "" }: { className?: string }) {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = React.useState<Company | null>(null);

  // Action counts
  const [indivSHAdd, setIndivSHAdd] = React.useState(0);
  const [corpSHAdd, setCorpSHAdd] = React.useState(0);
  const [indivDirAdd, setIndivDirAdd] = React.useState(0);
  const [corpDirAdd, setCorpDirAdd] = React.useState(0);
  const [indivDirRemove, setIndivDirRemove] = React.useState(0);
  const [corpDirRemove, setCorpDirRemove] = React.useState(0);

  // UI state
  const [showSummary, setShowSummary] = React.useState(false);
  const [showPayment, setShowPayment] = React.useState(false);

  // Stripe state
  const [clientSecret, setClientSecret] = React.useState<string | null>(null);

  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [receiptUrl, setReceiptUrl] = React.useState<string | undefined>();
  const [pi, setPi] = React.useState<{ id: string; clientSecret: string; amount: number; status: string; fp: string } | null>(null);


  // Fetch companies
  const fetchComp = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token") as string | null;
      if (!token) {
        setCompanies([]);
        setSelectedCompany(null);
        setError("Not authenticated. Please sign in again.");
        return;
      }

      const decodedToken = jwtDecode<TokenData>(token);
      const response = await getCompDocs(`${decodedToken.userId}`);
      const data = await response;

      setCompanies(data ?? []);
      setSelectedCompany(null);
    } catch (err) {
      console.error("Error fetching companies:", err);
      setError("Failed to load companies. Try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchComp();
  }, [fetchComp]);

  // --- Rates ---
  const R = React.useMemo(
    () => ({
      indivShKycPer2: 65,
      indivShHandlingPer2: 260,
      corpShKycPer1: 130,
      corpShHandlingPer1: 260,
      indivDirKycPer2: 75,
      corpDirKycPer1: 130,
      indivDirRemovePer2: 55,
      corpDirRemovePer1: 100,
    }),
    []
  );

  const lines: Line[] = React.useMemo(() => {
    const l: Line[] = [];
    const shIndivPairs = ceilPairs(indivSHAdd);
    if (shIndivPairs > 0) {
      l.push({
        label: "KYC — new individual shareholder(s) (per 2)",
        qty: shIndivPairs,
        unit: R.indivShKycPer2,
        amount: shIndivPairs * R.indivShKycPer2,
      });
      l.push({
        label: "Handling — new individual shareholder(s) (per 2)",
        qty: shIndivPairs,
        unit: R.indivShHandlingPer2,
        amount: shIndivPairs * R.indivShHandlingPer2,
      });
    }
    if (corpSHAdd > 0) {
      l.push({
        label: "KYC — new corporate shareholder(s) (per 1)",
        qty: corpSHAdd,
        unit: R.corpShKycPer1,
        amount: corpSHAdd * R.corpShKycPer1,
      });
      l.push({
        label: "Handling — new corporate shareholder(s) (per 1)",
        qty: corpSHAdd,
        unit: R.corpShHandlingPer1,
        amount: corpSHAdd * R.corpShHandlingPer1,
      });
    }
    const dirIndivPairs = ceilPairs(indivDirAdd);
    if (dirIndivPairs > 0) {
      l.push({
        label: "Director appointment – individual (per 2)",
        qty: dirIndivPairs,
        unit: R.indivDirKycPer2,
        amount: dirIndivPairs * R.indivDirKycPer2,
      });
    }
    if (corpDirAdd > 0) {
      l.push({
        label: "KYC — new corporate director(s) (per 1)",
        qty: corpDirAdd,
        unit: R.corpDirKycPer1,
        amount: corpDirAdd * R.corpDirKycPer1,
      });
    }
    const dirRmIndivPairs = ceilPairs(indivDirRemove);
    if (dirRmIndivPairs > 0) {
      l.push({
        label: "Handling — remove individual director(s) (per 2)",
        qty: dirRmIndivPairs,
        unit: R.indivDirRemovePer2,
        amount: dirRmIndivPairs * R.indivDirRemovePer2,
      });
    }
    if (corpDirRemove > 0) {
      l.push({
        label: "Handling — remove corporate director(s) (per 1)",
        qty: corpDirRemove,
        unit: R.corpDirRemovePer1,
        amount: corpDirRemove * R.corpDirRemovePer1,
      });
    }
    return l;
  }, [indivSHAdd, corpSHAdd, indivDirAdd, corpDirAdd, indivDirRemove, corpDirRemove, R]);

  const total = React.useMemo(() => lines.reduce((s, l) => s + l.amount, 0), [lines]);

  const currentFP = React.useMemo(() => cartFingerprint({
    companyId: selectedCompany?.id ?? null,
    totalCents: Math.round(total * 100),
    lines, // ok; if huge, pass a reduced projection (label + qty + unit)
  }), [selectedCompany?.id, total, lines]);


  // Helpers
  const setNum = (setter: (v: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setter(Math.max(0, parseInt(e.target.value || "0")));

  const reset = () => {
    setIndivSHAdd(0);
    setCorpSHAdd(0);
    setIndivDirAdd(0);
    setCorpDirAdd(0);
    setIndivDirRemove(0);
    setCorpDirRemove(0);
  };

  const Field = ({ id, label, value, onChange, hint }: { id: string; label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; hint?: string }) => (
    <div className="grid gap-1">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-xs leading-none">{label}</Label>
        {hint ? <span className="text-[11px] text-muted-foreground">{hint}</span> : null}
      </div>
      <Input id={id} type="number" min={0} value={isNaN(value) ? 0 : value} onChange={onChange} className="h-8 px-2 text-sm" inputMode="numeric" aria-label={label} />
    </div>
  );

  const handleCompanySelect = (companyId: string): void => {
    const company = companies.find((c) => String(c.id) === String(companyId));
    if (company) setSelectedCompany(company);
  };

  // Build natural-language summary description
  const summary = React.useMemo(() => {
    const parts: string[] = [];
    if (indivSHAdd || corpSHAdd) {
      parts.push(
        `Add ${indivSHAdd} individual shareholder(s) and ${corpSHAdd} corporate shareholder(s).`
      );
    }
    if (indivDirAdd || corpDirAdd) {
      parts.push(
        `Appoint ${indivDirAdd} individual director(s) and ${corpDirAdd} corporate director(s).`
      );
    }
    if (indivDirRemove || corpDirRemove) {
      parts.push(
        `Remove ${indivDirRemove} individual director(s) and ${corpDirRemove} corporate director(s).`
      );
    }
    const base = parts.length ? parts.join(" ") : "No changes selected yet.";
    return selectedCompany ? `Company: ${selectedCompany.companyName}. ${base}` : base;
  }, [selectedCompany, indivSHAdd, corpSHAdd, indivDirAdd, corpDirAdd, indivDirRemove, corpDirRemove]);

  const canProceed = !!selectedCompany && total > 0;

  // Create PaymentIntent on demand
  // const createPI = React.useCallback(async (): Promise<string | null> => {
  //   try {
  //     if (!selectedCompany) {
  //       console.warn("No company selected");
  //       return null;
  //     }
  //     if (total <= 0) {
  //       console.warn("Total must be greater than zero");
  //       return null;
  //     }

  //     const idempotencyKey = `pay-${selectedCompany.id}-${total}-${Date.now()}`;

  //     const resp = await createInvoicePaymentIntent(
  //       {
  //         amount: Math.round(total * 100), // cents
  //         currency: "usd",
  //         metadata: {
  //           companyId: selectedCompany.id,
  //           companyName: selectedCompany.companyName,
  //           description: summary,
  //           lines: JSON.stringify(lines),
  //         },
  //         description: summary,
  //       },
  //       idempotencyKey
  //     );

  //     return resp.clientSecret ?? null;
  //   } catch (err) {
  //     console.error("createPI error:", err);
  //     return null;
  //   }
  // }, [selectedCompany, total, summary, lines]);
  const ensurePI = React.useCallback(async (): Promise<{ clientSecret: string; id: string } | null> => {
    if (!selectedCompany || total <= 0) return null;

    // 1) Reuse (same cart) — open dialog without API calls
    if (pi && pi.fp === currentFP && (pi.status === "requires_payment_method" || pi.status === "requires_confirmation")) {
      return { clientSecret: pi.clientSecret, id: pi.id };
    }

    const totalCents = Math.round(total * 100);

    const minimalMeta = {
      companyId: String(selectedCompany.id),
      companyName: (selectedCompany.companyName || "").slice(0, 120), // keep short
      cart_fp: currentFP,
      item_count: String(lines.length),
      total_cents: String(totalCents),
    };

    const body = {
      amount: totalCents,
      currency: "usd",
      metadata: minimalMeta,                    
      description: summary.slice(0, 180),       
      internal: {                             
        lines,    
        summary,
      },
    };

    // 2) If we already have a PI but cart changed, try update (if still updatable)
    if (pi && (pi.status === "requires_payment_method" || pi.status === "requires_confirmation")) {
      const updated = await updateInvoicePaymentIntent(pi.id, body);
      const next = {
        id: updated.id,
        clientSecret: updated.clientSecret,
        amount: updated.amount,
        status: updated.status,
        fp: currentFP,
      };
      setPi(next);
      return { clientSecret: next.clientSecret, id: next.id };
    }

    // 3) Otherwise, create with a STABLE idempotency key
    const idemKey = `pi-${currentFP}-${selectedCompany.id}`;
    const created = await createInvoicePaymentIntent(body, idemKey);
    const next = {
      id: created.id,
      clientSecret: created.clientSecret,
      amount: created.amount,
      status: created.status,
      fp: currentFP,
    };
    setPi(next);
    return { clientSecret: next.clientSecret, id: next.id };
  }, [pi, currentFP, selectedCompany, total, lines, summary]);

  const handleOpenPayment = async () => {
    const res = await ensurePI();
    if (res?.clientSecret) {
      setClientSecret(res.clientSecret);
      setShowPayment(true);
    }
  };

  return (
    <div className={["w-full mx-auto", "px-3 sm:px-4 lg:px-6", "max-w-screen-2xl", "h-full", className].join(" ")}>
      {/* Step 1: Select Company */}
      {successMsg && (
        <div className="mb-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          {successMsg} {receiptUrl ? (<a className="underline ml-1" href={receiptUrl} target="_blank" rel="noreferrer">View receipt</a>) : null}
        </div>
      )}
      <Card className="mb-2 border shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-start sm:items-center justify-between gap-0">
            <div className="flex items-start sm:items-center gap-2">
              <div className="h-8 w-8 rounded-full border flex items-center justify-center">
                <Building2 className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg">Select Company</CardTitle>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-80" />
              <Skeleton className="h-4 w-48" />
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <Info className="h-4 w-4" />
              <span>{error}</span>
              <Button size="sm" variant="outline" className="ml-2" onClick={fetchComp}>Retry</Button>
            </div>
          ) : companies.length === 0 ? (
            <div className="rounded-md bg-muted text-muted-foreground p-2 text-sm">No companies found</div>
          ) : (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 min-w-[220px] max-w-[480px]">
                <Label htmlFor="company-select" className="sr-only">Company</Label>
                <Select onValueChange={handleCompanySelect} value={selectedCompany ? String(selectedCompany.id) : undefined}>
                  <SelectTrigger id="company-select" className="w-full">
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={String(company.id)} value={String(company.id)}>
                        {company.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedCompany ? (
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Selected: <span className="font-medium">{selectedCompany.companyName}</span>
                </div>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Configure Actions & See Live Summary */}
      <Card className="border shadow-sm">
        <CardHeader className="p-2 sm:p-3">
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm sm:text-base">Hong Kong — Shareholder / Director Changes</CardTitle>
              <Badge variant="outline" className="h-5 px-2 text-[11px]">USD</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={reset}><RefreshCw className="mr-1 h-3.5 w-3.5" /> Reset</Button>
              <Button size="sm" onClick={() => window.print()}><Printer className="mr-1 h-3.5 w-3.5" /> Print / Save PDF</Button>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Individuals billed per <b>2</b>; corporates per <b>1</b>. Count the same person in both sections if they are both shareholder and director.
          </p>
        </CardHeader>

        <CardContent className="p-2 sm:p-3">
          <div className="grid grid-cols-12 gap-2">
            {/* Add Shareholders */}
            <section className="col-span-12 lg:col-span-6 rounded-md border p-2">
              <div className="text-sm font-medium mb-2">Add Shareholders</div>
              <div className="grid grid-cols-2 gap-2">
                <Field id="add-indiv-sh" label="Individuals to add" hint="per 2" value={indivSHAdd} onChange={setNum(setIndivSHAdd)} />
                <Field id="add-corp-sh" label="Corporates to add" hint="per 1" value={corpSHAdd} onChange={setNum(setCorpSHAdd)} />
              </div>
            </section>

            {/* Add Directors */}
            <section className="col-span-12 lg:col-span-6 rounded-md border p-2">
              <div className="text-sm font-medium mb-2">Add Directors</div>
              <div className="grid grid-cols-2 gap-2">
                <Field id="add-indiv-dir" label="Individuals to add" hint="KYC • per 2" value={indivDirAdd} onChange={setNum(setIndivDirAdd)} />
                <Field id="add-corp-dir" label="Corporates to add" hint="KYC • per 1" value={corpDirAdd} onChange={setNum(setCorpDirAdd)} />
              </div>
            </section>

            {/* Remove Directors */}
            <section className="col-span-12 rounded-md border p-2">
              <div className="text-sm font-medium mb-2">Remove Directors</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Field id="rm-indiv-dir" label="Individuals to remove" hint="Handling • per 2" value={indivDirRemove} onChange={setNum(setIndivDirRemove)} />
                <Field id="rm-corp-dir" label="Corporates to remove" hint="Handling • per 1" value={corpDirRemove} onChange={setNum(setCorpDirRemove)} />
              </div>
            </section>
          </div>

          <Separator className="my-3" />

          {/* Live natural-language Description */}
          <div className="rounded-md border p-3 bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Description</div>
                <p className="text-sm text-muted-foreground mt-1">{summary}</p>
              </div>
              <StatusBadge variant="secondary" className="whitespace-nowrap">{selectedCompany ? "Company selected" : "No company"}</StatusBadge>
            </div>
          </div>

          {/* Invoice */}
          <div className="rounded-md border overflow-hidden mt-3">
            <Table className="text-sm">
              <TableHeader>
                <TableRow className="h-9">
                  <TableHead className="w-[55%]">Description</TableHead>
                  <TableHead className="text-right w-[10%]">Qty</TableHead>
                  <TableHead className="text-right w-[15%]">Unit</TableHead>
                  <TableHead className="text-right w-[20%]">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.length === 0 ? (
                  <TableRow className="h-10">
                    <TableCell colSpan={4} className="text-center text-muted-foreground">Enter quantities above.</TableCell>
                  </TableRow>
                ) : (
                  lines.map((l, i) => (
                    <TableRow key={i} className="h-8">
                      <TableCell className="py-1">{l.label}</TableCell>
                      <TableCell className="py-1 text-right">{l.qty}</TableCell>
                      <TableCell className="py-1 text-right">{USD(l.unit)}</TableCell>
                      <TableCell className="py-1 text-right font-medium">{USD(l.amount)}</TableCell>
                    </TableRow>
                  ))
                )}
                <TableRow className="h-12 font-semibold sticky bottom-0 bg-background">
                  <TableCell colSpan={3} className="text-right">Total</TableCell>
                  <TableCell className="text-right">{USD(total)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Actions */}
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowSummary(true)}>Preview Summary</Button>
            <Button disabled={!canProceed} onClick={handleOpenPayment}>
              <CreditCard className="mr-2 h-4 w-4" /> Proceed to Payment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Slide-up Summary Sheet */}
      <Sheet open={showSummary} onOpenChange={setShowSummary}>
        <SheetContent side="bottom" className="h-[75vh] overflow-auto">
          <SheetHeader>
            <SheetTitle>Order Summary</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            <div className="rounded-md border p-3">
              <div className="text-sm font-medium">Company</div>
              <div className="text-sm text-muted-foreground">{selectedCompany ? selectedCompany.companyName : "—"}</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-sm font-medium">Requested Changes</div>
              <div className="text-sm text-muted-foreground mt-1">{summary}</div>
            </div>
            <div className="rounded-md border overflow-hidden">
              <Table className="text-sm">
                <TableHeader>
                  <TableRow className="h-9">
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lines.length === 0 ? (
                    <TableRow className="h-10">
                      <TableCell colSpan={4} className="text-center text-muted-foreground">No items</TableCell>
                    </TableRow>
                  ) : (
                    lines.map((l, i) => (
                      <TableRow key={i} className="h-8">
                        <TableCell className="py-1">{l.label}</TableCell>
                        <TableCell className="py-1 text-right">{l.qty}</TableCell>
                        <TableCell className="py-1 text-right">{USD(l.unit)}</TableCell>
                        <TableCell className="py-1 text-right font-medium">{USD(l.amount)}</TableCell>
                      </TableRow>
                    ))
                  )}
                  <TableRow className="h-12 font-semibold">
                    <TableCell colSpan={3} className="text-right">Total</TableCell>
                    <TableCell className="text-right">{USD(total)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Payment Dialog (Stripe Elements) */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Pay with card</DialogTitle>
          </DialogHeader>
          {clientSecret && selectedCompany ? (
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { labels: "floating" } }}>
              <PaymentForm
                amount={total}
                company={selectedCompany}
                lines={lines}
                description={summary}
                clientSecret={clientSecret}
                onClose={() => setShowPayment(false)}
                onSuccess={({ paymentIntentId, receiptUrl }) => {
                  setSuccessMsg(`Payment successful. Reference: ${paymentIntentId}`);
                  setReceiptUrl(receiptUrl);
                }}
              />
            </Elements>
          ) : (
            <div className="text-sm text-muted-foreground">Initializing payment…</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
