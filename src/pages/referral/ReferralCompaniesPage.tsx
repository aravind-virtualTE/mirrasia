import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCrmCompanies, type CrmCompany } from "@/lib/api/referral";

type StatusFilter = "ALL" | "PENDING" | "INCORPORATED";
type PaymentFilter = "ALL" | "PENDING" | "PAID";

export default function ReferralCompaniesPage() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<CrmCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("ALL");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getCrmCompanies();
      setCompanies(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load companies";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return companies.filter((company) => {
      if (statusFilter !== "ALL" && company.incorporationStatus !== statusFilter) return false;
      if (paymentFilter !== "ALL" && company.paymentStatus !== paymentFilter) return false;
      if (!q) return true;

      const owner = typeof company.ownerUserId === "object" ? company.ownerUserId : null;
      const referrer = typeof company.referredByUserId === "object" ? company.referredByUserId : null;
      const haystack = [
        company.companyName,
        company.country,
        owner?.fullName,
        owner?.email,
        referrer?.fullName,
        referrer?.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [companies, search, statusFilter, paymentFilter]);

  const counts = useMemo(() => {
    const referredOnly = companies.filter((c) => !!c.referredByUserId);
    return {
      total: companies.length,
      withReferrer: referredOnly.length,
      incorporated: companies.filter(
        (c) => c.incorporationStatus === "INCORPORATED" && c.paymentStatus === "PAID"
      ).length,
    };
  }, [companies]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Referral Companies</h1>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Card>
          <CardContent className="py-4">
            <div className="text-xs text-muted-foreground uppercase">Total Companies</div>
            <div className="text-2xl font-bold mt-1">{counts.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="text-xs text-muted-foreground uppercase">With a Referrer</div>
            <div className="text-2xl font-bold mt-1">{counts.withReferrer}</div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Eligible to generate commissions when paid + incorporated.
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="text-xs text-muted-foreground uppercase">Paid + Incorporated</div>
            <div className="text-2xl font-bold mt-1">{counts.incorporated}</div>
          </CardContent>
        </Card>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {loading && <p className="text-sm text-muted-foreground">Loading companies...</p>}

      {!loading && (
        <Card>
          <CardHeader>
            <div className="flex items-end justify-between gap-3 flex-wrap">
              <CardTitle className="text-base">
                Companies & Referrers
                {companies.length > 0 && (
                  <span className="text-muted-foreground font-normal ml-2">
                    ({filtered.length} / {companies.length})
                  </span>
                )}
              </CardTitle>
              <div className="flex items-end gap-2 flex-wrap">
                <div className="flex flex-col gap-1">
                  <Label className="text-[11px] text-muted-foreground">Search</Label>
                  <Input
                    placeholder="Company, owner, referrer..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-8 w-60 text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-[11px] text-muted-foreground">Status</Label>
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                    <SelectTrigger className="h-8 w-40 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="INCORPORATED">Incorporated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-[11px] text-muted-foreground">Payment</Label>
                  <Select value={paymentFilter} onValueChange={(v) => setPaymentFilter(v as PaymentFilter)}>
                    <SelectTrigger className="h-8 w-32 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2">Company</th>
                  <th className="py-2">Country</th>
                  <th className="py-2">Owner</th>
                  <th className="py-2">Referrer</th>
                  <th className="py-2">Incorporation</th>
                  <th className="py-2">Payment</th>
                  <th className="py-2">Assigned Admin</th>
                  <th className="py-2 text-right">Open</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td className="py-4 text-center text-muted-foreground" colSpan={8}>
                      No companies match the current filters.
                    </td>
                  </tr>
                )}
                {filtered.map((company) => {
                  const owner = typeof company.ownerUserId === "object" ? company.ownerUserId : null;
                  const referrer = typeof company.referredByUserId === "object" ? company.referredByUserId : null;
                  const assignedAdmin = typeof company.assignedAdminId === "object" ? company.assignedAdminId : null;
                  const sourceId = company.sourceCompanyId || company._id;

                  return (
                    <tr key={company._id} className="border-b align-top">
                      <td className="py-2">{company.companyName || "N/A"}</td>
                      <td className="py-2">{company.country}</td>
                      <td className="py-2">{owner?.fullName || owner?.email || "N/A"}</td>
                      <td className="py-2">
                        {referrer ? (
                          <span>{referrer.fullName || referrer.email}</span>
                        ) : (
                          <span className="text-muted-foreground text-xs">No referrer</span>
                        )}
                      </td>
                      <td className="py-2">
                        <Badge variant="outline">{company.incorporationStatus}</Badge>
                      </td>
                      <td className="py-2">
                        <Badge variant={company.paymentStatus === "PAID" ? "default" : "outline"}>
                          {company.paymentStatus}
                        </Badge>
                      </td>
                      <td className="py-2">{assignedAdmin?.fullName || assignedAdmin?.email || "—"}</td>
                      <td className="py-2 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/incorporation-detail/${sourceId}`)}
                        >
                          Open
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}