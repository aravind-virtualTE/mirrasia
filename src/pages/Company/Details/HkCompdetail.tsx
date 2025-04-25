import { useAtom, useSetAtom } from "jotai";
import { useToast } from "@/hooks/use-toast";
import { companyIncorporationList } from "@/services/state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SAgrementPdf from "../HongKong/ServiceAgreement/SAgrementPdf";
import { updateEditValues, getIncorporationListByCompId, fetchUsers } from "@/services/dataFetch";
import React, { useEffect, useMemo, useState } from "react";
import { paymentApi } from "@/lib/api/payment";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { updateCompanyIncorporationAtom } from "@/lib/atom";
import { ShareHolderDirectorController } from "@/types/hongkongForm";
import MemoApp from "./MemosHK";
import TodoApp from "@/pages/Todo/TodoApp";
import { User } from "@/components/userList/UsersList";
import { useNavigate } from "react-router-dom";
import ProjectDetail from "@/pages/dashboard/Admin/Projects/ProjectDetail";
export interface SessionData {
    _id: string;
    amount: number;
    currency: string;
    expiresAt: string;
    status: string;
    paymentId: string;
}

interface Country {
    [key: string]: string | undefined;
    code: string | undefined;
    name: string | undefined;
}

interface ApplicantInfoForm {
    name: string;
    relationships: string[];
    contactInfo: string;
    snsAccountId: string;
    phoneNumber: string;
    email: string;
    companyName: string[];
    snsPlatform: string;
    chinaCompanyName: string[];
}

interface BusinessInfoHkCompany {
    [key: string]: string | undefined;
    sanctioned_countries?: string;
    sanctions_presence?: string;
    crimea_presence?: string;
    russian_business_presence?: string;
    legal_assessment?: string;
}

interface CompanyBusinessInfo {
    business_product_description: string;
    business_industry: string;
    business_purpose: string[];
}

interface RegCompanyInfo {
    registerCompanyNameAtom: string;
    registerShareTypeAtom: string[];
    registerPaymentShare?: string;
    registerCurrencyAtom?: string;
    registerAmountAtom?: string;
    registerNumSharesAtom?: string;
}

interface AccountingTaxInfo {
    anySoftwareInUse: string;
}

export interface PaymentDetails {
    paymentData: {
        id: string;
        object: string;
        allowed_source_types: string[];
        amount: number;
        amount_details: {
            tip?: Record<string, unknown>;
        };
        automatic_payment_methods: null | Record<string, unknown>;
        canceled_at: number | null;
        cancellation_reason: string | null;
        capture_method: string;
        client_secret: string;
        confirmation_method: string;
        created: number;
        currency: string;
        description: string | null;
        last_payment_error: null | Record<string, unknown>;
        livemode: boolean;
        next_action: null | Record<string, unknown>;
        next_source_action: null | Record<string, unknown>;
        payment_method: string;
        payment_method_configuration_details: null | Record<string, unknown>;
        payment_method_types: string[];
        processing: null | Record<string, unknown>;
        receipt_email: string | null;
        setup_future_usage: null | string;
        shipping: null | Record<string, unknown>;
        source: null | Record<string, unknown>;
        status: string;
    };
}

interface Company {
    incorporationDate: string;
    is_draft: boolean;
    _id: string;
    userId: string;
    country: Country;   
    applicantInfoForm: ApplicantInfoForm;
    businessInfoHkCompany: BusinessInfoHkCompany;
    companyBusinessInfo: CompanyBusinessInfo;
    regCompanyInfo: RegCompanyInfo;
    shareHolderDirectorController: ShareHolderDirectorController;
    accountingTaxInfo: AccountingTaxInfo;
    status: string;
    paymentDetails?: PaymentDetails;
    icorporationDoc: string;
    sessionId: string;
    isDisabled: boolean;
    receiptUrl: string;
    assignedTo: string;
    __v: number;
}

const HkCompdetail: React.FC<{ id: string }> = ({ id }) => {

    const { toast } = useToast();
    const [companies] = useAtom(companyIncorporationList);
    const updateCompanyData = useSetAtom(updateCompanyIncorporationAtom);
    // const [companyData, setCompData] = useAtom(companyIncorporationAtom);
    const [users, setUsers] = useState<User[]>([]);
    const [adminAssigned, setAdminAssigned] = useState("");
    const navigate = useNavigate()
    const companyDetail = companies.find((c) => c._id === id) as unknown as Company;
    const [company, setCompany] = useState(companyDetail);
    const [session, setSession] = useState<SessionData>({
        _id: "",
        amount: 0,
        currency: "",
        expiresAt: "",
        status: "",
        paymentId: "",
    });
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null;
    const generateSections = (company: Company, session: SessionData) => {
        const sections = [];
        updateCompanyData(company);
        // console.log("company", company)
        // Applicant Information Section
        if (company.applicantInfoForm) {
            sections.push({
                title: "Applicant Information",
                data: {
                    "Company Name": company.applicantInfoForm.companyName,
                    "Applicant Name": company.applicantInfoForm.name,
                    Email: company.applicantInfoForm.email,
                    Phone: company.applicantInfoForm.phoneNumber,
                    Relationships:
                        company.applicantInfoForm.relationships?.join(", ") || "N/A",
                    "SNS Account ID": company.applicantInfoForm.snsAccountId,
                },
            });
        }

        // Country Information Section
        if (company.country) {
            sections.push({
                title: "Country Information",
                data: {
                    Country: company.country.name,
                    "Country Code": company.country.code,
                },
            });
        }

        // Business Information Section
        if (company.businessInfoHkCompany || company.companyBusinessInfo) {
            sections.push({
                title: "Business Information",
                data: {
                    ...(company.businessInfoHkCompany
                        ? {
                            "Sanctioned Countries":
                                company.businessInfoHkCompany.sanctioned_countries,
                            "Sanctions Presence":
                                company.businessInfoHkCompany.sanctions_presence,
                            "Crimea Presence":
                                company.businessInfoHkCompany.crimea_presence,
                            "Russian Business Presence":
                                company.businessInfoHkCompany.russian_business_presence,
                            "Legal Assessment":
                                company.businessInfoHkCompany.legal_assessment,
                        }
                        : {}),
                    "Business Description":
                        company.companyBusinessInfo?.business_product_description || "N/A",
                },
            });
        }

        // Shareholder and Director Information Section
        if (company.shareHolderDirectorController) {
            const shareholderData = company.shareHolderDirectorController;
            // console.log("shareholderData", shareholderData)
            sections.push({
                title: "Shareholder and Director Information",
                data: {
                    "Designated Contact Person": shareholderData.designatedContactPersonAtom,
                    "Significant Controllers": Array.isArray(shareholderData.significantControllerAtom)
                        ? shareholderData.significantControllerAtom
                            .map((controller: { label: string }) => controller.label)
                            .join(", ")
                        : "N/A",

                    "Shareholders and Directors": (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Ownership Rate</TableHead>
                                    <TableHead>Is Director</TableHead>
                                    <TableHead>Is Legal Person</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Array.isArray(shareholderData.shareHolders) && shareholderData.shareHolders.map((shareholder, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{shareholder.name}</TableCell>
                                        <TableCell>{shareholder.email}</TableCell>
                                        <TableCell>{shareholder.phone || "N/A"}</TableCell>
                                        <TableCell>{shareholder.ownershipRate}%</TableCell>
                                        <TableCell>{shareholder.isDirector ? "Yes" : "No"}</TableCell>
                                        <TableCell>{shareholder.isLegalPerson ? "Yes" : "No"}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ),
                },
            });
        }
        // Payment Information Section
        if (company.sessionId && session) {
            sections.push({
                title: "Payment Information",
                data: {
                    // "Payment ID": session.paymentId,
                    Amount: session.amount,
                    "Payment Status": session.status,
                    "Payment Expire Date": new Date(session.expiresAt).toLocaleString(),
                    Receipt: company.receiptUrl ?? "N/A",
                    // "Payment Methods": company.paymentDetails.paymentData.payment_method_types.join(", ")
                },
            });
        }

        // Status Information Section
        sections.push({
            title: "Status Information",
            data: {
                "Incorporation Status": company.status,
                "Incorporation Date": company.incorporationDate || "N/A",
                "AML/CDD Edit": company.isDisabled ? "No" : "Yes",
            },
        });
        
        return sections;
    };
    const sections = useMemo(() => {
        if (!company) return [];
        return generateSections(company, session);
    }, [company, session]);
    useEffect(() => {
        const fetchSession = async () => {
            try {
                let companyData
                if (id) {
                    companyData = await getIncorporationListByCompId(id);
                    // console.log("companyData", companyData);
                    setAdminAssigned(companyData[0].assignedTo)
                    setCompany(companyData[0])
                }
                if(companyData[0].sessionId){
                    const session = await paymentApi.getSession(companyData[0].sessionId);
                    // console.log("session", session);
                    const transformedSession: SessionData = {
                        _id: session._id,
                        amount: session.amount,
                        currency: session.currency,
                        expiresAt: session.expiresAt,
                        status: session.status,
                        paymentId: session.paymentId,
                    };
                    setSession(transformedSession);
                }
                await fetchUsers().then((response) => {
                    const data = response.filter((e: { role: string; }) => e.role == 'admin' || e.role == 'master')
                    // console.log("responsedata", data)
                    setUsers(data);
                })
            } catch (error) {
                console.error("Failed to fetch session:", error);
            }
        };
        fetchSession();
    }, []);

    if (!company) {
        return <div>Company not found</div>;
    }
    const handleSessionDataChange = (key: keyof SessionData, value: string) => {
        setSession({ ...session, [key]: value });
    };
    const handleCompanyDataChange = (
        key: keyof Company,
        value: string | boolean
    ) => {
        setCompany({ ...company, [key]: value });
    };
    const IncorporationDateFrag = () => {
        let date = company.incorporationDate
        if (date !== null) {
            const [year, month, day] = date.split("T")[0].split("-");
            date = `${day}-${month}-${year}`
        }
        return (
            <React.Fragment>
                <TableCell className="font-medium">Incorporation Date</TableCell>
                <TableCell>{date || "Not set"}</TableCell>
                {user.role !== 'user' && <TableCell>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline">Edit</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Incorporation Date</DialogTitle>
                                <DialogDescription>
                                    Set the incorporation date for the company. This is the date when the company was officially registered.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="incorporationDate" className="text-right">
                                        Date
                                    </Label>
                                    <Input
                                        id="incorporationDate"
                                        type="date"
                                        value={company.incorporationDate || ""}
                                        onChange={(e) =>
                                            handleCompanyDataChange(
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
                </TableCell>}
            </React.Fragment>
        );
    };

    const ExtendPaymentTimer = () => {
        return (
            <React.Fragment>
                <TableCell className="font-medium">Payment Expire Date</TableCell>
                <TableCell>{new Date(session.expiresAt).toLocaleString() || "Not set"}</TableCell>
                {user.role !== 'user' && <TableCell>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline">Edit</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Payment Expire Date</DialogTitle>
                                <DialogDescription>
                                    Extend the Payment Expire for the company Payment.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="expiresAt" className="text-right">
                                        Date
                                    </Label>
                                    <Input
                                        id="expiresAt"
                                        type="date"
                                        value={session.expiresAt || ""}
                                        onChange={(e) =>
                                            handleSessionDataChange(
                                                "expiresAt",
                                                e.target.value
                                            )
                                        }
                                        className="col-span-3"
                                    />
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </TableCell>}
            </React.Fragment>
        );
    }

    const PaymentStatus = () => {
        return (
            <React.Fragment>
                <TableCell className="font-medium">Payment Status</TableCell>
                <TableCell>{session.status}</TableCell>
                {user.role !== 'user' && <TableCell>
                    <Select
                        value={session.status}
                        onValueChange={(value) => handleSessionDataChange("status", value)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                        </SelectContent>
                    </Select>
                </TableCell>}
            </React.Fragment>
        );
    }

    const CompanyIncorpoStatus = () => {
        const statusOptions = [
            'Pending',
            'KYC Verification',
            'Waiting for Payment',
            'Waiting for Documents',
            'Waiting for Incorporation',
            'Incorporation Completed',
            // 'Good Standing',
            'Renewal Processing',
            'Renewal Completed',
        ];
        return (
            <React.Fragment>
                <TableCell className="font-medium">InCorporation Status</TableCell>
                <TableCell>{company.status}</TableCell>
                { user.role !== 'user' && <TableCell>
                    <Select
                        value={company.status}
                        onValueChange={(value) => handleCompanyDataChange("status", value)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.map((status) => (
                                <SelectItem key={status} value={status}>
                                    {status}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </TableCell>}
            </React.Fragment>
        );
    };

    const ReceietPaymentFrag = () => {
        return (
            <React.Fragment>
                <TableCell className="font-medium">Receipt</TableCell>
                <TableCell>
                    {company.receiptUrl ? "Available" : "Not available"}
                </TableCell>
                <TableCell>
                    {company.receiptUrl && (
                        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline">View Receipt</Button>
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
                                        src={company.receiptUrl}
                                        className="w-full h-[calc(100vh-200px)]"
                                        title="Receipt"
                                    />
                                </div>
                            </SheetContent>
                        </Sheet>
                    )}
                </TableCell>
            </React.Fragment>
        );
    };
    const AMLCDDEdit = () => (
        <React.Fragment>
            <TableCell className="font-medium">AML/CDD Edit</TableCell>
            <TableCell>{company.isDisabled ? "No" : "Yes"}</TableCell>
            <TableCell>
                <Switch
                    checked={!company.isDisabled}
                    onCheckedChange={(checked) => handleCompanyDataChange('isDisabled', !checked)}
                />
            </TableCell>
        </React.Fragment>
    )

    const handleUpdate = async () => {

        const payload = JSON.stringify({
            company: { id: company._id, status: company.status, isDisabled: company.isDisabled, incorporationDate: company.incorporationDate, country: "HK" },
            session: { id: session._id, expiresAt: (session.expiresAt), status: session.status },
            assignedTo : adminAssigned
        })
        await updateEditValues(payload);
        toast({ description: "Record updated successfully" });
    };

    const AssignAdmin = () => {
        const handleAssign = (value:string) =>{
            setAdminAssigned(value)
        }
        return (
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Assign Admin:</span>
                <Select
                    onValueChange={handleAssign}
                    value={adminAssigned}
                >
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
        )
    }
    return (
        <Tabs defaultValue="details" className="flex flex-col w-full max-w-5xl mx-auto">
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
                {user.role !== 'user' && (
                    <TabsTrigger
                        value="Memos"
                        className="flex-1 py-3 text-md font-medium transition-all rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                    >
                        Memo
                    </TabsTrigger>
                )}
                {user.role !== 'user' && (
                    <TabsTrigger
                        value="Projects"
                        className="flex-1 py-3 text-md font-medium transition-all rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                    >
                        Project
                    </TabsTrigger>
                )}
            </TabsList>

            <TabsContent value="details" className="p-6">
                <div className="space-y-4">
                    {/* <h1 className="text-2xl font-bold">Company Details</h1> */}
                    {user.role !== 'user' && <TodoApp id={company._id} name={company.applicantInfoForm.companyName[0]} />}
                    <div className='flex gap-x-8'>
                        {user.role !== 'user' && <AssignAdmin />}
                        <Button onClick={() => navigate(`/company-documents/${company.country.code}/${company._id}`)}>
                            Company Docs
                        </Button>
                    </div>
                    {sections.map((section) => (
                        <Card key={section.title} className="mb-6 border rounded-lg overflow-hidden transition-all hover:shadow-md">
                            <CardHeader className="bg-muted/50 py-4">
                                <CardTitle className="text-lg font-medium">{section.title}</CardTitle>
                            </CardHeader>

                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-b hover:bg-muted/30">
                                            <TableHead className="w-1/3 py-3 px-4 text-sm font-medium">Field</TableHead>
                                            <TableHead className="w-1/3 py-3 px-4 text-sm font-medium">Value</TableHead>
                                           {user.role !== 'user' && <TableHead className="w-1/5 py-3 px-4 text-sm font-medium">Action</TableHead>}
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {Object.entries(section.data).map(([key, value]) => {
                                            if (key == "Incorporation Date")
                                                return <TableRow key={key} className="border-b hover:bg-muted/30">
                                                    <IncorporationDateFrag />
                                                </TableRow>
                                            if (key == "Incorporation Status")
                                                return <TableRow key={key} className="border-b hover:bg-muted/30"><CompanyIncorpoStatus /></TableRow>
                                            if (key == "Receipt")
                                                return <TableRow key={key} className="border-b hover:bg-muted/30"><ReceietPaymentFrag /></TableRow>
                                            if (key == 'AML/CDD Edit' && user.role !== 'user' )
                                                return <TableRow key={key} className="border-b hover:bg-muted/30"><AMLCDDEdit /></TableRow>
                                            if (key == 'Payment Status')
                                                return <TableRow key={key} className="border-b hover:bg-muted/30"><PaymentStatus /></TableRow>
                                            if (key == 'Payment Expire Date')
                                                return <TableRow key={key} className="border-b hover:bg-muted/30"><ExtendPaymentTimer /></TableRow>

                                            return (
                                                <TableRow key={key} className="border-b hover:bg-muted/30">
                                                    <TableCell className="py-3 px-4 font-medium">{key}</TableCell>
                                                    <TableCell className="py-3 px-4">{value as string}</TableCell>
                                                    <TableCell></TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>

                                {section.title === "Status Information" && user.role !== 'user' && (
                                    <div className="flex items-center gap-4 p-4 bg-muted/50 border-t">
                                        <span className="text-sm font-medium">
                                            Click here to Save the Data
                                        </span>
                                        <Button
                                            onClick={handleUpdate}
                                            className="px-4 py-2 text-sm"
                                        >
                                            Save
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
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
                    <ProjectDetail compId={id} />
                </div>
            </TabsContent>
        </Tabs>
    )
}

export default HkCompdetail