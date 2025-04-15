import React, { useState, useEffect } from 'react'
import { fetchAccountingServices } from './hk/accountingServiceFetch';
import { format } from "date-fns"
import { FileIcon, ImageIcon, FileTextIcon, ExternalLinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AccountingServiceItem {
  _id: string
  userId: string
  companyName: string
  email: string
  countryName: string
  dateOfIncorporation: string
  selectedIndustry: string[]
  transactionDescription: string
  costOfGoodsSold: string[]
  costSaleRatio: string
  accountingForm: Record<string, string | number | boolean>
  accountInfoData: {
    [key: string]: string[] | string | number
    salesExpenseFiles: string[]
    subsidiaryFiles: string[]
    branchFiles: string[]
    transactionFiles: string[]
  }
}

const AccountingHkList: React.FC = () => {
  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState<AccountingServiceItem | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleRowClick = (item: AccountingServiceItem) => {
    setSelectedItem(item)
    setDialogOpen(true)
  }

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const currentUser = user ? { _id: user.id, fullName: user.fullName, role:user.role } : { _id: "", fullName: "" , role: ""};

  useEffect(() => {
    // console.log('currentUser',currentUser);
    const getData = async () => {
      let result = []
      if(currentUser.role === 'user'){
        result = await fetchAccountingServices(currentUser._id)
      }else{
        result = await fetchAccountingServices()      
      }
      setData(result);
    }
    if (currentUser._id) {
      getData();
    }
  }, [])
  // console.log('data', data);
  return (
    <div className="rounded-md border">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Industry</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item: AccountingServiceItem) => (
            <TableRow
              key={item._id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleRowClick(item)}
            >
              <TableCell className="font-mono text-xs">{item._id.substring(0, 8)}...</TableCell>
              <TableCell className="font-medium">{item.companyName}</TableCell>
              <TableCell>{item.email}</TableCell>
              <TableCell className="capitalize">{item.countryName}</TableCell>
              <TableCell>{format(new Date(item.dateOfIncorporation), "MMM d, yyyy")}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {item.selectedIndustry.map((industry: string) => (
                    <span
                      key={industry}
                      className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold capitalize"
                    >
                      {industry}
                    </span>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <DetailDialog open={dialogOpen} onOpenChange={setDialogOpen} data={selectedItem} />
    </div>
  )
}

export default AccountingHkList




interface DetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: AccountingServiceItem | null
}

export function DetailDialog({ open, onOpenChange, data }: DetailDialogProps) {
  if (!data) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">{data.companyName}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="accounting">Accounting</TabsTrigger>
            <TabsTrigger value="account-info">Account Info</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 p-4">
            <TabsContent value="general" className="mt-0">
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="Company ID" value={data._id} />
                <InfoItem label="User ID" value={data.userId} />
                <InfoItem label="Email" value={data.email} />
                <InfoItem label="Country" value={data.countryName} className="capitalize" />
                <InfoItem
                  label="Date of Incorporation"
                  value={format(new Date(data.dateOfIncorporation), "MMMM d, yyyy")}
                />
                <InfoItem label="Industry" value={data.selectedIndustry.join(", ")} className="capitalize" />
                <InfoItem label="Transaction Description" value={data.transactionDescription} />
                <InfoItem label="Cost of Goods Sold" value={data.costOfGoodsSold.join(", ")} className="capitalize" />
                <InfoItem label="Cost Sale Ratio" value={data.costSaleRatio} />
              </div>
            </TabsContent>

            <TabsContent value="accounting" className="mt-0">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(data.accountingForm).map(([key, value]) => (
                  <InfoItem key={key} label={formatLabel(key)} value={String(value)} className="capitalize" />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="account-info" className="mt-0">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(data.accountInfoData).map(([key, value]) => {
                  if (Array.isArray(value)) {
                    return <InfoItem key={key} label={formatLabel(key)} value={`${value.length} files`} />
                  }
                  return <InfoItem key={key} label={formatLabel(key)} value={String(value)} className="capitalize" />
                })}
              </div>
            </TabsContent>

            <TabsContent value="files" className="mt-0">
              <div className="space-y-6">
                <FileSection title="Sales Expense Files" files={data.accountInfoData.salesExpenseFiles} />
                <FileSection title="Subsidiary Files" files={data.accountInfoData.subsidiaryFiles} />
                <FileSection title="Branch Files" files={data.accountInfoData.branchFiles} />
                <FileSection title="Transaction Files" files={data.accountInfoData.transactionFiles} />
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

function InfoItem({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className={`text-sm ${className}`}>{value}</p>
    </div>
  )
}

function FileSection({ title, files }: { title: string; files: string[] }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium">{title}</h3>
      {files.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {files.map((file, index) => (
            <FileDisplay key={index} url={file} />
          ))}
        </div>
      ) : (
        <p>No files found.</p>
      )}
    </div>
  )
}

function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/([A-Z])/g, (match) => ` ${match}`)
    .replace(/([A-Z][a-z])/g, " $1")
}



interface FileDisplayProps {
  url: string
}

export function FileDisplay({ url }: FileDisplayProps) {
  const [expanded, setExpanded] = useState(false)
  const fileName = url.split("/").pop() || "File"
  const fileType = getFileType(url)

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {fileType === "image" ? (
              <ImageIcon className="h-5 w-5 text-blue-500" />
            ) : fileType === "pdf" ? (
              <FileTextIcon className="h-5 w-5 text-red-500" />
            ) : (
              <FileIcon className="h-5 w-5 text-gray-500" />
            )}
            <span className="text-sm font-medium truncate max-w-[200px]">{fileName}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setExpanded(!expanded)}>
              {expanded ? "Collapse" : "Expand"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.open(url, "_blank")}>
              <ExternalLinkIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 border rounded-md overflow-hidden" style={{ height: "400px" }}>
            {fileType === "image" ? (
              <img
                src={url || "/placeholder.svg"}
                alt={fileName}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=400&width=600"
                }}
              />
            ) : (
              <iframe src={url} title={fileName} className="w-full h-full" sandbox="allow-scripts allow-same-origin" />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function getFileType(url: string): "image" | "pdf" | "other" {
  const extension = url.split(".").pop()?.toLowerCase()

  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension || "")) {
    return "image"
  } else if (extension === "pdf") {
    return "pdf"
  }

  return "other"
}
