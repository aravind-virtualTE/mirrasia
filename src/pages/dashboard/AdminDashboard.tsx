import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import {
  Clock,
  UserCheck,
  CreditCard,
  FileText,
  Building,
  CheckCircle,
  Award,
  RefreshCw,
  CalendarCheck,
  Pencil,
  Users,
  FolderKanban,
  ChevronUp,
  ChevronDown,
  XCircle,
  ListTodo
} from "lucide-react"
import { getIncorporationList } from "@/services/dataFetch"
import { useAtom, useSetAtom } from "jotai"
import { allCompListAtom, companyIncorporationList } from "@/services/state"
import { cn } from "@/lib/utils"
import { useNavigate } from "react-router-dom"
import { usaFormWithResetAtom } from "../Company/USA/UsState"
import { useResetAllForms } from "@/lib/atom"

interface Stats {
  pending: number
  kycVerification: number
  waitingForPayment: number
  waitingForDocuments: number
  waitingForIncorporation: number
  incorporationCompleted: number
  goodStanding: number
  renewalProcessing: number
  renewalCompleted: number
  rejected: number
}

const AdminDashboard = () => {
  const setCompIncList = useSetAtom(companyIncorporationList)
  const [allList, setAllList] = useAtom(allCompListAtom)
  const navigate = useNavigate()
  const [, setUsaReset] = useAtom(usaFormWithResetAtom)
  const resetAllForms = useResetAllForms();
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: "ascending" | "descending"
  } | null>(null)

  useEffect(() => {
    setUsaReset('reset')
    resetAllForms()
    async function fetchData() {
      const result = await getIncorporationList()
      return result
    }
    fetchData().then((result) => {
      setCompIncList(result.companies)
      setAllList(result.allCompanies)
    })
  }, [setCompIncList, setAllList])

  const statusToKey = (status: string): keyof Stats => {
    const mapping: Record<string, keyof Stats> = {
      Pending: "pending",
      "KYC Verification": "kycVerification",
      "Waiting for Payment": "waitingForPayment",
      "Waiting for Documents": "waitingForDocuments",
      "Waiting for Incorporation": "waitingForIncorporation",
      "Incorporation Completed": "incorporationCompleted",
      "Good Standing": "goodStanding",
      "Renewal Processing": "renewalProcessing",
      "Renewal Completed": "renewalCompleted",
      Rejected: "rejected",
      Active: "goodStanding",
    }
    return mapping[status] || "pending"
  }

  const calculateStats = (): Stats => {
    const initialStats: Stats = {
      pending: 0,
      kycVerification: 0,
      waitingForPayment: 0,
      waitingForDocuments: 0,
      waitingForIncorporation: 0,
      incorporationCompleted: 0,
      goodStanding: 0,
      renewalProcessing: 0,
      renewalCompleted: 0,
      rejected: 0,
    }

    return allList.reduce((acc: Stats, company) => {
      const key = statusToKey(company.status as string)
      if (key in acc) {
        acc[key]++
      }
      return acc
    }, initialStats)
  }

  const handleRowClick = (companyId: string, countryCode: string) => {
    navigate(`/company-details/${countryCode}/${companyId}`)
    localStorage.setItem("companyRecordId", companyId)
  }

  const handleEditClick = (companyId: string, countryCode: string) => {
    localStorage.setItem("companyRecordId", companyId)
    navigate(`/company-register/${countryCode}/${companyId}`)
  }

  function formatDateTime(isoDateString: string) {
    if (!isoDateString) return ""
    try {
      const date = new Date(isoDateString)
      const day = date.getDate().toString().padStart(2, "0")
      const month = (date.getMonth() + 1).toString().padStart(2, "0")
      const year = date.getFullYear()
      return `${day}-${month}-${year}`
    } catch (error) {
      console.error("Error formatting date:", error)
      return ""
    }
  }

  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  const getSortedData = () => {
    const sortedData = [...allList]

    if (sortConfig !== null) {
      sortedData.sort((a: any, b: any) => {
        let aValue, bValue

        if (sortConfig.key === "companyName") {
          aValue = a.companyName.filter(Boolean).join(", ") || ""
          bValue = b.companyName.filter(Boolean).join(", ") || ""
        } else if (sortConfig.key === "country") {
          aValue = a.country.name
          bValue = b.country.name
        } else if (sortConfig.key === "incorporationDate") {
          aValue = a.incorporationDate || ""
          bValue = b.incorporationDate || ""
        } else {
          aValue = a[sortConfig.key] || ""
          bValue = b[sortConfig.key] || ""
        }

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1
        }
        return 0
      })
    }

    return sortedData
  }

  return (
    <div className="p-6 space-y-6 w-full max-w-6xl mx-auto">
      {/* Stats Cards */}
      <StatsCard stats={calculateStats()} />

      <Separator className="my-6" />

      {/* Additional Cards Section */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <ProjectsCard />
        <AdminTodo />
        <UsersCard />
        <CurrentClients />
      </div>

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Incorporation Process</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort("companyName")}>
                    <div className="flex items-center">
                      Company Name
                      {sortConfig?.key === "companyName" &&
                        (sortConfig.direction === "ascending" ? (
                          <ChevronUp className="ml-1 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-1 h-4 w-4" />
                        ))}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort("applicantName")}>
                    <div className="flex items-center">
                      Applicant Name
                      {sortConfig?.key === "applicantName" &&
                        (sortConfig.direction === "ascending" ? (
                          <ChevronUp className="ml-1 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-1 h-4 w-4" />
                        ))}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort("country")}>
                    <div className="flex items-center">
                      Country
                      {sortConfig?.key === "country" &&
                        (sortConfig.direction === "ascending" ? (
                          <ChevronUp className="ml-1 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-1 h-4 w-4" />
                        ))}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort("status")}>
                    <div className="flex items-center">
                      Status
                      {sortConfig?.key === "status" &&
                        (sortConfig.direction === "ascending" ? (
                          <ChevronUp className="ml-1 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-1 h-4 w-4" />
                        ))}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => requestSort("incorporationDate")}
                  >
                    <div className="flex items-center">
                      Incorporation Date
                      {sortConfig?.key === "incorporationDate" &&
                        (sortConfig.direction === "ascending" ? (
                          <ChevronUp className="ml-1 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-1 h-4 w-4" />
                        ))}
                    </div>
                  </TableHead>
                  <TableHead>Edit</TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort("lastLogin")}>
                    <div className="flex items-center">
                      User Latest Login
                      {sortConfig?.key === "lastLogin" &&
                        (sortConfig.direction === "ascending" ? (
                          <ChevronUp className="ml-1 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-1 h-4 w-4" />
                        ))}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getSortedData().map((company) => {
                  const typedCompany = company as {
                    country: { name: string; code: string }
                    companyName: string[]
                    applicantName: string
                    status: string
                    incorporationDate: string | null
                    lastLogin: string | null
                    _id: string
                  }

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
                        {typedCompany.lastLogin ? formatDateTime(typedCompany.lastLogin) : "N/A"}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminDashboard

const icons: Record<keyof Stats, React.JSX.Element> = {
  pending: <Clock className="h-4 w-4 text-orange-500" />,
  kycVerification: <UserCheck className="h-4 w-4 text-blue-500" />,
  waitingForPayment: <CreditCard className="h-4 w-4 text-purple-500" />,
  waitingForDocuments: <FileText className="h-4 w-4 text-indigo-500" />,
  waitingForIncorporation: <Building className="h-4 w-4 text-cyan-500" />,
  incorporationCompleted: <CheckCircle className="h-4 w-4 text-emerald-500" />,
  goodStanding: <Award className="h-4 w-4 text-green-500" />,
  renewalProcessing: <RefreshCw className="h-4 w-4 text-amber-500" />,
  renewalCompleted: <CalendarCheck className="h-4 w-4 text-teal-500" />,
  rejected: <XCircle className="h-4 w-4 text-red-500" />,
}

const descriptions: Record<keyof Stats, string> = {
  pending: "Awaiting initial processing",
  kycVerification: "Identity verification in progress",
  waitingForPayment: "Payment pending for incorporation",
  waitingForDocuments: "Required documents not yet received",
  waitingForIncorporation: "Documents submitted, awaiting filing",
  incorporationCompleted: "Company successfully incorporated",
  goodStanding: "Company in good legal standing",
  renewalProcessing: "Annual renewal in progress",
  renewalCompleted: "Annual renewal successfully completed",
  rejected: "Application rejected",
}

const titles: Record<keyof Stats, string> = {
  pending: "Pending Applications",
  kycVerification: "KYC Verification",
  waitingForPayment: "Awaiting Payment",
  waitingForDocuments: "Document Collection",
  waitingForIncorporation: "Pre-Incorporation",
  incorporationCompleted: "Newly Incorporated",
  goodStanding: "Good Standing",
  renewalProcessing: "Renewal In Progress",
  renewalCompleted: "Renewed Companies",
  rejected: "Rejected Applications",
}

interface StatsCardProps {
  stats: Stats
}

const StatsCard: React.FC<StatsCardProps> = ({ stats }) => {
  const [hoveredCard, setHoveredCard] = useState<keyof Stats | null>(null)

  return (
    <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 ">
      {Object.keys(stats).map((statusKey) => {
        const key = statusKey as keyof Stats
        return (
          <Card
            key={statusKey}
            className={cn(
              "transition-all duration-200 overflow-hidden",
              hoveredCard === key ? "shadow-md" : "shadow-sm",
            )}
            onMouseEnter={() => setHoveredCard(key)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3">
              <CardTitle className="text-xs font-medium">{titles[key]}</CardTitle>
              {icons[key]}
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{stats[key]}</div>
              <div
                className={cn(
                  "text-xs text-muted-foreground transition-all duration-200 overflow-hidden",
                  hoveredCard === key ? "max-h-12 opacity-100 mt-1" : "max-h-0 opacity-0",
                )}
              >
                {descriptions[key]}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

const ProjectsCard: React.FC = () => {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderKanban className="h-4 w-4 text-teal-500" />
            <span className="text-sm font-medium">Projects</span>
          </div>
          <span className="text-sm text-muted-foreground">Active: <span className="font-bold">0</span></span>
        </div>
      </Card>
    )
  }
  
  const UsersCard: React.FC = () => {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-violet-500" />
            <span className="text-sm font-medium">Current Corporate Clients</span>
          </div>
          <span className="text-sm text-muted-foreground">Total: <span className="font-bold">0</span></span>
        </div>
      </Card>
    )
  }

  const CurrentClients: React.FC = () => {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-violet-500" />
            <span className="text-sm font-medium">Current Individual Clients</span>
          </div>
          <span className="text-sm text-muted-foreground">Total: <span className="font-bold">0</span></span>
        </div>
      </Card>
    )
  }

  const AdminTodo: React.FC = () => {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListTodo className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">To-do list</span>
          </div>
          <span className="text-sm text-muted-foreground">Total: <span className="font-bold">0</span></span>
        </div>
      </Card>
    )
  }