import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

import { Separator } from "@/components/ui/separator"
import ApplicantInformation from './Section5';

const Section1: React.FC = () => {

    
    return (
        <>
            <Card className="max-w-5xl mx-auto">
                <CardHeader className="bg-sky-100 dark:bg-sky-900">
                    <CardTitle>
                        Application for registration of U.S. company members (for legal)
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-4">
                        This application is in the form of a questionnaire about the information required to proceed with the registration of a member of a U.S. company, and the representative of the corporation that is a member is requested to fill out this application.
                    </p>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Company Information */}
                    <div className="space-y-4 text-sm">

                        <div className="space-y-2 text-foreground">
                            <p>
                              This application and the application form to be signed in the future are required by the TCSP license and AMLO (Money Laundering and Counter-Terrorism Finance Act) to provide KYC (Know Your Customer; Know Your Customer) and Client's Due Diligence, and will be kept by us as Statutory Documents in the future. Therefore, please be careful not to distort or make errors in the written content. 
                            </p>
                            <p>I appreciate it.</p>
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
                </CardContent>
            </Card>
            <ApplicantInformation />
        </>
    )
}

export default Section1