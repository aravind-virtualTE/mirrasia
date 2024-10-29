import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LightbulbIcon, 
    // Mail, Building2, ScrollText, BadgeDollarSign, Users, FileText, Gift, CreditCard, HelpCircle 
} from 'lucide-react';
import Layout from '@/components/Layout';

const CompanyRegistration = () => {
  const steps = [
    { number: 1, label: 'Company\ninformation', active: true },
    { number: 2, label: 'Company address', active: false },
    { number: 3, label: 'Directors and\nshareholders', active: false },
    { number: 4, label: 'Accounting', active: false },
    { number: 5, label: 'Payment', active: false },
  ];

//   const sidebarItems = [
//     { icon: <Building2 className="w-5 h-5" />, label: 'Company Info' },
//     { icon: <Mail className="w-5 h-5" />, label: 'Mailroom' },
//     { icon: <ScrollText className="w-5 h-5" />, label: 'Mirr AsiaSign' },
//     { icon: <Users className="w-5 h-5" />, label: 'Company Secretary' },
//     { icon: <BadgeDollarSign className="w-5 h-5" />, label: 'Accounting' },
//     { icon: <FileText className="w-5 h-5" />, label: 'Requests' },
//     { icon: <Gift className="w-5 h-5" />, label: 'Perks' },
//     { icon: <CreditCard className="w-5 h-5" />, label: 'Billings & Subscriptions' },
//     { icon: <HelpCircle className="w-5 h-5" />, label: 'Support' },
//   ];

  return (
    <Layout>
        <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        {/* <div className="w-64 bg-white border-r">
            <div className="p-4 border-b">
            <div className="text-blue-600 font-semibold">DRAFT COMPANY</div>
            <div className="text-xs text-gray-500">IN PROGRESS</div>
            </div>

            <nav className="p-4">
            {sidebarItems.map((item, index) => (
                <div
                key={index}
                className={`flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer ${
                    index === 0 ? 'bg-gray-100' : ''
                }`}
                >
                {item.icon}
                <span className="text-sm text-gray-600">{item.label}</span>
                </div>
            ))}
            </nav>

            <div className="p-4 m-4 bg-blue-50 rounded-lg">
            <div className="text-sm">Need to sign a contract?</div>
            <button className="text-blue-600 text-sm font-medium mt-1">Use Mirr AsiaSign →</button>
            </div>
        </div> */}

        {/* Main Content */}
        <div className="flex-1 p-8">
            {/* Progress Steps */}
            <div className="flex justify-center mb-12">
            {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                <div className="flex flex-col items-center">
                    <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                    >
                    {step.number}
                    </div>
                    <div className="text-xs text-center mt-2 whitespace-pre-line">{step.label}</div>
                </div>
                {index < steps.length - 1 && (
                    <div className="w-32 h-px bg-gray-200 mx-2 mt-4" />
                )}
                </div>
            ))}
            </div>

            <h1 className="text-2xl font-bold mb-8">Let's get started</h1>

            {/* Good to know card */}
            <Card className="mb-8 bg-blue-50 border-0">
            <CardContent className="p-6 flex items-start space-x-4">
                <LightbulbIcon className="w-6 h-6 text-blue-600" />
                <div>
                <h3 className="font-semibold mb-2">Good to know</h3>
                <p className="text-sm text-gray-600">
                    Enter different variations of your company name in order of preference. Mirr Asia will help you obtain final confirmation prior to incorporation.
                </p>
                </div>
            </CardContent>
            </Card>

            {/* Company name checker */}
            <div className="mb-8">
            <h3 className="font-semibold mb-4">Company name checker</h3>
            <div className="flex space-x-4">
                <Input placeholder="Company Name - First Choice" className="flex-1" />
                <Input value="PTE. LTD." className="w-24" readOnly />
                <Button className="bg-blue-600">CHECK</Button>
            </div>
            </div>

            {/* Classify your company */}
            <div>
            <h3 className="font-semibold mb-4">Classify your company</h3>
            <p className="text-sm text-gray-600 mb-4">
                To incorporate in Singapore, you need to select a Singapore Standard Industrial Classification (SSIC) code for your business.
            </p>
            <div className="space-y-4">
                <Select>
                <SelectTrigger>
                    <SelectValue placeholder="SSIC - Company Activity" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                </SelectContent>
                </Select>

                <Select>
                <SelectTrigger>
                    <SelectValue placeholder="SSIC - Secondary Company Activity" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                </SelectContent>
                </Select>

                <Textarea placeholder="Please describe your business activity." className="h-32" />
            </div>
            
            <div className="mt-4">
                <a href="#" className="text-blue-600 text-sm">Here's a quick guide›</a>
            </div>
            </div>
        </div>
        </div>
    </Layout>
  );
};

export default CompanyRegistration;