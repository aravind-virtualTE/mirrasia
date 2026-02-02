import { useState, useRef, useCallback } from "react";
import { t } from "i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  Image as ImageIcon,
  X,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Sparkles,
  File,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadedDocument {
  id: string;
  file: File;
  preview: string;
  status: "pending" | "uploaded" | "verified" | "rejected";
  name: string;
  size: number;
  type: string;
}

interface DocumentUploadCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  documents: UploadedDocument[];
  existingUrl?: string;
  existingStatus?: string;
  onUpload: (files: File[]) => void;
  onRemove: (id: string) => void;
  onDelete?: (url: string) => void;
  onView?: (url: string) => void;
}

const statusConfig = {
  pending: {
    icon: Clock,
    labelKey: "userProfile.verification.status.pending",
    className: "status-pending",
  },
  uploaded: {
    icon: Sparkles,
    labelKey: "userProfile.verification.status.uploaded",
    className: "status-uploaded",
  },
  accepted: {
    icon: CheckCircle,
    labelKey: "userProfile.verification.status.accepted",
    className: "status-verified",
  },
  rejected: {
    icon: AlertCircle,
    labelKey: "userProfile.verification.status.rejected",
    className: "status-rejected",
  },
};

export function DocumentUploadCard({
  title,
  description,
  icon,
  accept = "image/*,.pdf",
  maxSize = 5,
  multiple = false,
  documents,
  existingUrl,
  existingStatus = "pending",
  onUpload,
  onRemove,
  onDelete,
  onView,
}: DocumentUploadCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<UploadedDocument | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        onUpload(multiple ? files : [files[0]]);
      }
    },
    [onUpload, multiple]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onUpload(multiple ? files : [files[0]]);
    }
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return ImageIcon;
    if (type === "application/pdf") return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  console.log("status", existingStatus)
  const status = statusConfig[existingStatus as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="document-card p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            {icon || <FileText className="w-5 h-5 text-primary-foreground" />}
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        {existingUrl && (
          <div className={cn("status-badge", status.className)}>
            <StatusIcon className="w-3.5 h-3.5" />
            {t(status.labelKey)}
          </div>
        )}
      </div>

      {/* Existing Document */}
      {existingUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 p-4 rounded-xl bg-gradient-to-br from-success/5 to-success/10 border border-success/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="font-medium text-foreground">{t("userProfile.upload.submitted")}</p>
                <p className="text-sm text-muted-foreground">{t("userProfile.upload.submittedDesc")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onView && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(existingUrl)}
                  className="gap-2"
                >
                  <Eye className="w-4 h-4" />
                  {t("userProfile.actions.view")}
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(existingUrl)}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {t("userProfile.actions.delete")}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Upload Zone */}
      {!existingUrl && (
        <div
          className={cn("upload-zone", isDragging && "dragging")}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileChange}
            className="hidden"
          />
          <motion.div
            animate={isDragging ? { scale: 1.05 } : { scale: 1 }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <p className="font-medium text-foreground mb-1">
              {isDragging ? t("userProfile.upload.drop") : t("userProfile.upload.dragDrop")}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {t("userProfile.upload.browse")}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="px-2 py-1 rounded-md bg-muted">JPEG</span>
              <span className="px-2 py-1 rounded-md bg-muted">PNG</span>
              <span className="px-2 py-1 rounded-md bg-muted">PDF</span>
              <span className="text-muted-foreground">{t("userProfile.upload.upTo", { size: maxSize })}</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Uploaded Documents List */}
      <AnimatePresence>
        {documents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-3"
          >
            {documents.map((doc, index) => {
              const FileIcon = getFileIcon(doc.type);
              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50 group hover:border-primary/30 transition-all"
                >
                  {doc.preview && doc.type.startsWith("image/") ? (
                    <img
                      src={doc.preview}
                      alt={doc.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileIcon className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(doc.size)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(doc.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPreviewDoc(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-4xl max-h-[90vh] overflow-auto bg-card rounded-2xl shadow-elevated p-4"
              onClick={(e) => e.stopPropagation()}
            >
              {previewDoc.type.startsWith("image/") ? (
                <img
                  src={previewDoc.preview}
                  alt={previewDoc.name}
                  className="max-w-full h-auto rounded-lg"
                />
              ) : (
                <iframe
                  src={previewDoc.preview}
                  className="w-full h-[80vh]"
                  title={previewDoc.name}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
