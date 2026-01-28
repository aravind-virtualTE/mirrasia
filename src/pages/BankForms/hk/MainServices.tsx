import React, { useState } from 'react'

import MultiSelect, { Option } from "@/components/MultiSelectInput"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from 'lucide-react'

const MainServices: React.FC = () => {
    const [selectedService, setSelectedOption] = useState<Option[]>([]);
    const [selectPurpose, setPurposeOption] = useState<Option[]>([]);

    const list = ["Open a personal account at HSBC Bank in Hong Kong (HKD6,000 / In-person visit required) *English or Chinese conversation required", "Opening a personal account at Hong Kong SC Bank (HKD6,500 / In-person visit required) *HKD5,000 deposit required on the day of opening", "Opening a personal account at OCBC Bank in Hong Kong (HKD6,000 / In-person visit required)", "Opening a Hong Kong SC Bank Priority personal account (HKD3,000 / In-person visit required) *Must meet investment asset requirements"]

    const sList = ["Deposit of own funds", "Investing in Hong Kong or China stocks", "US stock investment","Investment in stocks in countries other than Hong Kong or the United States", "Funds or other financial investments", "Real Estate Investment", "Virtual asset investment or trading", "Receiving income such as dividends, salaries, commissions, etc. from Hong Kong or foreign corporations", "Transactions between Hong Kong or foreign legal entities owned by you (loans, borrowings, receipts on behalf of others, capital contributions, etc.)", "Transactions related to purchasing insurance products, paying insurance premiums, and receiving insurance premiums in Hong Kong or other countries", "Personal Asset Management"].map((item) => ({ label: item, value: item }))
    const serviceList = list.map((item) => ({ label: item, value: item }));

    const handleServiceChange = (selections: Option[]) => {
        // console.log("selections", selections)
        setSelectedOption(selections)
    }

    const handlePurposeChange = (selections: Option[]) => {
        // console.log("selections", selections)
        setPurposeOption(selections)
    }

    return (
        <>
            <Card className="max-w-5xl mx-auto ">
                <CardHeader className="bg-sky-100 dark:bg-sky-900">
                    <CardTitle>
                        Main Services
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <>
                        <Label htmlFor="servicesList" className="text-sm font-bold flex items-center gap-2">
                            Select the service you want
                            <span className="text-destructive">*</span>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 inline ml-2 text-gray-500 cursor-pointer" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-md text-sm">
                                    For items, you must be able to deposit an average balance of HKD1,000,000 or more within 6 months. If the deposit balance is lower than that, an account maintenance fee of approximately HKD900 per 3 months will be deducted from the balance. If there is no balance to deduct, the account will be closed.
                                </TooltipContent>
                            </Tooltip>
                        </Label>
                        <MultiSelect
                            options={serviceList}
                            placeholder="Select Service."
                            selectedItems={selectedService}
                            onSelectionChange={handleServiceChange}
                        />
                    </>

                    <>
                        <Label htmlFor="servicesList" className="text-sm font-bold flex items-center gap-2">
                            Purpose of opening a personal account
                            <span className="text-destructive">*</span>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 inline ml-2 text-gray-500 cursor-pointer" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-md text-sm">
                                The service is not available for illegal purposes such as concealment, flight, laundering, or tax evasion of funds, and is also not available for depositing funds of unclear origin or funds generated from illegal activities.
                                </TooltipContent>
                            </Tooltip>
                        </Label>
                        <MultiSelect
                            options={sList}
                            placeholder="Select Service."
                            selectedItems={selectPurpose}
                            onSelectionChange={handlePurposeChange}
                        />
                    </>
                </CardContent>
            </Card>
        </>
    )
}

export default MainServices