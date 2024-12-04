// import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

export function PaymentConditions() {
  return (
    <Card className="bg-primary/5">
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2">Payment Conditions</h3>
        <p className="text-primary">100% in advance</p>
        <p className="text-primary"> All payments are NON-REFUNDABLE. The remitter bears all charges of payment, which includes the remittance amount, beneficiary bank's charges, as well as all the other banks' fees (intermediary bank, etc).</p>       
      </CardContent>
    </Card>
  );
}