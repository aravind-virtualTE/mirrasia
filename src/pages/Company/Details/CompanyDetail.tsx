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

interface Company {
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
    __v: number;
}


const CompanyDetail = () => {
    const { id } = useParams();
    const [companies] = useAtom(companyIncorporationList);
    const company = companies.find(c => c._id === id);
    const [isDraft, setIsDraft] = useState(company?.is_draft);

    if (!company) {
        return <div>Company not found</div>;
    }
    console.log("company", company);
    const sections = [
        {
            title: "Applicant Information",
            data: {
                "Company Name": (company.applicantInfoForm as Company['applicantInfoForm']).companyName,
                "Applicant Name": (company.applicantInfoForm as Company['applicantInfoForm']).name,
                "Email": (company.applicantInfoForm as Company['applicantInfoForm']).email,
                "Phone": (company.applicantInfoForm as Company['applicantInfoForm']).phoneNumber,
                "Relationships": (company.applicantInfoForm as Company['applicantInfoForm']).relationships.join(", "),
                "SNS Account ID": (company.applicantInfoForm as Company['applicantInfoForm']).snsAccountId,
            },
        },
        {
            title: "Country Information",
            data: {
                "Country": (company.country as Company['country']).name,
                "Country Code": (company.country as Company['country']).code
            }
        },
        {
            title: "Business Information",
            data: {
                "Sanctioned Countries": (company.businessInfoHkCompany as Company['businessInfoHkCompany']).sanctioned_countries,
                "Sanctions Presence": (company.businessInfoHkCompany as Company['businessInfoHkCompany']).sanctions_presence,
                "Crimea Presence": (company.businessInfoHkCompany as Company['businessInfoHkCompany']).crimea_presence,
                "Russian Business Presence": (company.businessInfoHkCompany as Company['businessInfoHkCompany']).russian_business_presence,
                "Legal Assessment": (company.businessInfoHkCompany as Company['businessInfoHkCompany']).legal_assessment,
                "Business Description": (company.companyBusinessInfo as Company['companyBusinessInfo']).business_product_description || "N/A"
            }
        },
        {
            title: "Status Information",
            data: {
                "Status": company.status,
                "Incorporation Date": company.incorporationDate || "N/A",
                "Can Edit": company.is_draft ? "Yes" : "No"
            }
        }
    ];

    
    const handleUpdate = async () => {
        // API call to update the record in the backend
        console.log("testing")
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
                    </CardContent>
                    {section.title === "Status Information" && (
                        <Button onClick={handleUpdate}>
                            {isDraft ? "Mark as Final" : "Edit Draft"}
                        </Button>
                    )}
                </Card>
            ))}
        </div>
    );
};

export default CompanyDetail;