/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useCallback, useState } from "react"
import Webcam from 'react-webcam'
import {
    CheckCircle,Camera, RotateCcw, IdCard, Home} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { OtherDocument } from "./Profile"
import { DocumentUploadCard } from "./DocumentUploadCard";
import { OtherDocumentsSection } from "./OtherDocumentSection";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { DialogHeader } from "../ui/dialog";
import { t } from "i18next";

interface KYCDocument {
    file: File | null
    preview: string | null
    status: "pending" | "uploaded" | "verified" | "rejected"
}

interface KYCVerificationCardProps {
    profile: any
    kycDocuments: {
        passport: KYCDocument
        addressProof: KYCDocument
    }
    otherDocuments: OtherDocument[];
    capturedImage: string | null
    isWebcamReady: boolean
    facingMode: string
    onFileUpload: (documentType: "passport" | "addressProof", file: File) => void
    onRemoveDocument: (documentType: "passport" | "addressProof" | "selfie") => void
    onDeleteDocument: (url: string, id: string, type: string) => void
    onWebcamReady: () => void
    onWebcamError: (error: any) => void
    onCapture: () => void
    onRetake: () => void
    onSwitchCamera: () => void
    onCapturedImageChange: (image: string | null) => void
    onAddOtherDocuments: (files: File[]) => void;
    onRemoveOtherDocument: (id: string) => void;
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
}: KYCVerificationCardProps) {
    const webcamRef = useRef(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: facingMode
    }

    const handleCapture = useCallback(() => {
        if (webcamRef.current) {
            const imageSrc = (webcamRef.current as any).getScreenshot();
            onCapturedImageChange(imageSrc);
            onCapture();
        }
    }, [onCapture, onCapturedImageChange]);

    // Helpers to normalize existing component props
    const passportDocs = kycDocuments.passport.file
        ? [{
            id: "passport-new",
            file: kycDocuments.passport.file,
            preview: kycDocuments.passport.preview || "",
            status: kycDocuments.passport.status,
            name: kycDocuments.passport.file.name,
            size: kycDocuments.passport.file.size,
            type: kycDocuments.passport.file.type,
        }]
        : [];

    const addressDocs = kycDocuments.addressProof.file
        ? [{
            id: "address-new",
            file: kycDocuments.addressProof.file,
            preview: kycDocuments.addressProof.preview || "",
            status: kycDocuments.addressProof.status,
            name: kycDocuments.addressProof.file.name,
            size: kycDocuments.addressProof.file.size,
            type: kycDocuments.addressProof.file.type,
        }]
        : [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold">{t("userProfile.verification.title")}</h2>
                <p className="text-muted-foreground">{t("userProfile.verification.subtitle")}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                {/* 1. Identity Document */}
                <div className="md:col-span-2 lg:col-span-1">
                    <DocumentUploadCard
                        title={t("userProfile.verification.passportId")}
                        description={t("userProfile.verification.passportDesc")}
                        icon={<IdCard className="w-5 h-5 text-primary-foreground" />}
                        documents={passportDocs}
                        existingUrl={profile.kycDocuments?.passportUrl}
                        existingStatus={profile.kycDocuments?.passportStatus}
                        onUpload={(files) => onFileUpload("passport", files[0])}
                        onRemove={() => onRemoveDocument("passport")}
                        onDelete={(url) => onDeleteDocument(url, profile._id, "passport")}
                        onView={(url) => setPreviewUrl(url)}
                    />
                </div>

                {/* 2. Address Proof */}
                <div className="md:col-span-2 lg:col-span-1">
                    <DocumentUploadCard
                        title={t("userProfile.verification.addressProof")}
                        description={t("userProfile.verification.addressDesc")}
                        icon={<Home className="w-5 h-5 text-primary-foreground" />}
                        documents={addressDocs}
                        existingUrl={profile.kycDocuments?.addressProofUrl}
                        existingStatus={profile.kycDocuments?.addressProofStatus}
                        onUpload={(files) => onFileUpload("addressProof", files[0])}
                        onRemove={() => onRemoveDocument("addressProof")}
                        onDelete={(url) => onDeleteDocument(url, profile._id, "address")}
                        onView={(url) => setPreviewUrl(url)}
                    />
                </div>

                {/* 3. Liveness / Selfie Check */}
                <div className="md:col-span-2">
                    <Card className="glass-card border-0 overflow-hidden">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <Camera className="w-5 h-5" />
                                </div>
                                <h3 className="font-semibold text-lg">{t("userProfile.verification.selfie")}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">{t("userProfile.verification.selfieInstruction")}</p>
                        </CardHeader>
                        <CardContent>
                            {profile.kycDocuments?.selfieUrl ? (
                                <div className="flex flex-col md:flex-row gap-6 items-start">
                                    <div className="relative rounded-xl overflow-hidden border w-full md:w-64 aspect-video bg-muted">
                                        <img
                                            src={profile.kycDocuments.selfieUrl}
                                            alt="Selfie"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                            <Button variant="secondary" size="sm" onClick={() => setPreviewUrl(profile.kycDocuments.selfieUrl)}>View</Button>
                                        </div>
                                    </div>
                                    <div className="space-y-4 flex-1">
                                        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full w-fit">
                                            <CheckCircle className="w-4 h-4" />
                                            <span className="text-sm font-medium">Selfie Captured</span>
                                        </div>

                                        <div className="flex gap-3">
                                            <Button variant="outline" size="sm" onClick={() => onDeleteDocument(profile.kycDocuments.selfieUrl, profile._id, "selfie")} className="text-destructive hover:bg-destructive/10">
                                                Retake / Delete
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-muted/30 rounded-xl p-6 text-center border-2 border-dashed border-muted-foreground/20">
                                    {!capturedImage ? (
                                        <div className="max-w-md mx-auto space-y-4">
                                            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                                                <Webcam
                                                    ref={webcamRef}
                                                    audio={false}
                                                    screenshotFormat="image/jpeg"
                                                    videoConstraints={videoConstraints}
                                                    onLoadedData={onWebcamReady}
                                                    onUserMediaError={onWebcamError}
                                                    className="w-full h-full object-cover"
                                                    mirrored={facingMode === "user"}
                                                />
                                                {!isWebcamReady && <div className="absolute inset-0 flex items-center justify-center text-white">Initializing Camera...</div>}
                                            </div>
                                            <div className="flex justify-center gap-4">
                                                <Button onClick={onSwitchCamera} variant="outline" size="icon"><RotateCcw className="w-4 h-4" /></Button>
                                                <Button onClick={handleCapture}>Capture Photo</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="max-w-md mx-auto space-y-4">
                                            <div className="relative aspect-video rounded-lg overflow-hidden">
                                                <img src={capturedImage} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex justify-center gap-4">
                                                <Button variant="ghost" onClick={onRetake}>Retake</Button>
                                                <Button onClick={() => {/* Confirm logic usually handled by parent capture state, but here just visual */ }} className="bg-green-600 hover:bg-green-700">Use this Photo</Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* 4. Other Documents */}
                <div className="md:col-span-2">
                    <OtherDocumentsSection
                        documents={otherDocuments}
                        onAddDocuments={onAddOtherDocuments}
                        onRemoveDocument={onRemoveOtherDocument}
                    />
                </div>
            </div>

            {/* Preview Modal */}
            <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                    <DialogHeader>
                        <DialogTitle>{t("userProfile.verification.preview")}</DialogTitle>
                    </DialogHeader>
                    {previewUrl && (
                        <iframe
                            src={previewUrl}
                            className="w-full h-[70vh] rounded-lg"
                            title="Document Preview"
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
