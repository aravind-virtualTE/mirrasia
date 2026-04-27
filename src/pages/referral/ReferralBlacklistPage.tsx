import { FormEvent, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  createBlacklistEntry,
  deleteBlacklistEntry,
  getBlacklistEntries,
  type BlacklistEntry,
} from "@/lib/api/referral";

export default function ReferralBlacklistPage() {
  const [items, setItems] = useState<BlacklistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getBlacklistEntries();
      setItems(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load blacklist";
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
      await createBlacklistEntry({
        email: email || undefined,
        phone: phone || undefined,
        notes: notes || undefined,
      });
      setEmail("");
      setPhone("");
      setNotes("");
      await loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create blacklist entry";
      setError(message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Remove this entry from the blacklist?")) return;
    setError("");
    try {
      await deleteBlacklistEntry(id);
      await loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete blacklist entry";
      setError(message);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      return (
        (item.email || "").toLowerCase().includes(q)
        || (item.phone || "").toLowerCase().includes(q)
        || (item.notes || "").toLowerCase().includes(q)
      );
    });
  }, [items, search]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Blacklist Management</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Blacklist Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <Input type="email" placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            <Button type="submit">Add</Button>
          </form>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {loading && <p className="text-sm text-muted-foreground">Loading blacklist...</p>}

      {!loading && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <CardTitle className="text-base">
                Entries {items.length > 0 && <span className="text-muted-foreground font-normal">({filtered.length} / {items.length})</span>}
              </CardTitle>
              <Input
                placeholder="Search email, phone, or notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-72 text-xs"
              />
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2">Email</th>
                  <th className="py-2">Phone</th>
                  <th className="py-2">Notes</th>
                  <th className="py-2">Created</th>
                  <th className="py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td className="py-4 text-center text-muted-foreground" colSpan={5}>
                      {items.length === 0 ? "No blacklist entries yet." : "No entries match your search."}
                    </td>
                  </tr>
                )}
                {filtered.map((item) => (
                  <tr key={item._id} className="border-b">
                    <td className="py-2">{item.email || "-"}</td>
                    <td className="py-2">{item.phone || "-"}</td>
                    <td className="py-2">{item.notes || "-"}</td>
                    <td className="py-2">{new Date(item.createdAt).toLocaleString()}</td>
                    <td className="py-2">
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(item._id)}>
                        Delete
                      </Button>
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
