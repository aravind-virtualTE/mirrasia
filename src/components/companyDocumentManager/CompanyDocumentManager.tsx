import React, { useState } from 'react';
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
  RefreshCw 
} from 'lucide-react';

// Define types
interface Document {
  id: number;
  name: string;
  thumbnail: string;
}

interface Company {
  id: number;
  name: string;
  documents: Document[];
}

const CompanyDocumentManager: React.FC = () => {
  // Sample data - in a real app this would come from an API
  const [companies, setCompanies] = useState<Company[]>([
    { 
      id: 1, 
      name: 'Acme Corporation', 
      documents: [
        { id: 1, name: 'Financial Report 2024.pdf', thumbnail: '/api/placeholder/200/250' },
        { id: 2, name: 'Business Plan.docx', thumbnail: '/api/placeholder/200/250' },
      ] 
    },
    { 
      id: 2, 
      name: 'Wayne Enterprises', 
      documents: [
        { id: 3, name: 'R&D Budget.xlsx', thumbnail: '/api/placeholder/200/250' },
        { id: 4, name: 'Quarterly Report.pdf', thumbnail: '/api/placeholder/200/250' },
        { id: 5, name: 'Patent Applications.pdf', thumbnail: '/api/placeholder/200/250' },
      ] 
    },
    { 
      id: 3, 
      name: 'Stark Industries', 
      documents: [
        { id: 6, name: 'Project Roadmap.pptx', thumbnail: '/api/placeholder/200/250' },
      ] 
    }
  ]);

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [documentToReplace, setDocumentToReplace] = useState<Document | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [expandedDoc, setExpandedDoc] = useState<Document | null>(null);
  const [showUploadSection, setShowUploadSection] = useState<boolean>(false);

  // Handle company selection
  const handleCompanySelect = (companyId: string): void => {
    const company = companies.find(c => c.id.toString() === companyId);
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
    }
  };

  // Toggle document replacement selection
  const toggleReplaceDocument = (document: Document): void => {
    if (documentToReplace && documentToReplace.id === document.id) {
      setDocumentToReplace(null);
    } else {
      setDocumentToReplace(document);
      setShowUploadSection(true);
    }
  };

  // Add new document handler
  const handleAddNewDocument = (): void => {
    setDocumentToReplace(null);
    setShowUploadSection(true);
  };

  // Save uploaded documents
  const saveDocuments = (): void => {
    if (!selectedCompany) return;
    
    const updatedCompanies = [...companies];
    const companyIndex = updatedCompanies.findIndex(c => c.id === selectedCompany.id);
    
    if (companyIndex === -1) return;
    
    if (documentToReplace) {
      // Replace existing document
      const docIndex = updatedCompanies[companyIndex].documents.findIndex(
        doc => doc.id === documentToReplace.id
      );
      
      if (docIndex !== -1 && uploadedFiles.length > 0) {
        updatedCompanies[companyIndex].documents[docIndex] = {
          id: documentToReplace.id,
          name: uploadedFiles[0].name,
          thumbnail: '/api/placeholder/200/250'
        };
      }
    } else {
      // Add new documents
      const newDocuments: Document[] = uploadedFiles.map((file, index) => ({
        id: Date.now() + index,
        name: file.name,
        thumbnail: '/api/placeholder/200/250'
      }));
      
      updatedCompanies[companyIndex].documents = [
        ...updatedCompanies[companyIndex].documents,
        ...newDocuments
      ];
    }
    
    setCompanies(updatedCompanies);
    setSelectedCompany(updatedCompanies[companyIndex]);
    setUploadedFiles([]);
    setDocumentToReplace(null);
    setShowUploadSection(false);
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

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Company Document Manager</h1>
        
        {/* Company dropdown selector */}
        <Select onValueChange={handleCompanySelect}>
          <SelectTrigger className="w-full md:w-80">
            <SelectValue placeholder="Select a company" />
          </SelectTrigger>
          <SelectContent>
            {companies.map(company => (
              <SelectItem key={company.id} value={company.id.toString()}>
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedCompany && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Documents for {selectedCompany.name}
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
                  <h3 className="text-lg font-medium">{expandedDoc.name}</h3>
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
                  <Button
                    variant="outline" 
                    size="sm"
                    onClick={() => toggleReplaceDocument(expandedDoc)}
                    className="flex items-center gap-1"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Replace
                  </Button>
                </div>
              </div>
              <div className="flex justify-center bg-gray-100 p-4 rounded-lg">
                <img 
                  src={expandedDoc.thumbnail} 
                  alt={expandedDoc.name} 
                  className="max-h-96 object-contain"
                />
              </div>
            </div>
          ) : (
            /* Document thumbnails grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {selectedCompany.documents.map(document => (
                <Card 
                  key={document.id} 
                  className={`transition-all ${
                    documentToReplace && documentToReplace.id === document.id 
                      ? 'ring-2 ring-blue-500' 
                      : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="relative">
                      <img 
                        src={document.thumbnail} 
                        alt={document.name} 
                        className="w-full h-48 object-cover bg-gray-100 mb-2 cursor-pointer"
                        onClick={() => toggleExpandDocument(document)}
                      />
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
                          onClick={() => toggleReplaceDocument(document)}
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <FileText className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                      <p className="text-sm truncate" title={document.name}>
                        {document.name}
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
                className={`border-2 border-dashed rounded-lg p-6 mb-4 text-center ${
                  dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <h3 className="text-lg font-medium mb-2">
                  {documentToReplace 
                    ? `Replace "${documentToReplace.name}"` 
                    : 'Upload New Documents'
                  }
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Drag and drop files here or click to browse
                </p>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  multiple={!documentToReplace}
                  onChange={handleFileChange}
                />
                <label htmlFor="file-upload">
                  <Button 
                    variant="outline" 
                    className="cursor-pointer" 
                    type="button"
                  >
                    Browse Files
                  </Button>
                </label>
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
    </div>
  );
};

export default CompanyDocumentManager;