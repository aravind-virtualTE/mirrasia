/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
} from "lucide-react"
import { getUserById, updateProfileData } from "@/services/dataFetch"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {enable2FA, verify2FA, disable2FA, generate2FABackupCodes} from "@/hooks/useAuth"

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
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [twoFALoading, setTwoFALoading] = useState(false)
  const [showDisable2FADialog, setShowDisable2FADialog] = useState(false)
  const [disableCode, setDisableCode] = useState("")

  const [profile, setProfile] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    picture: user?.picture || "",
    provider: user?.provider || "",
    phone: user?.phone || "",
    dateOfBirth: user?.dateOfBirth || "",
    address: user?.address || "",
    status: "pending",
    twoFactorEnabled: false,
    kycDocuments: { passportUrl: '', addressProofUrl: '' }
  })

  const [kycDocuments, setKycDocuments] = useState<{
    passport: KYCDocument
    addressProof: KYCDocument
  }>({
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
  })

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const fetchdata = async () => {
      const data = await getUserById(user?.id || "")
      console.log("Fetched User Data:", data)
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
      setError(null)
    } catch (err) {
      console.error('Error enabling 2FA:', err)
      setError('Failed to setup 2FA. Please try again.')
    } finally {
      setTwoFALoading(false)
    }
  }

  const handleVerify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code')
      return
    }

    try {
      setTwoFALoading(true)
      const response = await verify2FA(user.id, verificationCode)
      
      if (response.success) {
        setProfile(prev => ({ ...prev, twoFactorEnabled: true }))
        setBackupCodes(response.backupCodes)
        setShowBackupCodes(true)
        setShow2FADialog(false)
        setSuccess('Two-Factor Authentication has been enabled successfully!')
        setVerificationCode("")
      } else {
        setError('Invalid verification code. Please try again.')
      }
    } catch (err) {
      console.error('Error verifying 2FA:', err)
      setError('Failed to verify 2FA code. Please try again.')
    } finally {
      setTwoFALoading(false)
    }
  }

  const handleDisable2FA = async () => {
    if (!disableCode || disableCode.length !== 6) {
      setError('Please enter a valid 6-digit code')
      return
    }

    try {
      setTwoFALoading(true)
      const response = await disable2FA(user.id, disableCode)
      
      if (response.success) {
        setProfile(prev => ({ ...prev, twoFactorEnabled: false }))
        setShowDisable2FADialog(false)
        setSuccess('Two-Factor Authentication has been disabled.')
        setDisableCode("")
      } else {
        setError('Invalid verification code. Please try again.')
      }
    } catch (err) {
      console.error('Error disabling 2FA:', err)
      setError('Failed to disable 2FA. Please try again.')
    } finally {
      setTwoFALoading(false)
    }
  }

  const handleGenerateNewBackupCodes = async () => {
    try {
      setTwoFALoading(true)
      const response = await generate2FABackupCodes(user.id)
      console.log("Generated Backup Codes:", response)
      setShowBackupCodes(true)
      setBackupCodes(response.backupCodes)
      setSuccess('New backup codes generated successfully!')
    } catch (err) {
      console.error('Error generating backup codes:', err)
      setError('Failed to generate new backup codes.')
    } finally {
      setTwoFALoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setSuccess('Copied to clipboard!')
    setTimeout(() => setSuccess(null), 2000)
  }

  const copyBackupCodes = () => {
    const codesText = backupCodes.join('\n')
    navigator.clipboard.writeText(codesText)
    setSuccess('Backup codes copied to clipboard!')
    setTimeout(() => setSuccess(null), 2000)
  }

  const handleFileUpload = (documentType: "passport" | "addressProof", file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB")
      return
    }

    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      setError("Only JPEG, PNG, and PDF files are allowed")
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
    setError(null)
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
      console.log("Profile Update Data:", result)

      setEditing(false)
      setError(null)
      setSuccess('Profile updated successfully!')

    } catch (err) {
      console.error(err)
      setError("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  // console.log("backupCodes", backupCodes)
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account information and security settings</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Personal Information Card */}
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
            {!editing && (
              <Button onClick={() => setEditing(true)} variant="outline">
                Edit Profile
              </Button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleProfileUpdate} className="space-y-4">
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

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditing(false)} disabled={loading}>
                  Cancel
                </Button>
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

      {/* Security Settings Card */}
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
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateNewBackupCodes}
                    disabled={twoFALoading}
                  >
                    New Backup Codes
                  </Button>
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

          {backupCodes.length > 0 && showBackupCodes && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <div className="space-y-2">
                  <p className="font-medium">Save these backup codes in a secure location:</p>
                  <div className="grid grid-cols-2 gap-2 font-mono text-sm bg-white p-3 rounded border">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span>{code}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(code)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyBackupCodes}
                    >
                      Copy All Codes
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBackupCodes(false)}
                    >
                      I've Saved Them
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

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

      {/* KYC Verification Card */}
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
          {profile.kycDocuments.passportUrl && (
            <div>
              <div className="flex items-center justify-between">
                <Label className="mb-2 block">Passport Document</Label>
                <Badge variant={profile.status === "verified" ? "default" : "secondary"}>
                  {profile.status === "verified" && <CheckCircle className="h-3 w-3 mr-1" />}
                  {profile.status === "error" && <Clock className="h-3 w-3 mr-1" />}
                  {profile.status === "Pending" && <AlertCircle className="h-3 w-3 mr-1" />}
                  {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
                </Badge>
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
                <Badge variant={profile.status === "verified" ? "default" : "secondary"}>
                  {profile.status === "verified" && <CheckCircle className="h-3 w-3 mr-1" />}
                  {profile.status === "error" && <Clock className="h-3 w-3 mr-1" />}
                  {profile.status === "Pending" && <AlertCircle className="h-3 w-3 mr-1" />}
                  {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
                </Badge>
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
        </CardContent>
      </Card>
    </div>
  )
}