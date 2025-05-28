/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
// import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, FileText, Upload, CheckCircle, AlertCircle, Clock, X } from "lucide-react"
import { getUserById, updateProfileData } from "@/services/dataFetch"

interface KYCDocument {
  file: File | null
  preview: string | null
  status: "pending" | "uploaded" | "verified" | "rejected"
}

export default function Profile() {
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null
  const [profile, setProfile] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    picture: user?.picture || "",
    provider: user?.provider || "",
    phone: user?.phone || "",
    dateOfBirth: user?.dateOfBirth || "",
    address: user?.address || "",
    status: "pending",
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

  useEffect(() => {
    const fetchdata = async () => {
      const data = await getUserById(user?.id || "")
      console.log("Fetched User Data:", data)
      setProfile(data)
    }
    fetchdata()
  }, [])

  // Calculate KYC completion percentage
  // const kycProgress = () => {
  //   let completed = 0
  //   if (kycDocuments.passport.status === "verified") completed += 50
  //   if (kycDocuments.addressProof.status === "verified") completed += 50
  //   return completed
  // }

  // const getKycStatus = () => {
  //   const progress = kycProgress()
  //   if (progress === 100) return { status: "verified", label: "Verified", color: "bg-green-500" }
  //   if (progress > 0) return { status: "partial", label: "In Progress", color: "bg-yellow-500" }
  //   return { status: "pending", label: "Pending", color: "bg-gray-500" }
  // }

  const handleFileUpload = (documentType: "passport" | "addressProof", file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
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

      // IMPORTANT: Field names must match multer.fields()
      if (kycDocuments.passport.file) {
        formData.append("passport", kycDocuments.passport.file);
      }
      if (kycDocuments.addressProof.file) {
        formData.append("addressProof", kycDocuments.addressProof.file);
      }
      console.log("Profile Update Data:", formData)
      const result = await updateProfileData(formData, user.id)
      console.log("Profile Update Data:", result)

      // await new Promise((resolve) => setTimeout(resolve, 2000))

      setEditing(false)
      setError(null)

      // Update document status to simulate verification process
      // setKycDocuments((prev) => ({
      //   passport: prev.passport.file ? { ...prev.passport, status: "verified" } : prev.passport,
      //   addressProof: prev.addressProof.file ? { ...prev.addressProof, status: "verified" } : prev.addressProof,
      // }))
    } catch (err) {
      console.error(err)
      setError("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  // const kycStatusInfo = getKycStatus()

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account information and KYC verification</p>
        </div>
        {/* <Badge variant="outline" className={`${kycStatusInfo.color} text-white`}>
          {kycStatusInfo.label}
        </Badge> */}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
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
              <h2 className="text-xl font-semibold ">{profile.fullName}</h2>
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
              <Button type="button" variant="outline" onClick={() => setEditing(false)} disabled={loading}>
                Cancel
              </Button>
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
            {/* <div className="text-right">
              <div className="text-sm font-medium text-gray-700">Progress</div>
              <div className="flex items-center space-x-2 mt-1">
                <Progress value={kycProgress()} className="w-20" />
                <span className="text-sm text-gray-600">{kycProgress()}%</span>
              </div>
            </div> */}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Passport Upload */}
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

          {/* Address Proof Upload */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Address Proof</Label>
            </div>

            {kycDocuments.addressProof.preview ? (
              <div className="flex items-center space-x-3 p-3 border rounded-lg bg-gray-50">
                <div className="flex-1">
                  <p className="text-sm font-medium">{kycDocuments.addressProof.file?.name}</p>
                  <p className="text-xs text-gray-500">
                    {kycDocuments.addressProof.file && (kycDocuments.addressProof.file.size / 1024 / 1024).toFixed(2)}{" "}
                    MB
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
                      ; (window as any).addressInputRef = input
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

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <Button onClick={handleProfileUpdate} disabled={loading} >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}
