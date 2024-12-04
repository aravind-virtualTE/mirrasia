import { Card, CardContent } from "@/components/ui/card";
import {
  CreditCard,
  Building2,
  CircleDollarSign,
  Smartphone, LucideIcon
} from 'lucide-react';
import { StripePaymentForm } from './CardPaymentForm';
// import { PayPalForm } from './PayPalForm';
import { FPSForm } from './FPSForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ReceiptUpload } from "./RecieptUpload";
import { BankTransferMethod } from "./methods/BankTransferMethod";
import { useEffect, useRef, useState } from "react";
import { paymentApi } from "@/lib/api/payment";

interface PaymentMethodProps {
  sessionId: string;
  amount: number
}

interface PaymentMethodCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  method: 'card' | 'paypal' | 'fps' | 'bank' | 'other';
  sessionId: string;
  clientSecret: string;
}
const PaymentMethodCard = ({
  icon: Icon,
  title,
  description,
  method,
  sessionId,
  clientSecret
}: PaymentMethodCardProps) => {

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors">
          <CardContent className="p-4 flex items-center space-x-4">
            <Icon className="w-6 text-primary" />
            <div>
              <p className="font-medium">{title}</p>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>        
        {method === 'card' && <StripePaymentForm sessionId={sessionId} clientSecret={clientSecret}  />}
        {method === 'bank' && <BankTransferMethod sessionId={sessionId} />}
        {method === 'fps' && <FPSForm />}
        {method === 'other' && <ReceiptUpload sessionId={sessionId} />}
      </DialogContent>
    </Dialog>
  )
};

export function PaymentMethods({ sessionId ,amount}: PaymentMethodProps) { 
   const [clientSecret, setClientSecret] = useState("")
  console.log("cleientSecret", clientSecret)
  // const [corpoInvoiceAtom] = useAtom(companyIncorporateInvoiceAtom);
  // const invoiceData = corpoInvoiceAtom[0] as unknown as InvoiceData;
  // const amount = parseFloat(invoiceData.totals.discounted.replace(/[^0-9.]/g, ''));
  const hasFetchedRef = useRef(false); 
  useEffect(() => {
    if (hasFetchedRef.current) return; 
    const fetchClientSecret = async () => {
      try {
        const response = await paymentApi.createPaymentIntent(Math.ceil(amount *1.035), "USD", sessionId,
          localStorage.getItem('companyRecordId')!)
        console.log("responsecompanyRecordId", response)
        setClientSecret(response.clientSecret)
        hasFetchedRef.current = true
      } catch (error) {
        console.log("error", error)
      }
    }
    fetchClientSecret()
  }, [])

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Payment Methods</h3>
      <div className="grid gap-4 md:grid-cols-2">        
          <PaymentMethodCard
            icon={CreditCard}
            title="Card Payment"
            description="Stripe Payments (3.5% Processing Fee)"
            method="card"
            sessionId={sessionId}
            clientSecret={clientSecret}
          />        
        <PaymentMethodCard
          icon={Building2}
          title="Bank Transfer"
          description="Direct bank transfer with receipt upload"
          method="bank"
          sessionId={sessionId}
          clientSecret={clientSecret}

        />
        <PaymentMethodCard
          icon={Smartphone}
          title="Fast Payment System (FPS)"
          description="Direct bank transfer via FPS"
          method="fps"
          sessionId={sessionId}
          clientSecret={clientSecret}

        />
        <PaymentMethodCard
          icon={CircleDollarSign}
          title="Other Method"
          description="Other(Cash Payment) with receipt upload"
          method="other"
          sessionId={sessionId}
          clientSecret={clientSecret}

        />
      </div>
    </div>
  );
}

// import { Elements } from "@stripe/react-stripe-js";
// import { useEffect, useState } from "react";
// import { paymentApi } from "@/lib/api/payment";
// import { loadStripe } from "@stripe/stripe-js";
// const stripePromise = loadStripe("pk_test_7mq52NQGEhPdQU2b6MF0cbke");
//  const [clientSecret, setClientSecret] = useState("")
  // console.log("cleientSecret", clientSecret)

  // useEffect(() => {

  //   const fetchClientSecret = async () => {
  //     try {
  //       const response = await paymentApi.createPaymentIntent(100, "USD", sessionId,
  //         localStorage.getItem('companyRecordId')!)
  //       console.log("responsecompanyRecordId", response)
  //       setClientSecret(response.client_secret)
  //     } catch (error) {
  //       console.log("error", error)
  //     }
  //   }
  //   if (clientSecret === "") fetchClientSecret()
  // }, [])


  {/* {method === 'paypal' && <PayPalForm />} */}
{/* <PaymentMethodCard
            icon={CircleDollarSign}
            title="PayPal"
            description="4.5% Processing Fee"
            method="paypal"
          /> */}