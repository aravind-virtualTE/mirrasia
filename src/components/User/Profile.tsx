/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from "react"
import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  User, Shield, Settings, HelpCircle
} from "lucide-react"
import { delProfileDoc, getUserById, updateProfileData } from "@/services/dataFetch"
import { enable2FA, verify2FA, disable2FA, validateOtpforVerification, sendMobileOtpforVerification } from "@/hooks/useAuth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { toast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { t } from "i18next"
import { KYCVerificationCard } from "./KYCVerificationCard"
import { SettingsCard } from "./SettingsCard"

interface KYCDocument {
  file: File | null
  preview: string | null
  status: "pending" | "uploaded" | "verified" | "rejected"
}

interface TwoFASetup {
  qrCode: string
  secret: string
  backupCodes: string[]
}
export interface OtherDocument {
  id: string;
  file: File | null;
  preview: string;
  url?: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  status: "pending" | "uploaded" | "verified" | "rejected";
}

export default function Profile() {
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null

  // 2FA States
  const [show2FADialog, setShow2FADialog] = useState(false)
  const [twoFASetup, setTwoFASetup] = useState<TwoFASetup | null>(null)
  const [verificationCode, setVerificationCode] = useState("")
  const [twoFALoading, setTwoFALoading] = useState(false)
  const [showDisable2FADialog, setShowDisable2FADialog] = useState(false)
  const [disableCode, setDisableCode] = useState("")

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isWebcamReady, setIsWebcamReady] = useState(false);
  const [facingMode, setFacingMode] = useState('user');
  // console.log("user",user)
  const [profile, setProfile] = useState({
    _id: user?.id || "",
    fullName: user?.fullName || "",
    email: user?.email || "",
    picture: user?.picture || "",
    provider: user?.provider || "",
    phone: user?.phone || "",
    dateOfBirth: user?.dateOfBirth || "",
    address: user?.address || "",
    mobileOtpVerified: user?.mobileOtpVerified || false,
    status: "pending",
    twoFactorEnabled: false,
    kycDocuments: { passportUrl: '', addressProofUrl: '', passportStatus: 'pending', addressProofStatus: 'pending', selfieUrl: '', selfieStatus: 'pending' },
    otherDocuments: []
  })

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  type OtpSession = { sms: string | null; email: string | null };
  const [otpSession, setOtpSession] = useState<OtpSession>({ sms: null, email: null });
  const [nameError, setNameError] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string>("");

  const intialData: { passport: KYCDocument; addressProof: KYCDocument } = {
    passport: {
      file: null,
      preview: null,
      status: "pending",
    },
    addressProof: {
      file: null,
      preview: null,
      status: "pending",
    }
  }
  const hydrateOtherDocuments = (docs: any[] = []) =>
    docs.map((d) => ({
      id: String(d._id),      // IMPORTANT: use Mongo subdoc id
      file: null,
      preview: d.url || "",
      url: d.url || "",
      name: d.name || "Document",
      size: Number(d.size || 0),
      type: d.type || "application/octet-stream",
      uploadedAt: d.uploadedAt ? new Date(d.uploadedAt) : new Date(),
      status: (d.status || "uploaded"),
    }));

  const [kycDocuments, setKycDocuments] = useState<{
    passport: KYCDocument
    addressProof: KYCDocument
  }>(intialData)
  const [otherDocuments, setOtherDocuments] = useState<OtherDocument[]>([]);
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);
  useEffect(() => {
    const fetchdata = async () => {
      const data = await getUserById(user?.id || "")
      // console.log("Fetched User Data:", data)
      setProfile(data)
      setOtherDocuments(hydrateOtherDocuments(data.otherDocuments || []));
    }
    fetchdata()
  }, [])

  // 2FA Setup Process
  const handleEnable2FA = async () => {
    try {
      setTwoFALoading(true)
      const response = await enable2FA(user.id)
      setTwoFASetup(response)
      setShow2FADialog(true)
    } catch (err) {
      console.error('Error enabling 2FA:', err)
      toast({
        title: "Error",
        description: "Failed to setup Two-Factor Authentication. Please try again.",
        variant: "destructive",
      })
    } finally {
      setTwoFALoading(false)
    }
  }

  const handleVerify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a valid 6-digit code.",
        variant: "destructive",
      })
      return
    }

    try {
      setTwoFALoading(true)
      const response = await verify2FA(user.id, verificationCode)

      if (response.success) {
        setProfile(prev => ({ ...prev, twoFactorEnabled: true }))
        setShow2FADialog(false)
        setVerificationCode("")
        toast({
          title: "Success",
          description: "Two-Factor Authentication has been enabled successfully!",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "Invalid verification code. Please try again.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error('Error verifying 2FA:', err)
      toast({
        title: "Error",
        description: "Failed to verify Two-Factor Authentication code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setTwoFALoading(false)
    }
  }

  const handleDisable2FA = async () => {
    if (!disableCode || disableCode.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a valid 6-digit code.",
        variant: "destructive",
      })
      return
    }

    try {
      setTwoFALoading(true)
      const response = await disable2FA(user.id, disableCode)

      if (response.success) {
        setProfile(prev => ({ ...prev, twoFactorEnabled: false }))
        setShowDisable2FADialog(false)
        toast({
          title: "Success",
          description: "Two-Factor Authentication has been disabled.",
          variant: "destructive",
        })
        setDisableCode("")
      } else {
        toast({
          title: "Error",
          description: "Invalid verification code. Please try again.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error('Error disabling 2FA:', err)
      toast({
        title: "Error",
        description: "Failed to disable Two-Factor Authentication. Please try again.",
        variant: "destructive",
      })
    } finally {
      setTwoFALoading(false)
    }
  }

  const handleFileUpload = (documentType: "passport" | "addressProof", file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB.",
        variant: "destructive",
      })
      return
    }

    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Only JPEG, PNG, and PDF files are allowed.",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setKycDocuments((prev) => ({
        ...prev,
        [documentType]: {
          file,
          preview: e.target?.result as string,
          status: "uploaded",
        },
      }))
    }
    reader.readAsDataURL(file)
  }

  const removeDocument = (documentType: "passport" | "addressProof" | "selfie") => {
    setKycDocuments((prev) => ({
      ...prev,
      [documentType]: {
        file: null,
        preview: null,
        status: "pending",
      },
    }))
  }

  const handleAddOtherDocuments = (files: File[]) => {
    const newDocs: OtherDocument[] = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date(),
      status: "uploaded" as const,
    }));
    setOtherDocuments((prev) => [...prev, ...newDocs]);
  };

  const handleRemoveOtherDocument = async (docId: string) => {
    const doc = otherDocuments.find((d) => d.id === docId);
    if (!doc) return;

    // 1) Local-only doc (not uploaded yet)
    if (doc.file) {
      setOtherDocuments((prev) => {
        const target = prev.find((d) => d.id === docId);
        if (target?.preview) URL.revokeObjectURL(target.preview);
        return prev.filter((d) => d.id !== docId);
      });
      return;
    }

    // 2) Uploaded doc: delete from backend
    if (doc.url) {
      try {
        const result = await delProfileDoc(profile._id, doc.url, `other:${doc.id}`);

        if (result?.success) {
          setProfile(result.result);

          // If you hydrate otherDocuments state from profile, re-hydrate:
          // setOtherDocuments(hydrateOtherDocuments(result.result.otherDocuments || []));

          // Or just remove from state directly:
          setOtherDocuments((prev) => prev.filter((d) => d.id !== docId));

          toast({
            title: "Success",
            description: "Successfully deleted file.",
          });
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to delete file.",
          variant: "destructive",
        });
      }
    }
  };


  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)

      const formData = new FormData();
      formData.append("fullName", profile.fullName);
      formData.append("dateOfBirth", profile.dateOfBirth);
      formData.append("address", profile.address);
      formData.append("phone", profile.phone);
      formData.append("mobileOtpVerified", profile.mobileOtpVerified);

      if (kycDocuments.passport.file) {
        formData.append("passport", kycDocuments.passport.file);
      }
      if (kycDocuments.addressProof.file) {
        formData.append("addressProof", kycDocuments.addressProof.file);
      }
      if (capturedImage) formData.append("selfie", capturedImage);

      otherDocuments.forEach((doc) => {
        if (doc.file) formData.append("otherDocuments", doc.file);
      });

      const result = await updateProfileData(formData, user.id)
      setProfile(result.updatedUser)
      // console.log("Profile Update Data:", result)
      setKycDocuments(intialData)
      setOtherDocuments(hydrateOtherDocuments(result.updatedUser.otherDocuments || []));
      setEditing(false)
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      })

    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }
  const handleDeleteDocument = async (url: string, id: string, type: string) => {
    // Mimic API delay
    const result = await delProfileDoc(id, url, type)
    // console.log("delProfileDoc------------------->", result)
    if (result) {
      setProfile(result.result)
      toast({
        title: "Success",
        description: "Successfully deleted file.",
        variant: "destructive",
      })
    }
    // console.log(`Deleting ${url}...`, id, result)
  }

  const handleWebcamReady = useCallback(() => {
    setIsWebcamReady(true);
  }, []);

  const handleWebcamError = useCallback((error: any) => {
    toast({
      title: "Error",
      description: 'Failed to access camera. Please check permissions.',
      variant: "destructive",
    })
    console.error('Webcam error:', error);
  }, []);

  // Webcam functions are handled in KYCVerificationCard
  const capture = useCallback(() => {
    // Implementation in KYCVerificationCard component
  }, []);

  const retake = () => {
    setCapturedImage(null);
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    setIsWebcamReady(false);
  };

  const handleSendOtp = async () => {
    if (!profile.phone) {
      toast({
        title: "Missing Number",
        description: "Phone Number is required",
        variant: "default"
      })
      return;
    }
    const data = {
      phoneNum: profile.phone,
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
      setProfile({ ...profile, mobileOtpVerified: true })
      setOtpSession((s) => ({ ...s, sms: null }));
    } else {
      toast({
        title: "Error",
        description: "Invalid OTP",
        variant: "destructive"
      })
    }
  };
  const isEnglishName = (val: string) => {
    // Letters, spaces, period, apostrophe, hyphen; ASCII only
    // At least 2 letters overall
    if (!val) return false;
    if (!/^[A-Za-z .'-]+$/.test(val)) return false;
    // require at least 2 letters to avoid "." etc.
    const letters = val.replace(/[^A-Za-z]/g, "");
    return letters.length >= 2;
  };

  const isValidIntlPhone = (val: string) => {
    if (!val) return false;
    // quick normalize
    const cleaned = val.replace(/\s|-/g, "");
    // if starts with +, next digit cannot be 0
    if (/^\+0/.test(cleaned)) return false;
    // if no +, first digit cannot be 0
    if (!cleaned.startsWith("+") && cleaned.startsWith("0")) return false;

    // Accept +<country><number> where first numeric char is 1-9
    // and total digits (without +) between 8 and 15 (typical E.164 range)
    const digitsOnly = cleaned.replace(/^\+/, "");
    if (!/^[1-9][0-9]{7,14}$/.test(digitsOnly)) return false;

    return true;
  };

  return (
    <div className="container max-w-8xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account information and security settings</p>
        </div>
      </div>
      <Tabs defaultValue="profile" className="w-full">
        <div className="flex w-full items-start mb-8">
          {/* Left: Tabs */}
          <TabsList className="grid grid-cols-3 max-w-md">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="verification">
              <Shield className="h-4 w-4 mr-2" />
              Verification
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {!editing ? (
            <Button
              onClick={() => setEditing(true)}
              variant="outline"
              className="ml-auto"
            >
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2 ml-auto">
              <Button type="submit" disabled={loading} onClick={handleProfileUpdate}>
                {loading ? "Saving..." : "Save"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditing(false)}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
        <TabsContent value="profile">
          <div className="grid gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <CardTitle>Personal Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-6 mb-6">
                  {profile.picture && (
                    <img
                      src={profile.picture || "/placeholder.svg"}
                      alt={profile.fullName}
                      className="h-20 w-20 rounded-full border-2 border-gray-200 object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold">{profile.fullName}</h2>
                    <p className="text-gray-600">{profile.email}</p>
                    <p className="text-sm text-gray-500 mt-1">Signed in with {profile.provider}</p>
                  </div>

                </div>

                {editing ? (
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Full name */}
                      <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={profile.fullName}
                          onChange={(e) => {
                            const next = e.target.value;
                            setProfile({ ...profile, fullName: next });
                            if (!isEnglishName(next)) {
                              setNameError("Please enter your name in English letters only (A–Z, space, . ' -).");
                            } else {
                              setNameError("");
                            }
                          }}
                          onBlur={(e) => {
                            const next = e.target.value.trim();
                            if (!isEnglishName(next)) {
                              setNameError("Please enter your name in English letters only (A–Z, space, . ' -).");
                            } else {
                              setNameError("");
                            }
                          }}
                          inputMode="text"
                          aria-invalid={!!nameError}
                          aria-describedby="fullName-error"
                          required
                        />
                        {nameError ? (
                          <p id="fullName-error" className="text-sm text-red-600 mt-1">{nameError}</p>
                        ) : null}
                      </div>

                      {/* Date of birth */}
                      <div>
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={profile.dateOfBirth}
                          onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={profile.email} disabled className="bg-gray-50" />
                      </div>

                      {/* Address */}
                      <div>
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          value={profile.address}
                          onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                          placeholder="Enter your full address"
                        />
                      </div>

                      {/* Phone + OTP block (full width to avoid grid misalignment when OTP opens) */}
                      <div className="md:col-span-2">
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="phoneNum" className="flex items-center gap-2">
                            {t("ApplicantInfoForm.phoneNum")}
                            <span className="text-red-500 font-bold ml-1 flex">
                              *
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

                          {/* Phone + Send OTP button (responsive: inline on md+, stacked on mobile) */}
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Input
                              id="phoneNum"
                              placeholder={t("ApplicantInfoForm.phoneNumInfo")}
                              value={profile.phone}
                              onChange={(e) => {
                                // strip spaces and dashes for cleanliness as user types
                                const raw = e.target.value.replace(/[\s-]+/g, "");
                                setProfile({ ...profile, phone: raw });

                                if (!isValidIntlPhone(raw)) {
                                  setPhoneError("Enter a valid international number. It must not start with 0 (e.g., +85212345678).");
                                } else {
                                  setPhoneError("");
                                }
                              }}
                              onBlur={(e) => {
                                const raw = e.target.value.replace(/[\s-]+/g, "");
                                if (!isValidIntlPhone(raw)) {
                                  setPhoneError("Enter a valid international number. It must not start with 0 (e.g., +85212345678).");
                                } else {
                                  setPhoneError("");
                                }
                              }}
                              required
                              disabled={profile.mobileOtpVerified}
                              className="sm:flex-1"
                              inputMode="tel"
                              aria-invalid={!!phoneError}
                              aria-describedby="phone-error"
                            />
                            {phoneError ? (
                              <p id="phone-error" className="text-sm text-red-600 mt-1">{phoneError}</p>
                            ) : null}
                            {!profile.mobileOtpVerified && (
                              <Button
                                size="sm"
                                type="button"
                                onClick={handleSendOtp}
                                disabled={resendTimer > 0 || !profile.phone}
                                aria-live="polite"
                              >
                                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Send OTP"}
                              </Button>
                            )}
                          </div>

                          {/* Verified state */}
                          {profile.mobileOtpVerified && (
                            <div className="text-green-700 text-sm flex items-center gap-2">
                              <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 font-medium ring-1 ring-inset ring-green-600/20">
                                {profile.phone} • Verified
                              </span>
                              <span aria-hidden>✔️</span>
                            </div>
                          )}

                          {/* OTP section (collapsible, no layout jump for the rest of the grid) */}
                          {!profile.mobileOtpVerified && otpSent && (
                            <div
                              className="overflow-hidden transition-all duration-300 ease-out"
                            >
                              <div className="mt-2 grid gap-2 sm:flex sm:items-center">
                                <Input
                                  id="otp"
                                  placeholder="OTP"
                                  value={otp}
                                  onChange={e => setOtp(e.target.value)}
                                  className="w-24"
                                />

                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    type="button"
                                    onClick={handleVerifyOtp}
                                  // disabled={!otp || otp.length < 6}
                                  >
                                    Verify
                                  </Button>
                                  <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    disabled={resendTimer > 0}
                                    className="text-sm underline disabled:no-underline disabled:text-muted-foreground"
                                  >
                                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend code"}
                                  </button>
                                </div>
                              </div>

                              <p className="text-xs text-muted-foreground mt-1">
                                Enter the 6-digit code we sent to <span className="font-medium">{profile.phone}</span>.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </form>

                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Phone:</span>
                      <p className="text-gray-900">{profile.phone || "Not provided"}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Date of Birth:</span>
                      <p className="text-gray-900">{profile.dateOfBirth || "Not provided"}</p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium text-gray-700">Address:</span>
                      <p className="text-gray-900">{profile.address || "Not provided"}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* KYC Verification Card */}
        <TabsContent value="verification" className="space-y-6">
          <KYCVerificationCard
            profile={profile}
            kycDocuments={kycDocuments}
            otherDocuments={otherDocuments}
            capturedImage={capturedImage}
            isWebcamReady={isWebcamReady}
            facingMode={facingMode}
            onFileUpload={handleFileUpload}
            onRemoveDocument={removeDocument}
            onDeleteDocument={handleDeleteDocument}
            onWebcamReady={handleWebcamReady}
            onWebcamError={handleWebcamError}
            onCapture={capture}
            onRetake={retake}
            onSwitchCamera={switchCamera}
            onCapturedImageChange={setCapturedImage}
            onAddOtherDocuments={handleAddOtherDocuments}
            onRemoveOtherDocument={handleRemoveOtherDocument}
          />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsCard
            profile={profile}
            show2FADialog={show2FADialog}
            showDisable2FADialog={showDisable2FADialog}
            twoFASetup={twoFASetup}
            verificationCode={verificationCode}
            disableCode={disableCode}
            twoFALoading={twoFALoading}
            onEnable2FA={handleEnable2FA}
            onVerify2FA={handleVerify2FA}
            onDisable2FA={handleDisable2FA}
            onShow2FADialog={setShow2FADialog}
            onShowDisable2FADialog={setShowDisable2FADialog}
            onVerificationCodeChange={setVerificationCode}
            onDisableCodeChange={setDisableCode}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
