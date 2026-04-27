import { FormEvent, useEffect, useMemo, useState } from "react";
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
import {
  createCommissionRule,
  getCommissionRules,
  reactivateCommissionRule,
  type CommissionRule,
} from "@/lib/api/referral";
import { MCAP_RUNTIME_CONFIGS } from "@/mcap/configs/registry";

type IncorporationCountry = { code: string; name: string };

const buildIncorporationCountries = (): IncorporationCountry[] => {
  const seen = new Map<string, IncorporationCountry>();
  for (const config of MCAP_RUNTIME_CONFIGS) {
    const code = String(config.countryCode || "").trim().toUpperCase();
    if (!code || seen.has(code)) continue;
    seen.set(code, {
      code,
      name: String(config.countryName || code).trim() || code,
    });
  }
  return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
};

type CountryBucket = {
  code: string;
  name: string;
  active: CommissionRule | null;
  history: CommissionRule[];
  isInRegistry: boolean;
};

type Draft = { type: "PERCENTAGE" | "FIXED"; value: string };

const draftFromRule = (rule: CommissionRule | null): Draft => ({
  type: (rule?.type as "PERCENTAGE" | "FIXED") || "PERCENTAGE",
  value: rule ? String(rule.value) : "",
});

const formatRule = (rule: CommissionRule) =>
  rule.type === "PERCENTAGE" ? `${rule.value}%` : `$${rule.value}`;

type CountryRuleCardProps = {
  bucket: CountryBucket;
  onSave: (code: string, draft: Draft) => Promise<void>;
  onReactivate: (id: string) => Promise<void>;
  saving: boolean;
};

function CountryRuleCard({ bucket, onSave, onReactivate, saving }: CountryRuleCardProps) {
  const [draft, setDraft] = useState<Draft>(draftFromRule(bucket.active));
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    setDraft(draftFromRule(bucket.active));
  }, [bucket.active]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const numericValue = Number(draft.value);
    if (!Number.isFinite(numericValue) || numericValue < 0) return;
    await onSave(bucket.code, { type: draft.type, value: draft.value });
  };

  const dirty = bucket.active
    ? draft.type !== bucket.active.type || Number(draft.value) !== bucket.active.value
    : draft.value !== "";

  return (
    <Card className={!bucket.active ? "border-destructive/40" : undefined}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base">
              {bucket.name} <span className="text-muted-foreground font-normal">({bucket.code})</span>
            </CardTitle>
            {bucket.active ? (
              <Badge variant="default">
                Active: {bucket.active.type} · {formatRule(bucket.active)}
              </Badge>
            ) : (
              <Badge variant="destructive">No commission set yet</Badge>
            )}
            {!bucket.isInRegistry && (
              <Badge variant="outline" className="text-amber-700 border-amber-300">
                Not in current registry
              </Badge>
            )}
          </div>
          {bucket.history.length > 0 && (
            <Button size="sm" variant="ghost" onClick={() => setHistoryOpen((v) => !v)}>
              {historyOpen ? "Hide history" : `Show history (${bucket.history.length})`}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto] items-end">
          <div className="grid gap-1">
            <Label className="text-xs text-muted-foreground">Type</Label>
            <Select value={draft.type} onValueChange={(v) => setDraft((d) => ({ ...d, type: v as Draft["type"] }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PERCENTAGE">Percentage of payment</SelectItem>
                <SelectItem value="FIXED">Fixed amount (dollars)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <Label className="text-xs text-muted-foreground">
              {draft.type === "PERCENTAGE" ? "Percent (e.g. 10 = 10%)" : "Dollars (e.g. 100)"}
            </Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={draft.value}
              onChange={(e) => setDraft((d) => ({ ...d, value: e.target.value }))}
              required
            />
          </div>
          <Button type="submit" disabled={saving || !dirty || draft.value === ""}>
            {bucket.active ? "Update" : "Set commission"}
          </Button>
        </form>

        {historyOpen && bucket.history.length > 0 && (
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left bg-muted/30">
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">Value</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Created</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {bucket.history.map((rule) => (
                  <tr key={rule._id} className="border-b last:border-0">
                    <td className="py-2 px-3">{rule.type}</td>
                    <td className="py-2 px-3">{formatRule(rule)}</td>
                    <td className="py-2 px-3">
                      <Badge variant="outline">Inactive</Badge>
                    </td>
                    <td className="py-2 px-3">{new Date(rule.createdAt).toLocaleString()}</td>
                    <td className="py-2 px-3 text-right">
                      <Button size="sm" variant="outline" onClick={() => onReactivate(rule._id)}>
                        Reactivate
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ReferralCommissionRulesPage() {
  const [items, setItems] = useState<CommissionRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingCode, setSavingCode] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const incorporationCountries = useMemo(() => buildIncorporationCountries(), []);

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

  const handleSave = async (code: string, draft: Draft) => {
    setError("");
    setSavingCode(code);
    try {
      await createCommissionRule({
        country: code,
        type: draft.type,
        value: Number(draft.value),
      });
      await loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save commission rule";
      setError(message);
    } finally {
      setSavingCode(null);
    }
  };

  const handleReactivate = async (id: string) => {
    setError("");
    try {
      await reactivateCommissionRule(id);
      await loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to reactivate rule";
      setError(message);
    }
  };

  const buckets = useMemo<CountryBucket[]>(() => {
    const registryByCode = new Map(incorporationCountries.map((c) => [c.code, c]));
    const codeSet = new Set(incorporationCountries.map((c) => c.code));
    items.forEach((rule) => codeSet.add(rule.country));

    return Array.from(codeSet).map((code) => {
      const rules = items.filter((r) => r.country === code);
      const active = rules.find((r) => r.isActive) || null;
      const history = rules.filter((r) => r._id !== active?._id);
      const registryEntry = registryByCode.get(code);
      return {
        code,
        name: registryEntry?.name || code,
        active,
        history,
        isInRegistry: !!registryEntry,
      };
    });
  }, [items, incorporationCountries]);

  const filteredBuckets = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? buckets.filter(
        (b) => b.name.toLowerCase().includes(q) || b.code.toLowerCase().includes(q)
      )
      : buckets;

    return [...filtered].sort((a, b) => {
      if (!a.active && b.active) return -1;
      if (a.active && !b.active) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [buckets, search]);

  const missingCount = buckets.filter((b) => !b.active).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Commission Rules</h1>
          <p className="text-sm text-muted-foreground mt-1">
            One commission rule per incorporation country. New countries added to the MCAP registry
            appear here automatically.
          </p>
        </div>
        {missingCount > 0 && (
          <Badge variant="destructive" className="text-xs">
            {missingCount} {missingCount === 1 ? "country" : "countries"} need a commission rule
          </Badge>
        )}
      </div>

      <Card>
        <CardContent className="py-3">
          <Input
            placeholder="Search by country name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 max-w-sm text-sm"
          />
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {loading && <p className="text-sm text-muted-foreground">Loading rules...</p>}

      {!loading && filteredBuckets.length === 0 && (
        <Card>
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            No countries match your search.
          </CardContent>
        </Card>
      )}

      {!loading && filteredBuckets.length > 0 && (
        <div className="space-y-4">
          {filteredBuckets.map((bucket) => (
            <CountryRuleCard
              key={bucket.code}
              bucket={bucket}
              onSave={handleSave}
              onReactivate={handleReactivate}
              saving={savingCode === bucket.code}
            />
          ))}
        </div>
      )}
    </div>
  );
}
