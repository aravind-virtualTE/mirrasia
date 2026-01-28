/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from "react";
import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PlusCircle,
  Upload,
  FileText,
  X,
  Minimize2,
  Shield,
  Mail,
  Building,
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import jwtDecode from "jwt-decode";
import type { TokenData } from "@/middleware/ProtectedRoutes";
import { useNavigate, useParams } from "react-router-dom";
import { deleteCompanyDoc, getCompDocs, uploadCompanyDocs } from "@/services/dataFetch";
import SearchSelectNew from "../SearchSelect2";
import { Company, DocumentComment ,DocumentType,Document, upsertDocumentComment, deleteDocumentComment} from "./cdm";

import DocumentTableWithComments from "./DocumentTableWithComments";



const CompanyDocumentManager: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { countryCode, id } = useParams();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [documentToReplace, setDocumentToReplace] = useState<Document | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [expandedDoc, setExpandedDoc] = useState<Document | null>(null);
  const [showUploadSection, setShowUploadSection] = useState<boolean>(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [activeTab, setActiveTab] = useState<DocumentType>("company");
  const [currentDocumentType, setCurrentDocumentType] = useState<DocumentType>("company");
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();

  const token = (typeof window !== "undefined" ? localStorage.getItem("token") : null) as string;

  const [selectedValue, setSelectedValue] = useState(
    selectedCompany ? { id: selectedCompany.id, name: selectedCompany.companyName } : { id: "", name: "" }
  );

  // -------- Comments state + current user --------
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  const [commentsMap, setCommentsMap] = useState<Record<string, DocumentComment[]>>({});
  // Decode once (avoid decoding per render)
  const decodedToken = useMemo(() => {
    try {
      return token ? jwtDecode<TokenData>(token) : null;
    } catch {
      return null;
    }
  }, [token]);

  // map UI tab -> backend docType enum
  const docTypeFromTab = (tab: DocumentType): "companyDocs" | "kycDocs" | "letterDocs" => {
    if (tab === "kyc") return "kycDocs";
    if (tab === "letters") return "letterDocs";
    return "companyDocs";
  };

  useEffect(() => {
    const fetchComp = async () => {
      try {
        if (!decodedToken?.userId) return;

        setCurrentUserId(decodedToken.userId);

        const resp = await getCompDocs(`${decodedToken.userId}`);

        // expected backend response shape:
        // { companies: Company[], commentsMap: Record<string, DocumentComment[]> }
        const list = resp?.companies ?? resp ?? [];
        const cm = resp?.commentsMap ?? {};

        setCompanies(list);
        setCommentsMap(cm);

        if (list.length > 0) {
          if (id && countryCode) {
            const result = list.find((c: { id: string }) => c.id === id);
            const chosen = result || list[0];
            setSelectedCompany(chosen);
            setSelectedValue({ id: chosen.id, name: chosen.companyName });
          } else {
            setSelectedCompany(list[0]);
            setSelectedValue({ id: list[0].id, name: list[0].companyName });
          }

          setUploadedFiles([]);
          setDocumentToReplace(null);
          setExpandedDoc(null);
          setShowUploadSection(false);
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };

    if (token) fetchComp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------- Drag & Drop --------------------
  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      setUploadedFiles(filesArray);
      toast({ title: "Files ready for upload", description: `${filesArray.length} file(s) added successfully.` });
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setUploadedFiles(filesArray);
      toast({ title: "Files selected", description: `${filesArray.length} file(s) selected successfully.` });
    }
  };

  const openFileBrowser = (): void => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  // -------------------- Add/Replace --------------------
  const handleAddNewDocument = (): void => {
    setDocumentToReplace(null);
    setCurrentDocumentType(activeTab);
    setShowUploadSection(true);
  };

  // ---- helpers (existing) ----
  const buildSlimCompanyPayload = (company: Company, type: DocumentType): Company => {
    const base = {
      id: company.id,
      companyName: company.companyName,
      country: company.country,
      companyDocs: [] as Document[],
      kycDocs: [] as Document[],
      letterDocs: [] as Document[],
    };

    if (type === "company") base.companyDocs = company.companyDocs ?? [];
    if (type === "kyc") base.kycDocs = company.kycDocs ?? [];
    if (type === "letters") base.letterDocs = company.letterDocs ?? [];

    return base;
  };

 const mergeByDocName = (oldDocs: Document[] = [], serverDocs: Document[] = []) => {
  if (!serverDocs.length) return oldDocs;

  const normalizeServer = (d: any) => ({
    ...d,
    _id: d._id ?? d.id,
    id: (d._id ?? d.id)?.toString?.() ?? d.id, // force id = real mongo id
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


  // ---- existing saveDocuments (unchanged logic) ----
  const saveDocuments = async (): Promise<void> => {
    if (!selectedCompany) return;

    const prevCompanies = companies;
    const companyIndex = companies.findIndex((c) => c.id === selectedCompany.id);
    if (companyIndex === -1) return;

    const readDocs = (c: Company, t: DocumentType) =>
      t === "kyc" ? c.kycDocs ?? [] : t === "letters" ? c.letterDocs ?? [] : c.companyDocs ?? [];

    const writeDocs = (c: Company, t: DocumentType, docs: Document[]) => {
      if (t === "kyc") c.kycDocs = docs;
      else if (t === "letters") c.letterDocs = docs;
      else c.companyDocs = docs;
    };

    const optimisticCompanies = structuredClone(companies);
    const optimisticCompany = optimisticCompanies[companyIndex];
    const currentDocs = readDocs(optimisticCompany, currentDocumentType);

    let optimisticDocs: Document[] = currentDocs;

    if (documentToReplace) {
      const idx = currentDocs.findIndex((d) => d.id === documentToReplace.id);
      if (idx !== -1 && uploadedFiles.length > 0) {
        const file = uploadedFiles[0];
        optimisticDocs = currentDocs.map((d, i) =>
          i === idx ? { ...d, docName: file.name, file, docUrl: "", type: currentDocumentType } : d
        );
      }
    } else {
      const newDocs: Document[] = uploadedFiles.map((file, i) => ({
        id: `${Date.now()}-${i}`,
        docName: file.name,
        file,
        docUrl: "",
        type: currentDocumentType,
      }));
      optimisticDocs = [...currentDocs, ...newDocs];
    }

    writeDocs(optimisticCompany, currentDocumentType, optimisticDocs);

    setCompanies(optimisticCompanies);
    setSelectedCompany(optimisticCompany);
    setUploadedFiles([]);
    setDocumentToReplace(null);
    setShowUploadSection(false);

    try {
      setIsUpdating(true);

      const slimPayload = buildSlimCompanyPayload(optimisticCompany, currentDocumentType);

      const res: Array<{
        id: string;
        companyName: string;
        country: Company["country"];
        companyDocs?: Document[];
        kycDocs?: Document[];
        letterDocs?: Document[];
      }> = await uploadCompanyDocs([slimPayload]);
      console.log("res---->",res)
      if (Array.isArray(res) && res.length > 0) {
        const serverItem = res.find((r) => r.id === optimisticCompany.id) ?? res[0];

        const patchCompany = (c: Company): Company => {
          if (c.id !== serverItem.id) return c;
          const next = { ...c };
          if (currentDocumentType === "company") next.companyDocs = mergeByDocName(c.companyDocs ?? [], serverItem.companyDocs ?? []);
          else if (currentDocumentType === "kyc") next.kycDocs = mergeByDocName(c.kycDocs ?? [], serverItem.kycDocs ?? []);
          else next.letterDocs = mergeByDocName(c.letterDocs ?? [], serverItem.letterDocs ?? []);
          return next;
        };

        setCompanies((prev) => prev.map(patchCompany));
        setSelectedCompany((prev) => (prev ? patchCompany(prev) : prev));
      }

      toast({
        title: documentToReplace ? "Document replaced" : "Documents added",
        description: `Successfully ${documentToReplace ? "replaced document" : "added new documents"} to ${optimisticCompany.companyName}.`,
      });
    } catch (err) {
      console.error("Error uploading documents:", err);
      setCompanies(prevCompanies);
      setSelectedCompany(prevCompanies[companyIndex]);
      toast({ title: "Error", description: "Failed to upload documents. Please try again." });
    } finally {
      setIsUpdating(false);
    }
  };

  // -------------------- Misc handlers --------------------
  const removeUploadedFile = (index: number): void => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleExpandDocument = (document: Document): void => {
    if (expandedDoc && expandedDoc.id === document.id) setExpandedDoc(null);
    else setExpandedDoc(document);
  };

  const confirmDeleteDocument = (document: Document): void => {
    setDocumentToDelete(document);
  };

  // -------------------- Delete (existing) --------------------
  const deleteDocument = async (): Promise<void> => {
    if (!selectedCompany || !documentToDelete) return;
    const updatedCompanies = [...companies];
    const companyIndex = updatedCompanies.findIndex((c) => c.id === selectedCompany.id);
    if (companyIndex === -1) return;

    const docType = activeTab || "company";

    const getDocumentArray = (type: DocumentType) => {
      switch (type) {
        case "kyc":
          return updatedCompanies[companyIndex].kycDocs || [];
        case "letters":
          return updatedCompanies[companyIndex].letterDocs || [];
        case "company":
        default:
          return updatedCompanies[companyIndex].companyDocs || [];
      }
    };

    const getDocumentType = (type: DocumentType) => {
      switch (type) {
        case "kyc":
          return "kycDocs";
        case "letters":
          return "letterDocs";
        case "company":
        default:
          return "companyDocs";
      }
    };

    const setDocumentArray = (type: DocumentType, docs: Document[]) => {
      switch (type) {
        case "kyc":
          updatedCompanies[companyIndex].kycDocs = docs;
          break;
        case "letters":
          updatedCompanies[companyIndex].letterDocs = docs;
          break;
        case "company":
        default:
          updatedCompanies[companyIndex].companyDocs = docs;
          break;
      }
    };

    const currentDocs = getDocumentArray(docType);
    const docIndex = currentDocs.findIndex((doc) => doc.id === documentToDelete.id);
    if (docIndex !== -1) {
      const updatedDocs = currentDocs.filter((_, index) => index !== docIndex);
      setDocumentArray(docType, updatedDocs);
      setCompanies(updatedCompanies);
      setSelectedCompany(updatedCompanies[companyIndex]);
      setDocumentToDelete(null);

      try {
        setIsUpdating(true);
        const payload = JSON.stringify({
          docType: getDocumentType(docType),
          docId: selectedCompany.id,
          country: selectedCompany.country,
          ...documentToDelete,
        });
        await deleteCompanyDoc(payload);

        toast({
          title: "Document deleted",
          description: `Successfully deleted document from ${selectedCompany.companyName}.`,
        });
      } catch (error) {
        console.error("Error deleting document:", error);
        toast({ title: "Error", description: "Failed to delete document. Please try again." });
      } finally {
        setIsUpdating(false);
      }
    }
  };

  // -------------------- Tabs helpers --------------------
  const getTabIcon = (tab: DocumentType) => {
    switch (tab) {
      case "kyc":
        return <Shield className="h-4 w-4" />;
      case "letters":
        return <Mail className="h-4 w-4" />;
      case "company":
      default:
        return <Building className="h-4 w-4" />;
    }
  };

  const getTabLabel = (tab: DocumentType) => {
    switch (tab) {
      case "kyc":
        return "KYC/CDD";
      case "letters":
        return "Letters";
      case "company":
      default:
        return "Company Docs";
    }
  };

  // -------------------- Company select --------------------
  const handleCurrencySelect = (item: { id: string; name: string } | null) => {
    if (item === null) {
      setSelectedCompany(null);
      setSelectedValue({ id: "", name: "" });
      return;
    }

    setSelectedValue(item);
    const company = companies.find((c) => c.id === item.id);
    if (company) {
      setSelectedCompany(company);
      setUploadedFiles([]);
      setDocumentToReplace(null);
      setExpandedDoc(null);
      setShowUploadSection(false);
    }
  };

  const filteredCompanies = companies.map((company) => ({ id: company.id, name: company.companyName }));

  // -------------------- REAL Comments handlers --------------------
  // NOTE: we update state ONLY from API response (no synthetic objects)

  const handleAddComment = async (docId: string, text: string) => {
    if (!decodedToken?.userId) return;
    if (!selectedCompany) return;

    try {
      setIsUpdating(true);

      const resp = await upsertDocumentComment({
        docId,
        companyId: selectedCompany.id,
        docType: docTypeFromTab(activeTab),
        text,
        userId: decodedToken.userId,
      });

      const comment: DocumentComment | undefined = resp?.comment;
      if (!comment?._id) throw new Error("Invalid comment response");

      setCommentsMap((prev) => ({
        ...prev,
        [docId]: [...(prev[docId] || []), comment],
      }));

      toast({ title: "Comment added", description: "Your comment has been posted." });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to add comment. Please try again." });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditComment = async (docId: string, commentId: string, text: string) => {
    if (!decodedToken?.userId) return;
    if (!selectedCompany) return;

    try {
      setIsUpdating(true);

      const resp = await upsertDocumentComment({
        _id: commentId,
        docId,
        companyId: selectedCompany.id,
        docType: docTypeFromTab(activeTab),
        text,
        userId: decodedToken.userId,
      });

      const updated: DocumentComment | undefined = resp?.comment;
      if (!updated?._id) throw new Error("Invalid comment response");

      setCommentsMap((prev) => ({
        ...prev,
        [docId]: (prev[docId] || []).map((c) => (c._id === updated._id ? updated : c)),
      }));

      toast({ title: "Comment updated", description: "Your comment has been saved." });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to update comment. Please try again." });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteComment = async (docId: string, commentId: string) => {
    if (!decodedToken?.userId) return;

    try {
      setIsUpdating(true);

      const resp = await deleteDocumentComment(commentId, decodedToken.userId);

      const deletedId = resp?.deletedId || commentId;

      setCommentsMap((prev) => ({
        ...prev,
        [docId]: (prev[docId] || []).filter((c) => c._id !== deletedId),
      }));

      toast({ title: "Comment deleted", description: "Your comment has been removed." });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to delete comment. Please try again." });
    } finally {
      setIsUpdating(false);
    }
  };

  // -------------------- Render --------------------
  return (
    <div className="w-full max-width mx-auto p-6">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold mb-4">Company Document Manager</h1>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {companies.length === 0 && (
            <div className="rounded-md bg-muted text-muted-foreground p-2 text-sm">No companies found</div>
          )}
          <Button onClick={() => navigate(-1)} size="sm" className="flex items-center gap-2">
            Return to Previous Details
          </Button>
          <SearchSelectNew
            items={filteredCompanies}
            placeholder="Select a Company"
            onSelect={handleCurrencySelect}
            selectedItem={selectedValue}
            disabled={false}
          />
        </div>
      </div>

      {selectedCompany && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Documents for {selectedCompany.companyName}</h2>
            {!expandedDoc && (
              <Button onClick={handleAddNewDocument} variant="outline" className="flex items-center gap-2" disabled={isUpdating}>
                <PlusCircle className="h-4 w-4" />
                Add New Document
              </Button>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DocumentType)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="company" className="flex items-center gap-2">
                {getTabIcon("company")}
                {getTabLabel("company")}
              </TabsTrigger>
              <TabsTrigger value="kyc" className="flex items-center gap-2">
                {getTabIcon("kyc")}
                {getTabLabel("kyc")}
              </TabsTrigger>
              <TabsTrigger value="letters" className="flex items-center gap-2">
                {getTabIcon("letters")}
                {getTabLabel("letters")}
              </TabsTrigger>
            </TabsList>

            {/* --- UPDATED: use DocumentTableWithComments instead of DocumentTable --- */}
            <TabsContent value="company" className="mt-6">
              <DocumentTableWithComments
                documents={selectedCompany.companyDocs || []}
                commentsMap={commentsMap}
                onToggleExpand={toggleExpandDocument}
                onConfirmDelete={confirmDeleteDocument}
                onAddComment={handleAddComment}
                onEditComment={handleEditComment}
                onDeleteComment={handleDeleteComment}
                currentUserId={currentUserId}
                isUpdating={isUpdating}
                expandedDoc={expandedDoc}
              />
            </TabsContent>

            <TabsContent value="kyc" className="mt-6">
              <DocumentTableWithComments
                documents={selectedCompany.kycDocs || []}
                commentsMap={commentsMap}
                onToggleExpand={toggleExpandDocument}
                onConfirmDelete={confirmDeleteDocument}
                onAddComment={handleAddComment}
                onEditComment={handleEditComment}
                onDeleteComment={handleDeleteComment}
                currentUserId={currentUserId}
                isUpdating={isUpdating}
                expandedDoc={expandedDoc}
              />
            </TabsContent>

            <TabsContent value="letters" className="mt-6">
              <DocumentTableWithComments
                documents={selectedCompany.letterDocs || []}
                commentsMap={commentsMap}
                onToggleExpand={toggleExpandDocument}
                onConfirmDelete={confirmDeleteDocument}
                onAddComment={handleAddComment}
                onEditComment={handleEditComment}
                onDeleteComment={handleDeleteComment}
                currentUserId={currentUserId}
                isUpdating={isUpdating}
                expandedDoc={expandedDoc}
              />
            </TabsContent>
          </Tabs>

          {expandedDoc && (
            <div className="mb-8 mt-6 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <h3 className="text-lg font-medium">{expandedDoc.docName}</h3>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleExpandDocument(expandedDoc)}
                    className="flex items-center gap-1"
                  >
                    <Minimize2 className="h-4 w-4" />
                    Minimize
                  </Button>
                </div>
              </div>
              <div className="flex justify-center bg-gray-100 p-4 rounded-lg flex-grow">
                <iframe
                  src={expandedDoc.docUrl}
                  title={expandedDoc.docName}
                  className="w-full h-[calc(100vh-120px)] border-none"
                />
              </div>
            </div>
          )}

          {showUploadSection && (
            <>
              <div
                className={`border-2 border-dashed rounded-lg p-6 mb-4 text-center mt-6 ${
                  dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <h3 className="text-lg font-medium mb-2">
                  {documentToReplace
                    ? `Replace "${documentToReplace.docName}"`
                    : `Upload New ${getTabLabel(currentDocumentType)}`}
                </h3>
                <p className="text-sm text-gray-500 mb-4">Drag and drop files here or click to browse</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  multiple={!documentToReplace}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png"
                />
                <Button variant="outline" className="cursor-pointer" type="button" onClick={openFileBrowser} disabled={isUpdating}>
                  Browse Files
                </Button>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-md font-medium mb-2">Files to upload:</h3>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          <span className="text-sm">{file.name}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeUploadedFile(index)} type="button" disabled={isUpdating}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button onClick={saveDocuments} type="button" disabled={isUpdating}>
                      {isUpdating ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving…
                        </span>
                      ) : documentToReplace ? (
                        "Replace Document"
                      ) : (
                        "Save New Documents"
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowUploadSection(false);
                        setUploadedFiles([]);
                        setDocumentToReplace(null);
                      }}
                      type="button"
                      disabled={isUpdating}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Delete confirmation modal */}
      {documentToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Document</h3>
            <p className="mb-4 text-gray-600">
              Are you sure you want to delete "{documentToDelete.docName}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDocumentToDelete(null)} disabled={isUpdating}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={deleteDocument} disabled={isUpdating}>
                {isUpdating ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting…
                  </span>
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Global loader overlay */}
      {isUpdating && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <div className="flex items-center gap-3 rounded-lg bg-white px-4 py-3 shadow-lg">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">Updating documents…</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDocumentManager;