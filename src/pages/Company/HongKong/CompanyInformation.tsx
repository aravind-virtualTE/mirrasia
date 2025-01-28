import React, { useEffect, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { companyBusinessInfoAtom } from "@/lib/atom";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { businessNatureList, purposeOptions } from "./constants";
import { Checkbox } from "@/components/ui/checkbox";
import ShareholdersDirectorsDetails from "./ShareholdersDirectorsDetails";
import AccountingTaxationInfo from "./AccountingTaxationInfo";
import SearchSelect from "@/components/SearchSelect";


const CompanyInformation: React.FC = () => {
    const { t } = useTranslation();
    const [businessInfo, setBusinessInfo] = useAtom(companyBusinessInfoAtom);
    const [selectedValue, setSelectedValue] = useState({code : "", label : ""});

    const handleDescriptionChange = (business_product_description: string) => {
        setBusinessInfo((prev) => ({ ...prev, business_product_description }));
    };


    const { theme } = useTheme();

    useEffect(() => {
        // Set the initial value based on the atom
        if (businessInfo.business_industry) {
            const matchedCategory = businessNatureList.find(
                (category) => category.label == businessInfo.business_industry
            );
            
            if (matchedCategory) {
                setSelectedValue(matchedCategory);
            }
        } else {
            // Default to the first item in the list
            setSelectedValue(businessNatureList[0]);
        }
    }, [businessInfo]);   

    const handlePurposeChange = (checked: boolean, purpose: string) => {
        setBusinessInfo(prev => ({
            ...prev,
            business_purpose: checked
                ? [...prev.business_purpose, purpose]
                : prev.business_purpose.filter(p => p !== purpose)
        }));
    };


    const handleCurrencySelect = (item: { code: string; label: string }) => {
        console.log("Selected currency:", item);
        setSelectedValue(item);
        setBusinessInfo((prev) => ({ ...prev, business_industry: item.label }));
    };

    return (
        <>
            <div className="flex w-full p-4">
                <aside className={`w-1/4 p-4 rounded-md shadow-sm ${theme === 'light'
                    ? 'bg-blue-50 text-gray-800'
                    : 'bg-gray-800 text-gray-200'
                    }`}>
                    <h2 className="text-lg font-semibold mb-2">{t('CompanyInformation.businessInfoHead')}</h2>
                    <p className="text-sm text-gray-500">{t('CompanyInformation.businessInfoSubHeading')}</p>
                </aside>
                <div className="w-3/4 ml-4">
                    <Card>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="business-category">{t('CompanyInformation.selectBusinessIndustry')}</Label>
                                <SearchSelect
                                    items={businessNatureList}
                                    placeholder="Select a business Industry"
                                    onSelect={handleCurrencySelect}
                                    selectedItem={selectedValue}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-base font-semibold">
                                {t('CompanyInformation.descriptionOfProduct')} <span className="text-red-500 font-bold ml-1">*</span>
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

                                {purposeOptions.map((purpose) => (
                                    <div key={t(purpose)} className="flex items-start space-x-3">
                                        <Checkbox
                                            id={t(purpose)}
                                            checked={businessInfo.business_purpose.includes(t(purpose))}
                                            onCheckedChange={(checked) => handlePurposeChange(checked as boolean, t(purpose))}
                                        />
                                        <Label
                                            htmlFor={t(purpose)}
                                            className="font-normal text-sm leading-normal cursor-pointer"
                                        >
                                            {t(purpose)}
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
