import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

type Line = { label: string; qty: number; unit: number; amount: number };

const ceilPairs = (n: number) => (n <= 0 ? 0 : Math.ceil(n / 2));
const USD = (v: number) =>
  v.toLocaleString(undefined, { style: "currency", currency: "USD" });

export default function MemberDirectorManager({
  className = "",
}: {
  className?: string;
}) {
  // Inputs
  const [indivSHAdd, setIndivSHAdd] = React.useState(1);
  const [corpSHAdd, setCorpSHAdd] = React.useState(1);
  const [indivDirAdd, setIndivDirAdd] = React.useState(0);
  const [corpDirAdd, setCorpDirAdd] = React.useState(0);
  const [indivDirRemove, setIndivDirRemove] = React.useState(0);
  const [corpDirRemove, setCorpDirRemove] = React.useState(0);

  // Rates
  const R = {
    indivShKycPer2: 65,
    indivShHandlingPer2: 260,
    corpShKycPer1: 130,
    corpShHandlingPer1: 260,
    indivDirKycPer2: 75,
    corpDirKycPer1: 130,
    indivDirRemovePer2: 55,
    corpDirRemovePer1: 100,
  };

  // Build lines
  const lines: Line[] = [];
  const shIndivPairs = ceilPairs(indivSHAdd);
  if (shIndivPairs > 0) {
    lines.push({
      label: "KYC — new individual shareholder(s) (per 2)",
      qty: shIndivPairs,
      unit: R.indivShKycPer2,
      amount: shIndivPairs * R.indivShKycPer2,
    });
    lines.push({
      label: "Handling — new individual shareholder(s) (per 2)",
      qty: shIndivPairs,
      unit: R.indivShHandlingPer2,
      amount: shIndivPairs * R.indivShHandlingPer2,
    });
  }
  if (corpSHAdd > 0) {
    lines.push({
      label: "KYC — new corporate shareholder(s) (per 1)",
      qty: corpSHAdd,
      unit: R.corpShKycPer1,
      amount: corpSHAdd * R.corpShKycPer1,
    });
    lines.push({
      label: "Handling — new corporate shareholder(s) (per 1)",
      qty: corpSHAdd,
      unit: R.corpShHandlingPer1,
      amount: corpSHAdd * R.corpShHandlingPer1,
    });
  }
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
  const dirRmIndivPairs = ceilPairs(indivDirRemove);
  if (dirRmIndivPairs > 0) {
    lines.push({
      label: "Handling — remove individual director(s) (per 2)",
      qty: dirRmIndivPairs,
      unit: R.indivDirRemovePer2,
      amount: dirRmIndivPairs * R.indivDirRemovePer2,
    });
  }
  if (corpDirRemove > 0) {
    lines.push({
      label: "Handling — remove corporate director(s) (per 1)",
      qty: corpDirRemove,
      unit: R.corpDirRemovePer1,
      amount: corpDirRemove * R.corpDirRemovePer1,
    });
  }

  const total = lines.reduce((s, l) => s + l.amount, 0);

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

  const Field = ({
    id,
    label,
    value,
    onChange,
    hint,
  }: {
    id: string;
    label: string;
    value: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    hint?: string;
  }) => (
    <div className="grid gap-1">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-xs leading-none">
          {label}
        </Label>
        {hint ? (
          <span className="text-[11px] text-muted-foreground">{hint}</span>
        ) : null}
      </div>
      <Input
        id={id}
        type="number"
        min={0}
        value={isNaN(value) ? 0 : value}
        onChange={onChange}
        className="h-8 px-2 text-sm"
      />
    </div>
  );

  return (
    <div
      className={[
        // container sizing with minimal outer gap on large screens
        "w-full mx-auto",
        "px-2 sm:px-3 lg:px-4", // gentle, compact gutters
        "max-w-screen-2xl", // fills wide screens without giant margins
        className,
      ].join(" ")}
    >
      <Card className="border shadow-sm">
        {/* Toolbar-like header (compact) */}
        <CardHeader className="p-2 sm:p-3">
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm sm:text-base">
                Hong Kong — Shareholder / Director Changes
              </CardTitle>
              <Badge variant="outline" className="h-5 px-2 text-[11px]">
                USD
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={reset}>
                Reset
              </Button>
              <Button size="sm" onClick={() => window.print()}>
                Print / Save PDF
              </Button>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Individuals billed per <b>2</b>; corporates per <b>1</b>. Count the same
            person in both sections if they are both shareholder and director.
          </p>
        </CardHeader>

        <CardContent className="p-2 sm:p-3">
          {/* Inputs Grid – dense, 12-col responsive like spreadsheets */}
          <div className="grid grid-cols-12 gap-2">
            {/* Add Shareholders */}
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

            {/* Add Directors */}
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

            {/* Remove Directors */}
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
                {/* Quick presets on larger screens sit inline; stack on mobile */}
                <div className="col-span-2 flex flex-wrap items-end gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIndivSHAdd(2);
                      setCorpSHAdd(0);
                      setIndivDirAdd(2);
                      setCorpDirAdd(0);
                      setIndivDirRemove(0);
                      setCorpDirRemove(0);
                    }}
                  >
                    +2 indiv SH+DIR
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIndivSHAdd(0);
                      setCorpSHAdd(1);
                      setIndivDirAdd(0);
                      setCorpDirAdd(0);
                      setIndivDirRemove(0);
                      setCorpDirRemove(0);
                    }}
                  >
                    +1 corp SH
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIndivSHAdd(2);
                      setCorpSHAdd(0);
                      setIndivDirAdd(2);
                      setCorpDirAdd(0);
                      setIndivDirRemove(2);
                      setCorpDirRemove(0);
                    }}
                  >
                    +2 indiv SH+DIR / −2 indiv DIR
                  </Button>
                </div>
              </div>
            </section>
          </div>

          <Separator className="my-3" />

          {/* Invoice – compact, responsive, with sticky total */}
          <div className="rounded-md border overflow-hidden">
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
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Enter quantities above or use a preset.
                    </TableCell>
                  </TableRow>
                ) : (
                  lines.map((l, i) => (
                    <TableRow key={i} className="h-8">
                      <TableCell className="py-1">{l.label}</TableCell>
                      <TableCell className="py-1 text-right">{l.qty}</TableCell>
                      <TableCell className="py-1 text-right">{USD(l.unit)}</TableCell>
                      <TableCell className="py-1 text-right font-medium">
                        {USD(l.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
                <TableRow className="h-12 font-semibold sticky bottom-0 bg-background">
                  <TableCell colSpan={3} className="text-right">
                    Total
                  </TableCell>
                  <TableCell className="text-right">{USD(total)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
