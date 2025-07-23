import { companyTableData } from "./types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom"
import { formatDateTime } from "./utils";
import { useAtom } from "jotai";
import { allCompListAtom } from "@/services/state";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { deleteCompanyRecord } from "@/services/dataFetch";
import CurrentCorpClient from "@/pages/CurrentClient/CurrentCorpClient";

const CurrentCorporateClientList: React.FC = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const currentUser = user ? { role: user.role } : { role: "" };
  const [taskToDelete, setTaskToDelete] = useState<{ companyId: string, countryCode: string } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const active_status = [
    'Pending',
    'KYC Verification',
    'Waiting for Payment',
    'Waiting for Documents',
    'Waiting for Incorporation'
  ]
  const [allList, setAllList] = useAtom(allCompListAtom)
  const projectsData = (allList as companyTableData[]).filter((e) => !active_status.includes((e as { status: string }).status))
  // console.log("projectsData", projectsData)
  const navigate = useNavigate()

  const handleRowClick = (companyId: string, countryCode: string) => {
    navigate(`/company-details/${countryCode}/${companyId}`)
    localStorage.setItem("companyRecordId", companyId)
  }

  const handleEditClick = (companyId: string, countryCode: string) => {
    localStorage.setItem("companyRecordId", companyId)
    navigate(`/company-register/${countryCode}/${companyId}`)
  }

  const handleDeleteClick = (companyId: string, countryCode: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTaskToDelete({ companyId, countryCode });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (taskToDelete?.companyId) {
      const result = await deleteCompanyRecord({ _id: taskToDelete.companyId, country: taskToDelete.countryCode })
      if (result) {
        const updatedList = allList.filter(company => company._id !== taskToDelete.companyId);
        setAllList(updatedList);
      }
    }
    setDeleteDialogOpen(false);
    setTaskToDelete(null);
  };
  console.log("projectsData", projectsData)
  const renderCurrentClientsTable = () => (
    <div className="rounded-xl border overflow-x-auto">
      <Table className="w-full text-sm text-left">
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">S.no</TableHead>
            <TableHead className="px-4 py-3 min-w-[180px]">Company Name</TableHead>
            <TableHead className="px-4 py-3 min-w-[150px]">Applicant Name</TableHead>
            <TableHead className="px-4 py-3 min-w-[100px]">Country</TableHead>
            <TableHead className="px-4 py-3 min-w-[120px]">Status</TableHead>
            <TableHead className="px-4 py-3 min-w-[120px]">Incorp Date</TableHead>
            <TableHead className="px-4 py-3 min-w-[80px] text-center">Edit</TableHead>
            <TableHead className="px-4 py-3 min-w-[120px]">Assigned To</TableHead>
            <TableHead className="px-4 py-3 min-w-[150px]">Last Login</TableHead>
            {currentUser.role == "master" && <TableHead>Delete</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {projectsData.map((company, idx) => {
            const typed = company as companyTableData
            let date = typed.incorporationDate
            if (date) {
              const [y, m, d] = date.split("T")[0].split("-")
              date = `${d}-${m}-${y}`
            }

            return (
              <TableRow
                key={typed._id}
                className="h-12 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleRowClick(typed._id, typed.country.code)}
              >
                <TableCell className="text-center font-medium">{idx + 1}</TableCell>

                {typed.status == "Incorporation Completed" ? (<TableCell className="px-4 py-3 font-medium">
                  <span className="hover:underline">
                    {typed.companyName[0] || "N/A"}
                  </span>
                </TableCell>) : <TableCell className="px-4 py-3 font-medium">
                  <span className="hover:underline">
                    {typed.companyName.filter(Boolean).join(", ") || "N/A"}
                  </span>
                </TableCell>}
                <TableCell className="px-4 py-3">{typed.applicantName}</TableCell>
                <TableCell className="px-4 py-3">{typed.country.name}</TableCell>
                <TableCell className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                      typed.status === "Active" || typed.status === "Good Standing"
                        ? "bg-green-100 text-green-800"
                        : typed.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : typed.status === "Rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                    )}
                  >
                    {typed.status}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3">{date || "N/A"}</TableCell>
                <TableCell className="px-4 py-3 text-center">
                  <button
                    className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50 transition"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditClick(typed._id, typed.country.code)
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16" height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                </TableCell>
                <TableCell className="px-4 py-3">
                  {typed.assignedTo || "N/A"}
                </TableCell>
                <TableCell className="px-4 py-3">
                  {typed.lastLogin ? formatDateTime(typed.lastLogin) : "N/A"}
                </TableCell>
                {currentUser.role == "master" && <TableCell className="py-2">
                  <button
                    className="text-red-500 hover:text-red-700 transition"
                    onClick={(e) => handleDeleteClick(typed._id, typed.country.code, e)}
                  >
                    <Trash2 size={16} />
                  </button>
                </TableCell>}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="mt-6 mx-2">
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="current" className="flex items-center gap-2">
            <span>Current Corporate Clients</span>
          </TabsTrigger>
          <TabsTrigger value="archived" className="flex items-center gap-2">
            <span>Excel Sheet Current Corporate Clients</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          {renderCurrentClientsTable()}
        </TabsContent>

        <TabsContent value="archived" className="space-y-4">
          <CurrentCorpClient />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={"Delete Company"}
        description={'Are you sure you want to delete company?'}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
      />
    </div>
  )
}

export default CurrentCorporateClientList