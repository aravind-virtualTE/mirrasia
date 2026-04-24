import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCommissions, minorToMajor, type CommissionLedger } from "@/lib/api/referral";

export default function ReferralCommissionsPage() {
  const [items, setItems] = useState<CommissionLedger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getCommissions();
        if (active) setItems(data);
      } catch (err: unknown) {
        if (active) {
          const message = err instanceof Error ? err.message : "Failed to load commissions";
          setError(message);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Commissions</h1>

      {loading && <p className="text-sm text-muted-foreground">Loading commissions...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Commission Ledger</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2">Company</th>
                  <th className="py-2">Referrer</th>
                  <th className="py-2">Referred User</th>
                  <th className="py-2">Base</th>
                  <th className="py-2">Adhoc Bonus</th>
                  <th className="py-2">Total</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id} className="border-b">
                    <td className="py-2">{item.companyId?.companyName || item.companyId?._id || "N/A"}</td>
                    <td className="py-2">{item.referrerUserId?.fullName || item.referrerUserId?.email || "N/A"}</td>
                    <td className="py-2">{item.referredUserId?.fullName || item.referredUserId?.email || "N/A"}</td>
                    <td className="py-2">${minorToMajor(item.baseCommissionMinor)}</td>
                    <td className="py-2">${minorToMajor(item.adhocBonusMinor)}</td>
                    <td className="py-2">${minorToMajor(item.totalCommissionMinor)}</td>
                    <td className="py-2">
                      <Badge variant={item.status === "PAID" ? "default" : "outline"}>{item.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
