import React, { useState } from 'react'
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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BnkOpnForm: React.FC = () => {
    const [currentSection, setCurrentSection] = useState(1);
    const steps = [
        { number: 1, label: "Email", active: currentSection === 1 },
        { number: 2, label: "Customer information", active: currentSection === 2 },
        { number: 3, label: "Nationality", active: currentSection === 3 },
        { number: 4, label: "Important notes", active: currentSection === 4 },
        { number: 5, label: "Related content", active: currentSection === 5 },
        { number: 6, label: "Meeting schedule", active: currentSection === 6 },
        { number: 7, label: "Upload passport", active: currentSection === 7 },
        { number: 8, label: "Main services", active: currentSection === 8 },
        { number: 9, label: "Payment method", active: currentSection === 9 },
        { number: 10, label: "Declaration", active: currentSection === 10 },
    ];


    const nextSection = async () => {
        currentSection != 10 && setCurrentSection(prev => prev + 1)
    };

    const previousSection = () => {
        if (currentSection > 1) {
            setCurrentSection(currentSection - 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }

    return (
        <div className="flex flex-col md:flex-row h-screen">
            <div className="flex-1 flex flex-col h-full">
                <div>
                    {currentSection === 1 && <>
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
                            </CardContent>
                        </Card>
                    </>
                    }
                    {currentSection === 2 && <Section2 />}
                    {currentSection === 3 && <BfrmSec3 />}
                    {currentSection === 4 && <BfrmSec4 />}
                    {currentSection === 5 && <DescriptionDetails />}
                    {currentSection === 6 && <BankMeetingSchedule />}
                    {currentSection === 7 && <PassportUploadForm />}
                    {currentSection === 8 && <MainServices />}
                    {currentSection === 9 && <PaymentMethd />}
                    {currentSection === 10 && <AccountingAndDeclaration />}
                </div>
                <div className="sticky bottom-0 bg-background border-t p-1 mt-auto"> {/* Sticky positioning */}
                    <div className="flex justify-between">
                        <Button
                            variant="outline"
                            onClick={previousSection}
                            disabled={currentSection === 1}
                            className="flex items-center space-x-2"
                        >
                            <span>← BACK</span>
                        </Button>
                        <Button
                            onClick={nextSection}
                            className="flex items-center space-x-2 bg-primary"
                        >
                            <span>{currentSection === 16 ? "SUBMIT" : "NEXT →"}</span>
                        </Button>
                    </div>
                </div>
            </div>
            <Card className="w-full md:w-48 rounded-none border-l border-t-0 border-r-0 border-b-0 overflow-y-auto hidden md:flex">
                <div className="p-4">
                    <div className="space-y-4">
                        {steps.map((step, index) => (
                            <div key={index} className="flex items-center">
                                <div
                                    className={cn(
                                        "w-6 h-6 rounded-full flex items-center justify-center text-sm",
                                        index + 1 < currentSection && "bg-primary/20 text-primary",
                                        index + 1 === currentSection &&
                                        "bg-primary text-primary-foreground",
                                        index + 1 > currentSection &&
                                        "bg-muted text-muted-foreground"
                                    )}
                                >
                                    {index + 1}
                                </div>
                                <span className="ml-3 text-sm whitespace-pre-wrap">
                                    {step.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        </div>
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

