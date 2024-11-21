import React from "react";
import { useTheme } from "@/components/theme-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { companyBusinessInfoAtom } from "@/lib/atom";
import { useAtom } from "jotai";
// import { useTranslation } from "react-i18next";
import { businessNatureList, purposeOptions } from "./constants";
import { Checkbox } from "@/components/ui/checkbox";
import ShareholdersDirectorsDetails from "./ShareholdersDirectorsDetails";
import AccountingTaxationInfo from "./AccountingTaxationInfo";


const CompanyInformation: React.FC = () => {
    // const { t } = useTranslation();
    const [businessInfo, setBusinessInfo] = useAtom(companyBusinessInfoAtom);

    const handleDescriptionChange = (business_product_description: string) => {
        setBusinessInfo((prev) => ({ ...prev, business_product_description }));
    };


    const { theme } = useTheme();
    const handleBusinessChange = (value: string) => {
        // console.log('Selected business category:', value);
        const categoryName = businessNatureList.find((category) => category.val === value)?.name;
        setBusinessInfo((prev) => ({ ...prev, business_industry: categoryName }));
        // Handle the selected value here
    };

    const handlePurposeChange = (checked: boolean, purpose: string) => {
        setBusinessInfo(prev => ({
            ...prev,
            business_purpose: checked
                ? [...prev.business_purpose, purpose]
                : prev.business_purpose.filter(p => p !== purpose)
        }));
    };


    return (
        <>
            <div className="flex w-full p-4">
                <aside className={`w-1/4 p-4 rounded-md shadow-sm ${theme === 'light'
                    ? 'bg-blue-50 text-gray-800'
                    : 'bg-gray-800 text-gray-200'
                    }`}>
                    <h2 className="text-lg font-semibold mb-2">Business Information of the Hong Kong company</h2>
                    <p className="text-sm text-gray-500">In this section please provide information of the Hong Kong Company and related business to be established</p>
                </aside>
                <div className="w-3/4 ml-4">
                    <Card>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="business-category">Select Business Industry</Label>
                                <Select
                                    defaultValue={businessNatureList[0].val}
                                    onValueChange={handleBusinessChange}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a business Industry" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {businessNatureList.map((category) => (
                                            <SelectItem
                                                key={category.val}
                                                value={category.val}
                                                className="cursor-pointer"
                                            >
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-base font-semibold">
                                    Description of the product name, product type, service content, service type, etc. to be transacted after incorporation <span className="text-red-500 font-bold ml-1">*</span>
                                </Label>
                                <Textarea
                                    id="description"
                                    className="h-32"
                                    placeholder="Enter description..."
                                    value={businessInfo.business_product_description}
                                    onChange={(e) => handleDescriptionChange(e.target.value)}
                                />
                            </div>

                            <div>
                                <Label className="text-base font-semibold">
                                    Purpose of the establishment of the Hong Kong company and expected effects <span className="text-red-500 font-bold ml-1">*</span>
                                </Label>
                                {/* <RadioGroup className="mt-4 space-y-3"
                                    value={businessInfo.business_purpose}
                                    onValueChange={handlePurposeChange}
                                >
                                    {purposeOptions.map((purpose) => (
                                        <div key={purpose} className="flex items-center space-x-3">
                                            <RadioGroupItem value={purpose} id={purpose} />
                                            <Label htmlFor={purpose} className="font-normal">
                                                {purpose}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup> */}
                                {purposeOptions.map((purpose) => (
                                    <div key={purpose} className="flex items-start space-x-3">
                                        <Checkbox
                                            id={purpose}
                                            checked={businessInfo.business_purpose.includes(purpose)}
                                            onCheckedChange={(checked) => handlePurposeChange(checked as boolean, purpose)}
                                        />
                                        <Label
                                            htmlFor={purpose}
                                            className="font-normal text-sm leading-normal cursor-pointer"
                                        >
                                            {purpose}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <ShareholdersDirectorsDetails />
            <AccountingTaxationInfo />
        </>
    );
};

export default CompanyInformation;
