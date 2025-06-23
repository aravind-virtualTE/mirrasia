import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Upload, FileText, X, Maximize2, Minimize2, Trash, Shield, Mail, Building } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import jwtDecode from "jwt-decode"
import type { TokenData } from "@/middleware/ProtectedRoutes"
import { useParams } from "react-router-dom"
import { deleteCompanyDoc, getCompDocs, uploadCompanyDocs } from "@/services/dataFetch" // Import getCompDocs function

// Define types
interface Document {
  id: string
  docName: string
  docUrl: string
  file?: File
  type?: "kyc" | "letters" | "company"
}

export interface Company {
  id: string
  companyName: string
  companyDocs: Document[]
  kycDocs?: Document[]
  letterDocs?: Document[]
  country: { code: string; name: string }
}

type DocumentType = "kyc" | "letters" | "company"

const CompanyDocumentManager: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { countryCode, id } = useParams()
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [documentToReplace, setDocumentToReplace] = useState<Document | null>(null)
  const [dragActive, setDragActive] = useState<boolean>(false)
  const [expandedDoc, setExpandedDoc] = useState<Document | null>(null)
  const [showUploadSection, setShowUploadSection] = useState<boolean>(false)
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null)
  const [activeTab, setActiveTab] = useState<DocumentType>("company")
  const [currentDocumentType, setCurrentDocumentType] = useState<DocumentType>("company")
  const token = localStorage.getItem("token") as string

  useEffect(() => {
    const fetchComp = async () => {
      try {
        const decodedToken = jwtDecode<TokenData>(token)
        const response = await getCompDocs(`${decodedToken.userId}`)
        const data = await response
        // console.log("data", data)
        setCompanies(data)
        if (data.length > 0) {
          if (id !== undefined && id !== "" && countryCode !== undefined && countryCode !== "") {
            const result = data.find((company: { id: string }) => company.id === id)
            setSelectedCompany(result)
            setUploadedFiles([])
            setDocumentToReplace(null)
            setExpandedDoc(null)
            setShowUploadSection(false)
          } else {
            setSelectedCompany(data[0])
            setUploadedFiles([])
            setDocumentToReplace(null)
            setExpandedDoc(null)
            setShowUploadSection(false)
          }
        }
      } catch (error) {
        console.error("Error fetching companies:", error)
      }
    }
    fetchComp()
  }, [])

  const handleCompanySelect = (companyId: string): void => {
    const company = companies.find((c) => c.id === companyId)
    if (company) {
      setSelectedCompany(company)
      setUploadedFiles([])
      setDocumentToReplace(null)
      setExpandedDoc(null)
      setShowUploadSection(false)
    }
  }

  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files)
      setUploadedFiles(filesArray)
      toast({
        title: "Files ready for upload",
        description: `${filesArray.length} file(s) added successfully.`,
      })
    }
  }

  // Handle drag events
  const handleDrag = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files)
      setUploadedFiles(filesArray)
      toast({
        title: "Files selected",
        description: `${filesArray.length} file(s) selected successfully.`,
      })
    }
  }

  // Open file browser
  const openFileBrowser = (): void => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Add new document handler
  const handleAddNewDocument = (): void => {
    setDocumentToReplace(null)
    setCurrentDocumentType(activeTab)
    setShowUploadSection(true)
  }

  // Save uploaded documents
  const saveDocuments = async (): Promise<void> => {
    if (!selectedCompany) return

    const updatedCompanies = [...companies]
    const companyIndex = updatedCompanies.findIndex((c) => c.id === selectedCompany.id)
    if (companyIndex === -1) return

    const getDocumentArray = (type: DocumentType) => {
      switch (type) {
        case "kyc":
          return updatedCompanies[companyIndex].kycDocs || []
        case "letters":
          return updatedCompanies[companyIndex].letterDocs || []
        case "company":
        default:
          return updatedCompanies[companyIndex].companyDocs || []
      }
    }

    const setDocumentArray = (type: DocumentType, docs: Document[]) => {
      switch (type) {
        case "kyc":
          updatedCompanies[companyIndex].kycDocs = docs
          break
        case "letters":
          updatedCompanies[companyIndex].letterDocs = docs
          break
        case "company":
        default:
          updatedCompanies[companyIndex].companyDocs = docs
          break
      }
    }

    if (documentToReplace) {
      // Replace existing document
      const currentDocs = getDocumentArray(currentDocumentType)
      const docIndex = currentDocs.findIndex((doc) => doc.id === documentToReplace.id)
      if (docIndex !== -1 && uploadedFiles.length > 0) {
        currentDocs[docIndex] = {
          ...documentToReplace,
          docName: uploadedFiles[0].name,
          file: uploadedFiles[0],
          docUrl: "",
          type: currentDocumentType,
        }
        setDocumentArray(currentDocumentType, currentDocs)
      }
    } else {
      // Add new documents
      const newDocuments: Document[] = uploadedFiles.map((file, index) => ({
        id: `${Date.now()}-${index}`,
        docName: file.name,
        file: file,
        docUrl: "",
        type: currentDocumentType,
      }))

      const currentDocs = getDocumentArray(currentDocumentType)
      setDocumentArray(currentDocumentType, [...currentDocs, ...newDocuments])
    }

    setCompanies(updatedCompanies)
    setSelectedCompany(updatedCompanies[companyIndex])
    setUploadedFiles([])
    setDocumentToReplace(null)
    setShowUploadSection(false)

    // Send data to backend
    try {
      // console.log("Updated companies:", updatedCompanies)
      await uploadCompanyDocs(updatedCompanies)
      toast({
        title: documentToReplace ? "Document replaced" : "Documents added",
        description: `Successfully ${documentToReplace ? "replaced document" : "added new documents"} to ${selectedCompany.companyName}.`,
      })
    } catch (error) {
      console.error("Error uploading documents:", error)
      toast({
        title: "Error",
        description: "Failed to upload documents. Please try again.",
      })
    }
  }

  const removeUploadedFile = (index: number): void => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const toggleExpandDocument = (document: Document): void => {
    if (expandedDoc && expandedDoc.id === document.id) {
      setExpandedDoc(null)
    } else {
      setExpandedDoc(document)
    }
  }

  const confirmDeleteDocument = (document: Document): void => {
    setDocumentToDelete(document)
  }

  const deleteDocument = async (): Promise<void> => {
    if (!selectedCompany || !documentToDelete) return
        // console.log("documentToDelete",activeTab)
    const updatedCompanies = [...companies]
    const companyIndex = updatedCompanies.findIndex((c) => c.id === selectedCompany.id)
    if (companyIndex === -1) return

    const docType = activeTab || "company"

    const getDocumentArray = (type: DocumentType) => {
      switch (type) {
        case "kyc":
          return updatedCompanies[companyIndex].kycDocs || []
        case "letters":
          return updatedCompanies[companyIndex].letterDocs || []
        case "company":
        default:
          return updatedCompanies[companyIndex].companyDocs || []
      }
    }

    const getDocumentType = (type: DocumentType) => {
      switch (type) {
        case "kyc":
          return "kycDocs"
        case "letters":
          return "letterDocs"
        case "company":
        default:
          return "companyDocs"
      }
    }

    const setDocumentArray = (type: DocumentType, docs: Document[]) => {
      switch (type) {
        case "kyc":
          updatedCompanies[companyIndex].kycDocs = docs
          break
        case "letters":
          updatedCompanies[companyIndex].letterDocs = docs
          break
        case "company":
        default:
          updatedCompanies[companyIndex].companyDocs = docs
          break
      }
    }

    const currentDocs = getDocumentArray(docType)
    const docIndex = currentDocs.findIndex((doc) => doc.id === documentToDelete.id)

    if (docIndex !== -1) {
      const updatedDocs = currentDocs.filter((_, index) => index !== docIndex)
      setDocumentArray(docType, updatedDocs)

      setCompanies(updatedCompanies)
      setSelectedCompany(updatedCompanies[companyIndex])
      setDocumentToDelete(null)

      try {
        // console.log(docType,"selectedCompany", selectedCompany)
        const payload = JSON.stringify({
          docType: getDocumentType(docType),
          docId: selectedCompany.id,
          country: selectedCompany.country,
          ...documentToDelete,
        })
        // console.log("payload",payload)
        await deleteCompanyDoc(payload)
        toast({
          title: "Document deleted",
          description: `Successfully deleted document from ${selectedCompany.companyName}.`,
        })
      } catch (error) {
        console.error("Error deleting document:", error)
        toast({
          title: "Error",
          description: "Failed to delete document. Please try again.",
        })
      }
    }
  }

  const getTabIcon = (tab: DocumentType) => {
    switch (tab) {
      case "kyc":
        return <Shield className="h-4 w-4" />
      case "letters":
        return <Mail className="h-4 w-4" />
      case "company":
      default:
        return <Building className="h-4 w-4" />
    }
  }

  const getTabLabel = (tab: DocumentType) => {
    switch (tab) {
      case "kyc":
        return "KYC/CDD"
      case "letters":
        return "Letters"
      case "company":
      default:
        return "Company Docs"
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold mb-4">Company Document Manager</h1>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {companies.length === 0 && (
            <div className="rounded-md bg-muted text-muted-foreground p-2 text-sm">No companies found</div>
          )}
          <Select onValueChange={handleCompanySelect} value={selectedCompany?.id}>
            <SelectTrigger className="w-full md:w-80">
              <SelectValue placeholder="Select a company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
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
            <h2 className="text-xl font-semibold">Documents for {selectedCompany.companyName}</h2>
            {!expandedDoc && (
              <Button onClick={handleAddNewDocument} variant="outline" className="flex items-center gap-2">
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

            <TabsContent value="company" className="mt-6">
              <DocumentGrid
                documents={selectedCompany.companyDocs || []}
                expandedDoc={expandedDoc}
                documentToReplace={documentToReplace}
                onToggleExpand={toggleExpandDocument}
                onConfirmDelete={confirmDeleteDocument}
                onAddNew={handleAddNewDocument}
              />
            </TabsContent>

            <TabsContent value="kyc" className="mt-6">
              <DocumentGrid
                documents={selectedCompany.kycDocs || []}
                expandedDoc={expandedDoc}
                documentToReplace={documentToReplace}
                onToggleExpand={toggleExpandDocument}
                onConfirmDelete={confirmDeleteDocument}
                onAddNew={handleAddNewDocument}
              />
            </TabsContent>

            <TabsContent value="letters" className="mt-6">
              <DocumentGrid
                documents={selectedCompany.letterDocs || []}
                expandedDoc={expandedDoc}
                documentToReplace={documentToReplace}
                onToggleExpand={toggleExpandDocument}
                onConfirmDelete={confirmDeleteDocument}
                onAddNew={handleAddNewDocument}
              />
            </TabsContent>
          </Tabs>

          {/* Expanded view for a single document */}
          {expandedDoc && (
            <div className="mb-8 mt-6">
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
                <iframe src={expandedDoc.docUrl} title={expandedDoc.docName} className="w-full h-96 border-none" />
              </div>
            </div>
          )}

          {/* Upload section - conditionally rendered */}
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
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  multiple={!documentToReplace}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png"
                />
                <Button variant="outline" className="cursor-pointer" type="button" onClick={openFileBrowser}>
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
                        <Button variant="ghost" size="sm" onClick={() => removeUploadedFile(index)} type="button">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  {/* Save button */}
                  <div className="flex gap-2 mt-4">
                    <Button onClick={saveDocuments} type="button">
                      {documentToReplace ? "Replace Document" : "Save New Documents"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowUploadSection(false)
                        setUploadedFiles([])
                        setDocumentToReplace(null)
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
      {/* Delete confirmation modal */}
      {documentToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Document</h3>
            <p className="mb-4 text-gray-600">
              Are you sure you want to delete "{documentToDelete.docName}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDocumentToDelete(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={deleteDocument}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
interface DocumentGridProps {
  documents: Document[]
  expandedDoc: Document | null
  documentToReplace: Document | null
  onToggleExpand: (doc: Document) => void
  onConfirmDelete: (doc: Document) => void
  onAddNew: () => void
}
const DocumentGrid: React.FC<DocumentGridProps> = ({
  documents,
  expandedDoc,
  documentToReplace,
  onToggleExpand,
  onConfirmDelete,
  onAddNew,
}) => {
  if (expandedDoc) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {documents.map((document, idx) => (
        <Card
          key={`${idx}-${document.id}`}
          className={`transition-all ${
            documentToReplace && documentToReplace.id === document.id ? "ring-2 ring-blue-500" : ""
          }`}
        >
          <CardContent className="p-4">
            <div className="relative">
              <div
                className="w-full h-48 flex items-center justify-center bg-gray-100 mb-2 cursor-pointer rounded-lg"
                onClick={() => onToggleExpand(document)}
              >
                {document.docUrl.includes("placeholder.svg") ? (
                  <FileText className="h-12 w-12 text-gray-400" />
                ) : (
                  <img
                    src={document.docUrl || "/placeholder.svg"}
                    alt={document.docName}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = "none"
                      target.nextElementSibling?.classList.remove("hidden")
                    }}
                  />
                )}
                <FileText className="h-12 w-12 text-gray-400 hidden" />
              </div>
              {documentToReplace && documentToReplace.id === document.id && (
                <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center rounded-lg">
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
                  onClick={() => onToggleExpand(document)}
                >
                  <Maximize2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-6 w-6 p-0 rounded-full opacity-70 hover:opacity-100"
                  onClick={() => onConfirmDelete(document)}
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
        onClick={onAddNew}
      >
        <CardContent className="p-4 h-full flex flex-col items-center justify-center">
          <PlusCircle className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">Add New Document</p>
        </CardContent>
      </Card>
    </div>
  )
}
export default CompanyDocumentManager