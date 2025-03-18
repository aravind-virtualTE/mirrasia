import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useAtom } from "jotai"
import { usaFormWithResetAtom } from "../UsState"
import MultiSelect, { Option } from "@/components/MultiSelectInput";
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
const list = [
    ' US company formation + Company maintenance until the renewal date or anniversary date of its incorporation (standard service)',
    "EMI (Electronic Money Institution) list provided (free to customers who use Mirr Asia's service)",
    "EMI (Electronic Money Institution) account opening application and advice (separate quote after review of business documents)",
    'Bank account opening application and advice (separate quotation after review of business documents)',
    'US legal opinion (separate quote after review of white paper)', 'Legal opinion for listing on domestic stock exchanges (separate quote after review of white paper)', "Consulting services such as business regulatory confirmation, feasibility review, document preparation and operational advice (separate quotation)", 'Other'
]

const Section6 = () => {

    const [formData, setFormData] = useAtom(usaFormWithResetAtom);
    const serviceList = list.map((item) => ({ label: item, value: item }));
    const handleSelectionChange = (selections: Option[]) => {
        // console.log("selections", selections)
        setFormData({ ...formData, serviceItemsSelected: selections })

    };

    return (
        <React.Fragment> <Card className="max-w-5xl mx-auto mt-2">
            <CardHeader className="bg-sky-100 dark:bg-sky-900">
                <CardTitle className="text-lg font-medium">Section 6</CardTitle>
                <p>Select services provided by Mirasia</p>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <Label htmlFor="serviceID" className="text-base flex items-center font-semibold gap-2">
                        Service items you need <span className="text-red-500 flex font-bold ml-1">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[500px] text-base">
                                    you can type in the empty space inside the select box to enter custom value
                                </TooltipContent>
                            </Tooltip>*
                        </span>
                    </Label>

                    {serviceList.length > 0 ? (
                        <>
                            <MultiSelect
                                options={serviceList}
                                placeholder="Select Service."
                                selectedItems={formData.serviceItemsSelected}
                                onSelectionChange={handleSelectionChange}
                            />
                        </>
                    ) : (
                        "Please Select Services"
                    )}
                </div>
            </CardContent>
        </Card>
        </React.Fragment>
    )
}

export default Section6