import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  createAdhocRule,
  deleteAdhocRule,
  getAdhocRules,
  minorToMajor,
  updateAdhocRule,
  type AdhocRule,
} from "@/lib/api/referral";

export default function ReferralAdhocRulesPage() {
  const [items, setItems] = useState<AdhocRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [bonusAmount, setBonusAmount] = useState(0);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdhocRules();
      setItems(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load adhoc rules";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    try {
      await createAdhocRule({
        name,
        startDate,
        endDate,
        bonusAmount,
      });
      setName("");
      setStartDate("");
      setEndDate("");
      setBonusAmount(0);
      await loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create adhoc rule";
      setError(message);
    }
  };

  const handleToggle = async (item: AdhocRule) => {
    setError("");
    try {
      await updateAdhocRule(item._id, { isActive: !item.isActive });
      await loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update adhoc rule";
      setError(message);
    }
  };

  const handleDelete = async (id: string) => {
    setError("");
    try {
      await deleteAdhocRule(id);
      await loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete adhoc rule";
      setError(message);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Adhoc Rules</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create Adhoc Rule</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-5">
            <Input placeholder="Rule Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            <Input
              type="number"
              min={0}
              step="0.01"
              value={bonusAmount}
              onChange={(e) => setBonusAmount(Number(e.target.value || 0))}
              placeholder="Bonus Amount"
              required
            />
            <Button type="submit">Create</Button>
          </form>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {loading && <p className="text-sm text-muted-foreground">Loading adhoc rules...</p>}

      {!loading && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rules</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2">Name</th>
                  <th className="py-2">Start</th>
                  <th className="py-2">End</th>
                  <th className="py-2">Bonus</th>
                  <th className="py-2">Active</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id} className="border-b">
                    <td className="py-2">{item.name}</td>
                    <td className="py-2">{new Date(item.startDate).toLocaleDateString()}</td>
                    <td className="py-2">{new Date(item.endDate).toLocaleDateString()}</td>
                    <td className="py-2">${minorToMajor(item.bonusAmountMinor)}</td>
                    <td className="py-2">{item.isActive ? "Yes" : "No"}</td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleToggle(item)}>
                          {item.isActive ? "Disable" : "Enable"}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(item._id)}>
                          Delete
                        </Button>
                      </div>
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
