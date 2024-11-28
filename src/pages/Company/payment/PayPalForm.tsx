// import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function PayPalForm() {
  const handlePayPalPayment = () => {
    // Here you would integrate with PayPal
    console.log('Processing PayPal payment');
  };

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            You will be redirected to PayPal to complete your payment securely.
          </p>
          <p className="text-sm text-muted-foreground">
            A 4.5% processing fee will be added to your total.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handlePayPalPayment} 
          className="w-full bg-[#0070ba] hover:bg-[#003087]"
        >
          Pay with PayPal
        </Button>
      </CardFooter>
    </Card>
  );
}