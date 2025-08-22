import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type BreakdownLine = {
  label: string;
  qty: number;
  unit: number;
  amount: number;
};

const ceilPairs = (n: number) => (n <= 0 ? 0 : Math.ceil(n / 2));

const USD = (v: number) =>
  v.toLocaleString(undefined, { style: "currency", currency: "USD" });

export default function MemberDirectorManager() {
  const [indivSHAdd, setIndivSHAdd] = React.useState<number>(1);
  const [corpSHAdd, setCorpSHAdd] = React.useState<number>(1);
  const [indivDirAdd, setIndivDirAdd] = React.useState<number>(0);
  const [corpDirAdd, setCorpDirAdd] = React.useState<number>(0);
  const [indivDirRemove, setIndivDirRemove] = React.useState<number>(0);
  const [corpDirRemove, setCorpDirRemove] = React.useState<number>(0);

  // RATES (from your table)
  const R = {
    // Adding – shareholders
    indivShKycPer2: 65,
    indivShHandlingPer2: 260,
    corpShKycPer1: 130,
    corpShHandlingPer1: 260,
    // Adding – directors (KYC only)
    indivDirKycPer2: 75,
    corpDirKycPer1: 130,
    // Removing – directors (flat handling)
    indivDirRemovePer2: 55,
    corpDirRemovePer1: 100,
  };

  const lines: BreakdownLine[] = [];

  // Add individual shareholders
  const shIndivPairs = ceilPairs(indivSHAdd);
  if (shIndivPairs > 0) {
    lines.push({
      label: "KYC — new individual shareholder(s) (per 2)",
      qty: shIndivPairs,
      unit: R.indivShKycPer2,
      amount: shIndivPairs * R.indivShKycPer2,
    });
    lines.push({
      label: "Handling fee — new individual shareholder(s) (per 2)",
      qty: shIndivPairs,
      unit: R.indivShHandlingPer2,
      amount: shIndivPairs * R.indivShHandlingPer2,
    });
  }

  // Add corporate shareholders
  if (corpSHAdd > 0) {
    lines.push({
      label: "KYC — new corporate shareholder(s) (per 1)",
      qty: corpSHAdd,
      unit: R.corpShKycPer1,
      amount: corpSHAdd * R.corpShKycPer1,
    });
    lines.push({
      label: "Handling fee — new corporate shareholder(s) (per 1)",
      qty: corpSHAdd,
      unit: R.corpShHandlingPer1,
      amount: corpSHAdd * R.corpShHandlingPer1,
    });
  }

  // Add directors (KYC only)
  const dirIndivPairs = ceilPairs(indivDirAdd);
  if (dirIndivPairs > 0) {
    lines.push({
      label: "KYC — new individual director(s) (per 2)",
      qty: dirIndivPairs,
      unit: R.indivDirKycPer2,
      amount: dirIndivPairs * R.indivDirKycPer2,
    });
  }
  if (corpDirAdd > 0) {
    lines.push({
      label: "KYC — new corporate director(s) (per 1)",
      qty: corpDirAdd,
      unit: R.corpDirKycPer1,
      amount: corpDirAdd * R.corpDirKycPer1,
    });
  }

  // Remove directors
  const dirRmIndivPairs = ceilPairs(indivDirRemove);
  if (dirRmIndivPairs > 0) {
    lines.push({
      label: "Handling fee — remove individual director(s) (per 2)",
      qty: dirRmIndivPairs,
      unit: R.indivDirRemovePer2,
      amount: dirRmIndivPairs * R.indivDirRemovePer2,
    });
  }
  if (corpDirRemove > 0) {
    lines.push({
      label: "Handling fee — remove corporate director(s) (per 1)",
      qty: corpDirRemove,
      unit: R.corpDirRemovePer1,
      amount: corpDirRemove * R.corpDirRemovePer1,
    });
  }

  const total = lines.reduce((s, l) => s + l.amount, 0);

  const reset = () => {
    setIndivSHAdd(0);
    setCorpSHAdd(0);
    setIndivDirAdd(0);
    setCorpDirAdd(0);
    setIndivDirRemove(0);
    setCorpDirRemove(0);
  };

  // Quick scenario helpers (mirroring the screenshot ideas)
  const applyScenario = (s: number) => {
    // Define a few handy presets
    if (s === 1) {
      // Appoint 2 individual shareholder-directors
      setIndivSHAdd(2);
      setCorpSHAdd(0);
      setIndivDirAdd(2);
      setCorpDirAdd(0);
      setIndivDirRemove(0);
      setCorpDirRemove(0);
    } else if (s === 2) {
      // Appoint 1 corporate shareholder
      setIndivSHAdd(0);
      setCorpSHAdd(1);
      setIndivDirAdd(0);
      setCorpDirAdd(0);
      setIndivDirRemove(0);
      setCorpDirRemove(0);
    } else if (s === 3) {
      // Add 2 individual shareholder-directors & remove 2 individual directors
      setIndivSHAdd(2);
      setCorpSHAdd(0);
      setIndivDirAdd(2);
      setCorpDirAdd(0);
      setIndivDirRemove(2);
      setCorpDirRemove(0);
    } else if (s === 4) {
      // Add 2 individual SH+DIR + 1 corporate SH, remove 2 individual DIR
      setIndivSHAdd(2);
      setCorpSHAdd(1);
      setIndivDirAdd(2);
      setCorpDirAdd(0);
      setIndivDirRemove(2);
      setCorpDirRemove(0);
    }
  };

  const NumberBox = ({
    id,
    label,
    value,
    setValue,
    hint,
  }: {
    id: string;
    label: string;
    value: number;
    setValue: (v: number) => void;
    hint?: string;
  }) => (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm">
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        min={0}
        inputMode="numeric"
        value={isNaN(value) ? 0 : value}
        onChange={(e) => setValue(Math.max(0, parseInt(e.target.value || "0")))}
        className="bg-white/70 border-slate-200 focus-visible:ring-sky-300"
      />
      {hint ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );

  return (
    <div className="w-full mx-auto max-w-5xl p-3 md:p-6">
      {/* Header */}
      <Card className="border-sky-100 bg-sky-50/60">
        <CardHeader className="p-4">
          <CardTitle className="text-lg md:text-xl">
            Hong Kong — Shareholder / Director Changes
          </CardTitle>
          <p className="text-xs text-slate-600 mt-1">
            Individuals are charged per every <strong>2 persons</strong>;
            corporates per every <strong>1 entity</strong>. If a person becomes
            both shareholder and director, count them in both sections.
          </p>
        </CardHeader>
      </Card>

      {/* Inputs */}
      <div className="grid grid-cols-1 gap-4 md:gap-6 mt-4">
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Inputs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl bg-sky-50/70 p-4 border border-sky-100">
                <p className="font-medium mb-3">Add Shareholders</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <NumberBox
                    id="add-indiv-sh"
                    label="Individuals to add (shareholder — individual)"
                    value={indivSHAdd}
                    setValue={setIndivSHAdd}
                    hint="Charged per 2 individuals"
                  />
                  <NumberBox
                    id="add-corp-sh"
                    label="Corporates to add (shareholder — corporate)"
                    value={corpSHAdd}
                    setValue={setCorpSHAdd}
                    hint="Charged per 1 corporate"
                  />
                </div>
              </div>

              <div className="rounded-xl bg-emerald-50/70 p-4 border border-emerald-100">
                <p className="font-medium mb-3">Add Directors</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <NumberBox
                    id="add-indiv-dir"
                    label="Individuals to add (director — individual)"
                    value={indivDirAdd}
                    setValue={setIndivDirAdd}
                    hint="KYC only, per 2 individuals"
                  />
                  <NumberBox
                    id="add-corp-dir"
                    label="Corporates to add (director — corporate)"
                    value={corpDirAdd}
                    setValue={setCorpDirAdd}
                    hint="KYC only, per 1 corporate"
                  />
                </div>
              </div>

              <div className="rounded-xl bg-amber-50/70 p-4 border border-amber-100 md:col-span-2">
                <p className="font-medium mb-3">Remove Directors</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <NumberBox
                    id="rm-indiv-dir"
                    label="Individuals to remove (director — individual)"
                    value={indivDirRemove}
                    setValue={setIndivDirRemove}
                    hint="Handling fee per 2 individuals"
                  />
                  <NumberBox
                    id="rm-corp-dir"
                    label="Corporates to remove (director — corporate)"
                    value={corpDirRemove}
                    setValue={setCorpDirRemove}
                    hint="Handling fee per 1 corporate"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={reset}
                className="border border-slate-200"
              >
                Reset
              </Button>
              <Button
                onClick={() => window.print()}
                className="bg-sky-600 hover:bg-sky-700"
              >
                Print / Save PDF
              </Button>
              <div className="ml-auto">
                <Badge className="bg-sky-100 text-sky-800 hover:bg-sky-100">
                  USD
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>       

        {/* Invoice Breakdown */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Invoice Breakdown</CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              Individuals billed per 2; corporates billed per 1.
            </p>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl overflow-hidden border border-slate-200">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-[55%]">Description</TableHead>
                    <TableHead className="text-right w-[10%]">Qty</TableHead>
                    <TableHead className="text-right w-[15%]">Unit</TableHead>
                    <TableHead className="text-right w-[20%]">
                      Amount (USD)
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lines.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        No items yet. Enter quantities above or use a quick
                        scenario.
                      </TableCell>
                    </TableRow>
                  ) : (
                    lines.map((l, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-slate-700">{l.label}</TableCell>
                        <TableCell className="text-right">{l.qty}</TableCell>
                        <TableCell className="text-right">{USD(l.unit)}</TableCell>
                        <TableCell className="text-right font-medium">
                          {USD(l.amount)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <Separator className="my-4" />
            <div className="flex items-center justify-end">
              <div className="text-right">
                <div className="text-sm text-slate-500">Total</div>
                <div className="text-2xl font-semibold text-slate-900">
                  {USD(total)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

         {/* Quick Scenarios */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Quick scenarios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => applyScenario(1)}>
                Scenario 1
              </Button>
              <Button variant="outline" onClick={() => applyScenario(2)}>
                Scenario 2
              </Button>
              <Button variant="outline" onClick={() => applyScenario(3)}>
                Scenario 3
              </Button>
              <Button variant="outline" onClick={() => applyScenario(4)}>
                Scenario 4
              </Button>
            </div>
            <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1.5">
              <li>
                <strong>Scenario 1:</strong> Appoint 2 individual
                shareholder‑directors.
              </li>
              <li>
                <strong>Scenario 2:</strong> Appoint 1 corporate shareholder.
              </li>
              <li>
                <strong>Scenario 3:</strong> Appoint 2 individual
                shareholder‑directors and remove 2 individual directors.
              </li>
              <li>
                <strong>Scenario 4:</strong> Appoint 2 individual
                shareholder‑directors + 1 corporate shareholder, and remove 2
                individual directors.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
