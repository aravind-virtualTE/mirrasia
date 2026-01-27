/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAtom } from 'jotai';
import { costaRicaFormAtom } from './costaState';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export const IncorporationStep = () => {
  const [formData, setFormData] = useAtom(costaRicaFormAtom);

  const updateField = (field: string, value: string) => {
    setFormData((prev:any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-xl font-semibold text-foreground">Incorporation Agreement</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Final agreement and declaration for your Costa Rica LLC incorporation.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Agreement & Declaration</h3>
          </div>

          <div className="bg-secondary/50 rounded-lg p-4 mb-6 text-sm">
            <p className="mb-2">By agreeing, you confirm that:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>You will provide all required documents and information for the business process</li>
              <li>All content in this application is true, complete, and accurate</li>
              <li>This application shall be interpreted in accordance with the laws of Costa Rica</li>
              <li>Courts of Costa Rica shall have exclusive jurisdiction</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label className="font-medium">
              Do you agree to the terms and conditions? <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={(formData.agreement as string) || ''}
              onValueChange={(value) => updateField('agreement', value)}
              className="space-y-2"
            >
              <div className="flex items-center gap-2.5 rounded-md border border-border px-3 py-2 hover:bg-secondary/50">
                <RadioGroupItem value="yes" id="agree-yes" />
                <Label htmlFor="agree-yes" className="font-normal cursor-pointer">Yes, I agree</Label>
              </div>
              <div className="flex items-center gap-2.5 rounded-md border border-border px-3 py-2 hover:bg-secondary/50">
                <RadioGroupItem value="no" id="agree-no" />
                <Label htmlFor="agree-no" className="font-normal cursor-pointer">No, I do not agree</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
