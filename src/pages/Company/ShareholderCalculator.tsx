import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Calculator, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Row = {
  id: string;
  name: string;
  shares: number | "";
  pricePerShare: number | "";
};

type ShareholderCalculatorProps = {
  show: boolean; // control visibility via currentSection === 3
};

export default function ShareholderCalculator({ show }: ShareholderCalculatorProps) {
  const [open, setOpen] = React.useState<boolean>(false);
  const [rows, setRows] = React.useState<Row[]>([
    { id: crypto.randomUUID(), name: "Shareholder A", shares: 100, pricePerShare: 1 },
    { id: crypto.randomUUID(), name: "Shareholder B", shares: 100, pricePerShare: 1 },
  ]);

  React.useEffect(() => {
    // Auto-open on first time when section 3 is reached (optional)
    if (show && !open) setOpen(false); // keep closed by default; toggle via bubble
  }, [show, open]);

  const totalShares = rows.reduce((acc, r) => acc + (Number(r.shares) || 0), 0);
  const totalInvest = rows.reduce(
    (acc, r) => acc + (Number(r.shares) || 0) * (Number(r.pricePerShare) || 0),
    0
  );

  const updateRow = (id: string, key: keyof Row, value: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              [key]:
                key === "shares" || key === "pricePerShare"
                  ? (value === "" ? "" : Number(value))
                  : value,
            }
          : r
      )
    );
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: `Shareholder ${String.fromCharCode(65 + prev.length)}`, shares: 0, pricePerShare: 1 },
    ]);
  };

  const removeRow = (id: string) => {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  };

  // Small helper for percentage formatting
  const fmtPct = (num: number) => (isFinite(num) ? `${(num * 100).toFixed(2)}%` : "—");

  // Hidden entirely if not section 3
  if (!show) return null;

  return (
    <>
      {/* Floating bubble button */}
      <div className="fixed bottom-20 right-4 z-40 md:bottom-6">
        <Button
          size="sm"
          className="shadow-lg rounded-full px-3 py-2 md:px-4 md:py-2"
          onClick={() => setOpen((v) => !v)}
        >
          <Calculator className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Shareholder Calc</span>
        </Button>
      </div>

      {/* Slide-up panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className={cn(
              "fixed z-50 left-2 right-2 bottom-2 sm:left-auto sm:right-4",
              "sm:w-[420px]"
            )}
          >
            <Card className="shadow-2xl border rounded-2xl">
              <CardHeader className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm md:text-base">Shareholder Calculator</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setOpen(false)}
                    aria-label="Close calculator"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="px-3 md:px-4 pb-2">
                <div className="max-h-[46vh] overflow-y-auto pr-1 space-y-3">
                  {rows.map((r, idx) => {
                    const pct = totalShares ? (Number(r.shares) || 0) / totalShares : 0;
                    const invested =
                      (Number(r.shares) || 0) * (Number(r.pricePerShare) || 0);

                    return (
                      <div
                        key={r.id}
                        className="rounded-xl border p-3 space-y-2 bg-muted/30"
                      >
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Holder #{idx + 1}</Label>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-muted-foreground">
                              {fmtPct(pct)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => removeRow(r.id)}
                              aria-label="Remove"
                              disabled={rows.length === 1}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div className="col-span-1 sm:col-span-3">
                            <Label htmlFor={`name-${r.id}`} className="text-xs">
                              Name
                            </Label>
                            <Input
                              id={`name-${r.id}`}
                              value={r.name}
                              onChange={(e) => updateRow(r.id, "name", e.target.value)}
                              placeholder="Shareholder name"
                              className="h-8 text-xs"
                            />
                          </div>

                          <div>
                            <Label htmlFor={`shares-${r.id}`} className="text-xs">
                              Shares
                            </Label>
                            <Input
                              id={`shares-${r.id}`}
                              type="number"
                              inputMode="numeric"
                              min={0}
                              value={r.shares}
                              onChange={(e) => updateRow(r.id, "shares", e.target.value)}
                              className="h-8 text-xs"
                            />
                          </div>

                          <div>
                            <Label htmlFor={`price-${r.id}`} className="text-xs">
                              Price/Share
                            </Label>
                            <Input
                              id={`price-${r.id}`}
                              type="number"
                              inputMode="decimal"
                              min={0}
                              step="0.01"
                              value={r.pricePerShare}
                              onChange={(e) =>
                                updateRow(r.id, "pricePerShare", e.target.value)
                              }
                              className="h-8 text-xs"
                            />
                          </div>

                          <div className="flex flex-col justify-end">
                            <Label className="text-xs">Invested</Label>
                            <div className="h-8 text-xs flex items-center rounded-md border px-2 bg-background">
                              {isFinite(invested) ? invested.toLocaleString() : "—"}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <Button onClick={addRow} variant="outline" size="sm" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add shareholder
                  </Button>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg border p-2 bg-muted/20">
                    <div className="text-muted-foreground">Total Shares</div>
                    <div className="font-medium">{totalShares.toLocaleString()}</div>
                  </div>
                  <div className="rounded-lg border p-2 bg-muted/20">
                    <div className="text-muted-foreground">Total Investment</div>
                    <div className="font-medium">{totalInvest.toLocaleString()}</div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="px-3 md:px-4 pb-3">
                <div className="w-full space-y-2">
                  <div className="text-[11px] text-muted-foreground">
                    Tip: Ownership % = shares / total shares. Adjust “Shares” for each
                    holder to simulate cap table results.
                  </div>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
