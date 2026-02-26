/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, User, Building2, Send, CheckCircle2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import api, { API_URL } from "@/services/fetch";
import { useTranslation } from "react-i18next";
import type { PartyFieldDef } from "../configs/types";
import { isEntityPartyTypeEnabledForCountry } from "../party-kyc/partyKycRegistry";

// This widget manages a list of parties (Shareholders/Directors)
// conformant to the UnifiedParty model
const API_BASE = API_URL.replace(/\/+$/, "");

export const PartyWidget = ({
    parties = [],
    onChange,
    companyId,
    partyFields,
    countryCode,
}: {
    parties: any[];
    onChange: (p: any[]) => void;
    companyId?: string | null;
    partyFields?: PartyFieldDef[];
    countryCode?: string;
}) => {
    const { t } = useTranslation();
    const [directory, setDirectory] = useState<any[]>([]);
    const [selectedDirectoryId, setSelectedDirectoryId] = useState<string>("");

    const normalizedCountryCode = useMemo(() => {
        const raw = countryCode || localStorage.getItem("country") || "";
        return String(raw).split("_")[0].toUpperCase();
    }, [countryCode]);

    const entityTypeEnabled = isEntityPartyTypeEnabledForCountry(normalizedCountryCode);
    const normalizePartyType = (typeValue: any): "person" | "entity" =>
        typeValue === "entity" && entityTypeEnabled ? "entity" : "person";

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

    useEffect(() => {
        if (entityTypeEnabled) return;
        if (!parties.some((party) => party?.type === "entity")) return;

        const next = parties.map((party) =>
            party?.type === "entity"
                ? { ...party, type: "person", details: {}, invited: false, inviteStatus: "pending" }
                : party
        );
        onChange(next);
    }, [entityTypeEnabled, parties, onChange]);

    const addParty = () => {
        const newParty = {
            id: crypto.randomUUID(), // temp ID for UI
            type: "person", // person | entity
            name: "",
            email: "",
            phone: "",
            roles: ["director"], // default role
            shares: 0,
            shareType: "ordinary",
            details: {}
        };
        onChange([...parties, newParty]);
    };

    const addFromDirectory = () => {
        if (!selectedDirectoryId) {
            toast({
                title: t("newHk.parties.toasts.invalidEmail.title", "Select a party"),
                description: t("newHk.parties.toasts.invalidEmail.desc", "Choose a party from your directory first."),
                variant: "destructive",
            });
            return;
        }
        const picked = directory.find((p) => p._id === selectedDirectoryId);
        if (!picked) return;

        const exists = parties.some((p) => p.email && picked.email && String(p.email).toLowerCase() === String(picked.email).toLowerCase());
        if (exists) {
            toast({
                title: t("newHk.parties.toasts.invite.exists.title", "Already added"),
                description: t("newHk.parties.toasts.invite.exists.desc", "This party is already in the list."),
                variant: "destructive",
            });
            return;
        }

        const newParty = {
            id: crypto.randomUUID(),
            directoryId: picked._id,
            type: normalizePartyType(picked.type),
            name: picked.name || "",
            email: picked.email || "",
            phone: picked.phone || "",
            roles: ["director"],
            shares: 0,
            shareType: "ordinary",
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

    const handlePartyTypeChange = (idx: number, nextType: "person" | "entity") => {
        const current = parties[idx];
        if (!current) return;

        const safeType = normalizePartyType(nextType);
        if ((current.type || "person") === safeType) return;

        const next = [...parties];
        next[idx] = {
            ...current,
            type: safeType,
            details: {},
            invited: false,
            inviteStatus: "pending",
        };
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
            toast({
                title: t("newHk.parties.toasts.invite.failed.title", "Save required"),
                description: t("newHk.parties.toasts.invite.failed.desc", "Please save your application before inviting parties."),
                variant: "destructive",
            });
            return;
        }

        const target = parties[idx];
        if (!target?.email) {
            toast({
                title: t("newHk.parties.toasts.invalidEmail.title", "Missing email"),
                description: t("newHk.parties.toasts.invalidEmail.desc", "Please enter an email before sending an invite."),
                variant: "destructive",
            });
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/mcap/parties/invite`, {
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
                toast({
                    title: t("newHk.parties.toasts.invite.success.title", "Invite Sent"),
                    description: t("newHk.parties.toasts.invite.success.desc", `KYC invite sent to ${target.email}`),
                });
            } else {
                toast({
                    title: t("newHk.parties.toasts.invite.failed.title", "Invite Failed"),
                    // description: t("newHk.parties.toasts.invite.failed.desc", data?.message || "Could not send invite"),
                    variant: "destructive",
                });
            }
        } catch (err) {
            toast({
                title: t("newHk.parties.toasts.invite.failed.title", "Invite Failed"),
                description: t("newHk.parties.toasts.invite.failed.desc", "Could not send invite"),
                variant: "destructive",
            });
        }
    };

    const updatePartyField = (idx: number, field: PartyFieldDef, value: any) => {
        const next = [...parties];
        const target = { ...next[idx] };
        if (field.storage === "root") {
            target[field.key] = value;
        } else {
            const details = { ...(target.details || {}) };
            details[field.key] = value;
            target.details = details;
        }
        next[idx] = target;
        onChange(next);
    };

    const getPartyFieldValue = (party: any, field: PartyFieldDef) => {
        if (field.storage === "root") return party?.[field.key];
        return party?.details?.[field.key];
    };

    const shouldRenderField = (party: any, field: PartyFieldDef) => {
        if (!field.roles || field.roles.length === 0) return true;
        const roles = party?.roles || [];
        return field.roles.some((r) => roles.includes(r));
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h3 className="text-lg font-medium">
                    {t("newHk.parties.title", "Parties List")}
                </h3>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="min-w-[240px]">
                        <Select value={selectedDirectoryId} onValueChange={setSelectedDirectoryId}>
                            <SelectTrigger className="h-9">
                                <SelectValue placeholder={t("newHk.parties.directory.placeholder", "Select member")} />
                            </SelectTrigger>
                            <SelectContent>
                                {directory.map((p) => (
                                    <SelectItem key={p._id} value={p._id}>
                                        {p.name || p.email || t("newHk.parties.new", "Unnamed")}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={addFromDirectory} size="sm" variant="outline">
                        {t("newHk.parties.directory.addSelected", "Add selected")}
                    </Button>
                    <Button onClick={addParty} size="sm" variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        {t("newHk.parties.buttons.addMember", "Add shareholder/director/DCP member")}
                    </Button>
                </div>
            </div>

            <div className="grid gap-4">
                {parties.map((party, idx) => {
                    const partyType = normalizePartyType(party?.type);

                    return (
                        <Card key={party.id || idx}>
                            <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                    <div className={`p-2 rounded-full ${partyType === 'person' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                                        {partyType === 'person' ? <User className="w-4 h-4 text-blue-600" /> : <Building2 className="w-4 h-4 text-purple-600" />}
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">
                                            {t("newHk.parties.fields.isCorp.label", "Is this shareholder a corporate entity?")}
                                        </Label>
                                        <Select
                                            value={partyType}
                                            onValueChange={(v) => handlePartyTypeChange(idx, v as "person" | "entity")}
                                        >
                                            <SelectTrigger className="w-[120px] h-8">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="person">{t("newHk.parties.fields.isCorp.options.no", "Individual")}</SelectItem>
                                                 <SelectItem value="entity">{t("newHk.parties.fields.isCorp.options.yes", "Corporate")}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => removeParty(idx)} className="text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>{t("newHk.parties.fields.name.label", "Full Name / Company Name")}</Label>
                                    <Input
                                        value={party.name}
                                        onChange={(e) => updateParty(idx, "name", e.target.value)}
                                        placeholder={t("newHk.parties.fields.name.example", "Legal Name")}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t("newHk.parties.fields.email.label", "Email Address")}</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={party.email}
                                            onChange={(e) => updateParty(idx, "email", e.target.value)}
                                            placeholder={t("newHk.parties.fields.email.label", "Email for contact")}
                                        />
                                        <Button
                                            size="sm"
                                            variant={party.invited ? "secondary" : "default"}
                                            onClick={() => inviteParty(idx)}
                                        >
                                            {party.invited ? <CheckCircle2 className="w-4 h-4 mr-1" /> : <Send className="w-4 h-4 mr-1" />}
                                            {party.invited
                                                ? t("newHk.parties.buttons.invite", "Sent")
                                                : t("newHk.parties.buttons.invite", "Invite")}
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>{t("newHk.parties.fields.phone.label", "Phone")}</Label>
                                    <Input
                                        value={party.phone || ""}
                                        onChange={(e) => updateParty(idx, "phone", e.target.value)}
                                        placeholder={t("newHk.parties.fields.phone.label", "Phone number")}
                                    />
                                </div>
                            </div>

                            <Separator className="my-4" />

                            <div className="space-y-2">
                                <Label>{t("newHk.parties.fields.roleSelectionPrompt", "Select the options that the member will be")}</Label>
                                <div className="flex gap-4">
                                    {["director", "shareholder", "dcp"].map(role => (
                                        <label key={role} className="flex items-center gap-2 border p-2 rounded cursor-pointer hover:bg-muted">
                                            <input
                                                type="checkbox"
                                                checked={(party.roles || []).includes(role)}
                                                onChange={() => toggleRole(idx, role)}
                                                className="rounded border-gray-300"
                                            />
                                            <span className="capitalize text-sm">{t(`newHk.parties.roles.${role}`, role)}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {(party.roles || []).includes("shareholder") && (
                                <div className="mt-4 space-y-2">
                                    <Label>{t("newHk.parties.fields.shares.label", "Number of Shares")}</Label>
                                    <Input
                                        type="number"
                                        value={party.shares}
                                        onChange={(e) => updateParty(idx, "shares", Number(e.target.value))}
                                        className="w-48"
                                    />
                                </div>
                            )}

                            {partyFields && partyFields.length > 0 && (
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {partyFields
                                        .filter((field) => shouldRenderField(party, field))
                                        .map((field) => {
                                            const value = getPartyFieldValue(party, field);
                                            if (field.type === "select") {
                                                return (
                                                    <div key={field.key} className="space-y-2">
                                                        <Label>{t(field.label, field.label)}</Label>
                                                        <Select
                                                            value={String(value ?? "")}
                                                            onValueChange={(v) => updatePartyField(idx, field, v)}
                                                        >
                                                            <SelectTrigger className="h-9">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {(field.options || []).map((opt) => (
                                                                    <SelectItem key={opt.value} value={opt.value}>
                                                                        {t(opt.label, opt.label)}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                );
                                            }

                                            if (field.type === "radio-group") {
                                                return (
                                                    <div key={field.key} className="space-y-2 md:col-span-2">
                                                        <Label>{t(field.label, field.label)}</Label>
                                                        <div className="flex gap-4">
                                                            {(field.options || []).map((opt) => (
                                                                <label key={opt.value} className="flex items-center gap-2">
                                                                    <input
                                                                        type="radio"
                                                                        name={`${party.id || idx}-${field.key}`}
                                                                        checked={String(value ?? "") === opt.value}
                                                                        onChange={() => updatePartyField(idx, field, opt.value)}
                                                                    />
                                                                    <span className="text-sm">{t(opt.label, opt.label)}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            if (field.type === "checkbox") {
                                                return (
                                                    <div key={field.key} className="space-y-2">
                                                        <Label>{t(field.label, field.label)}</Label>
                                                        <input
                                                            type="checkbox"
                                                            checked={!!value}
                                                            onChange={(e) => updatePartyField(idx, field, e.target.checked)}
                                                            className="rounded border-gray-300"
                                                        />
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div key={field.key} className="space-y-2">
                                                    <Label>{t(field.label, field.label)}</Label>
                                                    <Input
                                                        type={field.type === "number" ? "number" : "text"}
                                                        value={value ?? ""}
                                                        onChange={(e) => updatePartyField(idx, field, e.target.value)}
                                                    />
                                                </div>
                                            );
                                        })}
                                </div>
                            )}

                            </CardContent>
                        </Card>
                    );
                })}

                {parties.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                        {t(
                            "newHk.parties.empty",
                            "No parties added yet. Click \"Add shareholder/director/DCP member\" to begin."
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
