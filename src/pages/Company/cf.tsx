import { useState } from 'react';
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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { LightbulbIcon, Mail, Building2, ScrollText, BadgeDollarSign, Users, FileText, Gift, CreditCard, HelpCircle } from 'lucide-react';

const CompanyRegistration2 = () => {
    const [currentSection, setCurrentSection] = useState(1);

    const steps = [
        { number: 1, label: 'Company\ninformation', active: currentSection === 1 },
        { number: 2, label: 'Company address', active: currentSection === 2 },
        { number: 3, label: 'Directors and\nshareholders', active: currentSection === 3 },
        { number: 4, label: 'Accounting', active: currentSection === 4 },
        { number: 5, label: 'Payment', active: currentSection === 5 },
    ];

    const sidebarItems = [
        { icon: <Building2 className="w-5 h-5" />, label: 'Company Info' },
        { icon: <Mail className="w-5 h-5" />, label: 'Mailroom' },
        { icon: <ScrollText className="w-5 h-5" />, label: 'Mirr Asia Sign' },
        { icon: <Users className="w-5 h-5" />, label: 'Company Secretary' },
        { icon: <BadgeDollarSign className="w-5 h-5" />, label: 'Accounting' },
        { icon: <FileText className="w-5 h-5" />, label: 'Requests' },
        { icon: <Gift className="w-5 h-5" />, label: 'Perks' },
        { icon: <CreditCard className="w-5 h-5" />, label: 'Billings & Subscriptions' },
        { icon: <HelpCircle className="w-5 h-5" />, label: 'Support' },
    ];

    const nextSection = () => {
        if (currentSection < 5) {
            setCurrentSection(currentSection + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const previousSection = () => {
        if (currentSection > 1) {
            setCurrentSection(currentSection - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const CompanyInformationSection = () => (
        <div className="space-y-8">
            <Card className="bg-blue-50 border-0">
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

            <div>
                <h3 className="font-semibold mb-4">Company name checker</h3>
                <div className="flex space-x-4">
                    <Input placeholder="Company Name - First Choice" className="flex-1" />
                    <Input value="PTE. LTD." className="w-24" readOnly />
                    <Button className="bg-blue-600">CHECK</Button>
                </div>
            </div>

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
            </div>

            <div className="space-y-6">
                <h3 className="font-semibold">More about you</h3>
                <p className="text-sm text-gray-600">This helps us serve you better</p>

                <div className="space-y-6">
                    <div>
                        <label className="block mb-2">1. What are the next steps/objectives for you? <span className="text-red-500 text-sm">Please select at least 1</span></label>
                        <div className="space-y-2">
                            {[
                                'Create a holding and hold assets/shares',
                                'Employ myself (applying for a workpass/EP/Entrepass if necessary)',
                                'Move to Singapore',
                                'Raise funds quickly from VCs or Angels',
                                'Start my own business, grow steadily and profitably',
                                'Startup project, we want to grow fast',
                                'Others, please specify'
                            ].map((option) => (
                                <div key={option} className="flex items-center space-x-2">
                                    <Checkbox id={option} />
                                    <label htmlFor={option} className="text-sm">{option}</label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block mb-2">2. How did you hear about us? <span className="text-red-500 text-sm">Please select</span></label>
                        <RadioGroup>
                            {[
                                'Search Engine',
                                'Social Media',
                                'Referral from an existing client',
                                'Referral from a friend/Mirr Asia staff',
                                'Others, please specify'
                            ].map((option) => (
                                <div key={option} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option} id={option} />
                                    <label htmlFor={option} className="text-sm">{option}</label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    <div>
                        <label className="block mb-2">3. Please list up to 3 countries where your business will take place.</label>
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="Select countries" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="sg">Singapore</SelectItem>
                                <SelectItem value="my">Malaysia</SelectItem>
                                <SelectItem value="id">Indonesia</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </div>
    );

    const CompanyAddressSection = () => (
        <div className="space-y-8">
            <h2 className="text-xl font-semibold">Company Address</h2>
            <Card>
                <CardContent className="p-6 space-y-4">
                    <Input placeholder="Address Line 1" />
                    <Input placeholder="Address Line 2" />
                    <div className="grid grid-cols-2 gap-4">
                        <Input placeholder="City" />
                        <Input placeholder="Postal Code" />
                    </div>
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Country" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="sg">Singapore</SelectItem>
                            <SelectItem value="my">Malaysia</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>
        </div>
    );

    const DirectorsShareholdersSection = () => (
        <div className="space-y-8">
            <h2 className="text-xl font-semibold">Directors and Shareholders</h2>
            <Card>
                <CardContent className="p-6 space-y-4">
                    <div className="space-y-4">
                        <h3 className="font-medium">Director Information</h3>
                        <Input placeholder="Full Name" />
                        <Input placeholder="Email" />
                        <Input placeholder="Phone Number" />
                        <div className="grid grid-cols-2 gap-4">
                            <Input placeholder="Nationality" />
                            <Input placeholder="ID Number" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-medium">Shareholder Information</h3>
                        <Input placeholder="Full Name" />
                        <div className="grid grid-cols-2 gap-4">
                            <Input placeholder="Number of Shares" />
                            <Input placeholder="Share Percentage" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const AccountingSection = () => (
        <div className="space-y-8">
            <h2 className="text-xl font-semibold">Accounting Setup</h2>
            <Card>
                <CardContent className="p-6 space-y-4">
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Financial Year End" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="dec">31 December</SelectItem>
                            <SelectItem value="mar">31 March</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Accounting Package" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="space-y-2">
                        <h3 className="font-medium">Additional Services</h3>
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="payroll" />
                                <label htmlFor="payroll">Payroll Services</label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="tax" />
                                <label htmlFor="tax">Tax Filing</label>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const PaymentSection = () => (
        <div className="space-y-8">
            <h2 className="text-xl font-semibold">Payment Details</h2>
            <Card>
                <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                        <h3 className="font-medium">Selected Services</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Company Registration</span>
                                <span>S$315</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Company Secretary</span>
                                <span>S$240</span>
                            </div>
                        </div>
                        <div className="pt-2 border-t flex justify-between font-medium">
                            <span>Total</span>
                            <span>S$555</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Input placeholder="Card Number" />
                        <div className="grid grid-cols-2 gap-4">
                            <Input placeholder="MM/YY" />
                            <Input placeholder="CVC" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderSection = () => {
        switch (currentSection) {
            case 1:
                return <CompanyInformationSection />;
            case 2:
                return <CompanyAddressSection />;
            case 3:
                return <DirectorsShareholdersSection />;
            case 4:
                return <AccountingSection />;
            case 5:
                return <PaymentSection />;
            default:
                return <CompanyInformationSection />;
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r fixed h-full">
                <div className="p-4 border-b">
                    <div className="text-blue-600 font-semibold">DRAFT COMPANY</div>
                    <div className="text-xs text-gray-500">IN PROGRESS</div>
                </div>

                <nav className="p-4">
                    {sidebarItems.map((item, index) => (
                        <div
                            key={index}
                            className={`flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer ${index === 0 ? 'bg-gray-100' : ''
                                }`}
                        >
                            {item.icon}
                            <span className="text-sm text-gray-600">{item.label}</span>
                        </div>
                    ))}
                </nav>

                <div className="p-4 m-4 bg-blue-50 rounded-lg">
                    <div className="text-sm">Need to sign a contract?</div>
                    <button className="text-blue-600 text-sm font-medium mt-1">Use MirrAsia Sign →</button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 ml-64">
                <div className="p-8">
                    {/* Progress Steps */}
                    <div className="flex justify-center mb-12">
                        {steps.map((step, index) => (
                            <div key={index} className="flex items-center">
                                <div
                                    className="flex flex-col items-center cursor-pointer"
                                    onClick={() => setCurrentSection(step.number)}
                                >
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center ${step.active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
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

                    {/* Section Title */}
                    <h1 className="text-2xl font-bold mb-8">
                        {currentSection === 1 && "Let's get started"}
                        {currentSection === 2 && "Company Address"}
                        {currentSection === 3 && "Directors and Shareholders"}
                        {currentSection === 4 && "Accounting Setup"}
                        {currentSection === 5 && "Payment Details"}
                    </h1>

                    {/* Current Section Content */}
                    <div className="mb-12">
                        {renderSection()}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-6 border-t">
                        <Button
                            variant="outline"
                            onClick={previousSection}
                            disabled={currentSection === 1}
                            className="flex items-center space-x-2"
                        >
                            <span>← BACK</span>
                        </Button>

                        <Button
                            onClick={nextSection}
                            disabled={currentSection === 5}
                            className="flex items-center space-x-2 bg-blue-600"
                        >
                            <span>{currentSection === 5 ? 'SUBMIT' : 'SAVE & NEXT →'}</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Fixed Header */}
            <div className="fixed top-0 right-0 left-64 bg-white border-b h-16 flex items-center justify-end px-8 z-10">
                {/* <div className="flex items-center space-x-2">
                    <img src="/api/placeholder/32/32" alt="Mirr Asia Logo" className="h-8" />
                </div> */}
                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                        <span className="text-blue-600">S$350</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <img src="/api/placeholder/32/32" alt="User Avatar" className="h-8 w-8 rounded-full" />
                        <span>ARYAN</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyRegistration2;