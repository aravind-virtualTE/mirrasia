import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useTheme } from '@/components/theme-provider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import ShareholderDirectorFormPa from './PaShrDlr';

const BusinessInfoPa: React.FC = () => {
    const { theme } = useTheme();
    const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
    const [otherIndustry, setOtherIndustry] = useState("");
    const [selectedPurposes, setSelectedPurposes] = useState<string[]>([]);
    const [otherPurpose, setOtherPurpose] = useState("");


    const industries = [
        { id: "trade", value: "Trade" },
        { id: "wholesale", value: "Wholesale/retail distribution business" },
        { id: "consulting", value: "Consulting" },
        { id: "manufacturing", value: "Manufacturing" },
        { id: "investment", value: "Finance, investment and advisory" },
        { id: "ecommerce", value: "Online services (e-commerce)" },
        { id: "online-direct", value: "Online direct sales/distribution/agency" },
        { id: "it-software", value: "IT and software development" },
        { id: "crypto", value: "Cryptocurrency related business (ICOs, exchange, wallet service, etc.)" },
        { id: "other", value: "Other" },
    ];

    const purposeCompList = [
        { id: "expanding", value: "Expanding into the Americas and Europe" },
        { id: "investinReal", value: "Invest in and operate real estate or financial assets" },
        { id: "manageSubsidary", value: "To invest in and manage subsidiaries or affiliated companies as a holding company" },
        { id: "businessPartner", value: "An investor or business partner suggests incorporating in Panama" },
        { id: "internationalTransaction", value: "For international transactions" },
        { id: "businessRegulation", value: "Diversify your business as regulations loosen" },
        { id: "lowerTax", value: "Increase trading volume due to lower tax rates" },
        { id: "investmentGains", value: "Pursuing investment gains with No Capital Gain Tax" },
        { id: "other", value: "Other" },
    ]

    const sourceFundingList = [
        { id: "labourIncome", value: "Income from labour" },
        { id: "depositsSaving", value: "Deposits, savings" },
        { id: "incomeFromStocks", value: "Income from stocks or other investment property" },
        { id: "loans", value: "Loans" },
        { id: "saleOfCompany", value: "Proceeds from the sale of a company or shareholding" },
        { id: "businessDivident", value: "Business income/dividends" },
        { id: "inheritance", value: "Inheritance" },
        { id: "other", value: "Other" },
    ]

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
                            Business information about the Panama company you are setting up
                        </h2>
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
                            <Label htmlFor="descWhat" className="text-sm font-semibold mb-2">
                                A description of what you will be trading after incorporation, including the name of the goods, type of goods, content of the service, and form of service.<span className="text-red-500">*</span>
                            </Label>
                            <Input type="text" id="descWhat" className="w-full p-2 border rounded-md" placeholder="Please be as specific as possible." required />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-base font-semibold">
                                Purpose of setting up a Panama company and what you can expect to get out of it <span className="text-red-500">*</span>
                            </Label>
                            {purposeCompList.map((industry) => (
                                <div key={industry.id} className="flex flex-col gap-2">
                                    <div className="flex items-start space-x-3">
                                        <Checkbox
                                            id={`industry-${industry.id}`}
                                            checked={selectedPurposes.includes(industry.id)}
                                            onCheckedChange={() => handlePurposeChange(industry.id)}
                                        />
                                        <Label className="font-normal" htmlFor={`industry-${industry.id}`} >
                                            {industry.value}
                                        </Label>
                                    </div>
                                    {industry.id === "other" && selectedPurposes.includes("other") && (
                                        <Input
                                            placeholder="Please specify"
                                            value={otherPurpose}
                                            onChange={(e) => setOtherPurpose(e.target.value)}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-base font-semibold">Please list the countries where your business transactions will take place after incorporation in Panama.<span className="text-red-500 font-bold ml-1 flex">*
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[500px] text-base">
                                    Please list the countries where your business transactions will take place after incorporation in Panama.
                                    </TooltipContent>
                                </Tooltip>
                            </span>
                            </Label>
                            <Input id="listCountry" placeholder="Enter Country.." className="w-full" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-base font-semibold">Please select the source of funding for your Panama incorporated business from the following<span className="text-red-500 font-bold ml-1 flex">*
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[500px] text-base">
                                    Please select details of the source of funding for the Ultimate Beneficial Owner (UBO), who is the principal or beneficial (direct or indirect) owner of the entity, and the source of funding that will be used to start the company.
                                    </TooltipContent>
                                </Tooltip>
                            </span>
                            </Label>
                            {sourceFundingList.map((industry) => (
                                <div key={industry.id} className="flex flex-col gap-2">
                                    <div className="flex items-start space-x-3">
                                        <Checkbox
                                            id={`industry-${industry.id}`}
                                            checked={selectedPurposes.includes(industry.id)}
                                            onCheckedChange={() => handlePurposeChange(industry.id)}
                                        />
                                        <Label className="font-normal" htmlFor={`industry-${industry.id}`} >
                                            {industry.value}
                                        </Label>
                                    </div>
                                    {industry.id === "other" && selectedPurposes.includes("other") && (
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
                <div className='flex w-full p-4'>
                <aside
                        className={`w-1/4 p-4 rounded-md shadow-sm ${theme === "light"
                            ? "bg-blue-50 text-gray-800"
                            : "bg-gray-800 text-gray-200"
                            }`}
                    >
                        <h2 className="text-lg font-semibold mb-2">
                            Shareholders/Directors of the Panama company
                        </h2>
                    </aside>
                    <div className="w-3/4 ml-4">
                        <ShareholderDirectorFormPa />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default BusinessInfoPa