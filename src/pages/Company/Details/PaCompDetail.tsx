/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import { useAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import { fetchUsers, getPaIncorpoDataById, markDeleteCompanyRecord, updateEditValues } from "@/services/dataFetch";
import { paymentApi } from "@/lib/api/payment";

import { paFormWithResetAtom1, PaFormData } from "../Panama/PaState";
import MemoApp from "./MemosHK";
import TodoApp from "@/pages/Todo/TodoApp";
import AdminProject from "@/pages/dashboard/Admin/Projects/AdminProject";
import ChecklistHistory from "@/pages/Checklist/ChecklistHistory";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

import {
    Banknote,
    Building2,
    ShieldCheck,
    ReceiptText,
    Mail,
    Phone,
    Pencil,
    X,
    Save,
    Trash2,
} from "lucide-react";

import { User } from "@/components/userList/UsersList";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

type SessionData = {
    _id: string;
    amount: number;
    currency: string;
    expiresAt: string;
    status: string;
    paymentId: string;
};

const STATUS_OPTIONS = [
    "Pending",
    "KYC Verification",
    "Waiting for Payment",
    "Waiting for Documents",
    "Waiting for Incorporation",
    "Incorporation Completed",
    "Good Standing",
    "Renewal Processing",
    "Renewal Completed",
];

function fmtDate(d?: string | Date) {
    if (!d) return "—";
    const dt = typeof d === "string" ? new Date(d) : d;
    if (Number.isNaN(dt.getTime())) return "—";
    return dt.toLocaleString();
}

const FallbackAvatar: React.FC<{ name?: string | null }> = ({ name }) => {
    const initials = (name || "")
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">
            {initials || "NA"}
        </div>
    );
};

const LabelValue: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="grid gap-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm">{children}</div>
    </div>
);

const BoolPill: React.FC<{ value?: boolean }> = ({ value }) => (
    <Badge variant={value ? "default" : "outline"}>{value ? "YES" : "NO"}</Badge>
);

const StepRail: React.FC<{ stepIdx?: number }> = ({ stepIdx = 0 }) => (
    <div className="flex items-center gap-2">
        <div className="text-xs text-muted-foreground">Step</div>
        <Badge variant="secondary">{stepIdx}</Badge>
    </div>
);

const PaCompdetail: React.FC<{ id: string }> = ({ id }) => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [formData, setFormData] = useAtom(paFormWithResetAtom1);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [adminAssigned, setAdminAssigned] = useState("");
    const [session, setSession] = useState<SessionData>({
        _id: "",
        amount: 0,
        currency: "",
        expiresAt: "",
        status: "",
        paymentId: "",
    });

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<{ companyId: string, countryCode: string } | null>(null);

    const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null;
    const isAdmin = user?.role !== "user";

    // derived view model for convenience
    const f = useMemo(() => {
        const d = formData || ({} as PaFormData);
        const dAny = d as any;

        return {
            // ► Company names – prefer companyName_1/2/3 from sample, fallback to array
            name1: dAny.companyName_1 || d?.companyName?.[0] || "",
            name2: dAny.companyName_2 || d?.companyName?.[1] || "",
            name3: dAny.companyName_3 || d?.companyName?.[2] || "",

            // contact
            applicantName: d?.name || "",
            email: d?.email || "",
            phone: d?.phoneNum || "",

            // business
            industry: (d?.selectedIndustry || []).join(", "),
            // prefer new field establishmentPurpose, fallback to old purposePaCompany
            purpose: dAny.establishmentPurpose || dAny.purposePaCompany || [],
            // prefer new productDescription or softNote, fallback to bizDesc/specificProvisions
            bizdesc: dAny.productDescription || dAny.bizDesc || "",
            softNote: dAny.softNote || dAny.specificProvisions || "",
            dcpName: dAny.dcpName || "",
            dcpEmail: dAny.dcpEmail || "",
            dcpPhone: dAny.dcpNumber || "",
            // dcpStatus: dAny.dcpStatus || "",
            // finance – use new fields from sample
            currency: dAny.currency || d?.registerCurrencyAtom?.code || "USD",
            capAmount: dAny.capAmount || dAny.totalAmountCap || "",
            shareCount: dAny.shareCount || dAny.noOfSharesIssued || "",

            // receipts / payment
            stripeLastStatus: session.status === "completed" ? "succeeded" : "",
            stripeReceiptUrl: d?.receiptUrl || "",
            uploadReceiptUrl: d?.receiptUrl || "",
            // prefer new payMethod, fallback to old shareCapitalPayment.id
            payMethod: dAny.payMethod || dAny.shareCapitalPayment?.id || "",
            bankRef: "",
            finalAmount: session?.amount || "",

            // compliance – prefer new yes/no flat fields, fallback to old nested objects
            compliancePreconditionAcknowledgment:
                (dAny.annualRenewalConsent || "").toLowerCase() === "yes" ||
                dAny.annualRenewalTermsAgreement?.id === "yes",
            serviceAgreementConsent: dAny.serviceAgreementConsent ? "Accepted" : "",
            legalAndEthicalConcern: dAny.legalAndEthicalConcern ?? dAny.hasLegalEthicalIssues?.id,
            q_country: dAny.q_country ?? dAny.restrictedCountriesWithActivity?.id,
            sanctionsExposureDeclaration:
                dAny.sanctionsExposureDeclaration ?? dAny.sanctionedTiesPresent?.id,
            crimeaSevastapolPresence:
                dAny.crimeaSevastapolPresence ?? dAny.businessInCrimea?.id,
            russianEnergyPresence:
                dAny.russianEnergyPresence ?? dAny.involvedInRussianEnergyDefense?.id,

            // social – use new sns/snsId from sample
            sns: dAny.sns || dAny.snsAccountId?.id || "",
            snsId: dAny.snsId || dAny.snsAccountId?.value || "",

            // meta
            stepIdx: 0,
        };
    }, [formData, session]);

    const currentStep = "Panama Incorporation";

    useEffect(() => {
        async function load() {
            const data = await getPaIncorpoDataById(`${id}`);
            setAdminAssigned(data.assignedTo || "");
            // console.log("data", data)
            if (data.sessionId) {
                const s = await paymentApi.getSession(data.sessionId);
                const transformed: SessionData = {
                    _id: s._id,
                    amount: s.amount,
                    currency: s.currency,
                    expiresAt: s.expiresAt,
                    status: s.status,
                    paymentId: s.paymentId,
                };
                setSession(transformed);
            }

            const response = await fetchUsers();
            const filtered = response.filter((e: { role: string }) => e.role === "admin" || e.role === "master");
            setUsers(filtered);

            setFormData(data);
        }
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // ► keep companyName array AND companyName_1/2/3 in sync
    const patchForm = (key: "name1" | "name2" | "name3", val: string) => {
        if (!formData) return;
        const names = [...(formData.companyName || ["", "", ""])];
        if (key === "name1") names[0] = val;
        if (key === "name2") names[1] = val;
        if (key === "name3") names[2] = val;

        const updated: any = {
            ...formData,
            // companyName: names,
            companyName_1: names[0] || "",
            companyName_2: names[1] || "",
            companyName_3: names[2] || "",
        };
        setFormData(updated);
    };

    const patchCompany = (
        key: "status" | "incorporationDate" | "expiresAt" | "paymentStatus",
        val: string
    ) => {
        if (!formData) return;
        if (key === "expiresAt") {
            setSession({ ...session, expiresAt: val });
            return;
        }
        if (key === "paymentStatus") {
            setSession({ ...session, status: val });
            return;
        }
        setFormData({ ...(formData as any), [key]: val } as any);
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

    const onSave = async () => {
        if (!formData) return;
        console.log("formDta", formData.paymentStatus)
        try {
            setIsSaving(true);
            const payload = JSON.stringify({
                company: {
                    id: (formData as any)._id,
                    status: formData.status,
                    isDisabled: formData.isDisabled,
                    incorporationDate: formData.incorporationDate,
                    country: "PA",
                    companyName_1: formData.companyName_1,
                    companyName_2: formData.companyName_2,
                    companyName_3: formData.companyName_3,
                    paymentStatus: formData.paymentStatus
                },
                session: {
                    id: session._id,
                    expiresAt: session.expiresAt,
                    status: session.status,
                },
                assignedTo: adminAssigned,
            });

            const res = await updateEditValues(payload);
            if (res.success) toast({ description: "Record updated successfully" });
        } finally {
            setIsSaving(false);
        }
    };

    // ► total shares should use new shareCount first, fallback to old field
    const totalShares = Number(((formData as any)?.shareCount || (formData as any)?.noOfSharesIssued || 0));
    const assignedShares =
        Array.isArray((formData as any)?.shareHolders) ?
            (formData as any).shareHolders.reduce(
                (sum: number, p: any) => sum + (Number(p.shares || 0) || 0),
                0
            ) :
            0;

    const primaryName =
        (formData as any)?.companyName_1 ||
        formData?.companyName?.[0] ||
        "";

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
                <TabsTrigger
                    value="details"
                    className="flex-1 py-3 text-md font-medium transition-all rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                    Company Details
                </TabsTrigger>
                <TabsTrigger
                    value="service-agreement"
                    className="flex-1 py-3 text-md font-medium transition-all rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                    Record of Documents
                </TabsTrigger>
                {user?.role !== "user" && (
                    <TabsTrigger
                        value="Memos"
                        className="flex-1 py-3 text-md font-medium transition-all rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                    >
                        Memo
                    </TabsTrigger>
                )}
                {user?.role !== "user" && (
                    <TabsTrigger
                        value="Projects"
                        className="flex-1 py-3 text-md font-medium transition-all rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                    >
                        Project
                    </TabsTrigger>
                )}
                <TabsTrigger
                    value="Checklist"
                    className="flex-1 py-3 text-md font-medium transition-all rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                    Checklist
                </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="p-6">
                <section>
                    {primaryName && <TodoApp id={id} name={primaryName} />}

                    <div className="flex gap-x-8 mt-4">
                        {user?.role !== "user" && <AssignAdmin />}
                        <Button
                            onClick={() => navigate(`/company-documents/PA/${id}`)}
                            size="sm"
                            className="flex items-center gap-2"
                        >
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
                                                            {f.name1 || "Untitled Panama Company"}
                                                        </CardTitle>
                                                    )}

                                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                                        <Badge variant="secondary" className="text-muted-foreground">
                                                            {currentStep}
                                                        </Badge>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-muted-foreground">
                                                                Incorporation Status
                                                            </span>
                                                            {user?.role !== "user" ? (
                                                                <Select
                                                                    value={formData?.status || ""}
                                                                    onValueChange={(val) => patchCompany("status", val)}
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
                                                                <Badge variant="default">
                                                                    {formData?.status || "Pending"}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Edit toggle */}
                                                <div className="flex shrink-0 items-center gap-2">
                                                    {isAdmin ? <button
                                                        className="text-red-500 hover:red-blue-700 transition"
                                                        onClick={(e) => handleDeleteClick(id, "PA", e)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button> : ""}
                                                    {!isEditing ? (
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
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="grid gap-5">
                                    <StepRail stepIdx={f.stepIdx} />

                                    {/* Basic info (editable names) */}
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <LabelValue label="Applicant">
                                            <div className="flex items-center gap-2">
                                                <FallbackAvatar name={f.applicantName} />
                                                <span className="font-medium">
                                                    {f.applicantName || "—"}
                                                </span>
                                            </div>
                                        </LabelValue>
                                        <LabelValue label="Dcp Name">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{f.dcpName || "—"}</span>
                                            </div>
                                        </LabelValue>
                                        <LabelValue label="Dcp Email">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{f.dcpEmail || "—"}</span>
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

                                        <LabelValue label="Alt Names">
                                            {isEditing ? (
                                                <div className="grid grid-cols-2 gap-2">
                                                    <Input
                                                        value={f.name2 || ""}
                                                        onChange={(e) => patchForm("name2", e.target.value)}
                                                        placeholder="Name 2"
                                                        className="h-8"
                                                    />
                                                    <Input
                                                        value={f.name3 || ""}
                                                        onChange={(e) => patchForm("name3", e.target.value)}
                                                        placeholder="Name 3"
                                                        className="h-8"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {[f.name2, f.name3].filter(Boolean).length ? (
                                                        [f.name2, f.name3]
                                                            .filter(Boolean)
                                                            .map((n, i) => (
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

                                        <LabelValue label="Industry">
                                            {f.industry || "—"}
                                        </LabelValue>

                                        <LabelValue label="Purpose">
                                            <div className="flex flex-wrap gap-2">
                                                {(f.purpose?.length ? f.purpose : ["—"]).map((p: string, i: number) => (
                                                    <Badge key={String(p) + i} variant="secondary">
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

                                        <LabelValue label="Incorporation Date">
                                            {formData?.incorporationDate ? (
                                                <div className="flex items-center gap-3">
                                                    <span>
                                                        {fmtDate(formData.incorporationDate)}
                                                    </span>
                                                    {user?.role !== "user" && (
                                                        <Input
                                                            type="date"
                                                            value={formData.incorporationDate.slice(0, 10)}
                                                            onChange={(e) =>
                                                                patchCompany("incorporationDate", e.target.value)
                                                            }
                                                            className="h-8 w-44"
                                                        />
                                                    )}
                                                </div>
                                            ) : user?.role !== "user" ? (
                                                <Input
                                                    type="date"
                                                    value={formData?.incorporationDate?.slice(0, 10) || ""}
                                                    onChange={(e) =>
                                                        patchCompany("incorporationDate", e.target.value)
                                                    }
                                                    className="h-8 w-44"
                                                />
                                            ) : (
                                                "—"
                                            )}
                                        </LabelValue>
                                    </div>

                                    <Separator />

                                    {/* Finance & accounting */}
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <LabelValue label="Currency">
                                            <Badge variant="outline">
                                                {f.currency || "—"}
                                            </Badge>
                                        </LabelValue>
                                        <LabelValue label="Declared Capital">
                                            {f.capAmount || "—"}
                                        </LabelValue>
                                        <LabelValue label="Total Shares">
                                            {f.shareCount || "—"}
                                        </LabelValue>
                                    </div>

                                    <Separator />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <LabelValue label="Created">
                                            {fmtDate((formData as any)?.createdAt)}
                                        </LabelValue>
                                        <LabelValue label="Updated">
                                            {fmtDate((formData as any)?.updatedAt)}
                                        </LabelValue>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* ► Shareholders now reflect new sample structure */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Shareholding & Parties</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {Array.isArray((formData as any)?.shareHolders) &&
                                        (formData as any).shareHolders.length > 0 ? (
                                        <div className="rounded-md border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[30%]">Party</TableHead>
                                                        <TableHead className="w-[22%]">
                                                            Role / Share Type
                                                        </TableHead>
                                                        <TableHead className="w-[20%]">
                                                            Shares / Ownership
                                                        </TableHead>
                                                        <TableHead className="w-[15%]">
                                                            Legal Person
                                                        </TableHead>
                                                        <TableHead className="w-[13%]">Status</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {(formData as any).shareHolders.map(
                                                        (p: any, i: number) => {
                                                            const ownedShares =
                                                                typeof p.shares === "number"
                                                                    ? p.shares
                                                                    : undefined;
                                                            const pct =
                                                                totalShares && ownedShares != null
                                                                    ? Number(
                                                                        (
                                                                            (ownedShares /
                                                                                totalShares) *
                                                                            100
                                                                        ).toFixed(2)
                                                                    )
                                                                    : undefined;

                                                            const legalPersonLabel =
                                                                p.isLegalPerson?.value ||
                                                                p.isLegalPerson?.id ||
                                                                (p.isLegalPerson === "yes"
                                                                    ? "Yes"
                                                                    : p.isLegalPerson === "no"
                                                                        ? "No"
                                                                        : "—");

                                                            return (
                                                                <TableRow
                                                                    key={(p?.name || "shareholder") + i}
                                                                >
                                                                    <TableCell>
                                                                        <div className="flex items-center gap-2">
                                                                            <FallbackAvatar name={p.name} />
                                                                            <div className="grid">
                                                                                <span className="font-medium">
                                                                                    {p.name || "—"}
                                                                                </span>
                                                                                <span className="text-xs text-muted-foreground">
                                                                                    {p.email || "—"}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell className="text-sm">
                                                                        <div className="flex flex-col">
                                                                            {p.typeOfShare && (
                                                                                <span className="text-medium">
                                                                                    {p.typeOfShare}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell className="text-sm">
                                                                        {ownedShares != null ? (
                                                                            <div className="flex flex-col">
                                                                                <span>
                                                                                    {ownedShares}{" "}
                                                                                    shares
                                                                                </span>
                                                                                {pct != null && (
                                                                                    <span className="text-xs text-muted-foreground">
                                                                                        ({pct}%)
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        ) : typeof p.ownershipRate ===
                                                                            "number" ? (
                                                                            <span>
                                                                                {p.ownershipRate}%
                                                                            </span>
                                                                        ) : (
                                                                            "—"
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell className="text-sm">
                                                                        {legalPersonLabel}
                                                                    </TableCell>
                                                                    <TableCell className="text-sm">
                                                                        {p.status || (p.invited ? "Invited" : "—")}
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        }
                                                    )}

                                                    <TableRow>
                                                        <TableCell className="font-medium">
                                                            Total / Assigned Shares
                                                        </TableCell>
                                                        <TableCell />
                                                        <TableCell>
                                                            <div className="flex flex-col text-sm">
                                                                <span>
                                                                    Company total:{" "}
                                                                    {totalShares || "—"}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    Assigned: {assignedShares}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell />
                                                        <TableCell />
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ) : (
                                        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                                            No parties added.
                                        </div>
                                    )}

                                    {/* AML/CDD toggle */}
                                    <div className="flex items-center mt-2 gap-3">
                                        <Label className="text-right">AML/CDD Edit</Label>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">
                                                {formData?.isDisabled ? "No" : "Yes"}
                                            </Badge>
                                            <Switch
                                                checked={!formData?.isDisabled}
                                                onCheckedChange={(checked) =>
                                                    setFormData({
                                                        ...(formData as any),
                                                        isDisabled: !checked,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            {formData?.legalDirectors && formData.legalDirectors.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-sm font-medium mb-2">Legal Directors</h3>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[35%]">Director</TableHead>
                                                    <TableHead className="w-[20%]">Role</TableHead>
                                                    <TableHead className="w-[20%]">Shares</TableHead>
                                                    <TableHead className="w-[15%]">Legal Person</TableHead>
                                                    <TableHead className="w-[10%]">Status</TableHead>
                                                </TableRow>
                                            </TableHeader>

                                            <TableBody>
                                                {formData.legalDirectors.map((d: any, idx: number) => (
                                                    <TableRow key={idx}>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <FallbackAvatar name={d.name || "Director"} />
                                                                <div className="grid">
                                                                    <span className="font-medium">{d.name || "—"}</span>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {d.email || "—"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </TableCell>

                                                        <TableCell>{d.role?.id || "—"}</TableCell>
                                                        <TableCell>{d.shares || "—"}</TableCell>
                                                        <TableCell>{d.isLegalPerson?.value || "—"}</TableCell>
                                                        <TableCell>{d.status || "—"}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT */}
                        <div className="grid gap-6">
                            {/* PAYMENT */}
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
                                                    {(formData.payMethod || "").toUpperCase() || "—"}
                                                </Badge>

                                                {formData.bankRef && (
                                                    <Badge variant="outline" className="gap-1">
                                                        Ref: {formData.bankRef}
                                                    </Badge>
                                                )}

                                                {formData.paymentStatus === "paid" &&
                                                    formData.stripeLastStatus === "succeeded" &&
                                                    formData.stripeReceiptUrl && (
                                                        <Badge className="bg-emerald-600 hover:bg-emerald-600">
                                                            Stripe Paid
                                                        </Badge>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="grid gap-4">

                                    {/* RECEIPT / PROOF */}
                                    <div className="grid gap-2">
                                        <div className="text-xs text-muted-foreground">Receipt / Proof</div>

                                        {formData.paymentStatus === "paid" &&
                                            formData.stripeLastStatus === "succeeded" &&
                                            formData.stripeReceiptUrl ? (
                                            <div className="rounded-md border bg-emerald-50 p-4 text-emerald-800">
                                                <div className="text-sm font-medium">Payment successful via Stripe.</div>
                                                <a
                                                    href={formData.stripeReceiptUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="mt-2 inline-flex items-center text-sm underline"
                                                >
                                                    View Stripe Receipt
                                                </a>
                                            </div>
                                        ) : formData.uploadReceiptUrl ? (
                                            <div className="space-y-3">
                                                <a
                                                    href={formData.uploadReceiptUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="group relative block overflow-hidden rounded-md border"
                                                >
                                                    <img
                                                        src={formData.uploadReceiptUrl}
                                                        alt="Payment receipt"
                                                        className="h-44 w-full object-cover transition-transform duration-200 group-hover:scale-[1.01]"
                                                    />
                                                </a>

                                                {isAdmin && (
                                                    <div className="flex items-center gap-3">
                                                        <Label className="text-sm font-medium">Payment Status:</Label>

                                                        <Select
                                                            value={formData.paymentStatus || "unpaid"}
                                                            onValueChange={(val) =>
                                                                setFormData({ ...formData, paymentStatus: val })
                                                            }
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
                                            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                                                No file uploaded
                                            </div>
                                        )}
                                    </div>

                                    {/* AMOUNT + EXPIRY */}
                                    <div className="grid gap-4 py-2">

                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label className="text-right">Amount</Label>
                                            <div className="col-span-3 text-sm font-medium">
                                                {formData.panamaQuote
                                                    ? `${formData.panamaQuote?.total} USD`
                                                    : session.amount
                                                        ? `${session.amount} ${session.currency || "USD"}`
                                                        : "—"}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="expiresAt" className="text-right">Expires</Label>

                                            {isAdmin ? (
                                                <Input
                                                    id="expiresAt"
                                                    type="date"
                                                    value={
                                                        formData.expiresAt
                                                            ? String(formData.expiresAt).slice(0, 10)
                                                            : ""
                                                    }
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, expiresAt: e.target.value })
                                                    }
                                                    className="col-span-3"
                                                />
                                            ) : (
                                                <div className="col-span-3 text-sm">
                                                    {formData.expiresAt ? fmtDate(formData.expiresAt) : "—"}
                                                </div>
                                            )}
                                        </div>

                                        {/* View Receipt PDF */}
                                        {formData.receiptUrl && (
                                            <div className="grid grid-cols-4 items-start gap-4">
                                                <Label className="text-right">Receipt</Label>
                                                <div className="col-span-3">
                                                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                                                        <SheetTrigger asChild>
                                                            <Button variant="outline" size="sm">View Receipt</Button>
                                                        </SheetTrigger>
                                                        <SheetContent
                                                            side="right"
                                                            className="w-full max-w-[40vw]"
                                                            style={{ width: "40vw", maxWidth: "40vw" }}
                                                        >
                                                            <SheetHeader>
                                                                <SheetTitle>Receipt</SheetTitle>
                                                            </SheetHeader>

                                                            <div className="mt-4 space-y-4">
                                                                <iframe
                                                                    src={formData.receiptUrl}
                                                                    className="w-full h-[calc(100vh-200px)]"
                                                                    title="Receipt"
                                                                />
                                                            </div>
                                                        </SheetContent>
                                                    </Sheet>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* COMPLIANCE */}
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
                                        <LabelValue label="Annual renewal terms agreement">
                                            <BoolPill
                                                value={
                                                    !!f.compliancePreconditionAcknowledgment
                                                }
                                            />
                                        </LabelValue>
                                        <LabelValue label="Service agreement consent">
                                            {f.serviceAgreementConsent || "—"}
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
                                                    "legalAndEthicalConcern",
                                                ],
                                                [
                                                    "Sanctioned Countries Activity (iran, sudan, NK, syria, cuba,belarus, zimbabwe",
                                                    "q_country",
                                                ],
                                                [
                                                    "Sanctions Exposure (involved in above countries or under sanctions by  UN, EU, UKHMT, HKMA, OFAC,)",
                                                    "sanctionsExposureDeclaration",
                                                ],
                                                [
                                                    "Crimea/Sevastopol Presence",
                                                    "crimeaSevastapolPresence",
                                                ],
                                                [
                                                    "Russian Energy Presence",
                                                    "russianEnergyPresence",
                                                ],
                                            ].map(([label, key]) => {
                                                const val = (f as any)[key];
                                                const isYes =
                                                    String(val || "").toLowerCase() === "yes";
                                                return (
                                                    <div
                                                        key={key}
                                                        className="flex items-center justify-between gap-3"
                                                    >
                                                        <span>{label}</span>
                                                        <Badge
                                                            variant={
                                                                isYes
                                                                    ? "destructive"
                                                                    : "outline"
                                                            }
                                                            className={
                                                                isYes
                                                                    ? ""
                                                                    : "text-muted-foreground"
                                                            }
                                                        >
                                                            {(val || "—")
                                                                .toString()
                                                                .toUpperCase()}
                                                        </Badge>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="grid grid-cols-2 gap-4">
                                        <LabelValue label="Social App">
                                            {f.sns || "—"}
                                        </LabelValue>
                                        <LabelValue label="Handle / ID">
                                            {f.snsId || "—"}
                                        </LabelValue>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sticky save bar */}
                        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                            <div className="mx-auto flex max-width items-center justify-between gap-3 p-3">
                                <div className="text-xs text-muted-foreground">
                                    Status:{" "}
                                    <strong>{formData?.status || "Pending"}</strong>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button onClick={onSave} disabled={isSaving}>
                                        <Save className="mr-1 h-4 w-4" />{" "}
                                        {isSaving ? "Saving..." : "Save"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </TabsContent>

            <TabsContent value="service-agreement" className="p-6">
                <div className="space-y-6">
                    <h1 className="text-2xl font-bold">Service Agreement Details</h1>
                </div>
            </TabsContent>

            {user?.role !== "user" && (
                <TabsContent value="Memos" className="p-6">
                    <div className="space-y-6">
                        <MemoApp id={id} />
                    </div>
                </TabsContent>
            )}

            {user?.role !== "user" && (
                <TabsContent value="Projects" className="p-6">
                    <div className="space-y-6">
                        <AdminProject id={id} />
                    </div>
                </TabsContent>
            )}

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
        </Tabs>
    );
};

export default PaCompdetail;
