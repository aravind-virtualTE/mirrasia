import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from "lucide-react"
import { useAtom } from 'jotai';
import { usaFormWithResetAtom } from '../UsState';

const Section13 = () => {
    const [formData, setFormData] = useAtom(usaFormWithResetAtom);

    return (
        <Card className="max-w-5xl mx-auto mt-2">
            <CardHeader className="bg-sky-100 dark:bg-sky-900">
                <CardTitle className="text-lg font-medium">Section 13</CardTitle>
                <p className="inline-flex">The location where the accounting/financial data of the proposed US company will be kept <Tooltip>
                    <TooltipTrigger asChild>
                        <HelpCircle className="text-red-500 h-4 w-4 mt-1 ml-2 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[500px] text-base">
                        If you store accounting statements, financial data, contracts, invoices, etc. in a country other than the United States, please enter your address below.

                    </TooltipContent>
                </Tooltip></p>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
                {/* select Industry */}
                <div className="space-y-2">
                    <Label htmlFor="relationbtwauth" className="inline-flex">
                    Please enter the address where the accounting and financial data of the proposed US company will be kept.
                    </Label>
                    <Input id="descBusiness" placeholder="Your answer" required value={formData.accountingDataAddress} onChange={(e) => setFormData({ ...formData, accountingDataAddress: e.target.value })}/>
                </div>
            </CardContent>
        </Card>
    )
}

export default Section13