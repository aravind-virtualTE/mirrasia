import { useEffect, 
  // useRef,
   useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PaymentMethods } from './PaymentMethods';
import { PaymentConditions } from './PaymentConditions';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PaymentTimer } from "./PaymentTimer";
import { paymentApi, type PaymentSession } from "@/lib/api/payment";
import { useAtom, useSetAtom } from "jotai";
import { companyIncorporateInvoiceAtom } from "@/services/state";
import { InvoiceData } from "../HongKong/Invoice";
import { companyIncorporationAtom, PaymentSessionId } from "@/lib/atom";

export function PaymentInformation() {
  const [sessionId, setSessionId] = useState<PaymentSession['id']>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [corpoInvoiceAtom] = useAtom(companyIncorporateInvoiceAtom);
  const invoiceData = corpoInvoiceAtom[0] as unknown as InvoiceData;
  const [finalForm,] = useAtom(companyIncorporationAtom);
  const updateCompanyData = useSetAtom(PaymentSessionId)

  // const hasFetchedData = useRef(false);
  const amount = parseFloat(invoiceData.totals.discounted.replace(/[^0-9.]/g, ''));
  useEffect(() => {
    const initializePaymentSession = async () => {
      try {
        setIsLoading(true);
        const docId = localStorage.getItem('companyRecordId');
        // creating the payment session in the backend
        const sessionData = await paymentApi.createSession(amount, 'USD', docId!); // Amount and currency as needed
        const session = sessionData.session._id;
        setSessionId(session);
        updateCompanyData(session)
      } catch (err) {
        setError('Failed to initialize payment session');
        console.error('Payment session initialization failed:', err);
      } finally {
        setIsLoading(false);
      }
    };
    const updateSession = async () => {
      try {
        setIsLoading(true);
        const sessionData = await paymentApi.updateSession(finalForm.sessionId, amount, 'USD');
        console.log("sessionData", sessionData)
      } catch (err) {
        console.error('Payment session update failed:', err);
        setError('Failed to update payment session');
      } finally {
        setIsLoading(false);
      }
    }
    if (finalForm.sessionId == "") {
      initializePaymentSession();
      // hasFetchedData.current = true;
    }
    else {
      console.log("finalForm.sessionId", finalForm.sessionId)
      if (finalForm.sessionId) {
        setSessionId(finalForm.sessionId)
        updateSession()
      }
    }
    setIsLoading(false);
  }, []);
  console.log("invoiceData", finalForm)
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  console.log(sessionId, "error", error)

  if (error || !sessionId) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Unable to initialize payment session'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // const handlePaymentCompleted = () => {
  //   setPaymentStatus("completed");
  // };


  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">      
     <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Payment Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <PaymentTimer sessionId={sessionId}
          // status={paymentStatus} 
          />
          <Separator />
          <PaymentMethods sessionId={sessionId}
            amount={amount}
          // onPaymentCompleted={handlePaymentCompleted} 
          />
          <Separator />
          <PaymentConditions />
          <Separator />
        </CardContent>
      </Card>
    </div>
  );
}


{/* <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="ml-2">
              All payments are NON-REFUNDABLE. The remitter bears all charges of payment, which includes the remittance amount, beneficiary bank's charges, as well as all the other banks' fees (intermediary bank, etc).
            </AlertDescription>
          </Alert> */}