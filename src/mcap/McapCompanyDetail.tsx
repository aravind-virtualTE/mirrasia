/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "@/services/fetch";
import { resolveMcapConfigForCompany, resolveMcapRuntimeConfig } from "@/mcap/configs/registry";
import type { McapField, McapFees, McapJourneyType } from "@/mcap/configs/types";
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { Banknote, Building2, Mail, MoreHorizontal, Phone, ReceiptText, Send, ShieldCheck, Ticket } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import McapPartyKycModal from "@/mcap/McapPartyKycModal";
import McapCompanyDocumentCenter from "@/mcap/documents/McapCompanyDocumentCenter";
import { InvoiceWidget } from "@/mcap/fields/InvoiceWidget";
import {
  EXISTING_COMPANY_ONBOARDING_BRN_FIELD,
  isExistingCompanyOnboardingJourney,
  resolveMcapJourneyType,
} from "@/mcap/journey";

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
  inviteStatus?: string;
  inviteExpiresAt?: string;
  inviteAcceptedAt?: string;
  kycStatus?: string;
  kycExpiresAt?: string;
  kycOverrideReason?: string;
  details?: Record<string, any>;
};

const PARTY_ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: "director", label: "Director" },
  { value: "shareholder", label: "Shareholder" },
  { value: "dcp", label: "DCP" },
];

const PARTY_SHARE_TYPE_OPTIONS = ["ordinary", "preference"];

type McapCompany = {
  _id: string;
  countryCode: string;
  countryName?: string;
  journeyType?: McapJourneyType;

  // Elevated Core Fields
  companyName?: string;
  applicantName?: string;
  applicantEmail?: string;
  applicantPhone?: string;

  status?: string;
  incorporationStatus?: string;
  incorporationDate?: string | Date;
  paymentStatus?: string;
  assignedTo?: string;
  assignedAgentId?: string | null;
  stepIdx?: number;
  kycStatus?: string;
  data?: Record<string, any>;
  parties?: McapParty[];
  roleStatus?: { missing?: string[]; summary?: Record<string, string> };
  paymentIntentId?: string;
  stripeLastStatus?: string;
  stripeReceiptUrl?: string;
  stripeAmountCents?: number;
  stripeCurrency?: string;
  uploadReceiptUrl?: string;
  computedFees?: Record<string, any>;

  // Renewal Tracking
  renewalDate?: string;
  lastRenewalDate?: string;
  couponCode?: string;
  couponDiscount?: number;
  renewalStatus?: string;

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

const EXISTING_COMPANY_ONBOARDING_SUMMARY_FIELDS = new Set([
  EXISTING_COMPANY_ONBOARDING_BRN_FIELD,
  "incorporationDate",
]);

const isExistingCompanyOnboardingSummaryField = (stepId?: string, fieldName?: string) => {
  return String(stepId || "").trim().toLowerCase() === "company"
    && !!fieldName
    && EXISTING_COMPANY_ONBOARDING_SUMMARY_FIELDS.has(fieldName);
};

const getCompanyName = (company: McapCompany) => {
  return company.data?.companyName1 || company.data?.companyName_1 || company.data?.name1 || company.data?.companyName || company.data?.desiredCompanyName || company.data?.companyNamePrimary || company.companyName || "";
};

const getAltCompanyNames = (data: Record<string, any>) => {
  const raw = [
    data?.companyName2,
    data?.companyName3,
    data?.companyName_2,
    data?.companyName_3,
    data?.name2,
    data?.name3,
  ];
  return raw.filter((v) => !!v);
};

const getApplicant = (company: McapCompany) => {
  return company.applicantName || company.data?.applicantName || company.data?.name || company.data?.contactName || company.data?.primaryContactName || "";
};

const getEmail = (company: McapCompany) => {
  return company.applicantEmail || company.data?.applicantEmail || company.data?.email || company.data?.applicantEmailAddress || company.data?.contactEmail || "";
};

const getPhone = (company: McapCompany) => {
  return company.applicantPhone || company.data?.applicantPhone || company.data?.phoneNum || company.data?.phone || company.data?.contactPhone || "";
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

const hasStoredInvoiceSnapshot = (fees: any) => {
  if (!fees || typeof fees !== "object") return false;
  if (Array.isArray(fees.items) && fees.items.length > 0) return true;

  return ["total", "government", "service", "grandTotal"].some((key) => {
    const value = Number(fees[key]);
    return Number.isFinite(value) && value > 0;
  });
};

const formatMoney = (amount?: number, currency = "USD") => {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) return null;

  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(numericAmount);
  } catch {
    return `${numericAmount.toFixed(2)} ${currency}`;
  }
};

const isImageValue = (value: unknown) => {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("data:image/") || trimmed.startsWith("blob:")) return true;
  return /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(trimmed);
};

const renderDetailField = ({
  field,
  data,
  t,
}: {
  field: McapField;
  data: Record<string, any>;
  t: any;
}) => {
  if (!field?.name) return null;
  if (field.condition && !field.condition(data)) return null;
  const rawValue = toDisplayValue(data[field.name]);
  if (rawValue == null) return null;

  const label = field.label ? t(field.label, field.label) : "";

  if (field.type === "signature") {
    return (
      <div key={field.name} className="grid gap-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        {typeof rawValue === "string" && isImageValue(rawValue) ? (
          <div className="rounded-lg border bg-slate-50 p-3">
            <img
              src={rawValue}
              alt={label || "Signature"}
              className="max-h-24 w-full object-contain"
            />
          </div>
        ) : (
          <div className="text-sm font-medium break-words">{String(rawValue)}</div>
        )}
      </div>
    );
  }

  if (field.type === "checkbox") {
    const checked = rawValue === true || rawValue === "true" || rawValue === "yes";
    return (
      <div key={field.name} className="grid gap-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        <Badge variant={checked ? "default" : "outline"} className={!checked ? "text-muted-foreground" : ""}>
          {checked ? "YES" : "NO"}
        </Badge>
      </div>
    );
  }

  const options = field.options || [];
  const mapOption = (val: any) => {
    const opt = options.find((o) => String(o.value) === String(val));
    return opt ? t(opt.label, opt.label) : String(val);
  };

  if (Array.isArray(rawValue)) {
    return (
      <div key={field.name} className="grid gap-1">
        <div className="text-xs text-muted-foreground">{label}</div>
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
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium break-words">{mapOption(rawValue)}</div>
    </div>
  );
};

const renderRepeatableSectionDetail = (config: any, data: Record<string, any>, t: any) => {
  if (!config) return null;
  const modeValue = config.modeField ? data?.[config.modeField] : undefined;
  let sections = config.sections || [];
  if (config.modes && config.modes.length > 0 && config.modeField) {
    const match = config.modes.find((m: any) => m.value === modeValue);
    if (match) sections = match.sections || [];
  }

  if (sections.length === 0) return null;

  return (
    <div className="grid gap-6">
      {sections.map((section: any, sIdx: number) => {
        if (section.condition && !section.condition(data)) return null;

        const list = section.kind === "object"
          ? (data?.[section.fieldName] ? [data[section.fieldName]] : [])
          : (Array.isArray(data?.[section.fieldName]) ? data[section.fieldName] : []);

        if (list.length === 0) return null;

        return (
          <div key={`${section.fieldName}-${sIdx}`} className="space-y-3">
            <h4 className="text-sm font-semibold">{t(section.title || section.fieldName, section.title || section.fieldName)}</h4>
            <div className="grid grid-cols-1 gap-4">
              {list.map((item: any, idx: number) => (
                <div key={idx} className="rounded-md border p-3 bg-muted/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {section.itemFields?.map((field: any) => (
                      renderDetailField({ field, data: item, t })
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const McapCompanyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const dashboardPath = "/incorporation-dashboard";
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null;
  const isAdmin = user?.role === "admin" || user?.role === "master";
  const isMaster = user?.role === "master";
  const isDashboardDetailView = searchParams.get("mode") === "detail";
  const canEdit = isAdmin && !isDashboardDetailView;
  const [company, setCompany] = useState<McapCompany | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("MIRR ASIA - Application Follow-up");
  const [emailMessage, setEmailMessage] = useState("");
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [agentUsers, setAgentUsers] = useState<AdminUser[]>([]);
  const [adminAssigned, setAdminAssigned] = useState("");
  const [agentAssigned, setAgentAssigned] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [partyModalOpen, setPartyModalOpen] = useState(false);
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("details");
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [partyDialogOpen, setPartyDialogOpen] = useState(false);
  const [partyDialogMode, setPartyDialogMode] = useState<"create" | "edit">("create");
  const [partyDialogDraft, setPartyDialogDraft] = useState<McapParty | null>(null);
  const [isSavingParty, setIsSavingParty] = useState(false);

  const fetchCompany = async () => {
    if (!id) return;
    const res = await api.get(`/mcap/companies/${id}`);
    if (res?.data?.success) {
      const payload = res.data.data as McapCompany;
      setCompany(payload);
      setAdminAssigned(payload.assignedTo || "");
      setAgentAssigned(payload.assignedAgentId ? String(payload.assignedAgentId) : "");
      const primaryEmail = getEmail(payload);
      setEmailTo(primaryEmail || "");
    }
  };

  useEffect(() => {
    fetchCompany();
  }, [id]);

  useEffect(() => {
    if (!canEdit) return;
    fetchUsers().then((users) => {
      const all: AdminUser[] = users || [];
      setAdminUsers(all.filter((u) => u.role === "admin" || u.role === "master"));
      setAgentUsers(all.filter((u) => u.role === "agent"));
    });
  }, [canEdit]);

  useEffect(() => {
    if (!canEdit) setIsEditing(false);
  }, [canEdit]);

  const updateField = (key: keyof McapCompany, value: any) => {
    setCompany((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const updateDataField = (key: string, value: any) => {
    setCompany((prev) => (prev ? { ...prev, data: { ...(prev.data || {}), [key]: value } } : prev));
  };

  const handleSave = async () => {
    if (!company || !canEdit) return;
    setIsSaving(true);
    try {
      const payload: Record<string, any> = { ...company, assignedTo: adminAssigned };
      if (isMaster) {
        payload.assignedAgentId = agentAssigned || null;
      }
      const res = await api.post("/mcap/companies", payload);
      if (res?.data?.success) {
        toast({ title: "Saved", description: "MCAP record updated." });
        setCompany(res.data.data);
        setAdminAssigned(res.data.data?.assignedTo || "");
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
    if (!company?._id || !canEdit) return;
    try {
      const res = await api.post("/mcap/parties/invite", { companyId: company._id, party });
      if (res?.data?.success) {
        toast({ title: "Invite sent", description: "KYC invitation sent to party." });
        setCompany((prev) => {
          if (!prev) return prev;
          const updated = (prev.parties || []).map((p) =>
            p._id === party._id ? { ...p, invited: true, status: "Invited", inviteStatus: "sent" } : p
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

  const handleRevokeDcp = async (party: McapParty) => {
    if (!party?._id || !canEdit) return;
    const hasDcpRole = (party.roles || []).includes("dcp");
    if (!hasDcpRole) {
      toast({ title: "No DCP role", description: "This party does not currently have DCP access." });
      return;
    }

    const target = party.name || party.email || "this party";
    const confirmed = window.confirm(`Revoke DCP role for ${target}? Access will be removed immediately.`);
    if (!confirmed) return;

    try {
      const res = await api.post(`/mcap/parties/${party._id}/revoke-dcp`);
      if (res?.data?.success) {
        toast({ title: "DCP revoked", description: "DCP role removed successfully." });
        const updatedParty = res?.data?.data;
        setCompany((prev) => {
          if (!prev) return prev;
          const updated = (prev.parties || []).map((p) =>
            p._id === party._id ? { ...p, ...updatedParty, roles: updatedParty?.roles || [] } : p
          );
          return { ...prev, parties: updated };
        });
      } else {
        toast({ title: "Revoke failed", description: res?.data?.message || "Unable to revoke DCP role.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Revoke failed", description: "Unable to revoke DCP role.", variant: "destructive" });
    }
  };

  const openPartyDialog = (mode: "create" | "edit", party: McapParty | null) => {
    setPartyDialogMode(mode);
    if (mode === "edit" && party) {
      setPartyDialogDraft({
        ...party,
        roles: [...(party.roles || [])],
        details: { ...(party.details || {}) },
      });
    } else {
      setPartyDialogDraft({
        name: "",
        email: "",
        phone: "",
        type: "person",
        roles: [],
        shares: 0,
        shareType: "ordinary",
        details: {},
      });
    }
    setPartyDialogOpen(true);
  };

  const updatePartyDraftField = (key: keyof McapParty, value: any) => {
    setPartyDialogDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const togglePartyDraftRole = (role: string) => {
    setPartyDialogDraft((prev) => {
      if (!prev) return prev;
      const roles = new Set(prev.roles || []);
      if (roles.has(role)) roles.delete(role);
      else roles.add(role);
      return { ...prev, roles: Array.from(roles) };
    });
  };

  const handleSavePartyDialog = async () => {
    if (!company?._id || !canEdit || !partyDialogDraft) return;
    if (!partyDialogDraft.name?.trim() && !partyDialogDraft.email?.trim()) {
      toast({ title: "Missing info", description: "Name or email is required.", variant: "destructive" });
      return;
    }
    setIsSavingParty(true);
    try {
      const payload: Record<string, any> = {
        companyId: company._id,
        name: partyDialogDraft.name || "",
        email: (partyDialogDraft.email || "").trim().toLowerCase(),
        phone: partyDialogDraft.phone || "",
        type: partyDialogDraft.type || "person",
        roles: partyDialogDraft.roles || [],
        shares: Number(partyDialogDraft.shares || 0),
        shareType: partyDialogDraft.shareType || "ordinary",
        details: partyDialogDraft.details || {},
      };
      if (partyDialogMode === "edit" && partyDialogDraft._id) {
        payload._id = partyDialogDraft._id;
      }
      const res = await api.post("/mcap/parties", payload);
      if (res?.data?.success) {
        toast({
          title: partyDialogMode === "edit" ? "Party updated" : "Party created",
          description: "Changes saved successfully.",
        });
        setPartyDialogOpen(false);
        setPartyDialogDraft(null);
        await fetchCompany();
      } else {
        toast({
          title: "Save failed",
          description: res?.data?.message || "Unable to save party.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({ title: "Save failed", description: "Unable to save party.", variant: "destructive" });
    } finally {
      setIsSavingParty(false);
    }
  };

  const handleDeleteParty = async (party: McapParty) => {
    if (!party?._id || !canEdit) return;
    const target = party.name || party.email || "this party";
    const confirmed = window.confirm(
      `Delete ${target}? They will lose access to this company (other companies they belong to are unaffected).`
    );
    if (!confirmed) return;
    try {
      const res = await api.delete(`/mcap/parties/${party._id}`);
      if (res?.data?.success) {
        toast({ title: "Party deleted", description: "Access revoked for this company." });
        await fetchCompany();
      } else {
        toast({
          title: "Delete failed",
          description: res?.data?.message || "Unable to delete party.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({ title: "Delete failed", description: "Unable to delete party.", variant: "destructive" });
    }
  };

  const openPartyModal = (partyId?: string) => {
    if (!partyId) return;
    setSelectedPartyId(partyId);
    setPartyModalOpen(true);
  };

  const handlePartyModalChange = (open: boolean) => {
    setPartyModalOpen(open);
    if (!open) setSelectedPartyId(null);
  };

  const config = useMemo(() => {
    const baseConfig = resolveMcapConfigForCompany({
      countryCode: company?.countryCode,
      data: company?.data,
    });
    if (!baseConfig) return null;
    return resolveMcapRuntimeConfig(baseConfig, {
      data: company?.data,
      parties: company?.parties,
      journeyType: company?.journeyType,
    });
  }, [company?.countryCode, company?.data, company?.journeyType, company?.parties]);

  const invoiceFees = useMemo<McapFees | undefined>(() => {
    const dataFees = company?.data?.computedFees;
    if (hasStoredInvoiceSnapshot(dataFees)) return dataFees as McapFees;

    const rootFees = company?.computedFees;
    if (hasStoredInvoiceSnapshot(rootFees)) return rootFees as McapFees;

    return undefined;
  }, [company?.computedFees, company?.data?.computedFees]);

  const checklistItems = useMemo(() => {
    const code = (company?.countryCode || "").toUpperCase();
    if (code === "HK") return [hkIncorporationItems, hkRenewalList];
    if (code === "US") return [usIncorporationItems, usRenewalList];
    if (code === "SG") return [singaporeUkChecklistItems, []];

    // Default fallback for any other country
    return [multiJurisdictionChecklistItems, []];
  }, [company?.countryCode]);

  const stepGroups = useMemo(() => {
    if (!config?.steps) return [];
    const data = company?.data || {};
    const shouldLiftOnboardingSummaryFields = isExistingCompanyOnboardingJourney(company?.journeyType);
    const isPaymentStep = (step: { id?: string; widget?: string; title?: string }) =>
      step?.widget === "PaymentWidget"
      || /^payments?$/i.test(String(step?.id || ""))
      || /\bpayment\b/i.test(String(step?.title || ""));

    return config.steps
      .filter((step) => (Array.isArray(step.fields) && step.fields.length > 0) || step.widget === "RepeatableSection")
      .filter((step) => !isPaymentStep(step))
      .filter((step) => step.id !== "compliance")
      .map((step) => {
        if (step.widget === "RepeatableSection") {
          const content = renderRepeatableSectionDetail(step.widgetConfig, data, t);
          return { step, isRepeatable: true, content };
        }

        const fields = (step.fields || [])
          .filter((field) => !(
            shouldLiftOnboardingSummaryFields
            && isExistingCompanyOnboardingSummaryField(step.id, field.name)
          ))
          .map((field) => renderDetailField({ field, data, t }))
          .filter(Boolean);
        return { step, fields };
      })
      .filter((group) => (group.fields && group.fields.length > 0) || group.isRepeatable);
  }, [config?.steps, company?.data, company?.journeyType, t]);

  const complianceGroup = useMemo(() => {
    if (!config?.steps) return null;
    const data = company?.data || {};
    const complianceStep = config.steps.find((step) => step.id === "compliance" && Array.isArray(step.fields) && step.fields.length > 0);
    if (!complianceStep) return null;
    const fields = (complianceStep.fields || []).map((field) => renderDetailField({ field, data, t })).filter(Boolean);
    if (fields.length === 0) return null;
    return { step: complianceStep, fields };
  }, [config?.steps, company?.data, t]);

  // console.log("stepGroups",stepGroups)
  if (!id) {
    return <div className="p-6 text-sm text-destructive">Error: No company ID provided in route.</div>;
  }

  if (!company) {
    return <div className="p-6 text-sm text-muted-foreground">Loading...</div>;
  }

  const data = company.data || {};
  const companyName = getCompanyName(company) || "Untitled Company";
  const altNames = getAltCompanyNames(data);
  const applicantName = getApplicant(company);
  const applicantEmail = getEmail(company);
  const applicantPhone = getPhone(company);
  const onboardingBrnNo = String(data?.[EXISTING_COMPANY_ONBOARDING_BRN_FIELD] || "").trim();
  const onboardingIncorporationDate = String(company?.incorporationDate || "").trim().slice(0, 10);
  const companyNameKey = resolveFieldKey(data, ["companyName1", "companyName_1", "name1"], "companyName1");
  const companyAlt1Key = resolveFieldKey(data, ["companyName2", "companyName_2", "name2"], "companyName2");
  const companyAlt2Key = resolveFieldKey(data, ["companyName3", "companyName_3", "name3"], "companyName3");
  const applicantNameKey = resolveFieldKey(data, ["applicantName", "name", "contactName", "primaryContactName"], "applicantName");
  const applicantEmailKey = resolveFieldKey(data, ["email", "applicantEmail", "applicantEmailAddress", "contactEmail"], "email");
  const applicantPhoneKey = resolveFieldKey(data, ["phone", "phoneNum", "contactPhone"], "phone");
  const journeyType = resolveMcapJourneyType(company.journeyType);
  const isExistingCompanyOnboarding = isExistingCompanyOnboardingJourney(journeyType);
  const stepsCount = config?.steps?.length || 1;
  const pct = Math.min(100, Math.max(0, Math.round(((company.stepIdx || 0) / (stepsCount - 1 || 1)) * 100)));
  const invoiceItemCount = Array.isArray((invoiceFees as any)?.items) ? (invoiceFees as any).items.length : 0;
  const invoiceSummaryAmount = invoiceFees
    ? formatMoney(
      Number((invoiceFees as any)?.grandTotal ?? (invoiceFees as any)?.total),
      String((invoiceFees as any)?.currency || company?.stripeCurrency || "USD").toUpperCase()
    )
    : (
      company?.stripeAmountCents
        ? formatMoney(company.stripeAmountCents / 100, String(company.stripeCurrency || "USD").toUpperCase())
        : null
    );

  return (
    <>
      <Tabs value={activeSection} onValueChange={setActiveSection} className="flex flex-col w-full mx-auto">
        <TabsList className="flex w-full p-1 bg-background/80 rounded-t-lg border-b">
          <TabsTrigger value="details" className="flex-1 py-3 text-md font-medium rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
            Company Details
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex-1 py-3 text-md font-medium rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
            Record of Documents
          </TabsTrigger>
          {canEdit && (
            <TabsTrigger value="memos" className="flex-1 py-3 text-md font-medium rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
              Memo
            </TabsTrigger>
          )}
          {canEdit && (
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
          {/* {!isDashboardDetailView && companyName && <TodoApp id={company._id} name={companyName} />} */}

          <div className="flex flex-wrap gap-3 mt-4">
            {canEdit && (
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
            {canEdit && isMaster && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Assign Agent:</span>
                <Select value={agentAssigned} onValueChange={setAgentAssigned}>
                  <SelectTrigger className="w-60 h-8 text-xs">
                    <SelectValue placeholder="Assign Agent to..." />
                  </SelectTrigger>
                  <SelectContent>
                    {agentUsers.length === 0 && (
                      <div className="px-2 py-1.5 text-xs text-muted-foreground">
                        No agents available
                      </div>
                    )}
                    {agentUsers.map((u) => (
                      <SelectItem key={u._id} value={u._id}>
                        {u.fullName || u.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button onClick={() => setActiveSection("documents")} size="sm" className="flex items-center gap-2">
              Company Docs
            </Button>
            {canEdit && (
              <Button
                onClick={() => navigate(`/incorporation-documents?companyId=${company._id}`)}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                MCAP Docs Hub
              </Button>
            )}
            {canEdit && (
              <Button onClick={() => navigate(`/incorporation?companyId=${company._id}`)} size="sm" className="flex items-center gap-2">
                Open in Form
              </Button>
            )}
            <Button onClick={() => navigate(dashboardPath)} size="sm" className="flex items-center gap-2">
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
                          {isEditing && canEdit ? (
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
                            <Badge variant={isExistingCompanyOnboarding ? "outline" : "secondary"}>
                              {t(
                                `mcap.journey.labels.${journeyType}`,
                                isExistingCompanyOnboarding ? "Existing Company Onboarding" : "New Incorporation"
                              )}
                            </Badge>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Status</span>
                              {canEdit ? (
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
                          {canEdit && (
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
                          {company.renewalDate && (
                            <div className="flex items-center gap-1 mt-1 text-primary font-medium">
                              <span>Renewal: {fmtDate(company.renewalDate)}</span>
                              {company.renewalStatus && (
                                <Badge variant="outline" className="text-[10px] h-4 px-1 leading-none uppercase">
                                  {company.renewalStatus}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-5 min-w-0">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="grid gap-1">
                      <div className="text-xs text-muted-foreground">Applicant</div>
                      {isEditing && canEdit ? (
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
                      {isEditing && canEdit ? (
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
                    <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-2">
                      <div className="grid gap-1">
                        <div className="text-xs text-muted-foreground">
                          {t("mcap.journey.onboardingFields.brnNo.label", "BRN No.")}
                        </div>
                        {isEditing && canEdit ? (
                          <Input
                            value={onboardingBrnNo}
                            onChange={(e) => updateDataField(EXISTING_COMPANY_ONBOARDING_BRN_FIELD, e.target.value)}
                            className="h-8"
                            placeholder={t("mcap.journey.onboardingFields.brnNo.placeholder", "Enter BRN number")}
                          />
                        ) : (
                          <div className="text-sm font-medium">{onboardingBrnNo || "N/A"}</div>
                        )}
                      </div>
                      <div className="grid gap-1">
                        <div className="text-xs text-muted-foreground">
                          {t("mcap.journey.onboardingFields.incorporationDate.label", "Incorporation Date")}
                        </div>
                        {isEditing && canEdit ? (
                          <Input
                            type="date"
                            value={onboardingIncorporationDate}
                            onChange={(e) => updateField("incorporationDate", e.target.value)}
                            className="h-8"
                            placeholder={t("mcap.journey.onboardingFields.incorporationDate.placeholder", "Select incorporation date")}
                          />
                        ) : (
                          <div className="text-sm font-medium">
                            {onboardingIncorporationDate ? fmtDate(onboardingIncorporationDate) : "N/A"}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-1 md:col-span-2">
                      <div className="text-xs text-muted-foreground">Alternative Names</div>
                      {isEditing && canEdit ? (
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

              {stepGroups.map((group) => {
                if (group.isRepeatable && !group.content) return null; // skip if nothing rendered
                return (
                  <Card key={group.step.id} className="min-w-0">
                    <CardHeader>
                      <CardTitle className="text-base">{t(group.step.title, group.step.title)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {group.isRepeatable ? (
                        group.content
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {group.fields}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle>Parties (Shareholders/Directors/DCP)</CardTitle>
                      {company.roleStatus?.missing?.length ? (
                        <div className="text-xs text-destructive">
                          Missing required roles: {company.roleStatus.missing.join(", ")}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">All mandatory roles present</div>
                      )}
                    </div>
                    {canEdit && (
                      <Button size="sm" onClick={() => openPartyDialog("create", null)}>
                        Add Party
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {company.parties?.length ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[4%]">#</TableHead>
                            <TableHead className="w-[22%]">Party</TableHead>
                            <TableHead className="w-[16%]">Roles</TableHead>
                            <TableHead className="w-[8%]">Shares</TableHead>
                            <TableHead className="w-[14%]">KYC</TableHead>
                            <TableHead className="w-[12%]">Invite</TableHead>
                            <TableHead className="w-[8%]">View</TableHead>
                            {canEdit && <TableHead className="w-[16%] text-right">Actions</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {company.parties.map((p, idx) => (
                            <TableRow key={p._id || p.email}>
                              <TableCell className="text-sm text-muted-foreground">{idx + 1}</TableCell>
                              <TableCell>
                                <div className="font-medium">{p.name || "N/A"}</div>
                                <div className="text-xs text-muted-foreground">{p.email}</div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {(p.roles || []).length ? (
                                    (p.roles || []).map((r) => (
                                      <Badge key={r} variant="secondary" className="capitalize text-[10px]">
                                        {r}
                                      </Badge>
                                    ))
                                  ) : (
                                    <span className="text-xs text-muted-foreground">N/A</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">{p.shares ?? "N/A"}</TableCell>
                              <TableCell className="space-y-1">
                                <Badge
                                  variant={
                                    p.kycStatus === "approved"
                                      ? "default"
                                      : p.kycStatus === "expired" || p.kycStatus === "rejected"
                                        ? "destructive"
                                        : "outline"
                                  }
                                  className="capitalize"
                                >
                                  {p.kycStatus || "pending"}
                                </Badge>
                                {p.kycExpiresAt && (
                                  <div className="text-[11px] text-muted-foreground">
                                    Exp: {fmtDate(p.kycExpiresAt)}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                {canEdit ? (
                                  <Button variant="outline" size="sm" onClick={() => handleInviteParty(p)} className="inline-flex items-center gap-1">
                                    <Send className="h-3.5 w-3.5" />
                                    {p.invited ? "Remind" : "Invite"}
                                  </Button>
                                ) : (
                                  <div className="space-y-1">
                                    <Badge variant="secondary" className="capitalize">
                                      {p.inviteStatus || (p.invited ? "sent" : "pending")}
                                    </Badge>
                                    {p.inviteExpiresAt && (
                                      <div className="text-[11px] text-muted-foreground">
                                        Expires: {fmtDate(p.inviteExpiresAt)}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <Button variant="outline" size="sm" onClick={() => openPartyModal(p._id)} disabled={!p._id}>
                                  View
                                </Button>
                              </TableCell>
                              {canEdit && (
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        disabled={!p._id}
                                        aria-label="Row actions"
                                      >
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => openPartyDialog("edit", p)}>
                                        Edit
                                      </DropdownMenuItem>
                                      {(p.roles || []).includes("dcp") && (
                                        <DropdownMenuItem onClick={() => handleRevokeDcp(p)}>
                                          Revoke DCP
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem
                                        onClick={() => handleDeleteParty(p)}
                                        className="text-destructive focus:text-destructive"
                                      >
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              )}
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
              {!isExistingCompanyOnboarding && (
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
                          {canEdit && (
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
                        {canEdit ? (
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

                    <Accordion type="single" collapsible className="rounded-lg border px-4">
                      <AccordionItem value="invoice-breakdown" className="border-b-0">
                        <AccordionTrigger className="py-3 hover:no-underline">
                          <div className="flex flex-col items-start gap-1">
                            <span className="text-sm font-medium">Invoice Breakdown</span>
                            <span className="text-xs text-muted-foreground">
                              {invoiceFees
                                ? `Stored invoice snapshot${invoiceSummaryAmount ? ` • ${invoiceSummaryAmount}` : ""}`
                                : "No saved invoice snapshot for this company."}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-3 space-y-3">
                          {(company?.couponCode || company?.data?.couponCode) && (
                            <div className="flex items-center justify-between rounded-md bg-primary/5 p-3 border border-primary/10">
                              <div className="space-y-0.5">
                                <div className="text-xs font-medium text-primary uppercase tracking-wider">Coupon Applied</div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="font-mono bg-background">
                                    {company.couponCode || company.data?.couponCode}
                                  </Badge>
                                  <span className="text-sm font-semibold">
                                    -{formatMoney(company.couponDiscount || company.data?.couponDiscount || 0, company.stripeCurrency || "USD")}
                                  </span>
                                </div>
                              </div>
                              <Ticket className="h-5 w-5 text-primary/40" />
                            </div>
                          )}
                          {invoiceFees ? (
                            <div className="flex flex-col gap-3 rounded-md bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="space-y-1">
                                <div className="text-sm font-medium">Invoice details available</div>
                                <div className="text-xs text-muted-foreground">
                                  {invoiceItemCount > 0
                                    ? `${invoiceItemCount} charge line${invoiceItemCount > 1 ? "s" : ""} captured from the application invoice.`
                                    : "Totals were captured on this company record."}
                                </div>
                              </div>
                              <Button type="button" variant="outline" size="sm" onClick={() => setInvoiceDialogOpen(true)}>
                                View Invoice
                              </Button>
                            </div>
                          ) : (
                            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                              Invoice details are not available for this record.
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              )}

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
                  {complianceGroup ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {complianceGroup.fields}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No compliance answers saved yet.</div>
                  )}
                  {(data?.sns || data?.snsId) && <Separator />}
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
                    <Input value={emailTo} onChange={(e) => setEmailTo(e.target.value)} readOnly={isDashboardDetailView} />
                  </div>
                  <div>
                    <Label>Subject</Label>
                    <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} readOnly={isDashboardDetailView} />
                  </div>
                  <div>
                    <Label>Message</Label>
                    <Textarea value={emailMessage} onChange={(e) => setEmailMessage(e.target.value)} rows={4} readOnly={isDashboardDetailView} />
                  </div>
                  <Button onClick={handleSendEmail} disabled={isDashboardDetailView}>Send Email</Button>
                </CardContent>
              </Card>
            </div>

            {canEdit && (
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
          <McapCompanyDocumentCenter
            companyId={company._id}
            countryCode={company.countryCode}
            companyName={companyName}
            allowDelete={canEdit}
          />
        </TabsContent>

        {canEdit && (
          <TabsContent value="memos" className="p-6">
            <div className="space-y-6">
              <MemoApp id={company._id} />
            </div>
          </TabsContent>
        )}

        {canEdit && (
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
      <McapPartyKycModal
        partyId={selectedPartyId}
        open={partyModalOpen}
        onOpenChange={handlePartyModalChange}
        onSaved={fetchCompany}
        forceReadOnly={isDashboardDetailView}
      />
      <Dialog open={partyDialogOpen} onOpenChange={(open) => {
        setPartyDialogOpen(open);
        if (!open) setPartyDialogDraft(null);
      }}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{partyDialogMode === "edit" ? "Edit Party" : "Add Party"}</DialogTitle>
            <DialogDescription>
              {partyDialogMode === "edit"
                ? "Update party details, roles, and KYC fields."
                : "Create a new party linked to this company."}
            </DialogDescription>
          </DialogHeader>
          {partyDialogDraft && (
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1">
                  <Label>Name</Label>
                  <Input
                    value={partyDialogDraft.name || ""}
                    onChange={(e) => updatePartyDraftField("name", e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={partyDialogDraft.email || ""}
                    onChange={(e) => updatePartyDraftField("email", e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label>Phone</Label>
                  <Input
                    value={partyDialogDraft.phone || ""}
                    onChange={(e) => updatePartyDraftField("phone", e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label>Type</Label>
                  <Select
                    value={partyDialogDraft.type || "person"}
                    onValueChange={(v) => updatePartyDraftField("type", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="person">Person</SelectItem>
                      <SelectItem value="entity">Entity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-1">
                <Label>Roles</Label>
                <div className="flex flex-wrap gap-3">
                  {PARTY_ROLE_OPTIONS.map((opt) => {
                    const checked = (partyDialogDraft.roles || []).includes(opt.value);
                    return (
                      <label key={opt.value} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePartyDraftRole(opt.value)}
                        />
                        {opt.label}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1">
                  <Label>Shares</Label>
                  <Input
                    type="number"
                    value={partyDialogDraft.shares ?? 0}
                    onChange={(e) => updatePartyDraftField("shares", Number(e.target.value))}
                  />
                </div>
                <div className="grid gap-1">
                  <Label>Share Type</Label>
                  <Select
                    value={partyDialogDraft.shareType || "ordinary"}
                    onValueChange={(v) => updatePartyDraftField("shareType", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PARTY_SHARE_TYPE_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setPartyDialogOpen(false)} disabled={isSavingParty}>
                  Cancel
                </Button>
                <Button onClick={handleSavePartyDialog} disabled={isSavingParty}>
                  {isSavingParty ? "Saving..." : partyDialogMode === "edit" ? "Save Changes" : "Create Party"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {!isExistingCompanyOnboarding && (
        <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
          <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto p-0">
            <DialogHeader className="border-b px-6 py-4">
              <DialogTitle>Invoice Details</DialogTitle>
              <DialogDescription>
                Stored fee breakdown captured from the company application flow.
              </DialogDescription>
            </DialogHeader>
            <div className="p-6">
              {invoiceFees ? (
                <InvoiceWidget
                  fees={invoiceFees}
                  companyName={companyName}
                  readOnly
                  data={company}
                  companyId={company._id}
                />
              ) : (
                <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                  Invoice details are not available for this record.
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default McapCompanyDetail;
