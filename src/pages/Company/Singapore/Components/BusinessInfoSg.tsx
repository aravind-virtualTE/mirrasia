import React, { useState } from 'react'
import { useTheme } from '@/components/theme-provider';
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
            </CardContent>
        </Card>
    )
}

export default BusinessInfoSg