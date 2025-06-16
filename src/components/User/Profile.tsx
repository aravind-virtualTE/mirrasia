/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import {
  User,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  X,
  Shield,
  Smartphone,
  Copy,
  Settings,
} from "lucide-react"
import { delProfileDoc, getUserById, updateProfileData } from "@/services/dataFetch"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { enable2FA, verify2FA, disable2FA } from "@/hooks/useAuth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { toast } from "@/hooks/use-toast"

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
    status: "pending",
    twoFactorEnabled: false,
    kycDocuments: { passportUrl: '', addressProofUrl: '', passportStatus: 'pending', addressProofStatus: 'pending' }
  })
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
    },
  }
  const [kycDocuments, setKycDocuments] = useState<{
    passport: KYCDocument
    addressProof: KYCDocument
  }>(intialData)

  useEffect(() => {
    const fetchdata = async () => {
      const data = await getUserById(user?.id || "")
      // console.log("Fetched User Data:", data)
      setProfile(data)
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
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Success",
      description: "Copied to clipboard!",
      variant: "destructive",
    })
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

  const removeDocument = (documentType: "passport" | "addressProof") => {
    setKycDocuments((prev) => ({
      ...prev,
      [documentType]: {
        file: null,
        preview: null,
        status: "pending",
      },
    }))
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)

      const formData = new FormData();
      formData.append("fullName", profile.fullName);
      formData.append("dateOfBirth", profile.dateOfBirth);
      formData.append("address", profile.address);
      formData.append("phone", profile.phone);

      if (kycDocuments.passport.file) {
        formData.append("passport", kycDocuments.passport.file);
      }
      if (kycDocuments.addressProof.file) {
        formData.append("addressProof", kycDocuments.addressProof.file);
      }

      const result = await updateProfileData(formData, user.id)
      setProfile(result.updatedUser)
      // console.log("Profile Update Data:", result)
      setKycDocuments(intialData)
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
    if(result){
      setProfile(result.result)
      toast({
        title: "Success",
        description: "Successfully deleted file.",
        variant: "destructive",
      })
    }
    // console.log(`Deleting ${url}...`, id, result)
  }
  // console.log("profile", profile)
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

          {/* Right: Button(s) */}
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
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={profile.fullName}
                          onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={profile.dateOfBirth}
                          onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={profile.email} disabled className="bg-gray-50" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={profile.address}
                        onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                        placeholder="Enter your full address"
                      />
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
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  <div>
                    <CardTitle>KYC Verification</CardTitle>
                    <CardDescription>Upload required documents for identity verification</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Existing KYC content remains the same */}
              <Tabs defaultValue="documents" className="w-full">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="selfie">Selfie Verification</TabsTrigger>
                </TabsList>
                <TabsContent value="documents" className="space-y-6">
                  {/* Passport Document Section */}
                  {profile.kycDocuments.passportUrl && (
                    <div>
                      <div className="flex items-center justify-between">
                        <Label className="mb-2 block">Passport Document</Label>
                        <div className="flex items-center space-x-2">
                          <Badge variant={profile.kycDocuments.passportStatus === "accepted" ? "default" : "secondary"}>
                            {profile.kycDocuments.passportStatus === "accepted" && <CheckCircle className="h-3 w-3 mr-1" />}
                            {profile.kycDocuments.passportStatus === "rejected" && <Clock className="h-3 w-3 mr-1" />}
                            {profile.kycDocuments.passportStatus === "pending" && <AlertCircle className="h-3 w-3 mr-1" />}
                            {profile.kycDocuments.passportStatus.charAt(0).toUpperCase() + profile.kycDocuments.passportStatus.slice(1)}
                          </Badge>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDeleteDocument(profile.kycDocuments.passportUrl, profile._id, 'passport')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <iframe
                        src={profile.kycDocuments.passportUrl}
                        className="w-full h-96 border"
                        title="Passport Document"
                      />
                    </div>
                  )}
                  {profile.kycDocuments.addressProofUrl && (
                    <div>
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">Address Proof</Label>
                        <div className="flex items-center space-x-2">

                          <Badge variant={profile.kycDocuments.addressProofStatus === "accepted" ? "default" : "secondary"}>
                            {profile.kycDocuments.addressProofStatus === "accepted" && <CheckCircle className="h-3 w-3 mr-1" />}
                            {profile.kycDocuments.addressProofStatus === "rejected" && <Clock className="h-3 w-3 mr-1" />}
                            {profile.kycDocuments.addressProofStatus === "pending" && <AlertCircle className="h-3 w-3 mr-1" />}
                            {profile.kycDocuments.addressProofStatus.charAt(0).toUpperCase() + profile.kycDocuments.addressProofStatus.slice(1)}
                          </Badge>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDeleteDocument(profile.kycDocuments.addressProofUrl, profile._id, 'address')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <iframe
                        src={profile.kycDocuments.addressProofUrl}
                        className="w-full h-96 border"
                        title="Address Proof Document"
                      />
                    </div>
                  )}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">Passport / Government ID</Label>
                    </div>
                    {kycDocuments.passport.preview ? (
                      <div className="flex items-center space-x-3 p-3 border rounded-lg bg-gray-50">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{kycDocuments.passport.file?.name}</p>
                          <p className="text-xs text-gray-500">
                            {kycDocuments.passport.file && (kycDocuments.passport.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => removeDocument("passport")}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">Upload your passport or government ID</p>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleFileUpload("passport", file)
                          }}
                          className="hidden"
                          ref={(input) => {
                            if (input) {
                              (window as any).passportInputRef = input
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const input = (window as any).passportInputRef
                            if (input) input.click()
                          }}
                        >
                          Choose File
                        </Button>
                        <p className="text-xs text-gray-500 mt-2">JPEG, PNG, PDF up to 5MB</p>
                      </div>
                    )}
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">Address Proof</Label>
                    </div>

                    {kycDocuments.addressProof.preview ? (
                      <div className="flex items-center space-x-3 p-3 border rounded-lg bg-gray-50">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{kycDocuments.addressProof.file?.name}</p>
                          <p className="text-xs text-gray-500">
                            {kycDocuments.addressProof.file && (kycDocuments.addressProof.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => removeDocument("addressProof")}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">Upload utility bill, bank statement, or lease agreement</p>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleFileUpload("addressProof", file)
                          }}
                          className="hidden"
                          ref={(input) => {
                            if (input) {
                              (window as any).addressInputRef = input
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const input = (window as any).addressInputRef
                            if (input) input.click()
                          }}
                        >
                          Choose File
                        </Button>
                        <p className="text-xs text-gray-500 mt-2">JPEG, PNG, PDF up to 5MB</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="selfie" className="space-y-6">
                  <div className="space-y-4">
                    <p>selfie</p>
                  </div>
                </TabsContent>
              </Tabs>

            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-600" />
                <div>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your account security and two-factor authentication</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="font-medium">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant={profile.twoFactorEnabled ? "default" : "secondary"}>
                    {profile.twoFactorEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                  {profile.twoFactorEnabled ? (
                    <div className="space-x-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowDisable2FADialog(true)}
                        disabled={twoFALoading}
                      >
                        Disable
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={handleEnable2FA}
                      disabled={twoFALoading}
                      size="sm"
                    >
                      {twoFALoading ? "Setting up..." : "Enable 2FA"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {/* 2FA Setup Dialog */}
      <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app, then enter the verification code.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {twoFASetup && (
              <>
                <div className="flex justify-center">
                  <img
                    src={twoFASetup.qrCode}
                    alt="2FA QR Code"
                    className="w-48 h-48 border rounded"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Or enter this code manually:</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={twoFASetup.secret}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(twoFASetup.secret)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Enter verification code from your app:</Label>
                  <Input
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleVerify2FA}
                    disabled={twoFALoading || verificationCode.length !== 6}
                    className="flex-1"
                  >
                    {twoFALoading ? "Verifying..." : "Verify & Enable"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShow2FADialog(false)}
                    disabled={twoFALoading}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Disable 2FA Dialog */}
      <Dialog open={showDisable2FADialog} onOpenChange={setShowDisable2FADialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter a verification code from your authenticator app to disable 2FA.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Verification Code:</Label>
              <Input
                placeholder="000000"
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant="destructive"
                onClick={handleDisable2FA}
                disabled={twoFALoading || disableCode.length !== 6}
                className="flex-1"
              >
                {twoFALoading ? "Disabling..." : "Disable 2FA"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDisable2FADialog(false)}
                disabled={twoFALoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}