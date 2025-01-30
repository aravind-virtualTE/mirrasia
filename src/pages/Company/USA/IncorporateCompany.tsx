import  React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import CompanyInfoForm from "./Components/CompanyInfoForm"
import MemberRegistrationForm from "./Components/MemberRegistrationForm"
import TaxResidencyForm from "./Components/TaxResidencyForm"
import PoliticalFigureForm from "./Components/PoliticalFigureForm"
import DeclarationForm from "./Components/DeclarationForm"
import ConsentDeclaration from "./Components/ConsentDeclaration"

const IncorporateUSACompany = () => {
    return (
        <React.Fragment>
            <Card className="max-w-5xl mx-auto">
                <CardHeader>
                    <CardTitle>
                        Application for incorporation of a US company (LLC-Limited Liability Company/Corp-Corporation)
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-4">
                        This is an application for establishment of a US company. Please check the information related to the
                        establishment process and give a specific answer.
                    </p>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Company Information */}
                    <div className="space-y-4 text-sm">

                        <div className="space-y-2 text-foreground">
                            <p>
                                This application form is written in the form of a questionnaire regarding the information absolutely necessary to proceed with the registration of members of a US company (LLC - limited liability company / Corp - joint stock company). All individuals who are members are requested to individually complete this application form.
                            </p>

                            <p>
                                This application form and the application form documents to be signed later will be kept by our company as legal procedures for performing KYC (Know Your Customer) and Client's Due Diligence (due diligence and verification of customers) in accordance with the TCSP license and AMLO (Anti-Money Laundering and Counter-Terrorist Financing Act) and as future legal records (Statutory Documents). Therefore, please be careful to avoid any distortion or errors in the content you write.
                            </p>

                            <p>Thank you.</p>
                        </div>
                        <div className="space-y-2">
                            <p className="font-medium">Mirrasia</p>
                            <p>
                                website:{" "}
                                <a href="http://www.mirrasia.com" className="text-primary hover:underline">
                                    www.mirrasia.com
                                </a>
                            </p>
                            <p>
                                Plus Friend:{" "}
                                <a href="https://pf.kakao.com/_KxmnZT" className="text-primary hover:underline">
                                    https://pf.kakao.com/_KxmnZT
                                </a>
                            </p>
                            <p>Phone: (Korea) 02-543-6187 (Hong Kong) 2187-2428</p>
                            <p>SNS: (Kakao Talk) mirrasia (WeChat) mirrasia_hk</p>
                        </div>
                    </div>

                    <Separator />

                    {/* Form Fields */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-base">
                                Email <span className="text-destructive">*</span>
                            </Label>
                            <Input id="email" type="email" placeholder="Valid email" className="w-full" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-base">
                                Full Name <span className="text-destructive">*</span>
                            </Label>
                            <Input id="name" placeholder="Please provide your full official name" className="w-full" required />
                        </div>
                    </div>
                </CardContent>
            </Card>
            <MemberRegistrationForm />
            <CompanyInfoForm />
            <TaxResidencyForm />
            <PoliticalFigureForm />
            <DeclarationForm />
            <ConsentDeclaration />
        </React.Fragment>
    )
}





export default IncorporateUSACompany