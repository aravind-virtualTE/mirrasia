import { FormEvent, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createAdhocRule,
  deleteAdhocRule,
  getAdhocRules,
  minorToMajor,
  updateAdhocRule,
  type AdhocRule,
} from "@/lib/api/referral";

type ConditionDraft = {
  countries: string;
  userRoles: string;
  firstCompanyOnly: boolean;
  minBaseCommission: string;
};

const EMPTY_CONDITION: ConditionDraft = {
  countries: "",
  userRoles: "",
  firstCompanyOnly: false,
  minBaseCommission: "",
};

const parseConditionDraft = (draft: ConditionDraft): AdhocRule["condition"] => {
  const condition: AdhocRule["condition"] = {};
  const countries = draft.countries
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
  if (countries.length) condition.countries = countries;

  const userRoles = draft.userRoles
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (userRoles.length) condition.userRoles = userRoles;

  if (draft.firstCompanyOnly) condition.firstCompanyOnly = true;

  const minBase = Number(draft.minBaseCommission);
  if (Number.isFinite(minBase) && minBase > 0) {
    condition.minBaseCommissionMinor = Math.round(minBase * 100);
  }

  return condition;
};

const formatCondition = (condition?: AdhocRule["condition"]) => {
  if (!condition) return "—";
  const parts: string[] = [];
  if (condition.countries?.length) parts.push(`Countries: ${condition.countries.join(", ")}`);
  if (condition.userRoles?.length) parts.push(`Roles: ${condition.userRoles.join(", ")}`);
  if (condition.firstCompanyOnly) parts.push("First company only");
  if (condition.minBaseCommissionMinor && condition.minBaseCommissionMinor > 0) {
    parts.push(`Min base: $${minorToMajor(condition.minBaseCommissionMinor)}`);
  }
  return parts.length ? parts.join(" · ") : "None";
};

const conditionToDraft = (condition?: AdhocRule["condition"]): ConditionDraft => ({
  countries: (condition?.countries || []).join(", "),
  userRoles: (condition?.userRoles || []).join(", "),
  firstCompanyOnly: !!condition?.firstCompanyOnly,
  minBaseCommission: condition?.minBaseCommissionMinor
    ? String(minorToMajor(condition.minBaseCommissionMinor))
    : "",
});

export default function ReferralAdhocRulesPage() {
  const [items, setItems] = useState<AdhocRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [bonusAmount, setBonusAmount] = useState(0);
  const [condition, setCondition] = useState<ConditionDraft>(EMPTY_CONDITION);

  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [editBonus, setEditBonus] = useState(0);
  const [editCondition, setEditCondition] = useState<ConditionDraft>(EMPTY_CONDITION);
  const [editSaving, setEditSaving] = useState(false);

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
        condition: parseConditionDraft(condition),
      });
      setName("");
      setStartDate("");
      setEndDate("");
      setBonusAmount(0);
      setCondition(EMPTY_CONDITION);
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
    if (!window.confirm("Delete this adhoc rule? This cannot be undone.")) return;
    setError("");
    try {
      await deleteAdhocRule(id);
      await loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete adhoc rule";
      setError(message);
    }
  };

  const openEdit = (item: AdhocRule) => {
    setEditId(item._id);
    setEditName(item.name);
    setEditStart(item.startDate.slice(0, 10));
    setEditEnd(item.endDate.slice(0, 10));
    setEditBonus(minorToMajor(item.bonusAmountMinor));
    setEditCondition(conditionToDraft(item.condition));
  };

  const closeEdit = () => {
    setEditId(null);
  };

  const handleSaveEdit = async () => {
    if (!editId) return;
    setEditSaving(true);
    setError("");
    try {
      await updateAdhocRule(editId, {
        name: editName,
        startDate: editStart,
        endDate: editEnd,
        bonusAmount: editBonus,
        condition: parseConditionDraft(editCondition),
      });
      closeEdit();
      await loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update adhoc rule";
      setError(message);
    } finally {
      setEditSaving(false);
    }
  };

  const conditionForm = (draft: ConditionDraft, setDraft: (d: ConditionDraft) => void) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-md border p-3 bg-muted/10">
      <div className="grid gap-1">
        <Label className="text-xs text-muted-foreground">Countries (comma separated, optional)</Label>
        <Input
          placeholder="HK, US, SG"
          value={draft.countries}
          onChange={(e) => setDraft({ ...draft, countries: e.target.value })}
        />
      </div>
      <div className="grid gap-1">
        <Label className="text-xs text-muted-foreground">Referrer roles (comma separated, optional)</Label>
        <Input
          placeholder="agent, admin"
          value={draft.userRoles}
          onChange={(e) => setDraft({ ...draft, userRoles: e.target.value })}
        />
      </div>
      <div className="grid gap-1">
        <Label className="text-xs text-muted-foreground">Min base commission ($, optional)</Label>
        <Input
          type="number"
          min={0}
          step="0.01"
          placeholder="0"
          value={draft.minBaseCommission}
          onChange={(e) => setDraft({ ...draft, minBaseCommission: e.target.value })}
        />
      </div>
      <label className="flex items-center gap-2 text-sm mt-5">
        <input
          type="checkbox"
          checked={draft.firstCompanyOnly}
          onChange={(e) => setDraft({ ...draft, firstCompanyOnly: e.target.checked })}
        />
        First company by referred user only
      </label>
    </div>
  );

  const now = Date.now();
  const isActivePeriod = (item: AdhocRule) => {
    const start = new Date(item.startDate).getTime();
    const end = new Date(item.endDate).getTime();
    return now >= start && now <= end;
  };

  const sortedItems = useMemo(() => {
    return [...items].sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
  }, [items]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Adhoc Rules</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create Adhoc Rule</CardTitle>
          <p className="text-xs text-muted-foreground">
            Adhoc bonuses stack on top of the base commission rule. All condition fields are optional — leave blank to apply to every commission in the active date range.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <div className="grid gap-1">
                <Label className="text-xs text-muted-foreground">Name</Label>
                <Input placeholder="e.g. Dec HK Campaign" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="grid gap-1">
                <Label className="text-xs text-muted-foreground">Start date</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </div>
              <div className="grid gap-1">
                <Label className="text-xs text-muted-foreground">End date</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
              </div>
              <div className="grid gap-1">
                <Label className="text-xs text-muted-foreground">Bonus amount ($)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={bonusAmount}
                  onChange={(e) => setBonusAmount(Number(e.target.value || 0))}
                  required
                />
              </div>
            </div>
            {conditionForm(condition, setCondition)}
            <div className="flex justify-end">
              <Button type="submit">Create Rule</Button>
            </div>
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
            <table className="w-full min-w-[1020px] text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2">Name</th>
                  <th className="py-2">Start</th>
                  <th className="py-2">End</th>
                  <th className="py-2">Bonus</th>
                  <th className="py-2">Conditions</th>
                  <th className="py-2">Status</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedItems.length === 0 && (
                  <tr>
                    <td className="py-4 text-center text-muted-foreground" colSpan={7}>
                      No adhoc rules yet.
                    </td>
                  </tr>
                )}
                {sortedItems.map((item) => (
                  <tr key={item._id} className="border-b">
                    <td className="py-2 font-medium">{item.name}</td>
                    <td className="py-2">{new Date(item.startDate).toLocaleDateString()}</td>
                    <td className="py-2">{new Date(item.endDate).toLocaleDateString()}</td>
                    <td className="py-2">${minorToMajor(item.bonusAmountMinor)}</td>
                    <td className="py-2 text-xs">{formatCondition(item.condition)}</td>
                    <td className="py-2">
                      <div className="flex flex-col gap-1">
                        <Badge variant={item.isActive ? "default" : "outline"}>
                          {item.isActive ? "Enabled" : "Disabled"}
                        </Badge>
                        {item.isActive && (
                          <span className="text-[10px] text-muted-foreground">
                            {isActivePeriod(item) ? "In date range" : "Outside date range"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 text-right">
                      <div className="inline-flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(item)}>
                          Edit
                        </Button>
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

      <Dialog open={!!editId} onOpenChange={(open) => !open && closeEdit()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Adhoc Rule</DialogTitle>
            <DialogDescription>Update dates, bonus amount, or conditions.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <div className="grid gap-1">
                <Label className="text-xs text-muted-foreground">Name</Label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div className="grid gap-1">
                <Label className="text-xs text-muted-foreground">Start date</Label>
                <Input type="date" value={editStart} onChange={(e) => setEditStart(e.target.value)} />
              </div>
              <div className="grid gap-1">
                <Label className="text-xs text-muted-foreground">End date</Label>
                <Input type="date" value={editEnd} onChange={(e) => setEditEnd(e.target.value)} />
              </div>
              <div className="grid gap-1">
                <Label className="text-xs text-muted-foreground">Bonus amount ($)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={editBonus}
                  onChange={(e) => setEditBonus(Number(e.target.value || 0))}
                />
              </div>
            </div>
            {conditionForm(editCondition, setEditCondition)}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={closeEdit} disabled={editSaving}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={editSaving}>
                {editSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
