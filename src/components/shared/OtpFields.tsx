import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { sendEmailOtpforVerification, sendMobileOtpforVerification, validateOtpforVerification } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

// Shared Props Interface
export interface OtpFieldProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    isVerified?: boolean;
    onVerify?: (verified: boolean) => void;
    required?: boolean;
    tooltip?: string;
    disabled?: boolean;
    nameForEmail?: string; 
}

export const EmailOTPField = ({
    id,
    label,
    value,
    onChange,
    isVerified = false,
    onVerify,
    required,
    tooltip,
    disabled,
    nameForEmail
}: OtpFieldProps) => {
    const { t } = useTranslation();
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [resendTimer, setResendTimer] = useState(0);

    useEffect(() => {
        if (resendTimer <= 0) return;
        const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
        return () => clearTimeout(timer);
    }, [resendTimer]);

    const handleSendEmailOtp = async () => {
        if (!value) {
            toast({
                title: "Error",
                description: t("ApplicantInfoForm.emailRequired", "Email is required"),
                variant: "destructive"
            });
            return;
        }

        const data = {
            email: value,
            name: nameForEmail || "Applicant", // API requires name
        };

        if (sessionId) {
            toast({
                title: "Error",
                description: "OTP already sent. Please check your email.",
                variant: "destructive"
            });
            return;
        }

        try {
            const result = await sendEmailOtpforVerification(data);

            if (result.success) {
                setOtpSent(true);
                setResendTimer(60);
                setSessionId(result.id);
                toast({
                    title: "Success",
                    description: "OTP sent successfully",
                });
            } else {
                setOtpSent(false);
                setResendTimer(0);
                setSessionId(null);
                toast({
                    title: "Error",
                    description: "Failed to send OTP. Please try again later.",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "An expected error occurred.",
                variant: "destructive"
            });
        }
    };

    const handleVerifyEmailOtp = async () => {
        if (!otp.trim()) {
            toast({
                title: "Error",
                description: "Please enter OTP",
                variant: "destructive"
            });
            return;
        }
        const data = {
            otp,
            id: sessionId
        };

        try {
            const result = await validateOtpforVerification(data);
            if (result.success) {
                if (onVerify) onVerify(true);
                setSessionId(null);
                setOtpSent(false);
                setOtp("");
            } else {
                toast({
                    title: "Error",
                    description: "Invalid OTP",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Verification failed.",
                variant: "destructive"
            });
        }
    };

    if (isVerified) {
        return (
            <div className="space-y-2">
                {label && (
                    <Label htmlFor={id} className="flex items-center gap-2">
                        {label}
                        {required && <span className="text-destructive font-bold">*</span>}
                    </Label>
                )}
                <div className="flex items-center gap-2 p-2 border rounded-md bg-green-50/50 text-green-700 border-green-200">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">{value}</span>
                    <span className="text-xs ml-auto font-semibold">VERIFIED</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {label && (
                <Label htmlFor={id} className="flex items-center gap-2">
                    {label}
                    {required && <span className="text-destructive font-bold">*</span>}
                    {tooltip && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="max-w-xs">{tooltip}</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                </Label>
            )}

            <div className="flex items-center gap-2">
                <Input
                    id={id}
                    type="email"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Enter email address"
                    disabled={disabled || otpSent || isVerified}
                    className="flex-1"
                />
                <Button
                    type="button"
                    size="sm"
                    onClick={handleSendEmailOtp}
                    disabled={disabled || !value || resendTimer > 0 || isVerified}
                    className="whitespace-nowrap min-w-[100px]"
                >
                    {resendTimer > 0 ? `Resend (${resendTimer}s)` : "Send OTP"}
                </Button>
            </div>

            {/* OTP Input Section */}
            {otpSent && !isVerified && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                    <Input
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-40"
                    />
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleVerifyEmailOtp}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        Verify
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setOtpSent(false);
                            setSessionId(null);
                            setResendTimer(0);
                        }}
                    >
                        Cancel
                    </Button>
                </div>
            )}
        </div>
    );
};


export const MobileOTPField = ({
    id,
    label,
    value,
    onChange,
    isVerified = false,
    onVerify,
    required,
    tooltip,
    disabled,
}: OtpFieldProps) => {
    const { t } = useTranslation();
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [resendTimer, setResendTimer] = useState(0);

    useEffect(() => {
        if (resendTimer <= 0) return;
        const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
        return () => clearTimeout(timer);
    }, [resendTimer]);

    const handleSendMobileOtp = async () => {
        if (!value) {
            toast({
                title: "Error",
                description: t("ApplicantInfoForm.phoneRequired", "Phone number is required"),
                variant: "destructive"
            });
            return;
        }

        if (sessionId) {
            toast({
                title: "Error",
                description: "OTP already sent.",
                variant: "destructive"
            });
            return;
        }

        const data = {
            phoneNum: value,
        };

        try {
            const result = await sendMobileOtpforVerification(data);
            if (result.success) {
                setOtpSent(true);
                setResendTimer(60);
                setSessionId(result.id);
                toast({
                    title: "Success",
                    description: "OTP sent successfully",
                });
            } else {
                setOtpSent(false);
                setResendTimer(0);
                setSessionId(null);
                toast({
                    title: "Error",
                    description: "Failed to send OTP. Please ensure country code is included.",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to send OTP.",
                variant: "destructive"
            });
        }
    };

    const handleVerifyMobileOtp = async () => {
        if (!otp.trim()) {
            toast({
                title: "Error",
                description: "Please enter OTP",
                variant: "destructive"
            });
            return;
        }

        const data = {
            otp,
            id: sessionId
        };

        try {
            const result = await validateOtpforVerification(data);
            if (result.success) {
                if (onVerify) onVerify(true);
                setSessionId(null);
                setOtpSent(false);
                setOtp("");
            } else {
                toast({
                    title: "Error",
                    description: "Invalid OTP",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Verification failed.",
                variant: "destructive"
            });
        }
    };

    if (isVerified) {
        return (
            <div className="space-y-2">
                {label && (
                    <Label htmlFor={id} className="flex items-center gap-2">
                        {label}
                        {required && <span className="text-destructive font-bold">*</span>}
                    </Label>
                )}
                <div className="flex items-center gap-2 p-2 border rounded-md bg-green-50/50 text-green-700 border-green-200">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">{value}</span>
                    <span className="text-xs ml-auto font-semibold">VERIFIED</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {label && (
                <Label htmlFor={id} className="flex items-center gap-2">
                    {label}
                    {required && <span className="text-destructive font-bold">*</span>}
                    {tooltip && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="max-w-xs">{tooltip}</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                </Label>
            )}

            <div className="flex items-center gap-2">
                <Input
                    id={id}
                    type="text" // Phone is text to allow + and spaces
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="e.g. +1 234 567 8900"
                    disabled={disabled || otpSent || isVerified}
                    className="flex-1"
                />
                <Button
                    type="button"
                    size="sm"
                    onClick={handleSendMobileOtp}
                    disabled={disabled || !value || resendTimer > 0 || isVerified}
                    className="whitespace-nowrap min-w-[100px]"
                >
                    {resendTimer > 0 ? `Resend (${resendTimer}s)` : "Send OTP"}
                </Button>
            </div>

            {/* OTP Input Section */}
            {otpSent && !isVerified && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                    <Input
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-40"
                    />
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleVerifyMobileOtp}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        Verify
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setOtpSent(false);
                            setSessionId(null);
                            setResendTimer(0);
                        }}
                    >
                        Cancel
                    </Button>
                </div>
            )}
        </div>
    );
}
