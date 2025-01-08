// import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Timer, AlertTriangle } from 'lucide-react';
import { usePaymentSession } from '@/hooks/usePaymentSession';

interface PaymentTimerProps {
  sessionId: string;
  // status: "pending" | "completed" | "expired";
}

export function PaymentTimer({ sessionId  }: PaymentTimerProps) {
  const { timeLeft, status } = usePaymentSession(sessionId);

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    return {
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0')
    };
  };

  const time = formatTime(timeLeft);
  // console.log("status",status)
  if (status === 'expired') {
    return (
      <Card className="bg-destructive/10">
        <CardContent className="p-4 flex items-center space-x-4">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          <div>
            <p className="font-medium text-destructive">Payment Session Expired</p>
            <p className="text-sm text-destructive/80">
              Please contact support to create a new payment session
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === "completed") {
    return (
      <Card className="bg-green-100">
        <CardContent className="p-4 flex items-center space-x-4">
          <Timer className="h-6 w-6 text-green-600" />
          <div>
            <p className="font-medium text-green-600">Payment Completed</p>
            <p className="text-sm text-green-500">Thank you for your payment!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-primary/5">
      <CardContent className="p-4 flex items-center space-x-4">
        <Timer className="h-6 w-6 text-primary" />
        <div>
          <p className="font-medium">Payment Timer</p>
          <p className="text-sm text-muted-foreground">
            Time remaining: {time.hours}:{time.minutes}:{time.seconds}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}