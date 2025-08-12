import React, { useState } from 'react'
import { useAtom } from "jotai"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { usaFormWithResetAtom } from '../UsState';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
// import { Separator } from "@/components/ui/separator"
import ApplicantInformation from './ApplicantInformation2';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { sendEmailOtpforVerification, validateOtpforVerification } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
const Section1: React.FC = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useAtom(usaFormWithResetAtom);
    type OtpSession = { sms: string | null; email: string | null };
    const [otpSession, setOtpSession] = useState<OtpSession>({ sms: null, email: null });
    const [emailOtp, setEmailOtp] = useState("");
    const [emailOtpSent, setEmailOtpSent] = useState(false);
    const [emailResendTimer, setEmailResendTimer] = useState(0);


    const handleChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
        // console.log("name", name)
        const values = [...formData.companyName];
        values[index] = e.target.value;
        setFormData({ ...formData, companyName: values });
    }

    const handleSendEmailOtp = async () => {
            if (!formData.email) return;
    
            const data = {
                email: formData.email,
                name: formData.name,
            }
            if (otpSession.email != null) {
                toast({
                    title: "Error",
                    description: "Verify the otp sent already",
                    variant: "destructive"
                })
                return
            }
    
            const result = await sendEmailOtpforVerification(data)
    
            if (result.success) {
                setEmailOtpSent(true);
                setEmailResendTimer(60);
                setOtpSession((s) => ({ ...s, email: result.id }));
                toast({
                    title: "Success",
                    description: "OTP sent successfully",
                    variant: "default"
                })
            } else {
                // console.log("testing send otp")
                setEmailOtpSent(false);
                setEmailResendTimer(0);
                setOtpSession((s) => ({ ...s, sms: null }));
                toast({
                    title: "Error",
                    description: "Failed to send OTP. Please Try Later.",
                    variant: "destructive"
                })
            }
    
        };
    
        const handleVerifyEmailOtp = async () => {
            if (!emailOtp.trim()) {
                toast({
                    title: "Error",
                    description: "Please enter OTP",
                    variant: "destructive"
                })
                return;
            }
            const data = {
                otp: emailOtp,
                id: otpSession.email
            }
            const result = await validateOtpforVerification(data)
            if (result.success) {
                setFormData({ ...formData, emailOtpVerified: true })
                setOtpSession((s) => ({ ...s, sms: null }));
            } else {
                toast({
                    title: "Error",
                    description: "Invalid OTP",
                    variant: "destructive"
                })
            }
        };

    return (
        <>
            <Card className="max-w-5xl mx-auto">
                <CardHeader className="bg-sky-100 dark:bg-sky-900">
                    <CardTitle className="text-m inline-flex"> {t('usa.AppInfo.appInfohead')}<Tooltip>
                        <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[500px] text-base">
                            {t('usa.AppInfo.aInfPopup')}
                        </TooltipContent>
                    </Tooltip> </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="inline-flex">
                                {t('usa.AppInfo.nameOfApplicant')}<span className="text-destructive">*</span>
                            </Label>
                            <Input id="name" placeholder={t('usa.AppInfo.namePlaceholder')} required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        {/* <div className="space-y-2">
                            <Label htmlFor="email" className="text-base">
                                {t('SwitchService.ApplicantInfoForm.email')}<span className="text-destructive">*</span>
                            </Label>
                            <Input id="email" type="email" placeholder={t('usa.AppInfo.emailPlaceholder')} className="w-full" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        </div> */}
                        {!formData.emailOtpVerified ? (
                            <>
                                {/* Email + Send OTP */}
                                <div className="flex items-end space-x-2 mt-4">
                                    <div className="flex-1 space-y-1">
                                        <Label htmlFor="email" className="flex items-center gap-2">
                                            {t("ApplicantInfoForm.email")}
                                            <span className="text-red-500 font-bold ml-1 flex">
                                                *
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                                    </TooltipTrigger>
                                                    <TooltipContent className="max-w-[500px] text-base">
                                                        {t("ApplicantInfoForm.emailInfo")}
                                                    </TooltipContent>
                                                </Tooltip>
                                            </span>
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder={t("usa.AppInfo.emailPlaceholder", "Enter your email address")}
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                            disabled={formData.emailOtpVerified}
                                        />
                                    </div>

                                    <Button
                                        size="sm"
                                        type="button"
                                        onClick={handleSendEmailOtp}
                                        disabled={emailResendTimer > 0 || !formData.email}
                                    >
                                        {emailResendTimer > 0 ? `Resend in ${emailResendTimer}s` : "Send OTP"}
                                    </Button>
                                </div>

                                {/* OTP field */}
                                {emailOtpSent && (
                                    <div className="flex items-center space-x-2 mt-2">
                                        <Input
                                            id="email-otp"
                                            placeholder="OTP"
                                            value={emailOtp}
                                            onChange={(e) => setEmailOtp(e.target.value)}
                                            className="w-24"
                                        />
                                        <Button size="sm" type="button" onClick={handleVerifyEmailOtp}>
                                            Verify
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-green-600 text-sm flex items-center mt-2">
                                {formData.email} Email verified ✔️
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="relationbtwauth" className="inline-flex">
                            {t('usa.AppInfo.usCompName')}
                            <span className="text-red-500 font-bold ml-1 flex">*
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[500px] text-base">
                                        {t('usa.AppInfo.usCompNamePopup')}
                                    </TooltipContent>
                                </Tooltip>
                            </span>
                        </Label>
                        {
                            formData.companyName.map((name, index) => (
                                <Input
                                    key={index}
                                    id={`companyName${index}`}
                                    placeholder={t('usa.AppInfo.namePlaceholder')}
                                    value={name}
                                    onChange={handleChange(index)}
                                    required />
                            ))
                        }
                    </div>
                </CardContent>
            </Card>
            <ApplicantInformation />
        </>
    )
}

export default Section1