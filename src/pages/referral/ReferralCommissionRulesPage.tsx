import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  createCommissionRule,
  getCommissionRules,
  type CommissionRule,
} from "@/lib/api/referral";

export default function ReferralCommissionRulesPage() {
  const [items, setItems] = useState<CommissionRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [country, setCountry] = useState("HK");
  const [type, setType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [value, setValue] = useState(0);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getCommissionRules();
      setItems(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load commission rules";
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
      await createCommissionRule({
        country: country.toUpperCase(),
        type,
        value,
      });
      await loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save commission rule";
      setError(message);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Commission Rules</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create or Update Active Country Rule</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" required />
            <select
              className="h-10 rounded-md border px-3"
              value={type}
              onChange={(e) => setType(e.target.value as "PERCENTAGE" | "FIXED")}
            >
              <option value="PERCENTAGE">PERCENTAGE</option>
              <option value="FIXED">FIXED</option>
            </select>
            <Input
              value={value}
              onChange={(e) => setValue(Number(e.target.value || 0))}
              type="number"
              min={0}
              step="0.01"
              placeholder="Value"
              required
            />
            <Button type="submit">Save Rule</Button>
          </form>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {loading && <p className="text-sm text-muted-foreground">Loading rules...</p>}

      {!loading && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rules</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2">Country</th>
                  <th className="py-2">Type</th>
                  <th className="py-2">Value</th>
                  <th className="py-2">Active</th>
                  <th className="py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id} className="border-b">
                    <td className="py-2">{item.country}</td>
                    <td className="py-2">{item.type}</td>
                    <td className="py-2">{item.value}</td>
                    <td className="py-2">{item.isActive ? "Yes" : "No"}</td>
                    <td className="py-2">{new Date(item.createdAt).toLocaleString()}</td>
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
