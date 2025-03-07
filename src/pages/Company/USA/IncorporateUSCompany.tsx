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
import Section13 from "./Components/Section13"
import Section14 from "./Components/Section14"
import Section15 from "./Components/Section15"
import FormSections from "./Components/Section16"

const IncorporateUSACompany = () => {
    return (
        <React.Fragment>
            <Card className="max-w-5xl mx-auto">
                <CardHeader className="bg-sky-100 dark:bg-sky-900">
                    <CardTitle>
                        Application for incorporation of a US company (LLC-Limited Liability Company/Corp-Corporation)
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-4">
                        This is an application form to form a company the USA. Please check the information related to the incorporation process and provide a specific answer.
                    </p>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Company Information */}
                    <div className="space-y-4 text-sm">

                        <div className="space-y-2 text-foreground">
                            <p>
                                This application is in the form of a questionnaire on the information required for the formation of a US company(LLC-Limited Liability Company/ Corp-Corporation) and some questions may be difficult for some clients or may take some time to answer. Accordingly, please kindly answer the questions and submit the relevant documents when you have sufficient time.

                                If you have any difficulty or difficulty understanding the written form, please contact us using the details below.
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
            <Section13 />
            <Section14 />
            <Section15 />
            <FormSections />
        </React.Fragment>
    )
}





export default IncorporateUSACompany