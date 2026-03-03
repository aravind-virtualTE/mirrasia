/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import InlineSignatureCreator from "@/components/pdfPage/InlineSignatureCreator";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { toast } from "@/hooks/use-toast";
import type { McapField } from "../configs/types";
import { FieldTooltip } from "./FieldTooltip";

const isImageSignature = (value: unknown) => {
    if (typeof value !== "string") return false;
    const trimmed = value.trim();
    if (!trimmed) return false;
    if (trimmed.startsWith("data:image/") || trimmed.startsWith("blob:")) return true;
    return /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(trimmed);
};

export const UnifiedSignatureField = ({
    field,
    value,
    onChange,
    onUploadSignature,
    onRemoveSignature,
}: {
    field: McapField;
    value: any;
    onChange: (val: any) => void;
    onUploadSignature?: (signature: string) => Promise<string>;
    onRemoveSignature?: (currentValue?: string) => Promise<void>;
}) => {
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);
    const label = field.label ? (t(field.label, field.label) as string) : "";
    const tooltip = field.tooltip ? (t(field.tooltip, field.tooltip) as string) : "";
    const hasSignature = typeof value === "string" ? value.trim().length > 0 : Boolean(value);
    const signatureValue = typeof value === "string" ? value : "";
    const isBusy = isUploading || isRemoving;

    const handleSignatureCreate = async (signature: string) => {
        try {
            setIsUploading(true);
            const nextValue = onUploadSignature ? await onUploadSignature(signature) : signature;
            onChange(nextValue);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to save signature:", error);
            toast({
                title: t("mcap.signature.errorTitle", "Signature error"),
                description: t("mcap.signature.saveFailed", "Unable to save the signature. Please try again."),
                variant: "destructive",
            });
            throw error;
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemove = async () => {
        try {
            setIsRemoving(true);
            if (onRemoveSignature) {
                await onRemoveSignature(signatureValue);
            }
            onChange("");
            setIsEditing(false);
            setIsRemoveConfirmOpen(false);
        } catch (error) {
            console.error("Failed to remove signature:", error);
            toast({
                title: t("mcap.signature.errorTitle", "Signature error"),
                description: t("mcap.signature.removeFailed", "Unable to remove the signature. Please try again."),
                variant: "destructive",
            });
        } finally {
            setIsRemoving(false);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-1.5">
                <Label htmlFor={field.name}>
                    {label} {field.required && <span className="text-red-500">*</span>}
                </Label>
                <FieldTooltip content={tooltip} />
            </div>

            {hasSignature && !isEditing ? (
                <div className="space-y-3 rounded-xl border bg-muted/20 p-4">
                    <div className="rounded-lg border bg-white p-3">
                        {isImageSignature(signatureValue) ? (
                            <img
                                src={signatureValue}
                                alt={t("mcap.signature.previewAlt", "Saved signature")}
                                className="mx-auto max-h-24 w-full object-contain"
                            />
                        ) : (
                            <div className="flex min-h-24 items-center justify-center text-center text-lg font-medium break-words">
                                {String(value)}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsEditing(true)} disabled={isBusy}>
                            {t("mcap.signature.change", "Change signature")}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsRemoveConfirmOpen(true)}
                            disabled={isBusy}
                        >
                            {t("mcap.signature.remove", "Remove")}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                        {t(
                            "mcap.signature.helper",
                            "Draw, type, or upload a signature image, then add it to this application."
                        )}
                    </p>

                    <div className={isUploading ? "pointer-events-none opacity-70" : undefined}>
                        <InlineSignatureCreator
                            onSignatureCreate={handleSignatureCreate}
                            maxWidth={320}
                            maxHeight={100}
                            className="shadow-none"
                        />
                    </div>

                    {isUploading && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t("mcap.signature.saving", "Saving signature...")}
                        </div>
                    )}

                    {hasSignature && (
                        <div className="flex justify-end">
                            <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isBusy}>
                                {t("mcap.signature.cancel", "Cancel")}
                            </Button>
                        </div>
                    )}
                </div>
            )}

            <ConfirmDialog
                open={isRemoveConfirmOpen}
                onOpenChange={setIsRemoveConfirmOpen}
                title={t("mcap.signature.removeTitle", "Remove signature")}
                description={t(
                    "mcap.signature.removeDescription",
                    "This will permanently delete the saved electronic signature for this application. This action cannot be undone."
                )}
                confirmText={t("mcap.signature.remove", "Remove")}
                loadingText={t("mcap.signature.removing", "Removing...")}
                isLoading={isRemoving}
                onConfirm={handleRemove}
            />
        </div>
    );
};
