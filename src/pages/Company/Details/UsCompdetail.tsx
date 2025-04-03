import { getUsIncorpoDataById } from '@/services/dataFetch'
import { useAtom } from 'jotai';
import React, { useEffect, useMemo, useState } from 'react'
import { UsaFormData, usaFormWithResetAtom } from '../USA/UsState';
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
import { SessionData } from './HkCompdetail';
import { paymentApi } from '@/lib/api/payment';

const UsCompdetail: React.FC<{ id: string }> = ({ id }) => {
    const [formData, setFormData] = useAtom(usaFormWithResetAtom);
    const [session, setSession] = useState<SessionData>({
        _id: "",
        amount: 0,
        currency: "",
        expiresAt: "",
        status: "",
        paymentId: "",
    });

    useEffect(() => {
        async function getUsData() {
            const data = await getUsIncorpoDataById(`${id}`)
            console.log("data-->", data)
            if(data.sessionId!==  "" ){
                const session = await paymentApi.getSession(data.sessionId);
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
            return data;
        }
        
        getUsData().then((result) => {
            // console.log("result-->", result);
            setFormData(result)
        })
    }, [])

    const generateSections = (formData: UsaFormData, session: SessionData) => {
        const sections = [];
        // console.log("company", company)
        // Applicant Information Section
        sections.push({
            title: "Applicant Information",
            data: {
                "Company Name": formData.companyName,
                "Applicant Name": formData.name,
                Email: formData.email,
                Phone: formData.phoneNum,
                Relationships:
                    formData.establishedRelationshipType?.join(", ") || "N/A",
                "SNS Account ID": formData.snsAccountId,
            },
        });

        // Country Information Section
        if (formData.country) {
            sections.push({
                title: "Country Information",
                data: {
                    Country: formData.country.name,
                    "Country Code": formData.country.code,
                },
            });
        }

        sections.push({
            title: "Business Information",
            data: {
                "Sanctioned Countries":
                    formData.restrictedCountriesWithActivity,
                "Sanctions Presence":
                    formData.sanctionedTiesPresent,
                "Crimea Presence":
                    formData.businessInCrimea,
                "Russian Business Presence":
                    formData.involvedInRussianEnergyDefense,
                "Legal Assessment":
                    formData.hasLegalEthicalIssues,
                "Annual Renewal Terms":
                    formData.annualRenewalTermsAgreement
            },
        });

        // Shareholder and Director Information Section
        // if (formData.shareHolders) {
        //     const shareholderData = formData.shareHolders;

        //     sections.push({
        //         title: "Shareholder and Director Information",
        //         data: {
        //             "Designated Contact Person": shareholderData.designatedContactPersonAtom,
        //             "Significant Controllers": Array.isArray(shareholderData.significantControllerAtom)
        //                 ? shareholderData.significantControllerAtom
        //                     .map((controller: { label: string }) => controller.label)
        //                     .join(", ")
        //                 : "N/A",

        //             "Shareholders and Directors": (
        //                 <Table>
        //                     <TableHeader>
        //                         <TableRow>
        //                             <TableHead>Name</TableHead>
        //                             <TableHead>Email</TableHead>
        //                             <TableHead>Phone</TableHead>
        //                             <TableHead>Ownership Rate</TableHead>
        //                             <TableHead>Is Director</TableHead>
        //                             <TableHead>Is Legal Person</TableHead>
        //                         </TableRow>
        //                     </TableHeader>
        //                     <TableBody>
        //                         {Array.isArray(shareholderData.shareHolders) && shareholderData.shareHolders.map((shareholder, index) => (
        //                             <TableRow key={index}>
        //                                 <TableCell>{shareholder.name}</TableCell>
        //                                 <TableCell>{shareholder.email}</TableCell>
        //                                 <TableCell>{shareholder.phone || "N/A"}</TableCell>
        //                                 <TableCell>{shareholder.ownershipRate}%</TableCell>
        //                                 <TableCell>{shareholder.isDirector ? "Yes" : "No"}</TableCell>
        //                                 <TableCell>{shareholder.isLegalPerson ? "Yes" : "No"}</TableCell>
        //                             </TableRow>
        //                         ))}
        //                     </TableBody>
        //                 </Table>
        //             ),
        //         },
        //     });
        // Payment Information Section
        if (formData.sessionId && session) {
            sections.push({
                title: "Payment Information",
                data: {
                    // "Payment ID": session.paymentId,
                    Amount: session.amount,
                    "Payment Status": session.status,
                    "Payment Expire Date": new Date(session.expiresAt).toLocaleString(),
                    Receipt: formData.receiptUrl ?? "N/A",
                    // "Payment Methods": company.paymentDetails.paymentData.payment_method_types.join(", ")
                },
            });
        }

        // Status Information Section
        sections.push({
            title: "Status Information",
            data: {
                "Incorporation Status": formData.status,
                "Incorporation Date": formData.incorporationDate || "N/A",
                "AML/CDD Edit": formData.isDisabled ? "No" : "Yes",
            },
        });

        return sections;
    }

    const sections = useMemo(() => {
        if (!formData) return [];
        return generateSections(formData, session);
    }, [formData, session]);

    console.log("formData--->", formData)

    const handleUpdate = async () => {
        console.log("Updating company data...");
    }

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
                                                // if (key == "Incorporation Date")
                                                //     return <TableRow key={key}>
                                                //         <IncorporationDateFrag />;
                                                //     </TableRow>
                                                // if (key == "Incorporation Status")
                                                //     return <TableRow key={key}><CompanyIncorpoStatus />;</TableRow>
                                                // if (key == "Receipt") return <TableRow key={key}><ReceietPaymentFrag /></TableRow>;
                                                // if (key == 'AML/CDD Edit') return <TableRow key={key}><AMLCDDEdit /></TableRow>
                                                // if (key == 'Payment Status') return <TableRow key={key}><PaymentStatus /></TableRow>
                                                // if (key == 'Payment Expire Date') return <TableRow key={key}><ExtendPaymentTimer /></TableRow>
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
                </div>
            </TabsContent>
        </Tabs>
    )

};



export default UsCompdetail