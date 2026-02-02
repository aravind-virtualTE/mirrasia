/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { User, Shield, LayoutDashboard, ShieldCheck, Lock, HelpCircle } from "lucide-react"
import { delProfileDoc, getUserById, updateProfileData } from "@/services/dataFetch"
import {
  enable2FA,
  verify2FA,
  disable2FA,
  validateOtpforVerification,
  sendMobileOtpforVerification,
} from "@/hooks/useAuth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { toast } from "@/hooks/use-toast"
import { KYCVerificationCard } from "./KYCVerificationCard"
import { SettingsCard } from "./SettingsCard"
import { useTranslation } from "react-i18next"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"

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
  id: string
  file: File | null
  preview: string
  url?: string
  name: string
  size: number
  type: string
  uploadedAt: Date
  status: "pending" | "uploaded" | "verified" | "rejected"
}

export default function Profile() {
  const [loading, setLoading] = useState(false)
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") as string)
    : null
  const { t } = useTranslation()

  // 2FA States
  const [show2FADialog, setShow2FADialog] = useState(false)
  const [twoFASetup, setTwoFASetup] = useState<TwoFASetup | null>(null)
  const [verificationCode, setVerificationCode] = useState("")
  const [twoFALoading, setTwoFALoading] = useState(false)
  const [showDisable2FADialog, setShowDisable2FADialog] = useState(false)
  const [disableCode, setDisableCode] = useState("")

  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isWebcamReady, setIsWebcamReady] = useState(false)
  const [facingMode, setFacingMode] = useState("user")

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
    kycDocuments: {
      passportUrl: "",
      addressProofUrl: "",
      passportStatus: "pending",
      addressProofStatus: "pending",
      selfieUrl: "",
      selfieStatus: "pending",
    },
    otherDocuments: [],
  })

  // OTP and Documents State
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  type OtpSession = { sms: string | null; email: string | null }
  const [otpSession, setOtpSession] = useState<OtpSession>({ sms: null, email: null })
  const [nameError, setNameError] = useState<string>("")
  const [phoneError, setPhoneError] = useState<string>("")

  const initialData: { passport: KYCDocument; addressProof: KYCDocument } = {
    passport: { file: null, preview: null, status: "pending" },
    addressProof: { file: null, preview: null, status: "pending" },
  }

  const hydrateOtherDocuments = (docs: any[] = []) =>
    docs.map((d) => ({
      id: String(d._id),
      file: null,
      preview: d.url || "",
      url: d.url || "",
      name: d.name || "Document",
      size: Number(d.size || 0),
      type: d.type || "application/octet-stream",
      uploadedAt: d.uploadedAt ? new Date(d.uploadedAt) : new Date(),
      status: d.status || "uploaded",
    }))

  const [kycDocuments, setKycDocuments] = useState<{
    passport: KYCDocument
    addressProof: KYCDocument
  }>(initialData)

  const [otherDocuments, setOtherDocuments] = useState<OtherDocument[]>([])

  const [activeSection, setActiveSection] = useState("overview")

  // Local draft state for editing
  const [draftProfile, setDraftProfile] = useState({ ...profile })

  // Derived "Smart Save" state
  const isDirty =
    draftProfile.fullName !== profile.fullName ||
    draftProfile.phone !== profile.phone ||
    draftProfile.address !== profile.address ||
    draftProfile.dateOfBirth !== profile.dateOfBirth ||
    draftProfile.mobileOtpVerified !== profile.mobileOtpVerified ||
    kycDocuments.passport.file !== null ||
    kycDocuments.addressProof.file !== null ||
    otherDocuments.some((d) => d.file !== null)

  // Effects
  useEffect(() => {
    if (resendTimer <= 0) return
    const timer = setTimeout(() => setResendTimer((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendTimer])

  useEffect(() => {
    const fetchdata = async () => {
      const data = await getUserById(user?.id || "")
      setProfile(data)
      setOtherDocuments(hydrateOtherDocuments(data.otherDocuments || []))
    }
    fetchdata()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ✅ Sync draft when server profile loads/changes (including mobileOtpVerified)
  useEffect(() => {
    setDraftProfile(profile)
  }, [
    profile.fullName,
    profile.phone,
    profile.address,
    profile.dateOfBirth,
    profile.mobileOtpVerified,
  ])

  const isEnglishName = (val: string) => {
    if (!val) return false
    if (!/^[A-Za-z .'-]+$/.test(val)) return false
    const letters = val.replace(/[^A-Za-z]/g, "")
    return letters.length >= 2
  }

  const isValidIntlPhone = (val: string) => {
    if (!val) return false
    const cleaned = val.replace(/\s|-/g, "")
    if (/^\+0/.test(cleaned)) return false
    if (!cleaned.startsWith("+") && cleaned.startsWith("0")) return false
    const digitsOnly = cleaned.replace(/^\+/, "")
    if (!/^[1-9][0-9]{7,14}$/.test(digitsOnly)) return false
    return true
  }

  const resetOtpUi = () => {
    setOtp("")
    setOtpSent(false)
    setResendTimer(0)
    setOtpSession((s) => ({ ...s, sms: null }))
  }

  const handleFieldChange = (field: string, value: any) => {
    const updated = { ...draftProfile, [field]: value }

    // ✅ If phone changes, reset verification + OTP UI/session
    if (field === "phone") {
      updated.mobileOtpVerified = false
      resetOtpUi()
    }

    setDraftProfile(updated)

    // Validation logic
    if (field === "fullName") {
      if (!isEnglishName(value)) setNameError(t("userProfile.messages.nameError"))
      else setNameError("")
    }

    if (field === "phone") {
      const raw = String(value).replace(/[\s-]+/g, "")
      if (!isValidIntlPhone(raw)) setPhoneError(t("userProfile.messages.phoneError"))
      else setPhoneError("")
    }
  }

  const handleDiscardChanges = () => {
    setDraftProfile(profile)
    setKycDocuments(initialData)
    setOtherDocuments(hydrateOtherDocuments(profile.otherDocuments || []))
    resetOtpUi()
    toast({ title: t("info"), description: "Changes discarded" })
  }

  // Submit Handler (Smart Save)
  const handleSmartSave = async () => {
    try {
      setLoading(true)

      const formData = new FormData()
      formData.append("fullName", draftProfile.fullName)
      formData.append("dateOfBirth", draftProfile.dateOfBirth)
      formData.append("address", draftProfile.address)
      formData.append("phone", draftProfile.phone)
      formData.append("mobileOtpVerified", String(draftProfile.mobileOtpVerified))

      // Append KYC Documents
      if (kycDocuments.passport.file) formData.append("passport", kycDocuments.passport.file)
      if (kycDocuments.addressProof.file) formData.append("addressProof", kycDocuments.addressProof.file)

      // Append Other Documents
      otherDocuments.forEach((doc) => {
        if (doc.file) formData.append("otherDocuments", doc.file)
      })

      const result = await updateProfileData(formData, user.id)

      setProfile(result.updatedUser)
      setDraftProfile(result.updatedUser)

      // Reset local file states
      setKycDocuments(initialData)
      setOtherDocuments(hydrateOtherDocuments(result.updatedUser.otherDocuments || []))

      toast({
        title: t("success"),
        description: t("userProfile.messages.profileUpdated"),
      })
    } catch (err) {
      console.error(err)
      toast({
        title: t("error"),
        description: t("userProfile.messages.profileUpdateError"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // 2FA Handlers
  const handleEnable2FA = async () => {
    try {
      setTwoFALoading(true)
      const response = await enable2FA(user.id)
      setTwoFASetup(response)
      setShow2FADialog(true)
    } catch (err) {
      console.error("Error enabling 2FA:", err)
      toast({
        title: t("error"),
        description: t("userProfile.messages.twoFactorSetupError"),
        variant: "destructive",
      })
    } finally {
      setTwoFALoading(false)
    }
  }

  const handleVerify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: t("error"),
        description: t("userProfile.messages.validCodeRequired"),
        variant: "destructive",
      })
      return
    }
    try {
      setTwoFALoading(true)
      const response = await verify2FA(user.id, verificationCode)
      if (response.success) {
        setProfile((prev) => ({ ...prev, twoFactorEnabled: true }))
        setShow2FADialog(false)
        setVerificationCode("")
        toast({ title: t("success"), description: t("userProfile.messages.twoFactorEnabled") })
      } else {
        toast({
          title: t("error"),
          description: t("messages.invalidCode"),
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error verifying 2FA:", err)
      toast({
        title: t("error"),
        description: t("userProfile.messages.twoFactorVerifyError"),
        variant: "destructive",
      })
    } finally {
      setTwoFALoading(false)
    }
  }

  const handleDisable2FA = async () => {
    if (!disableCode || disableCode.length !== 6) {
      toast({
        title: t("error"),
        description: t("userProfile.messages.validCodeRequired"),
        variant: "destructive",
      })
      return
    }
    try {
      setTwoFALoading(true)
      const response = await disable2FA(user.id, disableCode)
      if (response.success) {
        setProfile((prev) => ({ ...prev, twoFactorEnabled: false }))
        setShowDisable2FADialog(false)
        setDisableCode("")
        toast({ title: t("success"), description: t("userProfile.messages.twoFactorDisabled") })
      } else {
        toast({ title: "Error", description: "Invalid verification code. Please try again.", variant: "destructive" })
      }
    } catch (err) {
      console.error("Error disabling 2FA:", err)
      toast({
        title: t("error"),
        description: t("userProfile.messages.twoFactorDisableError"),
        variant: "destructive",
      })
    } finally {
      setTwoFALoading(false)
    }
  }

  // Document Handlers
  const handleFileUpload = (documentType: "passport" | "addressProof", file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: t("error"), description: t("userProfile.messages.fileSizeError"), variant: "destructive" })
      return
    }
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      toast({ title: t("error"), description: t("userProfile.messages.fileTypeError"), variant: "destructive" })
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      setKycDocuments((prev) => ({
        ...prev,
        [documentType]: { file, preview: e.target?.result as string, status: "uploaded" },
      }))
    }
    reader.readAsDataURL(file)
  }

  const removeDocument = (documentType: "passport" | "addressProof" | "selfie") => {
    setKycDocuments((prev) => ({
      ...prev,
      [documentType]: { file: null, preview: null, status: "pending" },
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
    }))
    setOtherDocuments((prev) => [...prev, ...newDocs])
  }

  const handleRemoveOtherDocument = async (docId: string) => {
    const doc = otherDocuments.find((d) => d.id === docId)
    if (!doc) return

    if (doc.file) {
      setOtherDocuments((prev) => {
        const target = prev.find((d) => d.id === docId)
        if (target?.preview) URL.revokeObjectURL(target.preview)
        return prev.filter((d) => d.id !== docId)
      })
      return
    }

    if (doc.url) {
      try {
        const result = await delProfileDoc(profile._id, doc.url, `other:${doc.id}`)
        if (result?.success) {
          setProfile(result.result)
          setOtherDocuments((prev) => prev.filter((d) => d.id !== docId))
          toast({ title: t("success"), description: t("userProfile.messages.deleteSuccess") })
        }
      } catch (err) {
        console.log("err", err)
        toast({ title: t("error"), description: t("userProfile.messages.deleteError"), variant: "destructive" })
      }
    }
  }

  const handleDeleteDocument = async (url: string, id: string, type: string) => {
    const result = await delProfileDoc(id, url, type)
    if (result) {
      setProfile(result.result)
      toast({ title: t("success"), description: t("userProfile.messages.deleteSuccess") })
    }
  }

  // Webcam Handlers
  const handleWebcamReady = useCallback(() => setIsWebcamReady(true), [])
  const handleWebcamError = useCallback(
    (error: any) => {
      toast({ title: t("error"), description: t("userProfile.messages.cameraError"), variant: "destructive" })
      console.error("Webcam error:", error)
    },
    [t]
  )
  const capture = useCallback(() => { }, []) // Placeholder
  const retake = () => setCapturedImage(null)
  const switchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"))
    setIsWebcamReady(false)
  }

  // OTP Handlers
  const handleSendOtp = async () => {
    if (!draftProfile.phone) {
      toast({
        title: t("error"),
        description: t("userProfile.messages.phoneRequired"),
        variant: "destructive",
      })
      return
    }

    if (!phoneError) {
      toast({
        title: t("error"),
        description: t("userProfile.messages.phoneError"),
        variant: "destructive",
      })
      return
    }

    // ✅ Block only while timer running (allow resend after timer ends)
    if (resendTimer > 0) return

    try {
      const data = { phoneNum: draftProfile.phone }
      const result = await sendMobileOtpforVerification(data)

      if (result.success) {
        setOtpSent(true)
        setResendTimer(60)
        setOtpSession((s) => ({ ...s, sms: result.id })) // overwrite session id
        toast({ title: t("success"), description: t("userProfile.messages.otpSent") })
      } else {
        setOtpSent(false)
        setResendTimer(0)
        setOtpSession((s) => ({ ...s, sms: null }))
        toast({
          title: t("error"),
          description: t("userProfile.messages.otpSendError"),
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error(err)
      toast({
        title: t("error"),
        description: t("userProfile.messages.otpSendError"),
        variant: "destructive",
      })
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      toast({ title: t("error"), description: t("userProfile.messages.otpRequired"), variant: "destructive" })
      return
    }
    if (!otpSession.sms) {
      toast({
        title: t("error"),
        description: t("userProfile.messages.otpSendError"),
        variant: "destructive",
      })
      return
    }

    const data = { otp, id: otpSession.sms }
    const result = await validateOtpforVerification(data)

    if (result.success) {
      // ✅ Update draft, close verify box instantly
      setDraftProfile((prev) => ({ ...prev, mobileOtpVerified: true }))
      resetOtpUi()

      toast({ title: t("success"), description: t("userProfile.messages.otpVerified") })
    } else {
      toast({
        title: t("error"),
        description: t("userProfile.messages.otpVerifyError"),
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
        {/* Sticky Header */}
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container max-w-7xl mx-auto px-4 md:px-8 py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{t("userProfile.title")}</h1>
                <p className="text-muted-foreground mt-1">{t("userProfile.subtitle")}</p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDiscardChanges}
                  disabled={!isDirty || loading}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  Discard
                </Button>
                <Button
                  size="sm"
                  onClick={handleSmartSave}
                  disabled={!isDirty || loading}
                  className={`rounded-full px-6 shadow-sm transition-all ${isDirty ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                >
                  {loading ? t("userProfile.actions.saving") : t("userProfile.actions.save")}
                </Button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="mt-6">
              <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b rounded-none gap-2 sm:gap-6 overflow-x-auto no-scrollbar">
                <TabsTrigger
                  value="overview"
                  className="px-4 py-2 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none transition-all"
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  {t("userProfile.tabs.overview", "Overview")}
                </TabsTrigger>
                <TabsTrigger
                  value="personal"
                  className="px-4 py-2 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none transition-all"
                >
                  <User className="w-4 h-4 mr-2" />
                  {t("userProfile.tabs.profile")}
                </TabsTrigger>
                <TabsTrigger
                  value="verification"
                  className="px-4 py-2 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none transition-all"
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  {t("userProfile.tabs.verification")}
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="px-4 py-2 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none transition-all"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {t("userProfile.tabs.settings")}
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="container max-w-7xl mx-auto px-4 md:px-8 pt-8">
          <TabsContent value="overview" className="mt-0 space-y-6">
            <div className="grid gap-6">
              {/* Welcome Card */}
              <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
                <CardHeader>
                  <CardTitle className="gradient-text text-2xl">
                    Welcome back, {profile.fullName.split(" ")[0]}!
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-300">
                        <Shield className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-medium">
                          Account Status: <span className="capitalize">{profile.status}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Complete your KYC verification to utilize app features.
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t md:border-t-0 md:border-l pt-6 md:pt-0 md:pl-6 w-full">
                      <div className="space-y-1">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px]">
                            1
                          </span>
                          Profile
                        </h4>
                        <p className="text-[11px] text-muted-foreground leading-tight">
                          Update your personal and contact details.
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px]">
                            2
                          </span>
                          Documents
                        </h4>
                        <p className="text-[11px] text-muted-foreground leading-tight">
                          Upload Passport and Proof of Address.
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px]">
                            3
                          </span>
                          Verification
                        </h4>
                        <p className="text-[11px] text-muted-foreground leading-tight">
                          Selfie identity check.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="personal" className="mt-0">
            <Card className="border-0 shadow-sm ring-1 ring-border/50">
              <CardHeader>
                <CardTitle>{t("userProfile.personalInfo.title")}</CardTitle>
                <CardDescription>Manage your personal details and contact info.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-6 pb-6 border-b">
                  <img
                    src={profile.picture || "/placeholder.svg"}
                    alt="Avatar"
                    className="w-20 h-20 rounded-full ring-4 ring-muted"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{profile.fullName}</h3>
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>{t("userProfile.personalInfo.fullName")}</Label>
                    <Input
                      value={draftProfile.fullName}
                      onChange={(e) => handleFieldChange("fullName", e.target.value)}
                      className={`transition-all focus:ring-2 focus:ring-primary/20 ${nameError ? "border-red-500" : ""
                        }`}
                    />
                    {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>{t("userProfile.personalInfo.dob")}</Label>
                    <Input
                      type="date"
                      value={draftProfile.dateOfBirth}
                      onChange={(e) => handleFieldChange("dateOfBirth", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t("userProfile.personalInfo.email")}</Label>
                    <Input value={draftProfile.email} disabled className="bg-muted/50" />
                    <p className="text-[10px] text-muted-foreground">Email cannot be changed.</p>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("userProfile.personalInfo.address")}</Label>
                    <Input
                      value={draftProfile.address}
                      onChange={(e) => handleFieldChange("address", e.target.value)}
                      placeholder="Full residential address"
                    />
                  </div>

                  {/* Phone + OTP */}
                  <div className="md:col-span-2 space-y-2">
                    <Label className="flex items-center gap-2">
                      {t("ApplicantInfoForm.phoneNum")}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[300px]">
                          {t("ApplicantInfoForm.phoneNumInfo")}
                        </TooltipContent>
                      </Tooltip>
                    </Label>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        value={draftProfile.phone}
                        onChange={(e) => handleFieldChange("phone", e.target.value)}
                        // ✅ key UI off draft (so verification updates instantly)
                        disabled={draftProfile.mobileOtpVerified}
                        className={`flex-1 ${phoneError ? "border-red-500" : ""}`}
                        inputMode="tel"
                      />

                      {!draftProfile.mobileOtpVerified && (
                        <Button
                          onClick={handleSendOtp}
                          variant="secondary"
                          size="sm"
                          disabled={resendTimer > 0 || !draftProfile.phone || !!phoneError}
                        >
                          {resendTimer > 0
                            ? t("userProfile.actions.resendIn", { seconds: resendTimer })
                            : t("userProfile.actions.verify")}
                        </Button>
                      )}
                    </div>

                    {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}

                    {draftProfile.mobileOtpVerified && (
                      <div className="flex items-center gap-2 text-green-600 text-sm font-medium mt-1">
                        <ShieldCheck className="w-4 h-4" />
                        {t("userProfile.personalInfo.verified")}
                      </div>
                    )}

                    {!draftProfile.mobileOtpVerified && otpSent && (
                      <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10 animate-in fade-in slide-in-from-top-2">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">
                          Enter Verification Code
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="6-digit code"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="max-w-[150px] font-mono text-center tracking-[0.2em]"
                            maxLength={6}
                          />
                          <Button onClick={handleVerifyOtp} size="sm" className="px-6">
                            {t("userProfile.actions.verify")}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSendOtp}
                            disabled={resendTimer > 0}
                            className="text-xs"
                          >
                            {resendTimer > 0
                              ? t("userProfile.actions.resendIn", { seconds: resendTimer })
                              : t("userProfile.actions.resend")}
                          </Button>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-3">
                          {t("userProfile.messages.otpVerifyInstruction", { phone: draftProfile.phone })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verification" className="mt-0">
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

          <TabsContent value="security" className="mt-0">
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
        </main>
      </Tabs>
    </div>
  )
}
