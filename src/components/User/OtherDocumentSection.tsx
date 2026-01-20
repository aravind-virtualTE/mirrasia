import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    Upload,
    FileText,
    Image as ImageIcon,
    //   X,
    Eye,
    Trash2,
    File,
    FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { OtherDocument } from "./Profile";

interface OtherDocumentsSectionProps {
    documents: OtherDocument[];
    onAddDocuments: (files: File[]) => void;
    onRemoveDocument: (id: string) => void;
    onViewDocument?: (doc: OtherDocument) => void;
}

export function OtherDocumentsSection({
    documents,
    onAddDocuments,
    onRemoveDocument,
    //   onViewDocument,
}: OtherDocumentsSectionProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [previewDoc, setPreviewDoc] = useState<OtherDocument | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    console.log("documents-->", documents);
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
                validateAndUpload(files);
            }
        },
        [onAddDocuments]
    );

    const validateAndUpload = (files: File[]) => {
        const validFiles: File[] = [];
        const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
        const maxSize = 5 * 1024 * 1024; // 5MB

        files.forEach((file) => {
            if (!allowedTypes.includes(file.type)) {
                toast({
                    title: "Invalid file type",
                    description: `${file.name} is not supported. Use JPEG, PNG, or PDF.`,
                    variant: "destructive",
                });
                return;
            }
            if (file.size > maxSize) {
                toast({
                    title: "File too large",
                    description: `${file.name} exceeds 5MB limit.`,
                    variant: "destructive",
                });
                return;
            }
            validFiles.push(file);
        });

        if (validFiles.length > 0) {
            onAddDocuments(validFiles);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            validateAndUpload(files);
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

    const formatDate = (date: Date | string) => {
        // Convert to Date object if it's a string
        const dateObj = typeof date === 'string' ? new Date(date) : date;

        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(dateObj);
    };

    const src = previewDoc?.url || previewDoc?.preview;
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="document-card p-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                        <FolderOpen className="w-5 h-5 text-accent-foreground" />
                    </div>
                    <div>
                        <h3 className="font-display font-semibold text-foreground">
                            Other Documents
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Upload additional supporting documents
                        </p>
                    </div>
                </div>
                <Button
                    onClick={() => inputRef.current?.click()}
                    className="gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Document
                </Button>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/*,.pdf"
                multiple
                onChange={handleFileChange}
                className="hidden"
            />

            {/* Documents Grid */}
            {documents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <AnimatePresence mode="popLayout">
                        {documents.map((doc, index) => {
                            const FileIcon = getFileIcon(doc.type);
                            const src = doc.url || doc.preview;

                            return (
                                <motion.div
                                    key={doc.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group relative rounded-xl border border-border/50 overflow-hidden hover:border-primary/30 hover:shadow-soft transition-all duration-300"
                                >
                                    {/* Preview Area */}
                                    <div className="aspect-[4/3] relative overflow-hidden bg-muted/50">
                                        {doc.type.startsWith("image/") && src ? (
                                            <img
                                                src={src}
                                                alt={doc.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <FileIcon className="w-16 h-16 text-muted-foreground/50" />
                                            </div>
                                        )}

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 flex items-end justify-center pb-4 gap-2">
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                className="gap-1.5"
                                                onClick={() => setPreviewDoc(doc)}
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                View
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                className="gap-1.5"
                                                onClick={() => onRemoveDocument(doc.id)}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                Delete
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-3">
                                        <p className="font-medium text-sm text-foreground truncate">
                                            {doc.name}
                                        </p>
                                        <div className="flex items-center justify-between mt-1">
                                            <p className="text-xs text-muted-foreground">
                                                {formatFileSize(doc.size)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(doc.uploadedAt)}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            ) : null}

            {/* Drop Zone */}
            <div
                className={cn("upload-zone", isDragging && "dragging")}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                <motion.div
                    animate={isDragging ? { scale: 1.02 } : { scale: 1 }}
                    className="flex flex-col items-center"
                >
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center mb-3">
                        <Upload className="w-7 h-7 text-primary" />
                    </div>

                    <p className="font-medium text-foreground mb-1">
                        {isDragging ? "Drop files here" : "Drag & drop multiple files"}
                    </p>
                    <p className="text-sm text-muted-foreground mb-3">
                        or click to browse from your device
                    </p>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="px-2 py-1 rounded-md bg-muted">JPEG</span>
                        <span className="px-2 py-1 rounded-md bg-muted">PNG</span>
                        <span className="px-2 py-1 rounded-md bg-muted">PDF</span>
                        <span>up to 5MB each</span>
                    </div>
                </motion.div>
            </div>

            {/* Preview Dialog */}
            <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                    <DialogHeader>
                        <DialogTitle>{previewDoc?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                        {previewDoc?.type.startsWith("image/") ? (
                            <img src={src} alt={previewDoc?.name} className="w-full h-auto rounded-lg" />
                        ) : src ? (
                            <iframe src={src} className="w-full h-[70vh] rounded-lg" title={previewDoc?.name} />
                        ) : null}
                    </div>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
