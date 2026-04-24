import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getReferralDashboard, minorToMajor, type DashboardResponse } from "@/lib/api/referral";
import { getCurrentRole } from "./auth";

const MetricCard = ({ label, value }: { label: string; value: string | number }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

export default function ReferralDashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const role = getCurrentRole();

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const dashboard = await getReferralDashboard();
        if (active) setData(dashboard);
      } catch (err: unknown) {
        if (active) {
          const message = err instanceof Error ? err.message : "Failed to load dashboard";
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

  const cards = useMemo(() => {
    if (!data) return [] as Array<{ label: string; value: string | number }>;

    if (role === "master") {
      return [
        { label: "Total Companies", value: data.summary.totalCompanies || 0 },
        { label: "Total Commission", value: `$${minorToMajor(data.summary.totalCommissionMinor || 0)}` },
        { label: "Pending Commission", value: `$${minorToMajor(data.summary.pendingCommissionMinor || 0)}` },
        { label: "Pending Withdrawals", value: data.summary.pendingWithdrawals || 0 },
      ];
    }

    return [
      { label: "Total Referrals", value: data.summary.totalReferrals || 0 },
      { label: "Total Companies", value: data.summary.totalCompanies || 0 },
      { label: "Successful Incorporations", value: data.summary.successfulIncorporations || 0 },
      { label: "Earnings Pending", value: `$${minorToMajor(data.summary.earningsPendingMinor || 0)}` },
      { label: "Earnings Paid", value: `$${minorToMajor(data.summary.earningsPaidMinor || 0)}` },
    ];
  }, [data, role]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Referral Dashboard</h1>
        <Badge variant="outline">Role: {role.toUpperCase()}</Badge>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading dashboard...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && data && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Referral Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold tracking-wide">{data.referralCode || "N/A"}</div>
              <p className="mt-2 text-sm text-muted-foreground">
                Share this code on signup links to track attribution and commissions.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
              <MetricCard key={card.label} label={card.label} value={card.value} />
            ))}
          </div>

          {role === "master" && data.companyStatusCounts && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Global Company Status Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium mb-2">Incorporation Status</h3>
                  <div className="space-y-1 text-sm">
                    {Object.entries(data.companyStatusCounts.incorporation || {}).map(([status, count]) => (
                      <div key={status} className="flex justify-between">
                        <span>{status}</span>
                        <span>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">Payment Status</h3>
                  <div className="space-y-1 text-sm">
                    {Object.entries(data.companyStatusCounts.payment || {}).map(([status, count]) => (
                      <div key={status} className="flex justify-between">
                        <span>{status}</span>
                        <span>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
