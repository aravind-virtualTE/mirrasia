/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  FileText,
  Loader2,
  PlusCircle,
  RefreshCw,
  Search,
  Upload,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  deleteMcapCompanyDocument,
  deleteMcapDocumentComment,
  getMcapCompanyDocuments,
  upsertMcapDocumentComment,
  uploadMcapCompanyDocuments,
} from "@/services/dataFetch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Company,
  Document,
  DocumentComment,
  DocumentType,
} from "@/components/companyDocumentManager/cdm";
import DocumentTableWithComments from "@/components/companyDocumentManager/DocumentTableWithComments";

interface McapCompanyDocumentCenterProps {
  companyId: string;
  countryCode: string;
  companyName?: string;
}

const getDocId = (doc?: Document | null) =>
  (doc?._id?.toString?.() || doc?.id?.toString?.() || "").toLowerCase();
const isMongoDocId = (id: string) => /^[a-f0-9]{24}$/.test(String(id || "").toLowerCase());

const docTypeFromTab = (tab: DocumentType): "companyDocs" | "kycDocs" | "letterDocs" => {
  if (tab === "kyc") return "kycDocs";
  if (tab === "letters") return "letterDocs";
  return "companyDocs";
};

const getDocsByType = (company: Company, type: DocumentType): Document[] => {
  if (type === "kyc") return company.kycDocs || [];
  if (type === "letters") return company.letterDocs || [];
  return company.companyDocs || [];
};

const setDocsByType = (company: Company, type: DocumentType, docs: Document[]) => {
  if (type === "kyc") company.kycDocs = docs;
  else if (type === "letters") company.letterDocs = docs;
  else company.companyDocs = docs;
};

const buildSlimCompanyPayload = (company: Company, type: DocumentType): Company => {
  const base = {
    id: company.id,
    companyName: company.companyName,
    country: company.country,
    companyDocs: [] as Document[],
    kycDocs: [] as Document[],
    letterDocs: [] as Document[],
  };

  if (type === "company") base.companyDocs = company.companyDocs || [];
  if (type === "kyc") base.kycDocs = company.kycDocs || [];
  if (type === "letters") base.letterDocs = company.letterDocs || [];

  return base;
};

const mergeByDocName = (oldDocs: Document[] = [], serverDocs: Document[] = []) => {
  if (!serverDocs.length) return oldDocs;

  const normalizeServer = (d: any): Document => ({
    ...d,
    _id: d._id ?? d.id,
    id: (d._id ?? d.id)?.toString?.() ?? d.id,
  });

  const serverByName = new Map(serverDocs.map((d: any) => [d.docName, normalizeServer(d)]));

  const merged = oldDocs.map((local: any) => {
    const server = serverByName.get(local.docName);
    if (!server) return local;
    return {
      ...local,
      ...server,
      _id: server._id ?? local._id,
      id: (server._id ?? server.id ?? local._id ?? local.id)?.toString?.(),
    };
  });

  const existingNames = new Set(oldDocs.map((d) => d.docName));
  const newOnes = serverDocs
    .filter((d) => !existingNames.has(d.docName))
    .map((d: any) => normalizeServer(d));

  return [...merged, ...newOnes];
};

const McapCompanyDocumentCenter: React.FC<McapCompanyDocumentCenterProps> = ({
  companyId,
  countryCode,
  companyName,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [company, setCompany] = useState<Company | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, DocumentComment[]>>({});
  const [activeTab, setActiveTab] = useState<DocumentType>("company");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isCompanyMissing, setIsCompanyMissing] = useState(false);

  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") as string)
    : null;
  const userId = user?.id || user?._id || "";

  const fetchCompanyDocuments = async () => {
    setIsLoading(true);
    setCurrentUserId(String(userId || ""));
    try {
      const resp = await getMcapCompanyDocuments(String(companyId));
      const payload = resp?.company ? resp : {};
      const serverCompany: Company | null = payload?.company || null;
      setCommentsMap(payload?.commentsMap ?? {});

      if (serverCompany?.id) {
        setCompany(serverCompany);
        setIsCompanyMissing(false);
      } else {
        setCompany({
          id: companyId,
          companyName: companyName || "Company",
          country: { code: countryCode, name: countryCode },
          companyDocs: [],
          kycDocs: [],
          letterDocs: [],
        });
        setIsCompanyMissing(true);
      }
    } catch (error) {
      console.error("Failed to fetch company docs:", error);
      toast({
        title: "Load failed",
        description: "Unable to load company documents.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, countryCode]);

  const currentDocs = useMemo(() => {
    if (!company) return [];
    const docs = getDocsByType(company, activeTab);
    const q = searchQuery.trim().toLowerCase();
    if (!q) return docs;
    return docs.filter((doc) => {
      const name = String(doc.docName || "").toLowerCase();
      const uploadedBy = String(doc.uploadedBy || "").toLowerCase();
      return name.includes(q) || uploadedBy.includes(q);
    });
  }, [company, activeTab, searchQuery]);

  const companyDocCount = company?.companyDocs?.length || 0;
  const kycDocCount = company?.kycDocs?.length || 0;
  const letterDocCount = company?.letterDocs?.length || 0;
  const totalDocs = companyDocCount + kycDocCount + letterDocCount;

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      setUploadedFiles(filesArray);
      toast({
        title: "Files ready",
        description: `${filesArray.length} file(s) ready to upload.`,
      });
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setUploadedFiles(filesArray);
      toast({
        title: "Files selected",
        description: `${filesArray.length} file(s) selected.`,
      });
    }
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const saveDocuments = async () => {
    if (!company || uploadedFiles.length === 0) return;

    const previousCompany = company;
    const optimisticCompany = structuredClone(company);
    const existingDocs = getDocsByType(optimisticCompany, activeTab);
    const freshDocs: Document[] = uploadedFiles.map((file, idx) => ({
      id: `tmp-${Date.now()}-${idx}`,
      docName: file.name,
      docUrl: "",
      file,
      type: activeTab,
    }));
    setDocsByType(optimisticCompany, activeTab, [...existingDocs, ...freshDocs]);

    setCompany(optimisticCompany);
    setUploadedFiles([]);
    setShowUploadSection(false);
    setIsUpdating(true);

    try {
      const slimPayload = buildSlimCompanyPayload(optimisticCompany, activeTab);
      const uploadResp = await uploadMcapCompanyDocuments(String(optimisticCompany.id), [slimPayload]);
      const res = Array.isArray(uploadResp) ? uploadResp : uploadResp ? [uploadResp] : [];

      if (Array.isArray(res) && res.length > 0) {
        const serverItem = res.find((item: any) => String(item.id) === String(optimisticCompany.id)) || res[0];
        const patched = structuredClone(optimisticCompany);

        if (activeTab === "company") {
          patched.companyDocs = mergeByDocName(patched.companyDocs || [], serverItem.companyDocs || []);
        } else if (activeTab === "kyc") {
          patched.kycDocs = mergeByDocName(patched.kycDocs || [], serverItem.kycDocs || []);
        } else {
          patched.letterDocs = mergeByDocName(patched.letterDocs || [], serverItem.letterDocs || []);
        }

        setCompany(patched);
      } else {
        setCompany(previousCompany);
      }

      toast({
        title: "Upload complete",
        description: `Documents saved under ${company.companyName}.`,
      });
    } catch (error) {
      console.error("Upload failed:", error);
      setCompany(previousCompany);
      toast({
        title: "Upload failed",
        description: "Unable to save documents. Please retry.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteDocument = async () => {
    if (!company || !documentToDelete) return;

    const previousCompany = company;
    const nextCompany = structuredClone(company);
    const docId = getDocId(documentToDelete);
    const nextDocs = getDocsByType(nextCompany, activeTab).filter((doc) => getDocId(doc) !== docId);
    setDocsByType(nextCompany, activeTab, nextDocs);
    setCompany(nextCompany);
    if (previewDoc && getDocId(previewDoc) === docId) setPreviewDoc(null);
    setDocumentToDelete(null);
    setIsUpdating(true);

    try {
      if (!docId) throw new Error("Missing document id");
      await deleteMcapCompanyDocument(String(company.id), String(docId));
      toast({
        title: "Deleted",
        description: "Document removed successfully.",
      });
    } catch (error) {
      console.error("Delete failed:", error);
      setCompany(previousCompany);
      toast({
        title: "Delete failed",
        description: "Could not delete this document.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTogglePreview = (doc: Document) => {
    const current = getDocId(previewDoc);
    const next = getDocId(doc);
    if (current && current === next) {
      setPreviewDoc(null);
      return;
    }
    setPreviewDoc(doc);
  };

  const handleAddComment = async (docId: string, text: string) => {
    if (!company || !currentUserId) return;
    if (!isMongoDocId(docId)) {
      toast({
        title: "Invalid document",
        description: "This document cannot be commented yet. Please refresh and retry.",
        variant: "destructive",
      });
      return;
    }
    try {
      setIsUpdating(true);
      const resp = await upsertMcapDocumentComment(String(company.id), {
        docId,
        docType: docTypeFromTab(activeTab),
        text,
      });
      const comment: DocumentComment | undefined = resp?.comment;
      if (!comment?._id) throw new Error("Invalid comment response");
      setCommentsMap((prev) => ({
        ...prev,
        [docId]: [...(prev[docId] || []), comment],
      }));
      toast({ title: "Comment added", description: "Your comment was posted." });
    } catch (error) {
      console.error(error);
      toast({
        title: "Comment failed",
        description: "Unable to add comment.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditComment = async (docId: string, commentId: string, text: string) => {
    if (!company || !currentUserId) return;
    if (!isMongoDocId(docId)) {
      toast({
        title: "Invalid document",
        description: "This document cannot be commented yet. Please refresh and retry.",
        variant: "destructive",
      });
      return;
    }
    try {
      setIsUpdating(true);
      const resp = await upsertMcapDocumentComment(String(company.id), {
        _id: commentId,
        docId,
        docType: docTypeFromTab(activeTab),
        text,
      });
      const updated: DocumentComment | undefined = resp?.comment;
      if (!updated?._id) throw new Error("Invalid comment response");
      setCommentsMap((prev) => ({
        ...prev,
        [docId]: (prev[docId] || []).map((c) => (c._id === updated._id ? updated : c)),
      }));
      toast({ title: "Comment updated", description: "Your comment was saved." });
    } catch (error) {
      console.error(error);
      toast({
        title: "Update failed",
        description: "Unable to update comment.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteComment = async (docId: string, commentId: string) => {
    if (!currentUserId) return;
    try {
      setIsUpdating(true);
      const resp = await deleteMcapDocumentComment(String(companyId), commentId, {
        userId: currentUserId,
      });
      const deletedId = resp?.deletedId || commentId;
      setCommentsMap((prev) => ({
        ...prev,
        [docId]: (prev[docId] || []).filter((comment) => comment._id !== deletedId),
      }));
      toast({ title: "Comment deleted", description: "Comment removed." });
    } catch (error) {
      console.error(error);
      toast({
        title: "Delete failed",
        description: "Unable to remove comment.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border p-10">
        <div className="flex items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading document center...</span>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
        Document center is unavailable.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="border-0 shadow-sm ring-1 ring-border/50">
        <CardContent className="space-y-4 p-4 md:p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Company Document Center</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                {company.companyName || companyName || "Company"} ({countryCode})
              </p>
              {isCompanyMissing && (
                <p className="mt-1 text-xs text-amber-600">
                  No existing record found in the document store yet. Uploading will initialize this company record.
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchCompanyDocuments}
                disabled={isUpdating}
                className="inline-flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setShowUploadSection((prev) => !prev);
                  setUploadedFiles([]);
                }}
                disabled={isUpdating}
                className="inline-flex items-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Add Documents
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-lg border bg-card p-3">
              <div className="text-xs text-muted-foreground">Total</div>
              <div className="mt-1 text-xl font-semibold">{totalDocs}</div>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <div className="text-xs text-muted-foreground">Company Docs</div>
              <div className="mt-1 text-xl font-semibold">{companyDocCount}</div>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <div className="text-xs text-muted-foreground">KYC Docs</div>
              <div className="mt-1 text-xl font-semibold">{kycDocCount}</div>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <div className="text-xs text-muted-foreground">Letters</div>
              <div className="mt-1 text-xl font-semibold">{letterDocCount}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm ring-1 ring-border/50">
        <CardContent className="space-y-4 p-4 md:p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DocumentType)} className="w-full lg:w-auto">
              <TabsList className="grid w-full grid-cols-3 lg:w-[360px]">
                <TabsTrigger value="company">Company</TabsTrigger>
                <TabsTrigger value="kyc">KYC / CDD</TabsTrigger>
                <TabsTrigger value="letters">Letters</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative w-full lg:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by filename or uploader"
                className="pl-9"
              />
            </div>
          </div>

          {showUploadSection && (
            <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
              <div
                className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                  dragActive ? "border-primary bg-primary/5" : "border-border"
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 font-medium">Upload {activeTab === "company" ? "Company Docs" : activeTab === "kyc" ? "KYC Docs" : "Letters"}</p>
                <p className="mt-1 text-sm text-muted-foreground">Drag and drop files here, or browse from your device.</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png"
                />
                <Button variant="outline" className="mt-4" type="button" onClick={() => fileInputRef.current?.click()}>
                  Browse Files
                </Button>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-3">
                  <div className="text-sm font-medium">Ready to upload</div>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-md border bg-card px-3 py-2">
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{file.name}</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeUploadedFile(index)} disabled={isUpdating}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button onClick={saveDocuments} disabled={isUpdating} className="sm:flex-1">
                      {isUpdating ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </span>
                      ) : (
                        "Save Documents"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowUploadSection(false);
                        setUploadedFiles([]);
                      }}
                      disabled={isUpdating}
                      className="sm:flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid gap-4 xl:grid-cols-3">
            <div className="xl:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{currentDocs.length}</span> document(s)
                </div>
                <Badge variant="outline">{activeTab.toUpperCase()}</Badge>
              </div>
              <DocumentTableWithComments
                documents={currentDocs}
                commentsMap={commentsMap}
                onToggleExpand={handleTogglePreview}
                onConfirmDelete={setDocumentToDelete}
                onAddComment={handleAddComment}
                onEditComment={handleEditComment}
                onDeleteComment={handleDeleteComment}
                currentUserId={currentUserId}
                isUpdating={isUpdating}
                expandedDoc={null}
              />
            </div>

            <Card className="h-full min-h-[380px]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {previewDoc?.docUrl ? (
                  <>
                    <div className="text-sm font-medium truncate" title={previewDoc.docName}>
                      {previewDoc.docName}
                    </div>
                    <div className="overflow-hidden rounded-md border">
                      <iframe
                        src={previewDoc.docUrl}
                        title={previewDoc.docName}
                        className="h-[480px] w-full border-0"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <a href={previewDoc.docUrl} target="_blank" rel="noreferrer">
                          Open in new tab
                        </a>
                      </Button>
                      <Button variant="ghost" size="sm" className="flex-1" onClick={() => setPreviewDoc(null)}>
                        Clear
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex h-[520px] flex-col items-center justify-center rounded-md border border-dashed p-4 text-center">
                    <FileText className="mb-2 h-8 w-8 text-muted-foreground" />
                    <div className="text-sm font-medium">Select a document to preview</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Click the View action from the table to load preview here.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!documentToDelete} onOpenChange={(open) => !open && setDocumentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{documentToDelete?.docName || "document"}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteDocument();
              }}
              disabled={isUpdating}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isUpdating ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </span>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default McapCompanyDocumentCenter;
