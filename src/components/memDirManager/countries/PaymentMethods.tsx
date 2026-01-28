import * as React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Building2, Wallet, Ellipsis } from "lucide-react";

type CurrencyTotals = {
  subtotal: number;
  fee: number;
  final: number;
  subtotalCents: number;
  feeCents: number;
  finalCents: number;
};

export type PaymentMethod = "card" | "bank" | "FPS" | "other";

export interface PaymentMethodSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "right" | "left" | "bottom" | "top";
  companyName?: string;
  totals: CurrencyTotals;
  /** Called when tab changes (optional) */
  onMethodChange?: (m: PaymentMethod) => void;
  /** Which tab should be selected when the sheet opens (default: "card") */
  defaultMethod?: PaymentMethod;
  /** The Card tab body (render Stripe Elements + your PaymentForm here) */
  renderCardContent: () => React.ReactNode;
  /** Optional extra header title (default: "Choose a payment method") */
  title?: string;
  /** Optional footnote to show under tabs (e.g., support info) */
  footnote?: React.ReactNode;
}

const USD = (v: number) => v.toLocaleString(undefined, { style: "currency", currency: "USD" });

export function PaymentMethodSheet({
  open,
  onOpenChange,
  side = "right",
  companyName,
  totals,
  onMethodChange,
  defaultMethod = "card",
  renderCardContent,
  title = "Choose a payment method",
  footnote,
}: PaymentMethodSheetProps) {
  const [method, setMethod] = React.useState<PaymentMethod>(defaultMethod);

  React.useEffect(() => {
    onMethodChange?.(method);
  }, [method, onMethodChange]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={side} className="w-full lg:max-w-lg">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {companyName ? (
            <p className="text-xs text-foreground/70 mt-1">Company: {companyName}</p>
          ) : null}
        </SheetHeader>

        <div className="mt-4">
          <Tabs value={method} onValueChange={(v) => setMethod(v as PaymentMethod)} className="w-full">
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

            {/* CARD */}
            <TabsContent value="card" className="mt-4">
              {renderCardContent()}
            </TabsContent>

            {/* BANK (dummy) */}
            <TabsContent value="bank" className="mt-4 space-y-3">
              <div className="rounded-md border bg-muted/30 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>Amount due (no card fees)</span>
                  <span className="font-semibold">{USD(totals.subtotal)}</span>
                </div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-sm font-medium">Bank Transfer</div>
                <p className="text-sm text-foreground/80 mt-1">
                  This option will be available soon. Please contact support to receive bank
                  details and a proforma invoice for {USD(totals.subtotal)}.
                </p>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </div>
            </TabsContent>

            {/* FPS (dummy) */}
            <TabsContent value="FPS" className="mt-4 space-y-3">
              <div className="rounded-md border p-3">
                <div className="text-sm font-medium">FPS</div>
                <p className="text-sm text-foreground/80 mt-1">
                  FPS checkout will be added here. For now, please choose Card or contact support.
                </p>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </div>
            </TabsContent>

            {/* OTHER (dummy) */}
            <TabsContent value="other" className="mt-4 space-y-3">
              <div className="rounded-md border p-3">
                <div className="text-sm font-medium">Other Method</div>
                <p className="text-sm text-foreground/80 mt-1">
                  Additional payment methods (e.g., FPS, local wallets) will appear here soon.
                </p>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <Separator className="my-4" />

          {/* Footer: show a compact price summary */}
          <div className="rounded-md border p-3 text-sm">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{USD(totals.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-foreground/70">
              <span>Card fee (if paying by card)</span>
              <span>{USD(totals.fee)}</span>
            </div>
            <div className="flex items-center justify-between font-semibold mt-2">
              <span>Final (Card)</span>
              <span>{USD(totals.final)}</span>
            </div>
          </div>

          {footnote ? <div className="mt-3 text-xs text-foreground/70">{footnote}</div> : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
