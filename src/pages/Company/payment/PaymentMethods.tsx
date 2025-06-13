import { Card, CardContent } from "@/components/ui/card";
import {
  CreditCard,
  Building2,
  CircleDollarSign,
  Smartphone, LucideIcon
} from 'lucide-react';
import { StripePaymentForm } from './CardPaymentForm';
import { FPSForm } from './FPSForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ReceiptUpload } from "./RecieptUpload";
import { BankTransferMethod } from "./methods/BankTransferMethod";
import { useEffect, useRef, useState } from "react";
import { paymentApi } from "@/lib/api/payment";
import { useTranslation } from "react-i18next";

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
  amount: number
}
const PaymentMethodCard = ({
  icon: Icon,
  title,
  description,
  method,
  sessionId,
  clientSecret,
  amount
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>        
        {method === 'card' && <StripePaymentForm sessionId={sessionId} clientSecret={clientSecret} amount={amount}  />}
        {method === 'bank' && <BankTransferMethod sessionId={sessionId} />}
        {method === 'fps' && <FPSForm />}
        {method === 'other' && <ReceiptUpload sessionId={sessionId} />}
      </DialogContent>
    </Dialog>
  )
};

export function PaymentMethods({ sessionId ,amount}: PaymentMethodProps) { 
   const [clientSecret, setClientSecret] = useState("")
  const hasFetchedRef = useRef(false); 
  const { t } = useTranslation();

  useEffect(() => {
    if (hasFetchedRef.current) return; 
    const fetchClientSecret = async () => {
      try {
        const response = await paymentApi.createPaymentIntent(Math.ceil(amount *1.035), "USD", sessionId,
          localStorage.getItem('companyRecordId')!)
        setClientSecret(response.clientSecret)
        hasFetchedRef.current = true
      } catch (error) {
        console.log("error", error)
      }
    }
    fetchClientSecret()
  }, [clientSecret])

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">{t('payment.pMethods')}</h3>
      <div className="grid gap-4 md:grid-cols-2">
          <PaymentMethodCard
            icon={CreditCard}
            title={t('payment.cardPayment')}
            description={`${t('payment.cardDesc')} ${Math.ceil(amount *1.035)}`}
            method="card"
            sessionId={sessionId}
            clientSecret={clientSecret}
            amount={amount}
          />        
        <PaymentMethodCard
          icon={Building2}
          title={t('payment.bankTransfer')}
          description={t('payment.bankDesc')}
          method="bank"
          sessionId={sessionId}
          clientSecret={clientSecret}
          amount={amount}
        />
        <PaymentMethodCard
          icon={Smartphone}
          title={t('payment.fps')}
          description={t('payment.fpsDesc')}
          method="fps"
          sessionId={sessionId}
          clientSecret={clientSecret}
          amount={amount}
        />
        <PaymentMethodCard
          icon={CircleDollarSign}
          title={t('payment.other')}
          description={t('payment.otherDesc')}
          method="other"
          sessionId={sessionId}
          clientSecret={clientSecret}
          amount={amount}
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