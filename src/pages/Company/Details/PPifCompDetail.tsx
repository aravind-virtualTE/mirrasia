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
import { Label } from "@/components/ui/label";
import { Banknote, Building2, ShieldCheck, ReceiptText, Mail, Phone, CheckCircle2, Circle, Save } from "lucide-react";
import { createOrUpdatePaFIncorpo, getPaFIncorpoData } from "../PanamaFoundation/PaState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MemoApp from "./MemosHK";
import AdminProject from "@/pages/dashboard/Admin/Projects/AdminProject";
import TodoApp from "@/pages/Todo/TodoApp";
import { useNavigate } from "react-router-dom";
import { fetchUsers } from "@/services/dataFetch";
import { useAtom } from "jotai";
import { usersData } from "@/services/state";
import { toast } from "@/hooks/use-toast";
import { t } from "i18next";

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
};

// ----------------- Constants & helpers -----------------
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

const STATUS_OPTIONS = ["Pending", "KYC Review", "Docs Requested", "Incorporated", "On Hold", "Cancelled"];

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

    const dataMemo = React.useMemo(() => ({
        applicantName: data?.contactName || "",
        email: data?.email || "",
        phone: data?.phone || "",
        name1: data?.foundationNameEn || "",
        name2: data?.foundationNameEs || "",
        name3: data?.altName1 || "",
        cname1: data?.altName2 || "",
        industry: data?.industries?.join(", ") || "",
        purpose: data?.purposeSummary ? [data?.purposeSummary] : [],
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
    }), [data]);

    React.useEffect(() => {
        const fetchData = async () => {
            const result = await getPaFIncorpoData(id);
            console.log("result-->", result);
            if (result) setData(result);
            const usersResponse = await fetchUsers();
            const adminUsers = usersResponse.filter((e: { role: string }) => e.role === "admin" || e.role === "master");
            setUsers(adminUsers);
        };
        fetchData();
    }, []);

    const patchCompany = (key: keyof PIFRecord, value: any) => setData(prev => ({ ...prev, [key]: value }));

    const onSave = async () => {
        setIsSaving(true);
        const result = await createOrUpdatePaFIncorpo(data);
        if (result) {
            setIsSaving(false);
            toast({ title: "Success", description: "Company details saved." });
            return true;
        } else {
            toast({ title: "Error", description: "Failed to save company details.", variant: "destructive" });
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
                                                            <span className="text-xs text-muted-foreground">Incorporation Status</span>
                                                            {user.role !== "user" ? (
                                                                <Select
                                                                    value={data?.status || ""}
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
                                                                <Badge variant="default">{data?.status || "Pending"}</Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex shrink-0 items-center gap-2">
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
                                        <LabelValue label="Industry">{dataMemo.industry || "—"}</LabelValue>
                                        <LabelValue label="Purpose">
                                            <div className="flex flex-wrap gap-2">
                                                {(dataMemo.purpose?.length ? dataMemo.purpose : ["—"]).map((p, i) => (
                                                    <Badge key={p + i} variant="secondary">{p}</Badge>
                                                ))}
                                            </div>
                                        </LabelValue>
                                        <LabelValue label="Business Description">{dataMemo.bizdesc || "—"}</LabelValue>
                                    </div>
                                    <Separator />
                                    <div className="grid gap-5">
                                        <div className="text-sm font-semibold">A. Establishment</div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <LabelValue label="Initial Endowment">
                                                {(data as any)?.initialEndowment || "—"}
                                            </LabelValue>
                                            <LabelValue label="Source of Funds">
                                                {(data as any)?.sourceOfFunds || (data as any)?.sourceOfFundsOther || "—"}
                                            </LabelValue>
                                            <LabelValue label="Registered Address Mode">
                                                {(() => {
                                                    const need = (data as any)?.registeredAddressMode;
                                                    return need == "mirr" ? "opted for MIRRASIA address"
                                                        : need === "own" ? "Manage own address"
                                                            : "—";
                                                })()}
                                            </LabelValue>
                                            {(data as any)?.registeredAddressMode === "own" && (
                                                <LabelValue label="Registered Address">
                                                    {(data as any)?.ownRegisteredAddress || "—"}
                                                </LabelValue>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <LabelValue label="Purpose of Establishment">
                                                {(data as any)?.purposeSummary || "—"}
                                            </LabelValue>
                                            <LabelValue label="Main Industries">
                                                <div className="flex flex-wrap gap-2">
                                                    {Array.isArray((data as any)?.industries) && (data as any).industries.length
                                                        ? (data as any).industries.map((ind: string, i: number) => (
                                                            <Badge key={ind + i} variant="secondary">{ind}</Badge>
                                                        ))
                                                        : "—"}
                                                </div>
                                            </LabelValue>
                                            <LabelValue label="Countries of Activity (planned)">
                                                {(data as any)?.geoCountries || "—"}
                                            </LabelValue>
                                            {(data as any)?.foundationNameEs && (
                                                <LabelValue label="Spanish Name">
                                                    {(data as any)?.foundationNameEs}
                                                </LabelValue>
                                            )}
                                        </div>
                                    </div>
                                    <Separator />
                                    {/* --- B. Founders --- */}
                                    <div className="grid gap-3">
                                        <div className="text-sm font-semibold">B. Founders</div>
                                        {Array.isArray((data as any)?.founders) && (data as any).founders.length ? (
                                            <div className="overflow-x-auto rounded-md border overflow-hidden">
                                                <div className="">
                                                    <div className="grid gap-3 min-w-[600px] p-2">
                                                        {(data as any).founders.map((fnd: any, i: number) => (
                                                            <div
                                                                key={(fnd?.name || "founder") + i}
                                                                className="grid md:grid-cols-5  p-2"
                                                            >
                                                                <LabelValue label="Type">{fnd?.type || "—"}</LabelValue>
                                                                <LabelValue label="Name">{fnd?.name || "—"}</LabelValue>
                                                                <LabelValue label="ID / Reg No.">{fnd?.id || "—"}</LabelValue>
                                                                <LabelValue label="Status">{fnd?.status || "—"}</LabelValue>
                                                                <div className="grid md:grid-cols-[2fr_1fr] gap-2">
                                                                    <LabelValue label="Email">{fnd?.email || "—"}</LabelValue>
                                                                    <LabelValue label="Phone">{fnd?.tel || "—"}</LabelValue>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
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

                                        {(data as any)?.councilMode === "ind3" &&
                                            Array.isArray((data as any)?.councilIndividuals) && (
                                                <div className="rounded-md border overflow-hidden">
                                                    <div className="overflow-x-auto">
                                                        <div className="grid gap-2 min-w-[600px] p-3">
                                                            {(data as any).councilIndividuals.map((m: any, i: number) => (
                                                                <div key={"ind-" + i} className="grid md:grid-cols-5 p-1">
                                                                    <LabelValue label="Type">{m?.type || "individual"}</LabelValue>
                                                                    <LabelValue label="Name">{m?.name || "—"}</LabelValue>
                                                                    <LabelValue label="ID">{m?.id || "—"}</LabelValue>
                                                                    <LabelValue label="Status">{m?.status || "—"}</LabelValue>
                                                                    <div className="grid md:grid-cols-[2fr_1fr] gap-2">
                                                                        <LabelValue label="Email">{m?.email || "—"}</LabelValue>
                                                                        <LabelValue label="Phone">{m?.tel || "—"}</LabelValue>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                        {(data as any)?.councilMode === "corp1" && (data as any)?.councilCorporate && (
                                            <div className="overflow-x-auto rounded-md border overflow-hidden">
                                                <div className="">
                                                    <div className="grid md:grid-cols-5 min-w-[600px] p-3">
                                                        <LabelValue label="Corporate Main">{(data as any).councilCorporate?.corpMain || "—"}</LabelValue>
                                                        <LabelValue label="Address / Representative">{(data as any).councilCorporate?.addrRep || "—"}</LabelValue>
                                                        <LabelValue label="Signatory">{(data as any).councilCorporate?.signatory || "—"}</LabelValue>
                                                        <LabelValue label="Email">{(data as any).councilCorporate?.email || "—"}</LabelValue>
                                                        <LabelValue label="Status">{(data as any).councilCorporate?.status || "—"}</LabelValue>
                                                    </div>
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
                                            <div className="grid gap-2">
                                                {(data as any).protectors.map((p: any, i: number) => (
                                                    <div key={"prot-" + i} className="rounded-md border p-3 grid md:grid-cols-3">
                                                        <LabelValue label="Name">{p?.name || "—"}</LabelValue>
                                                        <LabelValue label="Contact">{p?.contact || "—"}</LabelValue>
                                                        <LabelValue label="Status">{p?.status || "—"}</LabelValue>                         
                                                    </div>
                                                ))}
                                            </div>
                                        ) : null}
                                    </div>
                                    <Separator />
                                    <div className="grid gap-3">
                                        <div className="text-sm font-semibold">F. Beneficiaries</div>
                                        <LabelValue label="Mode">{(data as any)?.beneficiariesMode || "—"}</LabelValue>
                                        {Array.isArray((data as any)?.beneficiaries) && (data as any).beneficiaries.length ? (
                                            <div className="grid gap-2">
                                                {(data as any).beneficiaries.map((b: any, i: number) => (
                                                    <div key={"bene-" + i} className="rounded-md border p-3 grid md:grid-cols-3">
                                                        <LabelValue label="Name">{b?.name || "—"}</LabelValue>
                                                        <LabelValue label="Contact">{b?.contact || "—"}</LabelValue>
                                                        <LabelValue label="Status">{b?.status || "—"}</LabelValue>
                                                    </div>
                                                ))}
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
                                        <div className="grid md:grid-cols-3 gap-4">
                                            <LabelValue label="Recipient Company">{(data as any)?.shippingRecipientCompany || "—"}</LabelValue>
                                            <LabelValue label="Contact Person">{(data as any)?.shippingContactPerson || "—"}</LabelValue>
                                            <LabelValue label="Contact Phone">{(data as any)?.shippingPhone || "—"}</LabelValue>
                                            <LabelValue label="Postal Code">{(data as any)?.shippingPostalCode || "—"}</LabelValue>
                                            <LabelValue label="Address">{(data as any)?.shippingAddress || "—"}</LabelValue>
                                        </div>
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
                                                    {(data as any)?.recordStorageAddress || "—"}
                                                </LabelValue>
                                                <LabelValue label="Responsible Person">
                                                    {(data as any)?.recordStorageResponsiblePerson || "—"}
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
                                                {typeof dataMemo.finalAmount === "number" ? `${dataMemo.finalAmount} ${dataMemo.currency || "USD"}` : "—"}
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
                                        <div className="grid grid-cols-1 gap-2 text-sm">
                                            {([
                                                ["Legal or Ethical Concern (money laundering etc)", "legalAndEthicalConcern"],
                                                ["Sanctioned Countries Activity (Iran, Sudan, NK, Syria, Cuba, Belarus, Zimbabwe)", "q_country"],
                                                ["Sanctions Exposure (UN, EU, UKHMT, HKMA, OFAC, etc.)", "sanctionsExposureDeclaration"],
                                                ["Crimea/Sevastopol Presence", "crimeaSevastapolPresence"],
                                                ["Russian Energy Presence", "russianEnergyPresence"],
                                            ] as const).map(([label, key]) => {
                                                const raw = (dataMemo as any)[key];
                                                const val = raw ? String(raw).toLowerCase() : "";
                                                const isYes = val === "yes";
                                                return (
                                                    <div key={key} className="flex items-center justify-between gap-3">
                                                        <span>{label}</span>
                                                        <Badge
                                                            variant={isYes ? "destructive" : "default"}
                                                            className={
                                                                isYes
                                                                    ? ""
                                                                    : "bg-green-100 text-green-800 border border-green-200 hover:bg-green-100"
                                                            }
                                                        >
                                                            {raw ? String(raw).toUpperCase() : "—"}
                                                        </Badge>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </CardContent>
                                <Separator />
                                <CardHeader>
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                            <ShieldCheck className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <CardTitle className="text-base">Declarations & e-Sign</CardTitle>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {/* Row 2: Declarations (only these belong to declarations) */}
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="text-xs text-muted-foreground">Declarations</div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <LabelValue label="Truthfulness">
                                                <BoolPill value={!!dataMemo.truthfulnessDeclaration} />
                                            </LabelValue>
                                            <LabelValue label="Legal Terms">
                                                <BoolPill value={!!dataMemo.legalTermsAcknowledgment} />
                                            </LabelValue>
                                            <LabelValue label="Compliance Precondition">
                                                <BoolPill value={!!dataMemo.compliancePreconditionAcknowledgment} />
                                            </LabelValue>
                                            <LabelValue label="e-Sign">
                                                {dataMemo.eSign || "—"}
                                            </LabelValue>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
                        </div>
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
        </Tabs>
    );
}