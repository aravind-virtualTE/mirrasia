/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Badge as StatusBadge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { Company } from "../../companyDocumentManager/CompanyDocumentManager";
import { TokenData } from "@/middleware/ProtectedRoutes";
import jwtDecode from "jwt-decode";
import { getCompDocs } from "@/services/dataFetch";
import { RefreshCw, Printer, Info, CreditCard, Building2, Wallet, Ellipsis } from "lucide-react";

// Stripe
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import {
  cartFingerprint,
  createDraftOrder,
  getInvoiceOrder,
  notifyPaymentSuccess,
  orderResume,
  updatePayMethod,
  uploadBankProof,
  // createInvoicePaymentIntent,
  // updateInvoicePaymentIntent,
} from "@/lib/api/payment";
import { FPSForm } from "@/pages/Company/payment/FPSForm";

// ----------------- Types & Utils -----------------

type Line = { label: string; qty: number; unit: number; amount: number };

const ceilPairs = (n: number) => (n <= 0 ? 0 : Math.ceil(n / 2));
const USD = (v: number) =>
  v.toLocaleString(undefined, { style: "currency", currency: "USD" });
const STRIPE_CLIENT_ID =
  import.meta.env.VITE_STRIPE_DETAILS || process.env.REACT_APP_STRIPE_DETAILS;

const stripePromise = loadStripe(STRIPE_CLIENT_ID);
// Card fee rate (3.5%)
const CARD_FEE_RATE = 0.035;

// ----------------- Payment Form -----------------

function PaymentForm({
  amount, // final amount to be charged (subtotal + fee)
  baseAmount, // original subtotal (before fee)
  feeCents, // fee in cents (for exact display)
  feeRate = CARD_FEE_RATE,
  company,
  lines,
  description,
  clientSecret,
  onClose,
  onSuccess,
  userEmail,
  userId,
  userName,
  orderId
}: {
  amount: number;
  baseAmount: number;
  feeCents: number;
  feeRate?: number;
  company: Company;
  lines: Line[];
  description: string;
  userName: string;
  userId: string;
  userEmail: string;
  clientSecret: string | null;
  onClose: () => void;
  onSuccess?: (info: { paymentIntentId: string; receiptUrl?: string }) => void;
  orderId: string | null;
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
        return_url:
          typeof window !== "undefined"
            ? `${window.location.origin}/billing/success`
            : undefined,
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
    const pi = result.paymentIntent;
    if (pi?.status === "succeeded") {
      try {
        await notifyPaymentSuccess({
          paymentIntentId: pi.id,
          amount: Math.round(amount * 100), // cents (final amount)
          currency: "usd",
          companyId: String(company.id),
          companyName: company.companyName,
          userEmail: userEmail || "N/A",
          userName: userName || "N/A",
          userId: userId || "N/A",
          description,
          lines,
          orderId
        });
        onSuccess?.({
          paymentIntentId: pi.id,
          receiptUrl: (pi as any)?.charges?.data?.[0]?.receipt_url,
        });
      } catch (e) {
        console.warn("Payment succeeded but backend notify failed.", e);
      }
      onClose();
    }
  };
  const finalCents = Math.round(amount * 100);
  return (
    <div className="space-y-4">
      <div className="rounded-md border p-3">
        <div className="text-sm text-foreground/80">You are paying</div>
        <div className="text-2xl font-semibold">{USD(amount)}</div>
        <div className="text-xs text-foreground/80 mt-1">
          {company?.companyName}
        </div>
      </div>
      {/* Elegant breakdown */}
      <div className="rounded-md border bg-muted/30 p-3">
        <div className="grid grid-cols-1 gap-1 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-foreground/80">Original Price</span>
            <span className="font-medium">{USD(baseAmount)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-foreground/80">
              Stripe credit card processing fee ({(feeRate * 100).toFixed(1)}%)
            </span>
            <span className="font-medium">{USD(feeCents / 100)}</span>
          </div>
          <Separator className="my-1" />
          <div className="flex items-center justify-between">
            <span className="font-semibold">Final Amount Charged</span>
            <span className="font-semibold">{USD(finalCents / 100)}</span>
          </div>
        </div>
        <p className="mt-2 text-xs text-foreground/80">
          Includes a {(feeRate * 100).toFixed(1)}% Stripe credit card
          processing fee.
        </p>
      </div>
      <PaymentElement />
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button disabled={disabled || submitting} onClick={handlePay}>
          <CreditCard className="mr-2 h-4 w-4" />{" "}
          {submitting ? "Processing…" : "Pay Now"}
        </Button>
      </div>
    </div>
  );
}

// ----------------- Main Component -----------------
export default function HongKongMemberDirectorChanges() {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = React.useState<Company | null>(
    null
  );
  // Action counts
  const [indivSHAdd, setIndivSHAdd] = React.useState(0);
  const [corpSHAdd, setCorpSHAdd] = React.useState(0);
  const [indivDirAdd, setIndivDirAdd] = React.useState(0);
  const [corpDirAdd, setCorpDirAdd] = React.useState(0);
  const [indivDirRemove, setIndivDirRemove] = React.useState(0);
  const [corpDirRemove, setCorpDirRemove] = React.useState(0);

  // UI state
  const [showSummary, setShowSummary] = React.useState(false);
  const [showPaySheet, setShowPaySheet] = React.useState(false);
  const [payMethod, setPayMethod] = React.useState<"card" | "bank" | "FPS" | "other">("card");

  // Stripe state
  const [clientSecret, setClientSecret] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [receiptUrl, setReceiptUrl] = React.useState<string | undefined>();
  const [orderId, setOrderId] = React.useState<string | null>(null);

  const [submittingBankProof, setSubmittingBankProof] = React.useState(false);

  const [bankRef, setBankRef] = React.useState<string | null>(null);
  const [bankFile, setBankFile] = React.useState<File | null>(null);
  const [bankInit, setBankInit] = React.useState(false);
  const [bankMsg, setBankMsg] = React.useState<string | null>(null);

  const user = JSON.parse(localStorage.getItem("user") || "null");
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
  }, [
    indivSHAdd,
    corpSHAdd,
    indivDirAdd,
    corpDirAdd,
    indivDirRemove,
    corpDirRemove,
    R,
  ]);

  const total = React.useMemo(
    () => lines.reduce((s, l) => s + l.amount, 0),
    [lines]
  );

  // Derived amounts for card fee
  const totals = React.useMemo(() => {
    const subtotalCents = Math.round(total * 100);
    const feeCents = Math.round(subtotalCents * CARD_FEE_RATE);
    const finalCents = subtotalCents + feeCents;
    return {
      subtotalCents,
      feeCents,
      finalCents,
      subtotal: subtotalCents / 100,
      fee: feeCents / 100,
      final: finalCents / 100,
    };
  }, [total]);

  const currentFP = React.useMemo(
    () =>
      cartFingerprint({
        companyId: selectedCompany?.id ?? null,
        totalCents: Math.round(total * 100),
        lines,
      }),
    [selectedCompany?.id, total, lines]
  );

  // hydrate 
  React.useEffect(() => {
    const cached = localStorage.getItem("openOrderId");
    if (cached) {
      getInvoiceOrder(cached).then(r => {
        const o = r;
        setOrderId(o._id);
        setClientSecret(o?.stripe?.clientSecret || null);
        setPayMethod(o.payMethod || "card");
        if (o.payMethod === "bank") {
          setBankRef(o?.bank?.reference ?? null);
          setBankInit(true);
        }
        // Optional: if you want to restore lines from server snapshot:
        // hydrate local UI from o.lines / o.subtotalCents / etc (or keep local as source of truth)
      }).catch(() => localStorage.removeItem("openOrderId"));
    } else if (selectedCompany) {
      orderResume(selectedCompany.id, currentFP).then(r => {
        if (r.status === 204) return;
        const o = r.data;
        setOrderId(o._id);
        setClientSecret(o?.stripe?.clientSecret || null);
        setPayMethod(o.payMethod || "card");
        if (o.payMethod === "bank") {
          setBankRef(o?.bank?.reference ?? null);
          setBankInit(true);
        }
        localStorage.setItem("openOrderId", o._id);
      });
    }
  }, [selectedCompany?.id, currentFP]);

  // Helpers
  const setNum =
    (setter: (v: number) => void) =>
      (e: React.ChangeEvent<HTMLInputElement>) =>
        setter(Math.max(0, parseInt(e.target.value || "0")));

  const reset = () => {
    setIndivSHAdd(0);
    setCorpSHAdd(0);
    setIndivDirAdd(0);
    setCorpDirAdd(0);
    setIndivDirRemove(0);
    setCorpDirRemove(0);
  };

  const Field = ({ id, label, value, onChange, hint, }: {
    id: string; label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    hint?: string;
  }) => (
    <div className="grid gap-1">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-xs leading-none">
          {label}
        </Label>
        {hint ? (
          <span className="text-[11px] text-foreground/80">{hint}</span>
        ) : null}
      </div>
      <Input
        id={id}
        type="number"
        min={0}
        value={isNaN(value) ? 0 : value}
        onChange={onChange}
        className="h-8 px-2 text-sm"
        inputMode="numeric"
        aria-label={label}
      />
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
    return selectedCompany
      ? `Company: ${selectedCompany.companyName}. ${base}`
      : base;
  }, [
    selectedCompany,
    indivSHAdd,
    corpSHAdd,
    indivDirAdd,
    corpDirAdd,
    indivDirRemove,
    corpDirRemove,
  ]);

  const canProceed = !!selectedCompany && total > 0;

  const ensureOrderAndPI = React.useCallback(async () => {
    if (!selectedCompany || totals.finalCents <= 0) return null;
    const r = await createDraftOrder({
      companyId: selectedCompany.id,
      lines,
      totals: {
        subtotalCents: Math.round(totals.subtotal * 100),
        feeCents: totals.feeCents,
        finalCents: Math.round(totals.final * 100),
      },
      summary,
      cartFingerprint: currentFP,
      currency: "usd"
    });
    setOrderId(r.orderId);
    setClientSecret(r.clientSecret);
    localStorage.setItem("openOrderId", r.orderId);
    return { orderId: r.orderId, clientSecret: r.clientSecret };
  }, [selectedCompany?.id, lines, totals, summary, currentFP]);

  const handleOpenPayment = async () => {
    // Prepare Intent for card flow so it's ready when the sheet opens
    await ensureOrderAndPI();
    // const res = await ensurePI();
    // if (res?.clientSecret) {
    console.log("testin....")
    //   setClientSecret(res.clientSecret);
    // }
    setPayMethod("card");
    setShowPaySheet(true);
  };

  const bankDetails = {
    bankName: 'HSBC',
    accountNo: '817 245681 838',
    beneficiaryName: 'MIRR ASIA BUSINESS ADVISORY & SECRETARIAL COMPANY LIMITED',
    address: "1 Queen's Road, Central, Hong Kong",
    bankCode: '004',
    swiftHKD: 'HSBCHKHHHKH',
    swiftOther: 'HSBCHKHHXXX'
  };

  const initBankFlow = React.useCallback(async () => {
    if (bankInit) return; // don't redo if already done
    if (!selectedCompany || totals.finalCents <= 0) return;

    const res = await ensureOrderAndPI(); // creates/reuses draft order
    if (res?.orderId) {
      const o = await updatePayMethod(res.orderId, "bank"); // switch order to bank
      setOrderId(res.orderId);
      setBankRef(o?.bank?.reference ?? null);
      localStorage.setItem("openOrderId", res.orderId);
      setBankInit(true);
    }
  }, [bankInit, selectedCompany?.id, totals.finalCents, ensureOrderAndPI])

  const handleTabChange = React.useCallback(async (v: string) => {
    setPayMethod(v as any);
    if (v === "bank") {
      await initBankFlow();
    }
  }, [initBankFlow]);

  const handleBankProofSubmit = React.useCallback(async () => {
    if (!orderId || !bankFile) return;
    try {
      setSubmittingBankProof(true);
      await uploadBankProof(orderId, bankFile);
      setSubmittingBankProof(false);
      setBankMsg("Receipt submitted — we’ll verify shortly.");
      setBankFile(null);
    } catch {
      setSubmittingBankProof(false);
    }
  }, [orderId, bankFile]);

  return (
    <div
      className={["w-full mx-auto", "px-3 sm:px-4 lg:px-6", "max-w-screen-2xl", "h-full"].join(
        " "
      )}
    >
      {successMsg && (
        <div className="mb-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          {successMsg}{" "}
          {receiptUrl ? (
            <a
              className="underline ml-1"
              href={receiptUrl}
              target="_blank"
              rel="noreferrer"
            >
              View receipt
            </a>
          ) : null}
        </div>
      )}

      <Card className="mb-2 border shadow-sm">
        <CardContent className="pt-1 pb-1">
          {loading ? (
            <div className="flex items-center gap-4">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <Info className="h-4 w-4" />
              <span>{error}</span>
              <Button
                size="sm"
                variant="outline"
                className="ml-2"
                onClick={fetchComp}
              >
                Retry
              </Button>
            </div>
          ) : companies.length === 0 ? (
            <div className="rounded-md bg-muted text-foreground/80 p-2 text-sm">
              No companies found
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Label className="w-32">Company</Label>
              <Select
                onValueChange={handleCompanySelect}
                value={selectedCompany ? String(selectedCompany.id) : undefined}
              >
                <SelectTrigger className="max-w-xs">
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem
                      key={String(company.id)}
                      value={String(company.id)}
                    >
                      {company.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCompany && (
                <div className="text-sm text-foreground/80">
                  Selected:{" "}
                  <span className="font-medium">{selectedCompany.companyName}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Configure Actions & See Live Summary */}
      <Card className="border shadow-sm">
        <CardHeader className="p-2 sm:p-3">
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm sm:text-base">
                Hong Kong — Change of Member/Shareholder & Director
              </CardTitle>
              <Badge variant="outline" className="h-5 px-2 text-[11px]">
                USD
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={reset}>
                <RefreshCw className="mr-1 h-3.5 w-3.5" /> Reset
              </Button>
              <Button size="sm" onClick={() => window.print()}>
                <Printer className="mr-1 h-3.5 w-3.5" /> Print / Save PDF
              </Button>
            </div>
          </div>
          <p className="text-[11px] text-foreground/80 mt-1">
            Individuals billed per <b>2</b>; corporates per <b>1</b>. Count the
            same person in both sections if they are both shareholder and
            director.
          </p>
        </CardHeader>
        <CardContent className="p-2 sm:p-3">
          <div className="grid grid-cols-12 gap-2">
            <section className="col-span-12 lg:col-span-6 rounded-md border p-2">
              <div className="text-sm font-medium mb-2">Add Shareholders</div>
              <div className="grid grid-cols-2 gap-2">
                <Field
                  id="add-indiv-sh"
                  label="Individuals to add"
                  hint="per 2"
                  value={indivSHAdd}
                  onChange={setNum(setIndivSHAdd)}
                />
                <Field
                  id="add-corp-sh"
                  label="Corporates to add"
                  hint="per 1"
                  value={corpSHAdd}
                  onChange={setNum(setCorpSHAdd)}
                />
              </div>
            </section>

            <section className="col-span-12 lg:col-span-6 rounded-md border p-2">
              <div className="text-sm font-medium mb-2">Add Directors</div>
              <div className="grid grid-cols-2 gap-2">
                <Field
                  id="add-indiv-dir"
                  label="Individuals to add"
                  hint="KYC • per 2"
                  value={indivDirAdd}
                  onChange={setNum(setIndivDirAdd)}
                />
                <Field
                  id="add-corp-dir"
                  label="Corporates to add"
                  hint="KYC • per 1"
                  value={corpDirAdd}
                  onChange={setNum(setCorpDirAdd)}
                />
              </div>
            </section>

            <section className="col-span-12 rounded-md border p-2">
              <div className="text-sm font-medium mb-2">Remove Directors</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Field
                  id="rm-indiv-dir"
                  label="Individuals to remove"
                  hint="Handling • per 2"
                  value={indivDirRemove}
                  onChange={setNum(setIndivDirRemove)}
                />
                <Field
                  id="rm-corp-dir"
                  label="Corporates to remove"
                  hint="Handling • per 1"
                  value={corpDirRemove}
                  onChange={setNum(setCorpDirRemove)}
                />
              </div>
            </section>
          </div>

          <Separator className="my-3" />

          <div className="rounded-md border p-3 bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Description</div>
                <p className="text-sm text-foreground/80 mt-1">{summary}</p>
              </div>
              <StatusBadge variant="secondary" className="whitespace-nowrap">
                {selectedCompany ? "Company selected" : "No company"}
              </StatusBadge>
            </div>
          </div>

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
                    <TableCell
                      colSpan={4}
                      className="text-center text-foreground/80"
                    >
                      Enter quantities above.
                    </TableCell>
                  </TableRow>
                ) : (
                  lines.map((l, i) => (
                    <TableRow key={i} className="h-8">
                      <TableCell className="py-1">{l.label}</TableCell>
                      <TableCell className="py-1 text-right">{l.qty}</TableCell>
                      <TableCell className="py-1 text-right">
                        {USD(l.unit)}
                      </TableCell>
                      <TableCell className="py-1 text-right font-medium">
                        {USD(l.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
                <TableRow className="h-10">
                  <TableCell colSpan={3} className="text-right">
                    Subtotal
                  </TableCell>
                  <TableCell className="text-right">
                    {USD(totals.subtotal)}
                  </TableCell>
                </TableRow>
                <TableRow className="h-10">
                  <TableCell
                    colSpan={3}
                    className="text-right text-foreground/80"
                  >
                    Stripe credit card processing fee (
                    {(CARD_FEE_RATE * 100).toFixed(1)}%)
                  </TableCell>
                  <TableCell className="text-right text-foreground/80">
                    {USD(totals.fee)}
                  </TableCell>
                </TableRow>
                <TableRow className="h-12 font-semibold sticky bottom-0 bg-background">
                  <TableCell colSpan={3} className="text-right">
                    Final Amount (Card)
                  </TableCell>
                  <TableCell className="text-right">
                    {USD(totals.final)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 justify-end">
            <div className="text-xs text-foreground/80 sm:mr-auto">
              Paying by card via Stripe adds a {(CARD_FEE_RATE * 100).toFixed(1)}
              % processing fee.
            </div>
            <Button variant="outline" onClick={() => setShowSummary(true)}>
              Preview Summary
            </Button>
            <Button disabled={!canProceed} onClick={handleOpenPayment}>
              <CreditCard className="mr-2 h-4 w-4" /> Proceed to Payment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Sheet */}
      <Sheet open={showSummary} onOpenChange={setShowSummary}>
        <SheetContent side="bottom" className="h-[75vh] overflow-auto">
          <SheetHeader>
            <SheetTitle>Order Summary</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            <div className="rounded-md border p-3">
              <div className="text-sm font-medium">Company</div>
              <div className="text-sm text-foreground/80">
                {selectedCompany ? selectedCompany.companyName : "—"}
              </div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-sm font-medium">Requested Changes</div>
              <div className="text-sm text-foreground/80 mt-1">{summary}</div>
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
                      <TableCell
                        colSpan={4}
                        className="text-center text-foreground/80"
                      >
                        No items
                      </TableCell>
                    </TableRow>
                  ) : (
                    lines.map((l, i) => (
                      <TableRow key={i} className="h-8">
                        <TableCell className="py-1">{l.label}</TableCell>
                        <TableCell className="py-1 text-right">
                          {l.qty}
                        </TableCell>
                        <TableCell className="py-1 text-right">
                          {USD(l.unit)}
                        </TableCell>
                        <TableCell className="py-1 text-right font-medium">
                          {USD(l.amount)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  <TableRow className="h-10">
                    <TableCell colSpan={3} className="text-right">
                      Subtotal
                    </TableCell>
                    <TableCell className="text-right">
                      {USD(totals.subtotal)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="h-10">
                    <TableCell
                      colSpan={3}
                      className="text-right text-foreground/80"
                    >
                      Stripe credit card processing fee (
                      {(CARD_FEE_RATE * 100).toFixed(1)}%)
                    </TableCell>
                    <TableCell className="text-right text-foreground/80">
                      {USD(totals.fee)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="h-12 font-semibold">
                    <TableCell colSpan={3} className="text-right">
                      Final Amount (Card)
                    </TableCell>
                    <TableCell className="text-right">
                      {USD(totals.final)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <p className="text-xs text-foreground/80">
              Original Price: {USD(totals.subtotal)} · Includes a{" "}
              {(CARD_FEE_RATE * 100).toFixed(1)}% Stripe credit card processing
              fee · Final Amount Charged: {USD(totals.final)}
            </p>
          </div>
        </SheetContent>
      </Sheet>

      {/* Payment Sheet (NEW) */}
      <Sheet open={showPaySheet} onOpenChange={setShowPaySheet}>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Choose a payment method</SheetTitle>
          </SheetHeader>

          <div className="mt-4">
            <Tabs value={payMethod} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="card" className="flex items-center gap-1">
                  <CreditCard className="h-4 w-4" />
                  <span className="hidden sm:inline">Card</span>
                </TabsTrigger>
                <TabsTrigger value="bank" className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Bank</span>
                </TabsTrigger>
                <TabsTrigger value="FPS" className="flex items-center gap-1">
                  <Wallet className="h-4 w-4" />
                  <span className="hidden sm:inline">FPS</span>
                </TabsTrigger>
                <TabsTrigger value="other" className="flex items-center gap-1">
                  <Ellipsis className="h-4 w-4" />
                  <span className="hidden sm:inline">Other</span>
                </TabsTrigger>
              </TabsList>

              {/* CARD METHOD */}
              <TabsContent value="card" className="mt-4">
                {clientSecret && selectedCompany ? (
                  <Elements
                    stripe={stripePromise}
                    options={{ clientSecret, appearance: { labels: "floating" } }}
                  >
                    <PaymentForm
                      amount={totals.final}
                      baseAmount={totals.subtotal}
                      feeCents={totals.feeCents}
                      feeRate={CARD_FEE_RATE}
                      company={selectedCompany}
                      lines={lines}
                      description={summary}
                      clientSecret={clientSecret}
                      onClose={() => setShowPaySheet(false)}
                      onSuccess={({ paymentIntentId, receiptUrl }) => {
                        setSuccessMsg(`Payment successful. Reference: ${paymentIntentId}`);
                        setReceiptUrl(receiptUrl);
                        localStorage.removeItem("openOrderId");
                      }}
                      userEmail={user?.email}
                      userId={user?.id}
                      userName={user?.fullName}
                      orderId={orderId}
                    />
                  </Elements>
                ) : (
                  <div className="text-sm text-foreground/80">
                    Initializing payment…
                  </div>
                )}
              </TabsContent>

              <TabsContent value="bank" className="mt-4">
                <div className="space-y-3">
                  <div className="rounded-md border p-3">
                    <div className="text-sm font-medium">Bank Transfer</div>
                    <p className="text-sm text-foreground/80 mt-1">
                      Transfer {USD(totals.subtotal)} to the account below. Include your reference in the memo.
                    </p>
                    <div className="mt-2 text-sm space-y-1">
                      <div><b>Bank:</b> {bankDetails.bankName} ({bankDetails.bankCode})</div>
                      <div><b>Account Name:</b> {bankDetails.beneficiaryName}</div>
                      <div><b>Account No.:</b> {bankDetails.accountNo}</div>
                      <div><b>Address:</b> {bankDetails.address}</div>
                      <div><b>SWIFT (HKD):</b> {bankDetails.swiftHKD}</div>
                      <div><b>SWIFT (Other Currencies):</b> {bankDetails.swiftOther}</div>
                      <div><b>Reference:</b> {bankRef ?? "—"}</div>
                    </div>
                  </div>

                  <div className="rounded-md border bg-muted/30 p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Amount due</span>
                      <span className="font-semibold">{USD(totals.subtotal)}</span>
                    </div>
                    <p className="text-xs text-foreground/70 mt-1">
                      No card fees apply for bank transfer.
                    </p>
                  </div>

                  <div className="rounded-md border p-3 space-y-2">
                    <div className="text-sm font-medium">Upload payment receipt</div>
                    <Input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => {
                        const f = e.target.files?.[0] || null;
                        setBankFile(f);
                        setBankMsg(null);
                      }}
                      disabled={!bankInit || submittingBankProof}
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={handleBankProofSubmit}
                        disabled={!bankInit || !bankFile || submittingBankProof}
                      >
                        {submittingBankProof ? "Submitting…" : "Submit Proof"}
                      </Button>
                      {bankFile ? (
                        <span className="text-xs text-foreground/70">
                          Selected: {bankFile.name}
                        </span>
                      ) : null}
                    </div>
                    {bankMsg ? (
                      <div className="text-xs text-green-700">{bankMsg}</div>
                    ) : null}
                  </div>

                  <div className="flex justify-end">
                    <Button variant="outline" onClick={() => setShowPaySheet(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* FPS METHOD (DUMMY) */}
              <TabsContent value="FPS" className="mt-4">
                <div className="space-y-3">
                  <div className="rounded-md border p-3">
                    <div className="text-sm font-medium">FPS</div>
                    <FPSForm />
                  </div>
                  <div className="flex justify-end">
                    <Button variant="outline" onClick={() => setShowPaySheet(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* OTHER METHOD (DUMMY) */}
              <TabsContent value="other" className="mt-4">
                <div className="space-y-3">
                  <div className="rounded-md border p-3">
                    <div className="text-sm font-medium">Other Method</div>
                    <p className="text-sm text-foreground/80 mt-1">
                      Additional payment methods will appear here soon.
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="outline" onClick={() => setShowPaySheet(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>
    </div >
  );
}
