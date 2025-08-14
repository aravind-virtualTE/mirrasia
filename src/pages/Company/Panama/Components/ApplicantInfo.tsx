import React, { ChangeEvent, useEffect, useState } from 'react'
import { useTheme } from '@/components/theme-provider';
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { t } from 'i18next';
import { snsPlatforms } from '../../HongKong/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { useAtom } from 'jotai';
import { paFormWithResetAtom } from '../PaState';
import { Button } from '@/components/ui/button';
import { sendEmailOtpforVerification, sendMobileOtpforVerification, validateOtpforVerification } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';


const ApplicantInfo: React.FC<{canEdit: boolean}> = ({ canEdit }) => {
    const { theme } = useTheme();
    const [formData, setFormData] = useAtom(paFormWithResetAtom)
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    type OtpSession = { sms: string | null; email: string | null };
    const [otpSession, setOtpSession] = useState<OtpSession>({ sms: null, email: null });
    const [emailOtp, setEmailOtp] = useState("");
    const [emailOtpSent, setEmailOtpSent] = useState(false);
    const [emailResendTimer, setEmailResendTimer] = useState(0);

    useEffect(() => {
        if (resendTimer <= 0) return;
        const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
        return () => clearTimeout(timer);
    }, [resendTimer]);

    useEffect(() => {
        if (emailResendTimer <= 0) return;
        const timer = setTimeout(() => setEmailResendTimer(emailResendTimer - 1), 1000);
        return () => clearTimeout(timer);
    }, [emailResendTimer]);

    const handleChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
        // console.log("name", name)
        const values = [...formData.companyName];
        values[index] = e.target.value;
        setFormData({ ...formData, companyName: values });
    }

    const handleSelectChange = (value: string) => {
        // console.log("value", value)
        setFormData({
            ...formData,
            snsAccountId: {
                ...formData.snsAccountId,
                id: value
            }
        })
    }

    const handleSNSChange = (e: ChangeEvent<HTMLInputElement>): void => {
        // console.log("change",e)
        setFormData({
            ...formData,
            snsAccountId: {
                ...formData.snsAccountId,
                value: e.target.value
            }
        })
    }


    const handleSendOtp = async () => {
        if (!formData.phoneNum) {
            toast({
                title: "Missing Number",
                description: "Phone Number is required",
                variant: "default"
            })
            return;
        }
        const data = {
            phoneNum: formData.phoneNum,
        }
        if (otpSession.sms != null) {
            toast({
                title: "Error",
                description: "Verify the otp sent already",
                variant: "destructive"
            })
            return
        }

        const result = await sendMobileOtpforVerification(data)
        // console.log("result", result);
        if (result.success) {
            setOtpSent(true);
            setResendTimer(60);
            setOtpSession((s) => ({ ...s, sms: result.id }));
            toast({
                title: "Success",
                description: "OTP sent successfully",
                variant: "default"
            })
        } else {
            // console.log("testing send otp")
            setOtpSent(false);
            setResendTimer(0);
            setOtpSession((s) => ({ ...s, sms: null }));
            toast({
                title: "Error",
                description: "Failed to send OTP. Please enter proper phonenumber along with country code.",
                variant: "destructive"
            })
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp.trim()) {
            toast({
                title: "Error",
                description: "Please enter OTP",
                variant: "destructive"
            })
            return;
        }
        const data = {
            otp,
            id: otpSession.sms
        }
        const result = await validateOtpforVerification(data)
        // console.log("result", result);
        if (result.success) {
            setFormData({ ...formData, mobileOtpVerified: true })
            setOtpSession((s) => ({ ...s, sms: null }));
        } else {
            toast({
                title: "Error",
                description: "Invalid OTP",
                variant: "destructive"
            })
        }
    };

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
            setOtpSent(false);
            setResendTimer(0);
            setOtpSession((s) => ({ ...s, email: null}));
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
            setOtpSession((s) => ({ ...s, email: null }));
        } else {
            toast({
                title: "Error",
                description: "Invalid OTP",
                variant: "destructive"
            })
        }
    };

    return (
        <Card>
            <CardContent>
                <div className='flex w-full p-4'>
                    <aside className={`w-1/4 p-4 rounded-md shadow-sm ${theme === "light"
                        ? "bg-blue-50 text-gray-800"
                        : "bg-gray-800 text-gray-200"
                        }`}>
                        <h2 className="text-m font-semibold mb-0">{t("ApplicantInfoForm.heading")}</h2>
                        <p className="text-sm text-gray-600"> {t("panama.headInfo")}</p>
                    </aside>
                    <div className="w-3/4 ml-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="inline-flex">
                                {t("ApplicantInfoForm.applicantName")} <span className="text-red-500 font-bold ml-1 flex">*</span>
                            </Label>
                            <Input id="name" placeholder="Enter name" className="w-full" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} disabled={!canEdit}  />
                        </div>
                        {/* <div className="space-y-2">
                            <Label htmlFor="email" className="inline-flex">
                                {t("ApplicantInfoForm.email")}<span className="text-red-500 font-bold ml-1 flex">*</span>
                            </Label>
                            <Input id="email" placeholder="Enter your email address" className="w-full" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
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
                                            disabled={formData.emailOtpVerified || !canEdit}
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
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">{t("dashboard.tCompName")}<span className="text-red-500 font-bold ml-1 flex">*
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[500px] text-base">
                                        {t("panama.compNameInfo")}
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
                                        disabled={!canEdit}
                                        required />
                                ))
                            }
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="legalEntity" className="inline-flex">
                                {t("panama.applicantLegalEntity")}<span className="text-red-500 font-bold ml-1 flex">*</span>
                            </Label>
                            <Input id="legalEntity" placeholder="Enter if any.." className="w-full"
                                value={formData.legalEntity} onChange={(e) => setFormData({ ...formData, legalEntity: e.target.value })}
                                disabled={!canEdit}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="residentialAddress" className="inline-flex">
                                {t("panama.residencalAddress")} <span className="text-red-500 font-bold ml-1 flex">*</span>
                            </Label>
                            <Input id="residentialAddress" placeholder="Enter address.." className="w-full" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}  disabled={!canEdit}/>
                        </div>
                        {/* <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm">
                                {t("ApplicantInfoForm.phoneNum")}
                            </Label>
                            <Input
                                id="phoneNum"
                                placeholder="Enter phone number"
                                value={formData.phoneNum}
                                onChange={(e) => setFormData({ ...formData, phoneNum: e.target.value })}
                                required
                                className="w-full"
                            />
                        </div> */}
                        <div className="space-y-2">
                            {!formData.mobileOtpVerified ? (
                                <>
                                    {/* Phone + Send OTP */}
                                    <div className="flex items-end space-x-2">
                                        <div className="flex-1 space-y-1">
                                            <Label htmlFor="phoneNum" className="flex items-center gap-2">
                                                {t("ApplicantInfoForm.phoneNum")}
                                                <span className="text-red-500 font-bold ml-1 flex">*
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-[500px] text-base">
                                                            {t("ApplicantInfoForm.phoneNumInfo")}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </span>
                                            </Label>
                                            <Input
                                                id="phoneNum"
                                                placeholder={t("ApplicantInfoForm.phoneNumInfo")}
                                                value={formData.phoneNum}
                                                onChange={(e) => setFormData({ ...formData, phoneNum: e.target.value })}
                                                required
                                                disabled={formData.mobileOtpVerified || !canEdit}
                                            />
                                        </div>
                                        <Button
                                            size="sm"
                                            type="button"
                                            onClick={handleSendOtp}
                                            disabled={resendTimer > 0}
                                        >
                                            {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Send OTP"}
                                        </Button>
                                    </div>
                                    {/* OTP field */}
                                    {otpSent && (
                                        <div className="flex items-center space-x-2">
                                            <Input
                                                id="otp"
                                                placeholder="OTP"
                                                value={otp}
                                                onChange={e => setOtp(e.target.value)}
                                                className="w-24"
                                            />
                                            <Button size="sm" type="button" onClick={handleVerifyOtp}>
                                                Verify
                                            </Button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-green-600 text-sm flex items-center">
                                    {formData.phoneNum} Phone number verified ✔️
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4 space-y-2">
                                <Label htmlFor="snsPlatform" className="text-sm">
                                    {t("ApplicantInfoForm.snsPlatform")}
                                </Label>
                                <Select
                                    value={formData.snsAccountId.id}
                                    onValueChange={handleSelectChange}
                                    disabled={!canEdit}
                                >
                                    <SelectTrigger id="snsPlatform" className="w-full">
                                        <SelectValue placeholder="Select SNS Platform" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {snsPlatforms.map((platform) => (
                                            <SelectItem key={platform.id} value={platform.id}>
                                                {t(platform.name)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-8 space-y-2">
                                <Label htmlFor="snsAccountId" className="text-sm">
                                    {t('ApplicantInfoForm.snsId')}
                                </Label>
                                <Input
                                    id="snsAccountId"
                                    // placeholder={`Enter your ${snsPlatform ? snsPlatforms.find(p => p.id === snsPlatform)?.name : 'SNS'} ID`}
                                    value={formData.snsAccountId.value || ''}
                                    onChange={handleSNSChange}
                                    className="w-full"
                                    disabled={!canEdit}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default ApplicantInfo