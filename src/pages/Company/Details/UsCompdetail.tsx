import { fetchUsers, getUsIncorpoDataById, updateEditValues } from '@/services/dataFetch';
import { useAtom } from 'jotai';
import React, { useEffect, useMemo, useState } from 'react';
import { UsaFormData, usaFormWithResetAtom } from '../USA/UsState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SessionData } from './HkCompdetail';
import { paymentApi } from '@/lib/api/payment';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import MemoApp from './MemosHK';
import TodoApp from '@/pages/Todo/TodoApp';
import { User } from '@/components/userList/UsersList';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const UsCompdetail: React.FC<{ id: string }> = ({ id }) => {
    const {t} = useTranslation() 
  const [formData, setFormData] = useAtom(usaFormWithResetAtom);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [adminAssigned, setAdminAssigned] = useState('');
  const [session, setSession] = useState<SessionData>({
    _id: '',
    amount: 0,
    currency: '',
    expiresAt: '',
    status: '',
    paymentId: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    async function getUsData() {
      const data = await getUsIncorpoDataById(`${id}`);
      setAdminAssigned(data.assignedTo);

      if (data.sessionId !== '') {
        const session = await paymentApi.getSession(data.sessionId);
        const transformedSession: SessionData = {
          _id: session._id,
          amount: session.amount,
          currency: session.currency,
          expiresAt: session.expiresAt,
          status: session.status,
          paymentId: session.paymentId,
        };
        setSession(transformedSession);
      }

      const response = await fetchUsers();
      const filteredUsers = response.filter((e: { role: string }) => e.role === 'admin' || e.role === 'master');
      setUsers(filteredUsers);

      return data;
    }

    getUsData().then((result) => {
      setFormData(result);
    });
  }, []);

  // Helper function to render object values
  const renderValue = (data: any): string => {
    if (typeof data === 'object' && data !== null) {
      return data.value || data.id || 'N/A';
    }
    return data || 'N/A';
  };

  const generateSections = (formData: UsaFormData, session: SessionData) => {
    const sections = [];

    // Applicant Information Section
    sections.push({
      title: 'Applicant Information',
      data: {
        'Company Name': formData.companyName[0],
        'Applicant Name': formData.name,
        Email: formData.email,
        Phone: formData.phoneNum,
        Relationships: formData.establishedRelationshipType?.join(', ') || 'N/A',
        'SNS Account ID': renderValue(formData.snsAccountId.id),
        'SNS Account Number': renderValue(formData.snsAccountId.value),
      },
    });

    // Country Information Section
    sections.push({
      title: 'Country Information',
      data: {
        Country: 'United States',
        'Country Code': 'US',
        State: formData.selectedState,
        'Entity Type': formData.selectedEntity,
      },
    });

    // Business Information Section
    sections.push({
      title: 'Business Information',
      data: {
        'Sanctioned Countries': t(renderValue(formData.restrictedCountriesWithActivity)),
        'Sanctions Presence': t(renderValue(formData.sanctionedTiesPresent)),
        'Crimea Presence': t(renderValue(formData.businessInCrimea)),
        'Russian Business Presence': t(renderValue(formData.involvedInRussianEnergyDefense)),
        'Legal Assessment': t(renderValue(formData.hasLegalEthicalIssues)),
        'Annual Renewal Terms': t(renderValue(formData.annualRenewalTermsAgreement)),
      },
    });

    // Shareholder and Director Information Section
    if (formData.shareHolders) {
      const shareholderData = formData.shareHolders;
      console.log("shareholderDat", shareholderData)
      sections.push({
        title: 'Shareholder and Director Information',
        data: {
          'Designated Contact Person': formData.designatedContact,
          'Shareholders and Directors': (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Ownership Rate</TableHead>
                  <TableHead>Is Director</TableHead>
                  <TableHead>Is Legal Person</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(shareholderData) &&
                  shareholderData.map((shareholder, index) => (
                    <TableRow key={index}>
                      <TableCell>{shareholder.name}</TableCell>
                      <TableCell>{shareholder.email}</TableCell>
                      <TableCell>{shareholder.phone || 'N/A'}</TableCell>
                      <TableCell>{shareholder.ownerShipRate}%</TableCell>
                      <TableCell>{t(renderValue(shareholder.isDirector))}</TableCell>
                      <TableCell>{t(renderValue(shareholder.isLegalPerson))}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          ),
        },
      });
    }

    // Payment Information Section
    if (formData.sessionId && session) {
      sections.push({
        title: 'Payment Information',
        data: {
          Amount: session.amount,
          'Payment Status': session.status,
          'Payment Expire Date': new Date(session.expiresAt).toLocaleString(),
          Receipt: formData.receiptUrl ? 'Available' : 'Not available',
        },
      });
    }

    // Status Information Section
    sections.push({
      title: 'Status Information',
      data: {
        'Incorporation Status': formData.status,
        'Incorporation Date': formData.incorporationDate || 'N/A',
        'AML/CDD Edit': formData.isDisabled ? 'No' : 'Yes',
      },
    });

    return sections;
  };

  const sections = useMemo(() => {
    if (!formData) return [];
    return generateSections(formData, session);
  }, [formData, session]);

  const handleUpdate = async () => {
    const payload = JSON.stringify({
      company: {
        id: formData._id,
        status: formData.status,
        isDisabled: formData.isDisabled,
        incorporationDate: formData.incorporationDate,
        country: 'US',
      },
      session: {
        id: session._id,
        expiresAt: session.expiresAt,
        status: session.status,
      },
      assignedTo: adminAssigned,
    });

    const response = await updateEditValues(payload);
    if (response.success) {
      toast({ description: 'Record updated successfully' });
    }
  };

  const handleCompanyDataChange = (key: keyof UsaFormData, value: string | boolean) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSessionDataChange = (key: keyof SessionData, value: string) => {
    setSession({ ...session, [key]: value });
  };

  const IncorporationDateFrag = () => {
    let date = formData.incorporationDate;
    if (date !== null) {
      const [year, month, day] = date.split('T')[0].split('-');
      date = `${day}-${month}-${year}`;
    }
    return (
      <React.Fragment>
        <TableCell className="font-medium">Incorporation Date</TableCell>
        <TableCell>{date || 'Not set'}</TableCell>
        <TableCell>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Edit</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Incorporation Date</DialogTitle>
                <DialogDescription>
                  Set the incorporation date for the company. This is the date when the company was officially registered.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="incorporationDate" className="text-right">
                    Date
                  </Label>
                  <Input
                    id="incorporationDate"
                    type="date"
                    value={formData.incorporationDate || ''}
                    onChange={(e) =>
                      handleCompanyDataChange('incorporationDate', e.target.value)
                    }
                    className="col-span-3"
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TableCell>
      </React.Fragment>
    );
  };

  const CompanyIncorpoStatus = () => {
    const statusOptions = [
      'Pending',
      'KYC Verification',
      'Waiting for Payment',
      'Waiting for Documents',
      'Waiting for Incorporation',
      'Incorporation Completed',
      'Good Standing',
      'Renewal Processing',
      'Renewal Completed',
    ];
    return (
      <React.Fragment>
        <TableCell className="font-medium">InCorporation Status</TableCell>
        <TableCell>{formData.status}</TableCell>
        <TableCell>
          <Select
            value={formData.status}
            onValueChange={(value) => handleCompanyDataChange('status', value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TableCell>
      </React.Fragment>
    );
  };

  const AMLCDDEdit = () => (
    <React.Fragment>
      <TableCell className="font-medium">AML/CDD Edit</TableCell>
      <TableCell>{formData.isDisabled ? 'No' : 'Yes'}</TableCell>
      <TableCell>
        <Switch
          checked={!formData.isDisabled}
          onCheckedChange={(checked) => handleCompanyDataChange('isDisabled', !checked)}
        />
      </TableCell>
    </React.Fragment>
  );

  const PaymentStatus = () => {
    return (
      <React.Fragment>
        <TableCell className="font-medium">Payment Status</TableCell>
        <TableCell>{session.status}</TableCell>
        <TableCell>
          <Select
            value={session.status}
            onValueChange={(value) => handleSessionDataChange('status', value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </TableCell>
      </React.Fragment>
    );
  };

  const ExtendPaymentTimer = () => {
    return (
      <React.Fragment>
        <TableCell className="font-medium">Payment Expire Date</TableCell>
        <TableCell>{new Date(session.expiresAt).toLocaleString() || 'Not set'}</TableCell>
        <TableCell>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Edit</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Payment Expire Date</DialogTitle>
                <DialogDescription>
                  Extend the Payment Expire for the company Payment.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="expiresAt" className="text-right">
                    Date
                  </Label>
                  <Input
                    id="expiresAt"
                    type="date"
                    value={session.expiresAt || ''}
                    onChange={(e) => handleSessionDataChange('expiresAt', e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TableCell>
      </React.Fragment>
    );
  };

  const ReceietPaymentFrag = () => {
    return (
      <React.Fragment>
        <TableCell className="font-medium">Receipt</TableCell>
        <TableCell>{formData.receiptUrl ? 'Available' : 'Not available'}</TableCell>
        <TableCell>
          {formData.receiptUrl && (
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline">View Receipt</Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-full max-w-[40vw]"
                style={{ width: '40vw', maxWidth: '40vw' }}
              >
                <SheetHeader>
                  <SheetTitle>Receipt</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-4">
                  <iframe
                    src={formData.receiptUrl}
                    className="w-full h-[calc(100vh-200px)]"
                    title="Receipt"
                  />
                </div>
              </SheetContent>
            </Sheet>
          )}
        </TableCell>
      </React.Fragment>
    );
  };

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
    <Tabs defaultValue="details" className="flex flex-col w-full max-w-5xl mx-auto">
      <TabsList className="flex w-full p-1 bg-background/80 rounded-t-lg border-b">
        <TabsTrigger
          value="details"
          className="flex-1 py-3 text-sm font-medium transition-all rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
        >
          Company Details
        </TabsTrigger>
        <TabsTrigger
          value="service-agreement"
          className="flex-1 py-3 text-sm font-medium transition-all rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
        >
          Record of Documents
        </TabsTrigger>
        <TabsTrigger
          value="Memos"
          className="flex-1 py-3 text-sm font-medium transition-all rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
        >
          Memo
        </TabsTrigger>
      </TabsList>
      <TabsContent value="details" className="p-6">
        <div className="space-y-8">
          <h1 className="text-2xl font-bold">Company Details</h1>
          <TodoApp id={id} />
          <div className="flex gap-x-8">
            <AssignAdmin />
            <Button onClick={() => navigate(`/company-documents/US/${id}`)}>
              Company Docs
            </Button>
          </div>
          {sections.map((section) => (
            <Card key={section.title} className="mb-6 border rounded-lg overflow-hidden transition-all hover:shadow-md">
              <CardHeader className="bg-muted/50 py-4">
                <CardTitle className="text-lg font-medium">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b hover:bg-muted/30">
                      <TableHead className="w-1/3 py-3 px-4 text-sm font-medium">Field</TableHead>
                      <TableHead className="w-1/3 py-3 px-4 text-sm font-medium">Value</TableHead>
                      <TableHead className="w-1/5 py-3 px-4 text-sm font-medium">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(section.data).map(([key, value]) => {
                      if (key === 'Incorporation Date')
                        return <TableRow key={key} className="border-b hover:bg-muted/30"><IncorporationDateFrag /></TableRow>;
                      if (key === 'Incorporation Status')
                        return <TableRow key={key} className="border-b hover:bg-muted/30"><CompanyIncorpoStatus /></TableRow>;
                      if (key === 'Receipt')
                        return <TableRow key={key} className="border-b hover:bg-muted/30"><ReceietPaymentFrag /></TableRow>;
                      if (key === 'AML/CDD Edit')
                        return <TableRow key={key} className="border-b hover:bg-muted/30"><AMLCDDEdit /></TableRow>;
                      if (key === 'Payment Status')
                        return <TableRow key={key} className="border-b hover:bg-muted/30"><PaymentStatus /></TableRow>;
                      if (key === 'Payment Expire Date')
                        return <TableRow key={key} className="border-b hover:bg-muted/30"><ExtendPaymentTimer /></TableRow>;
                      return (
                        <TableRow key={key} className="border-b hover:bg-muted/30">
                          <TableCell className="py-3 px-4 font-medium">{key}</TableCell>
                          <TableCell className="py-3 px-4">{value}</TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {section.title === 'Status Information' && (
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
                )}
              </CardContent>
            </Card>
          ))}
        </div>
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
    </Tabs>
  );
};

export default UsCompdetail;