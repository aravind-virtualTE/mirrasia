import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Activity, Clock, XCircle } from "lucide-react";
import {
    Clock,
    XCircle,
    UserCheck,
    CreditCard,
    FileText,
    Building,
    CheckCircle,
    Award,
    RefreshCw,
    CalendarCheck,
    Pencil,
} from "lucide-react"
import { getIncorporationList } from "@/services/dataFetch";
import { useAtom, useSetAtom } from "jotai";
import { allCompListAtom, companyIncorporationList } from "@/services/state";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
// import io from 'socket.io-client';
// import { toast } from "@/hooks/use-toast";

// interface Stats {
//     pending: number;
//     active: number;
//     rejected: number;
// }

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
    // Sample data - replace with your actual data    
    const setCompIncList = useSetAtom(companyIncorporationList);
    // const [cList,] = useAtom(companyIncorporationList)
    const [allList, setAllList] = useAtom(allCompListAtom)
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            const result = await getIncorporationList()
            return result
        }
        fetchData().then((result) => {
            setCompIncList(result.companies);
            setAllList(result.allCompanies)
        })

    }, [setCompIncList]);


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
            // For backward compatibility
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
    // console.log('calculateStats', calculateStats())
    const handleRowClick = (companyId: string, countryCode:string) => {
        navigate(`/company-details/${countryCode}/${companyId}`);
        localStorage.setItem('companyRecordId', companyId);
    };

    const handleEditClick = (companyId: string, countryCode: string) => {
        localStorage.setItem("companyRecordId", companyId);
        navigate(`/company-register/${countryCode}/${companyId}`);
    };
    // console.log("allList", allList)
    function formatDateTime(isoDateString:string) {
        if (!isoDateString) {
          return "";
        }
      
        try {
          const date = new Date(isoDateString);
      
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const year = date.getFullYear();
        //   const hours = date.getHours().toString().padStart(2, '0');
        //   const minutes = date.getMinutes().toString().padStart(2, '0');
        //   const seconds = date.getSeconds().toString().padStart(2, '0');:${hours}:${minutes}:${seconds}

          return `${day}-${month}-${year}`;
        } catch (error) {
          console.error("Error formatting date:", error);
          return ""; // Return empty string in case of an invalid date
        }
      }

    return (
        <div className="p-6 space-y-6 w-full max-w-6xl mx-auto">
            {/* Stats Cards */}
            <StatsCard stats={calculateStats()} />
            {/* Companies Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Companies Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Company Name</TableHead>
                                <TableHead>Applicant Name</TableHead>
                                <TableHead>Country</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>IncorporationDate</TableHead>
                                <TableHead>Edit</TableHead>
                                <TableHead>User latest login</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allList.map((company) => {
                                const typedCompany = company as {
                                    country: { name: string; code: string };
                                    companyName: string[];
                                    applicantName: string;
                                    status: string;
                                    incorporationDate: string | null;
                                    lastLogin: string | null;
                                    _id: string;
                                };

                                let date = typedCompany.incorporationDate;
                                if (date !== null) {
                                    const [year, month, day] = date.split("T")[0].split("-");
                                    date = `${day}-${month}-${year}`;
                                }

                                return (
                                    <TableRow key={typedCompany._id}>
                                        <TableCell
                                            className="font-medium cursor-pointer"
                                            onClick={() => handleRowClick(typedCompany._id,typedCompany.country.code)}
                                        >
                                            {typedCompany.companyName.filter(Boolean).join(", ") || "N/A"}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {typedCompany.applicantName}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {typedCompany.country.name}
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={cn(
                                                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                                    typedCompany.status === "Active"
                                                        ? "bg-green-100 text-green-800"
                                                        : typedCompany.status === "Pending"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-red-100 text-red-800"
                                                )}
                                            >
                                                {typedCompany.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>{date || "N/A"}</TableCell>
                                        <TableCell>
                                            <button
                                                className="text-blue-500 hover:text-blue-700 transition"
                                                onClick={() => handleEditClick(typedCompany._id, typedCompany.country.code)}
                                            >
                                                <Pencil size={18} />
                                            </button>
                                        </TableCell>
                                        <TableCell>{typedCompany.lastLogin ? formatDateTime(typedCompany.lastLogin) : "N/A"}</TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>

                        {/* <TableBody>
                            {cList.map((company) => {
                                // Type cast each company
                                const typedCompany = company as {
                                    applicantInfoForm: { companyName: string, name: string };
                                    country: { name: string; code: string };
                                    applicantName: string;
                                    status: string;
                                    incorporationDate: string | null;
                                    _id: string;
                                };
                                let date = typedCompany.incorporationDate
                                if (date !== null) {
                                    const [year, month, day] = date.split("T")[0].split("-");
                                    date = `${day}-${month}-${year}`
                                }

                                return (
                                    <TableRow key={typedCompany._id} >
                                        <TableCell className="font-medium cursor-pointer" onClick={() => handleRowClick(typedCompany._id)}>
                                            {typedCompany.applicantInfoForm.companyName}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {typedCompany.applicantInfoForm.name}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {typedCompany.country.name}
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={cn(
                                                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                                    typedCompany.status === 'Active' ? 'bg-green-100 text-green-800' :
                                                        typedCompany.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                )}
                                            >
                                                {typedCompany.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>{date}</TableCell>
                                        <TableCell>
                                            <button
                                                className="text-blue-500 hover:text-blue-700 transition"
                                                onClick={() => handleEditClick(typedCompany._id, typedCompany.country.code)}
                                            >
                                                <Pencil size={18} />
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody> */}
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminDashboard;

// const icons = {
//     pending: <Clock className="h-4 w-4 text-orange-500" />,
//     active: <Activity className="h-4 w-4 text-green-500" />,
//     rejected: <XCircle className="h-4 w-4 text-red-500" />,
// };

const icons: Record<keyof Stats, JSX.Element> = {
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


// const descriptions = {
//     pending: "Awaiting completion",
//     active: "Successfully incorporated",
//     rejected: "Application rejected",
// };

// const titles = {
//     pending: "Pending Incorporations",
//     active: "Active Companies",
//     rejected: "Rejected Applications",
// };

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

// const StatsCard: React.FC<StatsCardProps> = ({ stats }) => {
//     return (
//         <div className="grid gap-4 md:grid-cols-3">
//             {Object.keys(stats).map((statusKey) => (
//                 <Card key={statusKey}>
//                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                         <CardTitle className="text-sm font-medium">
//                             {titles[statusKey as keyof Stats]}
//                         </CardTitle>
//                         {icons[statusKey as keyof Stats]}
//                     </CardHeader>
//                     <CardContent>
//                         <div className="text-2xl font-bold">{stats[statusKey as keyof Stats]}</div>
//                         <p className="text-xs text-muted-foreground">
//                             {descriptions[statusKey as keyof Stats]}
//                         </p>
//                     </CardContent>
//                 </Card>
//             ))}
//         </div>
//     );
// };

const StatsCard: React.FC<StatsCardProps> = ({ stats }) => {
    return (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5">
            {Object.keys(stats).map((statusKey) => {
                const key = statusKey as keyof Stats
                return (
                    <Card key={statusKey}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{titles[key]}</CardTitle>
                            {icons[key]}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats[key]}</div>
                            <p className="text-xs text-muted-foreground">{descriptions[key]}</p>
                        </CardContent>
                    </Card>
                )

            })}
        </div>
    )
}