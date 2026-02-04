/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAtom } from 'jotai';
import { costaRicaFormAtom } from './costaState';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Building2, FileText, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "@/hooks/use-toast";
import {
  createInvoicePaymentIntent,
  updateCorporateInvoicePaymentIntent,
  uploadIncorpoPaymentBankProof
} from '../NewHKForm/hkIncorpo';

// --- Constants & Types ---
const STRIPE_CLIENT_ID = import.meta.env.VITE_STRIPE_DETAILS || process.env.REACT_APP_STRIPE_DETAILS;
const stripePromise = loadStripe(STRIPE_CLIENT_ID);

const BASE_SETUP_FEE = 4500;
const NOMINEE_FEE = 2500;

interface StripeSuccessInfo {
  receiptUrl?: string;
  amount?: number;
  currency?: string;
  paymentIntentStatus?: string;
}

// --- Helpers ---
function computeGrandTotal(formData: Record<string, any>): number {
  const base = BASE_SETUP_FEE;
  const directors = formData.directorNominee ? NOMINEE_FEE : 0;
  const shareholders = formData.shareholderNominee ? NOMINEE_FEE : 0;
  const subtotalUsb = base + directors + shareholders;

  // Use paymentCurrency from InvoiceStep as the source of truth
  const currency = formData.paymentCurrency || 'USD';

  let subtotal = subtotalUsb;
  if (currency === 'HKD' && formData.convertedAmountHkd) {
    subtotal = Number(formData.convertedAmountHkd);
  }

  const cardFeeRate = String(currency).toUpperCase() === 'USD' ? 0.06 : 0.04;
  const needsCardFee = formData.payMethod === 'card';

  const total = needsCardFee ? subtotal * (1 + cardFeeRate) : subtotal;
  return Math.round(total * 100) / 100;
}

function formatRemaining(ms: number): string {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return d > 0
    ? `${d}d ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    : `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

// --- Sub-components ---

function StripePaymentForm({ app, onSuccess, onClose }: {
  app: any;
  onSuccess: (info: StripeSuccessInfo) => void;
  onClose: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successPayload, setSuccessPayload] = useState<StripeSuccessInfo | null>(null);
  const [processingMsg, setProcessingMsg] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);
    setSuccessPayload(null);
    setProcessingMsg(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: typeof window !== "undefined" ? window.location.href : "",
        },
        redirect: "if_required",
      });

      if (error) {
        setError(error.message ?? "Payment failed. Please try again.");
        setSubmitting(false);
        return;
      }

      const status = paymentIntent?.status;

      const notifyBackend = async () => {
        try {
          const result = await updateCorporateInvoicePaymentIntent({
            paymentIntentId: app.paymentIntentId,
            companyId: app._id,
            companyName: app.companyName_1 || app.companyName_2 || "Costa Rica Company",
            userEmail: app.email,
            country: "CR", // Costa Rica code
          });

          if (result?.ok) {
            const payload: StripeSuccessInfo = {
              receiptUrl: result?.receiptUrl,
              amount: result?.amount,
              currency: result?.currency,
              paymentIntentStatus: result?.paymentIntentStatus,
            };

            if (result?.paymentIntentStatus === "succeeded") {
              setSuccessPayload(payload);
              onSuccess(payload);
              setSubmitting(false);
              return;
            }

            if (result?.paymentIntentStatus === "processing" || result?.paymentIntentStatus === "requires_capture") {
              setProcessingMsg("Your payment is processing. You’ll receive a receipt once the transaction is confirmed.");
              onSuccess(payload);
              setSubmitting(false);
              return;
            }
          }

          setError("Payment confirmed, but we couldn’t retrieve the receipt from the server.");
          setSubmitting(false);
        } catch (e: any) {
          console.error("Failed to notify backend:", e);
          setError("Payment confirmed, but saving the payment on the server failed.");
          setSubmitting(false);
        }
      };

      if (status === "succeeded" || status === "processing" || status === "requires_capture") {
        await notifyBackend();
      } else {
        setError(`Payment status: ${status ?? "unknown"}. If this persists, contact support.`);
        setSubmitting(false);
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Something went wrong while confirming payment.");
      setSubmitting(false);
    }
  };

  if (successPayload) {
    const amt = typeof successPayload.amount === "number" ? successPayload.amount : undefined;
    const currency = successPayload.currency ? successPayload.currency.toUpperCase() : undefined;
    return (
      <div className="space-y-4">
        <div className="border rounded-md p-3 text-sm bg-emerald-50 border-emerald-200 text-emerald-900">
          <div className="font-semibold mb-1">Payment successful</div>
          <div className="space-y-1">
            {amt != null && currency && (
              <div>Amount: <b>{currency} {(amt / 100).toFixed(2)}</b></div>
            )}
            {successPayload.receiptUrl && (
              <div>
                Receipt: <a href={successPayload.receiptUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">View Stripe receipt</a>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end">
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    );
  }

  if (processingMsg) {
    return (
      <div className="space-y-4">
        <div className="border rounded-md p-3 text-sm bg-amber-50 border-amber-200 text-amber-900">
          <div className="font-semibold mb-1">Payment is processing</div>
          <div>{processingMsg}</div>
        </div>
        <div className="flex items-center justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PaymentElement />
      {error && (
        <div className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-2">
          {error}
        </div>
      )}
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button onClick={handleConfirm} disabled={!stripe || !elements || submitting}>
          {submitting ? "Processing…" : "Pay now"}
        </Button>
      </div>
    </div>
  );
}

function StripeCardDrawer({ open, onOpenChange, clientSecret, amount, app, onSuccess }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  clientSecret: string;
  amount: number;
  app: any;
  onSuccess: (info: StripeSuccessInfo) => void;
}) {
  const options = useMemo(() => ({
    clientSecret,
    appearance: { theme: "stripe" as const },
  }), [clientSecret]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Stripe Card Payment</SheetTitle>
          <SheetDescription>
            Grand Total: {app.stripeCurrency ?? "USD"} <b>{amount.toFixed(2)}</b>
            {app.stripeCurrency === 'USD' ? ' (incl. 6% fee)' : ' (incl. 4% fee)'}
          </SheetDescription>
        </SheetHeader>
        {clientSecret ? (
          <div className="mt-4">
            <Elements stripe={stripePromise} options={options}>
              <StripePaymentForm app={app} onSuccess={onSuccess} onClose={() => onOpenChange(false)} />
            </Elements>
          </div>
        ) : (
          <div className="mt-4 text-sm text-muted-foreground">Preparing secure payment…</div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export const PaymentStep = () => {
  const [formData, setFormData] = useAtom(costaRicaFormAtom);

  const grandTotal = useMemo(() => computeGrandTotal(formData), [formData]);
  const isPaid = formData.paymentStatus === 'paid';

  // Expiry bootstrap
  useEffect(() => {
    if (isPaid) return;
    const now = Date.now();
    const current = formData.expiresAt ? new Date(formData.expiresAt as string).getTime() : 0;
    if (!current || current <= now) {
      const twoDaysMs = 2 * 24 * 60 * 60 * 1000;
      const expiryISO = new Date(now + twoDaysMs).toISOString();
      setFormData((prev: any) => ({
        ...prev,
        expiresAt: expiryISO,
        payMethod: prev.payMethod || 'card',
        stripeCurrency: prev.paymentCurrency || 'USD',
      }));
    }
  }, [isPaid, setFormData, formData.expiresAt, formData.paymentCurrency]);

  // Countdown
  const [nowTs, setNowTs] = useState(() => Date.now());
  useEffect(() => {
    if (isPaid) return;
    const id = window.setInterval(() => setNowTs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [isPaid]);

  // Sync stripeCurrency with paymentCurrency from InvoiceStep
  // DEPRECATED INTENTIONALLY: We now use formData.paymentCurrency directly.
  // Kept empty/removed to avoid conflicts.



  const expiresTs = formData.expiresAt ? new Date(formData.expiresAt as string).getTime() : 0;
  const remainingMs = Math.max(0, expiresTs - nowTs);
  const isExpired = !isPaid && (!expiresTs || remainingMs <= 0);

  // Local state
  const [bankFile, setBankFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [creatingPI, setCreatingPI] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [cardDrawerOpen, setCardDrawerOpen] = useState(false);

  const handlePayMethodChange = (value: string) => {
    if (isPaid || isExpired) return;
    setFormData((prev: any) => ({ ...prev, payMethod: value }));
  };

  const handleBankProofUpload = async () => {
    if (!bankFile || isPaid || isExpired) return;
    setUploading(true);
    try {
      const expiresAt = formData.expiresAt as string || "";
      const result = await uploadIncorpoPaymentBankProof(
        formData._id as string || "",
        "CR",
        bankFile,
        formData.payMethod as string || 'bank',
        expiresAt
      );
      if (result) {
        setFormData((prev: any) => ({ ...prev, uploadReceiptUrl: result.url, bankProofUploaded: 'true' }));
        toast({ title: "Success", description: "Payment proof uploaded." });
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Upload failed.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleProceedCard = async () => {
    if (isPaid || isExpired) {
      alert("Quote expired or already paid.");
      return;
    }

    if (clientSecret && formData.paymentIntentId) {
      setCardDrawerOpen(true);
      return;
    }

    setCreatingPI(true);
    try {
      const usedCurrency = formData.paymentCurrency || "USD";
      const result = await createInvoicePaymentIntent({
        companyId: formData._id || null, // Ensure ID exists
        totalCents: Math.round(grandTotal * 100),
        country: "CR",
        currency: usedCurrency,
      });

      if (result?.clientSecret && result?.id) {
        setClientSecret(result.clientSecret);
        setFormData((prev: any) => ({
          ...prev,
          paymentIntentId: result.id,
          payMethod: "card",
          paymentIntentCurrency: usedCurrency,
          stripeCurrency: usedCurrency, // Keep in sync just in case
        }));
        setCardDrawerOpen(true);
      } else {
        toast({ title: "Error", description: "Could not initialize payment.", variant: "destructive" });
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Payment Initialization Failed", variant: "destructive" });
    } finally {
      setCreatingPI(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-xl font-semibold text-foreground">Payment Selection</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Select your preferred payment method for the establishment fee.
        </p>
      </div>

      {/* Success Banner */}
      {isPaid && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 mb-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div>
              <div className="font-semibold text-green-900">Payment Successful</div>
              <p className="text-sm text-green-700">Your payment has been received. Thank you!</p>
            </div>
          </div>
        </div>
      )}

      {/* Countdown */}
      {!isPaid && (
        <div className={cn('rounded-lg border p-4 mb-4', isExpired ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50')}>
          {isExpired ? (
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div className="font-medium text-red-900">Quote expired. Contact support.</div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-600" />
                <span className="font-medium text-amber-900">Quote expires in:</span>
              </div>
              <div className="text-lg font-bold tabular-nums text-amber-900">
                {formatRemaining(remainingMs)}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Method Selection */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="font-semibold text-foreground">Select Payment Method</div>
            <RadioGroup value={formData.payMethod as string || 'card'} onValueChange={handlePayMethodChange} disabled={isPaid || isExpired} className="space-y-3">
              <label className={cn('flex items-start gap-3 p-4 rounded-lg border cursor-pointer', formData.payMethod === 'card' ? 'border-primary bg-sidebar-accent' : 'border-input')}>
                <RadioGroupItem value="card" className="mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-primary" />
                    <span className="font-medium">Card Payment</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Secure payment via Stripe</p>
                </div>
              </label>
              <label className={cn('flex items-start gap-3 p-4 rounded-lg border cursor-pointer', formData.payMethod === 'bank' ? 'border-primary bg-sidebar-accent' : 'border-input')}>
                <RadioGroupItem value="bank" className="mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    <span className="font-medium">Bank Transfer</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Wire transfer to our account</p>
                </div>
              </label>
              <label className={cn('flex items-start gap-3 p-4 rounded-lg border cursor-pointer', formData.payMethod === 'other' ? 'border-primary bg-sidebar-accent' : 'border-input')}>
                <RadioGroupItem value="other" className="mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="font-medium">Other</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Alternative options</p>
                </div>
              </label>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="font-semibold text-foreground">Payment Details</div>

            {/* Bank/Other Upload */}
            {(formData.payMethod === 'bank' || formData.payMethod === 'other') && !isPaid && (
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Reference Number</Label>
                  <Input
                    placeholder="Transaction Ref"
                    value={formData.bankRef as string || ''}
                    onChange={e => setFormData((p: any) => ({ ...p, bankRef: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Upload Proof</Label>
                  <Input type="file" onChange={e => setBankFile(e.target.files?.[0] || null)} />
                  <Button onClick={handleBankProofUpload} disabled={!bankFile || uploading} className="w-full">
                    {uploading ? "Uploading..." : "Submit Proof"}
                  </Button>
                </div>
                {formData.uploadReceiptUrl && (
                  <div className="text-sm text-green-600 font-medium">✓ Proof Uploaded</div>
                )}
              </div>
            )}

            {/* Card Actions */}
            {formData.payMethod === 'card' && !isPaid && (
              <div className="space-y-4 pt-4 border-t">
                <Button onClick={handleProceedCard} className="w-full" disabled={creatingPI}>
                  {creatingPI ? "Initializing..." : "Proceed to Payment"}
                </Button>
              </div>
            )}

            <div className="pt-4 border-t mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formData.paymentCurrency || 'USD'} {((grandTotal / (1 + (formData.payMethod === 'card' ? ((formData.paymentCurrency === 'hkd' || formData.paymentCurrency === 'HKD' ? 0.04 : 0.06)) : 0)))).toFixed(2)}</span>
              </div>
              {formData.payMethod === 'card' && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Card Fee ({(String(formData.paymentCurrency).toUpperCase() == 'USD' ? '6%' : '4%')})</span>
                  <span>{formData.paymentCurrency || 'USD'} {(grandTotal - (grandTotal / (1 + (String(formData.paymentCurrency).toUpperCase() === 'USD' ? 0.06 : 0.04)))).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Grand Total</span>
                <span className="text-primary">{formData.paymentCurrency || 'USD'} {grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stripe Drawer */}
      {clientSecret && !isPaid && (
        <StripeCardDrawer
          open={cardDrawerOpen}
          onOpenChange={setCardDrawerOpen}
          clientSecret={clientSecret}
          amount={grandTotal}
          app={formData}
          onSuccess={(info) => {
            setFormData((prev: any) => ({
              ...prev,
              paymentStatus: 'paid',
              stripeLastStatus: info.paymentIntentStatus,
              stripeReceiptUrl: info.receiptUrl,
              stripeAmountCents: info.amount,
              stripeCurrency: info.currency
            }));
            setCardDrawerOpen(false);
          }}
        />
      )}
    </div>
  );
};
