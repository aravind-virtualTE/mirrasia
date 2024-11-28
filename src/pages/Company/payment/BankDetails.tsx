// import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Building2 } from 'lucide-react';

export function BankDetails() {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Bank Transfer Details</h3>
      <Card className="bg-primary/5">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-primary" />
            <span className="font-medium">HSBC</span>
          </div>
          
          <div className="grid gap-2 text-sm">
            <div className="grid grid-cols-2 gap-1">
              <span className="text-muted-foreground">Account No:</span>
              <span>817 245681 838</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <span className="text-muted-foreground">Beneficiary Name:</span>
              <span>MIRR ASIA BUSINESS ADVISORY & SECRETARIAL COMPANY LIMITED</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <span className="text-muted-foreground">Bank Address:</span>
              <span>1 Queen's Road, Central, Hong Kong</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <span className="text-muted-foreground">Bank Code:</span>
              <span>004</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <span className="text-muted-foreground">Swift Code (HKD):</span>
              <span>HSBCHKHHHKH</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <span className="text-muted-foreground">Swift Code (USD/Others):</span>
              <span>HSBCHKHHXXX</span>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mt-4">
            Note: All bank charges are borne by the remitter
          </p>
        </CardContent>
      </Card>
    </div>
  );
}