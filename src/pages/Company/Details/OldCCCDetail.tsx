/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import { Building2, 
    // Banknote, ShieldCheck, ReceiptText, Mail, Phone, 
    X, Save, Edit2, Check } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { cccCompanyData, Company } from "@/pages/CurrentClient/cccState";
import MemoApp from "./MemosHK";
import AdminProject from "@/pages/dashboard/Admin/Projects/AdminProject";
import TodoApp from "@/pages/Todo/TodoApp";
import ChecklistHistory from "@/pages/Checklist/ChecklistHistory";
import { fetchUsers, updateCurrentClient } from "@/services/dataFetch";
import { User } from "@/components/userList/UsersList";
import { toast } from "@/hooks/use-toast";

/** ---------- Small local helpers to match the “above styling” ---------- */
function LabelValue({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-sm">{children}</div>
        </div>
    );
}

function Initials(name?: string) {
    if (!name) return "—";
    const parts = name.trim().split(/\s+/);
    const letters = (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
    return letters.toUpperCase() || name[0]?.toUpperCase() || "•";
}

function FallbackAvatar({ name }: { name?: string }) {
    return (
        <Avatar className="h-6 w-6">
            <AvatarFallback className="text-[10px]">{Initials(name)}</AvatarFallback>
        </Avatar>
    );
}

// function BoolPill({ value }: { value: boolean }) {
//     return (
//         <Badge variant={value ? "default" : "secondary"} className={value ? "" : "text-muted-foreground"}>
//             {value ? "YES" : "NO"}
//         </Badge>
//     );
// }

const OldCCCDetail: React.FC<{ id: string }> = ({ id }) => {
    const [customers] = useAtom(cccCompanyData);
    const [comp, SetCompany] = useState<Company | undefined>(customers.find((c) => c._id === id));
    const navigate = useNavigate();

    const [users, setUsers] = useState<User[]>([]);
    const [adminAssigned, setAdminAssigned] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Single-field inline edit
    const [editingField, setEditingField] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");

    // Table-cell style inline edit for arrays
    const [editingCell, setEditingCell] = useState<{
        type: "directors" | "shareholders" | "designatedContact";
        idx: number;
        key: string;
    } | null>(null);

    const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null;

    useEffect(() => {
        (async () => {
            setAdminAssigned("");
            const response = await fetchUsers();
            const filteredUsers = response.filter((e: { role: string }) => e.role === "admin" || e.role === "master");
            setUsers(filteredUsers);
        })();
    }, []);

    const AssignAdmin = () => {
        const handleAssign = (value: string) => setAdminAssigned(value);
        return (
            <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Assign Admin</span>
                <Select onValueChange={handleAssign} value={adminAssigned}>
                    <SelectTrigger className="h-8 w-60">
                        <SelectValue placeholder="Assign Admin to..." />
                    </SelectTrigger>
                    <SelectContent>
                        {users.map((u) => (
                            <SelectItem key={u._id} value={u.fullName || ""}>
                                {u.fullName || u.email}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        );
    };

    /** ----------------- Update helpers ----------------- */
    const setNestedValue = (val: any, field: keyof Company | string, index?: number, subField?: string) => {
        SetCompany((prev) => {
            if (!prev) return prev;
            if (field === "directors" || field === "shareholders" || field === "designatedContact") {
                return {
                    ...prev,
                    [field]: Array.isArray(prev[field])
                        ? (prev[field] as any[]).map((item, i) => (i === index ? { ...item, [subField as string]: val } : item))
                        : prev[field],
                } as Company;
            }
            return { ...prev, [field]: val } as Company;
        });
    };

    const handleSaveField = (field: string, idx?: number, key?: string) => {
        setNestedValue(editValue, field as any, idx, key);
        setEditingField(null);
        setEditingCell(null);
    };

    const handleCancelEdit = () => {
        setEditingField(null);
        setEditingCell(null);
        setEditValue("");
    };

    const handleEdit = (field: string, currentValue: any) => {
        setEditingField(field);
        setEditValue(currentValue || "");
    };

    const renderEditableCell = (field: string, value: any) => {
        if (editingField === field) {
            return (
                <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="h-8"
                    autoFocus
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveField(field);
                        if (e.key === "Escape") handleCancelEdit();
                    }}
                />
            );
        }
        return <span className="text-sm">{value || "—"}</span>;
    };

    const renderActionButtons = (field: string, value: any) => {
        if (editingField === field) {
            return (
                <div className="flex items-center gap-1.5">
                    <Button size="sm" variant="ghost" onClick={() => handleSaveField(field)} className="h-7 w-7 p-0 text-green-600">
                        <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="h-7 w-7 p-0 text-red-600">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            );
        }
        return (
            <Button
                size="sm"
                variant="ghost"
                onClick={() => handleEdit(field, value)}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
            >
                <Edit2 className="h-4 w-4" />
            </Button>
        );
    };

    const handleEdit1 = (
        type: "directors" | "shareholders" | "designatedContact",
        idx: number,
        key: string,
        currentValue: any
    ) => {
        setEditingCell({ type, idx, key });
        setEditValue(currentValue || "");
    };

    const renderEditableCell1 = (
        type: "directors" | "shareholders" | "designatedContact",
        value: any,
        idx: number,
        key: string
    ) => {
        const isEditing = editingCell?.type === type && editingCell?.idx === idx && editingCell?.key === key;
        if (isEditing) {
            return (
                <div className="flex items-center gap-2">
                    <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="h-8"
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveField(type, idx, key);
                            if (e.key === "Escape") handleCancelEdit();
                        }}
                    />
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSaveField(type, idx, key)}
                        className="h-7 w-7 p-0 text-green-600"
                    >
                        <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="h-7 w-7 p-0 text-red-600">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            );
        }
        return (
            <div className="flex items-center justify-between">
                <span className="text-sm">{value || "—"}</span>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit1(type, idx, key, value)}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                >
                    <Edit2 className="h-4 w-4" />
                </Button>
            </div>
        );
    };

    const handleUpdate = async () => {
        try {
            setIsSaving(true);
            const updated = await updateCurrentClient(comp);
            if (updated) {
                SetCompany(updated);
                toast({
                    title: "Company details updated",
                    description: "The company information has been saved successfully.",
                });
            } else {
                toast({
                    title: "Save failed",
                    description: "There was an error updating the company information.",
                    variant: "destructive",
                });
            }
        } finally {
            setIsSaving(false);
        }
    };

    const percent = (part?: number, total?: number) =>
        part && total ? `${((Number(part) / Number(total)) * 100).toFixed(2)}%` : "—";

    return (
        <Tabs defaultValue="details" className="flex w-full flex-col">
            <TabsList className="flex w-full rounded-t-lg border-b bg-background/80 p-1">
                <TabsTrigger value="details" className="flex-1 rounded-md py-3 text-md font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
                    Company Details
                </TabsTrigger>
                <TabsTrigger value="service-agreement" className="flex-1 rounded-md py-3 text-md font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
                    Record of Documents
                </TabsTrigger>
                {user?.role !== "user" && (
                    <TabsTrigger value="Memos" className="flex-1 rounded-md py-3 text-md font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
                        Memo
                    </TabsTrigger>
                )}
                {user?.role !== "user" && (
                    <TabsTrigger value="Projects" className="flex-1 rounded-md py-3 text-md font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
                        Project
                    </TabsTrigger>
                )}
                <TabsTrigger value="Checklist" className="flex-1 rounded-md py-3 text-md font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
                    Checklist
                </TabsTrigger>
            </TabsList>

            {/* DETAILS TAB */}
            <TabsContent value="details" className="p-4 lg:p-6">
                {/* Header actions (Todo + Assign + Docs) */}
                {user?.role !== "user" && comp?.companyNameEng && (
                    <div className="mb-4">
                        <TodoApp id={id} name={comp.companyNameEng} />
                    </div>
                )}
                <div className="flex items-center gap-x-8">
                    {user?.role !== "user" && <AssignAdmin />}
                    <Button onClick={() => navigate(`/company-documents/ccp/${id}`)} size="sm" className="flex items-center gap-2">
                        Company Docs
                    </Button>
                </div>

                <div className="mx-auto max-w-7xl p-2 pb-24">
                    {/* LEFT — now full width */}
                    <div className="grid gap-6">
                        {/* Company header card */}
                        <Card>
                            <CardHeader className="pb-2">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                        <Building2 className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <CardTitle className="truncate text-xl">
                                                    {comp?.companyNameEng || comp?.companyNameChi || "Untitled Company"}
                                                </CardTitle>

                                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                                    <Badge variant="secondary" className="text-muted-foreground">
                                                        {comp?.jurisdiction || "—"}
                                                    </Badge>

                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-muted-foreground">Status</span>
                                                        {/* Keep inline-edit style for status to mirror earlier UI */}
                                                        <div className="flex items-center gap-1">
                                                            {renderEditableCell("status", comp?.status)}
                                                            {renderActionButtons("status", comp?.status)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Edit hint (optional global) */}
                                            <div className="hidden shrink-0 items-center gap-2 md:flex">
                                                <Badge variant="outline" className="text-muted-foreground">
                                                    Inline editing enabled
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="grid gap-5">
                                {/* Basic info */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <LabelValue label="Company Name (EN)">
                                        <div className="flex items-center justify-between gap-2">
                                            {renderEditableCell("companyNameEng", comp?.companyNameEng)}
                                            {renderActionButtons("companyNameEng", comp?.companyNameEng)}
                                        </div>
                                    </LabelValue>

                                    <LabelValue label="Company Name (ZH)">
                                        <div className="flex items-center justify-between gap-2">
                                            {renderEditableCell("companyNameChi", comp?.companyNameChi)}
                                            {renderActionButtons("companyNameChi", comp?.companyNameChi)}
                                        </div>
                                    </LabelValue>

                                    <LabelValue label="Company Type">
                                        <div className="flex items-center justify-between gap-2">
                                            {renderEditableCell("companyType", comp?.companyType)}
                                            {renderActionButtons("companyType", comp?.companyType)}
                                        </div>
                                    </LabelValue>

                                    <LabelValue label="BRN Number">
                                        <div className="flex items-center justify-between gap-2">
                                            {renderEditableCell("brnNo", comp?.brnNo)}
                                            {renderActionButtons("brnNo", comp?.brnNo)}
                                        </div>
                                    </LabelValue>

                                    <LabelValue label="Incorporation Date">
                                        <div className="flex items-center justify-between gap-2">
                                            {renderEditableCell("incorporationDate", comp?.incorporationDate)}
                                            {renderActionButtons("incorporationDate", comp?.incorporationDate)}
                                        </div>
                                    </LabelValue>

                                    <LabelValue label="Bank">
                                        <div className="flex items-center justify-between gap-2">
                                            {renderEditableCell("bank", comp?.bank)}
                                            {renderActionButtons("bank", comp?.bank)}
                                        </div>
                                    </LabelValue>

                                    <LabelValue label="Total Shares">
                                        <div className="flex items-center justify-between gap-2">
                                            {renderEditableCell("noOfShares", comp?.noOfShares)}
                                            {renderActionButtons("noOfShares", comp?.noOfShares)}
                                        </div>
                                    </LabelValue>

                                    <LabelValue label="Share Capital">
                                        <div className="flex items-center justify-between gap-2">
                                            {renderEditableCell("shareCapital", comp?.shareCapital)}
                                            {renderActionButtons("shareCapital", comp?.shareCapital)}
                                        </div>
                                    </LabelValue>
                                </div>

                                <Separator />

                                {/* Jurisdiction */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <LabelValue label="Jurisdiction">
                                        <div className="flex items-center justify-between gap-2">
                                            {renderEditableCell("jurisdiction", comp?.jurisdiction)}
                                            {renderActionButtons("jurisdiction", comp?.jurisdiction)}
                                        </div>
                                    </LabelValue>
                                </div>

                                <Separator />

                                {/* Designated contact */}
                                <div className="grid gap-3">
                                    <div className="text-xs text-muted-foreground">Designated Contact</div>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <LabelValue label="Name">
                                            {renderEditableCell1("designatedContact", comp?.designatedContact?.[0]?.name, 0, "name")}
                                        </LabelValue>
                                        <LabelValue label="Email">
                                            {renderEditableCell1("designatedContact", comp?.designatedContact?.[0]?.email, 0, "email")}
                                        </LabelValue>
                                        <LabelValue label="Phone">
                                            {renderEditableCell1("designatedContact", comp?.designatedContact?.[0]?.phone, 0, "phone")}
                                        </LabelValue>
                                    </div>
                                </div>

                                <Separator />

                                {/* Directors */}
                                <div className="grid gap-3">
                                    <div className="text-xs text-muted-foreground">Directors</div>
                                    <div className="grid gap-3">
                                        {comp?.directors?.map((d, idx) => (
                                            <div key={`director-${idx}`} className="rounded-md border p-3">
                                                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                                    <LabelValue label="Name">
                                                        <div className="flex items-center gap-2">
                                                            <FallbackAvatar name={d?.name} />
                                                            {renderEditableCell1("directors", d?.name, idx, "name")}
                                                        </div>
                                                    </LabelValue>
                                                    <LabelValue label="Email">{renderEditableCell1("directors", d?.email, idx, "email")}</LabelValue>
                                                    <LabelValue label="Phone">{renderEditableCell1("directors", d?.phone, idx, "phone")}</LabelValue>
                                                </div>
                                            </div>
                                        ))}
                                        {!comp?.directors?.length && <div className="text-sm text-muted-foreground">No directors added.</div>}
                                    </div>
                                </div>

                                <Separator />

                                {/* Shareholders */}
                                <div className="grid gap-3">
                                    <div className="text-xs text-muted-foreground">Shareholders</div>
                                    <div className="grid gap-3">
                                        {comp?.shareholders?.map((s, idx) => (
                                            <div key={`shareholder-${idx}`} className="rounded-md border p-3">
                                                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                                                    <LabelValue label="Name">{renderEditableCell1("shareholders", s?.name, idx, "name")}</LabelValue>
                                                    <LabelValue label="Email">{renderEditableCell1("shareholders", s?.email, idx, "email")}</LabelValue>
                                                    <LabelValue label="Total Shares">
                                                        {renderEditableCell1("shareholders", s?.totalShares, idx, "totalShares")}
                                                    </LabelValue>
                                                    <LabelValue label="Percentage">{percent(s?.totalShares, comp?.noOfShares)}</LabelValue>
                                                </div>
                                            </div>
                                        ))}
                                        {!comp?.shareholders?.length && (
                                            <div className="text-sm text-muted-foreground">No shareholders added.</div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT */}
                    {/* Payment (mirrors the “above styling” structure; fields optional/placeholder) */}
                    {/* <div className="grid gap-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Banknote className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">Payment</CardTitle>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="gap-1">
                        <ReceiptText className="h-3.5 w-3.5" />
                        {(comp as any)?.payMethod?.toUpperCase?.() || "—"}
                      </Badge>
                      {(comp as any)?.bankRef && (
                        <Badge variant="outline" className="gap-1">
                          Ref: {(comp as any)?.bankRef}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="grid grid-cols-4 items-center gap-3">
                  <Label className="text-right">Amount</Label>
                  <div className="col-span-3 text-sm font-medium">{(comp as any)?.finalAmount ? `${(comp as any)?.finalAmount} USD` : "—"}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-3">
                  <Label className="text-right">Receipt</Label>
                  <div className="col-span-3 text-sm text-muted-foreground">—</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">Compliance & Declarations</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <LabelValue label="Truthfulness">
                    <BoolPill value={!!(comp as any)?.truthfulnessDeclaration} />
                  </LabelValue>
                  <LabelValue label="Legal Terms">
                    <BoolPill value={!!(comp as any)?.legalTermsAcknowledgment} />
                  </LabelValue>
                  <LabelValue label="Compliance Precondition">
                    <BoolPill value={!!(comp as any)?.compliancePreconditionAcknowledgment} />
                  </LabelValue>
                  <LabelValue label="Contact Email">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3.5 w-3.5" />
                      {(comp as any)?.contactEmail || "—"}
                    </div>
                  </LabelValue>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-3">
                  <LabelValue label="Contact Phone">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3.5 w-3.5" />
                      {(comp as any)?.contactPhone || "—"}
                    </div>
                  </LabelValue>
                  <LabelValue label="Notes">{(comp as any)?.softNote || "—"}</LabelValue>
                </div>
              </CardContent>
            </Card>
          </div> */}

                    {/* Sticky save bar */}
                    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 p-3">
                            <div className="text-xs text-muted-foreground">
                                Status: <strong>{comp?.status || "Pending"}</strong>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button onClick={handleUpdate}>
                                    <Save className="mr-1 h-4 w-4" /> {isSaving ? "Saving..." : "Save"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </TabsContent>

            {/* OTHER TABS (unchanged, wrapped in cleaner containers) */}
            <TabsContent value="service-agreement" className="p-6">
                <div className="space-y-6">
                    <h1 className="text-2xl font-bold">Service Agreement Details</h1>
                    <Card>
                        <CardContent className="py-6 text-sm text-muted-foreground">—</CardContent>
                    </Card>
                </div>
            </TabsContent>

            <TabsContent value="Memos" className="p-6">
                <div className="space-y-6">
                    <MemoApp id={id} />
                </div>
            </TabsContent>

            <TabsContent value="Projects" className="p-6">
                <div className="space-y-6">
                    <AdminProject id={id} />
                </div>
            </TabsContent>

            <TabsContent value="Checklist" className="p-6">
                <ChecklistHistory id={id} items={[[], []]} />
            </TabsContent>
        </Tabs>
    );
};

export default OldCCCDetail;
