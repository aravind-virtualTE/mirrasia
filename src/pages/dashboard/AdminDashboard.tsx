import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, Clock, XCircle } from "lucide-react";
import { getIncorporationList } from "@/services/dataFetch";
import { useAtom, useSetAtom } from "jotai";
import { companyIncorporationList } from "@/services/state";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface Stats {
    pending: number;
    active: number;
    rejected: number;
}
const AdminDashboard = () => {
    // Sample data - replace with your actual data    
    const setCompIncList = useSetAtom(companyIncorporationList);
    const [cList,] = useAtom(companyIncorporationList)
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            const result = await getIncorporationList()
            return result
        }
        fetchData().then((result) => {
            setCompIncList(result);
        })

    }, [setCompIncList]);

    const stats: Stats = cList.reduce((acc: Stats, company) => {
        if (company.status === "Pending") (acc as { pending: number }).pending++;
        if (company.status === "Active") (acc as { active: number }).active++;
        if (company.status === "Rejected") (acc as { rejected: number }).rejected++;
        return acc;
    }, { pending: 0, active: 0, rejected: 0 });
    const handleRowClick = (companyId: string) => {
        navigate(`/company-details/${companyId}`);
        localStorage.setItem('companyRecordId', companyId);
      };

    return (
        <div className="p-6 space-y-6 w-full max-w-6xl mx-auto">
            {/* Stats Cards */}
            <StatsCard stats={stats} />;
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
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cList.map((company) => {
                                // Type cast each company
                                const typedCompany = company as {
                                    applicantInfoForm: { companyName: string , name: string };
                                    country: { name: string };
                                    status: string;
                                    incorporationDate: string;
                                    _id: string;
                                };

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
                                        <TableCell>{typedCompany.incorporationDate}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminDashboard;

const icons = {
    pending: <Clock className="h-4 w-4 text-orange-500" />,
    active: <Activity className="h-4 w-4 text-green-500" />,
    rejected: <XCircle className="h-4 w-4 text-red-500" />,
};

const descriptions = {
    pending: "Awaiting completion",
    active: "Successfully incorporated",
    rejected: "Application rejected",
};

const titles = {
    pending: "Pending Incorporations",
    active: "Active Companies",
    rejected: "Rejected Applications",
};

interface StatsCardProps {
    stats: Stats;
}

const StatsCard: React.FC<StatsCardProps> = ({ stats }) => {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            {Object.keys(stats).map((statusKey) => (
                <Card key={statusKey}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {titles[statusKey as keyof Stats]}
                        </CardTitle>
                        {icons[statusKey as keyof Stats]}
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats[statusKey as keyof Stats]}</div>
                        <p className="text-xs text-muted-foreground">
                            {descriptions[statusKey as keyof Stats]}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};