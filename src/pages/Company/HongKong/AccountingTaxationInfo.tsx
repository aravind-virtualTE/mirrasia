import React  from 'react';
import { useTheme } from "@/components/theme-provider";
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useTranslation } from "react-i18next";
import { accountingTaxInfoAtom } from "@/lib/atom";
import { useAtom } from "jotai";
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import DropdownSelect from '@/components/DropdownSelect';

const AccountingTaxationInfo: React.FC = () => {
    const [accTaxInfo, setTaxAccountInfo] = useAtom(accountingTaxInfoAtom);
    const { t } = useTranslation();

    const finYearEndDates = ['December 31', "March 31 (Hong Kong's fiscal year-end date)"]
    const boobkCycleCount = ['Monthly', 'Quarterly', 'Half-annually (every 6 months)', 'Annually (every 12 months)  *the lowest cost']

    const accoutingSoftware = ['Yes (Software cost: estimated as HKD400 per month)', 'No', 'Recommendation required', 'Other']

    // const handleFinYearChange = (finYearEnd: string) => {
    //     setTaxAccountInfo((prev) => ({ ...prev, finYearEnd }));
    // };

    const handleBookCycleChange = (bookKeepCycle: string) => {
        setTaxAccountInfo((prev) => ({ ...prev, bookKeepCycle }));
    }
    const handleAccSoftwareChange = (implementSoftware: string) => {
        setTaxAccountInfo((prev) => ({ ...prev, implementSoftware }));
    }
    const { theme } = useTheme();
    

    const handleItemSelect = (finYearEnd: string | number) => {
        // console.log('Selected Price:', registerAmountAtom);
        setTaxAccountInfo((prev) => ({ ...prev, finYearEnd }));
      };

    return (
        <div className="flex w-full p-4">
            <aside className={`w-1/4 p-4 rounded-md shadow-sm ${theme === 'light'
                ? 'bg-blue-50 text-gray-800'
                : 'bg-gray-800 text-gray-200'
                }`}>
                <h2 className="text-lg font-semibold mb-2">{t('CompanyInformation.accountHeading')}</h2>
                <p className="text-sm text-gray-500">{t('CompanyInformation.accountingPara')}</p>
            </aside>
            <div className="w-3/4 ml-4">
                <Card>
                    <CardContent className="space-y-6">
                        <div>
                            <Label className="text-base font-semibold flex items-center">{t('CompanyInformation.finYearEnd')}<span className="text-red-500 font-bold ml-1 flex">*
                                <Tooltip >
                                    <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[500px] text-base">
                                    {t('CompanyInformation.finYearEndTtip')}
                                    </TooltipContent>
                                </Tooltip>
                            </span></Label>
                            <DropdownSelect
                                options={finYearEndDates}
                                placeholder="Please enter the preferred financial year end date"
                                onSelect={handleItemSelect}
                                selectedValue={accTaxInfo.finYearEnd}
                            />
                            {/* <RadioGroup className="mt-4 space-y-3"
                                value={accTaxInfo.finYearEnd}
                                onValueChange={handleFinYearChange}
                            >
                                {finYearEndDates.map((share) => (
                                    <div key={share} className="flex items-center space-x-3">
                                        <RadioGroupItem value={share} id={share} />
                                        <Label htmlFor={share} className="font-normal">
                                            {share}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup> */}
                        </div>
                        <div>
                            <Label className="text-base font-semibold">{t('CompanyInformation.bookCycle')}<span className="text-red-500 font-bold ml-1">*</span></Label>
                            <RadioGroup className="mt-4 space-y-3"
                                value={accTaxInfo.bookKeepCycle}
                                onValueChange={handleBookCycleChange}
                            >
                                {boobkCycleCount.map((noOfDirector) => (
                                    <div key={noOfDirector} className="flex items-center space-x-3">
                                        <RadioGroupItem value={noOfDirector} id={noOfDirector} />
                                        <Label htmlFor={noOfDirector} className="font-normal">
                                            {noOfDirector}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                        <div>
                            <Label className="text-base font-semibold flex items-center">{t('CompanyInformation.implementSoftware')}<span className="text-red-500 font-bold ml-1 flex">*
                                <Tooltip >
                                    <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[500px] text-base">
                                    {t('CompanyInformation.implementSoftwaretTip')}
                                    </TooltipContent>
                                </Tooltip>
                            </span></Label>
                            <RadioGroup className="mt-4 space-y-3"
                                value={accTaxInfo.implementSoftware}
                                onValueChange={handleAccSoftwareChange}
                            >
                                {accoutingSoftware.map((accSoft) => (
                                    <div key={accSoft} className="flex items-center space-x-3">
                                        <RadioGroupItem value={accSoft} id={accSoft} />
                                        <Label htmlFor={accSoft} className="font-normal">
                                            {accSoft}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-base font-semibold">
                            {t('CompanyInformation.doYouUseSoftware')}<span className="text-red-500 font-bold ml-1">*</span>
                            </Label>
                            <Input
                                id="description"
                                required
                                className="w-full"
                                value={accTaxInfo.anySoftwareInUse}
                                onChange={(e) => setTaxAccountInfo(prev => ({ ...prev, anySoftwareInUse: e.target.value }))}
                                placeholder="Enter data if any..." />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default AccountingTaxationInfo