import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from "@/components/theme-provider";
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from "@/components/ui/label";
import { useAtom } from 'jotai';
import { switchServicesFormAtom } from './ssState';

const industryOptions = [
  'Trade',
  'Wholesale/Retail Distribution',
  'Consulting/Advisory',
  'Manufacturing',
  'Finance/Investment',
  'Online Services',
  'Online direct purchase/delivery agency/purchase agency',
  'IT and Software Development',
  'Cryptocurrency/Blockchain related (ICO exchange, wallet service, etc.)',
  'Real Estate Investment/Development',
  'Government related business',
  'Development/transaction/trade of energy/resources/raw materials, etc.',
  'Other',
];

const businessPurposeOptions = [
  'Business expansion into Hong Kong and Greater China',
  'Asset management by investing in real estate or financial assets',
  'As a holding company, the purpose is to invest in and manage subsidiaries or affiliates',
  'Investors or business partners propose the establishment of a Hong Kong Corporation',
  'Geographic requirements for international trade',
  'Pursuing business diversification due to relaxed regulations',
  'Pursuing Competitive Advantage through Free Financial Policy',
  'Increased trading volume due to low tax rates and non-VAT',
  'Pursuing investment profits with no capital gains tax',
  'Other',
];

const BusinessInformation: React.FC = () => {
  const { theme } = useTheme();
  return (
    <Card>
      <CardContent>
        <div className='flex w-full p-4'>
          <aside
            className={`w-1/4 p-4 rounded-md shadow-sm ${
              theme === "light"
                ? "bg-blue-50 text-gray-800"
                : "bg-gray-800 text-gray-200"
            }`}
          >
            <h2 className="text-lg font-semibold mb-2">
              Business Information
            </h2>
            <p className="text-sm text-gray-500">
              This section collects details about your business activities, industry, and strategic intent.
            </p>
          </aside>
          <div className="w-3/4 ml-4">
            <IndustryForm />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const IndustryForm: React.FC = () => {
  const [form, setForm] = useAtom(switchServicesFormAtom);

  const toggleCheckbox = (listKey: 'industry' | 'businessPurpose', value: string) => {
    const updatedList = form[listKey].includes(value)
      ? form[listKey].filter((v: string) => v !== value)
      : [...form[listKey], value];
    setForm({ ...form, [listKey]: updatedList });
  };

  return (
    <div className="space-y-4 w-full max-w-3xl mx-auto">
      {/* Industry Section */}
      <Card className="border border-red-200">
        <CardContent className="pt-6 space-y-4">
          <Label className="font-medium">Industry <span className="text-red-500">*</span></Label>
          {industryOptions.map((industry) => (
            <div key={industry} className="flex items-center space-x-2">
              <Checkbox
                id={`industry-${industry}`}
                checked={form.industry.includes(industry)}
                onCheckedChange={() => toggleCheckbox('industry', industry)}
              />
              <Label htmlFor={`industry-${industry}`} className="text-sm font-normal">
                {industry}
              </Label>
            </div>
          ))}
          {form.industry.includes('Other') && (
            <Textarea
              className="min-h-24"
              placeholder="Please specify other industry"
              value={form.otherIndustryText}
              onChange={(e) => setForm({ ...form, otherIndustryText: e.target.value })}
            />
          )}
        </CardContent>
      </Card>

      {/* Product/Service Description */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <Label className="font-medium">
            Description of the product name, product type, service content, service type, etc. to be traded
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Textarea
            placeholder="Describe your product/service"
            className="min-h-24"
            value={form.productServiceDescription}
            onChange={(e) => setForm({ ...form, productServiceDescription: e.target.value })}
          />
        </CardContent>
      </Card>

      {/* Business Purpose */}
      <Card className="border border-red-200">
        <CardContent className="pt-6 space-y-4">
          <Label className="font-medium">
            The purpose of the Hong Kong corporation's operation and the expected effects in the future
            <span className="text-red-500 ml-1">*</span>
          </Label>
          {businessPurposeOptions.map((purpose) => (
            <div key={purpose} className="flex items-center space-x-2">
              <Checkbox
                id={`purpose-${purpose}`}
                checked={form.businessPurpose.includes(purpose)}
                onCheckedChange={() => toggleCheckbox('businessPurpose', purpose)}
              />
              <Label htmlFor={`purpose-${purpose}`} className="text-sm font-normal">
                {purpose}
              </Label>
            </div>
          ))}
          {form.businessPurpose.includes('Other') && (
            <Textarea
              className="min-h-24"
              placeholder="Please specify other purpose"
              value={form.otherBusinessPurposeText}
              onChange={(e) => setForm({ ...form, otherBusinessPurposeText: e.target.value })}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessInformation;
