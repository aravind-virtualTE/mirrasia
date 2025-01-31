import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import Section2 from "./Components/Section2"
import Section3 from "./Components/Section3"
import Section4 from "./Components/Section4"
import Section5 from "./Components/Section5"
import Section6 from "./Components/Section6"
import Section7 from "./Components/Section7"
import Section8 from "./Components/Section8"
import Section9 from "./Components/Section9"
import Section10 from "./Components/Section10"
import Section11 from "./Components/Section11"
import Section12 from "./Components/Section12"

const IncorporateUSACompany = () => {
    return (
        <React.Fragment>
            <Card className="max-w-5xl mx-auto">
                <CardHeader className="bg-sky-100 dark:bg-sky-900">
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
                                This application form is written in the form of a questionnaire about the information necessary to proceed with the establishment of a U.S. company (LLC-Limited Liability Company/Corp-Corporation), and the questions may be difficult for some customers or it may take some time to answer. Therefore, we ask that you respond step by step while you have the time to do so, and that you also prepare and submit the relevant documents.If you have any difficulties or do not understand any part of the form, please contact us using the contact information below.
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
                    </div>
                </CardContent>
            </Card>
            <Section2 />
            <Section3 />
            <Section4 />
            <Section5 />
            <Section6 />
            <Section7 />
            <Section8 />
            <Section9 />
            <Section10 />
            <Section11 />
            <Section12 />
        </React.Fragment>
    )
}





export default IncorporateUSACompany