import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from "@/components/theme-provider";
import { Label } from "@/components/ui/label";
import { useAtom } from 'jotai';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from '@/components/ui/input';
import { switchServicesFormAtom } from './ssState';

const TransactionRelated: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Card>
      <CardContent>
        <div className='flex w-full p-4'>
          <aside className={`w-1/4 p-4 rounded-md shadow-sm ${theme === "light" ? "bg-blue-50 text-gray-800" : "bg-gray-800 text-gray-200"}`}>
            <h2 className="text-lg font-semibold mb-2">Trade Sanctions</h2>
            <p className="text-sm text-gray-500">
              This section is about whether there are transactions with countries subject to sanctions stipulated or recommended by FATF, UNGC, OFAC, etc.
            </p>
          </aside>
          <div className="w-3/4 ml-4">
            <CorporationForm />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionRelated;

const CorporationForm = () => {
  const [form, setForm] = useAtom(switchServicesFormAtom);

  const handleBankAccountChange = (value: string) => {
    setForm({
      ...form,
      transactionInfo: {
        ...form.transactionInfo,
        openedBankAccount: value
      }
    });
  };

  const handleOtherBankAccountChange = (value: string) => {
    setForm({
      ...form,
      transactionInfo: {
        ...form.transactionInfo,
        openedBankAccount: "other",
        openedBankAccountOther: value
      }
    });
  };

  const handleCryptoChange = (value: string) => {
    setForm({
      ...form,
      transactionInfo: {
        ...form.transactionInfo,
        involvedCrypto: value
      }
    });
  };

  const handleOtherCryptoChange = (value: string) => {
    setForm({
      ...form,
      transactionInfo: {
        ...form.transactionInfo,
        involvedCrypto: "other",
        involvedCryptoOther: value
      }
    });
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Label className="text-base font-medium">
              Did you open a bank account after establishing your corporation?{" "}
              <span className="text-red-500">*</span>
            </Label>

            <RadioGroup
              value={form.transactionInfo.openedBankAccount}
              onValueChange={handleBankAccountChange}
              className="space-y-3"
            >
              {["yes", "no"].map((val) => (
                <div key={val} className="flex items-center space-x-2">
                  <RadioGroupItem value={val} id={`bank-${val}`} />
                  <Label htmlFor={`bank-${val}`} className="font-normal">{val}</Label>
                </div>
              ))}
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="other" id="bank-other" className="mt-2" />
                <div className="space-y-1 w-full">
                  <Label htmlFor="bank-other" className="font-normal">Other:</Label>
                  <Input
                    value={form.transactionInfo.openedBankAccountOther}
                    onChange={(e) => handleOtherBankAccountChange(e.target.value)}
                    onClick={() => handleBankAccountChange("other")}
                    className="w-full"
                  />
                </div>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Label className="text-base font-medium">
              Have you engaged in cryptocurrency trading, investment, issuance, or other related activities since incorporation?{" "}
              <span className="text-red-500">*</span>
            </Label>

            <RadioGroup
              value={form.transactionInfo.involvedCrypto}
              onValueChange={handleCryptoChange}
              className="space-y-3"
            >
              {["yes", "no"].map((val) => (
                <div key={val} className="flex items-center space-x-2">
                  <RadioGroupItem value={val} id={`crypto-${val}`} />
                  <Label htmlFor={`crypto-${val}`} className="font-normal">{val}</Label>
                </div>
              ))}
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="other" id="crypto-other" className="mt-2" />
                <div className="space-y-1 w-full">
                  <Label htmlFor="crypto-other" className="font-normal">Other:</Label>
                  <Input
                    value={form.transactionInfo.involvedCryptoOther}
                    onChange={(e) => handleOtherCryptoChange(e.target.value)}
                    onClick={() => handleCryptoChange("other")}
                    className="w-full"
                  />
                </div>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
