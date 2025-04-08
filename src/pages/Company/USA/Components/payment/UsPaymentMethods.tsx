import { Card, CardContent } from "@/components/ui/card";
import {
  CreditCard,
  Building2,
  CircleDollarSign,
  //   Smartphone,
  LucideIcon
} from 'lucide-react';
import { UsStripePaymentForm } from './UsStripeMethod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import UsReceiptUpload from "./UsRecieptUpload"
import { UsBankTransferMethod } from "./UsBankTransferMethod";
import { useEffect, useRef, useState } from "react";
import { paymentApi } from "@/lib/api/payment";

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
        {method === 'card' && <UsStripePaymentForm sessionId={sessionId} clientSecret={clientSecret} amount={amount} />}
        {method === 'bank' && <UsBankTransferMethod sessionId={sessionId} />}
        {/* {method === 'fps' && <FPSForm />} */}
        {method === 'other' && <UsReceiptUpload sessionId={sessionId} />}
      </DialogContent>
    </Dialog>
  )
};

export function PaymentMethods({ sessionId, amount, id }: PaymentMethodProps) {
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
      <h3 className="font-semibold text-lg">Payment Methods</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <PaymentMethodCard
          icon={CreditCard}
          title="Card Payment"
          description={`Stripe Payments (3.5% Processing Fee) ${Math.ceil(amount * 1.035)}`}
          method="card"
          sessionId={sessionId}
          clientSecret={clientSecret}
          amount={amount}
        />
        <PaymentMethodCard
          icon={Building2}
          title="Bank Transfer"
          description="Direct bank transfer with receipt upload"
          method="bank"
          sessionId={sessionId}
          clientSecret={clientSecret}
          amount={amount}
        />
        {/* <PaymentMethodCard
          icon={Smartphone}
          title="Fast Payment System (FPS)"
          description="Direct bank transfer via FPS"
          method="fps"
          sessionId={sessionId}
          clientSecret={clientSecret}
          amount={amount}
        /> */}
        <PaymentMethodCard
          icon={CircleDollarSign}
          title="Other Method"
          description="Other(Cash Payment) with receipt upload"
          method="other"
          sessionId={sessionId}
          clientSecret={clientSecret}
          amount={amount}
        />
      </div>
    </div>
  );
}