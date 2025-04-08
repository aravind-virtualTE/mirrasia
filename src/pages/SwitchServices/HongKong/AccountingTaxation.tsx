import React from 'react';
import { useAtom } from 'jotai';
import { switchServicesFormAtom } from './ssState'; 
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/components/theme-provider';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';

const RadioQuestion = ({
  label,
  description,
  value,
  onChange,
  options,
  otherValue,
  onOtherChange,
  idPrefix
}: {
  label: string;
  description?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; isOther?: boolean }[];
  otherValue?: string;
  onOtherChange?: (v: string) => void;
  idPrefix: string;
}) => (
  <Card>
    <CardContent className="pt-6 space-y-4">
      <div>
        <Label className="text-base font-medium">
          {label} {label.includes('*') ? '' : <span className="text-red-500">*</span>}
        </Label>
        {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
      </div>
      <RadioGroup value={value} onValueChange={onChange} className="space-y-3">
        {options.map((option, index) => (
          <div key={index} className="flex items-start space-x-2">
            <RadioGroupItem
              value={option.value}
              id={`${idPrefix}-${option.value}`}
              className={option.isOther ? 'mt-2' : ''}
            />
            {option.isOther ? (
              <div className="space-y-1 w-full">
                <Label htmlFor={`${idPrefix}-${option.value}`} className="font-normal">{option.label}</Label>
                <Input
                  value={value === 'other' ? otherValue : ''}
                  onChange={(e) => onOtherChange?.(e.target.value)}
                  onClick={() => onChange('other')}
                  className="w-full"
                />
              </div>
            ) : (
              <Label htmlFor={`${idPrefix}-${option.value}`} className="font-normal">{option.label}</Label>
            )}
          </div>
        ))}
      </RadioGroup>
    </CardContent>
  </Card>
);

const InputQuestion = ({
  label,
  value,
  onChange,
  placeholder = 'Your answer'
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => (
  <Card>
    <CardContent className="pt-6 space-y-4">
      <div>
        <Label className="text-base font-medium">{label}</Label>
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full" />
      </div>
    </CardContent>
  </Card>
);

const TaxFormQuestions: React.FC = () => {
  const [form, setForm] = useAtom(switchServicesFormAtom);

  const update = (key: string, value: string) => {
    setForm({...form, accountingTaxation: {...form.accountingTaxation, [key]: value}});   
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <RadioQuestion
        label="Fiscal year (financial year end date) of Hong Kong corporation"
        description="The accounting year can be freely determined within 18 months... (shortened)"
        value={form.accountingTaxation.fiscalYearAnswer}
        onChange={(v) => update('fiscalYearAnswer', v)}
        otherValue={form.accountingTaxation.otherFiscalYearAnswer}
        onOtherChange={(v) => update('otherFiscalYearAnswer', v)}
        idPrefix="fiscal-year"
        options={[
          { value: 'year-end-december', label: 'Year-end (December 31)' },
          { value: 'march-31', label: 'March 31' },
          { value: 'dont-know', label: "Don't know or undecided" },
          { value: 'other', label: 'Other:', isOther: true }
        ]}
      />

      <RadioQuestion
        label="When was your last tax return?"
        value={form.accountingTaxation.lastTaxReturnAnswer}
        onChange={(v) => update('lastTaxReturnAnswer', v)}
        otherValue={form.accountingTaxation.otherLastTaxReturnAnswer}
        onOtherChange={(v) => update('otherLastTaxReturnAnswer', v)}
        idPrefix="last-tax-return"
        options={[
          { value: 'none-yet', label: 'None yet' },
          { value: 'within-6-months', label: 'Within 6 months' },
          { value: '6-months-to-1-year', label: '6 months - 1 year' },
          { value: '1-year-to-2-years', label: '1 year - 2 years' },
          { value: 'dont-know', label: "I don't know" },
          { value: 'other', label: 'Other:', isOther: true }
        ]}
      />

      <RadioQuestion
        label="When was the last time you conducted an accounting audit?"
        value={form.accountingTaxation.lastAuditAnswer}
        onChange={(v) => update('lastAuditAnswer', v)}
        otherValue={form.accountingTaxation.otherLastAuditAnswer}
        onOtherChange={(v) => update('otherLastAuditAnswer', v)}
        idPrefix="last-audit"
        options={[
          { value: 'none-yet', label: 'None yet' },
          { value: 'within-6-months', label: 'Within 6 months' },
          { value: '6-months-to-1-year', label: '6 months - 1 year' },
          { value: '1-year-to-2-years', label: '1 year - 2 years' },
          { value: 'dont-know', label: "I don't know" },
          { value: 'other', label: 'Other:', isOther: true }
        ]}
      />

      <RadioQuestion
        label="Do you prepare your own accounting records in-house?"
        value={form.accountingTaxation.inHouseAccountingAnswer}
        onChange={(v) => update('inHouseAccountingAnswer', v)}
        otherValue={form.accountingTaxation.otherInHouseAccountingAnswer}
        onOtherChange={(v) => update('otherInHouseAccountingAnswer', v)}
        idPrefix="in-house-accounting"
        options={[
          { value: 'yes', label: 'Yes' },
          { value: 'mirasia-accounting', label: 'Use of Mirasia Accounting Service' },
          { value: 'other-companies', label: 'Use of other services' },
          { value: 'dont-know', label: "Don't know" },
          { value: 'other', label: 'Other:', isOther: true }
        ]}
      />

      <InputQuestion
        label="When is the accounting record prepared?"
        value={form.accountingTaxation.accountingRecordPreparedAnswer}
        onChange={(v) => update('accountingRecordPreparedAnswer', v)}
      />

      <RadioQuestion
        label="Are you considering implementing online accounting software Xero?"
        description="If you introduce Xero, you can import data created by POS..."
        value={form.accountingTaxation.xeroImplementationAnswer}
        onChange={(v) => update('xeroImplementationAnswer', v)}
        otherValue={form.accountingTaxation.otherXeroImplementationAnswer}
        onOtherChange={(v) => update('otherXeroImplementationAnswer', v)}
        idPrefix="xero-implementation"
        options={[
          { value: 'yes', label: 'Yes (HKD400/month)' },
          { value: 'no', label: 'No' },
          { value: 'recommendation-required', label: 'Recommendation required' },
          { value: 'other', label: 'Other:', isOther: true }
        ]}
      />

      <InputQuestion
        label="Do you currently use or plan to use a separate accounting software? (If yes, please describe)"
        value={form.accountingTaxation.separateAccountingSoftwareAnswer}
        onChange={(v) => update('separateAccountingSoftwareAnswer', v)}
      />
    </div>
  );
};

const AccountingTaxation: React.FC = () => {
  const { theme } = useTheme();
  return (
    <Card>
      <CardContent>
        <div className="flex w-full p-4">
          <aside
            className={`w-1/4 p-4 rounded-md shadow-sm ${
              theme === 'light' ? 'bg-blue-50 text-gray-800' : 'bg-gray-800 text-gray-200'
            }`}
          >
            <h2 className="text-lg font-semibold mb-2">Accounting and Taxation</h2>
            <p className="text-sm text-gray-500">
              This section is for providing information related to accounting and taxation.
            </p>
          </aside>
          <div className="w-3/4 ml-4">
            <TaxFormQuestions />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountingTaxation;
