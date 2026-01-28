import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from "lucide-react"
import DropdownSelect from '@/components/DropdownSelect'
import { useAtom } from 'jotai';
import { usaFormWithResetAtom } from '../inviteUsaDirShirState';

const yesOrNoList = [
    'Yes',
    'No',
    'Other'
]
const Section9 = () => {
    const [formData, setFormData] = useAtom(usaFormWithResetAtom);
    const handleOptionChange = (value: string | number) => {
        // setSelectedOption(value);
        setFormData({ ...formData, noOfSharesSelected: value });
    };

    return (
        <Card className="max-w-5xl mx-auto mt-2">
            <CardHeader className="bg-sky-100 dark:bg-sky-900">
                <CardTitle className="text-lg font-medium">Section 9</CardTitle>
                <p className="inline-flex">Consent and declaration of application <Tooltip>
                    <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[500px] text-base">
                    </TooltipContent>
                </Tooltip></p>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="inline-flex">
                        <p>You agree to provide documents and information for the Company's business in relation to the Service,
                            and you agree that the purpose of establishing and operating the Company is for legitimate and legitimate
                            business. In the operation of a corporation after incorporation, the Company is not obligated to provide
                            help or advice on matters that violate the law, and the Company reserves the right to suspend the service
                            if it is determined that there is a violation of the law or an intention related to it. You declare
                            that everything you have written in this application is true, complete and accurate to the best of your
                            knowledge. Do you agree with this?
                        </p>
                        <span className="text-red-500 font-bold ml-1 flex">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[500px] text-base">
                                </TooltipContent>
                            </Tooltip>
                        </span>
                    </Label>

                    <DropdownSelect
                        options={yesOrNoList}
                        placeholder="Select..."
                        selectedValue={formData.noOfSharesSelected}
                        onSelect={handleOptionChange}
                    />
                </div>
            </CardContent>
        </Card>
    )
}

export default Section9