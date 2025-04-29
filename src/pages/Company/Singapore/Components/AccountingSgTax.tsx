import { FC, useState } from 'react'
import { useTheme } from '@/components/theme-provider';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';


const AccountingSgTax: FC = () => {
    const { theme } = useTheme();
    const [servicesSelection, setServicesSelection] = useState("");
    const [servicesSelection1, setServicesSelection1] = useState("");

    const bookkeepingCycleOptions = [
        { value: 'monthly', label: 'Monthly' },
        { value: 'quarterly', label: 'Quarterly' },
        { value: 'half-annually', label: 'Half-annually (every 6 months)' },
        { value: 'annually', label: 'Annually (every 12 months) *the lowest cost' },
        { value: 'other', label: 'Other:' },
    ];
    const onlineAccountList = [
        { value: 'yesSoftware', label: 'Yes (Software cost: estimated as HKD400 per month)' },
        { value: 'no', label: 'No' },
        { value: 'recommendation', label: 'Recommendation required' },
        { value: 'other', label: 'Other:' },
    ];
    return (
        <div className='flex w-full p-4'>
            <aside
                className={`w-1/4 p-4 rounded-md shadow-sm ${theme === "light"
                    ? "bg-blue-50 text-gray-800"
                    : "bg-gray-800 text-gray-200"
                    }`}
            >
                <h2 className="text-lg font-semibold mb-2">
                    Accounting and taxation
                </h2>
                <p className="text-sm text-gray-600">Please provide information on accounting and tax matters.</p>
            </aside>
            <div className="w-3/4 ml-4">
                <div className="space-y-2">
                    <Label htmlFor="Relation" className="text-sm font-semibold mb-2">
                        The financial year end date(FYE) of the Singapore company
                        <span className="text-red-500 inline-flex">*
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[500px] text-base">
                                    Important timelines for accounting and tax return: 1) Deadline for preparing accounting and audit reports (S201): within 3 months from the FYE(financial year end) 2) Deadline for filing and filing estimated income tax (Estimated Chargeable Income (ECI) Submission to Income Tax (IRAS)) : Report within 3 months from the FYE 3) Annual General Meeting (S175): Held within 6 months from the FYE* 4) Annual renewal ACRA Annual Return (S197): Registration of annual reports within 1 month from the date of the regular general meeting of shareholders 5 ) Corporate Tax Filing IRAS Company Tax Filing (Form C or CS for the last FYE): Tax return by November 30 of each year * The first regular general meeting of shareholders must be held within 18 months from the FYE. ** The interval between the regular general meeting of shareholders should not exceed 15 months.
                                </TooltipContent>
                            </Tooltip>
                        </span>
                    </Label>
                    <RadioGroup value={servicesSelection} onValueChange={setServicesSelection} className="gap-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="December 31" id="year-yes" />
                            <Label className="font-normal" htmlFor="year-yes">December 31</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="other" id="year-other" />
                            <Label className="font-normal" htmlFor="year-other">Other</Label>
                        </div>
                        {servicesSelection === "other" && (
                            <Input placeholder="Please specify" />
                        )}
                    </RadioGroup>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="Relation" className="text-sm font-semibold mb-2">
                        Bookkeeping cycle
                        <span className="text-red-500 inline-flex">*</span>
                    </Label>
                    <RadioGroup value={servicesSelection} onValueChange={setServicesSelection} className="gap-4">
                        {bookkeepingCycleOptions.map(option => (
                            <div key={option.value} className="flex items-center space-x-2">
                                <RadioGroupItem value={option.value} id={`bookkeeping-${option.value}`} />
                                <Label className="font-normal" htmlFor={`bookkeeping-${option.value}`}>
                                    {option.label}
                                </Label>
                            </div>
                        ))}
                        {servicesSelection === "other" && (
                            <Input placeholder="Please specify" />
                        )}
                    </RadioGroup>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="Relation" className="text-sm font-semibold mb-2">
                    Would you like to implement online accounting software - Xero?
                        <span className="text-red-500 inline-flex">*</span>
                    </Label>
                    <RadioGroup value={servicesSelection1} onValueChange={setServicesSelection1} className="gap-4">
                        {onlineAccountList.map(option => (
                            <div key={option.value} className="flex items-center space-x-2">
                                <RadioGroupItem value={option.value} id={`bookkeeping-${option.value}`} />
                                <Label className="font-normal" htmlFor={`bookkeeping-${option.value}`}>
                                    {option.label}
                                </Label>
                            </div>
                        ))}
                        {servicesSelection1 === "other" && (
                            <Input placeholder="Please specify" />
                        )}
                    </RadioGroup>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="Relation" className="text-sm font-semibold mb-2">
                        Do you currently use or have a separate accounting software you would like to use? (if any)
                        <span className="text-red-500 inline-flex">*</span>
                    </Label>
                    <Input placeholder="Please specify" />
                </div>
            </div>
        </div>
    )
}

export default AccountingSgTax