import { companyTableData } from "./types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom"
import { formatDateTime } from "./utils";
import { useAtom } from "jotai";
import { allCompListAtom } from "@/services/state";

const CurrentCorporateClientList: React.FC = () => {
    const active_status = [
        'Pending',
        'KYC Verification',
        'Waiting for Payment',
        'Waiting for Documents',
        'Waiting for Incorporation'
      ]
      const [allList, ] = useAtom(allCompListAtom)
      const projectsData = (allList as companyTableData[]).filter((e) => !active_status.includes((e as { status: string }).status))
    
  const navigate = useNavigate()
  
  const handleRowClick = (companyId: string, countryCode: string) => {
    navigate(`/company-details/${countryCode}/${companyId}`)
    localStorage.setItem("companyRecordId", companyId)
  }
  
  const handleEditClick = (companyId: string, countryCode: string) => {
    localStorage.setItem("companyRecordId", companyId)
    navigate(`/company-register/${countryCode}/${companyId}`)
  }

  return (
    <div className="rounded-xl border mt-6 mx-2 overflow-x-auto">
  <Table className="w-full text-sm text-left ">
    <TableHeader className="">
      <TableRow>
        <TableHead className="px-4 py-3 min-w-[180px]">Company Name</TableHead>
        <TableHead className="px-4 py-3 min-w-[150px]">Applicant Name</TableHead>
        <TableHead className="px-4 py-3 min-w-[100px]">Country</TableHead>
        <TableHead className="px-4 py-3 min-w-[120px]">Status</TableHead>
        <TableHead className="px-4 py-3 min-w-[120px]">Incorp Date</TableHead>
        <TableHead className="px-4 py-3 min-w-[80px] text-center">Edit</TableHead>
        <TableHead className="px-4 py-3 min-w-[120px]">Assigned To</TableHead>
        <TableHead className="px-4 py-3 min-w-[150px]">Last Login</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {projectsData.map((company) => {
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
            <TableCell className="px-4 py-3 font-medium">
              <span className="hover:underline">
                {typed.companyName.filter(Boolean).join(", ") || "N/A"}
              </span>
            </TableCell>
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
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            </TableCell>
            <TableCell className="px-4 py-3">
              {typed.assignedTo || "N/A"}
            </TableCell>
            <TableCell className="px-4 py-3">
              {typed.lastLogin ? formatDateTime(typed.lastLogin) : "N/A"}
            </TableCell>
          </TableRow>
        )
      })}
    </TableBody>
  </Table>
</div>

  )
}

export default CurrentCorporateClientList