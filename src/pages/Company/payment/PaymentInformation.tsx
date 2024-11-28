import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BankDetails } from './BankDetails';
import { PaymentMethods } from './PaymentMethods';
import { PaymentConditions } from './PaymentConditions';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

export function PaymentInformation() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Payment Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <PaymentConditions />
          <Separator />
          <PaymentMethods />
          <Separator />
          <BankDetails />
          <Separator />
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="ml-2">
              All payments are NON-REFUNDABLE. The remitter bears all charges of payment, which includes the remittance amount, beneficiary bank's charges, as well as all the other banks' fees (intermediary bank, etc).
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}