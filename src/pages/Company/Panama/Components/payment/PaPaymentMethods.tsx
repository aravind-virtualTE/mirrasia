import { Card, CardContent } from "@/components/ui/card";
import {
  CreditCard,
  Building2,
  CircleDollarSign,
  //   Smartphone,
  LucideIcon
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useEffect, useRef, useState } from "react";
import { paymentApi } from "@/lib/api/payment";
import { useTranslation } from "react-i18next";
import PaReceiptUpload from "./PaReceiptUpload.tsx";
import { PaBankTransferMethod } from "./PaBkTransferMethod.tsx";
import { PaStripePaymentForm } from "./PaStripe.tsx";

interface PaymentMethodProps {
  sessionId: string;
  amount: number;
  id: string
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
        {method === 'card' && <PaStripePaymentForm sessionId={sessionId} clientSecret={clientSecret} amount={amount} />}
        {method === 'bank' && <PaBankTransferMethod sessionId={sessionId} />}
        {/* {method === 'fps' && <FPSForm />} */}
        {method === 'other' && <PaReceiptUpload sessionId={sessionId} />}
      </DialogContent>
    </Dialog>
  )
};

export default function PaPaymentMethods({ sessionId, amount, id }: PaymentMethodProps) {
  const {t} = useTranslation()
  const [clientSecret, setClientSecret] = useState("")
  const hasFetchedRef = useRef(false);
  useEffect(() => {
    if (hasFetchedRef.current) return;
    const fetchClientSecret = async () => {
      try {
        const response = await paymentApi.createPaymentIntent(Math.ceil(amount * 1.035), "USD", sessionId, id)
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
          description={`${t('payment.cardDesc')} ${Math.ceil(amount * 1.035)}`}
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