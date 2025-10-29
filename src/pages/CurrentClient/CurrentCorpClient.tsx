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
import {
    FileUp,
    Pencil,
    Trash2,
    Save,
    ChevronUp,
    ChevronDown,
    CheckCircle2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import CustomLoader from "@/components/ui/customLoader"
import {
    delCurrentClients,
    getCurrentClients,
    saveCurrentClients,
    updateCurrentClient,
} from "@/services/dataFetch"
import AddCompanyDialog from "./AddCompanyDialog"
import { useNavigate } from "react-router-dom"
import { cccCompanyData, Company } from "./cccState"
import { useAtom } from "jotai"
import SearchBox from "../MasterTodo/SearchBox"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface GetClientsParams {
    page?: number
    limit?: number
    sortField?: string
    sortOrder?: "asc" | "desc"
    status?: string
    jurisdiction?: string
    searchKey?: string
}

export default function CurrentCorpClient() {
    const [customers, setCustomers] = useAtom(cccCompanyData)
    const [totalItems, setTotalItems] = useState(0)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingCompany, setEditingCompany] = useState<Company | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deleteId, setDeleteId] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [sortConfig, setSortConfig] = useState<{
        key: keyof Company
        direction: "asc" | "desc"
    } | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(50)
    const [searchQuery, setSearchQuery] = useState("")
    const [isFocused, setIsFocused] = useState(false)

    // FILTER STATES
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [jurisdictionFilter, setJurisdictionFilter] = useState<string>("all")

    const { toast } = useToast()
    const navigate = useNavigate()

    // STATUS OPTIONS (deduped, + others)
    const uniqueStatusOptions = [
        { value: "all", label: "All" },
        { value: "Current", label: "Current" },
        { value: "Current - dormant", label: "Current - dormant" },
        {
            value: "Current - dormant / apply for de-registration",
            label: "Current - dormant / apply for de-registration",
        },
        {
            value: "current - proceed to de-retister",
            label: "Current - proceed to de-retister",
        },
        { value: "De-registered", label: "De-registered" }, // covers DE-REGISTERED / De-registered
        { value: "Resigned", label: "Resigned" }, // covers RESIGNED / Resigned
        { value: "others", label: "Others / Empty" }, // "" or unmapped
    ]

    // JURISDICTION OPTIONS
    // We'll normalize human-friendly display (capitalized nicely), but send canonical values.
    // We merge obvious duplicates (DELAWARE/Delaware -> Delaware, etc.).
    // We'll include Washington D.C. from "WASHINGTON D.C.",
    // We'll trim "MARSHALL " (extra space) but keep label "Marshall".
    // We'll title-case Shenzhen even though provided "shenzhen ".
    // We'll include "others" for empty/misc.
    const uniqueJurisdictionOptions = [
        { value: "all", label: "All" },
        { value: "Belize", label: "Belize" },
        { value: "BVI", label: "BVI" },
        { value: "California", label: "California" },
        { value: "Cayman", label: "Cayman" },
        { value: "Curacao", label: "Curacao" },
        { value: "Delaware", label: "Delaware" },
        { value: "Estonia", label: "Estonia" },
        { value: "Florida", label: "Florida" },
        { value: "Hong Kong", label: "Hong Kong" },
        { value: "Marshall", label: "Marshall" }, // from "MARSHALL "
        { value: "Malta", label: "Malta" },
        { value: "New York", label: "New York" },
        { value: "Panama", label: "Panama" },
        { value: "Singapore", label: "Singapore" },
        { value: "Swiss", label: "Swiss" },
        { value: "Saint Vincent", label: "Saint Vincent" },
        { value: "Seychelles", label: "Seychelles" },
        { value: "Texas", label: "Texas" },
        { value: "UAB", label: "UAB" },
        { value: "UK", label: "UK" },
        { value: "United Kingdom", label: "United Kingdom" },
        { value: "USA", label: "USA" },
        { value: "Washington D.C.", label: "Washington D.C." },
        { value: "Wyoming", label: "Wyoming" },
        { value: "Shenzhen", label: "Shenzhen" }, // from "shenzhen "
        { value: "others", label: "Others / Empty" }, // "" or anything else weird
    ]

    useEffect(() => {
        fetchClients()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        currentPage,
        sortConfig,
        itemsPerPage,
        statusFilter,
        jurisdictionFilter,
    ])

    // translate statusFilter -> API param
    const buildStatusParam = (raw: string | undefined) => {
        // "all" => undefined (no backend filter for status)
        // "others" => "" (empty/non-mapped status)
        // else => that value
        if (!raw) return undefined
        if (raw === "all") return undefined
        if (raw === "others") return ""
        if (raw === "De-registered") return "De-registered"
        if (raw === "Resigned") return "Resigned"
        return raw
    }

    // translate jurisdictionFilter -> API param
    const buildJurisdictionParam = (raw: string | undefined) => {
        // "all" => undefined (no backend filter)
        // "others" => "" (empty/misc jurisdiction)
        // else => that value
        if (!raw) return undefined
        if (raw === "all") return undefined
        if (raw === "others") return ""
        // We send canonical proper case strings like "Delaware", "Hong Kong", etc.
        return raw
    }

    const fetchClients = async () => {
        setIsLoading(true)
        try {
            const params: GetClientsParams = {
                page: currentPage,
                limit: itemsPerPage,
                sortField: sortConfig?.key,
                sortOrder: sortConfig?.direction,
                status: buildStatusParam(statusFilter),
                jurisdiction: buildJurisdictionParam(
                    jurisdictionFilter
                ),
                searchKey: searchQuery.trim() || undefined,
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
                .map((item) => {
                    const extractValidEntries = (
                        prefix: string,
                        keys: string[],
                        maxCount: number
                    ) => {
                        return Array.from({ length: maxCount }, (_, i) => {
                            const index = i + 1
                            const entry: any = {}
                            keys.forEach((key) => {
                                const field = `${prefix}${key
                                    .charAt(0)
                                    .toUpperCase()}${key.slice(1)}${index}`
                                entry[key] =
                                    key === "totalShares"
                                        ? (item[field]) * 100 || 0
                                        : item[field] || ""
                            })
                            return entry
                        }).filter(
                            (entry) =>
                                entry.name &&
                                ((entry.email && entry.name) ||
                                    (entry.phone && entry.name) ||
                                    (entry.totalShares && entry.name))
                        )
                    }
                    return {
                        status: item["status"] || "",
                        jurisdiction: item["Jurisdriction"] || "",
                        comments: item["comments"] || "",
                        incorporationDate:
                            item["INCORPORATION DATE"] || "",
                        companyNameEng:
                            item["COMPANY NAME (ENG)"] || "",
                        companyNameChi:
                            item["COMPANY NAME (CHI)"] || "",
                        companyType: item["Company Type"] || "",
                        brnNo: item["BRN NO."] || "",
                        noOfShares: item["noOfShares"] || 0,
                        shareCapital: item["shareCapital"] || "",
                        bank: item["Bank"] || "",
                        directors: extractValidEntries(
                            "dir",
                            ["name", "email", "phone"],
                            4
                        ),
                        shareholders: extractValidEntries(
                            "sh",
                            ["name", "email", "totalShares"],
                            4
                        ),
                        designatedContact: [
                            {
                                name: item["dcpName"] || "",
                                email: item["dcpEmail"] || "",
                                phone: item["dcpNum"] || "",
                                sns: item["dcpSns"] || "",
                            },
                        ],
                        companySecretarialService:
                            item["Company Secretarial Service"] || "No",
                        registeredBusinessAddressService:
                            item[
                            "Registered Business Address Service"
                            ] || "No",
                    }
                })

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
                    const jsonData = XLSX.utils.sheet_to_json(
                        worksheet
                    ) as any[]
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
            direction:
                prev?.key === key && prev.direction === "asc"
                    ? "desc"
                    : "asc",
        }))
        setCurrentPage(1)
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
            const updated = await updateCurrentClient(companyData)
            console.log("Company updated successfully:", updated)
            setCustomers(
                customers.map((company) =>
                    company._id === editingCompany._id
                        ? { ...companyData, _id: company._id }
                        : company
                )
            )
            toast({
                title: "Company updated",
                description:
                    "The company record has been updated",
            })
        } else {
            const result = await saveCurrentClients([companyData])
            setCustomers([result[0], ...customers])
            setTotalItems((prev) => prev + 1)
            toast({
                title: "Company added",
                description:
                    "New company record has been added",
            })
        }
        setIsDialogOpen(false)
    }

    const handleDeleteTask = async () => {
        try {
            const result = await delCurrentClients(deleteId)
            console.log("Company deleted successfully:", result)
            setTotalItems((prev) => prev - 1)
            toast({
                title: "Company deleted",
                description:
                    "The company record has been removed",
            })
        } catch (error) {
            console.error("Error deleting company:", error)
            toast({
                title: "Error",
                description:
                    "Failed to delete company record",
                variant: "destructive",
            })
        } finally {
            setDeleteDialogOpen(false)
            setDeleteId(null)
            fetchClients()
        }
    }

    const handleSave = async () => {
        setIsLoading(true)
        try {
            const result = await saveCurrentClients(customers)
            console.log("Data saved successfully:", result)
        } catch (error) {
            console.error("Error saving data:", error)
            toast({
                title: "Error saving data",
                description:
                    "There was an error saving the company records",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
            toast({
                title: "Data saved",
                description:
                    "All company records have been saved successfully",
            })
        }
    }

    const totalPages = Math.ceil(totalItems / itemsPerPage)

    const fmt = (v?: string) =>
        v ? new Date(v).toLocaleString() : "—"

    const handleRowClick = (
        companyId: string,
        countryCode: string
    ) => {
        navigate(`/company-details/${countryCode}/${companyId}`)
        localStorage.setItem("companyRecordId", companyId)
    }

    const handleSearch = async () => {
        const params: GetClientsParams = {
            page: currentPage,
            limit: itemsPerPage,
            sortField: sortConfig?.key,
            sortOrder: sortConfig?.direction,
            status: buildStatusParam(statusFilter),
            jurisdiction: buildJurisdictionParam(
                jurisdictionFilter
            ),
            searchKey: searchQuery.trim(),
        }
        const { data, total } = await getCurrentClients(params)
        if (data) {
            setCustomers(data)
            setTotalItems(total)
        } else {
            toast({
                title: "Error fetching data",
                description:
                    "There was an error fetching the company records",
                variant: "destructive",
            })
        }
    }

    const handleStatusChange = (val: string) => {
        setStatusFilter(val)
        setCurrentPage(1)
    }

    const handleJurisdictionChange = (val: string) => {
        setJurisdictionFilter(val)
        setCurrentPage(1)
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4 py-2 my-4">
                {/* left side controls */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <Input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                    />

                    <Button
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 whitespace-nowrap"
                    >
                        <FileUp className="mr-2 h-4 w-4" />
                        Upload File
                    </Button>

                    <SearchBox
                        value={searchQuery}
                        onChange={setSearchQuery}
                        onSearch={handleSearch}
                        isFocused={isFocused}
                        setIsFocused={setIsFocused}
                        placeText={"Search With Company Name"}
                    />

                    {/* STATUS FILTER */}
                    <div className="w-48 flex flex-col gap-1">
                        <span className="text-[11px] font-medium text-muted-foreground leading-none pl-1">
                            Status
                        </span>
                        <Select
                            value={statusFilter}
                            onValueChange={handleStatusChange}
                        >
                            <SelectTrigger className="w-full h-9">
                                <SelectValue placeholder="Status Filter" />
                            </SelectTrigger>
                            <SelectContent>
                                {uniqueStatusOptions.map((opt) => (
                                    <SelectItem
                                        key={opt.value}
                                        value={opt.value}
                                    >
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* JURISDICTION FILTER */}
                    <div className="w-48 flex flex-col gap-1">
                        <span className="text-[11px] font-medium text-muted-foreground leading-none pl-1">
                            Jurisdiction
                        </span>
                        <Select
                            value={jurisdictionFilter}
                            onValueChange={handleJurisdictionChange}
                        >
                            <SelectTrigger className="w-full h-9">
                                <SelectValue placeholder="Jurisdiction Filter" />
                            </SelectTrigger>
                            <SelectContent className="max-h-64 overflow-y-auto">
                                {uniqueJurisdictionOptions.map((opt) => (
                                    <SelectItem
                                        key={opt.value}
                                        value={opt.value}
                                    >
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* right side actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:ml-auto">
                    <AddCompanyDialog
                        isOpen={isDialogOpen}
                        onOpenChange={setIsDialogOpen}
                        onTriggerClick={openAddDialog}
                        editingCompany={editingCompany}
                        onSubmit={handleCompanySubmit}
                    />
                    <Button
                        size="sm"
                        className="px-3"
                        onClick={handleSave}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <CustomLoader />
                                <span className="ml-2">Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
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
                            <TableHead className="text-center">
                                S.No
                            </TableHead>

                            <TableHead
                                onClick={() => handleSort("status")}
                                className="cursor-pointer hover:bg-gray-100"
                            >
                                <div className="flex items-center">
                                    <span>Status</span>
                                    {sortConfig?.key ===
                                        "status" &&
                                        (sortConfig.direction ===
                                            "asc" ? (
                                            <ChevronUp
                                                size={16}
                                            />
                                        ) : (
                                            <ChevronDown
                                                size={16}
                                            />
                                        ))}
                                </div>
                            </TableHead>

                            <TableHead
                                onClick={() =>
                                    handleSort(
                                        "companyNameEng"
                                    )
                                }
                                className="cursor-pointer hover:bg-gray-100"
                            >
                                <div className="flex items-center">
                                    <span>
                                        Company Name
                                        (ENG)
                                    </span>
                                    {sortConfig?.key ===
                                        "companyNameEng" &&
                                        (sortConfig.direction ===
                                            "asc" ? (
                                            <ChevronUp
                                                size={16}
                                            />
                                        ) : (
                                            <ChevronDown
                                                size={16}
                                            />
                                        ))}
                                </div>
                            </TableHead>

                            <TableHead
                                onClick={() =>
                                    handleSort(
                                        "jurisdiction"
                                    )
                                }
                                className="cursor-pointer hover:bg-gray-100"
                            >
                                <div className="flex items-center">
                                    <span>Country</span>
                                    {sortConfig?.key ===
                                        "jurisdiction" &&
                                        (sortConfig.direction ===
                                            "asc" ? (
                                            <ChevronUp
                                                size={16}
                                            />
                                        ) : (
                                            <ChevronDown
                                                size={16}
                                            />
                                        ))}
                                </div>
                            </TableHead>

                            <TableHead
                                onClick={() =>
                                    handleSort(
                                        "incorporationDate"
                                    )
                                }
                                className="cursor-pointer hover:bg-gray-100"
                            >
                                <div className="flex items-center">
                                    <span>
                                        Incorporation
                                        Date
                                    </span>
                                    {sortConfig?.key ===
                                        "incorporationDate" &&
                                        (sortConfig.direction ===
                                            "asc" ? (
                                            <ChevronUp
                                                size={16}
                                            />
                                        ) : (
                                            <ChevronDown
                                                size={16}
                                            />
                                        ))}
                                </div>
                            </TableHead>

                            <TableHead
                                onClick={() =>
                                    handleSort(
                                        "companyType"
                                    )
                                }
                                className="cursor-pointer hover:bg-gray-100"
                            >
                                <div className="flex items-center">
                                    <span>
                                        Company Type
                                    </span>
                                    {sortConfig?.key ===
                                        "companyType" &&
                                        (sortConfig.direction ===
                                            "asc" ? (
                                            <ChevronUp
                                                size={16}
                                            />
                                        ) : (
                                            <ChevronDown
                                                size={16}
                                            />
                                        ))}
                                </div>
                            </TableHead>

                            <TableHead
                                onClick={() =>
                                    handleSort("brnNo")
                                }
                                className="cursor-pointer hover:bg-gray-100"
                            >
                                <div className="flex items-center">
                                    <span>
                                        BRN No.
                                    </span>
                                    {sortConfig?.key ===
                                        "brnNo" &&
                                        (sortConfig.direction ===
                                            "asc" ? (
                                            <ChevronUp
                                                size={16}
                                            />
                                        ) : (
                                            <ChevronDown
                                                size={16}
                                            />
                                        ))}
                                </div>
                            </TableHead>

                            <TableHead
                                onClick={() =>
                                    handleSort(
                                        "isActiveUser"
                                    )
                                }
                                className="cursor-pointer hover:bg-gray-100"
                            >
                                <div className="flex items-center">
                                    <span>
                                        Is Active User
                                    </span>
                                    {sortConfig?.key ===
                                        "isActiveUser" &&
                                        (sortConfig.direction ===
                                            "asc" ? (
                                            <ChevronUp
                                                size={16}
                                            />
                                        ) : (
                                            <ChevronDown
                                                size={16}
                                            />
                                        ))}
                                </div>
                            </TableHead>

                            <TableHead
                                onClick={() =>
                                    handleSort(
                                        "lastLogin"
                                    )
                                }
                                className="cursor-pointer hover:bg-gray-100"
                            >
                                <div className="flex items-center">
                                    <span>
                                        Last Login
                                    </span>
                                    {sortConfig?.key ===
                                        "lastLogin" &&
                                        (sortConfig.direction ===
                                            "asc" ? (
                                            <ChevronUp
                                                size={16}
                                            />
                                        ) : (
                                            <ChevronDown
                                                size={16}
                                            />
                                        ))}
                                </div>
                            </TableHead>

                            <TableHead className="text-center">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={10}
                                    className="text-center"
                                >
                                    <CustomLoader />
                                </TableCell>
                            </TableRow>
                        ) : customers.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={10}
                                    className="text-center"
                                >
                                    No data available
                                </TableCell>
                            </TableRow>
                        ) : (
                            customers.map(
                                (company, idx) => (
                                    <TableRow
                                        key={`company--${idx}`}
                                        className="hover:bg-muted transition-colors cursor-pointer"
                                        onClick={() =>
                                            handleRowClick(
                                                company._id ??
                                                "",
                                                "ccc"
                                            )
                                        }
                                    >
                                        <TableCell className="text-center font-medium">
                                            {(currentPage -
                                                1) *
                                                itemsPerPage +
                                                idx +
                                                1}
                                        </TableCell>

                                        <TableCell>
                                            {company.status}
                                        </TableCell>

                                        <TableCell>
                                            {
                                                company.companyNameEng
                                            }
                                        </TableCell>

                                        <TableCell>
                                            {
                                                company.jurisdiction
                                            }
                                        </TableCell>

                                        <TableCell>
                                            {
                                                company.incorporationDate
                                            }
                                        </TableCell>

                                        <TableCell>
                                            {
                                                company.companyType
                                            }
                                        </TableCell>

                                        <TableCell>
                                            {company.brnNo}
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {company.isActiveUser ? (
                                                    <>
                                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                        <span>
                                                            Yes
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>
                                                            No
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            {fmt(
                                                company.lastLogin
                                            )}
                                        </TableCell>

                                        <TableCell className="flex items-center justify-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    openEditDialog(
                                                        company
                                                    )
                                                }}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleDelete(
                                                        company._id
                                                    )
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )
                            )
                        )}
                    </TableBody>
                </Table>
                <div className="flex justify-between items-center p-4">
                    <div className="flex items-center gap-2">
                        <span>
                            Items per page:
                        </span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(
                                    Number(e.target.value)
                                )
                                setCurrentPage(1)
                            }}
                            className="border rounded p-1"
                        >
                            <option value={10}>
                                10
                            </option>
                            <option value={25}>
                                25
                            </option>
                            <option value={50}>
                                50
                            </option>
                            <option value={100}>
                                100
                            </option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={
                                currentPage === 1 ||
                                isLoading
                            }
                            onClick={() =>
                                setCurrentPage(
                                    (prev) => prev - 1
                                )
                            }
                        >
                            Previous
                        </Button>
                        <span>
                            Page {currentPage} of{" "}
                            {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={
                                currentPage >=
                                totalPages ||
                                isLoading
                            }
                            onClick={() =>
                                setCurrentPage(
                                    (prev) => prev + 1
                                )
                            }
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
