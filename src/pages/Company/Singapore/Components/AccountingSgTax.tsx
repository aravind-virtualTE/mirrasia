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


const AccountingSgTax: FC = () => {
    const { theme } = useTheme();
    const [formData, setFormData] = useAtom(sgFormWithResetAtom);

    const bookkeepingCycleOptions = [
        { value: 'monthly', label: 'Monthly' },
        { value: 'quarterly', label: 'Quarterly' },
        { value: 'half-annually', label: 'Half-annually (every 6 months)' },
        { value: 'annually', label: 'Annually (every 12 months) *the lowest cost' },
        { value: 'other', label: 'Other:' },
    ];
    const onlineAccountList = [
        { value: 'yes', label: 'Yes (Software cost: estimated as HKD400 per month)' },
        { value: 'no', label: 'No' },
        { value: 'recommendation', label: 'Recommendation required' },
        { value: 'other', label: 'Other:' },
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
                    Accounting and taxation
                </h2>
                <p className="text-sm text-gray-600">Please provide information on accounting and tax matters.</p>
            </aside>
            <div className="w-4/5 ml-4">
                <div className="space-y-2">
                    <Label htmlFor="Relation" className="text-sm font-semibold mb-2">
                        The financial year end date(FYE) of the Singapore company
                        <span className="text-red-500 inline-flex">*
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[500px] text-base">
                                   Important dates related to accounting and tax reporting: 1) Deadline for preparation of Accounting and Audit Report (S201): Within 3 months from the financial year end 2) Deadline for submission of Estimated Chargeable Income (ECI) Submission to Income Tax (IRAS): Within 3 months from the financial year end 3) Annual General Meeting (S175): To be held within 6 months from the financial year end* 4) ACRA Annual Return (S197): To be registered within 1 month from the AGM date 5) IRAS Company Tax Filing (Form C or CS for the last financial year end): To be filed by 30 November every year * The first AGM must be held within 18 months from the date of incorporation. ** The interval between AGMs should not exceed 15 months.
                                </TooltipContent>
                            </Tooltip>
                        </span>
                    </Label>
                    <RadioGroup value={formData.finYearEnd?.value} onValueChange={onChangeFinYear} className="gap-4">
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
                        Bookkeeping cycle
                        <span className="text-red-500 inline-flex">*</span>
                    </Label>
                    <RadioGroup value={formData.bookKeeping?.value} onValueChange={onChangeBookKeep} className="gap-4">
                        {bookkeepingCycleOptions.map(option => (
                            <div key={option.value} className="flex items-center space-x-2">
                                <RadioGroupItem value={option.value} id={`bookkeeping-${option.value}`} />
                                <Label className="font-normal" htmlFor={`bookkeeping-${option.value}`}>
                                    {option.label}
                                </Label>
                            </div>
                        ))}
                        {formData.bookKeeping?.value === "other" && (
                            <Input placeholder="Please specify" value={formData.otherBookKeep} onChange={
                                (e) => setFormData({ ...formData, otherBookKeep: e.target.value })}  />
                        )}
                    </RadioGroup>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="Relation" className="text-sm font-semibold mb-2">
                    Would you like to implement online accounting software - Xero?
                        <span className="text-red-500 inline-flex">*
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[500px] text-base">
                                   If you introduce Xero, you can import data created by POS or other software in CSV format to create ledgers and financial statements, and it also supports the creation of cash flow statements. It is also helpful when creating consolidated financial statements between holding companies and subsidiaries, and other functions such as inventory management, cost management, and sales management are also supported.
                                </TooltipContent>
                            </Tooltip>
                        </span>
                    </Label>
                    <RadioGroup value={formData.onlineAccountingSoftware?.value} onValueChange={onChangeOnlineBooking} className="gap-4">
                        {onlineAccountList.map(option => (
                            <div key={option.value} className="flex items-center space-x-2">
                                <RadioGroupItem value={option.value} id={`bookkeeping-${option.value}`} />
                                <Label className="font-normal" htmlFor={`bookkeeping-${option.value}`}>
                                    {option.label}
                                </Label>
                            </div>
                        ))}
                        {formData.onlineAccountingSoftware?.value === "other" && (
                            <Input placeholder="Please specify" value={formData.otherAccountingSoftware} onChange={
                                (e) => setFormData({ ...formData, otherAccountingSoftware: e.target.value })} />
                        )}
                    </RadioGroup>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="Relation" className="text-sm font-semibold mb-2">
                        Do you currently use or have a separate accounting software you would like to use? (if any)
                    </Label>
                    <Input placeholder="Please specify" value={formData.seperateAccountingSoftware} onChange={(e) => setFormData({ ...formData, seperateAccountingSoftware: e.target.value })}  />
                </div>
            </div>
        </div>
    )
}

export default AccountingSgTax