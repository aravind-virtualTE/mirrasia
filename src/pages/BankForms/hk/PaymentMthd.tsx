import React, { useState } from 'react'

import MultiSelect, { Option } from "@/components/MultiSelectInput"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from 'lucide-react'

const PaymentMethd: React.FC = () => {
    const [selectPayment, setPaymntOption] = useState<Option[]>([]);


    const sList = ["Korean account transfer (based on remittance exchange rate)", "International remittance to Hong Kong account (all fees are borne by the remitter)", "Deposit to Hong Kong account (cash deposit, FPS, check deposit, account transfer, etc.)","Card payment (3.5% fee)", "USDT"].map((item) => ({ label: item, value: item }))


    const handlePurposeChange = (selections: Option[]) => {
        // console.log("selections", selections)
        setPaymntOption(selections)
    }

    return (
        <>
            <Card className="max-w-5xl mx-auto ">
                <CardHeader className="bg-sky-100 dark:bg-sky-900">
                    <CardTitle>
                        Payment method
                    </CardTitle>
                    <p>A 100% prepayment is required to confirm the schedule, and if this is not done, the service cannot be provided.</p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <>
                        <Label htmlFor="servicesList" className="text-sm font-bold flex items-center gap-2">
                            Your preferred payment method
                            <span className="text-destructive">*</span>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 inline ml-2 text-gray-500 cursor-pointer" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-md text-sm">
                                If a refund is issued for the cost, fees for card or remittance will not be refunded.
                                </TooltipContent>
                            </Tooltip>
                        </Label>
                        <MultiSelect
                            options={sList}
                            placeholder="Select Payment."
                            selectedItems={selectPayment}
                            onSelectionChange={handlePurposeChange}
                        />
                    </>
                </CardContent>
            </Card>
        </>
    )
}

export default PaymentMethd