/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react'
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

    const [shrDirList,setShareholders] = useState(
        [...formData.shareHolders, ...formData.directors].map((item) => {
            if (item.name == "") return "Fill Shareholder/Directors and select";
            return item.name;
        })
    );

    useEffect(() => {
       setShareholders( [...formData.shareHolders, ...formData.directors].map((item) => {
            if (item.name == "") return "Fill Shareholder/Directors and select";
            return item.name;
        }))
    }, [formData.shareHolders,formData.directors]);

    const shrDirArr = shrDirList.map((item) => ({ value: item, label: item }));
    // console.log("shrDirArr", shrDirArr)

    const industries = [
        { id: "trade", value: "Singapore.industries.i1" },
        { id: "wholesale", value: "Singapore.industries.i2" },
        { id: "consulting", value: "Singapore.industries.i3" },
        { id: "manufacturing", value: "Singapore.industries.i4" },
        { id: "investment", value: "Singapore.industries.i5" },
        { id: "ecommerce", value: "Singapore.industries.i6" },
        { id: "online-purchase", value: "Singapore.industries.i7" },
        { id: "it-software", value: "Singapore.industries.i8" },
        { id: "crypto", value: "Singapore.industries.i9" },
        { id: "other", value: "InformationIncorporation.paymentOption_other" },
    ];

    const purposes = [
        { id: "entry-expansion", value: "Singapore.purpose.p1" },
        { id: "asset-management", value: "Singapore.purpose.p2" },
        { id: "holding-company", value: "Singapore.purpose.p3" },
        { id: "proposal", value: "Singapore.purpose.p4" },
        { id: "geographical-benefits", value: "Singapore.purpose.p5" },
        { id: "business-diversification", value: "Singapore.purpose.p6" },
        { id: "competitive-advantage", value: "Singapore.purpose.p7" },
        { id: "tax-advantage", value: "Singapore.purpose.p8" },
        { id: "capital-gain", value:"Singapore.purpose.p9" },
        { id: "other", value: "InformationIncorporation.paymentOption_other" },
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
    const addressList = [{ id: "mirrasiaAddress", value: 'Singapore.mirraddress' }, { id: "ownAddress", value: 'Singapore.ownAddress' }, { id: "other", value: t("InformationIncorporation.paymentOption_other") }];
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
                            {t("Singapore.bInfoSgComp")}
                        </h2>
                        <p className="text-sm text-gray-600">{t("Singapore.bInfoPara")}</p>
                    </aside>
                    <div className="w-4/5 ml-4">
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
                                        />
                                        <Label className="font-normal" htmlFor={`industry-${industry.id}`} >
                                            {t(industry.value)}
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
                               {t("Singapore.bInfoDescProdName")}<span className="text-red-500">*</span>
                            </Label>
                            <Input
                                placeholder="Your answer"
                                value={formData.productDescription}
                                onChange={(e) => setFormData({ ...formData, productDescription: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2 mt-2">
                            <Label className="text-base font-semibold flex items-center gap-2">
                               {t("Singapore.bInfoSingSecondIndustries")}
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
                                {t("usa.bInfo.enterWeb")}
                            </Label>
                            <Input
                                placeholder="Your answer"
                                value={formData.webAddress}
                                onChange={(e) => setFormData({ ...formData, webAddress: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2 mt-2">
                            <Label className="text-base font-semibold">
                               {t("Singapore.purposeEstablisSingapore")}<span className="text-red-500">*</span>
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
                                                {t(purpose.value)}
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
                                {t("Singapore.bInfoAddressReg")}
                                <span className="text-red-500 inline-flex">*
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-[500px] text-base">
                                            {t("Singapore.bInfoAddRegParaInfo")}                                            
                                        </TooltipContent>
                                    </Tooltip>
                                </span>
                            </Label>
                            <RadioGroup value={formData.businessAddress?.value} onValueChange={onChangeBusinessAddress} className="gap-4">
                                {addressList.map((year) => (
                                    <div key={year.id} className="flex items-center space-x-2">
                                        <RadioGroupItem value={year.value} id={`year-${year.id}`} />
                                        <Label className="font-normal" htmlFor={`year-${year.id}`}>
                                            {t(year.value)}
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
                            {t("Singapore.shareHldrDirec")}
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
                                {t('CompanyInformation.significantController')}<span className="text-red-500 inline-flex">*
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-[500px] text-base">
                                            {t('Singapore.shrContrlParaInfo')}
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
                                {t('shldrOptions.roleDcp')}
                                <span className="text-red-500 inline-flex">*
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-[500px] text-base">
                                           {t('Singapore.designatedContInfo')}
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
                            ) : t("Singapore.plzFillShrDir")}
                        </div>
                    </div>
                </div>
                <AccountingSgTax />
            </CardContent>
        </Card>
    )
}

export default BusinessInfoSg