import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Copy } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';

export function FPSMethod() {
  const { toast } = useToast();
  const fpsDetails = {
    proxyId: '9400086',
    email: 'biz.support@mirrasia.com',
    mobile: '90218363'
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>FPS Payment Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <div className="p-4 border-2 border-dashed rounded-lg">
            <QrCode className="w-32 h-32" />
            <p className="text-sm text-center mt-2">Scan QR Code</p>
          </div>
        </div>

        {Object.entries(fpsDetails).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground capitalize">{key}:</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">{value}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(value, key)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}