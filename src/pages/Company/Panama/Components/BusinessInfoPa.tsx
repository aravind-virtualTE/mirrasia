/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { useAtom } from 'jotai';
import { useTheme } from '@/components/theme-provider';
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import ShareholderDirectorFormPa from './PaShrDlr';
import { typesOfSharesObj } from '../../HongKong/constants';
import { t } from 'i18next';
import { paFormWithResetAtom } from '../PaState';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import PanamaEntity from './PanamaEntity';

const BusinessInfoPa: React.FC = () => {
    const { theme } = useTheme();
    const [formData, setFormData] = useAtom(paFormWithResetAtom);

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
        { id: "other", value: "Other", },
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


    // const nomineeDirectorList = [
    //     { id: "shHolder", value: "Shareholder" },
    //     { id: "president", value: "President" },
    //     { id: "secretary", value: "Secretary" },
    //     { id: "tresurer", value: "Treasurer" },
    //     { id: "founder", value: "Founder" },
    //     { id: "nomineService", value: "I don't need a nominee service" },
    //     { id: "other", value: "Other" }
    // ]


    // const handleNomineeChange = (id: string) => {
    //     setSelecteNomiee((prev) =>
    //         prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    //     );
    // };


    return (
        <Card>
            <CardContent>
                <PanamaEntity />
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
                                            checked={formData.selectedIndustry.includes(industry.id)}

                                            onCheckedChange={(checked: any) => {
                                                const updated = checked
                                                    ? [...formData.selectedIndustry, industry.id]
                                                    : formData.selectedIndustry.filter(id => id !== industry.id);
                                                setFormData({ ...formData, selectedIndustry: updated });
                                            }}
                                        />
                                        <Label className="font-normal" htmlFor={`industry-${industry.id}`} >
                                            {industry.value}
                                        </Label>
                                    </div>
                                    {industry.id === "other" && formData.selectedIndustry.includes("other") && (
                                        <Input
                                            placeholder="Please specify"
                                            value={formData.otherIndustryText}
                                            onChange={(e) => setFormData({ ...formData, otherIndustryText: e.target.value })}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="descWhat" className="text-sm font-semibold mb-2">
                                A description of what you will be trading after incorporation, including the name of the goods, type of goods, content of the service, and form of service.<span className="text-red-500">*</span>
                            </Label>
                            <Input type="text" id="descWhat" className="w-full p-2 border rounded-md" placeholder="Please be as specific as possible." value={formData.tradeAfterIncorporation}
                                onChange={(e) => setFormData({ ...formData, tradeAfterIncorporation: e.target.value })} />
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
                                            checked={formData.purposePaCompany.includes(industry.id)}

                                            onCheckedChange={(checked: any) => {
                                                const updated = checked
                                                    ? [...formData.purposePaCompany, industry.id]
                                                    : formData.purposePaCompany.filter(id => id !== industry.id);
                                                setFormData({ ...formData, purposePaCompany: updated });
                                            }}
                                        />
                                        <Label className="font-normal" htmlFor={`industry-${industry.id}`} >
                                            {industry.value}
                                        </Label>
                                    </div>
                                    {industry.id === "other" && formData.purposePaCompany.includes("other") && (
                                        <Input
                                            placeholder="Please specify"
                                            value={formData.otherPurposePaCompany}
                                            onChange={(e) => setFormData({ ...formData, otherPurposePaCompany: e.target.value })}
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
                            <Input id="listCountry" placeholder="Enter Country.." className="w-full" value={formData.listCountry}
                                onChange={(e) => setFormData({ ...formData, listCountry: e.target.value })} />
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
                                            checked={formData.sourceFunding.includes(industry.id)}

                                            onCheckedChange={(checked: any) => {
                                                const updated = checked
                                                    ? [...formData.sourceFunding, industry.id]
                                                    : formData.sourceFunding.filter(id => id !== industry.id);
                                                setFormData({ ...formData, sourceFunding: updated });
                                            }}
                                        />
                                        <Label className="font-normal" htmlFor={`industry-${industry.id}`} >
                                            {industry.value}
                                        </Label>
                                    </div>
                                    {industry.id === "other" && formData.sourceFunding.includes("other") && (
                                        <Input
                                            placeholder="Please specify"
                                            value={formData.otherSourceFund}
                                            onChange={(e) => setFormData({ ...formData, otherSourceFund: e.target.value })}
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
                        <div className="space-y-2">
                            <Label className="text-base font-semibold flex items-center gap-2">
                                {t('CompanyInformation.typeOfShares')}{" "}
                                <span className="text-red-500 font-bold ml-1 flex">
                                    *
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-[500px] text-base">
                                            {t('CompanyInformation.typeShareInfo')}
                                        </TooltipContent>
                                    </Tooltip>
                                </span>
                            </Label>
                            <RadioGroup
                                value={formData.typeOfShare}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, typeOfShare: value })
                                }
                            >
                                <div className="space-y-2 mt-2">
                                    {typesOfSharesObj.map((option) => (
                                        <div key={option.id} className="flex items-center space-x-2">
                                            <RadioGroupItem value={option.id} id={option.id} />
                                            <Label htmlFor={option.id}>{t(option.label)}</Label>
                                        </div>
                                    ))}
                                </div>
                            </RadioGroup>
                        </div>
                        {/* <div className="space-y-2">
                            <Label className="flex items-center gap-2">If you would like to use a local nominee service, please select<span className="text-red-500 font-bold ml-1 flex">*
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[500px] text-base">
                                        Mandatory members (3 persons): President, Secretary, Treasurer
                                        Minimum nominee service period: 1 year

                                        Panama does provide a local nominee service to protect publicly available registry information. However, this is primarily for the purpose of protecting publicly available information and does not involve or represent the local nominee in all or any part of the foundation's operations. In addition, in accordance with KYC/CDD regulations, you must inform us, the virtual asset exchange or financial institution, etc. the information of the actual operator and UBO(Ultimate Beneficial Owner).

                                        In general, it is common to provide the services of two nominee directors in addition to the name of one client, as it can be generally interpreted that the foundation does not have any scam or impure purpose and is operated under the supervision of one representative. Therefore, if you wish to use the services of all three board members as nominees, please provide the reasons for this.
                                        Cost of nominee director service (1 year):
                                        USD1,200 for 1 nominee / USD1,700 for 2 nominees / USD2,200 for 3 nominees
                                    </TooltipContent>
                                </Tooltip>
                            </span>
                            </Label>
                            {nomineeDirectorList.map((nominee) => (
                                <div key={nominee.id} className="flex flex-col gap-2">
                                    <div className="flex items-start space-x-3">
                                        <Checkbox
                                            id={`nominee-${nominee.id}`}
                                            checked={selectedNomiee.includes(nominee.id)}
                                            onCheckedChange={() => handleNomineeChange(nominee.id)}
                                        />
                                        <Label className="font-normal" htmlFor={`nominee-${nominee.id}`} >
                                            {nominee.value}
                                        </Label>
                                    </div>
                                    {nominee.id === "other" && selectedNomiee.includes("other") && (
                                        <Input
                                            placeholder="Please specify"
                                            value={otherNomiee}
                                            onChange={(e) => setOtherNominee(e.target.value)}
                                        />
                                    )}
                                </div>
                            ))}
                        </div> */}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default BusinessInfoPa