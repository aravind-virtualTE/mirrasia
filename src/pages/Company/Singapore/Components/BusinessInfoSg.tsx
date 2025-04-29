import React, { useState } from 'react'
import { useTheme } from '@/components/theme-provider';
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ShareholderDirectorForm from './sgShrHldDir';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import AccountingSgTax from './AccountingSgTax';

const BusinessInfoSg: React.FC = () => {
    const { theme } = useTheme();
    const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
    const [selectedPurposes, setSelectedPurposes] = useState<string[]>([]);
    const [otherIndustry, setOtherIndustry] = useState("");
    const [otherPurpose, setOtherPurpose] = useState("");
    const [productDescription, setProductDescription] = useState("");
    const [websiteAddress, setWebsiteAddress] = useState("");

    const industries = [
        { id: "trade", value: "Trade" },
        { id: "wholesale", value: "Wholesale/retail distribution business" },
        { id: "consulting", value: "Consulting" },
        { id: "manufacturing", value: "Manufacturing" },
        { id: "investment", value: "Investment and advisory business" },
        { id: "ecommerce", value: "E-commerce" },
        { id: "online-purchase", value: "Online direct purchase/shipment/purchase agency" },
        { id: "it-software", value: "IT and software development" },
        { id: "crypto", value: "Cryptocurrency related business (ICO, exchange, wallet service, etc.)" },
        { id: "other", value: "Other" },
    ];

    const purposes = [
        { id: "entry-expansion", value: "Business entry and expansion" },
        { id: "asset-management", value: "Asset management by investing in real estate or financial assets" },
        { id: "holding-company", value: "Managing through investing in a subsidiary or affiliated company as a holding company" },
        { id: "proposal", value: "Investor or business counterparty proposed you to establish a Singapore company" },
        { id: "geographical-benefits", value: "Geographical benefits for international transactions" },
        { id: "business-diversification", value: "Pursuing diversification of business due to relaxed regulations" },
        { id: "competitive-advantage", value: "Pursuit of Competitive Advantage through relaxed financial regulations" },
        { id: "tax-advantage", value: "Increase transactional volume due to low tax rate and non-transactional tax (Non-VAT)" },
        { id: "capital-gain", value: "Pursuit of investment profit due to No Capital Gain Tax" },
        { id: "other", value: "Other" },
    ];

    const handleIndustryChange = (id: string) => {
        setSelectedIndustries((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handlePurposeChange = (id: string) => {
        setSelectedPurposes((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };


    return (
        <Card>
            <CardContent>
                <div className='flex w-full p-4'>
                    <aside
                        className={`w-1/4 p-4 rounded-md shadow-sm ${theme === "light"
                            ? "bg-blue-50 text-gray-800"
                            : "bg-gray-800 text-gray-200"
                            }`}
                    >
                        <h2 className="text-lg font-semibold mb-2">
                            Business information of the Singapore company
                        </h2>
                        <p className="text-sm text-gray-600">In this section, please provide information of the Singapore company and related businesses to be established.</p>
                    </aside>
                    <div className="w-3/4 ml-4">
                        <div className="space-y-2">
                            <Label className="text-base font-semibold">
                                Select Industry <span className="text-red-500">*</span>
                            </Label>
                            {industries.map((industry) => (
                                <div key={industry.id} className="flex flex-col gap-2">
                                    <div className="flex items-start space-x-3">
                                        <Checkbox
                                            id={`industry-${industry.id}`}
                                            checked={selectedIndustries.includes(industry.id)}
                                            onCheckedChange={() => handleIndustryChange(industry.id)}
                                        />
                                        <Label className="font-normal" htmlFor={`industry-${industry.id}`} >
                                            {industry.value}
                                        </Label>
                                    </div>
                                    {industry.id === "other" && selectedIndustries.includes("other") && (
                                        <Input
                                            placeholder="Please specify"
                                            value={otherIndustry}
                                            onChange={(e) => setOtherIndustry(e.target.value)}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-base font-semibold">
                                Description of the product name, product type, service content, service type, etc. to be transacted after incorporation <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                placeholder="Your answer"
                                value={productDescription}
                                onChange={(e) => setProductDescription(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-base font-semibold">
                                Enter your website address
                            </Label>
                            <Input
                                placeholder="Your answer"
                                value={websiteAddress}
                                onChange={(e) => setWebsiteAddress(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-base font-semibold">
                                Purpose of the establishment of the Singapore company and expected effects <span className="text-red-500">*</span>
                            </Label>
                            <div className="space-y-3">
                                {purposes.map((purpose) => (
                                    <div key={purpose.id} className="flex flex-col gap-2">
                                        <div className="flex items-start space-x-3">
                                            <Checkbox
                                                id={`purpose-${purpose.id}`}
                                                checked={selectedPurposes.includes(purpose.id)}
                                                onCheckedChange={() => handlePurposeChange(purpose.id)}
                                            />
                                            <Label htmlFor={`purpose-${purpose.id}`} className="font-normal">
                                                {purpose.value}
                                            </Label>
                                        </div>
                                        {purpose.id === "other" && selectedPurposes.includes("other") && (
                                            <Input
                                                placeholder="Please specify"
                                                value={otherPurpose}
                                                onChange={(e) => setOtherPurpose(e.target.value)}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className='flex w-full p-4'>
                    <aside
                        className={`w-1/4 p-4 rounded-md shadow-sm ${theme === "light"
                            ? "bg-blue-50 text-gray-800"
                            : "bg-gray-800 text-gray-200"
                            }`}
                    >
                        <h2 className="text-lg font-semibold mb-2">
                         Shareholders/Directors of the Singapore company
                        </h2>

                    </aside>
                    <div className="w-3/4 ml-4">
                        <ShareholderDirectorForm />
                        <div className="space-y-2">
                            <Label htmlFor="Relation" className="text-sm font-semibold mb-2">
                                Significant Controller<span className="text-red-500 inline-flex">*
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-[500px] text-base">
                                            The significant controller is the person who has the final and practical decision-making power of the company.
                                        </TooltipContent>
                                    </Tooltip>
                                </span>
                            </Label>
                            <Input
                                placeholder="Your answer"
                            // value={productDescription}
                            // onChange={(e) => setProductDescription(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="Relation" className="text-sm font-semibold mb-2">
                                Designated Contact Person
                                <span className="text-red-500 inline-flex">*
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-[500px] text-base">
                                            You need to delegate a person("designated contact person") who will be in charge of contacting in relation to your company's business, incorporation and renewal of your company, registration of documents, confirmations of the required information, and communications for various matters in respect of our services. Appointment of the designated contact person is free for up to 1 person, and if you would like to delegate 2 or more designated contact persons, an annual fee of USD250 per person will be charged. The designated contact person will be delegated by your company and should be registered separately with us to protect your company's information, reduce business confusion, and prevent identity fraud. (The designated contact person must go through the same procedures as the shareholders/directors by submitting the passport copy, address proof, and personal verification.)
                                        </TooltipContent>
                                    </Tooltip>
                                </span>
                            </Label>
                            <Input
                                placeholder="Your answer"
                            // value={productDescription}
                            // onChange={(e) => setProductDescription(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <AccountingSgTax />
            </CardContent>
        </Card>
    )
}

export default BusinessInfoSg