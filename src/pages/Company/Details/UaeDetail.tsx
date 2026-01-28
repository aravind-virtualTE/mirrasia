/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getCommonIncorpoDataById,
  upsertCommonIncorpo,
  deleteCommonIncorpo,
  fetchUsers,
  sendInviteToShDir,
} from "@/services/dataFetch";

import { useToast } from "@/hooks/use-toast";
import { paymentApi } from "@/lib/api/payment";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Building2, Banknote, ReceiptText, ShieldCheck, Mail, Phone, Pencil, X, Save, Trash2, Send } from "lucide-react";

import MemoApp from "./MemosHK";
import TodoApp from "@/pages/Todo/TodoApp";
import AdminProject from "@/pages/dashboard/Admin/Projects/AdminProject";
import ChecklistHistory from "@/pages/Checklist/ChecklistHistory";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { STATUS_OPTIONS } from "./detailData";
import { t } from "i18next";

type User = { _id: string; fullName?: string; email: string; role: string };

const COUNTRY_CODE = "AE";
const COUNTRY_LABEL = "Uae";

/** ---------------- helpers ---------------- */
function fmtDate(d?: string | Date) {
  if (!d) return "—";
  const dt = typeof d === "string" ? new Date(d) : d;
  const ts = +dt;
  if (Number.isNaN(ts)) return "—";
  return dt.toISOString().slice(0, 10);
}

const toYesNoBool = (v: any) => {
  if (typeof v === "boolean") return v;
  if (v == null) return undefined;
  const s = String(v).trim().toLowerCase();
  return s === "yes" || s === "true";
};

const FallbackAvatar: React.FC<{ name?: string | null }> = ({ name }) => {
  const initials = (name || "")
    .split(" ")
    .map((s) => s?.[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
      {initials || "?"}
    </div>
  );
};

const LabelValue: React.FC<{ label: string; children?: React.ReactNode }> = ({ label, children }) => (
  <div className="grid gap-1">
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="text-sm">{children ?? "—"}</div>
  </div>
);

const BoolPill: React.FC<{ value?: boolean }> = ({ value }) => (
  <Badge variant={value ? "default" : "outline"} className={!value ? "text-muted-foreground" : ""}>
    {value ? "YES" : "NO"}
  </Badge>
);

/** Map companyName_1/2/3 <-> array for UI editing */
const namesFromFields = (data: any): string[] => {
  const arr = Array.isArray(data?.companyName) ? data.companyName : [];
  const n1 = data?.companyName_1 ?? arr[0] ?? "";
  const n2 = data?.companyName_2 ?? arr[1] ?? "";
  const n3 = data?.companyName_3 ?? arr[2] ?? "";
  return [n1 || "", n2 || "", n3 || ""];
};

const fieldsFromNames = (arr: string[]) => ({
  companyName_1: arr?.[0] || "",
  companyName_2: arr?.[1] || "",
  companyName_3: arr?.[2] || "",
});

const AssignAdmin: React.FC<{
  users: User[];
  adminAssigned: string;
  setAdminAssigned: (v: string) => void;
}> = ({ users, adminAssigned, setAdminAssigned }) => (
  <div className="flex items-center gap-3">
    <span className="text-sm font-medium">Assign Admin:</span>
    <Select value={adminAssigned} onValueChange={setAdminAssigned}>
      <SelectTrigger className="w-60 h-8 text-xs">
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

/** ---------------- component ---------------- */
const UaeDetail: React.FC<{ id: string }> = ({ id }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [adminAssigned, setAdminAssigned] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  const [session, setSession] = useState<any>({
    _id: "",
    amount: 0,
    currency: "",
    expiresAt: "",
    status: "",
    paymentId: "",
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null;
  const isAdmin = user?.role !== "user";

  /** bootstrap */
  useEffect(() => {
    const bootstrap = async () => {
      const data = await getCommonIncorpoDataById(COUNTRY_CODE, `${id}`);

      const hydrated = {
        ...(data || {}),
        companyName: namesFromFields(data || {}),
        parties: Array.isArray(data?.parties) ? data.parties : [],
      };

      setForm(hydrated);
      setAdminAssigned(data?.assignedTo || "");

      // Optional: if you use sessionId in these common forms, keep this.
      if (data?.sessionId) {
        try {
          const s = await paymentApi.getSession(data.sessionId);
          setSession({
            _id: s._id,
            amount: s.amount,
            currency: s.currency,
            expiresAt: s.expiresAt,
            status: s.status,
            paymentId: s.paymentId,
          });
        } catch (e) { console.log("err", e) }
      }

      const u = await fetchUsers();
      setUsers((u || []).filter((e: { role: string }) => e.role === "admin" || e.role === "master"));
    };

    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /** tiny patch helpers */
  const patchForm = (key: string, value: any) => setForm((p: any) => ({ ...(p || {}), [key]: value }));

  const patchNames = (i: number, value: string) => {
    setForm((p: any) => {
      const next = [...(p?.companyName || ["", "", ""])];
      while (next.length < 3) next.push("");
      next[i] = value;
      const fields = fieldsFromNames(next);
      return { ...(p || {}), companyName: next, ...fields };
    });
  };

  const updatePartyAt = (index: number, patch: any) => {
    setForm((p: any) => {
      if (!p || !Array.isArray(p.parties)) return p;
      const arr = [...p.parties];
      arr[index] = { ...(arr[index] || {}), ...patch };
      return { ...p, parties: arr };
    });
  };

  const onSave = async () => {
    try {
      setIsSaving(true);

      // keep name fields consistent
      const names = namesFromFields(form);
      const nameFields = fieldsFromNames(names);

      const payload = {
        ...(form || {}),
        ...nameFields,
        assignedTo: adminAssigned || "",
        // ensure safe defaults
        email: form?.email || "",
        name: form?.name || "",
        phoneNum: form?.phoneNum || "",
        parties: Array.isArray(form?.parties) ? form.parties : [],
      };

      const resp = await upsertCommonIncorpo(COUNTRY_CODE, payload, form?._id || id);
      if (resp?._id) {
        setForm({
          ...(resp || {}),
          companyName: namesFromFields(resp || {}),
          parties: Array.isArray(resp?.parties) ? resp.parties : [],
        });
        toast({ description: "Record updated successfully" });
      } else {
        toast({ description: "Update failed. Please try again.", variant: "destructive" });
      }
    } catch (e: any) {
      toast({ description: e?.message || "Unexpected error", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const onDelete = async () => {
    try {
      const resp = await deleteCommonIncorpo(COUNTRY_CODE, id);
      console.log("resp", resp)
      toast({ title: "Success", description: "Company record deleted." });
      if (isAdmin) navigate("/admin-dashboard");
      else navigate("/dashboard");
    } catch (e: any) {
      toast({ description: e?.message || "Delete failed", variant: "destructive" });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const sendInvite = async (party: any) => {
    try {
      const payload = {
        _id: id || "",
        inviteData: [{ email: party.email || "", name: party.name || "", isDcp: !!party.isDcp }],
        country: COUNTRY_CODE,
      };
      const response = await sendInviteToShDir(payload);

      if (response?.summary?.successful > 0) {
        toast({
          title: t("newHk.parties.toasts.invite.success.title"),
          description: t("newHk.parties.toasts.invite.success.desc", {
            count: response.summary.successful,
          }),
        });

        // Mark invited locally (simple approach)
        setForm((p: any) => {
          const updated = Array.isArray(p?.parties)
            ? p.parties.map((x: any) => ({ ...x, invited: true, status: "Invited" }))
            : [];
          return { ...(p || {}), parties: updated, users: response.users };
        });
      }

      if (response?.summary?.alreadyExists > 0) {
        toast({
          title: t("newHk.parties.toasts.invite.exists.title"),
          description: t("newHk.parties.toasts.invite.exists.desc"),
        });
      }

      if (response?.summary?.failed > 0) {
        toast({
          title: t("newHk.parties.toasts.invite.failed.title"),
          description: t("newHk.parties.toasts.invite.failed.desc"),
        });
      }
    } catch (e: any) {
      toast({ description: e?.message || "Invite failed", variant: "destructive" });
    }
  };

  /** deriveds */
  const namesArr = form?.companyName || ["", "", ""];
  const primaryName = namesArr[0] || form?.companyName_1 || "";
  const alt1 = namesArr[1] || form?.companyName_2 || "";
  const alt2 = namesArr[2] || form?.companyName_3 || "";
  const altNames = [alt1, alt2].filter(Boolean);

  const contactName = form?.name || "";
  const email = form?.email || "";
  const phone = form?.phoneNum || "";
  const currentStatus = form?.incorporationStatus || "Pending";

  if (!form) {
    return (
      <div className="p-6">
        <div className="text-sm text-muted-foreground">Loading Belize company details…</div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="details" className="flex flex-col w-full mx-auto">
      <TabsList className="flex w-full p-1 bg-background/80 rounded-t-lg border-b">
        <TabsTrigger
          value="details"
          className="flex-1 py-3 text-md font-medium rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
        >
          Company Details
        </TabsTrigger>

        <TabsTrigger
          value="service-agreement"
          className="flex-1 py-3 text-md font-medium rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
        >
          Record of Documents
        </TabsTrigger>

        {user?.role !== "user" && (
          <TabsTrigger
            value="Memos"
            className="flex-1 py-3 text-md font-medium rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            Memo
          </TabsTrigger>
        )}

        {user?.role !== "user" && (
          <TabsTrigger
            value="Projects"
            className="flex-1 py-3 text-md font-medium rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            Project
          </TabsTrigger>
        )}

        <TabsTrigger
          value="Checklist"
          className="flex-1 py-3 text-md font-medium rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
        >
          Checklist
        </TabsTrigger>
      </TabsList>

      {/* DETAILS */}
      <TabsContent value="details" className="p-4 md:p-6">
        {primaryName && <TodoApp id={id} name={primaryName} />}

        <div className="flex gap-x-8 mt-4">
          {user?.role !== "user" && (
            <AssignAdmin users={users} adminAssigned={adminAssigned} setAdminAssigned={setAdminAssigned} />
          )}

          <Button
            onClick={() => navigate(`/company-documents/${COUNTRY_CODE}/${id}`)}
            size="sm"
            className="flex items-center gap-2"
          >
            Company Docs
          </Button>
          <Button onClick={() => navigate(-1)} size="sm" className="flex items-center gap-2">
            Return to Previous Details
          </Button>
        </div>

        <div className="mx-auto grid max-width gap-6 p-4 lg:grid-cols-3 pb-24">
          {/* LEFT */}
          <div className="lg:col-span-2 grid gap-6 min-w-0">
            <Card className="min-w-0">
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        {!isEditing ? (
                          <CardTitle className="text-xl truncate">{primaryName || "Untitled Company"}</CardTitle>
                        ) : (
                          <Input
                            value={primaryName}
                            onChange={(e) => patchNames(0, e.target.value)}
                            className="h-8 text-base"
                            placeholder="Company Name"
                          />
                        )}

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="text-muted-foreground">
                            {COUNTRY_LABEL} • {COUNTRY_CODE}
                          </Badge>

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Incorporation Status</span>

                            {user?.role !== "user" ? (
                              <Select value={currentStatus} onValueChange={(val) => patchForm("incorporationStatus", val)}>
                                <SelectTrigger className="h-7 w-[240px]">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  {STATUS_OPTIONS.map((s) => (
                                    <SelectItem key={s} value={s}>
                                      {s}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge variant="default">{currentStatus}</Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* edit toggle */}
                      <div className="flex shrink-0 items-center gap-2">
                        {isAdmin ? (
                          <button
                            className="text-red-500 hover:red-blue-700 transition"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        ) : null}

                        {isAdmin &&
                          (!isEditing ? (
                            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                              <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                              <X className="mr-1 h-3.5 w-3.5" /> Cancel
                            </Button>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="grid gap-5 min-w-0">
                {/* Basic info */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <LabelValue label="Applicant">
                    <div className="flex items-center gap-2">
                      <FallbackAvatar name={contactName} />
                      <span className="font-medium">{contactName || "—"}</span>
                    </div>
                  </LabelValue>

                  <LabelValue label="Contact">
                    <div className="grid gap-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5" />
                        <span className="text-sm">{email || "—"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5" />
                        <span className="text-sm">{phone || "—"}</span>
                      </div>
                    </div>
                  </LabelValue>

                  <LabelValue label="Alternative Names (2/3)">
                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-2">
                        <Input value={alt1} onChange={(e) => patchNames(1, e.target.value)} placeholder="Name 2" className="h-8" />
                        <Input value={alt2} onChange={(e) => patchNames(2, e.target.value)} placeholder="Name 3" className="h-8" />
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {altNames.length ? (
                          altNames.map((n, i) => (
                            <Badge key={String(n) + i} variant="secondary">
                              {n}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                    )}
                  </LabelValue>

                  <LabelValue label="BRN / Ref No">{form?.brnNo || "—"}</LabelValue>

                  <LabelValue label="Assigned To">{adminAssigned || form?.assignedTo || "—"}</LabelValue>

                  <LabelValue label="Payment Status">
                    <Badge variant={form?.paymentStatus === "paid" ? "default" : "outline"}>
                      {form?.paymentStatus || "unpaid"}
                    </Badge>
                  </LabelValue>
                </div>

                <Separator />

                {/* Parties */}
                <div className="space-y-3 min-w-0">
                  <div className="text-sm font-medium">Shareholders / Directors / DCP</div>

                  {Array.isArray(form?.parties) && form.parties.length ? (
                    <div className="rounded-md border min-w-0 overflow-hidden">
                      <div className="w-full max-w-full overflow-x-auto overflow-y-hidden">
                        <Table className="w-max min-w-full">
                          <TableHeader>
                            <TableRow className="whitespace-nowrap">
                              <TableHead className="w-[120px]">Name</TableHead>
                              <TableHead className="w-[180px]">Email</TableHead>
                              <TableHead className="w-[110px]">Phone</TableHead>
                              <TableHead className="w-[80px]">Shares</TableHead>
                              <TableHead className="w-[120px]">Share Type</TableHead>
                              <TableHead className="w-[80px]">Director</TableHead>
                              <TableHead className="w-[80px]">DCP</TableHead>
                              <TableHead className="w-[120px]">Significant</TableHead>
                              <TableHead className="w-[160px]">Status</TableHead>
                            </TableRow>
                          </TableHeader>

                          <TableBody>
                            {form.parties.map((p: any, index: number) => (
                              <TableRow key={p._id || index} className="align-top">
                                <TableCell className="font-medium">
                                  {isAdmin && isEditing ? (
                                    <Input
                                      className="h-8 w-full min-w-[180px]"
                                      placeholder="Name"
                                      value={p.name || ""}
                                      onChange={(e) => updatePartyAt(index, { name: e.target.value })}
                                    />
                                  ) : (
                                    <span className="block max-w-[220px] truncate">{p.name || "—"}</span>
                                  )}
                                </TableCell>

                                <TableCell>
                                  {isAdmin && isEditing ? (
                                    <Input
                                      className="h-8 w-full min-w-[200px]"
                                      type="email"
                                      placeholder="Email"
                                      value={p.email || ""}
                                      onChange={(e) => updatePartyAt(index, { email: e.target.value })}
                                    />
                                  ) : (
                                    <span className="block max-w-[240px] truncate">{p.email || "—"}</span>
                                  )}
                                </TableCell>

                                <TableCell>
                                  {isAdmin && isEditing ? (
                                    <Input
                                      className="h-8 w-full min-w-[140px]"
                                      placeholder="Phone"
                                      value={p.phone || ""}
                                      onChange={(e) => updatePartyAt(index, { phone: e.target.value })}
                                    />
                                  ) : (
                                    <span className="block max-w-[160px] truncate">{p.phone || "—"}</span>
                                  )}
                                </TableCell>

                                <TableCell className="whitespace-nowrap">
                                  {isAdmin && isEditing ? (
                                    <Input
                                      className="h-8 w-full min-w-[90px]"
                                      type="number"
                                      placeholder="Shares"
                                      value={p.shares ?? ""}
                                      onChange={(e) => {
                                        const raw = e.target.value;
                                        const val = raw === "" ? undefined : Number(raw);
                                        updatePartyAt(index, { shares: val });
                                      }}
                                    />
                                  ) : (
                                    p.shares ?? "—"
                                  )}
                                </TableCell>

                                <TableCell>
                                  {isAdmin && isEditing ? (
                                    <Input
                                      className="h-8 w-full min-w-[120px]"
                                      placeholder="Share type"
                                      value={p.typeOfShare || ""}
                                      onChange={(e) => updatePartyAt(index, { typeOfShare: e.target.value })}
                                    />
                                  ) : (
                                    <span className="block max-w-[140px] truncate">{p.typeOfShare || "—"}</span>
                                  )}
                                </TableCell>

                                <TableCell className="whitespace-nowrap">
                                  {isAdmin && isEditing ? (
                                    <div className="flex items-center gap-2">
                                      <Switch
                                        checked={!!p.isDirector}
                                        onCheckedChange={(checked) => updatePartyAt(index, { isDirector: checked })}
                                      />
                                      <span className="text-xs text-muted-foreground">Director</span>
                                    </div>
                                  ) : (
                                    <BoolPill value={!!p.isDirector} />
                                  )}
                                </TableCell>

                                <TableCell className="whitespace-nowrap">
                                  {isAdmin && isEditing ? (
                                    <div className="flex items-center gap-2">
                                      <Switch
                                        checked={!!p.isDcp}
                                        onCheckedChange={(checked) => updatePartyAt(index, { isDcp: checked })}
                                      />
                                      <span className="text-xs text-muted-foreground">DCP</span>
                                    </div>
                                  ) : (
                                    <BoolPill value={!!p.isDcp} />
                                  )}
                                </TableCell>

                                <TableCell className="whitespace-nowrap">
                                  {isAdmin && isEditing ? (
                                    <div className="flex items-center gap-2">
                                      <Switch
                                        checked={!!p.isSignificant}
                                        onCheckedChange={(checked) => updatePartyAt(index, { isSignificant: checked })}
                                      />
                                      <span className="text-xs text-muted-foreground">Significant</span>
                                    </div>
                                  ) : (
                                    <BoolPill value={!!p.isSignificant} />
                                  )}
                                </TableCell>

                                <TableCell className="py-3">
                                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between min-w-0">
                                    <Badge className="max-w-[140px] truncate">{p.status || "—"}</Badge>

                                    {isAdmin && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="shrink-0 inline-flex items-center gap-1"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          sendInvite(p);
                                        }}
                                      >
                                        <Send className="h-3.5 w-3.5" />
                                        <span className="hidden sm:inline">Remind</span>
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">No parties added.</div>
                  )}
                </div>

                <Separator />

                {/* Dates & toggles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <LabelValue label="Incorporation Date">
                    <div className="flex items-center gap-2">
                      <span>{form?.incorporationDate ? fmtDate(form.incorporationDate) : "—"}</span>

                      {isAdmin && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Incorporation Date</DialogTitle>
                              <DialogDescription>Set the date when the company was officially registered.</DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-2">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="incorporationDate" className="text-right">
                                  Date
                                </Label>
                                <Input
                                  id="incorporationDate"
                                  type="date"
                                  value={form?.incorporationDate ? String(form.incorporationDate).slice(0, 10) : ""}
                                  onChange={(e) => patchForm("incorporationDate", e.target.value)}
                                  className="col-span-3"
                                />
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </LabelValue>

                  <LabelValue label="AML/CDD Edit">
                    <div className="flex items-center gap-2">
                      <BoolPill value={!form?.isDisabled} />
                      {isAdmin && (
                        <Switch checked={!form?.isDisabled} onCheckedChange={(checked) => patchForm("isDisabled", !checked)} />
                      )}
                    </div>
                  </LabelValue>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT */}
          <div className="grid gap-6">
            {/* Payment */}
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
                        {(form?.payMethod || "").toUpperCase() || "—"}
                      </Badge>
                      {form?.bankRef && <Badge variant="outline" className="gap-1">Ref: {form.bankRef}</Badge>}
                      {form?.paymentStatus === "paid" && form?.stripeLastStatus === "succeeded" && form?.stripeReceiptUrl && (
                        <Badge className="bg-emerald-600 hover:bg-emerald-600">Stripe Paid</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <div className="text-xs text-muted-foreground">Receipt / Proof</div>

                  {form?.paymentStatus === "paid" && form?.stripeLastStatus === "succeeded" && form?.stripeReceiptUrl ? (
                    <div className="rounded-md border bg-emerald-50 p-4 text-emerald-800">
                      <div className="text-sm font-medium">Payment successful via Stripe.</div>
                      <a href={form.stripeReceiptUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center text-sm underline">
                        View Stripe Receipt
                      </a>
                    </div>
                  ) : form?.uploadReceiptUrl ? (
                    <div className="space-y-3">
                      <a href={form.uploadReceiptUrl} target="_blank" rel="noreferrer" className="group relative block overflow-hidden rounded-md border">
                        <img src={form.uploadReceiptUrl} alt="Payment receipt" className="h-44 w-full object-cover transition-transform duration-200 group-hover:scale-[1.01]" />
                      </a>

                      {isAdmin && (
                        <div className="flex items-center gap-3">
                          <Label className="text-sm font-medium">Payment Status:</Label>
                          <Select value={form?.paymentStatus || "unpaid"} onValueChange={(val) => patchForm("paymentStatus", val)}>
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unpaid">Pending</SelectItem>
                              <SelectItem value="paid">Paid</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">No file uploaded</div>
                  )}
                </div>

                <div className="grid gap-4 py-2">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Amount</Label>
                    <div className="col-span-3 text-sm font-medium">
                      {form?.amount ? `${form.amount} ${form?.currency || "USD"}` : session?.amount ? `${session.amount} ${session.currency || "USD"}` : "—"}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="expiresAt" className="text-right">
                      Expires
                    </Label>
                    {isAdmin ? (
                      <Input
                        id="expiresAt"
                        type="date"
                        value={form?.expiresAt ? String(form.expiresAt).slice(0, 10) : ""}
                        onChange={(e) => patchForm("expiresAt", e.target.value)}
                        className="col-span-3"
                      />
                    ) : (
                      <div className="col-span-3 text-sm">{form?.expiresAt ? fmtDate(form.expiresAt) : "—"}</div>
                    )}
                  </div>

                  {form?.receiptUrl && (
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label className="text-right">Receipt</Label>
                      <div className="col-span-3">
                        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                          <SheetTrigger asChild>
                            <Button variant="outline" size="sm">
                              View Receipt
                            </Button>
                          </SheetTrigger>
                          <SheetContent side="right" className="w-full max-w-[40vw]" style={{ width: "40vw", maxWidth: "40vw" }}>
                            <SheetHeader>
                              <SheetTitle>Receipt</SheetTitle>
                            </SheetHeader>
                            <div className="mt-4 space-y-4">
                              <iframe src={form.receiptUrl} className="w-full h-[calc(100vh-200px)]" title="Receipt" />
                            </div>
                          </SheetContent>
                        </Sheet>
                      </div>
                    </div>
                  )}

                  <Button variant="outline" size="sm" className="w-full justify-center" onClick={() => setInvoiceOpen(true)}>
                    <ReceiptText className="mr-2 h-4 w-4" />
                    View Invoice
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Compliance */}
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

              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <LabelValue label="Legal & Ethical Concern">
                    <BoolPill value={toYesNoBool(form?.legalAndEthicalConcern)} />
                  </LabelValue>
                  <LabelValue label="Sanctioned Countries Activity">
                    <BoolPill value={toYesNoBool(form?.q_country)} />
                  </LabelValue>
                  <LabelValue label="Sanctions Exposure">
                    <BoolPill value={toYesNoBool(form?.sanctionsExposureDeclaration)} />
                  </LabelValue>
                  <LabelValue label="Crimea/Sevastopol Presence">
                    <BoolPill value={toYesNoBool(form?.crimeaSevastapolPresence)} />
                  </LabelValue>
                  <LabelValue label="Russian Energy/Defense Presence">
                    <BoolPill value={toYesNoBool(form?.russianEnergyPresence)} />
                  </LabelValue>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <LabelValue label="Social App">{form?.sns || "—"}</LabelValue>
                  <LabelValue label="Handle / ID">{form?.snsId || "—"}</LabelValue>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sticky save bar */}
          {isAdmin && (
            <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="mx-auto flex max-width items-center justify-between gap-3 p-3">
                <div className="text-xs text-muted-foreground">
                  Status: <strong>{currentStatus}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={onSave} disabled={isSaving}>
                    <Save className="mr-1 h-4 w-4" /> {isSaving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </TabsContent>

      {/* RECORD OF DOCS */}
      <TabsContent value="service-agreement" className="p-6">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Record of Documents</h1>
          <div className="text-sm text-muted-foreground">Connect your documents component for BZ here.</div>
        </div>
      </TabsContent>

      {/* MEMOS */}
      <TabsContent value="Memos" className="p-6">
        <div className="space-y-6">
          <MemoApp id={id} />
        </div>
      </TabsContent>

      {/* PROJECTS */}
      <TabsContent value="Projects" className="p-6">
        <div className="space-y-6">
          <AdminProject id={id} />
        </div>
      </TabsContent>

      {/* CHECKLIST */}
      <TabsContent value="Checklist" className="p-6">
        <ChecklistHistory id={id} items={[[], []]} />
      </TabsContent>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={"Delete Record"}
        description="Are you sure you want to delete this record?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={onDelete}
      />

      <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
        <DialogContent className="sm:max-w-[900px] w-[95vw] p-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle>Invoice</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6">
            <div className="max-h-[70vh] overflow-y-auto">
              <h1>To be updated soon..</h1>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
};

export default UaeDetail;
