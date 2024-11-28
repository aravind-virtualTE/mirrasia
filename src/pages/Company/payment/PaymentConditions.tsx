// import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

export function PaymentConditions() {
  return (
    <Card className="bg-primary/5">
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2">Payment Conditions</h3>
        <p className="text-primary">100% in advance</p>
      </CardContent>
    </Card>
  );
}