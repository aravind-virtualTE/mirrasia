import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "@/services/fetch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Trash2, Save, Plus, Pencil, X } from "lucide-react";
import McapPartyKyc from "./McapPartyKyc";

type PartyDraft = {
  name: string;
  email: string;
  phone: string;
  type: "person" | "entity";
};

const emptyParty: PartyDraft = { name: "", email: "", phone: "", type: "person" };

type Party = {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  type?: "person" | "entity";
};

export default function McapParties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const partyId = searchParams.get("partyId");
  const mode = searchParams.get("mode") === "detail" ? "detail" : "edit";
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [newParty, setNewParty] = useState<PartyDraft>({ ...emptyParty });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<PartyDraft>({ ...emptyParty });

  const fetchParties = async () => {
    setLoading(true);
    try {
      const res = await api.get("/mcap/party-directory");
      if (res?.data?.success) {
        setParties(res.data.data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParties();
  }, []);

  if (partyId) {
    return (
      <McapPartyKyc
        partyId={partyId}
        mode={mode}
        onModeChange={(next) => setSearchParams({ partyId, mode: next })}
      />
    );
  }

  const handleCreate = async () => {
    if (!newParty.name && !newParty.email) {
      toast({ title: "Missing info", description: "Name or email is required.", variant: "destructive" });
      return;
    }
    const res = await api.post("/mcap/party-directory", newParty);
    if (res?.data?.success) {
      toast({ title: "Saved", description: "Party added to your directory." });
      setNewParty({ ...emptyParty });
      fetchParties();
    } else {
      toast({ title: "Save failed", description: res?.data?.message || "Unable to save.", variant: "destructive" });
    }
  };

  const startEdit = (party: Party) => {
    setEditingId(party._id);
    setDraft({
      name: party.name || "",
      email: party.email || "",
      phone: party.phone || "",
      type: party.type || "person",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft({ ...emptyParty });
  };

  const handleUpdate = async (id: string) => {
    const res = await api.post("/mcap/party-directory", { _id: id, ...draft });
    if (res?.data?.success) {
      toast({ title: "Updated", description: "Party updated." });
      setEditingId(null);
      fetchParties();
    } else {
      toast({ title: "Update failed", description: res?.data?.message || "Unable to update.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    const res = await api.delete(`/mcap/party-directory/${id}`);
    if (res?.data?.success) {
      toast({ title: "Deleted", description: "Party removed." });
      fetchParties();
    } else {
      toast({ title: "Delete failed", description: res?.data?.message || "Unable to delete.", variant: "destructive" });
    }
  };

  return (
    <div className="max-width mx-auto p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Members Directory</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input value={newParty.name} onChange={(e) => setNewParty((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={newParty.email} onChange={(e) => setNewParty((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={newParty.phone} onChange={(e) => setNewParty((p) => ({ ...p, phone: e.target.value }))} />
            </div>
            <div>
              <Label>Is this shareholder a corporate entity?</Label>
              <Select value={newParty.type} onValueChange={(v) => setNewParty((p) => ({ ...p, type: v as "person" | "entity" }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="person">Individual</SelectItem>
                  <SelectItem value="entity">Corporate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleCreate} className="w-fit">
            <Plus className="w-4 h-4 mr-2" /> Add Party
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saved Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && <div className="text-sm text-muted-foreground">Loading Members...</div>}
          {!loading && parties.length === 0 && (
            <div className="text-sm text-muted-foreground">No Members saved yet.</div>
          )}
          {parties.map((party) => (
            <div key={party._id} className="border rounded-lg p-4">
              {editingId === party._id ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input value={draft.name} onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={draft.email} onChange={(e) => setDraft((p) => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input value={draft.phone} onChange={(e) => setDraft((p) => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select value={draft.type} onValueChange={(v) => setDraft((p) => ({ ...p, type: v as "person" | "entity" }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="person">Individual</SelectItem>
                        <SelectItem value="entity">Corporate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleUpdate(party._id)}>
                      <Save className="w-4 h-4 mr-1" /> Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit}>
                      <X className="w-4 h-4 mr-1" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="font-medium">{party.name || "N/A"}</div>
                    <div className="text-sm text-muted-foreground">{party.email || "N/A"}</div>
                    <div className="text-xs text-muted-foreground">{party.phone || ""}</div>
                    <div className="text-xs text-muted-foreground capitalize">{party.type || "person"}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => startEdit(party)}>
                      <Pencil className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(party._id)}>
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
