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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { FileUp, Plus, Pencil, Trash2, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import CustomLoader from "@/components/ui/customLoader"
import { getCurrentClients, saveCurrentClients } from "@/services/dataFetch"

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
  id: number
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

export default function CustomerDataManager() {
  const [customers, setCustomers] = useState<Company[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState<Company>({
    id: 0,
    status: "",
    jurisdiction: "",
    comments: "",
    incorporationDate: "",
    companyNameEng: "",
    companyNameChi: "",
    companyType: "",
    brnNo: "",
    noOfShares: 0,
    shareCapital: "",
    directors: [{ name: "", email: "", phone: "" }, { name: "", email: "", phone: "" }],
    shareholders: [{ name: "", email: "", totalShares: 0 }, { name: "", email: "", totalShares: 0 }],
    designatedContact: { name: "", email: "", phone: "" },
    companySecretarialService: "No",
    registeredBusinessAddressService: "No",
  })

  useEffect(() => {
    
    const getData = async( ) =>{
      try{
        const data = await getCurrentClients()
        console.log("data--->", data)
        setCustomers(data)
      }catch(e){
        console.log("err", e)
      }
    }
    getData()
  }, [])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const fileExtension = file.name.split(".").pop()?.toLowerCase()

    if (fileExtension === "csv") {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const parsedData = results.data as any[]
          const validData = parsedData
            .filter((item) => item["COMPANY NAME (ENG)"])
            .map((item, index) => ({
              id: customers.length + index + 1,
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
          const validData = jsonData
            .filter((item) => item["COMPANY NAME (ENG)"])
            .map((item, index) => ({
              id: customers.length + index + 1,
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
          console.log("validData--->", validData)
          setCustomers((prev) => [...prev, ...validData])
          toast({
            title: "File uploaded successfully",
            description: `Added ${validData.length} company records`,
          })
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

  const openAddDialog = () => {
    setEditingCompany(null)
    setFormData({
      id: customers.length + 1,
      status: '',
      jurisdiction: "",
      comments: "",
      incorporationDate: "",
      companyNameEng: "",
      companyNameChi: "",
      companyType: "",
      brnNo: "",
      noOfShares: 0,
      shareCapital: "",
      directors: [{ name: "", email: "", phone: "" }, { name: "", email: "", phone: "" }],
      shareholders: [{ name: "", email: "", totalShares: 0 }, { name: "", email: "", totalShares: 0 }],
      designatedContact: { name: "", email: "", phone: "" },
      companySecretarialService: "No",
      registeredBusinessAddressService: "No",
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (company: Company) => {
    setEditingCompany(company)
    setFormData(company)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    setDeleteId(id)
    setDeleteDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingCompany) {
      setCustomers(
        customers.map((company) =>
          company.id === editingCompany.id ? { ...formData, id: company.id } : company
        )
      )
      toast({
        title: "Company updated",
        description: "The company record has been updated",
      })
    } else {
      setCustomers([...customers, { ...formData, id: customers.length + 1 }])
      toast({
        title: "Company added",
        description: "New company record has been added",
      })
    }
    setIsDialogOpen(false)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof Company | string,
    index?: number,
    subField?: keyof Director | keyof Shareholder | keyof DesignatedContact
  ) => {
    if (index !== undefined && subField) {
      if (field === "directors" || field === "shareholders") {
        setFormData((prev) => ({
          ...prev,
          [field]: prev[field].map((item: any, i: number) =>
            i === index ? { ...item, [subField]: e.target.value } : item
          ),
        }))
      } else if (field === "designatedContact") {
        setFormData((prev) => ({
          ...prev,
          designatedContact: { ...prev.designatedContact, [subField]: e.target.value },
        }))
      }
    } else {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    }
  }

  const handleDeleteTask = async () => {
    setCustomers(customers.filter((company) => company.id !== deleteId))
    toast({
      title: "Company deleted",
      description: "The company record has been removed",
    })
    setDeleteDialogOpen(false)
    setDeleteId(null)
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Simulate saving data to a server
      console.log("Saving data...", customers)
      const response  = await saveCurrentClients(customers)
      console.log("Save response:", response)
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
          <Button size="sm" className="px-3" onClick={openAddDialog} >
            <Plus className="h-4 w-4 mr-1" />
            Add Company
          </Button>
        </div>
        <div className="flex gap-2 self-end">
          <Button size="sm" className="px-3" onClick={handleSave}>
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
              <TableHead className="w-12 text-center">S.No</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Company Name (ENG)</TableHead>
              <TableHead>Jurisdiction</TableHead>
              <TableHead>Incorporation Date</TableHead>
              <TableHead>Company Type</TableHead>
              <TableHead>BRN No.</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((company, idx) => (
              <TableRow key={company.id} className="hover:bg-muted transition-colors">
                <TableCell className="text-center font-medium">{idx + 1}</TableCell>
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
                    onClick={() => handleDelete(company.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[900px] max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCompany ? "Edit Company" : "Add Company"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Company Name (ENG)</Label>
              <Input
                value={formData.companyNameEng}
                onChange={(e) => handleInputChange(e, "companyNameEng")}
                required
              />
            </div>
            <div>
              <Label>Jurisdiction</Label>
              <Input
                value={formData.jurisdiction}
                onChange={(e) => handleInputChange(e, "jurisdiction")}
              />
            </div>
            <div>
              <Label>Incorporation Date</Label>
              <Input
                value={formData.incorporationDate}
                onChange={(e) => handleInputChange(e, "incorporationDate")}
              />
            </div>
            <div>
              <Label>Company Type</Label>
              <Input
                value={formData.companyType}
                onChange={(e) => handleInputChange(e, "companyType")}
              />
            </div>
            <div>
              <Label>BRN No.</Label>
              <Input
                value={formData.brnNo}
                onChange={(e) => handleInputChange(e, "brnNo")}
              />
            </div>
            <div>
              <Label>Number of Shares</Label>
              <Input
                type="number"
                value={formData.noOfShares}
                onChange={(e) => handleInputChange(e, "noOfShares")}
              />
            </div>
            <div>
              <Label>Share Capital</Label>
              <Input
                value={formData.shareCapital}
                onChange={(e) => handleInputChange(e, "shareCapital")}
              />
            </div>
            <div>
              <Label>Director 1 Name</Label>
              <Input
                value={formData.directors[0].name}
                onChange={(e) => handleInputChange(e, "directors", 0, "name")}
              />
            </div>
            <div>
              <Label>Shareholder 1 Name</Label>
              <Input
                value={formData.shareholders[0].name}
                onChange={(e) => handleInputChange(e, "shareholders", 0, "name")}
              />
            </div>
            <DialogFooter>
              <Button type="submit">{editingCompany ? "Update" : "Add"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Task"
        description={
          <>
            Are you sure you want to delete this Task?
          </>
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteTask}
      />
    </div>
  )
}