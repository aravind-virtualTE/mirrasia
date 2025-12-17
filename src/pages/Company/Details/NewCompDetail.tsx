/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Banknote, Building2, ShieldCheck, ReceiptText, Mail, Phone, CheckCircle2, Circle, Pencil, X, Save, Trash2, Send } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TodoApp from "@/pages/Todo/TodoApp";
import { useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { usersData } from "@/services/state";
// import { paymentApi } from "@/lib/api/payment";
// import { SessionData } from "./HkCompdetail";
import { fetchUsers, getHkMemberData, markDeleteCompanyRecord, sendInviteToShDir } from "@/services/dataFetch";
import { getHkIncorpoData, saveIncorporationData } from "../NewHKForm/hkIncorpo";
import SAgrementPdf from "../HongKong/ServiceAgreement/SAgrementPdf";
import MemoApp from "./MemosHK";
import AdminProject from "@/pages/dashboard/Admin/Projects/AdminProject";
import ChecklistHistory from "@/pages/Checklist/ChecklistHistory";
import { hkIncorporationItems, hkRenewalList } from "./detailConstants";
import { toast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import InvoicePreview from "../NewHKForm/NewInvoicePreview";
import DetailShdHk from "@/components/shareholderDirector/detailShddHk";
import { t } from "i18next";
import { Switch } from "@/components/ui/switch";
import { STATUS_OPTIONS } from "./detailData";
import { businessNatureList } from "../HongKong/constants";

export type Party = {
  name: string;
  email?: string;
  phone?: string;
  isCorp?: boolean;
  isDirector?: boolean;
  shares?: number;
  invited?: boolean;
  typeOfShare?: string;
  status?: string;
  isDcp?: boolean;
};

export type PartyRowProps = {
  p: Party;
  totalShares?: number;
  onClick?: (p: Party) => void;
  onSendInvite?: (p: Party) => void; // new
  isEditing?: boolean;
  isAdmin?: boolean;
  onChange?: (patch: Partial<Party>) => void;
};

export type OnboardingRecord = {
  _id: string;
  stepIdx: number; // 0-based
  userId?: string | undefined;
  form: {
    applicantName?: string;
    email?: string;
    phone?: string;
    name1?: string; name2?: string; name3?: string;
    cname1?: string; cname2?: string;
    roles?: string[];
    sns?: string; snsId?: string;
    legalAndEthicalConcern?: string; // yes/no
    q_country?: string; // yes/no
    sanctionsExposureDeclaration?: string; // yes/no
    crimeaSevastapolPresence?: string; // yes/no
    russianEnergyPresence?: string; // yes/no
    finYrEnd?: string;
    bookKeepingCycle?: string;
    xero?: string; // Yes/No
    softNote?: string;
    payMethod?: string; // bank/card/fps/...
    paymentIntentId?: string;
    bankRef?: string;
    uploadReceiptUrl?: string;
    truthfulnessDeclaration?: boolean;
    legalTermsAcknowledgment?: boolean;
    compliancePreconditionAcknowledgment?: boolean;
    eSign?: string;
    dcpEmail?: string;
    dcpName?: string;
    industry?: string;
    purpose?: string[];
    bizdesc?: string;
    currency?: string;
    capAmount?: string;
    shareCount?: string;
    stripeLastStatus?: string;
    stripeReceiptUrl?: string;
    finalAmount?: string;
    paymentDate?: string;
  };
  parties?: Party[];
  incorporationStatus?: string;
  paymentStatus?: string;
  expiresAt?: string;
  optionalFeeIds?: string[];
  createdAt?: string;
  updatedAt?: string;

  // NEW
  incorporationDate?: string;   // when company officially registered
  isDisabled?: boolean;         // AML/CDD: false = enabled, true = disabled
};


const steps = [
  "Applicant",
  "Company Names",
  "Business Details",
  "Parties",
  "Capital",
  "Compliance",
  "KYC",
  "Payment",
  "e-Sign",
  "Review"
] as const;

function pctFromStep(stepIdx: number) {
  const maxIdx = steps.length - 1;
  const clamped = Math.max(0, Math.min(stepIdx, maxIdx));
  return Math.round((clamped / maxIdx) * 100);
}

function fmtDate(d?: string | Date) {
  if (!d) return "—";
  const dt = typeof d === "string" ? new Date(d) : d;
  // Simple invalid-date guard without using getTime()
  const timestamp = +dt; // same as Number(dt)
  if (Number.isNaN(timestamp)) return "—";
  // Date only (no time)
  return dt.toISOString().slice(0, 10);
}

function LabelValue({ label, children }: React.PropsWithChildren<{ label: string }>) {
  return (
    <div className="grid gap-1">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium break-words">{children || "—"}</div>
    </div>
  );
}

function BoolPill({ value, trueText = "Yes", falseText = "No" }: { value?: boolean; trueText?: string; falseText?: string }) {
  const isTrue = !!value;
  return (
    <Badge variant={isTrue ? "default" : "outline"} className={isTrue ? "bg-emerald-600 hover:bg-emerald-600" : "text-muted-foreground"}>
      {isTrue ? <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> : <Circle className="mr-1 h-3.5 w-3.5" />}
      {isTrue ? trueText : falseText}
    </Badge>
  );
}

function StepRail({ stepIdx }: { stepIdx: number }) {
  const pct = pctFromStep(stepIdx);
  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Progress</div>
        <div className="text-sm font-semibold">{pct}%</div>
      </div>
      <Progress value={pct} className="h-2" />
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {steps.map((label, idx) => {
          const state = idx < stepIdx ? "done" : idx === stepIdx ? "current" : "todo";
          return (
            <div key={label} className="flex items-center gap-2">
              <div
                className={
                  "h-2.5 w-2.5 rounded-full " +
                  (state === "done" ? "bg-primary" : state === "current" ? "bg-primary/40 ring-2 ring-primary/50" : "bg-muted")
                }
              />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PartyRow({ p, totalShares, onClick, onSendInvite, isEditing, isAdmin, onChange, }: PartyRowProps) {
  const pct =
    p.shares && totalShares
      ? Math.round((p.shares / totalShares) * 1000) / 10
      : undefined;

  return (
    <TableRow
      onClick={!isEditing ? () => onClick?.(p) : undefined}
      className={!isEditing ? "cursor-pointer" : ""}
    >
      {/* Party: name + contact */}
      <TableCell className="py-3">
        <div className="flex flex-col gap-2">
          {/* Name */}
          <div className="font-medium leading-tight">
            {isEditing ? (
              <Input
                className="h-8"
                value={p.name || ""}
                onChange={(e) =>
                  onChange?.({ name: e.target.value })
                }
              />
            ) : (
              p.name || "—"
            )}
          </div>

          {/* Email + phone */}
          <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
            {isEditing ? (
              <>
                <div className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  <Input
                    className="h-7 w-48"
                    type="email"
                    placeholder="Email"
                    value={p.email || ""}
                    onChange={(e) =>
                      onChange?.({ email: e.target.value })
                    }
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  <Input
                    className="h-7 w-40"
                    placeholder="Phone"
                    value={p.phone || ""}
                    onChange={(e) =>
                      onChange?.({ phone: e.target.value })
                    }
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </>
            ) : (
              <>
                {p.email && (
                  <span className="inline-flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    {p.email}
                  </span>
                )}
                {p.phone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {p.phone}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </TableCell>

      {/* Type / Roles / DCP toggle */}
      <TableCell className="py-3">
        <div className="flex flex-col gap-2">
          {/* Type + Director badge/toggle */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {p.isCorp ? "Corporate" : "Individual"}
            </Badge>

            {isEditing ? (
              <div
                className="flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-xs text-muted-foreground">
                  Director
                </span>
                <Switch
                  checked={!!p.isDirector}
                  onCheckedChange={(checked) =>
                    onChange?.({ isDirector: checked })
                  }
                />
              </div>
            ) : (
              p.isDirector && <Badge variant="outline">Director</Badge>
            )}
          </div>

          {/* DCP toggle/badge */}
          <div className="flex flex-wrap items-center gap-2">
            {isEditing ? (
              <div
                className="flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-xs text-muted-foreground">
                  DCP
                </span>
                <Switch
                  checked={!!p.isDcp}
                  onCheckedChange={(checked) =>
                    onChange?.({ isDcp: checked })
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
        </div>
      </TableCell>

      {/* Shares + typeOfShare */}
      <TableCell className="py-3">
        {isEditing ? (
          <div
            className="flex flex-wrap items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Input
              className="h-8 w-24"
              placeholder="Shares"
              type="number"
              value={p.shares ?? ""}
              onChange={(e) => {
                const raw = e.target.value;
                const val = raw === "" ? undefined : Number(raw);
                onChange?.({ shares: val });
              }}
            />
            <Input
              className="h-8 w-32"
              placeholder="Type"
              value={p.typeOfShare || ""}
              onChange={(e) =>
                onChange?.({ typeOfShare: e.target.value })
              }
            />
            {typeof pct === "number" && (
              <span className="text-xs text-muted-foreground">
                ({pct}%)
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Badge variant="outline">{p.typeOfShare || "—"}</Badge>
            <span className="text-sm">{p.shares ?? "—"}</span>
            {typeof pct === "number" && (
              <span className="text-xs text-muted-foreground">
                ({pct}%)
              </span>
            )}
          </div>
        )}
      </TableCell>

      {/* Status + Remind (admin-only) */}
      <TableCell className="py-3">
        <div className="flex items-center justify-between gap-2">
          <Badge
            className={
              p.status === "Invited"
                ? "bg-emerald-600 hover:bg-emerald-600"
                : ""
            }
          >
            {p.status === "Invited" ? "Invited" : "Not invited"}
          </Badge>

          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={(e) => {
                e.stopPropagation(); // prevent row click when view mode
                onSendInvite?.(p);
              }}
            >
              <Send className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Remind</span>
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}


export default function HKCompDetailSummary({ id }: { id: string }) {
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : { role: "user" };
  const navigate = useNavigate();

  const [data, setData] = React.useState<OnboardingRecord | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);

  // admins list
  const [users, setUsers] = useAtom(usersData);
  const [adminAssigned, setAdminAssigned] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [taskToDelete, setTaskToDelete] = React.useState<{ companyId: string, countryCode: string } | null>(null);
  const [invoiceOpen, setInvoiceOpen] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [selectedData, setSelectedData] = React.useState<any>(null);
  const isAdmin = user?.role !== "user";
  // ------- FETCH on mount / id change -------
  React.useEffect(() => {
    const fetchAll = async () => {
      try {
        if (!id) return;

        const companyData = await getHkIncorpoData(id);
        // console.log("companyData", companyData);

        setAdminAssigned(companyData.assignedTo ?? "");
        setData(companyData);

        const usersResponse = await fetchUsers();
        const adminUsers = usersResponse.filter((e: { role: string }) => e.role === "admin" || e.role === "master");
        setUsers(adminUsers);
      } catch (err) {
        console.error("Failed to fetch data/session/users:", err);
      }
    };

    fetchAll();
  }, [id, setUsers]);

  // ------- helpers -------
  const f = data?.form ?? ({} as OnboardingRecord["form"]);
  const currentStep = steps[Math.min(Math.max(data?.stepIdx ?? 0, 0), steps.length - 1)];
  const totalShares =
    Number(f.shareCount) ||
    (data?.parties?.reduce((a, b) => a + (b.shares || 0), 0) ?? 0) ||
    undefined;

  const patchForm = <K extends keyof OnboardingRecord["form"]>(key: K, val: OnboardingRecord["form"][K]) =>
    setData((d) => (d ? { ...d, form: { ...d.form, [key]: val } } : d));

  const patchCompany = (key: keyof OnboardingRecord, val: any) =>
    setData((d) => (d ? { ...d, [key]: val } : d));

  const onSave = async () => {
    if (!data) return;
    try {
      setIsSaving(true);
      const result = await saveIncorporationData(data);
      // console.log("result", result)
      const ok = (typeof result === "object" && result !== null)

      if (ok) {
        toast({
          title: "Saved",
          description: "Company details updated successfully.",
          duration: 1800,
        });
        setIsEditing(false);
      } else {
        toast({
          title: "Save failed",
          description: "We couldn’t save your changes. Please try again.",
          variant: "destructive",
          duration: 2200,
        });
      }
    } catch (err: any) {
      toast({
        title: "Save failed",
        description: err?.message ?? "Unexpected error occurred.",
        variant: "destructive",
        duration: 2200,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const AssignAdmin = () => {
    const handleAssign = (value: string) => setAdminAssigned(value);
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Assign Admin:</span>
        <Select onValueChange={handleAssign} value={adminAssigned}>
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
  };

  if (!data) {
    return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  }
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
  // console.log("data", data)
  // console.log("f--->",f)
  const showMemberDetails = async (email: string | undefined) => {
    // when user clicks on view details button in shareholder director party is should send the id the HKCompDetailSummary component recievd and email from party list , later i will implement the api to fetch data based on id and email and show the data in detail component
    // console.log("email--->",email,id)
    const result = await getHkMemberData(id, email as string);
    // console.log("result--->",result)
    setSelectedData(result.data);
    setIsDialogOpen(true);
  }

  const sendInviteToMembers = async (party: any) => {
    // this is executed for the clicked row only
    // you can use any party fields here
    // console.log("Send invite to:", party);
    const payload = { _id: id || "", inviteData: [{ email: party.email, name: party.name, isDcp: party.isDcp }], country: "HK" };
    const response = await sendInviteToShDir(payload);
    if (response.summary.successful > 0) {
      toast({
        title: t("newHk.parties.toasts.invite.success.title"),
        description: t("newHk.parties.toasts.invite.success.desc", {
          count: response.summary.successful,
        }),
      });
      setData((prev) => {
        if (!prev) return null;
        const updated = prev.parties ? prev.parties.map((p) => ({ ...p, invited: true, status: "Invited" })) : [];
        return { ...prev, parties: updated, users: response.users };
      });
    }
    if (response.summary.alreadyExists > 0) {
      setData((prev) => {
        if (!prev) return null;
        const updated = prev.parties ? prev.parties.map((p) => ({ ...p, invited: true, status: "Invited" })) : [];
        return { ...prev, parties: updated, users: response.users };
      });
      toast({
        title: t("newHk.parties.toasts.invite.exists.title"),
        description: t("newHk.parties.toasts.invite.exists.desc"),
      });
    }

    if (response.summary.failed > 0) {
      toast({
        title: t("newHk.parties.toasts.invite.failed.title"),
        description: t("newHk.parties.toasts.invite.failed.desc"),
      });
    }
  }
  const updatePartyAt = (idx: number, patch: Partial<Party>) => {
    setData((prev) => {
      if (!prev) return prev;
      const parties = prev.parties ? [...prev.parties] : [];
      parties[idx] = { ...parties[idx], ...patch };
      return { ...prev, parties };
    });
  };

  return (
    <Tabs defaultValue="details" className="flex flex-col w-full mx-auto">
      <TabsList className="flex w-full p-1 bg-background/80 rounded-t-lg border-b">
        <TabsTrigger value="details" className="flex-1 py-3 text-md font-medium transition-all rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
          Company Details
        </TabsTrigger>
        <TabsTrigger value="service-agreement" className="flex-1 py-3 text-md font-medium transition-all rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
          Record of Documents
        </TabsTrigger>
        {user.role !== "user" && (
          <TabsTrigger value="Memos" className="flex-1 py-3 text-md font-medium transition-all rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
            Memo
          </TabsTrigger>
        )}
        {user.role !== "user" && (
          <TabsTrigger value="Projects" className="flex-1 py-3 text-md font-medium transition-all rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
            Project
          </TabsTrigger>
        )}
        <TabsTrigger value="Checklist" className="flex-1 py-3 text-md font-medium transition-all rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
          Checklist
        </TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="p-6">
        <section>
          {data?.form?.name1 && <TodoApp id={data._id} name={data.form.name1} />}
          <div className="flex gap-x-8 mt-4">
            {user.role !== "user" && <AssignAdmin />}
            <Button onClick={() => navigate(`/company-documents/HK/${data._id}`)} size="sm" className="flex items-center gap-2">
              Company Docs
            </Button>
          </div>

          <div className="mx-auto grid max-width gap-6 p-4 lg:grid-cols-3 pb-24">
            {/* LEFT */}
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
                          {isEditing ? (
                            <Input
                              value={f.name1 || ""}
                              onChange={(e) => patchForm("name1", e.target.value)}
                              className="h-8 text-base"
                              placeholder="Company Name"
                            />
                          ) : (
                            <CardTitle className="text-xl truncate">
                              {f.name1 || f.cname1 || "Untitled Company"}
                            </CardTitle>
                          )}

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="text-muted-foreground">{currentStep}</Badge>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Incorporation Status</span>
                              {user.role !== "user" ? (
                                <Select
                                  value={data?.incorporationStatus || "Pending"}
                                  onValueChange={(val) => patchCompany("incorporationStatus", val)}
                                >
                                  <SelectTrigger className="h-7 w-[220px]">
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
                                <Badge variant="default">{data?.incorporationStatus || "Pending"}</Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Edit toggle */}
                        <div className="flex shrink-0 items-center gap-2">
                          {user.role !== "user" ? <button
                            className="text-red-500 hover:red-blue-700 transition"
                            onClick={(e) => handleDeleteClick(data._id, "HK", e)}
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
                  <StepRail stepIdx={data.stepIdx} />

                  {/* Basic info (editable) */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <LabelValue label="Applicant">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{f.applicantName || "—"}</span>
                      </div>
                    </LabelValue>
                    <LabelValue label="Contact">
                      <div className="grid gap-2">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5" />
                          <span className="text-sm">{f.email || "—"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5" />
                          <span className="text-sm">{f.phone || "—"}</span>
                        </div>
                      </div>
                    </LabelValue>

                    <LabelValue label="Alt / Local Names">
                      {isEditing ? (
                        <div className="grid grid-cols-2 gap-2">
                          <Input value={f.name2 || ""} onChange={(e) => patchForm("name2", e.target.value)} placeholder="Name 2" className="h-8" />
                          <Input value={f.name3 || ""} onChange={(e) => patchForm("name3", e.target.value)} placeholder="Name 3" className="h-8" />
                          <Input value={f.cname1 || ""} onChange={(e) => patchForm("cname1", e.target.value)} placeholder="Chinese Name 1" className="h-8" />
                          <Input value={f.cname2 || ""} onChange={(e) => patchForm("cname2", e.target.value)} placeholder="Chinese Name 2" className="h-8" />
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {[f.name2, f.name3, f.cname1, f.cname2].filter(Boolean).length ? (
                            [f.name2, f.name3, f.cname1, f.cname2].filter(Boolean).map((n, i) => (
                              <Badge key={String(n) + i} variant="secondary">
                                {n as string}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </div>
                      )}
                    </LabelValue>

                    {/* Roles — READ ONLY */}
                    <LabelValue label="Roles">
                      <div className="flex flex-wrap gap-2">
                        {(f.roles?.length ? f.roles : ["—"]).map((r, i) => (
                          <Badge key={r + i} variant="outline">
                            {r}
                          </Badge>
                        ))}
                      </div>
                    </LabelValue>

                    <LabelValue label="Industry">
                      {t(businessNatureList.find(e => e.code == f.industry)?.label || "", "")}
                     
                    </LabelValue>

                    <LabelValue label="Purpose">
                      <div className="flex flex-wrap gap-2">
                        {(f.purpose?.length ? f.purpose : ["—"]).map((p, i) => (
                          <Badge key={p + i} variant="secondary">
                            {p}
                          </Badge>
                        ))}
                      </div>
                    </LabelValue>

                    <LabelValue label="Business Description">
                      {f.bizdesc || "—"}
                    </LabelValue>

                    <LabelValue label="Notes">
                      {f.softNote || "—"}
                    </LabelValue>
                  </div>

                  <Separator />

                  {/* Finance & accounting (some editable) */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <LabelValue label="Currency">
                      <Badge variant="outline">{f.currency || "—"}</Badge>
                    </LabelValue>

                    <LabelValue label="Declared Capital">
                      {f.capAmount || "—"}
                    </LabelValue>

                    <LabelValue label="Total Shares">
                      {f.shareCount || "—"}
                    </LabelValue>
                    <LabelValue label="Financial Year End">
                      {f.finYrEnd || "—"}
                    </LabelValue>
                    <LabelValue label="Bookkeeping Cycle">
                      {f.bookKeepingCycle || "—"}
                    </LabelValue>
                    <LabelValue label="Xero">{f.xero || "—"}</LabelValue>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <LabelValue label="Created">{fmtDate(data.createdAt)}</LabelValue>
                    <LabelValue label="Updated">{fmtDate(data.updatedAt)}</LabelValue>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Shareholders / Directors / DCP</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.parties && data.parties.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[45%]">Party</TableHead>
                            <TableHead className="w-[20%]">Type / Roles</TableHead>
                            <TableHead className="w-[20%]">Shares</TableHead>
                            <TableHead className="w-[15%]">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.parties.map((p, i) => (
                            <PartyRow
                              key={p.name + i}
                              p={p}
                              totalShares={totalShares}
                              isEditing={isEditing}
                              isAdmin={isAdmin}
                              onClick={(party) => showMemberDetails(party.email)}
                              onSendInvite={(party) => sendInviteToMembers(party)}
                              onChange={(patch) => updatePartyAt(i, patch)}
                            />
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">No parties added.</div>
                  )}
                  <Separator />
                  {/* Incorporation date + AML/CDD toggle */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <LabelValue label="Incorporation Date">
                      <div className="flex items-center gap-2">
                        <span>
                          {data.incorporationDate
                            ? fmtDate(data.incorporationDate)
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
                                <DialogTitle>Edit Incorporation Date</DialogTitle>
                                <DialogDescription>
                                  Set the date when the company was officially registered.
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
                                      data.incorporationDate
                                        ? String(data.incorporationDate).slice(0, 10)
                                        : ""
                                    }
                                    onChange={(e) =>
                                      patchCompany("incorporationDate", e.target.value)
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
                        {/* true = enabled => !isDisabled */}
                        <BoolPill value={!data.isDisabled} />
                        {isAdmin && (
                          <Switch
                            checked={!data.isDisabled}
                            onCheckedChange={(checked) =>
                              // checked = AML/CDD enabled => isDisabled = !checked
                              patchCompany("isDisabled", !checked)
                            }
                          />
                        )}
                      </div>
                    </LabelValue>
                  </div>

                </CardContent>
              </Card>
            </div>

            {/* RIGHT */}
            <div className="grid gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <Banknote className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">Payment</CardTitle>
                      {/* Header badges */}
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="gap-1">
                          <ReceiptText className="h-3.5 w-3.5" />
                          {(f.payMethod || "").toUpperCase() || "—"}
                        </Badge>
                        {f.bankRef && <Badge variant="outline" className="gap-1">Ref: {f.bankRef}</Badge>}
                        {/* Stripe success badge */}
                        {data.paymentStatus === "paid" && f.stripeLastStatus === "succeeded" && f.stripeReceiptUrl && (
                          <Badge className="bg-emerald-600 hover:bg-emerald-600">Stripe Paid</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="grid gap-4">
                  {/* Receipt / Proof */}
                  <div className="grid gap-2">
                    <div className="text-xs text-muted-foreground">Receipt / Proof</div>

                    {/* If Stripe succeeded, show success + receipt link; else show uploaded image (if any) */}
                    {data.paymentStatus === "paid" && f.stripeLastStatus === "succeeded" && f.stripeReceiptUrl ? (
                      <div className="rounded-md border bg-emerald-50 p-4 text-emerald-800">
                        <div className="text-sm font-medium">Payment successful via Stripe.</div>
                        <a
                          href={f.stripeReceiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center text-sm underline"
                        >
                          View Stripe Receipt
                        </a>
                      </div>
                    ) : f.uploadReceiptUrl ? (
                      <div className="space-y-3">
                        <a
                          href={f.uploadReceiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="group relative block overflow-hidden rounded-md border"
                        >
                          <img
                            src={f.uploadReceiptUrl}
                            alt="Payment receipt"
                            className="h-44 w-full object-cover transition-transform duration-200 group-hover:scale-[1.01]"
                          />
                        </a>

                        {user.role !== "user" && (
                          <div className="flex items-center gap-3">
                            <Label className="text-sm font-medium">Payment Status:</Label>
                            <Select
                              value={data?.paymentStatus || "unpaid"}
                              onValueChange={(val) => patchCompany("paymentStatus", val)}
                            >
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

                  {/* Session details incl. editable expiresAt */}
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Amount</Label>
                      <div className="col-span-3 text-sm font-medium">
                        {f.finalAmount ? `${f.finalAmount} USD` : "—"}
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="expiresAt" className="text-right">Expires</Label>
                      <Input
                        id="expiresAt"
                        type="date"
                        value={data.expiresAt ? data.expiresAt.slice(0, 10) : ""}
                        onChange={(e) => patchCompany("expiresAt", e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  {f.paymentDate ? (<div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Payment Date</Label>
                    <div className="col-span-3 text-sm font-medium">
                      {f.paymentDate ? f.paymentDate : "—"}
                    </div>
                  </div>) : ""}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-center"
                    onClick={() => setInvoiceOpen(true)}
                  >
                    <ReceiptText className="mr-2 h-4 w-4" />
                    View Invoice
                  </Button>
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
                <CardContent className="grid gap-4">
                  {/* READ-ONLY */}
                  <div className="grid grid-cols-2 gap-3">
                    <LabelValue label="Truthfulness"><BoolPill value={!!f.truthfulnessDeclaration} /></LabelValue>
                    <LabelValue label="Legal Terms"><BoolPill value={!!f.legalTermsAcknowledgment} /></LabelValue>
                    <LabelValue label="Compliance Precondition"><BoolPill value={!!f.compliancePreconditionAcknowledgment} /></LabelValue>
                    <LabelValue label="e-Sign">{f.eSign || "—"}</LabelValue>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 gap-3">
                    <div className="text-xs text-muted-foreground">Sanctions / Restrictions</div>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      {[
                        ["Legal or Ethical Concern(money laundering etc)", "legalAndEthicalConcern"],
                        ["Sanctioned Countries Activity (iran, sudan, NK, syria, cuba,belarus, zimbabwe", "q_country"],
                        ["Sanctions Exposure (involved in above countries or under sanctions by  UN, EU, UKHMT, HKMA, OFAC,)", "sanctionsExposureDeclaration"],
                        ["Crimea/Sevastopol Presence", "crimeaSevastapolPresence"],
                        ["Russian Energy Presence", "russianEnergyPresence"],
                      ].map(([label, key]) => (
                        <div key={key} className="flex items-center justify-between gap-3">
                          <span>{label}</span>
                          <Badge
                            variant={(f as any)[key] === "yes" ? "destructive" : "outline"}
                            className={(f as any)[key] === "yes" ? "" : "text-muted-foreground"}
                          >
                            {(f as any)[key]?.toUpperCase() || "—"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <LabelValue label="Social App">{f.sns || "—"}</LabelValue>
                    <LabelValue label="Handle / ID">{f.snsId || "—"}</LabelValue>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sticky save bar */}
           {isAdmin && <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="mx-auto flex max-width items-center justify-between gap-3 p-3">
                <div className="text-xs text-muted-foreground">
                  Status: <strong>{data?.incorporationStatus || "Pending"}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={onSave}>
                    <Save className="mr-1 h-4 w-4" />  {isSaving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </div>}
          </div>
        </section>
      </TabsContent>

      <TabsContent value="service-agreement" className="p-6">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Service Agreement Details</h1>
          {id && <SAgrementPdf id={id} />}
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
        <ChecklistHistory id={id} items={[hkIncorporationItems, hkRenewalList]} />
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
              <InvoicePreview app={data as any} />
            </div>
          </div>

        </DialogContent>
      </Dialog>
      {isDialogOpen && <DetailShdHk isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} userData={selectedData} />}
    </Tabs>
  );
}
