import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, Clock, XCircle } from "lucide-react";
import { getIncorporationList } from "@/services/dataFetch";
import { useAtom, useSetAtom } from "jotai";
import { companyIncorporationList } from "@/services/state";
import { cn } from "@/lib/utils";
const AdminDashboard = () => {
    // Sample data - replace with your actual data
    const stats = {
        pending: 0,
        active: 0,
        rejected: 0
    };
    // const companies = [
    //     { name: "Tech Solutions Ltd", country: "Hong Kong", status: "Active" },
    //     { name: "Global Innovations Inc", country: "Singapore", status: "Pending" },
    //     { name: "Digital Systems Corp", country: "United Kingdom", status: "Active" },
    //     { name: "Future Tech SA", country: "United States", status: "Pending" },
    //     { name: "Smart Solutions GmbH", country: "Thailand", status: "Active" },
    // ];
    const setCompIncList = useSetAtom(companyIncorporationList);
    const [cList,] = useAtom(companyIncorporationList)
    useEffect(() => {
        async function fetchData() {
            const result = await getIncorporationList()
            return result
        }
        fetchData().then((result) => {
            setCompIncList(result);
        })

    }, [cList, setCompIncList]);

    cList.forEach((company) => {
        if (company.status === "Pending") {
            stats.pending++;
        } else if (company.status === "Active") {
            stats.active++;
        }
        else stats.rejected++
    });

    console.log('cList', cList)

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
                                <TableHead>Country</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cList.map((company, index) => {
                                // Type cast each company
                                const typedCompany = company as {
                                    applicantInfoForm: { companyName: string };
                                    status: string;
                                    incorporationDate: string;
                                };

                                return (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">
                                            {typedCompany.applicantInfoForm.companyName}
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


interface Stats {
    pending: number;
    active: number;
    rejected: number;
    // Add more statuses here if needed
  }
  
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