import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAtom } from "jotai";
import { companyIncorporationList } from "@/services/state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";


interface Country {
    code: string;
    name: string;
}

interface ApplicantInfoForm {
    name: string;
    relationships: string[];
    contactInfo: string;
    snsAccountId: string;
    phoneNumber: string;
    email: string;
    companyName: string;
}

interface BusinessInfoHkCompany {
    sanctioned_countries: string;
    sanctions_presence: string;
    crimea_presence: string;
    russian_business_presence: string;
    legal_assessment: string;
}

interface CompanyBusinessInfo {
    business_product_description: string;
}

interface RegCompanyInfo {
    registerCompanyNameAtom: string;
    registerShareholderNameAtom: string;
}

interface ShareHolderDirectorController {
    shareHolderDirectorNameSharesNumAtom: string;
    significantControllerAtom: string;
    designatedContactPersonAtom: string;
}

interface AccountingTaxInfo {
    anySoftwareInUse: string;
}

interface PaymentDetails {
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
    }

}

interface Company {
    incorporationDate: string;
    is_draft: boolean;
    _id: string;  // Changed to string for frontend
    userId: string;  // Changed to string for frontend
    country: Country;
    applicantInfoForm: ApplicantInfoForm;
    businessInfoHkCompany: BusinessInfoHkCompany;
    companyBusinessInfo: CompanyBusinessInfo;
    regCompanyInfo: RegCompanyInfo;
    shareHolderDirectorController: ShareHolderDirectorController;
    accountingTaxInfo: AccountingTaxInfo;
    status: string;
    paymentDetails?: PaymentDetails;
    __v: number;
}


const CompanyDetail = () => {
    const { id } = useParams();
    const [companies] = useAtom(companyIncorporationList);
    const companyDetail = companies.find(c => c._id === id) as unknown as Company;
    const [isDraft, setIsDraft] = useState(companyDetail?.is_draft);

    if (!companyDetail) {
        return <div>Company not found</div>;
    }
    console.log("company", companyDetail);
    const generateSections = (company: Company) => {
        const sections = [];

        // Applicant Information Section
        if (company.applicantInfoForm) {
            sections.push({
                title: "Applicant Information",
                data: {
                    "Company Name": company.applicantInfoForm.companyName,
                    "Applicant Name": company.applicantInfoForm.name,
                    "Email": company.applicantInfoForm.email,
                    "Phone": company.applicantInfoForm.phoneNumber,
                    "Relationships": company.applicantInfoForm.relationships?.join(", ") || "N/A",
                    "SNS Account ID": company.applicantInfoForm.snsAccountId,
                },
            });
        }

        // Country Information Section
        if (company.country) {
            sections.push({
                title: "Country Information",
                data: {
                    "Country": company.country.name,
                    "Country Code": company.country.code
                }
            });
        }

        // Business Information Section
        if (company.businessInfoHkCompany || company.companyBusinessInfo) {
            sections.push({
                title: "Business Information",
                data: {
                    ...(company.businessInfoHkCompany ? {
                        "Sanctioned Countries": company.businessInfoHkCompany.sanctioned_countries,
                        "Sanctions Presence": company.businessInfoHkCompany.sanctions_presence,
                        "Crimea Presence": company.businessInfoHkCompany.crimea_presence,
                        "Russian Business Presence": company.businessInfoHkCompany.russian_business_presence,
                        "Legal Assessment": company.businessInfoHkCompany.legal_assessment,
                    } : {}),
                    "Business Description": company.companyBusinessInfo?.business_product_description || "N/A"
                }
            });
        }

        // Payment Information Section
        console.log(company.paymentDetails)
        if (company.paymentDetails?.paymentData) {
            sections.push({
                title: "Payment Information",
                data: {
                    "Payment ID": company.paymentDetails.paymentData.id,
                    "Amount": `${(company.paymentDetails.paymentData.amount / 100).toFixed(2)} ${company.paymentDetails.paymentData.currency.toUpperCase()}`,
                    "Status": company.paymentDetails.paymentData.status,
                    "Payment Date": new Date(company.paymentDetails.paymentData.created * 1000).toLocaleString(),
                    "Payment Methods": company.paymentDetails.paymentData.payment_method_types.join(", ")
                }
            });
        }

        // Status Information Section
        sections.push({
            title: "Status Information",
            data: {
                "Status": company.status,
                "Incorporation Date": company.incorporationDate || "N/A",
                "Can Edit": company.is_draft ? "Yes" : "No"
            }
        });

        return sections;
    };

    const sections = generateSections(companyDetail);


    const handleUpdate = async () => {
        // API call to update the record in the backend
        console.log("testing", companyDetail._id)
        // const response = await fetch(`/api/company/${id}`, {
        //   method: "PATCH",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({ is_draft: !isDraft }),
        // });
        // const data = await response.json();      
        // console.log(data);
        setIsDraft(!isDraft);
    };

    return (
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
                                    <TableHead>Value</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Object.entries(section.data).map(([key, value]) => (
                                    <TableRow key={key}>
                                        <TableCell className="font-medium">{key}</TableCell>
                                        <TableCell>{value as string}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {section.title === "Status Information" && (
                            <div className="flex items-center gap-4 mt-4">
                                <span className="text-sm font-medium text-gray-600">
                                    Click here to give access to the user to edit their current record
                                </span>
                                <Button onClick={handleUpdate} className="px-4 py-2 text-sm">
                                    Click
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default CompanyDetail;