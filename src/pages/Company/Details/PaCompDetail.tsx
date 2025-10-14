// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { fetchUsers, getPaIncorpoDataById, updateEditValues } from '@/services/dataFetch';
// import { useAtom } from 'jotai';
// import React, { useEffect, useMemo, useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import {
//     Table,
//     TableBody,
//     TableCell,
//     TableHead,
//     TableHeader,
//     TableRow,
// } from '@/components/ui/table';
// import { Button } from '@/components/ui/button';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { SessionData } from './HkCompdetail';
// import { paymentApi } from '@/lib/api/payment';
// import { Label } from '@/components/ui/label';
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { Input } from '@/components/ui/input';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Switch } from '@/components/ui/switch';
// import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
// import { useToast } from '@/hooks/use-toast';
// import MemoApp from './MemosHK';
// import TodoApp from '@/pages/Todo/TodoApp';
// import { User } from '@/components/userList/UsersList';
// import { useNavigate } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
// import AdminProject from "@/pages/dashboard/Admin/Projects/AdminProject";
// import ChecklistHistory from '@/pages/Checklist/ChecklistHistory';
// import { paFormWithResetAtom, PaFormData } from '../Panama/PaState';


// const PaCompdetail: React.FC<{ id: string }> = ({ id }) => {
//     const { t } = useTranslation()
//     const [formData, setFormData] = useAtom(paFormWithResetAtom);
//     const [isSheetOpen, setIsSheetOpen] = useState(false);
//     const { toast } = useToast();
//     const [users, setUsers] = useState<User[]>([]);
//     const [adminAssigned, setAdminAssigned] = useState('');
//     const [session, setSession] = useState<SessionData>({
//         _id: '',
//         amount: 0,
//         currency: '',
//         expiresAt: '',
//         status: '',
//         paymentId: '',
//     });
//     const navigate = useNavigate();
//     const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null;

//     useEffect(() => {
//         async function getUsData() {
//             const data = await getPaIncorpoDataById(`${id}`);
//             setAdminAssigned(data.assignedTo);

//             if (data.sessionId !== '') {
//                 const session = await paymentApi.getSession(data.sessionId);
//                 const transformedSession: SessionData = {
//                     _id: session._id,
//                     amount: session.amount,
//                     currency: session.currency,
//                     expiresAt: session.expiresAt,
//                     status: session.status,
//                     paymentId: session.paymentId,
//                 };
//                 setSession(transformedSession);
//             }

//             const response = await fetchUsers();
//             const filteredUsers = response.filter((e: { role: string }) => e.role === 'admin' || e.role === 'master');
//             setUsers(filteredUsers);

//             return data;
//         }

//         getUsData().then((result) => {
//             setFormData(result);
//         });
//     }, []);

//     // Helper function to render object values
//     const renderValue = (data: any): string => {
//         if (typeof data === 'object' && data !== null) {
//             return data.value || data.id || 'N/A';
//         }
//         return data || 'N/A';
//     };

//     const generateSections = (formData: PaFormData, session: SessionData) => {
//         const sections = [];
//         // console.log("formData", formData);
//         // Applicant Information Section
//         sections.push({
//             title: 'Applicant Information',
//             data: {
//                 'Company Name': (
//                     <div className="space-y-4">
//                         <div className="grid gap-2">
//                             {formData.companyName.slice(0, 3).map((name, index) => (
//                                 <div key={index} className="flex items-center gap-2">
//                                     <div className="flex-1 p-2 border rounded-md bg-background">{name || "N/A"}</div>
//                                     {index > 0 && (
//                                         <Button
//                                             variant="outline"
//                                             size="sm"
//                                             onClick={() => {
//                                                 const newNames = [...formData.companyName]
//                                                 // Move this item to the first position
//                                                 const [removed] = newNames.splice(index, 1)
//                                                 newNames.unshift(removed)

//                                                 // Update the company state
//                                                 setFormData({
//                                                     ...formData,
//                                                     companyName: newNames,
//                                                 })
//                                             }}
//                                         >
//                                             Move to Top
//                                         </Button>
//                                     )}
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 ),
//                 'Applicant Name': formData.name,
//                 Email: formData.email,
//                 Phone: formData.phoneNum,
//                 // Relationships: formData.establishedRelationshipType?.join(', ') || 'N/A',
//                 'SNS Account ID': renderValue(formData.snsAccountId.id),
//                 'SNS Account Number': renderValue(formData.snsAccountId.value),
//             },
//         });

//         // Country Information Section
//         sections.push({
//             title: 'Jurisdiction Information',
//             data: {
//                 Country: 'Panama',
//                 'Country Code': 'PA',
//                 // 'Entity Type': formData.selectedEntity,
//             },
//         });

//         // Business Information Section
//         // sections.push({
//         //   title: 'AML/CDD Information',
//         //   data: {
//         //     'Sanctioned Countries': t(renderValue(formData.restrictedCountriesWithActivity)),
//         //     'Sanctions Presence': t(renderValue(formData.sanctionedTiesPresent)),
//         //     'Crimea Presence': t(renderValue(formData.businessInCrimea)),
//         //     'Russian Business Presence': t(renderValue(formData.involvedInRussianEnergyDefense)),
//         //     'Legal Assessment': t(renderValue(formData.hasLegalEthicalIssues)),
//         //     'Annual Renewal Terms': t(renderValue(formData.annualRenewalTermsAgreement)),
//         //   },
//         // })

//         // Shareholder and Director Information Section
//         if (formData.shareHolders) {
//             const shareholderData = formData.shareHolders;
//             // console.log("shareholderDat", shareholderData)
//             sections.push({
//                 title: 'Shareholder and Director Information',
//                 data: {
//                     //   'Designated Contact Person': formData.designatedContact,
//                     'Shareholders and Directors': (
//                         <Table>
//                             <TableHeader>
//                                 <TableRow>
//                                     <TableHead>Name</TableHead>
//                                     <TableHead>Email</TableHead>
//                                     <TableHead>Phone</TableHead>
//                                     <TableHead>Ownership Rate</TableHead>
//                                     <TableHead>Is Director</TableHead>
//                                     <TableHead>Is Legal Person</TableHead>
//                                 </TableRow>
//                             </TableHeader>
//                             <TableBody>
//                                 {Array.isArray(shareholderData) &&
//                                     shareholderData.map((shareholder, index) => (
//                                         <TableRow key={index}>
//                                             <TableCell>{shareholder.name}</TableCell>
//                                             <TableCell>{shareholder.email}</TableCell>
//                                             <TableCell>{shareholder.phone || 'N/A'}</TableCell>
//                                             <TableCell>{shareholder.ownershipRate}%</TableCell>
//                                             {/* <TableCell>{t(renderValue(shareholder.isDirector))}</TableCell> */}
//                                             <TableCell>{t(renderValue(shareholder.isLegalPerson))}</TableCell>
//                                         </TableRow>
//                                     ))}
//                             </TableBody>
//                         </Table>
//                     ),
//                 },
//             });
//         }

//         // Payment Information Section
//         if (formData.sessionId && session) {
//             sections.push({
//                 title: 'Payment Information',
//                 data: {
//                     Amount: session.amount,
//                     'Payment Status': session.status,
//                     'Payment Expire Date': new Date(session.expiresAt).toLocaleString(),
//                     Receipt: formData.receiptUrl ? 'Available' : 'Not available',
//                 },
//             });
//         }

//         // Status Information Section
//         sections.push({
//             title: 'Status Information',
//             data: {
//                 'Incorporation Status': formData.status,
//                 'Incorporation Date': formData.incorporationDate || 'N/A',
//                 'AML/CDD Edit': formData.isDisabled ? 'No' : 'Yes',
//             },
//         });
//         return sections;
//     };

//     const sections = useMemo(() => {
//         if (!formData) return [];
//         return generateSections(formData, session);
//     }, [formData, session]);

//     const handleUpdate = async () => {
//         const payload = JSON.stringify({
//             company: {
//                 id: formData._id,
//                 status: formData.status,
//                 isDisabled: formData.isDisabled,
//                 incorporationDate: formData.incorporationDate,
//                 country: 'PA',
//                 companyName: formData.companyName
//             },
//             session: {
//                 id: session._id,
//                 expiresAt: session.expiresAt,
//                 status: session.status,
//             },
//             assignedTo: adminAssigned,
//         });

//         const response = await updateEditValues(payload);
//         if (response.success) {
//             toast({ description: 'Record updated successfully' });
//         }
//     };

//     const handleCompanyDataChange = (key: keyof PaFormData, value: string | boolean) => {
//         setFormData({ ...formData, [key]: value });
//     };

//     const handleSessionDataChange = (key: keyof SessionData, value: string) => {
//         setSession({ ...session, [key]: value });
//     };

//     const IncorporationDateFrag = () => {
//         let date = formData.incorporationDate;
//         if (date !== null && date !== undefined && date !== '') {
//             const [year, month, day] = date.split('T')[0].split('-');
//             date = `${day}-${month}-${year}`;
//         } else {
//             date = 'Not set'
//         }
//         return (
//             <React.Fragment>
//                 <TableCell className="font-medium">Incorporation Date</TableCell>
//                 <TableCell>{date}</TableCell>
//                 {user.role !== 'user' && <TableCell>
//                     <Dialog>
//                         <DialogTrigger asChild>
//                             <Button variant="outline">Edit</Button>
//                         </DialogTrigger>
//                         <DialogContent>
//                             <DialogHeader>
//                                 <DialogTitle>Edit Incorporation Date</DialogTitle>
//                                 <DialogDescription>
//                                     Set the incorporation date for the company. This is the date when the company was officially registered.
//                                 </DialogDescription>
//                             </DialogHeader>
//                             <div className="grid gap-4 py-4">
//                                 <div className="grid grid-cols-4 items-center gap-4">
//                                     <Label htmlFor="incorporationDate" className="text-right">
//                                         Date
//                                     </Label>
//                                     <Input
//                                         id="incorporationDate"
//                                         type="date"
//                                         value={formData.incorporationDate || ''}
//                                         onChange={(e) =>
//                                             handleCompanyDataChange('incorporationDate', e.target.value)
//                                         }
//                                         className="col-span-3"
//                                     />
//                                 </div>
//                             </div>
//                         </DialogContent>
//                     </Dialog>
//                 </TableCell>}
//             </React.Fragment>
//         );
//     };

//     const CompanyIncorpoStatus = () => {
//         const statusOptions = [
//             'Pending',
//             'KYC Verification',
//             'Waiting for Payment',
//             'Waiting for Documents',
//             'Waiting for Incorporation',
//             'Incorporation Completed',
//             'Good Standing',
//             'Renewal Processing',
//             'Renewal Completed',
//         ];
//         return (
//             <React.Fragment>
//                 <TableCell className="font-medium">Incorporation Status</TableCell>
//                 <TableCell>{formData.status}</TableCell>
//                 {user.role !== 'user' && <TableCell>
//                     <Select
//                         value={formData.status}
//                         onValueChange={(value) => handleCompanyDataChange('status', value)}
//                     >
//                         <SelectTrigger className="w-[180px]">
//                             <SelectValue placeholder="Select status" />
//                         </SelectTrigger>
//                         <SelectContent>
//                             {statusOptions.map((status) => (
//                                 <SelectItem key={status} value={status}>
//                                     {status}
//                                 </SelectItem>
//                             ))}
//                         </SelectContent>
//                     </Select>
//                 </TableCell>}
//             </React.Fragment>
//         );
//     };

//     const AMLCDDEdit = () => (
//         <React.Fragment>
//             <TableCell className="font-medium">AML/CDD Edit</TableCell>
//             <TableCell>{formData.isDisabled ? 'No' : 'Yes'}</TableCell>
//             <TableCell>
//                 <Switch
//                     checked={!formData.isDisabled}
//                     onCheckedChange={(checked) => handleCompanyDataChange('isDisabled', !checked)}
//                 />
//             </TableCell>
//         </React.Fragment>
//     );

//     const PaymentStatus = () => {
//         return (
//             <React.Fragment>
//                 <TableCell className="font-medium">Payment Status</TableCell>
//                 <TableCell>{session.status}</TableCell>
//                 {user.role !== 'user' && <TableCell>
//                     <Select
//                         value={session.status}
//                         onValueChange={(value) => handleSessionDataChange('status', value)}
//                     >
//                         <SelectTrigger className="w-[180px]">
//                             <SelectValue placeholder="Select status" />
//                         </SelectTrigger>
//                         <SelectContent>
//                             <SelectItem value="pending">Pending</SelectItem>
//                             <SelectItem value="completed">Completed</SelectItem>
//                             <SelectItem value="expired">Expired</SelectItem>
//                         </SelectContent>
//                     </Select>
//                 </TableCell>}
//             </React.Fragment>
//         );
//     };

//     const ExtendPaymentTimer = () => {
//         return (
//             <React.Fragment>
//                 <TableCell className="font-medium">Payment Expire Date</TableCell>
//                 <TableCell>{new Date(session.expiresAt).toLocaleString() || 'Not set'}</TableCell>
//                 <TableCell>
//                     <Dialog>
//                         <DialogTrigger asChild>
//                             <Button variant="outline">Edit</Button>
//                         </DialogTrigger>
//                         <DialogContent>
//                             <DialogHeader>
//                                 <DialogTitle>Edit Payment Expire Date</DialogTitle>
//                                 <DialogDescription>
//                                     Extend the Payment Expire for the company Payment.
//                                 </DialogDescription>
//                             </DialogHeader>
//                             <div className="grid gap-4 py-4">
//                                 <div className="grid grid-cols-4 items-center gap-4">
//                                     <Label htmlFor="expiresAt" className="text-right">
//                                         Date
//                                     </Label>
//                                     <Input
//                                         id="expiresAt"
//                                         type="date"
//                                         value={session.expiresAt || ''}
//                                         onChange={(e) => handleSessionDataChange('expiresAt', e.target.value)}
//                                         className="col-span-3"
//                                     />
//                                 </div>
//                             </div>
//                         </DialogContent>
//                     </Dialog>
//                 </TableCell>
//             </React.Fragment>
//         );
//     };

//     const ReceietPaymentFrag = () => {
//         return (
//             <React.Fragment>
//                 <TableCell className="font-medium">Receipt</TableCell>
//                 <TableCell>{formData.receiptUrl ? 'Available' : 'Not available'}</TableCell>
//                 <TableCell>
//                     {formData.receiptUrl && (
//                         <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
//                             <SheetTrigger asChild>
//                                 <Button variant="outline">View Receipt</Button>
//                             </SheetTrigger>
//                             <SheetContent
//                                 side="right"
//                                 className="w-full max-w-[40vw]"
//                                 style={{ width: '40vw', maxWidth: '40vw' }}
//                             >
//                                 <SheetHeader>
//                                     <SheetTitle>Receipt</SheetTitle>
//                                 </SheetHeader>
//                                 <div className="mt-4 space-y-4">
//                                     <iframe
//                                         src={formData.receiptUrl}
//                                         className="w-full h-[calc(100vh-200px)]"
//                                         title="Receipt"
//                                     />
//                                 </div>
//                             </SheetContent>
//                         </Sheet>
//                     )}
//                 </TableCell>
//             </React.Fragment>
//         );
//     };

//     const AssignAdmin = () => {
//         const handleAssign = (value: string) => {
//             setAdminAssigned(value);
//         };
//         return (
//             <div className="flex items-center gap-4">
//                 <span className="text-sm font-medium">Assign Admin:</span>
//                 <Select
//                     onValueChange={handleAssign}
//                     value={adminAssigned}
//                 >
//                     <SelectTrigger className="w-60 h-8 text-xs">
//                         <SelectValue placeholder="Assign Admin to..." />
//                     </SelectTrigger>
//                     <SelectContent>
//                         {users.map((u) => (
//                             <SelectItem key={u._id} value={u.fullName || ''}>
//                                 {u.fullName || u.email}
//                             </SelectItem>
//                         ))}
//                     </SelectContent>
//                 </Select>
//             </div>
//         );
//     };

//     return (
//         <Tabs defaultValue="details" className="flex flex-col w-full mx-auto">
//             <TabsList className="flex w-full p-1 bg-background/80 rounded-t-lg border-b">
//                 <TabsTrigger
//                     value="details"
//                     className="flex-1 py-3 text-md font-medium transition-all rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
//                 >
//                     Company Details
//                 </TabsTrigger>
//                 <TabsTrigger
//                     value="service-agreement"
//                     className="flex-1 py-3 text-md font-medium transition-all rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
//                 >
//                     Record of Documents
//                 </TabsTrigger>
//                 {user.role !== 'user' && (
//                     <TabsTrigger
//                         value="Memos"
//                         className="flex-1 py-3 text-md font-medium transition-all rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
//                     >
//                         Memo
//                     </TabsTrigger>
//                 )}
//                 {user.role !== 'user' && (
//                     <TabsTrigger
//                         value="Projects"
//                         className="flex-1 py-3 text-md font-medium transition-all rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
//                     >
//                         Project
//                     </TabsTrigger>
//                 )}
//                 <TabsTrigger
//                     value="Checklist"
//                     className="flex-1 py-3 text-md font-medium transition-all rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
//                 >
//                     Checklist
//                 </TabsTrigger>
//             </TabsList>
//             <TabsContent value="details" className="p-6">
//                 <div className="space-y-4">
//                     {/* <h1 className="text-2xl font-bold">Company Details</h1> */}
//                     <div className="mb-4">
//                         <TodoApp id={id} name={formData.companyName[0]} />
//                     </div>

//                     <div className="flex gap-4 mt-auto">
//                         {user.role !== 'user' && <AssignAdmin />}
//                         <Button
//                             onClick={() => navigate(`/company-documents/US/${id}`)}
//                             size="sm"
//                             className="flex items-center gap-2"
//                         >
//                             Company Docs
//                         </Button>
//                     </div>
//                     {sections.map((section) => (
//                         <Card key={section.title} className="mb-6 border rounded-lg overflow-hidden transition-all hover:shadow-md">
//                             <CardHeader className="bg-muted/50 py-4">
//                                 <CardTitle className="text-lg font-medium">{section.title}</CardTitle>
//                             </CardHeader>
//                             <CardContent className="p-0">
//                                 <Table>
//                                     <TableHeader>
//                                         <TableRow className="border-b hover:bg-muted/30">
//                                             <TableHead className="w-1/3 py-3 px-4 text-sm font-medium">Field</TableHead>
//                                             <TableHead className="w-1/3 py-3 px-4 text-sm font-medium">Value</TableHead>
//                                             {user.role !== 'user' && <TableHead className="w-1/5 py-3 px-4 text-sm font-medium">Action</TableHead>}
//                                         </TableRow>
//                                     </TableHeader>
//                                     <TableBody>
//                                         {Object.entries(section.data).map(([key, value]) => {
//                                             if (key === 'Incorporation Date')
//                                                 return <TableRow key={key} className="border-b hover:bg-muted/30"><IncorporationDateFrag /></TableRow>;
//                                             if (key === 'Incorporation Status')
//                                                 return <TableRow key={key} className="border-b hover:bg-muted/30"><CompanyIncorpoStatus /></TableRow>;
//                                             if (key === 'Receipt')
//                                                 return <TableRow key={key} className="border-b hover:bg-muted/30"><ReceietPaymentFrag /></TableRow>;
//                                             if (key === 'AML/CDD Edit' && user.role !== 'user')
//                                                 return <TableRow key={key} className="border-b hover:bg-muted/30"><AMLCDDEdit /></TableRow>;
//                                             if (key === 'Payment Status')
//                                                 return <TableRow key={key} className="border-b hover:bg-muted/30"><PaymentStatus /></TableRow>;
//                                             if (key === 'Payment Expire Date')
//                                                 return <TableRow key={key} className="border-b hover:bg-muted/30"><ExtendPaymentTimer /></TableRow>;
//                                             return (
//                                                 <TableRow key={key} className="border-b hover:bg-muted/30">
//                                                     <TableCell className="py-3 px-4 font-medium">{key}</TableCell>
//                                                     <TableCell className="py-3 px-4">{value}</TableCell>
//                                                     <TableCell></TableCell>
//                                                 </TableRow>
//                                             );
//                                         })}
//                                     </TableBody>
//                                 </Table>
//                                 {section.title === 'Status Information' && user.role !== 'user' && (
//                                     <div className="flex items-center gap-4 p-4 bg-muted/50 border-t">
//                                         <span className="text-sm font-medium">
//                                             Click here to Save the Data
//                                         </span>
//                                         <Button
//                                             onClick={handleUpdate}
//                                             className="px-4 py-2 text-sm"
//                                         >
//                                             Save
//                                         </Button>
//                                     </div>
//                                 )}
//                             </CardContent>
//                         </Card>
//                     ))}
//                 </div>
//             </TabsContent>
//             <TabsContent value="service-agreement" className="p-6">
//                 <div className="space-y-6">
//                     <h1 className="text-2xl font-bold">Service Agreement Details</h1>
//                 </div>
//             </TabsContent>
//             <TabsContent value="Memos" className="p-6">
//                 <div className="space-y-6">
//                     <MemoApp id={id} />
//                 </div>
//             </TabsContent>
//             <TabsContent value="Projects" className="p-6">
//                 <div className="space-y-6">
//                     <AdminProject id={id} />
//                 </div>
//             </TabsContent>
//             <TabsContent value="Checklist" className="p-6">
//                 <ChecklistHistory id={id} items={[[], []]} />
//             </TabsContent>
//         </Tabs>
//     );
// };

// export default PaCompdetail;
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import { useAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import { fetchUsers, getPaIncorpoDataById, updateEditValues } from "@/services/dataFetch";
import { paymentApi } from "@/lib/api/payment";

import { paFormWithResetAtom, PaFormData } from "../Panama/PaState";
import MemoApp from "./MemosHK";
import TodoApp from "@/pages/Todo/TodoApp";
import AdminProject from "@/pages/dashboard/Admin/Projects/AdminProject";
import ChecklistHistory from "@/pages/Checklist/ChecklistHistory";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

import {
    Banknote,
    Building2,
    ShieldCheck,
    ReceiptText,
    Mail,
    Phone,
    Pencil,
    X,
    Save,
} from "lucide-react";

import { User } from "@/components/userList/UsersList";

type SessionData = {
    _id: string;
    amount: number;
    currency: string;
    expiresAt: string;
    status: string;
    paymentId: string;
};

const STATUS_OPTIONS = [
    "Pending",
    "KYC Verification",
    "Waiting for Payment",
    "Waiting for Documents",
    "Waiting for Incorporation",
    "Incorporation Completed",
    "Good Standing",
    "Renewal Processing",
    "Renewal Completed",
];

function fmtDate(d?: string | Date) {
    if (!d) return "—";
    const dt = typeof d === "string" ? new Date(d) : d;
    if (Number.isNaN(dt.getTime())) return "—";
    return dt.toLocaleString();
}

const FallbackAvatar: React.FC<{ name?: string | null }> = ({ name }) => {
    const initials = (name || "")
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">
            {initials || "NA"}
        </div>
    );
};

const LabelValue: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="grid gap-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm">{children}</div>
    </div>
);

const BoolPill: React.FC<{ value?: boolean }> = ({ value }) => (
    <Badge variant={value ? "default" : "outline"}>{value ? "YES" : "NO"}</Badge>
);

const StepRail: React.FC<{ stepIdx?: number }> = ({ stepIdx = 0 }) => (
    <div className="flex items-center gap-2">
        <div className="text-xs text-muted-foreground">Step</div>
        <Badge variant="secondary">{stepIdx}</Badge>
    </div>
);


const PaCompdetail: React.FC<{ id: string }> = ({ id }) => {

    const navigate = useNavigate();
    const { toast } = useToast();

    const [formData, setFormData] = useAtom(paFormWithResetAtom);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [adminAssigned, setAdminAssigned] = useState("");
    const [session, setSession] = useState<SessionData>({
        _id: "",
        amount: 0,
        currency: "",
        expiresAt: "",
        status: "",
        paymentId: "",
    });

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null;

    // derived view model for convenience
    const f = useMemo(() => {
        const d = formData || ({} as PaFormData);
        return {
            // names
            name1: d?.companyName?.[0] || "",
            name2: d?.companyName?.[1] || "",
            name3: d?.companyName?.[2] || "",
            // contact
            applicantName: d?.name || "",
            email: d?.email || "",
            phone: d?.phoneNum || "",
            // business
            industry: (d?.selectedIndustry || []).join(", "),
            purpose: d?.purposePaCompany || [],
            bizdesc: d?.bizDesc || "",
            softNote: d?.specificProvisions || "",
            // finance
            currency: d?.registerCurrencyAtom?.code || "USD",
            capAmount: d?.totalAmountCap || "",
            shareCount: d?.noOfSharesIssued || "",
            // receipts (Stripe/bank placeholders retained for shape consistency)
            stripeLastStatus: session.status === "completed" ? "succeeded" : "",
            stripeReceiptUrl: d?.receiptUrl || "",
            uploadReceiptUrl: d?.receiptUrl || "",
            payMethod: d?.shareCapitalPayment?.id || "",
            bankRef: "", // not present in payload
            finalAmount: session?.amount || "",
            // compliance
            compliancePreconditionAcknowledgment: d?.annualRenewalTermsAgreement?.id === "yes",
            serviceAgreementConsent: d?.serviceAgreementConsent ? "Accepted" : "",
            legalAndEthicalConcern: d?.hasLegalEthicalIssues?.id,
            q_country: d?.restrictedCountriesWithActivity?.id,
            sanctionsExposureDeclaration: d?.sanctionedTiesPresent?.id,
            crimeaSevastapolPresence: d?.businessInCrimea?.id,
            russianEnergyPresence: d?.involvedInRussianEnergyDefense?.id,
            // social
            sns: d?.snsAccountId?.id || "",
            snsId: d?.snsAccountId?.value || "",
            // meta
            stepIdx: 0,
        };
    }, [formData, session]);

    const currentStep = "Panama Incorporation";

    useEffect(() => {
        async function load() {
            const data = await getPaIncorpoDataById(`${id}`);
            setAdminAssigned(data.assignedTo || "");

            if (data.sessionId) {
                const s = await paymentApi.getSession(data.sessionId);
                const transformed: SessionData = {
                    _id: s._id,
                    amount: s.amount,
                    currency: s.currency,
                    expiresAt: s.expiresAt,
                    status: s.status,
                    paymentId: s.paymentId,
                };
                setSession(transformed);
            }

            const response = await fetchUsers();
            const filtered = response.filter((e: { role: string }) => e.role === "admin" || e.role === "master");
            setUsers(filtered);

            setFormData(data);
        }
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const patchForm = (key: "name1" | "name2" | "name3", val: string) => {
        if (!formData) return;
        const names = [...(formData.companyName || ["", "", ""])];
        if (key === "name1") names[0] = val;
        if (key === "name2") names[1] = val;
        if (key === "name3") names[2] = val;
        setFormData({ ...formData, companyName: names });
    };

    const patchCompany = (key: "status" | "incorporationDate" | "expiresAt" | "paymentStatus", val: string) => {
        if (!formData) return;
        if (key === "expiresAt") {
            setSession({ ...session, expiresAt: val });
            return;
        }
        if (key === "paymentStatus") {
            setSession({ ...session, status: val });
            return;
        }
        setFormData({ ...formData, [key]: val } as any);
    };

    const AssignAdmin = () => {
        const handleAssign = (value: string) => setAdminAssigned(value);
        return (
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Assign Admin:</span>
                <Select onValueChange={handleAssign} value={adminAssigned}>
                    <SelectTrigger className="w-60 h-8 text-xs">
                        <SelectValue placeholder="Assign Admin to..." />
                    </SelectTrigger>
                    <SelectContent>
                        {users.map((u) => (
                            <SelectItem key={u._id} value={u.fullName || ""}>
                                {u.fullName || u.email}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        );
    };

    const onSave = async () => {
        if (!formData) return;
        try {
            setIsSaving(true);
            const payload = JSON.stringify({
                company: {
                    id: formData._id,
                    status: formData.status,
                    isDisabled: formData.isDisabled,
                    incorporationDate: formData.incorporationDate,
                    country: "PA",
                    companyName: formData.companyName,
                },
                session: {
                    id: session._id,
                    expiresAt: session.expiresAt,
                    status: session.status,
                },
                assignedTo: adminAssigned,
            });

            const res = await updateEditValues(payload);
            if (res.success) toast({ description: "Record updated successfully" });
        } finally {
            setIsSaving(false);
        }
    };

    const totalShares = Number(formData?.noOfSharesIssued || 0);

    return (
        <Tabs defaultValue="details" className="flex flex-col w-full mx-auto">
            <TabsList className="flex w-full p-1 bg-background/80 rounded-t-lg border-b">
                <TabsTrigger value="details" className="flex-1 py-3 text-md font-medium transition-all rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
                    Company Details
                </TabsTrigger>
                <TabsTrigger value="service-agreement" className="flex-1 py-3 text-md font-medium transition-all rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
                    Record of Documents
                </TabsTrigger>
                {user?.role !== "user" && (
                    <TabsTrigger value="Memos" className="flex-1 py-3 text-md font-medium transition-all rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
                        Memo
                    </TabsTrigger>
                )}
                {user?.role !== "user" && (
                    <TabsTrigger value="Projects" className="flex-1 py-3 text-md font-medium transition-all rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
                        Project
                    </TabsTrigger>
                )}
                <TabsTrigger value="Checklist" className="flex-1 py-3 text-md font-medium transition-all rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
                    Checklist
                </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="p-6">
                <section>
                    {formData?.companyName?.[0] && <TodoApp id={id} name={formData.companyName[0]} />}
                    <div className="flex gap-x-8 mt-4">
                        {user?.role !== "user" && <AssignAdmin />}
                        <Button onClick={() => navigate(`/company-documents/PA/${id}`)} size="sm" className="flex items-center gap-2">
                            Company Docs
                        </Button>
                    </div>

                    <div className="mx-auto grid max-width gap-6 p-4 lg:grid-cols-3 pb-24">
                        {/* LEFT */}
                        <div className="lg:col-span-2 grid gap-6">
                            <Card>
                                <CardHeader className="pb-2">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                            <Building2 className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    {isEditing ? (
                                                        <Input
                                                            value={f.name1 || ""}
                                                            onChange={(e) => patchForm("name1", e.target.value)}
                                                            className="h-8 text-base"
                                                            placeholder="Company Name"
                                                        />
                                                    ) : (
                                                        <CardTitle className="text-xl truncate">{f.name1 || "Untitled Panama Company"}</CardTitle>
                                                    )}

                                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                                        <Badge variant="secondary" className="text-muted-foreground">
                                                            {currentStep}
                                                        </Badge>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-muted-foreground">Incorporation Status</span>
                                                            {user?.role !== "user" ? (
                                                                <Select value={formData?.status || ""} onValueChange={(val) => patchCompany("status", val)}>
                                                                    <SelectTrigger className="h-7 w-[220px]">
                                                                        <SelectValue placeholder="Select status" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {STATUS_OPTIONS.map((s) => (
                                                                            <SelectItem key={s} value={s}>
                                                                                {s}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            ) : (
                                                                <Badge variant="default">{formData?.status || "Pending"}</Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Edit toggle */}
                                                <div className="flex shrink-0 items-center gap-2">
                                                    {!isEditing ? (
                                                        <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                                                            <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                                                        </Button>
                                                    ) : (
                                                        <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                                                            <X className="mr-1 h-3.5 w-3.5" /> Cancel
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="grid gap-5">
                                    <StepRail stepIdx={f.stepIdx} />

                                    {/* Basic info (editable names) */}
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <LabelValue label="Applicant">
                                            <div className="flex items-center gap-2">
                                                <FallbackAvatar name={f.applicantName} />
                                                <span className="font-medium">{f.applicantName || "—"}</span>
                                            </div>
                                        </LabelValue>

                                        <LabelValue label="Contact">
                                            <div className="grid gap-2">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-3.5 w-3.5" />
                                                    <span className="text-sm">{f.email || "—"}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-3.5 w-3.5" />
                                                    <span className="text-sm">{f.phone || "—"}</span>
                                                </div>
                                            </div>
                                        </LabelValue>

                                        <LabelValue label="Alt Names">
                                            {isEditing ? (
                                                <div className="grid grid-cols-2 gap-2">
                                                    <Input value={f.name2 || ""} onChange={(e) => patchForm("name2", e.target.value)} placeholder="Name 2" className="h-8" />
                                                    <Input value={f.name3 || ""} onChange={(e) => patchForm("name3", e.target.value)} placeholder="Name 3" className="h-8" />
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {[f.name2, f.name3].filter(Boolean).length ? (
                                                        [f.name2, f.name3].filter(Boolean).map((n, i) => (
                                                            <Badge key={String(n) + i} variant="secondary">
                                                                {n as string}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-muted-foreground">—</span>
                                                    )}
                                                </div>
                                            )}
                                        </LabelValue>

                                        <LabelValue label="Industry">{f.industry || "—"}</LabelValue>

                                        <LabelValue label="Purpose">
                                            <div className="flex flex-wrap gap-2">
                                                {(f.purpose?.length ? f.purpose : ["—"]).map((p, i) => (
                                                    <Badge key={String(p) + i} variant="secondary">
                                                        {p}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </LabelValue>

                                        <LabelValue label="Business Description">{f.bizdesc || "—"}</LabelValue>

                                        <LabelValue label="Notes">{f.softNote || "—"}</LabelValue>

                                        <LabelValue label="Incorporation Date">
                                            {formData?.incorporationDate ? (
                                                <div className="flex items-center gap-3">
                                                    <span>{fmtDate(formData.incorporationDate)}</span>
                                                    {user?.role !== "user" && (
                                                        <Input
                                                            type="date"
                                                            value={formData.incorporationDate.slice(0, 10)}
                                                            onChange={(e) => patchCompany("incorporationDate", e.target.value)}
                                                            className="h-8 w-44"
                                                        />
                                                    )}
                                                </div>
                                            ) : user?.role !== "user" ? (
                                                <Input
                                                    type="date"
                                                    value={formData?.incorporationDate?.slice(0, 10) || ""}
                                                    onChange={(e) => patchCompany("incorporationDate", e.target.value)}
                                                    className="h-8 w-44"
                                                />
                                            ) : (
                                                "—"
                                            )}
                                        </LabelValue>
                                    </div>

                                    <Separator />

                                    {/* Finance & accounting */}
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <LabelValue label="Currency">
                                            <Badge variant="outline">{f.currency || "—"}</Badge>
                                        </LabelValue>
                                        <LabelValue label="Declared Capital">{f.capAmount || "—"}</LabelValue>
                                        <LabelValue label="Total Shares">{f.shareCount || "—"}</LabelValue>
                                    </div>

                                    <Separator />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <LabelValue label="Created">{fmtDate(formData?.createdAt)}</LabelValue>
                                        <LabelValue label="Updated">{fmtDate(formData?.updatedAt)}</LabelValue>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Shareholding & Parties</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {formData?.shareHolders && formData.shareHolders.length > 0 ? (
                                        <div className="rounded-md border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[40%]">Party</TableHead>
                                                        <TableHead className="w-[25%]">Role / Type</TableHead>
                                                        <TableHead className="w-[20%]">Ownership</TableHead>
                                                        <TableHead className="w-[15%]">Legal Person</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {formData.shareHolders.map((p: any, i: number) => (
                                                        <TableRow key={p.name + i}>
                                                            <TableCell>
                                                                <div className="flex items-center gap-2">
                                                                    <FallbackAvatar name={p.name} />
                                                                    <div className="grid">
                                                                        <span className="font-medium">{p.name || "—"}</span>
                                                                        <span className="text-xs text-muted-foreground">{p.email || "—"}</span>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-sm">
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium">{p.role?.id || "—"}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-sm">
                                                                {typeof p.ownershipRate === "number" ? `${p.ownershipRate}%` : "—"}
                                                            </TableCell>
                                                            <TableCell className="text-sm">{p.isLegalPerson?.value || "—"}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                    <TableRow>
                                                        <TableCell className="font-medium">Total Shares</TableCell>
                                                        <TableCell />
                                                        <TableCell>{totalShares || "—"}</TableCell>
                                                        <TableCell />
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ) : (
                                        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                                            No parties added.
                                        </div>
                                    )}
                                    {/* AML/CDD toggle */}
                                    <div className="flex items-center mt-2 gap-3">
                                        <Label className="text-right">AML/CDD Edit</Label>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">{formData?.isDisabled ? "No" : "Yes"}</Badge>
                                            <Switch
                                                checked={!formData?.isDisabled}
                                                onCheckedChange={(checked) => setFormData({ ...formData, isDisabled: !checked })}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* RIGHT */}
                        <div className="grid gap-6">
                            {/* PAYMENT */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                            <Banknote className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <CardTitle className="text-base">Payment</CardTitle>
                                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                                <Badge variant="secondary" className="gap-1">
                                                    <ReceiptText className="h-3.5 w-3.5" />
                                                    {(f.payMethod || "").toUpperCase() || "—"}
                                                </Badge>
                                                {formData?.receiptUrl && (
                                                    <Badge variant="outline" className="gap-1">
                                                        Receipt Uploaded
                                                    </Badge>
                                                )}
                                                {session.status === "completed" && formData?.receiptUrl && (
                                                    <Badge className="bg-emerald-600 hover:bg-emerald-600">Stripe Paid</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="grid gap-4">
                                    {/* Receipt / Proof */}
                                    <div className="grid gap-2">
                                        <div className="text-xs text-muted-foreground">Receipt / Proof</div>

                                        {session.status === "completed" && formData?.receiptUrl ? (
                                            <div className="rounded-md border bg-emerald-50 p-4 text-emerald-800">
                                                <div className="text-sm font-medium">Payment successful.</div>
                                                <a href={formData.receiptUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center text-sm underline">
                                                    View Receipt
                                                </a>
                                            </div>
                                        ) : formData?.receiptUrl ? (
                                            <div className="space-y-3">
                                                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                                                    <SheetTrigger asChild>
                                                        <Button variant="outline" size="sm">
                                                            Preview Receipt
                                                        </Button>
                                                    </SheetTrigger>
                                                    <SheetContent side="right" className="w-full max-w-[40vw]" style={{ width: "40vw", maxWidth: "40vw" }}>
                                                        <SheetHeader>
                                                            <SheetTitle>Receipt</SheetTitle>
                                                        </SheetHeader>
                                                        <div className="mt-4 space-y-4">
                                                            <iframe src={formData.receiptUrl} className="w-full h-[calc(100vh-200px)]" title="Receipt" />
                                                        </div>
                                                    </SheetContent>
                                                </Sheet>
                                                {user?.role !== "user" && (
                                                    <div className="flex items-center gap-3">
                                                        <Label className="text-sm font-medium">Payment Status:</Label>
                                                        <Select value={session?.status || "pending"} onValueChange={(val) => patchCompany("paymentStatus", val)}>
                                                            <SelectTrigger className="w-32">
                                                                <SelectValue placeholder="Status" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="pending">Pending</SelectItem>
                                                                <SelectItem value="completed">Paid</SelectItem>
                                                                <SelectItem value="expired">Expired</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">No file uploaded</div>
                                        )}
                                    </div>

                                    {/* Session details incl. editable expiresAt */}
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label className="text-right">Amount</Label>
                                            <div className="col-span-3 text-sm font-medium">{f.finalAmount ? `${f.finalAmount} ${session.currency || "USD"}` : "—"}</div>
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="expiresAt" className="text-right">
                                                Expires
                                            </Label>
                                            <Input
                                                id="expiresAt"
                                                type="date"
                                                value={session.expiresAt ? session.expiresAt.slice(0, 10) : ""}
                                                onChange={(e) => patchCompany("expiresAt", e.target.value)}
                                                className="col-span-3"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* COMPLIANCE */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                            <ShieldCheck className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <CardTitle className="text-base">Compliance & Declarations</CardTitle>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="grid gap-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <LabelValue label="Annual renewal terms agreement">
                                            <BoolPill value={!!f.compliancePreconditionAcknowledgment} />
                                        </LabelValue>
                                        <LabelValue label="Service agreement consent">{f.serviceAgreementConsent || "—"}</LabelValue>
                                    </div>

                                    <Separator />

                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="text-xs text-muted-foreground">Sanctions / Restrictions</div>
                                        <div className="grid grid-cols-1 gap-2 text-sm">
                                            {[
                                                ["Legal or Ethical Concern(money laundering etc)", "legalAndEthicalConcern"],
                                                ["Sanctioned Countries Activity (iran, sudan, NK, syria, cuba,belarus, zimbabwe", "q_country"],
                                                ["Sanctions Exposure (involved in above countries or under sanctions by  UN, EU, UKHMT, HKMA, OFAC,)", "sanctionsExposureDeclaration"],
                                                ["Crimea/Sevastopol Presence", "crimeaSevastapolPresence"],
                                                ["Russian Energy Presence", "russianEnergyPresence"],
                                            ].map(([label, key]) => {
                                                const val = (f as any)[key];
                                                const isYes = String(val || "").toLowerCase() === "yes";
                                                return (
                                                    <div key={key} className="flex items-center justify-between gap-3">
                                                        <span>{label}</span>
                                                        <Badge variant={isYes ? "destructive" : "outline"} className={isYes ? "" : "text-muted-foreground"}>
                                                            {(val || "—").toString().toUpperCase()}
                                                        </Badge>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="grid grid-cols-2 gap-4">
                                        <LabelValue label="Social App">{f.sns || "—"}</LabelValue>
                                        <LabelValue label="Handle / ID">{f.snsId || "—"}</LabelValue>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sticky save bar */}
                        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                            <div className="mx-auto flex max-width items-center justify-between gap-3 p-3">
                                <div className="text-xs text-muted-foreground">
                                    Status: <strong>{formData?.status || "Pending"}</strong>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button onClick={onSave} disabled={isSaving}>
                                        <Save className="mr-1 h-4 w-4" /> {isSaving ? "Saving..." : "Save"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </TabsContent>

            <TabsContent value="service-agreement" className="p-6">
                <div className="space-y-6">
                    <h1 className="text-2xl font-bold">Service Agreement Details</h1>
                </div>
            </TabsContent>

            {user?.role !== "user" && (
                <TabsContent value="Memos" className="p-6">
                    <div className="space-y-6">
                        <MemoApp id={id} />
                    </div>
                </TabsContent>
            )}

            {user?.role !== "user" && (
                <TabsContent value="Projects" className="p-6">
                    <div className="space-y-6">
                        <AdminProject id={id} />
                    </div>
                </TabsContent>
            )}

            <TabsContent value="Checklist" className="p-6">
                <ChecklistHistory id={id} items={[[], []]} />
            </TabsContent>
        </Tabs>
    );
};

export default PaCompdetail;
