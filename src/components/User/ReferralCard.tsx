import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link as LinkIcon, Copy, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getReferralDashboard, minorToMajor, type DashboardResponse } from "@/lib/api/referral";

export default function ReferralCard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<"code" | "url" | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await getReferralDashboard();
        if (active) setData(response);
      } catch {
        if (active) setData(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const referralCode = data?.referralCode || "";
  const shareUrl = referralCode
    ? `${window.location.origin}/signup?ref=${encodeURIComponent(referralCode)}`
    : "";

  const copy = async (value: string, field: "code" | "url") => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    } catch {
      // no-op
    }
  };

  const isMaster = data?.role === "master";
  const summary = data?.summary || {};
  const miniStats = isMaster
    ? []
    : [
      { label: "Users Invited", value: summary.totalReferrals ?? 0 },
      { label: "Their Companies", value: summary.totalCompanies ?? 0 },
      { label: "Incorporated", value: summary.successfulIncorporations ?? 0 },
      {
        label: "Earnings Pending",
        value: `$${minorToMajor(summary.earningsPendingMinor ?? 0)}`,
      },
    ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            Your Referral Link
          </CardTitle>
          <Badge variant="outline">Share & Earn</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading referral info...</p>
        ) : !referralCode ? (
          <p className="text-sm text-muted-foreground">
            Your referral code isn't available yet. Refresh the page in a moment.
          </p>
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-md border bg-muted/20 p-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Code</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-lg font-semibold">{referralCode}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => copy(referralCode, "code")}
                  >
                    {copiedField === "code" ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1" /> Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <div className="rounded-md border bg-muted/20 p-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Share URL</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="truncate text-xs font-mono">{shareUrl}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs shrink-0"
                    onClick={() => copy(shareUrl, "url")}
                  >
                    {copiedField === "url" ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1" /> Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {miniStats.length > 0 && (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {miniStats.map((stat) => (
                  <div key={stat.label} className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                    <div className="text-lg font-semibold">{stat.value}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigate("/referral-dashboard/commissions")}
              >
                View Commissions
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
