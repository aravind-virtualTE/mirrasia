import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Copy } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { ReceiptUpload } from "../RecieptUpload";

interface BankTransferMethodProps {
    sessionId: string;
  }

export function BankTransferMethod({ sessionId }: BankTransferMethodProps) {
  const { toast } = useToast();
  const bankDetails = {
    bankName: 'HSBC',
    accountNo: '817 245681 838',
    beneficiaryName: 'MIRR ASIA BUSINESS ADVISORY & SECRETARIAL COMPANY LIMITED',
    address: "1 Queen's Road, Central, Hong Kong",
    bankCode: '004',
    swiftHKD: 'HSBCHKHHHKH',
    swiftOther: 'HSBCHKHHXXX'
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  return (
    <Tabs defaultValue="details">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="details">Bank Details</TabsTrigger>
        <TabsTrigger value="upload">Upload Receipt</TabsTrigger>
      </TabsList>
      
      <TabsContent value="details">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {bankDetails.bankName}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries({
              'Account No': bankDetails.accountNo,
              'Beneficiary': bankDetails.beneficiaryName,
              'Bank Address': bankDetails.address,
              'Bank Code': bankDetails.bankCode,
              'Swift Code (HKD)': bankDetails.swiftHKD,
              'Swift Code (Others)': bankDetails.swiftOther
            }).map(([label, value]) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{label}:</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{value}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(value, label)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            <p className="text-sm text-muted-foreground mt-4">
              Note: All bank charges are borne by the remitter
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="upload">
        <ReceiptUpload sessionId={sessionId}/>
      </TabsContent>
    </Tabs>
  );
}