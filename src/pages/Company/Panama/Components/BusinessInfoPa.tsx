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

const BusinessInfoPa: React.FC<{canEdit: boolean}> = ({ canEdit }) => {
    const { theme } = useTheme();
    const [formData, setFormData] = useAtom(paFormWithResetAtom);

    const industries = [
        { id: "trade", value: t("usa.bInfo.iList.7") },
        { id: "wholesale", value: t("usa.bInfo.iList.8") },
        { id: "consulting", value:t("usa.bInfo.iList.9") },
        { id: "manufacturing", value: t("usa.bInfo.iList.10") },
        { id: "investment", value: t("usa.bInfo.iList.6") },
        { id: "ecommerce", value: t("usa.bInfo.iList.11") },
        { id: "online-direct", value: t("usa.bInfo.iList.12") },
        { id: "it-software", value: t("usa.bInfo.iList.2") },
        { id: "crypto", value: t("usa.bInfo.iList.1") },
        { id: "other", value: t("InformationIncorporation.paymentOption_other"), },
    ];

    const purposeCompList = [
        { id: "expanding", value: t("panama.purposeLis.1") },
        { id: "investinReal", value: t("panama.purposeLis.2") },
        { id: "manageSubsidary", value: t("panama.purposeLis.3")},
        { id: "businessPartner", value: t("panama.purposeLis.4") },
        { id: "internationalTransaction", value: t("panama.purposeLis.5") },
        { id: "businessRegulation", value: t("panama.purposeLis.6") },
        { id: "lowerTax", value: t("panama.purposeLis.7") },
        { id: "investmentGains", value: t("panama.purposeLis.8") },
        { id: "other", value:  t("InformationIncorporation.paymentOption_other"), },
    ]

    const sourceFundingList = [
        { id: "labourIncome", value: t("panama.sourceList.1") },
        { id: "depositsSaving", value: t("panama.sourceList.2")  },
        { id: "incomeFromStocks", value: t("panama.sourceList.3") },
        { id: "loans", value: t("panama.sourceList.4") },
        { id: "saleOfCompany", value: t("panama.sourceList.5") },
        { id: "businessDivident", value:t("panama.sourceList.6")},
        { id: "inheritance", value: t("panama.sourceList.7") },
        { id: "other", value:  t("InformationIncorporation.paymentOption_other"), },
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
                <PanamaEntity canEdit={canEdit} />
                <div className='flex w-full p-4'>
                    <aside
                        className={`w-1/4 p-4 rounded-md shadow-sm ${theme === "light"
                            ? "bg-blue-50 text-gray-800"
                            : "bg-gray-800 text-gray-200"
                            }`}
                    >
                        <h2 className="text-lg font-semibold mb-2">
                           {t("panama.businessInfoHeader")}
                        </h2>
                    </aside>
                    <div className="w-3/4 ml-4">
                        <div className="space-y-2">
                            <Label className="text-base font-semibold">
                                {t("usa.bInfo.selectIndustryItems")}<span className="text-red-500">*</span>
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
                                            disabled={!canEdit}
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
                                            disabled={!canEdit}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="descWhat" className="text-sm font-semibold mb-2">
                               {t("panama.tradeafterDesc")}<span className="text-red-500">*</span>
                            </Label>
                            <Input type="text" id="descWhat" className="w-full p-2 border rounded-md" placeholder="Please be as specific as possible." value={formData.tradeAfterIncorporation}
                                onChange={(e) => setFormData({ ...formData, tradeAfterIncorporation: e.target.value })} disabled={!canEdit} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-base font-semibold">
                                {t("panama.purposeSetting")} <span className="text-red-500">*</span>
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
                                            disabled={!canEdit}
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
                                            disabled={!canEdit}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-base font-semibold">{t("panama.businessTransactions")}<span className="text-red-500 font-bold ml-1 flex">*
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[500px] text-base">
                                        {t("panama.btInfo")}
                                    </TooltipContent>
                                </Tooltip>
                            </span>
                            </Label>
                            <Input id="listCountry" placeholder="Enter Country.." className="w-full" value={formData.listCountry}
                                onChange={(e) => setFormData({ ...formData, listCountry: e.target.value })} disabled={!canEdit} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-base font-semibold">{t("panama.sourceOfFund")}<span className="text-red-500 font-bold ml-1 flex">*
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[500px] text-base">
                                       {t("panama.sofInfo")}
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
                                            disabled={!canEdit}
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
                                            disabled={!canEdit}
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
                            {t("panama.shldrsPanama")}
                        </h2>
                    </aside>
                    <div className="w-3/4 ml-4">
                        <ShareholderDirectorFormPa canEdit={canEdit} />
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
                                disabled={!canEdit}
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