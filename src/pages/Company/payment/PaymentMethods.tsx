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

  <DialogContent
    className="w-[80vw] h-[80vh] max-w-none p-0 flex flex-col"
  >
    <DialogHeader className="p-4 border-b sticky top-0 bg-background z-10">
      <DialogTitle>{title}</DialogTitle>
    </DialogHeader>

    <div className="flex-1 overflow-y-auto p-4">
      {method === "card"  && (
        <StripePaymentForm
          sessionId={sessionId}
          clientSecret={clientSecret}
          amount={amount}
        />
      )}
      {method === "bank"  && <BankTransferMethod sessionId={sessionId} />}
      {method === "fps"   && <FPSForm />}
      {method === "other" && <ReceiptUpload sessionId={sessionId} />}
    </div>
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