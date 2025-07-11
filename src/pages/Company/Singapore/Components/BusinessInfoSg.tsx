/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { t } from 'i18next';
import { useAtom } from "jotai";
import { sgFormWithResetAtom } from "../SgState";
import MultiSelect from '@/components/MultiSelectInput';
import { Option } from '@/components/MultiSelectInput';
import DropdownSelect from '@/components/DropdownSelect';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const BusinessInfoSg: React.FC = () => {
    const { theme } = useTheme();
    const [formData, setFormData] = useAtom(sgFormWithResetAtom);

    const [shrDirList,] = useState(
        formData.shareHolders.map((item) => {
            if (item.name == "") return "Fill Shareholder/Directors and select";
            return item.name;
        })
    );
    const shrDirArr = shrDirList.map((item) => ({ value: item, label: item }));

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
    const typesOfShares = [
        { id: "ordinaryShare", value: "CompanyInformation.typeOfShare.ordinaryShares" },
        { id: "preferenceShare", value: "CompanyInformation.typeOfShare.preferenceShares" },
    ]

    const handleSelectionChange = (selections: Option[]) => {
        // console.log("selections", selections)
        setFormData({
            ...formData,
            significantController: selections,

        });
    };
    const addressList = [{ id: "mirrasiaAddress", value: 'Use of Mir Asia’s Singapore Corporation Registration Address Service' }, { id: "ownAddress", value: "Have a separate address to use as your business address in Singapore (does not use Mir Asia's registered address service)" }, { id: "other", value: t("InformationIncorporation.paymentOption_other") }];
    const onChangeBusinessAddress = (value:string) => {
        // console.log("Selected Financial Year End:", value);
        const selectedItem = addressList.find(item => t(item.value) == t(value));
        setFormData({ ...formData, businessAddress:  selectedItem || {id: '', value : ""}  })
    }
    return (
        <Card>
            <CardContent>
                <div className='flex w-full p-4'>
                    <aside
                        className={`w-1/5 p-4 rounded-md shadow-sm ${theme === "light"
                            ? "bg-blue-50 text-gray-800"
                            : "bg-gray-800 text-gray-200"
                            }`}
                    >
                        <h2 className="text-lg font-semibold mb-2">
                            Business information of the Singapore company
                        </h2>
                        <p className="text-sm text-gray-600">In this section, please provide information of the Singapore company and related businesses to be established.</p>
                    </aside>
                    <div className="w-4/5 ml-4">
                        <div className="space-y-2">
                            <Label className="text-base font-semibold">
                                Select Industry <span className="text-red-500">*</span>
                            </Label>
                            {industries.map((industry) => (
                                <div key={industry.id} className="flex flex-col gap-2">
                                    <div className="flex items-start space-x-3">
                                        <Checkbox
                                            id={industry.id}
                                            checked={formData.selectedIndustry.includes(industry.id)}
                                            onCheckedChange={(checked: any) => {
                                                const updated = checked
                                                    ? [...formData.selectedIndustry, industry.id]
                                                    : formData.selectedIndustry.filter(id => id !== industry.id);
                                                setFormData({ ...formData, selectedIndustry: updated });
                                            }}
                                        // className={industry.isOther ? "mt-2" : ""}
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
                        <div className="space-y-2 mt-2">
                            <Label className="text-base font-semibold">
                                Description of the product name, product type, service content, service type, etc. to be transacted after incorporation <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                placeholder="Your answer"
                                value={formData.productDescription}
                                onChange={(e) => setFormData({ ...formData, productDescription: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2 mt-2">
                            <Label className="text-base font-semibold flex items-center gap-2">
                                Please list the Singapore corporation's main and secondary industries.
                                <span className="text-red-500 flex">* <Tooltip>
                                    <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[500px] text-base">
                                        A Singapore corporation can register up to two types of business.
                                    </TooltipContent>
                                </Tooltip></span>
                            </Label>
                            <Input
                                placeholder="Your answer"
                                value={formData.sgBusinessList}
                                onChange={(e) => setFormData({ ...formData, sgBusinessList: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2 mt-2">
                            <Label className="text-base font-semibold">
                                Enter your website address
                            </Label>
                            <Input
                                placeholder="Your answer"
                                value={formData.webAddress}
                                onChange={(e) => setFormData({ ...formData, webAddress: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2 mt-2">
                            <Label className="text-base font-semibold">
                                Purpose of the establishment of the Singapore company and expected effects <span className="text-red-500">*</span>
                            </Label>
                            <div className="space-y-3">
                                {purposes.map((purpose) => (
                                    <div key={purpose.id} className="flex flex-col gap-2">
                                        <div className="flex items-start space-x-3">
                                            <Checkbox
                                                id={`purpose-${purpose.id}`}
                                                checked={formData.establishmentPurpose.includes(purpose.id)}
                                                onCheckedChange={(checked: any) => {
                                                    const updated = checked
                                                        ? [...formData.establishmentPurpose, purpose.id]
                                                        : formData.establishmentPurpose.filter(id => id !== purpose.id);
                                                    setFormData({ ...formData, establishmentPurpose: updated });
                                                }}
                                            />
                                            <Label htmlFor={`purpose-${purpose.id}`} className="font-normal">
                                                {purpose.value}
                                            </Label>
                                        </div>
                                        {purpose.id === "other" && formData.establishmentPurpose.includes("other") && (
                                            <Input
                                                placeholder="Please specify"
                                                value={formData.otherEstablishmentPurpose}
                                                onChange={(e) => setFormData({ ...formData, otherEstablishmentPurpose: e.target.value })}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="Relation" className="text-sm font-semibold mb-2">
                                Business address as registered in Singapore
                                <span className="text-red-500 inline-flex">*
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-[500px] text-base">
                                            A Singapore corporation must have a commercial address in Singapore to establish and maintain a corporation. We provide a registered address service, which includes a registered address and mail handling service. (Residential or accommodation addresses cannot be registered as corporate addresses.)
                                        </TooltipContent>
                                    </Tooltip>
                                </span>
                            </Label>
                            <RadioGroup value={formData.businessAddress?.value} onValueChange={onChangeBusinessAddress} className="gap-4">
                                {addressList.map((year) => (
                                    <div key={year.id} className="flex items-center space-x-2">
                                        <RadioGroupItem value={year.value} id={`year-${year.id}`} />
                                        <Label className="font-normal" htmlFor={`year-${year.id}`}>
                                            {year.value}
                                        </Label>
                                    </div>
                                ))}
                                {formData.businessAddress?.id === "other" && (
                                    <Input placeholder="Please specify" value={formData.otherBusinessAddress} onChange={
                                        (e) => setFormData({ ...formData, otherBusinessAddress: e.target.value })
                                    } />
                                )}
                            </RadioGroup>
                        </div>
                    </div>
                </div>
                <div className='flex w-full p-4'>
                    <aside
                        className={`w-1/5 p-4 rounded-md shadow-sm ${theme === "light"
                            ? "bg-blue-50 text-gray-800"
                            : "bg-gray-800 text-gray-200"
                            }`}
                    >
                        <h2 className="text-lg font-semibold mb-2">
                            Shareholders/Directors of the Singapore company
                        </h2>

                    </aside>
                    <div className="w-4/5 ml-4">
                        <ShareholderDirectorForm />
                        <div className="space-y-2 mt-2">
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
                            {typesOfShares.map((purpose) => (
                                <div key={t(purpose.id)} className="flex items-start space-x-3">
                                    <Checkbox
                                        id={t(purpose.id)}
                                        checked={formData.issuedSharesType.includes(t(purpose.id))}
                                        onCheckedChange={(checked: any) => {
                                            const updated = checked
                                                ? [...formData.issuedSharesType, purpose.id]
                                                : formData.issuedSharesType.filter(id => id !== purpose.id);
                                            setFormData({ ...formData, issuedSharesType: updated });
                                        }}
                                    />
                                    <Label
                                        htmlFor={t(purpose.id)}
                                        className="font-normal text-sm leading-normal cursor-pointer"
                                    >
                                        {t(purpose.value)}
                                    </Label>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2 mt-2">
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
                            {shrDirList.length > 0 ? (
                                <>

                                    <MultiSelect
                                        options={shrDirArr}
                                        placeholder="Select Significant Controller..."
                                        selectedItems={formData.significantController}
                                        onSelectionChange={handleSelectionChange}
                                    />
                                </>
                            ) : (
                                "Please Fill Shareholder/Director"
                            )}
                            {/* <Input placeholder="Your answer" /> */}
                        </div>
                        <div className="space-y-2 mt-2">
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
                            {shrDirList.length > 0 ? (
                                <DropdownSelect
                                    options={shrDirList}
                                    placeholder="Select significant Controller"
                                    onSelect={(e) => setFormData({ ...formData, designatedContactPerson: e })}
                                    selectedValue={formData.designatedContactPerson}
                                />
                            ) : (
                                "Please Fill Shareholder/Director"
                            )}
                            {/* <Input  placeholder="Your answer" /> */}
                        </div>
                    </div>
                </div>
                <AccountingSgTax />
            </CardContent>
        </Card>
    )
}

export default BusinessInfoSg