/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { fetchUsers, getSgIncorpoDataById, markDeleteCompanyRecord, sendInviteToShDir, updateEditValues } from "@/services/dataFetch";
import { paymentApi } from "@/lib/api/payment";
import { useToast } from "@/hooks/use-toast";

import { sgFormWithResetAtom1, SgFormData } from "../Singapore/SgState";
import { SessionData } from "./HkCompdetail";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Building2, Banknote, ReceiptText, ShieldCheck, Mail, Phone, Pencil, X, Save, Trash2, Send } from "lucide-react";

import MemoApp from "./MemosHK";
import TodoApp from "@/pages/Todo/TodoApp";
import AdminProject from "@/pages/dashboard/Admin/Projects/AdminProject";
import ChecklistHistory from "@/pages/Checklist/ChecklistHistory";
import { User } from "@/components/userList/UsersList";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { getShrMemberData, STATUS_OPTIONS } from "./detailData";
import { InvoiceSgStep } from "../Singapore/NewSgIncorporation";
import SgCorporateMemberDetail from "@/components/shareholderDirector/SgCorporateView";
import SgIndividualShrDetail from "@/components/shareholderDirector/SgIndividualDetail";

/** ---------------- helpers ---------------- */

function fmtDate(d?: string | Date) {
  if (!d) return "—";
  const dt = typeof d === "string" ? new Date(d) : d;
  const timestamp = +dt; // same as Number(dt)
  if (Number.isNaN(timestamp)) return "—";
  // Date only (no time)
  return dt.toISOString().slice(0, 10);
}

// normalize object-or-string values like {id,value}
const renderVal = (d: any) =>
  typeof d === "object" && d !== null ? d?.value ?? d?.id ?? "—" : d ?? "—";

const toYesNoBool = (v: any) => {
  if (typeof v === "boolean") return v;
  if (v == null) return undefined;
  const s = String(v).trim().toLowerCase();
  return s === "yes" || s === "true";
};

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
  // Prefer explicit fields if present
  const n1 = data?.companyName_1 ?? arr[0] ?? "";
  const n2 = data?.companyName_2 ?? arr[1] ?? "";
  const n3 = data?.companyName_3 ?? arr[2] ?? "";
  return [n1, n2, n3].filter((_) => true); // keep 3 slots
};

const fieldsFromNames = (arr: string[]) => ({
  companyName_1: arr?.[0] || "",
  companyName_2: arr?.[1] || "",
  companyName_3: arr?.[2] || "",
});

/** ---------------- component ---------------- */
const SgCompdetail: React.FC<{ id: string }> = ({ id }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [form, setForm] = useAtom(sgFormWithResetAtom1);
  const [users, setUsers] = useState<User[]>([]);
  const [adminAssigned, setAdminAssigned] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [selectedData, setSelectedData] = React.useState<any>(null);
  const [memType, setMemType] = React.useState<any>(null);

  const [session, setSession] = useState<SessionData>({
    _id: "",
    amount: 0,
    currency: "",
    expiresAt: "",
    status: "",
    paymentId: "",
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [taskToDelete, setTaskToDelete] = React.useState<{ companyId: string, countryCode: string } | null>(null);

  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null;
  const isAdmin = user?.role !== "user";

  /** bootstrap */
  useEffect(() => {
    const bootstrap = async () => {
      const data = await getSgIncorpoDataById(`${id}`);

      // hydrate names array from new fields and assign stable keys to parties
      const hydrated = {
        ...data,
        companyName: namesFromFields(data),
        parties: (data.parties || []).map((p: any) => ({
          ...p,
          __key: p.__key || crypto.randomUUID(),
        })),
      };

      setForm(hydrated);
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
      setUsers(u.filter((e: { role: string }) => e.role === "admin" || e.role === "master"));
    };
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /** tiny patch helpers */
  const patchForm = (key: keyof SgFormData | string, value: any) => setForm({ ...form, [key]: value });
  const patchNames = (i: number, value: string) => {
    const next = [...(form.companyName || ["", "", ""])];
    while (next.length < 3) next.push("");
    next[i] = value;
    const fields = fieldsFromNames(next);
    setForm({ ...form, companyName: next, ...fields });
  };

  // console.log("form--->", form);
  const onSave = async () => {
    try {
      setIsSaving(true);
      const names = namesFromFields(form)
      const nameFields = fieldsFromNames(names);

      const payload = JSON.stringify({
        company: {
          id: form._id,
          status: form.status,
          incorporationStatus: form.incorporationStatus,
          isDisabled: form.isDisabled,
          incorporationDate: form.incorporationDate,
          country: "SG",
          paymentStatus: form.paymentStatus,
          parties: form.parties,
          // send explicit fields (new schema)
          ...nameFields,
          // Add all editable fields
          designatedContactPerson: form.designatedContactPerson,
          designatedContact: form.designatedContact,
          name: form.name,
          email: form.email,
          phoneNum: form.phoneNum,
          selectedIndustry: form.selectedIndustry,
          establishmentPurpose: form.establishmentPurpose,
          productDescription: form.productDescription,
          businessDescription: form.businessDescription,
          annualRenewalConsent: form.annualRenewalConsent,
          annualRenewalTermsAgreement: form.annualRenewalTermsAgreement,
          // Compliance fields
          legalAndEthicalConcern: form.legalAndEthicalConcern,
          restrictedCountriesWithActivity: form.restrictedCountriesWithActivity,
          sanctionsExposureDeclaration: form.sanctionsExposureDeclaration,
          crimeaSevastapolPresence: form.crimeaSevastapolPresence,
          russianEnergyPresence: form.russianEnergyPresence,
          sns: form.sns,
          snsId: form.snsId,
          snsAccountId: form.snsAccountId,
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
        setIsEditing(false);
      } else {
        toast({ description: "Update failed. Please try again.", variant: "destructive" });
      }
    } catch (e: any) {
      toast({ description: e?.message || "Unexpected error", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  /** deriveds */
  const namesArr = form?.companyName || ["", "", ""];
  const primaryName = namesArr[0] || form?.companyName_1 || "";
  const alt1 = namesArr[1] || form?.companyName_2 || "";
  const alt2 = namesArr[2] || form?.companyName_3 || "";
  const altNames = [alt1, alt2].filter(Boolean);

  const contactName = form?.designatedContactPerson || form?.designatedContact || form?.name || "";
  const email = form?.email || "";
  const phone = form?.phoneNum || "";
  const currentStatus = form?.incorporationStatus || "Pending";
  // const dcpName = form?.dcpName || "";
  // const dcpEmail = form?.dcpEmail || "";
  const industries = (form?.selectedIndustry || []) as string[];
  const purposes = (form?.establishmentPurpose || []) as string[];
  const bizDesc = form?.productDescription || form?.businessDescription || "";

  const annualRenewalTermsText = (() => {
    // new data comes as "yes"/"no" string in `annualRenewalConsent`; keep legacy too
    const v = form?.annualRenewalConsent ?? renderVal(form?.annualRenewalTermsAgreement);
    return typeof v === "string" ? v : String(v ?? "");
  })();

  /** UI bits */
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
  const updatePartyAt = (index: number, patch: any) => {
    if (!form || !Array.isArray(form.parties)) return;
    const clone = { ...form };
    const arr = [...clone.parties];
    arr[index] = { ...arr[index], ...patch };
    clone.parties = arr;
    setForm(clone);
  };

  const addNewParty = () => {
    const next = [...(form.parties || [])];
    next.push({
      name: "",
      email: "",
      shares: undefined,
      typeOfShare: "",
      isDirector: false,
      isDcp: false,
      isSignificant: false,
      status: "Not invited",
      __key: crypto.randomUUID(),
    });
    setForm({ ...form, parties: next });
  };

  const deletePartyAt = (index: number) => {
    const next = [...(form.parties || [])];
    next.splice(index, 1);
    setForm({ ...form, parties: next });
  };

  const sendInvite = async (party: any) => {
    const payload = { _id: id || "", inviteData: [{ email: party.email, name: party.name, isDcp: party.isDcp }], country: "SG" };
    const response = await sendInviteToShDir(payload);
    if (response.summary.successful > 0) {
      toast({
        title: t("newHk.parties.toasts.invite.success.title"),
        description: t("newHk.parties.toasts.invite.success.desc", {
          count: response.summary.successful,
        }),
      });
      const updated = form.parties ? form.parties.map((p: any) => ({ ...p, invited: true, status: "Invited" })) : [];
      setForm({ ...form, parties: updated, users: response.users });
    }
    if (response.summary.alreadyExists > 0) {
      const updated = form.parties ? form.parties.map((p: any) => ({ ...p, invited: true, status: "Invited" })) : [];
      setForm({ ...form, parties: updated, users: response.users });
      toast({
        title: t("newHk.parties.toasts.invite.exists.title"),
        description: t("newHk.parties.toasts.invite.exists.desc"),
      })
    }
    if (response.summary.failed > 0) {
      toast({
        title: t("newHk.parties.toasts.invite.failed.title"),
        description: t("newHk.parties.toasts.invite.failed.desc"),
      });
    }
  }

  const showMemberDetails = async (email: string, isCorp: boolean) => {
    const type = isCorp === true ? "SG_Corporate" : "SG_Individual";
    const res = await getShrMemberData(id, email, "SG", type);
    setMemType(type);
    console.log("email--->", email, id, type, res)
    setSelectedData(res.data);
    setIsDialogOpen(true);
  }

  return (
    <Tabs defaultValue="details" className="flex flex-col w-full mx-auto">
      <TabsList className="flex w-full p-1 bg-background/80 rounded-t-lg border-b">
        <TabsTrigger value="details" className="flex-1 py-3 text-md font-medium rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
          Company Details
        </TabsTrigger>
        <TabsTrigger value="service-agreement" className="flex-1 py-3 text-md font-medium rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
          Record of Documents
        </TabsTrigger>
        {user?.role !== "user" && (
          <TabsTrigger value="Memos" className="flex-1 py-3 text-md font-medium rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
            Memo
          </TabsTrigger>
        )}
        {user?.role !== "user" && (
          <TabsTrigger value="Projects" className="flex-1 py-3 text-md font-medium rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
            Project
          </TabsTrigger>
        )}
        <TabsTrigger value="Checklist" className="flex-1 py-3 text-md font-medium rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
          Checklist
        </TabsTrigger>
      </TabsList>

      {/* DETAILS */}
      <TabsContent value="details" className="p-4 md:p-6">
        {primaryName && <TodoApp id={id} name={primaryName} />}

        <div className="flex gap-x-8 mt-4">
          {user?.role !== "user" && <AssignAdmin />}
          <Button onClick={() => navigate(`/company-documents/SG/${id}`)} size="sm" className="flex items-center gap-2">
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
                          <CardTitle className="text-xl truncate">
                            {primaryName || "Untitled Company"}
                          </CardTitle>
                        ) : (
                          <Input
                            value={primaryName}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => patchNames(0, e.target.value)}
                            className="h-8 text-base"
                            placeholder="Company Name"
                          />
                        )}

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="text-muted-foreground">
                            Singapore • SG
                          </Badge>

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              Status
                            </span>

                            {user?.role !== "user" ? (
                              <div onClick={(e) => e.stopPropagation()}>
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
                              </div>
                            ) : (
                              <Badge variant="default">{currentStatus}</Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <LabelValue label={t("newHk.incorporation.fields.incorporationDate.label", "Incorporation Date")}>
                              {isEditing ? (
                                <Input
                                  type="date"
                                  value={
                                    form?.incorporationDate
                                      ? String(form.incorporationDate).slice(0, 10)
                                      : ""
                                  }
                                  onChange={(e) =>
                                    patchForm("incorporationDate", e.target.value)
                                  }
                                  className="h-8"
                                />
                              ) : (
                                <span>
                                  {form?.incorporationDate ? fmtDate(form.incorporationDate) : "—"}
                                </span>
                              )}
                            </LabelValue>

                          </div>
                        </div>
                      </div>

                      {/* edit toggle */}
                      <div className="flex shrink-0 items-center gap-2">
                        {isAdmin ? (
                          <button
                            className="text-red-500 hover:red-blue-700 transition"
                            onClick={(e) => handleDeleteClick(id, "SG", e)}
                          >
                            <Trash2 size={16} />
                          </button>
                        ) : null}

                        {isAdmin &&
                          (!isEditing ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setIsEditing(true)}
                            >
                              <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setIsEditing(false)}
                            >
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
                  <LabelValue label={t("newHk.company.fields.applicantName.label", "Applicant")}>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={contactName}
                          onChange={(e) => patchForm("designatedContactPerson", e.target.value)}
                          placeholder={t("newHk.company.fields.applicantName.placeholder", "Contact person name")}
                          className="h-8"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <FallbackAvatar name={contactName} />
                        <span className="font-medium">{contactName || "—"}</span>
                      </div>
                    )}
                  </LabelValue>

                  <LabelValue label={t("newHk.company.fields.email.label", "Email & Phone")}>
                    {isEditing ? (
                      <div className="grid gap-2">
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => patchForm("email", e.target.value)}
                          placeholder={t("newHk.company.fields.email.placeholder", "Email address")}
                          className="h-8"
                        />
                        <Input
                          type="tel"
                          value={phone}
                          onChange={(e) => patchForm("phoneNum", e.target.value)}
                          placeholder={t("newHk.company.fields.phoneNum.placeholder", "Phone number")}
                          className="h-8"
                        />
                      </div>
                    ) : (
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
                    )}
                  </LabelValue>

                  <LabelValue label={t("newHk.incorporation.fields.altNames.label", "Alternative Names (2/3)")}>
                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={alt1}
                          onChange={(e) => patchNames(1, e.target.value)}
                          placeholder={t("newHk.incorporation.fields.altNames.placeholder2", "Name 2")}
                          className="h-8"
                        />
                        <Input
                          value={alt2}
                          onChange={(e) => patchNames(2, e.target.value)}
                          placeholder={t("newHk.incorporation.fields.altNames.placeholder3", "Name 3")}
                          className="h-8"
                        />
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

                  <LabelValue label={t("newHk.incorporation.fields.relationships.label", "Relationships")}>
                    {isEditing ? (
                      <Input
                        value={(form.establishedRelationshipType || []).join(", ")}
                        onChange={(e) => patchForm("establishedRelationshipType", e.target.value.split(",").map(s => s.trim()))}
                        placeholder={t("newHk.incorporation.fields.relationships.placeholder", "Comma-separated relationships")}
                        className="h-8"
                      />
                    ) : (
                      (form.establishedRelationshipType || []).length ? (
                        <div className="flex flex-wrap gap-2">
                          {form.establishedRelationshipType!.map((r: any, i: any) => (
                            <Badge key={r + i} variant="outline">
                              {r}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        "—"
                      )
                    )}
                  </LabelValue>

                  <LabelValue label={t("newHk.incorporation.fields.industry.label", "Industry")}>
                    {isEditing ? (
                      <Input
                        value={(industries || []).join(", ")}
                        onChange={(e) => patchForm("selectedIndustry", e.target.value.split(",").map(s => s.trim()))}
                        placeholder={t("newHk.incorporation.fields.industry.placeholder", "Comma-separated industries")}
                        className="h-8"
                      />
                    ) : (
                      industries.length ? (
                        <div className="flex flex-wrap gap-2">
                          {industries.map((it, i) => (
                            <Badge key={it + i} variant="secondary">
                              {it}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        "—"
                      )
                    )}
                  </LabelValue>

                  <LabelValue label={t("newHk.incorporation.fields.purpose.label", "Purpose")}>
                    {isEditing ? (
                      <Input
                        value={(purposes || []).join(", ")}
                        onChange={(e) => patchForm("establishmentPurpose", e.target.value.split(",").map(s => s.trim()))}
                        placeholder={t("newHk.incorporation.fields.purpose.placeholder", "Comma-separated purposes")}
                        className="h-8"
                      />
                    ) : (
                      purposes.length ? (
                        <div className="flex flex-wrap gap-2">
                          {purposes.map((p, i) => (
                            <Badge key={p + i} variant="secondary">
                              {p}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        "—"
                      )
                    )}
                  </LabelValue>

                  <LabelValue label={t("newHk.incorporation.fields.businessDesc.label", "Business Description")}>
                    {isEditing ? (
                      <Textarea
                        value={bizDesc}
                        onChange={(e) => patchForm("productDescription", e.target.value)}
                        placeholder={t("newHk.incorporation.fields.businessDesc.placeholder", "Describe business activities")}
                        className="h-20"
                      />
                    ) : (
                      <span>{bizDesc || "—"}</span>
                    )}
                  </LabelValue>

                  <LabelValue label={t("newHk.incorporation.fields.annualRenewal.label", "Annual Renewal Terms / Consent")}>
                    {isEditing ? (
                      <Select
                        value={String(form?.annualRenewalConsent ?? annualRenewalTermsText)}
                        onValueChange={(v) => patchForm("annualRenewalConsent", v)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder={t("common.select", "Select...")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">{t("common.yes", "Yes")}</SelectItem>
                          <SelectItem value="no">{t("common.no", "No")}</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span>{annualRenewalTermsText || "—"}</span>
                    )}
                  </LabelValue>
                </div>

                <Separator />

                {/* Parties */}
                <div className="space-y-3 min-w-0">
                  <div className="text-sm font-medium">Shareholders / Directors / DCP</div>

                  {Array.isArray(form?.parties) && form.parties.length ? (
                    <div className="rounded-md border min-w-0 overflow-hidden">
                      {/* scroll container */}
                      <div className="w-full max-w-full overflow-x-auto overflow-y-hidden">
                        <Table className="w-max min-w-full">
                          <TableHeader>
                            <TableRow className="whitespace-nowrap">
                              <TableHead className="w-[120px]">Name</TableHead>
                              <TableHead className="w-[180px]">Email</TableHead>
                              <TableHead className="w-[80px]">Shares</TableHead>
                              <TableHead className="w-[80px]">Share Type</TableHead>
                              <TableHead className="w-[80px]">Director</TableHead>
                              <TableHead className="w-[80px]">DCP</TableHead>
                              <TableHead className="w-[80px]">Significant Controller</TableHead>
                              <TableHead className="w-[160px]">Status</TableHead>
                              {isEditing && isAdmin && <TableHead className="w-[80px]">Actions</TableHead>}
                            </TableRow>
                          </TableHeader>

                          <TableBody>
                            {form.parties.map((p: any, index: number) => (
                              <TableRow
                                key={p.__key ?? index}
                                className={`align-top ${!isEditing && p?.email ? "cursor-pointer" : ""
                                  }`}
                                onClick={
                                  !isEditing && p?.email
                                    ? () => showMemberDetails(p.email, p.isCorp)
                                    : undefined
                                }
                              >
                                {/* Name */}
                                <TableCell className="font-medium">
                                  {isAdmin && isEditing ? (
                                    <Input
                                      className="h-8 w-full min-w-[180px]"
                                      placeholder="Name"
                                      value={p.name || ""}
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={(e) => updatePartyAt(index, { name: e.target.value })}
                                    />
                                  ) : (
                                    <span className="block max-w-[220px] truncate">{p.name || "—"}</span>
                                  )}
                                </TableCell>

                                {/* Email */}
                                <TableCell>
                                  {isAdmin && isEditing ? (
                                    <Input
                                      className="h-8 w-full min-w-[200px]"
                                      type="email"
                                      placeholder="Email"
                                      value={p.email || ""}
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={(e) => updatePartyAt(index, { email: e.target.value })}
                                    />
                                  ) : (
                                    <span className="block max-w-[240px] truncate">{p.email || "—"}</span>
                                  )}
                                </TableCell>

                                {/* Shares */}
                                <TableCell className="whitespace-nowrap">
                                  {isAdmin && isEditing ? (
                                    <Input
                                      className="h-8 w-full min-w-[90px]"
                                      type="number"
                                      placeholder="Shares"
                                      value={p.shares ?? ""}
                                      onClick={(e) => e.stopPropagation()}
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

                                {/* Share Type */}
                                <TableCell>
                                  {isAdmin && isEditing ? (
                                    <Input
                                      className="h-8 w-full min-w-[120px]"
                                      placeholder="Share type"
                                      value={p.typeOfShare || ""}
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={(e) => updatePartyAt(index, { typeOfShare: e.target.value })}
                                    />
                                  ) : (
                                    <span className="block max-w-[140px] truncate">
                                      {p.typeOfShare || "—"}
                                    </span>
                                  )}
                                </TableCell>

                                {/* Director */}
                                <TableCell className="whitespace-nowrap">
                                  {isAdmin && isEditing ? (
                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
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

                                {/* DCP */}
                                <TableCell className="whitespace-nowrap">
                                  {isAdmin && isEditing ? (
                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
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

                                {/* Significant Controller */}
                                <TableCell className="whitespace-nowrap">
                                  {isAdmin && isEditing ? (
                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
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

                                {/* Status */}
                                <TableCell className="py-3">
                                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between min-w-0">
                                    <Badge className="max-w-[140px] truncate">{p.status || "—"}</Badge>

                                    {isAdmin && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="shrink-0 inline-flex items-center gap-1"
                                        onClick={(e) => {
                                          e.stopPropagation(); // keeps row onClick from firing
                                          sendInvite?.(p);
                                        }}
                                      >
                                        <Send className="h-3.5 w-3.5" />
                                        <span className="hidden sm:inline">Remind</span>
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                                {isEditing && isAdmin && (
                                  <TableCell>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deletePartyAt(index);
                                      }}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </TableCell>
                                )}
                              </TableRow>
                            ))}
                          </TableBody>

                        </Table>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                      No parties added.
                    </div>
                  )}
                  {isEditing && isAdmin && (
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addNewParty}
                        className="flex items-center gap-2"
                      >
                        <span className="text-lg leading-none">+</span>
                        Add Party
                      </Button>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Dates & toggles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <LabelValue label={t("newHk.compliance.fields.amlCdd.label", "AML/CDD Edit")}>
                    <div className="flex items-center gap-2">
                      {!isEditing ? (
                        <BoolPill value={!form?.isDisabled} />
                      ) : (
                        <Switch
                          checked={!form?.isDisabled}
                          onCheckedChange={(checked) => patchForm("isDisabled", !checked)}
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
            {/* Payment */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Banknote className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">{t("newHk.payment.title", "Payment")}</CardTitle>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="gap-1">
                        <ReceiptText className="h-3.5 w-3.5" />
                        {(form.payMethod || "").toUpperCase() || "—"}
                      </Badge>
                      {form.bankRef && <Badge variant="outline" className="gap-1">Ref: {form.bankRef}</Badge>}
                      {form.paymentStatus === "paid" && form.stripeLastStatus === "succeeded" && form.stripeReceiptUrl && (
                        <Badge className="bg-emerald-600 hover:bg-emerald-600">Stripe Paid</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="grid gap-4">
                {/* Receipt / Proof */}
                <div className="grid gap-2">
                  <div className="text-xs text-muted-foreground">{t("newHk.payment.receipt.label", "Receipt / Proof")}</div>

                  {form.paymentStatus === "paid" &&
                    form.stripeLastStatus === "succeeded" &&
                    form.stripeReceiptUrl ? (
                    <div className="rounded-md border bg-emerald-50 p-4 text-emerald-800">
                      <div className="text-sm font-medium">Payment successful via Stripe.</div>
                      <a href={form.stripeReceiptUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center text-sm underline">
                        View Stripe Receipt
                      </a>
                    </div>
                  ) : form.uploadReceiptUrl ? (
                    <div className="space-y-3">
                      <a href={form.uploadReceiptUrl} target="_blank" rel="noreferrer" className="group relative block overflow-hidden rounded-md border">
                        <img src={form.uploadReceiptUrl} alt="Payment receipt" className="h-44 w-full object-cover transition-transform duration-200 group-hover:scale-[1.01]" />
                      </a>

                      {isAdmin && (
                        <div className="flex items-center gap-3">
                          <Label className="text-sm font-medium">{t("newHk.payment.status.label", "Payment Status")}:</Label>
                          <Select value={form?.paymentStatus || "unpaid"} onValueChange={(val) => patchForm("paymentStatus", val as any)}>
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder={t("common.select", "Status")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unpaid">{t("newHk.payment.status.pending", "Pending")}</SelectItem>
                              <SelectItem value="paid">{t("newHk.payment.status.paid", "Paid")}</SelectItem>
                              <SelectItem value="rejected">{t("newHk.payment.status.rejected", "Rejected")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">No file uploaded</div>
                  )}
                </div>

                {/* Amount + Expiry */}
                <div className="grid gap-4 py-2">
                  <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                    <Label className="md:text-right">{t("newHk.payment.amount.label", "Amount")}</Label>
                    <div className="col-span-1 md:col-span-3 text-sm font-medium">
                      {isEditing && isAdmin ? (
                        <Input
                          type="number"
                          value={form.totalDiscounted || session.amount || 0}
                          onChange={(e) => patchForm("totalDiscounted", Number(e.target.value))}
                          className="h-8"
                        />
                      ) : (
                        <span>
                          {form.totalDiscounted
                            ? `${form.totalDiscounted} USD`
                            : session.amount
                              ? `${session.amount} ${session.currency || "USD"}`
                              : "—"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                    <Label htmlFor="expiresAt" className="md:text-right">{t("newHk.payment.expires.label", "Expires")}</Label>
                    <div className="col-span-1 md:col-span-3">
                      {isAdmin && isEditing ? (
                        <Input
                          id="expiresAt"
                          type="date"
                          value={form.sessionExpiresAt ? String(form.sessionExpiresAt).slice(0, 10) : ""}
                          onChange={(e) => patchForm("sessionExpiresAt" as any, e.target.value)}
                          className="h-8"
                        />
                      ) : (
                        <div className="text-sm">
                          {form.sessionExpiresAt ? fmtDate(form.sessionExpiresAt) : "—"}
                        </div>
                      )}
                    </div>
                  </div>

                  {form.receiptUrl && (
                    <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4">
                      <Label className="md:text-right">{t("newHk.payment.receipt.label", "Receipt")}</Label>
                      <div className="col-span-1 md:col-span-3">
                        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                          <SheetTrigger asChild>
                            <Button variant="outline" size="sm">View Receipt</Button>
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

            {/* Compliance */}
            <Card>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">{t("newHk.compliance.title", "Compliance & Declarations")}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <LabelValue label={t("newHk.compliance.fields.legalEthicalConcern.label", "Legal & Ethical Concern")}>
                    {isEditing ? (
                      <Select
                        value={String(toYesNoBool(form?.legalAndEthicalConcern ?? form?.hasLegalEthicalIssues) ?? "")}
                        onValueChange={(v) => patchForm("legalAndEthicalConcern", v === "true")}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="false">{t("common.no", "No")}</SelectItem>
                          <SelectItem value="true">{t("common.yes", "Yes")}</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <BoolPill value={toYesNoBool(form?.legalAndEthicalConcern ?? form?.hasLegalEthicalIssues)} />
                    )}
                  </LabelValue>

                  <LabelValue label={t("newHk.compliance.fields.sanctionedCountries.label", "Sanctioned Countries Activity")}>
                    {isEditing ? (
                      <Select
                        value={String(toYesNoBool(form?.restrictedCountriesWithActivity ?? form?.q_country) ?? "")}
                        onValueChange={(v) => patchForm("restrictedCountriesWithActivity", v === "true")}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="false">{t("common.no", "No")}</SelectItem>
                          <SelectItem value="true">{t("common.yes", "Yes")}</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <BoolPill value={toYesNoBool(form?.restrictedCountriesWithActivity ?? form?.q_country)} />
                    )}
                  </LabelValue>

                  <LabelValue label={t("newHk.compliance.fields.sanctionsExposure.label", "Sanctions Exposure")}>
                    {isEditing ? (
                      <Select
                        value={String(toYesNoBool(form?.sanctionsExposureDeclaration ?? form?.sanctionedTiesPresent) ?? "")}
                        onValueChange={(v) => patchForm("sanctionsExposureDeclaration", v === "true")}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="false">{t("common.no", "No")}</SelectItem>
                          <SelectItem value="true">{t("common.yes", "Yes")}</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <BoolPill value={toYesNoBool(form?.sanctionsExposureDeclaration ?? form?.sanctionedTiesPresent)} />
                    )}
                  </LabelValue>

                  <LabelValue label={t("newHk.compliance.fields.crimea.label", "Crimea/Sevastopol Presence")}>
                    {isEditing ? (
                      <Select
                        value={String(toYesNoBool(form?.crimeaSevastapolPresence ?? form?.businessInCrimea) ?? "")}
                        onValueChange={(v) => patchForm("crimeaSevastapolPresence", v === "true")}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="false">{t("common.no", "No")}</SelectItem>
                          <SelectItem value="true">{t("common.yes", "Yes")}</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <BoolPill value={toYesNoBool(form?.crimeaSevastapolPresence ?? form?.businessInCrimea)} />
                    )}
                  </LabelValue>

                  <LabelValue label={t("newHk.compliance.fields.russianEnergy.label", "Russian Energy/Defense Presence")}>
                    {isEditing ? (
                      <Select
                        value={String(toYesNoBool(form?.russianEnergyPresence ?? form?.involvedInRussianEnergyDefense) ?? "")}
                        onValueChange={(v) => patchForm("russianEnergyPresence", v === "true")}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="false">{t("common.no", "No")}</SelectItem>
                          <SelectItem value="true">{t("common.yes", "Yes")}</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <BoolPill value={toYesNoBool(form?.russianEnergyPresence ?? form?.involvedInRussianEnergyDefense)} />
                    )}
                  </LabelValue>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <LabelValue label={t("newHk.compliance.fields.socialApp.label", "Social App")}>
                    {isEditing ? (
                      <Input
                        value={form?.sns || ""}
                        onChange={(e) => patchForm("sns", e.target.value)}
                        placeholder={t("newHk.compliance.fields.socialApp.placeholder", "App/Platform name")}
                        className="h-8"
                      />
                    ) : (
                      <span>{form?.sns || "—"}</span>
                    )}
                  </LabelValue>

                  <LabelValue label={t("newHk.compliance.fields.handle.label", "Handle / ID")}>
                    {isEditing ? (
                      <Input
                        value={form?.snsId || form?.snsAccountId?.value || ""}
                        onChange={(e) => patchForm("snsId", e.target.value)}
                        placeholder={t("newHk.compliance.fields.handle.placeholder", "Account handle or ID")}
                        className="h-8"
                      />
                    ) : (
                      <span>{form?.snsId || form?.snsAccountId?.value || "—"}</span>
                    )}
                  </LabelValue>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sticky save bar */}
          {isAdmin && <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto flex max-width items-center justify-between gap-3 p-3">
              <div className="text-xs text-muted-foreground">
                Status: <strong>{currentStatus}</strong>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={onSave}>
                  <Save className="mr-1 h-4 w-4" /> {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>}
        </div>
      </TabsContent>

      {/* RECORD OF DOCS */}
      <TabsContent value="service-agreement" className="p-6">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Service Agreement Details</h1>
          {/* plug your documents component here */}
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
              {/* <h1>to be updated soon..</h1> */}
              <InvoiceSgStep />
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {
        memType == "SG_Corporate" && isDialogOpen && (
          <SgCorporateMemberDetail
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            data={selectedData}
          />
        )
      }
      {memType == "SG_Individual" && isDialogOpen && (
        <SgIndividualShrDetail
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          data={selectedData}
        />
      )}
    </Tabs>
  );
};

export default SgCompdetail;
