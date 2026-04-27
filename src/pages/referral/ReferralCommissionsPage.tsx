import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  getAdminsWorkload,
  getAgentsActivity,
  getCommissions,
  minorToMajor,
  type AdminWorkloadRow,
  type AgentActivityRow,
  type CommissionLedger,
} from "@/lib/api/referral";
import { getCurrentRole } from "./auth";

type StatusFilter = "ALL" | "PENDING" | "APPROVED" | "PAID";

export default function ReferralCommissionsPage() {
  const role = getCurrentRole();
  const isMaster = role === "master";

  const [items, setItems] = useState<CommissionLedger[]>([]);
  const [agents, setAgents] = useState<AgentActivityRow[]>([]);
  const [admins, setAdmins] = useState<AdminWorkloadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getCommissions();
        if (active) setItems(data);

        if (isMaster) {
          const [agentRows, adminRows] = await Promise.all([
            getAgentsActivity().catch(() => [] as AgentActivityRow[]),
            getAdminsWorkload().catch(() => [] as AdminWorkloadRow[]),
          ]);
          if (active) {
            setAgents(agentRows);
            setAdmins(adminRows);
          }
        }
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
  }, [isMaster]);

  const filtered = useMemo(() => {
    const fromTs = fromDate ? new Date(fromDate).getTime() : null;
    const toTs = toDate ? new Date(toDate).getTime() + 24 * 60 * 60 * 1000 - 1 : null;

    return items.filter((item) => {
      if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
      const ts = new Date(item.createdAt).getTime();
      if (fromTs !== null && ts < fromTs) return false;
      if (toTs !== null && ts > toTs) return false;
      return true;
    });
  }, [items, statusFilter, fromDate, toDate]);

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, item) => {
        acc.base += item.baseCommissionMinor || 0;
        acc.adhoc += item.adhocBonusMinor || 0;
        acc.total += item.totalCommissionMinor || 0;
        return acc;
      },
      { base: 0, adhoc: 0, total: 0 }
    );
  }, [filtered]);

  const incorporationStatusKeys = useMemo(() => {
    const set = new Set<string>();
    admins.forEach((a) => Object.keys(a.byIncorporationStatus || {}).forEach((k) => set.add(k)));
    return Array.from(set);
  }, [admins]);

  const resetFilters = () => {
    setStatusFilter("ALL");
    setFromDate("");
    setToDate("");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Commissions</h1>

      {loading && <p className="text-sm text-muted-foreground">Loading commissions...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && isMaster && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Agents Activity</CardTitle>
              <p className="text-xs text-muted-foreground">
                Users who have invited others or referred at least one company.
              </p>
            </CardHeader>
            <CardContent>
              {agents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No referral activity yet.</p>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Ref Code</TableHead>
                        <TableHead className="text-right">Invited Users</TableHead>
                        <TableHead className="text-right">Referred Companies</TableHead>
                        <TableHead className="text-right">Incorporated</TableHead>
                        <TableHead className="text-right">Lifetime Commission</TableHead>
                        <TableHead className="text-right">Pending Commission</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {agents.map((a) => (
                        <TableRow key={a._id}>
                          <TableCell>
                            <div className="font-medium">{a.fullName || "N/A"}</div>
                            <div className="text-xs text-muted-foreground">{a.email}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="capitalize">
                              {a.role || "user"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-xs">{a.referralCode || "—"}</span>
                          </TableCell>
                          <TableCell className="text-right">{a.invitedUsersCount}</TableCell>
                          <TableCell className="text-right">{a.referredCompaniesCount}</TableCell>
                          <TableCell className="text-right">{a.referredCompaniesIncorporated}</TableCell>
                          <TableCell className="text-right">${minorToMajor(a.lifetimeCommissionMinor)}</TableCell>
                          <TableCell className="text-right">${minorToMajor(a.pendingCommissionMinor)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Admin Workload</CardTitle>
              <p className="text-xs text-muted-foreground">
                Companies assigned to each admin, grouped by incorporation status.
              </p>
            </CardHeader>
            <CardContent>
              {admins.length === 0 ? (
                <p className="text-sm text-muted-foreground">No admin users found.</p>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Admin</TableHead>
                        <TableHead className="text-right">Assigned Companies</TableHead>
                        {incorporationStatusKeys.map((k) => (
                          <TableHead key={k} className="text-right">
                            {k}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {admins.map((a) => (
                        <TableRow key={a._id}>
                          <TableCell>
                            <div className="font-medium">{a.fullName || "N/A"}</div>
                            <div className="text-xs text-muted-foreground">{a.email}</div>
                          </TableCell>
                          <TableCell className="text-right">{a.assignedCompaniesCount}</TableCell>
                          {incorporationStatusKeys.map((k) => (
                            <TableCell key={k} className="text-right">
                              {a.byIncorporationStatus?.[k] ?? 0}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!loading && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <CardTitle className="text-base">Commission Ledger</CardTitle>
              <div className="flex items-end gap-2 flex-wrap">
                <div className="flex flex-col gap-1">
                  <Label className="text-[11px] text-muted-foreground">Status</Label>
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                    <SelectTrigger className="h-8 w-32 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-[11px] text-muted-foreground">From</Label>
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="h-8 w-36 text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-[11px] text-muted-foreground">To</Label>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="h-8 w-36 text-xs"
                  />
                </div>
                {(statusFilter !== "ALL" || fromDate || toDate) && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-xs text-primary underline underline-offset-2 self-center"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2">Company</th>
                  <th className="py-2">Referrer</th>
                  <th className="py-2">Referred User</th>
                  <th className="py-2">Base</th>
                  <th className="py-2">Adhoc Bonus</th>
                  <th className="py-2">Total</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td className="py-4 text-center text-muted-foreground" colSpan={8}>
                      No commissions match the current filters.
                    </td>
                  </tr>
                )}
                {filtered.map((item) => (
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
                    <td className="py-2">{new Date(item.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
              {filtered.length > 0 && (
                <tfoot>
                  <tr className="font-medium">
                    <td className="py-2" colSpan={3}>
                      Totals ({filtered.length} row{filtered.length === 1 ? "" : "s"})
                    </td>
                    <td className="py-2">${minorToMajor(totals.base)}</td>
                    <td className="py-2">${minorToMajor(totals.adhoc)}</td>
                    <td className="py-2">${minorToMajor(totals.total)}</td>
                    <td className="py-2" colSpan={2} />
                  </tr>
                </tfoot>
              )}
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}