import { FormEvent, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  approveWithdrawal,
  getWithdrawals,
  minorToMajor,
  requestWithdrawal,
  type WithdrawalRequest,
} from "@/lib/api/referral";
import { getCurrentRole } from "./auth";

export default function ReferralWithdrawalsPage() {
  const role = getCurrentRole();
  const isMaster = role === "master";

  const [items, setItems] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [amount, setAmount] = useState(0);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getWithdrawals();
      setItems(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load withdrawals";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
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
    try {
      await approveWithdrawal(withdrawalId);
      await loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to approve withdrawal";
      setError(message);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Withdrawals</h1>

      {!isMaster && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Request Withdrawal</CardTitle>
          </CardHeader>
          <CardContent>
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
              <Button type="submit">Submit Request</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
      {loading && <p className="text-sm text-muted-foreground">Loading withdrawals...</p>}

      {!loading && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Withdrawal Requests</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2">Requester</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Created At</th>
                  <th className="py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id} className="border-b">
                    <td className="py-2">{item.userId?.fullName || item.userId?.email || "N/A"}</td>
                    <td className="py-2">${minorToMajor(item.amountMinor)}</td>
                    <td className="py-2">
                      <Badge variant={item.status === "PAID" ? "default" : "outline"}>{item.status}</Badge>
                    </td>
                    <td className="py-2">{new Date(item.createdAt).toLocaleString()}</td>
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
