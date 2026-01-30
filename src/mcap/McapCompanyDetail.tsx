/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "@/services/fetch";
import { MCAP_CONFIG_MAP } from "@/mcap/configs/registry";
import type { McapField } from "@/mcap/configs/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { fetchUsers, sendCustomMail } from "@/services/dataFetch";
import { STATUS_OPTIONS } from "@/pages/Company/Details/detailData";
import {
  hkIncorporationItems,
  hkRenewalList,
  usIncorporationItems,
  usRenewalList,
  singaporeUkChecklistItems,
  multiJurisdictionChecklistItems,
} from "@/pages/Company/Details/detailConstants";
import TodoApp from "@/pages/Todo/TodoApp";
import MemoApp from "@/pages/Company/Details/MemosHK";
import AdminProject from "@/pages/dashboard/Admin/Projects/AdminProject";
import ChecklistHistory from "@/pages/Checklist/ChecklistHistory";
import { Banknote, Building2, Mail, Phone, ReceiptText, Send, ShieldCheck } from "lucide-react";

type McapParty = {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  type?: "person" | "entity";
  roles?: string[];
  shares?: number;
  shareType?: string;
  invited?: boolean;
  status?: string;
  kycStatus?: string;
};

type McapCompany = {
  _id: string;
  countryCode: string;
  countryName?: string;
  status?: string;
  incorporationStatus?: string;
  incorporationDate?: string;
  paymentStatus?: string;
  assignedTo?: string;
  stepIdx?: number;
  kycStatus?: string;
  data?: Record<string, any>;
  parties?: McapParty[];
  paymentIntentId?: string;
  stripeLastStatus?: string;
  stripeReceiptUrl?: string;
  stripeAmountCents?: number;
  stripeCurrency?: string;
  uploadReceiptUrl?: string;
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

type AdminUser = { _id: string; fullName?: string; email: string; role: string };

const fmtDate = (d?: string | Date) => {
  if (!d) return "N/A";
  const dt = typeof d === "string" ? new Date(d) : d;
  const ts = +dt;
  if (Number.isNaN(ts)) return "N/A";
  return dt.toISOString().slice(0, 10);
};

const getCompanyName = (data: Record<string, any>) => {
  return (
    data?.companyName_1 ||
    data?.name1 ||
    data?.companyName ||
    data?.companyName1 ||
    data?.desiredCompanyName ||
    data?.companyNamePrimary ||
    ""
  );
};

const getAltCompanyNames = (data: Record<string, any>) => {
  const raw = [
    data?.companyName_2,
    data?.companyName_3,
    data?.name2,
    data?.name3,
    data?.companyName2,
    data?.companyName3,
  ];
  return raw.filter((v) => !!v);
};

const getApplicant = (data: Record<string, any>) => {
  return data?.applicantName || data?.name || data?.contactName || data?.primaryContactName || "";
};

const getEmail = (data: Record<string, any>) => {
  return data?.email || data?.applicantEmail || data?.applicantEmailAddress || data?.contactEmail || "";
};

const getPhone = (data: Record<string, any>) => {
  return data?.phone || data?.phoneNum || data?.contactPhone || "";
};

const toDisplayValue = (val: any) => {
  if (val == null || val === "") return null;
  if (Array.isArray(val)) return val.filter((v) => v != null && v !== "");
  if (typeof val === "object") return val?.label ?? val?.value ?? JSON.stringify(val);
  return val;
};

const resolveFieldKey = (data: Record<string, any>, candidates: string[], fallback: string) => {
  for (const key of candidates) {
    if (Object.prototype.hasOwnProperty.call(data, key)) return key;
  }
  return fallback;
};

const McapCompanyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null;
  const isAdmin = user?.role !== "user";

  const [company, setCompany] = useState<McapCompany | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("MIRR ASIA - Incorporation Follow-up");
  const [emailMessage, setEmailMessage] = useState("");
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [adminAssigned, setAdminAssigned] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const fetchCompany = async () => {
    if (!id) return;
    const res = await api.get(`/mcap/companies/${id}`);
    if (res?.data?.success) {
      const payload = res.data.data as McapCompany;
      setCompany(payload);
      setAdminAssigned(payload.assignedTo || "");
      const primaryEmail = getEmail(payload?.data || {});
      setEmailTo(primaryEmail || "");
    }
  };

  useEffect(() => {
    fetchCompany();
  }, [id]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchUsers().then((users) => {
      const list = (users || []).filter((u: AdminUser) => u.role === "admin" || u.role === "master");
      setAdminUsers(list);
    });
  }, [isAdmin]);

  const updateField = (key: keyof McapCompany, value: any) => {
    setCompany((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const updateDataField = (key: string, value: any) => {
    setCompany((prev) => (prev ? { ...prev, data: { ...(prev.data || {}), [key]: value } } : prev));
  };

  const handleSave = async () => {
    if (!company) return;
    setIsSaving(true);
    try {
      const payload = { ...company, assignedTo: adminAssigned || company.assignedTo };
      const res = await api.post("/mcap/companies", payload);
      if (res?.data?.success) {
        toast({ title: "Saved", description: "MCAP record updated." });
        setCompany(res.data.data);
      } else {
        toast({ title: "Save failed", description: res?.data?.message || "Unable to save.", variant: "destructive" });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailTo || !emailMessage) {
      toast({ title: "Missing details", description: "Please enter email and message.", variant: "destructive" });
      return;
    }
    await sendCustomMail({ to: emailTo, subject: emailSubject, message: emailMessage });
    toast({ title: "Email sent", description: "Message sent to client." });
    setEmailMessage("");
  };

  const handleInviteParty = async (party: McapParty) => {
    if (!company?._id) return;
    try {
      const res = await api.post("/mcap/parties/invite", { companyId: company._id, party });
      if (res?.data?.success) {
        toast({ title: "Invite sent", description: "KYC invitation sent to party." });
        setCompany((prev) => {
          if (!prev) return prev;
          const updated = (prev.parties || []).map((p) =>
            p._id === party._id ? { ...p, invited: true, status: "Invited" } : p
          );
          return { ...prev, parties: updated };
        });
      } else {
        toast({ title: "Invite failed", description: res?.data?.message || "Unable to send invite.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Invite failed", description: "Unable to send invite.", variant: "destructive" });
    }
  };

  const config = useMemo(() => {
    if (!company?.countryCode) return null;
    return MCAP_CONFIG_MAP[company.countryCode] || null;
  }, [company?.countryCode]);

  const checklistItems = useMemo(() => {
    const code = (company?.countryCode || "").toUpperCase();
    if (code === "HK") return [hkIncorporationItems, hkRenewalList];
    if (code === "US") return [usIncorporationItems, usRenewalList];
    if (code === "SG") return [singaporeUkChecklistItems, []];
    if (code === "PA") return [multiJurisdictionChecklistItems, []];
    if (code === "PPIF") return [multiJurisdictionChecklistItems, []];
    if (code === "CR") return [multiJurisdictionChecklistItems, []];
    if (code === "AE") return [multiJurisdictionChecklistItems, []];
    return [multiJurisdictionChecklistItems, []];
  }, [company?.countryCode]);

  const stepGroups = useMemo(() => {
    if (!config?.steps) return [];
    const data = company?.data || {};
    const toLabel = (label?: string) => (label ? t(label, label) : "");

    const renderField = (field: McapField) => {
      if (!field?.name) return null;
      if (field.condition && !field.condition(data)) return null;
      const rawValue = toDisplayValue(data[field.name]);
      if (rawValue == null) return null;

      if (field.type === "checkbox") {
        const checked = rawValue === true || rawValue === "true" || rawValue === "yes";
        return (
          <div key={field.name} className="grid gap-1">
            <div className="text-xs text-muted-foreground">{toLabel(field.label)}</div>
            <Badge variant={checked ? "default" : "outline"} className={!checked ? "text-muted-foreground" : ""}>
              {checked ? "YES" : "NO"}
            </Badge>
          </div>
        );
      }

      const options = field.options || [];
      const mapOption = (val: any) => {
        const opt = options.find((o) => String(o.value) === String(val));
        return opt ? toLabel(opt.label) : String(val);
      };

      if (Array.isArray(rawValue)) {
        return (
          <div key={field.name} className="grid gap-1">
            <div className="text-xs text-muted-foreground">{toLabel(field.label)}</div>
            <div className="flex flex-wrap gap-2">
              {rawValue.map((v, idx) => (
                <Badge key={`${field.name}-${idx}`} variant="secondary">
                  {mapOption(v)}
                </Badge>
              ))}
            </div>
          </div>
        );
      }

      return (
        <div key={field.name} className="grid gap-1">
          <div className="text-xs text-muted-foreground">{toLabel(field.label)}</div>
          <div className="text-sm font-medium break-words">{mapOption(rawValue)}</div>
        </div>
      );
    };

    return config.steps
      .filter((step) => Array.isArray(step.fields) && step.fields.length > 0)
      .map((step) => {
        const fields = (step.fields || []).map((field) => renderField(field)).filter(Boolean);
        return { step, fields };
      })
      .filter((group) => group.fields.length > 0);
  }, [config?.steps, company?.data, t]);

  if (!id) {
    return <div className="p-6 text-sm text-destructive">Error: No company ID provided in route.</div>;
  }

  if (!company) {
    return <div className="p-6 text-sm text-muted-foreground">Loading...</div>;
  }

  const data = company.data || {};
  const companyName = getCompanyName(data) || "Untitled Company";
  const altNames = getAltCompanyNames(data);
  const applicantName = getApplicant(data);
  const applicantEmail = getEmail(data);
  const applicantPhone = getPhone(data);
  const companyNameKey = resolveFieldKey(data, ["companyName_1", "name1"], "companyName_1");
  const companyAlt1Key = resolveFieldKey(data, ["companyName_2", "name2"], "companyName_2");
  const companyAlt2Key = resolveFieldKey(data, ["companyName_3", "name3"], "companyName_3");
  const applicantNameKey = resolveFieldKey(data, ["applicantName", "name", "contactName", "primaryContactName"], "applicantName");
  const applicantEmailKey = resolveFieldKey(data, ["email", "applicantEmail", "applicantEmailAddress", "contactEmail"], "email");
  const applicantPhoneKey = resolveFieldKey(data, ["phone", "phoneNum", "contactPhone"], "phone");
  const stepsCount = config?.steps?.length || 1;
  const pct = Math.min(100, Math.max(0, Math.round(((company.stepIdx || 0) / (stepsCount - 1 || 1)) * 100)));

  return (
    <Tabs defaultValue="details" className="flex flex-col w-full mx-auto">
      <TabsList className="flex w-full p-1 bg-background/80 rounded-t-lg border-b">
        <TabsTrigger value="details" className="flex-1 py-3 text-md font-medium rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
          Company Details
        </TabsTrigger>
        <TabsTrigger value="documents" className="flex-1 py-3 text-md font-medium rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
          Record of Documents
        </TabsTrigger>
        {isAdmin && (
          <TabsTrigger value="memos" className="flex-1 py-3 text-md font-medium rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
            Memo
          </TabsTrigger>
        )}
        {isAdmin && (
          <TabsTrigger value="projects" className="flex-1 py-3 text-md font-medium rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
            Project
          </TabsTrigger>
        )}
        <TabsTrigger value="checklist" className="flex-1 py-3 text-md font-medium rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
          Checklist
        </TabsTrigger>
        <TabsTrigger value="raw" className="flex-1 py-3 text-md font-medium rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
          Raw Data
        </TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="p-4 md:p-6">
        {companyName && <TodoApp id={company._id} name={companyName} />}

        <div className="flex flex-wrap gap-3 mt-4">
          {isAdmin && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Assign Admin:</span>
              <Select value={adminAssigned} onValueChange={setAdminAssigned}>
                <SelectTrigger className="w-60 h-8 text-xs">
                  <SelectValue placeholder="Assign Admin to..." />
                </SelectTrigger>
                <SelectContent>
                  {adminUsers.map((u) => (
                    <SelectItem key={u._id} value={u.fullName || ""}>
                      {u.fullName || u.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button onClick={() => navigate(`/company-documents/${company.countryCode}/${company._id}`)} size="sm" className="flex items-center gap-2">
            Company Docs
          </Button>
          <Button onClick={() => navigate(`/mcap?companyId=${company._id}`)} size="sm" className="flex items-center gap-2">
            Open in Form
          </Button>
          <Button onClick={() => navigate(-1)} size="sm" className="flex items-center gap-2">
            Return
          </Button>
        </div>

        <div className="mx-auto grid max-width gap-6 p-4 lg:grid-cols-3 pb-24">
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
                        {isEditing && isAdmin ? (
                          <Input
                            value={String(data?.[companyNameKey] ?? "")}
                            onChange={(e) => updateDataField(companyNameKey, e.target.value)}
                            className="h-8 text-base"
                            placeholder="Company Name"
                          />
                        ) : (
                          <CardTitle className="text-xl truncate">{companyName}</CardTitle>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="text-muted-foreground">
                            {company.countryName || company.countryCode} {company.countryCode ? `- ${company.countryCode}` : ""}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Status</span>
                            {isAdmin ? (
                              <Select value={company.incorporationStatus || ""} onValueChange={(v) => updateField("incorporationStatus", v)}>
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
                              <Badge variant="default">{company.incorporationStatus || "Pending"}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 text-xs text-muted-foreground">
                        {isAdmin && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditing((prev) => !prev)}
                          >
                            {isEditing ? "Cancel Edit" : "Edit"}
                          </Button>
                        )}
                        <div>Created: {fmtDate(company.createdAt)}</div>
                        <div>Updated: {fmtDate(company.updatedAt)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-5 min-w-0">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="grid gap-1">
                    <div className="text-xs text-muted-foreground">Applicant</div>
                    {isEditing && isAdmin ? (
                      <Input
                        value={String(data?.[applicantNameKey] ?? "")}
                        onChange={(e) => updateDataField(applicantNameKey, e.target.value)}
                        className="h-8"
                        placeholder="Applicant name"
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-sm font-medium">{applicantName || "N/A"}</div>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <div className="text-xs text-muted-foreground">Contact</div>
                    {isEditing && isAdmin ? (
                      <div className="grid gap-2">
                        <Input
                          value={String(data?.[applicantEmailKey] ?? "")}
                          onChange={(e) => updateDataField(applicantEmailKey, e.target.value)}
                          className="h-8"
                          placeholder="Email"
                          type="email"
                        />
                        <Input
                          value={String(data?.[applicantPhoneKey] ?? "")}
                          onChange={(e) => updateDataField(applicantPhoneKey, e.target.value)}
                          className="h-8"
                          placeholder="Phone"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3.5 w-3.5" />
                          <span>{applicantEmail || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3.5 w-3.5" />
                          <span>{applicantPhone || "N/A"}</span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="grid gap-1 md:col-span-2">
                    <div className="text-xs text-muted-foreground">Alternative Names</div>
                    {isEditing && isAdmin ? (
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        <Input
                          value={String(data?.[companyAlt1Key] ?? "")}
                          onChange={(e) => updateDataField(companyAlt1Key, e.target.value)}
                          className="h-8"
                          placeholder="Alternative name 2"
                        />
                        <Input
                          value={String(data?.[companyAlt2Key] ?? "")}
                          onChange={(e) => updateDataField(companyAlt2Key, e.target.value)}
                          className="h-8"
                          placeholder="Alternative name 3"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {altNames.length ? altNames.map((n, idx) => (
                          <Badge key={`${n}-${idx}`} variant="secondary">{n}</Badge>
                        )) : <span className="text-sm text-muted-foreground">N/A</span>}
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Progress</div>
                    <div className="text-sm font-semibold">{pct}%</div>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {stepGroups.map((group) => (
              <Card key={group.step.id} className="min-w-0">
                <CardHeader>
                  <CardTitle className="text-base">{t(group.step.title, group.step.title)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.fields}
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card>
              <CardHeader>
                <CardTitle>Parties (Shareholders/Directors/DCP)</CardTitle>
              </CardHeader>
              <CardContent>
                {company.parties?.length ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[30%]">Party</TableHead>
                          <TableHead className="w-[20%]">Roles</TableHead>
                          <TableHead className="w-[15%]">Shares</TableHead>
                          <TableHead className="w-[15%]">KYC</TableHead>
                          <TableHead className="w-[20%]">Invite</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {company.parties.map((p) => (
                          <TableRow key={p._id || p.email}>
                            <TableCell>
                              <div className="font-medium">{p.name || "N/A"}</div>
                              <div className="text-xs text-muted-foreground">{p.email}</div>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {(p.roles || []).join(", ") || "N/A"}
                            </TableCell>
                            <TableCell className="text-sm">{p.shares ?? "N/A"}</TableCell>
                            <TableCell>
                              <Badge variant={p.kycStatus === "verified" ? "default" : "outline"} className={p.kycStatus === "verified" ? "" : "text-muted-foreground"}>
                                {p.kycStatus || "pending"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {isAdmin ? (
                                <Button variant="outline" size="sm" onClick={() => handleInviteParty(p)} className="inline-flex items-center gap-1">
                                  <Send className="h-3.5 w-3.5" />
                                  {p.invited ? "Remind" : "Invite"}
                                </Button>
                              ) : (
                                <Badge variant="secondary">{p.invited ? "Invited" : "Not invited"}</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">No parties linked.</div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6">
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
                        {(company?.paymentStatus || "").toUpperCase() || "N/A"}
                      </Badge>
                      {company?.stripeLastStatus && <Badge variant="outline">{company.stripeLastStatus}</Badge>}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <div className="text-xs text-muted-foreground">Receipt / Proof</div>
                  {company?.paymentStatus === "paid" && company?.stripeLastStatus === "succeeded" && company?.stripeReceiptUrl ? (
                    <div className="rounded-md border bg-emerald-50 p-4 text-emerald-800">
                      <div className="text-sm font-medium">Payment successful via Stripe.</div>
                      <a href={company.stripeReceiptUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center text-sm underline">
                        View Stripe Receipt
                      </a>
                    </div>
                  ) : company?.uploadReceiptUrl ? (
                    <div className="space-y-3">
                      <a href={company.uploadReceiptUrl} target="_blank" rel="noreferrer" className="group relative block overflow-hidden rounded-md border">
                        <img src={company.uploadReceiptUrl} alt="Payment receipt" className="h-44 w-full object-cover transition-transform duration-200 group-hover:scale-[1.01]" />
                      </a>
                      {isAdmin && (
                        <div className="flex items-center gap-3">
                          <Label className="text-sm font-medium">Payment Status:</Label>
                          <Select value={company.paymentStatus || "unpaid"} onValueChange={(val) => updateField("paymentStatus", val)}>
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
                      {company?.stripeAmountCents
                        ? `${(company.stripeAmountCents / 100).toFixed(2)} ${(company.stripeCurrency || "USD").toUpperCase()}`
                        : "N/A"}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="expiresAt" className="text-right">Expires</Label>
                    {isAdmin ? (
                      <Input
                        id="expiresAt"
                        type="date"
                        value={company.expiresAt ? String(company.expiresAt).slice(0, 10) : ""}
                        onChange={(e) => updateField("expiresAt", e.target.value)}
                        className="col-span-3"
                      />
                    ) : (
                      <div className="col-span-3 text-sm">{company.expiresAt ? fmtDate(company.expiresAt) : "N/A"}</div>
                    )}
                  </div>
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
                    <CardTitle className="text-base">Compliance and Declarations</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["legalAndEthicalConcern", "Legal and Ethical Concern"],
                    ["q_country", "Sanctioned Countries Activity"],
                    ["sanctionsExposureDeclaration", "Sanctions Exposure"],
                    ["crimeaSevastapolPresence", "Crimea/Sevastopol Presence"],
                    ["russianEnergyPresence", "Russian Energy/Defense Presence"],
                  ].map(([key, label]) => (
                    <div key={key} className="grid gap-1">
                      <div className="text-xs text-muted-foreground">{label}</div>
                      <Badge variant={(data as any)[key] === "yes" ? "destructive" : "outline"} className={(data as any)[key] === "yes" ? "" : "text-muted-foreground"}>
                        {String((data as any)[key] || "N/A").toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1">
                    <div className="text-xs text-muted-foreground">Social App</div>
                    <div className="text-sm">{data?.sns || "N/A"}</div>
                  </div>
                  <div className="grid gap-1">
                    <div className="text-xs text-muted-foreground">Handle / ID</div>
                    <div className="text-sm">{data?.snsId || "N/A"}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Client</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div>
                  <Label>Email</Label>
                  <Input value={emailTo} onChange={(e) => setEmailTo(e.target.value)} />
                </div>
                <div>
                  <Label>Subject</Label>
                  <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
                </div>
                <div>
                  <Label>Message</Label>
                  <Textarea value={emailMessage} onChange={(e) => setEmailMessage(e.target.value)} rows={4} />
                </div>
                <Button onClick={handleSendEmail}>Send Email</Button>
              </CardContent>
            </Card>
          </div>

          {isAdmin && (
            <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="mx-auto flex max-width items-center justify-between gap-3 p-3">
                <div className="text-xs text-muted-foreground">
                  Status: <strong>{company.incorporationStatus || "Pending"}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="documents" className="p-6">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">Record of Documents</h1>
          <p className="text-sm text-muted-foreground">Open the company documents manager to upload and review files.</p>
          <Button onClick={() => navigate(`/company-documents/${company.countryCode}/${company._id}`)} size="sm">
            Open Document Manager
          </Button>
        </div>
      </TabsContent>

      {isAdmin && (
        <TabsContent value="memos" className="p-6">
          <div className="space-y-6">
            <MemoApp id={company._id} />
          </div>
        </TabsContent>
      )}

      {isAdmin && (
        <TabsContent value="projects" className="p-6">
          <div className="space-y-6">
            <AdminProject id={company._id} />
          </div>
        </TabsContent>
      )}

      <TabsContent value="checklist" className="p-6">
        <ChecklistHistory id={company._id} items={checklistItems} />
      </TabsContent>

      <TabsContent value="raw" className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Application Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted/30 p-3 rounded-md overflow-auto">{JSON.stringify(company, null, 2)}</pre>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default McapCompanyDetail;
