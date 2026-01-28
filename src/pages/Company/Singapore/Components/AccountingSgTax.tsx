import { FC } from 'react'
import { useTheme } from '@/components/theme-provider';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { useAtom } from 'jotai';
import { sgFormWithResetAtom } from '../SgState';
import { t } from 'i18next';


const AccountingSgTax: FC<{ canEdit: boolean }> = ({ canEdit }) => {
    const { theme } = useTheme();
    const [formData, setFormData] = useAtom(sgFormWithResetAtom);

    const bookkeepingCycleOptions = [
        { value: 'monthly', label: 'InformationIncorporation.bookCycle1' },
        { value: 'quarterly', label: 'InformationIncorporation.bookCycle2' },
        { value: 'half-annually', label: 'InformationIncorporation.bookCycle3' },
        { value: 'annually', label: 'InformationIncorporation.bookCycle4' },
        { value: 'other', label: "InformationIncorporation.paymentOption_other" },
    ];
    const onlineAccountList = [
        { value: 'yes', label: 'InformationIncorporation.accSoftwareCharge' },
        { value: 'no', label: 'AmlCdd.options.no' },
        { value: 'recommendation', label: 'InformationIncorporation.recRequired' },
        { value: 'other', label: "InformationIncorporation.paymentOption_other" },
    ];
    const finYears = [{id: "dec31",value: t("InformationIncorporation.dec31")}, {id: "other", value: t("InformationIncorporation.paymentOption_other")}];

    const onChangeFinYear = (value:string) => {
        // console.log("Selected Financial Year End:", value);
        const selectedItem = finYears.find(item => t(item.value) == t(value));
        setFormData({ ...formData, finYearEnd:  selectedItem || {id: '', value : ""}  })
    }

    const onChangeBookKeep = (value:string) => {
        // console.log("Selected Financial Year End:", value);
        const selectedItem = bookkeepingCycleOptions.find(item => t(item.value) == t(value));
        setFormData({ ...formData, bookKeeping:  selectedItem || {label: '', value : ""}  })
    }

    const onChangeOnlineBooking = (value:string) => {
        // console.log("Selected Financial Year End:", value);
        const selectedItem = onlineAccountList.find(item => t(item.value) == t(value));
        setFormData({ ...formData, onlineAccountingSoftware:  selectedItem || {label: '', value : ""}  })
    }
    return (
        <div className='flex w-full p-4'>
            <aside
                className={`w-1/5 p-4 rounded-md shadow-sm ${theme === "light"
                    ? "bg-blue-50 text-gray-800"
                    : "bg-gray-800 text-gray-200"
                    }`}
            >
                <h2 className="text-lg font-semibold mb-2">
                    {t("CompanyInformation.accountHeading")}
                </h2>
                <p className="text-sm text-gray-600">{t("CompanyInformation.accountingPara")}</p>
            </aside>
            <div className="w-4/5 ml-4">
                <div className="space-y-2">
                    <Label htmlFor="Relation" className="text-sm font-semibold mb-2">
                        {t("Singapore.fyEndSgComp")}
                        <span className="text-red-500 inline-flex">*
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[500px] text-base">
                                   {t("Singapore.fyEndSgCompInfo")}
                                </TooltipContent>
                            </Tooltip>
                        </span>
                    </Label>
                    <RadioGroup value={formData.finYearEnd?.value} onValueChange={onChangeFinYear} className="gap-4" aria-disabled={!canEdit} disabled={!canEdit}>
                        {finYears.map((year) => (
                            <div key={year.id} className="flex items-center space-x-2">
                                <RadioGroupItem value={year.value} id={`year-${year.id}`} />
                                <Label className="font-normal" htmlFor={`year-${year.id}`}>
                                    {year.value}
                                </Label>
                            </div>
                        ))}                       
                        {formData.finYearEnd?.id === "other" && (
                            <Input placeholder="Please specify" value={formData.otherFinYrEnd} onChange={
                                (e) => setFormData({ ...formData, otherFinYrEnd: e.target.value })
                            } />
                        )}
                    </RadioGroup>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="Relation" className="text-sm font-semibold mb-2">
                        {t("CompanyInformation.bookCycle")}
                        <span className="text-red-500 inline-flex">*</span>
                    </Label>
                    <RadioGroup value={formData.bookKeeping?.value} onValueChange={onChangeBookKeep} className="gap-4" aria-disabled={!canEdit} disabled={!canEdit}>
                        {bookkeepingCycleOptions.map(option => (
                            <div key={option.value} className="flex items-center space-x-2">
                                <RadioGroupItem value={option.value} id={`bookkeeping-${option.value}`} />
                                <Label className="font-normal" htmlFor={`bookkeeping-${option.value}`}>
                                    {t(option.label)}
                                </Label>
                            </div>
                        ))}
                        {formData.bookKeeping?.value === "other" && (
                            <Input placeholder="Please specify" value={formData.otherBookKeep} onChange={
                                (e) => setFormData({ ...formData, otherBookKeep: e.target.value })} disabled={!canEdit}  />
                        )}
                    </RadioGroup>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="Relation" className="text-sm font-semibold mb-2">
                    {t("CompanyInformation.implementSoftware")}
                        <span className="text-red-500 inline-flex">*
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[500px] text-base">
                                   {t("CompanyInformation.implementSoftwaretTip")}
                                </TooltipContent>
                            </Tooltip>
                        </span>
                    </Label>
                    <RadioGroup value={formData.onlineAccountingSoftware?.value} onValueChange={onChangeOnlineBooking} className="gap-4" aria-disabled={!canEdit} disabled={!canEdit}>
                        {onlineAccountList.map(option => (
                            <div key={option.value} className="flex items-center space-x-2">
                                <RadioGroupItem value={option.value} id={`bookkeeping-${option.value}`} />
                                <Label className="font-normal" htmlFor={`bookkeeping-${option.value}`}>
                                    {t(option.label)}
                                </Label>
                            </div>
                        ))}
                        {formData.onlineAccountingSoftware?.value === "other" && (
                            <Input placeholder="Please specify" value={formData.otherAccountingSoftware} onChange={
                                (e) => setFormData({ ...formData, otherAccountingSoftware: e.target.value })} disabled={!canEdit} />
                        )}
                    </RadioGroup>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="Relation" className="text-sm font-semibold mb-2">
                        {t("CompanyInformation.doYouUseSoftware")}
                    </Label>
                    <Input placeholder="Please specify" value={formData.seperateAccountingSoftware} onChange={(e) => setFormData({ ...formData, seperateAccountingSoftware: e.target.value })} disabled={!canEdit} />
                </div>
            </div>
        </div>
    )
}

export default AccountingSgTax