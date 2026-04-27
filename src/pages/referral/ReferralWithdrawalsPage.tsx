import { FormEvent, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  approveWithdrawal,
  getWithdrawalBalance,
  getWithdrawals,
  minorToMajor,
  requestWithdrawal,
  type WithdrawalRequest,
} from "@/lib/api/referral";
import { getCurrentRole } from "./auth";

type StatusFilter = "ALL" | "PENDING" | "APPROVED" | "PAID";

export default function ReferralWithdrawalsPage() {
  const role = getCurrentRole();
  const isMaster = role === "master";

  const [items, setItems] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [amount, setAmount] = useState(0);
  const [availableMinor, setAvailableMinor] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [withdrawals, balance] = await Promise.all([
        getWithdrawals(),
        isMaster ? Promise.resolve({ availableMinor: 0 }) : getWithdrawalBalance().catch(() => ({ availableMinor: 0 })),
      ]);
      setItems(withdrawals);
      setAvailableMinor(isMaster ? null : balance.availableMinor);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load withdrawals";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    try {
      await requestWithdrawal({ amount });
      setAmount(0);
      await loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to request withdrawal";
      setError(message);
    }
  };

  const handleApprove = async (withdrawalId: string) => {
    setError("");
    const reference = window.prompt(
      "Optional: enter payment reference (e.g., bank txn id / note). Leave blank to skip."
    );
    try {
      await approveWithdrawal(withdrawalId, reference ?? undefined);
      await loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to approve withdrawal";
      setError(message);
    }
  };

  const filteredItems = useMemo(() => {
    if (statusFilter === "ALL") return items;
    return items.filter((i) => i.status === statusFilter);
  }, [items, statusFilter]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Withdrawals</h1>

      {!isMaster && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Request Withdrawal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md border bg-muted/30 p-3 text-sm">
              <div className="text-muted-foreground text-xs uppercase tracking-wide">
                Available Balance
              </div>
              <div className="text-xl font-semibold">
                {availableMinor === null ? "…" : `$${minorToMajor(availableMinor)}`}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Sum of approved commissions not yet allocated to a paid withdrawal.
              </p>
            </div>
            <form onSubmit={handleRequest} className="flex flex-col gap-3 md:flex-row md:items-center">
              <Input
                type="number"
                min={0}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value || 0))}
                placeholder="Amount"
                required
              />
              <Button
                type="submit"
                disabled={
                  !amount
                  || amount <= 0
                  || (availableMinor !== null && Math.round(amount * 100) > availableMinor)
                }
              >
                Submit Request
              </Button>
            </form>
            {availableMinor !== null && Math.round(amount * 100) > availableMinor && amount > 0 && (
              <p className="text-xs text-red-500">
                Requested amount exceeds available balance.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
      {loading && <p className="text-sm text-muted-foreground">Loading withdrawals...</p>}

      {!loading && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <CardTitle className="text-base">Withdrawal Requests</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Status</span>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                  <SelectTrigger className="h-8 w-36 text-xs">
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
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2">Requester</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Requested</th>
                  <th className="py-2">Paid At</th>
                  <th className="py-2">Approved By</th>
                  <th className="py-2">Reference</th>
                  <th className="py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 && (
                  <tr>
                    <td className="py-4 text-center text-muted-foreground" colSpan={8}>
                      No withdrawals match this filter.
                    </td>
                  </tr>
                )}
                {filteredItems.map((item) => (
                  <tr key={item._id} className="border-b">
                    <td className="py-2">{item.userId?.fullName || item.userId?.email || "N/A"}</td>
                    <td className="py-2">${minorToMajor(item.amountMinor)}</td>
                    <td className="py-2">
                      <Badge variant={item.status === "PAID" ? "default" : "outline"}>{item.status}</Badge>
                    </td>
                    <td className="py-2">{new Date(item.createdAt).toLocaleString()}</td>
                    <td className="py-2">
                      {item.paidAt ? new Date(item.paidAt).toLocaleString() : "—"}
                    </td>
                    <td className="py-2">
                      {item.approvedByUserId?.fullName || item.approvedByUserId?.email || "—"}
                    </td>
                    <td className="py-2">
                      <span className="font-mono text-xs">{item.paymentReference || "—"}</span>
                    </td>
                    <td className="py-2">
                      {isMaster && item.status === "PENDING" ? (
                        <Button size="sm" onClick={() => handleApprove(item._id)}>
                          Mark Paid
                        </Button>
                      ) : (
                        "-"
                      )}
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
