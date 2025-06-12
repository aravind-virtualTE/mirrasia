/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"
import { Company, DesignatedContact, Director, Shareholder } from "./cccState"


interface AddCompanyDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onTriggerClick: () => void
  editingCompany: Company | null
  onSubmit: (company: Company) => void
}

const getInitialFormData = (): Company => ({
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

export default function AddCompanyDialog({
  isOpen,
  onOpenChange,
  onTriggerClick,
  editingCompany,
  onSubmit,
}: AddCompanyDialogProps) {
  const [formData, setFormData] = useState<Company>(getInitialFormData())

  // Update form data whenever editingCompany changes
  useEffect(() => {
    if (editingCompany) {
      setFormData({...editingCompany})
    } else {
      setFormData(getInitialFormData())
    }
  }, [editingCompany])

  // Also update when dialog opens (for manual button clicks)
  useEffect(() => {
    if (isOpen) {
      if (editingCompany) {
        setFormData({...editingCompany})
      } else {
        setFormData(getInitialFormData())
      }
    }
  }, [isOpen, editingCompany])

  const handleOpen = () => {
    onTriggerClick()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    // Reset form only if not editing (adding new company)
    if (!editingCompany) {
      setFormData(getInitialFormData())
    }
  }

  const handleInputChange = (
    e: any,
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

  const handleSelectChange = (value: string, field: keyof Company) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addDirector = () => {
    setFormData((prev) => ({
      ...prev,
      directors: [...prev.directors, { name: "", email: "", phone: "" }],
    }))
  }

  const removeDirector = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      directors: prev.directors.filter((_, i) => i !== index),
    }))
  }

  const addShareholder = () => {
    setFormData((prev) => ({
      ...prev,
      shareholders: [...prev.shareholders, { name: "", email: "", totalShares: 0 }],
    }))
  }

  const removeShareholder = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      shareholders: prev.shareholders.filter((_, i) => i !== index),
    }))
  }

  return (
    <>
      <Button size="sm" className="px-3" onClick={handleOpen}>
        <Plus className="h-4 w-4 mr-1" />
        Add Current Corporate Client
      </Button>

      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[70vw] max-h-[70vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              {editingCompany ? "Edit Company" : "Add Company"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Company Information Section */}
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-800 border-b pb-2">Company Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Company Name (English)</Label>
                  <Input
                    value={formData.companyNameEng}
                    onChange={(e) => handleInputChange(e, "companyNameEng")}
                    className="h-9 text-sm"
                    placeholder="Enter company name"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Company Name (Chinese)</Label>
                  <Input
                    value={formData.companyNameChi}
                    onChange={(e) => handleInputChange(e, "companyNameChi")}
                    className="h-9 text-sm"
                    placeholder="Enter Chinese name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Jurisdiction</Label>
                  <Input
                    value={formData.jurisdiction}
                    onChange={(e) => handleInputChange(e, "jurisdiction")}
                    className="h-9 text-sm"
                    placeholder="e.g., Singapore"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Incorporation Date</Label>
                  <Input
                    type="date"
                    value={formData.incorporationDate}
                    onChange={(e) => handleInputChange(e, "incorporationDate")}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Company Type</Label>
                  <Input
                    value={formData.companyType}
                    onChange={(e) => handleInputChange(e, "companyType")}
                    className="h-9 text-sm"
                    placeholder="e.g., Private Limited"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">BRN No.</Label>
                  <Input
                    value={formData.brnNo}
                    onChange={(e) => handleInputChange(e, "brnNo")}
                    className="h-9 text-sm"
                    placeholder="Business registration"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Number of Shares</Label>
                  <Input
                    type="number"
                    value={formData.noOfShares}
                    onChange={(e) => handleInputChange(e, "noOfShares")}
                    className="h-9 text-sm"
                    placeholder="Number"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Share Capital</Label>
                  <Input
                    value={formData.shareCapital}
                    onChange={(e) => handleInputChange(e, "shareCapital")}
                    className="h-9 text-sm"
                    placeholder="Amount"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Status</Label>
                  <Input
                    value={formData.status}
                    onChange={(e) => handleInputChange(e, "status")}
                    className="h-9 text-sm"
                    placeholder="Company status"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">Comments</Label>
                <Textarea
                  value={formData.comments}
                  onChange={(e) => handleInputChange(e, "comments")}
                  className="text-sm resize-none"
                  placeholder="Additional comments..."
                  rows={3}
                />
              </div>
            </div>

            {/* Directors Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-md font-medium text-gray-800 border-b pb-2 flex-1">Directors</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addDirector}
                  className="ml-4"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Director
                </Button>
              </div>

              {formData.directors.map((director, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Director {index + 1}</span>
                    {formData.directors.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeDirector(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-gray-700">Name</Label>
                      <Input
                        value={director.name}
                        onChange={(e) => handleInputChange(e, "directors", index, "name")}
                        className="h-9 text-sm"
                        placeholder="Director name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-gray-700">Email</Label>
                      <Input
                        type="email"
                        value={director.email}
                        onChange={(e) => handleInputChange(e, "directors", index, "email")}
                        className="h-9 text-sm"
                        placeholder="Email address"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-gray-700">Phone</Label>
                      <Input
                        value={director.phone}
                        onChange={(e) => handleInputChange(e, "directors", index, "phone")}
                        className="h-9 text-sm"
                        placeholder="Phone number"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Shareholders Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-md font-medium text-gray-800 border-b pb-2 flex-1">Shareholders</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addShareholder}
                  className="ml-4"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Shareholder
                </Button>
              </div>

              {formData.shareholders.map((shareholder, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Shareholder {index + 1}</span>
                  {formData.shareholders.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeShareholder(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">Name</Label>
                    <Input
                      value={shareholder.name}
                      onChange={(e) => handleInputChange(e, "shareholders", index, "name")}
                      className="h-9 text-sm"
                      placeholder="Shareholder name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">Email</Label>
                    <Input
                      type="email"
                      value={shareholder.email}
                      onChange={(e) => handleInputChange(e, "shareholders", index, "email")}
                      className="h-9 text-sm"
                      placeholder="Email address"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">Total Shares</Label>
                    <Input
                      type="number"
                      value={shareholder.totalShares}
                      onChange={(e) => handleInputChange(e, "shareholders", index, "totalShares")}
                      className="h-9 text-sm"
                      placeholder="Number of shares"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Designated Contact Section */}
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-800 border-b pb-2">Designated Contact</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">Name</Label>
                <Input
                  value={formData.designatedContact.name}
                  onChange={(e) => handleInputChange(e, "designatedContact", undefined, "name")}
                  className="h-9 text-sm"
                  placeholder="Contact name"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">Email</Label>
                <Input
                  type="email"
                  value={formData.designatedContact.email}
                  onChange={(e) => handleInputChange(e, "designatedContact", undefined, "email")}
                  className="h-9 text-sm"
                  placeholder="Email address"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">Phone</Label>
                <Input
                  value={formData.designatedContact.phone}
                  onChange={(e) => handleInputChange(e, "designatedContact", undefined, "phone")}
                  className="h-9 text-sm"
                  placeholder="Phone number"
                />
              </div>
            </div>
          </div>

          {/* Services Section */}
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-800 border-b pb-2">Services</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">Company Secretarial Service</Label>
                <Select
                  value={formData.companySecretarialService}
                  onValueChange={(value) => handleSelectChange(value, "companySecretarialService")}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">Registered Business Address Service</Label>
                <Select
                  value={formData.registeredBusinessAddressService}
                  onValueChange={(value) => handleSelectChange(value, "registeredBusinessAddressService")}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-6 border-t border-gray-100">
          <div className="flex gap-2 w-full justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="px-4 h-9 text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="px-6 h-9 text-sm"
            >
              {editingCompany ? "Update" : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}