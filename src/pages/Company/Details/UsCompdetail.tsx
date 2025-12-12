/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { fetchUsers, getUsIncorpoDataById, markDeleteCompanyRecord, sendInviteToShDir, updateEditValues } from "@/services/dataFetch";
import { paymentApi } from "@/lib/api/payment";
import { useToast } from "@/hooks/use-toast";

import { usaAppWithResetAtom } from "../USA/UsState";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  Building2,
  Banknote,
  ShieldCheck,
  Mail,
  Phone,
  Pencil,
  X,
  Save,
  Trash2,
  ReceiptText,
  Send,
} from "lucide-react";

import MemoApp from "./MemosHK";
import TodoApp from "@/pages/Todo/TodoApp";
import AdminProject from "@/pages/dashboard/Admin/Projects/AdminProject";
import ChecklistHistory from "@/pages/Checklist/ChecklistHistory";
import { User } from "@/components/userList/UsersList";
import { usIncorporationItems, usRenewalList } from "./detailConstants";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { getShrMemberData, STATUS_OPTIONS } from "./detailData";
import UsIndividualShdrDetail from "@/components/shareholderDirector/UsIndividualDetail";
import UsCorporateShdrDetailDialog from "@/components/shareholderDirector/UsCorporateDetail";

// -------- helpers --------
function fmtDate(d?: string | Date) {
  if (!d) return "—";

  const dt = typeof d === "string" ? new Date(d) : d;

  // Simple invalid-date guard without using getTime()
  const timestamp = +dt; // same as Number(dt)
  if (Number.isNaN(timestamp)) return "—";

  // Date only (no time)
  return dt.toISOString().slice(0, 10);
}

const FallbackAvatar: React.FC<{ name?: string | null }> = ({ name }) => {
  const initials = (name || "")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
      {initials || "?"}
    </div>
  );
};

const LabelValue: React.FC<{ label: string; children?: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className="grid gap-1">
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="text-sm">{children ?? "—"}</div>
  </div>
);

// normalize objects like {id,value} or direct strings
const renderVal = (d: any) =>
  typeof d === "object" && d !== null ? d?.value ?? d?.id ?? "—" : d ?? "—";

const BoolPill: React.FC<{ value?: boolean }> = ({ value }) => (
  <Badge
    variant={value ? "default" : "outline"}
    className={!value ? "text-muted-foreground" : ""}
  >
    {value ? "YES" : "NO"}
  </Badge>
);

// -------- types --------
export type SessionData = {
  _id: string;
  amount: number;
  currency: string;
  expiresAt: string;
  status: string;
  paymentId: string;
};

// -------- main component --------
const UsCompdetail: React.FC<{ id: string }> = ({ id }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useAtom(usaAppWithResetAtom);
  const [users, setUsers] = useState<User[]>([]);
  const [adminAssigned, setAdminAssigned] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [taskToDelete, setTaskToDelete] = React.useState<{ companyId: string, countryCode: string } | null>(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [selectedData, setSelectedData] = React.useState<any>(null);

  const [session, setSession] = useState<SessionData>({
    _id: "",
    amount: 0,
    currency: "",
    expiresAt: "",
    status: "",
    paymentId: "",
  });

  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") as string)
    : null;
  const isAdmin = user?.role !== "user";

  // ---- bootstrap ----
  useEffect(() => {
    const bootstrap = async () => {
      const data = await getUsIncorpoDataById(`${id}`);
      setForm(data);
      setAdminAssigned(data.assignedTo || "");

      if (data.sessionId) {
        const s = await paymentApi.getSession(data.sessionId);
        setSession({
          _id: s._id,
          amount: s.amount,
          currency: s.currency,
          expiresAt: s.expiresAt,
          status: s.status,
          paymentId: s.paymentId,
        });
      }

      const u = await fetchUsers();
      setUsers(
        u.filter(
          (e: { role: string }) => e.role === "admin" || e.role === "master"
        )
      );
    };
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ---- patch helpers ----
  const patchForm = (key: keyof any, value: any) =>
    setForm({ ...form, [key]: value });

  const patchSession = (key: keyof SessionData, value: any) =>
    setSession({ ...session, [key]: value });

  // ---- assign admin ----
  const AssignAdmin: React.FC = () => (
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

  // ---- save ----
  const onSave = async () => {
    try {
      setIsSaving(true);
      // backend originally expected `companyName` array.
      const payload = JSON.stringify({
        company: {
          id: form._id,
          status: form.status,
          incorporationStatus: form.incorporationStatus,
          isDisabled: form.isDisabled,
          incorporationDate: form.incorporationDate,
          country: "US",
          companyName_1: form.companyName_1,
          companyName_2: form.companyName_2,
          companyName_3: form.companyName_3,
          paymentStatus: form.paymentStatus,
          shareHolders: form.shareHolders,
        },
        session: {
          id: session._id,
          expiresAt: session.expiresAt,
          status: session.status,
        },
        assignedTo: adminAssigned,
      });

      const resp = await updateEditValues(payload);
      if (resp?.success) {
        toast({ description: "Record updated successfully" });
      } else {
        toast({
          description: "Update failed. Please try again.",
          variant: "destructive",
        });
      }
    } catch (e: any) {
      toast({
        description: e?.message || "Unexpected error",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ---- deriveds ----
  // Primary company name is companyName_1
  const primaryName = form?.companyName_1 || form?.name || "";

  // Alt/local names are companyName_2 and companyName_3
  const altNamesRaw = [form?.companyName_2, form?.companyName_3].filter(
    (n) => n && n.trim() !== ""
  );
  const altNames = altNamesRaw as string[];

  const contactName = form?.name || "";
  const emailVal = form?.email || "";
  const phoneVal = form?.phoneNum || "";
  // const dcpName = form?.dcpName || "";
  // const dcpNumber = form?.dcpNumber || "";
  // const dcpEmail = form?.dcpEmail || "";
  // const dcpStatus = form?.dcpStatus || "";

  const currentStatus = form?.incorporationStatus || "Pending";

  // selectedState can be plain string ("Wyoming") or object
  const stateName =
    typeof form?.selectedState === "string"
      ? form.selectedState
      : (form?.selectedState as any)?.name ||
      (form?.selectedState as any)?.id ||
      "";

  const entityType = form?.selectedEntity || "";

  const industries = (form?.selectedIndustry || []) as string[];
  const purposes = (form?.purposeOfEstablishmentCompany || []) as string[];
  const bizDesc =
    form?.descriptionOfBusiness || form?.descriptionOfProducts || "";

  // Expiry fallback: some records store expiresAt at root of company, not only in Stripe session
  const effectiveExpiresAt =
    session.expiresAt || (form.expiresAt ? String(form.expiresAt) : "");

  const handleDeleteClick = (companyId: string, countryCode: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTaskToDelete({ companyId, countryCode });
    setDeleteDialogOpen(true);
  };
  const markDelete = async () => {
    if (taskToDelete?.companyId) {
      const result = await markDeleteCompanyRecord({ _id: taskToDelete.companyId, country: taskToDelete.countryCode });
      if (result) {
        console.log("Marked as delete successfully");
        toast({
          title: "Success",
          description: "Company record marked for deletion.",
        })
        if (user.role === "admin" || user.role === "master") {
          navigate("/admin-dashboard");
        }
        else navigate("/dashboard");
      }
    }
    setDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  const showMemberDetails = async (email: string) => {
    const res = await getShrMemberData(id, email, "US", entityType);
    console.log("email--->", email, id, entityType, res)
    setSelectedData(res.data);
    setIsDialogOpen(true);
  }

  const onSendInvite = async (party: any) => {
    // console.log("p--->", party)
    let country = "US_Individual";
    if (form.selectedEntity === "Corporation") {
      country = "US_Corporate";
    }
    const payload = { _id: id || "", inviteData: [{ email: party.email, name: party.name, isDcp: party.isDcp }], country };
    const response = await sendInviteToShDir(payload);
    if (response.summary.successful > 0) {
      const next = [...form.shareholders.map((sh: any) => {
        sh.status = "Invited"
      })];

      setForm((p: any) => ({ ...p, users: response.users, shareholders: next }));
      toast({
        title: "Success",
        description: `Successfully sent invitation mail to ${response.summary.successful} people`,
      });
    }
    if (response.summary.alreadyExists > 0) {
      const next = [...form.shareholders.map((sh: any) => {
        sh.status = "Resent Invitation"
      })];
      setForm((p: any) => ({ ...p, users: response.users, shareholders: next }));
      toast({
        title: "Success",
        description: `Invite sent to member/director`,
      });
    }
    if (response.summary.failed > 0) {
      toast({
        title: "Failed",
        description: `Some Invitations Failed`,
      });
    }
  }
  const updateShareholderAt = (idx: number, patch: any) => {
    setForm((prev: any) => {
      const current = Array.isArray(prev.shareHolders) ? prev.shareHolders : [];
      const next = [...current];
      next[idx] = { ...next[idx], ...patch };
      return { ...prev, shareHolders: next };
    });
  };

  return (
    <Tabs defaultValue="details" className="flex flex-col w-full mx-auto">
      {/* TAB HEADERS */}
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

        {isAdmin && (
          <TabsTrigger
            value="Memos"
            className="flex-1 py-3 text-md font-medium rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            Memo
          </TabsTrigger>
        )}

        {isAdmin && (
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

      {/* DETAILS TAB */}
      <TabsContent value="details" className="p-4 md:p-6">
        {primaryName && <TodoApp id={id} name={primaryName} />}

        <div className="flex gap-x-8 mt-4">
          {isAdmin && <AssignAdmin />}
          <Button
            onClick={() => navigate(`/company-documents/US/${id}`)}
            size="sm"
            className="flex items-center gap-2"
          >
            Company Docs
          </Button>
        </div>

        <div className="mx-auto grid max-width gap-6 p-4 lg:grid-cols-3 pb-24">
          {/* LEFT SIDE */}
          <div className="lg:col-span-2 grid gap-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        {/* Company title / edit uses companyName_1 */}
                        {isEditing ? (
                          <Input
                            value={primaryName}
                            onChange={(e) => {
                              patchForm("companyName_1", e.target.value);
                            }}
                            className="h-8 text-base"
                            placeholder="Company Name"
                          />
                        ) : (
                          <CardTitle className="text-xl truncate">
                            {primaryName || "Untitled Company"}
                          </CardTitle>
                        )}

                        {/* badges + status */}
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="text-muted-foreground"
                          >
                            United States • US
                            {stateName ? ` • ${stateName}` : ""}
                          </Badge>

                          {entityType && (
                            <Badge variant="outline">{entityType}</Badge>
                          )}

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              Incorporation Status
                            </span>

                            {isAdmin ? (
                              <Select
                                value={currentStatus}
                                onValueChange={(val) =>
                                  patchForm("incorporationStatus", val as any)
                                }
                              >
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
                        {isAdmin ? <button
                          className="text-red-500 hover:red-blue-700 transition"
                          onClick={(e) => handleDeleteClick(id, "US", e)}
                        >
                          <Trash2 size={16} />
                        </button> : ""}
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

              <CardContent className="grid gap-5">
                {/* Basic applicant / contact / relationship / business */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <LabelValue label="Applicant">
                    <div className="flex items-center gap-2">
                      <FallbackAvatar name={String(contactName)} />
                      <span className="font-medium">
                        {contactName || "—"}
                      </span>
                    </div>
                  </LabelValue>

                  {/* <LabelValue label="Dcp Name">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{dcpName || "—"}</span>
                    </div>
                  </LabelValue>
                  <LabelValue label="Dcp Email">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{dcpEmail || "—"}</span>
                    </div>
                  </LabelValue>
                  <LabelValue label="Dcp Number">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{dcpNumber || "—"}</span>
                    </div>
                  </LabelValue> */}

                  <LabelValue label="Contact">
                    <div className="grid gap-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5" />
                        <span className="text-sm">{emailVal || "—"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5" />
                        <span className="text-sm">{phoneVal || "—"}</span>
                      </div>
                    </div>
                  </LabelValue>

                  {/* Alt / Local Names now uses companyName_2 and companyName_3 */}
                  <LabelValue label="Alt / Local Names">
                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={form.companyName_2 || ""}
                          onChange={(e) =>
                            patchForm("companyName_2", e.target.value)
                          }
                          placeholder="Alt Name 1"
                          className="h-8"
                        />
                        <Input
                          value={form.companyName_3 || ""}
                          onChange={(e) =>
                            patchForm("companyName_3", e.target.value)
                          }
                          placeholder="Alt Name 2"
                          className="h-8"
                        />
                      </div>
                    ) : altNames.length ? (
                      <div className="flex flex-wrap gap-2">
                        {altNames.map((n, i) => (
                          <Badge key={n + i} variant="secondary">
                            {n}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </LabelValue>

                  <LabelValue label="Relationships">
                    {(form.establishedRelationshipType || []).length ? (
                      <div className="flex flex-wrap gap-2">
                        {form.establishedRelationshipType!.map(
                          (r: any, i: number) => (
                            <Badge key={r + i} variant="outline">
                              {r}
                            </Badge>
                          )
                        )}
                      </div>
                    ) : (
                      "—"
                    )}
                  </LabelValue>

                  <LabelValue label="Industry">
                    {industries.length ? (
                      <div className="flex flex-wrap gap-2">
                        {industries.map((it, i) => (
                          <Badge key={it + i} variant="secondary">
                            {it}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      "—"
                    )}
                  </LabelValue>

                  <LabelValue label="Purpose">
                    {purposes.length ? (
                      <div className="flex flex-wrap gap-2">
                        {purposes.map((p, i) => (
                          <Badge key={p + i} variant="secondary">
                            {p}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      "—"
                    )}
                  </LabelValue>

                  <LabelValue label="Business Description">
                    {bizDesc || "—"}
                  </LabelValue>

                  <LabelValue label="Annual Renewal Terms">
                    {t(renderVal((form as any)?.annualRenewalTermsAgreement)) ||
                      "—"}
                  </LabelValue>
                  <LabelValue label="U.S. local company registration address">
                    {t(renderVal((form as any)?.localCompanyRegistration)) ||
                      "—"}
                  </LabelValue>
                  <LabelValue label="Business address within the United States">
                    {t(renderVal((form as any)?.businessAddress)) ||
                      "—"}
                  </LabelValue>
                </div>
                <Separator />
                {/* Shareholders / directors */}
                <div className="space-y-3">
                  <div className="text-sm font-medium">
                    Shareholding & Parties
                  </div>
                  {Array.isArray(form?.shareHolders) &&
                    form.shareHolders.length ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[24%]">
                              Name
                            </TableHead>
                            <TableHead className="w-[20%]">
                              Email
                            </TableHead>
                            <TableHead className="w-[18%]">
                              Director
                            </TableHead>
                            <TableHead className="w-[16%]">
                              Ownership
                            </TableHead>
                            <TableHead className="w-[16%]">
                              DCP
                            </TableHead>
                            <TableHead className="w-[8%]">
                              Legal Entity
                            </TableHead>
                            <TableHead className="w-[16%]">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {form.shareHolders.map((p: any, i: number) => (
                            <TableRow
                              key={(p?.email || p?.name || "sh") + i}
                              onClick={
                                !isEditing
                                  ? () => showMemberDetails(p.email)
                                  : undefined
                              }
                              className={!isEditing ? "cursor-pointer" : ""}
                            >
                              <TableCell className="font-medium">
                                {isEditing ? (
                                  <Input
                                    className="h-8"
                                    value={p?.name || ""}
                                    onChange={(e) =>
                                      updateShareholderAt(i, { name: e.target.value })
                                    }
                                  />
                                ) : (
                                  p?.name || "—"
                                )}
                              </TableCell>
                              {/* Email */}
                              <TableCell>
                                {isEditing ? (
                                  <Input
                                    className="h-8"
                                    type="email"
                                    value={p?.email || ""}
                                    onChange={(e) =>
                                      updateShareholderAt(i, { email: e.target.value })
                                    }
                                  />
                                ) : (
                                  p?.email || "—"
                                )}
                              </TableCell>
                              {/* Phone */}
                              <TableCell>
                                {p.isDirector && (
                                  <Badge variant="outline">{p.isDirector.id}</Badge>
                                )}
                              </TableCell>
                              {/* Ownership */}
                              <TableCell>
                                {isEditing ? (
                                  <Input
                                    className="h-8"
                                    type="number"
                                    value={p?.ownershipRate ?? p?.ownerShipRate ?? ""}
                                    onChange={(e) => {
                                      const raw = e.target.value;
                                      const val = raw === "" ? "" : Number(raw);
                                      updateShareholderAt(i, {
                                        ownershipRate: val,
                                        ownerShipRate: val,
                                      });
                                    }}
                                  />
                                ) : typeof p?.ownershipRate === "number" ? (
                                  `${p.ownershipRate}%`
                                ) : typeof p?.ownerShipRate === "number" ? (
                                  `${p.ownerShipRate}%`
                                ) : (
                                  "—"
                                )}
                              </TableCell>
                              {/* Director / DCP (simple DCP toggle, director still display-only) */}
                              <TableCell>
                                <div className="flex items-center gap-2">

                                  {/* DCP editable toggle when editing */}
                                  {isEditing ? (
                                    <div className="flex items-center gap-1">
                                      <span className="text-xs text-muted-foreground">
                                        DCP
                                      </span>
                                      <Switch
                                        checked={!!p.isDcp}
                                        onCheckedChange={(checked) =>
                                          updateShareholderAt(i, { isDcp: checked })
                                        }
                                      />
                                    </div>
                                  ) : (
                                    p.isDcp && (
                                      <Badge variant="outline">
                                        DCP
                                      </Badge>
                                    )
                                  )}
                                </div>
                              </TableCell>
                              {/* Legal Entity (still read-only for now) */}
                              <TableCell>
                                <div className="flex gap-2">
                                  <Badge
                                    variant={String(renderVal(p?.isLegalPerson))
                                      .toLowerCase()
                                      .includes("yes")
                                      ? "default"
                                      : "outline"}
                                  >
                                    {renderVal(p?.isLegalPerson) || "—"}
                                  </Badge>
                                </div>
                              </TableCell>

                              {/* Status + Remind (invite) */}
                              <TableCell className="text-right flex items-center justify-between gap-2">
                                <Badge>
                                  {p.status === "Invited" || p.status === "Resent Invitation"
                                    ? "Invited"
                                    : "Not invited"}
                                </Badge>

                                {/* Only admin | master can see and use Remind button */}
                                {isAdmin && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-1"
                                    onClick={(e) => {
                                      e.stopPropagation(); // keep row onClick from firing
                                      onSendInvite?.(p);
                                    }}
                                  >
                                    <Send className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">Remind</span>
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                      No parties added.
                    </div>
                  )}
                </div>
                <Separator />
                {/* Incorporation date + AML/CDD toggle */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <LabelValue label="Incorporation Date">
                    <div className="flex items-center gap-2">
                      <span>
                        {form?.incorporationDate
                          ? fmtDate(form.incorporationDate)
                          : "—"}
                      </span>
                      {isAdmin && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                Edit Incorporation Date
                              </DialogTitle>
                              <DialogDescription>
                                Set the date when the company was officially
                                registered.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-2">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label
                                  htmlFor="incorporationDate"
                                  className="text-right"
                                >
                                  Date
                                </Label>
                                <Input
                                  id="incorporationDate"
                                  type="date"
                                  value={
                                    form?.incorporationDate
                                      ? String(form.incorporationDate).slice(
                                        0,
                                        10
                                      )
                                      : ""
                                  }
                                  onChange={(e) =>
                                    patchForm(
                                      "incorporationDate",
                                      e.target.value
                                    )
                                  }
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
                        <Switch
                          checked={!form?.isDisabled}
                          onCheckedChange={(checked) =>
                            patchForm("isDisabled", !checked)
                          }
                        />
                      )}
                    </div>
                  </LabelValue>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT SIDE */}
          <div className="grid gap-6">
            {/* PAYMENT CARD */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Banknote className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">Payment</CardTitle>

                    {/* header badges */}
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {/* Pay method badge */}
                      <Badge variant="secondary" className="gap-1">
                        {(form.payMethod || "")
                          .toString()
                          .toUpperCase() || "—"}
                      </Badge>

                      {/* Bank ref */}
                      {form.bankRef && (
                        <Badge variant="outline" className="gap-1">
                          Ref: {form.bankRef}
                        </Badge>
                      )}

                      {/* Stripe Paid indicator */}
                      {form.paymentStatus === "paid" &&
                        form.stripeLastStatus === "succeeded" &&
                        form.stripeReceiptUrl && (
                          <Badge className="bg-emerald-600 hover:bg-emerald-600">
                            Stripe Paid
                          </Badge>
                        )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="grid gap-4">
                {/* Receipt / Proof */}
                <div className="grid gap-2">
                  <div className="text-xs text-muted-foreground">
                    Receipt / Proof
                  </div>

                  {/* Case 1: Stripe success info box */}
                  {form.paymentStatus === "paid" &&
                    form.stripeLastStatus === "succeeded" &&
                    form.stripeReceiptUrl ? (
                    <div className="rounded-md border bg-emerald-50 p-4 text-emerald-800">
                      <div className="text-sm font-medium">
                        Payment successful via Stripe.
                      </div>
                      <a
                        href={form.stripeReceiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center text-sm underline"
                      >
                        View Stripe Receipt
                      </a>
                    </div>
                  ) : // Case 2: uploaded proof (from uploadReceiptUrl or receiptUrl if you store one)
                    form.uploadReceiptUrl ? (
                      <div className="space-y-3">
                        <a
                          href={form.uploadReceiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="group relative block overflow-hidden rounded-md border"
                        >
                          <img
                            src={form.uploadReceiptUrl}
                            alt="Payment receipt"
                            className="h-44 w-full object-cover transition-transform duration-200 group-hover:scale-[1.01]"
                          />
                        </a>

                        {/* Admin-only paymentStatus dropdown */}
                        {isAdmin && (
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                              <Label className="text-sm font-medium">
                                Payment Status:
                              </Label>
                              <Select
                                value={form.paymentStatus || "unpaid"}
                                onValueChange={(val) =>
                                  patchForm("paymentStatus", val)
                                }
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="unpaid">
                                    Pending
                                  </SelectItem>
                                  <SelectItem value="paid">Paid</SelectItem>
                                  <SelectItem value="rejected">
                                    Rejected
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Case 3: no proof
                      <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                        No file uploaded
                      </div>
                    )}
                </div>

                {/* Amount / Expires / Payment Status / View Receipt */}
                <div className="grid gap-4 py-4">
                  {/* Amount */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Amount</Label>
                    <div className="col-span-3 text-sm font-medium">
                      {session.amount
                        ? `${session.amount} ${session.currency || "USD"}`
                        : form.stripeAmountCents
                          ? `${(form.stripeAmountCents / 100).toFixed(2)} ${form.stripeCurrency
                            ? form.stripeCurrency.toUpperCase()
                            : "USD"
                          }`
                          : "—"}
                    </div>
                  </div>

                  {/* ExpiresAt (Stripe session or company-level expiresAt) */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="expiresAt" className="text-right">
                      Expires
                    </Label>

                    {isAdmin ? (
                      <Input
                        id="expiresAt"
                        type="date"
                        value={
                          effectiveExpiresAt
                            ? effectiveExpiresAt.slice(0, 10)
                            : ""
                        }
                        onChange={(e) => {
                          // prefer to patch session first if we have a session
                          if (session._id) {
                            patchSession("expiresAt", e.target.value);
                          } else {
                            patchForm("expiresAt", e.target.value);
                          }
                        }}
                        className="col-span-3"
                      />
                    ) : (
                      <div className="col-span-3 text-sm">
                        {effectiveExpiresAt
                          ? fmtDate(effectiveExpiresAt)
                          : "—"}
                      </div>
                    )}
                  </div>

                  {/* Admin-only Payment Status select if not already rendered above */}
                  {!form.uploadReceiptUrl &&
                    !(
                      form.paymentStatus === "paid" &&
                      form.stripeLastStatus === "succeeded" &&
                      form.stripeReceiptUrl
                    ) &&
                    isAdmin && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Payment Status</Label>
                        <div className="col-span-3">
                          <Select
                            value={form.paymentStatus || "unpaid"}
                            onValueChange={(val) =>
                              patchForm("paymentStatus", val)
                            }
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unpaid">Pending</SelectItem>
                              <SelectItem value="paid">Paid</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                  {/* View Receipt button / sheet */}
                  {(form.uploadReceiptUrl) && (
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label className="text-right">Receipt</Label>
                      <div className="col-span-3">
                        <Sheet
                          open={isSheetOpen}
                          onOpenChange={setIsSheetOpen}
                        >
                          <SheetTrigger asChild>
                            <Button variant="outline" size="sm">
                              View Receipt
                            </Button>
                          </SheetTrigger>
                          <SheetContent
                            side="right"
                            className="w-full max-w-[40vw]"
                            style={{
                              width: "40vw",
                              maxWidth: "40vw",
                            }}
                          >
                            <SheetHeader>
                              <SheetTitle>Receipt</SheetTitle>
                            </SheetHeader>
                            <div className="mt-4 space-y-4">
                              <iframe
                                src={
                                  form.uploadReceiptUrl ||
                                  form.stripeReceiptUrl
                                }
                                className="w-full h-[calc(100vh-200px)]"
                                title="Receipt"
                              />
                            </div>
                          </SheetContent>
                        </Sheet>
                      </div>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-center"
                    onClick={() => setInvoiceOpen(true)}
                  >
                    <ReceiptText className="mr-2 h-4 w-4" />
                    View Invoice
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* COMPLIANCE & DECLARATIONS CARD */}
            <Card>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">
                      Compliance & Declarations
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <LabelValue label="Truthfulness">
                    <BoolPill value={!!form.truthfulnessDeclaration} />
                  </LabelValue>
                  <LabelValue label="Legal Terms">
                    <BoolPill value={!!form.legalTermsAcknowledgment} />
                  </LabelValue>
                  <LabelValue label="Compliance Precondition">
                    <BoolPill
                      value={!!form.compliancePreconditionAcknowledgment}
                    />
                  </LabelValue>
                  <LabelValue label="e-Sign">
                    {form.eSign || "—"}
                  </LabelValue>
                </div>

                <Separator />

                <div className="grid grid-cols-1 gap-3">
                  <div className="text-xs text-muted-foreground">
                    Sanctions / Restrictions
                  </div>

                  <div className="grid grid-cols-1 gap-2 text-sm">
                    {[
                      [
                        "Legal or Ethical Concern(money laundering etc)",
                        (form.legalAndEthicalConcern || "")
                          .toLowerCase()
                          .includes("yes"),
                      ],
                      [
                        "Sanctioned Countries Activity (iran, sudan, NK, syria, cuba,belarus, zimbabwe",
                        (form.q_country || "")
                          .toLowerCase()
                          .includes("yes"),
                      ],
                      [
                        "Sanctions Exposure (involved in above countries or under sanctions by  UN, EU, UKHMT, HKMA, OFAC,)",
                        (form.sanctionsExposureDeclaration || "")
                          .toLowerCase()
                          .includes("yes"),
                      ],
                      [
                        "Crimea/Sevastopol Presence",
                        (form.crimeaSevastapolPresence || "")
                          .toLowerCase()
                          .includes("yes"),
                      ],
                      [
                        "Russian Energy Presence",
                        (form.russianEnergyPresence || "")
                          .toLowerCase()
                          .includes("yes"),
                      ],
                    ].map(([label, flagged], i) => (
                      <div
                        key={String(label) + i}
                        className="flex items-center justify-between gap-3"
                      >
                        <span>{label as string}</span>
                        <Badge
                          variant={flagged ? "destructive" : "outline"}
                          className={flagged ? "" : "text-muted-foreground"}
                        >
                          {flagged ? "YES" : "NO"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <LabelValue label="Social App">
                    {form.snsPlatform || form.sns || "—"}
                  </LabelValue>
                  <LabelValue label="Handle / ID">
                    {form.snsHandle || form.snsId || "—"}
                  </LabelValue>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FIXED SAVE BAR */}
          {isAdmin && <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto flex max-width items-center justify-between gap-3 p-3">
              <div className="text-xs text-muted-foreground">
                Status: <strong>{currentStatus}</strong>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={onSave}>
                  <Save className="mr-1 h-4 w-4" />{" "}
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>}
        </div>
      </TabsContent>

      {/* RECORD OF DOCUMENTS TAB */}
      <TabsContent value="service-agreement" className="p-6">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Service Agreement Details</h1>
        </div>
      </TabsContent>

      {/* MEMOS TAB */}
      <TabsContent value="Memos" className="p-6">
        <div className="space-y-6">
          <MemoApp id={id} />
        </div>
      </TabsContent>

      {/* PROJECTS TAB */}
      <TabsContent value="Projects" className="p-6">
        <div className="space-y-6">
          <AdminProject id={id} />
        </div>
      </TabsContent>

      {/* CHECKLIST TAB */}
      <TabsContent value="Checklist" className="p-6">
        <ChecklistHistory
          id={id}
          items={[usIncorporationItems, usRenewalList]}
        />
      </TabsContent>
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={"Mark as Delete"}
        description='Are you sure you want to mark as delete?'
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={markDelete}
      />
      <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
        <DialogContent className="sm:max-w-[900px] w-[95vw] p-0" >
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle>Invoice</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6">
            <div className="max-h-[70vh] overflow-y-auto"
            >
              <h1>to be updated soon..</h1>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {
        entityType.toUpperCase().replace(/\s/g, "").includes("LLC") && isDialogOpen && (
          <UsIndividualShdrDetail
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            data={selectedData}
          />
        )
      }
      {
        !entityType.toUpperCase().replace(/\s/g, "").includes("LLC") && isDialogOpen && (
          <UsCorporateShdrDetailDialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            data={selectedData}
          />
        )
      }
    </Tabs>
  );
};

export default UsCompdetail;
