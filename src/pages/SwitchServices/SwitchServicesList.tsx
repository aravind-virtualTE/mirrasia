/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getSwitchServicesList, deleteSwitchService } from "@/lib/api/FetchData"
import jwtDecode from "jwt-decode"
import { TokenData } from "@/middleware/ProtectedRoutes"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrashIcon } from "lucide-react"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type UserData = {
  _id: string
  userId: string
  name: string
  email: string
  phoneNum: string
  identityVerificationMethod: string
  snsAccountId: {
    id: string
    value: string
  }
  selectedRelation: string[]
}

const formatArrayValue = (arr: string[]): string => {
  if (!arr || arr.length === 0) return ""
  const filtered = arr.filter((val) => val.trim() !== "")
  return filtered.join(", ")
}

export default function SwitchServicesList() {
  const [usersData, setUsersData] = useState<UserData[]>([])
  const [searchTerm,] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<UserData | null>(null)
  const [isPermanentDelete, setIsPermanentDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleRowClick = (item: any) => {
    setSelectedItem(item)
    setDialogOpen(true)
  }

  const handleDeleteClick = (e: React.MouseEvent, item: UserData) => {
    e.stopPropagation()
    setItemToDelete(item)
    setIsPermanentDelete(false)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    setIsDeleting(true)
    try {
      await deleteSwitchService(itemToDelete._id, isPermanentDelete)
      setUsersData(prev => prev.filter(item => item._id !== itemToDelete._id))
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    } catch (error) {
      console.error("Failed to delete", error)
    } finally {
      setIsDeleting(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token") as string
    const decodedToken = jwtDecode<TokenData>(token)

    const getData = async () => {
      try {
        const userId = decodedToken.role === "admin" || decodedToken.role === "master" ? "" : decodedToken.userId
        const data = await getSwitchServicesList(userId)
        // console.log("data",data)
        setUsersData(data.service)
      } catch (error) {
        console.error("Failed to fetch switch services list:", error)
      }
    }

    getData()
  }, [])

  const filteredUsers = usersData.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user._id.includes(searchTerm)
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Switch Services Submissions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[60px]">Sr No.</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>SNS Platform</TableHead>
                  <TableHead>SNS ID</TableHead>
                  <TableHead>Relations</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user, index) => (
                  <TableRow
                    key={user._id}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleRowClick(user)}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-mono text-xs">{user._id.slice(0, 6)}...</TableCell>
                    <TableCell>{user.name || "-"}</TableCell>
                    <TableCell>{user.email || "-"}</TableCell>
                    <TableCell>{user.phoneNum || "-"}</TableCell>
                    <TableCell>{user.identityVerificationMethod || "-"}</TableCell>
                    <TableCell>{user.snsAccountId?.id || "-"}</TableCell>
                    <TableCell>{user.snsAccountId?.value || "-"}</TableCell>
                    <TableCell>{formatArrayValue(user.selectedRelation)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={(e) => handleDeleteClick(e, user)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center">
                      No results found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <DetailDialog open={dialogOpen} onOpenChange={setDialogOpen} data={selectedItem} />
          </div>

          <ConfirmDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            title="Delete Switch Service"
            description={
              <div className="space-y-4">
                <p>Are you sure you want to delete the entry for <strong>{itemToDelete?.name || "this user"}</strong>?</p>
                <div className="flex items-center space-x-2 bg-muted/50 p-3 rounded-md">
                  <Checkbox
                    id="permanent-delete"
                    checked={isPermanentDelete}
                    onCheckedChange={(checked) => setIsPermanentDelete(checked === true)}
                  />
                  <Label htmlFor="permanent-delete" className="font-normal cursor-pointer text-destructive">
                    Permanently delete (this action cannot be undone)
                  </Label>
                </div>
              </div>
            }
            confirmText="Delete"
            loadingText="Deleting..."
            isLoading={isDeleting}
            onConfirm={handleConfirmDelete}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export function DetailDialog({ open, onOpenChange, data }: { open: boolean, onOpenChange: (open: boolean) => void, data: any }) {
  if (!data) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">{data.name || 'User Details'}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="sanctions">Sanctions</TabsTrigger>
            <TabsTrigger value="accounting">Accounting</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto p-4 pr-6">
            <TabsContent value="general" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem label="ID" value={data._id} />
                <InfoItem label="Name" value={data.name} />
                <InfoItem label="Email" value={data.email} />
                <InfoItem label="Phone" value={data.phoneNum} />
                <InfoItem label="Identity Verification" value={data.identityVerificationMethod} />
                <InfoItem label="Notify Company" value={data.notifyCompany} />
                <InfoItem label="SNS Account" value={`${data.snsAccountId?.id || ''} - ${data.snsAccountId?.value || ''}`} />
                <InfoItem label="Selected Services" value={formatArrayValue(data.selectedServices)} />
                <InfoItem label="Transfer Reasons" value={formatArrayValue(data.transferReasons)} />
                <InfoItem label="Submitted Documents" value={formatArrayValue(data.submittedDocuments)} />
                <InfoItem label="Established Relationship" value={formatArrayValue(data.establishedRelationshipType)} />
                <InfoItem label="Selected Relation" value={formatArrayValue(data.selectedRelation)} />
              </div>
            </TabsContent>

            <TabsContent value="business" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem label="Industry" value={formatArrayValue(data.industry)} />
                <InfoItem label="Other Industry" value={data.otherIndustryText} />
                <InfoItem label="Product/Service Description" value={data.productServiceDescription} />
                <InfoItem label="Business Purpose" value={formatArrayValue(data.businessPurpose)} />
                <InfoItem label="Business Intentions (Legal Issues)" value={data.businessIntentions?.legalIssues} />
                <InfoItem label="Business Intentions (Tx Exemption)" value={data.businessIntentions?.taxExemption} />
                <InfoItem label="Business Intentions (Maintenance)" value={data.businessIntentions?.maintenanceCost} />
                <InfoItem label="Business Intentions (Falsify Tax)" value={data.businessIntentions?.falsifyTax} />
                <InfoItem label="Transaction Info (Crypto)" value={data.transactionInfo?.involvedCrypto} />
                <InfoItem label="Transaction Info (Bank Account)" value={data.transactionInfo?.openedBankAccount} />
              </div>
            </TabsContent>

            <TabsContent value="sanctions" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem label="Country Business" value={data.tradeSanctions?.countryBusiness} />
                <InfoItem label="Sanctioned Residents" value={data.tradeSanctions?.sanctionedResidents} />
                <InfoItem label="Crimea Business" value={data.tradeSanctions?.crimeaBusiness} />
                <InfoItem label="Sensitive Industry" value={data.tradeSanctions?.sensitiveIndustry} />
              </div>
            </TabsContent>

            <TabsContent value="accounting" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem label="Fiscal Year Answer" value={data.accountingTaxation?.fiscalYearAnswer} />
                <InfoItem label="Last Tax Return" value={data.accountingTaxation?.lastTaxReturnAnswer} />
                <InfoItem label="Last Audit" value={data.accountingTaxation?.lastAuditAnswer} />
                <InfoItem label="In-house Accounting" value={data.accountingTaxation?.inHouseAccountingAnswer} />
                <InfoItem label="Accounting Record Prepared" value={data.accountingTaxation?.accountingRecordPreparedAnswer} />
                <InfoItem label="Xero Implementation" value={data.accountingTaxation?.xeroImplementationAnswer} />
                <InfoItem label="Separate Accounting Software" value={data.accountingTaxation?.separateAccountingSoftwareAnswer} />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

function InfoItem({ label, value, className = "" }: { label: string; value: any; className?: string }) {
  if (value === undefined || value === null || value === "" || value === " - ") return null;
  return (
    <div className="space-y-1 bg-muted/30 p-3 rounded-lg border border-border/50">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className={`text-sm text-foreground ${className}`}>{String(value)}</p>
    </div>
  )
}
