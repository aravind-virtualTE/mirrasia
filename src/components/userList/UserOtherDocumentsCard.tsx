/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import {
  Eye,
  Download,
  FileText,
  Image as ImageIcon,
  File,
  FolderOpen,
} from "lucide-react";

type OtherDoc = {
  _id: string;
  url: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  status: string;
};

function formatBytes(bytes: number) {
  if (!bytes && bytes !== 0) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function formatDate(d: string) {
  const dateObj = new Date(d);
  if (Number.isNaN(dateObj.getTime())) return "-";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);
}

function isImage(type: string) {
  return type?.startsWith("image/");
}

function isPdf(type: string) {
  return type === "application/pdf";
}

function getFileIcon(type: string) {
  if (isImage(type)) return ImageIcon;
  if (isPdf(type)) return FileText;
  return File;
}

function statusClasses(status: string) {
  const s = (status || "").toLowerCase();
  if (s === "verified" || s === "accepted") return "bg-emerald-500/10 text-emerald-700 border-emerald-200";
  if (s === "rejected") return "bg-red-500/10 text-red-700 border-red-200";
  if (s === "uploaded") return "bg-primary/10 text-primary border-primary/20";
  return "bg-muted text-muted-foreground border-border";
}

export default function UserOtherDocumentsCard({ docs }: { docs: OtherDoc[] }) {
  const [preview, setPreview] = useState<OtherDoc | null>(null);

  const sorted = useMemo(() => {
    return [...(docs || [])].sort((a, b) => {
      const at = new Date(a.uploadedAt).getTime();
      const bt = new Date(b.uploadedAt).getTime();
      return bt - at;
    });
  }, [docs]);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-primary/10 ring-1 ring-primary/15 flex items-center justify-center">
            <FolderOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Other Documents</CardTitle>
            <p className="text-sm text-muted-foreground">
              Additional documents uploaded by the user
            </p>
          </div>
        </div>

        <Badge variant="secondary" className="shrink-0">
          {sorted.length} file{sorted.length === 1 ? "" : "s"}
        </Badge>
      </CardHeader>

      <CardContent>
        {sorted.length === 0 ? (
          <div className="rounded-lg border bg-muted/30 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No other documents uploaded yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {sorted.map((doc) => {
              const Icon = getFileIcon(doc.type);
              const thumbSrc = doc.url;

              return (
                <div
                  key={doc._id}
                  className="group rounded-xl border bg-background overflow-hidden hover:shadow-sm transition-shadow"
                >
                  {/* Preview */}
                  <div className="relative aspect-[4/3] bg-muted/40 overflow-hidden">
                    {isImage(doc.type) ? (
                      <img
                        src={thumbSrc}
                        alt={doc.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Icon className="h-14 w-14 text-muted-foreground/60" />
                      </div>
                    )}

                    {/* Status */}
                    <div className="absolute top-2 left-2">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium backdrop-blur-sm",
                          statusClasses(doc.status)
                        )}
                      >
                        {(doc.status || "pending").toString()}
                      </span>
                    </div>

                    {/* Hover actions */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-background/90 via-background/40 to-transparent flex items-end justify-center gap-2 p-3">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="gap-2"
                        onClick={() => setPreview(doc)}
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        asChild
                      >
                        <a href={doc.url} target="_blank" rel="noreferrer">
                          <Download className="h-4 w-4" />
                          Open
                        </a>
                      </Button>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium truncate" title={doc.name}>
                        {doc.name}
                      </p>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatBytes(doc.size)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Uploaded: {formatDate(doc.uploadedAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Preview Dialog */}
      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="truncate">{preview?.name}</DialogTitle>
          </DialogHeader>

          {preview ? (
            <div className="mt-3 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{preview.type}</Badge>
                <Badge variant="secondary">{formatBytes(preview.size)}</Badge>
                <span
                  className={cn(
                    "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
                    statusClasses(preview.status)
                  )}
                >
                  {preview.status}
                </span>

                <div className="ml-auto flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={preview.url} target="_blank" rel="noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Open in new tab
                    </a>
                  </Button>
                </div>
              </div>

              {isImage(preview.type) ? (
                <img
                  src={preview.url}
                  alt={preview.name}
                  className="w-full h-auto rounded-lg border bg-muted/30"
                />
              ) : (
                <iframe
                  src={preview.url}
                  className="w-full h-[70vh] rounded-lg border"
                  title={preview.name}
                />
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
