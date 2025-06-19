import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import React, { useEffect, useState } from 'react'
import MemoApp from './MemosHK';
import AdminProject from '@/pages/dashboard/Admin/Projects/AdminProject';
import { useAtom } from 'jotai';
import { cccCompanyData } from '@/pages/CurrentClient/cccState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TodoApp from '@/pages/Todo/TodoApp';
import ChecklistHistory from '@/pages/Checklist/ChecklistHistory';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from '@/components/userList/UsersList';
import { fetchUsers } from '@/services/dataFetch';
import { useNavigate } from 'react-router-dom';

const OldCCCDetail: React.FC<{ id: string }> = ({ id }) => {
    const [customers,] = useAtom(cccCompanyData)
    const [users, setUsers] = useState<User[]>([]);
    const [adminAssigned, setAdminAssigned] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        async function getUsData() {
          setAdminAssigned('');    
          const response = await fetchUsers();
          const filteredUsers = response.filter((e: { role: string }) => e.role === 'admin' || e.role === 'master');
          setUsers(filteredUsers);
        }    
        getUsData()
      }, []);

    const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null;

    const company = customers.find((c) => c._id === id);
    // console.log(id, "id", company)
    // console.log("customers====>", customers)
    // console.log("company====>", company)
    const activeDirectors = company?.directors?.filter((director) => director.name.trim() !== "") || [];
    const activeShareholders = company?.shareholders?.filter((shareholder) => shareholder.name.trim() !== "") || [];
    // console.log("activeDirectors", activeDirectors)
    // console.log("activeShareholders", activeShareholders)
    const AssignAdmin = () => {
        const handleAssign = (value: string) => {
            setAdminAssigned(value);
        };
        return (
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Assign Admin:</span>
                <Select
                    onValueChange={handleAssign}
                    value={adminAssigned}
                >
                    <SelectTrigger className="w-60 h-8 text-xs">
                        <SelectValue placeholder="Assign Admin to..." />
                    </SelectTrigger>
                    <SelectContent>
                        {users.map((u) => (
                            <SelectItem key={u._id} value={u.fullName || ''}>
                                {u.fullName || u.email}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        );
    };
    return (
        <Tabs defaultValue="details" className="flex flex-col w-full mx-auto">
            <TabsList className="flex w-full p-1 bg-background/80 rounded-t-lg border-b">
                <TabsTrigger
                    value="details"
                    className="flex-1 py-3 text-md font-medium transition-all rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                    Company Details
                </TabsTrigger>
                <TabsTrigger
                    value="service-agreement"
                    className="flex-1 py-3 text-md font-medium transition-all rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                    Record of Documents
                </TabsTrigger>
                {user.role !== 'user' && (
                    <TabsTrigger
                        value="Memos"
                        className="flex-1 py-3 text-md font-medium transition-all rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                    >
                        Memo
                    </TabsTrigger>
                )}
                {user.role !== 'user' && (
                    <TabsTrigger
                        value="Projects"
                        className="flex-1 py-3 text-md font-medium transition-all rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                    >
                        Project
                    </TabsTrigger>
                )}
                <TabsTrigger
                    value="Checklist"
                    className="flex-1 py-3 text-md font-medium transition-all rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                    Checklist
                </TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Company Details</h2>

                {user.role !== 'user' && (
                    <div className="mb-4">
                        <TodoApp id={id} name={company?.companyNameEng || ""} />
                    </div>
                )}
               <div className="flex gap-4 mt-auto">
                     {user.role !== 'user' && <AssignAdmin />}
                     <Button
                        onClick={() => navigate(`/company-documents/ccp/${id}`)}
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        Company Docs
                    </Button> 
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">Company Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-gray-50">
                                        <th className="text-left py-3 px-4 font-medium text-gray-600">Field</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-600">Value</th>
                                        {/* <th className="text-left py-3 px-4 font-medium text-gray-600">Action</th> */}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    <tr>
                                        <td className="py-3 px-4 font-medium">Company Name</td>
                                        <td className="py-3 px-4">{company?.companyNameEng}</td>
                                        <td className="py-3 px-4">
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-4 font-medium">Company Name (Chinese)</td>
                                        <td className="py-3 px-4">{company?.companyNameChi || "N/A"}</td>
                                        <td className="py-3 px-4">

                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-4 font-medium">Company Type</td>
                                        <td className="py-3 px-4">{company?.companyType}</td>
                                        <td className="py-3 px-4"></td>
                                    </tr>                                    
                                   
                                    <tr>
                                        <td className="py-3 px-4 font-medium">BRN Number</td>
                                        <td className="py-3 px-4">{company?.brnNo}</td>
                                        <td className="py-3 px-4"></td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-4 font-medium">Incorporation Date</td>
                                        <td className="py-3 px-4">{company?.incorporationDate}</td>
                                        <td className="py-3 px-4"></td>
                                    </tr>
                                     <tr>
                                        <td className="py-3 px-4 font-medium">Bank</td>
                                        <td className="py-3 px-4">{company?.bank}</td>
                                        <td className="py-3 px-4"></td>
                                    </tr>
                                     <tr>
                                        <td className="py-3 px-4 font-medium">No Of Shares</td>
                                        <td className="py-3 px-4">{company?.noOfShares}</td>
                                        <td className="py-3 px-4"></td>
                                    </tr>
                                     <tr>
                                        <td className="py-3 px-4 font-medium">Share Capital</td>
                                        <td className="py-3 px-4">{company?.shareCapital}</td>
                                        <td className="py-3 px-4"></td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-4 font-medium">Status</td>
                                        <td className="py-3 px-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {company?.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
                {/* dcp */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">Designated Contact person</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-gray-50">
                                        <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-600">Phone</th>
                                    </tr>
                                </thead>
                                 <tbody className="divide-y divide-gray-200">
                                   <tr>
                                            <td className="py-3 px-4 font-medium">{company?.designatedContact.name}</td>
                                            <td className="py-3 px-4">{company?.designatedContact.email}</td>
                                            <td className="py-3 px-4">{company?.designatedContact.phone}</td>
                                            <td className="py-3 px-4">

                                            </td>
                                        </tr>
                                </tbody>
                                
                            </table>
                        </div>
                    </CardContent>
                </Card>
                {/* Jurisdiction Information Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">Jurisdiction Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-gray-50">
                                        <th className="text-left py-3 px-4 font-medium text-gray-600">Field</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-600">Value</th>
                                        {/* <th className="text-left py-3 px-4 font-medium text-gray-600">Action</th> */}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    <tr>
                                        <td className="py-3 px-4 font-medium">Country</td>
                                        <td className="py-3 px-4">{company?.jurisdiction}</td>
                                        <td className="py-3 px-4"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
                {/* Directors Information Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">Directors Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-gray-50">
                                        <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-600">Phone</th>
                                        {/* <th className="text-left py-3 px-4 font-medium text-gray-600">Action</th> */}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {activeDirectors.map((director, idx) => (
                                        <tr key={`${idx}-director-${idx}`}>
                                            <td className="py-3 px-4 font-medium">{director.name}</td>
                                            <td className="py-3 px-4">{director.email}</td>
                                            <td className="py-3 px-4">{director.phone}</td>
                                            <td className="py-3 px-4">

                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Shareholders Information Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">Shareholders Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-gray-50">
                                        <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-600">Total no of Shares</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-600">Percentage(%)</th>
                                        {/* <th className="text-left py-3 px-4 font-medium text-gray-600">Action</th> */}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {activeShareholders.map((shareholder, idx) => (
                                        <tr key={`${idx}-shareholder-${idx}`}>
                                            <td className="py-3 px-4 font-medium">{shareholder.name}</td>
                                            <td className="py-3 px-4">{shareholder.email}</td>
                                            <td className="py-3 px-4">{shareholder.totalShares}</td>
                                            <td className="py-3 px-4">
                                                {company?.noOfShares
                                                    ? ((shareholder.totalShares / company.noOfShares) * 100).toFixed(2)
                                                    : "N/A"}
                                            </td>
                                            <td className="py-3 px-4">

                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="service-agreement" className="p-6">
                <div className="space-y-6">
                    <h1 className="text-2xl font-bold">Service Agreement Details</h1>
                </div>
            </TabsContent>
            <TabsContent value="Memos" className="p-6">
                <div className="space-y-6">
                    <MemoApp id={id} />
                </div>
            </TabsContent>
            <TabsContent value="Projects" className="p-6">
                <div className="space-y-6">
                    <AdminProject id={id} />
                </div>
            </TabsContent>
            <TabsContent value="Checklist" className="p-6">
                <ChecklistHistory id={id} items={[[], []]} />
            </TabsContent>
        </Tabs>
    )
}

export default OldCCCDetail