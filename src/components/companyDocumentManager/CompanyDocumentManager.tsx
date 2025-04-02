import React, { useState, useRef, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Card,
  CardContent
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  PlusCircle,
  Upload,
  FileText,
  X,
  Maximize2,
  Minimize2,
  Trash
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { deleteCompanyDoc, getCompDocs, uploadCompanyDocs } from '@/services/dataFetch';
import jwtDecode from 'jwt-decode';
import { TokenData } from '@/middleware/ProtectedRoutes';

// Define types
interface Document {
  id: string;
  docName: string;
  docUrl: string;
  file?: File;
}

export interface Company {
  id: string;
  companyName: string;
  companyDocs: Document[];
}

const CompanyDocumentManager: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [documentToReplace, setDocumentToReplace] = useState<Document | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [expandedDoc, setExpandedDoc] = useState<Document | null>(null);
  const [showUploadSection, setShowUploadSection] = useState<boolean>(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const token = localStorage.getItem("token") as string;

  useEffect(() => {
    const fetchComp = async () => {
      try {
        const decodedToken = jwtDecode<TokenData>(token);
        const response = await getCompDocs(`${decodedToken.userId}`);
        const data = await response;
        setCompanies(data);
        if (data.length > 0) {
          setSelectedCompany(data[0]);
          setUploadedFiles([]);
          setDocumentToReplace(null);
          setExpandedDoc(null);
          setShowUploadSection(false);
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
      }
    };
    fetchComp();
  }, []);

  // Handle company selection
  const handleCompanySelect = (companyId: string): void => {
    const company = companies.find(c => c.id === companyId);
    if (company) {
      setSelectedCompany(company);
      setUploadedFiles([]);
      setDocumentToReplace(null);
      setExpandedDoc(null);
      setShowUploadSection(false);
    }
  };

  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      setUploadedFiles(filesArray);
      toast({
        title: "Files ready for upload",
        description: `${filesArray.length} file(s) added successfully.`,
      });
    }
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setUploadedFiles(filesArray);
      toast({
        title: "Files selected",
        description: `${filesArray.length} file(s) selected successfully.`,
      });
    }
  };

  // Open file browser
  const openFileBrowser = (): void => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Add new document handler
  const handleAddNewDocument = (): void => {
    setDocumentToReplace(null);
    setShowUploadSection(true);
  };

  // Save uploaded documents
  const saveDocuments = async (): Promise<void> => {
    if (!selectedCompany) return;

    const updatedCompanies = [...companies];
    const companyIndex = updatedCompanies.findIndex(c => c.id === selectedCompany.id);
    if (companyIndex === -1) return;

    if (documentToReplace) {
      // Replace existing document by storing the new file
      const docIndex = updatedCompanies[companyIndex].companyDocs.findIndex(
        doc => doc.id === documentToReplace.id
      );
      if (docIndex !== -1 && uploadedFiles.length > 0) {
        updatedCompanies[companyIndex].companyDocs[docIndex] = {
          ...documentToReplace,
          docName: uploadedFiles[0].name,
          file: uploadedFiles[0],
          docUrl: ''
        };
      }
    } else {
      // Add new documents, storing the file itself
      const newDocuments: Document[] = uploadedFiles.map((file, index) => ({
        id: `${Date.now()}-${index}`,
        docName: file.name,
        file: file,
        docUrl: ''
      }));

      updatedCompanies[companyIndex].companyDocs = [
        ...updatedCompanies[companyIndex].companyDocs,
        ...newDocuments
      ];
    }

    setCompanies(updatedCompanies);
    setSelectedCompany(updatedCompanies[companyIndex]);
    setUploadedFiles([]);
    setDocumentToReplace(null);
    setShowUploadSection(false);

    // Send data to backend
    try {
      // console.log('Updated companies:', updatedCompanies);
      await uploadCompanyDocs(updatedCompanies);
      toast({
        title: documentToReplace ? "Document replaced" : "Documents added",
        description: `Successfully ${documentToReplace ? 'replaced document' : 'added new documents'} to ${selectedCompany.companyName}.`,
      });
    } catch (error) {
      console.error('Error uploading documents:', error);
      toast({
        title: "Error",
        description: "Failed to upload documents. Please try again.",
      });
    }
  };

  // Remove uploaded file
  const removeUploadedFile = (index: number): void => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Toggle document expanded view
  const toggleExpandDocument = (document: Document): void => {
    if (expandedDoc && expandedDoc.id === document.id) {
      setExpandedDoc(null);
    } else {
      setExpandedDoc(document);
    }
  };

  // Confirm delete document
  const confirmDeleteDocument = (document: Document): void => {
    setDocumentToDelete(document);
  };

  // Delete document handler
  const deleteDocument = async (): Promise<void> => {
    // console.log("triggered")
    if (!selectedCompany || !documentToDelete) return;

    const updatedCompanies = [...companies];
    const companyIndex = updatedCompanies.findIndex(c => c.id === selectedCompany.id);
    if (companyIndex === -1) return;
    const company = updatedCompanies[companyIndex];
    const docIndex = company.companyDocs.findIndex(
      doc => doc.id === documentToDelete.id
    );
    if (docIndex !== -1) {
      updatedCompanies[companyIndex].companyDocs.splice(docIndex, 1);
      setCompanies(updatedCompanies);
      setSelectedCompany(updatedCompanies[companyIndex]);
      setDocumentToDelete(null);

      // Send data to backend to delete the document
      try {
        const payload = JSON.stringify({ docId: company.id, ...documentToDelete });
        await deleteCompanyDoc(payload);
        toast({
          title: "Document deleted",
          description: `Successfully deleted document from ${selectedCompany.companyName}.`,
        });
      } catch (error) {
        console.error('Error deleting document:', error);
        toast({
          title: "Error",
          description: "Failed to delete document. Please try again.",
        });
      }
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold mb-4">Company Document Manager</h1>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Select onValueChange={handleCompanySelect} value={selectedCompany?.id}>
            <SelectTrigger className="w-full md:w-80">
              <SelectValue placeholder="Select a company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map(company => (
                <SelectItem key={company.id} value={company.id.toString()}>
                  {company.companyName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedCompany && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Documents for {selectedCompany.companyName}
            </h2>
            {!expandedDoc && (
              <Button
                onClick={handleAddNewDocument}
                variant="outline"
                className="flex items-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Add New Document
              </Button>
            )}
          </div>

          {/* Expanded view for a single document */}
          {expandedDoc ? (
            <div className="mb-8">
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
              <div className="flex justify-center bg-gray-100 p-4 rounded-lg">
                <iframe
                  src={expandedDoc.docUrl}
                  title={expandedDoc.docName}
                  className="w-full h-96 border-none"
                />
              </div>
            </div>
          ) : (
            /* Document thumbnails grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {selectedCompany.companyDocs.map(document => (
                <Card
                  key={document.id}
                  className={`transition-all ${documentToReplace && documentToReplace.id === document.id
                    ? 'ring-2 ring-blue-500'
                    : ''
                    }`}
                >
                  <CardContent className="p-4">
                    <div className="relative">
                      <div
                        className="w-full h-48 flex items-center justify-center bg-gray-100 mb-2 cursor-pointer"
                        onClick={() => toggleExpandDocument(document)}
                      >
                        <FileText className="h-12 w-12 text-gray-400" />
                      </div>
                      {documentToReplace && documentToReplace.id === document.id && (
                        <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                          <span className="text-sm font-medium text-white bg-blue-600 px-2 py-1 rounded">
                            Selected to Replace
                          </span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-6 w-6 p-0 rounded-full opacity-70 hover:opacity-100"
                          onClick={() => toggleExpandDocument(document)}
                        >
                          <Maximize2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-6 w-6 p-0 rounded-full opacity-70 hover:opacity-100"
                          onClick={() => confirmDeleteDocument(document)}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <FileText className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                      <p className="text-sm truncate" title={document.docName}>
                        {document.docName}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Add new document card */}
              <Card
                className="cursor-pointer border-dashed border-2 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                onClick={handleAddNewDocument}
              >
                <CardContent className="p-4 h-full flex flex-col items-center justify-center">
                  <PlusCircle className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Add New Document</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Upload section - conditionally rendered */}
          {showUploadSection && (
            <>
              <div
                className={`border-2 border-dashed rounded-lg p-6 mb-4 text-center ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
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
                    : 'Upload New Documents'
                  }
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Drag and drop files here or click to browse
                </p>
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  multiple={!documentToReplace}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                />

                {/* Browse Files button that triggers the file input */}
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  type="button"
                  onClick={openFileBrowser}
                >
                  Browse Files
                </Button>
              </div>
              {/* Display uploaded files */}
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUploadedFile(index)}
                          type="button"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Save button */}
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={saveDocuments}
                      type="button"
                    >
                      {documentToReplace ? 'Replace Document' : 'Save New Documents'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowUploadSection(false);
                        setUploadedFiles([]);
                        setDocumentToReplace(null);
                      }}
                      type="button"
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

      {/* Confirmation Dialog */}
      {documentToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg">
            <p className="mb-4">Are you sure you want to delete this document?</p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDocumentToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={deleteDocument}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDocumentManager;
