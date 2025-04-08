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
import { updateEditValues, getIncorporationListByCompId } from "@/services/dataFetch";
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
    _id: string; // Changed to string for frontend
    userId: string; // Changed to string for frontend
    country: Country;   //Record<string, string | undefined>;
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
    __v: number;
}

const HkCompdetail: React.FC<{ id: string }> = ({ id }) => {

    const { toast } = useToast();
    const [companies] = useAtom(companyIncorporationList);
    const updateCompanyData = useSetAtom(updateCompanyIncorporationAtom);
    // const [companyData, setCompData] = useAtom(companyIncorporationAtom);
    const companyDetail = companies.find(
        (c) => c._id === id
    ) as unknown as Company;
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
            console.log("shareholderData",shareholderData)
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
                    setCompany(companyData[0])
                }
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
                <TableCell>
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
                </TableCell>
            </React.Fragment>
        );
    };

    const ExtendPaymentTimer = () => {
        return (
            <React.Fragment>
                <TableCell className="font-medium">Payment Expire Date</TableCell>
                <TableCell>{new Date(session.expiresAt).toLocaleString() || "Not set"}</TableCell>
                <TableCell>
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
                </TableCell>
            </React.Fragment>
        );
    }

    const PaymentStatus = () => {
        return (
            <React.Fragment>
                <TableCell className="font-medium">Payment Status</TableCell>
                <TableCell>{session.status}</TableCell>
                <TableCell>
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
                </TableCell>
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
            'Good Standing',
            'Renewal Processing',
            'Renewal Completed',
        ];
        return (
            <React.Fragment>
                <TableCell className="font-medium">InCorporation Status</TableCell>
                <TableCell>{company.status}</TableCell>
                <TableCell>
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
                </TableCell>
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
            session: { id: session._id, expiresAt: (session.expiresAt), status: session.status }
        })
        // {
        //     id: companyDetail._id,
        //     value: false,
        // }
        await updateEditValues(payload);
        toast({ description: "Record updated successfully" });
    };

    return (
        <Tabs defaultValue="details" className="flex flex-col">
            <TabsList className="flex space-x-4 mb-4">
                <TabsTrigger value="details" className="px-4 py-2">
                    Details
                </TabsTrigger>
                <TabsTrigger value="service-agreement" className="px-4 py-2">
                    Service Agreement Details
                </TabsTrigger>
            </TabsList>

            <TabsContent value="details">
                <div className="p-6 space-y-6 w-full max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold mb-6">Company Details</h1>
                    {sections.map((section) => (
                        <Card key={section.title} className="mb-6">
                            <CardHeader>
                                <CardTitle>{section.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-1/3">Field</TableHead>
                                            <TableHead className="w-1/3">Value</TableHead>
                                            <TableHead className="w-1/5">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {Object.entries(section.data).map(([key, value]) => {
                                            if (key == "Incorporation Date")
                                                return <TableRow key={key}>
                                                    <IncorporationDateFrag />;
                                                </TableRow>
                                            if (key == "Incorporation Status")
                                                return <TableRow key={key}><CompanyIncorpoStatus />;</TableRow>
                                            if (key == "Receipt") return <TableRow key={key}><ReceietPaymentFrag /></TableRow>;
                                            if (key == 'AML/CDD Edit') return <TableRow key={key}><AMLCDDEdit /></TableRow>
                                            if (key == 'Payment Status') return <TableRow key={key}><PaymentStatus /></TableRow>
                                            if (key == 'Payment Expire Date') return <TableRow key={key}><ExtendPaymentTimer /></TableRow>
                                            return (
                                                <TableRow key={key}>
                                                    <TableCell className="font-medium">{key}</TableCell>
                                                    <TableCell>{value as string}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                                {section.title === "Status Information" && (
                                    <div className="flex items-center gap-4 mt-4">
                                        <span className="text-sm font-medium text-gray-600">
                                            Click here to Save the Data
                                        </span>
                                        <Button
                                            onClick={handleUpdate}
                                            className="px-4 py-2 text-sm"
                                        >
                                            Click
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </TabsContent>

            <TabsContent value="service-agreement">
                <div className="p-6 space-y-6 w-full max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold mb-6">Service Agreement Details</h1>
                    {id && <SAgrementPdf id={id} />}
                </div>
            </TabsContent>
        </Tabs>
    )
}

export default HkCompdetail