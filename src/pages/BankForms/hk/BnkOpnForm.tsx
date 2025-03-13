import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Section2 from './BfrmSec2'
import BfrmSec3 from './BfrmSec3'
import BfrmSec4 from './BfrmSec4'
import BankMeetingSchedule from './BankMeeting'
import PassportUploadForm from './UploadPassportForm'
import MainServices from './MainServices'
import PaymentMethd from './PaymentMthd'
import AccountingAndDeclaration from './AgrmntAndDeclaration'

const BnkOpnForm: React.FC = () => {
    return (
        <>
            <Card className="max-w-5xl mx-auto mt-2">
                <CardHeader className="bg-sky-100 dark:bg-sky-900">
                    <CardTitle>
                        Hong Kong Personal Account Opening Request Form
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4 text-sm">
                        <div className="space-y-2 text-foreground">
                            <p>
                                This application form is written in the form of a questionnaire about the information absolutely necessary to open a personal account in Hong Kong. Please be careful to fill out the form without any distortion or errors.

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
                            Phone: (Korea) 02-543-6187 (Hong Kong) 2187-2428
                            <p>KakaoTalk: mirrasia WeChat: mirrasia_hk</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className="max-w-5xl mx-auto space-y-6 py-6">
                <Card>
                    <CardContent className="p-6 space-y-2">
                        <Label htmlFor="email" className="text-sm">
                            Email <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Valid email"
                            className="w-full"
                            required
                        />
                    </CardContent>
                </Card>
            </div>
            <Section2 />
            <BfrmSec3 />
            <BfrmSec4 />
            <DescriptionDetails />
            <BankMeetingSchedule />
            <PassportUploadForm />
            <MainServices />
            <PaymentMethd />
            <AccountingAndDeclaration />
        </>
    )
}

export default BnkOpnForm


const DescriptionDetails = () => {
 
    return (
        <Card className="max-w-5xl mx-auto mt-2">
            <CardHeader className="bg-sky-100 dark:bg-sky-900">
                <CardTitle className="text-lg font-medium">Description of related content</CardTitle>         
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <Label htmlFor="previousContent" className="inline-flex">
                    If you answered "Yes" to any of the previous questions, please provide details. : <span className="text-destructive">(Name of the bank where the account was closed or rejected, reason for service rejection, etc.)</span>
                    </Label>
                    <Input id="previousContent" placeholder="Your answer" required />
                </div>                
            </CardContent>
        </Card>
    )
}

