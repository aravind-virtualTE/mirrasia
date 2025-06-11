/* eslint-disable @typescript-eslint/no-explicit-any */
import * as XLSX from "xlsx"
import Papa from "papaparse"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { FileUp, Pencil, Trash2, Save, ChevronUp, ChevronDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import CustomLoader from "@/components/ui/customLoader"
import { delCurrentClients, getCurrentClients, saveCurrentClients, updateCurrentClient } from "@/services/dataFetch"
import AddCompanyDialog from "./AddCompanyDialog"

interface Director {
    name: string
    email: string
    phone: string
}

interface Shareholder {
    name: string
    email: string
    totalShares: number
}

interface DesignatedContact {
    name: string
    email: string
    phone: string
}

interface Company {
    _id?: string
    status: string
    jurisdiction: string
    comments: string
    incorporationDate: string
    companyNameEng: string
    companyNameChi: string
    companyType: string
    brnNo: string
    noOfShares: number
    shareCapital: string
    directors: Director[]
    shareholders: Shareholder[]
    designatedContact: DesignatedContact
    companySecretarialService: string
    registeredBusinessAddressService: string
}

interface GetClientsParams {
    page?: number
    limit?: number
    sortField?: string
    sortOrder?: "asc" | "desc"
    status?: string
    jurisdiction?: string
}

export default function CustomerDataManager() {
    const [customers, setCustomers] = useState<Company[]>([])
    const [totalItems, setTotalItems] = useState(0)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingCompany, setEditingCompany] = useState<Company | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deleteId, setDeleteId] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [sortConfig, setSortConfig] = useState<{ key: keyof Company; direction: "asc" | "desc" } | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const { toast } = useToast()

    useEffect(() => {
        fetchClients()
    }, [currentPage, sortConfig, itemsPerPage])

    const fetchClients = async () => {
        setIsLoading(true)
        try {
            const params: GetClientsParams = {
                page: currentPage,
                limit: itemsPerPage,
                sortField: sortConfig?.key,
                sortOrder: sortConfig?.direction,
            }

            const { data, total } = await getCurrentClients(params)
            setCustomers(data)
            setTotalItems(total)
        } catch (e) {
            console.error("Error fetching clients:", e)
            toast({
                title: "Error",
                description: "Failed to fetch company data",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const fileExtension = file.name.split(".").pop()?.toLowerCase()

        const processData = (parsedData: any[]) => {
            const validData = parsedData
                .filter((item) => item["COMPANY NAME (ENG)"])
                .map((item) => ({
                    status: item["status"] || "",
                    jurisdiction: item["Jurisdriction"] || "",
                    comments: item["comments"] || "",
                    incorporationDate: item["INCORPORATION DATE"] || "",
                    companyNameEng: item["COMPANY NAME (ENG)"] || "",
                    companyNameChi: item["COMPANY NAME (CHI)"] || "",
                    companyType: item["Company Type"] || "",
                    brnNo: item["BRN NO."] || "",
                    noOfShares: Number(item["No. of shares"]) || 0,
                    shareCapital: item["Share Capital"] || "",
                    directors: [
                        { name: item["dirName1"] || "", email: item["dirEmail1"] || "", phone: item["dirPhone1"] || "" },
                        { name: item["dirName2"] || "", email: item["dirEmail2"] || "", phone: item["dirPhone2"] || "" },
                        { name: item["dirName3"] || "", email: item["dirEmail3"] || "", phone: item["dirPhone3"] || "" },
                        { name: item["dirName4"] || "", email: item["dirEmail4"] || "", phone: item["dirPhone4"] || "" },
                    ],
                    shareholders: [
                        { name: item["shName1"] || "", email: item["shEmail1"] || "", totalShares: Number(item["totalShares1"]) || 0 },
                        { name: item["shName2"] || "", email: item["shEmail2"] || "", totalShares: Number(item["totalShares2"]) || 0 },
                        { name: item["shName3"] || "", email: item["shEmail3"] || "", totalShares: Number(item["totalShares3"]) || 0 },
                        { name: item["shName4"] || "", email: item["shEmail4"] || "", totalShares: Number(item["totalShares4"]) || 0 },
                    ],
                    designatedContact: {
                        name: item["Designated contact person's name"] || "",
                        email: item["DCP's email address"] || "",
                        phone: item["DCP's contact number"] || "",
                    },
                    companySecretarialService: item["Company Secretarial Service"] || "No",
                    registeredBusinessAddressService: item["Registered Business Address Service"] || "No",
                }))

            setCustomers((prev) => [...prev, ...validData])
            toast({
                title: "File uploaded successfully",
                description: `Added ${validData.length} company records`,
            })
        }

        if (fileExtension === "csv") {
            Papa.parse(file, {
                header: true,
                complete: (results) => {
                    processData(results.data as any[])
                },
                error: (error: any) => {
                    toast({
                        title: "Error parsing CSV file",
                        description: error.message,
                        variant: "destructive",
                    })
                },
            })
        } else if (fileExtension === "xlsx" || fileExtension === "xls") {
            const reader = new FileReader()
            reader.onload = (e) => {
                const data = e.target?.result
                if (!data) return
                try {
                    const workbook = XLSX.read(data, { type: "binary" })
                    const sheetName = workbook.SheetNames[0]
                    const worksheet = workbook.Sheets[sheetName]
                    const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[]
                    processData(jsonData)
                } catch (error: any) {
                    toast({
                        title: "Error parsing Excel file",
                        description: error.message,
                        variant: "destructive",
                    })
                }
            }
            reader.readAsBinaryString(file)
        } else {
            toast({
                title: "Unsupported file format",
                description: "Please upload a CSV or Excel file",
                variant: "destructive",
            })
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const handleSort = (key: keyof Company) => {
        setSortConfig((prev) => ({
            key,
            direction: prev?.key === key && prev.direction === "asc" ? "desc" : "asc",
        }))
        setCurrentPage(1) // Reset to first page when sorting
    }

    const openAddDialog = () => {
        setEditingCompany(null)
        setIsDialogOpen(true)
    }

    const openEditDialog = (company: Company) => {
        setEditingCompany(company)
        setIsDialogOpen(true)
    }

    const handleDelete = (id: any) => {
        setDeleteId(id)
        setDeleteDialogOpen(true)
    }

    const handleCompanySubmit = async (companyData: Company) => {
        if (editingCompany) {
             const updated = await updateCurrentClient(companyData);
             console.log("Company updated successfully:", updated)
            setCustomers(
                customers.map((company) =>
                    company._id === editingCompany._id ? { ...companyData, _id: company._id } : company
                )
            )
            toast({
                title: "Company updated",
                description: "The company record has been updated",
            })
        } else {
            console.log("Adding new company:", companyData)
            const result = await saveCurrentClients([companyData])
            console.log("New company added successfully:", result)
            setCustomers([ result[0],...customers])
            setTotalItems((prev) => prev + 1)
            toast({
                title: "Company added",
                description: "New company record has been added",
            })
        }
        setIsDialogOpen(false)
        // fetchClients() // Refresh data after submit
    }

    const handleDeleteTask = async () => {
        try {
            // setCustomers(customers.filter((company) => company.id !== deleteId))
           const result = await delCurrentClients(deleteId)
           console.log("Company deleted successfully:", result)
            setTotalItems((prev) => prev - 1)
            toast({
                title: "Company deleted",
                description: "The company record has been removed",
            })
        } catch (error) {
            console.error("Error deleting company:", error)
            toast({
                title: "Error",
                description: "Failed to delete company record",
                variant: "destructive",
            })
        } finally {
            setDeleteDialogOpen(false)
            setDeleteId(null)
            fetchClients() // Refresh data after delete
        }
    }

    const handleSave = async () => {
        setIsLoading(true)
        try {
           const result =  await saveCurrentClients(customers)
           console.log("Data saved successfully:", result)
            toast({
                title: "Data saved",
                description: "All company records have been saved successfully",
            })
        } catch (error) {
            console.error("Error saving data:", error)
            toast({
                title: "Error saving data",
                description: "There was an error saving the company records",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const totalPages = Math.ceil(totalItems / itemsPerPage)

    return (
        <div className="container mx-auto p-4">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <Input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                    />
                    <Button size="sm" onClick={() => fileInputRef.current?.click()} className="px-3">
                        <FileUp className="mr-2 h-4 w-4" />
                        Upload File
                    </Button>
                </div>
                <div className="flex gap-2 self-end">
                    <AddCompanyDialog
                        isOpen={isDialogOpen}
                        onOpenChange={setIsDialogOpen}
                        onTriggerClick={openAddDialog}
                        editingCompany={editingCompany}
                        onSubmit={handleCompanySubmit}
                    />
                </div>
                <div className="flex gap-2 self-end">
                    <Button size="sm" className="px-3" onClick={handleSave} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <CustomLoader />
                                <span className="ml-2">Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Save
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                <Table className="text-sm">
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="text-center">S.No</TableHead>
                            <TableHead
                                onClick={() => handleSort("status")}
                                className="cursor-pointer hover:bg-gray-100"
                            >
                                <div className="flex items-center">
                                    <span>Status</span>
                                    {sortConfig?.key === "status" &&
                                        (sortConfig.direction === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                                </div>
                            </TableHead>
                            <TableHead
                                onClick={() => handleSort("companyNameEng")}
                                className="cursor-pointer hover:bg-gray-100"
                            >
                                <div className="flex items-center">
                                    <span>Company Name (ENG)</span>
                                    {sortConfig?.key === "companyNameEng" &&
                                        (sortConfig.direction === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                                </div>
                            </TableHead>
                            <TableHead
                                onClick={() => handleSort("jurisdiction")}
                                className="cursor-pointer hover:bg-gray-100"
                            >
                                <div className="flex items-center">
                                    <span>Jurisdiction</span>
                                    {sortConfig?.key === "jurisdiction" &&
                                        (sortConfig.direction === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                                </div>
                            </TableHead>
                            <TableHead
                                onClick={() => handleSort("incorporationDate")}
                                className="cursor-pointer hover:bg-gray-100"
                            >
                                <div className="flex items-center">
                                    <span>Incorporation Date</span>
                                    {sortConfig?.key === "incorporationDate" &&
                                        (sortConfig.direction === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                                </div>
                            </TableHead>
                            <TableHead
                                onClick={() => handleSort("companyType")}
                                className="cursor-pointer hover:bg-gray-100"
                            >
                                <div className="flex items-center">
                                    <span>Company Type</span>
                                    {sortConfig?.key === "companyType" &&
                                        (sortConfig.direction === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                                </div>
                            </TableHead>
                            <TableHead
                                onClick={() => handleSort("brnNo")}
                                className="cursor-pointer hover:bg-gray-100"
                            >
                                <div className="flex items-center">
                                    <span>BRN No.</span>
                                    {sortConfig?.key === "brnNo" &&
                                        (sortConfig.direction === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                                </div>
                            </TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center">
                                    <CustomLoader />
                                </TableCell>
                            </TableRow>
                        ) : customers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center">
                                    No data available
                                </TableCell>
                            </TableRow>
                        ) : (
                            customers.map((company, idx) => (
                                <TableRow key={`company--${idx}`} className="hover:bg-muted transition-colors">
                                    <TableCell className="text-center font-medium">
                                        {(currentPage - 1) * itemsPerPage + idx + 1}
                                    </TableCell>
                                    <TableCell>{company.status}</TableCell>
                                    <TableCell>{company.companyNameEng}</TableCell>
                                    <TableCell>{company.jurisdiction}</TableCell>
                                    <TableCell>{company.incorporationDate}</TableCell>
                                    <TableCell>{company.companyType}</TableCell>
                                    <TableCell>{company.brnNo}</TableCell>
                                    <TableCell className="flex items-center justify-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => openEditDialog(company)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => handleDelete(company._id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                <div className="flex justify-between items-center p-4">
                    <div className="flex items-center gap-2">
                        <span>Items per page:</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value))
                                setCurrentPage(1)
                            }}
                            className="border rounded p-1"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 1 || isLoading}
                            onClick={() => setCurrentPage((prev) => prev - 1)}
                        >
                            Previous
                        </Button>
                        <span>
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage >= totalPages || isLoading}
                            onClick={() => setCurrentPage((prev) => prev + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Company"
                description="Are you sure you want to delete this company record?"
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDeleteTask}
            />
        </div>
    )
}