// import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { QrCode, Copy } from 'lucide-react';
import { Button } from "@/components/ui/button";

export function FPSForm() {
  const fpsDetails = {
    proxyId: '9400086',
    email: 'biz.support@mirrasia.com',
    mobile: '90218363'
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Card>
      <CardContent className="pt-4 space-y-6">
        <div className="flex justify-center">
          <div className="p-4 border-2 border-dashed rounded-lg">
            <QrCode className="w-32 h-32" />
            <p className="text-sm text-center mt-2">Scan QR Code</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Proxy ID:</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">{fpsDetails.proxyId}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(fpsDetails.proxyId)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Email:</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">{fpsDetails.email}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(fpsDetails.email)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Mobile:</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">{fpsDetails.mobile}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(fpsDetails.mobile)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground text-center">
          After making the payment, please keep your payment receipt for reference.
        </p>
      </CardContent>
    </Card>
  );
}