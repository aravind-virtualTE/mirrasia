import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, CircleDollarSign, Smartphone, LucideIcon } from 'lucide-react';
import { CardPaymentForm } from './CardPaymentForm';
import { PayPalForm } from './PayPalForm';
import { FPSForm } from './FPSForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface PaymentMethodCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  method: 'card' | 'paypal' | 'fps';
}

const PaymentMethodCard = ({ 
  icon: Icon, 
  title, 
  description, 
  method 
}: PaymentMethodCardProps) => (
  <Dialog>
    <DialogTrigger asChild>
      <Card className="bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors">
        <CardContent className="p-4 flex items-center space-x-4">
          <Icon className="h-6 w-6 text-primary" />
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
      {method === 'card' && <CardPaymentForm />}
      {method === 'paypal' && <PayPalForm />}
      {method === 'fps' && <FPSForm />}
    </DialogContent>
  </Dialog>
);

export function PaymentMethods() {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Payment Methods</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <PaymentMethodCard
          icon={CreditCard}
          title="Card Payment"
          description="Stripe Payments (3.5% Processing Fee)"
          method="card"
        />
        
        <PaymentMethodCard
          icon={CircleDollarSign}
          title="PayPal"
          description="4.5% Processing Fee"
          method="paypal"
        />

        <PaymentMethodCard
          icon={Smartphone}
          title="Fast Payment System (FPS)"
          description="Direct bank transfer via FPS"
          method="fps"
        />
      </div>
    </div>
  );
}