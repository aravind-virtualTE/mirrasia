// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { fetchUsers, getSgIncorpoDataById, updateEditValues } from '@/services/dataFetch';
// import { useAtom } from 'jotai';
// import React, { useEffect, useMemo, useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
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
// import { sgFormWithResetAtom,SgFormData } from '../Singapore/SgState';


// const SgCompdetail: React.FC<{ id: string }> = ({ id }) => {
//   const { t } = useTranslation()
//   const [formData, setFormData] = useAtom(sgFormWithResetAtom);
//   const [isSheetOpen, setIsSheetOpen] = useState(false);
//   const { toast } = useToast();
//   const [users, setUsers] = useState<User[]>([]);
//   const [adminAssigned, setAdminAssigned] = useState('');
//   const [session, setSession] = useState<SessionData>({
//     _id: '',
//     amount: 0,
//     currency: '',
//     expiresAt: '',
//     status: '',
//     paymentId: '',
//   });
//   const navigate = useNavigate();
//   const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null;

//   useEffect(() => {
//     async function getUsData() {
//       const data = await getSgIncorpoDataById(`${id}`);
//       setAdminAssigned(data.assignedTo);

//       if (data.sessionId !== '') {
//         const session = await paymentApi.getSession(data.sessionId);
//         const transformedSession: SessionData = {
//           _id: session._id,
//           amount: session.amount,
//           currency: session.currency,
//           expiresAt: session.expiresAt,
//           status: session.status,
//           paymentId: session.paymentId,
//         };
//         setSession(transformedSession);
//       }

//       const response = await fetchUsers();
//       const filteredUsers = response.filter((e: { role: string }) => e.role === 'admin' || e.role === 'master');
//       setUsers(filteredUsers);

//       return data;
//     }

//     getUsData().then((result) => {
//       setFormData(result);
//     });
//   }, []);

//   // Helper function to render object values
//   const renderValue = (data: any): string => {
//     if (typeof data === 'object' && data !== null) {
//       return data.value || data.id || 'N/A';
//     }
//     return data || 'N/A';
//   };

//   const generateSections = (formData: SgFormData, session: SessionData) => {
//     const sections = [];
//     // console.log("formData", formData);
//     // Applicant Information Section
//     sections.push({
//       title: 'Applicant Information',
//       data: {
//         'Company Name': (
//           <div className="space-y-4">
//             <div className="grid gap-2">
//               {formData.companyName.slice(0, 3).map((name, index) => (
//                 <div key={index} className="flex items-center gap-2">
//                   <div className="flex-1 p-2 border rounded-md bg-background">{name || "N/A"}</div>
//                   {index > 0 && (
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => {
//                         const newNames = [...formData.companyName]
//                         // Move this item to the first position
//                         const [removed] = newNames.splice(index, 1)
//                         newNames.unshift(removed)

//                         // Update the company state
//                         setFormData({
//                           ...formData,
//                           companyName: newNames,
//                         })
//                       }}
//                     >
//                       Move to Top
//                     </Button>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         ),
//         'Applicant Name': formData.name,
//         Email: formData.email,
//         Phone: formData.phoneNum,
//         Relationships: formData.establishedRelationshipType?.join(', ') || 'N/A',
//         'SNS Account ID': renderValue(formData.snsAccountId.id),
//         'SNS Account Number': renderValue(formData.snsAccountId.value),
//       },
//     });

//     // Country Information Section
//     sections.push({
//       title: 'Jurisdiction Information',
//       data: {
//         Country: 'Singapore',
//         'Country Code': 'SG',
//       },
//     });

//     // Business Information Section
//     sections.push({
//       title: 'AML/CDD Information',
//       data: {
//         'Sanctioned Countries': t(renderValue(formData.restrictedCountriesWithActivity)),
//         'Sanctions Presence': t(renderValue(formData.sanctionedTiesPresent)),
//         'Crimea Presence': t(renderValue(formData.businessInCrimea)),
//         'Russian Business Presence': t(renderValue(formData.involvedInRussianEnergyDefense)),
//         'Legal Assessment': t(renderValue(formData.hasLegalEthicalIssues)),
//         'Annual Renewal Terms': t(renderValue(formData.annualRenewalTermsAgreement)),
//       },
//     })

//     // Shareholder and Director Information Section
//     if (formData.shareHolders) {
//       const shareholderData = formData.shareHolders;
//       // console.log("shareholderDat", shareholderData)
//       sections.push({
//         title: 'Shareholder and Director Information',
//         data: {
//           'Designated Contact Person': formData.designatedContact,
//           'Shareholders and Directors': (
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Name</TableHead>
//                   <TableHead>Email</TableHead>
//                   <TableHead>Phone</TableHead>
//                   <TableHead>Ownership Rate</TableHead>
//                   <TableHead>Is Director</TableHead>
//                   <TableHead>Is Legal Person</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {Array.isArray(shareholderData) &&
//                   shareholderData.map((shareholder, index) => (
//                     <TableRow key={index}>
//                       <TableCell>{shareholder.name}</TableCell>
//                       <TableCell>{shareholder.email}</TableCell>
//                       <TableCell>{shareholder.phone || 'N/A'}</TableCell>
//                       <TableCell>{shareholder.ownerShipRate}%</TableCell>
//                       <TableCell>{t(renderValue(shareholder.isDirector))}</TableCell>
//                       <TableCell>{t(renderValue(shareholder.isLegalPerson))}</TableCell>
//                     </TableRow>
//                   ))}
//               </TableBody>
//             </Table>
//           ),
//         },
//       });
//     }

//     // Payment Information Section
//     if (formData.sessionId && session) {
//       sections.push({
//         title: 'Payment Information',
//         data: {
//           Amount: session.amount,
//           'Payment Status': session.status,
//           'Payment Expire Date': new Date(session.expiresAt).toLocaleString(),
//           Receipt: formData.receiptUrl ? 'Available' : 'Not available',
//         },
//       });
//     }

//     // Status Information Section
//     sections.push({
//       title: 'Status Information',
//       data: {
//         'Incorporation Status': formData.status,
//         'Incorporation Date': formData.incorporationDate || 'N/A',
//         'AML/CDD Edit': formData.isDisabled ? 'No' : 'Yes',
//       },
//     });
//     return sections;
//   };

//   const sections = useMemo(() => {
//     if (!formData) return [];
//     return generateSections(formData, session);
//   }, [formData, session]);

//   const handleUpdate = async () => {
//     const payload = JSON.stringify({
//       company: {
//         id: formData._id,
//         status: formData.status,
//         isDisabled: formData.isDisabled,
//         incorporationDate: formData.incorporationDate,
//         country: 'US',
//         companyName: formData.companyName
//       },
//       session: {
//         id: session._id,
//         expiresAt: session.expiresAt,
//         status: session.status,
//       },
//       assignedTo: adminAssigned,
//     });

//     const response = await updateEditValues(payload);
//     if (response.success) {
//       toast({ description: 'Record updated successfully' });
//     }
//   };

//   const handleCompanyDataChange = (key: keyof SgFormData, value: string | boolean) => {
//     setFormData({ ...formData, [key]: value });
//   };

//   const handleSessionDataChange = (key: keyof SessionData, value: string) => {
//     setSession({ ...session, [key]: value });
//   };

//   const IncorporationDateFrag = () => {
//     let date = formData.incorporationDate;
//     if (date !== null && date !== undefined && date !== '') {
//       const [year, month, day] = date.split('T')[0].split('-');
//       date = `${day}-${month}-${year}`;
//     }else{
//         date = 'Not set'
//     }
//     return (
//       <React.Fragment>
//         <TableCell className="font-medium">Incorporation Date</TableCell>
//         <TableCell>{date }</TableCell>
//         {user.role !== 'user' && <TableCell>
//           <Dialog>
//             <DialogTrigger asChild>
//               <Button variant="outline">Edit</Button>
//             </DialogTrigger>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Edit Incorporation Date</DialogTitle>
//                 <DialogDescription>
//                   Set the incorporation date for the company. This is the date when the company was officially registered.
//                 </DialogDescription>
//               </DialogHeader>
//               <div className="grid gap-4 py-4">
//                 <div className="grid grid-cols-4 items-center gap-4">
//                   <Label htmlFor="incorporationDate" className="text-right">
//                     Date
//                   </Label>
//                   <Input
//                     id="incorporationDate"
//                     type="date"
//                     value={formData.incorporationDate || ''}
//                     onChange={(e) =>
//                       handleCompanyDataChange('incorporationDate', e.target.value)
//                     }
//                     className="col-span-3"
//                   />
//                 </div>
//               </div>
//             </DialogContent>
//           </Dialog>
//         </TableCell>}
//       </React.Fragment>
//     );
//   };

//   const CompanyIncorpoStatus = () => {
//     const statusOptions = [
//       'Pending',
//       'KYC Verification',
//       'Waiting for Payment',
//       'Waiting for Documents',
//       'Waiting for Incorporation',
//       'Incorporation Completed',
//       'Good Standing',
//       'Renewal Processing',
//       'Renewal Completed',
//     ];
//     return (
//       <React.Fragment>
//         <TableCell className="font-medium">Incorporation Status</TableCell>
//         <TableCell>{formData.status}</TableCell>
//         {user.role !== 'user' && <TableCell>
//           <Select
//             value={formData.status}
//             onValueChange={(value) => handleCompanyDataChange('status', value)}
//           >
//             <SelectTrigger className="w-[180px]">
//               <SelectValue placeholder="Select status" />
//             </SelectTrigger>
//             <SelectContent>
//               {statusOptions.map((status) => (
//                 <SelectItem key={status} value={status}>
//                   {status}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </TableCell>}
//       </React.Fragment>
//     );
//   };

//   const AMLCDDEdit = () => (
//     <React.Fragment>
//       <TableCell className="font-medium">AML/CDD Edit</TableCell>
//       <TableCell>{formData.isDisabled ? 'No' : 'Yes'}</TableCell>
//       <TableCell>
//         <Switch
//           checked={!formData.isDisabled}
//           onCheckedChange={(checked) => handleCompanyDataChange('isDisabled', !checked)}
//         />
//       </TableCell>
//     </React.Fragment>
//   );

//   const PaymentStatus = () => {
//     return (
//       <React.Fragment>
//         <TableCell className="font-medium">Payment Status</TableCell>
//         <TableCell>{session.status}</TableCell>
//         {user.role !== 'user' && <TableCell>
//           <Select
//             value={session.status}
//             onValueChange={(value) => handleSessionDataChange('status', value)}
//           >
//             <SelectTrigger className="w-[180px]">
//               <SelectValue placeholder="Select status" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="pending">Pending</SelectItem>
//               <SelectItem value="completed">Completed</SelectItem>
//               <SelectItem value="expired">Expired</SelectItem>
//             </SelectContent>
//           </Select>
//         </TableCell>}
//       </React.Fragment>
//     );
//   };

//   const ExtendPaymentTimer = () => {
//     return (
//       <React.Fragment>
//         <TableCell className="font-medium">Payment Expire Date</TableCell>
//         <TableCell>{new Date(session.expiresAt).toLocaleString() || 'Not set'}</TableCell>
//         <TableCell>
//           <Dialog>
//             <DialogTrigger asChild>
//               <Button variant="outline">Edit</Button>
//             </DialogTrigger>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Edit Payment Expire Date</DialogTitle>
//                 <DialogDescription>
//                   Extend the Payment Expire for the company Payment.
//                 </DialogDescription>
//               </DialogHeader>
//               <div className="grid gap-4 py-4">
//                 <div className="grid grid-cols-4 items-center gap-4">
//                   <Label htmlFor="expiresAt" className="text-right">
//                     Date
//                   </Label>
//                   <Input
//                     id="expiresAt"
//                     type="date"
//                     value={session.expiresAt || ''}
//                     onChange={(e) => handleSessionDataChange('expiresAt', e.target.value)}
//                     className="col-span-3"
//                   />
//                 </div>
//               </div>
//             </DialogContent>
//           </Dialog>
//         </TableCell>
//       </React.Fragment>
//     );
//   };

//   const ReceietPaymentFrag = () => {
//     return (
//       <React.Fragment>
//         <TableCell className="font-medium">Receipt</TableCell>
//         <TableCell>{formData.receiptUrl ? 'Available' : 'Not available'}</TableCell>
//         <TableCell>
//           {formData.receiptUrl && (
//             <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
//               <SheetTrigger asChild>
//                 <Button variant="outline">View Receipt</Button>
//               </SheetTrigger>
//               <SheetContent
//                 side="right"
//                 className="w-full max-w-[40vw]"
//                 style={{ width: '40vw', maxWidth: '40vw' }}
//               >
//                 <SheetHeader>
//                   <SheetTitle>Receipt</SheetTitle>
//                 </SheetHeader>
//                 <div className="mt-4 space-y-4">
//                   <iframe
//                     src={formData.receiptUrl}
//                     className="w-full h-[calc(100vh-200px)]"
//                     title="Receipt"
//                   />
//                 </div>
//               </SheetContent>
//             </Sheet>
//           )}
//         </TableCell>
//       </React.Fragment>
//     );
//   };

//   const AssignAdmin = () => {
//     const handleAssign = (value: string) => {
//       setAdminAssigned(value);
//     };
//     return (
//       <div className="flex items-center gap-4">
//         <span className="text-sm font-medium">Assign Admin:</span>
//         <Select
//           onValueChange={handleAssign}
//           value={adminAssigned}
//         >
//           <SelectTrigger className="w-60 h-8 text-xs">
//             <SelectValue placeholder="Assign Admin to..." />
//           </SelectTrigger>
//           <SelectContent>
//             {users.map((u) => (
//               <SelectItem key={u._id} value={u.fullName || ''}>
//                 {u.fullName || u.email}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>
//     );
//   };

//   return (
//     <Tabs defaultValue="details" className="flex flex-col w-full mx-auto">
//       <TabsList className="flex w-full p-1 bg-background/80 rounded-t-lg border-b">
//         <TabsTrigger
//           value="details"
//           className="flex-1 py-3 text-md font-medium transition-all rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
//         >
//           Company Details
//         </TabsTrigger>
//         <TabsTrigger
//           value="service-agreement"
//           className="flex-1 py-3 text-md font-medium transition-all rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
//         >
//           Record of Documents
//         </TabsTrigger>
//         {user.role !== 'user' && (
//           <TabsTrigger
//             value="Memos"
//             className="flex-1 py-3 text-md font-medium transition-all rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
//           >
//             Memo
//           </TabsTrigger>
//         )}
//         {user.role !== 'user' && (
//           <TabsTrigger
//             value="Projects"
//             className="flex-1 py-3 text-md font-medium transition-all rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
//           >
//             Project
//           </TabsTrigger>
//         )}
//         <TabsTrigger
//           value="Checklist"
//           className="flex-1 py-3 text-md font-medium transition-all rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
//         >
//           Checklist
//         </TabsTrigger>
//       </TabsList>
//       <TabsContent value="details" className="p-6">
//         <div className="space-y-4">
//           {/* <h1 className="text-2xl font-bold">Company Details</h1> */}    
//            <div className="mb-4">
//               <TodoApp id={id} name={formData.companyName[0]} />
//             </div>

//           <div className="flex gap-4 mt-auto">
//             {user.role !== 'user' && <AssignAdmin />}
//             <Button
//               onClick={() => navigate(`/company-documents/US/${id}`)}
//               size="sm"
//               className="flex items-center gap-2"
//             >
//               Company Docs
//             </Button>
//           </div>
//           {sections.map((section) => (
//             <Card key={section.title} className="mb-6 border rounded-lg overflow-hidden transition-all hover:shadow-md">
//               <CardHeader className="bg-muted/50 py-4">
//                 <CardTitle className="text-lg font-medium">{section.title}</CardTitle>
//               </CardHeader>
//               <CardContent className="p-0">
//                 <Table>
//                   <TableHeader>
//                     <TableRow className="border-b hover:bg-muted/30">
//                       <TableHead className="w-1/3 py-3 px-4 text-sm font-medium">Field</TableHead>
//                       <TableHead className="w-1/3 py-3 px-4 text-sm font-medium">Value</TableHead>
//                       {user.role !== 'user' && <TableHead className="w-1/5 py-3 px-4 text-sm font-medium">Action</TableHead>}
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {Object.entries(section.data).map(([key, value]) => {
//                       if (key === 'Incorporation Date')
//                         return <TableRow key={key} className="border-b hover:bg-muted/30"><IncorporationDateFrag /></TableRow>;
//                       if (key === 'Incorporation Status')
//                         return <TableRow key={key} className="border-b hover:bg-muted/30"><CompanyIncorpoStatus /></TableRow>;
//                       if (key === 'Receipt')
//                         return <TableRow key={key} className="border-b hover:bg-muted/30"><ReceietPaymentFrag /></TableRow>;
//                       if (key === 'AML/CDD Edit' && user.role !== 'user')
//                         return <TableRow key={key} className="border-b hover:bg-muted/30"><AMLCDDEdit /></TableRow>;
//                       if (key === 'Payment Status')
//                         return <TableRow key={key} className="border-b hover:bg-muted/30"><PaymentStatus /></TableRow>;
//                       if (key === 'Payment Expire Date')
//                         return <TableRow key={key} className="border-b hover:bg-muted/30"><ExtendPaymentTimer /></TableRow>;
//                       return (
//                         <TableRow key={key} className="border-b hover:bg-muted/30">
//                           <TableCell className="py-3 px-4 font-medium">{key}</TableCell>
//                           <TableCell className="py-3 px-4">{value}</TableCell>
//                           <TableCell></TableCell>
//                         </TableRow>
//                       );
//                     })}
//                   </TableBody>
//                 </Table>
//                 {section.title === 'Status Information' && user.role !== 'user' && (
//                   <div className="flex items-center gap-4 p-4 bg-muted/50 border-t">
//                     <span className="text-sm font-medium">
//                       Click here to Save the Data
//                     </span>
//                     <Button
//                       onClick={handleUpdate}
//                       className="px-4 py-2 text-sm"
//                     >
//                       Save
//                     </Button>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </TabsContent>
//       <TabsContent value="service-agreement" className="p-6">
//         <div className="space-y-6">
//           <h1 className="text-2xl font-bold">Service Agreement Details</h1>
//         </div>
//       </TabsContent>
//       <TabsContent value="Memos" className="p-6">
//         <div className="space-y-6">
//           <MemoApp id={id} />
//         </div>
//       </TabsContent>
//       <TabsContent value="Projects" className="p-6">
//         <div className="space-y-6">
//           <AdminProject id={id} />
//         </div>
//       </TabsContent>
//       <TabsContent value="Checklist" className="p-6">
//         <ChecklistHistory id={id} items={[[], []]} />
//       </TabsContent>
//     </Tabs>
//   );
// };

// export default SgCompdetail;
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { fetchUsers, getSgIncorpoDataById, updateEditValues } from "@/services/dataFetch";
import { paymentApi } from "@/lib/api/payment";
import { useToast } from "@/hooks/use-toast";

import { sgFormWithResetAtom, SgFormData } from "../Singapore/SgState";
import { SessionData } from "./HkCompdetail"; // reusing type

// UI (shadcn)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Building2, Banknote, ReceiptText, ShieldCheck, Mail, Phone, Pencil, X, Save } from "lucide-react";

import MemoApp from "./MemosHK";
import TodoApp from "@/pages/Todo/TodoApp";
import AdminProject from "@/pages/dashboard/Admin/Projects/AdminProject";
import ChecklistHistory from "@/pages/Checklist/ChecklistHistory";
import { User } from "@/components/userList/UsersList";

// ---------- tiny local helpers ----------
const fmtDate = (iso?: string) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

const FallbackAvatar: React.FC<{ name?: string | null }> = ({ name }) => {
  const initials = (name || "")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
      {initials || "?"}
    </div>
  );
};

const LabelValue: React.FC<{ label: string; children?: React.ReactNode }> = ({ label, children }) => (
  <div className="grid gap-1">
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="text-sm">{children ?? "—"}</div>
  </div>
);

// normalize “object or string” values like {id, value}
const renderVal = (d: any) =>
  typeof d === "object" && d !== null ? d?.value ?? d?.id ?? "—" : d ?? "—";

const BoolPill: React.FC<{ value?: boolean }> = ({ value }) => (
  <Badge variant={value ? "default" : "outline"} className={!value ? "text-muted-foreground" : ""}>
    {value ? "YES" : "NO"}
  </Badge>
);

// ---------- Component ----------
const SgCompdetail: React.FC<{ id: string }> = ({ id }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useAtom(sgFormWithResetAtom);
  const [users, setUsers] = useState<User[]>([]);
  const [adminAssigned, setAdminAssigned] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [session, setSession] = useState<SessionData>({
    _id: "",
    amount: 0,
    currency: "",
    expiresAt: "",
    status: "",
    paymentId: "",
  });

  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null;
  const isAdmin = user?.role !== "user";

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

  useEffect(() => {
    const bootstrap = async () => {
      const data = await getSgIncorpoDataById(`${id}`);
      setForm(data);
      setAdminAssigned(data.assignedTo || "");

      if (data.sessionId) {
        const s = await paymentApi.getSession(data.sessionId);
        setSession({
          _id: s._id,
          amount: s.amount,
          currency: s.currency,
          expiresAt: s.expiresAt,
          status: s.status,
          paymentId: s.paymentId,
        });
      }

      const u = await fetchUsers();
      setUsers(u.filter((e: { role: string }) => e.role === "admin" || e.role === "master"));
    };
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // patch helpers
  const patchForm = (key: keyof SgFormData, value: any) => setForm({ ...form, [key]: value });
  const patchSession = (key: keyof SessionData, value: any) => setSession({ ...session, [key]: value });

  // assign admin
  const AssignAdmin: React.FC = () => (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium">Assign Admin:</span>
      <Select value={adminAssigned} onValueChange={setAdminAssigned}>
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

  const onSave = async () => {
    try {
      setIsSaving(true);
      const payload = JSON.stringify({
        company: {
          id: form._id,
          status: form.status,
          isDisabled: form.isDisabled,
          incorporationDate: form.incorporationDate,
          country: "SG",
          companyName: form.companyName,
        },
        session: {
          id: session._id,
          expiresAt: session.expiresAt,
          status: session.status,
        },
        assignedTo: adminAssigned,
      });

      const resp = await updateEditValues(payload);
      if (resp?.success) {
        toast({ description: "Record updated successfully" });
      } else {
        toast({ description: "Update failed. Please try again.", variant: "destructive" });
      }
    } catch (e: any) {
      toast({ description: e?.message || "Unexpected error", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  // deriveds & schema-aligned fields
  const primaryName = form?.companyName?.[0] || form?.name || form?.companyName?.find(Boolean) || "";
  const altNames = (form?.companyName || []).slice(1, 3).filter(Boolean);
  const contactName = form?.designatedContactPerson || form?.designatedContact || form?.name || "";
  const email = form?.email || "";
  const phone = form?.phoneNum || "";
  const currentStatus = form?.status || "Pending";

  const industries = (form?.selectedIndustry || []) as string[];
  const purposes = (form?.establishmentPurpose || []) as string[];
  const bizDesc = form?.productDescription || form?.businessDescription || "";
  const annualRenewalTermsText = t(renderVal(form?.annualRenewalTermsAgreement)); // <-- required field

  return (
    <Tabs defaultValue="details" className="flex flex-col w-full mx-auto">
      <TabsList className="flex w-full p-1 bg-background/80 rounded-t-lg border-b">
        <TabsTrigger value="details" className="flex-1 py-3 text-md font-medium rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
          Company Details
        </TabsTrigger>
        <TabsTrigger value="service-agreement" className="flex-1 py-3 text-md font-medium rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
          Record of Documents
        </TabsTrigger>
        {isAdmin && (
          <TabsTrigger value="Memos" className="flex-1 py-3 text-md font-medium rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
            Memo
          </TabsTrigger>
        )}
        {isAdmin && (
          <TabsTrigger value="Projects" className="flex-1 py-3 text-md font-medium rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
            Project
          </TabsTrigger>
        )}
        <TabsTrigger value="Checklist" className="flex-1 py-3 text-md font-medium rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
          Checklist
        </TabsTrigger>
      </TabsList>

      {/* DETAILS */}
      <TabsContent value="details" className="p-4 md:p-6">
        {primaryName && <TodoApp id={id} name={primaryName} />}

        <div className="flex gap-x-8 mt-4">
          {isAdmin && <AssignAdmin />}
          <Button onClick={() => navigate(`/company-documents/SG/${id}`)} size="sm" className="flex items-center gap-2">
            Company Docs
          </Button>
        </div>

        <div className="mx-auto grid max-w-7xl gap-6 p-4 lg:grid-cols-3 pb-24">
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
                            value={primaryName}
                            onChange={(e) => {
                              const next = [...(form.companyName || [])];
                              if (next.length === 0) next.push("");
                              next[0] = e.target.value;
                              patchForm("companyName", next);
                            }}
                            className="h-8 text-base"
                            placeholder="Company Name"
                          />
                        ) : (
                          <CardTitle className="text-xl truncate">{primaryName || "Untitled Company"}</CardTitle>
                        )}

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="text-muted-foreground">
                            Singapore • SG
                          </Badge>

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Incorporation Status</span>

                            {isAdmin ? (
                              <Select
                                value={currentStatus}
                                onValueChange={(val) => patchForm("status", val as any)}
                              >
                                <SelectTrigger className="h-7 w-[240px]">
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
                              <Badge variant="default">{currentStatus}</Badge>
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
                {/* Basic info */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <LabelValue label="Applicant">
                    <div className="flex items-center gap-2">
                      <FallbackAvatar name={contactName} />
                      <span className="font-medium">{contactName || "—"}</span>
                    </div>
                  </LabelValue>

                  <LabelValue label="Contact">
                    <div className="grid gap-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5" />
                        <span className="text-sm">{email || "—"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5" />
                        <span className="text-sm">{phone || "—"}</span>
                      </div>
                    </div>
                  </LabelValue>

                  <LabelValue label="Alt / Local Names">
                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-2">
                        {[1, 2].map((idx) => (
                          <Input
                            key={idx}
                            value={altNames[idx - 1] || ""}
                            onChange={(e) => {
                              const next = [...(form.companyName || [])];
                              while (next.length < 3) next.push("");
                              next[idx] = e.target.value;
                              patchForm("companyName", next);
                            }}
                            placeholder={`Name ${idx + 1}`}
                            className="h-8"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {altNames.length ? (
                          altNames.map((n, i) => (
                            <Badge key={String(n) + i} variant="secondary">
                              {n}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                    )}
                  </LabelValue>

                  <LabelValue label="Relationships">
                    {(form.establishedRelationshipType || []).length ? (
                      <div className="flex flex-wrap gap-2">
                        {form.establishedRelationshipType!.map((r, i) => (
                          <Badge key={r + i} variant="outline">
                            {r}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      "—"
                    )}
                  </LabelValue>

                  {/* SCHEMA-ALIGNED FIELDS */}
                  <LabelValue label="Industry">
                    {industries.length ? (
                      <div className="flex flex-wrap gap-2">
                        {industries.map((it, i) => (
                          <Badge key={it + i} variant="secondary">
                            {it}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      "—"
                    )}
                  </LabelValue>

                  <LabelValue label="Purpose">
                    {purposes.length ? (
                      <div className="flex flex-wrap gap-2">
                        {purposes.map((p, i) => (
                          <Badge key={p + i} variant="secondary">
                            {p}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      "—"
                    )}
                  </LabelValue>

                  <LabelValue label="Business Description">{bizDesc || "—"}</LabelValue>

                  {/* >>>>>>> ADDED: Annual Renewal Terms (translated) */}
                  <LabelValue label="Annual Renewal Terms">
                    {annualRenewalTermsText || "—"}
                  </LabelValue>
                  {/* <<<<<<< */}

                </div>

                <Separator />

                {/* Shareholders / Directors (using sample schema keys) */}
                <div className="space-y-3">
                  <div className="text-sm font-medium">Shareholding & Parties</div>
                  {Array.isArray(form?.shareHolders) && form.shareHolders.length ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[32%]">Shareholder</TableHead>
                            <TableHead className="w-[20%]">Email</TableHead>
                            <TableHead className="w-[16%]">Phone</TableHead>
                            <TableHead className="w-[16%]">Ownership</TableHead>
                            <TableHead className="w-[16%]">Legal Entity</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {form.shareHolders.map((p: any, i: number) => (
                            <TableRow key={(p?.email || p?.name || "sh") + i}>
                              <TableCell className="font-medium">{p?.name || "—"}</TableCell>
                              <TableCell>{p?.email || "—"}</TableCell>
                              <TableCell>{p?.phone || "—"}</TableCell>
                              <TableCell>
                                {typeof p?.ownerShipRate === "number"
                                  ? `${p.ownerShipRate}%`
                                  : typeof p?.ownershipRate === "number"
                                  ? `${p.ownershipRate}%`
                                  : "—"}
                              </TableCell>
                              <TableCell>
                                <Badge variant={renderVal(p?.legalEntity) === "Yes" ? "default" : "outline"}>
                                  {renderVal(p?.legalEntity) || "—"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">No parties added.</div>
                  )}
                </div>

                <Separator />

                {/* Dates & toggles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <LabelValue label="Incorporation Date">
                    <div className="flex items-center gap-2">
                      <span>{form?.incorporationDate ? fmtDate(form.incorporationDate) : "—"}</span>
                      {isAdmin && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">Edit</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Incorporation Date</DialogTitle>
                              <DialogDescription>Set the date when the company was officially registered.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-2">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="incorporationDate" className="text-right">Date</Label>
                                <Input
                                  id="incorporationDate"
                                  type="date"
                                  value={form?.incorporationDate ? form.incorporationDate.slice(0, 10) : ""}
                                  onChange={(e) => patchForm("incorporationDate", e.target.value)}
                                  className="col-span-3"
                                />
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </LabelValue>

                  <LabelValue label="AML/CDD Edit">
                    <div className="flex items-center gap-2">
                      <BoolPill value={!form?.isDisabled} />
                      {isAdmin && (
                        <Switch
                          checked={!form?.isDisabled}
                          onCheckedChange={(checked) => patchForm("isDisabled", !checked)}
                        />
                      )}
                    </div>
                  </LabelValue>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT */}
          <div className="grid gap-6">
            {/* Payment */}
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
                        {(form.payMethod || "").toUpperCase() || "—"}
                      </Badge>
                      {form.bankRef && (
                        <Badge variant="outline" className="gap-1">Ref: {form.bankRef}</Badge>
                      )}
                      {form.paymentStatus === "paid" && form.stripeLastStatus === "succeeded" && form.stripeReceiptUrl && (
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

                  {form.paymentStatus === "paid" &&
                  form.stripeLastStatus === "succeeded" &&
                  form.stripeReceiptUrl ? (
                    <div className="rounded-md border bg-emerald-50 p-4 text-emerald-800">
                      <div className="text-sm font-medium">Payment successful via Stripe.</div>
                      <a href={form.stripeReceiptUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center text-sm underline">
                        View Stripe Receipt
                      </a>
                    </div>
                  ) : form.uploadReceiptUrl ? (
                    <div className="space-y-3">
                      <a href={form.uploadReceiptUrl} target="_blank" rel="noreferrer" className="group relative block overflow-hidden rounded-md border">
                        <img src={form.uploadReceiptUrl} alt="Payment receipt" className="h-44 w-full object-cover transition-transform duration-200 group-hover:scale-[1.01]" />
                      </a>

                      {isAdmin && (
                        <div className="flex items-center gap-3">
                          <Label className="text-sm font-medium">Payment Status:</Label>
                          <Select value={form?.paymentStatus || "unpaid"} onValueChange={(val) => patchForm("paymentStatus", val as any)}>
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unpaid">Pending</SelectItem>
                              <SelectItem value="paid">Paid</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">No file uploaded</div>
                  )}
                </div>

                {/* Amount + Expiry */}
                <div className="grid gap-4 py-2">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Amount</Label>
                    <div className="col-span-3 text-sm font-medium">
                      {form.finalAmount ? `${form.finalAmount} USD` : session.amount ? `${session.amount} ${session.currency || "USD"}` : "—"}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="expiresAt" className="text-right">Expires</Label>
                    {isAdmin ? (
                      <Input
                        id="expiresAt"
                        type="date"
                        value={session.expiresAt ? session.expiresAt.slice(0, 10) : ""}
                        onChange={(e) => patchSession("expiresAt", e.target.value)}
                        className="col-span-3"
                      />
                    ) : (
                      <div className="col-span-3 text-sm">{session.expiresAt ? fmtDate(session.expiresAt) : "—"}</div>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Payment Status</Label>
                      <div className="col-span-3">
                        <Select value={session.status || ""} onValueChange={(val) => patchSession("status", val as any)}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {form.receiptUrl && (
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label className="text-right">Receipt</Label>
                      <div className="col-span-3">
                        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                          <SheetTrigger asChild>
                            <Button variant="outline" size="sm">View Receipt</Button>
                          </SheetTrigger>
                          <SheetContent side="right" className="w-full max-w-[40vw]" style={{ width: "40vw", maxWidth: "40vw" }}>
                            <SheetHeader>
                              <SheetTitle>Receipt</SheetTitle>
                            </SheetHeader>
                            <div className="mt-4 space-y-4">
                              <iframe src={form.receiptUrl} className="w-full h-[calc(100vh-200px)]" title="Receipt" />
                            </div>
                          </SheetContent>
                        </Sheet>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Compliance */}
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
                  <LabelValue label="Truthfulness"><BoolPill value={!!form.truthfulnessDeclaration} /></LabelValue>
                  <LabelValue label="Legal Terms"><BoolPill value={!!form.legalTermsAcknowledgment} /></LabelValue>
                  <LabelValue label="Compliance Precondition"><BoolPill value={!!form.compliancePreconditionAcknowledgment} /></LabelValue>
                  <LabelValue label="e-Sign">{form.eSign || "—"}</LabelValue>
                </div>

                <Separator />

                <div className="grid grid-cols-1 gap-3">
                  <div className="text-xs text-muted-foreground">Sanctions / Restrictions</div>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    {[
                      ["Legal or Ethical Concern(money laundering etc)", String(renderVal(form?.hasLegalEthicalIssues)).toLowerCase().includes("yes")],
                      ["Sanctioned Countries Activity (iran, sudan, NK, syria, cuba,belarus, zimbabwe", String(renderVal(form?.restrictedCountriesWithActivity)).toLowerCase().includes("yes")],
                      ["Sanctions Exposure (involved in above countries or under sanctions by  UN, EU, UKHMT, HKMA, OFAC,)", String(renderVal(form?.sanctionedTiesPresent)).toLowerCase().includes("yes")],
                      ["Crimea/Sevastopol Presence", String(renderVal(form?.businessInCrimea)).toLowerCase().includes("yes")],
                      ["Russian Energy Presence", String(renderVal(form?.involvedInRussianEnergyDefense)).toLowerCase().includes("yes")],
                    ].map(([label, flagged], i) => (
                      <div key={String(label) + i} className="flex items-center justify-between gap-3">
                        <span>{label as string}</span>
                        <Badge variant={flagged ? "destructive" : "outline"} className={!flagged ? "text-muted-foreground" : ""}>
                          {flagged ? "YES" : "NO"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <LabelValue label="Social App">{form?.sns || "—"}</LabelValue>
                  <LabelValue label="Handle / ID">{form?.snsId || form?.snsAccountId?.value || "—"}</LabelValue>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sticky save bar */}
          <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 p-3">
              <div className="text-xs text-muted-foreground">
                Status: <strong>{currentStatus}</strong>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={onSave}>
                  <Save className="mr-1 h-4 w-4" /> {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      {/* RECORD OF DOCS */}
      <TabsContent value="service-agreement" className="p-6">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Service Agreement Details</h1>
          {/* plug your documents component here */}
        </div>
      </TabsContent>

      {/* MEMOS */}
      <TabsContent value="Memos" className="p-6">
        <div className="space-y-6">
          <MemoApp id={id} />
        </div>
      </TabsContent>

      {/* PROJECTS */}
      <TabsContent value="Projects" className="p-6">
        <div className="space-y-6">
          <AdminProject id={id} />
        </div>
      </TabsContent>

      {/* CHECKLIST */}
      <TabsContent value="Checklist" className="p-6">
        <ChecklistHistory id={id} items={[[], []]} />
      </TabsContent>
    </Tabs>
  );
};

export default SgCompdetail;
