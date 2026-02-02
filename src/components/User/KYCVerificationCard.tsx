/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useCallback, useState } from "react"
import Webcam from 'react-webcam'
import {
    FileText, Shield, CheckCircle, AlertCircle, Clock, Camera, RotateCcw, X, IdCard, Home, Eye, Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Label } from "@/components/ui/label"
// import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { OtherDocument } from "./Profile"
import { DocumentUploadCard } from "./DocumentUploadCard";
import { OtherDocumentsSection } from "./OtherDocumentSection";
import { cn } from "@/lib/utils";
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

const tabVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
};

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
    const [activeTab, setActiveTab] = useState("documents");
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

    const passportDocs = kycDocuments.passport.file
        ? [
            {
                id: "passport-new",
                file: kycDocuments.passport.file,
                preview: kycDocuments.passport.preview || "",
                status: kycDocuments.passport.status,
                name: kycDocuments.passport.file.name,
                size: kycDocuments.passport.file.size,
                type: kycDocuments.passport.file.type,
            },
        ]
        : [];

    const addressDocs = kycDocuments.addressProof.file
        ? [
            {
                id: "address-new",
                file: kycDocuments.addressProof.file,
                preview: kycDocuments.addressProof.preview || "",
                status: kycDocuments.addressProof.status,
                name: kycDocuments.addressProof.file.name,
                size: kycDocuments.addressProof.file.size,
                type: kycDocuments.addressProof.file.type,
            },
        ]
        : [];

    return (
        <Card className="glass-card overflow-hidden border-0">
            <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
                            <Shield className="w-7 h-7 text-primary-foreground" />
                        </div>
                        <div>
                            <h2 className="font-display text-2xl font-bold gradient-text">
                                {t("userProfile.verification.title")}
                            </h2>
                            <p className="text-muted-foreground">
                                {t("userProfile.verification.subtitle")}
                            </p>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50 rounded-xl mb-6">
                        <TabsTrigger value="documents" className="tab-futuristic">
                            <FileText className="w-4 h-4 mr-2" />
                            {t("userProfile.verification.documents")}
                        </TabsTrigger>
                        <TabsTrigger value="selfie" className="tab-futuristic">
                            <Camera className="w-4 h-4 mr-2" />
                            {t("userProfile.verification.selfie")}
                        </TabsTrigger>
                    </TabsList>

                    <AnimatePresence mode="wait">
                        <TabsContent value="documents" className="mt-0">
                            <motion.div
                                key="documents"
                                variants={tabVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                {/* Passport Section */}
                                <DocumentUploadCard
                                    title={t("userProfile.verification.passportId")}
                                    description={t("userProfile.verification.passportDesc")}
                                    icon={<IdCard className="w-5 h-5 text-primary-foreground" />}
                                    documents={passportDocs}
                                    existingUrl={profile.kycDocuments?.passportUrl}
                                    existingStatus={profile.kycDocuments?.passportStatus}
                                    onUpload={(files) => onFileUpload("passport", files[0])}
                                    onRemove={() => onRemoveDocument("passport")}
                                    onDelete={(url) =>
                                        onDeleteDocument(url, profile._id, "passport")
                                    }
                                    onView={(url) => setPreviewUrl(url)}
                                />

                                {/* Address Proof Section */}
                                <DocumentUploadCard
                                    title={t("userProfile.verification.addressProof")}
                                    description={t("userProfile.verification.addressDesc")}
                                    icon={<Home className="w-5 h-5 text-primary-foreground" />}
                                    documents={addressDocs}
                                    existingUrl={profile.kycDocuments?.addressProofUrl}
                                    existingStatus={profile.kycDocuments?.addressProofStatus}
                                    onUpload={(files) => onFileUpload("addressProof", files[0])}
                                    onRemove={() => onRemoveDocument("addressProof")}
                                    onDelete={(url) =>
                                        onDeleteDocument(url, profile._id, "address")
                                    }
                                    onView={(url) => setPreviewUrl(url)}
                                />

                                {/* Other Documents Section */}
                                <OtherDocumentsSection
                                    documents={otherDocuments}
                                    onAddDocuments={onAddOtherDocuments}
                                    onRemoveDocument={onRemoveOtherDocument}
                                />
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="selfie" className="mt-0">
                            <motion.div
                                key="selfie"
                                variants={tabVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                                className="document-card p-6"
                            >
                                {profile.kycDocuments?.selfieUrl ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success to-success/70 flex items-center justify-center">
                                                    <CheckCircle className="w-5 h-5 text-success-foreground" />
                                                </div>
                                                <div>
                                                    <h3 className="font-display font-semibold">{t("userProfile.verification.selfieCaptured")}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {t("userProfile.verification.selfieSubmitted")}
                                                    </p>
                                                </div>
                                            </div>
                                            <div
                                                className={cn(
                                                    "status-badge",
                                                    profile.kycDocuments.selfieStatus === "accepted"
                                                        ? "status-verified"
                                                        : profile.kycDocuments.selfieStatus === "rejected"
                                                            ? "status-rejected"
                                                            : "status-pending"
                                                )}
                                            >
                                                {profile.kycDocuments.selfieStatus === "accepted" && (
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                )}
                                                {profile.kycDocuments.selfieStatus === "rejected" && (
                                                    <AlertCircle className="w-3.5 h-3.5" />
                                                )}
                                                {profile.kycDocuments.selfieStatus === "pending" && (
                                                    <Clock className="w-3.5 h-3.5" />
                                                )}
                                                {t(`userProfile.verification.status.${profile.kycDocuments.selfieStatus}`)}
                                            </div>
                                        </div>
                                        <div className="relative rounded-xl overflow-hidden">
                                            <img
                                                src={profile.kycDocuments.selfieUrl}
                                                alt="Captured selfie"
                                                className="w-full h-auto max-h-[400px] object-contain bg-muted"
                                            />
                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="gap-2"
                                                    onClick={() => setPreviewUrl(profile.kycDocuments.selfieUrl)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    {t("userProfile.actions.view")}
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="gap-2"
                                                    onClick={() =>
                                                        onDeleteDocument(
                                                            profile.kycDocuments.selfieUrl,
                                                            profile._id,
                                                            "selfie"
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    {t("userProfile.actions.delete")}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="text-center">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
                                                <Camera className="w-8 h-8 text-primary-foreground" />
                                            </div>
                                            <h3 className="font-display text-xl font-bold mb-2">
                                                {t("userProfile.verification.selfieVerification")}
                                            </h3>
                                            <p className="text-muted-foreground max-w-md mx-auto">
                                                {t("userProfile.verification.selfieInstruction")}
                                            </p>
                                        </div>

                                        <div className="relative mx-auto bg-muted rounded-2xl overflow-hidden max-w-[600px] aspect-video">
                                            {!capturedImage ? (
                                                <>
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

                                                    {!isWebcamReady && (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-muted">
                                                            <div className="text-center">
                                                                <Camera className="w-12 h-12 mx-auto mb-2 text-muted-foreground animate-pulse" />
                                                                <p className="text-muted-foreground">
                                                                    {t("userProfile.verification.initializingCamera")}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Camera Controls */}
                                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
                                                        <Button
                                                            variant="secondary"
                                                            size="icon"
                                                            className="w-12 h-12 rounded-full glass-card"
                                                            onClick={onSwitchCamera}
                                                        >
                                                            <RotateCcw className="w-5 h-5" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            disabled={!isWebcamReady}
                                                            onClick={handleCapture}
                                                            className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-glow"
                                                        >
                                                            <Camera className="w-6 h-6" />
                                                        </Button>
                                                        <div className="w-12 h-12" /> {/* Spacer for symmetry */}
                                                    </div>

                                                    {/* Face Guide Overlay */}
                                                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                                        <div className="w-48 h-60 border-2 border-dashed border-primary/50 rounded-[40%] animate-pulse" />
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <img
                                                        src={capturedImage}
                                                        alt="Captured selfie"
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
                                                        <Button
                                                            variant="secondary"
                                                            onClick={onRetake}
                                                            className="gap-2"
                                                        >
                                                            <X className="w-4 h-4" />
                                                            {t("userProfile.actions.retake")}
                                                        </Button>
                                                        <Button className="gap-2 bg-gradient-to-r from-success to-success/80">
                                                            <CheckCircle className="w-4 h-4" />
                                                            {t("userProfile.actions.usePhoto")}
                                                        </Button>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        <div className="text-center space-y-2 text-sm text-muted-foreground">
                                            <p>• {t("userProfile.verification.guidelines.lighting")}</p>
                                            <p>• {t("userProfile.verification.guidelines.passport")}</p>
                                            <p>• {t("userProfile.verification.guidelines.rotate")}</p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </TabsContent>

                    </AnimatePresence>
                </Tabs>
            </CardContent>

            {/* Document Preview Dialog */}
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
        </Card>
    );
}
