/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Banknote, Building2, ReceiptText, Mail, Phone, CheckCircle2, Circle, Save, Trash2 } from "lucide-react";
import { createOrUpdatePaFIncorpo, getPaFIncorpoData } from "../PanamaFoundation/PaState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MemoApp from "./MemosHK";
import AdminProject from "@/pages/dashboard/Admin/Projects/AdminProject";
import TodoApp from "@/pages/Todo/TodoApp";
import { useNavigate } from "react-router-dom";
import { fetchUsers, markDeleteCompanyRecord } from "@/services/dataFetch";
import { useAtom } from "jotai";
import { usersData } from "@/services/state";
import { toast } from "@/hooks/use-toast";
import { t } from "i18next";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getShrMemberData, STATUS_OPTIONS } from "./detailData";
import PPifDetail from "@/components/shareholderDirector/ppifDetail";

// ----------------- Types -----------------
export type PIFRecord = {
    _id?: string;
    stepIdx?: number;
    email?: string;
    contactName?: string;
    phone?: string;
    foundationNameEn?: string;
    foundationNameEs?: string;
    altName1?: string;
    altName2?: string;
    purposeSummary?: string;
    industries?: string[];
    bizDesc?: string;
    createdAt?: string;
    updatedAt?: string;
    incorporationStatus?: string;
    incorporationDate?: string;
    // Declarations
    truthOk?: boolean;
    taxOk?: boolean;
    privacyOk?: boolean;
    legalAndEthicalConcern?: "yes" | "no" | "";
    q_country?: "yes" | "no" | "";
    sanctionsExposureDeclaration?: "yes" | "no" | "";
    crimeaSevastapolPresence?: "yes" | "no" | "";
    russianEnergyPresence?: "yes" | "no" | "";
    signName?: string;
    signDate?: string;

    // Payment
    payMethod?: string;
    paymentStatus?: "paid" | "unpaid" | "rejected" | string;
    bankRef?: string;
    expiresAt?: string;
    pricing?: { currency?: string; total?: number } | null;
    stripeLastStatus?: string;
    stripeReceiptUrl?: string;
    uploadReceiptUrl?: string;

    // System fields
    status?: string;
    assignedTo?: string;
    shippingRecipientCompany?: string;
    shippingContactPerson?: string;
    shippingPhone?: string;
    shippingPostalCode?: string;
    shippingAddress?: string;
    registeredAddressMode?: "mirr" | "own" | "";
    ownRegisteredAddress?: string;
};

// ----------------- Constants & helpers -----------------
const INDUSTRY_OPTIONS = [
    { key: "trading", labelKey: "ppif.profile.businessActivities.industries.options.trading" },
    { key: "wholesale", labelKey: "ppif.profile.businessActivities.industries.options.wholesale" },
    { key: "consulting", labelKey: "ppif.profile.businessActivities.industries.options.consulting" },
    { key: "manufacturing", labelKey: "ppif.profile.businessActivities.industries.options.manufacturing" },
    { key: "finance", labelKey: "ppif.profile.businessActivities.industries.options.finance" },
    { key: "online", labelKey: "ppif.profile.businessActivities.industries.options.online" },
    { key: "it", labelKey: "ppif.profile.businessActivities.industries.options.it" },
    { key: "crypto", labelKey: "ppif.profile.businessActivities.industries.options.crypto" },
    { key: "other", labelKey: "ppif.profile.businessActivities.industries.options.other" },
] as const;

const splitPurposes = (value?: string) =>
    (value || "")
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);

const normalizePurposeText = (raw: string) =>
    Array.from(new Set(splitPurposes(raw))).join(", ").slice(0, 280);

const COMPLIANCE_QUESTIONS = [
    { key: "legalAndEthicalConcern", label: "ppif.aml.q1.label", hint: undefined },
    { key: "q_country", label: "ppif.aml.q2.label", hint: undefined },
    { key: "sanctionsExposureDeclaration", label: "ppif.aml.q3.label", hint: undefined },
    { key: "crimeaSevastapolPresence", label: "ppif.aml.q4.label", hint: undefined },
    { key: "russianEnergyPresence", label: "ppif.aml.q5.label", hint: "ppif.aml.q5.examples" },
] as const;

const steps = [
    "Applicant",
    "Names",
    "Business",
    "Council",
    "Beneficiaries",
    "Declarations",
    "Payment",
    "Review"
];


function pctFromStep(stepIdx: number) {
    const maxIdx = steps.length - 1;
    const clamped = Math.max(0, Math.min(stepIdx ?? 0, maxIdx));
    return Math.round((clamped / maxIdx) * 100);
}

function fmtDate(s?: string | Date | null) {
    if (!s) return "—";
    const d = new Date(s);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function FallbackAvatar({ name }: { name?: string }) {
    const initials = (name?.trim().split(/\s+/).map(n => n[0]).slice(0, 2).join("") || "?").toUpperCase();
    return (
        <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-muted/40 text-muted-foreground">
                {initials}
            </AvatarFallback>
        </Avatar>
    );
}

function LabelValue({ label, children }: React.PropsWithChildren<{ label: string }>) {
    return (
        <div className="grid gap-1">
            <div className="text-xs">{label}</div>
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
                    const state = idx < (stepIdx ?? 0) ? "done" : idx === (stepIdx ?? 0) ? "current" : "todo";
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

export default function PPifCompDetail({ id }: { id: string }) {
    const [data, setData] = React.useState<PIFRecord | null>(null);
    const [isEditing, setIsEditing] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);
    const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : { role: "user" };
    const navigate = useNavigate();
    const [users, setUsers] = useAtom(usersData);
    const [adminAssigned, setAdminAssigned] = React.useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [taskToDelete, setTaskToDelete] = React.useState<{ companyId: string, countryCode: string } | null>(null);
    const [invoiceOpen, setInvoiceOpen] = React.useState(false);
    const isAdmin = user?.role !== "user";
    const dataMemo = React.useMemo(() => ({
        applicantName: data?.contactName || "",
        email: data?.email || "",
        phone: data?.phone || "",
        name1: data?.foundationNameEn || "",
        name2: data?.foundationNameEs || "",
        name3: data?.altName1 || "",
        cname1: data?.altName2 || "",
        industries: data?.industries || [],
        purpose: splitPurposes(data?.purposeSummary || ""),
        bizdesc: data?.bizDesc || "",
        currency: data?.pricing?.currency,
        finalAmount: data?.pricing?.total,
        payMethod: data?.payMethod || "",
        bankRef: data?.bankRef || "",
        stripeLastStatus: data?.stripeLastStatus || "",
        stripeReceiptUrl: data?.stripeReceiptUrl || "",
        uploadReceiptUrl: (data as any)?.uploadReceiptUrl || "",
        truthfulnessDeclaration: !!data?.truthOk,
        legalTermsAcknowledgment: !!data?.privacyOk,
        compliancePreconditionAcknowledgment: !!data?.taxOk,
        legalAndEthicalConcern: data?.legalAndEthicalConcern || "",
        q_country: data?.q_country || "",
        sanctionsExposureDeclaration: data?.sanctionsExposureDeclaration || "",
        crimeaSevastapolPresence: data?.crimeaSevastapolPresence || "",
        russianEnergyPresence: data?.russianEnergyPresence || "",
        eSign: data?.signName ? `${data.signName} • ${fmtDate(data?.signDate)}` : "",
        shippingRecipientCompany: data?.shippingRecipientCompany || "",
        shippingContactPerson: data?.shippingContactPerson || "",
        shippingPhone: data?.shippingPhone || "",
        shippingPostalCode: data?.shippingPostalCode || "",
        shippingAddress: data?.shippingAddress || "",
        registeredAddressMode: (data as any)?.registeredAddressMode || "",
    }), [data]);
    React.useEffect(() => {
        const fetchData = async () => {
            const result = await getPaFIncorpoData(id);
            console.log("result-->", result);
            if (result) {
                setData(result);
                setAdminAssigned(result.assignedTo || "");
            }
            const usersResponse = await fetchUsers();
            const adminUsers = usersResponse.filter((e: { role: string }) => e.role === "admin" || e.role === "master");
            setUsers(adminUsers);
        };
        fetchData();
    }, []);

    const patchCompany = (key: keyof PIFRecord, value: any) => setData(prev => prev ? ({ ...prev, [key]: value }) : prev);

    const toggleIndustrySelection = (key: string, checked: boolean) => {
        setData((prev) => {
            if (!prev) return prev;
            const list = Array.isArray(prev.industries) ? [...prev.industries] : [];
            const idx = list.indexOf(key);
            if (checked) {
                if (idx === -1) list.push(key);
            } else if (idx >= 0) {
                list.splice(idx, 1);
            }
            return { ...prev, industries: list };
        });
    };

    const handlePurposeChange = (raw: string) => {
        patchCompany("purposeSummary", normalizePurposeText(raw));
    };


    const updateFounderAt = (index: number, patch: any) => {
        setData(prev => {
            if (!prev || !Array.isArray((prev as any).founders)) return prev;
            const clone: any = { ...prev };
            const arr = [...clone.founders];
            arr[index] = { ...arr[index], ...patch };
            clone.founders = arr;
            return clone;
        });
    };

    // Council helpers
    const updateCouncilIndividualAt = (index: number, patch: any) => {
        setData(prev => {
            if (!prev) return prev;
            const clone: any = { ...prev };
            const arr = Array.isArray(clone.councilIndividuals) ? [...clone.councilIndividuals] : [];
            arr[index] = { ...(arr[index] || {}), ...patch };
            clone.councilIndividuals = arr;
            return clone;
        });
    };

    const addCouncilIndividual = () => {
        setData(prev => {
            const clone: any = { ...prev };
            const arr = Array.isArray(clone.councilIndividuals) ? [...clone.councilIndividuals] : [];
            arr.push({ type: "individual", name: "", id: "", status: "", email: "", tel: "" });
            clone.councilIndividuals = arr;
            return clone;
        });
    };

    const removeCouncilIndividualAt = (index: number) => {
        setData(prev => {
            if (!prev || !Array.isArray((prev as any).councilIndividuals)) return prev;
            const clone: any = { ...prev };
            const arr = [...clone.councilIndividuals];
            arr.splice(index, 1);
            clone.councilIndividuals = arr;
            return clone;
        });
    };

    const updateCouncilCorporate = (patch: any) => {
        setData(prev => {
            if (!prev) return prev;
            const clone: any = { ...prev };
            clone.councilCorporate = { ...(clone.councilCorporate || {}), ...patch };
            return clone;
        });
    };

    // Protectors
    const updateProtectorAt = (index: number, patch: any) => {
        setData(prev => {
            if (!prev) return prev;
            const clone: any = { ...prev };
            const arr = Array.isArray(clone.protectors) ? [...clone.protectors] : [];
            arr[index] = { ...(arr[index] || {}), ...patch };
            clone.protectors = arr;
            return clone;
        });
    };

    const addProtector = () => {
        setData(prev => {
            const clone: any = { ...prev };
            const arr = Array.isArray(clone.protectors) ? [...clone.protectors] : [];
            arr.push({ name: "", contact: "", status: "" });
            clone.protectors = arr;
            clone.protectorsEnabled = true;
            return clone;
        });
    };

    const removeProtectorAt = (index: number) => {
        setData(prev => {
            if (!prev || !Array.isArray((prev as any).protectors)) return prev;
            const clone: any = { ...prev };
            const arr = [...clone.protectors];
            arr.splice(index, 1);
            clone.protectors = arr;
            return clone;
        });
    };

    // Beneficiaries
    const updateBeneficiaryAt = (index: number, patch: any) => {
        setData(prev => {
            if (!prev) return prev;
            const clone: any = { ...prev };
            const arr = Array.isArray(clone.beneficiaries) ? [...clone.beneficiaries] : [];
            arr[index] = { ...(arr[index] || {}), ...patch };
            clone.beneficiaries = arr;
            return clone;
        });
    };

    const addBeneficiary = () => {
        setData(prev => {
            const clone: any = { ...prev };
            const arr = Array.isArray(clone.beneficiaries) ? [...clone.beneficiaries] : [];
            arr.push({ name: "", contact: "", status: "" });
            clone.beneficiaries = arr;
            return clone;
        });
    };

    const removeBeneficiaryAt = (index: number) => {
        setData(prev => {
            if (!prev || !Array.isArray((prev as any).beneficiaries)) return prev;
            const clone: any = { ...prev };
            const arr = [...clone.beneficiaries];
            arr.splice(index, 1);
            clone.beneficiaries = arr;
            return clone;
        });
    };

    // Dialog state for viewing PPIF member details
    const [selectedData, setSelectedData] = React.useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);

    const showMemberDetails = async (email: string | undefined, isCorp: string | undefined) => {
        if (!email) return;
        const type = isCorp == 'yes' || isCorp === 'corporate' ? "PPIF_Corporate" : "PPIF_Individual";
        try {
            const res = await getShrMemberData(id, email, "PPIF", type);
            setSelectedData(res.data);
            setIsDialogOpen(true);
        } catch (err) {
            console.error("Error fetching PPIF member data:", err);
        }
    };

    const onSave = async () => {
        if (!data) return;
        setIsSaving(true);
        try {
            const result = await createOrUpdatePaFIncorpo(data);
            if (result) {
                toast({ title: "Success", description: "Company details saved." });
                setIsEditing(false);
                return true;
            } else {
                toast({ title: "Error", description: "Failed to save company details.", variant: "destructive" });
            }
        } finally {
            setIsSaving(false);
        }
    };

    const AssignAdmin = () => {
        const handleAssign = (value: string) => {
            setAdminAssigned(value);
            patchCompany("assignedTo", value);
        };
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
                    {dataMemo?.name1 && data && <TodoApp id={data._id || ""} name={dataMemo?.name1} />}
                    <div className="flex gap-x-8 mt-4">
                        {user.role !== "user" && <AssignAdmin />}
                        <Button
                            onClick={() => data && navigate(`/company-documents/HK/${data._id}`)}
                            size="sm"
                            className="flex items-center gap-2"
                            disabled={!data}
                        >
                            Company Docs
                        </Button>
                        <Button onClick={() => navigate(-1)} size="sm" className="flex items-center gap-2">
                            Return to Previous Details
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
                                                            value={dataMemo.name1 || ""}
                                                            onChange={(e) => patchCompany("foundationNameEn", e.target.value)}
                                                            className="h-8 text-base"
                                                            placeholder="Foundation Name"
                                                        />
                                                    ) : (
                                                        <CardTitle className="text-xl truncate">
                                                            {dataMemo.name1 || dataMemo.cname1 || "Untitled Foundation"}
                                                        </CardTitle>
                                                    )}
                                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                                        <Badge variant="secondary" className="text-muted-foreground">{steps[data?.stepIdx ?? 0] || "—"}</Badge>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-muted-foreground">Status</span>
                                                            {user.role !== "user" ? (
                                                                <div className="flex items-center gap-2">
                                                                    <Select
                                                                        value={data?.status || ""}
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

                                                                    <LabelValue label="Incorporation Date">
                                                                        {isEditing && isAdmin ? (
                                                                            <Input
                                                                                type="date"
                                                                                value={
                                                                                    data?.incorporationDate
                                                                                        ? String(data.incorporationDate).slice(0, 10)
                                                                                        : ""
                                                                                }
                                                                                onChange={(e) =>
                                                                                    patchCompany("incorporationDate", e.target.value)
                                                                                }
                                                                                className="h-8 w-44"
                                                                            />
                                                                        ) : (
                                                                            <span>{data?.incorporationDate ? fmtDate(data.incorporationDate) : "—"}</span>
                                                                        )}
                                                                    </LabelValue>
                                                                </div>
                                                            ) : (
                                                                <Badge variant="default">{data?.status || "Pending"}</Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex shrink-0 items-center gap-2">
                                                    {user.role !== "user" ? <button
                                                        className="text-red-500 hover:red-blue-700 transition"
                                                        onClick={(e) => handleDeleteClick(id, "PPIF", e)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button> : ""}
                                                    {!isEditing ? (
                                                        <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>Edit</Button>
                                                    ) : (
                                                        <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="grid gap-5">
                                    <StepRail stepIdx={data?.stepIdx ?? 0} />
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <LabelValue label="Applicant">
                                            <div className="flex items-center gap-2">
                                                <FallbackAvatar name={dataMemo.applicantName} />
                                                <span className="font-medium">{dataMemo.applicantName || "—"}</span>
                                            </div>
                                        </LabelValue>
                                        <LabelValue label="Contact">
                                            <div className="grid gap-2">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-3.5 w-3.5" />
                                                    <span className="text-sm">{dataMemo.email || "—"}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-3.5 w-3.5" />
                                                    <span className="text-sm">{dataMemo.phone || "—"}</span>
                                                </div>
                                            </div>
                                        </LabelValue>
                                        <LabelValue label="Alt / Local Names">
                                            {isEditing ? (
                                                <div className="grid grid-cols-2 gap-2">
                                                    <Input value={dataMemo.name2 || ""} onChange={(e) => patchCompany("foundationNameEs", e.target.value)} placeholder="Alt Name (ES)" className="h-8" />
                                                    <Input value={dataMemo.name3 || ""} onChange={(e) => patchCompany("altName1", e.target.value)} placeholder="Alt Name 2" className="h-8" />
                                                    <Input value={dataMemo.cname1 || ""} onChange={(e) => patchCompany("altName2", e.target.value)} placeholder="Alt Name 3" className="h-8" />
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {[dataMemo.name2, dataMemo.name3, dataMemo.cname1].filter(Boolean).length ? (
                                                        [dataMemo.name2, dataMemo.name3, dataMemo.cname1].filter(Boolean).map((n, i) => (
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
                                        <LabelValue label={t("ppif.profile.businessActivities.industries.label")}>
                                            {isEditing ? (
                                                <div className="space-y-3 text-sm text-muted-foreground">
                                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                                        {INDUSTRY_OPTIONS.map((option) => {
                                                            const selected = data?.industries?.includes(option.key);
                                                            return (
                                                                <label
                                                                    key={option.key}
                                                                    className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-medium transition hover:bg-muted"
                                                                >
                                                                    <Checkbox
                                                                        checked={selected}
                                                                        onCheckedChange={(checked) =>
                                                                            toggleIndustrySelection(option.key, checked === true)
                                                                        }
                                                                    />
                                                                    <span className="truncate">
                                                                        {t(option.labelKey)}
                                                                    </span>
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {dataMemo.industries.length ? (
                                                        dataMemo.industries.map((k) => (
                                                            <Badge key={k} variant="secondary">
                                                                {t(`ppif.profile.businessActivities.industries.options.${k}`) || k}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-muted-foreground">—</span>
                                                    )}
                                                </div>
                                            )}
                                        </LabelValue>
                                        <LabelValue label={t("ppif.profile.purpose.label")}>
                                            {isEditing ? (
                                                <Textarea
                                                    className="h-24"
                                                    value={data?.purposeSummary || ""}
                                                    onChange={(e) => handlePurposeChange(e.target.value)}
                                                    placeholder={t("ppif.profile.purpose.placeholder")}
                                                />
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {(dataMemo.purpose.length ? dataMemo.purpose : ["—"]).map((item, idx) => (
                                                        <Badge key={item + idx} variant="secondary">
                                                            {item}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </LabelValue>
                                        <LabelValue label={t("ppif.profile.businessActivities.description.label")}>
                                            {isEditing ? (
                                                <Textarea
                                                    className="h-24"
                                                    value={data?.bizDesc || ""}
                                                    onChange={(e) => patchCompany("bizDesc", e.target.value)}
                                                    placeholder={t("ppif.profile.businessActivities.description.placeholder")}
                                                />
                                            ) : (
                                                dataMemo.bizdesc || "—"
                                            )}
                                        </LabelValue>
                                    </div>
                                    <Separator />
                                    <div className="grid gap-5">
                                        <div className="text-sm font-semibold">A. Establishment</div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <LabelValue label="Initial Endowment">
                                                {isEditing ? (
                                                    <Input
                                                        value={(data as any)?.initialEndowment || ""}
                                                        onChange={(e) => patchCompany("initialEndowment" as keyof PIFRecord, e.target.value)}
                                                        className="h-8"
                                                        placeholder="Amount"
                                                    />
                                                ) : (
                                                    (data as any)?.initialEndowment || "—"
                                                )}
                                            </LabelValue>
                                            <LabelValue label="Source of Funds">
                                                {isEditing ? (
                                                    <Input
                                                        value={(data as any)?.sourceOfFunds || ""}
                                                        onChange={(e) => patchCompany("sourceOfFunds" as keyof PIFRecord, e.target.value)}
                                                        className="h-8"
                                                        placeholder="Source"
                                                    />
                                                ) : (
                                                    (data as any)?.sourceOfFunds || (data as any)?.sourceOfFundsOther || "—"
                                                )}
                                            </LabelValue>
                                            <LabelValue label="Registered Address Mode">
                                                {isEditing ? (
                                                    <Select
                                                        value={(data as any)?.registeredAddressMode || ""}
                                                        onValueChange={(val) =>
                                                            patchCompany(
                                                                "registeredAddressMode" as keyof PIFRecord,
                                                                val,
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger className="h-8 w-full">
                                                            <SelectValue placeholder="Mode" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="mirr">
                                                                {t("ppif.profile.registeredAddress.options.mirr")}
                                                            </SelectItem>
                                                            <SelectItem value="own">
                                                                {t("ppif.profile.registeredAddress.options.own")}
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    (() => {
                                                        const need = (data as any)?.registeredAddressMode;
                                                        return need == "mirr" ? "opted for MIRRASIA address"
                                                            : need === "own" ? "Manage own address"
                                                                : "—";
                                                    })()
                                                )}
                                            </LabelValue>
                                            {(data as any)?.registeredAddressMode === "own" && (
                                                <LabelValue label="Registered Address">
                                                    {isEditing ? (
                                                        <Input
                                                            value={(data as any)?.ownRegisteredAddress || ""}
                                                            onChange={(e) =>
                                                                patchCompany("ownRegisteredAddress" as keyof PIFRecord, e.target.value)
                                                            }
                                                            className="h-8"
                                                            placeholder="Own address"
                                                        />
                                                    ) : (
                                                        (data as any)?.ownRegisteredAddress || "—"
                                                    )}
                                                </LabelValue>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <LabelValue label="Purpose of Establishment">
                                                {isEditing ? (
                                                    <Textarea
                                                        className="h-24"
                                                        value={data?.purposeSummary || ""}
                                                        onChange={(e) => handlePurposeChange(e.target.value)}
                                                        placeholder={t("ppif.profile.purpose.placeholder")}
                                                    />
                                                ) : (
                                                    (data as any)?.purposeSummary || "—"
                                                )}
                                            </LabelValue>
                                            <LabelValue label="Main Industries">
                                                {isEditing ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {INDUSTRY_OPTIONS.map((option) => {
                                                            const selected = data?.industries?.includes(option.key);
                                                            return (
                                                                <Badge key={option.key} variant={selected ? "secondary" : "outline"}>
                                                                    {t(option.labelKey)}
                                                                </Badge>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-wrap gap-2">
                                                        {Array.isArray((data as any)?.industries) && (data as any).industries.length
                                                            ? (data as any).industries.map((ind: string, i: number) => (
                                                                <Badge key={ind + i} variant="secondary">
                                                                    {ind}
                                                                </Badge>
                                                            ))
                                                            : "—"}
                                                    </div>
                                                )}
                                            </LabelValue>
                                            <LabelValue label="Countries of Activity (planned)">
                                                {isEditing ? (
                                                    <Input
                                                        value={(data as any)?.geoCountries || ""}
                                                        onChange={(e) =>
                                                            patchCompany("geoCountries" as keyof PIFRecord, e.target.value)
                                                        }
                                                        className="h-8"
                                                        placeholder="Countries"
                                                    />
                                                ) : (
                                                    (data as any)?.geoCountries || "—"
                                                )}
                                            </LabelValue>
                                            <LabelValue label="Spanish Name">
                                                {isEditing ? (
                                                    <Input
                                                        value={dataMemo.name2 || ""}
                                                        onChange={(e) =>
                                                            patchCompany("foundationNameEs" as keyof PIFRecord, e.target.value)
                                                        }
                                                        className="h-8"
                                                    />
                                                ) : (
                                                    (data as any)?.foundationNameEs || "—"
                                                )}
                                            </LabelValue>
                                        </div>
                                    </div>
                                    <Separator />
                                    {/* --- B. Founders --- */}
                                    <div className="grid gap-3">
                                        <div className="text-sm font-semibold">B. Founders</div>
                                        {Array.isArray((data as any)?.founders) && (data as any).founders.length ? (
                                            <div className="overflow-x-auto rounded-md border overflow-hidden">
                                                <div className="min-w-[700px] p-2">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead className="w-[12%]">{t("ppif.founders.type.label")}</TableHead>
                                                                <TableHead className="w-[24%]">{t("common.name", "Name")}</TableHead>
                                                                <TableHead className="w-[16%]">{t("ppif.founders.id.label", "ID / Reg No.")}</TableHead>
                                                                <TableHead className="w-[14%]">{t("common.status", "Status")}</TableHead>
                                                                <TableHead className="w-[20%]">{t("common.email", "Email")}</TableHead>
                                                                <TableHead className="w-[14%]">{t("common.phone", "Phone")}</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {(data as any).founders.map((fnd: any, i: number) => (
                                                                <TableRow
                                                                    key={(fnd?.name || "founder") + i}
                                                                    className={`align-top ${!isEditing && fnd?.email ? 'cursor-pointer hover:bg-slate-50' : ''}`}
                                                                    onClick={() => {
                                                                        if (!isEditing && fnd?.email) showMemberDetails(fnd?.email, fnd?.type);
                                                                    }}
                                                                >
                                                                    <TableCell>
                                                                        {isAdmin && isEditing ? (
                                                                            <Select
                                                                                value={fnd?.type || ""}
                                                                                onValueChange={(val) => updateFounderAt(i, { type: val })}
                                                                            >
                                                                                <SelectTrigger className="h-8">
                                                                                    <SelectValue placeholder={t("common.select", "Select")} />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    <SelectItem value="individual">{t("ppif.founders.type.options.individual")}</SelectItem>
                                                                                    <SelectItem value="corporate">{t("ppif.founders.type.options.corporate")}</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                        ) : (
                                                                            <span>{fnd?.type || "—"}</span>
                                                                        )}
                                                                    </TableCell>

                                                                    <TableCell>
                                                                        {isAdmin && isEditing ? (
                                                                            <Input className="h-8" value={fnd?.name || ""} onChange={(e) => updateFounderAt(i, { name: e.target.value })} />
                                                                        ) : (
                                                                            <span className="font-medium">{fnd?.name || "—"}</span>
                                                                        )}
                                                                    </TableCell>

                                                                    <TableCell>
                                                                        {isAdmin && isEditing ? (
                                                                            <Input className="h-8" value={fnd?.id || ""} onChange={(e) => updateFounderAt(i, { id: e.target.value })} />
                                                                        ) : (
                                                                            <span>{fnd?.id || "—"}</span>
                                                                        )}
                                                                    </TableCell>

                                                                    <TableCell>
                                                                        {isAdmin && isEditing ? (
                                                                            <Input className="h-8" value={fnd?.status || ""} onChange={(e) => updateFounderAt(i, { status: e.target.value })} />
                                                                        ) : (
                                                                            <span>{fnd?.status || "—"}</span>
                                                                        )}
                                                                    </TableCell>

                                                                    <TableCell>
                                                                        {isAdmin && isEditing ? (
                                                                            <Input className="h-8 min-w-[220px]" type="email" value={fnd?.email || ""} onChange={(e) => updateFounderAt(i, { email: e.target.value })} />
                                                                        ) : (
                                                                            <span className="text-xs text-muted-foreground">{fnd?.email || "—"}</span>
                                                                        )}
                                                                    </TableCell>

                                                                    <TableCell>
                                                                        {isAdmin && isEditing ? (
                                                                            <div className="overflow-x-auto">
                                                                                <Input className="h-8 min-w-[160px] w-full" value={fnd?.tel || ""} onChange={(e) => updateFounderAt(i, { tel: e.target.value })} />
                                                                            </div>
                                                                        ) : (
                                                                            <span>{fnd?.tel || "—"}</span>
                                                                        )}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-muted-foreground">No founders provided.</div>
                                        )}

                                    </div>

                                    <Separator />

                                    {/* --- C. Foundation Council — Composition --- */}
                                    <div className="grid gap-3">
                                        <div className="text-sm font-semibold">C. Foundation Council — Composition</div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <LabelValue label="Council Mode">{(data as any)?.councilMode || "—"}</LabelValue>
                                            <LabelValue label="Nominee Directors">{(data as any)?.nomineePersons || "—"}</LabelValue>
                                            <LabelValue label="Use nominee director service">
                                                <BoolPill value={!!(data as any)?.useNomineeDirector} />
                                            </LabelValue>
                                        </div>

                                        {(data as any)?.councilMode === "ind3" && Array.isArray((data as any)?.councilIndividuals) && (
                                            <div className="overflow-x-auto rounded-md border overflow-hidden">
                                                <div className="min-w-[700px] p-3">
                                                    {isAdmin && isEditing && (
                                                        <div className="flex justify-end mb-2">
                                                            <Button size="sm" variant="outline" onClick={addCouncilIndividual}>{t("common.add", "Add")}</Button>
                                                        </div>
                                                    )}
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead className="w-[12%]">Type</TableHead>
                                                                <TableHead className="w-[24%]">Name</TableHead>
                                                                <TableHead className="w-[16%]">ID</TableHead>
                                                                <TableHead className="w-[14%]">Status</TableHead>
                                                                <TableHead className="w-[20%]">Email</TableHead>
                                                                <TableHead className="w-[14%]">Phone</TableHead>
                                                                <TableHead className="w-[10%]">Actions</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {(data as any).councilIndividuals.map((m: any, i: number) => (
                                                                <TableRow key={"ind-" + i} className={`align-top ${!isEditing && m?.email ? 'cursor-pointer hover:bg-slate-50' : ''}`} onClick={() => { if (!isEditing && m?.email) showMemberDetails(m?.email, m?.type); }}>
                                                                    <TableCell>
                                                                        {isAdmin && isEditing ? (
                                                                            <Input className="h-8" value={m?.type || "individual"} onChange={(e) => updateCouncilIndividualAt(i, { type: e.target.value })} />
                                                                        ) : (
                                                                            <span>{m?.type || "individual"}</span>
                                                                        )}
                                                                    </TableCell>

                                                                    <TableCell>
                                                                        {isAdmin && isEditing ? (
                                                                            <Input className="h-8" value={m?.name || ""} onChange={(e) => updateCouncilIndividualAt(i, { name: e.target.value })} />
                                                                        ) : (
                                                                            <span className="font-medium">{m?.name || "—"}</span>
                                                                        )}
                                                                    </TableCell>

                                                                    <TableCell>
                                                                        {isAdmin && isEditing ? (
                                                                            <Input className="h-8" value={m?.id || ""} onChange={(e) => updateCouncilIndividualAt(i, { id: e.target.value })} />
                                                                        ) : (
                                                                            <span>{m?.id || "—"}</span>
                                                                        )}
                                                                    </TableCell>

                                                                    <TableCell>
                                                                        {isAdmin && isEditing ? (
                                                                            <Input className="h-8" value={m?.status || ""} onChange={(e) => updateCouncilIndividualAt(i, { status: e.target.value })} />
                                                                        ) : (
                                                                            <span>{m?.status || "—"}</span>
                                                                        )}
                                                                    </TableCell>

                                                                    <TableCell>
                                                                        {isAdmin && isEditing ? (
                                                                            <Input className="h-8 min-w-[220px]" type="email" value={m?.email || ""} onChange={(e) => updateCouncilIndividualAt(i, { email: e.target.value })} />
                                                                        ) : (
                                                                            <span className="text-xs text-muted-foreground">{m?.email || "—"}</span>
                                                                        )}
                                                                    </TableCell>

                                                                    <TableCell>
                                                                        {isAdmin && isEditing ? (
                                                                            <div className="overflow-x-auto">
                                                                                <Input className="h-8 min-w-[160px] w-full" value={m?.tel || ""} onChange={(e) => updateCouncilIndividualAt(i, { tel: e.target.value })} />
                                                                            </div>
                                                                        ) : (
                                                                            <span>{m?.tel || "—"}</span>
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {isAdmin && isEditing ? (
                                                                            <div className="flex justify-end">
                                                                                <Button size="sm" variant="ghost" onClick={() => removeCouncilIndividualAt(i)}><Trash2 className="mr-2 h-4 w-4" /></Button>
                                                                            </div>
                                                                        ) : null}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </div>
                                        )}

                                        {(data as any)?.councilMode === "corp1" && (data as any)?.councilCorporate && (
                                            <div className="overflow-x-auto rounded-md border overflow-hidden">
                                                <div className="min-w-[900px] p-3">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead className="w-[20%]">Corporate Main</TableHead>
                                                                <TableHead className="w-[30%]">Address / Representative</TableHead>
                                                                <TableHead className="w-[16%]">Signatory</TableHead>
                                                                <TableHead className="w-[18%]">Email</TableHead>
                                                                <TableHead className="w-[16%]">Status</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            <TableRow className={`align-top ${!isEditing && (data as any).councilCorporate?.email ? 'cursor-pointer hover:bg-slate-50' : ''}`} onClick={() => { if (!isEditing && (data as any).councilCorporate?.email) showMemberDetails((data as any).councilCorporate?.email, 'corporate'); }}>
                                                                <TableCell>
                                                                    {isAdmin && isEditing ? (
                                                                        <Input className="h-8" value={(data as any).councilCorporate?.corpMain || ""} onChange={(e) => updateCouncilCorporate({ corpMain: e.target.value })} />
                                                                    ) : (
                                                                        <span>{(data as any).councilCorporate?.corpMain || "—"}</span>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {isAdmin && isEditing ? (
                                                                        <Input className="h-8" value={(data as any).councilCorporate?.addrRep || ""} onChange={(e) => updateCouncilCorporate({ addrRep: e.target.value })} />
                                                                    ) : (
                                                                        <span className="text-xs text-muted-foreground">{(data as any).councilCorporate?.addrRep || "—"}</span>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {isAdmin && isEditing ? (
                                                                        <Input className="h-8" value={(data as any).councilCorporate?.signatory || ""} onChange={(e) => updateCouncilCorporate({ signatory: e.target.value })} />
                                                                    ) : (
                                                                        <span>{(data as any).councilCorporate?.signatory || "—"}</span>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {isAdmin && isEditing ? (
                                                                        <Input className="h-8" type="email" value={(data as any).councilCorporate?.email || ""} onChange={(e) => updateCouncilCorporate({ email: e.target.value })} />
                                                                    ) : (
                                                                        <span className="text-xs text-muted-foreground">{(data as any).councilCorporate?.email || "—"}</span>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {isAdmin && isEditing ? (
                                                                        <Input className="h-8" value={(data as any).councilCorporate?.status || ""} onChange={(e) => updateCouncilCorporate({ status: e.target.value })} />
                                                                    ) : (
                                                                        <span>{(data as any).councilCorporate?.status || "—"}</span>
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <Separator />
                                    <div className="grid gap-3">
                                        <div className="text-sm font-semibold">E. Protector (optional)</div>
                                        <div className="flex items-center gap-2">
                                            <BoolPill value={!!(data as any)?.protectorsEnabled} trueText="Appoint protector." falseText="Appointment not needed." />
                                            {/* <span className="text-sm text-muted-foreground">Enabled</span> */}
                                        </div>
                                        {((data as any)?.protectorsEnabled && Array.isArray((data as any)?.protectors)) ? (
                                            <div className="overflow-x-auto rounded-md border overflow-hidden">
                                                <div className="min-w-[700px] p-3">
                                                    {isAdmin && isEditing && (
                                                        <div className="flex justify-end mb-2">
                                                            <Button size="sm" variant="outline" onClick={addProtector}>{t("common.add", "Add")}</Button>
                                                        </div>
                                                    )}
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead className="w-[40%]">Name</TableHead>
                                                                <TableHead className="w-[40%]">Contact</TableHead>
                                                                <TableHead className="w-[20%]">Status</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {(data as any).protectors.map((p: any, i: number) => (
                                                                <TableRow key={"prot-" + i} className={`align-top ${!isEditing && p?.contact && p?.contact.includes('@') ? 'cursor-pointer hover:bg-slate-50' : ''}`} onClick={() => { if (!isEditing && p?.contact && p?.contact.includes('@')) showMemberDetails(p?.contact, 'no'); }}>
                                                                    <TableCell>
                                                                        {isAdmin && isEditing ? (
                                                                            <Input className="h-8" value={p?.name || ""} onChange={(e) => updateProtectorAt(i, { name: e.target.value })} />
                                                                        ) : (
                                                                            <span className="font-medium">{p?.name || "—"}</span>
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {isAdmin && isEditing ? (
                                                                            <Input className="h-8" value={p?.contact || ""} onChange={(e) => updateProtectorAt(i, { contact: e.target.value })} />
                                                                        ) : (
                                                                            <span className="text-xs text-muted-foreground">{p?.contact || "—"}</span>
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <div className="flex items-center justify-between">
                                                                            {isAdmin && isEditing ? (
                                                                                <>
                                                                                    <Input className="h-8" value={p?.status || ""} onChange={(e) => updateProtectorAt(i, { status: e.target.value })} />
                                                                                    <Button size="sm" variant="ghost" onClick={() => removeProtectorAt(i)}><Trash2 className="mr-2 h-4 w-4" /></Button>
                                                                                </>
                                                                            ) : (
                                                                                <span>{p?.status || "—"}</span>
                                                                            )}
                                                                        </div>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                    <Separator />
                                    <div className="grid gap-3">
                                        <div className="text-sm font-semibold">F. Beneficiaries</div>
                                        <LabelValue label="Mode">{(data as any)?.beneficiariesMode || "—"}</LabelValue>
                                        {Array.isArray((data as any)?.beneficiaries) && (data as any).beneficiaries.length ? (
                                            <div className="overflow-x-auto rounded-md border overflow-hidden">
                                                <div className="min-w-[700px] p-3">
                                                    {isAdmin && isEditing && (
                                                        <div className="flex justify-end mb-2">
                                                            <Button size="sm" variant="outline" onClick={addBeneficiary}>{t("common.add", "Add")}</Button>
                                                        </div>
                                                    )}
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead className="w-[40%]">Name</TableHead>
                                                                <TableHead className="w-[40%]">Contact</TableHead>
                                                                <TableHead className="w-[20%]">Status</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {(data as any).beneficiaries.map((b: any, i: number) => (
                                                                <TableRow key={"bene-" + i} className={`align-top ${!isEditing && b?.contact && b?.contact.includes('@') ? 'cursor-pointer hover:bg-slate-50' : ''}`} onClick={() => { if (!isEditing && b?.contact && b?.contact.includes('@')) showMemberDetails(b?.contact, 'no'); }}>
                                                                    <TableCell>
                                                                        {isAdmin && isEditing ? (
                                                                            <Input className="h-8" value={b?.name || ""} onChange={(e) => updateBeneficiaryAt(i, { name: e.target.value })} />
                                                                        ) : (
                                                                            <span className="font-medium">{b?.name || "—"}</span>
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {isAdmin && isEditing ? (
                                                                            <Input className="h-8" value={b?.contact || ""} onChange={(e) => updateBeneficiaryAt(i, { contact: e.target.value })} />
                                                                        ) : (
                                                                            <span className="text-xs text-muted-foreground">{b?.contact || "—"}</span>
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <div className="flex items-center justify-between">
                                                                            {isAdmin && isEditing ? (
                                                                                <>
                                                                                    <Input className="h-8" value={b?.status || ""} onChange={(e) => updateBeneficiaryAt(i, { status: e.target.value })} />
                                                                                    <Button size="sm" variant="ghost" onClick={() => removeBeneficiaryAt(i)}><Trash2 className="mr-2 h-4 w-4" /></Button>
                                                                                </>
                                                                            ) : (
                                                                                <span>{b?.status || "—"}</span>
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
                                            <div className="text-sm text-muted-foreground">No beneficiaries listed.</div>
                                        )}
                                    </div>
                                    <Separator />
                                    <div className="grid gap-3">
                                        <div className="text-sm font-semibold">G. By-Laws</div>
                                        <div className="grid md:grid-cols-3 gap-4">
                                            <LabelValue label="Mode">{(data as any)?.bylawsMode || "—"}</LabelValue>
                                            {(data as any)?.bylawsPowers && (
                                                <LabelValue label="Powers">{(data as any)?.bylawsPowers}</LabelValue>
                                            )}
                                            {(data as any)?.bylawsAdmin && (
                                                <LabelValue label="Administration">{(data as any)?.bylawsAdmin}</LabelValue>
                                            )}
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="grid gap-3">
                                        <div className="text-sm font-semibold">H. Shipping / Delivery</div>
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <LabelValue label="Recipient Company">
                                                    {isEditing ? (
                                                        <Input
                                                            value={data?.shippingRecipientCompany || ""}
                                                            onChange={(e) =>
                                                                patchCompany(
                                                                    "shippingRecipientCompany" as keyof PIFRecord,
                                                                    e.target.value,
                                                                )
                                                            }
                                                            className="h-8"
                                                        />
                                                    ) : (
                                                        (data as any)?.shippingRecipientCompany || "—"
                                                    )}
                                                </LabelValue>
                                                <LabelValue label="Contact Person">
                                                    {isEditing ? (
                                                        <Input
                                                            value={data?.shippingContactPerson || ""}
                                                            onChange={(e) =>
                                                                patchCompany(
                                                                    "shippingContactPerson" as keyof PIFRecord,
                                                                    e.target.value,
                                                                )
                                                            }
                                                            className="h-8"
                                                        />
                                                    ) : (
                                                        (data as any)?.shippingContactPerson || "—"
                                                    )}
                                                </LabelValue>
                                                <LabelValue label="Phone">
                                                    {isEditing ? (
                                                        <Input
                                                            value={data?.shippingPhone || ""}
                                                            onChange={(e) =>
                                                                patchCompany("shippingPhone" as keyof PIFRecord, e.target.value)
                                                            }
                                                            className="h-8"
                                                        />
                                                    ) : (
                                                        (data as any)?.shippingPhone || "—"
                                                    )}
                                                </LabelValue>
                                                <LabelValue label="Postal Code">
                                                    {isEditing ? (
                                                        <Input
                                                            value={data?.shippingPostalCode || ""}
                                                            onChange={(e) =>
                                                                patchCompany(
                                                                    "shippingPostalCode" as keyof PIFRecord,
                                                                    e.target.value,
                                                                )
                                                            }
                                                            className="h-8"
                                                        />
                                                    ) : (
                                                        (data as any)?.shippingPostalCode || "—"
                                                    )}
                                                </LabelValue>
                                            </div>
                                            <div className="grid grid-cols-1 gap-3 mt-3">
                                                <LabelValue label="Delivery Address">
                                                    {isEditing ? (
                                                        <Textarea
                                                            value={data?.shippingAddress || ""}
                                                            onChange={(e) =>
                                                                patchCompany(
                                                                    "shippingAddress" as keyof PIFRecord,
                                                                    e.target.value,
                                                                )
                                                            }
                                                            className="h-24"
                                                        />
                                                    ) : (
                                                        (data as any)?.shippingAddress || "—"
                                                    )}
                                                </LabelValue>
                                            </div>
                                        </>
                                    </div>

                                    <Separator />
                                    <div className="grid gap-3">
                                        <div className="text-sm font-semibold">I. Banking</div>
                                        <div className="rounded-md border p-3 grid gap-3">

                                            <div className="grid md:grid-cols-3 gap-4">
                                                <LabelValue label="Required any bank account?">
                                                    {(() => {
                                                        const need = (data as any)?.bankingNeed;
                                                        return need === "need" ? "Required"
                                                            : need === "none" ? "Not Needed"
                                                                : need === "later" ? "Decide Later"
                                                                    : "—";
                                                    })()}
                                                </LabelValue>
                                                <LabelValue label="Business Activity Type">
                                                    {(() => {
                                                        const v = (data as any)?.bankingBizType as
                                                            | "consulting"
                                                            | "ecommerce"
                                                            | "investment"
                                                            | "crypto"
                                                            | "manufacturing"
                                                            | undefined;
                                                        const map: Record<string, string> = {
                                                            consulting: "General Consulting / Holding",
                                                            ecommerce: "Online Service / E-commerce",
                                                            investment: "Investment / Equity Holding",
                                                            crypto: "Virtual Assets Related",
                                                            manufacturing: "Manufacturing / Trade",
                                                        };
                                                        return v ? (map[v] || v) : "—";
                                                    })()}
                                                </LabelValue>
                                            </div>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="grid gap-3">
                                        <div className="text-sm font-semibold">J. PEP</div>
                                        <LabelValue label="Politically Exposed Person (PEP)?">
                                            <Badge variant={(data as any)?.pepAny === "yes" ? "destructive" : "outline"} className={(data as any)?.pepAny === "yes" ? "" : "text-muted-foreground"}>
                                                {((data as any)?.pepAny || "—").toUpperCase?.() || "—"}
                                            </Badge>
                                        </LabelValue>
                                    </div>
                                    <Separator />
                                    <div className="grid gap-3">
                                        <div className="text-sm font-semibold">K. Accounting Record Storage & Responsible Person</div>
                                        {(data as any)?.recordStorageUseMirr ? (
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="md:col-span-2">
                                                    <LabelValue label="Address Chosen">
                                                        {t(
                                                            "ppif.accounting.summary.useMirrNote",
                                                            "User opted to use Mirr Asia address."
                                                        )}
                                                    </LabelValue>
                                                </div>

                                            </div>
                                        ) : (
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <LabelValue label="Storage Address">
                                                    {isEditing ? (
                                                        <Textarea
                                                            value={(data as any)?.recordStorageAddress || ""}
                                                            onChange={(e) =>
                                                                patchCompany("recordStorageAddress" as keyof PIFRecord, e.target.value)
                                                            }
                                                            className="h-20"
                                                        />
                                                    ) : (
                                                        (data as any)?.recordStorageAddress || "—"
                                                    )}
                                                </LabelValue>
                                                <LabelValue label="Responsible Person">
                                                    {isEditing ? (
                                                        <Input
                                                            value={(data as any)?.recordStorageResponsiblePerson || ""}
                                                            onChange={(e) =>
                                                                patchCompany("recordStorageResponsiblePerson" as keyof PIFRecord, e.target.value)
                                                            }
                                                            className="h-8"
                                                        />
                                                    ) : (
                                                        (data as any)?.recordStorageResponsiblePerson || "—"
                                                    )}
                                                </LabelValue>
                                            </div>
                                        )}
                                    </div>
                                    <Separator />
                                    <div className="grid gap-3">
                                        <div className="text-sm font-semibold">L. Pricing & Options</div>
                                        <div className="grid md:grid-cols-4 gap-4">
                                            <LabelValue label="Currency">{(data as any)?.pricing?.currency || "—"}</LabelValue>
                                            <LabelValue label="Base Total">{typeof (data as any)?.pricing?.total === "number" ? `${(data as any).pricing.total} ${(data as any)?.pricing?.currency || "USD"}` : "—"}</LabelValue>
                                            <LabelValue label="Nominee Director Setup">{(data as any)?.pricing?.ndSetup ?? "—"}</LabelValue>
                                            <LabelValue label="EMI Account Opening (+$400)">
                                                <BoolPill value={!!(data as any)?.pricing?.optEmi} />
                                            </LabelValue>
                                            <LabelValue label="Panama Local Bank Account">
                                                <BoolPill value={!!(data as any)?.pricing?.optBank} />
                                            </LabelValue>
                                            <LabelValue label="Puerto Rico CBI Account">
                                                <BoolPill value={!!(data as any)?.pricing?.optCbi} />
                                            </LabelValue>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <LabelValue label="Created">{fmtDate(data?.createdAt)}</LabelValue>
                                        <LabelValue label="Updated">{fmtDate(data?.updatedAt)}</LabelValue>
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
                                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                                <Badge variant="secondary" className="gap-1">
                                                    <ReceiptText className="h-3.5 w-3.5" />
                                                    {(dataMemo.payMethod || "").toUpperCase() || "—"}
                                                </Badge>
                                                {dataMemo.bankRef && <Badge variant="outline" className="gap-1">Ref: {dataMemo.bankRef}</Badge>}
                                                {data?.paymentStatus === "paid" && dataMemo.stripeLastStatus === "succeeded" && dataMemo.stripeReceiptUrl && (
                                                    <Badge className="bg-emerald-600 hover:bg-emerald-600">Stripe Paid</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="grid gap-4">
                                    <div className="grid gap-2">
                                        <div className="text-xs text-muted-foreground">Receipt / Proof</div>
                                        {data?.paymentStatus === "paid" && dataMemo.stripeLastStatus === "succeeded" && dataMemo.stripeReceiptUrl ? (
                                            <div className="rounded-md border bg-emerald-50 p-4 text-emerald-800">
                                                <div className="text-sm font-medium">Payment successful via Stripe.</div>
                                                <a href={dataMemo.stripeReceiptUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center text-sm underline">
                                                    View Stripe Receipt
                                                </a>
                                            </div>
                                        ) : dataMemo.uploadReceiptUrl ? (
                                            <div className="space-y-3">
                                                <a href={dataMemo.uploadReceiptUrl} target="_blank" rel="noreferrer" className="group relative block overflow-hidden rounded-md border">
                                                    <img src={dataMemo.uploadReceiptUrl} alt="Payment receipt" className="h-44 w-full object-cover transition-transform duration-200 group-hover:scale-[1.01]" />
                                                </a>
                                                {user.role !== "user" && (
                                                    <div className="flex items-center gap-3">
                                                        <Label className="text-sm font-medium">Payment Status:</Label>
                                                        <Select value={data?.paymentStatus || "unpaid"} onValueChange={(val) => patchCompany("paymentStatus", val as any)}>
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
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label className="text-right">Amount</Label>

                                            <div className="col-span-3 text-sm font-medium">
                                                {typeof dataMemo.finalAmount === "number" ? (
                                                    (() => {
                                                        const base = dataMemo.finalAmount;
                                                        const surcharge =
                                                            dataMemo.payMethod === "card" ? base * 0.04 : 0;
                                                        const total = (base + surcharge).toFixed(2);

                                                        return `${total} ${dataMemo.currency || "USD"}`;
                                                    })()
                                                ) : (
                                                    "—"
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="expiresAt" className="text-right">Expires</Label>
                                            <Input
                                                id="expiresAt"
                                                type="date"
                                                value={data?.expiresAt ? String(data?.expiresAt).slice(0, 10) : ""}
                                                onChange={(e) => patchCompany("expiresAt", e.target.value)}
                                                className="col-span-3"
                                            />
                                        </div>
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
                            <Card>
                                <CardContent className="grid gap-4">
                                    {/* Row 1: AML & Sanctions */}
                                    <div className="grid grid-cols-1 gap-3">
                                        <CardHeader>
                                            <div className="flex items-start gap-3">

                                                <div className="flex-1">
                                                    <CardTitle className="text-base">AML &amp; Sanctions</CardTitle>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <div className="grid grid-cols-1 gap-2">
                                            {COMPLIANCE_QUESTIONS.map(({ key, label, hint }) => {
                                                const value = ((data as any)?.[key] as string) || "";
                                                const normalized = value.toLowerCase();
                                                const isYes = normalized === "yes";
                                                return (
                                                    <div key={key} className="rounded-lg border p-3 text-sm">
                                                        <div className="flex items-center justify-between gap-3">
                                                            <span>{t(label)}</span>
                                                            {isEditing ? (
                                                                <Select
                                                                    value={value}
                                                                    onValueChange={(val) =>
                                                                        patchCompany(key as keyof PIFRecord, val)
                                                                    }
                                                                >
                                                                    <SelectTrigger className="h-8 w-32">
                                                                        <SelectValue placeholder={t("common.select", "Select")} />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="yes">
                                                                            {t("ppif.pep.options.yes")}
                                                                        </SelectItem>
                                                                        <SelectItem value="no">
                                                                            {t("ppif.pep.options.no")}
                                                                        </SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            ) : (
                                                                <Badge
                                                                    variant={isYes ? "destructive" : "outline"}
                                                                    className={isYes ? "" : "text-muted-foreground"}
                                                                >
                                                                    {value ? value.toUpperCase() : "—"}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {hint && (
                                                            <div className="text-xs text-muted-foreground mt-1">
                                                                {t(hint)}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </CardContent>
                                <Separator />
                                <CardContent className="grid gap-4">
                                    <div className="grid gap-3">
                                        <div className="text-xs text-muted-foreground">Declarations</div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <LabelValue label={t("ppif.declarations.checks.truthOk")}>
                                                {isEditing ? (
                                                    <div className="flex items-center gap-2">
                                                        <Checkbox
                                                            checked={!!data?.truthOk}
                                                            onCheckedChange={(checked) =>
                                                                patchCompany("truthOk", checked === true)
                                                            }
                                                        />
                                                        <span className="text-sm">{data?.truthOk ? "Yes" : "No"}</span>
                                                    </div>
                                                ) : (
                                                    <BoolPill value={!!data?.truthOk} />
                                                )}
                                            </LabelValue>
                                            <LabelValue label={t("ppif.declarations.checks.privacyOk")}>
                                                {isEditing ? (
                                                    <div className="flex items-center gap-2">
                                                        <Checkbox
                                                            checked={!!data?.privacyOk}
                                                            onCheckedChange={(checked) =>
                                                                patchCompany("privacyOk", checked === true)
                                                            }
                                                        />
                                                        <span className="text-sm">{data?.privacyOk ? "Yes" : "No"}</span>
                                                    </div>
                                                ) : (
                                                    <BoolPill value={!!data?.privacyOk} />
                                                )}
                                            </LabelValue>
                                            <LabelValue label={t("ppif.declarations.checks.taxOk")}>
                                                {isEditing ? (
                                                    <div className="flex items-center gap-2">
                                                        <Checkbox
                                                            checked={!!data?.taxOk}
                                                            onCheckedChange={(checked) =>
                                                                patchCompany("taxOk", checked === true)
                                                            }
                                                        />
                                                        <span className="text-sm">{data?.taxOk ? "Yes" : "No"}</span>
                                                    </div>
                                                ) : (
                                                    <BoolPill value={!!data?.taxOk} />
                                                )}
                                            </LabelValue>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <LabelValue label={t("ppif.declarations.fields.signName.label")}>
                                                {isEditing ? (
                                                    <Input
                                                        className="h-8"
                                                        value={data?.signName || ""}
                                                        onChange={(e) => patchCompany("signName", e.target.value)}
                                                    />
                                                ) : (
                                                    data?.signName || "—"
                                                )}
                                            </LabelValue>
                                            <LabelValue label={t("ppif.declarations.fields.signDate.label")}>
                                                {isEditing ? (
                                                    <Input
                                                        type="date"
                                                        value={
                                                            data?.signDate ? String(data.signDate).slice(0, 10) : ""
                                                        }
                                                        onChange={(e) => patchCompany("signDate", e.target.value)}
                                                    />
                                                ) : (
                                                    fmtDate(data?.signDate)
                                                )}
                                            </LabelValue>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        {isAdmin && <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                            <div className="mx-auto flex max-width items-center justify-between gap-3 p-3">
                                <div className="text-xs text-muted-foreground">
                                    Status: <strong>{data?.status || "Pending"}</strong>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button onClick={onSave}>
                                        <Save className="mr-1 h-4 w-4" /> {isSaving ? "Saving..." : "Save"}
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
                <h1>To Be Updated Soon.</h1>
            </TabsContent>
            {isDialogOpen && <PPifDetail isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} userData={selectedData} />}
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
        </Tabs>
    );
}
