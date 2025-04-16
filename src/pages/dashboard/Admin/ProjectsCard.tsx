import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FolderKanban, Pencil } from "lucide-react"
import { useState } from "react"
import { companyTableData } from "./types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom"
import { formatDateTime } from "./utils";

const ProjectsCard: React.FC<{ data: companyTableData[] }> = ({ data }) => {
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()
    // console.log("data",data)
    const handleRowClick = (companyId: string, countryCode: string) => {
        navigate(`/company-details/${countryCode}/${companyId}`)
        localStorage.setItem("companyRecordId", companyId)
    }
    const handleEditClick = (companyId: string, countryCode: string) => {
        localStorage.setItem("companyRecordId", companyId)
        navigate(`/company-register/${countryCode}/${companyId}`)
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Card onClick={() => setOpen(true)} className="cursor-pointer hover:shadow-lg transition-shadow p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FolderKanban className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium">Projects</span>
                        </div>
                        <span className="text-sm text-muted-foreground">Active: <span className="font-bold">{data.length}</span></span>
                    </div>
                </Card>
            </DialogTrigger>
            <DialogContent
                className="w-[70vw] h-[90vh] max-w-none flex flex-col p-0 overflow-hidden"
                style={{ maxHeight: "90vh" }}
            >
                <DialogHeader>
                    <DialogTitle>Projects</DialogTitle>
                </DialogHeader>
                <Card className="p-4 h-full">
                    <div className="flex items-center justify-between">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="cursor-pointer hover:bg-muted/50">
                                        <div className="flex items-center">
                                            Company Name
                                        </div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer hover:bg-muted/50">
                                        <div className="flex items-center">
                                            Applicant Name

                                        </div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer hover:bg-muted/50" >
                                        <div className="flex items-center">
                                            Country
                                        </div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer hover:bg-muted/50">
                                        <div className="flex items-center">
                                            Status
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-muted/50"
                                    >                                            <div className="flex items-center">
                                            Incorporation Date
                                        </div>
                                    </TableHead>
                                    <TableHead>Edit</TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-muted/50"
                                    >
                                        <div className="flex items-center">
                                            Assigned To
                                        </div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer hover:bg-muted/50" >
                                        <div className="flex items-center">
                                            User Latest Login
                                        </div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((company) => {
                                    const typedCompany = company as companyTableData
                                    let date = typedCompany.incorporationDate
                                    if (date !== null) {
                                        const [year, month, day] = date.split("T")[0].split("-")
                                        date = `${day}-${month}-${year}`
                                    }

                                    return (
                                        <TableRow key={typedCompany._id} className="text-xs h-10">
                                            <TableCell
                                                className="font-medium cursor-pointer py-2"
                                                onClick={() => handleRowClick(typedCompany._id, typedCompany.country.code)}
                                            >
                                                {typedCompany.companyName.filter(Boolean).join(", ") || "N/A"}
                                            </TableCell>
                                            <TableCell className="font-medium py-2">{typedCompany.applicantName}</TableCell>
                                            <TableCell className="font-medium py-2">{typedCompany.country.name}</TableCell>
                                            <TableCell className="py-2">
                                                <span
                                                    className={cn(
                                                        "inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium",
                                                        typedCompany.status === "Active" || typedCompany.status === "Good Standing"
                                                            ? "bg-green-100 text-green-800"
                                                            : typedCompany.status === "Pending"
                                                                ? "bg-yellow-100 text-yellow-800"
                                                                : typedCompany.status === "Rejected"
                                                                    ? "bg-red-100 text-red-800"
                                                                    : "bg-blue-100 text-blue-800",
                                                    )}
                                                >
                                                    {typedCompany.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-2">{date || "N/A"}</TableCell>
                                            <TableCell className="py-2">
                                                <button
                                                    className="text-blue-500 hover:text-blue-700 transition"
                                                    onClick={() => handleEditClick(typedCompany._id, typedCompany.country.code)}
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                            </TableCell>
                                            <TableCell className="py-2">
                                                {typedCompany.assignedTo ? typedCompany.assignedTo : "N/A"}
                                            </TableCell>
                                            <TableCell className="py-2">
                                                {typedCompany.lastLogin ? formatDateTime(typedCompany.lastLogin) : "N/A"}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </DialogContent>
        </Dialog>

    )
}


export default ProjectsCard