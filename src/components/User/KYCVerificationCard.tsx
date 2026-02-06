/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    CheckCircle, Camera, RotateCcw, IdCard, Upload, Smartphone,
} from "lucide-react"
// Home, QrCode,
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
// import { OtherDocument } from "./Profile"
import { DocumentUploadCard } from "./DocumentUploadCard";
import { OtherDocumentsSection } from "./OtherDocumentSection";
import Webcam from "react-webcam"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input";
import { generateUploadToken } from "@/services/dataFetch"
import { useTranslation } from "react-i18next";
import { useState, useRef, useEffect } from "react";

interface KYCVerificationCardProps {
    profile: any
    kycDocuments: any
    otherDocuments: any[]
    capturedImage: string | null
    isWebcamReady: boolean
    facingMode: string
    onFileUpload: (documentType: "passport" | "addressProof" | "selfie", file: File) => void
    onRemoveDocument: (documentType: "passport" | "addressProof" | "selfie") => void
    onDeleteDocument: (url: string, id: string, type: string) => void
    onWebcamReady: () => void
    onWebcamError: (error: any) => void
    onCapture: () => void
    onRetake: () => void
    onSwitchCamera: () => void
    onCapturedImageChange: (image: string | null) => void
    onAddOtherDocuments: (files: File[]) => void
    onRemoveOtherDocument: (docId: string) => void
    onRefreshProfile: () => Promise<void>
}

export function KYCVerificationCard({
    profile,
    kycDocuments,
    otherDocuments,
    capturedImage,
    isWebcamReady,
    facingMode,
    onFileUpload,
    onRemoveDocument,
    onDeleteDocument,
    onWebcamReady,
    onWebcamError,
    onCapture,
    onRetake,
    onSwitchCamera,
    onCapturedImageChange,
    onAddOtherDocuments,
    onRemoveOtherDocument,
    onRefreshProfile
}: KYCVerificationCardProps) {
    const { t } = useTranslation()
    const [livenessMode, setLivenessMode] = useState<"webcam" | "upload" | "qr">("webcam")
    const [qrToken, setQrToken] = useState<string | null>(null)
    const webcamRef = useRef<Webcam>(null)

    // Poll for QR updates
    useEffect(() => {
        let interval: NodeJS.Timeout

        async function checkStatus() {
            await onRefreshProfile()
            // If the profile updates to "image_captured" or "uploaded"
            if (
                profile.kycDocuments?.selfieStatus === "image_captured" ||
                profile.kycDocuments?.selfieStatus === "uploaded"
            ) {
                // Stop polling and switch mode or show success
                setLivenessMode("webcam") // Or stay on QR but show success message
            }
        }

        if (livenessMode === "qr") {
            // 1. Generate Token if missing
            if (!qrToken) {
                generateUploadToken().then((data:any) => {
                    if (data?.token) {
                        setQrToken(data.token)
                    } else {
                        console.error("Failed to generate upload token", data);
                    }
                }).catch(err => console.error("Error generating token:", err))
            }

            // 2. Start Polling
            interval = setInterval(checkStatus, 3000)
        } else {
            setQrToken(null)
        }

        return () => clearInterval(interval)
    }, [livenessMode, qrToken, onRefreshProfile, profile.kycDocuments?.selfieStatus])

    const handleDeleteSelfie = async () => {
        try {
            const profileId = profile._id;
            const selfieUrl = profile.kycDocuments?.selfieUrl;

            if (profileId && selfieUrl) {
                await onDeleteDocument(selfieUrl, profileId, "selfie");
                await onRefreshProfile();
            }
        } catch (err) {
            console.error("Error deleting selfie:", err);
        } finally {
            onCapturedImageChange(null);
            onRemoveDocument("selfie");
            onRetake();
        }
    };

    const qrCodeUrl = qrToken
        ? `${window.location.origin}/mobile-upload?token=${qrToken}`
        : ""

    const serverSelfieUrl = profile.kycDocuments?.selfieUrl
        ? encodeURI(profile.kycDocuments.selfieUrl).replace(/\+/g, "%2B")
        : null
    const selfiePreview =
        capturedImage ||
        kycDocuments.selfie.preview ||
        serverSelfieUrl ||
        null

    const getDraftDocs = (type: "passport" | "addressProof") => {
        const doc = kycDocuments[type];
        if (doc && doc.file) {
            return [{
                id: type,
                file: doc.file,
                preview: doc.preview,
                status: "pending" as const,
                name: doc.file.name,
                size: doc.file.size,
                type: doc.file.type
            }];
        }
        return [];
    };
    // console.log("selfiePreview",selfiePreview)
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{t("userProfile.verification.title")}</CardTitle>
                <CardDescription>
                    {t("userProfile.verification.subtitle")}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="documents" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="documents" className="flex items-center gap-2">
                            <IdCard className="w-4 h-4" />
                            {t("userProfile.verification.tabs.documents")}
                        </TabsTrigger>
                        <TabsTrigger value="liveness" className="flex items-center gap-2">
                            <Camera className="w-4 h-4" />
                            {t("userProfile.verification.tabs.liveness")}
                        </TabsTrigger>
                    </TabsList>

                    {/* DOCUMENTS TAB */}
                    <TabsContent value="documents" className="space-y-6">
                        <DocumentUploadCard
                            title={t("userProfile.verification.passportId")}
                            description={t("userProfile.upload.passport")}
                            uploadLabel={t("userProfile.verification.passportId")}
                            // Existing Server Data
                            existingUrl={profile.kycDocuments?.passportUrl}
                            existingStatus={profile.kycDocuments?.passportStatus}
                            onDelete={(url) => onDeleteDocument(url, profile._id, "passport")}
                            // Draft Data
                            documents={getDraftDocs("passport")}
                            onUpload={(files) => files[0] && onFileUpload("passport", files[0])}
                            onRemove={() => onRemoveDocument("passport")}

                            accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <DocumentUploadCard
                            title={t("userProfile.verification.addressProof")}
                            description={t("userProfile.upload.addressProof")}
                            uploadLabel={t("userProfile.verification.addressProof")}
                            // Existing Server Data
                            existingUrl={profile.kycDocuments?.addressProofUrl}
                            existingStatus={profile.kycDocuments?.addressProofStatus}
                            onDelete={(url) => onDeleteDocument(url, profile._id, "addressProof")}
                            // Draft Data
                            documents={getDraftDocs("addressProof")}
                            onUpload={(files) => files[0] && onFileUpload("addressProof", files[0])}
                            onRemove={() => onRemoveDocument("addressProof")}

                            accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <OtherDocumentsSection
                            documents={otherDocuments}
                            onAddDocuments={onAddOtherDocuments}
                            onRemoveDocument={onRemoveOtherDocument}
                        />
                    </TabsContent>

                    {/* LIVENESS CHECK TAB */}
                    <TabsContent value="liveness" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">{t("userProfile.verification.liveness.title")}</CardTitle>
                                <CardDescription>
                                    {t("userProfile.verification.liveness.subtitle")}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Captured Image Preview (Draft or Server) */}
                                {selfiePreview ? (
                                    <div className="flex flex-col items-center gap-4">
                                    <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-lg border-2 border-dashed bg-muted">
                                            <img
                                                src={selfiePreview || ""}
                                                alt="Selfie"
                                                className="h-full w-full object-cover"
                                            />
                                            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" />
                                                {profile.kycDocuments?.selfieUrl ? t("userProfile.verification.status.uploaded") : t("userProfile.verification.liveness.captured")}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 flex-wrap justify-center">
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    onRetake();
                                                    onCapturedImageChange(null);
                                                    if (kycDocuments.selfie.file) onRemoveDocument("selfie");
                                                }}
                                                className="flex items-center gap-2"
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                                {t("userProfile.actions.retakeReplace")}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={async () => {
                                                    if (profile.kycDocuments?.selfieUrl) {
                                                        await handleDeleteSelfie();
                                                    }
                                                    onCapturedImageChange(null);
                                                    onRetake();
                                                    if (kycDocuments.selfie.file) onRemoveDocument("selfie");
                                                }}
                                                className="text-destructive hover:bg-destructive/10 flex items-center gap-2"
                                            >
                                                {t("common.delete", "Delete")}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Mode Selection */}
                                        <div className="flex items-center justify-center gap-4">
                                            <Button
                                                variant={livenessMode === "webcam" ? "default" : "outline"}
                                                onClick={() => setLivenessMode("webcam")}
                                                className="flex items-center gap-2"
                                            >
                                                <Camera className="w-4 h-4" />
                                                {t("userProfile.verification.liveness.modes.webcam")}
                                            </Button>
                                            <Button
                                                variant={livenessMode === "upload" ? "default" : "outline"}
                                                onClick={() => setLivenessMode("upload")}
                                                className="flex items-center gap-2"
                                            >
                                                <Upload className="w-4 h-4" />
                                                {t("userProfile.verification.liveness.modes.upload")}
                                            </Button>
                                            {/* <Button
                                                variant={livenessMode === "qr" ? "default" : "outline"}
                                                onClick={() => setLivenessMode("qr")}
                                                className="flex items-center gap-2"
                                            >
                                                <QrCode className="w-4 h-4" />
                                                Scan QR Code
                                            </Button> */}
                                        </div>

                                        {/* QR View */}
                                        {livenessMode === "qr" && (
                                            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 bg-muted/30">
                                                {qrToken ? (
                                                    <>
                                                        <img
                                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrCodeUrl)}`}
                                                            alt="Scan to upload"
                                                            className="w-40 h-40 mb-4 border rounded-lg shadow-sm"
                                                        />
                                                        <p className="font-medium text-lg mb-2">{t("userProfile.verification.liveness.qr.title")}</p>
                                                        <p className="text-sm text-muted-foreground text-center max-w-xs mb-4">
                                                            {t("userProfile.verification.liveness.qr.instruction")}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-primary/5 px-3 py-1 rounded-full animate-pulse">
                                                            <Smartphone className="w-3 h-3" />
                                                            {t("userProfile.verification.liveness.qr.waiting")}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col items-center py-8">
                                                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                                                        <p className="text-sm text-muted-foreground">{t("userProfile.verification.liveness.qr.generating")}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Upload View */}
                                        {livenessMode === "upload" && (
                                            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer relative">
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            onCapturedImageChange(null);
                                                            onFileUpload("selfie", file);
                                                        }
                                                    }}
                                                />
                                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 pointer-events-none">
                                                    <Upload className="w-8 h-8 text-primary" />
                                                </div>
                                                <p className="font-medium text-lg mb-2 pointer-events-none">{t("userProfile.verification.liveness.upload.title")}</p>
                                                <p className="text-sm text-muted-foreground text-center max-w-xs pointer-events-none">
                                                    {t("userProfile.verification.liveness.upload.desc")}
                                                </p>
                                            </div>
                                        )}

                                        {/* Webcam View */}
                                        {livenessMode === "webcam" && (
                                            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
                                                <>
                                                    <Webcam
                                                        audio={false}
                                                        ref={webcamRef}
                                                        width="100%"
                                                        height="100%"
                                                        className={!isWebcamReady ? "opacity-0 absolute inset-0" : ""}
                                                        videoConstraints={{ facingMode }}
                                                        onUserMedia={onWebcamReady}
                                                        onUserMediaError={(err) => {
                                                            console.error("Webcam user media error:", err);
                                                            onWebcamError(err);
                                                        }}
                                                        screenshotFormat="image/jpeg"
                                                    />
                                                    {!isWebcamReady && (
                                                        <div className="absolute inset-0 flex items-center justify-center text-white">
                                                            <p>{t("userProfile.verification.liveness.webcam.initializing", "Initializing camera...")}</p>
                                                        </div>
                                                    )}
                                                    {isWebcamReady && (
                                                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                                                            <Button
                                                                onClick={() => {
                                                                    onCapture();
                                                                    const imageSrc = webcamRef.current?.getScreenshot();
                                                                    onCapturedImageChange(imageSrc || null);
                                                                }}
                                                                className="rounded-full w-12 h-12 p-0 bg-red-500 hover:bg-red-600 border-4 border-white"
                                                            />
                                                            <Button
                                                                size="icon"
                                                                variant="secondary"
                                                                onClick={onSwitchCamera}
                                                                className="rounded-full"
                                                            >
                                                                <RotateCcw className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
