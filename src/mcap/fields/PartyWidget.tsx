/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, User, Building2, Send, CheckCircle2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import api from "@/services/fetch";

// This widget manages a list of parties (Shareholders/Directors)
// conformant to the UnifiedParty model
export const PartyWidget = ({
    parties = [],
    onChange,
    companyId,
}: {
    parties: any[];
    onChange: (p: any[]) => void;
    companyId?: string | null;
}) => {
    const [directory, setDirectory] = useState<any[]>([]);
    const [selectedDirectoryId, setSelectedDirectoryId] = useState<string>("");

    useEffect(() => {
        const loadDirectory = async () => {
            try {
                const res = await api.get("/mcap/party-directory");
                if (res?.data?.success) {
                    setDirectory(res.data.data || []);
                }
            } catch (e) {
                console.error("Failed to load party directory", e);
            }
        };
        loadDirectory();
    }, []);

    const addParty = () => {
        const newParty = {
            id: crypto.randomUUID(), // temp ID for UI
            type: "person", // person | entity
            name: "",
            email: "",
            phone: "",
            roles: ["director"], // default role
            shares: 0,
            details: {}
        };
        onChange([...parties, newParty]);
    };

    const addFromDirectory = () => {
        if (!selectedDirectoryId) {
            toast({ title: "Select a party", description: "Choose a party from your directory first.", variant: "destructive" });
            return;
        }
        const picked = directory.find((p) => p._id === selectedDirectoryId);
        if (!picked) return;

        const exists = parties.some((p) => p.email && picked.email && String(p.email).toLowerCase() === String(picked.email).toLowerCase());
        if (exists) {
            toast({ title: "Already added", description: "This party is already in the list.", variant: "destructive" });
            return;
        }

        const newParty = {
            id: crypto.randomUUID(),
            directoryId: picked._id,
            type: picked.type || "person",
            name: picked.name || "",
            email: picked.email || "",
            phone: picked.phone || "",
            roles: ["director"],
            shares: 0,
            details: {},
        };
        onChange([...parties, newParty]);
        setSelectedDirectoryId("");
    };

    const removeParty = (idx: number) => {
        const next = parties.filter((_, i) => i !== idx);
        onChange(next);
    };

    const updateParty = (idx: number, key: string, value: any) => {
        const next = [...parties];
        next[idx] = { ...next[idx], [key]: value };
        onChange(next);
    };

    const toggleRole = (idx: number, role: string) => {
        const next = [...parties];
        const currentRoles = next[idx].roles || [];
        if (currentRoles.includes(role)) {
            next[idx].roles = currentRoles.filter((r: string) => r !== role);
        } else {
            next[idx].roles = [...currentRoles, role];
        }
        onChange(next);
    };

    const inviteParty = async (idx: number) => {
        if (!companyId) {
            toast({ title: "Save required", description: "Please save your application before inviting parties.", variant: "destructive" });
            return;
        }

        const target = parties[idx];
        if (!target?.email) {
            toast({ title: "Missing email", description: "Please enter an email before sending an invite.", variant: "destructive" });
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_API_ORIGIN || "http://localhost:5000"}/api/mcap/parties/invite`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ companyId, party: target })
            });
            const data = await res.json();
            if (data?.success) {
                const updated = [...parties];
                updated[idx] = { ...updated[idx], ...(data.data?.party || {}), invited: true };
                onChange(updated);
                toast({ title: "Invite Sent", description: `KYC invite sent to ${target.email}` });
            } else {
                toast({ title: "Invite Failed", description: data?.message || "Could not send invite", variant: "destructive" });
            }
        } catch (err) {
            toast({ title: "Invite Failed", description: "Could not send invite", variant: "destructive" });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h3 className="text-lg font-medium">Parties List</h3>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="min-w-[240px]">
                        <Select value={selectedDirectoryId} onValueChange={setSelectedDirectoryId}>
                            <SelectTrigger className="h-9">
                                <SelectValue placeholder="Add from directory" />
                            </SelectTrigger>
                            <SelectContent>
                                {directory.map((p) => (
                                    <SelectItem key={p._id} value={p._id}>
                                        {p.name || p.email || "Unnamed"}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={addFromDirectory} size="sm" variant="outline">
                        Add Selected
                    </Button>
                    <Button onClick={addParty} size="sm" variant="outline">
                        <Plus className="w-4 h-4 mr-2" /> New Party
                    </Button>
                </div>
            </div>

            <div className="grid gap-4">
                {parties.map((party, idx) => (
                    <Card key={party.id || idx}>
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                    <div className={`p-2 rounded-full ${party.type === 'person' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                                        {party.type === 'person' ? <User className="w-4 h-4 text-blue-600" /> : <Building2 className="w-4 h-4 text-purple-600" />}
                                    </div>
                                    <Select
                                        value={party.type}
                                        onValueChange={(v) => updateParty(idx, "type", v)}
                                    >
                                        <SelectTrigger className="w-[120px] h-8">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="person">Individual</SelectItem>
                                            <SelectItem value="entity">Corporate</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => removeParty(idx)} className="text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Full Name / Company Name</Label>
                                    <Input
                                        value={party.name}
                                        onChange={(e) => updateParty(idx, "name", e.target.value)}
                                        placeholder="Legal Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email Address</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={party.email}
                                            onChange={(e) => updateParty(idx, "email", e.target.value)}
                                            placeholder="Email for contact"
                                        />
                                        <Button
                                            size="sm"
                                            variant={party.invited ? "secondary" : "default"}
                                            onClick={() => inviteParty(idx)}
                                        >
                                            {party.invited ? <CheckCircle2 className="w-4 h-4 mr-1" /> : <Send className="w-4 h-4 mr-1" />}
                                            {party.invited ? "Sent" : "Invite"}
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <Input
                                        value={party.phone || ""}
                                        onChange={(e) => updateParty(idx, "phone", e.target.value)}
                                        placeholder="Phone number"
                                    />
                                </div>
                            </div>

                            <Separator className="my-4" />

                            <div className="space-y-2">
                                <Label>Roles</Label>
                                <div className="flex gap-4">
                                    {["director", "shareholder", "dcp"].map(role => (
                                        <label key={role} className="flex items-center gap-2 border p-2 rounded cursor-pointer hover:bg-muted">
                                            <input
                                                type="checkbox"
                                                checked={(party.roles || []).includes(role)}
                                                onChange={() => toggleRole(idx, role)}
                                                className="rounded border-gray-300"
                                            />
                                            <span className="capitalize text-sm">{role}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {(party.roles || []).includes("shareholder") && (
                                <div className="mt-4 space-y-2">
                                    <Label>Number of Shares</Label>
                                    <Input
                                        type="number"
                                        value={party.shares}
                                        onChange={(e) => updateParty(idx, "shares", Number(e.target.value))}
                                        className="w-48"
                                    />
                                </div>
                            )}

                        </CardContent>
                    </Card>
                ))}

                {parties.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                        No parties added yet. Click "Add Party" to begin.
                    </div>
                )}
            </div>
        </div>
    );
};
