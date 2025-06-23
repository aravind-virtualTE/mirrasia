/* eslint-disable @typescript-eslint/no-explicit-any */
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import React, { useEffect, useState } from 'react'
import MemoApp from './MemosHK';
import AdminProject from '@/pages/dashboard/Admin/Projects/AdminProject';
import { useAtom } from 'jotai';
import { cccCompanyData, Company } from '@/pages/CurrentClient/cccState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TodoApp from '@/pages/Todo/TodoApp';
import ChecklistHistory from '@/pages/Checklist/ChecklistHistory';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from '@/components/userList/UsersList';
import { fetchUsers } from '@/services/dataFetch';
import { useNavigate } from 'react-router-dom';
import { Check, Edit2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { updateCurrentClient } from "@/services/dataFetch"
import { toast } from '@/hooks/use-toast';


const OldCCCDetail: React.FC<{ id: string }> = ({ id }) => {
    const [customers,] = useAtom(cccCompanyData)
    const [users, setUsers] = useState<User[]>([]);
    const [adminAssigned, setAdminAssigned] = useState('');
    const navigate = useNavigate();
    const [editingField, setEditingField] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [comp, SetCompany] = useState<Company | undefined>(customers.find((c) => c._id === id))
    const [editingCell, setEditingCell] = useState<{
        type: "directors" | "shareholders" | "designatedContact";
        idx: number;
        key: string;
    } | null>(null);

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

    const setNestedValue = (e: any, field: keyof Company | string, index?: number, subField?: any): any => {
        // console.log("field======>", field, "index===>", index, 'subField====>', subField, "eee====>", e)
        if (field === "directors" || field === "shareholders" || field === "designatedContact") {
            SetCompany((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    [field]: Array.isArray(prev[field])
                        ? prev[field].map((item: any, i: number) =>
                            i === index ? { ...item, [subField]: e } : item
                        )
                        : prev[field],
                };
            });
        } else {
            SetCompany((prev) => {
                if (!prev) return prev;
                return { ...prev, [field]: e };
            });
        }
    };

    const handleSaveField = (field: any, idx?: any, key?: any) => {
        // console.log("field===>", field, 'editValue====>', editValue)
        setNestedValue(editValue, field, idx, key);
        setEditingField(null);
        setEditingCell(null)
    };

    const handleCancelEdit = () => {
        setEditingField(null);
        setEditingCell(null);
        setEditValue('');
    };

    const handleEdit = (field: any, currentValue: any) => {
        setEditingField(field);
        setEditValue(currentValue || '');
    };


    const renderEditableCell = (field: any, value: any) => {
        if (editingField === field) {
            return (
                <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full"
                    autoFocus
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveField(field);
                        if (e.key === 'Escape') handleCancelEdit();
                    }}
                />
            );
        }

        return <span>{value || "N/A"}</span>;
    };

    const renderActionButtons = (field: any, value: any) => {
        if (editingField === field) {
            return (
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSaveField(field)}
                        className="h-8 w-8 p-0 text-green-600 hover:text-green-800 hover:bg-green-50"
                    >
                        <Check className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelEdit}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            );
        }

        return (
            <Button
                size="sm"
                variant="ghost"
                onClick={() => handleEdit(field, value)}
                className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600"
            >
                <Edit2 className="h-4 w-4" />
            </Button>
        );
    };

    const handleEdit1 = (
        type: "directors" | "shareholders" | 'designatedContact',
        idx: number,
        key: string,
        currentValue: any
    ) => {
        setEditingCell({ type, idx, key });
        setEditValue(currentValue || "");
    };

    const renderEditableCell1 = (type: "directors" | "shareholders" | "designatedContact", value: any, idx: number, key: string
    ) => {
        const isEditing =
            editingCell?.type === type &&
            editingCell?.idx === idx &&
            editingCell?.key === key;

        if (isEditing) {
            return (
                <div className="flex items-center gap-2" key={`${type}-${idx}-${key}`}>
                    <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1"
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveField(type, idx, key);
                            if (e.key === "Escape") handleCancelEdit();
                        }}
                    />
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSaveField(type, idx, key)}
                        className="h-8 w-8 p-0 text-green-600 hover:text-green-800 hover:bg-green-50"
                    >
                        <Check className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelEdit}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            );
        }

        return (
            <div
                className="flex items-center justify-between group"
                key={`${type}-${idx}-${key}`}
            >
                <span className="flex-1">{value || "N/A"}</span>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit1(type, idx, key, value)}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600"
                >
                    <Edit2 className="h-4 w-4" />
                </Button>
            </div>
        );
    };
    // console.log("company=======", comp)

    const  handleUpdate  = async () =>{
        const updated = await updateCurrentClient(comp);
        // console.log("updated=====>", updated)
        if (updated) {
            SetCompany(updated);
            toast({
                title: "Company details updated successfully!",
                description: "The company information has been updated.",
            })
        } else {
            toast({
                title: "Failed to update company details",
                description: "There was an error updating the company information.",
            })
        }
    }
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
                        <TodoApp id={id} name={comp?.companyNameEng || ""} />
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
                                        <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    <tr>
                                        <td className="py-3 px-4 font-medium">Company Name</td>
                                        {/* <td className="py-3 px-4">{comp?.companyNameEng}</td> */}
                                        <td className="py-3 px-4">
                                            {renderEditableCell('companyNameEng', comp?.companyNameEng)}
                                        </td>
                                        <td className="py-3 px-4">
                                            {renderActionButtons('companyNameEng', comp?.companyNameEng)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-4 font-medium">Company Name (Chinese)</td>
                                        <td className="py-3 px-4">
                                            {renderEditableCell('companyNameChi', comp?.companyNameChi)}
                                        </td>
                                        <td className="py-3 px-4">
                                            {renderActionButtons('companyNameChi', comp?.companyNameChi)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-4 font-medium">Company Type</td>
                                        <td className="py-3 px-4">
                                            {renderEditableCell('companyType', comp?.companyType)}
                                        </td>
                                        <td className="py-3 px-4">
                                            {renderActionButtons('companyType', comp?.companyType)}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="py-3 px-4 font-medium">BRN Number</td>
                                        <td className="py-3 px-4">
                                            {renderEditableCell('brnNo', comp?.brnNo)}
                                        </td>
                                        <td className="py-3 px-4">
                                            {renderActionButtons('brnNo', comp?.brnNo)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-4 font-medium">Incorporation Date</td>
                                        <td className="py-3 px-4">
                                            {renderEditableCell('incorporationDate', comp?.incorporationDate)}
                                        </td>
                                        <td className="py-3 px-4">
                                            {renderActionButtons('incorporationDate', comp?.incorporationDate)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-4 font-medium">Bank</td>
                                        <td className="py-3 px-4">
                                            {renderEditableCell('bank', comp?.bank)}
                                        </td>
                                        <td className="py-3 px-4">
                                            {renderActionButtons('bank', comp?.bank)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-4 font-medium">Total No Of Shares</td>
                                        <td className="py-3 px-4">
                                            {renderEditableCell('noOfShares', comp?.noOfShares)}
                                        </td>
                                        <td className="py-3 px-4">
                                            {renderActionButtons('noOfShares', comp?.noOfShares)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-4 font-medium">Share Capital</td>
                                        <td className="py-3 px-4">
                                            {renderEditableCell('shareCapital', comp?.shareCapital)}
                                        </td>
                                        <td className="py-3 px-4">
                                            {renderActionButtons('shareCapital', comp?.shareCapital)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-4 font-medium">Status</td>
                                        <td className="py-3 px-4">
                                            {renderEditableCell('status', comp?.status)}
                                        </td>
                                        <td className="py-3 px-4">
                                            {renderActionButtons('status', comp?.status)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
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
                                        <th className="text-left py-3 px-4 font-medium text-gray-600">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    <tr>
                                        <td className="py-3 px-4 font-medium">Country</td>
                                        <td className="py-3 px-4">
                                            {renderEditableCell('jurisdiction', comp?.jurisdiction)}
                                        </td>
                                        <td className="py-3 px-4">
                                            {renderActionButtons('jurisdiction', comp?.jurisdiction)}
                                        </td>
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
                                        <td className="py-3 px-4 font-medium">{renderEditableCell1('designatedContact', comp?.designatedContact[0].name, 0, 'name')}</td>
                                        {/* `directors`, director.name, idx, 'name' */}
                                        <td className="py-3 px-4">{renderEditableCell1('designatedContact', comp?.designatedContact[0].email, 0, 'email')}</td>
                                        <td className="py-3 px-4">{renderEditableCell1('designatedContact', comp?.designatedContact[0].phone, 0, 'phone')}</td>
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
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {comp?.directors.map((director, idx) => (
                                        <tr key={`${idx}-director-${idx}`}>
                                            <td className="py-3 px-4">{renderEditableCell1(`directors`, director.name, idx, 'name')}</td>
                                            <td className="py-3 px-4">{renderEditableCell1(`directors`, director.email, idx, "email")}</td>
                                            <td className="py-3 px-4">{renderEditableCell1(`directors`, director.phone, idx, 'phone')}</td>
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
                                    {comp?.shareholders.map((shareholder, idx) => (
                                        <tr key={`${idx}-shareholder-${idx}`}>
                                            <td className="py-3 px-4">{renderEditableCell1(`shareholders`, shareholder.name, idx, 'name')}</td>
                                            <td className="py-3 px-4">{renderEditableCell1(`shareholders`, shareholder.email, idx, 'email')}</td>
                                            <td className="py-3 px-4">{renderEditableCell1(`shareholders`, shareholder.totalShares, idx, 'totalShares')}</td>
                                            <td className="py-3 px-4">
                                                {comp?.noOfShares
                                                    ? ((shareholder.totalShares / comp?.noOfShares) * 100).toFixed(2)
                                                    : "N/A"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="flex items-center gap-4 p-4 bg-muted/50 border-t">
                                <span className="text-sm font-medium">
                                    Click here to Save the Data
                                </span>
                                <Button
                                    onClick={handleUpdate}
                                    className="px-4 py-2 text-sm"
                                >
                                    Save
                                </Button>
                            </div>
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