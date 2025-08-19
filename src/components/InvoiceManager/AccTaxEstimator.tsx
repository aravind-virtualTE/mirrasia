import { useMemo, useState } from "react";

const REVENUE_BRACKETS = [
  { key: "le2m", label: "≤ HK$2M", min: 0, max: 2_000_000 },
  { key: "2to5m", label: "HK$2M–HK$5M", min: 2_000_000, max: 5_000_000 },
  { key: "5to10m", label: "HK$5M–HK$10M", min: 5_000_000, max: 10_000_000 },
  { key: "10to20m", label: "HK$10M–HK$20M", min: 10_000_000, max: 20_000_000 },
  { key: "20to30m", label: "HK$20M–HK$30M", min: 20_000_000, max: 30_000_000 },
  { key: "30to40m", label: "HK$30M–HK$40M", min: 30_000_000, max: 40_000_000 },
] as const;

type RevKey = typeof REVENUE_BRACKETS[number]["key"];

// Transaction brackets (count per year)
const TXN_BRACKETS = [
  { label: "≤ 5", min: 0, max: 5 },
  { label: "6–10", min: 6, max: 10 },
  { label: "11–20", min: 11, max: 20 },
  { label: "21–50", min: 21, max: 50 },
  { label: "51–100", min: 51, max: 100 },
  { label: "101–200", min: 101, max: 200 },
  { label: "201–300", min: 201, max: 300 },
  { label: "301–400", min: 301, max: 400 },
  { label: "401–500", min: 401, max: 500 },
  { label: "501–600", min: 501, max: 600 },
  { label: "601–700", min: 601, max: 700 },
  { label: "701–800", min: 701, max: 800 },
  { label: "801–900", min: 801, max: 900 },
  { label: "901–1000", min: 901, max: 1000 },
] as const;

type TxnIndex = number; // 0..13

/**
 * Price matrix copied from the image (HKD). Rows follow TXN_BRACKETS in order; columns follow REVENUE_BRACKETS.
 */
const PRICES: Record<RevKey, number[]> = {
  le2m:   [6000, 7200, 8640, 10368, 12442, 14930, 17916, 21499, 25799, 27863, 29535, 31307, 33185, 35176],
  "2to5m":  [6900, 8280, 9936, 11923, 14308, 17169, 20603, 24724, 29669, 32042, 33965, 36003, 38163, 40453],
  "5to10m": [7728, 9274, 11128, 13113, 16043, 19230, 23076, 28077, 33229, 35887, 38107, 40734, 42742, 45307],
  "10to20m": [8501, 10201, 12241, 14689, 17627, 21153, 25383, 31860, 36552, 39476, 41845, 44355, 47017, 49838],
  "20to30m": [9011, 10813, 12976, 15571, 18685, 22422, 26906, 32287, 38745, 41845, 44355, 47017, 49838, 52828],
  "30to40m": [9281, 11137, 13365, 16038, 19245, 23095, 27713, 33256, 39907, 43100, 45686, 48427, 51333, 54413],
};

function formatHKD(n?: number) {
  if (n == null || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-HK", { style: "currency", currency: "HKD", maximumFractionDigits: 0 }).format(n);
}

function bucketRevenue(valueHKD: number): RevKey {
  for (const b of REVENUE_BRACKETS) {
    if (valueHKD >= b.min && valueHKD <= b.max) return b.key as RevKey;
  }
  // If above table maximum, clamp to the last bucket (you can expand later)
  return "30to40m";
}

function bucketTxn(count: number): TxnIndex {
  const idx = TXN_BRACKETS.findIndex((b) => count >= b.min && count <= b.max);
  return idx >= 0 ? idx : TXN_BRACKETS.length - 1; // clamp to last row
}

export default function HKAccountingEstimator() {
  const [revenue, setRevenue] = useState<string>("2000000");
  const [txns, setTxns] = useState<string>("60");
  const [showTable, setShowTable] = useState<boolean>(false);

  const result = useMemo(() => {
    const revHKD = Number(revenue || 0);
    const txnCount = Number(txns || 0);
    const revKey = bucketRevenue(revHKD);
    const txnIdx = bucketTxn(txnCount);
    const price = PRICES[revKey][txnIdx];
    const revLabel = REVENUE_BRACKETS.find((r) => r.key === revKey)?.label ?? "";
    const txnLabel = TXN_BRACKETS[txnIdx].label;
    return { price, revKey, revLabel, txnIdx, txnLabel };
  }, [revenue, txns]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Hong Kong Annual Accounting & Tax — Fee Estimator</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Select your company’s annual revenue and total yearly transaction count (sum of purchases & sales).
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border p-4 shadow-sm">
          <label className="text-sm font-medium">Annual revenue (HKD)</label>
          <input
            className="mt-2 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring"
            type="number"
            min={0}
            step={1000}
            value={revenue}
            onChange={(e) => setRevenue(e.target.value)}
            placeholder="e.g., 12,000,000"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Bucketed to: <span className="font-medium">{result.revLabel}</span>
          </p>
        </div>

        <div className="rounded-2xl border p-4 shadow-sm">
          <label className="text-sm font-medium">Total transactions per year</label>
          <input
            className="mt-2 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring"
            type="number"
            min={0}
            step={1}
            value={txns}
            onChange={(e) => setTxns(e.target.value)}
            placeholder="e.g., 120"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Bucketed to: <span className="font-medium">{result.txnLabel}</span>
          </p>
        </div>
      </div>

      {/* Result */}
      <div className="rounded-2xl border p-6 shadow-sm bg-white/50">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Estimated annual fee</div>
            <div className="text-3xl font-bold mt-1">{formatHKD(result.price)}</div>
            <div className="text-xs text-muted-foreground mt-2">
              Based on <span className="font-medium">{result.revLabel}</span> revenue and <span className="font-medium">{result.txnLabel}</span> transactions.
            </div>
          </div>
          <button
            onClick={() => setShowTable((s) => !s)}
            className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
          >
            {showTable ? "Hide full matrix" : "Show full matrix"}
          </button>
        </div>
      </div>

      {/* Matrix */}
      {showTable && (
        <div className="rounded-2xl border overflow-x-auto shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 text-left">Transactions / Revenue</th>
                {REVENUE_BRACKETS.map((r) => (
                  <th key={r.key} className="p-3 text-left whitespace-nowrap">{r.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TXN_BRACKETS.map((row, i) => (
                <tr key={row.label} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                  <td className="p-3 font-medium whitespace-nowrap">{row.label}</td>
                  {REVENUE_BRACKETS.map((r) => (
                    <td key={r.key + i} className="p-3">
                      {formatHKD(PRICES[r.key][i])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Disclaimers */}
      <div className="rounded-2xl border p-4 text-xs leading-relaxed text-muted-foreground bg-white">
        <ul className="list-disc ml-5 space-y-1">
          <li>This is a guideline for typical commercial companies. Final fees follow review of bank statements, invoices, import/export docs, contracts, shipping docs and bookkeeping materials.</li>
          <li>Transaction count means total of purchase & sales entries over the year.</li>
          <li>Fees may differ for group structures (holding/subsidiary companies) beyond a simple single‑entity setup.</li>
          <li>Audit work (by an external auditor) is separate. Additional effort depends on the company’s risk profile and compliance needs.</li>
          <li>Extra charges may apply to complex/regulated sectors (e.g., financial institutions, virtual‑asset related services, FX), unusual transactions, improper/duplicate/fictional invoices, tax‑risky activities, or anything contrary to the law.</li>
        </ul>
      </div>
    </div>
  );
}
