/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { FormData, FormStep as FormStepType } from './costaFormConfig';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Receipt, Check, RefreshCw } from 'lucide-react';
import { FormFieldComponent } from './FormField';
import { convertUsdToHkd } from '@/services/exchangeRate';

const BASE_SETUP_FEE = 4500;
const NOMINEE_FEE = 2500;
const ANNUAL_FEE = 3600;

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'HKD', label: 'HKD - Hong Kong Dollar' },
];

interface InvoiceStepProps {
  step: FormStepType;
  formData: FormData;
  onFieldChange: (fieldId: string, value: string | string[] | boolean | number) => void;
  setFormData?: (fn: (prev: Record<string, any>) => Record<string, any>) => void;
}

export const InvoiceStep = ({ step, formData, onFieldChange, setFormData }: InvoiceStepProps) => {
  // Calculate USD total
  const usdTotal = BASE_SETUP_FEE +
    (formData.directorNominee ? NOMINEE_FEE : 0) +
    (formData.shareholderNominee ? NOMINEE_FEE : 0);

  // Currency state
  const [selectedCurrency, setSelectedCurrency] = useState<string>(
    (formData as any).paymentCurrency || 'USD'
  );
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  // Convert to HKD when currency changes or total changes
  useEffect(() => {
    const convertAmount = async () => {
      if (selectedCurrency === 'HKD') {
        setIsConverting(true);
        try {
          const { hkdAmount, rate } = await convertUsdToHkd(usdTotal);
          setConvertedAmount(hkdAmount);
          setExchangeRate(rate);
          // Persist to formData
          if (setFormData) {
            setFormData((prev) => ({
              ...prev,
              paymentCurrency: 'HKD',
              exchangeRateUsed: rate,
              originalAmountUsd: usdTotal,
              convertedAmountHkd: hkdAmount,
            }));
          }
        } catch (err) {
          console.error('Exchange rate fetch failed:', err);
        } finally {
          setIsConverting(false);
        }
      } else {
        setConvertedAmount(null);
        setExchangeRate(null);
        if (setFormData) {
          setFormData((prev) => ({
            ...prev,
            paymentCurrency: 'USD',
            exchangeRateUsed: undefined,
            originalAmountUsd: undefined,
            convertedAmountHkd: undefined,
          }));
        }
      }
    };

    convertAmount();
  }, [selectedCurrency, usdTotal, setFormData]);

  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency);
  };

  // Display amount based on selected currency
  const displayAmount = selectedCurrency === 'HKD' && convertedAmount !== null
    ? convertedAmount
    : usdTotal;

  const displayCurrency = selectedCurrency;

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-xl font-semibold text-foreground">Invoice & Services</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Review the base package and select additional nominee services if needed.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Service Selection */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Base Package</CardTitle>
              <CardDescription>Standard Costa Rica LLC Incorporation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center p-4 bg-secondary/20 rounded-lg border border-border">
                <div className="space-y-1">
                  <div className="font-medium text-foreground">Company Formation Fee</div>
                  <div className="text-sm text-muted-foreground">Includes all government fees and initial registration</div>
                </div>
                <div className="font-semibold">${BASE_SETUP_FEE.toLocaleString()}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Optional Services</CardTitle>
              <CardDescription>Select nominee services if required</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {step.fields.map(field => (
                <div key={field.id} className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                  <FormFieldComponent
                    field={{
                      ...field,
                      type: 'checkbox'
                    }}
                    value={formData[field.id] ? ['true'] : []}
                    onChange={(val) => {
                      const isChecked = (val as string[]).includes('true');
                      onFieldChange(field.id, isChecked);
                    }}
                    formData={formData}
                    setFormData={setFormData}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Annual Fees</CardTitle>
              <CardDescription>Recurring costs starting next year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center p-4 bg-secondary/20 rounded-lg border border-border">
                <div className="space-y-1">
                  <div className="font-medium text-foreground">Annual Corporate Service</div>
                  <div className="text-sm text-muted-foreground">Registered office, agent, and maintenance</div>
                </div>
                <div className="font-semibold">${ANNUAL_FEE.toLocaleString()}/yr</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Receipt className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Order Summary</h3>
              </div>

              {/* Currency Selector */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b">
                <span className="text-sm text-muted-foreground">Payment Currency</span>
                <Select value={selectedCurrency} onValueChange={handleCurrencyChange}>
                  <SelectTrigger className="w-[140px] h-8">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Establishment Fee</span>
                  <span>${BASE_SETUP_FEE.toLocaleString()}</span>
                </div>
                {formData.directorNominee && (
                  <div className="flex justify-between text-foreground">
                    <span>Director Nominee</span>
                    <span>${NOMINEE_FEE.toLocaleString()}</span>
                  </div>
                )}
                {formData.shareholderNominee && (
                  <div className="flex justify-between text-foreground">
                    <span>Shareholder Nominee</span>
                    <span>${NOMINEE_FEE.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-end">
                  <span className="font-bold text-lg">Total</span>
                  <div className="text-right">
                    {isConverting ? (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Converting...</span>
                      </div>
                    ) : (
                      <>
                        <span className="font-bold text-2xl text-primary">
                          {displayCurrency} {displayAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        {selectedCurrency === 'HKD' && exchangeRate && (
                          <div className="text-xs text-muted-foreground">
                            (USD {usdTotal.toLocaleString()} × {exchangeRate.toFixed(4)})
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground text-right mt-1">
                  *Processing fees calculated at payment
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex gap-2 mt-4">
                <Check className="w-4 h-4 text-green-600 mt-0.5" />
                <div className="text-xs text-green-800">
                  <p className="font-medium">Transparent Pricing</p>
                  <p>No hidden fees. What you see is what you pay.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div >
  );
};
